"""Build the hero cover: a layered web version of the paper's task overview (Figure 1).

The prism disperses light upward, and the artifacts that PrismaCoder's tasks
produce float around it on three depth layers:
  back   blurred and faint, not interactive (text-heavy renders: scores, documents)
  mid    slightly soft, lift on hover
  front  crisp, tilted towards the prism and labelled; some are paired with a code
         window showing the actual source of the render next to it
Renders come from the paper tree (gold renders of benchmark samples in
case_studies/, and the Figure-1 thumbnails in overview_src/thumbs/ with their
source files beside them; the dashboard, 3D surface, Manim transformer and the
board page live there too, shared with Figure 1) or from tools/cover_src/renders/,
which its render.sh fills: the board at the cover's size and the cover-only rose
chart. Band colours follow the figure: hue by direction from the prism.

    python3 tools/build_cover.py

Reads   the paper tree (PAPER below, override with $PRISMACODER_PAPER) and
        tools/cover_src/renders/ (run tools/cover_src/render.sh first)
Writes  public/cover/<slug>.webp, public/cover/icons/<name>.png, and the markup
        between the cover markers in index.html

Geometry lives in a 900 x 600 scene. The hero's grid cell is the region
x 250..850, y 30..570 of the scene; the rest spreads under the title column
and past the page edge (back and mid layers only: front cards stay inside the
cell). Change ITEMS here, never the generated markup.
"""
import math
import os
import re
from html import escape
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
PAPER = Path(os.environ.get(
    "PRISMACODER_PAPER",
    Path.home() / "Desktop/CV-1/PrismaCoder_Paper_and_Slides/paper_techreport/Figures"))
OUT = ROOT / "public" / "cover"
LOCAL = ROOT / "tools" / "cover_src"
INDEX = ROOT / "index.html"
START, END = "<!-- cover:start", "<!-- cover:end -->"

SCENE_W, SCENE_H = 900, 600
CELL = (250, 30, 600, 540)                 # the hero grid cell inside the scene: x, y, w, h
NUDGE_X = -30                              # scene units: shifts the whole composition left of the cell
PX_PER_UNIT = 2.1                          # thumbnail pixels per scene unit (about 2x at 1440 px)

# Prism: public/logo.png, apex measured from its alpha map (x 0.532, y 0.013)
LOGO_W, LOGO_H = 1051, 912
PRISM_W = 240
PRISM_H = PRISM_W * LOGO_H / LOGO_W
PRISM_X = CELL[0] + CELL[2] / 2 - 0.532 * PRISM_W
PRISM_Y = CELL[1] + CELL[3] - PRISM_H
EMIT = (CELL[0] + CELL[2] / 2, PRISM_Y + 0.013 * PRISM_H + 8)   # light leaves just below the apex

# Figure 1's band colours, left (red) to right (plum), spread over the fan
BANDS = ["D98C8C", "DD9587", "E0A084", "DFAE7F", "DDB57E", "D6C27C", "CBC97D", "B9CB82",
         "A3CB8E", "8FC9A4", "82C6BC", "82BFD1", "86B3D9", "9A96D6", "C48FBE"]
FAN = (-104, 104)                          # degrees from straight up covered by the bands


def case(f):
    return PAPER / "case_studies" / f


def thumb(f):
    return PAPER / "overview_src" / "thumbs" / f


def local(f):
    """A source or render made for this page (tools/cover_src/)."""
    return LOCAL / f


