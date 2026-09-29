/* Board 10 — four openers, each played live in an iframe at desktop or phone framing. */
(function () {
  var C = [
    { k: 'A', f: '10-opener-a.html', name: 'The desk draws itself', cn: '一笔画', mech: 'traced strokes · timelapse hand · 3.18 s',
      beats: 'Loading is drawing. On blank cream the table appears first, slow and deliberate. Then the hand speeds up through the laptop, mug, book and portrait, and the plant and camera arrive in a rush. Each object is traced thin, then inked to full weight. The colour lands in one beat: the coral cat is drawn on the mug, the teal ghost is stamped on the camera, and the bird hops in. The same pen writes 在造 building / 关于 about / 在拍 shooting / 在写 writing, the steam starts, and the portrait blinks once. On a phone a camera follows the pen around the desk.',
      breaks: '<b>breaks</b> one accent per view (three colours within 300 ms) · <b>keeps</b> one pass per stroke, wobble not jitter, Fred’s line as the whole show',
      trade: '<b>weight</b> ≈ 49 KB (traced strokes 7 KB gz) · <b>runtime</b> ~400 SVG paths, loop stops when done · <b>bonus</b> the same vector investment makes the art themeable and crisp at 3× (board 11)' },
    { k: 'B', f: '10-opener-b.html', name: 'Ink bloom', cn: '墨晕', mech: 'WebGL shader · paper capillarity · 2.76 s',
      beats: 'A blank sheet. Ink drops land one per object, each with a crown of droplets, and bloom through the paper’s fibres. The drawing appears wherever the ink travels, and ink wicks along the drawn lines faster than across bare paper, so table edges and plant stems draw themselves. Blooms merge into dark seams, then the sheet dries: seams open into pale rivers, tide lines and coffee rings. Colour arrives last as small watercolour drops (the bird, the cat, the ghost, the ✦), then hand-off to the live desk.',
      breaks: '<b>breaks</b> no gradients / washes, tone-as-countable-marks, one accent · <b>keeps</b> the end frame is Fred’s drawing unchanged, no gloss, no flashes',
      trade: '<b>weight</b> ≈ 39 KB code + 209 KB generated maps · <b>GPU</b> 0.4–0.8 ms/frame (M-series; weak GPUs untested) · <b>fallback</b> Canvas2D ink-wipe without fibres' },
    { k: 'C', f: '10-opener-c.html', q: '&ctl=0', pick: true, name: 'The OP, then the eyecatch', cn: '日常 OP → 过场', mech: '12 fps hard cuts · register break · 3.12 s',
      beats: '1.8 s of manic OP on a held-pose clock: 弗 F on yolk, 雷 RE on pool, 德 D on bubblegum, then a huge FRED on ink. Each object gets a 1–3-frame hero shot on its own colour field with speed lines, a smear frame and a bilingual shout (在造 building! 在拍 shooting! with 咔嚓). Then the bird in deadpan extreme close-up, and “…”. Hard cut to silence: one mug floating in cream, “弗雷德的日常 · FRED’S DAILY LIFE · ep.NN” (your real visit count), 520 ms of nothing. The camera pulls back into the desk.',
      breaks: '<b>breaks</b> one accent, low chroma, light-only, no flashes (22 cuts, audited ≤ 2/s), no solid fill · <b>keeps</b> Fred’s art and pen, bird identity, the hand clock',
      trade: '<b>weight</b> ≈ 167 KB WebP art + 35 KB code, no new fonts · <b>risk</b> the loudest, most divisive option: it’s a tribute, not a quiet default · <b>bonus</b> the only one that’s funny' },
    { k: 'D', f: '10-opener-d.html', name: 'The chain-reaction gag', cn: '连锁反应', mech: 'rigid-body drops · deadpan bird · ~3.16 s warm',
      beats: 'An empty desk. A coral pen line draws across it, tracking real downloaded bytes (“loading 加载中 · 52%”). The bird hops in, leans down and stares at the line for exactly as long as loading takes, then pecks it. The line snaps like elastic, and after a beat of nothing the objects fall in a drum fill: the laptop thuds (the table shakes 3 px) and its caret blinks on, the mug puffs steam, the book slaps down and flips a page, the frame lands face-down, the camera goes 咔嚓, and the plant lands last and pops the portrait upright, surprised. Hard cut to the bird, alone and large, over “日常 ep.NN · 第 N 次来”. It blinks once, then cuts back to the live page.',
      breaks: '<b>breaks</b> the calm-desk economy, the two-clock split (objects fall on 60 fps physics; every reaction stays on held frames) · <b>keeps</b> honest loading as the actual joke, bird identity, 萌 not 媚',
      trade: '<b>weight</b> ≈ 36 KB masks + 50 KB code, no new art · <b>risk</b> honest means slow on a cold connection (the bird waits, with “tap to skip”); the bird is small at desk scale until the eyecatch' }
  ];

  var host = document.getElementById('cands');
  C.forEach(function (c) {
    var a = document.createElement('article');
    a.className = 'cand' + (c.pick ? ' pick' : ''); a.id = 'cand-' + c.k.toLowerCase();
    a.innerHTML =
      '<div class="cand-head"><span class="cand-letter">' + c.k + '</span><span class="cand-name">' + c.name + ' <span class="display-cn">' + c.cn + '</span></span><span class="cand-mech">' + c.mech + '</span></div>' +
      '<div class="screen"><div class="poster"><span>▶ play · 播放</span></div></div>' +
      '<div class="opts"><button data-v="desk" aria-pressed="true">1440</button><button data-v="phone" aria-pressed="false">390</button>' +
      '<button data-m="first" aria-pressed="true">first visit</button><button data-m="returning" aria-pressed="false">returning</button>' +
      '<span class="sp"></span><button data-play>↻ replay</button><a href="' + c.f + '" target="_blank" rel="noopener">full screen ↗</a></div>' +
      '<div class="cand-foot"><div><div class="beats">' + c.beats + '</div><div class="breaks">' + c.breaks + '</div><div class="tradeoff">' + c.trade + '</div></div></div>';
    host.appendChild(a);
    wire(a, c);
  });

  function wire(a, c) {
    var st = { v: 'desk', m: 'first' }, screen = a.querySelector('.screen'), frame = null, seen = false;
    function fit() {
      if (!frame) return;
      if (st.v === 'desk') { var s = screen.clientWidth / 1440; frame.style.width = '1440px'; frame.style.height = '900px'; frame.style.transform = 'scale(' + s + ')'; }
      else { var d = screen.querySelector('.device'), s2 = d.clientHeight / 844; frame.style.width = '390px'; frame.style.height = '844px'; frame.style.transform = 'scale(' + s2 + ')'; }
    }
    function play() {
      seen = true;
      screen.innerHTML = '';
      screen.classList.toggle('phone', st.v === 'phone');
      var box = screen;
      if (st.v === 'phone') { box = document.createElement('div'); box.className = 'device'; screen.appendChild(box); }
      frame = document.createElement('iframe');
      frame.title = c.name + ' opener preview';
      frame.src = c.f + '?mode=' + st.m + (c.q || '') + '&r=' + Date.now();
      box.appendChild(frame);
      fit();
    }
    a.querySelector('.poster').addEventListener('click', play);
    a.querySelector('[data-play]').addEventListener('click', play);
    a.querySelectorAll('[data-v]').forEach(function (b) {
      b.addEventListener('click', function () { st.v = b.dataset.v; a.querySelectorAll('[data-v]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); play(); });
    });
    a.querySelectorAll('[data-m]').forEach(function (b) {
      b.addEventListener('click', function () { st.m = b.dataset.m; a.querySelectorAll('[data-m]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); play(); });
    });
    addEventListener('resize', fit);
    new IntersectionObserver(function (es, io) {
      if (es[0].isIntersecting && !seen) { io.disconnect(); play(); }
    }, { threshold: .6 }).observe(screen);
  }

  window.OPENER_BOARD = { C: C };
})();
