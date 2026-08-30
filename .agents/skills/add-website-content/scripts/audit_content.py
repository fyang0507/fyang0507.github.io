#!/usr/bin/env python3
"""Audit canonical and generated article/photo content for fyang0507.github.io website."""

from __future__ import annotations

import argparse
import importlib.util
import json
import re
import sys
from collections import Counter
from datetime import datetime
from pathlib import Path
from types import ModuleType


DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
POST_REQUIRED = {
    "title",
    "title_zh",
    "coverImage",
    "date",
    "tags",
    "tags_zh",
    "languages",
}
PHOTO_FIELDS = ("id", "location", "imageUrl", "category", "date")
MALFORMED_EMPHASIS_RE = re.compile(r"(?m)^_\*.+_\s*$")
TRANSLATION_NOTE_RE = re.compile(r"(?m)^\*Originally written in Chinese\..*\*\s*$")


def load_generator(root: Path) -> ModuleType:
    path = root / "scripts" / "generate-content.py"
    spec = importlib.util.spec_from_file_location("fred_website_generate_content", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load generator at {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def valid_date(value: str) -> bool:
    if not DATE_RE.fullmatch(value):
        return False
    try:
        return datetime.strptime(value, "%Y-%m-%d").strftime("%Y-%m-%d") == value
    except ValueError:
        return False


def exact_case_exists(root: Path, relative: str) -> bool:
    current = root
    for part in Path(relative).parts:
        if part in {"", "."}:
            continue
        try:
            names = {child.name for child in current.iterdir()}
        except (FileNotFoundError, NotADirectoryError, PermissionError):
            return False
        if part not in names:
            return False
        current /= part
    return current.is_file()


def load_manifest(path: Path, global_name: str):
    source = path.read_text(encoding="utf-8")
    marker = f"window.{global_name}="
    if marker not in source:
        raise ValueError(f"missing {marker}")
    payload = source.split(marker, 1)[1].strip()
    if not payload.endswith(";"):
        raise ValueError("manifest payload does not end with a semicolon")
    return json.loads(payload[:-1])


def audit_posts(root: Path, generator: ModuleType, errors: list[str]) -> tuple[list[dict], list[str]]:
    post_ids: list[str] = []
    post_paths = sorted((root / "content" / "posts").glob("*.md"))

    for path in post_paths:
        label = path.relative_to(root).as_posix()
        try:
            data, body = generator.parse_frontmatter(path.read_text(encoding="utf-8"))
        except Exception as exc:  # noqa: BLE001 - surface malformed archive input
            errors.append(f"{label}: invalid frontmatter: {exc}")
            continue

        missing = sorted(POST_REQUIRED - data.keys())
        if missing:
            errors.append(f"{label}: missing frontmatter fields: {', '.join(missing)}")

        date = str(data.get("date") or "")
        title = str(data.get("title") or "")
        if not valid_date(date):
            errors.append(f"{label}: invalid date {date!r}")
        if date and not path.name.startswith(date + "_"):
            errors.append(f"{label}: filename must start with frontmatter date {date}_")
        if not title.strip():
            errors.append(f"{label}: English title is empty")

        slug = generator.slugify(title)
        if not slug:
            errors.append(f"{label}: English title produces an empty public slug")
        if date and slug:
            post_ids.append(f"{date}_{slug}")

        cover = str(data.get("coverImage") or "")
        if not cover.startswith("/images/blog/covers/") or ".." in Path(cover).parts:
            errors.append(f"{label}: coverImage must be under /images/blog/covers/")
        elif not exact_case_exists(root, cover.lstrip("/")):
            errors.append(f"{label}: cover image is missing or has different filename case: {cover}")

        tags = data.get("tags")
        tags_zh = data.get("tags_zh")
        languages = data.get("languages")
        if not isinstance(tags, list) or not tags:
            errors.append(f"{label}: tags must be a non-empty list")
        if not isinstance(tags_zh, list) or not tags_zh:
            errors.append(f"{label}: tags_zh must be a non-empty list")
        if isinstance(tags, list) and isinstance(tags_zh, list) and len(tags) != len(tags_zh):
            errors.append(f"{label}: tags and tags_zh must have the same length")
        if not isinstance(languages, list) or not languages:
            errors.append(f"{label}: languages must be a non-empty list")
            languages = []

        english, separator, chinese = body.partition("---zh---")
        if "en" in languages and not english.strip():
            errors.append(f"{label}: languages includes en but the English body is empty")
        if "zh" in languages and (not separator or not chinese.strip()):
            errors.append(f"{label}: languages includes zh but the Chinese body is missing")
        if body.count("---zh---") > 1:
            errors.append(f"{label}: body contains more than one ---zh--- separator")

        malformed = MALFORMED_EMPHASIS_RE.search(body)
        if malformed:
            errors.append(
                f"{label}: malformed emphasis {malformed.group(0).strip()!r} mixes _ and * — "
                "the renderer only supports *italic* and **bold**; use a single matching pair"
            )
        if "en" in languages and "zh" in languages and not TRANSLATION_NOTE_RE.search(english):
            errors.append(
                f"{label}: bilingual article is missing a properly formatted "
                "'*Originally written in Chinese. This article is translated by GPT-5.6.*' note "
                "at the end of the English body"
            )

        title_zh = str(data.get("title_zh") or "")
        first_en = next((line.strip() for line in english.strip("\n").splitlines() if line.strip()), "")
        first_zh = next((line.strip() for line in chinese.strip("\n").splitlines() if line.strip()), "")
        if title.strip() and re.sub(r"^#+\s*", "", first_en).strip() == title.strip():
            errors.append(
                f"{label}: English body repeats the frontmatter title as its first line, "
                "which double-renders the title on the Reading page — remove it"
            )
        if title_zh.strip() and re.sub(r"^#+\s*", "", first_zh).strip() == title_zh.strip():
            errors.append(
                f"{label}: Chinese body repeats the frontmatter title_zh as its first line, "
                "which double-renders the title on the Reading page — remove it"
            )

    duplicate_ids = sorted(value for value, count in Counter(post_ids).items() if count > 1)
    if duplicate_ids:
        errors.append("duplicate generated article IDs: " + ", ".join(duplicate_ids))

    try:
        posts = generator.load_posts()
    except Exception as exc:  # noqa: BLE001 - surface generator incompatibility
        errors.append(f"article generator failed: {exc}")
        posts = []
    return posts, post_ids


def photo_blocks(source: str) -> list[tuple[int, str]]:
    blocks: list[tuple[int, str]] = []
    for match in re.finditer(r"\{(.*?)\}", source, flags=re.S):
        block = match.group(1)
        present = sum(bool(re.search(rf"\b{name}:\s*", block)) for name in PHOTO_FIELDS)
        if re.search(r"\bimageUrl:\s*", block) or present >= 3:
            blocks.append((source.count("\n", 0, match.start()) + 1, block))
    return blocks


def audit_photos(root: Path, generator: ModuleType, errors: list[str]) -> tuple[list[dict], list[int]]:
    source_path = root / "content" / "photos-source.ts"
    source = source_path.read_text(encoding="utf-8")
    ids: list[int] = []
    image_urls: list[str] = []

    for line, block in photo_blocks(source):
        values: dict[str, str] = {}
        for name in PHOTO_FIELDS:
            field = re.search(rf"\b{name}:\s*'([^']*)'\s*,", block)
            if field:
                values[name] = field.group(1)
            else:
                errors.append(f"content/photos-source.ts:{line}: missing or unparsable {name}")
        if len(values) != len(PHOTO_FIELDS):
            continue

        try:
            photo_id = int(values["id"])
            if photo_id <= 0:
                raise ValueError
            ids.append(photo_id)
        except ValueError:
            errors.append(f"content/photos-source.ts:{line}: id must be a positive integer")

        if not values["location"].strip():
            errors.append(f"content/photos-source.ts:{line}: location is empty")
        if not values["category"].strip() or values["category"] != values["category"].strip().lower():
            errors.append(f"content/photos-source.ts:{line}: category must be non-empty lowercase text")
        if not valid_date(values["date"]):
            errors.append(f"content/photos-source.ts:{line}: invalid date {values['date']!r}")

        image_url = values["imageUrl"]
        image_urls.append(image_url)
        if not image_url.startswith("/images/gallery/") or ".." in Path(image_url).parts:
            errors.append(f"content/photos-source.ts:{line}: imageUrl must be under /images/gallery/")
        elif not exact_case_exists(root, image_url.lstrip("/")):
            errors.append(
                f"content/photos-source.ts:{line}: image is missing or has different filename case: {image_url}"
            )

    duplicate_ids = sorted(value for value, count in Counter(ids).items() if count > 1)
    duplicate_urls = sorted(value for value, count in Counter(image_urls).items() if count > 1)
    if duplicate_ids:
        errors.append("duplicate photo IDs: " + ", ".join(map(str, duplicate_ids)))
    if duplicate_urls:
        errors.append("duplicate photo imageUrl values: " + ", ".join(duplicate_urls))

    try:
        photos = generator.load_photos()
    except Exception as exc:  # noqa: BLE001 - surface generator incompatibility
        errors.append(f"photo generator failed: {exc}")
        photos = []
    if len(photos) != len(photo_blocks(source)):
        errors.append(
            "photo generator record count differs from canonical entry count "
            f"({len(photos)} generated vs {len(photo_blocks(source))} canonical)"
        )
    return photos, ids


def audit_derivatives(root: Path, generator: ModuleType, errors: list[str]) -> int:
    """Verify every canonical original has its full set of web-sized copies.

    Pages serve only `images/derived/`, never the originals, so a forgotten
    `generate-derivatives.py` run would ship broken images. This is the gate
    that catches that before it reaches GitHub Pages.
    """
    expected: list[tuple[str, str]] = []

    source = (root / "content" / "photos-source.ts").read_text(encoding="utf-8")
    for line, block in photo_blocks(source):
        field = re.search(r"\bimageUrl:\s*'([^']*)'\s*,", block)
        if not field:
            continue
        image_url = field.group(1)
        label = f"content/photos-source.ts:{line}"
        for width in (*generator.GALLERY_THUMB_WIDTHS, generator.GALLERY_DISPLAY_WIDTH):
            expected.append((label, generator.derivative_url(image_url, "gallery", width)))

    for path in sorted((root / "content" / "posts").glob("*.md")):
        try:
            data, _ = generator.parse_frontmatter(path.read_text(encoding="utf-8"))
        except ValueError:
            continue  # audit_posts already reports malformed frontmatter
        cover = str(data.get("coverImage") or "").lstrip("/")
        if not cover:
            continue
        label = f"content/posts/{path.name}"
        for width in generator.COVER_WIDTHS:
            expected.append((label, generator.derivative_url(cover, "covers", width)))

    missing = [
        (label, url) for label, url in expected if not exact_case_exists(root, url.lstrip("./"))
    ]
    for label, url in missing[:10]:
        errors.append(f"{label}: missing derivative {url}")
    if len(missing) > 10:
        errors.append(f"...and {len(missing) - 10} more missing derivative(s)")
    if missing:
        errors.append("run python3 scripts/generate-derivatives.py, then generate-content.py")

    dimensions_path = root / "content" / "image-dimensions.json"
    if not dimensions_path.is_file():
        errors.append(
            "content/image-dimensions.json is missing; run "
            "python3 scripts/generate-derivatives.py"
        )
    return len(expected)


def load_font_generator(root: Path) -> ModuleType | None:
    """Import scripts/generate-fonts.py for its glyph-set extraction.

    That module imports fonttools lazily, so this works without fonttools
    installed - the audit only needs the pure-Python text extraction.
    """
    path = root / "scripts" / "generate-fonts.py"
    if not path.is_file():
        return None
    spec = importlib.util.spec_from_file_location("fred_website_generate_fonts", path)
    if spec is None or spec.loader is None:
        return None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def audit_fonts(root: Path, posts: list[dict], errors: list[str]) -> int:
    """Verify the committed font subsets still cover every glyph the site renders.

    Pages load only `fonts/derived/`, so a post that introduces a new character
    in a heading, footnote or caption silently loses that glyph to a fallback
    until the subsets are regenerated. Comparing the recomputed glyph
    fingerprint against the recorded one catches exactly that.
    """
    manifest_path = root / "content" / "font-subsets.json"
    if not manifest_path.is_file():
        errors.append(
            "content/font-subsets.json is missing; run uv run scripts/generate-fonts.py"
        )
        return 0
    try:
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        faces = manifest["faces"]
    except Exception as exc:  # noqa: BLE001 - report malformed generated output
        errors.append(f"content/font-subsets.json is unreadable: {exc}")
        return 0

    generator = load_font_generator(root)
    if generator is None:
        errors.append("scripts/generate-fonts.py is missing; cannot verify font subsets")
        return len(faces)

    shared = generator.base_text()
    for master_name, spec in generator.FACES.items():
        entry = faces.get(master_name)
        if entry is None:
            errors.append(f"font-subsets.json has no entry for {master_name}")
            continue
        if not exact_case_exists(root, f"fonts/derived/{master_name}"):
            errors.append(f"missing font subset fonts/derived/{master_name}")
        if not exact_case_exists(root, f"fonts/{master_name}"):
            errors.append(f"missing font master fonts/{master_name}")
        expected = generator.charset_for(spec, posts, shared)
        if generator.fingerprint(expected) != entry.get("fingerprint"):
            recorded = set(entry.get("charset", ""))
            added = sorted(expected - recorded)
            sample = "".join(added[:20])
            errors.append(
                f"{spec['family']} subset is stale: {len(added)} character(s) now "
                f"render in it but are not in the subset"
                + (f" (e.g. {sample})" if sample else "")
                + "; run uv run scripts/generate-fonts.py"
            )
    return len(faces)


def audit_manifests(root: Path, posts: list[dict], photos: list[dict], errors: list[str]) -> None:
    manifests = (
        (root / "content" / "posts.js", "FY_POSTS", posts),
        (root / "content" / "photos.js", "FY_PHOTOS", photos),
    )
    for path, global_name, expected in manifests:
        try:
            actual = load_manifest(path, global_name)
        except Exception as exc:  # noqa: BLE001 - report malformed generated output
            errors.append(f"{path.relative_to(root)}: cannot read generated manifest: {exc}")
            continue
        if actual != expected:
            errors.append(f"{path.relative_to(root)} is stale; run python3 scripts/generate-content.py")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path.cwd(), help="fyang0507.github.io website repository root")
    args = parser.parse_args()
    root = args.root.expanduser().resolve()
    errors: list[str] = []

    try:
        generator = load_generator(root)
    except Exception as exc:  # noqa: BLE001 - produce a concise CLI failure
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1

    posts, post_ids = audit_posts(root, generator, errors)
    photos, photo_ids = audit_photos(root, generator, errors)
    derivative_count = audit_derivatives(root, generator, errors)
    font_count = audit_fonts(root, posts, errors)
    audit_manifests(root, posts, photos, errors)

    if errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        print(f"Content audit failed with {len(errors)} error(s).", file=sys.stderr)
        return 1

    max_photo_id = max(photo_ids, default=0)
    gap_count = max_photo_id - len(set(photo_ids)) if photo_ids else 0
    print(
        f"Content audit passed: {len(post_ids)} articles, {len(photo_ids)} photos, "
        f"{derivative_count} derivatives, {font_count} font subsets, "
        f"max photo ID {max_photo_id}, {gap_count} retained ID gap(s)."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
