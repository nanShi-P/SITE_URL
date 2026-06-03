import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { config as loadEnv } from 'dotenv';
loadEnv({ override: true });
import pLimit from 'p-limit';
import { createClient, fetchReadme } from './lib/github.js';
import { createLlm, generateDigest, MODEL, type Digest } from './lib/llm.js';
import { sha256 } from './lib/hash.js';

export interface CachedDigest extends Digest {
  id: string;
  source_hash: string;
  generated_at: string;
  model: string;
}

export function needsRefresh(cached: CachedDigest | null, hash: string): boolean {
  if (!cached) return true;
  return cached.source_hash !== hash;
}

function digestPath(id: string): string {
  return `data/digests/${id.replace('/', '__')}.json`;
}

async function loadCached(id: string): Promise<CachedDigest | null> {
  const p = digestPath(id);
  if (!existsSync(p)) return null;
  return JSON.parse(await readFile(p, 'utf8'));
}

async function main() {
  const repos = JSON.parse(await readFile('data/repos.json', 'utf8')) as any[];
  await mkdir('data/digests', { recursive: true });

  const octokit = createClient(process.env.GITHUB_TOKEN);
  const llm = createLlm();
  const budgetRaw = process.env.LLM_CALL_BUDGET;
  const budget = budgetRaw && budgetRaw !== '0' ? Number(budgetRaw) : Infinity;
  const llmConcurrency = Number(process.env.ENRICH_CONCURRENCY ?? '50');
  const githubConcurrency = Number(process.env.GITHUB_CONCURRENCY ?? '20');

  const llmLimit = pLimit(llmConcurrency);
  const githubLimit = pLimit(githubConcurrency);

  let calls = 0, hits = 0, fails = 0, done = 0;
  let stopped = false;
  const total = repos.length;
  const t0 = Date.now();

  const logProgress = () => {
    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    console.log(`[${elapsed}s] done=${done}/${total} calls=${calls} hits=${hits} fails=${fails}`);
  };

  async function processRepo(r: any): Promise<void> {
    if (stopped) { done++; return; }
    try {
      const readme = await githubLimit(() => fetchReadme(octokit, r.owner, r.name));
      const hash = sha256(`${r.description ?? ''}|${readme ?? ''}`);
      const cached = await loadCached(r.id);
      if (!needsRefresh(cached, hash)) { hits++; return; }
      if (calls >= budget) { stopped = true; return; }
      calls++;
      const digest = await generateDigest(llm, {
        owner: r.owner, name: r.name, description: r.description, readme,
      });
      const out: CachedDigest = {
        id: r.id, source_hash: hash, generated_at: new Date().toISOString(),
        model: MODEL, ...digest,
      };
      await writeFile(digestPath(r.id), JSON.stringify(out, null, 2), 'utf8');
    } catch (e) {
      fails++;
      console.warn(`enrich failed for ${r.id}:`, (e as Error).message);
    } finally {
      done++;
      if (done % 25 === 0) logProgress();
    }
  }

  await Promise.all(repos.map(r => llmLimit(() => processRepo(r))));
  logProgress();
  console.log(`Done in ${((Date.now() - t0) / 1000).toFixed(1)}s. calls=${calls} hits=${hits} fails=${fails}${stopped ? ' (budget hit)' : ''}`);
}

if (process.env.VITEST !== 'true') {
  main().catch(e => { console.error(e); process.exit(1); });
}
