"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import * as Tabs from "@radix-ui/react-tabs";
import { DatePickerWithRange } from "@/components/date-range-picker";
import { DataTable } from "@/components/data-table";
import { SearchBar } from "@/components/search-bar";
import { KPICards } from "@/components/kpi-cards";
import { Charts } from "@/components/charts";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExportMenu } from "@/components/export-menu";
import { ShareDialog } from "@/components/share-dialog";
import type { FilterJobsDTOType, Job } from "@/lib/types";
import { fetchJobs } from "@/lib/api";

const REFRESH_INTERVAL = 30000; // 30 seconds

export default function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    to: new Date(),
  });

  const [filters, setFilters] = useState<FilterJobsDTOType>({
    page: 0,
    page_size: 10,
    sort_by: "created_at",
    sort_direction: "desc",
    tags: [],
  });

  async function loadJobs() {
    try {
      setIsRefreshing(true);
      const data = await fetchJobs(filters);
      setJobs(data);
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load jobs');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    loadJobs();
    
    // Set up periodic refresh
    const intervalId = setInterval(loadJobs, REFRESH_INTERVAL);
    
    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [filters]);

  const handleTagsChange = (tags: string[]) => {
    setFilters(prev => ({ ...prev, tags, page: 0 }));
  };

  const handleManualRefresh = () => {
    loadJobs();
  };

  if (loading && !jobs.length) {
    return (
      <div className="min-h-screen bg-background/50 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-background/80 p-8 rounded-lg shadow-lg">
          <div className="animate-pulse text-lg font-medium">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background/50 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-destructive/5 p-8 rounded-lg shadow-lg border border-destructive/20">
          <div className="text-lg font-medium text-destructive">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl p-6 space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              PII Detection Dashboard
            </h1>
            <p className="text-muted-foreground">
              Monitor and analyze personally identifiable information across your systems
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className={`transition-all hover:shadow-md ${isRefreshing ? 'animate-spin' : ''}`}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <ShareDialog filters={filters} />
            <ExportMenu jobs={jobs} />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <SearchBar onTagsChange={handleTagsChange} initialTags={filters.tags} />
          <DatePickerWithRange 
            date={dateRange} 
            setDate={(date) => setDateRange({
              from: date.from || new Date(),
              to: date.to || new Date(),
            })} 
          />
        </div>

        <KPICards jobs={jobs} />

        <Tabs.Root defaultValue="overview" className="space-y-6">
          <Tabs.List className="flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground">
            <Tabs.Trigger
              value="overview"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              Overview
            </Tabs.Trigger>
            <Tabs.Trigger
              value="details"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              Detailed View
            </Tabs.Trigger>
            <Tabs.Trigger
              value="errors"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              Error Reports
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="overview" className="space-y-6">
            <Charts jobs={jobs} />
          </Tabs.Content>

          <Tabs.Content value="details">
            <Card className="p-6">
              <DataTable />
            </Card>
          </Tabs.Content>

          <Tabs.Content value="errors">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Error Reports</h2>
              <div className="space-y-4">
                {jobs
                  .filter(job => job.status === "failed")
                  .map(job => (
                    <div key={job.id} className="bg-destructive/5 p-4 rounded-lg border border-destructive/20">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">Job ID: {job.id}</h3>
                        <Badge variant="destructive" className="shadow-sm">{job.error_code}</Badge>
                      </div>
                      <p className="text-destructive font-medium">{job.error_message}</p>
                      {job.error_details && (
                        <p className="text-sm text-muted-foreground mt-2 bg-background/50 p-2 rounded">
                          {job.error_details}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </Card>
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
}