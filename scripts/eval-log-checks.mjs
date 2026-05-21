/**
 * Generic log-entry checks (language-agnostic where possible).
 */

export function genericLogChecks(input, output, fixture) {
  const fails = [];
  const out = output.toLowerCase();
  const inp = input.toLowerCase();

  if (!output.trim()) {
    fails.push('structural: empty output');
    return fails;
  }

  if (!/^(datum|date)\s*:/im.test(output.trim())) {
    fails.push('structural: missing Datum:/Date: header line');
  }

  for (const p of fixture.mustNotContain ?? []) {
    if (out.includes(p.toLowerCase())) fails.push(`contains banned: "${p}"`);
  }

  const any = fixture.mustContainAny ?? [];
  if (any.length && !any.some((p) => out.includes(p.toLowerCase()))) {
    fails.push(`missing any of: ${any.map((p) => `"${p}"`).join(', ')}`);
  }

  const inputHasJune1 =
    /\b(1\s+juni|maandagochtend|monday\s+morning)\b/i.test(inp);
  const inputHasMay31 = /\b31\s+mei\b/i.test(inp);
  const outJune = /\b(1\s+juni|maandagochtend)\b/i.test(out);
  const outBring31Only =
    /\b(brengt|brengen|zal\s+brengen).{0,45}\b31\s+mei\b/i.test(out) && !outJune;

  if (inputHasMay31 && inputHasJune1 && outBring31Only) {
    fails.push(
      'structural: conflated 31 May bring with separate 1 June handover from input'
    );
  }

  if (/\b(je bent|jij bent|gooit mijn|you are regularly)\b/i.test(out)) {
    fails.push('structural: blame phrasing copied into log');
  }

  return fails;
}
