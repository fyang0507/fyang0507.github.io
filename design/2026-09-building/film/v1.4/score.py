"""v1.4's promo score: v1.1's (../v1.1/score.py) on v1.4's cut. Reads cues-promo.json, writes a wav (finish.py sets
its loudness).   uv run --with numpy --with scipy python v1.4/score.py v1.4/cues-promo.json out.wav

What changed from v1.1's:
· The site's own foley follows the ramped picture. Every sound is placed at its footage second's film time through
  the ramp (the timeline's map), and a sound that lasts through a ramp is stretched to last as long on screen: the
  flight's whoosh, the tabs' whoosh, the gravity return's whoosh and its five landings, each at its own slowed time.
· Under each ramp's slow part, one held note (v1.1 had one under each replay).
· No pen under chapter names (there are none) and no cover (the promo opens on the open dossier).
· A quiet paper swish under each jump, the film's own paper, 10 dB under the site's.
Everything else is v1.1's: the felt piano, the string from a third of the way in, the fullest bed from the print, the
near-silences before the OP's first cut, the flight, the tabs and the stamps, the pen and the stamps on the last sheet."""
import os
import sys
import numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'kit'))
from sound import *  # noqa: E402,F403

cue = cues(sys.argv[1])
OUT = sys.argv[2]
DUR, C, TL = cue['dur'], cue['cues'], cue['timeline']
m = Mix(DUR)
bed = Mix(DUR)

plays = [s for s in TL if s['k'] == 'play']
def film(u):
    """film time of footage second u, through the shot's ramp if it has one (None outside the cut)"""
    for s in plays:
        if s['u0'] <= u < s['u1']:
            if 'map' in s:
                t, uu = zip(*s['map']); return float(np.interp(u, uu, t))
            return s['t0'] + (u - s['u0'])
    return None
def span(u, d):
    """how long footage u → u + d lasts on screen"""
    a, b = film(u), film(u + d)
    return (b - a) if a is not None and b is not None else d
end = [s for s in TL if s['k'] == 'end'][0]
ramps = [c for c in C if c['type'] == 'ramp']

# ---- the site's own sounds, at the take's events (footage seconds: v1.1's list, where the way back moved by 7.7)
D, AT = 7.7, 38.15
SITE = [(0.20, 'op'), (0.55, 'op'), (0.9, 'op'), (1.25, 'op'), (1.72, 'fall'), (4.47, 'seal1'), (4.73, 'seal2'), (7.49, 'flight'),
        (28.75, 'pinpop'), (29.0, 'dossier'), (31.54, 'tabs'), (32.2, 'rail'), (47.2, 'unclip'), (59.75, 'gravity')]
SITE = [((u + D) if u >= AT - 1e-6 else u, k) for u, k in SITE]
rngv = np.random.default_rng(7)
for u, k in SITE:
    t = film(u)
    if t is None: continue
    if k == 'op': m.add(snap(.9), t, .55, (rngv.random() - .5) * .6, .08)
    elif k == 'fall':
        for j, dt in enumerate((0, .1, .19, .3, .38)): m.add(snap(.35 + .1 * (j % 2)), film(u + dt), .32, (j - 2) * .25, .15)
    elif k in ('seal1', 'seal2'): m.add(stamp(.55 if k == 'seal1' else .42), t, .8, -.25, .2)
    elif k == 'flight': m.add(whoosh(span(u, .62), 1), t, .55, .25, .2)
    elif k == 'pinpop': m.add(pin(.9), t, .6, -.2, .12); m.add(click(2400, .7), t + .02, .35, -.2, .1)
    elif k == 'dossier': m.add(paper(1.1, 400, 3200, .35), t, .38, .1, .2)
    elif k == 'tabs': m.add(whoosh(span(u, .4), .7), t, .45, .35, .2)
    elif k == 'rail': m.add(pen(1.3, bright=.8), t, .25, -.35, .12)
    elif k == 'unclip': m.add(click(2600, 1), t, .6, .15, .12); m.add(thrum(73.4, 1.3), t + .05, .4, 0, .1)
    elif k == 'gravity':
        m.add(whoosh(span(u, .55), .8), t, .45, 0, .2)
        for j, dt in enumerate((.32, .4, .47, .56, .62)): m.add(snap(.42), film(u + dt), .32, (j - 2) * .3, .15)
# the input itself: a soft click under every press sent to the site
for c in C:
    if c['type'] == 'press': m.add(click(3400, .5), c['t'], .22, .15, .05)

# ---- the film's own paper: the jumps, and the last pull (J-cut)
for c in C:
    if c['type'] == 'pull' and c['dur'] < 1: m.add(paper(.55, 600, 3800, .3), c['t'] + .02, .12, -.35, .12)
