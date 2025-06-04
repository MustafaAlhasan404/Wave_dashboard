"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Edit, MoreVertical, RefreshCcw, Trash, Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";
import { NewsItem, newsApi } from "@/lib/api/news";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface NewsPostCardProps {
  post: NewsItem;
  onViewDetails?: () => void;
  onSaveToggle?: (id: string, saved: boolean) => void;
}

export function NewsPostCard({ post, onViewDetails, onSaveToggle }: NewsPostCardProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isSaved, setIsSaved] = useState(post.isSaved);
  const [isSaving, setIsSaving] = useState(false);

  const handleDelete = () => {
    setIsDeleting(true);
    
    // Simulate API call to delete post
    setTimeout(() => {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      toast.success("News post deleted successfully");
      // In a real app, you would refresh the data or update the UI
    }, 1000);
  };

  const handleResendToAI = () => {
    setIsResending(true);
    
    // Simulate API call to resend post to AI
    setTimeout(() => {
      setIsResending(false);
      toast.success("News post sent to AI for processing");
    }, 1500);
  };

  const handleSaveToggle = async () => {
    setIsSaving(true);
    try {
      const newSavedState = !isSaved;
      const response = await newsApi.saveNews(post.id, newSavedState);
      
      if (response.success) {
        setIsSaved(newSavedState);
        toast.success(newSavedState ? "News saved to your bookmarks" : "News removed from your bookmarks");
        if (onSaveToggle) {
          onSaveToggle(post.id, newSavedState);
        }
      } else {
        toast.error("Failed to update bookmark status");
      }
    } catch (error) {
      toast.error("An error occurred while updating bookmark status");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const formattedDate = post.publishedAt ? 
    formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true }) : 
    "Unknown date";

  const statusColor = {
    published: "default",
    draft: "outline",
    archived: "secondary"
  }[post.status] as "default" | "outline" | "secondary" | "destructive";

  // Function to determine credibility badge variant
  const getCredibilityBadgeVariant = () => {
    if (post.credibilityScore > 0.7) return "default";
    if (post.credibilityScore > 0.4) return "outline";
    return "destructive";
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{post.title}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <span className="text-xs">{formattedDate}</span>
                <span className="text-xs">•</span>
                <span className="text-xs">{post.category}</span>
                <span className="text-xs">•</span>
                <span className="text-xs">By {post.source.name}</span>
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleSaveToggle}
                disabled={isSaving}
                title={isSaved ? "Remove from bookmarks" : "Save to bookmarks"}
              >
                {isSaved ? (
                  <BookmarkCheck className="h-4 w-4" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {isSaved ? "Remove from bookmarks" : "Save to bookmarks"}
                </span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push(`/dashboard/news/${post.id}`)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleResendToAI()}>
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Resend to AI
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Badge variant={statusColor}>{post.status}</Badge>
            {post.fakeVoice && (
              <Badge variant="destructive">Fake Voice</Badge>
            )}
            <Badge variant={getCredibilityBadgeVariant()}>
              Score: {Math.round(post.credibilityScore * 100)}%
            </Badge>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-xs text-muted-foreground">
            Source: <span className="font-medium">{post.source.name}</span>
          </div>
          <Button variant="outline" size="sm" onClick={onViewDetails}>
            View Details
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete this post?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the news post.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 