// scripts/verify/site-404.mjs — 404.html at any depth. GitHub Pages answers every missing URL with 404.html's bytes at
// that URL, so its relative URLs must not depend on the path. The local server sends its own 404, so each missing URL
// is routed to 404.html's content with a 404 status. At depth 0, 1 and 2 (and a sub-path with a trailing slash), and
// at /404.html itself: every asset returns 200, the faces load, the bird's strip resolves, the home link is the root's.
// The runner lists each routed page's own 404 as an error; those are expected.
//   node /tmp/fyshot/run.mjs scripts/verify/site-404.mjs
//   env: BASE (default http://127.0.0.1:4173/)
const BASE = process.env.BASE || 'http://127.0.0.1:4173/';
export default async (page0, ctx) => {
  let pass = 0, fail = 0;
  const check = (name, ok, detail) => { ok ? pass++ : fail++; ctx.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`); };
  const body = await (await fetch(BASE + '404.html')).text();
  for (const miss of ['404.html', 'nope', 'building/nope', 'building/fred-agent/nope.html', 'building/njjoe/nope/']) {
    const c = await page0.context().browser().newContext({ viewport: { width: 1440, height: 900 } }), page = await c.newPage();   // a cold cache per URL
    const bad = [], ok = [];
    const onResp = (r) => { if (r.url() !== BASE + miss) (r.status() === 200 ? ok : bad).push(r.status() + ' ' + r.url().slice(BASE.length - 1)); };
    page.on('response', onResp);
    if (miss !== '404.html') await page.route(BASE + miss, (r) => r.fulfill({ status: 404, contentType: 'text/html', body }));
    await page.goto(BASE + miss, { waitUntil: 'load' });
    const s = await page.evaluate(async () => {
      await document.fonts.ready;
      const bird = getComputedStyle(document.querySelector('.bird-light')).backgroundImage.match(/url\("(.*)"\)/)[1];
      return {
        faces: [...new Set([...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family))].sort().join(', '),
        home: document.querySelector('.home-link').href, bird,
        birdOk: await new Promise((r) => { const i = new Image(); i.onload = () => r(true); i.onerror = () => r(false); i.src = bird; }),
      };
    });
    const at = '/' + miss;
    check(at + ': every asset returns 200', bad.length === 0, bad.length ? bad.join(' | ') : ok.length + ' assets');
    check(at + ': its faces load', s.faces === 'DingTalk JinBuTi, Fraunces, IBM Plex Mono, Noto Sans SC', s.faces || 'none');
    check(at + ': the bird strip resolves from the root', s.birdOk && s.bird === BASE + 'assets/bird-strip6-light.png', s.bird);
    check(at + ': the home link goes to the root\'s index.html', s.home === BASE + 'index.html', s.home);
    await c.close();
  }
  ctx.log(`\n${pass} passed, ${fail} failed`);
};
