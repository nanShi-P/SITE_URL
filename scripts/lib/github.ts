import { Octokit } from '@octokit/rest';

export interface SearchOpts { pages?: number; perPage?: number; }

const QUERY = 'topic:ai OR topic:llm OR topic:agent OR topic:rag OR topic:gpt stars:>500';
const BLOCKLIST = [/^awesome-/i, /-list$/i];

export function createClient(token?: string) {
  return new Octokit({ auth: token, request: { retries: 3 } });
}

export async function searchAiRepos(octokit: Octokit, opts: SearchOpts = {}) {
  const pages = opts.pages ?? 5;
  const perPage = opts.perPage ?? 100;
  const out: any[] = [];
  for (let page = 1; page <= pages; page++) {
    const { data } = await octokit.rest.search.repos({
      q: QUERY, sort: 'stars', order: 'desc', per_page: perPage, page,
    });
    out.push(...data.items);
  }
  return out.filter(r => !BLOCKLIST.some(rx => rx.test(r.name)));
}

export async function fetchReadme(octokit: Octokit, owner: string, repo: string): Promise<string | null> {
  try {
    const { data } = await octokit.rest.repos.getReadme({ owner, repo, mediaType: { format: 'raw' } });
    return String(data).slice(0, 2000);
  } catch {
    return null;
  }
}
