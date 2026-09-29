# 10d · cut the desk art into falling objects without shipping a second copy of it.
# Run: uv run --with pillow --with numpy --with scipy python design/2026-09-motion/tools/10d-cut.py
#
# Instead of exporting an "empty desk" plate plus cut-out PNGs (≈ +900 KB of duplicated pixels),
# the opener draws every layer from the one desk-scene2-light.png the home page already needs,
# each through a binary alpha mask. The masks partition the drawing:
#   10d-mask-obj.png   laptop · mug · camera · plant (minus its tall leaf)
#   10d-mask-aux.png   the contact stipple under each object + the plant's tall leaf
#   10d-mask-plate.png everything else: the empty desk
# Binary masks whose edges sit in transparent margins recombine to exactly the original at rest.
# 10d-edge.png restores the table's back edge where the laptop screen and plant pot hid it, by
# repeating real columns of that pen line (same weight, same tone) across the gap.
# Prints the geometry (image px) that 10-opener-d-geo.js holds.
import json, os
import numpy as np
from PIL import Image
from scipy import ndimage as nd

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
OUT = os.path.join(ROOT, 'working', 'redesign', 'assets-gen')
os.makedirs(OUT, exist_ok=True)
src = np.array(Image.open(os.path.join(ROOT, 'assets', 'desk-scene2-light.png')).convert('RGBA'))
H, W = src.shape[:2]
al = src[..., 3].astype(int)
yy, xx = np.mgrid[0:H, 0:W]

EDGE = (468, 476)                 # rows of the table's back-edge pen line (measured: 471–472 + halo)
ink = al > 40
# The back edge touches the laptop screen and the plant pot; cut it wherever it runs alone
# (paper above and below), so each object is its own connected component.
alone = (al[462] < 40) & (al[481] < 40)
ink[EDGE[0] - 2:EDGE[1] + 2, alone] = False
lab, _ = nd.label(ink)

SEEDS = {'laptop': (400, 520), 'mug': (690, 420), 'camera': (780, 1100), 'plant': (500, 1200)}
disk = lambda r: (np.hypot(*np.mgrid[-r:r + 1, -r:r + 1]) <= r)
obj, ring = {}, {}
for k, (sy, sx) in SEEDS.items():
    m = nd.binary_fill_holes(lab == lab[sy, sx])
    m = nd.binary_opening(m, disk(1))            # drop single stipple dots stuck to the outline
    m = nd.binary_fill_holes(m | (nd.binary_dilation(m, disk(1)) & ink))
    d = nd.binary_dilation(m, disk(3))           # carry the antialiased halo with the object
    d[EDGE[0]:EDGE[1]] &= m[EDGE[0]:EDGE[1]]     # …but never stubs of the table line
    obj[k], ring[k] = m, d

# Contact stipple: faint dots in the lower half around each object (tone marks contact).
tone = {}
rings = ring['laptop'] | ring['mug'] | ring['camera'] | ring['plant']
for k, m in obj.items():
    ys = np.where(m.any(1))[0]; top, bot = ys.min(), ys.max()
    near = nd.binary_dilation(m, disk(42)) & (yy > top + (bot - top) * .55) & ~rings
    near[EDGE[0] - 3:EDGE[1] + 3] = False
    near[yy > 900] = False                       # the tabletop's front edge
    dots = near & (al > 6)
    t = nd.binary_dilation(dots, disk(2)) & ~rings
    t[EDGE[0] - 3:EDGE[1] + 3] = False
    tone[k] = t

# The plant's tall centre leaf (its ahoge) wobbles on its own; cut above the narrow stem.
LEAF_BOX = (1160, 244, 1216, 335)                # x0, y0, x1, y1 (image px)
LEAF_PIVOT = (1204, 336)
lb = (xx >= LEAF_BOX[0]) & (xx < LEAF_BOX[2]) & (yy >= LEAF_BOX[1]) & (yy < LEAF_BOX[3])
leaf_lab, _ = nd.label(ring['plant'] & lb)
leaf = leaf_lab == leaf_lab[290, 1185]          # only the tall leaf, not tips of its neighbours
leaf_overlap = ring['plant'] & nd.binary_dilation(leaf, disk(3)) & (xx >= LEAF_BOX[0]) & (xx < LEAF_BOX[2]) & (yy >= LEAF_BOX[3]) & (yy < LEAF_BOX[3] + 2)
plant_rest = ring['plant'] & ~leaf

A = ring['laptop'] | ring['mug'] | ring['camera'] | plant_rest
B = tone['laptop'] | tone['mug'] | tone['camera'] | tone['plant'] | leaf | leaf_overlap
P = ~(A | B)

def save_mask(m, name):
    a = np.zeros((H, W, 2), np.uint8); a[..., 1] = m * 255
    Image.fromarray(a, 'LA').save(os.path.join(OUT, name), optimize=True)
save_mask(A, '10d-mask-obj.png')
save_mask(B, '10d-mask-aux.png')
save_mask(P, '10d-mask-plate.png')

# Back-edge restoration: repeat real columns of the line from just outside each gap.
edge = np.zeros_like(src)
r0, r1 = EDGE[0] - 1, EDGE[1] + 1
for k in ('laptop', 'plant'):
    cols = np.where(ring[k][471])[0]
    x0, x1 = cols.min(), cols.max()
    ref = list(range(x0 - 60, x0 - 4)) + (list(range(x1 + 5, x1 + 61)) if k == 'laptop' else [])
    for i, x in enumerate(range(x0, x1 + 1)):
        rx = ref[(i * 7) % len(ref)]
        for y in range(r0, r1):
            if ring[k][y, x]: edge[y, x] = src[y, rx]
Image.fromarray(edge, 'RGBA').save(os.path.join(OUT, '10d-edge.png'), optimize=True)

def bbox(m, pad=0):
    ys, xs = np.where(m)
    return [int(xs.min()) - pad, int(ys.min()) - pad, int(xs.max() - xs.min() + 1) + 2 * pad, int(ys.max() - ys.min() + 1) + 2 * pad]

geo = {'W': W, 'H': H, 'obj': {}, 'tone': {}}
for k in SEEDS:
    m = plant_rest if k == 'plant' else ring[k]
    b = bbox(m, 1)
    ys = np.where(obj[k].any(1))[0]
    geo['obj'][k] = {'box': b, 'foot': int(ys.max())}
    geo['tone'][k] = bbox(tone[k], 1) if tone[k].any() else None
geo['leaf'] = {'box': bbox(leaf | leaf_overlap, 1), 'pivot': list(LEAF_PIVOT)}
print(json.dumps(geo))

# Self-check: masked layers recomposed over paper must equal the original over paper.
def over(layers):
    out = np.zeros((H, W, 3)); out[:] = (251, 246, 236)
    for m in layers:
        a = (src[..., 3] / 255.0 * m)[..., None]
        out = out * (1 - a) + src[..., :3] * a
    return out
full = over([np.ones((H, W))])
rec = over([P.astype(float), B.astype(float) * ~leaf_overlap, A.astype(float)])
print('max recomposition error', float(np.abs(full - rec).max()))
emp = over([P.astype(float)])
ea = (edge[..., 3] / 255.0)[..., None]
emp = emp * (1 - ea) + edge[..., :3] * ea
Image.fromarray(emp.astype(np.uint8)).save('/tmp/fy10d/empty-desk.png')
