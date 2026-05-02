# FollowBack Checker

Compare Instagram **following vs followers** using Meta’s official JSON export in your browser — no login to this app.

- **Live demo:** https://zxyandreay.github.io/followback-checker/
- **Repository:** https://github.com/zxyandreay/followback-checker/

## Features

- Drag-and-drop or multi-file upload (ZIP or loose JSON from your export)
- Tabs: not following back, people you don’t follow back, mutuals
- Search, counts, CSV export
- Built-in **How to export your data** guide (Accounts Center walkthrough)

## How to Export Your Instagram Data

Use Meta’s **Download / Export your information** in **Accounts Center** → **Your information and permissions**. For reliable results with this app:

**Followers and following only · Date range: All time · Format: JSON**

Upload the official **ZIP**, or multi-select `following.json` and every `followers_*.json` from `connections/followers_and_following/` inside the archive.

Full steps, why those settings matter, required files, common mistakes, and privacy details are in the [**live app**](https://zxyandreay.github.io/followback-checker/) — open **How to export your data** from the header.

## Local setup

Requirements: Node.js 20+ recommended.

```bash
npm install
npm run dev
```

Open **http://localhost:3000/followback-checker** — this project uses Next.js `basePath` so local development matches the GitHub Pages URL structure.

```bash
npm run build
```

Static HTML is written to the `out/` directory. This project uses static export, so there is no Node server — preview the built site with any static file server, for example:

```bash
npx serve out
```

Then open **http://localhost:3000/followback-checker/** (port may differ; path must include `/followback-checker/` to match `basePath`).

## Deployment (GitHub Pages)

The site is deployed with GitHub Actions when pushing to `main` (see [.github/workflows/deploy.yml](.github/workflows/deploy.yml)). The app is built as a Next.js **static export** (`output: "export"`) into `out/`, with `basePath` / `assetPrefix` set to `/followback-checker` so assets and routes work under `https://zxyandreay.github.io/followback-checker/`.

### One-time GitHub repository settings

1. **Settings → Pages → Build and deployment**
   - **Source:** GitHub Actions (not “Deploy from a branch”).
2. Ensure the **GitHub Pages** environment is allowed to deploy (default for public repos).
3. Push to `main` to trigger the workflow; the live URL should match the demo link above after the first successful run.

### Notes

- [`public/.nojekyll`](public/.nojekyll) disables Jekyll on GitHub Pages so folders like `_next` are served correctly.

## Tech stack

Next.js (App Router), TypeScript, Tailwind CSS, client-side parsing with [JSZip](https://www.npmjs.com/package/jszip).

## License

See the repository for license information.
