/**
 * Internationalization (i18n) System
 * Supports multiple languages, RTL text, and cultural adaptations
 */

import React from 'react';

export type SupportedLocale = 
  | 'en' // English
  | 'tr' // Turkish
  | 'es' // Spanish
  | 'fr' // French
  | 'de' // German
  | 'ar' // Arabic (RTL)
  | 'he' // Hebrew (RTL)
  | 'zh' // Chinese
  | 'ja' // Japanese
  | 'ru'; // Russian

export interface LocaleConfig {
  code: SupportedLocale;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  dateFormat: string;
  timeFormat: string;
  numberFormat: {
    decimal: string;
    thousands: string;
    currency: string;
  };
  pluralRules: (count: number) => 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';
}

export interface TranslationNamespace {
  [key: string]: string | TranslationNamespace;
}

export interface Translations {
  [locale: string]: {
    [namespace: string]: TranslationNamespace;
  };
}

export interface I18nContext {
  locale: SupportedLocale;
  direction: 'ltr' | 'rtl';
  t: (key: string, params?: Record<string, any>) => string;
  formatDate: (date: Date, format?: string) => string;
  formatTime: (date: Date, format?: string) => string;
  formatNumber: (number: number) => string;
  formatCurrency: (amount: number, currency?: string) => string;
  formatRelativeTime: (date: Date) => string;
  changeLocale: (locale: SupportedLocale) => void;
  getAvailableLocales: () => LocaleConfig[];
}

// Locale configurations
const localeConfigs: Record<SupportedLocale, LocaleConfig> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    direction: 'ltr',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: 'h:mm A',
    numberFormat: {
      decimal: '.',
      thousands: ',',
      currency: '$',
    },
    pluralRules: (count) => count === 1 ? 'one' : 'other',
  },
  tr: {
    code: 'tr',
    name: 'Turkish',
    nativeName: 'Türkçe',
    direction: 'ltr',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: 'HH:mm',
    numberFormat: {
      decimal: ',',
      thousands: '.',
      currency: '₺',
    },
    pluralRules: (count) => count === 1 ? 'one' : 'other',
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    direction: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    numberFormat: {
      decimal: ',',
      thousands: '.',
      currency: '€',
    },
    pluralRules: (count) => count === 1 ? 'one' : 'other',
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    direction: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    numberFormat: {
      decimal: ',',
      thousands: ' ',
      currency: '€',
    },
    pluralRules: (count) => count <= 1 ? 'one' : 'other',
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    direction: 'ltr',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: 'HH:mm',
    numberFormat: {
      decimal: ',',
      thousands: '.',
      currency: '€',
    },
    pluralRules: (count) => count === 1 ? 'one' : 'other',
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    direction: 'rtl',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    numberFormat: {
      decimal: '.',
      thousands: ',',
      currency: 'ر.س',
    },
    pluralRules: (count) => {
      if (count === 0) return 'zero';
      if (count === 1) return 'one';
      if (count === 2) return 'two';
      if (count >= 3 && count <= 10) return 'few';
      if (count >= 11 && count <= 99) return 'many';
      return 'other';
    },
  },
  he: {
    code: 'he',
    name: 'Hebrew',
    nativeName: 'עברית',
    direction: 'rtl',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    numberFormat: {
      decimal: '.',
      thousands: ',',
      currency: '₪',
    },
    pluralRules: (count) => {
      if (count === 1) return 'one';
      if (count === 2) return 'two';
      if (count >= 3 && count <= 10) return 'few';
      return 'other';
    },
  },
  zh: {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    direction: 'ltr',
    dateFormat: 'YYYY/MM/DD',
    timeFormat: 'HH:mm',
    numberFormat: {
      decimal: '.',
      thousands: ',',
      currency: '¥',
    },
    pluralRules: () => 'other',
  },
  ja: {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    direction: 'ltr',
    dateFormat: 'YYYY/MM/DD',
    timeFormat: 'HH:mm',
    numberFormat: {
      decimal: '.',
      thousands: ',',
      currency: '¥',
    },
    pluralRules: () => 'other',
  },
  ru: {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    direction: 'ltr',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: 'HH:mm',
    numberFormat: {
      decimal: ',',
      thousands: ' ',
      currency: '₽',
    },
    pluralRules: (count) => {
      const mod10 = count % 10;
      const mod100 = count % 100;
      if (mod10 === 1 && mod100 !== 11) return 'one';
      if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'few';
      return 'many';
    },
  },
};

