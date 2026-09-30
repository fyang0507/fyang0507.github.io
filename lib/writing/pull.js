/* lib/writing/pull.js — pull a book, read its obi, open it.
   One gesture on the physics clock: point → a finger hooks the head of the spine (it tips on its front edge);
   pause → it slides out, clears the plank in front, and turns in your hand to show the real cover under a
   paper obi / 腰封 carrying the preview; its neighbours lose their support only then and lean into the gap;
   leave → it turns back, slides home and shoves them upright. Click / Enter → from wherever it is it comes
   square to you, the board swings open to the title page, and the page goes to Reading.
     - The book comes to the hand: its held pose is anchored to where the pointer (or finger) is when it comes
       out, so the pointer ends up on the obi, 74% down the cover. Every face of a held book takes the pointer:
       moving onto it keeps it out, clicking it opens it, leaving both puts it back. The held book is itself a
       link to the essay, so a modifier-, middle- or right-click treats it as one. Keyboard focus has no pointer:
       a focused book is held in front of the other row, and the page scrolls to keep it (obi and all) in view.
     - It only rises or drops once it is clear of the plank in front of it, so it never passes through a board.
     - A tall case: the open is centred on the part of the case you can see.
     - The obi and the title page carry both titles: the shelf's language first and larger, the other under it.
   Springs, the sleeping loop and the baked easings come from motion.js; the obi's underline is the pen's. */
import { el, esc, aside, titleIn, rm, wait } from './case.js';
import { Bird } from './bird.js';

var NAMES = ['dx', 'dy', 'dz', 's', 'rx', 'ry', 'rz', 'lean', 'tip', 'lf', 'hy'];
var RX = 4, RZ = -1.5, RY = -58, HOOK = 6, DWELL = 110, W16 = 2 * Math.PI * 1.6;
// A spring with damping ratio z at 1.6 Hz, baked into a linear() easing.
function curve(z) { return Motion.springEase(W16 * W16, 2 * z * W16); }
function spring(x, k, z) { return new Motion.Spring({ x: x, k: k, zeta: z }); }
function tune(sp, k, z) { sp.setK({ k: k, zeta: z }); return sp; }

/* ---- the cover, dressed the first time the book comes out ---- */
// Everything is typeset at "in the hand" size inside a .cv box, scaled down onto the board on the shelf and drawn
// unscaled in the hand, where case.js lays the cover out at that size (sh.hand), so it lands crisp when held. The
// front board shows the real cover (pre-cropped to the board, zoomed 1.12) wrapped in the obi; its reverse, an ex
// libris; under it, the title page.
function dress(b, CW, l) {
  var p = b.post, ch = Math.round(CW * b.h / b.D), note = aside(p), tag = esc(p.tags[0] || ''), tagZh = esc(p.tagZh[0] || '');
  var cv = '<div class="cv" style="width:' + CW + 'px;height:' + ch + 'px">';
  b.F.front.innerHTML = cv + '<div class="cv-img"><img alt="" decoding="async" sizes="' + Math.round(CW * 1.12) + 'px"></div>' +
    '<div class="obi"><div class="obi-t"></div><div class="obi-s"></div>' +
    '<div class="obi-meta"><span class="ml"><b>' + p.ym + '</b> · <b>~' + p.min + ' min</b></span><span class="ml"><b>' + tag + '</b> · <b lang="zh">' + tagZh + '</b></span></div>' +
    '<div class="obi-note">' + esc(note[0]) + '<span lang="zh">' + note[1] + '</span></div></div></div>';
  var img = b.F.front.querySelector('img'); img.setAttribute('srcset', p.boardSrcset); img.src = p.board;
  b.F.leafBack.innerHTML = cv + '<div class="exlib">EX LIBRIS<b>fred yang</b><span lang="zh">弗雷德藏书</span></div></div>';
  var p1 = el('div', 'p1', cv + '<div class="p1-head">FRED YANG · <span lang="zh">弗雷德</span></div><div class="p1-t"></div>' +
    '<div class="p1-s"></div><i class="p1-rule"></i><div class="p1-foot">' + p.year + ' · <span lang="zh">' + tagZh + '</span> ' + tag + '</div></div>');
  b.F.cov.insertBefore(p1, b.F.leaf);
  titled(b, CW, l);
}
// Titles: one line if a slightly smaller size fits, else two lines, stepping down only if needed; one still longer
// than three lines at the smallest size (a long English title on a phone's obi) steps on down to three, so the obi
// covers no more of the cover than main's two Chinese lines did.
function fit(node, fs, oneMin, min, maxW) {
  node.style.maxWidth = 'none'; node.style.whiteSpace = 'nowrap';
  var f = fs; node.style.fontSize = f + 'px';
  while (node.offsetWidth > maxW && f > oneMin) { f -= 0.5; node.style.fontSize = f + 'px'; }
  if (node.offsetWidth <= maxW) return;
  node.style.whiteSpace = 'normal'; node.style.maxWidth = maxW + 'px'; f = fs; node.style.fontSize = f + 'px';
  while (node.offsetHeight > f * 1.28 * 2 + 1 && f > min) { f -= 0.5; node.style.fontSize = f + 'px'; }
  while (node.offsetHeight > f * 1.28 * 3 + 1 && f > 9) { f -= 0.5; node.style.fontSize = f + 'px'; }
}
// Both titles, the shelf's language first; a post with one title shows it once. The pen underlines the first.
function titled(b, CW, l) {
  var p = b.post, main = titleIn(p, l), other = main.lang === 'zh' ? 'en' : 'zh';
  function set(root, sel, lg, text) { var n = root.querySelector(sel); n.lang = lg; n.textContent = text; n.hidden = !text; return n; }
  if (b.pen) b.pen.destroy();
  b.titledIn = l;
  var t = set(b.F.front, '.obi-t', main.lang, main.text), pt = set(b.F.cov, '.p1-t', main.lang, main.text);
  set(b.F.front, '.obi-s', other, p[other]); set(b.F.cov, '.p1-s', other, p[other]);
  fit(t, 17, 15, 12, CW - 27);
  fit(pt, 22, 16, 13, Math.round(CW * 0.78));
  b.pen = Pen.annotate(t, 'underline', { manual: true });
}

