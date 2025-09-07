/**
 * Internationalization Provider
 * Provides i18n context and loads translations
 */

"use client";

import React from 'react';
import { SupportedLocale } from '@/lib/i18n';

interface I18nProviderProps {
  children: React.ReactNode;
  defaultLocale?: SupportedLocale;
}

export function I18nProvider({ children, defaultLocale = 'en' }: I18nProviderProps) {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
    
    // Only load translations on client side
    if (typeof window !== 'undefined') {
      import('@/lib/i18n').then(({ i18nManager }) => {
        import('@/translations/en').then(({ enTranslations }) => {
          i18nManager.loadTranslations('en', 'common', enTranslations.common);
          i18nManager.loadTranslations('en', 'accessibility', enTranslations.accessibility);
          i18nManager.loadTranslations('en', 'projects', enTranslations.projects);
          i18nManager.loadTranslations('en', 'tasks', enTranslations.tasks);
          i18nManager.loadTranslations('en', 'materials', enTranslations.materials);
          i18nManager.loadTranslations('en', 'auth', enTranslations.auth);
        });

        import('@/translations/tr').then(({ trTranslations }) => {
          i18nManager.loadTranslations('tr', 'common', trTranslations.common);
          i18nManager.loadTranslations('tr', 'accessibility', trTranslations.accessibility);
          i18nManager.loadTranslations('tr', 'projects', trTranslations.projects);
          i18nManager.loadTranslations('tr', 'tasks', trTranslations.tasks);
          i18nManager.loadTranslations('tr', 'materials', trTranslations.materials);
          i18nManager.loadTranslations('tr', 'auth', trTranslations.auth);
        });

        import('@/translations/ar').then(({ arTranslations }) => {
          i18nManager.loadTranslations('ar', 'common', arTranslations.common);
          i18nManager.loadTranslations('ar', 'accessibility', arTranslations.accessibility);
          i18nManager.loadTranslations('ar', 'projects', arTranslations.projects);
          i18nManager.loadTranslations('ar', 'tasks', arTranslations.tasks);
          i18nManager.loadTranslations('ar', 'materials', arTranslations.materials);
          i18nManager.loadTranslations('ar', 'auth', arTranslations.auth);
        });

        // Set default locale
        const currentLocale = i18nManager.getCurrentLocale();
        if (!currentLocale || currentLocale === 'en') {
          i18nManager.changeLocale(defaultLocale);
        }
      });
    }
  }, [defaultLocale]);

  return <>{children}</>;
}