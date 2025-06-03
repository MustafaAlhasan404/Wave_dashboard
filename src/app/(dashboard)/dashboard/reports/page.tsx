"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Check, Flag, RefreshCcw, Search, X, Loader2, MoreHorizontal, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Report, reportsApi } from "@/lib/api/reports";
import { Skeleton } from "@/components/ui/skeleton";
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

export default function ReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [updatingReportId, setUpdatingReportId] = useState<string | null>(null);
  const [deletingReportId, setDeletingReportId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch reports from the API
  useEffect(() => {
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
      }
    };
    
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

  const handleViewReport = (reportId: string) => {
    // Navigate to the report detail page
    router.push(`/dashboard/reports/${reportId}`);
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
      
        // Close the dialog
        setIsDeleteDialogOpen(false);
        setSelectedReport(null);
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Content Reports ({reports.length})</h1>
        <div className="flex items-center gap-2">
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[150px] h-9">
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
          <div className="relative w-[200px]">
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reports..."
              className="pl-8 h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
            }}
            disabled={!searchQuery && statusFilter === "all"}
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

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

      {/* Reports list */}
      <div className="space-y-4">
        {isLoading ? (
          // Loading skeleton
          Array(5)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-5 w-20" />
                  </div>
                  
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-2/3 mb-3" />
                  
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-24" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
        ) : filteredReports.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-6 text-center">
              <Search className="h-5 w-5 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                {searchQuery || statusFilter !== "all"
                  ? "No matching reports found"
                  : "No reports to display"}
              </p>
              {(searchQuery || statusFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                  }}
                >
                  Clear filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredReports.map((report) => (
            <Card 
              key={report.id} 
              className="overflow-hidden hover:bg-muted/5"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">#{report.id.substring(0, 8)}</h3>
                    <span className="text-xs text-muted-foreground">
                      {reportsApi.getReportTypeLabel(report.type)}
                    </span>
                  </div>
                  {getStatusBadge(report.status)}
                </div>
                
                <p className="text-sm mb-3 line-clamp-2">{report.message}</p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatDate(report.createdAt)}</span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8"
                      onClick={() => handleViewReport(report.id)}
                    >
                      View Details
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          {updatingReportId === report.id || deletingReportId === report.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MoreHorizontal className="h-4 w-4" />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            <span className="flex items-center">
                              {updatingReportId === report.id ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <RefreshCcw className="h-4 w-4 mr-2" />
                              )}
                              Update Status
                            </span>
                          </DropdownMenuSubTrigger>
                          <DropdownMenuPortal>
                            <DropdownMenuSubContent className="w-56">
                              <DropdownMenuItem 
                                disabled={report.status === 'PENDING' || updatingReportId === report.id}
                                onClick={() => handleStatusUpdate(report.id, 'PENDING')}
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
                                disabled={report.status === 'IN_REVIEW' || updatingReportId === report.id}
                                onClick={() => handleStatusUpdate(report.id, 'IN_REVIEW')}
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
                                disabled={report.status === 'RESOLVED' || updatingReportId === report.id}
                                onClick={() => handleStatusUpdate(report.id, 'RESOLVED')}
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
                                disabled={report.status === 'DISMISSED' || updatingReportId === report.id}
                                onClick={() => handleStatusUpdate(report.id, 'DISMISSED')}
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
                                disabled={report.status === 'ACTION_TAKEN' || updatingReportId === report.id}
                                onClick={() => handleStatusUpdate(report.id, 'ACTION_TAKEN')}
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
                            </DropdownMenuSubContent>
                          </DropdownMenuPortal>
                        </DropdownMenuSub>
                        
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => openDeleteDialog(report)}
                          disabled={deletingReportId !== null}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Report
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 