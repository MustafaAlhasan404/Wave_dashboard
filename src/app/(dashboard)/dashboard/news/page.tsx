"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NewsPostCard } from "@/components/news/news-post-card";
import { ArrowLeft, ChevronLeft, ChevronRight, Edit, Plus, RefreshCcw, Trash } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { NewsItem, NewsPaginationResponse, newsApi } from "@/lib/api/news";
import { formatDistanceToNow } from "date-fns";

export default function NewsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPost, setSelectedPost] = useState<NewsItem | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [posts, setPosts] = useState<NewsItem[]>([]);
  
  // Fetch news posts with pagination
  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await newsApi.getNews(currentPage, 10);
        
        if (response.success && response.data) {
          setPosts(response.data.news);
          setTotalPages(response.data.pagination.totalPages);
        } else {
          setError(response.message || "Failed to fetch news posts");
          toast.error("Failed to fetch news posts");
        }
      } catch (err) {
        console.error("Error fetching news:", err);
        setError("An error occurred while fetching news posts");
        toast.error("An error occurred while fetching news posts");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNews();
  }, [currentPage]);

  // Filter posts based on search query, category, and status
  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || post.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || post.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get unique categories from posts
  const categories = Array.from(new Set(posts.map((post) => post.category)));

  const handleViewDetails = (postId: string) => {
    const post = posts.find(p => p.id === postId);
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

  const handleSaveToggle = (id: string, saved: boolean) => {
    // Update the post in the local state
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === id ? { ...post, isSaved: saved } : post
      )
    );
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Generate pagination buttons
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxButtons = 5; // Maximum number of page buttons to show
    
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    const endPage = Math.min(totalPages, startPage + maxButtons - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }
    
    // First page button
    if (startPage > 1) {
      buttons.push(
        <Button 
          key="first" 
          variant={currentPage === 1 ? "default" : "outline"} 
          size="icon"
          onClick={() => handlePageChange(1)}
        >
          1
        </Button>
      );
      
      // Ellipsis if there's a gap
      if (startPage > 2) {
        buttons.push(
          <span key="ellipsis1" className="px-2">...</span>
        );
      }
    }
    
    // Page buttons
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button 
          key={i} 
          variant={currentPage === i ? "default" : "outline"} 
          size="icon"
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Button>
      );
    }
    
    // Last page button
    if (endPage < totalPages) {
      // Ellipsis if there's a gap
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="ellipsis2" className="px-2">...</span>
        );
      }
      
      buttons.push(
        <Button 
          key="last" 
          variant={currentPage === totalPages ? "default" : "outline"} 
          size="icon"
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </Button>
      );
    }
    
    return buttons;
  };

  const formattedDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
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
                      <span>{formattedDate(selectedPost.publishedAt)}</span>
                      <span>•</span>
                      <span>{selectedPost.category}</span>
                      <span>•</span>
                      <span>By {selectedPost.source.name}</span>
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={
                  selectedPost.status === "published" ? "default" : 
                  selectedPost.status === "draft" ? "outline" : "secondary"
                }>
                  {selectedPost.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="py-6">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <h3 className="text-lg font-medium mb-2">Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Source</p>
                    <p>{selectedPost.source.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Credibility Score</p>
                    <p>{Math.round(selectedPost.credibilityScore * 100)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fake Voice Detection</p>
                    <p>{selectedPost.fakeVoice ? "Detected" : "Not Detected"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p>{selectedPost.category}</p>
                  </div>
                </div>
                
                <h3 className="text-lg font-medium mb-2">Source Information</h3>
                <div className="flex items-center gap-4 mb-6">
                  {selectedPost.source.image && (
                    <Image 
                      src={selectedPost.source.image} 
                      alt={selectedPost.source.name}
                      width={64}
                      height={64}
                      className="object-cover rounded-md"
                    />
                  )}
                  <div>
                    <p className="font-medium">{selectedPost.source.name}</p>
                    <p className="text-sm text-muted-foreground">
                      <a href={selectedPost.source.link} target="_blank" rel="noopener noreferrer" className="underline">
                        {selectedPost.source.link}
                      </a>
                    </p>
                    <p className="text-sm">{selectedPost.source._count.sourceFollowings} followers</p>
                  </div>
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
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-destructive">{error}</p>
            <Button variant="outline" className="mt-4" onClick={() => setCurrentPage(1)}>
              Try Again
            </Button>
          </div>
        ) : (
          <>
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
                      onSaveToggle={handleSaveToggle}
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
                      onSaveToggle={handleSaveToggle}
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
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {renderPaginationButtons()}
                
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 