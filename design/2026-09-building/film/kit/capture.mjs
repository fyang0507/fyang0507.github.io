// Stills of the real site, the footage the films print, pin and fold. Before is round one as it merged
// (5983c8b, #17); after is main (5c13009, #34); r0 is the site before round one (6237120).
// Serve the three snapshots side by side on :4219 (see ../README.md), then:
//   node kit/capture.mjs            (from design/2026-09-building/film, with /tmp/fyshot's playwright-core)
import { chromium } from '/tmp/fyshot/node_modules/playwright-core/index.mjs';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, '..', 'captures');
const base = process.env.BASE || 'http://127.0.0.1:4219';
const exe = process.env.HOME + '/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const only = process.argv.slice(2);

const settle = async (page, ms = 2600) => { await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(ms); };
const shots = [
  // name, snapshot, page, viewport, what to do before the shot
  ['r0-home', 'r0', 'index.html', [1440, 900]],
  ['r0-building', 'r0', 'Building.dc.html', [1440, 900]],
  ['r1-home', 'r1', 'index.html', [1440, 900]],
  ['r1-building', 'r1', 'Building.dc.html', [1440, 900]],
  ['r1-principles', 'r1', 'building/fred-agent/principles.html', [1440, 900]],
  ['r1-system', 'r1', 'building/fred-agent/system.html', [1440, 900]],
  ['r1-writing', 'r1', 'Writing.dc.html', [1440, 900]],
  ['main-home', 'main', 'index.html', [1440, 900]],
  ['main-building', 'main', 'Building.dc.html', [1440, 900]],
  ['main-dossier', 'main', 'Building.dc.html', [1440, 900], async (page) => {
    const t = await page.$('.slot--lead .unpin-trigger'); const b = await t.boundingBox();
    await page.mouse.move(b.x + b.width * .45, b.y + b.height * .55); await page.mouse.down(); await page.waitForTimeout(90); await page.mouse.up();
    await page.waitForSelector('.unpin-close'); await page.mouse.move(1400, 880); await page.waitForTimeout(2200);
  }],
  ['main-principles', 'main', 'building/fred-agent/principles.html', [1440, 900]],
  ['main-principles-read', 'main', 'building/fred-agent/principles.html', [1440, 900], async (page) => {
    const y = await page.evaluate(() => Math.round(document.getElementById('capture').getBoundingClientRect().top + scrollY));
    await page.mouse.move(1180, 640); await page.mouse.wheel(0, y - 140); await page.waitForTimeout(2400);
  }],
  ['main-system', 'main', 'building/fred-agent/system.html', [1440, 900]],
  ['main-overview', 'main', 'building/fred-agent/index.html', [1440, 900]],
  ['main-writing', 'main', 'Writing.dc.html', [1440, 900]],
  ['main-njjoe', 'main', 'building/njjoe/index.html', [1440, 900]],
];

const browser = await chromium.launch({ executablePath: exe, headless: true });
for (const [name, snap, url, [w, h], act] of shots) {
  if (only.length && !only.some((o) => name.startsWith(o))) continue;
  const context = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  await context.addInitScript(() => { try { sessionStorage.setItem('fy-opener', '1'); sessionStorage.setItem('fy-flower-fred-agent', '1'); } catch {} });
  const page = await context.newPage();
  await page.goto(`${base}/${snap}/${url}`, { waitUntil: 'load' });
  await settle(page);
  if (act) await act(page);
  await page.screenshot({ path: path.join(out, name + '.jpg'), type: 'jpeg', quality: 86 });
  console.log('saved', name);
  await context.close();
}
await browser.close();
