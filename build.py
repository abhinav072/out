#!/usr/bin/env python3
"""Build the website into _site/ from data/*.json, templates/ and assets/.

Run:  python3 build.py            (GitHub Actions runs this on every push)
Edit: change data/content.json, data/photos.json, data/films.json, data/shorts.json
      — by hand, or from the site's edit mode (add #edit to any page address).
"""
import html, json, os, shutil

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, "_site")
IMG = "https://res.cloudinary.com/ddw247yht/image/upload/"
VID = "https://res.cloudinary.com/ddw247yht/video/upload/"
SITE_URL = "https://theabhinavsingh.com"


def load(name):
    with open(os.path.join(ROOT, "data", name), encoding="utf-8") as f:
        return json.load(f)


C = load("content.json")
PHOTOS = load("photos.json")
FILMS = load("films.json")
SHORTS = load("shorts.json")
BADGE = open(os.path.join(ROOT, "templates", "badge.svg"), encoding="utf-8").read().strip()
MBADGE = BADGE.replace('id="b-', 'id="m-').replace("#b-", "#m-")


def esc(s):
    return html.escape(str(s), quote=True)


def get(key):
    v = C
    for part in key.split("."):
        v = v[int(part)] if isinstance(v, list) else v[part]
    return v


def t(key):
    """Escaped text for a content key."""
    return esc(get(key))


def ed(key, tag="span", cls="", extra=""):
    """An element whose text is editable in edit mode."""
    c = f' class="{cls}"' if cls else ""
    return f'<{tag}{c} data-edit="{key}"{extra}>{t(key)}</{tag}>'


def img(src, tr):
    return f"{IMG}{tr}/{src}"


def lab(cat):
    return "Events" if cat == "Event" else cat


EMAIL, PHONE = get("contact.email"), get("contact.phone")
TEL = "".join(ch for ch in PHONE if ch.isdigit() or ch == "+")
ARROW_L = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M14 8H2M7 3L2 8l5 5"/></svg>'
ARROW_R = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M2 8h12M9 3l5 5-5 5"/></svg>'
PLAY = '<svg viewBox="0 0 10 10" fill="currentColor" aria-hidden="true"><path d="M1 0v10l9-5z"/></svg>'
NAV = [("portfolio.html", "Portfolio"), ("videography.html", "Videography"), ("about.html", "About"), ("contact.html", "Contact")]


def head(page, extra_class="", extra_fonts="", base=""):
    title, desc = get(f"seo.{page}_title"), get(f"seo.{page}_description")
    path = "" if page == "home" else f"{page}.html"
    cls = f' class="{extra_class}"' if extra_class else ""
    return f'''<!doctype html>
<html lang="en"{cls}><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<meta name="theme-color" content="#ffffff">
<link rel="canonical" href="{SITE_URL}/{path}">
<meta property="og:type" content="website"><meta property="og:site_name" content="{t('site.name')} — {t('site.tagline')}">
<meta property="og:title" content="{esc(title)}"><meta property="og:description" content="{esc(desc)}">
<meta property="og:url" content="{SITE_URL}/{path}"><meta property="og:image" content="{SITE_URL}/og-image.jpg"><meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://res.cloudinary.com" crossorigin>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jost:wght@400;500{extra_fonts}&display=swap">
<link rel="icon" href="{base}assets/brand/favicon.svg" type="image/svg+xml">
<link rel="icon" href="{base}assets/brand/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="{base}assets/brand/apple-touch-icon.png">
<link rel="stylesheet" href="{base}assets/css/site.css">
<script>try{{if(sessionStorage.getItem("rt")==="1"){{sessionStorage.removeItem("rt");if(!matchMedia("(prefers-reduced-motion: reduce)").matches){{var d=document.documentElement;d.classList.add("rt-arrive");d.style.setProperty("--rt-name",JSON.stringify(sessionStorage.getItem("rtName")||""))}}}}}}catch(e){{}}</script>
</head><body>'''