class I18nManager {
  private currentLocale: SupportedLocale = 'en';
  private translations: Translations = {};
  private observers: Set<(locale: SupportedLocale) => void> = new Set();
  private isClient: boolean;

  constructor() {
    this.isClient = typeof window !== 'undefined';
    if (this.isClient) {
      this.initializeI18n();
    }
  }

  private initializeI18n() {
    if (!this.isClient) return;

    // Detect browser language
    const browserLang = this.detectBrowserLanguage();
    
    // Load saved locale or use browser language
    const savedLocale = localStorage.getItem('locale') as SupportedLocale;
    this.currentLocale = savedLocale || browserLang || 'en';

    // Apply initial locale
    this.applyLocale(this.currentLocale);
  }

  private detectBrowserLanguage(): SupportedLocale {
    if (!this.isClient) return 'en';

    const browserLang = navigator.language.split('-')[0] as SupportedLocale;
    return Object.keys(localeConfigs).includes(browserLang) ? browserLang : 'en';
  }

  private applyLocale(locale: SupportedLocale) {
    if (!this.isClient) return;

    const config = localeConfigs[locale];
    const root = document.documentElement;

    // Set HTML lang and dir attributes
    root.setAttribute('lang', locale);
    root.setAttribute('dir', config.direction);

    // Apply RTL/LTR classes
    root.classList.toggle('rtl', config.direction === 'rtl');
    root.classList.toggle('ltr', config.direction === 'ltr');

    // Save locale preference
    localStorage.setItem('locale', locale);
  }

  public changeLocale(locale: SupportedLocale) {
    if (!Object.keys(localeConfigs).includes(locale)) {
      console.warn(`Unsupported locale: ${locale}`);
      return;
    }

    this.currentLocale = locale;
    this.applyLocale(locale);
    this.notifyObservers();
  }

  public getCurrentLocale(): SupportedLocale {
    return this.currentLocale;
  }

  public getLocaleConfig(locale?: SupportedLocale): LocaleConfig {
    return localeConfigs[locale || this.currentLocale];
  }

  public getAvailableLocales(): LocaleConfig[] {
    return Object.values(localeConfigs);
  }

