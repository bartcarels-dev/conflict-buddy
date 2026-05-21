import type { RewriteContextProfile, ValidationIssue } from '@/lib/rewrite/types';
import {
  KNEW_PERFECTLY_ESCALATION,
  WORK_DEADLINE_INPUT,
  WORK_KNEW_INPUT,
} from '@/lib/rewrite/patterns';

export function hasKnewPerfectlyEscalation(input: string, output: string): boolean {
  return KNEW_PERFECTLY_ESCALATION.test(input) && KNEW_PERFECTLY_ESCALATION.test(output);
}

export const workDeadlineProfile: RewriteContextProfile = {
  id: 'work_deadline',
  priority: 50,
  match: (input) => WORK_DEADLINE_INPUT.test(input) && WORK_KNEW_INPUT.test(input),
  promptHints: () => [
    'WORK DEADLINE: Remove "you knew perfectly / sabías perfectamente / muito bem que / très bien que" and HR/legal escalation lines. Keep deadline/plazo + deliver-by-tomorrow ask + impact on you — no motive attack.',
  ],
  validate: ({ input, output }) => {
    if (!hasKnewPerfectlyEscalation(input, output)) return [] as ValidationIssue[];
    return [
      {
        code: 'escalation_preserved',
        detail:
          'Drop "you knew perfectly well / sabías perfectamente / muito bem que" — state deadline impact without motive attack',
      },
    ];
  },
};
