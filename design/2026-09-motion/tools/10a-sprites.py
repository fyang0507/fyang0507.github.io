# 10a · pre-sized derivatives of the book and portrait sprite strips for small renders.
# The browser's own 7–11x downscale of the 616 px / 462 px frames aliases into dashed smudges;
# a premultiplied Lanczos resample at the rendered size does not. Frame layout is preserved exactly.
#   uv run --with pillow python design/2026-09-motion/tools/10a-sprites.py
import os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
RD = os.path.dirname(HERE)
A = os.path.join(os.path.dirname(os.path.dirname(RD)), 'assets')
OUT = os.path.join(RD, 'assets-gen')
SPRITES = {'frame': ('frame-exp3-light.png', 4, (64, 128, 192, 256, 384)), 'book': ('book-flip2-light.png', 6, (96, 192, 288, 384))}

for key, (src, n, widths) in SPRITES.items():
    im = Image.open(os.path.join(A, src)).convert('RGBA')
    fw, fh = im.width // n, im.height
    for w in widths:
        h = round(fh * w / fw)
        strip = Image.new('RGBA', (w * n, h))
        for i in range(n):
            f = im.crop((i * fw, 0, (i + 1) * fw, fh)).convert('RGBa')
            strip.paste(f.resize((w, h), Image.LANCZOS, reducing_gap=3.0).convert('RGBA'), (i * w, 0))
        path = os.path.join(OUT, f'10a-{key}-{w}.png')
        strip.save(path, optimize=True)
        print(path, strip.size, os.path.getsize(path) // 1024, 'KB')
