# Building · round 1: the preview, the way in, the project pages

Round 1 of a multi-stage design for the Building section (2026-09-29): what a card shows when you take it down, how the board hands off to a project's own pages, and the restyle of the Fred Agent and NJJoe sub-sites. Three candidates, each a complete story from board to project, built live at mock fidelity. Nothing here is production code. Fred picks, then round 2 refines.

Execution mode (fred-visual-design-guide): multi-stage. These are the candidates; nothing is refined past the point of choosing.

## How to look

```sh
python3 -m http.server 4173 --bind 127.0.0.1   # from the repo root
```

Open <http://127.0.0.1:4173/design/2026-09-building/> (the board index). Every board page has a switcher in its lower-left corner: A / B / C, the same page on the live site ("now ↗"), and a reduced-motion preview. Start at the board (`01-board.html`), take Fred Agent down, go in, and come back through "← Building board" or the nav's building tab.

- `01-board.html` the Building board with each candidate's preview
- `02-overview.html` Fred Agent · overview (the cover and the chapter nav)
- `03-principles.html` Fred Agent · principles (the Reading-style margin rail as its TOC)
- `04-system.html` Fred Agent · system map
- `05-njjoe.html` the NJJoe casebook index, with the WIP treatment

Components, Demos and the two NJJoe case pages were not mocked this round; their links go to the live pages (marked ↗).

## What Fred asked

- The board: "I think currently it works, except that the click-to-preview didn't really give much incremental information." And a "continuous way in": opening a card should flow into the project's pages instead of a hard switch. "Again you can give me candidate designs."
- Fred Agent: "Restyle, keep structure." NJJoe: "Port and restyle", keeping its WIP treatment.
- principles.html: the TOC "contains nav bugs" (the anchor hotfix covers those) "and the way the TOC is presented is inconsistent with the Writing pages", meaning Reading's margin rail.

## Audit

### Screenshots

Every surface at 1440 × 900 and 390 × 844, taken on main (5983c8b) on 2026-09-29, in `shots/now-*`.

| Surface | 1440 | 390 |
|---|---|---|
| Building board | [now-board-1440](shots/now-board-1440.jpg) | [now-board-390](shots/now-board-390.jpg) |
| preview · Fred Agent | [now-preview-fred-agent-1440](shots/now-preview-fred-agent-1440.jpg) | [now-preview-fred-agent-390](shots/now-preview-fred-agent-390.jpg) |
| preview · NJJoe | [now-preview-njjoe-1440](shots/now-preview-njjoe-1440.jpg) | [now-preview-njjoe-390](shots/now-preview-njjoe-390.jpg) |
| preview · Audio Processing CLI | [now-preview-audio-processing-cli-1440](shots/now-preview-audio-processing-cli-1440.jpg) | [now-preview-audio-processing-cli-390](shots/now-preview-audio-processing-cli-390.jpg) |
| Fred Agent · overview | [now-fa-overview-1440](shots/now-fa-overview-1440.jpg) | [now-fa-overview-390](shots/now-fa-overview-390.jpg) |
| Fred Agent · system | [now-fa-system-1440](shots/now-fa-system-1440.jpg), [map traced](shots/now-fa-system-map-1440.jpg) | [now-fa-system-390](shots/now-fa-system-390.jpg), [map](shots/now-fa-system-map-390.jpg) |
| Fred Agent · principles | [now-fa-principles-1440](shots/now-fa-principles-1440.jpg), [TOC](shots/now-fa-principles-toc-1440.jpg) | [now-fa-principles-390](shots/now-fa-principles-390.jpg), [TOC](shots/now-fa-principles-toc-390.jpg) |
| Fred Agent · components | [now-fa-components-1440](shots/now-fa-components-1440.jpg) | [now-fa-components-390](shots/now-fa-components-390.jpg) |
| Fred Agent · demos | [now-fa-demos-1440](shots/now-fa-demos-1440.jpg) | [now-fa-demos-390](shots/now-fa-demos-390.jpg) |
| NJJoe · index | [now-nj-index-1440](shots/now-nj-index-1440.jpg) | [now-nj-index-390](shots/now-nj-index-390.jpg) |
| NJJoe · listing microsite | [now-nj-microsite-1440](shots/now-nj-microsite-1440.jpg) | [now-nj-microsite-390](shots/now-nj-microsite-390.jpg) |
| NJJoe · APA campaign | [now-nj-apa-1440](shots/now-nj-apa-1440.jpg) | [now-nj-apa-390](shots/now-nj-apa-390.jpg) |
| NJJoe · email demo (buyer) | [now-nj-buyer-1440](shots/now-nj-buyer-1440.jpg) | [now-nj-buyer-390](shots/now-nj-buyer-390.jpg) |

