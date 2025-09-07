"use client";

import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  authService, 
  projectService, 
  socketService, 
  userService 
} from "@/services";
import type { Project, User } from "@/types";

/**
 * Example component demonstrating how to use the service layer
 * This shows best practices for API calls, error handling, and real-time updates
 */
export function ServiceUsageExample() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const { toast } = useToast();

  // Initialize services and load data
  useEffect(() => {
    initializeAndLoadData();
    setupSocketListeners();

    return () => {
      // Cleanup socket listeners
      socketService.off('connected');
      socketService.off('disconnected');
    };
  }, []);

  const initializeAndLoadData = async () => {
    try {
      setLoading(true);

      // Check if user is authenticated
      if (!authService.isAuthenticated()) {
        toast({
          title: "Authentication Required",
          description: "Please log in to view this content.",
          variant: "destructive",
        });
        return;
      }

      // Load projects and users in parallel
      const [projectsResponse, usersResponse] = await Promise.all([
        projectService.getProjects({ page: 1, limit: 10 }),
        userService.getUsers(1, 10),
      ]);

      if (projectsResponse.success && projectsResponse.data) {
        setProjects(projectsResponse.data);
      }

      if (usersResponse.success && usersResponse.data) {
        setUsers(usersResponse.data);
      }

      // Connect to socket for real-time updates
      if (!socketConnected) {
        await socketService.connect();
      }

    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: "Error",
        description: "Failed to load data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setupSocketListeners = () => {
    // Listen for socket connection events
    socketService.on('connected', () => {
      setSocketConnected(true);
      toast({
        title: "Connected",
        description: "Real-time updates are now active.",
      });
    });

    socketService.on('disconnected', () => {
      setSocketConnected(false);
      toast({
        title: "Disconnected",
        description: "Real-time updates are temporarily unavailable.",
        variant: "destructive",
      });
    });

    // Listen for project updates
    socketService.subscribe('project_update', (payload) => {
      console.log('Project updated:', payload);
      // Update local project state
      setProjects(prev => 
        prev.map(project => 
          project.id === payload.projectId 
            ? { ...project, ...payload.updates }
            : project
        )
      );
    });

    // Listen for user status updates
    socketService.subscribe('user_status', (payload) => {
      console.log('User status updated:', payload);
      // Update local user state
      setUsers(prev =>
        prev.map(user =>
          user.id === payload.userId
            ? { ...user, isOnline: payload.isOnline }
            : user
        )
      );
    });
  };

  const handleCreateProject = async () => {
    try {
      setLoading(true);

      const newProject = {
        name: "Example Project",
        description: "A project created through the service layer",
        client: "Example Client",
        type: "residential" as const,
        priority: "medium" as const,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        budget: 100000,
        location: {
          address: "123 Example St",
          city: "Example City",
          state: "Example State",
          country: "Example Country",
        },
      };

      const response = await projectService.createProject(newProject);

      if (response.success && response.data) {
        setProjects(prev => [...prev, response.data!]);
        toast({
          title: "Success",
          description: "Project created successfully!",
        });

        // Send real-time notification
        await socketService.sendMessage('project_update', {
          type: 'created',
          project: response.data,
        });
      }
    } catch (error) {
      console.error('Failed to create project:', error);
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      socketService.disconnect();
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleRefreshData = async () => {
    await initializeAndLoadData();
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Service Layer Example</h1>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${socketConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600">
            {socketConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="flex space-x-4">
        <Button onClick={handleRefreshData} disabled={loading}>
          Refresh Data
        </Button>
        <Button onClick={handleCreateProject} disabled={loading}>
          Create Example Project
        </Button>
        <Button onClick={handleLogout} variant="outline">
          Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Projects Section */}
        <Card>
          <CardHeader>
            <CardTitle>Projects ({projects.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading projects...</p>
            ) : projects.length > 0 ? (
              <div className="space-y-2">
                {projects.map((project) => (
                  <div key={project.id} className="p-3 border rounded-lg">
                    <h3 className="font-medium">{project.name}</h3>
                    <p className="text-sm text-gray-600">{project.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {project.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {project.progress}% complete
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No projects found</p>
            )}
          </CardContent>
        </Card>

        {/* Users Section */}
        <Card>
          <CardHeader>
            <CardTitle>Team Members ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading users...</p>
            ) : users.length > 0 ? (
              <div className="space-y-2">
                {users.map((user) => (
                  <div key={user.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{user.name || user.email}</h3>
                        <p className="text-sm text-gray-600">{user.title || user.role}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <span className="text-xs text-gray-500">
                          {user.isOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No users found</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Service Status */}
      <Card>
        <CardHeader>
          <CardTitle>Service Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">✓</div>
              <p className="text-sm">API Service</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {authService.isAuthenticated() ? '✓' : '✗'}
              </div>
              <p className="text-sm">Authentication</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">✓</div>
              <p className="text-sm">Project Service</p>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${socketConnected ? 'text-green-600' : 'text-red-600'}`}>
                {socketConnected ? '✓' : '✗'}
              </div>
              <p className="text-sm">Socket Service</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}