# kind: "card" (a render), "window" (a render in browser chrome), "code" (a source excerpt)
# tilt: (rotateY, rotateX, rotate) in degrees; cards left of the prism turn right, and back.
ITEMS = [
    # ---------------------------------------------------------------- back
    dict(layer="back", slug="score", src=thumb("lilypond_standin.png"), x=36, y=40, w=220),
    dict(layer="back", slug="surface", src=thumb("asymptote_standin.png"), x=196, y=6, w=124),
    dict(layer="back", slug="icons", src=thumb("icons_set.png"), x=336, y=8, w=118),
    dict(layer="back", slug="flowchart", src=thumb("flowchart_standin.png"), x=742, y=6, w=196),
    dict(layer="back", slug="latex", src=thumb("latex_document.png"), crop=(0.03, 0, 0.97, 0.976),
         x=90, y=470, w=150),
    dict(layer="back", slug="chem", src=thumb("chem_grid.png"), crop=(0.04, 0, 0.96, 1),
         x=800, y=512, w=140),
    dict(layer="back", slug="table", src=thumb("table_standin.png"), x=0, y=124, w=104),
    dict(layer="back", slug="lines", src=thumb("plotsdata_standin.png"), x=652, y=0, w=86),
    dict(layer="back", slug="bubbles", src=case("case1_gold.png"), x=858, y=252, w=120),
    dict(layer="back", slug="mathfig", src=thumb("mathfig_standin.png"), x=762, y=106, w=124),
    dict(layer="back", slug="rocket", src=thumb("img2svg_rocket.png"), x=846, y=318, w=96),
    # ---------------------------------------------------------------- mid
    dict(layer="mid", slug="sequence", src=case("case6_gold.png"), x=190, y=110, w=140, tilt=(8, 0, -2)),
    dict(layer="mid", slug="kanban", kind="window", src=local("renders/kanban.png"), x=104, y=350, w=158,
         tilt=(10, 0, 1)),
    dict(layer="mid", slug="rose", src=local("renders/rose.png"), x=448, y=120, w=112, tilt=(6, 3, -3)),
    dict(layer="mid", slug="hbars", src=case("case2_gold.png"), x=586, y=262, w=96, tilt=(-6, 3, 3)),
    dict(layer="mid", slug="theorem", src=thumb("theorem_manim.png"), x=792, y=62, w=140, tilt=(-8, 0, 2)),
    dict(layer="mid", slug="geometry", src=thumb("geometry_standin.png"), x=836, y=410, w=100,
         tilt=(-8, 0, -2)),
    # ---------------------------------------------------------------- front
    dict(layer="front", slug="chart2code", name="Chart-to-Code", icon="python.png",
         src=case("case5_gold.png"), x=318, y=80, w=150, tilt=(10, 4, -2)),
    dict(layer="front", slug="svg", name="SVG Generation", icon="svg.png",
         src=thumb("svg_lighthouse.png"), x=482, y=38, w=160, tilt=(0, 6, 1)),
    dict(layer="front", kind="code", file=thumb("svg_lighthouse.svg"), lines=(1, 6), lang="svg",
         x=556, y=134, w=180, icon="svg.png", tilt=(0, 6, 1)),
    dict(layer="front", slug="plot3d", name="3D Visualization", icon="python.png",
         src=thumb("plot3d_ripple.png"), crop=(0, 0.03, 1, 1), x=682, y=146, w=168, tilt=(-11, 4, 2)),
    dict(layer="front", slug="webui", name="WebUI Generation", icon="html3.png", kind="window",
         src=thumb("webui_dashboard.png"), x=258, y=212, w=214, tilt=(13, 0, -1)),
    dict(layer="front", slug="artifacts", name="Interactive Artifacts", icon="js.png", kind="window",
         src=thumb("webapp_standin.png"), crop=(0.06, 0, 0.94, 1), x=660, y=322, w=188, tilt=(-13, 0, 1)),
    dict(layer="front", slug="animation", name="Animation Generation", icon="manim.png",
         src=thumb("manim_transformer.png"), x=262, y=380, w=184, tilt=(10, 0, -2)),
    dict(layer="front", kind="code", file=thumb("manim_transformer.py"), lines=(39, 45), lang="py",
         x=150, y=452, w=196, icon="python.png", tilt=(10, 0, -2)),
    dict(layer="front", slug="tikz", name="TikZ Figures", icon="latex_bird.png",
         src=thumb("tikz_unet.png"), x=676, y=468, w=170, tilt=(-10, 0, 2)),
]


# ------------------------------------------------------------------ colour
def rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def mix(a, b, t):
    """t of colour a over colour b, as #rrggbb."""
    return "#%02x%02x%02x" % tuple(round(x * t + y * (1 - t)) for x, y in zip(rgb(a), rgb(b)))


