# FollowBack Checker

Compare your official Instagram **Following** and **Followers** data export in the browser. Upload your ZIP or JSON files from `connections/followers_and_following` — no Instagram login, username, or password. All parsing runs locally on your device.

- **Live demo:** https://zxyandreay.github.io/followback-checker/
- **Repository:** https://github.com/zxyandreay/followback-checker/

## Features

- Drag-and-drop or multi-file upload (Instagram export ZIP or loose JSON)
- Tabs: not following back, fans you don’t follow back, mutuals
- Search, counts, and CSV export of the filtered list
- Privacy: data stays in your browser

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
