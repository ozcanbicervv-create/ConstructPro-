import React from 'react';

import { Icon, type IconProps } from '../Icon';

interface CraneIconProps extends Omit<IconProps, 'children'> {}

export const CraneIcon = React.forwardRef<HTMLSpanElement, CraneIconProps>(
  (props, ref) => {
    return (
      <Icon
        ref={ref}
        aria-label="Construction crane"
        title="Construction Crane"
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
          {/* Crane mast */}
          <line x1="8" y1="22" x2="8" y2="2" />
          {/* Crane jib (horizontal arm) */}
          <line x1="8" y1="4" x2="22" y2="4" />
          {/* Counter jib */}
          <line x1="8" y1="4" x2="2" y2="4" />
          {/* Trolley */}
          <circle cx="16" cy="4" r="1" />
          {/* Hook and cable */}
          <line x1="16" y1="5" x2="16" y2="12" />
          {/* Load */}
          <rect x="14" y="12" width="4" height="3" rx="0.5" />
          {/* Crane base */}
          <rect x="6" y="20" width="4" height="2" rx="0.5" />
          {/* Counterweight */}
          <rect x="1" y="3" width="3" height="2" rx="0.5" />
          {/* Support cables */}
          <line x1="8" y1="8" x2="20" y2="4" />
          <line x1="8" y1="12" x2="18" y2="4" />
        </svg>
      </Icon>
    );
  }
);

CraneIcon.displayName = 'CraneIcon';