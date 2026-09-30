// Probes the selectors the sessions use, on both snapshots. node /tmp/fyshot/run.mjs rec/probe.mjs
const B = 'http://127.0.0.1:4219/';
const Q = {
  r0: {
    'index.html': ['.hot.bookwrap', '.site-identity', '.site-home'],
    'Writing.dc.html': ['.shelf-row a.book', '.chip', '.site-tab--building', '.site-tab--shooting'],
    'Reading.dc.html?post=2026-08-29_google-just-wants-to-coast-to-a-win': ['.fnref a', '.mn', '.rnav'],
    'Building.dc.html': ['.card-slot--highlighted .highlighted-title', 'a[href="./building/fred-agent/"]', '.morph-toggle', '.site-tab--shooting'],
    'building/fred-agent/': ['.fa-project-nav a[href$="principles.html"]', 'a[href*="Building.dc.html"]', '.fa-project-nav a'],
    'building/fred-agent/principles.html': ['a[href*="Building.dc.html"]', '.fa-project-nav a', 'a[href="#attention"]'],
    'Gallery.dc.html': ['.photo-img', '.site-tab--about'],
    'About.dc.html': ['.field-card-wrap', '.flip-control', '.site-home'],
  },
  main: {
    'Writing.dc.html': ['.bk-hit[data-post]', '.lang-b[data-lang="en"]', '.site-tab--building', '.site-tab--shooting'],
    'Building.dc.html': ['.slot--lead .unpin-trigger', '.slot--lead .highlighted-title', '.site-tab--shooting', '.slot'],
    'building/fred-agent/principles.html': ['a[href*="Building.dc.html"]', '.rail-lab', '.pj-tabs .dos-tab', '#capture'],
    'Gallery.dc.html': ['.line-host .print', '.site-tab--about'],
    'About.dc.html': ['.grip', '.site-home', '.site-identity'],
  },
};
export default async (page, ctx) => {
  await page.setViewportSize({ width: 1280, height: 1000 });
  await page.addInitScript(() => { try { sessionStorage.setItem('fy-opener', '1'); } catch {} });
  for (const [snap, pages] of Object.entries(Q)) for (const [url, sels] of Object.entries(pages)) {
    await page.goto(B + snap + '/' + url, { waitUntil: 'load' }); await page.waitForTimeout(1800);
    const r = await page.evaluate((sels) => sels.map((s) => { const e = [...document.querySelectorAll(s)]; const v = e.find((x) => x.getBoundingClientRect().width); if (!v) return s + ' → ' + e.length + ' (none visible)'; const b = v.getBoundingClientRect(); return s + ' → ' + e.length + ' first ' + [b.x, b.y, b.width, b.height].map(Math.round).join(',') + ' ' + (v.getAttribute('href') || v.getAttribute('data-post') || v.textContent.trim().slice(0, 40)); }), sels);
    console.log('\n' + snap + '/' + url + '\n  ' + r.join('\n  '));
  }
};
