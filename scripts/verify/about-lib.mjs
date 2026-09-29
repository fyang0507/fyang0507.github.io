// scripts/verify/about-lib.mjs — helpers for the About verify scripts (not a step file by itself).
// Real pointer paths through CDP on a real clock (≈125 Hz samples, like a trackpad). Profiles: 'flick' accelerates
// and lets go while still moving; 'drag' eases out and stops; 'linear'. State comes only from data-* on the host
// ([data-mount="about"]: data-state, data-face, data-zone, data-release) — the page exposes no globals.
export const URL = process.env.ABOUT_URL || 'http://127.0.0.1:4173/About.dc.html';
export const sleep = ms => new Promise(r => setTimeout(r, ms));
const PROF = {
  flick: t => (1 - Math.cos(t * .78 * Math.PI)) / (1 - Math.cos(.78 * Math.PI)),
  drag: t => 1 - Math.pow(1 - t, 2.2), linear: t => t
};

export async function open(page, w, h, opt = {}) {
  await page.setViewportSize({ width: w, height: h });
  if (opt.reduced) await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(opt.url || URL);
  await page.waitForSelector('[data-mount="about"][data-state]', { timeout: 20000 });
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await sleep(500);
}
export const S = page => page.evaluate(() => {
  const r = document.querySelector('[data-mount="about"]');
  return { st: r.dataset.state, face: r.dataset.face, rel: r.dataset.release || '', zone: (r.dataset.zone || '').split(',').map(Number) };
});
// The card's untransformed centre: card-pos's own box (the flip and tilt live on its child).
export const centre = page => page.evaluate(() => { const b = document.querySelector('.card-pos').getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2 + scrollY]; });
// Settled: a resting state and nothing moving on the card, the card-pos or the sleeve for three polls.
export async function settle(page, maxMs = 5000) {
  let last = '', same = 0;
  for (let t = 0; t < maxMs; t += 50) {
    await sleep(50);
    const k = await page.evaluate(() => {
      const r = document.querySelector('[data-mount="about"]');
      return r.dataset.state + '|' + ['.card-pos', '.a-card', '.sl-front'].map(s => document.querySelector(s).style.transform).join('|');
    });
    const st = k.split('|')[0];
    if (k === last && (st === 'free' || st === 'tucked')) { if (++same >= 3) return st; } else same = 0;
    last = k;
  }
  return 'unsettled';
}
export async function pullOut(page) {
  if ((await S(page)).st === 'free') return;
  await page.click('.ctl-pull'); await settle(page, 6000);
}
// Where the sleeve zone is on screen, from data-zone (rig coordinates).
export const zone = page => page.evaluate(() => {
  const r = document.querySelector('[data-mount="about"]'), g = document.querySelector('.rig').getBoundingClientRect();
  const z = r.dataset.zone.split(',').map(Number);
  return { x0: g.left + z[0], x1: g.left + z[1], y0: g.top + z[2], y1: g.top + z[3] };
});
export const card = async page => (await page.$('.a-card')).boundingBox();

let sessions = new WeakMap();
async function cdpOf(page) { if (!sessions.has(page)) sessions.set(page, await page.context().newCDPSession(page)); return sessions.get(page); }
export async function path(page, x0, y0, x1, y1, ms, opt = {}) {
  const cdp = await cdpOf(page), ease = PROF[opt.profile || 'drag'], dt = 8, n = Math.max(2, Math.round(ms / dt));
  const M = (type, x, y) => cdp.send('Input.dispatchMouseEvent', { type, x, y, button: 'left', buttons: type === 'mouseReleased' ? 0 : 1, clickCount: 1 });
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: x0, y: y0, buttons: 0 }); await sleep(30);
  await M('mousePressed', x0, y0);
  const t0 = Date.now();
  for (let i = 1; i <= n; i++) {
    const u = i / n; let x, y;
    if (opt.via) {
      const a = u < .5 ? [x0, y0, opt.via[0], opt.via[1], ease(u * 2)] : [opt.via[0], opt.via[1], x1, y1, ease((u - .5) * 2)];
      x = a[0] + (a[2] - a[0]) * a[4]; y = a[1] + (a[3] - a[1]) * a[4];
    } else { const t = ease(u); x = x0 + (x1 - x0) * t; y = y0 + (y1 - y0) * t; }
    M('mouseMoved', x, y);
    const w = t0 + i * dt - Date.now(); if (w > 0) await sleep(w);
    if (opt.at && opt.at[0] === i) await opt.at[1]();
  }
  if (opt.pause) await sleep(opt.pause);
  await M('mouseReleased', x1, y1);
  return Date.now() - t0;
}
// A per-frame sampler of the card's untransformed centre, relative to where it was when armed.
export async function sampleArm(page) {
  await page.evaluate(() => {
    const pos = document.querySelector('.card-pos'), b = pos.getBoundingClientRect();
    window.__c0 = [b.left + b.width / 2, b.top + b.height / 2 + scrollY]; window.__cmax = 0; window.__cn = 0; window.__con = true;
    (function f() { if (!window.__con) return; const r = pos.getBoundingClientRect(); window.__cmax = Math.max(window.__cmax, Math.hypot(r.left + r.width / 2 - window.__c0[0], r.top + r.height / 2 + scrollY - window.__c0[1])); window.__cn++; requestAnimationFrame(f); })();
  });
}
export const sampleRead = page => page.evaluate(() => { window.__con = false; const r = document.querySelector('.card-pos').getBoundingClientRect(); return { max: window.__cmax, end: Math.hypot(r.left + r.width / 2 - window.__c0[0], r.top + r.height / 2 + scrollY - window.__c0[1]), frames: window.__cn }; });
export const docW = page => page.evaluate(() => document.documentElement.scrollWidth);

export default async (page, ctx) => { ctx.log('about-lib.mjs is a helper for the about-*.mjs step files'); };
