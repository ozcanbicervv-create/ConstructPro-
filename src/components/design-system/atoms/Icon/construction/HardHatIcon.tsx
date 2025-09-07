import React from 'react';
import { Icon, type IconProps } from '../Icon';

interface HardHatIconProps extends Omit<IconProps, 'children'> {}

export const HardHatIcon = React.forwardRef<HTMLSpanElement, HardHatIconProps>(
  (props, ref) => {
    return (
      <Icon
        ref={ref}
        aria-label="Hard hat safety helmet"
        title="Hard Hat"
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
          {/* Hard hat main body */}
          <path d="M4 18c0-1.5 1-3 2.5-4.5C8 12 10 11 12 11s4 1 5.5 2.5C19 15 20 16.5 20 18" />
          {/* Hard hat brim */}
          <path d="M3 18h18" />
          {/* Hard hat top */}
          <path d="M12 11V8c0-2.5-1.5-4-4-4s-4 1.5-4 4v3" />
          <path d="M12 11V8c0-2.5 1.5-4 4-4s4 1.5 4 4v3" />
          {/* Safety strap */}
          <path d="M6 18v2c0 .5.5 1 1 1h10c.5 0 1-.5 1-1v-2" />
          {/* Hard hat detail line */}
          <path d="M12 8v3" />
        </svg>
      </Icon>
    );
  }
);

HardHatIcon.displayName = 'HardHatIcon';