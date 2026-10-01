/* v1.4/edl.js — part 1, the promo: v1.1's 30 s route on v1.1's take (take11-after), with no replays and no chapter
   names. Three motions slow down inside the running take (ramp.js), the print is reframed so its peg stays in frame,
   and each caption is timed around its motion.
   Times are the take's footage seconds (u). Positions are page px of the 1280 × 1000 recording; h is how much page
   height the picture shows.
     play  the take from u0 to u1, in real time except inside its ramp {a, b, c, d}
     jump  the sheet in front pulled aside to the left, the next moment of the take already under it; both keep playing
     end   the take pulled aside; the last sheet (end.js)
   cam: [u, x, y, h]: the camera arrives at each key and holds between them. No key moves inside a ramp.
   cap: the caption on screen from `in` to `out` (footage seconds of that shot, extended past its ends into the
   neighbouring jump at real time), fading for 0.2 s at each end. motion: [u from, u to] the motion it names; box: the
   page region that moves then (checks/space.py, from the capture's frame differences over `motion`, or `boxu`). */
export const EDL = [
  { k: 'play', u0: 0.12, u1: 5.10, cam: [[0.12, 640, 520, 1160], [3.3, 640, 520, 1160], [3.75, 175, 72, 330], [5.1, 175, 72, 330]] },
  { k: 'jump', d: 0.6 },
  // the book: the desk flies up into the nav (180 fps from 7.31 to 8.62; the flight moves from 7.50 to 8.10)
  { k: 'play', u0: 6.05, u1: 8.55, ramp: { a: 7.50, b: 7.66, c: 7.92, d: 8.08 }, name: 'desk',
    cam: [[6.05, 640, 520, 1160], [7.1, 680, 460, 920], [8.55, 680, 460, 920]],
    cap: { id: 'desk', in: 6.05, out: 8.85 }, motion: [7.50, 8.10] },
  { k: 'jump', d: 0.6 },
  // the card into your hand, then 03: #35's tabs fly to the chapter's fore-edge (180 fps 31.36–32.52; motion 31.555–31.94)
  { k: 'play', u0: 28.55, u1: 32.45, ramp: { a: 31.555, b: 31.655, c: 31.84, d: 31.975 }, name: 'tabs',
    cam: [[28.55, 560, 580, 900], [30.1, 600, 560, 960], [31.0, 1000, 500, 900], [32.45, 1000, 500, 900]],
    cap: { id: 'tabs', in: 30.0, out: 32.75 }, motion: [31.555, 31.94], boxu: [31.66, 31.975] },
  { k: 'jump', d: 0.6 },
  // the print, peg and all (60 fps, so real time): one framing holds its rope, its whole flight and the viewer, peg and all
  { k: 'play', u0: 54.3, u1: 56.9, name: 'print',
    cam: [[54.3, 630, 485, 990], [56.9, 640, 480, 980]],
    cap: { id: 'print', in: 54.0, out: 57.2 }, motion: [54.75, 55.6] },
  { k: 'jump', d: 0.6 },
  // home: the nav falls back into a desk (180 fps 67.26–68.52; motion 67.455–68.39)
  { k: 'play', u0: 67.05, u1: 69.3, ramp: { a: 67.47, b: 67.65, c: 68.15, d: 68.37 }, name: 'home',
    cam: [[67.05, 640, 480, 1000], [69.3, 640, 480, 1000]],
    cap: { id: 'home', in: 66.8, out: 69.5 }, motion: [67.455, 68.39] },
  { k: 'end', d: 7.6 }
];

// the caption words, from v1's NOTES (the part 2 label keeps its v1.3 words)
export const WORDS = {
  desk: ['桌子变成了导航', 'the desk becomes the nav'],
  tabs: ['标签跟着你走', 'the tabs travel with you'],
  print: ['连夹子一起取下', 'unclipped, peg and all'],
  home: ['导航落回桌上', 'the nav falls back into a desk'],
  before: ['#17 之前', 'BEFORE']
};
export const FADE = 0.2;
