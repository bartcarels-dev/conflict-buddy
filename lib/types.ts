export type ToolMode = 'rewrite' | 'log';

/** How the Message Rewriter transforms the draft. */
export type TransformLevel = 'minimal' | 'moderate' | 'firm';

/** Polish own draft vs compose a reply to their message. */
export type RewriteIntent = 'reply' | 'polish';

/** Structured analysis from de-escalation pass (moderate / firm). */
export type RewriteAnalysis = {
  substantive: string[];
  boundariesAndConditions: string[];
  emotionalIntensity: string[];
  escalatingFraming: string[];
};

export type StructuredRewriteResult = RewriteAnalysis & {
  output: string;
};
