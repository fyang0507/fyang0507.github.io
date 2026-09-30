/* 01-identity.js — mounts a candidate into the real .site-identity link (round 1).
   The link stays one link to index.html. Its accessible name comes from visually hidden text with lang spans (so
   弗雷德 and the motto are read in Chinese, not spelled out by an English voice), and carries the motto's English
   echo; the drawing is aria-hidden. The pen's states come from Tier.wire, as on every nav link: hover draws the
   coral underline from the name's baseline, keyboard focus draws coral 「 」, a press sinks into the wheat band.
   The arrival (write / stamp) has one cause: the end of a first visit's OP on home (opx:done). Nowhere else. */
(function () {
  'use strict';
  var SR = 'Fred Yang, <span lang="zh">弗雷德</span>. <span lang="zh">继续写，继续造</span>: keep writing, keep making. Home';
  var phone = matchMedia('(max-width:640px)');

  function mount(link, key, o) {
    o = o || {};
    var C = window.IDC[key], api = { key: key, link: link };
    if (!C) return api;   // 'now': the lockup as it ships today, untouched
    var wire = null, built = null;
    function render() {
      if (wire) { wire.destroy(); wire = null; }
      link.removeAttribute('aria-label');
      link.className = 'site-identity';
      link.innerHTML = '<span class="id-sr">' + SR + '</span>';
      built = C.build(link, phone.matches ? 'phone' : 'wide');
      built.target.setAttribute('data-pen-seed', 'Fred Yang');
      if (window.Tier && window.Pen) wire = Tier.wire(link, { target: built.target, focus: { on: 'host', gap: 1, gy: 1 } });
      api.wire = wire; api.built = built;
    }
    render();
    phone.addEventListener('change', render);
    api.arrive = function () { return built.arrive(); };
    api.blank = function () { IDK.blank(built.paths); };
    // forced states for the board's still frames
    api.state = function (s) {
      if (!wire) return;
      wire.mark.to(s === 'hover' ? 1 : s === 'press' ? 2 : 0, 'instant');
      if (wire.focus) wire.focus.set(s === 'focus', true);
    };
    // home: under a first visit's OP the page is covered; the identity is written (or stamped) as the OP ends. A
    // visitor who skipped the OP asked for the page, so it is simply there.
    var html = document.documentElement, covered = false;
    function watchOP() {
      var op = html.classList.contains('opening') && !html.classList.contains('ret');
      if (op && !covered) { covered = true; api.blank(); }
    }
    if (o.home) {
      watchOP();
      new MutationObserver(watchOP).observe(html, { attributes: true, attributeFilter: ['class'] });
      document.addEventListener('opx:done', function (e) {
        if (!covered) return;
        covered = false;
        if (e.detail && e.detail.mode === 'first' && !e.detail.skipped) api.arrive(); else IDK.show(built.paths);
      });
    }
    return api;
  }

  window.IDC = window.IDC || {};
  window.IDC.mount = mount;
})();
