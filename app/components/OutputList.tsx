'use client';

import { useState } from 'react';
import {
  SectionSourceBadge,
  type SectionSource,
} from '@/app/components/SectionSourceBadge';
import { SectionSuggestion } from '@/app/components/SectionSuggestion';
import type { SectionAiResult } from '@/app/components/OutputField';
import type { SectionKey } from '@/lib/types';

const fieldClass =
  'w-full rounded-lg border-2 border-border bg-input-bg px-4 py-3 text-sm text-foreground shadow-sm placeholder:text-muted-light focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20';

type Props = {
  sectionKey: SectionKey;
  title: string;
  description?: string;
  items: string[];
  placeholder: string;
  editable?: boolean;
  editableHint?: string;
  copied: string | null;
  onCopy: (text: string, label: string) => void;
  onChange?: (items: string[]) => void;
  onSectionAi: (
    sectionKey: SectionKey,
    mode: 'review' | 'regenerate',
    feedback: string
  ) => Promise<SectionAiResult | null>;
  busy: boolean;
  source?: SectionSource | null;
  onMarkGenerated?: (sectionKey: SectionKey, items: string[]) => void;
};

function itemsToText(items: string[]) {
  return items.join('\n');
}

function textToItems(raw: string) {
  return raw
    .split('\n')
    .map((l) => l.replace(/^•\s*/, '').trim())
    .filter(Boolean);
}

export function OutputList({
  sectionKey,
  title,
  description,
  items,
  placeholder,
  editable = false,
  editableHint,
  copied,
  onCopy,
  onChange,
  onSectionAi,
  busy,
  source,
  onMarkGenerated,
}: Props) {
  const [feedback, setFeedback] = useState('');
  const [suggestion, setSuggestion] = useState<SectionAiResult | null>(null);

  const text = items.join('\n');
  const linesText = items.join('\n');

  const runAi = async (mode: 'review' | 'regenerate') => {
    const result = await onSectionAi(sectionKey, mode, feedback);
    if (result) setSuggestion(result);
  };

  const handleLinesChange = (raw: string) => {
    if (!onChange) return;
    setSuggestion(null);
    onChange(textToItems(raw));
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
        {items.length > 0 && (
          <button
            type="button"
            onClick={() => onCopy(text, sectionKey)}
            className="shrink-0 rounded-md border-2 border-border bg-surface px-2 py-1 text-xs font-medium text-muted hover:border-primary hover:text-primary"
          >
            {copied === sectionKey ? 'Copied' : 'Copy'}
          </button>
        )}
      </div>

      {editable && onChange ? (
        <>
          <p className="text-xs font-medium text-foreground">Your version</p>
          <textarea
            className={`${fieldClass} min-h-[100px] resize-y bg-surface`}
            value={linesText}
            placeholder="One item per line…"
            onChange={(e) => handleLinesChange(e.target.value)}
          />
          {items.length > 0 && (
            <button
              type="button"
              disabled={busy}
              onClick={() => runAi('review')}
              className="rounded-lg border-2 border-primary bg-primary-subtle px-3 py-2 text-xs font-semibold text-primary hover:bg-primary-muted disabled:opacity-50"
            >
              {busy ? 'Reviewing…' : 'Review my edit'}
            </button>
          )}
        </>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-light italic">{placeholder}</p>
      ) : (
        <ul className="text-sm text-muted list-disc pl-5 space-y-1">
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )}

      {suggestion && onChange && (
        <SectionSuggestion
          currentText={linesText}
          summary={suggestion.summary}
          suggestedText={suggestion.value}
          onKeepMine={() => setSuggestion(null)}
          onUseSuggestion={() => {
            const next = textToItems(suggestion.value);
            onChange(next);
            onMarkGenerated?.(sectionKey, next);
            setSuggestion(null);
          }}
        />
      )}

      <details>
        <summary className="cursor-pointer text-xs font-medium text-muted hover:text-primary">
          Improve with directions
        </summary>
        <div className="mt-2 space-y-2">
          <input
            type="text"
            className={`${fieldClass} py-2`}
            placeholder="What should change?"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          <button
            type="button"
            disabled={busy || items.length === 0}
            onClick={() => runAi('regenerate')}
            className="text-xs font-semibold text-primary hover:underline disabled:opacity-50"
          >
            {busy ? 'Working…' : 'Regenerate with directions'}
          </button>
        </div>
      </details>
    </section>
  );
}
