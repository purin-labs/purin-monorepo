#!/usr/bin/env node

/* Builds, deploys and checks the company site (apps/seams-site) on its Cloudflare Pages
   project. The caller supplies the Cloudflare account as CLOUDFLARE_API_TOKEN and
   CLOUDFLARE_ACCOUNT_ID, and the Pages project name in the variable that the site's
   target names. The repository names no account and no zone, so a move of the company
   site to another Cloudflare account changes only those values.

   Targets: deployment/company-site/targets.json. */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { formatFailedCheck, isFailedCheck, runReadinessChecks } from './deployment-smoke.mjs';
import {
  assertDeploymentBranch,
  assertDirectory,
  assertFile,
  deployPagesProject,
  ensurePagesCustomDomain,
  requireEnvironmentValues,
  runCommand,
  smokeChecks,
} from './pages-deploy.mjs';

const REPOSITORY_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TARGETS_PATH = path.join(REPOSITORY_ROOT, 'deployment', 'company-site', 'targets.json');
const SITE_OUTPUT = path.join(REPOSITORY_ROOT, 'apps', 'seams-site', 'dist');
const OPERATIONS = Object.freeze(['plan', 'build', 'deploy', 'smoke']);
const SITE_KEYS = Object.freeze([
  'branch',
  'origin',
  'walletSiteOrigin',
  'docsOrigin',
  'pagesProjectEnv',
]);
const PAGE_ENTRIES = Object.freeze([
  ['index.html', 'Home entry'],
  ['ja/index.html', 'Japanese home entry'],
  ['ecommerce/index.html', 'Purin Pantry page entry'],
  ['ja/ecommerce/index.html', 'Japanese Purin Pantry entry'],
  ['company/index.html', 'Company entry'],
  ['ja/company/index.html', 'Japanese company entry'],
  ['branding/index.html', 'Brand entry'],
  ['ja/branding/index.html', 'Japanese brand entry'],
  ['sitemap.xml', 'Sitemap'],
]);
const SMOKE_PATHS = Object.freeze([
  '/',
  '/ja/',
  '/ecommerce/',
  '/ja/ecommerce/',
  '/company/',
  '/ja/company/',
  '/branding/',
  '/ja/branding/',
  '/sitemap.xml',
]);

export function readCompanySite(siteId, document = readTargets()) {
  if (!isRecord(document) || document.schemaVersion !== 1 || !isRecord(document.sites)) {
    throw new Error('company site targets must have schemaVersion 1 and a sites object');
  }
  const site = document.sites[siteId];
  if (!isRecord(site)) {
    throw new Error(
      `unknown company site ${siteId}; expected ${Object.keys(document.sites).join(', ')}`,
    );
  }
  const unknown = Object.keys(site).filter((key) => !SITE_KEYS.includes(key));
  if (unknown.length > 0) {
    throw new Error(`company site ${siteId} has unknown keys: ${unknown.join(', ')}`);
  }
  return Object.freeze({
    id: siteId,
    branch: requirePattern(site.branch, /^[a-z][a-z0-9/-]*$/u, `${siteId}.branch`),
    origin: requireHttpsOrigin(site.origin, `${siteId}.origin`),
    walletSiteOrigin: requireHttpsOrigin(site.walletSiteOrigin, `${siteId}.walletSiteOrigin`),
    docsOrigin: requireHttpsOrigin(site.docsOrigin, `${siteId}.docsOrigin`),
    pagesProjectEnv: requirePattern(
      site.pagesProjectEnv,
      /^[A-Z][A-Z0-9_]*$/u,
      `${siteId}.pagesProjectEnv`,
    ),
  });
}

async function main(args) {
  const { operation, siteId } = parseArguments(args);
  const site = readCompanySite(siteId);
  if (operation === 'plan') {
    printPlan(site);
    return;
  }
  assertDeploymentBranch(site);
  if (operation === 'build') build(site);
  else if (operation === 'deploy') await deploy(site);
  else await smoke(site);
}

function parseArguments(args) {
  const operation = String(args[0] || '').trim();
  if (!OPERATIONS.includes(operation) || args.length !== 3 || args[1] !== '--site') {
    throw new Error(usage());
  }
  const siteId = String(args[2] || '').trim();
  if (!siteId || siteId.startsWith('--')) throw new Error(usage());
  return { operation, siteId };
}

