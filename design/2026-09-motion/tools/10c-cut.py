# 10c · cut the OP's hero objects out of Fred's own art, and trace the bird for the close-up.
#   uv run --with pillow --with numpy --with scipy --with scikit-image design/2026-09-motion/tools/10c-cut.py
# Outputs (design/2026-09-motion/assets-gen/):
#   10c-laptop.webp 10c-mug.webp   cleaned cut-outs from desk-scene2-light.png (native px)
#   10c-camera.webp                camera-light.png at 640 px with its open top band filled with paper
#   10c-me.webp                    portrait frames 0 + 3 (neutral, surprised), stipple removed, 75 %
#   10c-book.webp                  book-flip frames 1-3 (page lifting, upright, falling), 75 %
#   10c-geo.json                   each cut-out's box in desk-image px (for exact overlays)
#   10c-bird.json                  the bird (frame 0) as a centre-line path + dot eye
import json, os
import numpy as np
from PIL import Image
from scipy import ndimage
from skimage import measure

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
A = os.path.join(ROOT, 'assets')
OUT = os.path.join(ROOT, 'working', 'redesign', 'assets-gen')
PAPER = (251, 247, 238)

def save(img, name):
    # WebP with alpha: the OP shows these for 83-250 ms and the eyecatch at ~1.4x, so q86 is invisible.
    img.save(os.path.join(OUT, '10c-%s.webp' % name), 'WEBP', quality=86, alpha_quality=95, method=6)

def runs(m, axis):
    """Length of the run of True that each pixel sits in, along `axis`."""
    m = m if axis == 1 else m.T
    out = np.zeros(m.shape, int)
    for r in range(m.shape[0]):
        row = m[r]; i = 0
        while i < len(row):
            if row[i]:
                j = i
                while j < len(row) and row[j]: j += 1
                out[r, i:j] = j - i; i = j
            else: i += 1
    return out if axis == 1 else out.T

def cut_from_desk(desk, name, box, pad=3):
    """Keep every opaque component fully inside `box` (the object + its stipple contact marks).
    The table's back edge runs behind the laptop and the plant pot, so thin long horizontal
    strokes (<=5 px tall, >=40 px long) are removed first; whatever still touches the box edge
    is table line and is dropped."""
    x0, y0, x1, y1 = box
    sub = desk[y0:y1, x0:x1].copy()
    mask = sub[..., 3] > 6
    mask &= ~((runs(mask, 0) <= 5) & (runs(mask, 1) >= 40))
    lab, n = ndimage.label(mask, structure=np.ones((3, 3)))
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    keep = np.isin(lab, [i for i in range(1, n + 1) if i not in edge])
    sub[~keep] = 0
    ys, xs = np.where(keep)
    bx0, by0 = max(xs.min() - pad, 0), max(ys.min() - pad, 0)
    bx1, by1 = min(xs.max() + pad + 1, sub.shape[1]), min(ys.max() + pad + 1, sub.shape[0])
    crop = sub[by0:by1, bx0:bx1]
    save(Image.fromarray(crop.astype(np.uint8), 'RGBA'), name)
    return {'x': int(x0 + bx0), 'y': int(y0 + by0), 'w': int(bx1 - bx0), 'h': int(by1 - by0)}

def camera():
    im = np.array(Image.open(os.path.join(A, 'camera-light.png')).convert('RGBA'))
    clear = im[..., 3] < 40
    # The outline has hairline gaps, so seal it first (grow the ink 5 px), flood the outside from the frame
    # edge, and call every clear pixel the flood can't reach "inside the camera".
    sealed = ndimage.binary_dilation(~clear, iterations=5)
    lab, n = ndimage.label(~sealed)
    outside = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    inside = ndimage.binary_dilation(~sealed & ~np.isin(lab, list(outside)), iterations=6)
    hole = inside & (im[..., 3] < 250)
    im[hole, :3] = PAPER
    im[hole, 3] = 255
    img = Image.fromarray(im, 'RGBA')
    save(img.resize((640, round(640 * img.height / img.width)), Image.LANCZOS), 'camera')

