'use client';

import type { ReactNode } from 'react';
import { diffTextSideBySide, textsAreEqual, type DiffPart } from '@/lib/textDiff';

const panelClass =
  'rounded-lg border border-border bg-surface px-3 py-2 text-sm leading-relaxed min-h-[80px] max-h-[280px] overflow-y-auto';

function DiffSpans({ parts }: { parts: DiffPart[] }) {
  if (parts.length === 0) {
    return <span className="text-muted-light italic">(empty)</span>;
  }

  return (
    <>
      {parts.map((part, i) => {
        if (part.type === 'remove') {
          return (
            <span
              key={i}
              className="bg-red-100 text-red-950 line-through decoration-red-400/80 dark:bg-red-950/80 dark:text-red-100"
            >
              {part.text}
            </span>
          );
        }
        if (part.type === 'add') {
          return (
            <span
              key={i}
              className="bg-emerald-100 text-emerald-950 dark:bg-emerald-950/80 dark:text-emerald-100"
            >
              {part.text}
            </span>
          );
        }
        return <span key={i}>{part.text}</span>;
      })}
    </>
  );
}

type Props = {
  leftLabel: string;
  rightLabel: string;
  leftText: string;
  rightText: string;
  summary?: string;
  footer?: ReactNode;
};

export function TextComparePanel({
  leftLabel,
  rightLabel,
  leftText,
  rightText,
  summary,
  footer,
}: Props) {
  const equal = textsAreEqual(leftText, rightText);
  const { left, right } = diffTextSideBySide(leftText, rightText);

  const footerButtons = footer;

  return (
    <div className="space-y-3">
      {summary && (
        <p className="text-xs text-muted leading-relaxed">{summary}</p>
      )}
      {equal ? (
        <p className="text-xs text-muted italic">No text differences.</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-3 text-[10px] text-muted">
            <span className="inline-flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded bg-red-100 border border-red-200 dark:bg-red-950/80" />
              Removed
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded bg-emerald-100 border border-emerald-200 dark:bg-emerald-950/80" />
              Added
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-semibold text-foreground mb-1.5">
                {leftLabel}
              </p>
              <div className={panelClass}>
                <DiffSpans parts={left} />
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground mb-1.5">
                {rightLabel}
              </p>
              <div className={panelClass}>
                <DiffSpans parts={right} />
              </div>
            </div>
          </div>
        </>
      )}
      {footerButtons}
    </div>
  );
}
