import { describe, it, expect, vi } from 'vitest';
import { searchAiRepos } from '../scripts/lib/github';

const emptyPage = { data: { items: [] } };

describe('searchAiRepos', () => {
  it('dedups items across topics and sorts by stars desc', async () => {
    const fakeOctokit = {
      rest: {
        search: {
          repos: vi.fn()
            .mockResolvedValueOnce({ data: { items: [
              { id: 1, name: 'a', stargazers_count: 100 },
              { id: 2, name: 'b', stargazers_count: 50 },
            ] } })
            .mockResolvedValueOnce({ data: { items: [
              { id: 1, name: 'a', stargazers_count: 100 },
              { id: 3, name: 'c', stargazers_count: 200 },
            ] } })
            .mockResolvedValue(emptyPage),
        },
      },
    } as any;
    const items = await searchAiRepos(fakeOctokit, { pages: 1, perPage: 100 });
    expect(items.map(i => i.id)).toEqual([3, 1, 2]);
  });

  it('filters out awesome-* and *-list repos', async () => {
    const fakeOctokit = {
      rest: { search: { repos: vi.fn()
        .mockResolvedValueOnce({ data: { items: [
          { id: 1, name: 'whisper', stargazers_count: 50000 },
          { id: 2, name: 'awesome-ai', stargazers_count: 80000 },
          { id: 3, name: 'ai-list', stargazers_count: 30000 },
          { id: 4, name: 'langchain', stargazers_count: 90000 },
        ] } })
        .mockResolvedValue(emptyPage),
      } },
    } as any;
    const items = await searchAiRepos(fakeOctokit, { pages: 1, perPage: 100 });
    expect(items.map(i => i.name)).toEqual(['langchain', 'whisper']);
  });
});
