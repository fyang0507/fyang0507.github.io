# 10b · Ink bloom — precomputes the ink's arrival map for the desk drawing.
#
#   uv run --with pillow --with numpy --with scipy design/2026-09-motion/tools/10b-arrival.py [--preview]
#
# Output: design/2026-09-motion/assets-gen/10b-arrival.webp (lossless), an RGB map covering the desk image plus a
# MARGIN on every side, at 1/SCALE of the image's resolution.
#   R,G  arrival time of the ink, 12 bits in 16: T = (R*256+G)/65504 * TMAX seconds (65535 = never).
#        8 bits terraced visibly near a drop, where the Washburn front is fastest.
#   B    wash depth: 0 = outside every bloom, else 1 + 254 * depth, where depth falls to 0 at the
#        bloom's rim and along seams where two blooms meet (each bloom keeps its own edge).
# Two physical fronts are baked in:
#   * each drop blooms through the paper with Washburn's law (radius ~ sqrt(time)) over a fibre-
#     noisy, slightly anisotropic metric, and stops when its ink runs out (finite radius);
#   * the ink then wicks along the drawn lines much faster than across bare paper, so the table
#     edges and legs are "drawn" by ink running out of the blooms (ink carries the line art).
# Also writes assets-gen/10b-desk.webp: the landing desk pre-composited (scene + book frame 0 +
# portrait frame 0 + bird frame 0) so the opener never waits on the site's 3.7 MB of sprite strips.
# SEEDS must match 10-opener-b.js (DROPS).
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage as nd
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import dijkstra

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / 'design/2026-09-motion/assets-gen'
A = ROOT / 'assets'
IW, IH = 1448, 1086
SCALE = 4            # image px per map texel
MARGIN = 160         # image px of spill room around the image
TMAX = 2.4           # seconds encoded by R = 254
ANISO = 0.86         # paper grain: horizontal travel costs 14% less (machine direction)

# x, y (image px), landing time (s), radius (image px), spread duration (s)
SEEDS = [
    (508, 452, 0.14, 300, 0.95),   # laptop (lower screen: the bloom takes the mug, not the sky)
    (1122, 772, 0.52, 235, 0.80),  # camera
    (676, 792, 0.74, 228, 0.72),   # book
    (968, 546, 0.90, 262, 0.66),   # portrait (on the frame's foot, never on the face)
]
V_LINE = 1100.0      # image px / s along a solid drawn line (the table: edges, legs, apron)
V_PAPER = 55.0       # image px / s across bare paper outside the blooms
# Inside an object the ink wicks slowly, so each object is born from its own drop, not from a
# line that happens to touch it. The plant is the exception: its stems draw it, up and out.
OBJECTS = [  # x0, y0, x1, y1 (image px), line speed
    (280, 258, 745, 592, 240), (352, 608, 508, 758, 240), (792, 352, 1032, 575, 200),
    (515, 662, 838, 910, 240), (986, 684, 1254, 872, 240), (196, 726, 310, 842, 300),
    (1066, 242, 1368, 568, 520),
]


def composite():
    """The desk as the landing page shows it: scene + book frame 0 + portrait frame 0 + bird frame 0."""
    base = Image.open(A / 'desk-scene2-light.png').convert('RGBA')
    def paste(path, frames, left, top, width, aspect):
        # exact CSS geometry (percent of the desk), sub-pixel: resample the frame onto the scene grid
        strip = Image.open(A / path).convert('RGBA')
        fw = strip.width // frames
        f0 = strip.crop((0, 0, fw, strip.height))
        x, y, w = IW * left, IH * top, IW * width
        h = w * aspect
        big = f0.resize((round(w * 4), round(h * 4)), Image.LANCZOS)           # premultiply-safe supersample
        layer = big.transform((IW, IH), Image.AFFINE, (big.width / w, 0, -x * big.width / w, 0, big.height / h, -y * big.height / h), Image.BICUBIC)
        base.alpha_composite(layer)
    paste('book-flip2-light.png', 6, .3604, .615, .2134, 355 / 462)
    paste('frame-exp3-light.png', 4, .5523, .3303, .1554, 577 / 616)
    paste('bird-strip6-light.png', 6, .14, .675, .07, 317 / 308)
    return np.asarray(base).astype(np.float32) / 255.0


