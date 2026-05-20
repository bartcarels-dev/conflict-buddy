import type { RewriteAnalysis } from '@/lib/types';
import {
  escalationNotReduced,
  findCorporatePhrases,
} from '@/lib/rewriteEscalationPatterns';

export type ValidationIssue = {
  code:
    | 'hedge_dropped'
    | 'agency_flipped'
    | 'closing_replaced'
    | 'unchanged'
    | 'escalation_preserved'
    | 'substantive_dropped'
    | 'too_corporate';
  detail: string;
};

const HEDGE_PATTERNS: { pattern: RegExp; label: string }[] = [
  { pattern: /\bin het geval\b/i, label: 'in het geval' },
  { pattern: /\bals je\b/i, label: 'als je' },
  { pattern: /\bliever niet\b/i, label: 'liever niet' },
  { pattern: /\bop zijn minst\b/i, label: 'op zijn minst' },
  { pattern: /\btenzij\b/i, label: 'tenzij' },
  { pattern: /\bin case\b/i, label: 'in case' },
  { pattern: /\bif you\b/i, label: 'if you' },
  { pattern: /\bi(?:'d| would) prefer\b/i, label: "I'd prefer" },
  { pattern: /\bat least\b/i, label: 'at least' },
  { pattern: /\bunless\b/i, label: 'unless' },
];

function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/[.,!?;:'"()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isRewriteUnchanged(input: string, output: string): boolean {
  const a = normalize(input);
  const b = normalize(output);
  return !!a && !!b && a === b;
}

function significantWords(phrase: string): string[] {
  return phrase
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zà-ÿ0-9]/gi, ''))
    .filter((w) => w.length >= 4);
}

function phraseLikelyPreserved(phrase: string, output: string): boolean {
  const words = significantWords(phrase);
  if (words.length === 0) return true;
  const out = output.toLowerCase();
  const matched = words.filter((w) => out.includes(w)).length;
  return matched >= Math.max(1, Math.ceil(words.length * 0.4));
}

export function validateRewrite(
  input: string,
  output: string,
  analysis?: RewriteAnalysis | null
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const { pattern, label } of HEDGE_PATTERNS) {
    if (pattern.test(input) && !pattern.test(output)) {
      issues.push({
        code: 'hedge_dropped',
        detail: `Conditional/hedge lost (e.g. "${label}")`,
      });
    }
  }

  if (
    /\bje\s+gaf\b/i.test(input) &&
    /\bik\s+heb\b/i.test(output) &&
    /\bteruggekregen\b/i.test(output) &&
    !/\bje\s+gaf\b/i.test(output)
  ) {
    issues.push({
      code: 'agency_flipped',
      detail: 'Agency flip: "je gaf … terug" → "ik heb … teruggekregen"',
    });
  }

  if (
    /\byou\s+(gave|returned)\b/i.test(input) &&
    /\bi\s+received\b/i.test(output) &&
    !/\byou\s+(gave|returned)\b/i.test(output)
  ) {
    issues.push({
      code: 'agency_flipped',
      detail: 'Agency flip: "you gave/returned" → only "I received"',
    });
  }

  const inputHasConditionalClose =
    /\b(in het geval|in case|als je het|if you)\b/i.test(input) &&
    input.length > 120;
  const outputShortGenericClose =
    /wil je.*teruggeven\??\s*$/i.test(output.trim()) ||
    /could you.*return.*\?\s*$/i.test(output.trim());
  if (
    inputHasConditionalClose &&
    outputShortGenericClose &&
    !/\b(in het geval|in case)\b/i.test(output)
  ) {
    issues.push({
      code: 'closing_replaced',
      detail: 'Conditional closing replaced by generic ask',
    });
  }

  for (const hit of escalationNotReduced(input, output)) {
    issues.push({
      code: 'escalation_preserved',
      detail: `Escalating framing still present: "${hit.label}"`,
    });
  }

  for (const hit of findCorporatePhrases(output)) {
    issues.push({
      code: 'too_corporate',
      detail: `Corporate/submissive phrase added: "${hit.label}"`,
    });
  }

  const toPreserve = [
    ...(analysis?.substantive ?? []),
    ...(analysis?.boundariesAndConditions ?? []),
  ];
  for (const point of toPreserve) {
    if (point.length < 8) continue;
    if (!phraseLikelyPreserved(point, output)) {
      issues.push({
        code: 'substantive_dropped',
        detail: `Substantive point may be missing: "${point.slice(0, 60)}…"`,
      });
    }
  }

  const seen = new Set<string>();
  return issues.filter((i) => {
    const key = `${i.code}:${i.detail}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function buildValidationRetryPrompt(issues: ValidationIssue[]): string {
  const list = issues.map((i) => `- ${i.detail}`).join('\n');
  return `
Your rewrite failed quality checks. Fix these issues and return the FULL JSON again (all fields + output):

${list}

Rules:
- REFRAME escalating framing into neutral observations (impact on me / pattern / facts) — do not copy blame or motive-attribution phrases.
- KEEP every substantive point and boundary from your analysis arrays.
- Same language as input. Not submissive or corporate.
`.trim();
}

export function buildUnchangedRetryPrompt(): string {
  return `
Output was identical to input. For this mode you must STRUCTURALLY de-escalate (not synonym-swap).

Return full JSON again. Reframe blame/motive lines; keep facts, impact, pattern, and boundaries.
`.trim();
}
