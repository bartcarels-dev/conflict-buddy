export type LogValidationIssue = {
  code: 'handover_conflated' | 'invented_fact' | 'blame_copied' | 'empty';
  detail: string;
};

/** Chat/custody logs: do not collapse "has child on date X" + "brings Monday Y" into one wrong date. */
export function validateLogEntry(input: string, output: string): LogValidationIssue[] {
  const issues: LogValidationIssue[] = [];
  const inLower = input.toLowerCase();
  const outLower = output.toLowerCase();

  if (!output.trim()) {
    issues.push({ code: 'empty', detail: 'Log output is empty' });
    return issues;
  }

  const inputHasJune1 =
    /\b(1\s+juni|01-06|1-6-20|maandagochtend|maandag\s+ochtend|monday\s+morning)\b/i.test(
      input
    );
  const inputHasMay31 = /\b31\s+mei\b/i.test(input);
  const outputMentionsJune1 =
    /\b(1\s+juni|01-06|maandagochtend|maandag\s+ochtend)\b/i.test(output);
  const outputSaysBringMay31 =
    /\b(brengt|brengen|zal\s+brengen|will\s+bring|bring).{0,50}\b31\s+mei\b/i.test(
      output
    ) && !outputMentionsJune1;

  if (inputHasMay31 && inputHasJune1 && outputSaysBringMay31) {
    issues.push({
      code: 'handover_conflated',
      detail:
        'Input distinguishes 31 May (custody) and Monday 1 June (drop-off) — log must not say Bart only "brings on 31 May" without the 1 June handover',
    });
  }

  const blameCopied =
    /\b(je\s+bent|jij\s+bent|gooit\s+mijn|you\s+are\s+regularly|makkelijk\s+praten)\b/i.test(
      output
    );
  if (blameCopied) {
    issues.push({
      code: 'blame_copied',
      detail: 'Remove second-person blame from log — use neutral facts only',
    });
  }

  return issues;
}

export function buildLogValidationRetryPrompt(issues: LogValidationIssue[]): string {
  const list = issues.map((i) => `- ${i.detail}`).join('\n');
  return `
Your log entry failed quality checks. Fix and return JSON again: { "output": "string" }

${list}

Remember: separate custody ON a date from handover/bring AT a date/time. Attribute statements to who said them. Only facts from the notes.
`.trim();
}
