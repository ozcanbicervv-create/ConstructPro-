import { useSession } from "next-auth/react";
import { useMemo } from "react";

type UserRole = "ADMIN" | "MANAGER" | "WORKER" | "CLIENT";

interface RolePermissions {
  canManageUsers: boolean;
  canManageProjects: boolean;
  canViewAllProjects: boolean;
  canManageMaterials: boolean;
  canAccessAdminPanel: boolean;
  canManageTeam: boolean;
  canApproveWork: boolean;
  canAccessARTools: boolean;
  canManageVerification: boolean;
}

const rolePermissions: Record<UserRole, RolePermissions> = {
  ADMIN: {
    canManageUsers: true,
    canManageProjects: true,
    canViewAllProjects: true,
    canManageMaterials: true,
    canAccessAdminPanel: true,
    canManageTeam: true,
    canApproveWork: true,
    canAccessARTools: true,
    canManageVerification: true,
  },
  MANAGER: {
    canManageUsers: false,
    canManageProjects: true,
    canViewAllProjects: true,
    canManageMaterials: true,
    canAccessAdminPanel: false,
    canManageTeam: true,
    canApproveWork: true,
    canAccessARTools: true,
    canManageVerification: true,
  },
  WORKER: {
    canManageUsers: false,
    canManageProjects: false,
    canViewAllProjects: false,
    canManageMaterials: false,
    canAccessAdminPanel: false,
    canManageTeam: false,
    canApproveWork: false,
    canAccessARTools: true,
    canManageVerification: false,
  },
  CLIENT: {
    canManageUsers: false,
    canManageProjects: false,
    canViewAllProjects: false,
    canManageMaterials: false,
    canAccessAdminPanel: false,
    canManageTeam: false,
    canApproveWork: false,
    canAccessARTools: false,
    canManageVerification: false,
  },
};

export function useRoleAccess() {
  const { data: session } = useSession();
  
  const userRole = (session?.user?.role as UserRole) || "WORKER";
  
  const permissions = useMemo(() => {
    return rolePermissions[userRole];
  }, [userRole]);

  const hasPermission = (permission: keyof RolePermissions): boolean => {
    return permissions[permission];
  };

  const hasAnyPermission = (permissionList: (keyof RolePermissions)[]): boolean => {
    return permissionList.some(permission => permissions[permission]);
  };

  const hasAllPermissions = (permissionList: (keyof RolePermissions)[]): boolean => {
    return permissionList.every(permission => permissions[permission]);
  };

  const isRole = (role: UserRole): boolean => {
    return userRole === role;
  };

  const isAdmin = (): boolean => {
    return userRole === "ADMIN";
  };

  const isManager = (): boolean => {
    return userRole === "MANAGER";
  };

  const isWorker = (): boolean => {
    return userRole === "WORKER";
  };

  const isClient = (): boolean => {
    return userRole === "CLIENT";
  };

  return {
    userRole,
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isRole,
    isAdmin,
    isManager,
    isWorker,
    isClient,
  };
}