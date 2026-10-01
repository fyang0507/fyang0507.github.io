"""v1.2's score: v1.1's, plus the comparison's two stamps (a dry one for BEFORE, a fuller one for AFTER).

v1.1's score: v1's (../v1/score.py), on v1.1's take, where everything from the way back on is 7.7 s later
and Demos brings its own sounds (the chapter move, the pen's corners, the enlargement, a step, put back).

v1's score. Reads v1/cues.json (the film's clock: every shot, every input sent to the site, every move of the film's
own paper) and writes v1/mix.wav.   uv run --with numpy --with scipy python v1/score.py

The arc: a felt piano alone through home, Writing and Reading; a low string joins at Building; fullest through the
Gallery and About; piano again for the way home; the pen alone under the last sheet. Chords are held over two bars
with changing voicings, never re-struck every bar. Near-silences come before the OP's first cut, the desk → nav flight,
#35's tabs and the stamps. The old site's hard cuts duck the bed 6 dB, so a cut sounds like a cut. The page's own
foley (lift, fall) sits 8-10 dB under the site's, in four variants. The last note decays to silence inside the film."""
import os
import sys
import numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'kit'))
D, AT = 7.7, 38.15   # v1.1's take: the way back and everything after it moved by D
from sound import *  # noqa: E402,F403

here = os.path.dirname(__file__)
CUES = sys.argv[1] if len(sys.argv) > 1 else os.path.join(here, 'cues.json')
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(here, 'mix.wav')
cue = cues(CUES)
DUR, C, TL = cue['dur'], cue['cues'], cue['timeline']
m = Mix(DUR)
bed = Mix(DUR)   # the music on its own bus, so it can be ducked and silenced

plays = [s for s in TL if s['k'] == 'play']
def film(u):
    for s in plays:
        if s['u0'] <= u < s['u1']: return s['t0'] + (u - s['u0'])
    return None
def shot(name): return [s for s in TL if s.get('name') == name]
lifts = [s for s in TL if s['k'] == 'lift']
replays = [s for s in TL if s['k'] == 'replay']
end = [s for s in TL if s['k'] == 'end'][0]

# ---- the site's own sounds, at the take's events (footage seconds, from its motion and its beats)
SITE = [
    (0.20, 'op'), (0.55, 'op'), (0.9, 'op'), (1.25, 'op'), (1.72, 'fall'), (4.47, 'seal1'), (4.73, 'seal2'), (7.49, 'flight'),
    (10.25, 'retitle'), (11.77, 'pull'), (13.2, 'cut'), (14.5, 'dissolve'), (19.4, 'pen'), (23.15, 'tab'), (23.95, 'flower'),
    (25.3, 'fling'), (26.3, 'fling'), (28.75, 'pinpop'), (29.0, 'dossier'), (31.54, 'tabs'), (32.2, 'rail'), (38.35, 'tuck'),
    (39.2, 'pin'), (41.6, 'tab'), (42.0, 'develop'), (44.6, 'swing'), (47.2, 'unclip'), (49.9, 'clipback'), (51.3, 'tab'),
    (54.5, 'sleeve'), (55.0, 'lip'), (55.35, 'pop'), (59.75, 'gravity'),
]
SITE = [((u + D) if u >= AT - 1e-6 else u, k) for u, k in SITE] + [
    (37.62, 'chapter'), (40.55, 'corners'), (40.95, 'enlarge'), (42.35, 'step'), (43.45, 'putback')]
