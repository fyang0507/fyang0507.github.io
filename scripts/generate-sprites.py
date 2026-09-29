#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = ["pillow==12.3.0", "numpy==2.5.3", "scipy==1.18.1"]
# ///
"""Cut the home desk drawing into the layers the opener and the transitions move.

The desk is one raster, assets/desk-scene2-light.png, with the book, portrait
and bird drawn as sprite strips on top. The opener drops its objects onto an
empty table and the view transitions fly them into the nav, so the parts must
move separately. This derives them into assets/derived/; the masters stay
canonical and untouched.

- desk/*.webp: an exact alpha partition of the desk, lossless. Each file is one
  layer cropped to its own box: the plate (the empty table), the front edge,
  laptop, mug, camera, plant, the plant's tall leaf, and each object's contact
  stipple (tone-*).
- desk/frame-rest.webp: what the portrait strip carries besides the frame (its
  contact stipple, a stub of the back edge), resampled onto the desk grid. It
  stays on the table when the frame lifts and appears when the frame lands.
- desk/backedge-*.webp: the table's back edge where the laptop screen and the
  plant pot hid it, rebuilt from real columns of the same pen line. Shown
  while that object is away. Neither overlay is part of the partition.
- strip/<name>-<cell width>.webp: the sprite strips at their master cell width,
  ½ and ¼, so a small sprite never scales a 2,464 px strip down in CSS. The
  portrait strip is masked to the frame's silhouette. Every rung is lossy (with
  exact alpha) and each weighs less than the rung above it.
- op/*.webp: the opener OP's hero cut-outs.
- desk-geo.js: window.FY_DESK, the geometry in desk pixels.

Consolidates design/2026-09-motion/tools/10d-cut.py (the partition),
r2-01-cut.py (front edge, frame silhouette) and 10c-cut.py (OP heroes). It
fails unless the decoded layers recompose the master exactly, and it only
rewrites files whose bytes changed, so a second run reports 0 updated.

    uv run scripts/generate-sprites.py

Commit the output: .github/workflows/deploy-pages.yml deletes scripts/.
"""

from __future__ import annotations

import io
import json
import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as nd

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
OUT = ASSETS / "derived"
PAPER = (251, 247, 238)

BACK_EDGE = (468, 476)   # rows of the table's back-edge pen line (471-472 plus halo)
BACK_ROW = 471
FRONT_EDGE = (909, 916)  # rows of the tabletop's front edge (912-913 is the stroke)
SEEDS = {"plant": (500, 1200), "laptop": (400, 520), "mug": (690, 420), "camera": (780, 1100)}  # (y, x)
LEAF_BOX = (1160, 244, 1216, 335)  # x0, y0, x1, y1: the plant's tall centre leaf wobbles on its own
LEAF_SEED = (290, 1185)
LEAF_PIVOT = (1204, 336)
# Sprites laid over the desk, placed as index.html places them: % of the desk (left, top, width).
PLACED = {"book": (36.04, 61.50, 21.34), "frame": (55.23, 33.03, 15.54), "bird": (14, 67.5, 7)}
STRIPS = {"frame": ("frame-exp3-light.png", 4), "book": ("book-flip2-light.png", 6),
          "bird6": ("bird-strip6-light.png", 6), "bird2": ("bird-strip-light.png", 2)}
STRIP_OBJ = {"frame": "frame", "book": "book", "bird": "bird6"}
# The portrait's frame and easel, above its contact stipple (frame px).
FRAME_KEEP = [(0, 0), (616, 0), (616, 462), (528, 466), (470, 526), (80, 498), (0, 498)]


def load(name: str) -> np.ndarray:
    return np.array(Image.open(ASSETS / name).convert("RGBA"))


def disk(r: int) -> np.ndarray:
    y, x = np.ogrid[-r:r + 1, -r:r + 1]
    return x * x + y * y <= r * r


def within(m: np.ndarray, r: float) -> np.ndarray:
    """binary_dilation(m, disk(r)), without an 85 x 85 structuring element."""
    return nd.distance_transform_edt(~m) <= r


def bbox(m: np.ndarray) -> list[int]:
    ys, xs = np.where(m)
    return [int(xs.min()), int(ys.min()), int(xs.max() - xs.min() + 1), int(ys.max() - ys.min() + 1)]


