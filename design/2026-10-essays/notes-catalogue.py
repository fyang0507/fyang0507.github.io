"""design/2026-10-essays/notes-catalogue.py — the catalogue of Reading's footnote spans, as HTML.

Every margin note on Reading (13 essays carry references; 268 notes in all) was read against the span today's
phrase finder marks (lib/reading/notes.js phrase(): back from the ref to a clause stop, at least 16 Latin / 6 CJK
characters, at most ~70 / ~34) and judged by hand: what is the note about, and does the span say so?

  node /tmp/fyshot/run.mjs design/2026-10-essays/notes-catalogue.mjs   # → /tmp/fyshot/notes-catalogue.json
  python3 design/2026-10-essays/notes-catalogue.py                     # → design/2026-10-essays/notes-catalogue.html

Standard library only. The labels below are the judgement; the HTML is generated from them and the dump.
"""
# Hand labels for every margin note's highlighted span (today's phrase()), judged against what the note is about.
# target: W one word / name / title · Q a quotation · C the clause the ref closes · S the whole sentence ·
#         P a passage (several sentences) · F words after the ref (or in an earlier sentence)
# verdict per language: R right · N near-miss (holds the target but a few words over or under) · W wrong
# kind: short (part of the target) · long (target plus clause around it) · clipped (the length cap cut a name,
#       number, word or the subject) · off (other words) · multi (two notes on one spot, [1, 2] or [18][19]: both get one span) ·
#       cross (the span runs back across another ref and its note)
# Format: essay: { n: (target, 'EN verdict kind', 'ZH verdict kind' or None, comment) }
L = {
 'god-in-the-edit': {
  1: ('Q', 'N clipped', 'R', 'EN drops the speaker "Anderson"'),
  2: ('S', 'W short', 'W short', "Greer's whole defence; the span is its last clause"),
  3: ('S', 'W short', 'W short', "Bob Ryan's argument; the span is its second half"),
  4: ('Q', 'R', 'R', ''),
  5: ('S', 'W short', 'W short', 'the note is about NBA Entertainment; the span is "and sold as future memory"'),
  6: ('S', 'W short', 'W short', 'Hubbard\'s line; the span is "trusting his teammates"'),
  7: ('S', 'W short', 'W short', 'the 1998 Finals; the span is the last clause'),
  8: ('S', 'W clipped', 'W short', 'the Post report; EN starts "own Athlete of the Century poll"'),
  9: ('C', 'R', 'R', ''),
  10: ('C', 'R', 'R', ''),
  11: ('Q', 'N long', 'N long', 'the note is the "choke" story; the span adds "but none as transmissible as"'),
  12: ('C', 'R', 'R', ''),
  13: ('Q', 'R', 'R', 'EN keeps a stray closing quote mark'),
  14: ('C', 'N clipped', 'R', 'EN drops "The Guardian was"'),
  15: ('C', 'W clipped', 'R', 'EN cuts the name: "Post data article used…"'),
  16: ('C', 'R', 'R', ''),
  17: ('S', 'W short', 'W short', "the note is Ken Burns's criticism; the span is only the because-clause"),
  18: ('C', 'W multi', 'W multi', '[18][19] sit side by side and get one span: the Horace Grant note marks the Pippen clause'),
  19: ('C', 'R', 'R', ''),
  20: ('S', 'W clipped', 'R', 'EN drops "James\'s fourth championship"'),
 },
 'one-way-into-japan': {
  1: ('C', 'W short', None, 'Kashiwagi\'s idea; the span is "but by knowledge."'),
  2: ('F', 'W off', None, 'the note is the Wang Anshi poem quoted after the colon'),
  3: ('W', 'N long', None, 'the note is the term hysteria siberiana; the span is the whole sentence'),
  4: ('W', 'R', None, ''),
  5: ('F', 'W off', None, 'the note is Ramiel / Evangelion, named in the previous sentence'),
 },
 'salvation-mountain': {
  1: ('C', 'R', None, ''),
  2: ('P', 'W short', None, "Knight's story over several sentences; the span is the last one"),
  3: ('P', 'W short', None, 'the description before it; the span is "is Salvation Mountain as it exists today."'),
  4: ('P', 'W short', None, 'the paragraph before it; the span is "is Wikipedia\'s account."'),
  5: ('C', 'N clipped', None, 'starts "rain breached…", cutting "torrential rain"'),
  6: ('C', 'R', None, ''),
  7: ('Q', 'W short', None, 'the poem runs four lines; the span is "green upon green…"'),
 },
 'the-seemingly-innocent': {
  1: ('Q', 'W short', None, 'a three-sentence Rolland quotation; the span is its last sentence'),
  2: ('C', 'R', None, ''),
  3: ('S', 'W short', None, 'the procession; the span is the last third of the sentence'),
  4: ('S', 'W short', None, 'the gateway figures; the span is "the two rivers that flow through the city."'),
  5: ('Q', 'W short', None, 'the Ehrenburg quotation; the span is its last clause'),
 },
 'hawaii-has-no-anger': {
  1: ('C', 'R', None, ''),
  2: ('S', 'W short', None, "the fireworks' origin; the span is the last clause"),
  3: ('C', 'W clipped', None, 'drops "Thirty-seven American billionaires own private holdings"'),
 },
 'workplace-vultures': {
  1: ('Q', 'W clipped', 'R', 'EN drops "90 percent": "of the employees at such companies…"'),
 },
 'the-stories-we-live-02': {
  1: ('S', 'W short', 'W short', 'the Altman claim; the span is "and artistic creation"'),
  2: ('Q', 'W off', 'W off', 'the note is "You Are What You Measure"; the span is the other saying'),
  3: ('P', 'W short', 'W short', 'Notion 2.0; the span is the last clause'),
  4: ('Q', 'W short', 'W short', 'the Pamuk quotation; the span is its second half'),
  5: ('W', 'W off', 'N long', 'the note is the telescope; EN names it after the ref'),
  6: ('Q', 'N short', 'N short', 'the joke; the span is its punchline'),
  7: ('W', 'R', 'R', ''),
  8: ('C', 'N clipped', 'R', 'EN drops "Bilibili"'),
  9: ('W', 'W clipped', 'N long', 'EN cuts the title: "Sheet No Longer Wants to Strive” caused…"'),
  10: ('Q', 'R', 'R', ''),
  11: ('P', 'W short', 'W short', 'the photograph, described over three sentences'),
  12: ('Q', 'W short', 'R', 'EN keeps half the quotation'),
  13: ('Q', 'N long', 'R', ''),
  14: ('Q', 'R', 'R', ''),
  15: ('Q', 'R', 'R', ''),
  16: ('Q', 'R', 'R', ''),
  17: ('Q', 'N clipped', 'R', ''),
  18: ('C', 'N clipped', 'R', 'EN drops "as Christians"'),
  19: ('S', 'W clipped', 'W short', ''),
 },
 'the-stories-we-live-03': {
  1: ('Q', 'R', 'R', ''),
  2: ('P', 'W short', 'W short', "Moriyama's career and his advice; the span is the last clause"),
  3: ('W', 'W off', 'N long', 'the note is "Es muss sein!"; EN marks the words after it'),
  4: ('P', 'W short', 'W short', 'Fung Yu-lan, quoted and paraphrased; the span is the last clause'),
  5: ('W', 'N long', 'N long', ''),
  6: ('S', 'N short', 'R', ''),
  7: ('Q', 'R', 'R', ''),
  8: ('C', 'R', 'W long', 'ZH runs back across a parenthesis: "变成了语境问题（因此…"'),
  9: ('C', 'N clipped', 'R', ''),
  10: ('C', 'R', 'R', ''),
  11: ('W', 'R', 'W clipped', 'ZH cuts "斯坦福": "的学生发表的…"'),
  12: ('W', 'N long', 'N long', 'the note is the AI constitution; the span is the whole sentence'),
  13: ('W', 'N clipped', 'R', ''),
  14: ('C', 'R', 'W clipped', 'ZH starts mid-word: "法让自己成为最后一批受害者（扎克伯格…"'),
  15: ('W', 'N long', 'N long', ''),
 },
 'the-stories-we-live-04': {
  1: ('Q', 'W short', 'W short', '"Fuck that, let\'s get it done": the span is the second half'),
  2: ('Q', 'W short', 'W short', 'a couplet; the span is its second line'),
  3: ('Q', 'W short', 'W short', 'the shouted line; the span is its second half'),
  4: ('W', 'N clipped', 'N long', ''),
  5: ('W', 'W off', 'N long', 'the note is "Our Generation"; EN marks "a collection of photographs."'),
  6: ('Q', 'N short', 'R', 'EN misses the poem\'s first line, "Living"'),
  7: ('P', 'W short', 'R', ''),
  8: ('P', 'W short', 'W short', 'the Red Star Line passage; the span is "Albert Einstein was among them."'),
  9: ('W', 'R', 'W clipped', 'ZH cuts the title: "岁月，生活》"'),
 },
 'sacramentos-absent': {
  1: ('S', 'N clipped', 'N short', 'both drop the subject, the agency towers'),
  2: ('Q', 'W off', 'W clipped', 'EN marks the gloss after the quotation; ZH starts mid-quotation'),
  3: ('S', 'N clipped', 'W clipped', 'ZH starts mid-word: "开发项目…"'),
  4: ('S', 'W short', 'W clipped', 'ZH splits a number: "100公里…" (1,100 km)'),
  5: ('C', 'W clipped', 'R', 'EN splits a number: "000 Chinese people lived here." (5,000)'),
 },
 'the-stories-we-live-05': {
  1: ('C', 'W multi', 'W multi', '[1, 2]: the 80-hour note marks the jobs clause'),
  2: ('C', 'R', 'R', ''),
  3: ('S', 'N short', 'R', ''),
  4: ('Q', 'R', 'R', ''),
  5: ('C', 'R', 'N short', ''),
  6: ('S', 'W short', 'W short', 'drops what Altman said about the name'),
  7: ('Q', 'N long', 'R', ''),
  8: ('C', 'R', 'R', ''),
  9: ('Q', 'W clipped', 'W short', "Paul Graham's quotation, cut in the middle"),
  10: ('W', 'R', 'R', ''),
  11: ('C', 'W clipped', 'N long', 'EN drops "Chinese companies"'),
  12: ('C', 'N clipped', 'R', ''),
  13: ('C', 'N clipped', 'W clipped', 'ZH starts mid-word: "系起来——特朗普…"'),
  14: ('C', 'W clipped', 'W clipped', 'EN drops "one-fifth of entry-level"; ZH starts mid-word "人则…"'),
  15: ('S', 'W clipped', 'N short', ''),
  16: ('C', 'W clipped', 'W clipped', 'EN starts "trucks or look too ugly…"; ZH starts mid-word "是指…"'),
  17: ('W', 'N long', 'N long', ''),
  18: ('Q', 'R', 'R', ''),
  19: ('W', 'N long', 'N long', ''),
  20: ('C', 'N short', 'N short', ''),
  21: ('C', 'W clipped', 'R', ''),
  22: ('C', 'W short', 'N short', 'EN: "six days a week."'),
  23: ('Q', 'W short', 'W short', "the founders' if-then; the span is the then"),
  24: ('W', 'R', 'R', ''),
  25: ('Q', 'N long', 'N long', ''),
  26: ('C', 'N clipped', 'R', ''),
  27: ('Q', 'N clipped', 'R', ''),
  28: ('C', 'W cross', 'R', 'EN runs back across ref 27 and its margin note'),
  29: ('Q', 'W short', 'W short', 'the tail of the Wang Xiaobo quotation'),
  30: ('S', 'N short', 'N short', ''),
  31: ('C', 'W clipped', 'R', 'EN drops "the Americas"'),
  32: ('Q', 'W short', 'W short', 'the image, "lie on the riverbed, watching…", loses its first half'),
 },
 'nobody-likes-me': {
  1: ('C', 'N clipped', 'R', ''),
  2: ('S', 'W clipped', 'N short', ''),
  3: ('S', 'N short', 'N short', ''),
  4: ('C', 'R', 'R', ''),
  5: ('C', 'R', 'R', ''),
  6: ('C', 'N clipped', 'R', ''),
  7: ('S', 'W short', 'R', 'EN: "and decision-making"'),
  8: ('C', 'R', 'R', ''),
  9: ('C', 'R', 'R', ''),
  10: ('C', 'R', 'R', ''),
  11: ('C', 'N clipped', 'R', 'EN drops "OpenAI\'s"'),
  12: ('Q', 'N clipped', 'R', ''),
  13: ('Q', 'W short', 'W short', 'the tail of the Akutagawa quotation'),
  14: ('S', 'N short', 'N short', ''),
 },
 'google-just-wants': {
  1: ('C', 'R', 'R', ''),
  2: ('P', 'W short', 'W short', 'the note is Ox Alpha, introduced a sentence earlier'),
  3: ('C', 'R', 'R', ''),
  4: ('S', 'W clipped', 'W short', 'EN starts "down as CEO…", splitting "stepped down"'),
  5: ('S', 'W short', 'W short', 'the rumour is that Demis wanted to leave; the span is that he stayed'),
  6: ('C', 'R', 'R', ''),
  7: ('Q', 'N clipped', 'W short', ''),
  8: ('P', 'N short', 'N short', ''),
  9: ('C', 'R', 'R', ''),
 },
}


