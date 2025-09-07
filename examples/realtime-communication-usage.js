/**
 * Real-time Communication Usage Examples
 * 
 * This file demonstrates how to use the ConstructPro real-time communication features
 * including WebSocket connections, project rooms, notifications, and collaborative editing.
 */

import { socketClient, SocketEvents } from '../src/utils/socket-client.js';

// Example 1: Basic Connection and Project Room Management
async function basicConnectionExample() {
  console.log('=== Basic Connection Example ===');
  
  // Connect to the real-time server
  socketClient.connect('user-123');
  
  // Wait for connection
  socketClient.on('connect', () => {
    console.log('✅ Connected to ConstructPro real-time server');
    
    // Join a project room
    socketClient.joinProject('project-456');
  });
  
  // Handle project room events
  socketClient.on('project_joined', (data) => {
    console.log(`✅ Joined project room: ${data.projectId}`);
  });
  
  socketClient.on('project_member_added', (data) => {
    console.log(`👤 User ${data.userId} joined project ${data.projectId}`);
    console.log(`📊 Active users: ${data.activeUsers}`);
  });
  
  // Handle disconnection
  socketClient.on('disconnect', (reason) => {
    console.log(`❌ Disconnected: ${reason}`);
  });
}

// Example 2: Real-time Project Updates
function projectUpdatesExample() {
  console.log('=== Project Updates Example ===');
  
  // Listen for project updates
  socketClient.on(SocketEvents.PROJECT_UPDATED, (data) => {
    console.log('📋 Project Updated:', {
      projectId: data.projectId,
      updatedBy: data.updatedBy,
      changes: data.changes,
      timestamp: data.timestamp
    });
    
    // Update UI based on changes
    if (data.changes.status) {
      updateProjectStatusInUI(data.projectId, data.changes.status);
    }
    
    if (data.changes.deadline) {
      updateProjectDeadlineInUI(data.projectId, data.changes.deadline);
    }
  });
  
  // Listen for task updates
  socketClient.on(SocketEvents.TASK_UPDATED, (data) => {
    console.log('✅ Task Updated:', {
      taskId: data.taskId,
      projectId: data.projectId,
      changes: data.changes
    });
    
    // Update task in UI
    updateTaskInUI(data.taskId, data.changes);
  });
  
  // Broadcast a project update
  function updateProjectStatus(projectId, newStatus) {
    socketClient.broadcastProjectUpdate(projectId, {
      status: newStatus,
      lastModified: new Date().toISOString()
    });
    
    console.log(`📤 Broadcasted project status update: ${newStatus}`);
  }
  
  // Example usage
  setTimeout(() => {
    updateProjectStatus('project-456', 'in_progress');
  }, 2000);
}

// Example 3: Notification System
function notificationSystemExample() {
  console.log('=== Notification System Example ===');
  
  // Listen for notifications
  socketClient.on(SocketEvents.NOTIFICATION_SENT, (notification) => {
    console.log('🔔 New Notification:', {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      priority: notification.priority
    });
    
    // Show notification in UI based on priority
    showNotificationInUI(notification);
    
    // Auto-mark low priority notifications as read after 5 seconds
    if (notification.priority === 'LOW') {
      setTimeout(() => {
        socketClient.markNotificationRead(notification.id);
      }, 5000);
    }
  });
  
  // Listen for notification read events
  socketClient.on(SocketEvents.NOTIFICATION_READ, (data) => {
    console.log(`✅ Notification ${data.notificationId} marked as read`);
    updateNotificationUIAsRead(data.notificationId);
  });
  
  // Get current notifications
  socketClient.getNotifications(20, true); // Get 20 unread notifications
  
  socketClient.on('user_notifications', (notifications) => {
    console.log(`📬 Retrieved ${notifications.length} notifications`);
    notifications.forEach(notification => {
      console.log(`  - ${notification.title} (${notification.priority})`);
    });
  });
}

// Example 4: Presence Tracking
function presenceTrackingExample() {
  console.log('=== Presence Tracking Example ===');
  
  // Listen for user presence changes
  socketClient.on(SocketEvents.USER_ONLINE, (data) => {
    console.log(`🟢 User ${data.userId} is now online`);
    updateUserStatusInUI(data.userId, 'online');
  });
  
  socketClient.on(SocketEvents.USER_OFFLINE, (data) => {
    console.log(`🔴 User ${data.userId} went offline at ${data.lastSeen}`);
    updateUserStatusInUI(data.userId, 'offline', data.lastSeen);
  });
  
  // Get online users
  socketClient.getOnlineUsers();
  
  socketClient.on('online_users', (data) => {
    console.log(`👥 ${data.totalCount} users currently online:`);
    data.onlineUsers.forEach(user => {
      console.log(`  - ${user.userId} (${user.projectIds.length} projects)`);
    });
  });
  
  // Get project members
  socketClient.getProjectMembers('project-456');
  
  socketClient.on('project_members', (data) => {
    console.log(`👥 Project ${data.projectId} members:`);
    data.members.forEach(member => {
      console.log(`  - ${member.userId} (online: ${member.isOnline})`);
    });
  });
}

