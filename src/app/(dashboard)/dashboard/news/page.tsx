"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NewsPostCard } from "@/components/news/news-post-card";
import { ArrowLeft, Edit, Plus, RefreshCcw, Trash } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Define the NewsPost type
interface NewsPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: string;
  status: "published" | "draft";
}

// Mock data for news posts
const mockPosts: NewsPost[] = [
  {
    id: "1",
    title: "New Feature Launch: AI-Powered Content Suggestions",
    excerpt: "We're excited to announce the launch of our new AI-powered content suggestion feature that helps you create more engaging content for your audience.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.\n\nNullam euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.\n\nPellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo.",
    author: "Admin User",
    date: "2023-06-01",
    category: "Product Updates",
    status: "published",
  },
  {
    id: "2",
    title: "How to Optimize Your Content for Better Engagement",
    excerpt: "Learn how to optimize your content to drive better engagement with your audience and improve your conversion rates.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.\n\nNullam euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.\n\nPellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo.",
    author: "Employee User",
    date: "2023-05-28",
    category: "Best Practices",
    status: "published",
  },
  {
    id: "3",
    title: "Upcoming Maintenance Schedule",
    excerpt: "We'll be performing scheduled maintenance on our servers next week. Here's what you need to know about potential downtime.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.\n\nNullam euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.\n\nPellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo.",
    author: "Admin User",
    date: "2023-05-25",
    category: "Announcements",
    status: "published",
  },
  {
    id: "4",
    title: "Draft: New User Onboarding Guide",
    excerpt: "A comprehensive guide to help new users get started with our platform and make the most of all available features.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.\n\nNullam euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.\n\nPellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo.",
    author: "Employee User",
    date: "2023-05-20",
    category: "Guides",
    status: "draft",
  },
];

export default function NewsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPost, setSelectedPost] = useState<NewsPost | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter posts based on search query, category, and status
  const filteredPosts = mockPosts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || post.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || post.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = Array.from(new Set(mockPosts.map((post) => post.category)));

  const handleViewDetails = (postId: string) => {
    const post = mockPosts.find(p => p.id === postId);
    if (post) {
      setSelectedPost(post);
      // Scroll to top to show the selected post
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCloseDetails = () => {
    setSelectedPost(null);
  };

  const handleResendToAI = () => {
    if (!selectedPost) return;
    
    setIsResending(true);
    
    // Simulate API call to resend post to AI
    setTimeout(() => {
      setIsResending(false);
      toast.success("News post sent to AI for processing");
    }, 1500);
  };

  const handleDelete = () => {
    if (!selectedPost) return;
    
    setIsDeleting(true);
    
    // Simulate API call to delete post
    setTimeout(() => {
      setIsDeleting(false);
      setSelectedPost(null);
      toast.success("News post deleted successfully");
      // In a real app, you would refresh the data or update the UI
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">News Posts</h1>
        <Button asChild>
          <Link href="/dashboard/news/new">
            <Plus className="mr-2 h-4 w-4" />
            Create New Post
          </Link>
        </Button>
      </div>

      {/* Floating News Post Details */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto border-border shadow-lg animate-in fade-in zoom-in-95 duration-300">
            <CardHeader className="pb-2 sticky top-0 bg-card z-10 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={handleCloseDetails}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </Button>
                  <div>
                    <CardTitle className="text-xl">{selectedPost.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <span>{selectedPost.date}</span>
                      <span>•</span>
                      <span>{selectedPost.category}</span>
                      <span>•</span>
                      <span>By {selectedPost.author}</span>
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={selectedPost.status === "published" ? "default" : "outline"}>
                  {selectedPost.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="py-6">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <h3 className="text-lg font-medium mb-2">Summary</h3>
                <p className="text-muted-foreground mb-6">{selectedPost.excerpt}</p>
                
                <h3 className="text-lg font-medium mb-2">Full Content</h3>
                <div className="whitespace-pre-line">
                  {selectedPost.content.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-4">{paragraph}</p>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 sticky bottom-0 bg-card border-t p-4">
              <Button 
                variant="outline"
                size="sm"
                onClick={handleResendToAI}
                disabled={isResending}
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                {isResending ? "Processing..." : "Resend to AI"}
              </Button>
              <Button 
                variant="outline"
                size="sm"
                asChild
              >
                <Link href={`/dashboard/news/${selectedPost.id}`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Post
                </Link>
              </Button>
              <Button 
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash className="mr-2 h-4 w-4" />
                {isDeleting ? "Deleting..." : "Delete Post"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search news posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="sm:max-w-xs"
          />
          <div className="flex flex-row gap-4">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="grid" className="w-full">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="grid" className="flex-1 sm:flex-initial">Grid</TabsTrigger>
            <TabsTrigger value="list" className="flex-1 sm:flex-initial">List</TabsTrigger>
          </TabsList>
          
          <TabsContent value="grid" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <NewsPostCard 
                  key={post.id} 
                  post={post} 
                  onViewDetails={() => handleViewDetails(post.id)}
                />
              ))}
              
              {filteredPosts.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-muted-foreground">No news posts found matching your filters.</p>
                  <Button variant="outline" className="mt-4" onClick={() => {
                    setSearchQuery("");
                    setCategoryFilter("all");
                    setStatusFilter("all");
                  }}>
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="list" className="mt-4">
            <div className="flex flex-col gap-4">
              {filteredPosts.map((post) => (
                <NewsPostCard 
                  key={post.id} 
                  post={post}
                  onViewDetails={() => handleViewDetails(post.id)}
                />
              ))}
              
              {filteredPosts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-muted-foreground">No news posts found matching your filters.</p>
                  <Button variant="outline" className="mt-4" onClick={() => {
                    setSearchQuery("");
                    setCategoryFilter("all");
                    setStatusFilter("all");
                  }}>
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 