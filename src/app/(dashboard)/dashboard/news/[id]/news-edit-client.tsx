"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { NewsForm } from "@/components/news/news-form";
import { newsApi } from "@/lib/api/news";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { LoadingDots } from "@/components/ui/loading-dots";

interface NewsEditClientProps {
  id: string;
}

export function NewsEditClient({ id }: NewsEditClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [newsData, setNewsData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchNewsData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await newsApi.getNewsById(id);
        
        if (response.success && response.data) {
          console.log("Loaded news data:", response.data.news);
          setNewsData(response.data.news);
        } else {
          setError(response.message || "Failed to load news post");
          toast.error("Failed to load news post");
        }
      } catch (err) {
        console.error("Error fetching news:", err);
        setError("An error occurred while loading the news post");
        toast.error("An error occurred while loading the news post");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNewsData();
  }, [id]);

  const handleEditComplete = () => {
    router.push("/dashboard/news");
  };
  
  const handleBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 mb-6">
        <Button 
          variant="ghost" 
          onClick={handleBack}
          className="h-8 w-8 p-0"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <div>
          <p className="text-muted-foreground">Loading post data...</p>
          <LoadingDots size={10} color="#888" className="mt-2" />
        </div>
      </div>
    );
  }

  if (error || !newsData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            onClick={handleBack}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <div>
            <p className="text-destructive">{error || "Could not load news post"}</p>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center py-12">
          <p className="mb-4 text-center">We couldn't load the news post you're looking for.</p>
          <Button onClick={() => router.push("/dashboard/news")}>
            Back to News
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <NewsForm 
        initialData={newsData} 
        isEditing={true} 
        onEditComplete={handleEditComplete}
        onBack={handleBack}
      />
    </div>
  );
} 