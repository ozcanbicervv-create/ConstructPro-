/**
 * Internationalization Testing Page
 * Demonstrates i18n features including RTL support
 */

"use client";

import { 
  Globe, 
  Calendar, 
  DollarSign, 
  Clock, 
  Users,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function I18nTestPage() {
  const [currentLocale, setCurrentLocale] = useState('en');
  const [sampleDate] = useState(new Date());
  const [sampleAmount] = useState(1234.56);
  const [sampleCount] = useState(42);

  const locales = [
    { code: 'en', name: 'English', flag: '🇺🇸', dir: 'ltr' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷', dir: 'ltr' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  ];

  const translations = {
    en: {
      title: 'Internationalization Demo',
      dashboard: 'Dashboard',
      projects: 'Projects',
      tasks: 'Tasks',
      settings: 'Settings',
      save: 'Save',
      cancel: 'Cancel',
      email: 'Email',
      password: 'Password',
    },
    tr: {
      title: 'Uluslararasılaştırma Demo',
      dashboard: 'Kontrol Paneli',
      projects: 'Projeler',
      tasks: 'Görevler',
      settings: 'Ayarlar',
      save: 'Kaydet',
      cancel: 'İptal',
      email: 'E-posta',
      password: 'Şifre',
    },
    ar: {
      title: 'عرض الترجمة',
      dashboard: 'لوحة التحكم',
      projects: 'المشاريع',
      tasks: 'المهام',
      settings: 'الإعدادات',
      save: 'حفظ',
      cancel: 'إلغاء',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
    },
  };

  const t = (key: string) => {
    return translations[currentLocale as keyof typeof translations]?.[key as keyof typeof translations.en] || key;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(currentLocale).format(date);
  };

  const formatCurrency = (amount: number) => {
    const currencyMap = {
      en: 'USD',
      tr: 'TRY',
      ar: 'SAR',
    };
    return new Intl.NumberFormat(currentLocale, {
      style: 'currency',
      currency: currencyMap[currentLocale as keyof typeof currencyMap] || 'USD',
    }).format(amount);
  };

  const formatNumber = (number: number) => {
    return new Intl.NumberFormat(currentLocale).format(number);
  };

  const currentLocaleInfo = locales.find(l => l.code === currentLocale);
  const isRTL = currentLocaleInfo?.dir === 'rtl';

  return (
    <div className={`min-h-screen bg-background ${isRTL ? 'rtl' : 'ltr'}`} dir={currentLocaleInfo?.dir}>
      <main id="main-content" className="container mx-auto p-6 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-2">
            <Globe className="h-8 w-8" />
            {t('title')}
          </h1>
          <p className="text-lg text-muted-foreground">
            Current Language: {currentLocaleInfo?.flag} {currentLocale.toUpperCase()} | Direction: {currentLocaleInfo?.dir.toUpperCase()}
          </p>
        </div>

        {/* Language Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Language Selection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {locales.map((locale) => (
                <Button
                  key={locale.code}
                  variant={currentLocale === locale.code ? "default" : "outline"}
                  onClick={() => setCurrentLocale(locale.code)}
                  className="flex items-center gap-2"
                >
                  <span className="text-lg">{locale.flag}</span>
                  {locale.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Language Information */}
        <Card>
          <CardHeader>
            <CardTitle>Language Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Current Locale</Label>
                <div className="p-2 bg-muted rounded">{currentLocale}</div>
              </div>
              <div className="space-y-2">
                <Label>Text Direction</Label>
                <div className="p-2 bg-muted rounded flex items-center gap-2">
                  {isRTL ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                  {currentLocaleInfo?.dir.toUpperCase()}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Is RTL</Label>
                <div className="p-2 bg-muted rounded flex items-center gap-2">
                  {isRTL ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4 text-red-500" />}
                  {isRTL ? 'Yes' : 'No'}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Flag</Label>
                <div className="p-2 bg-muted rounded text-2xl">{currentLocaleInfo?.flag}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Translation Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Translation Examples</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Navigation Terms</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Dashboard</div>
                  <div className="font-medium">{t('dashboard')}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Projects</div>
                  <div className="font-medium">{t('projects')}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Tasks</div>
                  <div className="font-medium">{t('tasks')}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Settings</div>
                  <div className="font-medium">{t('settings')}</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Action Buttons</h3>
              <div className="flex flex-wrap gap-2">
                <Button variant="default">{t('save')}</Button>
                <Button variant="outline">{t('cancel')}</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formatting Examples */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Localized Formatting
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Date & Time Formatting</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date
                  </Label>
                  <div className="p-2 bg-muted rounded">{formatDate(sampleDate)}</div>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Time
                  </Label>
                  <div className="p-2 bg-muted rounded">{sampleDate.toLocaleTimeString(currentLocale)}</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Number & Currency Formatting</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Number ({sampleCount})
                  </Label>
                  <div className="p-2 bg-muted rounded">{formatNumber(sampleCount)}</div>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Currency ({sampleAmount})
                  </Label>
                  <div className="p-2 bg-muted rounded">{formatCurrency(sampleAmount)}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Localized Forms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('email')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t('password')}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t('password')}
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="default">
                {t('save')}
              </Button>
              <Button variant="outline">
                {t('cancel')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* RTL Layout Test */}
        {isRTL && (
          <Card>
            <CardHeader>
              <CardTitle>RTL Layout Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>This section demonstrates RTL (Right-to-Left) layout support.</p>
              
              <div className="flex items-center gap-4">
                <Button variant="outline" className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4" />
                  Next
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-muted rounded">First</div>
                <div className="p-4 bg-muted rounded">Second</div>
                <div className="p-4 bg-muted rounded">Third</div>
              </div>

              <div className="text-right">
                <p>This text should be right-aligned in RTL mode.</p>
                <p>Numbers: 123 456 789</p>
                <p>Mixed: Hello مرحبا World عالم</p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}