# Fred Agent Media Preparation Checklist

Status: preparation guide; use after Fred approves the demo narratives
Purpose: collect evidence that supports the content without allowing media availability to dictate the story

## 1. Prepare one media packet per demo

Suggested future folder shape:

```text
media-inbox/
├── omni-presence/
├── trash-patrol/
├── discord-intake/
├── unattended-recovery/
└── coauthored-publishing/
```

Each packet should contain:

- `README.md` — what the run shows, when it happened, and whether it is historical, recreated, or synthetic
- `hero-still.*` — the single clearest image
- `short-clip.*` — 10–20 second outcome-first excerpt
- `walkthrough.*` — optional 45–90 second explanation
- `transcript.md` — captions and speaker labels
- `evidence/` — sanitized receipts, screenshots, or logs
- `redaction-notes.md` — what was removed, blurred, recreated, or withheld

Do not add raw secrets or private source media to the public website repository. Keep originals in a private working location and copy only sanitized exports here after review.

## 2. Capture order

For every demo, capture in this order:

1. Final human-visible result
2. One or two key handoffs
3. Simplified system recipe
4. Supporting technical evidence
5. Limitation or failure boundary

If the final result is unclear, more terminal footage will not rescue the demo.

## 3. Video guidance

- Prefer one continuous scenario over a montage of unrelated commands.
- Record clean source footage before adding narration, zooms, or captions.
- Keep the cursor movement deliberate and remove long waits.
- Use captions for every spoken segment.
- When live call audio matters, let it play alone for a short excerpt.
- Use voiceover before or after the live audio, not over it.
- Show only enough terminal or log output to verify a claim.
- Preserve a version with no music for accessibility and future editing.
- Export a poster frame for visitors who do not play the video.

Suggested deliverables:

- 16:9 master for the website and long-form sharing
- 15–30 second cutdown for the Fred Agent landing
- Optional vertical crop only when the interaction is genuinely phone-native

## 4. Screenshot guidance

- Capture at a high-density desktop or device scale.
- Prefer one readable state over a collage of tiny states.
- Hide browser bookmarks, unrelated tabs, notification previews, and account avatars when they reveal private context.
- Use real interface text only after it has been checked for names, addresses, phone numbers, tokens, signed URLs, and private message content.
- Preserve an unannotated original and a separately annotated export.
- Do not blur the entire screen until the evidence becomes meaningless; recreate a clean scenario when redaction would destroy the point.

## 5. Audio and consent

- Do not publish a third party’s voice without permission.
- For historical calls, prefer a transcript, reenactment, or a new consent-safe demonstration.
- Clearly label recreated audio or synthetic test scenarios.
- Remove phone numbers, voicemail greetings, business identifiers, and background speech unless intentionally public.
- Retain speaker labels in captions.

## 6. Home and personal privacy

Before using camera or home media, remove or avoid:

- street numbers and distinctive address markers
- neighbors, license plates, faces, and private interiors
- camera account names, URLs, device identifiers, and timestamps that reveal routine
- precise collection schedules when combined with location

The Trash Patrol demo needs only enough scene context to understand the bounded judgment.

## 7. Notion, Discord, email, and message privacy

- Create a public-safe test record when a real workspace screenshot exposes unrelated projects.
- Hide workspace names, account avatars, member lists, private channels, and sidebar content.
- Use one test Discord channel prepared for capture.
- Remove message IDs, email addresses, phone numbers, thread subjects, and signed attachment links unless intentionally public.
- Do not expose a Notion access token, data-source ID, or private page URL merely to prove the write happened.

## 8. Evidence labels

Every published demo should carry one of these labels:

- **real run** — historical execution shown with sanitized evidence
- **recreated run** — the same workflow performed again for public recording
- **synthetic demonstration** — a safe scenario designed to show the contract
- **concept preview** — intended behavior that has not yet been verified end to end

Do not let a concept preview inherit the language of a real run.

## 9. Minimum viable first release

The first Demos page does not need all five scenarios. A credible initial set is:

- Omni-Presence: one edited walkthrough and final Notion artifact
- Trash Patrol: one sanitized frame, scheduled-fire evidence, and final verdict
- Discord Intake: one public-safe phone capture and durable result
- Unattended Recovery: one synthetic failure with initial and final status

This set demonstrates cross-channel continuity, physical-world interaction, asynchronous intake, durable state, and failure recovery.

## 10. Review gate

Before any media enters production:

- Fred confirms the selected demo and its narrative.
- The artifact is labeled real, recreated, synthetic, or concept.
- Private information is removed at the source when possible.
- The final result remains understandable without terminal narration.
- Captions and poster images exist.
- The media supports a claim already approved in the content draft.
