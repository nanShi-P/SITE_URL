import repos from '@data/repos.json';
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

export interface Repo {
  id: string; owner: string; name: string; url: string;
  description: string | null; stars: number; forks: number;
  language: string | null; topics: string[]; pushed_at: string;
  category: string; rank: number; rank_delta: number;
}
export interface Digest {
  id: string; source_hash: string; generated_at: string; model: string;
  summary_zh: string; scenarios: string[];
  difficulty: '简单'|'中等'|'困难'; difficulty_reason: string;
  alternatives: string[];
}

export const allRepos = repos as Repo[];

const digestMap = new Map<string, Digest>();
const dir = 'data/digests';
if (existsSync(dir)) {
  for (const f of readdirSync(dir)) {
    if (f.endsWith('.json')) {
      try {
        const d = JSON.parse(readFileSync(join(dir, f), 'utf8')) as Digest;
        digestMap.set(d.id, d);
      } catch { /* skip malformed */ }
    }
  }
}

export function getDigest(id: string): Digest | null {
  return digestMap.get(id) ?? null;
}

export function reposByCategory(slug: string): Repo[] {
  return allRepos.filter(r => r.category === slug);
}

export function relatedRepos(repo: Repo, limit = 5): Repo[] {
  return allRepos.filter(r => r.category === repo.category && r.id !== repo.id).slice(0, limit);
}

export const dataUpdatedAt: Date = (() => {
  try { return statSync('data/repos.json').mtime; } catch { return new Date(); }
})();

export function trendingRepos(minStars = 1000, limit = 10): Repo[] {
  return allRepos
    .filter(r => r.stars >= minStars && r.rank_delta > 0)
    .sort((a, b) => b.rank_delta - a.rank_delta)
    .slice(0, limit);
}