def poly(shape, pts) -> np.ndarray:
    im = Image.new("L", (shape[1], shape[0]), 0)
    ImageDraw.Draw(im).polygon(pts, fill=255)
    return np.array(im) > 0


def only(rgba: np.ndarray, m: np.ndarray) -> np.ndarray:
    out = np.where(m[..., None], rgba, 0).astype(np.uint8)
    out[out[..., 3] == 0] = 0
    return out


def run_lengths(m: np.ndarray) -> np.ndarray:
    """Length of the horizontal run of True each pixel sits in."""
    out = np.zeros(m.shape, int)
    d = np.diff(np.pad(m.astype(np.int8), ((0, 0), (1, 1))), axis=1)
    for r in range(m.shape[0]):
        for s, e in zip(np.flatnonzero(d[r] == 1), np.flatnonzero(d[r] == -1)):
            out[r, s:e] = e - s
    return out


def partition(desk: np.ndarray) -> tuple[dict[str, np.ndarray], dict]:
    """10d's cut: seed-picked objects, their contact stipple, the leaf; plus the front edge. Disjoint masks."""
    H, W = desk.shape[:2]
    al = desk[..., 3].astype(int)
    yy, xx = np.mgrid[0:H, 0:W]
    e0, e1 = BACK_EDGE
    ink = al > 40
    # The back edge touches the laptop screen and the plant pot; cut it wherever it runs alone
    # (paper above and below), so each object is its own connected component.
    alone = (al[e0 - 6] < 40) & (al[e1 + 5] < 40)
    ink[e0 - 2:e1 + 2, alone] = False
    lab, _ = nd.label(ink)
    solid, ring = {}, {}
    for k, (sy, sx) in SEEDS.items():
        m = nd.binary_fill_holes(lab == lab[sy, sx])
        m = nd.binary_opening(m, disk(1))                    # drop single stipple dots stuck to the outline
        m = nd.binary_fill_holes(m | (nd.binary_dilation(m, disk(1)) & ink))
        r = nd.binary_dilation(m, disk(3))                   # carry the antialiased halo with the object
        r[e0:e1] &= m[e0:e1]                                 # ...but never stubs of the table line
        solid[k], ring[k] = m, r
    rings = np.logical_or.reduce(list(ring.values()))
    tone = {}
    for k, m in solid.items():                               # faint dots in the lower half around each object
        ys = np.where(m.any(1))[0]
        near = within(m, 42) & (yy > ys.min() + (ys.max() - ys.min()) * .55) & ~rings
        near[e0 - 3:e1 + 3] = False
        near[yy > 900] = False                               # the tabletop's front edge
        t = nd.binary_dilation(near & (al > 6), disk(2)) & ~rings
        t[e0 - 3:e1 + 3] = False
        tone[k] = t
    x0, y0, x1, y1 = LEAF_BOX
    leaf_lab, _ = nd.label(ring["plant"] & (xx >= x0) & (xx < x1) & (yy >= y0) & (yy < y1))
    leaf = leaf_lab == leaf_lab[LEAF_SEED]                   # only the tall leaf, not tips of its neighbours
    f0, f1 = FRONT_EDGE
    front = np.zeros((H, W), bool)
    front[f0:f1] = (desk[f0:f1, :, :3].mean(2) < 200) & (al[f0:f1] > 0)

    names = ["plate", "edge"] + ["tone-" + k for k in SEEDS] + ["plant", "leaf", "laptop", "mug", "camera"]
    code = {n: i for i, n in enumerate(names)}
    owner = np.zeros((H, W), np.uint8)                       # every pixel starts on the plate
    for k, t in tone.items():
        owner[t & (owner == 0)] = code["tone-" + k]
    for k, r in ring.items():                                # objects win over neighbouring stipple
        owner[r] = code[k]
    owner[leaf] = code["leaf"]
    owner[front & (owner == 0)] = code["edge"]
    masks = {n: (owner == code[n]) & (al > 0) for n in names}
    return masks, {"solid": solid, "ring": ring}


