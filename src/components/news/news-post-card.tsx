"use client";

import { useState } from "react";
import Link from "next/link";
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
import { Edit, MoreVertical, RefreshCcw, Trash } from "lucide-react";
import { toast } from "sonner";

interface NewsPostCardProps {
  post: {
    id: string;
    title: string;
    excerpt: string;
    content: string;
    author: string;
    date: string;
    category: string;
    status: "published" | "draft";
  };
  onViewDetails?: () => void;
}

export function NewsPostCard({ post, onViewDetails }: NewsPostCardProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResending, setIsResending] = useState(false);

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

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{post.title}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <span className="text-xs">{post.date}</span>
                <span className="text-xs">•</span>
                <span className="text-xs">{post.category}</span>
                <span className="text-xs">•</span>
                <span className="text-xs">By {post.author}</span>
              </CardDescription>
            </div>
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
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-xs text-muted-foreground">
            Status: <span className="font-medium capitalize">{post.status}</span>
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