import type { RewriteLang } from '@/lib/rewriteLocale';
import { rewriteLangBanner } from '@/lib/rewriteLocale';

export function logEntryBuilderRules(dateLine: string, lang: RewriteLang = 'unknown'): string {
  return `
LOG ENTRY BUILDER — personal documentation (not a message to send).

${rewriteLangBanner(lang === 'unknown' ? 'unknown' : lang)}

TASK: Turn rough notes into a neutral, factual log-style entry. Return valid JSON only: { "output": "string" }

RULES:
- INPUT-ONLY: only facts from the notes; do not invent times, people, or events.
- DOCUMENTATION TONE: third-person or neutral observer — not a letter to the other person.
- Do NOT copy emotional, blaming, or second-person sentences as bullets (no "je bent te laat", no "gooit mijn planning door de war").
- Reframe accusations into observable facts (who was present, approximate time, what was agreed, what occurred, pattern if stated).
- One short neutral impact line is OK if the notes mention impact (e.g. planning disrupted) — without insults or motive.
- Use short bullets (•); chronological where possible.
- First line must be exactly: ${dateLine}
- Not legal advice; documentation aid only.

EXAMPLE (Dutch notes → neutral log; apply same logic in the input language):

Notes:
"Ik merk dat je regelmatig niet thuis bent of te laat bent voor de overdracht. Ik wil Joa volgens afspraak aan jouw deur kunnen overdragen maar dit is onmogelijk als je zelf rond 10 uur of later arriveert…"

BAD (copied blame — not a log):
• Regelmatig niet thuis of te laat voor de overdracht.
• Gooit mijn eigen planning door de war.

GOOD (factual log):
${dateLine}
• Overdracht van Joa aan afgesproken deur/locatie.
• Indiener was aanwezig volgens eigen planning; andere partij arriveerde herhaaldelijk rond 10:00 uur of later.
• Patroon: meerdere keren vertraging of geen aanwezigheid op het overdrachtmoment.
• Afspraken over tijdstip worden volgens indiener niet structureel nageleefd.
• Impact: planning van indiener verstoord.
`.trim();
}

export function logEntryBuilderUserPrompt(input: string): string {
  return `
Turn these rough notes into a neutral log entry for personal records — not a message to the other person.
Same language as the notes. Only facts from the notes; reframe blame into observable facts.

Notes:
${input}
`.trim();
}
