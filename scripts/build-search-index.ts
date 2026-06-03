import { writeFileSync, readFileSync, existsSync, readdirSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

interface Repo { id: string; owner: string; name: string; description: string | null }
interface Digest { id: string; summary_zh?: string }

const repos: Repo[] = JSON.parse(readFileSync(resolve('data/repos.json'), 'utf8'));

const digestMap = new Map<string, Digest>();
const digestDir = resolve('data/digests');
if (existsSync(digestDir)) {
  for (const f of readdirSync(digestDir)) {
    if (!f.endsWith('.json')) continue;
    try {
      const d = JSON.parse(readFileSync(join(digestDir, f), 'utf8')) as Digest;
      if (d.id) digestMap.set(d.id, d);
    } catch { /* skip malformed */ }
  }
}

const index = repos.map(r => ({
  id: r.id,
  owner: r.owner,
  name: r.name,
  summary: digestMap.get(r.id)?.summary_zh ?? r.description ?? '',
  url: `/repo/${r.owner}/${r.name}/`,
}));

const outDir = resolve('public');
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, 'search-index.json');
writeFileSync(outPath, JSON.stringify(index));
console.log(`search-index: wrote ${index.length} entries to ${outPath}`);
