'use client';

import React from 'react';

import {
  ProjectProgressChart,
  MilestoneTimeline,
  BudgetAnalysisChart,
  CostAnalysisChart,
  MaterialCostBreakdown,
  CostTrendAnalysis,
  GanttChart,
  ProjectTimelineOverview,
  type ProjectProgressData,
  type ProjectMilestone,
  type BudgetBreakdown,
  type CostAnalysisData,
  type MaterialCostData,
  type CostTrendData,
  type TimelineTask,
  type TimelineMilestone
} from '@/components/design-system/organisms/DataVisualization';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data for demonstrations
const mockProgressData: ProjectProgressData[] = [
  { date: 'Jan', planned: 10, actual: 8, budget: 100000, issues: 2 },
  { date: 'Feb', planned: 25, actual: 22, budget: 250000, issues: 1 },
  { date: 'Mar', planned: 40, actual: 45, budget: 400000, issues: 0 },
  { date: 'Apr', planned: 55, actual: 52, budget: 550000, issues: 3 },
  { date: 'May', planned: 70, actual: 68, budget: 700000, issues: 1 },
  { date: 'Jun', planned: 85, actual: 80, budget: 850000, issues: 2 },
  { date: 'Jul', planned: 100, actual: 95, budget: 1000000, issues: 0 }
];

const mockMilestones: ProjectMilestone[] = [
  { name: 'Foundation Complete', planned: 'Mar 15', actual: 'Mar 18', status: 'completed', completion: 100 },
  { name: 'Frame Structure', planned: 'May 20', actual: 'May 22', status: 'completed', completion: 100 },
  { name: 'Roofing Complete', planned: 'Jul 10', status: 'in-progress', completion: 75 },
  { name: 'Interior Work', planned: 'Sep 15', status: 'upcoming', completion: 0 },
  { name: 'Final Inspection', planned: 'Nov 30', status: 'upcoming', completion: 0 }
];

const mockBudgetData: BudgetBreakdown[] = [
  { category: 'Labor', budgeted: 400000, spent: 380000, remaining: 20000, color: '#3b82f6' },
  { category: 'Materials', budgeted: 350000, spent: 420000, remaining: -70000, color: '#10b981' },
  { category: 'Equipment', budgeted: 150000, spent: 135000, remaining: 15000, color: '#f59e0b' },
  { category: 'Permits', budgeted: 50000, spent: 48000, remaining: 2000, color: '#ef4444' },
  { category: 'Overhead', budgeted: 100000, spent: 95000, remaining: 5000, color: '#8b5cf6' }
];

const mockCostAnalysisData: CostAnalysisData[] = [
  { 
    period: 'Q1', 
    budgeted: 250000, 
    actual: 240000, 
    forecast: 245000, 
    variance: -4,
    cumulativeBudget: 250000,
    cumulativeActual: 240000
  },
  { 
    period: 'Q2', 
    budgeted: 300000, 
    actual: 320000, 
    forecast: 315000, 
    variance: 6.7,
    cumulativeBudget: 550000,
    cumulativeActual: 560000
  },
  { 
    period: 'Q3', 
    budgeted: 280000, 
    actual: 275000, 
    forecast: 285000, 
    variance: -1.8,
    cumulativeBudget: 830000,
    cumulativeActual: 835000
  },
  { 
    period: 'Q4', 
    budgeted: 220000, 
    actual: 0, 
    forecast: 230000, 
    variance: 0,
    cumulativeBudget: 1050000,
    cumulativeActual: 835000
  }
];

const mockMaterialCostData: MaterialCostData[] = [
  { material: 'Steel Beams', budgeted: 85000, actual: 92000, variance: 7000, variancePercent: 8.2, category: 'Structural' },
  { material: 'Concrete', budgeted: 45000, actual: 43000, variance: -2000, variancePercent: -4.4, category: 'Foundation' },
  { material: 'Lumber', budgeted: 35000, actual: 41000, variance: 6000, variancePercent: 17.1, category: 'Framing' },
  { material: 'Roofing Materials', budgeted: 28000, actual: 26500, variance: -1500, variancePercent: -5.4, category: 'Roofing' },
  { material: 'Electrical Supplies', budgeted: 22000, actual: 24500, variance: 2500, variancePercent: 11.4, category: 'Electrical' }
];

