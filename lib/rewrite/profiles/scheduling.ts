import type { RewriteContextProfile, ValidationIssue } from '@/lib/rewrite/types';
import {
  SCHEDULING_BANNED_PHRASES,
  SCHEDULING_LAST_MINUTE,
} from '@/lib/rewrite/patterns';

export function isSchedulingPattern(input: string): boolean {
  return SCHEDULING_LAST_MINUTE.test(input);
}

export const schedulingProfile: RewriteContextProfile = {
  id: 'scheduling',
  priority: 70,
  match: isSchedulingPattern,
  promptHints: () => [
    'SCHEDULING PATTERN: remove "as if normal", "only when I say", "when I speak up", "erst wenn ich etwas sage", "erst auf meine Planung" — reframe to impact + recurring pattern.',
  ],
  validate: ({ input, output }) => {
    const issues: ValidationIssue[] = [];
    for (const p of SCHEDULING_BANNED_PHRASES) {
      if (p.test(input) && p.test(output)) {
        issues.push({
          code: 'escalation_preserved',
          detail: `Scheduling: remove phrase still in output (${p.source})`,
        });
      }
    }
    return issues;
  },
};
