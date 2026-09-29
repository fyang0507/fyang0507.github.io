# r3-10 · the board's filmstrips of the new half (the fall), cut from the seek-captured frames
# (/tmp/fyshot/r3-10/seq-<mode>-<w>/f-<ms>.png, from tools/r3-10-seq.mjs: OPX.seek every 20 ms).
#   uv run --with pillow python design/2026-09-motion/tools/r3-10-strip.py
# first:     cut · laptop lands · the fill · 咔嚓 + face-down · the take · eyecatch (1440) + the fill at 390
# returning: page opens mid-fall · back row · front row · the pop · live (1440) + mid-fall at 390
# cold:      a real throttled load (12 Mbps, no cache; tools/r3-10-coldstrip.mjs): the cut · the hold ·
#            the hint · the fall starts · live, from /tmp/fyshot/r3-10/coldstrip-1440-12000/
import glob, os
from PIL import Image
SRC = '/tmp/fyshot/r3-10'
OUT = os.path.join(os.path.dirname(__file__), '..', 'assets-gen')
PICK = {
    'first': ([1520, 1920, 2200, 2380, 2700, 2980], 2200),
    'returning': ([0, 160, 280, 400, 660], 280),
}
LW, LH, PW, G, PAD = 300, 188, 87, 6, 8
for m, (land, port) in PICK.items():
    W = PAD * 2 + len(land) * LW + (len(land) - 1) * G + G * 2 + PW
    im = Image.new('RGB', (W, LH + PAD * 2), (243, 236, 221))
    for i, t in enumerate(land):
        f = Image.open(f'{SRC}/seq-{m}-1440/f-{t:04d}.png').convert('RGB').resize((LW, LH), Image.LANCZOS)
        im.paste(f, (PAD + i * (LW + G), PAD))
    p = Image.open(f'{SRC}/seq-{m}-390/f-{port:04d}.png').convert('RGB').resize((PW, LH), Image.LANCZOS)
    im.paste(p, (W - PAD - PW, PAD))
    path = os.path.join(OUT, f'r3-10-strip-{m}.webp')
    im.save(path, 'WEBP', quality=82, method=6)
    print(path, im.size, os.path.getsize(path), 'B')

d = f'{SRC}/coldstrip-1440-12000'
fs = sorted(glob.glob(f'{d}/c-*.png')) + [f'{d}/z-landed.png']
W = PAD * 2 + len(fs) * LW + (len(fs) - 1) * G
im = Image.new('RGB', (W, LH + PAD * 2), (243, 236, 221))
for i, f in enumerate(fs):
    im.paste(Image.open(f).convert('RGB').resize((LW, LH), Image.LANCZOS), (PAD + i * (LW + G), PAD))
path = os.path.join(OUT, 'r3-10-strip-cold.webp')
im.save(path, 'WEBP', quality=82, method=6)
print(path, im.size, os.path.getsize(path), 'B')
