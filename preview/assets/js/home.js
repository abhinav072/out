/* Homepage: filmstrip arrows, genre index. */
(function () {
  "use strict";
  var strip = document.getElementById("strip");
  if (window.renderGenreIndex) renderGenreIndex(document.getElementById("gindex"));
  if (!strip) return;
  var figs = Array.prototype.slice.call(strip.children);

  // phones open on an upright photo, so it fills the screen
  if (window.innerWidth <= 640 && figs.length > 2) {
    var r0 = parseFloat(figs[0].querySelector(".img").style.aspectRatio) || 1;
    var r1 = parseFloat(figs[1].querySelector(".img").style.aspectRatio) || 1;
    if (r0 > 1 && r1 < 1) strip.insertBefore(figs[1], figs[0]);
    figs = Array.prototype.slice.call(strip.children);
    strip.scrollLeft = 0;
    requestAnimationFrame(function () { strip.scrollLeft = 0; });
  }

  function offsets() {
    var pad = parseFloat(getComputedStyle(strip).paddingLeft) || 0;
    return figs.map(function (f) { return f.offsetLeft - strip.offsetLeft - pad; });
  }
  function go(d) {
    var x = strip.scrollLeft, t = offsets(), i = t.findIndex(function (v) { return v > x + 4; });
    if (i < 0) i = t.length;
    var k = Math.max(0, Math.min(t.length - 1, d > 0 ? i : i - 2));
    strip.scrollTo({ left: t[k], behavior: "smooth" });
  }
  document.getElementById("prev").addEventListener("click", function () { go(-1); });
  document.getElementById("next").addEventListener("click", function () { go(1); });
})();
