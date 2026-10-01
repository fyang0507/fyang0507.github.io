"""v1.4/checks/sheets.py — contact sheets of the finished files, by exact frame number, into /tmp/fyfilm/v14-check/:
   ramps.png (each ramp: where it starts to slow, mid-⅓, where it's back to real time), captions.png (each caption on
   its motion, and part 2's label), peg.png (every 5th frame from the click to the landing) and peg-crops.png (the
   peg at full size on three of them), endcard.png (after the
   last credit line, and the last frame), join.png (part 1's last frame, part 2's first, the pull, and the landing).
   Also measures the join and the ending (mean absolute difference, 0–255).
   uv run --with numpy --with pillow python v1.4/checks/sheets.py   (from design/2026-09-building/film)"""
import json
import os
import subprocess
import numpy as np
from PIL import Image, ImageDraw

here = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = '/tmp/fyfilm/v14-check'
os.makedirs(OUT, exist_ok=True)
FF = '/opt/homebrew/bin/ffmpeg'
promo, both = os.path.join(here, 'film-v1.4-promo.mp4'), os.path.join(here, 'film-v1.4.mp4')
c1, c2 = (json.load(open(os.path.join(here, n))) for n in ('cues-promo.json', 'cues-part2.json'))
N1 = round(c1['dur'] * 60)


def grab(path, ns):
    """frames by number, as RGB arrays, in the order asked"""
    uniq = sorted(set(ns))
    sel = '+'.join(f'eq(n\\,{n})' for n in uniq)
    raw = subprocess.run([FF, '-v', 'error', '-i', path, '-vf', f'select={sel}', '-vsync', '0', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True).stdout
    fr = np.frombuffer(raw, np.uint8).reshape(-1, 1080, 1920, 3)
    got = dict(zip(uniq, fr))
    return [got[n] for n in ns]


def sheet(name, path, items, cols=3, w=640):
    ims = grab(path, [n for n, _ in items])
    h = w * 9 // 16
    rows = (len(items) + cols - 1) // cols
    out = Image.new('RGB', (cols * w, rows * (h + 22)), 'white'); d = ImageDraw.Draw(out)
    for i, ((n, label), a) in enumerate(zip(items, ims)):
        x, y = (i % cols) * w, (i // cols) * (h + 22)
        out.paste(Image.fromarray(a).resize((w, h)), (x, y)); d.text((x + 4, y + h + 5), f'frame {n} · {n / 60:.2f} s · {label}', fill='black')
    out.save(os.path.join(OUT, name)); print('wrote', name)


f = lambda t: int(round(t * 60))
ramps = [c for c in c1['cues'] if c['type'] == 'ramp']
items = []
for r in ramps:
    items += [(f(r['t']) + 2, f"{r['name']}: slowing"), (f(sum(r['slow']) / 2), f"{r['name']}: mid, at 1/3"), (f(r['t'] + r['dur']) - 2, f"{r['name']}: real time again")]
sheet('ramps.png', promo, items)
caps = [c for c in c1['cues'] if c['type'] == 'caption']
items = [(f(sum(c['motion']) / 2), f"caption {c['name']}, mid-motion") for c in caps] + [(f(c['t'] + .25), f"caption {c['name']}, just in") for c in caps]
lab = next(c for c in c2['cues'] if c['type'] == 'label')
items += [(N1 + f(lab['t']) + 1, 'part 2: the label fully in'), (N1 + f(8.0), 'part 2, mid-take')]
sheet('captions.png', both, items, cols=4, w=480)
pr = next(s for s in c1['timeline'] if s['name'] == 'print')
p0, p1 = f(pr['t0'] + 54.75 - pr['u0']), f(pr['t0'] + 55.60 - pr['u0'])
sheet('peg.png', promo, [(n, 'print') for n in range(p0, p1 + 1, 5)] + [(p1, 'landed')], cols=4, w=480)
# the peg at full size: on its rope, in flight, landed (crops of the picture's top, where it goes)
k = [p0 + 2, (p0 + p1) // 2 + 5, p1 - 1]
crops = [Image.fromarray(a).crop(box) for a, box in zip(grab(promo, k), [(560, 300, 1360, 720), (560, 0, 1360, 420), (560, 0, 1360, 420)])]
pc = Image.new('RGB', (800, 1260), 'white'); d = ImageDraw.Draw(pc)
for i, (c, n) in enumerate(zip(crops, k)): pc.paste(c, (0, i * 420)); d.rectangle([0, i * 420, 150, i * 420 + 16], fill='white'); d.text((4, i * 420 + 3), f'frame {n}', fill='black')
pc.save(os.path.join(OUT, 'peg-crops.png')); print('wrote peg-crops.png', k)
land = next(c['t'] for c in c1['cues'] if c['type'] == 'landed')
sheet('endcard.png', promo, [(f(land) + 30, 'the last credit line landed + 0.5 s'), (N1 - 1, 'the promo\'s last frame')], cols=2, w=960)
e0 = next(c['t'] for c in c2['cues'] if c['type'] == 'putback')
N2 = round(c2['dur'] * 60)
sheet('join.png', both, [(N1 - 1, 'part 1: last frame'), (N1, 'part 2: first frame'), (N1 + 36, 'the pull, 0.6 s'), (N1 + 48, 'the label in, 0.8 s'),
                         (N1 + 78, 'the whole page, 1.3 s'), (N1 + f(e0) + 30, 'the put-back'), (N1 + N2 - 1, 'part 2: last frame')], cols=4, w=480)

def mad(a, b): return float(np.mean(np.abs(a.astype(np.float32) - b.astype(np.float32))))
a, b = grab(both, [N1 - 1, N1])
pl, bl = grab(promo, [N1 - 1])[0], grab(both, [N1 + N2 - 1])[0]
print(f'the join: frames {N1 - 1} → {N1} differ by {mad(a, b):.3f}; film-v1.4.mp4\'s last frame vs the promo\'s last frame: {mad(pl, bl):.3f} (0–255, RGB)')
