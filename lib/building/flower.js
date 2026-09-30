/* Building · the lead card's 小红花 (boards r3-05 F1 → r4-05). The little red paper flower a teacher
   sticks beside the best work in the class: a coral flower on a cream die-cut, the ink line is the
   scissors, and one petal never took the glue. Cut from a fixed seed, so every visit gets the same one.

   The press is the flower's behaviour, not only its arrival. One motion, three entries into it — the
   lift on the hand's clock (a held frame), the press on the physics clock:
     apply  first view per session: it arrives already in the fingers → pressed on
     pop    from rest: it pops up toward you (one quick rise, one held frame) → pressed back down
     repin  the card lands home: jolted up, pressed down on the pin's impact frame (72 ms)
   Every press: the card gives a hair into the cork (its own scale spring), one small rotational
   settle as the glue takes, and the loose petal is flattened, then lifts again.

   Five causes press it (cues), one 1.4 s cooldown across all of them: first view (once per session,
   sessionStorage fy-flower-<id>; until then the card has no flower) · a fine pointer arriving on the
   card (once per entry) · keyboard focus arriving from outside it · the card coming back into view
   after the board or page took it away (pressed once the board has stopped) · re-pinning. Touch has no
   hover: return and re-pin carry it there. Reduced motion: the flower is simply there. State for
   tests is on the lead slot: data-flower-presses, data-flower-cause. */
const D = Math.PI / 180, COOL = 1400, SEEN = 0.6, GONE = 0.05;
const f = (n) => Math.round(n * 100) / 100;
const P = (p) => f(p[0]) + ' ' + f(p[1]);

/* ---- geometry: a union of five petal circles, cut 1.1 wider for the die-cut ---- */
function closed(pts) {   // closed Catmull-Rom
  const n = pts.length;
  let d = 'M' + P(pts[0]);
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    d += 'C' + P([p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]) + ' ' + P([p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]) + ' ' + P(p2);
  }
  return d + 'Z';
}
function union(cs, N) {   // outline of a union of circles round the origin, sampled by angle
  const pts = [];
  for (let i = 0; i < N; i++) {
    const th = i / N * Math.PI * 2, ux = Math.cos(th), uy = Math.sin(th);
    let best = 1;
    cs.forEach((c) => {
      const along = c.x * ux + c.y * uy, disc = c.r * c.r - (c.x * c.x + c.y * c.y - along * along);
      if (disc >= 0) best = Math.max(best, along + Math.sqrt(disc));
    });
    pts.push([ux * best, uy * best]);
  }
  return pts;
}
function notch(a, b) {   // the outer crossing of two circles
  const dx = b.x - a.x, dy = b.y - a.y, s = Math.hypot(dx, dy), k = (a.r * a.r - b.r * b.r + s * s) / (2 * s), h = Math.sqrt(Math.max(0, a.r * a.r - k * k));
  const mx = a.x + dx * k / s, my = a.y + dy * k / s, p = [mx - dy * h / s, my + dx * h / s], q = [mx + dy * h / s, my - dx * h / s];
  return Math.hypot(p[0], p[1]) > Math.hypot(q[0], q[1]) ? p : q;
}
const far = (p, k) => [p[0] * k, p[1] * k];
const poly = (pts) => 'M' + pts.map(P).join('L') + 'Z';

// The contact shadow of the loose petal, raised about its crease: a point x out from the crease stands
// x·sinθ high, so its shadow slides along the board's light (falling down-left) by a length ∝ x.
const LIFT = 0.7, LIGHT = [-0.54, 0.84], KZ = 0.55;
function shadowOf(angDeg) {
  const a = -angDeg * D, lx = LIGHT[0] * Math.cos(a) - LIGHT[1] * Math.sin(a), ly = LIGHT[0] * Math.sin(a) + LIGHT[1] * Math.cos(a), z = Math.sqrt(1 - LIFT * LIFT) * KZ;
  return [f(LIFT + z * lx), f(z * ly), 0, 1, 0, 0].join(' ');
}