import collections
import html
import json
import pathlib

HERE = pathlib.Path(__file__).resolve().parent
DUMP = pathlib.Path('/tmp/fyshot/notes-catalogue.json')
TARGETS = {'W': 'one word, name or title', 'Q': 'a quotation', 'C': 'the clause the ref closes', 'S': 'the whole sentence',
           'P': 'a passage of several sentences', 'F': 'words after the ref, or in an earlier sentence'}
KINDS = {'short': 'too short: part of what the note is about', 'clipped': 'cut by the length cap: a name, number, word or the subject',
         'long': 'too long: a clause around a single word or title', 'off': 'other words entirely',
         'multi': 'two notes on one spot get one span', 'cross': 'runs back across another ref and its note'}
VERDICT = {'R': 'right', 'N': 'near-miss', 'W': 'wrong'}


def key_of(essay_id):
    for k in L:
        if k in essay_id:
            return k
    raise KeyError(essay_id)


def rows_of(dump):
    rows = []
    for e in dump:
        k = key_of(e['id'])
        for nt in e['notes']:
            n = int(nt['n'])
            target, en, zh, comment = L[k][n]
            v = (en if e['lang'] == 'en' else zh).split()
            rows.append(dict(e=e, key=k, lang=e['lang'], n=n, target=target, verdict=v[0], kind=v[1] if len(v) > 1 else '',
                             comment=comment, nt=nt))
    for k in L:
        for n in L[k]:
            assert any(r['key'] == k and r['n'] == n for r in rows), (k, n)
    return rows


