'use client';

import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Calendar,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  AlertTriangle,
  Target,
  Activity,
  Package,
  Truck,
  Clock
} from 'lucide-react';
import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter
} from 'recharts';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';


// Types for cost analysis data
export interface MaterialPriceHistory {
  materialId: string;
  materialName: string;
  category: string;
  data: Array<{
    date: string;
    price: number;
    volume: number;
    supplier: string;
  }>;
}

export interface CostTrendData {
  period: string;
  totalCost: number;
  laborCost: number;
  materialCost: number;
  equipmentCost: number;
  overheadCost: number;
  budget: number;
  variance: number;
}

export interface CategoryCostData {
  category: string;
  currentCost: number;
  previousCost: number;
  budget: number;
  variance: number;
  variancePercent: number;
  color: string;
}

export interface SupplierCostData {
  supplierId: string;
  supplierName: string;
  totalSpent: number;
  orderCount: number;
  averageOrderValue: number;
  onTimeDelivery: number;
  qualityRating: number;
  costTrend: 'up' | 'down' | 'stable';
  trendPercent: number;
}

export interface CostForecast {
  period: string;
  predicted: number;
  confidence: {
    lower: number;
    upper: number;
  };
  factors: string[];
}

// Custom Tooltip Components
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

// Material Price Trends Component
export interface MaterialPriceTrendsProps {
  data: MaterialPriceHistory[];
  title?: string;
  height?: number;
  className?: string;
}

