/* ==========================================================================
   PrismaCoder — page behaviour
   Theme toggle, starfield, nav, reveal-on-scroll and copy-to-clipboard.
   ========================================================================== */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------- 0. theme
     The initial value is set by the inline boot script in <head> so the page
     never flashes the wrong theme. This only handles the toggle afterwards. */
  function theme() {
    var btn = document.getElementById("themeToggle");
    var root = document.documentElement;

    function label() {
      var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      if (btn) btn.setAttribute("aria-label", "Switch to " + next + " theme");
    }
    label();

    if (!btn) return;
    btn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("prismacoder-theme", next); } catch (e) { /* private mode */ }
      label();
      window.dispatchEvent(new CustomEvent("prismacoder:theme", { detail: next }));
    });
  }

  /* ---------------------------------------------------------- 1. starfield
     A slow drift of small stars, a few tinted violet or cyan like the prism.
     Paused when the tab is
     hidden or the light theme is on, and drawn once under reduced motion. */
  function starfield() {
    var cv = document.getElementById("starfield");
    if (!cv) return;
    var ctx = cv.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var stars = [], w = 0, h = 0, raf = null, t = 0;

    function build() {
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(240, (w * h) / 7000));
      stars = [];
      for (var i = 0; i < n; i++) {
        var tint = Math.random() < 0.22 ? (Math.random() < 0.55 ? "184, 178, 255" : "150, 218, 245") : null;
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * (tint ? 1.5 : 1.1) + 0.25,
          a: Math.random() * 0.55 + 0.12,
          tw: Math.random() * 0.9 + 0.25,
          ph: Math.random() * Math.PI * 2,
          vy: (Math.random() * 0.05 + 0.012),
          tint: tint
        });
      }
    }

    function drawStatic() {
      ctx.clearRect(0, 0, w, h);
      stars.forEach(function (s) {
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.2832);
        ctx.fillStyle = "rgba(" + (s.tint || "214, 222, 250") + (s.tint ? ", .4)" : ", .32)");
        ctx.fill();
      });
    }

    function frame() {
      t += 0.0125;
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        s.y -= s.vy;
        if (s.y < -2) { s.y = h + 2; s.x = Math.random() * w; }
        var a = s.a * (0.62 + 0.38 * Math.sin(t * s.tw + s.ph));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, 6.2832);
        ctx.fillStyle = s.tint
          ? "rgba(" + s.tint + ", " + a.toFixed(3) + ")"
          : "rgba(214, 222, 250, " + (a * 0.85).toFixed(3) + ")";
        ctx.fill();
        if (s.tint && s.r > 1.05) {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * 3.4, 0, 6.2832);
          ctx.fillStyle = "rgba(" + s.tint + ", " + (a * 0.07).toFixed(3) + ")";
          ctx.fill();
        }
      }
      raf = requestAnimationFrame(frame);
    }

    function lightTheme() { return document.documentElement.getAttribute("data-theme") === "light"; }
    function stop() { if (raf) { cancelAnimationFrame(raf); raf = null; } }
    /* The canvas is display:none in the light theme, so a page that loads light
       measures 0x0 and builds no stars. Rebuild whenever the size is stale. */
    function start() {
      if (lightTheme()) return;
      if (w !== cv.clientWidth || h !== cv.clientHeight || !stars.length) build();
      if (reduced) { drawStatic(); return; }
      if (!raf) frame();
    }

    start();
    document.addEventListener("visibilitychange", function () {
      document.hidden ? stop() : start();
    });
    window.addEventListener("prismacoder:theme", function () {
      lightTheme() ? stop() : start();
    });
    var rt;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        if (lightTheme()) return;
        build();
        if (reduced) drawStatic();
      }, 180);
    });
  }

  /* ---------------------------------------------------------------- 2. nav */
  function nav() {
    var el = document.getElementById("nav");
    var toggle = document.getElementById("navToggle");
    var links = document.getElementById("navLinks");
    if (!el) return;

    function onScroll() { el.classList.toggle("stuck", window.scrollY > 40); }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    function closeMenu() {
      if (!links || !toggle) return;
      links.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
    if (toggle && links) {
      toggle.addEventListener("click", function (e) {
        e.stopPropagation();
        var open = links.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(open));
      });
      links.addEventListener("click", function (e) {
        if (e.target.closest("a")) closeMenu();
      });
      document.addEventListener("click", function (e) {
        if (!links.contains(e.target)) closeMenu();
      });
    }

    /* "More research" dropdown: click to open, click-away or Escape to close */
    var more = document.getElementById("navMore");
    var setOpen = function () {};
    if (more) {
      var moreBtn = more.querySelector("button");
      setOpen = function (v) {
        more.setAttribute("data-open", String(v));
        moreBtn.setAttribute("aria-expanded", String(v));
      };
      moreBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        setOpen(more.getAttribute("data-open") !== "true");
      });
      document.addEventListener("click", function (e) {
        if (!more.contains(e.target)) setOpen(false);
      });
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { setOpen(false); closeMenu(); }
    });

    /* Highlight the section in view. The list comes from the nav itself, so a
       new section only needs a nav link and a matching id. */
    var map = {};
    Array.prototype.forEach.call(document.querySelectorAll('.nav-links > li > a[href^="#"]'), function (a) {
      var id = a.getAttribute("href").slice(1);
      var s = document.getElementById(id);
      if (s) map[id] = { a: a, s: s };
    });
    if (!("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var m = map[en.target.id];
        if (m && en.isIntersecting) {
          Object.keys(map).forEach(function (k) { map[k].a.classList.remove("active"); });
          m.a.classList.add("active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(map).forEach(function (k) { io.observe(map[k].s); });
  }

  /* ------------------------------------------------------------ 3. reveal */
  function reveal() {
    var items = document.querySelectorAll(".rise");
    if (!("IntersectionObserver" in window) || reduced) {
      Array.prototype.forEach.call(items, function (n) { n.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
    Array.prototype.forEach.call(items, function (n) { io.observe(n); });
  }

  /* -------------------------------------------------------------- 4. copy */
  function copyBib() {
    var btn = document.getElementById("copyBib");
    var pre = document.getElementById("bibtex");
    if (!btn || !pre) return;
    btn.addEventListener("click", function () {
      var text = pre.textContent;
      var done = function () {
        btn.classList.add("done");
        btn.querySelector("span").textContent = "Copied";
        setTimeout(function () {
          btn.classList.remove("done");
          btn.querySelector("span").textContent = "Copy";
        }, 1800);
      };
      var legacy = function () {
        var ta = document.createElement("textarea");
        ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); done(); } catch (e) { /* noop */ }
        document.body.removeChild(ta);
      };
      if (navigator.clipboard && window.isSecureContext) {
        /* the async API rejects without transient user activation or when the
           permission is denied — fall back rather than fail silently */
        navigator.clipboard.writeText(text).then(done, legacy);
      } else {
        legacy();
      }
    });
  }

  /* ------------------------------------------------------------- 5. cover
     Depth for the hero cover: the pointer position over the hero, as --mx and
     --my in [-1, 1], moves each scene layer by its own amount (main.css). Off
     under reduced motion and on touch screens. */
  function cover() {
    var scene = document.querySelector(".cover-scene");
    var hero = document.querySelector(".hero");
    if (!scene || !hero || reduced || !window.matchMedia("(pointer: fine)").matches) return;
    var raf = null, mx = 0, my = 0;
    function apply() {
      scene.style.setProperty("--mx", mx.toFixed(3));
      scene.style.setProperty("--my", my.toFixed(3));
      raf = null;
    }
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      mx = Math.max(-1, Math.min(1, (e.clientX - r.left) / r.width * 2 - 1));
      my = Math.max(-1, Math.min(1, (e.clientY - r.top) / r.height * 2 - 1));
      if (!raf) raf = requestAnimationFrame(apply);
    });
    hero.addEventListener("pointerleave", function () {
      mx = 0; my = 0;
      if (!raf) raf = requestAnimationFrame(apply);
    });
  }

  /* --------------------------------------------------------------- 6. init
     Reveal runs first: .rise blocks stay hidden until it does, so a failure in
     any later step must not leave the page blank. */
  function init() {
    [reveal, theme, starfield, nav, copyBib, cover].forEach(function (step) {
      try { step(); } catch (e) { if (window.console) console.error(e); }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
