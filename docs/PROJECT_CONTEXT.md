# FollowBack Checker - AI Project Context

This document is the canonical handoff for this repository. It is written so
an assistant can understand what the app is, how it is built, where behavior
lives, and how to debug or extend it without rediscovering the whole project.

Repository root:

```text
D:\!Main\Project\Cursor\followback-checker
```

## 1. Project Identity

FollowBack Checker is a privacy-first static web app for comparing Instagram
following and followers lists from Meta's official account data export.

The user uploads either:

- the official Instagram export ZIP, or
- loose JSON relationship files from that export.

The app then parses the files in the browser, builds normalized username lists,
compares them, and shows five result views:

- accounts the user follows that do not follow the user back
- followers the user does not follow back
- mutuals
- full following list
- full followers list

The live deployment is intended for GitHub Pages under:

```text
https://zxyandreay.github.io/followback-checker/
```

The app is source-available for learning and portfolio review. Commercial use,
redistribution, publishing, or monetization requires permission from the author.
See `LICENSE`.

## 2. Product Goals And Non-Goals

### Goals

- Help users understand their Instagram follower/following relationship lists.
- Use only files the user already downloaded through Instagram/Meta's official
  export flow.
- Process user data locally in the browser.
- Avoid collecting Instagram credentials.
- Avoid backend storage, database persistence, or server-side file ingestion.
- Provide clear, user-facing error messages when the export is missing files or
  is in the wrong format.
- Stay static-host compatible for GitHub Pages.

### Non-Goals

- No Instagram login.
- No Instagram scraping.
- No third-party profile crawling.
- No Instagram or Meta API usage for follower/following data.
- No server upload of user exports.
- No account automation.
- No live sync with Instagram.
- No support for HTML-only Instagram exports.
- No support for screenshots or manually typed lists.

## 3. User Workflow

The intended user flow is:

1. The user opens Instagram or Meta Accounts Center.
2. The user requests an account export with:
   - data scope: Followers and following
   - date range: All time
   - format: JSON
   - media quality: any value
3. Meta prepares a ZIP download.
4. The user opens FollowBack Checker.
5. The user uploads either the whole ZIP or the relevant JSON files.
6. The app reads the files locally in the browser.
7. The parser extracts normalized lowercase usernames from following and
   followers payloads.
8. The comparison logic deduplicates and compares the two sets.
9. The UI defaults to the "Not Following Back" result category.
10. The user can switch categories through summary cards.
11. The user can search within the active category.
12. The user can export the currently selected and filtered list to CSV.

## 4. Feature Inventory

### Upload

- Drag and drop upload area.
- Click-to-browse upload.
- Accepts ZIP and JSON files by default.
- The guide modal can open a JSON-only picker.
- Multiple loose JSON files can be selected at once.
- Upload is disabled while parsing is busy.

### Parsing

- ZIP parsing is handled by JSZip in the browser.
- ZIP member paths are flexible. The app matches by basename, not by requiring a
  single exact internal directory.
- Loose JSON files can be classified by filename or by top-level JSON shape.
- Common unrelated Instagram relationship files are ignored by basename.
- Duplicate usernames are removed.
- Usernames are normalized to lowercase.

### Results

The app exposes five categories:

- `following`: all accounts the user follows
- `followers`: all accounts that follow the user
- `notFollowingBack`: accounts the user follows but that are not followers
- `peopleYouDontFollowBack`: followers who are not in the user's following list
- `mutuals`: accounts present in both lists

### Search

- Search applies only to the active category.
- Search trims the query and lowercases it.
- Matching uses substring search against already-normalized usernames.
- The query does not change the underlying parsed/computed lists.

### CSV Export

- Exports only the currently selected and filtered result rows.
- Default filename: `followback-checker-export.csv`.
- Header: `username,category`.
- Every CSV cell is double-quoted.
- Double quotes inside values are escaped by doubling them.
- The export button is disabled when there are zero rows.

### Guide And Privacy UX

