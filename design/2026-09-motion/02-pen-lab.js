/* Board 02 — the two rules every grammar shares.
   RULE 1: wobble is seeded per element (the same word always gets the same circle); re-rolling is jitter.
   RULE 2: timing — draw 200–620 ms scaled to stroke length, retract 200 ms, one ease for every stroke. */
(function () {
  var NS = 'http://www.w3.org/2000/svg';

  /* ---- RULE 1 · wobble, not jitter ---- */
  var wj = {};
  document.querySelectorAll('[data-wj]').forEach(function (btn) {
    var kind = btn.dataset.wj, t = btn.querySelector('.wj-t');
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('width', 1); svg.setAttribute('height', 1);
    svg.style.cssText = 'position:absolute;left:0;top:0;overflow:visible;pointer-events:none';
    btn.appendChild(svg);
    var ghosts = document.createElementNS(NS, 'g'); svg.appendChild(ghosts);
    var s = { btn: btn, t: t, svg: svg, ghosts: ghosts, live: null, n: 0, kind: kind, counter: document.querySelector('[data-wj-n="' + kind + '"]') };
    wj[kind] = s;

    function d() {
      var seed = kind === 'seeded' ? t.textContent.trim() : Math.random() * 1e9;   // the anti-pattern: a new hand every time
      return { d: PenMarks.loop(t.offsetWidth, t.offsetHeight, seed, { pad: 7 }), x: t.offsetLeft, y: t.offsetTop };
    }
    s.show = function () {
      if (s.live) return;
      var g = d(), p = Pen.path(g.d, { color: 'var(--mark)', width: 2.2 });
      p.setAttribute('transform', 'translate(' + g.x + ' ' + g.y + ')');
      svg.appendChild(p); s.live = p; Pen.draw(p);
    };
    s.hide = function () {
      var p = s.live; if (!p) return; s.live = null;
      var ghost = p.cloneNode(); ghost.style.cssText = ''; ghost.setAttribute('stroke', 'var(--pencil)');
      ghost.setAttribute('stroke-width', 1.1); ghost.setAttribute('opacity', .38); ghosts.appendChild(ghost);
      s.n++; s.counter.textContent = s.n + (s.n === 1 ? ' pass' : ' passes');
      var a = Pen.erase(p);
      if (a) a.onfinish = function () { p.remove(); }; else p.remove();
    };
    s.clear = function () { ghosts.innerHTML = ''; s.n = 0; s.counter.textContent = '0 passes'; };

    btn.addEventListener('pointerenter', function (e) { if (e.pointerType !== 'touch') s.show(); });
    btn.addEventListener('pointerleave', function (e) { if (e.pointerType !== 'touch') s.hide(); });
    btn.addEventListener('focus', function () { if (btn.matches(':focus-visible')) s.show(); });
    btn.addEventListener('blur', s.hide);
    btn.addEventListener('click', function (e) { if (e.pointerType === 'touch' || e.detail === 0) { if (s.live) s.hide(); else s.show(); } });
  });

  var auto = [];
  window.wjAuto = function () {
    auto.forEach(clearTimeout); auto = [];
    Object.keys(wj).forEach(function (k) { wj[k].hide(); wj[k].clear(); });
    for (var i = 0; i < 5; i++) (function (i) {
      auto.push(setTimeout(function () { Object.keys(wj).forEach(function (k) { wj[k].show(); }); }, 200 + i * 1000));
      auto.push(setTimeout(function () { Object.keys(wj).forEach(function (k) { wj[k].hide(); }); }, 200 + i * 1000 + 720));
    })(i);
  };
  window.wjClear = function () { auto.forEach(clearTimeout); auto = []; Object.keys(wj).forEach(function (k) { wj[k].hide(); wj[k].clear(); }); };

  /* ---- RULE 2 · timing ---- */
  var SPECS = {
    tick: { kind: 'tick', color: 'var(--ink)', size: 12 },
    underline: { kind: 'underline', color: 'var(--mark)', gap: 2 },
    loop: { kind: 'loop', color: 'var(--mark)', pad: 5 }
  };
  var tm = [];
  document.querySelectorAll('[data-tm]').forEach(function (el) {
    var k = el.dataset.tm, m = new PenMarks.Mark(el, el.querySelector('.tm-t'), SPECS[k]);
    m.label = document.querySelector('[data-tm-ms="' + k + '"]');
    m.kindName = k;
    tm.push(m);
  });
  function label() {
    tm.forEach(function (m) {
      var L = Math.round(m.paths.reduce(function (s, p) { return s + p._L; }, 0));
      m.label.textContent = m.kindName + ' · ' + L + 'px → ' + Math.round(m.duration()) + ' ms · retract 200 ms';
    });
  }
  function relayout() { tm.forEach(function (m) { m.build(); }); label(); }
  window.tmPlay = function () {
    tm.forEach(function (m) { m.hide(true); });
    requestAnimationFrame(function () { tm.forEach(function (m) { m.show(); }); });
  };
  tm.forEach(function (m) { m.show(true); });
  label();
  if (document.fonts) document.fonts.ready.then(relayout);
  var tmio = new IntersectionObserver(function (es) {
    if (es[0].isIntersecting) { window.tmPlay(); tmio.disconnect(); }
  }, { threshold: .6 });
  var tmBox = document.querySelector('.tm'); if (tmBox) tmio.observe(tmBox);
  window.addEventListener('resize', function () { requestAnimationFrame(relayout); });
})();
