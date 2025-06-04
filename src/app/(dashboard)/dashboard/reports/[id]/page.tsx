"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Check, Flag, RefreshCcw, X, User, Calendar, AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Report, reportsApi } from "@/lib/api/reports";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Create a client component that uses useSearchParams
function ReportDetailContent({ reportId }: { reportId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [selectedStatus, setSelectedStatus] = useState<Report['status'] | ''>('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setIsLoading(true);
        const response = await reportsApi.getReportById(reportId);
        
        if (response.success && response.data) {
          setReport(response.data.report);
        } else {
          toast.error("Failed to load report details");
        }
      } catch (error) {
        console.error("Error fetching report:", error);
        toast.error("Failed to load report details");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReport();
  }, [reportId]);

  const handleBack = () => {
    // Get the filter parameters from the URL
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    
    // Build the URL with preserved filters
    const params = new URLSearchParams();
    if (search) {
      params.set("search", search);
    }
    if (status) {
      params.set("status", status);
    }
    
    // Navigate back to reports list with filters
    const queryString = params.toString();
    const url = `/dashboard/reports${queryString ? `?${queryString}` : ''}`;
    router.push(url);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStatusUpdate = async () => {
    if (!selectedStatus || !report) return;
    
    try {
      setIsProcessing(true);
      const response = await reportsApi.updateReportStatus(report.id, selectedStatus);
      
      if (response.success) {
        toast.success("Report status updated successfully");
        // Update the report object with the new status
        setReport({
          ...report,
          status: selectedStatus
        });
        // Reset the selected status
        setSelectedStatus('');
      } else {
        toast.error("Failed to update report status");
      }
    } catch (error) {
      console.error("Error updating report status:", error);
      toast.error("An error occurred while updating the status");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteReport = async () => {
    if (!report) return;
    
    try {
      setIsDeleting(true);
      const response = await reportsApi.deleteReport(report.id);
      
      if (response.success) {
        toast.success("Report deleted successfully");
        // Navigate back to reports list
        handleBack();
      } else {
        toast.error("Failed to delete report");
        setIsDeleting(false);
      }
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.error("An error occurred while deleting the report");
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" disabled>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertTriangle className="h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-medium">Report Not Found</h3>
        <p className="text-muted-foreground text-center max-w-sm mt-2">
          The report you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <Button className="mt-6" onClick={handleBack}>
          Back to Reports
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the report 
              {report && ` #${report.id.substring(0, 8)}`}.
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
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.preventDefault();
                handleDeleteReport();
              }}
              disabled={isDeleting}
              variant="destructive"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Report Details</h1>
            <p className="text-sm text-muted-foreground">
              ID: {report.id}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge 
            className={`${reportsApi.getStatusColor(report.status)} border px-3 py-1.5 text-sm font-medium`}
            style={{
              borderColor: report.status === 'PENDING' ? '#d97706' : 
                          report.status === 'IN_REVIEW' ? '#2563eb' : 
                          report.status === 'RESOLVED' ? '#16a34a' : 
                          report.status === 'DISMISSED' ? '#6b7280' : 
                          report.status === 'ACTION_TAKEN' ? '#dc2626' : '#6b7280'
            }}
          >
            {reportsApi.getStatusLabel(report.status)}
          </Badge>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => setIsDeleteDialogOpen(true)}
            disabled={isDeleting}
            className="flex items-center gap-1.5 px-4 h-9"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            <span>Delete</span>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="reviewers">Reviewers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Report Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium mb-1">Report Type</h3>
                  <p className="text-sm text-muted-foreground">
                    {reportsApi.getReportTypeLabel(report.type)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">Status</h3>
                  <Badge className={reportsApi.getStatusColor(report.status)}>
                    {reportsApi.getStatusLabel(report.status)}
                  </Badge>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-1">Date Reported</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(report.createdAt)}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-1">Associated Content ID</h3>
                <p className="text-sm text-muted-foreground font-mono">
                  {report.newsId}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-1">Report Message</h3>
                <Card className="bg-muted/30">
                  <CardContent className="p-4">
                    <p className="text-sm whitespace-pre-wrap">{report.message}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="text-sm font-medium mb-3">Update Status</h3>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  <Button
                    variant={report.status === 'PENDING' || selectedStatus === 'PENDING' ? "default" : "outline"}
                    size="default"
                    className={`h-10 font-medium ${report.status === 'PENDING' || selectedStatus === 'PENDING'
                      ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300" 
                      : "hover:bg-yellow-50 hover:border-yellow-300"}`}
                    onClick={() => setSelectedStatus('PENDING')}
                    disabled={report.status === 'PENDING' || isProcessing}
                  >
                    Pending
                  </Button>
                  <Button
                    variant={report.status === 'IN_REVIEW' || selectedStatus === 'IN_REVIEW' ? "default" : "outline"}
                    size="default"
                    className={`h-10 font-medium ${report.status === 'IN_REVIEW' || selectedStatus === 'IN_REVIEW'
                      ? "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300" 
                      : "hover:bg-blue-50 hover:border-blue-300"}`}
                    onClick={() => setSelectedStatus('IN_REVIEW')}
                    disabled={report.status === 'IN_REVIEW' || isProcessing}
                  >
                    In Review
                  </Button>
                  <Button
                    variant={report.status === 'RESOLVED' || selectedStatus === 'RESOLVED' ? "default" : "outline"}
                    size="default"
                    className={`h-10 font-medium ${report.status === 'RESOLVED' || selectedStatus === 'RESOLVED'
                      ? "bg-green-100 text-green-800 hover:bg-green-200 border-green-300" 
                      : "hover:bg-green-50 hover:border-green-300"}`}
                    onClick={() => setSelectedStatus('RESOLVED')}
                    disabled={report.status === 'RESOLVED' || isProcessing}
                  >
                    Resolved
                  </Button>
                  <Button
                    variant={report.status === 'DISMISSED' || selectedStatus === 'DISMISSED' ? "default" : "outline"}
                    size="default"
                    className={`h-10 font-medium ${report.status === 'DISMISSED' || selectedStatus === 'DISMISSED'
                      ? "bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-300" 
                      : "hover:bg-gray-50 hover:border-gray-300"}`}
                    onClick={() => setSelectedStatus('DISMISSED')}
                    disabled={report.status === 'DISMISSED' || isProcessing}
                  >
                    Dismissed
                  </Button>
                  <Button
                    variant={report.status === 'ACTION_TAKEN' || selectedStatus === 'ACTION_TAKEN' ? "default" : "outline"}
                    size="default"
                    className={`h-10 font-medium ${report.status === 'ACTION_TAKEN' || selectedStatus === 'ACTION_TAKEN'
                      ? "bg-red-100 text-red-800 hover:bg-red-200 border-red-300" 
                      : "hover:bg-red-50 hover:border-red-300"}`}
                    onClick={() => setSelectedStatus('ACTION_TAKEN')}
                    disabled={report.status === 'ACTION_TAKEN' || isProcessing}
                  >
                    Action Taken
                  </Button>
                </div>
                
                {selectedStatus && selectedStatus !== report.status && (
                  <div className="mt-4 flex items-center gap-3 pt-4 bg-muted/30 p-3 rounded-md">
                    <div className="text-sm flex-1">
                      Change status from <Badge className={`${reportsApi.getStatusColor(report.status)} ml-1 mr-1`}>{reportsApi.getStatusLabel(report.status)}</Badge> to <Badge className={`${reportsApi.getStatusColor(selectedStatus)} ml-1`}>{reportsApi.getStatusLabel(selectedStatus)}</Badge>
                    </div>
                    <Button 
                      onClick={handleStatusUpdate} 
                      disabled={isProcessing}
                      size="default"
                      className="h-10"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Confirm'
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="default" 
                      onClick={() => setSelectedStatus('')}
                      disabled={isProcessing}
                      className="h-10"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reviewers" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Reviewers</CardTitle>
              <CardDescription>
                People who have reviewed this report
              </CardDescription>
            </CardHeader>
            <CardContent>
              {report.reviewers && report.reviewers.length > 0 ? (
                <div className="space-y-4">
                  {report.reviewers.map((reviewer) => (
                    <div key={reviewer.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50">
                      <Avatar>
                        <AvatarFallback>{reviewer.username.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{reviewer.username}</p>
                        <p className="text-sm text-muted-foreground">{reviewer.email}</p>
              </div>
              <div>
                        {reviewer.roles.map((role) => (
                          <Badge key={role} variant="outline" className="ml-2">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <User className="h-8 w-8 text-muted-foreground/50 mb-2" />
                  <p className="text-muted-foreground">No reviewers assigned yet</p>
                </div>
              )}
                  </CardContent>
                </Card>
            </TabsContent>
          </Tabs>
    </div>
  );
}

// Main page component with Suspense boundary
export default function ReportDetailPage({ params }: { params: { id: string } }) {
  // Unwrap params using React.use()
  const unwrappedParams = React.use(params as any) as { id: string };
  const reportId = unwrappedParams.id;
  
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-muted rounded animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-6 w-48 bg-muted rounded animate-pulse"></div>
            <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
          </div>
        </div>
        
        <div className="h-96 bg-muted rounded animate-pulse"></div>
      </div>
    }>
      <ReportDetailContent reportId={reportId} />
    </Suspense>
  );
} 