'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Edit3, 
  Eye, 
  MessageCircle, 
  Users, 
  Lock, 
  Unlock,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface CollaborationUser {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
  color?: string;
}

interface DocumentCollaboration {
  documentId: string;
  documentName: string;
  isLocked: boolean;
  lockedBy?: CollaborationUser;
  lockTimestamp?: Date;
  viewers: CollaborationUser[];
  editors: CollaborationUser[];
  lastModified: Date;
  lastModifiedBy?: CollaborationUser;
}

interface TaskCollaboration {
  taskId: string;
  taskName: string;
  assignedTo?: CollaborationUser;
  watchers: CollaborationUser[];
  activeCommenters: CollaborationUser[];
  lastActivity: Date;
  status: 'todo' | 'in-progress' | 'review' | 'completed';
}

interface CollaborationIndicatorsProps {
  documents?: DocumentCollaboration[];
  tasks?: TaskCollaboration[];
  currentUserId: string;
  onJoinDocument?: (documentId: string) => void;
  onLeaveDocument?: (documentId: string) => void;
  onWatchTask?: (taskId: string) => void;
  onUnwatchTask?: (taskId: string) => void;
  className?: string;
}

const CollaborationIndicators: React.FC<CollaborationIndicatorsProps> = ({
  documents = [],
  tasks = [],
  currentUserId,
  onJoinDocument,
  onLeaveDocument,
  onWatchTask,
  onUnwatchTask,
  className
}) => {
  const [activeTab, setActiveTab] = useState<'documents' | 'tasks'>('documents');

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const getUserColor = (user: CollaborationUser, index: number) => {
    if (user.color) return user.color;
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];
    return colors[index % colors.length];
  };

  return (
    <TooltipProvider>
      <Card className={cn('w-full', className)}>
        <CardContent className="p-4">
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-4">
            <Button
              variant={activeTab === 'documents' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('documents')}
              className="flex-1 h-8"
            >
              <FileText className="h-4 w-4 mr-1" />
              Documents ({documents.length})
            </Button>
            <Button
              variant={activeTab === 'tasks' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('tasks')}
              className="flex-1 h-8"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Tasks ({tasks.length})
            </Button>
          </div>

          {/* Content */}
          <div className="space-y-3">
            {activeTab === 'documents' && (
              <AnimatePresence>
                {documents.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-6 text-gray-500"
                  >
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No shared documents</p>
                  </motion.div>
                ) : (
                  documents.map((doc, index) => (
                    <motion.div
                      key={doc.documentId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <DocumentCollaborationItem
                        document={doc}
                        currentUserId={currentUserId}
                        onJoin={onJoinDocument}
                        onLeave={onLeaveDocument}
                        formatTimeAgo={formatTimeAgo}
                        getUserColor={getUserColor}
                      />
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            )}

            {activeTab === 'tasks' && (
              <AnimatePresence>
                {tasks.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-6 text-gray-500"
                  >
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No collaborative tasks</p>
                  </motion.div>
                ) : (
                  tasks.map((task, index) => (
                    <motion.div
                      key={task.taskId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <TaskCollaborationItem
                        task={task}
                        currentUserId={currentUserId}
                        onWatch={onWatchTask}
                        onUnwatch={onUnwatchTask}
                        formatTimeAgo={formatTimeAgo}
                        getUserColor={getUserColor}
                      />
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

interface DocumentCollaborationItemProps {
  document: DocumentCollaboration;
  currentUserId: string;
  onJoin?: (documentId: string) => void;
  onLeave?: (documentId: string) => void;
  formatTimeAgo: (date: Date) => string;
  getUserColor: (user: CollaborationUser, index: number) => string;
}

const DocumentCollaborationItem: React.FC<DocumentCollaborationItemProps> = ({
  document,
  currentUserId,
  onJoin,
  onLeave,
  formatTimeAgo,
  getUserColor
}) => {
  const isCurrentUserViewing = document.viewers.some(u => u.id === currentUserId);
  const isCurrentUserEditing = document.editors.some(u => u.id === currentUserId);
  const totalCollaborators = new Set([...document.viewers, ...document.editors]).size;

  return (
    <div className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="font-medium text-sm truncate">{document.documentName}</h4>
            {document.isLocked && (
              <Tooltip>
                <TooltipTrigger>
                  <Lock className="h-4 w-4 text-red-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Locked by {document.lockedBy?.name}</p>
                  <p className="text-xs text-gray-500">
                    {document.lockTimestamp && formatTimeAgo(document.lockTimestamp)}
                  </p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          
          <div className="flex items-center space-x-3 text-xs text-gray-500">
            <span>Last modified {formatTimeAgo(document.lastModified)}</span>
            {document.lastModifiedBy && (
              <span>by {document.lastModifiedBy.name}</span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Collaboration Status */}
          <div className="flex items-center space-x-1">
            {document.editors.length > 0 && (
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex items-center space-x-1 text-orange-600">
                    <Edit3 className="h-3 w-3" />
                    <span className="text-xs">{document.editors.length}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{document.editors.length} editor{document.editors.length > 1 ? 's' : ''}</p>
                  {document.editors.map(editor => (
                    <p key={editor.id} className="text-xs">{editor.name}</p>
                  ))}
                </TooltipContent>
              </Tooltip>
            )}

            {document.viewers.length > 0 && (
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex items-center space-x-1 text-blue-600">
                    <Eye className="h-3 w-3" />
                    <span className="text-xs">{document.viewers.length}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{document.viewers.length} viewer{document.viewers.length > 1 ? 's' : ''}</p>
                  {document.viewers.map(viewer => (
                    <p key={viewer.id} className="text-xs">{viewer.name}</p>
                  ))}
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Action Button */}
          {!document.isLocked && (
            <Button
              variant={isCurrentUserViewing || isCurrentUserEditing ? 'outline' : 'default'}
              size="sm"
              onClick={() => {
                if (isCurrentUserViewing || isCurrentUserEditing) {
                  onLeave?.(document.documentId);
                } else {
                  onJoin?.(document.documentId);
                }
              }}
              className="h-6 px-2 text-xs"
            >
              {isCurrentUserViewing || isCurrentUserEditing ? 'Leave' : 'Join'}
            </Button>
          )}
        </div>
      </div>

      {/* Collaborator Avatars */}
      {totalCollaborators > 0 && (
        <div className="flex items-center space-x-1">
          <div className="flex -space-x-1">
            {[...document.editors, ...document.viewers]
              .filter((user, index, arr) => arr.findIndex(u => u.id === user.id) === index)
              .slice(0, 5)
              .map((user, index) => (
                <Tooltip key={user.id}>
                  <TooltipTrigger>
                    <div className="relative">
                      <Avatar className="h-6 w-6 border-2 border-white">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className={cn('text-xs text-white', getUserColor(user, index))}>
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {document.editors.some(e => e.id === user.id) && (
                        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-orange-500 rounded-full border border-white" />
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{user.name}</p>
                    <p className="text-xs text-gray-500">
                      {document.editors.some(e => e.id === user.id) ? 'Editing' : 'Viewing'}
                    </p>
                  </TooltipContent>
                </Tooltip>
              ))}
          </div>
          {totalCollaborators > 5 && (
            <span className="text-xs text-gray-500 ml-2">
              +{totalCollaborators - 5} more
            </span>
          )}
        </div>
      )}
    </div>
  );
};

interface TaskCollaborationItemProps {
  task: TaskCollaboration;
  currentUserId: string;
  onWatch?: (taskId: string) => void;
  onUnwatch?: (taskId: string) => void;
  formatTimeAgo: (date: Date) => string;
  getUserColor: (user: CollaborationUser, index: number) => string;
}

const TaskCollaborationItem: React.FC<TaskCollaborationItemProps> = ({
  task,
  currentUserId,
  onWatch,
  onUnwatch,
  formatTimeAgo,
  getUserColor
}) => {
  const isCurrentUserWatching = task.watchers.some(u => u.id === currentUserId);
  const isCurrentUserAssigned = task.assignedTo?.id === currentUserId;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'review':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="font-medium text-sm truncate">{task.taskName}</h4>
            <Badge className={cn('text-xs', getStatusColor(task.status))}>
              {task.status.replace('-', ' ')}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-3 text-xs text-gray-500">
            <span>Last activity {formatTimeAgo(task.lastActivity)}</span>
            {task.assignedTo && (
              <span>Assigned to {task.assignedTo.name}</span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Activity Indicators */}
          <div className="flex items-center space-x-1">
            {task.watchers.length > 0 && (
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex items-center space-x-1 text-blue-600">
                    <Eye className="h-3 w-3" />
                    <span className="text-xs">{task.watchers.length}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{task.watchers.length} watcher{task.watchers.length > 1 ? 's' : ''}</p>
                </TooltipContent>
              </Tooltip>
            )}

            {task.activeCommenters.length > 0 && (
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex items-center space-x-1 text-green-600">
                    <MessageCircle className="h-3 w-3" />
                    <span className="text-xs">{task.activeCommenters.length}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Active in comments</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Watch Button */}
          {!isCurrentUserAssigned && (
            <Button
              variant={isCurrentUserWatching ? 'outline' : 'default'}
              size="sm"
              onClick={() => {
                if (isCurrentUserWatching) {
                  onUnwatch?.(task.taskId);
                } else {
                  onWatch?.(task.taskId);
                }
              }}
              className="h-6 px-2 text-xs"
            >
              {isCurrentUserWatching ? 'Unwatch' : 'Watch'}
            </Button>
          )}
        </div>
      </div>

      {/* Collaborator Avatars */}
      <div className="flex items-center space-x-1">
        <div className="flex -space-x-1">
          {/* Assigned User */}
          {task.assignedTo && (
            <Tooltip>
              <TooltipTrigger>
                <div className="relative">
                  <Avatar className="h-6 w-6 border-2 border-white">
                    <AvatarImage src={task.assignedTo.avatar} alt={task.assignedTo.name} />
                    <AvatarFallback className={cn('text-xs text-white', getUserColor(task.assignedTo, 0))}>
                      {task.assignedTo.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-500 rounded-full border border-white" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{task.assignedTo.name}</p>
                <p className="text-xs text-gray-500">Assigned</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Watchers */}
          {task.watchers.slice(0, 4).map((watcher, index) => (
            <Tooltip key={watcher.id}>
              <TooltipTrigger>
                <Avatar className="h-6 w-6 border-2 border-white">
                  <AvatarImage src={watcher.avatar} alt={watcher.name} />
                  <AvatarFallback className={cn('text-xs text-white', getUserColor(watcher, index + 1))}>
                    {watcher.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p>{watcher.name}</p>
                <p className="text-xs text-gray-500">Watching</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
        
        {task.watchers.length > 4 && (
          <span className="text-xs text-gray-500 ml-2">
            +{task.watchers.length - 4} more
          </span>
        )}
      </div>
    </div>
  );
};

export default CollaborationIndicators;
export type { DocumentCollaboration, TaskCollaboration, CollaborationUser };