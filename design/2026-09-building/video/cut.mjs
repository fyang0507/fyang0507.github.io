// Shared by compose.mjs (the long cut) and montage.mjs (the 30 s cut): ffmpeg, the colour tags every encode
// carries, and cutting a window of a raw screencast (rec.mjs: JPEG frames with real timestamps) to constant fps.
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export const ff = (args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], { stdio: 'inherit' });
// Every encode leaves as limited-range BT.709 and says so. The screencast JPEGs are full-range BT.601 and
// the chrome is RGB; mixing them untagged made the concat misread the cards' range.
export const YUV = 'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p,setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709:range=tv';
export const TAGS = ['-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv'];
export const loopPng = (png, d, fps) => ['-loop', '1', '-framerate', String(fps), '-t', d.toFixed(3), '-i', png];

// A recording's frames and marks: files, each frame's timestamp (s), and marks.json.
export function frames(rec) {
  const m = JSON.parse(fs.readFileSync(path.join(rec, 'marks.json'), 'utf8'));
  const lines = fs.readFileSync(path.join(rec, 'list.txt'), 'utf8').split('\n');
  const files = lines.filter(l => l.startsWith('file ')).map(l => l.slice(6, -1)).slice(0, -1);
  const durs = lines.filter(l => l.startsWith('duration ')).map(l => +l.split(' ')[1]);
  let t = m.first; const ts = durs.map(d => (t += d) - d);
  return { m, files, ts };
}
// From mark `from` + t0 to mark `to` (or `from` + t1), played at `rate`, as an intermediate-quality mp4.
export const clip = (rec, from, to, t0, t1, rate, out, fps) => clips(rec, from, to, [[t0, t1, rate]], out, fps);
// Several windows [t0, t1, rate] of one recording joined in order, in one encode (exact timing, no seams).
// Returns the mp4 and where each window lands in it (s).
export function clips(rec, from, to, wins, out, fps) {
  const { m, files, ts } = frames(rec);
  if (m.marks[from] == null || m.marks[to] == null) throw new Error(`missing mark ${from}/${to} in ${rec}`);
  let list = '', last = '', t = 0;
  const at = [];
  for (const [t0, t1, rate = 1] of wins) {
    const a = m.marks[from] + (t0 ?? 0), b = t1 == null ? m.marks[to] : m.marks[from] + t1;
    let k = ts.findIndex(x => x > a);
    k = k < 0 ? files.length - 1 : Math.max(0, k - 1);   // the frame on screen at a
    for (; k < files.length && ts[k] < b; k++) {
      const s0 = Math.max(ts[k], a), s1 = Math.min(ts[k + 1] ?? b, b);
      list += `file '${files[k]}'\nduration ${((s1 - s0) / rate).toFixed(5)}\n`; last = files[k];
    }
    at.push([t, t + (b - a) / rate, rate]); t += (b - a) / rate;
  }
  list += `file '${last}'\n`;
  fs.writeFileSync(out + '.txt', list);
  ff(['-f', 'concat', '-safe', '0', '-i', out + '.txt', '-vf', `fps=${fps},${YUV}`, '-c:v', 'libx264', '-crf', '12', '-preset', 'fast', ...TAGS, out]);
  return { mp4: out, t, at };
}
