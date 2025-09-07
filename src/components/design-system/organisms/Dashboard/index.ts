/**
 * Dashboard Organism Components
 * 
 * Modern dashboard layout with glassmorphism effects, responsive grid,
 * drag-and-drop functionality, and real-time data updates.
 */

export { Dashboard, type DashboardProps } from './Dashboard';
export { DashboardLayout, type DashboardLayoutProps, type DashboardWidget } from './DashboardLayout';
export { 
  DashboardWidgets,
  MetricWidget,
  ProgressWidget,
  ActivityWidget,
  QuickStatsWidget,
  UpcomingEventsWidget,
  type MetricWidgetProps,
  type ProgressWidgetProps,
  type ActivityWidgetProps,
  type QuickStatsProps,
  type UpcomingEventsProps,
  type ActivityItem,
  type UpcomingEvent
} from './DashboardWidgets';