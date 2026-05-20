'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ExportChronology } from '@/app/components/ExportChronology';
import { ExportFullAnalysis } from '@/app/components/ExportFullAnalysis';
import { IncidentTimeline } from '@/app/components/IncidentTimeline';
import { StickyActionBar } from '@/app/components/StickyActionBar';
import { OutputField } from '@/app/components/OutputField';
import { OutputList } from '@/app/components/OutputList';
import {
  cloneOutputs,
  deriveIncidentTitle,
  emptyOutputs,
  LIST_SECTIONS,
  type AnalysisOutputs,
  type Incident,
  type SectionKey,
} from '@/lib/types';
import type { SectionAiResult } from '@/app/components/OutputField';
import { learnFromUserEdits } from '@/lib/learnFromEdit';
import { getSectionSource } from '@/lib/sectionSource';
import {
  clearLearnedPreferences,
  formatPreferencesForPrompt,
  loadLearnedPreferences,
} from '@/lib/preferences';
import {
  loadIncidents,
  removeIncident,
  saveIncidents,
  upsertIncident,
} from '@/lib/storage';
import type { LearnedPreference } from '@/lib/types';

const fieldClass =
  'w-full rounded-lg border-2 border-border bg-input-bg px-4 py-3 text-sm text-foreground shadow-sm placeholder:text-muted-light focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20';

const panelClass =
  'rounded-2xl border-2 border-border bg-surface p-6 shadow-[var(--shadow)]';

