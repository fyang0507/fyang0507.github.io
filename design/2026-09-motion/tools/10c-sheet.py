# 10c · contact sheet: tile a captured frame sequence, labelled with its timestamp.
#   uv run --with pillow design/2026-09-motion/tools/10c-sheet.py <glob> <out.png> [cols] [thumb_w]
import glob, re, sys
from PIL import Image, ImageDraw
files = sorted(glob.glob(sys.argv[1]))
out, cols, tw = sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 6, int(sys.argv[4]) if len(sys.argv) > 4 else 300
ims = [Image.open(f).convert('RGB') for f in files]
th = round(tw * ims[0].height / ims[0].width)
rows = (len(ims) + cols - 1) // cols
sheet = Image.new('RGB', (cols * (tw + 6) + 6, rows * (th + 22) + 6), (40, 38, 35))
d = ImageDraw.Draw(sheet)
for i, (f, im) in enumerate(zip(files, ims)):
    x, y = 6 + (i % cols) * (tw + 6), 6 + (i // cols) * (th + 22)
    sheet.paste(im.resize((tw, th), Image.LANCZOS), (x, y + 16))
    t = re.findall(r'(\d+)\.png$', f)
    d.text((x, y + 2), (t[0] + ' ms') if t else f[-20:], fill=(230, 225, 215))
sheet.save(out)
print(out, sheet.size, len(ims), 'frames')
