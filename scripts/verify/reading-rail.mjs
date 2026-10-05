// reading-rail.mjs — the pencil margin (sections, minutes, headings+minutes, figures+minutes, and minutes with
// references): every landmark the build split is on the page and on the rail, the reference list (where a body has
// one) as its last entry, under its own title, End reaches the last landmark and the end tick, and overscroll (a
// rubber band past either end) un-draws nothing. At 1440 it is the margin rail, whose labels land their landmark
// clear of the nav; at 390 the strip on the nav's hairline with its counter, which names the references in them
// (Refs, 参考), and with no landmarks but the references counts the minutes read until them.
// The section headings the rail marks: a marker and the title the source gives it share one line (02's （十）小诗三首 /
// (10) Three Short Poems at 1440, 390 and 360), the marker is 20 px (17 px on phones), and at 360 no title runs out of
// the column.
//   node /tmp/fyshot/run.mjs scripts/verify/reading-rail.mjs      (env: see reading-lib.mjs)
import { POSTS, url, context, watch, ready, scroll, geo, report, sleep } from './reading-lib.mjs';

const RAILS = Object.assign({ refs: '2025-07-27_workplace-vultures' }, POSTS);   // refs: no structure, then references
const REF_NAME = { zh: '参考', en: 'Refs' };                                     // the phone counter in the references
const TITLED = '2022-11-27_the-stories-we-live-02';                              // （十）小诗三首, (10) Three Short Poems
const LONG = ['2023-12-28_the-stories-we-live-03', '2019-12-02_the-promised-and-the-forsaken', '2019-12-29_salvation-mountain'];   // the longest titles

const state = (page) => page.evaluate(() => {
  const r = document.querySelector('.rail'), html = document.documentElement;
  return { cur: +r.dataset.cur, done: r.dataset.done === 'true', mode: html.classList.contains('strip-mode') ? 'strip' : 'rail',
    count: (document.querySelector('.rc-no') || {}).textContent || '', end: getComputedStyle(document.querySelector('.rail-end')).strokeDashoffset };
});
// A rubber band: the browser reports a scroll position past the end (Safari does), and the page must read it as the end.
const band = (page, over) => page.evaluate((over) => {
  const max = document.documentElement.scrollHeight - innerHeight, v = over > 0 ? max + over : over;
  const own = Object.getOwnPropertyDescriptor(window, 'scrollY');
  Object.defineProperty(window, 'scrollY', { configurable: true, get: () => v });
  window.dispatchEvent(new Event('scroll'));
  const restore = () => { if (own) Object.defineProperty(window, 'scrollY', own); else delete window.scrollY; };
  return new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => { restore(); r(); })));
}, over);
// the phone counter at ten points from the landing to the end
const counter = async (p, g) => {
  const seen = [];
  for (let i = 0; i <= 10; i++) { await scroll(p, Math.round(g.sL + (g.max - g.sL) * i / 10), 250); seen.push(await p.evaluate(() => document.querySelector('.rc-no').textContent + document.querySelector('.rc-of').textContent)); }
  return seen;
};

async function headings(browser, rows) {
  for (const [w, h, px] of [[1440, 900, '20px'], [390, 844, '17px'], [360, 780, '17px']]) {
    for (const lang of ['zh', 'en']) {
      const errors = [], c = await context(browser, w, h), p = await c.newPage(); watch(p, errors);
      for (const post of w === 360 ? [TITLED].concat(LONG) : [TITLED]) {
        await p.goto(url(post, '&lang=' + lang)); await ready(p);
        const r = await p.evaluate((lang) => {
          const body = document.querySelector('.post-body.' + lang), col = body.getBoundingClientRect(), rg = document.createRange();
          const head = [...body.querySelectorAll('.lm-sec')].find((e) => /小诗三首|Three Short Poems/.test(e.textContent));
          const no = head && head.querySelector('.lm-no'), t = head && head.querySelector('.lm-t');
          if (t) rg.selectNodeContents(t);
          const a = no && no.getBoundingClientRect(), b = t && rg.getClientRects()[0];   // the marker, and the title's first line
          return { head: head ? head.textContent : null, size: no ? getComputedStyle(no).fontSize : null,
            oneLine: !!(a && b) && b.left >= a.right && b.top < a.bottom && b.bottom > a.top,
            over: [...body.querySelectorAll('.lm-t')].filter((e) => e.getBoundingClientRect().right > col.right + .5 || e.scrollWidth > e.clientWidth + 1).map((e) => e.textContent) };
        }, lang);
        const tag = w + ' ' + post.slice(0, 10) + ' ' + lang;
        if (post === TITLED) {
          rows.push([tag + ': the title shares the marker\'s first line, right of it', r.oneLine, r.head]);
          rows.push([tag + ': the marker is ' + px, r.size === px, r.size]);
        }
        if (w === 360) rows.push([tag + ': no section title runs out of the column', r.over.length === 0, r.over]);
      }
      rows.push([w + ' headings ' + lang + ': no console errors', errors.length === 0, errors.slice(0, 3)]);
      await c.close();
    }
  }
}

