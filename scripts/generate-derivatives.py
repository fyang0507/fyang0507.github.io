#!/usr/bin/env python3
"""Generate web-sized derivatives of the canonical gallery photos and blog covers.

The full-resolution files under `images/gallery/` and `images/blog/covers/` stay
canonical and append-only: add originals there and never hand-resize them. This
script derives everything the pages actually serve into `images/derived/`, which
is a generated artifact in the same category as `content/photos.js` — commit it.

`.github/workflows/deploy-pages.yml` deletes `scripts/` before deploying, so
derivatives cannot be built in CI. They must be generated locally and committed.

Standard library only, plus macOS `sips`. Runs are idempotent: a derivative is
rebuilt only when it is missing or older than its source, so adding one photo
costs one photo's work.

    python3 scripts/generate-derivatives.py
    python3 scripts/generate-derivatives.py --force    # re-encode everything
"""

from __future__ import annotations

import argparse
import importlib.util
import json
import re
import shutil
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from types import ModuleType

ROOT = Path(__file__).resolve().parents[1]

# Encoder quality. Thumbnails are a few KB either way, so they get headroom;
# the 2560px lightbox copy is where quality trades against transfer size.
THUMB_QUALITY = 82
DISPLAY_QUALITY = 74
COVER_QUALITY = 78


