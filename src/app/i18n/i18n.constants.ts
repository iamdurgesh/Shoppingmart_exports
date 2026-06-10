export const SUPPORTED_LANGUAGES = ['en', 'de', 'fr'] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export interface LanguageOption {
  readonly code: SupportedLanguage;
  readonly labelKey: string;
  readonly shortLabel: string;
}

export const LANGUAGE_OPTIONS: readonly LanguageOption[] = [
  { code: 'en', labelKey: 'language.english', shortLabel: 'EN' },
  { code: 'de', labelKey: 'language.german', shortLabel: 'DE' },
  { code: 'fr', labelKey: 'language.french', shortLabel: 'FR' },
];

const LANGUAGE_STORAGE_KEY = 'shoppingmart-exports.language';

export function isSupportedLanguage(value: string | null | undefined): value is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(value as SupportedLanguage);
}

export function getInitialLanguage(): SupportedLanguage {
  const storedLanguage = readStoredLanguage();

  if (storedLanguage) {
    return storedLanguage;
  }

  const browserLanguage = globalThis.navigator?.language?.slice(0, 2).toLowerCase();

  return isSupportedLanguage(browserLanguage) ? browserLanguage : 'en';
}

export function persistLanguage(language: SupportedLanguage): void {
  try {
    globalThis.localStorage?.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Language preference persistence is optional; the active session still works.
  }
}

function readStoredLanguage(): SupportedLanguage | null {
  try {
    const storedLanguage = globalThis.localStorage?.getItem(LANGUAGE_STORAGE_KEY);
    return isSupportedLanguage(storedLanguage) ? storedLanguage : null;
  } catch {
    return null;
  }
}