def portrait():
    """Frames 0 (neutral) and 3 (surprised) of frame-exp3-light, stipple dropped: on the desk the contact
    dots vanish into cream, but on a coral field they read as pixel noise. Keep the frame + easel only."""
    im = np.array(Image.open(os.path.join(A, 'frame-exp3-light.png')).convert('RGBA'))
    fw = im.shape[1] // 4
    out = []
    for i in (0, 3):
        fr = im[:, i * fw:(i + 1) * fw].copy()
        # Stipple touches the base, so connectivity alone keeps it: open away everything thinner than
        # ~7 px (dots, dot bridges), keep the largest solid body, then grow back the outline it ate.
        solid = ndimage.binary_opening(fr[..., 3] > 20, structure=np.ones((7, 7)))
        lab, n = ndimage.label(solid)
        keep = ndimage.binary_fill_holes(lab == np.argmax(np.bincount(lab.ravel())[1:]) + 1)
        keep = ndimage.binary_dilation(keep, iterations=4) & (fr[..., 3] > 0)
        fr[~keep] = 0
        out.append(fr)
    ys, xs = np.where((out[0][..., 3] > 0) | (out[1][..., 3] > 0))       # one tight box shared by both frames
    y0, y1, x0, x1 = max(ys.min() - 3, 0), ys.max() + 4, max(xs.min() - 3, 0), xs.max() + 4
    img = Image.fromarray(np.concatenate([o[y0:y1, x0:x1] for o in out], 1), 'RGBA')
    save(img.resize((img.width * 3 // 4, img.height * 3 // 4), Image.LANCZOS), 'me')

def book():
    """Frames 1-3 of book-flip2-light (the page lifting, upright, falling) for the OP's three held poses, so the
    OP never waits on the 1 MB strip the desk needs."""
    im = Image.open(os.path.join(A, 'book-flip2-light.png')).convert('RGBA')
    fw = im.width // 6
    strip = im.crop((fw, 0, fw * 4, im.height))
    save(strip.resize((strip.width * 3 // 4, strip.height * 3 // 4), Image.LANCZOS), 'book')

def bird():
    im = np.array(Image.open(os.path.join(A, 'bird-strip6-light.png')).convert('RGBA'))[:, :308]
    a = im[..., 3] > 128
    lum = im[..., :3].astype(int).sum(-1) / 3
    ink = a & (lum < 150)
    # Drop the ground stroke: the widest near-horizontal run at the bottom of the frame.
    rows = np.where(a.any(1))[0]
    body = a.copy()
    body[rows.max() - 9:, :] = False
    body = ndimage.binary_fill_holes(body)
    lab, n = ndimage.label(body)
    body = lab == (np.argmax(np.bincount(lab.ravel())[1:]) + 1)
    ys, xs = np.where(body)
    # Pen width: twice the typical inset of ink from the silhouette edge.
    dt = ndimage.distance_transform_edt(body)
    t = float(np.median(dt[ink & body & (dt > 0)])) * 2
    mid = measure.find_contours(dt, t / 2)
    mid = max(mid, key=len)
    poly = measure.approximate_polygon(mid, tolerance=.6)
    pts = [[round(float(p[1]), 1), round(float(p[0]), 1)] for p in poly]
    inner = body & (dt > t * 1.3) & (lum < 150)
    ey, ex = np.where(inner)
    eye = {'x': round(float(ex.mean()), 1), 'y': round(float(ey.mean()), 1), 'r': round(float(np.sqrt(len(ex) / np.pi)), 1)}
    fill = im[body & (dt > t * 1.5) & ~inner][..., :3].mean(0)
    line = im[ink & (dt < t)][..., :3].mean(0)
    hexc = lambda c: '#%02X%02X%02X' % tuple(int(v) for v in c)
    return {'w': 308, 'h': 317, 'pen': round(t, 1), 'pts': pts, 'eye': eye, 'fill': hexc(fill), 'line': hexc(line),
            'box': [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())]}

if __name__ == '__main__':
    desk = np.array(Image.open(os.path.join(A, 'desk-scene2-light.png')).convert('RGBA'))
    geo = {
        'laptop': cut_from_desk(desk, 'laptop', (270, 245, 760, 610)),
        'mug': cut_from_desk(desk, 'mug', (330, 606, 530, 780)),   # top at 606: below the laptop's contact stipple
        'desk': {'w': int(desk.shape[1]), 'h': int(desk.shape[0])},
    }
    camera()
    portrait()
    book()
    json.dump(geo, open(os.path.join(OUT, '10c-geo.json'), 'w'), indent=1)
    b = bird()
    json.dump(b, open(os.path.join(OUT, '10c-bird.json'), 'w'))
    print(json.dumps(geo), '\nbird pen', b['pen'], 'pts', len(b['pts']), 'eye', b['eye'], b['fill'], b['line'], b['box'])
