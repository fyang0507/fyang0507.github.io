// project-pages.mjs — the Building sub-sites' chapters as the open dossier (design/2026-09-building, PORT-PLAN §7 and
// §9, PRs 2 and 4).
//   node /tmp/fyshot/run.mjs scripts/verify/project-pages.mjs
//   env: BASE (default http://127.0.0.1:4173/) · PJ_PAGES (comma list, default Fred Agent's five and NJJoe's three)
//        PJ_W (1440,390,360) · PJ_WIDE (768,820,1024,1180; empty skips them)
//        SHOTS (screenshot prefix, default /tmp/fyshot/pj; the shots are named <prefix>-<site>-<page>-<width>.png)
// Every chapter at 768×1024, 820×1180, 1024×768 and 1180×820 (a tablet each way up, where the tabs turn from strip to
// fore-edge): no horizontal overflow, nothing out of its column (below), the strip's tabs inside its row, no errors.
// Every chapter at 1440×900, 390×844 and 360×800:
//   · 0 console or page errors and every request 200; nothing from Google Fonts, no font master (fonts/*.woff2 outside
//     fonts/derived/), no Noto Serif SC text tier, no <base>, nothing from design/;
//   · every request, the email demo's frame included, stays on the site's own origin: nothing from apa.njjoegroup.com
//     or any other host;
//   · no WIP anywhere in the page (text, attributes, classes): only finished sections ship;
//   · the static header is Building.dc.html's, part for part and link for link, bar its status line;
//   · no text gradient, no backdrop-filter, and no CSS animation running once it has loaded (no entrance);
//   · contrast: every visible text ≥ 4.5:1 against its composited background; the pen's hover line and 「 」 ≥ 3:1
//     against the paper they land on, kraft and paper;
//   · no coral at rest (the identity and the cover card's 小红花 are fixed identity);
//   · the current tab pulled out (the fore-edge) or standing taller (the strip), and banded: its band edge ≥ 3:1
//     against kraft, drawn at 2.6 px;
//   · no horizontal overflow; in the strip every tab inside the row, uncovered, none overlapping, the current one named;
//   · nothing on the sheet out of its column: no box past its parent's sides (a bleed, set by a negative side margin,
//     past the sheet's), and no text wider than its own box (a word or a code string that doesn't break), except inside
//     what scrolls sideways;
//   · the fore-edge tabs link where the board's dossier does (content/building-projects.js), in order, each 200;
//   · every link and button reaches 「 」 by keyboard, and the way back comes after the sheet in focus order, as it sits
//     at its foot;
//   · italic text is set in a real Fraunces italic; the Latin faces the first screen sets are preloaded: Fraunces
//     roman and both IBM Plex Mono weights the tabs use (their labels 400, their numbers 500);
// and on a cold load under vt-lcp's Fast 4G: CLS under 0.01, and Demos under 1.5 MB transferred before any scroll.
// Exit code 1 on any failure.
const BASE = process.env.BASE || 'http://127.0.0.1:4173/';
const SHOTS = process.env.SHOTS || '/tmp/fyshot/pj';
const PAGES = (process.env.PJ_PAGES || ['index', 'system', 'principles', 'components', 'demos'].map((p) => 'building/fred-agent/' + p + '.html')
  .concat(['index', 'microsite', 'apa'].map((p) => 'building/njjoe/' + p + '.html')).join(',')).split(',');
