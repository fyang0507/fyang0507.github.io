// Home · keyboard: Tab through every stop; each focused element shows the pen's coral 「 」 (a FocusMark with both
// strokes drawn), at 1440 and 390.
//   node /tmp/fyshot/run.mjs scripts/verify/home-keys.mjs
const U = (process.env.BASE || 'http://127.0.0.1:4173/') + 'index.html?opx=1&opener=none';
export default async (page, ctx) => {
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    await page.setViewportSize({ width: w, height: h });
    await page.goto(U, { waitUntil: 'load' }); await page.waitForTimeout(600);
    const rows = [];
    for (let i = 0; i < 16; i++) {
      await page.keyboard.press('Tab'); await page.waitForTimeout(260);
      const r = await page.evaluate(() => {
        const a = document.activeElement; if (!a || a === document.body) return null;
        const host = a.closest('[data-pen-focus]') || (a.matches('.track') ? document.querySelector('.rig[data-pen-focus]') : null);
        const on = host ? [...host.querySelectorAll(':scope > svg.fm .fm-c')].filter((p) => getComputedStyle(p).visibility === 'visible').length : 0;
        const r0 = a.getBoundingClientRect();
        return (a.getAttribute('aria-label') || a.textContent.trim().slice(0, 18) || a.className) + (r0.width ? '' : ' (hidden)') + ' → 「」 ' + (on === 2 ? 'ok' : 'MISSING');
      });
      if (!r) break;
      rows.push(r);
    }
    ctx.log(w, rows.length, 'stops:\n   ' + rows.join('\n   '));
  }
};
