"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { RefreshCcw } from "lucide-react";

interface NewsFormProps {
  initialData?: {
    id?: string;
    title: string;
    excerpt: string;
    content: string;
    category: string;
    status: "published" | "draft";
  };
  isEditing?: boolean;
}

export function NewsForm({ initialData, isEditing = false }: NewsFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isResendingToAI, setIsResendingToAI] = useState(false);
  
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    excerpt: initialData?.excerpt || "",
    content: initialData?.content || "",
    category: initialData?.category || "Announcements",
    status: initialData?.status || "draft",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      status: checked ? "published" : "draft",
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call to save post
    setTimeout(() => {
      setIsLoading(false);
      toast.success(
        isEditing ? "News post updated successfully" : "News post created successfully"
      );
      router.push("/dashboard/news");
    }, 1000);
  };

  const handleResendToAI = () => {
    setIsResendingToAI(true);
    
    // Simulate API call to resend post to AI
    setTimeout(() => {
      setIsResendingToAI(false);
      toast.success("Content sent to AI for processing");
      
      // Simulate AI response
      setTimeout(() => {
        setFormData((prev) => ({
          ...prev,
          content: prev.content + "\n\nAI-enhanced content: This is a simulation of AI-enhanced content that would be generated based on your original text.",
        }));
        toast.success("AI processing complete");
      }, 2000);
    }, 1500);
  };

  const categories = [
    "Announcements",
    "Product Updates",
    "Best Practices",
    "Guides",
    "Case Studies",
    "News",
  ];

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit News Post" : "Create News Post"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Enter post title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              name="excerpt"
              placeholder="Enter a brief excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              required
              className="resize-none h-20"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="content">Content</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResendToAI}
                disabled={isResendingToAI}
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                {isResendingToAI ? "Processing..." : "Send to AI"}
              </Button>
            </div>
            <Textarea
              id="content"
              name="content"
              placeholder="Enter post content"
              value={formData.content}
              onChange={handleChange}
              required
              className="resize-none h-64"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleSelectChange("category", value)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <div className="flex items-center gap-2">
                <Switch
                  id="status"
                  checked={formData.status === "published"}
                  onCheckedChange={handleStatusChange}
                />
                <span>{formData.status === "published" ? "Published" : "Draft"}</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/news")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? isEditing
                ? "Updating..."
                : "Creating..."
              : isEditing
              ? "Update Post"
              : "Create Post"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
} 