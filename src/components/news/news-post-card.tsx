"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Edit, MoreVertical, RefreshCcw, Trash, ImageIcon, ExternalLink, Calendar, Tag } from "lucide-react";
import { toast } from "sonner";
import { NewsItem, newsApi } from "@/lib/api/news";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface NewsPostCardProps {
  post: NewsItem;
  onViewDetails?: () => void;
}

export function NewsPostCard({ post, onViewDetails }: NewsPostCardProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    console.log(`Post ID: ${post.id}, Image URL: ${post.image}`);
  }, [post.id, post.image]);

  // Function to ensure image URL is properly formatted
  const getImageUrl = (url: string | null): string => {
    if (!url) return ''; // Return empty string instead of null
    
    // If it's already an absolute URL, return it as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // If it's a relative URL, prepend the API base URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://3819-185-107-56-150.ngrok-free.app';
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      const response = await newsApi.deleteNews(post.id);
      
      if (response.success) {
        // Log the deleted news data if available
        if (response.data && 'deletedNews' in response.data) {
          console.log("Deleted news data:", response.data.deletedNews);
        }
        
        setIsDeleteDialogOpen(false);
        toast.success(response.message || "News post deleted successfully");
        
        // Instead of forcing a page refresh, we can emit a custom event
        // that the parent component can listen for
        const deleteEvent = new CustomEvent('newsDeleted', { 
          detail: { 
            id: post.id,
            data: response.data && 'deletedNews' in response.data ? response.data.deletedNews : null
          } 
        });
        window.dispatchEvent(deleteEvent);
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

  const handleResendToAI = () => {
    setIsResending(true);
    
    // Simulate API call to resend post to AI
    setTimeout(() => {
      setIsResending(false);
      toast.success("News post sent to AI for processing");
    }, 1500);
  };



  const formattedDate = post.publishedAt ? 
    formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true }) : 
    "Unknown date";

  // Function to determine credibility badge variant and color
  const getCredibilityInfo = () => {
    if (post.credibilityScore > 0.7) {
      return {
        variant: "default",
        color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
      };
    }
    if (post.credibilityScore > 0.4) {
      return {
        variant: "outline",
        color: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
      };
    }
    return {
      variant: "destructive",
      color: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300"
    };
  };

  const credibilityInfo = getCredibilityInfo();

  return (
    <>
      <Card 
        className={cn(
          "overflow-hidden transition-all duration-300 group",
          "border-border/60 shadow-sm hover:shadow-md",
          "hover:border-primary/30",
          isHovered ? "translate-y-[-2px]" : "translate-y-0"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container with fixed aspect ratio */}
        <div className="relative w-full pt-[56.25%] overflow-hidden bg-slate-100 dark:bg-slate-800">
          {/* Top-right status badges */}
          <div className="absolute top-3 right-3 z-10 flex flex-wrap gap-1.5 max-w-[90%]">
            <Badge 
              variant={post.status === "published" ? "default" : post.status === "draft" ? "outline" : "secondary"}
              className="text-xs font-medium shadow-sm"
            >
              {post.status}
            </Badge>
          </div>



          {/* Image or placeholder */}
          {post.image && !imageError ? (
            <>
              <Image
                src={getImageUrl(post.image)}
                alt={post.title}
                fill
                className={cn(
                  "object-cover absolute inset-0 transition-transform duration-700",
                  isHovered ? "scale-105" : "scale-100"
                )}
                onError={() => setImageError(true)}
                priority={true}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <ImageIcon className="h-16 w-16 text-slate-300 dark:text-slate-600" />
              {imageError && <p className="absolute bottom-3 text-xs text-slate-500 dark:text-slate-400">Failed to load image</p>}
            </div>
          )}
        </div>

        <CardHeader className="px-6 pt-5 pb-0">
          <CardTitle className="text-xl font-semibold leading-tight mb-2 line-clamp-2">
            {post.title}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="px-6 py-4">
          {/* Metadata row */}
          <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span className="text-xs">{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" />
              <span className="text-xs">{post.category}</span>
            </div>
          </div>
          
          {/* Source and score */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="relative h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  {post.source.name.charAt(0)}
                </span>
              </div>
              <span className="text-sm font-medium">{post.source.name}</span>
            </div>
            
            <div className={cn(
              "px-2.5 py-1 rounded-full text-xs font-medium",
              credibilityInfo.color
            )}>
              Score: {Math.round(post.credibilityScore * 100)}%
            </div>
          </div>
          
          {/* Warning badges */}
          {post.fakeVoice && (
            <div className="mt-3">
              <Badge variant="destructive" className="text-xs">
                Fake Voice Detected
              </Badge>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="px-6 py-4 flex justify-between items-center border-t border-border/30">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-muted-foreground hover:text-foreground"
              >
                <MoreVertical className="h-4 w-4 mr-1" />
                <span>Options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem 
                onClick={() => router.push(`/dashboard/news/${post.id}`)}
                className="cursor-pointer"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleResendToAI}
                className="cursor-pointer"
                disabled={isResending}
              >
                <RefreshCcw className={cn("mr-2 h-4 w-4", isResending && "animate-spin")} />
                {isResending ? "Processing..." : "Resend to AI"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setIsDeleteDialogOpen(true)}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            onClick={onViewDetails} 
            variant="default" 
            size="sm" 
            className={cn(
              "transition-all duration-300 gap-1.5",
              isHovered ? "bg-primary hover:bg-primary/90" : ""
            )}
          >
            <span>View Details</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete News Post</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the news post.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 mt-2 border rounded-md bg-destructive/5 border-destructive/20">
            <h4 className="font-medium text-sm">{post.title}</h4>
            <p className="text-xs text-muted-foreground mt-1">{post.source.name} • {formattedDate}</p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
              className="mt-2 sm:mt-0"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className={isDeleting ? "opacity-80" : ""}
            >
              {isDeleting ? "Deleting..." : "Delete Post"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 