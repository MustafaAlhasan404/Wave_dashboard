import { Suspense } from "react";
import { NewsEditClient } from "@/app/(dashboard)/dashboard/news/[id]/news-edit-client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { LoadingDots } from "@/components/ui/loading-dots";

interface NewsPostPageProps {
  params: { id: string };
}

export default function NewsPostPage({ params }: NewsPostPageProps) {
  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={
        <div className="w-full">
          <div className="flex items-center gap-3 mb-6">
            <Button 
              variant="ghost" 
              className="h-8 w-8 p-0"
              disabled
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
            <p className="text-muted-foreground">Loading post data...</p>
          </div>
          <div className="flex justify-center items-center py-12">
            <LoadingDots size={10} color="#888" />
          </div>
        </div>
      }>
        <NewsEditClient id={params.id} />
      </Suspense>
    </div>
  );
} 