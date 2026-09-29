// Home · the opener on the real clock: first visit (warm), reload = the fall only, internal arrival = no opener,
// skip in each phase, reduced motion = the static desk at DOMContentLoaded, session memory only.
//   node /tmp/fyshot/run.mjs scripts/verify/home-live.mjs        (env VP=1440x900)
const B = process.env.BASE || 'http://127.0.0.1:4173/', U = B + 'index.html';
const done = (page) => page.evaluate(() => new Promise((r) => document.addEventListener('opx:done', (e) => r({ ...e.detail, wall: Math.round(performance.now()) }), { once: true })));
export default async (page, ctx) => {
  const [w, h] = (process.env.VP || '1440x900').split('x').map(Number), shot = (n) => ctx.shot(`/tmp/fyshot/p3-home/live-${w}-${n}.png`);
  await page.setViewportSize({ width: w, height: h });
  // warm the HTTP cache, then a fresh session
  await page.goto(U + '?opx=1&opener=none', { waitUntil: 'load' }); await page.waitForTimeout(800);
  await page.evaluate(() => sessionStorage.clear());
  // record what the first paint looks like: was the OP stage ever displayed?
  await page.addInitScript(() => {
    window.__seen = { op: false };
    new MutationObserver(() => { const s = document.getElementById('oc-stage'); if (s && getComputedStyle(s).display !== 'none') window.__seen.op = true; })
      .observe(document, { subtree: true, childList: true, attributes: true });
  });
  // arrive from outside the site: a same-origin previous entry (navigation.activation.from) would count as internal
  await page.goto('about:blank');
  await page.goto(U, { waitUntil: 'commit' });
  let d = await done(page);
  ctx.log('first visit', JSON.stringify(d), 'data-opener', await page.evaluate(() => document.documentElement.dataset.opener));
  ctx.log('  card', await page.evaluate(() => document.querySelector('.ep').innerText.replace(/\s+/g, ' ')), '· fy-opener', await page.evaluate(() => sessionStorage.getItem('fy-opener')));
  await page.waitForTimeout(900); await shot('first-landed');
  // reload in the same session: no OP frame, the fall only
  await page.reload({ waitUntil: 'commit' });
  d = await done(page);
  ctx.log('reload', JSON.stringify(d), 'OP stage ever shown:', await page.evaluate(() => window.__seen.op), 'data-opener', await page.evaluate(() => document.documentElement.dataset.opener));
  await page.waitForTimeout(900); await shot('reload-landed');
  // an internal arrival (a same-origin referrer): no opener at all
  await page.goto(U, { waitUntil: 'load', referer: B + 'Writing.dc.html' });
  ctx.log('internal arrival: data-opener', await page.evaluate(() => document.documentElement.dataset.opener), 'OP shown', await page.evaluate(() => window.__seen.op));
  // skip: a tap in the OP, a tap in the fall, a key in the card; each fades in 250 ms
  for (const [at, how] of [[600, 'tap'], [2200, 'tap'], [3000, 'key']]) {
    await page.evaluate(() => sessionStorage.clear());
    await page.goto(U + '?opx=1&opener=first', { waitUntil: 'commit' });
    const p = done(page);
    await page.waitForFunction((t) => window.OPX && OPX.info() && OPX.info().t >= t, at);
    const phase = await page.evaluate(() => (document.querySelector('.eye') ? 'card' : getComputedStyle(document.getElementById('oc-stage')).display !== 'none' ? 'op' : 'desk'));
    if (how === 'tap') await page.mouse.click(w / 2, h / 2); else await page.keyboard.press('Space');
    const k0 = Date.now(); const s = await p;
    ctx.log('skip', how, 'in', phase, JSON.stringify(s), 'fade ms ≈', Date.now() - k0);
    await page.waitForTimeout(400); await shot('skip-' + at);
  }
  // reduced motion: no opener, the plate visible at DOMContentLoaded
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.evaluate(() => sessionStorage.clear());
  await page.addInitScript(() => document.addEventListener('DOMContentLoaded', () => {
    const im = document.querySelector('.desk-plate img'), cs = getComputedStyle(document.querySelector('.desk-in'));
    window.__dcl = { opener: document.documentElement.dataset.opener, opening: document.documentElement.classList.contains('opening'), plate: !!im && getComputedStyle(im).visibility === 'visible' && cs.visibility === 'visible' && cs.opacity === '1' };
  }));
  await page.goto(U, { waitUntil: 'load' });
  ctx.log('reduced motion at DCL', JSON.stringify(await page.evaluate(() => window.__dcl)));
  await page.goto(U + '?opx=1&opener=first', { waitUntil: 'load' });
  ctx.log('reduced motion beats ?opx=1&opener=first:', await page.evaluate(() => document.documentElement.dataset.opener));
  await page.waitForTimeout(600);
  ctx.log('reduced motion: running animations', await page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').length));
  await shot('rm');
  ctx.log('localStorage keys', await page.evaluate(() => Object.keys(localStorage).join(',') || '(none)'), '· sessionStorage', await page.evaluate(() => Object.keys(sessionStorage).join(',')));
};
