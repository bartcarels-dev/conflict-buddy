import { NextResponse } from 'next/server';
import type { RewriteAnalysis, ToolMode, TransformLevel } from '@/lib/types';
import {
  detectLanguage,
  formatDate,
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
  logEntryBuilderRules,
  logEntryBuilderUserPrompt,
} from '@/lib/prompts/logEntryBuilder';
import { buildRewriteContext } from '@/lib/rewrite/context';
import { hasKnewPerfectlyEscalation } from '@/lib/rewrite/profiles';
import { findAgencyGave, detectRewriteLocale, languageMismatch, rewriteLangLabel } from '@/lib/rewriteLocale';
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

function buildLogPrompts(input: string, dateLabel: string, formattedDate: string) {
  const dateLine = `${dateLabel}: ${formattedDate}`;
  return {
    systemPrompt: logEntryBuilderRules(dateLine, detectRewriteLocale(input)),
    userPrompt: logEntryBuilderUserPrompt(input),
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
  const lang = detectRewriteLocale(input);
  let userPrompt = messageRewriterMinimalUserPrompt(input);
  if (retryNote) userPrompt = `${userPrompt}\n\n${retryNote}`;
  const parsed = await runModel(messageRewriterMinimalRules(lang), userPrompt);
  return extractOutput(parsed, 'rewrite');
}

async function generateStructuredRewrite(
  input: string,
  level: TransformLevel,
  retryNote?: string
): Promise<{ output: string; analysis: RewriteAnalysis | null }> {
  const lang = detectRewriteLocale(input);
  let userPrompt = messageRewriterStructuredUserPrompt(input, level);
  if (retryNote) userPrompt = `${userPrompt}\n\n${retryNote}`;
  const parsed = await runModel(
    messageRewriterStructuredRules(level, lang),
    userPrompt
  );
  return {
    output: extractOutput(parsed, 'rewrite'),
    analysis: parseAnalysis(parsed),
  };
}

const MAX_STRUCTURED_ATTEMPTS = 4;
const MAX_MINIMAL_ATTEMPTS = 2;

async function rewriteWithValidation(
  input: string,
  level: TransformLevel
): Promise<string> {
  const rewriteContext = buildRewriteContext(input);
  let output = '';
  let analysis: RewriteAnalysis | null = null;
  let retryNote: string | undefined;

  const maxAttempts = usesStructuredPipeline(level)
    ? MAX_STRUCTURED_ATTEMPTS
    : MAX_MINIMAL_ATTEMPTS;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (usesStructuredPipeline(level)) {
      const result = await generateStructuredRewrite(input, level, retryNote);
      output = result.output;
      analysis = result.analysis;
    } else {
      output = await generateMinimalRewrite(input, retryNote);
    }

    if (!output) break;

    const issues = validateRewrite(input, output, analysis, level);
    const needsUnchangedRetry =
      usesStructuredPipeline(level) &&
      isRewriteUnchanged(input, output) &&
      !rewriteContext.flags.skipUnchangedRetry;

    if (issues.length === 0 && !needsUnchangedRetry) break;

    if (attempt === maxAttempts - 1) break;

    if (needsUnchangedRetry) {
      retryNote = buildUnchangedRetryPrompt();
    } else if (issues.length > 0) {
      retryNote = buildValidationRetryPrompt(issues);
    } else {
      break;
    }
  }

  output = ensureAgencyPreserved(input, output, level);

  for (let fix = 0; fix < 2 && languageMismatch(input, output); fix++) {
    const label = rewriteLangLabel(detectRewriteLocale(input));
    const note = `REJECTED — wrong language in previous attempt. Rewrite entirely in ${label} ONLY. Do not use any other language.`;
    if (usesStructuredPipeline(level)) {
      output = (await generateStructuredRewrite(input, level, note)).output;
      output = ensureAgencyPreserved(input, output, level);
    } else {
      output = await generateMinimalRewrite(input, note);
    }
  }

  const insultInOutput =
    /\b(ridiculous|ridicule|ridículo|lächerlich|belachelijk)\b/i;
  for (let fix = 0; fix < 2 && insultInOutput.test(output); fix++) {
    const note =
      'REJECTED — remove insult words (ridiculous, ridicule, ridículo, etc.) from output. State impact and request without sarcasm.';
    if (usesStructuredPipeline(level)) {
      output = (await generateStructuredRewrite(input, level, note)).output;
      output = ensureAgencyPreserved(input, output, level);
    } else {
      output = await generateMinimalRewrite(input, note);
    }
  }

  for (let fix = 0; fix < 2 && hasKnewPerfectlyEscalation(input, output); fix++) {
    const note =
      'REJECTED — still contains "you knew perfectly well" / "sabías perfectamente que" / "muito bem que" / "très bien que". Remove that motive-attribution line; keep deadline impact and deliver-tomorrow ask.';
    if (usesStructuredPipeline(level)) {
      output = (await generateStructuredRewrite(input, level, note)).output;
      output = ensureAgencyPreserved(input, output, level);
    } else {
      output = await generateMinimalRewrite(input, note);
    }
  }

  return output;
}

/** If input uses second-person "you gave" (any locale), keep that when the model dropped it. */
function ensureAgencyPreserved(
  input: string,
  output: string,
  level: TransformLevel
): string {
  if (!usesStructuredPipeline(level)) return output;
  const agency = findAgencyGave(input);
  if (!agency || agency.preserve.test(output)) return output;

  const firstChunk = output.slice(0, 80).toLowerCase();
  if (agency.preserve.test(firstChunk)) return output;

  const sentence =
    input
      .split(/[.!?]/)
      .map((s) => s.trim())
      .find((s) => agency.test.test(s)) ?? '';
  if (!sentence) return output;

  const punct = sentence.match(/([.!?])\s*$/)?.[1] ?? '.';
  const rest = output
    .replace(
      /^(Ik merk|I notice|Je remarque|He notado|Percebo|Noto|Ich merke|Je remarque)[^.!?]+[.!?]\s*/i,
      ''
    )
    .replace(/^Hey,?\s*/i, '')
    .trim();
  return `${sentence}${punct} ${rest}`.trim();
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
      const { systemPrompt, userPrompt } = buildLogPrompts(
        input,
        dateLabel,
        formattedDate
      );

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
