/* Opening: topographic contour lines draw around the monogram, then a white curtain lifts. */
(function () {
  var el = document.getElementById("intro");
  if (!el) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var seen = false;
  try { seen = sessionStorage.getItem("introSeen") === "1"; } catch (e) {}
  if (seen && !/[?&]intro=1/.test(location.search)) { el.remove(); document.documentElement.classList.add("ready"); return; }

  // River map: Sindhu, Yamuna, Ganga and Narmada drawn in the direction they flow,
  // projected around the badge; Prayagraj (25.44° N, 81.85° E) is marked at the Sangam.
  function drawMap() {
  var svg = el.querySelector("svg.lines");
    var W = window.innerWidth, H = window.innerHeight;
    var bb = el.querySelector(".badge").getBoundingClientRect();
    var cx = bb.left + bb.width / 2, cy = bb.top + bb.height / 2;
    var R = bb.width / 2 * 0.98;
    // The badge sits in the open Deccan, south of all four rivers, so they flow around it.
    var LON0 = 78.3, LAT0 = 19.7, K = Math.cos(24 * Math.PI / 180);
    var fit = Math.min(W * 0.9 / 18.6, (cy - 30) / 10);   // show the river system across the screen
    var clear = (R + 100) / 3.2;                           // keep the Narmada well clear of the badge
    var S = Math.max(fit, clear);                          // pixels per degree
    function P(lon, lat) { return [cx + (lon - LON0) * K * S, cy - (lat - LAT0) * S]; }
    function n(v) { return v.toFixed(1); }
    // smooth curve through points (Catmull-Rom → cubic Bézier)
    function curve(ll) {
      var p = ll.map(function (q) { return P(q[0], q[1]); });
      var d = "M" + n(p[0][0]) + " " + n(p[0][1]);
      for (var i = 0; i < p.length - 1; i++) {
        var a = p[i - 1] || p[i], b = p[i], c = p[i + 1], e = p[i + 2] || c;
        d += " C" + n(b[0] + (c[0] - a[0]) / 6) + " " + n(b[1] + (c[1] - a[1]) / 6) + " " +
          n(c[0] - (e[0] - b[0]) / 6) + " " + n(c[1] - (e[1] - b[1]) / 6) + " " + n(c[0]) + " " + n(c[1]);
      }
      return { d: d, end: p[p.length - 1], prev: p[p.length - 2] };
    }
    var RIVERS = [
      { name: "Sindhu", label: [70.0, 27.2], pts: [[81.3, 31.1], [79.6, 32.4], [77.6, 34.1], [75.6, 35.3], [74.5, 35.8], [73.3, 35.0], [72.4, 33.9], [71.6, 32.8], [71.0, 30.6], [70.6, 29.0], [68.9, 27.7], [68.3, 25.4], [67.5, 24.2]] },
      { name: "Yamuna", label: [76.6, 27.9], pts: [[78.45, 31.0], [77.6, 30.4], [77.3, 29.5], [77.25, 28.6], [77.7, 27.5], [78.0, 27.2], [79.0, 26.8], [80.5, 25.9], [81.9, 25.4]] },
      { name: "Ganga", label: [85.6, 26.2], pts: [[78.9, 30.9], [78.3, 30.1], [78.2, 29.9], [78.6, 28.6], [80.3, 26.5], [81.9, 25.4], [83.0, 25.3], [85.1, 25.6], [87.3, 25.3], [87.9, 24.8], [88.5, 23.5], [88.3, 22.6], [88.2, 21.6]] },
      { name: "Narmada", label: [76.0, 23.25], pts: [[81.75, 22.67], [80.6, 23.0], [79.9, 23.15], [78.7, 22.8], [77.7, 22.75], [76.5, 22.25], [75.0, 22.1], [73.9, 21.9], [73.0, 21.7], [72.6, 21.6]] }
    ];
    var out = '<g class="rivers">';
    RIVERS.forEach(function (rv, i) {
      var c = curve(rv.pts);
      out += '<path class="rv rv-' + rv.name.toLowerCase() + '" pathLength="1" style="--i:' + i + '" d="' + c.d + '"/>';
      // (no arrowheads: the drawing direction alone shows the flow)
      var lp = P(rv.label[0], rv.label[1]);
      // on narrow screens, move the label onto a visible stretch of the river, away from the badge
      if (lp[0] < 40 || lp[0] > W - 40 || lp[1] < 20) {
        var best = null, bestD = -1;
        rv.pts.forEach(function (q) {
          var p = P(q[0], q[1]);
          if (p[0] < 50 || p[0] > W - 50 || p[1] < 30 || p[1] > cy - R - 60) return;
          var dd = Math.hypot(p[0] - cx, p[1] - cy);
          if (dd > bestD) { bestD = dd; best = p; }
        });
        if (best) lp = [Math.min(Math.max(best[0], 44), W - 44), best[1] - 14];
      }
      out += '<text class="rv-lbl" style="--i:' + i + '" x="' + n(lp[0]) + '" y="' + n(lp[1]) + '">' + rv.name + "</text>";
    });
    // Prayagraj: home, at the Sangam where the Yamuna meets the Ganga
    var gk = P(81.85, 25.44);
    out += '<g class="place"><circle cx="' + n(gk[0]) + '" cy="' + n(gk[1]) + '" r="3"/><circle class="ring" cx="' + n(gk[0]) + '" cy="' + n(gk[1]) + '" r="8"/>' +
      '<text text-anchor="end" x="' + n(gk[0] - 12) + '" y="' + n(gk[1] + 16) + '">Prayagraj</text></g>';
    out += "</g>";
    // the compass scale lives inside the badge's own box, so it always stays centred on the badge
    var wrap = el.querySelector(".badge-wrap"), badgeEl = el.querySelector(".badge");
    var cs = wrap.querySelector("svg.compass");
    if (!cs) { cs = document.createElementNS("http://www.w3.org/2000/svg", "svg"); cs.setAttribute("class", "compass"); cs.setAttribute("aria-hidden", "true"); wrap.appendChild(cs); }
    var bw = badgeEl.getBoundingClientRect().width, Rb = bw / 2 * 0.98, size = Math.ceil(bw + 120), c0 = size / 2;
    cs.setAttribute("viewBox", "0 0 " + size + " " + size);
    cs.style.width = cs.style.height = size + "px";
    var co = '<g class="g-ticks">', rr = Rb + 14;
    for (var d = 0; d < 360; d += 5) {
      var tt = (d - 90) * Math.PI / 180, big = d % 30 === 0, len = big ? 8 : 3.5;
      co += '<line class="' + (big ? "big" : "") + '" x1="' + n(c0 + Math.cos(tt) * rr) + '" y1="' + n(c0 + Math.sin(tt) * rr) +
        '" x2="' + n(c0 + Math.cos(tt) * (rr + len)) + '" y2="' + n(c0 + Math.sin(tt) * (rr + len)) + '"/>';
    }
    [["N", 0], ["E", 90], ["W", 270]].forEach(function (q) {
      var tc = (q[1] - 90) * Math.PI / 180, rl = rr + 20;
      co += '<text class="g-lbl" x="' + n(c0 + Math.cos(tc) * rl) + '" y="' + n(c0 + Math.sin(tc) * rl) + '">' + q[0] + "</text>";
    });
    cs.innerHTML = co + "</g>";
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.style.setProperty("--cx", n(cx) + "px");
    svg.style.setProperty("--cy", n(cy) + "px");
    svg.innerHTML = out;
  }
  // measure only after fonts have loaded (they change the badge's position), and again on resize
  var ready = (document.fonts && document.fonts.ready) ? Promise.race([document.fonts.ready, new Promise(function (r) { setTimeout(r, 500); })]) : Promise.resolve();
  // play the whole opening faster without changing its choreography
  var SPEED = 1.6;
  function speedUp() { if (document.getAnimations) document.getAnimations().forEach(function (a) { if (a.playbackRate !== SPEED) a.playbackRate = SPEED; }); }
  speedUp();
  ready.then(function () { requestAnimationFrame(function () { drawMap(); requestAnimationFrame(speedUp); }); });
  var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(function () { if (document.getElementById("intro")) { el.classList.add("drawn"); drawMap(); } }, 120); });

  var done = false;
  function finish() {
    if (done) return; done = true;
    try { sessionStorage.setItem("introSeen", "1"); } catch (e) {}
    el.classList.add("out");
    document.documentElement.classList.add("ready");
    setTimeout(function () { el.remove(); }, 1300);
  }
  el.addEventListener("click", finish);
  document.addEventListener("keydown", finish, { once: true });
  setTimeout(finish, reduce ? 1000 : 2500);
})();