- A privacy banner tells users no Instagram login is required and files are
  processed locally.
- A modal guide explains how to export Instagram data from Accounts Center.
- Error messages include a "View guide" action.
- The footer credits the author and links to Ko-fi.

### Styling

- Tailwind CSS v4 is used through PostCSS.
- The UI supports light and dark color schemes.
- Main layout is responsive.
- The app uses a compact single-page workflow rather than multi-route
  navigation.

## 5. Supported Input Files

The parser supports these Instagram relationship files:

```text
following.json
following_*.json
followers_*.json
```

Important details:

- `following.json` is supported.
- `following_anything.json` is supported.
- `followers_anything.json` is supported.
- A bare `followers.json` is not currently matched by filename.
- ZIP member paths may be nested anywhere, as long as the basename matches.
- The README says files are usually under
  `connections/followers_and_following/`, but code does not require that exact
  path.
- HTML exports are unsupported.
- JSON files with unsupported names can still be classified if their top-level
  object shape contains `relationships_following` or `relationships_followers`.

Ignored relationship basenames:

```text
recently_unfollowed_profiles.json
removed_suggestions.json
blocked_profiles.json
close_friends.json
pending_follow_requests.json
recent_follow_requests.json
custom_lists.json
```

These ignored files are skipped even if their payload shape looks similar to a
following/follower relationship file.

## 6. Instagram Data Shapes

Instagram export shapes can vary, so the parser is intentionally defensive.

### Follower JSON Shape

Followers are often represented as an array:

```json
[
  {
    "title": "",
    "string_list_data": [
      {
        "href": "https://www.instagram.com/example_user",
        "value": "example_user",
        "timestamp": 1773296472
      }
    ]
  }
]
```

The follower parser also accepts an object with a `relationships_followers`
array:

```json
{
  "relationships_followers": [
    {
      "title": "",
      "string_list_data": [
        {
          "href": "https://www.instagram.com/example_user",
          "value": "example_user",
          "timestamp": 1773296472
        }
      ]
    }
  ]
}
```

### Following JSON Shape

Following is expected as an object with a `relationships_following` array:

```json
{
  "relationships_following": [
    {
      "title": "example_user",
      "string_list_data": [
        {
          "href": "https://www.instagram.com/_u/example_user",
          "timestamp": 1775470267
        }
      ]
    }
  ]
}
```

The relationship item extraction logic is shared by both followers and
following.

## 7. Username Normalization And Extraction

Username helpers live in:

```text
src/lib/instagram-username.ts
```

Normalization:

- trim surrounding whitespace
- strip a leading `@`
- trim again after stripping `@`
- reject empty strings
- lowercase the result
- preserve dots, underscores, and digits

Instagram URL parsing:

- requires the URL host to end with `instagram.com`
- strips a leading `www.`
- ignores non-Instagram hosts
- removes trailing slashes from the path
- splits the path into segments
- supports `_u/<username>` URLs by skipping the `_u` segment
- ignores query strings naturally through the `URL` API

Relationship item extraction priority:

1. first `string_list_data[0].value`
2. top-level `title`
3. top-level `value`
4. first `string_list_data[0].href` parsed as an Instagram URL
5. top-level `href` parsed as an Instagram URL
6. return `null` if nothing usable exists

This priority matters. For example, if a following item has both a `title` and
an `_u` URL, the title wins.

## 8. Parsing Pipeline

Main parser:

```text
src/lib/instagram-export.ts
parseInstagramExportFromFiles(files: File[]): Promise<InstagramParseResult>
```

High-level pipeline:

1. Initialize arrays for following JSON texts and follower JSON texts.
2. Iterate over every uploaded `File`.
3. If a file ends with `.zip`:
   - read it as an ArrayBuffer
   - load it with JSZip
   - count JSON entries
   - match entries by basename
   - read matching entries as strings
   - separate following texts from follower texts
4. If a file ends with `.json`:
   - read it as text
   - classify it as following, followers, or unsupported
   - add recognized text to the relevant array
