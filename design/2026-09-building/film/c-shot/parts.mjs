// C's footage: the real pages taken apart into the pieces the shot moves, each with its place on its page.
// Every piece is an element screenshot of main (5c13009) at 2×, alone on a transparent ground, so a piece laid back at
// its box registers with the clean page it was lifted from. Writes c-shot/parts/*.png|jpg and parts/geo.json.
//   node c-shot/parts.mjs        (snapshots served on :4219, see ../README.md)
import { chromium } from '/tmp/fyshot/node_modules/playwright-core/index.mjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, 'parts'); fs.mkdirSync(out, { recursive: true });
const base = (process.env.BASE || 'http://127.0.0.1:4219') + '/main/';
const exe = process.env.HOME + '/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const geo = {};
const browser = await chromium.launch({ executablePath: exe, headless: true });

async function open(url, h = 900) {
  const c = await browser.newContext({ viewport: { width: 1440, height: h }, deviceScaleFactor: 2 });
  await c.addInitScript(() => { try { sessionStorage.setItem('fy-opener', '1'); sessionStorage.setItem('fy-flower-fred-agent', '1'); } catch {} });
  const p = await c.newPage();
  await p.goto(base + url, { waitUntil: 'load' }); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2600);
  return p;
}
const box = (p, sel) => p.$eval(sel, (e) => { const b = e.getBoundingClientRect(); return [b.x, b.y + scrollY, b.width, b.height]; });
// Hide everything but sel (and what sel contains), on a transparent ground, then shoot sel.
// Siblings along the path to the root are hidden and the ancestors' own paint (backgrounds, borders, shadows, pseudo
// elements) switched off; the target's own subtree is untouched, so marks hidden at rest stay hidden.
async function alone(p, sel, name, hideInside = '') {
  const undo = await p.evaluateHandle(({ sel, hideInside }) => {
    const t = document.querySelector(sel), done = [];
    const set = (e, k, v) => { done.push([e, k, e.style.getPropertyValue(k), e.style.getPropertyPriority(k)]); e.style.setProperty(k, v, 'important'); };
    const st = document.createElement('style'); st.textContent = '.fy-anc::before,.fy-anc::after{display:none!important}'; document.head.appendChild(st);
    for (let e = t; e && e !== document.documentElement; e = e.parentElement) {
      for (const s of e.parentElement ? e.parentElement.children : []) if (s !== e && s.tagName !== 'STYLE' && s.tagName !== 'SCRIPT') set(s, 'visibility', 'hidden');
      if (e !== t) { set(e, 'background', 'transparent'); set(e, 'box-shadow', 'none'); set(e, 'border-color', 'transparent'); set(e, 'outline', 'none'); e.classList.add('fy-anc'); }
    }
    set(document.documentElement, 'background', 'transparent'); set(document.body, 'background', 'transparent');
    if (hideInside) for (const h of t.querySelectorAll(hideInside)) set(h, 'visibility', 'hidden');
    return () => { for (const [e, k, v, pr] of done.reverse()) { if (v) e.style.setProperty(k, v, pr); else e.style.removeProperty(k); } document.querySelectorAll('.fy-anc').forEach((e) => e.classList.remove('fy-anc')); st.remove(); };
  }, { sel, hideInside });
  const el = await p.$(sel);
  geo[name] = await box(p, sel);
  await el.screenshot({ path: path.join(out, name + '.png'), omitBackground: true });
  await undo.evaluate((f) => f());
  console.log(name, geo[name].map(Math.round).join(' '));
}
const hide = (p, css) => p.addStyleTag({ content: css + '{visibility:hidden!important}' });

