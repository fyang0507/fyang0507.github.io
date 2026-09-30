#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = ["fonttools>=4.50", "brotli>=1.1"]
# ///
"""Subset every CJK face this site uses to the glyphs it actually renders.

Two groups, for two different reasons.

**Local display faces** (`fonts/*.woff2`, committed masters). Complete
typefaces of ~6,900 glyphs each, 2,596 KB together, to render a few hundred
characters. Shipping them made the font the slowest thing on the site: the
gallery's LCP element is its `<h1 class="display">`, and because
`font-display: swap` repaints that heading when the real face arrives, the
985 KB download *became* the LCP at ~2.9 s on Fast 4G. Subsetting moves it to
~0.83 s.

**Noto Serif SC / Noto Sans SC** (masters fetched and cached, see NOTO_SOURCES).
Previously loaded from Google Fonts, whose `unicode-range` delivery is superb
for sparse CJK and poor for a full essay: one Chinese article's 1,188 unique
characters scatter across 61 of Google's 101 buckets, so a cold reader pulled
73 files / 4,592 KB and the body text did not settle until ~6.1 s. It never
touched LCP - the hero image is larger - so this is a data and
time-to-final-render fix, not an LCP fix.

Serif is tiered because the two audiences differ by 8x: a gateway page renders
~230 CJK characters of interface text, an essay renders ~2,900. Splitting means
gateway pages get 147 KB instead of the full 1,085 KB, and stays a static
`@font-face` the preload scanner can see. The text tier covers every essay,
although Reading loads one body file at a time: a per-essay subset would have
to be injected by JS once the essay is known, which costs more than it saves
and gives up the shared cache across essays.

Pages load only `fonts/derived/`. Like `images/derived/`, that directory is a
generated artifact - commit it. `.github/workflows/deploy-pages.yml` deletes
`scripts/` before deploying, so it cannot be built in CI.

The glyph set is read out of the rendered post HTML: it renders the essays
through generate-content.py's own pipeline, landmarks and all, so it matches
the body files exactly. Run it after generate-content.py:

    uv run scripts/generate-fonts.py

`uv` resolves fonttools into a throwaway environment, so the repository keeps
its no-package-manager posture. If fonttools happens to be importable already,
plain `python3 scripts/generate-fonts.py` works too.
"""

from __future__ import annotations

import argparse
import hashlib
import html as html_mod
import importlib.util
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FONTS_DIR = ROOT / "fonts"
DERIVED_DIR = FONTS_DIR / "derived"
CACHE_DIR = FONTS_DIR / "upstream-cache"
MANIFEST = ROOT / "content" / "font-subsets.json"

# Noto masters are 41 MB of variable TTF that is never served, and unlike Fred's
# photographs they are permanently and publicly available under the OFL. So they
# are fetched into a gitignored cache rather than vendored. The digest of what
# was used is recorded in the manifest so a regeneration is traceable.
NOTO_SOURCES = {
    "NotoSerifSC": "https://github.com/google/fonts/raw/main/ofl/notoserifsc/NotoSerifSC%5Bwght%5D.ttf",
    "NotoSansSC": "https://github.com/google/fonts/raw/main/ofl/notosanssc/NotoSansSC%5Bwght%5D.ttf",
}

# Pages, and the scripts and stylesheets that write their interface text, whose
# entire text is folded into every subset. They are small and almost all ASCII,
# so taking all of them costs a handful of glyphs and removes any need to
# resolve CSS selectors against static markup. Globs, relative to the root:
# page code and the shared modules in lib/ render strings of their own (the
# opener's 点按跳过, Gallery's hand notes), so they count as pages.
PAGES = [
    "index.html", "Gallery.dc.html", "Writing.dc.html", "Reading.dc.html",
    "About.dc.html", "Building.dc.html", "404.html",
    "lib/**/*.js", "lib/**/*.css", "assets/fred-agent/fred-agent.css",
]

