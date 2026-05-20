import OpenAI from 'openai';

export type Lang = 'nl' | 'en';

export function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error('MISSING_API_KEY');
  return new OpenAI({ apiKey });
}

export function formatDate(dateString?: string) {
  const d = dateString ? new Date(dateString) : new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

/** Hint for log date label only (rewrite uses same-language rule, not this). */
export function detectLanguage(text: string): Lang {
  const lower = ` ${text.toLowerCase()} `;
  const nlHints = [
    ' de ', ' het ', ' een ', ' ik ', ' mijn ', ' niet ', ' was ', ' zijn ',
    ' je ', ' het ', ' dat ',
  ];
  const enHints = [
    ' the ', ' my ', ' your ', ' not ', ' was ', ' you ', ' that ',
  ];
  const nlScore = nlHints.filter((w) => lower.includes(w)).length;
  const enScore = enHints.filter((w) => lower.includes(w)).length;
  return nlScore >= enScore ? 'nl' : 'en';
}

export function parseAiJson(raw: string): Record<string, unknown> {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const payload = fenced ? fenced[1].trim() : trimmed;
  return JSON.parse(payload) as Record<string, unknown>;
}

export function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(String).filter(Boolean);
}

/** Language-neutral log entry rules (same language as input). */
export function genericLogEntryRules(): string {
  return `
LOG ENTRY BUILDER:

TASK: Turn rough notes into one neutral, factual log-style entry. Write in the EXACT SAME language as the input (do not translate). Return valid JSON only: { "output": "string" }

RULES:
- INPUT-ONLY: only facts from the notes; do not invent times, people, or events.
- Neutral tone: observable facts (who, when, what, what was said) — no diagnoses, legal labels, or moralizing.
- Use short bullets (•) when listing events; chronological where possible.
- First line must be exactly: {dateLine}
- Not legal advice; documentation aid only.
`.trim();
}

export async function runCompletion(systemPrompt: string, userPrompt: string) {
  const openai = getOpenAIClient();
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.25,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  });
  return completion.choices[0].message.content || '{}';
}

function missingApiKeyMessage(): string {
  if (process.env.NODE_ENV === 'development') {
    return (
      'OpenAI API key missing. Add OPENAI_API_KEY=sk-… to .env.local in the project root, then restart the dev server (npm run dev).'
    );
  }
  return (
    'OpenAI API key is not configured on the server. In Vercel: Project → Settings → Environment Variables → add OPENAI_API_KEY, then redeploy.'
  );
}

export function getErrorResponse(err: unknown) {
  if (err instanceof Error && err.message === 'MISSING_API_KEY') {
    return {
      status: 503,
      error: missingApiKeyMessage(),
    };
  }
  const cause =
    err instanceof Error && err.cause instanceof Error ? err.cause : null;
  const nestedCause =
    cause && 'cause' in cause && cause.cause instanceof Error
      ? cause.cause
      : null;
  const code =
    (nestedCause as { code?: string } | null)?.code ??
    (cause as { code?: string } | null)?.code;

  if (code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
    return {
      status: 503,
      error: 'SSL error connecting to OpenAI. Restart with npm run dev.',
    };
  }

  if (err instanceof OpenAI.APIError) {
    if (err.status === 401) {
      return { status: 401, error: 'Invalid OpenAI API key.' };
    }
    if (err.status === 429) {
      return { status: 429, error: 'OpenAI rate limit reached. Try again shortly.' };
    }
    return {
      status: err.status ?? 502,
      error: err.message || 'OpenAI error.',
    };
  }

  if (err instanceof Error && err.message.includes('Connection error')) {
    return { status: 503, error: 'Could not connect to OpenAI.' };
  }

  return { status: 500, error: 'Something went wrong while generating.' };
}
