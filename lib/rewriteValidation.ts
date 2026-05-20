import type { RewriteAnalysis, TransformLevel } from '@/lib/types';
import {
  escalationNotReduced,
  findCorporatePhrases,
  framingFromAnalysisCopied,
} from '@/lib/rewriteEscalationPatterns';
import {
  extractTimes,
  findAgencyGave,
  HEDGE_PATTERNS,
  isHandoverContext,
  languageMismatch,
  REGULAR_ABSENCE_BLAME,
  rewriteLangLabel,
  detectRewriteLocale,
  YOU_SELF_TIME,
} from '@/lib/rewriteLocale';
import {
  hasRedundantAgreementAsk,
  inputLeadCopied,
  isMostlyReorderedBlame,
} from '@/lib/rewriteStructuralCheck';

export type ValidationIssue = {
  code:
    | 'hedge_dropped'
    | 'agency_flipped'
    | 'closing_replaced'
    | 'unchanged'
    | 'escalation_preserved'
    | 'substantive_dropped'
    | 'too_corporate'
    | 'reordered_blame'
    | 'fact_dropped';
  detail: string;
};

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
  analysis?: RewriteAnalysis | null,
  level: TransformLevel = 'moderate'
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const strict = level === 'moderate' || level === 'firm';

  if (!strict) {
    if (languageMismatch(input, output)) {
      issues.push({
        code: 'escalation_preserved',
        detail: `Output must stay in ${rewriteLangLabel(detectRewriteLocale(input))} — do not translate`,
      });
    }
    return issues;
  }

  if (languageMismatch(input, output)) {
    issues.push({
      code: 'escalation_preserved',
      detail: `Output must stay in ${rewriteLangLabel(detectRewriteLocale(input))} — do not translate`,
    });
  }

  for (const { pattern, label } of HEDGE_PATTERNS) {
    if (pattern.test(input) && !pattern.test(output)) {
      issues.push({
        code: 'hedge_dropped',
        detail: `Conditional/hedge lost (e.g. "${label}")`,
      });
    }
  }

  const agency = findAgencyGave(input);
  if (agency && !agency.preserve.test(output)) {
    issues.push({
      code: 'agency_flipped',
      detail: `Keep "${agency.label}" from input — do not flip to passive "I received" only`,
    });
  }

  if (YOU_SELF_TIME.test(input) && YOU_SELF_TIME.test(output)) {
    issues.push({
      code: 'escalation_preserved',
      detail:
        'Drop "you yourself" before time — state facts/impact (e.g. "around 10") without second-person blame',
    });
  }

  if (isHandoverContext(input) && REGULAR_ABSENCE_BLAME.test(output)) {
    issues.push({
      code: 'escalation_preserved',
      detail:
        'Handover: reframe "you are regularly not home/late" to situation + impact on handover/planning',
    });
  }

  const inputTimes = extractTimes(input);
  for (const t of inputTimes) {
    const num = t.match(/\d{1,2}/)?.[0];
    if (num && !output.includes(num)) {
      issues.push({
        code: 'fact_dropped',
        detail: `Time/number from input missing in output: "${t.trim()}"`,
      });
    }
  }

  const inputHasConditionalClose =
    /\b(in het geval|in case|im falle|au cas où|en caso de|no caso de|als je het|if you)\b/i.test(
      input
    ) && input.length > 120;
  const outputShortGenericClose =
    /(wil je|could you|könntest du|pourrais-tu|podrías|poderia)\s+.{0,40}(teruggeven|return|zurückgeben|rendre|devolver)\??\s*$/i.test(
      output.trim()
    );
  if (
    inputHasConditionalClose &&
    outputShortGenericClose &&
    !HEDGE_PATTERNS.some(({ pattern }) => pattern.test(output))
  ) {
    issues.push({
      code: 'closing_replaced',
      detail: 'Conditional closing replaced by generic ask',
    });
  }

  if (
    /\b(advocaat|lawyer|attorney|abogado|anwalt|avocat|advogado)\s*(bellen|call|contact|llamar|anrufen|appeler|ligar)/i.test(
      output
    )
  ) {
    issues.push({
      code: 'escalation_preserved',
      detail: 'Remove legal-threat lines from output',
    });
  }

  if (/\b(iedereen\s+hoort|everyone\s+will\s+hear|todos\s+van\s+a\s+saber|alle\s+werden|tout\s+le\s+monde\s+saura)\b/i.test(output)) {
    issues.push({
      code: 'escalation_preserved',
      detail: 'Remove public-shaming lines from output',
    });
  }

  for (const hit of escalationNotReduced(input, output)) {
    issues.push({
      code: 'escalation_preserved',
      detail: `Escalating structure still present: ${hit.label}`,
    });
  }

  for (const { phrase, reason } of framingFromAnalysisCopied(analysis, output)) {
    issues.push({
      code: 'escalation_preserved',
      detail: `Listed escalating framing copied (${reason}): "${phrase.slice(0, 70)}${phrase.length > 70 ? '…' : ''}"`,
    });
  }

  for (const hit of findCorporatePhrases(output)) {
    issues.push({
      code: 'too_corporate',
      detail: `Corporate/submissive phrase added: "${hit.label}"`,
    });
  }

  if (inputLeadCopied(input, output)) {
    issues.push({
      code: 'escalation_preserved',
      detail:
        'Opening sentence copied from input — reframe (do not keep the same blame lead-in)',
    });
  }

  if (isMostlyReorderedBlame(input, output)) {
    issues.push({
      code: 'reordered_blame',
      detail:
        'Still multiple direct you+problem sentences — reframe to situation/impact (e.g. handover cannot happen on time), not reorder the same accusations',
    });
  }

  if (hasRedundantAgreementAsk(input, output)) {
    issues.push({
      code: 'reordered_blame',
      detail:
        'Input already states agreements do not work — reframe blame chains, do not only add a generic "better agreements" closing',
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
- Remove or reframe EVERY item in escalatingFraming — none may appear verbatim or as a close paraphrase in output.
- Replace with neutral observations (impact on me, pattern, facts) — no motive attribution, no "only when I speak up", no "as if normal".
- Reduce repeated "you are late / you are not home" chains — state facts + impact on handover/planning instead.
- Do NOT only reorder the same accusations; do NOT add a generic "better agreements" line if the input already said arrangements fail.
- KEEP every substantive point and boundary from your analysis arrays.
- KEEP times, numbers, names, and conditional hedges from the input (in the same language).
- If input uses second-person "you gave" / "je gaf" / "tu diste" etc., keep that agency — do not flip to "I received" only.
- Same language as input — never translate. Not submissive or corporate.
`.trim();
}

export function buildUnchangedRetryPrompt(): string {
  return `
Output was identical to input. For this mode you must STRUCTURALLY de-escalate (not synonym-swap).

Return full JSON again. Reframe blame/motive lines; keep facts, impact, pattern, and boundaries.
`.trim();
}
