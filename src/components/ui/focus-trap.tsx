/**
 * Focus Trap Component
 * Traps focus within a container for modal dialogs and other overlays
 */

import * as React from "react";

import { useAccessibility } from "@/lib/accessibility";

interface FocusTrapProps {
  children: React.ReactNode;
  active?: boolean;
  restoreFocus?: boolean;
  initialFocus?: React.RefObject<HTMLElement>;
  className?: string;
}

export function FocusTrap({
  children,
  active = true,
  restoreFocus = true,
  initialFocus,
  className,
}: FocusTrapProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { focusManager } = useAccessibility();
  const previouslyFocusedElement = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!active || !containerRef.current) {return;}

    // Store the previously focused element
    previouslyFocusedElement.current = document.activeElement as HTMLElement;

    // Set up focus trap
    const cleanup = focusManager.trapFocus(containerRef.current);

    // Focus initial element or first focusable element
    if (initialFocus?.current) {
      initialFocus.current.focus();
    } else {
      const focusableElements = focusManager.getFocusableElements(containerRef.current);
      focusableElements[0]?.focus();
    }

    return () => {
      cleanup();
      
      // Restore focus to previously focused element
      if (restoreFocus && previouslyFocusedElement.current) {
        focusManager.restoreFocus(previouslyFocusedElement.current);
      }
    };
  }, [active, focusManager, initialFocus, restoreFocus]);

  return (
    <div
      ref={containerRef}
      className={className}
      data-focus-trap={active}
    >
      {children}
    </div>
  );
}

// Hook for managing focus trap
export function useFocusTrap(active = true) {
  const containerRef = React.useRef<HTMLElement>(null);
  const { focusManager } = useAccessibility();

  React.useEffect(() => {
    if (!active || !containerRef.current) {return;}

    return focusManager.trapFocus(containerRef.current);
  }, [active, focusManager]);

  return containerRef;
}