# Rewrite engine — context profiles

The public UI stays generic (message + transform level). The server infers **context profiles** from input text and applies matching prompt hints and validation.

## Layout

| Path | Role |
|------|------|
| `types.ts` | `RewriteContextProfile`, `RewriteEngineContext`, `ValidationIssue` |
| `patterns.ts` | Shared regex for profiles (add patterns here first) |
| `agency.ts` | Cross-language “you gave” agency preservation |
| `context.ts` | `buildRewriteContext()`, `buildProfilePromptHints()` |
| `profile-validation.ts` | Runs `validate` on active profiles |
| `profiles/*.ts` | One file per scenario |
| `profiles/index.ts` | Registry — register new profiles here |

## Add a new profile

1. Add match patterns to `patterns.ts` if needed.
2. Create `profiles/my-scenario.ts`:

```ts
import type { RewriteContextProfile } from '@/lib/rewrite/types';

export const myScenarioProfile: RewriteContextProfile = {
  id: 'my_scenario', // extend RewriteContextProfileId in types.ts
  priority: 65,
  match: (input) => /…/.test(input),
  promptHints: () => ['…'],
  validate: ({ input, output, level }) => [/* ValidationIssue[] */],
};
```

3. Register in `profiles/index.ts` → `REWRITE_CONTEXT_PROFILES`.
4. Add eval cases in `lib/prompts/__fixtures__/` (input + optional `mustNotContain` only — no topic keywords).

No UI or API changes required unless you later expose profile selection (optional `contextProfile` field can be added to the request body and merged in `buildRewriteContext`).

## Cross-cutting (not profiles)

- Language: `lib/rewriteLocale.ts`
- Hedges, times, corporate phrases: `rewriteLocale`, `rewriteEscalationPatterns`, `rewriteStructuralCheck`
- De-escalation framework + examples: `lib/prompts/messageRewriterStructured.ts`
