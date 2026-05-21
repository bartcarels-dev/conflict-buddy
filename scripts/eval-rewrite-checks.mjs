/**
 * Language-agnostic rewrite quality checks for the eval harness.
 * Topic-specific keywords belong in engine validation (lib/rewrite/*), not fixtures.
 */

function normalize(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const INSULT_IN_OUTPUT =
  /\b(ridiculous|ridicule|ridículo|lächerlich|belachelijk)\b/i;

const LEGAL_THREAT_OUTPUT =
  /\b(advocaat|lawyer|attorney|abogado|anwalt|avocat|advogado)\s*(bellen|call|contact|llamar|anrufen|appeler|ligar)/i;

const PUBLIC_SHAMING_OUTPUT =
  /\b(iedereen\s+hoort|everyone\s+will\s+hear|everyone\s+hears|todos\s+oigan|todos\s+van\s+a\s+saber|alle\s+werden|alle\s+hören|tout\s+le\s+monde\s+entende|todos\s+ouçam)\b/i;

const KNEW_PERFECTLY_OUTPUT =
  /\b(perfectamente\s+que|muito\s+bem\s+que|damn\s+well|très\s+bien\s+que|donders\s+goed|wusstest\s+du\s+genau|you\s+knew\s+(very\s+)?well)\b/i;

const HR_ESCALATION_OUTPUT =
  /\b(escalat.{0,12}\s+(to\s+)?hr|escalo\s+.{0,20}\s+rh|escalaré\s+.{0,20}\s+rrhh|eskaliere\s+.{0,20}\s+hr)\b/i;

const INPUT_HAD_HR_THREAT =
  /\b(\bhr\b|rrhh|human\s+resources|ressources\s+humaines|rh\b)/i;

const INPUT_HAD_INSULT =
  /\b(ridiculous|ridicule|ridículo|lächerlich|belachelijk)\b/i;

const INPUT_HAD_KNEW_PERFECTLY =
  /\b(perfectamente|muito\s+bem|damn\s+well|très\s+bien|donders\s+goed|wusstest|knew\s+damn|knew\s+very)\b/i;

export function isCalmFixture(fixture) {
  return fixture.category === 'calm' || String(fixture.id ?? '').includes('calm');
}

/** Checks that apply to every rewrite eval case (moderate + firm). */
export function genericRewriteChecks(input, output, level, fixture = {}) {
  const fails = [];
  const strict = level === 'moderate' || level === 'firm';
  if (!strict || !output.trim()) return fails;

  const inNorm = normalize(input);
  const outNorm = normalize(output);

  if (!isCalmFixture(fixture) && inNorm && outNorm === inNorm) {
    fails.push('structural: output identical to input');
  }

  if (INSULT_IN_OUTPUT.test(output)) {
    fails.push('structural: insult/sarcasm word in output');
  }

  if (LEGAL_THREAT_OUTPUT.test(output)) {
    fails.push('structural: legal-threat line in output');
  }

  if (PUBLIC_SHAMING_OUTPUT.test(output)) {
    fails.push('structural: public-shaming line in output');
  }

  if (INPUT_HAD_KNEW_PERFECTLY.test(input) && KNEW_PERFECTLY_OUTPUT.test(output)) {
    fails.push('structural: "you knew perfectly" motive line in output');
  }

  if (INPUT_HAD_HR_THREAT.test(input) && HR_ESCALATION_OUTPUT.test(output)) {
    fails.push('structural: HR escalation line in output');
  }

  return fails;
}
