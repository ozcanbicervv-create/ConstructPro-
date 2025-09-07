/**
 * Client-side Providers
 * Providers that need to run only on the client side
 */

"use client";

import React from 'react';

import { AccessibilityProvider } from '@/components/providers/accessibility-provider';
import { I18nProvider } from '@/components/providers/i18n-provider';

interface ClientProvidersProps {
  children: React.ReactNode;
}

const skipLinks = [
  { href: "#main-content", label: "Skip to main content", shortcut: "Alt+M" },
  { href: "#navigation", label: "Skip to navigation", shortcut: "Alt+N" },
  { href: "#search", label: "Skip to search", shortcut: "Alt+S" },
  { href: "#footer", label: "Skip to footer", shortcut: "Alt+F" },
];

export function ClientProviders({ children }: ClientProvidersProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <I18nProvider>
      <AccessibilityProvider skipLinks={skipLinks}>
        {children}
      </AccessibilityProvider>
    </I18nProvider>
  );
}