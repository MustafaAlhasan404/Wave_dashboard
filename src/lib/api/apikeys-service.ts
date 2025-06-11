import { apiRequest } from './client';

export interface ApiKey {
  key: string;
  appName: string;
  isActive: boolean;
  createdAt: string;
  lastUsedAt: string | null;
}

export interface ApiKeysResponse {
  apiKeys: ApiKey[];
}

export interface ApiKeyResponse {
  apiKey: ApiKey;
}

export interface ApiKeyCreateRequest {
  appName: string;
}

class ApiKeysService {
  /**
   * Get all API keys
   */
  async getApiKeys(): Promise<ApiKeysResponse> {
    const response = await apiRequest<ApiKeysResponse>('/apiKeys');
    return response.data;
  }

  /**
   * Create a new API key
   */
  async createApiKey(data: ApiKeyCreateRequest): Promise<ApiKeyResponse> {
    const response = await apiRequest<ApiKeyResponse>('/apiKeys', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  /**
   * Toggle API key status (enable/disable)
   */
  async toggleApiKeyStatus(key: string): Promise<ApiKeyResponse> {
    const response = await apiRequest<ApiKeyResponse>(`/apiKeys/${key}`, {
      method: 'PATCH',
    });
    return response.data;
  }

  /**
   * Format date string
   */
  formatDate(dateString: string | null): string {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    
    // Format: June 11, 2025 at 1:54 PM
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }) + ' at ' + date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  /**
   * Get status badge variant
   */
  getStatusVariant(isActive: boolean): "default" | "secondary" | "destructive" | "outline" {
    return isActive ? "default" : "destructive";
  }
}

export const apiKeysService = new ApiKeysService(); 