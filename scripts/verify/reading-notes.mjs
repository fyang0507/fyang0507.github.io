// reading-notes.mjs — footnotes: citations set in serif, unrotated; a ref's gesture is a loop round the number and an
// arrow, in coral, starting on the number with nothing drawn on the words before it, and its slip is pulled to the
// arrow's point; where the number has wrapped onto the next line, the arrow stays on the number's own line; the
// multi-citation post opens both notes with 0 errors; keyboard focus draws the 「 」 and Esc lets go; at ≤1080 the
// margin is hidden and a tap pulls the slip from the slot, never over its own ref, even a tap made as the last slip
// goes back in (swipe it back in); previous and next links are kept.
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
  // nothing on the words: the long stroke begins on the number's loop, and no ink lies left of that loop
  const ar = document.querySelector('.fnref a[data-ref="' + ref + '"]').getBoundingClientRect(), main = paths.slice().sort((p, q) => q.getTotalLength() - p.getTotalLength())[0];
  let fromRef = null, left = null;
  if (main) {
    const m = main.getScreenCTM(), o = main.getPointAtLength(0), x = m.a * o.x + m.c * o.y + m.e, y = m.b * o.x + m.d * o.y + m.f;
    fromRef = Math.round(Math.hypot(x - (ar.left + ar.right) / 2, y - (ar.top + ar.bottom) / 2) - Math.max(ar.width, ar.height) / 2);
    left = Math.round(Math.min(...paths.map((p) => p.getBoundingClientRect().left)) - ar.left);
  }
  return { on: !!mn && mn.classList.contains('on'), paths: paths.length, coral: paths.length > 0 && paths.every((p) => getComputedStyle(p).stroke === coral),
    fromRef: fromRef, left: left, moved: mn ? mn.querySelector('.mn-in').style.transform : '' };
}, ref);

