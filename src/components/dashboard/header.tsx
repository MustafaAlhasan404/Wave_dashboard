"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Menu, Moon, Sun } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Sidebar } from "@/components/dashboard/sidebar";
import { toast } from "sonner";

interface HeaderProps {
  isAdmin: boolean;
}

export function Header({ isAdmin }: HeaderProps) {
  const router = useRouter();
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark");
  };
  
  // This is a comprehensive logout function that doesn't depend on auth context
  const handleLogout = () => {
    console.log("Logout clicked");
    
    try {
      // 1. Clear localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      
      // 2. Clear cookies with various path options to ensure they're removed
      document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/dashboard;";
      document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/dashboard;";
      
      console.log("Tokens cleared, redirecting to login page");
      
      // 3. Show success toast
      toast.success("Logged out successfully");
      
      // 4. Hard redirect instead of using router
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out");
    }
  };

  return (
    <header className="flex h-14 items-center px-4 border-b border-border bg-background">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden border-border">
            <Menu className="h-4 w-4" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <Sidebar isAdmin={isAdmin} />
        </SheetContent>
      </Sheet>

      <div className="ml-auto flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleTheme}
          className="text-muted-foreground hover:text-foreground"
        >
          {theme === "light" ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>

        {isAdmin && (
          <Button 
            variant="ghost" 
            size="icon"
            className="text-muted-foreground hover:text-foreground relative"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
            <span className="sr-only">Notifications</span>
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="relative h-8 w-8 rounded-full border border-border"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={isAdmin ? "/admin-avatar.png" : "/employee-avatar.png"}
                  alt="User avatar"
                />
                <AvatarFallback className="text-xs">
                  {isAdmin ? "AD" : "EM"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {isAdmin ? "Admin User" : "Employee User"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {isAdmin ? "admin@example.com" : "employee@example.com"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive cursor-pointer"
              onClick={() => {
                console.log("Logout menu item clicked");
                // Use setTimeout to ensure the dropdown has time to close
                setTimeout(handleLogout, 0);
              }}
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}