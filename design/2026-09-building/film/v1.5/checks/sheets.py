"""v1.5/checks/sheets.py — contact sheets of the finished files, by exact frame number, into /tmp/fyfilm/v15-check/,
and the measurements that go with them:
   ramps.png      each ramp: slowing, mid-⅓, real time again
   captions.png   each caption mid-motion, and part 2's label
   develop.png    three prints on the line, cropped from the film at six frames across the develop, with how far each
                  print's colour has come (mean saturation, 0–255)
   tabmoves.png   the building → shooting and shooting → about tab moves, every 4th frame, and the largest jump in
                  picture from one frame to the next inside each (a hard cut would be one huge jump between calm frames)
   card.png       the specimen card in its sleeve, pulled, popped free, in the hand, turning, turned
   peg.png        every 6th frame from the click to the landing, and peg-crops.png (the peg at full size, three frames)
   endcard.png    after the last credit, and the last frame; join.png (part 1's last frame, part 2's first, the pull,
                  the label, the put-back, part 2's last frame)
   uv run --with numpy --with pillow python v1.5/checks/sheets.py /tmp/fyfilm/v15-check/probe-promo.json"""
import json
import os
import subprocess
import sys
import numpy as np
from PIL import Image, ImageDraw

here = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = '/tmp/fyfilm/v15-check'
os.makedirs(OUT, exist_ok=True)
FF = '/opt/homebrew/bin/ffmpeg'
promo, both = os.path.join(here, 'film-v1.5-promo.mp4'), os.path.join(here, 'film-v1.5.mp4')
c1, c2 = (json.load(open(os.path.join(here, n))) for n in ('cues-promo.json', 'cues-part2.json'))
PR = json.load(open(sys.argv[1]))
N1, N2 = round(c1['dur'] * 60), round(c2['dur'] * 60)
f = lambda t: int(round(t * 60))
s15 = next(s for s in c1['timeline'] if s.get('take') == 'take15-after')
u15 = lambda u: f(s15['t0'] + (u - s15['u0']))   # take15's footage second → promo frame (before its ramp)


