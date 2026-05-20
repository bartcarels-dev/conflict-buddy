import type { AnalysisOutputs, SectionKey } from './types';
import { TEXT_SECTIONS } from './types';
import { addLearnedPreferences } from './preferences';
import type { LearnedPreference } from './types';

function normalize(s: string) {
  return s.replace(/\s+/g, ' ').trim();
}

export function outputsDiffer(a: string, b: string) {
  return normalize(a) !== normalize(b);
}

export async function learnFromUserEdits(
  before: AnalysisOutputs | null,
  after: AnalysisOutputs,
  enabled: boolean
): Promise<{ added: number; rejected: string[] }> {
  if (!enabled || !before) return { added: 0, rejected: [] };

  const pairs: { sectionKey: SectionKey; original: string; edited: string }[] =
    [];

  for (const key of TEXT_SECTIONS) {
    const original = before[key] as string;
    const edited = after[key] as string;
    if (!edited.trim() || !outputsDiffer(original, edited)) continue;
    if (edited.length < 40 && original.length < 40) continue;
    pairs.push({ sectionKey: key, original, edited });
  }

  if (pairs.length === 0) return { added: 0, rejected: [] };

  const res = await fetch('/api/learn-from-edit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pairs }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || 'Could not learn from edits');
  }

  const accepted: string[] = data.accepted ?? [];
  const rejected: string[] = data.rejected ?? [];

  const incoming: LearnedPreference[] = accepted.map((text: string) => ({
    id: crypto.randomUUID(),
    text,
    createdAt: new Date().toISOString(),
  }));

  addLearnedPreferences(incoming);
  return { added: incoming.length, rejected };
}
