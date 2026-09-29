// reading-rail.mjs — the pencil margin (sections, minutes, headings+minutes, figures+minutes): every landmark the build
// split is on the page and on the rail, End reaches
// the last landmark and the end tick, and overscroll (a rubber band past either end) un-draws nothing. At 1440 it is
// the margin rail; at 390 the strip on the nav's hairline with its counter.
//   node /tmp/fyshot/run.mjs scripts/verify/reading-rail.mjs      (env: see reading-lib.mjs)
import { POSTS, url, context, watch, ready, scroll, geo, report, sleep } from './reading-lib.mjs';

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

export default async (page, ctx) => {
  const browser = page.context().browser(), rows = [];
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    for (const key of ['cover', 'minutes', 'headings', 'figures']) {
      for (const lang of ['zh', 'en']) {
        const errors = [], c = await context(browser, w, h), p = await c.newPage(); watch(p, errors);
        await p.goto(url(POSTS[key], '&lang=' + lang)); await ready(p);
        const tag = w + ' ' + key + ' ' + lang;
        const lm = await p.evaluate(() => {
          const lang = document.documentElement.classList.contains('lang-en') ? 'en' : 'zh', body = document.querySelector('.post-body.' + lang);
          const ids = [...body.querySelectorAll('[id^="' + lang + '-lm"]')].map((e) => e.id);   // headings, figures, pull quotes, minute anchors
          return { ids, ticks: document.querySelectorAll('.rail-tick').length, stripTicks: document.querySelectorAll('.strip-tick').length,
            labels: [...document.querySelectorAll('.rail-lab')].map((a) => a.getAttribute('href').slice(1)) };
        });
        const everyLabelOnPage = lm.labels.every((id) => lm.ids.includes(id));
        rows.push([tag + ': every landmark has a tick (rail and strip)', lm.ids.length > 0 && lm.ticks === lm.ids.length && lm.stripTicks === lm.ids.length && everyLabelOnPage,
          { onPage: lm.ids.length, ticks: lm.ticks, strip: lm.stripTicks, labels: lm.labels.length }]);
        const g = await geo(p);
        if (w < 700) {   // the phone counter reads sensibly at every point: "k / N", "3.0 / 10" or "4 / 8 min"
          const seen = [];
          for (let i = 0; i <= 10; i++) { await scroll(p, Math.round(g.sL + (g.max - g.sL) * i / 10), 250); seen.push(await p.evaluate(() => document.querySelector('.rc-no').textContent + document.querySelector('.rc-of').textContent)); }
          rows.push([tag + ': the phone counter always reads', seen.every((t) => /^\S+ \/ \d+( min)?$/.test(t)), [...new Set(seen)].join(' | ')]);
        }
        await scroll(p, g.max, 1200);
        const end = await state(p);
        rows.push([tag + ': End reaches the last landmark and the end tick', end.cur === lm.ids.length - 1 && end.done, end]);
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
          if (w >= 1080) {   // a rail label jumps there and takes the keyboard along
            await p.evaluate(() => document.querySelectorAll('.rail-lab')[3].click()); await sleep(1300);
            const f = await p.evaluate(() => ({ id: document.activeElement.id, lm: document.activeElement.matches('.lm, .lm-anchor'), want: document.querySelectorAll('.rail-lab')[3].getAttribute('href').slice(1) }));
            rows.push([tag + ': a rail label moves focus to its landmark', f.lm && f.id === f.want, f]);
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
  report(ctx.log, rows);
};
