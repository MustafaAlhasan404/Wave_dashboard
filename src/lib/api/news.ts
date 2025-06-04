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
  isSaved: boolean;
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

export const newsApi = {
  getNews: async (page: number = 1, limit: number = 10) => {
    return apiRequest<NewsPaginationResponse>(`/news?page=${page}&limit=${limit}`);
  },
  
  getNewsById: async (id: string) => {
    return apiRequest<{ news: NewsItem }>(`/news/${id}`);
  },
  
  saveNews: async (id: string, saved: boolean) => {
    return apiRequest<{ success: boolean }>(`/news/${id}/save`, {
      method: 'POST',
      body: JSON.stringify({ saved })
    });
  }
}; 