/**
 * Lightweight checks that rewrite output still reflects key input intent.
 * Not exhaustive — triggers an optional single retry when issues are found.
 */

export type PreservationIssue = {
  code: 'hedge_dropped' | 'agency_flipped' | 'closing_replaced' | 'unchanged';
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

/** True when rewrite returned essentially the same text (common when input is already calm). */
export function isRewriteUnchanged(input: string, output: string): boolean {
  const a = normalize(input);
  const b = normalize(output);
  if (!a || !b) return false;
  return a === b;
}

export function checkRewritePreservation(
  input: string,
  output: string
): PreservationIssue[] {
  const issues: PreservationIssue[] = [];
  const inNorm = normalize(input);
  const outNorm = normalize(output);

  for (const { pattern, label } of HEDGE_PATTERNS) {
    if (pattern.test(input) && !pattern.test(output)) {
      issues.push({
        code: 'hedge_dropped',
        detail: `Conditional/hedge phrase lost (e.g. "${label}")`,
      });
    }
  }

  // NL: "je gaf … terug" should not become only "ik heb … teruggekregen"
  if (
    /\bje\s+gaf\b/i.test(input) &&
    /\bik\s+heb\b/i.test(output) &&
    /\bteruggekregen\b/i.test(output) &&
    !/\bje\s+gaf\b/i.test(output)
  ) {
    issues.push({
      code: 'agency_flipped',
      detail:
        'Direct address flipped (input: "je gaf … terug" → output: "ik heb … teruggekregen")',
    });
  }

  // EN: "you gave/returned" → sole "I received"
  if (
    /\byou\s+(gave|returned)\b/i.test(input) &&
    /\bi\s+received\b/i.test(output) &&
    !/\byou\s+(gave|returned)\b/i.test(output)
  ) {
    issues.push({
      code: 'agency_flipped',
      detail:
        'Direct address flipped (input addressed "you did X" → output only "I received")',
    });
  }

  // Long conditional closing removed while output ends with a short generic ask only
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
      detail:
        'User\'s conditional closing (e.g. "in case you still use it") replaced by a generic ask',
    });
  }

  // Deduplicate by code
  const seen = new Set<string>();
  return issues.filter((i) => {
    const key = i.code + i.detail;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function buildUnchangedRetryPrompt(): string {
  return `
Your previous output was identical to the input. That is not acceptable for CLEAR & CALM mode.

Rephrase the message: smoother, calmer, clearer wording — but keep every fact, boundary, hedge ("in het geval", "if", "unless"), and conditional closing meaning.

Return JSON { "output": "string" }. The text MUST differ from the input.
`.trim();
}

export function buildPreservationRetryPrompt(issues: PreservationIssue[]): string {
  const list = issues.map((i) => `- ${i.detail}`).join('\n');
  return `
Your previous rewrite failed quality checks. Fix ONLY these issues and return JSON { "output": "string" }:

${list}

Keep the same language as the input. Do not add new topics. Preserve all limits, conditions, and the user's closing intent.
`.trim();
}
