// gallery-lib.mjs — shared helpers for the gallery-*.mjs checks (run through node /tmp/fyshot/run.mjs <steps>).
// Each check opens its own browser contexts (fresh sessionStorage, touch, reduced motion) from the runner's browser.
export const BASE = process.env.GALLERY_BASE || 'http://127.0.0.1:4173/';
export const URL = BASE + 'Gallery.dc.html';

// Counts requestAnimationFrame callbacks, so "0 rAF at idle" can be measured.
const RAF_COUNTER = () => {
  const raf = window.requestAnimationFrame.bind(window);
  window.__rafCalls = 0;
  window.requestAnimationFrame = (fn) => raf((t) => { window.__rafCalls++; fn(t); });
};

// A context with its own error/HTTP log. opts: width, height, touch, reduced.
export async function open(page, opts = {}) {
  const browser = page.context().browser();
  const ctx = await browser.newContext({
    viewport: { width: opts.width || 1440, height: opts.height || 900 }, deviceScaleFactor: 1,
    hasTouch: !!opts.touch, isMobile: !!opts.touch, reducedMotion: opts.reduced ? 'reduce' : 'no-preference'
  });
  await ctx.addInitScript(RAF_COUNTER);
  const p = await ctx.newPage(), errors = [], requests = [];
  p.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error') errors.push('console.error: ' + m.text()); });
  p.on('response', (r) => { requests.push(r.url()); if (r.status() >= 400 && !r.url().endsWith('favicon.ico')) errors.push('HTTP ' + r.status() + ' ' + r.url()); });
  p.on('requestfailed', (r) => { if (!/favicon/.test(r.url())) errors.push('failed ' + r.url() + ' ' + (r.failure() || {}).errorText); });
  return { ctx, page: p, errors, requests };
}

export async function load(p) {
  await p.goto(URL, { waitUntil: 'load' });
  await p.waitForSelector('.g-root[data-mode] .hang', { timeout: 30000 });
  await p.evaluate(() => document.fonts.ready);
}

// Wait until the shared loop and every animation are asleep (or time out).
export async function settle(p, ms = 9000) {
  return p.evaluate(async (ms) => {
    const t0 = performance.now();
    const busy = () => document.getAnimations().filter((a) => a.playState === 'running').length;
    for (;;) {
      const c0 = window.__rafCalls; await new Promise((r) => setTimeout(r, 300));
      if (window.__rafCalls === c0 && !busy()) return true;
      if (performance.now() - t0 > ms) return false;
    }
  }, ms);
}

export async function rafOver(p, ms = 2000) {
  return p.evaluate(async (ms) => { const c0 = window.__rafCalls; await new Promise((r) => setTimeout(r, ms)); return window.__rafCalls - c0; }, ms);
}

// A real-time pointer path (Playwright's own steps arrive back to back, which reads as a very fast flick).
// ease: 'out' decelerates into the target (aiming), 'lin' keeps its speed (a pass straight through).
export async function glide(p, a, b, ms, ease = 'out') {
  const n = Math.max(2, Math.round(ms / 16));
  for (let i = 1; i <= n; i++) {
    const t = i / n, e = ease === 'out' ? 1 - Math.pow(1 - t, 3) : t;
    await p.mouse.move(a.x + (b.x - a.x) * e, a.y + (b.y - a.y) * e);
    await p.waitForTimeout(16);
  }
}

// Production requests: nothing from /design/, no posts.js, no font masters, photos only from images/derived.
export function requestAudit(requests) {
  const bad = requests.filter((u) => /\/design\//.test(u) || /posts\.js/.test(u) || (/\/fonts\/[^/]+\.woff2/.test(u) && !/\/fonts\/derived\//.test(u)) || (/\/images\//.test(u) && !/\/images\/derived\//.test(u)));
  return { ok: bad.length === 0, bad };
}

export const overflow = (p) => p.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth }));

export function Report(ctx, tag) {
  const rows = [];
  return {
    ok(name, pass, detail = '') { rows.push(pass); ctx.log((pass ? 'PASS ' : 'FAIL ') + tag + ' · ' + name + (detail ? ' — ' + detail : '')); if (!pass) process.exitCode = 1; },
    info(s) { ctx.log('     ' + tag + ' · ' + s); },
    done() { const bad = rows.filter((x) => !x).length; ctx.log(tag + ': ' + (rows.length - bad) + '/' + rows.length + ' passed'); }
  };
}
