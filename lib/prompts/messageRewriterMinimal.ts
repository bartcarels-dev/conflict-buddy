import type { TransformLevel } from '@/lib/types';
import type { RewriteLang } from '@/lib/rewriteLocale';
import { detectRewriteLocale, rewriteLangBanner, rewriteLangLabel } from '@/lib/rewriteLocale';

export function messageRewriterMinimalRules(lang: RewriteLang = 'unknown'): string {
  return `
You are Conflict Buddy — Message Rewriter (LIGHT POLISH only).

${rewriteLangBanner(lang)}

TASK: Minimal cleanup.
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
  const lang = detectRewriteLocale(input);
  const langLine =
    lang === 'unknown'
      ? 'Same language as input — never translate.'
      : `INPUT LANGUAGE: ${rewriteLangLabel(lang)} only — never translate.`;

  return `
Apply LIGHT POLISH only to this message. ${langLine} Minimal changes.

Message:
${input}
`.trim();
}

export function usesStructuredPipeline(level: TransformLevel): boolean {
  return level === 'moderate' || level === 'firm';
}
