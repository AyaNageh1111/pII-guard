
import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { GdprReportModal } from '@/components/pii-dashboard/GdprReportModal';
import { generateGdprPiiReport, generatePiiFindings } from '@/utils/reportUtils';
import { Job, Finding } from '@/services/piiJobsApi';
import { useToast } from '@/hooks/use-toast';
import { File, Download, FileText, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { maskSensitiveData } from "@/utils/reportUtils";
import { exportAsCSV } from '@/utils/exportUtils';

interface GdprReportSectionProps {
  jobs: Job[];
}

export const GdprReportSection = ({ jobs }: GdprReportSectionProps) => {
  const { toast } = useToast();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportContent, setReportContent] = useState('');
  const [reportTitle, setReportTitle] = useState('GDPR/PII Report');

  // Find all PII detections from successful jobs
  const findings = useMemo(() => {
    // Get only successful jobs
    const successJobs = jobs.filter(job => job.status === "success");
    
    // Extract all findings from successful jobs
    return successJobs.flatMap(job => job.results || []);
  }, [jobs]);
  
  // Group findings by type
  const findingsByType = useMemo(() => {
    const groupedFindings: Record<string, Finding[]> = {};
    
    findings.forEach(finding => {
      const type = finding.type;
      if (!groupedFindings[type]) {
        groupedFindings[type] = [];
      }
      groupedFindings[type].push(finding);
    });
    
    return groupedFindings;
  }, [findings]);

  const handleGenerateReport = () => {
    try {
      const report = generateGdprPiiReport(jobs);
      setReportTitle('GDPR/PII Scan Report');
      setReportContent(report);
      setIsReportModalOpen(true);
    } catch (error) {
      toast({
        title: "Failed to generate report",
        description: "There was an error generating the GDPR/PII report.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateFindingsReport = () => {
    try {
      const report = generatePiiFindings(jobs);
      setReportTitle('PII Findings Report');
      setReportContent(report);
      setIsReportModalOpen(true);
    } catch (error) {
      toast({
        title: "Failed to generate findings report",
        description: "There was an error generating the PII findings report.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadReport = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${reportTitle.toLowerCase().replace(/[^\w-]/g, '-')}-${timestamp}.md`;
    const blob = new Blob([reportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Report downloaded",
      description: `The report has been downloaded as ${filename}`,
    });
  };

  const handleDownloadCSV = () => {
    // Create CSV data for PII findings
    const csvData = findings.map(finding => ({
      type: finding.type,
      value: maskSensitiveData(finding.field, finding.type),
      source: finding.source || 'unknown',
      job_id: jobs.find(job => job.results?.includes(finding))?.id || 'unknown'
    }));
    
    exportAsCSV(csvData, 'PII_Findings');
    
    toast({
      title: "CSV downloaded",
      description: "PII detection findings have been exported as CSV.",
    });
  };

  // No results to show for PII detection
  const renderNoResults = () => (
    <div className="bg-white rounded-lg shadow p-6 mb-4">
      <div className="flex items-center justify-center flex-col py-6">
        <AlertCircle className="h-12 w-12 text-slate-300 mb-2" />
        <h3 className="text-lg font-medium text-slate-700">No PII Detected</h3>
        <p className="text-sm text-slate-500 text-center mt-1">
          No personal information was found in the successfully processed jobs.
        </p>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
      <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900">GDPR Compliance Reports</h2>
          <p className="text-sm text-gray-500 mt-1">Generate and download comprehensive GDPR compliance reports</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={handleDownloadCSV}
            className="flex items-center gap-2"
            disabled={findings.length === 0}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button 
            variant="outline"
            onClick={handleGenerateFindingsReport}
            className="flex items-center gap-2"
            disabled={findings.length === 0}
          >
            <FileText className="h-4 w-4" />
            PII Findings
          </Button>
          <Button 
            onClick={handleGenerateReport}
            className="flex items-center gap-2"
          >
            <File className="h-4 w-4" />
            Full Report
          </Button>
        </div>
      </div>

      {/* PII Detection Results Section */}
      <div className="p-6">
        <h3 className="text-base font-medium mb-4 flex items-center">
          <FileText className="h-5 w-5 mr-2 text-indigo-600" />
          PII Detection Results
          {findings.length > 0 && (
            <Badge className="ml-2 bg-indigo-100 text-indigo-800 border-indigo-200">
              {findings.length} Findings
            </Badge>
          )}
        </h3>

        {findings.length === 0 ? (
          renderNoResults()
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(findingsByType).map(([type, typeFindings]) => (
              <Card key={type} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 py-3">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <span className="capitalize">{type.replace('_', ' ')}</span>
                    <Badge>{typeFindings.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-48 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 sticky top-0">
                        <tr>
                          <th className="text-left text-xs font-medium text-slate-500 p-2">Anonymized Value</th>
                          <th className="text-left text-xs font-medium text-slate-500 p-2">Source</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {typeFindings.map((finding, index) => (
                          <tr key={index}>
                            <td className="p-2 font-mono text-xs">
                              {maskSensitiveData(finding.field, finding.type)}
                            </td>
                            <td className="p-2">
                              <Badge variant="outline" className="bg-slate-50 text-slate-700">
                                {finding.source || 'unknown'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Report Generation Section */}
      <div className="px-6 py-4 border-t border-gray-100 bg-slate-50">
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-slate-500">Summary by type:</span>
            {Object.entries(findingsByType).map(([type, findings]) => (
              <Badge key={type} variant="secondary" className="bg-white">
                {type}: {findings.length}
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={handleGenerateFindingsReport}
              className="mt-0"
              disabled={findings.length === 0}
            >
              View PII Findings
            </Button>
            <Button 
              variant="outline"
              onClick={handleGenerateReport}
              className="mt-0"
            >
              View Full Report
            </Button>
          </div>
        </div>
      </div>

      {/* GDPR Report Modal */}
      <GdprReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
        report={reportContent}
        onDownload={handleDownloadReport}
        title={reportTitle}
      />
    </div>
  );
};
