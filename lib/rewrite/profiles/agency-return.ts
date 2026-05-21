import type { RewriteContextProfile, ValidationIssue } from '@/lib/rewrite/types';
import { findAgencyGave } from '@/lib/rewrite/agency';

export const agencyReturnProfile: RewriteContextProfile = {
  id: 'agency_return',
  priority: 60,
  match: (input) => !!findAgencyGave(input),
  promptHints: (input) => {
    const agency = findAgencyGave(input);
    if (!agency) return [];
    return [
      `CRITICAL: Keep the input agency phrase (${agency.label}) in output — do not replace with passive "I received" only.`,
    ];
  },
  validate: ({ input, output }) => {
    const agency = findAgencyGave(input);
    if (!agency || agency.preserve.test(output)) return [];
    return [
      {
        code: 'agency_flipped',
        detail: `Keep "${agency.label}" from input — do not flip to passive "I received" only`,
      },
    ];
  },
};
