"""v1.3's part 2 score: the site before #17, one take. Reads cues-part2.json, writes a wav (finish.py sets its level
against part 1's and the whole file's loudness).   uv run --with numpy --with scipy python v1.3/score.py <cues> <out.wav>

Quieter and sparser than part 1: the same key (D), but a felt piano alone, one note or one open fifth at a time, far
apart, never a chord stack, no string, no marimba, and no near-silences to build to, because nothing here builds.
The old site made no sound of its own, so over it there is only the input: a dry click under every press, and at every
hard cut a plain snap, the same sound each time. The film's paper brackets it: the last sheet pulled aside and the
label stamped at the join, the last sheet put back at the end, and the tonic left to ring out inside the film."""
import os
import sys
import numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'kit'))
from sound import *  # noqa: E402,F403

cue = cues(sys.argv[1])
OUT = sys.argv[2]
DUR, C = cue['dur'], cue['cues']
m = Mix(DUR)
bed = Mix(DUR)

pull = next(c for c in C if c['type'] == 'pull'); back = next(c for c in C if c['type'] == 'putback')
label = next(c for c in C if c['type'] == 'label'); land = next(c for c in C if c['type'] == 'land')
# ---- the film's paper: the join and the end (as part 1's pull, J-cut a little ahead of the move)
m.add(whoosh(.9, .8), pull['t'] - .05, .34, -.4, .2); m.add(paper(1.1, 500, 3600, .3), pull['t'], .26, -.3, .2)
m.add(stamp(.7), label['t'], .8, .05, .2)
m.add(whoosh(.9, .8), back['t'] - .05, .3, -.4, .2); m.add(paper(1.1, 500, 3600, .3), back['t'], .24, -.3, .2)
m.add(snap(.45), land['t'] - .04, .22, -.2, .12)

# ---- the input: a click under every press; a hard cut under every click that leaves the page
for c in C:
    if c['type'] == 'press': m.add(click(3100, .6), c['t'], .3, -.05, .05)
for c in C:
    if c['type'] != 'site': continue
    if c['kind'] == 'nav' or c['name'] in ('click-book', 'take-card'): m.add(snap(.6), c['t'] + .2, .3, 0, .05)
    elif c['name'] == 'open-print': m.add(snap(.5), c['t'] + .2, .24, 0, .05)

# ---- the bed: one felt note or one open fifth at a time, a slow walk down the same four chords as part 1
def felt_n(n, at, dur, vel, pan): bed.add(felt(hz(n), dur, vel), at, 1.0, pan, .38)
LINE = [(1.4, ['D3', 'A3'], 5.0), (4.2, ['F#4'], 3.2), (7.0, ['B2', 'F#3'], 5.0), (9.8, ['D4'], 3.2),
        (12.6, ['G2', 'D3'], 5.0), (15.4, ['B3'], 3.2), (18.2, ['A2', 'E3'], 4.6), (20.4, ['C#4'], 2.6)]
for at, notes, d in LINE:
    for j, n in enumerate(notes): felt_n(n, at + j * .06, d, .17, (j - .5) * .3)
# the end: the tonic as the last sheet lands, left to ring out
felt_n('D3', land['t'] - .02, 3.0, .2, -.1); felt_n('A3', land['t'] + .04, 2.8, .16, .15)

# the last 1.6 s decay to -60 dB exactly at the film's last frame, and nothing after it
n = bed.n
fade = np.zeros(n); i0, i1 = secs(DUR - 1.6), secs(DUR); fade[:i0] = 1; fade[i0:i1] = np.exp(-np.linspace(0, 6.9, i1 - i0))
m.dry += bed.dry * .9; m.wet += bed.wet * .9
m.dry *= fade; m.wet *= fade
m.render(OUT, rt=1.4)
print('wrote', OUT, round(DUR, 2), 's')
