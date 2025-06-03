"use client";

import { useState } from "react";
import { apiRequest } from "@/lib/api/client";

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
}

export function useApi<T>() {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const request = async <R>(
    endpoint: string,
    options: RequestInit = {},
    apiOptions: UseApiOptions<R> = {}
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiRequest<R>(endpoint, options);
      
      if (response.success) {
        setData(response.data as unknown as T);
        apiOptions.onSuccess?.(response.data);
      } else {
        setError({ message: response.message });
        apiOptions.onError?.(response);
      }
      
      return response;
    } catch (err) {
      setError(err);
      apiOptions.onError?.(err);
      return {
        success: false,
        status: 500,
        message: err instanceof Error ? err.message : 'Unknown error',
        data: null
      };
    } finally {
      setIsLoading(false);
    }
  };

  return { data, error, isLoading, request };
}