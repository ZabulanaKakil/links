# How to Edit Your Links

All links live in **`data/links.json`**. Icons come from an online pool — no image uploads needed.

---

## Hidden edit mode (recommended)

1. Open your live links page.
2. **Tap or click the footer** (“Updated via GitHub”) **5 times quickly**.
3. Enter password: **`Zabulanastas01`**
4. Add, edit, or remove links. Pick an icon from the grid for each link.
5. Click **Reorder links** at the bottom to change order or move links between categories.
6. In reorder mode, use **Up/Down** and the **Category** dropdown, then click **Save current layout**.
7. Click **Save to GitHub** or **Save current layout** — uses the token in `js/admin-config.js`.

The GitHub token is stored in **`js/admin-config.js`** as `githubToken`. Update it there if you regenerate the token on GitHub.

### Repo settings

Edit **`js/admin-config.js`** if your repo name differs:

```javascript
githubOwner: "zabulanakakil",
githubRepo: "My-links-app",
githubBranch: "main"
```

Change the password by updating `passwordHash` in the same file (SHA-256 of your new password).

---

## Icon pool

Each link uses an `"icon"` id from the built-in pool (loaded from [Iconify](https://iconify.design/) online):

| Icon id | Use for |
|---------|---------|
| `whatsapp` | WhatsApp |
| `facebook` | Facebook profile |
| `facebook-page` | Facebook page |
| `instagram` | Instagram |
| `linkedin` | LinkedIn |
| `discord` | Discord |
| `gmail` | Gmail |
| `email` | Other email |
| `phone` | Mobile / phone |
| `github` | GitHub |
| `portfolio` | Portfolio site |
| `news` | News / blog project |
| `event` | Event / office site |
| `office` | Office website |
| `globe` | Generic website |
| `link` | Default / other |

Example in `links.json`:

```json
{
  "name": "WhatsApp",
  "url": "https://wa.me/8801790136979",
  "icon": "whatsapp"
}
```

For usernames without a URL (e.g. Discord):

```json
{
  "name": "Discord",
  "url": "",
  "displayUrl": "@guavanovitch",
  "icon": "discord"
}
```

---

## Manual editing on GitHub

1. Open **`data/links.json`** in your repo.
2. Click the pencil icon (**Edit this file**).
3. Add or change link objects under the right section:

| Section ID | Use for |
|------------|---------|
| `projects` | Projects online |
| `contacts` | Email, phone, social |
| `office` | Office websites |

4. Commit and push. GitHub Pages updates in ~1–2 minutes.

### Copy-paste template

```json
{
  "name": "My Project",
  "url": "https://example.com",
  "icon": "globe"
}
```

### Contact URL formats

- **Email:** `"url": "mailto:you@email.com"`
- **Phone:** `"url": "tel:+8801790136979"`
- **WhatsApp:** `"url": "https://wa.me/8801790136979"`

---

## Common mistakes

| Problem | Fix |
|---------|-----|
| Save failed / 404 | Check `githubOwner` and `githubRepo` in `admin-config.js` |
| Save failed / 401 | Token expired or missing repo write access |
| Site shows “Unable to load links” | JSON syntax error in `links.json` |
| Icon not showing | Use a valid icon id from the table above |

Validate JSON at [jsonlint.com](https://jsonlint.com) if something breaks.

---

## File reference

```
data/links.json       ← link database
js/icons.js           ← online icon pool
js/admin-config.js    ← password + GitHub repo settings
js/admin.js           ← hidden editor
js/app.js             ← renders the page
```
