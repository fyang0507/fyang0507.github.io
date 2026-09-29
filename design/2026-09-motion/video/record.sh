#!/bin/sh
# Usage: ./record.sh [scenario-name-prefix ...]   (no args = every scenario, both sides)
# Records each scenario against the before site (origin/main on :4174) and the after site (:4173),
# one at a time so recordings don't compete for CPU. Output: $VIDEO_REC/<name>-before|after.
cd "$(dirname "$0")"
REC="${VIDEO_REC:-/tmp/fyvideo/rec}"
for f in scenarios/*.mjs; do
  name=$(basename "$f" .mjs)
  if [ $# -gt 0 ]; then hit=0; for p in "$@"; do case "$name" in "$p"*) hit=1;; esac; done; [ $hit = 1 ] || continue; fi
  for side in before after; do
    [ "$side" = before ] && base=http://127.0.0.1:4174 || base=http://127.0.0.1:4173
    echo "== $name $side"
    node rec.mjs "$f" "$base" "$REC/$name-$side" || exit 1
  done
done
