// Home · the opener rendered frame by frame on its own clock (?opx=1), every STEP ms, per viewport and mode.
//   node /tmp/fyshot/run.mjs scripts/verify/home-seq.mjs      (env VPS=1440x900,390x844 MODES=first,returning STEP=20)
// Frames → /tmp/fyshot/p3-home/seq-<mode>-<w>/f-<ms>.png, for scripts/verify/flash-audit.py and contact sheets.
import fs from 'fs';
const U = process.env.BASE || 'http://127.0.0.1:4173/';
const VPS = (process.env.VPS || '1440x900,390x844').split(','), MODES = (process.env.MODES || 'first,returning').split(','), STEP = +(process.env.STEP || 20);
export default async (page, ctx) => {
  for (const vp of VPS) {
    const [w, h] = vp.split('x').map(Number);
    await page.setViewportSize({ width: w, height: h });
    await page.goto(U + 'index.html?opx=1&opener=none', { waitUntil: 'load' });
    await page.evaluate(() => OPX.loaded());
    for (const m of MODES) {
      const dir = `/tmp/fyshot/p3-home/seq-${m}-${w}`;
      fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
      await page.evaluate((m) => OPX.seek(m, 0), m);
      await page.waitForTimeout(250);
      await page.evaluate((m) => OPX.seek(m, 0), m);
      let r, t = 0;
      for (;;) {
        r = await page.evaluate(([m, t]) => OPX.seek(m, t), [m, t]);
        await page.screenshot({ path: `${dir}/f-${String(t).padStart(4, '0')}.png` });
        if (r.phase === 'done' || t > 5000) break;
        t += STEP;
      }
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `${dir}/z-landed.png` });
      ctx.log(m, vp, 'end', r.t, 'cut', r.cut, 'go', r.go, 'overflowX', await page.evaluate(() => document.documentElement.scrollWidth - innerWidth));
    }
  }
};
