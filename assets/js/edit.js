/* Edit mode — open any page with #edit at the end of the address.
 *
 * Your GitHub key and Cloudinary details are encrypted with your passphrase (AES-GCM, PBKDF2) and kept only
 * in this browser. While unlocked, they stay in this tab's session until you press Lock or close the tab.
 * Text is saved as plain text. Saving commits data/*.json to GitHub; the site rebuilds in about a minute.
 */
(function () {
  "use strict";
  if (window.__editMode) return;
  window.__editMode = true;

  var STORE = "as-edit-v1", SESSION = "as-edit-session";
  var FILES = ["content.json", "photos.json", "films.json", "shorts.json"];
  var GENRES = ["Fashion", "Landscape", "Street", "Architecture", "Event"];
  var cfg = null, data = {}, orig = {}, sha = {}, dirtyText = false, busy = false;
  try { sessionStorage.setItem("editing", "1"); } catch (e) {}
  var intro = document.getElementById("intro"); if (intro) intro.click();

  /* ---------------- small helpers ---------------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function h(tag, attrs, kids) {
    var el = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "text") el.textContent = attrs[k];
      else if (k.slice(0, 2) === "on") el.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] !== false && attrs[k] != null) el.setAttribute(k, attrs[k] === true ? "" : attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c) el.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return el;
  }
  function b64enc(str) { return btoa(unescape(encodeURIComponent(str))); }
  function b64dec(b) { return decodeURIComponent(escape(atob(b.replace(/\s/g, "")))); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function cld(path, tr) { return "https://res.cloudinary.com/" + (cfg ? cfg.cloud : "ddw247yht") + "/image/upload/" + tr + "/" + path; }
  function vcld(path, tr) { return "https://res.cloudinary.com/" + (cfg ? cfg.cloud : "ddw247yht") + "/video/upload/" + tr + "/" + path; }
  function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "item"; }

  /* ---------------- styles ---------------- */
  var css = "" +
    ".ed-bar{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:520;display:flex;gap:6px;align-items:center;flex-wrap:wrap;justify-content:center;background:#fff;border:1px solid #1b1b1b;padding:8px;font:400 13px/1.3 Jost,system-ui,sans-serif;letter-spacing:.02em;box-shadow:0 12px 40px -18px rgba(0,0,0,.4);max-width:calc(100vw - 24px)}" +
    ".ed-bar .st{padding:0 10px;color:#6f6a63;min-width:150px}.ed-bar .st.err{color:#b3261e}.ed-bar .st.ok{color:#2e6b3a}" +
    ".ed-btn{font:inherit;text-transform:uppercase;letter-spacing:.16em;font-size:11px;border:1px solid #1b1b1b;background:#fff;color:#1b1b1b;padding:9px 14px;cursor:pointer}" +
    ".ed-btn.pri{background:#1b1b1b;color:#fff}.ed-btn:disabled{opacity:.4;cursor:default}.ed-btn.danger{border-color:#b3261e;color:#b3261e}" +
    "[data-edit].ed-on{outline:1px dashed #b9b2a8;outline-offset:3px;cursor:text;min-width:1ch}[data-edit].ed-on:hover{outline-color:#1b1b1b}[data-edit].ed-on:focus{outline:1.5px solid #1b1b1b;background:rgba(255,236,170,.25)}" +
    "[data-edit].ed-bad{outline:1.5px solid #b3261e!important}" +
    ".ed-modal{position:fixed;inset:0;z-index:510;background:rgba(250,249,247,.96);display:grid;place-items:center;padding:20px;font:400 15px/1.5 Jost,system-ui,sans-serif;color:#1b1b1b}" +
    ".ed-card{width:min(520px,100%);background:#fff;border:1px solid #e3dfd8;padding:28px;display:grid;gap:14px;max-height:90vh;overflow:auto}" +
    ".ed-card h2{margin:0;font-weight:400;font-size:26px}.ed-card p{margin:0;color:#6f6a63;font-size:14px}" +
    ".ed-f{display:grid;gap:4px}.ed-f label{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#6f6a63}" +
    ".ed-f input,.ed-f select,.ed-f textarea{font:inherit;font-size:15px;border:0;border-bottom:1px solid #d6d1c9;padding:7px 0;background:transparent;color:inherit;width:100%}" +
    ".ed-f input:focus,.ed-f textarea:focus{outline:none;border-color:#1b1b1b}.ed-msg{font-size:13px;color:#b3261e;min-height:1em}" +
    ".ed-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}" +
    ".ed-drawer{position:fixed;top:0;right:0;bottom:0;width:min(720px,100vw);z-index:505;background:#fff;border-left:1px solid #e3dfd8;display:flex;flex-direction:column;font:400 14px/1.4 Jost,system-ui,sans-serif;color:#1b1b1b;box-shadow:-20px 0 60px -30px rgba(0,0,0,.35)}" +
    ".ed-dh{display:flex;justify-content:space-between;align-items:center;padding:14px 18px;border-bottom:1px solid #e3dfd8;gap:10px;flex-wrap:wrap}" +
    ".ed-tabs{display:flex;gap:4px;flex-wrap:wrap}.ed-tab{font:inherit;font-size:11px;letter-spacing:.16em;text-transform:uppercase;background:none;border:0;padding:8px 10px;color:#8f8980;cursor:pointer}.ed-tab[aria-selected=true]{color:#1b1b1b;box-shadow:inset 0 -1px #1b1b1b}" +
    ".ed-body{flex:1;overflow:auto;padding:14px 18px 120px}.ed-note{font-size:13px;color:#6f6a63;margin:0 0 12px}" +
    ".ed-item{display:grid;grid-template-columns:64px 1fr;gap:12px;padding:12px 0;border-bottom:1px solid #efece7}" +
    ".ed-th{width:64px;height:80px;object-fit:cover;background:#f3f2f0;display:block}.ed-fields{display:grid;gap:8px}" +
    ".ed-fields input,.ed-fields select{font:inherit;font-size:14px;border:0;border-bottom:1px solid #e3dfd8;padding:4px 0;background:transparent;width:100%;color:inherit}" +
    ".ed-two{display:grid;grid-template-columns:1fr 1fr;gap:8px}.ed-chk{display:flex;gap:14px;flex-wrap:wrap;font-size:12px;color:#6f6a63}.ed-chk label{display:flex;gap:5px;align-items:center;cursor:pointer}" +
    ".ed-mini{font:inherit;font-size:10px;letter-spacing:.14em;text-transform:uppercase;border:1px solid #d6d1c9;background:#fff;padding:5px 8px;cursor:pointer;color:#1b1b1b}.ed-mini:hover{border-color:#1b1b1b}.ed-mini.danger{color:#b3261e}" +
    ".ed-prog{height:2px;background:#efece7;margin-top:4px}.ed-prog i{display:block;height:100%;width:0;background:#1b1b1b;transition:width .2s}" +
    "@media(max-width:640px){.ed-bar{bottom:8px;padding:6px}.ed-bar .st{min-width:0;width:100%;text-align:center}.ed-two{grid-template-columns:1fr}}";
  document.head.appendChild(h("style", { text: css }));

  /* ---------------- crypto (key stays encrypted at rest) ---------------- */
  var te = new TextEncoder(), td = new TextDecoder();
  function bufToB64(b) { return btoa(String.fromCharCode.apply(null, new Uint8Array(b))); }
  function b64ToBuf(s) { return Uint8Array.from(atob(s), function (c) { return c.charCodeAt(0); }); }
  function deriveKey(pass, salt) {
    return crypto.subtle.importKey("raw", te.encode(pass), "PBKDF2", false, ["deriveKey"]).then(function (base) {
      return crypto.subtle.deriveKey({ name: "PBKDF2", salt: salt, iterations: 250000, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
    });
  }
  function encrypt(obj, pass) {
    var salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
    return deriveKey(pass, salt).then(function (k) { return crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, k, te.encode(JSON.stringify(obj))); })
      .then(function (ct) { return { v: 1, salt: bufToB64(salt), iv: bufToB64(iv), data: bufToB64(ct) }; });
  }
  function decrypt(rec, pass) {
    return deriveKey(pass, b64ToBuf(rec.salt)).then(function (k) { return crypto.subtle.decrypt({ name: "AES-GCM", iv: b64ToBuf(rec.iv) }, k, b64ToBuf(rec.data)); })
      .then(function (pt) { return JSON.parse(td.decode(pt)); });
  }

  /* ---------------- toolbar ---------------- */
  var status = h("span", { class: "st", text: "Edit mode" });
  var bSave = h("button", { class: "ed-btn pri", type: "button", text: "Save", disabled: true, onclick: save });
  var bMedia = h("button", { class: "ed-btn", type: "button", text: "Photos & videos", disabled: true, onclick: function () { openDrawer(); } });
  var bDiscard = h("button", { class: "ed-btn", type: "button", text: "Discard", disabled: true, onclick: discard });
  var bLock = h("button", { class: "ed-btn", type: "button", text: "Lock", onclick: lock });
  var bar = h("div", { class: "ed-bar", role: "region", "aria-label": "Edit mode" }, [status, bMedia, bSave, bDiscard, bLock]);
  document.body.appendChild(bar);
  function say(msg, kind) { status.textContent = msg; status.className = "st" + (kind ? " " + kind : ""); }
  function isDirty() { return dirtyText || FILES.some(function (f) { return data[f] && JSON.stringify(data[f]) !== JSON.stringify(orig[f]); }); }
  function refreshButtons() {
    var d = isDirty();
    bSave.disabled = !d || busy; bDiscard.disabled = !d || busy; bMedia.disabled = !cfg || busy;
    if (d && !busy) say("Unsaved changes");
  }
  window.addEventListener("beforeunload", function (e) { if (isDirty()) { e.preventDefault(); e.returnValue = ""; } });

  /* ---------------- unlock / setup ---------------- */
  function modal(card) { var m = h("div", { class: "ed-modal" }, [card]); document.body.appendChild(m); return m; }
  function field(label, attrs) { var id = "ed-" + Math.random().toString(36).slice(2, 8); return h("div", { class: "ed-f" }, [h("label", { for: id, text: label }), h("input", Object.assign({ id: id }, attrs))]); }

  function start() {
    var s = null; try { s = JSON.parse(sessionStorage.getItem(SESSION) || "null"); } catch (e) {}
    if (s) { cfg = s; return load(); }
    var rec = null; try { rec = JSON.parse(localStorage.getItem(STORE) || "null"); } catch (e) {}
    rec ? showUnlock(rec) : showSetup();
  }

  function showUnlock(rec) {
    var pass = field("Passphrase", { type: "password", autocomplete: "current-password" }), msg = h("div", { class: "ed-msg" });
    var m;
    var card = h("form", { class: "ed-card", onsubmit: function (e) {
      e.preventDefault(); msg.textContent = "";
      decrypt(rec, pass.querySelector("input").value).then(function (c) {
        cfg = c; try { sessionStorage.setItem(SESSION, JSON.stringify(c)); } catch (er) {}
        m.remove(); load();
      }).catch(function () { msg.textContent = "That passphrase didn’t unlock it. Try again."; });
    } }, [h("h2", { text: "Unlock edit mode" }), h("p", { text: "Enter the passphrase you chose for this device." }), pass, msg,
      h("div", { class: "ed-row" }, [h("button", { class: "ed-btn pri", type: "submit", text: "Unlock" }),
        h("button", { class: "ed-btn", type: "button", text: "Exit", onclick: exit }),
        h("button", { class: "ed-btn danger", type: "button", text: "Forget this device", onclick: function (e) {
          if (e.target.dataset.sure) { try { localStorage.removeItem(STORE); } catch (er) {} m.remove(); showSetup(); }
          else { e.target.dataset.sure = "1"; e.target.textContent = "Tap again to forget"; }
        } })])]);
    m = modal(card); setTimeout(function () { pass.querySelector("input").focus(); }, 50);
  }

  function showSetup() {
    var tok = field("GitHub key (fine-grained token)", { type: "password", autocomplete: "off", required: true, placeholder: "github_pat_…" });
    var repo = field("Repository", { value: "abhinav072/out", required: true });
    var branch = field("Branch", { value: "master", required: true });
    var cloud = field("Cloudinary cloud name", { value: "ddw247yht", required: true });
    var preset = field("Cloudinary upload preset (unsigned)", { required: true, placeholder: "e.g. website_uploads" });
    var p1 = field("Choose a passphrase", { type: "password", autocomplete: "new-password", required: true, minlength: "8" });
    var p2 = field("Repeat passphrase", { type: "password", autocomplete: "new-password", required: true });
    var msg = h("div", { class: "ed-msg" }), m;
    function v(f) { return f.querySelector("input").value.trim(); }
    var card = h("form", { class: "ed-card", onsubmit: function (e) {
      e.preventDefault(); msg.textContent = "";
      if (v(p1).length < 8) { msg.textContent = "Use a passphrase of at least 8 characters."; return; }
      if (v(p1) !== v(p2)) { msg.textContent = "The two passphrases don’t match."; return; }
      if (!/^[\w.-]+\/[\w.-]+$/.test(v(repo))) { msg.textContent = "Repository should look like owner/name."; return; }
      var c = { token: v(tok), repo: v(repo), branch: v(branch), cloud: v(cloud), preset: v(preset) };
      msg.style.color = "#6f6a63"; msg.textContent = "Checking your key with GitHub…";
      gh("GET", "/repos/" + c.repo, null, c).then(function (r) {
        if (!r.permissions || !r.permissions.push) throw new Error("This key can read the repository but can’t save to it. Give it Contents: Read and write.");
        return encrypt(c, v(p1));
      }).then(function (rec) {
        try { localStorage.setItem(STORE, JSON.stringify(rec)); sessionStorage.setItem(SESSION, JSON.stringify(c)); } catch (er) {}
        cfg = c; m.remove(); load();
      }).catch(function (err) { msg.style.color = ""; msg.textContent = err.message || "GitHub rejected this key."; });
    } }, [h("h2", { text: "Set up edit mode" }), h("p", { text: "One-time setup on this device. Your key is encrypted with your passphrase and never leaves this browser, except to talk to GitHub." }),
      tok, repo, branch, cloud, preset, p1, p2, msg,
      h("div", { class: "ed-row" }, [h("button", { class: "ed-btn pri", type: "submit", text: "Save and unlock" }), h("button", { class: "ed-btn", type: "button", text: "Exit", onclick: exit })])]);
    m = modal(card);
  }

  function lock() {
    if (isDirty() && !bLock.dataset.sure) { bLock.dataset.sure = "1"; bLock.textContent = "Lock without saving?"; return; }
    try { sessionStorage.removeItem(SESSION); } catch (e) {}
    exit();
  }
  function exit() {
    try { sessionStorage.removeItem("editing"); sessionStorage.removeItem(SESSION); } catch (e) {}
    location.href = location.pathname + location.search;
  }

  /* ---------------- GitHub ---------------- */
  function gh(method, path, body, c) {
    c = c || cfg;
    return fetch("https://api.github.com" + path, {
      method: method,
      headers: { "Authorization": "Bearer " + c.token, "Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
      body: body ? JSON.stringify(body) : undefined, cache: "no-store"
    }).then(function (r) {
      if (r.status === 401) throw new Error("GitHub rejected your key. It may have expired — Lock, then set up edit mode again.");
      if (r.status === 403) throw new Error("Your key doesn’t have permission for this. It needs Contents: Read and write on " + c.repo + ".");
      if (r.status === 404) throw new Error("GitHub couldn’t find " + c.repo + " (or branch " + c.branch + "). Check the setup details.");
      if (r.status === 409 || r.status === 422) throw new Error("This was changed somewhere else since you opened it. Reload the page and make your edit again.");
      if (!r.ok) throw new Error("GitHub error " + r.status + ". Try again in a moment.");
      return r.json();
    });
  }
  function load() {
    say("Loading your content…"); busy = true; refreshButtons();
    Promise.all(FILES.map(function (f) {
      return gh("GET", "/repos/" + cfg.repo + "/contents/data/" + f + "?ref=" + encodeURIComponent(cfg.branch)).then(function (r) {
        sha[f] = r.sha; data[f] = JSON.parse(b64dec(r.content)); orig[f] = clone(data[f]);
      });
    })).then(function () { busy = false; enableText(); say("Click any outlined text to edit it", "ok"); refreshButtons(); })
      .catch(function (err) { busy = false; say(err.message, "err"); refreshButtons(); });
  }

  /* ---------------- inline text ---------------- */
  function getKey(obj, key) { return key.split(".").reduce(function (o, k) { return o == null ? o : o[k]; }, obj); }
  function setKey(obj, key, val) {
    var parts = key.split("."), last = parts.pop();
    var o = parts.reduce(function (o, k) { return o[k]; }, obj); o[last] = val;
  }
  var CHECK = {
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "That doesn’t look like an email address."; },
    phone: function (v) { return /^\+?[\d\s()-]{7,20}$/.test(v) ? "" : "Phone numbers can use digits, spaces, + ( ) and -."; }
  };
  function enableText() {
    $$("[data-edit]").forEach(function (el) {
      var key = el.dataset.edit, fresh = getKey(data["content.json"], key);
      if (typeof fresh === "string" && el.textContent !== fresh) el.textContent = fresh;
      el.classList.add("ed-on");
      try { el.contentEditable = "plaintext-only"; } catch (e) { el.contentEditable = "true"; }
      if (el.contentEditable !== "plaintext-only") el.contentEditable = "true";
      el.spellcheck = true;
      el.addEventListener("input", function () {
        var v = el.textContent.replace(/\s+/g, " ").trim();
        var err = el.dataset.kind && CHECK[el.dataset.kind] ? CHECK[el.dataset.kind](v) : (v ? "" : "This text can’t be empty.");
        el.classList.toggle("ed-bad", !!err);
        if (err) { say(err, "err"); return; }
        setKey(data["content.json"], key, v);
        // keep the same text in sync everywhere it appears on the page
        $$('[data-edit="' + key + '"]').forEach(function (o) { if (o !== el) o.textContent = v; });
        refreshButtons();
      });
      el.addEventListener("paste", function (e) {
        e.preventDefault();
        var txt = (e.clipboardData || window.clipboardData).getData("text").replace(/\s+/g, " ");
        document.execCommand("insertText", false, txt);
      });
      el.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); el.blur(); } });
    });
  }
  // while editing: clicking editable text edits it instead of following its link
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a");
    if (!a) return;
    if (a.closest("[data-edit]") || a.hasAttribute("data-edit") || a.querySelector("[data-edit]")) { e.preventDefault(); e.stopImmediatePropagation(); return; }
    if (isDirty() && !a.closest(".ed-drawer")) { e.preventDefault(); e.stopImmediatePropagation(); say("Save or discard your changes before leaving this page.", "err"); }
  }, true);

  /* ---------------- save / discard ---------------- */
  function save() {
    if ($(".ed-bad")) { say("Fix the text outlined in red first.", "err"); return; }
    var changed = FILES.filter(function (f) { return JSON.stringify(data[f]) !== JSON.stringify(orig[f]); });
    if (!changed.length) { dirtyText = false; refreshButtons(); return; }
    busy = true; refreshButtons(); say("Saving…");
    normalise();
    changed.reduce(function (p, f) {
      return p.then(function () {
        return gh("PUT", "/repos/" + cfg.repo + "/contents/data/" + f, {
          message: "Edit site: update " + f + " (edit mode)", branch: cfg.branch, sha: sha[f],
          content: b64enc(JSON.stringify(data[f], null, 1) + "\n")
        }).then(function (r) { sha[f] = r.content.sha; orig[f] = clone(data[f]); });
      });
    }, Promise.resolve()).then(function () {
      busy = false; dirtyText = false; refreshButtons();
      say("Saved. Your site updates in about a minute.", "ok");
    }).catch(function (err) { busy = false; refreshButtons(); say(err.message, "err"); });
  }
  function discard() {
    if (!bDiscard.dataset.sure) { bDiscard.dataset.sure = "1"; bDiscard.textContent = "Discard all changes?"; setTimeout(function () { bDiscard.textContent = "Discard"; delete bDiscard.dataset.sure; }, 4000); return; }
    FILES.forEach(function (f) { data[f] = clone(orig[f]); });
    dirtyText = false;
    location.reload();
  }
  // keep "home" and "featured" numbered in list order
  function normalise() {
    ["home", "featured"].forEach(function (flag) {
      var n = 0;
      data["photos.json"].forEach(function (p) { if (p[flag]) p[flag] = ++n; else delete p[flag]; });
    });
    data["photos.json"].forEach(function (p) { if (!p.selected) delete p.selected; });
  }

  /* ---------------- uploads (Cloudinary, unsigned preset) ---------------- */
  function shrink(file) {
    // big camera files are resized in the browser to max 4000 px before upload
    if (!/^image\/(jpeg|png|webp)$/.test(file.type) || !window.createImageBitmap) return Promise.resolve(file);
    return createImageBitmap(file).then(function (bmp) {
      var max = 4000, s = Math.min(1, max / Math.max(bmp.width, bmp.height));
      if (s === 1 && file.size < 8e6) return file;
      var c = document.createElement("canvas"); c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s);
      c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
      return new Promise(function (res) { c.toBlob(function (b) { res(b || file); }, "image/jpeg", 0.92); });
    }).catch(function () { return file; });
  }
  function upload(file, kind, bar) {
    return (kind === "image" ? shrink(file) : Promise.resolve(file)).then(function (f) {
      return new Promise(function (resolve, reject) {
        var fd = new FormData();
        fd.append("file", f); fd.append("upload_preset", cfg.preset); fd.append("folder", "website");
        var x = new XMLHttpRequest();
        x.open("POST", "https://api.cloudinary.com/v1_1/" + encodeURIComponent(cfg.cloud) + "/" + kind + "/upload");
        x.upload.onprogress = function (e) { if (bar && e.lengthComputable) bar.style.width = (e.loaded / e.total * 100) + "%"; };
        x.onload = function () {
          var r = {}; try { r = JSON.parse(x.responseText); } catch (e) {}
          if (x.status >= 200 && x.status < 300 && r.public_id) resolve(r);
          else reject(new Error((r.error && r.error.message) || "Upload failed (" + x.status + "). Check your Cloudinary upload preset."));
        };
        x.onerror = function () { reject(new Error("Upload failed — check your connection.")); };
        x.send(fd);
      });
    });
  }
  function pick(accept, multiple) {
    return new Promise(function (res) {
      var i = h("input", { type: "file", accept: accept, multiple: !!multiple, style: "display:none" });
      i.addEventListener("change", function () { res(Array.prototype.slice.call(i.files)); i.remove(); });
      document.body.appendChild(i); i.click();
    });
  }

  /* ---------------- media drawer ---------------- */
  var drawer = null, tab = "photos", photoFilter = "All";
  function openDrawer(which) {
    if (which) tab = which;
    if (drawer) drawer.remove();
    var tabs = [["photos", "Photos"], ["films", "Films"], ["shorts", "Short form"], ["site", "Site settings"]];
    var body = h("div", { class: "ed-body" });
    drawer = h("aside", { class: "ed-drawer", "aria-label": "Photos and videos" }, [
      h("div", { class: "ed-dh" }, [
        h("div", { class: "ed-tabs", role: "tablist" }, tabs.map(function (t) {
          return h("button", { class: "ed-tab", role: "tab", type: "button", "aria-selected": String(t[0] === tab), text: t[1], onclick: function () { openDrawer(t[0]); } });
        })),
        h("button", { class: "ed-btn", type: "button", text: "Close", onclick: function () { drawer.remove(); drawer = null; } })
      ]), body]);
    document.body.appendChild(drawer);
    ({ photos: renderPhotos, films: renderFilms, shorts: renderShorts, site: renderSite })[tab](body);
  }
  function changed() { refreshButtons(); }
  function move(arr, i, d) { var j = i + d; if (j < 0 || j >= arr.length) return; var t = arr[i]; arr[i] = arr[j]; arr[j] = t; }
  function inp(val, on, attrs) { return h("input", Object.assign({ value: val || "", oninput: function (e) { on(e.target.value); changed(); } }, attrs || {})); }
  function sel(opts, val, on) {
    var s = h("select", { onchange: function (e) { on(e.target.value); changed(); } }, opts.map(function (o) { return h("option", { value: o[0], text: o[1], selected: o[0] === val }); }));
    return s;
  }
  function chk(label, val, on) {
    return h("label", {}, [h("input", { type: "checkbox", checked: !!val, onchange: function (e) { on(e.target.checked); changed(); } }), label]);
  }
  function confirmBtn(text, onYes) {
    return h("button", { class: "ed-mini danger", type: "button", text: text, onclick: function (e) {
      if (e.target.dataset.sure) onYes(); else { e.target.dataset.sure = "1"; e.target.textContent = "Sure?"; setTimeout(function () { e.target.textContent = text; delete e.target.dataset.sure; }, 3500); }
    } });
  }

  function renderPhotos(body) {
    var list = data["photos.json"];
    var top = h("div", { class: "ed-row", style: "margin-bottom:12px;justify-content:space-between" }, [
      sel([["All", "All genres"]].concat(GENRES.map(function (g) { return [g, g === "Event" ? "Events" : g]; })), photoFilter, function (v) { photoFilter = v; openDrawer("photos"); }),
      h("button", { class: "ed-btn pri", type: "button", text: "Add photos", onclick: function () {
        pick("image/*", true).then(function (files) {
          files.reduce(function (p, file) {
            return p.then(function () {
              say("Uploading " + file.name + "…");
              return upload(file, "image").then(function (r) {
                list.unshift({ id: slug(r.public_id.split("/").pop()), src: "v" + r.version + "/" + r.public_id + "." + r.format,
                  title: file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " "), cat: photoFilter === "All" ? "Fashion" : photoFilter,
                  ratio: Math.round(r.width / r.height * 100) / 100 });
                changed(); openDrawer("photos");
              });
            });
          }, Promise.resolve()).then(function () { say("Uploaded. Give each photo a title and genre, then Save.", "ok"); })
            .catch(function (err) { say(err.message, "err"); });
        });
      } })]);
    body.appendChild(h("p", { class: "ed-note", text: "Homepage = in the filmstrip. Selected = in the Portfolio’s first view. Featured = the three large photos on the homepage. Order here is the order on the site. Changes appear on the site about a minute after you Save." }));
    body.appendChild(top);
    list.forEach(function (p, i) {
      if (photoFilter !== "All" && p.cat !== photoFilter) return;
      var prog = h("i"), th = p.src ? h("img", { class: "ed-th", src: cld(p.src, "f_auto,q_auto,w_160,h_200,c_fill"), alt: "" }) : h("div", { class: "ed-th" });
      body.appendChild(h("div", { class: "ed-item" }, [th, h("div", { class: "ed-fields" }, [
        h("div", { class: "ed-two" }, [inp(p.title, function (v) { p.title = v; }, { placeholder: p.src ? "Title" : "Placeholder — add a photo" }),
          sel(GENRES.map(function (g) { return [g, g === "Event" ? "Events" : g]; }), p.cat, function (v) { p.cat = v; })]),
        h("div", { class: "ed-chk" }, [chk("Homepage", p.home, function (v) { p.home = v ? 99 : 0; }), chk("Selected", p.selected, function (v) { p.selected = v; }), chk("Featured", p.featured, function (v) { p.featured = v ? 99 : 0; })]),
        h("div", { class: "ed-row" }, [
          h("button", { class: "ed-mini", type: "button", text: "↑", "aria-label": "Move up", onclick: function () { move(list, i, -1); changed(); openDrawer("photos"); } }),
          h("button", { class: "ed-mini", type: "button", text: "↓", "aria-label": "Move down", onclick: function () { move(list, i, 1); changed(); openDrawer("photos"); } }),
          h("button", { class: "ed-mini", type: "button", text: p.src ? "Replace" : "Add photo", onclick: function () {
            pick("image/*").then(function (files) {
              if (!files[0]) return; say("Uploading…");
              upload(files[0], "image", prog).then(function (r) {
                p.src = "v" + r.version + "/" + r.public_id + "." + r.format; p.ratio = Math.round(r.width / r.height * 100) / 100;
                if (!p.title) p.title = files[0].name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ");
                changed(); openDrawer("photos"); say("Uploaded. Save to publish it.", "ok");
              }).catch(function (err) { say(err.message, "err"); });
            });
          } }),
          confirmBtn("Delete", function () { list.splice(i, 1); changed(); openDrawer("photos"); })]),
        h("div", { class: "ed-prog" }, [prog])])]));
    });
  }

  function videoList(key, body, isFilm) {
    var list = data[key];
    body.appendChild(h("p", { class: "ed-note", text: isFilm ? "Wide films shown large on the Videography page (the first two also appear on the homepage)." : "Vertical 9:16 edits — reels, shorts. They preview silently on the page and play with sound when tapped." }));
    body.appendChild(h("div", { class: "ed-row", style: "margin-bottom:12px" }, [h("button", { class: "ed-btn pri", type: "button", text: isFilm ? "Add a film" : "Add short-form videos", onclick: function () {
      pick("video/*", !isFilm).then(function (files) {
        files.reduce(function (p, file) {
          return p.then(function () {
            say("Uploading " + file.name + " — videos can take a while…");
            return upload(file, "video").then(function (r) {
              var item = { id: slug(r.public_id.split("/").pop()), src: "v" + r.version + "/" + r.public_id, title: file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ") };
              if (isFilm) { item.poster = "so_2"; item.kind = "Film"; item.caption = ""; item.role = "Director · DOP · Editor"; } else item.kind = "Reel";
              list.unshift(item); changed(); openDrawer(isFilm ? "films" : "shorts");
            });
          });
        }, Promise.resolve()).then(function () { say("Uploaded. Add titles, then Save.", "ok"); }).catch(function (err) { say(err.message, "err"); });
      });
    } })]));
    list.forEach(function (v, i) {
      var prog = h("i");
      var th = h("img", { class: "ed-th", src: vcld(v.src + ".jpg", (isFilm ? (v.poster || "so_2") + "," : "so_1,") + "w_160,h_200,c_fill,f_auto,q_auto").replace("/" + v.src + ".jpg", "/" + v.src + ".jpg"), alt: "" });
      var fields = [h("div", { class: "ed-two" }, [inp(v.title, function (x) { v.title = x; }, { placeholder: "Title" }), inp(v.kind, function (x) { v.kind = x; }, { placeholder: isFilm ? "e.g. Official trailer" : "Reel / Short / Edit" })])];
      if (isFilm) fields.push(h("div", { class: "ed-two" }, [inp(v.role, function (x) { v.role = x; }, { placeholder: "Your role" }), inp(v.caption, function (x) { v.caption = x; }, { placeholder: "Homepage caption" })]));
      fields.push(h("div", { class: "ed-row" }, [
        h("button", { class: "ed-mini", type: "button", text: "↑", "aria-label": "Move up", onclick: function () { move(list, i, -1); changed(); openDrawer(isFilm ? "films" : "shorts"); } }),
        h("button", { class: "ed-mini", type: "button", text: "↓", "aria-label": "Move down", onclick: function () { move(list, i, 1); changed(); openDrawer(isFilm ? "films" : "shorts"); } }),
        h("button", { class: "ed-mini", type: "button", text: "Replace video", onclick: function () {
          pick("video/*").then(function (files) {
            if (!files[0]) return; say("Uploading…");
            upload(files[0], "video", prog).then(function (r) { v.src = "v" + r.version + "/" + r.public_id; if (isFilm) v.poster = "so_2"; changed(); openDrawer(isFilm ? "films" : "shorts"); say("Uploaded. Save to publish it.", "ok"); })
              .catch(function (err) { say(err.message, "err"); });
          });
        } }),
        confirmBtn("Delete", function () { list.splice(i, 1); changed(); openDrawer(isFilm ? "films" : "shorts"); })]));
      fields.push(h("div", { class: "ed-prog" }, [prog]));
      body.appendChild(h("div", { class: "ed-item" }, [th, h("div", { class: "ed-fields" }, fields)]));
    });
  }
  function renderFilms(body) { videoList("films.json", body, true); }
  function renderShorts(body) { videoList("shorts.json", body, false); }

  function renderSite(body) {
    var c = data["content.json"];
    body.appendChild(h("p", { class: "ed-note", text: "Links and search-engine text that don’t appear as editable text on the page." }));
    var URLCHK = function (v) { return /^https:\/\/[^\s]+\.[^\s]+/.test(v); };
    [["contact.instagram", "Instagram link"], ["contact.pinterest", "Pinterest link"], ["contact.facebook", "Facebook link"]].forEach(function (f) {
      var msg = h("div", { class: "ed-msg" });
      body.appendChild(h("div", { class: "ed-f", style: "margin-bottom:12px" }, [h("label", { text: f[1] }), inp(getKey(c, f[0]), function (v) {
        msg.textContent = URLCHK(v) ? "" : "Links must start with https://";
        if (URLCHK(v)) setKey(c, f[0], v.trim());
      }), msg]));
    });
    ["home", "portfolio", "videography", "about", "contact"].forEach(function (pg) {
      body.appendChild(h("div", { class: "ed-f", style: "margin:18px 0 6px" }, [h("label", { text: pg.charAt(0).toUpperCase() + pg.slice(1) + " — Google title" }), inp(c.seo[pg + "_title"], function (v) { c.seo[pg + "_title"] = v; })]));
      body.appendChild(h("div", { class: "ed-f" }, [h("label", { text: "Google description" }), inp(c.seo[pg + "_description"], function (v) { c.seo[pg + "_description"] = v; }, { maxlength: "170" })]));
    });
  }

  start();
})();
