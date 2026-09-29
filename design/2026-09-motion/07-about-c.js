/* 07 · C — The sleeve. Two cards, one kraft sleeve. Physics clock: the card slides out on a spring with
   one small overshoot, the sleeve gives a little the other way; flipping tucks one card and draws the other.
   Desktop: the sleeve's mouth faces right and the card comes out sideways. Phone: the mouth faces up and
   the sleeve drops away below the card (relative motion — the page has no room for a full draw). */
(function () {
  var root = document.getElementById('cand-c'); if (!root) return;
  var stage = root.querySelector('.c-stage'), rig = root.querySelector('.c-rig'), sleeve = root.querySelector('.c-sleeve'),
    kraft = root.querySelector('.c-kraft'), notch = root.querySelector('.c-notch'),
    cards = [root.querySelector('.c-day-card'), root.querySelector('.c-night-card')],
    faces = cards.map(function (c) { return c.querySelector('.sc-face'); });
  faces[0].innerHTML = SC.dayFace();
  faces[1].innerHTML = SC.nightFace('c-rd');
  var radar = SC.Radar(faces[1].querySelector('.sc-radar'));
  var flip = SC.flipButton('c-rig');
  root.querySelector('.flip-slot').appendChild(flip);

  var o = [new SC.Spring(0, 90, .66), new SC.Spring(0, 90, .66)], rec = new SC.Spring(0, 320, .45);
  var cur = 0, pending = -1, arrived = false, narrow = matchMedia('(max-width:680px)'), G = {};

  /* ---- ticks on the sleeve's printed checklist (board 02: tick = chosen) ---- */
  var ticks = [].map.call(root.querySelectorAll('.c-box'), function (box, i) {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('width', 20); svg.setAttribute('height', 20);
    var p = Pen.path(Pen.tick(17, 'sleeve-tick-' + i), { color: '#33302B', width: 2 });
    svg.appendChild(p); box.appendChild(svg);
    var L = p.getTotalLength(); p.style.strokeDasharray = L + ' ' + (L + 2); p.style.strokeDashoffset = L;
    return p;
  });
  var ticked = -1;
  function tick(i) { if (ticked === i) return; if (ticked >= 0) Pen.erase(ticks[ticked]); ticked = i; if (i >= 0) Pen.draw(ticks[i], { delay: 120 }); }

  /* ---- the sleeve, drawn: kraft with an ink edge, a glue seam, fibres, a thumb notch at the mouth ---- */
  function drawSleeve(w, h, vertical) {
    var r = 6, n = 30, mid, d;
    if (!vertical) {
      mid = h / 2;
      d = 'M' + r + ' 0H' + w + 'V' + (mid - n) + 'A' + n + ' ' + n + ' 0 0 0 ' + w + ' ' + (mid + n) + 'V' + h + 'H' + r + 'Q0 ' + h + ' 0 ' + (h - r) + 'V' + r + 'Q0 0 ' + r + ' 0Z';
    } else {
      mid = w / 2;
      d = 'M0 0H' + (mid - n) + 'A' + n + ' ' + n + ' 0 0 0 ' + (mid + n) + ' 0H' + w + 'V' + (h - r) + 'Q' + w + ' ' + h + ' ' + (w - r) + ' ' + h + 'H' + r + 'Q0 ' + h + ' 0 ' + (h - r) + 'Z';
    }
    var rnd = Pen.rng('kraft'), fib = '';
    for (var i = 0; i < Math.round(w * h / 2600); i++) {
      var x = 8 + rnd() * (w - 16), y = 8 + rnd() * (h - 16), a = rnd() * Math.PI, l = 3 + rnd() * 5;
      fib += 'M' + x.toFixed(1) + ' ' + y.toFixed(1) + 'l' + (Math.cos(a) * l).toFixed(1) + ' ' + (Math.sin(a) * l).toFixed(1);
    }
    var seam = vertical ? 'M10 ' + (h - 10) + 'H' + (w - 10) + 'M10 12V' + (h - 10) + 'M' + (w - 10) + ' 12V' + (h - 10)
      : 'M10 10H' + (w - 12) + 'M10 ' + (h - 10) + 'H' + (w - 12) + 'M10 10V' + (h - 10);
    kraft.setAttribute('width', w); kraft.setAttribute('height', h); kraft.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    kraft.innerHTML = '<path d="' + d + '" fill="#D5BB8F" stroke="#33302B" stroke-width="1.8" stroke-linejoin="round"/>' +
      '<path d="' + fib + '" stroke="#9E8158" stroke-width="1" stroke-linecap="round" opacity=".45"/>' +
      '<path d="' + seam + '" fill="none" stroke="#8F7550" stroke-width="1.1" stroke-dasharray="5 5" opacity=".7"/>';
  }

  function layout() {
    var vertical = narrow.matches, avail = stage.clientWidth - (vertical ? 24 : 40);
    var cw = vertical ? Math.min(520, avail - 24) : Math.min(520, Math.floor((avail - 26) / 2));
    cards.forEach(function (c) { c.style.width = cw + 'px'; });
    var ch = Math.max(cards[0].offsetHeight, cards[1].offsetHeight);
    G = { v: vertical, cw: cw, ch: ch };
    if (!vertical) {
      G.sw = cw + 40; G.sh = ch + 36; G.cx = 20; G.cy = 18; G.out = cw + 6;
      rig.style.width = (G.sw + cw - 14) + 'px'; rig.style.height = (G.sh + 4) + 'px';
      notch.style.left = (G.sw - 37) + 'px'; notch.style.top = (G.sh / 2 - 37) + 'px';
    } else {
      G.sw = cw + 24; G.sh = ch + 60; G.cx = 12;
      rig.style.width = G.sw + 'px'; rig.style.height = (ch + 120) + 'px';
      notch.style.left = (G.sw / 2 - 37) + 'px'; notch.style.top = '-37px';
    }
    sleeve.style.width = G.sw + 'px'; sleeve.style.height = G.sh + 'px';
    drawSleeve(G.sw, G.sh, vertical);
    render();
  }

  function render() {
    if (!G.cw) return;
    var om = Math.max(o[0].x, o[1].x);
    if (!G.v) {
      sleeve.style.transform = 'translateX(' + rec.x.toFixed(2) + 'px)';
      cards.forEach(function (c, i) { c.style.transform = 'translate(' + (G.cx + o[i].x * G.out + rec.x * (1 - o[i].x)).toFixed(2) + 'px,' + G.cy + 'px) rotate(' + (o[i].x * (i ? 1.1 : -1.2)).toFixed(2) + 'deg)'; });
    } else {
      var S = 40 + (G.ch - 66) * om + rec.x;          // the sleeve drops away as the card comes out
      sleeve.style.transform = 'translateY(' + S.toFixed(2) + 'px)';
      cards.forEach(function (c, i) { var y = (S + 30) * (1 - o[i].x); c.style.transform = 'translate(' + G.cx + 'px,' + y.toFixed(2) + 'px)'; });
    }
    cards.forEach(function (c, i) { c.style.zIndex = o[i].x > .02 ? 3 : 1; c.classList.toggle('is-out', o[i].x > .9); });
    if (o[1].x > .9 && radar.state === 'empty') radar.draw();
    if (o[1].x < .05 && radar.state !== 'empty') radar.reset();
  }

  var loop = SC.Loop(function (dt) {
    o[0].step(dt); o[1].step(dt); rec.step(dt);
    if (pending >= 0 && o[1 - pending].x < .06) { var p = pending; pending = -1; draw(p); }
    render();
    return pending >= 0 || !(o[0].rest(.002) && o[1].rest(.002) && rec.rest(.05));
  });

  function setSprings(s, k, z) { s.k = k; s.c = 2 * z * Math.sqrt(k); }
  function draw(i) {
    setSprings(o[i], 90, .66); o[i].to = 1; rec.v -= G.v ? 40 : 70;   // the sleeve gives as the card leaves
    faces[i].setAttribute('aria-hidden', 'false'); tick(i);
    if (Pen.reduced()) { o[i].snap(1); rec.snap(0); render(); return; }
    loop.kick();
  }
  function swap() {
    if (!arrived || pending >= 0) return;
    var from = cur; cur = 1 - cur; flip.setState(cur === 1);
    faces[from].setAttribute('aria-hidden', 'true');
    setSprings(o[from], 190, .95); o[from].to = 0;
    if (Pen.reduced()) { o[from].snap(0); render(); draw(cur); return; }
    pending = cur; loop.kick();
  }
  function arrive() { if (arrived) return; arrived = true; draw(0); }

  cards.forEach(function (c) { c.addEventListener('click', function () { if (c.classList.contains('is-out')) swap(); }); });
  notch.addEventListener('click', function () { if (!arrived) arrive(); else swap(); });
  flip.addEventListener('click', function () { if (!arrived) arrive(); else swap(); });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es, ob) { es.forEach(function (e) { if (e.isIntersecting) { ob.disconnect(); setTimeout(arrive, 250); } }); }, { threshold: .35 }).observe(rig);
  } else arrive();

  window.addEventListener('resize', layout);
  window.addEventListener('load', layout);
  if (window.ResizeObserver) new ResizeObserver(function () { layout(); }).observe(faces[1]);
  document.addEventListener('mock:rm', function () { if (Pen.reduced()) { o.forEach(function (s) { s.snap(s.to); }); rec.snap(0); render(); if (cur === 1) radar.show(); } });

  window.replayC = function () {
    pending = -1; arrived = false; cur = 0; flip.setState(false); tick(-1); radar.reset();
    o.forEach(function (s) { s.snap(0); }); rec.snap(0);
    faces[0].setAttribute('aria-hidden', 'false'); faces[1].setAttribute('aria-hidden', 'true');
    render(); setTimeout(arrive, 350);
  };
  layout();
})();
