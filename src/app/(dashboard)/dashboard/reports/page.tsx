"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Check, Flag, RefreshCcw, Search, X, Loader2, MoreHorizontal, Trash2, LayoutGrid, List as ListIcon, Users2, AlertCircle, Newspaper, Tag, User, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Report, reportsApi } from "@/lib/api/reports";
import { Skeleton } from "@/components/ui/skeleton";
import { ReportCard } from "@/components/reports/report-card";
import { LoadingDots } from "@/components/ui/loading-dots";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// Create a client component that uses useSearchParams
function ReportsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [updatingReportId, setUpdatingReportId] = useState<string | null>(null);
  const [deletingReportId, setDeletingReportId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch reports from the API
  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const response = await reportsApi.getAllReports();
      
      if (response.success && response.data) {
        setReports(response.data.reports);
      } else {
        toast.error("Failed to fetch reports");
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Error loading reports. Please try again.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  
  useEffect(() => {
    fetchReports();
  }, []);

  // Filter reports based on search query and status filter
  useEffect(() => {
    let filtered = [...reports];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(report => 
        report.message.toLowerCase().includes(query) || 
        report.type.toLowerCase().includes(query)
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter(report => report.status === statusFilter);
    }
    setFilteredReports(filtered);
  }, [reports, searchQuery, statusFilter]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) {
      params.set("search", searchQuery);
    }
    if (statusFilter !== "all") {
      params.set("status", statusFilter);
    }
    
    // Update URL without refreshing the page
    const url = params.toString() ? `?${params.toString()}` : "/dashboard/reports";
    router.push(url, { scroll: false });
  }, [searchQuery, statusFilter, router]);

  const handleViewDetails = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (report) {
      setSelectedReport(report);
      // Scroll to top to show the selected report
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCloseDetails = () => {
    setSelectedReport(null);
  };

  const getStatusBadge = (status: string) => {
    const colorClass = reportsApi.getStatusColor(status);
    const label = reportsApi.getStatusLabel(status);
    
    // Define border colors for each status
    let borderColor = "";
    switch(status) {
      case "PENDING": 
        borderColor = "#d97706"; // Yellow-600
        break;
      case "IN_REVIEW": 
        borderColor = "#2563eb"; // Blue-600
        break;
      case "RESOLVED": 
        borderColor = "#16a34a"; // Green-600
        break;
      case "DISMISSED": 
        borderColor = "#6b7280"; // Gray-500
        break;
      case "ACTION_TAKEN": 
        borderColor = "#dc2626"; // Red-600
        break;
      default:
        borderColor = "#6b7280"; // Gray-500
    }
    
    return (
      <Badge 
        className={`${colorClass} border font-medium px-2.5 py-0.5`}
        style={{ borderColor }}
      >
        {label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleStatusUpdate = async (reportId: string, newStatus: Report['status']) => {
    try {
      setUpdatingReportId(reportId);
      const response = await reportsApi.updateReportStatus(reportId, newStatus);
      
      if (response.success) {
        toast.success("Report status updated successfully");
        
        // Update the reports list with the new status
        const updatedReports = reports.map(report => 
          report.id === reportId ? { ...report, status: newStatus } : report
        );
        
      setReports(updatedReports);

      // Update selected report if it's the one being updated
      if (selectedReport && selectedReport.id === reportId) {
        setSelectedReport({ ...selectedReport, status: newStatus });
      }
      } else {
        toast.error("Failed to update report status");
      }
    } catch (error) {
      console.error("Error updating report status:", error);
      toast.error("An error occurred while updating the status");
    } finally {
      setUpdatingReportId(null);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      setDeletingReportId(reportId);
      const response = await reportsApi.deleteReport(reportId);
      
      if (response.success) {
        toast.success("Report deleted successfully");
        
        // Remove the deleted report from the list
        const updatedReports = reports.filter(report => report.id !== reportId);
        setReports(updatedReports);
        
        // Close the dialog and clear selection if the deleted report was selected
        setIsDeleteDialogOpen(false);
        if (selectedReport && selectedReport.id === reportId) {
          setSelectedReport(null);
        }
      } else {
        toast.error("Failed to delete report");
      }
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.error("An error occurred while deleting the report");
    } finally {
      setDeletingReportId(null);
    }
  };

  const openDeleteDialog = (report: Report) => {
    setSelectedReport(report);
    setIsDeleteDialogOpen(true);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchReports();
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    router.push('/dashboard/reports', { scroll: false });
  };

  return (
    <div className="flex flex-col gap-6 relative">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Content Reports</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none"
          >
            <RefreshCcw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh Reports"}
          </button>
        </div>
      </div>

      {/* Floating Report Details */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <Card className="w-full max-w-5xl border-border shadow-lg animate-in fade-in zoom-in-95 duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-5 lg:min-h-[600px]">
              {/* Left column with report id and message */}
              <div className="lg:col-span-2 relative bg-muted">
                <div className="bg-muted h-full min-h-[300px] flex flex-col p-6 relative">
                  <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                    {getStatusBadge(selectedReport.status)}
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
                  
                  <div className="flex-1 flex flex-col items-start justify-center">
                    <div className="mb-3 mt-8">
                      <Badge variant="outline" className="text-sm font-medium">
                        Report #{selectedReport.id.substring(0, 8)}
                      </Badge>
                    </div>
                    <h2 className="text-xl font-semibold mb-2">
                      {reportsApi.getReportTypeLabel(selectedReport.type)}
                    </h2>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formatDate(selectedReport.createdAt)}</span>
                    </div>
                    <div className="bg-background/50 p-4 rounded-lg border border-border/60 w-full">
                      <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        Report Message
                      </h3>
                      <p className="text-sm whitespace-pre-wrap">{selectedReport.message}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right column with details */}
              <div className="lg:col-span-3 flex flex-col p-0">
                <div className="flex-1 p-5 pb-3 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div className="bg-muted/30 p-3 rounded-lg border border-border/40 hover:shadow-sm transition-shadow">
                      <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" />
                        Reporter
                      </p>
                      <p className="text-sm font-medium">User #{selectedReport.userId.substring(0, 8)}</p>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-lg border border-border/40 hover:shadow-sm transition-shadow">
                      <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                        <Flag className="h-3.5 w-3.5" />
                        Type
                      </p>
                      <p className="text-sm font-medium">{reportsApi.getReportTypeLabel(selectedReport.type)}</p>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-lg border border-border/40 hover:shadow-sm transition-shadow">
                      <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5" />
                        Status
                      </p>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(selectedReport.status)}
                      </div>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-lg border border-border/40 hover:shadow-sm transition-shadow">
                      <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        Date Reported
                      </p>
                      <p className="text-sm font-medium">{formatDate(selectedReport.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent my-5"></div>
                  
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Newspaper className="h-4 w-4 text-primary" />
                    <span>Reported Content</span>
                  </h3>
                  <div className="bg-muted/30 p-4 rounded-lg border border-border/40">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs">News Item</Badge>
                      <p className="text-xs text-muted-foreground">ID: {selectedReport.newsId}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.push(`/dashboard/news/${selectedReport.newsId}`)}
                      className="mt-2 w-full justify-center gap-1.5"
                    >
                      <span>View Reported Content</span>
                    </Button>
                  </div>
                </div>
                
                <div className="bg-gradient-to-b from-transparent via-muted/5 to-muted/10 p-4 rounded-br-lg flex justify-between items-center gap-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="h-8 gap-1.5"
                        disabled={updatingReportId === selectedReport.id}
                      >
                        {updatingReportId === selectedReport.id ? (
                          <>
                            <LoadingDots size={4} color="currentColor" className="mr-1" />
                            <span>Updating...</span>
                          </>
                        ) : (
                          <>
                            <RefreshCcw className="h-3.5 w-3.5" />
                            <span>Update Status</span>
                          </>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                      <DropdownMenuItem 
                        disabled={selectedReport.status === 'PENDING' || updatingReportId === selectedReport.id}
                        onClick={() => handleStatusUpdate(selectedReport.id, 'PENDING')}
                        className="flex items-center py-2"
                      >
                        <Badge 
                          variant="outline" 
                          className="bg-yellow-100 text-yellow-800 mr-2 px-2 py-1"
                          style={{ borderColor: "#d97706" }}
                        >
                          Pending
                        </Badge>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        disabled={selectedReport.status === 'IN_REVIEW' || updatingReportId === selectedReport.id}
                        onClick={() => handleStatusUpdate(selectedReport.id, 'IN_REVIEW')}
                        className="flex items-center py-2"
                      >
                        <Badge 
                          variant="outline" 
                          className="bg-blue-100 text-blue-800 mr-2 px-2 py-1"
                          style={{ borderColor: "#2563eb" }}
                        >
                          In Review
                        </Badge>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        disabled={selectedReport.status === 'RESOLVED' || updatingReportId === selectedReport.id}
                        onClick={() => handleStatusUpdate(selectedReport.id, 'RESOLVED')}
                        className="flex items-center py-2"
                      >
                        <Badge 
                          variant="outline" 
                          className="bg-green-100 text-green-800 mr-2 px-2 py-1"
                          style={{ borderColor: "#16a34a" }}
                        >
                          Resolved
                        </Badge>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        disabled={selectedReport.status === 'DISMISSED' || updatingReportId === selectedReport.id}
                        onClick={() => handleStatusUpdate(selectedReport.id, 'DISMISSED')}
                        className="flex items-center py-2"
                      >
                        <Badge 
                          variant="outline" 
                          className="bg-gray-100 text-gray-800 mr-2 px-2 py-1"
                          style={{ borderColor: "#6b7280" }}
                        >
                          Dismissed
                        </Badge>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        disabled={selectedReport.status === 'ACTION_TAKEN' || updatingReportId === selectedReport.id}
                        onClick={() => handleStatusUpdate(selectedReport.id, 'ACTION_TAKEN')}
                        className="flex items-center py-2"
                      >
                        <Badge 
                          variant="outline" 
                          className="bg-red-100 text-red-800 mr-2 px-2 py-1"
                          style={{ borderColor: "#dc2626" }}
                        >
                          Action Taken
                        </Badge>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => openDeleteDialog(selectedReport)}
                    disabled={deletingReportId === selectedReport.id}
                    className="h-8 gap-1.5"
                  >
                    {deletingReportId === selectedReport.id ? (
                      <>
                        <LoadingDots size={4} color="currentColor" className="mr-1" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the report 
              {selectedReport && ` #${selectedReport.id.substring(0, 8)}`}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deletingReportId !== null}
            >
              Cancel
            </Button>
            <Button
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.preventDefault();
                if (selectedReport) {
                  handleDeleteReport(selectedReport.id);
                }
              }}
              disabled={deletingReportId !== null}
              variant="destructive"
            >
              {deletingReportId ? (
                <>
                  <LoadingDots size={4} color="currentColor" className="mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="sm:max-w-xs"
          />
          <div className="flex flex-row gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="IN_REVIEW">In Review</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
                <SelectItem value="DISMISSED">Dismissed</SelectItem>
                <SelectItem value="ACTION_TAKEN">Action Taken</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              disabled={!searchQuery && statusFilter === "all"}
              className="h-10"
            >
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingDots size={10} color="#888" />
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchQuery || statusFilter !== "all"
                ? "No matching reports found"
                : "No reports to display"}
            </p>
            {(searchQuery || statusFilter !== "all") && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={handleClearFilters}
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {filteredReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onViewDetails={() => handleViewDetails(report.id)}
                onStatusUpdate={handleStatusUpdate}
                onDelete={handleDeleteReport}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function ReportsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-muted rounded animate-pulse"></div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-32 bg-muted rounded animate-pulse"></div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="h-10 w-full sm:w-80 bg-muted rounded animate-pulse"></div>
          <div className="flex gap-4">
            <div className="h-10 w-[180px] bg-muted rounded animate-pulse"></div>
            <div className="h-10 w-20 bg-muted rounded animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded animate-pulse"></div>
            ))}
        </div>
      </div>
    }>
      <ReportsPageContent />
    </Suspense>
  );
} 