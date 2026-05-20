import { NextResponse } from 'next/server';
import type { ToolMode } from '@/lib/types';
import {
  deEscalatedRules,
  detectLanguage,
  formatDate,
  getErrorResponse,
  globalRules,
  logEntryRules,
  parseAiJson,
  runCompletion,
} from '@/lib/ai';

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

function buildRewritePrompts(lang: ReturnType<typeof detectLanguage>) {
  const systemPrompt =
    lang === 'nl'
      ? `
Je bent Conflict Buddy — Message Rewriter voor gespannen communicatie.
Schrijf één rustiger, duidelijker bericht dat de gebruiker kan versturen of als basis kan gebruiken.

${globalRules(lang)}

${deEscalatedRules(lang)}

Return valid JSON only: { "output": "string" }
`.trim()
      : `
You are Conflict Buddy — Message Rewriter for tense communication.
Write one calmer, clearer message the user can send or use as a draft.

${globalRules(lang)}

${deEscalatedRules(lang)}

Return valid JSON only: { "output": "string" }
`.trim();

  return { systemPrompt };
}

function buildLogPrompts(
  lang: ReturnType<typeof detectLanguage>,
  formattedDate: string,
  dateLabel: string
) {
  const systemPrompt =
    lang === 'nl'
      ? `
Je bent Conflict Buddy — Log Entry Builder.
Maak één neutrale, feitelijke logregistratie op basis van ruwe notities.

${globalRules(lang)}

LOG ENTRY:
${logEntryRules(lang)}
- Start met "${dateLabel}: ${formattedDate}".
- Bullets met • waar passend.

Return valid JSON only: { "output": "string" }
`.trim()
      : `
You are Conflict Buddy — Log Entry Builder.
Create one neutral, factual log-style entry from rough notes.

${globalRules(lang)}

LOG ENTRY:
${logEntryRules(lang)}
- Start with "${dateLabel}: ${formattedDate}".
- Use • bullets where appropriate.

Return valid JSON only: { "output": "string" }
`.trim();

  return { systemPrompt };
}

function extractOutput(parsed: Record<string, unknown>, mode: ToolMode): string {
  const direct = String(parsed.output ?? '').trim();
  if (direct) return direct;

  if (mode === 'rewrite') {
    return String(
      parsed.deEscalatedResponse ?? parsed.rewritten ?? ''
    ).trim();
  }

  return String(parsed.logEntry ?? '').trim();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const mode = body.mode as ToolMode;
    const input = String(body.input ?? '').trim();
    const eventDate = body.eventDate as string | undefined;

    if (mode !== 'rewrite' && mode !== 'log') {
      return NextResponse.json(
        { error: 'Invalid mode. Use "rewrite" or "log".' },
        { status: 400 }
      );
    }

    if (!input) {
      return NextResponse.json(
        { error: 'Missing required field: input' },
        { status: 400 }
      );
    }

    const formattedDate = formatDate(eventDate);
    const lang = detectLanguage(input);
    const dateLabel = lang === 'nl' ? 'Datum' : 'Date';

    const userPrompt =
      lang === 'nl'
        ? `Invoer:\n${input}`
        : `Input:\n${input}`;

    const { systemPrompt } =
      mode === 'rewrite'
        ? buildRewritePrompts(lang)
        : buildLogPrompts(lang, formattedDate, dateLabel);

    const raw = await runCompletion(systemPrompt, userPrompt);
    let output = '';

    try {
      const parsed = parseAiJson(raw);
      output = extractOutput(parsed, mode);
    } catch {
      console.error('Failed to parse JSON:', raw);
      output = raw.trim();
    }

    if (mode === 'log') {
      output = ensureLogEntry(output, dateLabel, formattedDate);
    }

    if (!output) {
      return NextResponse.json(
        { error: 'No output generated. Try again.' },
        { status: 502 }
      );
    }

    return NextResponse.json({ mode, output });
  } catch (err) {
    console.error('Error in /api/improve:', err);
    const { status, error } = getErrorResponse(err);
    return NextResponse.json({ error }, { status });
  }
}
