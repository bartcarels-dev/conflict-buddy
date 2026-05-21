/**
 * Shared intent patterns for context profiles, validation, and locale helpers.
 * Add new scenario regex here; wire behavior in lib/rewrite/profiles/*.
 */

export const HANDOVER_CONTEXT =
  /\b(overdracht|handover|custody\s+exchange|übergabe|uebergabe|remise|entrega|passagem|garde|übergeben)\b/i;

export const HANDOVER_TIMING =
  /\b(te\s+laat|niet\s+thuis|not\s+home|too\s+late|not\s+on\s+time|zu\s+spät|nicht\s+da|nicht\s+zu\s+hause|en\s+retard|pas\s+à\s+la\s+maison|tarde|no\s+estás|nicht\s+anwesend|\d{1,2}\s*(uur|Uhr|h|heures?|horas?))\b/i;

export const REGULAR_ABSENCE_BLAME =
  /\b(je|you|du|tu|estás|usted|você|voce)\s+.{0,25}(regelmatig|regularly|regelmäßig|régulièrement|regularmente)\s+.{0,25}(niet\s+thuis|not\s+home|nicht\s+(da|zu\s+hause)|absent|en\s+retard|fora\s+de\s+casa|tarde|late)\b/i;

export const YOU_SELF_TIME =
  /\b(je\s+zelf|you\s+yourself|du\s+selbst|tu\s+mismo|você\s+mesmo|toi-même)\s+.{0,15}(rond|around|um|vers|sobre|às?)\s+\d/i;

export const SCHEDULING_LAST_MINUTE =
  /\b(last minute|letzter minute|dernier moment|último momento|última hora|laatste moment)\b/i;

export const SCHEDULING_BANNED_PHRASES = [
  /\bwenn\s+ich\s+etwas\s+sage\b/i,
  /\berst\s+auf\s+meine\s+planung\b/i,
  /\bonly\s+counts\s+once\s+i\s+say\b/i,
  /\bque\s+quand\s+je\s+dis\b/i,
  /\bcuando\s+digo\s+algo\b/i,
  /\bquando\s+digo\s+algo\b/i,
] as const;

export const KNEW_PERFECTLY_ESCALATION =
  /\b(perfectamente\s+que|muito\s+bem\s+que|perfectly\s+well|you\s+knew\s+(very\s+)?well|wusstest\s+du\s+genau|sabías\s+perfectamente|sabias\s+muito\s+bem|très\s+bien\s+que|donders\s+goed)\b/i;

export const WORK_DEADLINE_INPUT =
  /\b(deadline|plazo|prazo|frist|échéance)\b/i;

export const WORK_KNEW_INPUT =
  /\b(perfectamente|muito\s+bem|damn\s+well|très\s+bien|donders\s+goed|wusstest|knew)\b/i;

export const THREAT_INSULT_INPUT =
  /\b(ridiculous|ridicule|ridículo|lächerlich|belachelijk)\b/i;

export const THREAT_IGNORE_INPUT = /\b(ignor|negeer|ignore)\w*/i;

export const THREAT_TOPIC_OUTPUT =
  /\b(ignor|frustr|acordo|acuerdo|agreement|contact|percebo|entendo|compreendo|ouvido|comunica|arrangement|acord|écoute|escuch)\w*/i;

export const INSULT_IN_OUTPUT =
  /\b(ridiculous|ridicule|ridículo|lächerlich|belachelijk)\b/i;

export const LEGAL_THREAT_OUTPUT =
  /\b(advocaat|lawyer|attorney|abogado|anwalt|avocat|advogado)\s*(bellen|call|contact|llamar|anrufen|appeler|ligar)/i;

export const PUBLIC_SHAMING_OUTPUT =
  /\b(iedereen\s+hoort|everyone\s+will\s+hear|todos\s+van\s+a\s+saber|alle\s+werden|tout\s+le\s+monde\s+saura)\b/i;

export const CALM_EXCLUDE =
  /\b(advocaat|lawyer|belachelijk|ridiculous|ignor|negeer)\b/i;

export const CALM_MINUTES =
  /\b(\d{1,2}|ten|zehn|dix|diez|dez)\s+min/i;