export function Pull(sh, cfg) {
  var tap = !!cfg.tap, view = sh.view, k = sh.k, CW = sh.CW, books = sh.books, CLR = sh.S + Math.round(8 * k), at = null;
  books.forEach(function (b) {
    b.st = Object.assign({}, sh.REST); b.sp = {}; b.phase = 'rest';
    NAMES.forEach(function (n) { b.sp[n] = spring(n === 's' ? 1 : 0, 200, 0.7); });
    tune(b.sp.hy, 260, 0.62);
  });
  var bird = Bird(sh, { size: cfg.bird || Math.round(56 * sh.rowH / 221), notice: 420 });
  var loop = new Motion.Loop(render), cur = -1, busy = false, dwell = null, leaveT = null, downType = '';
  function kick() { if (rm()) { render(0); return; } loop.kick(); }
  function on(b) { return b.vis && b.rf && b.rf.mode === 'in'; }
  // A book comes out dressed in the shelf's language: one dressed earlier catches up now (a switch retitles only the
  // books out of the shelf, so it stays cheap however many have been pulled).
  function dressed(b) { var l = cfg.lang(); if (!b.pen) dress(b, CW, l); else if (b.titledIn !== l) titled(b, CW, l); }
  function order() { return books.filter(on); }
  function neighbour(b, d) { var o = order(), n = o[o.indexOf(b) + d]; return n && n.row === b.row ? n : null; }
  function clearZ(b) { return b.D + CLR; }
  function viewAt(e) { var r = view.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  function status(v) { cfg.host.setAttribute('data-held', v); }

  // ---- the pose in your hand ----
  function heldPose(b, p) {
    var P = sh.P, dz = clearZ(b) + Math.round(24 * k), zc = dz - b.D / 2, pk = P / (P - zc);
    var s = CW / (b.D * pk), Hs = b.h * s * pk, Ws = (0.87 * b.D + 0.5 * b.w) * s * pk, vh = view.clientHeight;
    var py = sh.plankY(b.row), rowTop = py - sh.rowH * 0.96, top;
    if (p) top = p.y - Hs * 0.74;                                                  // the pointer ends up on the obi
    else if (sh.used > 1 && b.row < sh.used - 1) top = py + sh.LIP + Math.round(16 * k);   // keyboard: in front of the row below
    else top = rowTop + (cfg.overlap || 30) - Hs;
    top = Math.max(cfg.minTop || 12, Math.min(vh - 6 - Hs, top));
    b.held = { top: top, H: Hs };
    var cyS = top + Hs / 2, cy = sh.oy + (cyS - sh.oy) / pk, vw = view.clientWidth, sl = p ? view.scrollLeft : scrollFor(b), ox = sl + vw / 2, bx = b.sx + b.w / 2;
    var cxS = Math.max(sl + 12 + Ws / 2, Math.min(sl + vw - 12 - Ws / 2, p ? sl + p.x : bx)), cx = ox + (cxS - ox) / pk;
    return { dx: cx - bx, dy: cy - (b.sy - b.h / 2), dz: dz, s: s, rx: RX, ry: RY, rz: RZ, lean: 0, tip: 0 };
  }
  // Square to you, centred on what you can see of the case, the board left of centre so the spread is centred.
  function facePose(b) {
    var P = sh.P, dz = clearZ(b) + Math.round(40 * k), zc = dz - b.D / 2, pk = P / (P - zc);
    var vis = cfg.visible ? cfg.visible() : { top: 0, bottom: view.clientHeight };
    var H = Math.min(cfg.faceH || 380, vis.bottom - vis.top - 60), s = H / (b.h * pk), cov = b.D * s * pk;
    var vw = view.clientWidth, sl = view.scrollLeft, ox = sl + vw / 2, cxS = ox + cov / 2 - b.w * s * pk * 0.25, cyS = (vis.top + vis.bottom) / 2;
    return { dx: ox + (cxS - ox) / pk - (b.sx + b.w / 2), dy: sh.oy + (cyS - sh.oy) / pk - (b.sy - b.h / 2), dz: dz, s: s, rx: 0, ry: -90, rz: 0, lean: 0, tip: 0 };
  }
  function scrollFor(b) { return sh.strip ? Math.max(0, Math.min(view.scrollWidth - view.clientWidth, b.sx + b.w / 2 - view.clientWidth / 2)) : view.scrollLeft; }
  function aim(b, pose, stiff) { NAMES.forEach(function (n) { if (pose[n] != null) b.sp[n].to = pose[n]; if (stiff && n !== 'hy') tune(b.sp[n], stiff[0], stiff[1]); }); }

  // ---- neighbours lose their support only once the book is clear of the row ----
  function setLean(b, amt) {
    var g = b.w + Math.round(5 * k);
    [-2, -1, 1, 2].forEach(function (d) {
      var o = neighbour(b, d); if (!o) return;
      var t = Math.asin(Math.min(0.5, (Math.abs(d) === 1 ? 0.32 : 0.11) * g * amt / o.h)) * 180 / Math.PI;
      if (o.phase === 'rest' || o.phase === 'hook') tune(o.sp.lean, 150, 0.36).to = d < 0 ? t : -t;
    });
    kick();
  }
  function shove(b) {                                     // the returning book pushes them upright: overshoot, settle
    [-2, -1, 1, 2].forEach(function (d) {
      var o = neighbour(b, d); if (!o || o.phase === 'out') return;
      tune(o.sp.lean, 260, 0.4).to = 0;
      if (Math.abs(d) === 1) o.sp.lean.v += (d < 0 ? -1 : 1) * 26;
    });
  }
  function unlean() { books.forEach(function (o) { if (o.phase === 'rest' || o.phase === 'hook') o.sp.lean.to = 0; }); }

  // ---- the gesture ----
  function hook(i) { var b = books[i]; b.phase = 'hook'; tune(b.sp.tip, 380, 0.55).to = HOOK; tune(b.sp.dz, 300, 0.8).to = 3; }
  function pull(i, p) {
    var b = books[i]; dressed(b);
    b.phase = 'out'; b.lifted = b.penOn = false; b.box.classList.add('held'); status(b.post.key);
    b.pose = heldPose(b, p); b.keyed = !p;
    tune(b.sp.dz, 230, 0.9).to = b.pose.dz; tune(b.sp.tip, 260, 0.7).to = 2;
    if (!p) reveal(b);
  }
  // Keyboard: scroll so the book in your hand is in view, with its slot too when there is room for both. It
  // runs as the book comes out (from its planned pose) and again once it faces you (from its drawn box).
  function reveal(b, drawn) {
    var smooth = rm() ? 'auto' : 'smooth';
    if (sh.strip && !drawn) view.scrollTo({ left: scrollFor(b), behavior: smooth });
    var r = view.getBoundingClientRect(), lo = cfg.stick() + 12, hi = window.innerHeight - 12, f = drawn && b.F.front.getBoundingClientRect();
    var top = f ? f.top : r.top + b.held.top, bot = f ? f.bottom : top + b.held.H, sTop = r.top + b.sy - b.h, sBot = r.top + b.sy;
    if (Math.max(bot, sBot) - Math.min(top, sTop) <= hi - lo) { top = Math.min(top, sTop); bot = Math.max(bot, sBot); }
    var d = bot > hi ? bot - hi : 0;
    if (top - d < lo) d = top - lo;
    if (Math.abs(d) > 1) window.scrollBy({ top: d, behavior: smooth });
  }
  function release(i) {
    var b = books[i];
    b.box.classList.remove('held'); status('');
    if (b.pen) b.pen.hide();
    if (b.phase === 'hook') { b.phase = 'back'; b.slid = b.shoved = true; tune(b.sp.tip, 420, 0.8).to = 0; b.sp.dz.to = 0; return; }
    if (b.phase !== 'out') return;
    b.phase = 'back'; b.slid = b.shoved = false;
    aim(b, { dx: 0, dy: -5, s: 1, rx: 0, ry: 0, rz: 0, lf: 0 }, [340, 0.92]);   // paper retracts faster than it rose
    if (!b.lifted) { b.slid = true; tune(b.sp.dz, 340, 0.95).to = 0; b.sp.tip.to = 0; b.sp.dy.to = 0; }
  }
  function phaseTick(b) {
    var sp = b.sp;
    if (b.phase === 'out') {
      if (!b.lifted && sp.dz.x > clearZ(b) - 2) {                            // clear of the plank first
        b.lifted = true; setLean(b, 1); sh.hand(b, true);
        tune(sp.dy, 150, 0.8).to = b.pose.dy; tune(sp.dx, 150, 0.82).to = b.pose.dx;
        tune(sp.ry, 125, 0.62).to = RY; tune(sp.rx, 125, 0.7).to = RX; tune(sp.rz, 100, 0.6).to = RZ; tune(sp.s, 140, 0.74).to = b.pose.s; sp.tip.to = 0;
      }
      if (b.lifted && !b.penOn && Math.abs(sp.ry.x - RY) < 4 && Math.abs(sp.ry.v) < 30) { b.penOn = true; b.pen.show(); bird.consider(b.i); if (b.keyed) reveal(b, true); }
    } else if (b.phase === 'back') {
      if (!b.slid && sp.ry.x > -16 && Math.abs(sp.dy.x - sp.dy.to) < 6) { b.slid = true; sh.hand(b, false); tune(sp.dz, 300, 0.92).to = 0; sp.tip.to = 0; }
      if (b.slid && !b.shoved && sp.dz.x < b.D + 4) { b.shoved = true; shove(b); }
      if (b.slid && sp.dz.x < 14) sp.dy.to = 0;
    }
  }
  function render(dt) {
    var moving = false, snap = rm();
    books.forEach(function (b) {
      if (b.frozen || !b.vis) return;
      var m = false;
      for (var r = 0; r < 3 && (snap || r === 0); r++) {                     // reduced motion: arrive, phase by phase
        NAMES.forEach(function (n) { var s = b.sp[n]; if (snap) s.snap(); else if (!s.rest(0.012)) { s.step(dt); m = true; } else if (s.x !== s.to) { s.snap(); m = true; } });
        // the plank is solid (a small bounce) — but only while the book stands over it
        if (b.sp.dy.x > 0 && b.sp.dz.x < clearZ(b) - 4) { b.sp.dy.x = 0; b.sp.dy.v = -b.sp.dy.v * 0.25; }
        phaseTick(b);
      }
      if (b.phase === 'back' && !m && b.sp.dz.x === 0) { b.phase = 'rest'; if (b.hookAfter) { b.hookAfter = false; if (cur === b.i) { hook(b.i); m = !snap; } } }
      if (m || b.dirty || snap) { NAMES.forEach(function (n) { b.st[n] = b.sp[n].x; }); sh.place(b, b.st); b.dirty = false; }
      moving = moving || m;
    });
    bird.tick();
    return moving;
  }
  function consider(i) {
    if (busy || i === cur) return;
    if (i >= 0 && !on(books[i])) return;
    var prev = cur; cur = i;
    clearTimeout(dwell);
    if (prev >= 0) release(prev);
    if (i >= 0) {
      hook(i);
      var p0 = at;
      if (rm()) pull(i, p0); else dwell = setTimeout(function () { if (cur === i) { pull(i, at || p0); kick(); } }, DWELL);
    } else bird.cancel();
    if (cfg.onConsider) cfg.onConsider(i);
    kick();
  }

  // ---- open: square to you, the board swings open, then the page goes to Reading ----
  function frames(b, list) { return list.map(function (q) { var f = { transform: sh.css(sh.ops(b, q[0])) }; if (q[1] != null) f.offset = q[1]; if (q[2]) f.easing = q[2]; return f; }); }
  async function open(i) {
    if (busy || !on(books[i])) return;
    busy = true;
    clearTimeout(dwell); clearTimeout(leaveT);
    if (cur !== i) { if (cur >= 0) release(cur); cur = i; }
    var b = books[i]; dressed(b); sh.hand(b, true); sh.place(b, b.st);
    b.pen.hide();
    b.frozen = true; b.phase = 'open'; b.box.classList.remove('held'); status(b.post.key);
    cfg.host.setAttribute('data-opening', b.post.key);
    if (bird.perch === i) { bird.hopOff(i); await wait(70); } else if (bird.want === i) bird.hopOff(i);
    if (!rm()) {
      var from = Object.assign({}, b.st), face = facePose(b), needClear = from.dz < clearZ(b);
      var clear = Object.assign({}, from, { dz: Math.max(from.dz, clearZ(b) + 30 * k), tip: 0 });
      setLean(b, 1.5);
      await Promise.all([
        Motion.play(b.box, frames(b, needClear ? [[from, 0, curve(0.9)], [clear, 0.26, curve(0.8)], [face]] : [[from, 0, curve(0.82)], [face]]),
          { duration: needClear ? 940 : 660, easing: 'linear' }),
        Motion.play(b.F.leaf, [{ transform: 'rotateY(' + (+from.lf || 0).toFixed(2) + 'deg)' }, { transform: 'rotateY(-172deg)' }], { duration: 520, delay: needClear ? 640 : 400, easing: curve(0.74) })
      ]);
      face.lf = -172; b.st = face; sh.place(b, face);
    }
    location.href = sh.href(b);
  }
  // Back from Reading through the bfcache: the book is still open in your hand. Put everything back.
  function reset() {
    clearTimeout(dwell); clearTimeout(leaveT);
    books.forEach(function (b) {
      b.frozen = false; b.phase = 'rest'; b.box.classList.remove('held');
      b.box.getAnimations().forEach(function (a) { a.cancel(); }); b.F.leaf.getAnimations().forEach(function (a) { a.cancel(); });
      if (b.pen) b.pen.hide();
      sh.hand(b, false);
      NAMES.forEach(function (n) { b.sp[n].snap(n === 's' ? 1 : 0); }); b.dirty = true;
    });
    cur = -1; busy = false; status(''); cfg.host.removeAttribute('data-opening'); bird.home(); render(0);
  }

  // ---- wiring: pointer, touch, keyboard ----
  var host = sh.view;
  function heldUnder(e) { return e.target.closest('.book.held'); }
  function modified(e) { return e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button > 0; }
  function leaveSoon() { clearTimeout(leaveT); leaveT = setTimeout(function () { var f = document.activeElement; if (!(cur >= 0 && f === books[cur].hit && f.matches(':focus-visible'))) consider(-1); }, 180); }
  host.addEventListener('pointermove', function (e) { if (!heldUnder(e)) at = viewAt(e); }, { passive: true });
  host.addEventListener('pointerover', function (e) {
    if (tap || e.pointerType === 'touch') return;
    if (!heldUnder(e)) at = viewAt(e);
    var a = e.target.closest('.bk-hit');
    if (a) { clearTimeout(leaveT); consider(+a.dataset.i); return; }
    if (heldUnder(e)) { clearTimeout(leaveT); return; }
    leaveSoon();
  });
  host.addEventListener('pointerleave', function (e) { if (!tap && e.pointerType !== 'touch') leaveSoon(); });
  // A tap's click can arrive as pointerType 'mouse' (WebKit); the press that started it knows better.
  host.addEventListener('pointerdown', function (e) { downType = e.pointerType; }, { passive: true });
  host.addEventListener('click', function (e) {
    if (modified(e)) return;                                                    // links open where the click asks
    var a = e.target.closest('.bk-hit'), touch = tap || downType === 'touch' || e.pointerType === 'touch';
    if (a) {
      e.preventDefault();
      var i = +a.dataset.i;
      if ((cur !== i || books[i].phase !== 'out') && touch) {
        at = viewAt(e); consider(i);
        if (cur === i && books[i].phase === 'hook') { clearTimeout(dwell); pull(i, at); kick(); }
        return;
      }
      open(i); return;
    }
    if (heldUnder(e) && cur >= 0) { e.preventDefault(); open(cur); return; }
    if (touch) consider(-1);
  });
  function walk(b, d) { var o = order(); return o[Math.max(0, Math.min(o.length - 1, o.indexOf(b) + d))]; }
  function roving(b) { books.forEach(function (o) { o.hit.tabIndex = -1; }); if (b) b.hit.tabIndex = 0; }
  books.forEach(function (b, i) {
    b.hit.addEventListener('keydown', function (e) {
      var kk = e.key, n = null, o = order();
      if (kk === 'ArrowRight' || kk === 'ArrowDown') n = walk(b, 1); else if (kk === 'ArrowLeft' || kk === 'ArrowUp') n = walk(b, -1);
      else if (kk === 'Home') n = o[0]; else if (kk === 'End') n = o[o.length - 1];
      else if (kk === 'Escape') { if (cur === i && b.phase === 'out') { e.preventDefault(); clearTimeout(dwell); release(i); b.hookAfter = true; kick(); } return; }
      else if (kk === ' ') { e.preventDefault(); open(i); return; }
      if (!n) return;
      e.preventDefault(); n.hit.focus({ preventScroll: true });
    });
    b.hit.addEventListener('focus', function () { roving(b); if (b.hit.matches(':focus-visible')) { at = null; consider(i); } });
    // Leaving the shelf by keyboard puts this book back — only this one: a click on another, pulled book also
    // blurs the last focused link and must not re-shelve the book being clicked.
    b.hit.addEventListener('blur', function (e) { if (cur === i && (!e.relatedTarget || !sh.world.contains(e.relatedTarget)) && !tap) consider(-1); });
  });
  var offReduced = Motion.onReduced(function () { books.forEach(function (b) { NAMES.forEach(function (n) { b.sp[n].snap(); }); b.dirty = true; }); render(0); });

  return {
    bird: bird, consider: consider, open: open, reset: reset,
    get busy() { return busy; },
    // A filter is about to move books: put the one in your hand back (it still reflows from wherever it is).
    rest: function () { if (busy) return false; consider(-1); unlean(); return true; },
    // Hover hints from the index: the kept books lift a finger's width off the plank.
    hint: function (pred) { var up = -Math.round(8 * k); books.forEach(function (b) { b.sp.hy.to = pred && on(b) && pred(b) ? up : 0; }); kick(); },
    roving: function () { var o = order(), f = o.find(function (b) { return b.hit.tabIndex === 0; }); roving(f || o[0]); },
    render: function () { books.forEach(function (b) { b.dirty = true; }); kick(); },
    // The shelf changed language: a book out of the shelf (in your hand, on its way back, opening) takes the new
    // order of titles at once; the others when they next come out (dressed).
    retitle: function (l) { books.forEach(function (b) { if (!b.pen || b.phase === 'rest') return; titled(b, CW, l); if (b.phase === 'out' && b.penOn) b.pen.show(); }); },
    destroy: function () {
      offReduced(); loop.stop(); clearTimeout(dwell); clearTimeout(leaveT); bird.destroy();
      books.forEach(function (b) { if (b.pen) b.pen.destroy(); });
    }
  };
}
