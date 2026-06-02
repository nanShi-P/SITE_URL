export type CategorySlug = 'llm'|'agent'|'rag'|'multimodal'|'voice'|'devtools'|'framework'|'data'|'other';

export const CATEGORIES: { slug: CategorySlug; label: string }[] = [
  { slug: 'llm', label: 'LLM 大模型' },
  { slug: 'agent', label: 'Agent 智能体' },
  { slug: 'rag', label: 'RAG 检索增强' },
  { slug: 'multimodal', label: '多模态（图像/视频）' },
  { slug: 'voice', label: '语音（TTS/ASR）' },
  { slug: 'devtools', label: '开发工具' },
  { slug: 'framework', label: '框架与编排' },
  { slug: 'data', label: '数据 & 训练' },
  { slug: 'other', label: '其他' },
];

interface Rule { slug: CategorySlug; topics: string[]; keywords: RegExp[]; }

// 顺序敏感：更具体的规则放前面
const RULES: Rule[] = [
  { slug: 'voice', topics: ['asr','tts','speech','speech-recognition','speech-synthesis','voice'],
    keywords: [/whisper/i, /speech/i, /\btts\b/i, /\basr\b/i] },
  { slug: 'multimodal', topics: ['diffusion','image-generation','text-to-image','vision','video'],
    keywords: [/stable[-_ ]?diffusion/i, /text[-_ ]?to[-_ ]?(image|video)/i, /\bvision\b/i] },
  { slug: 'rag', topics: ['rag','retrieval','vector-database','embeddings'],
    keywords: [/\brag\b/i, /retrieval[-_ ]augmented/i, /vector[-_ ]?(db|database|store)/i] },
  { slug: 'agent', topics: ['agent','autonomous','autogpt','agi'],
    keywords: [/\bagent\b/i, /autonomous/i] },
  { slug: 'devtools', topics: ['copilot','vscode','ide','code-completion'],
    keywords: [/copilot/i, /coding[-_ ]?assistant/i] },
  { slug: 'data', topics: ['training','dataset','fine-tuning','lora'],
    keywords: [/fine[-_ ]?tun/i, /training/i, /dataset/i] },
  { slug: 'framework', topics: ['framework','orchestration','workflow','chain'],
    keywords: [/framework/i, /langchain/i, /orchestrat/i] },
  { slug: 'llm', topics: ['llm','gpt','language-model','transformer','inference'],
    keywords: [/\bllm\b/i, /language[-_ ]?model/i, /\bgpt\b/i, /inference/i] },
];

export interface ClassifyInput { name: string; topics: string[]; description: string | null; }

export function classifyRepo(r: ClassifyInput): CategorySlug {
  const text = `${r.name} ${r.description ?? ''}`;
  const topics = new Set((r.topics ?? []).map(t => t.toLowerCase()));
  for (const rule of RULES) {
    if (rule.topics.some(t => topics.has(t))) return rule.slug;
    if (rule.keywords.some(rx => rx.test(text))) return rule.slug;
  }
  return 'other';
}
