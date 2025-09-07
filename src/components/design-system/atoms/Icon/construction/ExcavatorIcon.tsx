import React from 'react';
import { Icon, type IconProps } from '../Icon';

interface ExcavatorIconProps extends Omit<IconProps, 'children'> {}

export const ExcavatorIcon = React.forwardRef<HTMLSpanElement, ExcavatorIconProps>(
  (props, ref) => {
    return (
      <Icon
        ref={ref}
        aria-label="Construction excavator heavy machinery"
        title="Excavator"
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
          {/* Excavator body */}
          <rect x="8" y="12" width="8" height="6" rx="2" />
          {/* Cabin */}
          <rect x="10" y="8" width="4" height="4" rx="1" />
          {/* Tracks */}
          <ellipse cx="6" cy="19" rx="3" ry="1.5" />
          <ellipse cx="18" cy="19" rx="3" ry="1.5" />
          {/* Track wheels */}
          <circle cx="5" cy="19" r="1" />
          <circle cx="7" cy="19" r="1" />
          <circle cx="17" cy="19" r="1" />
          <circle cx="19" cy="19" r="1" />
          {/* Boom arm */}
          <line x1="16" y1="10" x2="20" y2="6" strokeWidth="3" />
          {/* Stick arm */}
          <line x1="20" y1="6" x2="22" y2="2" strokeWidth="2.5" />
          {/* Bucket */}
          <path d="M21 2l2 1-1 2-2-1z" fill="currentColor" />
          {/* Hydraulic cylinders */}
          <line x1="17" y1="8" x2="19" y2="5" strokeWidth="1.5" opacity="0.7" />
          <line x1="20" y1="4" x2="21" y2="2" strokeWidth="1.5" opacity="0.7" />
        </svg>
      </Icon>
    );
  }
);

ExcavatorIcon.displayName = 'ExcavatorIcon';