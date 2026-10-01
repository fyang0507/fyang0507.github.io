"""Adds the footage's motion to each session's meta.json, for the film's cues and sound.
   uv run --with numpy --with pillow python rec/analyze.py s1-home-writing-reading s2-building s3-gallery-about-home

- motion.after / motion.before: per frame, the mean absolute change from the previous frame (0–255 scale, on a
  160×125 copy), so a score can swell with what moves on screen.
- events: the after side's motion peaks (local maxima over 0.4 s, above a floor), each with its time and size.
- s1 only: seals: frames where the header's identity (x < 300, y < 130) changes after the OP ends (the motto written,
  then the two stamps)."""
import json
import sys
import numpy as np
from PIL import Image

ROOT = '/tmp/fyfilm/footage/'


def load(path):
    return np.asarray(Image.open(path).convert('L').resize((160, 125), Image.BILINEAR), dtype=np.float32)


for name in sys.argv[1:]:
    meta = json.load(open(ROOT + name + '/meta.json'))
    fps, N = meta['fps'], meta['frames']
    motion, hdr = {}, None
    for side in ('before', 'after'):
        prev, m, h = None, [], []
        for i in range(N):
            a = load(f'{ROOT}{name}/{side}/{i:06d}.jpg')
            if prev is None:
                m.append(0.0); h.append(0.0)
            else:
                d = np.abs(a - prev)
                m.append(round(float(d.mean()), 3))
                h.append(round(float(d[:16, :38].mean()), 3))   # the header's identity: x < 300, y < 130
            prev = a
        motion[side] = m
        if side == 'after':
            hdr = h
    meta['motion'] = motion
    arr = np.array(motion['after'])
    w, floor, ev = int(0.4 * fps), max(1.0, float(np.percentile(arr, 90))), []
    for i in range(1, N - 1):
        lo, hi = max(0, i - w), min(N, i + w + 1)
        if arr[i] >= floor and arr[i] == arr[lo:hi].max():
            ev.append({'t': round(i / fps, 3), 'size': round(float(arr[i]), 2)})
    meta['events'] = ev
    if name.startswith('s1'):
        op = next((b['t'] for b in meta['beats'] if b['name'] == 'op-done'), None)
        if op is not None:
            h = np.array(hdr)
            i0, i1 = int(op * fps), min(N, int((op + 5) * fps))
            idx = [i for i in range(i0, i1) if h[i] > 2.0]
            meta['seals'] = {'first_change': round(idx[0] / fps, 3) if idx else None, 'last_change': round(idx[-1] / fps, 3) if idx else None,
                             'peaks': [round(i / fps, 3) for i in range(i0 + 1, i1 - 1) if h[i] > 6 and h[i] >= h[i - 1] and h[i] >= h[i + 1]]}
    json.dump(meta, open(ROOT + name + '/meta.json', 'w'), indent=1)
    print(name, 'events', len(ev), 'seals', meta.get('seals'))
