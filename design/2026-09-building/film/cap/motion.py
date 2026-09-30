"""Where the site moves: the capture's frame-to-frame change, as windows of motion, written to motion.json beside it.
   uv run --with numpy --with pillow python cap/motion.py <capture dir>"""
import json
import sys
import numpy as np
from PIL import Image

d = sys.argv[1]
m = json.load(open(d + '/meta.json'))
prev, rows = None, []
for f, t, fps in m['frames']:
    a = np.asarray(Image.open(d + '/f/' + f).convert('L').resize((256, 200)), dtype=np.float32)
    rows.append([t, 0.0 if prev is None else float(np.mean(np.abs(a - prev))), fps]); prev = a
wins, cur = [], None
for t, x, fps in rows:
    if x > 0.08:
        if cur is None: cur = [t, t, x]
        else: cur[1] = t; cur[2] = max(cur[2], x)
    elif cur is not None and t - cur[1] > 0.12:
        wins.append(cur); cur = None
if cur: wins.append(cur)
json.dump({'diff': rows, 'windows': wins}, open(d + '/motion.json', 'w'))
for a, b, x in wins:
    if b - a > 0.05: print(f'{a:7.3f} – {b:7.3f}  ({b - a:5.2f} s)  peak {x:5.1f}')
