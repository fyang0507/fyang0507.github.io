// scripts/verify/reading-lib.mjs — helpers for the Reading verify scripts (not a step file by itself).
// State comes only from the page: [data-mount="reading"][data-ready], .plate[data-depth], .rnav.landed,
// .rail[data-cur|data-done], .mn.on, .fs-root.open. The page exposes no globals.
//   env: READING_BASE (default http://127.0.0.1:4173/)
export const BASE = process.env.READING_BASE || 'http://127.0.0.1:4173/';
export const POSTS = {
  cover: '2026-08-29_google-just-wants-to-coast-to-a-win',   // sections 1.0…10.0, 9 refs (three double)
  darkest: '2019-12-02_the-promised-and-the-forsaken',        // the darkest cover: light paper's worst case for light text
  multi: '2025-12-06_the-stories-we-live-05',                // a [1, 2] citation, subtitle
  minutes: '2019-01-09_he-and-his-cat',                      // no structure: minute ticks
  headings: '2026-05-02_the-god-in-the-edit',                // headings + minute ticks
  figures: '2024-10-23_the-seemingly-innocent'               // (en) figures + minute ticks
};
export const url = (post, q = '') => BASE + 'Reading.dc.html?post=' + encodeURIComponent(post) + q;
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function context(browser, w, h, opt = {}) {
  const c = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: opt.dpr || 1, hasTouch: !!opt.touch, isMobile: !!opt.touch,
    reducedMotion: opt.reduced ? 'reduce' : 'no-preference', colorScheme: opt.dark ? 'dark' : 'light' });
  // storage is per context, so the head script reads ?lang/?theme or the emulated scheme, never a previous run
  return c;
}
export function watch(page, errors) {
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console.error: ' + m.text()); });
  page.on('response', (r) => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ' ' + r.url()); });
}
// Mounted, fonts in, the cover decoded, then two frames.
export async function ready(page) {
  await page.waitForSelector('[data-mount="reading"][data-ready]', { timeout: 20000 });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => new Promise((r) => {
    const img = document.querySelector('.plate-img'), go = () => requestAnimationFrame(() => requestAnimationFrame(r));
    if (!img || (img.complete && img.naturalWidth)) go(); else { img.addEventListener('load', go, { once: true }); img.addEventListener('error', go, { once: true }); }
  }));
}
export async function scroll(page, y, wait = 250) { await page.evaluate((y) => window.scrollTo(0, y), y); await sleep(wait); }
export const geo = (page) => page.evaluate(() => {
  const cs = getComputedStyle(document.documentElement), b0 = parseFloat(cs.getPropertyValue('--b0')), pad = parseFloat(cs.getPropertyValue('--pad'));
  return { b0, pad, sL: b0 - pad, max: document.documentElement.scrollHeight - innerHeight, vw: innerWidth, vh: innerHeight };
});
// Every canvas pixel with alpha > 0 must be the paper colour ±tol. Canvas readback is un-premultiplied, so a pixel at
// alpha a (an anti-aliased edge) carries up to one 8-bit step of 255/a: the tolerance is widened by that, no more.
export const paperOnly = (page, tol = 6) => page.evaluate((tol) => {
  const cv = document.querySelector('.plate canvas');
  if (!cv) return { ok: true, n: 0, bad: 0, note: 'no plate' };
  const v = getComputedStyle(document.documentElement).getPropertyValue('--paper').trim().replace('#', '');
  const P = [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16));
  const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
  let n = 0, bad = 0, worst = 0;
  for (let i = 0; i < d.length; i += 4) {
    const a = d[i + 3]; if (!a) continue;
    n++;
    const e = Math.max(Math.abs(d[i] - P[0]), Math.abs(d[i + 1] - P[1]), Math.abs(d[i + 2] - P[2])), lim = tol + 255 / a;
    if (e > lim) { bad++; worst = Math.max(worst, e); }
  }
  return { ok: bad === 0, n, bad, worst, depth: cv.closest('.plate').dataset.depth };
}, tol);
export function report(log, rows) {
  let fail = 0;
  rows.forEach(([name, ok, info]) => { if (!ok) fail++; log((ok ? 'PASS ' : 'FAIL ') + name + (info !== undefined ? '  ' + (typeof info === 'string' ? info : JSON.stringify(info)) : '')); });
  log(fail ? fail + ' FAILED' : 'ALL PASS (' + rows.length + ')');
  return fail;
}
