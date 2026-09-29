#!/usr/bin/env python3
"""Find the landmarks an essay actually has and mark them up for Reading's rail.

A build-time port of design/2026-09-motion/r2-08a-landmarks.js, run by
generate-content.py as a post-pass over each rendered body. Tiers, in order of
trust:

1. explicit section markers on a line of their own: <strong>1.0</strong>,
   plain "1.0", "（一）非建制", "I. Unincorporated", "(3)", 序 / Preface /
   后记 / Postscript, or an <h2>/<h3> whose whole text is such a number
2. headings: real <h2>/<h3> and whole-line bold titles ("广州惯性")
3. figures and pull quotes, only when there is no tier-1/2 structure

fill: minute ticks at paragraph starts ("3 min") for essays with no structure,
or inside a stretch structure leaves unmarked (> 40% of the reading time, or
> 4 min).

The output must stay identical to the board's JS, so string lengths count
UTF-16 code units, whitespace is JavaScript's, and rounding is Math.round's.
Check it against the board with node:

    python3 scripts/landmarks.py --parity <posts.js>

using a posts.js whose bodies do not yet carry landmarks, e.g. `git show
be351de:content/posts.js`. The one deliberate difference: footnotes
(<section class="foot">) are left out of the scan like the reference appendix,
where the board would tokenise them and drop their wrapper. No parity body has
footnotes.
"""

from __future__ import annotations

import math
import re

WS = "\t\n\v\f\r    -     　﻿"
WS_CHARS = "\t\n\v\f\r   " + "".join(map(chr, range(0x2000, 0x200B))) + "    　﻿"
S, NS, DOT = f"[{WS}]", f"[^{WS}]", "[^\n\r  ]"
F = re.ASCII  # JS \d, \b and /i are ASCII-only

NUMBER = r"[0-9]+\.[0-9]+|[（(][一二三四五六七八九十百0-9]{1,4}[）)]"
WORD_LIST = r"序|跋|后记|尾声|引子|楔子|preface|prologue(?: [IVX]+)?|epilogue|postscript|coda"
NUM_EXACT = re.compile(rf"^(?:{NUMBER}|[IVXLC]{{1,6}}\.?|{WORD_LIST})\Z", F | re.I)
NUM_PLAIN = re.compile(rf"^(?:{NUMBER}|[IVXLC]{{1,6}}\.)\Z", F)  # a bare number is enough without bold
NUM_LEAD = re.compile(rf"^({NUMBER}|[IVXLC]{{1,6}}\.){S}*({NS}{DOT}{{0,52}})\Z", F)  # number + short title
WORDS = re.compile(rf"^(?:{WORD_LIST})\Z", F | re.I)

MARGIN_NOTE_RE = re.compile(rf'<span class="mn[\s\S]*?</span>{S}*</span>')
BLOCK_RE = re.compile(r"<(p|h[1-6]|figure|blockquote|ul|ol|pre|div|table)\b([^>]*)>([\s\S]*?)</\1>", F | re.I)
BR_RE = re.compile(rf"<br{S}*/?>", F | re.I)


def js_trim(s: str) -> str:
    return s.strip(WS_CHARS)


def u16(s: str) -> int:
    return len(s.encode("utf-16-le", "surrogatepass")) // 2


def u16_slice(s: str, n: int) -> str:
    return s.encode("utf-16-le", "surrogatepass")[: 2 * n].decode("utf-16-le", "surrogatepass")


def text(h: str) -> str:
    h = MARGIN_NOTE_RE.sub("", h or "")
    h = re.sub(r"<sup[\s\S]*?</sup>", "", h)
    h = re.sub(r"<[^>]+>", "", h)
    for entity, char in (("&nbsp;", " "), ("&amp;", "&"), ("&#x27;", "'"), ("&#39;", "'"),
                         ("&quot;", '"'), ("&lt;", "<"), ("&gt;", ">")):
        h = h.replace(entity, char)
    return js_trim(re.sub(f"{S}+", " ", h))


def esc(s: str) -> str:
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")


def cjk(s: str) -> bool:
    return re.search("[㐀-鿿]", s) is not None


