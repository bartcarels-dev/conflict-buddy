import type {
  RewriteContextProfile,
  RewriteContextProfileId,
} from '@/lib/rewrite/types';
import { agencyReturnProfile } from '@/lib/rewrite/profiles/agency-return';
import { calmNoticeProfile } from '@/lib/rewrite/profiles/calm-notice';
import { handoverProfile } from '@/lib/rewrite/profiles/handover';
import { schedulingProfile } from '@/lib/rewrite/profiles/scheduling';
import { threatDeescalationProfile } from '@/lib/rewrite/profiles/threat-deescalation';
import { workDeadlineProfile } from '@/lib/rewrite/profiles/work-deadline';

/** Ordered registry — append new profiles here. */
export const REWRITE_CONTEXT_PROFILES: RewriteContextProfile[] = [
  calmNoticeProfile,
  handoverProfile,
  schedulingProfile,
  agencyReturnProfile,
  workDeadlineProfile,
  threatDeescalationProfile,
].sort((a, b) => b.priority - a.priority);

export function getRewriteContextProfile(
  id: RewriteContextProfileId
): RewriteContextProfile | undefined {
  return REWRITE_CONTEXT_PROFILES.find((p) => p.id === id);
}

export {
  calmNoticeProfile,
  handoverProfile,
  schedulingProfile,
  agencyReturnProfile,
  workDeadlineProfile,
  threatDeescalationProfile,
};

export { isHandoverContext } from '@/lib/rewrite/profiles/handover';
export { isSchedulingPattern } from '@/lib/rewrite/profiles/scheduling';
export { hasKnewPerfectlyEscalation } from '@/lib/rewrite/profiles/work-deadline';
