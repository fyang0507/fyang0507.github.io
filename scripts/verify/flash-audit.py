# WCAG 2.3.1 flash audit over a captured frame sequence (filenames end in <ms>.png, one every 20 ms). Home's opener
# is rendered frame by frame on its own clock (lib/home/opener.js, ?opx=1) by scripts/verify/home-seq.mjs.
#   uv run --with pillow --with numpy scripts/verify/flash-audit.py '/tmp/fyshot/p3-home/seq-first-1440/f-*.png' [--max 2.5]
# --max: the gate in flashes per second, on both readings (default 3.0, WCAG's limit). Home's plan gates desktop at 2.5
# and phone and portrait layouts at 2.0.
# Two readings, both must pass (≤ 3 flashes = ≤ 6 opposing transitions in every 1 s window):
#  A · area (WCAG's definition): a transition is a change of ≥ 0.10 relative luminance with the darker side
#      < 0.80; it counts for a 10° field only if pixels changing in the same direction cover ≥ 25 % of that
#      field (the "small safe area", 341×256 at 1024×768 → a field of ~720×540 at 1440×900, the upper or
#      lower half of a 390×844 phone). A flash is a pair of opposing transitions.
#  B · tile mean (stricter): the field's quarter-size tiles are reduced to their mean luminance and every
#      alternating swing ≥ 0.10 is a transition, however small the patch that caused it.
#      r2-10: swings are found with hysteresis — a reversal registers only once the mean has moved ≥ 0.10
#      back from the running extreme. 10c's sign-merge let a sub-threshold wiggle (e.g. 0.02) split one
#      monotonic climb into two same-direction "transitions", i.e. count a flash where there is none.
# Red: any transition where saturated red (R/(R+G+B) ≥ 0.8) covers ≥ 25 % of a field.
import glob, re, sys
import numpy as np
from PIL import Image

MAX = float(sys.argv[sys.argv.index('--max') + 1]) if '--max' in sys.argv else 3.0
files = sorted(glob.glob(sys.argv[1]), key=lambda f: int(re.findall(r'(\d+)\.png$', f)[0]))
ts = [int(re.findall(r'(\d+)\.png$', f)[0]) for f in files]
def lin(c):
    c = c / 255.0
    return np.where(c <= .04045, c / 12.92, ((c + .055) / 1.055) ** 2.4)
Ls, Rs = [], []
for f in files:
    im = Image.open(f).convert('RGB')
    im = np.asarray(im.resize((im.width // 4, im.height // 4), Image.BOX)).astype(float)
    Ls.append(.2126 * lin(im[..., 0]) + .7152 * lin(im[..., 1]) + .0722 * lin(im[..., 2]))
    Rs.append((im[..., 0] / (im.sum(-1) + 1e-6) >= .8) & (im[..., 0] > 128))
H, W = Ls[0].shape
fw, fh = (W // 2, H * 3 // 5) if W > H else (W, H // 2)

def windows(w, h):
    for y in range(0, H - h + 1, max(1, h // 4)):
        for x in range(0, W - w + 1, max(1, w // 4)):
            yield x, y

def worst_in_1s(trans):
    return max([sum(1 for u in trans[i:] if u - t < 1000) for i, t in enumerate(trans)] or [0])

# A · area
worstA, atA, red = 0, None, 0
for x, y in windows(fw, fh):
    events = []
    for i in range(1, len(Ls)):
        a, b = Ls[i - 1][y:y + fh, x:x + fw], Ls[i][y:y + fh, x:x + fw]
        ok = (np.abs(b - a) >= .1) & (np.minimum(a, b) < .8)
        up, dn = (ok & (b > a)).mean(), (ok & (b < a)).mean()
        d = 1 if up >= .25 else -1 if dn >= .25 else 0
        if d:
            if (Rs[i - 1][y:y + fh, x:x + fw].mean() >= .25) or (Rs[i][y:y + fh, x:x + fw].mean() >= .25): red += 1
            if not events or events[-1][1] != d: events.append((ts[i], d))
    n = worst_in_1s([e[0] for e in events])
    if n > worstA: worstA, atA = n, (x * 4, y * 4, [e for e in events])
# B · tile mean
tw, th = fw // 2, fh // 2
worstB, atB = 0, None
for x, y in windows(tw, th):
    L = [fr[y:y + th, x:x + tw].mean() for fr in Ls]
    trans, d, hi, lo, ext = [], 0, L[0], L[0], L[0]     # d: current swing direction (0 = none yet)
    for i in range(1, len(L)):
        v = L[i]
        if d == 0:                                       # before the first swing: wait for a 0.10 range
            hi, lo = max(hi, v), min(lo, v)
            if hi - lo >= .1 and lo < .8:
                d = 1 if v == hi else -1; ext = v; trans.append(ts[i])
        elif d > 0:
            if v > ext: ext = v
            elif ext - v >= .1 and v < .8: d = -1; ext = v; trans.append(ts[i])
        else:
            if v < ext: ext = v
            elif v - ext >= .1 and ext < .8: d = 1; ext = v; trans.append(ts[i])
    n = worst_in_1s(trans)
    if n > worstB: worstB, atB = n, (x * 4, y * 4, trans)
print('frames %d · %d–%d ms · field %dx%d px' % (len(files), ts[0], ts[-1], fw * 4, fh * 4))
print('A area:      max %d transitions / 1 s → %.1f flashes · %s' % (worstA, worstA / 2, atA))
print('B tile mean: max %d transitions / 1 s → %.1f flashes · %s' % (worstB, worstB / 2, atB))
print('red-flash transitions:', red)
print(('PASS' if worstA / 2 <= MAX and worstB / 2 <= MAX and red == 0 else 'FAIL') + ' (gate %.1f flashes/s)' % MAX)
