import type { Messages, UiLocale } from '@/lib/i18n/types';
import { de } from '@/lib/i18n/messages/de';
import { en } from '@/lib/i18n/messages/en';
import { es } from '@/lib/i18n/messages/es';
import { fr } from '@/lib/i18n/messages/fr';
import { nl } from '@/lib/i18n/messages/nl';
import { pt } from '@/lib/i18n/messages/pt';

const catalogs: Record<UiLocale, Messages> = { en, nl, de, fr, es, pt };

export function getMessages(locale: UiLocale): Messages {
  return catalogs[locale] ?? catalogs.en;
}

export const LOCALE_OPTIONS: { code: UiLocale; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'de', label: 'Deutsch' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
  { code: 'pt', label: 'Português' },
];
