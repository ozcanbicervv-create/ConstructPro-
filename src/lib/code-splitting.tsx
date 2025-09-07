/**
 * Code splitting utilities for dynamic imports and lazy loading
 * Implements route-based and component-based code splitting
 */

import React, { lazy, ComponentType, LazyExoticComponent } from 'react';

// Loading component interface
export interface LoadingComponentProps {
  error?: Error;
  retry?: () => void;
  pastDelay?: boolean;
}

// Default loading component
export const DefaultLoadingComponent: React.FC<LoadingComponentProps> = ({ error, retry }) => {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="text-red-500 mb-4">Failed to load component</div>
        {retry && (
          <button
            onClick={retry}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  );
};

// Enhanced lazy loading with error boundaries and retry logic
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  LoadingComponent: ComponentType<LoadingComponentProps> = DefaultLoadingComponent
): LazyExoticComponent<T> {
  return lazy(() =>
    importFn().catch((error) => {
      console.error('Failed to load component:', error);
      // Return a fallback component that shows the error
      return {
        default: ((props: any) => (
          <LoadingComponent error={error} retry={() => window.location.reload()} />
        )) as T,
      };
    })
  );
}

// Preload function for components
export function preloadComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
): Promise<{ default: T }> {
  return importFn();
}

// Bundle splitting configuration
export const BundleSplittingConfig = {
  // Vendor libraries that should be in separate chunks
  vendors: [
    'react',
    'react-dom',
    'next',
  ],
  
  // UI libraries
  ui: [
    '@radix-ui/react-dialog',
    '@radix-ui/react-dropdown-menu',
    '@radix-ui/react-select',
    '@radix-ui/react-tabs',
  ],
  
  // Utility libraries
  utils: [
    'date-fns',
    'clsx',
    'class-variance-authority',
  ],
  
  // Chart libraries
  charts: [
    'recharts',
    'd3',
  ],
  
  // Animation libraries
  motion: [
    'framer-motion',
  ],
  
  // Form libraries
  forms: [
    'react-hook-form',
    '@hookform/resolvers',
    'zod',
  ],
};

// Dynamic import helper with error handling
export async function dynamicImport<T>(
  importFn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await importFn();
    } catch (error) {
      if (i === retries - 1) throw error;
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
  
  throw new Error('Failed to import after retries');
}

// Initialize code splitting
export function initializeCodeSplitting() {
  if (typeof window !== 'undefined') {
    console.log('Code splitting initialized');
  }
}