5. Validate that recognized files were found.
6. Validate that both following and follower files exist.
7. Parse following JSON texts.
8. Parse follower JSON texts.
9. Extract usernames from every recognized relationship item.
10. Track diagnostics:
    - follower files found
    - following files found
    - raw follower entries
    - raw following entries
    - parsed followers before dedupe
    - parsed following before dedupe
    - unique followers
    - unique following
11. Deduplicate usernames with `new Set(...)`.
12. Fail if either unique list is empty.
13. Return the two username arrays on success.

### ZIP Matching Details

ZIP paths are normalized by:

- replacing backslashes with forward slashes
- removing leading slashes
- extracting the basename after the final slash

The parser counts every `.json` ZIP entry, but only reads entries whose basename
matches following/followers rules and is not ignored.

If JSZip cannot read the archive, the parser returns a friendly "Could not read
that ZIP file" failure instead of throwing to the UI.

### Loose JSON Classification

Loose JSON classification order:

1. Reject if filename does not end with `.json`.
2. Reject if basename is ignored.
3. Accept by following filename.
4. Accept by followers filename.
5. Parse JSON.
6. If object has `relationships_following` array, classify as following.
7. If object has `relationships_followers` array, classify as followers.
8. Otherwise ignore the file.

If loose JSON has invalid syntax and does not have a recognized filename, it is
ignored during classification. If it has a recognized filename, syntax errors
are caught later and reported as an official export parsing problem.

### Parse Result Types

```ts
export type InstagramParseSuccess = {
  ok: true;
  followingUsernames: string[];
  followerUsernames: string[];
};

export type InstagramParseFailure = {
  ok: false;
  message: string;
};

export type InstagramParseResult =
  | InstagramParseSuccess
  | InstagramParseFailure;
```

### Main Failure Cases

The parser returns `ok: false` for these user-facing cases:

- unreadable ZIP
- ZIP contains no JSON files
- ZIP contains JSON files but none matching follower/following basenames
- no recognized export files
- missing following files
- missing follower files
- JSON syntax failure in a recognized file
- following files found but no usernames extracted
- follower files found but no usernames extracted

The "no usernames extracted" failures include diagnostics to help debugging.

## 9. Comparison Model

Comparison logic lives in:

```text
src/lib/compare-follow-lists.ts
```

Core type:

```ts
export type CompareResult = {
  notFollowingBack: string[];
  peopleYouDontFollowBack: string[];
  mutuals: string[];
};
```

Algorithm:

- Build a `Set` for following usernames.
- Build a `Set` for follower usernames.
- `notFollowingBack` is `followingSet - followerSet`.
- `peopleYouDontFollowBack` is `followerSet - followingSet`.
- `mutuals` is `followingSet` intersected with `followerSet`.
- Sort each output with `localeCompare`.

The parser already deduplicates, but the comparison logic uses sets too, so it
is stable even if duplicate input arrays are passed.

The full following and full followers views do not come from `CompareResult`.
They are sorted source lists kept separately in page state.

## 10. Result Categories

Category definitions live in:

```text
src/lib/result-category.ts
```

Type:

```ts
export type ResultCategoryId =
  | "following"
  | "followers"
  | "notFollowingBack"
  | "peopleYouDontFollowBack"
  | "mutuals";
```

Labels:

```ts
export const CATEGORY_LABELS: Record<ResultCategoryId, string> = {
  following: "Following",
  followers: "Followers",
  notFollowingBack: "Not Following Back",
  peopleYouDontFollowBack: "People You Don't Follow Back",
  mutuals: "Mutuals",
};
```

Note: the source file may use typographic punctuation in some UI strings. This
documentation intentionally stays ASCII.

## 11. UI And State Architecture

The app is a single-page App Router route.

### Root Layout

File:

```text
src/app/layout.tsx
```

Responsibilities:

- imports global CSS
- configures Geist and Geist Mono through `next/font/google`
- defines metadata:
  - title: `FollowBack Checker`
  - description: local-browser Instagram export comparison
