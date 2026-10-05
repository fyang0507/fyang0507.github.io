/* design/2026-10-essays · book-board.js — the board's chrome around the two page copies (book-writing.dc.html,
   book-reading.dc.html). Deferred right after content/posts-index.js, so it runs before any module reads the index.
   None of this is the move itself (book-vt.js); it is what lets the real pages run from design/ and be compared:
   · paths: the index's cover and board images are written for the site root (./images/…); here they get ../../
   · links: the pages link to Reading.dc.html / Writing.dc.html (case.js, bus.js); the Navigation API sends those to
     the board's copies, so every way between the two pages stays on the board
   · the switcher (lower left): A / B / C / now (the hard cut the site has today), and slow ×¼; the choice lives in
     sessionStorage book-c and book-slow (or ?c= and ?slow=1 on any board URL)
   · on the shelf, two things a production port would put in lib/writing/pull.js (README, the port):
       - when a book opens, its cover is fetched (the same srcset and sizes as Reading's plate), so the plate is in the
         cache when the essay arrives, and its aspect is known to the move
       - B only: the board does not swing open; the page goes as soon as the book is square to you
   · back from the essay through the back/forward cache: the shelf's own reset (app.js, pageshow) waits until the move
     back has landed the essay in the book in your hand; then the book is put back (the board snaps it home, as
     production does today; the port would put it back with its spring). */
