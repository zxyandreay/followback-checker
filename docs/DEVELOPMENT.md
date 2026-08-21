# Development Guide

This project is a static Next.js app. It should stay compatible with GitHub Pages hosting and browser-local file processing unless the deployment and privacy model intentionally changes.

## Requirements

- Node.js 20 or newer
- npm
- Git

On Windows PowerShell, use `npm.cmd run ...` if execution policy blocks the `npm` shim.

## Local Setup

```bash
git clone https://github.com/zxyandreay/followback-checker.git
cd followback-checker
npm install
npm run dev
```

Open:

```text
http://localhost:3000/
```

The app is served from the site root so local URLs match the custom-domain deployment at `https://unfollowing.is-not.cool/`.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local Next.js development server |
| `npm run lint` | Run ESLint checks |
| `npm run test` | Run Vitest unit tests from `src/**/*.test.ts` |
| `npm run build` | Build the static export into `out/` |
| `npm run start` | Start Next.js in production mode after a build; not used by the GitHub Pages workflow |

There is no separate `typecheck` script in `package.json`.

## Static Export and Deployment

Static export settings live in [`next.config.ts`](../next.config.ts):

```ts
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
};
```

`npm run build` writes the static site to `out/`. The canonical deployed site is intended to be served at:

```text
https://unfollowing.is-not.cool/
```

The custom-domain DNS record is managed by the `is-not.cool` registry and points `unfollowing.is-not.cool` to `zxyandreay.github.io` with a CNAME. The repository itself publishes through a custom GitHub Actions workflow, so GitHub Pages stores the custom-domain association in repository Pages settings; a repository `CNAME` file is not required for this deployment mode.

Deployment is handled by [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) on pushes to `main`:

1. Check out the repository.
2. Install Node.js 20 with npm cache enabled.
3. Run `npm ci`.
4. Run `npm run build`.
5. Upload `out/` as a GitHub Pages artifact.
6. Deploy the artifact with `actions/deploy-pages`.

[`public/.nojekyll`](../public/.nojekyll) is included so GitHub Pages does not process the static export with Jekyll.

## Validation

Run the repository-defined checks before committing documentation or code changes:

```bash
npm run lint
npm run test
npm run build
```

Current automated tests are library-focused and cover parser and username helper behavior. UI upload flows are not covered by browser integration tests.

## Development Boundaries

- Preserve the no-login, no-scraping, no-backend-upload privacy model.
- Keep the app compatible with static export unless deployment is changed deliberately.
- Keep production paths rooted at `/` while `unfollowing.is-not.cool` is the canonical deployment domain.
- Avoid server-only Next.js features that static export cannot support.
- Update tests and documentation when parser behavior, supported filenames, result categories, or deployment paths change.
- See [Project Context](./PROJECT_CONTEXT.md) for detailed architecture and debugging notes.
