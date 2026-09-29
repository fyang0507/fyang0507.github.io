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
    addEventListener('pagereveal', (e) => {
      const vt = e.viewTransition, html = document.documentElement;
      rec.vt = !!vt; rec.fy = sessionStorage.getItem('fy-vt');
      rec.freeze = sessionStorage.getItem('vt-freeze') === '1'; sessionStorage.removeItem('vt-freeze');
      if (!vt) return;
      vt.finished.then(() => { rec.fin = true; rec.finAt = performance.now(); });
      // queued behind transitions.js's own ready callback, so its keyframes exist by now
      vt.ready.then(() => Promise.resolve().then(() => {
        rec.ready = true; rec.readyAt = performance.now(); rec.kind = html.getAttribute('data-vt');
        const all = document.getAnimations();
        rec.anims = all.filter(a => a.effect && a.effect.target === html && a.effect.pseudoElement)
          .map(a => ({ pe: a.effect.pseudoElement, ua: !!a.animationName, n: a.effect.getKeyframes().length, dur: a.effect.getComputedTiming().endTime, state: a.playState }));
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

export function check(results, name, ok, detail) {
  results.push({ name, ok: !!ok, detail });
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail != null ? '  · ' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) : ''));
}
