'use client';

import { TextComparePanel } from '@/app/components/TextComparePanel';

type Props = {
  summary?: string;
  currentText: string;
  suggestedText: string;
  onKeepMine: () => void;
  onUseSuggestion: () => void;
};

export function SectionSuggestion({
  summary,
  currentText,
  suggestedText,
  onKeepMine,
  onUseSuggestion,
}: Props) {
  return (
    <div className="rounded-xl border-2 border-primary/40 bg-primary-subtle/60 p-4 space-y-3">
      <p className="text-xs font-semibold text-primary">Compare versions</p>
      <TextComparePanel
        leftLabel="Your version"
        rightLabel="Suggested"
        leftText={currentText}
        rightText={suggestedText}
        summary={summary}
        footer={
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={onKeepMine}
              className="rounded-lg border-2 border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted hover:border-primary hover:text-primary"
            >
              Keep mine
            </button>
            <button
              type="button"
              onClick={onUseSuggestion}
              className="rounded-lg border-2 border-primary bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110"
            >
              Use suggestion
            </button>
          </div>
        }
      />
    </div>
  );
}
