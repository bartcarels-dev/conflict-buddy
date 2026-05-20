/**
 * Phrases that often keep conflict hot — used to detect if rewrite still carries
 * blame/motive framing from the input. Language-agnostic patterns + NL/EN hints.
 */

export type EscalationHit = {
  pattern: string;
  label: string;
};

const ESCALATION_PATTERNS: { pattern: RegExp; label: string }[] = [
  { pattern: /\balsof\s+(dat|het)\s+normaal\s+is\b/i, label: 'alsof dat normaal is' },
  { pattern: /\balsof\s+dat\s+normaal\b/i, label: 'alsoof dat normaal' },
  { pattern: /\bpas\s+(wanneer|als)\s+ik\s+(er\s+)?(zelf\s+)?iets\s+van\s+zeg\b/i, label: 'pas wanneer ik er iets van zeg' },
  { pattern: /\bhet\s+lijkt\s+(vaak\s+)?alsof\b/i, label: 'het lijkt (vaak) alsof' },
  { pattern: /\bhet\s+voelt\s+(vaak\s+)?alsof\b/i, label: 'het voelt (vaak) alsof' },
  { pattern: /\bje\s+(laat|doet)\s+alsof\b/i, label: 'je laat/doet alsof' },
  { pattern: /\balsof\s+ik\s+maar\s+moet\b/i, label: 'alsof ik maar moet' },
  { pattern: /\bdat\s+ik\s+(dan\s+)?maar\s+moet\s+meebewegen\b/i, label: 'dat ik maar moet meebewegen' },
  {
    pattern: /\byou\s+(act|behave)\s+as\s+if\s+it'?s\s+normal\b/i,
    label: "act as if it's normal",
  },
  { pattern: /\bonly\s+when\s+i\s+(say|speak)\s+up\b/i, label: 'only when I speak up' },
  { pattern: /\bit\s+(often\s+)?seems\s+like\s+you\b/i, label: 'it seems like you' },
  { pattern: /\bit\s+feels\s+like\s+you\s+(only|always)\b/i, label: 'it feels like you only/always' },
  { pattern: /\bas\s+if\s+i\s+('|a)?m\s+just\s+supposed\s+to\b/i, label: 'as if I am just supposed to' },
];

const CORPORATE_PATTERNS: { pattern: RegExp; label: string }[] = [
  { pattern: /\bik\s+vind\s+het\s+belangrijk\s+dat\s+we\s+samen\b/i, label: 'ik vind het belangrijk dat we samen' },
  { pattern: /\blaten\s+we\s+samen\s+werken\s+aan\b/i, label: 'laten we samen werken aan' },
  { pattern: /\bi\s+hope\s+we\s+can\s+work\s+together\b/i, label: 'I hope we can work together' },
  { pattern: /\bthis\s+raises\s+questions\s+about\b/i, label: 'this raises questions about' },
];

export function findEscalationPhrases(text: string): EscalationHit[] {
  const hits: EscalationHit[] = [];
  for (const { pattern, label } of ESCALATION_PATTERNS) {
    if (pattern.test(text)) hits.push({ pattern: label, label });
  }
  return hits;
}

export function findCorporatePhrases(text: string): EscalationHit[] {
  const hits: EscalationHit[] = [];
  for (const { pattern, label } of CORPORATE_PATTERNS) {
    if (pattern.test(text)) hits.push({ pattern: label, label });
  }
  return hits;
}

/** Input had escalation phrase that output still contains verbatim (bad). */
export function escalationNotReduced(input: string, output: string): EscalationHit[] {
  const inputHits = findEscalationPhrases(input);
  return inputHits.filter((h) => {
    const re = ESCALATION_PATTERNS.find((p) => p.label === h.label)?.pattern;
    return re ? re.test(output) : false;
  });
}
