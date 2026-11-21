# Company site

The Purin company site: the home page, Pantry, e-commerce and company pages.

```sh
pnpm -C apps/seams-site vite
pnpm -C apps/seams-site typecheck
pnpm -C apps/seams-site build
```

`vite` serves this app on `http://127.0.0.1:4004`. The build reads three values:
`VITE_SITE_ORIGIN`, `VITE_WALLET_SITE_ORIGIN` and `VITE_DOCS_ORIGIN`. The deploy
script sets them from `deployment/company-site/targets.json`.

## Languages

The site serves English at `/`, `/ecommerce/` and `/company/`, and Japanese at
`/ja/`, `/ja/ecommerce/` and `/ja/company/`. Keep page, menu, footer and contact
translations in `src/i18n/catalog.ts`; every message needs both languages. The
navbar language selector lives in `packages/site-navbar-ts`. A language change
keeps the page, the query and the anchor.

The build emits one HTML file for each language, with its title, description,
canonical link and alternate links. The sitemap lists both languages for each
page. The deploy smoke checks these routes and the sitemap.

## Links to the Wallet

The site links to the Seams Wallet site (`VITE_WALLET_SITE_ORIGIN`) and its docs
(`VITE_DOCS_ORIGIN`). The deploy writes redirects from `/wallet`, `/pricing`,
`/dashboard` and `/platform` to the Wallet site.
