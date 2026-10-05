// vt-project.mjs — the Building board ↔ a project's pages and its chapters (FYProject, lib/shared/transitions-tab.js), in
// Chromium with the back/forward cache on (vt-lib's bfcache()), at 1440 and 390, the last frames at 360 too, and WebKit.
//   node /tmp/fyshot/run.mjs scripts/verify/vt-project.mjs
//   env: VT_ORIGIN (:4173) · VT_W (1440,390) · SHOTS (/tmp/fyshot/vt-project) · WEBKIT=0 skips WebKit
//        PJ_BEFORE=1 unnames the card and the sheet (the round-3 bug): the layering checks must then fail
// Every move, for Fred Agent and NJJoe (the way in by a dossier tab and by the card's own link, the way back, a chapter
// later and earlier), and home ↔ Building, a project page ↔ home and Writing:
//   · its kind, ready resolves (a duplicate name would abort it) and it finishes; fy-vt is consumed; no overflow after;
//   · one element per name on both sides (counted at pageswap and at ready), and the names each move needs;
//   · compositor only: every animation it adds moves only transform or opacity, and Chrome's trace composites every
//     one that moves (compositeFailed 0);
// the board's three moves, frozen and posed every 40 ms from 0 to their end: wherever a tab's group is drawn over the
// card's (or, in your hand, the dossier sheet's), the card is its own group, above the tab's (Fred, on Q2: "the order
// of layer should be correct at the first place"); the way back does overlap (the check has teeth), and its
// most-overlapped pose is shot; a chapter move leaves nothing covering a tab at rest;
// every project move's last frame: each group ends within 1 px of its element, the tabs inside the cork on the board;
// after the way back lands, the card's pin is pushed in and the lead card's flower pressed with it (its re-pin cue);
// the card you came back from (R1): NJJoe, taken by its link, after two chapter hops and 10 s, and Fred Agent after a
// Back to a board left scrolled away, each inside the cork, its pin pushed in only after a move;
// the back/forward cache: Back to a board left with its dossier out restores it (persisted), closes the dossier at once,
// clears the names its pageswap set, and the move's ready resolves; Back to a board left under 2 s after a pan swings no
// slip and lands within 1 px; without the Navigation API, a restored board ignores its stale referrer;
// reduced motion: no transition, no pin hidden or pressed; WebKit: every move lands, with its own transitions or a hard
// cut (it reports which), recorded to video (its screenshots are blank during a transition); 0 console or page errors anywhere, a skipped
// transition's rejection included.
import { ORIGIN, hook, seek, drawn, check, bfcache, webkit } from './vt-lib.mjs';
import fs from 'fs';

