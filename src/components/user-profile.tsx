/**
 * User Profile Component for ConstructPro
 */

import React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function UserProfile() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Profile</h1>
        <p className="text-muted-foreground">
          Manage your profile and account settings
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <p>User profile features will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default UserProfile;