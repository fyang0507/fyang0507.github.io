#!/usr/bin/env python3
"""Find the landmarks an essay actually has and mark them up for Reading's rail.

Run by generate-content.py as a post-pass over each rendered body; the design
lineage is design/2026-09-motion/r2-08a-landmarks.js. Tiers, in order of trust:

1. section markers at the start of a paragraph, in either language: 1.0,
   （一）, (3), (IV), IV., bracketed names (（序）, （序一）, (Prologue)), a
   name alone on its line (前言, Preface), and in bold or a heading tag also
   bare IV or Prologue II. Each may carry a
   short title: "（九）致麦麦", "(IX) A Few Small Thoughts", bold "V — Title".
   A bracketed word that names nothing ("（杂讯）", "(Noise)") counts only
   among numbered sections.
2. headings: real <h2>/<h3> and whole-line bold titles
3. figures and pull quotes, only when there is no tier-1/2 structure

fill: minute ticks at paragraph starts ("3 min") for essays with no structure,
or inside a stretch structure leaves unmarked (> 40% of the reading time, or
> 4 min).

Marker lines become <h2 class="lm lm-sec|lm-head">; the blank lines around a
heading become its margins, and every other line break is kept. An essay's
English and Chinese bodies should get the same structure; check them with

    python3 scripts/landmarks.py --check
"""

from __future__ import annotations

import html as html_mod
import math
import re
from pathlib import Path

ROMAN = "[IVXLC]{1,6}"
NAMED = "(?i:序[一二三四五六七八九十]?|序言|前言|跋|后记|尾声|引子|楔子|preface|prologue(?: [IVX]+| [0-9]+)?|epilogue|postscript|coda)"
BRACKETED = rf"[（(](?:[一二三四五六七八九十百]{{1,4}}|[0-9]{{1,3}}|{ROMAN}|{NAMED})[）)]"
PLAIN = rf"[0-9]+\.[0-9]+|{BRACKETED}|{ROMAN}\."  # a marker in plain text
BARE = rf"{ROMAN}|{NAMED}"                        # a marker that needs bold or a heading tag
TITLE = r"(\S.{0,79})"
EXACT_PLAIN = re.compile(rf"(?:{PLAIN})\Z")
EXACT_BARE = re.compile(rf"(?:{BARE})\Z")
EXACT_NAMED = re.compile(rf"{NAMED}\Z")
LEAD_PLAIN = re.compile(rf"({PLAIN})\s*(?:[—–:：]\s*)?{TITLE}\Z")
LEAD_BARE = re.compile(rf"({BARE})\s*[—–:：.]\s*{TITLE}\Z")
WEAK = re.compile(r"[（(][^\s（）()]{1,8}[）)]\Z")
SENTENCE_END = re.compile(r"[。，；,;.]\Z")
BLOCK_RE = re.compile(r"<(p|h[1-6]|figure|blockquote|ul|ol|pre|div|table)\b([^>]*)>([\s\S]*?)</\1>", re.I)
BR_RE = re.compile(r"<br\s*/?>", re.I)
BREAK_TAG = re.compile(r"<br\s*/?>|</?(?:p|li|ul|ol|h[1-6]|div|blockquote|figure|figcaption|pre|table|tr|td|th)\b[^>]*>", re.I)


def strip_notes(h: str) -> str:
    """Drop every margin note (<span class="mn ...">, nested spans included) and citation <sup>."""
    out, i = [], 0
    for m in re.finditer(r'<span class="mn\b', h):
        if m.start() < i:
            continue
        out.append(h[i:m.start()])
        depth, j = 0, m.start()
        for tag in re.finditer(r"<(/?)span\b[^>]*>", h[j:]):
            depth += -1 if tag.group(1) else 1
            if depth == 0:
                i = j + tag.end()
                break
        else:
            i = len(h)
    out.append(h[i:])
    return re.sub(r"<sup[\s\S]*?</sup>", "", "".join(out))


