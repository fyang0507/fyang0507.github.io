// scripts/verify/reading-contrast.mjs — helper for reading-hero and the cover sweep (not a step file by itself).
import { sleep } from './reading-lib.mjs';
// Every text over the plate, from pixels: a screenshot, then one with only the glyph fill hidden (chips and the paper
// case stay). A text's surround is the pixels touching its glyphs' anti-aliased edges (half a css px at DPR 2); its
// contrast is its colour against the surround's worst pixel (the brightest for light text). Large text (title,
// subtitle) needs 3:1, the labels 4.5:1.
const TEXTS = [['title', '.article-intro .title, .fly .fly-line', 3], ['subtitle', '.article-intro .eyebrow, .fly .fly-eb', 3], ['kicker', '.article-intro .kicker', 4.5],
  ['meta', '.article-intro .meta', 4.5], ['nav', '.rnav .back-arrow, .rnav .back-t, .rnav .btn', 4.5], ['header labels', '#site-nav .site-nav-label', 4.5]];
const HIDE = TEXTS.map((t) => t[1].split(', ').map((s) => s + ',' + s + ' *').join(',')).join(',') + '{color:transparent!important;-webkit-text-fill-color:transparent!important;transition:none!important}';
export async function textContrast(page) {
  const texts = await page.evaluate((TEXTS) => {
    const out = [];
    for (const [kind, sel, min] of TEXTS) document.querySelectorAll(sel).forEach((el) => {
      const r = el.getBoundingClientRect();
      if (getComputedStyle(el).visibility === 'hidden' || r.width < 2 || r.bottom < 0 || r.top > innerHeight) return;
      let op = 1; for (let e = el; e; e = e.parentElement) op *= +getComputedStyle(e).opacity;
      if (op >= .9) out.push({ kind, min, c: getComputedStyle(el.querySelector('.eyebrow') || el).color.match(/[\d.]+/g).map(Number), r: [r.left, r.top, r.right, r.bottom] });
    });
    return out;
  }, TEXTS);
  const a = (await page.screenshot()).toString('base64');
  await page.evaluate((css) => { const s = document.createElement('style'); s.id = 'fy-hide'; s.textContent = css; document.head.appendChild(s); }, HIDE);
  await sleep(60);
  const b = (await page.screenshot()).toString('base64');
  await page.evaluate(() => document.getElementById('fy-hide').remove());
  return page.evaluate(async ({ a, b, texts }) => {
    const load = async (s) => { const im = new Image(); im.src = 'data:image/png;base64,' + s; await im.decode(); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const g = c.getContext('2d'); g.drawImage(im, 0, 0); return g.getImageData(0, 0, c.width, c.height); };
    const IA = await load(a), A = IA.data, B = (await load(b)).data, W = IA.width, H = IA.height, k = W / innerWidth, R = Math.max(1, Math.round(k / 2));
    const lin = (v) => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); };
    const lum = (d, i) => .2126 * lin(d[i]) + .7152 * lin(d[i + 1]) + .0722 * lin(d[i + 2]);
    const diff = (i) => Math.max(Math.abs(A[i] - B[i]), Math.abs(A[i + 1] - B[i + 1]), Math.abs(A[i + 2] - B[i + 2]));
    return texts.map((t) => {
      const T = lum(t.c, 0), x0 = Math.max(0, Math.floor(t.r[0] * k) - R), x1 = Math.min(W, Math.ceil(t.r[2] * k) + R), y0 = Math.max(0, Math.floor(t.r[1] * k) - R), y1 = Math.min(H, Math.ceil(t.r[3] * k) + R);
      const w = x1 - x0, h = y1 - y0, M = new Uint8Array(w * h);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (diff(((y + y0) * W + x + x0) * 4) > 40) M[y * w + x] = 1;
      let worst = null;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const i = ((y + y0) * W + x + x0) * 4;
        if (M[y * w + x] || diff(i) > 8) continue;           // a glyph or its anti-aliased edge
        let near = false;
        for (let dy = -R; dy <= R && !near; dy++) for (let dx = -R; dx <= R; dx++) { const yy = y + dy, xx = x + dx; if (yy >= 0 && yy < h && xx >= 0 && xx < w && M[yy * w + xx]) { near = true; break; } }
        if (!near) continue;
        const L = lum(B, i);
        if (worst === null || (T > .2 ? L > worst : L < worst)) worst = L;
      }
      return worst === null ? null : { kind: t.kind, min: t.min, ratio: +((Math.max(T, worst) + .05) / (Math.min(T, worst) + .05)).toFixed(2) };
    }).filter(Boolean);
  }, { a, b, texts });
}
