import type { Messages } from '@/lib/i18n/types';

export const nl: Messages = {
  appName: 'Conflict Buddy',
  language: {
    label: 'Taal',
    aria: 'Taal van de interface',
  },
  header: {
    title: 'Duidelijkere communicatie als emoties oplopen',
    subtitle:
      'Plak je tekst één keer, herschrijf een bericht of maak een neutraal logboekitem van dezelfde notities — bewerk, kopieer, geen account en geen opgeslagen geschiedenis.',
    disclaimer: 'Alleen schrijfhulp — geen juridisch advies of therapie.',
  },
  tabs: {
    aria: 'Kies tool',
    rewrite: {
      label: 'Bericht herschrijven',
      hint: 'Rustiger, duidelijker formuleren om te sturen of te zeggen',
    },
    log: {
      label: 'Logboeknotitie',
      hint: 'Neutrale feitelijke notities voor je administratie',
    },
  },
  intro: {
    rewrite:
      'Plak een bericht dat emotioneel, reactief of onduidelijk voelt. Krijg een rustigere, duidelijkere versie om te bewerken en te kopiëren.',
    log: 'Plak dezelfde notities (of een bericht dat je vastlegt). Krijg een neutrale, feitelijke lognotitie — geen kopie van beschuldigende formuleringen.',
  },
  input: {
    rewriteLabel: 'Jouw bericht',
    rewritePlaceholder:
      'Plak het bericht dat je wilt sturen, of een ruwe versie van wat je wilt zeggen…',
    logLabel: 'Wat er gebeurde',
    logPlaceholder:
      'Ruwe notities: wie, wat, wanneer, wat er gezegd werd…',
    sharedHint:
      'Deze tekst is gedeeld tussen beide tools — wissel van tab zonder iets te verliezen.',
  },
  log: {
    entryDate: 'Datum van de gebeurtenis',
  },
  rewrite: {
    modeLabel: 'Herschrijfmodus',
    minimal: 'Lichte polish',
    moderate: 'Duidelijk & rustig',
    firm: 'Duidelijke grens',
    modeHelp:
      'Lichte polish: alleen spelling en grammatica. Duidelijk & rustig: structurele de-escalatie. Duidelijke grens: hetzelfde, met grenzen duidelijk benoemd.',
  },
  actions: {
    generating: 'Bezig met genereren…',
    regenerate: 'Opnieuw genereren',
    rewriteMessage: 'Bericht herschrijven',
    buildLogEntry: 'Lognotitie maken',
    resetAll: 'Alles wissen',
    copy: 'Kopiëren',
    copied: 'Gekopieerd',
  },
  output: {
    rewriteLabel: 'Duidelijker bericht',
    rewritePlaceholder: 'Je duidelijkere bericht verschijnt hier na het genereren.',
    logLabel: 'Lognotitie',
    logPlaceholder: 'Je neutrale lognotitie verschijnt hier na het genereren.',
    logEmptyHint:
      'Lognotities herschrijven notities naar neutrale feiten — geen opsomming van beschuldigingen.',
    editHint:
      'Bewerk voor het kopiëren. Wissel van tool om deze invoer te behouden; elke tool heeft eigen output.',
  },
  privacy:
    'Privacy: geen account en geen opgeslagen geschiedenis. Wat je invoert wordt alleen gebruikt om je resultaat te genereren tijdens dit bezoek — niet opgeslagen, niet door ons bekeken en niet gebruikt om AI te trainen. Kopieer wat je wilt bewaren voordat je weggaat.',
  errors: {
    generic: 'Er ging iets mis.',
    network: 'Netwerkfout. Probeer het opnieuw.',
  },
};