def text(h: str) -> str:
    """Readable text: notes dropped, a space at every block and line boundary, entities decoded."""
    h = BREAK_TAG.sub(" ", strip_notes(h or ""))
    return re.sub(r"\s+", " ", html_mod.unescape(re.sub(r"<[^>]+>", "", h))).strip()


def esc(s: str) -> str:
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")


def cjk(s: str) -> bool:
    return re.search("[㐀-鿿]", s) is not None


def clip(s: str, n: int) -> str:
    return s[: n - 1].strip() + "…" if len(s) > n else s


def short_label(s: str) -> str:
    """A rail label has ~12 mono cells: 6 CJK characters, the part before a colon, or a clipped phrase."""
    if cjk(s):
        return clip(s, 7)
    head = re.split("[:：—–]", s)[0].strip()
    return clip(head if len(head) >= 3 else s, 13)


def undot(label: str) -> str:
    return re.sub(r"\.\Z", "", label)


def marker(t: str, strong: bool, alone: bool = False) -> dict | None:
    """A section marker, optionally with a title. `strong`: the line is bold or a heading tag;
    `alone`: it is a paragraph of its own."""
    if EXACT_PLAIN.match(t) or (strong and EXACT_BARE.match(t)) or (alone and EXACT_NAMED.match(t)):
        return {"kind": "sec", "label": undot(t), "title": "", "raw": t}
    m = LEAD_PLAIN.match(t) or (strong and LEAD_BARE.match(t))
    if m and not SENTENCE_END.search(m.group(2)):
        return {"kind": "sec", "label": undot(m.group(1)), "title": m.group(2), "raw": m.group(1)}
    if WEAK.match(t):
        return {"kind": "sec", "label": t, "title": "", "weak": True}
    return None


def classify(h: str, alone: bool) -> dict | None:
    """A line that starts a paragraph. Markers only need the blank line before them (poems write
    "（一）<br>first line"); a bold title must also stand alone. Translations run about twice as long
    as the Chinese, so a Latin title may be twice as long too."""
    t = text(h)
    if not t or len(t) > 90:
        return None
    line = h.strip()
    bold = bool(re.match(r"<(strong|b)>[\s\S]*</\1>\Z", line))
    found = marker(t, bold, alone)
    if found:
        return found
    if alone and bold and len(t) <= (32 if cjk(t) else 64) and not re.search(r"[。，；,;.!?！？]\Z", t):
        return {"kind": "head", "label": short_label(t), "title": t}
    return None


def tokenize(body: str) -> list[dict]:
    """The body as blocks; <p> blocks (and loose text between blocks) become lines split at <br>."""
    out: list[dict] = []
    last = 0
    for m in BLOCK_RE.finditer(body):
        gap = body[last:m.start()].strip()
        if gap:
            out.append({"k": "p", "lines": BR_RE.split(gap)})
        if m.group(1).lower() == "p":
            out.append({"k": "p", "lines": BR_RE.split(m.group(3))})
        else:
            out.append({"k": "block", "tag": m.group(1).lower(), "attrs": m.group(2), "inner": m.group(3), "raw": m.group(0)})
        last = m.end()
    tail = body[last:].strip()
    if tail:
        out.append({"k": "p", "lines": BR_RE.split(tail)})
    return out


