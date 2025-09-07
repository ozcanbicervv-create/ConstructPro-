/**
 * Accessibility Provider
 * Provides accessibility context and features throughout the application
 */

"use client";

import * as React from "react";

import { useLiveAnnouncer } from "@/components/ui/live-region";
import { SkipLinks } from "@/components/ui/skip-links";
import { accessibilityManager, AccessibilityPreferences } from "@/lib/accessibility";

interface AccessibilityContextType {
  preferences: AccessibilityPreferences;
  updatePreference: <K extends keyof AccessibilityPreferences>(
    key: K,
    value: AccessibilityPreferences[K]
  ) => void;
  announce: (message: string, priority?: "polite" | "assertive") => void;
  announceError: (message: string) => void;
  announceSuccess: (message: string) => void;
  announcePageChange: (title: string) => void;
  focusManager: {
    trapFocus: (element: HTMLElement) => () => void;
    restoreFocus: (element?: HTMLElement) => void;
    getFocusableElements: (container: HTMLElement) => HTMLElement[];
    setFocusVisible: (element: HTMLElement) => void;
  };
  keyboardManager: {
    registerShortcut: (key: string, callback: () => void, description: string) => () => void;
    enableSkipLinks: () => void;
    handleArrowNavigation: (container: HTMLElement, orientation: 'horizontal' | 'vertical') => void;
  };
  checkContrastRatio: (foreground: string, background: string) => number;
  validateAccessibility: (element: HTMLElement) => string[];
}

const AccessibilityContext = React.createContext<AccessibilityContextType | null>(null);

interface AccessibilityProviderProps {
  children: React.ReactNode;
  skipLinks?: Array<{ href: string; label: string; shortcut?: string }>;
}

export function AccessibilityProvider({ children, skipLinks }: AccessibilityProviderProps) {
  const [preferences, setPreferences] = React.useState<AccessibilityPreferences>(() => {
    // Only access accessibilityManager on client side
    if (typeof window !== 'undefined') {
      return accessibilityManager.getPreferences();
    }
    // Return default preferences for SSR
    return {
      theme: 'system',
      fontSize: 16,
      fontFamily: 'default',
      lineHeight: 1.5,
      letterSpacing: 0,
      colorBlindness: 'none',
      reducedMotion: false,
      stickyKeys: false,
      slowKeys: false,
      mouseKeys: false,
      clickDelay: 0,
      focusIndicators: true,
      simplifiedUI: false,
      autoSave: true,
      confirmActions: false,
      soundEffects: true,
      screenReader: false,
      audioDescriptions: false,
      keyboardNavigation: true,
      skipLinks: true,
      breadcrumbs: true
    };
  });

  const {
    announce,
    announceError,
    announceSuccess,
    announcePageChange,
    LiveRegions,
  } = useLiveAnnouncer();

  // Subscribe to preference changes (client-side only)
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      // Update preferences from manager on client side
      setPreferences(accessibilityManager.getPreferences());
      return accessibilityManager.subscribe(setPreferences);
    }
  }, []);

  // Apply global accessibility styles
  React.useEffect(() => {
    const root = document.documentElement;
    
    // Apply CSS custom properties for accessibility
    root.style.setProperty('--a11y-font-size', `${preferences.fontSize}px`);
    root.style.setProperty('--a11y-line-height', preferences.lineHeight.toString());
    root.style.setProperty('--a11y-letter-spacing', `${preferences.letterSpacing}px`);
    
    // Apply theme classes
    root.classList.toggle('reduced-motion', preferences.reducedMotion);
    root.classList.toggle('enhanced-focus', preferences.focusIndicators);
    root.classList.toggle('simplified-ui', preferences.simplifiedUI);
    root.classList.toggle('high-contrast', preferences.theme === 'high-contrast');
    
    // Apply font family
    const fontFamilyMap = {
      default: 'Inter, system-ui, sans-serif',
      dyslexic: 'OpenDyslexic, sans-serif',
      mono: 'JetBrains Mono, monospace'
    };
    root.style.setProperty('--a11y-font-family', fontFamilyMap[preferences.fontFamily]);
  }, [preferences]);

  // Initialize keyboard shortcuts
  React.useEffect(() => {
    const keyboardManager = accessibilityManager.getKeyboardManager();
    
    // Global shortcuts
    const shortcuts = [
      keyboardManager.registerShortcut('/', () => {
        const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          announce('Search focused');
        }
      }, 'Focus search'),
      
      keyboardManager.registerShortcut('?', () => {
        // Show keyboard shortcuts help
        announce('Keyboard shortcuts: Press / to focus search, Escape to close modals');
      }, 'Show keyboard shortcuts'),
      
      keyboardManager.registerShortcut('Escape', () => {
        const activeModal = document.querySelector('[role="dialog"]:not([aria-hidden="true"])');
        if (activeModal) {
          const closeButton = activeModal.querySelector('[data-close-modal]') as HTMLButtonElement;
          if (closeButton) {
            closeButton.click();
            announce('Modal closed');
          }
        }
      }, 'Close modal'),
    ];

    return () => {
      shortcuts.forEach(cleanup => cleanup());
    };
  }, [announce]);

  // Handle page navigation announcements
  React.useEffect(() => {
    const handleRouteChange = () => {
      const title = document.title;
      announcePageChange(title);
    };

    // Listen for title changes (Next.js route changes)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.target === document.querySelector('title')) {
          handleRouteChange();
        }
      });
    });

    const titleElement = document.querySelector('title');
    if (titleElement) {
      observer.observe(titleElement, { childList: true });
    }

    return () => observer.disconnect();
  }, [announcePageChange]);

  const contextValue: AccessibilityContextType = React.useMemo(() => {
    const isClient = typeof window !== 'undefined';
    
    return {
      preferences,
      updatePreference: isClient ? accessibilityManager.updatePreference.bind(accessibilityManager) : () => {},
      announce,
      announceError,
      announceSuccess,
      announcePageChange,
      focusManager: isClient ? accessibilityManager.getFocusManager() : {
        trapFocus: () => () => {},
        restoreFocus: () => {},
        getFocusableElements: () => [],
        setFocusVisible: () => {},
      },
      keyboardManager: isClient ? accessibilityManager.getKeyboardManager() : {
        registerShortcut: () => () => {},
        enableSkipLinks: () => {},
        handleArrowNavigation: () => {},
      },
      checkContrastRatio: isClient ? accessibilityManager.checkContrastRatio.bind(accessibilityManager) : () => 1,
      validateAccessibility: isClient ? accessibilityManager.validateAccessibility.bind(accessibilityManager) : () => [],
    };
  }, [
    preferences,
    announce,
    announceError,
    announceSuccess,
    announcePageChange,
  ]);

  return (
    <AccessibilityContext.Provider value={contextValue}>
      <SkipLinks links={skipLinks} />
      <LiveRegions />
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibilityContext() {
  const context = React.useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibilityContext must be used within an AccessibilityProvider');
  }
  return context;
}

// Re-export the hook from the lib for convenience
export { useAccessibility } from "@/lib/accessibility";