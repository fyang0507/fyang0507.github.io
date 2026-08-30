#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = ["fonttools>=4.50", "brotli>=1.1"]
# ///
"""Subset the local CJK display fonts to the glyphs this site actually renders.

`fonts/*.woff2` are the untouched masters: complete typefaces of ~6,900 glyphs
each, 2,596 KB together. The site renders roughly 300 CJK characters in them.
Shipping the masters made the font, not the images, the slowest thing on the
site: the gallery's LCP element is its `<h1 class="display">`, and because
`font-display: swap` repaints that heading when the real face arrives, the
985 KB download *became* the LCP at ~2.9 s on Fast 4G. Subsetting moves it to
~0.83 s.

Pages load only `fonts/derived/`. Like `images/derived/`, that directory is a
generated artifact - commit it. `.github/workflows/deploy-pages.yml` deletes
`scripts/` before deploying, so it cannot be built in CI.

Run it after generate-content.py, because the glyph set is read out of the
*generated* post HTML rather than re-parsed from Markdown:

    uv run scripts/generate-fonts.py

`uv` resolves fonttools into a throwaway environment, so the repository keeps
its no-package-manager posture. If fonttools happens to be importable already,
plain `python3 scripts/generate-fonts.py` works too.
"""

from __future__ import annotations

import argparse
import hashlib
import html as html_mod
import json
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FONTS_DIR = ROOT / "fonts"
DERIVED_DIR = FONTS_DIR / "derived"
MANIFEST = ROOT / "content" / "font-subsets.json"

# Pages whose entire text is folded into every subset. They are small and almost
# all ASCII, so taking all of them costs a handful of glyphs and removes any need
# to resolve CSS selectors against static markup.
PAGES = [
    "index.html", "Gallery.dc.html", "Writing.dc.html", "Reading.dc.html",
    "About.dc.html", "Building.dc.html", "404.html", "UnderConstruction.dc.html",
    "site-nav.css", "fred-agent.css",
]

# Which post-derived text reaches which face. Verified against the CSS:
#   DingTalk JinBuTi  <- .display, .title, .post-body h2/h3   (Reading.dc.html:40,63,78)
#   MuyaoPleased      <- .hand, .eyebrow, .mn, .fig figcaption (Reading.dc.html:41,61,96,101)
# `.mn` is footnote and reference text and `figcaption` is image captions, so
# both faces receive arbitrary essay prose - which is exactly why this has to be
# generated rather than hand-maintained.
FACES = {
    "DingTalkJinBuTi.woff2": {
        "family": "DingTalk JinBuTi",
        "post_fields": ["title", "titleZh"],
        "html_elements": ["h2", "h3"],
        "html_classes": [],
    },
    "MuyaoSuixin.woff2": {
        "family": "MuyaoPleased",
        "post_fields": ["subtitle", "subtitleZh", "excerpt", "excerptZh"],
        "html_elements": ["figcaption"],
        "html_classes": ["mn"],
    },
}

TAG_RE = re.compile(r"<[^>]+>")


def strip_tags(fragment: str) -> str:
    return html_mod.unescape(TAG_RE.sub(" ", fragment))


def element_text(html: str, tag: str) -> str:
    return " ".join(
        strip_tags(m) for m in re.findall(rf"<{tag}\b[^>]*>(.*?)</{tag}>", html, flags=re.S)
    )


def class_text(html: str, cls: str) -> str:
    """Text inside <span class="mn ..."> ... </span>, nested tags included.

    The generated notes are flat single-level spans, so a non-greedy match to the
    next </span> would truncate at an inner <span class="num">. Walk instead.
    """
    out = []
    for m in re.finditer(rf'<span class="{cls}\b[^"]*"[^>]*>', html):
        start = m.end()
        depth = 1
        pos = start
        for tok in re.finditer(r"<(/?)span\b[^>]*>", html[start:]):
            depth += -1 if tok.group(1) else 1
            if depth == 0:
                pos = start + tok.start()
                break
        else:
            pos = len(html)
        out.append(strip_tags(html[start:pos]))
    return " ".join(out)


def load_manifest_js(path: Path, global_name: str):
    source = path.read_text(encoding="utf-8")
    marker = f"window.{global_name}="
    payload = source.split(marker, 1)[1].strip()
    return json.loads(payload.rstrip().rstrip(";"))


def base_text() -> str:
    """Static page and stylesheet text, plus every ASCII printable."""
    parts = ["".join(chr(c) for c in range(0x20, 0x7F))]
    for name in PAGES:
        p = ROOT / name
        if p.is_file():
            # Deliberately unfiltered: .dc.html keeps rendered UI strings inside
            # its inline component script, so stripping <script> would drop them.
            parts.append(p.read_text(encoding="utf-8"))
    for name in ("photos.js", "building-projects.js"):
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
        for key in ("htmlEn", "htmlZh"):
            html = post.get(key) or ""
            if not html:
                continue
            for tag in spec["html_elements"]:
                parts.append(element_text(html, tag))
            for cls in spec["html_classes"]:
                parts.append(class_text(html, cls))
    return "".join(parts)


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

    posts_js = ROOT / "content" / "posts.js"
    if not posts_js.is_file():
        print("error: content/posts.js missing; run generate-content.py first", file=sys.stderr)
        return 1
    posts = load_manifest_js(posts_js, "FY_POSTS")
    shared = base_text()

    previous = {}
    if MANIFEST.is_file():
        previous = json.loads(MANIFEST.read_text(encoding="utf-8")).get("faces", {})

    entries = {}
    rebuilt = 0
    for master_name, spec in FACES.items():
        master = FONTS_DIR / master_name
        if not master.is_file():
            print(f"error: missing master {master.relative_to(ROOT)}", file=sys.stderr)
            return 1
        chars = charset_for(spec, posts, shared)
        fp = fingerprint(chars)
        target = DERIVED_DIR / master_name
        cjk = sum(1 for c in chars if ord(c) > 0x2E80)

        if args.report:
            size = target.stat().st_size / 1024 if target.is_file() else 0
            print(f"{spec['family']:<18} {len(chars):>5} chars ({cjk:>4} CJK)  "
                  f"master {master.stat().st_size/1024:>6.0f} KB  subset {size:>6.1f} KB")
            continue

        stale = (
            args.force
            or not target.is_file()
            or previous.get(master_name, {}).get("fingerprint") != fp
            or target.stat().st_mtime < master.stat().st_mtime
        )
        if stale:
            subset(master, target, chars)
            rebuilt += 1

        entries[master_name] = {
            "family": spec["family"],
            "url": f"./fonts/derived/{master_name}",
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
