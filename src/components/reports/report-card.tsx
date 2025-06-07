"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { MoreVertical, RefreshCcw, Trash2, ExternalLink, Calendar, Flag, AlertCircle, Loader2, Newspaper, User } from "lucide-react";
import { toast } from "sonner";
import { Report, reportsApi } from "@/lib/api/reports";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ReportCardProps {
  report: Report;
  onViewDetails?: () => void;
  onStatusUpdate?: (reportId: string, newStatus: Report['status']) => Promise<void>;
  onDelete?: (reportId: string) => Promise<void>;
}

export function ReportCard({ report, onViewDetails, onStatusUpdate, onDelete }: ReportCardProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleStatusUpdate = async (newStatus: Report['status']) => {
    if (!onStatusUpdate) return;
    
    setIsUpdatingStatus(true);
    try {
      await onStatusUpdate(report.id, newStatus);
      toast.success(`Report status updated to ${reportsApi.getStatusLabel(newStatus)}`);
    } catch (error) {
      console.error("Error updating report status:", error);
      toast.error("Failed to update report status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    setIsDeleting(true);
    try {
      await onDelete(report.id);
      setIsDeleteDialogOpen(false);
      toast.success("Report deleted successfully");
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.error("Failed to delete report");
    } finally {
      setIsDeleting(false);
    }
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
        <CardHeader className="px-6 pt-5 pb-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">#{report.id.substring(0, 8)}</h3>
              <span className="text-xs text-muted-foreground">
                {reportsApi.getReportTypeLabel(report.type)}
              </span>
            </div>
            {getStatusBadge(report.status)}
          </div>
          <CardTitle className="text-base font-semibold leading-tight mb-2 line-clamp-2">
            {report.message}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="px-6 py-4">
          {/* Metadata row */}
          <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span className="text-xs">{formatDate(report.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Flag className="h-3.5 w-3.5" />
              <span className="text-xs">{reportsApi.getReportTypeLabel(report.type)}</span>
            </div>
          </div>
          
          {/* Reporter info */}
          {report.userId && (
            <div className="flex items-center gap-2 mb-3">
              <div className="relative h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center">
                <User className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
              </div>
              <span className="text-sm font-medium">User #{report.userId.substring(0, 6)}</span>
            </div>
          )}
          
          {/* Target info */}
          {report.newsId && (
            <div className="bg-muted/30 p-3 rounded-lg border border-border/40">
              <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                <Newspaper className="h-3.5 w-3.5" />
                Reported News
              </p>
              <p className="text-sm">ID: {report.newsId.substring(0, 8)}</p>
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
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <span className="flex items-center">
                    {isUpdatingStatus ? (
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
                      disabled={report.status === 'PENDING' || isUpdatingStatus}
                      onClick={() => handleStatusUpdate('PENDING')}
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
                      disabled={report.status === 'IN_REVIEW' || isUpdatingStatus}
                      onClick={() => handleStatusUpdate('IN_REVIEW')}
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
                      disabled={report.status === 'RESOLVED' || isUpdatingStatus}
                      onClick={() => handleStatusUpdate('RESOLVED')}
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
                      disabled={report.status === 'DISMISSED' || isUpdatingStatus}
                      onClick={() => handleStatusUpdate('DISMISSED')}
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
                      disabled={report.status === 'ACTION_TAKEN' || isUpdatingStatus}
                      onClick={() => handleStatusUpdate('ACTION_TAKEN')}
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
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setIsDeleteDialogOpen(true)}
                className="text-destructive focus:text-destructive cursor-pointer"
                disabled={isDeleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
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
            <DialogTitle>Delete Report</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the report.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 mt-2 border rounded-md bg-destructive/5 border-destructive/20">
            <h4 className="font-medium text-sm">Report #{report.id.substring(0, 8)}</h4>
            <p className="text-xs text-muted-foreground mt-1">{reportsApi.getReportTypeLabel(report.type)} • {formatDate(report.createdAt)}</p>
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
              {isDeleting ? "Deleting..." : "Delete Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 