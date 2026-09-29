/* 05 · corkboard — faithful card renderer shared by all three candidates.
   Reproduces Building.dc.html's board from window.BUILDING_PROJECTS, with one structural change:
   each card is split into a rotating .swing (paper, tape) and a non-rotating .board-pin sibling,
   so the paper can pivot on the pin's anchor (var(--pin-left) 14px) while the pin stays in the cork. */
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
  var toggle = function (p) {
    return '<button class="morph-toggle" type="button" aria-expanded="false" aria-label="Open ' + esc(p.title) + ' details"><span class="morph-icon" aria-hidden="true"></span></button>';
  };
  /* A small torn note that hangs off the card itself (A and B), so it pans and swings with its paper. */
  var notePop = function (p) {
    return '<div class="note-pop" role="region" aria-label="' + esc(p.title) + ' field note" hidden><div class="note-pop-paper">' +
      '<div class="note-pop-kicker">field note · ' + String(p.order).padStart(2, '0') + '</div><p>' + esc(p.note) + '</p>' +
      repoLink(p, 'github-link--panel', 'Open repository ↗') + '</div></div>';
  };

  function paperHTML(p, kind, opt) {
    if (kind === 'lead') {
      var tag = opt.leadTag || 'a', attrs = tag === 'a' ? ' href="' + esc(siteHref(p.href)) + '" draggable="false" aria-label="' + esc(p.title) + ': enter the field notes"' : '';
      var words = esc(p.title).split(' ');
      var mark = words.length > 1 ? words.slice(0, -1).join(' ') + ' <span class="wm-mark">' + words[words.length - 1] + '</span>' : '<span class="wm-mark">' + words[0] + '</span>';
      return '<' + tag + ' class="paper paper--lead"' + attrs + '><div class="paper-body">' + label(p) +
        '<h2 class="highlighted-title">' + mark + '</h2><p class="highlighted-note">' + esc(p.note) + '</p>' +
        '<div class="project-meta"><span>' + esc(p.lifecycle) + '</span><span>' + esc(p.period) + '</span><span>updated ' + esc(p.updated) + '</span></div>' +
        '<div class="highlighted-footer"><span class="project-cta">Enter the field notes</span></div></div></' + tag + '>';
    }
    if (kind === 'featured') {
      var ftag = opt.leadTag || 'a', fattrs = ftag === 'a' ? ' href="' + esc(siteHref(p.href)) + '" draggable="false" aria-label="' + esc(p.title) + ': open the field studies"' : '';
      return '<' + ftag + ' class="paper paper--featured"' + fattrs + '><div class="paper-body">' + label(p) +
        '<h2>' + esc(p.title) + '</h2><p>' + esc(p.note) + '</p><div class="featured-actions">' +
        '<div class="project-meta"><span>' + esc(p.lifecycle) + '</span><span>' + esc(p.period) + '</span></div>' +
        '<span class="featured-cta">Open field studies →</span></div></div></' + ftag + '>';
    }
    var caps = kind === 'instrument' ? '<ul class="instrument-capabilities">' + (p.capabilities || []).map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ul>' : '';
    return '<div class="paper paper--' + kind + '"><div class="paper-edge"><div class="paper-inner">' +
      (kind === 'instrument' ? (motifs[p.id] || '') + label(p) : '') +
      '<h2>' + esc(p.title) + '</h2>' + caps +
      '<p class="standard-period">' + esc(p.period) + ' · ' + esc(p.lifecycle) + '</p>' +
      '<div class="project-actions">' + repoLink(p, 'github-link--card', 'repo ↗') + toggle(p) + '</div></div></div></div>';
  }

  /* build(host, opt) → { wrap, root, viewport, track, slots:[{el, swing, pin, paper, project, kind}] }
     opt: { mode:'physics'|'string'|'unpin', order:'projects · drag →', notes:true, leadTag:'a'|'article' } */
  function build(host, opt) {
    opt = opt || {};
    var wrap = document.createElement('div');
    wrap.className = 'cork-wrap';
    wrap.innerHTML = '<section class="cork cork--' + (opt.mode || 'plain') + '" aria-label="Projects on the building board">' +
      '<div class="cork-toolbar"><span class="cork-order">' + esc(opt.order || 'projects · scroll →') + '</span>' +
      '<div class="cork-actions" aria-label="Board controls"><button class="cork-btn" type="button" data-step="-1" aria-label="Toward the start of the board">←</button>' +
      '<button class="cork-btn" type="button" data-step="1" aria-label="Toward the end of the board">→</button></div></div>' +
      '<div class="cork-viewport" tabindex="0" aria-label="' + esc(opt.viewportLabel || 'Project board, Fred Agent first') + '"><div class="cork-track"></div></div></section>';
    var root = wrap.firstChild, viewport = root.querySelector('.cork-viewport'), track = root.querySelector('.cork-track');
    var slots = projects.map(function (p) {
      var kind = kindOf(p), el = document.createElement('div');
      el.className = 'slot slot--' + kind;
      el.dataset.id = p.id;
      el.innerHTML = '<div class="swing"><div class="lift" aria-hidden="true"><div class="lift-shape"></div></div>' + paperHTML(p, kind, opt) +
        (opt.notes && (kind === 'instrument' || kind === 'standard') ? notePop(p) : '') + '</div>' + pin;
      track.appendChild(el);
      return { el: el, swing: el.querySelector('.swing'), pin: el.querySelector('.board-pin'), paper: el.querySelector('.paper'), project: p, kind: kind };
    });
    host.appendChild(wrap);
    wrap.addEventListener('dragstart', function (e) { e.preventDefault(); });
    if (opt.notes) wireNotes(root);
    return { wrap: wrap, root: root, viewport: viewport, track: track, slots: slots };
  }

  /* The "+" on slips opens a torn note hanging from that card (no blur, no fixed positioning). */
  function wireNotes(root) {
    var open = null;
    function set(slot, on) {
      var pop = slot.querySelector('.note-pop'), btn = slot.querySelector('.morph-toggle');
      if (!pop || !btn) return;
      slot.classList.toggle('open', on);
      pop.hidden = !on;
      btn.setAttribute('aria-expanded', String(on));
      btn.setAttribute('aria-label', (on ? 'Close ' : 'Open ') + slot.querySelector('h2').textContent + ' details');
      open = on ? slot : null;
    }
    root.addEventListener('click', function (e) {
      var btn = e.target.closest('.morph-toggle');
      if (!btn) return;
      var slot = btn.closest('.slot');
      if (open && open !== slot) set(open, false);
      set(slot, !slot.classList.contains('open'));
    });
    document.addEventListener('click', function (e) { if (open && !open.contains(e.target)) set(open, false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && open) { var b = open.querySelector('.morph-toggle'); set(open, false); b.focus(); }
    });
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
