import { detectRewriteLocale } from '@/lib/rewriteLocale';
import { REWRITE_CONTEXT_PROFILES } from '@/lib/rewrite/profiles';
import type {
  RewriteContextProfileId,
  RewriteEngineContext,
} from '@/lib/rewrite/types';

export type BuildRewriteContextOptions = {
  /** Future: optional explicit profile(s) from API — merged with detected profiles. */
  forceProfileIds?: RewriteContextProfileId[];
};

export function buildRewriteContext(
  input: string,
  _options?: BuildRewriteContextOptions
): RewriteEngineContext {
  const locale = detectRewriteLocale(input);
  const activeProfiles = REWRITE_CONTEXT_PROFILES.filter((p) => p.match(input));
  // When forceProfileIds is used later: merge getRewriteContextProfile(id) into activeProfiles.

  return {
    input,
    locale,
    activeProfiles,
    activeProfileIds: activeProfiles.map((p) => p.id),
    flags: {
      skipUnchangedRetry: activeProfiles.some((p) => p.skipUnchangedRetry),
    },
  };
}

export function hasRewriteProfile(
  input: string,
  id: RewriteContextProfileId
): boolean {
  return REWRITE_CONTEXT_PROFILES.some((p) => p.id === id && p.match(input));
}

export function buildProfilePromptHints(input: string): string {
  const ctx = buildRewriteContext(input);
  const hints = ctx.activeProfiles.flatMap((p) => p.promptHints?.(input) ?? []);
  return hints.length ? `\n${hints.join('\n')}` : '';
}
