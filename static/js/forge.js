/* ==========================================================================
   PrismaForge walkthrough (#forge)
   A map of the pipeline's three bands (curation, rubric synthesis, RL) with
   the paper's own icons, wired by an SVG layer, and a panel that walks one
   real example through it step by step. Nodes, steps and the example come
   from PrismaData.forge (prismacoder-data.js); the markup of the map is
   generated here so the section reads as a static list without scripts.
   ========================================================================== */
(function () {
  "use strict";

  var root = document.getElementById("forge");
  var D = window.PrismaData && window.PrismaData.forge;
  if (!root || !D) return;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ex = D.example;

  /* ---------------------------------------------------------------- map */
  var map = root.querySelector(".forge-map");
  /* the map keeps its 560 px minimum; on a narrow stage it scrolls sideways inside this wrapper */
  var scroller = document.createElement("div");
  scroller.className = "forge-map-scroll";
  map.parentNode.insertBefore(scroller, map);
  scroller.appendChild(map);
  var bandEls = {};
  D.bands.forEach(function (band) {
    var el = document.createElement("div");
    el.className = "forge-band";
    el.style.setProperty("--band", band.color);
    el.innerHTML = '<span class="forge-band-name">' + band.name + "</span>";
    var row = document.createElement("div");
    row.className = "forge-row";
    band.nodes.forEach(function (n) {
      var node = document.createElement("div");
      node.className = "forge-node";
      node.id = "fn-" + n.id;
      node.setAttribute("data-step", n.step);
      node.style.setProperty("--col", n.col);
      if (n.span) node.style.setProperty("--span", n.span);
      if (n.wide) node.classList.add("wide");
      node.innerHTML =
        '<span class="forge-ico">' + (window.PrismaForgeIcons[n.icon] || "") + "</span>" +
        "<b>" + n.name + "</b>" +
        (n.note ? "<small>" + n.note + "</small>" : "");
      node.addEventListener("click", function () { go(n.step, true); });
      row.appendChild(node);
    });
    el.appendChild(row);
    map.appendChild(el);
    bandEls[band.id] = el;
  });

  var wires = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  wires.setAttribute("class", "forge-wires");
  wires.setAttribute("aria-hidden", "true");
  map.appendChild(wires);

  function center(id, side) {
    var r = document.getElementById("fn-" + id).getBoundingClientRect();
    var m = map.getBoundingClientRect();
    var x = r.left - m.left, y = r.top - m.top;
    if (side === "right") return [x + r.width, y + r.height / 2];
    if (side === "left") return [x, y + r.height / 2];
    if (side === "top") return [x + r.width / 2, y];
    if (side === "bottom") return [x + r.width / 2, y + r.height];
    return [x + r.width / 2, y + r.height / 2];
  }

  function drawWires() {
    var m = map.getBoundingClientRect();
    wires.setAttribute("viewBox", "0 0 " + m.width + " " + m.height);
    wires.setAttribute("width", m.width);
    wires.setAttribute("height", m.height);
    wires.innerHTML =
      '<defs><marker id="forgeArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">' +
      '<path d="M0 0 L10 5 L0 10 Z" fill="currentColor"/></marker></defs>';
    D.wires.forEach(function (w) {
      var a = center(w.from, w.fromSide || "right");
      var b = center(w.to, w.toSide || "left");
      var d;
      if (w.route === "down" || w.route === "up") {
        var my = (a[1] + b[1]) / 2;
        d = "M" + a[0] + " " + a[1] + " C" + a[0] + " " + my + "," + b[0] + " " + my + "," + b[0] + " " + b[1];
      } else if (w.route === "loop") {
        var ty = Math.min(a[1], b[1]) - 30;
        d = "M" + a[0] + " " + a[1] + " L" + a[0] + " " + ty + " L" + b[0] + " " + ty + " L" + b[0] + " " + b[1];
      } else {
        var mx = (a[0] + b[0]) / 2;
        d = "M" + a[0] + " " + a[1] + " C" + mx + " " + a[1] + "," + mx + " " + b[1] + "," + b[0] + " " + b[1];
      }
      var p = document.createElementNS("http://www.w3.org/2000/svg", "path");
      p.setAttribute("d", d);
      p.setAttribute("class", "forge-wire" + (w.dashed ? " dashed" : ""));
      p.setAttribute("data-steps", w.steps.join(" "));
      p.setAttribute("marker-end", "url(#forgeArrow)");
      wires.appendChild(p);
      if (w.label) {
        var t = document.createElementNS("http://www.w3.org/2000/svg", "text");
        var lx = w.labelAt ? w.labelAt[0] : (a[0] + b[0]) / 2, ly = w.labelAt ? w.labelAt[1] : (a[1] + b[1]) / 2;
        if (w.route === "loop") { lx = (a[0] + b[0]) / 2; ly = Math.min(a[1], b[1]) - 36; }
        if (w.route === "down" || w.route === "up") { lx += 8; }
        t.setAttribute("x", lx); t.setAttribute("y", ly);
        t.setAttribute("class", "forge-wire-label");
        t.setAttribute("data-steps", w.steps.join(" "));
        t.textContent = w.label;
        wires.appendChild(t);
      }
    });
    light();
  }

  /* -------------------------------------------------------------- panel */
  var panel = root.querySelector(".forge-panel");
  var dots = root.querySelector(".forge-dots");
  var count = root.querySelector(".forge-count");
  var stepsList = document.querySelectorAll(".forge-steps li");
  var cur = 0, timer = null;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function dimensionBox() {
    function col(name, dim, cls) {
      return '<div class="dim ' + cls + '"><b>' + name + "</b>" +
        '<span class="dim-tier">shared across the domain</span><ul>' + dim.shared.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>" +
        '<span class="dim-tier">specific to this instruction</span><ul>' + dim.specific.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div>";
    }
    return '<div class="dims">' + col("Code rubric dimensions", ex.dimensions.code, "code") + col("Visual rubric dimensions", ex.dimensions.visual, "visual") + "</div>" +
      '<p class="fp-note">Weights: ' + ex.weightBands.map(function (b) { return b[0] + " " + b[1]; }).join(", ") +
      ". The item budget follows the instruction's difficulty level.</p>";
  }

  function rubricTable(withChecks) {
    function list(level) {
      var items = ex.rubric.filter(function (it) { return it.level === level; });
      return "<ul>" + items.map(function (it) {
        var mark = withChecks ? '<i class="' + (it.pass ? "ok" : "bad") + '">' + (it.pass ? "✓" : "✗") + "</i>" : "";
        var ev = withChecks ? "<small>" + esc(it.evidence) + "</small>" : "";
        return "<li>" + mark + "<span>" + esc(it.text) + ev + "</span><em>w " + it.weight.toFixed(1) + "</em></li>";
      }).join("") + "</ul>";
    }
    return '<div class="rubric-grid">' +
      '<div class="rg-head code">Code criteria, checked on the HTML/CSS</div><div class="rg-head visual">Visual criteria, checked on the render</div>' +
      '<div class="rg-cell code">' + list("code") + '</div><div class="rg-cell visual">' + list("visual") + "</div></div>";
  }

  function scoreBars() {
    var s = ex.scores;
    function bar(label, v, cls) {
      return '<div class="score"><span>' + label + '</span><div class="score-track"><i class="' + cls + '" style="width:' + (v * 100).toFixed(1) + '%"></i></div><b>' + v.toFixed(2) + "</b></div>";
    }
    return '<div class="scores">' + bar("code score", s.code, "code") + bar("visual score", s.visual, "visual") + "</div>" +
      '<p class="fp-note">The two scores are combined with a weight per task family into the sample score. A single holistic judgment gave this page ' +
      ex.holistic.score + ", above about " + ex.holistic.percentile + " of samples; the visual rubric scores it " + s.visual.toFixed(2) +
      " and names the cause: the footer overlaps the Services section.</p>";
  }

  function routingBand() {
    /* the thresholds are symbolic: the paper states the rule, not the values */
    return '<div class="route"><div class="route-band">' +
      '<span class="r-low" style="width:30%">S &lt; τ₁: discard</span>' +
      '<span class="r-mid" style="width:35%">τ₁ ≤ S &lt; τ₂: re-synthesize</span>' +
      '<span class="r-high" style="width:35%">S ≥ τ₂: retain</span></div>' +
      '<div class="route-ticks"><span style="left:30%">τ₁</span><span style="left:65%">τ₂</span></div></div>';
  }

  /* illustrative values for the reward and advantage panels: eight rollouts of one group */
  var GROUP = [0.82, 0.31, 0.64, 0.0, 0.57, 0.91, 0.46, 0.73];

  function rewardCards() {
    return '<div class="rollouts scored">' + GROUP.map(function (r, i) {
      var cls = r === 0 ? "fail" : r >= 0.6 ? "good" : "";
      return '<div class="rollout ' + cls + '"><span>rollout ' + (i + 1) + '</span><i style="--h:' + (r * 100).toFixed(0) + '%"></i><b>' +
        (r === 0 ? "did not render" : "reward " + r.toFixed(2)) + "</b></div>";
    }).join("") + "</div>";
  }

  function advantageCards() {
    var mean = GROUP.reduce(function (a, b) { return a + b; }, 0) / GROUP.length;
    return '<div class="adv"><div class="adv-base"><span>group mean ' + mean.toFixed(2) + "</span></div>" + GROUP.map(function (r, i) {
      var d = r - mean, up = d >= 0;
      return '<div class="adv-col"><i class="' + (up ? "up" : "down") + '" style="--h:' + (Math.abs(d) * 100).toFixed(0) + '%"></i><small>' + (i + 1) + "</small></div>";
    }).join("") + "</div>";
  }

  function rollouts() {
    var k = ex.K;
    var html = '<div class="rollouts">';
    for (var i = 1; i <= k; i++) html += '<div class="rollout"><span>rollout ' + i + "</span><i></i></div>";
    return html + "</div>";
  }

  var renderers = {
    instruction: function () {
      return '<div class="fp-split"><div><p class="fp-kicker">' + esc(ex.task) + '</p><p class="fp-instr">' + esc(ex.input) + "</p>" +
        '<p class="fp-note">' + esc(D.steps[0].note) + "</p></div>" +
        '<figure class="fp-shot"><img src="' + ex.reference + '" alt="Reference page"><figcaption>the input: reference screenshot</figcaption></figure></div>';
    },
    rubric: function () { return dimensionBox() + rubricTable(false) + '<p class="fp-note">' + esc(D.steps[1].note) + "</p>"; },
    candidate: function () {
      return '<div class="fp-split"><div><p class="fp-note">' + esc(D.steps[2].note) + "</p></div>" +
        '<figure class="fp-shot"><img src="' + ex.candidate + '" alt="Synthesized page"><figcaption>candidate, executed and rendered</figcaption></figure></div>';
    },
    judge: function () { return rubricTable(true) + scoreBars() + '<p class="fp-note">' + esc(D.steps[3].note) + "</p>"; },
    routing: function () { return routingBand() + '<p class="fp-note">' + esc(D.steps[4].note) + "</p>"; },
    rollouts: function () { return rollouts() + '<p class="fp-note">' + esc(D.steps[5].note).replace("K rollouts", "K = " + ex.K + " rollouts") + "</p>"; },
    reward: function () { return rewardCards() + '<p class="fp-note">' + esc(D.steps[6].note) + "</p>"; },
    advantage: function () { return advantageCards() + '<p class="fp-note">' + esc(D.steps[7].note) + "</p>"; }
  };

  function light() {
    var s = String(cur + 1);
    Array.prototype.forEach.call(map.querySelectorAll(".forge-node"), function (n) {
      n.classList.toggle("is-on", n.getAttribute("data-step").split(" ").indexOf(s) >= 0);
    });
    Array.prototype.forEach.call(wires.querySelectorAll("[data-steps]"), function (w) {
      w.classList.toggle("is-on", w.getAttribute("data-steps").split(" ").indexOf(s) >= 0);
    });
  }

  function go(i, byUser) {
    cur = (i + D.steps.length) % D.steps.length;
    var st = D.steps[cur];
    panel.innerHTML = '<h4><span class="step-n">' + (cur + 1) + "</span> " + esc(st.title) + "</h4>" + renderers[st.kind]();
    Array.prototype.forEach.call(dots.children, function (d, k) { d.classList.toggle("on", k === cur); });
    Array.prototype.forEach.call(stepsList, function (li, k) { li.classList.toggle("on", k === cur); });
    if (count) count.textContent = (cur + 1) + " / " + D.steps.length;
    light();
    if (byUser) stop();
  }

  /* ----------------------------------------------------------- controls */
  D.steps.forEach(function (_, k) {
    var d = document.createElement("li");
    d.addEventListener("click", function () { go(k, true); });
    dots.appendChild(d);
  });
  Array.prototype.forEach.call(stepsList, function (li, k) {
    li.addEventListener("click", function () { go(k, true); });
  });
  var play = root.querySelector(".forge-play");
  function stop() { if (timer) { clearInterval(timer); timer = null; } if (play) play.setAttribute("aria-pressed", "false"); }
  function start() {
    if (reduced) return;
    stop();
    timer = setInterval(function () { go(cur + 1); }, 3400);
    if (play) play.setAttribute("aria-pressed", "true");
  }
  root.querySelector(".forge-prev").addEventListener("click", function () { go(cur - 1, true); });
  root.querySelector(".forge-next").addEventListener("click", function () { go(cur + 1, true); });
  if (play) play.addEventListener("click", function () { timer ? stop() : start(); });
  root.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") { go(cur + 1, true); e.preventDefault(); }
    if (e.key === "ArrowLeft") { go(cur - 1, true); e.preventDefault(); }
  });

  /* ?forge=N opens the walkthrough at step N (also handy for screenshots) */
  var q = parseInt(new URLSearchParams(location.search).get("forge"), 10);
  go(q >= 1 && q <= D.steps.length ? q - 1 : 0);
  var rt;
  window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(drawWires, 120); });
  /* wires need the icons' final layout */
  if (document.readyState === "complete") drawWires();
  else window.addEventListener("load", drawWires);
})();
