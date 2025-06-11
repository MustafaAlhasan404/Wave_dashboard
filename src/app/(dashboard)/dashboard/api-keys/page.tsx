"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Check, 
  Copy, 
  Key, 
  Plus, 
  RefreshCcw, 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  MoreVertical,
  Clock,
  Calendar,
  Activity
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiKeysService, ApiKey } from "@/lib/api/apikeys-service";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { LoadingDots } from "@/components/ui/loading-dots";

export default function ApiKeysPage() {
  const router = useRouter();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newAppName, setNewAppName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch API keys
  const fetchApiKeys = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiKeysService.getApiKeys();
      setApiKeys(data.apiKeys || []);
    } catch (error) {
      console.error("Failed to fetch API keys:", error);
      setError("Failed to load API keys");
      toast.error("Failed to load API keys");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    fetchApiKeys();
  }, []);
  
  // Handle toggling API key status
  const handleToggleStatus = async (key: string) => {
    try {
      setIsUpdating(key);
      await apiKeysService.toggleApiKeyStatus(key);
      await fetchApiKeys(); // Refresh the list after toggling
      toast.success("API key status updated successfully");
    } catch (error) {
      console.error("Failed to toggle API key status:", error);
      toast.error("Failed to update API key status");
    } finally {
      setIsUpdating(null);
    }
  };
  
  // Handle creating a new API key
  const handleCreateApiKey = async () => {
    if (!newAppName.trim()) {
      toast.error("App name is required");
      return;
    }
    
    try {
      setIsCreating(true);
      await apiKeysService.createApiKey({ appName: newAppName.trim() });
      await fetchApiKeys(); // Refresh the list after creating
      setIsCreateDialogOpen(false);
      setNewAppName("");
      toast.success("API key created successfully");
    } catch (error) {
      console.error("Failed to create API key:", error);
      toast.error("Failed to create API key");
    } finally {
      setIsCreating(false);
    }
  };
  
  // Copy API key to clipboard
  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    toast.success("API key copied to clipboard");
    
    // Reset after 2 seconds
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchApiKeys();
      toast.success("API keys refreshed!");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Format relative date
  const formatRelativeDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };
  
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">API Keys</h1>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
            className="h-9 px-3 gap-1.5 border-border/60 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <RefreshCcw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </Button>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                size="sm"
                className="h-9 px-4 gap-1.5 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <Plus className="h-4 w-4" />
                <span>New API Key</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create new API key</DialogTitle>
                <DialogDescription>
                  Create a new API key to authenticate your applications.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="appName" className="text-sm font-medium">
                    Application Name
                  </label>
                  <Input
                    id="appName"
                    placeholder="Enter application name"
                    value={newAppName}
                    onChange={(e) => setNewAppName(e.target.value)}
                    disabled={isCreating}
                    className="border-border/60"
                  />
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={isCreating}
                  className="border-border/60"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateApiKey}
                  disabled={isCreating || !newAppName.trim()}
                  className="gap-1.5"
                >
                  {isCreating ? (
                    <>
                      <LoadingDots size={4} color="currentColor" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Key className="h-3.5 w-3.5" />
                      Create API Key
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center p-12">
          <LoadingDots size={6} color="currentColor" />
        </div>
      ) : error ? (
        <Card className="border-border/60 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            <ShieldAlert className="h-12 w-12 text-destructive mb-4" />
            <CardTitle className="text-lg mb-2">Failed to load API keys</CardTitle>
            <CardDescription>{error}</CardDescription>
            <Button
              variant="outline"
              onClick={handleRefresh}
              className="mt-4 border-border/60"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : apiKeys.length === 0 ? (
        <Card className="border-border/60 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <Key className="h-12 w-12 text-muted-foreground/60 mb-4" />
            <CardTitle className="text-lg mb-2">No API keys found</CardTitle>
            <CardDescription>
              You haven't created any API keys yet. Create your first API key to get started.
            </CardDescription>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="mt-6 gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Create API Key
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {apiKeys.map((apiKey) => (
            <Card 
              key={apiKey.key} 
              className="overflow-hidden transition-all duration-300 group border-border/60 shadow-sm hover:shadow-md hover:border-primary/30 hover:translate-y-[-2px]"
            >
              <CardHeader className="px-6 pt-5 pb-0 relative">
                <div className="absolute top-3 right-3 z-10">
                  <Badge 
                    variant={apiKey.isActive ? "default" : "outline"}
                    className={cn(
                      "text-xs font-medium shadow-sm",
                      apiKey.isActive 
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" 
                        : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                    )}
                  >
                    {apiKey.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-semibold leading-tight mb-2 line-clamp-2 flex items-center gap-2">
                  <Key className="h-5 w-5 flex-shrink-0" />
                  {apiKey.appName}
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {apiKey.key}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="px-6 py-4">
                <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Created: {formatRelativeDate(apiKey.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Last used: {formatRelativeDate(apiKey.lastUsedAt)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5" />
                    <span>Usage: {0} requests</span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="px-6 py-4 pt-0 flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 border-border/60 shadow-sm"
                  onClick={() => copyToClipboard(apiKey.key)}
                >
                  {copiedKey === apiKey.key ? (
                    <>
                      <Check className="h-3.5 w-3.5 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-9 px-2">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={() => handleToggleStatus(apiKey.key)}
                      disabled={isUpdating === apiKey.key}
                      className="gap-2"
                    >
                      {isUpdating === apiKey.key ? (
                        <>
                          <LoadingDots size={4} color="currentColor" />
                          Updating...
                        </>
                      ) : apiKey.isActive ? (
                        <>
                          <ShieldAlert className="h-4 w-4" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-4 w-4" />
                          Activate
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => copyToClipboard(apiKey.key)}
                      className="gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Copy API Key
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 