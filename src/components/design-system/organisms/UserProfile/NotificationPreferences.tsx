"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Bell, 
  Mail, 
  Smartphone, 
  MessageSquare, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Calendar,
  FileText,
  TrendingUp,
  Settings,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NotificationChannel {
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
}

interface NotificationCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  channels: NotificationChannel;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface NotificationPreferencesProps {
  className?: string;
}

export function NotificationPreferences({ className = "" }: NotificationPreferencesProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [quietHours, setQuietHours] = useState({ start: 22, end: 7 });
  const [frequency, setFrequency] = useState({
    digest: 'daily', // daily, weekly, never
    realtime: true,
    batching: false
  });
  const { toast } = useToast();

  const [categories, setCategories] = useState<NotificationCategory[]>([
    {
      id: 'projects',
      name: 'Project Updates',
      description: 'New projects, status changes, milestones',
      icon: <FileText className="h-4 w-4" />,
      priority: 'high',
      channels: { email: true, push: true, sms: false, inApp: true }
    },
    {
      id: 'tasks',
      name: 'Task Assignments',
      description: 'New tasks, deadlines, completions',
      icon: <CheckCircle className="h-4 w-4" />,
      priority: 'high',
      channels: { email: true, push: true, sms: false, inApp: true }
    },
    {
      id: 'team',
      name: 'Team Activity',
      description: 'Team member updates, mentions, messages',
      icon: <Users className="h-4 w-4" />,
      priority: 'medium',
      channels: { email: false, push: true, sms: false, inApp: true }
    },
    {
      id: 'calendar',
      name: 'Calendar Events',
      description: 'Meeting reminders, schedule changes',
      icon: <Calendar className="h-4 w-4" />,
      priority: 'medium',
      channels: { email: true, push: true, sms: false, inApp: true }
    },
    {
      id: 'materials',
      name: 'Material Updates',
      description: 'Inventory changes, delivery notifications',
      icon: <TrendingUp className="h-4 w-4" />,
      priority: 'medium',
      channels: { email: true, push: false, sms: false, inApp: true }
    },
    {
      id: 'safety',
      name: 'Safety Alerts',
      description: 'Safety incidents, compliance reminders',
      icon: <AlertTriangle className="h-4 w-4" />,
      priority: 'critical',
      channels: { email: true, push: true, sms: true, inApp: true }
    },
    {
      id: 'system',
      name: 'System Notifications',
      description: 'Maintenance, updates, security alerts',
      icon: <Settings className="h-4 w-4" />,
      priority: 'low',
      channels: { email: true, push: false, sms: false, inApp: true }
    }
  ]);

  const handleChannelToggle = (categoryId: string, channel: keyof NotificationChannel) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId 
        ? { ...cat, channels: { ...cat.channels, [channel]: !cat.channels[channel] } }
        : cat
    ));
  };

  const handleSavePreferences = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Preferences Saved",
        description: "Your notification preferences have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async (categoryId: string) => {
    try {
      // Simulate sending test notification
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const category = categories.find(cat => cat.id === categoryId);
      toast({
        title: "Test Notification Sent",
        description: `Test notification for ${category?.name} has been sent to your enabled channels.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send test notification.",
        variant: "destructive",
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[priority as keyof typeof colors] || colors.low;
  };

  const formatTime = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Notification Channels */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Channels
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {category.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{category.name}</h3>
                      <Badge className={getPriorityColor(category.priority)}>
                        {category.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestNotification(category.id)}
                >
                  Test
                </Button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 ml-12">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm">Email</Label>
                  </div>
                  <Switch
                    checked={category.channels.email}
                    onCheckedChange={() => handleChannelToggle(category.id, 'email')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm">Push</Label>
                  </div>
                  <Switch
                    checked={category.channels.push}
                    onCheckedChange={() => handleChannelToggle(category.id, 'push')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm">SMS</Label>
                  </div>
                  <Switch
                    checked={category.channels.sms}
                    onCheckedChange={() => handleChannelToggle(category.id, 'sms')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm">In-App</Label>
                  </div>
                  <Switch
                    checked={category.channels.inApp}
                    onCheckedChange={() => handleChannelToggle(category.id, 'inApp')}
                  />
                </div>
              </div>
              
              {index < categories.length - 1 && <Separator />}
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Notification Timing */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Notification Timing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quiet Hours */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Quiet Hours</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Set hours when you don't want to receive notifications
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Start Time: {formatTime(quietHours.start)}</Label>
                <Slider
                  value={[quietHours.start]}
                  onValueChange={([value]) => setQuietHours(prev => ({ ...prev, start: value }))}
                  max={23}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label>End Time: {formatTime(quietHours.end)}</Label>
                <Slider
                  value={[quietHours.end]}
                  onValueChange={([value]) => setQuietHours(prev => ({ ...prev, end: value }))}
                  max={23}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {quietHours.start > quietHours.end ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
              Quiet hours: {formatTime(quietHours.start)} - {formatTime(quietHours.end)}
              {quietHours.start > quietHours.end && " (next day)"}
            </div>
          </div>

          <Separator />

          {/* Frequency Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold">Notification Frequency</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Real-time Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications immediately</p>
                </div>
                <Switch
                  checked={frequency.realtime}
                  onCheckedChange={(checked) => setFrequency(prev => ({ ...prev, realtime: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Batch Notifications</Label>
                  <p className="text-sm text-muted-foreground">Group similar notifications together</p>
                </div>
                <Switch
                  checked={frequency.batching}
                  onCheckedChange={(checked) => setFrequency(prev => ({ ...prev, batching: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Daily Digest</Label>
                  <p className="text-sm text-muted-foreground">Receive a summary of daily activity</p>
                </div>
                <select
                  value={frequency.digest}
                  onChange={(e) => setFrequency(prev => ({ ...prev, digest: e.target.value }))}
                  className="px-3 py-2 border rounded-md bg-background"
                >
                  <option value="never">Never</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setCategories(prev => prev.map(cat => ({
                  ...cat,
                  channels: { email: true, push: true, sms: false, inApp: true }
                })));
                toast({ title: "All notifications enabled" });
              }}
            >
              Enable All
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                setCategories(prev => prev.map(cat => ({
                  ...cat,
                  channels: { email: false, push: false, sms: false, inApp: false }
                })));
                toast({ title: "All notifications disabled" });
              }}
            >
              Disable All
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                setCategories(prev => prev.map(cat => ({
                  ...cat,
                  channels: { 
                    email: cat.priority === 'critical' || cat.priority === 'high',
                    push: cat.priority === 'critical' || cat.priority === 'high',
                    sms: cat.priority === 'critical',
                    inApp: true
                  }
                })));
                toast({ title: "Essential notifications only" });
              }}
            >
              Essential Only
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSavePreferences} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
}

export default NotificationPreferences;