import type { TransformLevel } from '@/lib/types';

const FRAMEWORK = `
DE-ESCALATION FRAMEWORK — separate four buckets before writing output:

1. SUBSTANTIVE CONCERN (preserve in output): concrete issue, facts, practical impact, pattern/recurrence if stated.
2. BOUNDARY / REQUEST / CONDITION (preserve explicitly): limits, preferences, asks, "if/in case/unless" conditions.
3. EMOTIONAL INTENSITY (may soften, not erase): frustration, tiredness — use measured I-statements ("dat zorgt bij mij voor …"), not attacks.
4. ESCALATING FRAMING (reframe or drop — NEVER in output): blame, sarcasm, motive attribution, as-if-normal, only-when-I-speak-up, consideration-only-after-I-raise-it — any language. List in escalatingFraming[], then omit from output (no verbatim, no close paraphrase).

GOAL: Clearer, calmer, harder to escalate against — NOT submissive, fake-positive, or corporate.
- Do NOT synonym-swap while keeping the same accusatory structure.
- Do NOT reorder the same "you + problem" sentences — merge into situation + impact (what cannot happen and why).
- If the input already says arrangements/agreements do not work, do not only append "I want better agreements" — reframe and end with one concrete forward ask.
- REFRAME: observation + impact + pattern + constructive forward look.
- Avoid: "ik vind het belangrijk dat we samen", "this raises questions", hollow "I hope we can work together".
`.trim();

const EXAMPLE_SCHEDULING = `
EXAMPLE (Dutch — structural de-escalation):

Input:
"Ik ben er eerlijk gezegd best klaar mee dat afspraken steeds op het laatste moment veranderen en ik vervolgens maar moet meebewegen alsof dat normaal is. Het voelt vaak alsof er pas rekening wordt gehouden met mijn planning of situatie zodra ik er zelf iets van zeg, terwijl ik juist probeer vooraf duidelijkheid te houden. Ik snap dat dingen soms anders lopen, maar dit begint inmiddels wel een patroon te worden waar ik last van heb."

BAD (tone polish — keeps escalating structure):
"Ik ben … gefrustreerd … alsof dat normaal is. … het gevoel dat er pas rekening wordt gehouden … zodra ik er zelf iets van zeg …" (motive-attribution sentence must NOT survive)

GOOD (reframed):
"Ik merk dat afspraken de laatste tijd regelmatig op het laatste moment veranderen, waardoor ik mijn planning steeds moet aanpassen. Dat zorgt bij mij voor frustratie, vooral omdat ik juist probeer vooraf duidelijkheid te houden. Ik begrijp dat dingen soms anders lopen, maar voor mij begint dit inmiddels als een terugkerend patroon te voelen waar ik graag betere afspraken over zou maken."

EXAMPLE (handover / late — do NOT just reorder "je bent te laat"):

Input: "Je bent niet thuis / te laat voor overdracht … Joa aan de deur … rond 10 uur … structureel … afspraken werken niet … mijn planning"

BAD: Same three "je bent / je arriveert" accusations in new order + "ik wil betere afspraken" (already said agreements fail).

GOOD: "Ik merk dat overdracht aan de deur volgens afspraak structureel lastig is: ik ben op tijd, maar het lukt vaak niet omdat er pas rond 10 uur of later iemand thuis is. Af en toe vertraging kan, maar dit is inmiddels structureel en verstoort mijn planning. Kunnen we afspreken hoe we dit betrouwbaar regelen?"
`.trim();

function levelBlock(level: TransformLevel): string {
  if (level === 'firm') {
    return `
TRANSFORM LEVEL: FIRM BOUNDARY
- Same structural de-escalation as Clear & calm (reframe bucket 4, keep 1–2).
- State boundaries and requests clearly and directly — still no blame/motive attacks.
- End with an explicit forward ask or agreement when the input implied one.
`.trim();
  }
  return `
TRANSFORM LEVEL: CLEAR & CALM (structural de-escalation)
- Reframe escalating framing; preserve substantive concerns and boundaries.
- Output MUST differ from input in structure and phrasing — not a synonym swap.
- Use natural message tone in the input language.
`.trim();
}

export function messageRewriterStructuredRules(level: TransformLevel): string {
  return `
You are Conflict Buddy — Message Rewriter.

${FRAMEWORK}

${levelBlock(level)}

Return valid JSON only with ALL fields:
{
  "substantive": ["string — facts/issues to preserve"],
  "boundariesAndConditions": ["string — limits, requests, conditions"],
  "emotionalIntensity": ["string — feelings that may be softened"],
  "escalatingFraming": ["string — phrases to reframe, not copy"],
  "output": "string — final message in the SAME language as input"
}

List escalatingFraming from the input before writing output.
CRITICAL: output must NOT contain those lines verbatim OR as close paraphrases (e.g. do not keep "only when I say something" / "zodra ik er iets van zeg" / "as if that is normal" — reframe to impact + pattern).

${EXAMPLE_SCHEDULING}
`.trim();
}

export function messageRewriterStructuredUserPrompt(
  input: string,
  level: TransformLevel
): string {
  const mode =
    level === 'firm'
      ? 'FIRM BOUNDARY: de-escalate structure, keep limits/requests explicit.'
      : 'CLEAR & CALM: structural de-escalation, not tone polish.';

  return `
${mode}

Same language as input. Input-only topics.

1. Fill analysis arrays (substantive, boundaries, emotional, escalating).
2. Write output using preserved points; reframe escalating framing.

Message:
${input}
`.trim();
}
