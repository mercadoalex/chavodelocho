import React, { createContext, useContext, useState, useCallback } from 'react';
import en from './en.json';
import es from './es.json';
import pt from './pt.json';

export type SupportedLocale = 'en' | 'es' | 'pt';

type TranslationMap = Record<string, string>;

const translations: Record<SupportedLocale, TranslationMap> = { en, es, pt };

/**
 * Resolve a translation key for a given locale, with optional parameter interpolation.
 * Returns the key itself if not found.
 */
export function t(
  key: string,
  locale: SupportedLocale = 'en',
  params?: Record<string, string>
): string {
  const map = translations[locale] ?? translations.en;
  let value = map[key];
  if (value === undefined) {
    return key;
  }
  if (params) {
    for (const [paramName, paramValue] of Object.entries(params)) {
      value = value.replace(new RegExp(`\\{\\{${paramName}\\}\\}`, 'g'), paramValue);
    }
  }
  return value;
}

interface I18nContextValue {
  t: (key: string, params?: Record<string, string>) => string;
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<SupportedLocale>('en');

  const boundT = useCallback(
    (key: string, params?: Record<string, string>) => t(key, locale, params),
    [locale]
  );

  return React.createElement(
    I18nContext.Provider,
    { value: { t: boundT, locale, setLocale } },
    children
  );
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (context === null) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

export { I18nContext };
