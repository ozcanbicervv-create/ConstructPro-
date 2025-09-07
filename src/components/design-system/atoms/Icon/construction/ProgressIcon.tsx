import React from 'react';
import { Icon, type IconProps } from '../Icon';

interface ProgressIconProps extends Omit<IconProps, 'children'> {}

export const ProgressIcon = React.forwardRef<HTMLSpanElement, ProgressIconProps>(
  (props, ref) => {
    return (
      <Icon
        ref={ref}
        aria-label="Construction progress with building phases"
        title="Construction Progress"
        {...props}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-full w-full"
        >
          {/* Foundation (completed) */}
          <rect x="2" y="20" width="20" height="2" fill="currentColor" opacity="0.8" />
          {/* First floor (completed) */}
          <rect x="4" y="16" width="16" height="4" fill="none" strokeWidth="2" />
          <line x1="4" y1="18" x2="20" y2="18" strokeWidth="1" opacity="0.6" />
          {/* Second floor (in progress) */}
          <rect x="6" y="12" width="12" height="4" fill="none" strokeWidth="2" strokeDasharray="4 2" />
          <line x1="6" y1="14" x2="18" y2="14" strokeWidth="1" strokeDasharray="4 2" opacity="0.6" />
          {/* Roof (planned) */}
          <path d="M5 12l7-6 7 6" strokeWidth="2" strokeDasharray="6 3" opacity="0.4" />
          {/* Progress indicators */}
          <circle cx="8" cy="18" r="1" fill="currentColor" />
          <circle cx="12" cy="18" r="1" fill="currentColor" />
          <circle cx="16" cy="18" r="1" fill="currentColor" />
          <circle cx="10" cy="14" r="1" fill="none" strokeWidth="2" />
          <circle cx="14" cy="14" r="1" fill="none" strokeWidth="2" strokeDasharray="2 2" />
          {/* Construction equipment */}
          <path d="M18 8l2-1v3l-2-1" strokeWidth="1.5" opacity="0.7" />
        </svg>
      </Icon>
    );
  }
);

ProgressIcon.displayName = 'ProgressIcon';