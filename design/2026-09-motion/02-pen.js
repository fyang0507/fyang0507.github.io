/* Board 02 — four candidate state grammars applied to one identical UI slice.
   Every interactive element ([data-pen]) owns up to three marks:
     hover   — drawn on pointer enter, retracted on leave (never for touch)
     persist — the current page (nav) or the selected filter; drawn on arrival, stays
     focus   — keyboard only (:focus-visible), additive
   Rule shared by all grammars: hover never re-marks something already marked. */
(function () {
  var CORAL = 'var(--mark)', INK = 'var(--ink)', PENCIL = 'var(--pencil)';
  var WHEAT = 'var(--wash-wheat)', PEACH = 'var(--wash-peach)';
  var Mark = PenMarks.Mark;

  // C · where the pointing arrow comes from, in the target box's frame. Always from above-left,
  // like the home desk's annotations, landing just short of the thing it means.
  function arrowFrom(role) {
    return function (b) {
      if (role === 'nav') return { a: [b.x - 14, b.y - 22], b: [b.x + b.w * .3, b.y + 5], bend: .3, head: 8 };
      if (role === 'link') return { a: [b.x - 11, b.y - 12], b: [b.x + 2, b.y + 3], bend: .32, head: 5.5 };
      return { a: [b.x - 13, b.y - 17], b: [b.x + 3, b.y + 2], bend: .3, head: 6.5 };
    };
  }

  var GRAMMARS = {
    a: {
      hover: function (role) { return { kind: 'loop', color: CORAL, pad: role === 'nav' ? 6 : role === 'link' ? 3 : role === 'action' ? 7 : 5 }; },
      focus: function (role) { return { kind: 'loop', color: INK, pad: role === 'nav' ? 11 : role === 'link' ? 7 : role === 'action' ? 12 : 10, tag: 'focus' }; },
      selected: 'hover', current: 'hover',
      legend: ['coral loop, one pass · retracts on leave', 'ink loop, outside the coral · keyboard only', 'the hover loop simply stays', 'a loop stays around where you are']
    },
    b: {
      hover: function (role) { return { kind: 'underline', color: CORAL, gap: role === 'nav' ? 1 : 2 }; },
      focus: function (role) { return { kind: 'corners', color: INK, gap: role === 'link' ? 2 : 4 }; },
      selected: function () { return { kind: 'tick', color: INK, size: 12 }; },
      current: function () { return { kind: 'scribble', color: CORAL, passes: 2, gap: 1 }; },
      legend: ['coral underline that lifts at the end', 'ink corner brackets 「 」 · keyboard only', 'an ink tick, like ticking a form', 'coral scribble — the identity stroke']
    },
    c: {
      target: { nav: '.pn-obj' },
      hover: function (role) { return { kind: 'arrow', color: PENCIL, width: 1.9, from: arrowFrom(role) }; },
      focus: function (role) { return { kind: 'arrow', color: INK, width: 1.9, from: arrowFrom(role) }; },
      selected: function () { return { kind: 'brackets', color: INK }; },
      current: function (role) { return { kind: 'arrow', color: CORAL, width: 1.9, from: arrowFrom(role) }; },
      legend: ['a pencil arrow swings in from above', 'the same arrow, in ink · keyboard only', 'ink brackets hold the choice', 'a coral arrow, held on the object']
    },
    d: {
      hover: function (role) { return role === 'nav' ? { kind: 'band', fill: WHEAT, top: -.08, bot: 1.06, over: 5 } : { kind: 'band', fill: WHEAT }; },
      focus: function (role) { return { kind: 'underline', color: INK, gap: role === 'nav' ? 1 : 2 }; },
      selected: 'hover',
      current: function () { return { kind: 'band', fill: PEACH, top: -.08, bot: 1.06, over: 5 }; },
      legend: ['wheat band swept in behind, left → right', 'an ink underline — a wash can\'t show focus', 'the band stays', 'a peach band stays on the current page']
    }
  };
  var STATES = [['hover', '悬停'], ['focus', '焦点'], ['selected', '选中'], ['current', '当前']];

  var stages = [];

  function specFor(g, state, role) {
    var s = g[state];
    return s === 'hover' ? g.hover(role) : s(role);
  }

  function refresh(it, instant) {
    var marked = !!it.persistOn, h = !!it.hovered && !marked;
    if (it.persist === it.hover) it.hover && it.hover.set(h || marked, instant);
    else {
      if (it.hover) it.hover.set(h, instant);
      if (it.persist) it.persist.set(marked, instant);
    }
    if (it.focus) it.focus.set(!!it.focused, instant);
    it.host.classList.toggle('is-hover', h);
    it.host.classList.toggle('is-marked', marked);
    it.host.classList.toggle('is-focus', !!it.focused);
  }

  function buildItem(st, host) {
    var g = st.g, role = host.dataset.pen, it = { host: host, role: role, st: st };
    it.persistOn = role === 'nav' ? host.getAttribute('aria-current') === 'page' : role === 'filter' ? host.getAttribute('aria-pressed') === 'true' : false;
    if (!g) return it;
    var sel = (g.target && g.target[role]) || '.pen-t';
    var target = role === 'filter' || role === 'link' ? host : (host.querySelector(sel) || host);
    it.hover = new Mark(host, target, g.hover(role));
    it.focus = new Mark(host, target, g.focus(role));
    var state = role === 'nav' ? 'current' : role === 'filter' ? 'selected' : null;
    if (state) it.persist = g[state] === 'hover' ? it.hover : new Mark(host, target, specFor(g, state, role));
    return it;
  }

  function wire(it) {
    var host = it.host;
    host.addEventListener('pointerenter', function (e) { if (e.pointerType === 'touch') return; it.hovered = true; refresh(it); });
    host.addEventListener('pointerleave', function () { it.hovered = false; refresh(it); });
    host.addEventListener('focus', function () { it.focused = host.matches(':focus-visible'); refresh(it); });
    host.addEventListener('blur', function () { it.focused = false; refresh(it); });
    host.addEventListener('click', function (e) {
      if (host.tagName === 'A') e.preventDefault();       // the specimen never leaves the board
      if (it.role === 'nav') setPersist(it.st, 'nav', it);
      else if (it.role === 'filter') setPersist(it.st, 'filter', it);
      else if (it.role === 'action') loadMore(host);
    });
  }

  // Current page / selected filter move: the old mark retracts, the new one draws.
  function setPersist(st, role, it) {
    if (it.persistOn) return;
    st.items.forEach(function (o) {
      if (o.role !== role || !o.persistOn) return;
      o.persistOn = false;
      if (role === 'nav') o.host.removeAttribute('aria-current'); else o.host.setAttribute('aria-pressed', 'false');
      if (st.g) refresh(o);
    });
    it.persistOn = true;
    if (role === 'nav') it.host.setAttribute('aria-current', 'page'); else it.host.setAttribute('aria-pressed', 'true');
    if (st.g) refresh(it);
  }

  function loadMore(host) {
    var n = host.querySelector('[data-remaining]'), left = +n.dataset.remaining - 6;
    if (left < 0) left = 12;
    n.dataset.remaining = left;
    n.textContent = left ? left + ' remaining · 还剩 ' + left + ' 张' : 'all hung · 全部晾完';
  }

  function buildLegend(st) {
    var box = st.el.querySelector('.pn-legend'), g = st.g;
    st.legend = STATES.map(function (s, i) {
      var cell = document.createElement('div');
      cell.className = 'lg';
      cell.innerHTML = '<span class="lg-w"><span class="en">' + s[0] + '</span><span class="zh">' + s[1] + '</span></span><p class="lg-note">' + g.legend[i] + '</p>';
      box.appendChild(cell);
      var w = cell.querySelector('.lg-w'), m = new Mark(w, w, specFor(g, s[0], 'legend'));
      m.show(true);
      return m;
    });
  }

  function initStage(el) {
    var key = el.dataset.grammar, g = GRAMMARS[key] || null;
    el.appendChild(document.getElementById('slice').content.cloneNode(true));
    el.classList.add('g-' + key);
    var st = { el: el, key: key, g: g, arrived: false, timers: [] };
    st.items = [].map.call(el.querySelectorAll('[data-pen]'), function (h) { return buildItem(st, h); });
    st.items.forEach(wire);
    if (g) buildLegend(st);
    stages.push(st);
    return st;
  }

  // Arrival: the current page and the selected filter are drawn once, when the page is seen.
  function arrive(st) {
    st.arrived = true;
    st.items.forEach(function (it, i) { if (it.persistOn) setTimeout(function () { refresh(it); }, 180 + i * 40); });
  }

  function rebuild(st) {
    st.items.forEach(function (it) { [it.hover, it.persist, it.focus].forEach(function (m, i, arr) { if (m && arr.indexOf(m) === i) m.build(); }); });
    (st.legend || []).forEach(function (m) { m.build(); });
  }

  function reset(st) {
    st.timers.forEach(clearTimeout); st.timers = [];
    st.items.forEach(function (it) {
      var initial = it.role === 'nav' ? /Writing/.test(it.host.getAttribute('href')) : it.role === 'filter' ? it === firstFilter(st) : false;
      it.hovered = false; it.focused = false; it.persistOn = initial;
      if (it.role === 'nav') { if (initial) it.host.setAttribute('aria-current', 'page'); else it.host.removeAttribute('aria-current'); }
      if (it.role === 'filter') it.host.setAttribute('aria-pressed', initial ? 'true' : 'false');
      [it.hover, it.persist, it.focus].forEach(function (m) { if (m) m.hide(true); });
      it.host.classList.remove('is-hover', 'is-marked', 'is-focus');
    });
    var n = st.el.querySelector('[data-remaining]'); n.dataset.remaining = 12; n.textContent = '12 remaining · 还剩 12 张';
  }
  function firstFilter(st) { return st.items.filter(function (i) { return i.role === 'filter'; })[0]; }
  function find(st, role, text) { return st.items.filter(function (i) { return i.role === role && i.host.textContent.indexOf(text) > -1; })[0]; }

  // Replay: arrive, then walk through hover → prose hover → keyboard focus → tap-select → action.
  function tour(st) {
    reset(st);
    var T = function (ms, fn) { st.timers.push(setTimeout(fn, ms)); };
    T(120, function () { arrive(st); });
    var nav = find(st, 'nav', 'building'), link = find(st, 'link', 'Ox Alpha'), poem = find(st, 'filter', 'poem'), act = find(st, 'action', 'Load');
    T(1200, function () { nav.hovered = true; refresh(nav); });
    T(2100, function () { nav.hovered = false; refresh(nav); });
    T(2400, function () { link.hovered = true; refresh(link); });
    T(3200, function () { link.hovered = false; refresh(link); });
    T(3500, function () { poem.focused = true; refresh(poem); });
    T(4400, function () { setPersist(st, 'filter', poem); });
    T(5300, function () { poem.focused = false; refresh(poem); });
    T(5600, function () { act.hovered = true; refresh(act); });
    T(6500, function () { act.hovered = false; refresh(act); });
  }

  document.querySelectorAll('.spec-stage').forEach(initStage);

  ['a', 'b', 'c', 'd'].forEach(function (k) {
    window['replay' + k.toUpperCase()] = function () { var st = stages.filter(function (s) { return s.key === k; })[0]; if (st) tour(st); };
  });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var st = stages.filter(function (s) { return s.el === e.target; })[0];
      if (st && !st.arrived && st.g) arrive(st);
      io.unobserve(e.target);
    });
  }, { threshold: .35 });
  stages.forEach(function (st) { if (st.g) io.observe(st.el); });

  var ro = new ResizeObserver(function (entries) {
    entries.forEach(function (e) {
      var st = stages.filter(function (s) { return s.el === e.target; })[0];
      var w = Math.round(e.contentRect.width);
      if (!st || !st.g || st.w === w) return;
      st.w = w; requestAnimationFrame(function () { rebuild(st); });
    });
  });
  stages.forEach(function (st) { ro.observe(st.el); });
  if (document.fonts) document.fonts.ready.then(function () { stages.forEach(function (st) { if (st.g) rebuild(st); }); });

  // Reduced-motion preview toggled: settle every mark into its end state.
  document.addEventListener('mock:rm', function () {
    stages.forEach(function (st) { st.items.forEach(function (it) { [it.hover, it.persist, it.focus].forEach(function (m) { if (m) m[m.on ? 'show' : 'hide'](true); }); }); });
  });

  window.PenBoard = { stages: stages, refresh: refresh, setPersist: setPersist, find: find };
})();
