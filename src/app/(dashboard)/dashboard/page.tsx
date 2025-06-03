"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, FileText, TrendingUp, Users } from "lucide-react";
import { ShadcnLineChart2 } from "@/components/charts";

// Sample data for charts
const userEngagementData = [
  { month: 'Jan', users: 400, posts: 240, interactions: 180 },
  { month: 'Feb', users: 300, posts: 198, interactions: 210 },
  { month: 'Mar', users: 500, posts: 280, interactions: 250 },
  { month: 'Apr', users: 450, posts: 308, interactions: 290 },
  { month: 'May', users: 600, posts: 380, interactions: 320 },
  { month: 'Jun', users: 700, posts: 420, interactions: 380 },
  { month: 'Jul', users: 650, posts: 390, interactions: 370 },
];

const contentTypeData = [
  { name: 'News', value: 35 },
  { name: 'Tutorials', value: 25 },
  { name: 'Discussions', value: 20 },
  { name: 'Updates', value: 15 },
  { name: 'Other', value: 5 },
];

const weeklyActivityData = [
  { day: 'Mon', activity: 120 },
  { day: 'Tue', activity: 150 },
  { day: 'Wed', activity: 180 },
  { day: 'Thu', activity: 170 },
  { day: 'Fri', activity: 190 },
  { day: 'Sat', activity: 95 },
  { day: 'Sun', activity: 75 },
];

export default function DashboardPage() {
  const [isAdmin, setIsAdmin] = useState(true);

  // Simulate checking user role
  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    if (storedRole === "employee") {
      setIsAdmin(false);
    }
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">
        Welcome to your {isAdmin ? "admin" : "employee"} dashboard.
      </p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card hover:shadow-sm transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total News Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">124</div>
            <p className="text-xs text-muted-foreground">
              +5 in the last 7 days
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card hover:shadow-sm transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.3%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card hover:shadow-sm transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,429</div>
            <p className="text-xs text-muted-foreground">
              +201 since last week
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card hover:shadow-sm transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Interactions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">573</div>
            <p className="text-xs text-muted-foreground">
              +18% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Overview content only, no tabs */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card hover:shadow-sm transition-shadow">
          <CardHeader>
            <CardTitle>Recent News Posts</CardTitle>
            <CardDescription>
              Latest news posts published in the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-md bg-muted/30 border border-border/50">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <div>
                    <p className="text-sm font-medium">Example News Post {i}</p>
                    <p className="text-xs text-muted-foreground">
                      Posted {i} day{i !== 1 ? "s" : ""} ago
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <ShadcnLineChart2
          data={weeklyActivityData}
          dataKey="activity"
          xAxisKey="day"
          title="User Engagement"
          description="January - June 2024"
          footerTrend="Trending up by 5.2% this month"
          footerDescription="Showing total visitors for the last 7 days"
          trendIcon={<TrendingUp className="h-4 w-4" />}
          height={250}
          color="var(--chart-1)"
          valueLabel="Users"
        />
      </div>
    </div>
  );
} 