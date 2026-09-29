// r3-10 · node /tmp/fyshot/run.mjs design/2026-09-motion/tools/r3-10-seq.mjs (env VPS, MODES, STEP) → /tmp/fyshot/r3-10/seq-*
// Seek-based capture on the opener's manual clock: every STEP ms from 0 to the end, per viewport / mode.
import fs from 'fs';
const VPS = (process.env.VPS || '1440x900,390x844').split(',');
const MODES = (process.env.MODES || 'first,returning').split(',');
const STEP = +(process.env.STEP || 20);
export default async (page, ctx) => {
  for (const vp of VPS) {
    const [w, h] = vp.split('x').map(Number);
    await page.setViewportSize({ width: w, height: h });
    await page.goto('http://127.0.0.1:4173/design/2026-09-motion/r3-10-opener-page.html?autoplay=0&ctl=0', { waitUntil: 'load' });
    await page.evaluate(() => OPX.loaded());
    await page.waitForTimeout(300);
    for (const m of MODES) {
      const dir = `/tmp/fyshot/r3-10/seq-${m}-${w}`;
      fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
      await page.evaluate(m => OPX.seek(m, 0), m);
      await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(250);
      await page.evaluate(m => OPX.seek(m, 0), m);
      let r, t = 0;
      for (;;) {
        r = await page.evaluate(([m, t]) => OPX.seek(m, t), [m, t]);
        await page.screenshot({ path: `${dir}/f-${String(t).padStart(4, '0')}.png` });
        if (r.phase === 'done') break;
        t += STEP;
        if (t > 5000) break;
      }
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `${dir}/z-landed.png` });
      const ov = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      ctx.log(m, vp, 'end', r.t, 'cut', r.cut, 'go', r.go, 'overflowX', ov);
    }
  }
};
