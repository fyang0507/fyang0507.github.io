// Home · the network budget: a cold first visit at 1440 (DPR 1) and 390. No posts.js / photos.js / support.js / unpkg /
// design/ requests; images from assets/derived only (the identity stickers and favicon are the shared header's);
// image bytes ≤ 1.2 MB at 1440.
//   node /tmp/fyshot/run.mjs scripts/verify/home-net.mjs
const U = (process.env.BASE || 'http://127.0.0.1:4173/') + 'index.html';
export default async (page, ctx) => {
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    await page.setViewportSize({ width: w, height: h });
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Network.enable'); await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
    const reqs = {}, rows = [];
    cdp.on('Network.requestWillBeSent', (e) => { reqs[e.requestId] = { url: e.request.url, type: e.type }; });
    cdp.on('Network.responseReceived', (e) => { const r = reqs[e.requestId]; if (r) { r.status = e.response.status; r.mime = e.response.mimeType; } });
    cdp.on('Network.loadingFinished', (e) => { const r = reqs[e.requestId]; if (r) { r.bytes = e.encodedDataLength; rows.push(r); } });
    await page.goto(U + '?opener=first', { waitUntil: 'commit' });   // one cold load, the full first visit
    await page.evaluate(() => new Promise((r) => document.addEventListener('opx:done', r, { once: true })));
    await page.waitForTimeout(1500);
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: false });
    const rel = (u) => u.replace(/^https?:\/\/127\.0\.0\.1:4173\//, '');
    const bad = rows.filter((r) => /posts\.js|photos\.js|support\.js|unpkg|\/design\//.test(r.url));
    const imgs = rows.filter((r) => r.type === 'Image' || /^image\//.test(r.mime || ''));
    const outside = imgs.filter((r) => !/assets\/derived\//.test(r.url)).map((r) => rel(r.url));
    const bytes = imgs.reduce((a, r) => a + (r.bytes || 0), 0), fav = imgs.filter((r) => /favicon/.test(r.url)).reduce((a, r) => a + r.bytes, 0);
    ctx.log(w, 'requests', rows.length, '· forbidden', bad.length ? bad.map((r) => rel(r.url)).join(', ') : 'none', '· non-200', rows.filter((r) => r.status && r.status !== 200).map((r) => r.status + ' ' + rel(r.url)).join(', ') || 'none');
    ctx.log(w, 'image bytes', (bytes / 1024).toFixed(0) + ' KB in', imgs.length, 'files (' + ((bytes - fav) / 1024).toFixed(0) + ' KB without the site favicon) · outside assets/derived:', outside.filter((u) => !/^data:/.test(u)).join(', ') || 'none');
    imgs.sort((a, b) => b.bytes - a.bytes).slice(0, 8).forEach((r) => ctx.log('   ', String(Math.round(r.bytes / 1024)).padStart(5), 'KB', rel(r.url)));
    await cdp.detach();
  }
};
