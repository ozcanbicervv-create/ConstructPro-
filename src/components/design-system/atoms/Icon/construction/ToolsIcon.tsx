import React from 'react';

import { Icon, type IconProps } from '../Icon';

interface ToolsIconProps extends Omit<IconProps, 'children'> {}

export const ToolsIcon = React.forwardRef<HTMLSpanElement, ToolsIconProps>(
  (props, ref) => {
    return (
      <Icon
        ref={ref}
        aria-label="Construction tools including hammer and wrench"
        title="Construction Tools"
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
          {/* Hammer */}
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          {/* Wrench */}
          <path d="M14 7l-5 5L7 10l-2 2 3 3 2-2-2-2 5-5z" opacity="0.7" />
          {/* Screwdriver */}
          <line x1="18" y1="2" x2="22" y2="6" strokeWidth="1.5" opacity="0.6" />
          <line x1="17" y1="3" x2="21" y2="7" strokeWidth="1" opacity="0.6" />
          {/* Level tool */}
          <rect x="2" y="14" width="8" height="2" rx="1" strokeWidth="1.5" opacity="0.5" />
          <circle cx="6" cy="15" r="0.5" fill="currentColor" opacity="0.5" />
        </svg>
      </Icon>
    );
  }
);

ToolsIcon.displayName = 'ToolsIcon';