// Renders a test frame by frame: headless Chromium calls window.render(t) for every frame at 60 fps, a screenshot
// of the 1920×1080 viewport goes down a pipe to ffmpeg, and nothing depends on how long a frame takes.
//   node kit/render.mjs a-night                       → a-night/picture.mp4 and a-night/cues.json
//   node kit/render.mjs a-night --stills 0.5,3,6.2    → a-night/stills/t-0.50.png …
//   node kit/render.mjs a-night --sheet 12            → a-night/stills/sheet.png, 12 frames evenly spaced
//   node kit/render.mjs a-night --from 3 --to 5       → only that window (a draft)
// Renders take a lock (/tmp/fyfilm/render.lock), so several never compete for the CPU.
import { chromium } from '/tmp/fyshot/node_modules/playwright-core/index.mjs';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const film = path.join(here, '..');
const [name, ...rest] = process.argv.slice(2);
const arg = (k, d) => { const i = rest.indexOf('--' + k); return i < 0 ? d : rest[i + 1]; };
const dir = path.join(film, name);
const url = (process.env.BASE || 'http://127.0.0.1:4218') + '/design/2026-09-building/film/' + name + '/' + arg('page', 'index.html');
const exe = process.env.HOME + '/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const ffmpeg = '/opt/homebrew/bin/ffmpeg';

const lock = '/tmp/fyfilm/render.lock';
fs.mkdirSync('/tmp/fyfilm', { recursive: true });
for (;;) { try { fs.mkdirSync(lock); break; } catch { await new Promise((r) => setTimeout(r, 1000)); } }
const unlock = () => { try { fs.rmdirSync(lock); } catch {} };
process.on('exit', unlock); process.on('SIGINT', () => { unlock(); process.exit(1); });

const browser = await chromium.launch({ executablePath: exe, headless: true, args: ['--use-angle=metal', '--enable-gpu-rasterization', '--ignore-gpu-blocklist'] });
const VW = +arg('w', 1920), VH = arg('ar') === '9x16' ? Math.round(VW * 16 / 9) : Math.round(VW * 9 / 16);   // --w 1280 for a 720p draft, --ar 9x16 for a tall one (the page reads ?w= and ?ar= too)
const page = await browser.newPage({ viewport: { width: VW, height: VH }, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('response', (r) => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ' ' + r.url()); });
await page.goto(url, { waitUntil: 'load' });
await page.waitForFunction(() => window.READY !== undefined, null, { timeout: 60000 });
const ready = await page.evaluate(() => window.READY);
if (ready !== true) { console.log('not ready:', ready, errors); await browser.close(); process.exit(1); }
const { dur, fps, cues, timeline } = await page.evaluate(() => ({ dur: window.DUR, fps: window.FPS, cues: window.CUES, timeline: window.TIMELINE }));
if (!arg('page') || rest.includes('--cues')) fs.writeFileSync(path.join(dir, 'cues.json'), JSON.stringify({ dur, fps, timeline, cues }, null, 1));

const frame = async (t) => { await page.evaluate((t) => window.render(t), t); return page.screenshot({ type: 'png' }); };
const stillsDir = path.join(dir, 'stills'); fs.mkdirSync(stillsDir, { recursive: true });

if (arg('stills')) {
  for (const s of arg('stills').split(',').map(Number)) { fs.writeFileSync(path.join(stillsDir, 't-' + s.toFixed(2) + '.png'), await frame(s)); console.log('still', s); }
} else if (arg('sheet')) {
  const n = +arg('sheet'), ts = [...Array(n)].map((_, i) => +(dur * (i + .5) / n).toFixed(3));
  const list = arg('at') ? arg('at').split(',').map(Number) : ts;
  const files = [];
  for (const s of list) { const f = path.join(stillsDir, 'sb-' + s.toFixed(2) + '.png'); fs.writeFileSync(f, await frame(s)); files.push(f); }
  fs.writeFileSync(path.join(stillsDir, 'sheet.json'), JSON.stringify(list));
  console.log('sheet frames', list.join(' '));
} else {
  const from = +arg('from', 0), to = +arg('to', dur), n = Math.round((to - from) * fps);
  const out = path.join(dir, arg('out', 'picture.mp4'));
  const ff = spawn(ffmpeg, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', arg('crf', '17'), '-pix_fmt', 'yuv420p', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let i = 0; i < n; i++) {
    const buf = await frame(from + i / fps);
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (i % 120 === 0) console.log(`frame ${i}/${n}  ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r));
  console.log('wrote', out, n, 'frames in', ((Date.now() - t0) / 1000).toFixed(0), 's');
}
console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no errors');
await browser.close();
unlock();
