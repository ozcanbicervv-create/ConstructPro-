'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
    ArrowLeft,
    Calendar,
    DollarSign,
    MapPin,
    Users,
    Clock,
    FileText,
    Image,
    MessageSquare,
    Settings,
    Edit,
    Share,
    Download,
    AlertTriangle,
    CheckCircle,
    TrendingUp,
    Activity,
    Paperclip,
    Send
} from 'lucide-react';
import { Project } from './ProjectGrid';

// Extended project data for detail view
export interface ProjectDetail extends Project {
    overview: {
        totalTasks: number;
        completedTasks: number;
        overdueTasks: number;
        upcomingMilestones: number;
    };
    timeline: Array<{
        id: string;
        title: string;
        description: string;
        date: string;
        type: 'milestone' | 'task' | 'update' | 'issue';
        status: 'completed' | 'in-progress' | 'upcoming';
        assignee?: {
            name: string;
            avatar?: string;
        };
    }>;
    documents: Array<{
        id: string;
        name: string;
        type: string;
        size: string;
        uploadedBy: string;
        uploadedAt: string;
        url: string;
    }>;
    comments: Array<{
        id: string;
        author: {
            name: string;
            avatar?: string;
            role: string;
        };
        content: string;
        timestamp: string;
        attachments?: Array<{
            name: string;
            url: string;
        }>;
    }>;
    financials: {
        totalBudget: number;
        spent: number;
        committed: number;
        remaining: number;
        breakdown: Array<{
            category: string;
            budgeted: number;
            spent: number;
            percentage: number;
        }>;
    };
}

// Project Overview Tab
interface ProjectOverviewProps {
    project: ProjectDetail;
}