// No essay today is structureless, too short for a minute tick and with references: Workplace Vultures stands in, its
// minute ticks taken out of the body file as it loads.
async function refsOnly(browser, rows) {
  for (const lang of ['zh', 'en']) {
    const errors = [], c = await context(browser, 390, 844), p = await c.newPage(); watch(p, errors);
    await p.route('**/content/bodies/' + RAILS.refs + '.js', async (route) => {
      const res = await route.fetch(), s = await res.text(), i = s.indexOf('{'), j = s.lastIndexOf('}'), b = JSON.parse(s.slice(i, j + 1));
      for (const k of ['landmarksZh', 'landmarksEn']) b[k].marks = b[k].marks.filter((m) => m.kind === 'ref');
      await route.fulfill({ response: res, body: s.slice(0, i) + JSON.stringify(b) + s.slice(j + 1) });
    });
    await p.goto(url(RAILS.refs, '&lang=' + lang)); await ready(p);
    const seen = await counter(p, await geo(p)), last = seen[seen.length - 1];
    const ok = seen.every((t) => /^\d+ \/ \d+ min$/.test(t) || t === REF_NAME[lang]) && seen.some((t) => /^[1-9]\d* \/ \d+ min$/.test(t)) && last === REF_NAME[lang];
    rows.push(['390 references only ' + lang + ': the counter counts the minutes read, then names the references', ok, [...new Set(seen)].join(' | ')]);
    rows.push(['390 references only ' + lang + ': no console errors', errors.length === 0, errors.slice(0, 3)]);
    await c.close();
  }
}

