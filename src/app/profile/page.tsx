"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { UserProfile } from "@/components/user-profile";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-construction-yellow-50 to-construction-black-50">
        <div className="container mx-auto p-6">
          <h1 className="text-3xl font-bold text-construction-black-900 mb-8">
            User Profile
          </h1>
          <UserProfile />
        </div>
      </div>
    </ProtectedRoute>
  );
}