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
  logo.png / logo.webp   the prism mark (hero cover, nav, favicons)
  favicon*.png .ico      derived from logo.png
  apple-touch-icon.png   180x180, on the dark background
  cover/                 hero-cover card thumbnails and language icons
  logos/projects/        marks for the "More research" menu
tools/build_icons.py     regenerates logo.webp and every favicon from public/logo.png
tools/build_cover.py     regenerates the hero cover (assets + markup)
tools/cover_src/         sources of the cover renders made for this page, and render.sh
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

## Hero cover

The right half of the hero is a layered web version of the paper's task
overview (Figure 1). The prism disperses light upward, and the artifacts of
PrismaCoder's tasks float around it on three depth layers:

- back: blurred and faint, not interactive (scores, documents, diagrams)
- mid: slightly soft, lifts and sharpens on hover
- front: tilted towards the prism and labelled; two are paired with a code
  window showing the actual source of the render beside it

Renders come from the paper tree (gold renders of benchmark samples in
`case_studies/`, and the Figure-1 thumbnails in `overview_src/thumbs/` with
their source files beside them) or from `tools/cover_src/`, which holds the
sources made for this page: the dashboard and board pages (`webui_dashboard.html`,
`kanban.html`), the
rose chart (`make_rose.py` -> `rose.svg`), the 3D surface (`plot3d.py`) and the
Manim transformer scene (`transformer.py`). Band colours follow the figure. The layers drift
against the pointer (off under reduced motion and on touch screens), and on
load the artifacts leave the prism once.

`tools/build_cover.py` holds the item list (`ITEMS`: layer, render or source
file, position, width, tilt). It crops the renders into `public/cover/`, copies
the icons, and rewrites the markup between the `<!-- cover:start -->` and
`<!-- cover:end -->` markers in `index.html`. Edit the script and rerun it;
never edit the generated block.

```bash
tools/cover_src/render.sh      # Chrome, matplotlib, Manim -> tools/cover_src/renders/ (gitignored)
python3 tools/build_cover.py   # reads the renders and the paper tree ($PRISMACODER_PAPER)
```

Positions are in a 900 x 600 scene around the hero's grid cell (x 250..850,
y 30..570), so the cover scales with its column. Front items stay inside the
cell; back and mid items may run under the title column and off the page edge.

## Theme

The palette is sampled from the prism: an indigo-violet accent (`--accent-*`)
and cyan for data (`--cyan-*`). `:root` is the dark theme and
`:root[data-theme="light"]` overrides the same tokens; the accent ramp inverts
(100 is darkest in the light theme). An inline script in `<head>` sets `data-theme` before first paint
(localStorage key `prismacoder-theme`, then `prefers-color-scheme`, then dark).
404.html carries its own copy of that script; keep the key in step.

## Deploying

GitHub Pages from `main`, folder `/ (root)`, served at
`https://qiushisun.github.io/PrismaCoder-Home/`.

Two things hardcode that address: the Open Graph tags in `<head>` (social
scrapers do not resolve relative URLs), and the root-absolute
`/PrismaCoder-Home/…` paths in `404.html` (Pages serves it for misses at any
depth). Change them together if the site moves.
