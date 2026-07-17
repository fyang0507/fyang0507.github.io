# Photo imports

## Canonical files

- Store gallery media under `images/gallery/`.
- Add metadata only to the `photos` array in `content/photos-source.ts`.
- Treat that array as an append-only ledger. Append backfills too; the Gallery page shuffles display order and uses metadata for filters, so reordering old entries has no user benefit.
- Use a descriptive `YYYY-MM-subject-or-place.ext` filename. Add a short numeric suffix when names would collide.
- Prefer browser-native JPEG, PNG, or WebP. Preserve image quality and metadata unless conversion is needed for browser compatibility.

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

1. Confirm every new image request returns HTTP 200 with exact path casing.
2. Open `Gallery.dc.html` and filter by the new year and category.
3. Because the gallery shuffles, use filters rather than assuming a fixed position.
4. Open every new photo in the lightbox. Confirm image, location, capture date, and category.
5. Check desktop and mobile widths and ensure the console remains clean.
