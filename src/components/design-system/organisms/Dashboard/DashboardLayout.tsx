'use client';

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy , useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Settings, 
  Bell, 
  Search, 
  Menu,
  Maximize2,
  Minimize2,
  MoreVertical,
  Plus
} from 'lucide-react';
import React, { useState, useCallback } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// Dashboard Widget Types
export interface DashboardWidget {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'list' | 'progress' | 'activity' | 'custom';
  size: 'sm' | 'md' | 'lg' | 'xl';
  data?: any;
  component?: React.ComponentType<any>;
  refreshable?: boolean;
  configurable?: boolean;
}

// Glassmorphism Header Component
const GlassmorphismHeader: React.FC<{
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}> = ({ title, subtitle, actions }) => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "sticky top-0 z-50 w-full",
        "bg-white/10 backdrop-blur-xl",
        "border-b border-white/20",
        "shadow-lg shadow-black/5"
      )}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
              >
                3
              </Badge>
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-5 w-5" />
            </Button>
            {actions}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

// Sortable Widget Component
const SortableWidget: React.FC<{
  widget: DashboardWidget;
  children: React.ReactNode;
}> = ({ widget, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const sizeClasses = {
    sm: 'col-span-1 row-span-1',
    md: 'col-span-1 md:col-span-2 row-span-1',
    lg: 'col-span-1 md:col-span-2 lg:col-span-3 row-span-2',
    xl: 'col-span-1 md:col-span-2 lg:col-span-4 row-span-2',
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        sizeClasses[widget.size],
        "relative group",
        isDragging && "z-50 opacity-50"
      )}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={cn(
        "h-full",
        "bg-white/60 dark:bg-gray-900/60",
        "backdrop-blur-sm",
        "border-white/20 dark:border-gray-700/20",
        "shadow-lg shadow-black/5",
        "hover:shadow-xl hover:shadow-black/10",
        "transition-all duration-200",
        "group-hover:bg-white/70 dark:group-hover:bg-gray-900/70"
      )}>
        {/* Widget Header */}
        <div className="flex items-center justify-between p-4 pb-2">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {widget.title}
          </h3>
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              {...listeners}
            >
              <MoreVertical className="h-3 w-3" />
            </Button>
            {widget.configurable && (
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Settings className="h-3 w-3" />
              </Button>
            )}
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Maximize2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        {/* Widget Content */}
        <div className="px-4 pb-4 flex-1">
          {children}
        </div>
      </Card>
    </motion.div>
  );
};

// Responsive Grid Container
const ResponsiveGrid: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div className={cn(
      "grid gap-6",
      "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
      "auto-rows-fr",
      className
    )}>
      {children}
    </div>
  );
};

// Main Dashboard Layout Component
export interface DashboardLayoutProps {
  title: string;
  subtitle?: string;
  widgets: DashboardWidget[];
  onWidgetReorder?: (widgets: DashboardWidget[]) => void;
  onWidgetAdd?: () => void;
  onWidgetRemove?: (widgetId: string) => void;
  onWidgetConfigure?: (widgetId: string) => void;
  headerActions?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  title,
  subtitle,
  widgets: initialWidgets,
  onWidgetReorder,
  onWidgetAdd,
  onWidgetRemove,
  onWidgetConfigure,
  headerActions,
  className,
  children,
}) => {
  const [widgets, setWidgets] = useState(initialWidgets);
  const [isCustomizing, setIsCustomizing] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = widgets.findIndex((widget) => widget.id === active.id);
      const newIndex = widgets.findIndex((widget) => widget.id === over.id);
      
      const newWidgets = arrayMove(widgets, oldIndex, newIndex);
      setWidgets(newWidgets);
      onWidgetReorder?.(newWidgets);
    }
  }, [widgets, onWidgetReorder]);

  const toggleCustomization = () => {
    setIsCustomizing(!isCustomizing);
  };

  return (
    <div className={cn(
      "min-h-screen",
      "bg-gradient-to-br from-blue-50 via-white to-purple-50",
      "dark:from-gray-900 dark:via-gray-800 dark:to-gray-900",
      className
    )}>
      {/* Glassmorphism Header */}
      <GlassmorphismHeader
        title={title}
        subtitle={subtitle}
        actions={
          <div className="flex items-center space-x-2">
            {headerActions}
            <Button
              variant={isCustomizing ? "default" : "outline"}
              size="sm"
              onClick={toggleCustomization}
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              {isCustomizing ? "Done" : "Customize"}
            </Button>
            {onWidgetAdd && (
              <Button variant="outline" size="sm" onClick={onWidgetAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Add Widget
              </Button>
            )}
          </div>
        }
      />

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Customization Notice */}
        <AnimatePresence>
          {isCustomizing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <Card className="bg-blue-50/80 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <div className="p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Customization Mode:</strong> Drag and drop widgets to rearrange your dashboard layout.
                  </p>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dashboard Grid */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={widgets.map(w => w.id)} strategy={rectSortingStrategy}>
            <ResponsiveGrid>
              {widgets.map((widget) => (
                <SortableWidget key={widget.id} widget={widget}>
                  {widget.component ? (
                    <widget.component {...widget.data} />
                  ) : (
                    <div className="flex items-center justify-center h-32 text-gray-500">
                      Widget: {widget.title}
                    </div>
                  )}
                </SortableWidget>
              ))}
            </ResponsiveGrid>
          </SortableContext>
        </DndContext>

        {/* Additional Content */}
        {children && (
          <>
            <Separator className="my-8" />
            <div className="space-y-6">
              {children}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default DashboardLayout;