/* The flower's SVG, in a 0…24 box (content centred at 12,12: an SVG element's CSS transform origin is
   measured from the viewBox corner). The art is drawn twice — clipped to the body, and clipped to the
   loose petal, which folds up about its crease under a CSS scaleX on .stk-flap. */
function flowerSVG(uid) {
  const r = Pen.rng('fred-agent-flower'), a0 = -126 + (r() - .5) * 10, petals = [], cuts = [];
  for (let k = 0; k < 5; k++) {
    const a = (a0 + k * 72 + (r() - .5) * 7) * D, d = 5.6 + (r() - .5) * .4, pr = 3.6 + (r() - .5) * .4;
    petals.push({ x: Math.cos(a) * d, y: Math.sin(a) * d, r: pr });
    cuts.push({ x: Math.cos(a) * d, y: Math.sin(a) * d, r: pr + 1.1 });
  }
  const cut = closed(union(cuts, 150)), coral = closed(union(petals, 150));
  const L = 3, A = notch(cuts[L], cuts[L - 1]), B = notch(cuts[L], cuts[L + 1]);   // the bottom petal faces the light
  const art = '<path d="' + cut + '" fill="var(--paper)" stroke="var(--ink)" stroke-width="1.1" stroke-linejoin="round"/><path d="' + coral + '" fill="var(--mark)"/>' +
    '<circle r="2.05" fill="var(--paper)" stroke="var(--ink)" stroke-width="1"/>';
  const M = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
  let nx = B[1] - A[1], ny = -(B[0] - A[0]);
  if (nx * M[0] + ny * M[1] < 0) { nx = -nx; ny = -ny; }                          // the crease's normal, pointing out
  const ang = Math.atan2(ny, nx) / D, reg = poly([A, far(A, 3), far(B, 3), B]);
  const back = '<g transform="rotate(' + f(-ang) + ') translate(' + f(-M[0]) + ' ' + f(-M[1]) + ')"><g clip-path="url(#' + uid + '-f)">';
  return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><g transform="translate(12 12)">' +
    '<defs><clipPath id="' + uid + '-b"><path clip-rule="evenodd" d="M-40 -40H40V40H-40Z' + reg + '"/></clipPath><clipPath id="' + uid + '-f"><path d="' + reg + '"/></clipPath></defs>' +
    '<g clip-path="url(#' + uid + '-b)">' + art + '</g>' +
    '<g transform="translate(' + P(M) + ') rotate(' + f(ang) + ')">' +
    '<g class="stk-shadow" transform="matrix(' + shadowOf(ang) + ')">' + back + '<path d="' + cut + '" fill="rgba(60,50,35,.36)"/></g></g></g>' +
    '<g class="stk-flap">' + back + art + '</g></g></g></g></g></svg>';
}

/* ---- the sticker and its press ---- */
const OUT = 'cubic-bezier(.2,.7,.3,1)', DOWN = 'cubic-bezier(.55,0,.9,.45)', HOLD = 'steps(1, end)';
// ms: rise (0 = appears already lifted) · hold (the held frame) · down (to contact) · lifted pose [dx, dy (×size), turn°, scale]
const KIND = {
  apply: { rise: 0, hold: 92, down: 92, up: [.1, .3, 9, 1.16], flatFirst: true, dv: .12 },
  pop: { rise: 80, hold: 70, down: 60, up: [.06, .2, 6, 1.12], dv: .1 },
  repin: { rise: 0, hold: 30, down: 42, up: [.05, .16, 5, 1.1], dv: .06 }
};
const REST = -8, SCALE = 1.1, DX = .005, DY = -.02;   // stuck on over the t's shoulder, 0.42 × the title × 1.1
const ctx2d = document.createElement('canvas').getContext('2d');
let uid = 0;

