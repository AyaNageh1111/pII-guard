
import React from 'react';
import { JobsTable } from '@/components/pii-dashboard/JobsTable';
import { Job } from '@/services/piiJobsApi';
import { ExportMenu } from '@/components/pii-dashboard/ExportMenu';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface JobsPanelProps {
  jobs: Job[];
  allJobs: Job[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
  onViewJobDetails: (job: Job) => void;
}

export function JobsPanel({
  jobs,
  allJobs,
  isLoading,
  page,
  totalPages,
  setPage,
  onViewJobDetails
}: JobsPanelProps) {
  return (
    <div className="dd-chart-container">
      <div className="flex items-center justify-between mb-4">
        <h2 className="dd-title">Detection Jobs</h2>
        <div className="flex items-center gap-2">
          <div className="text-sm text-dd-text-muted">
            Showing {jobs.length} of {allJobs.length} jobs
          </div>
          <ExportMenu 
            data={jobs.map(job => ({
              id: job.id,
              status: job.status,
              created: job.created_at,
              detections: job.results?.length || 0,
              tags: job.tags.join(', '),
            }))} 
            allJobs={allJobs}
            title="PII Detection Jobs" 
          />
        </div>
      </div>
      
      <JobsTable
        jobs={jobs}
        onViewDetails={onViewJobDetails}
        isLoading={isLoading}
      />
      
      {totalPages > 1 && (
        <div className="flex items-center justify-center mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setPage(Math.max(page - 1, 0))}
                  className={page === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  aria-disabled={page === 0}
                />
              </PaginationItem>
              
              {Array.from({length: Math.min(totalPages, 5)}, (_, i) => {
                // Calculate which page numbers to show
                let pageNum = i;
                if (totalPages > 5) {
                  if (page < 2) {
                    pageNum = i;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 5 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                }
                
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink 
                      onClick={() => setPage(pageNum)}
                      isActive={page === pageNum}
                    >
                      {pageNum + 1}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setPage(Math.min(page + 1, totalPages - 1))}
                  className={page === totalPages - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  aria-disabled={page === totalPages - 1}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