def bar(active, base=""):
    cur = ' aria-current="page"'
    nav = "".join(f'<a class="caps" href="{base}{h}"{cur if l == active else ""}>{l}</a>' for h, l in NAV)
    items = [(base or "./", "Home")] + [(base + h, l) for h, l in NAV]
    mlinks = "".join(f'<a style="--k:{i}" href="{h}"{cur if l == active else ""}>{l}</a>' for i, (h, l) in enumerate(items))
    menu = (f'<div class="mnav" id="mnav" hidden><svg class="mlines" aria-hidden="true"></svg>'
            f'<div class="mbadge" aria-hidden="true">{MBADGE}</div><nav class="mlinks" aria-label="Menu">{mlinks}</nav>'
            f'<div class="mfoot"><a class="caps" href="mailto:{esc(EMAIL)}">{esc(EMAIL)}</a>'
            f'<span><a href="{t("contact.instagram")}" target="_blank" rel="noopener">Instagram</a> &nbsp;·&nbsp; <a href="tel:{esc(TEL)}">{esc(PHONE)}</a></span>'
            f'<span>{t("site.location")}</span></div></div>')
    return (f'<header class="bar"><a class="name" href="{base or "./"}">{t("site.name")}</a>'
            f'<nav class="nav" aria-label="Main">{nav}</nav><button class="menu caps" type="button">Menu</button></header>' + menu)


def foot(active="", base=""):
    pages = [(base or "./", "Home")] + [(base + h, l) for h, l in NAV]
    wave = '<svg class="wave" viewBox="0 0 100 8" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M0 4 C 8 0, 17 0, 25 4 S 42 8, 50 4 S 67 0, 75 4 S 92 8, 100 4"/></svg>'
    links = "".join(f'<a href="{h}"{" aria-current=\"page\"" if l == active else ""}><span>{l}</span>{wave}</a>' for h, l in pages)
    soc = (f'<a href="{t("contact.instagram")}" target="_blank" rel="noopener">Instagram</a>'
           f'<a href="{t("contact.pinterest")}" target="_blank" rel="noopener">Pinterest</a>'
           f'<a href="{t("contact.facebook")}" target="_blank" rel="noopener">Facebook</a>')
    return (f'<footer class="sitefoot"><svg class="ft-river" viewBox="0 0 1200 40" preserveAspectRatio="none" aria-hidden="true">'
            f'<path pathLength="1" d="M0 22 C 120 6, 220 34, 340 20 S 560 4, 700 18 S 940 38, 1060 16 S 1170 10, 1200 18"/></svg>'
            f'<div class="ft-head"><span class="caps muted">Explore</span><a class="caps muted ft-top" href="#top">Back to top ↑</a></div>'
            f'<nav class="ft-pages" aria-label="Footer">{links}</nav>'
            f'<div class="ft-base">{ed("site.footer")}<nav class="ft-soc">{soc}</nav>'
            f'<a class="ft-mail" href="mailto:{esc(EMAIL)}">{esc(EMAIL)}</a></div></footer>')


def scripts(names, base=""):
    names = ["data"] + names + ["menu", "fx"]
    return "\n".join(f'<script src="{base}assets/js/{n}.js"></script>' for n in names) + "\n</body></html>\n"


def by(flag):
    return sorted([p for p in PHOTOS if p.get(flag) and p.get("src")], key=lambda p: p[flag])


