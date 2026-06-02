import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { classifyRepo } from './lib/categories.js';

interface Repo {
  id: string;
  owner: string;
  name: string;
  url: string;
  description: string | null;
  stars: number;
  forks: number;
  language: string | null;
  topics: string[];
  pushed_at: string;
  category: string;
  rank: number;
  rank_delta: number;
}

async function main() {
  const raw = JSON.parse(await readFile('data/repos.raw.json', 'utf8')) as any[];

  let prev = new Map<string, number>();
  if (existsSync('data/repos.json')) {
    const old = JSON.parse(await readFile('data/repos.json', 'utf8')) as Repo[];
    prev = new Map(old.map(r => [r.id, r.rank]));
  }

  const repos: Repo[] = raw.map((r, i) => {
    const id = r.full_name as string;
    const rank = i + 1;
    const prevRank = prev.get(id);
    const rank_delta = prevRank === undefined ? 0 : prevRank - rank;
    return {
      id,
      owner: r.owner.login,
      name: r.name,
      url: r.html_url,
      description: r.description,
      stars: r.stargazers_count,
      forks: r.forks_count,
      language: r.language,
      topics: r.topics ?? [],
      pushed_at: r.pushed_at,
      category: classifyRepo({ name: r.name, topics: r.topics ?? [], description: r.description }),
      rank,
      rank_delta,
    };
  });

  await writeFile('data/repos.json', JSON.stringify(repos, null, 2), 'utf8');
  const dist = repos.reduce((m, r) => { m[r.category] = (m[r.category] ?? 0) + 1; return m; }, {} as Record<string, number>);
  console.log('Category distribution:', dist);
}

main().catch(e => { console.error(e); process.exit(1); });