// A ref whose number starts a line: the character just before its <sup> (notes and refs left out, never across a <br>)
// ends above the number's box. → { ref, n } | null
const findWrapped = () => {
  const lang = document.documentElement.classList.contains('lang-en') ? 'en' : 'zh';
  const toks = (block) => { const out = []; (function walk(el) { for (let n = el.firstChild; n; n = n.nextSibling) { if (n.nodeType === 3) out.push(n); else if (n.nodeType === 1) { if (n.tagName === 'BR' || n.matches('.mn, .fnref')) out.push(n); else walk(n); } } })(block); return out; };
  for (const a of document.querySelectorAll('.post-body.' + lang + ' .fnref a[data-ref]')) {
    const sup = a.closest('sup'), t = toks(sup.closest('p, li, blockquote') || sup.parentNode);
    let box = null;
    for (let k = t.indexOf(sup) - 1; k >= 0 && !box; k--) {
      const n = t[k];
      if (n.nodeType !== 3) { if (n.tagName === 'BR') break; continue; }
      const s = n.textContent; let i = s.length - 1;
      while (i >= 0 && /\s/.test(s[i])) i--;
      if (i >= 0) { const r = document.createRange(); r.setStart(n, i); r.setEnd(n, i + 1); box = r.getClientRects()[0] || null; }
    }
    if (box && box.bottom <= a.getBoundingClientRect().top) return { ref: a.dataset.ref, n: a.textContent.trim() };
  }
  return null;
};
// The held stroke against the block's lines, inside the text column: how far it rises above the number, and how many
// of its points fall in the glyph box of a line other than the number's own.
const inkVsLines = (ref) => {
  const a = document.querySelector('.fnref a[data-ref="' + ref + '"]'), ar = a.getBoundingClientRect(), colR = a.closest('.post-body').getBoundingClientRect().right;
  const main = [...document.querySelectorAll('.pa-g path')].sort((p, q) => q.getTotalLength() - p.getTotalLength())[0];
  if (!main) return { rise: null, crossings: null };
  const lines = [];
  (function walk(el) { for (let n = el.firstChild; n; n = n.nextSibling) { if (n.nodeType === 3) { const r = document.createRange(); r.selectNodeContents(n); lines.push(...r.getClientRects()); } else if (n.nodeType === 1 && !n.matches('.mn, .fnref')) walk(n); } })(a.closest('p, li, blockquote'));
  const others = lines.filter((r) => r.width > 1 && !(r.top < ar.bottom && r.bottom > ar.top));
  const m = main.getScreenCTM(), L = main.getTotalLength();
  let top = Infinity, crossings = 0, first = null;
  for (let s = 0; s <= L; s += 1.5) {
    const o = main.getPointAtLength(s), x = m.a * o.x + m.c * o.y + m.e, y = m.b * o.x + m.d * o.y + m.f;
    if (x > colR) continue;                                // past the column the arrow may bend toward its slip
    top = Math.min(top, y);
    if (others.some((r) => x > r.left && x < r.right && y > r.top + 1 && y < r.bottom - 1)) { crossings++; first = first || [Math.round(x - ar.left), Math.round(y - ar.top)]; }
  }
  return { rise: Math.round(ar.top - top), crossings: crossings, first: first };
};

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
    rows.push([lang + ' hover a ref: a loop and an arrow in coral, and the slip comes to the arrow', on.on && on.paths === 2 && on.coral && /translate\(-/.test(on.moved), on]);
    rows.push([lang + ' hover a ref: the ink starts on the number and nothing is drawn on the words', on.fromRef !== null && on.fromRef <= 12 && on.left >= -12, { fromRef: on.fromRef, left: on.left }]);
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
  /* ---- a number that wrapped onto the next line: the arrow runs along the number's own line, not the one above ---- */
  for (const lang of ['zh', 'en']) {
    const errors = [], c = await context(browser, 1440, 900), p = await c.newPage(); watch(p, errors);
    let found = null;
    for (const key of ['headings', 'multi']) {
      await p.goto(url(POSTS[key], '&lang=' + lang)); await ready(p);
      found = await p.evaluate(findWrapped);
      if (found) { found.key = key; break; }
    }
    if (!found) { rows.push([lang + ' a wrapped ref to test', false, 'none found in ' + POSTS.headings + ' or ' + POSTS.multi]); await c.close(); continue; }
    const b = await p.evaluate((ref) => { const a = document.querySelector('.fnref a[data-ref="' + ref + '"]'); a.scrollIntoView({ block: 'center' }); const r = a.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, found.ref);
    await p.mouse.move(b.x - 80, b.y + 60); await sleep(200);
    await p.mouse.move(b.x, b.y, { steps: 6 }); await sleep(1400);
    const g = await p.evaluate(inkVsLines, found.ref);
    rows.push([lang + ' a wrapped ref (' + found.key + ' [' + found.n + ']): the arrow rises ≤ 10 px above the number and crosses no other line', g.rise !== null && g.rise <= 10 && g.crossings === 0, g]);
    rows.push([lang + ' wrapped ref: no console errors', errors.length === 0, errors.slice(0, 3)]);
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
      // a slip never hides its own ref: tapped low in the window, the page glides up so the ref sits above the slip
      await p.keyboard.press('Escape'); await sleep(700);
      const lo = await p.evaluate((i) => {
        const lang = document.documentElement.classList.contains('lang-en') ? 'en' : 'zh';
        const a = [...document.querySelectorAll('.post-body.' + lang + ' .fnref a[data-ref]')][i];
        window.scrollTo(0, a.getBoundingClientRect().top + scrollY - (innerHeight - 60));
        const r = a.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2, ref: a.dataset.ref, below: Math.round(innerHeight - r.bottom) };
      }, idx[idx.length - 1]);
      await sleep(300);
      await p.touchscreen.tap(lo.x, lo.y); await sleep(1300);
      const clear = await p.evaluate((ref) => {
        const r = document.querySelector('.fnref a[data-ref="' + ref + '"]').getBoundingClientRect(), s = document.querySelector('.fs-slip').getBoundingClientRect();
        return { open: document.querySelector('.fs-root').classList.contains('open'), gap: Math.round(s.top - r.bottom) };
      }, lo.ref);
      rows.push([w + ' ' + key + ': a ref tapped low in the window stays in view above its slip', clear.open && clear.gap >= 8, { tappedAt: lo.below + 'px from the foot', ...clear }]);
      if (key === 'cover') {
        // keyboard: Tab cycles inside the open slip; Esc from outside it still closes it and hands focus to the ref
        const cyc = [];
        for (let i = 0; i < 5; i++) { await p.keyboard.press('Tab'); cyc.push(await p.evaluate(() => !!document.activeElement.closest('.fs-slip'))); }
        rows.push([w + ' ' + key + ': Tab stays inside the open slip', cyc.every(Boolean), cyc]);
        await p.evaluate(() => { document.activeElement.blur(); document.body.focus(); });
        await p.keyboard.press('Escape'); await sleep(700);
        const esc = await p.evaluate(() => ({ open: document.querySelector('.fs-root').classList.contains('open'), ref: document.activeElement.matches('.fnref a[data-ref]') }));
        rows.push([w + ' ' + key + ': Esc from anywhere closes it and focus returns to the ref', !esc.open && esc.ref, esc]);
        // "all references ↓": the reference gets the focus, so the next Tab continues from there
        const r2 = await refBox(p, 2); await sleep(200);
        await p.touchscreen.tap(r2.x, r2.y); await sleep(900);
        await p.evaluate(() => document.querySelector('.fs-all').click()); await sleep(1400);
        const all = await p.evaluate(() => ({ id: document.activeElement.id, item: document.activeElement.matches('.appendix-item'), open: document.querySelector('.fs-root').classList.contains('open') }));
        rows.push([w + ' ' + key + ': "all references" moves focus to the reference', all.item && !all.open && all.id === r2.ref, all]);
        // a tap made as the last slip goes back in (≤ ~100 ms after Esc or a tap outside) catches it and pulls it out again
        const slipOut = () => p.evaluate(() => ({ open: document.querySelector('.fs-root').classList.contains('open'),
          out: Math.round(document.querySelector('.fs-well').getBoundingClientRect().bottom - document.querySelector('.fs-slip').getBoundingClientRect().top) }));
        for (const how of ['Esc', 'a tap outside']) {
          const ro = await refBox(p, 2); await sleep(200);
          await p.touchscreen.tap(ro.x, ro.y); await sleep(1000);
          const before = await slipOut();                     // out first, so the race below is a real one
          if (how === 'Esc') await p.keyboard.press('Escape'); else await p.touchscreen.tap(12, 160);
          await sleep(80);
          const ri = await p.evaluate((ref) => { const r = document.querySelector('.fnref a[data-ref="' + ref + '"]').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, ro.ref);
          await p.touchscreen.tap(ri.x, ri.y); await sleep(1300);
          const st = await slipOut();
          rows.push([w + ' ' + key + ': a tap 80 ms after ' + how + ' pulls the slip out again (not stuck in the slot)', before.open && before.out > 60 && st.open && st.out > 60, { before, after: st }]);
        }
        await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight / 3)); await sleep(400);
        const r3 = await refBox(p, 2); await sleep(200);
        await p.touchscreen.tap(r3.x, r3.y); await sleep(900);
      }
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
