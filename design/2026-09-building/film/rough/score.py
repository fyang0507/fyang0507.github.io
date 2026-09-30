"""The rough cut's draft score. Reads rough/cues.json (the film's cues and every beat of the live footage, on the
film's clock) and writes rough/mix.wav.   uv run --with numpy --with scipy python rough/score.py

Foley: every input sent to the site and every event it answers with (a click, a flight between pages, a stamp, a
flip), and every move of the film's own paper (the cover, a page lifted and let fall, a sheet pulled aside, the pen,
the seals, the typed credits). Music: a felt piano and a low string in D at 84 BPM, one section per sheet, the
opener's register break answered by the one bright chord, a near-silence before the seals."""
import os
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'kit'))
from sound import *  # noqa: E402,F403

here = os.path.dirname(__file__)
cue = cues(os.path.join(here, 'cues.json'))
DUR = cue['dur']; C = cue['cues']; TL = cue.get('timeline') or []
m = Mix(DUR)
B = 60 / 84

# ---- foley
for c in C:
    t, k = c['t'], c['type']
    if k == 'site' and c.get('kind') == 'event':
        # what the site does, by name: the seals are stamped, pins pop and press, paper flies, prints swing
        n = c.get('name', '')
        if n.startswith('seal-'): m.add(stamp(.55 if n == 'seal-1' else .4), t, .7, -.2, .2)
        elif n == 'motto-start': m.add(pen(1.05, bright=.9), t, .3, -.2, .12)
        elif n == 'objects-fall':
            for j, dt in enumerate((0, .09, .16, .26, .31)): m.add(snap(.35 + .1 * (j % 2)), t + dt, .35, (j - 2) * .25, .15)
        elif n == 'op-cut': m.add(snap(.8), t, .4, 0, .1)
        elif n in ('desk-nav-flight', 'tab-move', 'tab-move-about', 'tabs-fly', 'gravity-return', 'reading-cut'):
            m.add(whoosh(.75, .9), t, .5, .2, .2)
            if n == 'gravity-return':
                for j, dt in enumerate((.35, .42, .5, .58)): m.add(snap(.4), t + dt, .3, (j - 1.5) * .3, .15)
        elif n in ('pin-pop', 'pin-pressed'): m.add(pin(1.0 if n == 'pin-pressed' else .7), t, .7, 0, .12)
        elif n in ('cards-swing', 'prints-swing'): m.add(paper(1.0, 300, 2400, .2), t, .3, 0, .2)
        elif n in ('print-unclip', 'print-home'): m.add(click(2600, .9), t, .6, .1, .12); m.add(thrum(73.4, 1.2), t + .05, .35, 0, .1)
        elif n in ('card-out',): m.add(paper(.9, 500, 3600, .4), t, .45, .1, .15)
        elif n in ('flip', 'flip-back'): m.add(paper(.35, 700, 4200, .3), t, .4, 0, .12); m.add(snap(.45), t + .5, .35, 0, .12)
        elif n == 'rail-draws': m.add(pen(1.4, bright=.8), t, .3, -.3, .12)
    elif k == 'site':
        kind = c.get('kind', '')
        if kind == 'click': m.add(click(2900, .8), t, .55, .1, .12)
        elif kind in ('nav', 'flight', 'move'): m.add(whoosh(.7, .8), t, .5, .15, .2)
        elif kind == 'drag': m.add(paper(.6, 400, 2600, .2), t, .3, 0, .15)
        elif kind == 'stamp': m.add(stamp(.7), t, .55, -.1, .2)
        elif kind == 'flip': m.add(snap(.6), t, .45, 0, .15)
        elif kind == 'pin': m.add(pin(.9), t, .6, 0, .12)
        elif kind in ('key', 'switch'): m.add(tick(.9), t, .5, .2, .05)
        elif kind == 'scroll': m.add(paper(.5, 300, 1800, .05), t, .12, 0, .1)
        elif kind == 'develop': m.add(paper(1.0, 200, 900, 0), t, .08, 0, .3)
    elif k == 'cover-open':
        m.add(paper(.9, 350, 2400, .3), t, .5, -.3, .2); m.add(snap(.8), t + .85, .45, -.4, .2)
    elif k == 'lift':
        m.add(paper(.55, 600, 4200, .5), t, .42, .35, .15)
    elif k == 'drop':
        m.add(paper(.25, 800, 4200, .4), t, .25, .35, .1); m.add(snap(.5), t + .22, .35, .35, .12)
    elif k == 'pull':
        m.add(whoosh(c.get('dur', 1.4) * .8, 1), t + .1, .45, -.4, .2); m.add(paper(c.get('dur', 1.4), 500, 3600, .3), t, .3, -.2, .2)
    elif k == 'motto':
        m.add(pen(c['dur'], bright=.85), t, .35, 0, .12)
    elif k == 'stamp':
        m.add(stamp(c.get('k', 1)), t, 1.0, -.1, .2)
    elif k == 'type':
        n = int(c['dur'] * 55)
        for i in range(n):
            m.add(tick(.5 + .3 * ((i * 7) % 5) / 5), t + i / 55, .22, .1, .05)

# ---- music: a bar is four beats; each sheet gets its own figure, the end its near-silence and resolution
def note(n, at, dur=3.0, vel=.5, pan=0):
    if at < DUR: m.add(felt(hz(n), dur, vel), at, 1.0, pan, .35)

prog = [('D2', ['D4', 'F#4', 'A4']), ('B1', ['D4', 'F#4', 'B4']), ('G1', ['D4', 'G4', 'B4']), ('A1', ['C#4', 'E4', 'A4'])]
end0 = next((c['t'] for c in C if c['type'] == 'motto'), DUR - 8) - .6
t, bar = 0.2, 0
while t < end0 - 1.5:
    bassn, ch = prog[bar % 4]
    sec = sum(1 for s in TL if s['t0'] <= t)          # which sheet we're on: the figure grows a little each time
    m.add(bass(hz(bassn) * 2, 2.6, .45), t, 1.0, 0, .2)
    for j, n in enumerate(ch):
        note(n, t + j * B * (.5 if sec >= 2 else 1.0), 2.8, .26 + .04 * min(sec, 3), (j - 1) * .3)
    if sec >= 2:
        note(ch[-1].replace('4', '5'), t + 3 * B, 2.2, .18, .3)
    t += 4 * B; bar += 1
# the opener's one bright chord, on the first sheet's first seconds
if TL:
    for j, n in enumerate(['D5', 'F#5', 'A5', 'E6']):
        note(n, TL[0]['t0'] + .4 + j * .05, 2.2, .22, (j - 1.5) * .25)
# the end: silence under the pen, the tonic under the stamps, the last note left to ring
st = [c['t'] for c in C if c['type'] == 'stamp']
if st:
    m.add(bass(hz('D2'), 3.2, .55), st[0], 1.0, 0, .2)
    note('D4', st[0] + .02, 4, .34, -.1); note('A4', st[-1] + .02, 4, .3, .15); note('D5', st[-1] + 1.2, 4, .24, .1)

m.render(os.path.join(here, 'mix.wav'), rt=1.3)
print('wrote mix.wav', round(DUR, 2), 's')