const B = ORIGIN + '/', SHOTS = process.env.SHOTS || '/tmp/fyshot/vt-project', BEFORE = process.env.PJ_BEFORE === '1';
const TABS = [1, 2, 3, 4, 5].map((n) => 'pj-tab-' + n), TABS3 = TABS.slice(0, 3), CARD = 'pj-card', SHEET = 'pj-sheet';
const FA = 'building/fred-agent/', NJP = 'building/njjoe/', NJ = '.slot[data-id="njjoe"]', FAS = '.slot[data-id="fred-agent"]';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const area = (a, b) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
const click = (page, sel) => page.evaluate((s) => document.querySelector(s).click(), sel);
// NJJoe is the board's second card: one step along brings it into view, as a reader would before taking it
const toNJJoe = async (p) => { await p.focus('.cork-viewport'); await p.keyboard.press('ArrowRight'); await sleep(1300); };
const MOVES = {
  'in · the card\'s own link': { from: 'Building.dc.html', go: FAS + ' .project-cta', url: /fred-agent\/$/, kind: 'in', part: 'old', old: TABS.concat(CARD), now: TABS },
  'in · a dossier tab': { from: 'Building.dc.html', prep: async (p) => { await click(p, FAS + ' .swing'); await sleep(1700); }, go: '.dos-tabs .dos-tab:nth-child(3)', url: /principles/, kind: 'in', part: 'old', old: TABS.concat(CARD, SHEET), now: TABS },
  'out · the way back': { from: FA + 'components.html', go: '.pj-back', url: /Building/, kind: 'out', part: 'new', old: TABS, now: TABS.concat(CARD) },
  'out · the building tab': { from: FA + 'demos.html', go: '.site-tab--building', url: /Building/, kind: 'out', old: TABS, now: TABS.concat(CARD) },
  'chapter · later': { from: FA + 'index.html', go: '.pj-tabs a[href*="principles"]', url: /principles/, kind: 'chapter', old: TABS, now: TABS },
  'chapter · earlier': { from: FA + 'principles.html', go: '.pj-tabs a[href*="system"]', url: /system/, kind: 'chapter', old: TABS, now: TABS },
  'NJJoe in · its own link': { from: 'Building.dc.html', prep: toNJJoe, go: NJ + ' .featured-cta', url: /njjoe\/$/, kind: 'in', part: 'old', card: NJ, old: TABS3.concat(CARD), now: TABS3 },
  'NJJoe in · a dossier tab': { from: 'Building.dc.html', prep: async (p) => { await toNJJoe(p); await click(p, NJ + ' .swing'); await sleep(1700); }, go: '.dos-tabs .dos-tab:nth-child(2)', url: /microsite/, kind: 'in', part: 'old', card: NJ, old: TABS3.concat(CARD, SHEET), now: TABS3 },
  'NJJoe out · the way back': { from: NJP + 'apa.html', go: '.pj-back', url: /Building/, kind: 'out', part: 'new', card: NJ, old: TABS3, now: TABS3.concat(CARD) },
  'NJJoe chapter · later': { from: NJP + 'index.html', go: '.pj-tabs a[href*="apa"]', url: /apa/, kind: 'chapter', old: TABS3, now: TABS3 },
  'NJJoe chapter · earlier': { from: NJP + 'apa.html', go: '.pj-tabs a[href*="microsite"]', url: /microsite/, kind: 'chapter', old: TABS3, now: TABS3 },
  'home → Building': { from: 'index.html?opx=1&opener=none', go: 'a[href="Building.dc.html"][aria-label]', visible: true, url: /Building/, kind: 'enter' },
  'Building → home': { from: 'Building.dc.html', go: '.site-home', url: /index\.html/, kind: 'leave' },
  'project → home': { from: FA + 'system.html', go: '.site-home', url: /index\.html/, kind: 'leave' },
  'project → Writing': { from: FA + 'index.html', go: '.site-tab--writing', url: /Writing/, kind: 'tab' },
  'Writing → Building': { from: 'Writing.dc.html', go: '.site-tab--building', url: /Building/, kind: 'tab' }
};

