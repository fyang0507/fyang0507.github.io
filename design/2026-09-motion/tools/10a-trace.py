# 10a · centreline vectoriser for opener A ("the desk draws itself").
# Turns the home desk raster (+ the book and portrait overlay sprites, frame 0) into ordered,
# single-pass pen strokes grouped per object, in the desk image's own 1448x1086 space.
#   uv run --with scikit-image --with pillow --with numpy python design/2026-09-motion/tools/10a-trace.py
# Output: assets-gen/10a-strokes.js (window.FY10A).
import json, math, os, gzip
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from skimage.morphology import skeletonize, disk
from skimage.filters import apply_hysteresis_threshold
from skimage.measure import find_contours

HERE = os.path.dirname(os.path.abspath(__file__))
RD = os.path.dirname(HERE)
ROOT = os.path.dirname(os.path.dirname(RD))
A = os.path.join(ROOT, 'assets')
OUT = os.path.join(RD, 'assets-gen')
PAPER = np.array([251, 246, 236.])
W, H = 1448, 1086
OFFS = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]

# Object boxes in desk space (x0, y0, x1, y1), from the scene and index.html hotspot geometry.
BOXES = [('laptop', (282, 252, 742, 596)), ('mug', (345, 604, 515, 762)),
         ('plant', (1062, 244, 1372, 570)), ('camera', (984, 684, 1252, 870))]
BOOK = dict(src='book-flip2-light.png', frames=6, blob=3, edt=4.5, x=.3604 * W, y=.615 * H, w=.2134 * W)
FRAME = dict(src='frame-exp3-light.png', frames=4, blob=3, edt=5.2, x=.5523 * W, y=.3303 * H, w=.1554 * W)


