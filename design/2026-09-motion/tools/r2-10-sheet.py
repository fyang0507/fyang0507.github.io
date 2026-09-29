# r2-10 · contact sheet (from tools/10c-sheet.py): tile a captured frame sequence, labelled with its timestamp.
#   uv run --with pillow python design/2026-09-motion/tools/r2-10-sheet.py <dir> <out.png> [every_ms] [cols] [thumb_w]
# Frames are <dir>/f-<ms>.png (+ z-landed.png, appended last); keeps one frame per every_ms.
import glob, os, re, sys
from PIL import Image, ImageDraw
d, out = sys.argv[1], sys.argv[2]
every = int(sys.argv[3]) if len(sys.argv) > 3 else 80
cols = int(sys.argv[4]) if len(sys.argv) > 4 else 8
tw = int(sys.argv[5]) if len(sys.argv) > 5 else 240
fr = sorted(glob.glob(os.path.join(d, 'f-*.png')), key=lambda f: int(re.findall(r'(\d+)\.png$', f)[0]))
fr = [f for f in fr if int(re.findall(r'(\d+)\.png$', f)[0]) % every == 0] + ([fr[-1]] if fr and int(re.findall(r'(\d+)\.png$', fr[-1])[0]) % every else [])
if os.path.exists(os.path.join(d, 'z-landed.png')): fr.append(os.path.join(d, 'z-landed.png'))
ims = [Image.open(f).convert('RGB') for f in fr]
th = round(tw * ims[0].height / ims[0].width)
rows = (len(ims) + cols - 1) // cols
sheet = Image.new('RGB', (cols * (tw + 6) + 6, rows * (th + 22) + 6), (40, 38, 35))
g = ImageDraw.Draw(sheet)
for i, (f, im) in enumerate(zip(fr, ims)):
    x, y = 6 + (i % cols) * (tw + 6), 6 + (i // cols) * (th + 22)
    sheet.paste(im.resize((tw, th), Image.LANCZOS), (x, y + 16))
    t = re.findall(r'(\d+)\.png$', f)
    g.text((x, y + 2), (str(int(t[0])) + ' ms') if t else 'landed', fill=(230, 225, 215))
sheet.save(out)
print(out, sheet.size, len(ims), 'frames')
