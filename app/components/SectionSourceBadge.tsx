'use client';

export type SectionSource = 'generated' | 'edited';

type Props = {
  source: SectionSource | null;
};

export function SectionSourceBadge({ source }: Props) {
  if (!source) return null;

  const isEdited = source === 'edited';

  return (
    <span
      className={[
        'text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded border shrink-0',
        isEdited
          ? 'border-amber-600/50 bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-500/50'
          : 'border-border bg-surface-muted text-muted',
      ].join(' ')}
      title={
        isEdited
          ? 'You changed this since the last generated version'
          : 'Matches the last generated version'
      }
    >
      {isEdited ? 'Your edit' : 'Generated'}
    </span>
  );
}