### What works

- The board itself: drag with momentum, the one-point pins and the swing, the unpin flight and the re-pin ripple, the 小红花. Every candidate keeps them; only B changes the preview step, and says why.
- The sub-sites' writing and structure: five Fred Agent chapters that each answer one question (what, how it connects, why, what each part owns, does it run), and an NJJoe casebook that is honest about what it has and hasn't proven ("has not yet been measured", "without claiming engagement results before they arrive").
- The system map's idea: tracing a path from a handle through a protocol to an outcome, with a locked explainer, is the right interaction. It needs the site's marks, not a new one.
- Evidence first: recorded runs, a controlled comparison, a verified draft batch with its counts.

### The preview adds almost nothing (Fred's point, measured)

- Fred Agent: the note that hinges open under the card holds a kicker ("FIELD NOTE · 02"), "pin it back", and two links, one of which is already on the card (`lib/building/unpin.js` `panelHTML`: "lead + featured already show note and meta on the card"). Nothing about what is inside the field notes.
- NJJoe: the card says "Open field studies →" and the note says "Enter the field notes →": the same way in twice ([390](shots/now-preview-njjoe-390.jpg)).
- Small slips: the note adds the project's one-paragraph description and dates. That is the only real addition on the board.

### What breaks the site's rules

Fred Agent (`building/fred-agent/*.html`, `assets/fred-agent/`):

- The header is inside `<x-dc>` (`index.html:18`, header at `:28`), so the page has no static header, no `transitions.css`, no `expect` link and no cross-document view transition: every way in is a hard switch.
- `<base href="../../">` (`index.html:4`) sends `href="#x"` to the home page (the anchor hotfix in flight).
- Fonts: Noto Serif SC and Noto Sans SC come from Google inside `<helmet>` (`index.html:19–22`), where the site self-hosts subsets now; `fred-agent.css:1–2` points its two `@font-face` rules at `assets/fred-agent/fonts/…`, which doesn't exist (two 404s on every page, [audit run](shots/now-fa-overview-1440.jpg)).
- `?v=20260726-8` cache-busters (`index.html:13,15`).
- A gradient on the title ("Handles", `fred-agent.css:82`) and on every component name (`:304`); glass blur on the sticky chapter strip (`fred-agent.css:63`, `backdrop-filter:blur(10px)`) and on evidence notes (`:464`).
- Fade-and-rise entrances: `faRise` on `main` (`:41`) and the staggered `.fa-reveal` fade-ups (`:47–52`, `:158–159`).
- Coral at rest and coral small text: the TOC numbers (`:280`), the section indexes, the eyebrow rules (`:79`), the map's traced dashes (`:246`) and borders.
- `view-transition-name` set outside `transitions.css` (`fa-main`, `fred-agent.css:54`), and a second transition system: `fred-agent.js` fetches the next chapter, swaps `main` and runs its own `document.startViewTransition` (fade-and-rise, `:55`).
- `fred-agent.css` redeclares the shared tokens in its own `:root` (`--mark` and the rest, `:12`); page runtime lives in `assets/` instead of `lib/`.
- The principles TOC is its own component (coral-numbered list, a gradient hover sweep), not Reading's margin rail.

NJJoe (`building/njjoe/*.html`, `assets/njjoe/`):

