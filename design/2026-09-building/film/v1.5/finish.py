"""v1.5's finish: v1.4's (../v1.4/finish.py) on v1.5's files. After the two renders (README: the promo from index.html, part 2
from part2.html, each with its cues): score both parts, set part 1 to -16 LUFS and part 2 REL LU under it with
kit/mux.py's two-pass loudnorm (the one mix for both files), encode, mux, run QA, and write the posters and TIMING.md.
   uv run --with numpy python v1.5/finish.py   (from design/2026-09-building/film; the scores run under uv with scipy)
Writes film-v1.5-promo.mp4 (part 1 alone) and film-v1.5.mp4 (part 1 + part 2)."""
import json
import os
import subprocess
import wave

import numpy as np

here = os.path.dirname(os.path.abspath(__file__))
film = os.path.dirname(here)
FF, PROBE = '/opt/homebrew/bin/ffmpeg', '/opt/homebrew/bin/ffprobe'
SR, FPS, REL = 48000, 60, 5.0
# part 1's mix has a wide range (near-silences, then the stamps), so loudnorm works in its dynamic mode and lands under
# what it's asked for; how far depends on the mix. So part 1 is asked again with the shortfall added back, until the
# mix measures -16.0.
I1 = -16.0
P = lambda n: os.path.join(here, n)
T = lambda n: os.path.join('/tmp/fyfilm', n)
UV = ['uv', 'run', '--with', 'numpy', '--with', 'scipy', 'python']
X264 = ['-c:v', 'libx264', '-preset', 'slow', '-crf', '23', '-pix_fmt', 'yuv420p', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709']


def read(path):
    with wave.open(path) as w:
        return np.frombuffer(w.readframes(w.getnframes()), '<i2').reshape(-1, 2).astype(np.float64) / 32767


def write(path, y):
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(y, -1, 1) * 32767).astype('<i2').tobytes())


