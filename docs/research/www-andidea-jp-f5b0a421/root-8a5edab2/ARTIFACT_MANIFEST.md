# Asset and implementation provenance

Source: https://www.andidea.jp/, inspected 2026-09-09.
Six downloaded assets: logo PNG, background MP4, poster JPG, favicon ICO, Geist and Geist Mono WOFF2. Exact URLs, MIME types, sizes and SHA-256 hashes in assets.json. Downloader script is checked in.
Original video is 21,816,076 bytes; total assets 22,255,140 bytes.
Source lightness map is stored as film-luminance.json (80 frames,48×27,4fps). This is nonvisual contrast metadata; the actual background is the original video.
Source-built scroll and effects JavaScript retained as .js.txt research references; implementation is readable typed React/TypeScript.
Source-derived responsive CSS extracted only for homepage/header/effects selectors; bundled framework utilities and unrelated subpage styles omitted.
SVG icons are the source's Lucide paths rendered with the installed Lucide React package (ArrowUpRight, ArrowDown, ArrowUp, Menu, Play, Pause, X).
No image generation, missing-asset replacement, iframe of the source, or screenshot-as-page technique was used.
Nine implementation specs: Header, six scenes, Journey controller, FilmEffects. Eleven React components including three internal typography/link helpers; one typed effects module and scene-data module.
