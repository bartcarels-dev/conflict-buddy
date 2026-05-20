import { NextResponse } from 'next/server';
import { LIST_SECTIONS, type SectionKey } from '@/lib/types';
import {
  detectLanguage,
  formatDate,
  getErrorResponse,
  globalRules,
  parseAiJson,
  runCompletion,
  sectionFieldRules,
  toStringArray,
} from '@/lib/ai';
import { appendLearnedPreferencesBlock } from '@/lib/preferences';

const SECTION_LABELS: Record<SectionKey, string> = {
  deEscalatedResponse: 'de-escalated sendable message',
  boundaryResponse: 'firm boundary sendable message',
  courtSafeVersion: 'court/hearing-safe wording',
  logEntry: 'factual chronological log entry with bullets',
  riskNotes: 'risk notes on raw wording',
  omittedOrSoftened: 'omitted or softened details',
  suggestedTags: 'suggested tags',
  keyFacts: 'key facts extracted',
};

function isListSection(key: SectionKey) {
  return LIST_SECTIONS.includes(key);
}

type SectionMode = 'review' | 'regenerate';

function buildSectionPrompt(
  lang: ReturnType<typeof detectLanguage>,
  sectionKey: SectionKey,
  mode: SectionMode,
  formattedDate: string,
  dateLabel: string,
  baseline: string,
  event: string,
  currentValue: string | string[],
  feedback: string,
  learnedPreferences: string[] = []
) {
  const isList = isListSection(sectionKey);
  const currentText = Array.isArray(currentValue)
    ? currentValue.map((l) => `• ${l}`).join('\n')
    : currentValue;

  const jsonShape = isList
    ? `{ "${sectionKey}": ["string"], "summary": "string" }`
    : `{ "${sectionKey}": "string", "summary": "string" }`;

  const modeBlock =
    mode === 'review'
      ? lang === 'nl'
        ? `
De gebruiker heeft deze tekst ZELF geschreven of bewerkt. Geef één verbeterde versie die:
- Dezelfde feiten en bedoeling behoudt (niets verzinnen of weglaten wat de gebruiker bedoelde)
- Past bij het sectietype (${SECTION_LABELS[sectionKey]})
- Natuurlijker, beknopter en rustiger formuleert waar mogelijk
- Geen AI-clichés, geen "ik wil duidelijk maken", geen escape clauses

"summary": één korte zin in het Nederlands over wat je verbeterde (max 120 tekens).`
        : `
The user wrote or edited this text themselves. Provide one improved version that:
- Keeps the same facts and intent (do not invent or drop what the user meant)
- Fits the section type (${SECTION_LABELS[sectionKey]})
- Is clearer and calmer where possible
- Avoids AI clichés and hedge phrases

"summary": one short line in English on what you improved (max 120 chars).`
      : lang === 'nl'
        ? `
Pas de gebruikersfeedback toe op de huidige versie. Verander alleen wat nodig is.
"summary": één korte zin over de belangrijkste wijziging.`
        : `
Apply the user's directions to the current version. Change only what is needed.
"summary": one short line on the main change.`;

  const extraFieldRules = sectionFieldRules(lang, sectionKey);

  const systemPrompt = `
Je bent Conflict Buddy. Werk ALLEEN aan het veld "${sectionKey}".
Type: ${SECTION_LABELS[sectionKey]}.
Modus: ${mode === 'review' ? 'review gebruikersversie' : 'regenerate met feedback'}.

${globalRules(lang)}
${extraFieldRules ? `\n${extraFieldRules}\n` : ''}
${modeBlock}

Return valid JSON only:
${jsonShape}
`.trim();

  const feedbackLabel =
    mode === 'review'
      ? lang === 'nl'
        ? 'Optionele focus (mag leeg zijn)'
        : 'Optional focus (may be empty)'
      : lang === 'nl'
        ? 'Feedback van gebruiker'
        : 'User directions';

  const userPrompt = appendLearnedPreferencesBlock(
    `
${dateLabel}: ${formattedDate}
Context:
${baseline || (lang === 'nl' ? '(geen)' : '(none)')}

Originele situatie:
${event}

Huidige versie van "${sectionKey}":
${currentText || (lang === 'nl' ? '(leeg)' : '(empty)')}

${feedbackLabel}:
${feedback || (lang === 'nl' ? '(geen)' : '(none)')}
`.trim(),
    learnedPreferences,
    lang
  );

  return { systemPrompt, userPrompt };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      sectionKey,
      baseline,
      event,
      eventDate,
      currentValue,
      feedback,
      mode: modeRaw,
      learnedPreferences,
    } = body;

    const mode: SectionMode = modeRaw === 'review' ? 'review' : 'regenerate';
    const prefs = Array.isArray(learnedPreferences)
      ? learnedPreferences.map(String).filter(Boolean)
      : [];

    if (!event?.trim()) {
      return NextResponse.json({ error: 'Missing event' }, { status: 400 });
    }
    if (!sectionKey || !(sectionKey in SECTION_LABELS)) {
      return NextResponse.json({ error: 'Invalid sectionKey' }, { status: 400 });
    }

    const key = sectionKey as SectionKey;
    const formattedDate = formatDate(eventDate);
    const lang = detectLanguage(`${baseline ?? ''} ${event}`);
    const dateLabel = lang === 'nl' ? 'Datum' : 'Date';

    const { systemPrompt, userPrompt } = buildSectionPrompt(
      lang,
      key,
      mode,
      formattedDate,
      dateLabel,
      baseline || '',
      event,
      currentValue ?? (isListSection(key) ? [] : ''),
      feedback || '',
      prefs
    );

    const raw = await runCompletion(systemPrompt, userPrompt);
    let parsed: Record<string, unknown>;

    try {
      parsed = parseAiJson(raw);
    } catch {
      console.error('Failed to parse section JSON:', raw);
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 502 }
      );
    }

    const value = isListSection(key)
      ? toStringArray(parsed[key])
      : String(parsed[key] ?? '');
    const summary =
      typeof parsed.summary === 'string' ? parsed.summary.trim() : undefined;

    return NextResponse.json({ sectionKey: key, value, summary });
  } catch (err) {
    console.error('Error in /api/improve/section:', err);
    const { status, error } = getErrorResponse(err);
    return NextResponse.json({ error }, { status });
  }
}
