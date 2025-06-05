const BASE_URL = '/api';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '33340aae84db6ddded853028e017a58cef095797213f8b1b1eacaa0b39c45fe8';

interface ApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data: T;
}

interface AuthResponse {
  jwt: string;
  user: {
    id: string;
    email: string;
    image: string | null;
    username: string;
    googleToken: string | null;
    notificationToken: string | null;
    data: any;
    createdAt: string;
    status: string;
    roles: string[];
  };
  refreshToken: string;
}

interface RefreshResponse {
  jwt: string;
  refreshToken: string;
}

// Initialize token storage
let authToken: string | null = null;
let refreshToken: string | null = null;

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
// Queue of callbacks to be executed after token refresh
let refreshCallbacks: Array<(token: string) => void> = [];

// Get token from cookies or localStorage when in browser environment
if (typeof window !== 'undefined') {
  authToken = localStorage.getItem('authToken');
  refreshToken = localStorage.getItem('refreshToken');
}

// Helper function to set cookies
const setCookie = (name: string, value: string, days: number = 7) => {
  if (typeof window === 'undefined') return;
  
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;`;
};

// Helper function to delete cookies
const deleteCookie = (name: string) => {
  if (typeof window === 'undefined') return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;`;
};

// Function to set tokens
export const setTokens = (jwt: string, refresh: string) => {
  authToken = jwt;
  refreshToken = refresh;
  
  if (typeof window !== 'undefined') {
    // Store in localStorage for client-side access
    localStorage.setItem('authToken', jwt);
    localStorage.setItem('refreshToken', refresh);
    
    // Store in cookies for server-side access (middleware)
    setCookie('authToken', jwt);
    setCookie('refreshToken', refresh);
  }
};

// Function to clear tokens on logout
export const clearTokens = () => {
  authToken = null;
  refreshToken = null;
  
  if (typeof window !== 'undefined') {
    // Clear from localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    
    // Clear from cookies
    deleteCookie('authToken');
    deleteCookie('refreshToken');
  }
};

// Get current auth status
export const isAuthenticated = (): boolean => {
  return !!authToken;
};

// Keep track of when the token was last refreshed
let lastTokenRefresh = 0;
// Minimum time between token refreshes (5 minutes in milliseconds)
const MIN_REFRESH_INTERVAL = 5 * 60 * 1000;

// Function to check if we should refresh the token
// Only used when we've received a 401/403 response or when explicitly forced
function shouldRefreshToken(): boolean {
  // If we don't have a token or refresh token, we can't refresh
  if (!authToken || !refreshToken) return false;
  
  // If we've never refreshed or it's been more than the minimum interval, refresh
  const now = Date.now();
  return (now - lastTokenRefresh) > MIN_REFRESH_INTERVAL;
}

// Function to refresh the access token
// Should only be called when:
// 1. We receive a 401/403 response (force=true)
// 2. It's explicitly requested by a component (which should be rare)
async function refreshAccessToken(force: boolean = false): Promise<boolean> {
  if (!refreshToken) {
    console.error('No refresh token available');
    return false;
  }
  
  // Skip refresh if not forced and we refreshed recently
  if (!force && !shouldRefreshToken()) {
    console.log('Skipping token refresh - recently refreshed');
    return true; // Assume token is still valid
  }
  
  try {
    console.log('Refreshing access token...');
    
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify({ refreshToken }),
      // Add cache control to prevent caching of token requests
      cache: 'no-store',
    });
    
    if (!response.ok) {
      console.error(`Token refresh failed with status: ${response.status}`);
      // If refresh token is invalid, clear tokens and force re-login
      if (response.status === 401 || response.status === 403) {
        clearTokens();
      }
      return false;
    }
    
    const data = await response.json();
    
    if (data.success && data.data) {
      console.log('Token refresh successful');
      setTokens(data.data.jwt, data.data.refreshToken);
      lastTokenRefresh = Date.now(); // Update the last refresh timestamp
      return true;
    } else {
      console.error('Token refresh failed:', data.message);
      return false;
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    return false;
  }
}

// Process the queue of callbacks waiting for token refresh
function onTokenRefreshed(newToken: string) {
  refreshCallbacks.forEach(callback => callback(newToken));
  refreshCallbacks = [];
}

