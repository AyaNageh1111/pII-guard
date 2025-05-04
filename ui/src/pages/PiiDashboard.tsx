
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCards } from '@/components/pii-dashboard/MetricCards';
import { JobDetailsModal } from '@/components/pii-dashboard/JobDetailsModal';
import { JobsPanel } from '@/components/pii-dashboard/JobsPanel';
import { Job } from '@/services/piiJobsApi';
import { usePiiJobs } from '@/hooks/usePiiJobs';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import { ChartGrid } from '@/components/pii-dashboard/ChartGrid';
import { GdprReportSection } from '@/components/dashboard/GdprReportSection';
import { useIsMobile } from '@/hooks/use-mobile';

// Refresh interval in milliseconds (30 seconds)
const REFRESH_INTERVAL = 30000;

const PiiDashboard = () => {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  
  // Get jobs data and related functions from custom hook
  const {
    jobs,
    allJobs,
    isLoading,
    page,
    totalPages,
    setPage,
    refreshJobs
  } = usePiiJobs();

  // Set up auto-refresh functionality
  const {
    isAutoRefresh,
    setIsAutoRefresh,
    handleManualRefresh
  } = useAutoRefresh(refreshJobs, REFRESH_INTERVAL);

  // Generate all the chart data based on jobs
  const {
    timeSeriesData,
    piiTypeData,
    sourceData,
    hourlyData,
    summaryStats
  } = useDashboardData(allJobs);

  const handleViewJobDetails = (job: Job) => {
    setSelectedJob(job);
    setIsJobModalOpen(true);
  };

  return (
    <DashboardLayout 
      sidebarProps={{
        open: sidebarOpen,
        isLoading,
        isAutoRefresh,
        setIsAutoRefresh,
        handleManualRefresh,
        dashboardTitle: "PII Detection Dashboard"
      }}
    >
      <div className="space-y-4">
        <MetricCards
          totalScanned={summaryStats.totalScanned}
          totalDetections={summaryStats.totalDetections}
          statusBreakdown={summaryStats.statusBreakdown}
        />
        
        <ChartGrid
          timeSeriesData={timeSeriesData}
          piiTypeData={piiTypeData}
          sourceData={sourceData}
          hourlyData={hourlyData}
        />
        
        <JobsPanel
          jobs={jobs}
          allJobs={allJobs}
          isLoading={isLoading}
          page={page}
          totalPages={totalPages}
          setPage={setPage}
          onViewJobDetails={handleViewJobDetails}
        />
        
        <GdprReportSection jobs={allJobs} />
        
        <JobDetailsModal
          job={selectedJob}
          isOpen={isJobModalOpen}
          onClose={() => setIsJobModalOpen(false)}
        />
      </div>
    </DashboardLayout>
  );
};

export default PiiDashboard;
