/* ==========================================================================
   Case viewer (#cases): a chip per case, then the panels of that case side by
   side with their printed labels, and the paper's caption. Editing cases show
   source and target first. Data: PrismaData.cases.
   ========================================================================== */
(function () {
  "use strict";

  var C = window.PrismaData && window.PrismaData.cases;
  var root = document.getElementById("cases");
  if (!C || !root || !C.length) return;

  var chips = root.querySelector(".case-list");
  var body = root.querySelector(".case-body");
  var count = root.querySelector(".case-count");
  var cur = 0;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  C.forEach(function (c, i) {
    var li = document.createElement("li");
    li.innerHTML = '<button type="button"><b>' + esc(c.title) + "</b><small>" + esc(c.benchmark) + "</small></button>";
    li.querySelector("button").addEventListener("click", function () { show(i); });
    chips.appendChild(li);
  });

  /* every panel is the same framed box; the render sits inside it on white, so
     a 3:1 chart and a 1:1 pie take the same space and the rows stay regular */
  function panel(p) {
    var role = p.role === "ours" ? " is-ours" : p.role === "gold" || p.role === "target" ? " is-gold" : "";
    return '<figure class="case-panel' + role + '">' +
      '<div class="case-img"><img src="' + p.src + '" width="' + p.w + '" height="' + p.h + '" alt="' + esc(p.label) + '" loading="lazy" decoding="async"></div>' +
      "<figcaption>" + esc(p.label) + "</figcaption></figure>";
  }

  function show(i) {
    cur = i;
    var c = C[i];
    Array.prototype.forEach.call(chips.children, function (li, k) { li.querySelector("button").setAttribute("aria-pressed", String(k === i)); });
    var h = '<div class="case-head"><span class="case-kicker">' + esc(c.benchmark) + " · " + esc(c.format) + "</span>";
    if (c.instruction) h += '<p class="case-instr">“' + esc(c.instruction) + "”</p>";
    h += "</div>";
    /* one column count for the whole case, so a second figure row lines up with the first */
    var cols = Math.max.apply(null, c.figures.map(function (f) { return f.panels.length; }));
    c.figures.forEach(function (f) {
      var inputs = f.panels.filter(function (p) { return p.role === "source" || p.role === "target"; });
      var outputs = f.panels.filter(function (p) { return p.role !== "source" && p.role !== "target"; });
      /* an editing case puts source and target in the same row as the outputs: one regular grid */
      var all = inputs.concat(outputs);
      h += '<div class="case-row" style="--cols:' + cols + '">' + all.map(panel).join("") + "</div>";
      h += '<p class="case-caption">' + esc(f.caption) + "</p>";
    });
    body.innerHTML = h;
    if (count) count.textContent = (i + 1) + " / " + C.length;
  }
  function step(d) { show((cur + d + C.length) % C.length); }
  root.querySelector(".case-prev").addEventListener("click", function () { step(-1); });
  root.querySelector(".case-next").addEventListener("click", function () { step(1); });

  /* horizontal swipe on touch screens: 48 px or more, mostly horizontal */
  var sx = null, sy = null;
  body.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  body.addEventListener("touchend", function (e) {
    if (sx == null) return;
    var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1);
    sx = sy = null;
  }, { passive: true });

  root.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") { step(1); e.preventDefault(); }
    if (e.key === "ArrowLeft") { step(-1); e.preventDefault(); }
  });
  var q = parseInt(new URLSearchParams(location.search).get("case"), 10);
  show(q >= 1 && q <= C.length ? q - 1 : 0);
})();
