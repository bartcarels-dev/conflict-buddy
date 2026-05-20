'use client';

import { useState } from 'react';
import { LanguageSwitcher } from '@/app/components/LanguageSwitcher';
import { useI18n } from '@/app/components/I18nProvider';
import { ToolWorkflow } from '@/app/components/ToolWorkflow';
import type { ToolMode, TransformLevel } from '@/lib/types';

export default function Home() {
  const { messages: m } = useI18n();
  const [activeTool, setActiveTool] = useState<ToolMode>('rewrite');
  const [input, setInput] = useState('');
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

  const runGenerate = async () => {
    if (!input.trim()) return;

    setError('');
    setLoading(true);
    if (activeTool === 'rewrite') setRewriteCopied(false);
    else setLogCopied(false);

    try {
      const res = await fetch('/api/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: activeTool,
          input,
          ...(activeTool === 'rewrite' ? { transformLevel: rewriteLevel } : {}),
          ...(activeTool === 'log' ? { eventDate } : {}),
        }),
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
    setInput('');
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
          input={input}
          rewriteOutput={rewriteOutput}
          logOutput={logOutput}
          eventDate={eventDate}
          loading={loading}
          error={error}
          rewriteCopied={rewriteCopied}
          logCopied={logCopied}
          onInputChange={setInput}
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