# ---------------------------------------------------------------- HOME
def page_home():
    strip = ""
    for p in by("home"):
        strip += (f'<figure><div class="img" style="aspect-ratio:{p["ratio"]}"><img src="{img(p["src"], "f_auto,q_auto,w_1600")}" '
                  f'alt="{esc(p["title"])}" style="aspect-ratio:{p["ratio"]}"></div><figcaption>{esc(p["title"])}<span>{lab(p["cat"])}</span></figcaption></figure>')
    strip += (f'<figure><a class="end" href="portfolio.html"><div><b data-edit="home.strip_end_title">{t("home.strip_end_title")}</b>'
              f'{ed("home.strip_end_sub", cls="caps muted")}</div></a></figure>')
    feat = by("featured")
    # Featured: one large framed photo and two smaller ones. On phones a portrait photo leads.
    def fa_block(main, rest, cls):
        if not main:
            return ""
        h = (f'<div class="fa-set {cls}"><figure class="fa-frame" style="--r:{main["ratio"]}"><div class="fa-img"><img src="{img(main["src"], "f_auto,q_auto,w_2000")}" alt="{esc(main["title"])}" loading="lazy"></div>'
             f'<figcaption><span class="caps">No. 01 — {lab(main["cat"])}</span><h3>{esc(main["title"])}</h3></figcaption></figure>')
        if rest:
            h += '<div class="fa-pair">' + "".join(
                f'<figure data-speed="{sp}"><img src="{img(p["src"], "f_auto,q_auto,w_1200,c_fill,ar_4:5,g_auto")}" alt="{esc(p["title"])}" loading="lazy"><figcaption>No. 0{i + 2} — {esc(p["title"])}<span>{lab(p["cat"])}</span></figcaption></figure>'
                for i, (p, sp) in enumerate(zip(rest[:2], ("0.12", "-0.08")))) + "</div>"
        return h + "</div>"
    fa = ""
    if feat:
        mob = next((p for p in feat if p["ratio"] < 1), feat[0])
        if mob is feat[0]:
            fa = fa_block(feat[0], feat[1:3], "")
        else:
            fa = fa_block(feat[0], feat[1:3], "fa-d") + fa_block(mob, [p for p in feat if p is not mob][:2], "fa-m")
    films = "".join(
        f'<a href="videography.html#films"><div class="fr"><img src="{VID}{f["poster"]}/w_1400,f_auto,q_auto/{f["src"]}.jpg" alt="" loading="lazy">'
        f'<span class="play">Play</span></div><p><span>{esc(f["title"])}</span><span>{esc(f.get("caption") or f.get("kind", ""))}</span></p></a>'
        for f in FILMS[:2])
    before, after = "v1742964206/Before_wd7ubm.jpg", "v1742964213/After_jahjvd.jpg"
    portrait = img("v1744039751/ABS09606-foto_itaa9d.png", "c_crop,w_0.7,h_0.7,g_center/w_900,h_1125,c_fill,f_auto,q_auto")
    return head("home", "has-intro", "&family=Work+Sans:wght@600") + f'''
<div class="intro" id="intro" aria-hidden="true">
  <svg class="lines"></svg>
  <div class="mark"><div class="badge-wrap">{BADGE}</div>{ed("intro.coords", "div", "co")}</div>
  <div class="skip"><span class="c">Click to enter</span><span class="t">Tap to enter</span></div>
</div>
<div class="home">
{bar("")}
<main class="strip" id="strip">{strip}</main>
<footer class="foot">{ed("home.strip_label", cls="caps muted")}<div class="ctl"><div class="arrows"><button id="prev" type="button" aria-label="Previous photo">{ARROW_L}</button><button id="next" type="button" aria-label="Next photo">{ARROW_R}</button></div></div></footer>
</div>

<section class="hsec hello">
  <div class="hello-photo"><img src="{portrait}" alt="Portrait of {t("site.name")}" loading="lazy"><svg class="hello-ring" viewBox="0 0 200 200" aria-hidden="true"><defs><path id="hr-c" d="M100 100 m-78 0 a78 78 0 1 1 156 0 a78 78 0 1 1 -156 0"/></defs><circle class="disc" cx="100" cy="100" r="98"/><text><textPath href="#hr-c" textLength="486" lengthAdjust="spacing">ABHINAV SINGH · SHADES OF INDIA · PHOTO &amp; FILM · </textPath></text></svg></div>
  <div class="hello-text">
    {ed("home.intro_label", cls="caps muted")}
    <p class="hello-lead"><span data-edit="home.intro_lead">{t("home.intro_lead")}</span> <span class="b" data-edit="home.intro_body">{t("home.intro_body")}</span></p>
    <dl class="facts">
      <div><dt class="caps muted" data-edit="home.fact1_label">{t("home.fact1_label")}</dt><dd data-edit="home.fact1">{t("home.fact1")}</dd></div>
      <div><dt class="caps muted" data-edit="home.fact2_label">{t("home.fact2_label")}</dt><dd data-edit="home.fact2">{t("home.fact2")}</dd></div>
      <div><dt class="caps muted" data-edit="home.fact3_label">{t("home.fact3_label")}</dt><dd data-edit="home.fact3">{t("home.fact3")}</dd></div>
    </dl>
    <div class="links"><a class="link" href="about.html" data-edit="home.intro_link_about">{t("home.intro_link_about")}</a><a class="link" href="contact.html" data-edit="home.intro_link_book">{t("home.intro_link_book")}</a></div>
  </div>
</section>

<section class="hsec">
  <div class="shead">{ed("home.genres_label", cls="caps")}<a class="caps muted" href="portfolio.html" data-edit="home.genres_link">{t("home.genres_link")}</a></div>
  <div class="gindex" id="gindex"></div>
</section>

<section class="hsec feature feat-a" id="feat-a">
  <div class="shead">{ed("home.featured_label", cls="caps")}{ed("home.featured_sub", cls="caps muted")}</div>
  {fa}
</section>

<section class="hsec">
  <div class="shead">{ed("home.films_label", cls="caps")}<a class="caps muted" href="videography.html" data-edit="home.films_link">{t("home.films_link")}</a></div>
  <div class="hfilms">{films}</div>
</section>

<section class="hsec">
  <div class="shead">{ed("home.edit_label", cls="caps")}{ed("home.edit_sub", cls="caps muted")}</div>
  <div class="hedit">
    <div>{ed("home.edit_title", "h2")}{ed("home.edit_body", "p")}</div>
    <div class="compare"><img src="{img(before, "f_auto,q_auto,w_1400")}" alt="Before editing" loading="lazy"><img class="after" src="{img(after, "f_auto,q_auto,w_1400")}" alt="After editing" loading="lazy"><span class="tag l">Before</span><span class="tag r">After</span><div class="bar2"></div><input type="range" min="0" max="100" value="50" aria-label="Compare before and after"></div>
  </div>
</section>

<section class="hcta">
  {ed("home.cta_label", cls="caps muted")}
  {ed("home.cta_title", "h2")}
  <div class="row"><a class="btn caps" href="contact.html" data-edit="home.cta_button">{t("home.cta_button")}</a><a class="link" href="mailto:{esc(EMAIL)}">{esc(EMAIL)}</a></div>
</section>
{foot("Home")}
''' + scripts(["gindex", "home", "featured", "intro"])


