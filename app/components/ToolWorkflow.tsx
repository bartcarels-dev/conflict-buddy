'use client';

import { useMemo } from 'react';
import { useI18n } from '@/app/components/I18nProvider';
import type { RewriteIntent, ToolMode, TransformLevel } from '@/lib/types';

const fieldClass =
  'w-full rounded-lg border-2 border-border bg-input-bg px-4 py-3 text-sm text-foreground shadow-sm placeholder:text-muted-light focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20';

const panelClass =
  'rounded-2xl border-2 border-border bg-surface p-6 shadow-[var(--shadow)]';

export type RewriteEntryMode = 'auto' | RewriteIntent;

export function resolveRewriteIntent(
  entryMode: RewriteEntryMode,
  theirMessage: string,
  userDraft: string
): RewriteIntent {
  if (entryMode !== 'auto') return entryMode;
  const their = theirMessage.trim();
  const draft = userDraft.trim();
  if (their && !draft) return 'reply';
  if (draft && !their) return 'polish';
  if (their) return 'reply';
  return 'polish';
}

type Props = {
  activeMode: ToolMode;
  onModeChange: (mode: ToolMode) => void;
  theirMessage: string;
  userDraft: string;
  logInput: string;
  rewriteEntryMode: RewriteEntryMode;
  onRewriteEntryModeChange: (mode: RewriteEntryMode) => void;
  rewriteOutput: string;
  logOutput: string;
  eventDate: string;
  loading: boolean;
  error: string;
  rewriteCopied: boolean;
  logCopied: boolean;
  onTheirMessageChange: (value: string) => void;
  onUserDraftChange: (value: string) => void;
  onLogInputChange: (value: string) => void;
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
  theirMessage,
  userDraft,
  logInput,
  rewriteEntryMode,
  onRewriteEntryModeChange,
  rewriteOutput,
  logOutput,
  eventDate,
  loading,
  error,
  rewriteCopied,
  logCopied,
  onTheirMessageChange,
  onUserDraftChange,
  onLogInputChange,
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

  const rewriteIntent = useMemo(
    () => resolveRewriteIntent(rewriteEntryMode, theirMessage, userDraft),
    [rewriteEntryMode, theirMessage, userDraft]
  );

  const isReply = rewriteIntent === 'reply';
  const showTheirField = activeMode === 'rewrite' && isReply;

  const canGenerate =
    activeMode === 'rewrite'
      ? isReply
        ? !!theirMessage.trim()
        : !!userDraft.trim()
      : !!logInput.trim();

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

  const entryChips: { id: RewriteIntent; label: string; hint: string }[] = [
    { id: 'reply', label: m.rewriteEntry.reply, hint: m.rewriteEntry.replyHint },
    { id: 'polish', label: m.rewriteEntry.polish, hint: m.rewriteEntry.polishHint },
  ];

  const generateLabel = isReply
    ? hasOutput
      ? m.actions.regenerate
      : m.actions.suggestReply
    : hasOutput
      ? m.actions.regenerate
      : m.actions.rewriteMessage;

  const outputLabel =
    activeMode === 'rewrite'
      ? isReply
        ? m.output.replyLabel
        : m.output.rewriteLabel
      : m.output.logLabel;

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
        {activeMode === 'rewrite' && (
          <div
            className="flex flex-col sm:flex-row gap-2 p-1 rounded-lg border border-border bg-surface-muted"
            role="group"
            aria-label={m.rewriteEntry.aria}
          >
            {entryChips.map((chip) => {
              const active =
                rewriteEntryMode === chip.id ||
                (rewriteEntryMode === 'auto' && rewriteIntent === chip.id);
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => onRewriteEntryModeChange(chip.id)}
                  className={[
                    'flex-1 rounded-md px-3 py-2.5 text-left transition-colors border-2',
                    active
                      ? 'border-primary bg-primary-subtle'
                      : 'border-transparent hover:bg-surface',
                  ].join(' ')}
                  aria-pressed={active}
                >
                  <span
                    className={[
                      'block text-xs font-semibold',
                      active ? 'text-primary' : 'text-foreground',
                    ].join(' ')}
                  >
                    {chip.label}
                  </span>
                  <span className="block mt-0.5 text-[11px] text-muted leading-snug">
                    {chip.hint}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {activeMode === 'rewrite' && showTheirField && (
          <div>
            <label
              htmlFor="their-message"
              className="block text-sm font-medium text-foreground mb-2"
            >
              {m.input.theirMessageLabel}
            </label>
            <textarea
              id="their-message"
              className={`${fieldClass} min-h-[140px] resize-y`}
              rows={5}
              placeholder={m.input.theirMessagePlaceholder}
              value={theirMessage}
              onChange={(e) => {
                onTheirMessageChange(e.target.value);
                if (rewriteEntryMode === 'auto' && e.target.value.trim()) {
                  onRewriteEntryModeChange('auto');
                }
              }}
            />
            <p className="mt-2 text-xs text-muted-light">
              {m.input.theirMessageHint}
            </p>
          </div>
        )}

        {activeMode === 'rewrite' ? (
          <div>
            <label
              htmlFor="user-draft"
              className="block text-sm font-medium text-foreground mb-2"
            >
              {m.input.userDraftLabel}
            </label>
            <textarea
              id="user-draft"
              className={`${fieldClass} min-h-[140px] resize-y`}
              rows={5}
              placeholder={
                isReply
                  ? m.input.userDraftPlaceholderReply
                  : m.input.userDraftPlaceholderPolish
              }
              value={userDraft}
              onChange={(e) => onUserDraftChange(e.target.value)}
            />
            {isReply && (
              <p className="mt-2 text-xs text-muted-light">
                {m.input.userDraftHintReply}
              </p>
            )}
          </div>
        ) : (
          <div>
            <label
              htmlFor="log-input"
              className="block text-sm font-medium text-foreground mb-2"
            >
              {m.input.logLabel}
            </label>
            <textarea
              id="log-input"
              className={`${fieldClass} min-h-[180px] resize-y`}
              rows={7}
              placeholder={m.input.logPlaceholder}
              value={logInput}
              onChange={(e) => onLogInputChange(e.target.value)}
            />
            <p className="mt-2 text-xs text-muted-light">{m.input.logHint}</p>
          </div>
        )}

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
            {loading ? m.actions.generating : generateLabel}
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
            {outputLabel}
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
