"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { authApi, isAuthenticated } from "@/lib/api/client";

// Define user type based on the API response
interface User {
  id: string;
  email: string;
  image: string | null;
  username: string;
  roles: string[];
  status: string;
}

// Define auth context state
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Create the auth provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check if user is authenticated on initial load
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      
      try {
        // If we have a token in local storage, try to get user info
        if (isAuthenticated()) {
          // Get user from localStorage
          const storedUser = localStorage.getItem("user");
          
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          } else {
            // If we have a token but no user, try to refresh the token
            // Force refresh since we need the user data
            const refreshSuccess = await authApi.refreshToken(true);
            
            if (!refreshSuccess) {
              // If refresh fails, log out
              console.log("Token refresh failed during auth check, logging out");
              authApi.logout();
              setUser(null);
            } else {
              // If refresh succeeds, get user from localStorage (should be set by refresh)
              const refreshedUser = localStorage.getItem("user");
              if (refreshedUser) {
                setUser(JSON.parse(refreshedUser));
              }
            }
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
        // Clear on error
        authApi.logout();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await authApi.login(email, password);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        
        // Store user in localStorage for persistence
        localStorage.setItem("user", JSON.stringify(response.data.user));
        
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    console.log("Logging out user...");
    
    // Call the API logout function
    authApi.logout();
    
    // Clear local state
    setUser(null);
    
    // Clear any stored user data
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    
    // Note: Navigation happens in the component that calls this function
    // This allows for more flexible redirect logic
  };

  // Create the context value object
  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for using the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
}