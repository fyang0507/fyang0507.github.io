// cap/rec.mjs — deterministic capture of the real site on a virtual clock (cap/vclock.js): stage 2b's recorder.
//   node cap/rec.mjs <scenario.mjs> <side: after|before> <out dir>
// Real input (CDP mouse and wheel events) is sent between frames at exact virtual times, and every frame is a
// screenshot taken after the page's clock has been moved on by exactly one frame. A frame takes as long as it takes;
// the footage doesn't care. Navigations hold the clock until the next document has loaded, as if the network were
// instant, so a page's arrival lands on the same frame on every run.
// The scenario gets `s`: go(url), hold(sec), move(x, y, sec), press/release, click(x, y, sec), wheel(dy, sec),
// beat(name, what, kind), fps(n) (60 by default; 180 inside a replay window), shoot(on) (off = advance without
// frames: the before side only shoots its lift windows), box(sel), eval(fn, arg), after (bool), t (film seconds).
import { chromium } from '/tmp/fyshot/node_modules/playwright-core/index.mjs';
import { pathToFileURL } from 'url';
import path from 'path';
import fs from 'fs';

const [scn, side, out] = process.argv.slice(2);
const here = path.dirname(new URL(import.meta.url).pathname);
const exe = process.env.HOME + '/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
// SITE=main75 records the after side on another snapshot under /tmp/fyfilm (v1.5's second take: origin/main at 75e9790)
const BASE = process.env.SITE ? 'http://127.0.0.1:4219/' + process.env.SITE : { after: 'http://127.0.0.1:4219/main', before: 'http://127.0.0.1:4219/r0' }[side];
const DPR = +(process.env.DPR || 2), Q = +(process.env.Q || 90);
const mod = await import(pathToFileURL(path.resolve(scn)).href);
fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out + '/f', { recursive: true });

const browser = await chromium.launch({ executablePath: exe, headless: true, args: ['--disable-smooth-scrolling', '--disable-renderer-backgrounding', '--disable-background-timer-throttling'] });
const context = await browser.newContext({ viewport: { width: 1280, height: 1000 }, deviceScaleFactor: DPR });
await context.addInitScript({ path: path.join(here, 'vclock.js') });
if (process.env.CURSOR !== '0') await context.addInitScript({ path: path.join(here, 'cursor.js') });   // CURSOR=0: the film draws the hand itself, from the pointer track
if (mod.init) await context.addInitScript(mod.init);
const page = await context.newPage();
const cdp = await context.newCDPSession(page);
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push('console.error: ' + m.text()); });
page.on('response', (r) => { if (r.status() >= 400) errors.push('http ' + r.status() + ' ' + r.url()); });

let T = 0;              // film time, ms
let FPS = 60, SHOOT = true, n = 0, navPending = null;
const frames = [];      // [file, t s, fps, pointer x, pointer y, pressed]
const presses = [];     // t s of every press (the film's impact ticks)
const regions = {};     // name → { rect, frames: [[file, t]] }: high-resolution crops, for close-ups
let REGION = null;
const beats = [];
const pos = [640, 620];
page.on('framenavigated', (f) => { if (f === page.mainFrame() && navPending === null) navPending = page.waitForLoadState('load').catch(() => {}); });

