/* v1.4/end.js — the promo's last sheet: v1's (../v1/end.js), with the baseline credited. 继续写，继续造 is written with
   the header lockup's own strokes and the two seals are stamped exactly as v1 does it (same strokes, same times, same
   place). Under them, two credit lines instead of one: the baseline this redesign improved on, then who made it,
   with the model names as the long film's credit gives them. The credits are set to read on a phone: at 390 px wide
   the Chinese is about 10.5 px and the English about 8.5 px, the English in Fraunces, and each long line broken at its
   natural point. The last line lands at 4.67 s; the promo holds the card 2.9 s after that (edl.js: end, d 7.6). */
import { endCard as V1 } from '../v1/end.js';
const F = window.FILM;
// each credit: its Chinese lines, then its English lines (the words unchanged, only broken)
export const CREDITS = [
  [['在 Claude Design (Fable 5) + GPT-5.6-sol', '完成的基线上改进'], ['Improved from the baseline built with', 'Claude Design (Fable 5) + GPT-5.6-sol']],
  [['用 Claude Opus 5.5 制作'], ['Made with Claude Opus 5.5']]
];
export const PEN0 = 1.55, PEN1 = 2.65, STAMP = [3.3, 3.62], LINE0 = 4.15, LINE = 0.42, WRITE = 0.1;   // v1's
export const LANDED = LINE0 + (CREDITS.length - 1) * LINE + WRITE;
let L = null;
export const endCard = {
  async load() { L = await V1.load(); return L; },
  cues(t0) {
    const c = [{ t: t0, type: 'pull', dur: 1.4 }];
    const lens = L.tag.map(F.len), tot = lens.reduce((a, b) => a + b + 3, 0); let at = 0;
    L.tag.forEach((d, i) => { c.push({ t: t0 + PEN0 + at / tot * (PEN1 - PEN0), type: 'stroke', dur: lens[i] / tot * (PEN1 - PEN0) }); at += lens[i] + 3; });
    c.push({ t: t0 + STAMP[0], type: 'stamp', k: 1 }, { t: t0 + STAMP[1], type: 'stamp', k: .6 });
    CREDITS.forEach((_, i) => c.push({ t: t0 + LINE0 + i * LINE, type: 'line' }));
    c.push({ t: t0 + LANDED, type: 'landed' });
    return c;
  },
  draw(tex, u) {
    const c = tex.userData.canvas, x = c.getContext('2d'), key = Math.floor(u * 60);
    if (tex.userData.key === key) return; tex.userData.key = key;
    x.clearRect(0, 0, c.width, c.height);
    if (u < 1.2 || !L) { tex.needsUpdate = true; return; }
    // the motto and the seals: v1's, stroke for stroke
    const k = 4.4, ox = 700 - 84 * k, oy = 150;
    x.save(); x.translate(ox, oy); x.scale(k, k);
    F.strokes(x, L.tag, F.clamp((u - PEN0) / (PEN1 - PEN0)), { w: 3.0 / k, color: '#33302B', gap: 3 });
    [[33, 34], [97, 44]].forEach((cc, i) => {
      const a = u - STAMP[i]; if (a < 0) return; const s = a < 2 / 60 ? 1.035 : 1;
      x.save(); x.translate(cc[0], cc[1]); x.scale(s, s); x.translate(-cc[0], -cc[1]); x.drawImage(L.seals[i], 0, 0, 168, 68); x.restore();
    });
    x.restore();
    // the credits, a credit at a time (canvas px: about 1.02 frame px at the card's framing, 0.2 of that on a phone)
    const ZH = 52, EN = 42, ZL = 66, EL = 52;
    let y = 575;
    CREDITS.forEach(([zh, en], i) => {
      const p = F.held(F.seg(u, LINE0 + i * LINE, LINE0 + i * LINE + WRITE));
      const ey = y + (zh.length - 1) * ZL + 62;
      if (p > 0) {
        zh.forEach((l, k) => F.text(x, l, 700, y + k * ZL, `500 ${ZH}px "Noto Serif SC", Fraunces`, '#33302B', { align: 'center' }));
        en.forEach((l, k) => F.text(x, l, 700, ey + k * EL, `500 ${EN}px Fraunces`, '#33302B', { align: 'center' }));
      }
      y = ey + (en.length - 1) * EL + 88;
    });
    tex.needsUpdate = true;
  }
};
