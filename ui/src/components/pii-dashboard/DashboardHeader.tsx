import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { ExportMenu } from '@/components/pii-dashboard/ExportMenu';
import { ShareMenu } from '@/components/pii-dashboard/ShareMenu';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Logo } from '@/components/pii-dashboard/Logo';

interface DashboardHeaderProps {
  isLoading: boolean;
  isAutoRefresh: boolean;
  setIsAutoRefresh: (value: boolean) => void;
  handleManualRefresh: () => void;
  exportData: any[];
  dashboardTitle: string;
  dashboardSummary: string;
}

export function DashboardHeader({ 
  isLoading, 
  isAutoRefresh, 
  setIsAutoRefresh, 
  handleManualRefresh,
  exportData,
  dashboardTitle,
  dashboardSummary
}: DashboardHeaderProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-indigo-50/80 via-purple-50/80 to-fuchsia-50/80 p-4 rounded-xl shadow-sm border border-indigo-100/50 backdrop-blur-sm">
      <div className="flex flex-col">
        <Logo size={isMobile ? "sm" : "lg"} animated={true} />
        <p className="text-indigo-600 mt-1 sm:mt-2 text-sm sm:text-base ml-0.5">
          Monitor and protect sensitive data in your logs
        </p>
      </div>
      <div className="flex gap-2 w-full sm:w-auto justify-end">
        <div className="flex items-center mr-2 text-xs text-gray-500">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleManualRefresh} 
            disabled={isLoading}
            className="h-8 w-8 hover:bg-indigo-100"
          >
            <RefreshCw className={cn("h-4 w-4 text-indigo-600", isLoading && "animate-spin")} />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsAutoRefresh(!isAutoRefresh)}
            className={cn("text-xs ml-2", 
              isAutoRefresh 
                ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100" 
                : "hover:bg-indigo-100 hover:text-indigo-700"
            )}
          >
            {isAutoRefresh ? "Auto" : "Manual"}
          </Button>
        </div>
        {!isMobile && (
          <>
            <ExportMenu data={exportData} title={dashboardTitle} allJobs={[]} />
            <ShareMenu title={dashboardTitle} dashboardInfo={dashboardSummary} />
          </>
        )}
      </div>
    </div>
  );
}
