"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { notificationsApi, NotificationPayload } from "@/lib/api/notifications";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function NotificationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<NotificationPayload>({
    defaultValues: {
      title: "",
      body: "",
      topic: "news"
    }
  });
  
  const onSubmit = async (data: NotificationPayload) => {
    setIsLoading(true);
    
    try {
      // Add scheduled time if enabled
      if (scheduleEnabled && date) {
        data.scheduledTime = date.toISOString();
      }
      
      const response = await notificationsApi.sendNotification(data);
      
      if (response.success) {
        toast.success("Notification sent successfully");
        reset();
      } else {
        toast.error(`Failed to send notification: ${response.message}`);
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error("An error occurred while sending the notification");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Send Notification</CardTitle>
        <CardDescription>
          Send push notifications to users based on topics
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Notification Title</Label>
            <Input
              id="title"
              placeholder="Enter notification title"
              {...register("title", { required: "Title is required" })}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="body">Notification Body</Label>
            <Textarea
              id="body"
              placeholder="Enter notification content"
              className="min-h-[100px]"
              {...register("body", { required: "Body content is required" })}
            />
            {errors.body && (
              <p className="text-sm text-destructive">{errors.body.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <Select defaultValue="news" onValueChange={(value) => register("topic").onChange({ target: { value } })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a topic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="news">News (All Users)</SelectItem>
                <SelectItem value="premium">Premium Users</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="schedule"
              checked={scheduleEnabled}
              onCheckedChange={setScheduleEnabled}
            />
            <Label htmlFor="schedule">Schedule for later</Label>
          </div>
          
          {scheduleEnabled && (
            <div className="space-y-2">
              <Label>Schedule Date and Time</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP HH:mm") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                  <div className="p-3 border-t border-border">
                    <Input
                      type="time"
                      value={date ? format(date, "HH:mm") : ""}
                      onChange={(e) => {
                        if (date && e.target.value) {
                          const [hours, minutes] = e.target.value.split(':');
                          const newDate = new Date(date);
                          newDate.setHours(parseInt(hours), parseInt(minutes));
                          setDate(newDate);
                        }
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Notification"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}