const SIZES = [[1440, 900], [390, 844], [360, 800]].filter(([w]) => (process.env.PJ_W || '1440,390,360').split(',').map(Number).includes(w));
const WIDE = [[768, 1024], [820, 1180], [1024, 768], [1180, 820]].filter(([w]) => (process.env.PJ_WIDE ?? '768,820,1024,1180').split(',').map(Number).includes(w));
const shot = (path, w) => `${SHOTS}-${path.split('/').slice(-2).join('-').replace('.html', '')}-${w}.png`;
const CORAL = ['rgb(217, 105, 90)', 'rgb(165, 69, 58)', 'rgb(203, 94, 73)', 'rgb(200, 94, 71)'];
const res = [];
const check = (name, ok, detail) => { res.push({ name, ok: !!ok }); console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  · ' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) : '')); };

// In the page: colours, WCAG ratios, a composited background, and whether an element shows.
const LIB = () => {
  // rgb()/rgba(), and color(srgb r g b / a), which is what color-mix() computes to
  const rgba = (c) => { const v = (c.match(/[\d.]+/g) || []).map(Number), k = /^color\(srgb/.test(c) ? 255 : 1; return [v[0] * k, v[1] * k, v[2] * k, v.length > 3 ? v[3] : 1]; };
  const lum = (v) => { const l = v.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2]; };
  const over = (top, under) => { const a = top[3]; return [0, 1, 2].map((i) => top[i] * a + under[i] * (1 - a)).concat(1); };
  window.__ratio = (a, b) => { const x = lum(a), y = lum(b); return +((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)).toFixed(2); };
  window.__rgba = rgba;
  // the background an element's text sits on: every translucent layer composited down to the first opaque one
  window.__bg = (el) => {
    const layers = [];
    for (let e = el; e; e = e.parentElement) { const c = rgba(getComputedStyle(e).backgroundColor); if (c[3] > 0) { layers.push(c); if (c[3] >= 0.99) break; } }
    let bg = [251, 246, 236, 1];
    for (let i = layers.length - 1; i >= 0; i--) bg = over(layers[i], bg);
    return bg;
  };
  window.__shows = (el) => {
    for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.05 || (cs.clip && cs.clip.startsWith('rect(0'))) return false;
    }
    const r = el.getBoundingClientRect();
    return r.width > 1 && r.height > 1;
  };
  window.__multiply = (a, b) => [0, 1, 2].map((i) => a[i] * b[i] / 255).concat(1);
  // what leaves its column on the sheet: a box past its parent's sides, or text wider than its own box. Positioned
  // parts (the pen's marks, a line's arrows), the card, the rail, what scrolls sideways and its contents are left out;
  // a bleed (a negative side margin) only has to stay on the sheet; a rotated stamp gets 4 px.
  window.__spill = () => {
    const skip = '.pj-cover, .rail-col, .rail, .rail-strip, svg, iframe, video, .sr-only';
    const sheet = document.querySelector('.pj-sheet'), sr = sheet.getBoundingClientRect(), out = [];
    const scrolls = (e) => { for (let a = e.parentElement; a && a !== sheet; a = a.parentElement) if (getComputedStyle(a).overflowX !== 'visible') return true; return false; };
    for (const e of sheet.querySelectorAll('*')) {
      if (e.closest(skip)) continue;
      const cs = getComputedStyle(e);
      if (cs.display === 'none' || cs.visibility === 'hidden' || cs.position === 'absolute' || cs.position === 'fixed' || scrolls(e)) continue;
      const r = e.getBoundingClientRect();
      if (!r.width && !r.height) continue;
      const name = e.tagName.toLowerCase() + (typeof e.className === 'string' && e.className ? '.' + e.className.split(' ')[0] : '') + ' "' + e.textContent.trim().slice(0, 24) + '"';
      if (parseFloat(cs.marginLeft) < 0 || parseFloat(cs.marginRight) < 0) {
        if (r.left < sr.left - 1 || r.right > sr.right + 1) out.push(name + ' off the sheet');
        continue;
      }
      const pr = e.parentElement.getBoundingClientRect(), tol = cs.transform !== 'none' || getComputedStyle(e.parentElement).transform !== 'none' ? 4 : 1;
      if (r.left < pr.left - tol || r.right > pr.right + tol) out.push(name + ' out of its column by ' + Math.round(Math.max(pr.left - r.left, r.right - pr.right)) + ' px');
      const arrows = ['::before', '::after'].some((k) => { const q = getComputedStyle(e, k); return q.content !== 'none' && q.position === 'absolute'; });
      if (!arrows && cs.display !== 'inline' && cs.overflowX === 'visible' && e.clientWidth > 0 && e.scrollWidth > e.clientWidth + 1 && !e.querySelector('svg, img, iframe, video')) out.push(name + ' text wider than its box by ' + (e.scrollWidth - e.clientWidth) + ' px');
    }
    return out;
  };
};

