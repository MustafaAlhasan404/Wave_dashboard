"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Bell,
  FileText,
  Home,
  LogOut,
  Settings,
  Users,
  Flag,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api/client";

interface SidebarProps {
  isAdmin: boolean;
}

export function Sidebar({ isAdmin }: SidebarProps) {
  const pathname = usePathname();

  const routes = [
    {
      label: "Dashboard",
      icon: Home,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "News Posts",
      icon: FileText,
      href: "/dashboard/news",
      active: pathname === "/dashboard/news" || pathname.startsWith("/dashboard/news/"),
    },
    {
      label: "Reports",
      icon: Flag,
      href: "/dashboard/reports",
      active: pathname === "/dashboard/reports" || pathname.startsWith("/dashboard/reports/"),
    },
    {
      label: "Add Employee",
      icon: UserPlus,
      href: "/dashboard/employees/add",
      active: pathname === "/dashboard/employees/add",
      adminOnly: true,
    },
    {
      label: "Notifications",
      icon: Bell,
      href: "/dashboard/notifications",
      active: pathname === "/dashboard/notifications",
      adminOnly: true,
    },
  ];

  const handleLogout = async () => {
    try {
      console.log("Sidebar logout clicked");
      
      // Use the authApi logout function
      await authApi.logout();
      
      toast.success("Logged out successfully");
      
      // Hard redirect to login page
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out");
      
      // Still try to redirect
      window.location.href = "/login";
    }
  };

  return (
    <div className="h-full flex flex-col bg-sidebar border-r border-sidebar-border">
      <div className="p-6 border-b border-sidebar-border">
        <h2 className="text-2xl font-bold text-sidebar-foreground">Wave</h2>
        <p className="text-xs text-sidebar-foreground/70 mt-1">
          {isAdmin ? "Admin Dashboard" : "Employee Dashboard"}
        </p>
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="flex flex-col p-4 space-y-1">
          {routes.map((route) => {
            // Skip admin-only routes for non-admin users
            if (route.adminOnly && !isAdmin) {
              return null;
            }

            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  route.active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <route.icon className="h-4 w-4" />
                {route.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t border-sidebar-border">
        <Button 
          variant="destructive" 
          className="w-full justify-start" 
          size="sm"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
} 