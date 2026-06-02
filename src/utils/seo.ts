import type { Repo, Digest } from './data';

export function repoTitle(r: Repo): string {
  return `${r.owner}/${r.name} 是什么？中文介绍、使用场景、上手难度`;
}
export function repoDescription(r: Repo, d: Digest | null): string {
  if (d) return d.summary_zh.slice(0, 150);
  return `${r.owner}/${r.name}：${r.description ?? 'AI 开源项目'}。${r.stars} stars。`;
}
export function homeTitle() { return 'AI 开源项目中文榜单 — Top 500 仓库每周更新'; }
export function homeDescription() {
  return '收录 GitHub 上 Top 500 AI 开源项目，提供中文一句话简介、适用场景、上手难度、同类替代。';
}
export function categoryTitle(label: string) { return `${label} — AI 开源项目榜单`; }
