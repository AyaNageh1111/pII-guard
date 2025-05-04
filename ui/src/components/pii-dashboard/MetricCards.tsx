
import React from 'react';
import { FileSearch, AlertCircle, Clock, Zap } from "lucide-react";

interface MetricCardsProps {
  totalScanned: number;
  totalDetections: number;
  statusBreakdown: {
    success: number;
    failed: number;
    processing: number;
  };
}

export function MetricCards({ totalScanned, totalDetections, statusBreakdown }: MetricCardsProps) {
  // Calculate detection rate
  const detectionRate = totalScanned > 0 ? ((totalDetections / totalScanned) * 100).toFixed(1) : '0.0';
  
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Logs Scanned */}
      <div className="dd-card p-5">
        <div className="flex items-start justify-between mb-1">
          <div className="p-1.5 rounded-md bg-dd-blue-50 text-dd-blue">
            <FileSearch className="h-4 w-4" />
          </div>
        </div>
        <p className="dd-label mb-1">Total Logs Scanned</p>
        <h3 className="dd-metric">{totalScanned.toLocaleString()}</h3>
      </div>

      {/* Total PII Detections */}
      <div className="dd-card p-5">
        <div className="flex items-start justify-between mb-1">
          <div className="p-1.5 rounded-md bg-datadog-100 text-datadog">
            <AlertCircle className="h-4 w-4" />
          </div>
        </div>
        <p className="dd-label mb-1">PII Detections</p>
        <h3 className="dd-metric">{totalDetections.toLocaleString()}</h3>
        <div className="flex items-center mt-1 justify-between">
          <span className="text-xs text-dd-text-light">Rate: {detectionRate}%</span>
          
          {/* New Processing indicator */}
          {statusBreakdown.processing > 0 && (
            <div className="dd-badge-processing flex items-center">
              <Zap className="h-3 w-3 mr-1" />
              <span>{statusBreakdown.processing} processing</span>
            </div>
          )}
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="dd-card p-5">
        <p className="dd-label mb-3">Detection Status</p>
        
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-dd-text">Success</span>
              <span className="text-xs font-medium text-dd-success">
                {statusBreakdown.success.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5">
              <div 
                className="bg-dd-success h-1.5 rounded-full" 
                style={{ width: `${(statusBreakdown.success / (statusBreakdown.success + statusBreakdown.failed + statusBreakdown.processing)) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-dd-text">Failed</span>
              <span className="text-xs font-medium text-dd-error">
                {statusBreakdown.failed.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5">
              <div 
                className="bg-dd-error h-1.5 rounded-full" 
                style={{ width: `${(statusBreakdown.failed / (statusBreakdown.success + statusBreakdown.failed + statusBreakdown.processing)) * 100}%` }}
              ></div>
            </div>
          </div>
          
          {/* Adding processing status bar */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-dd-text">Processing</span>
              <span className="text-xs font-medium text-dd-processing">
                {statusBreakdown.processing.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5">
              <div 
                className="bg-dd-processing dd-pulse h-1.5 rounded-full" 
                style={{ width: `${(statusBreakdown.processing / (statusBreakdown.success + statusBreakdown.failed + statusBreakdown.processing)) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Processing Jobs */}
      <div className="dd-card p-5">
        <div className="flex items-start justify-between mb-1">
          <div className="p-1.5 rounded-md bg-dd-processing-light text-dd-processing">
            <Clock className="h-4 w-4" />
          </div>
        </div>
        <p className="dd-label mb-1">Processing Jobs</p>
        <h3 className="dd-metric">{statusBreakdown.processing.toLocaleString()}</h3>
        <p className="text-xs text-dd-text-light mt-1">
          Est. completion: ~{Math.ceil(statusBreakdown.processing * 0.2)} min
        </p>
      </div>
    </div>
  );
}
