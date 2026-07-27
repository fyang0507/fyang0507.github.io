# Fred Yang

The source for [fyang0507.github.io](https://fyang0507.github.io): a small, dependency-free personal site about AI work, writing, and photography.

## Run locally

This is a static site—there is no build step or package manager. Serve it over HTTP:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Then open [http://127.0.0.1:4173/](http://127.0.0.1:4173/).

## Content and structure

- `index.html` is the home page; the section pages are standalone `.dc.html` files.
- Essays live in `content/posts/`; photo metadata lives in `content/photos-source.ts`.
- After changing either source, run `python3 scripts/generate-content.py` and commit the generated `content/posts.js` and `content/photos.js`.
- Site assets, local fonts, and shared browser scripts are kept in `assets/`, `images/`, `fonts/`, and the repository root.

The site is intentionally plain static HTML, CSS, and JavaScript so it can be deployed on any static host.

## License and credits

Original site code is available under the [MIT License](LICENSE). Third-party notices, design-reference credit, and exclusions for personal content, fonts, generated runtimes, and vendored code are in [NOTICE.md](NOTICE.md).
