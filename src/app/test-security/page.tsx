/**
 * Security Features Testing Page
 * Demonstrates security UI components and features
 */

"use client";

import { 
  Shield, 
  Lock, 
  Key, 
  Eye, 
  EyeOff,
  AlertTriangle, 
  CheckCircle,
  Users,
  Activity,
  Settings,
  ShieldCheck,
  ShieldAlert,
  ShieldX
} from 'lucide-react';
import React, { useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

export default function SecurityTestPage() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [auditEvents, setAuditEvents] = useState([
    {
      id: '1',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      user: 'John Doe',
      action: 'login',
      result: 'success',
      ip: '192.168.1.100',
      risk: 'low'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      user: 'Jane Smith',
      action: 'access_denied',
      result: 'failure',
      ip: '10.0.0.50',
      risk: 'high'
    }
  ]);

  const calculatePasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) {score += 1;}
    if (/[A-Z]/.test(pwd)) {score += 1;}
    if (/[a-z]/.test(pwd)) {score += 1;}
    if (/\d/.test(pwd)) {score += 1;}
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {score += 1;}
    return Math.min(5, score);
  };

  const getStrengthLabel = (score: number) => {
    if (score <= 1) {return 'Very Weak';}
    if (score <= 2) {return 'Weak';}
    if (score <= 3) {return 'Fair';}
    if (score <= 4) {return 'Good';}
    return 'Strong';
  };

  const getStrengthColor = (score: number) => {
    if (score <= 1) {return 'bg-red-500';}
    if (score <= 2) {return 'bg-orange-500';}
    if (score <= 3) {return 'bg-yellow-500';}
    if (score <= 4) {return 'bg-blue-500';}
    return 'bg-green-500';
  };

  const passwordStrength = calculatePasswordStrength(password);

  const addAuditEvent = (action: string) => {
    const newEvent = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      user: 'Current User',
      action,
      result: 'success' as const,
      ip: '127.0.0.1',
      risk: 'low' as const
    };
    setAuditEvents(prev => [newEvent, ...prev]);
  };

  return (
    <div className="min-h-screen bg-background">
      <main id="main-content" className="container mx-auto p-6 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-2">
            <Shield className="h-8 w-8" />
            Security Features Demo
          </h1>
          <p className="text-lg text-muted-foreground">
            Comprehensive security UI components and access control
          </p>
        </div>

        {/* Security Badges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Status Badges
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Security Levels</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-800 border-green-200">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">High Security</span>
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-800 border-blue-200">
                  <Shield className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">Medium Security</span>
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1.5 px-2.5 py-1 bg-yellow-100 text-yellow-800 border-yellow-200">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">Low Security</span>
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1.5 px-2.5 py-1 bg-red-100 text-red-800 border-red-200">
                  <ShieldX className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">Critical</span>
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Access Control</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Encryption Status</h4>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-green-700 border-green-300">
                      <Lock className="h-3.5 w-3.5 mr-1" />
                      Encrypted
                    </Badge>
                    <Badge variant="outline" className="text-red-700 border-red-300">
                      <Key className="h-3.5 w-3.5 mr-1" />
                      Not Encrypted
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Authentication</h4>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-green-700 border-green-300">
                      <Key className="h-3.5 w-3.5 mr-1" />
                      Authenticated (2FA)
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Secure Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Secure Password Input
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter a secure password"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </Button>
              </div>
            </div>

            {password && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Password Strength: {getStrengthLabel(passwordStrength)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {passwordStrength}/5
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${getStrengthColor(passwordStrength)}`}
                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Permission Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Permission-Based Access Control
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Current User: User Role | Permissions: read:projects, write:tasks
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Access Control Examples</h3>
              
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  ✅ Projects: You can read project information!
                </AlertDescription>
              </Alert>

              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  ❌ Admin Panel: Admin access required.
                </AlertDescription>
              </Alert>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Permission-Controlled Actions</h3>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => addAuditEvent('view_projects')}>
                  View Projects
                </Button>
                <Button onClick={() => addAuditEvent('create_task')}>
                  Create Task
                </Button>
                <Button 
                  variant="destructive" 
                  disabled
                  title="Admin permission required"
                >
                  Delete User
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Data Masking</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Credit Card:</span>
                  <span className="font-mono">••••••••••••9012</span>
                  <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">API Key:</span>
                  <span className="font-mono">sk_live_••••••••••••••••</span>
                  <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audit Trail */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Security Audit Trail
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  onClick={() => addAuditEvent('test_login')}
                  variant="outline"
                >
                  Simulate Login
                </Button>
                <Button
                  onClick={() => addAuditEvent('test_access_denied')}
                  variant="outline"
                >
                  Simulate Access Denied
                </Button>
                <Button
                  onClick={() => addAuditEvent('test_download')}
                  variant="outline"
                >
                  Simulate Download
                </Button>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {auditEvents.map((event) => (
                  <div key={event.id} className="p-3 rounded-lg border">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{event.user}</span>
                          <span className="text-sm text-muted-foreground">{event.action}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {event.timestamp.toLocaleString()} | IP: {event.ip}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-xs ${
                          event.risk === 'high' ? 'text-red-600 bg-red-50' : 'text-blue-600 bg-blue-50'
                        }`}>
                          {event.risk.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${
                          event.result === 'success' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                        }`}>
                          {event.result.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Security Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Encryption Settings</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Data at Rest:</span>
                    <Badge variant="outline" className="text-green-700 border-green-300">Enabled</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Data in Transit:</span>
                    <Badge variant="outline" className="text-green-700 border-green-300">Enabled</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Access Control</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Multi-Factor Auth:</span>
                    <Badge variant="outline" className="text-green-700 border-green-300">Enabled</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Session Timeout:</span>
                    <Badge variant="outline" className="text-yellow-700 border-yellow-300">30 min</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}