// Building: the clean board (the lead card, its pin and its peeking tabs lifted away; the cork patch and the pin
// hole stay), then the card, its tabs and its pin, each alone.
{
  const p = await open('Building.dc.html', 1100);
  await alone(p, '.slot--lead .swing', 'b-card', '.dos-peek, .lift');
  await alone(p, '.slot--lead .dos-peek', 'b-peek');
  await alone(p, '.slot--lead .board-pin', 'b-pin');
  geo['b-tilt'] = await p.$eval('.slot--lead .swing', (e) => { const m = new DOMMatrix(getComputedStyle(e).transform); return Math.atan2(m.b, m.a) * 180 / Math.PI; });
  await hide(p, '.slot--lead .swing, .slot--lead .swing *, .slot--lead .board-pin, .slot--lead .board-pin *');
  await p.screenshot({ path: path.join(out, 'b-clean.jpg'), type: 'jpeg', quality: 90, clip: { x: 0, y: 0, width: 1440, height: 1100 } });
  await p.close();
}
// The dossier in your hand: its sheet and its five tabs.
{
  const p = await open('Building.dc.html', 900);
  const t = await p.$('.slot--lead .unpin-trigger'); const b = await t.boundingBox();
  await p.mouse.move(b.x + b.width * .45, b.y + b.height * .55); await p.mouse.down(); await p.waitForTimeout(90); await p.mouse.up();
  await p.waitForSelector('.unpin-close'); await p.mouse.move(1430, 890); await p.waitForTimeout(2400);
  await alone(p, '.dos-sheet', 'd-sheet');
  const n = await p.$$eval('.dos-tabs .dos-tab', (a) => a.length);
  for (let i = 1; i <= n; i++) await alone(p, `.dos-tabs .dos-tab:nth-of-type(${i})`, 'd-tab' + i);
  await p.close();
}
// Principles: the page's top without its rail, its current tab or its identity, which the shot draws, tabs and stamps
// back; the pieces, and the rail's own geometry.
{
  const p = await open('building/fred-agent/principles.html', 900);
  await alone(p, '.pj-tabs .dos-tab:nth-of-type(3)', 'p-tab3');
  await alone(p, '.site-identity-art', 'p-seal', '.site-identity-tag');
  geo['p-tag'] = await p.$$eval('.site-identity-tag path', (a) => a.map((e) => e.getAttribute('d')));
  geo['p-art'] = await box(p, '.site-identity-art');
  geo['p-rail'] = await p.evaluate(() => {
    const svg = document.querySelector('.rail-svg'), r = svg.getBoundingClientRect();
    const vb = svg.viewBox && svg.viewBox.baseVal && svg.viewBox.baseVal.width ? [svg.viewBox.baseVal.x, svg.viewBox.baseVal.y, svg.viewBox.baseVal.width, svg.viewBox.baseVal.height] : null;
    const d = (s) => [...svg.querySelectorAll(s)].map((e) => e.getAttribute('d'));
    return { svg: [r.x, r.y + scrollY, r.width, r.height], vb, guide: d('.rail-guide'), ticks: d('.rail-tick'), end: d('.rail-end'),
      labs: [...document.querySelectorAll('.rail-lab')].map((a) => { const b = a.querySelector('.rail-lab-t').getBoundingClientRect(); return [a.textContent.trim().slice(0, 2), b.x, b.y + scrollY, b.width, b.height]; }),
      font: getComputedStyle(document.querySelector('.rail-lab-t')).font, color: getComputedStyle(document.querySelector('.rail-lab-t')).color,
      stroke: getComputedStyle(svg.querySelector('.rail-guide')).stroke, inkStroke: getComputedStyle(svg.querySelector('.rail-ink')).stroke, w: getComputedStyle(svg.querySelector('.rail-guide')).strokeWidth };
  });
  await hide(p, '.rail-col .rail, .rail-col .rail *, .pj-tabs .dos-tab:nth-of-type(3), .pj-tabs .dos-tab:nth-of-type(3) *, .site-identity-art, .site-identity-art *');
  await p.screenshot({ path: path.join(out, 'p-page.jpg'), type: 'jpeg', quality: 90, fullPage: true, clip: { x: 0, y: 0, width: 1440, height: 1600 } });
  await p.close();
}
fs.writeFileSync(path.join(out, 'geo.json'), JSON.stringify(geo));
await browser.close();
