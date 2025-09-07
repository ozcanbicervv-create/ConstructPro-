'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Circle, Eye, Edit3, MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

interface OnlineUser extends User {
  isOnline: boolean;
  lastSeen: Date;
  currentActivity?: 'viewing' | 'editing' | 'typing';
  currentLocation?: string;
}

interface PresenceIndicatorsProps {
  onlineUsers: OnlineUser[];
  currentUserId: string;
  projectId?: string;
  documentId?: string;
  showActivity?: boolean;
  maxVisible?: number;
  className?: string;
}

const PresenceIndicators: React.FC<PresenceIndicatorsProps> = ({
  onlineUsers,
  currentUserId,
  projectId,
  documentId,
  showActivity = true,
  maxVisible = 5,
  className
}) => {
  const [expandedView, setExpandedView] = useState(false);

  // Filter out current user and sort by activity
  const otherUsers = onlineUsers
    .filter(user => user.id !== currentUserId)
    .sort((a, b) => {
      // Sort by online status first, then by activity
      if (a.isOnline !== b.isOnline) {
        return a.isOnline ? -1 : 1;
      }
      if (a.currentActivity && !b.currentActivity) return -1;
      if (!a.currentActivity && b.currentActivity) return 1;
      return 0;
    });

  const visibleUsers = expandedView ? otherUsers : otherUsers.slice(0, maxVisible);
  const hiddenCount = Math.max(0, otherUsers.length - maxVisible);

  const getActivityIcon = (activity?: string) => {
    switch (activity) {
      case 'editing':
        return <Edit3 className="h-3 w-3" />;
      case 'typing':
        return <MessageCircle className="h-3 w-3" />;
      case 'viewing':
        return <Eye className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getActivityColor = (activity?: string) => {
    switch (activity) {
      case 'editing':
        return 'text-orange-500';
      case 'typing':
        return 'text-blue-500';
      case 'viewing':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  const formatLastSeen = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return 'Earlier';
  };

  if (otherUsers.length === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className={cn('flex items-center space-x-2', className)}>
        {/* User Avatars */}
        <div className="flex items-center -space-x-2">
          <AnimatePresence>
            {visibleUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative">
                      <Avatar className={cn(
                        'h-8 w-8 border-2 border-white shadow-sm cursor-pointer transition-transform hover:scale-110',
                        user.isOnline ? 'ring-2 ring-green-400' : 'opacity-60'
                      )}>
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="text-xs">
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      {/* Online Status Indicator */}
                      <div className={cn(
                        'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white',
                        user.isOnline ? 'bg-green-400' : 'bg-gray-400'
                      )}>
                        {user.isOnline && (
                          <motion.div
                            className="w-full h-full bg-green-400 rounded-full"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        )}
                      </div>

                      {/* Activity Indicator */}
                      {showActivity && user.currentActivity && user.isOnline && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={cn(
                            'absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white shadow-sm border flex items-center justify-center',
                            getActivityColor(user.currentActivity)
                          )}
                        >
                          {getActivityIcon(user.currentActivity)}
                        </motion.div>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <div className="space-y-1">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      {user.role && (
                        <Badge variant="secondary" className="text-xs">
                          {user.role}
                        </Badge>
                      )}
                      <div className="flex items-center space-x-1 text-xs">
                        <Circle className={cn(
                          'h-2 w-2 fill-current',
                          user.isOnline ? 'text-green-400' : 'text-gray-400'
                        )} />
                        <span>
                          {user.isOnline ? 'Online' : `Last seen ${formatLastSeen(user.lastSeen)}`}
                        </span>
                      </div>
                      {user.currentActivity && user.isOnline && (
                        <div className="flex items-center space-x-1 text-xs">
                          <span className={getActivityColor(user.currentActivity)}>
                            {getActivityIcon(user.currentActivity)}
                          </span>
                          <span className="capitalize">{user.currentActivity}</span>
                          {user.currentLocation && (
                            <span className="text-gray-500">in {user.currentLocation}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Show More Button */}
          {hiddenCount > 0 && !expandedView && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExpandedView(true)}
                    className="h-8 w-8 rounded-full p-0 border-2 border-white shadow-sm"
                  >
                    <span className="text-xs font-medium">+{hiddenCount}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{hiddenCount} more user{hiddenCount > 1 ? 's' : ''} online</p>
                </TooltipContent>
              </Tooltip>
            </motion.div>
          )}
        </div>

        {/* Online Count */}
        <div className="flex items-center space-x-1 text-sm text-gray-600">
          <Users className="h-4 w-4" />
          <span>{otherUsers.filter(u => u.isOnline).length} online</span>
        </div>

        {/* Expanded View Modal */}
        <AnimatePresence>
          {expandedView && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/20 z-40"
                onClick={() => setExpandedView(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
              >
                <Card className="w-80 max-h-96 shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Team Members</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedView(false)}
                      >
                        ×
                      </Button>
                    </div>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {otherUsers.map((user) => (
                        <div key={user.id} className="flex items-center space-x-3">
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={user.avatar} alt={user.name} />
                              <AvatarFallback>
                                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className={cn(
                              'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white',
                              user.isOnline ? 'bg-green-400' : 'bg-gray-400'
                            )} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{user.name}</p>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <span>
                                {user.isOnline ? 'Online' : `Last seen ${formatLastSeen(user.lastSeen)}`}
                              </span>
                              {user.currentActivity && user.isOnline && (
                                <div className="flex items-center space-x-1">
                                  <span className={getActivityColor(user.currentActivity)}>
                                    {getActivityIcon(user.currentActivity)}
                                  </span>
                                  <span className="capitalize">{user.currentActivity}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
};

export default PresenceIndicators;