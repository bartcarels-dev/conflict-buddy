export type AnalysisOutputs = {
  deEscalatedResponse: string;
  boundaryResponse: string;
  courtSafeVersion: string;
  logEntry: string;
  riskNotes: string[];
  omittedOrSoftened: string[];
  suggestedTags: string[];
  keyFacts: string[];
};

export type SectionKey = keyof AnalysisOutputs;

export const LIST_SECTIONS: SectionKey[] = [
  'riskNotes',
  'omittedOrSoftened',
  'suggestedTags',
  'keyFacts',
];

export const TEXT_SECTIONS: SectionKey[] = [
  'deEscalatedResponse',
  'boundaryResponse',
  'courtSafeVersion',
  'logEntry',
];

export type LearnedPreference = {
  id: string;
  text: string;
  sectionKey?: SectionKey;
  createdAt: string;
};

export type IncidentStatus = 'draft' | 'saved';

export type Incident = {
  id: string;
  createdAt: string;
  eventDate: string;
  rawInput: string;
  optionalContext: string;
  outputs: AnalysisOutputs;
  tags: string[];
  hidden: boolean;
  notes: string;
  status: IncidentStatus;
  title: string;
};

export const emptyOutputs = (): AnalysisOutputs => ({
  deEscalatedResponse: '',
  boundaryResponse: '',
  courtSafeVersion: '',
  logEntry: '',
  riskNotes: [],
  omittedOrSoftened: [],
  suggestedTags: [],
  keyFacts: [],
});

/** Deep clone so saved incidents never share live editor state by reference. */
export function cloneOutputs(outputs: AnalysisOutputs): AnalysisOutputs {
  return JSON.parse(JSON.stringify(outputs)) as AnalysisOutputs;
}

export function deriveIncidentTitle(
  outputs: AnalysisOutputs,
  rawInput: string
): string {
  if (outputs.keyFacts[0]) {
    return outputs.keyFacts[0].slice(0, 72);
  }
  const logLine = outputs.logEntry
    .split('\n')
    .find((l) => l.trim().startsWith('•'));
  if (logLine) return logLine.replace(/^•\s*/, '').slice(0, 72);
  return rawInput.trim().slice(0, 72) || 'Untitled incident';
}
