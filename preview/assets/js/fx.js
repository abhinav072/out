/* Creative touches: river page transitions, scroll river line, viewfinder cursor. */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var NS = "http://www.w3.org/2000/svg";
  function f(v) { return v.toFixed(1); }

  /* ---------- 1. River page transitions: an ink wave with a river edge ---------- */
  var PAGES = { "index.html": "Home", "portfolio.html": "Portfolio", "videography.html": "Videography", "about.html": "About", "contact.html": "Contact" };
  var ORDER = ["index.html", "portfolio.html", "videography.html", "about.html", "contact.html"];
  var rt = document.createElement("div");
  rt.className = "rt";
  rt.setAttribute("aria-hidden", "true");
  rt.innerHTML = '<svg><path class="ink"/><path class="rip r1"/><path class="rip r2"/></svg><div class="rt-lbl"><span class="no"></span><span class="nm"></span></div>';
  document.body.appendChild(rt);
  var svgEl = rt.querySelector("svg"), ink = rt.querySelector(".ink"), r1 = rt.querySelector(".r1"), r2 = rt.querySelector(".r2");
  var lblNo = rt.querySelector(".no"), lblNm = rt.querySelector(".nm");
  function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  // the wave's leading edge: a meandering river line, slightly tilted
  function edge(base, p, off, W, H) {
    var A = Math.min(W * 0.05, 56), pts = [], N = 28;
    for (var i = 0; i <= N; i++) {
      var y = -20 + (H + 40) * i / N, u = y / H;
      var x = base + off + A * Math.sin(u * Math.PI * 2.1 + p * 3.2) + A * 0.45 * Math.sin(u * Math.PI * 5.3 - p * 4.4) + (u - 0.5) * W * 0.07;
      pts.push([x, y]);
    }
    return pts;
  }
  function toPath(pts) { return "M" + pts.map(function (q) { return f(q[0]) + " " + f(q[1]); }).join(" L"); }
  // mode "in": ink fills everything LEFT of the edge (covers); mode "out": ink fills RIGHT of the edge (reveals)
  function frame(mode, p) {
    var W = window.innerWidth, H = window.innerHeight;
    svgEl.setAttribute("viewBox", "0 0 " + W + " " + H);
    var base = -W * 0.2 + W * 1.45 * ease(p);
    var e = edge(base, p, 0, W, H);
    var d = toPath(e);
    if (mode === "in") d += " L -40 " + f(H + 40) + " L -40 -40 Z";
    else d += " L " + f(W + 40) + " " + f(H + 40) + " L " + f(W + 40) + " -40 Z";
    ink.setAttribute("d", d);
    r1.setAttribute("d", toPath(edge(base, p, 18, W, H)));
    r2.setAttribute("d", toPath(edge(base, p, 38, W, H)));
  }
  function run(mode, dur, done) {
    var t0 = performance.now();
    (function step(now) {
      var p = Math.min(1, (now - t0) / dur);
      frame(mode, p);
      if (p < 1) requestAnimationFrame(step); else if (done) done();
    })(t0);
  }
  function label(file) {
    var k = ORDER.indexOf(file);
    lblNo.textContent = "";   // page name only, no number
    lblNm.textContent = PAGES[file] || "";
  }
  function fileOf(u) { return u.pathname.split("/").pop() || "index.html"; }

  // arriving: the head script already painted the cover with the page name (same spot as before the
  // page changed), so the name shows once and stays steady — then the cover fades away
  var root = document.documentElement;
  if (root.classList.contains("rt-arrive")) {
    setTimeout(function () {
      root.classList.add("rt-go");
      setTimeout(function () { root.classList.remove("rt-arrive", "rt-go"); root.style.removeProperty("--rt-name"); }, 700);
    }, 420);
  }
  window.addEventListener("pageshow", function (e) { if (e.persisted) rt.className = "rt"; });

  document.addEventListener("click", function (e) {
    var a = e.target.closest("a");
    if (!a || reduce || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (a.target === "_blank" || a.hasAttribute("download")) return;
    var href = a.getAttribute("href") || "";
    if (!href || href.charAt(0) === "#" || /^(mailto:|tel:|https?:)/i.test(href)) return;
    var url = new URL(href, location.href);
    if (url.pathname === location.pathname && url.search === location.search) return;
    e.preventDefault();
    label(fileOf(url));
    rt.className = "rt cover";
    try { sessionStorage.setItem("rt", "1"); sessionStorage.setItem("rtName", PAGES[fileOf(url)] || ""); } catch (err) {}
    run("in", 900, function () {
      rt.classList.add("show-lbl");
      setTimeout(function () { location.href = url.href; }, 420);
    });
  });

  /* ---------- 2. Scroll river line (long pages, tablet & desktop) ---------- */
  function setupScrollRiver() {
    var doc = document.documentElement;
    if (window.innerWidth < 900 || doc.scrollHeight < window.innerHeight * 1.8) return;
    var box = document.createElement("div");
    box.className = "sr";
    box.setAttribute("aria-hidden", "true");
    document.body.appendChild(box);
    var H = window.innerHeight, x0 = 14, top = 90, bot = H - 40, len = bot - top;
    var d = "M " + x0 + " " + top, segs = 9;
    for (var i = 1; i <= segs; i++) {
      var y = top + len * i / segs, ym = top + len * (i - 0.5) / segs;
      d += " Q " + f(x0 + (i % 2 ? 7 : -7)) + " " + f(ym) + " " + x0 + " " + f(y);
    }
    box.innerHTML = '<svg viewBox="0 0 28 ' + H + '" width="28" height="' + H + '"><path class="bed" d="' + d + '"/><path class="flow" pathLength="1" d="' + d + '"/><g class="marks"></g></svg>';
    var flow = box.querySelector(".flow"), marks = box.querySelector(".marks"), bed = box.querySelector(".bed");
    var total = bed.getTotalLength();
    var secs = Array.prototype.slice.call(document.querySelectorAll(".hsec, .hcta, .vsec, .block, .page-head"));
    var dots = secs.map(function (s) {
      var c = document.createElementNS(NS, "circle");
      c.setAttribute("r", "2.6");
      marks.appendChild(c);
      return { el: s, dot: c };
    });
    function place() {
      var max = doc.scrollHeight - window.innerHeight;
      dots.forEach(function (o) {
        var t = Math.min(1, Math.max(0, (o.el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.4) / max));
        var p = bed.getPointAtLength(total * t);
        o.t = t;
        o.dot.setAttribute("cx", f(p.x)); o.dot.setAttribute("cy", f(p.y));
      });
    }
    function update() {
      var max = doc.scrollHeight - window.innerHeight, t = max > 0 ? window.scrollY / max : 0;
      flow.style.strokeDashoffset = String(1 - t);
      dots.forEach(function (o) { o.dot.classList.toggle("on", t >= o.t - 0.002); });
      box.classList.toggle("show", window.scrollY > 40);
    }
    place(); update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("load", function () { place(); update(); });
  }
  if (document.readyState === "complete") setupScrollRiver(); else window.addEventListener("load", setupScrollRiver);

  /* ---------- Before / after sliders ---------- */
  document.querySelectorAll(".compare").forEach(function (c) {
    var r = c.querySelector("input");
    if (r) r.addEventListener("input", function () { c.style.setProperty("--pos", r.value + "%"); });
  });

  /* ---------- Edit mode: add #edit to any page address ---------- */
  var me = document.currentScript || document.querySelector('script[src$="fx.js"]');
  var editing = location.hash === "#edit";
  try { editing = editing || sessionStorage.getItem("editing") === "1"; } catch (e) {}
  if (editing && me) {
    var s = document.createElement("script");
    s.src = me.src.replace(/fx\.js(\?.*)?$/, "edit.js");
    document.body.appendChild(s);
  }
})();
