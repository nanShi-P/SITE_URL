import { describe, it, expect, vi } from 'vitest';
import { searchAiRepos } from '../scripts/lib/github';

describe('searchAiRepos', () => {
  it('returns merged items across pages', async () => {
    const fakeOctokit = {
      rest: {
        search: {
          repos: vi.fn()
            .mockResolvedValueOnce({ data: { items: [{ id: 1, name: 'a' }, { id: 2, name: 'b' }] } })
            .mockResolvedValueOnce({ data: { items: [{ id: 3, name: 'c' }] } }),
        },
      },
    } as any;
    const items = await searchAiRepos(fakeOctokit, { pages: 2, perPage: 100 });
    expect(items).toHaveLength(3);
    expect(fakeOctokit.rest.search.repos).toHaveBeenCalledTimes(2);
  });

  it('filters out awesome-* and *-list repos', async () => {
    const fakeOctokit = {
      rest: { search: { repos: vi.fn().mockResolvedValueOnce({ data: { items: [
        { id: 1, name: 'whisper' },
        { id: 2, name: 'awesome-ai' },
        { id: 3, name: 'ai-list' },
        { id: 4, name: 'langchain' },
      ] } }) } },
    } as any;
    const items = await searchAiRepos(fakeOctokit, { pages: 1, perPage: 100 });
    expect(items.map(i => i.name)).toEqual(['whisper', 'langchain']);
  });
});
