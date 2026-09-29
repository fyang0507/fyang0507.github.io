# Home · pixel diff of the desk at rest against today's (scripts/verify/home-rest.mjs writes captures and boxes).
#   uv run --with pillow --with numpy python scripts/verify/home-diff.py
# Two readings over the desk box:
#   strict   a pixel differs when any channel moves > 24/255.
#   aligned  the same, but a pixel only counts if no pixel within 1 px of it in the other capture matches: the layers
#            are drawn at the same place, but the browser snaps each layer's box to whole pixels, so a line can land
#            up to half a pixel from where the single flat image put it. That is resampling, not a change to the desk.
# The caret and the steam are masked out: they loop on their own clocks and have no resting frame.
import json, numpy as np
from PIL import Image
T = 24
for w in (1440,):
    box = json.load(open(f'/tmp/fyshot/p3-home/rest-{w}.json'))
    a = np.asarray(Image.open(f'/tmp/fyshot/p3-home/rest-before-{w}.png').convert('RGB')).astype(int)
    b = np.asarray(Image.open(f'/tmp/fyshot/p3-home/rest-after-{w}.png').convert('RGB')).astype(int)
    (xa, ya, bw, bh), (x, y, _, _) = box['before'], box['after']     # each desk at its own box (a shared header may move it)
    ca, cb = a[ya:ya + bh, xa:xa + bw], b[y:y + bh, x:x + bw]
    keep = np.ones((bh, bw), bool)
    cx0, cy0 = int(bw * (.258 + .005)), int(bh * .28)                # the caret's cell on the laptop screen
    keep[cy0 - 2:cy0 + int(bh * .03), cx0 - 2:cx0 + int(bw * .02)] = False
    sx0, sy0 = int(bw * .263), int(bh * .44)                          # the steam above the mug (26.3 % / 46.5 %, 6.8 % wide)
    keep[sy0:sy0 + int(bh * .13), sx0 - 2:sx0 + int(bw * .07)] = False
    strict = (np.abs(ca - cb).max(-1) > T) & keep
    def near(p, q):                                                   # does p have a match within 1 px in q?
        ok = np.zeros(p.shape[:2], bool)
        qp = np.pad(q, ((1, 1), (1, 1), (0, 0)), mode='edge')
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                ok |= np.abs(p - qp[1 + dy:1 + dy + p.shape[0], 1 + dx:1 + dx + p.shape[1]]).max(-1) <= T
        return ok
    aligned = strict & ~(near(cb, ca) & near(ca, cb))
    out = np.where(aligned[..., None], [230, 40, 40], np.where(strict[..., None], [240, 170, 60], cb * .35 + 160)).astype('uint8')
    Image.fromarray(out).save(f'/tmp/fyshot/p3-home/rest-diff-{w}.png')
    S = bw / 1448
    for k, r in {'book': [521.9, 667.9, 309, 237.4], 'frame': [799.7, 358.7, 225, 210.8], 'bird': [202.7, 733.1, 101.4, 104.3], 'camera': [988, 687, 260, 185]}.items():
        x0, y0, x1, y1 = [int(round(v * S)) for v in (r[0], r[1], r[0] + r[2], r[1] + r[3])]
        print(f'   {k:7s} aligned {aligned[y0:y1, x0:x1].sum() / aligned.size * 100:.3f} % of the desk')
    # Today's portrait and book are 2,464 / 2,772 px sprite strips scaled down in CSS, which aliases them (HANDOFF §4);
    # the derived strip rungs fix that on purpose. Reported separately so the fix isn't mistaken for drift.
    fix = np.zeros_like(keep)
    for r in ([799.7, 358.7, 225, 210.8], [521.9, 667.9, 309, 237.4]):
        x0, y0, x1, y1 = [int(round(v * S)) for v in (r[0], r[1], r[0] + r[2], r[1] + r[3])]
        fix[y0:y1, x0:x1] = True
    print(f'   without the sprite-aliasing fix (portrait, book): aligned {(aligned & ~fix).sum() / aligned.size * 100:.3f} %, strict {(strict & ~fix).sum() / strict.size * 100:.3f} %')
    print(w, 'desk', box['after'], f'strict {strict.mean() * 100:.3f} %', f'· aligned {aligned.mean() * 100:.3f} %', f'· mean abs {np.abs(ca - cb).mean():.2f}/255',
          'PASS' if aligned.mean() <= .005 else 'FAIL', '(limit 0.5 %)')
