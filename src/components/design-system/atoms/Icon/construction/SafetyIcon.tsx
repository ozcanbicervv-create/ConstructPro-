import React from 'react';

import { Icon, type IconProps } from '../Icon';

interface SafetyIconProps extends Omit<IconProps, 'children'> {}

export const SafetyIcon = React.forwardRef<HTMLSpanElement, SafetyIconProps>(
  (props, ref) => {
    return (
      <Icon
        ref={ref}
        aria-label="Construction safety shield with checkmark"
        title="Safety"
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
          {/* Safety shield */}
          <path d="M12 2l8 3v7c0 5-3 9-8 11-5-2-8-6-8-11V5l8-3z" />
          {/* Safety checkmark */}
          <path d="M9 12l2 2 4-4" strokeWidth="2.5" />
          {/* Additional safety elements */}
          <circle cx="12" cy="8" r="1" fill="currentColor" />
          <path d="M12 9v2" strokeWidth="1.5" />
        </svg>
      </Icon>
    );
  }
);

SafetyIcon.displayName = 'SafetyIcon';