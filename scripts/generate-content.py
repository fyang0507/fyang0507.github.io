#!/usr/bin/env python3
"""Generate browser-ready content manifests for the dependency-free site.

The checked-in Markdown and TypeScript metadata remain the canonical imported
content. This script only performs a deterministic, standard-library-only
conversion to JavaScript files that the standalone .dc.html pages can load.
"""

from __future__ import annotations

import argparse
import ast
import html
import json
import re
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
POSTS_DIR = ROOT / "content" / "posts"
PHOTOS_SOURCE = ROOT / "content" / "photos-source.ts"

# Derived-image contract, shared by scripts/generate-derivatives.py (which writes
# the files) and the skill's audit_content.py (which verifies they exist).
# The originals under images/gallery/ and images/blog/covers/ stay canonical and
# are never served to browsers; pages reference these derivatives only.
DERIVED_DIR = "images/derived"
# Gallery thumbnails are pre-cropped to the 4:3 box the gallery CSS already
# center-crops to, so the browser never decodes a full frame for a 132px slot.
GALLERY_THUMB_ASPECT = (4, 3)
# Ladder chosen so each real slot lands just above its need rather than jumping
# a tier: the 148px rack slot takes 200w at 1x and 400w at 2x, and the ~320px
# mobile garland slot takes 400w at 1x and 800w at 2x.
GALLERY_THUMB_WIDTHS = (200, 400, 800)
# The lightbox displays at 1280px CSS; 2560 keeps it sharp on 2x displays.
GALLERY_DISPLAY_WIDTH = 2560
# Covers are decorative washes. Ladder fitted to the 236px shelf card, the
# ~340px mobile card, and Reading.dc.html's full-bleed 100vw hero.
COVER_WIDTHS = (320, 560, 900, 1600)
COVER_DEFAULT_WIDTH = 560


def derived_stem(image_url: str) -> str:
    """Collision-checked stem for an original's derivatives.

    Extension is dropped so `foo.JPG` and `foo.jpg` would collide; the
    derivative generator and the audit both fail loudly if that ever happens.
    """
    return Path(image_url).stem


def derivative_url(image_url: str, group: str, width: int) -> str:
    return f"./{DERIVED_DIR}/{group}/{derived_stem(image_url)}-{width}.jpg"


def srcset(image_url: str, group: str, widths) -> str:
    return ", ".join(f"{derivative_url(image_url, group, w)} {w}w" for w in widths)


def load_dimensions() -> dict[str, list[int]]:
    """Pixel sizes recorded by scripts/generate-derivatives.py, if it has run.

    Optional by design: this module stays standard-library-only and never shells
    out to an image tool, so it degrades to omitting aspect ratios rather than
    failing when the sidecar is absent.
    """
    path = ROOT / "content" / "image-dimensions.json"
    if not path.is_file():
        return {}
    return json.loads(path.read_text(encoding="utf-8"))


def bounded_size(dimensions: dict[str, list[int]], image_url: str, long_edge: int):
    """Pixel size a derivative will have once its long edge is capped.

    Emitted as the lightbox img's width/height attributes so the browser knows
    the ratio before the bytes arrive and reserves the right box. Returns
    (0, 0) when dimensions are unavailable, and the page then omits the
    attributes rather than asserting a wrong shape.
    """
    size = dimensions.get(image_url.lstrip("./").lstrip("/"))
    if not size or len(size) != 2 or not all(size):
        return 0, 0
    width, height = size
    if max(width, height) <= long_edge:
        return width, height
    scale = long_edge / max(width, height)
    return max(1, round(width * scale)), max(1, round(height * scale))

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


def parse_scalar(value: str):
    value = value.strip()
    if not value:
        return ""
    if value.startswith("[") and value.endswith("]"):
        return ast.literal_eval(value)
    if value[0:1] in {"'", '"'} and value[-1:] == value[0]:
        return ast.literal_eval(value)
    return value


def parse_frontmatter(source: str) -> tuple[dict, str]:
    if not source.startswith("---\n"):
        raise ValueError("Markdown file is missing YAML frontmatter")
    frontmatter, body = source[4:].split("\n---\n", 1)
    data: dict[str, object] = {}
    active_list: str | None = None
    for line in frontmatter.splitlines():
        item = re.match(r"^\s+-\s+(.+?)\s*$", line)
        if item and active_list:
            data.setdefault(active_list, []).append(parse_scalar(item.group(1)))
            continue
        field = re.match(r"^([A-Za-z0-9_]+):\s*(.*?)\s*$", line)
        if not field:
            continue
        key, raw = field.groups()
        if raw:
            data[key] = parse_scalar(raw)
            active_list = None
        else:
            data[key] = []
            active_list = key
    return data, body


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


def reference_heading(line: str) -> str | None:
    cleaned = re.sub(r"^[#*_\s]+|[#*_\s]+$", "", line).strip().rstrip(":：").strip()
    if cleaned.lower() in REFERENCE_HEADINGS:
        return cleaned
    return None


def split_reference_appendix(markdown: str) -> tuple[str, list[tuple[str, str]], str, list[str]]:
    """Separate the imported numeric reference list from the essay body."""
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
        heading = reference_heading(lines[cursor]) if cursor >= 0 else None
        if heading:
            heading_index = cursor

        appendix_start = heading_index if heading_index is not None else entry_start
        cursor = appendix_start - 1
        while cursor >= 0 and not lines[cursor].strip():
            cursor -= 1
        if cursor >= 0 and re.match(r"^\s*(?:---+|\*\*\*+)\s*$", lines[cursor]):
            appendix_start = cursor

        body = "\n".join(lines[:appendix_start]).strip()
        title = heading or ("参考资料" if re.search(r"[\u3400-\u9fff]", body) else "References")
        postscript = lines[index:]
        return body, references, title, postscript

    return markdown.strip(), [], "", []


