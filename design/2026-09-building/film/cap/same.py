"""Run-to-run check: two captures of the same scenario should be the same film, frame for frame.
   uv run --with numpy --with pillow python cap/same.py <dir a> <dir b>"""
import json
import sys
import numpy as np
from PIL import Image

a, b = sys.argv[1:3]
fa = json.load(open(a + '/meta.json'))['frames']; fb = json.load(open(b + '/meta.json'))['frames']
worst, where, bad = 0.0, None, 0
for (x, t, _), (y, _, _) in zip(fa, fb):
    p = np.asarray(Image.open(a + '/f/' + x).convert('L').resize((640, 500)), dtype=np.float32)
    q = np.asarray(Image.open(b + '/f/' + y).convert('L').resize((640, 500)), dtype=np.float32)
    d = float(np.mean(np.abs(p - q)))
    if d > 0.5: bad += 1
    if d > worst: worst, where = d, t
print(f'frames {len(fa)} / {len(fb)}; frames that differ (> 0.5 mean luma): {bad}; worst {worst:.3f} at {where}')
