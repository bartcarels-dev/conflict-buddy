import { NextResponse } from 'next/server';
import type { RewriteAnalysis, ToolMode, TransformLevel } from '@/lib/types';
import {
  detectLanguage,
  formatDate,
  genericLogEntryRules,
  getErrorResponse,
  parseAiJson,
  runCompletion,
} from '@/lib/ai';
import {
  messageRewriterMinimalRules,
  messageRewriterMinimalUserPrompt,
  usesStructuredPipeline,
} from '@/lib/prompts/messageRewriterMinimal';
import {
  messageRewriterStructuredRules,
  messageRewriterStructuredUserPrompt,
} from '@/lib/prompts/messageRewriterStructured';
import {
  buildUnchangedRetryPrompt,
  buildValidationRetryPrompt,
  isRewriteUnchanged,
  validateRewrite,
} from '@/lib/rewriteValidation';

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
  if (value === 'minimal' || value === 'firm') return value;
  return 'moderate';
}

function buildLogPrompts(dateLabel: string, formattedDate: string) {
  const dateLine = `${dateLabel}: ${formattedDate}`;
  return {
    systemPrompt: genericLogEntryRules().replace('{dateLine}', dateLine),
  };
}

function parseAnalysis(parsed: Record<string, unknown>): RewriteAnalysis | null {
  const toArr = (v: unknown) =>
    Array.isArray(v) ? v.map(String).filter(Boolean) : [];

  const substantive = toArr(parsed.substantive);
  const boundariesAndConditions = toArr(parsed.boundariesAndConditions);
  const emotionalIntensity = toArr(parsed.emotionalIntensity);
  const escalatingFraming = toArr(parsed.escalatingFraming);

  if (
    substantive.length +
      boundariesAndConditions.length +
      emotionalIntensity.length +
      escalatingFraming.length ===
    0
  ) {
    return null;
  }

  return {
    substantive,
    boundariesAndConditions,
    emotionalIntensity,
    escalatingFraming,
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

async function runModel(
  systemPrompt: string,
  userPrompt: string
): Promise<Record<string, unknown>> {
  const raw = await runCompletion(systemPrompt, userPrompt);
  try {
    return parseAiJson(raw);
  } catch {
    console.error('Failed to parse JSON:', raw);
    return { output: raw.trim() };
  }
}

async function generateMinimalRewrite(
  input: string,
  retryNote?: string
): Promise<string> {
  let userPrompt = messageRewriterMinimalUserPrompt(input);
  if (retryNote) userPrompt = `${userPrompt}\n\n${retryNote}`;
  const parsed = await runModel(messageRewriterMinimalRules(), userPrompt);
  return extractOutput(parsed, 'rewrite');
}

async function generateStructuredRewrite(
  input: string,
  level: TransformLevel,
  retryNote?: string
): Promise<{ output: string; analysis: RewriteAnalysis | null }> {
  let userPrompt = messageRewriterStructuredUserPrompt(input, level);
  if (retryNote) userPrompt = `${userPrompt}\n\n${retryNote}`;
  const parsed = await runModel(
    messageRewriterStructuredRules(level),
    userPrompt
  );
  return {
    output: extractOutput(parsed, 'rewrite'),
    analysis: parseAnalysis(parsed),
  };
}

const MAX_REWRITE_ATTEMPTS = 2;

async function rewriteWithValidation(
  input: string,
  level: TransformLevel
): Promise<string> {
  let output = '';
  let analysis: RewriteAnalysis | null = null;
  let retryNote: string | undefined;

  for (let attempt = 0; attempt < MAX_REWRITE_ATTEMPTS; attempt++) {
    if (usesStructuredPipeline(level)) {
      const result = await generateStructuredRewrite(input, level, retryNote);
      output = result.output;
      analysis = result.analysis;
    } else {
      output = await generateMinimalRewrite(input, retryNote);
    }

    if (!output) break;

    const issues = validateRewrite(input, output, analysis);
    const needsUnchangedRetry =
      usesStructuredPipeline(level) && isRewriteUnchanged(input, output);

    if (issues.length === 0 && !needsUnchangedRetry) break;

    if (attempt === MAX_REWRITE_ATTEMPTS - 1) break;

    if (needsUnchangedRetry) {
      retryNote = buildUnchangedRetryPrompt();
    } else if (issues.length > 0) {
      retryNote = buildValidationRetryPrompt(issues);
    } else {
      break;
    }
  }

  return output;
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
      output = await rewriteWithValidation(input, transformLevel);
    } else {
      const { systemPrompt } = buildLogPrompts(dateLabel, formattedDate);
      const userPrompt = `
Turn these rough notes into a neutral log entry. Same language as the input. Only facts from the notes.

Notes:
${input}
`.trim();

      const parsed = await runModel(systemPrompt, userPrompt);
      output = extractOutput(parsed, 'log');
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