def heading(mark: dict, inner: str) -> str:
    """Every landmark heading has one shape: a section's number and title, or a heading's own markup.
    A section title keeps its source markup (links, citations) when the number leads it literally."""
    if mark["kind"] == "sec":
        lead = re.match(r"\s*" + re.escape(esc(mark.get("raw", ""))) + r"\s*(?:[—–:：]\s*)?", inner) if mark.get("raw") else None
        title = inner[lead.end():] if lead and mark["title"] else esc(mark["title"])
        inner = f'<span class="lm-no">{esc(mark["label"])}</span>'
        inner += f'<span class="lm-t">{title}</span>' if mark["title"] else ""
        return f'<h2 class="lm lm-sec" id="{mark["id"]}">{inner}</h2>'
    return f'<h2 class="lm lm-head" id="{mark["id"]}">{inner}</h2>'


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
            if b["tag"] in ("h2", "h3"):
                b["mark"] = marker(t, True) or {"kind": "head", "label": short_label(t), "title": t}
                b["mark"]["at"] = chars
                found.append(b["mark"])
            elif b["tag"] in ("figure", "blockquote") or re.search(r'class="(?:fig|pull)', b["attrs"]):
                fig = b["tag"] == "figure" or "fig" in b["attrs"]
                b["mark"] = {"kind": "fig", "label": "fig. 图" if fig else "“ ”", "title": clip(t, 60), "at": chars}
                figs.append(b["mark"])
            chars += len(t)
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
            chars += len(t2)
            blank_before = False

    # A bracketed name is a section only among numbered ones; tier 1 needs two markers, and a lone
    # "后记" or "序" is a heading-level mark. Tier 3 only when there is no structure.
    if sum(f["kind"] == "sec" and not f.get("weak") for f in found) < 2:
        found = [f for f in found if not f.get("weak")]
    secs = [f for f in found if f["kind"] == "sec"]
    if len(secs) < 2:
        for f in found:
            f["kind"] = "head"
    marks = list(found) if found else list(figs)
    kind = "sections" if len(secs) >= 2 else "headings" if found else "figures" if figs else "minutes"

    # fill: minute ticks inside long unmarked stretches (or everywhere, for essays with no structure)
    total = max(1, chars)
    M = max(1, reading_min or round(total / 400))
    step = 1 if M <= 6 else 2 if M <= 14 else 3 if M <= 24 else 5

    def min_at(c: float) -> float:
        return c / total * M

    bounds = [0] + [min_at(f["at"]) for f in marks] + [M]
    fill_any, minutes = not marks, []
    for a, z in zip(bounds, bounds[1:]):
        if not fill_any and z - a <= max(4, M * 0.4):
            continue
        edge = 0 if fill_any else step * 0.5
        for m in range(step, math.ceil(M - step * 0.4), step):
            if m <= a + edge or m >= z - edge:
                continue
            target = total * m / M
            best = min(starts, key=lambda s: abs(s["at"] - target), default=None)
            if best and not best.get("used") and all(abs(x["at"] - best["at"]) > total * step / M * 0.45 for x in minutes):
                best["used"] = True
                minutes.append({"kind": "min", "label": f"{m} min", "title": clip(best["text"], 64),
                                "at": best["at"], "block": best["block"], "line": best["line"], "minute": m})
    marks = sorted(marks + minutes, key=lambda f: f["at"])
    if kind != "minutes" and minutes:
        kind += "+minutes"
    for i, f in enumerate(marks):
        f["id"] = f"{pre}lm{i + 1}"
        if not f.get("minute"):
            minute = math.floor(min_at(f["at"]) * 10 + 0.5) / 10
            f["minute"] = int(minute) if minute.is_integer() else minute
    marked = {id(f) for f in marks}
    ticks = {(f["block"], f["line"]): f for f in minutes}

    def first_line_after(bi: int, li: int) -> str:
        """The first readable line after a section marker: its peek text."""
        for b in range(bi, len(blocks)):
            if blocks[b]["k"] != "p":
                continue
            for line in blocks[b]["lines"][li + 1 if b == bi else 0:]:
                if text(line):
                    return clip(text(line), 64)
        return ""

    def is_heading(b: dict | None) -> bool:
        return bool(b and b["k"] == "block" and id(b.get("mark")) in marked and b["mark"]["kind"] != "fig")

    # pass 2: emit. Marker lines become headings; only the blank lines touching a heading are dropped.
    out: list[str] = []
    after_heading = False
    for bi, b in enumerate(blocks):
        if b["k"] == "block":
            mark = b.get("mark")
            if is_heading(b):
                out.append(heading(mark, b["inner"]))
                if mark["kind"] == "sec" and not mark["title"]:
                    mark["peek"] = first_line_after(bi, -1)
                after_heading = True
                continue
            if mark and id(mark) in marked:                      # a figure or pull quote keeps its own markup
                old = re.search(r'\sclass="([^"]*)"', b["attrs"])
                attrs = re.sub(r'\sclass="[^"]*"', "", b["attrs"], count=1)
                cls = "lm-fig" + (" " + old.group(1) if old else "")
                out.append(f'<{b["tag"]}{attrs} class="{cls}" id="{mark["id"]}">{b["inner"]}</{b["tag"]}>')
            else:
                out.append(b["raw"])
            after_heading = False
            continue
        buf: list[str] = []

        def flush(before_heading: bool) -> None:
            nonlocal after_heading
            if after_heading:
                while buf and not text(buf[0]) and "lm-anchor" not in buf[0]:
                    buf.pop(0)
            if before_heading:
                while buf and not text(buf[-1]):
                    buf.pop()
            if buf:
                out.append("<p>" + "<br>".join(buf) + "</p>")
                after_heading = False
            buf.clear()

        for i, line in enumerate(b["lines"]):
            f = b["flags"].get(i)
            if f and id(f) in marked:
                flush(True)
                inner = re.sub(r"^<(strong|b)>([\s\S]*)</\1>\Z", r"\2", line.strip())
                out.append(heading(f, inner))
                f["peek"] = f["title"] or first_line_after(bi, i)
                after_heading = True
                continue
            tick = ticks.get((bi, i))
            buf.append(f'<span class="lm-anchor" id="{tick["id"]}" aria-hidden="true"></span>{line}' if tick else line)
        flush(is_heading(blocks[bi + 1] if bi + 1 < len(blocks) else None))
    for f in marks:
        f["peek"] = f.get("peek") or f["title"] or ""
    return {"html": "".join(out) + appendix, "marks": marks, "kind": kind, "total": total, "minutes": M}