async function open(browser, path, w, h) {
  const context = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const page = await context.newPage(), bad = [], reqs = [];
  page.on('pageerror', (e) => bad.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') bad.push('console.error: ' + m.text()); });
  page.on('request', (r) => reqs.push(r.url()));
  page.on('response', (r) => { if (r.status() >= 400 && !r.url().endsWith('favicon.ico')) bad.push('HTTP ' + r.status() + ' ' + r.url()); });
  await page.goto(BASE + path, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1800);   // the card is clipped on after first paint, the rail arrives, the band settles
  // down the page and back, so every lazy image and the email demo's frame have loaded (and made their requests)
  for (let y = 0, H = await page.evaluate(() => document.documentElement.scrollHeight); y < H; y += h) { await page.evaluate((y) => scrollTo(0, y), y); await page.waitForTimeout(150); }
  await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(900);
  await page.evaluate(LIB);
  return { context, page, bad, reqs };
}

// the header as parts: tag, class, resolved links and names, the words of its leaves; its status line left out
const headerParts = (page) => page.evaluate(() => [...document.querySelectorAll('#site-nav, #site-nav *')].filter((e) => !e.matches('.site-header-status')).map((e) => [e.tagName, e.className.baseVal ?? e.className,
  e.href ? new URL(e.getAttribute('href'), location.href).href : '', e.src ? e.src : '', (e.getAttribute('srcset') || '').split(',').filter(Boolean).map((c) => { const [u, d] = c.trim().split(/\s+/); return new URL(u, location.href).href + ' ' + d; }).join(','), e.getAttribute('aria-label') || '', e.children.length ? '' : e.textContent.trim()].join('|')));

const facts = (page) => page.evaluate(() => {
  const all = [...document.querySelectorAll('body *')], out = {};
  out.base = !!document.querySelector('base');
  out.gradients = all.filter((e) => { const cs = getComputedStyle(e); return (cs.backgroundClip === 'text' || cs.webkitBackgroundClip === 'text') && /gradient/.test(cs.backgroundImage); }).map((e) => e.className);
  out.blur = all.filter((e) => { const cs = getComputedStyle(e); return cs.backdropFilter && cs.backdropFilter !== 'none'; }).map((e) => e.className);
  out.cssAnims = document.getAnimations().filter((a) => typeof CSSAnimation !== 'undefined' && a instanceof CSSAnimation).map((a) => a.animationName + ' on ' + (a.effect.target.className || a.effect.target.tagName));
  // text contrast, per text node
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), low = [];
  let n = 0;
  for (let t = w.nextNode(); t; t = w.nextNode()) {
    const el = t.parentElement;
    if (!t.nodeValue.trim() || !el || el.closest('svg, script, style, noscript, video') || !window.__shows(el)) continue;
    const cs = getComputedStyle(el), fg = window.__rgba(cs.color), bg = window.__bg(el);
    const col = fg[3] < 1 ? [0, 1, 2].map((i) => fg[i] * fg[3] + bg[i] * (1 - fg[3])) : fg;
    let op = 1; for (let e = el; e; e = e.parentElement) op *= +getComputedStyle(e).opacity;
    const eff = op < 1 ? [0, 1, 2].map((i) => col[i] * op + bg[i] * (1 - op)) : col;
    const r = window.__ratio(eff, bg); n++;
    if (r < 4.5) low.push({ t: t.nodeValue.trim().slice(0, 28), r, fs: cs.fontSize, cls: el.className });
  }
  out.texts = n; out.low = low.slice(0, 6); out.lowN = low.length;
  // coral at rest: element colours, and svg strokes and fills that show
  const coral = ['rgb(217, 105, 90)', 'rgb(165, 69, 58)', 'rgb(203, 94, 73)', 'rgb(200, 94, 71)'], hits = [];
  all.forEach((e) => {
    if (e.closest('.site-identity, .stk') || !window.__shows(e)) return;
    const cs = getComputedStyle(e);
    if (e instanceof SVGElement) {
      if (e.tagName === 'svg' || e.tagName === 'g') return;
      const L = e.getTotalLength ? e.getTotalLength() : 1, off = parseFloat(cs.strokeDashoffset) || 0, hidden = cs.strokeDasharray !== 'none' && off >= L;
      if ((coral.includes(cs.stroke) && cs.stroke !== 'none' && !hidden) || coral.includes(cs.fill)) hits.push(e.getAttribute('class') || e.tagName);
      return;
    }
    const props = [cs.color, cs.backgroundColor];
    ['Top', 'Right', 'Bottom', 'Left'].forEach((s) => { if (parseFloat(cs['border' + s + 'Width']) > 0 && cs['border' + s + 'Style'] !== 'none') props.push(cs['border' + s + 'Color']); });
    if (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) props.push(cs.outlineColor);
    if (props.some((c) => coral.includes(c))) hits.push(e.className || e.tagName);
  });
  out.coral = hits;
  out.overflow = document.documentElement.scrollWidth - innerWidth;
  // the tabs: the current one, its band and edge; the strip's row
  const tabs = [...document.querySelectorAll('.pj-tabs .dos-tab')], cur = document.querySelector('.pj-tabs .dos-tab[aria-current="page"]');
  const strip = getComputedStyle(document.querySelector('.pj-tabs')).flexDirection === 'row';
  const kraft = window.__rgba(getComputedStyle(cur).backgroundColor), line = cur.querySelector('.tm-line'), band = cur.querySelector('.tm-band');
  const edge = line && window.__rgba(getComputedStyle(line).stroke);
  out.cur = { n: tabs.indexOf(cur), strip, transform: getComputedStyle(cur).transform, h: cur.offsetHeight, others: tabs.filter((t) => t !== cur).map((t) => t.offsetHeight),
    banded: !!band && getComputedStyle(band).visibility === 'visible' && cur.getAttribute('data-pen-tier') === '2',
    edgeW: line ? parseFloat(getComputedStyle(line).strokeWidth) : 0, edgeRatio: edge ? window.__ratio(window.__multiply(edge, kraft), kraft) : 0,
    named: window.__shows(cur.querySelector('.dt-t')), text: window.__ratio(window.__rgba(getComputedStyle(cur).color), kraft) };
  const row = document.querySelector('.pj-tabs').getBoundingClientRect(), rg = document.createRange();
  out.row = tabs.map((t) => {
    const r = t.getBoundingClientRect(), n = t.querySelector('.dt-n'); rg.selectNodeContents(n); const b = rg.getBoundingClientRect();
    const hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
    return { l: r.left, r: r.right, inside: r.left >= row.left - 0.5 && r.right <= row.right + 0.5 && r.right <= innerWidth, shown: !!hit && t.contains(hit) };
  });
  out.apart = out.row.every((t, i) => !i || t.l >= out.row[i - 1].r - 0.5);
  // the fore-edge against the board's dossier
  const root = new URL('../../', location.href), p = (window.BUILDING_PROJECTS || []).find((x) => x.id === document.querySelector('.pj-cover').dataset.card);
  out.hrefs = tabs.map((t) => t.href);
  out.board = p ? p.chapters.map((c) => new URL(c.href, root).href) : [];
  // faces
  out.italic = !!document.querySelector('.pj-note, .fa-pull');
  out.faces = [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/"/g, '') + ' ' + f.style + ' ' + f.weight);
  out.preloads = [...document.querySelectorAll('link[rel=preload][as=font]')].map((l) => l.href);
  out.plexLocal = [...document.styleSheets].some((s) => { try { return [...s.cssRules].some((r) => r instanceof CSSFontFaceRule && /Plex Mono/.test(r.style.fontFamily) && /fonts\/derived/.test(r.style.getPropertyValue('src'))); } catch (e) { return false; } });
  return out;
});

// The pen on hover: the coral line under a tab's label and under the way back, against the paper it lands on.
async function hoverPen(page) {
  const out = [];
  for (const sel of ['.pj-tabs .dos-tab:not([aria-current])', '.pj-back']) {
    await page.hover(sel); await page.waitForTimeout(700);
    out.push(await page.evaluate((sel) => { const a = document.querySelector(sel), hot = a.querySelector('.tm-hot'); return { sel, stroke: getComputedStyle(hot).stroke, r: window.__ratio(window.__rgba(getComputedStyle(hot).stroke), window.__bg(a)), vis: getComputedStyle(hot).visibility }; }, sel));
  }
  await page.mouse.move(2, 2); await page.waitForTimeout(500);
  return out;
}

// Tab through the page: every link and button shows 「 」, in a pen that reads ≥ 3:1 on its paper.
async function keyboard(page) {
  const stops = [], seen = new Set();
  for (let i = 0; i < 260; i++) {
    await page.keyboard.press('Tab'); await page.waitForTimeout(240);
    const s = await page.evaluate(() => {
      const a = document.activeElement;
      if (!a || a === document.body) return null;
      const key = a.tagName + '|' + (a.getAttribute('href') || a.getAttribute('aria-controls') || '') + '|' + a.textContent.trim().slice(0, 30);
      const marks = [...a.querySelectorAll(':scope > svg.fm path')], drawn = marks.length === 2 && marks.every((p) => getComputedStyle(p).visibility !== 'hidden');
      // the paper under the mark's corner, not the element's own (a 「 」 stands outside most links)
      let pen = 0;
      if (marks[0]) {
        const b = marks[0].getBoundingClientRect(), under = document.elementsFromPoint(b.left + 1, b.top + 1).find((e) => !(e instanceof SVGElement));
        pen = window.__ratio(window.__rgba(getComputedStyle(marks[0]).stroke), window.__bg(under || a));
      }
      // the shared header's focus is site.js's; a mark over an evidence capture lands on a photograph, not a paper
      return { key, link: a.matches('a[href], button') && !a.closest('#site-nav'), drawn, pen, photo: !!a.closest('.fa-evidence-stage') };
    });
    if (!s || seen.has(s.key)) break;
    seen.add(s.key); stops.push(s);
  }
  return stops;
}

// A cold load under vt-lcp's throttling: CLS through load and bytes before any scroll.
async function cold(browser, path, w, h) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage(), cdp = await ctx.newCDPSession(p), rows = new Map();
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 165, downloadThroughput: 9e6 / 8, uploadThroughput: 1.5e6 / 8 });
  if (w < 500) await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  cdp.on('Network.requestWillBeSent', (e) => rows.set(e.requestId, { url: e.request.url, bytes: 0 }));
  cdp.on('Network.loadingFinished', (e) => { const r = rows.get(e.requestId); if (r) r.bytes = e.encodedDataLength; });
  await p.addInitScript(() => { window.__cls = 0; new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (!e.hadRecentInput) window.__cls += e.value; })).observe({ type: 'layout-shift', buffered: true }); });
  await p.goto(BASE + path, { waitUntil: 'load', timeout: 60000 });
  await p.waitForTimeout(4000);
  const cls = await p.evaluate(() => window.__cls);
  await ctx.close();
  const list = [...rows.values()];
  return { cls, bytes: list.reduce((a, r) => a + r.bytes, 0), video: list.filter((r) => /\.mp4/.test(r.url)).length };
}

