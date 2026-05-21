import type { RewriteContextProfile } from '@/lib/rewrite/types';
import {
  CALM_EXCLUDE,
  CALM_MINUTES,
  HANDOVER_CONTEXT,
} from '@/lib/rewrite/patterns';

export const calmNoticeProfile: RewriteContextProfile = {
  id: 'calm_notice',
  priority: 100,
  skipUnchangedRetry: true,
  match: (input) =>
    input.length <= 220 &&
    CALM_MINUTES.test(input) &&
    HANDOVER_CONTEXT.test(input) &&
    !CALM_EXCLUDE.test(input),
  promptHints: () => [
    'ALREADY CALM: keep the same facts and time words (e.g. ten/zehn/dix/diez/dez minutes, tomorrow/demain). Light polish only — do not add conflict or blame framing.',
  ],
};
