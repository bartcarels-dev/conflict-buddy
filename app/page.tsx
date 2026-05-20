'use client';

import { useState } from 'react';
import { ToolWorkflow } from '@/app/components/ToolWorkflow';
import type { ToolMode } from '@/lib/types';

type View = 'home' | ToolMode;

const panelClass =
  'rounded-2xl border-2 border-border bg-surface p-6 shadow-[var(--shadow)]';

const TOOL_COPY = {
  rewrite: {
    title: 'Message Rewriter',
    description:
      'Paste a message that feels emotional, reactive, or unclear. Get a calmer, clearer version you can edit and copy.',
    inputLabel: 'Your message',
    inputPlaceholder:
      'Paste the message you want to send, or a rough draft of what you want to say…',
    outputLabel: 'Clearer message',
    outputPlaceholder: 'Your clearer message will appear here after you generate.',
  },
  log: {
    title: 'Log Entry Builder',
    description:
      'Paste rough notes about what happened. Get a neutral, factual log-style entry you can edit and copy.',
    inputLabel: 'What happened',
    inputPlaceholder:
      'Rough notes: who was involved, what happened, when, what was said…',
    outputLabel: 'Log entry',
    outputPlaceholder: 'Your log entry will appear here after you generate.',
  },
} as const;

export default function Home() {
  const [view, setView] = useState<View>('home');

  const [rewriteInput, setRewriteInput] = useState('');
  const [rewriteOutput, setRewriteOutput] = useState('');
  const [rewriteCopied, setRewriteCopied] = useState(false);

  const [logInput, setLogInput] = useState('');
  const [logOutput, setLogOutput] = useState('');
  const [logEventDate, setLogEventDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [logCopied, setLogCopied] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const runGenerate = async (mode: ToolMode) => {
    const input = mode === 'rewrite' ? rewriteInput : logInput;
    if (!input.trim()) return;

    setError('');
    setLoading(true);
    if (mode === 'rewrite') setRewriteCopied(false);
    else setLogCopied(false);

    try {
      const res = await fetch('/api/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          input,
          ...(mode === 'log' ? { eventDate: logEventDate } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Something went wrong.');
        return;
      }
      const text = String(data.output ?? '');
      if (mode === 'rewrite') setRewriteOutput(text);
      else setLogOutput(text);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, mode: ToolMode) => {
    if (!text.trim()) return;
    navigator.clipboard.writeText(text);
    if (mode === 'rewrite') {
      setRewriteCopied(true);
      setTimeout(() => setRewriteCopied(false), 2000);
    } else {
      setLogCopied(true);
      setTimeout(() => setLogCopied(false), 2000);
    }
  };

  const resetRewrite = () => {
    setRewriteInput('');
    setRewriteOutput('');
    setRewriteCopied(false);
    setError('');
  };

  const resetLog = () => {
    setLogInput('');
    setLogOutput('');
    setLogEventDate(new Date().toISOString().slice(0, 10));
    setLogCopied(false);
    setError('');
  };

  const goHome = () => {
    setView('home');
    setError('');
  };

  return (
    <main className="min-h-screen text-foreground">
      <header className="border-b-2 border-border bg-surface">
        <section className="max-w-3xl mx-auto px-5 sm:px-8 py-8">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
            Conflict Buddy
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">
            Clearer communication when emotions run high
          </h1>
          {view === 'home' && (
            <p className="mt-3 text-sm text-muted max-w-2xl leading-relaxed">
              Turn tense communication into clearer messages and factual
              notes. Paste your text, generate a draft, edit it, and copy —
              nothing is saved to an account.
            </p>
          )}
          <p className="mt-2 text-xs text-muted-light italic">
            Writing aid only — not legal advice or therapy.
          </p>
        </section>
      </header>

      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-8 pb-16">
        {view === 'home' && (
          <div className="space-y-6">
            <p className="text-sm text-muted leading-relaxed">
              Choose a tool. Each one gives you a single result you can edit
              before copying.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  setView('rewrite');
                  setError('');
                }}
                className={
                  panelClass +
                  ' text-left transition-colors hover:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20'
                }
              >
                <h2 className="text-lg font-semibold text-foreground">
                  Rewrite a message
                </h2>
                <p className="mt-2 text-sm text-muted leading-relaxed">
                  Calmer, clearer wording for something you might send or say.
                </p>
                <span className="mt-4 inline-block text-sm font-semibold text-primary">
                  Open Message Rewriter →
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setView('log');
                  setError('');
                }}
                className={
                  panelClass +
                  ' text-left transition-colors hover:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20'
                }
              >
                <h2 className="text-lg font-semibold text-foreground">
                  Create a log entry
                </h2>
                <p className="mt-2 text-sm text-muted leading-relaxed">
                  Neutral, factual notes from rough details about what
                  happened.
                </p>
                <span className="mt-4 inline-block text-sm font-semibold text-primary">
                  Open Log Entry Builder →
                </span>
              </button>
            </div>

            <p className="text-xs text-muted-light">
              We do not store your text on our servers. Copy anything you want
              to keep before leaving.
            </p>
          </div>
        )}

        {view === 'rewrite' && (
          <ToolWorkflow
            mode="rewrite"
            {...TOOL_COPY.rewrite}
            input={rewriteInput}
            output={rewriteOutput}
            eventDate=""
            loading={loading}
            error={error}
            copied={rewriteCopied}
            onInputChange={setRewriteInput}
            onOutputChange={setRewriteOutput}
            onEventDateChange={() => {}}
            onGenerate={() => runGenerate('rewrite')}
            onReset={resetRewrite}
            onCopy={() => handleCopy(rewriteOutput, 'rewrite')}
            onBack={goHome}
          />
        )}

        {view === 'log' && (
          <ToolWorkflow
            mode="log"
            {...TOOL_COPY.log}
            input={logInput}
            output={logOutput}
            eventDate={logEventDate}
            loading={loading}
            error={error}
            copied={logCopied}
            onInputChange={setLogInput}
            onOutputChange={setLogOutput}
            onEventDateChange={setLogEventDate}
            onGenerate={() => runGenerate('log')}
            onReset={resetLog}
            onCopy={() => handleCopy(logOutput, 'log')}
            onBack={goHome}
          />
        )}
      </div>
    </main>
  );
}