- renders page children
- renders a footer with `SiteFooterCredits`

The layout is a Server Component by default. It can import Client Components
when appropriate.

### Main Page

File:

```text
src/app/page.tsx
```

This file starts with `"use client"` because it owns interactive browser state,
file input handling, DOM scrolling, and browser file APIs.

State owned by `Home`:

- `busy`: true while upload parsing is running
- `error`: user-facing parser or generic read error
- `compare`: computed `CompareResult` or null
- `totals`: total following/follower counts or null
- `sourceLists`: sorted full following and followers arrays or null
- `activeCategory`: selected `ResultCategoryId`
- `search`: current search query
- `guideOpen`: whether the export guide modal is open
- `uploadDropzoneRef`: imperative handle for opening file pickers

Important page callbacks:

- `scrollToUpload()`: smooth-scrolls to `#upload-section`
- `afterGuideClosePickFiles(mode)`: closes guide, scrolls, then opens selected
  picker in a microtask
- `resetForNewUpload()`: clears result/error/search state, resets category to
  `notFollowingBack`, scrolls, then opens ZIP/JSON picker in a microtask
- `handleFiles(files)`: parses files, handles failures, computes sorted source
  lists and comparisons, resets search/category after success

Derived values:

- `activeList`: the list for the selected category
- `filteredList`: `activeList` filtered by the search query
- `csvRows`: filtered usernames mapped to `{ username, category }`
- `categoryHeading`: display label for the selected category

Default selected category:

```text
notFollowingBack
```

### Component Responsibilities

#### `src/components/UploadDropzone.tsx`

- Client Component.
- Exposes an imperative ref:

```ts
export type UploadDropzoneHandle = {
  openFilePicker: (mode: "json" | "zipOrJson") => void;
};
```

- Owns hidden file inputs:
  - one accepts `.zip,.json,application/zip,application/json`
  - one accepts `.json,application/json`
- Handles drag enter, drag leave, drag over, and drop.
- Converts `FileList` to `File[]`.
- Clears input value after selection so the same file can be selected again.

#### `src/components/ExportGuideModal.tsx`

- Client Component.
- Uses native `<dialog>`.
- Syncs the `open` prop with `showModal()` and `close()`.
- Calls `onClose` when the dialog emits `close`.
- Shows recommended export settings and step-by-step Accounts Center guidance.
- Footer buttons trigger:
  - JSON-only picker
  - ZIP or JSON picker

#### `src/components/PrivacyBanner.tsx`

- Shows the local-processing/no-login privacy message.
- Uses `role="status"`.

#### `src/components/SummaryCounts.tsx`

- Client Component.
- Renders five selectable summary cards in a fixed order:
  - following
  - followers
  - notFollowingBack
  - peopleYouDontFollowBack
  - mutuals
- Uses `aria-pressed` to mark the active card.
- Calls `onSelect(id)` when a card is clicked.

#### `src/components/UsernameList.tsx`

- Renders an empty message if no usernames are present.
- Otherwise renders a scrollable list with `@username` rows.
- Rows use monospace styling.

#### `src/components/ExportCsvButton.tsx`

- Client Component.
- Calls `downloadCsv(filename, rows)` on click.
- Defaults filename to `followback-checker-export.csv`.
- Disabled if `disabled` prop is true or `rows.length === 0`.

#### `src/components/SiteFooterCredits.tsx`

- Exports `KOFI_URL`.
- Renders attribution and a Ko-fi link.

## 12. CSV Helper

File:

```text
src/lib/csv.ts
```

Core type:

```ts
export type CsvRow = {
  username: string;
  category: string;
};
```

Functions:

- `buildCsvContent(rows)`: creates CSV text with a header and escaped cells.
- `downloadCsv(filename, rows)`: creates a Blob, object URL, temporary anchor,
  clicks it, removes it, and revokes the object URL.

CSV output example:

