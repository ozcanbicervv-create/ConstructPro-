"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Briefcase, 
  Settings, 
  LogOut,
  Save,
  Loader2
} from "lucide-react";

import { updateProfileSchema, type UpdateProfileInput } from "@/lib/validations/auth";
import { useToast } from "@/hooks/use-toast";

interface UserProfileProps {
  showSettings?: boolean;
}

export function UserProfile({ showSettings = true }: UserProfileProps) {
  const { data: session, update } = useSession();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: session?.user?.firstName || "",
      lastName: session?.user?.lastName || "",
      company: session?.user?.company || "",
      title: session?.user?.title || "",
      phone: session?.user?.phone || "",
      theme: session?.user?.theme || "light",
      language: session?.user?.language || "en",
    },
  });

  const onSubmit = async (data: UpdateProfileInput) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        await update(updatedUser);
        setIsEditing(false);
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        });
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/signin" });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800";
      case "MANAGER":
        return "bg-blue-100 text-blue-800";
      case "WORKER":
        return "bg-green-100 text-green-800";
      case "CLIENT":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (!session?.user) {
    return (
      <Alert>
        <AlertDescription>Please sign in to view your profile.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={session.user.image || ""} />
              <AvatarFallback className="bg-construction-yellow-400 text-construction-black-900 text-lg">
                {getInitials(session.user.name || session.user.email || "U")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-bold text-construction-black-900">
                  {session.user.firstName && session.user.lastName
                    ? `${session.user.firstName} ${session.user.lastName}`
                    : session.user.name || "User"}
                </h2>
                <Badge className={getRoleColor(session.user.role || "WORKER")}>
                  {session.user.role || "WORKER"}
                </Badge>
              </div>
              <p className="text-construction-black-600">{session.user.email}</p>
              {session.user.title && (
                <p className="text-sm text-construction-black-500">{session.user.title}</p>
              )}
            </div>
            <div className="flex space-x-2">
              {showSettings && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  {isEditing ? "Cancel" : "Edit"}
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Profile Details */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            {isEditing ? "Update your profile information" : "Your profile details"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    {...register("firstName")}
                    className={errors.firstName ? "border-red-500" : ""}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500">{errors.firstName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    {...register("lastName")}
                    className={errors.lastName ? "border-red-500" : ""}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" {...register("company")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Job Title</Label>
                  <Input id="title" {...register("title")} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" {...register("phone")} />
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select onValueChange={(value) => setValue("theme", value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select onValueChange={(value) => setValue("language", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  type="submit"
                  className="bg-construction-yellow-400 hover:bg-construction-yellow-500 text-construction-black-900"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    reset();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-construction-black-500" />
                    <div>
                      <p className="text-sm font-medium text-construction-black-700">Full Name</p>
                      <p className="text-construction-black-900">
                        {session.user.firstName && session.user.lastName
                          ? `${session.user.firstName} ${session.user.lastName}`
                          : session.user.name || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-construction-black-500" />
                    <div>
                      <p className="text-sm font-medium text-construction-black-700">Email</p>
                      <p className="text-construction-black-900">{session.user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-construction-black-500" />
                    <div>
                      <p className="text-sm font-medium text-construction-black-700">Phone</p>
                      <p className="text-construction-black-900">
                        {session.user.phone || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Building className="h-5 w-5 text-construction-black-500" />
                    <div>
                      <p className="text-sm font-medium text-construction-black-700">Company</p>
                      <p className="text-construction-black-900">
                        {session.user.company || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Briefcase className="h-5 w-5 text-construction-black-500" />
                    <div>
                      <p className="text-sm font-medium text-construction-black-700">Job Title</p>
                      <p className="text-construction-black-900">
                        {session.user.title || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}