/* ==========================================================================
   Icons for the PrismaForge map: one set, drawn here as inline SVG on a 24-px
   grid, 1.6-px rounded strokes in currentColor, so they share one style and
   follow the theme. Keys match the `icon` field of PrismaData.forge nodes.
   ========================================================================== */
window.PrismaForgeIcons = (function () {
  var wrap = function (body) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + body + "</svg>";
  };
  return {
    /* a prompt sheet: a page with text lines and a small image mark */
    instruction: wrap('<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4"/><path d="M9 11h6M9 14.5h6"/><rect x="9" y="17" width="6" height="2.6" rx="0.6"/>'),
    /* rubric generator: a checklist being written */
    generator: wrap('<rect x="4" y="3" width="13" height="18" rx="2"/><path d="M7.5 8l1.3 1.3L11 7M7.5 12.5l1.3 1.3L11 11.5M7.5 17l1.3 1.3L11 16"/><path d="M13 8h1.5M13 12.5h1.5M13 17h1.5"/><path d="M21 9l-3.8 3.8-1.4.4.4-1.4L20 8z"/>'),
    /* the rubric itself: two columns of checks */
    rubric: wrap('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M12 4v16"/><path d="M6 9l1.2 1.2L9.3 8M6 14.5l1.2 1.2 2.1-2.2M15 9l1.2 1.2 2.1-2.2M15 14.5l1.2 1.2 2.1-2.2"/>'),
    /* curation model: a sparkle over a code bracket pair */
    curate: wrap('<path d="M8 8l-4 4 4 4M16 8l4 4-4 4"/><path d="M13 4l.9 2.1L16 7l-2.1.9L13 10l-.9-2.1L10 7l2.1-.9z"/>'),
    /* execution: a play mark inside a terminal frame */
    execute: wrap('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 8.5h18"/><path d="M10 11.5l4 2.5-4 2.5z"/>'),
    /* judge: a balance scale */
    judge: wrap('<path d="M12 4v16M6 20h12"/><path d="M4 8h16"/><path d="M7 8l-3 6a3 3 0 0 0 6 0zM17 8l-3 6a3 3 0 0 0 6 0z"/>'),
    /* routing: one input splitting three ways */
    route: wrap('<path d="M3 12h5"/><path d="M8 12c3 0 3-5 6-5h7M8 12h13M8 12c3 0 3 5 6 5h7"/><path d="M19 5l2 2-2 2M19 10l2 2-2 2M19 15l2 2-2 2"/>'),
    /* dataset: a database cylinder */
    data: wrap('<ellipse cx="12" cy="6" rx="7" ry="2.6"/><path d="M5 6v12c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6V6"/><path d="M5 12c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6"/>'),
    /* policy: a die (sampling) */
    policy: wrap('<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="8.5" cy="8.5" r="1" fill="currentColor"/><circle cx="15.5" cy="8.5" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="8.5" cy="15.5" r="1" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1" fill="currentColor"/>'),
    /* advantage: bars around a baseline */
    advantage: wrap('<path d="M3 13h18"/><path d="M6 13V7M10 13v-3M14 13v4M18 13V9"/>'),
    /* policy update: a circular arrow */
    update: wrap('<path d="M20 12a8 8 0 1 1-2.3-5.7"/><path d="M20 4v5h-5"/>')
  };
})();
