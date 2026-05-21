'use client';

import { useMemo, useState } from 'react';
import { LanguageSwitcher } from '@/app/components/LanguageSwitcher';
import { useI18n } from '@/app/components/I18nProvider';
import {
  ToolWorkflow,
  resolveRewriteIntent,
  type RewriteEntryMode,
} from '@/app/components/ToolWorkflow';
import type { ToolMode, TransformLevel } from '@/lib/types';

export default function Home() {
  const { messages: m } = useI18n();
  const [activeTool, setActiveTool] = useState<ToolMode>('rewrite');
  const [theirMessage, setTheirMessage] = useState('');
  const [userDraft, setUserDraft] = useState('');
  const [logInput, setLogInput] = useState('');
  const [rewriteEntryMode, setRewriteEntryMode] =
    useState<RewriteEntryMode>('auto');
  const [rewriteOutput, setRewriteOutput] = useState('');
  const [logOutput, setLogOutput] = useState('');
  const [eventDate, setEventDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [rewriteCopied, setRewriteCopied] = useState(false);
  const [logCopied, setLogCopied] = useState(false);
  const [rewriteLevel, setRewriteLevel] = useState<TransformLevel>('moderate');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const rewriteIntent = useMemo(
    () => resolveRewriteIntent(rewriteEntryMode, theirMessage, userDraft),
    [rewriteEntryMode, theirMessage, userDraft]
  );

  const runGenerate = async () => {
    setError('');
    setLoading(true);
    if (activeTool === 'rewrite') setRewriteCopied(false);
    else setLogCopied(false);

    try {
      const body =
        activeTool === 'rewrite'
          ? {
              mode: 'rewrite' as const,
              theirMessage: theirMessage.trim(),
              input: userDraft.trim(),
              transformLevel: rewriteLevel,
              rewriteIntent,
            }
          : {
              mode: 'log' as const,
              input: logInput.trim(),
              eventDate,
            };

      if (activeTool === 'rewrite') {
        if (rewriteIntent === 'reply' && !theirMessage.trim()) return;
        if (rewriteIntent === 'polish' && !userDraft.trim()) return;
      } else if (!logInput.trim()) {
        return;
      }

      const res = await fetch('/api/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || m.errors.generic);
        return;
      }
      const text = String(data.output ?? '');
      if (activeTool === 'rewrite') setRewriteOutput(text);
      else setLogOutput(text);
    } catch {
      setError(m.errors.network);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const text = activeTool === 'rewrite' ? rewriteOutput : logOutput;
    if (!text.trim()) return;
    navigator.clipboard.writeText(text);
    if (activeTool === 'rewrite') {
      setRewriteCopied(true);
      setTimeout(() => setRewriteCopied(false), 2000);
    } else {
      setLogCopied(true);
      setTimeout(() => setLogCopied(false), 2000);
    }
  };

  const resetAll = () => {
    setTheirMessage('');
    setUserDraft('');
    setLogInput('');
    setRewriteEntryMode('auto');
    setRewriteOutput('');
    setLogOutput('');
    setEventDate(new Date().toISOString().slice(0, 10));
    setRewriteCopied(false);
    setLogCopied(false);
    setError('');
  };

  return (
    <main className="min-h-screen text-foreground">
      <header className="border-b-2 border-border bg-surface">
        <section className="max-w-3xl mx-auto px-5 sm:px-8 py-8">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              {m.appName}
            </p>
            <LanguageSwitcher />
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">
            {m.header.title}
          </h1>
          <p className="mt-3 text-sm text-muted max-w-2xl leading-relaxed">
            {m.header.subtitle}
          </p>
          <p className="mt-2 text-xs text-muted-light italic">
            {m.header.disclaimer}
          </p>
        </section>
      </header>

      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-8 pb-16">
        <ToolWorkflow
          activeMode={activeTool}
          onModeChange={(mode) => {
            setActiveTool(mode);
            setError('');
          }}
          theirMessage={theirMessage}
          userDraft={userDraft}
          logInput={logInput}
          rewriteEntryMode={rewriteEntryMode}
          onRewriteEntryModeChange={setRewriteEntryMode}
          rewriteOutput={rewriteOutput}
          logOutput={logOutput}
          eventDate={eventDate}
          loading={loading}
          error={error}
          rewriteCopied={rewriteCopied}
          logCopied={logCopied}
          onTheirMessageChange={setTheirMessage}
          onUserDraftChange={setUserDraft}
          onLogInputChange={setLogInput}
          onRewriteOutputChange={setRewriteOutput}
          onLogOutputChange={setLogOutput}
          onEventDateChange={setEventDate}
          onGenerate={runGenerate}
          onReset={resetAll}
          onCopy={handleCopy}
          transformLevel={rewriteLevel}
          onTransformLevelChange={setRewriteLevel}
        />
      </div>
    </main>
  );
}
