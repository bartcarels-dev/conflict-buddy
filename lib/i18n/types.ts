export const UI_LOCALES = ['en', 'nl', 'de', 'fr', 'es', 'pt'] as const;

export type UiLocale = (typeof UI_LOCALES)[number];

export type Messages = {
  appName: string;
  language: {
    label: string;
    aria: string;
  };
  header: {
    title: string;
    subtitle: string;
    disclaimer: string;
  };
  tabs: {
    aria: string;
    rewrite: { label: string; hint: string };
    log: { label: string; hint: string };
  };
  intro: {
    rewrite: string;
    log: string;
  };
  input: {
    rewriteLabel: string;
    rewritePlaceholder: string;
    logLabel: string;
    logPlaceholder: string;
    sharedHint: string;
  };
  log: {
    entryDate: string;
  };
  rewrite: {
    modeLabel: string;
    minimal: string;
    moderate: string;
    firm: string;
    modeHelp: string;
  };
  actions: {
    generating: string;
    regenerate: string;
    rewriteMessage: string;
    buildLogEntry: string;
    resetAll: string;
    copy: string;
    copied: string;
  };
  output: {
    rewriteLabel: string;
    rewritePlaceholder: string;
    logLabel: string;
    logPlaceholder: string;
    logEmptyHint: string;
    editHint: string;
  };
  privacy: string;
  errors: {
    generic: string;
    network: string;
  };
};