# Which post-derived text reaches which face, by the selector that sets it in
# lib/reading/reading.css or rail.css (the other pages render no essay text):
#   DingTalk JinBuTi  <- .title (post titles), .lm-t and .lm-head (the essay's
#                        landmark headings, scripts/landmarks.py)
#   MuyaoPleased      <- .eyebrow (subtitles), .fig figcaption (image captions)
#   Noto Sans SC      <- .lm-no and the rail's labels (landmark labels), h4,
#                        .appendix-title, .appendix-postscript
#   Noto Serif SC     <- the whole body, text tier only (margin notes included)
# Captions put arbitrary essay prose in the hand face - which is exactly why
# this has to be generated rather than hand-maintained. `html_elements` takes
# `tag` or `tag.class`; the generator never nests those elements.
FACES = {
    "DingTalkJinBuTi.woff2": {
        "family": "DingTalk JinBuTi",
        "master": "local",
        "post_fields": ["title", "titleZh"],
        "html_elements": ["span.lm-t", "h2.lm-head"],
    },
    "MuyaoSuixin.woff2": {
        "family": "MuyaoPleased",
        "master": "local",
        "post_fields": ["subtitle", "subtitleZh"],
        "html_elements": ["figcaption"],
    },
    # Body face. The UI tier covers interface Chinese on every page; the text
    # tier adds full essay bodies and is loaded only by Reading.dc.html.
    "NotoSerifSC-ui.woff2": {
        "family": "Noto Serif SC",
        "master": "NotoSerifSC",
        "post_fields": [],
        "html_elements": [],
    },
    "NotoSerifSC-text.woff2": {
        "family": "Noto Serif SC",
        "master": "NotoSerifSC",
        "whole_post_body": True,
        "post_fields": ["title", "titleZh", "subtitle", "subtitleZh", "excerpt", "excerptZh"],
        "html_elements": [],
    },
    # Utility face: dates, kickers, meta lines, landmark labels, Chinese h4
    # and the reference appendix's title and postscript. Never bodies.
    "NotoSansSC-ui.woff2": {
        "family": "Noto Sans SC",
        "master": "NotoSansSC",
        "post_fields": [],
        "landmark_labels": True,
        "html_elements": ["h4", "h2.appendix-title", "p.appendix-postscript"],
    },
}

TAG_RE = re.compile(r"<[^>]+>")


def strip_tags(fragment: str) -> str:
    return html_mod.unescape(TAG_RE.sub(" ", fragment))


def element_text(html: str, selector: str) -> str:
    """Text of every `tag` or `tag.class` element."""
    tag, _, cls = selector.partition(".")
    attrs = rf'[^>]*\bclass="(?:[^"]*\s)?{cls}(?:\s[^"]*)?"[^>]*' if cls else r"[^>]*"
    return " ".join(strip_tags(m) for m in re.findall(rf"<{tag}\b{attrs}>(.*?)</{tag}>", html, flags=re.S))


