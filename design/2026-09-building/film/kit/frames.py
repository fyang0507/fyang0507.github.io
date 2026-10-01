"""Frames of a finished film at given times, tiled into one image.
   python3 kit/frames.py film.mp4 out.jpg t1 t2 ... [--w 960 --cols 2]"""
import subprocess
import sys
import tempfile
import os

args = sys.argv[1:]
w = int(args[args.index('--w') + 1]) if '--w' in args else 960
cols = int(args[args.index('--cols') + 1]) if '--cols' in args else 2
args = [a for i, a in enumerate(args) if a not in ('--w', '--cols') and (i == 0 or args[i - 1] not in ('--w', '--cols'))]
src, out, ts = args[0], args[1], args[2:]
tmp = tempfile.mkdtemp()
files = []
for i, t in enumerate(ts):
    f = os.path.join(tmp, f'{i:03d}.png')
    subprocess.run(['/opt/homebrew/bin/ffmpeg', '-v', 'error', '-y', '-ss', t, '-i', src, '-frames:v', '1', '-vf', f'scale={w}:-2', f], check=True)
    files.append(f)
rows = (len(files) + cols - 1) // cols
inputs = []
for f in files: inputs += ['-i', f]
layout = '|'.join(f'{(i % cols)}_{(i // cols)}' for i in range(len(files)))
if len(files) > 1:
    xs = '|'.join(f'{"+".join(["w0"] * (i % cols)) or "0"}_{"+".join(["h0"] * (i // cols)) or "0"}' for i in range(len(files)))
    subprocess.run(['/opt/homebrew/bin/ffmpeg', '-v', 'error', '-y', *inputs, '-filter_complex', f'xstack=inputs={len(files)}:layout={xs}:fill=white', out], check=True)
else:
    subprocess.run(['cp', files[0], out])
print(out)
