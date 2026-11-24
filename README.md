# theabhinavsingh.com

Photography and film portfolio of Abhinav Singh. Plain HTML, CSS and JavaScript built by one small Python script; no frameworks.

## How it works

- `data/content.json` — every piece of text on the site, plus contact details, social links and Google titles/descriptions.
- `data/photos.json` — the photos (Cloudinary path, title, genre, ratio). Flags: `home` (homepage filmstrip, in order), `selected` (Portfolio's first view), `featured` (the three large homepage photos). Entries with an empty `src` are placeholders.
- `data/films.json` — wide films on the Videography page; the first two also appear on the homepage.
- `data/shorts.json` — vertical short-form edits (reels). Empty shows placeholder cards.
- `build.py` — turns the data files into the pages in `_site/` (not committed).
- `assets/` — styles, scripts and the badge/favicon. `templates/badge.svg` is the animated badge.

Pushing to `master` runs `.github/workflows/static.yml`, which runs `python3 build.py` and publishes `_site/` to GitHub Pages. The site is live about a minute later.

## Editing without code (edit mode)

Add `#edit` to the end of any page address, for example `https://theabhinavsingh.com/#edit`.

1. First time on a device, enter:
   - a GitHub fine-grained token with access to this repository only, permission **Contents: Read and write**, with an expiry date;
   - your Cloudinary cloud name (`ddw247yht`) and an **unsigned upload preset** (images and videos, folder `website`);
   - a passphrase. The token is encrypted with it and stored only in that browser.
2. Click any outlined text to change it. **Photos & videos** opens the media manager (add, replace, delete, reorder, titles, genres, homepage/selected/featured), plus links and Google text under **Site settings**.
3. Press **Save**. Each save is a normal commit, so any change can be undone from the repository history.

Photos are resized in the browser to at most 4000 px before upload; visitors only ever get resized versions from Cloudinary (`f_auto,q_auto,w_…`).

## Local preview

```bash
python3 build.py
```

```bash
cd _site && python3 -m http.server 8000
```

Then open http://localhost:8000.
