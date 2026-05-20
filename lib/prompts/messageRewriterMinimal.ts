import type { TransformLevel } from '@/lib/types';

export function messageRewriterMinimalRules(): string {
  return `
You are Conflict Buddy — Message Rewriter (LIGHT POLISH only).

TASK: Minimal cleanup. Write in the EXACT SAME language as the input.
Return valid JSON only: { "output": "string" }

RULES:
- Fix grammar, typos, and blatant insults/threats only.
- Keep sentence structure, framing, and emotional tone largely as written.
- Do NOT restructure blame/motive lines; do NOT de-escalate structurally.
- Preserve all boundaries, hedges, and closings.
- Near-identical output is OK when the draft is already calm.
`.trim();
}

export function messageRewriterMinimalUserPrompt(input: string): string {
  return `
Apply LIGHT POLISH only to this message. Same language. Minimal changes.

Message:
${input}
`.trim();
}

export function usesStructuredPipeline(level: TransformLevel): boolean {
  return level === 'moderate' || level === 'firm';
}
