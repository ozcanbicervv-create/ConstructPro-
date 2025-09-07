/**
 * Skip Links Component
 * Provides keyboard navigation shortcuts for accessibility
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAccessibility } from "@/lib/accessibility";

interface SkipLink {
  href: string;
  label: string;
  shortcut?: string;
}

interface SkipLinksProps {
  links?: SkipLink[];
  className?: string;
}

const defaultSkipLinks: SkipLink[] = [
  { href: "#main-content", label: "Skip to main content", shortcut: "Alt+M" },
  { href: "#navigation", label: "Skip to navigation", shortcut: "Alt+N" },
  { href: "#search", label: "Skip to search", shortcut: "Alt+S" },
  { href: "#footer", label: "Skip to footer", shortcut: "Alt+F" },
];

export function SkipLinks({ links = defaultSkipLinks, className }: SkipLinksProps) {
  const { preferences, screenReader } = useAccessibility();

  const handleSkipLinkClick = React.useCallback((href: string, label: string) => {
    const target = document.querySelector(href);
    if (target) {
      // Focus the target element
      if (target instanceof HTMLElement) {
        target.focus();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      
      // Announce the navigation
      screenReader.announce(`Skipped to ${label}`, 'assertive');
    }
  }, [screenReader]);

  if (!preferences.skipLinks) {
    return null;
  }

  return (
    <div
      className={cn(
        "skip-links fixed top-0 left-0 z-[9999] flex flex-col gap-1 p-2",
        className
      )}
      role="navigation"
      aria-label="Skip navigation links"
    >
      {links.map((link, index) => (
        <a
          key={index}
          href={link.href}
          className={cn(
            "skip-link",
            "absolute -top-40 left-2 z-[10000]",
            "bg-primary text-primary-foreground",
            "px-4 py-2 rounded-md text-sm font-medium",
            "transition-all duration-200",
            "focus:top-2 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            preferences.theme === 'high-contrast' && "border-2 border-foreground",
            preferences.focusIndicators && "focus:ring-4 focus:ring-offset-4"
          )}
          onClick={(e) => {
            e.preventDefault();
            handleSkipLinkClick(link.href, link.label);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleSkipLinkClick(link.href, link.label);
            }
          }}
        >
          {link.label}
          {link.shortcut && (
            <kbd className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-muted-foreground">
              {link.shortcut}
            </kbd>
          )}
        </a>
      ))}
    </div>
  );
}

// Hook to register skip link targets
export function useSkipLinkTarget(id: string) {
  const elementRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    const element = elementRef.current;
    if (element && !element.id) {
      element.id = id;
    }

    // Make element focusable if it's not already
    if (element && element.tabIndex === -1) {
      element.tabIndex = -1;
    }
  }, [id]);

  return elementRef;
}