```csv
username,category
"example_user","Not Following Back"
"another.user","Not Following Back"
```

## 13. Project Structure

Important source tree:

```text
followback-checker/
  .github/
    workflows/
      deploy.yml
  public/
    .nojekyll
    file.svg
    globe.svg
    next.svg
    vercel.svg
    window.svg
  src/
    app/
      favicon.ico
      globals.css
      icon.svg
      layout.tsx
      page.tsx
    components/
      ExportCsvButton.tsx
      ExportGuideModal.tsx
      PrivacyBanner.tsx
      SiteFooterCredits.tsx
      SummaryCounts.tsx
      UploadDropzone.tsx
      UsernameList.tsx
    lib/
      compare-follow-lists.ts
      csv.ts
      instagram-export.test.ts
      instagram-export.ts
      instagram-username.test.ts
      instagram-username.ts
      result-category.ts
  AGENTS.md
  CLAUDE.md
  LICENSE
  PROJECT_ANALYSIS.md
  README.md
  eslint.config.mjs
  next-env.d.ts
  next.config.ts
  package-lock.json
  package.json
  postcss.config.mjs
  tsconfig.json
  vitest.config.ts
```

Generated or dependency directories:

- `.next/`: Next build/dev output
- `out/`: static export output from `next build`
- `node_modules/`: installed dependencies

## 14. Tooling And Configuration

### Package Scripts

