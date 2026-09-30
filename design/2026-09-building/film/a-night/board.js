/* a-night/board.js — the storyboard of the whole film (about 90 s), twelve panels drawn with the test's own parts.
   board.html renders it as one 1920×1080 frame: node kit/render.mjs a-night/board --stills 0 won't work (it is a
   page of this folder), so: BASE=… node kit/render.mjs a-night --stills 0 with ?board, see README. */
(function () {
  'use strict';
  var F = FILM, N = NIGHT, C = F.C, img = {};
  var PW = 440, PH = 248, GX = 32, GY = 92, X0 = (1920 - 4 * PW - 3 * GX) / 2, Y0 = 40;
  var cv = document.getElementById('c'), ctx = cv.getContext('2d');

  // a panel: world camera (cx, cy, s), then fn draws in world px
  function panel(i, cx, cy, s, fn, cap) {
    var px = X0 + (i % 4) * (PW + GX), py = Y0 + Math.floor(i / 4) * (PH + GY);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = C.paper; ctx.fillRect(px, py, PW, PH);
    ctx.beginPath(); ctx.rect(px, py, PW, PH); ctx.clip();
    N.cam.x = cx; N.cam.y = cy; N.cam.s = s;
    ctx.setTransform(s, 0, 0, s, px + PW / 2 - cx * s, py + PH / 2 - cy * s);
    fn();
    ctx.restore();
    ctx.save(); ctx.lineWidth = 1; ctx.strokeStyle = C.lineStrong; ctx.strokeRect(px + .5, py + .5, PW - 1, PH - 1); ctx.restore();
    F.text(ctx, cap[0], px, py + PH + 22, '500 13px "IBM Plex Mono"', C.ink, { spacing: .6 });
    wrap(cap[1], px, py + PH + 42, PW, '400 13px "IBM Plex Mono", "Noto Serif SC"', C.soft);
  }
  function wrap(s, x, y, w, font, col) {
    ctx.save(); ctx.font = font; var words = s.split(' '), line = '', yy = y;
    words.forEach(function (wd) { var t = line ? line + ' ' + wd : wd; if (ctx.measureText(t).width > w && line) { F.text(ctx, line, x, yy, font, col); line = wd; yy += 18; } else line = t; });
    if (line) F.text(ctx, line, x, yy, font, col); ctx.restore();
  }
  var D = [[700, 20], [1650, 20], [2600, 20], [3550, 20], [-250, 20]];
  function line() { N.rope(ctx, D, -1600, 5600, 'the line'); }
  function hang(x, name, o, ang) {
    var y = N.ropeY(x, D) + 30; ctx.save(); ctx.translate(x, y); ctx.rotate((ang || 0) * Math.PI / 180);
    N.print(ctx, Object.assign({ img: img[name], capP: 1, no: '#17', title: 'round one', time: '12:59', old: true }, o || {})); ctx.restore();
    N.peg(ctx, x, y - 30, 0, 'peg' + x);
  }
  function note(x, y, text, w, rot) { // a slip of Fred's, pegged
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot || 0);
    ctx.fillStyle = C.slip; ctx.fillRect(-w / 2, 0, w, 170); ctx.lineWidth = N.penW(.6); ctx.strokeStyle = C.lineStrong; ctx.strokeRect(-w / 2, 0, w, 170);
    F.text(ctx, text, 0, 100, '600 44px Caveat, Muyao', C.ink, { align: 'center' });
    F.text(ctx, '— Fred', w / 2 - 30, 150, '600 26px Caveat', C.soft, { align: 'right' });
    ctx.restore();
  }
  function big(s, x, y, size, col) { F.text(ctx, s, x, y, '500 ' + size + 'px "IBM Plex Mono"', col || C.ink, { align: 'center' }); }

  function render() {
    N.PEN = 1.5;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#F3ECDD'; ctx.fillRect(0, 0, 1920, 1080);
    panel(0, 700, 400, .34, function () {
      line(); note(300, N.ropeY(300, D) + 20, '“not hand-made enough.”', 560, -.03); N.peg(ctx, 300, N.ropeY(300, D) - 10, 0, 'n1');
      note(1100, N.ropeY(1100, D) + 20, '“let it be consistent.”', 560, .025); N.peg(ctx, 1100, N.ropeY(1100, D) - 10, 0, 'n2');
    }, ['00–07 s · the brief', 'Paper, then the line drawn by the pen. Fred\'s own words pegged first, in his hand.']);
    panel(1, 1650, 360, .5, function () {
      line(); ['building-1a', 'building-1b', 'building-2', 'building-t', 'pen-fixes', 'writing-sharp', 'cls-races', 'evidence-ladder', 'rail-extract', 'building-4'].forEach(function (a, i) {
        var x = 900 + i * 165; ctx.save(); ctx.translate(x, N.ropeY(x, D) + 4); N.tag(ctx, a, (i % 2 ? .04 : -.05), a); ctx.restore();
      });
    }, ['07–14 s · many hands', 'The orchestrator ties the agents\' tags along the line, one per job. Tags swing on the pen\'s clock.']);
    panel(2, 1650, 470, .36, function () { line(); hang(700, 'r1-writing'); hang(1650, 'r1-building'); hang(2600, 'r1-principles'); },
      ['14–20 s · round one', 'Round one\'s prints already hang: #17, merged 12:59, the desk became the nav.']);
    panel(3, 1650, 470, .44, function () {
      line(); hang(1150, 'r1-building'); hang(2150, 'main-building', { old: false, no: '#21', title: 'FY.mount: mount once the stylesheets are in', time: '21:46', dev: .5 }, 2);
      for (var k = 0; k < 4; k++) { ctx.lineWidth = N.penW(); ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(2560 + k * 26, 180 - k * 14); ctx.lineTo(2600 + k * 26, 160 - k * 14); ctx.stroke(); }
    }, ['20–30 s · the fixes, one per beat', '16:04–21:46: #18 TOC links, #19 the root, #20 WIP gone, #21 the WebKit race, #22 中文 · EN. Clips land on the beat.']);
    panel(4, 1650, 540, .38, function () {
      line(); hang(1650, 'main-building', { old: false, no: '#23', title: 'Building: a static page', time: '22:35', dev: 1, band: 1 });
      big('LCP 932 → 868 ms', 1650, 812, 50);
    }, ['30–37 s · #23, 22:35', 'The board is there at first render. The pen writes the number on the print\'s margin.']);
    panel(5, 1650, 540, .38, function () {
      line(); hang(1650, 'main-writing', { old: false, no: '#27', title: 'Writing: the book in your hand is sharp', time: '00:39', dev: 1 });
      ctx.lineWidth = N.penW(1.2); ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.arc(1560, 460, 90, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(1624, 524); ctx.lineTo(1700, 600); ctx.stroke();
      big('1.57× → 1.02–1.05×', 1650, 812, 50);
    }, ['37–44 s · #25, #26, #27', 'Three pen bugs; Demos 14 MB → 1.1 MB before scroll; a loupe over the pulled-out book, sharp now.']);
    panel(6, 1650, 500, .42, function () { line(); hang(1650, 'main-dossier', { old: false, no: '#28', title: 'Building: every card gets its dossier', time: '01:09', dev: .75 }); },
      ['44–52 s · #28, 01:09', 'The print develops as the test does: the card in your hand, the dossier slid out, its tabs.']);
    panel(7, 1650, 540, .3, function () {
      line(); hang(1150, 'main-home', { old: false, no: '#29', title: 'Fonts: self-hosted', time: '02:05', dev: 1 }, -1); hang(2150, 'main-writing', { old: false, no: '#30', title: 'no layout shift', time: '03:10', dev: 1 }, 1.5);
      big('0 Google requests', 1150, 830, 40); big('no layout shift', 2150, 830, 40);
    }, ['52–58 s · #29, #30', 'Zero Google requests, home ~300 ms faster over HTTP/2; the phone layout-shift races fixed.']);
    panel(8, 1650, 560, .3, function () {
      line(); hang(1650, 'main-home', { old: false, no: '#31', title: 'Identity: the seals', time: '03:27', dev: 1 });
      N.drawLockup(ctx, 1650 - 2.6 * 84, 740, 2.6, 1, [1, 1]);
    }, ['58–66 s · #31, 03:27', 'The one register break: the print is the header; the pen writes 继续写，继续造 on it, two stamps.']);
    panel(9, 2125, 540, .28, function () {
      line(); hang(1650, 'main-principles-read', { old: false, no: '#32', title: 'Fred Agent: the five chapters', time: '04:20', dev: 1 }); hang(2600, 'main-njjoe', { old: false, no: '#34', title: 'NJJoe, in the dossier', time: '09:31', dev: 1, band: 1 }, 1);
      big('CLS 0.061–0.074 → 0.000–0.001', 2380, 830, 32);
    }, ['66–75 s · #32, #33, then morning #34', 'The rail as contents, Overview LCP 944 → 820 ms; the board in Fraunces; NJJoe\'s CLS to zero at 09:31.']);
    panel(10, 2150, 560, .1, function () {
      line(); for (var k = -1; k < 3; k++) hang(700 + k * 950, ['main-writing', 'main-building', 'main-dossier', 'main-principles-read', 'main-system', 'main-njjoe'][k + 1], { old: false, no: '#' + (23 + k * 2), title: '', time: '', dev: 1 }, (k % 2) * 1.5);
      N.peg(ctx, 4050, N.ropeY(4050, D), 2, 'pr3'); F.text(ctx, 'PR 3 · in flight', 3950, 820, '600 150px Caveat', C.soft, { align: 'center' });
    }, ['75–83 s · dawn, the whole line', 'The camera pulls back on 17 prints. One peg is still open: PR 3, the tab that flies, in flight.']);
    panel(11, 960, 540, .32, function () {
      ctx.save(); ctx.translate(960 - 5 * 84, 180); N.drawLockup(ctx, 0, 0, 5, 1, [1, 1]); ctx.restore();
      F.text(ctx, 'Made with Claude Opus 5.5', 960, 700, '500 44px "IBM Plex Mono"', C.ink, { align: 'center' });
      F.text(ctx, 'round one\'s before: Claude Design (Fable 5) + GPT-5.6-sol', 960, 780, '500 34px "IBM Plex Mono"', C.soft, { align: 'center' });
    }, ['83–90 s · the seal', 'The motto written, the seals stamped, the credits typed. The last note rings out.']);
    F.text(ctx, 'A · 一夜 · ONE NIGHT, MANY HANDS — STORYBOARD OF THE FULL FILM (~90 s)', X0, 1060, '500 14px "IBM Plex Mono", "Noto Serif SC"', C.pencil, { spacing: 1.2 });
  }

  var names = ['r1-writing', 'r1-building', 'r1-principles', 'main-building', 'main-writing', 'main-dossier', 'main-home', 'main-principles-read', 'main-njjoe', 'main-system'];
  F.film({
    dur: 1, cues: [],
    setup: function () {
      return Promise.all([F.siteFonts('../'), fetch('lockup.svg').then(function (r) { return r.text(); }).then(N.loadLockup)]
        .concat(names.map(function (n) { return F.img('../captures/' + n + '.jpg').then(function (i) { img[n] = i; }); })));
    },
    render: render
  });
})();
