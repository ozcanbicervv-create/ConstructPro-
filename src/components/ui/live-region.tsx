/**
 * Live Region Component
 * For announcing dynamic content changes to screen readers
 */

import * as React from "react";

import { cn } from "@/lib/utils";

interface LiveRegionProps {
  children?: React.ReactNode;
  priority?: "polite" | "assertive" | "off";
  atomic?: boolean;
  relevant?: "additions" | "removals" | "text" | "all";
  className?: string;
  id?: string;
}

export function LiveRegion({
  children,
  priority = "polite",
  atomic = true,
  relevant = "all",
  className,
  id,
}: LiveRegionProps) {
  return (
    <div
      id={id}
      aria-live={priority}
      aria-atomic={atomic}
      aria-relevant={relevant}
      className={cn(
        "sr-only",
        "absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0",
        className
      )}
    >
      {children}
    </div>
  );
}

// Hook for managing live announcements
export function useLiveAnnouncer() {
  const [politeMessage, setPoliteMessage] = React.useState("");
  const [assertiveMessage, setAssertiveMessage] = React.useState("");

  const announce = React.useCallback((message: string, priority: "polite" | "assertive" = "polite") => {
    if (priority === "assertive") {
      setAssertiveMessage("");
      setTimeout(() => setAssertiveMessage(message), 100);
    } else {
      setPoliteMessage("");
      setTimeout(() => setPoliteMessage(message), 100);
    }
  }, []);

  const announceError = React.useCallback((message: string) => {
    announce(`Error: ${message}`, "assertive");
  }, [announce]);

  const announceSuccess = React.useCallback((message: string) => {
    announce(`Success: ${message}`, "polite");
  }, [announce]);

  const announcePageChange = React.useCallback((title: string) => {
    announce(`Navigated to ${title}`, "assertive");
  }, [announce]);

  return {
    announce,
    announceError,
    announceSuccess,
    announcePageChange,
    LiveRegions: () => (
      <>
        <LiveRegion priority="polite" id="polite-announcer">
          {politeMessage}
        </LiveRegion>
        <LiveRegion priority="assertive" id="assertive-announcer">
          {assertiveMessage}
        </LiveRegion>
      </>
    ),
  };
}