Defined in `package.json`:

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "test": "vitest run"
}
```

On this Windows environment, prefer `npm.cmd run ...` when running scripts from
PowerShell if `npm.ps1` is blocked by execution policy.

### Main Dependencies

- `next`: `16.2.4`
- `react`: `19.2.4`
- `react-dom`: `19.2.4`
- `jszip`: `^3.10.1`

### Main Dev Dependencies

- `typescript`: `^5`
- `tailwindcss`: `^4`
- `@tailwindcss/postcss`: `^4`
- `eslint`: `^9`
- `eslint-config-next`: `16.2.4`
- `vitest`: `^4.1.5`

### TypeScript

File:

```text
tsconfig.json
```

Important settings:

- `strict: true`
- `noEmit: true`
- `moduleResolution: "bundler"`
- `jsx: "react-jsx"`
- `target: "ES2017"`
- `lib: ["dom", "dom.iterable", "esnext"]`
- path alias: `@/*` maps to `./src/*`
- includes `.next/types/**/*.ts` and `.next/dev/types/**/*.ts`

### ESLint

File:

```text
eslint.config.mjs
```

Uses:

- `eslint-config-next/core-web-vitals`
- `eslint-config-next/typescript`

Global ignores:

- `.next/**`
- `out/**`
- `build/**`
- `next-env.d.ts`

### Vitest

File:

```text
vitest.config.ts
```

Important settings:

- environment: `node`
- include: `src/**/*.test.ts`
- alias: `@` resolves to `./src`

Current tests are library-focused and do not use a browser/DOM test
environment.

### Tailwind And CSS

Files:

```text
postcss.config.mjs
src/app/globals.css
```

PostCSS uses the Tailwind v4 plugin:

```js
"@tailwindcss/postcss": {}
```

Global CSS:

- imports Tailwind with `@import "tailwindcss";`
- defines `--background` and `--foreground`
- sets theme variables for colors and fonts
- responds to `prefers-color-scheme: dark`
- sets body background, color, and font family

## 15. Next.js And Static Export Notes

This repo uses Next.js `16.2.4`. Do not assume older Next.js behavior from
memory. The repository-level `AGENTS.md` explicitly says this is not the
Next.js you know and instructs agents to read relevant docs under:

```text
node_modules/next/dist/docs/
```

Relevant docs for this app include:

- `01-app/02-guides/static-exports.md`
- `01-app/03-api-reference/01-directives/use-client.md`
- `01-app/01-getting-started/03-layouts-and-pages.md`
- `01-app/01-getting-started/11-css.md`
- `01-app/01-getting-started/13-fonts.md`

The app uses the App Router under `src/app`.

Static export config:

```ts
const nextConfig = {
  output: "export",
  basePath: "/followback-checker",
  assetPrefix: "/followback-checker",
  images: {
    unoptimized: true,
  },
};
```

Implications:

- `npm run build` creates static assets in `out/`.
- The app must remain compatible with static hosting.
- Avoid server-only features unless the deployment model changes.
- Avoid API routes, dynamic server request handling, cookies, rewrites,
  redirects, headers, server actions, and default Next image optimization for
  this static deployment.
- Client Components are still prerendered during build, so direct browser API
  use must be inside client-safe code paths.

## 16. Deployment

Deployment workflow:

```text
.github/workflows/deploy.yml
```

Trigger:

- push to `main`

Permissions:

- `contents: read`
- `pages: write`
- `id-token: write`

Build job:

1. checkout
2. setup Node.js 20
3. enable npm cache
4. `npm ci`
5. `npm run build`
6. upload `out/` as GitHub Pages artifact

Deploy job:

1. depends on build
2. deploys with `actions/deploy-pages@v4`

Static-hosting support:

- `public/.nojekyll` is present so GitHub Pages does not process the output
  through Jekyll or strip paths such as `_next`.
- `basePath` and `assetPrefix` are both `/followback-checker`, matching the
  repository Pages path.

Local development URL:

```text
http://localhost:3000/followback-checker
```

This path matters because of the configured base path.

## 17. Testing Snapshot

Current test files:

```text
src/lib/instagram-export.test.ts
src/lib/instagram-username.test.ts
```

Current covered behavior:

- loose `following.json` plus `followers_1.json` parsing
- representative follower/following payload shapes
- structural classification of following JSON with a non-standard filename
- ignored loose JSON basenames
- username normalization:
  - trims
  - strips `@`
  - lowercases
  - preserves dots, underscores, and digits
  - rejects empty values
- Instagram URL parsing:
  - standard profile URL
  - `_u` URL
  - query string and trailing slash handling
  - non-Instagram host rejection
- relationship item extraction:
  - `string_list_data[0].value`
  - title before href
  - href fallback

Useful commands:

```powershell
npm.cmd run test
npm.cmd run lint
npm.cmd run build
npm.cmd run dev
```

Use `npm.cmd` in PowerShell if `npm` is blocked by script execution policy.

Known test gaps:

- ZIP member matching edge cases
- mixed ZIP plus loose JSON uploads
- ZIPs with JSON files but no matched basenames
- exact diagnostic string assertions
- parser behavior for very large exports
- UI integration around upload success/failure
- category switching and search UI behavior
- CSV button enabled/disabled UI behavior
- native dialog behavior

## 18. Known Risks And Maintenance Notes

### Large Export Memory Use

The parser reads matching ZIP entries into string arrays before parsing them.
For very large exports, peak memory can grow because the app may hold:

- the ZIP ArrayBuffer
- JSZip internal structures
- JSON strings
- parsed JSON objects during each parse
- username arrays
- deduped username arrays
- sorted result arrays

Potential future improvement: process ZIP entries incrementally and avoid
holding every JSON text at once.

### Parser/UI Coupling Through Message Strings

The parser returns user-facing error messages directly. This is simple, but it
means UI behavior, tests, and future localization could become coupled to
message text.

Potential future improvement: return typed error codes plus display messages.

### Filename Strictness

`followers_*.json` is supported. A bare `followers.json` is not matched by
filename. This appears intentional in current behavior because Instagram
normally shards followers as `followers_1.json`, `followers_2.json`, and so on.

Changing this behavior would require parser tests and README/docs updates.

### No UI Integration Tests

The current automated tests cover library behavior only. UI workflows are not
covered by Playwright, Cypress, React Testing Library, or browser-based Vitest.

### Static Export Constraints

Because deployment is a static export to GitHub Pages, avoid adding runtime
features that require a Node.js server unless the deployment architecture is
changed at the same time.

### Privacy Posture

The core trust claim is that exports are processed locally and not uploaded to
project servers. Any new telemetry, analytics, backend endpoint, cloud function,
or remote parsing service would materially change the product promise and must
be treated as a major product decision.

## 19. Debugging Guide

### "Could not read that ZIP file"

Likely area:

```text
src/lib/instagram-export.ts
collectFromZipFile()
readZipEntries()
JSZip.loadAsync()
```

Likely causes:

- uploaded file is not a real ZIP
- corrupt or partial download
- unsupported archive format

What to inspect:

- whether `file.name` ends with `.zip`
- whether `file.arrayBuffer()` succeeds
- whether JSZip throws during `loadAsync`

### "ZIP does not contain JSON files"

Likely area:

```text
readZipEntries()
jsonEntryCount
```

Likely causes:

- user exported HTML instead of JSON
- wrong ZIP file
- ZIP has no `.json` entries

What to inspect:

- ZIP internal filenames
- whether basenames end with `.json`

### "No follower/following JSON was found"

Likely area:

```text
zipMemberMatchesExportBasename()
isFollowingBasename()
isFollowersBasename()
isIgnoredBasename()
```

Likely causes:

- export did not include Followers and following
- filenames do not match expected patterns
- user uploaded an unrelated Meta export
- JSON exists but not relationship JSON

What to inspect:

- `matchedPathCount`
- exact ZIP entry basenames
- ignored basename list

### "Could not find following.json or following_*.json"

Likely area:

```text
parseInstagramExportFromFiles()
followingTexts.length
classifyLooseJsonFile()
```

Likely causes:

- user selected follower files only
- export omitted following data
- following file was renamed and shape classification failed

What to inspect:

- uploaded filenames
- top-level `relationships_following` array

### "Could not find followers_*.json files"

Likely area:

```text
parseInstagramExportFromFiles()
followerTexts.length
classifyLooseJsonFile()
```

Likely causes:

- user selected only `following.json`
- export omitted follower data
- user has a bare `followers.json`, which is not filename-matched
- renamed follower file is an array, so structural classification cannot infer
  `relationships_followers`

What to inspect:

- uploaded follower filenames
- whether follower JSON is an array or object
- whether support for bare `followers.json` is desired

### "One of the JSON files could not be parsed"

Likely area:

```text
parseFollowersJsonText()
parseFollowingJsonText()
JSON.parse()
```

Likely causes:

- invalid JSON
- user uploaded edited or truncated file
- file extension says JSON but contents are not JSON

What to inspect:

- exact recognized file that reaches parse phase
- JSON syntax validity

### Files Found But No Usernames Extracted

Likely area:

```text
parseFollowersPayload()
parseFollowingPayload()
extractUsernameFromRelationshipItem()
normalizeUsername()
usernameFromInstagramUrl()
```

Likely causes:

- Instagram changed export shape
- relationship entries do not use expected fields
- values are empty
- hrefs are missing or not Instagram URLs

What to inspect:

- diagnostic counts in the returned error message
- raw item shape
- whether username is in a new field not currently checked

### Results Look Wrong

Likely areas:

```text
src/lib/instagram-username.ts
src/lib/compare-follow-lists.ts
src/app/page.tsx
```

Likely causes:

- export date range was not All time
- user uploaded incomplete shards
- username normalization changed values unexpectedly
- duplicate or renamed accounts in export
- wrong account export uploaded

What to inspect:

- total following and follower counts
- whether all follower shards were uploaded
- normalized usernames before comparison
- sorted source lists in `sourceLists`

### Search Does Not Find A Username

Likely area:

```text
filterUsernames()
src/app/page.tsx
```

Likely causes:

- search only applies to active category
- usernames are normalized lowercase
- query is substring-based, not fuzzy
- leading `@` in the search query is not stripped

Current behavior detail:

- `filterUsernames` trims and lowercases the query.
- It does not remove a leading `@` from the search query.

### CSV Is Empty Or Disabled

Likely areas:

```text
src/app/page.tsx
src/components/ExportCsvButton.tsx
src/lib/csv.ts
```

Likely causes:

- active filtered list has zero rows
- search query filters out all rows
- no successful parse has occurred

What to inspect:

- `filteredList.length`
- `csvRows.length`
- active category
- search query

### Clicking "Upload New Export" Does Not Open Picker

Likely areas:

```text
resetForNewUpload()
UploadDropzone.openFilePicker()
```

Likely causes:

- browser blocks file picker if it is no longer considered part of a user
  gesture
- upload dropzone is disabled because `busy` is true
- hidden input ref is null

The code intentionally uses `queueMicrotask`, but the comment notes this may be
blocked in some browsers.

### Guide Modal Opens Or Closes Incorrectly

Likely area:

```text
src/components/ExportGuideModal.tsx
```

Likely causes:

- native `<dialog>` behavior differs in target browser
- `open` prop and actual dialog state are out of sync
- `close` event calls `onClose`, which updates parent state

What to inspect:

- `dialogRef.current.open`
- `showModal()` calls
- `close()` calls
- browser support for native dialog

### Static Assets 404 On GitHub Pages

Likely areas:

```text
next.config.ts
.github/workflows/deploy.yml
public/.nojekyll
```

Likely causes:

- `basePath` or `assetPrefix` changed
- Pages is not configured for GitHub Actions
- `.nojekyll` missing from output
- app opened without `/followback-checker` base path

What to inspect:

- built `out/` paths
- deployed URL
- browser network panel for `_next` assets

## 20. AI Collaboration Notes

Before changing code, an AI assistant should:

1. Read `AGENTS.md`.
2. Remember that this repo is pinned to Next.js `16.2.4`.
3. Read relevant docs in `node_modules/next/dist/docs/` before changing
   Next.js-specific code.
4. Preserve the privacy model unless the user explicitly asks for a product
   change.
5. Preserve static export compatibility unless the user explicitly approves a
   deployment architecture change.
6. Prefer targeted changes and local patterns over broad rewrites.
7. Add or update tests for parser changes, especially around export shapes and
   filename matching.
8. Use `npm.cmd run test` and `npm.cmd run lint` on this Windows environment.
9. Do not treat `out/`, `.next/`, or `node_modules/` as source of truth for app
   implementation.
10. If adding UI functionality that touches file upload, dialogs, or browser
    downloads, verify behavior in a browser, not only through unit tests.

## 21. Quick File Ownership Map

Use this map to find the right place for common changes:

```text
Change export filename or CSV format:
  src/components/ExportCsvButton.tsx
  src/lib/csv.ts

