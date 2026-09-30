"""Frame-to-frame change of a capture: finds zero-diff frames (a frame identical to the one before) inside motion
windows, and one- or two-frame luma spikes that return to baseline.
   uv run --with numpy --with pillow python cap/diffs.py <capture dir> [t0 t1 ...windows in s] [--strip out.jpg a b]"""
import json
import os
import sys
import numpy as np
from PIL import Image

d = sys.argv[1]
m = json.load(open(os.path.join(d, 'meta.json')))
fr = m['frames']
args = sys.argv[2:]
strip = None
if '--strip' in args:
    i = args.index('--strip'); strip = args[i + 1:i + 4]; args = args[:i]
wins = [(float(args[i]), float(args[i + 1])) for i in range(0, len(args) - 1, 2)]

def lum(f):
    im = Image.open(os.path.join(d, 'f', f)).convert('L').resize((320, 250))
    return np.asarray(im, dtype=np.float32)

prev = None; diffs = []
for f, t, fps, *_ in fr:
    a = lum(f)
    diffs.append(0.0 if prev is None else float(np.mean(np.abs(a - prev))))
    prev = a
diffs = np.array(diffs)
ts = np.array([f[1] for f in fr])
print('frames', len(fr), 'mean diff', round(float(diffs.mean()), 3))
for a, b in wins:
    sel = (ts >= a) & (ts <= b)
    z = [round(float(t), 3) for t, x in zip(ts[sel], diffs[sel]) if x < 0.02]
    print(f'window {a}-{b}: {int(sel.sum())} frames, zero-diff {len(z)}', z[:20], 'min', round(float(diffs[sel].min()), 3) if sel.any() else '-')
# spikes: a frame whose diff is > 4× both neighbours' baseline and returns
sp = [round(float(ts[i]), 3) for i in range(2, len(diffs) - 2) if diffs[i] > 3 and diffs[i] > 4 * max(diffs[i - 2], diffs[i + 2], .5) and diffs[i + 1] > 3]
print('spikes', sp[:20])
if strip:
    a, b = float(strip[1]), float(strip[2])
    sel = [f[0] for f in fr if a <= f[1] <= b]
    ims = [Image.open(os.path.join(d, 'f', f)).convert('RGB').resize((320, 250)) for f in sel[:48]]
    cols = 8; rows = (len(ims) + cols - 1) // cols
    sh = Image.new('RGB', (320 * cols, 250 * rows), 'white')
    for i, im in enumerate(ims): sh.paste(im, ((i % cols) * 320, (i // cols) * 250))
    sh.save(strip[0], quality=82)
