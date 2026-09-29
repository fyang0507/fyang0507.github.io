// Home · a cold first visit on a slow connection (Lighthouse's Slow 4G: 1.6 Mbps down, 150 ms RTT), no cache:
// the OP plays on time, the empty desk holds still, 「tap to skip · 点按跳过」 appears after 1.5 s of holding, and the
// opener is gone by 6.5 s whatever happens; a second run taps half a second into the hold and times the 250 ms fade.
//   node /tmp/fyshot/run.mjs scripts/verify/home-slow.mjs      (env KBPS=1600 VP=1440x900)
const U = (process.env.BASE || 'http://127.0.0.1:4173/') + 'index.html';
export default async (page, ctx) => {
  const kbps = +(process.env.KBPS || 1600), [w, h] = (process.env.VP || '1440x900').split('x').map(Number);
  await page.setViewportSize({ width: w, height: h });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.enable'); await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: kbps * 1024 / 8, uploadThroughput: 750 * 1024 / 8 });
  for (const tap of [false, true]) {
    await page.goto(U + '?opener=first&opx=1', { waitUntil: 'commit' });
    const done = page.evaluate(() => new Promise((r) => document.addEventListener('opx:done', (e) => r(e.detail), { once: true }))).catch(() => null);
    let fin = null, hintAt = null, tapped = false; done.then((d) => { fin = d; });
    for (let i = 0; i < 120 && !fin; i++) {
      await page.waitForTimeout(100);
      const s = await page.evaluate(() => { const i = window.OPX && OPX.info(), hn = document.querySelector('.skip-hint'); return { t: i ? Math.round(i.t) : null, phase: i && i.phase, hint: !!hn && getComputedStyle(hn).visibility === 'visible' }; }).catch(() => ({}));
      if (s.hint && hintAt == null) { hintAt = s.t; ctx.log('hint visible at clock', s.t, 'ms (cut at 1500)'); await ctx.shot(`/tmp/fyshot/p3-home/slow-${w}-hint.png`); }
      if (tap && !tapped && s.phase === 'desk' && s.t >= 2000) { tapped = true; const k = Date.now(); await page.mouse.click(w / 2, h / 2); const d = await done; ctx.log('tap during the hold →', JSON.stringify(d), 'fade', Date.now() - k, 'ms'); break; }
      if (i % 10 === 5 && !tap) await ctx.shot(`/tmp/fyshot/p3-home/slow-${w}-${String(s.t).padStart(5, '0')}.png`);
    }
    if (!tap) { const d = await done; ctx.log('untouched →', JSON.stringify(d)); await page.waitForTimeout(400); await ctx.shot(`/tmp/fyshot/p3-home/slow-${w}-end.png`); }
  }
};