Change relationship file matching:
  src/lib/instagram-export.ts
  src/lib/instagram-export.test.ts

Change username extraction:
  src/lib/instagram-username.ts
  src/lib/instagram-username.test.ts

Change comparison categories:
  src/lib/compare-follow-lists.ts
  src/lib/result-category.ts
  src/components/SummaryCounts.tsx
  src/app/page.tsx

Change upload behavior:
  src/components/UploadDropzone.tsx
  src/app/page.tsx

Change export guide copy or buttons:
  src/components/ExportGuideModal.tsx

Change privacy messaging:
  src/components/PrivacyBanner.tsx
  README.md

Change page layout, metadata, or footer shell:
  src/app/layout.tsx
  src/components/SiteFooterCredits.tsx

Change static deploy path:
  next.config.ts
  README.md
  .github/workflows/deploy.yml if deployment assumptions change

Change visual styling:
  Tailwind classes in components
  src/app/globals.css for global theme variables
```

## 22. Current Baseline Checks

At the time this context file was prepared, the relevant checks were:

```text
npm.cmd run test
```

Result:

```text
2 test files passed
13 tests passed
```

And:

```text
npm.cmd run lint
```

Result:

```text
ESLint completed with exit code 0
```

Future assistants should rerun checks after code changes instead of relying on
this snapshot.
