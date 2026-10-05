// writing-lang.mjs — Writing.dc.html's CN/EN switch: the sign over the shelf (lib/writing/sign.js) and the language it
// switches (lib/writing/lang.js), at 1440, 1024, 820, 390, 360 and 320.
//   node /tmp/fyshot/run.mjs scripts/verify/writing-lang.mjs
//   env: WRITING_BASE (default http://127.0.0.1:4173/) · WRITING_SHOTS=<prefix> saves screenshots: both languages
//        at rest, a book in the hand in each, the sign hovered and focused
// Checks, per width: the sign is one button named by the face you see (its words, each in its lang: the shelf's
// language and, on its foot, the other one's name); a first visit (no fy-lang) reads Chinese; the face showing is the
// shelf's language, wheat-banded, the other face hidden, no coral at rest; hover draws the coral line under the other
// language's name, keyboard focus the coral 「 」 around the card; Tab reaches it (on the desk the first stop after
// the nav), Enter and Space turn it; the sign keeps the pen's spacing (the band's edge to the hint, the hint's line
// to the card's edge: ≥ 10 px and ≥ 2× the drop), its foot on or above the case's top edge and clear of every spine
// head under every tag filter, inside the page, clear of the index and (on a phone) of the cue; a press retitles every
// spine at once as the sign passes edge-on (never a mix of languages), runs no animation on the shelf and moves no
// book (every spine's drawn box, the hit links, the planks and the case height are unchanged); every title fits its
// spine whole in both languages by the fit's rule (at most 85% of the spine's inside, or 70% under a series badge and
// clear of it, 4 px clear of each edge, never under 8.2 px, nothing cut by writing.css's clip; Chinese upright, Latin
// turned to read top to bottom); the book in your hand shows both titles, the chosen language first, each in its lang,
// on the obi and the title page, and a switch while it is held retitles it there; the book links carry &lang=; the
// choice survives a reload (fy-lang); no horizontal overflow. At 1440 and 390, both ways (en → 中, zh → EN): the essay
// opens in the language chosen on Writing (&lang=), Reading's switch sets ?lang= in place (post kept, no new history
// entry) and fy-lang, a reload of Reading keeps it, and history back shows it on Writing; so does Reading's back link.
// Once: a bfcache pageshow takes up a choice made meanwhile; Reading's switch keeps every other parameter, their order
// and the hash, and adds a missing lang; ?lang= wins over fy-lang, as on Reading, and is not stored, and a switch on
// Writing deletes it in place so a reload follows the switch; a post with one title shows it in either language; a
// switch while a filter hides books fits each one when the filter is cleared; re-mounts across 760 px keep the
// language and hand back their lang subscriptions; reduced motion lands a press at once with nothing left running; an
// idle page makes no rAF calls after one; 0 console errors. With localStorage blocked (it throws): each page sets one
// language (Reading one theme), both switches and the theme toggle work, 0 errors. WebKit, at 1440 and 390: a cold
// load with fy-lang=en fits every English title (two, in fresh contexts); the sign turns both ways, retitling and
// fitting every spine, with exactly one face shown in every frame of the turn and never a mirrored one; the book in
// your hand carries both titles; 0 console errors. Exit code 1 on any failure.
import { createRequire } from 'module';

const BASE = process.env.WRITING_BASE || 'http://127.0.0.1:4173/';
const URL = BASE + 'Writing.dc.html', SHOTS = process.env.WRITING_SHOTS;
const CORAL = 'rgb(217, 105, 90)', TAGS = ['travel log', 'stories we live', 'everyday chronicles', 'commentary', 'poem'];
let fails = 0;
function check(ctx, name, ok, info) { if (!ok) fails++; ctx.log((ok ? '  ✓ ' : '  ✗ ') + name + (info ? '  ' + info : '')); }
const sleep = (page, ms) => page.waitForTimeout(ms);

