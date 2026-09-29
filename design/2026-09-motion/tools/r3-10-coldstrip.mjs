// r3-10 · KBPS=12000 node /tmp/fyshot/run.mjs design/2026-09-motion/tools/r3-10-coldstrip.mjs → /tmp/fyshot/r3-10/coldstrip-*
// A throttled cold load, shot at fixed instants of the run's clock: the cut, the hold, the hint, the fall, live.
import fs from 'fs';
const U = 'http://127.0.0.1:4173/design/2026-09-motion/r3-10-opener-page.html';
export default async (page, ctx) => {
  const kbps = +(process.env.KBPS || 12000), [w, h] = (process.env.VP || '1440x900').split('x').map(Number);
  await page.setViewportSize({ width: w, height: h });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.enable'); await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 60, downloadThroughput: kbps * 1024 / 8, uploadThroughput: 1e6 });
  await page.goto(U + '?mode=first&ctl=0', { waitUntil: 'commit' });
  const done = page.evaluate(() => new Promise(r => document.addEventListener('opx:done', e => r(e.detail), { once: true })));
  await page.waitForFunction(() => window.OPX && OPX.info() && OPX.info().phase !== 'boot', null, { timeout: 15000 });
  const dir = `/tmp/fyshot/r3-10/coldstrip-${w}-${kbps}`; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  for (const at of (process.env.AT || '1560,2400,3100,99999').split(',').map(Number)) {
    if (at === 99999) { await page.waitForFunction(() => OPX.info() && OPX.info().go > 0, null, { timeout: 15000 }).catch(() => {}); await page.waitForTimeout(260); }
    else await page.waitForFunction(t => !OPX.info() || OPX.info().t >= t, at, { timeout: 15000 });
    const i = await page.evaluate(() => OPX.info());
    const t = i ? Math.round(i.t) : 'done';
    await ctx.shot(`${dir}/c-${String(t).padStart(5, '0')}.png`);
    ctx.log('shot at', t, i && i.phase, 'go', i && i.go);
  }
  const d = await done; ctx.log('done', JSON.stringify(d));
  await page.waitForTimeout(900);
  await ctx.shot(`${dir}/z-landed.png`);
};