def norm(src, dst, I, TP=-3.2, LRA=11):
    """kit/mux.py's two-pass loudnorm, written to a wav instead of muxed"""
    p = subprocess.run([FF, '-hide_banner', '-nostats', '-i', src, '-af', f'loudnorm=I={I}:TP={TP}:LRA={LRA}:print_format=json', '-f', 'null', '-'], capture_output=True, text=True)
    m = json.loads(p.stderr[p.stderr.rindex('{'):p.stderr.rindex('}') + 1])
    af = (f"loudnorm=I={I}:TP={TP}:LRA={LRA}:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
          f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,aresample=48000")
    subprocess.run([FF, '-hide_banner', '-loglevel', 'error', '-y', '-i', src, '-af', af, '-c:a', 'pcm_s16le', dst], check=True)


def r128(path, ss=None, t=None):
    cut = (['-ss', f'{ss:.3f}', '-t', f'{t:.3f}'] if ss is not None else [])
    q = subprocess.run([FF, '-hide_banner', '-nostats', *cut, '-i', path, '-map', '0:a', '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True)
    sm = q.stderr[q.stderr.rfind('Summary:'):].split()
    at = lambda k, n=1: sm[sm.index(k) + n]
    return f"I {at('I:')} LUFS, LRA {at('LRA:')} LU, true peak {at('Peak:')} dBTP"


def lufs(path):
    q = subprocess.run([FF, '-hide_banner', '-nostats', '-i', path, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True)
    sm = q.stderr[q.stderr.rfind('Summary:'):].split()
    return float(sm[sm.index('I:') + 1])


def frames(path):
    return int(subprocess.run([PROBE, '-v', 'error', '-count_frames', '-select_streams', 'v', '-show_entries', 'stream=nb_read_frames', '-of', 'csv=p=0', path], capture_output=True, text=True).stdout.strip())


def fit(a, n):
    a = a[:n]; return np.pad(a, ((0, n - len(a)), (0, 0)))


c1, c2 = json.load(open(P('cues-promo.json'))), json.load(open(P('cues-part2.json')))
pic1, pic2 = P('pictures/p1.mp4'), P('pictures/p2.mp4')   # the renders' masters (crf 17), not committed
n1, n2 = frames(pic1), frames(pic2)
d1, d2 = n1 / FPS, n2 / FPS
w1, w2 = T('v15-p1.wav'), T('v15-p2.wav')
subprocess.run(UV + [P('score.py'), P('cues-promo.json'), w1], check=True, cwd=film)
subprocess.run(UV + [P('score2.py'), P('cues-part2.json'), w2], check=True, cwd=film)

# each part set on its own: part 1 to -16 LUFS, part 2 REL LU under it
a1, a2 = T('v15-p1n.wav'), T('v15-p2n.wav')
t1 = I1
for _ in range(4):   # ask again with the shortfall added back, until the mix measures -16.0
    norm(w1, a1, t1); got = lufs(a1)
    if abs(got - I1) < .05: break
    t1 += I1 - got
norm(w2, a2, -16 - REL)
print(f'part 1: loudnorm asked for {t1:.2f} LUFS, the mix measures {got:.2f}')
mux = lambda v, a, o: subprocess.run([FF, '-hide_banner', '-loglevel', 'error', '-y', '-i', v, '-i', a, '-map', '0:v', '-map', '1:a', '-c:v', 'copy',
                                      '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', o], check=True)
# the promo alone: part 1's picture encoded once, with part 1's mix
enc1 = T('v15-p1.enc.mp4')
subprocess.run([FF, '-v', 'error', '-y', '-i', pic1, *X264, enc1], check=True)
promo = P('film-v1.5-promo.mp4')
mux(enc1, a1, promo)

# part 1 + part 2: joined, encoded once
# loudnorm lands each part near its target, not on it: set part 2 exactly REL LU under part 1 as measured
g = 10 ** ((lufs(a1) - REL - lufs(a2)) / 20)
both = T('v15-both.wav')
write(both, np.concatenate([fit(read(a1), round(d1 * SR)), fit(read(a2) * g, round(d2 * SR))]))
enc = T('v15.enc.mp4')
subprocess.run([FF, '-v', 'error', '-y', '-i', pic1, '-i', pic2, '-filter_complex', '[0:v][1:v]concat=n=2:v=1:a=0[v]', '-map', '[v]', *X264, enc], check=True)
out = P('film-v1.5.mp4')
mux(enc, both, out)

print(promo, r128(promo))
print(out, 'whole:', r128(out)); print('  part 1:', r128(out, 0, d1)); print('  part 2:', r128(out, d1, d2))
# QA: the three ramps (whole ramp, eased parts included), and part 2's pull and put-back
wins = []
for c in c1['cues']:
    if c['type'] == 'ramp': wins += [f"{(np.ceil(c['t'] * FPS) + .1) / FPS:.4f}", f"{(c['t'] + c['dur']) :.4f}"]   # from the ramp's first frame
pull = next(c for c in c2['cues'] if c['type'] == 'pull'); back = next(c for c in c2['cues'] if c['type'] == 'putback')
qa = os.path.join(film, 'kit', 'qa.py')
subprocess.run(['uv', 'run', '--with', 'numpy', 'python', qa, promo, *wins], check=True)
wins += [f"{d1 + pull['t'] + .07:.3f}", f"{d1 + pull['t'] + pull['dur'] - .07:.3f}", f"{d1 + back['t'] + .07:.3f}", f"{d1 + back['t'] + back['dur'] - .07:.3f}"]
subprocess.run(['uv', 'run', '--with', 'numpy', 'python', qa, out, *wins], check=True)
# posters: the promo mid-flight, slowed; part 2 on the old desk with its label
desk = next(c for c in c1['cues'] if c['type'] == 'ramp' and c['name'] == 'desk')
subprocess.run([FF, '-v', 'error', '-y', '-ss', f"{sum(desk['slow']) / 2:.3f}", '-i', promo, '-frames:v', '1', P('poster.png')], check=True)
lock = next(c['t'] for c in c2['cues'] if c['type'] == 'frame' and c['name'] == 'lock') - .6
subprocess.run([FF, '-v', 'error', '-y', '-ss', f'{d1 + lock:.3f}', '-i', out, '-frames:v', '1', P('poster-part2.png')], check=True)
subprocess.run(['python3', P('timing.py')], check=True)
for f in (promo, out): print(f, round(os.path.getsize(f) / 1e6, 1), 'MB')
print(f'part 1 {n1} frames ({d1:.2f} s) + part 2 {n2} frames ({d2:.2f} s) = {d1 + d2:.2f} s')