export default async (page) => {
  const browser = page.context().browser();
  const gw = await open(browser, 'Building.dc.html', 1440, 900), gateway = await headerParts(gw.page);
  await gw.context.close();
  for (const [w, h] of WIDE) {
    for (const path of PAGES) {
      const tag = w + ' ' + path.split('/').slice(-2).join('/');
      const { context, page: p, bad } = await open(browser, path, w, h);
      const f = await p.evaluate(() => {
        const tabs = [...document.querySelectorAll('.pj-tabs .dos-tab')], row = document.querySelector('.pj-tabs').getBoundingClientRect();
        return { overflow: document.documentElement.scrollWidth - innerWidth, spill: window.__spill(), strip: getComputedStyle(document.querySelector('.pj-tabs')).flexDirection === 'row',
          row: tabs.map((t) => { const r = t.getBoundingClientRect(); return r.left >= row.left - 0.5 && r.right <= row.right + 0.5 && r.right <= innerWidth; }) };
      });
      check(tag + ': no horizontal overflow', f.overflow <= 0, f.overflow);
      check(tag + ': nothing on the sheet out of its column', f.spill.length === 0, f.spill.slice(0, 4));
      if (f.strip) check(tag + ': every strip tab inside the row', f.row.every(Boolean), f.row);
      check(tag + ': 0 console or page errors, every request 200', bad.length === 0, bad.slice(0, 4));
      await context.close();
    }
  }
  for (const [w, h] of SIZES) {
    for (const path of PAGES) {
      const tag = w + ' ' + path.split('/').slice(-2).join('/');
      const { context, page: p, bad, reqs } = await open(browser, path, w, h);
      const f = await facts(p), hp = await headerParts(p);
      const off = reqs.filter((u) => /fonts\.googleapis\.com|fonts\.gstatic\.com|\/fonts\/[^/]+\.woff2|NotoSerifSC-text|\/design\//.test(u));
      check(tag + ': no <base>, nothing from Google Fonts, no font master, no text tier, nothing from design/', !f.base && off.length === 0, off.join(', ') || 'none');
      const away = reqs.filter((u) => /^https?:/.test(u) && new URL(u).origin !== new URL(BASE).origin);
      check(tag + ': every request on the site\'s own origin (nothing from apa.njjoegroup.com or elsewhere)', away.length === 0, away.slice(0, 4).join(', ') || 'none');
      const wip = await p.evaluate(() => (document.documentElement.outerHTML.match(/.{0,30}(\bwip\b|work in progress|sticker-forge).{0,30}/gi) || []).slice(0, 3));
      check(tag + ': no WIP in the page', wip.length === 0, wip.join(' … ') || 'none');
      check(tag + ': the static header is the gateway pages\' (bar its status line)', hp.length === gateway.length && hp.every((x, i) => x === gateway[i]), hp.length + ' parts vs ' + gateway.length + (hp.find((x, i) => x !== gateway[i]) ? ' · first difference: ' + hp.find((x, i) => x !== gateway[i]) : ''));
      check(tag + ': no text gradient, no backdrop-filter, no CSS animation once loaded', !f.gradients.length && !f.blur.length && !f.cssAnims.length, { gradients: f.gradients, blur: f.blur, anims: f.cssAnims });
      check(tag + ': every visible text ≥ 4.5:1 on its background (' + f.texts + ' texts)', f.lowN === 0, f.low);
      check(tag + ': no coral at rest', f.coral.length === 0, f.coral.slice(0, 5).join(', ') || 'none');
      const c = f.cur;
      check(tag + ': the current tab is ' + (c.strip ? 'taller in the strip' : 'pulled out') + ', banded, its edge ≥ 3:1 on kraft at 2.6 px, its text ≥ 4.5:1',
        (c.strip ? c.others.every((x) => c.h > x) : /matrix\(1, 0, 0, 1, 10, 0\)/.test(c.transform)) && c.banded && c.edgeRatio >= 3 && Math.abs(c.edgeW - 2.6) < 0.01 && c.text >= 4.5 && c.named, c);
      check(tag + ': no horizontal overflow', f.overflow <= 0, f.overflow);
      const sp = await p.evaluate(() => window.__spill());
      check(tag + ': nothing on the sheet out of its column', sp.length === 0, sp.slice(0, 4));
      if (c.strip) check(tag + ': every strip tab inside the row, uncovered, apart', f.row.every((t) => t.inside && t.shown) && f.apart, f.row);
      check(tag + ': the fore-edge links where the board\'s dossier does, in order', f.hrefs.length === f.board.length && f.hrefs.every((u, i) => u === f.board[i]), f.hrefs.map((u) => u.split('/').pop() || './'));
      const st = await p.evaluate(async (hs) => Promise.all(hs.map((u) => fetch(u).then((r) => r.status, () => 0))), f.hrefs);
      check(tag + ': every tab\'s page returns 200', st.every((s) => s === 200), st);
      if (f.italic) check(tag + ': italic text in a real Fraunces italic', f.faces.some((x) => /^Fraunces italic/.test(x)), f.faces.filter((x) => /Fraunces/.test(x)));
      const want = ['Fraunces-latin.woff2', 'IBMPlexMono-Regular-latin.woff2', 'IBMPlexMono-Medium-latin.woff2'];
      check(tag + ': Fraunces and the tabs\' Plex Mono are self-hosted, their latin files preloaded', f.plexLocal && want.every((n) => f.preloads.some((u) => u.endsWith('/fonts/derived/' + n))), f.preloads.map((u) => u.split('/').pop()));
      if (w === 1440 || w === 390) {
        const hov = await hoverPen(p);
        check(tag + ': the pen\'s hover line ≥ 3:1 on kraft and on paper', hov.every((x) => x.r >= 3 && x.vis === 'visible'), hov);
        const ks = await keyboard(p), links = ks.filter((s) => s.link), missing = links.filter((s) => !s.drawn), weak = ks.filter((s) => s.drawn && !s.photo && s.pen < 3);
        check(tag + ': every link and button on the page reaches 「 」 by keyboard (' + links.length + ')', links.length > 5 && missing.length === 0, missing.slice(0, 4).map((s) => s.key));
        check(tag + ': every 「 」 ≥ 3:1 on its paper', weak.length === 0, weak.slice(0, 3).map((s) => s.key + ' ' + s.pen));
        // Focus follows the DOM here (no positive tabindex), and the walk above stops in Demos' <video> controls.
        const order = await p.evaluate(() => { const b = document.querySelector('.pj-back'), s = document.querySelector('.pj-sheet'); return { afterSheet: !!(s.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) && !s.contains(b), positiveTabindex: [...document.querySelectorAll('[tabindex]')].filter((e) => e.tabIndex > 0).length }; });
        check(tag + ': the way back comes after the sheet in focus order, as it sits at its foot', order.afterSheet && order.positiveTabindex === 0, order);
        await p.evaluate(() => scrollTo(0, 0));
        await p.screenshot({ path: shot(path, w) });
      }
      check(tag + ': 0 console or page errors, every request 200', bad.length === 0, bad.slice(0, 4));
      await context.close();
      if (w !== 360) {
        const k = await cold(browser, path, w, h), demos = /demos\.html/.test(path);
        check(tag + ': CLS under 0.01 on a cold load', k.cls < 0.01, k.cls.toFixed(4));
        if (demos) check(tag + ': Demos under 1.5 MB before any scroll, the recording not fetched', k.bytes < 1.5 * 1048576 && k.video === 0, (k.bytes / 1048576).toFixed(2) + ' MB');
        else console.log('     ' + tag + ': ' + (k.bytes / 1048576).toFixed(2) + ' MB before any scroll');
      }
    }
  }
  const failed = res.filter((r) => !r.ok);
  console.log(failed.length ? `\n${failed.length} FAILED of ${res.length}` : `\nALL PASSED (${res.length})`);
  if (failed.length) process.exitCode = 1;
};