def clip(s: str, n: int) -> str:
    return js_trim(u16_slice(s, n - 1)) + "…" if u16(s) > n else s


def short_label(s: str) -> str:
    """A rail label has ~12 mono cells: 6 CJK characters, the part before a colon, or a clipped phrase."""
    if cjk(s):
        return clip(s, 7)
    head = js_trim(re.split("[:：—–]", s)[0])
    return clip(head if u16(head) >= 3 else s, 13)


def undot(label: str) -> str:
    return re.sub(r"\.\Z", "", label, count=1)


def js_round(x: float) -> int:
    return math.floor(x + 0.5)


def classify(h: str, alone: bool) -> dict | None:
    """A line that starts a paragraph. Numbered markers only need the blank line before them (poems write
    "（一）<br>first line"); a bold title must also stand alone."""
    t = text(h)
    if not t or u16(t) > 60:
        return None
    line = js_trim(h)
    bold = re.search(r"^<strong>[\s\S]*</strong>\Z", line) or re.search(r"^<b>[\s\S]*</b>\Z", line)
    if bold and NUM_EXACT.search(t):
        return {"kind": "sec", "label": undot(t), "title": ""}
    if not bold and NUM_PLAIN.search(t):
        return {"kind": "sec", "label": undot(t), "title": ""}
    m = NUM_LEAD.search(t)
    if m and not re.search(r"[。，；,;]\Z", m.group(2)):
        return {"kind": "sec", "label": undot(m.group(1)), "title": m.group(2)}
    if alone and bold and not WORDS.search(t) and u16(t) <= 32 and not re.search(r"[。，；,;.!?！？]\Z", t):
        return {"kind": "head", "label": short_label(t), "title": t}
    return None


def tokenize(body: str) -> list[dict]:
    """The body as blocks; <p> blocks (and loose text between blocks) become lines split at <br>."""
    out: list[dict] = []
    last = 0
    for m in BLOCK_RE.finditer(body):
        gap = js_trim(body[last : m.start()])
        if gap:
            out.append({"k": "p", "lines": BR_RE.split(gap)})
        if m.group(1).lower() == "p":
            out.append({"k": "p", "lines": BR_RE.split(m.group(3))})
        else:
            out.append({"k": "block", "tag": m.group(1).lower(), "attrs": m.group(2), "inner": m.group(3), "raw": m.group(0)})
        last = m.end()
    tail = js_trim(body[last:])
    if tail:
        out.append({"k": "p", "lines": BR_RE.split(tail)})
    return out