def band_at(angle):
    """Figure-1 colour at a direction (degrees from straight up, clockwise)."""
    t = (min(max(angle, FAN[0]), FAN[1]) - FAN[0]) / (FAN[1] - FAN[0]) * (len(BANDS) - 1)
    i = min(int(t), len(BANDS) - 2)
    return mix(BANDS[i + 1], BANDS[i], t - i)


def angle_from_emit(x, y):
    return math.degrees(math.atan2(x - EMIT[0], -(y - EMIT[1])))


# ------------------------------------------------------------------ assets
def build_thumb(it):
    im = Image.open(it["src"]).convert("RGB")
    x0, y0, x1, y1 = it.get("crop", (0, 0, 1, 1))
    im = im.crop((round(x0 * im.width), round(y0 * im.height), round(x1 * im.width), round(y1 * im.height)))
    w = round(it["w"] * PX_PER_UNIT)
    h = round(w * im.height / im.width)
    im.resize((w, h), Image.LANCZOS).save(OUT / f"{it['slug']}.webp", quality=80, method=6)
    return w, h


def build_icon(name):
    im = Image.open(PAPER / "icons" / "lang_icons" / name).convert("RGBA")
    im = im.crop(im.getbbox())
    h = 48
    im.resize((max(1, round(im.width * h / im.height)), h), Image.LANCZOS).save(
        OUT / "icons" / name, optimize=True)


# ------------------------------------------------------------------ code windows
LEX = {
    "svg": [(r"</?[\w:-]+|/?>", "k"), (r"[\w:-]+(?==)", "a"), (r'"[^"]*"', "s")],
    "py": [(r"#.*", "c"), (r'r?"[^"]*"', "s"), (r"\b(?:class|def|lambda|return|self)\b", "k"),
           (r"\b[A-Z][A-Za-z]*(?:_[A-Z]+)?\b", "t"), (r"\b\d+(?:\.\d+)?\b", "n")],
    "ly": [(r"%.*", "c"), (r"\\[a-zA-Z]+", "k"), (r"\b\d+\.?\d*\b", "n")],
    "tex": [(r"%.*", "c"), (r"\\[a-zA-Z]+", "k"), (r"\b\d+(?:\.\d+)?\b", "n")],
}


def highlight(line, lang):
    rules = LEX[lang]
    rx = re.compile("|".join(f"(?P<g{i}>{p})" for i, (p, _) in enumerate(rules)))
    out, pos = [], 0
    for m in rx.finditer(line):
        out.append(escape(line[pos:m.start()]))
        cls = rules[int(m.lastgroup[1:])][1]
        out.append(f'<span class="t{cls}">{escape(m.group())}</span>')
        pos = m.end()
    out.append(escape(line[pos:]))
    return "".join(out)


def code_excerpt(it):
    """Lines a..b of the source file, exactly as written (common indent removed)."""
    a, b = it["lines"]
    lines = it["file"].read_text().splitlines()[a - 1:b]
    indent = min(len(l) - len(l.lstrip()) for l in lines if l.strip())
    return "\n".join(highlight(l[indent:], it["lang"]) for l in lines)


# ------------------------------------------------------------------ markup
def pct(v, total):
    return f"{v / total * 100:.3f}%"


def item_markup(it, order, sizes):
    kind = it.get("kind", "card")
    ry, rx, rz = it.get("tilt", (0, 0, 0))
    x, y, w = it["x"], it["y"], it["w"]
    if kind == "code":
        h = w * 0.5
    else:
        pw, ph = sizes[it["slug"]]
        h = w * ph / pw
    cx, cy = x + w / 2, y + h / 2
    band = band_at(angle_from_emit(cx, cy))
    style = (f"left:{pct(x, SCENE_W)};top:{pct(y, SCENE_H)};width:{pct(w, SCENE_W)};"
             f"--fx:{(EMIT[0] - cx) / 9:.2f};--fy:{(EMIT[1] - cy) / 9:.2f};--i:{order};--band:{band}")
    tilt = f"--ry:{ry}deg;--rx:{rx}deg;--rz:{rz}deg"
    if kind == "code":
        body = (f'<div class="scene-code"><span class="scene-code-tab">'
                f'<img src="public/cover/icons/{it["icon"]}" alt="">{escape(it["file"].name)}</span>'
                f'<pre>{code_excerpt(it)}</pre></div>')
    else:
        pw, ph = sizes[it["slug"]]
        bar = '<span class="scene-bar"><i></i><i></i><i></i></span>' if kind == "window" else ""
        body = (f'<div class="scene-card{" is-window" if kind == "window" else ""}">{bar}'
                f'<img src="public/cover/{it["slug"]}.webp" alt="" width="{pw}" height="{ph}" '
                f'decoding="async"></div>')
        if it.get("name"):
            body += (f'<span class="scene-label"><img src="public/cover/icons/{it["icon"]}" alt="">'
                     f'{escape(it["name"])}</span>')
    cls = "scene-item is-code" if kind == "code" else "scene-item"
    return (f'<div class="{cls}" style="{style}"><div class="scene-tilt" style="{tilt}">'
            f'{body}</div></div>')


