/**
 * Locale detection and cross-cutting patterns (language, hedges, agency, times).
 * Scenario-specific behavior lives in lib/rewrite/profiles/*.
 */

import { calmNoticeProfile } from '@/lib/rewrite/profiles/calm-notice';

export type RewriteLang = 'nl' | 'en' | 'de' | 'fr' | 'es' | 'pt' | 'unknown';

const LANG_LABELS: Record<Exclude<RewriteLang, 'unknown'>, string> = {
  nl: 'Dutch',
  en: 'English',
  de: 'German',
  fr: 'French',
  es: 'Spanish',
  pt: 'Portuguese',
};

const LANG_HINTS: Record<Exclude<RewriteLang, 'unknown'>, string[]> = {
  nl: [' de ', ' het ', ' een ', ' ik ', ' mijn ', ' niet ', ' je ', ' dat ', ' afspraken '],
  en: [
    ' the ', ' my ', ' your ', ' you ', ' not ', ' i am ', ' i will ', ' this is ',
    ' are ', ' is ', ' if you ', ' me ', ' having ', ' schedule ', ' pattern ',
    ' ignoring ', ' lawyer ', ' ridiculous ',
  ],
  de: [' ich ', ' nicht ', ' dass ', ' und ', ' der ', ' die ', ' müde ', ' absprachen '],
  fr: [' je ', ' les ', ' que ', ' mon ', ' une ', ' pas ', ' arrangements ', ' planning '],
  es: [' estoy ', ' los ', ' las ', ' cuando ', ' horario ', ' patrón ', ' ultimo '],
  pt: [' estou ', ' os ', ' uma ', ' não ', ' agenda ', ' quando ', ' embora '],
};

