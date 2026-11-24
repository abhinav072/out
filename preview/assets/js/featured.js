/* Homepage: the Featured photo opens up as it scrolls into view, the two smaller ones drift;
   the introduction's words darken as you read down. */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var editing = location.hash === "#edit";
  try { editing = editing || sessionStorage.getItem("editing") === "1"; } catch (e) {}

  // Featured: reveal on view
  var sets = Array.prototype.slice.call(document.querySelectorAll("#feat-a .fa-set"));
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.2 });
    sets.forEach(function (s) { io.observe(s); });
  } else sets.forEach(function (s) { s.classList.add("in"); });

  // Featured: parallax on the pair
  var pair = Array.prototype.slice.call(document.querySelectorAll("#feat-a .fa-pair figure"));

  // Introduction: split into words (not while editing, so the text stays plain)
  var words = [];
  var lead = document.querySelector(".hello-lead");
  if (lead && !editing && !reduce) {
    Array.prototype.forEach.call(lead.querySelectorAll("[data-edit]"), function (el) {
      var parts = el.textContent.split(/(\s+)/);
      el.textContent = "";
      parts.forEach(function (p) {
        if (/^\s+$/.test(p) || !p) { el.appendChild(document.createTextNode(p)); return; }
        var s = document.createElement("span"); s.className = "w"; s.textContent = p; el.appendChild(s); words.push(s);
      });
    });
  }

  function update() {
    var vh = window.innerHeight;
    pair.forEach(function (f) {
      if (!f.offsetParent) return;
      var fr = f.getBoundingClientRect(), mid = fr.top + fr.height / 2 - vh / 2;
      f.style.transform = reduce ? "" : "translateY(" + (mid * parseFloat(f.dataset.speed)).toFixed(1) + "px)";
    });
    if (words.length) {
      var r = lead.getBoundingClientRect();
      var p = Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
      var n = Math.round(p * words.length);
      for (var i = 0; i < words.length; i++) words[i].classList.toggle("on", i < n);
    }
  }
  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
})();