export default function Home() {
  const [baseline, setBaseline] = useState('');
  const [event, setEvent] = useState('');
  const [privateNotes, setPrivateNotes] = useState('');
  const [eventDate, setEventDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );

  const [outputs, setOutputs] = useState<AnalysisOutputs>(emptyOutputs());
  const [activeIncidentId, setActiveIncidentId] = useState<string | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [showHidden, setShowHidden] = useState(false);

  const [copied, setCopied] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sectionBusy, setSectionBusy] = useState<SectionKey | null>(null);
  const [error, setError] = useState('');
  const [learnFromEdits, setLearnFromEdits] = useState(true);
  const [learnedPrefs, setLearnedPrefs] = useState<LearnedPreference[]>([]);
  const [learnNotice, setLearnNotice] = useState('');

  const [baselineOutputs, setBaselineOutputs] =
    useState<AnalysisOutputs | null>(null);

  useEffect(() => {
    setIncidents(loadIncidents());
    setLearnedPrefs(loadLearnedPreferences());
  }, []);

  const preferenceTexts = useMemo(
    () => formatPreferencesForPrompt(learnedPrefs),
    [learnedPrefs]
  );

  const sectionSource = useCallback(
    (key: SectionKey) => getSectionSource(key, outputs, baselineOutputs),
    [outputs, baselineOutputs]
  );

  const markSectionGenerated = useCallback(
    (key: SectionKey, value: string | string[]) => {
      setBaselineOutputs((prev) =>
        prev ? { ...prev, [key]: value } : null
      );
    },
    []
  );

  const baselineText = useCallback(
    (key: SectionKey) => {
      if (!baselineOutputs) return undefined;
      const v = baselineOutputs[key];
      return typeof v === 'string' ? v : undefined;
    },
    [baselineOutputs]
  );

  const canGenerate = !!event.trim();
  const hasOutputs = Object.values(outputs).some((v) =>
    Array.isArray(v) ? v.length > 0 : !!v
  );

  const savedIncident = activeIncidentId
    ? incidents.find((i) => i.id === activeIncidentId)
    : null;

  const isDirty = useMemo(() => {
    if (!savedIncident) return hasOutputs;
    return (
      savedIncident.rawInput !== event ||
      savedIncident.optionalContext !== baseline ||
      savedIncident.notes !== privateNotes ||
      savedIncident.eventDate !== eventDate ||
      JSON.stringify(savedIncident.outputs) !== JSON.stringify(outputs)
    );
  }, [
    savedIncident,
    event,
    baseline,
    privateNotes,
    eventDate,
    outputs,
    hasOutputs,
  ]);

  const editHint =
    'Edit your version below, then Review my edit for a suggestion. Use the bottom bar to save.';

  const updateOutput = <K extends SectionKey>(
    key: K,
    value: AnalysisOutputs[K]
  ) => {
    setOutputs((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerate = async () => {
    if (!event.trim()) return;
    setCopied(null);
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseline,
          event,
          eventDate,
          learnedPreferences: preferenceTexts,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Something went wrong.');
        return;
      }
      const nextOutputs: AnalysisOutputs = {
        deEscalatedResponse: data.deEscalatedResponse ?? '',
        boundaryResponse: data.boundaryResponse ?? '',
        courtSafeVersion: data.courtSafeVersion ?? '',
        logEntry: data.logEntry ?? '',
        riskNotes: data.riskNotes ?? [],
        omittedOrSoftened: data.omittedOrSoftened ?? [],
        suggestedTags: data.suggestedTags ?? [],
        keyFacts: data.keyFacts ?? [],
      };
      setOutputs(nextOutputs);
      setBaselineOutputs(cloneOutputs(nextOutputs));
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSectionAi = async (
    sectionKey: SectionKey,
    mode: 'review' | 'regenerate',
    feedback: string
  ): Promise<SectionAiResult | null> => {
    if (!event.trim()) return null;
    setSectionBusy(sectionKey);
    setError('');

    try {
      const currentValue = outputs[sectionKey];
      const res = await fetch('/api/improve/section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionKey,
          baseline,
          event,
          eventDate,
          currentValue,
          feedback,
          mode,
          learnedPreferences: preferenceTexts,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Section update failed.');
        return null;
      }

      const isList = LIST_SECTIONS.includes(sectionKey);
      const raw = data.value;
      const value = isList
        ? (Array.isArray(raw) ? raw : []).map(String).filter(Boolean).join('\n')
        : String(raw ?? '');

      return {
        value,
        summary: typeof data.summary === 'string' ? data.summary : undefined,
      };
    } catch {
      setError('Network error. Please try again.');
      return null;
    } finally {
      setSectionBusy(null);
    }
  };

  const handleSaveIncident = async () => {
    if (!hasOutputs) return;

    const outputsSnapshot = cloneOutputs(outputs);
    const incidentId = activeIncidentId ?? crypto.randomUUID();
    const snapshotForLearning = baselineOutputs;

    setIncidents((prev) => {
      const existing = prev.find((i) => i.id === incidentId);
      const incident: Incident = {
        id: incidentId,
        createdAt: existing?.createdAt ?? new Date().toISOString(),
        eventDate,
        rawInput: event,
        optionalContext: baseline,
        outputs: outputsSnapshot,
        tags:
          outputsSnapshot.suggestedTags.length > 0
            ? [...outputsSnapshot.suggestedTags]
            : [],
        hidden: existing?.hidden ?? false,
        notes: privateNotes,
        status: 'saved',
        title: deriveIncidentTitle(outputsSnapshot, event),
      };
      const next = upsertIncident(prev, incident);
      saveIncidents(next);
      return next;
    });

    setActiveIncidentId(incidentId);
    setBaselineOutputs(cloneOutputs(outputsSnapshot));
    setLearnNotice('Saved.');

    if (!learnFromEdits) return;

    try {
      const { added, rejected } = await learnFromUserEdits(
        snapshotForLearning,
        outputsSnapshot,
        learnFromEdits
      );
      if (added > 0) {
        setLearnedPrefs(loadLearnedPreferences());
        setLearnNotice(
          added === 1
            ? 'Learned 1 style preference from your edit.'
            : `Learned ${added} style preferences from your edits.`
        );
      } else if (rejected.length > 0) {
        setLearnNotice('Some edits were not learned (safety or style rules).');
      } else {
        setLearnNotice('');
      }
    } catch {
      setLearnNotice('Could not learn from edits right now.');
    }
  };

  const handleNewIncident = () => {
    setActiveIncidentId(null);
    setEvent('');
    setBaseline('');
    setPrivateNotes('');
    setOutputs(emptyOutputs());
    setBaselineOutputs(null);
    setEventDate(new Date().toISOString().slice(0, 10));
    setError('');
    setLearnNotice('');
  };

  const loadIncident = useCallback((id: string) => {
    const list = loadIncidents();
    const incident = list.find((i) => i.id === id);
    if (!incident) return;

    const outputsCopy = cloneOutputs(incident.outputs);

    setIncidents(list);
    setActiveIncidentId(incident.id);
    setEvent(incident.rawInput);
    setBaseline(incident.optionalContext);
    setPrivateNotes(incident.notes);
    setEventDate(incident.eventDate);
    setOutputs(outputsCopy);
    setBaselineOutputs(cloneOutputs(incident.outputs));
    setError('');
    setLearnNotice('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleOpenIncident = useCallback(
    (id: string) => {
      if (activeIncidentId === id && !isDirty) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      if (isDirty) {
        const discard = window.confirm(
          'You have unsaved changes in the editor. Open this incident and discard them?'
        );
        if (!discard) return;
      }

      loadIncident(id);
    },
    [activeIncidentId, isDirty, loadIncident]
  );

  const handleHideIncident = (id: string) => {
    setIncidents((prev) => {
      const next = prev.map((i) =>
        i.id === id ? { ...i, hidden: !i.hidden } : i
      );
      saveIncidents(next);
      return next;
    });
  };

  const handleDeleteIncident = (id: string) => {
    setIncidents((prev) => {
      const next = removeIncident(prev, id);
      saveIncidents(next);
      return next;
    });
    if (activeIncidentId === id) handleNewIncident();
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <main className="min-h-screen text-foreground">
      <header className="border-b-2 border-border bg-surface">
        <section className="max-w-5xl mx-auto px-5 sm:px-8 py-8">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
            Conflict Buddy
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">
            Communication &amp; documentation assistant
          </h1>
          <p className="mt-3 text-sm text-muted max-w-2xl leading-relaxed">
            Describe what happened once. Get calm and boundary messages,
            court-safe wording, a factual log, and coaching notes — then save
            incidents to build a timeline you can export later.
          </p>
          <p className="mt-2 text-xs text-muted-light italic">
            Writing and documentation aid only — not legal advice or therapy.
          </p>
        </section>
      </header>

      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8 pb-28 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className={panelClass}>
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                    1
                  </span>
                  <h2 className="text-base font-semibold text-foreground">
                    Describe the situation
                  </h2>
                </div>
                {activeIncidentId && (
                  <span className="text-xs text-muted">Editing saved</span>
                )}
              </div>

              <textarea
                id="event-input"
                className={`${fieldClass} min-h-[200px] resize-y`}
                rows={8}
                placeholder="What happened, a draft message, or what you want to respond to…"
                value={event}
                onChange={(e) => setEvent(e.target.value)}
              />
            </div>

            <p className="text-xs text-muted-light">
              Use the action bar at the bottom to generate, save, or start a new
              incident.
            </p>

            {error && (
              <p className="text-sm text-red-800 bg-red-50 border-2 border-red-200 rounded-xl px-4 py-3 dark:bg-red-950 dark:text-red-200 dark:border-red-800">
                {error}
              </p>
            )}

            {learnNotice && (
              <p className="text-sm text-primary bg-primary-subtle border-2 border-primary/30 rounded-xl px-4 py-3">
                {learnNotice}
              </p>
            )}

            <details className="rounded-xl border-2 border-border bg-surface-muted p-4">
              <summary className="cursor-pointer text-sm font-medium text-foreground">
                Optional settings
              </summary>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Background context
                  </label>
                  <textarea
                    className={`${fieldClass} min-h-[80px]`}
                    rows={3}
                    placeholder="Tone or history (not copied into messages)."
                    value={baseline}
                    onChange={(e) => setBaseline(e.target.value)}
                  />
                </div>
                <div>
                  <label
                    htmlFor="event-date"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Event date
                  </label>
                  <input
                    id="event-date"
                    type="date"
                    className={`${fieldClass} max-w-xs`}
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Private notes
                  </label>
                  <textarea
                    className={`${fieldClass} min-h-[60px]`}
                    rows={2}
                    placeholder="Your notes only — not included in export by default."
                    value={privateNotes}
                    onChange={(e) => setPrivateNotes(e.target.value)}
                  />
                </div>
                <div className="border-t border-border pt-4 space-y-3">
                  <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={learnFromEdits}
                      onChange={(e) => setLearnFromEdits(e.target.checked)}
                      className="rounded border-border"
                    />
                    Learn from my edits when I save (style only, not if unsafe)
                  </label>
                  {learnedPrefs.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-foreground mb-2">
                        Learned style ({learnedPrefs.length})
                      </p>
                      <ul className="text-xs text-muted space-y-1 list-disc pl-4 max-h-32 overflow-y-auto">
                        {learnedPrefs.map((p) => (
                          <li key={p.id}>{p.text}</li>
                        ))}
                      </ul>
                      <button
                        type="button"
                        onClick={() => {
                          clearLearnedPreferences();
                          setLearnedPrefs([]);
                          setLearnNotice('Cleared learned style preferences.');
                        }}
                        className="mt-2 text-xs text-muted hover:text-primary underline"
                      >
                        Clear learned style
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </details>
          </div>

          <div className={panelClass + ' lg:sticky lg:top-6 self-start space-y-5'}>
            <h2 className="text-base font-semibold text-foreground">
              Your analysis
            </h2>
            {hasOutputs && baselineOutputs && (
              <p className="text-xs text-muted -mt-2">
                <span className="inline-flex items-center gap-1.5 mr-3">
                  <span className="inline-block px-1.5 py-0.5 rounded border border-border bg-surface-muted text-[10px] font-semibold uppercase">
                    Generated
                  </span>
                  last AI version
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-block px-1.5 py-0.5 rounded border border-amber-600/50 bg-amber-50 text-amber-900 text-[10px] font-semibold uppercase dark:bg-amber-950 dark:text-amber-200">
                    Your edit
                  </span>
                  you changed it since then
                </span>
              </p>
            )}

            <OutputField
              sectionKey="deEscalatedResponse"
              title="De-escalated response"
              description="Soft, calm — sendable."
              editableHint={editHint}
              value={outputs.deEscalatedResponse}
              placeholder="Will appear after generate…"
              minHeight="min-h-[120px]"
              copied={copied}
              onCopy={handleCopy}
              onChange={(v) => updateOutput('deEscalatedResponse', v)}
              onSectionAi={handleSectionAi}
              busy={sectionBusy === 'deEscalatedResponse'}
              source={sectionSource('deEscalatedResponse')}
              generatedBaseline={baselineText('deEscalatedResponse')}
              onMarkGenerated={markSectionGenerated}
            />

            <OutputField
              sectionKey="boundaryResponse"
              title="Boundary response"
              description="Firm, concise — sendable."
              value={outputs.boundaryResponse}
              placeholder="Will appear after generate…"
              minHeight="min-h-[120px]"
              copied={copied}
              onCopy={handleCopy}
              onChange={(v) => updateOutput('boundaryResponse', v)}
              onSectionAi={handleSectionAi}
              busy={sectionBusy === 'boundaryResponse'}
              source={sectionSource('boundaryResponse')}
              generatedBaseline={baselineText('boundaryResponse')}
              onMarkGenerated={markSectionGenerated}
            />

            <OutputField
              sectionKey="courtSafeVersion"
              title="Court-safe version"
              description="For hearing or professional — not necessarily to send."
              value={outputs.courtSafeVersion}
              placeholder="Will appear after generate…"
              copied={copied}
              onCopy={handleCopy}
              onChange={(v) => updateOutput('courtSafeVersion', v)}
              onSectionAi={handleSectionAi}
              busy={sectionBusy === 'courtSafeVersion'}
              source={sectionSource('courtSafeVersion')}
              generatedBaseline={baselineText('courtSafeVersion')}
              onMarkGenerated={markSectionGenerated}
            />

            <OutputField
              sectionKey="logEntry"
              title="Log entry"
              description="Factual chronological record for your files."
              editableHint={editHint}
              value={outputs.logEntry}
              placeholder="Will appear after generate…"
              minHeight="min-h-[160px]"
              copied={copied}
              onCopy={handleCopy}
              onChange={(v) => updateOutput('logEntry', v)}
              onSectionAi={handleSectionAi}
              busy={sectionBusy === 'logEntry'}
              source={sectionSource('logEntry')}
              generatedBaseline={baselineText('logEntry')}
              onMarkGenerated={markSectionGenerated}
            />

            <OutputList
              sectionKey="keyFacts"
              title="Key facts"
              description="Core observable facts extracted."
              items={outputs.keyFacts}
              editable={hasOutputs}
              editableHint={editHint}
              placeholder="Key facts will appear here…"
              copied={copied}
              onCopy={handleCopy}
              onChange={(items) => updateOutput('keyFacts', items)}
              onSectionAi={handleSectionAi}
              busy={sectionBusy === 'keyFacts'}
              source={sectionSource('keyFacts')}
              onMarkGenerated={markSectionGenerated}
            />

            <OutputList
              sectionKey="suggestedTags"
              title="Suggested tags"
              description="Useful labels for your timeline."
              items={outputs.suggestedTags}
              placeholder="Tags will appear here…"
              copied={copied}
              onCopy={handleCopy}
              onSectionAi={handleSectionAi}
              busy={sectionBusy === 'suggestedTags'}
              source={sectionSource('suggestedTags')}
            />

            <OutputList
              sectionKey="riskNotes"
              title="Risk notes"
              description="Why raw wording was risky."
              items={outputs.riskNotes}
              placeholder="Risk notes will appear here…"
              copied={copied}
              onCopy={handleCopy}
              onSectionAi={handleSectionAi}
              busy={sectionBusy === 'riskNotes'}
              source={sectionSource('riskNotes')}
            />

            <OutputList
              sectionKey="omittedOrSoftened"
              title="Omitted or softened"
              description="What was left out or toned down."
              items={outputs.omittedOrSoftened}
              placeholder="Notes will appear here…"
              copied={copied}
              onCopy={handleCopy}
              onSectionAi={handleSectionAi}
              busy={sectionBusy === 'omittedOrSoftened'}
              source={sectionSource('omittedOrSoftened')}
            />

            {!hasOutputs && !loading && (
              <p className="text-sm text-muted-light text-center border-2 border-dashed border-border rounded-xl py-6">
                Generate to see all sections here. You can edit and improve
                each one.
              </p>
            )}
          </div>
        </div>

        <IncidentTimeline
          incidents={incidents}
          activeIncidentId={activeIncidentId}
          showHidden={showHidden}
          onToggleShowHidden={() => setShowHidden((v) => !v)}
          onOpen={handleOpenIncident}
          onHide={handleHideIncident}
          onDelete={handleDeleteIncident}
          onCopyLog={handleCopy}
          copied={copied}
        />

        <ExportChronology
          incidents={incidents}
          copied={copied}
          onCopy={handleCopy}
        />

        {hasOutputs && (
          <ExportFullAnalysis
            eventDate={eventDate}
            rawInput={event}
            optionalContext={baseline}
            privateNotes={privateNotes}
            outputs={outputs}
            copied={copied}
            onCopy={handleCopy}
          />
        )}
      </div>

      <StickyActionBar
        canGenerate={canGenerate}
        loading={loading}
        hasOutputs={hasOutputs}
        isDirty={isDirty}
        activeIncidentId={activeIncidentId}
        editingTitle={
          hasOutputs || activeIncidentId
            ? deriveIncidentTitle(outputs, event)
            : undefined
        }
        onGenerate={handleGenerate}
        onSave={handleSaveIncident}
        onNewIncident={handleNewIncident}
      />
    </main>
  );
}

