"""A lit 3D surface (decaying radial ripples around a central peak) with its
contour map projected on the floor. Sized to read at thumbnail scale: no
colour bar, the surface fills the frame.

    python3 plot3d.py renders/plot3d.png
"""
import sys

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.colors import LightSource

x = np.linspace(-6, 6, 420)
X, Y = np.meshgrid(x, x)
R = np.hypot(X, Y)
Z = 3.2 * np.sin(1.45 * R) / (1 + 0.32 * R) + 2.4 * np.exp(-(R / 1.1) ** 2)
Z *= np.exp(-(R / 6.4) ** 6)                  # settle the far corners of the square

cmap = plt.get_cmap("plasma")
shade = LightSource(azdeg=315, altdeg=42).shade(Z, cmap=cmap, vert_exag=0.4, blend_mode="soft")

plt.rcParams.update({"font.family": "serif", "font.serif": ["Palatino", "Palatino Linotype", "DejaVu Serif"]})
fig = plt.figure(figsize=(8, 5.6), dpi=240)
ax = fig.add_subplot(projection="3d", computed_zorder=False)
floor = Z.min() - 3.2
ax.contourf(X, Y, Z, zdir="z", offset=floor, levels=30, cmap=cmap, alpha=0.6, zorder=0)
ax.contour(X, Y, Z, zdir="z", offset=floor, levels=12, colors="white", linewidths=0.4, alpha=0.6, zorder=1)
ax.plot_surface(X, Y, Z, facecolors=shade, rstride=2, cstride=2, linewidth=0, antialiased=True,
                shade=False, zorder=2)
ax.plot_wireframe(X, Y, Z, rstride=24, cstride=24, color="white", linewidth=0.3, alpha=0.35, zorder=3)

ax.set_zlim(floor, Z.max())
ax.view_init(elev=30, azim=-58)
ax.set_box_aspect((1, 1, 0.58), zoom=1.22)
for axis in (ax.xaxis, ax.yaxis, ax.zaxis):
    axis.pane.set_facecolor((0.965, 0.97, 1.0, 1))
    axis.pane.set_edgecolor("#d9dcea")
    axis._axinfo["grid"].update(color="#e1e4f0", linewidth=0.6)
ax.tick_params(pad=-3, colors="#6b7194", labelsize=7)

fig.savefig(sys.argv[1], bbox_inches="tight", pad_inches=0.05, facecolor="white")
