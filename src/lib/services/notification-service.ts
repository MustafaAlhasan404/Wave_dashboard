import { apiRequest } from "@/lib/api/client";

export interface NotificationRequest {
  title: string;
  body: string;
  topic: string;
  scheduledTime?: string;
}

export interface NotificationResponse {
  id: string;
  title: string;
  body: string;
  topic: string;
  scheduledTime?: string;
  createdAt: string;
  sentAt?: string;
  status: 'SENT' | 'SCHEDULED' | 'FAILED';
}

export interface NotificationHistoryItem {
  id: string;
  title: string;
  body: string;
  topic: string;
  scheduledTime?: string;
  createdAt: string;
  sentAt?: string;
  status: 'SENT' | 'SCHEDULED' | 'FAILED';
  sentBy: string;
}

// Available notification topics
export const NOTIFICATION_TOPICS = {
  NEWS: 'news',
  PREMIUM: 'premium',
  UPDATES: 'updates',
  ANNOUNCEMENTS: 'announcements',
  EVENTS: 'events',
};

// Notification service for sending and retrieving notifications
export const notificationService = {
  // Send a notification
  sendNotification: async (notification: NotificationRequest) => {
    return await apiRequest<NotificationResponse>('/notify', {
      method: 'POST',
      body: JSON.stringify(notification),
    });
  },
  
  // Get notification history (mock implementation)
  getNotificationHistory: async () => {
    // In a real implementation, this would be an API call
    // For now, we'll return mock data
    const mockHistory: NotificationHistoryItem[] = [
      {
        id: "1",
        title: "New Feature Announcement",
        body: "We've just launched our new AI-powered content suggestions feature!",
        topic: "news",
        createdAt: "2023-06-01T10:30:00Z",
        sentAt: "2023-06-01T10:30:00Z",
        status: 'SENT',
        sentBy: "Admin User",
      },
      {
        id: "2",
        title: "Scheduled Maintenance",
        body: "Our platform will be undergoing maintenance on June 15th from 2-4 AM EST.",
        topic: "updates",
        createdAt: "2023-05-28T14:15:00Z",
        sentAt: "2023-05-28T14:15:00Z",
        status: 'SENT',
        sentBy: "Admin User",
      },
      {
        id: "3",
        title: "Content Guidelines Update",
        body: "We've updated our content guidelines. Please review the new rules.",
        topic: "announcements",
        createdAt: "2023-05-20T09:45:00Z",
        sentAt: "2023-05-20T09:45:00Z",
        status: 'SENT',
        sentBy: "Admin User",
      },
    ];
    
    return {
      success: true,
      status: 200,
      message: "Notification history retrieved successfully",
      data: mockHistory,
    };
  },
};