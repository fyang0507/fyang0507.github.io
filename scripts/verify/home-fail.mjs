// Home · the opener can't get stuck: a blocked or failed module, a missing pen, or a slow module never leaves a flat
// or yellow screen. The <head>'s failsafe ends the wait on any input or at 6.5 s; the stage paints only once
// lib/home/opener.js is live; a missing Pen skips the OP and plays the fall.
//   node /tmp/fyshot/run.mjs scripts/verify/home-fail.mjs
const U = (process.env.BASE || 'http://127.0.0.1:4173/') + 'index.html';
const state = (p) => p.evaluate(() => ({ t: Math.round(performance.now()), opening: document.documentElement.classList.contains('opening'), live: document.documentElement.hasAttribute('data-opener-live'), stage: getComputedStyle(document.getElementById('oc-stage')).display, deskIn: getComputedStyle(document.querySelector('.desk-in')).visibility, mode: document.documentElement.dataset.opener }));
export default async (page, ctx) => {
  const ctxB = page.context().browser();
  for (const [name, route] of [['fall-stage.js blocked', /lib\/home\/fall-stage\.js/], ['pen.js blocked', /\/pen\.js$/]]) {
    for (const input of [false, true]) {
      const c = await ctxB.newContext({ viewport: { width: 1440, height: 900 } }), p = await c.newPage(), errs = [];
      p.on('pageerror', (e) => errs.push(e.message));
      await p.route(route, (r) => r.abort());
      await p.goto(U + '?opx=1&opener=first', { waitUntil: 'load' });
      // the tap lands on empty paper: if the opener has already ended, a live page must not navigate
      if (input) { await p.waitForTimeout(1200); await p.mouse.click(20, 880); await p.waitForTimeout(100); ctx.log(name, '· tap at 1.2 s →', JSON.stringify(await state(p))); }
      else {
        const done = p.evaluate(() => new Promise((r) => document.addEventListener('opx:done', (e) => r(e.detail), { once: true }))).catch(() => null);
        await p.waitForTimeout(1500); ctx.log(name, '· at 1.5 s', JSON.stringify(await state(p)));
        const d = await Promise.race([done, p.waitForTimeout(6000).then(() => null)]);
        ctx.log(name, '· opx:done', JSON.stringify(d), '· then', JSON.stringify(await state(p)));
        await p.screenshot({ path: `/tmp/fyshot/p3-home/fail-${name.split(' ')[0]}.png` });
      }
      ctx.log('   page errors:', errs.length ? errs.join(' | ') : 'none');
      await c.close();
    }
  }
  // a slow module (every lib/home file 3 s late): no yellow before it runs, plain paper instead
  const c = await ctxB.newContext({ viewport: { width: 1440, height: 900 } }), p = await c.newPage();
  await p.route(/lib\/home\/.*\.js$/, async (r) => { await new Promise((res) => setTimeout(res, 3000)); r.continue(); });
  await p.goto(U + '?opx=1&opener=first', { waitUntil: 'commit' });
  await p.waitForTimeout(1500);
  ctx.log('slow modules · at 1.5 s', JSON.stringify(await state(p)));
  await p.screenshot({ path: '/tmp/fyshot/p3-home/fail-slow-1500.png' });
  const d = await p.evaluate(() => new Promise((r) => document.addEventListener('opx:done', (e) => r(e.detail), { once: true }))).catch(() => null);
  ctx.log('slow modules · opx:done', JSON.stringify(d));
  await c.close();
};
