/**
 * Screen Reader Only Component
 * Content that is only visible to screen readers
 */

import * as React from "react";

import { cn } from "@/lib/utils";

interface ScreenReaderOnlyProps {
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
}

export function ScreenReaderOnly({
  children,
  as: Component = "span",
  className,
}: ScreenReaderOnlyProps) {
  return (
    <Component
      className={cn(
        "sr-only",
        "absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0",
        className
      )}
    >
      {children}
    </Component>
  );
}

// Alternative implementation using CSS clip
export function VisuallyHidden({
  children,
  as: Component = "span",
  className,
}: ScreenReaderOnlyProps) {
  return (
    <Component
      className={cn(
        "absolute !m-[-1px] !h-[1px] !w-[1px] !overflow-hidden !whitespace-nowrap !border-0 !p-0",
        "[clip:rect(0,0,0,0)]",
        className
      )}
    >
      {children}
    </Component>
  );
}

// Hook for conditionally hiding content from screen readers
export function useScreenReaderOnly(condition: boolean) {
  return condition ? "sr-only" : "";
}