import { NextResponse } from 'next/server';
import type { ToolMode } from '@/lib/types';
import {
  detectLanguage,
  formatDate,
  genericLogEntryRules,
  getErrorResponse,
  messageRewriterRules,
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

function buildRewritePrompts() {
  return {
    systemPrompt: `
${messageRewriterRules()}
`.trim(),
  };
}

function buildRewriteUserPrompt(input: string) {
  return `
Rewrite the message below.

Requirements:
- Same language as the input (do not translate).
- Only topics and facts from this text; add nothing.
- Preserve hedges, conditions ("if", "in case", "when"), and the user's intent.
- If already calm, edit lightly — do not replace with a template closing.

Message:
${input}
`.trim();
}

function buildLogPrompts(dateLabel: string, formattedDate: string) {
  const dateLine = `${dateLabel}: ${formattedDate}`;
  return {
    systemPrompt: genericLogEntryRules().replace('{dateLine}', dateLine),
  };
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

/** Date label for log header — follows input language when detectable. */
function logDateLabel(input: string): string {
  return detectLanguage(input) === 'nl' ? 'Datum' : 'Date';
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
    const dateLabel = logDateLabel(input);

    const { systemPrompt } =
      mode === 'rewrite'
        ? buildRewritePrompts()
        : buildLogPrompts(dateLabel, formattedDate);

    const userPrompt =
      mode === 'rewrite'
        ? buildRewriteUserPrompt(input)
        : `
Turn these rough notes into a neutral log entry. Same language as the input. Only facts from the notes.

Notes:
${input}
`.trim();

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
