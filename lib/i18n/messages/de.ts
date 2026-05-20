import type { Messages } from '@/lib/i18n/types';

export const de: Messages = {
  appName: 'Conflict Buddy',
  language: { label: 'Sprache', aria: 'Sprache der Oberfläche' },
  header: {
    title: 'Klarere Kommunikation, wenn Emotionen hochkochen',
    subtitle:
      'Text einmal einfügen, dann Nachricht umschreiben oder einen neutralen Logeintrag aus denselben Notizen — bearbeiten, kopieren, kein Konto und kein Verlauf.',
    disclaimer: 'Nur Schreibhilfe — keine Rechtsberatung oder Therapie.',
  },
  tabs: {
    aria: 'Tool wählen',
    rewrite: {
      label: 'Nachricht umschreiben',
      hint: 'Ruhigere, klarere Formulierung zum Senden oder Sagen',
    },
    log: {
      label: 'Logeintrag',
      hint: 'Neutrale sachliche Notizen für Ihre Unterlagen',
    },
  },
  intro: {
    rewrite:
      'Fügen Sie eine emotionale, reaktive oder unklare Nachricht ein. Erhalten Sie eine ruhigere, klarere Version zum Bearbeiten und Kopieren.',
    log: 'Dieselben Notizen (oder eine Nachricht zur Dokumentation). Erhalten Sie einen neutralen, sachlichen Logeintrag — keine Kopie von Vorwürfen.',
  },
  input: {
    rewriteLabel: 'Ihre Nachricht',
    rewritePlaceholder:
      'Nachricht einfügen, die Sie senden möchten, oder einen Entwurf…',
    logLabel: 'Was passiert ist',
    logPlaceholder: 'Stichnotizen: wer, was, wann, was gesagt wurde…',
    sharedHint:
      'Dieser Text gilt für beide Tools — Tab wechseln ohne Verlust.',
  },
  log: { entryDate: 'Datum des Eintrags' },
  rewrite: {
    modeLabel: 'Umschreibmodus',
    minimal: 'Leichte Korrektur',
    moderate: 'Klar & ruhig',
    firm: 'Klare Grenze',
    modeHelp:
      'Leichte Korrektur: nur Rechtschreibung/Grammatik. Klar & ruhig: strukturelle Deeskalation. Klare Grenze: mit klar benannten Grenzen.',
  },
  actions: {
    generating: 'Wird erstellt…',
    regenerate: 'Erneut erstellen',
    rewriteMessage: 'Nachricht umschreiben',
    buildLogEntry: 'Logeintrag erstellen',
    resetAll: 'Alles zurücksetzen',
    copy: 'Kopieren',
    copied: 'Kopiert',
  },
  output: {
    rewriteLabel: 'Klarere Nachricht',
    rewritePlaceholder: 'Ihre klarere Nachricht erscheint hier nach dem Erstellen.',
    logLabel: 'Logeintrag',
    logPlaceholder: 'Ihr neutraler Logeintrag erscheint hier nach dem Erstellen.',
    logEmptyHint:
      'Logeinträge formulieren Notizen sachlich um — keine Liste von Vorwürfen.',
    editHint:
      'Vor dem Kopieren bearbeiten. Tools wechseln behält die Eingabe; jedes Tool hat eigene Ausgabe.',
  },
  privacy:
    'Datenschutz: kein Konto, kein gespeicherter Verlauf. Ihre Eingabe wird nur für dieses Ergebnis genutzt — nicht gespeichert, nicht von uns gelesen und nicht zum KI-Training verwendet. Kopieren Sie, was Sie behalten möchten.',
  errors: {
    generic: 'Etwas ist schiefgelaufen.',
    network: 'Netzwerkfehler. Bitte erneut versuchen.',
  },
};
