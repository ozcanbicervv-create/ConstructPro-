/**
 * Comprehensive Accessibility System
 * Implements WCAG 2.1 AA compliance features
 */

export interface AccessibilityPreferences {
  // Visual
  theme: 'light' | 'dark' | 'system' | 'high-contrast';
  fontSize: number;
  fontFamily: 'default' | 'dyslexic' | 'mono';
  lineHeight: number;
  letterSpacing: number;
  colorBlindness: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  
  // Motor
  reducedMotion: boolean;
  stickyKeys: boolean;
  slowKeys: boolean;
  mouseKeys: boolean;
  clickDelay: number;
  
  // Cognitive
  focusIndicators: boolean;
  simplifiedUI: boolean;
  autoSave: boolean;
  confirmActions: boolean;
  
  // Audio
  soundEffects: boolean;
  screenReader: boolean;
  audioDescriptions: boolean;
  
  // Navigation
  keyboardNavigation: boolean;
  skipLinks: boolean;
  breadcrumbs: boolean;
}

export interface FocusManager {
  trapFocus: (element: HTMLElement) => () => void;
  restoreFocus: (element?: HTMLElement) => void;
  getFocusableElements: (container: HTMLElement) => HTMLElement[];
  setFocusVisible: (element: HTMLElement) => void;
}

export interface ScreenReaderAnnouncer {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  announcePageChange: (title: string) => void;
  announceError: (message: string) => void;
  announceSuccess: (message: string) => void;
}

export interface KeyboardNavigationManager {
  registerShortcut: (key: string, callback: () => void, description: string) => () => void;
  enableSkipLinks: () => void;
  handleArrowNavigation: (container: HTMLElement, orientation: 'horizontal' | 'vertical') => void;
}

class AccessibilityManager {
  private preferences: AccessibilityPreferences;
  private focusManager: FocusManager;
  private screenReader: ScreenReaderAnnouncer;
  private keyboardManager: KeyboardNavigationManager;
  private observers: Set<(prefs: AccessibilityPreferences) => void> = new Set();
  private isClient: boolean;

  constructor() {
    this.isClient = typeof window !== 'undefined';
    this.preferences = this.getDefaultPreferences();
    
    if (this.isClient) {
      this.focusManager = this.createFocusManager();
      this.screenReader = this.createScreenReaderAnnouncer();
      this.keyboardManager = this.createKeyboardNavigationManager();
      this.initializeAccessibility();
    } else {
      // Server-side fallbacks
      this.focusManager = this.createServerFocusManager();
      this.screenReader = this.createServerScreenReaderAnnouncer();
      this.keyboardManager = this.createServerKeyboardNavigationManager();
    }
  }

  private getDefaultPreferences(): AccessibilityPreferences {
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
  }

  private initializeAccessibility() {
    if (!this.isClient) return;

    // Load preferences from localStorage
    try {
      const saved = localStorage.getItem('accessibility-preferences');
      if (saved) {
        this.preferences = { ...this.preferences, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.warn('Failed to load accessibility preferences:', error);
    }

    // Apply initial preferences
    this.applyPreferences();

    // Listen for system preference changes
    this.listenForSystemChanges();

    // Initialize keyboard shortcuts
    this.initializeKeyboardShortcuts();

    // Add color blindness filters to DOM
    this.addColorBlindnessFilters();
  }

  private createServerFocusManager(): FocusManager {
    return {
      trapFocus: () => () => {},
      restoreFocus: () => {},
      getFocusableElements: () => [],
      setFocusVisible: () => {},
    };
  }

  private createServerScreenReaderAnnouncer(): ScreenReaderAnnouncer {
    return {
      announce: () => {},
      announcePageChange: () => {},
      announceError: () => {},
      announceSuccess: () => {},
    };
  }

  private createServerKeyboardNavigationManager(): KeyboardNavigationManager {
    return {
      registerShortcut: () => () => {},
      enableSkipLinks: () => {},
      handleArrowNavigation: () => {},
    };
  }

  private createFocusManager(): FocusManager {
    let lastFocusedElement: HTMLElement | null = null;

    return {
      trapFocus: (element: HTMLElement) => {
        const focusableElements = this.getFocusableElements(element);
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'Tab') {
            if (e.shiftKey) {
              if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement?.focus();
              }
            } else {
              if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement?.focus();
              }
            }
          }
        };

        element.addEventListener('keydown', handleKeyDown);
        firstElement?.focus();

        return () => {
          element.removeEventListener('keydown', handleKeyDown);
        };
      },

