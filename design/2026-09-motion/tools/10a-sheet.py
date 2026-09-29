# 10a · compose a frame sequence into one contact sheet with time labels.
#   uv run --with pillow python tools/10a-sheet.py out.png cols thumbW frame1.png[:label] ...
import sys
from PIL import Image, ImageDraw
out, cols, tw = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
items = [a.split(':', 1) if ':' in a else (a, a.rsplit('-', 1)[-1].split('.')[0]) for a in sys.argv[4:]]
ims = [Image.open(p).convert('RGB') for p, _ in items]
th = round(tw * ims[0].height / ims[0].width)
rows = (len(ims) + cols - 1) // cols
pad, lab = 8, 18
sheet = Image.new('RGB', (cols * (tw + pad) + pad, rows * (th + lab + pad) + pad), (60, 56, 50))
d = ImageDraw.Draw(sheet)
for i, (im, (_, name)) in enumerate(zip(ims, items)):
    x, y = pad + (i % cols) * (tw + pad), pad + (i // cols) * (th + lab + pad)
    sheet.paste(im.resize((tw, th), Image.LANCZOS), (x, y + lab))
    d.text((x + 2, y + 3), name, fill=(240, 232, 215))
sheet.save(out)
print('sheet', out, sheet.size)
