// Usage: node splice.mjs <base.mp4> <at_s> <insert.mp4> <out.mp4>
// Puts a composed insert into an existing cut, frame-exact, without touching the base file: base up to the frame at
// at_s, the insert, then the rest of the base. at_s should be a paper frame between two segments (every segment dips
// through paper at both ends, and so does a composed insert), so the joins need no transition of their own. The
// base's old footage is decoded and encoded once more, at the long cut's quality (crf 22; env CRF overrides).
import { execFileSync } from 'child_process';
import fs from 'fs';
import { ff, YUV, TAGS } from './cut.mjs';

const [base, at, insert, out] = process.argv.slice(2);
const probe = (f, e) => execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', e, '-of', 'csv=p=0', f]).toString().trim();
const [num, den] = probe(base, 'stream=r_frame_rate').split('/').map(Number), fps = num / (den || 1);
if (probe(insert, 'stream=width,height') !== probe(base, 'stream=width,height')) throw new Error('insert and base differ in size');
const k = Math.round(+at * fps);
const fc = [`[0:v]trim=end_frame=${k},setpts=PTS-STARTPTS,format=yuv420p[a]`, `[1:v]fps=${fps},setpts=PTS-STARTPTS,format=yuv420p[i]`,
  `[0:v]trim=start_frame=${k},setpts=PTS-STARTPTS,format=yuv420p[b]`, `[a][i][b]concat=n=3:v=1:a=0,${YUV}[v]`];
ff(['-i', base, '-i', insert, '-filter_complex', fc.join(';'), '-map', '[v]', '-r', String(fps), '-c:v', 'libx264', '-profile:v', 'high', '-crf', process.env.CRF || '22', '-preset', 'slow',
  ...TAGS, '-movflags', '+faststart', out]);
const dur = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', out]).toString().trim();
console.log('wrote', out, `${(+dur).toFixed(1)} s`, `${(fs.statSync(out).size / 1e6).toFixed(1)} MB`);
