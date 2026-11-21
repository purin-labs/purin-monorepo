# purin-monorepo

The Purin company site and, later, other Purin consoles.

| Path                      | Content                                      |
| ------------------------- | -------------------------------------------- |
| `apps/seams-site`         | Company site, deployed to `purin.io`         |
| `packages/grain-field-ts` | Grain field shader used by the site          |
| `packages/site-navbar-ts` | Site navbar and language selector            |
| `deployment/company-site` | Deploy targets for staging and production    |
| `scripts`                 | Company site deploy script and Pages helpers |

```sh
pnpm install
pnpm site
pnpm check
```

The Seams Wallet and its Console moved to
[`seams-tech/seams-console`](https://github.com/seams-tech/seams-console) on 2026-11-21.
This repository started from the same history, so older commit ids resolve in both.
