/* Mobile menu: badge + rivers draw first, then the links slide in. */
(function () {
  var btn = document.querySelector(".bar .menu");
  var m = document.getElementById("mnav");
  if (!btn || !m) return;
  var svg = m.querySelector("svg.mlines");
  var SPEED = 2.2;

  var RIVERS = [
    [[81.3, 31.1], [79.6, 32.4], [77.6, 34.1], [75.6, 35.3], [74.5, 35.8], [73.3, 35.0], [72.4, 33.9], [71.6, 32.8], [71.0, 30.6], [70.6, 29.0], [68.9, 27.7], [68.3, 25.4], [67.5, 24.2]],
    [[78.45, 31.0], [77.6, 30.4], [77.3, 29.5], [77.25, 28.6], [77.7, 27.5], [78.0, 27.2], [79.0, 26.8], [80.5, 25.9], [81.9, 25.4]],
    [[78.9, 30.9], [78.3, 30.1], [78.2, 29.9], [78.6, 28.6], [80.3, 26.5], [81.9, 25.4], [83.0, 25.3], [85.1, 25.6], [87.3, 25.3], [87.9, 24.8], [88.5, 23.5], [88.3, 22.6], [88.2, 21.6]],
    [[81.75, 22.67], [80.6, 23.0], [79.9, 23.15], [78.7, 22.8], [77.7, 22.75], [76.5, 22.25], [75.0, 22.1], [73.9, 21.9], [73.0, 21.7], [72.6, 21.6]]
  ];
  // Major mountain ranges (approximate crest lines, lon/lat)
  var RANGES = [
    { h: 12, pts: [[73.5, 35.0], [75.5, 33.8], [77.5, 32.5], [79.5, 30.8], [81.5, 29.6], [84.0, 28.3], [86.5, 27.9], [88.5, 27.6], [91.0, 27.6], [93.5, 28.0], [95.5, 28.6]] }, // Himalaya
    { h: 5, pts: [[72.8, 24.5], [73.8, 25.6], [74.6, 26.6], [75.8, 27.6], [76.9, 28.4]] },                                                                     // Aravalli
    { h: 5, pts: [[74.5, 23.6], [76.5, 23.6], [78.5, 24.0], [80.5, 24.6], [82.5, 24.8]] },                                                                     // Vindhya
    { h: 5, pts: [[74.0, 21.6], [76.0, 21.6], [78.0, 21.9], [80.0, 22.3], [81.5, 22.6]] },                                                                     // Satpura
    { h: 6, pts: [[73.3, 21.0], [73.6, 19.0], [73.8, 17.0], [74.2, 15.0], [75.0, 12.8], [76.0, 11.0], [77.0, 9.0]] },                                         // Western Ghats
    { h: 4, pts: [[86.0, 21.5], [84.0, 19.5], [82.5, 18.0], [81.0, 16.5], [79.5, 14.5], [78.8, 12.8]] }                                                       // Eastern Ghats
  ];
  function drawRivers() {
    var W = window.innerWidth, H = window.innerHeight, K = Math.cos(22 * Math.PI / 180);
    var S = Math.max(H / 30, W / 15), cx = W * 0.5, cy = H * 0.5;   // whole subcontinent, 8°–36° N
    function P(q) { return [cx + (q[0] - 80.5) * K * S, cy - (q[1] - 22) * S]; }
    function f(v) { return v.toFixed(1); }
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    var out = RIVERS.map(function (ll, i) {
      var p = ll.map(P), d = "M" + f(p[0][0]) + " " + f(p[0][1]);
      for (var k = 0; k < p.length - 1; k++) {
        var a = p[k - 1] || p[k], b = p[k], c = p[k + 1], e = p[k + 2] || c;
        d += " C" + f(b[0] + (c[0] - a[0]) / 6) + " " + f(b[1] + (c[1] - a[1]) / 6) + " " + f(c[0] - (e[0] - b[0]) / 6) + " " + f(c[1] - (e[1] - b[1]) / 6) + " " + f(c[0]) + " " + f(c[1]);
      }
      return '<path class="rv" pathLength="1" style="--i:' + i + '" d="' + d + '"/>';
    }).join("");
    // ridge lines: a row of peaks along each range, like relief marks on a map
    var seed = 11;
    function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
    RANGES.forEach(function (rg, i) {
      // separate little peaks (∧) spaced along the crest — the classic relief symbol
      var p = rg.pts.map(P), d = "", gap = 15, carry = 0;
      for (var k = 0; k < p.length - 1; k++) {
        var a = p[k], b = p[k + 1], len = Math.hypot(b[0] - a[0], b[1] - a[1]);
        var ux = (b[0] - a[0]) / len, uy = (b[1] - a[1]) / len;
        for (var t = carry; t < len; t += gap) {
          var x = a[0] + ux * t, y = a[1] + uy * t;
          var hgt = rg.h * (0.6 + rnd() * 0.7), w = hgt * 0.75;
          d += "M" + f(x - w) + " " + f(y) + " L" + f(x) + " " + f(y - hgt) + " L" + f(x + w) + " " + f(y);
        }
        carry = (carry + Math.ceil((len - carry) / gap) * gap) - len;
      }
      if (d) out += '<path class="mt" pathLength="1" style="--i:' + i + '" d="' + d + '"/>';
    });
    svg.innerHTML = out;
  }

  function open() {
    drawRivers();
    m.hidden = false;
    document.body.classList.add("menu-open");
    btn.setAttribute("aria-expanded", "true");
    btn.textContent = "Close";
    requestAnimationFrame(function () {
      m.classList.add("open");
      requestAnimationFrame(function () {
        m.getAnimations({ subtree: true }).forEach(function (a) { a.playbackRate = SPEED; });
      });
    });
  }
  function close() {
    m.classList.remove("open");
    document.body.classList.remove("menu-open");
    btn.setAttribute("aria-expanded", "false");
    btn.textContent = "Menu";
    setTimeout(function () { if (!m.classList.contains("open")) m.hidden = true; }, 300);
  }
  btn.setAttribute("aria-controls", "mnav");
  btn.setAttribute("aria-expanded", "false");
  btn.addEventListener("click", function () { m.classList.contains("open") ? close() : open(); });
  m.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", close); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && m.classList.contains("open")) close(); });
  window.addEventListener("resize", function () { if (window.innerWidth > 640 && m.classList.contains("open")) close(); });
})();
