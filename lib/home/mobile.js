/* Home on a phone (≤760px): one camera over the desk. A horizontal, natively snapped strip of five shots drives a
   continuous translate + scale of the same desk DOM, so the desk is never cut into cards. When the camera settles on
   an object, that object reacts once, on the hand's clock. The finger is the only thing that moves the camera.
   Shot 0 is the whole desk, with its four doors laid exactly over the objects; the opener lands in that framing. */
import { desk, focusMark } from './desk.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const rm = () => Motion.reduced();
const mq = matchMedia('(max-width: 760px)');

// Framings in desk fractions: centre x/y and how much of the drawing's width fills the view.
const SHOTS = [{ cx: .52, cy: .575, vw: .70 }, { cx: .355, cy: .39, vw: .40 }, { cx: .63, cy: .425, vw: .30 }, { cx: .775, cy: .72, vw: .34 }, { cx: .465, cy: .73, vw: .36 }];
// Overview doors: the desktop hotspots' boxes (desk %) and their label side: laptop, portrait, camera, book.
const DOORS = [['.hot-laptop', 'top', 50], ['.hot-frame', 'top', 50], ['.hot-camera', 'bottom', 78], ['.hot-book', 'bottom', 50]];
const LW = 1000, LH = 750;                                 // the layer: .desk at 1000px wide

const track = $('.track'), view = $('.view'), el = desk.el, panels = $$('.panel'), btns = $$('.idx button');
const ovWin = $('.panel[data-i="0"] .win'), doors = $$('.ov-hot');
let W = 0, H = 0, cur = -1, arrived = -1, raf = 0, endT = 0, on = false;
export const phone = { on: () => on, shot0 };

// ---- real facts from the manifests ----
function facts() {
  const H0 = window.FY_HOME, P = window.BUILDING_PROJECTS, nw = (t) => '<span class="nw">' + t + '</span>';
  if (P && P.length) {
    const p = P.slice().sort((a, b) => (b.updated || '').localeCompare(a.updated || '') || (b.sortDate || '').localeCompare(a.sortDate || ''))[0];
    phone.proj = p;
    $('[data-fact="build"]').innerHTML = P.length + ' projects on the board<br>latest <b>' + p.title + '</b> · updated ' + nw(p.updated || p.sortDate);
  }
  if (!H0) return;
  if (H0.photo) $('[data-fact="photo"]').innerHTML = H0.photos + ' frames on the line<br>newest <b>' + H0.photo.loc + '</b> · ' + nw(H0.photo.date);
  if (H0.post) $('[data-fact="post"]').innerHTML = H0.essays + ' essays on the shelf<br>newest <b lang="zh">' + H0.post.titleZh + '</b> ' + H0.post.title + ' · ' + nw(H0.post.date);
}

// ---- the camera ----
function frameOf(a) { const s = W / (a.vw * LW); return { s, tx: W / 2 - a.cx * LW * s, ty: H / 2 - a.cy * LH * s }; }
function place(p) {
  const i = Math.max(0, Math.min(SHOTS.length - 1, Math.floor(p))), j = Math.min(SHOTS.length - 1, i + 1), f = Math.max(0, Math.min(1, p - i));
  const a = SHOTS[i], b = SHOTS[j];
  const c = frameOf({ cx: a.cx + (b.cx - a.cx) * f, cy: a.cy + (b.cy - a.cy) * f, vw: a.vw * Math.pow(b.vw / a.vw, f) });
  el.style.transform = 'translate(' + c.tx.toFixed(1) + 'px,' + c.ty.toFixed(1) + 'px) scale(' + c.s.toFixed(4) + ')';
  ovWin.style.setProperty('--ov', Math.max(0, 1 - p * 3).toFixed(2));   // the overview's labels belong to shot 0 only
}
function shot0() { if (on) { track.scrollLeft = 0; place(0); } }
function layoutDoors() {                                   // overview tap targets sit exactly on the objects in shot 0
  const c = frameOf(SHOTS[0]);
  doors.forEach((d, k) => {
    const hot = $(DOORS[k][0], el).style, pc = (v) => parseFloat(v) / 100;
    d.style.left = (c.tx + pc(hot.left) * LW * c.s) + 'px'; d.style.top = (c.ty + pc(hot.top) * LH * c.s) + 'px';
    d.style.width = (pc(hot.width) * LW * c.s) + 'px'; d.style.height = (pc(hot.height) * LH * c.s) + 'px';
    d.dataset.lbl = DOORS[k][1]; d.style.setProperty('--ax', '-' + DOORS[k][2] + '%');
  });
}
function viewfinder() {                                    // four pencil corners: this is a camera frame, not a crop
  const svg = $('.vf'), w = svg.clientWidth, h = svg.clientHeight, L = 16, r = Pen.rng('vf');
  svg.innerHTML = '';
  [[0, 0, 1, 1], [w, 0, -1, 1], [0, h, 1, -1], [w, h, -1, -1]].forEach((c) => {
    const d = Pen.smooth([[c[0], c[1] + c[3] * L], [c[0] + r() * .8, c[1] + c[3] * (1 + r())], [c[0] + c[2] * L, c[1] + r() * .8]]);
    svg.appendChild(Pen.path(d, { color: 'var(--pencil)', width: 1.4 }));
  });
}
function measure() {
  if (!on) return;
  W = view.clientWidth; H = view.clientHeight;
  layoutDoors(); viewfinder(); place(track.scrollLeft / (track.clientWidth || 1));
}

