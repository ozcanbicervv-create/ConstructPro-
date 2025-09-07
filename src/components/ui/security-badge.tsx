/**
 * Security Badge Component
 * Displays security status and compliance information
 */

"use client";

import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Key,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export type SecurityLevel = 'high' | 'medium' | 'low' | 'critical';
export type SecurityStatus = 'secure' | 'warning' | 'danger' | 'pending';

interface SecurityBadgeProps {
  level?: SecurityLevel;
  status?: SecurityStatus;
  label?: string;
  description?: string;
  showIcon?: boolean;
  variant?: 'default' | 'outline' | 'secondary';
  className?: string;
}

const securityIcons = {
  high: ShieldCheck,
  medium: Shield,
  low: ShieldAlert,
  critical: ShieldX,
};

const statusIcons = {
  secure: CheckCircle,
  warning: AlertTriangle,
  danger: XCircle,
  pending: Clock,
};

const securityColors = {
  high: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-blue-100 text-blue-800 border-blue-200',
  low: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  critical: 'bg-red-100 text-red-800 border-red-200',
};

const statusColors = {
  secure: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  danger: 'bg-red-100 text-red-800 border-red-200',
  pending: 'bg-gray-100 text-gray-800 border-gray-200',
};

export function SecurityBadge({
  level,
  status,
  label,
  description,
  showIcon = true,
  variant = 'default',
  className,
}: SecurityBadgeProps) {
  const Icon = level ? securityIcons[level] : status ? statusIcons[status] : Shield;
  const colorClass = level ? securityColors[level] : status ? statusColors[status] : securityColors.medium;
  const displayLabel = label || (level ? `${level.charAt(0).toUpperCase() + level.slice(1)} Security` : status ? `${status.charAt(0).toUpperCase() + status.slice(1)}` : 'Security');

  const badgeContent = (
    <Badge
      variant={variant}
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1',
        variant === 'default' && colorClass,
        className
      )}
    >
      {showIcon && <Icon className="h-3.5 w-3.5" />}
      <span className="text-xs font-medium">{displayLabel}</span>
    </Badge>
  );

  if (description) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {badgeContent}
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs text-sm">{description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return badgeContent;
}

// Specialized security badges
export function EncryptionBadge({ encrypted = false, className }: { encrypted?: boolean; className?: string }) {
  return (
    <SecurityBadge
      status={encrypted ? 'secure' : 'danger'}
      label={encrypted ? 'Encrypted' : 'Not Encrypted'}
      description={encrypted ? 'Data is encrypted in transit and at rest' : 'Data is not encrypted'}
      showIcon={true}
      className={className}
    />
  );
}

export function AccessControlBadge({ hasAccess = false, className }: { hasAccess?: boolean; className?: string }) {
  const Icon = hasAccess ? Lock : Unlock;
  
  return (
    <Badge
      variant="outline"
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1',
        hasAccess ? 'text-green-700 border-green-300' : 'text-red-700 border-red-300',
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="text-xs font-medium">
        {hasAccess ? 'Access Granted' : 'Access Denied'}
      </span>
    </Badge>
  );
}

export function VisibilityBadge({ 
  visible = false, 
  label,
  className 
}: { 
  visible?: boolean; 
  label?: string;
  className?: string;
}) {
  const Icon = visible ? Eye : EyeOff;
  const displayLabel = label || (visible ? 'Visible' : 'Hidden');
  
  return (
    <Badge
      variant="outline"
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1',
        visible ? 'text-blue-700 border-blue-300' : 'text-gray-700 border-gray-300',
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="text-xs font-medium">{displayLabel}</span>
    </Badge>
  );
}

export function AuthenticationBadge({ 
  authenticated = false, 
  method,
  className 
}: { 
  authenticated?: boolean; 
  method?: string;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1',
        authenticated ? 'text-green-700 border-green-300' : 'text-red-700 border-red-300',
        className
      )}
    >
      <Key className="h-3.5 w-3.5" />
      <span className="text-xs font-medium">
        {authenticated ? `Authenticated${method ? ` (${method})` : ''}` : 'Not Authenticated'}
      </span>
    </Badge>
  );
}