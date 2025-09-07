'use client';

import { useState, useEffect, useCallback } from 'react';

interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  isSupported: boolean;
  installPrompt: PWAInstallPrompt | null;
}

interface PWAActions {
  install: () => Promise<boolean>;
  checkForUpdates: () => Promise<boolean>;
  skipWaiting: () => void;
}

export const usePWA = (): PWAState & PWAActions => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isSupported, setIsSupported] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<PWAInstallPrompt | null>(null);

  // Check PWA support
  useEffect(() => {
    const checkSupport = () => {
      const hasServiceWorker = 'serviceWorker' in navigator;
      const hasManifest = 'manifest' in document.createElement('link');
      const hasNotifications = 'Notification' in window;
      
      setIsSupported(hasServiceWorker && hasManifest);
    };

    checkSupport();
  }, []);

  // Check if app is already installed
  useEffect(() => {
    const checkInstalled = () => {
      // Check if running in standalone mode (installed PWA)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      
      setIsInstalled(isStandalone || isIOSStandalone);
    };

    checkInstalled();
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      event.preventDefault();
      
      // Save the event so it can be triggered later
      setInstallPrompt(event as any);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Install PWA
  const install = useCallback(async (): Promise<boolean> => {
    if (!installPrompt) {
      return false;
    }

    try {
      // Show the install prompt
      await installPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await installPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
        setInstallPrompt(null);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to install PWA:', error);
      return false;
    }
  }, [installPrompt]);

  // Check for service worker updates
  const checkForUpdates = useCallback(async (): Promise<boolean> => {
    if (!('serviceWorker' in navigator)) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      
      if (registration) {
        await registration.update();
        
        // Check if there's a waiting service worker
        if (registration.waiting) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Failed to check for updates:', error);
      return false;
    }
  }, []);

  // Skip waiting and activate new service worker
  const skipWaiting = useCallback(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration?.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      });
    }
  }, []);

  return {
    isInstallable,
    isInstalled,
    isOnline,
    isSupported,
    installPrompt,
    install,
    checkForUpdates,
    skipWaiting
  };
};

// Hook for managing offline data synchronization
export const useOfflineSync = () => {
  const [offlineActions, setOfflineActions] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Add action to offline queue
  const addOfflineAction = useCallback((action: any) => {
    const offlineAction = {
      id: Date.now().toString(),
      ...action,
      timestamp: new Date(),
      synced: false
    };

    setOfflineActions(prev => [...prev, offlineAction]);
    
    // Store in localStorage for persistence
    const stored = localStorage.getItem('constructpro_offline_actions');
    const actions = stored ? JSON.parse(stored) : [];
    actions.push(offlineAction);
    localStorage.setItem('constructpro_offline_actions', JSON.stringify(actions));
  }, []);

  // Sync offline actions when online
  const syncOfflineActions = useCallback(async () => {
    if (isSyncing || !navigator.onLine) {
      return;
    }

    setIsSyncing(true);

    try {
      const stored = localStorage.getItem('constructpro_offline_actions');
      const actions = stored ? JSON.parse(stored) : [];
      
      for (const action of actions) {
        if (!action.synced) {
          try {
            // Attempt to sync the action
            await fetch(action.url, {
              method: action.method || 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...action.headers
              },
              body: action.body ? JSON.stringify(action.body) : undefined
            });

            // Mark as synced
            action.synced = true;
          } catch (error) {
            console.error('Failed to sync action:', action, error);
          }
        }
      }

      // Update localStorage
      localStorage.setItem('constructpro_offline_actions', JSON.stringify(actions));
      
      // Update state
      setOfflineActions(actions);
      setLastSync(new Date());
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]);

  // Load offline actions from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('constructpro_offline_actions');
    if (stored) {
      try {
        const actions = JSON.parse(stored);
        setOfflineActions(actions);
      } catch (error) {
        console.error('Failed to load offline actions:', error);
      }
    }
  }, []);

  // Auto-sync when coming online
  useEffect(() => {
    const handleOnline = () => {
      syncOfflineActions();
    };

    window.addEventListener('online', handleOnline);
    
    // Sync immediately if online
    if (navigator.onLine) {
      syncOfflineActions();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [syncOfflineActions]);

  return {
    offlineActions,
    isSyncing,
    lastSync,
    addOfflineAction,
    syncOfflineActions
  };
};

// Hook for push notifications
export const usePushNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  // Check notification support
  useEffect(() => {
    const checkSupport = () => {
      const hasNotifications = 'Notification' in window;
      const hasPushManager = 'PushManager' in window;
      const hasServiceWorker = 'serviceWorker' in navigator;
      
      setIsSupported(hasNotifications && hasPushManager && hasServiceWorker);
      
      if (hasNotifications) {
        setPermission(Notification.permission);
      }
    };

    checkSupport();
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }, [isSupported]);

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported || permission !== 'granted') {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      
      if (!registration) {
        return false;
      }

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      });

      setSubscription(sub);
      
      // Send subscription to server
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sub)
      });

      return true;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return false;
    }
  }, [isSupported, permission]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!subscription) {
      return false;
    }

    try {
      await subscription.unsubscribe();
      setSubscription(null);
      
      // Notify server
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ endpoint: subscription.endpoint })
      });

      return true;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }, [subscription]);

  return {
    permission,
    subscription,
    isSupported,
    requestPermission,
    subscribe,
    unsubscribe
  };
};