'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  X, 
  Smartphone, 
  Monitor, 
  Wifi, 
  Bell,
  Zap,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { usePWA } from '@/hooks/usePWA';

interface PWAInstallPromptProps {
  onInstall?: () => void;
  onDismiss?: () => void;
  className?: string;
}

const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({
  onInstall,
  onDismiss,
  className
}) => {
  const { isInstallable, isInstalled, install } = usePWA();
  const [isInstalling, setIsInstalling] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show if not installable, already installed, or dismissed
  if (!isInstallable || isInstalled || isDismissed) {
    return null;
  }

  const handleInstall = async () => {
    setIsInstalling(true);
    
    try {
      const success = await install();
      
      if (success) {
        onInstall?.();
      }
    } catch (error) {
      console.error('Installation failed:', error);
    } finally {
      setIsInstalling(false);
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
        className={`fixed bottom-4 right-4 z-50 max-w-sm ${className}`}
      >
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Download className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Install ConstructPro</CardTitle>
                  <p className="text-sm text-gray-600">Get the full app experience</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Features */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-sm">Works offline</span>
              </div>
              <div className="flex items-center space-x-3">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Faster loading</span>
              </div>
              <div className="flex items-center space-x-3">
                <Bell className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Push notifications</span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="h-4 w-4 text-purple-500" />
                <span className="text-sm">Secure & private</span>
              </div>
            </div>

            <Separator />

            {/* Device Icons */}
            <div className="flex items-center justify-center space-x-4 py-2">
              <div className="flex items-center space-x-1 text-gray-600">
                <Smartphone className="h-4 w-4" />
                <span className="text-xs">Mobile</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-600">
                <Monitor className="h-4 w-4" />
                <span className="text-xs">Desktop</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Button
                onClick={handleInstall}
                disabled={isInstalling}
                className="flex-1"
              >
                {isInstalling ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Installing...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Install App
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleDismiss}
                className="px-3"
              >
                Later
              </Button>
            </div>

            {/* App Info */}
            <div className="text-center">
              <Badge variant="secondary" className="text-xs">
                Free • No app store required
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default PWAInstallPrompt;