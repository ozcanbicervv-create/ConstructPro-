import React from 'react';

import { Icon, type IconProps } from '../Icon';

interface BlueprintIconProps extends Omit<IconProps, 'children'> {}

export const BlueprintIcon = React.forwardRef<HTMLSpanElement, BlueprintIconProps>(
  (props, ref) => {
    return (
      <Icon
        ref={ref}
        aria-label="Construction blueprint or architectural plan"
        title="Blueprint"
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
          {/* Blueprint paper */}
          <rect x="3" y="3" width="18" height="18" rx="2" />
          {/* Grid lines */}
          <line x1="7" y1="3" x2="7" y2="21" strokeWidth="1" opacity="0.5" />
          <line x1="11" y1="3" x2="11" y2="21" strokeWidth="1" opacity="0.5" />
          <line x1="15" y1="3" x2="15" y2="21" strokeWidth="1" opacity="0.5" />
          <line x1="19" y1="3" x2="19" y2="21" strokeWidth="1" opacity="0.5" />
          <line x1="3" y1="7" x2="21" y2="7" strokeWidth="1" opacity="0.5" />
          <line x1="3" y1="11" x2="21" y2="11" strokeWidth="1" opacity="0.5" />
          <line x1="3" y1="15" x2="21" y2="15" strokeWidth="1" opacity="0.5" />
          <line x1="3" y1="19" x2="21" y2="19" strokeWidth="1" opacity="0.5" />
          {/* Building outline */}
          <rect x="6" y="8" width="12" height="10" fill="none" strokeWidth="1.5" />
          {/* Rooms */}
          <line x1="12" y1="8" x2="12" y2="18" strokeWidth="1.5" />
          <line x1="6" y1="13" x2="18" y2="13" strokeWidth="1.5" />
          {/* Door */}
          <path d="M9 18v-2" strokeWidth="1.5" />
          {/* Windows */}
          <rect x="7" y="9" width="2" height="1" strokeWidth="1" />
          <rect x="15" y="9" width="2" height="1" strokeWidth="1" />
        </svg>
      </Icon>
    );
  }
);

BlueprintIcon.displayName = 'BlueprintIcon';