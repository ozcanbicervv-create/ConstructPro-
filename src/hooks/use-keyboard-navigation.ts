/**
 * Keyboard Navigation Hook
 * Provides comprehensive keyboard navigation support
 */

import { useEffect, useRef, useCallback } from 'react';

import { useAccessibility } from '@/lib/accessibility';

interface KeyboardNavigationOptions {
  orientation?: 'horizontal' | 'vertical' | 'both';
  wrap?: boolean;
  autoFocus?: boolean;
  onNavigate?: (element: HTMLElement, direction: string) => void;
  onActivate?: (element: HTMLElement) => void;
}

export function useKeyboardNavigation(options: KeyboardNavigationOptions = {}) {
  const {
    orientation = 'both',
    wrap = true,
    autoFocus = false,
    onNavigate,
    onActivate,
  } = options;

  const containerRef = useRef<HTMLElement>(null);
  const { keyboardManager, screenReader } = useAccessibility();

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) {return [];}
    return keyboardManager.getFocusableElements(containerRef.current);
  }, [keyboardManager]);

  const getCurrentIndex = useCallback(() => {
    const elements = getFocusableElements();
    const activeElement = document.activeElement as HTMLElement;
    return elements.indexOf(activeElement);
  }, [getFocusableElements]);

  const focusElement = useCallback((index: number) => {
    const elements = getFocusableElements();
    const element = elements[index];
    
    if (element) {
      element.focus();
      onNavigate?.(element, 'programmatic');
      
      // Announce navigation to screen readers
      const label = element.getAttribute('aria-label') || 
                   element.textContent?.trim() || 
                   element.tagName.toLowerCase();
      screenReader.announce(`Focused ${label}`, 'polite');
    }
  }, [getFocusableElements, onNavigate, screenReader]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const elements = getFocusableElements();
    if (elements.length === 0) {return;}

    const currentIndex = getCurrentIndex();
    if (currentIndex === -1) {return;}

    let nextIndex = currentIndex;
    let handled = false;

    switch (event.key) {
      case 'ArrowLeft':
        if (orientation === 'horizontal' || orientation === 'both') {
          nextIndex = currentIndex > 0 ? currentIndex - 1 : (wrap ? elements.length - 1 : currentIndex);
          handled = true;
        }
        break;

      case 'ArrowRight':
        if (orientation === 'horizontal' || orientation === 'both') {
          nextIndex = currentIndex < elements.length - 1 ? currentIndex + 1 : (wrap ? 0 : currentIndex);
          handled = true;
        }
        break;

      case 'ArrowUp':
        if (orientation === 'vertical' || orientation === 'both') {
          nextIndex = currentIndex > 0 ? currentIndex - 1 : (wrap ? elements.length - 1 : currentIndex);
          handled = true;
        }
        break;

      case 'ArrowDown':
        if (orientation === 'vertical' || orientation === 'both') {
          nextIndex = currentIndex < elements.length - 1 ? currentIndex + 1 : (wrap ? 0 : currentIndex);
          handled = true;
        }
        break;

      case 'Home':
        nextIndex = 0;
        handled = true;
        break;

      case 'End':
        nextIndex = elements.length - 1;
        handled = true;
        break;

      case 'Enter':
      case ' ':
        const currentElement = elements[currentIndex];
        if (currentElement) {
          event.preventDefault();
          onActivate?.(currentElement);
          
          // Trigger click event for buttons and links
          if (currentElement.tagName === 'BUTTON' || currentElement.tagName === 'A') {
            currentElement.click();
          }
          handled = true;
        }
        break;
    }

    if (handled && nextIndex !== currentIndex) {
      event.preventDefault();
      focusElement(nextIndex);
      
      const direction = event.key.replace('Arrow', '').toLowerCase();
      onNavigate?.(elements[nextIndex], direction);
    }
  }, [
    getFocusableElements,
    getCurrentIndex,
    focusElement,
    orientation,
    wrap,
    onNavigate,
    onActivate,
  ]);

  // Set up keyboard event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {return;}

    container.addEventListener('keydown', handleKeyDown);
    
    // Auto-focus first element if requested
    if (autoFocus) {
      const elements = getFocusableElements();
      if (elements.length > 0) {
        elements[0].focus();
      }
    }

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, autoFocus, getFocusableElements]);

  // Public API
  const focusFirst = useCallback(() => {
    focusElement(0);
  }, [focusElement]);

  const focusLast = useCallback(() => {
    const elements = getFocusableElements();
    focusElement(elements.length - 1);
  }, [focusElement, getFocusableElements]);

  const focusNext = useCallback(() => {
    const currentIndex = getCurrentIndex();
    const elements = getFocusableElements();
    const nextIndex = currentIndex < elements.length - 1 ? currentIndex + 1 : (wrap ? 0 : currentIndex);
    focusElement(nextIndex);
  }, [getCurrentIndex, getFocusableElements, focusElement, wrap]);

  const focusPrevious = useCallback(() => {
    const currentIndex = getCurrentIndex();
    const elements = getFocusableElements();
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : (wrap ? elements.length - 1 : currentIndex);
    focusElement(prevIndex);
  }, [getCurrentIndex, getFocusableElements, focusElement, wrap]);

  return {
    containerRef,
    focusFirst,
    focusLast,
    focusNext,
    focusPrevious,
    focusElement,
    getFocusableElements,
    getCurrentIndex,
  };
}

