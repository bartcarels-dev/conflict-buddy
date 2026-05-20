'use client';

import type { Incident } from '@/lib/types';

const panelClass =
  'rounded-2xl border-2 border-border bg-surface p-6 shadow-[var(--shadow)]';

type Props = {
  incidents: Incident[];
  activeIncidentId: string | null;
  showHidden: boolean;
  onToggleShowHidden: () => void;
  onOpen: (id: string) => void;
  onHide: (id: string) => void;
  onDelete: (id: string) => void;
  onCopyLog: (log: string, id: string) => void;
  copied: string | null;
};

export function IncidentTimeline({
  incidents,
  activeIncidentId,
  showHidden,
  onToggleShowHidden,
  onOpen,
  onHide,
  onDelete,
  onCopyLog,
  copied,
}: Props) {
  const visible = incidents.filter((i) => showHidden || !i.hidden);
  const sorted = [...visible].sort(
    (a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
  );

  return (
    <section className={panelClass}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <h2 className="text-base font-semibold text-foreground">
          Saved incidents
        </h2>
        <label className="flex items-center gap-2 text-xs text-muted cursor-pointer">
          <input
            type="checkbox"
            checked={showHidden}
            onChange={onToggleShowHidden}
            className="rounded border-border"
          />
          Show hidden incidents
        </label>
      </div>
      <p className="text-xs text-muted mb-4">
        Click an incident to open it above and edit input or outputs.
      </p>

      {sorted.length === 0 ? (
        <p className="text-sm text-muted-light italic py-4 text-center border-2 border-dashed border-border rounded-xl">
          No saved incidents yet. Generate an analysis and click Save incident.
        </p>
      ) : (
        <ul className="space-y-4">
          {sorted.map((incident) => {
            const isActive = activeIncidentId === incident.id;
            const preview =
              incident.outputs.logEntry.split('\n').slice(0, 3).join('\n') ||
              incident.rawInput.slice(0, 120);

            return (
              <li
                key={incident.id}
                className={`rounded-xl border-2 overflow-hidden transition-colors ${
                  isActive
                    ? 'border-primary bg-primary-subtle ring-2 ring-primary/25'
                    : incident.hidden
                      ? 'border-border bg-surface-muted opacity-75'
                      : 'border-border bg-surface-muted hover:border-primary/50'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onOpen(incident.id)}
                  className="w-full text-left p-4 space-y-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
                  aria-label={`Open incident: ${incident.title}`}
                  aria-current={isActive ? 'true' : undefined}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-muted">{incident.eventDate}</p>
                      <h3 className="text-sm font-semibold text-foreground">
                        {incident.title}
                      </h3>
                      {incident.tags.length > 0 && (
                        <p className="text-xs text-primary mt-1">
                          {incident.tags.join(' · ')}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 shrink-0">
                      {isActive && (
                        <span className="text-xs px-2 py-0.5 rounded border border-primary bg-surface text-primary font-medium">
                          Open
                        </span>
                      )}
                      {incident.hidden && (
                        <span className="text-xs px-2 py-0.5 rounded border border-border text-muted">
                          Hidden
                        </span>
                      )}
                    </div>
                  </div>

                  <pre className="text-xs text-muted whitespace-pre-wrap font-sans bg-surface rounded-lg p-3 border border-border max-h-24 overflow-hidden pointer-events-none">
                    {preview}
                    {incident.outputs.logEntry.length > preview.length ? '…' : ''}
                  </pre>
                </button>

                <div
                  className="flex flex-wrap gap-2 px-4 pb-4 pt-0 border-t border-border/60"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => onOpen(incident.id)}
                    className="text-xs font-medium px-2 py-1 rounded-md border-2 border-border bg-surface hover:border-primary"
                  >
                    Open
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onCopyLog(incident.outputs.logEntry, incident.id)
                    }
                    className="text-xs font-medium px-2 py-1 rounded-md border-2 border-border bg-surface hover:border-primary"
                  >
                    {copied === incident.id ? 'Copied' : 'Copy log'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onHide(incident.id)}
                    className="text-xs font-medium px-2 py-1 rounded-md border-2 border-border bg-surface hover:border-primary"
                  >
                    {incident.hidden ? 'Unhide' : 'Hide'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(incident.id)}
                    className="text-xs font-medium px-2 py-1 rounded-md border-2 border-red-200 text-red-800 bg-red-50 dark:bg-red-950 dark:text-red-200 dark:border-red-800"
                  >
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
