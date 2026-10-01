// Usage: node compose.mjs <spec.json> <out.mp4>
// Renders the chrome layers for each segment (chrome.html in headless Chromium), composes the
// before/after screencasts side by side with ffmpeg, dips each segment through paper, and joins them.
// Recording dirs in the spec resolve against $VIDEO_REC (default /tmp/fybv/rec); scratch goes to
// $VIDEO_WORK (default /tmp/fybv/work). Neither belongs in the repo.
//
// Segment kinds:
// spec.labels = {before, after} names the sides on every split (default: the site today / the redesign).
//   card   {k, title, zh, cap, capzh, foot, bird, dur}
//   split  {mode: desk|phone, n, title, zh, before, after, from='start', to='end',
//           lead=0.6 (first frame held while the title reads), hold=0.7 (tail after the longer side),
//           beats: [{t, b, bzh, a, azh}],  t = seconds after `from`; each beat's captions show until the next
//           replay: {t0, t1, rate, crop: [x, y, w, h] (viewport px, pane aspect), note, b, bzh, a, azh}}
//           replays t0..t1 (seconds after `from`) slowed to `rate` right after the segment, optionally zoomed
import { chromium } from '/tmp/fyshot/node_modules/playwright-core/index.mjs';
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { ff, YUV, TAGS, loopPng as loop, clip as cut } from './cut.mjs';
const [specPath, outPath] = process.argv.slice(2);
const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
const here = path.dirname(new URL(import.meta.url).pathname);
const REC = path.resolve(process.env.VIDEO_REC || '/tmp/fybv/rec');
const work = path.resolve(process.env.VIDEO_WORK || '/tmp/fybv/work'); fs.mkdirSync(work, { recursive: true });
const only = process.env.ONLY ? new Set(process.env.ONLY.split(',').map(Number)) : null;
const FPS = spec.fps || 60;
const PAPER = '0xFBF6EC', DIP = 0.25;
const GEO = {
  desk: { mode: 'desk', panes: [{ x: 36, y: 150, w: 912, h: 712 }, { x: 972, y: 150, w: 912, h: 712 }], cap: { y: 894 } },
  phone: { mode: 'phone', panes: [{ x: 530, y: 180, w: 390, h: 844 }, { x: 1000, y: 180, w: 390, h: 844 }], cap: { y: 440 } },
};
const exe = process.env.HOME + '/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const browser = await chromium.launch({ executablePath: exe, headless: true });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
async function chrome(params, png) {
  await page.goto('file://' + path.join(here, 'chrome.html') + '?' + new URLSearchParams(params));
  await page.waitForSelector('body[data-ready="1"]'); await page.waitForTimeout(120);
  await page.screenshot({ path: png, omitBackground: params.layer === 'top' || params.layer === 'cap' });
  return png;
}
const clip = (rec, from, to, t0, t1, rate, out) => cut(rec, from, to, t0, t1, rate, out, FPS);   // a window of the raw screencast, retimed to constant fps
const loopPng = (png, d) => loop(png, d, FPS);
const dips = (d, i = DIP, o = DIP) => `fade=t=in:st=0:d=${i}:color=${PAPER},fade=t=out:st=${(d - o).toFixed(3)}:d=${o}:color=${PAPER}`;
// One side-by-side part: both recordings cut from `from`+t0 to `to` (or `from`+t1), played at `rate`.
async function part(s, tag, { t0, t1, rate = 1, crop, lead, hold, beats, note, dipIn = DIP, dipOut = DIP }) {
  const G = GEO[s.mode || 'desk'], geo = JSON.stringify(G);
  const L = spec.labels || {}, head = { kind: 'split', geo, n: s.n || '', title: s.title, zh: s.zh || '', note: note || '', bl: L.before || '', al: L.after || '' };
  const base = await chrome({ ...head, layer: 'base' }, path.join(work, `c${tag}-base.png`));
  const top = await chrome({ ...head, layer: 'top' }, path.join(work, `c${tag}-top.png`));
  const caps = [];
  for (const [k, bt] of beats.entries()) caps.push(await chrome({ ...head, layer: 'cap', b: bt.b || '', bzh: bt.bzh || '', a: bt.a || '', azh: bt.azh || '' }, path.join(work, `c${tag}-cap${k}.png`)));
  const from = s.from || 'start', to = s.to || 'end';
  const cb = clip(path.resolve(REC, s.before), from, to, t0, t1, rate, path.join(work, `c${tag}-b.mp4`));
  const ca = clip(path.resolve(REC, s.after), from, to, t0, t1, rate, path.join(work, `c${tag}-a.mp4`));
  const d = lead + Math.max(cb.t, ca.t) + hold;
  const [pb, pa] = G.panes;
  const zoom = crop ? `crop=${crop[2]}:${crop[3]}:${crop[0]}:${crop[1]},` : '';
  const side = (n, p, c, lbl) => `[${n}:v]${zoom}scale=${p.w}:${p.h}:flags=lanczos,format=rgb24,setpts=PTS-STARTPTS,tpad=start_mode=clone:start_duration=${lead}:stop_mode=clone:stop_duration=${(d - lead - c.t + 0.5).toFixed(3)}[${lbl}]`;
  const fc = [side(1, pb, cb, 'b'), side(2, pa, ca, 'a'), `[0:v]format=rgb24[bg]`, `[bg][b]overlay=${pb.x}:${pb.y}:format=rgb[v0]`, `[v0][a]overlay=${pa.x}:${pa.y}:format=rgb[v1]`, `[v1][3:v]overlay=0:0:format=rgb[v2]`];
  let last = 'v2';
  beats.forEach((bt, k) => { // beat k shows from its t (scaled by rate) until the next beat
    const at = (x) => lead + x / rate;
    const st = k === 0 ? 0 : at(bt.t), en = k + 1 < beats.length ? at(beats[k + 1].t) : d;
    const fin = k === 0 ? '' : `,fade=t=in:st=${st.toFixed(3)}:d=0.25:alpha=1`;
    const fout = k + 1 < beats.length ? `,fade=t=out:st=${(en - .2).toFixed(3)}:d=0.2:alpha=1` : '';
    fc.push(`[${4 + k}:v]format=rgba${fin}${fout}[k${k}]`, `[${last}][k${k}]overlay=0:0:format=rgb:enable='between(t,${Math.max(0, st - .01).toFixed(3)},${en.toFixed(3)})'[w${k}]`);
    last = `w${k}`;
  });
  fc.push(`[${last}]${dips(d, dipIn, dipOut)},${YUV}[v]`);
  const out = path.join(work, `seg${tag}.mp4`);
  ff([...loopPng(base, d), '-i', cb.mp4, '-i', ca.mp4, ...loopPng(top, d), ...caps.flatMap(c => loopPng(c, d)),
    '-filter_complex', fc.join(';'), '-map', '[v]', '-t', d.toFixed(3), '-r', String(FPS), '-c:v', 'libx264', '-crf', '12', '-preset', 'fast', ...TAGS, out]);
  return out;
}
const segs = [];
for (const [i, s] of spec.segments.entries()) {
  const tag = String(i).padStart(2, '0');
  const r = s.replay;
  const outs = s.kind === 'card' ? [path.join(work, `seg${tag}.mp4`)] : [path.join(work, `seg${tag}.mp4`), ...(r ? [path.join(work, `seg${tag}r.mp4`)] : [])];
  segs.push(...outs);
  if (only && !only.has(i)) { console.log('segment', i, 'kept'); continue; }
  if (s.kind === 'card') {
    const png = await chrome({ kind: 'card', k: s.k || '', title: s.title, zh: s.zh || '', cap: s.cap || '', capzh: s.capzh || '', foot: s.foot || '', bird: s.bird ? '1' : '' }, path.join(work, `c${tag}.png`));
    const d = s.dur || 4;
    ff([...loopPng(png, d), '-vf', `format=rgb24,${dips(d)},${YUV}`, '-c:v', 'libx264', '-crf', '12', '-preset', 'fast', '-r', String(FPS), ...TAGS, outs[0]]);
  } else {
    await part(s, tag, { lead: s.lead ?? 0.6, hold: s.hold ?? 0.7, beats: s.beats || [], dipOut: r ? 0.15 : DIP });
    if (r) await part(s, tag + 'r', { t0: r.t0, t1: r.t1, rate: r.rate, crop: r.crop, lead: r.lead ?? 0.3, hold: r.hold ?? 0.6, note: r.note || `replay · ${r.rate}× speed`, dipIn: 0.15, beats: [{ t: 0, b: r.b, bzh: r.bzh, a: r.a, azh: r.azh }] });
  }
  console.log('segment', i, s.kind, s.title);
}
await browser.close();
fs.writeFileSync(path.join(work, 'concat.txt'), segs.map(s => `file '${s}'`).join('\n'));
ff(['-f', 'concat', '-safe', '0', '-i', path.join(work, 'concat.txt'), '-c:v', 'libx264', '-crf', String(spec.crf || 22), '-preset', 'slow', '-pix_fmt', 'yuv420p', '-r', String(FPS), ...TAGS, '-movflags', '+faststart', outPath]);
const dur = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', outPath]).toString().trim();
console.log('wrote', outPath, `${(+dur).toFixed(1)} s`, `${(fs.statSync(outPath).size / 1e6).toFixed(1)} MB`);
