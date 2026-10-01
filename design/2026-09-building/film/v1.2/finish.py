"""v1.2 (from ../v1.1/finish.py, from ../v1/finish.py). After the three renders: score each on its own cue list, encode, mux to loudness, run QA, write the timing sheets
and the posters.   python3 v1/finish.py  (from design/2026-09-building/film; needs uv, numpy, scipy via uv)"""
import json
import os
import subprocess

here = os.path.dirname(os.path.abspath(__file__))
film = os.path.dirname(here)
FF = '/opt/homebrew/bin/ffmpeg'
JOBS = [('picture.mp4', 'cues-v1.2.json', 'film-v1.2.mp4', 'TIMING.md', 'poster.png', 23),
        ('picture-30s-16x9.mp4', 'cues-30s-16x9.json', 'film-30s-16x9.mp4', 'TIMING-30s.md', 'poster-30s-16x9.png', 23),
        ('picture-30s-9x16.mp4', 'cues-30s-9x16.json', 'film-30s-9x16.mp4', None, 'poster-30s-9x16.png', 23)]
import sys
ONLY = sys.argv[1:]
for pic, cue, out, timing, poster, crf in JOBS:
    if ONLY and not any(o in out for o in ONLY): continue
    P = lambda n: os.path.join(here, n)
    if not os.path.exists(P(pic)): print('missing', pic); continue
    wav = f'/tmp/fyfilm/{out}.wav'; enc = f'/tmp/fyfilm/{out}.enc.mp4'
    subprocess.run(['uv', 'run', '--with', 'numpy', '--with', 'scipy', 'python', P('score.py'), P(cue), wav], check=True, cwd=film)
    subprocess.run([FF, '-v', 'error', '-y', '-i', P(pic), '-c:v', 'libx264', '-preset', 'slow', '-crf', str(crf), '-pix_fmt', 'yuv420p',
                    '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', enc], check=True)
    subprocess.run(['python3', os.path.join(film, 'kit', 'mux.py'), enc, wav, P(out)], check=True)
    c = json.load(open(P(cue)))
    wins = []
    for s in c['timeline']:
        if s['k'] == 'replay': wins += [str(s['t0'] + .05), str(s['t1'] - .05)]
    subprocess.run(['uv', 'run', '--with', 'numpy', 'python', os.path.join(film, 'kit', 'qa.py'), P(out), *wins], check=True)
    if timing: subprocess.run(['python3', os.path.join(film, 'v1', 'timing.py'), P(cue), P(timing)], check=True)
    at = next((s['t0'] + 1.1 for s in c['timeline'] if s['k'] == 'replay'), c['dur'] * .45)   # the flight at a third
    subprocess.run([FF, '-v', 'error', '-y', '-ss', f'{at:.2f}', '-i', P(out), '-frames:v', '1', P(poster)], check=True)
    print(out, round(os.path.getsize(P(out)) / 1e6, 1), 'MB', round(c['dur'], 2), 's')
