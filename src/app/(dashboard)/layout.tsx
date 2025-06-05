"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { toast } from "sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Check user role from stored user data
  useEffect(() => {
    try {
      setIsLoading(true);
      // Try to get the user data from localStorage
      const userData = localStorage.getItem("user");
      
      if (userData) {
        const user = JSON.parse(userData);
        
        // Check if user has valid roles for dashboard (ADMIN or EMPLOYEE only)
        if (user.roles && Array.isArray(user.roles)) {
          const validRoles = ['ADMIN', 'EMPLOYEE'];
          const hasValidRole = user.roles.some((role: string) => validRoles.includes(role));
          
          if (!hasValidRole) {
            // Quietly redirect without console error
            toast.error("Access denied. Only admin and employee roles are allowed.");
            router.push("/login");
            return;
          }
          
          // Check if user has ADMIN role
          const hasAdminRole = user.roles.includes('ADMIN');
          setIsAdmin(hasAdminRole);
        }
      } else {
        // Fallback to the stored role if user data is not available
        const storedRole = localStorage.getItem("userRole");
        if (storedRole === "employee") {
          setIsAdmin(false);
        }
      }
    } catch (error) {
      console.error("Error checking user role:", error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Don't render the dashboard until we've checked authentication
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-background">
      <div className="hidden md:flex md:w-60 md:flex-col md:border-r md:border-border">
        <Sidebar isAdmin={isAdmin} />
      </div>
      <div className="flex flex-1 flex-col">
        <Header isAdmin={isAdmin} />
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
} 