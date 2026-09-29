/* r2-08a-board.js — the essay picker, the iframe that holds the real Reading page, the reduced-motion bridge,
   the "scroll the hero for me" demo, and the live readout of the layout plan for the frame's current size. */
(function () {
  var IDS = ['2026-08-29_google-just-wants-to-coast-to-a-win', '2019-12-29_salvation-mountain', '2023-05-27_a-tale-of-three-cities',
    '2026-05-02_the-god-in-the-edit', '2024-04-23_hong-kong-forest', '2015-05-09_go-south-go-south', '2019-01-09_he-and-his-cat'];
  var POSTS = (window.FY_POSTS || []).filter(function (p) { return IDS.indexOf(p.id) >= 0; })
    .sort(function (a, b) { return IDS.indexOf(a.id) - IDS.indexOf(b.id); });
  var picker = document.querySelector('.picker'), frame = document.getElementById('ad-frame'), open = document.getElementById('ad-open');
  var stage = document.querySelector('.ad-stage');
  var st = { id: IDS[0], lang: 'zh', marks: {} };

  // one line describing what the pencil margin found in each essay (Chinese text; the rail uses the reader's language)
  function describe(p) {
    var r = Landmarks.build(p.htmlZh, p.readingMin, 'x-'), m = r.marks, n = m.length;
    var mins = m.filter(function (x) { return x.kind === 'min'; }), struct = m.filter(function (x) { return x.kind !== 'min'; });
    var s = r.kind === 'sections' ? struct[0].label + ' … ' + struct[struct.length - 1].label + ' · ' + n + ' sections'
      : r.kind === 'headings' ? struct.map(function (x) { return x.label; }).join(' / ') + ' · headings'
      : r.kind.indexOf('+minutes') > 0 ? struct.map(function (x) { return x.label; }).join(' / ') + ' + ' + mins.length + ' minute ticks'
      : 'no structure → ' + n + ' minute ticks';
    return s + ' · ' + p.readingMin + ' min';
  }
  picker.innerHTML = POSTS.map(function (p, i) {
    return '<button class="pk" type="button" role="radio" aria-checked="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '" data-id="' + p.id + '">' +
      '<span class="pk-t">' + p.titleZh + '<small>' + p.title + '</small></span><span class="pk-s">' + describe(p) + '</span></button>';
  }).join('');
  var btns = [].slice.call(picker.querySelectorAll('.pk')), marks = btns.map(function (b) {
    return Pen.annotate(b.querySelector('.pk-t'), 'underline', { manual: true, color: 'var(--ink)', width: 1.6, seed: 'pk-' + b.dataset.id, gap: 2 });
  });

  function src() { return 'r2-08a-page.html?post=' + encodeURIComponent(st.id) + '&lang=' + st.lang; }
  function select(i, focus) {
    btns.forEach(function (b, j) { b.setAttribute('aria-checked', String(i === j)); b.tabIndex = i === j ? 0 : -1; if (i !== j) marks[j].hide(); });
    marks[i].show(); if (focus) btns[i].focus();
    if (st.id !== btns[i].dataset.id || !frame.dataset.ready) { st.id = btns[i].dataset.id; frame.dataset.ready = '1'; frame.src = src(); stage.classList.remove('scrolled'); }
    open.href = src();
  }
  picker.addEventListener('click', function (e) { var b = e.target.closest('.pk'); if (b) select(btns.indexOf(b)); });
  picker.addEventListener('keydown', function (e) {
    var i = btns.indexOf(document.activeElement); if (i < 0) return;
    var j = /Right|Down/.test(e.key) ? i + 1 : /Left|Up/.test(e.key) ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? btns.length - 1 : -9;
    if (j === -9) return;
    e.preventDefault(); select((j + btns.length) % btns.length, true);
  });

  // the page runs in a real window: forward the board's reduced-motion switch, and read back its geometry
  function win() { return frame.contentWindow; }
  function rm() { return document.documentElement.classList.contains('rm'); }
  document.addEventListener('mock:rm', function (e) { if (win()) win().postMessage({ type: 'rm', on: !!e.detail }, '*'); });
  window.addEventListener('message', function (e) {
    if (e.source !== win() || !e.data) return;
    if (e.data.type === 'lang') { st.lang = e.data.lang; open.href = src(); setTimeout(readout, 120); }
  });
  frame.addEventListener('load', function () {
    if (rm()) win().postMessage({ type: 'rm', on: true }, '*');
    win().addEventListener('scroll', function () { if (win().scrollY > 40) stage.classList.add('scrolled'); }, { passive: true });
    win().addEventListener('resize', function () { clearTimeout(st.t); st.t = setTimeout(readout, 250); });
    setTimeout(readout, 400);
  });
  function readout() {
    var w = win(); if (!w || !w.RP || !w.RP.g.b0) return;
    var g = w.RP.g, R = w.__rail || {}, H = w.__hero || {};
    var vals = {
      nav: g.n0 + ' → ' + g.n1, pad: g.pad + (g.pad === g.n1 + 28 ? ' (= n1 + 28)' : ''), z: g.z + ' · ' + g.cell + ' · ' + g.cell * 2, gap: g.gap,
      b0: g.b0 + (H.f && H.f.multi ? ' (' + H.f.lines.length + '-line title)' : ' (1-line title)'), sl: g.sL,
      k: H.f ? '×' + H.f.k.toFixed(2) : '', rail: R.mode === 'rail' ? (g.n1 + 28) + ' · ' + R.H : 'strip on the nav hairline',
      marks: w.RP.kind() + ': ' + w.RP.marks().map(function (m) { return m.label; }).join(' · ')
    };
    document.querySelectorAll('.plan-t td[data-k]').forEach(function (td) { td.textContent = vals[td.dataset.k] == null ? '' : String(vals[td.dataset.k]); });
    var head = document.querySelector('.plan-t thead th:last-child');
    head.textContent = 'this frame, live · ' + g.vw + ' × ' + g.vh;
  }

  // demos: a slow, even scroll through the hero and past the landing, so the event can be watched hands-free
  window.replaySlow = function () {
    var w = win(); if (!w || !w.RP) return;
    var to = w.RP.g.sL + 160, from = 0, dur = 3600, t0 = 0;
    w.scrollTo(0, 0);
    if (rm()) { w.scrollTo(0, to); return; }
    function step(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / dur), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      w.scrollTo(0, from + (to - from) * e);
      if (k < 1) requestAnimationFrame(step);
    }
    setTimeout(function () { requestAnimationFrame(step); }, 250);
  };
  window.replayTop = function () { var w = win(); if (w) w.scrollTo({ top: 0, behavior: rm() ? 'auto' : 'smooth' }); };

  select(0);
})();
