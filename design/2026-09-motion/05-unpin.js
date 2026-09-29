/* 05 · C — unpin to read. Click / Enter: the pin pops out (two held frames of pen ticks, the hand's
   clock), the card drops off its pin, flies toward the viewer to the centre while straightening, then
   a folded field note hinges open beneath it (the physics clock). Esc / click outside: the note folds,
   the card flies home, and the pin is pushed back in with a small squash that nudges the card. */
(function () {
  var SCALE = { lead: 1, featured: 1.04, instrument: 1.1, standard: 1.22 };

  window.FYUnpin = function (cork) {
    var esc = FYCork.esc, slots = cork.slots, vp = cork.viewport, root = cork.root;
    var reduced = function () { return window.Pen && Pen.reduced(); };
    var layer = document.createElement('div');
    layer.className = 'unpin-layer'; layer.hidden = true;
    layer.innerHTML = '<div class="unpin-scrim"></div>';
    document.body.appendChild(layer);
    var scrim = layer.firstChild, state = null;

    var tick = function (a, r0, r1) { var c = Math.cos(a), s = Math.sin(a); return 'M' + (c * r0).toFixed(1) + ' ' + (s * r0).toFixed(1) + ' L' + (c * r1).toFixed(1) + ' ' + (s * r1).toFixed(1); };
    var angles = [-2.45, -1.62, -0.72];
    var popSVG = '<svg class="pop-ticks" viewBox="-24 -24 48 48" aria-hidden="true">' +
      '<g class="pop-a">' + angles.map(function (a) { return '<path d="' + tick(a, 11, 15.5) + '"/>'; }).join('') + '</g>' +
      '<g class="pop-b">' + angles.map(function (a, i) { return '<path d="' + tick(a + (i - 1) * .06, 15, 21.5 - i) + '"/>'; }).join('') + '</g></svg>';

    slots.forEach(function (s) {
      s.el.insertAdjacentHTML('beforeend', '<span class="pin-hole" aria-hidden="true"></span>' + popSVG);
      var title = s.project.title, btn = s.el.querySelector('.morph-toggle');
      if (btn) {   // slips: the "+" is the accessible trigger; the whole card is clickable by pointer
        btn.setAttribute('aria-label', 'Unpin ' + title + ' to read');
        btn.setAttribute('aria-haspopup', 'dialog');
        btn.addEventListener('click', function (e) { e.stopPropagation(); open(s, btn); });
      } else {     // lead + featured contain no links here, so the paper itself is the button
        s.swing.tabIndex = 0;
        s.swing.setAttribute('role', 'button');
        s.swing.setAttribute('aria-haspopup', 'dialog');
        s.swing.setAttribute('aria-label', 'Unpin ' + title + ' to read');
        s.swing.addEventListener('keydown', function (e) { if (e.target === s.swing && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); open(s, s.swing); } });
      }
      s.swing.addEventListener('click', function (e) { if (!e.target.closest('a')) open(s, btn || s.swing); });
    });

    function panelHTML(p, kind) {
      var showNote = kind === 'instrument' || kind === 'standard';
      var href = FYCork.siteHref(p.href);
      return '<div class="unpin-panel-paper">' +
        '<div class="unpin-kicker"><span>field note · ' + String(p.order).padStart(2, '0') + '</span>' +
        '<button class="unpin-close" type="button" aria-label="Close and pin ' + esc(p.title) + ' back">close · 关闭 <span aria-hidden="true">×</span></button></div>' +
        '<h3 class="unpin-title" id="unpin-title">' + esc(p.title) + ' <span>' + esc(p.kind) + '</span></h3>' +
        (showNote ? '<p class="unpin-note">' + esc(p.note) + '</p>' : '') +
        '<div class="project-meta"><span>' + esc(p.lifecycle) + '</span><span>' + esc(p.period) + '</span><span>updated ' + esc(p.updated) + '</span></div>' +
        '<div class="unpin-actions">' + (href ? '<a class="unpin-cta" href="' + esc(href) + '">Enter the field notes <b>→</b></a>' : '') +
        (p.repo ? '<a class="github-link" href="' + esc(p.repo) + '" target="_blank" rel="noopener noreferrer">' + FYCork.github + '<span>Open repository ↗</span></a>' : '') +
        '</div></div>';
    }
    var basePin = function (g) { return 'translateX(-50%) rotate(' + (g.pinTilt + g.tilt).toFixed(2) + 'deg)'; };

    function open(s, trigger) {
      if (state) return;
      var rm = reduced(), g = FYCork.geometry(s), el = s.el, rect = el.getBoundingClientRect();
      var w = el.offsetWidth, h = el.offsetHeight, P = [w * g.pinLeft, 14], vw = innerWidth, vh = innerHeight;

      // The flying copy lives in a container as wide as the board, so container units resolve identically.
      var fly = document.createElement('div');
      fly.className = 'unpin-fly';
      fly.style.cssText = 'left:' + rect.left + 'px;top:' + rect.top + 'px;width:' + cork.wrap.offsetWidth + 'px';
      var card = document.createElement('div');
      card.className = el.className + ' unpin-card';
      card.dataset.id = el.dataset.id;
      card.style.cssText = 'width:' + w + 'px;transform-origin:' + P[0] + 'px 14px';
      var clone = s.swing.cloneNode(true);
      clone.removeAttribute('tabindex'); clone.removeAttribute('role'); clone.removeAttribute('aria-label'); clone.setAttribute('aria-hidden', 'true');
      clone.querySelectorAll('a,button').forEach(function (n) { n.setAttribute('tabindex', '-1'); });
      // A clone drops running animations, so carry over the pen stroke state (the wordmark underline).
      var inked = s.swing.querySelectorAll('svg path'), cloned = clone.querySelectorAll('svg path');
      cloned.forEach(function (n, i) { if (inked[i]) n.style.strokeDashoffset = getComputedStyle(inked[i]).strokeDashoffset; });
      card.appendChild(clone); fly.appendChild(card);

      var panel = document.createElement('div');
      panel.className = 'unpin-panel unpin-panel--' + s.kind;
      panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'true'); panel.setAttribute('aria-labelledby', 'unpin-title');
      panel.innerHTML = panelHTML(s.project, s.kind);
      layer.append(panel, fly);
      layer.hidden = false;

      var S = Math.min(SCALE[s.kind], (vw - 32) / w);
      var pw = Math.min(w * S >= 300 ? w * S : 360, vw - 32);   // wide cards: the note matches; slips: a wider sheet behind the tag
      panel.style.width = pw + 'px';
      var ph = panel.offsetHeight;
      S = Math.max(0.6, Math.min(S, (vh - 40 - ph) / h));
      var top0 = Math.max(16, (vh - (h * S + ph - 8)) / 2);
      var dx = vw / 2 - w * S / 2 - (rect.left + P[0] * (1 - S)), dy = top0 - (rect.top + P[1] * (1 - S));
      panel.style.left = (vw / 2 - pw / 2) + 'px';
      panel.style.top = (top0 + h * S - 8) + 'px';
      var endCard = 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px) scale(' + S.toFixed(3) + ')';
      state = { s: s, trigger: trigger, fly: fly, card: card, clone: clone, panel: panel, rect: rect, g: g, busy: true };

      s.swing.style.visibility = 'hidden';
      el.classList.add('unpinned');
      card.classList.add('lifted');
      requestAnimationFrame(function () { scrim.classList.add('on'); });
      var done = function () {
        card.getAnimations().concat(clone.getAnimations()).forEach(function (a) { a.cancel(); });
        card.style.transform = endCard; clone.style.transform = 'rotate(0deg)';
        panel.classList.add('open');
        if (!rm) panel.animate([
          { transform: 'perspective(1100px) rotateX(-96deg)', opacity: 0 },
          { transform: 'perspective(1100px) rotateX(-40deg)', opacity: 1, offset: .35 },
          { transform: 'perspective(1100px) rotateX(5deg)', opacity: 1, offset: .74 },
          { transform: 'perspective(1100px) rotateX(0deg)', opacity: 1 }], { duration: 520, easing: 'cubic-bezier(.3,.6,.3,1)' });
        panel.querySelector('.unpin-close').focus({ preventScroll: true });
        state.busy = false;
      };
      if (rm) { s.pin.style.visibility = 'hidden'; done(); return; }

      // Hand's clock: two held poses at ~12 fps, then gone.
      var pinPose = basePin(g);
      s.pin.animate([
        { transform: pinPose + ' translateY(-6px) rotate(14deg)', opacity: 1 },
        { transform: pinPose + ' translateY(-17px) rotate(34deg)', opacity: .7, offset: .5 },
        { transform: pinPose + ' translateY(-17px) rotate(34deg)', opacity: 0 }], { duration: 250, easing: 'steps(1,end)', fill: 'forwards' });
      var pops = el.querySelector('.pop-ticks'), a = (g.pinTilt + g.tilt) * Math.PI / 180;
      pops.style.left = (P[0] + Math.sin(a) * 30) + 'px'; pops.style.top = (13.8 - Math.cos(a) * 30) + 'px';
      pops.querySelector('.pop-a').animate([{ opacity: 1 }, { opacity: 0, offset: .5 }, { opacity: 0 }], { duration: 170, easing: 'steps(1,end)' });
      pops.querySelector('.pop-b').animate([{ opacity: 0 }, { opacity: 1, offset: .5 }, { opacity: 0 }], { duration: 170, easing: 'steps(1,end)' });

      // Physics clock: drop off the pin, swing away, fly to centre straightening, one small overshoot.
      var sw = g.tilt >= 0 ? 1 : -1;
      card.animate([
        { transform: 'translate(0,0) scale(1)' },
        { transform: 'translate(0,9px) scale(1)', offset: .2, easing: 'cubic-bezier(.25,.8,.3,1.06)' },
        { transform: endCard }], { duration: 700, delay: 60, easing: 'ease-out', fill: 'both' });
      clone.animate([
        { transform: 'rotate(' + g.tilt + 'deg)' },
        { transform: 'rotate(' + (g.tilt + sw * 2.8) + 'deg)', offset: .2, easing: 'cubic-bezier(.3,.7,.3,1.08)' },
        { transform: 'rotate(0deg)' }], { duration: 700, delay: 60, easing: 'ease-out', fill: 'both' }).onfinish = done;
    }

    function close() {
      if (!state || state.busy) return;
      var st = state, s = st.s, g = st.g, rm = reduced();
      st.busy = true;
      var now = s.el.getBoundingClientRect(), home = 'translate(' + (now.left - st.rect.left).toFixed(1) + 'px,' + (now.top - st.rect.top).toFixed(1) + 'px) scale(1)';
      scrim.classList.remove('on');
      st.card.classList.remove('lifted');
      var finish = function () {
        st.fly.remove(); st.panel.remove(); layer.hidden = true;
        s.swing.style.visibility = ''; s.pin.style.visibility = '';
        s.pin.getAnimations().forEach(function (a) { a.cancel(); });
        state = null;
        st.trigger.focus({ preventScroll: true });
        if (rm) { s.el.classList.remove('unpinned'); return; }
        var base = basePin(g);
        s.pin.animate([
          { transform: base + ' translateY(-15px) rotate(10deg)' },
          { transform: base, offset: .42, easing: 'ease-out' },
          { transform: base + ' scale(1.14,.74)', offset: .6 },
          { transform: base + ' scale(.96,1.05)', offset: .8 },
          { transform: base }], { duration: 360, easing: 'ease-in' });
        setTimeout(function () { s.el.classList.remove('unpinned'); }, 150);
        s.swing.animate([
          { transform: 'rotate(' + g.tilt + 'deg)' },
          { transform: 'rotate(' + g.tilt + 'deg)', offset: .25 },
          { transform: 'rotate(' + (g.tilt + 1.5) + 'deg)', offset: .45 },
          { transform: 'rotate(' + (g.tilt - .55) + 'deg)', offset: .7 },
          { transform: 'rotate(' + (g.tilt + .15) + 'deg)', offset: .87 },
          { transform: 'rotate(' + g.tilt + 'deg)' }], { duration: 640, easing: 'ease-out' });
      };
      if (rm) { finish(); return; }
      st.panel.getAnimations().forEach(function (a) { a.cancel(); });
      st.panel.animate([
        { transform: 'perspective(1100px) rotateX(0deg)', opacity: 1 },
        { transform: 'perspective(1100px) rotateX(-96deg)', opacity: 0 }], { duration: 210, easing: 'cubic-bezier(.5,0,.8,.4)', fill: 'forwards' });
      st.card.animate([{ transform: st.card.style.transform }, { transform: home }], { duration: 460, delay: 140, easing: 'cubic-bezier(.35,.1,.25,1)', fill: 'forwards' });
      st.clone.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(' + g.tilt + 'deg)' }], { duration: 460, delay: 140, easing: 'cubic-bezier(.35,.1,.25,1)', fill: 'forwards' }).onfinish = finish;
    }

    scrim.addEventListener('click', close);
    layer.addEventListener('click', function (e) { if (e.target.closest('.unpin-close')) close(); });
    document.addEventListener('keydown', function (e) {
      if (!state) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key !== 'Tab') return;   // keep focus inside the note while it is open
      var f = state.panel.querySelectorAll('a,button'), first = f[0], lastF = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastF.focus(); }
      else if (!e.shiftKey && document.activeElement === lastF) { e.preventDefault(); first.focus(); }
    });

    /* Native scrolling for the board itself, as the live page does. */
    var btns = root.querySelectorAll('[data-step]');
    var upd = function () { var m = vp.scrollWidth - vp.clientWidth; btns.forEach(function (b) { b.disabled = b.dataset.step < 0 ? vp.scrollLeft <= 2 : vp.scrollLeft >= m - 2; }); };
    btns.forEach(function (b) { b.addEventListener('click', function () { vp.scrollBy({ left: b.dataset.step * Math.max(280, vp.clientWidth * .78), behavior: reduced() ? 'auto' : 'smooth' }); }); });
    vp.addEventListener('scroll', upd, { passive: true });
    new ResizeObserver(upd).observe(vp);

    return { open: function (id) { var s = slots.find(function (x) { return x.project.id === id; }); if (s) open(s, s.el.querySelector('.morph-toggle') || s.swing); }, close: close, isOpen: function () { return !!state; } };
  };
})();