- The header is static but not the site's (no `.site-top`, no `id="site-nav"`, `index.html:19`); `site-tokens.css` isn't loaded, so the header's Chinese (弗雷德, 继续写，继续造) falls back to system faces, and `casebook.css` redeclares every shared token in its own `:root`.
- The same `<base>`, glass blur on the strip (`casebook.css:31`), a fade-and-rise on `main` (`caseRise`, `:40–41`) and `.case-reveal` fade-ups, coral small text (eyebrows, section numbers, route tags) and a coral highlighter band on the title (`.mark`, `:46`, a gradient too).
- The WIP pusher nudge loops forever (`wipNudge`, 3.4 s, `infinite`): an ambient loop the site no longer allows.
- `microsite.html:82` serves the full-resolution captures (`roosevelt-full-page.png`, 6.0 MB, and a 4.7 MB mobile one) instead of derived images.
- `casebook.css:1` points `MuyaoPleased` at the complete master font (`fonts/MuyaoSuixin.woff2`, ~1.6 MB) rather than the subset.

The board (`Building.dc.html`, `lib/building/`):

- The board is mounted inside `<x-dc>` after React arrives, so no card exists when a view transition captures the page. A card can't fly back into a slot that isn't there yet: every candidate needs the board built before first paint (nothing on Building is templated; like `index.html`, it can drop `support.js`).

Content found along the way (left as each source says; worth a fix whichever candidate wins):

- The card says `2026—now` (`content/building-projects.js`); the field notes say `2025—now`.
- The overview promises "honest placeholders for evidence still being prepared"; every demo is now labelled "Recorded run" or "Controlled comparison".
- The board's English sits in `"Noto Serif SC","Fraunces"` (`lib/building/building.css`): curly quotes and dashes in card text would render in the CJK face, full-width. The data is ASCII today, so it's latent.
- No NJJoe page shows the WIP treatment any more: it was removed with the APA evidence section on 2026-08-29 (`519a6d8`). See "Decisions made on Fred's behalf".

## What all three share

Whichever candidate Fred picks, the port is the same underneath, and every mock here already works this way:

- Static pages, like `index.html`: the site's static header outside any template, `site-tokens.css`, the self-hosted `-ui` subsets, Fraunces / Caveat / IBM Plex Mono from Google, no `<base>`, no `?v=`, no gradients, gloss, glass blur, fade-and-rise entrances or ambient loops. The board page is static too (see above).
- The pen's states on every link (`Tier.wire`): the coral underline on hover, coral 「 」 on focus, the current chapter in the wheat band. Nothing is coral at rest except the 小红花 and the WIP sticker, both objects someone stuck on.
- The principles TOC is Reading's pencil margin in all three (`03-rail.js`, from `lib/reading/rail.js`, same vocabulary and values): a graphite line in the left margin that inks as you read, a tick and a mono number per principle, the current one circled by the pen's loop in wheat, a paper slip previewing the principle's title and first line on hover or focus, and a click that goes there. On phones the ticks sit on the edge of the page's sticky strip and a "05 / 11" counter rides at its end, as Reading's do on its nav's hairline.
- The way in and back are cross-document view transitions between two same-origin pages that both opt in. Names are assigned in one stylesheet (`00-vt.css`, what `transitions.css` would carry), one element per name per document (a class set just before the capture), and every animation changes only transform and opacity; a clip may be set but holds still. Checked the way `scripts/verify/vt-moves.mjs` checks the tab moves: all eight moves pass at 1440 and at 390. Reduced motion (the system setting or the board's switch) gets no transition and no motion, and the pin is never left out.
- The system map keeps fred-agent.js's path rule and its explainer; the candidates differ only in how a path shows.
- NJJoe keeps the whole WIP treatment (`.agents/skills/set-section-wip`): the dashed unfinished boundary, the faded, desaturated, pointer-disabled evidence, the peelable sticker (the shared `casebook.js` and sticker-forge, unchanged), its static fallback and the pusher. One change, below.

## A · 翻面 · the back of the card

**The preview.** Unpin is unchanged: the pin pops, the card comes to your hand on its spring. Then, instead of a note hinging open under it, the card turns over in your hand (the physics clock: a spring, one small overshoot) and its back is what the face doesn't say. Fred Agent's back is its five chapters with a line each, the one figure (atomic handles → workflow protocols → real-life outcomes), status and dates, the source, "Open the field notes" and the repository ([1440](shots/a-01-preview-fred-agent-1440.jpg), [390](shots/a-01-preview-fred-agent-390.jpg)). NJJoe's back is its overview and two cases with their state (shipped, active pilot), the WIP sticker's static face on Case 02 ("collecting campaign results"), the common pattern and its collaborator ([1440](shots/a-01-preview-njjoe-1440.jpg)). A small repo slip turns over to show how it works: measure → resolve → render → verify, where it abstains, what it reports, "no field notes yet · the repository is the record" ([1440](shots/a-01-preview-audio-1440.jpg)). "pin it back" turns the card face up first, then home. Nothing on the board changes at rest.

**The way in.** Open the field notes (or a chapter's line): the card in your hand keeps turning (its back goes edge-on) as it flies to the project page's top corner, and lands face up, at its board tilt, taped there; the board fades out and the page prints down out of the rule under it, Building's own answer from the tab moves ("the laptop prints it") ([strip](shots/a-vt-in-1440.jpg), [390](shots/a-vt-in-390.jpg)). The card on the page is the board's own card, built by `cards.js` at its board size and scaled, so what travels is one card at one size: transform only, no stretching.

**The way back.** "← Building board" or the building tab: the page feeds back up into the rule, the card flies from its corner to its slot, and when the transition ends the board pins it: the pin is pushed in on its held frames, the impact ticks, the ripple through the cork ([strip](shots/a-vt-out-1440.jpg)). The board comes back where you left it.

**The pages.** The project page is the back of the card, written out: plain paper, the card taped to the top corner, and the card's colour as the project's one colour role, on a strip torn off the card's bottom edge that sticks to the top as the chapter nav ([overview](shots/a-02-overview-1440.jpg), [390](shots/a-02-overview-390.jpg)). Wheat for Fred Agent, the blue wash for NJJoe ([NJJoe](shots/a-05-njjoe-1440.jpg)). The system map is cards on a table: the path's cards lift toward you and their pencil lines ink in ([locked](shots/a-04-system-locked-1440.jpg)).

**The chapter swap: kept.** The card and the strip never reload: the next chapter is fetched, swapped in and printed under the strip in a same-document view transition (fred-agent.js's router, rebuilt small on the site's modules), so the card stays in your hand while its pages change ([strip](shots/a-vt-chapter-1440.jpg)). The cost is a second transition system beside the cross-document one, and the rail and map re-mount after every swap.

**Record.**

- source: the Building board's cards and the two sub-sites (structure and text kept); destination: the site's system
- source-form distance: low. The card itself is the project's cover: the same paper, proportions, torn edge and tape, only turned over
- primary carrier: colour-led. One wash per project (wheat, blue) carries identity on the card and on the strip; line only rules, ticks and the pen's states
- rendering resolution: low–moderate. One colour event, the card, and plain paper
- expression anchor: the turn. A card has two sides; the back is where a person writes what the front doesn't say
- line plan: the graphite rail, dashed row rules on the back, the pen's hover line and 「 」, hairline card edges; no independent drawing
- colour plan: paper as the field; the wash as the one structural colour (the card and its torn strip); ink for text; the wheat band for the current chapter; coral only in the pen's live attention, the 小红花 and the WIP sticker

**中文说明.** 卡片不离开“卡片”这个身份，只是翻了个面。正面写的是它是什么，背面写的是正面没说的：里面有几章、每章讲什么、那一张图、现在什么状态、哪里还是 WIP。打开时它继续翻回正面，贴到项目页的左上角，页面从导航线里“打印”出来；回去时它飞回原位，被钉子按回软木。项目页只用这张卡的一种纸色（Fred Agent 麦色、NJJoe 淡蓝），从卡片底边撕下的那条纸就是章节导航。可见证据：翻面预览、落在角上的卡、撕边章节条。

**Cost: M.** Board: a back face per card and a flip in `unpin.js`'s hand step (~+140 lines across `lib/building/back.js` and `unpin.js`, ~70 CSS), a few preview fields per project in `content/building-projects.js`. Transitions: a card move and its reverse plus the re-pin on arrival (~90 lines in a `transitions-project.js`, 4 names in `transitions.css`). Pages: the taped card and the torn strip (~40 lines JS, ~80 CSS), the in-place router rebuilt (~70 lines, replacing ~300 in `fred-agent.js`). Plus the shared port below.

## B · 推近 · go in close

**The preview (this candidate changes the preview step).** Nothing comes off the board. A project with pages has its chapters pinned beside it on the cork, one slip each with its one figure, so the board itself says what's inside, and every card carries its small print ([board](shots/b-01-board-1440.jpg)). A click leans the camera in (a spring on the camera, one small overshoot) until the project's slips fill the frame and the small print reads, under the site header ([Fred Agent](shots/b-01-preview-fred-agent-1440.jpg), [NJJoe](shots/b-01-preview-njjoe-1440.jpg), [390](shots/b-01-preview-fred-agent-390.jpg)); a small slip is read the same way ([Audio CLI](shots/b-01-preview-audio-1440.jpg)). Esc, "step back · 退一步" or empty cork pulls back. Drag, pins, swing and the flower stay; the new slips follow the one-point pin rule and swing in the same physics. The argument for the change: the preview then isn't a detour. What you read is already on the wall, and going closer is the same gesture as going in. The price: unpin to read, a settled mechanic, is retired (with its flight and its re-pin ripple), and the board carries two more clusters of paper.

**The way in.** A chapter slip goes the rest of the way in: the board keeps scaling through the slip (the push is exponential in scale, so it reads at an even speed) while the page grows out of the slip's box and takes the screen, the header holding still ([strip](shots/b-vt-in-1440.jpg), [390](shots/b-vt-in-390.jpg)). Only the two page images move; no name is needed beyond the header's.

**The way back.** The page shrinks back into its slip on a board that is still leaned in, then the camera pulls out to the whole wall ([strip](shots/b-vt-out-1440.jpg)).

**The pages.** The project page is the wall, close up: the cork carries on below the header, the project's card and its chapter slips are pinned along the top (the current chapter's slip in the wheat band), and the chapter is a large sheet pinned under them by one pin at its head ([overview](shots/b-02-overview-1440.jpg), [390](shots/b-02-overview-390.jpg)). The system map is pins and thread: every link is a thread between two pins, hanging slack; a path's threads are pulled taut (a spring on each thread's sag) and darken ([hover](shots/b-04-system-hover-1440.jpg)).