def back_edge(desk: np.ndarray, ring: dict) -> dict[str, np.ndarray]:
    """Repeat real columns of the back-edge line from just outside each gap (right of the plant is the corner)."""
    out = {}
    rows = np.arange(BACK_EDGE[0] - 1, BACK_EDGE[1] + 1)
    for k in ("laptop", "plant"):
        cols = np.where(ring[k][BACK_ROW])[0]
        x0, x1 = int(cols.min()), int(cols.max())
        ref = list(range(x0 - 60, x0 - 4)) + (list(range(x1 + 5, x1 + 61)) if k == "laptop" else [])
        layer = np.zeros_like(desk)
        for i, x in enumerate(range(x0, x1 + 1)):
            ys = rows[ring[k][rows, x]]
            layer[ys, x] = desk[ys, ref[(i * 7) % len(ref)]]
        out[k] = layer
    return out


def front_edge_line(desk: np.ndarray, edge: np.ndarray) -> dict:
    """r2-01's trace: the darkness-weighted centre row per column, every 48 px, plus stroke weight and ink."""
    W = desk.shape[1]
    band = desk[905:920].astype(float)
    dark = (255 - band[..., :3].mean(2)) * (band[..., 3] / 255)
    dark[dark < 60] = 0
    cy = (dark * np.arange(905, 920)[:, None]).sum(0) / np.maximum(dark.sum(0), 1)
    has = dark.sum(0) > 0
    pts = []
    for x in list(range(0, W, 48)) + [W - 1]:
        win = slice(max(0, x - 6), x + 7)
        pts.append([x, round(float(np.median(cy[win][has[win]])), 2)])
    a = edge[..., 3] / 255
    rgb = (edge[..., :3] * a[..., None]).sum((0, 1)) / a.sum()
    return {"pts": pts, "w": round(float(a.sum() / edge[..., 3].any(0).sum()), 2), "rgb": [int(round(v)) for v in rgb]}


def silhouette(alpha: np.ndarray, open_r: int, grow: int, min_area: int) -> np.ndarray:
    """Solid blobs: fill holes, open away thin strokes, then grow back inside the ink so outlines return."""
    core = nd.binary_opening(nd.binary_fill_holes(alpha > 110), structure=disk(open_r))
    lab, n = nd.label(core)
    sizes = nd.sum(core, lab, range(1, n + 1))
    m = np.isin(lab, 1 + np.flatnonzero(sizes >= min_area))
    for _ in range(grow):
        m = nd.binary_dilation(m) & (alpha > 0)
    return nd.binary_fill_holes(m)


def frame_parts(strip: np.ndarray, cells: int) -> tuple[np.ndarray, np.ndarray]:
    """The portrait strip masked to the frame (the union of every expression's silhouette), and cell 0's rest."""
    cw = strip.shape[1] // cells
    cell = [strip[:, i * cw:(i + 1) * cw] for i in range(cells)]
    m = np.logical_or.reduce([silhouette(c[..., 3].astype(int), 4, 5, 4000) for c in cell])
    m &= poly(m.shape, FRAME_KEEP)
    m[326:341, 499:] = False                                 # nor the table edge poking past the easel
    masked = np.concatenate([only(c, m) for c in cell], axis=1)
    return masked, only(cell[0], ~m)


def placed_box(name: str, cell: tuple[int, int], W: int, H: int) -> list[float]:
    left, top, width = PLACED[name]
    w = width / 100 * W
    return [left / 100 * W, top / 100 * H, w, w * cell[1] / cell[0]]


def place(rgba: np.ndarray, box: list[float]) -> tuple[Image.Image, int, int]:
    """Resample an image drawn for `box` (desk px, fractional) onto the desk's pixel grid."""
    x, y, w, h = box
    X0, Y0, X1, Y1 = math.floor(x), math.floor(y), math.ceil(x + w), math.ceil(y + h)
    sx, sy, pad = rgba.shape[1] / w, rgba.shape[0] / h, 16
    src = Image.fromarray(np.pad(rgba, ((pad, pad), (pad, pad), (0, 0))), "RGBA")
    area = ((X0 - x) * sx + pad, (Y0 - y) * sy + pad, (X1 - x) * sx + pad, (Y1 - y) * sy + pad)
    return src.resize((X1 - X0, Y1 - Y0), Image.LANCZOS, box=area), X0, Y0


