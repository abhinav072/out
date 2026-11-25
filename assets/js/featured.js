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

  // Introduction: set small photos into the sentence (after the 1st and 3rd words and at the end),
  // then open them up when the section comes into view. Not while editing, so the text stays plain.
  var hello = document.querySelector(".hello"), lead = hello && hello.querySelector(".hello-lead");
  if (lead && !editing) {
    var urls = []; try { urls = JSON.parse(lead.getAttribute("data-pills") || "[]"); } catch (e) {}
    var words = lead.textContent.trim().split(/\s+/), at = [0, 2, words.length - 1], k = 0;
    if (urls.length && words.length > 3) {
      lead.textContent = "";
      words.forEach(function (w, i) {
        lead.appendChild(document.createTextNode((i ? " " : "") + w));
        if (at.indexOf(i) > -1 && urls[k]) {
          lead.appendChild(document.createTextNode(" "));
          var p = document.createElement("span"); p.className = "pill"; p.setAttribute("aria-hidden", "true");
          var im = document.createElement("img"); im.src = urls[k++]; im.alt = ""; im.loading = "lazy"; p.appendChild(im); lead.appendChild(p);
        }
      });
    }
    if ("IntersectionObserver" in window && !reduce) {
      var ho = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { hello.classList.add("in"); ho.disconnect(); } }, { threshold: 0.35 });
      ho.observe(hello);
    } else hello.classList.add("in");
  }

  function update() {
    var vh = window.innerHeight;
    pair.forEach(function (f) {
      if (!f.offsetParent) return;
      var fr = f.getBoundingClientRect(), mid = fr.top + fr.height / 2 - vh / 2;
      f.style.transform = reduce ? "" : "translateY(" + (mid * parseFloat(f.dataset.speed)).toFixed(1) + "px)";
    });
  }
  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
})();

/* Review options: switcher (?v=1|2|3), reveal on view, genre list photo change */
(function () {
  "use strict";
  var root = document.documentElement;
  var sw = document.querySelector(".vsw");
  function mark() { var v = root.getAttribute("data-v") || "1"; if (sw) Array.prototype.forEach.call(sw.querySelectorAll("button"), function (b) { b.classList.toggle("on", b.dataset.v === v); }); }
  if (sw) sw.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    root.setAttribute("data-v", b.dataset.v); mark();
    try { var u = new URL(location.href); u.searchParams.set("v", b.dataset.v); history.replaceState(null, "", u); } catch (err) {}
    window.dispatchEvent(new Event("resize"));
  });
  mark();
  var ivs = document.querySelectorAll(".iv");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) e.target.classList.add("in"); }); }, { threshold: 0.25 });
    Array.prototype.forEach.call(ivs, function (s) { io.observe(s); });
  } else Array.prototype.forEach.call(ivs, function (s) { s.classList.add("in"); });
  var g2 = document.querySelector(".gv2");
  if (g2) {
    var links = g2.querySelectorAll("li a"), pics = g2.querySelectorAll(".gv2-frame img");
    function show(i) { Array.prototype.forEach.call(links, function (a, k) { a.classList.toggle("on", k === i); }); Array.prototype.forEach.call(pics, function (p, k) { p.classList.toggle("on", k === i); }); }
    Array.prototype.forEach.call(links, function (a, i) { a.addEventListener("mouseenter", function () { show(i); }); a.addEventListener("focus", function () { show(i); }); });
  }
})();
