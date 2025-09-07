"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Shield, 
  Bell, 
  Accessibility,
  Settings as SettingsIcon,
  ChevronLeft
} from 'lucide-react';
import { UserProfileManagement } from '@/components/design-system/organisms/UserProfile/UserProfileManagement';
import { AccountSettings } from '@/components/design-system/organisms/UserProfile/AccountSettings';
import { NotificationPreferences } from '@/components/design-system/organisms/UserProfile/NotificationPreferences';
import { AccessibilitySettings } from '@/components/design-system/organisms/UserProfile/AccessibilitySettings';
import Link from 'next/link';

const settingsTabs = [
  {
    id: 'profile',
    label: 'Profile',
    icon: <User className="h-4 w-4" />,
    description: 'Manage your personal information and professional details'
  },
  {
    id: 'account',
    label: 'Account & Security',
    icon: <Shield className="h-4 w-4" />,
    description: 'Security settings, password, and privacy controls'
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: <Bell className="h-4 w-4" />,
    description: 'Customize your notification preferences and timing'
  },
  {
    id: 'accessibility',
    label: 'Accessibility',
    icon: <Accessibility className="h-4 w-4" />,
    description: 'Accessibility features and theme customization'
  }
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  const handleUserSave = async (userData: any) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Saving user data:', userData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <SettingsIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-muted-foreground">Manage your account and preferences</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Navigation Tabs */}
          <Card className="glass-card">
            <CardContent className="p-6">
              <TabsList className="grid w-full grid-cols-1 md:grid-cols-4 gap-2 h-auto bg-transparent">
                {settingsTabs.map((tab, index) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex flex-col items-start p-4 h-auto text-left data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    asChild
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="w-full"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {tab.icon}
                        <span className="font-semibold">{tab.label}</span>
                        {tab.id === 'account' && (
                          <Badge variant="secondary" className="ml-auto">
                            2FA
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {tab.description}
                      </p>
                    </motion.div>
                  </TabsTrigger>
                ))}
              </TabsList>
            </CardContent>
          </Card>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TabsContent value="profile" className="mt-0">
              <UserProfileManagement onSave={handleUserSave} />
            </TabsContent>

            <TabsContent value="account" className="mt-0">
              <AccountSettings />
            </TabsContent>

            <TabsContent value="notifications" className="mt-0">
              <NotificationPreferences />
            </TabsContent>

            <TabsContent value="accessibility" className="mt-0">
              <AccessibilitySettings />
            </TabsContent>
          </motion.div>
        </Tabs>
      </div>
    </div>
  );
}