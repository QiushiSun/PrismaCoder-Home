# PrismaCoder — project page

Source for the PrismaCoder homepage: *PrismaCoder: Pushing the Boundaries of Open
Multimodal Code Intelligence through Decomposed Rubric Synthesis*.

Static HTML, CSS and vanilla JS. No build step, no framework, no CDN scripts;
open `index.html` or serve the directory and it runs.

```bash
python3 -m http.server 8899   # then http://localhost:8899
```

## Layout

```
index.html               the page
404.html                 not-found page
static/css/main.css      design system + all page styles
static/js/main.js        theme toggle, starfield, nav, reveal-on-scroll, BibTeX copy
public/
  logo.png / logo.webp   the prism mark, used as the hero art
  favicon*.png .ico      derived from logo.png
  apple-touch-icon.png   180x180, on the dark background
  logos/projects/        marks for the "More research" menu
tools/build_icons.py     regenerates logo.webp and every favicon from public/logo.png
```

## Filling in the template

The page is a skeleton carried over from the OSReward page: the hero carries the
title, every other section is an empty slot.

- **Sections.** Each one has an eyebrow, a commented `h2.section-title`, and
  dashed placeholder blocks (`class="slot"`). Replace a block and drop its
  `slot` class when the content lands. Adding a section needs only a nav link
  and a matching `id`; the scroll spy reads the nav.
- **Links.** Release links are parked: `class="btn pending"` in the hero and
  `class="card feature pending-card"` under Resources, with no `href`. For each,
  drop the class and add the `href`. `data-link` names the artifact.
- **Other TODOs.** Search `TODO` for the lede, contribution bullets, byline,
  news, BibTeX, the GitHub nav button, the page description and the social card.

## Theme

`:root` is the dark theme and `:root[data-theme="light"]` overrides the same
tokens. An inline script in `<head>` sets `data-theme` before first paint
(localStorage key `prismacoder-theme`, then `prefers-color-scheme`, then dark).
404.html carries its own copy of that script; keep the key in step.

## Deploying

GitHub Pages from `main`, folder `/ (root)`, served at
`https://qiushisun.github.io/PrismaCoder-Home/`.

Two things hardcode that address: the Open Graph tags in `<head>` (social
scrapers do not resolve relative URLs), and the root-absolute
`/PrismaCoder-Home/…` paths in `404.html` (Pages serves it for misses at any
depth). Change them together if the site moves.
