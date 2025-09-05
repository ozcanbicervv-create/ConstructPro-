"use client";

import { useSession } from "next-auth/react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { UserProfile } from "@/components/user-profile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HardHat, Users, FolderOpen, Package } from "lucide-react";

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-construction-yellow-50 to-construction-black-50">
        <div className="container mx-auto p-6">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-construction-yellow-400 p-2 rounded-full">
                <HardHat className="h-6 w-6 text-construction-black-900" />
              </div>
              <h1 className="text-3xl font-bold text-construction-black-900">
                Welcome to ConstructPro
              </h1>
            </div>
            <p className="text-construction-black-600">
              Hello, {session?.user?.firstName || session?.user?.name || "User"}! 
              Here's your construction project dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                <FolderOpen className="h-4 w-4 text-construction-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-construction-black-900">12</div>
                <p className="text-xs text-construction-black-600">+2 from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                <Users className="h-4 w-4 text-construction-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-construction-black-900">48</div>
                <p className="text-xs text-construction-black-600">+5 new this week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Materials</CardTitle>
                <Package className="h-4 w-4 text-construction-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-construction-black-900">1,234</div>
                <p className="text-xs text-construction-black-600">Items in inventory</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Your Role</CardTitle>
                <HardHat className="h-4 w-4 text-construction-yellow-600" />
              </CardHeader>
              <CardContent>
                <Badge className="bg-construction-yellow-100 text-construction-black-900">
                  {session?.user?.role || "WORKER"}
                </Badge>
                <p className="text-xs text-construction-black-600 mt-1">Access level</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest updates from your projects</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-construction-yellow-400 rounded-full"></div>
                      <p className="text-sm text-construction-black-700">
                        Project "Downtown Office Complex" updated - 75% complete
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <p className="text-sm text-construction-black-700">
                        Material delivery scheduled for tomorrow
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <p className="text-sm text-construction-black-700">
                        New team member joined "Residential Complex" project
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <button className="w-full text-left p-2 rounded hover:bg-construction-yellow-50 text-sm">
                    Create New Project
                  </button>
                  <button className="w-full text-left p-2 rounded hover:bg-construction-yellow-50 text-sm">
                    Add Team Member
                  </button>
                  <button className="w-full text-left p-2 rounded hover:bg-construction-yellow-50 text-sm">
                    Order Materials
                  </button>
                  <button className="w-full text-left p-2 rounded hover:bg-construction-yellow-50 text-sm">
                    Schedule Inspection
                  </button>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-8">
            <UserProfile />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}