# ---------------------------------------------------------------- PORTFOLIO
def page_portfolio():
    return head("portfolio") + bar("Portfolio") + f'''
<main class="page">
  <div class="page-head">{ed("portfolio.title", "h1")}<div class="filters" id="filters" data-selected-label="{t("portfolio.selected_label")}"></div></div>
  <div class="jgrid" id="grid"></div>
  <section class="more" id="more" hidden><div class="shead more-head">{ed("portfolio.more_label", cls="caps")}{ed("portfolio.more_sub", cls="caps muted")}</div><div class="gindex" id="gindex"></div></section>
</main>
{foot("Portfolio")}
<div class="lb" id="lb" hidden role="dialog" aria-modal="true" aria-label="Photo viewer">
  <div class="top"><span class="muted" id="lbn"></span><button class="caps" id="lbx" type="button">Close</button></div>
  <div class="stage"><img id="lbi" alt=""></div>
  <div class="bot"><span id="lbt"></span><div class="nav2 caps"><button id="lbp" type="button">Previous</button><button id="lbnx" type="button">Next</button></div></div>
</div>
''' + scripts(["gindex", "portfolio"])


# ---------------------------------------------------------------- VIDEOGRAPHY
def page_videography():
    films = ""
    for i, f in enumerate(FILMS):
        films += f'''
    <article class="film-item" data-id="{esc(f["id"])}">
      <div class="player" data-src="{VID}q_auto,w_1920,vc_auto/{f["src"]}.mp4">
        <img src="{VID}{f["poster"]}/w_1920,f_auto,q_auto/{f["src"]}.jpg" alt="{esc(f["title"])}" loading="lazy">
        <button class="play-btn caps" type="button" aria-label="Play {esc(f["title"])}">{PLAY}{t("videography.play")}</button>
      </div>
      <div class="film-meta"><span class="n muted">{i + 1:02d}</span><div><h2>{esc(f["title"])}</h2><p class="muted">{esc(f["kind"])}</p></div><dl><dt class="caps muted">Role</dt><dd>{esc(f["role"])}</dd></dl></div>
    </article>'''
    if SHORTS:
        shorts = "".join(
            f'<figure class="short"><div class="vframe" data-src="{VID}q_auto,w_1080,vc_auto/{s["src"]}.mp4" data-preview="{VID}q_auto,w_480,vc_auto,ac_none/{s["src"]}.mp4">'
            f'<img src="{VID}so_1,w_540,f_auto,q_auto/{s["src"]}.jpg" alt="{esc(s["title"])}" loading="lazy"><i class="vplay" aria-hidden="true">{PLAY}</i></div>'
            f'<figcaption>{esc(s["title"])}<span>{esc(s.get("kind", "Reel"))}</span></figcaption></figure>'
            for s in SHORTS)
    else:  # until the first short-form edits are added
        shorts = "".join(
            f'<figure class="short"><div class="vframe ph-box"><span>Short-form video</span><i class="vplay" aria-hidden="true">{PLAY}</i></div>'
            f'<figcaption>Short edit {i:02d}<span>Reel</span></figcaption></figure>' for i in range(1, 9))
    return head("videography") + bar("Videography") + f'''
<main class="page">
  <div class="page-head">{ed("videography.title", "h1")}<nav class="vtabs caps"><a href="#films" data-edit="videography.films_label">{t("videography.films_label")}</a><a href="#short" data-edit="videography.shorts_label">{t("videography.shorts_label")}</a></nav></div>
  <section id="films" class="vsec">
    <div class="shead"><span class="caps">{t("videography.films_label")}</span>{ed("videography.films_sub", cls="caps muted")}</div>
    <div class="films-list">{films}
    </div>
  </section>
  <section id="short" class="vsec">
    <div class="shead"><span class="caps">{t("videography.shorts_label")}</span>{ed("videography.shorts_sub", cls="caps muted")}</div>
    <div class="shorts">{shorts}</div>
  </section>
</main>
{foot("Videography")}
<div class="vlb" id="vlb" hidden role="dialog" aria-modal="true" aria-label="Video player"><button class="caps vlb-x" type="button">Close</button><video controls playsinline></video></div>
''' + scripts(["videography"])


