/* ==========================================================================
   Results (#results)
   A lens switch (vision-centric / text-centric), a range chart with one
   headline metric per benchmark (our two models against the best open and
   the best proprietary entry), and the full table folded below. Everything
   is read from PrismaData.results; nothing is typed here.
   ========================================================================== */
(function () {
  "use strict";

  var R = window.PrismaData && window.PrismaData.results;
  var root = document.getElementById("results-stage");
  if (!R || !root) return;

  var chartEl = root.querySelector(".res-chart");
  var tableEl = root.querySelector(".res-table");
  var tip = root.querySelector(".res-tip");
  var lens = "vision";
  var prop = "Claude Opus 4.6";   /* the proprietary model drawn on the radar; the picker changes it */

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function fmt(v) { return v == null ? "–" : (Math.round(v * 10) / 10).toFixed(1); }

  function bestOf(rows, col, pred) {
    var best = null;
    rows.forEach(function (r) {
      if (!pred(r) || r.values[col] == null) return;
      if (!best || r.values[col] > best.v) best = { v: r.values[col], model: r.model };
    });
    return best;
  }

  /* ------------------------------------------------------------- radar
     One axis per benchmark (the headline metric). Our two models are filled
     polygons; the strongest open baseline per axis and the strongest
     proprietary entry per axis are outlines, so the margin over open models
     and the distance to proprietary systems read off the same shape. Axes are
     scaled from the lowest of the four values on that axis, so the differences
     stay visible. */
  function chart() {
    var d = R[lens], rows = d.table.rows, H = d.headline, n = H.length;
    var ours9 = rows.filter(function (r) { return r.ours && /9B/.test(r.model); })[0];
    var ours35 = rows.filter(function (r) { return r.ours && /35B/.test(r.model); })[0];
    var propRow = rows.filter(function (r) { return r.group === "proprietary" && r.model === prop; })[0];
    var series = [
      { key: "open", name: "best open baseline", vals: [], who: [] },
      { key: "prop", name: prop, vals: [], who: [] },
      { key: "9b", name: ours9.model, vals: [], who: [] },
      { key: "35b", name: ours35.model, vals: [], who: [] }
    ];
    var lo = [], hi = [];
    H.forEach(function (h, i) {
      var open = bestOf(rows, h.col, function (r) { return r.group === "open" && !r.ours; });
      series[0].vals[i] = open ? open.v : null; series[0].who[i] = open ? open.model : "";
      series[1].vals[i] = propRow ? propRow.values[h.col] : null; series[1].who[i] = propRow ? propRow.model : "";
      series[2].vals[i] = ours9.values[h.col]; series[2].who[i] = ours9.model;
      series[3].vals[i] = ours35.values[h.col]; series[3].who[i] = ours35.model;
      var vs = series.map(function (s) { return s.vals[i]; }).filter(function (v) { return v != null; });
      var mn = Math.min.apply(null, vs), mx = Math.max.apply(null, vs);
      /* floor a little under the lowest value, ceiling a little over the highest */
      lo[i] = Math.max(0, mn - (mx - mn) * 0.6 - 2);
      hi[i] = Math.min(100, mx + (mx - mn) * 0.12 + 1);
    });

    var W = 720, HGT = 560, cx = W / 2, cy = HGT / 2 + 4, R0 = 196;
    function pt(i, v) {
      var f = (v - lo[i]) / (hi[i] - lo[i]);
      var a = -Math.PI / 2 + i * 2 * Math.PI / n;
      return [cx + Math.cos(a) * R0 * f, cy + Math.sin(a) * R0 * f];
    }
    var s = '<svg viewBox="0 0 ' + W + " " + HGT + '" class="radar" role="img" aria-label="Headline scores per benchmark, radar">';
    /* rings and spokes */
    [0.25, 0.5, 0.75, 1].forEach(function (f) {
      var ring = H.map(function (_, i) { var a = -Math.PI / 2 + i * 2 * Math.PI / n; return (cx + Math.cos(a) * R0 * f) + "," + (cy + Math.sin(a) * R0 * f); }).join(" ");
      s += '<polygon class="rd-ring" points="' + ring + '"/>';
    });
    H.forEach(function (h, i) {
      var a = -Math.PI / 2 + i * 2 * Math.PI / n;
      var ex = cx + Math.cos(a) * R0, ey = cy + Math.sin(a) * R0;
      s += '<line class="rd-spoke" x1="' + cx + '" y1="' + cy + '" x2="' + ex + '" y2="' + ey + '"/>';
      var lx = cx + Math.cos(a) * (R0 + 22), ly = cy + Math.sin(a) * (R0 + 22);
      var anchor = Math.abs(Math.cos(a)) < 0.2 ? "middle" : Math.cos(a) > 0 ? "start" : "end";
      var dy = Math.sin(a) < -0.3 ? -4 : Math.sin(a) > 0.3 ? 14 : 5;
      s += '<text class="rd-label" x="' + lx + '" y="' + (ly + dy - 6) + '" text-anchor="' + anchor + '">' + esc(h.name) + "</text>";
      s += '<text class="rd-sub" x="' + lx + '" y="' + (ly + dy + 7) + '" text-anchor="' + anchor + '">' + esc(h.metric) + "</text>";
    });
    /* polygons: outlines first, fills on top */
    series.forEach(function (sr) {
      var pts = H.map(function (_, i) { var v = sr.vals[i] == null ? lo[i] : sr.vals[i]; return pt(i, v).join(","); }).join(" ");
      s += '<polygon class="rd-poly rd-' + sr.key + '" points="' + pts + '"/>';
    });
    series.forEach(function (sr) {
      H.forEach(function (h, i) {
        if (sr.vals[i] == null) return;
        var p = pt(i, sr.vals[i]);
        s += '<circle class="rd-pt rd-' + sr.key + '" cx="' + p[0] + '" cy="' + p[1] + '" r="' + (sr.key === "35b" ? 4.5 : 3.5) + '" data-name="' + esc(sr.who[i]) + '" data-k="' + esc(sr.key === "open" ? "best open baseline" : sr.key === "prop" ? "proprietary" : "") + '" data-v="' + fmt(sr.vals[i]) + '"/>';
      });
    });
    /* our 35B values at the vertices */
    H.forEach(function (h, i) {
      var v = series[3].vals[i]; if (v == null) return;
      var p = pt(i, v), a = -Math.PI / 2 + i * 2 * Math.PI / n;
      s += '<text class="rd-val" x="' + (p[0] + Math.cos(a) * 11) + '" y="' + (p[1] + Math.sin(a) * 11 + 4) + '" text-anchor="middle">' + fmt(v) + "</text>";
    });
    s += "</svg>";
    chartEl.innerHTML = s;
    Array.prototype.forEach.call(chartEl.querySelectorAll(".rd-pt"), function (p) {
      p.addEventListener("mouseenter", function (e) {
        tip.innerHTML = "<b>" + p.getAttribute("data-name") + "</b>" + (p.getAttribute("data-k") ? "<small>" + p.getAttribute("data-k") + "</small>" : "") + "<span>" + p.getAttribute("data-v") + "</span>";
        tip.classList.add("on");
        move(e);
      });
      p.addEventListener("mousemove", move);
      p.addEventListener("mouseleave", function () { tip.classList.remove("on"); });
    });
  }
  function move(e) {
    var r = root.getBoundingClientRect();
    tip.style.left = (e.clientX - r.left) + "px";
    tip.style.top = (e.clientY - r.top - 12) + "px";
  }

  /* ------------------------------------------------------------- table */
  function table() {
    var d = R[lens].table;
    var groups = [];
    d.columns.forEach(function (c) {
      var g = groups[groups.length - 1];
      if (g && g.name === c.group) g.span++; else groups.push({ name: c.group, span: 1 });
    });
    var h = '<table class="data"><thead><tr class="group"><th></th>' +
      groups.map(function (g) { return '<th colspan="' + g.span + '" scope="colgroup">' + esc(g.name) + "</th>"; }).join("") + "</tr><tr><th scope=\"col\">Model</th>" +
      d.columns.map(function (c) { return '<th scope="col">' + esc(c.metric) + (c.lower ? " ↓" : "") + "</th>"; }).join("") + "</tr></thead><tbody>";
    var lastGroup = null;
    d.rows.forEach(function (r) {
      if (r.group !== lastGroup) {
        h += '<tr class="section"><td colspan="' + (d.columns.length + 1) + '">' + (r.group === "open" ? "Open models" : "Proprietary") + "</td></tr>";
        lastGroup = r.group;
      }
      h += '<tr class="' + (r.ours ? "ours" : "") + '"><td>' + esc(r.model) + "</td>" + r.printed.map(function (v, i) {
        var m = r.marks[i];
        return '<td class="' + (m === "best" ? "best" : m === "second" ? "second" : "") + '">' + esc(v) + "</td>";
      }).join("") + "</tr>";
    });
    h += "</tbody></table>";
    tableEl.innerHTML = h;
  }

  function propPicker() {
    var sel = root.querySelector(".res-prop");
    if (!sel) return;
    var names = R[lens].table.rows.filter(function (r) { return r.group === "proprietary"; }).map(function (r) { return r.model; });
    if (names.indexOf(prop) < 0) prop = names[0];
    sel.innerHTML = names.map(function (n) { return '<option value="' + esc(n) + '"' + (n === prop ? " selected" : "") + ">" + esc(n) + "</option>"; }).join("");
    sel.onchange = function () { prop = sel.value; chart(); };
  }

  function setLens(l) {
    lens = l;
    Array.prototype.forEach.call(root.querySelectorAll(".seg button"), function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-lens") === l));
    });
    Array.prototype.forEach.call(root.querySelectorAll("[data-lens-text]"), function (p) {
      p.hidden = p.getAttribute("data-lens-text") !== l;
    });
    propPicker();
    chart();
    table();
  }
  Array.prototype.forEach.call(root.querySelectorAll(".seg button"), function (b) {
    b.addEventListener("click", function () { setLens(b.getAttribute("data-lens")); });
  });
  /* ?lens=text&table=1 preselects a lens and opens the table (deep links, screenshots) */
  var q = new URLSearchParams(location.search);
  setLens(q.get("lens") === "text" ? "text" : "vision");
  if (q.get("table")) root.querySelector(".fold").open = true;
})();
