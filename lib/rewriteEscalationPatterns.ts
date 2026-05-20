/**
 * Escalation detection by INTENT (language-agnostic categories).
 * Works across languages via multi-locale patterns + analysis-phrase matching.
 */

import type { RewriteAnalysis } from '@/lib/types';

export type EscalationHit = {
  category: string;
  label: string;
};

/** Intent-based categories — each has patterns for several languages. */
const ESCALATION_CATEGORIES: {
  category: string;
  label: string;
  patterns: RegExp[];
}[] = [
  {
    category: 'as_if_normal',
    label: 'as-if-that-is-normal framing',
    patterns: [
      /\b(as\s+if|as\s+though)\s+(it\s+)?(is|'s|that'?s)\s+normal\b/i,
      /\b(alsoof|als\s+of)\s+.{0,12}(dat|het)\s+.{0,8}normaal\b/i,
      /\b(comme\s+si|comme\s+si\s+c'|c'est\s+normal)\b/i,
      /\b(como\s+si|como\s+se)\s+.{0,12}(fuera\s+)?normal\b/i,
      /\b(als\s+ob|als\s+waere)\s+.{0,12}normal\b/i,
      /\bcomo\s+se\s+fosse\s+normal\b/i,
    ],
  },
  {
    category: 'only_when_i_speak',
    label: 'consideration/change only when I speak up',
    patterns: [
      /\b(only|not\s+until|pas|erst|solo|só|so)\s+.{0,30}(when|als|wanneer|zodra|quand|cuando|wenn).{0,30}(say|speak|mention|zeg|digo|dis|sag|falo)\b/i,
      /\b(zodra|when|wanneer|quand|cuando|wenn)\s+.{0,25}(ik|i|ich|je|I|yo)\s+.{0,20}(zeg|say|speak|mention|dis|sag|falo)\b/i,
      /\b(zodra|when|wanneer)\s+ik\s+er\s+(zelf\s+)?iets\s+van\s+zeg\b/i,
      /\bonly\s+when\s+i\s+(say|speak|mention)\b/i,
      /\bnur\s+wenn\s+ich\s+(etwas\s+)?(sage|erwähne)\b/i,
      /\bwenn\s+ich\s+etwas\s+sage\b/i,
      /\berst\s+auf\s+meine\s+planung\b/i,
      /\bque\s+quand\s+je\s+dis\b/i,
      /\bcuando\s+digo\s+algo\b/i,
      /\bquando\s+digo\s+algo\b/i,
      /\bseulement\s+quand\s+je\s+(dis|parle|mentionne)\b/i,
    ],
  },
  {
    category: 'feeling_account_after_speak',
    label: 'feels like account/consideration only after I raise it',
    patterns: [
      /\b(feel|feels|feeling|voelt|gevoel|siento|siento|fühle|ressens)\s+.{0,50}(rekening|consideration|account|cuenta|compte|berücksichtigung).{0,80}(when|zodra|pas|only|wanneer|quand|wenn|cuando).{0,50}(say|speak|zeg|mention|dis|sag)\b/i,
      /\b(rekening|consideration|account|cuenta|compte)\s+.{0,60}(held|houden|taken|gehouden|tiene|pris).{0,60}(zodra|when|pas|only|wanneer|wenn).{0,40}(zeg|speak|say|dis)\b/i,
      /\b(het\s+)?(gevoel|feeling)\s+dat\s+er\s+pas\s+rekening\b/i,
      /\bpas\s+rekening\s+wordt\s+gehouden\b/i,
      /\bit\s+feels\s+.{0,30}(only\s+)?(after|when|once).{0,30}(i\s+)?(say|speak|mention)\b/i,
      /\bonly\s+after\s+i\s+(say|speak|raise|mention)\b/i,
      /\bsolo\s+cuando\s+(digo|hablo|menciono)\b/i,
      /\berst\s+wenn\s+ich\s+(etwas\s+)?(sage|erwähne)\b/i,
      /\bseulement\s+quand\s+je\s+(dis|parle|mentionne)\b/i,
    ],
  },
  {
    category: 'must_accommodate',
    label: 'I must go along / adapt as if expected',
    patterns: [
      /\b(must|moet|have\s+to|tengo\s+que|muss|ich\s+muss|dois)\s+.{0,25}(go\s+along|meebewegen|adapt|adjust|me\s+aanpassen|mitmachen|anpassen)\b/i,
      /\b(alsof|as\s+if|als\s+ob|comme\s+si)\s+.{0,20}(ik|i|ich)\s+.{0,15}(maar\s+)?(moet|must|muss)\b/i,
    ],
  },
  {
    category: 'you_always_never',
    label: 'you always/never absolute framing',
    patterns: [
      /\b(you|je|jij|u|du|tu|usted|você|voce)\s+(always|never|altijd|nooit|steeds\s+weer|immer|nie|siempre|nunca|toujours|jamais)\b/i,
      /\b(always|never|altijd|nooit|immer|nie|siempre|nunca)\s+.{0,15}(you|je|jij|du|tu)\b/i,
    ],
  },
  {
    category: 'motive_attribution',
    label: 'implied bad intent / you act like',
    patterns: [
      /\b(het\s+)?(lijkt|voelt)\s+(vaak\s+)?(alsof|als\s+of)\s+(jij|je|you)\b/i,
      /\b(it\s+)?(seems|feels)\s+like\s+you\s+(only|always|don't)\b/i,
      /\b(you|je)\s+(act|behave|doet)\s+(like|as\s+if|alsof)\b/i,
    ],
  },
  {
    category: 'legal_or_public_threat',
    label: 'legal threat or public shaming',
    patterns: [
      /\b(advocaat|lawyer|attorney|solicitor|abogado|anwalt|avocat|advogado)\s*(bellen|call|contact|llamar|anrufen|appeler|ligar)/i,
      /\b(ga\s+ik|ik\s+ga|i\s+will|going\s+to|voy\s+a|ich\s+werde|je\s+vais)\s+.{0,25}(advocaat|lawyer|attorney|abogado|anwalt|avocat)\b/i,
      /\biedereen\s+hoort\b/i,
      /\beveryone\s+will\s+hear\b/i,
      /\btodos\s+van\s+a\s+saber\b/i,
      /\balle\s+werden\s+es\s+erfahren\b/i,
      /\btout\s+le\s+monde\s+saura\b/i,
      /\bescaleer.{0,20}(naar\s+)?HR\b/i,
      /\bescalat(e|ing)\s+.{0,15}\s+to\s+HR\b/i,
      /\bescalar(e|é)?\s+.{0,15}(a\s+)?(RR\.?HH|recursos\s+humanos|RH)\b/i,
      /\beskalieren?\s+.{0,15}(an\s+)?(die\s+)?HR\b/i,
    ],
  },
  {
    category: 'direct_you_absence_late',
    label: 'direct you are not home / late accusation',
    patterns: [
      /\b(je|jij|you|du|tu|usted|você|voce)\s+.{0,30}(niet\s+thuis|not\s+home|te\s+laat|too\s+late|not\s+on\s+time|zu\s+spät|nicht\s+da|nicht\s+zu\s+hause|en\s+retard|tarde)\b/i,
      /\b(je|jij|you|du|tu)\s+(regelmatig|regularly|regelmäßig|regularmente)\s+.{0,20}(niet\s+thuis|te\s+laat|not\s+home|zu\s+spät)\b/i,
    ],
  },
];

const CORPORATE_PATTERNS: { pattern: RegExp; label: string }[] = [
  { pattern: /\bik\s+vind\s+het\s+belangrijk\s+dat\s+we\s+samen\b/i, label: 'ik vind het belangrijk dat we samen' },
  { pattern: /\bi\s+think\s+it'?s\s+important\s+that\s+we\s+work\s+together\b/i, label: 'I think it is important that we work together' },
  { pattern: /\bthis\s+raises\s+questions\s+about\b/i, label: 'this raises questions about' },
  { pattern: /\bi\s+hope\s+we\s+can\s+work\s+together\b/i, label: 'I hope we can work together' },
  { pattern: /\bes\s+ist\s+mir\s+wichtig\s+dass\s+wir\s+zusammen\b/i, label: 'es ist mir wichtig dass wir zusammen' },
  { pattern: /\bje\s+trouve\s+important\s+que\s+nous\s+travaillions\s+ensemble\b/i, label: 'je trouve important que nous travaillions ensemble' },
  { pattern: /\bme\s+parece\s+importante\s+que\s+trabajemos\s+juntos\b/i, label: 'me parece importante que trabajemos juntos' },
  { pattern: /\bacho\s+importante\s+que\s+trabalhemos\s+juntos\b/i, label: 'acho importante que trabalhemos juntos' },
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function significantWords(phrase: string, minLen = 4): string[] {
  return normalize(phrase)
    .split(' ')
    .filter((w) => w.length >= minLen);
}

function findCategories(text: string): EscalationHit[] {
  const hits: EscalationHit[] = [];
  const seen = new Set<string>();
  for (const { category, label, patterns } of ESCALATION_CATEGORIES) {
    if (seen.has(category)) continue;
    if (patterns.some((p) => p.test(text))) {
      hits.push({ category, label });
      seen.add(category);
    }
  }
  return hits;
}

export function findEscalationPhrases(text: string): EscalationHit[] {
  return findCategories(text);
}

export function findCorporatePhrases(text: string): { label: string }[] {
  const hits: { label: string }[] = [];
  for (const { pattern, label } of CORPORATE_PATTERNS) {
    if (pattern.test(text)) hits.push({ label });
  }
  return hits;
}

/** Categories present in input that still appear in output. */
export function escalationNotReduced(input: string, output: string): EscalationHit[] {
  const inputCats = findCategories(input);
  const outputCats = new Set(findCategories(output).map((h) => h.category));
  return inputCats.filter((h) => outputCats.has(h.category));
}

/**
 * Language-independent: model-listed escalating lines still copied into output.
 */
export function framingFromAnalysisCopied(
  analysis: RewriteAnalysis | null | undefined,
  output: string
): { phrase: string; reason: string }[] {
  if (!analysis?.escalatingFraming?.length) return [];

  const outNorm = normalize(output);
  const copied: { phrase: string; reason: string }[] = [];

  for (const phrase of analysis.escalatingFraming) {
    const pNorm = normalize(phrase);
    if (pNorm.length < 8) continue;

    if (pNorm.length >= 12 && outNorm.includes(pNorm)) {
      copied.push({ phrase, reason: 'verbatim from analysis list' });
      continue;
    }

    const words = significantWords(phrase, 3);
    if (words.length < 3) continue;

    const matched = words.filter((w) => outNorm.includes(w));
    const ratio = matched.length / words.length;

    if (ratio >= 0.75) {
      copied.push({
        phrase,
        reason: 'most words from listed framing still in output',
      });
      continue;
    }

    // Long distinctive chunk (≥5 words in order)
    for (let len = Math.min(6, words.length); len >= 4; len--) {
      for (let i = 0; i <= words.length - len; i++) {
        const chunk = words.slice(i, i + len).join(' ');
        if (chunk.length >= 15 && outNorm.includes(chunk)) {
          copied.push({
            phrase,
            reason: `phrase chunk still present: "${chunk}"`,
          });
          break;
        }
      }
      if (copied.some((c) => c.phrase === phrase)) break;
    }
  }

  return copied;
}
