"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { NewsForm } from "@/components/news/news-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

// Define the post type to match NewsForm's initialData
type Post = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: string;
  status: "published" | "draft";
};

// Mock data - in a real app, you would fetch this from an API
const mockPosts: Post[] = [
  {
    id: "1",
    title: "New Feature Launch: AI-Powered Content Suggestions",
    excerpt: "We're excited to announce the launch of our new AI-powered content suggestion feature that helps you create more engaging content for your audience.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.",
    author: "Admin User",
    date: "2023-06-01",
    category: "Product Updates",
    status: "published",
  },
  {
    id: "2",
    title: "How to Optimize Your Content for Better Engagement",
    excerpt: "Learn how to optimize your content to drive better engagement with your audience and improve your conversion rates.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.",
    author: "Employee User",
    date: "2023-05-28",
    category: "Best Practices",
    status: "published",
  },
  {
    id: "3",
    title: "Upcoming Maintenance Schedule",
    excerpt: "We'll be performing scheduled maintenance on our servers next week. Here's what you need to know about potential downtime.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.",
    author: "Admin User",
    date: "2023-05-25",
    category: "Announcements",
    status: "published",
  },
  {
    id: "4",
    title: "Draft: New User Onboarding Guide",
    excerpt: "A comprehensive guide to help new users get started with our platform and make the most of all available features.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.",
    author: "Employee User",
    date: "2023-05-20",
    category: "Guides",
    status: "draft",
  },
];

export function NewsPostClient({ id }: { id: string }) {
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch post data
    const fetchPost = () => {
      setIsLoading(true);
      
      setTimeout(() => {
        // Check if this is the "new" route
        if (id === "new") {
          setPost(null);
          setIsLoading(false);
          return;
        }
        
        // Find post by ID
        const foundPost = mockPosts.find((p) => p.id === id);
        
        if (foundPost) {
          setPost(foundPost);
        } else {
          toast.error("News post not found");
          router.push("/dashboard/news");
        }
        
        setIsLoading(false);
      }, 500);
    };
    
    fetchPost();
  }, [id, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Loading...</h1>
        </div>
        <div className="h-96 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading post data...</div>
        </div>
      </div>
    );
  }

  const isNewPost = id === "new";

  // Transform post to match NewsForm's initialData type if needed
  const formData = post ? {
    id: post.id,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    category: post.category,
    status: post.status
  } : undefined;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">
          {isNewPost ? "Create News Post" : "Edit News Post"}
        </h1>
      </div>

      <NewsForm
        initialData={formData}
        isEditing={!isNewPost}
      />
    </div>
  );
} 