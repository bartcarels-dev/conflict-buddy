'use client';

import { useState } from 'react';
import {
  SectionSourceBadge,
  type SectionSource,
} from '@/app/components/SectionSourceBadge';
import { SectionSuggestion } from '@/app/components/SectionSuggestion';
import { TextComparePanel } from '@/app/components/TextComparePanel';
import type { SectionKey } from '@/lib/types';

const fieldClass =
  'w-full rounded-lg border-2 border-border bg-input-bg px-4 py-3 text-sm text-foreground shadow-sm placeholder:text-muted-light focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20';

export type SectionAiResult = {
  value: string;
  summary?: string;
};

type Props = {
  sectionKey: SectionKey;
  title: string;
  description?: string;
  value: string;
  placeholder: string;
  minHeight?: string;
  editable?: boolean;
  editableHint?: string;
  copied: string | null;
  onCopy: (text: string, label: string) => void;
  onChange: (value: string) => void;
  onSectionAi: (
    sectionKey: SectionKey,
    mode: 'review' | 'regenerate',
    feedback: string
  ) => Promise<SectionAiResult | null>;
  busy: boolean;
  source?: SectionSource | null;
  generatedBaseline?: string;
  onMarkGenerated?: (sectionKey: SectionKey, value: string) => void;
};

export function OutputField({
  sectionKey,
  title,
  description,
  value,
  placeholder,
  minHeight = 'min-h-[120px]',
  editable = true,
  editableHint,
  copied,
  onCopy,
  onChange,
  onSectionAi,
  busy,
  source,
  generatedBaseline,
  onMarkGenerated,
}: Props) {
  const [feedback, setFeedback] = useState('');
  const [suggestion, setSuggestion] = useState<SectionAiResult | null>(null);
  const [showGeneratedCompare, setShowGeneratedCompare] = useState(false);

  const runAi = async (mode: 'review' | 'regenerate') => {
    const result = await onSectionAi(sectionKey, mode, feedback);
    if (result) setSuggestion(result);
  };

  const handleChange = (next: string) => {
    setSuggestion(null);
    onChange(next);
  };

  return (
    <section className="rounded-xl border-2 border-border bg-surface-muted/50 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-primary">{title}</h3>
            <SectionSourceBadge source={source ?? null} />
          </div>
          {description && (
            <p className="text-xs text-muted mt-0.5">{description}</p>
          )}
          {editable && editableHint && (
            <p className="text-xs text-primary/90 mt-1">{editableHint}</p>
          )}
        </div>
        {value && (
          <button
            type="button"
            onClick={() => onCopy(value, sectionKey)}
            className="shrink-0 rounded-md border-2 border-border bg-surface px-2 py-1 text-xs font-medium text-muted hover:border-primary hover:text-primary"
          >
            {copied === sectionKey ? 'Copied' : 'Copy'}
          </button>
        )}
      </div>

      <p className="text-xs font-medium text-foreground">Your version</p>
      <textarea
        readOnly={!editable}
        className={`${fieldClass} ${minHeight} resize-y ${editable ? 'bg-surface' : 'bg-surface-muted'}`}
        value={value}
        placeholder={placeholder}
        onChange={(e) => handleChange(e.target.value)}
      />

      {editable && value.trim() && (
        <button
          type="button"
          disabled={busy}
          onClick={() => runAi('review')}
          className="rounded-lg border-2 border-primary bg-primary-subtle px-3 py-2 text-xs font-semibold text-primary hover:bg-primary-muted disabled:opacity-50"
        >
          {busy ? 'Reviewing…' : 'Review my edit'}
        </button>
      )}

      {suggestion && (
        <SectionSuggestion
          currentText={value}
          summary={suggestion.summary}
          suggestedText={suggestion.value}
          onKeepMine={() => setSuggestion(null)}
          onUseSuggestion={() => {
            onChange(suggestion.value);
            onMarkGenerated?.(sectionKey, suggestion.value);
            setSuggestion(null);
          }}
        />
      )}

      {source === 'edited' &&
        generatedBaseline?.trim() &&
        generatedBaseline !== value && (
          <details
            open={showGeneratedCompare}
            onToggle={(e) => setShowGeneratedCompare(e.currentTarget.open)}
          >
            <summary className="cursor-pointer text-xs font-medium text-primary hover:underline">
              Compare with last generated version
            </summary>
            <div className="mt-3">
              <TextComparePanel
                leftLabel="Last generated"
                rightLabel="Your version"
                leftText={generatedBaseline}
                rightText={value}
              />
            </div>
          </details>
        )}

      <details>
        <summary className="cursor-pointer text-xs font-medium text-muted hover:text-primary">
          Improve with directions
        </summary>
        <div className="mt-2 space-y-2">
          <input
            type="text"
            className={`${fieldClass} py-2`}
            placeholder="What should change? e.g. Shorter, firmer boundary, no greeting…"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          <button
            type="button"
            disabled={busy || !value}
            onClick={() => runAi('regenerate')}
            className="text-xs font-semibold text-primary hover:underline disabled:opacity-50 disabled:no-underline"
          >
            {busy ? 'Working…' : 'Regenerate with directions'}
          </button>
          <p className="text-xs text-muted-light">
            Shows a suggestion first — your text stays until you choose Use
            suggestion.
          </p>
        </div>
      </details>
    </section>
  );
}
