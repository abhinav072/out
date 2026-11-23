# theabhinavsingh.com

Plain HTML/CSS/JS — no build step. Pushing to `master` deploys to GitHub Pages via `.github/workflows/static.yml`.

- **Pages:** `index.html`, `portfolio.html`, `about.html`, `contact.html`, `presets.html`, `404.html`
- **Styles:** `assets/css/style.css` (colours and fonts are variables at the top)
- **Portfolio photos:** `assets/js/photos.js` — add a line to add a photo; captions live here too
- **Images** are served from Cloudinary, resized on the fly (`f_auto,q_auto,w_…`)

Preview locally: `python3 -m http.server` and open http://localhost:8000
