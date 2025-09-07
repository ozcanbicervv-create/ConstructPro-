'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Play,
  Pause,
  Flag,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import React, { useState, useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';


// Types for timeline data
export interface TimelineTask {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  duration: number; // in days
  progress: number; // 0-100
  status: 'not-started' | 'in-progress' | 'completed' | 'delayed' | 'on-hold';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignees: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  dependencies?: string[]; // task IDs
  category: string;
  description?: string;
}

export interface TimelineMilestone {
  id: string;
  name: string;
  date: string;
  type: 'start' | 'end' | 'checkpoint' | 'deadline';
  status: 'upcoming' | 'current' | 'completed' | 'missed';
  description?: string;
}

// Gantt Chart Component
export interface GanttChartProps {
  tasks: TimelineTask[];
  milestones?: TimelineMilestone[];
  title?: string;
  startDate?: string;
  endDate?: string;
  className?: string;
  onTaskClick?: (task: TimelineTask) => void;
  onMilestoneClick?: (milestone: TimelineMilestone) => void;
}

export const GanttChart: React.FC<GanttChartProps> = ({
  tasks,
  milestones = [],
  title = "Project Timeline",
  startDate,
  endDate,
  className,
  onTaskClick,
  onMilestoneClick
}) => {
  const [zoomLevel, setZoomLevel] = useState<'days' | 'weeks' | 'months'>('weeks');
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  // Calculate timeline bounds
  const timelineBounds = useMemo(() => {
    const allDates = [
      ...tasks.map(t => new Date(t.startDate)),
      ...tasks.map(t => new Date(t.endDate)),
      ...milestones.map(m => new Date(m.date))
    ];
    
    const minDate = startDate ? new Date(startDate) : new Date(Math.min(...allDates.map(d => d.getTime())));
    const maxDate = endDate ? new Date(endDate) : new Date(Math.max(...allDates.map(d => d.getTime())));
    
    return { minDate, maxDate };
  }, [tasks, milestones, startDate, endDate]);

  // Generate time scale
  const timeScale = useMemo(() => {
    const { minDate, maxDate } = timelineBounds;
    const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const scale = [];
    const currentDate = new Date(minDate);
    
    while (currentDate <= maxDate) {
      scale.push(new Date(currentDate));
      
      switch (zoomLevel) {
        case 'days':
          currentDate.setDate(currentDate.getDate() + 1);
          break;
        case 'weeks':
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case 'months':
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
      }
    }
    
    return scale;
  }, [timelineBounds, zoomLevel]);

  // Calculate task position and width
  const getTaskPosition = (task: TimelineTask) => {
    const { minDate, maxDate } = timelineBounds;
    const totalDuration = maxDate.getTime() - minDate.getTime();
    const taskStart = new Date(task.startDate).getTime() - minDate.getTime();
    const taskDuration = new Date(task.endDate).getTime() - new Date(task.startDate).getTime();
    
    const left = (taskStart / totalDuration) * 100;
    const width = (taskDuration / totalDuration) * 100;
    
    return { left: `${left}%`, width: `${width}%` };
  };

  // Get status colors
  const getStatusColor = (status: TimelineTask['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-blue-500';
      case 'delayed':
        return 'bg-red-500';
      case 'on-hold':
        return 'bg-yellow-500';
      case 'not-started':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getPriorityColor = (priority: TimelineTask['priority']) => {
    switch (priority) {
      case 'critical':
        return 'border-red-500';
      case 'high':
        return 'border-orange-500';
      case 'medium':
        return 'border-yellow-500';
      case 'low':
        return 'border-green-500';
      default:
        return 'border-gray-300';
    }
  };

  const getMilestoneColor = (milestone: TimelineMilestone) => {
    switch (milestone.status) {
      case 'completed':
        return 'bg-green-500 text-white';
      case 'current':
        return 'bg-blue-500 text-white';
      case 'missed':
        return 'bg-red-500 text-white';
      case 'upcoming':
        return 'bg-gray-400 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            {title}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoomLevel('days')}
              className={cn(zoomLevel === 'days' && 'bg-blue-50 border-blue-200')}
            >
              Days
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoomLevel('weeks')}
              className={cn(zoomLevel === 'weeks' && 'bg-blue-50 border-blue-200')}
            >
              Weeks
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoomLevel('months')}
              className={cn(zoomLevel === 'months' && 'bg-blue-50 border-blue-200')}
            >
              Months
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Time Scale Header */}
          <div className="relative h-12 bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden">
            <div className="flex h-full">
              {timeScale.map((date, index) => (
                <div
                  key={index}
                  className="flex-1 flex items-center justify-center border-r border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-400"
                >
                  {zoomLevel === 'days' && date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {zoomLevel === 'weeks' && `Week ${Math.ceil(date.getDate() / 7)}`}
                  {zoomLevel === 'months' && date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </div>
              ))}
            </div>
          </div>

          {/* Tasks */}
          <div className="space-y-2">
            {tasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative"
              >
                <div className="flex items-center space-x-4 mb-2">
                  <div className="w-48 flex-shrink-0">
                    <div className="flex items-center space-x-2">
                      <div className={cn(
                        "w-3 h-3 rounded-full",
                        getStatusColor(task.status)
                      )} />
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {task.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {task.category}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {task.duration}d
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1 relative h-8">
                    <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 rounded">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={getTaskPosition(task)}
                        className={cn(
                          "absolute top-0 h-full rounded cursor-pointer border-2",
                          getStatusColor(task.status),
                          getPriorityColor(task.priority),
                          selectedTask === task.id && "ring-2 ring-blue-500 ring-offset-1"
                        )}
                        onClick={() => {
                          setSelectedTask(task.id);
                          onTaskClick?.(task);
                        }}
                      >
                        <div className="h-full flex items-center px-2">
                          <div className="flex-1 bg-white/20 rounded-sm">
                            <div 
                              className="h-1 bg-white/60 rounded-sm transition-all duration-300"
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-white ml-2 font-medium">
                            {task.progress}%
                          </span>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Milestones */}
          {milestones.length > 0 && (
            <div className="relative">
              <Separator className="my-4" />
              <div className="relative h-8">
                {milestones.map((milestone) => {
                  const { minDate, maxDate } = timelineBounds;
                  const totalDuration = maxDate.getTime() - minDate.getTime();
                  const milestonePosition = (new Date(milestone.date).getTime() - minDate.getTime()) / totalDuration * 100;
                  
                  return (
                    <motion.div
                      key={milestone.id}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute top-0 transform -translate-x-1/2 cursor-pointer"
                      style={{ left: `${milestonePosition}%` }}
                      onClick={() => onMilestoneClick?.(milestone)}
                    >
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                        getMilestoneColor(milestone)
                      )}>
                        <Flag className="h-3 w-3" />
                      </div>
                      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                        <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded">
                          {milestone.name}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Project Timeline Overview Component
export interface ProjectTimelineOverviewProps {
  tasks: TimelineTask[];
  milestones: TimelineMilestone[];
  title?: string;
  className?: string;
}

export const ProjectTimelineOverview: React.FC<ProjectTimelineOverviewProps> = ({
  tasks,
  milestones,
  title = "Project Timeline Overview",
  className
}) => {
  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
    const delayedTasks = tasks.filter(t => t.status === 'delayed').length;
    
    const completedMilestones = milestones.filter(m => m.status === 'completed').length;
    const upcomingMilestones = milestones.filter(m => m.status === 'upcoming').length;
    
    const overallProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      delayedTasks,
      completedMilestones,
      upcomingMilestones,
      overallProgress
    };
  }, [tasks, milestones]);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Overall Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Overall Progress
              </span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {stats.overallProgress.toFixed(1)}%
              </span>
            </div>
            <Progress value={stats.overallProgress} className="h-3" />
          </div>

          {/* Task Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.totalTasks}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400">
                Total Tasks
              </div>
            </div>
            
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.completedTasks}
              </div>
              <div className="text-xs text-green-600 dark:text-green-400">
                Completed
              </div>
            </div>
            
            <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats.inProgressTasks}
              </div>
              <div className="text-xs text-yellow-600 dark:text-yellow-400">
                In Progress
              </div>
            </div>
            
            <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {stats.delayedTasks}
              </div>
              <div className="text-xs text-red-600 dark:text-red-400">
                Delayed
              </div>
            </div>
          </div>

          {/* Upcoming Milestones */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              Upcoming Milestones
            </h4>
            <div className="space-y-2">
              {milestones
                .filter(m => m.status === 'upcoming' || m.status === 'current')
                .slice(0, 3)
                .map((milestone) => (
                  <div
                    key={milestone.id}
                    className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      milestone.status === 'current' ? 'bg-blue-500 text-white' : 'bg-gray-400 text-white'
                    )}>
                      <Flag className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {milestone.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(milestone.date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={milestone.status === 'current' ? 'default' : 'outline'}>
                      {milestone.status}
                    </Badge>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default {
  GanttChart,
  ProjectTimelineOverview
};