def reference_excerpt(markdown: str, *, limit: int = 132) -> str:
    text = re.sub(r"\[([^\]]+)\]\(\S+\)", r"\1", markdown)
    text = re.sub(r"[*_`#]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text if len(text) <= limit else text[: limit - 1].rstrip() + "…"


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
                        excerpt = html.escape(reference_excerpt(references[key]))
                        margin_notes.append(
                            f'<span class="mn reference-note" aria-hidden="true">'
                            f'<span class="num">{key}</span><span>{excerpt}</span></span>'
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
                note = inline_markdown(footnotes[key])
                out.append(f'<sup class="fnref"><a href="#fn-{slug}" aria-label="Footnote {number}">{number}</a></sup>')
                if first_reference:
                    out.append(f'<span class="mn" aria-hidden="true"><span class="num">{number}</span>{note}</span>')
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


def markdown_to_html(markdown: str) -> str:
    """Render the supported Markdown subset without folding source newlines."""
    markdown, reference_items, appendix_title, appendix_postscript = split_reference_appendix(markdown)
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
    return "\n".join(blocks)


def plain_excerpt(markdown: str, *, chinese: bool) -> str:
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", markdown)
    text = re.sub(r"[#*_`>]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    if chinese:
        return text if len(text) <= 76 else text[:76].rstrip() + "…"
    words = text.split()
    return text if len(words) <= 32 else " ".join(words[:32]) + "…"


def slugify(title: str) -> str:
    slug = re.sub(r"[^a-z0-9-]", "", re.sub(r"\s+", "-", title.lower()))
    return re.sub(r"-+", "-", slug).strip("-")


def load_posts() -> list[dict]:
    posts: list[dict] = []
    for path in sorted(POSTS_DIR.glob("*.md")):
        data, body = parse_frontmatter(path.read_text(encoding="utf-8"))
        english, separator, chinese = body.partition("---zh---")
        if not separator:
            chinese = ""
        date = str(data["date"])
        title = str(data["title"])
        title_zh = str(data.get("title_zh") or title)
        cover = str(data["coverImage"]).lstrip("/")
        tags = list(data.get("tags") or [])
        tags_zh = list(data.get("tags_zh") or [])
        english_words = len(re.findall(r"\S+", english))
        post_id = f"{date}_{slugify(title)}"
        posts.append(
            {
                "id": post_id,
                "date": date,
                "title": title,
                "titleZh": title_zh,
                "subtitle": str(data.get("subtitle") or ""),
                "subtitleZh": str(data.get("subtitle_zh") or ""),
                "excerpt": str(data.get("excerpt") or "") or plain_excerpt(english, chinese=False),
                "excerptZh": str(data.get("excerpt_zh") or "") or plain_excerpt(chinese, chinese=True),
                "cover": derivative_url(cover, "covers", COVER_DEFAULT_WIDTH),
                "coverSrcset": srcset(cover, "covers", COVER_WIDTHS),
                "tags": tags,
                "tagsZh": tags_zh,
                "readingMin": max(1, (english_words + 199) // 200),
                "htmlEn": markdown_to_html(english),
                "htmlZh": markdown_to_html(chinese),
                "source": "./content/posts/" + path.name,
            }
        )
    posts.sort(key=lambda post: post["date"], reverse=True)
    return posts


def load_photos() -> list[dict]:
    source = PHOTOS_SOURCE.read_text(encoding="utf-8")
    dimensions = load_dimensions()
    photos: list[dict] = []
    for block in re.findall(r"\{(.*?)\}", source, flags=re.S):
        def field(name: str) -> str | None:
            match = re.search(rf"\b{name}:\s*'([^']*)'", block)
            return match.group(1) if match else None

        photo_id = field("id")
        image_url = field("imageUrl")
        if not photo_id or not image_url:
            continue
        display_w, display_h = bounded_size(dimensions, image_url, GALLERY_DISPLAY_WIDTH)
        photos.append(
            {
                "id": int(photo_id),
                "loc": field("location") or "",
                # src/srcset are the pre-cropped 4:3 thumbnails; display is the
                # lightbox copy. The original is never referenced by a page.
                "src": derivative_url(image_url, "gallery", GALLERY_THUMB_WIDTHS[0]),
                "srcset": srcset(image_url, "gallery", GALLERY_THUMB_WIDTHS),
                "display": derivative_url(image_url, "gallery", GALLERY_DISPLAY_WIDTH),
                # Lets the lightbox reserve its frame before the image arrives.
                "dw": display_w,
                "dh": display_h,
                "cat": field("category") or "uncategorized",
                "date": field("date") or "",
            }
        )
    return photos


def write_js(path: Path, global_name: str, data) -> None:
    payload = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    path.write_text(
        "// Generated by scripts/generate-content.py; edit the canonical content sources instead.\n"
        f"window.{global_name}={payload};\n",
        encoding="utf-8",
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.parse_args()
    posts = load_posts()
    photos = load_photos()
    write_js(ROOT / "content" / "posts.js", "FY_POSTS", posts)
    write_js(ROOT / "content" / "photos.js", "FY_PHOTOS", photos)
    print(f"Generated {len(posts)} posts and {len(photos)} photos")


if __name__ == "__main__":
    main()