def pct(a, b):
    return f'{round(100 * a / b)}%' if b else '–'


def context(nt):
    s, at, hs, span = nt['ctx'], nt['at'], nt['hs'], nt['span']
    end = s.index('⁾', at) + 1
    if hs >= 0:
        out = html.escape(s[:hs]) + '<mark>' + html.escape(s[hs:hs + len(span)]) + '</mark>' + html.escape(s[hs + len(span):at])
    else:
        out = html.escape(s[:at])
    out += '<b class="ref">' + html.escape(s[at:end]) + '</b>' + html.escape(s[end:])
    return out.replace('\n', '<span class="br">¶</span> ')


def main():
    dump = json.loads(DUMP.read_text())
    rows = rows_of(dump)
    total = collections.Counter(r['verdict'] for r in rows)
    by_lang = {l: collections.Counter(r['verdict'] for r in rows if r['lang'] == l) for l in ('en', 'zh')}
    by_target = {t: collections.Counter(r['verdict'] for r in rows if r['target'] == t) for t in TARGETS}
    by_kind = collections.Counter(r['kind'] for r in rows if r['verdict'] != 'R')
    sups = sum(e['sups'] for e in dump)
    repeats = sum(len(e['repeats']) for e in dump)
    proofs = [r for r in rows if r['nt']['proof']]
    N = len(rows)

    head = f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Notes · the catalogue of today's footnote spans</title>
