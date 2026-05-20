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
      'Paste a message that feels emotional, reactive, or unclear. Get a calmer, clearer version you can edit and copy.',
    log: 'Paste the same notes (or a message you are documenting). Get a neutral, factual log-style entry — not a copy of blame wording.',
  },
  input: {
    rewriteLabel: 'Your message',
    rewritePlaceholder:
      'Paste the message you want to send, or a rough draft of what you want to say…',
    logLabel: 'What happened',
    logPlaceholder:
      'Rough notes: who was involved, what happened, when, what was said…',
    sharedHint:
      'This text is shared between both tools — switch tabs without losing it.',
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
    buildLogEntry: 'Build log entry',
    resetAll: 'Reset all',
    copy: 'Copy',
    copied: 'Copied',
  },
  output: {
    rewriteLabel: 'Clearer message',
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