**The chapter swap: dropped.** Chapters are plain navigations with the site's paper swap; fred-agent.js's router goes ([strip](shots/b-vt-chapter-1440.jpg)).

**Record.**

- source-form distance: medium. The wall's spatial relations (pins, paper, thread, cork) are kept; the pages are recomposed as pinned sheets
- primary carrier: hybrid. The cork field and the paper carry colour; pins and thread carry the structure, and removing either loses the wall
- rendering resolution: moderate–rich. Cork texture, pins, slips, threads, small print
- expression anchor: the camera going closer, and the thread pulled taut
- line plan: threads as the map's links (pencil slack, ink taut), the rail, pin stems, hairline paper edges
- colour plan: cork as the field; paper as the reading surface; ink pins; the wheat band current; coral only in the pen's live attention, the 小红花 and the WIP sticker

**中文说明.** 这一版改了“预览”这一步：卡片不再被取下来，而是镜头往墙上推近。每个项目的章节本来就钉在它旁边，每章一张小纸条，外加那一张图；推近之后小字才看得清。点章节纸条，镜头继续往里推，页面从那张纸条里长出来；回去时页面缩回纸条，镜头再退回整面墙。项目页就是墙的近景：软木、顶上一排章节纸条、下面一张用一颗钉子钉住的大纸。代价是“取下来读”这个已定的机制退役，板面也更满。可见证据：推近、线被拉紧的系统图、钉在软木上的大纸。

