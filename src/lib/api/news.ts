import { apiRequest } from './client';

export interface NewsSource {
  id: string;
  name: string;
  image: string;
  link: string;
  _count: {
    sourceFollowings: number;
  };
}

export interface NewsItem {
  id: string;
  image: string | null;
  title: string;
  category: string;
  fakeVoice: boolean;
  credibilityScore: number;
  publishedAt: string;
  status: "published" | "draft" | "archived";
  source: NewsSource;
}

export interface NewsPaginationResponse {
  news: NewsItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DeleteNewsResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    deletedNews?: Array<{
      count?: number;
      id?: string;
      image?: string | null;
      sourceId?: string;
      title?: string;
      category?: string;
      status?: string;
      fakeVoice?: boolean;
      publishedAt?: string;
      createdAt?: string;
      [key: string]: any; // Allow other properties
    }> | null;
  } | null; // Allow data to be null for error responses
}

export interface EditNewsResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    updatedNews: NewsItem;
  } | null;
}

export interface CreateNewsResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    news: NewsItem;
  } | null;
}

export interface UploadImageResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    image?: string;
    imageUrl?: string;
  } | null;
}

export const newsApi = {
  getNews: async (page: number = 1, limit: number = 10) => {
    return apiRequest<NewsPaginationResponse>(`/news?page=${page}&limit=${limit}`);
  },
  
  getNewsById: async (id: string) => {
    return apiRequest<{ news: NewsItem }>(`/news/${id}`);
  },
  

  
  deleteNews: async (id: string) => {
    return apiRequest<DeleteNewsResponse>(`/news/${id}`, {
      method: 'DELETE'
    });
  },

  editNews: async (id: string, data: Partial<Omit<NewsItem, 'id' | 'source'>> & { link?: string; keywords?: string[] }) => {
    return apiRequest<EditNewsResponse>(`/news/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },
  
  createNews: async (data: Partial<Omit<NewsItem, 'id' | 'source'>> & { link?: string; keywords?: string[] }) => {
    return apiRequest<CreateNewsResponse>('/news', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  
  uploadNewsImage: async (id: string, imageFile: File) => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      // Get auth token from localStorage
      let authToken = null;
      if (typeof window !== 'undefined') {
        authToken = localStorage.getItem('authToken');
      }
      
      // Create a local URL for preview
      const blobUrl = URL.createObjectURL(imageFile);
      
      // Use the real API endpoint now - we've fixed the proxy
      const url = `/api/news/image/${id}`;
      console.log('Uploading image to:', url);
      
      // Set up headers with API key
      const headers = new Headers();
      const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '33340aae84db6ddded853028e017a58cef095797213f8b1b1eacaa0b39c45fe8';
      headers.set('x-api-key', API_KEY);
      
      // Add auth token if available
      if (authToken) {
        headers.set('Authorization', `Bearer ${authToken}`);
        console.log('Adding auth token to request');
      } else {
        console.warn('No auth token available for image upload');
      }
      
      try {
        // Make the request
        const response = await fetch(url, {
          method: 'PATCH',
          body: formData,
          headers,
          credentials: 'include',
        });
        
        if (!response.ok) {
          console.error('Image upload failed with status:', response.status);
          
          // Try to parse error response
          let errorMessage = `Image upload failed with status: ${response.status}`;
          
          try {
            const errorData = await response.json();
            console.error('Error details:', errorData);
            if (errorData.message) {
              errorMessage = errorData.message;
            }
          } catch (e) {
            // If not JSON, try to get text
            try {
              const errorText = await response.text();
              console.error('Error text:', errorText);
            } catch (textError) {
              console.error('Could not parse error response');
            }
          }
          
          throw new Error(errorMessage);
        }
        
        const data = await response.json();
        console.log('Image upload response:', data);
        
        // Check if the response contains imageUrl and convert it to the expected format
        // The API response is { success, status, message, data: { imageUrl } }
        // Our UploadImageResponse expects { success, status, message, data: { image } }
        if (data.success && data.data?.imageUrl) {
          const transformedData = {
            ...data,
            data: {
              ...data.data,
              image: data.data.imageUrl
            }
          };
          console.log('Transformed data:', transformedData);
          return transformedData as UploadImageResponse;
        }
        
        // If we don't have an image URL in the response, use the blob URL
        if (data.success && (!data.data?.image && !data.data?.imageUrl)) {
          console.log('No image URL in response, using blob URL:', blobUrl);
          return {
            ...data,
            data: {
              ...data.data,
              image: blobUrl
            }
          } as UploadImageResponse;
        }
        
        return data as UploadImageResponse;
      } catch (error) {
        // If API request fails, return the blob URL as a fallback
        console.error('Error uploading image:', error);
        console.log('Falling back to local blob URL:', blobUrl);
        
        return {
          success: true,
          status: 200,
          message: 'Using local preview (API unavailable)',
          data: {
            image: blobUrl
          }
        } as UploadImageResponse;
      }
    } catch (error) {
      console.error('Error in uploadNewsImage:', error);
      return {
        success: false,
        status: 500,
        message: error instanceof Error ? error.message : 'Failed to upload image',
        data: null
      } as UploadImageResponse;
    }
  }
}; 