def fbm(shape, cell, octaves, rng):
    out = np.zeros(shape, np.float32)
    amp, total = 1.0, 0.0
    for o in range(octaves):
        c = max(1.0, cell / (2 ** o))
        small = rng.random((int(shape[0] / c) + 3, int(shape[1] / c) + 3)).astype(np.float32)
        big = nd.zoom(small, c, order=3)[:shape[0], :shape[1]]
        out += amp * big
        total += amp
        amp *= 0.5
    out /= total
    return (out - out.mean()) / (out.std() + 1e-6)


def fibres(shape, rng):
    """A paper-fibre network: short anisotropic streaks at a few angles, machine direction favoured."""
    acc = np.zeros(shape, np.float32)
    for ang, w in ((0, 1.0), (35, .55), (-35, .55), (80, .35)):
        n = rng.random(shape).astype(np.float32)
        n = nd.rotate(n, ang, reshape=False, mode='wrap', order=1)
        n = nd.gaussian_filter(n, sigma=(0.55, 2.6))
        n = nd.rotate(n, -ang, reshape=False, mode='wrap', order=1)
        n = (n - n.mean()) / (n.std() + 1e-6)
        acc = np.maximum(acc, w * n)
    return (acc - acc.mean()) / (acc.std() + 1e-6)


def grid_graph(weight_fn, H, W):
    """16-neighbour grid graph (knight moves keep blooms round instead of octagonal)."""
    idx = np.arange(H * W).reshape(H, W)
    rows, cols, vals = [], [], []
    for dy, dx in ((0, 1), (1, 0), (1, 1), (1, -1), (1, 2), (2, 1), (1, -2), (2, -1)):
        y0, y1 = max(0, -dy), H - max(0, dy)
        x0, x1 = max(0, -dx), W - max(0, dx)
        a = idx[y0:y1, x0:x1].ravel()
        b = idx[y0 + dy:y1 + dy, x0 + dx:x1 + dx].ravel()
        length = SCALE * np.hypot(dy, dx * ANISO)
        w = weight_fn(a, b) * length
        rows += [a, b]; cols += [b, a]; vals += [w, w]
    rows = np.concatenate(rows); cols = np.concatenate(cols); vals = np.concatenate(vals)
    return rows, cols, vals