function metrics(mark) {   // glyph metrics of the last word inside its inline-block (height = one line box)
  const cs = getComputedStyle(mark), fs = parseFloat(cs.fontSize), lh = mark.offsetHeight;
  ctx2d.font = cs.fontWeight + ' ' + fs + 'px ' + cs.fontFamily;
  const mA = ctx2d.measureText('A'), fA = mA.fontBoundingBoxAscent || fs * 0.98, fD = mA.fontBoundingBoxDescent || fs * 0.26;
  const base = (lh - (fA + fD)) / 2 + fA;
  return { fs, w: mark.offsetWidth, cap: base - (mA.actualBoundingBoxAscent || fs * 0.7) };
}

/* mountFlower(paper, { phys, index, hidden }) → { mark, press(kind), show(), busy() } */
export function mountFlower(paper, o) {
  const h = { mark: paper.querySelector('.wm-mark'), el: null, bw: 0, bh: 0, until: 0 };
  function render() {
    if (h.el) h.el.remove();
    const m = metrics(h.mark), S = Math.max(26, m.fs * 0.42) * SCALE, cx = m.w + m.fs * DX, cy = m.cap + m.fs * DY;
    const el = document.createElement('span');
    el.className = 'stk' + (o.hidden ? ' stk--unapplied' : '');
    el.setAttribute('aria-hidden', 'true');
    el.style.cssText = 'width:' + f(S) + 'px;height:' + f(S) + 'px;left:' + f(cx - S / 2) + 'px;top:' + f(cy - S / 2) + 'px;--rot:' + REST + 'deg';
    el.innerHTML = flowerSVG('fl' + (++uid));
    h.mark.appendChild(el);
    h.el = el; h.S = S; h.bw = h.mark.offsetWidth; h.bh = h.mark.offsetHeight;
  }
  h.show = () => { o.hidden = false; if (h.el) h.el.classList.remove('stk--unapplied'); };
  h.busy = () => performance.now() < h.until;
  h.press = (kind) => {
    const k = KIND[kind], el = h.el;
    h.show();
    if (!el || Motion.reduced()) return false;
    el.getAnimations({ subtree: true }).forEach((a) => a.cancel());
    const S = h.S, c = k.rise + k.hold + k.down, T = c + 270;
    const rest = 'rotate(' + REST + 'deg)', up = 'translate(' + f(-S * k.up[0]) + 'px,' + f(-S * k.up[1]) + 'px) rotate(' + (REST - k.up[2]) + 'deg) scale(' + k.up[3] + ')';
    const air = 'drop-shadow(-3px 7px 3px rgba(60,50,35,.26))', flat = 'drop-shadow(-.5px .8px 0 rgba(60,50,35,.2))';
    const kf = [];
    if (k.rise) kf.push({ transform: rest, filter: flat, offset: 0, easing: OUT });                    // it pops up toward you
    kf.push({ transform: up, filter: air, offset: k.rise / T, easing: HOLD },                            // held in the fingers, one frame
      { transform: up, filter: air, offset: (k.rise + k.hold) / T, easing: DOWN },                       // then down, fast
      { transform: 'rotate(' + (REST + 1.6) + 'deg)', filter: flat, offset: c / T, easing: OUT },        // contact
      { transform: 'rotate(' + (REST - .45) + 'deg)', filter: flat, offset: (c + 120) / T, easing: 'ease-in-out' },   // the glue takes
      { transform: rest, filter: flat, offset: 1 });
    el.animate(kf, { duration: T });
    // The loose petal: flat under the thumb at contact, then up again.
    const f0 = k.flatFirst ? 'scaleX(1)' : 'scaleX(' + LIFT + ')', s0 = k.flatFirst ? 0 : 1, a = Math.max(0, (c - 12) / T);
    const flap = el.querySelector('.stk-flap'), sh = el.querySelector('.stk-shadow');
    flap.animate([{ transform: f0, offset: 0 }, { transform: f0, offset: a }, { transform: 'scaleX(1)', offset: c / T }, { transform: 'scaleX(1)', offset: (c + 50) / T, easing: 'cubic-bezier(.2,.8,.3,1)' },
      { transform: 'scaleX(' + (LIFT - .08) + ')', offset: (c + 180) / T, easing: 'ease-in-out' }, { transform: 'scaleX(' + LIFT + ')', offset: 1 }], { duration: T });
    sh.animate([{ opacity: s0, offset: 0 }, { opacity: s0, offset: a }, { opacity: 0, offset: c / T }, { opacity: 0, offset: (c + 50) / T }, { opacity: 1, offset: (c + 180) / T }, { opacity: 1, offset: 1 }], { duration: T });
    setTimeout(() => o.phys.press(o.index, k.dv), c);   // the card gives into the cork at contact
    h.until = performance.now() + T;
    return true;
  };
  // Re-cut at the new size when the word's box changes (font swap, reflow); nothing plays again.
  new ResizeObserver(() => {
    const w = h.mark.offsetWidth, hh = h.mark.offsetHeight;
    if (w && (w !== h.bw || hh !== h.bh)) render();
  }).observe(h.mark);
  render();
  return h;
}

