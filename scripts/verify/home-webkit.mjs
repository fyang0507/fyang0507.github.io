// Home · WebKit smoke pass (Playwright's WebKit build, the Safari engine): the static desk, a first visit and a
// returning run at 1440 and 390 finish with 0 console or page errors, and the desk is drawn at the end.
//   node /tmp/fyshot/run.mjs scripts/verify/home-webkit.mjs
import { webkit } from './vt-lib.mjs';
const U = (process.env.BASE || 'http://127.0.0.1:4173/') + 'index.html';
export default async (_page, ctx) => {
  const browser = await webkit(), errs = [];
  ctx.log('WebKit', browser.version());
  for (const w of [1440, 390]) {
    const c = await browser.newContext({ viewport: { width: w, height: w > 500 ? 900 : 844 } }), p = await c.newPage();
    p.on('pageerror', (e) => errs.push(w + ' pageerror ' + e.message));
    p.on('console', (m) => { if (m.type() === 'error') errs.push(w + ' ' + m.text()); });
    for (const q of ['?opener=none', '?opener=first', '?opener=returning']) {
      await p.goto(U + q, { waitUntil: 'load' });
      const d = q === '?opener=none' ? null : await p.evaluate(() => new Promise((r) => document.addEventListener('opx:done', (e) => r(e.detail), { once: true })));
      await p.waitForTimeout(900);
      const s = await p.evaluate(() => ({ scale: getComputedStyle(document.querySelector('.desk-in')).transform, opening: document.documentElement.classList.contains('opening'), ov: document.documentElement.scrollWidth - innerWidth }));
      ctx.log(w, q.padEnd(18), d ? 'done ' + d.ms + ' ms (' + d.score + ')' : 'static', '· plane', s.scale.slice(0, 22), '· opening', s.opening, '· overflow', s.ov);
      await p.screenshot({ path: `/tmp/fyshot/p3-home/webkit-${w}-${q.slice(8)}.png` });
    }
    await c.close();
  }
  await browser.close();
  ctx.log(errs.length ? 'WEBKIT ERRORS:\n' + errs.join('\n') : 'webkit: no console or page errors');
};
