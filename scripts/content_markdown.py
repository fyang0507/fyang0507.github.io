"""Render the small Markdown subset the imported essays use into Reading's HTML.

Standard library only, like scripts/generate-content.py, which imports this
module. Source newlines are canonical content: one newline becomes one <br>.
"""

from __future__ import annotations

import html
import re
from urllib.parse import urlparse


REFERENCE_ENTRY_RE = re.compile(r"^\s*(?:\[(\d+)\]|(\d+)[.)])\s+(.+?)\s*$")
REFERENCE_HEADINGS = {
    "reference",
    "references",
    "appendix",
    "参考",
    "参考资料",
    "参考信息",
    "参考信息列表",
    "注释",
    "附录",
}


def safe_href(url: str) -> str:
    parsed = urlparse(url)
    if parsed.scheme not in {"http", "https", "mailto"}:
        return "#"
    return html.escape(url, quote=True)


def safe_image_src(url: str) -> str:
    parsed = urlparse(url)
    if parsed.scheme not in {"", "http", "https"} or url.startswith("//"):
        return ""
    return html.escape(url, quote=True)


def reference_heading(line: str) -> bool:
    """A line that heads the reference list ("## References", "参考资料："). It only marks where the list
    starts: the list's title is its body's language (markdown_to_html)."""
    cleaned = re.sub(r"^[#*_\s]+|[#*_\s]+$", "", line).strip().rstrip(":：").strip()
    return cleaned.lower() in REFERENCE_HEADINGS


def split_reference_appendix(markdown: str) -> tuple[str, list[tuple[str, str]], list[str]]:
    """Separate the imported numeric reference list, and the heading line above it, from the essay body."""
    lines = markdown.strip().splitlines()
    entry_starts: list[int] = []
    for index, line in enumerate(lines):
        entry = REFERENCE_ENTRY_RE.match(line)
        if entry and int(entry.group(1) or entry.group(2)) == 1:
            entry_starts.append(index)

    for entry_start in reversed(entry_starts):
        references: list[tuple[str, str]] = []
        expected = 1
        index = entry_start
        while index < len(lines):
            if not lines[index].strip():
                index += 1
                continue
            entry = REFERENCE_ENTRY_RE.match(lines[index])
            if not entry:
                break
            number = int(entry.group(1) or entry.group(2))
            if number != expected:
                break
            references.append((str(number), entry.group(3)))
            expected += 1
            index += 1

        if not references:
            continue

        trailing = [line for line in lines[index:] if line.strip()]
        has_postscript_only = all(
            line.lstrip().startswith(("_*Originally", "*Originally", "_Originally"))
            for line in trailing
        )
        if len(references) == 1 and trailing and not has_postscript_only:
            continue

        heading_index: int | None = None
        cursor = entry_start - 1
        while cursor >= 0 and not lines[cursor].strip():
            cursor -= 1
        if cursor >= 0 and reference_heading(lines[cursor]):
            heading_index = cursor

        appendix_start = heading_index if heading_index is not None else entry_start
        cursor = appendix_start - 1
        while cursor >= 0 and not lines[cursor].strip():
            cursor -= 1
        if cursor >= 0 and re.match(r"^\s*(?:---+|\*\*\*+)\s*$", lines[cursor]):
            appendix_start = cursor

        body = "\n".join(lines[:appendix_start]).strip()
        postscript = lines[index:]
        return body, references, postscript

    return markdown.strip(), [], []


def margin_note(number: str | int, target: str, note_html: str, classes: str = "mn") -> str:
    """The margin copy of a footnote or reference, shown beside its citation.

    It repeats the entry at the foot of the essay, so it is aria-hidden and its
    links leave the tab order. `data-ref` is the id its citation links to, which
    is how Reading pairs each note with its <a> when one citation holds several
    keys ("[1, 2]" renders one <sup> followed by one note per key); `data-n` is
    the number that citation shows.
    """
    note_html = note_html.replace("<a href=", '<a tabindex="-1" href=')
    return (
        f'<span class="{classes}" aria-hidden="true" data-n="{number}" data-ref="{target}">'
        f'<span class="num">{number}</span><span>{note_html}</span></span>'
    )


