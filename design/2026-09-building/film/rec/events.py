"""The site's own events in each session's after side, read off the frames (contact tiles and the motion peaks from
analyze.py), added to meta.json's beats with source "frames". Times are from mark('start'), ±1 frame.
   python3 rec/events.py"""
import json

EV = {
    's1-home-writing-reading': [
        (0.63, 'op-cut', 'the OP\'s first hard cut (弗)'),
        (1.40, 'objects-fall', 'after the OP, the desk objects fall into place'),
        (3.43, 'motto-start', 'the pen starts writing 继续写，继续造'),
        (4.50, 'motto-done', 'the motto written'),
        (4.57, 'seal-1', 'the 弗雷德 seal stamped, with its impact ticks'),
        (4.83, 'seal-2', 'the FRED YANG seal stamped'),
        (9.80, 'desk-nav-flight', 'the table folds into the header rule, the objects fly into their tabs (to ~10.6)'),
        (21.27, 'reading-cut', 'Reading arrives (a same-tab hard cut on both sides)'),
    ],
    's2-building': [
        (2.00, 'tab-move', 'the tab move into Building (to ~2.5); the flower pressed on first view'),
        (7.45, 'cards-swing', 'the board flung: cards swing on their pins'),
        (13.70, 'pin-pop', 'the pin pops, the card comes to the hand, the dossier slides out (to ~15.0)'),
        (17.80, 'tabs-fly', 'the tabs fly from the dossier to the chapter\'s fore-edge (#35), the sheet swaps under them (to ~18.3)'),
        (18.40, 'rail-draws', 'the margin rail drawn down the page'),
        (29.10, 'way-back', 'the way back: the board, the card brought into view, the tabs tucking under it'),
        (29.80, 'pin-pressed', 'the pin pressed in, its impact ticks'),
    ],
    's3-gallery-about-home': [
        (2.00, 'tab-move', 'the tab move into Gallery (to ~2.5); the prints develop on the lines'),
        (5.60, 'prints-swing', 'the fast pass swings the first line'),
        (10.20, 'print-unclip', 'the print unclipped into the viewer with its peg; the rope springs up (to ~10.7)'),
        (13.80, 'print-home', 'the print flies home and clips onto the rope, which sags'),
        (17.00, 'tab-move-about', 'the tab move into About (to ~17.4)'),
        (21.30, 'card-out', 'the card pulled from its sleeve: stick, lip catch, pop (to ~22.6)'),
        (26.70, 'flip', 'the card turns over in place, the night face (to ~27.7)'),
        (30.30, 'flip-back', 'it turns back (to ~31.2)'),
        (34.30, 'gravity-return', 'home: the nav falls back into a desk (to ~34.8)'),
    ],
}
for name, evs in EV.items():
    p = f'/tmp/fyfilm/footage/{name}/meta.json'
    m = json.load(open(p))
    m['beats'] = [b for b in m['beats'] if b.get('source') != 'frames']
    for t, n, what in evs:
        m['beats'].append({'t': t, 'name': n, 'kind': 'event', 'what': what, 'source': 'frames'})
    m['beats'].sort(key=lambda b: b['t'])
    json.dump(m, open(p, 'w'), indent=1)
    print(name, len(m['beats']), 'beats')
