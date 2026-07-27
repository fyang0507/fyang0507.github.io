# Notices and attributions

This file records third-party material and clarifies the scope of the repository's [MIT License](LICENSE).

## License scope

The MIT License applies to Fred Yang's original HTML, CSS, JavaScript, Python, and documentation in this repository. It does not replace the terms for third-party material, nor does it grant rights to the personal essays, photography, illustration assets, profile material, or local font files. Those materials remain subject to their respective copyright and permission status.

`support.js` is generated runtime code and `image-slot.js` is a vendored runtime component; neither is relicensed by the top-level MIT license. Their upstream source and license should be confirmed before either file is reused outside this site.

## Sticker Forge and Three.js

The interactive peel effect on the NJJoe APA page uses a vendored build of [Sticker Forge](https://github.com/CatsJuice/sticker-forge), copyright (c) 2026 CatsJuice, under the MIT License. The exact upstream commit and bundle checksum are recorded in [`assets/njjoe/vendor/sticker-forge/SOURCE.md`](assets/njjoe/vendor/sticker-forge/SOURCE.md); its full license is retained in [`LICENSE.txt`](assets/njjoe/vendor/sticker-forge/LICENSE.txt).

That bundle includes Three.js, copyright (c) 2010-2026 three.js authors, under the MIT License. Its full license is retained in [`THREE-LICENSE.txt`](assets/njjoe/vendor/sticker-forge/THREE-LICENSE.txt).

## Transition.dev motion reference

The pusher/nudge motion beside the WIP sticker was inspired by a motion study from [Transition.dev](https://transition.dev). The site reimplements that behavior in its own CSS and JavaScript; no Transition.dev code, media, or other distributable asset is included here. No public license for that reference was available when this notice was added, so this credit records the design reference rather than asserting a license for it.

## Runtime dependencies loaded from CDNs

`support.js` loads React 18.3.1, ReactDOM 18.3.1, and Babel Standalone 7.29.0 from unpkg at runtime. They are not bundled in this repository. React and Babel are MIT-licensed; their terms remain with their upstream projects.

The pages also request Fraunces, Caveat, IBM Plex Mono, Noto Serif SC, and Noto Sans SC from Google Fonts. Those remote font resources are not included in this repository and remain subject to their upstream licenses.

## Local fonts and original content

`fonts/DingTalkJinBuTi.woff2` and `fonts/MuyaoSuixin.woff2` are local font files. Their source licensing was not documented in the repository, so they are expressly excluded from the top-level MIT grant until their provenance and redistribution terms are recorded.

The essays, photographs, illustrations, and other original site assets are not offered under the MIT License. Please request permission before reusing them.
