/* Genre index: big typographic list with a floating, cycling preview (desktop) and photo strips (touch). */
window.renderGenreIndex = function (box) {
  if (!box || !window.PHOTOS) return;
  var GEN = [["Fashion", "fashion"], ["Landscape", "landscape"], ["Street", "street"], ["Architecture", "architecture"], ["Event", "event", "Events"]];
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var html = '<ul class="gi-list">';
  GEN.forEach(function (g, i) {
    var ps = PHOTOS.filter(function (p) { return p.cat === g[0]; });
    var real = ps.filter(function (p) { return !p.ph; }).slice(0, 6);
    var strip = (real.length ? real : ps.slice(0, 4)).map(function (p) {
      return p.ph ? '<span class="gi-th ph-box"></span>' : '<img class="gi-th" loading="lazy" src="' + cld(p.src, 400) + '" alt="">';
    }).join("");
    html += '<li><a href="portfolio.html?cat=' + g[1] + '" data-imgs="' + real.map(function (p) { return p.src; }).join("|") + '">' +
      '<span class="gi-n">' + String(i + 1).padStart(2, "0") + '</span><span class="gi-t">' + esc(g[2] || g[0]) + "</span>" +
      '<span class="gi-c">' + (real.length ? ps.length + " photos" : "Coming soon") + '</span><span class="gi-a" aria-hidden="true">→</span></a>' +
      '<div class="gi-strip">' + strip + "</div></li>";
  });
  html += '</ul><div class="gi-prev" aria-hidden="true"><img alt=""><img alt=""><span class="gi-soon">Fashion — coming soon</span></div>';
  box.innerHTML = html;

  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  var prev = box.querySelector(".gi-prev"), imgs = prev.querySelectorAll("img"), front = 0, timer = null, tx = 0, ty = 0, x = 0, y = 0, running = false;
  function showSrc(src) {
    var nextImg = imgs[1 - front];
    nextImg.onload = function () { nextImg.classList.add("on"); imgs[front].classList.remove("on"); front = 1 - front; };
    nextImg.src = cld(src, 700);
  }
  box.querySelectorAll(".gi-list a").forEach(function (a) {
    a.addEventListener("mouseenter", function () {
      var list = (a.dataset.imgs || "").split("|").filter(Boolean), n = 0;
      clearInterval(timer);
      prev.classList.add("on");
      prev.classList.toggle("soon", !list.length);
      box.classList.add("hovering");
      if (list.length) { showSrc(list[0]); timer = setInterval(function () { n = (n + 1) % list.length; showSrc(list[n]); }, 850); }
    });
    a.addEventListener("mouseleave", function () { clearInterval(timer); prev.classList.remove("on"); box.classList.remove("hovering"); });
  });
  box.addEventListener("mousemove", function (e) {
    var r = box.getBoundingClientRect(); tx = e.clientX - r.left; ty = e.clientY - r.top;
    if (!running) { running = true; x = tx; y = ty; loop(); }
  });
  function loop() {
    x += (tx - x) * 0.14; y += (ty - y) * 0.14;
    // sits in the open space right of the names; follows the cursor vertically, tilts with movement
    var bw = box.clientWidth, pw = prev.offsetWidth, ph = prev.offsetHeight;
    var px = bw * 0.66 - pw / 2 + (tx - bw * 0.5) * 0.06;
    var py = Math.max(-ph * 0.3, Math.min(box.clientHeight - ph * 0.7, y - ph / 2));
    prev.style.transform = "translate(" + px.toFixed(1) + "px," + py.toFixed(1) + "px) rotate(" + ((ty - y) * 0.03).toFixed(2) + "deg)";
    requestAnimationFrame(loop);
  }
};