def inline_markdown(
    text: str,
    footnotes: dict[str, str] | None = None,
    footnote_order: list[str] | None = None,
    references: dict[str, str] | None = None,
    reference_order: list[str] | None = None,
) -> str:
    """Render the small inline Markdown subset used by the imported essays."""
    out: list[str] = []
    plain: list[str] = []

    def flush() -> None:
        if plain:
            out.append(html.escape("".join(plain)))
            plain.clear()

    i = 0
    while i < len(text):
        if text[i] == "[" and references is not None and reference_order is not None:
            end = text.find("]", i + 1)
            keys = re.split(r"\s*,\s*", text[i + 1 : end]) if end != -1 else []
            if keys and all(key.isdigit() and key in references for key in keys):
                flush()
                citation_links: list[str] = []
                margin_notes: list[str] = []
                for key in keys:
                    first_reference = key not in reference_order
                    if first_reference:
                        reference_order.append(key)
                    citation_links.append(
                        f'<a href="#ref-{key}" aria-label="Reference {key}">{key}</a>'
                    )
                    if first_reference:
                        margin_notes.append(
                            margin_note(key, f"ref-{key}", inline_markdown(references[key]), "mn reference-note")
                        )
                out.append('<sup class="fnref ref-cite">' + ", ".join(citation_links) + "</sup>")
                out.extend(margin_notes)
                i = end + 1
                continue
        if text.startswith("[^", i) and footnotes is not None and footnote_order is not None:
            end = text.find("]", i + 2)
            key = text[i + 2 : end] if end != -1 else ""
            if key in footnotes:
                flush()
                first_reference = key not in footnote_order
                if first_reference:
                    footnote_order.append(key)
                number = footnote_order.index(key) + 1
                slug = re.sub(r"[^A-Za-z0-9_-]", "-", key).strip("-") or str(number)
                out.append(f'<sup class="fnref"><a href="#fn-{slug}" aria-label="Footnote {number}">{number}</a></sup>')
                if first_reference:
                    out.append(margin_note(number, f"fn-{slug}", inline_markdown(footnotes[key])))
                i = end + 1
                continue
        if text.startswith("==", i):
            end = text.find("==", i + 2)
            if end != -1:
                flush()
                marked = inline_markdown(
                    text[i + 2 : end], footnotes, footnote_order, references, reference_order
                )
                out.append(
                    '<span class="scribble">' + marked
                    + '<svg viewBox="0 0 120 9" preserveAspectRatio="none" aria-hidden="true">'
                    + '<path class="scribble-stroke" d="M2 5q18-6 34-1 22 5 44-1 20-4 38 1"></path></svg></span>'
                )
                i = end + 2
                continue
        if text.startswith("**", i):
            end = text.find("**", i + 2)
            if end != -1:
                flush()
                out.append(
                    "<strong>"
                    + inline_markdown(text[i + 2 : end], footnotes, footnote_order, references, reference_order)
                    + "</strong>"
                )
                i = end + 2
                continue
        if text[i] == "*":
            end = text.find("*", i + 1)
            if end != -1:
                flush()
                out.append(
                    "<em>"
                    + inline_markdown(text[i + 1 : end], footnotes, footnote_order, references, reference_order)
                    + "</em>"
                )
                i = end + 1
                continue
        if text[i] == "`":
            end = text.find("`", i + 1)
            if end != -1:
                flush()
                out.append("<code>" + html.escape(text[i + 1 : end]) + "</code>")
                i = end + 1
                continue
        if text[i] == "[":
            label_end = text.find("](", i + 1)
            if label_end != -1 and "[" not in text[i + 1 : label_end]:
                depth = 1
                url_start = label_end + 2
                cursor = url_start
                while cursor < len(text) and depth:
                    if text[cursor] == "(":
                        depth += 1
                    elif text[cursor] == ")":
                        depth -= 1
                    cursor += 1
                if depth == 0:
                    flush()
                    label = inline_markdown(
                        text[i + 1 : label_end], footnotes, footnote_order, references, reference_order
                    )
                    href = safe_href(text[url_start : cursor - 1])
                    out.append(f'<a href="{href}" target="_blank" rel="noopener noreferrer">{label}</a>')
                    i = cursor
                    continue
        plain.append(text[i])
        i += 1
    flush()
    return "".join(out)


