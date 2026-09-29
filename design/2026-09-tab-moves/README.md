# Tab moves: how one page hands over to another

A small follow-up to `2026-09-motion`, made during Fred's live test of its PR (2026-09-29). Home ↔ page already had its move (the desk becomes the nav); page → page (About → Building → Shooting) only slid the folder tab and hopped the objects, and Fred found it plain next to the rest.

## The candidates

Built on the real pages, with a switcher, and compared in one grid (`candidates.jpg`: the same path, slowed to 0.4×). Every candidate kept the tab's spring and the relay of hops.

| | Idea | What it did |
|---|---|---|
| now | paper swap | the page you leave fades nearly out before the next comes up (the shipped baseline) |
| A | hinge | the page hangs from the rule: the one you leave tips back on that line; the next swings in on a spring |
| B | pull the sheet | the next page is already underneath; the one you leave is pulled off toward the chosen tab, the top sheet of a pad |
| **C** | **the object answers** | each page arrives the way its object moves on the desk |

`lab.patch` is the lab exactly as it was compared: `git apply` it on commit `08a97d3`, then open a page with `?tab=0|A|B|C` (the switcher stays for the session).

**Fred's call:** C. But it wasn't smooth enough: "we need to optimize the performance first."

## Why C stuttered, and the rule that fixed it

A tab move plays while the new page mounts. Its React template boots and its modules build their surfaces, which blocks the main thread for tens of milliseconds at a time, right when the move starts. The lab's C drew on the main thread: the clip-path wipes of the print and the lens, the page-turn line and the caret redrawn in SVG on every frame, the hops added on top of the browser's own animation (`composite: 'add'`), and width and height in the header's keyframes. Anything on the main thread stops for as long as the page is busy, then jumps.

`blocked.jpg` shows the proof. With the new page's main thread held for 250 ms right after the move starts, the lab's C freezes for the whole block, while the shipped C keeps printing the page through it.

**The rule** (AGENTS.md): a view-transition animation changes only transform and opacity, which the compositor runs by itself. A clip may be set, but it holds still. The small marks a page answers with (the caret, the flash, 咔嚓, the printed edge) are real elements named for the transition, so the compositor moves them too. `scripts/verify/vt-moves.mjs` checks it for all four answers; the lab's C fails that check on three of them (`clipPath`).

## What shipped (`transitions-tab.js`)

- **Writing · the book turns a page.** The page you leave turns over about its left edge (the spine), inked like a sheet, and the next is the page beneath.
- **Building · the laptop prints it.** The next page feeds down out of the rule, its leading edge an inked line, while the caret blinks at the slot on held frames.
- **Shooting · the camera fires.** One flash at the nav camera's lens, 咔嚓 on held frames, and the page grows out of the lens.
- **About · the specimen card turns over.** The page flips where it is, and the next page is its other face.

The hops keep the hand's clock (12 fps held poses) and are baked into whole poses. From a scrolled page they ride the tab's spring down with the header.
