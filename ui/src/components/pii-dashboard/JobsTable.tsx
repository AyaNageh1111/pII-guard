
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, ChevronDown } from "lucide-react";
import { Job } from "@/services/piiJobsApi";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent 
} from "@/components/ui/accordion";

interface JobsTableProps {
  jobs: Job[];
  onViewDetails: (job: Job) => void;
  isLoading?: boolean;
}

export function JobsTable({ jobs, onViewDetails, isLoading = false }: JobsTableProps) {
  // State to track which task groups are expanded
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  if (isLoading) {
    return (
      <div className="w-full h-80 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center text-datadog">
          <div className="w-8 h-8 border-4 border-t-datadog border-r-transparent border-l-transparent border-b-transparent rounded-full animate-spin mb-3"></div>
          <div className="text-dd-text-muted">Loading jobs data...</div>
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="w-full border rounded-lg bg-slate-50 p-8 flex flex-col items-center justify-center text-center">
        <div className="text-datadog mb-2 font-medium">No jobs match the current filters</div>
        <p className="text-sm text-dd-text-muted">Try adjusting your filters or search query</p>
      </div>
    );
  }
  
  // Group jobs by task_group_id
  const groupedJobs: Record<string, Job[]> = {};
  jobs.forEach(job => {
    const groupId = job.task_group_id || 'ungrouped';
    if (!groupedJobs[groupId]) {
      groupedJobs[groupId] = [];
    }
    groupedJobs[groupId].push(job);
  });

  const formatDate = (date: string | undefined | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleString();
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-dd-success-light text-dd-success border-dd-success/20';
      case 'failed':
        return 'bg-dd-error-light text-dd-error border-dd-error/20';
      case 'processing':
        return 'bg-dd-warning-light text-dd-warning border-dd-warning/20';
      default:
        return 'bg-slate-100 text-dd-text-muted';
    }
  };

  const getDetectionCount = (job: Job): number => {
    return job.results?.length || 0;
  };
  
  // Get group summary
  const getGroupSummary = (jobs: Job[]) => {
    const totalJobs = jobs.length;
    const successJobs = jobs.filter(job => job.status === 'success').length;
    const failedJobs = jobs.filter(job => job.status === 'failed').length;
    const processingJobs = jobs.filter(job => job.status === 'processing').length;
    const totalDetections = jobs.reduce((sum, job) => sum + (job.results?.length || 0), 0);
    
    return { totalJobs, successJobs, failedJobs, processingJobs, totalDetections };
  };

  // Handle expanding and collapsing groups
  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Initialize group expansion state
  Object.entries(groupedJobs).forEach(([groupId, groupJobs]) => {
    if (expandedGroups[groupId] === undefined) {
      const { failedJobs, processingJobs, totalJobs } = getGroupSummary(groupJobs);
      const isUngrouped = groupId === 'ungrouped';
      
      // Auto-expand groups with certain conditions
      const shouldAutoExpand = 
        failedJobs > 0 || 
        processingJobs > 0 ||
        totalJobs <= 3 ||
        isUngrouped;
        
      // Set the initial expanded state
      if (expandedGroups[groupId] === undefined) {
        setExpandedGroups(prev => ({
          ...prev,
          [groupId]: shouldAutoExpand
        }));
      }
    }
  });

  return (
    <div className="rounded-md overflow-hidden border border-slate-200">
      <Accordion type="multiple" className="w-full">
        {Object.entries(groupedJobs).map(([groupId, groupJobs]) => {
          const { totalJobs, successJobs, failedJobs, processingJobs, totalDetections } = getGroupSummary(groupJobs);
          const isUngrouped = groupId === 'ungrouped';
          const isExpanded = expandedGroups[groupId] === true;
          
          return (
            <AccordionItem 
              key={groupId} 
              value={groupId}
              className={`${isUngrouped ? 'border-t-0' : 'border-t'}`}
            >
              {/* Group Header */}
              <AccordionTrigger 
                className={`px-4 py-2 ${isUngrouped ? 'sr-only' : 'bg-slate-50 hover:bg-slate-100'}`}
                onClick={() => toggleGroup(groupId)}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <span className="font-medium text-dd-text">Task Group: {groupId}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-dd-text-muted">
                    <span>{totalJobs} jobs</span>
                    <span className="text-dd-success">{successJobs} success</span>
                    <span className="text-dd-error">{failedJobs} failed</span>
                    <span className="text-dd-warning">{processingJobs} processing</span>
                    <span>{totalDetections} detections</span>
                  </div>
                </div>
              </AccordionTrigger>
              
              {/* Group Content */}
              <AccordionContent>
                <div className="w-full overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="text-dd-text-muted font-medium w-32 min-w-[120px]">Job ID</TableHead>
                        <TableHead className="text-dd-text-muted font-medium w-24 min-w-[100px]">Status</TableHead>
                        <TableHead className="text-dd-text-muted font-medium w-40 min-w-[160px]">Created At</TableHead>
                        <TableHead className="text-dd-text-muted font-medium w-40 min-w-[160px]">Completed At</TableHead>
                        {!isUngrouped && (
                          <TableHead className="text-dd-text-muted font-medium w-40 min-w-[160px]">Task Group</TableHead>
                        )}
                        <TableHead className="text-dd-text-muted font-medium w-auto min-w-[120px]">Tags</TableHead>
                        <TableHead className="text-dd-text-muted font-medium text-right w-28 min-w-[100px]">Detections</TableHead>
                        <TableHead className="text-dd-text-muted font-medium text-right w-20 min-w-[80px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groupJobs.map((job) => (
                        <TableRow key={job.id} className="hover:bg-slate-50">
                          <TableCell className="font-mono text-xs text-dd-text-muted w-32 min-w-[120px]">{job.id}</TableCell>
                          <TableCell className="w-24 min-w-[100px]">
                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeVariant(job.status)}`}>
                              {job.status}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-dd-text w-40 min-w-[160px]">{formatDate(job.created_at)}</TableCell>
                          <TableCell className="text-sm text-dd-text w-40 min-w-[160px]">{formatDate(job.completed_at)}</TableCell>
                          {!isUngrouped && (
                            <TableCell className="text-sm text-dd-text w-40 min-w-[160px]">{job.task_group_id || "—"}</TableCell>
                          )}
                          <TableCell className="w-auto min-w-[120px]">
                            <div className="flex flex-wrap gap-1">
                              {job.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs bg-slate-50 text-dd-text-muted border-slate-200">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium text-dd-text w-28 min-w-[100px]">{getDetectionCount(job)}</TableCell>
                          <TableCell className="text-right w-20 min-w-[80px]">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onViewDetails(job)}
                              className="h-8 w-8 p-0 rounded-full bg-datadog-50 hover:bg-datadog-100 text-datadog"
                            >
                              <span className="sr-only">View details</span>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
