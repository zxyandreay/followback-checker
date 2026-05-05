# Project Analysis: followback-checker

## 1) Purpose and product boundaries

This is a privacy-first, static Next.js web app that compares Instagram following and followers from Meta export files. It explicitly avoids login, scraping, and server-side ingestion of user data.

## 2) Architecture overview

- **UI shell**: `src/app/layout.tsx` defines global metadata/fonts and footer composition.
- **Single-page workflow**: `src/app/page.tsx` handles file ingestion, error state, category switching, search filtering, and CSV export wiring.
- **Core parsing pipeline**: `src/lib/instagram-export.ts` classifies ZIP/JSON files, parses follower/following payloads, deduplicates usernames, and returns success/failure messages.
- **Domain logic**: `src/lib/compare-follow-lists.ts` computes the three key relationship sets.
- **Normalization logic**: `src/lib/instagram-username.ts` extracts usernames from multiple candidate fields (`string_list_data.value`, `title`, `value`, instagram URLs).
- **Export helper**: `src/lib/csv.ts` builds escaped CSV and triggers browser download.
- **Primary input component**: `src/components/UploadDropzone.tsx` supports drag/drop and programmatic picker opening (zip+json or json-only modes).

## 3) Data flow and correctness

### Ingestion
- `handleFiles` in `page.tsx` resets state, calls `parseInstagramExportFromFiles`, and then derives sorted source lists and comparison output.
- The parser supports:
  - ZIP archives with flexible internal paths (filename-based matching).
  - Loose JSON files with either canonical names or structure-based classification.

### Validation and resiliency
- Parsing has strong user-facing error branches:
  - unreadable ZIP,
  - ZIP with no JSON,
  - ZIP with JSON but no recognized follower/following files,
  - missing follower/following files,
  - JSON syntax errors,
  - files present but no extractable usernames.
- Diagnostic counts are embedded in certain error paths for supportability.

### Comparison
- Set-based dedupe + difference/intersection ensures deterministic category outputs.
- Sorting with `localeCompare` gives stable UI ordering and CSV ordering per current filter.

## 4) UX behavior details

- Default landing category after upload is `notFollowingBack`.
- Search applies only to the active category list.
- CSV export outputs the active, currently filtered rows.
- Error callout includes a direct link to the export guide to reduce dead-end failure.
- "Upload New Export" resets all result/error/search state and reopens picker on a microtask.

## 5) Test coverage snapshot

Current Vitest coverage in repo demonstrates key parser behavior:
- loose file parsing with representative shapes,
- structural classification when filename is non-standard,
- denylisted JSON basename suppression.

Coverage is meaningful for the parser, but gaps remain in:
- ZIP member matching edge cases,
- diagnostics string expectations,
- username extraction corner cases (query params, malformed URLs, unicode usernames),
- integration-level UI state transitions.

## 6) Strengths

1. **Clear privacy posture** backed by static export deployment and local parsing.
2. **Robust classification strategy**: both name-based and shape-based detection for loose JSON.
3. **Graceful failure messages** aligned with common user mistakes in Instagram export settings.
4. **Simple deterministic core** (sets + sorted arrays) makes behavior easy to reason about.
5. **Static-host friendly config** (`output: export`, `basePath`, `assetPrefix`).

## 7) Risks / technical debt

1. **Memory use on large exports**: all matched JSON texts are loaded into arrays before parse.
2. **Parser/UI coupling via string messages**: internationalization and automated message assertions could be brittle.
3. **No explicit streaming/incremental parse** for very large files.
4. **Potential filename strictness mismatch**: follower detection requires `followers_*.json`; intentionally excludes bare `followers.json`.
5. **Limited automated tests outside lib layer**.

## 8) Recommended next improvements (prioritized)

1. **Add parser tests for ZIP internals** (nested paths, mixed-case filenames, ignored basenames inside ZIP).
2. **Introduce lightweight integration tests** for page workflow (upload success, error, category switch, CSV disabled/enabled).
3. **Refactor parser to incremental processing** of ZIP entries to reduce peak memory usage.
4. **Create typed error codes** returned with messages to make UI behavior less string-dependent.
5. **Add observability hooks** (optional debug panel in dev) exposing parse diagnostics without bloating user-facing error copy.

## 9) Deployment and runtime assumptions

- Designed for GitHub Pages path hosting under `/followback-checker`.
- Client-only parsing means browser compatibility/performance is critical; no server fallback exists.
- Next.js version is pinned (`16.2.4`) along with React `19.2.4`, reducing drift but requiring deliberate upgrade cadence.

## 10) Overall assessment

The codebase is focused and thoughtfully constrained: it solves one user problem with clear trust boundaries and pragmatic parser hardening. The highest-value next step is expanding automated coverage around ZIP edge cases and UI integration behavior while keeping the privacy-preserving local-only model intact.
