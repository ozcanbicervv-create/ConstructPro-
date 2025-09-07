'use client';

import { motion } from 'framer-motion';
import { 
  Building, 
  Users, 
  Clock, 
  DollarSign, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Truck,
  FileText,
  Calendar
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { DashboardLayout, DashboardWidget } from './DashboardLayout';
import { 
  MetricWidget, 
  ProgressWidget, 
  ActivityWidget, 
  QuickStatsWidget,
  UpcomingEventsWidget,
  ActivityItem,
  UpcomingEvent
} from './DashboardWidgets';

// Mock data for demonstration
const mockMetrics = {
  totalProjects: { value: 24, change: { value: 12, type: 'increase' as const, period: 'vs last month' } },
  activeProjects: { value: 18, change: { value: 8, type: 'increase' as const, period: 'vs last month' } },
  totalBudget: { value: '$2.4M', change: { value: 15, type: 'increase' as const, period: 'vs last quarter' } },
  teamMembers: { value: 156, change: { value: 5, type: 'increase' as const, period: 'vs last month' } },
};

const mockProjects = [
  {
    id: '1',
    name: 'Downtown Office Complex',
    progress: 75,
    status: 'on-track' as const,
    dueDate: 'Dec 15, 2024'
  },
  {
    id: '2',
    name: 'Residential Tower A',
    progress: 45,
    status: 'delayed' as const,
    dueDate: 'Jan 30, 2025'
  },
  {
    id: '3',
    name: 'Shopping Mall Renovation',
    progress: 90,
    status: 'on-track' as const,
    dueDate: 'Nov 20, 2024'
  },
  {
    id: '4',
    name: 'Bridge Construction',
    progress: 30,
    status: 'at-risk' as const,
    dueDate: 'Mar 15, 2025'
  }
];

const mockActivities: ActivityItem[] = [
  {
    id: '1',
    user: { name: 'John Smith', avatar: '/avatars/john.jpg' },
    action: 'completed task',
    target: 'Foundation Inspection',
    timestamp: '2 hours ago',
    type: 'task'
  },
  {
    id: '2',
    user: { name: 'Sarah Johnson', avatar: '/avatars/sarah.jpg' },
    action: 'uploaded document',
    target: 'Safety Report Q4',
    timestamp: '4 hours ago',
    type: 'document'
  },
  {
    id: '3',
    user: { name: 'Mike Wilson', avatar: '/avatars/mike.jpg' },
    action: 'updated project',
    target: 'Downtown Office Complex',
    timestamp: '6 hours ago',
    type: 'project'
  },
  {
    id: '4',
    user: { name: 'Lisa Chen', avatar: '/avatars/lisa.jpg' },
    action: 'ordered materials',
    target: 'Steel Beams - 50 units',
    timestamp: '1 day ago',
    type: 'material'
  }
];

const mockEvents: UpcomingEvent[] = [
  {
    id: '1',
    title: 'Safety Inspection - Tower A',
    date: 'Today',
    time: '2:00 PM',
    type: 'inspection',
    priority: 'high'
  },
  {
    id: '2',
    title: 'Client Meeting - Office Complex',
    date: 'Tomorrow',
    time: '10:00 AM',
    type: 'meeting',
    priority: 'medium'
  },
  {
    id: '3',
    title: 'Material Delivery',
    date: 'Dec 12',
    time: '8:00 AM',
    type: 'delivery',
    priority: 'medium'
  },
  {
    id: '4',
    title: 'Project Deadline - Mall Renovation',
    date: 'Dec 15',
    time: '5:00 PM',
    type: 'deadline',
    priority: 'high'
  }
];

const quickStats = [
  {
    label: 'On Schedule',
    value: '85%',
    icon: <CheckCircle className="h-5 w-5" />,
    color: 'green' as const
  },
  {
    label: 'Budget Used',
    value: '67%',
    icon: <DollarSign className="h-5 w-5" />,
    color: 'blue' as const
  },
  {
    label: 'At Risk',
    value: '3',
    icon: <AlertTriangle className="h-5 w-5" />,
    color: 'yellow' as const
  },
  {
    label: 'Overdue',
    value: '1',
    icon: <Clock className="h-5 w-5" />,
    color: 'red' as const
  }
];

// Dashboard Component
export interface DashboardProps {
  className?: string;
  onWidgetAdd?: () => void;
  onWidgetRemove?: (widgetId: string) => void;
  onWidgetConfigure?: (widgetId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  className,
  onWidgetAdd,
  onWidgetRemove,
  onWidgetConfigure
}) => {
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize widgets
  useEffect(() => {
    const initialWidgets: DashboardWidget[] = [
      {
        id: 'total-projects',
        title: 'Total Projects',
        type: 'metric',
        size: 'sm',
        component: () => (
          <MetricWidget
            title="Total Projects"
            value={mockMetrics.totalProjects.value}
            change={mockMetrics.totalProjects.change}
            icon={<Building className="h-5 w-5" />}
            color="blue"
          />
        ),
        refreshable: true
      },
      {
        id: 'active-projects',
        title: 'Active Projects',
        type: 'metric',
        size: 'sm',
        component: () => (
          <MetricWidget
            title="Active Projects"
            value={mockMetrics.activeProjects.value}
            change={mockMetrics.activeProjects.change}
            icon={<TrendingUp className="h-5 w-5" />}
            color="green"
          />
        ),
        refreshable: true
      },
      {
        id: 'total-budget',
        title: 'Total Budget',
        type: 'metric',
        size: 'sm',
        component: () => (
          <MetricWidget
            title="Total Budget"
            value={mockMetrics.totalBudget.value}
            change={mockMetrics.totalBudget.change}
            icon={<DollarSign className="h-5 w-5" />}
            color="purple"
          />
        ),
        refreshable: true
      },
      {
        id: 'team-members',
        title: 'Team Members',
        type: 'metric',
        size: 'sm',
        component: () => (
          <MetricWidget
            title="Team Members"
            value={mockMetrics.teamMembers.value}
            change={mockMetrics.teamMembers.change}
            icon={<Users className="h-5 w-5" />}
            color="yellow"
          />
        ),
        refreshable: true
      },
      {
        id: 'project-progress',
        title: 'Project Progress',
        type: 'progress',
        size: 'md',
        component: () => (
          <ProgressWidget
            title="Active Projects"
            projects={mockProjects}
          />
        ),
        refreshable: true,
        configurable: true
      },
      {
        id: 'quick-stats',
        title: 'Quick Stats',
        type: 'metric',
        size: 'md',
        component: () => (
          <QuickStatsWidget stats={quickStats} />
        ),
        refreshable: true
      },
      {
        id: 'recent-activity',
        title: 'Recent Activity',
        type: 'activity',
        size: 'md',
        component: () => (
          <ActivityWidget
            title="Recent Activity"
            activities={mockActivities}
          />
        ),
        refreshable: true,
        configurable: true
      },
      {
        id: 'upcoming-events',
        title: 'Upcoming Events',
        type: 'list',
        size: 'md',
        component: () => (
          <UpcomingEventsWidget
            title="Upcoming Events"
            events={mockEvents}
          />
        ),
        refreshable: true,
        configurable: true
      }
    ];

    // Simulate loading
    setTimeout(() => {
      setWidgets(initialWidgets);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleWidgetReorder = (newWidgets: DashboardWidget[]) => {
    setWidgets(newWidgets);
    // Here you would typically save the new order to the backend
    console.log('Widget order updated:', newWidgets.map(w => w.id));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="h-48 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout
      title="ConstructPro Dashboard"
      subtitle="Welcome back! Here's what's happening with your projects."
      widgets={widgets}
      onWidgetReorder={handleWidgetReorder}
      onWidgetAdd={onWidgetAdd}
      onWidgetRemove={onWidgetRemove}
      onWidgetConfigure={onWidgetConfigure}
      className={className}
    />
  );
};

export default Dashboard;