def build(html: str, reading_min: int, pre: str) -> dict:
    """→ {html, marks, kind, total, minutes}; marks carry id, kind, label, title, peek, minute."""
    html = html or ""
    cuts = [i for i in (html.find('<section class="foot"'), html.find('<section class="appendix"')) if i >= 0]
    cut = min(cuts) if cuts else len(html)
    body, appendix = html[:cut], html[cut:]
    blocks = tokenize(body)
    chars, starts, found, figs = 0, [], [], []

    # pass 1: character offsets, paragraph starts, structural candidates
    for bi, b in enumerate(blocks):
        if b["k"] == "block":
            t = text(b["inner"])
            if re.search(r"^h[23]\Z", b["tag"]):
                lead = NUM_LEAD.search(t)
                if NUM_EXACT.search(t):
                    b["mark"] = {"kind": "sec", "label": undot(t), "title": ""}
                elif lead:
                    b["mark"] = {"kind": "sec", "label": undot(lead.group(1)), "title": lead.group(2)}
                else:
                    b["mark"] = {"kind": "head", "label": short_label(t), "title": t}
                b["mark"]["at"] = chars
                found.append(b["mark"])
            elif b["tag"] in ("figure", "blockquote") or re.search(r'class="(?:fig|pull)', b["attrs"]):
                fig = b["tag"] == "figure" or "fig" in b["attrs"]
                b["mark"] = {"kind": "fig", "label": "fig. 图" if fig else "“ ”", "title": clip(t, 60), "at": chars}
                figs.append(b["mark"])
            chars += u16(t)
            continue
        b["flags"] = {}
        lines, blank_before = b["lines"], True
        for i, line in enumerate(lines):
            t2 = text(line)
            if not t2:
                blank_before = True
                continue
            blank_after = i == len(lines) - 1 or not text(lines[i + 1])
            c = classify(line, blank_after) if blank_before else None
            if c:
                c.update(at=chars, block=bi, line=i)
                found.append(c)
                b["flags"][i] = c
            elif blank_before:
                starts.append({"at": chars, "block": bi, "line": i, "text": t2})
            chars += u16(t2)
            blank_before = False

    total = max(1, chars)
    minutes_total = max(1, reading_min or js_round(total / 400))
    # tier 1 needs two markers; a lone "后记" or "序" is a heading-level mark. Tier 3 only when there is no structure.
    secs = [f for f in found if f["kind"] == "sec"]
    if len(secs) < 2:
        for f in found:
            f["kind"] = "head"
    marks = list(found) if found else list(figs)
    kind = "sections" if len(secs) >= 2 else "headings" if found else "figures" if figs else "minutes"

    # fill: minute ticks inside long unmarked stretches (or everywhere, for essays with no structure)
    M = minutes_total
    step = 1 if M <= 6 else 2 if M <= 14 else 3 if M <= 24 else 5

    def min_at(c: float) -> float:
        return c / total * M

    bounds = [0] + [min_at(f["at"]) for f in marks] + [M]
    fill_any, minutes = not marks, []
    for g in range(len(bounds) - 1):
        a, z = bounds[g], bounds[g + 1]
        if not fill_any and z - a <= max(4, M * 0.4):
            continue
        m = step
        while m < M - step * 0.4:
            edge = 0 if fill_any else step * 0.5
            if not (m <= a + edge or m >= z - edge):
                target, best = total * m / M, None
                for s in starts:
                    if best is None or abs(s["at"] - target) < abs(best["at"] - target):
                        best = s
                if best and not best.get("used") and all(
                    abs(x["at"] - best["at"]) > total * step / M * 0.45 for x in minutes
                ):
                    best["used"] = True
                    minutes.append({"kind": "min", "label": f"{m} min", "title": clip(best["text"], 64),
                                    "at": best["at"], "block": best["block"], "line": best["line"], "minute": m})
            m += step
    marks = sorted(marks + minutes, key=lambda f: f["at"])
    if kind != "minutes" and minutes:
        kind += "+minutes"
    for i, f in enumerate(marks):
        f["id"] = f"{pre}lm{i + 1}"
        if not f.get("minute"):
            minute = max(0, js_round(min_at(f["at"]) * 10) / 10)
            f["minute"] = int(minute) if float(minute).is_integer() else minute
    marked = {id(f) for f in marks}

    def first_line_after(bi: int, li: int) -> str:
        """The first readable line after a section marker: its peek text."""
        for b in range(bi, len(blocks)):
            block = blocks[b]
            if block["k"] != "p":
                continue
            for i in range(li + 1 if b == bi else 0, len(block["lines"])):
                t = text(block["lines"][i])
                if t:
                    return clip(t, 64)
        return ""

    # pass 2: emit. Marker lines become headings; the blank lines around them become the heading's margins.
    out: list[str] = []
    for bi, b in enumerate(blocks):
        if b["k"] == "block":
            mark = b.get("mark")
            if mark and id(mark) in marked:
                cls = "lm lm-sec" if mark["kind"] == "sec" else "lm-fig" if mark["kind"] == "fig" else "lm lm-head"

                def retag(m: re.Match, cls: str = cls, mark: dict = mark) -> str:
                    tag, attrs = m.group(1), m.group(2)
                    old = re.search(rf'{S}class="([^"]*)"', attrs)
                    attrs = re.sub(rf'{S}class="[^"]*"', "", attrs, count=1)
                    return f'<{tag}{attrs} class="{cls}{" " + old.group(1) if old else ""}" id="{mark["id"]}">'

                out.append(re.sub(r"^<([a-z0-9]+)\b([^>]*)>", retag, b["raw"], count=1, flags=F | re.I))
                if mark["kind"] == "sec" and not mark["title"]:
                    mark["peek"] = first_line_after(bi, -1)
            else:
                out.append(b["raw"])
            continue
        lines, buf = b["lines"], []

        def flush() -> None:
            while buf and not text(buf[0]) and "lm-anchor" not in buf[0]:
                buf.pop(0)
            while buf and not text(buf[-1]):
                buf.pop()
            if buf:
                out.append("<p>" + "<br>".join(buf) + "</p>")
            buf.clear()

        for i, line in enumerate(lines):
            f = b["flags"].get(i)
            if f and id(f) in marked:
                flush()
                if f["kind"] == "sec":
                    inner = f'<span class="lm-no">{esc(f["label"])}</span>'
                    inner += f'<span class="lm-t">{esc(f["title"])}</span>' if f["title"] else ""
                else:
                    inner = re.sub(r"^<(strong|b)>([\s\S]*)</\1>\Z", r"\2", js_trim(line), count=1)
                out.append(f'<h2 class="lm {"lm-sec" if f["kind"] == "sec" else "lm-head"}" id="{f["id"]}">{inner}</h2>')
                f["peek"] = f["title"] or first_line_after(bi, i)
                continue
            tick = None
            for mk in minutes:
                if mk["block"] == bi and mk["line"] == i:
                    tick = mk
            buf.append(f'<span class="lm-anchor" id="{tick["id"]}" aria-hidden="true"></span>{line}' if tick else line)
        flush()
    for f in marks:
        f["peek"] = f.get("peek") or f["title"] or ""
    return {"html": "".join(out) + appendix, "marks": marks, "kind": kind, "total": total, "minutes": M}


