import { apiRequest } from "./client";

export interface NotificationPayload {
  title: string;  // Required
  body: string;   // Required
  topic: "news" | "premium" | string;  // Required
  scheduledTime?: string; // Optional - ISO string format: YYYY-MM-DDTHH:mm:ssZ
}

export interface NotificationResponse {
  id: string;
  title: string;
  body: string;
  topic: string;
  scheduledTime?: string;
  sentAt?: string;
  status: "SCHEDULED" | "SENT" | "FAILED";
}

export const notificationsApi = {
  /**
   * Send a notification to users
   * @param payload The notification data
   * @returns API response with notification details
   */
  sendNotification: async (payload: NotificationPayload) => {
    console.log("Sending notification:", payload);
    
    try {
      // Validate required fields before sending
      if (!payload.title || !payload.body || !payload.topic) {
        console.error("Missing required notification fields");
        return {
          success: false,
          status: 400,
          message: "Missing required fields: title, body, and topic are required",
          data: null as any
        };
      }
      
      // Let the apiRequest function handle tokens and authentication
      // It will automatically add the token and handle refresh if needed
      return apiRequest<NotificationResponse>('/notify', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.error("Error in sendNotification:", error);
      return {
        success: false,
        status: 500,
        message: "Failed to send notification. Please try again.",
        data: null as any
      };
    }
  },
  
  /**
   * Get notification topics
   * @returns List of available notification topics
   */
  getTopics: async () => {
    return [
      { id: "news", name: "News", description: "General news notifications sent to all users" },
      { id: "premium", name: "Premium", description: "Notifications for premium users only" }
    ];
  },

  /**
   * Get notification history
   * @returns API response with list of notifications
   */
  getNotificationHistory: async () => {
    try {
      return await apiRequest<{ id: string; topic: string; title: string; body: string; data: any; createdAt: string; }[]>(
        '/notifications',
        { method: 'GET' }
      );
    } catch (error) {
      console.error('Error fetching notification history:', error);
      return {
        success: false,
        status: 500,
        message: 'Failed to fetch notification history',
        data: null as any
      };
    }
  }
};