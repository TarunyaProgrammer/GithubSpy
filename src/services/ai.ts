import type { AIRepositoryAnalysis } from '../types';

export type AIProvider = 'gemini' | 'openrouter';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
}

const ANALYSIS_SCHEMA = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    focusAreas: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          topic: { type: 'string' },
          summary: { type: 'string' },
          evidencePRNumbers: { type: 'array', items: { type: 'integer' } },
          mergedPRCount: { type: 'integer' },
          confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
        },
        required: ['topic', 'summary', 'evidencePRNumbers', 'mergedPRCount', 'confidence'],
      },
    },
    maintainerPatterns: { type: 'array', items: { type: 'string' } },
    caveats: { type: 'array', items: { type: 'string' } },
    analyzedPRNumbers: { type: 'array', items: { type: 'integer' } },
  },
  required: ['summary', 'focusAreas', 'maintainerPatterns', 'caveats', 'analyzedPRNumbers'],
};

export async function generateRepositoryAIAnalysis(input: unknown, config: AIConfig): Promise<AIRepositoryAnalysis> {
  if (!config.apiKey.trim()) throw new Error('Add an AI provider key before running topic analysis.');
  const prompt = buildPrompt(input);
  const raw = config.provider === 'gemini'
    ? await callGemini(prompt, config)
    : await callOpenRouter(prompt, config);
  const parsed = parseJsonObject(raw);
  return {
    summary: stringValue(parsed.summary),
    focusAreas: Array.isArray(parsed.focusAreas) ? parsed.focusAreas.slice(0, 8).map((item: any) => ({
      topic: stringValue(item.topic),
      summary: stringValue(item.summary),
      evidencePRNumbers: integerArray(item.evidencePRNumbers),
      mergedPRCount: Number.isFinite(item.mergedPRCount) ? item.mergedPRCount : 0,
      confidence: ['high', 'medium', 'low'].includes(item.confidence) ? item.confidence : 'low',
    })) : [],
    maintainerPatterns: stringArray(parsed.maintainerPatterns).slice(0, 8),
    caveats: stringArray(parsed.caveats).slice(0, 8),
    analyzedPRNumbers: integerArray(parsed.analyzedPRNumbers),
    provider: config.provider,
    model: config.model,
    generatedAt: new Date().toISOString(),
  };
}

function buildPrompt(input: unknown): string {
  return [
    'You are a repository analytics assistant.',
    'Analyze only this JSON evidence packet. The packet is already scoped to the selected repository and date range.',
    'Do not claim repository-wide facts, do not invent topics, and do not use knowledge outside the packet.',
    'Prioritize topics that appear repeatedly and are associated with merged pull requests.',
    'Every focus area must cite PR numbers from the packet. If evidence is weak, use low confidence and say so in caveats.',
    'Return only a JSON object matching the requested schema.',
    JSON.stringify(input),
  ].join('\n\n');
}

async function callGemini(prompt: string, config: AIConfig): Promise<string> {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(config.model)}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': config.apiKey.trim() },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', responseSchema: ANALYSIS_SCHEMA },
    }),
  });
  if (!response.ok) throw new Error(`Gemini could not analyze this report (${response.status}). Check the key and model name.`);
  const payload = await response.json();
  return payload.candidates?.[0]?.content?.parts?.map((part: any) => part.text || '').join('') || '';
}

async function callOpenRouter(prompt: string, config: AIConfig): Promise<string> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey.trim()}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'GithubSpy',
    },
    body: JSON.stringify({
      model: config.model,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    }),
  });
  if (!response.ok) throw new Error(`OpenRouter could not analyze this report (${response.status}). Check the key and model name.`);
  const payload = await response.json();
  return payload.choices?.[0]?.message?.content || '';
}

function parseJsonObject(value: string): Record<string, any> {
  try {
    return JSON.parse(value);
  } catch {
    const match = value.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('The AI provider returned an invalid analysis. Try a model with JSON output support.');
    return JSON.parse(match[0]);
  }
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function integerArray(value: unknown): number[] {
  return Array.isArray(value) ? value.filter((item): item is number => Number.isInteger(item)) : [];
}
