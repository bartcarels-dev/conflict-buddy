'use client';

type Props = {
  canGenerate: boolean;
  loading: boolean;
  hasOutputs: boolean;
  isDirty: boolean;
  activeIncidentId: string | null;
  editingTitle?: string;
  onGenerate: () => void;
  onSave: () => void;
  onNewIncident: () => void;
};

export function StickyActionBar({
  canGenerate,
  loading,
  hasOutputs,
  isDirty,
  activeIncidentId,
  editingTitle,
  onGenerate,
  onSave,
  onNewIncident,
}: Props) {
  const showDirtyHint = isDirty && (hasOutputs || !!activeIncidentId);

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t-2 border-border bg-surface/95 backdrop-blur-md shadow-[0_-8px_32px_-8px_rgb(21_34_50_/_0.15)] dark:shadow-[0_-8px_32px_-8px_rgb(0_0_0_/_0.4)]"
      role="toolbar"
      aria-label="Primary actions"
    >
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1 text-xs text-muted leading-snug">
            {showDirtyHint ? (
              <span className="font-medium text-amber-800 dark:text-amber-200">
                Unsaved edits
                {activeIncidentId && editingTitle
                  ? ` · ${editingTitle}`
                  : ''}
              </span>
            ) : activeIncidentId && editingTitle ? (
              <span className="truncate block">
                Editing: <span className="text-foreground">{editingTitle}</span>
              </span>
            ) : (
              <span className="hidden sm:inline">
                Generate after describing the situation; save when you are done
                editing.
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-stretch gap-2 sm:shrink-0 sm:justify-end">
            {hasOutputs && (
              <>
                <button
                  type="button"
                  onClick={onNewIncident}
                  className="rounded-xl border-2 border-border bg-surface px-4 py-2.5 text-sm font-medium text-muted hover:border-primary hover:text-primary"
                >
                  New incident
                </button>
                <button
                  type="button"
                  onClick={onSave}
                  className={[
                    'rounded-xl border-2 px-4 py-2.5 text-sm font-semibold min-w-[8.5rem]',
                    showDirtyHint
                      ? 'border-amber-600 bg-amber-50 text-amber-950 hover:bg-amber-100 dark:border-amber-500 dark:bg-amber-950 dark:text-amber-100 dark:hover:bg-amber-900'
                      : 'border-primary bg-primary-subtle text-primary hover:bg-primary-muted',
                  ].join(' ')}
                >
                  {activeIncidentId ? 'Save changes' : 'Save incident'}
                </button>
              </>
            )}

            <button
              type="button"
              onClick={onGenerate}
              disabled={!canGenerate || loading}
              className={[
                'rounded-xl border-2 px-5 py-2.5 text-sm font-bold transition-all sm:min-w-[11rem]',
                canGenerate && !loading
                  ? 'border-primary-hover bg-primary text-white hover:brightness-110'
                  : 'border-border bg-surface-muted text-muted cursor-not-allowed',
                hasOutputs ? '' : 'flex-1 sm:flex-none',
              ].join(' ')}
            >
              {loading
                ? 'Generating…'
                : canGenerate
                  ? hasOutputs
                    ? 'Regenerate'
                    : 'Generate'
                  : 'Type to enable'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
