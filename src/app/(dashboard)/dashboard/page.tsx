"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, ChartPieIcon, FileText, TrendingUp, Users, RefreshCcw } from "lucide-react";
import { ShadcnLineChart2 } from "@/components/charts";
import { NewsItem, newsApi } from "@/lib/api/news";
import { formatDistanceToNow, format, subMonths } from "date-fns";
import { toast } from "sonner";
import "@/app/charts.css";

// Data cache to prevent inconsistent data
const CACHE_KEY = "dashboard_news_data";
const CACHE_EXPIRY = 60 * 60 * 1000; // 1 hour in milliseconds

interface CachedData {
  timestamp: number;
  data: {
    newsData: NewsItem[];
    totalNews: number;
    categoryStats: {name: string, count: number}[];
    statusStats: {name: string, count: number}[];
    monthlyStats: {month: string, count: number}[];
    recentNews: NewsItem[];
    credibilityAvg: number;
    monthlyTotal: number;
  };
}

export default function DashboardPage() {
  const [isAdmin, setIsAdmin] = useState(true);
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
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

  // Function to load data from cache
  const loadFromCache = (): CachedData | null => {
    if (typeof window === 'undefined') return null;
    
    const cachedDataString = localStorage.getItem(CACHE_KEY);
    if (!cachedDataString) return null;
    
    try {
      const cachedData: CachedData = JSON.parse(cachedDataString);
      const now = Date.now();
      
      // Check if cache is still valid (not expired)
      if (now - cachedData.timestamp < CACHE_EXPIRY) {
        return cachedData;
      }
    } catch (error) {
      console.error("Error parsing cached data:", error);
    }
    
    return null;
  };

  // Function to save data to cache
  const saveToCache = (data: CachedData['data']) => {
    if (typeof window === 'undefined') return;
    
    const cachedData: CachedData = {
      timestamp: Date.now(),
      data
    };
    
    localStorage.setItem(CACHE_KEY, JSON.stringify(cachedData));
  };

  // Function to fetch news data
  const fetchNews = async (bypassCache = false) => {
    if (bypassCache) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    
    // Try to load from cache first
    const cachedData = !bypassCache ? loadFromCache() : null;
    if (cachedData) {
      console.log("Using cached dashboard data");
      setNewsData(cachedData.data.newsData);
      setTotalNews(cachedData.data.totalNews);
      setCategoryStats(cachedData.data.categoryStats);
      setStatusStats(cachedData.data.statusStats);
      setRecentNews(cachedData.data.recentNews);
      setMonthlyStats(cachedData.data.monthlyStats);
      setCredibilityAvg(cachedData.data.credibilityAvg);
      setMonthlyTotal(cachedData.data.monthlyTotal);
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }
    
    try {
      console.log("Fetching fresh news data for dashboard from API");
      // Fetch with a large limit to get most news items for stats
      const response = await newsApi.getNews(1, 100);
      
      if (response.success && response.data) {
        console.log(`Received ${response.data.news.length} news items for dashboard`);
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
        
        // Get last 6 months in chronological order
        const currentMonthIndex = today.getMonth();
        const last6MonthsOrdered = [];
        
        for (let i = 5; i >= 0; i--) {
          const monthIndex = (currentMonthIndex - i + 12) % 12;
          const monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][monthIndex];
          last6MonthsOrdered.push({
            month: monthName,
            count: monthlyCounts[monthName] || 0
          });
        }
        
        setMonthlyStats(last6MonthsOrdered);
        setMonthlyTotal(totalLast6Months);
        
        // Calculate average credibility score
        const totalCredibility = news.reduce((sum, item) => sum + item.credibilityScore, 0);
        const avgCredibility = news.length > 0 ? (totalCredibility / news.length) * 100 : 0;
        const roundedCredibility = Math.round(avgCredibility * 10) / 10; // Round to 1 decimal place
        setCredibilityAvg(roundedCredibility);
        
        // Save all processed data to cache
        saveToCache({
          newsData: news,
          totalNews: response.data.pagination.total,
          categoryStats: categoryData,
          statusStats: statusData,
          monthlyStats: last6MonthsOrdered,
          recentNews: recentItems.slice(0, 5),
          credibilityAvg: roundedCredibility,
          monthlyTotal: totalLast6Months
        });
      } else {
        console.error("API response was not successful:", response.message);
        // Display error toast or fallback UI
        toast.error("Failed to load dashboard data");
      }
    } catch (error) {
      console.error("Error fetching news data:", error);
      // Display error toast
      toast.error("Failed to load dashboard data. Please refresh the page.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  
  // Call fetchNews when component mounts
  useEffect(() => {
    fetchNews();
  }, []);

  const handleRefresh = () => {
    // Force refresh by bypassing cache
    fetchNews(true);
    toast.success("Refreshing dashboard data...");
  };

  const newsLastWeekCount = recentNews.length;
  
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-row items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your {isAdmin ? "admin" : "employee"} dashboard.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none"
        >
          <RefreshCcw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card hover:shadow-sm transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total News Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse h-8 w-16 bg-muted rounded"></div>
            ) : (
              <>
                <div className="text-2xl font-bold">{totalNews}</div>
                <p className="text-xs text-muted-foreground">
                  {newsLastWeekCount} in the last 7 days
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="bg-card hover:shadow-sm transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Credibility</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse h-8 w-16 bg-muted rounded"></div>
            ) : (
              <>
                <div className="text-2xl font-bold">{credibilityAvg}%</div>
                <p className="text-xs text-muted-foreground">
                  Across all news articles
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="bg-card hover:shadow-sm transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">News Categories</CardTitle>
            <ChartPieIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse h-8 w-16 bg-muted rounded"></div>
            ) : (
              <>
                <div className="text-2xl font-bold">{categoryStats.length}</div>
                <p className="text-xs text-muted-foreground">
                  Most popular: {categoryStats[0]?.name || "N/A"}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="bg-card hover:shadow-sm transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published Content</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse h-8 w-16 bg-muted rounded"></div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {statusStats.find(s => s.name === "published")?.count || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {statusStats.find(s => s.name === "draft")?.count || 0} drafts pending
                </p>
              </>
            )}
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
                <div className="space-y-2">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 rounded-md bg-muted/30 border border-border/50">
                      <div className="animate-pulse w-2 h-2 rounded-full bg-muted-foreground" />
                      <div className="w-full">
                        <div className="animate-pulse h-4 w-3/4 bg-muted rounded mb-2"></div>
                        <div className="animate-pulse h-3 w-1/2 bg-muted rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
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
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground">No recent news found</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="mt-2 text-xs text-primary hover:underline"
                  >
                    Refresh data
                  </button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {isLoading ? (
          <Card className="bg-card hover:shadow-sm transition-shadow">
            <CardHeader>
              <CardTitle>Monthly News Activity</CardTitle>
              <CardDescription>
                News published per month (last 6 months)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] flex items-center justify-center">
                <div className="animate-pulse h-[200px] w-full bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ) : (
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
        )}
      </div>
    </div>
  );
} 