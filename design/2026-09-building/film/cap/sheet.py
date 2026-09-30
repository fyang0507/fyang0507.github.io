"""Contact sheet of a capture at given times (or every step seconds).
   uv run --with pillow python cap/sheet.py <capture dir> <out.jpg> <step s> [cols]"""
import json
import sys
from PIL import Image, ImageDraw

d, out, step = sys.argv[1], sys.argv[2], float(sys.argv[3])
cols = int(sys.argv[4]) if len(sys.argv) > 4 else 8
m = json.load(open(d + '/meta.json'))
fr = m['frames']
if not fr: sys.exit('no frames')
ts, pick, t = [f[1] for f in fr], [], fr[0][1]
while t <= fr[-1][1]:
    i = min(range(len(ts)), key=lambda k: abs(ts[k] - t)); pick.append(fr[i]); t += step
W, H = 320, 250
rows = (len(pick) + cols - 1) // cols
sh = Image.new('RGB', (W * cols, (H + 18) * rows), 'white')
dr = ImageDraw.Draw(sh)
for i, (f, tt, _) in enumerate(pick):
    im = Image.open(d + '/f/' + f).convert('RGB').resize((W, H))
    x, y = (i % cols) * W, (i // cols) * (H + 18)
    sh.paste(im, (x, y)); dr.text((x + 4, y + H + 3), f'{tt:.2f}', fill='black')
sh.save(out, quality=80)
print(len(pick), 'frames')