/* ---- the causes ---- */
// B: { slot (cards.js slot), P (physics), fl (mountFlower) } · key: sessionStorage key
export function flowerCues(B, key) {
  const s = B.slot, host = s.el;
  let last = -1e9, away = false, n = 0;
  // applied: the flower has been pressed on (this view, or earlier this session); nothing else presses it
  // before that — a hover in the 320 ms before the first-view press would otherwise pre-empt it.
  let applied = (() => { try { return sessionStorage.getItem(key) === '1'; } catch (e) { return false; } })(), intro = applied;
  function press(kind, cause) {
    if (Motion.reduced()) { B.fl.show(); return false; }
    const now = performance.now();
    if (kind !== 'apply' && (!applied || now - last < COOL || B.fl.busy())) return false;
    if (!B.fl.press(kind)) return false;
    applied = true; last = now;
    host.dataset.flowerPresses = ++n; host.dataset.flowerCause = cause;
    return true;
  }
  // Wait for the board itself to stop (a fling back ends on the edge spring), then press — not for
  // every slip to stop swinging: the lead is taped and barely swings, and a late press loses its cause.
  function whenStill(fn) {
    const t0 = performance.now();
    (function check() {
      if (B.P.idle() || performance.now() - t0 > 1200) setTimeout(fn, 120);
      else requestAnimationFrame(check);
    })();
  }
  s.swing.addEventListener('pointerenter', (e) => {
    if (e.pointerType !== 'mouse' || e.buttons || host.classList.contains('unpinned')) return;
    press('pop', 'hover');
  });
  host.addEventListener('focusin', (e) => {
    if (host.contains(e.relatedTarget) || !e.target.matches(':focus-visible')) return;
    press('pop', 'focus');
  });
  new IntersectionObserver((en) => {
    const r = en[en.length - 1].intersectionRatio;
    if (!intro) {
      if (r < SEEN) return;
      intro = true;
      if (Motion.reduced()) { B.fl.show(); applied = true; return; }
      setTimeout(() => { if (press('apply', 'first view')) try { sessionStorage.setItem(key, '1'); } catch (e) { /* private mode */ } }, 320);
      return;
    }
    if (r < GONE) { if (!host.classList.contains('unpinned')) away = true; return; }
    // back in view with its pin out (flying home, or on the way back from a project's page): its re-pin presses it
    if (r >= SEEN && away) { away = false; whenStill(() => { if (!host.classList.contains('unpinned')) press('pop', 'return'); }); }
  }, { threshold: [0, GONE, SEEN, 1] }).observe(B.fl.mark);
  return { repin: () => press('repin', 're-pin') };
}
