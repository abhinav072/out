/* Homepage Featured: the first photo grows from a framed print to full screen as you scroll;
   the next two drift up at slightly different speeds. */
(function () {
  "use strict";
  var A = document.getElementById("feat-a");
  if (!A) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var track = A.querySelector(".fa-track"), frame = A.querySelector(".fa-frame"), title = A.querySelector(".fa-title");
  var pair = Array.prototype.slice.call(A.querySelectorAll(".fa-pair figure"));
  if (!track) return;
  function clamp(v) { return Math.max(0, Math.min(1, v)); }
  function ease(t) { return 1 - Math.pow(1 - t, 3); }
  function update() {
    var r = track.getBoundingClientRect(), vh = window.innerHeight, vw = document.documentElement.clientWidth;
    var p = reduce ? 1 : ease(clamp(-r.top / (r.height - vh)));
    var small = vw <= 640 ? 0.86 : 0.56;
    frame.style.width = ((small + (1 - small) * p) * 100) + "vw";
    frame.style.height = (((vw <= 640 ? 0.62 : 0.6) + 0.4 * p) * 100) + "vh";
    frame.style.setProperty("--zoom", String(1.18 - 0.18 * p));
    var tp = clamp((p - 0.55) / 0.3);
    title.style.opacity = String(tp);
    title.style.transform = "translate(-50%, " + ((1 - tp) * 16) + "px)";
    pair.forEach(function (f) {
      var fr = f.getBoundingClientRect(), mid = fr.top + fr.height / 2 - vh / 2;
      f.style.transform = reduce ? "" : "translateY(" + (mid * parseFloat(f.dataset.speed)).toFixed(1) + "px)";
    });
  }
  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
})();