function usage() {
  return 'usage: deploy-company-site.mjs <plan|build|deploy|smoke> --site <staging|production>';
}

function printPlan(site) {
  const lines = [
    `Company site deployment plan: ${site.id}`,
    `Branch: ${site.branch}`,
    `Origin: ${site.origin}`,
    `Pages project environment: ${site.pagesProjectEnv}`,
    'Cloudflare account: CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID of the caller',
  ];
  process.stdout.write(`${lines.join('\n')}\n`);
}

function build(site) {
  runCommand('pnpm', ['-C', 'apps/seams-site', 'exec', 'vite', 'build'], {
    env: {
      ...process.env,
      VITE_SITE_ORIGIN: site.origin,
      VITE_WALLET_SITE_ORIGIN: site.walletSiteOrigin,
      VITE_DOCS_ORIGIN: site.docsOrigin,
    },
  });
  writeRedirects(site);
  for (const [entry, label] of PAGE_ENTRIES) assertFile(path.join(SITE_OUTPUT, entry), label);
}

/* Paths that the company site served before the Wallet moved to its own site. */
function writeRedirects(site) {
  const walletOrigin = site.walletSiteOrigin;
  const redirects = [
    `/wallet ${walletOrigin}/ 301`,
    `/wallet/ ${walletOrigin}/ 301`,
    `/wallet/ja ${walletOrigin}/ja/ 301`,
    `/wallet/ja/ ${walletOrigin}/ja/ 301`,
    // Wallet pricing moved to the Wallet site; the company site has no pricing page yet.
    `/pricing ${walletOrigin}/pricing/ 301`,
    `/pricing/* ${walletOrigin}/pricing/ 301`,
    `/ja/pricing ${walletOrigin}/ja/pricing/ 301`,
    `/ja/pricing/* ${walletOrigin}/ja/pricing/ 301`,
    '/dashboard/login /wallet-login-restart.html 200',
    `/dashboard ${walletOrigin}/dashboard 302`,
    `/dashboard/* ${walletOrigin}/dashboard/:splat 302`,
    `/platform/* ${walletOrigin}/platform/:splat 302`,
  ];
  fs.writeFileSync(path.join(SITE_OUTPUT, '_redirects'), `${redirects.join('\n')}\n`);
  fs.writeFileSync(
    path.join(SITE_OUTPUT, 'wallet-login-restart.html'),
    '<!doctype html><meta charset="utf-8"><meta name="referrer" content="no-referrer"><title>Sign in again</title><p>This sign-in request used the former Console address.</p><p><a href="' +
      walletOrigin +
      '/dashboard/login">Start a new sign-in</a></p>\n',
  );
}

async function deploy(site) {
  requireEnvironmentValues(
    ['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ACCOUNT_ID', site.pagesProjectEnv],
    process.env,
  );
  assertDirectory(SITE_OUTPUT, 'Company site Pages output');
  const project = process.env[site.pagesProjectEnv];
  await deployPagesProject(SITE_OUTPUT, site, project);
  await ensurePagesCustomDomain(site.origin, project);
  process.stdout.write(`Company site deploy completed: ${site.id}\n`);
}

async function smoke(site) {
  const results = await runReadinessChecks(smokeChecks('company', site.origin, SMOKE_PATHS));
  process.stdout.write(`${JSON.stringify({ results })}\n`);
  const failed = results.filter(isFailedCheck);
  if (failed.length > 0) {
    throw new Error(`company site smoke failed: ${failed.map(formatFailedCheck).join(', ')}`);
  }
}

function readTargets() {
  return JSON.parse(fs.readFileSync(TARGETS_PATH, 'utf8'));
}

function requirePattern(value, pattern, label) {
  const text = typeof value === 'string' ? value : '';
  if (!pattern.test(text)) throw new Error(`${label} is invalid`);
  return text;
}

function requireHttpsOrigin(value, label) {
  let url;
  try {
    url = new URL(String(value));
  } catch {
    throw new Error(`${label} must be an https origin`);
  }
  if (url.protocol !== 'https:' || url.origin !== value) {
    throw new Error(`${label} must be an https origin`);
  }
  return url.origin;
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isDirectInvocation() {
  return (
    process.argv[1] &&
    path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))
  );
}

if (isDirectInvocation()) {
  main(process.argv.slice(2)).catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
