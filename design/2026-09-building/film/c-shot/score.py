"""C's score: foley on the picture's own cues (cues.json) and a sparse bed that follows the camera.

The bed: felted piano and one low plucked string in D, 80 BPM, D → Bm → G → A → D, one chord a camera stretch. It
starts as a note or two over the wide desk, thickens as the camera goes into the screen, and stops dead before the
pin pops (the near-silence), so the pin is the first sound on an empty track. The rail is scored as the pen alone;
the bed comes back under the pull-out and thins again before the seals, which land on silence. The chapter's paper is
heard before the sheet enters the frame (the J-cut); the dossier's slide runs on under the tab being pulled (the L).
    uv run --with numpy --with scipy python c-shot/score.py          (after kit/render.mjs has written cues.json)
"""
import os
import sys
import numpy as np

here = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(here, '..', 'kit'))
import sound as S  # noqa: E402

cue = S.cues(os.path.join(here, 'cues.json'))
dur = cue['dur']
M = S.Mix(dur)


def pen_ease(x):
    """the site's --ease-pen, cubic-bezier(.55, .1, .25, 1)"""
    x1, y1, x2, y2 = .55, .1, .25, 1
    t = np.clip(x, 0, 1).astype(float)
    for _ in range(8):
        cx = 3 * x1 * t * (1 - t) ** 2 + 3 * x2 * t * t * (1 - t) + t ** 3 - x
        dx = 3 * x1 * (1 - t) * (1 - 3 * t) + 3 * x2 * t * (2 - 3 * t) + 3 * t * t
        t = np.clip(t - cx / np.where(np.abs(dx) < 1e-6, 1e-6, dx), 0, 1)
    return 3 * y1 * t * (1 - t) ** 2 + 3 * y2 * t * t * (1 - t) + t ** 3


def speed(n=200, ease='pen'):
    u = np.linspace(0, 1, n)
    y = pen_ease(u) if ease == 'pen' else u
    v = np.gradient(y)
    return v / v.max()


# ---------------------------------------------------------------- foley, from the picture's cues
for c in cue['cues']:
    t, k = c['t'], c['type']
    if k == 'pin':
        M.add(S.pin(1.0), t, 1.3, -0.25, 0.1)
        M.add(S.click(4200, .5), t + 1 / 12, 0.5, -0.2, 0.1)          # the second held pose, the head's knock
    elif k == 'lift':
        M.add(S.paper(c['dur'], 350, 3800, 0.25), t + .05, 0.75, -0.1, 0.18)
    elif k == 'slide':
        M.add(S.paper(c['dur'] + .5, 250, 2800, 0.15), t, 0.8, 0.05, 0.18)   # runs on under the pull: the L-cut
    elif k == 'pull':
        M.add(S.click(2900, .7), t, 0.55, 0.3, 0.1)
    elif k == 'whoosh':
        M.add(S.whoosh(c['dur'], .8), t, 0.6, 0.4, 0.2)
    elif k == 'sheet':
        M.add(S.paper(c['dur'] + .3, 500, 5000, 0.35), t - .3, 0.7, 0.6, 0.18)  # heard before it enters: the J-cut
        M.add(S.snap(.55), t + .78, 0.6, 0.3, 0.15)
    elif k == 'land':
        M.add(S.click(2300, .8), t, 0.6, 0.3, 0.12)
        M.add(S.snap(.3), t + .01, 0.4, 0.3, 0.1)
    elif k == 'pen':
        d = c['dur']
        sp = speed(200, c.get('ease', 'pen'))
        if c.get('loop'):
            sp = 0.6 + 0.4 * np.abs(np.sin(np.linspace(0, np.pi * 2.2, 200)))
        M.add(S.pen(d, sp, 1.1 if c.get('motto') else 1.0), t, 1.0 if c.get('motto') else 1.0, -0.15 if c.get('motto') else -0.3, 0.08)
    elif k == 'tick':
        M.add(S.tick(.5), t, 0.35, -0.3, 0.06)
    elif k == 'stamp':
        M.add(S.stamp(c.get('k', 1)), t, 0.55, -0.2 if c.get('k', 1) == 1 else -0.05, 0.22)

# ---------------------------------------------------------------- the bed
B = 60 / 80
CH = [('D', ['D3', 'A3', 'F#4', 'A4']), ('Bm', ['B2', 'F#3', 'D4', 'B4']), ('G', ['G2', 'D3', 'B3', 'D4']),
      ('A', ['A2', 'E3', 'C#4', 'E4']), ('D', ['D3', 'A3', 'F#4', 'D5'])]
# (time, note, velocity): sparse over the desk, thicker into the screen, nothing from 3.35 until the pin
notes = [(0.25, 'D4', .45), (1.05, 'A4', .38), (1.8, 'F#4', .42), (2.2, 'D5', .4), (2.6, 'A4', .34), (2.95, 'B4', .3), (3.2, 'F#4', .22)]
# after the pin: a chord a stretch, the card lifting on Bm, the dossier on G, the tab and the chapter on A
notes += [(4.6, 'B3', .32), (4.95, 'D4', .3), (5.3, 'F#4', .3), (5.75, 'G3', .34), (6.1, 'B3', .3), (6.45, 'D4', .28), (6.95, 'G4', .26),
          (7.35, 'A3', .3), (7.7, 'C#4', .28), (8.05, 'E4', .3), (8.45, 'A4', .34)]
# the rail is the pen alone; the pull-out brings the bed back in D, then it thins before the seals
notes += [(11.7, 'D4', .34), (12.1, 'F#4', .3), (12.5, 'A4', .32), (12.95, 'D5', .3), (13.35, 'A4', .24)]
for t, n, v in notes:
    M.add(S.felt(S.hz(n), 3.2, v), t, 1.0, np.interp(S.hz(n), [150, 700], [-0.35, 0.35]), 0.35)
# the low string: a pulse under each stretch, one per chord change
for t, n, v in [(2.2, 'D2', .5), (4.6, 'B1', .45), (5.75, 'G1', .45), (7.35, 'A1', .45), (11.7, 'D2', .5), (14.12, 'D2', .35)]:
    M.add(S.lp(S.ks(S.hz(n), 3.0, 0.997, 0.25), 700), t, 0.55 * v / .5, 0.0, 0.25)
# a last, quiet note after the second seal, let ring to the end
M.add(S.felt(S.hz('A4'), 1.6, .22), 14.62, 1.0, 0.2, 0.4)

M.render(os.path.join(here, 'mix.wav'), rt=1.2)
print('wrote mix.wav', dur, 's')