// Base API request function with automatic token handling
export async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {},
  retryAttempt = false
): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}${endpoint}`;
  
  // Get the latest token from localStorage in case it was updated elsewhere
  if (typeof window !== 'undefined') {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      authToken = storedToken;
    }
  }
  
  // Set up headers with API key
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  headers.set('x-api-key', API_KEY); // Using the x-api-key header format required by the API
  
  // Add auth token if available
  if (authToken) {
    console.log('Adding auth token to request:', `Bearer ${authToken.substring(0, 15)}...`);
    headers.set('Authorization', `Bearer ${authToken}`);
  } else {
    console.warn('No auth token available for request');
  }
  
  // Log request details for debugging
  console.log('API Request:', {
    url,
    method: options.method || 'GET',
    headers: Object.fromEntries(headers.entries()),
    body: options.body
  });
  
  try {
    // Make the request
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    console.log('API Response status:', response.status);
    
    // Parse the JSON response
    const data = await response.json();
    console.log('API Response data:', data);
    
    // Handle unauthorized errors or forbidden errors - attempt token refresh
    if ((response.status === 401 || response.status === 403) && !retryAttempt) {
      console.log('Received 401/403 - Token is expired or invalid, attempting refresh');
      
      // If already refreshing, add to callback queue
      if (isRefreshing) {
        console.log('Token refresh already in progress, adding request to queue');
        return new Promise(resolve => {
          refreshCallbacks.push((newToken) => {
            headers.set('Authorization', `Bearer ${newToken}`);
            resolve(apiRequest<T>(endpoint, options, true));
          });
        });
      }
      
      isRefreshing = true;
      
      // Force refresh since we got a 401/403 error
      const refreshSuccess = await refreshAccessToken(true);
      isRefreshing = false;
      
      if (refreshSuccess) {
        console.log('Token refreshed, retrying original request');
        onTokenRefreshed(authToken!);
        
        // Retry the original request with the new token
        return apiRequest<T>(endpoint, options, true);
      } else {
        console.log('Token refresh failed, logging out');
        clearTokens();
        
        // Redirect to login if in browser
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    
    return data;
  } catch (error) {
    console.error('API Request failed:', error);
    // Return a formatted error response
    return {
      success: false,
      status: 500,
      message: 'Request failed. Please try again.',
      data: null as any
    } as ApiResponse<T>;
  }
}

// Auth-specific API functions
export const authApi = {
  login: async (email: string, password: string): Promise<ApiResponse<AuthResponse>> => {
    console.log("Login request with:", { email, password });
    
    // Using the proxy route that will forward to the actual API
    const response = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    if (response.success && response.data) {
      console.log("Login successful, storing tokens and user data");
      
      // Check if user has valid roles for dashboard (ADMIN or EMPLOYEE only)
      if (response.data.user && response.data.user.roles) {
        const validRoles = ['ADMIN', 'EMPLOYEE'];
        const hasValidRole = response.data.user.roles.some(role => 
          validRoles.includes(role)
        );
        
        if (!hasValidRole) {
          // Log without using error to avoid console errors
          console.log("Access validation: User does not have dashboard access privileges");
          return {
            success: false,
            status: 403,
            message: "You don't have permission to access the dashboard. Only admin and employee roles are allowed.",
            data: null as any
          } as ApiResponse<AuthResponse>;
        }
      }
      
      // Store both JWT and refresh token
      setTokens(response.data.jwt, response.data.refreshToken);
      
      // Store user data
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Store user role information
        if (response.data.user.roles && response.data.user.roles.length > 0) {
          // Check if user has admin role
          const hasAdminRole = response.data.user.roles.includes('ADMIN');
          localStorage.setItem('userRole', hasAdminRole ? 'admin' : 'employee');
        }
      }
    }
    
    return response;
  },
  
  logout: async (): Promise<void> => {
    try {
      console.log("API logout called");
      
      // Optional: Call logout endpoint if API has one
      // await apiRequest('/auth/logout', { method: 'POST' });
      
      // Clear all tokens and auth data
      clearTokens();
      
      console.log("Tokens cleared successfully");
    } catch (error) {
      console.error("Error during logout:", error);
      // Still clear tokens even if API call fails
      clearTokens();
    }
  },
  
  refreshToken: async (force: boolean = false): Promise<boolean> => {
    console.log(`Refreshing token with force=${force}`);
    return await refreshAccessToken(force);
  },
  
  createUser: async (userData: { 
    username: string; 
    email: string; 
    password: string; 
    confirmedPassword: string; 
    role: string;
  }): Promise<ApiResponse<any>> => {
    console.log("Creating new user:", { ...userData, password: "***", confirmedPassword: "***" });
    
    try {
      // Use the API request function to send the request
      const response = await apiRequest<any>('/users', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
      
      console.log("User creation response:", response);
      return response;
    } catch (error) {
      console.error("Error creating user:", error);
      return {
        success: false,
        status: 500,
        message: error instanceof Error ? error.message : "Failed to create user. Please try again.",
        data: null
      };
    }
  }
};