'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  NotificationSystem,
  PresenceIndicators,
  ActivityFeed,
  CollaborationIndicators,
  ActivityType
} from '@/components/design-system/organisms/RealTime';
import type { ActivityItem, DocumentCollaboration, TaskCollaboration } from '@/components/design-system/organisms/RealTime';
import { 
  Notification, 
  NotificationType, 
  NotificationPriority 
} from '@/types/realtime.types';

const TestRealTimePage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [documents, setDocuments] = useState<DocumentCollaboration[]>([]);
  const [tasks, setTasks] = useState<TaskCollaboration[]>([]);

  const currentUserId = 'user-1';

  // Initialize mock data
  useEffect(() => {
    // Mock notifications
    const mockNotifications: Notification[] = [
      {
        id: '1',
        userId: currentUserId,
        type: NotificationType.TASK_ASSIGNED,
        title: 'New Task Assigned',
        message: 'You have been assigned to "Install electrical wiring"',
        priority: NotificationPriority.HIGH,
        read: false,
        createdAt: new Date(Date.now() - 5 * 60000), // 5 minutes ago
      },
      {
        id: '2',
        userId: currentUserId,
        type: NotificationType.PROJECT_UPDATE,
        title: 'Project Updated',
        message: 'Construction Phase 2 has been updated with new timeline',
        priority: NotificationPriority.MEDIUM,
        read: false,
        createdAt: new Date(Date.now() - 15 * 60000), // 15 minutes ago
      },
      {
        id: '3',
        userId: currentUserId,
        type: NotificationType.DOCUMENT_APPROVAL_NEEDED,
        title: 'Document Approval Required',
        message: 'Blueprint revision needs your approval',
        priority: NotificationPriority.URGENT,
        read: true,
        createdAt: new Date(Date.now() - 30 * 60000), // 30 minutes ago
      },
      {
        id: '4',
        userId: currentUserId,
        type: NotificationType.MATERIAL_LOW_STOCK,
        title: 'Low Stock Alert',
        message: 'Concrete mix is running low (5 bags remaining)',
        priority: NotificationPriority.HIGH,
        read: false,
        createdAt: new Date(Date.now() - 60 * 60000), // 1 hour ago
      },
    ];

    // Mock online users
    const mockOnlineUsers = [
      {
        id: 'user-2',
        name: 'John Smith',
        email: 'john@constructpro.com',
        avatar: '',
        role: 'Project Manager',
        isOnline: true,
        lastSeen: new Date(),
        currentActivity: 'editing',
        currentLocation: 'Blueprint Review'
      },
      {
        id: 'user-3',
        name: 'Sarah Johnson',
        email: 'sarah@constructpro.com',
        avatar: '',
        role: 'Site Supervisor',
        isOnline: true,
        lastSeen: new Date(),
        currentActivity: 'viewing',
        currentLocation: 'Material Orders'
      },
      {
        id: 'user-4',
        name: 'Mike Wilson',
        email: 'mike@constructpro.com',
        avatar: '',
        role: 'Engineer',
        isOnline: false,
        lastSeen: new Date(Date.now() - 30 * 60000),
      },
      {
        id: 'user-5',
        name: 'Lisa Chen',
        email: 'lisa@constructpro.com',
        avatar: '',
        role: 'Quality Inspector',
        isOnline: true,
        lastSeen: new Date(),
        currentActivity: 'typing',
        currentLocation: 'Safety Report'
      },
    ];

    // Mock activities
    const mockActivities: ActivityItem[] = [
      {
        id: '1',
        type: ActivityType.TASK_COMPLETED,
        userId: 'user-2',
        userName: 'John Smith',
        title: 'completed task "Foundation Inspection"',
        description: 'All foundation work has been inspected and approved',
        timestamp: new Date(Date.now() - 2 * 60000),
        projectId: 'project-1',
        taskId: 'task-1',
        metadata: { status: 'completed', priority: 'high' }
      },
      {
        id: '2',
        type: ActivityType.DOCUMENT_UPLOADED,
        userId: 'user-3',
        userName: 'Sarah Johnson',
        title: 'uploaded new document "Safety Protocol v2.1"',
        description: 'Updated safety protocols for Phase 2 construction',
        timestamp: new Date(Date.now() - 5 * 60000),
        projectId: 'project-1',
        documentId: 'doc-1'
      },
      {
        id: '3',
        type: ActivityType.TEAM_MEMBER_ADDED,
        userId: 'user-1',
        userName: 'You',
        title: 'added Mike Wilson to the project',
        description: 'New structural engineer joined the team',
        timestamp: new Date(Date.now() - 10 * 60000),
        projectId: 'project-1'
      },
      {
        id: '4',
        type: ActivityType.MILESTONE_REACHED,
        userId: 'system',
        userName: 'System',
        title: 'Project milestone reached',
        description: 'Foundation work completed - 25% project progress',
        timestamp: new Date(Date.now() - 15 * 60000),
        projectId: 'project-1',
        metadata: { milestone: 'Foundation Complete', progress: '25%' }
      },
    ];

    // Mock documents
    const mockDocuments: DocumentCollaboration[] = [
      {
        documentId: 'doc-1',
        documentName: 'Blueprint - Main Building.dwg',
        isLocked: false,
        viewers: [
          { id: 'user-2', name: 'John Smith', role: 'Project Manager' },
          { id: 'user-3', name: 'Sarah Johnson', role: 'Site Supervisor' }
        ],
        editors: [
          { id: 'user-4', name: 'Mike Wilson', role: 'Engineer' }
        ],
        lastModified: new Date(Date.now() - 10 * 60000),
        lastModifiedBy: { id: 'user-4', name: 'Mike Wilson', role: 'Engineer' }
      },
      {
        documentId: 'doc-2',
        documentName: 'Safety Protocol v2.1.pdf',
        isLocked: true,
        lockedBy: { id: 'user-3', name: 'Sarah Johnson', role: 'Site Supervisor' },
        lockTimestamp: new Date(Date.now() - 5 * 60000),
        viewers: [
          { id: 'user-1', name: 'You', role: 'Team Lead' }
        ],
        editors: [],
        lastModified: new Date(Date.now() - 5 * 60000),
        lastModifiedBy: { id: 'user-3', name: 'Sarah Johnson', role: 'Site Supervisor' }
      }
    ];

    // Mock tasks
    const mockTasks: TaskCollaboration[] = [
      {
        taskId: 'task-1',
        taskName: 'Install electrical wiring - Floor 2',
        assignedTo: { id: 'user-1', name: 'You', role: 'Team Lead' },
        watchers: [
          { id: 'user-2', name: 'John Smith', role: 'Project Manager' },
          { id: 'user-3', name: 'Sarah Johnson', role: 'Site Supervisor' }
        ],
        activeCommenters: [
          { id: 'user-2', name: 'John Smith', role: 'Project Manager' }
        ],
        lastActivity: new Date(Date.now() - 5 * 60000),
        status: 'in-progress'
      },
      {
        taskId: 'task-2',
        taskName: 'Quality inspection - Foundation',
        assignedTo: { id: 'user-5', name: 'Lisa Chen', role: 'Quality Inspector' },
        watchers: [
          { id: 'user-1', name: 'You', role: 'Team Lead' }
        ],
        activeCommenters: [],
        lastActivity: new Date(Date.now() - 30 * 60000),
        status: 'completed'
      }
    ];

    setNotifications(mockNotifications);
    setOnlineUsers(mockOnlineUsers);
    setActivities(mockActivities);
    setDocuments(mockDocuments);
    setTasks(mockTasks);
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Add new activity every 30 seconds
      const newActivity: ActivityItem = {
        id: `activity-${Date.now()}`,
        type: ActivityType.PROJECT_UPDATED,
        userId: 'user-2',
        userName: 'John Smith',
        title: 'updated project timeline',
        description: 'Adjusted completion date for electrical work',
        timestamp: new Date(),
        projectId: 'project-1'
      };

      setActivities(prev => [newActivity, ...prev]);

      // Simulate notification
      if (Math.random() > 0.7) {
        const newNotification: Notification = {
          id: `notif-${Date.now()}`,
          userId: currentUserId,
          type: NotificationType.PROJECT_UPDATE,
          title: 'Real-time Update',
          message: 'Project timeline has been updated',
          priority: NotificationPriority.MEDIUM,
          read: false,
          createdAt: new Date()
        };
        setNotifications(prev => [newNotification, ...prev]);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleDismissNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const addTestNotification = () => {
    const types = [
      NotificationType.TASK_ASSIGNED,
      NotificationType.PROJECT_UPDATE,
      NotificationType.DOCUMENT_APPROVAL_NEEDED,
      NotificationType.MATERIAL_LOW_STOCK
    ];
    const priorities = [
      NotificationPriority.LOW,
      NotificationPriority.MEDIUM,
      NotificationPriority.HIGH,
      NotificationPriority.URGENT
    ];

    const randomType = types[Math.floor(Math.random() * types.length)];
    const randomPriority = priorities[Math.floor(Math.random() * priorities.length)];

    const newNotification: Notification = {
      id: `test-${Date.now()}`,
      userId: currentUserId,
      type: randomType,
      title: 'Test Notification',
      message: 'This is a test notification to demonstrate real-time updates',
      priority: randomPriority,
      read: false,
      createdAt: new Date()
    };

    setNotifications(prev => [newNotification, ...prev]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Real-time Communication Components
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Comprehensive real-time features including notifications, presence indicators, 
            activity feeds, and collaboration tools for construction project management.
          </p>
          <div className="flex justify-center space-x-4">
            <Button onClick={addTestNotification} variant="outline">
              Add Test Notification
            </Button>
            <Badge variant="secondary">
              {notifications.filter(n => !n.read).length} unread notifications
            </Badge>
          </div>
        </div>

        {/* Top Bar with Notifications and Presence */}
        <Card>
          <CardHeader>
            <CardTitle>Navigation Bar Components</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-white/50 backdrop-blur-sm rounded-lg border">
              <div className="flex items-center space-x-4">
                <h2 className="font-semibold">ConstructPro</h2>
                <Badge variant="outline">Project Dashboard</Badge>
              </div>
              
              <div className="flex items-center space-x-4">
                <PresenceIndicators
                  onlineUsers={onlineUsers}
                  currentUserId={currentUserId}
                  projectId="project-1"
                  showActivity={true}
                  maxVisible={3}
                />
                <NotificationSystem
                  notifications={notifications}
                  onMarkAsRead={handleMarkAsRead}
                  onMarkAllAsRead={handleMarkAllAsRead}
                  onDismiss={handleDismissNotification}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity Feed */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Feed Component</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityFeed
                activities={activities}
                projectId="project-1"
                maxHeight="500px"
                showFilters={true}
                hasMore={true}
                onLoadMore={() => console.log('Load more activities')}
              />
            </CardContent>
          </Card>

          {/* Collaboration Indicators */}
          <Card>
            <CardHeader>
              <CardTitle>Collaboration Indicators</CardTitle>
            </CardHeader>
            <CardContent>
              <CollaborationIndicators
                documents={documents}
                tasks={tasks}
                currentUserId={currentUserId}
                onJoinDocument={(docId) => console.log('Join document:', docId)}
                onLeaveDocument={(docId) => console.log('Leave document:', docId)}
                onWatchTask={(taskId) => console.log('Watch task:', taskId)}
                onUnwatchTask={(taskId) => console.log('Unwatch task:', taskId)}
              />
            </CardContent>
          </Card>
        </div>

        {/* Component Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Notification System</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Priority-based styling</li>
                <li>• Real-time updates</li>
                <li>• Mark as read/unread</li>
                <li>• Filter by type</li>
                <li>• Smooth animations</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Presence Indicators</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Online/offline status</li>
                <li>• Activity indicators</li>
                <li>• User avatars</li>
                <li>• Expandable view</li>
                <li>• Tooltips with details</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Activity Feed</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Real-time updates</li>
                <li>• Filterable content</li>
                <li>• Auto-scroll behavior</li>
                <li>• Load more pagination</li>
                <li>• Smooth animations</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Collaboration</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Document collaboration</li>
                <li>• Task watching</li>
                <li>• Lock indicators</li>
                <li>• User activity tracking</li>
                <li>• Join/leave actions</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Implementation Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Implementation Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Real-time Features Implemented:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h5 className="font-medium text-blue-600">✅ Notification System</h5>
                  <ul className="text-gray-600 ml-4">
                    <li>• Priority-based styling and colors</li>
                    <li>• Real-time notification delivery</li>
                    <li>• Mark as read/unread functionality</li>
                    <li>• Filter by read status and type</li>
                    <li>• Smooth animations and transitions</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-blue-600">✅ Presence Indicators</h5>
                  <ul className="text-gray-600 ml-4">
                    <li>• Online team member display</li>
                    <li>• Activity status (viewing, editing, typing)</li>
                    <li>• User avatars with status indicators</li>
                    <li>• Expandable detailed view</li>
                    <li>• Tooltips with user information</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-blue-600">✅ Activity Feed</h5>
                  <ul className="text-gray-600 ml-4">
                    <li>• Real-time activity updates</li>
                    <li>• Smooth animations for new items</li>
                    <li>• Filterable by activity type</li>
                    <li>• Auto-scroll and manual scroll control</li>
                    <li>• Load more pagination support</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-blue-600">✅ Collaboration Indicators</h5>
                  <ul className="text-gray-600 ml-4">
                    <li>• Document collaboration tracking</li>
                    <li>• Task watching and assignment</li>
                    <li>• Lock status indicators</li>
                    <li>• Join/leave document functionality</li>
                    <li>• Real-time collaboration updates</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestRealTimePage;