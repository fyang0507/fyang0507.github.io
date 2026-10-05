/* lib/writing/sign.js — the shelf's language sign (design/2026-10-essays, candidate B, the hanging sign): a two-sided
   card hung on a nail over the head of the bookcase, as a shop hangs its OPEN sign. One face says 中文, the other
   English, each in the face the spines set it in; the face you see is the language the shelf reads in (lang.js),
   banded by the pen. Each face names the other language on its foot in that language's own words ("flip · English"
   on the Chinese face, "翻面 · 中文" on the English one), so whoever needs the other side can read how to get it.
     - A press turns the sign over on its string (physics clock: a spring, one small overshoot) and the push swings it
       on its nail (a damped pendulum). The shelf retitles as the sign passes edge-on (lang.set), and the pen bands the
       new face once it has landed (hand's clock). A press before edge-on sends it back, the shelf unchanged. Reduced
       motion lands it at once. A change made elsewhere (back from Reading through the bfcache) shows at once.
     - The face toward you is shown by the card's angle, not by backface-visibility: WebKit flattens a face that holds
       the pen's blended layers and draws the far face, mirrored, over the near one. The hidden face is
       visibility:hidden, so it is out of the accessibility tree too.
     - One button: its name is the face you see (its words, each in its lang), e.g. "书架 shelf 中文 flip English".
       Enter / Space turn it. Pen: hover = the coral line under the other language's name; keyboard focus = coral
       「 」 around the card; no coral at rest. Its marks are TierMarks driven here, as the band must wait for the card.
     - It hangs in a row of its own and never reaches into the case (writing.css), so nothing in the case passes
       behind it: the books, the bird, the book in your hand. Its sizes and the clearances are writing.css's. */
import { lang } from './lang.js';

// The dots are drawn, not read; the spaces around them stay outside, so the name keeps its words apart.
var DOT = ' <i aria-hidden="true">·</i> ';
var FACE = {
  zh: { k: '<span lang="zh">书架</span>' + DOT + '<span lang="en">shelf</span>', big: '中文', hint: '<span lang="en">flip</span>', to: 'English', tl: 'en' },
  en: { k: '<span lang="en">shelf</span>' + DOT + '<span lang="zh">书架</span>', big: 'English', hint: '<span lang="zh">翻面</span>', to: '中文', tl: 'zh' }
};
function face(l) {
  var f = FACE[l];
  return '<span class="sign-face sign-' + l + '"><span class="sign-k">' + f.k + ' </span><span class="sign-big" lang="' + l + '">' + f.big + '</span> ' +
    '<span class="sign-hint">' + f.hint + DOT + '<span class="sign-to" lang="' + f.tl + '">' + f.to + '</span></span></span>';
}
function other(l) { return l === 'zh' ? 'en' : 'zh'; }
function angle(l) { return l === 'en' ? 180 : 0; }