<link rel="icon" href="../../favicon.png" type="image/png" sizes="512x512">
<link rel="stylesheet" href="../../lib/shared/site-tokens.css">
<link rel="stylesheet" href="notes-board.css">
</head><body class="nb cat"><main>
<p class="kicker">design 2026-10 · essays · notes · the catalogue</p>
<h1>Every footnote span on Reading, judged <span class="cn">每一处注释高亮，逐条判定</span></h1>
<p class="lede">Each row is one margin note: the ref's context with <mark>today's span</mark> (what the pen brackets with ⌜ ⌟), the ref <b class="ref">⁽n⁾</b>, what the note is about, and a verdict. <a href="notes-board.html">← back to the board</a></p>
'''
    # the counts
    t = []
    t.append(f'<section class="counts"><h2>Counts <span class="cn">数字</span></h2>')
    t.append(f'<p><b>{N}</b> margin notes ({sum(by_lang["en"].values())} EN, {sum(by_lang["zh"].values())} ZH) in {len({r["key"] for r in rows})} of 27 essays, from {sups} ref marks in the text. '
             f'{repeats} marks repeat an earlier ref and get no note and no pen. Four essays carry refs only in their English body.</p>')
    t.append('<table class="tally"><tr><th></th><th>notes</th><th>right</th><th>near-miss</th><th>wrong</th></tr>')
    for name, c in [('all', total), ('English', by_lang['en']), ('Chinese', by_lang['zh'])]:
        s = sum(c.values())
        t.append(f'<tr><th>{name}</th><td>{s}</td><td>{c["R"]} · {pct(c["R"], s)}</td><td>{c["N"]} · {pct(c["N"], s)}</td><td>{c["W"]} · {pct(c["W"], s)}</td></tr>')
    t.append('</table><h3>By what the note is about</h3><table class="tally"><tr><th></th><th>notes</th><th>right</th><th>near-miss</th><th>wrong</th></tr>')
    for k, label in TARGETS.items():
        c = by_target[k]; s = sum(c.values())
        t.append(f'<tr><th>{label}</th><td>{s}</td><td>{c["R"]} · {pct(c["R"], s)}</td><td>{c["N"]}</td><td>{c["W"]}</td></tr>')
    t.append(f'</table><h3>How the {N - total["R"]} that are not right go wrong</h3><table class="tally">')
    for k, label in KINDS.items():
        t.append(f'<tr><th>{label}</th><td>{by_kind[k]}</td></tr>')
    pc = collections.Counter(VERDICT_C.get((r['key'], r['lang'], r['n']), 'R') for r in proofs)
    t.append(f'</table><h3>Candidate C’s claim</h3><p>Punctuation proves a span (a closing quotation or title mark right before the ref, its opening mark in the same line of source) for <b>{len(proofs)}</b> of {N} notes ({pct(len(proofs), N)}). '
             f'Of those, {pc["R"]} are right, {pc["N"]} near-misses and {pc["W"]} wrong; today’s span gets {sum(1 for r in proofs if r["verdict"] == "R")} of the same {len(proofs)} right. The other {N - len(proofs)} notes get no bracket in C.</p></section>')

    # the rows, by essay
    body = []
    for e in dump:
        k = key_of(e['id'])
        body.append(f'<section class="essay"><h2>{html.escape(e["id"])} <span class="lang">{e["lang"].upper()}</span></h2>')
        if e['repeats']:
            body.append(f'<p class="rep">Repeated refs with no note of their own: {", ".join("[" + x + "]" for x in e["repeats"])}</p>')
        body.append('<table class="rows"><tr><th>ref</th><th>today’s span in context</th><th>about</th><th>verdict</th><th>the note</th></tr>')
        for r in [r for r in rows if r['e'] is e]:
            nt = r['nt']
            c = f'<div class="proof">C brackets: {html.escape(nt["proof"])}</div>' if nt['proof'] else ''
            body.append(f'<tr class="v{r["verdict"]}"><td class="n">{r["n"]}</td><td class="ctx">{context(nt)}{c}</td>'
                        f'<td class="tg">{TARGETS[r["target"]]}</td><td class="vd"><b>{VERDICT[r["verdict"]]}</b>{(" · " + r["kind"]) if r["kind"] else ""}'
                        f'{("<div>" + html.escape(r["comment"]) + "</div>") if r["comment"] else ""}</td><td class="nt">{html.escape(nt["note"])}</td></tr>')
        body.append('</table></section>')
    out = head + '\n'.join(t) + '\n' + '\n'.join(body) + '\n</main></body></html>\n'
    (HERE / 'notes-catalogue.html').write_text(out)
    print('wrote', HERE / 'notes-catalogue.html', '·', N, 'notes ·', dict(total), '· proofs', len(proofs), dict(pc))


# How C's proven spans fare (judged like the rows above; every proof not listed is right)
VERDICT_C = {
    ('the-stories-we-live-02', 'en', 2): 'W', ('the-stories-we-live-02', 'zh', 2): 'W',
    ('the-stories-we-live-03', 'en', 9): 'N', ('the-stories-we-live-05', 'zh', 17): 'N',
    ('nobody-likes-me', 'en', 5): 'N', ('nobody-likes-me', 'en', 12): 'N', ('nobody-likes-me', 'zh', 12): 'N',
}

if __name__ == '__main__':
    main()
