import React from 'react';
import { Icon, type IconProps } from '../Icon';

interface BuildingIconProps extends Omit<IconProps, 'children'> {}

export const BuildingIcon = React.forwardRef<HTMLSpanElement, BuildingIconProps>(
  (props, ref) => {
    return (
      <Icon
        ref={ref}
        aria-label="Construction building or structure"
        title="Building"
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
          {/* Main building structure */}
          <rect x="4" y="8" width="16" height="14" />
          {/* Roof */}
          <path d="M2 8l10-6 10 6" />
          {/* Windows */}
          <rect x="7" y="11" width="2" height="3" />
          <rect x="15" y="11" width="2" height="3" />
          <rect x="7" y="16" width="2" height="3" />
          <rect x="15" y="16" width="2" height="3" />
          {/* Door */}
          <rect x="11" y="16" width="2" height="6" />
          {/* Door handle */}
          <circle cx="12.5" cy="19" r="0.3" fill="currentColor" />
          {/* Building details */}
          <line x1="4" y1="13" x2="20" y2="13" strokeWidth="1" opacity="0.5" />
          <line x1="4" y1="18" x2="20" y2="18" strokeWidth="1" opacity="0.5" />
          {/* Chimney */}
          <rect x="16" y="4" width="2" height="4" />
        </svg>
      </Icon>
    );
  }
);

BuildingIcon.displayName = 'BuildingIcon';