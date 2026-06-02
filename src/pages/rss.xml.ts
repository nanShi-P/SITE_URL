import type { APIRoute } from 'astro';
import { allRepos, getDigest } from '../utils/data';

export const GET: APIRoute = ({ site }) => {
  const items = allRepos.slice(0, 50).map(r => {
    const d = getDigest(r.id);
    const desc = d?.summary_zh ?? r.description ?? '';
    return `<item>
      <title><![CDATA[${r.owner}/${r.name}]]></title>
      <link>${new URL(`/repo/${r.owner}/${r.name}`, site).toString()}</link>
      <description><![CDATA[${desc}]]></description>
      <pubDate>${new Date(r.pushed_at).toUTCString()}</pubDate>
    </item>`;
  }).join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
<title>AI 开源项目中文榜单</title>
<link>${site?.toString()}</link>
<description>Top 500 AI 开源仓库每周更新</description>
${items}
</channel></rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
};