(function () {
  'use strict';
  var html = document.documentElement, ss = window.sessionStorage;
  var get = function (k) { try { return ss.getItem(k); } catch (e) { return null; } };
  var set = function (k, v) { try { if (v == null) ss.removeItem(k); else ss.setItem(k, v); } catch (e) { /* storage off */ } };

  /* ---- paths ---- */
  var up = function (s) { return typeof s === 'string' ? s.replace(/(^|,\s*)\.\//g, '$1../../') : s; };
  (window.FY_POST_INDEX || []).forEach(function (p) { ['cover', 'coverSrcset', 'board', 'boardSrcset'].forEach(function (k) { p[k] = up(p[k]); }); });

  /* ---- the candidate ---- */
  var q = new URLSearchParams(location.search);
  if (/^(a|b|c|now)$/.test(q.get('c') || '')) set('book-c', q.get('c'));
  if (q.has('slow')) set('book-slow', q.get('slow') === '1' ? '1' : null);
  var C = get('book-c') || 'a';
  html.setAttribute('data-book-c', C);

  /* ---- links into the board's copies ---- */
  if (window.navigation) navigation.addEventListener('navigate', function (e) {
    var u = new URL(e.destination.url), m = /^(.*\/design\/2026-10-essays\/)(Reading|Writing)\.dc\.html$/.exec(u.pathname);
    if (!m || !e.cancelable || u.origin !== location.origin) return;
    e.preventDefault();
    var to = m[1] + 'book-' + m[2].toLowerCase() + '.dc.html' + u.search + u.hash;
    setTimeout(function () { location.href = to; });
  });

  /* ---- the switcher ---- */
  var LABEL = { a: ['A', '扉页铺开', 'the title page opens out'], b: ['B', '封面成题图', 'the cover becomes the plate'], c: ['C', '翻过扉页', 'turn the title page'], now: ['now', '现在', 'today: a hard cut'] };
  var WHY = {
    a: '扉页的纸铺开成整页，书名从扉页飞到文章标题的位置：书上读到的，就是页上读到的。保留现有的翻开动作，只把最后的硬切换成连续。',
    b: '取下腰封，封面的照片展开成文章顶部的题图：手里那本书的封面，就是文章的头图。省掉翻开那一下，书架早 0.25 秒交出页面。',
    c: '像读书一样翻过扉页：扉页绕书脊翻过来，它的背面就是文章，翻到底时铺满整个窗口。沿用书页翻动的语言。',
    now: '现在的样子：书在手里翻开到扉页，然后硬切到文章页。'
  };
  function chrome() {
    var box = document.createElement('div');
    box.className = 'bk-switch'; box.setAttribute('aria-label', 'Board: the book move');
    var shelf = /book-writing/.test(location.pathname);
    box.innerHTML = '<div class="bk-row"><span class="bk-k">book → essay</span>' + ['a', 'b', 'c', 'now'].map(function (k) {
      return '<button type="button" data-c="' + k + '" aria-pressed="' + (k === C) + '" title="' + LABEL[k][2] + '"><b>' + LABEL[k][0] + '</b> <span lang="zh">' + LABEL[k][1] + '</span></button>';
    }).join('') + '<button type="button" class="bk-slow" aria-pressed="' + (get('book-slow') === '1') + '" title="play the move at a quarter speed">×¼</button>' +
      '<button type="button" class="bk-more" aria-expanded="false" title="why this one"><span lang="zh">说明</span></button></div>' +
      '<p class="bk-why" lang="zh">' + WHY[C] + '</p>' +
      '<p class="bk-how">' + (shelf ? 'Pull a book off the shelf, then click it. Back (⌘[) or “all writing” returns.' : 'Back (⌘[) or “← all writing” returns to the shelf.') + ' <a href="book-index.html">board index</a></p>';
    box.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      if (b.classList.contains('bk-slow')) { var on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', on); set('book-slow', on ? '1' : null); return; }
      if (b.classList.contains('bk-more')) { b.setAttribute('aria-expanded', b.getAttribute('aria-expanded') !== 'true'); return; }
      set('book-c', b.dataset.c); location.reload();
    });
    document.body.appendChild(box);
  }
  if (document.body) chrome(); else document.addEventListener('DOMContentLoaded', chrome);

  if (!/book-writing/.test(location.pathname)) return;

  /* ---- the shelf: the opening book ---- */
  var host = function () { return document.querySelector('.wr[data-mount=writing]'); };
  function opening() {
    var h = host(), key = h && h.getAttribute('data-opening'), hit = key && document.querySelector('.bk-hit[data-post="' + key + '"]');
    return hit ? { key: key, box: document.querySelectorAll('.sh-world > .book')[+hit.dataset.i] } : null;
  }
  // the cover Reading will show, fetched as the book opens (the plate's own srcset and sizes, so the same file)
  function prefetch(key) {
    var p = (window.FY_POST_INDEX || []).find(function (x) { return x.id === key; });
    if (!p || !p.cover) return;
    var img = new Image();
    img.onload = function () { set('book-ar', key + ' ' + (img.naturalWidth / img.naturalHeight).toFixed(4)); };
    img.sizes = '100vw'; img.srcset = p.coverSrcset || ''; img.src = p.cover;
  }
  // B: the board stays shut (book-board.css pins the leaf) and the page goes once the book is square to you: when the
  // book's own move lands, its board's swing is cancelled, and pull.js, whose open() waits on both, goes on at once
  function square(box, tries) {
    var a = box.getAnimations().filter(function (x) { return x.playState === 'running'; })[0];
    if (!a) { if (tries) requestAnimationFrame(function () { square(box, tries - 1); }); return; }   // the bird hops off first
    a.finished.then(function () { box.querySelector('.leaf').getAnimations().forEach(function (x) { x.cancel(); }); }, function () {});
  }
  var seen = null;
  new MutationObserver(function () {
    var o = opening();
    if (!o || seen === o.key) { if (!o) seen = null; return; }
    seen = o.key;
    prefetch(o.key);
    if (C === 'b' && document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) square(o.box, 20);
  }).observe(document.documentElement, { subtree: true, attributes: true, attributeFilter: ['data-opening'] });

  /* ---- back through the back/forward cache: the move back first, then the shelf's own reset ---- */
  addEventListener('pageshow', function (e) {
    if (!e.persisted || e.fyBook) return;
    var r = null;
    try { r = JSON.parse(get('fy-book-vt')); } catch (x) { r = null; }
    if (!r || r.from !== 'essay' || Date.now() - r.t > 10000 || !opening() || !document.startViewTransition) return;
    e.stopImmediatePropagation();                     // app.js would snap the open book home before the move sees it
    window.BOOK_RESET = function () {
      var ev = new PageTransitionEvent('pageshow', { persisted: true });
      ev.fyBook = true;
      dispatchEvent(ev);
    };
  });
})();
