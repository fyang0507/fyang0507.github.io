/* r2-05 · corkboard — faithful card renderer for the integrated A+C board and the wordmark study.
   Reproduces Building.dc.html's cards from window.BUILDING_PROJECTS, split into a rotating .swing
   (paper + tape) and a non-rotating .board-pin sibling, so the paper pivots on the pin's anchor
   (var(--pin-left) 14px, see AGENTS.md) while the pin stays in the cork.
   Round-2 change: every card has exactly one unpin trigger (the title on lead/featured, the "+" on
   slips); real links (field notes, repo) stay links. A .ghost patch sits behind each card: the cork
   under the paper, which has not faded. */
(function () {
  var esc = function (v) { return String(v).replace(/[&<>'"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]; }); };

  var projects = (window.BUILDING_PROJECTS || []).slice().sort(function (a, b) {
    var lead = Number(Boolean(b.boardLead)) - Number(Boolean(a.boardLead));
    return lead || String(b.sortDate).localeCompare(String(a.sortDate)) || a.order - b.order;
  });

  var kindOf = function (p) {
    if (p.prominence === 'highlighted') return 'lead';
    if (p.prominence === 'featured') return 'featured';
    if (p.prominence === 'agent-native') return 'instrument';
    return 'standard';
  };
  var siteHref = function (href) { return href ? '../../' + href.replace(/^\.\//, '') : null; };

  var github = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 .7a11.6 11.6 0 0 0-3.67 22.6c.58.1.8-.25.8-.56v-2.25c-3.24.71-3.92-1.38-3.92-1.38-.53-1.36-1.3-1.72-1.3-1.72-1.06-.73.08-.72.08-.72 1.17.09 1.79 1.21 1.79 1.21 1.04 1.8 2.73 1.28 3.4.98.1-.76.4-1.28.74-1.57-2.59-.3-5.31-1.3-5.31-5.78 0-1.28.45-2.32 1.2-3.14-.12-.3-.52-1.49.12-3.1 0 0 .98-.32 3.2 1.2a11 11 0 0 1 5.83 0c2.22-1.52 3.2-1.2 3.2-1.2.64 1.61.24 2.8.12 3.1.75.82 1.2 1.86 1.2 3.14 0 4.5-2.73 5.47-5.33 5.77.42.37.79 1.09.79 2.2v3.26c0 .31.21.67.8.56A11.6 11.6 0 0 0 12 .7Z"/></svg>';

  var pin = '<svg class="board-pin" viewBox="0 0 20 42" aria-hidden="true" focusable="false">' +
    '<ellipse class="pin-shadow" cx="10" cy="39" rx="5.5" ry="2.2"></ellipse><path class="pin-stem" d="M10 37 L10 9"></path>' +
    '<path class="pin-stem-glint" d="M9.2 37 L9.2 9"></path><circle class="pin-head" cx="10" cy="8" r="8"></circle>' +
    '<circle class="pin-glint" cx="7.3" cy="5.3" r="2.3"></circle></svg>';

  /* One motif per instrument, never repeated (copied from the live page). */
  var motifs = {
    'audio-processing-cli': '<svg class="instrument-motif" viewBox="0 0 34 34" aria-hidden="true"><polyline points="3 17 7 17 10 8 14 25 17.5 12 21 20 24 17 31 17"></polyline></svg>',
    'publish-cli': '<svg class="instrument-motif" viewBox="0 0 34 34" aria-hidden="true"><path d="M12 5.5 L28.5 7 L27 24.5"></path><path d="M4.5 11 L21 12.5 L19.5 30 L3 28.5 Z"></path></svg>'
  };

  var label = function (p) {
    return p.prominence ? '<div class="project-label"><span class="project-label-dot" aria-hidden="true"></span><strong>' + esc(p.prominence) + '</strong><span>' + esc(p.kind) + '</span></div>' : '';
  };
  var repoLink = function (p, cls, text) {
    return '<a class="github-link ' + cls + '" href="' + esc(p.repo) + '" target="_blank" rel="noopener noreferrer" draggable="false" aria-label="Open ' + esc(p.title) + ' on GitHub">' + github + '<span>' + text + '</span></a>';
  };
  var trigger = function (p, inner, cls) {
    return '<button class="unpin-trigger ' + (cls || '') + '" type="button" aria-haspopup="dialog" aria-label="' + esc(p.title) + ' — unpin to read">' + inner + '</button>';
  };

  /* The lead title keeps its last word in its own span so the wordmark study can mark "Agent" alone. */
  function wordmark(title) {
    var words = esc(title).split(' '), last = words.pop();
    return (words.length ? '<span class="wm-word">' + words.join(' ') + '</span> ' : '') + '<span class="wm-mark">' + last + '</span>';
  }

  function paperHTML(p, kind) {
    if (kind === 'lead') {
      return '<article class="paper paper--lead"><div class="paper-body">' + label(p) +
        '<h2 class="highlighted-title">' + trigger(p, wordmark(p.title), 'unpin-trigger--title') + '</h2><p class="highlighted-note">' + esc(p.note) + '</p>' +
        '<div class="project-meta"><span>' + esc(p.lifecycle) + '</span><span>' + esc(p.period) + '</span><span>updated ' + esc(p.updated) + '</span></div>' +
        '<div class="highlighted-footer"><a class="project-cta" href="' + esc(siteHref(p.href)) + '" draggable="false">Enter the field notes</a></div></div></article>';
    }
    if (kind === 'featured') {
      return '<article class="paper paper--featured"><div class="paper-body">' + label(p) +
        '<h2>' + trigger(p, esc(p.title), 'unpin-trigger--title') + '</h2><p>' + esc(p.note) + '</p><div class="featured-actions">' +
        '<div class="project-meta"><span>' + esc(p.lifecycle) + '</span><span>' + esc(p.period) + '</span></div>' +
        '<a class="featured-cta" href="' + esc(siteHref(p.href)) + '" draggable="false">Open field studies →</a></div></div></article>';
    }
    var caps = kind === 'instrument' ? '<ul class="instrument-capabilities">' + (p.capabilities || []).map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ul>' : '';
    return '<article class="paper paper--' + kind + '"><div class="paper-edge"><div class="paper-inner">' +
      (kind === 'instrument' ? (motifs[p.id] || '') + label(p) : '') +
      '<h2>' + esc(p.title) + '</h2>' + caps +
      '<p class="standard-period">' + esc(p.period) + ' · ' + esc(p.lifecycle) + '</p>' +
      '<div class="project-actions">' + repoLink(p, 'github-link--card', 'repo ↗') +
      trigger(p, '<span class="morph-icon" aria-hidden="true"></span>', 'morph-toggle') + '</div></div></div></article>';
  }

  /* build(host, opt) → { wrap, root, viewport, track, slots:[{el, swing, pin, ghost, trigger, project, kind}] }
     opt: { order, viewportLabel, only: 'project-id' (study tiles: one card, no toolbar) } */
  var uid = 0;
  function build(host, opt) {
    opt = opt || {};
    var list = opt.only ? projects.filter(function (p) { return p.id === opt.only; }) : projects;
    var wrap = document.createElement('div');
    wrap.className = 'cork-wrap' + (opt.only ? ' cork-wrap--study' : '');
    wrap.innerHTML = '<section class="cork" aria-label="' + esc(opt.label || 'Projects on the building board') + '">' +
      (opt.only ? '' : '<div class="cork-toolbar"><span class="cork-order">' + esc(opt.order || 'projects · drag →') + '</span>' +
      '<div class="cork-actions" aria-label="Board controls"><button class="cork-btn" type="button" data-step="-1" aria-label="Toward the start of the board">←</button>' +
      '<button class="cork-btn" type="button" data-step="1" aria-label="Toward the end of the board">→</button></div></div>') +
      '<div class="cork-viewport"' + (opt.only ? '' : ' tabindex="0" aria-label="' + esc(opt.viewportLabel || 'Project board, Fred Agent first. Drag, or use the arrow keys') + '"') + '><div class="cork-track"></div></div></section>';
    var root = wrap.firstChild, viewport = root.querySelector('.cork-viewport'), track = root.querySelector('.cork-track');
    var slots = list.map(function (p) {
      var kind = kindOf(p), el = document.createElement('div');
      el.className = 'slot slot--' + kind;
      el.dataset.id = p.id;
      el.innerHTML = '<div class="ghost" aria-hidden="true"></div><span class="pin-hole" aria-hidden="true"></span>' +
        '<div class="swing"><div class="lift" aria-hidden="true"><div class="lift-shape"></div></div>' + paperHTML(p, kind) + '</div>' + pin;
      track.appendChild(el);
      return { el: el, swing: el.querySelector('.swing'), pin: el.querySelector('.board-pin'), ghost: el.querySelector('.ghost'),
        trigger: el.querySelector('.unpin-trigger'), title: el.querySelector('.highlighted-title'), project: p, kind: kind };
    });
    host.appendChild(wrap);
    wrap.addEventListener('dragstart', function (e) { e.preventDefault(); });
    return { uid: 'cork' + (++uid), wrap: wrap, root: root, viewport: viewport, track: track, slots: slots };
  }

  /* Reads a slot's live geometry (after container queries resolve). Angles in degrees. */
  function geometry(slot) {
    var cs = getComputedStyle(slot.el || slot);
    return {
      tilt: parseFloat(cs.getPropertyValue('--tilt')) || 0,
      pinTilt: parseFloat(cs.getPropertyValue('--pin-tilt')) || 0,
      pinLeft: (parseFloat(cs.getPropertyValue('--pin-left')) || 50) / 100
    };
  }

  window.FYCork = { projects: projects, build: build, geometry: geometry, siteHref: siteHref, esc: esc, github: github, kindOf: kindOf };
})();
