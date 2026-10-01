// Usage: node rec.mjs <scenario.mjs> <baseURL> <outdir> [w h]
// Records one scenario through a CDP screencast (jpeg q90, every frame, real timestamps).
// A scenario is `export default async (page, ctx) => {...}`; it may `export const viewport = [w, h]`
// (default 1280×1000; widths under 800 get touch + isMobile). ctx:
//   base, page, context, log(...)
//   after               false when base is the before server (port 4314), else true; SIDE=before|after overrides
//   mark(name)          timestamp a moment; compose.mjs cuts each side from 'start' to 'end'
//   at(t)               wait until t seconds after mark('start'), so both sides hit each beat together
//   move(x, y, ms)      eased pointer glide with a slight bow (desk)
//   drag(from, to, ms)  press at from, glide to to, release
//   click(x, y, ms)     glide, then press and release
//   tap(x, y) / swipe(from, to, ms)   CDP touch (phone widths)
//   box(selector)       bounding box of the first match, or null
//   wheelTo(y, ms)      eased mouse-wheel scroll to page offset y (desk)
// Every page gets a recording-only overlay (an ink arrow that follows the mouse; a dot under
// each touch). It lives in the recording, never in the site. Export `overlay = false` to skip it.
// A fresh browser per run means empty sessionStorage, so first-visit behaviour (the opener) plays.
import { chromium } from '/tmp/fyshot/node_modules/playwright-core/index.mjs';
import { pathToFileURL } from 'url';
import path from 'path';
import fs from 'fs';
const [scn, base, out, aw, ah] = process.argv.slice(2);
const exe = process.env.HOME + '/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const mod = await import(pathToFileURL(path.resolve(scn)).href);
const [W, H] = aw ? [aw, ah] : (mod.viewport || [1280, 1000]);
const side = process.env.SIDE || (/:4314\b/.test(base) ? 'before' : 'after');
const phone = +W < 800;
fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out + '/f', { recursive: true });
const browser = await chromium.launch({ executablePath: exe, headless: true });
const context = await browser.newContext({ viewport: { width: +W, height: +H }, deviceScaleFactor: 1, hasTouch: phone, isMobile: phone });
if (mod.overlay !== false) await context.addInitScript({ path: path.join(path.dirname(new URL(import.meta.url).pathname), 'overlay.js') });
const page = await context.newPage();
const errors = [];
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
page.on('console', m => { if (m.type() === 'error') errors.push('console.error: ' + m.text()); });
page.on('response', r => { if (r.status() >= 400) errors.push(`http ${r.status()}: ${r.url()}`); });
const frames = []; const marks = {};
let n = 0;
const cdp = await context.newCDPSession(page);
cdp.on('Page.screencastFrame', async ({ data, metadata, sessionId }) => {
  const f = `${out}/f/${String(n++).padStart(6, '0')}.jpg`;
  fs.writeFileSync(f, Buffer.from(data, 'base64'));
  frames.push([f, metadata.timestamp]);
  try { await cdp.send('Page.screencastFrameAck', { sessionId }); } catch {}
});
await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 90, maxWidth: +W, maxHeight: +H, everyNthFrame: 1 });
const t0 = Date.now() / 1000;
const now = () => Date.now() / 1000;
const pos = [+W / 2, +H * 0.62];
const sleep = (ms) => page.waitForTimeout(Math.max(0, ms));
const ease = (t) => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const late = [];
const ctx = {
  base, page, context, after: side === 'after',
  log: (...a) => console.log(...a),
  mark: (name) => { marks[name] = now(); console.log('mark', name, (marks[name] - t0).toFixed(2)); },
  async at(t) {
    if (marks.start == null) throw new Error('at() before mark("start")');
    const w = marks.start + t - now();
    if (w < -0.08) late.push(`${t}s late by ${(-w).toFixed(2)}s`);
    await sleep(w * 1000);
  },
  async move(x, y, ms = 650) {
    const [x0, y0] = pos, dx = x - x0, dy = y - y0, d = Math.hypot(dx, dy);
    const bow = Math.min(36, d * .08), nx = d ? -dy / d : 0, ny = d ? dx / d : 0;
    const steps = Math.max(2, Math.round(ms / 16)), ts = Date.now();
    for (let i = 1; i <= steps; i++) {
      const t = i / steps, e = ease(t), b = Math.sin(Math.PI * e) * bow;
      await page.mouse.move(x0 + dx * e + nx * b, y0 + dy * e + ny * b);
      await sleep(ts + ms * t - Date.now());
    }
    pos[0] = x; pos[1] = y;
  },
  async drag([x0, y0], [x1, y1], ms = 900, { pre = 500, hold = 120 } = {}) {
    await ctx.move(x0, y0, pre);
    await page.mouse.down(); await sleep(hold);
    const steps = Math.max(2, Math.round(ms / 16)), ts = Date.now();
    for (let i = 1; i <= steps; i++) {
      const t = i / steps, e = ease(t);
      await page.mouse.move(x0 + (x1 - x0) * e, y0 + (y1 - y0) * e);
      await sleep(ts + ms * t - Date.now());
    }
    pos[0] = x1; pos[1] = y1;
    await sleep(60); await page.mouse.up();
  },
  async click(x, y, ms = 650) { await ctx.move(x, y, ms); await sleep(120); await page.mouse.down(); await sleep(90); await page.mouse.up(); },
  async tap(x, y, hold = 90) {
    const tp = [{ x, y, id: 1, radiusX: 8, radiusY: 8, force: 1 }];
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: tp });
    await sleep(hold);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  },
  async swipe([x0, y0], [x1, y1], ms = 450, { hold = 60, settle = 40 } = {}) {
    const pt = (x, y) => [{ x, y, id: 1, radiusX: 8, radiusY: 8, force: 1 }];
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt(x0, y0) });
    await sleep(hold);
    const steps = Math.max(2, Math.round(ms / 16)), ts = Date.now();
    for (let i = 1; i <= steps; i++) {
      const t = i / steps, e = 1 - Math.pow(1 - t, 2);
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(x0 + (x1 - x0) * e, y0 + (y1 - y0) * e) });
      await sleep(ts + ms * t - Date.now());
    }
    await sleep(settle);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  },
  async box(sel) { const el = await page.$(sel); return el ? el.boundingBox() : null; },
  // real wheel input, eased over ms: small per-frame deltas, so the page scrolls like a trackpad, not a jump
  async wheelTo(y1, ms) {
    const y0 = await page.evaluate(() => scrollY);
    const steps = Math.max(2, Math.round(ms / 16)), ts = Date.now();
    let sent = 0;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps, e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const d = Math.round((y1 - y0) * e) - sent;
      if (d) { await page.mouse.wheel(0, d); sent += d; }
      await sleep(ts + ms * t - Date.now());
    }
  },
};
try { await mod.default(page, ctx); } catch (e) { errors.push('STEP ERROR: ' + e.message); console.log('STEP ERROR:', e.stack); }
await sleep(300);
try { await cdp.send('Page.stopScreencast'); } catch {}
await browser.close();
// concat list with real durations; screencast timestamps are wall-clock seconds
let list = '';
for (let i = 0; i < frames.length; i++) {
  const d = i + 1 < frames.length ? frames[i + 1][1] - frames[i][1] : 0.1;
  list += `file '${path.resolve(frames[i][0])}'\nduration ${Math.max(d, 0.001).toFixed(4)}\n`;
}
list += `file '${path.resolve(frames[frames.length - 1][0])}'\n`;
fs.writeFileSync(out + '/list.txt', list);
fs.writeFileSync(out + '/marks.json', JSON.stringify({ first: frames[0]?.[1], marks, late, errors }, null, 1));
if (late.length) console.log('LATE:', late.join('; '));
console.log('frames', frames.length, errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no console/page errors');
