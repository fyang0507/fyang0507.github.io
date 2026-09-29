# Checks the recordings a spec uses before composing: marks present, no late beats, no console/page/HTTP
# errors, both sides the same length, and the old site's opener painted its dark loader promptly (it loads
# React from unpkg at runtime, so an unlucky network take can sit on a blank page; re-record that side).
# Usage: uv run --with pillow python check.py spec.json [rec_dir=/tmp/fyvideo/rec]
import json, sys
from pathlib import Path
from PIL import Image, ImageStat

spec = json.loads(Path(sys.argv[1]).read_text())
rec = Path(sys.argv[2] if len(sys.argv) > 2 else '/tmp/fyvideo/rec')
bad = 0


def frames(d):
    lines = (d / 'list.txt').read_text().splitlines()
    files = [l[6:-1] for l in lines if l.startswith('file ')][:-1]
    durs = [float(l.split()[1]) for l in lines if l.startswith('duration ')]
    return files, durs


def loader_at(d, m):
    files, durs = frames(d)
    t = m['first']
    for f, dd in zip(files, durs):
        if t >= m['marks']['start'] and ImageStat.Stat(Image.open(f).convert('L').resize((64, 50))).mean[0] < 60:
            return t - m['marks']['start']
        t += dd
    return None


for s in spec['segments']:
    if s['kind'] != 'split':
        continue
    a, b = s.get('from', 'start'), s.get('to', 'end')
    spans = []
    for side in ('before', 'after'):
        d = rec / s[side]
        m = json.loads((d / 'marks.json').read_text())
        mk, issues = m['marks'], []
        if a not in mk or b not in mk:
            issues.append(f'missing mark {a}/{b}')
        else:
            spans.append(mk[b] - mk[a])
        issues += [f'late {x}' for x in m.get('late', [])] + m.get('errors', [])
        if s[side] == '02-arrive-before':
            t = loader_at(d, m)
            if t is None or t > 0.6:
                issues.append(f'dark loader first painted at {t}s (want < 0.6s): re-record this side')
        print(f"{'FAIL' if issues else 'ok  '} {s[side]:26} " + '; '.join(issues))
        bad += bool(issues)
    if len(spans) == 2 and abs(spans[0] - spans[1]) > 0.05:
        print(f'FAIL {s["n"]} {s["title"]}: sides differ ({spans[0]:.2f}s vs {spans[1]:.2f}s)')
        bad += 1
print('all recordings ok' if not bad else f'{bad} problem(s)')
sys.exit(1 if bad else 0)
