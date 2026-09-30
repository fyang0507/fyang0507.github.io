// Cuts a session's two recordings (rec.mjs: JPEG frames with real screencast timestamps) from mark('start') to
// mark('end') into constant 30 fps JPEG sequences, the same frame count on both sides, and writes the manifest.
//   node rec/cut.mjs <name>      reads /tmp/fyfilm/rec/<name>-{before,after}, writes /tmp/fyfilm/footage/<name>/
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const name = process.argv[2], FPS = 30;
const recs = (side) => `/tmp/fyfilm/rec/${name}-${side}`;
const out = `/tmp/fyfilm/footage/${name}`;
const ff = (args) => execFileSync('/opt/homebrew/bin/ffmpeg', ['-v', 'error', '-y', ...args], { stdio: 'inherit' });

function frames(rec) {
  const m = JSON.parse(fs.readFileSync(path.join(rec, 'marks.json'), 'utf8'));
  const lines = fs.readFileSync(path.join(rec, 'list.txt'), 'utf8').split('\n');
  const files = lines.filter((l) => l.startsWith('file ')).map((l) => l.slice(6, -1)).slice(0, -1);
  const durs = lines.filter((l) => l.startsWith('duration ')).map((l) => +l.split(' ')[1]);
  let t = m.first; const ts = durs.map((d) => (t += d) - d);
  return { m, files, ts };
}
const side = { before: frames(recs('before')), after: frames(recs('after')) };
const dur = Math.min(...['before', 'after'].map((s) => side[s].m.marks.end - side[s].m.marks.start));
const N = Math.floor(dur * FPS);
fs.rmSync(out, { recursive: true, force: true });
for (const s of ['before', 'after']) {
  const { m, files, ts } = side[s], a = m.marks.start, b = a + N / FPS + 0.2;
  let k = ts.findIndex((x) => x > a); k = k < 0 ? files.length - 1 : Math.max(0, k - 1);
  let list = '', last = '';
  for (; k < files.length && ts[k] < b; k++) {
    const s0 = Math.max(ts[k], a), s1 = Math.min(ts[k + 1] ?? b, b);
    list += `file '${files[k]}'\nduration ${(s1 - s0).toFixed(5)}\n`; last = files[k];
  }
  list += `file '${last}'\n`;
  fs.mkdirSync(`${out}/${s}`, { recursive: true });
  fs.writeFileSync(`${out}/${s}.txt`, list);
  ff(['-f', 'concat', '-safe', '0', '-i', `${out}/${s}.txt`, '-vf', `fps=${FPS}`, '-frames:v', String(N), '-q:v', '3', '-start_number', '0', `${out}/${s}/%06d.jpg`]);
  fs.rmSync(`${out}/${s}.txt`);
}
const count = (s) => fs.readdirSync(`${out}/${s}`).filter((f) => f.endsWith('.jpg')).length;
const meta = {
  name, fps: FPS, w: 1280, h: 1000, frames: Math.min(count('before'), count('after')), dur: +(N / FPS).toFixed(3),
  first: '000000.jpg',
  beats: side.after.m.beats || [], beats_before: side.before.m.beats || [],
  late: { before: side.before.m.late, after: side.after.m.late },
  errors: { before: side.before.m.errors, after: side.after.m.errors },
};
fs.writeFileSync(`${out}/meta.json`, JSON.stringify(meta, null, 1));
// review: both sides side by side, and a contact sheet every 2 s
ff(['-framerate', String(FPS), '-i', `${out}/before/%06d.jpg`, '-framerate', String(FPS), '-i', `${out}/after/%06d.jpg`,
  '-filter_complex', '[0]scale=640:-2[a];[1]scale=640:-2[b];[a][b]hstack', '-c:v', 'libx264', '-crf', '24', '-pix_fmt', 'yuv420p', `${out}/preview.mp4`]);
const cols = 4, rows = Math.ceil(meta.dur / 2 / cols);
ff(['-i', `${out}/preview.mp4`, '-vf', `fps=0.5,scale=640:-2,tile=${cols}x${rows}`, '-frames:v', '1', '-q:v', '4', `${out}/sheet.jpg`]);
console.log(name, 'frames', meta.frames, 'dur', meta.dur, 'late', JSON.stringify(meta.late), 'errors', JSON.stringify(meta.errors));