**Cost: M–L.** Board: the chapter slips as real slots (~60 lines in `cards.js`, ~60 CSS), small print on slips, a camera (~170 lines, replacing `unpin.js`'s ~250), the board restoring the camera on the way back. Transitions: the push both ways (~60 lines). Pages: the cork page, the pinned sheet and the slip strip (~150 CSS), the thread map (~60 lines on the shared core). The router is deleted. Risks: the busiest board of the three; on a phone the camera leans in only 1.1–1.3×, so the legibility gain is small there; a camera push must never widen the page (a phone then zooms out and the view transition is aborted: fixed here, a rule to keep).

## C · 档案 · the dossier

**The preview.** A project with pages keeps a dossier pinned behind its card; at rest only its index tabs show, peeking past the card's right edge, one per chapter ([board](shots/c-01-board-1440.jpg)). Unpin is unchanged. In your hand the dossier slides out from behind the card (one small overshoot) and opens at its contents sheet: each chapter's own title and a line, the one figure, status and dates, WIP, the repository, and the index tabs down its fore-edge ([Fred Agent](shots/c-01-preview-fred-agent-1440.jpg), [NJJoe](shots/c-01-preview-njjoe-1440.jpg), [390](shots/c-01-preview-fred-agent-390.jpg): on a phone the tabs sit on the sheet's top edge). A slip without pages gets one sheet and one tab, to its repository ([Audio CLI](shots/c-01-preview-audio-1440.jpg)).

**The way in.** A tab is the way in: all the tabs travel from the dossier's fore-edge to the project page's fore-edge (a relay 26 ms apart, each on a spring), and the paper swaps under them ([strip](shots/c-vt-in-1440.jpg), [390](shots/c-vt-in-390.jpg)).

**The way back.** The page's tabs fly back and tuck behind the card on the board, and the pin goes in ([strip](shots/c-vt-out-1440.jpg)).

**The pages.** The open dossier: one long sheet with a kraft edge, a typed file label ("FIELD NOTES · FRED AGENT · 01 / 05"), its facts as stamped outlines, the card clipped to its corner, and the index tabs down its fore-edge, sticky while you read, the current one pulled out and banded ([overview](shots/c-02-overview-1440.jpg), [principles](shots/c-03-principles-1440.jpg)). This is Writing's side index, which Fred chose for the bookcase ("in the physical world index tabs sit on the side"); on a phone the tabs become a strip above the sheet, as Writing's index does ([390](shots/c-02-overview-390.jpg)). The system map is drawn by the pen: columns read left to right (handles → protocols → outcomes); hovering draws the path's lines in the pen's coral, one confident pass, retracting faster; locking a module cools them into the wheat band's edge, and they stay ([hover](shots/c-04-system-hover-1440.jpg), [locked](shots/c-04-system-locked-1440.jpg)). It is the pen's notice → chosen language applied to a diagram.

**The chapter swap: replaced.** A fore-edge tab is a cross-document move: the tabs settle on a spring (the current one slides out), and the sheet in front is pulled aside to the left, or put back when you go to an earlier chapter ([strip](shots/c-vt-chapter-1440.jpg)). fred-agent.js's router goes.

**Record.**

- source-form distance: medium. A new object (the kraft dossier and its index tabs), made of vocabulary the site already approved (Writing's side index, About's field-guide labels)
- primary carrier: line-led. Ruled lines, typed labels, stamped outlines and the pen's strokes carry it; colour is the kraft of the tabs and the wheat band
- rendering resolution: moderate. A few line families with a clear hierarchy
- expression anchor: registration. The same tabs appear behind the card, down the dossier and down the page's fore-edge; the pen draws the path in one pass and it cools when chosen
- line plan: the sheet's hairline and kraft edge, dashed section rules, the rail, the map's faint pencil structure under the pen's strokes
- colour plan: paper as the field; kraft as the one structural colour (the tabs); ink for text and stamps; the wheat band current; coral only in the pen's live attention (including the lines it draws on hover), the 小红花 and the WIP sticker

**中文说明.** 每张有页面的卡片背后别着一个牛皮纸档案夹，平时只露出侧边的索引签，一章一个，板上就能看出里面有多少东西。取下卡片，档案从卡片后面滑出来，打开是目录页：每章标题和一句话、那一张图、状态、WIP、仓库，索引签排在前沿。点一个签就是进去：所有签飞到项目页的前沿；回去时它们缩回卡片背后。项目页就是打开的档案：打字的标签、印章框、夹在角上的卡、Writing 书架已经用过的侧边索引签；系统图由钢笔一笔画出路径，锁定时冷却成麦色边。可见证据：探出的签、滑出的档案、飞到页边的签、钢笔画出的路径。

**Cost: M.** Board: the peeking tabs (~20 lines, ~20 CSS) and the dossier in `unpin.js`'s hand step (~60 lines in a `dossier.js`, ~90 CSS). Transitions: the tabs' flight both ways and the chapter pull (~70 lines, 5 names). Pages: the dossier sheet and the fore-edge tabs, sticky, with the phone strip (~120 CSS), the pen-drawn map (~50 lines on the shared core). The router is deleted. Risks: the fore-edge needs ~150 px beside the text (the sheet narrows at 1024); the tabs must stay consistent with Writing's index, which lives in `lib/writing`.

## Side by side

| | A · 翻面 | B · 推近 | C · 档案 |
|---|---|---|---|
| Preview | the card turns over in your hand | the camera leans in on chapters pinned beside the card | a dossier slides out from behind the card |
| Settled mechanics | all kept | unpin retired; slips added at rest | all kept; tabs peek at rest |
| Way in | the card flies to the page's corner, turning face up; the page prints | the camera pushes through a slip; the page grows out of it | the tabs travel to the page's fore-edge |
| Way back | card home, pin pressed | page into its slip, camera out | tabs behind the card, pin pressed |
| Chapter swap | kept (same-document, prints under the strip) | dropped (plain paper swap) | replaced (cross-document tab pull) |
| Look | the card taped on, its colour as a torn strip | the wall close up: cork, slips, a pinned sheet | the open dossier: label, stamps, fore-edge tabs |
| Map | cards lift | threads pulled taut | the pen draws the path |
| Carrier | colour-led | hybrid | line-led |
| Cost | M | M–L | M |

## The port underneath, whichever wins (costed once)

- Nine pages rewritten as static HTML on the site's header, tokens and fonts (5 Fred Agent chapters, 3 NJJoe pages, the email demo), their text kept; `assets/fred-agent/fred-agent.css` (599 lines), `fred-agent.js` (452) and `assets/njjoe/casebook.css` (446) deleted; the WIP runtime in `casebook.js` moved into `lib/` without its reveals. New code in `lib/` (project CSS ~250 lines shared plus the chosen look).
- The rail: `lib/reading/rail.js` generalised to take a second, smaller context (the landmarks from the page's sections, the strip from the page's sticky nav), rather than copied (~+40 lines in `rail.js`, a ~40-line adapter).
- The map: fred-agent.js's path rule and explainer (~150 lines) move to one module with the chosen rendering.
- Transitions: `transitions.js` only knows same-directory pages (`kindOf`), and the project pages live in `building/<id>/`; teach it a `project` kind (or move the pages), add the chosen move in a `transitions-project.js`, the names in `transitions.css`, and a `vt-project.mjs` check like `vt-moves.mjs`.
- `Building.dc.html` static (no `support.js`, the board host outside any template, `board.js` and `cards.js` render-blocking) and a hand-off in `fy-vt` (the card and where the board was).
- The new CJK strings (背面, 回到板上, 章节, 读到哪儿, 清除, 退一步 and so on) need `generate-fonts.py`.
- The derived images for the microsite captures, and the master font reference in `casebook.css`, fixed on the way.

## Verification (of the mocks)

- Every move at 1440 and at 390 (way in, way back, and the chapter moves) passes the production compositor rule: every custom view-transition animation changes only transform or opacity; clips and z-order are constant. Contact strips of each move are in `shots/*-vt-*`, captured from compositor frames.
- Reduced motion (the board's switch): no transition, no flip or slide, the back or dossier shown at once, the pin never left out.
- No console errors or failed requests on any board page (the live sub-sites' own 404s are in the audit).
- Headless Chromium only. Not checked: Safari and Firefox (Firefox has no cross-document view transitions, so it keeps a hard cut, as the site already does), real phones.

## Decisions made on Fred's behalf

- **Where the WIP treatment sits.** No NJJoe page has it any more (removed with the APA evidence section on 2026-08-29, `519a6d8`). The one thing still truthfully unfinished is the APA campaign's results (sends and link requests aren't in; the APA page says so). The mock applies the full treatment there, on Case 02's card on the index, with Fred's last status wording ("collecting campaign results") and the verified draft counts from `apa.html` as the faded evidence, dashes where no result exists. Whether it should be back at all is Fred's call.
- **The pusher's nudge has a cause.** It no longer loops forever: it shoves three times when the sticker comes into view or a pointer comes near, then rests (`05-njjoe.js`). This touches the WIP skill's "don't simplify away the pusher nudge"; the nudge is kept, its loop is not.
- **The board is static** in every candidate, so a card can fly back into its slot.
- **Chapter numbers**: Fred Agent 01–05 in the live nav's order; NJJoe 00–02, following its "Case 01 / Case 02".
- **Content as each source says it**, including the 2026—now / 2025—now mismatch and the overview's stale "placeholders" line.
- **B retires unpin.** It is the candidate's argument, not a recommendation; A and C keep every settled mechanic.

## Live references (repoint after the root move)

Only two files reference the root's shared CSS and JS, so the move to `lib/shared/` is a two-file edit: `00-live.css` (`site-tokens.css`, `site-nav.css`, `pen.css`, `transitions.css`) and `00-live.js` (`motion.js`, `pen.js`, `pen-tier.js`, `site.js`). Everything else reaches paths that aren't moving: `lib/building/{cards,physics,flower}.js` and `building.css`, `content/building-projects.js`, `assets/…` (header stickers, `wip-pusher-mask.png`, `assets/njjoe/casebook.js` and its sticker-forge), `favicon.png`, and the live pages' links.

## Files

- `index.html` the board index; `README.md` this
- `00-kit.js`, `00-kit.css` board chrome: the candidate switcher, the live-site link, the reduced-motion preview
- `00-live.css`, `00-live.js` the live site's shared files, in one place
- `00-vt.css`, `00-vt.js` the board ↔ project moves: names, and the pageswap / pagereveal handlers
- `01-board.*` the board; `01-unpin.js` production unpin with hooks for the hand step; `01-back.js` A; `01-zoom.js` B; `01-dossier.js` C; `01-previews.js` what each card knows (taken from the project pages)
- `02-overview.html`, `02-project.js`, `02-project.css`, `02-a.css`, `02-b.css`, `02-c.css` the project pages and their three looks
- `03-principles.html`, `03-rail.js`, `03-rail.css` principles and the margin rail
- `04-system.html`, `04-map.js`, `04-map.css` the system map
- `05-njjoe.html`, `05-njjoe.css`, `05-njjoe.js` the NJJoe index and the WIP treatment
- `shots/` the audit (`now-*`) and every candidate's frames (`a-*`, `b-*`, `c-*`)

## The question for Fred

Which story do we refine in round 2: A (the card turns over and lands on the page), B (the camera goes in; chapters pinned beside each card) or C (a dossier behind the card; its tabs become the chapter nav)? If you would mix, say which candidate's preview goes with which candidate's pages.
