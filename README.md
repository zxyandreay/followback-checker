# FollowBack Checker

**A privacy-first web app for comparing Instagram followers and following lists from Meta's official data export.**

FollowBack Checker helps Instagram users review who does and does not follow them back without logging in, scraping profiles, or using Instagram APIs. Upload the official export ZIP or the relevant JSON files, then the app parses the data locally in your browser and shows clear, searchable result lists.

[Live Demo](https://zxyandreay.github.io/followback-checker/) | [User Guide](./docs/USER_GUIDE.md) | [Development Guide](./docs/DEVELOPMENT.md)

## Highlights

- Compare accounts you follow, accounts following you, non-mutual follows, followers you do not follow back, and mutuals.
- Upload the full Instagram export ZIP or multi-select loose `following.json` / `following_*.json` and `followers_*.json` files.
- Search within the active result category and export the visible, filtered rows to CSV.
- Process files in the browser with no Instagram login, backend upload, scraping, or follower API access.
- Deploy as a static site suitable for GitHub Pages.

## How It Works

1. Request an Instagram / Meta export that includes **Followers and following** in **JSON** format.
2. Upload the official ZIP or the relationship JSON files to FollowBack Checker.
3. The app extracts, normalizes, deduplicates, and compares usernames in your browser.
4. Review the result categories, filter the active list, and export a CSV when needed.

## Tech Stack

- **Frontend:** Next.js App Router, React
- **Language:** TypeScript
- **Data / Backend:** Browser-local file processing; no backend, database, or account system
- **Tooling:** Tailwind CSS v4, JSZip, ESLint, Vitest
- **Deployment:** Static Next.js export to GitHub Pages

## Getting Started

### Requirements

- Node.js 20 or newer
- npm
- A modern browser for local use

### Install and Run

```bash
git clone https://github.com/zxyandreay/followback-checker.git
cd followback-checker
npm install
npm run dev
```

Open `http://localhost:3000/followback-checker` if the browser does not open automatically. The app uses `/followback-checker` as its Next.js `basePath` so local URLs match the GitHub Pages deployment path.

## Usage

1. Export Instagram data with **Followers and following**, **All time**, and **JSON** selected.
2. Upload the ZIP directly, or select `following.json` / `following_*.json` and every `followers_*.json` file from the export.
3. Choose a result category from the summary counts.
4. Search the active list or export the currently visible rows to CSV.

See the [User Guide](./docs/USER_GUIDE.md) for detailed export settings, supported files, result definitions, and troubleshooting.

## Available Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local Next.js development server |
| `npm run lint` | Run ESLint checks |
| `npm run test` | Run Vitest unit tests |
| `npm run build` | Create the static production export in `out/` |
| `npm run start` | Start the Next.js production server after a build; GitHub Pages uses the static `out/` export instead |

## Data, Privacy, and Security

- **Data storage:** Export files and comparison results are read in browser memory. Refreshing the page or uploading a new export clears the current results.
- **Network use:** The app is served as a static site and does not upload your export files to this project's servers. Profile links open Instagram only when you click them.
- **Authentication:** No Instagram credentials, app account, OAuth flow, or API token is required.
- **Sensitive data:** Instagram exports can contain private relationship data. Do not commit exports, share them publicly, or upload them on devices you do not trust.
- **Data recovery:** The app does not save, sync, or recover previous uploads. Re-upload the export to regenerate results.

## Project Structure

```text
followback-checker/
|-- .github/workflows/     # GitHub Pages deployment workflow
|-- docs/                  # User, development, and implementation notes
|-- public/                # Static assets and .nojekyll for GitHub Pages
|-- src/
|   |-- app/               # Next.js App Router page, layout, icon, and styles
|   |-- components/        # Upload, guide, summary, list, CSV, and footer UI
|   `-- lib/               # Parsing, comparison, username, CSV helpers, and tests
|-- next.config.ts         # Static export, basePath, and asset settings
|-- package.json           # Scripts and dependencies
`-- vitest.config.ts       # Unit test configuration
```

## Documentation

- [User Guide](./docs/USER_GUIDE.md) - Instagram export settings, supported files, results, CSV export, and troubleshooting.
- [Development Guide](./docs/DEVELOPMENT.md) - Local setup, scripts, validation, and GitHub Pages deployment notes.
- [Project Context](./docs/PROJECT_CONTEXT.md) - Architecture, parser behavior, maintenance notes, and debugging details.

## Status and Limitations

**Status:** Active source-available personal product and portfolio project.

- Only Instagram / Meta JSON relationship exports are supported. HTML exports, screenshots, manual lists, scraping, and live account sync are not supported.
- The current parser expects `followers_*.json`; a bare `followers.json` filename is not matched by filename.
- Very large exports are parsed in browser memory, so performance depends on the user's device and browser.
- This project is not affiliated with, endorsed by, or connected to Instagram or Meta. Instagram is a trademark of Meta Platforms, Inc.

## Contributing

Feedback and issue reports are welcome. This project is primarily maintained as a personal product and portfolio reference, so unsolicited feature pull requests may not be accepted.

## License

This project is source-available for learning and portfolio review. It is not open source.

You may view and study the code for personal and educational purposes, but copying, redistribution, publishing, resale, monetization, or commercial use requires written permission from the author.

See [LICENSE](./LICENSE) for the complete terms.

## Author

Built by [zxyandreay](https://github.com/zxyandreay).

[Ko-fi](https://ko-fi.com/zxyandreay)
