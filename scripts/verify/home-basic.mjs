// Home · every width: no horizontal overflow, no requests to /design/, a clean console (the runner reports errors
// and non-2xx responses), for the static desk and a full first visit.
//   node /tmp/fyshot/run.mjs scripts/verify/home-basic.mjs
const U = (process.env.BASE || 'http://127.0.0.1:4173/') + 'index.html';
export default async (page, ctx) => {
  const design = [];
  page.on('request', (r) => { if (/\/design\//.test(r.url())) design.push(r.url()); });
  for (const [w, h] of [[1440, 900], [390, 844], [360, 740]]) {
    await page.setViewportSize({ width: w, height: h });
    for (const q of ['?opx=1&opener=none', '?opx=1&opener=first', '?opx=1&opener=returning']) {
      await page.goto(U + q, { waitUntil: 'load' });
      if (q !== '?opx=1&opener=none') await page.evaluate(() => new Promise((r) => document.addEventListener('opx:done', r, { once: true })));
      await page.waitForTimeout(1200);
      const o = await page.evaluate(() => ({ x: document.documentElement.scrollWidth - innerWidth, wide: [...document.querySelectorAll('body *')].filter((e) => { const r = e.getBoundingClientRect(); return r.right > innerWidth + 1 && getComputedStyle(e).position !== 'fixed' && !e.closest('.desk,.track,.view'); }).slice(0, 3).map((e) => e.tagName + '.' + (e.className.baseVal ?? e.className) + '@' + Math.round(e.getBoundingClientRect().right) + ' in ' + (e.parentElement.className.baseVal ?? e.parentElement.className)) }));
      ctx.log(w + 'x' + h, q.padEnd(18), 'overflowX', o.x, o.wide.length ? 'wide: ' + o.wide.join(' | ') : '');
      if (q === '?opx=1&opener=none') await ctx.shot(`/tmp/fyshot/p3-home/basic-${w}.png`);
    }
  }
  ctx.log('requests to /design/:', design.length ? design.join(', ') : 'none');
};
