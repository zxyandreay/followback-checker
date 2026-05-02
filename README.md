# FollowBack Checker

Compare your official Instagram **Following** and **Followers** data export in the browser. Upload your ZIP or JSON files from `connections/followers_and_following` — no Instagram login, username, or password. All parsing runs locally on your device.

- **Live demo:** https://zxyandreay.github.io/followback-checker/
- **Repository:** https://github.com/zxyandreay/followback-checker/

## Features

- Drag-and-drop or multi-file upload (Instagram export ZIP or loose JSON)
- Tabs: not following back, fans you don’t follow back, mutuals
- Search, counts, and CSV export of the filtered list
- Privacy: data stays in your browser
- In-app guide: **How to Export Your Instagram Data** (Accounts Center, JSON export, where files live)

## How to Export Your Instagram Data

FollowBack Checker needs your **official Instagram data export** in **JSON** format. You do **not** enter your Instagram password in this app; files are processed **only in your browser**.

### Quick steps

1. Open **Instagram** (app or web) and log in.
2. Go to your **profile**, then open **Settings and privacy** (menu is often three lines).
3. Open **Accounts Center**.
4. Open **Your information and permissions**.
5. Choose **Export your information** or **Download your information** (wording may vary).
6. Select your **Instagram account**.
7. When asked what to export, include **Followers and following** (or the closest option that includes connections).
8. Choose format **JSON** — not HTML. This app reads JSON files.
9. Submit the request and wait for Meta to prepare the download.
10. **Download the ZIP** when it is ready.

### Upload here

- **Easiest:** Upload the **ZIP** file from Instagram as-is. The app finds files such as `following.json` and `followers_1.json`, `followers_2.json`, etc.
- **Or:** Open the ZIP on your computer, go to `connections/followers_and_following/`, and upload **`following.json`** plus every **`followers_*.json`** file together (multi-select).

### Recommended export settings

- **Format:** JSON  
- **Date range:** All time, if available  
- **Media quality:** Any  
- **Data:** Followers and following / connections  

### Common mistakes

- Choosing **HTML** instead of JSON — use JSON.
- Uploading **only** `following.json` — you need at least one `followers_*.json` file too.
- Using **screenshots** or a random ZIP — use the official export only.
- **Editing or renaming** export files — prefer the original ZIP.

### Privacy

FollowBack Checker does not ask for your Instagram login. Your export is processed locally and is not uploaded to this project’s servers.

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
