#!/usr/bin/env bash
# Regenerate the cover-only renders; the others (including the dashboard, 3D surface and
# Manim transformer shared with Figure 1) come from the paper tree's overview_src/thumbs/.
# Output goes to renders/ (gitignored), which build_cover.py reads.
#   kanban.png       kanban.html, 1440 x 720 at 2x (headless Chrome)
#   rose.png         make_rose.py -> rose.svg, 600 x 600 at 2x (headless Chrome)
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p renders
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
shot() {
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=2 \
    --window-size="$2" --virtual-time-budget=5000 --screenshot="renders/$3" "file://$PWD/$1" 2>/dev/null
}
shot kanban.html 1440,720 kanban.png
python3 make_rose.py rose.svg && shot rose.svg 600,600 rose.png
ls -la renders
