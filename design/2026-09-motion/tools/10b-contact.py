# 10b · contact sheet: uv run --with pillow design/2026-09-motion/tools/10b-contact.py OUT.png COLS SCALE frame1.png frame2.png …
# Each frame is labelled with the t encoded in its filename (…-1400.png → t=1.400 s).
import re
import sys

from PIL import Image, ImageDraw

out, cols, scale = sys.argv[1], int(sys.argv[2]), float(sys.argv[3])
frames = sys.argv[4:]
ims = [Image.open(f).convert('RGB') for f in frames]
w, h = int(ims[0].width * scale), int(ims[0].height * scale)
rows = (len(ims) + cols - 1) // cols
pad, lab = 6, 18
sheet = Image.new('RGB', (cols * (w + pad) + pad, rows * (h + pad + lab) + pad), (60, 56, 50))
d = ImageDraw.Draw(sheet)
for i, (im, f) in enumerate(zip(ims, frames)):
    x = pad + (i % cols) * (w + pad)
    y = pad + (i // cols) * (h + pad + lab)
    sheet.paste(im.resize((w, h), Image.LANCZOS), (x, y + lab))
    m = re.search(r'-(\d+)\.png$', f)
    d.text((x + 2, y + 3), f"t={int(m.group(1)) / 1000:.2f}s" if m else f, fill=(240, 230, 210))
sheet.save(out)
print(out, sheet.size)
