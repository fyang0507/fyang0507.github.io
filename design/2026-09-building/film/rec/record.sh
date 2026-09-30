#!/bin/sh
# Records the film's sessions, before (6237120) then after (origin/main), one browser at a time, then cuts each.
#   rec/record.sh                 every session
#   rec/record.sh s2              only sessions whose names start with s2
# Needs both snapshots served on :4219 (see ../README.md): /main is origin/main, /r0 is 6237120.
# Takes the renders' lock (/tmp/fyfilm/render.lock), so a recording never shares the CPU with a render.
cd "$(dirname "$0")"
lock() { until mkdir /tmp/fyfilm/render.lock 2>/dev/null; do sleep 1; done; }
unlock() { rmdir /tmp/fyfilm/render.lock 2>/dev/null; }
trap unlock EXIT INT TERM
for f in scenarios/*.mjs; do
  n=$(basename "$f" .mjs)
  if [ -n "$1" ]; then case "$n" in "$1"*) ;; *) continue ;; esac; fi
  for side in before after; do
    if [ "$side" = before ]; then base=http://127.0.0.1:4219/r0; else base=http://127.0.0.1:4219/main; fi
    lock
    SIDE=$side node rec.mjs "$f" "$base" "/tmp/fyfilm/rec/$n-$side" 1280 1000
    s=$?; unlock; [ $s -eq 0 ] || exit 1
  done
  node cut.mjs "$n" || exit 1
done
