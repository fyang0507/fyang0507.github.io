"""b-machine/score.py: the machine's beat, 100 BPM, made of the site's own sounds, placed from cues.json.

The paper is the rhythm section: a sheet landing and a crease closing are the kicks and snares, the fan turning is the
sweep, the stamped labels are the rim shots, pen ticks are the hats. Under it, a bass and a marimba in D minor
pentatonic. One beat of near-silence (the music and the ticks stop, only the room is left), then the seals.

    uv run --with numpy --with scipy python b-machine/score.py   (from design/2026-09-building/film)
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'kit'))
from sound import Mix, bass, click, felt, hz, marimba, paper, snap, stamp, tick, whoosh, lp, secs  # noqa: E402

here = os.path.dirname(os.path.abspath(__file__))
C = __import__('json').load(open(os.path.join(here, 'cues.json')))
dur, cues = C['dur'], C['cues']
B = 60 / next(c['bpm'] for c in cues if c['type'] == 'grid')
hush = next(c for c in cues if c['type'] == 'hush')
H0, H1 = hush['t'], hush['t'] + hush['dur']
m = Mix(dur)

# ---- foley, one sound per visible action
for c in cues:
    t, k = c['t'], c['type']
    if k == 'feed':
        m.add(paper(c['hit'] - t + .05, 400, 3800, .25), t, .55, -.1)
        m.add(snap(1.0), c['hit'], 1.0, 0)
        m.add(lp(snap(1.0), 400), c['hit'], .8, 0, .05)
    elif k == 'close':
        m.add(paper(c['hit'] - t + .06, 900, 6000, .5), t, .75, -.25)
        m.add(snap(.8), c['hit'], .85, -.15)
        m.add(click(2100, .6), c['hit'] + .004, .5, -.2)
    elif k == 'turn':
        m.add(whoosh(c['hit'] - t + .18), t, .8, .2)
        m.add(snap(.5), c['hit'] + .02, .5, .15)
    elif k == 'open':
        m.add(paper(c['hit'] - t + .04, 700, 5200, .45), t, .8, .25)
        m.add(snap(1.0), c['hit'], 1.0, .1)
        m.add(lp(snap(1.0), 380), c['hit'], .7, 0, .05)
        m.add(paper(.3, 300, 2200, .2), c['hit'] + .05, .35, .1)
    elif k == 'label':
        g = .5 if c.get('small') else 1
        m.add(stamp(.3 * g), t, 1, .3)
        m.add(click(1250, .7 * g), t, .8, .3)
    elif k == 'pan':
        m.add(whoosh(c['hit'] - t + .3), t, .3, .6)
    elif k == 'pull':
        m.add(whoosh(c['hit'] - t + .5), t, .3, -.4)
    elif k == 'stamp':
        m.add(stamp(1.0), t, 1.25, 0, .3)
        m.add(felt(hz('D2'), 3.2, .9), t + .01, .8, 0, .4)
        m.add(felt(hz('A2'), 3.0, .6), t + .01, .6, .1, .4)

# ---- the bed, on the same grid, stopping for the hush
beats = int(round(H0 / B))
line = ['D2', 'D2', 'Bb1', 'Bb1', 'F2', 'F2', 'C2', 'C2']
for b in range(0, beats, 2):
    at = b * B
    m.add(bass(hz(line[(b // 2) % 8]), min(B * 1.8, H0 - at), .75), at, .8, 0, .05)
# a quiet low thump on each bar's downbeat, the machine's pulse
for b in range(0, beats, 4):
    m.add(lp(snap(1.0), 180), b * B, .7, 0, 0)
# marimba ostinato on the off-beat eighths, entering at bar two, a figure that climbs with the sheets
fig = [['A3', 'D4', 'F4', 'D4'], ['A3', 'D4', 'G4', 'D4'], ['C4', 'F4', 'A4', 'F4'], ['C4', 'E4', 'G4', 'A4']]
for b in range(4, 16):
    bar = min(3, (b - 4) // 4 + 1)
    n = fig[bar][b % 4]
    m.add(marimba(hz(n), .9, .5), b * B + B / 2, .55, -.35 + .7 * ((b % 4) / 3), .25)
# the pen's ticks as the hats, on every eighth from bar two, dropping out for the hush
for i in range(8, int(H0 / (B / 2))):
    m.add(tick(.6 if i % 2 else .35), i * B / 2 + .003, .45, .45 if i % 2 else -.45, .05)

out = os.path.join('/tmp/fyfilm/b-scratch', 'mix.wav')
m.render(out, rt=.9)
print('wrote', out)
