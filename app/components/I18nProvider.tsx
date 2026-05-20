'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  detectBrowserUiLocale,
  getMessages,
  readStoredLocale,
  storeLocale,
} from '@/lib/i18n';
import type { Messages, UiLocale } from '@/lib/i18n';

type I18nContextValue = {
  locale: UiLocale;
  messages: Messages;
  setLocale: (locale: UiLocale) => void;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<UiLocale>('en');

  useEffect(() => {
    const saved = readStoredLocale();
    setLocaleState(saved ?? detectBrowserUiLocale());
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: UiLocale) => {
    setLocaleState(next);
    storeLocale(next);
  }, []);

  const value = useMemo(
    () => ({
      locale,
      messages: getMessages(locale),
      setLocale,
    }),
    [locale, setLocale]
  );

  return (
    <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
