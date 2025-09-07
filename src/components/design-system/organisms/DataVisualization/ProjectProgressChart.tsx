'use client';

import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';
import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';


// Types for project progress data
export interface ProjectProgressData {
  date: string;
  planned: number;
  actual: number;
  budget: number;
  issues: number;
}

export interface ProjectMilestone {
  name: string;
  planned: string;
  actual?: string;
  status: 'completed' | 'in-progress' | 'delayed' | 'upcoming';
  completion: number;
}

export interface BudgetBreakdown {
  category: string;
  budgeted: number;
  spent: number;
  remaining: number;
  color: string;
}

// Custom Tooltip Components
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg"
      >
        <p className="font-medium text-gray-900 dark:text-white mb-2">
          {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center space-x-2 text-sm">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-600 dark:text-gray-300">
              {entry.name}: {entry.value}%
            </span>
          </div>
        ))}
      </motion.div>
    );
  }
  return null;
};

const BudgetTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg"
      >
        <p className="font-medium text-gray-900 dark:text-white mb-2">
          {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600 dark:text-gray-300">
                {entry.name}:
              </span>
            </div>
            <span className="font-medium text-gray-900 dark:text-white">
              ${entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </motion.div>
    );
  }
  return null;
};

// Project Progress Chart Component
export interface ProjectProgressChartProps {
  data: ProjectProgressData[];
  title?: string;
  height?: number;
  showLegend?: boolean;
  className?: string;
}

export const ProjectProgressChart: React.FC<ProjectProgressChartProps> = ({
  data,
  title = "Project Progress Over Time",
  height = 300,
  showLegend = true,
  className
}) => {
  const [activeView, setActiveView] = useState<'area' | 'line' | 'bar'>('area');

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (activeView) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="plannedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            <Area
              type="monotone"
              dataKey="planned"
              stackId="1"
              stroke="#3b82f6"
              fill="url(#plannedGradient)"
              name="Planned Progress"
            />
            <Area
              type="monotone"
              dataKey="actual"
              stackId="2"
              stroke="#10b981"
              fill="url(#actualGradient)"
              name="Actual Progress"
            />
          </AreaChart>
        );

      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            <Line
              type="monotone"
              dataKey="planned"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              name="Planned Progress"
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              name="Actual Progress"
            />
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            <Bar
              dataKey="planned"
              fill="#3b82f6"
              name="Planned Progress"
              radius={[2, 2, 0, 0]}
            />
            <Bar
              dataKey="actual"
              fill="#10b981"
              name="Actual Progress"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        );

      default:
        return null;
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            {title}
          </CardTitle>
          <div className="flex items-center space-x-1">
            <Button
              variant={activeView === 'area' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('area')}
              className="h-8 w-8 p-0"
            >
              <Activity className="h-4 w-4" />
            </Button>
            <Button
              variant={activeView === 'line' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('line')}
              className="h-8 w-8 p-0"
            >
              <TrendingUp className="h-4 w-4" />
            </Button>
            <Button
              variant={activeView === 'bar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('bar')}
              className="h-8 w-8 p-0"
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ResponsiveContainer width="100%" height={height}>
            {renderChart()}
          </ResponsiveContainer>
        </motion.div>
      </CardContent>
    </Card>
  );
};

// Milestone Timeline Component
export interface MilestoneTimelineProps {
  milestones: ProjectMilestone[];
  title?: string;
  className?: string;
}

export const MilestoneTimeline: React.FC<MilestoneTimelineProps> = ({
  milestones,
  title = "Project Milestones",
  className
}) => {
  const getStatusColor = (status: ProjectMilestone['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 text-green-50';
      case 'in-progress':
        return 'bg-blue-500 text-blue-50';
      case 'delayed':
        return 'bg-red-500 text-red-50';
      case 'upcoming':
        return 'bg-gray-400 text-gray-50';
      default:
        return 'bg-gray-400 text-gray-50';
    }
  };

  const getStatusBadgeVariant = (status: ProjectMilestone['status']) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in-progress':
        return 'secondary';
      case 'delayed':
        return 'destructive';
      case 'upcoming':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {milestones.map((milestone, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-4"
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium",
                getStatusColor(milestone.status)
              )}>
                {milestone.completion}%
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {milestone.name}
                  </h4>
                  <Badge variant={getStatusBadgeVariant(milestone.status)}>
                    {milestone.status.replace('-', ' ')}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>Planned: {milestone.planned}</span>
                  {milestone.actual && (
                    <span>Actual: {milestone.actual}</span>
                  )}
                </div>
                
                <div className="mt-2">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${milestone.completion}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className={cn(
                        "h-2 rounded-full",
                        milestone.status === 'completed' ? 'bg-green-500' :
                        milestone.status === 'in-progress' ? 'bg-blue-500' :
                        milestone.status === 'delayed' ? 'bg-red-500' :
                        'bg-gray-400'
                      )}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Budget Analysis Chart
export interface BudgetAnalysisProps {
  data: BudgetBreakdown[];
  title?: string;
  className?: string;
}

export const BudgetAnalysisChart: React.FC<BudgetAnalysisProps> = ({
  data,
  title = "Budget Analysis",
  className
}) => {
  const [activeView, setActiveView] = useState<'pie' | 'bar'>('pie');

  const pieData = data.map(item => ({
    name: item.category,
    value: item.spent,
    color: item.color
  }));

  const barData = data.map(item => ({
    category: item.category,
    budgeted: item.budgeted,
    spent: item.spent,
    remaining: item.remaining
  }));

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            {title}
          </CardTitle>
          <div className="flex items-center space-x-1">
            <Button
              variant={activeView === 'pie' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('pie')}
              className="h-8 w-8 p-0"
            >
              <PieChartIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={activeView === 'bar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('bar')}
              className="h-8 w-8 p-0"
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ResponsiveContainer width="100%" height={300}>
            {activeView === 'pie' ? (
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<BudgetTooltip />} />
              </PieChart>
            ) : (
              <BarChart data={barData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="category" 
                  stroke="#6b7280"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <Tooltip content={<BudgetTooltip />} />
                <Legend />
                <Bar dataKey="budgeted" fill="#3b82f6" name="Budgeted" />
                <Bar dataKey="spent" fill="#ef4444" name="Spent" />
                <Bar dataKey="remaining" fill="#10b981" name="Remaining" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default {
  ProjectProgressChart,
  MilestoneTimeline,
  BudgetAnalysisChart
};