def main():
    rng = np.random.default_rng(7)
    img = composite()
    OUT.mkdir(parents=True, exist_ok=True)
    Image.fromarray((img * 255).round().astype(np.uint8), 'RGBA').save(OUT / '10b-desk.webp', quality=85, method=6, alpha_quality=100)
    H = (IH + 2 * MARGIN) // SCALE
    W = (IW + 2 * MARGIN) // SCALE

    # Ink darkness of the drawing, max-pooled onto the map grid (thin lines survive as channels).
    lum = img[..., :3] @ np.array([.299, .587, .114], np.float32)
    dark = np.clip(img[..., 3] * (0.84 - lum) / 0.45, 0, 1)      # faint fill texture is not a line
    pad = np.zeros((IH + 2 * MARGIN, IW + 2 * MARGIN), np.float32)
    pad[MARGIN:MARGIN + IH, MARGIN:MARGIN + IW] = dark
    line = pad[:H * SCALE, :W * SCALE].reshape(H, SCALE, W, SCALE).max(axis=(1, 3))
    line = np.clip(line * 1.6, 0, 1)

    # Paper: lobes (low-frequency) and fibres (high-frequency) make the metric uneven.
    lobes = fbm((H, W), 34, 3, rng)
    fib = fibres((H, W), rng)
    paper = np.clip(1.0 + 0.22 * lobes - 0.16 * np.clip(fib, 0, None) + 0.06 * fib, 0.55, 1.6).ravel()

    # Stage A: each drop's bloom (Washburn: d = R * sqrt((t - t0) / D)), finite radius.
    r, c, v = grid_graph(lambda a, b: 0.5 * (paper[a] + paper[b]), H, W)
    G = coo_matrix((v, (r, c)), shape=(H * W, H * W)).tocsr()
    rim_noise = fbm((H, W), 12, 3, rng).ravel()
    T_wash = np.full(H * W, np.inf, np.float32)
    depth = np.zeros(H * W, np.float32)
    label = np.full(H * W, -1, np.int32)
    for i, (sx, sy, t0, R, D) in enumerate(SEEDS):
        node = ((sy + MARGIN) // SCALE) * W + (sx + MARGIN) // SCALE
        d = dijkstra(G, indices=node).astype(np.float32)
        Rn = R * (1 + 0.10 * rim_noise)
        inside = (d < Rn).reshape(H, W)
        comps, _ = nd.label(inside)                       # one connected bloom per drop, no islands
        inside = nd.binary_fill_holes(comps == comps.flat[node]).ravel()
        t = t0 + D * (d / R) ** 2
        better = inside & (t < T_wash)
        T_wash[better] = t[better]
        depth[better] = np.clip(1 - d[better] / Rn[better], 0, 1)
        label[better] = i

    # Stage B: ink wicks out of the blooms, fast along lines, slowly across bare paper.
    vline = np.full((H, W), V_LINE, np.float32)
    for x0, y0, x1, y1, v in OBJECTS:
        vline[(y0 + MARGIN) // SCALE:(y1 + MARGIN) // SCALE, (x0 + MARGIN) // SCALE:(x1 + MARGIN) // SCALE] = v
    vline = nd.gaussian_filter(vline, 2.0)
    speed = V_PAPER + (vline.ravel() - V_PAPER) * line.ravel() ** 0.8
    inv = 1.0 / speed * (paper ** 0.5)
    r, c, v = grid_graph(lambda a, b: 0.5 * (inv[a] + inv[b]), H, W)
    src = np.nonzero(np.isfinite(T_wash))[0]
    S = H * W
    r = np.concatenate([r, np.full(len(src), S)])
    c = np.concatenate([c, src])
    v = np.concatenate([v, T_wash[src] + 1e-4])
    G2 = coo_matrix((v, (r, c)), shape=(S + 1, S + 1)).tocsr()
    T_wick = dijkstra(G2, indices=S)[:S].astype(np.float32)
    T = np.minimum(T_wash, T_wick).reshape(H, W)

    # Seams where two blooms meet become rims of both: depth -> 0 along them, at rim scale.
    lab = label.reshape(H, W)
    seam = np.zeros((H, W), bool)
    for dy, dx in ((0, 1), (1, 0)):
        a = lab[:H - dy, :W - dx]; b = lab[dy:, dx:]
        s = (a >= 0) & (b >= 0) & (a != b)
        seam[:H - dy, :W - dx] |= s
        seam[dy:, dx:] |= s
    seam_d = nd.distance_transform_edt(~seam) * SCALE
    rad = np.array([sd[3] for sd in SEEDS], np.float32)
    dep = depth.reshape(H, W)
    inside = lab >= 0
    dep[inside] = np.minimum(dep[inside], seam_d[inside] / rad[lab[inside]])

    # Bare paper far from any mark and outside every bloom reveals nothing: store "never" there
    # (flat runs compress well). 12-bit precision (0.6 ms) is far below a frame.
    need = inside | nd.binary_dilation(line > 0.02, iterations=3)
    Tq = np.where(np.isfinite(T) & need, np.round(np.clip(T, 0, TMAX) / TMAX * 4094), 4095).astype(np.int64) * 16
    Tq = np.where(Tq >= 4095 * 16, 65535, Tq)
    Bch = np.where(inside, 1 + 254 * dep, 0)
    rgb = np.stack([Tq >> 8, Tq & 255, Bch.round()], -1).clip(0, 255).astype(np.uint8)
    OUT.mkdir(parents=True, exist_ok=True)
    Image.fromarray(rgb, 'RGB').save(OUT / '10b-arrival.webp', lossless=True, quality=100, method=6)

    # Coverage audit: every visible mark of the drawing should be reached before the drying begins.
    marks = line > 0.25
    late = marks & (T > 1.55)
    print(f'map {W}x{H}  marks {marks.sum()}  reached-late {late.sum()}  T(marks) p50 {np.median(T[marks]):.2f} '
          f'p99 {np.percentile(T[marks], 99):.2f} max {T[marks].max():.2f}')
    print('bytes arrival', (OUT / '10b-arrival.webp').stat().st_size, 'desk', (OUT / '10b-desk.webp').stat().st_size)
    if '--preview' in sys.argv:
        prev = np.zeros((H, W * 3), np.uint8)
        prev[:, :W] = rgb[..., 0]; prev[:, W:2 * W] = (np.clip(T, 0, TMAX) / TMAX * 255).astype(np.uint8); prev[:, 2 * W:] = rgb[..., 2]
        Image.fromarray(prev).save('/tmp/fyshot/10b/arrival-preview.png')
        yy, xx = np.nonzero(late)
        if len(yy):
            print('late at image px', list(zip((xx[:12] * SCALE - MARGIN).tolist(), (yy[:12] * SCALE - MARGIN).tolist())))


if __name__ == '__main__':
    main()
