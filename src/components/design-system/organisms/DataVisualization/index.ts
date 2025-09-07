/**
 * Data Visualization Organism Components
 * 
 * Advanced data visualization components using Recharts with construction-specific
 * visualizations, real-time data updates, smooth transitions, and accessibility features.
 */

// Project Progress Charts
export {
  ProjectProgressChart,
  MilestoneTimeline,
  BudgetAnalysisChart,
  type ProjectProgressChartProps,
  type MilestoneTimelineProps,
  type BudgetAnalysisProps,
  type ProjectProgressData,
  type ProjectMilestone,
  type BudgetBreakdown
} from './ProjectProgressChart';

// Cost Analysis Charts
export {
  CostAnalysisChart,
  MaterialCostBreakdown,
  CostTrendAnalysis,
  type CostAnalysisChartProps,
  type MaterialCostBreakdownProps,
  type CostTrendAnalysisProps,
  type CostAnalysisData,
  type MaterialCostData,
  type CostTrendData
} from './CostAnalysisChart';

// Timeline Visualizations
export {
  GanttChart,
  ProjectTimelineOverview,
  type GanttChartProps,
  type ProjectTimelineOverviewProps,
  type TimelineTask,
  type TimelineMilestone
} from './TimelineVisualization';

// Default export with all components
export default {
  ProjectProgressChart,
  MilestoneTimeline,
  BudgetAnalysisChart,
  CostAnalysisChart,
  MaterialCostBreakdown,
  CostTrendAnalysis,
  GanttChart,
  ProjectTimelineOverview
};