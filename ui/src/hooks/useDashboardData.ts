
import { useState, useEffect } from 'react';
import { Job } from '@/services/piiJobsApi';

export function useDashboardData(allJobs: Job[]) {
  // Generate time series data from the actual jobs
  const generateTimeSeriesData = () => {
    const dateMap: Record<string, number> = {};
    
    // Process each job and count detections by date
    allJobs.forEach(job => {
      if (job.created_at) {
        const dateStr = new Date(job.created_at).toISOString().split('T')[0];
        const detectionCount = job.results?.length || 0;
        
        dateMap[dateStr] = (dateMap[dateStr] || 0) + detectionCount;
      }
    });
    
    // Convert to array format needed for charts
    return Object.entries(dateMap)
      .map(([date, detections]) => ({
        date,
        detections
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  // Generate PII type distribution data
  const generatePiiTypeData = () => {
    const piiCounts: Record<string, number> = {};
    
    allJobs.forEach(job => {
      job.results?.forEach(result => {
        piiCounts[result.type] = (piiCounts[result.type] || 0) + 1;
      });
    });
    
    return Object.entries(piiCounts).map(([type, value]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' '),
      value
    }));
  };

  // Generate source distribution data
  const generateSourceData = () => {
    const sourceCounts: Record<string, number> = {};
    
    allJobs.forEach(job => {
      job.results?.forEach(result => {
        if (result.source) {
          sourceCounts[result.source] = (sourceCounts[result.source] || 0) + 1;
        }
      });
    });
    
    return Object.entries(sourceCounts).map(([source, value]) => ({
      name: source.charAt(0).toUpperCase() + source.slice(1).replace('-', ' '),
      value
    }));
  };

  // Generate hourly data with consistent formatting for the heatmap
  const generateHourlyData = () => {
    const hourMap: Record<string, number> = {};
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Initialize all hours with zero detections using consistent hour format
    for (let i = 0; i < 24; i++) {
      // Format hours as "00:00" for consistency
      const hourStr = i.toString().padStart(2, '0') + ':00';
      hourMap[hourStr] = 0;
    }
    
    // Count detections by hour for the past 24 hours
    allJobs.forEach(job => {
      if (job.created_at) {
        const jobDate = new Date(job.created_at);
        
        // Only include jobs from the past 24 hours
        if (jobDate >= yesterday && jobDate <= now) {
          const hourStr = jobDate.getHours().toString().padStart(2, '0') + ':00';
          const detectionCount = job.results?.length || 0;
          
          hourMap[hourStr] = (hourMap[hourStr] || 0) + detectionCount;
        }
      }
    });
    
    // Convert to array format for the chart and sort chronologically
    return Object.entries(hourMap)
      .map(([hour, detections]) => ({
        hour,
        detections
      }))
      .sort((a, b) => {
        // Sort hours chronologically
        const hourA = parseInt(a.hour.split(':')[0]);
        const hourB = parseInt(b.hour.split(':')[0]);
        return hourA - hourB;
      });
  };

  // Generate summary stats based on all jobs
  const generateSummaryStats = () => {
    return {
      totalScanned: allJobs.length,
      totalDetections: allJobs.reduce((sum, job) => sum + (job.results?.length || 0), 0),
      statusBreakdown: {
        success: allJobs.filter(job => job.status === 'success').length,
        failed: allJobs.filter(job => job.status === 'failed').length,
        processing: allJobs.filter(job => job.status === 'processing').length
      }
    };
  };

  // Run data generation for charts
  const timeSeriesData = generateTimeSeriesData();
  const piiTypeData = generatePiiTypeData();
  const sourceData = generateSourceData();
  const hourlyData = generateHourlyData();
  const summaryStats = generateSummaryStats();

  return {
    timeSeriesData,
    piiTypeData,
    sourceData,
    hourlyData,
    summaryStats
  };
}
