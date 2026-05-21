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
      'Collez ce qu’ils ont dit, votre brouillon, ou les deux — réponse suggérée ou version plus claire de votre message.',
    log: 'Notes sur ce qui s’est passé. Entrée de journal neutre et factuelle — pas une copie d’accusations.',
  },
  rewriteEntry: {
    aria: 'Comment commencer',
    reply: 'Répondre',
    replyHint: 'Ils vous ont écrit — nous suggérons une réponse',
    polish: 'Polir mon brouillon',
    polishHint: 'Vous avez déjà écrit — nous l’affînons',
  },
  input: {
    theirMessageLabel: 'Ce qu’ils ont dit',
    theirMessagePlaceholder:
      'Collez leur message, e-mail ou texte auquel vous répondez…',
    theirMessageHint:
      'Non enregistré après votre visite.',
    userDraftLabel: 'Ce que vous voulez dire (optionnel)',
    userDraftPlaceholderReply:
      'Brouillon, points clés ou vide — nous suggérons une réponse…',
    userDraftPlaceholderPolish:
      'Collez le message à envoyer ou un brouillon…',
    userDraftHintReply:
      'Optionnel : votre angle, limites ou un brouillon partiel.',
    logLabel: 'Ce qui s’est passé',
    logPlaceholder: 'Notes : qui, quoi, quand, ce qui a été dit…',
    logHint: 'Uniquement pour la note de journal — séparé du reformulateur.',
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
    suggestReply: 'Suggérer une réponse',
    buildLogEntry: 'Créer la note',
    resetAll: 'Tout réinitialiser',
    copy: 'Copier',
    copied: 'Copié',
  },
  output: {
    rewriteLabel: 'Message plus clair',
    replyLabel: 'Réponse suggérée',
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
