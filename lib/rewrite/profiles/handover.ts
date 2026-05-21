import type { RewriteContextProfile, ValidationIssue } from '@/lib/rewrite/types';
import {
  HANDOVER_CONTEXT,
  HANDOVER_TIMING,
  REGULAR_ABSENCE_BLAME,
  YOU_SELF_TIME,
} from '@/lib/rewrite/patterns';

export function isHandoverContext(input: string): boolean {
  return HANDOVER_CONTEXT.test(input) && HANDOVER_TIMING.test(input);
}

export const handoverProfile: RewriteContextProfile = {
  id: 'handover',
  priority: 80,
  match: isHandoverContext,
  promptHints: () => [
    'HANDOVER: Do NOT open with direct "you are not home / you are late" accusations. Start with situation + impact on handover/planning. Keep names, times, and that agreements fail — without "you yourself around [time]" or repeated you+late chains.',
  ],
  validate: ({ input, output }) => {
    const issues: ValidationIssue[] = [];
    if (YOU_SELF_TIME.test(input) && YOU_SELF_TIME.test(output)) {
      issues.push({
        code: 'escalation_preserved',
        detail:
          'Drop "you yourself" before time — state facts/impact (e.g. "around 10") without second-person blame',
      });
    }
    if (isHandoverContext(input) && REGULAR_ABSENCE_BLAME.test(output)) {
      issues.push({
        code: 'escalation_preserved',
        detail:
          'Handover: reframe "you are regularly not home/late" to situation + impact on handover/planning',
      });
    }
    return issues;
  },
};
