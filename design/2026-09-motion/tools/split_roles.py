"""Split a paper-and-ink master into theme-agnostic role layers.

    uv run --with pillow --with numpy --with scipy python design/2026-09-motion/tools/split_roles.py

For every master PNG this writes three layers into design/2026-09-motion/assets-gen/roles/:
  <name>-ink.png   white + alpha = how much of the pixel is line (the pen)
  <name>-fill.png  white + alpha = how much is opaque paper (the occluder inside an object)
  <name>-tint.png  the original colour where the pixel is chromatic (stickers, the yellow bird)
A theme then colours ink and fill with CSS tokens through mask-image; tint stays as drawn.
The masters are never modified — this is a regenerable derivative, like the size ladders.

Tone is the one thing that doesn't survive a dark field. Line-only art reads the same inverted, but
continuous grey tone (halftone hair, shading) only means something dark-on-light, and a face in negative
stops being that face. On a dark field everything is still drawn in the world's one chalk, so:
  GAIN              faint line-like tone (a book's text) is stacked N times so it survives as chalk
  PRINT_REGIONS     a toned print (the portrait in its frame); the generator finds the print as the paper
                    region around a seed point, per sprite frame, and writes
  <name>-print.png  white + alpha = the toned print
and, inside that print, the pieces a dark-field renderer needs to reduce it to chalk contour:
  <name>-pline.png  strong strokes only (grey tone dropped)      -> theme ink
  <name>-pmass.png  solid dark masses: pupils, the darkest shadow -> stay dark in every theme
  <name>-pring.png  a thin rim around each mass                   -> theme ink, so a dark pupil still reads
  <name>-ptone.png  the grey tone alone, strongest tone = full    -> theme ink at a chosen strength (0 = contour)
roles.json records each stem's needs so the renderer needs no per-asset knowledge.
"""
import json
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage
from scipy.spatial import ConvexHull

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / "design/2026-09-motion/assets-gen/roles"
MASTERS = [
    "desk-scene2-light.png", "frame-exp3-light.png", "book-flip2-light.png", "bird-strip6-light.png",
    "nav-book-light@2x.png", "nav-laptop-light@2x.png", "nav-camera-light@2x.png", "nav-frame-light@2x.png",
    "identity-sticker-ghost@2x.png", "identity-sticker-blob@2x.png", "sticker-peek.png",
]
PAPER_L, INK_L = 0.93, 0.07          # luminance of the cream the art was drawn on, and of the pen
GAIN = {"book-flip2-light.png": 2, "nav-book-light@2x.png": 2}
PRINT_REGIONS = {"frame-exp3-light.png": {"frames": 4, "seed": (0.5, 0.13)}}   # seed: fraction of one frame


def print_region(src, frames, seed):
    """Paper component around the seed, closed to its convex hull (a print is a flat convex sheet)."""
    h, w = src.shape[:2]
    fw = w // frames
    lum = src[..., :3] @ np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)
    region = Image.new("L", (w, h), 0)
    draw = ImageDraw.Draw(region)
    for k in range(frames):
        x0 = k * fw
        paper = (src[:, x0:x0 + fw, 3] > 0.9) & (lum[:, x0:x0 + fw] > 0.8)
        lab, _ = ndimage.label(paper)
        sy, sx = int(h * seed[1]), int(fw * seed[0])
        c = lab[sy, sx]
        if c == 0:
            ys, xs = np.nonzero(lab)
            i = ((ys - sy) ** 2 + (xs - sx) ** 2).argmin()
            c = lab[ys[i], xs[i]]
        keep = lab == c
        # A figure in the print (a shirt reaching the edge) splits its paper into several pieces.
        # Absorb every piece that lies mostly inside the current hull, then re-close; the frame's
        # own paper sits outside the hull and never qualifies.
        for _ in range(3):
            ys, xs = np.nonzero(keep)
            pts = np.column_stack([xs, ys])
            hull = pts[ConvexHull(pts).vertices]
            m = Image.new("L", (fw, h), 0)
            ImageDraw.Draw(m).polygon([tuple(p) for p in hull], fill=1)
            inside = np.asarray(m, bool)
            area = ndimage.sum(np.ones_like(lab), lab, index=np.arange(1, lab.max() + 1))
            within = ndimage.sum(inside, lab, index=np.arange(1, lab.max() + 1))
            grown = keep | np.isin(lab, 1 + np.nonzero(within > 0.5 * area)[0])
            if grown.sum() == keep.sum():
                break
            keep = grown
        draw.polygon([(x + x0, y) for x, y in hull], fill=255)
    return np.asarray(region.filter(ImageFilter.GaussianBlur(0.8)), np.float32) / 255


