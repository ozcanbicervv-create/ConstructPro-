/**
 * Language Selector Component
 * Allows users to switch between supported languages
 */

"use client";

import React from 'react';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useI18n, SupportedLocale } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface LanguageSelectorProps {
  className?: string;
  variant?: 'default' | 'compact';
  showFlag?: boolean;
}

const languageFlags: Record<SupportedLocale, string> = {
  en: '🇺🇸',
  tr: '🇹🇷',
  es: '🇪🇸',
  fr: '🇫🇷',
  de: '🇩🇪',
  ar: '🇸🇦',
  he: '🇮🇱',
  zh: '🇨🇳',
  ja: '🇯🇵',
  ru: '🇷🇺',
};

export function LanguageSelector({ 
  className, 
  variant = 'default',
  showFlag = true 
}: LanguageSelectorProps) {
  const { locale, changeLocale, getAvailableLocales } = useI18n();
  const availableLocales = getAvailableLocales();
  const currentLocale = availableLocales.find(l => l.code === locale);

  const handleLanguageChange = (newLocale: SupportedLocale) => {
    changeLocale(newLocale);
    
    // Announce language change for screen readers
    const localeConfig = availableLocales.find(l => l.code === newLocale);
    if (localeConfig) {
      // Create a temporary announcement element
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'assertive');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = `Language changed to ${localeConfig.name}`;
      document.body.appendChild(announcement);
      
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    }
  };

  if (variant === 'compact') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-8 w-8 p-0", className)}
            aria-label={`Current language: ${currentLocale?.name}. Click to change language.`}
          >
            {showFlag && languageFlags[locale] ? (
              <span className="text-sm">{languageFlags[locale]}</span>
            ) : (
              <Globe className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {availableLocales.map((localeOption) => (
            <DropdownMenuItem
              key={localeOption.code}
              onClick={() => handleLanguageChange(localeOption.code)}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                {showFlag && (
                  <span className="text-sm">{languageFlags[localeOption.code]}</span>
                )}
                <span>{localeOption.nativeName}</span>
              </div>
              {locale === localeOption.code && (
                <Check className="h-4 w-4" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn("justify-between", className)}
          aria-label={`Current language: ${currentLocale?.name}. Click to change language.`}
        >
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            {showFlag && languageFlags[locale] && (
              <span className="text-sm">{languageFlags[locale]}</span>
            )}
            <span>{currentLocale?.nativeName || locale.toUpperCase()}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {availableLocales.map((localeOption) => (
          <DropdownMenuItem
            key={localeOption.code}
            onClick={() => handleLanguageChange(localeOption.code)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              {showFlag && (
                <span className="text-base">{languageFlags[localeOption.code]}</span>
              )}
              <div className="flex flex-col">
                <span className="font-medium">{localeOption.nativeName}</span>
                <span className="text-xs text-muted-foreground">
                  {localeOption.name}
                </span>
              </div>
            </div>
            {locale === localeOption.code && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Hook for getting current language info
export function useCurrentLanguage() {
  const { locale, getAvailableLocales } = useI18n();
  const availableLocales = getAvailableLocales();
  const currentLocale = availableLocales.find(l => l.code === locale);
  
  return {
    locale,
    config: currentLocale,
    flag: languageFlags[locale],
    isRTL: currentLocale?.direction === 'rtl',
  };
}