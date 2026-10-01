/* v1.1/edl.js — v1's cut (../v1/edl.js), moved onto v1.1's take (cap/scenarios/take-v11.mjs), where Demos (#37) comes
   between Principles and the way back: the take is 7.7 s longer from the way back on, and Principles' shot now runs on
   into 05 demos (the chapter move), one region of Fig. 02 noticed, enlarged in place with its coral corners, stepped
   once (N →) and put back, then up to the nav for the way back. Everything else is v1's. */
import * as V1 from '../v1/edl.js';

export const D = 7.7, AT = 38.15;              // the take's way back moved from 38.15 to 45.85
const sh = (u) => (u >= AT - 1e-6 ? +(u + D).toFixed(3) : u);
const keys = (k) => k && k.map(([u, ...r]) => [sh(u), ...r]);
function move(s) {
  const o = Object.assign({}, s);
  if (o.u0 != null) { o.u0 = sh(o.u0); o.u1 = sh(o.u1); }
  if (o.at != null) o.at = sh(o.at);
  if (o.k === 'play') { o.cam = keys(o.cam); o.cam9 = keys(o.cam9); }   // a play shot's keys are footage times
  return o;
}
// Principles → 05 demos → Fig. 02 → up to the nav: the camera on the rail, the fore-edge, the whole chapter move, then
// close on the capture while its region is enlarged, stepped and put back
const DEMOS = [[32.1, 1030, 520, 900], [32.55, 330, 560, 760], [36.4, 330, 560, 760], [37.15, 900, 420, 900], [37.5, 900, 420, 900],
  [38.3, 640, 520, 1160], [39.0, 640, 520, 1160], [39.95, 540, 410, 680], [43.95, 540, 410, 680], [44.8, 640, 520, 1160], [45.85, 640, 520, 1160]];
export const EDL = V1.EDL.map(move).map((s) => (s.k === 'play' && s.u0 === 32.10 ? Object.assign(s, { cam: DEMOS }) : s));
export const EDL30 = V1.EDL30.map(move);
export const CHAPTERS = V1.CHAPTERS.map(([u, ...r]) => [sh(u), ...r]);
export const NOTES = V1.NOTES, NOTES9 = V1.NOTES9;
export const TIMED_NOTES = V1.TIMED_NOTES.map(([a, b, id]) => [sh(a), sh(b), id]);