export const MaterialPriceTrends: React.FC<MaterialPriceTrendsProps> = ({
  data,
  title = "Material Price Trends",
  height = 400,
  className
}) => {
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>(
    data.slice(0, 3).map(m => m.materialId)
  );
  const [timeRange, setTimeRange] = useState<'1M' | '3M' | '6M' | '1Y' | 'ALL'>('6M');

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  const chartData = useMemo(() => {
    if (data.length === 0) {return [];}

    // Get all unique dates
    const allDates = [...new Set(data.flatMap(m => m.data.map(d => d.date)))].sort();
    
    // Filter by time range
    const now = new Date();
    const cutoffDate = new Date();
    switch (timeRange) {
      case '1M':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case '3M':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case '6M':
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case '1Y':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        cutoffDate.setFullYear(2020); // Show all data
    }

    const filteredDates = allDates.filter(date => new Date(date) >= cutoffDate);

    return filteredDates.map(date => {
      const dataPoint: any = { date };
      
      selectedMaterials.forEach(materialId => {
        const material = data.find(m => m.materialId === materialId);
        if (material) {
          const priceData = material.data.find(d => d.date === date);
          dataPoint[material.materialName] = priceData?.price || null;
        }
      });
      
      return dataPoint;
    });
  }, [data, selectedMaterials, timeRange]);

  const selectedMaterialsData = data.filter(m => selectedMaterials.includes(m.materialId));

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            {title}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1M">1M</SelectItem>
                <SelectItem value="3M">3M</SelectItem>
                <SelectItem value="6M">6M</SelectItem>
                <SelectItem value="1Y">1Y</SelectItem>
                <SelectItem value="ALL">ALL</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Material Selection */}
        <div className="flex flex-wrap gap-2 mt-4">
          {data.map((material, index) => (
            <Button
              key={material.materialId}
              variant={selectedMaterials.includes(material.materialId) ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setSelectedMaterials(prev => 
                  prev.includes(material.materialId)
                    ? prev.filter(id => id !== material.materialId)
                    : [...prev, material.materialId]
                );
              }}
              className="h-8"
            >
              <div 
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              {material.materialName}
            </Button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip content={<CostTooltip />} />
            <Legend />
            
            {selectedMaterialsData.map((material, index) => (
              <Line
                key={material.materialId}
                type="monotone"
                dataKey={material.materialName}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={{ fill: colors[index % colors.length], strokeWidth: 2, r: 4 }}
                connectNulls={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
        
        {/* Price Change Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {selectedMaterialsData.slice(0, 3).map((material, index) => {
            const latestData = material.data[material.data.length - 1];
            const previousData = material.data[material.data.length - 2];
            const priceChange = previousData ? 
              ((latestData.price - previousData.price) / previousData.price) * 100 : 0;
            
            return (
              <div key={material.materialId} className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {material.materialName}
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${latestData.price.toFixed(2)}
                </div>
                <div className={cn(
                  "flex items-center justify-center space-x-1 text-sm",
                  priceChange > 0 ? "text-red-600" : priceChange < 0 ? "text-green-600" : "text-gray-500"
                )}>
                  {priceChange > 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : priceChange < 0 ? (
                    <TrendingDown className="h-3 w-3" />
                  ) : null}
                  <span>{Math.abs(priceChange).toFixed(1)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

// Cost Category Breakdown Component
export interface CostCategoryBreakdownProps {
  data: CategoryCostData[];
  title?: string;
  className?: string;
}

export const CostCategoryBreakdown: React.FC<CostCategoryBreakdownProps> = ({
  data,
  title = "Cost Category Breakdown",
  className
}) => {
  const [viewMode, setViewMode] = useState<'pie' | 'bar'>('pie');

  const pieData = data.map(item => ({
    name: item.category,
    value: item.currentCost,
    color: item.color
  }));

  const totalCost = data.reduce((sum, item) => sum + item.currentCost, 0);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            {title}
          </CardTitle>
          <div className="flex items-center space-x-1">
            <Button
              variant={viewMode === 'pie' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('pie')}
              className="h-8 w-8 p-0"
            >
              <PieChartIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'bar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('bar')}
              className="h-8 w-8 p-0"
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart */}
          <div>
            <ResponsiveContainer width="100%" height={300}>
              {viewMode === 'pie' ? (
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
                  <Tooltip content={<CostTooltip />} />
                </PieChart>
              ) : (
                <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                  />
                  <Tooltip content={<CostTooltip />} />
                  <Bar dataKey="currentCost" fill="#3b82f6" name="Current Cost" />
                  <Bar dataKey="budget" fill="#10b981" name="Budget" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
          
          {/* Category Details */}
          <div className="space-y-3">
            {data.map((category) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {category.category}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {((category.currentCost / totalCost) * 100).toFixed(1)}% of total
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    ${category.currentCost.toLocaleString()}
                  </p>
                  <div className={cn(
                    "flex items-center space-x-1 text-sm",
                    category.variance > 0 ? "text-red-600" : "text-green-600"
                  )}>
                    {category.variance > 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    <span>{Math.abs(category.variancePercent).toFixed(1)}%</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              ${totalCost.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Cost</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {data.reduce((sum, item) => sum + item.budget, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Budget</div>
          </div>
          
          <div className="text-center">
            <div className={cn(
              "text-2xl font-bold",
              data.reduce((sum, item) => sum + item.variance, 0) > 0 ? "text-red-600" : "text-green-600"
            )}>
              ${Math.abs(data.reduce((sum, item) => sum + item.variance, 0)).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {data.reduce((sum, item) => sum + item.variance, 0) > 0 ? 'Over' : 'Under'} Budget
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Supplier Cost Analysis Component
export interface SupplierCostAnalysisProps {
  data: SupplierCostData[];
  title?: string;
  className?: string;
}

export const SupplierCostAnalysis: React.FC<SupplierCostAnalysisProps> = ({
  data,
  title = "Supplier Cost Analysis",
  className
}) => {
  const [sortBy, setSortBy] = useState<'totalSpent' | 'orderCount' | 'averageOrderValue' | 'qualityRating'>('totalSpent');

  const sortedData = [...data].sort((a, b) => {
    return b[sortBy] - a[sortBy];
  });

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            {title}
          </CardTitle>
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="totalSpent">Total Spent</SelectItem>
              <SelectItem value="orderCount">Order Count</SelectItem>
              <SelectItem value="averageOrderValue">Avg Order Value</SelectItem>
              <SelectItem value="qualityRating">Quality Rating</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {sortedData.map((supplier, index) => (
            <motion.div
              key={supplier.supplierId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    #{index + 1}
                  </div>
                </div>
                
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {supplier.supplierName}
                  </h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-3 w-3" />
                      <span>${supplier.totalSpent.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Package className="h-3 w-3" />
                      <span>{supplier.orderCount} orders</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Truck className="h-3 w-3" />
                      <span>{supplier.onTimeDelivery}% on-time</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    ${supplier.averageOrderValue.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Avg Order</div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {supplier.qualityRating.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Quality</div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {getTrendIcon(supplier.costTrend)}
                  <span className={cn(
                    "text-sm font-medium",
                    supplier.costTrend === 'up' ? "text-red-600" : 
                    supplier.costTrend === 'down' ? "text-green-600" : "text-gray-600"
                  )}>
                    {supplier.trendPercent.toFixed(1)}%
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Main Material Cost Analysis Component
export interface MaterialCostAnalysisProps {
  priceHistory: MaterialPriceHistory[];
  categoryData: CategoryCostData[];
  supplierData: SupplierCostData[];
  className?: string;
}

export const MaterialCostAnalysis: React.FC<MaterialCostAnalysisProps> = ({
  priceHistory,
  categoryData,
  supplierData,
  className
}) => {
  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Material Cost Analysis
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Track material costs, analyze trends, and optimize spending
        </p>
      </div>

      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trends">Price Trends</TabsTrigger>
          <TabsTrigger value="categories">Category Breakdown</TabsTrigger>
          <TabsTrigger value="suppliers">Supplier Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <MaterialPriceTrends data={priceHistory} />
        </TabsContent>

        <TabsContent value="categories">
          <CostCategoryBreakdown data={categoryData} />
        </TabsContent>

        <TabsContent value="suppliers">
          <SupplierCostAnalysis data={supplierData} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MaterialCostAnalysis;