/* 09 · A — "The desk notices you". Presence without gimmick, three subjects, three causes:
   bird   — the cursor comes near → it stops, hops round to face you, holds the stare (呆萌); come very close
            → it hops a little way off and looks back. It never moves toward you.
   portrait — the cursor lingers near → blink, then the existing "surprised" frame held a beat
            (he looks up at you), blink, back to deadpan. Once per approach.
   steam  — fast cursor movement near the mug → the steam leans away and recovers. The lean is a
            spring, but it is sampled at 12 fps so a drawn thing still moves on the hand's clock.
   Everything idles back to today's calm desk. */
(function () {
  var sleep = HomeDesk.sleep;

  window.HomeA = function (host) {
    var desk = HomeDesk.build(host), d = desk.el, bird = desk.bird;
    var marks = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    marks.setAttribute('class', 'notice-marks'); marks.setAttribute('viewBox', '0 0 40 30'); marks.setAttribute('aria-hidden', 'true');
    d.appendChild(marks);

    var S = { in: false, x: 0, y: 0, t: 0, vx: 0, vy: 0, speed: 0 };
    var B = { near: false, leaveT: 0, lastFlee: 0, lastMarks: -1e9, lastFace: 0, queue: Promise.resolve(), pending: false };
    var F = { near: false, lingerT: 0, cool: 0, glancing: false };

    function act(fn) {                         // bird verbs run one at a time, never mid-hop
      if (B.pending) return; B.pending = true;
      B.queue = B.queue.then(function () { B.pending = false; return fn(); }).catch(function () { B.pending = false; });
    }
    function birdDist() { var c = bird.center(), r = desk.rect(); return { d: Math.hypot(S.x - c.x, S.y - c.y) / r.width, side: S.x < c.x ? -1 : 1 }; }
    // the sprite faces left by default (dir -1 = facing left)
    async function turnHop(dir) {              // hop in place to turn round: crouch, lift, flip mid-air, land
      bird.busy = true;
      bird.setF(1); await sleep(80); bird.setF(2); await sleep(90);
      bird.face(dir); bird.setF(3); await sleep(100); bird.setF(4); await sleep(80); bird.setF(0);
      bird.busy = false;
    }
    function showMarks() {
      if (Pen.reduced() || performance.now() - B.lastMarks < 14000) return;
      B.lastMarks = performance.now();
      var c = bird.center(), r = desk.rect(), fx = bird.dir < 0 ? -1 : 1;
      marks.style.left = ((c.x - r.left) / r.width * 100 + fx * 1.2) + '%';
      marks.style.top = ((c.y - r.top - c.h * .58) / r.height * 100) + '%';
      marks.style.transform = 'translate(-50%,-50%) scaleX(' + (fx < 0 ? 1 : -1) + ')';
      marks.innerHTML = '';
      var ps = ['M9 22 L4 17', 'M17 17 L16 9', 'M25 20 L30 13'].map(function (dd, i) {
        var p = Pen.path(dd, { color: 'var(--ink)', width: 1.8 }); marks.appendChild(p); Pen.draw(p, { duration: 140, delay: i * 50 }); return p;
      });
      setTimeout(function () { ps.forEach(function (p) { Pen.erase(p, { duration: 160 }); }); }, 820);
    }

    function birdNotice() {
      B.near = true; bird.held = true; clearTimeout(B.leaveT);
      act(async function () {
        await bird.settle();
        if (!B.near) return;
        bird.setF(0); await sleep(170);                          // freeze
        var s = birdDist().side;
        if (s !== bird.dir) await turnHop(s); else { bird.setF(5); await sleep(90); bird.setF(0); }
        showMarks();
        await sleep(120); if (!B.near) return;
        B.lastFace = performance.now();                           // and holds the stare
      });
    }
    function birdFlee() {
      var now = performance.now(); if (now - B.lastFlee < 900 || bird.busy) return;
      B.lastFlee = now;
      act(async function () {
        await bird.settle();
        var away = -birdDist().side, room = away > 0 ? 31 - bird.x : bird.x - 4, n = Math.min(2, Math.floor(room / 1.8));
        bird.face(away);
        bird.setF(1); await sleep(130);                           // anticipation
        if (n <= 0) { bird.setF(5); await sleep(420); }           // cornered: a flinch, not a charge
        for (var i = 0; i < n; i++) { await bird.hop(away, 1.8); await sleep(90); }
        await sleep(260);
        if (B.near) { bird.face(birdDist().side); bird.setF(5); await sleep(80); bird.setF(0); }
      });
    }
    function birdLeave() {
      B.near = false;
      clearTimeout(B.leaveT);
      B.leaveT = setTimeout(function () {                           // keeps looking where you were, then lets go
        act(async function () { await bird.settle(); if (B.near) return; await sleep(520); if (!B.near) bird.held = false; });
      }, 1100);
    }
    function birdCheck() {
      if (Pen.reduced()) return;
      var k = birdDist();
      if (!B.near && k.d < .15) birdNotice();
      else if (B.near && k.d > .21) birdLeave();
      if (B.near && k.d < .065) birdFlee();
      if (B.near && !bird.busy && !B.pending && k.side !== bird.dir && performance.now() - B.lastFace > 280) {
        B.lastFace = performance.now();
        act(async function () { await sleep(260); if (!B.near || birdDist().side === bird.dir) return; bird.setF(5); await sleep(80); bird.face(birdDist().side); bird.setF(0); });
      }
    }

    // Portrait: linger ≈ 650 ms within reach, moving slowly, not on the hotspot itself.
    function frameCenter() { var r = desk.rect(); return { x: r.left + r.width * .63, y: r.top + r.height * .427, w: r.width }; }
    async function glance() {
      if (F.glancing) return; F.glancing = true; desk.frameHeld = true;
      desk.setFrame(1); await sleep(130); desk.setFrame(3); await sleep(1400);
      desk.setFrame(1); await sleep(120); desk.setFrame(0);
      desk.frameHeld = false; F.glancing = false; F.cool = performance.now() + 5000;
    }
    function frameCheck(target) {
      if (Pen.reduced()) return;
      var c = frameCenter(), dd = Math.hypot(S.x - c.x, S.y - c.y) / c.w;
      var onHot = target && target.closest && target.closest('.framewrap');
      var near = dd < .13 && !onHot;
      if (near && !F.near) { F.near = true; }
      if (!near && F.near) { F.near = false; clearTimeout(F.lingerT); F.lingerT = 0; if (!F.glancing) F.cool = Math.min(F.cool, performance.now() + 1500); }
      if (near && !F.lingerT && performance.now() > F.cool) {
        F.lingerT = setTimeout(function () {                      // still here, and no longer sweeping past
          F.lingerT = 0; var still = performance.now() - S.t > 120 || S.speed < .45;
          if (F.near && still) glance(); else if (F.near) frameCheck(null);
        }, 650);
      }
    }

    // Steam: a damped spring (ζ≈.55, one small overshoot), rendered at 12 fps.
    var steam = d.querySelector('.steam'), sp = { a: 0, w: 0, raf: 0, last: 0, drawn: 0 };
    function steamKick() {
      if (Pen.reduced() || S.speed < .55) return;
      var r = desk.rect(), sx = r.left + r.width * .297, sy = r.top + r.height * .51;
      var dd = Math.hypot(S.x - sx, S.y - sy) / r.width; if (dd > .2) return;
      var dir = S.vx > 0 ? 1 : -1, prox = 1 - dd / .2;           // a fast pass drags the air with it
      sp.w += dir * Math.min(2.4, Math.abs(S.vx)) * prox * 1.3 * S.dt;   // deg/s, integrated over the pass
      if (!sp.raf) { sp.last = performance.now(); sp.raf = requestAnimationFrame(steamStep); }
    }
    function steamStep(now) {
      var dt = Math.min(.05, (now - sp.last) / 1000); sp.last = now;
      sp.w += (-50 * sp.a - 7.8 * sp.w) * dt; sp.a += sp.w * dt;
      sp.a = Math.max(-16, Math.min(16, sp.a));
      if (now - sp.drawn > 83) { sp.drawn = now; steam.style.transform = 'skewX(' + (-sp.a).toFixed(1) + 'deg)'; }
      if (Math.abs(sp.a) < .15 && Math.abs(sp.w) < .5) { sp.a = sp.w = 0; steam.style.transform = ''; sp.raf = 0; return; }
      sp.raf = requestAnimationFrame(steamStep);
    }

    function track(e) {
      var now = performance.now(), dt = Math.max(8, now - S.t);
      if (S.in && now - S.t < 120) {
        var vx = (e.clientX - S.x) / dt, vy = (e.clientY - S.y) / dt;
        S.vx = S.vx * .6 + vx * .4; S.vy = S.vy * .6 + vy * .4;
      } else { S.vx = S.vy = 0; }
      S.speed = Math.hypot(S.vx, S.vy); S.dt = Math.min(32, dt); S.x = e.clientX; S.y = e.clientY; S.t = now; S.in = true;
    }
    d.addEventListener('pointermove', function (e) { track(e); birdCheck(); frameCheck(e.target); steamKick(); });
    d.addEventListener('pointerleave', function () { S.in = false; S.speed = 0; if (B.near) birdLeave(); frameCheck(null); F.near = false; clearTimeout(F.lingerT); F.lingerT = 0; });
    // Touch has no hover: a tap is a brief presence (poke the bird, poke the portrait).
    d.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse') return;
      track(e); S.speed = 0; birdCheck();
      var c = frameCenter(); if (Math.hypot(S.x - c.x, S.y - c.y) / c.w < .13 && performance.now() > F.cool) glance();
      clearTimeout(S.touchT); S.touchT = setTimeout(function () { S.in = false; if (B.near) birdLeave(); }, 1800);
    });
    // Keyboard: focusing the portrait's door is a glance too.
    d.querySelector('.framewrap').addEventListener('focus', function () { if (!Pen.reduced() && performance.now() > F.cool) glance(); });

    window.replayA = function () {
      desk.replayDraw(); B.lastMarks = -1e9; F.cool = 0;
      bird.held = false;
    };
    return desk;
  };
})();
