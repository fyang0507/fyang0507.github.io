// C's storyboard of the whole film (about 90 s) and its poster, rendered by the shot's own engine: each panel is a held
// frame of the test (?t=) or the same world with the camera held somewhere else (?cam=) or another chapter laid (?chap=).
//   node c-shot/board.mjs      → c-shot/storyboard.png, c-shot/poster.png
import { chromium } from '/tmp/fyshot/node_modules/playwright-core/index.mjs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const base = 'http://127.0.0.1:4218/design/2026-09-building/film/c-shot/';
const exe = process.env.HOME + '/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const PANELS = [
  ['0:00–0:08', 'The desk at rest, the home page’s own drawing; the camera drifts in, the laptop shows the site', 't=0.3'],
  ['0:08–0:16', 'Into the screen: the Building board, static at first paint, the tabs peeking behind the card', 't=3.9'],
  ['0:16–0:24', 'The pin pops; the card comes out of the screen into your hand', 't=5.4'],
  ['0:24–0:30', 'The dossier slides out from behind it, five chapters and their tabs', 't=7.1'],
  ['0:30–0:36', 'A tab flies to the chapter’s fore-edge; the chapter is laid over the dossier', 't=8.7'],
  ['0:36–0:46', 'Reading’s margin rail, drawn by the pen: graphite, ticks, the wheat loop', 't=11.0'],
  ['0:46–0:54', 'The next tab: the system map, handles → protocols → outcomes, drawn by the pen', 't=9.0&chap=main-system&cam=700,430,215,330,-4,1'],
  ['0:54–1:02', 'The way back (#35): tabs tuck under the card, the pin pressed in, the cork ripples', 't=4.12&cam=540,560,10,250,0,0'],
  ['1:02–1:10', 'Up to the header: the motto written, the two seals stamped', 't=14.95'],
  ['1:10–1:18', 'Through the carved seal: the camera passes into the white cut of 弗', 't=14.95&cam=160,64,215.3,24,0,0'],
  ['1:18–1:30', 'Out to the whole desk; credits: made with Claude Opus 5.5 · round one’s before, Claude Design (Fable 5) + GPT-5.6-sol', 't=0']
];
const browser = await chromium.launch({ executablePath: exe, headless: true, args: ['--use-angle=metal', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const shots = [];
for (const [, , q] of [...PANELS, ['', '', 't=7.0']]) {
  await page.goto(base + 'index.html?' + q + '&px=1');
  await page.waitForFunction(() => window.READY === true, null, { timeout: 60000 });
  await page.waitForTimeout(400);
  shots.push((await page.screenshot({ type: 'jpeg', quality: 92 })).toString('base64'));
}
fs.writeFileSync(path.join(here, 'poster.png'), await (async () => {
  await page.goto(base + 'index.html?t=7.0&px=2'); await page.waitForFunction(() => window.READY === true); await page.waitForTimeout(400);
  return page.screenshot({ type: 'png' });
})());
const cells = PANELS.map(([time, beat], i) => `<figure><img src="data:image/jpeg;base64,${shots[i]}"><figcaption><b>${String(i + 1).padStart(2, '0')} · ${time}</b> ${beat}</figcaption></figure>`).join('');
await page.setViewportSize({ width: 2400, height: 1400 });
await page.setContent(`<html><head><style>
@font-face{font-family:Plex;src:url(${base}../fonts/IBMPlexMono-Regular-latin.woff2)}
@font-face{font-family:Plex;font-weight:500;src:url(${base}../fonts/IBMPlexMono-Medium-latin.woff2)}
@font-face{font-family:Noto;src:url(${base}../../../../fonts/derived/NotoSerifSC-text.woff2)}
body{margin:0;background:#FBF6EC;color:#33302B;font:13px/1.45 Plex,Noto,monospace;padding:36px 40px}
h1{font:500 15px Plex;letter-spacing:.08em;margin:0 0 22px;color:#6D6559}
main{display:grid;grid-template-columns:repeat(4,1fr);gap:26px 22px}
figure{margin:0}img{width:100%;display:block;border:1px solid #CFC1A9}
figcaption{margin-top:8px;color:#6D6559}b{color:#33302B;font-weight:500;display:block}
</style></head><body><h1>C · ONE CONTINUOUS SHOT 一镜到底 · STORYBOARD OF THE FULL FILM (~90 s, no cuts) · panels 01–06 and 09 are frames of the style test</h1><main>${cells}</main></body></html>`);
await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(300);
const h = await page.evaluate(() => document.body.scrollHeight);
await page.setViewportSize({ width: 2400, height: h });
await page.screenshot({ path: path.join(here, 'storyboard.png'), type: 'png' });
console.log('wrote storyboard.png, poster.png');
await browser.close();