// Hook for roving tabindex pattern
export function useRovingTabindex(options: KeyboardNavigationOptions = {}) {
  const navigation = useKeyboardNavigation(options);
  const { containerRef } = navigation;

  // Update tabindex values to implement roving tabindex
  const updateTabindices = useCallback(() => {
    const elements = navigation.getFocusableElements();
    const currentIndex = navigation.getCurrentIndex();

    elements.forEach((element, index) => {
      element.tabIndex = index === currentIndex ? 0 : -1;
    });
  }, [navigation]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {return;}

    // Set initial tabindex values
    updateTabindices();

    // Update tabindices when focus changes
    const handleFocusIn = () => {
      updateTabindices();
    };

    container.addEventListener('focusin', handleFocusIn);

    return () => {
      container.removeEventListener('focusin', handleFocusIn);
    };
  }, [updateTabindices]);

  return navigation;
}

// Hook for managing focus within a specific context
export function useFocusManagement() {
  const { focusManager, screenReader } = useAccessibility();
  const lastFocusedElement = useRef<HTMLElement | null>(null);

  const saveFocus = useCallback(() => {
    lastFocusedElement.current = document.activeElement as HTMLElement;
  }, []);

  const restoreFocus = useCallback(() => {
    if (lastFocusedElement.current) {
      focusManager.restoreFocus(lastFocusedElement.current);
      lastFocusedElement.current = null;
    }
  }, [focusManager]);

  const trapFocus = useCallback((element: HTMLElement) => {
    saveFocus();
    return focusManager.trapFocus(element);
  }, [focusManager, saveFocus]);

  const setFocusVisible = useCallback((element: HTMLElement) => {
    focusManager.setFocusVisible(element);
  }, [focusManager]);

  const announceNavigation = useCallback((message: string) => {
    screenReader.announce(message, 'polite');
  }, [screenReader]);

  return {
    saveFocus,
    restoreFocus,
    trapFocus,
    setFocusVisible,
    announceNavigation,
    getFocusableElements: focusManager.getFocusableElements,
  };
}

// Hook for keyboard shortcuts
export function useKeyboardShortcuts() {
  const { keyboardManager } = useAccessibility();
  const shortcuts = useRef<Map<string, () => void>>(new Map());

  const registerShortcut = useCallback((
    key: string,
    callback: () => void,
    description: string
  ) => {
    shortcuts.current.set(key, callback);
    return keyboardManager.registerShortcut(key, callback, description);
  }, [keyboardManager]);

  const unregisterShortcut = useCallback((key: string) => {
    shortcuts.current.delete(key);
  }, []);

  const getShortcuts = useCallback(() => {
    return Array.from(shortcuts.current.entries()).map(([key, callback]) => ({
      key,
      callback,
    }));
  }, []);

  return {
    registerShortcut,
    unregisterShortcut,
    getShortcuts,
  };
}