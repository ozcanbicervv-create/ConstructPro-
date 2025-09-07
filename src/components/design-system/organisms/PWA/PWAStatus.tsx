'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wifi, 
  WifiOff, 
  Smartphone, 
  Download, 
  Bell, 
  BellOff,
  Settings,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import React, { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { usePWA, usePushNotifications, useOfflineSync } from '@/hooks/usePWA';

interface PWAStatusProps {
  className?: string;
}

const PWAStatus: React.FC<PWAStatusProps> = ({ className }) => {
  const { 
    isInstalled, 
    isOnline, 
    isSupported, 
    checkForUpdates 
  } = usePWA();
  
  const { 
    permission, 
    isSupported: notificationsSupported,
    requestPermission,
    subscribe,
    unsubscribe,
    subscription
  } = usePushNotifications();
  
  const { 
    offlineActions, 
    isSyncing, 
    lastSync,
    syncOfflineActions 
  } = useOfflineSync();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestPermission();
      if (granted) {
        await subscribe();
      }
    } else {
      await unsubscribe();
    }
  };

  const handleCheckUpdates = async () => {
    setIsCheckingUpdates(true);
    try {
      await checkForUpdates();
    } finally {
      setIsCheckingUpdates(false);
    }
  };

  const formatLastSync = (date: Date | null) => {
    if (!date) {return 'Never';}
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) {return 'Just now';}
    if (minutes < 60) {return `${minutes}m ago`;}
    return date.toLocaleTimeString();
  };

  const pendingActions = offlineActions.filter(action => !action.synced).length;

  return (
    <TooltipProvider>
      <div className={className}>
        {/* Compact Status Bar */}
        <div className="flex items-center space-x-2">
          {/* Online/Offline Status */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                isOnline 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-orange-100 text-orange-700'
              }`}>
                {isOnline ? (
                  <Wifi className="h-3 w-3" />
                ) : (
                  <WifiOff className="h-3 w-3" />
                )}
                <span>{isOnline ? 'Online' : 'Offline'}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isOnline ? 'Connected to internet' : 'Working offline'}</p>
            </TooltipContent>
          </Tooltip>

          {/* PWA Installation Status */}
          {isSupported && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                  isInstalled 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  <Smartphone className="h-3 w-3" />
                  <span>{isInstalled ? 'Installed' : 'Web'}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isInstalled ? 'Running as installed app' : 'Running in browser'}</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Offline Actions */}
          {pendingActions > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="text-xs">
                  {pendingActions} pending
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{pendingActions} actions waiting to sync</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Sync Status */}
          {isSyncing && (
            <div className="flex items-center space-x-1 text-blue-600">
              <RefreshCw className="h-3 w-3 animate-spin" />
              <span className="text-xs">Syncing...</span>
            </div>
          )}

          {/* Settings Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 w-6 p-0"
          >
            <Settings className="h-3 w-3" />
          </Button>
        </div>

        {/* Expanded Settings Panel */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-2"
            >
              <Card className="w-80">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">PWA Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Connection Status */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Connection</h4>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {isOnline ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-orange-500" />
                        )}
                        <span className="text-sm">
                          {isOnline ? 'Connected' : 'Offline mode'}
                        </span>
                      </div>
                      {!isOnline && pendingActions > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={syncOfflineActions}
                          disabled={isSyncing}
                        >
                          {isSyncing ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            'Retry Sync'
                          )}
                        </Button>
                      )}
                    </div>
                    {lastSync && (
                      <p className="text-xs text-gray-500">
                        Last sync: {formatLastSync(lastSync)}
                      </p>
                    )}
                  </div>

                  <Separator />

                  {/* Notifications */}
                  {notificationsSupported && (
                    <>
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Notifications</h4>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {permission === 'granted' ? (
                              <Bell className="h-4 w-4 text-blue-500" />
                            ) : (
                              <BellOff className="h-4 w-4 text-gray-400" />
                            )}
                            <span className="text-sm">Push notifications</span>
                          </div>
                          <Switch
                            checked={permission === 'granted' && !!subscription}
                            onCheckedChange={handleNotificationToggle}
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          Get notified about project updates and tasks
                        </p>
                      </div>
                      <Separator />
                    </>
                  )}

                  {/* App Status */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">App Status</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Installation</span>
                        <Badge variant={isInstalled ? 'default' : 'secondary'}>
                          {isInstalled ? 'Installed' : 'Browser'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Offline support</span>
                        <Badge variant="default">Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Updates</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCheckUpdates}
                          disabled={isCheckingUpdates}
                        >
                          {isCheckingUpdates ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            'Check'
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Offline Actions */}
                  {offlineActions.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Offline Actions</h4>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {offlineActions.slice(0, 3).map((action) => (
                            <div key={action.id} className="flex items-center justify-between text-xs">
                              <span className="truncate">{action.title}</span>
                              {action.synced ? (
                                <CheckCircle className="h-3 w-3 text-green-500" />
                              ) : (
                                <AlertCircle className="h-3 w-3 text-orange-500" />
                              )}
                            </div>
                          ))}
                          {offlineActions.length > 3 && (
                            <p className="text-xs text-gray-500">
                              +{offlineActions.length - 3} more actions
                            </p>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Info */}
                  <div className="flex items-start space-x-2 p-2 bg-blue-50 rounded-lg">
                    <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                    <div className="text-xs text-blue-700">
                      <p className="font-medium">Progressive Web App</p>
                      <p>This app works offline and can be installed on your device for a native experience.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
};

export default PWAStatus;