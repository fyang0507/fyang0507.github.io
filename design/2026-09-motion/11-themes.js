/* Board 11 — the same masters rendered through role layers under any theme. */
(function () {
  var R = 'assets-gen/roles/', A = '../../assets/';
  var ROLES = {};   // filled from roles.json: { stem: { polarity: world|print|mixed, tint: bool } }
  var reduced = function () { return window.Pen ? Pen.reduced() : false; };

  function el(tag, cls, parent) { var e = document.createElement(tag); if (cls) e.className = cls; if (parent) parent.appendChild(e); return e; }
  function url(stem, k) { return 'url("' + R + stem + '-' + k + '.png")'; }
  function masks(i, list) { var v = list.join(', '); i.style.webkitMaskImage = v; i.style.maskImage = v; }

  // A role-separated illustration; frames > 1 makes it a horizontal sprite strip.
  // roles.json drives it: tint = drawn colour layer; gain = stack faint tone so it survives as chalk;
  // print = holds a toned print. On a dark field a print is reduced to chalk contour (tone dropped,
  // pupils kept dark with a chalk rim); on a light field it renders exactly as drawn.
  // Overrides for the comparison panels: pol 'world' ignores roles, pol 'print' = whole object stays
  // positive paper, opt.print 'lit' | 'line' pins one treatment. The grey tone rides on --tone (0 = pure contour).
  function art(stem, frames, pol, opt) {
    opt = opt || {};
    var a = el('span', 'art'), role = ROLES[stem] || {}, hasPrint = role.print && pol !== 'world' && pol !== 'print';
    var both = hasPrint && !opt.print, lit = both ? ' m-lit' : '', line = both ? ' m-line' : '';
    if (pol === 'print') a.classList.add('pol-print');
    ['fill', 'ink'].forEach(function (k) {
      var i = el('i', k, a);
      if (hasPrint) { i.classList.add('cut'); masks(i, [url(stem, k), url(stem, 'print')]); }
      else masks(i, [url(stem, k)]);
    });
    if (pol !== 'print' && pol !== 'world') for (var g = 1; g < (role.gain || 1); g++) masks(el('i', 'ink gain', a), [url(stem, 'ink')]);
    if (hasPrint && (both || opt.print === 'lit')) ['fill', 'ink'].forEach(function (k) {
      masks(el('i', 'p' + k + ' keep' + lit, a), [url(stem, k), url(stem, 'print')]);
    });
    if (hasPrint && (both || opt.print === 'line')) {
      masks(el('i', 'card' + line, a), [url(stem, 'print')]);
      masks(el('i', 'mass' + line, a), [url(stem, 'pmass')]);
      masks(el('i', 'ink' + line, a), [url(stem, 'pline')]);
      masks(el('i', 'ink' + line, a), [url(stem, 'pring')]);
      masks(el('i', 'ink ptone' + line, a), [url(stem, 'ptone')]);
    }
    if (role.tint) el('i', 'tint', a).style.backgroundImage = url(stem, 'tint');
    if (frames > 1) { a.style.setProperty('--msize', frames * 100 + '% 100%'); a.dataset.frames = frames; }
    return a;
  }
  // Today's raster, for comparison: the PNG exactly as the live site ships it.
  function raw(file, frames) {
    var a = el('span', 'art');
    var i = el('i', 'tint', a);
    i.style.backgroundImage = 'url("' + A + file + '")'; i.style.filter = 'none';
    if (frames > 1) { a.style.setProperty('--msize', frames * 100 + '% 100%'); a.dataset.frames = frames; }
    return a;
  }
  function frame(a, i) { var n = +a.dataset.frames; a.style.setProperty('--mpos', (n > 1 ? i * 100 / (n - 1) : 0) + '% 0'); }

  var ARROWS = ['M500 1035 Q620 1010 640 935', 'M623 957 l17 -22 5 26', 'M430 110 Q480 140 498 240', 'M483 219 l15 21 7 -25',
    'M1042 108 Q1035 225 952 342', 'M942 320 l10 24 18 -14', 'M960 1035 Q1030 1000 1040 903', 'M1026 925 l14 -22 9 25'];
  var LABELS = [['在写', 'writing', 27, 93], ['在造', 'building', 23.5, 5], ['关于', 'about', 66.5, 3.6], ['在拍', 'shooting', 60, 93]];

  function desk(mode, over) {
    over = over || {};
    var d = el('div', 'desk'), mk = mode === 'raw' ? raw : function (st, n) { var o = over[st] || over['*']; return typeof o === 'object' ? art(st, n, o.pol, o) : art(st, n, o); };
    d.appendChild(mode === 'raw' ? raw('desk-scene2-light.png') : mk('desk-scene2'));
    var book = mk(mode === 'raw' ? 'book-flip2-light.png' : 'book-flip2', 6); book.classList.add('ov', 'ov-book'); d.appendChild(book); frame(book, 0);
    var face = mk(mode === 'raw' ? 'frame-exp3-light.png' : 'frame-exp3', 4); face.classList.add('ov', 'ov-frame', 'js-face'); d.appendChild(face); frame(face, 0);
    var bird = mk(mode === 'raw' ? 'bird-strip6-light.png' : 'bird-strip6', 6); bird.classList.add('ov', 'ov-bird', 'js-bird'); d.appendChild(bird); frame(bird, 0);
    d.insertAdjacentHTML('beforeend',
      '<svg class="ov ov-steam" viewBox="0 0 100 110" aria-hidden="true"><path d="M25 92 q9 -11 0 -22 q-9 -11 0 -22"/><path d="M52 100 q10 -12 0 -24 q-10 -12 0 -24 q7 -9 3 -16"/><path d="M79 92 q9 -11 0 -22 q-9 -11 0 -22"/></svg>' +
      '<svg class="ov-arrows" viewBox="0 0 1448 1086" aria-hidden="true">' + ARROWS.map(function (p) { return '<path d="' + p + '"/>'; }).join('') + '</svg>' +
      LABELS.map(function (l) { return '<span class="lbl" style="left:' + l[2] + '%;top:' + l[3] + '%"><span class="cn">' + l[0] + '</span>' + l[1] + '</span>'; }).join('') +
      '<span class="spark" aria-hidden="true">✦</span>');
    return d;
  }
  function navstrip(mode, over) {
    over = over || {};
    var n = el('div', 'navstrip');
    [['book', 'writing'], ['laptop', 'building'], ['camera', 'shooting'], ['frame', 'about']].forEach(function (x) {
      var f = el('figure', '', n);
      var o = over['nav-' + x[0] + '@2x'] || over['*'];
      f.appendChild(mode === 'raw' ? raw('nav-' + x[0] + '-light@2x.png') : (typeof o === 'object' ? art('nav-' + x[0] + '@2x', 1, o.pol, o) : art('nav-' + x[0] + '@2x', 1, o)));
      el('figcaption', '', f).textContent = x[1];
    });
    return n;
  }

  function init() {
  // --- today: the raster on paper, and the same raster at night
  document.querySelectorAll('[data-today]').forEach(function (host) {
    var s = el('div', 'tstage ' + host.dataset.today, host);
    s.style.padding = '14px 4% 0';
    s.appendChild(desk('raw')); s.appendChild(navstrip('raw'));
  });
  // --- the four-up grid
  document.querySelectorAll('[data-theme4]').forEach(function (host) {
    var s = el('div', 'tstage ' + host.dataset.theme4, host);
    s.style.padding = '14px 4% 0';
    s.appendChild(desk('role')); s.appendChild(navstrip('role'));
  });
  // --- the big live stage
  var big = document.getElementById('big');
  if (big) {
    var s = el('div', 'tstage theme-day', big.querySelector('.slot'));
    var d = desk('role'); s.appendChild(d); s.appendChild(navstrip('role'));
    var par = el('div', 'parity', d); par.hidden = true;
    var rawImg = el('img', 'raw', par); rawImg.src = A + 'desk-scene2-light.png'; rawImg.alt = '';
    el('span', 'rule', par);
    var t1 = el('span', 'tag', par); t1.textContent = '← role layers'; t1.style.right = 'calc(100% - var(--cut,50%) + 8px)';
    var t2 = el('span', 'tag', par); t2.textContent = 'shipped PNG →'; t2.style.left = 'calc(var(--cut,50%) + 8px)';
    var btns = big.querySelectorAll('[data-set]');
    function setTheme(t) {
      s.className = 'tstage ' + t;
      btns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.set === t)); });
    }
    btns.forEach(function (b) { b.addEventListener('click', function () { par.hidden = true; pb.setAttribute('aria-pressed', 'false'); setTheme(b.dataset.set); }); });
    var pb = big.querySelector('[data-parity]');
    pb.addEventListener('click', function () {
      var on = par.hidden; par.hidden = !on; pb.setAttribute('aria-pressed', String(on));
      if (on) setTheme('theme-day');
    });
    d.addEventListener('pointermove', function (e) {
      if (par.hidden) return;
      var r = d.getBoundingClientRect();
      d.style.setProperty('--cut', Math.max(2, Math.min(98, (e.clientX - r.left) / r.width * 100)) + '%');
    });
    var cyc = null, order = ['theme-day', 'theme-night', 'theme-cyan', 'theme-riso'];
    window.replayThemes = function () {
      clearInterval(cyc); par.hidden = true; var k = 0; setTheme(order[0]);
      cyc = setInterval(function () { k++; if (k >= order.length) { clearInterval(cyc); setTheme('theme-day'); return; } setTheme(order[k]); }, 1900);
    };
  }

  // --- polarity: three treatments of the same night desk, cropped to the portrait and the book
  var OVER = { naive: { '*': 'world' }, object: { 'frame-exp3': 'print', 'book-flip2': 'print' }, lit: { 'frame-exp3': { print: 'lit' }, 'book-flip2': 'print', 'nav-book@2x': 'print' },
    line: { 'frame-exp3': { print: 'line' } } };
  window.__T = { art: art, desk: desk, navstrip: navstrip, frame: frame, OVER: OVER };   // capture hook
  document.querySelectorAll('[data-pol]').forEach(function (host) {
    var s = el('div', 'tstage theme-night polcrop', host), win = el('div', 'polwin', s);
    win.appendChild(desk('role', OVER[host.dataset.pol]));
  });
  document.querySelectorAll('[data-polfull]').forEach(function (host) {
    var s = el('div', 'tstage theme-night', host);
    s.style.padding = '14px 4% 0';
    s.appendChild(desk('role', OVER[host.dataset.polfull])); s.appendChild(navstrip('role', OVER[host.dataset.polfull]));
  });
  var lamp = document.getElementById('lamp');
  if (lamp) {
    var setLamp = function () {
      document.querySelectorAll('.theme-night').forEach(function (t) { t.style.setProperty('--lamp', lamp.value + '%'); });
      document.getElementById('lamp-v').textContent = lamp.value + '%';
    };
    lamp.addEventListener('input', setLamp); setLamp();
  }
  var tone = document.getElementById('tone');
  if (tone) {
    var setTone = function () { document.documentElement.style.setProperty('--tone', tone.value / 100); document.getElementById('tone-v').textContent = tone.value + '%'; };
    tone.addEventListener('input', setTone); setTone();
  }
  document.querySelectorAll('[data-polzoom]').forEach(function (host) {
    var o = OVER[host.dataset.polzoom]['frame-exp3'], s = el('div', 'tstage theme-night polzoom', host), f = art('frame-exp3', 4, o.pol, o);
    if (host.dataset.tone) s.style.setProperty('--tone', host.dataset.tone);
    f.classList.add('js-face'); s.appendChild(f); frame(f, 0);
  });
  }

  fetch(R + 'roles.json').then(function (r) { return r.json(); }).then(function (j) { ROLES = j; init(); });

  // --- life: bird hops and the portrait blinks, identically under every theme
  if (!reduced()) {
    setInterval(function () {
      document.querySelectorAll('.js-bird').forEach(function (b, j) {
        [1, 2, 3, 4, 5, 0].forEach(function (f, i) { setTimeout(function () { frame(b, f); }, j * 60 + i * 95); });
      });
    }, 2600);
    setInterval(function () {
      document.querySelectorAll('.js-face').forEach(function (f) { frame(f, 1); setTimeout(function () { frame(f, 0); }, 170); });
    }, 4100);
  }
})();
