/* design/2026-09-building · the board's unpin, from lib/building/unpin.js (production, unchanged mechanics: the pin pops
   on held frames, the paper leaves the pendulum set with its live angle and spin, is carried to the centre on a
   spring while it straightens; home on a quintic path; the pin is pushed in, the cork ripples).
   What this copy adds is what happens once the card is in your hand, as hooks, so each candidate can change the
   preview step and nothing else:
     o.scale  { lead, featured, instrument, standard } in-hand scale (the slips come closer when there is more to read)
     o.panel(project, kind, slot) → HTML of the sheet under the card, or null for none (A turns the card over instead)
     o.arrive(st)   the card has arrived in hand (default: the field note hinges open under it)
     o.depart(st)   before it goes home; returns ms to wait (A turns it face up first)
   and, for the way back from a project page: repin(i), the pin pushed in with its ticks and the ripple, and
   current(), what is in hand (00-vt.js names it at pageswap). */
import { esc, github, geometry } from '../../lib/building/cards.js';

var SCALE = { lead: 1, featured: 1.04, instrument: 1.1, standard: 1.22 };
var WAKE = { ampDeg: 6, speed: 1.8, reach: 320 };
var PRESS = { ampDeg: 9, speed: 2.2, reach: 600 };

export function Unpin(cork, phys, opt) {
  opt = opt || {};
  var slots = cork.slots, sc = Object.assign({}, SCALE, opt.scale || {});
  var reduced = function () { return Motion.reduced(); };
  var layer = document.createElement('div');
  layer.className = 'unpin-layer';
  layer.hidden = true;
  layer.innerHTML = '<div class="unpin-scrim"></div>';
  document.body.appendChild(layer);
  var scrim = layer.firstChild, st = null;

  var tick = function (a, r0, r1) { var c = Math.cos(a), s = Math.sin(a); return 'M' + (c * r0).toFixed(1) + ' ' + (s * r0).toFixed(1) + ' L' + (c * r1).toFixed(1) + ' ' + (s * r1).toFixed(1); };
  var ticksSVG = function (cls, angles, r0, r1) {
    return '<svg class="pin-ticks ' + cls + '" viewBox="-26 -26 52 52" aria-hidden="true">' +
      '<g class="tk-a">' + angles.map(function (a) { return '<path d="' + tick(a, r0, r1) + '"/>'; }).join('') + '</g>' +
      '<g class="tk-b">' + angles.map(function (a, i) { return '<path d="' + tick(a + (i - 1) * .06, r1 - 1, r1 + 5.5 - i) + '"/>'; }).join('') + '</g></svg>';
  };
  slots.forEach(function (s, i) {
    s.el.insertAdjacentHTML('beforeend', ticksSVG('pin-ticks--pop', [-2.45, -1.62, -0.72], 11, 15.5) + ticksSVG('pin-ticks--press', [-2.9, -2.2, -0.95, -0.25], 12, 16));
    if (!s.trigger) return;
    s.trigger.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); if (st && st.i === i) close(); else open(i); });
    s.swing.addEventListener('click', function (e) { if (!e.target.closest('a,button')) open(i); });
  });

  function hostBox() { return { x: 0, y: 0, w: document.documentElement.clientWidth, h: innerHeight }; }
  function home() { var p = phys.pinPoint(st.i), hb = hostBox(); return { x: p.x - hb.x, y: p.y - hb.y }; }
  var basePin = function (g) { return 'translateX(-50%) rotate(' + (g.pinTilt + g.tilt).toFixed(2) + 'deg)'; };

  // the production field note, for any card a candidate leaves alone
  function noteHTML(p, kind) {
    var slip = kind === 'instrument' || kind === 'standard', href = p.href ? p.href : null;
    return '<div class="unpin-panel-paper">' +
      '<div class="unpin-kicker"><span>field note · ' + String(p.order).padStart(2, '0') + '</span>' + closeBtn(p) + '</div>' +
      '<h3 class="unpin-title' + (slip ? '' : ' sr-only') + '" id="unpin-title">' + esc(p.title) + '</h3>' +
      (slip ? '<p class="unpin-note">' + esc(p.note) + '</p><div class="project-meta"><span>' + esc(p.lifecycle) + '</span><span>' + esc(p.period) + '</span><span>updated ' + esc(p.updated) + '</span></div>' : '') +
      '<div class="unpin-actions">' + (href ? '<a class="unpin-cta" href="' + esc(href) + '"><span class="pen-t">Enter the field notes</span> →</a>' : '') +
      (p.repo ? '<a class="github-link" href="' + esc(p.repo) + '" target="_blank" rel="noopener noreferrer">' + github + '<span class="pen-t">Open repository ↗</span></a>' : '') +
      '</div></div>';
  }
  function closeBtn(p) { return '<button class="unpin-close" type="button" aria-label="Pin ' + esc(p.title) + ' back on the board"><span class="pen-t">pin it back · <span lang="zh">钉回去</span></span> <span aria-hidden="true">×</span></button>'; }

  function layout() {
    var hb = hostBox(), w = st.w, h = st.h;
    var S = Math.min(sc[st.s.kind], (hb.w - 32) / w);
    var pw = st.panel ? Math.min(w * S >= 300 ? w * S : 360, hb.w - 32) : 0;
    if (st.panel) st.panel.style.width = pw + 'px';
    var ph = st.panel ? st.panel.offsetHeight : 0;
    S = Math.max(0.55, Math.min(S, (hb.h - 40 - ph) / h));
    var top0 = Math.max(16, (hb.h - (h * S + (ph ? ph - 8 : 0))) / 2);
    st.S = S;
    st.C = { x: hb.w / 2 - w * S / 2 + st.P.x * S, y: top0 + st.P.y * S };
    if (st.panel) { st.panel.style.left = (hb.w / 2 - pw / 2) + 'px'; st.panel.style.top = (top0 + h * S - 8) + 'px'; }
  }
  function paint() {
    st.card.style.transform = 'translate(' + (st.A.x - st.P.x).toFixed(2) + 'px,' + (st.A.y - st.P.y).toFixed(2) + 'px) scale(' + st.sc.toFixed(4) + ')';
    st.s.swing.style.transform = 'rotate(' + st.r.toFixed(3) + 'deg)';
  }

  function open(i) {
    if (st) return;
    var s = slots[i], rm = reduced(), g = geometry(s), hb = hostBox();
    var sr = s.el.getBoundingClientRect(), w = s.el.offsetWidth, h = s.swing.offsetHeight, P = { x: w * g.pinLeft, y: 14 };
    var pc = phys.cards[i], live = phys.detach(i);

    var fly = document.createElement('div');
    fly.className = 'unpin-fly';
    fly.style.width = cork.wrap.offsetWidth + 'px';
    var card = document.createElement('div');
    card.className = 'slot slot--' + s.kind + ' unpin-card lifted';
    card.dataset.id = s.el.dataset.id;
    card.style.cssText = 'width:' + w + 'px;transform-origin:' + P.x + 'px ' + P.y + 'px';
    card.appendChild(s.swing);
    fly.appendChild(card);
    s.swing.querySelectorAll('.paper a,.paper button').forEach(function (n) { n.tabIndex = -1; });

    var html = opt.panel ? opt.panel(s.project, s.kind, s) : noteHTML(s.project, s.kind), panel = null;
    if (html) {
      panel = document.createElement('div');
      panel.className = 'unpin-panel unpin-panel--' + s.kind;
      panel.innerHTML = html;
      layer.append(panel, fly);
    } else layer.append(fly);
    var dlg = panel || card;
    dlg.setAttribute('role', 'dialog'); dlg.setAttribute('aria-modal', 'true'); dlg.setAttribute('aria-label', s.project.title);
    if (panel) fly.setAttribute('aria-hidden', 'true');
    layer.hidden = false; layer.classList.remove('leaving');
    s.el.classList.add('unpinned');

    st = { i: i, s: s, g: g, card: card, fly: fly, panel: panel, w: w, h: h, P: P, phase: 'pop', t: 0, noteOpen: false,
      A: { x: sr.left - hb.x + P.x, y: sr.top - hb.y + P.y }, V: { x: phys.boardV(), y: 0 },
      r: live.phi, rw: live.w, sc: live.sc, sv: live.sv, om: pc.omega, ze: pc.zeta, rest: g.tilt };
    layout(); paint();
    var first = (panel || card).querySelector('.unpin-close');
    if (first) first.focus({ preventScroll: true });
    if (opt.onOpen) st.dispose = opt.onOpen(i, panel || card);
    requestAnimationFrame(function () { scrim.classList.add('on'); });

    if (rm) { s.pin.style.visibility = 'hidden'; st.A = { x: st.C.x, y: st.C.y }; st.sc = st.S; st.r = 0; paint(); arrive(); st.phase = 'open'; return; }
    var pose = basePin(g);
    s.pin.animate(Motion.held([
      { transform: pose + ' translateY(-6px) rotate(14deg)', opacity: 1 },
      { transform: pose + ' translateY(-17px) rotate(34deg)', opacity: .7, offset: .5 },
      { transform: pose + ' translateY(-17px) rotate(34deg)', opacity: 0 }]), { duration: 250, fill: 'forwards' });
    flash(s.el.querySelector('.pin-ticks--pop'), g, 30, P);
    st.body = { step: step };
    phys.addBody(st.body);
  }

  function flash(svg, g, lift, P) {
    var a = (g.pinTilt + g.tilt) * Math.PI / 180;
    svg.style.left = (P.x + Math.sin(a) * lift) + 'px'; svg.style.top = (13.8 - Math.cos(a) * lift) + 'px';
    svg.querySelector('.tk-a').animate(Motion.held([{ opacity: 1 }, { opacity: 0, offset: .5 }, { opacity: 0 }]), { duration: 170 });
    svg.querySelector('.tk-b').animate(Motion.held([{ opacity: 0 }, { opacity: 1, offset: .5 }, { opacity: 0 }]), { duration: 170 });
  }

  // in hand: the candidate's move, or the production note hinging open under the card
  function arrive() {
    st.noteOpen = true;
    if (opt.arrive) { opt.arrive(st); return; }
    st.panel.classList.add('open');
    if (!reduced()) st.panel.animate([
      { transform: 'perspective(1100px) rotateX(-96deg)', opacity: 0 },
      { transform: 'perspective(1100px) rotateX(-40deg)', opacity: 1, offset: .35 },
      { transform: 'perspective(1100px) rotateX(5deg)', opacity: 1, offset: .74 },
      { transform: 'perspective(1100px) rotateX(0deg)', opacity: 1 }], { duration: 520, easing: 'cubic-bezier(.3,.6,.3,1)' });
  }

  function step(dt) {
    if (!st) return false;
    st.t += dt;
    var A = st.A, V = st.V;
    if (st.phase === 'pop') {
      var hp = home(); A.x = hp.x; A.y = hp.y;
      st.rw += (-st.om * st.om * (st.r - st.rest) - 2 * st.ze * st.om * st.rw) * dt; st.r += st.rw * dt;
      if (st.t >= 0.085) {
        st.phase = 'out'; st.t = 0;
        V.y += 230; st.rw += (st.rest >= 0 ? 1 : -1) * 46;
        var pp = phys.pinPoint(st.i); phys.ripple(pp.x, pp.y, Object.assign({ skip: st.i }, WAKE));
      }
    } else if (st.phase === 'out') {
      var ramp = Motion.smooth(0, 0.2, st.t), k = 150, ks = 170, kr = 110;
      V.x += (ramp * (k * (st.C.x - A.x) - 1.6 * Math.sqrt(k) * V.x)) * dt;
      V.y += (ramp * (k * (st.C.y - A.y) - 1.6 * Math.sqrt(k) * V.y) + (1 - ramp) * 1500) * dt;
      A.x += V.x * dt; A.y += V.y * dt;
      st.sv += ramp * (ks * (st.S - st.sc) - 1.4 * Math.sqrt(ks) * st.sv) * dt; st.sc += st.sv * dt;
      st.rw += (kr * (0 - st.r) - 1.0 * Math.sqrt(kr) * st.rw) * dt; st.r += st.rw * dt;
      var d = Math.hypot(st.C.x - A.x, st.C.y - A.y);
      if (!st.noteOpen && st.t > 0.25 && d < 12) arrive();
      if (st.noteOpen && d < 0.3 && Math.hypot(V.x, V.y) < 5 && Math.abs(st.sc - st.S) < 0.001 && Math.abs(st.sv) < 0.01 && Math.abs(st.r) < 0.02 && Math.abs(st.rw) < 0.2) {
        A.x = st.C.x; A.y = st.C.y; st.sc = st.S; st.r = 0; paint();
        st.phase = 'open'; phys.removeBody(st.body); return false;
      }
    } else if (st.phase === 'back') {
      var b = st.back;
      b.t += dt;
      st.rw += (110 * (st.rest - st.r) - 1.0 * Math.sqrt(110) * st.rw) * dt; st.r += st.rw * dt;
      if (b.t < b.delay) { V.x *= Math.exp(-dt / 0.06); V.y *= Math.exp(-dt / 0.06); A.x += V.x * dt; A.y += V.y * dt; b.p0 = { x: A.x, y: A.y }; b.v0 = { x: V.x, y: V.y }; paint(); return true; }
      var u = Math.min(1, (b.t - b.delay) / b.T), u3 = u * u * u, H0 = 1 - 10 * u3 + 15 * u3 * u - 6 * u3 * u * u, H1 = u - 6 * u3 + 8 * u3 * u - 3 * u3 * u * u, H5 = 1 - H0;
      var hp2 = home(), px = A.x, py = A.y;
      A.x = H0 * b.p0.x + H1 * b.v0.x * b.T + H5 * hp2.x;
      A.y = H0 * b.p0.y + H1 * b.v0.y * b.T + H5 * hp2.y;
      V.x = (A.x - px) / dt; V.y = (A.y - py) / dt;
      st.sc = H0 * b.s0 + H1 * b.sv0 * b.T + H5 * 1;
      if (u >= 1) { paint(); land(); return false; }
    }
    paint();
    return true;
  }

  function close() {
    if (!st || st.phase === 'back') return;
    var rm = reduced(), wait = opt.depart ? opt.depart(st) || 0 : 0;
    scrim.classList.remove('on');
    layer.classList.add('leaving');
    st.card.classList.remove('lifted');
    if (st.panel) {
      if (st.noteOpen && !rm && !opt.depart) {
        st.panel.getAnimations().forEach(function (a) { a.cancel(); });
        st.panel.animate([{ transform: 'perspective(1100px) rotateX(0deg)', opacity: 1 }, { transform: 'perspective(1100px) rotateX(-96deg)', opacity: 0 }],
          { duration: 200, easing: 'cubic-bezier(.5,0,.8,.4)', fill: 'forwards' });
      } else if (!opt.depart) st.panel.style.visibility = 'hidden';
    }
    if (rm) { st.A = home(); st.r = st.rest; st.rw = 0; paint(); land(); return; }
    var hp = home(), dist = Math.hypot(hp.x - st.A.x, hp.y - st.A.y);
    st.back = { t: 0, delay: (st.noteOpen ? 0.11 : 0) + wait / 1000, T: Math.min(0.66, Math.max(0.42, 0.36 + dist / 2400)), p0: { x: st.A.x, y: st.A.y }, v0: { x: st.V.x, y: st.V.y }, s0: st.sc, sv0: st.sv };
    st.phase = 'back';
    phys.addBody(st.body || (st.body = { step: step }));
  }

  function land() {
    var s = st.s, i = st.i, r = st.r, rw = st.rw, trigger = s.trigger;
    if (st.body) phys.removeBody(st.body);
    s.swing.style.transform = '';
    s.swing.querySelectorAll('.paper a,.paper button').forEach(function (n) { n.removeAttribute('tabindex'); });
    s.el.insertBefore(s.swing, s.pin);
    if (st.dispose) st.dispose();
    st.fly.remove(); if (st.panel) st.panel.remove();
    layer.hidden = true; layer.classList.remove('leaving');
    phys.attach(i, r, rw);
    st = null;
    if (opt.onLand) opt.onLand(i, reduced());
    if (trigger) phys.focusQuietly(trigger);
    press(i);
  }
  // the pin pushed in: three held frames, the impact ticks, a kick and the ripple through the cork
  function press(i) {
    var s = slots[i], g = geometry(s), P = { x: s.el.offsetWidth * g.pinLeft, y: 14 };
    s.pin.getAnimations().forEach(function (a) { a.cancel(); });
    s.pin.style.visibility = '';
    if (reduced()) { s.el.classList.remove('unpinned'); return; }
    var pose = basePin(g);
    s.pin.animate(Motion.held([
      { transform: pose + ' translateY(-16px) rotate(12deg)' },
      { transform: pose + ' scale(1.14,.74)', offset: .34 },
      { transform: pose + ' scale(.97,1.04)', offset: .67 },
      { transform: pose }]), { duration: 210 });
    setTimeout(function () {
      s.el.classList.remove('unpinned');
      flash(s.el.querySelector('.pin-ticks--press'), g, 30, P);
      var pp = phys.pinPoint(i);
      phys.kick(i, (g.tilt >= 0 ? 1 : -1) * 34);
      phys.ripple(pp.x, pp.y, Object.assign({ skip: i }, PRESS));
    }, 72);
  }

  layer.addEventListener('click', function (e) {
    if (e.target === scrim || e.target.closest('.unpin-close')) close();
  });
  document.addEventListener('keydown', function (e) {
    if (!st || st.phase === 'back') return;
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key !== 'Tab') return;
    var box = st.panel || st.card, f = [].filter.call(box.querySelectorAll('a,button'), function (n) { return n.offsetParent && n.tabIndex !== -1; }), first = f[0], lastF = f[f.length - 1];
    if (!first) return;
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastF.focus(); }
    else if (!e.shiftKey && document.activeElement === lastF) { e.preventDefault(); first.focus(); }
    else if (!box.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
  });
  window.addEventListener('resize', function () { if (st && st.phase !== 'back') { layout(); if (st.phase === 'open') { st.A = { x: st.C.x, y: st.C.y }; st.sc = st.S; paint(); } } });

  return {
    open: function (id) { var k = slots.findIndex(function (x) { return x.project.id === id; }); if (k >= 0) open(k); },
    openIndex: open, close: close, repin: press, closeBtn: closeBtn,
    isOpen: function () { return !!st; },
    current: function () { return st; }
  };
}