# ---------------------------------------------------------------- ABOUT
def page_about():
    portrait = img("v1744039751/ABS09606-foto_itaa9d.png", "c_crop,w_0.7,h_0.7,g_center/w_1000,h_1250,c_fill,f_auto,q_auto")
    services = "".join(
        f'<li><span class="n">{i + 1:02d}</span><b data-edit="about.services.{i}.name">{esc(s["name"])}</b><span class="d muted" data-edit="about.services.{i}.text">{esc(s["text"])}</span></li>'
        for i, s in enumerate(C["about"]["services"]))
    before, after = "v1742964206/Before_wd7ubm.jpg", "v1742964213/After_jahjvd.jpg"
    return head("about") + bar("About") + f'''
<main class="page">
  <div class="about">
    <div class="portrait"><img src="{portrait}" alt="Portrait of {t("site.name")}"></div>
    <div>
      <div class="bio">
        {ed("about.lead", "p")}
        {ed("about.body", "p", "muted")}
        <p class="muted"><span data-edit="about.available">{t("about.available")}</span> <a class="link" style="color:var(--text)" href="contact.html" data-edit="about.available_link">{t("about.available_link")}</a>.</p>
      </div>
      <section class="block">{ed("about.services_label", cls="caps")}<ul class="services">{services}</ul></section>
      <section class="block">{ed("about.video_label", cls="caps")}
        <p class="muted blocktext"><span data-edit="about.video_text">{t("about.video_text")}</span> <a class="link" style="color:var(--text)" href="videography.html" data-edit="about.video_link">{t("about.video_link")}</a>.</p>
      </section>
      <section class="block">{ed("about.edit_label", cls="caps")}
        {ed("about.edit_text", "p", "muted blocktext")}
        <div class="compare"><img src="{img(before, "f_auto,q_auto,w_1200")}" alt="Before editing" loading="lazy"><img class="after" src="{img(after, "f_auto,q_auto,w_1200")}" alt="After editing" loading="lazy"><span class="tag l">Before</span><span class="tag r">After</span><div class="bar2"></div><input type="range" min="0" max="100" value="50" aria-label="Compare before and after"></div>
      </section>
    </div>
  </div>
</main>
{foot("About")}
''' + scripts([])


