/* R3 · board 10 — one live stage for the opener (1440 / 390 · first visit / returning), the beats with their
   timings, and a replay. The opener itself is r3-10-opener-page.html, played in an iframe at its real size. */
(function () {
  var BEATS = [
    ['0.00', 'Name beat a, 一字一切 (round 2’s, unchanged): 弗 two ticks, then 雷 and 德 quicker, then <b>FRED</b> on ink. Each is alone and full-bleed, on the 12 fps held-pose clock.'],
    ['0.50', 'Fred, caught mid-OP: 关于 <i>about!</i> on coral, his portrait neutral, then the “surprised” frame.'],
    ['0.67', 'The laptop whips in (one smear frame) and lands: 在造 <i>building!</i> · 0.92 在拍 <i>shooting!</i> 咔嚓, a drawn yolk burst behind the camera · 1.08 在写 <i>writing!</i>, the book turns its own page.'],
    ['1.25', 'The bird gets the full hero close-up (focus lines, ticks)… and does nothing. “…”'],
    ['1.50', '<b>Hard cut to silence.</b> The empty cream desk, and the same bird on it, small, facing the empty table. (On a phone it’s a mid shot on the bird, then a cut to the wide at 1.65.)'],
    ['1.90', 'The fall, straight away. The laptop thuds down: the table shakes and the caret blinks on · 2.06 the mug, one puff of steam · 2.18 the book slaps flat and a page lifts · 2.28 the portrait lands <b>face-down</b> · 2.36 the camera, 咔嚓 and one local flash · 2.43 the plant, and its leaf wobbles.'],
    ['2.61', 'A beat after the last landing, the portrait <b>pops itself upright</b>, surprised: its own take, and nothing knocked it. The bird hasn’t moved.'],
    ['2.85', 'Hard cut to the eyecatch: the bird alone on cream over <b>日常 · ep.27</b> (27 essays on the shelf). It blinks once. <i>(Removable: 0.4 s.)</i>'],
    ['3.26', 'Hard cut to the live desk. The page chrome rises, the arrows draw, and the ep card stays as a quiet corner label.'],
    ['return', 'Same session: no OP, no card. The page opens on the empty desk with the bird on it and the objects already falling into the page’s own layout. Back row first (laptop 0.20 · plant 0.24 · portrait face-down 0.28), then the front row (mug 0.33 · camera 0.37 · book 0.41), and the portrait pops up at 0.39. It dissolves into the live desk at <b>0.66 s</b> after the desk is ready (0.68 s measured from first paint).'],
    ['cold', 'The OP always runs on time. If the bytes aren’t in at the cut, the desk holds, still. After 1.5 s it says “tap to skip · 点按跳过”, and nothing else. The fall starts the moment the last byte decodes. The opener is over by 6.5 s: in by 4.75 s → the full fall and the card; by 5.84 s → a cut to the page’s framing and the short fall; later → the page fades in as a page.']
  ];

  var ol = document.getElementById('beats');
  BEATS.forEach(function (b) { var li = document.createElement('li'); li.innerHTML = '<span class="t">' + b[0] + '</span>' + b[1]; ol.appendChild(li); });

  // ---- the live stage ----
  var st = { v: 'desk', m: 'first' }, screen = document.getElementById('screen'), frame = null, seen = false, cand = document.getElementById('cand-op');
  var full = document.getElementById('full');
  function url() { return 'r3-10-opener-page.html?mode=' + st.m; }
  function fit() {
    if (!frame) return;
    if (st.v === 'desk') { var s = screen.clientWidth / 1440; frame.style.width = '1440px'; frame.style.height = '900px'; frame.style.transform = 'scale(' + s + ')'; }
    else { var d = screen.querySelector('.device'), s2 = d.clientHeight / 844; frame.style.width = '390px'; frame.style.height = '844px'; frame.style.transform = 'scale(' + s2 + ')'; }
  }
  function play() {
    seen = true;
    screen.innerHTML = '';
    screen.classList.toggle('phone', st.v === 'phone');
    var box = screen;
    if (st.v === 'phone') { box = document.createElement('div'); box.className = 'device'; screen.appendChild(box); }
    frame = document.createElement('iframe');
    frame.title = 'Opener preview, ' + (st.m === 'first' ? 'first visit' : 'returning') + ', ' + (st.v === 'desk' ? '1440 wide' : '390 wide');
    frame.src = url() + '&ctl=0&r=' + Date.now();
    box.appendChild(frame);
    full.href = url();
    fit();
  }
  window.replayOpener = play;
  function sync() {
    cand.querySelectorAll('[data-v]').forEach(function (x) { x.setAttribute('aria-pressed', String(x.dataset.v === st.v)); });
    cand.querySelectorAll('[data-m]').forEach(function (x) { x.setAttribute('aria-pressed', String(x.dataset.m === st.m)); });
  }
  screen.addEventListener('click', function (e) { if (e.target.closest('.poster')) play(); });
  cand.querySelector('[data-play]').addEventListener('click', play);
  cand.querySelectorAll('[data-v],[data-m]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (b.dataset.v) st.v = b.dataset.v; if (b.dataset.m) st.m = b.dataset.m;
      sync(); play();
    });
  });
  addEventListener('resize', fit);
  new IntersectionObserver(function (es, io) { if (es[0].isIntersecting && !seen) { io.disconnect(); play(); } }, { threshold: .6 }).observe(screen);
  document.addEventListener('mock:rm', function () { if (seen) play(); });
})();
