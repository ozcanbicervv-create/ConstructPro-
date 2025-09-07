'use client';

import React, { useState } from 'react';
import { Navigation } from '@/components/design-system/molecules/Navigation';
import { Breadcrumb } from '@/components/design-system/molecules/Breadcrumb';
import { MobileNavigation } from '@/components/design-system/molecules/MobileNavigation';
import { Typography } from '@/components/design-system/atoms/Typography';
import { Button } from '@/components/design-system/atoms/Button';
import { Icon } from '@/components/design-system/atoms/Icon';
import { 
  BuildingIcon, 
  ToolsIcon, 
  ExcavatorIcon, 
  ProgressIcon 
} from '@/components/design-system/atoms/Icon/construction';

export default function TestNavigationPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string>('dashboard');

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/dashboard',
      icon: <Icon name="layout-dashboard" size="sm" />,
      active: selectedItem === 'dashboard',
    },
    {
      id: 'projects',
      label: 'Projects',
      href: '/projects',
      icon: <BuildingIcon size="sm" />,
      badge: 5,
      active: selectedItem === 'projects',
      children: [
        {
          id: 'active-projects',
          label: 'Active Projects',
          href: '/projects/active',
          active: selectedItem === 'active-projects',
        },
        {
          id: 'completed-projects',
          label: 'Completed Projects',
          href: '/projects/completed',
          active: selectedItem === 'completed-projects',
        },
        {
          id: 'archived-projects',
          label: 'Archived Projects',
          href: '/projects/archived',
          active: selectedItem === 'archived-projects',
        },
      ],
    },
    {
      id: 'tasks',
      label: 'Tasks',
      href: '/tasks',
      icon: <Icon name="check-square" size="sm" />,
      badge: 12,
      active: selectedItem === 'tasks',
      children: [
        {
          id: 'my-tasks',
          label: 'My Tasks',
          href: '/tasks/my',
          active: selectedItem === 'my-tasks',
        },
        {
          id: 'team-tasks',
          label: 'Team Tasks',
          href: '/tasks/team',
          active: selectedItem === 'team-tasks',
        },
      ],
    },
    {
      id: 'equipment',
      label: 'Equipment',
      href: '/equipment',
      icon: <ExcavatorIcon size="sm" />,
      active: selectedItem === 'equipment',
      children: [
        {
          id: 'heavy-machinery',
          label: 'Heavy Machinery',
          href: '/equipment/heavy',
          active: selectedItem === 'heavy-machinery',
        },
        {
          id: 'tools',
          label: 'Tools & Supplies',
          href: '/equipment/tools',
          active: selectedItem === 'tools',
        },
        {
          id: 'maintenance',
          label: 'Maintenance',
          href: '/equipment/maintenance',
          badge: 3,
          active: selectedItem === 'maintenance',
        },
      ],
    },
    {
      id: 'materials',
      label: 'Materials',
      href: '/materials',
      icon: <Icon name="package" size="sm" />,
      active: selectedItem === 'materials',
    },
    {
      id: 'progress',
      label: 'Progress Tracking',
      href: '/progress',
      icon: <ProgressIcon size="sm" />,
      active: selectedItem === 'progress',
    },
    {
      id: 'reports',
      label: 'Reports',
      href: '/reports',
      icon: <Icon name="bar-chart" size="sm" />,
      active: selectedItem === 'reports',
    },
    {
      id: 'settings',
      label: 'Settings',
      href: '/settings',
      icon: <Icon name="settings" size="sm" />,
      active: selectedItem === 'settings',
      disabled: true,
    },
  ];

  const breadcrumbItems = [
    {
      id: 'projects',
      label: 'Projects',
      href: '/projects',
      icon: <BuildingIcon size="xs" />,
    },
    {
      id: 'residential-complex',
      label: 'Residential Complex A',
      href: '/projects/residential-complex-a',
    },
    {
      id: 'phase-2',
      label: 'Phase 2',
      href: '/projects/residential-complex-a/phase-2',
    },
    {
      id: 'building-b',
      label: 'Building B',
      href: '/projects/residential-complex-a/phase-2/building-b',
    },
    {
      id: 'floor-3',
      label: 'Floor 3',
      href: '/projects/residential-complex-a/phase-2/building-b/floor-3',
    },
    {
      id: 'electrical-work',
      label: 'Electrical Installation',
      current: true,
    },
  ];

  const handleItemClick = (item: any) => {
    console.log('Navigation item clicked:', item);
    setSelectedItem(item.id);
  };

  const handleBreadcrumbClick = (item: any) => {
    console.log('Breadcrumb item clicked:', item);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-white/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileNavOpen(true)}
              className="md:hidden"
            >
              <Icon name="menu" size="sm" />
            </Button>
            <Typography variant="heading-lg" className="font-bold text-gray-900">
              Navigation Components Demo
            </Typography>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden md:flex"
            >
              <Icon name="panel-left" size="sm" />
              {sidebarCollapsed ? 'Expand' : 'Collapse'}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Navigation
            items={navigationItems}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            onItemClick={handleItemClick}
            variant="glass"
            className="h-[calc(100vh-73px)]"
          />
        </div>

        {/* Mobile Navigation */}
        <MobileNavigation
          items={navigationItems}
          isOpen={mobileNavOpen}
          onToggle={() => setMobileNavOpen(!mobileNavOpen)}
          onItemClick={handleItemClick}
          variant="glass"
        />

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Breadcrumb Navigation */}
          <div className="mb-8">
            <Typography variant="heading-sm" className="mb-4 text-gray-900">
              Breadcrumb Navigation
            </Typography>
            
            <div className="space-y-4">
              {/* Default Breadcrumb */}
              <div>
                <Typography variant="body-sm" className="mb-2 text-gray-600">
                  Default Variant
                </Typography>
                <Breadcrumb
                  items={breadcrumbItems}
                  onItemClick={handleBreadcrumbClick}
                  variant="default"
                  showHome
                />
              </div>

              {/* Glass Breadcrumb */}
              <div>
                <Typography variant="body-sm" className="mb-2 text-gray-600">
                  Glass Variant
                </Typography>
                <Breadcrumb
                  items={breadcrumbItems}
                  onItemClick={handleBreadcrumbClick}
                  variant="glass"
                  showHome
                />
              </div>

              {/* Minimal Breadcrumb */}
              <div>
                <Typography variant="body-sm" className="mb-2 text-gray-600">
                  Minimal Variant
                </Typography>
                <Breadcrumb
                  items={breadcrumbItems}
                  onItemClick={handleBreadcrumbClick}
                  variant="minimal"
                  showHome={false}
                />
              </div>

              {/* Truncated Breadcrumb */}
              <div>
                <Typography variant="body-sm" className="mb-2 text-gray-600">
                  Truncated (Max 4 items)
                </Typography>
                <Breadcrumb
                  items={breadcrumbItems}
                  onItemClick={handleBreadcrumbClick}
                  variant="glass"
                  maxItems={4}
                  showHome
                />
              </div>
            </div>
          </div>

          {/* Top Navigation Demo */}
          <div className="mb-8">
            <Typography variant="heading-sm" className="mb-4 text-gray-900">
              Top Navigation
            </Typography>
            
            <Navigation
              items={navigationItems.slice(0, 5)}
              position="top"
              onItemClick={handleItemClick}
              variant="glass"
              className="mb-4"
            />
          </div>

          {/* Content Area */}
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-8 border border-white/20">
            <Typography variant="heading-md" className="mb-4 text-gray-900">
              Selected Navigation Item: {selectedItem}
            </Typography>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white/80 rounded-lg p-6 border border-white/30">
                <Typography variant="heading-sm" className="mb-2 text-gray-900">
                  Sidebar Navigation
                </Typography>
                <Typography variant="body-sm" className="text-gray-600">
                  Collapsible sidebar with glassmorphism effects, nested items, and badges.
                </Typography>
              </div>
              
              <div className="bg-white/80 rounded-lg p-6 border border-white/30">
                <Typography variant="heading-sm" className="mb-2 text-gray-900">
                  Breadcrumb Navigation
                </Typography>
                <Typography variant="body-sm" className="text-gray-600">
                  Construction project hierarchy with intelligent overflow handling.
                </Typography>
              </div>
              
              <div className="bg-white/80 rounded-lg p-6 border border-white/30">
                <Typography variant="heading-sm" className="mb-2 text-gray-900">
                  Mobile Navigation
                </Typography>
                <Typography variant="body-sm" className="text-gray-600">
                  Touch-friendly mobile navigation with swipe gestures.
                </Typography>
              </div>
            </div>

            {/* Features List */}
            <div className="mt-8">
              <Typography variant="heading-sm" className="mb-4 text-gray-900">
                Navigation Features
              </Typography>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Icon name="check" size="sm" className="text-green-600 mt-0.5" />
                  <div>
                    <Typography variant="body-sm" className="font-medium text-gray-900">
                      Glassmorphism Effects
                    </Typography>
                    <Typography variant="caption" className="text-gray-600">
                      Modern backdrop blur and transparency effects
                    </Typography>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Icon name="check" size="sm" className="text-green-600 mt-0.5" />
                  <div>
                    <Typography variant="body-sm" className="font-medium text-gray-900">
                      Responsive Design
                    </Typography>
                    <Typography variant="caption" className="text-gray-600">
                      Mobile-first approach with touch optimization
                    </Typography>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Icon name="check" size="sm" className="text-green-600 mt-0.5" />
                  <div>
                    <Typography variant="body-sm" className="font-medium text-gray-900">
                      Accessibility
                    </Typography>
                    <Typography variant="caption" className="text-gray-600">
                      WCAG 2.1 AA compliant with keyboard navigation
                    </Typography>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Icon name="check" size="sm" className="text-green-600 mt-0.5" />
                  <div>
                    <Typography variant="body-sm" className="font-medium text-gray-900">
                      Construction-Specific
                    </Typography>
                    <Typography variant="caption" className="text-gray-600">
                      Industry-specific icons and hierarchy patterns
                    </Typography>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}