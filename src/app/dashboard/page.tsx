"use client";

import React, { Suspense } from 'react';
import { useSession } from "next-auth/react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Dashboard } from "@/components/design-system/organisms/Dashboard/Dashboard";
import { NotificationSystem } from "@/components/design-system/organisms/RealTime/NotificationSystem";
import { PresenceIndicators } from "@/components/design-system/organisms/RealTime/PresenceIndicators";
import { PWAStatus } from "@/components/design-system/organisms/PWA/PWAStatus";
import { PWAInstallPrompt } from "@/components/design-system/organisms/PWA/PWAInstallPrompt";
import { PWAUpdatePrompt } from "@/components/design-system/organisms/PWA/PWAUpdatePrompt";
import { Navigation } from "@/components/design-system/molecules/Navigation/Navigation";
import { MobileNavigation } from "@/components/design-system/molecules/MobileNavigation/MobileNavigation";
import { Breadcrumb } from "@/components/design-system/molecules/Breadcrumb/Breadcrumb";
import { Button } from "@/components/ui/button";
import { 
  Settings, 
  Bell, 
  Search, 
  Plus,
  Home,
  Building,
  Users,
  Package,
  FileText,
  BarChart3,
  Calendar,
  MessageSquare
} from "lucide-react";
import { motion } from "framer-motion";

// Navigation items for the main navigation
const navigationItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <Home className="h-4 w-4" />,
    active: true
  },
  {
    label: "Projects",
    href: "/projects",
    icon: <Building className="h-4 w-4" />,
    badge: 12
  },
  {
    label: "Team",
    href: "/team",
    icon: <Users className="h-4 w-4" />
  },
  {
    label: "Materials",
    href: "/materials",
    icon: <Package className="h-4 w-4" />,
    badge: 3
  },
  {
    label: "Documents",
    href: "/documents",
    icon: <FileText className="h-4 w-4" />
  },
  {
    label: "Reports",
    href: "/reports",
    icon: <BarChart3 className="h-4 w-4" />
  },
  {
    label: "Calendar",
    href: "/calendar",
    icon: <Calendar className="h-4 w-4" />
  },
  {
    label: "Messages",
    href: "/messages",
    icon: <MessageSquare className="h-4 w-4" />,
    badge: 5
  }
];

// Breadcrumb items
const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Dashboard", href: "/dashboard" }
];

// Loading component for Suspense
const DashboardLoading = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
    <div className="container mx-auto px-6 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="h-48 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 rounded-lg animate-pulse"
          />
        ))}
      </div>
    </div>
  </div>
);

export default function DashboardPage() {
  const { data: session } = useSession();

  const handleWidgetAdd = () => {
    console.log('Add widget clicked');
    // Implementation for adding widgets
  };

  const handleWidgetRemove = (widgetId: string) => {
    console.log('Remove widget:', widgetId);
    // Implementation for removing widgets
  };

  const handleWidgetConfigure = (widgetId: string) => {
    console.log('Configure widget:', widgetId);
    // Implementation for configuring widgets
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* PWA Components */}
        <PWAStatus />
        <PWAInstallPrompt />
        <PWAUpdatePrompt />
        
        {/* Real-time Components */}
        <NotificationSystem />
        
        {/* Main Layout */}
        <div className="flex h-screen">
          {/* Desktop Sidebar Navigation */}
          <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0">
            <div className="flex flex-col flex-grow bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50">
              {/* Logo */}
              <div className="flex items-center flex-shrink-0 px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Building className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    ConstructPro
                  </span>
                </div>
              </div>
              
              {/* Navigation */}
              <div className="flex-1 flex flex-col overflow-y-auto">
                <Navigation 
                  items={navigationItems}
                  className="px-3 py-4"
                />
              </div>
              
              {/* User Info & Presence */}
              <div className="flex-shrink-0 p-4 border-t border-gray-200/50 dark:border-gray-700/50">
                <PresenceIndicators />
                <div className="flex items-center space-x-3 mt-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {session?.user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {session?.user?.firstName || session?.user?.name || "User"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {session?.user?.role || "Worker"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 lg:pl-64">
            {/* Top Header */}
            <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
              <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                  {/* Mobile Navigation */}
                  <div className="lg:hidden">
                    <MobileNavigation items={navigationItems} />
                  </div>
                  
                  {/* Breadcrumb */}
                  <div className="hidden sm:block">
                    <Breadcrumb items={breadcrumbItems} />
                  </div>
                  
                  {/* Header Actions */}
                  <div className="flex items-center space-x-4">
                    {/* Search */}
                    <Button variant="ghost" size="sm" className="hidden sm:flex">
                      <Search className="h-4 w-4" />
                    </Button>
                    
                    {/* Notifications */}
                    <Button variant="ghost" size="sm" className="relative">
                      <Bell className="h-4 w-4" />
                      <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                        3
                      </span>
                    </Button>
                    
                    {/* Quick Add */}
                    <Button size="sm" className="hidden sm:flex">
                      <Plus className="h-4 w-4 mr-2" />
                      New Project
                    </Button>
                    
                    {/* Settings */}
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </header>

            {/* Dashboard Content */}
            <main className="flex-1">
              <Suspense fallback={<DashboardLoading />}>
                <Dashboard
                  onWidgetAdd={handleWidgetAdd}
                  onWidgetRemove={handleWidgetRemove}
                  onWidgetConfigure={handleWidgetConfigure}
                />
              </Suspense>
            </main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}