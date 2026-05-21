import type { RewriteContextProfile, ValidationIssue } from '@/lib/rewrite/types';
import {
  INSULT_IN_OUTPUT,
  LEGAL_THREAT_OUTPUT,
  PUBLIC_SHAMING_OUTPUT,
  THREAT_IGNORE_INPUT,
  THREAT_INSULT_INPUT,
  THREAT_TOPIC_OUTPUT,
} from '@/lib/rewrite/patterns';

function isThreatInput(input: string): boolean {
  return THREAT_INSULT_INPUT.test(input) || THREAT_IGNORE_INPUT.test(input);
}

export const threatDeescalationProfile: RewriteContextProfile = {
  id: 'threat_deescalation',
  priority: 40,
  match: isThreatInput,
  validate: ({ input, output, level }) => {
    const strict = level === 'moderate' || level === 'firm';
    if (!strict) return [];

    const issues: ValidationIssue[] = [];

    if (isThreatInput(input) && !THREAT_TOPIC_OUTPUT.test(output) && output.length > 80) {
      issues.push({
        code: 'substantive_dropped',
        detail:
          'Threat/de-escalation: keep the core issue (being ignored, agreements) — do not replace with vague "communication" only',
      });
    }

    if (INSULT_IN_OUTPUT.test(output)) {
      issues.push({
        code: 'escalation_preserved',
        detail: 'Remove insult/sarcasm words (ridiculous, ridicule, etc.) from output',
      });
    }

    if (LEGAL_THREAT_OUTPUT.test(output)) {
      issues.push({
        code: 'escalation_preserved',
        detail: 'Remove legal-threat lines from output',
      });
    }

    if (PUBLIC_SHAMING_OUTPUT.test(output)) {
      issues.push({
        code: 'escalation_preserved',
        detail: 'Remove public-shaming lines from output',
      });
    }

    return issues;
  },
};
