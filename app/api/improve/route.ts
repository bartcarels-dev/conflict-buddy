import { NextResponse } from 'next/server';
import type { ToolMode, TransformLevel } from '@/lib/types';
import {
  detectLanguage,
  formatDate,
  genericLogEntryRules,
  getErrorResponse,
  parseAiJson,
  runCompletion,
} from '@/lib/ai';
import { messageRewriterRules } from '@/lib/prompts/messageRewriter';
import {
  buildPreservationRetryPrompt,
  checkRewritePreservation,
} from '@/lib/rewritePreservation';

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

function parseTransformLevel(value: unknown): TransformLevel {
  return value === 'minimal' ? 'minimal' : 'moderate';
}

function buildRewritePrompts(level: TransformLevel) {
  return {
    systemPrompt: messageRewriterRules(level),
  };
}

function buildRewriteUserPrompt(input: string, level: TransformLevel) {
  const levelNote =
    level === 'minimal'
      ? 'Apply MINIMAL polish — preserve structure and closing.'
      : 'Apply MODERATE calm clarity — keep every boundary and hedge.';

  return `
Rewrite the message below.

${levelNote}

Requirements:
- Same language as the input (do not translate).
- Only topics and facts from this text; add nothing.
- Remove insults/threats only; keep firm limits and preferences.
- Preserve hedges, conditions ("if", "in case", "when", "unless"), and closing intent.

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

function logDateLabel(input: string): string {
  return detectLanguage(input) === 'nl' ? 'Datum' : 'Date';
}

async function generateRewrite(
  input: string,
  level: TransformLevel,
  retryNote?: string
): Promise<string> {
  const { systemPrompt } = buildRewritePrompts(level);
  let userPrompt = buildRewriteUserPrompt(input, level);
  if (retryNote) {
    userPrompt = `${userPrompt}\n\n${retryNote}`;
  }

  const raw = await runCompletion(systemPrompt, userPrompt);
  try {
    const parsed = parseAiJson(raw);
    return extractOutput(parsed, 'rewrite');
  } catch {
    console.error('Failed to parse rewrite JSON:', raw);
    return raw.trim();
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const mode = body.mode as ToolMode;
    const input = String(body.input ?? '').trim();
    const eventDate = body.eventDate as string | undefined;
    const transformLevel = parseTransformLevel(body.transformLevel);

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

    let output = '';

    if (mode === 'rewrite') {
      output = await generateRewrite(input, transformLevel);
      const issues = checkRewritePreservation(input, output);
      if (issues.length > 0) {
        const retryNote = buildPreservationRetryPrompt(issues);
        output = await generateRewrite(input, transformLevel, retryNote);
      }
    } else {
      const { systemPrompt } = buildLogPrompts(dateLabel, formattedDate);
      const userPrompt = `
Turn these rough notes into a neutral log entry. Same language as the input. Only facts from the notes.

Notes:
${input}
`.trim();

      const raw = await runCompletion(systemPrompt, userPrompt);
      try {
        const parsed = parseAiJson(raw);
        output = extractOutput(parsed, 'log');
      } catch {
        console.error('Failed to parse JSON:', raw);
        output = raw.trim();
      }
      output = ensureLogEntry(output, dateLabel, formattedDate);
    }

    if (!output) {
      return NextResponse.json(
        { error: 'No output generated. Try again.' },
        { status: 502 }
      );
    }

    return NextResponse.json({ mode, output, transformLevel });
  } catch (err) {
    console.error('Error in /api/improve:', err);
    const { status, error } = getErrorResponse(err);
    return NextResponse.json({ error }, { status });
  }
}
