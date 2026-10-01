"""QA for a finished film: one- or two-frame luma glitches (a frame, or two, unlike both its neighbours, which agree
with each other), and zero-diff frames inside the windows you name.
   uv run --with numpy python kit/qa.py film.mp4 [t0 t1 ...]"""
import subprocess
import sys
import numpy as np

FF = '/opt/homebrew/bin/ffmpeg'
path = sys.argv[1]
wins = [(float(a), float(b)) for a, b in zip(sys.argv[2::2], sys.argv[3::2])]
W, H = 192, 108
raw = subprocess.run([FF, '-v', 'error', '-i', path, '-vf', f'scale={W}:{H},format=gray', '-f', 'rawvideo', '-'], capture_output=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)
fps = float(eval(subprocess.run(['/opt/homebrew/bin/ffprobe', '-v', 'error', '-select_streams', 'v', '-show_entries', 'stream=r_frame_rate', '-of', 'csv=p=0', path], capture_output=True, text=True).stdout.strip()))
d = lambda a, b: float(np.mean(np.abs(fr[a] - fr[b])))
glitch = []
for i in range(1, len(fr) - 2):
    a, b = d(i - 1, i), d(i - 1, i + 1)          # one frame unlike both neighbours
    if a > 4 and b < a * 0.25: glitch.append((round(i / fps, 3), 1, round(a, 1)))
    a2, b2 = d(i - 1, i), d(i - 1, i + 2)        # two frames
    if i + 2 < len(fr) and a2 > 4 and b2 < a2 * 0.25 and d(i, i + 1) < a2 * 0.5 and b >= a * 0.25: glitch.append((round(i / fps, 3), 2, round(a2, 1)))
print(f'{path}: {len(fr)} frames at {fps:g} fps; luma glitches (t, frames, size): {glitch[:30] if glitch else "none"}')
for t0, t1 in wins:
    i0, i1 = int(t0 * fps), int(t1 * fps)
    z = [round(i / fps, 3) for i in range(max(1, i0), min(len(fr), i1)) if d(i - 1, i) < 0.02]
    print(f'  window {t0}-{t1}: zero-diff frames {len(z)} {z[:12]}')
