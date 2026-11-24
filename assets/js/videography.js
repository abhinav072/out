/* Videography: play films in place; short-form previews loop silently, open full screen with sound. */
(function () {
  "use strict";
  document.querySelectorAll(".player").forEach(function (p) {
    p.querySelector(".play-btn").addEventListener("click", function () {
      var v = document.createElement("video");
      v.src = p.dataset.src; v.controls = true; v.playsInline = true; v.autoplay = true;
      v.poster = p.querySelector("img").src;
      p.innerHTML = ""; p.appendChild(v);
      v.play().catch(function () {});
    });
  });

  var frames = document.querySelectorAll(".short .vframe[data-src]");
  if (!frames.length) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // silent looping preview while a card is on screen (small, low-resolution file)
  if (!reduce && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var f = en.target, v = f.querySelector("video");
        if (en.isIntersecting) {
          if (!v) {
            v = document.createElement("video");
            v.muted = true; v.loop = true; v.playsInline = true; v.setAttribute("muted", ""); v.preload = "metadata";
            v.src = f.dataset.preview;
            f.insertBefore(v, f.firstChild);
            v.addEventListener("playing", function () { f.classList.add("live"); });
          }
          v.play().catch(function () {});
        } else if (v) { v.pause(); }
      });
    }, { threshold: 0.35 });
    frames.forEach(function (f) { io.observe(f); });
  }

  // full screen with sound
  var box = document.getElementById("vlb"), player = box.querySelector("video");
  function close() { player.pause(); player.removeAttribute("src"); player.load(); box.hidden = true; document.body.style.overflow = ""; }
  frames.forEach(function (f) {
    f.setAttribute("role", "button"); f.setAttribute("tabindex", "0");
    function open() {
      box.hidden = false; document.body.style.overflow = "hidden";
      player.src = f.dataset.src; player.play().catch(function () {});
    }
    f.addEventListener("click", open);
    f.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
  });
  box.querySelector(".vlb-x").addEventListener("click", close);
  box.addEventListener("click", function (e) { if (e.target === box) close(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !box.hidden) close(); });
})();
