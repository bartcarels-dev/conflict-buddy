'use client';

import { LOCALE_OPTIONS } from '@/lib/i18n';
import { useI18n } from '@/app/components/I18nProvider';

export function LanguageSwitcher() {
  const { locale, setLocale, messages } = useI18n();

  return (
    <div className="flex items-center gap-2 shrink-0">
      <label htmlFor="ui-locale" className="text-xs font-medium text-muted">
        {messages.language.label}
      </label>
      <select
        id="ui-locale"
        value={locale}
        onChange={(e) => setLocale(e.target.value as typeof locale)}
        aria-label={messages.language.aria}
        className="rounded-lg border-2 border-border bg-surface px-2.5 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20"
      >
        {LOCALE_OPTIONS.map((opt) => (
          <option key={opt.code} value={opt.code}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