def markdown_to_html(markdown: str, prefix: str) -> str:
    """Render the supported Markdown subset without folding source newlines.

    Both language bodies share one Reading page, so every footnote and
    reference anchor carries the body's `prefix` ("zh-ref-1", "#en-fn-a").
    """
    markdown, reference_items, appendix_postscript = split_reference_appendix(markdown)
    appendix_title = "参考资料" if prefix == "zh-" else "References"   # every list, whatever heading marks it
    references = dict(reference_items)
    source_lines = markdown.strip().splitlines()
    footnotes: dict[str, str] = {}
    lines: list[str] = []
    source_index = 0
    while source_index < len(source_lines):
        definition = re.match(r"^\[\^([^\]]+)\]:\s*(.*)$", source_lines[source_index])
        if not definition:
            lines.append(source_lines[source_index])
            source_index += 1
            continue
        key, first_line = definition.groups()
        note_lines = [first_line]
        source_index += 1
        while source_index < len(source_lines) and (
            source_lines[source_index].startswith("    ") or source_lines[source_index].startswith("\t")
        ):
            note_lines.append(source_lines[source_index].strip())
            source_index += 1
        footnotes[key] = " ".join(part for part in note_lines if part)

    blocks: list[str] = []
    paragraph: list[str] = []
    footnote_order: list[str] = []
    reference_order: list[str] = []

    def render_inline(text: str) -> str:
        return inline_markdown(text, footnotes, footnote_order, references, reference_order)

    def flush_paragraph() -> None:
        if not paragraph:
            return
        # Newlines are canonical content: one source newline becomes one <br>,
        # including repeated empty lines. Trailing spaces have no special role.
        rendered = [render_inline(line.rstrip()) for line in paragraph]
        if all(not line for line in rendered):
            blocks.append("<p>" + "<br>" * len(rendered) + "</p>")
        else:
            blocks.append("<p>" + "<br>".join(rendered) + "</p>")
        paragraph.clear()

    index = 0
    while index < len(lines):
        line = lines[index]
        fence = re.match(r"^\s*```([A-Za-z0-9_+-]*)\s*$", line)
        if fence:
            flush_paragraph()
            language = fence.group(1)
            code_lines: list[str] = []
            index += 1
            while index < len(lines) and not re.match(r"^\s*```\s*$", lines[index]):
                code_lines.append(lines[index])
                index += 1
            language_class = f' class="language-{html.escape(language, quote=True)}"' if language else ""
            blocks.append(f"<pre><code{language_class}>" + html.escape("\n".join(code_lines)) + "</code></pre>")
            index += 1
            continue

        heading = re.match(r"^(#{1,6})\s+(.+?)\s*$", line)
        if heading:
            flush_paragraph()
            level = min(4, max(2, len(heading.group(1))))
            blocks.append(f"<h{level}>{render_inline(heading.group(2))}</h{level}>")
            index += 1
            continue
        if re.match(r"^\s*(?:---+|\*\*\*+)\s*$", line):
            flush_paragraph()
            blocks.append('<div class="stars" aria-hidden="true">✦ &nbsp; ✦ &nbsp; ✦</div>')
            index += 1
            continue

        image = re.match(r"^!\[([^\]]*)\]\((\S+?)(?:\s+[\"'](.+?)[\"'])?\)\s*$", line)
        if image:
            flush_paragraph()
            alt, raw_src, caption = image.groups()
            src = safe_image_src(raw_src)
            if src:
                figure = f'<figure class="fig"><div class="washbg"><img src="{src}" alt="{html.escape(alt, quote=True)}" loading="lazy" decoding="async"></div>'
                if caption:
                    figure += f"<figcaption>{render_inline(caption)}</figcaption>"
                blocks.append(figure + "</figure>")
            index += 1
            continue

        if re.match(r"^\s*>\s?", line):
            flush_paragraph()
            quote_lines: list[str] = []
            while index < len(lines) and re.match(r"^\s*>\s?", lines[index]):
                quote_lines.append(re.sub(r"^\s*>\s?", "", lines[index]).strip())
                index += 1
            rendered_quote = [render_inline(quote_line) for quote_line in quote_lines]
            blocks.append('<blockquote class="pull"><p>' + "<br>".join(rendered_quote) + "</p></blockquote>")
            continue

        unordered = re.match(r"^\s*[-+*]\s+(.+)$", line)
        ordered = re.match(r"^\s*\d+[.)]\s+(.+)$", line)
        if unordered or ordered:
            flush_paragraph()
            list_tag = "ul" if unordered else "ol"
            matcher = r"^\s*[-+*]\s+(.+)$" if unordered else r"^\s*\d+[.)]\s+(.+)$"
            list_items: list[str] = []
            while index < len(lines):
                item = re.match(matcher, lines[index])
                if not item:
                    break
                list_items.append("<li>" + render_inline(item.group(1)) + "</li>")
                index += 1
            blocks.append(f"<{list_tag}>" + "".join(list_items) + f"</{list_tag}>")
            continue

        if not line.strip():
            paragraph.append("")
            index += 1
            continue
        paragraph.append(line)
        index += 1
    flush_paragraph()

    if footnote_order:
        items: list[str] = []
        for number, key in enumerate(footnote_order, start=1):
            slug = re.sub(r"[^A-Za-z0-9_-]", "-", key).strip("-") or str(number)
            items.append(
                f'<div class="fn" id="fn-{slug}"><span class="num">{number}</span>'
                f"<span>{inline_markdown(footnotes[key])}</span></div>"
            )
        blocks.append('<section class="foot" aria-label="Footnotes">' + "".join(items) + "</section>")

    if reference_items:
        items: list[str] = []
        for number, reference in reference_items:
            items.append(
                f'<li class="appendix-item" id="ref-{number}"><span class="appendix-number">{number}</span>'
                f'<span>{inline_markdown(reference)}</span></li>'
            )
        postscript = " ".join(line.strip() for line in appendix_postscript if line.strip())
        postscript = re.sub(r"^_\*(.+)_$", r"*\1*", postscript)
        postscript_html = (
            f'<p class="appendix-postscript">{inline_markdown(postscript)}</p>' if postscript else ""
        )
        blocks.append(
            f'<section class="appendix" aria-label="{html.escape(appendix_title, quote=True)}">'
            f'<h2 class="appendix-title">{html.escape(appendix_title)}</h2>'
            f'<ol class="appendix-list">{"".join(items)}</ol>{postscript_html}</section>'
        )
    # Escaped essay text can't contain a literal quote, so these only match generated anchors.
    return re.sub(r'( id="| href="#| data-ref=")(ref-|fn-)', rf"\g<1>{prefix}\2", "\n".join(blocks))