def manifest(result: dict) -> dict:
    """The landmarks as posts.js carries them: the rail's overall kind plus one entry per mark."""
    fields = ("id", "kind", "label", "title", "peek", "minute")
    return {"kind": result["kind"], "marks": [{k: f[k] for k in fields} for f in result["marks"]]}


def parity(posts_js: str) -> int:
    """Compare build() with the board's JS, run in node, over every body in a landmark-free posts.js."""
    import json
    import subprocess
    from pathlib import Path

    board = Path(__file__).resolve().parents[1] / "design" / "2026-09-motion" / "r2-08a-landmarks.js"
    source = Path(posts_js).read_text(encoding="utf-8")
    posts = json.loads(source.split("window.FY_POSTS=", 1)[1].strip().rstrip(";"))
    jobs = [{"id": p["id"], "html": p[key], "min": p["readingMin"], "pre": pre}
            for p in posts for key, pre in (("htmlZh", "zh-"), ("htmlEn", "en-")) if p.get(key)]
    script = (
        "global.window={};require(process.argv[1]);const J=JSON.parse(require('fs').readFileSync(0,'utf8'));"
        "process.stdout.write(JSON.stringify(J.map(j=>{const r=window.Landmarks.build(j.html,j.min,j.pre);"
        "return {html:r.html,kind:r.kind,total:r.total,minutes:r.minutes,marks:r.marks.map(m=>"
        "({id:m.id,kind:m.kind,label:m.label,title:m.title,peek:m.peek,minute:m.minute,at:m.at}))}})))"
    )
    run = subprocess.run(["node", "-e", script, str(board)], input=json.dumps(jobs), capture_output=True,
                         text=True, check=True)
    failures = 0
    for job, want in zip(jobs, json.loads(run.stdout)):
        got = build(job["html"], job["min"], job["pre"])
        got = {"html": got["html"], "kind": got["kind"], "total": got["total"], "minutes": got["minutes"],
               "marks": [{**m, "at": f["at"]} for m, f in zip(manifest(got)["marks"], got["marks"])]}
        if got != want:
            failures += 1
            diff = [k for k in want if got[k] != want[k]]
            print(f"MISMATCH {job['id']} {job['pre']}: {', '.join(diff)}")
    print(f"landmark parity: {len(jobs) - failures}/{len(jobs)} bodies identical to the board JS")
    return 1 if failures else 0


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--parity", metavar="POSTS_JS", required=True, help="a posts.js without landmarks")
    raise SystemExit(parity(parser.parse_args().parity))
