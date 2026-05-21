import type { Messages } from '@/lib/i18n/types';

export const es: Messages = {
  appName: 'Conflict Buddy',
  language: { label: 'Idioma', aria: 'Idioma de la interfaz' },
  header: {
    title: 'Comunicación más clara cuando las emociones suben',
    subtitle:
      'Pega tu texto una vez, reescribe un mensaje o crea una entrada de registro neutra con las mismas notas — edita, copia, sin cuenta ni historial.',
    disclaimer: 'Solo ayuda de redacción — no es asesoramiento legal ni terapia.',
  },
  tabs: {
    aria: 'Elegir herramienta',
    rewrite: {
      label: 'Reescribir mensaje',
      hint: 'Redacción más calmada y clara para enviar o decir',
    },
    log: {
      label: 'Entrada de registro',
      hint: 'Notas factuales neutras para tu archivo',
    },
  },
  intro: {
    rewrite:
      'Pega lo que dijeron, tu borrador o ambos — respuesta sugerida o versión más clara de tu mensaje.',
    log: 'Notas sobre lo ocurrido. Entrada neutra y factual — no una copia de acusaciones.',
  },
  rewriteEntry: {
    aria: 'Cómo empezar',
    reply: 'Responderles',
    replyHint: 'Te escribieron — sugerimos una respuesta',
    polish: 'Pulir mi borrador',
    polishHint: 'Ya escribiste algo — lo refinamos',
  },
  input: {
    theirMessageLabel: 'Lo que dijeron',
    theirMessagePlaceholder:
      'Pega su mensaje, correo o texto al que respondes…',
    theirMessageHint:
      'No se guarda después de salir.',
    userDraftLabel: 'Lo que quieres decir (opcional)',
    userDraftPlaceholderReply:
      'Borrador, puntos clave o vacío — sugerimos una respuesta…',
    userDraftPlaceholderPolish:
      'Pega el mensaje que quieres enviar o un borrador…',
    userDraftHintReply:
      'Opcional: tu enfoque, límites o un borrador parcial.',
    logLabel: 'Qué ocurrió',
    logPlaceholder: 'Notas: quién, qué, cuándo, qué se dijo…',
    logHint: 'Solo para el registro — separado del reescritor.',
  },
  log: { entryDate: 'Fecha de la entrada' },
  rewrite: {
    modeLabel: 'Modo de reescritura',
    minimal: 'Pulido ligero',
    moderate: 'Claro y calmado',
    firm: 'Límite firme',
    modeHelp:
      'Pulido ligero: solo gramática y ortografía. Claro y calmado: desescalada estructural. Límite firme: con límites claros.',
  },
  actions: {
    generating: 'Generando…',
    regenerate: 'Regenerar',
    rewriteMessage: 'Reescribir mensaje',
    suggestReply: 'Sugerir respuesta',
    buildLogEntry: 'Crear entrada',
    resetAll: 'Restablecer todo',
    copy: 'Copiar',
    copied: 'Copiado',
  },
  output: {
    rewriteLabel: 'Mensaje más claro',
    replyLabel: 'Respuesta sugerida',
    rewritePlaceholder: 'Tu mensaje más claro aparecerá aquí tras generar.',
    logLabel: 'Entrada de registro',
    logPlaceholder: 'Tu entrada neutra aparecerá aquí tras generar.',
    logEmptyHint:
      'Las entradas reformulan en hechos neutros — no una lista de acusaciones.',
    editHint:
      'Edita antes de copiar. Cada herramienta tiene su propia salida con la misma entrada.',
  },
  privacy:
    'Privacidad: sin cuenta ni historial. Tu texto solo se usa para generar el resultado en esta visita — no se guarda, no lo revisamos ni se usa para entrenar IA. Copia lo que quieras conservar.',
  errors: {
    generic: 'Algo salió mal.',
    network: 'Error de red. Inténtalo de nuevo.',
  },
};
