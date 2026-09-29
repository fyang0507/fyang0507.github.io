/* 09 · HomeDesk — a faithful, reusable copy of the live home desk (index.html:128–209, 239–406).
   HomeDesk.build(host, opt) renders the scene and runs today's behaviours: the random bird hop
   loop, the portrait's idle blink, the camera-hover surprise, and (unless opt.laptop === false)
   the canned "$ make life" typing. Candidates take control of pieces through the returned api. */
(function () {
  var A = '../../assets/', P = '../../';
  var TPL =
    '<div class="desk drawn">' +
    '<img class="scene-img" src="' + A + 'desk-scene2-light.png" alt="A hand-drawn desk: laptop, a mug, a plant, a film camera" draggable="false">' +
    '<div class="bookhold"><div class="bookface"></div></div>' +
    '<div class="frameface" aria-hidden="true"><div class="fframe"></div></div>' +
    '<svg class="arrows" viewBox="0 0 1448 1086" aria-hidden="true">' +
    '<g class="d2"><path class="stroke" d="M500 1035 Q620 1010 640 935" stroke-width="2"/><path class="stroke" d="M623 957 l17 -22 5 26" stroke-width="2"/></g>' +
    '<g class="d3"><path class="stroke" d="M430 110 Q480 140 498 240" stroke-width="2"/><path class="stroke" d="M483 219 l15 21 7 -25" stroke-width="2"/></g>' +
    '<g class="d4"><path class="stroke" d="M1042 108 Q1035 225 952 342" stroke-width="2"/><path class="stroke" d="M942 320 l10 24 18 -14" stroke-width="2"/></g>' +
    '<g class="d5"><path class="stroke" d="M960 1035 Q1030 1000 1040 903" stroke-width="2"/><path class="stroke" d="M1026 925 l14 -22 9 25" stroke-width="2"/></g>' +
    '</svg>' +
    '<a class="navnote nav-write" href="' + P + 'Writing.dc.html" style="left:27%;top:96%"><span class="lbl rise" style="transform:rotate(-1.5deg);animation-delay:.2s">在写 writing</span></a>' +
    '<a class="navnote nav-build" href="' + P + 'Building.dc.html" style="left:23.5%;top:5%"><span class="lbl rise" style="transform:rotate(-2deg);animation-delay:.26s">在造 building</span></a>' +
    '<a class="navnote nav-about" href="' + P + 'About.dc.html" style="left:66.5%;top:3.6%"><span class="lbl rise" style="transform:rotate(-2deg);animation-delay:.32s">关于 about</span></a>' +
    '<a class="navnote nav-shoot" href="' + P + 'Gallery.dc.html" style="left:60%;top:96%"><span class="lbl rise" style="transform:rotate(-1deg);animation-delay:.38s">在拍 shooting</span></a>' +
    '<svg class="steam" viewBox="0 0 100 110" aria-hidden="true"><path class="st1" d="M25 92 q9 -11 0 -22 q-9 -11 0 -22"/><path class="st2" d="M52 100 q10 -12 0 -24 q-10 -12 0 -24 q7 -9 3 -16"/><path class="st3" d="M79 92 q9 -11 0 -22 q-9 -11 0 -22"/></svg>' +
    '<a class="hot lap" href="' + P + 'Building.dc.html" aria-label="Building — 在造"></a>' +
    '<div class="screen"><span class="typed"></span><span class="caret" aria-hidden="true"></span></div>' +
    '<div class="bird" role="img" aria-label="A small yellow bird hopping on the desk"><div class="bframe"></div></div>' +
    '<a class="hot bookwrap" href="' + P + 'Writing.dc.html" aria-label="Writing — 在写"></a>' +
    '<a class="hot framewrap" href="' + P + 'About.dc.html" aria-label="About — 关于"></a>' +
    '<a class="hot camwrap" href="' + P + 'Gallery.dc.html" aria-label="Shooting — 在拍"><svg class="cstar" viewBox="0 0 40 40" aria-hidden="true"><g fill="none" stroke="var(--mark)" stroke-width="3" stroke-linecap="round"><path d="M20 2 V12"/><path d="M20 28 V38"/><path d="M2 20 H12"/><path d="M28 20 H38"/><path d="M8.5 8.5 L14 14"/><path d="M26 26 L31.5 31.5"/><path d="M31.5 8.5 L26 14"/><path d="M14 26 L8.5 31.5"/></g></svg></a>' +
    '<div class="sceneflash" aria-hidden="true"></div>' +
    '<div class="kacha" aria-hidden="true">咔嚓 click! ✦</div>' +
    '<span class="spark" aria-hidden="true">✦</span>' +
    '</div>';

  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function rm() { return window.Pen ? Pen.reduced() : false; }

  function build(host, opt) {
    opt = opt || {};
    host.innerHTML = TPL;
    var d = host.querySelector('.desk');
    var api = { el: d, alive: true, visible: false, q: function (s) { return d.querySelector(s); } };

    // Loops only run while the desk is on screen (and never under reduced motion).
    new IntersectionObserver(function (es) { api.visible = es[0].isIntersecting; }, { rootMargin: '80px' }).observe(d);
    api.ready = function () {
      return new Promise(function (res) { (function chk() { if (api.visible && !rm()) res(); else setTimeout(chk, 350); })(); });
    };
    api.rect = function () { return d.getBoundingClientRect(); };

    // Portrait: 0 neutral · 1 blink · 2 smile · 3 surprised. frameHeld blocks the idle blink.
    var fframe = d.querySelector('.fframe');
    api.frameHeld = false;
    api.setFrame = function (i) { fframe.style.backgroundPosition = (i * 100 / 3) + '% 0'; };
    (async function blink() {
      while (api.alive) {
        await sleep(3200 + Math.random() * 3800);
        await api.ready();
        if (api.frameHeld) continue;
        api.setFrame(1); await sleep(170); if (!api.frameHeld) api.setFrame(0);
      }
    })();
    [d.querySelector('.camwrap'), d.querySelector('.nav-shoot')].forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        if (api.frameHeld) return;
        api.frameHeld = true; api.setFrame(3);
        clearTimeout(api._sup); api._sup = setTimeout(function () { api.frameHeld = false; api.setFrame(0); }, 900);
      });
    });

    api.bird = makeBird(d, api);
    api.bird.idle();

    // Today's laptop: caret idles; the canned line types while the laptop (or 在造) is hovered.
    if (opt.laptop !== false) {
      var typed = d.querySelector('.screen .typed'), timer;
      var txt = '$ make life\n> building agents…\n> writing essays…';
      [d.querySelector('.lap'), d.querySelector('.nav-build')].forEach(function (el) {
        el.addEventListener('mouseenter', function () {
          clearInterval(timer); var i = 0; typed.textContent = '';
          if (rm()) { typed.textContent = txt; return; }
          timer = setInterval(function () { i++; typed.textContent = txt.slice(0, i); if (i >= txt.length) clearInterval(timer); }, 70);
        });
        el.addEventListener('mouseleave', function () { clearInterval(timer); typed.textContent = ''; });
      });
    }

    api.replayDraw = function () { d.classList.remove('drawn'); void d.offsetWidth; d.classList.add('drawn'); };
    return api;
  }

  // The bird: the same six-frame hop as birdLoop (index.html:380–406), split into verbs a
  // candidate can call. held = the idle loop yields between hops; busy = mid-hop (don't interrupt).
  function makeBird(d, api) {
    var el = d.querySelector('.bird'), fr = el.querySelector('.bframe');
    var b = { el: el, x: 14, dir: -1, min: 8, max: 24, busy: false, held: false };
    b.setF = function (i) { fr.style.backgroundPosition = (i * 20) + '% 0'; };
    b.apply = function () {
      el.style.left = b.x + '%';
      el.style.transform = b.dir > 0 ? 'scaleX(-1)' : '';
    };
    b.face = function (dir) { b.dir = dir; b.apply(); };
    b.hop = async function (dir, dist) {
      b.busy = true; dist = dist == null ? 1.5 : dist;
      var seq = [[1, 90, 0], [2, 95, .3], [3, 105, .4], [4, 90, .3], [5, 70, 0], [0, 90, 0]];
      for (var s = 0; s < seq.length; s++) {
        b.setF(seq[s][0]); b.x += seq[s][2] * dist * dir; b.apply();
        await sleep(seq[s][1]);
      }
      b.busy = false;
    };
    b.settle = async function () { while (b.busy) await sleep(30); };
    b.center = function () {
      var r = d.getBoundingClientRect(), w = r.width * .07, h = w * 317 / 308;
      return { x: r.left + r.width * b.x / 100 + w / 2, y: r.top + r.height * .675 + h * .62, w: w, h: h };
    };
    b.idle = async function () {
      await sleep(2000);
      while (api.alive) {
        await sleep(500 + Math.random() * 1200);
        await api.ready();
        if (b.held) continue;
        if (b.x < b.min) b.dir = 1; else if (b.x > b.max) b.dir = -1; else if (Math.random() < .45) b.dir = -b.dir;
        b.apply();
        var hops = 2 + Math.floor(Math.random() * 3);
        for (var h = 0; h < hops && !b.held; h++) {
          if ((b.dir > 0 && b.x > b.max + 3) || (b.dir < 0 && b.x < b.min - 3)) break;
          await b.hop(b.dir); await sleep(130);
        }
      }
    };
    return b;
  }

  window.HomeDesk = { build: build, sleep: sleep };
})();
