# 10d · pick recorded screencast frames every STEP ms after the opener's t0 and build a sheet.
# uv run --with pillow python design/2026-09-motion/tools/10d-pick.py <recdir> <out.png> <step> <until> <cols> <thumbw> [x0,y0,x1,y1] [from]
import sys, json, os
from PIL import Image, ImageDraw
rec, out, step, until, cols, tw = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5]), int(sys.argv[6])
crop = tuple(int(v) for v in sys.argv[7].split(',')) if len(sys.argv) > 7 and sys.argv[7] != '-' else None
start = int(sys.argv[8]) if len(sys.argv) > 8 else 0
idx = json.load(open(os.path.join(rec, 'index.json')))
t0, fr = idx['t0'], idx['frames']
picks = []
for t in range(start, until + 1, step):
    # the latest frame painted at or before t (what was on screen at that moment)
    cand = [f for f in fr if f['ts'] - t0 <= t]
    f = cand[-1] if cand else fr[0]
    picks.append((t, f['file'], f['ts'] - t0))
ims = [Image.open(p[1]).convert('RGB') for p in picks]
if crop: ims = [im.crop(crop) for im in ims]
th = int(ims[0].height * tw / ims[0].width)
pad, lab = 5, 14
rows = (len(ims) + cols - 1) // cols
sheet = Image.new('RGB', (cols * (tw + pad) + pad, rows * (th + lab + pad) + pad), (40, 38, 35))
d = ImageDraw.Draw(sheet)
for i, ((t, f, real), im) in enumerate(zip(picks, ims)):
    x, y = pad + (i % cols) * (tw + pad), pad + (i // cols) * (th + lab + pad)
    sheet.paste(im.resize((tw, th), Image.LANCZOS), (x, y + lab))
    d.text((x + 2, y + 1), '%d ms (frame %+d)' % (t, real - t), fill=(230, 220, 200))
sheet.save(out)
print('sheet', out, sheet.size, 'frames', len(fr))
