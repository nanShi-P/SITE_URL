import Anthropic from '@anthropic-ai/sdk';
import { DIGEST_SYSTEM, buildDigestUserPrompt } from './prompts.js';

export interface Digest {
  summary_zh: string;
  scenarios: string[];
  difficulty: '简单' | '中等' | '困难';
  difficulty_reason: string;
  alternatives: string[];
}

// 如需把用户侧模型名映射成反代真实接受的 id，可在此扩展
const MODEL_ALIASES: Record<string, string> = {};

function resolveModel(name: string): string {
  return MODEL_ALIASES[name] ?? name;
}

export const MODEL = resolveModel(process.env.ANTHROPIC_MODEL || 'claude-opus-4.7');

export function createLlm() {
  return new Anthropic({
    baseURL: process.env.ANTHROPIC_BASE_URL,
    authToken: process.env.ANTHROPIC_AUTH_TOKEN || 'dummy',
    apiKey: process.env.ANTHROPIC_AUTH_TOKEN || 'dummy',
  });
}

export async function generateDigest(
  client: Anthropic,
  input: { owner: string; name: string; description: string | null; readme: string | null },
): Promise<Digest> {
  const tryOnce = async (): Promise<Digest> => {
    const resp = await client.messages.create({
      model: MODEL,
      max_tokens: 800,
      system: DIGEST_SYSTEM,
      messages: [{ role: 'user', content: buildDigestUserPrompt(input) }],
    });
    const text = resp.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map(b => b.text).join('').trim();
    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
    const parsed = JSON.parse(cleaned);
    if (
      typeof parsed.summary_zh !== 'string' ||
      !Array.isArray(parsed.scenarios) ||
      !['简单','中等','困难'].includes(parsed.difficulty) ||
      typeof parsed.difficulty_reason !== 'string' ||
      !Array.isArray(parsed.alternatives)
    ) throw new Error('schema invalid');
    return parsed as Digest;
  };
  try { return await tryOnce(); } catch { return await tryOnce(); }
}
