/* r2-08b-c.js — C · The annotator's hand + catalogue card / 批注一笔 · 目录卡. Hand's clock for the ink, physics for the card.
   Pointing at a ref plays one gesture, the way a reader with a pen actually marks a source: a corner ⌜ where the
   claim starts, then without lifting — a ⌟ where it ends, a loop round the number, and a swift arrow through the
   leading into the margin. As the arrow arrives the margin note is pulled up out of its drawer as a library
   catalogue card (No. · host, who, title, date, the rod hole) and the pen underlines its title. Let go: the ink
   lifts faster than it went down and the card drops back into the drawer.
   First reveal: pen touches down, lifts, draws (~750 ms). Every reveal after: one stroke, all at once (~380 ms).
   Phone: the slip from the slot. Reduced motion: marks and card are simply there. */
(function () {
  var ctx = RD.mount(document.getElementById('stage-c'), 'c');
  var rd = ctx.rd, model = FN.prepare(ctx), slip = FN.Slip(ctx, model, { card: true }), NS = FN.NS;
  rd.classList.add('cc-mode');
  var act = null;

  function card(note) {
    var c = document.createElement('span');
    c.className = 'cc'; c.setAttribute('aria-hidden', 'true');
    c.innerHTML = '<span class="cc-card"><span class="cc-top"><span>No. ' + note.n + '</span><span>' + FN.esc(note.entries[0].host) + '</span></span>' +
      FN.fields(note, false) + '<span class="cc-hole"></span><svg class="cc-ink"></svg></span>';
    note.mn.appendChild(c);
    // measure the title's line boxes in the card's resting pose, before it is tipped back into the drawer
    var cardEl = c.firstChild; cardEl.style.transform = 'none';
    var C = cardEl.getBoundingClientRect(), t = cardEl.querySelector('.fe-title'), rg = document.createRange();
    rg.selectNodeContents(t);
    var lines = [];
    Array.prototype.forEach.call(rg.getClientRects(), function (r) {
      if (r.width < 2) return;
      var l = lines[lines.length - 1];
      if (l && Math.abs(l.b - r.bottom) < 4) { l.x1 = Math.max(l.x1, r.right - C.left); } else lines.push({ x0: r.left - C.left, x1: r.right - C.left, b: r.bottom - C.top });
    });
    var svg = cardEl.querySelector('.cc-ink');
    var marks = lines.slice(0, 2).map(function (l, i) {
      var p = Pen.path(Pen.underline(l.x1 - l.x0, 'cc-u-' + note.key + i, { y: 0 }), { width: 1.5 });
      p.setAttribute('transform', 'translate(' + l.x0.toFixed(1) + ' ' + (l.b + 1).toFixed(1) + ')');
      svg.appendChild(p); var L = p.getTotalLength(); p.style.strokeDasharray = Pen.dashes(p, L); p.style.strokeDashoffset = Pen.hiddenAt(p, L);
      return p;
    });
    cardEl.style.transform = '';
    return { el: c, card: cardEl, marks: marks };
  }

  function gesture(note) {
    var body = note.body, B = body.getBoundingClientRect(), m = FN.metrics(body), gh = m.fs;
    var range = FN.phrase(note.sup), rects = range ? Array.prototype.filter.call(range.getClientRects(), function (r) { return r.width > 1; }) : [];
    var ra = FN.rel(note.a.getBoundingClientRect(), B), rw = FN.rel(FN.row(note.sup), B), mr = FN.rel(note.mn.getBoundingClientRect(), B);
    var f = rects.length ? FN.rel(rects[0], B) : rw, l = rects.length ? FN.rel(rects[rects.length - 1], B) : rw;
    var r = Pen.rng('cc-g-' + note.key), jit = function (a) { return (r() - .5) * a; };
    var fTop = f.cy - gh * .56, x0 = f.left - 3;
    var open = [[x0 + 10, fTop - 1.5 + jit(1)], [x0 + jit(.6), fTop], [x0 - .8, fTop + gh * .78]];
    var lBot = l.cy + gh * .5, xe = l.right + 1;
    var close = [[xe - 9, lBot + 2 + jit(1)], [xe, lBot + 1.5], [xe + 1.5, lBot - gh * .3]];
    var cx = ra.cx, cy = ra.cy, rx = ra.width / 2 + 5, ry = ra.height / 2 + 4, loop = [], a0 = 150, a1 = 655;
    for (var i = 0; i <= 24; i++) {
      var t = i / 24, a = (a0 + (a1 - a0) * t) * Math.PI / 180, grow = 1 + (t - .5) * .08;
      loop.push([cx + Math.cos(a) * rx * grow, cy + Math.sin(a) * ry * grow]);
    }
    var yRun = rw.cy - gh * .5 - Math.min(6, (m.lh - m.fs) * .36), colR = body.clientWidth;
    var T = [mr.left - 19, mr.top + 4], xs = loop[loop.length - 1][0];
    var shaft = [[xs + 9, yRun + 1], [xs + (colR - xs) * .5, yRun + jit(1.6)], [colR + 6, yRun + (T[1] - yRun) * .12]];
    if (Math.abs(T[1] - yRun) > 30) shaft.push([colR + 22, yRun + (T[1] - yRun) * .6]);
    shaft.push(T);
    var pts = close.concat(loop, shaft);
    var n1 = close.length, n2 = n1 + loop.length;
    var len = function (p) { var s = 0; for (var k = 1; k < p.length; k++) s += Math.hypot(p[k][0] - p[k - 1][0], p[k][1] - p[k - 1][1]); return s; };
    var L1 = len(pts.slice(0, n1 + 1)), L2 = len(pts.slice(n1, n2 + 1)), L3 = len(pts.slice(n2));
    var pa = shaft[shaft.length - 2], ang = Math.atan2(T[1] - pa[1], T[0] - pa[0]), hl = 9;
    var head = 'M' + (T[0] - Math.cos(ang - .5) * hl).toFixed(1) + ' ' + (T[1] - Math.sin(ang - .5) * hl).toFixed(1) + ' L' + T[0].toFixed(1) + ' ' + T[1].toFixed(1) +
      ' L' + (T[0] - Math.cos(ang + .5) * hl * .85).toFixed(1) + ' ' + (T[1] - Math.sin(ang + .5) * hl * .85).toFixed(1);
    return { open: Pen.smooth(open), main: Pen.smooth(pts), head: head, split: [L1, L2, L3] };
  }

  function drawMain(p, split, dur, delay) {
    var L = p.getTotalLength(), H = Pen.hiddenAt(p, L), tot = split[0] + split[1] + split[2], f1 = split[0] / tot, f2 = (split[0] + split[1]) / tot;
    p.style.strokeDasharray = Pen.dashes(p, L);
    if (Pen.reduced()) { p.style.strokeDashoffset = 0; return; }
    // the ⌟ and the loop are careful, the arrow is flung: the last ~55% of the ink goes down in ~40% of the time
    p.animate([{ strokeDashoffset: H, offset: 0, easing: 'cubic-bezier(.5,0,.8,.6)' }, { strokeDashoffset: H * (1 - f1), offset: .15, easing: 'linear' },
      { strokeDashoffset: H * (1 - f2), offset: .6, easing: 'cubic-bezier(.25,.0,.15,1)' }, { strokeDashoffset: 0, offset: 1 }],
      { duration: dur, delay: delay, fill: 'both' });
  }

  function start(note) {
    var full = FN.first('c'); FN.seen('c');
    var g = gesture(note), wire = note.body.querySelector('.fn-wire'), grp = document.createElementNS(NS, 'g');
    grp.setAttribute('class', 'cc-g'); wire.appendChild(grp);
    var pOpen = Pen.path(g.open, { width: 1.7 }), pMain = Pen.path(g.main, { width: 1.7 }), pHead = Pen.path(g.head, { width: 1.7 });
    [pOpen, pMain, pHead].forEach(function (p) { grp.appendChild(p); var L = p.getTotalLength(); p.style.strokeDasharray = Pen.dashes(p, L); p.style.strokeDashoffset = Pen.hiddenAt(p, L); });
    var c = card(note), T = full ? { open: 0, main: 100, dur: 430, head: 510, card: 455, ul: 585 } : { open: 0, main: 0, dur: 250, head: 235, card: 170, ul: 290 };
    Pen.draw(pOpen, { duration: full ? 90 : 110 });
    drawMain(pMain, g.split, T.dur, T.main);
    Pen.draw(pHead, { duration: full ? 70 : 50, delay: T.head });
    note.mn.style.setProperty('--cc-fade', (T.card + 60) + 'ms');
    note.mn.classList.add('on');
    var anim = null;
    if (Pen.reduced()) c.card.style.transform = 'none';
    else anim = c.card.animate([
      { transform: 'translateY(12px) rotateX(93deg)', offset: 0, easing: 'cubic-bezier(.3,.6,.4,1)' },
      { transform: 'translateY(-2px) rotateX(-8deg)', offset: .58, easing: 'ease-in-out' },
      { transform: 'translateY(0) rotateX(2.5deg)', offset: .8, easing: 'ease-in-out' },
      { transform: 'none', offset: 1 }], { duration: full ? 330 : 230, delay: T.card, fill: 'both' });
    var timers = c.marks.map(function (p, i) { return setTimeout(function () { Pen.draw(p, { duration: full ? 150 : 100 }); }, Pen.reduced() ? 0 : T.ul + i * (full ? 120 : 80)); });
    act = { note: note, grp: grp, paths: [pHead, pMain, pOpen], c: c, anim: anim, timers: timers };
  }
  function stop(note) {
    if (!act || act.note !== note) return;
    var s = act; act = null;
    s.timers.forEach(clearTimeout);
    note.mn.classList.remove('on');
    s.paths.concat(s.c.marks).forEach(function (p) { Pen.erase(p, { duration: 140 }); });
    if (Pen.reduced()) { s.c.el.remove(); s.grp.remove(); return; }
    if (s.anim) s.anim.cancel();
    var drop = s.c.card.animate([{ transform: getComputedStyle(s.c.card).transform === 'none' ? 'none' : getComputedStyle(s.c.card).transform },
      { transform: 'translateY(10px) rotateX(93deg)' }], { duration: 150, easing: 'cubic-bezier(.5,0,.9,.5)', fill: 'both' });
    drop.onfinish = function () { s.c.el.remove(); };
    setTimeout(function () { s.grp.remove(); }, 170);
  }

  var hov = FN.hover(ctx, model, { on: start, off: stop, tap: slip.open });
  document.addEventListener('mock:rm', function () { hov.off(true); });

  function show(n, first) {
    FN.seen('c', !first);
    hov.off(true);
    var note = model.get(n);
    ctx.stage.scrollIntoView({ block: 'center', behavior: Pen.reduced() ? 'auto' : 'smooth' });   // the replay button sits under the stage
    ctx.scrollTo(ctx.top(note.a) - rd.clientHeight * .42);
    setTimeout(function () { if (FN.marginShown(note)) hov.on(note); else slip.open(note); }, Pen.reduced() ? 60 : 650);
  }
  window.replayC = function () { show('3', true); };
  window.repeatC = function () { show('4', false); };
  window.__C = { ctx: ctx, model: model, hov: hov, slip: slip };
})();
