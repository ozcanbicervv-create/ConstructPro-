import React from 'react';
import { Icon, type IconProps } from '../Icon';

interface MaterialsIconProps extends Omit<IconProps, 'children'> {}

export const MaterialsIcon = React.forwardRef<HTMLSpanElement, MaterialsIconProps>(
  (props, ref) => {
    return (
      <Icon
        ref={ref}
        aria-label="Construction materials including bricks and cement"
        title="Construction Materials"
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
          {/* Brick stack */}
          <rect x="2" y="16" width="8" height="2" />
          <rect x="2" y="18" width="8" height="2" />
          <rect x="2" y="20" width="8" height="2" />
          {/* Offset brick pattern */}
          <rect x="3" y="14" width="6" height="2" />
          <rect x="4" y="12" width="4" height="2" />
          {/* Cement bag */}
          <rect x="14" y="8" width="6" height="8" rx="1" />
          <path d="M14 12h6" strokeWidth="1" />
          <path d="M14 14h6" strokeWidth="1" />
          {/* Cement bag label */}
          <circle cx="17" cy="10" r="1" fill="currentColor" />
          {/* Steel rebar */}
          <line x1="12" y1="4" x2="12" y2="22" strokeWidth="3" opacity="0.7" />
          <line x1="13" y1="4" x2="13" y2="22" strokeWidth="1" opacity="0.5" />
          {/* Rebar ridges */}
          <line x1="11.5" y1="6" x2="12.5" y2="6" strokeWidth="1" />
          <line x1="11.5" y1="8" x2="12.5" y2="8" strokeWidth="1" />
          <line x1="11.5" y1="10" x2="12.5" y2="10" strokeWidth="1" />
          <line x1="11.5" y1="12" x2="12.5" y2="12" strokeWidth="1" />
          <line x1="11.5" y1="14" x2="12.5" y2="14" strokeWidth="1" />
          <line x1="11.5" y1="16" x2="12.5" y2="16" strokeWidth="1" />
          <line x1="11.5" y1="18" x2="12.5" y2="18" strokeWidth="1" />
          <line x1="11.5" y1="20" x2="12.5" y2="20" strokeWidth="1" />
          {/* Lumber/wood planks */}
          <rect x="16" y="2" width="6" height="1" rx="0.5" />
          <rect x="16" y="4" width="6" height="1" rx="0.5" />
          <rect x="16" y="6" width="6" height="1" rx="0.5" />
        </svg>
      </Icon>
    );
  }
);

MaterialsIcon.displayName = 'MaterialsIcon';