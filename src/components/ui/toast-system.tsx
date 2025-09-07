'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode, createContext, useContext, useState, useCallback } from 'react';
import { Check, X, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Toast types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Toast context
interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Toast provider
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);

    // Auto remove after duration
    const duration = toast.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAllToasts }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

// Toast container
function ToastContainer() {
  const { toasts } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      <AnimatePresence>
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Individual toast item
function ToastItem({ toast }: { toast: Toast }) {
  const { removeToast } = useToast();

  const icons = {
    success: Check,
    error: X,
    warning: AlertTriangle,
    info: Info,
  };

  const colors = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: 'text-green-600',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: 'text-red-600',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: 'text-yellow-600',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: 'text-blue-600',
    },
  };

  const Icon = icons[toast.type];
  const colorScheme = colors[toast.type];

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.9 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'flex items-start space-x-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm',
        colorScheme.bg,
        colorScheme.border
      )}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 500 }}
        className={cn('flex-shrink-0 mt-0.5', colorScheme.icon)}
      >
        <Icon className="w-5 h-5" />
      </motion.div>

      <div className="flex-1 min-w-0">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={cn('font-medium', colorScheme.text)}
        >
          {toast.title}
        </motion.p>
        
        {toast.description && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={cn('mt-1 text-sm', colorScheme.text, 'opacity-80')}
          >
            {toast.description}
          </motion.p>
        )}

        {toast.action && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={toast.action.onClick}
            className={cn(
              'mt-2 text-sm font-medium underline hover:no-underline',
              colorScheme.text
            )}
          >
            {toast.action.label}
          </motion.button>
        )}
      </div>

      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        onClick={() => removeToast(toast.id)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600"
      >
        <X className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
}

// Convenience hooks for different toast types
export function useSuccessToast() {
  const { addToast } = useToast();
  
  return useCallback((title: string, description?: string) => {
    addToast({ type: 'success', title, description });
  }, [addToast]);
}

export function useErrorToast() {
  const { addToast } = useToast();
  
  return useCallback((title: string, description?: string) => {
    addToast({ type: 'error', title, description });
  }, [addToast]);
}

export function useWarningToast() {
  const { addToast } = useToast();
  
  return useCallback((title: string, description?: string) => {
    addToast({ type: 'warning', title, description });
  }, [addToast]);
}

export function useInfoToast() {
  const { addToast } = useToast();
  
  return useCallback((title: string, description?: string) => {
    addToast({ type: 'info', title, description });
  }, [addToast]);
}

// Toast with progress bar for long operations
interface ProgressToastProps {
  title: string;
  progress: number;
  onCancel?: () => void;
}

export function ProgressToast({ title, progress, onCancel }: ProgressToastProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="font-medium text-gray-900">{title}</p>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
            className="h-full bg-blue-600 rounded-full"
          />
        </div>
      </div>
    </motion.div>
  );
}

// Batch toast for multiple operations
interface BatchToastProps {
  title: string;
  items: Array<{ id: string; name: string; status: 'pending' | 'success' | 'error' }>;
  onClose: () => void;
}

export function BatchToast({ title, items, onClose }: BatchToastProps) {
  const completedItems = items.filter(item => item.status !== 'pending').length;
  const totalItems = items.length;
  const progress = (completedItems / totalItems) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="font-medium text-gray-900">{title}</p>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Progress</span>
          <span>{completedItems}/{totalItems}</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
            className="h-full bg-blue-600 rounded-full"
          />
        </div>

        <div className="max-h-32 overflow-y-auto space-y-1">
          {items.map(item => (
            <div key={item.id} className="flex items-center space-x-2 text-sm">
              <div className="flex-shrink-0">
                {item.status === 'pending' && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full"
                  />
                )}
                {item.status === 'success' && (
                  <Check className="w-3 h-3 text-green-600" />
                )}
                {item.status === 'error' && (
                  <X className="w-3 h-3 text-red-600" />
                )}
              </div>
              <span className={cn(
                'truncate',
                item.status === 'success' && 'text-green-600',
                item.status === 'error' && 'text-red-600',
                item.status === 'pending' && 'text-gray-600'
              )}>
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}