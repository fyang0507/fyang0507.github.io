# r2-10 · the board's name-beat filmstrips, cut from the seek-captured frames (/tmp/fyshot/r2-10/seq-*).
#   uv run --with pillow python design/2026-09-motion/tools/r2-10-strip.py
# Each strip: four 1440 frames (one per held pose) + the 390 composition of the beat's key frame, on paper.
import os
from PIL import Image
SRC = '/tmp/fyshot/r2-10'
OUT = os.path.join(os.path.dirname(__file__), '..', 'assets-gen')
PICK = {  # ms into the first visit: one sample per held pose (12 fps ticks = 83⅓ ms)
    'a': ([40, 200, 280, 440], 440),     # 弗 · 雷 · 德 · FRED (with its ticks)
    'b': ([40, 120, 200, 400], 400),     # enter · smear · impact · hold
    'c': ([40, 120, 300, 520], 300),     # mid-drop · lands · stands · the next cut (the OP carries on)
}
LW, LH, PW, G, PAD = 300, 188, 87, 6, 8
for k, (land, port) in PICK.items():
    W = PAD * 2 + 4 * LW + 3 * G + G * 2 + PW
    im = Image.new('RGB', (W, LH + PAD * 2), (243, 236, 221))
    for i, t in enumerate(land):
        f = Image.open(f'{SRC}/seq-{k}-first-1440/f-{t:04d}.png').convert('RGB').resize((LW, LH), Image.LANCZOS)
        im.paste(f, (PAD + i * (LW + G), PAD))
    p = Image.open(f'{SRC}/seq-{k}-first-390/f-{port:04d}.png').convert('RGB').resize((PW, LH), Image.LANCZOS)
    im.paste(p, (W - PAD - PW, PAD))
    path = os.path.join(OUT, f'r2-10-strip-{k}.webp')
    im.save(path, 'WEBP', quality=82, method=6)
    print(path, im.size, os.path.getsize(path), 'B')
