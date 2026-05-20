'use client';

import { useI18n } from '@/app/components/I18nProvider';
import type { ToolMode, TransformLevel } from '@/lib/types';

const fieldClass =
  'w-full rounded-lg border-2 border-border bg-input-bg px-4 py-3 text-sm text-foreground shadow-sm placeholder:text-muted-light focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20';

const panelClass =
  'rounded-2xl border-2 border-border bg-surface p-6 shadow-[var(--shadow)]';

type Props = {
  activeMode: ToolMode;
  onModeChange: (mode: ToolMode) => void;
  input: string;
  rewriteOutput: string;
  logOutput: string;
  eventDate: string;
  loading: boolean;
  error: string;
  rewriteCopied: boolean;
  logCopied: boolean;
  onInputChange: (value: string) => void;
  onRewriteOutputChange: (value: string) => void;
  onLogOutputChange: (value: string) => void;
  onEventDateChange: (value: string) => void;
  onGenerate: () => void;
  onReset: () => void;
  onCopy: () => void;
  transformLevel: TransformLevel;
  onTransformLevelChange: (level: TransformLevel) => void;
};

export function ToolWorkflow({
  activeMode,
  onModeChange,
  input,
  rewriteOutput,
  logOutput,
  eventDate,
  loading,
  error,
  rewriteCopied,
  logCopied,
  onInputChange,
  onRewriteOutputChange,
  onLogOutputChange,
  onEventDateChange,
  onGenerate,
  onReset,
  onCopy,
  transformLevel,
  onTransformLevelChange,
}: Props) {
  const { messages: m } = useI18n();
  const canGenerate = !!input.trim();
  const output = activeMode === 'rewrite' ? rewriteOutput : logOutput;
  const hasOutput = !!output.trim();
  const copied = activeMode === 'rewrite' ? rewriteCopied : logCopied;

  const tabs: { id: ToolMode; label: string; hint: string }[] = [
    { id: 'rewrite', label: m.tabs.rewrite.label, hint: m.tabs.rewrite.hint },
    { id: 'log', label: m.tabs.log.label, hint: m.tabs.log.hint },
  ];

  const rewriteLevels: { level: TransformLevel; label: string }[] = [
    { level: 'minimal', label: m.rewrite.minimal },
    { level: 'moderate', label: m.rewrite.moderate },
    { level: 'firm', label: m.rewrite.firm },
  ];

  return (
    <div className="space-y-6">
      <nav
        className="flex flex-col sm:flex-row gap-2 p-1 rounded-xl border-2 border-border bg-surface-muted"
        aria-label={m.tabs.aria}
      >
        {tabs.map((tab) => {
          const active = activeMode === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onModeChange(tab.id)}
              className={[
                'flex-1 rounded-lg px-4 py-3 text-left transition-colors',
                active
                  ? 'bg-surface border-2 border-primary shadow-sm'
                  : 'border-2 border-transparent hover:bg-surface',
              ].join(' ')}
              aria-pressed={active}
            >
              <span
                className={[
                  'block text-sm font-semibold',
                  active ? 'text-primary' : 'text-foreground',
                ].join(' ')}
              >
                {tab.label}
              </span>
              <span className="block mt-0.5 text-xs text-muted">{tab.hint}</span>
            </button>
          );
        })}
      </nav>

      <p className="text-sm text-muted leading-relaxed">
        {activeMode === 'rewrite' ? m.intro.rewrite : m.intro.log}
      </p>

      <div className={panelClass + ' space-y-4'}>
        <div>
          <label
            htmlFor="shared-input"
            className="block text-sm font-medium text-foreground mb-2"
          >
            {activeMode === 'rewrite'
              ? m.input.rewriteLabel
              : m.input.logLabel}
          </label>
          <textarea
            id="shared-input"
            className={`${fieldClass} min-h-[180px] resize-y`}
            rows={7}
            placeholder={
              activeMode === 'rewrite'
                ? m.input.rewritePlaceholder
                : m.input.logPlaceholder
            }
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
          />
          <p className="mt-2 text-xs text-muted-light">{m.input.sharedHint}</p>
        </div>

        {activeMode === 'log' && (
          <div>
            <label
              htmlFor="log-date"
              className="block text-sm font-medium text-foreground mb-2"
            >
              {m.log.entryDate}
            </label>
            <input
              id="log-date"
              type="date"
              className={`${fieldClass} max-w-xs`}
              value={eventDate}
              onChange={(e) => onEventDateChange(e.target.value)}
            />
          </div>
        )}

        {activeMode === 'rewrite' && (
          <div>
            <span className="block text-sm font-medium text-foreground mb-2">
              {m.rewrite.modeLabel}
            </span>
            <div className="flex flex-wrap gap-2">
              {rewriteLevels.map(({ level, label }) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => onTransformLevelChange(level)}
                  className={[
                    'rounded-lg border-2 px-3 py-2 text-xs font-medium transition-colors',
                    transformLevel === level
                      ? 'border-primary bg-primary-subtle text-primary'
                      : 'border-border bg-surface text-muted hover:border-primary',
                  ].join(' ')}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-light">{m.rewrite.modeHelp}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={onGenerate}
            disabled={!canGenerate || loading}
            className={[
              'rounded-xl border-2 px-5 py-2.5 text-sm font-bold transition-all',
              canGenerate && !loading
                ? 'border-primary-hover bg-primary text-white hover:brightness-110'
                : 'border-border bg-surface-muted text-muted cursor-not-allowed',
            ].join(' ')}
          >
            {loading
              ? m.actions.generating
              : hasOutput
                ? m.actions.regenerate
                : activeMode === 'rewrite'
                  ? m.actions.rewriteMessage
                  : m.actions.buildLogEntry}
          </button>
          <button
            type="button"
            onClick={onReset}
            className="rounded-xl border-2 border-border bg-surface px-4 py-2.5 text-sm font-medium text-muted hover:border-primary hover:text-primary"
          >
            {m.actions.resetAll}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-800 bg-red-50 border-2 border-red-200 rounded-xl px-4 py-3 dark:bg-red-950 dark:text-red-200 dark:border-red-800">
          {error}
        </p>
      )}

      <div className={panelClass + ' space-y-4'}>
        <div className="flex items-start justify-between gap-3">
          <label
            htmlFor="tool-output"
            className="block text-sm font-medium text-foreground"
          >
            {activeMode === 'rewrite'
              ? m.output.rewriteLabel
              : m.output.logLabel}
          </label>
          {hasOutput && (
            <button
              type="button"
              onClick={onCopy}
              className="shrink-0 rounded-md border-2 border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted hover:border-primary hover:text-primary"
            >
              {copied ? m.actions.copied : m.actions.copy}
            </button>
          )}
        </div>
        {activeMode === 'rewrite' ? (
          <textarea
            id="tool-output"
            className={`${fieldClass} min-h-[200px] resize-y bg-surface`}
            rows={8}
            placeholder={m.output.rewritePlaceholder}
            value={rewriteOutput}
            onChange={(e) => onRewriteOutputChange(e.target.value)}
          />
        ) : (
          <textarea
            id="tool-output"
            className={`${fieldClass} min-h-[200px] resize-y bg-surface`}
            rows={8}
            placeholder={m.output.logPlaceholder}
            value={logOutput}
            onChange={(e) => onLogOutputChange(e.target.value)}
          />
        )}
        <p className="text-xs text-muted-light">
          {activeMode === 'log' && !hasOutput && (
            <>{m.output.logEmptyHint} </>
          )}
          {m.output.editHint}
        </p>
      </div>

      <p className="text-xs text-muted-light border-t border-border pt-4">
        {m.privacy}
      </p>
    </div>
  );
}
