"use client";

import { useEffect } from "react";

export default function LogoutPage() {
  useEffect(() => {
    // This is a direct logout implementation that doesn't rely on context
    const performLogout = () => {
      try {
        console.log("Logout page - clearing auth data");
        
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
        
        console.log("Auth data cleared, redirecting to login");
        
        // Hard redirect to login page
        window.location.href = "/login";
      } catch (error) {
        console.error("Error during logout:", error);
        // Still redirect even if there's an error
        window.location.href = "/login";
      }
    };

    // Execute logout immediately
    performLogout();
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Logging out...</h1>
        <p className="text-muted-foreground">Please wait while we log you out.</p>
      </div>
    </div>
  );
}