def op_laptop(desk: np.ndarray) -> tuple[Image.Image, list[int]]:
    """10c: every opaque component fully inside the box (the laptop and its stipple). Thin long horizontal
    strokes (the back edge behind it) go first; whatever still touches the box edge is table line."""
    x0, y0, x1, y1 = 270, 245, 760, 610
    sub = desk[y0:y1, x0:x1].copy()
    m = sub[..., 3] > 6
    m &= ~((run_lengths(m.T).T <= 5) & (run_lengths(m) >= 40))
    lab, n = nd.label(m, structure=np.ones((3, 3)))
    rim = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    keep = np.isin(lab, [i for i in range(1, n + 1) if i not in rim])
    bx, by, bw, bh = bbox(keep)
    bx0, by0 = max(bx - 3, 0), max(by - 3, 0)
    bx1, by1 = min(bx + bw + 3, sub.shape[1]), min(by + bh + 3, sub.shape[0])
    crop = only(sub, keep)[by0:by1, bx0:bx1]
    return Image.fromarray(crop, "RGBA"), [x0 + bx0, y0 + by0, bx1 - bx0, by1 - by0]


def op_camera() -> Image.Image:
    """camera-light at 640 px, the open inside filled with paper. The outline has hairline gaps: seal it (grow
    the ink 5 px), flood the outside from the frame edge, and call every clear pixel it can't reach inside."""
    im = load("camera-light.png")
    clear = im[..., 3] < 40
    sealed = nd.binary_dilation(~clear, iterations=5)
    lab, _ = nd.label(~sealed)
    outside = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    inside = nd.binary_dilation(~sealed & ~np.isin(lab, list(outside)), iterations=6)
    hole = inside & (im[..., 3] < 250)
    im[hole, :3], im[hole, 3] = PAPER, 255
    img = Image.fromarray(im, "RGBA")
    return img.resize((640, round(640 * img.height / img.width)), Image.LANCZOS)


