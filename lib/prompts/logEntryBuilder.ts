import type { RewriteLang } from '@/lib/rewriteLocale';
import { rewriteLangBanner } from '@/lib/rewriteLocale';

export function logEntryBuilderRules(dateLine: string, lang: RewriteLang = 'unknown'): string {
  return `
LOG ENTRY BUILDER — personal documentation (not a message to send).

${rewriteLangBanner(lang === 'unknown' ? 'unknown' : lang)}

TASK: Turn rough notes or a chat export into a neutral, factual log-style entry. Return valid JSON only: { "output": "string" }

RULES:
- INPUT-ONLY: only facts from the notes; do not invent times, people, events, or calendar dates (e.g. do not guess which Sunday is "Moederdag" unless the chat gives that date).
- CHAT EXPORTS: read timestamps and speakers; keep message dates accurate (do not swap May/June); attribute each point to who said it ("Bart stelde voor…", "Sasha gaf aan…").
- DOCUMENTATION TONE: third-person neutral observer — not a letter to the other person.
- Do NOT copy emotional, blaming, or second-person sentences as bullets.
- Reframe accusations into observable facts (what was proposed, agreed, disputed, or done).
- One short neutral impact line is OK if notes mention impact — without insults or motive.

HANDOVER / CUSTODY TIMING (critical):
- Distinguish: (a) child stays with a parent on date X, (b) handover/bring/drop-off at a specific time, (c) next-morning transfer after an event.
- Example: "31 mei bij mij, maandagochtend 1 juni brengen" → TWO facts: custody on 31 May AND drop-off Monday 1 June — NOT "brings child on 31 May" only.
- Use "overdracht" / "brengen" for the handover moment; "heeft Joa op [datum]" or "Joa bij [persoon] op [datum]" for where the child stays.
- Proposals are proposals until confirmed; disputes are disputes — do not state as settled fact unless the chat shows agreement.

FORMAT:
- Short bullets (•); chronological where possible.
- First line must be exactly: ${dateLine}
- Not legal advice; documentation aid only.

EXAMPLE (Dutch notes → neutral log):

Notes: "…overdracht… rond 10 uur… planning verstoord…"

BAD: • Je bent te laat. • Gooit mijn planning door de war.

GOOD:
${dateLine}
• Overdracht van kind aan afgesproken locatie/tijd.
• Partij A was aanwezig; partij B arriveerde herhaaldelijk rond 10:00 of later (volgens notities).
• Patroon van vertraging genoemd; impact op planning vermeld.
`.trim();
}

export function logEntryBuilderUserPrompt(input: string): string {
  return `
Turn these notes (or chat thread) into a neutral log entry for personal records — not a message to the other person.
Same language as the notes. Only facts from the notes; reframe blame into observable facts.
Pay special attention to handover dates vs days the child stays with a parent.

Notes:
${input}
`.trim();
}
