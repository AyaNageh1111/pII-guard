
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Job } from '@/services/piiJobsApi';
import { PieChart } from './PieChart';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger 
} from "@/components/ui/accordion";

interface JobDetailsModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
}

export function JobDetailsModal({ job, isOpen, onClose }: JobDetailsModalProps) {
  if (!job) return null;

  // Transform results into format for PieChart
  const piiTypeData = job.results ? 
    job.results.reduce<Record<string, number>>((acc, result) => {
      acc[result.type] = (acc[result.type] || 0) + 1;
      return acc;
    }, {}) : {};

  const pieChartData = Object.entries(piiTypeData).map(([type, count]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' '),
    value: count
  }));

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'failed':
        return 'destructive';
      case 'processing':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const formatDate = (date: string | undefined | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            Job Details: <span className="font-mono ml-2">{job.id}</span>
            <Badge
              variant={getStatusBadgeVariant(job.status) as any}
              className="capitalize ml-2"
            >
              {job.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Created at {formatDate(job.created_at)}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Summary</h3>
            <div className="space-y-2 mb-4">
              <div className="grid grid-cols-2 gap-x-2 text-sm">
                <span className="font-medium text-muted-foreground">Status:</span>
                <span className="capitalize">{job.status}</span>
              </div>
              <div className="grid grid-cols-2 gap-x-2 text-sm">
                <span className="font-medium text-muted-foreground">Created:</span>
                <span>{formatDate(job.created_at)}</span>
              </div>
              <div className="grid grid-cols-2 gap-x-2 text-sm">
                <span className="font-medium text-muted-foreground">Completed:</span>
                <span>{formatDate(job.completed_at)}</span>
              </div>
              <div className="grid grid-cols-2 gap-x-2 text-sm">
                <span className="font-medium text-muted-foreground">Total Detections:</span>
                <span>{job.results?.length || 0}</span>
              </div>
              <div className="grid grid-cols-2 gap-x-2 text-sm">
                <span className="font-medium text-muted-foreground">Tags:</span>
                <div className="flex flex-wrap gap-1">
                  {job.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            {job.error_message && (
              <Accordion type="single" collapsible className="mt-4 bg-red-50 border border-red-200 rounded-md overflow-hidden">
                <AccordionItem value="error-details" className="border-none">
                  <AccordionTrigger className="p-3 text-sm font-medium text-red-700 hover:no-underline">
                    Error Details
                  </AccordionTrigger>
                  <AccordionContent className="p-3 pt-0">
                    <p className="text-sm text-red-600">{job.error_message}</p>
                    {job.error_details && (
                      <p className="text-xs text-red-500 mt-1 font-mono bg-red-50/50 p-2 rounded border border-red-100">
                        {job.error_details}
                      </p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </div>
          
          <div>
            {job.results && job.results.length > 0 && (
              <PieChart 
                data={pieChartData} 
                title="PII Type Distribution" 
              />
            )}
          </div>
        </div>
        
        {job.logs && job.logs.length > 0 && (
          <Accordion type="single" collapsible className="mt-6 rounded-lg overflow-hidden border bg-gradient-to-r from-slate-800 to-slate-900">
            <AccordionItem value="logs" className="border-none">
              <AccordionTrigger className="px-4 py-3 text-lg font-medium text-white hover:no-underline bg-black/10">
                Logs
              </AccordionTrigger>
              <AccordionContent className="p-0 border-t border-gray-800">
                <div className="bg-black/90 p-0 overflow-y-auto">
                  <Table>
                    <TableBody>
                      {job.logs.map((log, index) => (
                        <TableRow 
                          key={index} 
                          className={index % 2 === 0 ? "bg-black/90" : "bg-black/70"}
                        >
                          <TableCell className="font-mono text-xs text-green-400 py-1 px-4 border-b-0">
                            {log}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
        
        {job.results && job.results.length > 0 && (
          <Accordion type="single" collapsible className="mt-6 rounded-lg overflow-hidden border bg-gradient-to-r from-indigo-50 to-blue-50 shadow-sm">
            <AccordionItem value="results" className="border-none">
              <AccordionTrigger className="px-4 py-3 text-lg font-medium hover:no-underline">
                PII Detection Results
              </AccordionTrigger>
              <AccordionContent className="p-0 border-t border-indigo-100">
                <div className="p-0">
                  <Table>
                    <TableHeader className="bg-indigo-100/50">
                      <TableRow>
                        <TableHead>Field</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Source</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {job.results.map((result, index) => (
                        <TableRow 
                          key={index}
                          className={index % 2 === 0 ? "bg-white" : "bg-indigo-50/30"}
                        >
                          <TableCell>{result.field}</TableCell>
                          <TableCell className="capitalize">{result.type}</TableCell>
                          <TableCell className="capitalize">{result.source || "unknown"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </DialogContent>
    </Dialog>
  );
}
