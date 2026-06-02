import { describe, it, expect } from 'vitest';
import { classifyRepo } from '../scripts/lib/categories';

describe('classifyRepo', () => {
  const cases: [{ name: string; topics: string[]; description: string }, string][] = [
    [{ name: 'whisper', topics: ['asr','speech'], description: 'speech recognition' }, 'voice'],
    [{ name: 'langchain', topics: ['llm','framework'], description: 'LLM application framework' }, 'framework'],
    [{ name: 'autogpt', topics: ['agent','autonomous'], description: 'autonomous AI agent' }, 'agent'],
    [{ name: 'llama.cpp', topics: ['llm','inference'], description: 'LLM inference' }, 'llm'],
    [{ name: 'rag-tool', topics: ['rag','retrieval'], description: 'retrieval augmented' }, 'rag'],
    [{ name: 'stable-diffusion', topics: ['diffusion','image'], description: 'text to image' }, 'multimodal'],
    [{ name: 'copilot-x', topics: ['copilot','vscode'], description: 'coding assistant' }, 'devtools'],
    [{ name: 'training-kit', topics: ['training','dataset'], description: 'fine-tune data' }, 'data'],
    [{ name: 'random', topics: [], description: 'unrelated' }, 'other'],
  ];
  for (const [input, expected] of cases) {
    it(`classifies ${input.name} -> ${expected}`, () => {
      expect(classifyRepo(input)).toBe(expected);
    });
  }
});
