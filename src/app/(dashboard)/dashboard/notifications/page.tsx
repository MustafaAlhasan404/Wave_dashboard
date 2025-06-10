"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { AlertCircle, Bell, Calendar, Send, Users } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { notificationsApi, NotificationPayload } from "@/lib/api/notifications";
import { LoadingDots } from "@/components/ui/loading-dots";
import { Pagination } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [notificationHistory, setNotificationHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;
  
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    target: "news", // Default to "news" (all users)
    scheduleLater: false,
    scheduleDate: "",
  });

  // Simulate checking user role
  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    if (storedRole === "employee") {
      setIsAdmin(false);
      // Redirect non-admin users
      router.push("/dashboard");
      toast.error("You don't have permission to access this page");
    }
  }, [router]);

  const fetchNotificationHistory = () => {
    setIsLoadingHistory(true);
    notificationsApi.getNotificationHistory().then((res) => {
      if (res && res.success !== false && Array.isArray(res.data)) {
        setNotificationHistory(res.data);
        // Reset to first page when refreshing data
        setCurrentPage(1);
      }
      setIsLoadingHistory(false);
    });
  };

  useEffect(() => {
    // Fetch notification history
    fetchNotificationHistory();
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleScheduleChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      scheduleLater: checked,
    }));
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    
    try {
      // Import notification API
      // We don't need to force a token refresh here - the API client will handle it if needed
      
      // Create notification payload with required fields
      const payload: NotificationPayload = {
        title: formData.title,
        body: formData.message,
        topic: formData.target, // This should already be "news" or "premium"
      };
      
      // Add scheduled time if enabled
      if (formData.scheduleLater && formData.scheduleDate) {
        const scheduledDate = new Date(formData.scheduleDate);
        payload.scheduledTime = scheduledDate.toISOString();
      }
      
      console.log("Sending notification with fresh token:", payload);
      
      // Send notification via API
      const response = await notificationsApi.sendNotification(payload);
      
      if (response.success) {
        toast.success("Notification sent successfully");
        
        // Reset form
        setFormData({
          title: "",
          message: "",
          target: "news", // Reset to default "news"
          scheduleLater: false,
          scheduleDate: "",
        });
        fetchNotificationHistory(); // Refetch history after send
      } else {
        if (response.status === 403 || response.status === 401) {
          toast.error(`Authentication error: ${response.message}. Please try logging in again.`);
          // Redirect to login after a short delay
          setTimeout(() => router.push('/login'), 2000);
        } else {
          toast.error(`Failed to send notification: ${response.message}`);
        }
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error("An error occurred while sending the notification");
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  // If not admin, don't render the page content
  if (!isAdmin) {
    return null;
  }

  const getTargetLabel = (target: string) => {
    // Return the topic name with first letter capitalized
    return target.charAt(0).toUpperCase() + target.slice(1);
  };

  // Sort notifications by createdAt based on sortOrder
  const sortedNotificationHistory = [...notificationHistory].sort((a, b) => {
    const diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return sortOrder === 'desc' ? diff : -diff;
  });
  
  // Calculate pagination data
  const totalPages = Math.max(1, Math.ceil(sortedNotificationHistory.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentNotifications = sortedNotificationHistory.slice(startIndex, endIndex);
  
  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex flex-col gap-10 md:gap-12 relative max-w-6xl mx-auto px-2 md:px-8 py-6">
      {/* Header Card */}
      <Card className="bg-muted/40 border-none shadow-none p-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-6 md:px-10 py-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-1 flex items-center gap-3">
              <Bell className="h-8 w-8 text-primary" />
              Notifications
            </h1>
            <p className="text-muted-foreground text-base md:text-lg">Send announcements to your users.</p>
          </div>
        </div>
        <div className="border-b border-border/40 w-full" />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 md:gap-12 items-start">
        {/* Form Section */}
        <Card className="border-border/60 shadow-sm px-0 md:px-2">
          <CardHeader className="px-6 pb-2 pt-6">
            <CardTitle className="text-xl md:text-2xl">Create Notification</CardTitle>
            <CardDescription>Fill out the form to send a notification.</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-8 pt-2">
            <form onSubmit={handleSendNotification} className="space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-base font-medium">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Enter a concise, attention-grabbing title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="h-11 text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-base font-medium">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Enter your notification message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="resize-none h-28 text-base"
                  />
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="target" className="flex items-center gap-2 text-base font-medium">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      Target Audience
                    </Label>
                    <Select
                      value={formData.target}
                      onValueChange={(value) => handleSelectChange("target", value)}
                    >
                      <SelectTrigger id="target" className="h-11 text-base">
                        <SelectValue placeholder="Select audience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="news">All Users (News)</SelectItem>
                        <SelectItem value="premium">Premium Users</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-base font-medium">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      Schedule
                    </Label>
                    <div className="flex items-center gap-3 h-11">
                      <Switch
                        id="schedule"
                        checked={formData.scheduleLater}
                        onCheckedChange={handleScheduleChange}
                      />
                      <Label htmlFor="schedule" className="font-normal">
                        {formData.scheduleLater ? "Scheduled" : "Send immediately"}
                      </Label>
                    </div>
                    {formData.scheduleLater && (
                      <Input
                        id="scheduleDate"
                        name="scheduleDate"
                        type="datetime-local"
                        value={formData.scheduleDate}
                        onChange={handleChange}
                        required={formData.scheduleLater}
                        className="mt-2 h-11 text-base"
                      />
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-muted-foreground">
                  <AlertCircle className="h-3 w-3 inline mr-1" />
                  Notifications cannot be recalled once sent
                </div>
                <Button 
                  type="submit" 
                  disabled={isSending}
                  className="gap-1.5 px-6 py-2 rounded-lg text-base font-medium shadow bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isSending ? (
                    <>
                      <LoadingDots size={4} color="currentColor" className="mr-1" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      <span>Send Notification</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        {/* Live Preview Section */}
        <div>
          <Card className="border-primary/30 shadow-md animate-in fade-in zoom-in-95 duration-300 px-0 md:px-2">
            <CardHeader className="px-6 pt-6 pb-2">
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <Bell className="h-5 w-5 text-primary" />
                Preview
              </CardTitle>
              <CardDescription>How your notification will appear</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <Alert className="bg-muted/20 border border-border/40">
                <Bell className="h-4 w-4" />
                <AlertTitle>{formData.title || "Notification Title"}</AlertTitle>
                <AlertDescription>
                  {formData.message || "Your notification message will appear here."}
                </AlertDescription>
              </Alert>
              <div className="flex items-center gap-3 mt-4">
                <Badge variant="outline" className="text-xs bg-muted/30">
                  {getTargetLabel(formData.target)}
                </Badge>
                {formData.scheduleLater && formData.scheduleDate && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(formData.scheduleDate)}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Notification History */}
      <div className="mt-12">
        <div className="border-t border-border/40 mb-8" />
        <Card className="overflow-hidden border-border/50 shadow-md">
          <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sticky top-0 z-10 bg-background/90 backdrop-blur-sm border-b border-border/40 py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg md:text-xl">Notification History</CardTitle>
                <CardDescription>Previously sent notifications</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-2 md:mt-0">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchNotificationHistory} 
                disabled={isLoadingHistory}
                className="h-9 px-3 text-sm font-medium"
              >
                {isLoadingHistory ? (
                  <>
                    <LoadingDots size={4} color="currentColor" className="mr-2" />
                    <span>Refreshing</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4">
                      <path d="M21 12a9 9 0 0 0-9-9 9 9 0 0 0-9 9 9 9 0 0 0 9 9 9 9 0 0 0 7.5-4" />
                      <polyline points="16 3 21 8 16 13" />
                    </svg>
                    <span>Refresh</span>
                  </>
                )}
              </Button>
              <Select value={sortOrder} onValueChange={v => setSortOrder(v as 'desc' | 'asc')}>
                <SelectTrigger className="w-40 h-9 text-sm">
                  <SelectValue>
                    {sortOrder === 'desc' ? (
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4">
                          <path d="m3 16 4 4 4-4" />
                          <path d="M7 20V4" />
                          <path d="M11 4h10" />
                          <path d="M11 8h7" />
                          <path d="M11 12h4" />
                        </svg>
                        <span>Newest First</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4">
                          <path d="m3 8 4-4 4 4" />
                          <path d="M7 4v16" />
                          <path d="M11 12h4" />
                          <path d="M11 16h7" />
                          <path d="M11 20h10" />
                        </svg>
                        <span>Oldest First</span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4">
                        <path d="m3 16 4 4 4-4" />
                        <path d="M7 20V4" />
                        <path d="M11 4h10" />
                        <path d="M11 8h7" />
                        <path d="M11 12h4" />
                      </svg>
                      <span>Newest First</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="asc">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4">
                        <path d="m3 8 4-4 4 4" />
                        <path d="M7 4v16" />
                        <path d="M11 12h4" />
                        <path d="M11 16h7" />
                        <path d="M11 20h10" />
                      </svg>
                      <span>Oldest First</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="pt-0 pb-6 px-0 md:px-0">
            {isLoadingHistory ? (
              <div className="py-16 text-center text-muted-foreground flex flex-col items-center gap-2">
                <LoadingDots size={6} color="currentColor" />
                <span className="text-sm mt-2">Loading notification history...</span>
              </div>
            ) : sortedNotificationHistory.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Bell className="h-8 w-8 text-muted-foreground/60" />
                </div>
                <p className="text-base font-medium">No notifications found</p>
                <p className="text-sm text-muted-foreground mt-1">Notifications you send will appear here</p>
              </div>
            ) : (
              <div className="space-y-0">
                {/* Column headers */}
                <div className="grid grid-cols-[1fr_2fr_1fr_1fr] px-6 py-3 bg-muted/40 border-b border-border/60">
                  <div className="text-sm font-medium text-muted-foreground">Title</div>
                  <div className="text-sm font-medium text-muted-foreground">Message</div>
                  <div className="text-sm font-medium text-muted-foreground">Topic</div>
                  <div className="text-sm font-medium text-muted-foreground">Date</div>
                </div>

                {/* Notification rows */}
                <div className="flex flex-col">
                  {currentNotifications.map((n, index) => (
                    <div 
                      key={n.id} 
                      className={cn(
                        "group py-4 px-6 transition-colors hover:bg-muted/30 grid grid-cols-[1fr_2fr_1fr_1fr] gap-4 items-start border-b border-border/40",
                        index % 2 === 0 ? "bg-background" : "bg-muted/10"
                      )}
                    >
                      <h3 className="font-medium text-base group-hover:text-primary transition-colors line-clamp-1">
                        {n.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 group-hover:text-foreground/90 transition-colors">
                        {n.body}
                      </p>
                      <div>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs font-medium px-2.5 py-1 rounded-md",
                            n.topic === "premium" 
                              ? "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800/30" 
                              : "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800/30"
                          )}
                        >
                          {getTargetLabel(n.topic)}
                        </Badge>
                      </div>
                      <div className="shrink-0 flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap group-hover:text-foreground/70 transition-colors">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDate(n.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Pagination controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center pt-6 pb-2">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
                
                {/* Pagination info */}
                <div className="text-xs text-center text-muted-foreground mt-2">
                  Showing {startIndex + 1}-{Math.min(endIndex, sortedNotificationHistory.length)} of {sortedNotificationHistory.length} notifications
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 