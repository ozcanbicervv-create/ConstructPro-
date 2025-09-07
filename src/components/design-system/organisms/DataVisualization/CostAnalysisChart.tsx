'use client';

import { motion } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Target,
  BarChart3,
  LineChart as LineChartIcon
} from 'lucide-react';
import React, { useState } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ReferenceLine
} from 'recharts';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';


// Types for cost analysis data
export interface CostAnalysisData {
  period: string;
  budgeted: number;
  actual: number;
  forecast: number;
  variance: number;
  cumulativeBudget: number;
  cumulativeActual: number;
}

export interface MaterialCostData {
  material: string;
  budgeted: number;
  actual: number;
  variance: number;
  variancePercent: number;
  category: string;
}

export interface CostTrendData {
  date: string;
  laborCost: number;
  materialCost: number;
  equipmentCost: number;
  overheadCost: number;
  totalCost: number;
}

// Custom Tooltip for Cost Analysis
const CostTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-xl"
      >
        <p className="font-semibold text-gray-900 dark:text-white mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
          {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between space-x-4 text-sm mb-1">
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
              ${entry.value?.toLocaleString() || 0}
            </span>
          </div>
        ))}
      </motion.div>
    );
  }
  return null;
};

// Cost Analysis Chart Component
export interface CostAnalysisChartProps {
  data: CostAnalysisData[];
  title?: string;
  height?: number;
  showVariance?: boolean;
  className?: string;
}

