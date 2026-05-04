import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import de from './locales/de.json'
import hi from './locales/hi.json'

export const SUPPORTED_LOCALES = [
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
  { code: 'hi', label: 'हिन्दी' },
] as const

export type LocaleCode = typeof SUPPORTED_LOCALES[number]['code']

const STORAGE_KEY = 'datex-workbench-locale'

function getInitialLocale(): LocaleCode {
  const stored = localStorage.getItem(STORAGE_KEY) as LocaleCode | null
  if (stored && SUPPORTED_LOCALES.some(l => l.code === stored)) {
    return stored
  }
  // Try browser language
  const browserLang = navigator.language.slice(0, 2) as LocaleCode
  if (SUPPORTED_LOCALES.some(l => l.code === browserLang)) {
    return browserLang
  }
  return 'en'
}

export const i18n = createI18n({
  legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: 'en',
  messages: { en, de, hi },
})

export function setLocale(locale: LocaleCode) {
  i18n.global.locale.value = locale
  localStorage.setItem(STORAGE_KEY, locale)
  document.documentElement.lang = locale
}