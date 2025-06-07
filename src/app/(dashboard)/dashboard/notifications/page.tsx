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

export default function NotificationsPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(true);
  const [isSending, setIsSending] = useState(false);
  
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
    <div className="flex flex-col gap-8 relative">
      {/* Header Card */}
      <Card className="bg-muted/40 border-none shadow-none p-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold mb-1 flex items-center gap-3">
              <Bell className="h-7 w-7 text-primary" />
              Notifications
            </h1>
            <p className="text-muted-foreground text-base">Send announcements to your users.</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Form */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="px-6 pb-2 pt-6">
            <CardTitle>New Notification</CardTitle>
            <CardDescription>Fill out the form to send a notification.</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <form onSubmit={handleSendNotification} className="space-y-6">
              <div className="space-y-4">
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
                <div className="grid gap-4 sm:grid-cols-2">
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
        {/* Live Preview */}
        <div className="sticky top-24">
          <Card className="border-primary/30 shadow-md animate-in fade-in zoom-in-95 duration-300">
            <CardHeader className="px-6 pt-6 pb-2">
              <CardTitle className="flex items-center gap-2">
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
    </div>
  );
} 