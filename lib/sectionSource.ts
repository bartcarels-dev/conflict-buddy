import { LIST_SECTIONS, type AnalysisOutputs, type SectionKey } from './types';
import { outputsDiffer } from './learnFromEdit';

export type SectionSource = 'generated' | 'edited';

export function getSectionSource(
  sectionKey: SectionKey,
  outputs: AnalysisOutputs,
  baseline: AnalysisOutputs | null
): SectionSource | null {
  if (!baseline) return null;

  const current = outputs[sectionKey];
  const base = baseline[sectionKey];

  if (LIST_SECTIONS.includes(sectionKey)) {
    const cur = current as string[];
    const b = base as string[];
    if (cur.length === 0) return null;
    return JSON.stringify(cur) === JSON.stringify(b) ? 'generated' : 'edited';
  }

  const curText = String(current ?? '');
  const baseText = String(base ?? '');
  if (!curText.trim()) return null;
  if (!baseText.trim()) return 'edited';
  return outputsDiffer(curText, baseText) ? 'edited' : 'generated';
}
