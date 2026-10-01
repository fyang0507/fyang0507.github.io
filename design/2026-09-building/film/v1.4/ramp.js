/* v1.4/ramp.js — a speed ramp inside the running take, in place of v1.1's ⅓× replays.
   The take plays in real time into a motion, eases down to slow motion through it, and eases back to real time.
   Speed is a continuous curve (half-cosine eases, so even its slope has no step), and footage time only moves forward.
   The floor is ⅓: the motion windows were shot at 180 fps, so at ⅓ every 60 fps output frame is the next true frame,
   and above ⅓ every output frame is a later one. Nothing is held and nothing is interpolated.
   A ramp is given in footage seconds: speed 1 until a, down to smin by b, smin until c, back up to 1 by d. The whole
   of a → d has to sit inside a 180 fps window of the capture, and inside the motion, so no slow frame repeats a still. */
export const SMIN = 1 / 3;

export function ramp(r, smin = SMIN) {
  const k = 2 / (1 + smin);
  const Ti = (r.b - r.a) * k, Th = (r.c - r.b) / smin, To = (r.d - r.c) * k, film = Ti + Th + To;
  return Object.assign({}, r, { smin, Ti, Th, To, film, extra: film - (r.d - r.a) });
}
// speed at film time tau after the ramp starts (1 before and after it)
export function speed(R, tau) {
  const { smin, Ti, Th, To } = R;
  if (tau <= 0 || tau >= Ti + Th + To) return 1;
  if (tau < Ti) return 1 - (1 - smin) * (1 - Math.cos(Math.PI * tau / Ti)) / 2;
  if (tau < Ti + Th) return smin;
  return smin + (1 - smin) * (1 - Math.cos(Math.PI * (tau - Ti - Th) / To)) / 2;
}
// footage advanced after film time tau from the ramp's start: the integral of speed
export function advance(R, tau) {
  const { smin, Ti, Th, To } = R, h = (1 - smin) / 2;
  if (tau <= 0) return tau;
  if (tau < Ti) return tau - h * (tau - Ti / Math.PI * Math.sin(Math.PI * tau / Ti));
  const A = Ti * (1 + smin) / 2;
  if (tau < Ti + Th) return A + smin * (tau - Ti);
  const B = A + smin * Th;
  if (tau < Ti + Th + To) { const x = tau - Ti - Th; return B + smin * x + h * (x - To / Math.PI * Math.sin(Math.PI * x / To)); }
  return B + To * (1 + smin) / 2 + (tau - Ti - Th - To);
}

// a play shot: footage u0 → u1, with an optional ramp. Film length, footage at film time lt, and back.
export const shotLen = (s) => (s.u1 - s.u0) + (s.R ? s.R.extra : 0);
export function uAt(s, lt) {
  if (!s.R || lt < s.R.a - s.u0) return s.u0 + lt;
  return s.R.a + advance(s.R, lt - (s.R.a - s.u0));
}
export function ltOf(s, u) {
  if (!s.R || u <= s.R.a) return u - s.u0;
  const pre = s.R.a - s.u0;
  if (u >= s.R.d) return pre + s.R.film + (u - s.R.d);
  let lo = 0, hi = s.R.film;
  for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (s.R.a + advance(s.R, m) < u) lo = m; else hi = m; }
  return pre + (lo + hi) / 2;
}
export function speedAt(s, lt) { return s.R ? speed(s.R, lt - (s.R.a - s.u0)) : 1; }
