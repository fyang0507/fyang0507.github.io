/* v1/edl.js — the cut: one take of the real site (cap/scenarios/take.mjs), with the film's own moves laid over it.
   Times are the take's footage seconds (u). Positions are page px of the 1280 × 1000 recording; h is how much page
   height the frame shows. Shots:
     cover   the closed dossier, then the cover opens (the OP starts as it lands)
     play    the take in real time from u0 to u1
     lift    the take held at `at` (its next click is under the page), the page flipped up, the site before #17 doing
             that same click from its own take, the page let fall; then the take goes on
     replay  u0 → u1 again at ⅓×, from the 180 fps frames (true frames, no interpolation)
     end     the finished sheet pulled aside: the last sheet, the motto written, the seals stamped, the credits
   cam: [u (or t inside a lift / replay), x, y, h, 'cut'?]: the camera arrives at each key and holds between them. */
export const EDL = [
  { k: 'cover', d: 1.0 },
  { k: 'play', u0: 0, u1: 3.30, cam: [[0, 640, 520, 1160], [3.3, 640, 520, 1160]] },
  { k: 'lift', at: 3.30, name: 'seals', d: 1.45, cam: [[0.0, 640, 520, 1160], [0.45, 175, 72, 330]] },
  { k: 'play', u0: 3.30, u1: 7.30, cam: [[3.3, 175, 72, 330], [5.15, 175, 72, 330], [5.9, 640, 520, 1160], [7.3, 640, 520, 1160]] },
  { k: 'lift', at: 7.30, name: 'flight', d: 1.75, note: 'hardcut', cam: [[0, 640, 520, 1160], [1.75, 640, 520, 1160]] },
  { k: 'play', u0: 7.30, u1: 8.40, cam: [[7.3, 860, 360, 760], [8.4, 860, 360, 760]] },
  { k: 'replay', u0: 7.49, u1: 8.10, rate: 1 / 3, note: 'desk', cam: [[0, 1010, 260, 560], [1.95, 1010, 260, 560]] },
  { k: 'play', u0: 8.40, u1: 13.20, cam: [[8.4, 640, 520, 1160], [9.3, 700, 470, 780], [10.9, 700, 470, 780], [11.6, 230, 560, 520], [12.45, 164, 521, 300], [13.2, 164, 521, 300]] },
  { k: 'play', u0: 13.20, u1: 22.95, cam: [[13.2, 616, 205, 690, 'cut'], [13.6, 616, 205, 690], [14.4, 640, 470, 1160], [17.3, 640, 470, 1160], [18.6, 690, 640, 470], [20.7, 690, 640, 470], [21.4, 640, 520, 1160], [22.95, 700, 470, 1060]] },
  { k: 'lift', at: 22.95, name: 'building', d: 1.6, cam: [[0, 700, 470, 1060], [1.6, 700, 470, 1060]] },
  { k: 'play', u0: 22.95, u1: 28.55, cam: [[22.95, 700, 470, 1060], [23.9, 700, 470, 1060], [24.25, 350, 560, 520], [25.05, 350, 560, 520], [25.5, 720, 650, 780], [27.8, 720, 650, 780], [28.4, 560, 600, 900], [28.55, 560, 600, 900]] },
  { k: 'lift', at: 28.55, name: 'card', d: 1.6, cam: [[0, 560, 600, 900], [0.5, 640, 520, 1160], [1.6, 640, 520, 1160]] },
  { k: 'play', u0: 28.55, u1: 32.10, cam: [[28.55, 560, 580, 900], [30.1, 600, 560, 960], [31.0, 1030, 520, 900], [32.1, 1030, 520, 900]] },
  { k: 'replay', u0: 31.54, u1: 31.95, rate: 1 / 3, note: 'tabs', cam: [[0, 1090, 470, 640], [1.35, 1090, 470, 640]] },
  { k: 'play', u0: 32.10, u1: 38.15, cam: [[32.1, 1030, 520, 900], [32.55, 330, 560, 760], [37.2, 330, 560, 760], [38.0, 640, 520, 1160], [38.15, 640, 520, 1160]] },
  { k: 'lift', at: 38.15, name: 'back', d: 1.6, cam: [[0, 640, 520, 1160], [1.6, 640, 520, 1160]] },
  { k: 'play', u0: 38.15, u1: 46.95, cam: [[38.15, 420, 610, 800], [40.0, 420, 610, 800], [41.2, 640, 520, 1160], [41.9, 640, 650, 720], [43.9, 640, 650, 720], [44.5, 640, 640, 780], [46.3, 640, 640, 780], [46.95, 640, 560, 1000]] },
  { k: 'lift', at: 46.95, name: 'print', d: 1.6, cam: [[0, 640, 560, 1000], [1.6, 640, 560, 1000]] },
  { k: 'play', u0: 46.95, u1: 59.55, cam: [[46.95, 580, 560, 780], [49.2, 580, 560, 780], [49.8, 640, 560, 940], [51.2, 640, 560, 940], [51.9, 640, 520, 1160], [53.9, 640, 520, 1160], [54.3, 560, 540, 560], [56.2, 560, 540, 560], [56.9, 720, 560, 820], [58.1, 720, 560, 820], [58.9, 640, 520, 1160], [59.55, 640, 520, 1160]] },
  { k: 'lift', at: 59.55, name: 'home', d: 1.6, cam: [[0, 640, 520, 1160], [1.6, 640, 520, 1160]] },
  { k: 'play', u0: 59.55, u1: 60.85, cam: [[59.55, 640, 520, 1160], [60.85, 640, 520, 1160]] },
  { k: 'replay', u0: 59.74, u1: 60.70, rate: 1 / 3, note: 'home', cam: [[0, 700, 380, 860], [3.0, 700, 380, 860]] },
  { k: 'play', u0: 60.85, u1: 62.30, cam: [[60.85, 640, 520, 1160], [62.3, 640, 520, 1160]] },
  { k: 'end', d: 7.8 }
];

