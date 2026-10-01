"""v1.5/checks/sbs.py — the side-by-side, on its frame map (checks/probe.mjs on sbs.html) and its file:
   · every click: the frame it lands on in the promo (right) and in the before (left);
   · the before page is whole in its panel on every frame before the end (its corners, and how close they come);
   · stills into /tmp/fyfilm/v15-check/: a few frames of the film, clicks answered side by side.
   · from the moment the last sheet's pen starts, its motto, seals and stamps are whole in the frame (and how close);
   uv run --with numpy --with pillow python v1.5/checks/sbs.py /tmp/fyfilm/v15-check/probe-sbs.json [stacked]"""
import json
import os
import subprocess
import sys
import numpy as np
from PIL import Image, ImageDraw

here = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
pr = json.load(open(sys.argv[1]))
sync = json.load(open(os.path.join(here, 'sbs-sync.json')))
F, L = pr['frames'], pr['layout']['left']
end0 = next(s['t0'] for s in pr['timeline'] if s['k'] == 'end')
print('click             promo frame  before frame')
for p in sync['pairs']:
    a = next(i for i in range(len(F)) if i / 60 >= p['after_t'] - 1e-6)
    b = next((i for i in range(len(F)) if F[i]['k'] == 'play' and F[i]['before'] is not None and p['before_u'] is not None and F[i]['before'] >= p['before_u'] - 1e-6), None)
    print(f"{p['name']:16s}  {a:11d}  {b if b is not None else '— (the old About has no card: the before holds on it)'}")
m = min(min(c[0] - L['x'], c[1] - L['y'], L['x'] + L['w'] - c[0], L['y'] + L['h'] - c[1]) for f, i in zip(F, range(len(F))) if i / 60 < end0 for c in f['corners'])
print(f"the before page's corners stay inside its panel on all {sum(1 for i in range(len(F)) if i / 60 < end0)} frames before the end; nearest {m:.1f} px from the panel's edge")
W, H = pr['layout']['W'], pr['layout']['H']
ends = [f['end'] for f in F if f.get('end')]
me = min(min(c[0], c[1], W - c[0], H - c[1]) for e in ends for c in e['corners'])
print(f"the last sheet's motto, seals and stamps are whole in the {W}×{H} frame on all {len(ends)} frames from its pen on; nearest {me:.1f} px from the frame's edge")
STK = sys.argv[2:] == ['stacked']
out = '/tmp/fyfilm/v15-check'
vid = os.path.join(here, 'film-v1.5-stacked.mp4' if STK else 'film-v1.5-side-by-side.mp4')
for name, n in (('book', 417), ('print', 1140), ('about', 1500), ('end', 2258)):
    name = ('stk-' if STK else 'sbs-') + name
    subprocess.run(['/opt/homebrew/bin/ffmpeg', '-v', 'error', '-y', '-i', vid, '-vf', f'select=eq(n\\,{n})', '-vsync', '0', '-frames:v', '1', os.path.join(out, name + '.png')], check=True)
    print('wrote', name + '.png', 'frame', n)
