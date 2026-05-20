'use client';

import type { ToolMode, TransformLevel } from '@/lib/types';

const fieldClass =
  'w-full rounded-lg border-2 border-border bg-input-bg px-4 py-3 text-sm text-foreground shadow-sm placeholder:text-muted-light focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20';

const panelClass =
  'rounded-2xl border-2 border-border bg-surface p-6 shadow-[var(--shadow)]';

type Props = {
  mode: ToolMode;
  title: string;
  description: string;
  inputLabel: string;
  inputPlaceholder: string;
  outputLabel: string;
  outputPlaceholder: string;
  input: string;
  output: string;
  eventDate: string;
  loading: boolean;
  error: string;
  copied: boolean;
  onInputChange: (value: string) => void;
  onOutputChange: (value: string) => void;
  onEventDateChange: (value: string) => void;
  onGenerate: () => void;
  onReset: () => void;
  onCopy: () => void;
  onBack: () => void;
  transformLevel?: TransformLevel;
  onTransformLevelChange?: (level: TransformLevel) => void;
};

export function ToolWorkflow({
  mode,
  title,
  description,
  inputLabel,
  inputPlaceholder,
  outputLabel,
  outputPlaceholder,
  input,
  output,
  eventDate,
  loading,
  error,
  copied,
  onInputChange,
  onOutputChange,
  onEventDateChange,
  onGenerate,
  onReset,
  onCopy,
  onBack,
  transformLevel = 'moderate',
  onTransformLevelChange,
}: Props) {
  const canGenerate = !!input.trim();
  const hasOutput = !!output.trim();

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="text-sm font-medium text-muted hover:text-primary"
      >
        ← Back
      </button>

      <div>
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        <p className="mt-2 text-sm text-muted max-w-2xl leading-relaxed">
          {description}
        </p>
      </div>

      <div className={panelClass + ' space-y-4'}>
        <div>
          <label
            htmlFor={`${mode}-input`}
            className="block text-sm font-medium text-foreground mb-2"
          >
            {inputLabel}
          </label>
          <textarea
            id={`${mode}-input`}
            className={`${fieldClass} min-h-[180px] resize-y`}
            rows={7}
            placeholder={inputPlaceholder}
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
          />
        </div>

        {mode === 'log' && (
          <div>
            <label
              htmlFor={`${mode}-date`}
              className="block text-sm font-medium text-foreground mb-2"
            >
              Entry date
            </label>
            <input
              id={`${mode}-date`}
              type="date"
              className={`${fieldClass} max-w-xs`}
              value={eventDate}
              onChange={(e) => onEventDateChange(e.target.value)}
            />
          </div>
        )}

        {mode === 'rewrite' && onTransformLevelChange && (
          <div>
            <span className="block text-sm font-medium text-foreground mb-2">
              Rewrite mode
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onTransformLevelChange('minimal')}
                className={[
                  'rounded-lg border-2 px-3 py-2 text-xs font-medium transition-colors',
                  transformLevel === 'minimal'
                    ? 'border-primary bg-primary-subtle text-primary'
                    : 'border-border bg-surface text-muted hover:border-primary',
                ].join(' ')}
              >
                Light polish
              </button>
              <button
                type="button"
                onClick={() => onTransformLevelChange('moderate')}
                className={[
                  'rounded-lg border-2 px-3 py-2 text-xs font-medium transition-colors',
                  transformLevel === 'moderate'
                    ? 'border-primary bg-primary-subtle text-primary'
                    : 'border-border bg-surface text-muted hover:border-primary',
                ].join(' ')}
              >
                Clear &amp; calm
              </button>
              <button
                type="button"
                onClick={() => onTransformLevelChange('firm')}
                className={[
                  'rounded-lg border-2 px-3 py-2 text-xs font-medium transition-colors',
                  transformLevel === 'firm'
                    ? 'border-primary bg-primary-subtle text-primary'
                    : 'border-border bg-surface text-muted hover:border-primary',
                ].join(' ')}
              >
                Firm boundary
              </button>
            </div>
            <p className="mt-2 text-xs text-muted-light">
              Light polish: grammar and typos only. Clear &amp; calm:
              structural de-escalation — reframes blame, keeps your point.
              Firm boundary: same, with limits and requests stated clearly.
            </p>
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
              ? 'Generating…'
              : hasOutput
                ? 'Regenerate'
                : 'Generate'}
          </button>
          <button
            type="button"
            onClick={onReset}
            className="rounded-xl border-2 border-border bg-surface px-4 py-2.5 text-sm font-medium text-muted hover:border-primary hover:text-primary"
          >
            Reset
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
            htmlFor={`${mode}-output`}
            className="block text-sm font-medium text-foreground"
          >
            {outputLabel}
          </label>
          {hasOutput && (
            <button
              type="button"
              onClick={onCopy}
              className="shrink-0 rounded-md border-2 border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted hover:border-primary hover:text-primary"
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          )}
        </div>
        <textarea
          id={`${mode}-output`}
          className={`${fieldClass} min-h-[200px] resize-y bg-surface`}
          rows={8}
          placeholder={outputPlaceholder}
          value={output}
          onChange={(e) => onOutputChange(e.target.value)}
        />
        <p className="text-xs text-muted-light">
          Edit the text above before copying. You can regenerate anytime.
        </p>
      </div>

      <p className="text-xs text-muted-light border-t border-border pt-4">
        Privacy: no account and no saved history. What you enter is used only to
        generate your result on this visit—it is not stored, reviewed by us, or
        used to train AI. Copy anything you want to keep before you leave.
      </p>
    </div>
  );
}
