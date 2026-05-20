'use client';

import { useMemo, useState } from 'react';
import type { Incident } from '@/lib/types';
import { buildChronologyHtml, buildChronologyText } from '@/lib/export';

const fieldClass =
  'w-full rounded-lg border-2 border-border bg-surface-muted px-4 py-3 text-sm text-foreground font-mono text-xs leading-relaxed';

const panelClass =
  'rounded-2xl border-2 border-border bg-surface p-6 shadow-[var(--shadow)]';

type Props = {
  incidents: Incident[];
  copied: string | null;
  onCopy: (text: string, label: string) => void;
};

export function ExportChronology({ incidents, copied, onCopy }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [format, setFormat] = useState<'text' | 'html'>('text');

  const selectable = incidents.filter((i) => !i.hidden);

  const selectedIncidents = useMemo(
    () => selectable.filter((i) => selected.has(i.id)),
    [selectable, selected]
  );

  const exportText = useMemo(() => {
    if (selectedIncidents.length === 0) return '';
    return format === 'text'
      ? buildChronologyText(selectedIncidents)
      : buildChronologyHtml(selectedIncidents);
  }, [selectedIncidents, format]);

  const toggleAll = () => {
    if (selected.size === selectable.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(selectable.map((i) => i.id)));
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  return (
    <section className={panelClass}>
      <h2 className="text-base font-semibold text-foreground mb-1">
        Export chronology
      </h2>
      <p className="text-xs text-muted mb-4">
        Plain-text or HTML chronology from saved incidents — factual log entries
        only. Base for future PDF export.
      </p>

      {selectable.length === 0 ? (
        <p className="text-sm text-muted-light italic">
          Save visible incidents to export a chronology.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap gap-3 mb-4 text-xs">
            <button
              type="button"
              onClick={toggleAll}
              className="font-medium text-primary hover:underline"
            >
              {selected.size === selectable.length
                ? 'Deselect all'
                : 'Select all visible'}
            </button>
            <label className="flex items-center gap-1 text-muted">
              <input
                type="radio"
                checked={format === 'text'}
                onChange={() => setFormat('text')}
              />
              Plain text
            </label>
            <label className="flex items-center gap-1 text-muted">
              <input
                type="radio"
                checked={format === 'html'}
                onChange={() => setFormat('html')}
              />
              HTML
            </label>
          </div>

          <ul className="space-y-2 mb-4 max-h-40 overflow-y-auto">
            {selectable.map((i) => (
              <li key={i.id}>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selected.has(i.id)}
                    onChange={() => toggleOne(i.id)}
                    className="rounded border-border"
                  />
                  <span className="text-muted">{i.eventDate}</span>
                  <span className="text-foreground truncate">{i.title}</span>
                </label>
              </li>
            ))}
          </ul>

          <div className="relative">
            <textarea
              readOnly
              className={`${fieldClass} min-h-[200px]`}
              value={exportText}
              placeholder="Select incidents to preview export…"
            />
            {exportText && (
              <button
                type="button"
                onClick={() => onCopy(exportText, 'export')}
                className="absolute top-2 right-2 rounded-md border-2 border-border bg-surface px-2 py-1 text-xs font-medium text-muted hover:border-primary"
              >
                {copied === 'export' ? 'Copied' : 'Copy'}
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
}
