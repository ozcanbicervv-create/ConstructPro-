"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2, HardHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (session) {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-construction-yellow-50 to-construction-black-50">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-construction-yellow-500" />
          <span className="text-construction-black-600">Loading...</span>
        </div>
      </div>
    );
  }

  if (session) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-construction-yellow-50 to-construction-black-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="flex items-center justify-center mb-8">
            <div className="bg-construction-yellow-400 p-4 rounded-full">
              <HardHat className="h-12 w-12 text-construction-black-900" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-construction-black-900 mb-6">
            ConstructPro
          </h1>
          
          <p className="text-xl text-construction-black-600 mb-8 max-w-2xl mx-auto">
            Modern construction project management and collaboration platform. 
            Streamline your projects, manage your team, and build better together.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              asChild
              className="bg-construction-yellow-400 hover:bg-construction-yellow-500 text-construction-black-900 px-8 py-3 text-lg"
            >
              <Link href="/auth/signin">
                Sign In
              </Link>
            </Button>
            
            <Button 
              asChild
              variant="outline"
              className="border-construction-yellow-400 text-construction-yellow-600 hover:bg-construction-yellow-50 px-8 py-3 text-lg"
            >
              <Link href="/auth/signup">
                Get Started
              </Link>
            </Button>
          </div>
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-construction-yellow-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <HardHat className="h-8 w-8 text-construction-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-construction-black-900 mb-2">
                Project Management
              </h3>
              <p className="text-construction-black-600">
                Track progress, manage timelines, and coordinate resources efficiently.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-construction-yellow-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <HardHat className="h-8 w-8 text-construction-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-construction-black-900 mb-2">
                Team Collaboration
              </h3>
              <p className="text-construction-black-600">
                Real-time communication and collaboration tools for your entire team.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-construction-yellow-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <HardHat className="h-8 w-8 text-construction-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-construction-black-900 mb-2">
                AR Integration
              </h3>
              <p className="text-construction-black-600">
                Visualize projects with cutting-edge augmented reality technology.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}