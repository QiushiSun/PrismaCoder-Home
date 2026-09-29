"""A Nightingale rose (polar area) chart as a standalone SVG: twelve monthly
wedges in spectrum colours, each shaded from its centre outwards.

    python3 make_rose.py rose.svg
"""
import math
import sys

VALUES = [62, 74, 88, 97, 83, 71, 92, 100, 86, 69, 78, 90]      # placeholder data for the mock-up
MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
COLORS = ["#f87171", "#fb923c", "#fbbf24", "#a3e635", "#34d399", "#2dd4bf",
          "#22d3ee", "#38bdf8", "#60a5fa", "#818cf8", "#a78bfa", "#f472b6"]
CX = CY = 300
R0, RMAX = 58, 236
GAP = 2.2                                                          # degrees between wedges


def polar(r, deg):
    a = math.radians(deg - 90)
    return CX + r * math.cos(a), CY + r * math.sin(a)


def wedge(r, a0, a1):
    x0, y0 = polar(R0, a0)
    x1, y1 = polar(r, a0)
    x2, y2 = polar(r, a1)
    x3, y3 = polar(R0, a1)
    return (f"M{x0:.1f} {y0:.1f} L{x1:.1f} {y1:.1f} A{r} {r} 0 0 1 {x2:.1f} {y2:.1f} "
            f"L{x3:.1f} {y3:.1f} A{R0} {R0} 0 0 0 {x0:.1f} {y0:.1f} Z")


out = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">',
       '<rect width="600" height="600" fill="#ffffff"/>', "<defs>"]
for i, c in enumerate(COLORS):
    out.append(f'<radialGradient id="g{i}" gradientUnits="userSpaceOnUse" cx="{CX}" cy="{CY}" r="{RMAX}">'
               f'<stop offset="0.2" stop-color="{c}" stop-opacity="0.35"/>'
               f'<stop offset="1" stop-color="{c}" stop-opacity="0.95"/></radialGradient>')
out.append("</defs>")
for r in (100, 150, 200, 250):
    out.append(f'<circle cx="{CX}" cy="{CY}" r="{r}" fill="none" stroke="#e5e7f0" stroke-width="1" stroke-dasharray="3 5"/>')
for i in range(12):
    x, y = polar(262, i * 30)
    out.append(f'<line x1="{CX}" y1="{CY}" x2="{x:.1f}" y2="{y:.1f}" stroke="#eef0f6" stroke-width="1"/>')
for i, (v, m) in enumerate(zip(VALUES, MONTHS)):
    r = R0 + (RMAX - R0) * v / 100
    a0, a1 = i * 30 + GAP / 2, (i + 1) * 30 - GAP / 2
    out.append(f'<path d="{wedge(r, a0, a1)}" fill="url(#g{i})" stroke="#ffffff" stroke-width="1.5"/>')
    lx, ly = polar(r + 18, i * 30 + 15)
    out.append(f'<text x="{lx:.1f}" y="{ly:.1f}" font-family="Inter, Helvetica, sans-serif" font-size="15" '
               f'font-weight="600" fill="#4b5563" text-anchor="middle" dominant-baseline="middle">{m}</text>')
out.append(f'<circle cx="{CX}" cy="{CY}" r="{R0 - 6}" fill="#ffffff" stroke="#e5e7f0"/>')
out.append(f'<text x="{CX}" y="{CY - 4}" font-family="Inter, Helvetica, sans-serif" font-size="24" font-weight="700" '
           f'fill="#111827" text-anchor="middle">{sum(VALUES) / 10:.1f}k</text>')
out.append(f'<text x="{CX}" y="{CY + 18}" font-family="Inter, Helvetica, sans-serif" font-size="12" fill="#9ca3af" '
           f'text-anchor="middle">per year</text>')
out.append("</svg>")
open(sys.argv[1], "w").write("\n".join(out) + "\n")
