"""v1.4/checks/space.py — criteria 2 and 4 on the promo's frame map (checks/probe.mjs):
   · each caption is fully in before its motion starts, out after it ends, and fully visible for at least 2.5 s;
   · on every frame a caption is visible, its strip doesn't touch the motion's box on screen. The box is per shot:
     the union of what changes in the capture over the motion (frame differences, 320 × 250, > 40 of 255), in page px,
     projected through the film's camera on each frame;
   · the peg is inside the picture on every frame from the click until the print has landed. Its path is read off the
     capture by hand (PEG: footage s → centre and half size in page px, from checks/peg-*.jpg), interpolated between.
   uv run --with numpy --with pillow python v1.4/checks/space.py /tmp/fyfilm/v14-check/probe-promo.json"""
import json
import sys
import numpy as np
from PIL import Image

p = json.load(open(sys.argv[1]))
F, TL, CAPS, LAY = p['frames'], p['timeline'], p['captions'], p['layout']
pic, strip = LAY['pic'], LAY['strip']
TAKE = '/tmp/fyfilm/cap/take11-after'
meta = json.load(open(TAKE + '/meta.json'))

def project(vp, x, y):
    m = np.array(vp).reshape(4, 4).T   # three.js elements are column-major
    c = m @ np.array([(x - 640) / 100, (500 - y) / 100, 0.3, 1.0])
    n = c[:3] / c[3]
    return pic['x'] + (n[0] + 1) / 2 * pic['w'], pic['y'] + (1 - n[1]) / 2 * pic['h']

def screen_box(vp, b):
    pts = [project(vp, x, y) for x in (b[0], b[2]) for y in (b[1], b[3])]
    xs, ys = [q[0] for q in pts], [q[1] for q in pts]
    return min(xs), min(ys), max(xs), max(ys)

def meets(a, b):
    return a[0] < b[2] and b[0] < a[2] and a[1] < b[3] and b[1] < a[3]

def motion_box(u0, u1, thr=40):
    fr = [f for f in meta['frames'] if u0 - 0.02 <= f[1] <= u1]
    prev, box = None, None
    for f in fr:
        a = np.asarray(Image.open(f'{TAKE}/f/{f[0]}').convert('L').resize((320, 250)), dtype=np.float32)
        if prev is not None:
            ys, xs = np.where(np.abs(a - prev) > thr)
            if len(xs):
                b = [xs.min() * 4, ys.min() * 4, xs.max() * 4 + 4, ys.max() * 4 + 4]
                box = b if box is None else [min(box[0], b[0]), min(box[1], b[1]), max(box[2], b[2]), max(box[3], b[3])]
        prev = a
    return box

st = (strip['x'], strip['y'], strip['x'] + strip['w'], strip['y'] + strip['h'])
picr = (pic['x'], pic['y'], pic['x'] + pic['w'], pic['y'] + pic['h'])
print(f"treatment {LAY['treatment']}: picture {picr}, caption strip {st}")
shots = {s['name']: s for s in TL if s['k'] == 'play' and s['name']}
for c in CAPS:
    s = shots[c['name']]
    m0, m1 = c['motion']
    full = c['full'][1] - c['full'][0]
    box = motion_box(*c['umotion'])
    vis = [i for i in range(len(F)) if c['in'] <= i / 60 < c['out']]
    hit = [i for i in vis if meets(screen_box(F[i]['vp'], box), st)]
    mot = [i for i in range(len(F)) if m0 <= i / 60 <= m1]
    inside = sum(1 for i in mot if all(a >= b - 0.5 for a, b in zip(screen_box(F[i]['vp'], box)[:2], picr[:2])) and all(a <= b + 0.5 for a, b in zip(screen_box(F[i]['vp'], box)[2:], picr[2:])))
    print(f"{c['id']}: {c['words'][0]} · {c['words'][1]}\n   on screen {c['in']:.2f}–{c['out']:.2f} s, fully visible {c['full'][0]:.2f}–{c['full'][1]:.2f} ({full:.2f} s ≥ 2.5: {full >= 2.5}); "
          f"motion {m0:.2f}–{m1:.2f}: fully in {m0 - c['full'][0]:.2f} s before it starts, still fully in {c['full'][1] - m1:.2f} s after it ends\n"
          f"   motion box (page px) {box}; frames with the caption visible {vis[0]}–{vis[-1]}: {len(hit)} where the strip meets the box; "
          f"the box whole in the picture on {inside} of {len(mot)} motion frames")

# the peg: footage s → centre x, y and half width, half height (page px), read off the capture
PEG = [(54.75, 555, 601, 8, 12), (55.05, 555, 601, 8, 12), (55.10, 563, 573, 9, 15), (55.133, 573, 504, 10, 18), (55.167, 588, 427, 10, 20),
       (55.20, 602, 352, 11, 22), (55.233, 615, 281, 11, 24), (55.267, 631, 213, 12, 26), (55.30, 640, 175, 12, 27), (55.35, 654, 108, 12, 28),
       (55.40, 660, 83, 12, 29), (55.45, 661, 48, 12, 30), (55.60, 660, 43, 12, 30)]
pr = [i for i, f in enumerate(F) if f['name'] == 'print' and PEG[0][0] <= f['u'] <= PEG[-1][0]]
worst, out = 1e9, []
for i in pr:
    u = F[i]['u']; row = [np.interp(u, [q[0] for q in PEG], [q[k] for q in PEG]) for k in range(1, 5)]
    b = screen_box(F[i]['vp'], (row[0] - row[2], row[1] - row[3], row[0] + row[2], row[1] + row[3]))
    margin = min(b[0] - picr[0], b[1] - picr[1], picr[2] - b[2], picr[3] - b[3])
    worst = min(worst, margin)
    if margin < 0: out.append(i)
cap = next(c for c in CAPS if c['id'] == 'print')
print(f"peg: frames {pr[0]}–{pr[-1]} (the click at footage 54.75 → landed at 55.60); outside the picture on {len(out)} {out[:10]}; "
      f"closest it comes to the picture's edge {worst:.0f} px; caption fully visible over all of them: {cap['full'][0] * 60 <= pr[0] and pr[-1] <= cap['full'][1] * 60}")
