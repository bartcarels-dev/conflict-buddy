import type { RewriteAnalysis, TransformLevel } from '@/lib/types';
import type { RewriteLang } from '@/lib/rewriteLocale';

export type ValidationIssue = {
  code:
    | 'hedge_dropped'
    | 'agency_flipped'
    | 'closing_replaced'
    | 'unchanged'
    | 'escalation_preserved'
    | 'substantive_dropped'
    | 'too_corporate'
    | 'reordered_blame'
    | 'fact_dropped';
  detail: string;
};

/** Internal scenario ids — not exposed in the public UI. */
export type RewriteContextProfileId =
  | 'calm_notice'
  | 'handover'
  | 'scheduling'
  | 'agency_return'
  | 'work_deadline'
  | 'threat_deescalation';

export type ProfileValidationArgs = {
  input: string;
  output: string;
  analysis?: RewriteAnalysis | null;
  level: TransformLevel;
};

export type RewriteContextProfile = {
  id: RewriteContextProfileId;
  /** Higher = listed first in prompt hints (more specific guidance). */
  priority: number;
  match: (input: string) => boolean;
  promptHints?: (input: string) => string[];
  validate?: (args: ProfileValidationArgs) => ValidationIssue[];
  /** When true, identical output is acceptable (e.g. short informational notices). */
  skipUnchangedRetry?: boolean;
};

/** Resolved rewrite context for one request (built server-side from input text). */
export type RewriteEngineContext = {
  input: string;
  locale: RewriteLang;
  activeProfiles: RewriteContextProfile[];
  activeProfileIds: RewriteContextProfileId[];
  flags: {
    skipUnchangedRetry: boolean;
  };
};
