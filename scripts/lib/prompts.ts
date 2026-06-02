export const DIGEST_SYSTEM = `你是一名中文技术编辑。读 GitHub README 后输出严格 JSON，字段：
- summary_zh: 80-120 字中文一句话简介，说人话，避免营销腔
- scenarios: 3-5 个具体使用场景字符串数组
- difficulty: "简单" | "中等" | "困难"
- difficulty_reason: 一句话说明为什么是这个难度（环境、依赖、文档质量等）
- alternatives: 0-3 个同类替代项目名字符串数组，可以为空
只输出 JSON，不要 markdown 围栏，不要任何额外文字。`;

export function buildDigestUserPrompt(input: {
  owner: string; name: string; description: string | null; readme: string | null;
}): string {
  return `仓库：${input.owner}/${input.name}
英文描述：${input.description ?? '(无)'}
README 摘要（前 2000 字）：
${input.readme ?? '(无 README)'}`;
}
