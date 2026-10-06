/* ==========================================================================
   Analysis (#analysis): three hand-drawn SVG charts from PrismaData.analysis.
     filter    paired bars, direct judge vs PrismaForge rubric, per benchmark
     backbones stage bars (SFT gain, RL gain) per metric, one backbone at a time
     human     slope lines, direct -> rubric agreement per judge, two statistics
   ========================================================================== */
(function () {
  "use strict";

  var A = window.PrismaData && window.PrismaData.analysis;
  if (!A) return;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function f1(v) { return (Math.round(v * 10) / 10).toFixed(1); }

  /* ------------------------------------------------------------ filter */
  function filter() {
    var el = document.getElementById("chart-filter");
    if (!el) return;
    var rows = A.filter.rows;
    var W = 880, H = 300, L = 40, R = 16, T = 24, B = 54;
    var n = rows.length, slot = (W - L - R) / n, bw = Math.min(26, slot * 0.3);
    var y = function (v) { return T + (H - T - B) * (1 - v / 100); };
    var s = '<svg viewBox="0 0 ' + W + " " + H + '" class="an-chart" role="img" aria-label="Direct judge versus PrismaForge filtering, per benchmark">';
    [0, 25, 50, 75, 100].forEach(function (t) {
      s += '<line class="an-grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + y(t) + '" y2="' + y(t) + '"/>';
      s += '<text class="an-tick" x="' + (L - 6) + '" y="' + (y(t) + 4) + '" text-anchor="end">' + t + "</text>";
    });
    rows.forEach(function (r, i) {
      var cx = L + slot * (i + 0.5);
      var x1 = cx - bw - 3, x2 = cx + 3;
      s += '<rect class="an-bar direct" x="' + x1 + '" y="' + y(r.direct) + '" width="' + bw + '" height="' + (y(0) - y(r.direct)) + '" rx="3"/>';
      s += '<rect class="an-bar rubric ' + r.lens + '" x="' + x2 + '" y="' + y(r.rubric) + '" width="' + bw + '" height="' + (y(0) - y(r.rubric)) + '" rx="3"/>';
      var d = r.rubric - r.direct;
      s += '<text class="an-delta" x="' + (x2 + bw / 2) + '" y="' + (y(r.rubric) - 6) + '" text-anchor="middle">+' + f1(d) + "</text>";
      s += '<text class="an-cat" x="' + cx + '" y="' + (H - B + 18) + '" text-anchor="middle">' + esc(r.benchmark) + "</text>";
      s += '<text class="an-sub" x="' + cx + '" y="' + (H - B + 32) + '" text-anchor="middle">' + (r.lens === "vision" ? "vision-centric" : "text-centric") + "</text>";
    });
    s += "</svg>";
    el.innerHTML = s;
  }

  /* --------------------------------------------------------- backbones */
  function backbones() {
    var el = document.getElementById("chart-backbone");
    var seg = document.getElementById("backbone-seg");
    if (!el || !seg) return;
    var names = Object.keys(A.backbones);
    seg.innerHTML = names.map(function (n, i) {
      return '<button type="button" data-arm="' + esc(n) + '" aria-pressed="' + (i === 0) + '">' + esc(n) + "</button>";
    }).join("");
    function draw(arm) {
      var rows = A.backbones[arm];
      var W = 880, H = 320, L = 40, R = 16, T = 20, B = 74;
      var lo = Math.min(0, Math.min.apply(null, rows.map(function (r) { return Math.min(r.gain_sft, r.gain_sft + r.gain_rl); })));
      var hi = Math.max.apply(null, rows.map(function (r) { return Math.max(r.gain_sft, r.gain_sft + r.gain_rl); }));
      lo = Math.floor(lo / 2) * 2 - 1; hi = Math.ceil(hi / 2) * 2 + 1;
      var y = function (v) { return T + (H - T - B) * (hi - v) / (hi - lo); };
      var n = rows.length, slot = (W - L - R) / n, bw = Math.min(22, slot * 0.36);
      var s = '<svg viewBox="0 0 ' + W + " " + H + '" class="an-chart" role="img" aria-label="Per-stage gains on ' + esc(arm) + '">';
      for (var t = lo + 1; t <= hi; t += 2) {
        s += '<line class="an-grid' + (t === 0 ? " zero" : "") + '" x1="' + L + '" x2="' + (W - R) + '" y1="' + y(t) + '" y2="' + y(t) + '"/>';
        s += '<text class="an-tick" x="' + (L - 6) + '" y="' + (y(t) + 4) + '" text-anchor="end">' + (t > 0 ? "+" : "") + t + "</text>";
      }
      var lastBench = null;
      rows.forEach(function (r, i) {
        var cx = L + slot * (i + 0.5);
        var xs = cx - bw - 2, xr = cx + 2;
        /* SFT gain from zero; RL gain stacked from the SFT level, so the bar top is the total */
        s += '<rect class="an-bar sft" x="' + xs + '" y="' + Math.min(y(0), y(r.gain_sft)) + '" width="' + bw + '" height="' + Math.abs(y(0) - y(r.gain_sft)) + '" rx="2"/>';
        var top = r.gain_sft + r.gain_rl;
        s += '<rect class="an-bar rl" x="' + xr + '" y="' + Math.min(y(r.gain_sft), y(top)) + '" width="' + bw + '" height="' + Math.abs(y(r.gain_sft) - y(top)) + '" rx="2"/>';
        s += '<line class="an-link" x1="' + (xs + bw) + '" x2="' + xr + '" y1="' + y(r.gain_sft) + '" y2="' + y(r.gain_sft) + '"/>';
        s += '<text class="an-delta" x="' + (xr + bw / 2) + '" y="' + (y(Math.max(top, r.gain_sft)) - 5) + '" text-anchor="middle">' + (top >= 0 ? "+" : "") + f1(top) + "</text>";
        s += '<text class="an-sub" x="' + cx + '" y="' + (H - B + 16) + '" text-anchor="middle">' + esc(r.metric) + "</text>";
        if (r.benchmark !== lastBench) {
          var span = rows.filter(function (q) { return q.benchmark === r.benchmark; }).length;
          var x0 = L + slot * i + 4, x1 = L + slot * (i + span) - 4;
          s += '<line class="an-brace" x1="' + x0 + '" x2="' + x1 + '" y1="' + (H - B + 28) + '" y2="' + (H - B + 28) + '"/>';
          s += '<text class="an-cat" x="' + ((x0 + x1) / 2) + '" y="' + (H - B + 44) + '" text-anchor="middle">' + esc(r.benchmark) + "</text>";
          lastBench = r.benchmark;
        }
      });
      s += "</svg>";
      el.innerHTML = s;
    }
    Array.prototype.forEach.call(seg.querySelectorAll("button"), function (b) {
      b.addEventListener("click", function () {
        Array.prototype.forEach.call(seg.querySelectorAll("button"), function (o) { o.setAttribute("aria-pressed", String(o === b)); });
        draw(b.getAttribute("data-arm"));
      });
    });
    draw(names[0]);
  }

  /* ------------------------------------------------------------- human */
  function human() {
    var el = document.getElementById("chart-human");
    if (!el) return;
    var rows = A.human.rows;
    var stats = [["krippendorff_alpha", "Krippendorff’s α", "absolute agreement"], ["kendall_tau_b", "Kendall’s τᵇ", "pairwise ordering"]];
    var W = 880, H = 300, T = 30, B = 36, half = W / 2, padL = 70, padR = 150;
    var y = function (v) { return T + (H - T - B) * (1 - v); };
    var s = '<svg viewBox="0 0 ' + W + " " + H + '" class="an-chart" role="img" aria-label="Judge agreement with humans, direct versus rubric">';
    stats.forEach(function (st, k) {
      var x0 = k * half + padL, x1 = (k + 1) * half - padR;
      s += '<text class="an-cat" x="' + ((x0 + x1) / 2) + '" y="' + (T - 14) + '" text-anchor="middle">' + st[1] + ' <tspan class="an-sub">' + st[2] + "</tspan></text>";
      [0, 0.25, 0.5, 0.75, 1].forEach(function (t) {
        s += '<line class="an-grid" x1="' + x0 + '" x2="' + x1 + '" y1="' + y(t) + '" y2="' + y(t) + '"/>';
        if (k === 0) s += '<text class="an-tick" x="' + (x0 - 8) + '" y="' + (y(t) + 4) + '" text-anchor="end">' + t.toFixed(2) + "</text>";
      });
      s += '<text class="an-sub" x="' + x0 + '" y="' + (H - 8) + '" text-anchor="middle">direct scoring</text>';
      s += '<text class="an-sub" x="' + x1 + '" y="' + (H - 8) + '" text-anchor="middle">PrismaForge rubric</text>';
      /* labels on each side, pushed apart so close values stay legible */
      function spread(vals) {
        var order = vals.map(function (v, i) { return { v: v, i: i }; }).sort(function (p, q) { return q.v - p.v; });
        var ys = [], last = -1e9;
        order.forEach(function (o) { var yy = Math.max(y(o.v), last + 14); ys[o.i] = yy; last = yy; });
        return ys;
      }
      var la = spread(rows.map(function (r) { return r.direct[st[0]]; }));
      var lb = spread(rows.map(function (r) { return r.rubric[st[0]]; }));
      rows.forEach(function (r, i) {
        var a = r.direct[st[0]], b = r.rubric[st[0]];
        s += '<line class="an-slope j' + i + '" x1="' + x0 + '" y1="' + y(a) + '" x2="' + x1 + '" y2="' + y(b) + '"/>';
        s += '<circle class="an-dot j' + i + '" cx="' + x0 + '" cy="' + y(a) + '" r="5"/>';
        s += '<circle class="an-dot j' + i + '" cx="' + x1 + '" cy="' + y(b) + '" r="5"/>';
        s += '<text class="an-val" x="' + (x0 - 10) + '" y="' + (la[i] + 4) + '" text-anchor="end">' + a.toFixed(2) + "</text>";
        s += '<text class="an-val" x="' + (x1 + 10) + '" y="' + (lb[i] + 4) + '">' + b.toFixed(2) + (k === 1 ? "" : " " + esc(r.judge)) + "</text>";
      });
    });
    s += "</svg>";
    el.innerHTML = s;
  }

  filter();
  backbones();
  human();
})();
