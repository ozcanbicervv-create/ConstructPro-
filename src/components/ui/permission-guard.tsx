/**
 * Permission Guard Component
 * Controls UI visibility based on user permissions
 */

"use client";

import { Shield, ShieldAlert, Lock, Eye, EyeOff } from 'lucide-react';
import React from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export type Permission = string;
export type Role = 'admin' | 'manager' | 'user' | 'viewer' | 'guest';

interface User {
  id: string;
  role: Role;
  permissions: Permission[];
}

interface PermissionGuardProps {
  children: React.ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  role?: Role;
  roles?: Role[];
  user?: User | null;
  fallback?: React.ReactNode;
  showFallback?: boolean;
  requireAll?: boolean; // For multiple permissions/roles
  onUnauthorized?: () => void;
}

// Mock user hook - replace with actual auth implementation
function useCurrentUser(): User | null {
  // This would typically come from your auth context
  return {
    id: '1',
    role: 'user',
    permissions: ['read:projects', 'write:tasks', 'read:materials']
  };
}

export function PermissionGuard({
  children,
  permission,
  permissions = [],
  role,
  roles = [],
  user: providedUser,
  fallback,
  showFallback = true,
  requireAll = false,
  onUnauthorized,
}: PermissionGuardProps) {
  const currentUser = useCurrentUser();
  const user = providedUser || currentUser;

  const hasPermission = React.useMemo(() => {
    if (!user) {return false;}

    // Check single permission
    if (permission && !user.permissions.includes(permission)) {
      return false;
    }

    // Check multiple permissions
    if (permissions.length > 0) {
      if (requireAll) {
        // User must have ALL permissions
        return permissions.every(p => user.permissions.includes(p));
      } else {
        // User must have at least ONE permission
        return permissions.some(p => user.permissions.includes(p));
      }
    }

    // Check single role
    if (role && user.role !== role) {
      return false;
    }

    // Check multiple roles
    if (roles.length > 0) {
      if (requireAll) {
        // This doesn't make sense for roles, but included for completeness
        return roles.includes(user.role);
      } else {
        // User must have one of the roles
        return roles.includes(user.role);
      }
    }

    return true;
  }, [user, permission, permissions, role, roles, requireAll]);

  React.useEffect(() => {
    if (!hasPermission && onUnauthorized) {
      onUnauthorized();
    }
  }, [hasPermission, onUnauthorized]);

  if (!hasPermission) {
    if (!showFallback) {
      return null;
    }

    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Alert variant="destructive" className="border-red-200">
        <ShieldAlert className="h-4 w-4" />
        <AlertDescription>
          You don't have permission to access this content.
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
}

// Specialized permission components
export function AdminOnly({ 
  children, 
  fallback 
}: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode; 
}) {
  return (
    <PermissionGuard role="admin" fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

export function ManagerOrAdmin({ 
  children, 
  fallback 
}: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode; 
}) {
  return (
    <PermissionGuard roles={['admin', 'manager']} fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

export function RequirePermission({ 
  permission, 
  children, 
  fallback 
}: { 
  permission: Permission; 
  children: React.ReactNode; 
  fallback?: React.ReactNode; 
}) {
  return (
    <PermissionGuard permission={permission} fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

// Permission-based button wrapper
export function PermissionButton({
  permission,
  permissions,
  role,
  roles,
  requireAll = false,
  children,
  disabled,
  onClick,
  ...props
}: PermissionGuardProps & {
  disabled?: boolean;
  onClick?: () => void;
  [key: string]: any;
}) {
  const currentUser = useCurrentUser();
  
  const hasPermission = React.useMemo(() => {
    if (!currentUser) {return false;}

    if (permission && !currentUser.permissions.includes(permission)) {
      return false;
    }

    if (permissions && permissions.length > 0) {
      if (requireAll) {
        return permissions.every(p => currentUser.permissions.includes(p));
      } else {
        return permissions.some(p => currentUser.permissions.includes(p));
      }
    }

    if (role && currentUser.role !== role) {
      return false;
    }

    if (roles && roles.length > 0) {
      return roles.includes(currentUser.role);
    }

    return true;
  }, [currentUser, permission, permissions, role, roles, requireAll]);

  return (
    <Button
      {...props}
      disabled={disabled || !hasPermission}
      onClick={hasPermission ? onClick : undefined}
      title={!hasPermission ? 'You don\'t have permission for this action' : undefined}
    >
      {children}
    </Button>
  );
}

// Data masking component
export function DataMask({
  children,
  permission,
  maskChar = '•',
  showLength = true,
  className,
}: {
  children: React.ReactNode;
  permission?: Permission;
  maskChar?: string;
  showLength?: boolean;
  className?: string;
}) {
  const [isRevealed, setIsRevealed] = React.useState(false);
  const currentUser = useCurrentUser();
  
  const hasPermission = permission ? 
    currentUser?.permissions.includes(permission) : 
    true;

  const childrenString = React.Children.toArray(children).join('');
  const maskedContent = showLength ? 
    maskChar.repeat(childrenString.length) : 
    maskChar.repeat(8);

  if (hasPermission || isRevealed) {
    return (
      <span className={className}>
        {children}
        {!hasPermission && (
          <Button
            variant="ghost"
            size="sm"
            className="ml-2 h-4 w-4 p-0"
            onClick={() => setIsRevealed(false)}
            aria-label="Hide sensitive data"
          >
            <EyeOff className="h-3 w-3" />
          </Button>
        )}
      </span>
    );
  }

  return (
    <span className={className}>
      <span className="font-mono">{maskedContent}</span>
      <Button
        variant="ghost"
        size="sm"
        className="ml-2 h-4 w-4 p-0"
        onClick={() => setIsRevealed(true)}
        aria-label="Reveal sensitive data"
      >
        <Eye className="h-3 w-3" />
      </Button>
    </span>
  );
}

// Security context component
export function SecurityContext({
  children,
  level = 'medium',
  className,
}: {
  children: React.ReactNode;
  level?: 'low' | 'medium' | 'high';
  className?: string;
}) {
  const securityClasses = {
    low: 'border-yellow-200 bg-yellow-50',
    medium: 'border-blue-200 bg-blue-50',
    high: 'border-green-200 bg-green-50',
  };

  return (
    <div className={`border rounded-lg p-4 ${securityClasses[level]} ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <Shield className="h-4 w-4" />
        <span className="text-sm font-medium">
          Security Level: {level.charAt(0).toUpperCase() + level.slice(1)}
        </span>
      </div>
      {children}
    </div>
  );
}

// Hook for checking permissions
export function usePermissions() {
  const user = useCurrentUser();

  const hasPermission = React.useCallback((permission: Permission) => {
    return user?.permissions.includes(permission) || false;
  }, [user]);

  const hasAnyPermission = React.useCallback((permissions: Permission[]) => {
    return permissions.some(p => user?.permissions.includes(p)) || false;
  }, [user]);

  const hasAllPermissions = React.useCallback((permissions: Permission[]) => {
    return permissions.every(p => user?.permissions.includes(p)) || false;
  }, [user]);

  const hasRole = React.useCallback((role: Role) => {
    return user?.role === role || false;
  }, [user]);

  const hasAnyRole = React.useCallback((roles: Role[]) => {
    return roles.includes(user?.role as Role) || false;
  }, [user]);

  return {
    user,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
  };
}