# Article imports

## Canonical files

- Store each article at `content/posts/YYYY-MM-DD_<stable-readable-label>.md`.
- Store its cover at `images/blog/covers/YYYY-MM-DD_<stable-readable-label>.<ext>`.
- Use the publication date in the Markdown filename. The generator derives the public post ID from frontmatter, not the filename, but matching dates keep the archive auditable.
- Use JPEG, PNG, or WebP cover art and preserve the exact filename case referenced by `coverImage`.

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
- `commentary` / `杂文`
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

## Manifest caching

Load the manifests unversioned (`./content/posts.js`), the way `Gallery.dc.html`
and `Building.dc.html` already do. Do not reintroduce a `?v=<stamp>`
cache-buster: GitHub Pages serves every file, including the HTML that would
carry the stamp, with `cache-control: max-age=600` and an ETag, so a regenerated
manifest reaches returning visitors within ten minutes on its own. A manual
stamp buys nothing there, silently does nothing when someone forgets to bump it,
and can serve a stale manifest to a browser still holding the previous HTML.

A local `python3 -m http.server` sends no cache headers at all, so browsers fall
back to heuristic caching and may hold an old manifest while verifying. Hard
reload or disable the cache when a change does not appear; do not "fix" it by
versioning the URL.

## Article verification

After generation and the archive audit:

1. Confirm the new cover and article requests return HTTP 200.
2. Find the card in `Writing.dc.html` and exercise its year and primary-tag filters.
3. Open the direct Reading URL, verify both language bodies, cover, title, date, tags, previous/next links, and metadata.
4. Check desktop and mobile widths and ensure the console remains clean.
