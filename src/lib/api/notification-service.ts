import { apiRequest } from './client';

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
  sentAt?: string;
  status: string;
}

export const notificationService = {
  /**
   * Send a notification to users
   * @param notification The notification data to send
   * @returns API response with notification details
   */
  sendNotification: async (notification: NotificationRequest) => {
    return await apiRequest<NotificationResponse>('/notify', {
      method: 'POST',
      body: JSON.stringify(notification)
    });
  },
  
  /**
   * Get notification history
   * @returns API response with list of sent notifications
   */
  getNotificationHistory: async () => {
    return await apiRequest<NotificationResponse[]>('/notifications/history', {
      method: 'GET'
    });
  }
};