# purin-monorepo — agent instructions

Single instruction file for all coding agents. This repository has no CLAUDE.md; do
not create one. Keep this file lean.

## What lives here

- `apps/seams-site`: the Purin company site (`purin.io`, `staging.purin.io`), with the
  Pantry and e-commerce pages in English and Japanese.
- `packages/grain-field-ts` and `packages/site-navbar-ts`: the grain field and the
  navbar. `seams-tech/seams-console` keeps its own copy of both for the Wallet site.
- Later: other Purin consoles and their deployments.

The Seams Wallet, its Console and the Wallet site live in `seams-tech/seams-console`.
This repository holds no Wallet code and imports no `@seams/*` package.

## Workflow

- Work directly on `dev`. Create branches or worktrees only when the user asks.
- Coordinate Git operations with concurrent agents. Stage only your own files.
- Before you add, change or review an ink drawing (`apps/seams-site/src/components/h2/ink/`)
  or its animation, read `docs/drawing-style.md`. The `ink-drawing` skill applies it.

## Commands

- `pnpm site` — the company site alone on port 4004.
- `pnpm check` — lint, type-check and the deploy script tests (offline, seconds).
- `pnpm build` — the production build of the site.
- `pnpm deploy:company-site plan --site staging|production` — print the deploy plan.
  The workflow `Deploy / company site` builds, deploys and smokes the site: staging from
  `dev`, production from `main`. The environment secrets `COMPANY_CLOUDFLARE_API_TOKEN`,
  `COMPANY_CLOUDFLARE_ACCOUNT_ID` and `CF_PAGES_PROJECT_VITE` choose the Cloudflare
  account and the Pages project.