def smooth(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


def disk(r):
    yy, xx = np.mgrid[-r:r + 1, -r:r + 1]
    return xx * xx + yy * yy <= r * r


def eye_pairs(mass, frame_w):
    """Pupils are the one mass that comes in pairs: similar size, same height, a face-width apart.
    A chin shadow or an ear gets no rim, and closed eyes (blink, smile) simply find no pair."""
    lab, n = ndimage.label(mass)
    idx = np.arange(1, n + 1)
    area = ndimage.sum(mass, lab, idx)
    cy, cx = np.array(ndimage.center_of_mass(mass, lab, idx)).T if n else (np.array([]), np.array([]))
    keep = np.zeros(n + 1, bool)
    for i in range(n):
        for j in range(i + 1, n):
            same_frame = int(cx[i] // frame_w) == int(cx[j] // frame_w)
            if same_frame and abs(cy[i] - cy[j]) < 0.02 * mass.shape[0] and 0.6 < area[i] / area[j] < 1.6 \
                    and 0.05 * frame_w < abs(cx[i] - cx[j]) < 0.3 * frame_w:
                keep[i + 1] = keep[j + 1] = True
    return keep[lab]


def night_print_layers(dark, region, frame_w):
    """Separate a toned print into line, mass and rim. Masses are what survives an opening wider than
    any stroke (pupils, a chin shadow); lines are the strong strokes that remain; tone is left out."""
    mass = ndimage.binary_opening(dark > 0.7, structure=disk(3))
    eyes = ndimage.binary_dilation(eye_pairs(mass, frame_w), structure=disk(1))
    mass = ndimage.binary_dilation(mass, structure=disk(1))
    rim = ndimage.binary_dilation(eyes, structure=disk(2)) & ~eyes
    soft = lambda m: np.asarray(Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6)), np.float32) / 255
    line = smooth(0.35, 0.65, dark) * (1 - soft(mass))
    tone = dark * (1 - smooth(0.35, 0.65, dark)) * (1 - soft(mass)) * region
    tone = np.clip(tone / max(np.percentile(tone[region > 0.5], 99), 1e-3), 0, 1)
    return {"pline": line * region, "pmass": soft(mass) * region, "pring": soft(rim) * region, "ptone": tone}


def split(name):
    src = np.asarray(Image.open(ROOT / "assets" / name).convert("RGBA")).astype(np.float32) / 255
    rgb, a = src[..., :3], src[..., 3]
    lum = rgb @ np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)
    sat = rgb.max(-1) - rgb.min(-1)
    chroma = smooth(0.13, 0.26, sat) * smooth(0.15, 0.3, lum)       # coloured, and not near-black
    dark = np.clip((PAPER_L - lum) / (PAPER_L - INK_L), 0, 1)
    ink = a * dark * (1 - chroma)
    fill = a * (1 - dark) * (1 - chroma)
    stem = Path(name).stem.replace("-light", "")

    def mask(alpha):
        out = np.zeros(src.shape, np.uint8)
        out[..., :3] = 255
        out[..., 3] = np.round(alpha * 255).astype(np.uint8)
        return Image.fromarray(out, "RGBA")

    mask(ink).save(OUT / f"{stem}-ink.png", optimize=True)
    mask(fill).save(OUT / f"{stem}-fill.png", optimize=True)
    tint = np.zeros(src.shape, np.uint8)
    tint[..., :3] = np.round(rgb * 255).astype(np.uint8)
    tint[..., 3] = np.round(a * chroma * 255).astype(np.uint8)
    tint[tint[..., 3] < 6] = 0                                        # empty pixels compress to nothing
    has_tint = (tint[..., 3] > 40).sum() > 8
    if has_tint:
        Image.fromarray(tint, "RGBA").save(OUT / f"{stem}-tint.png", optimize=True)
    role = {"tint": bool(has_tint), "print": name in PRINT_REGIONS, "gain": GAIN.get(name, 1)}
    if name in PRINT_REGIONS:
        region = print_region(src, **PRINT_REGIONS[name]) * a
        mask(region).save(OUT / f"{stem}-print.png", optimize=True)
        for k, layer in night_print_layers(dark * a, region, src.shape[1] // PRINT_REGIONS[name]["frames"]).items():
            mask(layer).save(OUT / f"{stem}-{k}.png", optimize=True)
    ROLES[stem] = role
    sizes = [(OUT / f"{stem}-{k}.png").stat().st_size // 1024 for k in (["ink", "fill"] + (["tint"] if has_tint else []))]
    cov = (tint[..., 3] > 40).mean() * 100
    print(f"tint {cov:5.2f}% · {name:32} -> {stem}  ink/fill{'/tint' if has_tint else ''} KB={sizes}  master KB={(ROOT / 'assets' / name).stat().st_size // 1024}")


ROLES = {}

if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for m in MASTERS:
        split(m)
    (OUT / "roles.json").write_text(json.dumps(ROLES, indent=1) + "\n")
