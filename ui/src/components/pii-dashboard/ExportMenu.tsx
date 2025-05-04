
import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportAsCSV, exportAsExcel, exportAsPDF } from "@/utils/exportUtils";
import { generateGdprPiiReport } from "@/utils/reportUtils";
import { Job } from "@/services/piiJobsApi";
import { GdprReportModal } from "@/components/pii-dashboard/GdprReportModal";

interface ExportMenuProps {
  data: any[];
  title?: string;
  allJobs?: Job[];
}

export function ExportMenu({ data, allJobs = [], title = "PII Detection Data" }: ExportMenuProps) {
  const { toast } = useToast();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportContent, setReportContent] = useState('');
  
  // Define the export type to include 'gdpr-report'
  type ExportType = 'csv' | 'excel' | 'pdf' | 'gdpr-report';
  
  const handleExport = (type: ExportType) => {
    try {
      switch (type) {
        case 'csv':
          exportAsCSV(data, title);
          break;
        case 'excel':
          exportAsExcel(data, title);
          break;
        case 'pdf':
          exportAsPDF(title);
          break;
        case 'gdpr-report':
          // Generate GDPR report
          if (allJobs.length === 0) {
            throw new Error("No job data available for report generation");
          }
          
          const report = generateGdprPiiReport(allJobs);
          setReportContent(report);
          setIsReportModalOpen(true);
          
          toast({
            title: "GDPR Report Generated",
            description: "Your report has been generated successfully.",
            duration: 3000,
          });
          return;
        default:
          // TypeScript requires handling all possible cases
          const _exhaustiveCheck: never = type;
          throw new Error(`Unhandled export type: ${type}`);
      }
      
      // Only reach this point for non-gdpr-report types
      toast({
        title: "Export Started",
        description: `Your ${type.toUpperCase()} export is being prepared.`,
        duration: 3000,
      });
    } catch (error) {
      console.error(`Export failed:`, error);
      toast({
        title: "Export Failed",
        description: `There was an issue exporting as ${type.toUpperCase()}.`,
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const handleDownloadReport = () => {
    // Create a Blob containing the Markdown text
    const blob = new Blob([reportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    
    // Create a link element and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `GDPR_PII_Report_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Report Downloaded",
      description: "Your GDPR Report has been downloaded.",
      duration: 3000,
    });
  };
  
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <FileText className="h-4 w-4" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Export Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleExport('csv')} className="cursor-pointer">
            Export as CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('excel')} className="cursor-pointer">
            Export as Excel
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('pdf')} className="cursor-pointer">
            Export as PDF
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleExport('gdpr-report')} className="cursor-pointer">
            Generate GDPR Report
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <GdprReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        report={reportContent}
        onDownload={handleDownloadReport}
      />
    </>
  );
}