rngv = np.random.default_rng(7)
for u, k in SITE:
    t = film(u)
    if t is None: continue
    if k == 'op': m.add(snap(.9), t, .55, (rngv.random() - .5) * .6, .08)
    elif k == 'fall':
        for j, dt in enumerate((0, .1, .19, .3, .38)): m.add(snap(.35 + .1 * (j % 2)), t + dt, .32, (j - 2) * .25, .15)
    elif k in ('seal1', 'seal2'): m.add(stamp(.55 if k == 'seal1' else .42), t, .8, -.25, .2)
    elif k == 'flight': m.add(whoosh(.62, 1), t, .55, .25, .2)
    elif k == 'retitle': m.add(tick(.8), t, .35, .3, .05)
    elif k == 'pull': m.add(paper(.5, 500, 3600, .3), t, .32, -.35, .15)
    elif k == 'cut': m.add(snap(.5), t, .28, 0, .1)
    elif k == 'dissolve': m.add(paper(2.4, 250, 1800, .05), t, .12, 0, .3)
    elif k == 'pen': m.add(pen(.85, bright=.9), t, .3, .1, .12)
    elif k == 'tab': m.add(whoosh(.55, .8), t, .42, .3, .2); m.add(click(3000, .5), t + .45, .3, .3, .1)
    elif k == 'flower': m.add(pin(.5), t, .35, -.3, .1)
    elif k == 'fling': m.add(paper(.7, 300, 2400, .2), t, .3, 0, .2)
    elif k == 'pinpop': m.add(pin(.9), t, .6, -.2, .12); m.add(click(2400, .7), t + .02, .35, -.2, .1)
    elif k == 'dossier': m.add(paper(1.1, 400, 3200, .35), t, .38, .1, .2)
    elif k == 'tabs': m.add(whoosh(.4, .7), t, .45, .35, .2)
    elif k == 'rail': m.add(pen(1.3, bright=.8), t, .25, -.35, .12)
    elif k == 'tuck': m.add(whoosh(.5, .7), t, .38, -.2, .2)
    elif k == 'pin': m.add(pin(1.0), t, .7, -.15, .12)
    elif k == 'develop': m.add(paper(1.4, 180, 900, 0), t, .08, 0, .3)
    elif k == 'swing': m.add(paper(1.2, 300, 2200, .1), t, .22, 0, .2)
    elif k == 'unclip': m.add(click(2600, 1), t, .6, .15, .12); m.add(thrum(73.4, 1.3), t + .05, .4, 0, .1)
    elif k == 'clipback': m.add(click(3000, .8), t, .5, .15, .1); m.add(thrum(73.4, 1.0), t + .04, .3, 0, .1)
    elif k == 'sleeve': m.add(paper(1.2, 500, 3400, .4), t, .35, .1, .15)
    elif k == 'lip': m.add(snap(.35), t, .3, .1, .1)
    elif k == 'pop': m.add(snap(.6), t, .4, .1, .1)
    elif k == 'chapter': m.add(paper(.55, 500, 3600, .35), t, .38, -.3, .15); m.add(whoosh(.45, .6), t + .05, .3, -.3, .15)
    elif k == 'corners': m.add(pen(.45, bright=1.0), t, .28, .2, .1)
    elif k == 'enlarge': m.add(paper(.3, 700, 4200, .3), t, .32, .1, .12); m.add(snap(.35), t + .2, .28, .1, .1)
    elif k == 'step': m.add(paper(.35, 600, 3600, .2), t, .28, .3, .12); m.add(pen(.35, bright=1.0), t + .15, .2, .3, .1)
    elif k == 'putback': m.add(paper(.3, 700, 4200, .3), t, .28, .1, .12); m.add(snap(.3), t + .22, .24, .1, .1)
    elif k == 'gravity':
        m.add(whoosh(.55, .8), t, .45, 0, .2)
        for j, dt in enumerate((.32, .4, .47, .56, .62)): m.add(snap(.42), t + dt, .32, (j - 2) * .3, .15)
# the input itself: a soft click under every press sent to the site
for c in C:
    if c['type'] == 'site' and c.get('kind') in ('click', 'nav'): m.add(click(3400, .5), c['t'] + .1, .22, .15, .05)

# ---- the film's own paper, 8-10 dB under the site's: the page lifted and let fall, four variants
for i, s in enumerate(lifts):
    v = i % 4
    m.add(paper(.32 + .04 * v, 700 + 150 * v, 4200 - 200 * v, .3), s['t0'], .13, .35 - .1 * v, .12)
    m.add(paper(.22, 900, 4200, .3), s['t1'] - .42, .1, .3, .1); m.add(snap(.35 + .05 * v), s['t1'] - .1, .12, .3, .1)
# the old site's clicks inside a lift, and its hard cut
for c in C:
    if c['type'] == 'before' and c.get('kind') in ('click', 'nav'): m.add(click(3100, .6), c['t'] + .1, .3, -.1, .05); m.add(snap(.6), c['t'] + .25, .3, -.1, .05)
m.add(paper(.9, 350, 2400, .3), .45, .4, -.3, .2); m.add(snap(.7), 1.25, .35, -.4, .2)   # the cover
m.add(whoosh(1.1, 1), end['t0'] - .25, .42, -.4, .2); m.add(paper(1.4, 500, 3600, .3), end['t0'] - .2, .28, -.2, .2)   # the pull (J-cut)
for c in C:
    if c['type'] == 'stroke': m.add(pen(max(.05, c['dur']), bright=.85), c['t'], .38, 0, .12)
    elif c['type'] == 'stamp': m.add(stamp(c.get('k', 1)), c['t'], 1.0, -.1, .2)
    elif c['type'] == 'line': m.add(click(1900, .9), c['t'], .28, .1, .1)
    elif c['type'] == 'chapter': m.add(pen(.7, bright=.95), c['t'], .16, -.45, .1)
    elif c['type'] == 'label': m.add(stamp(.3 if c.get('name') == 'before' else .42), c['t'], .5 if c.get('name') == 'before' else .62, .25, .12)

