// Home · the opener rendered frame by frame on its own clock (?opx=1), every STEP ms, per viewport and mode.
//   node /tmp/fyshot/run.mjs scripts/verify/home-seq.mjs      (env VPS=1440x900,390x844 MODES=first,returning STEP=20)
// Frames → /tmp/fyshot/p3-home/seq-<mode>-<w>/f-<ms>.png, for scripts/verify/flash-audit.py and contact sheets.
// A first visit's frames run on through the identity's arrival (lib/home/identity.js). It starts at opx:done, while the
// OP's tail may still be settling, so from that frame on FY_ID.seek poses it on the same clock until its last frame lands.
import fs from 'fs';
const U = process.env.BASE || 'http://127.0.0.1:4173/';
const VPS = (process.env.VPS || '1440x900,390x844').split(','), MODES = (process.env.MODES || 'first,returning').split(','), STEP = +(process.env.STEP || 20);
export default async (page, ctx) => {
  for (const vp of VPS) {
    const [w, h] = vp.split('x').map(Number);
    await page.setViewportSize({ width: w, height: h });
    await page.goto(U + 'index.html?opx=1&opener=none', { waitUntil: 'load' });
    await page.evaluate(() => OPX.loaded());
    await page.evaluate(() => document.addEventListener('opx:done', (e) => { window.__idAt = e.detail.ms; }));
    for (const m of MODES) {
      const dir = `/tmp/fyshot/p3-home/seq-${m}-${w}`;
      fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
      await page.evaluate((m) => OPX.seek(m, 0), m);
      await page.waitForTimeout(250);
      await page.evaluate((m) => OPX.seek(m, 0), m);
      await page.evaluate(() => { window.__idAt = null; });
      let r = { phase: '' }, t = 0;
      for (;;) {
        r = await page.evaluate(([m, t, r]) => {
          const o = r.phase === 'done' ? r : OPX.seek(m, t), at = window.__idAt, id = window.FY_ID && window.FY_ID.ms;
          if (at != null && id) window.FY_ID.seek(t - at);
          return { ...o, id: at != null && id ? at + id : 0 };
        }, [m, t, r]);
        await page.screenshot({ path: `${dir}/f-${String(t).padStart(4, '0')}.png` });
        if ((r.phase === 'done' && t >= r.id) || t > 8000) break;
        t += STEP;
      }
      const idAt = await page.evaluate(() => { if (window.FY_ID) window.FY_ID.rest(); return window.__idAt; });
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `${dir}/z-landed.png` });
      ctx.log(m, vp, 'end', r.t, 'cut', r.cut, 'go', r.go, 'identity', r.id ? idAt + '–' + Math.round(r.id) : 'none', 'overflowX', await page.evaluate(() => document.documentElement.scrollWidth - innerWidth));
    }
  }
};
