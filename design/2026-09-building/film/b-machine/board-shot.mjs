// Renders the storyboard (index.html?board) to b-machine/storyboard.png.
//   node b-machine/board-shot.mjs      (from design/2026-09-building/film, with the worktree served on :4218)
import { chromium } from '/tmp/fyshot/node_modules/playwright-core/index.mjs';
import path from 'path';
import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url));
const exe = process.env.HOME + '/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const browser = await chromium.launch({ executablePath: exe, headless: true, args: ['--use-angle=metal', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
page.on('pageerror', (e) => console.log('pageerror', e.message));
await page.goto((process.env.BASE || 'http://127.0.0.1:4218') + '/design/2026-09-building/film/b-machine/index.html?board', { waitUntil: 'load' });
await page.waitForFunction(() => window.READY === true, null, { timeout: 120000 });
const { w, h } = await page.evaluate(() => window.BOARD);
await page.setViewportSize({ width: w, height: h });
await page.screenshot({ path: path.join(here, 'storyboard.png'), clip: { x: 0, y: 0, width: w, height: h } });
console.log('storyboard', w, h);
await browser.close();
