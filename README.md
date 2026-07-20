# Tanvir Nahian Links

A one-page static site that lists your projects, contacts, and office websites. Tap or click any row to open the link.

## Live site

Host on **GitHub Pages** — no build step required.

1. Push this repo to GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
4. Choose branch **`main`** (or `master`) and folder **`/ (root)`**.
5. Save. Your site will be at `https://yourusername.github.io/repo-name/`.

## Local preview

Opening `index.html` directly in the browser may block loading `links.json`. Use a simple local server instead:

```bash
# Python
python -m http.server 8080

# Node (npx)
npx serve .
```

Then open `http://localhost:8080`.

## Adding links

See **[EDITING.md](EDITING.md)** for the hidden editor, icon picker, and GitHub save flow.

## Structure

```
index.html
css/styles.css
js/app.js
js/icons.js
js/admin.js
js/admin-config.js
data/links.json
EDITING.md
```

## License

Personal use — update `data/links.json` with your own links and logos.
