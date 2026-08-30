# Article imports

## Canonical files

- Store each article at `content/posts/YYYY-MM-DD_<stable-readable-label>.md`.
- Store its cover at `images/blog/covers/YYYY-MM-DD_<stable-readable-label>.<ext>`.
- Use the publication date in the Markdown filename. The generator derives the public post ID from frontmatter, not the filename, but matching dates keep the archive auditable.
- Use JPEG, PNG, or WebP cover art and preserve the exact filename case referenced by `coverImage`.
- Store the full-resolution cover; do not resize it. `Writing.dc.html` and `Reading.dc.html` load generated copies from `images/derived/covers/` (320/560/900/1600px wide), not the original, so `python3 scripts/generate-derivatives.py` must run before `generate-content.py`. A cover with an alpha channel is rejected rather than flattened to black — flatten it first. See [photos.md](photos.md#derived-images) for the full contract.

## Chinese text and the font subsets

Pages load subset fonts from `fonts/derived/`, not the complete masters in `fonts/`. An article can introduce Chinese characters into three places that render in those subset faces, and each one changes the required glyph set:

| Article element | Rendered in | Source |
| --- | --- | --- |
| `title_zh`, `## `/`### ` headings | DingTalk JinBuTi | `Reading.dc.html:63,78` |
| `subtitle_zh`, `excerpt_zh`, `[^note]:` footnotes, reference entries, image captions | MuyaoPleased | `Reading.dc.html:61,96,101` |

The article **body** matters too: Noto Serif SC is self-hosted, not fetched from Google, so a new essay's Chinese prose has to be in `NotoSerifSC-text.woff2`. That face is the reason `Reading.dc.html` references a different Noto file from every other page — `-text` carries whole essay bodies (~1,087 KB), `-ui` carries interface Chinese only (~148 KB).

So after adding or editing any Chinese article, run `uv run scripts/generate-fonts.py` and commit `fonts/derived/` and `content/font-subsets.json`. Note that footnote and reference text is real prose, which is why the handwriting face needs ~1,000 glyphs rather than a handful.

If you skip it, the audit fails with `... subset is stale: N character(s) now render in it but are not in the subset` and names them. Left unfixed, those characters silently fall back to a system font in production.

## Frontmatter and body

Use this shape:

```markdown
---
title: 'English Title'
subtitle: 'Optional English Subtitle'
title_zh: '中文标题'
subtitle_zh: '可选中文副标题'
excerpt: ''
excerpt_zh: ''
coverImage: '/images/blog/covers/YYYY-MM-DD_readable-name.jpg'
date: 'YYYY-MM-DD'
tags:
  - 'travel log'
  - 'usa'
tags_zh:
  - '游记'
  - '美国'
languages: ['en', 'zh']
---

English body.

---zh---

中文正文。
```

Require `title`, `title_zh`, `coverImage`, `date`, `tags`, `tags_zh`, and `languages`. Add `subtitle` and `subtitle_zh` together when the article has a subtitle. Leave excerpts empty to use deterministic generated excerpts; supply them only when editorially intentional.

The archive is currently bilingual. Obtain both language versions before publishing unless the user explicitly chooses a single-language exception. Do not silently translate missing material. Keep `tags` and `tags_zh` aligned by position and use one recognized primary pair when applicable:

- `stories we live` / `我们生活的故事`
- `everyday chronicles` / `日常记趣`
- `travel log` / `游记`
- `poem` / `诗`

Additional topical or geographic tags are allowed. Primary tags drive the Writing page's filter chips.

## Stable article IDs

The generator builds the public ID as:

```text
<date>_<English title lowercased, spaces changed to hyphens, non-ASCII and punctuation removed>
```

For example, `Hawaii Has No Anger` on `2025-03-23` becomes `2025-03-23_hawaii-has-no-anger`. Before publishing, make sure the resulting ID is non-empty and does not collide with another post. Changing an existing `date` or English `title` changes its public URL.

## Supported Markdown

The dependency-free renderer supports:

- Headings, emphasis, strong text, inline code, fenced code, and horizontal dividers
- HTTP, HTTPS, and mailto links
- Standalone images with optional quoted captions
- Blockquotes and flat ordered or unordered lists
- Footnotes using `[^key]` references and definitions
- A final sequential numeric reference appendix such as `[1] Source`

Use `---zh---` exactly once to separate English from Chinese. Newlines are literal content: one source newline becomes one rendered line break, and repeated blank lines remain repeated breaks. Do not add Markdown trailing spaces as a separate hard-break convention.

Emphasis uses `*italic*` and `**bold**` only — the renderer does not support underscore emphasis (`_text_`), so never mix `_` and `*` around the same span (e.g. `_*text_`). A leading `_` renders as a literal underscore character, not italics.

## Two recurring hygiene bugs to check on every add or edit

1. **Translation note formatting.** Every bilingual article (`languages` includes both `en` and `zh`) must end its English body with a properly italicized translation note, exactly:

   ```markdown
   *Originally written in Chinese. This article is translated by GPT-5.6.*
   ```

   Do not write it as `_*Originally written in Chinese...._` — the leading `_*` and trailing `_` are a broken emphasis pairing that renders as literal `_*` characters instead of italics.

2. **No duplicated title as the first body line.** `Writing.dc.html`/`Reading.dc.html` render `title`/`title_zh` from frontmatter separately from the body. Never repeat the title as the first line of the English or Chinese body (as a `#` heading or as plain text) — it double-renders on the Reading page. Start the body directly with the first sentence.

`python3 .agents/skills/add-website-content/scripts/audit_content.py` checks both of these across the full archive; run it (not just for new entries) before finishing any article add or edit.

## Article verification

After generation and the archive audit:

1. Confirm the new cover and article requests return HTTP 200.
2. Find the card in `Writing.dc.html` and exercise its year and primary-tag filters.
3. Open the direct Reading URL, verify both language bodies, cover, title, date, tags, previous/next links, and metadata.
4. Check desktop and mobile widths and ensure the console remains clean.