// Example 5: Collaborative Editing
function collaborativeEditingExample() {
  console.log('=== Collaborative Editing Example ===');
  
  const documentId = 'document-789';
  
  // Start editing a document
  socketClient.startEditingDocument(documentId);
  
  // Handle edit session response
  socketClient.on('edit_session_response', (response) => {
    if (response.success) {
      console.log('✅ Edit session started, document locked');
      console.log('🔒 Lock expires at:', response.lock.expiresAt);
      
      // Enable editing in UI
      enableDocumentEditing(documentId);
      
      // Simulate cursor movement
      setTimeout(() => {
        socketClient.updateCursorPosition(documentId, 150);
      }, 1000);
      
      // Simulate content update
      setTimeout(() => {
        socketClient.updateDocumentContent(documentId, 'Updated content here', 100);
      }, 2000);
      
    } else {
      console.log('❌ Cannot start editing:', response.message);
      showEditingBlockedMessage(response.message);
    }
  });
  
  // Listen for other users' editing activities
  socketClient.on(SocketEvents.DOCUMENT_EDIT_START, (data) => {
    if (data.userId !== 'user-123') { // Not our own event
      console.log(`👤 ${data.userId} started editing document ${data.documentId}`);
      showOtherUserEditingIndicator(data.userId, data.documentId);
    }
  });
  
  socketClient.on(SocketEvents.DOCUMENT_EDIT_END, (data) => {
    if (data.userId !== 'user-123') {
      console.log(`👤 ${data.userId} stopped editing document ${data.documentId}`);
      hideOtherUserEditingIndicator(data.userId, data.documentId);
    }
  });
  
  socketClient.on(SocketEvents.DOCUMENT_CURSOR_MOVE, (data) => {
    if (data.userId !== 'user-123') {
      console.log(`👆 ${data.userId} moved cursor to position ${data.position}`);
      updateOtherUserCursor(data.userId, data.position);
    }
  });
  
  socketClient.on(SocketEvents.DOCUMENT_CONTENT_CHANGE, (data) => {
    if (data.userId !== 'user-123') {
      console.log(`✏️ ${data.userId} updated document content`);
      applyContentChange(data.content, data.position);
    }
  });
  
  // End editing after 10 seconds
  setTimeout(() => {
    socketClient.endEditingDocument(documentId);
    console.log('🔓 Ended editing session');
  }, 10000);
}

// Example 6: Typing Indicators
function typingIndicatorsExample() {
  console.log('=== Typing Indicators Example ===');
  
  const projectId = 'project-456';
  const taskId = 'task-789';
  const documentId = 'document-123';
  
  // Listen for typing indicators
  socketClient.on(SocketEvents.USER_TYPING, (data) => {
    console.log(`⌨️ ${data.userId} is typing...`);
    
    if (data.documentId) {
      showTypingIndicatorInDocument(data.userId, data.documentId);
    } else if (data.taskId) {
      showTypingIndicatorInTask(data.userId, data.taskId);
    } else if (data.projectId) {
      showTypingIndicatorInProject(data.userId, data.projectId);
    }
  });
  
  socketClient.on(SocketEvents.USER_STOP_TYPING, (data) => {
    console.log(`⌨️ ${data.userId} stopped typing`);
    hideTypingIndicator(data.userId);
  });
  
  // Simulate typing in different contexts
  function simulateTyping() {
    // Start typing in document
    socketClient.startTyping(projectId, taskId, documentId);
    
    setTimeout(() => {
      // Stop typing
      socketClient.stopTyping(projectId, taskId, documentId);
    }, 3000);
  }
  
  // Start simulation after 2 seconds
  setTimeout(simulateTyping, 2000);
}

// Example 7: Error Handling
function errorHandlingExample() {
  console.log('=== Error Handling Example ===');
  
  // Handle connection errors
  socketClient.on('connect_error', (error) => {
    console.error('❌ Connection error:', error.message);
    showConnectionErrorMessage();
  });
  
  // Handle general errors
  socketClient.on('error', (error) => {
    console.error('❌ Socket error:', error);
    handleSocketError(error);
  });
  
  // Handle authentication errors
  socketClient.on('disconnect', (reason) => {
    if (reason === 'io server disconnect') {
      console.error('❌ Server disconnected the client (possibly authentication issue)');
      redirectToLogin();
    }
  });
  
  // Connection status monitoring
  setInterval(() => {
    if (!socketClient.isConnected()) {
      console.warn('⚠️ Socket not connected, attempting to reconnect...');
      socketClient.connect('user-123');
    }
  }, 30000); // Check every 30 seconds
}

