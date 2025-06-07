"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { RefreshCcw, ArrowLeft, Upload, X, ImageIcon, Camera, Eye } from "lucide-react";
import { newsApi } from "@/lib/api/news";
import { cn } from "@/lib/utils";

interface NewsFormProps {
  initialData?: any;
  isEditing?: boolean;
  onEditComplete?: () => void;
  onBack?: () => void;
}

export function NewsForm({
  initialData,
  isEditing = false,
  onEditComplete,
  onBack,
}: NewsFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isResendingToAI, setIsResendingToAI] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    link: initialData?.link || "",
    content: initialData?.content || "",
    category: initialData?.category || "Technology",
    status: initialData?.status || "draft",
    credibilityScore: initialData?.credibilityScore || 70,
    keywords: initialData?.keywords || [],
    fakeVoice: initialData?.fakeVoice || false,
  });

  // Add a separate state for the raw keywords input
  const [keywordsInput, setKeywordsInput] = useState(
    Array.isArray(initialData?.keywords) ? initialData.keywords.join(', ') : ''
  );

  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.image || null
  );
  const [isDragging, setIsDragging] = useState(false);
  
  // Add state to track form stage: 1 = Edit Form, 2 = Preview
  const [formStage, setFormStage] = useState(1);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: parseFloat(value) }));
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

  const handleFakeVoiceChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      fakeVoice: checked,
    }));
  };

  const handleKeywordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keywordsText = e.target.value;
    
    // Update the raw input state
    setKeywordsInput(keywordsText);
    
    // Store the raw input text as is, allowing commas
    setFormData(prev => ({
      ...prev,
      // Split by comma, trim whitespace, and filter empty strings
      keywords: keywordsText.split(',')
        .map(keyword => keyword.trim())
        .filter(keyword => keyword !== '')
    }));
  };

  const handleCancel = () => {
    if (onBack) {
      onBack();
    } else {
      router.push("/dashboard/news");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let response;

      if (isEditing && initialData?.id) {
        response = await newsApi.editNews(initialData.id, formData);
      } else {
        response = await newsApi.createNews(formData);
      }

      if (response.success) {
        toast.success(
          isEditing
            ? "News post updated successfully!"
            : "News post created successfully!"
        );
        if (onEditComplete) {
          onEditComplete();
        } else {
          router.push("/dashboard/news");
        }
      } else {
        toast.error(response.message || "An error occurred");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An error occurred while saving the news post");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendToAI = () => {
    // Implementation for AI resend
    setIsResendingToAI(true);
    
    // Simulate API call for now
    setTimeout(() => {
      setIsResendingToAI(false);
      toast.success("News post sent to AI for processing");
    }, 1500);
  };

  // Function to get image URL with proper base URL
  const getImageUrl = (url: string | null): string => {
    if (!url) return '';
    
    // Handle image preview from local object URL
    if (url.startsWith('blob:')) {
      return url;
    }
    
    // Handle simulated direct-upload paths
    if (url.startsWith('/uploads/news/')) {
      // For now, use a placeholder image since these are simulated paths
      return 'https://via.placeholder.com/800x400?text=Simulated+Upload';
    }
    
    // Handle placeholder.com URLs which are already absolute
    if (url.startsWith('https://via.placeholder.com/')) {
      return url;
    }
    
    // Handle Google Drive URLs
    if (url.includes('drive.google.com')) {
      return url;
    }
    
    // Handle absolute URLs
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Handle relative paths from the API
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://3819-185-107-56-150.ngrok-free.app';
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  // Image upload handlers
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    await uploadImage(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }
    
    await uploadImage(file);
  };

  const uploadImage = async (file: File) => {
    if (!isEditing || !initialData?.id) {
      // For new posts, store the file and upload after post creation
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
      toast.info("Image will be uploaded when you save the post");
      return;
    }
    
    setIsUploadingImage(true);
    
    try {
      const response = await newsApi.uploadNewsImage(initialData.id, file);
      
      if (response.success) {
        let imageUrl = null;
        
        // Handle both response formats: { image } or { imageUrl }
        if (response.data?.image) {
          imageUrl = getImageUrl(response.data.image);
        } else if (response.data?.imageUrl) {
          imageUrl = getImageUrl(response.data.imageUrl);
        }
        
        if (imageUrl) {
          setImagePreview(imageUrl);
          toast.success("Image uploaded successfully");
        } else {
          toast.warning("Image uploaded but no URL was returned");
          if (initialData?.image) {
            setImagePreview(initialData.image);
          }
        }
      } else {
        toast.error(response.message || "Failed to upload image");
        // Keep existing image if upload failed
        if (initialData?.image) {
          setImagePreview(initialData.image);
        }
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("An error occurred while uploading the image");
      // Keep existing image if upload failed
      if (initialData?.image) {
        setImagePreview(initialData.image);
      }
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const categories = [
    "Technology",
    "Business",
    "Science",
    "Health",
    "Entertainment",
    "Sports",
    "Politics",
    "World",
    "Other"
  ];

  // Join keywords with commas and spaces for display in the input field
  const keywordsString = Array.isArray(formData.keywords) 
    ? formData.keywords.join(', ')
    : '';

  // Character limits
  const TITLE_LIMIT = 120;
  const CONTENT_LIMIT = 2000;

  // Helper for counters
  const titleCount = formData.title.length;
  const contentCount = formData.content.length;

  // Tooltip helpers
  const credibilityTooltip = "Score from 0 to 1 based on our model's analysis";
  const fakeVoiceTooltip = "Whether a synthetic voice was detected";

  // Stage navigation handlers
  const goToPreview = () => {
    window.scrollTo(0, 0);
    setFormStage(2);
  };

  const goToEdit = () => {
    window.scrollTo(0, 0);
    setFormStage(1);
  };

  // Responsive grid: 2 columns on md+, stacked on mobile
  return (
    <form onSubmit={handleSubmit} className="w-full font-sans">
      {formStage === 1 ? (
        // Stage 1: Edit Form
        <Card className="shadow-lg border border-muted/40 bg-background/90 rounded-2xl">
          <CardHeader className="pb-2 border-b border-muted/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {onBack && (
                  <Button 
                    variant="ghost" 
                    onClick={onBack}
                    className="h-8 w-8 p-0"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                  </Button>
                )}
                <CardTitle className="text-2xl font-bold tracking-tight">
                  {isEditing ? "Edit News Post" : "Create News Post"}
                </CardTitle>
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={goToPreview}
                disabled={isLoading || titleCount > TITLE_LIMIT || contentCount > CONTENT_LIMIT || !formData.title}
                className="flex items-center gap-2 text-primary hover:text-primary/80 hover:bg-primary/10"
              >
                <Eye className="h-4 w-4" />
                <span>Preview</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="py-8 px-2 md:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* LEFT COLUMN: Image, Title, Link */}
              <div className="flex flex-col gap-8">
                {/* Image Upload */}
                <div className="space-y-2">
                  <Label className="text-sm font-bold">News Image</Label>
                  <div 
                    className={cn(
                      "border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-muted/10 shadow-sm",
                      isDragging ? "border-primary bg-primary/10" : "border-muted-foreground/25 hover:border-primary/50",
                      isUploadingImage && "opacity-70 pointer-events-none"
                    )}
                    onClick={handleImageClick}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    style={{ minHeight: "200px" }}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleImageChange}
                      disabled={isUploadingImage}
                    />
                    {imagePreview ? (
                      <div className="relative w-full h-48 rounded-lg overflow-hidden">
                        <Image 
                          src={getImageUrl(imagePreview)}
                          alt="News image preview" 
                          fill
                          className="object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-90 hover:opacity-100 shadow-md"
                          onClick={e => { e.stopPropagation(); handleRemoveImage(); }}
                          disabled={isUploadingImage}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Remove image</span>
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground py-8">
                        {isUploadingImage ? (
                          <>
                            <RefreshCcw className="h-10 w-10 animate-spin text-primary/70" />
                            <p className="text-sm font-medium">Uploading image...</p>
                          </>
                        ) : (
                          <>
                            <Camera className="h-10 w-10 opacity-50" />
                            <p className="text-sm font-medium">Click or drag and drop to upload image</p>
                            <p className="text-xs opacity-70">Max 10MB, PNG, JPG, GIF</p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {/* Title */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="title" className="text-sm font-bold">Title</Label>
                    <span className={`text-xs ${titleCount > TITLE_LIMIT ? 'text-red-500' : 'text-muted-foreground'}`}>{titleCount}/{TITLE_LIMIT}</span>
                  </div>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Enter post title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    maxLength={TITLE_LIMIT}
                    className="rounded-lg bg-background/80 border border-muted/30 focus:border-primary text-base"
                  />
                </div>
                {/* Link */}
                <div className="space-y-1">
                  <Label htmlFor="link" className="text-sm font-bold">Link</Label>
                  <Input
                    id="link"
                    name="link"
                    placeholder="Enter news source link (https://...)"
                    value={formData.link}
                    onChange={handleChange}
                    type="url"
                    className="rounded-lg bg-background/80 border border-muted/30 focus:border-primary text-base"
                  />
                </div>
              </div>
              {/* RIGHT COLUMN: Content, Keywords, Metadata */}
              <div className="flex flex-col gap-8">
                {/* Content */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="content" className="text-sm font-bold">Content</Label>
                    <span className={`text-xs ${contentCount > CONTENT_LIMIT ? 'text-red-500' : 'text-muted-foreground'}`}>{contentCount}/{CONTENT_LIMIT}</span>
                  </div>
                  <Textarea
                    id="content"
                    name="content"
                    placeholder="Enter post content"
                    value={formData.content}
                    onChange={handleChange}
                    rows={6}
                    maxLength={CONTENT_LIMIT}
                    className="rounded-lg bg-background/80 border border-muted/30 focus:border-primary text-base"
                  />
                </div>
                {/* Keywords */}
                <div className="space-y-1">
                  <Label htmlFor="keywords" className="text-sm font-bold">Keywords <span className="text-xs font-normal text-muted-foreground">(comma separated)</span></Label>
                  <Input
                    id="keywords"
                    name="keywords"
                    placeholder="e.g. news, technology, AI"
                    value={keywordsInput}
                    onChange={handleKeywordsChange}
                    className="rounded-lg bg-background/80 border border-muted/30 focus:border-primary text-base"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Type keywords separated by commas (,)</p>
                </div>
                {/* Metadata Group */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-muted/10 rounded-xl p-4 shadow-sm mt-2">
                  {/* Category */}
                  <div className="space-y-1">
                    <Label htmlFor="category" className="text-sm font-bold">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={value => handleSelectChange("category", value)}
                    >
                      <SelectTrigger id="category" className="rounded-lg bg-background/80 border border-muted/30 focus:border-primary text-base">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Credibility Score with Tooltip */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <Label htmlFor="credibilityScore" className="text-sm font-bold" title={credibilityTooltip}>Credibility Score</Label>
                    </div>
                    <Input
                      id="credibilityScore"
                      name="credibilityScore"
                      type="number"
                      min="0"
                      max="1"
                      step="0.01"
                      value={formData.credibilityScore}
                      onChange={handleNumberChange}
                      className="rounded-lg bg-background/80 border border-muted/30 focus:border-primary text-base"
                    />
                  </div>
                  {/* Status Switch */}
                  <div className="space-y-1">
                    <Label htmlFor="status" className="text-sm font-bold">Status</Label>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="status"
                        checked={formData.status === "published"}
                        onCheckedChange={handleStatusChange}
                        className={formData.status === "published" ? "bg-green-600" : "bg-muted-foreground/30"}
                      />
                      <span className={formData.status === "published" ? "text-green-400" : "text-muted-foreground"}>
                        {formData.status === "published" ? "Published" : "Draft"}
                      </span>
                    </div>
                  </div>
                  {/* Fake Voice Switch with Tooltip */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <Label htmlFor="fakeVoice" className="text-sm font-bold" title={fakeVoiceTooltip}>Fake Voice</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="fakeVoice"
                        checked={formData.fakeVoice}
                        onCheckedChange={handleFakeVoiceChange}
                        className={formData.fakeVoice ? "bg-green-600" : "bg-muted-foreground/30"}
                      />
                      <span className={formData.fakeVoice ? "text-green-400" : "text-muted-foreground"}>
                        {formData.fakeVoice ? "Detected" : "Not Detected"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col md:flex-row gap-4 justify-center md:justify-between border-t border-muted/20 p-6 bg-background/95 rounded-b-2xl">
            <div className="flex-1 flex justify-center md:justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="w-32 h-12 rounded-lg text-base font-semibold border-muted/40"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || titleCount > TITLE_LIMIT || contentCount > CONTENT_LIMIT || !formData.title}
                className="w-32 h-12 rounded-lg text-base font-semibold bg-slate-800 hover:bg-slate-700 text-white shadow-md border border-slate-700"
              >
                {isLoading
                  ? isEditing
                    ? "Updating..."
                    : "Creating..."
                  : isEditing
                  ? "Update Post"
                  : "Create Post"}
              </Button>
            </div>
          </CardFooter>
        </Card>
      ) : (
        // Stage 2: Preview
        <div className="space-y-6">
          <Card className="shadow-lg border border-muted/40 bg-background/90 rounded-2xl">
            <CardHeader className="pb-2 border-b border-muted/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button 
                    variant="ghost" 
                    onClick={goToEdit}
                    className="h-8 w-8 p-0"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back to Edit</span>
                  </Button>
                  <CardTitle className="text-2xl font-bold tracking-tight">
                    Preview
                  </CardTitle>
                </div>
                <div className="text-sm text-muted-foreground">
                  {formData.status === "published" ? (
                    <span className="text-green-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-400"></span> 
                      Published
                    </span>
                  ) : (
                    <span className="text-muted-foreground flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-muted-foreground"></span> 
                      Draft
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="py-8 px-2 md:px-8">
              <div className="max-w-4xl mx-auto">
                {/* Article Preview */}
                <div className="space-y-8">
                  {/* Header */}
                  <div className="space-y-4">
                    <h1 className="text-3xl font-bold leading-tight">{formData.title}</h1>
                    {formData.link && (
                      <div>
                        <a 
                          href={formData.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1 text-sm"
                        >
                          {formData.link}
                        </a>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="px-2 py-1 bg-muted/40 rounded-lg text-sm">{formData.category}</span>
                      <span className="px-2 py-1 bg-muted/40 rounded-lg text-sm">Score: {formData.credibilityScore}</span>
                      {formData.fakeVoice && (
                        <span className="px-2 py-1 bg-yellow-700/30 text-yellow-400 rounded-lg text-sm">Fake Voice Detected</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Featured Image */}
                  {imagePreview && (
                    <div className="relative w-full h-[300px] md:h-[400px] rounded-xl overflow-hidden shadow-md">
                      <Image 
                        src={getImageUrl(imagePreview)} 
                        alt={formData.title} 
                        fill 
                        className="object-cover" 
                      />
                    </div>
                  )}
                  
                  {/* Content */}
                  <div className="prose prose-invert max-w-none">
                    <p className="whitespace-pre-line">{formData.content}</p>
                  </div>
                  
                  {/* Keywords */}
                  {formData.keywords && formData.keywords.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-muted-foreground">Keywords</h3>
                      <div className="flex flex-wrap gap-2">
                        {formData.keywords.map((kw: string, i: number) => (
                          <span key={i} className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col md:flex-row gap-4 justify-center md:justify-between border-t border-muted/20 p-6 bg-background/95 rounded-b-2xl">
              <div className="flex-1 flex justify-center md:justify-between gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={goToEdit}
                  className="w-32 h-12 rounded-lg text-base font-semibold border-muted/40"
                >
                  Back to Edit
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-32 h-12 rounded-lg text-base font-semibold bg-slate-800 hover:bg-slate-700 text-white shadow-md border border-slate-700"
                >
                  {isLoading
                    ? isEditing
                      ? "Updating..."
                      : "Creating..."
                    : isEditing
                    ? "Update Post"
                    : "Create Post"}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      )}
    </form>
  );
} 