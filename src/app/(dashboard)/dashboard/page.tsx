"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, ChartPieIcon, FileText, TrendingUp, Users } from "lucide-react";
import { ShadcnLineChart2 } from "@/components/charts";
import { NewsItem, newsApi } from "@/lib/api/news";
import { formatDistanceToNow, format, subMonths } from "date-fns";
import "@/app/charts.css";

export default function DashboardPage() {
  const [isAdmin, setIsAdmin] = useState(true);
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryStats, setCategoryStats] = useState<{name: string, count: number}[]>([]);
  const [statusStats, setStatusStats] = useState<{name: string, count: number}[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<{month: string, count: number}[]>([]);
  const [totalNews, setTotalNews] = useState(0);
  const [recentNews, setRecentNews] = useState<NewsItem[]>([]);
  const [credibilityAvg, setCredibilityAvg] = useState(0);
  const [monthlyTotal, setMonthlyTotal] = useState(0);

  // Get user role
  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    if (storedRole === "employee") {
      setIsAdmin(false);
    }
  }, []);

  // Fetch news data
  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      try {
        // Fetch with a large limit to get most news items for stats
        const response = await newsApi.getNews(1, 100);
        
        if (response.success && response.data) {
          const news = response.data.news;
          setNewsData(news);
          setTotalNews(response.data.pagination.total);
          
          // Calculate category statistics
          const categories: Record<string, number> = {};
          news.forEach(item => {
            if (categories[item.category]) {
              categories[item.category]++;
            } else {
              categories[item.category] = 1;
            }
          });
          
          const categoryData = Object.entries(categories).map(([name, count]) => ({
            name,
            count
          })).sort((a, b) => b.count - a.count);
          setCategoryStats(categoryData);
          
          // Calculate status statistics
          const statuses: Record<string, number> = {};
          news.forEach(item => {
            if (statuses[item.status]) {
              statuses[item.status]++;
            } else {
              statuses[item.status] = 1;
            }
          });
          
          const statusData = Object.entries(statuses).map(([name, count]) => ({
            name,
            count
          }));
          setStatusStats(statusData);
          
          // Get recent news (last 7 days)
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          
          const recentItems = news
            .filter(item => new Date(item.publishedAt) >= oneWeekAgo)
            .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
          
          setRecentNews(recentItems.slice(0, 5));
          
          // Create monthly statistics for the last 6 months
          const monthlyCounts: Record<string, number> = {};
          const today = new Date();
          let totalLast6Months = 0;
          
          // Initialize last 6 months with 0
          for (let i = 0; i < 6; i++) {
            const monthDate = subMonths(today, i);
            const monthKey = format(monthDate, 'MMM');
            monthlyCounts[monthKey] = 0;
          }
          
          // Count news items by month
          news.forEach(item => {
            const itemDate = new Date(item.publishedAt);
            const monthsSinceToday = (today.getFullYear() - itemDate.getFullYear()) * 12 + 
                                     today.getMonth() - itemDate.getMonth();
            
            // Only count last 6 months
            if (monthsSinceToday >= 0 && monthsSinceToday < 6) {
              const monthKey = format(itemDate, 'MMM');
              monthlyCounts[monthKey]++;
              totalLast6Months++;
            }
          });
          
          // Convert to array and reverse to show oldest to newest
          const monthlyData = Object.entries(monthlyCounts).map(([month, count]) => ({
            month,
            count
          }));
          
          // Sort by month chronologically (oldest first)
          const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const sortedMonthlyData = [...monthlyData].sort((a, b) => {
            return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
          });
          
          // Get last 6 months in chronological order
          const currentMonthIndex = today.getMonth();
          const last6MonthsOrdered = [];
          
          for (let i = 5; i >= 0; i--) {
            const monthIndex = (currentMonthIndex - i + 12) % 12;
            const monthName = monthOrder[monthIndex];
            last6MonthsOrdered.push({
              month: monthName,
              count: monthlyCounts[monthName] || 0
            });
          }
          
          setMonthlyStats(last6MonthsOrdered);
          setMonthlyTotal(totalLast6Months);
          
          // Calculate average credibility score
          const totalCredibility = news.reduce((sum, item) => sum + item.credibilityScore, 0);
          const avgCredibility = (totalCredibility / news.length) * 100;
          setCredibilityAvg(Math.round(avgCredibility * 10) / 10); // Round to 1 decimal place
        }
      } catch (error) {
        console.error("Error fetching news data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNews();
  }, []);

  const newsLastWeekCount = recentNews.length;
  
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
            <div className="text-2xl font-bold">{totalNews}</div>
            <p className="text-xs text-muted-foreground">
              {newsLastWeekCount} in the last 7 days
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card hover:shadow-sm transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Credibility</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{credibilityAvg}%</div>
            <p className="text-xs text-muted-foreground">
              Across all news articles
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card hover:shadow-sm transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">News Categories</CardTitle>
            <ChartPieIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categoryStats.length}</div>
            <p className="text-xs text-muted-foreground">
              Most popular: {categoryStats[0]?.name || "N/A"}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card hover:shadow-sm transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published Content</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statusStats.find(s => s.name === "published")?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {statusStats.find(s => s.name === "draft")?.count || 0} drafts pending
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Overview content with real data */}
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
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading recent news...</p>
              ) : recentNews.length > 0 ? (
                recentNews.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-3 rounded-md bg-muted/30 border border-border/50">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.category} • {formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No recent news found</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <ShadcnLineChart2
          data={monthlyStats}
          dataKey="count"
          xAxisKey="month"
          title="Monthly News Activity"
          description="News published per month (last 6 months)"
          footerTrend={`${monthlyTotal} articles in the last 6 months`}
          footerDescription="Showing monthly publishing trends"
          trendIcon={<TrendingUp className="h-4 w-4" />}
          height={250}
          color="var(--chart-1)"
          valueLabel="Articles"
        />
      </div>
    </div>
  );
} 