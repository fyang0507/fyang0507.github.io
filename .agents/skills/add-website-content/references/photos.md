# Photo imports

## Canonical files

- Store gallery media under `images/gallery/`.
- Add metadata only to the `photos` array in `content/photos-source.ts`.
- Treat that array as an append-only ledger. Append backfills too; the Gallery page shuffles display order and uses metadata for filters, so reordering old entries has no user benefit.
- Use a descriptive `YYYY-MM-subject-or-place.ext` filename. Add a short numeric suffix when names would collide.
- Prefer browser-native JPEG, PNG, or WebP. Preserve image quality and metadata unless conversion is needed for browser compatibility.
- Add the full-resolution original. Do not resize it, and do not add a web-sized copy by hand.

## Derived images

`Gallery.dc.html` never loads a file from `images/gallery/`. It loads generated copies from `images/derived/gallery/`, produced by `scripts/generate-derivatives.py`:

| Derivative | Size | Used by |
| --- | --- | --- |
| `<stem>-200.jpg`, `-400.jpg`, `-800.jpg` | pre-cropped 4:3 thumbnails | the rack and garland `srcset` |
| `<stem>-2560.jpg` | long edge capped at 2560px | the lightbox |

Consequences worth knowing before you touch this:

- **The originals were the whole performance problem.** Serving them as thumbnails cost 51 MB for 18 frames rendered at 132×99, and the page took 54 s to finish loading on Fast 4G. Do not point any page back at `images/gallery/`.
- Thumbnails are pre-cropped to 4:3 because the gallery CSS already center-crops to that box. The crop is deterministic, so it is not a content decision you need to review.
- Derivative filenames come from the original's stem, so `foo.JPG` and `foo.jpg` would collide. Both the generator and the audit fail loudly if that happens; rename one original.
- A source PNG with an alpha channel is rejected rather than silently flattened to black. Flatten the original first.
- `content/image-dimensions.json` records each original's pixel size. `content/photos.js` turns it into the lightbox's `width`/`height` attributes, which is what keeps the caption from jumping ~350px when the full image arrives. Regenerate it whenever you add media.

To rebuild everything from scratch, or after changing a size ladder in `scripts/generate-content.py`:

```sh
python3 scripts/generate-derivatives.py --force --prune
python3 scripts/generate-content.py
```

## Stable IDs

Allocate each new photo ID as `max(existing numeric IDs) + 1`, then increment through a batch. Do not use the record count, fill historical gaps, reuse deleted IDs, or renumber existing entries. Gallery rotation and offset geometry depend on the numeric ID.

For a batch, sort the incoming set by capture date and then filename before assigning IDs. This produces repeatable diffs even when files arrive in an arbitrary order.

## Metadata shape

Append entries before the closing `];`:

```ts
  {
    id: '109',
    location: 'New York, NY',
    imageUrl: '/images/gallery/2026-07-example.jpg',
    category: 'street',
    date: '2026-07-16',
  },
```

Use the actual capture date, not the import date. Keep `location` concise and truthful. The simple generator parser expects single-quoted scalar values; do not put an ASCII apostrophe inside a value. Use a typographic apostrophe (`’`) when the spelling requires one.

Prefer an existing lowercase category:

- `abstract`
- `architecture`
- `black and white`
- `cityscape`
- `creature`
- `landscape`
- `people`
- `street`

If a genuinely new category is needed, use a durable singular noun and update `CAT_LABEL` in `Gallery.dc.html` so its display label is deliberate. Do not create near-duplicates such as `city`, `cityscapes`, or `urban` when `cityscape` is accurate.

## Photo verification

After generation and the archive audit:

0. Confirm the new derivatives exist and are committed. The audit fails with `missing derivative ...` if `generate-derivatives.py` has not run.
1. Confirm every new image request returns HTTP 200 with exact path casing. Requests should be for `images/derived/gallery/...`; a request for `images/gallery/...` means a page regressed to the original.
2. Open `Gallery.dc.html` and filter by the new year and category.
3. Because the gallery shuffles, use filters rather than assuming a fixed position.
4. Open every new photo in the lightbox. Confirm image, location, capture date, and category.
5. Check desktop and mobile widths and ensure the console remains clean.
