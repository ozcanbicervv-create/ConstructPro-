"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Key, 
  Eye, 
  EyeOff, 
  Smartphone, 
  Lock, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  UserX,
  Download,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SecuritySettings {
  twoFactorEnabled: boolean;
  passwordLastChanged: string;
  loginNotifications: boolean;
  sessionTimeout: number;
  ipWhitelist: string[];
  dataEncryption: boolean;
  auditLog: boolean;
}

interface PrivacySettings {
  profileVisibility: 'public' | 'team' | 'private';
  activityTracking: boolean;
  dataSharing: boolean;
  marketingEmails: boolean;
  analyticsOptOut: boolean;
  locationTracking: boolean;
}

interface AccountSettingsProps {
  className?: string;
}

export function AccountSettings({ className = "" }: AccountSettingsProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorEnabled: true,
    passwordLastChanged: '2024-01-15',
    loginNotifications: true,
    sessionTimeout: 30,
    ipWhitelist: ['192.168.1.1', '10.0.0.1'],
    dataEncryption: true,
    auditLog: true
  });

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    profileVisibility: 'team',
    activityTracking: true,
    dataSharing: false,
    marketingEmails: true,
    analyticsOptOut: false,
    locationTracking: true
  });

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      toast({
        title: "Password Updated",
        description: "Your password has been successfully changed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSecuritySettingChange = (key: keyof SecuritySettings, value: boolean | number) => {
    setSecuritySettings(prev => ({ ...prev, [key]: value }));
  };

  const handlePrivacySettingChange = (key: keyof PrivacySettings, value: boolean | string) => {
    setPrivacySettings(prev => ({ ...prev, [key]: value }));
  };

  const handleEnable2FA = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      handleSecuritySettingChange('twoFactorEnabled', !securitySettings.twoFactorEnabled);
      
      toast({
        title: securitySettings.twoFactorEnabled ? "2FA Disabled" : "2FA Enabled",
        description: securitySettings.twoFactorEnabled 
          ? "Two-factor authentication has been disabled." 
          : "Two-factor authentication has been enabled.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update 2FA settings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    setIsLoading(true);
    try {
      // Simulate data export
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Data Export Started",
        description: "Your data export will be ready for download shortly.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    // This would typically show a confirmation dialog
    toast({
      title: "Account Deletion",
      description: "Please contact support to delete your account.",
      variant: "destructive",
    });
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    return strength;
  };

  const getPasswordStrengthLabel = (strength: number) => {
    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['text-red-500', 'text-orange-500', 'text-yellow-500', 'text-blue-500', 'text-green-500'];
    return { label: labels[strength] || 'Very Weak', color: colors[strength] || 'text-red-500' };
  };

  const passwordStrength = getPasswordStrength(newPassword);
  const strengthInfo = getPasswordStrengthLabel(passwordStrength);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Security Settings */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Password Change */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Change Password</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPasswords.current ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                  >
                    {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPasswords.new ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  >
                    {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {newPassword && (
                  <p className={`text-sm ${strengthInfo.color}`}>
                    Strength: {strengthInfo.label}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  >
                    {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handlePasswordChange} 
              disabled={!currentPassword || !newPassword || !confirmPassword || isLoading}
              className="w-full md:w-auto"
            >
              <Key className="h-4 w-4 mr-2" />
              {isLoading ? 'Updating...' : 'Update Password'}
            </Button>
            
            <p className="text-sm text-muted-foreground">
              Last changed: {new Date(securitySettings.passwordLastChanged).toLocaleDateString()}
            </p>
          </div>

          <Separator />

          {/* Two-Factor Authentication */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Two-Factor Authentication</h3>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
              <div className="flex items-center gap-2">
                {securitySettings.twoFactorEnabled && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Enabled
                  </Badge>
                )}
                <Switch
                  checked={securitySettings.twoFactorEnabled}
                  onCheckedChange={handleEnable2FA}
                  disabled={isLoading}
                />
              </div>
            </div>
            
            {securitySettings.twoFactorEnabled && (
              <Alert>
                <Smartphone className="h-4 w-4" />
                <AlertDescription>
                  Two-factor authentication is active. You'll need your authenticator app to sign in.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <Separator />

          {/* Security Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Security Options</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Login Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get notified of new sign-ins</p>
                </div>
                <Switch
                  checked={securitySettings.loginNotifications}
                  onCheckedChange={(checked) => handleSecuritySettingChange('loginNotifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Data Encryption</Label>
                  <p className="text-sm text-muted-foreground">Encrypt sensitive data</p>
                </div>
                <Switch
                  checked={securitySettings.dataEncryption}
                  onCheckedChange={(checked) => handleSecuritySettingChange('dataEncryption', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Audit Log</Label>
                  <p className="text-sm text-muted-foreground">Track account activity</p>
                </div>
                <Switch
                  checked={securitySettings.auditLog}
                  onCheckedChange={(checked) => handleSecuritySettingChange('auditLog', checked)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Privacy Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Profile Visibility</Label>
                <p className="text-sm text-muted-foreground">Who can see your profile</p>
              </div>
              <select
                value={privacySettings.profileVisibility}
                onChange={(e) => handlePrivacySettingChange('profileVisibility', e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="public">Public</option>
                <option value="team">Team Only</option>
                <option value="private">Private</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Activity Tracking</Label>
                <p className="text-sm text-muted-foreground">Track your activity for analytics</p>
              </div>
              <Switch
                checked={privacySettings.activityTracking}
                onCheckedChange={(checked) => handlePrivacySettingChange('activityTracking', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Data Sharing</Label>
                <p className="text-sm text-muted-foreground">Share anonymized data for improvements</p>
              </div>
              <Switch
                checked={privacySettings.dataSharing}
                onCheckedChange={(checked) => handlePrivacySettingChange('dataSharing', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Marketing Emails</Label>
                <p className="text-sm text-muted-foreground">Receive product updates and news</p>
              </div>
              <Switch
                checked={privacySettings.marketingEmails}
                onCheckedChange={(checked) => handlePrivacySettingChange('marketingEmails', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Analytics Opt-out</Label>
                <p className="text-sm text-muted-foreground">Opt out of usage analytics</p>
              </div>
              <Switch
                checked={privacySettings.analyticsOptOut}
                onCheckedChange={(checked) => handlePrivacySettingChange('analyticsOptOut', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Location Tracking</Label>
                <p className="text-sm text-muted-foreground">Allow location-based features</p>
              </div>
              <Switch
                checked={privacySettings.locationTracking}
                onCheckedChange={(checked) => handlePrivacySettingChange('locationTracking', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={handleExportData} variant="outline" disabled={isLoading}>
              <Download className="h-4 w-4 mr-2" />
              Export My Data
            </Button>
            
            <Button onClick={handleDeleteAccount} variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </div>
          
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Account deletion is permanent and cannot be undone. All your data will be permanently removed.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}

export default AccountSettings;