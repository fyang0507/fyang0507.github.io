/* design/2026-10-essays/switch-b.js — candidate B, 挂牌: a two-sided sign hung on a nail at the head of the bookcase,
   as a shop hangs 营业中 / OPEN. One face says 中文, the other English, each in the face the spines set it in; the
   face you see is the language the shelf reads in, banded by the pen. Each face names the other in its own language
   ("flip · English" on the Chinese face, "翻面 · 中文" on the English one), so whoever needs the other side can read
   how to get it.
   A press turns the sign over on its string (physics clock: a spring, one small overshoot) and the push swings it on
   its nail (a damped pendulum). The shelf retitles as the sign passes edge-on, and the pen bands the new face once it
   has landed (hand's clock). Hover = the coral line under the other language's name; keyboard focus = coral 「 」
   around the card; no coral at rest. Desk: the sign hangs above the shelf's first books, in a row of its own over the
   case. Phone: it hangs at the top left of the swipe shelf, the cue moving right to make room.
   One button: its name says what is showing and what a press does. */
var FACE = {
  zh: { k: '<span lang="zh">书架</span> · shelf', big: '中文', hint: 'flip · ', to: 'English', tl: 'en', label: 'Shelf language: Chinese · 书架语言：中文 — switch to English' },
  en: { k: 'shelf · <span lang="zh">书架</span>', big: 'English', hint: '<span lang="zh">翻面</span> · ', to: '中文', tl: 'zh', label: 'Shelf language: English · 书架语言：English — 切换到中文' }
};
function face(l) {
  var f = FACE[l];
  return '<span class="swb-face swb-' + l + '" aria-hidden="true"><span class="swb-k">' + f.k + '</span><span class="swb-big" lang="' + l + '">' + f.big + '</span>' +
    '<span class="swb-hint">' + f.hint + '<span class="swb-to" lang="' + f.tl + '">' + f.to + '</span></span></span>';
}
var other = function (l) { return l === 'zh' ? 'en' : 'zh'; };
var angle = function (l) { return l === 'en' ? 180 : 0; };

function Sign(body, lang) {
  var host = body.parentNode, phone = host.classList.contains('is-phone');
  var el = document.createElement('div');
  el.className = 'swb' + (phone ? ' swb--phone' : '');
  el.innerHTML = '<div class="swb-hang"><div class="swb-flip"><svg class="swb-string" aria-hidden="true" width="1" height="1"><path/></svg>' +
    '<button type="button" class="swb-card">' + face('zh') + face('en') + '</button></div><i class="swb-nail" aria-hidden="true"></i></div>';
  if (phone) body.querySelector('.wr-case').appendChild(el); else body.insertBefore(el, body.firstChild);
  var hang = el.querySelector('.swb-hang'), flip = el.querySelector('.swb-flip'), card = el.querySelector('.swb-card');
  var faces = { zh: el.querySelector('.swb-zh'), en: el.querySelector('.swb-en') };
  string();

  // The string runs from the card's two holes (switch-cands.css's ::before / ::after) up to the nail, in the card's
  // own plane, so it turns with the card.
  function string() {
    var hole = getComputedStyle(faces.zh, '::before'), r = parseFloat(hole.width) / 2;
    var w = card.offsetWidth, hx = parseFloat(hole.left) + r, hy = card.offsetTop + parseFloat(hole.top) + r;
    el.querySelector('.swb-string path').setAttribute('d', 'M' + hx + ' ' + hy + ' L' + (w / 2) + ' 0.5 L' + (w - hx) + ' ' + hy);
  }

  // The pen: on each face, the band under the big word and the notice line under the other language's name.
  var marks = {};
  ['zh', 'en'].forEach(function (l) {
    var f = faces[l];
    marks[l] = { band: new TierMark(f, f.querySelector('.swb-big'), { over: 5, seed: 'swb|' + l }), note: new TierMark(f, f.querySelector('.swb-to'), { over: 2, seed: 'swb-to|' + l }) };
  });
  var focus = new FocusMark(el, card, { gap: 7, gy: 6 });

  var want = lang.get(), from = want, crossed = true, landed = true, hovered = false;   // from: the face showing as a turn began
  var phi = new Motion.Spring({ x: angle(want), k: 150, zeta: 0.74 }), sw = { phi: 0, w: 0, target: 0 };
  function shown() { return phi.x >= 90 ? 'en' : 'zh'; }
  // The face toward you is shown by the card's angle, not by backface-visibility: WebKit flattens a face that holds
  // the pen's blended layers and would draw the far face, mirrored, over the near one.
  var side = null;
  function paint() {
    flip.style.transform = 'perspective(720px) rotateY(' + phi.x.toFixed(2) + 'deg)';
    hang.style.transform = 'rotate(' + (sw.phi * 180 / Math.PI).toFixed(3) + 'deg)';
    if (shown() !== side) { side = shown(); faces.zh.style.opacity = side === 'zh' ? '' : '0'; faces.en.style.opacity = side === 'en' ? '' : '0'; }
  }
  function label() { card.setAttribute('aria-label', FACE[want].label); }
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
    // Edge-on: the shelf turns with the sign. The face going away gives up its band where no one sees it (a second
    // press before edge-on sends the sign back with the same face showing, and nothing to give up).
    if (!crossed && shown() === want) {
      crossed = true; label();
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
      phi.snap(angle(l)); sw.phi = sw.w = 0; crossed = landed = true; label();
      if (lang.get() !== l) lang.set(l, 'instant');
      rest('instant'); paint(); return;
    }
    from = shown(); phi.to = angle(l); crossed = false; landed = false;
    marks.zh.note.to(0, 'hover'); marks.en.note.to(0, 'hover');
    sw.w += (l === 'en' ? 1 : -1) * 0.85;        // the push swings it on its nail
    loop.kick();
  }
  card.addEventListener('click', function (e) { turn(other(want), e.detail === 0 ? 'key' : 'press'); });
  card.addEventListener('pointerenter', function (e) { if (e.pointerType === 'touch') return; hovered = true; if (landed) marks[want].note.to(1, 'hover'); });
  card.addEventListener('pointerleave', function () { hovered = false; marks[want].note.to(0, 'hover'); });
  card.addEventListener('focus', function () { focus.set(card.matches(':focus-visible')); });
  card.addEventListener('blur', function () { focus.set(false); });
  // A change made elsewhere (back from Reading through the bfcache): the sign shows it at once. Our own set at
  // edge-on arrives here too, already accounted for.
  var off = lang.on(function (l) { if (l !== want || !crossed) turn(l, 'instant'); });
  var offRm = Motion.onReduced(function (on) { if (on) turn(want, 'instant'); });
  var ro = new ResizeObserver(string); ro.observe(card);
  turn(want, 'instant');
  return {
    destroy: function () {
      off(); offRm(); loop.stop(); ro.disconnect(); focus.destroy();
      ['zh', 'en'].forEach(function (l) { marks[l].band.destroy(); marks[l].note.destroy(); });
      el.remove();
    }
  };
}

export function start(lang) {
  var sign = null;
  // app.js builds .wr-body afresh on every mount (a layout change across 760 px): hang the sign again each time.
  FY.mount('.wr-body', function (body) { if (sign) sign.destroy(); sign = Sign(body, lang); });
}