def load_posts() -> list[dict]:
    """Every essay as generate-content.py renders it (standard library only, so no extra dependency)."""
    path = ROOT / "scripts" / "generate-content.py"
    spec = importlib.util.spec_from_file_location("fred_website_generate_content", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.load_posts()


def base_text() -> str:
    """Static page and stylesheet text, plus every ASCII printable."""
    parts = ["".join(chr(c) for c in range(0x20, 0x7F))]
    for p in sorted({p for pattern in PAGES for p in ROOT.glob(pattern) if p.is_file()}):
        # Deliberately unfiltered: .dc.html keeps rendered UI strings inside
        # its inline component script, so stripping <script> would drop them.
        parts.append(p.read_text(encoding="utf-8"))
    for name in ("photos.js", "building-projects.js", "home.js"):
        p = ROOT / "content" / name
        if p.is_file():
            parts.append(p.read_text(encoding="utf-8"))
    return "".join(parts)


def face_text(spec: dict, posts: list[dict]) -> str:
    parts = []
    for post in posts:
        for field in spec["post_fields"]:
            if post.get(field):
                parts.append(str(post[field]))
        if spec.get("landmark_labels"):
            for key in ("landmarksEn", "landmarksZh"):
                parts.extend(m["label"] for m in (post.get(key) or {}).get("marks", []))
        for key in ("htmlEn", "htmlZh"):
            html = post.get(key) or ""
            if not html:
                continue
            if spec.get("whole_post_body"):
                # The body face renders the whole article, so take all of it.
                parts.append(strip_tags(html))
                continue
            for selector in spec["html_elements"]:
                parts.append(element_text(html, selector))
    return "".join(parts)


def digest(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def resolve_master(spec: dict) -> Path:
    """Return the master for a face, fetching and caching Noto if needed."""
    if spec["master"] == "local":
        return FONTS_DIR / spec["_name"]

    name = spec["master"]
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    cached = CACHE_DIR / f"{name}.ttf"
    if not cached.is_file():
        print(f"fetching upstream master {name} ...")
        staging = cached.with_suffix(".partial")
        try:
            subprocess.run(["curl", "-sSL", NOTO_SOURCES[name], "-o", str(staging)], check=True)
            staging.replace(cached)
        finally:
            staging.unlink(missing_ok=True)
    return cached


def charset_for(spec: dict, posts: list[dict], shared: str) -> set[str]:
    text = shared + face_text(spec, posts)
    return {c for c in text if c.isprintable() and not c.isspace()}


def fingerprint(chars: set[str]) -> str:
    joined = "".join(sorted(chars))
    return hashlib.sha256(joined.encode("utf-8")).hexdigest()[:16]


def subset(master: Path, target: Path, chars: set[str]) -> None:
    from fontTools import subset as ft_subset

    unicodes = [f"U+{ord(c):04X}" for c in sorted(chars)]
    target.parent.mkdir(parents=True, exist_ok=True)
    staging = target.with_name(target.name + ".partial")
    try:
        ft_subset.main([
            str(master),
            f"--unicodes={','.join(unicodes)}",
            "--flavor=woff2",
            "--layout-features=*",
            "--no-hinting",
            "--desubroutinize",
            # Keep copyright/licence/designer records; OFL requires the notice to
            # travel with the font and the designer credit is the right thing to
            # preserve regardless.
            "--name-IDs=0,1,2,3,4,5,6,7,9,10,11,13,14",
            "--drop-tables+=DSIG",
            f"--output-file={staging}",
        ])
        staging.replace(target)
    finally:
        staging.unlink(missing_ok=True)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--force", action="store_true", help="re-subset even if current")
    parser.add_argument("--report", action="store_true", help="show sizes and exit")
    args = parser.parse_args()

    try:
        import fontTools  # noqa: F401
    except ImportError:
        print(
            "error: fonttools is required.\n"
            "  run:  uv run scripts/generate-fonts.py\n"
            "  or:   pip install fonttools brotli",
            file=sys.stderr,
        )
        return 1

    posts = load_posts()
    shared = base_text()

    previous = {}
    if MANIFEST.is_file():
        previous = json.loads(MANIFEST.read_text(encoding="utf-8")).get("faces", {})

    entries = {}
    upstream = {}
    rebuilt = 0
    for name, spec in FACES.items():
        spec = {**spec, "_name": name}
        master = resolve_master(spec)
        if not master.is_file():
            print(f"error: missing master {master}", file=sys.stderr)
            return 1
        if spec["master"] != "local":
            upstream[spec["master"]] = digest(master)
        chars = charset_for(spec, posts, shared)
        fp = fingerprint(chars)
        target = DERIVED_DIR / name
        cjk = sum(1 for c in chars if ord(c) > 0x2E80)

        if args.report:
            size = target.stat().st_size / 1024 if target.is_file() else 0
            print(f"{name:<26} {len(chars):>5} chars ({cjk:>4} CJK)  "
                  f"master {master.stat().st_size/1048576:>5.1f} MB  subset {size:>7.1f} KB")
            continue

        stale = (
            args.force
            or not target.is_file()
            or previous.get(name, {}).get("fingerprint") != fp
            or target.stat().st_mtime < master.stat().st_mtime
        )
        if stale:
            subset(master, target, chars)
            rebuilt += 1

        entries[name] = {
            "family": spec["family"],
            "url": f"./fonts/derived/{name}",
            "chars": len(chars),
            "cjk": cjk,
            "fingerprint": fp,
            "masterBytes": master.stat().st_size,
            "subsetBytes": target.stat().st_size,
            # The full set, so audit_content.py can verify coverage without
            # needing fonttools installed.
            "charset": "".join(sorted(chars)),
        }

    if args.report:
        return 0

    MANIFEST.write_text(
        json.dumps(
            {
                "note": "Generated by scripts/generate-fonts.py; do not hand-edit.",
                "faces": entries,
                "upstreamMasters": upstream,
            },
            ensure_ascii=False,
            indent=1,
            sort_keys=True,
        )
        + "\n",
        encoding="utf-8",
    )

    # Remove derived files with no corresponding master.
    if DERIVED_DIR.is_dir():
        for stray in sorted(DERIVED_DIR.glob("*.woff2")):
            if stray.name not in FACES:
                stray.unlink()
                print(f"pruned orphan {stray.relative_to(ROOT)}")

    total_master = sum(e["masterBytes"] for e in entries.values())
    total_subset = sum(e["subsetBytes"] for e in entries.values())
    print(f"{'rebuilt' if rebuilt else 'already current:'} {rebuilt or len(entries)} face(s)")
    for name, e in sorted(entries.items()):
        print(f"  {e['family']:<18} {e['chars']:>5} chars ({e['cjk']:>4} CJK)  "
              f"{e['masterBytes']/1024:>6.0f} KB -> {e['subsetBytes']/1024:>6.1f} KB")
    print(f"  {'TOTAL':<18} {'':>18}  {total_master/1024:>6.0f} KB -> "
          f"{total_subset/1024:>6.1f} KB "
          f"({total_master/total_subset:.1f}x smaller)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
