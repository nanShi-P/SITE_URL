import { Octokit } from '@octokit/rest';

export interface SearchOpts { pages?: number; perPage?: number; }

const TOPICS = ['ai', 'llm', 'agent', 'rag', 'gpt'];
const BLOCKLIST = [/^awesome-/i, /-list$/i];

export function createClient(token?: string) {
  return new Octokit({ auth: token, request: { retries: 3 } });
}

export async function searchAiRepos(octokit: Octokit, opts: SearchOpts = {}) {
  const pages = opts.pages ?? 5;
  const perPage = opts.perPage ?? 100;
  const seen = new Map<number, any>();
  for (const topic of TOPICS) {
    for (let page = 1; page <= pages; page++) {
      const { data } = await octokit.rest.search.repos({
        q: `topic:${topic} stars:>500`, sort: 'stars', order: 'desc', per_page: perPage, page,
      });
      for (const item of data.items) seen.set(item.id, item);
      if (data.items.length < perPage) break;
    }
  }
  const all = [...seen.values()].filter(r => !BLOCKLIST.some(rx => rx.test(r.name)));
  all.sort((a, b) => (b.stargazers_count ?? 0) - (a.stargazers_count ?? 0));
  return all.slice(0, 500);
}

export async function fetchReadme(octokit: Octokit, owner: string, repo: string): Promise<string | null> {
  try {
    const { data } = await octokit.rest.repos.getReadme({ owner, repo, mediaType: { format: 'raw' } });
    return String(data).slice(0, 2000);
  } catch {
    return null;
  }
}
