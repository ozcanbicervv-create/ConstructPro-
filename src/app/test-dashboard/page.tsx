'use client';

import React from 'react';
import { toast } from 'sonner';

import { Dashboard } from '@/components/design-system/organisms/Dashboard';
import { Button } from '@/components/ui/button';

export default function TestDashboardPage() {
  const handleWidgetAdd = () => {
    toast.success('Widget add functionality would be implemented here');
  };

  const handleWidgetRemove = (widgetId: string) => {
    toast.info(`Widget ${widgetId} would be removed`);
  };

  const handleWidgetConfigure = (widgetId: string) => {
    toast.info(`Widget ${widgetId} configuration would open`);
  };

  return (
    <div className="min-h-screen">
      <Dashboard
        onWidgetAdd={handleWidgetAdd}
        onWidgetRemove={handleWidgetRemove}
        onWidgetConfigure={handleWidgetConfigure}
      />
    </div>
  );
}