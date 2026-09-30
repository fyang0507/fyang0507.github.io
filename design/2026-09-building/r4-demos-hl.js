/* design/2026-09-building · round 4 · how the pen points at a region of a capture while its marker or its note is
   noticed (a mouse over it, or keyboard focus on the note). Round 3's rough coral loop crossed the very text it meant
   to show; each of these marks the region's edge instead and leaves its inside alone. Coral only while noticed.
     a · corner marks     the pen's 「 」 (the site's focus mark) at a region's size, at all four corners, 6 px outside
                          it, like crop marks on a print: the token sits on the top-left corner, so a pair alone would lose
                          its 「 under it. Drawn corner by corner as pen-tier.js draws focus, and lifted the same way
     b · thin outline     a 1.5 px rounded rule around the region; it fades in and out, nothing is drawn
     c · smooth stroke    one confident pass round the region's rounded rectangle, overshooting its start a little
   highlight(rg, kind, seed) → { show, hide, rebuild }. A mark is only ever hidden after it was shown: erasing a stroke
   that never drew sweeps it through visible (pen.js erase starts from wherever the dash sits). */
const NS = 'http://www.w3.org/2000/svg';

function layer(rg) {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'hl-svg'); svg.setAttribute('aria-hidden', 'true');
  rg.appendChild(svg);
  return svg;
}
function stroke(svg, d, width, shown) {
  const p = Pen.path(d, { color: 'currentColor', width });
  svg.appendChild(p);
  const L = p.getTotalLength();
  p.style.strokeDasharray = Pen.dashes(p, L);
  p.style.strokeDashoffset = shown ? 0 : Pen.hiddenAt(p, L);
  return p;
}

const KINDS = {
  a(rg, seed) {
    const svg = layer(rg);
    let ps = [];
    return {
      build(shown) {
        const w = rg.offsetWidth, h = rg.offsetHeight, r = Pen.rng(seed + '|brackets'), j = () => (r() - 0.5) * 1.1, g = 6;
        const arm = Math.min(26, Math.max(12, w * 0.18)), vv = Math.min(20, Math.max(10, h * 0.22));
        const x0 = -g, y0 = -g, x1 = w + g, y1 = h + g, f = (n) => n.toFixed(1);
        // each corner is one stroke, arm to corner to arm, going round clockwise: top-left, top-right, bottom-right, bottom-left
        const corner = (x, y, dx, dy) => 'M' + f(x + j()) + ' ' + f(y + dy * vv) + ' L' + f(x) + ' ' + f(y) + ' L' + f(x + dx * arm) + ' ' + f(y + j());
        svg.textContent = '';
        ps = [corner(x0, y0, 1, 1), corner(x1, y0, -1, 1), corner(x1, y1, -1, -1), corner(x0, y1, 1, -1)].map((d) => stroke(svg, d, 2.2, shown));
      },
      show() { ps.forEach((p, i) => Pen.draw(p, { duration: 150, delay: i * 50 })); },
      hide() { ps.forEach((p) => Pen.erase(p, { duration: 120 })); },
    };
  },
  b(rg) {
    const box = document.createElement('i');
    box.className = 'hl-box'; box.setAttribute('aria-hidden', 'true');
    rg.appendChild(box);
    return { build() {}, show() { box.classList.add('on'); }, hide() { box.classList.remove('on'); } };
  },
  c(rg, seed) {
    const svg = layer(rg);
    let p = null;
    return {
      build(shown) {
        const w = rg.offsetWidth, h = rg.offsetHeight, r = Pen.rng(seed + '|stroke'), pad = 7;
        const cx = w / 2, cy = h / 2, rx = w / 2 + pad, ry = h / 2 + pad, e = 2 / 5;   // a superellipse: a rounded rectangle
        const start = Math.PI * (1.08 + r() * 0.06), laps = 1.07, n = 64, pts = [];
        for (let i = 0; i <= n; i++) {
          const a = start + (i / n) * laps * Math.PI * 2, c = Math.cos(a), s = Math.sin(a), wob = 1 + Math.sin(i * 0.37 + r()) * 0.004;
          pts.push([cx + rx * wob * Math.sign(c) * Math.abs(c) ** e, cy + ry * wob * Math.sign(s) * Math.abs(s) ** e]);
        }
        svg.textContent = '';
        p = stroke(svg, Pen.smooth(pts), 1.7, shown);
      },
      show() { Pen.draw(p, { duration: 360 }); },
      hide() { Pen.erase(p, { duration: 180 }); },
    };
  },
};

export function highlight(rg, kind, seed) {
  const k = (KINDS[kind] || KINDS.a)(rg, seed);
  let shown = false;
  k.build(false);
  return {
    show() { if (!shown) { shown = true; k.show(); } },
    hide() { if (shown) { shown = false; k.hide(); } },
    rebuild() { k.build(shown); },
  };
}
