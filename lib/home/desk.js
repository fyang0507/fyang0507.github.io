/* Home · the live desk's small lives:
   - the laptop types "$ make life" while it (or 在造) is hovered; on touch screens it types every 8 s;
   - the portrait blinks now and then, and looks surprised while the camera is hovered;
   - the bird hops about the tabletop on its six-frame strip;
   - book flip, camera click and steam are CSS (home.css).
   The loops wait on events (the desk entering the viewport, the tab becoming visible, reduced motion turning off), so
   nothing runs at rest. The opener and the phone camera take the bird and the portrait over through `held` /
   `frameHeld`. */
const $ = (s, r = document) => r.querySelector(s);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const rm = () => Motion.reduced();

const el = $('#desk');
export const desk = { el, visible: true, frameHeld: false };

// awake(): resolves at once when the desk may move, else when an event makes it so (no polling)
const waiting = [], may = () => desk.visible && !document.hidden && !rm();
const awake = () => (may() ? Promise.resolve() : new Promise((res) => waiting.push(res)));
const wake = () => { if (may()) waiting.splice(0).forEach((res) => res()); };
new IntersectionObserver((es) => { desk.visible = es[0].isIntersecting; wake(); }, { rootMargin: '80px' }).observe(el);
document.addEventListener('visibilitychange', wake);
Motion.onReduced(wake);

// ---- sprite frames ----
const strip = (k) => $('[data-strip="' + k + '"]', el);
const frameImg = strip('frame'), bookImg = strip('book'), birdImg = strip('bird');
desk.setFrame = (i) => frameImg.style.setProperty('--cell', i);   // 0 neutral · 1 blink · 2 smile · 3 surprised
desk.setBook = (i) => bookImg.style.setProperty('--cell', i);

// ---- the laptop ----
const typed = $('.desk-typed', el), TXT = '$ make life\n> building agents…\n> writing essays…';
let typer = 0;
desk.type = () => {
  clearInterval(typer); typed.textContent = '';
  if (rm()) { typed.textContent = TXT; return; }
  let i = 0;
  typer = setInterval(() => { i++; typed.textContent = TXT.slice(0, i); if (i >= TXT.length) clearInterval(typer); }, 70);
};
desk.stopType = () => { clearInterval(typer); typed.textContent = ''; };
[$('.hot-laptop', el), $('.nav-build', el)].forEach((t) => {
  t.addEventListener('mouseenter', desk.type);
  t.addEventListener('mouseleave', desk.stopType);
});
// Touch screens with the desktop layout (a tablet) get the line every 8 s; the phone layout types its own (mobile.js).
if (matchMedia('(hover: none)').matches) setInterval(() => { if (!desk.phone && desk.visible && !rm()) desk.type(); }, 8000);

// ---- the portrait ----
(async function blink() {
  for (;;) {
    await sleep(3200 + Math.random() * 3800);
    await awake();
    if (desk.frameHeld) continue;
    desk.setFrame(1); await sleep(170); if (!desk.frameHeld) desk.setFrame(0);
  }
})();
let surpriseT = 0;
[$('.hot-camera', el), $('.nav-shoot', el)].forEach((t) => t.addEventListener('mouseenter', () => {
  if (desk.frameHeld) return;
  desk.frameHeld = true; desk.setFrame(3);
  clearTimeout(surpriseT);
  surpriseT = setTimeout(() => { desk.frameHeld = false; desk.setFrame(0); }, 900);
}));

// ---- the bird: the same six-frame hop as before (x in desk %, dir 1 = facing right) ----
const birdEl = $('.desk-bird', el);
const bird = desk.bird = { el: birdEl, x: 14, dir: -1, min: 8, max: 24, busy: false, held: false };
bird.setF = (i) => birdImg.style.setProperty('--cell', i);
bird.apply = () => { birdEl.style.left = bird.x + '%'; birdEl.style.transform = bird.dir > 0 ? 'scaleX(-1)' : ''; };
bird.place = (x, dir) => { bird.x = x; bird.dir = dir; bird.apply(); bird.setF(0); };
bird.hop = async (dir, dist = 1.5) => {
  bird.busy = true;
  for (const [f, ms, dx] of [[1, 90, 0], [2, 95, .3], [3, 105, .4], [4, 90, .3], [5, 70, 0], [0, 90, 0]]) {
    bird.setF(f); bird.x += dx * dist * dir; bird.apply();
    await sleep(ms);
  }
  bird.busy = false;
};
(async function idle() {
  await sleep(2000);
  for (;;) {
    await sleep(500 + Math.random() * 1200);
    await awake();
    if (bird.held) continue;
    if (bird.x < bird.min) bird.dir = 1; else if (bird.x > bird.max) bird.dir = -1; else if (Math.random() < .45) bird.dir = -bird.dir;
    bird.apply();
    for (let h = 0, n = 2 + Math.floor(Math.random() * 3); h < n && !bird.held; h++) {
      if ((bird.dir > 0 && bird.x > bird.max + 3) || (bird.dir < 0 && bird.x < bird.min - 3)) break;
      await bird.hop(bird.dir); await sleep(130);
    }
  }
})();

// ---- the pen: hovering a label underlines it (tier 1); keyboard focus is coral 「 」 on every door ----
export function focusMark(host, target, opt) {
  const m = new FocusMark(host, target, opt);
  host.addEventListener('focus', () => m.set(host.matches(':focus-visible')));
  host.addEventListener('blur', () => m.set(false));
  return m;
}
// Under the OP (html.opening, not .ret) the page is covered and inert, so its marks are wired once the main thread is
// idle rather than in front of the OP's first frame (~40 ms on a throttled phone). Otherwise at once.
const covered = document.documentElement.matches('.opening:not(.ret)');
export function withPen(fn) {
  if (!window.Tier || !window.Pen) return;
  if (!covered) fn();
  else if (window.requestIdleCallback) requestIdleCallback(fn, { timeout: 500 });
  else setTimeout(fn, 200);
}
withPen(() => {
  el.querySelectorAll('.navnote').forEach((a) => Tier.wire(a, { target: a.querySelector('.lbl') }));
  el.querySelectorAll('.hot').forEach((a) => focusMark(a, a, { gap: 2, gy: 2 }));
  const id = document.querySelector('.home-head .site-identity');
  focusMark(id, id.querySelector('.site-identity-names'));
});