# ---------------------------------------------------------------- CONTACT
def page_contact():
    opts = "".join(f"<option>{esc(o)}</option>" for o in C["contact_page"]["work_types"])
    return head("contact") + bar("Contact") + f'''
<main class="page">
  <div class="contact">
    <div>
      {ed("contact_page.title", "h1")}
      {ed("contact_page.lead", "p", "lead")}
      <ul class="dl">
        <li><span class="caps">Email</span><a href="mailto:{esc(EMAIL)}" data-edit="contact.email" data-kind="email">{esc(EMAIL)}</a></li>
        <li><span class="caps">Phone</span><a href="tel:{esc(TEL)}" data-edit="contact.phone" data-kind="phone">{esc(PHONE)}</a></li>
        <li><span class="caps">Based in</span>{ed("contact.address")}</li>
        <li><span class="caps">Social</span><span><a class="link" href="{t("contact.instagram")}" target="_blank" rel="noopener">Instagram</a> &nbsp; <a class="link" href="{t("contact.pinterest")}" target="_blank" rel="noopener">Pinterest</a> &nbsp; <a class="link" href="{t("contact.facebook")}" target="_blank" rel="noopener">Facebook</a></span></li>
      </ul>
    </div>
    <form class="form" id="contact-form" data-email="{esc(EMAIL)}" novalidate>
      <div class="field"><label class="caps" for="f-name">Name</label><input id="f-name" name="name" autocomplete="name" required></div>
      <div class="field"><label class="caps" for="f-email">Email</label><input id="f-email" name="email" type="email" autocomplete="email" required></div>
      <div class="field full"><label class="caps" for="f-type">Type of work</label><select id="f-type" name="type">{opts}</select></div>
      <div class="field full"><label class="caps" for="f-msg">Message</label><textarea id="f-msg" name="message" required></textarea></div>
      <div class="send"><button class="btn caps" type="submit" data-edit="contact_page.form_button">{t("contact_page.form_button")}</button><span class="muted" id="form-note" aria-live="polite" data-edit="contact_page.form_note">{t("contact_page.form_note")}</span></div>
    </form>
  </div>
</main>
{foot("Contact")}
''' + scripts(["contact"])


# ---------------------------------------------------------------- 404 (served at any depth, so absolute paths)
def page_404():
    pic = img("v1742843706/IMG_6744_1_nzldhi.jpg", "f_auto,q_auto,w_1000,c_fill,ar_4:5,g_auto")
    h = head("home", base="/").replace(f"<title>{esc(get('seo.home_title'))}</title>", f"<title>Page not found — {t('site.name')}</title>")
    return h + bar("", base="/") + f'''
<main class="quiet">
  <div><span class="caps muted">404</span>{ed("notfound.title", "h1")}{ed("notfound.text", "p")}<a class="link" href="/">Back to home</a> &nbsp;&nbsp; <a class="link" href="/portfolio.html">Portfolio</a></div>
  <div class="img"><img src="{pic}" alt=""></div>
</main>
''' + scripts([], base="/")


def data_js():
    photos = [{"id": p["id"], "src": p["src"], "title": p["title"], "cat": p["cat"], "r": p["ratio"], "ph": not p["src"],
               "selected": bool(p.get("selected"))} for p in PHOTOS]
    return ("/* Generated by build.py from data/*.json — edit those files, not this one. */\n"
            f"window.PHOTOS = {json.dumps(photos, ensure_ascii=False)};\n"
            f"window.FILMS = {json.dumps(FILMS, ensure_ascii=False)};\n"
            f"window.SHORTS = {json.dumps(SHORTS, ensure_ascii=False)};\n"
            "window.cld = function (path, w) { return \"https://res.cloudinary.com/ddw247yht/image/upload/f_auto,q_auto,w_\" + w + \",c_limit/\" + path; };\n")


def main():
    if os.path.isdir(OUT):
        shutil.rmtree(OUT)
    shutil.copytree(os.path.join(ROOT, "assets"), os.path.join(OUT, "assets"))
    shutil.copytree(os.path.join(ROOT, "data"), os.path.join(OUT, "data"))
    for f in ("og-image.jpg",):
        if os.path.exists(os.path.join(ROOT, f)):
            shutil.copy(os.path.join(ROOT, f), OUT)
    pages = {"index": page_home(), "portfolio": page_portfolio(), "videography": page_videography(),
             "about": page_about(), "contact": page_contact(), "404": page_404()}
    for name, src in pages.items():
        with open(os.path.join(OUT, name + ".html"), "w", encoding="utf-8") as f:
            f.write(src)
    with open(os.path.join(OUT, "assets", "js", "data.js"), "w", encoding="utf-8") as f:
        f.write(data_js())
    open(os.path.join(OUT, ".nojekyll"), "w").close()
    print("Built", len(pages), "pages into _site/:", ", ".join(n + ".html" for n in pages))


if __name__ == "__main__":
    main()
