
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useAutoRefresh(refreshFunction: () => void, interval: number = 30000) {
  const { toast } = useToast();
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  // Automatic refresh functionality
  useEffect(() => {
    let refreshTimer: NodeJS.Timeout | null = null;

    if (isAutoRefresh) {
      refreshTimer = setInterval(() => {
        console.log('Auto-refreshing dashboard data...');
        refreshFunction();
        setLastRefreshed(new Date());
        toast({
          title: "Dashboard refreshed",
          description: `Data updated at ${new Date().toLocaleTimeString()}`,
        });
      }, interval);
    }

    return () => {
      if (refreshTimer) clearInterval(refreshTimer);
    };
  }, [isAutoRefresh, refreshFunction, interval, toast]);

  const handleManualRefresh = () => {
    refreshFunction();
    setLastRefreshed(new Date());
    toast({
      title: "Dashboard refreshed",
      description: "Data has been manually updated"
    });
  };

  return {
    isAutoRefresh,
    setIsAutoRefresh,
    lastRefreshed,
    handleManualRefresh
  };
}