// ---- the index: the current shot is chosen (the pen's tier 2); hover and focus follow the shared tier rule ----
const tiers = btns.map((b, i) => (window.Tier ? Tier.wire(b, { target: b.querySelector('.t'), chosen: () => i === cur }) : null));
if (window.Tier) {
  [...doors, ...$$('.copy .lbl')].forEach((a) => Tier.wire(a, { target: a.querySelector('span') || a }));
  const fm = focusMark($('.rig'), view, { gap: -14, gy: -14, big: true });   // the strip itself: 「 」 inside the camera's frame
  track.addEventListener('focus', () => fm.set(track.matches(':focus-visible')));
  track.addEventListener('blur', () => fm.set(false));
}
function mark(i) {
  if (i === cur) return;
  const old = cur; cur = i;
  if (old >= 0) btns[old].removeAttribute('aria-current');
  btns[i].setAttribute('aria-current', 'true');
  [old, i].forEach((k) => { if (k >= 0 && tiers[k] && tiers[k].refresh) tiers[k].refresh(); });
  desk.bird.held = i !== 0;                                // the bird hops only while the whole desk is in shot
}

// ---- arrival: the object reacts once when the camera settles on it ----
const typed = $('.desk-typed', el);
let typeTok = 0;
async function typeScreen() {
  const tok = ++typeTok, cmd = 'git log -1 building/', r = Pen.rng('m' + Date.now()), p = phone.proj;
  typed.textContent = '$ ';
  if (!rm()) {
    await sleep(260);
    for (let i = 0; i < cmd.length; i++) {
      if (tok !== typeTok) return;
      typed.textContent += cmd[i];
      let t = 48 + r() * 62; if (cmd[i - 1] === ' ') t += 50 + r() * 90; if (/[-/]/.test(cmd[i])) t += 60;
      await sleep(t);
    }
    await sleep(220);
  } else typed.textContent += cmd;
  if (tok !== typeTok || !p) return;
  typed.innerHTML = '$ ' + cmd + '\n<span class="o"></span>\nupdated ' + (p.updated || p.sortDate) + (p.lifecycle ? ' · ' + p.lifecycle : '') + '\n$ ';
  typed.querySelector('.o').textContent = p.title;
}
async function arrive(i) {
  if (i === arrived || document.documentElement.classList.contains('opening')) return;
  arrived = i;
  if (i === 1) typeScreen();
  if (rm()) return;
  if (i === 2) { desk.frameHeld = true; desk.setFrame(1); await sleep(130); desk.setFrame(3); await sleep(1300); desk.setFrame(1); await sleep(120); desk.setFrame(0); desk.frameHeld = false; }
  if (i === 3) { el.classList.remove('snap'); void el.offsetWidth; el.classList.add('snap'); }
  if (i === 4) { el.classList.remove('flip'); void el.offsetWidth; el.classList.add('flip'); }
}

function onScroll() {
  if (!raf) raf = requestAnimationFrame(() => {
    raf = 0;
    const p = track.scrollLeft / track.clientWidth;
    place(p); mark(Math.round(p));
    if (Math.abs(p - Math.round(p)) > .35) arrived = -1;
  });
  clearTimeout(endT); endT = setTimeout(settled, 140);       // scrollend fallback
}
function settled() { const p = track.scrollLeft / track.clientWidth; if (Math.abs(p - Math.round(p)) < .02) arrive(Math.round(p)); }
function go(i) { i = Math.max(0, Math.min(panels.length - 1, i)); track.scrollTo({ left: i * track.clientWidth, behavior: rm() ? 'auto' : 'smooth' }); }

track.addEventListener('scroll', onScroll, { passive: true });
if ('onscrollend' in window) track.addEventListener('scrollend', settled);
btns.forEach((b) => b.addEventListener('click', () => go(+b.dataset.to)));
track.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') { e.preventDefault(); go(cur + 1); }
  if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur - 1); }
});

// ---- the layout switch: the same DOM, two framings ----
function set() {
  on = mq.matches;
  desk.phone = on;
  const b = desk.bird;
  if (on) {
    b.min = 15; b.max = 26; if (b.x < b.min || b.x > b.max) b.place(18, b.dir);
    measure(); mark(Math.round(track.scrollLeft / (track.clientWidth || 1)));
  } else {
    el.style.transform = ''; b.min = 8; b.max = 24; b.held = false;
    if (b.x > b.max) b.place(14, -1);
  }
}
facts();
mq.addEventListener('change', set);
addEventListener('resize', measure);
set();
