import type { TransformLevel } from '@/lib/types';
import { buildProfilePromptHints } from '@/lib/rewrite/context';
import type { RewriteLang } from '@/lib/rewriteLocale';
import { detectRewriteLocale, rewriteLangBanner, rewriteLangLabel } from '@/lib/rewriteLocale';

const COMPOSE_FRAMEWORK = `
You are drafting a REPLY the user will send — not rewriting the other person's text.

INPUT may be a single message OR a conversation thread (multiple messages, chat export, email back-and-forth). Read the full thread for context and tone.

TASK: Write ONE clear, calm, de-escalated message the user should send next — in the SAME language as the conversation (usually the most recent messages).

Use the same four-bucket thinking as de-escalation (substantive, boundaries, emotional intensity, escalating framing from the thread — do not copy attacks into the reply).

RULES:
- If it is a thread: understand the arc, then reply to what matters now (typically the latest turn) — do not answer each message separately.
- If both sides appear in the thread, you are still writing the USER's next outgoing message to the other person.
- Address the situation; do not mirror insults, threats, or sarcasm.
- Do NOT quote or paraphrase their worst lines back at them.
- If the user provided draft/notes, honor their intent, boundaries, and agency phrases — weave in, do not ignore.
- Natural message length — not an essay or corporate email.
- Same language as the conversation — never translate.
`.trim();

function levelBlock(level: TransformLevel): string {
  if (level === 'firm') {
    return `
LEVEL: FIRM BOUNDARY — state limits and requests clearly; no legal/HR threats or public shaming in the reply.
`.trim();
  }
  if (level === 'minimal') {
    return `
LEVEL: LIGHT — short, polite reply; fix tone slightly but keep it brief.
`.trim();
  }
  return `
LEVEL: CLEAR & CALM — structural de-escalation; observation + impact + constructive forward ask when appropriate.
`.trim();
}

export function messageReplyComposerRules(
  level: TransformLevel,
  lang: RewriteLang = 'unknown'
): string {
  const jsonFields =
    level === 'minimal'
      ? '{ "output": "string — reply in same language as their message" }'
      : `{
  "substantive": ["string"],
  "boundariesAndConditions": ["string"],
  "emotionalIntensity": ["string"],
  "escalatingFraming": ["string — from THEIR message, not in your reply"],
  "output": "string — the reply to send"
}`;

  return `
You are Conflict Buddy — Reply composer.

${rewriteLangBanner(lang)}

${COMPOSE_FRAMEWORK}

${levelBlock(level)}

Return valid JSON only: ${jsonFields}
`.trim();
}

export function messageReplyComposerUserPrompt(
  theirMessage: string,
  userNotes: string,
  level: TransformLevel
): string {
  const lang = detectRewriteLocale(theirMessage);
  const langLine =
    lang === 'unknown'
      ? 'Write the reply in the EXACT same language as their message.'
      : `Reply language: ${rewriteLangLabel(lang)} only.`;

  const notesBlock = userNotes.trim()
    ? `
User draft / notes (optional — honor intent and boundaries):
${userNotes.trim()}
`
    : '';

  return `
Compose a reply the user can send.

${langLine}
${buildProfilePromptHints(theirMessage)}
${notesBlock}

Conversation or their message (context for your reply):
${theirMessage.trim()}

Write the reply in "output". List escalatingFraming from the thread only (moderate/firm) — phrases to avoid in the reply.
`.trim();
}
