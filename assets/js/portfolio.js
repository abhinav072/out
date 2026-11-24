/* Portfolio: priority-mixed justified grid, flowing filter changes, hover focus, lightbox. */
(function () {
  "use strict";
  var grid = document.getElementById("grid"), filters = document.getElementById("filters");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var lab = { Event: "Events" };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var cats = ["All", "Fashion", "Landscape", "Street", "Architecture", "Event"];
  var q = new URLSearchParams(location.search);
  var cur = (q.get("cat") || "all").toLowerCase();

  // stable frame numbers (No. 01, 02 …) in list order
  PHOTOS.forEach(function (p, i) { p.no = i + 1; p.key = p.src || ("ph-" + i); });

  filters.innerHTML = cats.map(function (c) {
    var n = c === "All" ? PHOTOS.filter(function (p) { return p.selected; }).length : PHOTOS.filter(function (p) { return p.cat === c; }).length;
    return '<button data-c="' + c.toLowerCase() + '">' + esc(c === "All" ? (filters.dataset.selectedLabel || "Selected") : (lab[c] || c)) + "<sup>" + n + "</sup></button>";
  }).join("") + '<svg class="fwave" viewBox="0 0 40 8" preserveAspectRatio="none" aria-hidden="true"><path d="M0 4 Q 5 0 10 4 T 20 4 T 30 4 T 40 4"/></svg>';
  var wave = filters.querySelector(".fwave");

  // "All": mix genres by priority — Fashion twice per round; order within a genre is kept.
  var ROUND = ["Fashion", "Landscape", "Fashion", "Street", "Architecture", "Event"];
  function mixed() {
    var b = {}; PHOTOS.filter(function (p) { return p.selected; }).forEach(function (p) { (b[p.cat] = b[p.cat] || []).push(p); });
    var out = [], left = PHOTOS.filter(function (p) { return p.selected; }).length;
    Object.keys(b).forEach(function (c) { if (ROUND.indexOf(c) < 0) { out = out.concat(b[c]); left -= b[c].length; } }); // any new genre
    while (left > 0) {
      ROUND.forEach(function (c) {
        var s = b[c]; if (!s || !s.length) return;
        var p = s.shift();
        if (out.length && out[out.length - 1].cat === p.cat) {
          var alt = ROUND.filter(function (o) { return o !== c && b[o] && b[o].length; })[0];
          if (alt) { out.push(b[alt].shift()); left--; }
        }
        out.push(p); left--;
      });
    }
    return out;
  }

  function moveWave(animate) {
    var btn = filters.querySelector('button[aria-pressed="true"]');
    if (!btn) return;
    var fr = filters.getBoundingClientRect(), br = btn.getBoundingClientRect();
    if (!animate) wave.style.transition = "none";
    wave.style.width = br.width + "px";
    wave.style.transform = "translateX(" + (br.left - fr.left) + "px)";
    if (!animate) { void wave.offsetWidth; wave.style.transition = ""; }
    wave.classList.remove("flow"); void wave.offsetWidth; if (animate) wave.classList.add("flow");
  }

  var list = [];

  function layout(animate) {
    // remember where every visible photo is (for the glide)
    var before = {};
    if (animate) grid.querySelectorAll(".jitem").forEach(function (el) { before[el.dataset.key] = el.getBoundingClientRect(); });

    list = cur === "all" ? mixed() : PHOTOS.filter(function (p) { return p.cat.toLowerCase() === cur; });
    filters.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.c === cur)); });
    var MODE = cur === "all" ? "editorial" : "grid";   // "Selected" = the photos marked Selected, in the editorial layout
    var more = document.getElementById("more"); if (more) { more.hidden = MODE !== "editorial"; if (!more.hidden && !more.dataset.done) { renderGenreIndex(document.getElementById("gindex")); more.dataset.done = "1"; } }
    grid.className = "jgrid mode-" + MODE;
    var k = 0;
    function tile(p, extra, style) {
      var no = "No. " + String(p.no).padStart(2, "0"), kk = k++;
      if (p.ph) return '<div class="jitem ph-box ' + (extra || "") + '" data-key="' + p.key + '" style="' + (style || "") + '"><span>Fashion photo</span><span class="cap"><span><em>' + no + "</em> Coming soon</span><span>Fashion</span></span></div>";
      return '<a class="jitem ' + (extra || "") + '" data-k="' + kk + '" data-key="' + p.key + '" href="#" style="' + (style || "") + '"><img src="' + cld(p.src, 1400) +
        '" alt="' + esc(p.title) + '" loading="lazy"><span class="cap"><span><em>' + no + "</em> " + esc(p.title) + "</span><span>" + (lab[p.cat] || p.cat) + "</span></span></a>";
    }
    function capBelow(p) { return '<div class="ecap"><span><em>No. ' + String(p.no).padStart(2, "0") + "</em> " + esc(p.ph ? "Fashion — coming soon" : p.title) + "</span><span>" + (lab[p.cat] || p.cat) + "</span></div>"; }
    function take(queue, test) { for (var n = 0; n < queue.length; n++) if (test(queue[n])) return queue.splice(n, 1)[0]; return queue.shift(); }

    if (MODE === "editorial") {
      // magazine rhythm: full · pair · trio · single · pair (reversed) …
      var qd = list.slice(), out = "", pat = ["full", "pair", "trio", "single", "pairr"], pi = 0;
      while (qd.length) {
        var t = pat[pi++ % pat.length];
        if (t === "full") {
          var land = qd.filter(function (p) { return p.r >= 1.3; })[0];
          if (!land) t = "single"; else { qd.splice(qd.indexOf(land), 1); out += '<div class="erow e-full"><figure>' + tile(land, "", "aspect-ratio:" + land.r) + capBelow(land) + "</figure></div>"; continue; }
        }
        var n = t === "trio" ? 3 : (t === "single" ? 1 : 2), cells = [];
        for (var c = 0; c < n && qd.length; c++) cells.push(t === "single" ? take(qd, function (p) { return p.r < 1.2; }) : qd.shift());
        out += '<div class="erow e-' + t + '">' + cells.map(function (p) { return "<figure>" + tile(p, "", "aspect-ratio:" + p.r) + capBelow(p) + "</figure>"; }).join("") + "</div>";
      }
      grid.innerHTML = out;
    } else if (MODE === "bento") {
      // mosaic: tile shapes repeat; each shape takes the photo whose proportions suit it best
      var P = [[6, 2], [3, 2], [3, 1], [3, 1], [4, 1], [4, 1], [4, 1], [3, 2], [6, 1], [3, 1], [3, 1], [6, 1]];
      var qb = list.slice(), outb = "", bi = 0;
      while (qb.length) {
        var s = P[bi++ % P.length], want = s[0] / (s[1] * 1.6), best = 0, bd = 9;
        for (var m = 0; m < Math.min(5, qb.length); m++) { var dd = Math.abs(Math.log(qb[m].r / want)); if (dd < bd) { bd = dd; best = m; } }
        var pb = qb.splice(best, 1)[0];
        outb += tile(pb, "b", "grid-column:span " + s[0] + ";grid-row:span " + s[1]);
      }
      grid.innerHTML = '<div class="bento">' + outb + "</div>";
    } else if (MODE === "wall") {
      // exhibition wall: uncropped prints, staggered heights, lots of air
      var qw = list.slice(), outw = "", wi = 0, offs = ["14%", "4%", "24%", "9%", "18%"];
      while (qw.length) {
        var L = qw.shift(), R = qw.shift(), flip = wi % 2;
        function col(p, side) {
          var land = p.r >= 1.2;
          if (side === "l") return land ? (flip ? "2/8" : "1/8") : (flip ? "2/6" : "1/5");
          return land ? (flip ? "7/13" : "8/13") : (flip ? "9/13" : "8/12");
        }
        outw += '<div class="wrow">';
        outw += '<figure style="grid-column:' + col(L, "l") + '">' + tile(L, "", "aspect-ratio:" + L.r) + capBelow(L) + "</figure>";
        if (R) outw += '<figure style="grid-column:' + col(R, "r") + ";margin-top:" + offs[wi % offs.length] + '">' + tile(R, "", "aspect-ratio:" + R.r) + capBelow(R) + "</figure>";
        outw += "</div>"; wi++;
      }
      grid.innerHTML = outw;
    } else {
      var W = grid.clientWidth, gap = parseFloat(getComputedStyle(grid).rowGap) || 12;
      var H = innerWidth <= 640 ? 170 : (innerWidth <= 1024 ? 250 : 330);
      var rows = [], row = [], sum = 0;
      list.forEach(function (p) {
        row.push(p); sum += p.r;
        if (sum * H + (row.length - 1) * gap >= W) { rows.push([row, (W - (row.length - 1) * gap) / sum]); row = []; sum = 0; }
      });
      if (row.length) rows.push([row, H]);
      grid.innerHTML = rows.map(function (rw) {
        var h = rw[1];
        return '<div class="jrow">' + rw[0].map(function (p) { return tile(p, "", "width:" + Math.floor(p.r * h) + "px;height:" + h + "px"); }).join("") + "</div>";
      }).join("");
    }
    // map data-k back to list order for the lightbox
    var order = [];
    grid.querySelectorAll(".jitem").forEach(function (el) { order.push(el.dataset.key); });
    list = order.map(function (key) { return list.filter(function (p) { return p.key === key; })[0]; });
    grid.querySelectorAll("a.jitem").forEach(function (el) { el.dataset.k = String(order.indexOf(el.dataset.key)); });

    moveWave(animate);
    if (!animate || reduce) return;
    // glide: start each photo where it was, then let it flow to its new place
    var items = grid.querySelectorAll(".jitem");
    items.forEach(function (el, n) {
      var old = before[el.dataset.key], now = el.getBoundingClientRect();
      if (old) {
        var dx = old.left - now.left, dy = old.top - now.top, sx = old.width / now.width, sy = old.height / now.height;
        el.style.transformOrigin = "0 0";
        el.style.transform = "translate(" + dx + "px," + dy + "px) scale(" + sx + "," + sy + ")";
      } else {
        el.style.opacity = "0";
        el.style.transform = "translateY(18px)";
      }
      el.style.transition = "none";
    });
    void grid.offsetWidth;
    items.forEach(function (el, n) {
      el.style.transition = "transform .75s cubic-bezier(.22,1,.36,1), opacity .6s ease";
      el.style.transitionDelay = before[el.dataset.key] ? "0s" : Math.min(n * 25, 400) + "ms";
      el.style.transform = ""; el.style.opacity = "";
    });
    setTimeout(function () { items.forEach(function (el) { el.style.transition = ""; el.style.transitionDelay = ""; el.style.transformOrigin = ""; }); }, 1300);
  }

  filters.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b || b.dataset.c === cur) return;
    cur = b.dataset.c;
    history.replaceState(null, "", cur === "all" ? location.pathname : "?cat=" + cur);
    layout(true);
  });
  var rz; addEventListener("resize", function () { clearTimeout(rz); rz = setTimeout(function () { layout(false); }, 120); });
  layout(false);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { moveWave(false); });

  // lightbox
  var lb = document.getElementById("lb"), lbi = document.getElementById("lbi"), lbt = document.getElementById("lbt"), lbn = document.getElementById("lbn");
  var at = 0;
  function real() { return list.filter(function (p) { return !p.ph; }); }
  function show(n) {
    var r = real(); at = (n + r.length) % r.length; var p = r[at];
    lbi.src = cld(p.src, 2000);
    lbt.innerHTML = esc(p.title) + ' <span class="muted">— ' + (lab[p.cat] || p.cat) + "</span>";
    lbn.textContent = String(at + 1).padStart(2, "0") + " / " + r.length;
    lb.hidden = false;
  }
  grid.addEventListener("click", function (e) {
    var a = e.target.closest("a.jitem"); if (!a) return;
    e.preventDefault(); show(real().indexOf(list[+a.dataset.k]));
  });
  document.getElementById("lbx").onclick = function () { lb.hidden = true; };
  document.getElementById("lbp").onclick = function () { show(at - 1); };
  document.getElementById("lbnx").onclick = function () { show(at + 1); };
  if (q.get("open")) show(+q.get("open"));
})();