def fan_gradient():
    """Conic fan in the Figure-1 band colours, transparent outside the fan."""
    start = FAN[0] - 26
    n = len(BANDS)
    parts = [f"#{BANDS[0]}00 0deg"]
    for i, c in enumerate(BANDS):
        a = FAN[0] + (FAN[1] - FAN[0]) * i / (n - 1)
        parts.append(f"#{c} {a - start:.1f}deg")
    parts.append(f"#{BANDS[-1]}00 {FAN[1] + 26 - start:.1f}deg")
    return f"conic-gradient(from {start:.1f}deg, {', '.join(parts)})"


def code_texture(frags):
    """Faint radial lines of code in the light, coloured by the band they run in."""
    out = []
    a = FAN[0] + 8
    k = 0
    while a <= FAN[1] - 8:
        rad = math.radians(a)
        ux, uy = math.sin(rad), -math.cos(rad)
        r0, r1 = 50, 250
        text = "  ".join(frags[(k + j) % len(frags)] for j in range(4))[:int((r1 - r0) / 4.9)]
        col = band_at(a)
        ink, glow = mix(col, "1d2140", 0.62), mix(col, "ffffff", 0.9)
        phi = math.degrees(math.atan2(uy, ux))
        x, y = EMIT[0] + ux * r0, EMIT[1] + uy * r0
        rot, anchor = (phi, "start") if ux >= 0 else (phi + 180, "end")
        out.append(f'<text x="{x:.1f}" y="{y:.1f}" transform="rotate({rot:.2f} {x:.1f} {y:.1f})" '
                   f'text-anchor="{anchor}" style="--ink:{ink};--glow:{glow}">{escape(text)}</text>')
        a += 6.5
        k += 1
    return out


_FACE_Y = CELL[1] + CELL[3] - 74          # 62 % down the prism's side faces
BEAMS = [  # (outer top, outer bottom, point on the face); the right one mirrors the left
    ((CELL[0] + 60, _FACE_Y + 34), (CELL[0] + 60, _FACE_Y + 74), (CELL[0] + 226, _FACE_Y)),
    ((CELL[0] + CELL[2] - 60, _FACE_Y + 34), (CELL[0] + CELL[2] - 60, _FACE_Y + 74), (CELL[0] + CELL[2] - 226, _FACE_Y)),
]
FRAGMENTS = ['<section id="hero">', "requestAnimationFrame", "ax.imshow(Z)", "self.play(Create)",
             '<path d="M0 0 L9 9"/>', "\\begin{tikzpicture}", "\\relative c' { g4 a }",
             "CC(C)Cc1ccc(cc1)", "df.plot(ax=ax)", '"mark": "circle"']


