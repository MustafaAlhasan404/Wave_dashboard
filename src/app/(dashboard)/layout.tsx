"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(true);

  // Simulate checking user role
  useEffect(() => {
    // In a real app, you would check the user's role from a cookie, local storage, or API
    const storedRole = localStorage.getItem("userRole");
    if (storedRole === "employee") {
      setIsAdmin(false);
    }
  }, []);

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