m.add(whoosh(1.1, 1), end['t0'] - .25, .42, -.4, .2); m.add(paper(1.4, 500, 3600, .3), end['t0'] - .2, .28, -.2, .2)
for c in C:
    if c['type'] == 'stroke': m.add(pen(max(.05, c['dur']), bright=.85), c['t'], .38, 0, .12)
    elif c['type'] == 'stamp': m.add(stamp(c.get('k', 1)), c['t'], 1.0, -.1, .2)
    elif c['type'] == 'line': m.add(click(1900, .9), c['t'], .28, .1, .1)

# ---- music: sections by film time, as v1.1's short cut had them
B = 60 / 76
e0 = end['t0']
bld, gal, hom = e0 * .3, film(54.5), film(67.1)
sections = [(0.0, bld, 'piano'), (bld, gal, 'string'), (gal, hom, 'full'), (hom, e0 + .6, 'piano')]
voicings = [('D2', ['F#3', 'A3', 'D4', 'E4']), ('B1', ['F#3', 'B3', 'D4']), ('G1', ['D3', 'B3', 'D4', 'A4']), ('A1', ['E3', 'C#4', 'A4']),
            ('D2', ['A3', 'D4', 'F#4']), ('E2', ['G#3', 'B3', 'E4']), ('G1', ['B3', 'D4', 'G4']), ('A1', ['C#4', 'E4', 'A4'])]
def felt_n(n, at, dur, vel, pan): bed.add(felt(hz(n), dur, vel), at, 1.0, pan, .38)
t, i = 0.6, 0
while t < e0 - .2:
    kind = next((k for a, b, k in sections if a <= t < b), 'piano')
    root, ch = voicings[i % len(voicings)]
    hold = 8 * B
    for j, n in enumerate(ch): felt_n(n, t + j * .07, hold + 1.5, .26 if kind == 'piano' else .3, (j - 1.5) * .25)
    if kind in ('string', 'full'): bed.add(lp(ks(hz(root) * 2, hold + 1, .998, .25), 700), t, .5, 0, .2)
    if kind == 'full': felt_n(ch[-1].replace('4', '5').replace('3', '5'), t + 4 * B, 3.0, .16, .35); bed.add(marimba(hz(ch[0].replace('3', '4')), 1.0, .3), t + 6 * B, .6, -.3, .2)
    t += hold; i += 1
for j, n in enumerate(['D5', 'F#5', 'A5', 'E6']): felt_n(n, 1.2 + j * .05, 2.4, .22, (j - 1.5) * .25)   # the OP's bright chord
# the ramps: one held note under each slow part
for r in ramps: felt_n('A4', r['slow'][0] + .02, r['slow'][1] - r['slow'][0] + 1.2, .18, .2)
# the end: the tonic under the stamps, the last note left to ring out inside the film
st = [c['t'] for c in C if c['type'] == 'stamp']
bed.add(bass(hz('D2'), 3.0, .5), st[0], 1.0, 0, .2)
felt_n('D4', st[0] + .02, 4.5, .32, -.1); felt_n('A4', st[-1] + .02, 4.2, .28, .15); felt_n('D5', st[-1] + 1.0, max(1.5, DUR - st[-1] - 1.1), .22, .1)

# ---- the bed's dynamics: near-silences before the four peaks, fades
n = bed.n; g = np.ones(n)
def ramp(a, b, v0, v1):
    i0, i1 = max(0, secs(a)), min(n, secs(b))
    if i1 > i0: g[i0:i1] = np.minimum(g[i0:i1], np.linspace(v0, v1, i1 - i0))
def hole(t, pre=.7, post=.25):
    ramp(t - pre - .25, t - pre, 1, .02); ramp(t - pre, t, .02, .02); ramp(t, t + post, .02, 1)
for x in (film(0.20), film(7.49), film(31.54), st[0]):
    if x: hole(x)
ramp(e0 + .4, e0 + 1.4, 1, .0)     # the pen alone under the last sheet (only the stamp's notes come back)
g[secs(st[0]) - secs(.05):] = 1.0
fade = np.zeros(n); i0, i1 = secs(DUR - 2.2), secs(DUR); fade[:i0] = 1; fade[i0:i1] = np.exp(-np.linspace(0, 6.9, i1 - i0))
bed.dry *= g; bed.wet *= g
m.dry += bed.dry * .9; m.wet += bed.wet * .9
m.dry *= fade; m.wet *= fade
m.render(OUT, rt=1.4)
print('wrote', OUT, round(DUR, 2), 's')
