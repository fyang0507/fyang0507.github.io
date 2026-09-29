#!/usr/bin/env python3
"""Generate browser-ready content manifests for the dependency-free site.

The checked-in Markdown and TypeScript metadata remain the canonical imported
content. This script only performs a deterministic, standard-library-only
conversion to JavaScript files that the standalone .dc.html pages can load.
"""

from __future__ import annotations

import argparse
import ast
import json
import re
import sys
from pathlib import Path

# Siblings, importable however this module is loaded (the skill's audit and
# generate-derivatives.py load it by path through importlib). No __pycache__
# in scripts/: nothing else in the repository is compiled.
sys.path.insert(0, str(Path(__file__).resolve().parent))
sys.dont_write_bytecode = True
import landmarks  # noqa: E402
from content_markdown import markdown_to_html  # noqa: E402


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
        reading_min = max(1, (english_words + 199) // 200)
        post_id = f"{date}_{slugify(title)}"
        # Reading's rail landmarks are split at build time: the headings and
        # minute anchors go into the body, the rail's entries beside it.
        marked_en = landmarks.build(markdown_to_html(english, "en-"), reading_min, "en-")
        marked_zh = landmarks.build(markdown_to_html(chinese, "zh-"), reading_min, "zh-")
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
                "readingMin": reading_min,
                "htmlEn": marked_en["html"],
                "htmlZh": marked_zh["html"],
                "landmarksEn": landmarks.manifest(marked_en),
                "landmarksZh": landmarks.manifest(marked_zh),
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


# Fields only Reading.dc.html reads. Writing loads the index without them
# (posts.js is ~900 KB, the index a few percent of that).
READING_ONLY_FIELDS = ("subtitle", "subtitleZh", "excerpt", "excerptZh",
                       "htmlEn", "htmlZh", "landmarksEn", "landmarksZh", "source")


def post_index(posts: list[dict]) -> list[dict]:
    return [{k: v for k, v in post.items() if k not in READING_ONLY_FIELDS} for post in posts]


def home_manifest(posts: list[dict], photos: list[dict]) -> dict:
    """The few facts the home page shows (counts, the latest essay and photo), so it loads neither manifest."""
    post = posts[0] if posts else {}
    photo = max(photos, key=lambda p: (p["date"], p["id"])) if photos else {}
    return {
        "essays": len(posts),
        "photos": len(photos),
        "post": {k: post.get(k, "") for k in ("id", "date", "title", "titleZh")},
        "photo": {k: photo.get(k, "") for k in ("id", "loc", "date")},
    }


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
    write_js(ROOT / "content" / "posts-index.js", "FY_POST_INDEX", post_index(posts))
    write_js(ROOT / "content" / "photos.js", "FY_PHOTOS", photos)
    write_js(ROOT / "content" / "home.js", "FY_HOME", home_manifest(posts, photos))
    print(f"Generated {len(posts)} posts and {len(photos)} photos")


if __name__ == "__main__":
    main()
