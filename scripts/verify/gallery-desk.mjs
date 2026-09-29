// gallery-desk.mjs — Gallery at 1440: develop once per session, idle loop, rope causes, viewer, filters, stringing.
//   node /tmp/fyshot/run.mjs scripts/verify/gallery-desk.mjs      (server on :4173; GALLERY_BASE to override)
import { open, load, settle, rafOver, overflow, glide, requestAudit, Report } from './gallery-lib.mjs';

const ropeY = (p, sel, x) => p.evaluate(([sel, x]) => {
  const path = document.querySelector(sel + ' .rope-line'), L = path.getTotalLength();
  let best = null;
  for (let s = 0; s <= L; s += 2) { const q = path.getPointAtLength(s); if (!best || Math.abs(q.x - x) < Math.abs(best.x - x)) best = q; }
  return best.y;
}, [sel, x]);
const hangState = (p) => p.evaluate(() => [...document.querySelectorAll('.line-host')].slice(0, 1).flatMap((l) => [...l.querySelectorAll('.hang')].map((h) => h.style.transform)));
const pegged = (p) => p.evaluate(() => [...document.querySelectorAll('.hang:not(.unpegged)')].map((h) => h.dataset.id));

export default async (page, ctx) => {
  const R = Report(ctx, '1440');
  const { ctx: bc, page: p, errors, requests } = await open(page, { width: 1440, height: 900 });
  await load(p);

  // ---- develop: first view, decode-gated, monotonic, remembered ----
  await p.waitForFunction(() => document.querySelectorAll('.win img').length && [...document.querySelectorAll('.win img')].some((i) => i.getAnimations().length), null, { timeout: 8000 });
  const kf = await p.evaluate(() => {
    const img = [...document.querySelectorAll('.win img')].find((i) => i.getAnimations().length), chem = img.parentNode.querySelector('.chem');
    const b = img.getAnimations()[0].effect.getKeyframes().map((k) => +/brightness\(([\d.]+)\)/.exec(k.filter)[1]);
    const o = chem.getAnimations()[0].effect.getKeyframes().map((k) => +k.opacity);
    return { b, o };
  });
  const mono = (a) => a.every((v, i) => !i || v <= a[i - 1]);
  R.ok('develop brightness keyframes are monotonic (flash-safe)', mono(kf.b) && mono(kf.o), 'brightness ' + kf.b.join('→') + ' · chemical ' + kf.o.join('→'));
  R.ok('settles', await settle(p, 12000));
  const idle = await rafOver(p, 2000);
  R.ok('0 rAF callbacks at idle', idle === 0, idle + ' callbacks in 2 s');
  const d0 = await p.evaluate(() => [...document.querySelectorAll('.rope-line')].map((r) => r.getAttribute('d')).join('|'));
  await p.waitForTimeout(1000);
  const d1 = await p.evaluate(() => [...document.querySelectorAll('.rope-line')].map((r) => r.getAttribute('d')).join('|'));
  R.ok('ropes stay still without a cause', d0 === d1);
  const seen = await p.evaluate(() => JSON.parse(sessionStorage.getItem('fy-gallery-dev') || '[]'));
  R.ok('developed prints are kept in fy-gallery-dev', seen.length >= 6, seen.length + ' ids');
  let o = await overflow(p); R.ok('no horizontal overflow', o.sw <= o.iw, o.sw + ' ≤ ' + o.iw);

  // ---- a flick swings the line; an aimed approach doesn't ----
  const box = await p.evaluate(() => { const r = document.querySelector('.line-host').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width }; });
  await p.evaluate((y) => window.scrollBy(0, y - 120), box.y);
  const lb = await p.evaluate(() => { const r = document.querySelector('.line-host').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width }; });
  const t0 = await hangState(p);
  await p.mouse.move(lb.x + 40, lb.y + 120);
  await glide(p, { x: lb.x + 40, y: lb.y + 120 }, { x: lb.x + lb.w + 60, y: lb.y + 130 }, 700, 'lin');   // ~1,800 px/s
  await p.waitForTimeout(160);
  const t1 = await hangState(p);
  R.ok('a fast pass across the prints swings them', t1.some((t, i) => t !== t0[i]), t1.filter((t, i) => t !== t0[i]).length + ' prints moved');
  await settle(p);
  const t2 = await hangState(p);
  const target = await p.evaluate(() => { const r = document.querySelectorAll('.line-host')[0].querySelectorAll('.print')[2].getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  await p.mouse.move(target.x - 260, target.y + 40);
  await p.waitForTimeout(120);
  await glide(p, { x: target.x - 260, y: target.y + 40 }, target, 650, 'out');
  await p.waitForTimeout(350);
  const t3 = await hangState(p);
  R.ok('an aimed, slowing approach leaves the target print still', t3[2] === t2[2], t3.filter((t, i) => t !== t2[i]).length + ' of the line moved (passed through on the way)');

  // ---- hover intent: the coral notice line on the caption, clear of the meta line ----
  const cap = await p.evaluate(() => {
    const pr = document.querySelectorAll('.line-host')[0].querySelectorAll('.print')[2], svg = pr.querySelector('.cap svg.tm'), hot = svg && pr.querySelector('.cap .tm-hot');
    if (!svg) return null;
    const hang = pr.closest('.hang'), tf = hang.style.transform; hang.style.transform = 'none';   // measured untransformed, as pen-spacing does
    const line = pr.querySelector('.cap .tm-line').getBoundingClientRect(), meta = pr.querySelector('.meta'), rg = document.createRange(); rg.selectNodeContents(meta.firstChild);
    const m = rg.getClientRects()[0]; hang.style.transform = tf;
    return { tier: pr.getAttribute('data-pen-tier'), hot: getComputedStyle(hot).visibility, stroke: getComputedStyle(hot).stroke, gap: +(m.top - (line.bottom + 1.1)).toFixed(1), drop: +svg.getAttribute('data-drop') };
  });
  R.ok('hover draws the coral line under the caption', cap && cap.tier === '1' && cap.hot === 'visible', cap ? 'tier ' + cap.tier + ', stroke ' + cap.stroke : 'no mark');
  R.ok('the meta line sits ≥10 px and ≥2× drop below the caption line', cap && cap.gap >= 10 && cap.gap >= 2 * cap.drop, cap ? cap.gap + ' px (drop ' + cap.drop + ')' : '');

  // ---- the viewer: the peg comes with the print ----
  const x = target.x, y0 = await ropeY(p, '.line-host', x);
  await p.mouse.click(target.x, target.y);
  await p.waitForTimeout(450);
  const y1 = await ropeY(p, '.line-host', x);
  const vw = await p.evaluate(() => { const v = document.querySelector('.vw'); return { shown: !v.hidden, role: v.getAttribute('role'), modal: v.getAttribute('aria-modal'), peg: !!v.querySelector('.fly .peg'), focus: document.activeElement === v }; });
  R.ok('the viewer is role=dialog aria-modal, focused, and holds the peg', vw.shown && vw.role === 'dialog' && vw.modal === 'true' && vw.peg && vw.focus, JSON.stringify(vw));
  R.ok('the rope springs up where the weight left', y1 < y0 - 2, 'rope at the peg ' + y0.toFixed(1) + ' → ' + y1.toFixed(1));
  await p.waitForFunction(() => { const h = document.querySelector('.vw .fly-hi'); return h && h.classList.contains('on') && h.complete; }, null, { timeout: 12000 }).catch(() => {});
  const hi = await p.evaluate(() => { const h = document.querySelector('.vw .fly-hi'), f = document.querySelector('.vw .fly').getBoundingClientRect(); return { src: h.currentSrc, on: h.classList.contains('on'), w: Math.round(f.width) }; });
  R.ok('the viewer shows the -2560 file', hi.on && /-2560\.jpg$/.test(hi.src), hi.src.split('/').pop() + ', print ' + hi.w + ' px wide');
  await p.screenshot({ path: '/tmp/fyshot/gallery-desk-viewer.png' });
  const shown = () => p.evaluate(() => { const v = document.querySelector('.vw'); return { id: v.dataset.id, loc: v.getAttribute('aria-label').split(': ')[1].split('.')[0] }; });
  const lab0 = await shown();
  await p.keyboard.press('ArrowRight'); await p.waitForTimeout(500);
  const lab1 = await shown();
  await p.keyboard.press('ArrowLeft'); await p.waitForTimeout(500);
  const lab2 = await shown();
  R.ok('→ takes the next print, ← comes back', lab1.id !== lab0.id && lab2.id === lab0.id, [lab0, lab1, lab2].map((s) => s.id + ' ' + s.loc).join(' → '));
  await p.keyboard.press('Escape');
  await p.waitForFunction(() => document.querySelector('.vw').hidden, null, { timeout: 6000 }).catch(() => {});
  await p.waitForTimeout(200);
  const back = await p.evaluate(() => ({ hidden: document.querySelector('.vw').hidden, id: document.activeElement.closest('.hang') && document.activeElement.closest('.hang').dataset.id }));
  const want = await p.evaluate(() => document.querySelectorAll('.line-host')[0].querySelectorAll('.hang')[2].dataset.id);
  R.ok('Esc clips it back and returns focus to the print', back.hidden && back.id === want, 'focus on print ' + back.id);
  await settle(p);
  const y2 = await ropeY(p, '.line-host', x);
  R.ok('the rope sags again when it is back', Math.abs(y2 - y0) < 1, y2.toFixed(1));

  // ---- keyboard: 「 」 on focus, Enter unclips, Esc returns focus ----
  await p.keyboard.press('Shift+Tab'); await p.keyboard.press('Tab'); await p.waitForTimeout(350);
  const fm = await p.evaluate(() => { const a = document.activeElement, c = a.querySelector('.fm-c'); return { print: a.classList.contains('print'), fm: !!c && getComputedStyle(c).visibility, stroke: c && getComputedStyle(c).stroke }; });
  R.ok('keyboard focus on a print draws the coral 「 」', fm.print && fm.fm === 'visible', JSON.stringify(fm));
  const kid = await p.evaluate(() => document.activeElement.closest('.hang').dataset.id);
  await p.keyboard.press('Enter'); await p.waitForTimeout(900);
  await p.keyboard.press('Escape');
  await p.waitForFunction(() => document.querySelector('.vw').hidden, null, { timeout: 6000 }).catch(() => {});
  await p.waitForTimeout(150);
  const kback = await p.evaluate(() => document.activeElement.closest('.hang') && document.activeElement.closest('.hang').dataset.id);
  R.ok('Enter opens, Esc returns focus to the same print', kback === kid, kid + ' → ' + kback);
  await settle(p);

  // ---- filters: pen tiers, restringing the same ropes ----
  await p.evaluate(() => { window.scrollTo(0, 0); document.querySelectorAll('.line-host').forEach((l, i) => l.setAttribute('data-was', i)); });
  const chip = (label) => p.locator('.g-chip', { hasText: label }).first();
  const kFocus = await p.evaluate(() => { document.querySelector('.g-chip').focus(); return 1; });
  await p.keyboard.press('Tab'); await p.waitForTimeout(350);
  const cf = await p.evaluate(() => { const a = document.activeElement, c = a.querySelector('.fm-c'); return a.classList.contains('g-chip') && c && getComputedStyle(c).visibility; });
  R.ok('Tab reaches the chips with a coral 「 」', kFocus && cf === 'visible');
  await chip('Street').click();
  await p.mouse.move(5, 5);
  await p.waitForTimeout(2600);
  const st = await p.evaluate(() => {
    const c = [...document.querySelectorAll('.g-chip')].find((b) => b.textContent.startsWith('Street')), band = c.querySelector('.tm-band'), hot = c.querySelector('.tm-hot');
    const metas = [...document.querySelectorAll('.hang:not(.unpegged) .meta')].map((m) => m.textContent);
    return { filtered: document.querySelector('.g-root').dataset.filtered, count: document.querySelector('.g-count').textContent, tier: c.dataset.penTier, pressed: c.getAttribute('aria-pressed'),
      band: getComputedStyle(band).visibility, fill: getComputedStyle(band).fill, hot: getComputedStyle(hot).visibility, allStreet: metas.every((m) => /Street$/.test(m)), n: metas.length,
      same: [...document.querySelectorAll('.line-host')].every((l) => l.hasAttribute('data-was')) };
  });
  R.ok('a chip restrings to the filtered count', st.filtered === '14' && st.n === 14 && st.allStreet && /Showing 14 \/ 14/.test(st.count), st.count);
  R.ok('the prints are re-pegged on the same ropes', st.same);
  R.ok('the chosen chip is the wheat band, no coral at rest', st.tier === '2' && st.pressed === 'true' && st.band === 'visible' && st.hot === 'hidden', 'band ' + st.fill + ', coral line ' + st.hot);
  await p.screenshot({ path: '/tmp/fyshot/gallery-desk-street.png' });
  await chip('2023').click(); await p.waitForTimeout(2200);
  const both = await p.evaluate(() => ({ f: document.querySelector('.g-root').dataset.filtered, dis: [...document.querySelectorAll('.g-chip:disabled')].map((b) => b.textContent) }));
  R.ok('both axes filter together; empty choices are disabled', +both.f > 0 && both.dis.length > 0, both.f + ' prints · disabled: ' + both.dis.join(', '));
  await chip('All years').click(); await chip('All · 全部').click(); await p.mouse.move(5, 5);
  await p.waitForTimeout(2600);
  R.ok('back to all: 107 filtered, 18 up', await p.evaluate(() => document.querySelector('.g-root').dataset.filtered === '107' && document.querySelector('.g-root').dataset.shown === '18'));
  R.ok('settles after restringing', await settle(p, 8000));

  // ---- stringing replaces Load more ----
  const tS = Date.now();
  while (Date.now() - tS < 70000) {
    await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await p.waitForTimeout(700);
    if (await p.evaluate(() => document.querySelector('.g-end').classList.contains('full') && !document.querySelector('.hang.unpegged'))) break;
  }
  const ids = await pegged(p);
  const end = await p.evaluate(() => ({ full: document.querySelector('.g-end').classList.contains('full'), txt: document.querySelector('.g-end .done').textContent, more: /load more/i.test(document.body.innerText) }));
  R.ok('scrolling strings lines until all 107 are up, no Load more', new Set(ids).size === 107 && end.full && !end.more, new Set(ids).size + ' prints · "' + end.txt + '" · ' + Math.round((Date.now() - tS) / 1000) + ' s');
  await p.screenshot({ path: '/tmp/fyshot/gallery-desk-end.png' });
  o = await overflow(p); R.ok('no overflow with every line strung', o.sw <= o.iw);
  await settle(p);

  // ---- a reload in the same session: developed prints stay developed ----
  const kept = await p.evaluate(() => JSON.parse(sessionStorage.getItem('fy-gallery-dev') || '[]'));
  await p.reload({ waitUntil: 'load' });
  await p.waitForSelector('.g-root[data-mode] .hang');
  const re = await p.evaluate((kept) => {
    const hs = [...document.querySelectorAll('.hang')].filter((h) => kept.includes(+h.dataset.id));
    return { n: hs.length, undev: hs.filter((h) => h.querySelector('.print.undev')).length };
  }, kept);
  await p.waitForTimeout(3000);
  const re2 = await p.evaluate((kept) => [...document.querySelectorAll('.hang')].filter((h) => kept.includes(+h.dataset.id) && (h.querySelector('.undev') || h.querySelector('img').getAnimations().length)).length, kept);
  R.ok('after a reload, no developed print is undeveloped or develops again', re.undev === 0 && re2 === 0, re.n + ' developed prints on screen, ' + re.undev + ' undeveloped, ' + re2 + ' redeveloping');

  const ra = requestAudit(requests); R.ok('no /design/, posts.js or font masters; photos only from images/derived', ra.ok, requests.length + ' requests' + (ra.bad.length ? ' · ' + ra.bad.slice(0, 3).join(' ') : ''));
  R.ok('0 console errors, every request 200', errors.length === 0, errors.slice(0, 3).join(' | '));
  R.done();
  await bc.close();
};
