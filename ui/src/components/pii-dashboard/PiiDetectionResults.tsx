
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Job, Finding } from "@/services/piiJobsApi";
import { Separator } from "@/components/ui/separator";
import { maskSensitiveData } from "@/utils/reportUtils";
import { FileSearch, Shield } from "lucide-react";

interface PiiDetectionResultsProps {
  jobs: Job[];
}

export function PiiDetectionResults({ jobs }: PiiDetectionResultsProps) {
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
  
  // No results to show
  if (findings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center justify-center flex-col py-8">
          <Shield className="h-16 w-16 text-slate-300 mb-2" />
          <h3 className="text-lg font-medium text-slate-700">No PII Detected</h3>
          <p className="text-sm text-slate-500 text-center mt-1">
            No personal information was found in the successfully processed jobs.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow mb-8">
      <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <FileSearch className="h-5 w-5 mr-2 text-indigo-600" />
            PII Detection Results
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Personal information detected across {jobs.filter(job => job.status === "success").length} successful jobs
          </p>
        </div>
        <div>
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100">
            {findings.length} Total Findings
          </Badge>
        </div>
      </div>
      
      <div className="p-6 grid gap-6 md:grid-cols-2">
        {Object.entries(findingsByType).map(([type, typeFindings]) => (
          <Card key={type} className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 py-4">
              <CardTitle className="text-base font-medium flex items-center justify-between">
                <span className="capitalize">{type.replace('_', ' ')}</span>
                <Badge>{typeFindings.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr>
                      <th className="text-left text-xs font-medium text-slate-500 p-3">Anonymized Value</th>
                      <th className="text-left text-xs font-medium text-slate-500 p-3">Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {typeFindings.map((finding, index) => (
                      <tr key={index}>
                        <td className="p-3 font-mono text-xs">
                          {maskSensitiveData(finding.field, finding.type)}
                        </td>
                        <td className="p-3">
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

      <div className="px-6 py-4 border-t border-gray-100 bg-slate-50">
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-slate-500">Summary by type:</span>
          {Object.entries(findingsByType).map(([type, findings]) => (
            <Badge key={type} variant="secondary" className="bg-white">
              {type}: {findings.length}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
