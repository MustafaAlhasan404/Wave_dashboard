import { apiRequest } from "./client";

export interface Reviewer {
  id: string;
  username: string;
  email: string;
  roles: string[];
}

export interface Report {
  id: string;
  newsId: string;
  userId: string;
  type: "FAKE_NEWS" | "MISLEADING" | "HATE_SPEECH" | "OTHER";
  status: "PENDING" | "IN_REVIEW" | "RESOLVED" | "DISMISSED" | "ACTION_TAKEN";
  message: string;
  createdAt: string;
  reviewers?: Reviewer[];
}

export interface ReportsResponse {
  reports: Report[];
}

export interface ReportDetailResponse {
  report: Report;
}

export interface DeleteReportResponse {
  deletedReport: Report;
}

export const reportsApi = {
  /**
   * Get all reports
   * @returns List of all reports
   */
  getAllReports: async () => {
    return apiRequest<ReportsResponse>('/reports');
  },

  /**
   * Get a single report by ID
   * @param id Report ID
   * @returns Detailed report information
   */
  getReportById: async (id: string) => {
    return apiRequest<ReportDetailResponse>(`/reports/${id}`);
  },
  
  /**
   * Get report type label
   */
  getReportTypeLabel: (type: string): string => {
    switch (type) {
      case "FAKE_NEWS": return "Fake News";
      case "MISLEADING": return "Misleading Content";
      case "HATE_SPEECH": return "Hate Speech";
      case "OTHER": return "Other";
      default: return type;
    }
  },
  
  /**
   * Get report status label
   */
  getStatusLabel: (status: string): string => {
    switch (status) {
      case "PENDING": return "Pending";
      case "IN_REVIEW": return "In Review";
      case "RESOLVED": return "Resolved";
      case "DISMISSED": return "Dismissed";
      case "ACTION_TAKEN": return "Action Taken";
      default: return status;
    }
  },
  
  /**
   * Get status color class
   */
  getStatusColor: (status: string): string => {
    switch (status) {
      case "PENDING": return "bg-yellow-100 text-yellow-800";
      case "IN_REVIEW": return "bg-blue-100 text-blue-800";
      case "RESOLVED": return "bg-green-100 text-green-800";
      case "DISMISSED": return "bg-gray-100 text-gray-800";
      case "ACTION_TAKEN": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  },

  /**
   * Update report status
   * @param id Report ID
   * @param status New status
   * @returns Updated status information
   */
  updateReportStatus: async (id: string, status: Report['status']) => {
    return apiRequest<{ status: string }>(`/reports/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  /**
   * Delete a report
   * @param id Report ID
   * @returns The deleted report data
   */
  deleteReport: async (id: string) => {
    return apiRequest<DeleteReportResponse>(`/reports/${id}`, {
      method: 'DELETE'
    });
  }
} 