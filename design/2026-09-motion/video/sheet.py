# Contact sheet for checking a segment: before (top row) and after (bottom row), sampled at the same
# offsets from each side's 'start' mark, so a glance shows whether both sides hit each beat together.
# Usage: uv run --with pillow python sheet.py <rec-dir-prefix> <out.png> [step_s=0.5] [width_px=300]
#   e.g. sheet.py rec/03-desk-nav out.png 0.4   (reads rec/03-desk-nav-before and -after)
import json, sys, bisect
from pathlib import Path
from PIL import Image, ImageDraw

prefix, out = sys.argv[1], sys.argv[2]
step = float(sys.argv[3]) if len(sys.argv) > 3 else 0.5
cw = int(sys.argv[4]) if len(sys.argv) > 4 else 300


def frames(side):
    d = Path(f'{prefix}-{side}')
    m = json.loads((d / 'marks.json').read_text())
    lines = (d / 'list.txt').read_text().splitlines()
    files = [l[6:-1] for l in lines if l.startswith('file ')][:-1]
    durs = [float(l.split()[1]) for l in lines if l.startswith('duration ')]
    ts, t = [], m['first']
    for dd in durs:
        ts.append(t); t += dd
    return files, ts, m['marks']


sides = [frames('before'), frames('after')]
span = max(mk['end'] - mk['start'] for _, _, mk in sides)
times = [i * step for i in range(int(span / step) + 1)]
im0 = Image.open(sides[0][0][0])
ch = round(cw * im0.height / im0.width)
cols = min(len(times), 10)
rows = -(-len(times) // cols)
sheet = Image.new('RGB', (cols * (cw + 6), rows * (2 * ch + 30)), 'white')
dr = ImageDraw.Draw(sheet)
for i, t in enumerate(times):
    x, y = (i % cols) * (cw + 6), (i // cols) * (2 * ch + 30)
    dr.text((x + 4, y + 2), f'{t:.1f}s', fill='black')
    for r, (files, ts, mk) in enumerate(sides):
        k = max(0, bisect.bisect_right(ts, mk['start'] + t) - 1)
        sheet.paste(Image.open(files[k]).resize((cw, ch)), (x, y + 14 + r * (ch + 2)))
sheet.save(out)
print(out, sheet.size, f'{len(times)} samples over {span:.1f}s')
