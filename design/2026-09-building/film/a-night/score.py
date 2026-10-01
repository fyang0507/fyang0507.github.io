"""A · One night, many hands: the score. Reads a-night/cues.json (exported by the page) and writes a-night/mix.wav.
   uv run --with numpy --with scipy python a-night/score.py

A quiet night in D major at 72 BPM. Felt piano on the grid, one three-note figure per print as it's bitten (each a step
higher: the night going on), a low string under each bite. The motto is written in a near-silence, pen only; the
stamps land on the tonic, and the last note rings past the end (the L-cut into the next scene)."""
import os
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'kit'))
from sound import *  # noqa: E402,F403

here = os.path.dirname(__file__)
cue = cues(os.path.join(here, 'cues.json'))
B = 60 / 72
m = Mix(cue['dur'])

# ---- foley, from the picture's own cues
pan_of = {0: -.35, 1: 0.0, 2: .35}
for c in cue['cues']:
    t, k = c['t'], c['type']
    pan = pan_of.get(c.get('i'), 0)
    if k == 'slide':
        m.add(paper(c['dur'] * .9, 500, 3600, .3), t + c['dur'] * .1, .32, pan, .2)
    elif k == 'open':
        m.add(click(2300, .7), t, .7, pan, .12)
    elif k == 'bite':
        m.add(click(3300, 1), t, 1.0, pan, .12)
        m.add(thrum(73.4, 1.6), t, .55, pan * .5, .1)
        m.add(paper(.35, 900, 5000, .6), t + .04, .35, pan, .15)
    elif k == 'tick':
        m.add(pen(.2, bright=1.1), t, .55, pan, .1)
    elif k == 'digit':
        m.add(tick(.8), t, .45, .55, .05)
    elif k == 'stroke':
        # the pen on the motto, one scratch per stroke, its speed swelling and easing like the pen's curve
        m.add(pen(max(.05, c['dur']), bright=.8), t, .42, -.05, .12)
    elif k == 'stamp':
        m.add(stamp(c.get('k', 1)), t, 1.0, -.1 if c.get('k', 1) == 1 else .08, .2)

# ---- music on the grid
def note(n, at, dur=3.0, vel=.55, pan=0):
    m.add(felt(hz(n), dur, vel), at, 1.0, pan, .35)

note('D4', 0.02, 4, .42, -.2); note('A3', 0.02, 4, .3, -.3)
note('F#4', 1 * B, 3, .3, .1)
figs = [('D2', ['A4', 'F#4', 'D5']), ('G1', ['B4', 'G4', 'E5']), ('A1', ['C#5', 'A4', 'F#5'])]
for (bassn, fig), beat in zip(figs, (2, 5, 8)):
    at = beat * B
    m.add(bass(hz(bassn) * 2, 2.2, .5), at, 1.0, 0, .2)
    for j, n in enumerate(fig):
        note(n, at + j * B * .5, 2.6, .4 - j * .06, (j - 1) * .25)
# the pull-out: one rolled chord, then silence for the pen
for j, n in enumerate(['D3', 'A3', 'F#4', 'E5']):
    note(n, 10 * B + j * .09, 3.2, .34, (j - 1.5) * .2)
# the stamps: the tonic under them, and the last note left to ring
m.add(bass(hz('D2'), 2.8, .55), 13 * B, 1.0, 0, .2)
note('D4', 13 * B + .02, 3.5, .36, -.1); note('A4', 13 * B + .44, 3.5, .3, .15); note('D5', 13 * B + .9, 3.2, .26, .1)

m.render(os.path.join(here, 'mix.wav'), rt=1.3)
print('wrote mix.wav')
