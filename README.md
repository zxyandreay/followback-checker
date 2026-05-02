# FollowBack Checker

Compare your official Instagram **Following** and **Followers** data export in the browser. Upload your ZIP or JSON files from `connections/followers_and_following` — no Instagram login, username, or password. All parsing runs locally on your device.

- **Live demo:** https://zxyandreay.github.io/followback-checker/
- **Repository:** https://github.com/zxyandreay/followback-checker/

## Features

- Drag-and-drop or multi-file upload (Instagram export ZIP or loose JSON)
- Tabs: not following back, people you don’t follow back, mutuals
- Search, counts, and CSV export of the filtered list
- Privacy: data stays in your browser
- In-app guide: **How to Export Your Instagram Data** (Accounts Center, JSON export, where files live)

## How to Export Your Instagram Data

To use FollowBack Checker, you need to download your **official Instagram data export**. The app does **not** need your Instagram password. Your files are processed **locally in your browser**.

**Best export settings:** Followers and following only + All time + JSON

### Recommended Export Settings

- **Data to export:** Followers and following only  
- **Date range:** All time  
- **Format:** JSON  
- **Media quality:** Any option is okay  

### Why these settings matter

Selecting only **Followers and following** keeps the export smaller and faster to prepare. Choosing **All time** helps make sure Instagram includes your complete follower and following lists. Shorter date ranges may only export recent relationship activity and can result in missing files.

### Step-by-step

1. Open the Instagram app or Instagram website and log in.
2. Go to your profile (tap your profile picture).
3. Open **Settings and privacy** (menu icon, usually three lines, top-right).
4. Open **Accounts Center**.
5. Open **Your information and permissions**.
6. Tap **Export your information** or **Download your information** (wording may vary).
7. Select the Instagram account to export.
8. Choose **Followers and following only**. Avoid exporting all data unless necessary — it creates a much larger ZIP and takes longer.
9. Set the date range to **All time**.
10. Choose **JSON** (not HTML).
11. Submit the export request and wait for Meta to prepare the download.
12. Download the **ZIP** when ready.
13. Upload the ZIP to FollowBack Checker (or upload JSON files as described below).

### Where the needed files are usually located

`connections/followers_and_following/`

**Required files:**

- `following.json`
- `followers_1.json`
- `followers_2.json`, `followers_3.json`, etc., if your export splits followers across multiple files

### Upload options

- **ZIP:** Upload the official export ZIP as-is — the app detects the files above.
- **JSON only:** Multi-select `following.json` and every `followers_*.json` from that folder.

### Common mistakes

1. Choosing **HTML** instead of JSON — this app needs JSON.
2. Choosing a **short date range** — may omit complete followers/following files.
3. Uploading **only** `following.json` — you also need at least one `followers_*.json`.
4. Exporting **all Instagram data** — may still work, but the ZIP is larger and slower to prepare.
5. Uploading **screenshots** — not supported.
6. Uploading the **wrong ZIP** — use the file from your official data export only.
7. **Renaming or editing** files — prefer uploading the original ZIP unchanged.

### Privacy

FollowBack Checker does not ask for your Instagram **username**, **password**, or **login**. Your data is processed locally in your browser and is not uploaded to a server.

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
