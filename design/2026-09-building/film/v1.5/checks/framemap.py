"""v1.5/checks/framemap.py (v1.4's, with each sheet's take): footage time never goes back or repeats on any sheet,
every ramp frame is a new true frame, and the speed curve has no step. A sheet's frames are compared only within its take.
   python3 v1.5/checks/framemap.py /tmp/fyfilm/v15-check/probe-promo.json"""
import json
import sys

p = json.load(open(sys.argv[1]))
F, TL = p['frames'], p['timeline']
idx = lambda f: int(f.split('.')[0]) if f else None
fr = lambda t: int(round(t * 60 + 1e-6))
bad = []
# the sheet in front, shot by shot and across the jumps (a jump's front sheet goes on from the shot before it,
# and the sheet under it goes on into the shot after it)
seq = [(i, f['k'], idx(f['fa']), idx(f['fn']), f['take'], f['nextTake']) for i, f in enumerate(F)]
for i in range(1, len(seq)):
    a, b = seq[i - 1], seq[i]
    if b[1] == 'end' and b[2] == a[2] and a[1] == 'end': continue   # counted below: the take has ended under the pull
    if a[1] == 'jump' and b[1] == 'play':
        if b[4] != a[5] or b[2] <= a[3]: bad.append(('under sheet into the shot', i, a[3], b[2]))
    elif b[4] != a[4] or b[2] <= a[2]: bad.append(('front sheet', i, a[2], b[2]))
    if a[1] == 'jump' and b[1] == 'jump' and b[3] <= a[3]: bad.append(('under sheet', i, a[3], b[3]))
e0 = next(s['t0'] for s in TL if s['k'] == 'end')
held = [i for i in range(1, len(seq)) if seq[i][1] == 'end' and seq[i][2] == seq[i - 1][2] and i / 60 < e0 + 1.4]   # while the leaving sheet is still in frame
print(f'{len(F)} frames; footage repeats or goes back: {len(bad)} {bad[:8]}')
print(f'the end: the take runs on under the pull and ends at frame {held[0] - 1 if held else "-"}; its last footage frame stays on the leaving sheet for its last {len(held)} frames in view ({len(held) / 60:.2f} s), as the sheet goes off the left')
for s in TL:
    if 'ramp' not in s: continue
    r = s['ramp']
    ra = [i for i, f in enumerate(F) if f['name'] == s['name'] and f['k'] == 'play' and f['speed'] < 1 - 1e-9]
    i0, i1 = ra[0], ra[-1]
    steps = [idx(F[i]['fa']) - idx(F[i - 1]['fa']) for i in range(i0, i1 + 2)]
    sp = [F[i]['speed'] for i in range(i0 - 1, i1 + 2)]
    ds = max(abs(sp[i] - sp[i - 1]) for i in range(1, len(sp)))
    slow = [i for i in ra if abs(F[i]['speed'] - r['smin']) < 1e-9]
    print(f"ramp {s['name']}: footage {r['a']}–{r['d']} s, film frames {i0}–{i1} ({(i1 - i0 + 1) / 60:.2f} s); min speed {min(f['speed'] for f in F[i0:i1 + 1]):.4f} "
          f"(= ⅓ for {len(slow)} frames); ease in {r['Ti']:.3f} s, hold {r['Th']:.3f} s, ease out {r['To']:.3f} s; "
          f"capture frames per output frame {min(steps)}–{max(steps)} (never 0); largest speed change between frames {ds:.4f} (continuous: no step)")
