"use client";

import React, { useState, useMemo } from 'react';
import { useSession } from "next-auth/react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { ProjectGrid } from "@/components/design-system/organisms/ProjectManagement/ProjectGrid";
import Navigation from "@/components/design-system/molecules/Navigation/Navigation";
import MobileNavigation from "@/components/design-system/molecules/MobileNavigation/MobileNavigation";
import Breadcrumb from "@/components/design-system/molecules/Breadcrumb/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    LayoutDashboard,
    Building,
    Package,
    Users,
    Home,
    Menu,
    Download,
    Plus,
    Search,
    Grid3X3,
    List,
    User,
    MapPin,
    Calendar,
    ChevronRight,
} from "lucide-react";
import { Typography } from "@/components/design-system/atoms/Typography";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Mock data for projects
const mockProjects = [
    {
        id: '1',
        name: 'Downtown Office Complex',
        description: 'Modern 15-story office building with sustainable design features',
        status: 'in-progress',
        progress: 65,
        budget: 2500000,
        spent: 1625000,
        startDate: '2024-01-15',
        endDate: '2024-12-20',
        manager: 'Sarah Johnson',
        team: ['John Doe', 'Mike Wilson', 'Lisa Chen'],
        location: 'Downtown, City Center',
        priority: 'high',
        tags: ['Commercial', 'Sustainable', 'High-rise'],
        lastUpdate: '2024-02-15',
    },
    {
        id: '2',
        name: 'Residential Complex Phase 2',
        description: '120-unit residential complex with modern amenities',
        status: 'planning',
        progress: 15,
        budget: 1800000,
        spent: 270000,
        startDate: '2024-03-01',
        endDate: '2025-02-28',
        manager: 'David Brown',
        team: ['Emma Davis', 'Tom Anderson', 'Rachel Green'],
        location: 'Suburban District',
        priority: 'medium',
        tags: ['Residential', 'Multi-unit', 'Amenities'],
        lastUpdate: '2024-02-10',
    },
    {
        id: '3',
        name: 'Highway Bridge Renovation',
        description: 'Complete renovation of 50-year-old highway bridge',
        status: 'completed',
        progress: 100,
        budget: 950000,
        spent: 920000,
        startDate: '2023-08-01',
        endDate: '2024-01-30',
        manager: 'Robert Taylor',
        team: ['Alex Johnson', 'Maria Rodriguez', 'Chris Lee'],
        location: 'Highway 101',
        priority: 'high',
        tags: ['Infrastructure', 'Renovation', 'Transportation'],
        lastUpdate: '2024-01-30',
    },
    {
        id: '4',
        name: 'Shopping Mall Expansion',
        description: 'Adding new wing with 50 retail spaces and food court',
        status: 'on-hold',
        progress: 30,
        budget: 3200000,
        spent: 960000,
        startDate: '2024-01-01',
        endDate: '2024-10-15',
        manager: 'Jennifer White',
        team: ['Kevin Park', 'Sophie Turner', 'Daniel Kim'],
        location: 'West Side Mall',
        priority: 'low',
        tags: ['Commercial', 'Retail', 'Expansion'],
        lastUpdate: '2024-02-01',
    },
];

const navigationItems = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/dashboard',
        icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
        id: 'projects',
        label: 'Projects',
        href: '/projects',
        icon: <Building className="h-4 w-4" />,
        active: true,
    },
    {
        id: 'materials',
        label: 'Materials',
        href: '/materials',
        icon: <Package className="h-4 w-4" />,
    },
    {
        id: 'team',
        label: 'Team',
        href: '/team',
        icon: <Users className="h-4 w-4" />,
    },
];

const breadcrumbItems = [
    {
        id: 'home',
        label: 'Home',
        href: '/',
        icon: <Home className="h-3 w-3" />,
    },
    {
        id: 'projects',
        label: 'Projects',
        current: true,
    },
];

