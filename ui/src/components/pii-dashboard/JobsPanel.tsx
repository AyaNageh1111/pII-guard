
import React from 'react';
import { JobsTable } from '@/components/pii-dashboard/JobsTable';
import { Job } from '@/services/piiJobsApi';
import { ExportMenu } from '@/components/pii-dashboard/ExportMenu';

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
      
      {totalPages > 0 && (
        <div className="flex items-center justify-center space-x-2 mt-4">
          <button
            className="px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-dd-text text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setPage(Math.max(page - 1, 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <span className="text-sm text-dd-text-muted">
            Page {page} of {totalPages}
          </span>
          <button
            className="px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-dd-text text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setPage(Math.min(page + 1, totalPages))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
