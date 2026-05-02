# FollowBack Checker

FollowBack Checker is a privacy-focused web app that compares **your** Instagram **following** and **followers** lists using **Meta’s official data export**. You upload the ZIP or JSON files from that export; the app runs entirely in your browser and helps you see:

- **Accounts you follow that do not follow you back**
- **Followers you do not follow back**
- **Mutuals** (accounts that follow each other)
- Your full **following** list
- Your full **followers** list

The app does **not** connect to Instagram on your behalf. It does not ask for your Instagram password, username for scraping, or API access—it only reads files you already downloaded from Instagram’s export flow.

**Live demo:** [https://zxyandreay.github.io/followback-checker/](https://zxyandreay.github.io/followback-checker/)

**Repository:** [https://github.com/zxyandreay/followback-checker](https://github.com/zxyandreay/followback-checker)

---

## Key features

- **ZIP upload** — Upload Instagram’s official export archive; the app finds the right JSON inside.
- **Direct JSON upload** — Upload `following.json` / `following_*.json` and `followers_*.json` without zipping them (multi-select supported).
- **Local browser processing** — Parsing and comparison run in your browser via client-side JavaScript.
- **No Instagram login** — This app never asks you to sign in to Instagram.
- **Comparison + full lists** — Clickable summary counts switch between the five views above (full following, full followers, and the three comparison lists).
- **Search** — Filter the **currently selected** list by username substring.
- **CSV export** — Download the **currently selected and filtered** list as CSV.
- **Export guide** — In-app **How to export your data** walkthrough (Accounts Center-oriented); footer shortcuts from errors include **View guide**.
- **Responsive UI** — Layout works on common screen sizes; styling supports light and dark preferences.
- **Static hosting** — Built as a static site suitable for GitHub Pages (see [Deployment](#deployment)).

---

## Privacy-first approach

- **No Instagram credentials** — Passwords and logins are not collected or used.
- **No scraping** — The app does not crawl Instagram or third-party profile pages.
- **No Instagram API** — There is no server-side call to Instagram or Meta APIs for your lists.
- **Local processing** — Files you choose are read in the browser; list comparison runs on your device.
- **No upload to this project’s servers** — There is no backend in this stack that receives your export; processing is client-side only for the deployed static app.
- **Not affiliated with Instagram or Meta** — This is an independent tool. See [Disclaimer](#disclaimer).

---

## How it works

1. You request and download your information from Instagram / Meta (**Accounts Center** → export/download flow).
2. You open FollowBack Checker and upload either the **official ZIP** or the relevant **JSON** files.
3. The app reads Instagram’s follower/following JSON (see [Supported files](#supported-files)), including `followers_*.json` shards and `following.json` (or `following_*.json`).
4. It builds two username lists (following vs followers), deduplicates, and compares them.
5. You pick a category via the **summary cards**, optionally **search**, and optionally **Export to CSV** for what you see in that view.

---

## How to export Instagram data

Use Meta’s **Download / Export your information** in **Accounts Center** → **Your information and permissions** (wording may vary slightly by locale).

### Recommended settings

| Setting | Recommendation |
|--------|----------------|
| **Data to export** | **Followers and following** only (or the smallest scope that includes both). |
| **Date range** | **All time** |
| **Format** | **JSON** |
| **Media quality** | Any option is fine for this app (it does not rely on photos/videos for lists). |

### Why these settings help

- **Followers and following only** keeps the download smaller and faster than exporting your whole account.
- **All time** helps ensure Instagram includes complete follower/following snapshots rather than a narrow window that might omit data you care about.
- **JSON** is required because FollowBack Checker parses Instagram’s JSON relationship files. **HTML-only exports are not supported.**

### Where files usually live

Inside the ZIP, relationship JSON is typically under:

`connections/followers_and_following/`

### Important filenames

- `following.json` — and sometimes additional shards named like `following_*.json`
- `followers_1.json`, `followers_2.json`, … — Instagram splits followers across numbered files when the list is large

---

## Supported files

| You can upload | Notes |
|----------------|--------|
| **Full Instagram export ZIP** | Must contain the JSON relationship files the app recognizes (see parser logic in `src/lib/instagram-export.ts`). |
| **`following.json` / `following_*.json`** | Loose files or inside the ZIP. |
| **`followers_*.json`** | Names match `followers_<something>.json` (e.g. `followers_1.json`). A bare `followers.json` name is **not** matched by the follower shard pattern—use the files Instagram generated. |

If the ZIP has JSON but **none** of the expected follower/following files, the app will tell you it could not find them—often because the export was **HTML-only**, the wrong partial export, or files were moved/renamed.

---

## Common upload issues

- **Exported HTML instead of JSON** — The app expects JSON relationship files. HTML-only archives won’t work.
- **Date range too narrow** — If Instagram omits follower/following shards or leaves lists incomplete, comparisons may be wrong or files may be missing.
- **Only `following.json` without `followers_*.json`** — Followers shards are required; upload every `followers_*.json` from the export (or use the full ZIP).
- **Wrong ZIP** — Using an old backup, a different product’s archive, or a trimmed folder may omit `connections/followers_and_following/`.
- **Export missing Followers and following** — If your request didn’t include that category, the JSON won’t be there.
- **Renamed or hand-edited JSON** — If filenames no longer match expected patterns and the JSON shape isn’t recognized, files may be skipped or parsing may fail.

When something fails, read the on-screen message—it is aligned with the checks in `parseInstagramExportFromFiles`. The live app also links to **How to export your data** for step-by-step help.

---

## Tech stack

From `package.json` and config:

- **Next.js** (App Router), **React**, **TypeScript**
- **Tailwind CSS** v4 (via PostCSS)
- **JSZip** — Reading JSON entries from ZIP archives in the browser
- **ESLint** (`eslint-config-next`)
- **Vitest** — Unit tests for parsing/helpers (`src/**/*.test.ts`)

Hosted builds use **GitHub Pages** (see below); that is deployment infrastructure, not a runtime dependency of the app logic.

---

## Local development

Requirements: **Node.js 20+** recommended (matches CI).

```bash
git clone https://github.com/zxyandreay/followback-checker.git
cd followback-checker
npm install
npm run dev
```

Open **http://localhost:3000/followback-checker** — the project sets Next.js `basePath` to `/followback-checker` so local URLs match the GitHub Pages path.

**Production build** (static export to `out/`):

```bash
npm run build
```

Preview the static output with any static file server, for example:

```bash
npx serve out
```

Then open the site under **`/followback-checker/`** on your preview host (port may vary), e.g. **http://localhost:3000/followback-checker/** when using `serve`.

**Other scripts:**

```bash
npm run lint   # ESLint
npm run test   # Vitest (library tests)
npm run start  # Next.js production server (not required for static GitHub Pages hosting)
```

---

## Deployment

GitHub Actions deploys the static site when you push to **`main`**.

- **Workflow:** [.github/workflows/deploy.yml](.github/workflows/deploy.yml)
- **Steps:** checkout → Node 20 → `npm ci` → `npm run build` → upload **`out/`** as Pages artifact → deploy to GitHub Pages.
- **Live URL:** [https://zxyandreay.github.io/followback-checker/](https://zxyandreay.github.io/followback-checker/) (same as the demo link above).

### One-time repository settings

1. **Settings → Pages → Build and deployment** — set **Source** to **GitHub Actions** (not “Deploy from a branch”).
2. After the first successful run, Pages should serve the built app.

[`public/.nojekyll`](public/.nojekyll) prevents Jekyll from stripping paths like `_next` on GitHub Pages.

---

## Project structure

```
followback-checker/
├── .github/workflows/     # GitHub Pages deploy workflow
├── public/                # Static assets, .nojekyll
├── src/
│   ├── app/               # Next.js App Router (layout, home page)
│   ├── components/        # UI (upload, results, guide, CSV, footer credit)
│   └── lib/               # Parsing, compare, CSV helpers + tests
├── next.config.ts         # Static export, basePath / assetPrefix
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

---

## CSV export

After results load, choose a category with the **summary cards**, optionally type in **Search**, then click **Export to CSV**. The file includes only the **visible (filtered) usernames** for that category (default filename: `followback-checker-export.csv`). The button is disabled when there are no rows to export.

---

## Disclaimer

This project is **not** affiliated with, endorsed by, or connected to Instagram or Meta. **Instagram** is a trademark of Meta Platforms, Inc.

---

## Support

If you find this project useful, you can optionally support the creator on Ko-fi:

https://ko-fi.com/zxyandreay

---

## License

License not specified yet.
