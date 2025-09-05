"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import { useRoleAccess } from "@/hooks/use-role-access";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ShieldAlert } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermissions?: (keyof import("@/hooks/use-role-access").RolePermissions)[];
  requiredRoles?: ("ADMIN" | "MANAGER" | "WORKER" | "CLIENT")[];
  fallback?: ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requiredPermissions = [],
  requiredRoles = [],
  fallback,
  redirectTo = "/auth/signin",
}: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { hasAnyPermission, isRole } = useRoleAccess();

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (!session) {
      router.push(redirectTo);
      return;
    }

    // Check role requirements
    if (requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.some(role => isRole(role));
      if (!hasRequiredRole) {
        if (fallback) return;
        router.push("/dashboard"); // Redirect to dashboard if no access
        return;
      }
    }

    // Check permission requirements
    if (requiredPermissions.length > 0) {
      const hasRequiredPermission = hasAnyPermission(requiredPermissions);
      if (!hasRequiredPermission) {
        if (fallback) return;
        router.push("/dashboard"); // Redirect to dashboard if no access
        return;
      }
    }
  }, [session, status, router, requiredPermissions, requiredRoles, hasAnyPermission, isRole, fallback, redirectTo]);

  // Show loading state
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-construction-yellow-500" />
          <span className="text-construction-black-600">Loading...</span>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!session) {
    return null; // Will redirect in useEffect
  }

  // Check role access
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => isRole(role));
    if (!hasRequiredRole) {
      return fallback || (
        <div className="flex items-center justify-center min-h-screen p-4">
          <Alert className="max-w-md">
            <ShieldAlert className="h-4 w-4" />
            <AlertDescription>
              You don't have permission to access this page. Required roles: {requiredRoles.join(", ")}
            </AlertDescription>
          </Alert>
        </div>
      );
    }
  }

  // Check permission access
  if (requiredPermissions.length > 0) {
    const hasRequiredPermission = hasAnyPermission(requiredPermissions);
    if (!hasRequiredPermission) {
      return fallback || (
        <div className="flex items-center justify-center min-h-screen p-4">
          <Alert className="max-w-md">
            <ShieldAlert className="h-4 w-4" />
            <AlertDescription>
              You don't have the required permissions to access this page.
            </AlertDescription>
          </Alert>
        </div>
      );
    }
  }

  return <>{children}</>;
}