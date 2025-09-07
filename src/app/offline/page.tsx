'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Download, 
  Clock, 
  AlertCircle,
  CheckCircle,
  Smartphone,
  Monitor
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

const OfflinePage = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [offlineActions, setOfflineActions] = useState<any[]>([]);
  const [syncProgress, setSyncProgress] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      handleSync();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };

    setIsOnline(navigator.onLine);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Mock offline actions
  useEffect(() => {
    const mockActions = [
      {
        id: '1',
        type: 'task_update',
        title: 'Updated task status',
        description: 'Marked "Install electrical wiring" as completed',
        timestamp: new Date(Date.now() - 10 * 60000),
        synced: false
      },
      {
        id: '2',
        type: 'comment_add',
        title: 'Added comment',
        description: 'Added progress update to foundation task',
        timestamp: new Date(Date.now() - 5 * 60000),
        synced: false
      },
      {
        id: '3',
        type: 'document_upload',
        title: 'Uploaded document',
        description: 'Safety inspection report - Phase 2',
        timestamp: new Date(Date.now() - 2 * 60000),
        synced: false
      }
    ];
    setOfflineActions(mockActions);
  }, []);

  const handleSync = async () => {
    if (!isOnline || isSyncing) return;
    
    setIsSyncing(true);
    setSyncProgress(0);

    // Simulate sync progress
    const interval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSyncing(false);
          setLastSync(new Date());
          // Mark actions as synced
          setOfflineActions(prev => prev.map(action => ({ ...action, synced: true })));
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleRetry = () => {
    window.location.reload();
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center space-x-3">
            <div className="text-6xl">🏗️</div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">ConstructPro</h1>
              <p className="text-gray-600">Construction Project Management</p>
            </div>
          </div>
        </motion.div>

        {/* Connection Status */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className={`border-2 ${isOnline ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {isOnline ? (
                    <Wifi className="h-8 w-8 text-green-600" />
                  ) : (
                    <WifiOff className="h-8 w-8 text-orange-600" />
                  )}
                  <div>
                    <h2 className={`text-xl font-semibold ${isOnline ? 'text-green-900' : 'text-orange-900'}`}>
                      {isOnline ? 'Back Online' : 'You\'re Offline'}
                    </h2>
                    <p className={`text-sm ${isOnline ? 'text-green-700' : 'text-orange-700'}`}>
                      {isOnline 
                        ? 'Connection restored. Syncing your offline changes...'
                        : 'Some features may not be available. Your changes will sync when connection is restored.'
                      }
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge variant={isOnline ? 'default' : 'secondary'}>
                    {isOnline ? 'Connected' : 'Offline Mode'}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetry}
                    disabled={isSyncing}
                  >
                    <RefreshCw className={`h-4 w-4 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
                    Retry
                  </Button>
                </div>
              </div>

              {/* Sync Progress */}
              {isSyncing && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 space-y-2"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span>Syncing offline changes...</span>
                    <span>{syncProgress}%</span>
                  </div>
                  <Progress value={syncProgress} className="h-2" />
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Offline Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Offline Actions</span>
                <Badge variant="outline">
                  {offlineActions.filter(a => !a.synced).length} pending
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {offlineActions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No offline actions recorded</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {offlineActions.map((action, index) => (
                    <motion.div
                      key={action.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-center space-x-3 p-3 rounded-lg border ${
                        action.synced ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${
                        action.synced ? 'bg-green-500' : 'bg-orange-500'
                      }`} />
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-sm">{action.title}</h4>
                          {action.synced ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-orange-500" />
                          )}
                        </div>
                        <p className="text-xs text-gray-600">{action.description}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTimeAgo(action.timestamp)}
                        </p>
                      </div>

                      <Badge variant={action.synced ? 'default' : 'secondary'} className="text-xs">
                        {action.synced ? 'Synced' : 'Pending'}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Offline Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Download className="h-5 w-5" />
                  <span>Available Offline</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">View cached projects</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Update task status</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Add comments and notes</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">View material lists</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Access cached documents</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5" />
                  <span>Requires Connection</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">Real-time collaboration</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">File uploads</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">Live notifications</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">Video calls</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">Fresh data updates</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Last Sync Info */}
        {lastSync && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-center space-x-2 text-blue-700">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm">
                    Last synced: {formatTimeAgo(lastSync)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <Separator />

        {/* PWA Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Progressive Web App Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="h-8 w-8 text-blue-500" />
                    <div>
                      <h4 className="font-semibold">Mobile Optimized</h4>
                      <p className="text-sm text-gray-600">
                        Native app-like experience on mobile devices
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Download className="h-8 w-8 text-green-500" />
                    <div>
                      <h4 className="font-semibold">Offline Support</h4>
                      <p className="text-sm text-gray-600">
                        Continue working even without internet connection
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Monitor className="h-8 w-8 text-purple-500" />
                    <div>
                      <h4 className="font-semibold">Cross-Platform</h4>
                      <p className="text-sm text-gray-600">
                        Works seamlessly across all devices and platforms
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <RefreshCw className="h-8 w-8 text-orange-500" />
                    <div>
                      <h4 className="font-semibold">Auto Sync</h4>
                      <p className="text-sm text-gray-600">
                        Automatic synchronization when connection is restored
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default OfflinePage;