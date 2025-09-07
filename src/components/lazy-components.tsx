/**
 * Lazy-loaded components for code splitting and performance optimization
 */

import { lazy, Suspense, ComponentType } from 'react';

import { Skeleton } from '@/components/ui/skeleton';

// Loading fallback components
const ComponentSkeleton = () => (
  <div className="space-y-4 p-4">
    <Skeleton className="h-8 w-full" />
    <Skeleton className="h-32 w-full" />
    <Skeleton className="h-4 w-3/4" />
  </div>
);

const TableSkeleton = () => (
  <div className="space-y-2 p-4">
    <Skeleton className="h-8 w-full" />
    {Array.from({ length: 5 }).map((_, i) => (
      <Skeleton key={i} className="h-12 w-full" />
    ))}
  </div>
);

const FormSkeleton = () => (
  <div className="space-y-4 p-4">
    <Skeleton className="h-6 w-1/4" />
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-6 w-1/4" />
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-10 w-32" />
  </div>
);

// Lazy-loaded components with appropriate loading states
export const LazyAdminPanel = lazy(() => 
  import('@/components/admin-panel').then(module => ({ default: module.AdminPanel }))
);

export const LazyProjectManagement = lazy(() => 
  import('@/components/project-management').then(module => ({ default: module.ProjectManagement }))
);

export const LazyMaterialComparison = lazy(() => 
  import('@/components/material-comparison').then(module => ({ default: module.MaterialComparison }))
);

export const LazyProfessionalNetwork = lazy(() => 
  import('@/components/professional-network').then(module => ({ default: module.ProfessionalNetwork }))
);

export const LazyVerificationSystem = lazy(() => 
  import('@/components/verification-system').then(module => ({ default: module.VerificationSystem }))
);

export const LazyARIntegration = lazy(() => 
  import('@/components/ar-integration').then(module => ({ default: module.ARIntegration }))
);

export const LazyUserProfile = lazy(() => 
  import('@/components/user-profile').then(module => ({ default: module.UserProfile }))
);

// Higher-order component for wrapping lazy components with Suspense
export function withLazyLoading<P extends object>(
  Component: ComponentType<P>,
  fallback: ComponentType = ComponentSkeleton
) {
  const WrappedComponent = (props: P) => (
    <Suspense fallback={<fallback />}>
      <Component {...props} />
    </Suspense>
  );

  WrappedComponent.displayName = `withLazyLoading(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Pre-configured lazy components with appropriate loading states
export const AdminPanelWithLoading = withLazyLoading(LazyAdminPanel, ComponentSkeleton);
export const ProjectManagementWithLoading = withLazyLoading(LazyProjectManagement, TableSkeleton);
export const MaterialComparisonWithLoading = withLazyLoading(LazyMaterialComparison, TableSkeleton);
export const ProfessionalNetworkWithLoading = withLazyLoading(LazyProfessionalNetwork, ComponentSkeleton);
export const VerificationSystemWithLoading = withLazyLoading(LazyVerificationSystem, FormSkeleton);
export const ARIntegrationWithLoading = withLazyLoading(LazyARIntegration, ComponentSkeleton);
export const UserProfileWithLoading = withLazyLoading(LazyUserProfile, FormSkeleton);

// Dynamic import utility for route-based code splitting
export const dynamicImport = <T = any>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  options: {
    loading?: ComponentType;
    ssr?: boolean;
  } = {}
) => {
  const { loading = ComponentSkeleton, ssr = true } = options;
  
  return lazy(() => {
    if (!ssr && typeof window === 'undefined') {
      // Return a placeholder component for SSR when ssr is disabled
      return Promise.resolve({
        default: () => <div>Loading...</div>
      });
    }
    
    return importFn();
  });
};

// Preload utility for critical components
export const preloadComponent = (importFn: () => Promise<any>) => {
  if (typeof window !== 'undefined') {
    // Preload on idle or after a short delay
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => importFn());
    } else {
      setTimeout(() => importFn(), 100);
    }
  }
};

// Preload critical components
export const preloadCriticalComponents = () => {
  preloadComponent(() => import('@/components/project-management'));
  preloadComponent(() => import('@/components/user-profile'));
};