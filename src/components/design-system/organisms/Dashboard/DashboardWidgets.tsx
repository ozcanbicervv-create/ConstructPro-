'use client';

import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Building, 
  Clock, 
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Activity,
  Calendar,
  FileText,
  Truck
} from 'lucide-react';
import React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// Metric Widget Component
export interface MetricWidgetProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

export const MetricWidget: React.FC<MetricWidgetProps> = ({
  title,
  value,
  change,
  icon,
  color = 'blue'
}) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
    green: 'text-green-600 bg-green-100 dark:bg-green-900/20',
    yellow: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20',
    red: 'text-red-600 bg-red-100 dark:bg-red-900/20',
    purple: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className={cn(
          "p-2 rounded-lg",
          colorClasses[color]
        )}>
          {icon || <Activity className="h-5 w-5" />}
        </div>
        {change && (
          <Badge variant={change.type === 'increase' ? 'default' : 'destructive'}>
            {change.type === 'increase' ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1" />
            )}
            {change.value}%
          </Badge>
        )}
      </div>
      
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
          {title}
        </p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
        {change && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {change.period}
          </p>
        )}
      </div>
    </div>
  );
};

// Progress Widget Component
export interface ProgressWidgetProps {
  title: string;
  projects: Array<{
    id: string;
    name: string;
    progress: number;
    status: 'on-track' | 'delayed' | 'completed' | 'at-risk';
    dueDate?: string;
  }>;
}

export const ProgressWidget: React.FC<ProgressWidgetProps> = ({
  title,
  projects
}) => {
  const statusColors = {
    'on-track': 'bg-green-500',
    'delayed': 'bg-red-500',
    'completed': 'bg-blue-500',
    'at-risk': 'bg-yellow-500',
  };

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900 dark:text-white">
        {title}
      </h4>
      
      <div className="space-y-3">
        {projects.map((project) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  statusColors[project.status]
                )} />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {project.name}
                </span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {project.progress}%
              </span>
            </div>
            <Progress value={project.progress} className="h-2" />
            {project.dueDate && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Due: {project.dueDate}
              </p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Activity Feed Widget
export interface ActivityItem {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  action: string;
  target: string;
  timestamp: string;
  type: 'project' | 'task' | 'document' | 'material' | 'team';
}

export interface ActivityWidgetProps {
  title: string;
  activities: ActivityItem[];
}

export const ActivityWidget: React.FC<ActivityWidgetProps> = ({
  title,
  activities
}) => {
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'project':
        return <Building className="h-4 w-4" />;
      case 'task':
        return <CheckCircle className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'material':
        return <Truck className="h-4 w-4" />;
      case 'team':
        return <Users className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900 dark:text-white">
        {title}
      </h4>
      
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {activities.map((activity) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start space-x-3"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={activity.user.avatar} />
              <AvatarFallback>
                {activity.user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                {getActivityIcon(activity.type)}
                <p className="text-sm text-gray-900 dark:text-white">
                  <span className="font-medium">{activity.user.name}</span>
                  {' '}{activity.action}{' '}
                  <span className="font-medium">{activity.target}</span>
                </p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {activity.timestamp}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Quick Stats Widget
export interface QuickStatsProps {
  stats: Array<{
    label: string;
    value: string | number;
    icon: React.ReactNode;
    color: 'blue' | 'green' | 'yellow' | 'red';
  }>;
}

export const QuickStatsWidget: React.FC<QuickStatsProps> = ({ stats }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
    green: 'text-green-600 bg-green-50 dark:bg-green-900/20',
    yellow: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
    red: 'text-red-600 bg-red-50 dark:bg-red-900/20',
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className={cn(
            "p-3 rounded-lg text-center",
            colorClasses[stat.color]
          )}
        >
          <div className="flex justify-center mb-2">
            {stat.icon}
          </div>
          <p className="text-lg font-bold">
            {stat.value}
          </p>
          <p className="text-xs opacity-80">
            {stat.label}
          </p>
        </motion.div>
      ))}
    </div>
  );
};

// Upcoming Events Widget
export interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'meeting' | 'deadline' | 'inspection' | 'delivery';
  priority: 'low' | 'medium' | 'high';
}

export interface UpcomingEventsProps {
  title: string;
  events: UpcomingEvent[];
}

export const UpcomingEventsWidget: React.FC<UpcomingEventsProps> = ({
  title,
  events
}) => {
  const getEventIcon = (type: UpcomingEvent['type']) => {
    switch (type) {
      case 'meeting':
        return <Users className="h-4 w-4" />;
      case 'deadline':
        return <Clock className="h-4 w-4" />;
      case 'inspection':
        return <CheckCircle className="h-4 w-4" />;
      case 'delivery':
        return <Truck className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: UpcomingEvent['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'low':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900 dark:text-white">
        {title}
      </h4>
      
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {events.map((event) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <div className={cn(
              "p-1.5 rounded-md",
              getPriorityColor(event.priority)
            )}>
              {getEventIcon(event.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {event.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {event.date} at {event.time}
              </p>
            </div>
            
            <Badge variant="outline" className="text-xs">
              {event.type}
            </Badge>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Export all widgets
export const DashboardWidgets = {
  MetricWidget,
  ProgressWidget,
  ActivityWidget,
  QuickStatsWidget,
  UpcomingEventsWidget,
};

export default DashboardWidgets;