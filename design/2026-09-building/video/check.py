# Checks the recordings a spec uses before composing: marks present, no late beats, no console/page/HTTP errors,
# and both sides the same length. Reads a long spec (segments, compose.mjs) or a montage spec (beats, montage.mjs).
# One error is known and allowed: the before site (5983c8b) asks for assets/fred-agent/fonts/DingTalkJinBuTi.woff2
# on every Fred Agent chapter, a 404 it has always had (PR 2 removed it); its console line goes with it.
# Usage: uv run --with pillow python check.py spec.json [rec_dir=/tmp/fybv/rec]
import json, sys
from pathlib import Path

spec = json.loads(Path(sys.argv[1]).read_text())
rec = Path(sys.argv[2] if len(sys.argv) > 2 else '/tmp/fybv/rec')
KNOWN = 'http 404: http://127.0.0.1:4314/assets/fred-agent/fonts/DingTalkJinBuTi.woff2'
GENERIC_404 = 'console.error: Failed to load resource: the server responded with a status of 404 (File not found)'
bad = 0


def errors(m):
    errs = list(m.get('errors', []))
    n = errs.count(KNOWN)
    errs = [e for e in errs if e != KNOWN]
    for _ in range(n):
        if GENERIC_404 in errs:
            errs.remove(GENERIC_404)
    return errs


if 'segments' in spec:
    items = [(s['before'], s['after'], s.get('from', 'start'), s.get('to', 'end'), f"{s['n']} {s['title']}") for s in spec['segments'] if s['kind'] == 'split']
else:
    items = [(f"{b['rec']}-before", f"{b['rec']}-after", b.get('from', 'start'), b.get('to', 'end'), b['rec']) for b in spec['beats']]
seen = set()
for before, after, a, b, name in items:
    spans = []
    for d in (before, after):
        m = json.loads((rec / d / 'marks.json').read_text())
        mk, issues = m['marks'], []
        if a not in mk or b not in mk:
            issues.append(f'missing mark {a}/{b}')
        else:
            spans.append(mk[b] - mk[a])
        issues += [f'late {x}' for x in m.get('late', [])] + errors(m)
        if (d, a, b) not in seen:
            print(f"{'FAIL' if issues else 'ok  '} {d:28} {a}→{b} " + '; '.join(issues))
            bad += bool(issues)
        seen.add((d, a, b))
    if len(spans) == 2 and abs(spans[0] - spans[1]) > 0.05:
        print(f'FAIL {name}: sides differ ({spans[0]:.2f}s vs {spans[1]:.2f}s)')
        bad += 1
print('all recordings ok' if not bad else f'{bad} problem(s)')
sys.exit(1 if bad else 0)