export default async (page, ctx) => {
  const browser = page.context().browser(), rows = [];
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    for (const key of ['cover', 'minutes', 'headings', 'figures', 'refs']) {
      for (const lang of ['zh', 'en']) {
        const errors = [], c = await context(browser, w, h), p = await c.newPage(); watch(p, errors);
        await p.goto(url(RAILS[key], '&lang=' + lang)); await ready(p);
        const tag = w + ' ' + key + ' ' + lang;
        const lm = await p.evaluate(() => {
          const lang = document.documentElement.classList.contains('lang-en') ? 'en' : 'zh', body = document.querySelector('.post-body.' + lang);
          const ids = [...body.querySelectorAll('[id^="' + lang + '-lm"]')].map((e) => e.id);   // headings, figures, pull quotes, minute anchors, the references
          const app = body.querySelector('.appendix'), labs = [...document.querySelectorAll('.rail-lab')], last = labs[labs.length - 1];
          return { ids, ticks: document.querySelectorAll('.rail-tick').length, stripTicks: document.querySelectorAll('.strip-tick').length,
            labels: labs.map((a) => a.getAttribute('href').slice(1)),
            refs: app ? { id: app.id, title: app.querySelector('.appendix-title').textContent } : null,
            last: last ? { href: last.getAttribute('href').slice(1), text: last.textContent, ref: last.matches('.rl-ref') } : null,
            refLabels: document.querySelectorAll('.rail-lab.rl-ref').length };
        });
        const everyLabelOnPage = lm.labels.every((id) => lm.ids.includes(id));
        rows.push([tag + ': every landmark has a tick (rail and strip)', lm.ids.length > 0 && lm.ticks === lm.ids.length && lm.stripTicks === lm.ids.length && everyLabelOnPage,
          { onPage: lm.ids.length, ticks: lm.ticks, strip: lm.stripTicks, labels: lm.labels.length }]);
        // the references' label is their title (clipped with … where it runs past a label's room)
        const refLab = lm.refs && lm.last && lm.last.ref ? lm.last.text : null;
        rows.push([tag + ': the references, where there are any, are the last entry, under their own title', lm.refs
          ? lm.refLabels === 1 && !!refLab && lm.refs.title.startsWith(refLab.replace(/…$/, '')) && lm.last.href === lm.refs.id && lm.ids[lm.ids.length - 1] === lm.refs.id
          : lm.refLabels === 0, { refs: lm.refs, last: lm.last }]);
        const g = await geo(p);
        if (w < 700) {   // the phone counter reads sensibly at every point: "k / N", "3.0 / 10" or "4 / 8 min", or in the references their short name
          const seen = await counter(p, g);
          rows.push([tag + ': the phone counter always reads', seen.every((t) => /^\S+ \/ \d+( min)?$/.test(t) || (!!refLab && t === REF_NAME[lang])), [...new Set(seen)].join(' | ')]);
        }
        await scroll(p, g.max, 1200);
        const end = await state(p);
        rows.push([tag + ': End reaches the last landmark and the end tick', end.cur === lm.ids.length - 1 && end.done && (w >= 700 || !refLab || end.count === REF_NAME[lang]), end]);
        await band(p, 90); await sleep(300);
        const over = await state(p);
        rows.push([tag + ': overscroll past the end un-draws nothing', over.cur === end.cur && over.done, over]);
        if (key === 'cover' && lang === 'zh') {
          await scroll(p, Math.round(g.max / 2), 1200);
          const loop = await p.evaluate(() => {   // the current landmark's loop is drawn in the chosen wheat, not coral
            const host = document.documentElement.classList.contains('strip-mode') ? document.querySelector('.rc-no') : document.querySelector('.rail-lab.cur .rail-lab-t');
            const path = host && host.querySelector('svg path'), probe = document.createElement('i');
            probe.style.color = 'var(--hl-ink)'; document.body.appendChild(probe); const wheat = getComputedStyle(probe).color; probe.remove();
            return { drawn: !!path && getComputedStyle(path).strokeDashoffset !== '', wheat: !!path && getComputedStyle(path).stroke === wheat };
          });
          rows.push([tag + ': the current landmark carries the wheat loop', loop.drawn && loop.wheat, loop]);
          if (w >= 1080) {   // a rail label jumps there and takes the keyboard along, its landmark landing 28px under the nav
            const landed = () => p.evaluate(() => {
              const a = document.activeElement, n1 = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--n1'));
              return { id: a.id, lm: a.matches('.lm, .lm-anchor'), refs: a.matches('.appendix'), top: Math.round(a.getBoundingClientRect().top), want: n1 + 28,
                atEnd: scrollY >= document.documentElement.scrollHeight - innerHeight - 2 };
            });
            const clear = (f) => f.top >= f.want - 3 && (f.top <= f.want + 3 || f.atEnd);   // or the page scrolled to its end
            await p.evaluate(() => document.querySelectorAll('.rail-lab')[3].click()); await sleep(1300);
            const f = Object.assign(await landed(), { href: await p.evaluate(() => document.querySelectorAll('.rail-lab')[3].getAttribute('href').slice(1)) });
            rows.push([tag + ': a rail label moves focus to its landmark, clear of the nav', f.lm && f.id === f.href && clear(f), f]);
            await p.evaluate(() => document.querySelector('.rail-lab.rl-ref').click()); await sleep(1300);
            const r = await landed();
            rows.push([tag + ': the references label moves focus to the references, clear of the nav', r.refs && clear(r), r]);
          }
          await scroll(p, 0, 900); await band(p, -80); await sleep(300);
          const top = await state(p);
          rows.push([tag + ': a rubber band at the top reads as the top', !top.done && top.cur <= 0, top]);
          rows.push([tag + ': mode', top.mode === (w >= 1080 ? 'rail' : 'strip'), top.mode]);
          await p.screenshot({ path: '/tmp/fyshot/p2r-rail-' + w + '.png' });
        }
        rows.push([tag + ': no console errors', errors.length === 0, errors.slice(0, 3)]);
        await c.close();
      }
    }
  }
  await refsOnly(browser, rows);
  await headings(browser, rows);
  report(ctx.log, rows);
};
