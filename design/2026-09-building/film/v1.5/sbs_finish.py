"""v1.5's side-by-side, finished: the render (pictures/sbs.mp4, crf 17) encoded once at the promo's settings and muxed
with the promo's own sound, its AAC stream copied from film-v1.5-promo.mp4 as it is (the same mix, -16 LUFS); then QA.
   uv run --with numpy python v1.5/sbs_finish.py [stacked]   (from design/2026-09-building/film, after finish.py)
With `stacked`, the vertical film (sbs.html?layout=stacked, rendered to pictures/stk.mp4) instead."""
import sys
import os
import subprocess

here = os.path.dirname(os.path.abspath(__file__))
film = os.path.dirname(here)
FF = '/opt/homebrew/bin/ffmpeg'
P = lambda n: os.path.join(here, n)
STK = sys.argv[1:] == ['stacked']
enc, out = '/tmp/fyfilm/v15-sbs.enc.mp4', P('film-v1.5-stacked.mp4' if STK else 'film-v1.5-side-by-side.mp4')
subprocess.run([FF, '-v', 'error', '-y', '-i', P('pictures/stk.mp4' if STK else 'pictures/sbs.mp4'), '-c:v', 'libx264', '-preset', 'slow', '-crf', '23', '-pix_fmt', 'yuv420p',
                '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', enc], check=True)
subprocess.run([FF, '-v', 'error', '-y', '-i', enc, '-i', P('film-v1.5-promo.mp4'), '-map', '0:v', '-map', '1:a', '-c', 'copy', '-movflags', '+faststart', out], check=True)
q = subprocess.run([FF, '-hide_banner', '-nostats', '-i', out, '-map', '0:a', '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True)
sm = q.stderr[q.stderr.rfind('Summary:'):].split()
print(out, f"I {sm[sm.index('I:') + 1]} LUFS, LRA {sm[sm.index('LRA:') + 1]} LU, true peak {sm[sm.index('Peak:') + 1]} dBTP,", round(os.path.getsize(out) / 1e6, 1), 'MB')
subprocess.run(['uv', 'run', '--with', 'numpy', 'python', os.path.join(film, 'kit', 'qa.py'), out], check=True)
subprocess.run([FF, '-v', 'error', '-y', '-ss', '19.3', '-i', out, '-frames:v', '1', P('poster-stacked.png' if STK else 'poster-side-by-side.png')], check=True)
