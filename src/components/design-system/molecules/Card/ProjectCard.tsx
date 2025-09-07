'use client';

import React from 'react';
import { motion } from 'framer-motion';
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
import { Progress } from '../../atoms/Progress';
import { Avatar } from '../../atoms/Avatar';

export interface ProjectData {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'delayed';
  progress: number;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  manager: {
    name: string;
    avatar?: string;
  };
  team: number;
  location: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface ProjectCardProps {
  project: ProjectData;
  variant?: 'default' | 'glass' | 'elevated' | 'outlined';
  onSelect?: (project: ProjectData) => void;
  onEdit?: (project: ProjectData) => void;
  onDelete?: (project: ProjectData) => void;
  className?: string;
  showActions?: boolean;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  variant = 'default',
  onSelect,
  onEdit,
  onDelete,
  className,
  showActions = true,
}) => {
  const getStatusColor = (status: ProjectData['status']) => {
    switch (status) {
      case 'planning':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'completed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'delayed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority: ProjectData['priority']) => {
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const budgetUsed = (project.spent / project.budget) * 100;

  return (
    <Card
      variant={variant}
      hover
      interactive={!!onSelect}
      onClick={() => onSelect?.(project)}
      className={cn('w-full max-w-sm', className)}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onKeyDown={(e) => {
        if (onSelect && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onSelect(project);
        }
      }}
    >
      <CardHeader divider>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle size="sm" className="truncate">
              {project.name}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="secondary"
                className={cn('text-xs', getStatusColor(project.status))}
              >
                {project.status.replace('-', ' ')}
              </Badge>
              <Icon
                name="flag"
                size="xs"
                className={getPriorityColor(project.priority)}
                aria-label={`Priority: ${project.priority}`}
              />
            </div>
          </div>
          
          {showActions && (
            <div className="flex items-center gap-1 ml-2">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(project);
                  }}
                  aria-label="Edit project"
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
                    onDelete(project);
                  }}
                  aria-label="Delete project"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Icon name="trash" size="xs" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent padding="md">
        <CardDescription className="mb-4 line-clamp-2">
          {project.description}
        </CardDescription>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <Typography variant="body-sm" className="font-medium text-gray-900 dark:text-white">
              Progress
            </Typography>
            <Typography variant="body-sm" className="text-gray-600 dark:text-gray-400">
              {project.progress}%
            </Typography>
          </div>
          <Progress value={project.progress} className="h-2" />
        </div>

        {/* Budget */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <Typography variant="body-sm" className="font-medium text-gray-900 dark:text-white">
              Budget
            </Typography>
            <Typography variant="body-sm" className="text-gray-600 dark:text-gray-400">
              {formatCurrency(project.spent)} / {formatCurrency(project.budget)}
            </Typography>
          </div>
          <Progress 
            value={budgetUsed} 
            className="h-2"
            variant={budgetUsed > 90 ? 'destructive' : budgetUsed > 75 ? 'warning' : 'default'}
          />
        </div>

        {/* Project Details */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Icon name="calendar" size="xs" className="text-gray-500" />
            <Typography variant="caption" className="text-gray-600 dark:text-gray-400">
              {formatDate(project.startDate)} - {formatDate(project.endDate)}
            </Typography>
          </div>
          
          <div className="flex items-center gap-2">
            <Icon name="map-pin" size="xs" className="text-gray-500" />
            <Typography variant="caption" className="text-gray-600 dark:text-gray-400 truncate">
              {project.location}
            </Typography>
          </div>
          
          <div className="flex items-center gap-2">
            <Icon name="users" size="xs" className="text-gray-500" />
            <Typography variant="caption" className="text-gray-600 dark:text-gray-400">
              {project.team} team members
            </Typography>
          </div>
        </div>
      </CardContent>

      <CardFooter divider justify="between">
        <div className="flex items-center gap-2">
          <Avatar
            src={project.manager.avatar}
            alt={project.manager.name}
            size="sm"
            fallback={project.manager.name.split(' ').map(n => n[0]).join('')}
          />
          <div>
            <Typography variant="caption" className="text-gray-600 dark:text-gray-400">
              Manager
            </Typography>
            <Typography variant="body-sm" className="font-medium text-gray-900 dark:text-white">
              {project.manager.name}
            </Typography>
          </div>
        </div>

        {onSelect && (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(project);
            }}
          >
            View Details
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;