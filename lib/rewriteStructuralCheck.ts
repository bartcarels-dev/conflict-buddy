/**
 * Language-agnostic checks for "reordered blame" (high overlap, still you-directed accusations).
 */

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** 2nd-person + complaint/lateness/absence within same clause (multi-language pronouns). */
const DIRECT_BLAME_CLAUSE =
  /\b(you|je|jij|u|du|vous|tu|ty)\b[^.!?\n]{0,55}\b(not|niet|no|never|nooit|late|laat|thuis|home|arriv|komt?|aan|absent|away|te laat|on time|op tijd)\b|\b(you|je|jij)\s+(are|is|bent|was|were|werd)\s+(not|niet|no|late|laat|thuis|away)\b/gi;

export function countDirectBlameClauses(text: string): number {
  const matches = text.match(DIRECT_BLAME_CLAUSE);
  return matches?.length ?? 0;
}

export function wordOverlapRatio(input: string, output: string): number {
  const inWords = normalize(input).split(' ').filter((w) => w.length > 2);
  const outWords = normalize(output).split(' ').filter((w) => w.length > 2);
  if (outWords.length === 0) return 0;
  const inSet = new Set(inWords);
  const shared = outWords.filter((w) => inSet.has(w)).length;
  return shared / outWords.length;
}

/**
 * True when rewrite mostly reorders the same you-blame message (not structural de-escalation).
 */
export function isMostlyReorderedBlame(input: string, output: string): boolean {
  if (input.length < 80) return false;

  const overlap = wordOverlapRatio(input, output);
  const blameIn = countDirectBlameClauses(input);
  const blameOut = countDirectBlameClauses(output);

  if (overlap < 0.78) return false;
  if (blameIn < 2) return false;

  // Still multiple direct you+problem clauses, not reduced enough
  const blameReduced = blameOut <= Math.floor(blameIn * 0.5);
  if (!blameReduced && blameOut >= 2) return true;

  return false;
}

/** Input already says agreements don't work; output only adds generic "better agreements" without reframing. */
export function hasRedundantAgreementAsk(input: string, output: string): boolean {
  const inNorm = normalize(input);
  const outNorm = normalize(output);
  const inputAlreadyBroken =
    /\b(afspraak|agreement|arrangement).{0,40}(niet|not|don't|werken niet|doesn't work|do not work)\b/i.test(
      inNorm
    ) || /\bzo werken.{0,30}niet\b/i.test(inNorm);
  const outputAddsGenericAsk =
    /\b(betere|better|meer duidelijkheid|clearer).{0,30}(afspraak|agreement|arrangement)\b/i.test(
      outNorm
    );
  return (
    inputAlreadyBroken &&
    outputAddsGenericAsk &&
    countDirectBlameClauses(output) >= countDirectBlameClauses(input) * 0.7
  );
}
