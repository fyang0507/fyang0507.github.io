"""v1.5/sbs_sync.py — the side-by-side's before panel, timed to the promo: writes sbs-sync.json.
   uv run --with numpy --with pillow python v1.5/sbs_sync.py   (from design/2026-09-building/film, after the promo's cues)

Every click lands at the same film time on both sides. Each of the promo's play shots is paired with the before take
(take15-before, 6237120): every click the promo makes there has the before's click of the same name (the book, the
lead card, Principles, the shooting tab, the print and its close, the about tab, home), and the before is anchored on
them. Between two clicks the before plays its own take in real time. Where its gap is shorter than the promo's, it
holds a frame; where it's longer, a stretch is left out. Either way it happens in its dead time: the last moment
before its hand starts for the next click, when the pointer is still and the page has settled (checked here on the
frames). The pull-card and the flip have no partner: the old About is a page with nothing to pull or turn, so the
before holds on it. Before the first shot's end there is no click, so the before plays from its own start.
Out: per play shot, segments [t0, t1, u0, rate] (film s → footage s: u = u0 + rate·(t − t0), rate 1 or 0), and the
pairs with the frame each click lands on, on each side."""
import json
import os
import numpy as np
from PIL import Image

here = os.path.dirname(os.path.abspath(__file__))
c1 = json.load(open(os.path.join(here, 'cues-promo.json')))
BT = '/tmp/fyfilm/cap/take15-before'
bm = json.load(open(BT + '/meta.json'))
END = bm['dur']
press_of = lambda presses, t: min((p for p in presses if t - 1e-6 <= p <= t + 0.3), default=None)
B = {b['name']: press_of(bm['presses'], b['t']) for b in bm['beats'] if press_of(bm['presses'], b['t']) is not None}
plays = [s for s in c1['timeline'] if s['k'] == 'play']
after = [c for c in c1['cues'] if c['type'] == 'site' and c['kind'] in ('click', 'nav', 'drag')]
press = [c for c in c1['cues'] if c['type'] == 'press']


def still(a, b):
    """the last still moment before the hand leaves for the next click: the end of the longest stretch in (a, b) where
    the pointer doesn't move, checked on the frames (a mean change under 0.05 of 255)"""
    fr = [f for f in bm['frames'] if a + 0.15 <= f[1] <= b - 0.15]
    best, s = (0, None, None), None
    for p, f in zip(fr, fr[1:]):
        if abs(f[3] - p[3]) < .3 and abs(f[4] - p[4]) < .3:
            s = p[1] if s is None else s
            if f[1] - s > best[0]: best = (f[1] - s, s, f[1])
        else: s = None
    lum = lambda t: np.asarray(Image.open(BT + '/f/' + min(bm['frames'], key=lambda f: abs(f[1] - t))[0]).convert('L').resize((320, 250)), dtype=np.float32)
    return best[1], best[2], float(np.mean(np.abs(lum(best[2] - .05) - lum(best[2] - .25))))


out, pairs, prev_end = [], [], 0.0
for s in plays:
    # the promo's clicks in this shot, by name, with their film times
    ps = []
    for c in after:
        if not (s['t0'] <= c['t'] < s['t1']): continue
        p = next(x for x in press if x['take'] == c['take'] and c['u'] - 1e-6 <= x['u'] <= c['u'] + 0.3)
        ps.append((c['name'], p['t'], B.get(c['name'])))
    sync = [(a, b, n) for n, a, b in ps if b is not None]
    pairs += [{'name': n, 'after_t': a, 'before_u': b} for n, a, b in ps]
    segs = []
    if not sync:   # the OP: the before's own first visit, from its start
        segs.append([s['t0'], s['t1'], max(prev_end, s['t0']), 1])
    else:
        a0, b0, _ = sync[0]
        t, u = s['t0'], b0 - (a0 - s['t0'])
        for (a1, b1, n1) in sync[1:]:
            g = (a1 - t) - (b1 - u)   # > 0: the promo's gap is longer, so the before holds; < 0: it leaves out
            q0, q1, calm = still(b0, b1)
            q = q1 - .05
            if g >= 0:
                segs += [[t, t + (q - u), u, 1], [t + (q - u), t + (q - u) + g, q, 0]]
                t, u = t + (q - u) + g, q
            else:
                cut = min(-g, q1 - q0 - .1); qa = (q0 + q1 - cut) / 2
                segs.append([t, t + (qa - u), u, 1]); t, u = t + (qa - u), qa + cut
            segs[-1].append({'still': [round(q0, 3), round(q1, 3)], 'change': round(calm, 3), 'gap': round(g, 3)})
            a0, b0 = a1, b1
        segs.append([t, s['t1'], u, 1])
    # never past the take's end, and never past where the next shot starts (footage only goes forward)
    nxt = next((x for x in plays if x['t0'] > s['t0']), None)
    lim = END
    if nxt is not None:
        na = next(((c['t'], B.get(c['name'])) for c in after if nxt['t0'] <= c['t'] < nxt['t1'] and B.get(c['name']) is not None), None)
        if na:
            p = next(x for x in press if nxt['t0'] <= x['t'] < nxt['t1'] and abs(x['t'] - na[0]) < 0.31)
            lim = min(lim, na[1] - (p['t'] - nxt['t0']))
    fixed = []
    for sg in segs:
        t0, t1, u0, r = sg[:4]
        if r and u0 + (t1 - t0) > lim:
            tc = t0 + max(0, lim - u0)
            if tc > t0: fixed.append([t0, tc, u0, 1] + sg[4:])
            fixed.append([tc, t1, min(u0, lim) if tc == t0 else lim, 0])
        else: fixed.append(sg)
    prev_end = fixed[-1][2] + (fixed[-1][1] - fixed[-1][0]) * fixed[-1][3]
    out.append({'shot': s['name'] or 'op', 't0': s['t0'], 't1': s['t1'], 'segments': fixed})

def before_at(t):
    for sh in out:
        for sg in sh['segments']:
            if sg[0] - 1e-9 <= t < sg[1] + 1e-9: return sg[2] + (t - sg[0]) * sg[3]
    return None
for p in pairs:
    p['after_frame'] = int(round(p['after_t'] * 60))
    if p['before_u'] is None: p['before_frame'] = None; continue
    # the first frame on which the before's footage has reached its press
    n = next(i for i in range(int(p['after_t'] * 60) - 120, int(p['after_t'] * 60) + 120) if (before_at(i / 60) or -1) >= p['before_u'] - 1e-6)
    p['before_frame'] = n
    p['after_frame_first'] = next(i for i in range(p['after_frame'] - 3, p['after_frame'] + 3) if i / 60 >= p['after_t'] - 1e-6)
json.dump({'take': 'take15-before', 'shots': out, 'pairs': pairs}, open(os.path.join(here, 'sbs-sync.json'), 'w'), indent=1)
for p in pairs: print(f"{p['name']:16s} promo frame {p.get('after_frame_first', p['after_frame'])}  before frame {p['before_frame']}")
for sh in out:
    for sg in sh['segments']: print(sh['shot'], [round(x, 3) if isinstance(x, float) else x for x in sg])
