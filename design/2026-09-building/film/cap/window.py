"""A contact sheet of one window of a capture: every nth frame between t0 and t1.
   uv run --with pillow python cap/window.py <capture dir> <out.jpg> t0 t1 [every n frames] [cols]"""
import json
import sys
from PIL import Image, ImageDraw

d, out, t0, t1 = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4])
every = int(sys.argv[5]) if len(sys.argv) > 5 else 12
cols = int(sys.argv[6]) if len(sys.argv) > 6 else 8
fr = [f for f in json.load(open(d + '/meta.json'))['frames'] if t0 <= f[1] <= t1][::every]
W, H = 320, 250
rows = (len(fr) + cols - 1) // cols
sh = Image.new('RGB', (W * cols, (H + 18) * rows), 'white'); dr = ImageDraw.Draw(sh)
for i, f in enumerate(fr):
    x, y = (i % cols) * W, (i // cols) * (H + 18)
    sh.paste(Image.open(d + '/f/' + f[0]).convert('RGB').resize((W, H)), (x, y)); dr.text((x + 4, y + H + 3), f'{f[1]:.2f}', fill='black')
sh.save(out, quality=80); print(len(fr), 'frames')