// the pen's chapter names, written once in the top margin as each section of the site arrives (footage time)
export const CHAPTERS = [
  [0.3, '01', '家', 'home'], [8.05, '02', '写', 'writing'], [13.25, '03', '读', 'reading'], [23.5, '04', '造', 'building'],
  [41.9, '05', '拍', 'shooting'], [52.3, '06', '关于', 'about'], [60.2, '07', '回家', 'home again']
];

// at most five notes in the hand, each describing what is on screen; [shot note id, x, y (page px), zh, en]
export const NOTES = {
  hardcut: [760, 150, '以前：硬切', 'before: a hard cut'],
  desk: [700, 330, '桌子变成了导航', 'the desk becomes the nav'],
  tabs: [800, 300, '标签跟着你走', 'the tabs travel with you'],
  print: [800, 300, '连夹子一起取下', 'unclipped, peg and all'],
  home: [820, 590, '导航落回桌上', 'the nav falls back into a desk']
};
// where the notes sit in the tall frame (the 9:16 cut's framings are narrower)
export const NOTES9 = { desk: [800, 560], tabs: [850, 760], print: [310, 300], home: [410, 700] };
// the print's note hangs on a play shot, by footage time
export const TIMED_NOTES = [[47.3, 49.1, 'print']];

// ---- the 30 s cut (the critic's route): the OP → the flight, and again at ⅓× → #35's tabs → the print, peg and
// all → the nav falls back into a desk → the stamps. A jump between two moments of the take is the sheet in front
// pulled aside to the left, the way a chapter gives way to the next (#35); the next moment is already underneath.
// cam9: the same shots framed for 9:16 (h is the frame's height in page px there too).
export const EDL30 = [
  { k: 'play', u0: 0.12, u1: 5.10, cam: [[0.12, 640, 520, 1160], [3.3, 640, 520, 1160], [3.75, 175, 72, 330], [5.1, 175, 72, 330]], cam9: [[0.12, 640, 480, 1500], [3.3, 640, 480, 1500], [3.75, 150, 80, 560], [5.1, 150, 80, 560]] },
  { k: 'jump', d: 0.6 },
  { k: 'play', u0: 6.35, u1: 8.30, cam: [[6.35, 640, 520, 1160], [7.1, 860, 360, 760], [8.3, 860, 360, 760]], cam9: [[6.35, 700, 480, 1500], [7.1, 960, 420, 1250], [8.3, 960, 420, 1250]] },
  { k: 'replay', u0: 7.49, u1: 8.10, rate: 1 / 3, note: 'desk', cam: [[0, 1010, 260, 560], [1.95, 1010, 260, 560]], cam9: [[0, 1040, 330, 1000], [1.95, 1040, 330, 1000]] },
  { k: 'jump', d: 0.6 },
  { k: 'play', u0: 28.55, u1: 32.05, cam: [[28.55, 560, 580, 900], [30.1, 600, 560, 960], [31.0, 1030, 520, 900], [32.05, 1030, 520, 900]], cam9: [[28.55, 520, 600, 1300], [30.1, 640, 560, 1300], [31.0, 1080, 520, 1200], [32.05, 1080, 520, 1200]] },
  { k: 'replay', u0: 31.54, u1: 31.95, rate: 1 / 3, note: 'tabs', cam: [[0, 1090, 470, 640], [1.35, 1090, 470, 640]], cam9: [[0, 1100, 470, 1000], [1.35, 1100, 470, 1000]] },
  { k: 'jump', d: 0.6 },
  { k: 'play', u0: 46.75, u1: 49.0, cam: [[46.75, 580, 560, 780], [49.0, 580, 560, 780]], cam9: [[46.75, 600, 560, 1150], [49.0, 600, 560, 1150]] },
  { k: 'jump', d: 0.6 },
  { k: 'play', u0: 59.35, u1: 60.85, cam: [[59.35, 640, 520, 1160], [60.85, 640, 520, 1160]], cam9: [[59.35, 680, 480, 1500], [60.85, 680, 480, 1500]] },
  { k: 'replay', u0: 59.74, u1: 60.70, rate: 1 / 3, note: 'home', cam: [[0, 700, 380, 860], [3.0, 700, 380, 860]], cam9: [[0, 720, 420, 1300], [3.0, 720, 420, 1300]] },
  { k: 'play', u0: 60.85, u1: 61.6, cam: [[60.85, 640, 520, 1160], [61.6, 640, 520, 1160]], cam9: [[60.85, 680, 480, 1500], [61.6, 680, 480, 1500]] },
  { k: 'end', d: 6.4, short: true }
];
