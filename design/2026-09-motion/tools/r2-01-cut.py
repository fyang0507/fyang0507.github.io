"""Split the home desk into the layers board r2-01 animates independently.

    uv run --with pillow --with numpy --with scipy python design/2026-09-motion/tools/r2-01-cut.py

The desk is one raster (assets/desk-scene2-light.png). "The desk becomes the nav" needs its parts to
move separately, so this writes regenerable cutouts into design/2026-09-motion/ (the masters are untouched):

  r2-01-cut-table.png   the table alone: top, front face, apron, legs; objects removed, front edge removed
                        (the front edge is redrawn as a vector so it can straighten into the nav rule)
  r2-01-cut-laptop.png  r2-01-cut-camera.png  r2-01-cut-mug.png  r2-01-cut-plant.png
                        each object's silhouette (outline + paper fill); contact tone stays on the table
  r2-01-mask-frame.png  the portrait frame's silhouette, used as a CSS mask on the 4-frame expression strip
  r2-01-frame-rest.png  what the frame sprite carries that is not the frame (its contact stipple, a stub of
                        the table's back edge) so it stays on the table when the frame lifts off
  r2-01-hole-*.png      candidate B: the same objects with the surface that becomes a window cut out
                        (laptop screen, camera lens, book spread, frame picture)
It prints the crop boxes and the traced front edge that r2-01-desk.js hard-codes.
"""
import json
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / 'design/2026-09-motion'
desk = np.array(Image.open(ROOT / 'assets/desk-scene2-light.png').convert('RGBA'))
A = desk[:, :, 3].astype(np.int32)
H, W = A.shape

def disk(r):
    y, x = np.ogrid[-r:r + 1, -r:r + 1]
    return x * x + y * y <= r * r

def silhouette(alpha, box, open_r=3, grow=6, min_area=400):
    """Solid object blobs inside box: fill holes, open away thin strokes (hatch, table lines), then grow
    back a few pixels inside the original alpha so the outline and thin tips return."""
    x, y, w, h = box
    sub = alpha[y:y + h, x:x + w] > 110
    filled = ndi.binary_fill_holes(sub)
    core = ndi.binary_opening(filled, structure=disk(open_r))
    lab, n = ndi.label(core)
    keep = np.zeros_like(core)
    for i in range(1, n + 1):
        comp = lab == i
        if comp.sum() >= min_area:
            keep |= comp
    anyink = alpha[y:y + h, x:x + w] > 0
    m = keep
    for _ in range(grow):                      # geodesic growth: recovers outlines/tips, not whole table lines
        m = ndi.binary_dilation(m) & anyink
    m = ndi.binary_fill_holes(m)
    full = np.zeros((alpha.shape[0], alpha.shape[1]), bool)
    full[y:y + h, x:x + w] = m
    return full

def save_crop(rgba, mask, box, name):
    x, y, w, h = box
    out = rgba.copy()
    out[:, :, 3] = np.where(mask, out[:, :, 3], 0)
    out[out[:, :, 3] == 0] = 0
    Image.fromarray(out[y:y + h, x:x + w].astype(np.uint8)).save(OUT / name, optimize=True)

def poly_mask(shape, pts):
    im = Image.new('L', (shape[1], shape[0]), 0)
    ImageDraw.Draw(im).polygon([tuple(p) for p in pts], fill=255)
    return np.array(im) > 0

BOXES = {                                     # generous boxes in scene pixels (x, y, w, h)
    'laptop': (276, 255, 470, 346),
    'camera': (985, 684, 268, 190),
    'mug': (350, 606, 162, 154),
    'plant': (1068, 244, 304, 322),
}
EDGE_ROWS = (909, 915)                        # the tabletop's front edge (rows 912–913 are the stroke)

masks = {}
for k, b in BOXES.items():
    m = silhouette(A, b)
    # the table's back edge (y≈472) runs behind the laptop lid and the plant pot: keep only the part the
    # object's own paper covers, never stubs of the line itself
    band = np.zeros_like(m); band[466:478, :] = True
    solid = ndi.binary_erosion(m, structure=disk(3))
    m &= ~(band & ~ndi.binary_dilation(solid, structure=disk(2)))
    masks[k] = m

# the plant's leaves hang over empty paper, where every inked pixel is plant (thin stems and tips included)
px, py, pw, ph = BOXES['plant']
air = np.zeros((H, W), bool); air[py:465, px:px + pw] = A[py:465, px:px + pw] > 0
masks['plant'] |= air

report = {}
for k, m in masks.items():
    ys, xs = np.where(m)
    box = (int(xs.min()), int(ys.min()), int(xs.max() - xs.min() + 1), int(ys.max() - ys.min() + 1))
    save_crop(desk, m, box, f'r2-01-cut-{k}.png')
    report[k] = box

