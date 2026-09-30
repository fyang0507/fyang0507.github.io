/* The Building board's projects (lib/building/cards.js), and home's latest one. A project with pages also carries its
   dossier (lib/building/dossier.js): contents (the sheet's label), chapters (n, tab, the chapter's own title, one line,
   href), figure (caption, steps, exit), status and source, every line taken from its pages. A slip may carry a figure
   and lines, shown instead of its note. */
window.BUILDING_PROJECTS = Object.freeze([
  {
    id: "fred-agent",
    title: "Fred Agent",
    kind: "system",
    prominence: "highlighted",
    boardLead: true,
    lifecycle: "active",
    period: "2025—now",
    note: "An operating environment that gives swappable general-purpose agents durable handles into time, communication, shared state, personal context, and visible recovery.",
    href: "./building/fred-agent/",
    repo: "https://github.com/fyang0507/fred-agent",
    sortDate: "2026-04-07",
    order: 2,
    updated: "2026-07-18",
    contents: "5 chapters",
    chapters: [
      { n: "01", tab: "overview", title: "A Life With Handles", line: "The capability already exists. The opportunity does not.", href: "./building/fred-agent/" },
      { n: "02", tab: "system", title: "From existing capability to real opportunity", line: "4 outcomes · 4 protocols · 5 handles · 1 policy", href: "./building/fred-agent/system.html" },
      { n: "03", tab: "principles", title: "Eleven principles", line: "portability, attention, shared state, privacy, failure", href: "./building/fred-agent/principles.html" },
      { n: "04", tab: "components", title: "Interfaces Beyond the Chatbox", line: "Sundial · Outreach · Notion Gateway · Whoami · Headless Recovery", href: "./building/fred-agent/components.html" },
      { n: "05", tab: "demos", title: "The System in Motion", line: "4 recorded runs · 1 controlled comparison", href: "./building/fred-agent/demos.html" }
    ],
    figure: { caption: "the system, in one line", steps: ["atomic handles", "workflow protocols", "real-life outcomes"] },
    status: ["active system", "2025—now", "last revised July 2026"],
    source: "source · private working repository"
  },
  {
    id: "njjoe",
    title: "NJJoe",
    kind: "field notebook",
    prominence: "featured",
    lifecycle: "active",
    period: "2026—now",
    note: "Two field studies: a unified property-listing microsite and a personalized Annual Property Analysis email pilot.",
    href: "./building/njjoe/",
    repo: null,
    sortDate: "2026-05-12",
    order: 1,
    updated: "2026-07-23",
    contents: "2 cases",
    chapters: [
      { n: "00", tab: "overview", title: "The problem lived between the tools.", line: "with Joe Costello · May 2026—now", href: "./building/njjoe/" },
      { n: "01", tab: "listing microsite", title: "One house, four interfaces.", line: "shipped · one listing microsite live · June 2026", href: "./building/njjoe/microsite.html" },
      { n: "02", tab: "APA campaign", title: "The campaign Joe could not run by calling harder.", line: "active pilot · 248 drafts verified · Sep 5, 2026", href: "./building/njjoe/apa.html" }
    ],
    figure: { caption: "the common pattern", steps: ["fragmented systems", "agent assembles", "human judgment", "one experience"] },
    status: ["one live workflow + one active pilot", "May 2026—now"],
    source: "collaborator · Joe Costello"
  },
  {
    id: "audio-processing-cli",
    title: "Audio Processing CLI",
    kind: "instrument",
    prominence: "agent-native",
    lifecycle: "wip",
    period: "2026—now",
    note: "A local-first utility layer for agents that need to inspect and improve audio without turning an editing agent into a DAW operator. It reports what it measured, which versioned rule matched, and the exact DSP parameters it resolved.",
    capabilities: [
      "measure → resolve → render → verify",
      "reports every DSP parameter it resolved",
      "abstains on tracks it can't change safely"
    ],
    href: null,
    repo: "https://github.com/fyang0507/audio-processing-cli",
    sortDate: "2026-08-10",
    order: 6,
    updated: "2026-08-29",
    figure: { caption: "what one run does", steps: ["measure", "resolve", "render", "verify"], exit: "abstain" },
    lines: ["Reports what it measured, which versioned rule matched, and the exact DSP parameters it resolved.", "Abstains on tracks it can't change safely."]
  },
  {
    id: "publish-cli",
    title: "Publish CLI",
    kind: "instrument",
    prominence: "agent-native",
    lifecycle: "wip",
    period: "2026—now",
    note: "A per-channel distribution layer that turns one canonical markdown draft into a native draft on each platform. The never-publishes boundary is structural rather than a guard rail: only the draft endpoints are ever called.",
    capabilities: [
      "one draft → X, LinkedIn, Reddit, WeChat",
      "reads each platform's contract first",
      "never posts: structural, not a guard rail"
    ],
    href: null,
    repo: "https://github.com/fyang0507/publish-cli",
    sortDate: "2026-06-30",
    order: 7,
    updated: "2026-08-29",
    figure: { caption: "what one draft becomes", steps: ["one draft", "each platform's contract", "native drafts"], exit: "never posts" },
    lines: ["Only the draft endpoints are ever called: the never-publishes boundary is structural, not a guard rail."]
  },
  {
    id: "instant-bookmark",
    title: "Instant Bookmark",
    kind: "project",
    prominence: null,
    lifecycle: "historical",
    period: "2025",
    note: "A service for saving URLs and screenshots to Notion instantly from the web, iOS Shortcuts, or Raycast.",
    href: null,
    repo: "https://github.com/fyang0507/instant-bookmark",
    sortDate: "2025-05-17",
    order: 4,
    updated: "2026-07-18"
  },
  {
    id: "wavelength",
    title: "Wavelength",
    kind: "project",
    prominence: null,
    lifecycle: "historical",
    period: "2025",
    note: "A daily workflow that gathers subscribed creators, uses AI to sort new work by relevance, and delivers a focused Notion digest.",
    href: null,
    repo: "https://github.com/fyang0507/wavelength",
    sortDate: "2024-12-29",
    order: 5,
    updated: "2026-07-18"
  },
  {
    id: "tsugi",
    title: "Tsugi",
    kind: "project",
    prominence: null,
    lifecycle: "historical",
    period: "2026",
    note: "An agentic harness that turns trial-and-error execution into reusable skills, so later runs can skip the research and repeat what worked.",
    href: null,
    repo: "https://github.com/fyang0507/tsugi",
    sortDate: "2026-01-03",
    order: 3,
    updated: "2026-07-18"
  }
].map(Object.freeze));
