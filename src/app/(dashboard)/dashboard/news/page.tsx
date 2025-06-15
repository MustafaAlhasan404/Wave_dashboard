"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NewsPostCard } from "@/components/news/news-post-card";
import { ArrowLeft, ChevronLeft, ChevronRight, Edit, Plus, RefreshCcw, Trash, LayoutGrid, List as ListIcon, InfoIcon, Users2, ShieldCheck, AlertCircle, Tag, GlobeIcon, ExternalLink, ImageIcon, Volume2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { NewsItem, NewsPaginationResponse, DeleteNewsResponse, newsApi } from "@/lib/api/news";
import { formatDistanceToNow } from "date-fns";
import { LoadingDots } from "@/components/ui/loading-dots";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function NewsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [audioFilter, setAudioFilter] = useState(false);
  const [selectedPost, setSelectedPost] = useState<NewsItem | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [posts, setPosts] = useState<NewsItem[]>([]);
  
  const router = useRouter();
  
  // Function to ensure image URL is properly formatted
  const getImageUrl = (url: string | null): string | null => {
    if (!url) return null; // Return null instead of empty string
    
    // If it's already an absolute URL, return it as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // If it's a relative URL, prepend the API base URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };
  
  // Listen for newsDeleted event
  useEffect(() => {
    const handleNewsDeleted = (e: any) => {
      const { id, data } = e.detail;
      console.log(`News deleted: ${id}`, data);
      
      // Remove the deleted post from the state
      setPosts(prevPosts => prevPosts.filter(post => post.id !== id));
      
      // If the deleted post is currently selected, close the detail view
      if (selectedPost && selectedPost.id === id) {
        setSelectedPost(null);
      }
    };
    
    window.addEventListener('newsDeleted', handleNewsDeleted);
    
    return () => {
      window.removeEventListener('newsDeleted', handleNewsDeleted);
    };
  }, [selectedPost]);
  
  // Fetch news posts with pagination and optional audio filter
  const fetchNews = async (page = currentPage) => {
    setIsLoading(true);
    setError(null);
    try {
      // Pass the audio filter parameter when it's enabled
      const response = await newsApi.getNews(page, 12, audioFilter ? true : undefined);
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

  useEffect(() => {
    fetchNews(currentPage);
  }, [currentPage, audioFilter]);

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

  const handleResendToAI = async () => {
    if (!selectedPost) return;
    
    setIsResending(true);
    
    try {
      const response = await newsApi.resendToAI(selectedPost.id);
      
      if (response.success) {
        toast.success(response.message || "News post sent to AI for processing");
      } else {
        toast.error(response.message || "Failed to send news post to AI");
      }
    } catch (error) {
      console.error("Error resending to AI:", error);
      toast.error("An error occurred while sending the news post to AI");
    } finally {
      setIsResending(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPost) return;
    
    setIsDeleting(true);
    
    try {
      const response = await newsApi.deleteNews(selectedPost.id);
      
      if (response.success) {
        // Log the deleted news data if available
        if (response.data && 'deletedNews' in response.data) {
          console.log("Deleted news data:", response.data.deletedNews);
        }
        
        toast.success(response.message || "News post deleted successfully");
        
        // Remove the deleted post from the list
        setPosts(prevPosts => prevPosts.filter(post => post.id !== selectedPost.id));
        
        // Close the detail view
        setSelectedPost(null);
      } else {
        toast.error(response.message || "Failed to delete news post");
      }
    } catch (error) {
      console.error("Error deleting news:", error);
      toast.error("An error occurred while deleting the news post");
    } finally {
      setIsDeleting(false);
    }
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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchNews();
      toast.success("News refreshed!");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 relative">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">News Management</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none"
          >
            <RefreshCcw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh News"}
          </button>
        </div>
      </div>

      {/* Floating News Post Details */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <Card className="w-full max-w-5xl border-border shadow-lg animate-in fade-in zoom-in-95 duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-5 lg:min-h-[600px]">
              {/* Left column with image and title */}
              <div className="lg:col-span-2 relative">
                {selectedPost.image ? (
                  <div className="relative w-full h-full min-h-[300px] lg:min-h-full">
                    <Image
                      src={getImageUrl(selectedPost.image) || '/placeholder-image.svg'}
                      alt={selectedPost.title}
                      fill
                      className="object-cover rounded-l-lg"
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                    
                    <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                      <h2 className="text-xl font-semibold text-white mb-2 line-clamp-3 drop-shadow-sm">
                        {selectedPost.title}
                      </h2>
                      <div className="flex items-center gap-2 text-xs text-white/80">
                        <span>{formattedDate(selectedPost.publishedAt)}</span>
                        <span>•</span>
                        <span>{selectedPost.category}</span>
                        <span>•</span>
                        <span>By {selectedPost.source.name}</span>
                      </div>
                    </div>
                    
                    <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                      <Badge 
                        variant="default"
                        className="text-xs font-medium shadow-sm px-2.5 py-0.5"
                      >
                        {selectedPost.status}
                      </Badge>
                      
                      {selectedPost.fakeVoice && (
                        <Badge variant="destructive" className="text-xs font-medium shadow-sm">
                          Fake Voice
                        </Badge>
                      )}
                      
                      {selectedPost.audio && (
                        <Badge variant="outline" className="text-xs font-medium shadow-sm bg-primary/20 text-primary border-primary/30 flex items-center gap-1">
                          <Volume2 className="h-3 w-3" />
                          Audio
                        </Badge>
                      )}
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={handleCloseDetails}
                      className="absolute top-4 left-4 z-10 rounded-full h-8 w-8 bg-white/90 hover:bg-white dark:bg-slate-800/90 dark:hover:bg-slate-800 transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span className="sr-only">Close</span>
                    </Button>
                  </div>
                ) : (
                  <div className="bg-muted h-full min-h-[300px] flex items-center justify-center relative">
                    <ImageIcon className="h-20 w-20 text-muted-foreground/30" />
                    
                    <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                      <Badge 
                        variant="default"
                        className="text-xs font-medium shadow-sm px-2.5 py-0.5"
                      >
                        {selectedPost.status}
                      </Badge>
                      
                      {selectedPost.fakeVoice && (
                        <Badge variant="destructive" className="text-xs font-medium shadow-sm">
                          Fake Voice
                        </Badge>
                      )}
                      
                      {selectedPost.audio && (
                        <Badge variant="outline" className="text-xs font-medium shadow-sm bg-primary/20 text-primary border-primary/30 flex items-center gap-1">
                          <Volume2 className="h-3 w-3" />
                          Audio
                        </Badge>
                      )}
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={handleCloseDetails}
                      className="absolute top-4 left-4 z-10 rounded-full h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span className="sr-only">Close</span>
                    </Button>
                    
                    <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                      <h2 className="text-xl font-semibold mb-2 line-clamp-3">
                        {selectedPost.title}
                      </h2>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formattedDate(selectedPost.publishedAt)}</span>
                        <span>•</span>
                        <span>{selectedPost.category}</span>
                        <span>•</span>
                        <span>By {selectedPost.source.name}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Right column with details */}
              <div className="lg:col-span-3 flex flex-col p-0">
                <div className="flex-1 p-5 pb-3 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div className="bg-muted/30 p-3 rounded-lg border border-border/40 hover:shadow-sm transition-shadow">
                      <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                        <Users2 className="h-3.5 w-3.5" />
                        Source
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="relative h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center">
                          {selectedPost.source.image ? (
                            <Image
                              src={selectedPost.source.image}
                              alt={selectedPost.source.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                              {selectedPost.source.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-medium">{selectedPost.source.name}</span>
                      </div>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-lg border border-border/40 hover:shadow-sm transition-shadow">
                      <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Credibility
                      </p>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium",
                          selectedPost.credibilityScore > 0.7 ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" :
                          selectedPost.credibilityScore > 0.4 ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" :
                          "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300"
                        )}>
                          {Math.round(selectedPost.credibilityScore * 100)}%
                        </div>
                      </div>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-lg border border-border/40 hover:shadow-sm transition-shadow">
                      <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5" />
                        Fake Voice
                      </p>
                      <p className={cn(
                        "text-sm font-medium",
                        selectedPost.fakeVoice ? "text-destructive" : "text-emerald-600 dark:text-emerald-500"
                      )}>
                        {selectedPost.fakeVoice ? "Detected" : "Not Detected"}
                      </p>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-lg border border-border/40 hover:shadow-sm transition-shadow">
                      <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                        <Tag className="h-3.5 w-3.5" />
                        Category
                      </p>
                      <p className="text-sm font-medium">{selectedPost.category}</p>
                    </div>
                    
                    {/* Add Audio News indicator if applicable */}
                    {selectedPost.audio && (
                      <div className="bg-muted/30 p-3 rounded-lg border border-border/40 hover:shadow-sm transition-shadow">
                        <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                          <Volume2 className="h-3.5 w-3.5" />
                          Audio News
                        </p>
                        <p className="text-sm font-medium text-primary">Available</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent my-5"></div>
                  
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <GlobeIcon className="h-4 w-4 text-primary" />
                    <span>Source Information</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/30 p-3 rounded-lg border border-border/40 hover:shadow-sm transition-shadow">
                      <p className="text-sm font-medium text-muted-foreground mb-1">Link</p>
                      <p className="text-sm break-all">
                        {selectedPost.source.link ? (
                          <a 
                            href={selectedPost.source.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            {selectedPost.source.link.length > 30 
                              ? selectedPost.source.link.substring(0, 30) + "..." 
                              : selectedPost.source.link}
                            <ExternalLink className="h-3 w-3 inline-block" />
                          </a>
                        ) : (
                          "No link available"
                        )}
                      </p>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-lg border border-border/40 hover:shadow-sm transition-shadow">
                      <p className="text-sm font-medium text-muted-foreground mb-1">Followers</p>
                      <p className="text-sm font-medium">
                        {selectedPost.source._count?.sourceFollowings || 0} followers
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-b from-transparent via-muted/5 to-muted/10 p-4 rounded-br-lg flex justify-between items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.push(`/dashboard/news/${selectedPost.id}`)}
                      className="h-8 gap-1.5"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleResendToAI}
                      disabled={isResending}
                      className="h-8 gap-1.5"
                    >
                      <RefreshCcw className={cn("h-3.5 w-3.5", isResending && "animate-spin")} />
                      <span>{isResending ? "Processing..." : "Resend to AI"}</span>
                    </Button>
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="h-8 gap-1.5"
                  >
                    <Trash className="h-3.5 w-3.5" />
                    <span>{isDeleting ? "Deleting..." : "Delete"}</span>
                  </Button>
                </div>
              </div>
            </div>
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
            
            <Button
              variant={audioFilter ? "default" : "outline"}
              className="flex items-center gap-2"
              onClick={() => setAudioFilter(!audioFilter)}
            >
              <Volume2 className="h-4 w-4" />
              {audioFilter ? "Audio News" : "All News"}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingDots size={10} color="#888" />
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
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