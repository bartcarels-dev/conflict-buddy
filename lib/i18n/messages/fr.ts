import type { Messages } from '@/lib/i18n/types';

export const fr: Messages = {
  appName: 'Conflict Buddy',
  language: { label: 'Langue', aria: "Langue de l'interface" },
  header: {
    title: 'Une communication plus claire quand les émotions montent',
    subtitle:
      'Collez votre texte une fois, reformulez un message ou créez une note de journal neutre à partir des mêmes notes — modifiez, copiez, sans compte ni historique.',
    disclaimer: 'Aide à la rédaction uniquement — pas de conseil juridique ni thérapie.',
  },
  tabs: {
    aria: 'Choisir un outil',
    rewrite: {
      label: 'Reformuler le message',
      hint: 'Formulation plus calme et claire à envoyer ou dire',
    },
    log: {
      label: 'Note de journal',
      hint: 'Notes factuelles neutres pour vos dossiers',
    },
  },
  intro: {
    rewrite:
      'Collez un message émotionnel, réactif ou peu clair. Obtenez une version plus calme et claire à modifier et copier.',
    log: 'Les mêmes notes (ou un message à documenter). Obtenez une entrée de journal neutre et factuelle — pas une copie d’accusations.',
  },
  input: {
    rewriteLabel: 'Votre message',
    rewritePlaceholder:
      'Collez le message à envoyer ou un brouillon de ce que vous voulez dire…',
    logLabel: 'Ce qui s’est passé',
    logPlaceholder: 'Notes : qui, quoi, quand, ce qui a été dit…',
    sharedHint:
      'Ce texte est partagé entre les deux outils — changez d’onglet sans le perdre.',
  },
  log: { entryDate: 'Date de l’entrée' },
  rewrite: {
    modeLabel: 'Mode de reformulation',
    minimal: 'Légère retouche',
    moderate: 'Clair et calme',
    firm: 'Limite ferme',
    modeHelp:
      'Légère retouche : orthographe et grammaire. Clair et calme : désescalade structurelle. Limite ferme : avec limites clairement énoncées.',
  },
  actions: {
    generating: 'Génération…',
    regenerate: 'Régénérer',
    rewriteMessage: 'Reformuler le message',
    buildLogEntry: 'Créer la note',
    resetAll: 'Tout réinitialiser',
    copy: 'Copier',
    copied: 'Copié',
  },
  output: {
    rewriteLabel: 'Message plus clair',
    rewritePlaceholder: 'Votre message plus clair apparaîtra ici après génération.',
    logLabel: 'Note de journal',
    logPlaceholder: 'Votre note neutre apparaîtra ici après génération.',
    logEmptyHint:
      'Les notes reformulent en faits neutres — pas une liste d’accusations.',
    editHint:
      'Modifiez avant de copier. Chaque outil garde sa propre sortie avec la même entrée.',
  },
  privacy:
    'Confidentialité : pas de compte ni d’historique. Votre texte sert uniquement à générer le résultat pendant cette visite — non stocké, non relu par nous, non utilisé pour entraîner l’IA. Copiez ce que vous voulez garder.',
  errors: {
    generic: 'Une erreur s’est produite.',
    network: 'Erreur réseau. Veuillez réessayer.',
  },
};