// host: the empty .wr-sign app.js lays out for it. Returns { el, destroy }.
export function Sign(host) {
  host.innerHTML = '<div class="sign-hang"><div class="sign-flip"><svg class="sign-string" aria-hidden="true" width="1" height="1"><path/></svg>' +
    '<button type="button" class="sign-card">' + face('zh') + face('en') + '</button></div><i class="sign-nail" aria-hidden="true"></i></div>';
  var hang = host.querySelector('.sign-hang'), flip = host.querySelector('.sign-flip'), card = host.querySelector('.sign-card');
  var faces = { zh: host.querySelector('.sign-zh'), en: host.querySelector('.sign-en') };
  // The string runs from the card's two holes (writing.css's ::before / ::after) up to the nail, in the card's own
  // plane, so it turns with the card.
  function string() {
    var hole = getComputedStyle(faces.zh, '::before'), r = parseFloat(hole.width) / 2;
    var w = card.offsetWidth, hx = parseFloat(hole.left) + r, hy = card.offsetTop + parseFloat(hole.top) + r;
    host.querySelector('.sign-string path').setAttribute('d', 'M' + hx + ' ' + hy + ' L' + (w / 2) + ' 0.5 L' + (w - hx) + ' ' + hy);
  }
  string();
  // The pen: on each face, the band under the big word and the notice line under the other language's name.
  var marks = {};
  ['zh', 'en'].forEach(function (l) {
    var f = faces[l];
    marks[l] = { band: new TierMark(f, f.querySelector('.sign-big'), { over: 5, seed: 'sign|' + l }), note: new TierMark(f, f.querySelector('.sign-to'), { over: 2, seed: 'sign-to|' + l }) };
  });
  var focus = new FocusMark(host, card, { gap: 7, gy: 6 });

  // want: the language the sign is turning to (or shows) · from: the face showing as a turn began
  var want = lang.get(), from = want, crossed = true, landed = true, hovered = false, side = null;
  var phi = new Motion.Spring({ x: angle(want), k: 150, zeta: 0.74 }), sw = { phi: 0, w: 0, target: 0 };
  function shown() { return phi.x >= 90 ? 'en' : 'zh'; }
  function paint() {
    flip.style.transform = 'perspective(720px) rotateY(' + phi.x.toFixed(2) + 'deg)';
    hang.style.transform = 'rotate(' + (sw.phi * 180 / Math.PI).toFixed(3) + 'deg)';
    if (shown() !== side) {
      side = shown(); host.setAttribute('data-shows', side);
      faces.zh.style.visibility = side === 'zh' ? '' : 'hidden'; faces.en.style.visibility = side === 'en' ? '' : 'hidden';
    }
  }
  function rest(how) {           // every mark as the state says, at once or by the pen
    marks[want].band.to(2, how); marks[other(want)].band.to(0, 'instant');
    marks[want].note.to(hovered ? 1 : 0, how === 'instant' ? 'instant' : 'hover'); marks[other(want)].note.to(0, 'instant');
  }
  var loop = new Motion.Loop(function (dt) {
    phi.step(dt);
    var turning = !phi.rest(0.05);
    if (!turning) phi.snap();
    var swinging = Motion.pendulum(sw, dt, { omega: 8.6, zeta: 0.42 });
    if (!swinging) { sw.phi = 0; sw.w = 0; }
    // Edge-on: the shelf turns with the sign. The face going away gives up its band where no one sees it.
    if (!crossed && shown() === want) {
      crossed = true;
      if (from !== want) { marks[other(want)].band.to(0, 'instant'); marks[other(want)].note.to(0, 'instant'); marks[want].band.to(0, 'instant'); }
      lang.set(want, 'press');
    }
    if (crossed && !landed && Math.abs(phi.x - phi.to) < 5) { landed = true; rest('press'); }
    paint();
    return turning || swinging;
  });
  function turn(l, how) {
    want = l;
    if (how === 'instant' || Motion.reduced()) {
      phi.snap(angle(l)); sw.phi = sw.w = 0; crossed = landed = true;
      if (lang.get() !== l) lang.set(l, 'instant');
      rest('instant'); paint(); return;
    }
    from = shown(); phi.to = angle(l); crossed = false; landed = false;
    marks.zh.note.to(0, 'hover'); marks.en.note.to(0, 'hover');
    sw.w += (l === 'en' ? 1 : -1) * 0.85;        // the push swings it on its nail
    loop.kick();
  }
  card.addEventListener('click', function () { turn(other(want)); });
  card.addEventListener('pointerenter', function (e) { if (e.pointerType === 'touch') return; hovered = true; if (landed) marks[want].note.to(1, 'hover'); });
  card.addEventListener('pointerleave', function () { hovered = false; marks[want].note.to(0, 'hover'); });
  card.addEventListener('focus', function () { focus.set(card.matches(':focus-visible')); });
  card.addEventListener('blur', function () { focus.set(false); });
  // Our own set at edge-on arrives here as well, already accounted for.
  var off = lang.on(function (l) { if (l !== want || !crossed) turn(l, 'instant'); });
  var offRm = Motion.onReduced(function (on) { if (on) turn(want, 'instant'); });
  var ro = new ResizeObserver(string); ro.observe(card);
  turn(want, 'instant');
  return {
    el: host,
    destroy: function () {
      off(); offRm(); loop.stop(); ro.disconnect(); focus.destroy();
      ['zh', 'en'].forEach(function (l) { marks[l].band.destroy(); marks[l].note.destroy(); });
      host.textContent = '';
    }
  };
}
