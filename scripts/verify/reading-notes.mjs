// reading-notes.mjs — footnotes: citations set in serif, unrotated; a ref's gesture strokes in coral and its slip is
// pulled to the arrow's point; the multi-citation post opens both notes with 0 errors; keyboard focus draws the 「 」
// and Esc lets go; at ≤1080 the margin is hidden and a tap pulls the slip from the slot (swipe it back in); previous
// and next links are kept.
//   node /tmp/fyshot/run.mjs scripts/verify/reading-notes.mjs      (env: see reading-lib.mjs)
import { POSTS, url, context, watch, ready, report, sleep } from './reading-lib.mjs';

const refBox = (page, i) => page.evaluate((i) => {
  const lang = document.documentElement.classList.contains('lang-en') ? 'en' : 'zh';
  const a = [...document.querySelectorAll('.post-body.' + lang + ' .fnref a[data-ref]')][i];
  a.scrollIntoView({ block: 'center' });
  const r = a.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, ref: a.dataset.ref, n: a.textContent.trim() };
}, i);
const noteState = (page, ref) => page.evaluate((ref) => {
  const mn = document.querySelector('.mn[data-ref="' + ref + '"]'), pen = getComputedStyle(document.documentElement).getPropertyValue('--pen').trim();
  const probe = document.createElement('i'); probe.style.color = pen; document.body.appendChild(probe);
  const coral = getComputedStyle(probe).color; probe.remove();
  const paths = [...document.querySelectorAll('.pa-g path')];
  return { on: !!mn && mn.classList.contains('on'), paths: paths.length, coral: paths.length > 0 && paths.every((p) => getComputedStyle(p).stroke === coral),
    moved: mn ? mn.querySelector('.mn-in').style.transform : '' };
}, ref);

