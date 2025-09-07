'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { usePWA } from '@/hooks/usePWA';

interface PWAUpdatePromptProps {
  onUpdate?: () => void;
  onDismiss?: () => void;
  className?: string;
}

const PWAUpdatePrompt: React.FC<PWAUpdatePromptProps> = ({
  onUpdate,
  onDismiss,
  className
}) => {
  const { checkForUpdates, skipWaiting } = usePWA();
  const [hasUpdate, setHasUpdate] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<any>(null);

  // Check for updates periodically
  useEffect(() => {
    const checkUpdates = async () => {
      try {
        const hasUpdates = await checkForUpdates();
        setHasUpdate(hasUpdates);
        
        if (hasUpdates) {
          // Mock update info - in real app, this would come from service worker
          setUpdateInfo({
            version: '1.1.0',
            features: [
              'Improved offline support',
              'New material tracking features',
              'Enhanced performance',
              'Bug fixes and improvements'
            ],
            size: '2.3 MB'
          });
        }
      } catch (error) {
        console.error('Failed to check for updates:', error);
      }
    };

    // Check immediately
    checkUpdates();

    // Check every 30 minutes
    const interval = setInterval(checkUpdates, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [checkForUpdates]);

  // Listen for service worker updates
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Reload the page when new service worker takes control
        window.location.reload();
      });
    }
  }, []);

  // Don't show if no update available or dismissed
  if (!hasUpdate || isDismissed) {
    return null;
  }

  const handleUpdate = async () => {
    setIsUpdating(true);
    setUpdateProgress(0);

    try {
      // Simulate update progress
      const progressInterval = setInterval(() => {
        setUpdateProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Skip waiting and activate new service worker
      skipWaiting();
      
      // Complete progress
      setTimeout(() => {
        setUpdateProgress(100);
        onUpdate?.();
        
        // Reload will happen automatically when service worker takes control
      }, 2000);

    } catch (error) {
      console.error('Update failed:', error);
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={`fixed bottom-4 left-4 z-50 max-w-sm ${className}`}
      >
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <RefreshCw className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Update Available</CardTitle>
                  <p className="text-sm text-gray-600">
                    {updateInfo?.version ? `Version ${updateInfo.version}` : 'New features and improvements'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="h-8 w-8 p-0"
                disabled={isUpdating}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Update Progress */}
            {isUpdating && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between text-sm">
                  <span>Updating...</span>
                  <span>{updateProgress}%</span>
                </div>
                <Progress value={updateProgress} className="h-2" />
                {updateProgress === 100 && (
                  <div className="flex items-center space-x-2 text-green-600 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    <span>Update complete! Reloading...</span>
                  </div>
                )}
              </motion.div>
            )}

            {/* Update Features */}
            {!isUpdating && updateInfo?.features && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">What's new:</h4>
                <ul className="space-y-1">
                  {updateInfo.features.slice(0, 3).map((feature: string, index: number) => (
                    <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {updateInfo.features.length > 3 && (
                    <li className="text-sm text-gray-500 ml-3.5">
                      +{updateInfo.features.length - 3} more improvements
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Update Info */}
            {!isUpdating && updateInfo && (
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Size: {updateInfo.size}</span>
                <Badge variant="outline" className="text-xs">
                  Recommended
                </Badge>
              </div>
            )}

            {/* Action Buttons */}
            {!isUpdating && (
              <div className="flex space-x-2">
                <Button
                  onClick={handleUpdate}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Update Now
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDismiss}
                  className="px-3"
                >
                  Later
                </Button>
              </div>
            )}

            {/* Warning for critical updates */}
            {updateInfo?.critical && (
              <div className="flex items-center space-x-2 p-2 bg-orange-50 rounded-lg border border-orange-200">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <span className="text-xs text-orange-700">
                  This update includes important security fixes
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default PWAUpdatePrompt;