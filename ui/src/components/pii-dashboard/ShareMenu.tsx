
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Share } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { copyToClipboard, generateShareableLink, shareViaEmail } from "@/utils/shareUtils";

interface ShareMenuProps {
  title?: string;
  dashboardInfo?: string;
}

export function ShareMenu({ title = "PII Detection Dashboard", dashboardInfo = "" }: ShareMenuProps) {
  const { toast } = useToast();
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [emails, setEmails] = useState("");
  const [frequency, setFrequency] = useState("weekly");
  
  const handleShare = async (type: 'link' | 'email') => {
    try {
      if (type === 'link') {
        const shareableLink = generateShareableLink();
        const copied = await copyToClipboard(shareableLink);
        
        if (copied) {
          toast({
            title: "Share Success",
            description: "Dashboard link copied to clipboard",
            duration: 3000,
          });
        } else {
          throw new Error('Failed to copy to clipboard');
        }
      } else if (type === 'email') {
        const subject = `Shared: ${title}`;
        const body = `Check out this PII Detection Dashboard: ${window.location.href}\n\n${dashboardInfo}`;
        shareViaEmail(subject, body);
        
        toast({
          title: "Email Client Opened",
          description: "Email report template has been prepared",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error(`Sharing failed:`, error);
      toast({
        title: "Share Failed",
        description: "There was an issue sharing the dashboard",
        variant: "destructive",
        duration: 5000,
      });
    }
  };
  
  const handleSchedule = () => {
    // In a real implementation, this would communicate with a backend service
    // For now, we'll just simulate success
    setIsScheduleDialogOpen(false);
    
    const frequencyText = frequency.charAt(0).toUpperCase() + frequency.slice(1);
    const recipientText = emails || "your email";
    
    toast({
      title: "Report Scheduled",
      description: `${frequencyText} reports will be sent to ${recipientText}`,
      duration: 3000,
    });
  };
  
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Share className="h-4 w-4" />
            Share
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Share Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleShare('link')} className="cursor-pointer">
            Copy Shareable Link
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleShare('email')} className="cursor-pointer">
            Send Email Report
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsScheduleDialogOpen(true)} className="cursor-pointer">
            Schedule Automated Reports
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Automated Reports</DialogTitle>
            <DialogDescription>
              Set up recurring reports to be sent to specified recipients.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="emails" className="text-right">Recipients</label>
              <Input
                id="emails"
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                placeholder="email@example.com"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="frequency" className="text-right">Frequency</label>
              <select 
                id="frequency" 
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSchedule}>Schedule Reports</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