async function open(page, w, h, q = '') {
  await page.setViewportSize({ width: w, height: h });
  await page.goto(URL + q, { waitUntil: 'networkidle' });
  await ready(page);
}
async function ready(page) {
  await page.waitForSelector('[data-mount=writing][data-ready]', { timeout: 15000 });
  await page.evaluate(() => document.fonts.ready);
  await sleep(page, 900);
}
const state = (page) => page.evaluate(() => ({ lang: document.querySelector('[data-mount=writing]').dataset.lang, stored: localStorage.getItem('fy-lang'), shows: document.querySelector('.wr-sign').dataset.shows }));
const phoneNow = (page) => page.evaluate(() => document.querySelector('[data-mount=writing]').classList.contains('is-phone'));
// Turn the sign to l (one press, if it shows the other language) and wait for it to land.
async function choose(page, l) {
  if ((await state(page)).shows !== l) await page.click('.sign-card');
  await page.waitForFunction((l) => document.querySelector('[data-mount=writing]').dataset.lang === l && document.querySelector('.wr-sign').dataset.shows === l, l, { timeout: 4000 });
  await sleep(page, 700);
}
async function toCase(page, off = 20) { await page.evaluate((o) => { const c = document.querySelector('.wr-case'); window.scrollTo(0, c.getBoundingClientRect().top + scrollY - o); }, off); await sleep(page, 350); }
async function spine(page, n) {
  return page.evaluate((n) => {
    const hs = [...document.querySelectorAll('.bk-hit:not(.is-out)')].filter((a) => { const r = a.getBoundingClientRect(); return r.bottom > 40 && r.top < innerHeight - 40 && r.left > 0 && r.right < innerWidth; });
    const a = hs[n % hs.length], r = a.getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height * 0.35), id: a.dataset.post };
  }, n);
}
// Every spine's drawn box (through the camera), the hit links, the planks and the case height.
const geometry = (page) => page.evaluate(() => {
  const r = (e) => { const b = e.getBoundingClientRect(); return [b.left, b.top, b.width, b.height].map((v) => v.toFixed(1)).join(','); }, c = document.querySelector('.wr-case');
  return JSON.stringify({ planks: c.dataset.planks, h: c.style.height, spines: [...document.querySelectorAll('.book .f-spine')].map(r), hits: [...document.querySelectorAll('.bk-hit')].map((a) => a.style.cssText) });
});
// Each spine's title against the index, and the fit's rule (case.js) in layout px (the camera's transforms don't
// count): whole (nothing cut by writing.css's clip), at most 85% of the spine's inside (70% under a series badge, and
// clear of it), 4 px clear of each edge, never under the 8.2 px floor. Every title today fits whole.
const FLOOR = 8.2;
const spines = (page) => page.evaluate((FLOOR) => {
  const idx = new Map(window.FY_POST_INDEX.map((p) => [p.id, p])), hits = [...document.querySelectorAll('.bk-hit')];
  return [...document.querySelectorAll('.book')].map((b, i) => {
    const s = b.querySelector('.bk-spine'), t = b.querySelector('.bk-title'), badge = b.querySelector('.bk-badge'), p = idx.get(hits[i].dataset.post), cs = getComputedStyle(t), fs = parseFloat(cs.fontSize);
    const cut = t.scrollHeight > t.clientHeight + 1 || t.scrollWidth > t.clientWidth + 1;
    const rule = t.offsetTop >= 0 && t.offsetHeight <= s.clientHeight * (badge ? 0.7 : 0.85) + 0.5 && t.offsetWidth <= s.offsetWidth - 8 && (!badge || t.offsetTop + t.offsetHeight <= badge.offsetTop);
    return { id: p.id, zh: p.titleZh || '', en: p.title || '', lang: t.lang, text: t.textContent, mode: cs.writingMode, orient: cs.textOrientation || cs.webkitTextOrientation, fs, wrap: cs.whiteSpace !== 'nowrap',
      cut, fits: rule && !cut && fs >= FLOOR - 0.01 };
  });
}, FLOOR);
const first = (p, l) => (l === 'en' ? (p.en ? 'en' : 'zh') : (p.zh ? 'zh' : 'en'));
function badSpines(list, l) {
  return list.filter((s) => { const f = first(s, l); return s.lang !== f || s.text !== s[f] || s.mode !== 'vertical-rl' || s.orient !== (f === 'en' ? 'sideways' : 'mixed') || !s.fits; });
}
const sizes = (list) => { const f = list.map((s) => s.fs); return `sizes ${Math.min(...f).toFixed(1)}–${Math.max(...f).toFixed(1)}px, ${list.filter((s) => s.wrap).length} on two lines`; };
const links = (page, l) => page.evaluate((l) => [...document.querySelectorAll('.bk-hit, a.book')].every((a) => a.getAttribute('href').endsWith('&lang=' + l)), l);
// The sign's pen, per face: shown, the band under its big word, the coral line under the other language's name; the
// 「 」 around the card; and every coral stroke left on the page body.
const pen = (page) => page.evaluate((CORAL) => {
  const vis = (p) => !!p && getComputedStyle(p).visibility !== 'hidden', coral = (p) => vis(p) && getComputedStyle(p).stroke === CORAL && +getComputedStyle(p).opacity > 0.05, o = {};
  for (const l of ['zh', 'en']) {
    const f = document.querySelector('.sign-' + l), tm = f.querySelectorAll('svg.tm'), th = f.querySelectorAll('svg.tm-h');
    o[l] = { shown: vis(f), band: vis(tm[0].querySelector('.tm-band')), line: coral(th[1].querySelector('.tm-hot')) };
  }
  o.focus = [...document.querySelectorAll('.wr-sign > svg.fm .fm-c')].filter(coral).length === 2;
  o.coral = [...document.querySelectorAll('.wr svg path')].filter(coral).length;
  return o;
}, CORAL);
// The sign's place and spacing, on the face it shows: the band's edge to what follows it (the hint, or on a phone,
// where the hint stands beside the word, the card's edge), the hint's line to the card's edge, the foot against the
// case and the heads of the spines under it, and nothing of it out of the page, over the index or (phone) the cue.
const signGeo = (page) => page.evaluate(() => {
  const s = document.querySelector('.wr-sign'), card = s.querySelector('.sign-card').getBoundingClientRect(), cs = document.querySelector('.wr-case').getBoundingClientRect(), ix = document.querySelector('.wr-index').getBoundingClientRect();
  const f = s.querySelector('.sign-' + s.dataset.shows), tm = f.querySelectorAll('svg.tm'), line = (i) => tm[i].querySelector('.tm-line').getBoundingClientRect(), drop = (i) => +tm[i].getAttribute('data-drop');
  const rg = document.createRange(); rg.selectNodeContents(f.querySelector('.sign-hint'));
  const row = getComputedStyle(f).flexDirection === 'row', hint = Math.min(...[...rg.getClientRects()].map((r) => r.top)), edge = card.bottom - 1.5;
  const heads = [...document.querySelectorAll('.bk-hit:not(.is-out)')].map((a) => a.getBoundingClientRect()).filter((r) => r.right > card.left && r.left < card.right);
  const cue = document.querySelector('.case-cue'), over = (r) => r.left < card.right && r.right > card.left && r.top < card.bottom && r.bottom > card.top;
  let cueHit = false;
  if (cue) { const r2 = document.createRange(); r2.selectNodeContents(cue); cueHit = [...r2.getClientRects()].some(over); }
  return { band: +((row ? edge : hint) - line(0).bottom - 1.1).toFixed(1), needBand: Math.max(10, 2 * drop(0)), line: +(edge - line(1).bottom - 1.1).toFixed(1), needLine: Math.max(10, 2 * drop(1)),
    foot: +(cs.top - card.bottom).toFixed(1), heads: heads.length ? +(Math.min(...heads.map((r) => r.top)) - card.bottom).toFixed(1) : null,
    inPage: card.left >= 0 && card.right <= innerWidth, index: !over(ix), cueHit };
});
const geoOk = (g) => g.band >= g.needBand && g.line >= g.needLine && g.foot >= -0.5 && (g.heads == null || g.heads >= 0) && g.inPage && g.index && !g.cueHit;
// The button's accessible name, as Chromium computes it.
async function axName(cdp) {
  const { root } = await cdp.send('DOM.getDocument', { depth: 0 }), { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: '.sign-card' });
  const { nodes } = await cdp.send('Accessibility.getPartialAXTree', { nodeId, fetchRelatives: false }), n = nodes.find((x) => x.role && x.role.value === 'button') || nodes[0];
  return { role: n.role && n.role.value, name: n.name && n.name.value };
}
// The book in your hand: both titles on the obi and on the title page under the board.
const cover = (page) => page.evaluate(() => {
  const b = document.querySelector('.book.held'); if (!b) return null;
  const one = (n) => ({ lang: n.lang, text: n.textContent, shown: !n.hidden });
  return { id: document.querySelector('[data-mount=writing]').dataset.held, t: one(b.querySelector('.obi-t')), s: one(b.querySelector('.obi-s')), pt: one(b.querySelector('.p1-t')), ps: one(b.querySelector('.p1-s')), href: b.getAttribute('href') };
});
function coverOk(c, l, idx) {
  if (!c) return false;
  const p = idx[c.id], T = { zh: p.titleZh || '', en: p.title || '' }, f = first(T, l), o = f === 'zh' ? 'en' : 'zh';
  const pair = (t, s) => t.lang === f && t.text === T[f] && t.shown && (T[o] ? s.lang === o && s.text === T[o] && s.shown : !s.shown);
  return pair(c.t, c.s) && pair(c.pt, c.ps) && c.href.endsWith('&lang=' + l);
}
// A press, watched frame by frame until the shelf has turned: whether anything changed at the press, any frame with
// spines in both languages, when it turned, and any animation on the shelf.
const press = (page) => page.evaluate(() => new Promise((res) => {
  const langs = () => [...document.querySelectorAll('.bk-title')].map((t) => t.lang), was = langs()[0], t0 = performance.now();
  let mixed = 0, at = null;
  document.querySelector('.sign-card').click();
  const still = langs().every((l) => l === was);
  (function f() {
    const ls = langs(), old = ls.filter((l) => l === was).length;
    if (old && old < ls.length) mixed++;
    if (!old) at = Math.round(performance.now() - t0);
    if (at != null || performance.now() - t0 > 2000) return res({ still, mixed, at, turned: !old, anims: document.getAnimations().filter((a) => a.effect && a.effect.target && a.effect.target.closest && a.effect.target.closest('.sh-world')).length });
    requestAnimationFrame(f);
  })();
}));
// A press in WebKit, every frame of the turn: exactly one face shown, and it faces you (the card's and the face's
// turns together, cos ≥ 0), never the far face mirrored.
const turnFrames = (page) => page.evaluate(() => new Promise((res) => {
  const s = document.querySelector('.wr-sign'), flip = s.querySelector('.sign-flip'), F = { zh: s.querySelector('.sign-zh'), en: s.querySelector('.sign-en') }, out = { frames: 0, bad: [] }, t0 = performance.now();
  const m11 = (f) => new DOMMatrix(getComputedStyle(flip).transform).multiply(new DOMMatrix(getComputedStyle(f).transform)).m11;
  s.querySelector('.sign-card').click();
  (function f() {
    const on = ['zh', 'en'].filter((l) => getComputedStyle(F[l]).visibility !== 'hidden'); out.frames++;
    if (on.length !== 1) out.bad.push('faces ' + on.join('+')); else if (m11(F[on[0]]) < -0.02) out.bad.push('mirrored ' + on[0]);
    if (performance.now() - t0 < 1000) requestAnimationFrame(f); else res(out);
  })();
}));
const shot = async (ctx, page, name, opts) => { if (!SHOTS) return; await page.screenshot({ path: `${SHOTS}-${name}.png`, ...opts }); ctx.log('saved', `${SHOTS}-${name}.png`); };
const clip = (page) => page.evaluate(() => { const r = document.querySelector('.wr-sign').getBoundingClientRect(); return { x: Math.max(0, r.left - 24), y: Math.max(0, r.top - 12), width: Math.min(innerWidth - Math.max(0, r.left - 24), r.width + 48), height: r.height + 30 }; });

