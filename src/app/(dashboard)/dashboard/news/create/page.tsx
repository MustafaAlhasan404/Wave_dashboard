"use client";

import { useRouter } from "next/navigation";
import { NewsForm } from "@/components/news/news-form";

export default function CreateNewsPage() {
  const router = useRouter();

  const handleEditComplete = () => {
    router.push("/dashboard/news");
  };
  
  const handleBack = () => {
    router.back();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="w-full">
        <NewsForm 
          isEditing={false} 
          onEditComplete={handleEditComplete}
          onBack={handleBack}
        />
      </div>
    </div>
  );
} 