// what the pages report: the names on each side, the pin's animations, whether a pin was hidden at first paint
async function instrument(c) {
  await hook(c, []);
  await c.addInitScript((before) => {
    const count = () => { const n = {}; document.querySelectorAll('*').forEach((el) => { const v = getComputedStyle(el).viewTransitionName; if (v && v !== 'none') n[v] = (n[v] || 0) + 1; }); return n; };
    addEventListener('load', () => addEventListener('pageswap', () => { try { sessionStorage.setItem('vt-names-old', JSON.stringify(count())); } catch (e) { /* storage off */ } }));
    addEventListener('pagereveal', (e) => {
      if (e.viewTransition) e.viewTransition.ready.then(() => { window.__names = count(); }, () => { window.__names = count(); });
      requestAnimationFrame(() => { window.__pinHidden = [...document.querySelectorAll('.board-pin')].some((p) => getComputedStyle(p).visibility === 'hidden'); });
    });
    addEventListener('pageshow', (e) => { window.__persisted = e.persisted; });
    const animate = Element.prototype.animate;
    window.__pins = [];
    Element.prototype.animate = function (k, o) { if (this.classList && this.classList.contains('board-pin')) window.__pins.push({ id: this.closest('.slot').dataset.id, t: performance.now() }); return animate.call(this, k, o); };
    if (before) { const s = new CSSStyleSheet(); s.replaceSync('.fy-vt-card,.fy-vt-sheet{view-transition-name:none!important}'); document.adoptedStyleSheets = [s]; }
  }, BEFORE);
}
// a page's record cleared before it is left: a page back from the back/forward cache keeps its own
const reset = (page) => page.evaluate(() => { if (window.__vt) Object.assign(window.__vt, { vt: null, ready: false, fin: false, anims: [], samples: [], kind: null, err: null }); window.__names = null; window.__pins = []; });
async function arrive(page, go, url) {
  await reset(page);
  await go();
  await page.waitForURL(url, { timeout: 8000, waitUntil: 'commit' });
  await page.waitForFunction(() => window.__vt && window.__vt.vt !== null, null, { timeout: 8000 });
  const vt = await page.evaluate(() => window.__vt.vt);
  if (vt) await page.waitForFunction(() => window.__vt.err || window.__vt.fin || (window.__vt.freeze && window.__vt.ready), null, { timeout: 8000 }).catch(() => {});
  return page.evaluate(() => Object.assign({}, window.__vt, { names: window.__names, old: JSON.parse(sessionStorage.getItem('vt-names-old') || 'null'), fy: sessionStorage.getItem('fy-vt') }));
}
async function begin(page, m) {
  await page.goto(B + m.from, { waitUntil: 'load' }); await sleep(1100);
  if (m.prep) await m.prep(page);
}
const going = (page, m) => (m.visible ? () => page.locator(m.go).filter({ visible: true }).first().click() : () => click(page, m.go));
// Chrome's own account of each animation the move added: compositeFailed 0 = the compositor runs it
async function traced(page, go) {
  const cdp = await page.context().newCDPSession(page), ev = [];
  cdp.on('Tracing.dataCollected', (d) => ev.push(...d.value));
  await cdp.send('Tracing.start', { categories: 'devtools.timeline,blink.animations', transferMode: 'ReportEvents' });
  const r = await go();
  await sleep(300);
  const done = new Promise((res) => cdp.once('Tracing.tracingComplete', res));
  await cdp.send('Tracing.end'); await done;
  const by = {};
  ev.filter((e) => e.name === 'Animation').forEach((e) => { const k = e.pid + ':' + (e.id2 ? e.id2.local || e.id2.global : e.id); Object.assign(by[k] = by[k] || {}, e.args && e.args.data); });
  r.trace = Object.values(by).filter((d) => /^::view-transition/.test(d.nodeName || '') && !d.displayName);
  return r;
}
// the corners of each named group's old or new image, and their bounding box (viewport px)
function quads(page, names, part) {
  return page.evaluate(([names, part]) => {
    const html = document.documentElement;
    const mat = (s) => { if (!s || s === 'none') return [1, 0, 0, 1, 0, 0]; const n = s.slice(s.indexOf('(') + 1).match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi).map(Number); return s.startsWith('matrix3d') ? [n[0] / n[15], n[1] / n[15], n[4] / n[15], n[5] / n[15], n[12] / n[15], n[13] / n[15]] : n.slice(0, 6); };
    const mul = (A, B) => [A[0] * B[0] + A[2] * B[1], A[1] * B[0] + A[3] * B[1], A[0] * B[2] + A[2] * B[3], A[1] * B[2] + A[3] * B[3], A[0] * B[4] + A[2] * B[5] + A[4], A[1] * B[4] + A[3] * B[5] + A[5]];
    const eff = (cs) => { const o = cs.transformOrigin.split(' ').map(parseFloat); return mul([1, 0, 0, 1, o[0], o[1]], mul(mat(cs.transform), [1, 0, 0, 1, -o[0], -o[1]])); };
    const out = {};
    for (const n of names) {
      const g = getComputedStyle(html, `::view-transition-group(${n})`), i = getComputedStyle(html, `::view-transition-${part}(${n})`), w = parseFloat(i.width), h = parseFloat(i.height);
      if (!(w > 0)) continue;
      const M = mul(eff(g), eff(i)), P = [[0, 0], [w, 0], [0, h], [w, h]].map(([x, y]) => [M[0] * x + M[2] * y + M[4], M[1] * x + M[3] * y + M[5]]);
      const xs = P.map((p) => p[0]), ys = P.map((p) => p[1]);
      out[n] = { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
    }
    return out;
  }, [names, part]);
}
// the elements that carry the names on the page you land on, as the browser lays them out now
function boxes(page) {
  return page.evaluate(() => {
    const out = {}, r = (el) => { const b = el.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height }; };
    document.querySelectorAll('.fy-vt-tabs > .dos-tab, .fy-vt-tabs > .dos-edge').forEach((el) => { const n = getComputedStyle(el).viewTransitionName; if (/^pj-tab-/.test(n)) out[n] = r(el); });
    const c = document.querySelector('.fy-vt-card');
    if (c) out['pj-card'] = r(c);
    const v = document.querySelector('.cork-viewport');
    return { els: out, cork: v && r(v) };
  });
}
const off = (a, b) => Math.max(...['x', 'y', 'w', 'h'].map((k) => Math.abs(a[k] - b[k])));