      restoreFocus: (element?: HTMLElement) => {
        const target = element || lastFocusedElement;
        if (target && document.contains(target)) {
          target.focus();
        }
      },

      getFocusableElements: (container: HTMLElement) => {
        return this.getFocusableElements(container);
      },

      setFocusVisible: (element: HTMLElement) => {
        element.setAttribute('data-focus-visible', 'true');
        element.addEventListener('blur', () => {
          element.removeAttribute('data-focus-visible');
        }, { once: true });
      }
    };
  }

  private getFocusableElements(container: HTMLElement): HTMLElement[] {
    const selector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    return Array.from(container.querySelectorAll(selector)) as HTMLElement[];
  }

  private createScreenReaderAnnouncer(): ScreenReaderAnnouncer {
    const createAnnouncer = (priority: 'polite' | 'assertive') => {
      const announcer = document.createElement('div');
      announcer.setAttribute('aria-live', priority);
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      announcer.style.cssText = `
        position: absolute !important;
        width: 1px !important;
        height: 1px !important;
        padding: 0 !important;
        margin: -1px !important;
        overflow: hidden !important;
        clip: rect(0, 0, 0, 0) !important;
        white-space: nowrap !important;
        border: 0 !important;
      `;
      document.body.appendChild(announcer);
      return announcer;
    };

    const politeAnnouncer = createAnnouncer('polite');
    const assertiveAnnouncer = createAnnouncer('assertive');

    return {
      announce: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
        const announcer = priority === 'assertive' ? assertiveAnnouncer : politeAnnouncer;
        announcer.textContent = '';
        setTimeout(() => {
          announcer.textContent = message;
        }, 100);
      },

      announcePageChange: (title: string) => {
        this.screenReader.announce(`Navigated to ${title}`, 'assertive');
      },

      announceError: (message: string) => {
        this.screenReader.announce(`Error: ${message}`, 'assertive');
      },

      announceSuccess: (message: string) => {
        this.screenReader.announce(`Success: ${message}`, 'polite');
      }
    };
  }

  private createKeyboardNavigationManager(): KeyboardNavigationManager {
    const shortcuts = new Map<string, { callback: () => void; description: string }>();

    return {
      registerShortcut: (key: string, callback: () => void, description: string) => {
        shortcuts.set(key, { callback, description });

        const handleKeyDown = (e: KeyboardEvent) => {
          const shortcut = shortcuts.get(e.key);
          if (shortcut && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            shortcut.callback();
          }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
          shortcuts.delete(key);
          document.removeEventListener('keydown', handleKeyDown);
        };
      },

      enableSkipLinks: () => {
        const skipLinks = document.createElement('div');
        skipLinks.className = 'skip-links';
        skipLinks.innerHTML = `
          <a href="#main-content" class="skip-link">Skip to main content</a>
          <a href="#navigation" class="skip-link">Skip to navigation</a>
          <a href="#footer" class="skip-link">Skip to footer</a>
        `;

        const style = document.createElement('style');
        style.textContent = `
          .skip-links {
            position: absolute;
            top: -40px;
            left: 6px;
            z-index: 1000;
          }
          .skip-link {
            position: absolute;
            top: -40px;
            left: 6px;
            background: #000;
            color: #fff;
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
            z-index: 1001;
          }
          .skip-link:focus {
            top: 6px;
          }
        `;

        document.head.appendChild(style);
        document.body.insertBefore(skipLinks, document.body.firstChild);
      },

      handleArrowNavigation: (container: HTMLElement, orientation: 'horizontal' | 'vertical') => {
        const focusableElements = this.getFocusableElements(container);

        const handleKeyDown = (e: KeyboardEvent) => {
          const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
          if (currentIndex === -1) return;

          let nextIndex = currentIndex;

          if (orientation === 'horizontal') {
            if (e.key === 'ArrowLeft') {
              nextIndex = currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1;
            } else if (e.key === 'ArrowRight') {
              nextIndex = currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0;
            }
          } else {
            if (e.key === 'ArrowUp') {
              nextIndex = currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1;
            } else if (e.key === 'ArrowDown') {
              nextIndex = currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0;
            }
          }

          if (nextIndex !== currentIndex) {
            e.preventDefault();
            focusableElements[nextIndex]?.focus();
          }
        };

        container.addEventListener('keydown', handleKeyDown);
        return () => container.removeEventListener('keydown', handleKeyDown);
      }
    };
  }

  private listenForSystemChanges() {
    if (!this.isClient) return;

    // Listen for prefers-reduced-motion changes
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionQuery.addEventListener('change', (e) => {
      if (this.preferences.theme === 'system') {
        this.updatePreference('reducedMotion', e.matches);
      }
    });

    // Listen for prefers-color-scheme changes
    const colorQuery = window.matchMedia('(prefers-color-scheme: dark)');
    colorQuery.addEventListener('change', () => {
      if (this.preferences.theme === 'system') {
        this.applyTheme();
      }
    });

    // Listen for prefers-contrast changes
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    contrastQuery.addEventListener('change', (e) => {
      if (e.matches && this.preferences.theme === 'system') {
        this.updatePreference('theme', 'high-contrast');
      }
    });
  }

  private initializeKeyboardShortcuts() {
    if (!this.isClient) return;
    
    // Global keyboard shortcuts
    this.keyboardManager.registerShortcut('/', () => {
      const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement;
      searchInput?.focus();
    }, 'Focus search');

    this.keyboardManager.registerShortcut('?', () => {
      this.showKeyboardShortcuts();
    }, 'Show keyboard shortcuts');

    this.keyboardManager.registerShortcut('Escape', () => {
      const activeModal = document.querySelector('[role="dialog"][aria-hidden="false"]');
      if (activeModal) {
        const closeButton = activeModal.querySelector('[data-close-modal]') as HTMLButtonElement;
        closeButton?.click();
      }
    }, 'Close modal');
  }

  private addColorBlindnessFilters() {
    if (!this.isClient) return;
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.position = 'absolute';
    svg.style.width = '0';
    svg.style.height = '0';
    svg.innerHTML = `
      <defs>
        <filter id="protanopia-filter">
          <feColorMatrix values="0.567,0.433,0,0,0 0.558,0.442,0,0,0 0,0.242,0.758,0,0 0,0,0,1,0"/>
        </filter>
        <filter id="deuteranopia-filter">
          <feColorMatrix values="0.625,0.375,0,0,0 0.7,0.3,0,0,0 0,0.3,0.7,0,0 0,0,0,1,0"/>
        </filter>
        <filter id="tritanopia-filter">
          <feColorMatrix values="0.95,0.05,0,0,0 0,0.433,0.567,0,0 0,0.475,0.525,0,0 0,0,0,1,0"/>
        </filter>
      </defs>
    `;
    document.body.appendChild(svg);
  }

  private showKeyboardShortcuts() {
    // Implementation for showing keyboard shortcuts modal
    this.screenReader.announce('Keyboard shortcuts dialog opened');
  }

  public updatePreference<K extends keyof AccessibilityPreferences>(
    key: K,
    value: AccessibilityPreferences[K]
  ) {
    this.preferences[key] = value;
    this.savePreferences();
    this.applyPreferences();
    this.notifyObservers();
  }

  public getPreferences(): AccessibilityPreferences {
    return { ...this.preferences };
  }

  public subscribe(callback: (prefs: AccessibilityPreferences) => void) {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  private notifyObservers() {
    this.observers.forEach(callback => callback(this.preferences));
  }

  private savePreferences() {
    if (!this.isClient) return;
    
    try {
      localStorage.setItem('accessibility-preferences', JSON.stringify(this.preferences));
    } catch (error) {
      console.warn('Failed to save accessibility preferences:', error);
    }
  }

  private applyPreferences() {
    this.applyTheme();
    this.applyTypography();
    this.applyMotion();
    this.applyColorBlindness();
    this.applyFocusIndicators();
  }

  private applyTheme() {
    if (!this.isClient) return;
    
    const root = document.documentElement;
    
    if (this.preferences.theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      root.setAttribute('data-theme', this.preferences.theme);
    }
  }

  private applyTypography() {
    if (!this.isClient) return;
    
    const root = document.documentElement;
    
    root.style.setProperty('--font-size-base', `${this.preferences.fontSize}px`);
    root.style.setProperty('--line-height-base', this.preferences.lineHeight.toString());
    root.style.setProperty('--letter-spacing-base', `${this.preferences.letterSpacing}px`);
    
    const fontFamilyMap = {
      default: 'Inter, system-ui, sans-serif',
      dyslexic: 'OpenDyslexic, sans-serif',
      mono: 'JetBrains Mono, monospace'
    };
    
    root.style.setProperty('--font-family-base', fontFamilyMap[this.preferences.fontFamily]);
  }

  private applyMotion() {
    if (!this.isClient) return;
    
    const root = document.documentElement;
    
    if (this.preferences.reducedMotion) {
      root.style.setProperty('--animation-duration', '0.01ms');
      root.style.setProperty('--transition-duration', '0.01ms');
    } else {
      root.style.removeProperty('--animation-duration');
      root.style.removeProperty('--transition-duration');
    }
  }

  private applyColorBlindness() {
    if (!this.isClient) return;
    
    const root = document.documentElement;
    
    if (this.preferences.colorBlindness !== 'none') {
      const filters = {
        protanopia: 'url(#protanopia-filter)',
        deuteranopia: 'url(#deuteranopia-filter)',
        tritanopia: 'url(#tritanopia-filter)'
      };
      root.style.filter = filters[this.preferences.colorBlindness as keyof typeof filters];
    } else {
      root.style.removeProperty('filter');
    }
  }

  private applyFocusIndicators() {
    if (!this.isClient) return;
    
    const root = document.documentElement;
    
    if (this.preferences.focusIndicators) {
      root.classList.add('enhanced-focus');
    } else {
      root.classList.remove('enhanced-focus');
    }
  }

  // Public API
  public getFocusManager(): FocusManager {
    return this.focusManager;
  }

  public getScreenReader(): ScreenReaderAnnouncer {
    return this.screenReader;
  }

  public getKeyboardManager(): KeyboardNavigationManager {
    return this.keyboardManager;
  }

  public checkContrastRatio(foreground: string, background: string): number {
    // Implementation for WCAG contrast ratio calculation
    const getLuminance = (color: string): number => {
      // Convert hex to RGB and calculate relative luminance
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16) / 255;
      const g = parseInt(hex.substr(2, 2), 16) / 255;
      const b = parseInt(hex.substr(4, 2), 16) / 255;

      const sRGB = [r, g, b].map(c => {
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });

      return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
    };

    const l1 = getLuminance(foreground);
    const l2 = getLuminance(background);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  public validateAccessibility(element: HTMLElement): string[] {
    const issues: string[] = [];

    // Check for missing alt text on images
    const images = element.querySelectorAll('img');
    images.forEach(img => {
      if (!img.alt && !img.getAttribute('aria-label')) {
        issues.push('Image missing alt text');
      }
    });

    // Check for missing labels on form controls
    const inputs = element.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      const hasLabel = input.getAttribute('aria-label') || 
                     input.getAttribute('aria-labelledby') ||
                     element.querySelector(`label[for="${input.id}"]`);
      if (!hasLabel) {
        issues.push('Form control missing label');
      }
    });

    // Check for proper heading hierarchy
    const headings = Array.from(element.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    let lastLevel = 0;
    headings.forEach(heading => {
      const level = parseInt(heading.tagName.charAt(1));
      if (level > lastLevel + 1) {
        issues.push('Heading hierarchy skipped');
      }
      lastLevel = level;
    });

    return issues;
  }
}

