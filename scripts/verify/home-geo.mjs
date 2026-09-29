// Home · the desk's inline geometry equals FY_DESK (desk px), each named object renders once, and its box on screen is
// its art box scaled by the desk (the contract transitions.js flies against). At 1440 and 390.
//   node /tmp/fyshot/run.mjs scripts/verify/home-geo.mjs
const U = (process.env.BASE || 'http://127.0.0.1:4173/') + 'index.html?opener=none';
export default async (page, ctx) => {
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    await page.setViewportSize({ width: w, height: h });
    await page.goto(U, { waitUntil: 'load' }); await page.waitForTimeout(500);
    const r = await page.evaluate(() => {
      const D = window.FY_DESK, desk = document.getElementById('desk'), dr = desk.getBoundingClientRect(), s = dr.width / D.W, out = [];
      const near = (a, b) => Math.abs(a - b) < .6;
      for (const k of ['laptop', 'mug', 'camera', 'plant', 'book', 'frame', 'bird']) {
        const els = document.querySelectorAll('.desk-' + k);
        const e = els[0], st = e.style, b = D.obj[k].box, rc = e.getBoundingClientRect();
        const inl = [parseFloat(st.left), parseFloat(st.top), parseFloat(st.width), parseFloat(st.height)];
        const okInline = (k === 'bird' ? true : near(inl[0], b[0])) && near(inl[1], b[1]) && near(inl[2], b[2]) && near(inl[3], b[3]);
        const okScreen = near(rc.width, b[2] * s) && near(rc.height, b[3] * s) && (k === 'bird' || near(rc.left - dr.left, b[0] * s));
        out.push(k + (els.length === 1 ? '' : ' ×' + els.length) + (okInline ? '' : ' INLINE≠FY_DESK') + (okScreen ? '' : ' SCREEN≠art box'));
      }
      const named = ['.desk-plate', '.desk-edge', '.desk-notes'].map((c) => c + ':' + document.querySelectorAll(c).length);
      return { out, named, s: +s.toFixed(4) };
    });
    ctx.log(w, 'scale', r.s, '·', r.out.join(' | '), '·', r.named.join(' '));
  }
};
