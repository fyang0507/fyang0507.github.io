---
name: add-website-content
description: Add durable article and photography content to fyang0507.github.io website static archive. Use when needs to import, publish, batch-add, migrate, or repair essays in content/posts, cover images, gallery images, or photo metadata; regenerate content/posts.js and content/photos.js; assign stable identifiers; or verify new content in Writing.dc.html, Reading.dc.html, and Gallery.dc.html.
---

# Add Website Content

Treat the checked-in article Markdown, photo metadata, and media files as an append-only archive. Make ordinary content additions through the canonical sources; do not edit page runtime code unless the requested content exposes a runtime limitation.

## Route the request

- For an article, read [references/articles.md](references/articles.md) completely before editing.
- For one or more photos, read [references/photos.md](references/photos.md) completely before editing.
- For a mixed import, read both references.
- If the request also asks for writing, polishing, or translation, use `$fred-article-style-guide`. Do not rewrite supplied prose merely to import it.

## Follow the workflow

1. Read the repository `AGENTS.md` and run `git status --short --branch`. Preserve unrelated and pre-existing changes.
2. Inspect the supplied source material and the current canonical archive. Establish dates, titles or locations, media paths, and identifiers before editing. Ask only for facts that cannot be safely inferred; never invent dates, locations, authorship, translations, or categories.
3. Add media under `images/blog/covers/` or `images/gallery/`, then edit only the matching canonical source:
   - Articles: `content/posts/*.md`
   - Photos: `content/photos-source.ts`
4. Preserve stable public identifiers. Never renumber photo IDs, reuse a retired ID, or casually change an existing article's date or English title; those fields feed gallery geometry or article URLs.
5. Regenerate both browser manifests from the repository root:

   ```sh
   python3 scripts/generate-content.py
   ```

6. Audit the complete archive, not only the new entries:

   ```sh
   python3 .agents/skills/add-website-content/scripts/audit_content.py
   git diff --check
   ```

7. Review `git diff` and `git status --short`. Confirm that canonical inputs, copied media, and the generated `content/posts.js` or `content/photos.js` are included. Do not hand-edit either generated manifest.
8. Serve the repository with `python3 -m http.server 4173 --bind 127.0.0.1` and verify in a real browser. Check for console errors and failed requests.
   - Article: inspect `Writing.dc.html`, open the direct `Reading.dc.html?post=<generated-id>` URL, switch CN/EN, and check desktop and mobile widths.
   - Photos: inspect `Gallery.dc.html`, filter by the new year and category, open each new lightbox image, and check desktop and mobile widths.
9. Report the added canonical records, stable URLs or IDs, generated counts, audit result, and browser verification. Mention any deliberate exception to the archive conventions.

## Keep additions scalable

- Add batches deterministically: resolve all names and IDs first, then make one coherent metadata edit.
- Prefer additive diffs. Do not reorder old records or rename old media during an unrelated import.
- Keep source filenames descriptive and collision-resistant. Check exact filename case because static hosting is case-sensitive.
- Keep the user's original media unless a web-incompatible format requires a clearly disclosed conversion.
- Treat `temp/` and other staging locations as inputs, not publish destinations.
- If generation changes the manifest for an untouched content type, inspect why before proceeding.
