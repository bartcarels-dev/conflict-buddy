import type { Messages } from '@/lib/i18n/types';

export const en: Messages = {
  appName: 'Conflict Buddy',
  language: {
    label: 'Language',
    aria: 'Interface language',
  },
  header: {
    title: 'Clearer communication when emotions run high',
    subtitle:
      'Paste your text once, then rewrite a message or build a neutral log entry from the same notes — edit, copy, no account and no saved history.',
    disclaimer: 'Writing aid only — not legal advice or therapy.',
  },
  tabs: {
    aria: 'Choose tool',
    rewrite: {
      label: 'Message Rewriter',
      hint: 'Calmer, clearer wording to send or say',
    },
    log: {
      label: 'Log Entry',
      hint: 'Neutral factual notes for your records',
    },
  },
  intro: {
    rewrite:
      'Paste what they said, your draft, or both — get a calmer reply or a clearer version of your message.',
    log: 'Paste notes about what happened. Get a neutral, factual log-style entry — not a copy of blame wording.',
  },
  rewriteEntry: {
    aria: 'How to start',
    reply: 'Reply to them',
    replyHint: 'They messaged you — we suggest a reply',
    polish: 'Polish my draft',
    polishHint: 'You already wrote something — we refine it',
  },
  input: {
    theirMessageLabel: 'What they said',
    theirMessagePlaceholder:
      'Paste their message, email, or text you are responding to…',
    theirMessageHint:
      'Paste the message you are replying to. It is not stored after you leave.',
    userDraftLabel: 'What you want to say (optional)',
    userDraftPlaceholderReply:
      'Rough draft, bullet points, or leave empty — we will suggest a reply…',
    userDraftPlaceholderPolish:
      'Paste the message you want to send, or a rough draft…',
    userDraftHintReply:
      'Optional: your angle, boundaries, or a partial draft to include.',
    logLabel: 'What happened',
    logPlaceholder:
      'Rough notes: who was involved, what happened, when, what was said…',
    logHint: 'Used for the log entry only — separate from the rewriter fields.',
  },
  log: {
    entryDate: 'Entry date',
  },
  rewrite: {
    modeLabel: 'Rewrite mode',
    minimal: 'Light polish',
    moderate: 'Clear & calm',
    firm: 'Firm boundary',
    modeHelp:
      'Light polish: grammar and typos only. Clear & calm: structural de-escalation. Firm boundary: same, with limits stated clearly.',
  },
  actions: {
    generating: 'Generating…',
    regenerate: 'Regenerate',
    rewriteMessage: 'Rewrite message',
    suggestReply: 'Suggest reply',
    buildLogEntry: 'Build log entry',
    resetAll: 'Reset all',
    copy: 'Copy',
    copied: 'Copied',
  },
  output: {
    rewriteLabel: 'Clearer message',
    replyLabel: 'Suggested reply',
    rewritePlaceholder: 'Your clearer message will appear here after you generate.',
    logLabel: 'Log entry',
    logPlaceholder: 'Your neutral log entry will appear here after you generate.',
    logEmptyHint:
      'Log entries reframe notes into neutral facts — not a bullet list of accusations.',
    editHint:
      'Edit before copying. Switch tools to keep this input; each tool has its own output.',
  },
  privacy:
    'Privacy: no account and no saved history. What you enter is used only to generate your result on this visit—it is not stored, reviewed by us, or used to train AI. Copy anything you want to keep before you leave.',
  errors: {
    generic: 'Something went wrong.',
    network: 'Network error. Please try again.',
  },
};
