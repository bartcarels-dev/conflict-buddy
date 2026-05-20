import type { Messages } from '@/lib/i18n/types';

export const pt: Messages = {
  appName: 'Conflict Buddy',
  language: { label: 'Idioma', aria: 'Idioma da interface' },
  header: {
    title: 'Comunicação mais clara quando as emoções apertam',
    subtitle:
      'Cole o texto uma vez, reescreva uma mensagem ou crie uma entrada de registo neutra com as mesmas notas — edite, copie, sem conta nem histórico.',
    disclaimer: 'Apenas apoio à escrita — não é aconselhamento jurídico nem terapia.',
  },
  tabs: {
    aria: 'Escolher ferramenta',
    rewrite: {
      label: 'Reescrever mensagem',
      hint: 'Formulação mais calma e clara para enviar ou dizer',
    },
    log: {
      label: 'Entrada de registo',
      hint: 'Notas factuais neutras para o seu arquivo',
    },
  },
  intro: {
    rewrite:
      'Cole uma mensagem emotiva, reactiva ou pouco clara. Obtenha uma versão mais calma e clara para editar e copiar.',
    log: 'As mesmas notas (ou uma mensagem que documenta). Obtenha uma entrada neutra e factual — não uma cópia de acusações.',
  },
  input: {
    rewriteLabel: 'A sua mensagem',
    rewritePlaceholder:
      'Cole a mensagem que quer enviar ou um rascunho do que quer dizer…',
    logLabel: 'O que aconteceu',
    logPlaceholder: 'Notas: quem, o quê, quando, o que foi dito…',
    sharedHint:
      'Este texto é partilhado entre as duas ferramentas — mude de separador sem o perder.',
  },
  log: { entryDate: 'Data da entrada' },
  rewrite: {
    modeLabel: 'Modo de reescrita',
    minimal: 'Polimento leve',
    moderate: 'Claro e calmo',
    firm: 'Limite firme',
    modeHelp:
      'Polimento leve: só gramática e ortografia. Claro e calmo: desescalada estrutural. Limite firme: com limites claros.',
  },
  actions: {
    generating: 'A gerar…',
    regenerate: 'Regenerar',
    rewriteMessage: 'Reescrever mensagem',
    buildLogEntry: 'Criar entrada',
    resetAll: 'Repor tudo',
    copy: 'Copiar',
    copied: 'Copiado',
  },
  output: {
    rewriteLabel: 'Mensagem mais clara',
    rewritePlaceholder: 'A sua mensagem mais clara aparecerá aqui após gerar.',
    logLabel: 'Entrada de registo',
    logPlaceholder: 'A sua entrada neutra aparecerá aqui após gerar.',
    logEmptyHint:
      'As entradas reformulam em factos neutros — não uma lista de acusações.',
    editHint:
      'Edite antes de copiar. Cada ferramenta tem a sua saída com a mesma entrada.',
  },
  privacy:
    'Privacidade: sem conta nem histórico. O que introduz só serve para gerar o resultado nesta visita — não é guardado, não é revisto por nós nem usado para treinar IA. Copie o que quiser guardar.',
  errors: {
    generic: 'Algo correu mal.',
    network: 'Erro de rede. Tente novamente.',
  },
};
