"""Contact sheet of c-shot/stills/*.png (or given files), captioned with their times: for checking frames.
   uv run --with pillow python c-shot/sheet.py out.jpg [cols] [files…]"""
import glob
import os
import sys
from PIL import Image, ImageDraw

out = sys.argv[1]
cols = int(sys.argv[2]) if len(sys.argv) > 2 else 3
files = sys.argv[3:] or sorted(glob.glob(os.path.join(os.path.dirname(__file__), 'stills', 't-*.png')), key=lambda f: float(f.split('t-')[-1][:-4]))
W, H = 640, 360
sheet = Image.new('RGB', (W * cols, (H + 24) * ((len(files) + cols - 1) // cols)), (255, 255, 255))
d = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    im = Image.open(f).convert('RGB').resize((W, H), Image.LANCZOS)
    x, y = (i % cols) * W, (i // cols) * (H + 24)
    sheet.paste(im, (x, y))
    d.text((x + 6, y + H + 5), os.path.basename(f), fill=(60, 60, 60))
sheet.save(out, quality=88)
