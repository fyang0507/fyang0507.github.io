/* R2 · board 10 — one live stage for the combined opener (1440 / 390 · first / returning · name a | b | c),
   then the three name beats as cards, each with a filmstrip of its frames and its flash audit. */
(function () {
  var BEATS = [
    ['0.00', 'The name beat (a | b | c, below), 0.5 s on the 12 fps held-pose clock.'],
    ['0.50', 'Fred, caught mid-OP: 关于 <i>about!</i> on coral, his portrait neutral, then the “surprised” frame.'],
    ['0.67', 'The laptop whips in (one smear frame, speed lines from the edge it came through) and lands: 在造 <i>building!</i> with focus lines.'],
    ['0.92', '在拍 <i>shooting!</i> The flash is a drawn yolk burst behind the camera, 咔嚓 <i>click!</i> Never a white-out.'],
    ['1.08', '在写 <i>writing!</i> The book turns its own page, one sprite frame per tick.'],
    ['1.25', 'The bird gets the full hero close-up (focus lines, ticks)… and does nothing. “…”'],
    ['1.50', '<b>Hard cut to silence.</b> The empty cream desk; the same bird, already there, head down, staring at a coral pen line that fills with the real bytes (the label states the real number).'],
    ['~2.0', 'The line is full; one beat; the bird pecks it. It snaps like elastic and the pen takes the halves back.'],
    ['2.5–3.0', 'The drum fill: laptop (the table shakes, the caret blinks on), mug (a puff of steam), book (slaps flat, a page lifts), frame (face-down), camera (咔嚓, one local flash), plant (the leaf wobbles), and the portrait jolts upright, surprised.'],
    ['3.27', 'Hard cut to the eyecatch: the bird alone on cream over <b>日常 · ep.27</b> (27 essays on the shelf). It blinks once.'],
    ['3.68', 'Hard cut to the live desk, swapped in pixel-identical underneath. The page chrome rises and the ep card stays as a quiet corner label.'],
    ['return', 'Same session: the variant’s payoff frame and the bird’s “…” (two cuts, 0.25 s); the desk is already set and only the plant drops in; card; live. 0.68 s.']
  ];
  var NAMES = [
    { k: 'a', pick: true, name: '一字一切', en: 'one character per cut', mech: '弗 2 · 雷 1 · 德 1 · FRED 2 ticks',
      text: '弗, 雷, 德: one character per cut, each alone and full-bleed, each with its own mark family (landing ticks · a drawn thunder zigzag for 雷 · focus lines). Then FRED lands on ink as the payoff. An accelerating drum, bilingual across the sequence and never inside a frame. On a phone, FRED turns on its side to fill the height.',
      audit: 'A (WCAG area) ≤ 2.5 · B (tile mean) ≤ 2.5 · returning ≤ 0.5' },
    { k: 'b', name: '对撞', en: 'the collision', mech: 'enter 1 · smear 1 · impact 1 · hold 3 ticks',
      text: '弗雷德 enters from one edge and FRED from the other over speed lines; one smear frame; then the impact frame, both squashed into each other over a paper-white burst. The burst settles into a smaller dent behind the lockup and the two words hold, interlocked and tipped by the hit. On a phone they meet top and bottom.',
      audit: 'A ≤ 2.5 · B ≤ 2.5 · returning ≤ 1.0' },
    { k: 'c', name: '书脊', en: 'the spine title', mech: 'one poster · drop 1 · stand 5 ticks',
      text: 'One bold poster held for the whole beat. 弗雷德 set vertically beside FRED set on its side, a book-spine title with a yolk double rule, and the bird printed at its foot as the publisher’s colophon. It drops onto a shelf (one tick mid-fall), lands with dust ticks, and stands in focus lines. It rhymes with the Writing shelf.',
      audit: 'A ≤ 1.5 · B ≤ 2.5 · returning ≤ 0.5 (the calmest)' }
  ];

  var ol = document.getElementById('beats');
  BEATS.forEach(function (b) { var li = document.createElement('li'); li.innerHTML = '<span class="t">' + b[0] + '</span>' + b[1]; ol.appendChild(li); });

  // ---- the live stage ----
  var st = { v: 'desk', m: 'first', n: 'a' }, screen = document.getElementById('screen'), frame = null, seen = false, cand = document.getElementById('cand-cd');
  var full = document.getElementById('full');
  function url() { return 'r2-10-opener-cd.html?mode=' + st.m + '&name=' + st.n; }
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
    frame.title = 'C → D opener preview, name beat ' + st.n;
    frame.src = url() + '&ctl=0&r=' + Date.now();
    box.appendChild(frame);
    full.href = url();
    fit();
  }
  function sync() {
    cand.querySelectorAll('[data-v]').forEach(function (x) { x.setAttribute('aria-pressed', String(x.dataset.v === st.v)); });
    cand.querySelectorAll('[data-m]').forEach(function (x) { x.setAttribute('aria-pressed', String(x.dataset.m === st.m)); });
    cand.querySelectorAll('[data-n]').forEach(function (x) { x.setAttribute('aria-pressed', String(x.dataset.n === st.n)); });
  }
  screen.addEventListener('click', function (e) { if (e.target.closest('.poster')) play(); });
  cand.querySelector('[data-play]').addEventListener('click', play);
  cand.querySelectorAll('[data-v],[data-m],[data-n]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (b.dataset.v) st.v = b.dataset.v; if (b.dataset.m) st.m = b.dataset.m; if (b.dataset.n) st.n = b.dataset.n;
      sync(); play();
    });
  });
  addEventListener('resize', fit);
  new IntersectionObserver(function (es, io) { if (es[0].isIntersecting && !seen) { io.disconnect(); play(); } }, { threshold: .6 }).observe(screen);
  document.addEventListener('mock:rm', function () { if (seen) play(); });

  // ---- the three name beats ----
  var host = document.getElementById('names');
  NAMES.forEach(function (n) {
    var a = document.createElement('article');
    a.className = 'cand' + (n.pick ? ' pick' : ''); a.id = 'name-' + n.k;
    a.innerHTML =
      '<div class="cand-head"><span class="cand-letter">' + n.k + '</span><span class="cand-name">' + n.en + ' <span class="display-cn">' + n.name + '</span></span><span class="cand-mech">' + n.mech + '</span></div>' +
      '<img class="strip" src="assets-gen/r2-10-strip-' + n.k + '.webp" alt="Frames of name beat ' + n.k + ' at 1440 and 390" loading="lazy">' +
      '<div class="cand-foot"><div>' + n.text + '<div class="audit"><b>flashes / s</b> ' + n.audit + ' · red flashes 0</div>' +
      '<div class="row"><button type="button" data-go="' + n.k + '">▶ play in the stage ↑</button></div></div></div>';
    host.appendChild(a);
  });
  host.addEventListener('click', function (e) {
    var b = e.target.closest('[data-go]'); if (!b) return;
    st.n = b.dataset.go; st.m = 'first'; sync(); play();
    cand.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
})();
