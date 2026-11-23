(function () {
  "use strict";
  document.documentElement.classList.remove("no-js");
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Header: solid after scrolling past the top ---------- */
  var header = $(".site-header");
  if (header && !header.classList.contains("site-header--solid")) {
    var onScroll = function () { header.classList.toggle("is-solid", window.scrollY > 40); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Mobile menu ---------- */
  var toggle = $(".menu-toggle");
  if (toggle) {
    var setMenu = function (open) {
      document.body.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    };
    toggle.addEventListener("click", function () { setMenu(!document.body.classList.contains("menu-open")); });
    $$(".nav a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  }

  /* ---------- Footer year ---------- */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Fade images in when loaded ---------- */
  function fadeIn(img) {
    img.classList.add("lazy");
    if (img.complete && img.naturalWidth) { img.classList.add("is-loaded"); return; }
    img.addEventListener("load", function () { img.classList.add("is-loaded"); }, { once: true });
    img.addEventListener("error", function () { img.classList.add("is-loaded"); }, { once: true });
  }
  $$(".tile img").forEach(fadeIn);

  /* ---------- Reveal on scroll ---------- */
  var io = "IntersectionObserver" in window && !reduceMotion
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 })
    : null;
  function observe(el) { if (io) io.observe(el); else el.classList.add("is-visible"); }
  $$(".reveal").forEach(observe);

  /* ---------- Hero slideshow ---------- */
  var hero = $(".hero");
  if (hero) {
    var slides = $$(".hero-slide", hero);
    var dots = $$(".hero-dots button", hero);
    var countEl = $(".hero-meta .count", hero);
    var capEl = $(".hero-meta .cap", hero);
    var i = 0, timer;
    var show = function (n) {
      slides[i].classList.remove("is-active");
      dots[i] && dots[i].removeAttribute("aria-current");
      i = (n + slides.length) % slides.length;
      var s = slides[i];
      var img = $("img", s);
      if (img && img.dataset.src) { img.src = img.dataset.src; img.removeAttribute("data-src"); }
      s.classList.add("is-active");
      dots[i] && dots[i].setAttribute("aria-current", "true");
      if (countEl) countEl.textContent = String(i + 1).padStart(2, "0");
      if (capEl) capEl.textContent = s.dataset.caption || "";
    };
    var play = function () {
      clearInterval(timer);
      if (!reduceMotion && slides.length > 1) timer = setInterval(function () { show(i + 1); }, 6500);
    };
    dots.forEach(function (d, n) { d.addEventListener("click", function () { show(n); play(); }); });
    // Preload the second slide once the first is visible.
    setTimeout(function () {
      slides.slice(1).forEach(function (s) {
        var img = $("img", s);
        if (img && img.dataset.src) { img.src = img.dataset.src; img.removeAttribute("data-src"); }
      });
    }, 1800);
    document.addEventListener("visibilitychange", function () { if (document.hidden) clearInterval(timer); else play(); });
    play();
  }

  /* ---------- Before / after slider ---------- */
  $$(".compare").forEach(function (c) {
    var range = $("input[type=range]", c);
    var set = function () { c.style.setProperty("--pos", range.value + "%"); };
    range.addEventListener("input", set);
    set();
  });

  /* ---------- Films: swap poster for video on click ---------- */
  $$(".film-play").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var frame = btn.parentElement;
      var v = document.createElement("video");
      v.src = btn.dataset.video;
      v.controls = true;
      v.playsInline = true;
      v.autoplay = true;
      v.poster = $("img", frame).src;
      frame.innerHTML = "";
      frame.appendChild(v);
      v.play().catch(function () {});
    });
  });

  /* ---------- Portfolio grid, filters & lightbox ---------- */
  var grid = $("#gallery");
  if (grid && window.PHOTOS) {
    var photos = window.PHOTOS;
    var filtersEl = $("#filters");
    var countLabel = $("#grid-count");
    var cats = ["All", "Landscape", "Street", "Architecture", "Event", "AI"];
    var labels = { AI: "AI Art" };
    var current = "All";

    var frag = document.createDocumentFragment();
    photos.forEach(function (p, idx) {
      var a = document.createElement("a");
      a.className = "tile reveal";
      a.href = cld(p.src, 2400);
      a.dataset.cat = p.cat;
      a.dataset.idx = idx;
      a.setAttribute("aria-label", p.title + " — " + (labels[p.cat] || p.cat) + ". Open larger view");
      var img = document.createElement("img");
      img.src = cld(p.src, 900);
      img.srcset = cld(p.src, 600) + " 600w, " + cld(p.src, 900) + " 900w, " + cld(p.src, 1300) + " 1300w";
      img.sizes = "(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw";
      img.alt = p.title;
      img.loading = idx < 6 ? "eager" : "lazy";
      img.decoding = "async";
      img.style.aspectRatio = String(p.r);
      fadeIn(img);
      var cap = document.createElement("div");
      cap.className = "tile-cap";
      cap.innerHTML = "<b></b><span></span>";
      cap.firstChild.textContent = p.title;
      cap.lastChild.textContent = labels[p.cat] || p.cat;
      a.appendChild(img);
      a.appendChild(cap);
      frag.appendChild(a);
    });
    grid.appendChild(frag);
    var tiles = $$(".tile", grid);
    tiles.forEach(observe);

    cats.forEach(function (c) {
      var n = c === "All" ? photos.length : photos.filter(function (p) { return p.cat === c; }).length;
      var b = document.createElement("button");
      b.className = "filter";
      b.type = "button";
      b.dataset.cat = c;
      b.innerHTML = "<span></span><sup>" + n + "</sup>";
      b.firstChild.textContent = labels[c] || c;
      b.addEventListener("click", function () { applyFilter(c, true); });
      filtersEl.appendChild(b);
    });

    var visible = function () { return tiles.filter(function (t) { return !t.classList.contains("is-hidden"); }); };

    function applyFilter(c, push) {
      current = c;
      $$(".filter", filtersEl).forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.cat === c)); });
      tiles.forEach(function (t) {
        var show = c === "All" || t.dataset.cat === c;
        t.classList.toggle("is-hidden", !show);
        if (show) t.classList.add("is-visible");
      });
      var n = visible().length;
      countLabel.textContent = (c === "All" ? "All work" : (labels[c] || c)) + " — " + n + " photograph" + (n === 1 ? "" : "s");
      if (push) history.replaceState(null, "", c === "All" ? location.pathname : "#" + c.toLowerCase());
    }
    var fromHash = cats.filter(function (c) { return c.toLowerCase() === location.hash.slice(1).toLowerCase(); })[0];
    applyFilter(fromHash || "All", false);

    // Lightbox
    var lb = $("#lightbox");
    var lbImg = $("img", lb);
    var lbTitle = $(".lb-title b", lb);
    var lbCat = $(".lb-title span", lb);
    var lbCount = $(".lb-count", lb);
    var pos = 0, lastFocus = null;

    function open(tile) {
      var list = visible();
      pos = list.indexOf(tile);
      lastFocus = tile;
      render();
      lb.classList.add("is-open");
      lb.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      $(".lb-close", lb).focus();
    }
    function close() {
      lb.classList.remove("is-open");
      lb.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (lastFocus) lastFocus.focus();
    }
    function render() {
      var list = visible();
      pos = (pos + list.length) % list.length;
      var p = photos[+list[pos].dataset.idx];
      lbImg.classList.add("is-loading");
      lbImg.onload = function () { lbImg.classList.remove("is-loading"); };
      lbImg.src = cld(p.src, 2000);
      lbImg.alt = p.title;
      lbTitle.textContent = p.title;
      lbCat.textContent = labels[p.cat] || p.cat;
      lbCount.textContent = String(pos + 1).padStart(2, "0") + " / " + String(list.length).padStart(2, "0");
      // warm the cache for neighbours
      [pos + 1, pos - 1].forEach(function (k) {
        var t = list[(k + list.length) % list.length];
        if (t) new Image().src = cld(photos[+t.dataset.idx].src, 2000);
      });
    }
    function step(d) { pos += d; render(); }

    grid.addEventListener("click", function (e) {
      var t = e.target.closest(".tile");
      if (!t || e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      open(t);
    });
    $(".lb-close", lb).addEventListener("click", close);
    $(".lb-prev", lb).addEventListener("click", function () { step(-1); });
    $(".lb-next", lb).addEventListener("click", function () { step(1); });
    $(".lb-stage", lb).addEventListener("click", function (e) { if (e.target === e.currentTarget) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "Tab") {
        var f = $$("button", lb);
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    var tx = null;
    lb.addEventListener("touchstart", function (e) { tx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) {
      if (tx === null) return;
      var dx = e.changedTouches[0].clientX - tx;
      if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
      tx = null;
    });
  }

  /* ---------- Contact form → opens the visitor's email app ---------- */
  var form = $("#contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var d = new FormData(form);
      var subject = (d.get("topic") || "Enquiry") + " — " + d.get("name");
      var body = d.get("message") + "\n\n— " + d.get("name") + (d.get("email") ? " (" + d.get("email") + ")" : "");
      location.href = "mailto:hello.abhinav07@gmail.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      $("#form-note").textContent = "Your email app should open with the message ready to send. If it didn't, write to hello.abhinav07@gmail.com directly.";
    });
  }
})();