def build_markup(sizes):
    layers = {"back": [], "mid": [], "front": []}
    for order, it in enumerate(sorted(ITEMS, key=lambda i: math.hypot(
            i["x"] + i["w"] / 2 - EMIT[0], i["y"] - EMIT[1]))):
        layers[it["layer"]].append(item_markup(it, order, sizes))
    R = 520
    burst = (f"left:{pct(EMIT[0] - R, SCENE_W)};top:{pct(EMIT[1] - R, SCENE_H)};"
             f"width:{pct(2 * R, SCENE_W)};--fan:{fan_gradient()}")
    beams = "".join(
        f'<linearGradient id="beam{i}" gradientUnits="userSpaceOnUse" x1="{a[0]}" y1="{(a[1] + b[1]) / 2}" '
        f'x2="{c[0]}" y2="{c[1]}"><stop class="far" offset="0"/><stop class="near" offset="1"/></linearGradient>'
        f'<polygon fill="url(#beam{i})" points="{a[0]},{a[1]} {c[0]},{c[1] - 6} {c[0]},{c[1] + 6} {b[0]},{b[1]}"/>'
        for i, (a, b, c) in enumerate(BEAMS))
    texture = "\n            ".join(code_texture(FRAGMENTS))
    ex, ey = EMIT
    j = "\n            "
    return f"""{START} (generated by tools/build_cover.py; edit the script, not this block) -->
      <figure class="hero-art cover">
        <div class="cover-scene" style="left:{pct(-CELL[0] + NUDGE_X, CELL[2])};top:{pct(-CELL[1], CELL[3])};width:{pct(SCENE_W, CELL[2])};aspect-ratio:{SCENE_W} / {SCENE_H}">
          <div class="cover-burst" style="{burst}" aria-hidden="true"></div>
          <svg class="cover-lines" viewBox="0 0 {SCENE_W} {SCENE_H}" aria-hidden="true">
            <defs>
              <radialGradient id="coverFade" gradientUnits="userSpaceOnUse" cx="{ex:.1f}" cy="{ey:.1f}" r="300">
                <stop offset="0.16" stop-color="#000"/><stop offset="0.34" stop-color="#fff"/>
                <stop offset="0.7" stop-color="#fff"/><stop offset="0.9" stop-color="#000"/>
              </radialGradient>
              <mask id="coverMask"><rect x="-60" y="-60" width="{SCENE_W + 120}" height="{SCENE_H + 120}" fill="url(#coverFade)"/></mask>
              <filter id="coverSoft" x="-50%" y="-100%" width="200%" height="300%"><feGaussianBlur stdDeviation="4"/></filter>
            </defs>
            <g class="cover-beams" filter="url(#coverSoft)">{beams}</g>
            <g class="cover-code" mask="url(#coverMask)">
            {texture}
            </g>
          </svg>
          <div class="scene-layer layer-back" aria-hidden="true">
            {j.join(layers["back"])}
          </div>
          <div class="scene-layer layer-mid" aria-hidden="true">
            {j.join(layers["mid"])}
          </div>
          <picture>
            <source srcset="public/logo.webp" type="image/webp">
            <img class="cover-prism" src="public/logo.png" width="{LOGO_W}" height="{LOGO_H}" fetchpriority="high"
              style="left:{pct(PRISM_X, SCENE_W)};top:{pct(PRISM_Y, SCENE_H)};width:{pct(PRISM_W, SCENE_W)}"
              alt="PrismaCoder logo: a glass prism.">
          </picture>
          <div class="scene-layer layer-front">
            {j.join(layers["front"])}
          </div>
        </div>
      </figure>
      {END}"""


def main():
    (OUT / "icons").mkdir(parents=True, exist_ok=True)
    for f in OUT.glob("*.webp"):               # drop renders no longer in ITEMS
        f.unlink()
    for f in (OUT / "icons").glob("*.png"):
        f.unlink()
    sizes = {}
    for it in ITEMS:
        if it.get("kind") != "code":
            sizes[it["slug"]] = build_thumb(it)
        if it.get("icon"):
            build_icon(it["icon"])
    html = INDEX.read_text()
    markup = build_markup(sizes)
    html, n = re.subn(re.escape(START) + r".*?" + re.escape(END), lambda m: markup, html, flags=re.S)
    assert n == 1, "cover markers not found in index.html"
    INDEX.write_text(html)
    size = sum(f.stat().st_size for f in OUT.rglob("*") if f.is_file())
    counts = {l: sum(1 for i in ITEMS if i["layer"] == l) for l in ("back", "mid", "front")}
    print(f"  cover: {counts}, assets {size / 1024:.0f} KB in public/cover/")


if __name__ == "__main__":
    main()
