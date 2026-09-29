/* 09 · B — "The laptop tells the truth". The screen types real, recent activity from the data.
   Two classes on one screen, which is the thesis: a person types the command (variable keystrokes,
   a hesitation, now and then a wrong key noticed and backspaced) and the machine answers at
   machine speed. Each answer is a real link. Cycles slowly while the laptop is hovered or focused;
   pauses while a link is under the pointer or has focus. */
(function () {
  var sleep = HomeDesk.sleep, P = '../../';
  var NEAR = { a: 'sq', b: 'vn', c: 'xv', d: 'sf', e: 'wr', f: 'dg', g: 'fh', h: 'gj', i: 'uo', j: 'hk', k: 'jl', l: 'k;', m: 'n,', n: 'bm', o: 'ip', p: 'o[', q: 'wa', r: 'et', s: 'ad', t: 'ry', u: 'yi', v: 'cb', w: 'qe', x: 'zc', y: 'tu', z: 'xs' };

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // What actually happened most recently — computed from the same manifests the site ships.
  function entries() {
    var post = FY_POSTS.slice().sort(function (a, b) { return b.date.localeCompare(a.date); })[0];
    var proj = BUILDING_PROJECTS.slice().sort(function (a, b) { return (b.updated || '').localeCompare(a.updated || '') || b.sortDate.localeCompare(a.sortDate); })[0];
    var photo = FY_PHOTOS.slice().sort(function (a, b) { return b.date.localeCompare(a.date) || b.id - a.id; })[0];
    return [
      { cmd: 'git log -1 writing/', href: P + 'Reading.dc.html?post=' + encodeURIComponent(post.id), label: post.titleZh + ' · ' + post.title,
        title: '<span class="zh-t">' + esc(post.titleZh) + '</span>\n' + esc(post.title), meta: (post.tagsZh[0] || '') + ' · ' + post.date + ' · ' + post.readingMin + ' min' },
      { cmd: 'git log -1 building/', href: P + 'Building.dc.html', label: proj.title,
        title: esc(proj.title), meta: 'updated ' + proj.updated + ' · ' + proj.lifecycle },
      { cmd: 'ls -t photos | head -1', href: P + 'Gallery.dc.html', label: photo.loc,
        title: esc(photo.loc), meta: photo.date + ' · ' + photo.cat }
    ];
  }

  window.HomeB = function (host) {
    var desk = HomeDesk.build(host, { laptop: false }), d = desk.el;
    var old = d.querySelector('.screen'); old.remove();
    var scr = document.createElement('div');
    scr.className = 'term'; scr.setAttribute('aria-label', 'Recent activity · 最近的动静');
    d.querySelector('.lap').after(scr);                    // right after the laptop's door, so Tab walks into its links
    var E = entries(), idx = 0, run = 0, hovering = false, focused = false, paused = false, leaveT = 0;
    var caret = document.createElement('span'); caret.className = 'caret'; caret.setAttribute('aria-hidden', 'true');
    scr.appendChild(caret);

    function line(cls) { var l = document.createElement('div'); l.className = 't-line ' + (cls || ''); scr.insertBefore(l, caret.parentNode === scr ? caret : null); return l; }
    function scrollEnd() { scr.scrollTop = scr.scrollHeight; }
    function trim() { var ls = scr.querySelectorAll('.t-line'); for (var i = 0; i < ls.length - 12; i++) ls[i].remove(); }
    function prompt() { var l = line('cmd'); l.innerHTML = '<span class="ps">$</span> <span class="k"></span>'; l.appendChild(caret); scrollEnd(); return l.querySelector('.k'); }
    function key(c, prev, r) {
      var t = 58 + r() * 72;
      if (prev === ' ') t += 40 + r() * 110;             // finding the start of the next word
      if (/[-\/|."=]/.test(c)) t += 60 + r() * 90;      // reaching for a symbol
      if (c === prev) t *= .55;                          // double letters roll
      if (r() < .05) t += 200 + r() * 260;               // a small hesitation
      return t;
    }
    async function waitPaused(tok) { while (paused && tok === run) await sleep(120); }

    async function typeCmd(k, text, tok) {
      var r = Pen.rng(text + ':' + Math.floor(performance.now() / 997));
      var typo = r() < .55 ? 3 + Math.floor(r() * (text.length - 6)) : -1;
      if (typo > 0 && !NEAR[text[typo]]) typo = -1;
      for (var i = 0; i < text.length; i++) {
        if (tok !== run) return false;
        if (i === typo) {                                  // a wrong key, noticed a char or two late
          var nb = NEAR[text[i]], extra = r() < .45 ? 1 : 0;
          k.textContent += nb[Math.floor(r() * nb.length)]; await sleep(key(text[i], text[i - 1], r));
          for (var e = 0; e < extra; e++) { k.textContent += text[i + 1 + e] || ''; await sleep(key('x', 'x', r)); }
          await sleep(230 + r() * 180);
          for (var bsp = 0; bsp <= extra; bsp++) { k.textContent = k.textContent.slice(0, -1); await sleep(55 + r() * 25); }
          await sleep(90);
          if (tok !== run) return false;
        }
        k.textContent += text[i];
        await sleep(key(text[i], text[i - 1], r));
      }
      await sleep(170 + r() * 160);                        // the little pause before Enter
      return tok === run;
    }
    function answer(en) {                                  // machine speed: the output lands whole
      var l = line('out');
      var a = document.createElement('a'); a.href = en.href; a.className = 't-link'; a.innerHTML = en.title;
      a.setAttribute('aria-label', en.label);
      l.appendChild(a);
      var m = line('meta'); m.textContent = en.meta;
      var mark = Pen.annotate(a, 'bracket', { side: 'left', manual: true, width: 1.8, seed: en.cmd });
      mark.svg.setAttribute('width', 1); mark.svg.setAttribute('height', 1);   // unsized svg is 300×150 and would inflate scrollHeight
      a.addEventListener('pointerenter', function () { paused = true; hovering = true; clearTimeout(leaveT); mark.show(); });
      a.addEventListener('pointerleave', function () { paused = false; hovering = false; mark.hide(); stop(); });
      a.addEventListener('focus', function () { paused = true; mark.show(); });
      a.addEventListener('blur', function () { paused = false; mark.hide(); });
      return [l, m];
    }

    async function cycle() {
      var tok = ++run;
      if (Pen.reduced()) return staticCycle(tok);
      var k = prompt();
      while (tok === run) {
        var en = E[idx % E.length];
        await sleep(scr.querySelector('.out') ? 520 : 260);
        if (!(await typeCmd(k, en.cmd, tok))) return;
        var out = answer(en);
        out[0].style.visibility = out[1].style.visibility = 'hidden';
        caret.remove();
        await sleep(40); out[0].style.visibility = ''; scrollEnd();
        await sleep(38); out[1].style.visibility = ''; scrollEnd();
        idx++; trim();
        k = prompt();
        var hold = 3000; while (hold > 0 && tok === run) { await sleep(150); if (!paused) hold -= 150; }
        await waitPaused(tok);
      }
    }
    async function staticCycle(tok) {                      // reduced motion: whole answers, swapped in place
      while (tok === run) {
        clear(); var en = E[idx % E.length];
        var k = prompt(); k.textContent = en.cmd; caret.remove(); answer(en); prompt(); idx++;
        var hold = 5000; while (hold > 0 && tok === run) { await sleep(150); if (!paused) hold -= 150; }
      }
    }
    function clear() { scr.querySelectorAll('.t-line').forEach(function (l) { l.remove(); }); scr.appendChild(caret); }
    function start() { clearTimeout(leaveT); if (run && scr.dataset.on === '1') return; scr.dataset.on = '1'; clear(); cycle(); }
    function stop() {
      leaveT = setTimeout(function () {
        if (hovering || focused) return;
        run++; scr.dataset.on = '0'; paused = false;
        setTimeout(function () { if (scr.dataset.on !== '1') clear(); }, 900);   // the screen goes back to sleep
      }, 450);
    }

    var zone = [d.querySelector('.lap'), d.querySelector('.nav-build'), scr];
    zone.forEach(function (el) {
      el.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { hovering = true; start(); } });
      el.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { hovering = false; stop(); } });
      el.addEventListener('focusin', function () { focused = true; start(); });
      el.addEventListener('focusout', function () { focused = false; stop(); });
    });
    // Touch: no hover, so the screen runs by itself while the desk is on screen.
    if (matchMedia('(hover: none)').matches) {
      new IntersectionObserver(function (es) { if (es[0].isIntersecting) start(); else { run++; scr.dataset.on = '0'; } }, { threshold: .4 }).observe(d);
    }
    document.addEventListener('mock:rm', function () { if (scr.dataset.on === '1') { scr.dataset.on = '0'; start(); } });

    window.replayB = function () { desk.replayDraw(); idx = 0; run++; scr.dataset.on = '0'; start(); };
    window.HomeB.data = E;
    return desk;
  };
})();
