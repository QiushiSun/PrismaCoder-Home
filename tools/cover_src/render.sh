#!/usr/bin/env bash
# Regenerate the cover renders made for the homepage; the other renders come from the
# paper tree. Output goes to renders/ (gitignored), which build_cover.py reads.
#   webui.png        webui_dashboard.html, 1440 x 900 at 2x (headless Chrome)
#   kanban.png       kanban.html, 1440 x 720 at 2x (headless Chrome)
#   rose.png         make_rose.py -> rose.svg, 600 x 600 at 2x (headless Chrome)
#   plot3d.png       plot3d.py (matplotlib)
#   transformer.png  transformer.py (Manim, last frame)
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p renders
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
shot() {
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=2 \
    --window-size="$2" --virtual-time-budget=5000 --screenshot="renders/$3" "file://$PWD/$1" 2>/dev/null
}
shot webui_dashboard.html 1440,900 webui.png
shot kanban.html 1440,720 kanban.png
python3 make_rose.py rose.svg && shot rose.svg 600,600 rose.png
python3 plot3d.py renders/plot3d.png
MEDIA="$(mktemp -d)"
manim -qh -s --disable_caching --media_dir "$MEDIA" transformer.py TransformerBlock >/dev/null 2>&1
cp "$MEDIA"/images/transformer/TransformerBlock*.png renders/transformer.png
rm -rf "$MEDIA"
ls -la renders
