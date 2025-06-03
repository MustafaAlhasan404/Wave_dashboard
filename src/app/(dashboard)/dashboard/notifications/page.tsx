"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { AlertCircle, Bell, Calendar, Send, Users } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { notificationsApi, NotificationPayload } from "@/lib/api/notifications";
import { TokenDebug } from "@/components/dashboard/token-debug";

// Mock data for sent notifications
const mockNotifications = [
  {
    id: "1",
    title: "New Feature Announcement",
    message: "We've just launched our new AI-powered content suggestions feature!",
    target: "all",
    sentAt: "2023-06-01T10:30:00Z",
    sentBy: "Admin User",
  },
  {
    id: "2",
    title: "Scheduled Maintenance",
    message: "Our platform will be undergoing maintenance on June 15th from 2-4 AM EST.",
    target: "active",
    sentAt: "2023-05-28T14:15:00Z",
    sentBy: "Admin User",
  },
  {
    id: "3",
    title: "Content Guidelines Update",
    message: "We've updated our content guidelines. Please review the new rules.",
    target: "content_creators",
    sentAt: "2023-05-20T09:45:00Z",
    sentBy: "Admin User",
  },
];

export default function NotificationsPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("compose");
  
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
    switch (target) {
      case "news": return "All Users";
      case "premium": return "Premium Users";
      default: return target;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <Badge variant="outline" className="flex items-center gap-1">
          <Bell className="h-3.5 w-3.5" />
          <span>{mockNotifications.length} Sent</span>
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="compose">Compose</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="debug">Debug</TabsTrigger>
        </TabsList>
        
        <TabsContent value="compose" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>New Notification</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendNotification} className="space-y-5">
                <div className="grid gap-5">
                  <div className="space-y-2.5">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="Enter a concise, attention-grabbing title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2.5">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Enter your notification message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="resize-none h-24"
                    />
                  </div>
                  
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2.5">
                      <Label htmlFor="target" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Target Audience
                      </Label>
                      <Select
                        value={formData.target}
                        onValueChange={(value) => handleSelectChange("target", value)}
                      >
                        <SelectTrigger id="target">
                          <SelectValue placeholder="Select audience" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="news">All Users (News)</SelectItem>
                          <SelectItem value="premium">Premium Users</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2.5">
                      <Label className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Schedule
                      </Label>
                      <div className="flex items-center gap-3 h-10">
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
                          className="mt-2"
                        />
                      )}
                    </div>
                  </div>
                </div>
                
                {formData.title && formData.message && (
                  <Alert className="mt-4 bg-card border border-border">
                    <Bell className="h-4 w-4" />
                    <AlertTitle>{formData.title}</AlertTitle>
                    <AlertDescription>
                      {formData.message}
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-muted-foreground">
                    <AlertCircle className="h-3 w-3 inline mr-1" />
                    Notifications cannot be recalled once sent
                  </div>
                  <Button type="submit" disabled={isSending}>
                    <Send className="mr-2 h-4 w-4" />
                    {isSending ? "Sending..." : "Send Notification"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Notification History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockNotifications.map((notification) => (
                  <Card key={notification.id} className="overflow-hidden bg-muted/30 border-none">
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{notification.title}</h3>
                          <Badge variant="outline" className="text-xs">
                            {getTargetLabel(notification.target)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                          <span>{formatDate(notification.sentAt)}</span>
                          <span>by {notification.sentBy}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="debug" className="mt-4">
          <TokenDebug />
        </TabsContent>
      </Tabs>
    </div>
  );
} 