/* v1.5/edl.js — part 1, the promo: v1.4's cut to the tabs (take11-after, origin/main 321ee2c), then a second take
   from the Building board on (take15-after, origin/main 75e9790): the shooting tab's move and the prints developing on
   their lines, a print out with its peg and back, the about tab's move, the specimen card out of its sleeve and
   turned over, and home, the nav falling back into a desk (ramped). The sheet pull joins the two takes.
   Times are each shot's own take's footage seconds (u). Positions are page px of the 1280 × 1000 recording; h is how
   much page height the picture shows.
     play  the take from u0 to u1, in real time except inside its ramp {a, b, c, d} (../v1.4/ramp.js)
     jump  the sheet in front pulled aside to the left, the next moment already under it; both keep playing
     end   the take pulled aside; the last sheet (end.js)
   cam: [u, x, y, h]: the camera arrives at each key and holds between them. No key moves inside a ramp.
   caps: each caption on screen from `in` to `out` (footage seconds of that shot, extended past its ends into the
   neighbouring jump at real time), fading for 0.2 s at each end; motion: [u from, u to] the motion it names; boxu: the
   footage window whose changes are the motion's box (checks/space.py), if not `motion`. */
const T11 = 'take11-after', T15 = 'take15-after';
export const EDL = [
  { k: 'play', take: T11, u0: 0.12, u1: 5.10, cam: [[0.12, 640, 520, 1160], [3.3, 640, 520, 1160], [3.75, 175, 72, 330], [5.1, 175, 72, 330]] },
  { k: 'jump', d: 0.6 },
  { k: 'play', take: T11, u0: 6.05, u1: 8.55, ramp: { a: 7.50, b: 7.66, c: 7.92, d: 8.08 }, name: 'desk',
    cam: [[6.05, 640, 520, 1160], [7.1, 680, 460, 920], [8.55, 680, 460, 920]],
    caps: [{ id: 'desk', in: 6.05, out: 8.85, motion: [7.50, 8.10] }] },
  { k: 'jump', d: 0.6 },
  { k: 'play', take: T11, u0: 28.55, u1: 32.45, ramp: { a: 31.555, b: 31.655, c: 31.84, d: 31.975 }, name: 'tabs',
    cam: [[28.55, 560, 580, 900], [30.1, 600, 560, 960], [31.0, 1000, 500, 900], [32.45, 1000, 500, 900]],
    caps: [{ id: 'tabs', in: 30.0, out: 32.75, motion: [31.555, 31.94], boxu: [31.66, 31.975] }] },
  { k: 'jump', d: 0.6 },
  // take15: the shooting tab's move 2.9–3.5 and the develop to 5.6; the print out 6.45–7.5 and back 8.2–9.2; the
  // about tab's move 9.5–10.2; the card out 11.1–12.2 (the pop at 11.85), turned over 13.4–13.85; home 15.77–16.66
  // (180 fps from 15.56 to 16.92)
  { k: 'play', take: T15, u0: 2.15, u1: 16.95, ramp: { a: 15.78, b: 15.95, c: 16.40, d: 16.62 }, name: 'home',
    cam: [[2.15, 640, 520, 1160], [2.6, 640, 520, 1040], [15.0, 640, 520, 1040], [15.6, 640, 480, 1000], [16.95, 640, 480, 1000]],   // one framing holds the gallery, the print and its peg, About and the card
    caps: [{ id: 'develop', in: 1.85, out: 5.85, motion: [2.9, 5.6] },
      { id: 'print', in: 5.85, out: 9.55, motion: [6.3, 9.2] },
      { id: 'card', in: 10.4, out: 14.3, motion: [11.1, 13.85] },
      { id: 'home', in: 14.35, out: 17.15, motion: [15.77, 16.66] }] },
  { k: 'end', d: 7.4 }
];

// the caption words: v1's NOTES for the desk, the tabs, the print and home; two new ones; part 2's label
export const WORDS = {
  desk: ['桌子变成了导航', 'the desk becomes the nav'],
  tabs: ['标签跟着你走', 'the tabs travel with you'],
  develop: ['照片在绳上慢慢显影', 'the prints develop on their lines'],
  print: ['连夹子一起取下', 'unclipped, peg and all'],
  card: ['从封套里抽出，再翻过来', 'out of its sleeve, then turned over'],
  home: ['导航落回桌上', 'the nav falls back into a desk'],
  before: ['#17 之前', 'BEFORE']
};
export const FADE = 0.2;