# ---- music: sections by film time
B = 60 / 76
e0 = end['t0']
bld = (shot('building') or [{'t0': film(23.2) or e0 * .3}])[0]['t0']; gal = film(41.6 + D) or (film(46.8 + D) or e0 * .6); hom = (shot('home') or [{'t0': film(59.4 + D) or e0 * .8}])[0]['t0']
sections = [(0.0, bld, 'piano'), (bld, gal, 'string'), (gal, hom, 'full'), (hom, e0 + .6, 'piano')]
voicings = [('D2', ['F#3', 'A3', 'D4', 'E4']), ('B1', ['F#3', 'B3', 'D4']), ('G1', ['D3', 'B3', 'D4', 'A4']), ('A1', ['E3', 'C#4', 'A4']),
            ('D2', ['A3', 'D4', 'F#4']), ('E2', ['G#3', 'B3', 'E4']), ('G1', ['B3', 'D4', 'G4']), ('A1', ['C#4', 'E4', 'A4'])]
def felt_n(n, at, dur, vel, pan): bed.add(felt(hz(n), dur, vel), at, 1.0, pan, .38)
t, i = 0.6, 0
while t < e0 - .2:
    kind = next((k for a, b, k in sections if a <= t < b), 'piano')
    root, ch = voicings[i % len(voicings)]
    hold = 8 * B                                   # two bars of 4
    for j, n in enumerate(ch): felt_n(n, t + j * .07, hold + 1.5, .26 if kind == 'piano' else .3, (j - 1.5) * .25)
    if kind in ('string', 'full'): bed.add(lp(ks(hz(root) * 2, hold + 1, .998, .25), 700), t, .5, 0, .2)
    if kind == 'full': felt_n(ch[-1].replace('4', '5').replace('3', '5'), t + 4 * B, 3.0, .16, .35); bed.add(marimba(hz(ch[0].replace('3', '4')), 1.0, .3), t + 6 * B, .6, -.3, .2)
    t += hold; i += 1
# the OP's bright chord, answered by the site's saturated moment
for j, n in enumerate(['D5', 'F#5', 'A5', 'E6']): felt_n(n, 1.2 + j * .05, 2.4, .22, (j - 1.5) * .25)
# replays: one held note under the slow motion
for s in replays: felt_n('A4', s['t0'] + .05, s['t1'] - s['t0'] + 1.2, .18, .2)
# the end: the tonic under the stamps, the last note left to ring out inside the film
st = [c['t'] for c in C if c['type'] == 'stamp']
bed.add(bass(hz('D2'), 3.0, .5), st[0], 1.0, 0, .2)
felt_n('D4', st[0] + .02, 4.5, .32, -.1); felt_n('A4', st[-1] + .02, 4.2, .28, .15); felt_n('D5', st[-1] + 1.0, max(1.5, DUR - st[-1] - 1.1), .22, .1)

# ---- the bed's dynamics: near-silences before the four peaks, ducks under the old site's hard cuts, fades
n = bed.n; g = np.ones(n)
def ramp(a, b, v0, v1):
    i0, i1 = max(0, secs(a)), min(n, secs(b))
    if i1 > i0: g[i0:i1] = np.minimum(g[i0:i1], np.linspace(v0, v1, i1 - i0))
def hole(t, pre=.7, post=.25):   # a near-silence before t
    ramp(t - pre - .25, t - pre, 1, .02); ramp(t - pre, t, .02, .02); ramp(t, t + post, .02, 1)
op_cut = film(0.20); fl = film(7.49); tb = film(31.54)
for x in (op_cut, fl, tb, st[0]):
    if x: hole(x)
for c in C:
    if c['type'] == 'before' and c.get('kind') in ('click', 'nav'): ramp(c['t'] + .2, c['t'] + .3, 1, .5); ramp(c['t'] + .3, c['t'] + 1.1, .5, .5); ramp(c['t'] + 1.1, c['t'] + 1.4, .5, 1)
ramp(e0 + .4, e0 + 1.4, 1, .0)     # the pen alone under the last sheet (only the stamp's notes come back)
g[secs(st[0]) - secs(.05):] = 1.0
# the last 2.2 s decay to -60 dB exactly at the film's last frame, and nothing after it
fade = np.zeros(n); i0, i1 = secs(DUR - 2.2), secs(DUR); fade[:i0] = 1; fade[i0:i1] = np.exp(-np.linspace(0, 6.9, i1 - i0))
bed.dry *= g; bed.wet *= g
m.dry += bed.dry * .9; m.wet += bed.wet * .9
m.dry *= fade; m.wet *= fade
y = m.render(OUT, rt=1.4)
print('wrote mix.wav', round(DUR, 2), 's')
