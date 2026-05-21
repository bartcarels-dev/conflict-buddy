import type { RewriteAnalysis, TransformLevel } from '@/lib/types';
import type { ValidationIssue } from '@/lib/rewrite/types';
import { buildRewriteContext } from '@/lib/rewrite/context';

export function validateRewriteProfiles(
  input: string,
  output: string,
  analysis: RewriteAnalysis | null | undefined,
  level: TransformLevel
): ValidationIssue[] {
  const ctx = buildRewriteContext(input);
  const args = { input, output, analysis, level };
  const issues: ValidationIssue[] = [];

  for (const profile of ctx.activeProfiles) {
    if (!profile.validate) continue;
    issues.push(...profile.validate(args));
  }

  const seen = new Set<string>();
  return issues.filter((i) => {
    const key = `${i.code}:${i.detail}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
