"""Sets the mix's loudness (two-pass EBU R128: -16 LUFS integrated, -1.5 dBTP) and muxes it with the picture.
   python3 kit/mux.py a-night/picture.mp4 a-night/mix.wav a-night/test.mp4
-16 rather than the platforms' -14: the tests are quiet films, and the loud end of a mix is the stamp, not the bed."""
import json
import subprocess
import sys

FF = '/opt/homebrew/bin/ffmpeg'
pic, wav, out = sys.argv[1:4]
I, TP, LRA = -16, -3.2, 11   # -3.2 in the mix leaves room for the AAC encoder's overshoot, so the file lands under -1.5 dBTP

p = subprocess.run([FF, '-hide_banner', '-nostats', '-i', wav, '-af', f'loudnorm=I={I}:TP={TP}:LRA={LRA}:print_format=json', '-f', 'null', '-'],
                   capture_output=True, text=True)
m = json.loads(p.stderr[p.stderr.rindex('{'):p.stderr.rindex('}') + 1])
af = (f"loudnorm=I={I}:TP={TP}:LRA={LRA}:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
      f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,aresample=48000")
subprocess.run([FF, '-hide_banner', '-loglevel', 'error', '-y', '-i', pic, '-i', wav, '-map', '0:v', '-map', '1:a', '-c:v', 'copy',
                '-af', af, '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out], check=True)
q = subprocess.run([FF, '-hide_banner', '-nostats', '-i', out, '-map', '0:a', '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True)
summary = q.stderr[q.stderr.rfind('Summary:'):]
print(out, ' '.join(summary.split()))