  public subscribe(callback: (locale: SupportedLocale) => void) {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  private notifyObservers() {
    this.observers.forEach(callback => callback(this.currentLocale));
  }

  public loadTranslations(locale: SupportedLocale, namespace: string, translations: TranslationNamespace) {
    if (!this.translations[locale]) {
      this.translations[locale] = {};
    }
    this.translations[locale][namespace] = translations;
  }

  public t(key: string, params?: Record<string, any>): string {
    const [namespace, ...keyParts] = key.split('.');
    const translationKey = keyParts.join('.');

    const localeTranslations = this.translations[this.currentLocale];
    if (!localeTranslations || !localeTranslations[namespace]) {
      return key; // Return key if translation not found
    }

    let translation = this.getNestedTranslation(localeTranslations[namespace], translationKey);
    
    if (!translation) {
      // Fallback to English
      const englishTranslations = this.translations['en'];
      if (englishTranslations && englishTranslations[namespace]) {
        translation = this.getNestedTranslation(englishTranslations[namespace], translationKey);
      }
    }

    if (!translation) {
      return key; // Return key if no translation found
    }

    // Replace parameters
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(new RegExp(`{{${param}}}`, 'g'), String(value));
      });
    }

    return translation;
  }

  private getNestedTranslation(obj: TranslationNamespace, key: string): string {
    const keys = key.split('.');
    let current: any = obj;

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        return '';
      }
    }

    return typeof current === 'string' ? current : '';
  }

  public formatDate(date: Date, format?: string): string {
    if (!this.isClient) {
      return date.toLocaleDateString();
    }

    try {
      return new Intl.DateTimeFormat(this.currentLocale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(date);
    } catch {
      return date.toLocaleDateString();
    }
  }

  public formatTime(date: Date, format?: string): string {
    if (!this.isClient) {
      return date.toLocaleTimeString();
    }

    try {
      return new Intl.DateTimeFormat(this.currentLocale, {
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return date.toLocaleTimeString();
    }
  }

  public formatNumber(number: number): string {
    if (!this.isClient) {
      return number.toString();
    }

    try {
      return new Intl.NumberFormat(this.currentLocale).format(number);
    } catch {
      return number.toString();
    }
  }

  public formatCurrency(amount: number, currency?: string): string {
    const config = this.getLocaleConfig();
    const currencyCode = currency || config.numberFormat.currency;

    if (!this.isClient) {
      return `${currencyCode}${amount}`;
    }

    try {
      return new Intl.NumberFormat(this.currentLocale, {
        style: 'currency',
        currency: this.getCurrencyCode(currencyCode),
      }).format(amount);
    } catch {
      return `${currencyCode}${amount}`;
    }
  }

  private getCurrencyCode(symbol: string): string {
    const currencyMap: Record<string, string> = {
      '$': 'USD',
      '€': 'EUR',
      '₺': 'TRY',
      '¥': 'JPY',
      '₽': 'RUB',
      '₪': 'ILS',
      'ر.س': 'SAR',
    };
    return currencyMap[symbol] || 'USD';
  }

  public formatRelativeTime(date: Date): string {
    if (!this.isClient) {
      return date.toString();
    }

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    try {
      const rtf = new Intl.RelativeTimeFormat(this.currentLocale, { numeric: 'auto' });

      if (Math.abs(diffInSeconds) < 60) {
        return rtf.format(-diffInSeconds, 'second');
      } else if (Math.abs(diffInSeconds) < 3600) {
        return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
      } else if (Math.abs(diffInSeconds) < 86400) {
        return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
      } else {
        return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
      }
    } catch {
      return date.toLocaleDateString();
    }
  }

  public pluralize(key: string, count: number, params?: Record<string, any>): string {
    const config = this.getLocaleConfig();
    const pluralForm = config.pluralRules(count);
    const pluralKey = `${key}.${pluralForm}`;
    
    return this.t(pluralKey, { ...params, count });
  }
}

// Create singleton instance with lazy initialization
let i18nManagerInstance: I18nManager | null = null;

export const i18nManager = new Proxy({} as I18nManager, {
  get(target, prop) {
    if (!i18nManagerInstance) {
      i18nManagerInstance = new I18nManager();
    }
    return (i18nManagerInstance as any)[prop];
  }
});

// React hooks for i18n
export function useI18n(): I18nContext {
  const [locale, setLocale] = React.useState<SupportedLocale>(() => {
    if (typeof window !== 'undefined') {
      return i18nManager.getCurrentLocale();
    }
    return 'en';
  });

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setLocale(i18nManager.getCurrentLocale());
      return i18nManager.subscribe(setLocale);
    }
  }, []);

  const config = React.useMemo(() => {
    return localeConfigs[locale] || localeConfigs.en;
  }, [locale]);

  return {
    locale,
    direction: config.direction,
    t: i18nManager.t.bind(i18nManager),
    formatDate: i18nManager.formatDate.bind(i18nManager),
    formatTime: i18nManager.formatTime.bind(i18nManager),
    formatNumber: i18nManager.formatNumber.bind(i18nManager),
    formatCurrency: i18nManager.formatCurrency.bind(i18nManager),
    formatRelativeTime: i18nManager.formatRelativeTime.bind(i18nManager),
    changeLocale: i18nManager.changeLocale.bind(i18nManager),
    getAvailableLocales: i18nManager.getAvailableLocales.bind(i18nManager),
  };
}

// Translation helper for components
export function useTranslation(namespace: string) {
  const { t, locale } = useI18n();

  const translate = React.useCallback((key: string, params?: Record<string, any>) => {
    return t(`${namespace}.${key}`, params);
  }, [t, namespace]);

  return { t: translate, locale };
}