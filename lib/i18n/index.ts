export type { Messages, UiLocale } from '@/lib/i18n/types';
export { UI_LOCALES } from '@/lib/i18n/types';
export { getMessages, LOCALE_OPTIONS } from '@/lib/i18n/messages';

const STORAGE_KEY = 'conflict-buddy-ui-locale';

export function isUiLocale(value: string): value is import('@/lib/i18n/types').UiLocale {
  return ['en', 'nl', 'de', 'fr', 'es', 'pt'].includes(value);
}

/** Guess UI language from browser (not message content). */
export function detectBrowserUiLocale(): import('@/lib/i18n/types').UiLocale {
  if (typeof navigator === 'undefined') return 'en';
  const lang = (navigator.language || 'en').toLowerCase();
  if (lang.startsWith('nl')) return 'nl';
  if (lang.startsWith('de')) return 'de';
  if (lang.startsWith('fr')) return 'fr';
  if (lang.startsWith('es')) return 'es';
  if (lang.startsWith('pt')) return 'pt';
  return 'en';
}

export function readStoredLocale(): import('@/lib/i18n/types').UiLocale | null {
  if (typeof localStorage === 'undefined') return null;
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved && isUiLocale(saved) ? saved : null;
}

export function storeLocale(locale: import('@/lib/i18n/types').UiLocale): void {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    /* private mode */
  }
}