export default async (page, ctx) => {
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('response', (r) => { if (r.status() >= 400 && !r.url().endsWith('favicon.ico')) errors.push(r.status() + ' ' + r.url()); });
  await page.addInitScript(() => { const raf = window.requestAnimationFrame; window.__raf = 0; window.requestAnimationFrame = function (f) { window.__raf++; return raf.call(window, f); }; });
  const cdp = await page.context().newCDPSession(page);
  const tap = async (x, y) => { await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] }); await sleep(page, 40); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
  async function hold(n) {
    if (!(await phoneNow(page))) {
      await toCase(page); const p = await spine(page, n);
      await page.mouse.move(p.x - 30, p.y + 70); await page.mouse.move(p.x, p.y, { steps: 8 }); await sleep(page, 1500);
      return;
    }
    await toCase(page, 120); const p = await spine(page, n);
    await tap(p.x, p.y); await sleep(page, 1600);
  }
  // Put the book back: the pointer leaves the shelf; on a phone, a tap on the bare top of the shelf. Then wait for
  // the page's loops to sleep (no rAF for 300 ms), so every book is back at rest.
  async function letGo() {
    if (!(await phoneNow(page))) await page.mouse.move(2, 2);
    else {
      await toCase(page, 120);
      const r = await page.evaluate(() => { const b = document.querySelector('.wr-case').getBoundingClientRect(); return { x: b.left + 8, y: b.top + 8 }; });
      await tap(r.x, r.y);
    }
    await sleep(page, 400);
    for (let i = 0, n = -1; i < 20; i++) { const m = await page.evaluate(() => window.__raf); if (m === n) break; n = m; await sleep(page, 300); }
  }
  // Open a book from the keyboard: walk onto it (so the focus is the keyboard's), wait for it in the hand, Enter
  // (a phone's first Enter is its first tap: it pulls the book, the second opens it).
  async function openByKeys(i = 0) {
    await page.evaluate((i) => [...document.querySelectorAll('.bk-hit')][i].focus(), Math.max(0, i - 1));
    if (i > 0) await page.keyboard.press('ArrowRight'); else { await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowLeft'); }
    await sleep(page, 1500);
    const id = await page.evaluate(() => document.activeElement.dataset.post);
    for (let k = 0; k < 2 && !/Reading\.dc\.html/.test(page.url()); k++) await Promise.all([page.waitForURL(/Reading\.dc\.html\?post=/, { timeout: 4000 }).catch(() => {}), page.keyboard.press('Enter')]);
    await page.waitForSelector('[data-mount="reading"][data-ready]', { timeout: 20000 }).catch(() => {});
    return id;
  }
  await page.goto(URL); await page.evaluate(() => localStorage.clear());
  const idx = Object.fromEntries((await page.evaluate(() => window.FY_POST_INDEX)).map((p) => [p.id, p]));

  for (const [w, h] of [[1440, 900], [1024, 800], [820, 1180], [390, 844], [360, 780], [320, 700]]) {
    ctx.log(`— ${w}×${h}`);
    await page.evaluate(() => localStorage.clear());
    await open(page, w, h);
    const phone = await phoneNow(page), ax = await axName(cdp);
    const faces = await page.evaluate(() => ['zh', 'en'].map((l) => { const f = document.querySelector('.sign-' + l); return l + ':' + f.querySelector('.sign-big').lang + ':' + f.querySelector('.sign-to').lang + ':' + f.hasAttribute('aria-hidden'); }).join(' '));
    check(ctx, `the sign: one button named by the face you see, each word in its lang (${phone ? 'phone' : 'desk'})`, ax.role === 'button' && (phone ? ax.name === '中文 flip English' : ax.name === '书架 shelf 中文 flip English') && faces === 'zh:zh:en:false en:en:zh:false', JSON.stringify({ ax, faces }));
    let s = await state(page), list = await spines(page), bad = badSpines(list, 'zh');
    check(ctx, 'a first visit (no fy-lang) reads Chinese: spines, the face showing, the links (&lang=zh)', s.lang === 'zh' && s.stored === null && s.shows === 'zh' && !bad.length && (await links(page, 'zh')), JSON.stringify(s));
    check(ctx, 'every Chinese title fits its spine whole by the fit\'s rule (85% / 4 px / ≥ 8.2 px), upright (' + sizes(list) + ')', !bad.length, bad.map((b) => b.id + ' ' + JSON.stringify(b)).join(' · '));
    await page.mouse.move(2, 2); await sleep(page, 400);
    let p = await pen(page);
    check(ctx, 'at rest: 中文 shows, wheat-banded; the English face hidden, unmarked; no coral stroke on the page body', p.zh.shown && p.zh.band && !p.en.shown && !p.en.band && p.coral === 0, JSON.stringify(p));
    let g = await signGeo(page);
    const filtered = [];
    for (const t of TAGS) { await page.evaluate((c) => document.querySelector(`.tb[data-cat="${c}"]`).click(), t); await sleep(page, 1700); filtered.push((await signGeo(page)).heads); }
    await page.evaluate(() => document.querySelector('.tb[data-cat="all"]').click()); await sleep(page, 1700);
    check(ctx, 'the sign keeps the pen\'s spacing, its foot on or above the case\'s top edge, in the page, clear of the index and the cue',
      geoOk(g) && (await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)), JSON.stringify(g));
    check(ctx, 'its foot clears every spine head under it, at rest and under every tag filter', filtered.every((x) => x == null || x >= 0), JSON.stringify({ rest: g.heads, filtered }));
    await shot(ctx, page, `${w}-zh`, { fullPage: true });
    // hover draws the coral line under the other language's name
    await page.hover('.sign-card'); await sleep(page, 700);
    p = await pen(page);
    check(ctx, 'hover: the coral line under English on the foot, 中文 keeps its band', p.zh.line && p.zh.band, JSON.stringify(p.zh));
    await shot(ctx, page, `${w}-sign-hover`, { clip: await clip(page) });
    await page.mouse.move(2, 2); await sleep(page, 500);
    // a press: every spine turns at once as the sign passes edge-on, no animation on the shelf, no book moves
    await toCase(page);
    const g0 = await geometry(page), swap = await press(page);
    await sleep(page, 900);
    const g1 = await geometry(page);
    check(ctx, `a press retitles every spine at once as the sign passes edge-on (${swap.at} ms, never a mix) and animates nothing on the shelf`, swap.still && swap.turned && swap.mixed === 0 && swap.at > 30 && swap.at < 600 && swap.anims === 0, JSON.stringify(swap));
    check(ctx, 'a switch moves no book: every spine box, hit link, the planks and the case height unchanged', g0 === g1, g0 === g1 ? '' : 'geometry changed');
    list = await spines(page); bad = badSpines(list, 'en'); s = await state(page);
    check(ctx, 'every English title fits its spine whole by the fit\'s rule, turned to read top to bottom (' + sizes(list) + ')', !bad.length, bad.map((b) => b.id + ' ' + JSON.stringify(b)).join(' · '));
    check(ctx, 'English is stored in fy-lang, shows on the sign, and every book link carries &lang=en', s.lang === 'en' && s.stored === 'en' && s.shows === 'en' && (await links(page, 'en')), JSON.stringify(s));
    await page.mouse.move(2, 2); await sleep(page, 900);
    p = await pen(page); g = await signGeo(page);
    check(ctx, 'after the press: English shows, wheat-banded; the Chinese face hidden, unmarked; no coral at rest; the spacing holds', p.en.shown && p.en.band && !p.zh.shown && !p.zh.band && p.coral === 0 && geoOk(g), JSON.stringify({ p, g }));
    await page.evaluate(() => window.scrollTo(0, 0)); await sleep(page, 300);
    await shot(ctx, page, `${w}-en`, { fullPage: true });
    const g2 = await geometry(page);
    await page.reload({ waitUntil: 'networkidle' }); await ready(page);
    s = await state(page); list = await spines(page);
    check(ctx, 'a reload keeps English (fy-lang), with the same shelf geometry', s.lang === 'en' && s.shows === 'en' && !badSpines(list, 'en').length && (await geometry(page)) === g2, JSON.stringify(s));
    // the book in your hand: both titles, English first
    await hold(1);
    let c = await cover(page);
    check(ctx, 'held (en): the obi and the title page carry both titles, English first, each in its lang; the book leads to &lang=en', coverOk(c, 'en', idx), JSON.stringify(c));
    await shot(ctx, page, `${w}-en-held`);
    if (phone) {   // a phone keeps the book in your hand while you tap the sign (it hangs outside the case): retitled there
      await page.click('.sign-card'); await sleep(page, 900);
      c = await cover(page);
      check(ctx, 'a switch while a book is held retitles it in the hand (Chinese first)', coverOk(c, 'zh', idx), JSON.stringify(c));
      await page.click('.sign-card'); await sleep(page, 900);
    }
    await letGo();
    await choose(page, 'zh');
    await hold(5);
    c = await cover(page);
    check(ctx, 'held (zh): Chinese first, English under it; the book leads to &lang=zh', coverOk(c, 'zh', idx), JSON.stringify(c));
    await shot(ctx, page, `${w}-zh-held`);
    await letGo();
    // the first book was dressed in English: the switch left it be, and it catches up as it comes out again
    const lazy = await page.evaluate(() => [...document.querySelectorAll('.book')].filter((b) => b.querySelector('.obi-t') && b.querySelector('.obi-t').lang === 'en').length);
    await hold(1);
    c = await cover(page);
    check(ctx, 'a switch retitles only the books out of the shelf; one dressed in English earlier comes out again Chinese first', lazy >= 1 && coverOk(c, 'zh', idx), JSON.stringify({ stillEnglishAtRest: lazy, c }));
    await letGo();
    // keyboard: Tab reaches the sign, its focus is the coral 「 」, Enter and Space turn it
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.focus('.site-tab--about');
    let hops = 0;
    while (hops < 10 && !(await page.evaluate(() => document.activeElement.classList.contains('sign-card')))) { await page.keyboard.press('Tab'); hops++; }
    await sleep(page, 400);
    p = await pen(page);
    await shot(ctx, page, `${w}-sign-focus`, { clip: await clip(page) });
    await page.keyboard.press('Enter'); await sleep(page, 900);
    const k1 = await state(page);
    await page.keyboard.press('Space'); await sleep(page, 900);
    const k2 = await state(page);
    check(ctx, `keyboard: Tab reaches the sign (${hops} Tab${hops === 1 ? '' : 's'} from the nav${phone ? ', after the index' : ', its first stop'}), drawn with the coral 「 」`, (phone ? hops > 1 && hops < 10 : hops === 1) && p.focus, JSON.stringify({ hops, focus: p.focus }));
    check(ctx, 'keyboard: Enter turns it to English, Space back to 中文', k1.lang === 'en' && k1.shows === 'en' && k2.lang === 'zh' && k2.shows === 'zh', JSON.stringify({ k1, k2 }));
  }

  ctx.log('— to Reading and back');
  const reading = () => page.evaluate(() => ({ search: location.search + location.hash, lang: document.documentElement.classList.contains('lang-en') ? 'en' : 'zh', stored: localStorage.getItem('fy-lang'), n: history.length }));
  const readingReady = () => page.waitForSelector('[data-mount="reading"][data-ready]', { timeout: 20000 });
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    // Writing in a, the essay, Reading switched to b, a reload, history back to Writing: b throughout
    for (const [a, b] of [['en', 'zh'], ['zh', 'en']]) {
      await page.evaluate(() => localStorage.clear());
      await open(page, w, h);
      await choose(page, a);
      const q = '?post=' + encodeURIComponent(await openByKeys());
      const r1 = await reading();
      await page.click('[data-act="lang"]'); await sleep(page, 300);
      const r2 = await reading();
      await page.reload({ waitUntil: 'networkidle' }); await readingReady();
      const r3 = await reading();
      await page.goBack({ waitUntil: 'load' }); await ready(page);
      const s = await state(page);
      check(ctx, `Writing in ${a} opens the essay at ?post=<id>&lang=${a}, in ${a} (${w})`, r1.search === q + '&lang=' + a && r1.lang === a, JSON.stringify(r1));
      check(ctx, `Reading's switch to ${b} sets ?lang=${b} in place: post kept, no new history entry, fy-lang=${b} (${w})`, r2.search === q + '&lang=' + b && r2.lang === b && r2.stored === b && r2.n === r1.n, JSON.stringify(r2));
      check(ctx, `a reload of Reading stays ${b}, ?lang=${b} (${w})`, r3.search === q + '&lang=' + b && r3.lang === b, JSON.stringify(r3));
      check(ctx, `history back to Writing: the sign shows ${b === 'zh' ? '中文' : 'English'}, spines in ${b} (${w})`, s.lang === b && s.shows === b && !badSpines(await spines(page), b).length, JSON.stringify(s));
    }
    // Reading's back link: a fresh load of Writing takes up the choice made on Reading
    await openByKeys();
    await page.click('[data-act="lang"]'); await sleep(page, 300);
    await Promise.all([page.waitForURL(/Writing\.dc\.html/, { timeout: 8000 }).catch(() => {}), page.evaluate(() => document.querySelector('a.back').click())]);
    await ready(page);
    const s = await state(page);
    check(ctx, `Reading's back link: Writing shows the choice made on Reading (中) (${w})`, s.lang === 'zh' && s.shows === 'zh' && !badSpines(await spines(page), 'zh').length, JSON.stringify(s));
  }
  // Headless Chromium may not restore from the bfcache: change fy-lang as Reading would and fire the pageshow a restore would.
  await page.evaluate(() => { localStorage.setItem('fy-lang', 'en'); window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })); });
  await sleep(page, 400);
  let s = await state(page);
  check(ctx, 'a bfcache restore (pageshow.persisted) takes up the language chosen meanwhile, the sign turned at once', s.lang === 'en' && s.shows === 'en' && !badSpines(await spines(page), 'en').length && (await links(page, 'en')), JSON.stringify(s));
  // Reading's switch rewrites only lang: every other parameter, their order and the hash stay; a missing lang is added.
  const post = '2019-01-09_he-and-his-cat', kept = [];
  for (const [from, to] of [[`?theme=light&post=${post}&lang=en#x`, `?theme=light&post=${post}&lang=zh#x`], [`?post=${post}&theme=light#x`, `?post=${post}&theme=light&lang=en#x`]]) {
    await page.evaluate(() => localStorage.clear());
    await page.goto(BASE + 'Reading.dc.html' + from, { waitUntil: 'networkidle' }); await readingReady();
    await page.click('[data-act="lang"]'); await sleep(page, 300);
    const got = (await reading()).search; kept.push(got === to ? 'ok' : '✗ ' + got);
  }
  check(ctx, "Reading's switch keeps the other parameters, their order and the hash; a missing lang is added", kept.every((k) => k === 'ok'), kept.join(' · '));

  ctx.log('— ?lang=, one-title posts, reduced motion, idle');
  await page.evaluate(() => localStorage.setItem('fy-lang', 'zh'));
  await open(page, 1440, 900, '?lang=en');
  s = await state(page);
  check(ctx, '?lang=en wins over fy-lang=zh (as on Reading) and is not stored', s.lang === 'en' && s.shows === 'en' && s.stored === 'zh' && (await links(page, 'en')), JSON.stringify(s));
  // a switch on Writing deletes its own ?lang= (in place), so a reload follows the switch
  const hn = await page.evaluate(() => history.length);
  await choose(page, 'zh');
  const qz = await page.evaluate(() => ({ search: location.search, n: history.length }));
  await page.reload({ waitUntil: 'networkidle' }); await ready(page);
  s = await state(page);
  check(ctx, '?lang=en, then the sign turned to 中文: lang leaves the address in place (no new history entry) and a reload stays 中文', qz.search === '' && qz.n === hn && s.lang === 'zh' && s.shows === 'zh' && s.stored === 'zh' && !badSpines(await spines(page), 'zh').length, JSON.stringify({ qz, s }));
  // a post with only one title: it shows that one, in either language, and once on the cover
  const ONLY_ZH = '2019-01-09_he-and-his-cat', ONLY_EN = '2024-04-23_hong-kong-forest';
  await page.route('**/content/posts-index.js', async (route) => {
    const res = await route.fetch(), body = (await res.text()).replace(/("id":"2019-01-09_he-and-his-cat"[^}]*?"title":)"[^"]*"/, '$1""').replace(/("id":"2024-04-23_hong-kong-forest"[^}]*?"titleZh":)"[^"]*"/, '$1""');
    await route.fulfill({ response: res, body });
  });
  const one = [];
  for (const l of ['zh', 'en']) {
    await page.evaluate((l) => localStorage.setItem('fy-lang', l), l);
    await open(page, 1440, 900);
    const list = await spines(page), got = Object.fromEntries(list.filter((x) => x.id === ONLY_ZH || x.id === ONLY_EN).map((x) => [x.id, x.lang + ':' + x.text]));
    one.push(l + ' ' + JSON.stringify(got));
    if (got[ONLY_ZH] !== 'zh:他和他的猫' || got[ONLY_EN] !== 'en:Hong Kong Forest' || badSpines(list, l).length) one.push('✗');
  }
  const at = await page.evaluate((id) => [...document.querySelectorAll('.bk-hit')].findIndex((a) => a.dataset.post === id), ONLY_ZH);
  await page.evaluate((i) => document.querySelectorAll('.bk-hit')[i - 1].focus(), at);
  await page.keyboard.press('ArrowRight'); await sleep(page, 1600);
  const c = await cover(page), idx1 = { ...idx, [ONLY_ZH]: { ...idx[ONLY_ZH], title: '' } };
  await page.unroute('**/content/posts-index.js');
  check(ctx, 'a post with one title shows it on its spine in either language, and once on its cover', !one.includes('✗') && coverOk(c, 'en', idx1), one.join(' · ') + ' · cover ' + JSON.stringify(c && [c.t, c.s]));
  // a switch while a filter hides books (display:none, no size to fit): each is retitled and fitted when it comes back
  await page.evaluate(() => localStorage.clear());
  await open(page, 1440, 900);
  await page.click('.tb[data-cat="poem"]'); await sleep(page, 1800);
  const hidden = await page.evaluate(() => document.querySelectorAll('.book.is-out').length);
  await choose(page, 'en');
  await page.click('.tb[data-cat="all"]'); await sleep(page, 2500);
  let list = await spines(page), bad = badSpines(list, 'en');
  const back = await page.evaluate(() => document.querySelectorAll('.book:not(.is-out)').length);
  check(ctx, `a switch while a filter hides ${hidden} books: with the filter cleared, all ${back} are in English, each fitted`, hidden >= 20 && back === list.length && !bad.length, bad.map((b) => b.id + ' ' + JSON.stringify(b)).join(' · '));
  // re-mounts across 760 px keep the language, and each instance hands back its lang subscriptions (lang.js's list,
  // exposed by serving it with one line changed)
  await page.route('**/lib/writing/lang.js', async (route) => { const res = await route.fetch(); await route.fulfill({ response: res, body: (await res.text()).replace('subs = [];', 'subs = window.__langSubs = [];') }); });
  await open(page, 1440, 900);
  const subs0 = await page.evaluate(() => window.__langSubs && window.__langSubs.length), seen = [];
  for (const w of [700, 1440, 390, 1024]) {
    await page.setViewportSize({ width: w, height: 900 }); await sleep(page, 900);
    const st = await state(page), ph = await phoneNow(page);
    seen.push(w + (ph ? ' phone ' : ' desk ') + st.lang + '/' + st.shows + (badSpines(await spines(page), 'en').length ? ' ✗' : ''));
  }
  const subs1 = await page.evaluate(() => window.__langSubs && window.__langSubs.length);
  await page.unroute('**/lib/writing/lang.js');
  check(ctx, `re-mounts across 760 px (1440 → 700 → 1440 → 390 → 1024) keep English on every spine and the sign, and the lang subscribers stay at ${subs0}`, subs0 > 0 && subs1 === subs0 && seen.every((x) => / en\/en$/.test(x)), JSON.stringify({ seen, subs0, subs1 }));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page, 1440, 900);
  await page.click('.sign-card'); await sleep(page, 50);
  const rm = await page.evaluate(() => { const f = document.querySelector('.sign-zh'); return { lang: document.querySelector('[data-mount=writing]').dataset.lang, shows: document.querySelector('.wr-sign').dataset.shows, running: document.getAnimations().filter((a) => a.playState === 'running').length, band: getComputedStyle(f.querySelector('svg.tm .tm-band')).visibility }; });
  check(ctx, 'reduced motion: a press lands at once (中文 shows, banded, the shelf retitled) and leaves nothing running after 50 ms', rm.running === 0 && rm.lang === 'zh' && rm.shows === 'zh' && rm.band === 'visible', JSON.stringify(rm));
  await page.emulateMedia({ reducedMotion: null });
  await open(page, 1440, 900);
  await page.click('.sign-card'); await page.mouse.move(2, 2); await sleep(page, 1500);
  const r0 = await page.evaluate(() => window.__raf); await sleep(page, 2000);
  const r1 = await page.evaluate(() => window.__raf);
  check(ctx, 'idle after a press: 0 requestAnimationFrame calls over 2 s', r1 === r0, `${r1 - r0} calls`);
  await page.evaluate(() => localStorage.clear());

  // localStorage blocked (it throws, as with site data turned off): each page still sets one language (Reading one
  // theme too), both switches and the theme toggle work, and nothing throws.
  ctx.log('— storage blocked');
  const bc = await page.context().browser().newContext({ viewport: { width: 1440, height: 900 } }), berr = [];
  await bc.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('The operation is insecure.', 'SecurityError'); } }); });
  const bp = await bc.newPage();
  bp.on('pageerror', (e) => berr.push('pageerror: ' + e.message)); bp.on('console', (m) => { if (m.type() === 'error') berr.push(m.text()); });
  await bp.goto(URL, { waitUntil: 'networkidle' }); await ready(bp);
  const wb0 = await bp.evaluate(() => document.querySelector('[data-mount=writing]').dataset.lang);
  await bp.click('.sign-card'); await sleep(bp, 700);
  const wb1 = await bp.evaluate(() => ({ lang: document.querySelector('[data-mount=writing]').dataset.lang, spine: document.querySelector('.bk-title').lang, href: document.querySelector('.bk-hit').getAttribute('href') }));
  check(ctx, 'storage blocked: Writing reads Chinese, and the sign turned to English retitles the shelf and its links', wb0 === 'zh' && wb1.lang === 'en' && wb1.spine === 'en' && /&lang=en$/.test(wb1.href), JSON.stringify({ wb0, wb1 }));
  await bp.goto(BASE + 'Reading.dc.html?post=2019-01-09_he-and-his-cat', { waitUntil: 'networkidle' });
  await bp.waitForSelector('[data-mount="reading"][data-ready]', { timeout: 20000 }).catch(() => berr.push('Reading never mounted'));
  const rs = () => bp.evaluate(() => { const h = document.documentElement; return { langs: ['lang-zh', 'lang-en'].filter((c) => h.classList.contains(c)).join(','), theme: h.getAttribute('data-theme'), dark: h.classList.contains('dark'), q: location.search,
    label: document.querySelector('[data-act="lang"]').getAttribute('aria-label'), pressed: document.querySelector('[data-act="theme"]').getAttribute('aria-pressed') }; });
  const rb0 = await rs();
  await bp.click('[data-act="lang"]'); await sleep(bp, 300);
  const rb1 = await rs();
  await bp.click('[data-act="theme"]'); await sleep(bp, 300);
  const rb2 = await rs();
  check(ctx, 'storage blocked: Reading (no ?lang=, no ?theme=) sets one language and one theme; its switch and theme toggle both work',
    rb0.langs === 'lang-zh' && /^(light|dark)$/.test(rb0.theme) && rb0.dark === (rb0.theme === 'dark') && rb1.langs === 'lang-en' && /[?&]lang=en/.test(rb1.q) && /Switch to Chinese/.test(rb1.label) &&
    rb2.dark !== rb1.dark && rb2.theme === (rb2.dark ? 'dark' : 'light') && rb2.pressed === String(rb2.dark), JSON.stringify({ rb0, rb1, rb2 }));
  check(ctx, 'storage blocked: 0 console errors on either page', !berr.length, berr.slice(0, 3).join(' · '));
  await bc.close();

  // WebKit (Playwright's build of the Safari engine), as reading-webkit.mjs runs it: a returning English reader's
  // cold load in a fresh context, then the sign both ways and a book in the hand. The book is taken by keyboard:
  // headless WebKit with touch reports (and draws) the 3D shelf's boxes some 25,000 px off, on main too, so no spine
  // can be aimed at by its box.
  ctx.log('— WebKit');
  const req = createRequire(process.argv[1]), pw = await import(req.resolve('playwright-core'));
  const wk = await (pw.webkit || pw.default.webkit).launch({ headless: true });
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    // a cold load fits before the faces land, and WebKit fires no loadingdone: two, each in a fresh context, must fit
    const werr = [], cold = [];
    let wc, wp;
    for (let run = 0; run < 2; run++) {
      if (wc) await wc.close();
      wc = await wk.newContext({ viewport: { width: w, height: h }, hasTouch: w < 760 }); wp = await wc.newPage();
      await wc.addInitScript(() => { try { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('fy-lang', 'en'); sessionStorage.setItem('seeded', '1'); } } catch (e) { /* storage off */ } });
      wp.on('pageerror', (e) => werr.push(e.message)); wp.on('console', (m) => { if (m.type() === 'error') werr.push(m.text()); });
      await wp.goto(URL, { waitUntil: 'networkidle' }); await ready(wp);
      const wb = badSpines(await spines(wp), 'en'), lg = (await state(wp)).lang;
      cold.push(lg !== 'en' ? 'lang ' + lg : wb.length ? wb.map((b) => b.text.slice(0, 20) + ' @' + b.fs.toFixed(1)).join(' · ') : 'ok');
    }
    check(ctx, `WebKit ${w}: two cold loads with fy-lang=en fit every English title (the mount waits for the stylesheets, the fit for the faces)`, cold.every((x) => x === 'ok'), cold.join(' | '));
    for (const to of ['zh', 'en']) {
      const fr = await turnFrames(wp); await sleep(wp, 700);
      const wl = await spines(wp), wb = badSpines(wl, to), st = await state(wp);
      check(ctx, `WebKit ${w}: the sign turns to ${to === 'zh' ? '中文' : 'English'}, one face shown and none mirrored in all ${fr.frames} frames; every spine retitled and fitted (${sizes(wl)})`, st.lang === to && st.shows === to && !fr.bad.length && fr.frames > 10 && !wb.length, JSON.stringify({ st, bad: fr.bad.slice(0, 3), spines: wb.map((b) => b.id) }));
      await shot(ctx, wp, `webkit-${w}-${to}`, { clip: await clip(wp) });
    }
    await wp.evaluate(() => document.querySelector('.bk-hit').focus());
    await wp.keyboard.press('ArrowRight'); await sleep(wp, 1600);
    const wcv = await cover(wp);
    check(ctx, `WebKit ${w}: the book in your hand carries both titles, English first`, coverOk(wcv, 'en', idx), JSON.stringify(wcv));
    check(ctx, `WebKit ${w}: 0 console errors`, !werr.length, werr.slice(0, 3).join(' · '));
    await wc.close();
  }
  await wk.close();

  check(ctx, '0 console errors, every request 200', !errors.length, errors.slice(0, 3).join(' · '));
  ctx.log(`writing-lang: ${fails ? fails + ' FAILED' : 'all passed'}`);
  if (fails) process.exitCode = 1;
};
