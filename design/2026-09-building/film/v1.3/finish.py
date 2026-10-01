"""v1.3's finish. After the four renders (part 1 again from v1.1's own page, v1.3/part1.html, and part 2 from
v1.3/index.html, each at 16:9 and 9:16): score both parts, set each to its loudness (part 1 as v1.1 did, part 2 REL LU under it),
join them, encode, run QA, and write the posters and the part 2 shot list. Part 1 alone is v1.1's file, copied.
   uv run --with numpy python v1.3/finish.py  (from design/2026-09-building/film; the scores run under uv with numpy and scipy)"""
import json
import os
import shutil
import subprocess
import sys
import wave

import numpy as np

here = os.path.dirname(os.path.abspath(__file__))
film = os.path.dirname(here)
v11 = os.path.join(film, 'v1.1')
FF = '/opt/homebrew/bin/ffmpeg'
SR, FPS, REL = 48000, 60, 5.0     # part 2's integrated loudness, this many LU under part 1's
P = lambda n: os.path.join(here, n)
UV = ['uv', 'run', '--with', 'numpy', '--with', 'scipy', 'python']


def read(path):
    with wave.open(path) as w:
        return np.frombuffer(w.readframes(w.getnframes()), '<i2').reshape(-1, 2).astype(np.float64) / 32767


def write(path, y):
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(y, -1, 1) * 32767).astype('<i2').tobytes())


def loud(path, I=-16, TP=-3.2, LRA=11):
    p = subprocess.run([FF, '-hide_banner', '-nostats', '-i', path, '-af', f'loudnorm=I={I}:TP={TP}:LRA={LRA}:print_format=json', '-f', 'null', '-'], capture_output=True, text=True)
    return json.loads(p.stderr[p.stderr.rindex('{'):p.stderr.rindex('}') + 1])


