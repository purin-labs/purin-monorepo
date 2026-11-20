import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';
import { readCompanySite } from '../scripts/deploy-company-site.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const companyScript = path.join(repoRoot, 'scripts/deploy-company-site.mjs');

function runCompanyScript(args, env = process.env) {
  const result = spawnSync(process.execPath, [companyScript, ...args], {
    cwd: repoRoot,
    encoding: 'utf8',
    env,
  });
  return { status: result.status, output: `${result.stdout ?? ''}\n${result.stderr ?? ''}` };
}

function siteDocument(site) {
  return { schemaVersion: 1, sites: { staging: site } };
}

const validSite = {
  branch: 'dev',
  origin: 'https://staging.purin.io',
  walletSiteOrigin: 'https://staging.seams.sh',
  docsOrigin: 'https://docs.seams.sh',
  pagesProjectEnv: 'CF_PAGES_PROJECT_VITE',
};

test('company site targets name each site with its branch, hosts and Pages project variable', () => {
  assert.deepEqual(readCompanySite('staging'), { id: 'staging', ...validSite });
  const production = readCompanySite('production');
  assert.equal(production.branch, 'main');
  assert.equal(production.origin, 'https://purin.io');
  assert.equal(production.walletSiteOrigin, 'https://seams.sh');
});

test('company site targets reject an unknown site, an unknown key and a non-https host', () => {
  assert.throws(
    () => readCompanySite('development', siteDocument(validSite)),
    /unknown company site development/u,
  );
  assert.throws(
    () => readCompanySite('staging', siteDocument({ ...validSite, accountId: 'abc' })),
    /unknown keys: accountId/u,
  );
  assert.throws(
    () =>
      readCompanySite('staging', siteDocument({ ...validSite, origin: 'http://staging.purin.io' })),
    /staging.origin must be an https origin/u,
  );
});

test('the company site command plans without secrets and rejects a branch mismatch', () => {
  const plan = runCompanyScript(['plan', '--site', 'production']);
  assert.equal(plan.status, 0, plan.output);
  assert.match(plan.output, /Origin: https:\/\/purin\.io/u);
  assert.match(plan.output, /Pages project environment: CF_PAGES_PROJECT_VITE/u);

  const mismatch = runCompanyScript(['smoke', '--site', 'staging'], {
    ...process.env,
    GITHUB_REF: 'refs/heads/main',
  });
  assert.notEqual(mismatch.status, 0);
  assert.match(mismatch.output, /site staging requires branch dev/u);

  const usage = runCompanyScript(['deploy', '--component', 'company']);
  assert.notEqual(usage.status, 0);
  assert.match(usage.output, /usage: deploy-company-site\.mjs/u);
});

test('the company site workflow takes its Cloudflare account from the company secrets', () => {
  const workflow = parseYaml(
    readFileSync(path.join(repoRoot, '.github/workflows/deploy-company-site.yml'), 'utf8'),
  );
  assert.deepEqual(
    {
      CLOUDFLARE_API_TOKEN: workflow.jobs.deploy.env.CLOUDFLARE_API_TOKEN,
      CLOUDFLARE_ACCOUNT_ID: workflow.jobs.deploy.env.CLOUDFLARE_ACCOUNT_ID,
      CF_PAGES_PROJECT_VITE: workflow.jobs.deploy.env.CF_PAGES_PROJECT_VITE,
    },
    {
      CLOUDFLARE_API_TOKEN: '${{ secrets.COMPANY_CLOUDFLARE_API_TOKEN }}',
      CLOUDFLARE_ACCOUNT_ID: '${{ secrets.COMPANY_CLOUDFLARE_ACCOUNT_ID }}',
      CF_PAGES_PROJECT_VITE: '${{ secrets.CF_PAGES_PROJECT_VITE }}',
    },
  );
});