def op_me() -> Image.Image:
    """Portrait frames 0 (neutral) and 3 (surprised), stipple dropped: on a coral field the dots read as noise.
    Open away everything thinner than ~7 px, keep the largest body, grow back the outline it ate. 75 %."""
    im = load("frame-exp3-light.png")
    fw = im.shape[1] // 4
    out = []
    for i in (0, 3):
        fr = im[:, i * fw:(i + 1) * fw].copy()
        solid = nd.binary_opening(fr[..., 3] > 20, structure=np.ones((7, 7)))
        lab, _ = nd.label(solid)
        keep = nd.binary_fill_holes(lab == np.argmax(np.bincount(lab.ravel())[1:]) + 1)
        keep = nd.binary_dilation(keep, iterations=4) & (fr[..., 3] > 0)
        out.append(only(fr, keep))
    x, y, w, h = bbox((out[0][..., 3] > 0) | (out[1][..., 3] > 0))    # one tight box for both frames
    y0, y1, x0, x1 = max(y - 3, 0), y + h + 3, max(x - 3, 0), x + w + 3
    img = Image.fromarray(np.concatenate([o[y0:y1, x0:x1] for o in out], 1), "RGBA")
    return img.resize((img.width * 3 // 4, img.height * 3 // 4), Image.LANCZOS)


def op_book() -> Image.Image:
    """Book frames 1-3 (page lifting, upright, falling) for the OP's held poses, at 75 %."""
    im = Image.open(ASSETS / "book-flip2-light.png").convert("RGBA")
    fw = im.width // 6
    strip = im.crop((fw, 0, fw * 4, im.height))
    return strip.resize((strip.width * 3 // 4, strip.height * 3 // 4), Image.LANCZOS)


def ladder(img: Image.Image, cells: int) -> list[Image.Image]:
    """The strip at its master cell width, ½ and ¼, each cell resampled on its own (no bleed across cells)."""
    cw, h = img.width // cells, img.height
    out = [img]
    for div in (2, 4):
        w2 = int(cw / div + .5)
        h2 = int(h * w2 / cw + .5)
        small = Image.new("RGBA", (w2 * cells, h2))
        for i in range(cells):
            small.paste(img.crop((i * cw, 0, (i + 1) * cw, h)).resize((w2, h2), Image.LANCZOS), (i * w2, 0))
        out.append(small)
    return out


def webp(img: Image.Image | np.ndarray, lossless: bool = False, quality: int = 90, alpha: int = 100) -> bytes:
    if isinstance(img, np.ndarray):
        img = Image.fromarray(img, "RGBA")
    buf = io.BytesIO()
    if lossless:
        img.save(buf, "WEBP", lossless=True, quality=100, method=6)
    else:
        img.save(buf, "WEBP", quality=quality, alpha_quality=alpha, method=6)
    return buf.getvalue()


def decode(data: bytes) -> np.ndarray:
    return np.array(Image.open(io.BytesIO(data)).convert("RGBA"))


def rock_x(m: np.ndarray) -> float:
    """Where an object rocks: the middle of its bottom fifth, where it stands (so not a mug's handle)."""
    ys, xs = np.where(m)
    base = xs[ys >= ys.max() - (ys.max() - ys.min()) * .2]
    return (base.min() + base.max() + 1) / 2


def ink_box(rgba: np.ndarray, box: list[float]) -> tuple[list[float], float, float]:
    """Tight bbox of the visible ink (alpha > 40) of an image drawn at `box`, its foot and its rock centre."""
    m = rgba[..., 3] > 40
    sx, sy = box[2] / rgba.shape[1], box[3] / rgba.shape[0]
    x, y, w, h = bbox(m)
    r = lambda v: round(float(v), 2)
    return ([r(box[0] + x * sx), r(box[1] + y * sy), r(w * sx), r(h * sy)],
            r(box[1] + (y + h) * sy), r(box[0] + rock_x(m) * sx))


def build() -> tuple[dict[str, bytes], dict, dict]:
    desk = load("desk-scene2-light.png")
    H, W = desk.shape[:2]
    masks, parts = partition(desk)
    files: dict[str, bytes] = {}
    geo = {"W": W, "H": H, "base": "./assets/derived/", "layers": {}, "backedge": {}, "obj": {}, "strips": {}, "op": {}}

    frame_src, cells = STRIPS["frame"]
    strip, rest = frame_parts(load(frame_src), cells)
    cell = (rest.shape[1], rest.shape[0])
    rest_img, rx, ry = place(rest, placed_box("frame", cell, W, H))
    rest_px = np.array(rest_img)
    rest_px[rest_px[..., 3] == 0] = 0
    rest_on = np.zeros((H, W), bool)
    rest_on[ry:ry + rest_img.height, rx:rx + rest_img.width] = rest_px[..., 3] > 0
    if (rest_on & ~masks["plate"] & (desk[..., 3] > 0)).any():   # it lives on the plate, so it folds with it
        raise SystemExit("the frame's rest overlaps a layer other than the plate")
    x, y, w, h = bbox(rest_px[..., 3] > 0)
    files["desk/frame-rest.webp"] = webp(rest_px[y:y + h, x:x + w], lossless=True)
    frame_rest = {"src": "desk/frame-rest.webp", "box": [rx + x, ry + y, w, h]}

    layers = {}
    for name, m in masks.items():
        rgba = only(desk, m)
        box = bbox(rgba[..., 3] > 0)
        x, y, w, h = box
        rel = f"desk/{name}.webp"
        files[rel] = webp(rgba[y:y + h, x:x + w], lossless=True)
        layers[name] = rgba
        geo["layers"][name] = {"src": rel, "box": box}
    for k, layer in back_edge(desk, parts["ring"]).items():
        x, y, w, h = box = bbox(layer[..., 3] > 0)
        files[f"desk/backedge-{k}.webp"] = webp(layer[y:y + h, x:x + w], lossless=True)
        geo["backedge"][k] = {"src": f"desk/backedge-{k}.webp", "box": box}
    for k in ("plant", "laptop", "mug", "camera"):
        box = geo["layers"][k]["box"]
        ink, _, _ = ink_box(layers[k][box[1]:box[1] + box[3], box[0]:box[0] + box[2]], box)
        solid = parts["solid"][k]
        geo["obj"][k] = {"box": box, "ink": ink, "foot": int(np.where(solid.any(1))[0].max()), "cx": float(rock_x(solid))}

    masters = {name: Image.fromarray(strip, "RGBA") if name == "frame" else Image.open(ASSETS / src).convert("RGBA")
               for name, (src, _) in STRIPS.items()}
    for name, (_, n) in STRIPS.items():
        entry = {"cells": n, "files": []}
        for size in ladder(masters[name], n):
            rel = f"strip/{name}-{size.width // n}.webp"
            files[rel] = webp(size)
            entry["files"].append({"src": rel, "cw": size.width // n, "h": size.height})
        weights = [len(files[f["src"]]) for f in entry["files"]]
        if weights != sorted(weights, reverse=True) or len(set(weights)) < len(weights):
            raise SystemExit(f"strip {name}: a smaller rung is not lighter than the one above it {weights}")
        geo["strips"][name] = entry
    for obj, name in STRIP_OBJ.items():
        img = np.array(masters[name])
        cell0 = img[:, :img.shape[1] // STRIPS[name][1]]
        box = [round(v, 2) for v in placed_box(obj, (cell0.shape[1], cell0.shape[0]), W, H)]
        ink, foot, cx = ink_box(cell0, box)
        geo["obj"][obj] = {"box": box, "ink": ink, "foot": foot, "cx": cx, "strip": name}
    geo["obj"]["frame"]["rest"] = frame_rest
    for z, k in enumerate(sorted(geo["obj"], key=lambda k: geo["obj"][k]["foot"]), 1):
        geo["obj"][k]["z"] = z                               # back to front by where each stands
    geo["leaf"] = {"box": geo["layers"]["leaf"]["box"], "pivot": list(LEAF_PIVOT)}
    geo["edgeLine"] = front_edge_line(desk, layers["edge"])

    laptop, laptop_box = op_laptop(desk)
    op = {"me": (op_me(), 2), "laptop": (laptop, 1), "camera": (op_camera(), 1), "book": (op_book(), 3)}
    for k, (img, n) in op.items():
        files[f"op/{k}.webp"] = webp(img, quality=86, alpha=95)
        geo["op"][k] = {"src": f"op/{k}.webp", "w": img.width, "h": img.height, "cells": n}
    geo["op"]["laptop"]["box"] = laptop_box
    return files, geo, desk


def check(files: dict[str, bytes], geo: dict, desk: np.ndarray) -> None:
    """The decoded layers must be disjoint and recompose the master exactly (colour wherever there is ink)."""
    canvas = np.zeros_like(desk)
    for name, entry in geo["layers"].items():
        x, y, w, h = entry["box"]
        im = decode(files[entry["src"]])
        region, on = canvas[y:y + h, x:x + w], im[..., 3] > 0
        if (region[..., 3][on] > 0).any():
            raise SystemExit(f"layer {name} overlaps another layer")
        region[on] = im[on]
    alpha = int((canvas[..., 3] != desk[..., 3]).sum())
    colour = int((canvas[..., :3] != desk[..., :3]).any(-1)[desk[..., 3] > 0].sum())
    if alpha or colour:
        raise SystemExit(f"recomposition differs from the master: {alpha} alpha and {colour} colour pixels")


def write(files: dict[str, bytes]) -> list[str]:
    updated = []
    for rel, data in sorted(files.items()):
        path = OUT / rel
        if path.is_file() and path.read_bytes() == data:
            continue
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)
        updated.append(rel)
    for stray in sorted(p for p in OUT.rglob("*") if p.is_file()):
        if stray.relative_to(OUT).as_posix() not in files:
            stray.unlink()
            print(f"pruned {stray.relative_to(ROOT)}")
    return updated


def main() -> int:
    files, geo, desk = build()
    check(files, geo, desk)
    files["desk-geo.js"] = (
        "// Generated by scripts/generate-sprites.py from the desk masters; do not hand-edit.\n"
        f"window.FY_DESK={json.dumps(geo, separators=(',', ':'))};\n"
    ).encode("utf-8")
    updated = write(files)
    print("recomposition exact: the decoded desk layers rebuild the master pixel for pixel")
    for rel in sorted(files):
        print(f"  {rel:<28} {len(files[rel]) / 1024:>7.1f} KB{'  (updated)' if rel in updated else ''}")
    print(f"{len(updated)} updated, {len(files) - len(updated)} unchanged")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
