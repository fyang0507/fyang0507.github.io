// reading-matrix.mjs — the page at 1440, 1080, 390 and 360, light and dark, Chinese and English: 0 console errors,
// no horizontal overflow, only the -text serif tier and no font masters or /design/ requests; keyboard focus draws
// the pen's 「 」 on every control; reduced motion leaves nothing running; at rest no rAF callbacks at all.
//   node /tmp/fyshot/run.mjs scripts/verify/reading-matrix.mjs      (env: see reading-lib.mjs)
import { POSTS, url, context, watch, ready, scroll, geo, report, sleep } from './reading-lib.mjs';

const SIZES = [[1440, 900], [1080, 800], [390, 844], [360, 780]];

export default async (page, ctx) => {
  const browser = page.context().browser(), rows = [];
  for (const [w, h] of SIZES) {
    for (const theme of ['light', 'dark']) {
      for (const lang of ['zh', 'en']) {
        const errors = [], reqs = [], c = await context(browser, w, h), p = await c.newPage(); watch(p, errors);
        p.on('request', (r) => reqs.push(r.url()));
        await p.goto(url(POSTS.cover, '&lang=' + lang + '&theme=' + theme)); await ready(p);
        const g = await geo(p), over = [];
        for (const y of [0, Math.round(g.sL), Math.round(g.max / 2), g.max]) { await scroll(p, y, 300); over.push(await p.evaluate(() => document.documentElement.scrollWidth - innerWidth)); }
        const tag = w + ' ' + theme + ' ' + lang;
        rows.push([tag + ': no overflow', over.every((o) => o <= 0), over.join(',')]);
        const fonts = reqs.filter((u) => /\.woff2/.test(u)).map((u) => u.replace(/^.*\/fonts\//, ''));
        const bad = reqs.filter((u) => /\/design\//.test(u) || (/\/fonts\/[^/]+\.woff2/.test(u) && !/\/fonts\/derived\//.test(u)) || /NotoSerifSC-ui/.test(u));
        rows.push([tag + ': no masters, no -ui serif, nothing from /design/', bad.length === 0, bad.length ? bad : fonts.filter((f) => /Serif/.test(f)).join(' ')]);
        rows.push([tag + ': 0 console errors', errors.length === 0, errors.slice(0, 3)]);
        await c.close();
      }
    }
  }
  /* ---- keyboard: every control on the page (the site nav marks itself) reaches the pen's 「 」 ---- */
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const errors = [], c = await context(browser, w, h), p = await c.newPage(); watch(p, errors);
    await p.goto(url(POSTS.cover)); await ready(p);
    const seen = {}, miss = [];
    for (let i = 0; i < 90; i++) {
      await p.keyboard.press('Tab'); await sleep(220);
      const f = await p.evaluate(() => {
        const a = document.activeElement;
        if (!a || a === document.body || a.closest('#site-nav')) return null;
        const kind = a.matches('.back') ? 'back' : a.matches('[data-act]') ? a.dataset.act : a.matches('.rail-lab') ? 'rail' : a.matches('.fnref a') ? 'ref'
          : a.closest('.pn') ? 'pn' : a.closest('footer') ? 'footer' : a.closest('.appendix') ? 'appendix' : a.closest('.post-body') ? 'body-link' : a.tagName.toLowerCase();
        const fm = a.querySelector(':scope > svg.fm, :scope > svg .fm-c') ? a.querySelector('svg.fm') : null;
        const vis = !!fm && [...fm.querySelectorAll('.fm-c')].some((q) => getComputedStyle(q).visibility === 'visible');
        return { kind, vis };
      });
      if (!f) continue;
      if (!seen[f.kind]) seen[f.kind] = f.vis; else seen[f.kind] = seen[f.kind] && f.vis;
      if (!f.vis) miss.push(f.kind);
    }
    const want = w >= 1080 ? ['back', 'lang', 'theme', 'rail', 'pn', 'footer', 'appendix'] : ['back', 'lang', 'theme', 'ref', 'pn', 'footer', 'appendix'];
    rows.push([w + ' keyboard: every control gets the 「 」', want.every((k) => seen[k]) && miss.length === 0, { seen, miss: miss.slice(0, 5) }]);
    rows.push([w + ' keyboard: 0 console errors', errors.length === 0, errors.slice(0, 3)]);
    await c.close();
  }
  /* ---- reduced motion leaves nothing running; at rest there are no rAF callbacks ---- */
  for (const reduced of [true, false]) {
    for (const [w, h] of [[1440, 900], [390, 844]]) {
      const c = await context(browser, w, h, { reduced }), p = await c.newPage();
      await p.goto(url(POSTS.cover)); await ready(p);
      const g = await geo(p);
      await scroll(p, Math.round(g.sL) + 300, 1500);
      const running = await p.evaluate(() => { const l = document.getAnimations(); return { running: l.filter((a) => a.playState === 'running').length, infinite: l.filter((a) => a.effect && a.effect.getTiming().iterations === Infinity).length }; });
      const raf = await p.evaluate(() => new Promise((r) => { let n = 0; const o = window.requestAnimationFrame; window.requestAnimationFrame = (f) => { n++; return o(f); }; setTimeout(() => { window.requestAnimationFrame = o; r(n); }, 2000); }));
      const tag = w + (reduced ? ' reduced motion' : ' motion');
      if (reduced) rows.push([tag + ': no running or infinite animations after settle', running.running === 0 && running.infinite === 0, running]);
      rows.push([tag + ': 0 rAF callbacks over 2 s at rest', raf === 0, raf]);
      await c.close();
    }
  }
  report(ctx.log, rows);
};
