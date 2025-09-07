'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import Card from './Card';
import CardHeader from './CardHeader';
import CardContent from './CardContent';
import CardFooter from './CardFooter';
import CardTitle from './CardTitle';
import CardDescription from './CardDescription';
import { Typography } from '../../atoms/Typography';
import { Badge } from '../../atoms/Badge';
import { Button } from '../../atoms/Button';
import { Icon } from '../../atoms/Icon';
import { Avatar } from '../../atoms/Avatar';
import { Checkbox } from '../../atoms/Checkbox';

export interface TaskData {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee: {
    name: string;
    avatar?: string;
  };
  dueDate: string;
  project: string;
  tags: string[];
  completed: boolean;
  subtasks?: {
    total: number;
    completed: number;
  };
}

export interface TaskCardProps {
  task: TaskData;
  variant?: 'default' | 'glass' | 'elevated' | 'outlined';
  onSelect?: (task: TaskData) => void;
  onToggleComplete?: (task: TaskData) => void;
  onEdit?: (task: TaskData) => void;
  onDelete?: (task: TaskData) => void;
  className?: string;
  showActions?: boolean;
  compact?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  variant = 'default',
  onSelect,
  onToggleComplete,
  onEdit,
  onDelete,
  className,
  showActions = true,
  compact = false,
}) => {
  const getStatusColor = (status: TaskData['status']) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'blocked':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority: TaskData['priority']) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600 dark:text-red-400';
      case 'high':
        return 'text-orange-600 dark:text-orange-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'low':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `${Math.abs(diffDays)} days overdue`, color: 'text-red-600 dark:text-red-400' };
    } else if (diffDays === 0) {
      return { text: 'Due today', color: 'text-orange-600 dark:text-orange-400' };
    } else if (diffDays === 1) {
      return { text: 'Due tomorrow', color: 'text-yellow-600 dark:text-yellow-400' };
    } else if (diffDays <= 7) {
      return { text: `Due in ${diffDays} days`, color: 'text-gray-600 dark:text-gray-400' };
    } else {
      return { 
        text: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
        color: 'text-gray-600 dark:text-gray-400' 
      };
    }
  };

  const dueDateInfo = formatDate(task.dueDate);

  if (compact) {
    return (
      <Card
        variant={variant}
        padding="sm"
        hover
        interactive={!!onSelect}
        onClick={() => onSelect?.(task)}
        className={cn(
          'w-full',
          task.completed && 'opacity-60',
          className
        )}
      >
        <div className="flex items-center gap-3">
          {onToggleComplete && (
            <Checkbox
              checked={task.completed}
              onChange={(checked) => onToggleComplete({ ...task, completed: checked })}
              onClick={(e) => e.stopPropagation()}
            />
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Typography
                variant="body-sm"
                className={cn(
                  'font-medium truncate',
                  task.completed && 'line-through text-gray-500'
                )}
              >
                {task.title}
              </Typography>
              <Icon
                name="flag"
                size="xs"
                className={getPriorityColor(task.priority)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className={cn('text-xs', getStatusColor(task.status))}
              >
                {task.status.replace('-', ' ')}
              </Badge>
              <Typography variant="caption" className={dueDateInfo.color}>
                {dueDateInfo.text}
              </Typography>
            </div>
          </div>

          <Avatar
            src={task.assignee.avatar}
            alt={task.assignee.name}
            size="sm"
            fallback={task.assignee.name.split(' ').map(n => n[0]).join('')}
          />
        </div>
      </Card>
    );
  }

  return (
    <Card
      variant={variant}
      hover
      interactive={!!onSelect}
      onClick={() => onSelect?.(task)}
      className={cn(
        'w-full max-w-sm',
        task.completed && 'opacity-75',
        className
      )}
    >
      <CardHeader>
        <div className="flex items-start gap-3">
          {onToggleComplete && (
            <Checkbox
              checked={task.completed}
              onChange={(checked) => onToggleComplete({ ...task, completed: checked })}
              onClick={(e) => e.stopPropagation()}
              className="mt-1"
            />
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <CardTitle
                size="sm"
                className={cn(
                  'truncate',
                  task.completed && 'line-through text-gray-500'
                )}
              >
                {task.title}
              </CardTitle>
              
              {showActions && (
                <div className="flex items-center gap-1 ml-2">
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(task);
                      }}
                      aria-label="Edit task"
                    >
                      <Icon name="edit" size="xs" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(task);
                      }}
                      aria-label="Delete task"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Icon name="trash" size="xs" />
                    </Button>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="secondary"
                className={cn('text-xs', getStatusColor(task.status))}
              >
                {task.status.replace('-', ' ')}
              </Badge>
              <Icon
                name="flag"
                size="xs"
                className={getPriorityColor(task.priority)}
                aria-label={`Priority: ${task.priority}`}
              />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent padding="md">
        <CardDescription className="mb-4 line-clamp-2">
          {task.description}
        </CardDescription>

        {/* Subtasks Progress */}
        {task.subtasks && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="list" size="xs" className="text-gray-500" />
              <Typography variant="body-sm" className="text-gray-600 dark:text-gray-400">
                Subtasks: {task.subtasks.completed}/{task.subtasks.total}
              </Typography>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${(task.subtasks.completed / task.subtasks.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Task Details */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Icon name="calendar" size="xs" className="text-gray-500" />
            <Typography variant="caption" className={dueDateInfo.color}>
              {dueDateInfo.text}
            </Typography>
          </div>
          
          <div className="flex items-center gap-2">
            <Icon name="folder" size="xs" className="text-gray-500" />
            <Typography variant="caption" className="text-gray-600 dark:text-gray-400 truncate">
              {task.project}
            </Typography>
          </div>
        </div>

        {/* Tags */}
        {task.tags.length > 0 && (
          <div className="mt-3">
            <div className="flex flex-wrap gap-1">
              {task.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-xs px-2 py-0.5"
                >
                  {tag}
                </Badge>
              ))}
              {task.tags.length > 3 && (
                <Badge
                  variant="outline"
                  className="text-xs px-2 py-0.5"
                >
                  +{task.tags.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter divider justify="between">
        <div className="flex items-center gap-2">
          <Avatar
            src={task.assignee.avatar}
            alt={task.assignee.name}
            size="sm"
            fallback={task.assignee.name.split(' ').map(n => n[0]).join('')}
          />
          <div>
            <Typography variant="caption" className="text-gray-600 dark:text-gray-400">
              Assigned to
            </Typography>
            <Typography variant="body-sm" className="font-medium text-gray-900 dark:text-white">
              {task.assignee.name}
            </Typography>
          </div>
        </div>

        {onSelect && (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(task);
            }}
          >
            View Task
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default TaskCard;