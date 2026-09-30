// Shared helpers for scripts/verify/vt-*.mjs (run with node /tmp/fyshot/run.mjs <steps.mjs>, HANDOFF §9).
// hook() installs an init script that records every cross-document View Transition as it lands: whether
// pagereveal carried one, the pseudo-element animations and their keyframe counts, and per-frame samples of
// named groups. With sessionStorage 'vt-freeze' set before the click, it pauses the transition as soon as
// transitions.js has built it, so seek(ms) can pose it at exact times for measurement and screenshots.
import { createRequire } from 'module';

export const ORIGIN = process.env.VT_ORIGIN || 'http://127.0.0.1:4173';
export const H = ORIGIN + (process.env.VT_HARNESS === '0' ? '/' : '/scripts/verify/vt-harness/');

export async function hook(context, names = []) {
  await context.addInitScript((names) => {
    const rec = window.__vt = { vt: null, ready: false, fin: false, samples: [], anims: [], freeze: false };
    // when the current tab's label is chosen (tier 2) against pagereveal and fy:landed (the wheat band's wait)
    new MutationObserver(() => {
      const c = document.querySelector('.site-tab[aria-current="page"]');
      if (rec.tier2At == null && c && c.getAttribute('data-pen-tier') === '2') rec.tier2At = performance.now();
    }).observe(document, { attributes: true, subtree: true, attributeFilter: ['data-pen-tier'] });
    document.addEventListener('fy:landed', (e) => { rec.landedAt = performance.now(); rec.landedVt = !!(e.detail && e.detail.vt); });
    addEventListener('pagereveal', (e) => {
      const vt = e.viewTransition, html = document.documentElement;
      if (rec.revealAt == null) rec.revealAt = performance.now();
      rec.vt = !!vt; rec.fy = sessionStorage.getItem('fy-vt');
      rec.freeze = sessionStorage.getItem('vt-freeze') === '1'; sessionStorage.removeItem('vt-freeze');
      if (!vt) return;
      vt.finished.then(() => { rec.fin = true; rec.finAt = performance.now(); });
      // queued behind transitions.js's own ready callback, so its keyframes exist by now
      vt.ready.then(() => Promise.resolve().then(() => {
        rec.ready = true; rec.readyAt = performance.now(); rec.kind = html.getAttribute('data-vt');
        const all = document.getAnimations();
        rec.anims = all.filter(a => a.effect && a.effect.target === html && a.effect.pseudoElement)
          .map(a => {
            // the properties whose values actually change across the keyframes (a missing value is interpolated)
            const k = a.effect.getKeyframes(), skip = new Set(['offset', 'computedOffset', 'easing', 'composite']), props = new Set();
            k.forEach(f => Object.keys(f).forEach(p => { if (!skip.has(p)) props.add(p); }));
            const moving = [...props].filter(p => new Set(k.map(f => f[p]).filter(v => v !== undefined && v !== null)).size > 1);
            return { pe: a.effect.pseudoElement, ua: !!a.animationName, n: k.length, dur: a.effect.getComputedTiming().endTime, state: a.playState, moving };
          });
        if (rec.freeze) { all.forEach(a => a.pause()); return; }
        (function frame() {
          const t = performance.now() - rec.readyAt, s = { t };
          for (const n of names) {
            const cs = getComputedStyle(html, '::view-transition-group(' + n + ')');
            s[n] = cs.transform === 'none' ? null : cs.transform;
          }
          rec.samples.push(s);
          if (!rec.fin && t < 3000) requestAnimationFrame(frame);
        })();
      }), (err) => { rec.err = String(err); });
    });
    window.__seek = (ms) => document.getAnimations().forEach(a => { a.pause(); a.currentTime = ms; });
  }, names);
}

// pose a frozen transition at ms and let two frames paint (rule-live redraws from the paused clock)
export async function seek(page, ms) {
  await page.evaluate((ms) => window.__seek(ms), ms);
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
}

// Where each named group's old or new image is drawn (viewport px), composed from the pseudo-elements' own
// transforms and transform-origins: the group's, then the image's inside it.
export function drawn(page, names, part) {
  return page.evaluate(([names, part]) => {
    const html = document.documentElement;
    const mat = (s) => { if (!s || s === 'none') return [1, 0, 0, 1, 0, 0]; const n = s.match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi).map(Number); return s.startsWith('matrix3d') ? [n[0], n[1], n[4], n[5], n[12], n[13]] : n.slice(0, 6); };
    const mul = (A, B) => [A[0] * B[0] + A[2] * B[1], A[1] * B[0] + A[3] * B[1], A[0] * B[2] + A[2] * B[3], A[1] * B[2] + A[3] * B[3], A[0] * B[4] + A[2] * B[5] + A[4], A[1] * B[4] + A[3] * B[5] + A[5]];
    const eff = (cs) => { const o = cs.transformOrigin.split(' ').map(parseFloat); return mul([1, 0, 0, 1, o[0], o[1]], mul(mat(cs.transform), [1, 0, 0, 1, -o[0], -o[1]])); };
    const out = {};
    for (const n of names) {
      const g = getComputedStyle(html, `::view-transition-group(${n})`), i = getComputedStyle(html, `::view-transition-${part}(${n})`);
      const M = mul(eff(g), eff(i));
      out[n] = { x: +M[4].toFixed(2), y: +M[5].toFixed(2), w: +(parseFloat(i.width) * Math.hypot(M[0], M[1])).toFixed(2), h: +(parseFloat(i.height) * Math.hypot(M[2], M[3])).toFixed(2) };
    }
    return out;
  }, [names, part]);
}
// The desk's four objects as the page lays them out (viewport px)
export function deskBoxes(page) {
  return page.evaluate(() => Object.fromEntries(['laptop', 'book', 'frame', 'camera'].map((o) => { const r = document.querySelector('.desk-' + o).getBoundingClientRect(); return ['obj-' + o, { x: r.left, y: r.top, w: r.width, h: r.height }]; })));
}
// the largest gap between two sets of boxes, in px
export function gap(a, b) { return Math.max(...Object.keys(b).map((k) => a[k] ? Math.max(...['x', 'y', 'w', 'h'].map((p) => Math.abs(a[k][p] - b[k][p]))) : Infinity)); }

export function xy(m) {
  if (!m) return null;
  const n = m.match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi).map(Number);
  return m.startsWith('matrix3d') ? { x: n[12], y: n[13], a: n[0], b: n[1] } : { x: n[4], y: n[5], a: n[0], b: n[1] };
}

// WebKit through the same playwright-core the runner uses
export async function webkit() {
  const req = createRequire(process.argv[1]);
  const pw = await import(req.resolve('playwright-core'));
  return (pw.webkit || pw.default.webkit).launch({ headless: true });
}
// The runner's Chromium with the back/forward cache on: Playwright launches it with --disable-back-forward-cache, and a
// Back on a phone usually restores the page from that cache
export async function bfcache() {
  const req = createRequire(process.argv[1]);
  const pw = await import(req.resolve('playwright-core'));
  const exe = process.env.HOME + '/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
  return (pw.chromium || pw.default.chromium).launch({ executablePath: exe, headless: true, ignoreDefaultArgs: ['--disable-back-forward-cache'] });
}

export function check(results, name, ok, detail) {
  results.push({ name, ok: !!ok, detail });
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail != null ? '  · ' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) : ''));
}