def manifest(result: dict) -> dict:
    """The landmarks as a body file carries them: the rail's overall kind plus one entry per mark."""
    fields = ("id", "kind", "label", "title", "peek", "minute")
    return {"kind": result["kind"], "marks": [{k: f[k] for k in fields} for f in result["marks"]]}


# Where an essay's two bodies legitimately differ in structure (the sources are formatted differently).
EXPLAINED = {
    "2024-10-23_the-seemingly-innocent": "the English sets Rolland's opening quotation as a pull quote (>); "
                                         "the Chinese keeps it in a paragraph, so only English gets a quote mark",
}


def check() -> int:
    """Every essay's English and Chinese landmarks must agree in kind and in count per mark kind (minute
    ticks aside, since they follow each language's own text length), or be explained above."""
    import importlib.util

    spec = importlib.util.spec_from_file_location("generate_content", Path(__file__).with_name("generate-content.py"))
    generator = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(generator)
    posts = generator.load_posts()
    unexplained = 0
    for p in posts:
        shape = {}
        for lang in ("En", "Zh"):
            lm = p["landmarks" + lang]
            counts = {}
            for m in lm["marks"]:
                if m["kind"] != "min":
                    counts[m["kind"]] = counts.get(m["kind"], 0) + 1
            shape[lang] = (lm["kind"].split("+")[0], counts)
        agree = shape["En"] == shape["Zh"] or not (p["htmlEn"] and p["htmlZh"])
        note = "" if agree else EXPLAINED.get(p["id"], "UNEXPLAINED")
        unexplained += note == "UNEXPLAINED"
        print(f"{'ok ' if agree else '!! '}{p['id'][:40]:40} en {shape['En'][0]:9} {shape['En'][1]}  zh {shape['Zh'][0]:9} {shape['Zh'][1]}"
              + (f"\n     {note}" if note else ""))
    print(f"{len(posts)} essays; {unexplained} unexplained English/Chinese landmark mismatch(es)")
    return 1 if unexplained else 0


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--check", action="store_true", required=True, help="compare each essay's EN and ZH landmarks")
    parser.parse_args()
    raise SystemExit(check())