export default function ProjectsPage() {
    const { data: session } = useSession();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [sortBy, setSortBy] = useState('name');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const [isNavCollapsed, setIsNavCollapsed] = useState(false);

    // Filter and sort projects
    const filteredProjects = useMemo(() => {
        let filtered = mockProjects.filter(project => {
            const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                project.manager.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
            const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;

            return matchesSearch && matchesStatus && matchesPriority;
        });

        // Sort projects
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'progress':
                    return b.progress - a.progress;
                case 'budget':
                    return b.budget - a.budget;
                case 'startDate':
                    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
                default:
                    return 0;
            }
        });

        return filtered;
    }, [searchQuery, statusFilter, priorityFilter, sortBy]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            case 'in-progress':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
            case 'planning':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'on-hold':
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'low':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
        }
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                {/* Desktop Navigation */}
                <div className="hidden md:block">
                    <Navigation
                        items={navigationItems}
                        collapsed={isNavCollapsed}
                        onToggleCollapse={() => setIsNavCollapsed(!isNavCollapsed)}
                        variant="glass"
                        className="fixed left-0 top-0 h-full z-30"
                    />
                </div>

                {/* Mobile Navigation */}
                <MobileNavigation
                    items={navigationItems}
                    isOpen={isMobileNavOpen}
                    onToggle={() => setIsMobileNavOpen(!isMobileNavOpen)}
                    variant="glass"
                />

                {/* Main Content */}
                <div className={cn(
                    "transition-all duration-300",
                    isNavCollapsed ? "md:ml-16" : "md:ml-64"
                )}>
                    {/* Header */}
                    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50 sticky top-0 z-20">
                        <div className="px-4 sm:px-6 lg:px-8 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    {/* Mobile Menu Button */}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsMobileNavOpen(true)}
                                        className="md:hidden"
                                    >
                                        <Menu className="h-4 w-4" />
                                    </Button>

                                    <div>
                                        <Typography variant="heading-lg" className="font-bold text-gray-900 dark:text-white">
                                            Projects
                                        </Typography>
                                        <Typography variant="body-sm" className="text-gray-600 dark:text-gray-400">
                                            Manage and track your construction projects
                                        </Typography>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <Button variant="outline" size="sm">
                                        <Download className="h-3 w-3 mr-2" />
                                        Export
                                    </Button>
                                    <Button>
                                        <Plus className="h-3 w-3 mr-2" />
                                        New Project
                                    </Button>
                                </div>
                            </div>

                            {/* Breadcrumb */}
                            <div className="mt-4">
                                <Breadcrumb
                                    items={breadcrumbItems}
                                    variant="glass"
                                />
                            </div>
                        </div>
                    </header>

                    {/* Content */}
                    <main className="px-4 sm:px-6 lg:px-8 py-6">
                        {/* Filters and Search */}
                        <Card className="mb-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-white/20">
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                    {/* Search */}
                                    <div className="lg:col-span-2">
                                        <div className="relative">
                                            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <Input
                                                placeholder="Search projects..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>

                                    {/* Status Filter */}
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="planning">Planning</SelectItem>
                                            <SelectItem value="in-progress">In Progress</SelectItem>
                                            <SelectItem value="on-hold">On Hold</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Priority Filter */}
                                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Priority</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="low">Low</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Sort */}
                                    <Select value={sortBy} onValueChange={setSortBy}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sort by" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="name">Name</SelectItem>
                                            <SelectItem value="progress">Progress</SelectItem>
                                            <SelectItem value="budget">Budget</SelectItem>
                                            <SelectItem value="startDate">Start Date</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* View Mode Toggle */}
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center space-x-2">
                                        <Typography variant="body-sm" className="text-gray-600 dark:text-gray-400">
                                            {filteredProjects.length} projects found
                                        </Typography>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                            size="sm"
                                            onClick={() => setViewMode('grid')}
                                        >
                                            <Grid3X3 className="h-3 w-3" />
                                        </Button>
                                        <Button
                                            variant={viewMode === 'list' ? 'default' : 'ghost'}
                                            size="sm"
                                            onClick={() => setViewMode('list')}
                                        >
                                            <List className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Projects Grid/List */}
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredProjects.map((project, index) => (
                                    <motion.div
                                        key={project.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <Card className="h-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-white/20 hover:shadow-lg transition-all duration-200 cursor-pointer group">
                                            <CardHeader className="pb-3">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                            {project.name}
                                                        </CardTitle>
                                                        <Typography variant="body-sm" className="text-gray-600 dark:text-gray-400 mt-1">
                                                            {project.description}
                                                        </Typography>
                                                    </div>
                                                    <Badge className={cn("ml-2", getStatusColor(project.status))}>
                                                        {project.status.replace('-', ' ')}
                                                    </Badge>
                                                </div>
                                            </CardHeader>

                                            <CardContent className="space-y-4">
                                                {/* Progress */}
                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <Typography variant="body-sm" className="font-medium">Progress</Typography>
                                                        <Typography variant="body-sm" className="text-gray-600 dark:text-gray-400">
                                                            {project.progress}%
                                                        </Typography>
                                                    </div>
                                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                        <motion.div
                                                            className="bg-blue-600 h-2 rounded-full"
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${project.progress}%` }}
                                                            transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Budget */}
                                                <div className="flex items-center justify-between">
                                                    <Typography variant="body-sm" className="text-gray-600 dark:text-gray-400">Budget</Typography>
                                                    <Typography variant="body-sm" className="font-medium">
                                                        ${project.spent.toLocaleString()} / ${project.budget.toLocaleString()}
                                                    </Typography>
                                                </div>

                                                {/* Manager */}
                                                <div className="flex items-center justify-between">
                                                    <Typography variant="body-sm" className="text-gray-600 dark:text-gray-400">Manager</Typography>
                                                    <Typography variant="body-sm" className="font-medium">{project.manager}</Typography>
                                                </div>

                                                {/* Priority */}
                                                <div className="flex items-center justify-between">
                                                    <Typography variant="body-sm" className="text-gray-600 dark:text-gray-400">Priority</Typography>
                                                    <Badge className={cn("text-xs", getPriorityColor(project.priority))}>
                                                        {project.priority}
                                                    </Badge>
                                                </div>

                                                {/* Tags */}
                                                <div className="flex flex-wrap gap-1 pt-2">
                                                    {project.tags.map((tag) => (
                                                        <Badge key={tag} variant="outline" className="text-xs">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-white/20">
                                <CardContent className="p-0">
                                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {filteredProjects.map((project, index) => (
                                            <motion.div
                                                key={project.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-3">
                                                            <Typography variant="heading-sm" className="font-semibold text-gray-900 dark:text-white">
                                                                {project.name}
                                                            </Typography>
                                                            <Badge className={cn(getStatusColor(project.status))}>
                                                                {project.status.replace('-', ' ')}
                                                            </Badge>
                                                            <Badge className={cn("text-xs", getPriorityColor(project.priority))}>
                                                                {project.priority}
                                                            </Badge>
                                                        </div>
                                                        <Typography variant="body-sm" className="text-gray-600 dark:text-gray-400 mt-1">
                                                            {project.description}
                                                        </Typography>
                                                        <div className="flex items-center space-x-6 mt-3">
                                                            <div className="flex items-center space-x-2">
                                                                <User className="h-3 w-3 text-gray-400" />
                                                                <Typography variant="body-sm" className="text-gray-600 dark:text-gray-400">
                                                                    {project.manager}
                                                                </Typography>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <MapPin className="h-3 w-3 text-gray-400" />
                                                                <Typography variant="body-sm" className="text-gray-600 dark:text-gray-400">
                                                                    {project.location}
                                                                </Typography>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <Calendar className="h-3 w-3 text-gray-400" />
                                                                <Typography variant="body-sm" className="text-gray-600 dark:text-gray-400">
                                                                    {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                                                                </Typography>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center space-x-6">
                                                        <div className="text-right">
                                                            <Typography variant="body-sm" className="font-medium">
                                                                {project.progress}%
                                                            </Typography>
                                                            <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                                                                <div
                                                                    className="bg-blue-600 h-2 rounded-full"
                                                                    style={{ width: `${project.progress}%` }}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="text-right">
                                                            <Typography variant="body-sm" className="font-medium">
                                                                ${project.budget.toLocaleString()}
                                                            </Typography>
                                                            <Typography variant="body-xs" className="text-gray-500 dark:text-gray-400">
                                                                ${project.spent.toLocaleString()} spent
                                                            </Typography>
                                                        </div>

                                                        <Button variant="ghost" size="sm">
                                                            <ChevronRight className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Empty State */}
                        {filteredProjects.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center py-12"
                            >
                                <Building className="h-8 w-8 mx-auto text-gray-400 mb-4" />
                                <Typography variant="heading-sm" className="text-gray-900 dark:text-white mb-2">
                                    No projects found
                                </Typography>
                                <Typography variant="body" className="text-gray-600 dark:text-gray-400 mb-6">
                                    Try adjusting your search criteria or create a new project.
                                </Typography>
                                <Button>
                                    <Plus className="h-3 w-3 mr-2" />
                                    Create New Project
                                </Button>
                            </motion.div>
                        )}
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}