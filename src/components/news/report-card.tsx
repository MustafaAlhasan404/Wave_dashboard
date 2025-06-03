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
import { Badge } from "@/components/ui/badge";
import { Eye, Flag, MoreVertical, RefreshCcw, Check, X } from "lucide-react";
import { toast } from "sonner";

interface ReportCardProps {
  report: {
    id: string;
    newsId: string;
    newsTitle: string;
    reportReason: string;
    reportedBy: string;
    reportDate: string;
    status: "pending" | "reviewing" | "accepted" | "rejected";
  };
  onViewDetails?: () => void;
}

export function ReportCard({ report, onViewDetails }: ReportCardProps) {
  const router = useRouter();
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSendingToAI, setIsSendingToAI] = useState(false);

  const handleSendToAI = async () => {
    setIsSendingToAI(true);
    
    try {
      // In a real app, this would be an API call
      // await fetch(`/api/reports/${report.id}/ai-review`, { method: 'POST' });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("Report sent to AI for reevaluation");
    } catch (error) {
      toast.error("Failed to send report to AI");
    } finally {
      setIsSendingToAI(false);
    }
  };

  const handleAccept = async () => {
    setIsProcessing(true);
    
    try {
      // In a real app, this would be an API call
      // await fetch(`/api/reports/${report.id}/accept`, { method: 'POST' });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Report accepted and changes applied");
      router.refresh(); // Refresh the page to update the report status
    } catch (error) {
      toast.error("Failed to accept report");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    
    try {
      // In a real app, this would be an API call
      // await fetch(`/api/reports/${report.id}/reject`, { method: 'POST' });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Report rejected");
      setIsRejectDialogOpen(false);
      router.refresh(); // Refresh the page to update the report status
    } catch (error) {
      toast.error("Failed to reject report");
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = () => {
    switch (report.status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Pending</Badge>;
      case "reviewing":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Reviewing</Badge>;
      case "accepted":
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Accepted</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{report.newsTitle}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <span className="text-xs">Reported on {report.reportDate}</span>
                <span className="text-xs">•</span>
                <span className="text-xs">By {report.reportedBy}</span>
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge()}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onViewDetails}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                  {report.status !== "accepted" && report.status !== "rejected" && (
                    <>
                      <DropdownMenuItem onClick={handleSendToAI} disabled={isSendingToAI}>
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Send to AI
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleAccept} disabled={isProcessing}>
                        <Check className="mr-2 h-4 w-4" />
                        Accept Report
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setIsRejectDialogOpen(true)}
                        className="text-destructive focus:text-destructive"
                        disabled={isProcessing}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Reject Report
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Report Reason:</h4>
            <p className="text-sm text-muted-foreground line-clamp-3">{report.reportReason}</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-xs text-muted-foreground">
            Report ID: <span className="font-medium">{report.id}</span>
          </div>
          <Button variant="outline" size="sm" onClick={onViewDetails}>
            View Full Report
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject this report?</DialogTitle>
            <DialogDescription>
              This will mark the report as rejected and no changes will be made to the news item.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isProcessing}
            >
              {isProcessing ? "Rejecting..." : "Reject Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 