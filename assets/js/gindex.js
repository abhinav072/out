/* Genre index: big typographic list; each row carries a small row of its photos (no floating preview). */
window.renderGenreIndex = function (box) {
  if (!box || !window.PHOTOS) return;
  var GEN = [["Fashion", "fashion"], ["Landscape", "landscape"], ["Street", "street"], ["Architecture", "architecture"], ["Event", "event", "Events"]];
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var html = '<ul class="gi-list">';
  GEN.forEach(function (g, i) {
    var real = PHOTOS.filter(function (p) { return p.cat === g[0] && !p.ph; });
    var thumbs = real.length
      ? real.slice(0, 4).map(function (p) { return '<img class="gi-th" loading="lazy" src="' + cld(p.src, 300) + '" alt="">'; }).join("")
      : '<span class="gi-soon">Coming soon</span>';
    var strip = real.length
      ? real.slice(0, 8).map(function (p) { return '<img class="gi-th" loading="lazy" src="' + cld(p.src, 300) + '" alt="">'; }).join("")
      : '<span class="gi-soon">Coming soon</span>';
    html += '<li><a href="portfolio.html?cat=' + g[1] + '">' +
      '<span class="gi-n">' + String(i + 1).padStart(2, "0") + '</span><span class="gi-t">' + esc(g[2] || g[0]) + "</span>" +
      '<span class="gi-thumbs" aria-hidden="true">' + thumbs + '</span><span class="gi-a" aria-hidden="true">→</span></a>' +
      '<div class="gi-strip" aria-hidden="true">' + strip + "</div></li>";
  });
  box.innerHTML = html + "</ul>";
};
