#!/usr/bin/env bash
# Regenerate the two renders the cover makes itself; the others (dashboard, 3D surface,
# Manim transformer) are used as the paper tree's overview_src/thumbs/ ships them.
# Output goes to renders/ (gitignored), which build_cover.py reads.
#   kanban.png       the paper's thumbs/kanban_after.html (shared with Figure 1), rendered
#                    here at the cover's 1440 x 720 at 2x (Figure 1 renders it at another size)
#   rose.png         make_rose.py -> rose.svg, 600 x 600 at 2x (cover only)
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p renders
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
PAPER="${PRISMACODER_PAPER:-$HOME/Desktop/CV-1/PrismaCoder_Paper_and_Slides/paper_techreport/Figures}"
shot() {
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=2 \
    --window-size="$2" --virtual-time-budget=5000 --screenshot="renders/$3" "file://$1" 2>/dev/null
}
shot "$PAPER/overview_src/thumbs/kanban_after.html" 1440,720 kanban.png
python3 make_rose.py rose.svg && shot "$PWD/rose.svg" 600,600 rose.png
ls -la renders
