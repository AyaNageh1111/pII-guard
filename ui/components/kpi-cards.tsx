"use client";

import * as HoverCard from "@radix-ui/react-hover-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileSearch, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import type { Job } from "@/lib/types";

interface KPICardsProps {
  jobs: Job[];
}

export function KPICards({ jobs }: KPICardsProps) {
  if (!jobs || !Array.isArray(jobs)) {
    return null;
  }

  const totalLogs = jobs.reduce((acc, job) => acc + job.logs.length, 0);
  const totalPiiDetections = jobs.reduce((acc, job) => {
    return acc + (job.results?.length || 0);
  }, 0);
  const successRate = jobs.length > 0
    ? (jobs.filter(job => job.status === "success").length / jobs.length * 100).toFixed(1)
    : "0.0";
  const processingJobs = jobs.filter(job => job.status === "processing").length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <HoverCard.Root>
        <HoverCard.Trigger asChild>
          <Card className="cursor-help transition-colors hover:bg-muted/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Logs Scanned</CardTitle>
              <FileSearch className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLogs.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Across all jobs</p>
            </CardContent>
          </Card>
        </HoverCard.Trigger>
        <HoverCard.Portal>
          <HoverCard.Content
            className="w-80 rounded-md bg-popover p-4 text-popover-foreground shadow-md outline-none"
            sideOffset={5}
          >
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Log Analysis</h4>
              <p className="text-sm text-muted-foreground">
                Total number of log entries processed across all scanning jobs.
              </p>
            </div>
            <HoverCard.Arrow className="fill-popover" />
          </HoverCard.Content>
        </HoverCard.Portal>
      </HoverCard.Root>

      <HoverCard.Root>
        <HoverCard.Trigger asChild>
          <Card className="cursor-help transition-colors hover:bg-muted/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">PII Detections</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPiiDetections}</div>
              <p className="text-xs text-muted-foreground">Total findings</p>
            </CardContent>
          </Card>
        </HoverCard.Trigger>
        <HoverCard.Portal>
          <HoverCard.Content
            className="w-80 rounded-md bg-popover p-4 text-popover-foreground shadow-md outline-none"
            sideOffset={5}
          >
            <div className="space-y-2">
              <h4 className="font-medium leading-none">PII Detection Summary</h4>
              <p className="text-sm text-muted-foreground">
                Number of personally identifiable information instances detected in logs.
              </p>
            </div>
            <HoverCard.Arrow className="fill-popover" />
          </HoverCard.Content>
        </HoverCard.Portal>
      </HoverCard.Root>

      <HoverCard.Root>
        <HoverCard.Trigger asChild>
          <Card className="cursor-help transition-colors hover:bg-muted/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{successRate}%</div>
              <p className="text-xs text-muted-foreground">Of completed jobs</p>
            </CardContent>
          </Card>
        </HoverCard.Trigger>
        <HoverCard.Portal>
          <HoverCard.Content
            className="w-80 rounded-md bg-popover p-4 text-popover-foreground shadow-md outline-none"
            sideOffset={5}
          >
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Job Success Rate</h4>
              <p className="text-sm text-muted-foreground">
                Percentage of jobs that completed successfully without errors.
              </p>
            </div>
            <HoverCard.Arrow className="fill-popover" />
          </HoverCard.Content>
        </HoverCard.Portal>
      </HoverCard.Root>

      <HoverCard.Root>
        <HoverCard.Trigger asChild>
          <Card className="cursor-help transition-colors hover:bg-muted/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{processingJobs}</div>
              <p className="text-xs text-muted-foreground">Jobs in queue</p>
            </CardContent>
          </Card>
        </HoverCard.Trigger>
        <HoverCard.Portal>
          <HoverCard.Content
            className="w-80 rounded-md bg-popover p-4 text-popover-foreground shadow-md outline-none"
            sideOffset={5}
          >
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Active Jobs</h4>
              <p className="text-sm text-muted-foreground">
                Number of jobs currently being processed in the queue.
              </p>
            </div>
            <HoverCard.Arrow className="fill-popover" />
          </HoverCard.Content>
        </HoverCard.Portal>
      </HoverCard.Root>
    </div>
  );
}