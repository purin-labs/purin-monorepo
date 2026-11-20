/* Cloudflare Pages deploy helpers for the company site deploy. They read the account
   from CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID, so the workflow chooses the
   Cloudflare account through its environment secrets. */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const REPOSITORY_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export async function deployPagesProject(
  outputDirectory,
  site,
  projectName,
  productionBranch = site.branch,
) {
  await ensurePagesProject(projectName, productionBranch);
  const args = [
    'exec',
    'wrangler',
    'pages',
    'deploy',
    path.relative(REPOSITORY_ROOT, outputDirectory),
    '--branch',
    site.branch,
    '--commit-dirty=false',
    '--project-name',
    projectName,
  ];
  const sourceSha = String(process.env.DEPLOY_SHA || '').trim();
  if (sourceSha) args.push('--commit-hash', sourceSha);
  runCommand('pnpm', args);
}

/* A new Cloudflare account has no Pages projects. The production branch serves the
   custom domains: the site's branch, or main for the shared docs project. */
async function ensurePagesProject(projectName, productionBranch) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const projectsPath = `/accounts/${encodeURIComponent(accountId)}/pages/projects`;
  const existing = await requestCloudflareApi(
    `${projectsPath}/${encodeURIComponent(projectName)}`,
    apiToken,
    'GET',
    [200, 404],
  );
  if (existing.status === 200) return;
  await requestCloudflareApi(projectsPath, apiToken, 'POST', [200], {
    name: projectName,
    production_branch: productionBranch,
  });
  process.stdout.write(
    `Created Pages project ${projectName} (production branch ${productionBranch})\n`,
  );
}

/* Binds the host to the Pages project. The deploy token cannot change DNS, so a new
   binding stops the deploy until the host's DNS record is a proxied CNAME to the project. */
export async function ensurePagesCustomDomain(origin, projectName) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const hostname = new URL(origin).hostname;
  const projectsPath = `/accounts/${encodeURIComponent(accountId)}/pages/projects`;
  const domainPath = `${projectsPath}/${encodeURIComponent(projectName)}/domains/${encodeURIComponent(hostname)}`;
  const existing = await requestCloudflareApi(domainPath, apiToken, 'GET', [200, 404]);
  if (existing.status !== 200) {
    await requestCloudflareApi(
      `${projectsPath}/${encodeURIComponent(projectName)}/domains`,
      apiToken,
      'POST',
      [200],
      { name: hostname },
    );
    process.stdout.write(`Bound Pages custom domain: ${hostname}\n`);
  }
  await waitForActivePagesDomain(domainPath, hostname, projectName, apiToken);
}

async function waitForActivePagesDomain(domainPath, hostname, projectName, apiToken) {
  const deadline = Date.now() + 120_000;
  let status = '';
  while (Date.now() < deadline) {
    const response = await requestCloudflareApi(domainPath, apiToken, 'GET', [200]);
    status = String((await response.json()).result?.status || '');
    if (status === 'active') return;
    await new Promise((resolve) => setTimeout(resolve, 10_000));
  }
  // A pages.dev subdomain is unique across accounts, so a project in a new account
  // can have a suffix after its name. Name the target that the project really has.
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const project = await requestCloudflareApi(
    `/accounts/${encodeURIComponent(accountId)}/pages/projects/${encodeURIComponent(projectName)}`,
    apiToken,
    'GET',
    [200],
  );
  const target = (await project.json()).result?.subdomain || `${projectName}.pages.dev`;
  throw new Error(
    `Pages custom domain ${hostname} is ${status || 'not active'}. ` +
      `Make its DNS record a proxied CNAME to ${target}, then deploy again.`,
  );
}

export async function requestCloudflareApi(apiPath, apiToken, method, expectedStatuses, body) {
  const response = await fetch(`https://api.cloudflare.com/client/v4${apiPath}`, {
    method,
    headers: {
      Authorization: `Bearer ${apiToken}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (expectedStatuses.includes(response.status)) return response;
  throw new Error(
    `Cloudflare Pages custom-domain request failed (${method} ${apiPath}): ${response.status} ${await response.text()}`,
  );
}

export function smokeChecks(surface, origin, requests) {
  return requests.map((request) => {
    const requestPath = typeof request === 'string' ? request : request.path;
    return {
      name: `${surface}${requestPath}`,
      url: new URL(requestPath, origin).toString(),
      ...(typeof request === 'string' ? {} : { isReady: request.isReady }),
    };
  });
}

export function assertDeploymentBranch(site) {
  const ref = String(process.env.GITHUB_REF || '').trim();
  const branch = String(process.env.GITHUB_REF_NAME || '').trim();
  const received = ref || (branch ? `refs/heads/${branch}` : '');
  if (received && received !== `refs/heads/${site.branch}`) {
    throw new Error(`site ${site.id} requires branch ${site.branch}; received ${received}`);
  }
}

export function requireEnvironmentValues(names, environment) {
  for (const name of names) {
    if (!String(environment[name] || '').trim()) throw new Error(`${name} is required`);
  }
}

export function runCommand(command, args, options = {}) {
  const child = spawnSync(command, args, {
    cwd: options.cwd || REPOSITORY_ROOT,
    env: options.env || process.env,
    encoding: 'utf8',
    stdio: 'inherit',
  });
  if (child.error) throw child.error;
  if (child.status !== 0)
    throw new Error(`${command} ${args.join(' ')} failed with status ${child.status}`);
}

export function assertDirectory(directory, label) {
  if (!fs.existsSync(directory) || !fs.statSync(directory).isDirectory()) {
    throw new Error(`${label} is missing: ${directory}`);
  }
}

export function assertFile(filePath, label) {
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    throw new Error(`${label} is missing: ${filePath}`);
  }
}
