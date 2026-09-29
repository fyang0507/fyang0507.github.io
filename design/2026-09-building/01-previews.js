/* design/2026-09-building · what a card knows that its face doesn't say: the chapters inside, a key figure, status
   and dates, the evidence, what's live and what's WIP, and the links. Every line is taken from the project's own
   pages (building/fred-agent/*, building/njjoe/*) or from content/building-projects.js; nothing is invented.
   In production this would be a few fields per project in content/building-projects.js. Chapters this round did
   not mock link to the live pages (live: true). */
window.BD_PREVIEW = Object.freeze({
  'fred-agent': {
    what: 'field notes', count: '5 chapters',
    chapters: [
      { n: '01', t: 'Overview', h: 'A Life With Handles', line: 'The capability already exists. The opportunity does not.', href: '02-overview.html' },
      { n: '02', t: 'System', h: 'From existing capability to real opportunity', line: '4 outcomes · 4 protocols · 5 handles · 1 policy', href: '04-system.html' },
      { n: '03', t: 'Principles', h: 'Eleven principles', line: 'portability, attention, shared state, privacy, failure', href: '03-principles.html' },
      { n: '04', t: 'Components', h: 'Interfaces Beyond the Chatbox', line: 'Sundial · Outreach · Notion Gateway · Whoami · Headless Recovery', href: '../../building/fred-agent/components.html', live: true },
      { n: '05', t: 'Demos', h: 'The System in Motion', line: '4 recorded runs · 1 controlled comparison', href: '../../building/fred-agent/demos.html', live: true }
    ],
    figure: { cap: 'the system, in one line', steps: ['atomic handles', 'workflow protocols', 'real-life outcomes'] },
    status: ['active system', '2025—now', 'last revised July 2026'],
    source: 'source · private working repository',
    enter: { label: 'Open the field notes', href: '02-overview.html' }
  },
  njjoe: {
    what: 'field studies', count: '2 cases',
    chapters: [
      { n: '00', t: 'Overview', h: 'The problem lived between the tools.', line: 'with Joe Costello · May 2026—now', href: '05-njjoe.html' },
      { n: '01', t: 'Listing microsite', state: 'shipped', h: 'One house, four interfaces.', line: 'one listing microsite live · June 2026', href: '../../building/njjoe/microsite.html', live: true },
      { n: '02', t: 'APA campaign', state: 'active pilot', h: 'The campaign Joe could not run by calling harder.', line: '248 drafts verified · Sep 5, 2026', wip: 'collecting campaign results', href: '../../building/njjoe/apa.html', live: true }
    ],
    figure: { cap: 'the common pattern', steps: ['fragmented systems', 'agent assembles', 'human judgment', 'one experience'] },
    status: ['one live workflow + one active pilot', 'May 2026—now'],
    source: 'collaborator · Joe Costello',
    enter: { label: 'Open the casebook', href: '05-njjoe.html' }
  },
  'audio-processing-cli': {
    what: 'instrument', count: 'repository only',
    figure: { cap: 'what one run does', steps: ['measure', 'resolve', 'render', 'verify'], exit: 'abstain' },
    lines: ['Reports what it measured, which versioned rule matched, and the exact DSP parameters it resolved.', "Abstains on tracks it can't change safely."],
    status: ['wip', '2026—now', 'updated 2026-08-29'],
    none: 'no field notes yet · the repository is the record'
  },
  'publish-cli': {
    what: 'instrument', count: 'repository only',
    figure: { cap: 'what one draft becomes', steps: ['one draft', "each platform's contract", 'native drafts'], exit: 'never posts' },
    lines: ['Only the draft endpoints are ever called: the never-publishes boundary is structural, not a guard rail.'],
    status: ['wip', '2026—now', 'updated 2026-08-29'],
    none: 'no field notes yet · the repository is the record'
  }
});