def load_contract() -> ModuleType:
    """Import generate-content.py for the shared derivative naming contract."""
    path = ROOT / "scripts" / "generate-content.py"
    spec = importlib.util.spec_from_file_location("fred_website_generate_content", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load generator at {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def sips_dimensions(path: Path) -> tuple[int, int]:
    out = subprocess.run(
        ["sips", "-g", "pixelWidth", "-g", "pixelHeight", str(path)],
        capture_output=True,
        text=True,
        check=True,
    ).stdout
    dims: dict[str, int] = {}
    for line in out.splitlines():
        key, _, value = line.strip().partition(": ")
        if key in {"pixelWidth", "pixelHeight"}:
            dims[key] = int(value)
    if len(dims) != 2:
        raise RuntimeError(f"could not read dimensions of {path}")
    return dims["pixelWidth"], dims["pixelHeight"]


def has_alpha(path: Path) -> bool:
    out = subprocess.run(
        ["sips", "-g", "hasAlpha", str(path)],
        capture_output=True,
        text=True,
        check=False,
    ).stdout
    return "hasAlpha: yes" in out


def run_sips(args: list[str], source: Path, target: Path) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    # Write to a temp sibling so an interrupted run never leaves a truncated
    # derivative that a later idempotent run would treat as complete.
    staging = target.with_name(target.name + ".partial")
    try:
        subprocess.run(
            ["sips", *args, "-s", "format", "jpeg", str(source), "--out", str(staging)],
            capture_output=True,
            text=True,
            check=True,
        )
        staging.replace(target)
    finally:
        staging.unlink(missing_ok=True)


def build_cropped(source: Path, target: Path, width: int, height: int, quality: int) -> None:
    """Downscale to cover the target box, then center-crop to it exactly.

    This reproduces what `aspect-ratio` + `object-fit: cover` already does in the
    gallery CSS, so the crop is visually identical while the browser decodes a
    fixed 400x300 frame instead of a full 4672x6224 one.
    """
    src_w, src_h = sips_dimensions(source)
    # Scale on whichever axis leaves the other axis at or above the target.
    if src_w * height > src_h * width:
        scale = ["--resampleHeight", str(height)]
    else:
        scale = ["--resampleWidth", str(width)]
    run_sips(
        [*scale, "-c", str(height), str(width), "-s", "formatOptions", str(quality)],
        source,
        target,
    )


def build_bounded(source: Path, target: Path, long_edge: int, quality: int) -> None:
    """Downscale so the long edge is at most `long_edge`. Never upscales."""
    src_w, src_h = sips_dimensions(source)
    args = ["-s", "formatOptions", str(quality)]
    if max(src_w, src_h) > long_edge:
        args = ["-Z", str(long_edge), *args]
    run_sips(args, source, target)


def build_width_bounded(source: Path, target: Path, width: int, quality: int) -> None:
    """Downscale so the width is at most `width`. Never upscales."""
    src_w, _ = sips_dimensions(source)
    args = ["-s", "formatOptions", str(quality)]
    if src_w > width:
        args = ["--resampleWidth", str(width), *args]
    run_sips(args, source, target)


def collect_jobs(contract: ModuleType) -> tuple[list[tuple], list[str], dict[str, Path]]:
    """Plan every derivative. Returns (jobs, errors, originals-by-relative-path)."""
    jobs: list[tuple] = []
    errors: list[str] = []
    stems: dict[tuple[str, str], str] = {}
    originals: dict[str, Path] = {}

    def register(group: str, image_url: str, label: str) -> Path | None:
        relative = image_url.lstrip("./").lstrip("/")
        source = ROOT / relative
        if not source.is_file():
            errors.append(f"{label}: missing original {relative}")
            return None
        stem = contract.derived_stem(relative)
        key = (group, stem)
        if key in stems and stems[key] != relative:
            errors.append(
                f"{label}: derivative name collision — {relative} and {stems[key]} "
                f"both map to {group}/{stem}-*.jpg. Rename one original."
            )
            return None
        stems[key] = relative
        if source.suffix.lower() == ".png" and has_alpha(source):
            errors.append(
                f"{label}: {relative} has an alpha channel; JPEG derivatives would "
                f"flatten transparency to black. Flatten the original first."
            )
            return None
        originals[relative] = source
        return source

    # Read the canonical ledger directly: photos.js already holds derivative
    # URLs, so it cannot tell us where the originals live.
    source_text = (ROOT / "content" / "photos-source.ts").read_text(encoding="utf-8")
    for block in re.findall(r"\{(.*?)\}", source_text, flags=re.S):
        id_match = re.search(r"\bid:\s*'([^']*)'", block)
        url_match = re.search(r"\bimageUrl:\s*'([^']*)'", block)
        if not id_match or not url_match:
            continue
        image_url = url_match.group(1)
        source = register("gallery", image_url, f"photo {id_match.group(1)}")
        if source is None:
            continue
        for width in contract.GALLERY_THUMB_WIDTHS:
            aspect_w, aspect_h = contract.GALLERY_THUMB_ASPECT
            height = round(width * aspect_h / aspect_w)
            target = ROOT / contract.derivative_url(image_url, "gallery", width).lstrip("./")
            jobs.append(("crop", source, target, width, height, THUMB_QUALITY))
        target = ROOT / contract.derivative_url(
            image_url, "gallery", contract.GALLERY_DISPLAY_WIDTH
        ).lstrip("./")
        jobs.append(
            ("bounded", source, target, contract.GALLERY_DISPLAY_WIDTH, DISPLAY_QUALITY)
        )

    # Blog covers, likewise read from the canonical frontmatter.
    for path in sorted((ROOT / "content" / "posts").glob("*.md")):
        data, _ = contract.parse_frontmatter(path.read_text(encoding="utf-8"))
        cover = str(data.get("coverImage") or "").lstrip("/")
        if not cover:
            continue
        source = register("covers", cover, f"content/posts/{path.name}")
        if source is None:
            continue
        for width in contract.COVER_WIDTHS:
            target = ROOT / contract.derivative_url(cover, "covers", width).lstrip("./")
            jobs.append(("width", source, target, width, COVER_QUALITY))

    return jobs, errors, originals


def write_dimensions(originals: dict[str, Path], workers: int) -> int:
    """Record each original's pixel size so pages can reserve layout space.

    Resizing preserves aspect ratio, so the original's ratio is also every
    derivative's ratio. generate-content.py folds this into the manifests; the
    lightbox uses it to size its frame before the image arrives, which is what
    keeps click-to-full from shifting the caption.
    """
    items = sorted(originals.items())
    with ThreadPoolExecutor(max_workers=max(1, workers)) as pool:
        sizes = list(pool.map(lambda item: sips_dimensions(item[1]), items))
    payload = {relative: list(size) for (relative, _), size in zip(items, sizes)}
    target = ROOT / "content" / "image-dimensions.json"
    target.write_text(
        json.dumps(payload, ensure_ascii=False, indent=0, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    return len(payload)


def needs_build(source: Path, target: Path, force: bool) -> bool:
    if force or not target.is_file():
        return True
    return target.stat().st_mtime < source.stat().st_mtime


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--force", action="store_true", help="re-encode derivatives that are already current"
    )
    parser.add_argument(
        "--jobs", type=int, default=8, help="parallel sips invocations (default 8)"
    )
    parser.add_argument(
        "--prune",
        action="store_true",
        help="delete derivatives with no corresponding canonical original",
    )
    args = parser.parse_args()

    if shutil.which("sips") is None:
        print("error: sips not found. This script requires macOS.", file=sys.stderr)
        return 1

    contract = load_contract()
    jobs, errors, originals = collect_jobs(contract)
    for message in errors:
        print(f"error: {message}", file=sys.stderr)
    if errors:
        return 1

    expected = {job[2] for job in jobs}
    pending = [job for job in jobs if needs_build(job[1], job[2], args.force)]

    def build(job: tuple) -> Path:
        kind, source, target = job[0], job[1], job[2]
        if kind == "crop":
            build_cropped(source, target, job[3], job[4], job[5])
        elif kind == "bounded":
            build_bounded(source, target, job[3], job[4])
        else:
            build_width_bounded(source, target, job[3], job[4])
        return target

    if pending:
        print(f"Building {len(pending)} of {len(jobs)} derivatives...")
        done = 0
        with ThreadPoolExecutor(max_workers=max(1, args.jobs)) as pool:
            for target in pool.map(build, pending):
                done += 1
                if done % 25 == 0 or done == len(pending):
                    print(f"  {done}/{len(pending)}")
    else:
        print(f"All {len(jobs)} derivatives are current.")

    derived_root = ROOT / contract.DERIVED_DIR
    orphans = []
    if derived_root.is_dir():
        orphans = sorted(p for p in derived_root.rglob("*.jpg") if p not in expected)
    if orphans:
        if args.prune:
            for path in orphans:
                path.unlink()
            print(f"Pruned {len(orphans)} orphaned derivatives.")
        else:
            print(
                f"note: {len(orphans)} derivative(s) have no canonical original "
                f"(re-run with --prune to delete):"
            )
            for path in orphans[:10]:
                print(f"  {path.relative_to(ROOT)}")

    measured = write_dimensions(originals, args.jobs)
    total = sum(p.stat().st_size for p in expected if p.is_file())
    print(
        f"{len(jobs)} derivatives, {total / 1048576:.1f} MB total; "
        f"recorded dimensions for {measured} originals"
    )
    print("Now run: python3 scripts/generate-content.py")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