# the table: everything else, minus the front-edge stroke
table = desk.copy()
objs = np.zeros((H, W), bool)
for m in masks.values():
    objs |= m
table[:, :, 3] = np.where(objs, 0, table[:, :, 3])
table[EDGE_ROWS[0]:EDGE_ROWS[1], :, 3] = np.where(
    desk[EDGE_ROWS[0]:EDGE_ROWS[1], :, :3].mean(axis=2) < 200, 0, table[EDGE_ROWS[0]:EDGE_ROWS[1], :, 3])
# the back edge (y≈472) was never drawn behind the laptop lid or the plant; once they lift off it must be
# continuous, so the gaps are filled with a clean column of the same line
ref = table[464:480, 760:761].copy()
for x0, x1 in ((320, 720), (1136, 1268)):
    gap = table[464:480, x0:x1]
    fill = np.repeat(ref, x1 - x0, axis=1)
    table[464:480, x0:x1] = np.where(gap[:, :, 3:4] > fill[:, :, 3:4], gap, fill)
table[table[:, :, 3] == 0] = 0
ys, xs = np.where(table[:, :, 3] > 0)
tbox = (0, int(ys.min()), W, int(H - ys.min()))
Image.fromarray(table[tbox[1]:, :].astype(np.uint8)).save(OUT / 'r2-01-cut-table.png', optimize=True)
report['table'] = tbox

# trace the front edge: darkness-weighted centre row per column, sampled every 24px
dark = (255 - desk[905:920, :, :3].mean(axis=2)) * (desk[905:920, :, 3] / 255.0)
dark[dark < 60] = 0
rows = np.arange(905, 920)[:, None]
cy = (dark * rows).sum(axis=0) / np.maximum(dark.sum(axis=0), 1)
edge = [[int(x), round(float(np.median(cy[max(0, x - 6):x + 7][dark[:, max(0, x - 6):x + 7].sum(axis=0) > 0])), 2)]
        for x in list(range(0, W, 48)) + [W - 1]]
report['edge'] = edge
core = desk[912:914, 200:1400]
report['edge_rgb'] = [int(v) for v in core[:, :, :3].reshape(-1, 3).mean(axis=0)]

# the frame sprite (4 expressions, 616x577 each): silhouette of frame 0 as a mask; the rest stays on the table
fr = np.array(Image.open(ROOT / 'assets/frame-exp3-light.png').convert('RGBA'))[:, :616]
fm = silhouette(fr[:, :, 3].astype(np.int32), (0, 0, 616, 577), open_r=4, grow=5, min_area=4000)
fm &= poly_mask((577, 616), [(0, 0), (616, 0), (616, 462), (528, 466), (470, 526), (80, 498), (0, 498)])  # not its contact stipple
fm[326:341, 499:] = False                                                  # nor the table edge poking past the easel
Image.fromarray(np.where(fm, 255, 0).astype(np.uint8)).convert('L').save(OUT / 'r2-01-mask-frame.png', optimize=True)
rest = fr.copy(); rest[:, :, 3] = np.where(fm, 0, rest[:, :, 3]); rest[rest[:, :, 3] == 0] = 0
Image.fromarray(rest).save(OUT / 'r2-01-frame-rest.png', optimize=True)

# candidate B: windows. Surfaces in each asset's own pixels (scene px for laptop/camera, sprite px for book/frame)
lap = report['laptop']; cam = report['camera']
screen = poly_mask((H, W), [(341, 278), (699, 278), (699, 483), (341, 483)])
save_crop(desk, masks['laptop'] & ~screen, lap, 'r2-01-hole-laptop.png')
yy, xx = np.ogrid[:H, :W]
lens = (xx - 1120) ** 2 + (yy - 811) ** 2 <= 30 ** 2
save_crop(desk, masks['camera'] & ~lens, cam, 'r2-01-hole-camera.png')
bk = np.array(Image.open(ROOT / 'assets/book-flip2-light.png').convert('RGBA'))[:, :462]
spread = poly_mask(bk.shape, [(58, 133), (232, 127), (408, 136), (425, 316), (232, 334), (40, 318)])
bk2 = bk.copy(); bk2[:, :, 3] = np.where(spread, 0, bk2[:, :, 3]); bk2[bk2[:, :, 3] == 0] = 0
Image.fromarray(bk2).save(OUT / 'r2-01-hole-book.png', optimize=True)
pic = poly_mask((577, 616), [(152, 50), (466, 62), (440, 472), (122, 457)])
Image.fromarray(np.where(fm & ~pic, 255, 0).astype(np.uint8)).convert('L').save(OUT / 'r2-01-mask-frame-hole.png', optimize=True)

print(json.dumps(report))
