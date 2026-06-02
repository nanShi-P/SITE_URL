import { writeFile, mkdir } from 'node:fs/promises';
import 'dotenv/config';
import { createClient, searchAiRepos } from './lib/github.js';

async function main() {
  const octokit = createClient(process.env.GITHUB_TOKEN);
  console.log('Fetching Top 500 AI repos from GitHub...');
  const items = await searchAiRepos(octokit, { pages: 5, perPage: 100 });
  console.log(`Got ${items.length} repos after blocklist filter.`);
  await mkdir('data', { recursive: true });
  await writeFile('data/repos.raw.json', JSON.stringify(items, null, 2), 'utf8');
  console.log('Wrote data/repos.raw.json');
}

main().catch(e => { console.error(e); process.exit(1); });
