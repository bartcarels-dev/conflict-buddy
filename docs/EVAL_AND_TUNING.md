# Eval & tuning policy

## What we do (safe)

- **Offline fixtures** in `lib/prompts/__fixtures__/` — synthetic messages, no user data.
- **`npm run eval:rewrite:suite`** — calls the local API, writes `rewrite-eval-report.json` (outputs only, for debugging).
- **`npm run eval:analyze`** — summarizes failures from the report; suggests what to fix in **prompts / validation** in the repo.
- **Human or agent review** — change `lib/prompts/*`, `lib/rewriteValidation.ts`, etc., then re-run eval.

This is the right place to “analyze input and output and improve the model” (really: improve **prompts + checks**, not fine-tune weights).

## What we avoid (careful)

| Approach | Risk |
|----------|------|
| **Auto-edit prompts from production traffic** | Privacy, consent, non-reproducible drift, one bad day breaks everyone |
| **Store user messages for tuning** | Conflicts with “no history” / privacy promise |
| **Online learning per user** | Hard to audit; unpredictable outputs |

Production path: **no saving of input/output** for tuning. Optional later: explicit opt-in feedback (“this rewrite was wrong”) without storing the full message.

## Commands

```bash
npm run dev
npm run eval:rewrite:suite          # NL + i18n
$env:EVAL_ONLY='nl'; npm run eval:rewrite:suite
$env:EVAL_ONLY='i18n'; npm run eval:rewrite:suite
npm run eval:analyze
npm run eval:log:suite
```

### Log entry suite

`lib/prompts/__fixtures__/log-eval-suite.json` — chat exports, blame notes, email threads.

Checks: `Datum:`/`Date:` header, `mustNotContain` blame/conflation, handover date sanity (31 May vs 1 June), optional `mustContainAny` for critical facts only.

Target: **≥95% pass** on `moderate` + `firm` across all fixture languages before calling quality “excellent”.

### What fixtures assert (scalable)

| Check | Where | Purpose |
|-------|--------|---------|
| **Generic structural** | `scripts/eval-rewrite-checks.mjs` | Unchanged output, insults, legal/HR threats, “you knew perfectly” — same rules for every topic |
| **mustNotContain** (optional) | Per fixture | Verbatim escalating phrase from *that* input must not survive in output |
| ~~shouldContain / shouldContainAny~~ | Removed | Topic keywords (stain, schmutz, …) do not scale |

Quality for hedges, agency, handover, etc. is enforced in **`lib/rewriteValidation.ts`** and **context profiles** (`lib/rewrite/profiles/*`), not in eval keyword lists.

```bash
# Gate on moderate+firm only (default target 95%)
$env:EVAL_TARGET_PCT=95; npm run eval:rewrite:suite
```

## Automatic tuning — be careful

| Approach | Verdict |
|----------|---------|
| Re-run eval → read report → **you or the agent edits prompts/validation in git** | Recommended |
| `npm run eval:analyze` summarizing failures | Safe (read-only) |
| Script that **auto-edits** prompts from production requests | Avoid (privacy, drift, no audit trail) |
| Fine-tuning OpenAI on user messages | Avoid unless explicit consent + legal review |

The app does **not** store user input for learning. Improvement happens only through **versioned fixture suites** and code changes you ship deliberately.
