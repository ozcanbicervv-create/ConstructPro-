'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  User, 
  FileText, 
  CheckCircle, 
  Clock, 
  MessageSquare, 
  Upload,
  UserPlus,
  Settings,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface ActivityItem {
  id: string;
  type: ActivityType;
  userId: string;
  userName: string;
  userAvatar?: string;
  title: string;
  description: string;
  metadata?: Record<string, any>;
  timestamp: Date;
  projectId?: string;
  taskId?: string;
  documentId?: string;
}

enum ActivityType {
  PROJECT_CREATED = 'PROJECT_CREATED',
  PROJECT_UPDATED = 'PROJECT_UPDATED',
  PROJECT_STATUS_CHANGED = 'PROJECT_STATUS_CHANGED',
  TASK_CREATED = 'TASK_CREATED',
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_COMPLETED = 'TASK_COMPLETED',
  TASK_STATUS_CHANGED = 'TASK_STATUS_CHANGED',
  DOCUMENT_UPLOADED = 'DOCUMENT_UPLOADED',
  DOCUMENT_SHARED = 'DOCUMENT_SHARED',
  DOCUMENT_APPROVED = 'DOCUMENT_APPROVED',
  COMMENT_ADDED = 'COMMENT_ADDED',
  TEAM_MEMBER_ADDED = 'TEAM_MEMBER_ADDED',
  MATERIAL_ORDERED = 'MATERIAL_ORDERED',
  MILESTONE_REACHED = 'MILESTONE_REACHED',
  SYSTEM_UPDATE = 'SYSTEM_UPDATE'
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  projectId?: string;
  className?: string;
  maxHeight?: string;
  showFilters?: boolean;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  projectId,
  className,
  maxHeight = '400px',
  showFilters = true
}) => {
  const [filter, setFilter] = useState<'all' | ActivityType | 'recent'>('all');
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new activities arrive
  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activities, autoScroll]);

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    if (filter === 'recent') {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      return activity.timestamp > oneHourAgo;
    }
    return activity.type === filter;
  });

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case ActivityType.PROJECT_CREATED:
      case ActivityType.PROJECT_UPDATED:
        return <FileText className="h-4 w-4" />;
      case ActivityType.PROJECT_STATUS_CHANGED:
        return <Settings className="h-4 w-4" />;
      case ActivityType.TASK_CREATED:
      case ActivityType.TASK_ASSIGNED:
        return <CheckCircle className="h-4 w-4" />;
      case ActivityType.TASK_COMPLETED:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case ActivityType.TASK_STATUS_CHANGED:
        return <Clock className="h-4 w-4" />;
      case ActivityType.DOCUMENT_UPLOADED:
      case ActivityType.DOCUMENT_SHARED:
        return <Upload className="h-4 w-4" />;
      case ActivityType.DOCUMENT_APPROVED:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case ActivityType.COMMENT_ADDED:
        return <MessageSquare className="h-4 w-4" />;
      case ActivityType.TEAM_MEMBER_ADDED:
        return <UserPlus className="h-4 w-4" />;
      case ActivityType.MILESTONE_REACHED:
        return <Zap className="h-4 w-4 text-yellow-500" />;
      case ActivityType.SYSTEM_UPDATE:
        return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: ActivityType) => {
    switch (type) {
      case ActivityType.TASK_COMPLETED:
      case ActivityType.DOCUMENT_APPROVED:
        return 'bg-green-100 text-green-700 border-green-200';
      case ActivityType.MILESTONE_REACHED:
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case ActivityType.SYSTEM_UPDATE:
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case ActivityType.TEAM_MEMBER_ADDED:
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const isAtBottom = scrollHeight - scrollTop === clientHeight;
    setAutoScroll(isAtBottom);

    // Load more when near the top
    if (scrollTop < 100 && hasMore && onLoadMore && !isLoading) {
      onLoadMore();
    }
  };

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Activity Feed</span>
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {filteredActivities.length} items
          </Badge>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
              className="h-7 text-xs"
            >
              All
            </Button>
            <Button
              variant={filter === 'recent' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('recent')}
              className="h-7 text-xs"
            >
              Recent
            </Button>
            <Button
              variant={filter === ActivityType.TASK_COMPLETED ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(ActivityType.TASK_COMPLETED)}
              className="h-7 text-xs"
            >
              Tasks
            </Button>
            <Button
              variant={filter === ActivityType.DOCUMENT_UPLOADED ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(ActivityType.DOCUMENT_UPLOADED)}
              className="h-7 text-xs"
            >
              Documents
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea 
          className="px-4"
          style={{ height: maxHeight }}
          onScrollCapture={handleScroll}
          ref={scrollAreaRef}
        >
          {isLoading && activities.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No activity to show</p>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              <AnimatePresence>
                {filteredActivities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ActivityItem
                      activity={activity}
                      getActivityIcon={getActivityIcon}
                      getActivityColor={getActivityColor}
                      formatTimeAgo={formatTimeAgo}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Load More Indicator */}
              {isLoading && (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
                </div>
              )}

              {/* Auto-scroll anchor */}
              <div ref={bottomRef} />
            </div>
          )}
        </ScrollArea>

        {/* Auto-scroll toggle */}
        {!autoScroll && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 right-4"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setAutoScroll(true);
                bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="shadow-lg"
            >
              <Activity className="h-4 w-4 mr-1" />
              New Activity
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

interface ActivityItemProps {
  activity: ActivityItem;
  getActivityIcon: (type: ActivityType) => React.ReactNode;
  getActivityColor: (type: ActivityType) => string;
  formatTimeAgo: (date: Date) => string;
}

const ActivityItem: React.FC<ActivityItemProps> = ({
  activity,
  getActivityIcon,
  getActivityColor,
  formatTimeAgo
}) => {
  return (
    <div className="flex items-start space-x-3 group">
      {/* User Avatar */}
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={activity.userAvatar} alt={activity.userName} />
        <AvatarFallback className="text-xs">
          {activity.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
        </AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Activity Header */}
            <div className="flex items-center space-x-2 mb-1">
              <div className={cn(
                'flex items-center space-x-1 px-2 py-1 rounded-full border text-xs font-medium',
                getActivityColor(activity.type)
              )}>
                {getActivityIcon(activity.type)}
                <span className="capitalize">
                  {activity.type.replace(/_/g, ' ').toLowerCase()}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {formatTimeAgo(activity.timestamp)}
              </span>
            </div>

            {/* Activity Content */}
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-900">
                <span className="font-semibold">{activity.userName}</span>{' '}
                {activity.title}
              </p>
              {activity.description && (
                <p className="text-sm text-gray-600">
                  {activity.description}
                </p>
              )}

              {/* Metadata */}
              {activity.metadata && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {Object.entries(activity.metadata).map(([key, value]) => (
                    <Badge key={key} variant="outline" className="text-xs">
                      {key}: {String(value)}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { ActivityFeed, ActivityType };
export type { ActivityItem };