/** Lightweight locale guess for validation and prompt hints (not a full detector). */
export function detectRewriteLocale(text: string): RewriteLang {
  const lower = ` ${text.toLowerCase()} `;

  if (/\b(you are|i am honestly|i need|as agreed|your door|you gave|i'd rather)\b/.test(lower))
    return 'en';
  if (/\b(ich bin|du bist|absprachen|müde|übergeben)\b/.test(lower)) return 'de';
  if (/\b(je suis|tu es|les arrangements|remise|déposer)\b/.test(lower)) return 'fr';
  if (
    /\b(amanhã|devolveste|podes|chego|planeamento|acordos|combinado|tua\s+porta|tu\s+próprio|olá)\b/i.test(
      lower
    )
  )
    return 'pt';
  if (/\b(estoy|devolviste|acuerdos|horario|planificación|tú\s+mismo|mañana)\b/i.test(lower))
    return 'es';

  if (/[ãõ]|ção|não|estou|embora/.test(lower)) return 'pt';
  if (/ñ|estoy|último|horario|siento|patrón|patron/.test(lower)) return 'es';
  if (/ä|ö|ü|ß|müde|absprachen|rücksicht|ändern|gesagt/.test(lower)) return 'de';
  if (/è|é|ê|honnêt|fatigué|schéma|arrangements|fatigué/.test(lower)) return 'fr';
  if (/\b(i am|you are|this is|if you|will call|my schedule|handover|you gave|i'd rather)\b/.test(lower))
    return 'en';
  if (/\b(amanhã|devolveste|podes|chego|planeamento|olá)\b/i.test(lower)) return 'pt';
  if (/\b(estoy|devolviste|llamaré|tú mismo|planificación|mañana|hola)\b/i.test(lower)) return 'es';

  let best: RewriteLang = 'unknown';
  let bestScore = 0;
  for (const [lang, hints] of Object.entries(LANG_HINTS) as [
    Exclude<RewriteLang, 'unknown'>,
    string[],
  ][]) {
    const score = hints.filter((h) => lower.includes(h)).length;
    if (score > bestScore) {
      bestScore = score;
      best = lang;
    }
  }
  return bestScore >= 2 ? best : 'unknown';
}

export function rewriteLangLabel(lang: RewriteLang): string {
  return lang === 'unknown' ? 'the same language as the input' : LANG_LABELS[lang];
}

export function rewriteLangBanner(lang: RewriteLang): string {
  if (lang === 'unknown') {
    return 'OUTPUT: Write in the EXACT same language as the input. NEVER translate.';
  }
  return `OUTPUT LANGUAGE: ${LANG_LABELS[lang]} ONLY. Do NOT use Dutch, French, or any other language if the input is ${LANG_LABELS[lang]}. NEVER translate.`;
}

const PT_OUTPUT_MARKERS =
  /\b(amanhã|podes|chego|dez|combinado|planeamento|acordos|tua|entrega\s+do|estou|percebo|ignorar-me)\b/i;
const ES_OUTPUT_MARKERS =
  /\b(mañana|podrías|llegaré|diez|quería|planificación|acuerdos|tu\s+puerta|estoy|ignorarme)\b/i;

export function languageMismatch(input: string, output: string): boolean {
  const inLang = detectRewriteLocale(input);
  const outLang = detectRewriteLocale(output);
  if (inLang !== 'unknown' && outLang !== 'unknown' && inLang !== outLang) return true;
  if (inLang === 'pt' && ES_OUTPUT_MARKERS.test(output) && !PT_OUTPUT_MARKERS.test(output))
    return true;
  if (inLang === 'es' && PT_OUTPUT_MARKERS.test(output) && !ES_OUTPUT_MARKERS.test(output))
    return true;
  return false;
}

export {
  HANDOVER_CONTEXT,
  HANDOVER_TIMING,
  REGULAR_ABSENCE_BLAME,
  YOU_SELF_TIME,
} from '@/lib/rewrite/patterns';

export {
  isHandoverContext,
  isSchedulingPattern,
  hasKnewPerfectlyEscalation,
} from '@/lib/rewrite/profiles';

export function isAlreadyCalmMessage(input: string): boolean {
  return calmNoticeProfile.match(input);
}

export { AGENCY_GAVE, findAgencyGave } from '@/lib/rewrite/agency';

export const HEDGE_PATTERNS: { pattern: RegExp; label: string }[] = [
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
  { pattern: /\bsi\s+tu\b/i, label: 'si tu' },
  { pattern: /\ben\s+caso\s+de\b/i, label: 'en caso de' },
  { pattern: /\bpreferir[ií]a\s+que\s+no\b/i, label: 'preferiría que no' },
  { pattern: /\bpor\s+lo\s+menos\b/i, label: 'por lo menos' },
  { pattern: /\ba\s+menos\s+que\b/i, label: 'a menos que' },
  { pattern: /\bfalls\s+du\b/i, label: 'falls du' },
  { pattern: /\bwenn\s+du\b/i, label: 'wenn du' },
  { pattern: /\bim\s+falle\b/i, label: 'im Falle' },
  { pattern: /\blieber\s+nicht\b/i, label: 'lieber nicht' },
  { pattern: /\bmindestens\b/i, label: 'mindestens' },
  { pattern: /\baußer\s+wenn\b/i, label: 'außer wenn' },
  { pattern: /\bau\s+cas\s+où\b/i, label: 'au cas où' },
  { pattern: /\bje\s+préfère\s+que\s+tu\s+ne\b/i, label: 'je préfère que tu ne' },
  { pattern: /\bplutôt\s+pas\b/i, label: 'plutôt pas' },
  { pattern: /\bau\s+moins\b/i, label: 'au moins' },
  { pattern: /\bsauf\s+si\b/i, label: 'sauf si' },
  { pattern: /\bno\s+caso\s+de\b/i, label: 'no caso de' },
  { pattern: /\bprefiro\s+que\s+não\b/i, label: 'prefiro que não' },
  { pattern: /\bno\s+mínimo\b/i, label: 'no mínimo' },
  { pattern: /\ba\s+menos\s+que\b/i, label: 'a menos que (PT)' },
];

export const TIME_PATTERNS: RegExp[] = [
  /\b(rond|om|around|vers|sobre|às?)\s*\d{1,2}\s*(uur|Uhr|h|heures?|horas?)\b/gi,
  /\b(at\s+)?\d{1,2}(:\d{2})?\s*(am|pm)?\b/gi,
  /\b\d{1,2}\s*(Uhr|h)\b/gi,
];

export function extractTimes(input: string): string[] {
  const found: string[] = [];
  for (const re of TIME_PATTERNS) {
    const m = input.match(re);
    if (m) found.push(...m);
  }
  return found;
}
