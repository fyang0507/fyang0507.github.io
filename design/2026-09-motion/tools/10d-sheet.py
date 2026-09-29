# 10d · compose captured frames into one labelled contact sheet.
# uv run --with pillow python design/2026-09-motion/tools/10d-sheet.py OUT.png COLS THUMB_W frame1.png frame2.png …
# (frame labels = the number after the last '-' in each file name, e.g. full-1400.png → "1400 ms")
import sys, os
from PIL import Image, ImageDraw
out, cols, tw = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
files = sys.argv[4:]
ims = [Image.open(f).convert('RGB') for f in files]
th = int(ims[0].height * tw / ims[0].width)
pad, lab = 6, 16
rows = (len(ims) + cols - 1) // cols
sheet = Image.new('RGB', (cols * (tw + pad) + pad, rows * (th + lab + pad) + pad), (40, 38, 35))
d = ImageDraw.Draw(sheet)
for i, (f, im) in enumerate(zip(files, ims)):
    x, y = pad + (i % cols) * (tw + pad), pad + (i // cols) * (th + lab + pad)
    sheet.paste(im.resize((tw, th), Image.LANCZOS), (x, y + lab))
    name = os.path.splitext(os.path.basename(f))[0].rsplit('-', 1)[-1]
    d.text((x + 2, y + 2), name + ' ms', fill=(230, 220, 200))
sheet.save(out)
print('sheet', out, sheet.size)