const mockCostTrendData: CostTrendData[] = [
  { date: 'Jan', laborCost: 45000, materialCost: 35000, equipmentCost: 15000, overheadCost: 8000, totalCost: 103000 },
  { date: 'Feb', laborCost: 48000, materialCost: 42000, equipmentCost: 18000, overheadCost: 9000, totalCost: 117000 },
  { date: 'Mar', laborCost: 52000, materialCost: 38000, equipmentCost: 20000, overheadCost: 10000, totalCost: 120000 },
  { date: 'Apr', laborCost: 55000, materialCost: 45000, equipmentCost: 22000, overheadCost: 11000, totalCost: 133000 },
  { date: 'May', laborCost: 58000, materialCost: 48000, equipmentCost: 19000, overheadCost: 12000, totalCost: 137000 },
  { date: 'Jun', laborCost: 60000, materialCost: 52000, equipmentCost: 25000, overheadCost: 13000, totalCost: 150000 }
];

const mockTimelineTasks: TimelineTask[] = [
  {
    id: '1',
    name: 'Site Preparation',
    startDate: '2024-01-01',
    endDate: '2024-01-15',
    duration: 14,
    progress: 100,
    status: 'completed',
    priority: 'high',
    assignees: [{ id: '1', name: 'John Smith' }],
    category: 'Site Work'
  },
  {
    id: '2',
    name: 'Foundation Work',
    startDate: '2024-01-16',
    endDate: '2024-03-15',
    duration: 59,
    progress: 100,
    status: 'completed',
    priority: 'critical',
    assignees: [{ id: '2', name: 'Mike Johnson' }],
    category: 'Foundation',
    dependencies: ['1']
  },
  {
    id: '3',
    name: 'Frame Construction',
    startDate: '2024-03-16',
    endDate: '2024-05-30',
    duration: 75,
    progress: 85,
    status: 'in-progress',
    priority: 'high',
    assignees: [{ id: '3', name: 'Sarah Wilson' }],
    category: 'Structure',
    dependencies: ['2']
  },
  {
    id: '4',
    name: 'Roofing Installation',
    startDate: '2024-06-01',
    endDate: '2024-07-15',
    duration: 44,
    progress: 45,
    status: 'in-progress',
    priority: 'medium',
    assignees: [{ id: '4', name: 'David Brown' }],
    category: 'Roofing',
    dependencies: ['3']
  },
  {
    id: '5',
    name: 'Interior Work',
    startDate: '2024-07-16',
    endDate: '2024-10-30',
    duration: 106,
    progress: 0,
    status: 'not-started',
    priority: 'medium',
    assignees: [{ id: '5', name: 'Lisa Davis' }],
    category: 'Interior',
    dependencies: ['4']
  }
];

const mockTimelineMilestones: TimelineMilestone[] = [
  { id: '1', name: 'Project Start', date: '2024-01-01', type: 'start', status: 'completed' },
  { id: '2', name: 'Foundation Complete', date: '2024-03-15', type: 'checkpoint', status: 'completed' },
  { id: '3', name: 'Structure Complete', date: '2024-05-30', type: 'checkpoint', status: 'current' },
  { id: '4', name: 'Weather Protection', date: '2024-07-15', type: 'checkpoint', status: 'upcoming' },
  { id: '5', name: 'Project Completion', date: '2024-10-30', type: 'end', status: 'upcoming' }
];

export default function TestDataVisualizationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Data Visualization Components
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Advanced construction-specific data visualization components with real-time updates and smooth animations.
          </p>
        </div>

        <Tabs defaultValue="progress" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="progress">Progress Charts</TabsTrigger>
            <TabsTrigger value="cost">Cost Analysis</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="progress" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ProjectProgressChart
                data={mockProgressData}
                title="Project Progress Over Time"
                height={350}
              />
              <BudgetAnalysisChart
                data={mockBudgetData}
                title="Budget Breakdown Analysis"
              />
            </div>
            <MilestoneTimeline
              milestones={mockMilestones}
              title="Project Milestones Timeline"
            />
          </TabsContent>

          <TabsContent value="cost" className="space-y-6">
            <CostAnalysisChart
              data={mockCostAnalysisData}
              title="Quarterly Cost Analysis"
              height={400}
              showVariance={true}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MaterialCostBreakdown
                data={mockMaterialCostData}
                title="Material Cost Variance Analysis"
              />
              <CostTrendAnalysis
                data={mockCostTrendData}
                title="Monthly Cost Trends"
                height={350}
              />
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            <GanttChart
              tasks={mockTimelineTasks}
              milestones={mockTimelineMilestones}
              title="Project Gantt Chart"
              onTaskClick={(task) => console.log('Task clicked:', task)}
              onMilestoneClick={(milestone) => console.log('Milestone clicked:', milestone)}
            />
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            <ProjectTimelineOverview
              tasks={mockTimelineTasks}
              milestones={mockTimelineMilestones}
              title="Project Timeline Overview"
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ProjectProgressChart
                data={mockProgressData.slice(-4)}
                title="Recent Progress"
                height={250}
                showLegend={false}
              />
              <CostTrendAnalysis
                data={mockCostTrendData.slice(-4)}
                title="Recent Cost Trends"
                height={250}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}