'use client';

import { useMemo, useState } from 'react';
import { buildFullAnalysisExport, type FullAnalysisInput } from '@/lib/export';
import { deriveIncidentTitle } from '@/lib/types';

const fieldClass =
  'w-full rounded-lg border-2 border-border bg-surface-muted px-4 py-3 text-sm text-foreground font-mono text-xs leading-relaxed';

const panelClass =
  'rounded-2xl border-2 border-border bg-surface p-6 shadow-[var(--shadow)]';

type Props = FullAnalysisInput & {
  copied: string | null;
  onCopy: (text: string, label: string) => void;
};

function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportFullAnalysis({
  eventDate,
  rawInput,
  optionalContext,
  privateNotes,
  outputs,
  copied,
  onCopy,
}: Props) {
  const [open, setOpen] = useState(true);

  const exportText = useMemo(
    () =>
      buildFullAnalysisExport({
        eventDate,
        rawInput,
        optionalContext,
        privateNotes,
        outputs,
        title: deriveIncidentTitle(outputs, rawInput),
      }),
    [eventDate, rawInput, optionalContext, privateNotes, outputs]
  );

  const filename = `conflict-buddy-${eventDate || 'analysis'}.txt`;

  return (
    <section className={panelClass}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left flex items-center justify-between gap-2"
      >
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Export full analysis (this incident)
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Input plus all generated sections — copy or download to share for
            review (e.g. paste into a chat). Updates when you edit above.
          </p>
        </div>
        <span className="text-xs text-primary font-medium shrink-0">
          {open ? 'Hide' : 'Show'}
        </span>
      </button>

      {open && (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onCopy(exportText, 'full-analysis')}
              className="rounded-md border-2 border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted hover:border-primary hover:text-primary"
            >
              {copied === 'full-analysis' ? 'Copied' : 'Copy all'}
            </button>
            <button
              type="button"
              onClick={() => downloadText(filename, exportText)}
              className="rounded-md border-2 border-primary bg-primary-subtle px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary-muted"
            >
              Download .txt
            </button>
          </div>
          <textarea
            readOnly
            className={`${fieldClass} min-h-[280px]`}
            value={exportText}
          />
        </div>
      )}
    </section>
  );
}