async function settleNav() {
  if (!navPending) return;
  const p = navPending; await p;
  await page.waitForFunction(() => !!window.__vtick, null, { timeout: 20000 }).catch(() => {});
  // the arrival is the same on every run: fonts in, images above the fold decoded, the view transition set up
  try { await page.evaluate(() => Promise.all([document.fonts.ready, window.__vtReady, ...[...document.images].filter((i) => i.loading !== 'lazy').map((i) => i.complete ? 0 : i.decode().catch(() => 0))])); } catch {}
  navPending = null;
}
async function step() {
  const dt = 1000 / FPS;
  T += dt;
  await settleNav();
  // the tick returns the scroll, because a screenshot's clip is in page coordinates
  const tick = (t) => { if (window.__vtick) window.__vtick(t); return [scrollX, scrollY]; };
  let sc = [0, 0];
  try { sc = await page.evaluate(tick, T); } catch (e) { await settleNav(); try { sc = await page.evaluate(tick, T); } catch {} }
  if (SHOOT) {
    // the viewport at DPR device pixels: Page.captureScreenshot returns CSS pixels unless the clip asks for a scale
    // (v1's footage, shot without it, is 1280 × 1000 whatever the context's deviceScaleFactor said)
    const r = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: Q, optimizeForSpeed: true, clip: { x: sc[0], y: sc[1], width: 1280, height: 1000, scale: DPR } });
    const f = String(n++).padStart(6, '0') + '.jpg';
    fs.writeFileSync(path.join(out, 'f', f), Buffer.from(r.data, 'base64'));
    frames.push([f, +(T / 1000).toFixed(5), FPS, Math.round(pos[0] * 10) / 10, Math.round(pos[1] * 10) / 10, held ? 1 : 0]);
    if (REGION) {
      const { name, x, y, w, h, scale } = REGION;
      const rr = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 92, optimizeForSpeed: true, clip: { x: sc[0] + x, y: sc[1] + y, width: w, height: h, scale } });
      const rf = name + '-' + String(n - 1).padStart(6, '0') + '.jpg';
      fs.mkdirSync(path.join(out, 'r'), { recursive: true }); fs.writeFileSync(path.join(out, 'r', rf), Buffer.from(rr.data, 'base64'));
      (regions[name] = regions[name] || { rect: [x, y, w, h], scale, frames: [] }).frames.push([rf, +(T / 1000).toFixed(5)]);
    }
  }
}
const ease = (t) => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const mouse = (type, x, y, extra = {}) => cdp.send('Input.dispatchMouseEvent', { type, x, y, button: extra.button || 'none', buttons: extra.buttons || 0, clickCount: extra.clickCount || 0, deltaX: extra.dx || 0, deltaY: extra.dy || 0, pointerType: 'mouse' });
let held = false;
const s = {
  after: side === 'after', side, base: BASE, page, beats,
  get t() { return T / 1000; },
  fps(n) { FPS = n; }, shoot(on) { SHOOT = on; },
  beat(name, what = '', kind = 'event') { beats.push({ t: +(T / 1000).toFixed(4), name, what, kind, x: Math.round(pos[0]), y: Math.round(pos[1]) }); },
  async go(url) {
    navPending = page.goto(BASE + '/' + url, { waitUntil: 'load' }).catch((e) => errors.push('goto ' + e.message));
    await settleNav();
    await page.evaluate((t) => { try { sessionStorage.setItem('fy-film-vt', String(t)); } catch (e) {} }, T);
  },
  async hold(sec) { const k = Math.round(sec * FPS); for (let i = 0; i < k; i++) await step(); },
  async until(sec) { while (T / 1000 < sec - 1e-6) await step(); },
  async move(x, y, sec = .7) {
    const [x0, y0] = pos, dx = x - x0, dy = y - y0, d = Math.hypot(dx, dy);
    const bow = Math.min(36, d * .08), nx = d ? -dy / d : 0, ny = d ? dx / d : 0, k = Math.max(1, Math.round(sec * FPS));
    for (let i = 1; i <= k; i++) {
      const e = ease(i / k), b = Math.sin(Math.PI * e) * bow;
      pos[0] = x0 + dx * e + nx * b; pos[1] = y0 + dy * e + ny * b;
      await mouse('mouseMoved', pos[0], pos[1], held ? { button: 'left', buttons: 1 } : {});
      await step();
    }
    pos[0] = x; pos[1] = y;
  },
  async press() { held = true; presses.push(+(T / 1000).toFixed(4)); await mouse('mousePressed', pos[0], pos[1], { button: 'left', buttons: 1, clickCount: 1 }); },
  async key(key, code, vk) { await cdp.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key, code, windowsVirtualKeyCode: vk }); await step(); await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: vk }); },
  // region(name, [x, y, w, h], scale): also shoot that part of the page at DPR × scale, until region(null)
  region(name, rect, scale = 1.5) { REGION = name ? { name, x: rect[0], y: rect[1], w: rect[2], h: rect[3], scale } : null; },
  async release() { held = false; await mouse('mouseReleased', pos[0], pos[1], { button: 'left', buttons: 0, clickCount: 1 }); },
  async click(x, y, sec = .6) { if (x != null) await s.move(x, y, sec); await s.hold(.1); await s.press(); await s.hold(.09); await s.release(); },
  // a click that navigates: the clock waits at the release until the next document has committed and settled
  async clickNav(x, y, sec = .6) {
    if (x != null) await s.move(x, y, sec); await s.hold(.1); await s.press(); await s.hold(.09);
    const nav = page.waitForEvent('framenavigated', { predicate: (f) => f === page.mainFrame(), timeout: 15000 }).catch(() => null);
    await s.release(); await nav; if (!navPending) navPending = page.waitForLoadState('load').catch(() => {}); await settleNav();
  },
  async drag(x, y, sec = .9) { await s.press(); await s.hold(.12); await s.move(x, y, sec); await s.hold(.05); await s.release(); },
  async wheel(dy, sec = 1) {
    const k = Math.max(1, Math.round(sec * FPS)); let done = 0;
    for (let i = 1; i <= k; i++) { const want = Math.round(dy * ease(i / k)); const d = want - done; done = want; if (d) await mouse('mouseWheel', pos[0], pos[1], { dy: d }); await step(); }
  },
  async box(sel) { const el = await page.$(sel); return el ? el.boundingBox() : null; },
  eval: (fn, arg) => page.evaluate(fn, arg),
};
const t0 = Date.now();
try { await mod.default(s); } catch (e) { errors.push('STEP ERROR: ' + e.message); console.log(e.stack); }
await browser.close();
fs.writeFileSync(path.join(out, 'meta.json'), JSON.stringify({ side, dpr: DPR, frames, beats, presses, regions, errors, dur: T / 1000, wall: (Date.now() - t0) / 1000 }, null, 1));
// A view transition the site meant to play but that was skipped (a race in real time, not in the clock: 2 of 4 runs of
// take-v11 lost #35's flight into Principles this way) is a failed take: say so, and exit non-zero, so it gets re-shot.
if (errors.some((e) => /Transition was skipped/.test(e))) { console.log('WARNING: a view transition was skipped; re-record this take'); process.exitCode = 2; }
console.log(side, 'frames', frames.length, 'film', (T / 1000).toFixed(2), 's in', ((Date.now() - t0) / 1000).toFixed(0), 's wall', errors.length ? '\nERRORS:\n' + errors.slice(0, 12).join('\n') : 'no errors');