export default async (page, ctx) => {
  const browser = page.context().browser(), rows = [];
  /* ---- desktop ---- */
  for (const lang of ['zh', 'en']) {
    const errors = [], c = await context(browser, 1440, 900), p = await c.newPage(); watch(p, errors);
    await p.goto(url(POSTS.cover, '&lang=' + lang)); await ready(p);
    const type = await p.evaluate(() => {
      const mn = [...document.querySelectorAll('.mn')].filter((m) => getComputedStyle(m).display !== 'none');
      return { n: mn.length, serif: mn.every((m) => /Fraunces|Noto Serif SC/.test(getComputedStyle(m).fontFamily) && !/Caveat|Muyao/.test(getComputedStyle(m).fontFamily)),
        flat: mn.every((m) => getComputedStyle(m).transform === 'none') };
    });
    rows.push([lang + ' citations: serif, and the note box unrotated', type.n > 0 && type.serif && type.flat, type]);
    const r = await refBox(p, 2);
    await p.mouse.move(r.x - 80, r.y + 60); await sleep(200);
    await p.mouse.move(r.x, r.y, { steps: 6 }); await sleep(1400);
    const on = await noteState(p, r.ref);
    rows.push([lang + ' hover a ref: the gesture strokes coral and the slip comes to the arrow', on.on && on.paths === 3 && on.coral && /translate\(-/.test(on.moved), on]);
    await p.screenshot({ path: '/tmp/fyshot/p2r-note-' + lang + '.png' });
    await p.mouse.move(40, 450, { steps: 4 }); await sleep(1300);
    const off = await noteState(p, r.ref);
    rows.push([lang + ' let go: the ink lifts and the slip goes home', !off.on && off.paths === 0, off]);
    // keyboard: Tab onto the first ref → the 「 」 and the gesture; Esc lets go
    await p.evaluate(() => { const a = document.querySelector('.post-body .fnref a[data-ref]'); const prev = a.closest('p'); prev.setAttribute('tabindex', '-1'); prev.focus(); prev.removeAttribute('tabindex'); });
    for (let i = 0; i < 40; i++) { await p.keyboard.press('Tab'); if (await p.evaluate(() => document.activeElement.matches('.fnref a'))) break; }
    await sleep(1200);
    const kb = await p.evaluate(() => {
      const a = document.activeElement, fm = a.querySelector('svg.fm'), vis = fm ? [...fm.querySelectorAll('path')].every((q) => getComputedStyle(q).visibility === 'visible') : false;
      return { ref: a.matches('.fnref a'), focus: vis, on: !!document.querySelector('.mn.on') };
    });
    rows.push([lang + ' keyboard: the ref gets the pen 「 」 and plays the gesture', kb.ref && kb.focus && kb.on, kb]);
    await p.keyboard.press('Escape'); await sleep(900);
    rows.push([lang + ' Esc lets go', await p.evaluate(() => !document.querySelector('.mn.on')), '']);
    const pn = await p.evaluate(() => [...document.querySelectorAll('.pn a')].map((a) => a.getAttribute('href')));
    rows.push([lang + ' latest post: previous kept (no next)', pn.length === 1 && /post=/.test(pn[0]), pn]);
    rows.push([lang + ' desktop: no console errors', errors.length === 0, errors.slice(0, 3)]);
    await c.close();
  }
  /* ---- the multi-citation post: one <sup> [1, 2], both notes ---- */
  {
    const errors = [], c = await context(browser, 1440, 900), p = await c.newPage(); watch(p, errors);
    await p.goto(url(POSTS.multi)); await ready(p);
    const pair = await p.evaluate(() => { const s = [...document.querySelectorAll('.post-body.zh sup.fnref')].find((x) => x.querySelectorAll('a').length > 1); return s ? [...s.querySelectorAll('a')].map((a) => a.dataset.ref || '') : []; });
    const opened = [];
    for (let i = 0; i < pair.length; i++) {
      const box = await p.evaluate((ref) => { const a = document.querySelector('.fnref a[data-ref="' + ref + '"]'); a.scrollIntoView({ block: 'center' }); const r = a.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, pair[i]);
      await p.mouse.move(box.x, box.y, { steps: 4 }); await sleep(1300);
      opened.push((await noteState(p, pair[i])).on);
      await p.mouse.move(40, 450, { steps: 3 }); await sleep(900);
    }
    rows.push(['multi-citation: both notes open', pair.length === 2 && opened.every(Boolean), { pair, opened }]);
    const pn = await p.evaluate(() => [...document.querySelectorAll('.pn a')].map((a) => a.getAttribute('href')));
    rows.push(['multi-citation post: previous and next kept', pn.length === 2, pn]);
    rows.push(['multi-citation: 0 errors', errors.length === 0, errors.slice(0, 3)]);
    await c.close();
  }
  /* ---- ≤1080: the margin is hidden and a tap pulls the slip from the slot ---- */
  for (const [w, h] of [[1080, 800], [390, 844]]) {
    for (const key of ['cover', 'multi']) {
      const errors = [], c = await context(browser, w, h, { touch: true }), p = await c.newPage(); watch(p, errors);
      await p.goto(url(POSTS[key])); await ready(p);
      const hidden = await p.evaluate(() => [...document.querySelectorAll('.mn')].every((m) => getComputedStyle(m).display === 'none'));
      const idx = key === 'multi' ? [0, 1] : [2];
      const got = [];
      for (const i of idx) {
        const r = await refBox(p, i); await sleep(300);
        await p.touchscreen.tap(r.x, r.y); await sleep(900);
        const s = await p.evaluate((ref) => {
          const root = document.querySelector('.fs-root'), a = document.querySelector('.fnref a[data-ref="' + ref + '"]'), loop = a.querySelector('svg path');
          const probe = document.createElement('i'); probe.style.color = getComputedStyle(document.documentElement).getPropertyValue('--pen'); document.body.appendChild(probe);
          const coral = getComputedStyle(probe).color; probe.remove();
          return { open: root.classList.contains('open'), no: root.querySelector('.fs-no').textContent, tabbable: !root.querySelector('.fs-body [tabindex="-1"]'),
            loopCoral: !!loop && getComputedStyle(loop).stroke === coral };
        }, r.ref);
        got.push(s.open && s.no === r.n && s.tabbable && s.loopCoral);
        if (w === 390 && i === idx[0]) await p.screenshot({ path: '/tmp/fyshot/p2r-slip-' + key + '.png' });
      }
      rows.push([w + ' ' + key + ': margin hidden, a tap pulls the right slip (coral loop on the ref)', hidden && got.every(Boolean), { hidden, got }]);
      // swipe the slip back in with a finger
      const s = await p.evaluate(() => { const b = document.querySelector('.fs-head').getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; });
      const cdp = await c.newCDPSession(p), tp = (type, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x: s[0], y }] });
      await tp('touchStart', s[1]); for (let i = 1; i <= 8; i++) { await tp('touchMove', s[1] + i * 22); await sleep(16); }
      await tp('touchEnd'); await sleep(900);
      rows.push([w + ' ' + key + ': a swipe down puts it back', await p.evaluate(() => !document.querySelector('.fs-root').classList.contains('open')), '']);
      rows.push([w + ' ' + key + ': no console errors', errors.length === 0, errors.slice(0, 3)]);
      await c.close();
    }
  }
  report(ctx.log, rows);
};