export const CostAnalysisChart: React.FC<CostAnalysisChartProps> = ({
  data,
  title = "Cost Analysis",
  height = 400,
  showVariance = true,
  className
}) => {
  const [activeView, setActiveView] = useState<'combined' | 'cumulative' | 'variance'>('combined');

  const renderChart = () => {
    switch (activeView) {
      case 'combined':
        return (
          <ComposedChart
            data={data}
            margin={{ top: 20, right: 30, bottom: 20, left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="period" 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              yAxisId="cost"
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
            />
            {showVariance && (
              <YAxis 
                yAxisId="variance"
                orientation="right"
                stroke="#ef4444"
                fontSize={12}
                tickFormatter={(value) => `${value}%`}
              />
            )}
            <Tooltip content={<CostTooltip />} />
            <Legend />
            
            <Bar 
              yAxisId="cost"
              dataKey="budgeted" 
              fill="#3b82f6" 
              name="Budgeted"
              radius={[2, 2, 0, 0]}
            />
            <Bar 
              yAxisId="cost"
              dataKey="actual" 
              fill="#10b981" 
              name="Actual"
              radius={[2, 2, 0, 0]}
            />
            <Line 
              yAxisId="cost"
              type="monotone" 
              dataKey="forecast" 
              stroke="#f59e0b" 
              strokeWidth={3}
              dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
              name="Forecast"
            />
            {showVariance && (
              <Line 
                yAxisId="variance"
                type="monotone" 
                dataKey="variance" 
                stroke="#ef4444" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }}
                name="Variance %"
              />
            )}
          </ComposedChart>
        );

      case 'cumulative':
        return (
          <ComposedChart
            data={data}
            margin={{ top: 20, right: 30, bottom: 20, left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="period" 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
            />
            <Tooltip content={<CostTooltip />} />
            <Legend />
            
            <Line 
              type="monotone" 
              dataKey="cumulativeBudget" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              name="Cumulative Budget"
            />
            <Line 
              type="monotone" 
              dataKey="cumulativeActual" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              name="Cumulative Actual"
            />
          </ComposedChart>
        );

      case 'variance':
        return (
          <ScatterChart
            data={data}
            margin={{ top: 20, right: 30, bottom: 20, left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="budgeted" 
              stroke="#6b7280"
              fontSize={12}
              name="Budgeted"
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
            />
            <YAxis 
              dataKey="actual"
              stroke="#6b7280"
              fontSize={12}
              name="Actual"
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
            />
            <Tooltip content={<CostTooltip />} />
            <Legend />
            
            <Scatter 
              name="Budget vs Actual" 
              data={data} 
              fill="#3b82f6"
            />
            <ReferenceLine 
              stroke="#ef4444" 
              strokeDasharray="2 2"
              segment={[
                { x: Math.min(...data.map(d => d.budgeted)), y: Math.min(...data.map(d => d.budgeted)) },
                { x: Math.max(...data.map(d => d.budgeted)), y: Math.max(...data.map(d => d.budgeted)) }
              ]}
            />
          </ScatterChart>
        );

      default:
        return null;
    }
  };

  // Calculate summary statistics
  const totalBudgeted = data.reduce((sum, item) => sum + item.budgeted, 0);
  const totalActual = data.reduce((sum, item) => sum + item.actual, 0);
  const totalVariance = ((totalActual - totalBudgeted) / totalBudgeted) * 100;

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold mb-2">
              {title}
            </CardTitle>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Budget: ${totalBudgeted.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Actual: ${totalActual.toLocaleString()}
                </span>
              </div>
              <Badge 
                variant={totalVariance > 0 ? "destructive" : "default"}
                className="flex items-center space-x-1"
              >
                {totalVariance > 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>{Math.abs(totalVariance).toFixed(1)}%</span>
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              variant={activeView === 'combined' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('combined')}
              className="h-8 px-3"
            >
              Combined
            </Button>
            <Button
              variant={activeView === 'cumulative' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('cumulative')}
              className="h-8 px-3"
            >
              Cumulative
            </Button>
            <Button
              variant={activeView === 'variance' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('variance')}
              className="h-8 px-3"
            >
              Variance
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

// Material Cost Breakdown Component
export interface MaterialCostBreakdownProps {
  data: MaterialCostData[];
  title?: string;
  className?: string;
}

export const MaterialCostBreakdown: React.FC<MaterialCostBreakdownProps> = ({
  data,
  title = "Material Cost Breakdown",
  className
}) => {
  const sortedData = [...data].sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance));

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedData.map((item, index) => (
            <motion.div
              key={item.material}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
            >
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {item.material}
                  </h4>
                  <Badge variant="outline" className="text-xs">
                    {item.category}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Budgeted:</span>
                    <p className="font-medium">${item.budgeted.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Actual:</span>
                    <p className="font-medium">${item.actual.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Variance:</span>
                    <div className="flex items-center space-x-1">
                      {item.variance > 0 ? (
                        <TrendingUp className="h-3 w-3 text-red-500" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-green-500" />
                      )}
                      <p className={cn(
                        "font-medium",
                        item.variance > 0 ? "text-red-600" : "text-green-600"
                      )}>
                        ${Math.abs(item.variance).toLocaleString()} ({Math.abs(item.variancePercent).toFixed(1)}%)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {Math.abs(item.variancePercent) > 10 && (
                <div className="ml-4">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Cost Trend Analysis Component
export interface CostTrendAnalysisProps {
  data: CostTrendData[];
  title?: string;
  height?: number;
  className?: string;
}

export const CostTrendAnalysis: React.FC<CostTrendAnalysisProps> = ({
  data,
  title = "Cost Trend Analysis",
  height = 350,
  className
}) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'laborCost', 'materialCost', 'equipmentCost', 'overheadCost'
  ]);

  const categories = [
    { key: 'laborCost', name: 'Labor', color: '#3b82f6' },
    { key: 'materialCost', name: 'Materials', color: '#10b981' },
    { key: 'equipmentCost', name: 'Equipment', color: '#f59e0b' },
    { key: 'overheadCost', name: 'Overhead', color: '#ef4444' },
  ];

  const toggleCategory = (categoryKey: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryKey)
        ? prev.filter(key => key !== categoryKey)
        : [...prev, categoryKey]
    );
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold mb-3">
          {title}
        </CardTitle>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <Button
              key={category.key}
              variant={selectedCategories.includes(category.key) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleCategory(category.key)}
              className="h-8"
            >
              <div 
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: category.color }}
              />
              {category.name}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart
            data={data}
            margin={{ top: 20, right: 30, bottom: 20, left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
            />
            <Tooltip content={<CostTooltip />} />
            <Legend />
            
            {categories.map(category => (
              selectedCategories.includes(category.key) && (
                <Line
                  key={category.key}
                  type="monotone"
                  dataKey={category.key}
                  stroke={category.color}
                  strokeWidth={2}
                  dot={{ fill: category.color, strokeWidth: 2, r: 3 }}
                  name={category.name}
                />
              )
            ))}
            
            <Line
              type="monotone"
              dataKey="totalCost"
              stroke="#6b7280"
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={{ fill: '#6b7280', strokeWidth: 2, r: 4 }}
              name="Total Cost"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default {
  CostAnalysisChart,
  MaterialCostBreakdown,
  CostTrendAnalysis
};