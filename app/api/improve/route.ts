import { NextResponse } from 'next/server';
import type { AnalysisOutputs } from '@/lib/types';
import {
  boundaryRules,
  courtSafeRules,
  deEscalatedRules,
  detectLanguage,
  formatDate,
  getErrorResponse,
  globalRules,
  keyFactsRules,
  logEntryRules,
  parseAiJson,
  runCompletion,
  toStringArray,
} from '@/lib/ai';
import { appendLearnedPreferencesBlock } from '@/lib/preferences';

function ensureLogEntry(
  logEntry: string,
  dateLabel: string,
  formattedDate: string
) {
  if (!logEntry.trim()) return `${dateLabel}: ${formattedDate}`;
  if (!logEntry.includes(`${dateLabel}:`)) {
    return `${dateLabel}: ${formattedDate}\n${logEntry}`;
  }
  return logEntry;
}

function normalizeAnalysis(
  parsed: Record<string, unknown>,
  dateLabel: string,
  formattedDate: string
): AnalysisOutputs {
  return {
    deEscalatedResponse: String(
      parsed.deEscalatedResponse ?? parsed.rewritten ?? ''
    ),
    boundaryResponse: String(parsed.boundaryResponse ?? ''),
    courtSafeVersion: String(
      parsed.courtSafeVersion ?? parsed.saferVersion ?? ''
    ),
    logEntry: ensureLogEntry(
      String(parsed.logEntry ?? ''),
      dateLabel,
      formattedDate
    ),
    riskNotes: toStringArray(parsed.riskNotes),
    omittedOrSoftened: toStringArray(parsed.omittedOrSoftened),
    suggestedTags: toStringArray(parsed.suggestedTags),
    keyFacts: toStringArray(parsed.keyFacts),
  };
}

function buildAnalysisPrompts(
  lang: ReturnType<typeof detectLanguage>,
  formattedDate: string,
  dateLabel: string,
  baseline: string,
  event: string,
  learnedPreferences: string[] = []
) {
  const fieldRules =
    lang === 'nl'
      ? `
VELDEN — elk veld moet duidelijk verschillen. De-escalated en boundary zijn BEIDEN verzendbare berichten; boundary is niet "harder", alleen iets duidelijker over de grens. Court-safe is het enige niet-verzendbare veld.

1. deEscalatedResponse
${deEscalatedRules(lang)}

2. boundaryResponse
${boundaryRules(lang)}

3. courtSafeVersion
${courtSafeRules(lang)}

4. logEntry — feitelijk chronologisch met • bullets; start "${dateLabel}: ${formattedDate}".
${logEntryRules(lang)}

5. riskNotes — array: waarom formuleringen riskant/zwak zijn (incl. als patroon/herhaling zou worden weggelaten).
6. omittedOrSoftened — array: wat weggelaten/afgezwakt zou worden en waarom dat de kern schaadt.
7. suggestedTags — array: 3–6 korte tags (bijv. overdracht, kleding, afspraak).
8. keyFacts — array: 3–6 kernfeiten (tijd, actie, observatie, herhaling indien genoemd); geen vage conclusies.
${keyFactsRules(lang)}
`.trim()
      : `
FIELDS — each must differ clearly. De-escalated and boundary are BOTH sendable messages; boundary is not "harsher", only clearer on the limit. Court-safe is the only non-sendable field.

1. deEscalatedResponse
${deEscalatedRules(lang)}

2. boundaryResponse
${boundaryRules(lang)}

3. courtSafeVersion
${courtSafeRules(lang)}

4. logEntry — factual chronological bullets; start "${dateLabel}: ${formattedDate}".
${logEntryRules(lang)}

5. riskNotes — array: why wording was risky or weak (incl. if pattern/repetition would be dropped).
6. omittedOrSoftened — array: what would be left out and why that hurts the core point.
7. suggestedTags — array: 3–6 short tags (e.g. handover, clothing, agreement).
8. keyFacts — array: 3–6 core facts (time, action, observation, repetition if stated); no vague conclusions.
${keyFactsRules(lang)}
`.trim();

  const systemPrompt = `
Je bent Conflict Buddy: communicatie- en documentatie-assistent voor co-ouderschap.
Genereer alle velden in één JSON-object.

${globalRules(lang)}

${fieldRules}

Return valid JSON only:
{
  "deEscalatedResponse": "string",
  "boundaryResponse": "string",
  "courtSafeVersion": "string",
  "logEntry": "string",
  "riskNotes": ["string"],
  "omittedOrSoftened": ["string"],
  "suggestedTags": ["string"],
  "keyFacts": ["string"]
}
`.trim();

  const userPrompt = appendLearnedPreferencesBlock(
    `
${dateLabel}: ${formattedDate}
Context (niet in berichten overnemen):
${baseline || (lang === 'nl' ? '(geen)' : '(none)')}

Invoer:
${event}
${
  lang === 'nl'
    ? '\nLet op: (1) "ik" + naam; (2) tijdsketen overdracht in ALLE velden; (3) scheiden+wel mijn kleding voor Joa: VERPLICHT in de-escalated/boundary (KGB wel weglaten); (4) afsluiting dekt overdracht én kleding.'
    : '\nNote: (1) "I" + name; (2) handover time chain in ALL fields; (3) separation + your clothes for child: REQUIRED in de-escalated/boundary (omit child benefit); (4) closing covers handover AND clothing.'
}
`.trim(),
    learnedPreferences,
    lang
  );

  return { systemPrompt, userPrompt };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { baseline, event, eventDate, responseType, learnedPreferences } = body;
    const prefs = Array.isArray(learnedPreferences)
      ? learnedPreferences.map(String).filter(Boolean)
      : [];

    if (!event?.trim()) {
      return NextResponse.json(
        { error: 'Missing required field: event' },
        { status: 400 }
      );
    }

    const formattedDate = formatDate(eventDate);
    const lang = detectLanguage(`${baseline ?? ''} ${event}`);
    const dateLabel = lang === 'nl' ? 'Datum' : 'Date';

    const { systemPrompt, userPrompt } = buildAnalysisPrompts(
      lang,
      formattedDate,
      dateLabel,
      baseline || '',
      event,
      prefs
    );

    const raw = await runCompletion(systemPrompt, userPrompt);
    let parsed: Record<string, unknown>;

    try {
      parsed = parseAiJson(raw);
    } catch {
      console.error('Failed to parse analysis JSON:', raw);
      parsed = {
        deEscalatedResponse: raw.trim(),
        logEntry: `${dateLabel}: ${formattedDate}`,
        riskNotes: [],
        omittedOrSoftened: [],
        suggestedTags: [],
        keyFacts: [],
      };
    }

    const result = normalizeAnalysis(parsed, dateLabel, formattedDate);

    return NextResponse.json({
      mode: 'analysis',
      ...result,
      ...(responseType
        ? {
            rewritten:
              responseType === 'boundary'
                ? result.boundaryResponse
                : responseType === 'court_safe'
                  ? result.courtSafeVersion
                  : result.deEscalatedResponse,
            saferVersion: result.courtSafeVersion,
          }
        : {}),
    });
  } catch (err) {
    console.error('Error in /api/improve:', err);
    const { status, error } = getErrorResponse(err);
    return NextResponse.json({ error }, { status });
  }
}