def load(name, frames=1):
    im = Image.open(os.path.join(A, name)).convert('RGBA')
    if frames > 1:
        im = im.crop((0, 0, im.width // frames, im.height))
    a = np.asarray(im).astype(np.float64)
    al = a[..., 3:4] / 255
    c = a[..., :3] * al + PAPER * (1 - al)
    lum = .299 * c[..., 0] + .587 * c[..., 1] + .114 * c[..., 2]
    return c, lum, a[..., 3]


def colour_masks(c, alpha):
    r, g, b = c[..., 0], c[..., 1], c[..., 2]
    coral = (alpha > 90) & (r - g > 45) & (r - b > 45)
    teal = (alpha > 90) & (g - r > 22) & (b - r > 8)
    return coral, teal


# ---------- skeleton graph -> strokes ----------
def graph(skel):
    S = set(zip(*[v.tolist() for v in np.nonzero(skel)]))
    nb = {p: [(p[0] + dy, p[1] + dx) for dy, dx in OFFS if (p[0] + dy, p[1] + dx) in S] for p in S}
    node_px = {p for p in S if len(nb[p]) != 2}
    # cluster adjacent junction pixels into one node
    nid, nodes = {}, []
    for p in node_px:
        if p in nid:
            continue
        stack, comp = [p], []
        nid[p] = len(nodes)
        while stack:
            q = stack.pop(); comp.append(q)
            for n in nb[q]:
                if n in node_px and n not in nid:
                    nid[n] = len(nodes); stack.append(n)
        nodes.append(comp)
    edges, seen, pairs = [], set(), set()
    for p in node_px:
        for q in nb[p]:
            if q in node_px:
                if nid[q] != nid[p]:
                    k = tuple(sorted((p, q)))
                    if k not in pairs:
                        pairs.add(k); edges.append([nid[p], nid[q], [p, q]])
                continue
            if q in seen:
                continue
            path, prev, cur = [p, q], p, q
            seen.add(q)
            while True:
                nxt = [n for n in nb[cur] if n != prev]
                if not nxt:
                    break
                n = nxt[0]
                path.append(n)
                if n in node_px:
                    break
                if n in seen:
                    break
                seen.add(n); prev, cur = cur, n
            end = path[-1]
            edges.append([nid[p], nid[end] if end in node_px else -1, path])
    # pure loops (no node pixel)
    for p in S:
        if p in node_px or p in seen:
            continue
        path, prev, cur = [p], None, p
        seen.add(p)
        while True:
            nxt = [n for n in nb[cur] if n != prev and n not in seen]
            if not nxt:
                break
            prev, cur = cur, nxt[0]; seen.add(cur); path.append(cur)
        path.append(p)
        edges.append([-2, -2, path])
    return nodes, edges


def direction(path, frm_start, k=7):
    pts = path if frm_start else path[::-1]
    a, b = np.array(pts[0], float), np.array(pts[min(k, len(pts) - 1)], float)
    d = b - a
    n = np.hypot(*d)
    return d / n if n else d


def strokes_from(skel, spur=6):
    nodes, edges = graph(skel)
    alive = [True] * len(edges)
    for _ in range(3):  # prune short spurs hanging off junctions
        inc = {}
        for i, e in enumerate(edges):
            if alive[i]:
                for nd in (e[0], e[1]):
                    if nd >= 0:
                        inc[nd] = inc.get(nd, 0) + 1
        for i, e in enumerate(edges):
            if not alive[i] or e[0] < 0 or len(e[2]) >= spur:
                continue
            da, db = inc.get(e[0], 0), (inc.get(e[1], 0) if e[1] >= 0 else 1)
            if (da == 1 and db >= 3) or (db == 1 and da >= 3):
                alive[i] = False
    inc = {}
    for i, e in enumerate(edges):
        if alive[i] and e[0] >= 0:
            inc.setdefault(e[0], []).append((i, 0))
            if e[1] >= 0:
                inc.setdefault(e[1], []).append((i, 1))
    pair = {}
    for nd, ends in inc.items():
        dirs = [direction(edges[i][2], s == 0) for i, s in ends]
        cand = []
        for a in range(len(ends)):
            for b in range(a + 1, len(ends)):
                if ends[a][0] == ends[b][0]:
                    continue
                cand.append((float(np.dot(dirs[a], dirs[b])), a, b))
        cand.sort()
        used = set()
        for dot, a, b in cand:
            if a in used or b in used:
                continue
            if len(ends) > 2 and dot > -math.cos(math.radians(58)):
                continue
            used |= {a, b}
            pair[ends[a]] = ends[b]; pair[ends[b]] = ends[a]
    done, out = [False] * len(edges), []

    def walk(i, s):
        pts = []
        while True:
            done[i] = True
            p = edges[i][2] if s == 0 else edges[i][2][::-1]
            pts.extend(p if not pts else p[1:])
            nxt = pair.get((i, 1 - s))
            if nxt is None or done[nxt[0]]:
                return pts
            i, s = nxt
    for i, e in enumerate(edges):
        if alive[i] and not done[i] and ((i, 0) not in pair or e[0] < 0):
            out.append(walk(i, 0))
    for i, e in enumerate(edges):
        if alive[i] and not done[i] and (i, 1) not in pair:
            out.append(walk(i, 1))
    for i, e in enumerate(edges):
        if alive[i] and not done[i]:
            out.append(walk(i, 0))
    return out


def smooth(pts, k=2):
    p = np.array(pts, float)
    if len(p) < 2 * k + 3:
        return p
    closed = np.hypot(*(p[0] - p[-1])) < 1.5
    q = p.copy()
    for i in range(len(p)):
        if not closed and (i < k or i >= len(p) - k):
            lo, hi = max(0, i - min(i, k)), min(len(p), i + min(len(p) - 1 - i, k) + 1)
            q[i] = p[lo:hi].mean(0)
        else:
            idx = [(i + j) % len(p) for j in range(-k, k + 1)]
            q[i] = p[idx].mean(0)
    if not closed:
        q[0], q[-1] = p[0], p[-1]
    return q


def rdp(p, eps):
    if len(p) < 3:
        return p
    a, b = p[0], p[-1]
    ab = b - a
    n = np.hypot(*ab)
    if n < 1e-9:
        d = np.hypot(*(p - a).T)
    else:
        d = np.abs(ab[0] * (p[:, 1] - a[1]) - ab[1] * (p[:, 0] - a[0])) / n
    i = int(np.argmax(d))
    if d[i] > eps:
        return np.vstack([rdp(p[:i + 1], eps)[:-1], rdp(p[i:], eps)])
    return np.vstack([a, b])


def vectorise(lum, ink, sx=1., ox=0., oy=0., spur=6, eps=.6, minlen=4., rgb=None):
    skel = skeletonize(ink)
    dist = ndi.distance_transform_edt(ink)
    res = []
    for pix in strokes_from(skel, spur):
        ys, xs = zip(*pix)
        w = float(np.median(2 * dist[ys, xs])) - .4
        v = float(np.percentile(lum[ys, xs], 35))
        p = np.array([(x + .5, y + .5) for y, x in pix])
        p = rdp(smooth(p), eps)
        L = float(np.sum(np.hypot(*np.diff(p, axis=0).T))) if len(p) > 1 else 0.
        if L < minlen and w < 3.2:
            continue
        col = np.median(rgb[ys, xs], axis=0) if rgb is not None else None
        res.append(dict(p=p * sx + [ox, oy], w=max(w, 1.) * sx, v=v, L=L * sx, c=col))
    return res


def split_blobs(ink, r=2, edt=2.6):
    """Genuinely filled marks (pupils, lens centre, webcam) become polygons; line junctions stay lines."""
    thick = ndi.binary_opening(ink, structure=disk(r))
    dist = ndi.distance_transform_edt(ink)
    lab, n = ndi.label(thick)
    if n:
        peak = ndi.maximum(dist, lab, range(1, n + 1))
        area = ndi.sum(thick, lab, range(1, n + 1))
        thick = np.isin(lab, [i + 1 for i in range(n) if peak[i] >= edt and area[i] >= 3 * r * r])
    blob = ndi.binary_dilation(thick, iterations=1) & ink
    return ink & ~blob, blob


def polys(mask, sx=1., ox=0., oy=0., eps=.6, mina=6):
    out = []
    lab, n = ndi.label(mask)
    for i in range(1, n + 1):
        m = lab == i
        if m.sum() < mina:
            continue
        m = ndi.binary_fill_holes(m)
        cont = max(find_contours(np.pad(m, 1).astype(float), .5), key=len)
        p = rdp(np.array([(x - .5, y - .5) for y, x in cont]), eps)
        out.append(p * sx + [ox, oy])
    return out


def encode_poly(p):
    q = np.round(np.asarray(p) * 2).astype(int)
    flat = [int(q[0, 0]), int(q[0, 1])]
    for a, b in zip(q[:-1], q[1:]):
        if (b - a).any():
            flat += [int(b[0] - a[0]), int(b[1] - a[1])]
    return flat


def ink_mask(lum, extra_off=None, lo=62, hi=118):
    dark = 255 - lum
    m = apply_hysteresis_threshold(dark, lo, hi)
    if extra_off is not None:
        m &= ~extra_off
    return m


# ---------- ordering: long contours first (top-down), then details by pen travel ----------
def order(strokes):
    if not strokes:
        return []
    Lmax = max(s['L'] for s in strokes)
    prim = [s for s in strokes if s['L'] >= max(.22 * Lmax, 60)]
    pid = {id(s) for s in prim}
    rest = [s for s in strokes if id(s) not in pid]
    prim.sort(key=lambda s: (s['p'][:, 1].min() // 40, -s['L']))
    seq, pen = [], None
    for s in prim:
        seq.append(orient(s, pen)); pen = seq[-1]['p'][-1]
    pen = pen if pen is not None else rest[0]['p'][0]
    pool = rest[:]
    while pool:
        dists = [min(np.hypot(*(s['p'][0] - pen)), np.hypot(*(s['p'][-1] - pen))) + .35 * abs(s['p'][:, 1].mean() - pen[1]) for s in pool]
        s = pool.pop(int(np.argmin(dists)))
        seq.append(orient(s, pen)); pen = seq[-1]['p'][-1]
    return seq


def orient(s, pen):
    p = s['p']
    d = p[-1] - p[0]
    natural = d[0] >= 0 if abs(d[0]) > abs(d[1]) * .6 else d[1] >= 0   # L->R, else top->down
    if pen is not None:
        da, db = np.hypot(*(p[0] - pen)), np.hypot(*(p[-1] - pen))
        if abs(da - db) > 40:
            natural = da < db
    if not natural:
        s = dict(s, p=p[::-1])
    return s


def encode(seq):
    out = []
    for s in seq:
        q = np.round(s['p'] * 2).astype(int)
        flat = [int(round(s['w'] * 4)), int(min(3, max(0, (s['v'] - 55) // 38))), int(q[0, 0]), int(q[0, 1])]  # keep in sync with cls()
        for a, b in zip(q[:-1], q[1:]):
            dx, dy = int(b[0] - a[0]), int(b[1] - a[1])
            if dx or dy:
                flat += [dx, dy]
        out.append(flat)
    return out


def resample(p, step=4.):
    # evenly spaced points so box membership is measured by length, not by vertex count
    p = np.asarray(p, float)
    if len(p) < 2:
        return p
    seg = np.hypot(*np.diff(p, axis=0).T)
    cum = np.concatenate([[0], np.cumsum(seg)])
    t = np.arange(0, cum[-1] + 1e-9, step)
    return np.stack([np.interp(t, cum, p[:, 0]), np.interp(t, cum, p[:, 1])], 1)


def assign(strokes, key):
    groups = {k: [] for k, _ in BOXES}
    groups['table'] = []
    for s in strokes:
        p = resample(key(s))
        for k, (x0, y0, x1, y1) in BOXES:
            if np.mean((p[:, 0] >= x0) & (p[:, 0] <= x1) & (p[:, 1] >= y0) & (p[:, 1] <= y1)) >= .6:
                groups[k].append(s); break
        else:
            groups['table'].append(s)
    return groups


def main():
    c, lum, al = load('desk-scene2-light.png')
    coral, teal = colour_masks(c, al)
    coral_zone = ndi.binary_dilation(coral, iterations=3)
    ink = ink_mask(lum, coral_zone | teal, 50, 110)
    thin, blob = split_blobs(ink, 2, 3.2)
    desk = vectorise(lum, thin, rgb=c)
    groups = assign(desk, lambda s: s['p'])
    blobs = assign(polys(blob), lambda p: p)
    groups['table'] = [s for s in groups['table'] if s['L'] >= 14]
    # coral cat on the mug: its own pen, drawn as one event
    cat = vectorise(lum, coral_zone & (ink_mask(lum, None, 20, 45) | coral), minlen=3)
    # teal ghost sticker on the camera: flat stamp polygon + its dark features (eyes, z)
    tl, n = ndi.label(ndi.binary_closing(teal, iterations=2))
    big = max(range(1, n + 1), key=lambda i: (tl == i).sum())
    ghost_m = ndi.binary_fill_holes(tl == big)
    poly = polys(ghost_m, eps=.7)[0]
    gy, gx = np.nonzero(ghost_m)
    gb = (gx.min() - 4, gy.min() - 24, gx.max() + 4, gy.max() + 4)
    inb = lambda p: gb[0] <= p[:, 0].mean() <= gb[2] and gb[1] <= p[:, 1].mean() <= gb[3]
    groups['camera'] = [s for s in groups['camera'] if not (inb(s['p']) and s['L'] < 40)]
    zone = np.zeros_like(teal)
    zone[gb[1]:gb[3], gb[0]:gb[2]] = True
    ghost_feat = vectorise(lum, zone & (lum < 125), minlen=3)
    ghost_blob = [p for p in blobs['camera'] if inb(p)]
    blobs['camera'] = [p for p in blobs['camera'] if not inb(p)]
    fills = {}
    # overlays: book (frame 0) and portrait (frame 0), traced at source resolution
    for key, spec in (('book', BOOK), ('portrait', FRAME)):
        cc, ll, aa = load(spec['src'], spec['frames'])
        sx = spec['w'] / ll.shape[1]
        m = ink_mask(ll, None, 48, 108) & (aa > 60)
        thin, blob = split_blobs(m, spec['blob'], spec['edt'])
        groups[key] = vectorise(ll, thin, sx=sx, ox=spec['x'], oy=spec['y'], spur=8, eps=.7, minlen=5)
        blobs[key] = polys(blob, sx, spec['x'], spec['y'])
        solid = aa > 128
        lab, n = ndi.label(solid)
        keep = max(range(1, n + 1), key=lambda i: (lab == i).sum())
        fills[key] = polys(ndi.binary_closing(lab == keep, iterations=2), sx, spec['x'], spec['y'], eps=1.2)
    names = ['table', 'laptop', 'mug', 'book', 'portrait', 'plant', 'camera']
    data = {'w': W, 'h': H, 'objects': []}
    cls = lambda v: int(min(3, max(0, (v - 55) // 38)))
    hexc = lambda col: '#%02x%02x%02x' % tuple(int(round(x)) for x in col)
    data['pal'] = [hexc(np.median([s['c'] for s in desk if cls(s['v']) == k], axis=0)) for k in range(4)]
    data['coral'] = hexc(np.median(c[coral], axis=0))
    data['teal'] = hexc(np.median(c[ghost_m & teal], axis=0))
    print('palette', data['pal'], data['coral'], data['teal'])
    for k in names:
        seq = order(groups[k])
        o = {'id': k, 's': encode(seq), 'b': [encode_poly(p) for p in blobs.get(k, [])]}
        if k in fills:
            o['f'] = [encode_poly(p) for p in fills[k]]
        data['objects'].append(o)
        ws = [s['w'] for s in seq]
        print(f'{k:9s} w~{np.median(ws):.2f} strokes {len(seq):4d} blobs {len(o["b"]):3d} length {sum(s["L"] for s in seq):8.0f}')
    data['cat'] = encode(order(cat))
    data['ghost'] = {'poly': encode_poly(poly), 'feat': encode(order(ghost_feat)), 'b': [encode_poly(p) for p in ghost_blob]}
    print('cat', len(cat), 'ghost pts', len(poly), 'ghost feat', len(ghost_feat), len(ghost_blob))
    js = '/* generated by tools/10a-trace.py - do not edit. Coords x2, stroke width x4, v = value class. */\nwindow.FY10A=' + json.dumps(data, separators=(',', ':')) + ';\n'
    path = os.path.join(OUT, '10a-strokes.js')
    open(path, 'w').write(js)
    print('size', len(js), 'gz', len(gzip.compress(js.encode())))


if __name__ == '__main__':
    main()
