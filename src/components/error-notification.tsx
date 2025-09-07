'use client';

import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ApiError } from '@/utils/api-error-handler';
import { ErrorHandler } from '@/utils/error-handler';

export type NotificationType = 'error' | 'warning' | 'success' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  actions?: NotificationAction[];
  metadata?: Record<string, any>;
}

export interface NotificationAction {
  label: string;
  action: () => void;
  variant?: 'default' | 'destructive' | 'outline';
}

interface NotificationContextType {
  notifications: Notification[];
  showNotification: (notification: Omit<Notification, 'id'>) => string;
  showError: (error: Error | ApiError | string, context?: string) => string;
  showSuccess: (message: string, title?: string) => string;
  showWarning: (message: string, title?: string) => string;
  showInfo: (message: string, title?: string) => string;
  dismissNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: ReactNode;
  maxNotifications?: number;
  defaultDuration?: number;
}

export function NotificationProvider({
  children,
  maxNotifications = 5,
  defaultDuration = 5000,
}: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const generateId = useCallback(() => {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const showNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = generateId();
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? defaultDuration,
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      // Keep only the most recent notifications
      return updated.slice(0, maxNotifications);
    });

    // Auto-dismiss if not persistent
    if (!notification.persistent && newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        dismissNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, [generateId, defaultDuration, maxNotifications]);

  const showError = useCallback((error: Error | ApiError | string, context?: string) => {
    let title = 'Error';
    let message = '';
    let actions: NotificationAction[] = [];

    if (typeof error === 'string') {
      message = error;
    } else {
      const apiError = error as ApiError;
      
      // Log the error
      ErrorHandler.handle(error, context || 'User Notification');
      
      // Create user-friendly message
      message = ErrorHandler.createUserFriendlyMessage(error);
      
      // Add specific handling for different error types
      if (apiError.status === 401) {
        title = 'Authentication Required';
        actions = [
          {
            label: 'Sign In',
            action: () => {
              // Navigate to sign in page
              window.location.href = '/auth/signin';
            },
          },
        ];
      } else if (apiError.status === 403) {
        title = 'Access Denied';
      } else if (apiError.status === 404) {
        title = 'Not Found';
      } else if (apiError.status && apiError.status >= 500) {
        title = 'Server Error';
        actions = [
          {
            label: 'Retry',
            action: () => {
              window.location.reload();
            },
          },
        ];
      }
    }

    return showNotification({
      type: 'error',
      title,
      message,
      persistent: true, // Errors should be manually dismissed
      actions,
    });
  }, [showNotification]);

  const showSuccess = useCallback((message: string, title = 'Success') => {
    return showNotification({
      type: 'success',
      title,
      message,
      duration: 3000,
    });
  }, [showNotification]);

  const showWarning = useCallback((message: string, title = 'Warning') => {
    return showNotification({
      type: 'warning',
      title,
      message,
      duration: 4000,
    });
  }, [showNotification]);

  const showInfo = useCallback((message: string, title = 'Information') => {
    return showNotification({
      type: 'info',
      title,
      message,
      duration: 4000,
    });
  }, [showNotification]);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const value: NotificationContextType = {
    notifications,
    showNotification,
    showError,
    showSuccess,
    showWarning,
    showInfo,
    dismissNotification,
    clearAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
}

function NotificationContainer() {
  const { notifications, dismissNotification } = useNotifications();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {notifications.map(notification => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onDismiss={() => dismissNotification(notification.id)}
        />
      ))}
    </div>
  );
}

interface NotificationCardProps {
  notification: Notification;
  onDismiss: () => void;
}

function NotificationCard({ notification, onDismiss }: NotificationCardProps) {
  const getIcon = () => {
    switch (notification.type) {
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getColorClasses = () => {
    switch (notification.type) {
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
    }
  };

  const getTitleColorClass = () => {
    switch (notification.type) {
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'success':
        return 'text-green-800';
      case 'info':
        return 'text-blue-800';
    }
  };

  const getMessageColorClass = () => {
    switch (notification.type) {
      case 'error':
        return 'text-red-700';
      case 'warning':
        return 'text-yellow-700';
      case 'success':
        return 'text-green-700';
      case 'info':
        return 'text-blue-700';
    }
  };

  return (
    <Card className={`${getColorClasses()} border shadow-lg animate-in slide-in-from-right-full`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-medium ${getTitleColorClass()}`}>
              {notification.title}
            </h4>
            <p className={`text-sm mt-1 ${getMessageColorClass()}`}>
              {notification.message}
            </p>
            
            {notification.actions && notification.actions.length > 0 && (
              <div className="flex gap-2 mt-3">
                {notification.actions.map((action, index) => (
                  <Button
                    key={index}
                    size="sm"
                    variant={action.variant || 'outline'}
                    onClick={action.action}
                    className="text-xs"
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="flex-shrink-0 h-6 w-6 p-0 hover:bg-white/50"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Hook for handling errors with automatic notifications
 */
export function useErrorNotification() {
  const { showError } = useNotifications();

  const handleError = useCallback((error: Error | ApiError | string, context?: string) => {
    return showError(error, context);
  }, [showError]);

  return { handleError };
}

/**
 * Higher-order component that provides error notification handling
 */
export function withErrorNotification<P extends object>(
  Component: React.ComponentType<P>
) {
  const WrappedComponent = (props: P) => {
    const { handleError } = useErrorNotification();

    return (
      <Component
        {...props}
        onError={handleError}
      />
    );
  };

  WrappedComponent.displayName = `withErrorNotification(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}