// every pose of a frozen board move: which tabs are drawn over the card (or the sheet) without being under its group
async function poses(page, part, end, card) {
  const out = [];
  for (let t = 0; t <= end + 1; t += 40) {
    await seek(page, t);
    const info = await page.evaluate((names) => {
      const html = document.documentElement, has = (n) => document.getAnimations().some((a) => a.effect && /^::view-transition-(group|old|new|image-pair)\(/.test(a.effect.pseudoElement || '') && a.effect.pseudoElement.endsWith('(' + n + ')'));
      const z = (n) => { const v = getComputedStyle(html, '::view-transition-group(' + n + ')').zIndex; return v === 'auto' ? 0 : +v; };
      return { present: names.filter(has), z: Object.fromEntries(names.map((n) => [n, z(n)])) };
    }, TABS.concat(CARD, SHEET));
    const tabs = info.present.filter((n) => TABS.includes(n)), covers = [CARD, SHEET].filter((n) => info.present.includes(n)), box = await drawn(page, info.present, part);
    // no group of its own: the card is part of the page's snapshot, under every group (coming back to the board, where
    // the page lays it out; leaving it, in the snapshot of a page that is gone, so the move has nothing to layer it with)
    if (!covers.includes(CARD)) {
      const live = part === 'new' && await page.evaluate((sel) => { const c = document.querySelector(sel); if (!c) return null; const r = c.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; }, card);
      if (!live) { out.push({ t, over: ['no card group'], cover: 0 }); continue; }
      box[CARD] = live; info.z[CARD] = -1;
    }
    const over = [], layered = covers.includes(CARD) ? covers : covers.concat(CARD);
    let cover = 0;
    tabs.forEach((n) => layered.forEach((c) => { const a = area(box[n], box[c]); if (c === CARD) cover += a; if (a > 1 && !(info.z[c] > info.z[n])) over.push(n + '/' + c); }));
    out.push({ t, over, cover });
  }
  return out;
}
const summary = (ps) => { const bad = ps.filter((p) => p.over.length); return { poses: ps.length, overlapping: ps.filter((p) => p.cover > 1).length, tabsAbove: bad.length, first: bad[0] ? bad[0].t + ' ms: ' + bad[0].over.join(',') : '-' }; };

export default async (_page, ctx) => {
  const res = [], errs = [], browser = await bfcache();
  fs.mkdirSync(SHOTS, { recursive: true });
  const open = async (o) => {
    const c = await browser.newContext(o), p = await c.newPage();
    p.on('pageerror', (e) => errs.push('pageerror ' + e.message));
    p.on('console', (m) => { if (m.type() === 'error') errs.push(p.url() + ' ' + m.text()); });
    await instrument(c);
    return p;
  };
  ctx.log((BEFORE ? 'BEFORE the layering fix · ' : '') + B);
  for (const w of (process.env.VT_W || '1440,390').split(',').map(Number)) {
    const vp = { width: w, height: w > 500 ? 900 : 844 }, page = await open({ viewport: vp }), T = (n) => w + ' ' + n;

    for (const [name, m] of Object.entries(MOVES)) {
      await begin(page, m);
      const r = await traced(page, () => arrive(page, going(page, m), m.url));
      const moving = r.anims.filter((a) => !a.ua), bad = moving.filter((a) => a.moving.some((p) => p !== 'transform' && p !== 'opacity')).map((a) => a.pe + ': ' + a.moving.join(','));
      const late = r.trace.filter((d) => d.compositeFailed & ~(1 << 17)).map((d) => d.nodeName + ' ' + d.compositeFailed + ' ' + (d.unsupportedProperties || ''));
      check(res, T(name + ': kind ' + m.kind + ', ready resolves, finishes, fy-vt consumed'), r.vt && r.kind === m.kind && r.ready && !r.err && r.fin && r.fy === null, { kind: r.kind, ready: r.ready, err: r.err, fin: r.fin });
      if (/^(in|out|chapter|tab)$/.test(m.kind)) check(res, T(name + ': every animation it adds moves only transform or opacity, and composites'), moving.length > 2 && !bad.length && !late.length && r.trace.some((d) => d.compositeFailed === 0), bad.length || late.length ? bad.concat(late).slice(0, 4) : moving.length + ' animations, ' + r.trace.filter((d) => d.compositeFailed === 0).length + ' composited');
      if (m.old) {
        const dup = [r.old, r.names].flatMap((c) => Object.entries(c || {}).filter(([, k]) => k > 1).map(([n]) => n)), lack = m.old.filter((n) => !r.old || !r.old[n]).concat(m.now.filter((n) => !r.names || !r.names[n]));
        check(res, T(name + ': one element per name, and the names it needs on both sides'), r.old && r.names && !dup.length && !lack.length, { dup, lack });
      }
      check(res, T(name + ': no overflow after'), await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      if (m.kind === 'chapter') {
        const covered = await page.evaluate(() => [...document.querySelectorAll('.pj-tabs > .dos-tab')].filter((a) => { const r = a.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return false; const e = document.elementFromPoint(Math.min(innerWidth - 1, r.left + r.width * 0.6), r.top + r.height / 2); return e && !a.contains(e); }).map((a) => a.textContent.trim()));
        check(res, T(name + ': nothing covers a tab at rest, so the tabs may fly over the sheets'), !covered.length, covered.length ? covered : 'every tab on top');
      }
    }

    // frozen: the layering pose by pose, and the last frame
    for (const [name, m] of Object.entries(MOVES).filter(([, m]) => m.part || m.kind === 'chapter')) {
      await begin(page, m);
      await page.evaluate(() => sessionStorage.setItem('vt-freeze', '1'));
      const r = await arrive(page, going(page, m), m.url), end = Math.max(...r.anims.map((a) => a.dur));
      if (m.part) {
        const ps = await poses(page, m.part, end, m.card || FAS), s = summary(ps);
        check(res, T(name + ': no tab drawn over the card (or the sheet) it is under at rest, pose by pose'), !s.tabsAbove && (m.kind !== 'out' || s.overlapping), s);
        if (m.kind === 'out' && m.part) {
          const worst = ps.filter((p) => p.cover > 1).sort((a, b) => b.cover - a.cover)[0];
          if (worst) { const to = `${SHOTS}/way-back-${m.card ? 'njjoe-' : ''}${w}-${BEFORE ? 'before' : 'after'}.png`; await seek(page, worst.t); await page.screenshot({ path: to }); ctx.log('saved ' + to + ' (' + worst.t + ' ms)'); }
        }
      }
      await seek(page, end);
      const now = await quads(page, m.now, 'new'), el = await boxes(page), gap = Math.max(0, ...Object.keys(el.els).map((n) => (now[n] ? off(now[n], el.els[n]) : 99)));
      const outside = m.kind === 'out' ? Object.keys(el.els).filter((n) => n !== CARD && (el.els[n].x < el.cork.x - 1 || el.els[n].x + el.els[n].w > el.cork.x + el.cork.w + 1)) : [];
      check(res, T(name + ': its last frame is the settled page, every group within 1 px of its element' + (m.kind === 'out' ? ', the tabs inside the cork' : '')), Object.keys(el.els).length >= m.now.length && gap <= 1 && !outside.length, { groups: Object.keys(el.els).length, px: +gap.toFixed(2), outside });
      await page.evaluate(() => document.getAnimations().forEach((a) => { if (a.effect && a.effect.pseudoElement) a.finish(); }));
      await sleep(900);
      if (m.kind === 'out') {
        const id = m.card ? 'njjoe' : 'fred-agent', pin = await page.evaluate((id) => ({ hidden: getComputedStyle(document.querySelector(`.slot[data-id="${id}"] .board-pin`)).visibility, pressed: window.__pins.filter((p) => p.id === id).length, flower: document.querySelector('.slot[data-id="fred-agent"]').dataset.flowerCause || null, names: document.querySelectorAll('.fy-vt-tabs, .fy-vt-card, .fy-vt-sheet').length }), id);
        check(res, T(name + ': after the landing the pin is pushed in' + (m.card ? '' : ', the lead card\'s flower pressed with it') + ', and the names are gone'), pin.hidden === 'visible' && pin.pressed === 1 && (m.card || pin.flower === 're-pin') && !pin.names, pin);
      }
    }

    // the card you came back from (R1): NJJoe, taken by its own link from a board stepped along to it, two chapter hops
    // and 10 s (past fy-vt's FRESH), then the way back to a fresh board, which starts at its first card
    await page.goto(B + 'Building.dc.html', { waitUntil: 'load' }); await sleep(1100);
    await toNJJoe(page);
    let r = await arrive(page, () => click(page, NJ + ' .featured-cta'), /njjoe\/$/); await sleep(600);
    const hops = [r.kind];
    r = await arrive(page, () => click(page, '.pj-tabs a[href*="microsite"]'), /microsite/); hops.push(r.kind); await sleep(600);
    r = await arrive(page, () => click(page, '.pj-tabs a[href*="apa"]'), /apa/); hops.push(r.kind); await sleep(10500);
    r = await arrive(page, () => click(page, '.pj-back'), /Building/); hops.push(r.kind);
    await sleep(1500);
    let at = await page.evaluate((sel) => { const v = document.querySelector('.cork-viewport').getBoundingClientRect(), s = document.querySelector(sel), b = [s, s.querySelector('.dos-peek')].map((n) => n.getBoundingClientRect()); return { l: Math.min(...b.map((x) => x.left)) - v.left, r: Math.max(...b.map((x) => x.right)) - v.right, pressed: window.__pins.filter((p) => p.id === 'njjoe').length }; }, NJ);
    check(res, T('R1 · NJJoe by its link, two chapter hops and 10 s, then back: every hop a move, the card brought into the cork, its pin pressed after the landing'), hops.join() === 'in,chapter,chapter,out' && at.l >= 0 && at.r <= 0 && at.pressed === 1, Object.assign(at, { hops }));
    // Fred Agent, after a Back to a board left scrolled to its end (from the back/forward cache, with the way back)
    await page.goto(B + 'Building.dc.html', { waitUntil: 'load' }); await sleep(1100);
    await page.focus('.cork-viewport'); await page.keyboard.press('End'); await sleep(1400);
    await reset(page);
    await page.evaluate(() => { location.href = 'building/fred-agent/'; }); await page.waitForURL(/fred-agent/); await sleep(1200);
    r = await arrive(page, () => page.goBack({ waitUntil: 'commit' }), /Building/);
    await sleep(1500);
    at = await page.evaluate((sel) => { const v = document.querySelector('.cork-viewport').getBoundingClientRect(), s = document.querySelector(sel), b = [s, s.querySelector('.dos-peek')].map((n) => n.getBoundingClientRect()); return { persisted: window.__persisted, l: Math.min(...b.map((x) => x.left)) - v.left, r: Math.max(...b.map((x) => x.right)) - v.right, pressed: window.__pins.filter((p) => p.id === 'fred-agent').length }; }, FAS);
    check(res, T('R1 · Fred Agent after a Back to the board left at its end: restored, brought into the cork, the way back, then its pin pressed'), at.persisted && r.vt && r.kind === 'out' && r.ready && at.l >= 0 && at.r <= 0 && at.pressed === 1, Object.assign(at, { kind: r.kind }));

    // the back/forward cache: Back to a board left with its dossier out
    await page.goto(B + 'Building.dc.html', { waitUntil: 'load' }); await sleep(1100);
    await click(page, FAS + ' .swing'); await sleep(1700);
    await reset(page);
    await click(page, '.dos-tabs .dos-tab:nth-child(3)'); await page.waitForURL(/principles/); await sleep(1200);
    r = await arrive(page, () => page.goBack({ waitUntil: 'commit' }), /Building/);
    await sleep(1500);
    at = await page.evaluate(() => ({ persisted: window.__persisted, dossier: !!document.querySelector('.unpin-panel'), layer: !document.querySelector('.unpin-layer').hidden, stale: document.querySelectorAll('.fy-vt-tabs, .fy-vt-card, .fy-vt-sheet, [style*="clip-path"].slot').length }));
    const dup = Object.entries(r.names || {}).filter(([, k]) => k > 1).map(([n]) => n);
    check(res, T('bfcache · Back to a board left with its dossier out: persisted, the dossier closed at once, stale names cleared, ready resolves'), at.persisted && !at.dossier && !at.layer && !at.stale && r.vt && r.kind === 'out' && r.ready && !r.err && r.names && !r.names[SHEET] && r.names[CARD] === 1 && TABS.every((n) => r.names[n] === 1) && !dup.length, Object.assign(at, { kind: r.kind, ready: r.ready, names: r.names }));
    // Back to a board left while it was still moving (under 2 s after a pan): it is set where the card is at once, and
    // its own loop, running on under the held move, swings nothing (the pin's press comes after the landing)
    await page.goto(B + 'Building.dc.html', { waitUntil: 'load' }); await sleep(1100);
    await page.focus('.cork-viewport'); await page.keyboard.press('End'); await sleep(400);
    await reset(page);
    await page.evaluate(() => { location.href = 'building/fred-agent/'; }); await page.waitForURL(/fred-agent/); await sleep(1200);
    await page.evaluate(() => sessionStorage.setItem('vt-freeze', '1'));
    r = await arrive(page, () => page.goBack({ waitUntil: 'commit' }), /Building/);
    await sleep(400);
    const swing = await page.evaluate(() => Math.max(...[...document.querySelectorAll('.cork .slot')].map((s) => { const m = /rotate\((-?[\d.]+)deg\)/.exec(s.querySelector('.swing').style.transform || ''); return m ? Math.abs(parseFloat(m[1]) - parseFloat(getComputedStyle(s).getPropertyValue('--tilt'))) : 0; })));
    await seek(page, Math.max(...r.anims.map((a) => a.dur)));
    const late = await quads(page, TABS.concat(CARD), 'new'), lel = await boxes(page), lgap = Math.max(0, ...Object.keys(lel.els).map((n) => (late[n] ? off(late[n], lel.els[n]) : 99)));
    check(res, T('bfcache · Back to a board left under 2 s after a pan: no slip swings, the last frame within 1 px'), r.kind === 'out' && swing < 0.5 && Object.keys(lel.els).length >= 6 && lgap <= 1, { kind: r.kind, swingDeg: +swing.toFixed(2), px: +lgap.toFixed(2) });
    await page.evaluate(() => document.getAnimations().forEach((a) => { if (a.effect && a.effect.pseudoElement) a.finish(); })); await sleep(900);
    const flower = await page.evaluate(() => document.querySelector('.slot[data-id="fred-agent"]').dataset.flowerCause || null);
    check(res, T('bfcache · … and the flower, back in view with the card\'s pin out, is pressed by its re-pin, not on its return'), flower === 're-pin', flower);
    await page.context().close();
  }

  // the last frames at 360
  {
    const page = await open({ viewport: { width: 360, height: 800 } });
    for (const [name, m] of Object.entries(MOVES).filter(([, m]) => m.part || m.kind === 'chapter')) {
      await begin(page, m);
      await page.evaluate(() => sessionStorage.setItem('vt-freeze', '1'));
      const r = await arrive(page, going(page, m), m.url), end = Math.max(...r.anims.map((a) => a.dur));
      await seek(page, end);
      const now = await quads(page, m.now, 'new'), el = await boxes(page), gap = Math.max(0, ...Object.keys(el.els).map((n) => (now[n] ? off(now[n], el.els[n]) : 99)));
      check(res, '360 ' + name + ': its last frame is the settled page, every group within 1 px of its element', Object.keys(el.els).length >= m.now.length && gap <= 1, { groups: Object.keys(el.els).length, px: +gap.toFixed(2) });
      await page.evaluate(() => document.getAnimations().forEach((a) => { if (a.effect && a.effect.pseudoElement) a.finish(); })); await sleep(600);
    }
    await page.context().close();
  }

  // reduced motion: a hard cut, and no pin hidden or pressed
  {
    const page = await open({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    const seen = [];
    for (const name of ['in · the card\'s own link', 'chapter · later', 'out · the way back', 'NJJoe in · a dossier tab', 'NJJoe out · the way back']) {
      const m = MOVES[name];
      await begin(page, m);
      const r = await arrive(page, going(page, m), m.url);
      await sleep(900);
      const pin = await page.evaluate(() => ({ hidden: window.__pinHidden, pressed: window.__pins.length }));
      seen.push(name + ': ' + (r.vt ? r.kind : 'cut') + (r.fy === null ? '' : ' (fy-vt left)') + (pin.hidden || pin.pressed ? ' · pin hidden or pressed' : ''));
      check(res, 'reduced motion · ' + name + ': no transition, fy-vt consumed, no pin hidden or pressed', r.vt === false && r.fy === null && !pin.hidden && !pin.pressed, seen[seen.length - 1]);
    }
    await page.context().close();
  }

  // no Navigation API (hidden here), a board first loaded from NJJoe, left for About and restored by Back: its referrer
  // is still NJJoe's, and must not bring NJJoe into view again
  {
    const page = await open({ viewport: { width: 1440, height: 900 } });
    await page.context().addInitScript(() => Object.defineProperty(window, 'navigation', { value: undefined, configurable: true }));
    const x = () => page.evaluate(() => new DOMMatrix(getComputedStyle(document.querySelector('.cork-track')).transform).m41);
    await page.goto(B + 'building/njjoe/', { waitUntil: 'load' }); await sleep(600);
    await arrive(page, () => click(page, '.pj-back'), /Building/); await sleep(1400);
    const fresh = await x();
    await page.focus('.cork-viewport'); await page.keyboard.press('Home'); await sleep(1400);
    await click(page, '.site-tab--about'); await page.waitForURL(/About/); await sleep(1400);
    await arrive(page, () => page.goBack({ waitUntil: 'commit' }), /Building/); await sleep(1400);
    const at = { api: await page.evaluate(() => window.navigation === undefined ? 'hidden' : 'there'), fresh: Math.round(fresh), persisted: await page.evaluate(() => window.__persisted), restored: Math.round(await x()) };
    check(res, 'no Navigation API · a board restored by Back ignores its stale referrer: NJJoe came into view fresh, not again', at.api === 'hidden' && at.fresh < -100 && at.persisted && at.restored === 0, at);
    await page.context().close();
  }
  await browser.close();

  // WebKit: every move lands, with its own transitions or a cut; video, since its screenshots are blank mid-move
  if (process.env.WEBKIT !== '0') {
    const wk = await webkit(), dir = SHOTS + '/webkit';
    fs.mkdirSync(dir, { recursive: true });
    for (const [label, o] of [['motion', {}], ['reduced', { reducedMotion: 'reduce' }]]) {
      for (const w of [1440, 390]) {
        const size = { width: w, height: w > 500 ? 900 : 844 }, c = await wk.newContext(Object.assign({ viewport: size }, o, label === 'motion' ? { recordVideo: { dir, size } } : {})), p = await c.newPage();
        p.on('pageerror', (e) => errs.push('webkit pageerror ' + e.message));
        p.on('console', (m) => { if (m.type() === 'error') errs.push('webkit ' + p.url() + ' ' + m.text()); });
        await hook(c, []);
        const seen = [];
        for (const name of ['in · the card\'s own link', 'chapter · later', 'out · the way back', 'in · a dossier tab', 'chapter · earlier', 'project → home', 'NJJoe in · its own link', 'NJJoe chapter · later', 'NJJoe out · the way back']) {
          const m = MOVES[name];
          await begin(p, m);
          await click(p, m.go); await p.waitForURL(m.url, { timeout: 8000 }); await sleep(1400);
          const r = await p.evaluate(() => ({ vt: window.__vt && window.__vt.vt, kind: window.__vt && window.__vt.kind, fin: window.__vt && window.__vt.fin, names: document.querySelectorAll('.fy-vt-tabs, .fy-vt-card, .fy-vt-sheet').length, pin: [...document.querySelectorAll('.board-pin')].every((n) => getComputedStyle(n).visibility === 'visible'), ov: document.documentElement.scrollWidth - innerWidth }));
          seen.push(name + ': ' + (r.vt ? r.kind + (r.fin ? '✓' : '…') : 'cut'));
          check(res, `webkit ${label} ${w} · ${name}: lands${label === 'reduced' ? ' with no transition' : r.vt ? ', kind ' + m.kind : ' (a cut)'}, names gone, every pin in, no overflow`, (label === 'reduced' ? !r.vt : !r.vt || (r.kind === m.kind && r.fin)) && !r.names && r.pin && r.ov <= 0, seen[seen.length - 1]);
        }
        const v = p.video();
        await c.close();
        if (v) { const to = `${dir}/webkit-${w}.webm`; await v.saveAs(to); await v.delete(); ctx.log('video ' + to); }
      }
    }
    await wk.close();
  }

  check(res, 'no console or page errors', errs.length === 0, errs.slice(0, 6));
  const bad = res.filter((x) => !x.ok);
  ctx.log(`vt-project: ${res.length - bad.length}/${res.length} pass`);
  if (bad.length) process.exitCode = 1;
};
