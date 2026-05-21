/**
 * Rewrite engine — context profiles, detection, and extension points.
 * UI stays generic; scenarios are inferred from input text server-side.
 */

export type {
  RewriteContextProfile,
  RewriteContextProfileId,
  RewriteEngineContext,
  ProfileValidationArgs,
} from '@/lib/rewrite/types';

export {
  buildRewriteContext,
  hasRewriteProfile,
  buildProfilePromptHints,
  type BuildRewriteContextOptions,
} from '@/lib/rewrite/context';
export type { ValidationIssue } from '@/lib/rewrite/types';
export { validateRewriteProfiles } from '@/lib/rewrite/profile-validation';
export {
  REWRITE_CONTEXT_PROFILES,
  getRewriteContextProfile,
  isHandoverContext,
  isSchedulingPattern,
  hasKnewPerfectlyEscalation,
} from '@/lib/rewrite/profiles';