def grab(path, ns):
    uniq = sorted(set(ns))
    sel = '+'.join(f'eq(n\\,{n})' for n in uniq)
    raw = subprocess.run([FF, '-v', 'error', '-i', path, '-vf', f'select={sel}', '-vsync', '0', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True).stdout
    got = dict(zip(uniq, np.frombuffer(raw, np.uint8).reshape(-1, 1080, 1920, 3)))
    return [got[n] for n in ns]


def sheet(name, path, items, cols=3, w=640):
    ims = grab(path, [n for n, _ in items]); h = w * 9 // 16; rows = (len(items) + cols - 1) // cols
    out = Image.new('RGB', (cols * w, rows * (h + 22)), 'white'); d = ImageDraw.Draw(out)
    for i, ((n, label), a) in enumerate(zip(items, ims)):
        x, y = (i % cols) * w, (i // cols) * (h + 22)
        out.paste(Image.fromarray(a).resize((w, h)), (x, y)); d.text((x + 4, y + h + 5), f'frame {n} · {n / 60:.2f} s · {label}', fill='black')
    out.save(os.path.join(OUT, name)); print('wrote', name)


def project(n, x, y):
    m = np.array(PR['frames'][n]['vp']).reshape(4, 4).T; c = m @ np.array([(x - 640) / 100, (500 - y) / 100, 0.3, 1.0]); q = c[:3] / c[3]
    pic = PR['layout']['pic']; return pic['x'] + (q[0] + 1) / 2 * pic['w'], pic['y'] + (1 - q[1]) / 2 * pic['h']


ramps = [c for c in c1['cues'] if c['type'] == 'ramp']
items = []
for r in ramps:
    items += [(f(r['t']) + 2, f"{r['name']}: slowing"), (f(sum(r['slow']) / 2), f"{r['name']}: mid, at 1/3"), (f(r['t'] + r['dur']) - 2, f"{r['name']}: real time again")]
sheet('ramps.png', promo, items)
caps = [c for c in c1['cues'] if c['type'] == 'caption']
lab = next(c for c in c2['cues'] if c['type'] == 'label')
sheet('captions.png', both, [(f(sum(c['motion']) / 2), f"caption {c['name']}, mid-motion") for c in caps] + [(N1 + f(lab['t']) + 1, 'part 2: the label fully in')], cols=4, w=480)

# the develop: three prints' photos (page px boxes in take15), cropped from the film, and their saturation
PRINTS = {'Antwerp': (112, 586, 228, 664), 'Hong Kong': (300, 610, 414, 690), 'Garden of the Gods': (1046, 588, 1164, 670)}
dev = [u15(u) for u in (3.55, 3.9, 4.3, 4.7, 5.1, 5.6)]
ims = grab(promo, dev); tile = Image.new('RGB', (6 * 200, 3 * 160 + 20), 'white'); d = ImageDraw.Draw(tile); sat = {}
for j, (nm, (x0, y0, x1, y1)) in enumerate(PRINTS.items()):
    for i, (n, a) in enumerate(zip(dev, ims)):
        (sx0, sy0), (sx1, sy1) = project(n, x0, y0), project(n, x1, y1)
        crop = a[int(sy0):int(sy1), int(sx0):int(sx1)].astype(np.float32)
        sat.setdefault(nm, []).append(round(float(np.mean(crop.max(2) - crop.min(2))), 1))
        tile.paste(Image.fromarray(crop.astype(np.uint8)).resize((196, 140)), (i * 200, j * 160))
        d.text((i * 200 + 3, j * 160 + 142), f'{nm} · frame {n}', fill='black')
tile.save(os.path.join(OUT, 'develop.png')); print('wrote develop.png; saturation by frame', dev, sat)

# the tab moves, every 4th frame, and the largest frame-to-frame change inside each against the calm around it
for name, a, b in (('building → shooting', 2.85, 3.55), ('shooting → about', 9.45, 10.25)):
    ns = list(range(u15(a), u15(b) + 1))
    g = [x.astype(np.float32).mean(2)[::8, ::8] for x in grab(promo, ns)]
    dif = [float(np.mean(np.abs(g[i] - g[i - 1]))) for i in range(1, len(g))]
    k = int(np.argmax(dif))
    print(f'tab move {name}: frames {ns[0]}–{ns[-1]}; largest change between frames {dif[k]:.1f} (at {ns[k + 1]}), '
          f'its neighbours {dif[k - 1]:.1f} and {dif[k + 1]:.1f}; {sum(1 for x in dif if x > 1)} frames in a row change by more than 1')
sheet('tabmoves.png', promo, [(n, 'building → shooting') for n in range(u15(2.85), u15(3.55) + 1, 6)] + [(n, 'shooting → about') for n in range(u15(9.45), u15(10.25) + 1, 6)], cols=5, w=384)
sheet('card.png', promo, [(u15(10.95), 'in its sleeve'), (u15(11.5), 'pulled: the stick'), (u15(11.9), 'the lip, the pop'), (u15(12.6), 'in the hand'),
                          (u15(13.55), 'turning'), (u15(14.4), 'turned: the night face')], cols=3, w=640)
p0, p1 = u15(6.30), u15(7.50)
sheet('peg.png', promo, [(n, 'print') for n in range(p0, p1 + 1, 6)] + [(p1, 'landed')], cols=4, w=480)
k = [p0 + 2, u15(6.8), p1 - 1]
crops = [Image.fromarray(a).crop((620, 0, 1500, 560)) for a in grab(promo, k)]
pc = Image.new('RGB', (880 * 3, 560), 'white'); d = ImageDraw.Draw(pc)
for i, (c, n) in enumerate(zip(crops, k)): pc.paste(c.resize((880, 560)), (i * 880, 0)); d.rectangle([i * 880, 0, i * 880 + 120, 14], fill='white'); d.text((i * 880 + 3, 2), f'frame {n}', fill='black')
pc.save(os.path.join(OUT, 'peg-crops.png')); print('wrote peg-crops.png', k)
land = next(c['t'] for c in c1['cues'] if c['type'] == 'landed')
sheet('endcard.png', promo, [(f(land) + 30, 'the last credit landed + 0.5 s'), (N1 - 1, "the promo's last frame")], cols=2, w=960)
Image.fromarray(grab(promo, [N1 - 1])[0]).resize((390, 219), Image.LANCZOS).save(os.path.join(OUT, 'phone-endcard.png'))
e0 = next(c['t'] for c in c2['cues'] if c['type'] == 'putback')
sheet('join.png', both, [(N1 - 1, 'part 1: last frame'), (N1, 'part 2: first frame'), (N1 + 36, 'the pull, 0.6 s'), (N1 + 48, 'the label in, 0.8 s'),
                         (N1 + 78, 'the whole page, 1.3 s'), (N1 + f(e0) + 30, 'the put-back'), (N1 + N2 - 1, 'part 2: last frame')], cols=4, w=480)
mad = lambda a, b: float(np.mean(np.abs(a.astype(np.float32) - b.astype(np.float32))))
a, b = grab(both, [N1 - 1, N1])
print(f"the join: frames {N1 - 1} → {N1} differ by {mad(a, b):.3f}; film-v1.5.mp4's last frame vs the promo's last frame: {mad(grab(promo, [N1 - 1])[0], grab(both, [N1 + N2 - 1])[0]):.3f} (0–255, RGB)")