const ProjectOverview: React.FC<ProjectOverviewProps> = ({ project }) => {
    const budgetUtilization = (project.spent / project.budget) * 100;
    const timeElapsed = Math.floor(
        (new Date().getTime() - new Date(project.startDate).getTime()) /
        (new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) * 100
    );

    return (
        <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                                <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Completion</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {project.progress}%
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Budget Used</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {budgetUtilization.toFixed(1)}%
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Time Elapsed</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {Math.max(0, timeElapsed)}%
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                                <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Team Size</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {project.team.length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Project Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Project Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</label>
                            <p className="text-gray-900 dark:text-white mt-1">{project.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Start Date</label>
                                <p className="text-gray-900 dark:text-white mt-1">
                                    {new Date(project.startDate).toLocaleDateString()}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">End Date</label>
                                <p className="text-gray-900 dark:text-white mt-1">
                                    {new Date(project.endDate).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</label>
                                <p className="text-gray-900 dark:text-white mt-1">{project.location}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Client</label>
                                <p className="text-gray-900 dark:text-white mt-1">{project.client}</p>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Tags</label>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {project.tags.map((tag) => (
                                    <Badge key={tag} variant="outline">{tag}</Badge>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Team Members</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={project.manager.avatar} />
                                    <AvatarFallback>
                                        {project.manager.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {project.manager.name}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Project Manager</p>
                                </div>
                                <Badge>Manager</Badge>
                            </div>

                            {project.team.map((member) => (
                                <div key={member.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={member.avatar} />
                                        <AvatarFallback>
                                            {member.name.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {member.name}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{member.role}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Progress Overview */}
            <Card>
                <CardHeader>
                    <CardTitle>Progress Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Overall Progress</span>
                                <span className="text-sm text-gray-600 dark:text-gray-400">{project.progress}%</span>
                            </div>
                            <Progress value={project.progress} className="h-3" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {project.overview.completedTasks}
                                </div>
                                <div className="text-sm text-green-600 dark:text-green-400">Completed Tasks</div>
                            </div>

                            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                    {project.overview.totalTasks - project.overview.completedTasks}
                                </div>
                                <div className="text-sm text-yellow-600 dark:text-yellow-400">Remaining Tasks</div>
                            </div>

                            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                    {project.overview.overdueTasks}
                                </div>
                                <div className="text-sm text-red-600 dark:text-red-400">Overdue Tasks</div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

// Project Timeline Tab
interface ProjectTimelineProps {
    timeline: ProjectDetail['timeline'];
}

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ timeline }) => {
    const getTimelineIcon = (type: string) => {
        switch (type) {
            case 'milestone':
                return <CheckCircle className="h-4 w-4" />;
            case 'task':
                return <Activity className="h-4 w-4" />;
            case 'update':
                return <MessageSquare className="h-4 w-4" />;
            case 'issue':
                return <AlertTriangle className="h-4 w-4" />;
            default:
                return <Activity className="h-4 w-4" />;
        }
    };

    const getTimelineColor = (type: string, status: string) => {
        if (status === 'completed') return 'text-green-600 bg-green-100 dark:bg-green-900/20';
        if (status === 'in-progress') return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
        if (type === 'issue') return 'text-red-600 bg-red-100 dark:bg-red-900/20';
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    };

    return (
        <div className="space-y-4">
            {timeline.map((item, index) => (
                <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-4"
                >
                    <div className={cn(
                        "p-2 rounded-full",
                        getTimelineColor(item.type, item.status)
                    )}>
                        {getTimelineIcon(item.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                                {item.title}
                            </h4>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date(item.date).toLocaleDateString()}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {item.description}
                        </p>
                        {item.assignee && (
                            <div className="flex items-center space-x-2 mt-2">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={item.assignee.avatar} />
                                    <AvatarFallback className="text-xs">
                                        {item.assignee.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {item.assignee.name}
                                </span>
                            </div>
                        )}
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

// Project Documents Tab
interface ProjectDocumentsProps {
    documents: ProjectDetail['documents'];
}

const ProjectDocuments: React.FC<ProjectDocumentsProps> = ({ documents }) => {
    const getFileIcon = (type: string) => {
        if (type.includes('image')) return <Image className="h-5 w-5" />;
        return <FileText className="h-5 w-5" />;
    };

    return (
        <div className="space-y-4">
            {documents.map((doc) => (
                <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        {getFileIcon(doc.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-white truncate">
                            {doc.name}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            <span>{doc.size}</span>
                            <span>Uploaded by {doc.uploadedBy}</span>
                            <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                    </Button>
                </motion.div>
            ))}
        </div>
    );
};

// Main Project Detail View Component
export interface ProjectDetailViewProps {
    project: ProjectDetail;
    onBack: () => void;
    onEdit: () => void;
    className?: string;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
    project,
    onBack,
    onEdit,
    className
}) => {
    const [activeTab, setActiveTab] = useState('overview');

    const getStatusColor = (status: Project['status']) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            case 'planning':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
            case 'on-hold':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'completed':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
            case 'cancelled':
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
        }
    };

    return (
        <div className={cn("space-y-6", className)}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm" onClick={onBack}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Projects
                    </Button>
                    <Separator orientation="vertical" className="h-6" />
                    <div>
                        <div className="flex items-center space-x-3">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {project.name}
                            </h1>
                            <Badge className={getStatusColor(project.status)}>
                                {project.status}
                            </Badge>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            {project.client} • {project.location}
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                        <Share className="h-4 w-4 mr-2" />
                        Share
                    </Button>
                    <Button variant="outline" size="sm" onClick={onEdit}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                    </Button>
                    <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                    <TabsTrigger value="comments">Comments</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6">
                    <ProjectOverview project={project} />
                </TabsContent>

                <TabsContent value="timeline" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Project Timeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ProjectTimeline timeline={project.timeline} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="documents" className="mt-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Project Documents</CardTitle>
                                <Button size="sm">
                                    <Paperclip className="h-4 w-4 mr-2" />
                                    Upload Document
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ProjectDocuments documents={project.documents} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="comments" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Project Comments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {project.comments.map((comment) => (
                                    <div key={comment.id} className="flex items-start space-x-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={comment.author.avatar} />
                                            <AvatarFallback className="text-xs">
                                                {comment.author.name.split(' ').map(n => n[0]).join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2">
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {comment.author.name}
                                                </span>
                                                <Badge variant="outline" className="text-xs">
                                                    {comment.author.role}
                                                </Badge>
                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                    {new Date(comment.timestamp).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-gray-700 dark:text-gray-300 mt-1">
                                                {comment.content}
                                            </p>
                                            {comment.attachments && comment.attachments.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {comment.attachments.map((attachment, index) => (
                                                        <Badge key={index} variant="outline" className="text-xs">
                                                            <Paperclip className="h-3 w-3 mr-1" />
                                                            {attachment.name}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {/* Add Comment Form */}
                                <div className="flex items-start space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback>You</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-2">
                                        <textarea
                                            placeholder="Add a comment..."
                                            className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                                            rows={3}
                                        />
                                        <div className="flex items-center justify-between">
                                            <Button variant="ghost" size="sm">
                                                <Paperclip className="h-4 w-4 mr-2" />
                                                Attach File
                                            </Button>
                                            <Button size="sm">
                                                <Send className="h-4 w-4 mr-2" />
                                                Post Comment
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default ProjectDetailView;