// Create singleton instance
export const accessibilityManager = new AccessibilityManager();

// React hooks for accessibility
export function useAccessibility() {
  const [preferences, setPreferences] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return accessibilityManager.getPreferences();
    }
    // Return default preferences for SSR
    return {
      theme: 'system' as const,
      fontSize: 16,
      fontFamily: 'default' as const,
      lineHeight: 1.5,
      letterSpacing: 0,
      colorBlindness: 'none' as const,
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

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setPreferences(accessibilityManager.getPreferences());
      return accessibilityManager.subscribe(setPreferences);
    }
  }, []);

  const isClient = typeof window !== 'undefined';

  return {
    preferences,
    updatePreference: isClient ? accessibilityManager.updatePreference.bind(accessibilityManager) : () => {},
    focusManager: isClient ? accessibilityManager.getFocusManager() : {
      trapFocus: () => () => {},
      restoreFocus: () => {},
      getFocusableElements: () => [],
      setFocusVisible: () => {},
    },
    screenReader: isClient ? accessibilityManager.getScreenReader() : {
      announce: () => {},
      announcePageChange: () => {},
      announceError: () => {},
      announceSuccess: () => {},
    },
    keyboardManager: isClient ? accessibilityManager.getKeyboardManager() : {
      registerShortcut: () => () => {},
      enableSkipLinks: () => {},
      handleArrowNavigation: () => {},
    },
    checkContrastRatio: isClient ? accessibilityManager.checkContrastRatio.bind(accessibilityManager) : () => 1,
    validateAccessibility: isClient ? accessibilityManager.validateAccessibility.bind(accessibilityManager) : () => []
  };
}

// Import React for hooks
import React from 'react';