/* v1.2/edl.js — the long film is v1.1's cut (../v1.1/edl.js) on v1.2's take, where Reading films another essay with the
   same beats, so every time stays v1.1's. The 30 s cut is rebuilt around the comparison, in the long film's device:
   at each hero click the page lifts, the site before #17 makes the same click with its real hard cut (stamped
   「#17 之前 · BEFORE #17」), the page falls, 「之后 · AFTER」 is stamped, and the new motion plays.
     0 s     a hook: the OP's first cuts, 1.3 s
     ~2 s    the desk → nav flight: lift, before, after, and again at ⅓×
     ~9 s    the card into your hand, the dossier sliding out
     ~13 s   the print unclipped, peg and all
     ~17 s   home: the nav falls back into a desk, and again at ⅓×
     ~24 s   the stamps
   cam9: every shot framed again for 9:16 (h is the frame's height in page px there too), not a crop of the 16:9. */
import * as V11 from '../v1.1/edl.js';

// the new essay (The God in the Edit): the pulled book's board is the cover's middle 16:25, and Reading's hero is the whole
// cover at the page's width, so the board's picture (page px 208–376 wide, from 428 down) is the hero's 416–864 from 0:
// 2.67×, the board's centre (292, 509) landing on (640, 216). The footnote, an LA Times citation, is framed with its slip.
const WRITING = [[8.4, 640, 520, 1160], [9.3, 700, 470, 780], [10.9, 700, 470, 780], [11.6, 330, 560, 520], [12.45, 292, 509, 300], [13.2, 292, 509, 300]];
const READING = [[13.2, 640, 216, 800, 'cut'], [13.6, 640, 216, 800], [14.4, 640, 470, 1160], [17.3, 640, 470, 1160], [18.6, 840, 590, 520], [20.7, 840, 590, 520], [21.4, 640, 520, 1160], [22.95, 700, 470, 1060]];
export const EDL = V11.EDL.map((sh) => sh.k === 'play' && sh.u0 === 8.40 ? Object.assign({}, sh, { cam: WRITING }) : sh.k === 'play' && sh.u0 === 13.20 ? Object.assign({}, sh, { cam: READING }) : sh);
export const CHAPTERS = V11.CHAPTERS, NOTES = V11.NOTES, TIMED_NOTES = V11.TIMED_NOTES;
export const NOTES9 = { desk: [760, 540], tabs: [850, 760], print: [300, 300], home: [420, 690] };

const WHOLE = [640, 520, 1160], WHOLE9 = [660, 480, 1400];
const hold = (u0, u1, f, f9, extra = {}) => Object.assign({ k: 'play', u0, u1, cam: [[u0, ...f], [u1, ...f]], cam9: [[u0, ...f9], [u1, ...f9]] }, extra);
const lift = (at, name, d, f, f9) => ({ k: 'lift', at, name, d, cam: [[0, ...f], [d, ...f]], cam9: [[0, ...f9], [d, ...f9]] });
// the notes' places in the 30 s cut's framings
export const NOTES30 = { desk: [820, 400], print: [800, 300], home: [820, 590] };
export const EDL30 = [
  hold(0.12, 1.45, WHOLE, [640, 470, 1500]),                                     // the hook: the OP's saturated cuts
  { k: 'jump', d: 0.5 },
  hold(6.95, 7.30, WHOLE, WHOLE9),                                               // the desk, the hand on the book
  lift(7.30, 'flight', 1.6, WHOLE, WHOLE9),                                      // before: the click, a hard cut
  hold(7.30, 8.25, WHOLE, WHOLE9),                                               // after: the desk becomes the nav, in real time
  { k: 'replay', u0: 7.49, u1: 8.10, rate: 1 / 3, note: 'desk', cam: [[0, 1010, 260, 560], [1.83, 1010, 260, 560]], cam9: [[0, 1030, 330, 1000], [1.83, 1030, 330, 1000]] },
  { k: 'jump', d: 0.5 },
  hold(28.2, 28.55, [600, 600, 900], [520, 620, 1500]),                          // the lead card, the hand on it
  lift(28.55, 'card', 1.6, [600, 600, 900], [520, 620, 1500]),                   // before: into the old field notes
  hold(28.55, 30.15, [600, 600, 900], [520, 620, 1500]),                         // the pin pops, the card to your hand, the dossier out
  { k: 'jump', d: 0.5 },
  hold(54.3, 54.65, [580, 560, 780], [600, 560, 1250]),                          // the print on its line
  lift(54.65, 'print', 1.6, [580, 560, 780], [600, 560, 1250]),                  // before: the dark lightbox
  hold(54.65, 56.45, [580, 560, 780], [600, 560, 1250]),                         // unclipped, peg and all
  { k: 'jump', d: 0.5 },
  hold(66.9, 67.25, WHOLE, WHOLE9),                                              // About, the hand on home
  lift(67.25, 'home', 1.6, WHOLE, WHOLE9),                                       // before: a hard cut home
  hold(67.25, 68.55, WHOLE, WHOLE9),                                             // the nav falls back into a desk
  { k: 'replay', u0: 67.44, u1: 68.40, rate: 1 / 3, note: 'home', cam: [[0, 700, 380, 860], [2.88, 700, 380, 860]], cam9: [[0, 720, 420, 1300], [2.88, 720, 420, 1300]] },
  { k: 'end', d: 5.4, short: true }
];
