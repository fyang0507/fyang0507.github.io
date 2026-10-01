/* v1.5/end.js — the promo's last sheet: 继续写，继续造 written with the header lockup's own strokes and the two seals
   stamped, exactly as v1 does it (../v1/end.js), then the two credits, now set in the site's own register for facts.
   v1.4's credits were big, centred, semibold, and competed with the seals. Here they sit in a column under the
   lockup, left-aligned, regular weight, the Chinese in ink and the English in --soft, at the smallest size that still
   reads on a phone (at 390 px wide: the Chinese about 9.4 px, the English about 7.6 px).
   Three treatments, compared in endcard/index.html; ENDCARD is the one the film renders, ?end= overrides it:
     fields   About's specimen card: ruled rows, an ink rule over the first, hairlines between
     stamps   the dossier's stamped facts: each credit in a thin stamped box, the first in ink and tipped   (Fred's pick)
     entries  the dossier's ruled entries: a line down each credit's left, the English in Fraunces
   The words and their order are unchanged; long lines break at a natural point to fit the column. The last line
   lands at 4.67 s, and the promo holds the card 2.73 s after that (edl.js: end, d 7.4). */
import { endCard as V1 } from '../v1/end.js';
const F = window.FILM;
export const ENDCARD = 'stamps';   // Fred's pick from endcard/index.html
const NAME = new URLSearchParams(location.search).get('end') || ENDCARD;
// each credit: its Chinese, then its English, each as the break sets to try, widest first
export const CREDITS = [
  [[['在 Claude Design (Fable 5) + GPT-5.6-sol 完成的基线上改进'], ['在 Claude Design (Fable 5) + GPT-5.6-sol', '完成的基线上改进'], ['在 Claude Design (Fable 5)', '+ GPT-5.6-sol 完成的基线上改进']],
   [['Improved from the baseline built with Claude Design (Fable 5) + GPT-5.6-sol'], ['Improved from the baseline built with', 'Claude Design (Fable 5) + GPT-5.6-sol'], ['Improved from the baseline', 'built with Claude Design (Fable 5)', '+ GPT-5.6-sol']]],
  [[['用 Claude Opus 5.5 制作']], [['Made with Claude Opus 5.5']]]
];
export const PEN0 = 1.55, PEN1 = 2.65, STAMP = [3.3, 3.62], LINE0 = 4.15, LINE = 0.42, WRITE = 0.1;   // v1's
export const LANDED = LINE0 + (CREDITS.length - 1) * LINE + WRITE;
const INK = '#33302B', SOFT = '#6D6559', RULE = '#CFC1A9';
const ZH = (px) => `400 ${px}px "Noto Serif SC"`, MONO = (px) => `400 ${px}px "IBM Plex Mono"`, FRAUNCES = (px) => `400 ${px}px Fraunces`;
const X0 = 260, X1 = 1140, Y0 = 500;   // the column under the lockup, centred on it (canvas px; the lockup spans x 330–1070, y 150–449)
const ZS = 46, ES = 37, ZL = 58, EL = 45;

function fit(x, sets, font, w) { x.font = font; return sets.find((s) => s.every((l) => x.measureText(l).width <= w)) || sets[sets.length - 1]; }
function lines(x, ls, font, color, at, y, lead) { x.font = font; x.fillStyle = color; ls.forEach((l, k) => x.fillText(l, at, y + k * lead)); return y + (ls.length - 1) * lead; }

const T = {
  // About's specimen card: ruled field rows across the column
  fields(x, on) {
    let y = Y0;
    CREDITS.forEach(([zh, en], i) => {
      if (!on[i]) return;
      x.fillStyle = i ? RULE : INK; x.fillRect(X0, y, X1 - X0, i ? 2 : 3);
      const z = fit(x, zh, ZH(ZS), X1 - X0), e = fit(x, en, MONO(ES), X1 - X0);
      let b = lines(x, z, ZH(ZS), INK, X0, y + 18 + ZS * .88, ZL);
      b = lines(x, e, MONO(ES), SOFT, X0, b + 14 + ES, EL);
      y = b + 24;
      if (i === CREDITS.length - 1) { x.fillStyle = RULE; x.fillRect(X0, y, X1 - X0, 2); }
    });
  },
  // the dossier's stamped facts: a thin box round each credit, the first in ink and tipped, the next in --soft
  stamps(x, on) {
    let y = Y0;
    CREDITS.forEach(([zh, en], i) => {
      if (!on[i]) return;
      const col = i ? SOFT : INK, pad = 22, z = fit(x, zh, ZH(ZS), X1 - X0 - 2 * pad), e = fit(x, en, MONO(ES), X1 - X0 - 2 * pad);
      x.font = ZH(ZS); let w = Math.max(...z.map((l) => x.measureText(l).width));
      x.font = MONO(ES); w = Math.max(w, ...e.map((l) => x.measureText(l).width));
      const h = 16 + ZS + (z.length - 1) * ZL + 14 + ES * 1.1 + (e.length - 1) * EL + 18;
      x.save(); x.translate(X0, y); if (!i) x.rotate(-1.2 * Math.PI / 180);
      x.strokeStyle = col; x.lineWidth = 2.4; x.beginPath(); x.roundRect(0, 0, w + 2 * pad, h, 6); x.stroke();
      const b = lines(x, z, ZH(ZS), col, pad, 16 + ZS * .88, ZL);
      lines(x, e, MONO(ES), col, pad, b + 14 + ES, EL);
      x.restore(); y += h + 26;
    });
  },
  // the dossier's ruled entries: a line of ink down each credit's left, the English in Fraunces
  entries(x, on) {
    let y = Y0 + 6;
    CREDITS.forEach(([zh, en], i) => {
      if (!on[i]) return;
      const at = X0 + 30, z = fit(x, zh, ZH(ZS), X1 - at), e = fit(x, en, FRAUNCES(ES + 3), X1 - at);
      let b = lines(x, z, ZH(ZS), INK, at, y + ZS * .88, ZL);
      b = lines(x, e, FRAUNCES(ES + 3), SOFT, at, b + 14 + ES, EL + 2);
      x.fillStyle = i ? RULE : INK; x.fillRect(X0, y - 6, 3, b - y + 22);
      y = b + 52;
    });
  }
};

let L = null;
export const endCard = {
  name: NAME,
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
    F.strokes(x, L.tag, F.clamp((u - PEN0) / (PEN1 - PEN0)), { w: 3.0 / k, color: INK, gap: 3 });
    [[33, 34], [97, 44]].forEach((cc, i) => {
      const a = u - STAMP[i]; if (a < 0) return; const s = a < 2 / 60 ? 1.035 : 1;
      x.save(); x.translate(cc[0], cc[1]); x.scale(s, s); x.translate(-cc[0], -cc[1]); x.drawImage(L.seals[i], 0, 0, 168, 68); x.restore();
    });
    x.restore();
    const on = CREDITS.map((_, i) => F.held(F.seg(u, LINE0 + i * LINE, LINE0 + i * LINE + WRITE)) > 0);
    x.save(); x.textBaseline = 'alphabetic'; x.textAlign = 'left'; (T[NAME] || T[ENDCARD])(x, on); x.restore();
    tex.needsUpdate = true;
  }
};