def norm(src, dst, I, TP=-3.2, LRA=11):
    """kit/mux.py's two-pass loudnorm, written to a wav instead of muxed"""
    m = loud(src, I, TP, LRA)
    af = (f"loudnorm=I={I}:TP={TP}:LRA={LRA}:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
          f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,aresample=48000")
    subprocess.run([FF, '-hide_banner', '-loglevel', 'error', '-y', '-i', src, '-af', af, '-c:a', 'pcm_s16le', dst], check=True)


def r128(path, ss=None, t=None):
    cut = (['-ss', f'{ss:.3f}', '-t', f'{t:.3f}'] if ss is not None else [])
    q = subprocess.run([FF, '-hide_banner', '-nostats', *cut, '-i', path, '-map', '0:a', '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True)
    sm = q.stderr[q.stderr.rfind('Summary:'):].split()
    at = lambda k, n=1: sm[sm.index(k) + n]
    return f"I {at('I:')} LUFS, LRA {at('LRA:')} LU, true peak {at('Peak:')} dBTP"


def frames(path):
    return int(subprocess.run(['/opt/homebrew/bin/ffprobe', '-v', 'error', '-count_frames', '-select_streams', 'v', '-show_entries', 'stream=nb_read_frames', '-of', 'csv=p=0', path], capture_output=True, text=True).stdout.strip())


c2 = json.load(open(P('cues-part2.json')))
p2wav = '/tmp/fyfilm/v13-p2.wav'
subprocess.run(UV + [P('score.py'), P('cues-part2.json'), p2wav], check=True, cwd=film)
ONLY = sys.argv[1:]
for ar in ('16x9', '9x16'):
    if ONLY and ar not in ONLY: continue
    pic1, pic2 = P(f'pictures/p1-{ar}.mp4'), P(f'pictures/p2-{ar}.mp4')   # the renders' masters (crf 17), not committed
    n1, n2 = frames(pic1), frames(pic2)
    d1 = n1 / FPS
    # part 1's own score, as v1.1 made it, on v1.1's cues
    p1wav = f'/tmp/fyfilm/v13-p1-{ar}.wav'
    subprocess.run(UV + [os.path.join(v11, 'score.py'), os.path.join(v11, f'cues-30s-{ar}.json'), p1wav], check=True, cwd=film)
    # each part set to its loudness on its own, by kit/mux.py's two-pass loudnorm: part 1 exactly as v1.1 set it
    # (-16 LUFS), part 2 REL LU under it; then joined, so part 1's sound is v1.1's, and part 2 is felt quieter
    n1wav, n2wav = f'/tmp/fyfilm/v13-p1n-{ar}.wav', '/tmp/fyfilm/v13-p2n.wav'
    norm(p1wav, n1wav, -16); norm(p2wav, n2wav, -16 - REL)
    a1, a2 = read(n1wav)[:round(d1 * SR)], read(n2wav)[:round(n2 / FPS * SR)]
    a1 = np.pad(a1, ((0, round(d1 * SR) - len(a1)), (0, 0))); a2 = np.pad(a2, ((0, round(n2 / FPS * SR) - len(a2)), (0, 0)))
    both = f'/tmp/fyfilm/v13-both-{ar}.wav'
    write(both, np.concatenate([a1, a2]))
    enc = f'/tmp/fyfilm/v13-{ar}.enc.mp4'
    subprocess.run([FF, '-v', 'error', '-y', '-i', pic1, '-i', pic2, '-filter_complex', '[0:v][1:v]concat=n=2:v=1:a=0[v]', '-map', '[v]',
                    '-c:v', 'libx264', '-preset', 'slow', '-crf', '23', '-pix_fmt', 'yuv420p', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', enc], check=True)
    out = P(f'film-v1.3-{ar}.mp4')
    subprocess.run([FF, '-hide_banner', '-loglevel', 'error', '-y', '-i', enc, '-i', both, '-map', '0:v', '-map', '1:a', '-c:v', 'copy',
                    '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out], check=True)
    print(out, 'whole:', r128(out)); print('  part 1:', r128(out, 0, d1)); print('  part 2:', r128(out, d1, n2 / FPS))
    # QA: part 1's three ⅓× replays, and part 2's two paper moves (the join's pull, the end's put-back)
    c1 = json.load(open(os.path.join(v11, f'cues-30s-{ar}.json')))
    wins = []
    for s in c1['timeline']:
        if s['k'] == 'replay': wins += [str(round(s['t0'] + .05, 3)), str(round(s['t1'] - .05, 3))]
    pull = next(c for c in c2['cues'] if c['type'] == 'pull'); back = next(c for c in c2['cues'] if c['type'] == 'putback')
    wins += [str(round(d1 + pull['t'] + .07, 3)), str(round(d1 + pull['t'] + pull['dur'] - .07, 3)), str(round(d1 + back['t'] + .07, 3)), str(round(d1 + back['t'] + back['dur'] - .07, 3))]
    subprocess.run(['uv', 'run', '--with', 'numpy', 'python', os.path.join(film, 'kit', 'qa.py'), out, *wins], check=True)
    # part 1 alone: v1.1's file, as it is
    shutil.copyfile(os.path.join(v11, f'film-30s-{ar}.mp4'), P(f'film-v1.3-part1-{ar}.mp4'))
    shutil.copyfile(os.path.join(v11, f'poster-30s-{ar}.png'), P(f'poster-part1-{ar}.png'))
    desk = next(c['t'] for c in c2['cues'] if c['type'] == 'frame' and c['name'] == 'lock') - .6   # the old desk, whole, the label on it
    subprocess.run([FF, '-v', 'error', '-y', '-ss', f'{d1 + desk:.3f}', '-i', out, '-frames:v', '1', P(f'poster-part2-{ar}.png')], check=True)
    print(out, round(os.path.getsize(out) / 1e6, 1), 'MB', round(d1 + n2 / FPS, 2), 's (part 1', round(d1, 2), '+ part 2', round(n2 / FPS, 2), ')')
