"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function LogoutButton({ 
  variant = "destructive", 
  size = "default",
  className = ""
}: LogoutButtonProps) {
  const handleLogout = () => {
    console.log("LogoutButton - Logout clicked");
    
    try {
      console.log("Clearing all authentication data");
      
      // Clear localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      
      // Clear cookies with various path options to ensure they're removed
      document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/dashboard;";
      document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/dashboard;";
      
      console.log("Authentication data cleared");
      
      toast.success("Logged out successfully");
      
      // Redirect to login
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out");
      
      // Still try to redirect
      window.location.href = "/login";
    }
  };
  
  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      className={className}
    >
      <LogOut className="mr-2 h-4 w-4" />
      Logout
    </Button>
  );
}