// Example 8: API Integration
async function apiIntegrationExample() {
  console.log('=== API Integration Example ===');
  
  try {
    // Fetch notifications via REST API
    const notificationsResponse = await fetch('/api/notifications?limit=10&unreadOnly=true', {
      headers: {
        'Authorization': 'Bearer your-jwt-token'
      }
    });
    
    const notifications = await notificationsResponse.json();
    console.log('📬 Fetched notifications:', notifications.data.length);
    
    // Create a notification via API
    const createResponse = await fetch('/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer your-jwt-token'
      },
      body: JSON.stringify({
        userId: 'user-456',
        type: 'TASK_ASSIGNED',
        title: 'New Task Assigned',
        message: 'You have been assigned a new task',
        priority: 'HIGH',
        data: {
          taskId: 'task-123',
          projectId: 'project-456'
        }
      })
    });
    
    const newNotification = await createResponse.json();
    console.log('✅ Created notification:', newNotification.data.id);
    
    // Broadcast real-time update via API
    const broadcastResponse = await fetch('/api/realtime/broadcast', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer your-jwt-token'
      },
      body: JSON.stringify({
        type: 'project_update',
        target: { projectId: 'project-456' },
        data: {
          title: 'Project Status Updated',
          message: 'Project moved to in progress',
          changes: { status: 'in_progress' }
        }
      })
    });
    
    const broadcastResult = await broadcastResponse.json();
    console.log('📤 Broadcast sent:', broadcastResult.success);
    
  } catch (error) {
    console.error('❌ API error:', error);
  }
}

// Helper functions (these would be implemented in your actual application)
function updateProjectStatusInUI(projectId, status) {
  console.log(`🎨 UI: Update project ${projectId} status to ${status}`);
}

function updateProjectDeadlineInUI(projectId, deadline) {
  console.log(`🎨 UI: Update project ${projectId} deadline to ${deadline}`);
}

function updateTaskInUI(taskId, changes) {
  console.log(`🎨 UI: Update task ${taskId}:`, changes);
}

function showNotificationInUI(notification) {
  console.log(`🎨 UI: Show ${notification.priority} notification: ${notification.title}`);
}

function updateNotificationUIAsRead(notificationId) {
  console.log(`🎨 UI: Mark notification ${notificationId} as read`);
}

function updateUserStatusInUI(userId, status, lastSeen) {
  console.log(`🎨 UI: Update user ${userId} status to ${status}`, lastSeen ? `(last seen: ${lastSeen})` : '');
}

function enableDocumentEditing(documentId) {
  console.log(`🎨 UI: Enable editing for document ${documentId}`);
}

function showEditingBlockedMessage(message) {
  console.log(`🎨 UI: Show editing blocked message: ${message}`);
}

function showOtherUserEditingIndicator(userId, documentId) {
  console.log(`🎨 UI: Show ${userId} is editing ${documentId}`);
}

function hideOtherUserEditingIndicator(userId, documentId) {
  console.log(`🎨 UI: Hide ${userId} editing indicator for ${documentId}`);
}

function updateOtherUserCursor(userId, position) {
  console.log(`🎨 UI: Update ${userId} cursor to position ${position}`);
}

function applyContentChange(content, position) {
  console.log(`🎨 UI: Apply content change at position ${position}: ${content}`);
}

function showTypingIndicatorInDocument(userId, documentId) {
  console.log(`🎨 UI: Show ${userId} typing in document ${documentId}`);
}

function showTypingIndicatorInTask(userId, taskId) {
  console.log(`🎨 UI: Show ${userId} typing in task ${taskId}`);
}

function showTypingIndicatorInProject(userId, projectId) {
  console.log(`🎨 UI: Show ${userId} typing in project ${projectId}`);
}

function hideTypingIndicator(userId) {
  console.log(`🎨 UI: Hide typing indicator for ${userId}`);
}

function showConnectionErrorMessage() {
  console.log('🎨 UI: Show connection error message');
}

function handleSocketError(error) {
  console.log('🎨 UI: Handle socket error:', error);
}

function redirectToLogin() {
  console.log('🎨 UI: Redirect to login page');
}

// Run examples
async function runExamples() {
  console.log('🚀 Starting Real-time Communication Examples\n');
  
  // Run examples in sequence
  await basicConnectionExample();
  
  setTimeout(() => {
    projectUpdatesExample();
  }, 1000);
  
  setTimeout(() => {
    notificationSystemExample();
  }, 2000);
  
  setTimeout(() => {
    presenceTrackingExample();
  }, 3000);
  
  setTimeout(() => {
    collaborativeEditingExample();
  }, 4000);
  
  setTimeout(() => {
    typingIndicatorsExample();
  }, 5000);
  
  setTimeout(() => {
    errorHandlingExample();
  }, 6000);
  
  setTimeout(() => {
    apiIntegrationExample();
  }, 7000);
}

// Export for use in other files
export {
  basicConnectionExample,
  projectUpdatesExample,
  notificationSystemExample,
  presenceTrackingExample,
  collaborativeEditingExample,
  typingIndicatorsExample,
  errorHandlingExample,
  apiIntegrationExample,
  runExamples
};

// Run if this file is executed directly
if (typeof window === 'undefined' && import.meta.url === `file://${process.argv[1]}`) {
  runExamples();
}