'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Smartphone, 
  Download, 
  Wifi, 
  WifiOff, 
  Bell, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Monitor,
  Globe,
  Shield,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  PWAInstallPrompt,
  PWAUpdatePrompt,
  PWAStatus
} from '@/components/design-system/organisms/PWA';
import { usePWA, usePushNotifications, useOfflineSync } from '@/hooks/usePWA';

const TestPWAPage = () => {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [simulateOffline, setSimulateOffline] = useState(false);

  const { 
    isInstallable, 
    isInstalled, 
    isOnline, 
    isSupported,
    install,
    checkForUpdates 
  } = usePWA();

  const {
    permission,
    isSupported: notificationsSupported,
    requestPermission,
    subscribe,
    unsubscribe
  } = usePushNotifications();

  const {
    offlineActions,
    isSyncing,
    lastSync,
    addOfflineAction,
    syncOfflineActions
  } = useOfflineSync();

  // Simulate offline mode
  useEffect(() => {
    if (simulateOffline) {
      // Override navigator.onLine
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });
      window.dispatchEvent(new Event('offline'));
    } else {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true
      });
      window.dispatchEvent(new Event('online'));
    }
  }, [simulateOffline]);

  const handleTestNotification = async () => {
    if (permission === 'granted') {
      // Send a test notification
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          registration.showNotification('ConstructPro Test', {
            body: 'This is a test notification from ConstructPro PWA',
            icon: '/logo.svg',
            badge: '/logo.svg',
            tag: 'test-notification',
            actions: [
              {
                action: 'view',
                title: 'View Project'
              }
            ]
          });
        }
      }
    } else {
      await requestPermission();
    }
  };

  const handleAddOfflineAction = () => {
    const actions = [
      {
        type: 'task_update',
        title: 'Updated task status',
        description: 'Marked task as completed',
        url: '/api/tasks/123',
        method: 'PATCH',
        body: { status: 'completed' }
      },
      {
        type: 'comment_add',
        title: 'Added comment',
        description: 'Added progress update',
        url: '/api/comments',
        method: 'POST',
        body: { text: 'Work completed successfully' }
      },
      {
        type: 'document_upload',
        title: 'Uploaded document',
        description: 'Safety inspection report',
        url: '/api/documents',
        method: 'POST',
        body: { name: 'safety-report.pdf' }
      }
    ];

    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    addOfflineAction(randomAction);
  };

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Never';
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Progressive Web App Features
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Comprehensive PWA implementation with offline support, push notifications, 
            app installation, and native-like experience for construction project management.
          </p>
          
          {/* PWA Status Bar */}
          <div className="flex justify-center">
            <PWAStatus />
          </div>
        </div>

        {/* PWA Feature Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className={`${isSupported ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
            <CardContent className="p-4 text-center">
              <Smartphone className={`h-8 w-8 mx-auto mb-2 ${isSupported ? 'text-green-600' : 'text-gray-400'}`} />
              <h3 className="font-semibold mb-1">PWA Support</h3>
              <Badge variant={isSupported ? 'default' : 'secondary'}>
                {isSupported ? 'Supported' : 'Not Supported'}
              </Badge>
            </CardContent>
          </Card>

          <Card className={`${isInstalled ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}>
            <CardContent className="p-4 text-center">
              <Download className={`h-8 w-8 mx-auto mb-2 ${isInstalled ? 'text-blue-600' : 'text-gray-400'}`} />
              <h3 className="font-semibold mb-1">Installation</h3>
              <Badge variant={isInstalled ? 'default' : 'secondary'}>
                {isInstalled ? 'Installed' : 'Browser'}
              </Badge>
            </CardContent>
          </Card>

          <Card className={`${isOnline ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
            <CardContent className="p-4 text-center">
              {isOnline ? (
                <Wifi className="h-8 w-8 mx-auto mb-2 text-green-600" />
              ) : (
                <WifiOff className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              )}
              <h3 className="font-semibold mb-1">Connection</h3>
              <Badge variant={isOnline ? 'default' : 'secondary'}>
                {isOnline ? 'Online' : 'Offline'}
              </Badge>
            </CardContent>
          </Card>

          <Card className={`${permission === 'granted' ? 'border-purple-200 bg-purple-50' : 'border-gray-200'}`}>
            <CardContent className="p-4 text-center">
              <Bell className={`h-8 w-8 mx-auto mb-2 ${permission === 'granted' ? 'text-purple-600' : 'text-gray-400'}`} />
              <h3 className="font-semibold mb-1">Notifications</h3>
              <Badge variant={permission === 'granted' ? 'default' : 'secondary'}>
                {permission === 'granted' ? 'Enabled' : 'Disabled'}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Installation & Updates */}
          <Card>
            <CardHeader>
              <CardTitle>Installation & Updates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">PWA Installable</span>
                  <Badge variant={isInstallable ? 'default' : 'secondary'}>
                    {isInstallable ? 'Yes' : 'No'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Currently Installed</span>
                  <Badge variant={isInstalled ? 'default' : 'secondary'}>
                    {isInstalled ? 'Yes' : 'No'}
                  </Badge>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Button
                    onClick={() => setShowInstallPrompt(true)}
                    disabled={!isInstallable || isInstalled}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Show Install Prompt
                  </Button>
                  
                  <Button
                    onClick={() => setShowUpdatePrompt(true)}
                    variant="outline"
                    className="w-full"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Show Update Prompt
                  </Button>
                  
                  <Button
                    onClick={checkForUpdates}
                    variant="outline"
                    className="w-full"
                  >
                    Check for Updates
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>Push Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Browser Support</span>
                  <Badge variant={notificationsSupported ? 'default' : 'secondary'}>
                    {notificationsSupported ? 'Supported' : 'Not Supported'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Permission Status</span>
                  <Badge variant={permission === 'granted' ? 'default' : 'secondary'}>
                    {permission}
                  </Badge>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Button
                    onClick={requestPermission}
                    disabled={permission === 'granted'}
                    className="w-full"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Request Permission
                  </Button>
                  
                  <Button
                    onClick={subscribe}
                    disabled={permission !== 'granted'}
                    variant="outline"
                    className="w-full"
                  >
                    Subscribe to Push
                  </Button>
                  
                  <Button
                    onClick={handleTestNotification}
                    disabled={permission !== 'granted'}
                    variant="outline"
                    className="w-full"
                  >
                    Send Test Notification
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Offline Support */}
          <Card>
            <CardHeader>
              <CardTitle>Offline Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Connection Status</span>
                  <div className="flex items-center space-x-2">
                    {isOnline ? (
                      <Wifi className="h-4 w-4 text-green-500" />
                    ) : (
                      <WifiOff className="h-4 w-4 text-orange-500" />
                    )}
                    <span className="text-sm">{isOnline ? 'Online' : 'Offline'}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Pending Actions</span>
                  <Badge variant={offlineActions.filter(a => !a.synced).length > 0 ? 'destructive' : 'default'}>
                    {offlineActions.filter(a => !a.synced).length}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Last Sync</span>
                  <span className="text-xs text-gray-500">
                    {formatLastSync(lastSync)}
                  </span>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Simulate Offline</span>
                    <Switch
                      checked={simulateOffline}
                      onCheckedChange={setSimulateOffline}
                    />
                  </div>
                  
                  <Button
                    onClick={handleAddOfflineAction}
                    variant="outline"
                    className="w-full"
                  >
                    Add Test Offline Action
                  </Button>
                  
                  <Button
                    onClick={syncOfflineActions}
                    disabled={isSyncing || !isOnline}
                    variant="outline"
                    className="w-full"
                  >
                    {isSyncing ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Sync Now
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Offline Actions List */}
          <Card>
            <CardHeader>
              <CardTitle>Offline Actions Queue</CardTitle>
            </CardHeader>
            <CardContent>
              {offlineActions.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No offline actions</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {offlineActions.map((action) => (
                    <div
                      key={action.id}
                      className={`p-3 rounded-lg border ${
                        action.synced ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm">{action.title}</h4>
                        {action.synced ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-orange-500" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600">{action.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="outline" className="text-xs">
                          {action.type}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {new Date(action.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* PWA Benefits */}
        <Card>
          <CardHeader>
            <CardTitle>Progressive Web App Benefits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center space-y-2">
                <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto">
                  <Smartphone className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-semibold">Native Experience</h4>
                <p className="text-sm text-gray-600">
                  App-like interface with smooth animations and native interactions
                </p>
              </div>

              <div className="text-center space-y-2">
                <div className="p-3 bg-green-100 rounded-full w-fit mx-auto">
                  <WifiOff className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-semibold">Offline First</h4>
                <p className="text-sm text-gray-600">
                  Continue working without internet connection with automatic sync
                </p>
              </div>

              <div className="text-center space-y-2">
                <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto">
                  <Zap className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-semibold">Fast Loading</h4>
                <p className="text-sm text-gray-600">
                  Instant loading with service worker caching and optimization
                </p>
              </div>

              <div className="text-center space-y-2">
                <div className="p-3 bg-orange-100 rounded-full w-fit mx-auto">
                  <Shield className="h-6 w-6 text-orange-600" />
                </div>
                <h4 className="font-semibold">Secure</h4>
                <p className="text-sm text-gray-600">
                  HTTPS required with secure data transmission and storage
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Implementation Status */}
        <Card>
          <CardHeader>
            <CardTitle>Implementation Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-green-600">✅ Implemented Features</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Service Worker with caching strategies</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Web App Manifest with icons and shortcuts</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Offline functionality with data sync</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Push notification support</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Install prompts and update handling</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>App-like navigation patterns</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-blue-600">🔧 Technical Implementation</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <Monitor className="h-4 w-4 text-blue-500" />
                    <span>React hooks for PWA functionality</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-blue-500" />
                    <span>Network-first and cache-first strategies</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4 text-blue-500" />
                    <span>Background sync for offline actions</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Bell className="h-4 w-4 text-blue-500" />
                    <span>Push notification subscription management</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Download className="h-4 w-4 text-blue-500" />
                    <span>Install prompt handling and UI</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-blue-500" />
                    <span>Secure HTTPS-only operation</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PWA Prompts */}
        {showInstallPrompt && (
          <PWAInstallPrompt
            onInstall={() => setShowInstallPrompt(false)}
            onDismiss={() => setShowInstallPrompt(false)}
          />
        )}

        {showUpdatePrompt && (
          <PWAUpdatePrompt
            onUpdate={() => setShowUpdatePrompt(false)}
            onDismiss={() => setShowUpdatePrompt(false)}
          />
        )}
      </div>
    </div>
  );
};

export default TestPWAPage;