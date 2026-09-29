// Usage: node /tmp/fyshot/run.mjs <steps.mjs>
// steps.mjs must `export default async (page, ctx) => {...}`. ctx = { shot(name), log(...) }.
// Each run launches its own isolated headless Chromium, so parallel agents never share a page.
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'url';
import path from 'path';
const exe = process.env.HOME + '/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const file = path.resolve(process.argv[2]);
const mod = await import(pathToFileURL(file).href);
const browser = await chromium.launch({ executablePath: exe, headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await context.newPage();
const errors = [];
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
page.on('console', m => { if (m.type() === 'error') errors.push('console.error: ' + m.text()); });
page.on('response', r => { if (r.status() >= 400 && !r.url().endsWith('favicon.ico')) errors.push('HTTP ' + r.status() + ' ' + r.url()); });
const ctx = {
  shot: async (p, opts = {}) => { await page.screenshot({ path: p, ...opts }); console.log('saved', p); },
  log: (...a) => console.log(...a),
};
try { await mod.default(page, ctx); } catch (e) { console.log('STEP ERROR:', e.message); }
console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no console/page errors');
await browser.close();
