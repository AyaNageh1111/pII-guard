"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import type { FilterJobsDTOType, Job } from "@/lib/types";
import { format } from "date-fns";
import { fetchJobs } from "@/lib/api";

type ExpandedState = {
  [key: string]: 'logs' | 'results' | null;
};

export function DataTable() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [filters, setFilters] = useState<FilterJobsDTOType>({
    page: 0,
    page_size: 10,
    sort_by: "created_at",
    sort_direction: "desc",
  });

  useEffect(() => {
    async function loadJobs() {
      try {
        setLoading(true);
        const data = await fetchJobs(filters);
        setJobs(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load jobs');
      } finally {
        setLoading(false);
      }
    }

    loadJobs();
  }, [filters]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-lg">Loading jobs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-destructive">{error}</div>
      </div>
    );
  }

  const startIndex = filters.page * filters.page_size;
  const endIndex = startIndex + filters.page_size;
  const totalPages = Math.ceil(jobs.length / filters.page_size);

  const sortedData = [...jobs].sort((a, b) => {
    const dateA = new Date(a[filters.sort_by as keyof Job] as string).getTime();
    const dateB = new Date(b[filters.sort_by as keyof Job] as string).getTime();
    return filters.sort_direction === "asc" ? dateA - dateB : dateB - dateA;
  });

  const paginatedData = sortedData.slice(startIndex, endIndex);

  const toggleExpanded = (jobId: string, section: 'logs' | 'results') => {
    setExpanded(prev => ({
      ...prev,
      [jobId]: prev[jobId] === section ? null : section
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select
            value={filters.sort_by}
            onValueChange={(value: "created_at" | "updated_at") =>
              setFilters({ ...filters, sort_by: value })
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Created Date</SelectItem>
              <SelectItem value="updated_at">Updated Date</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.sort_direction}
            onValueChange={(value: "asc" | "desc") =>
              setFilters({ ...filters, sort_direction: value })
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort direction" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
            disabled={filters.page === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {filters.page + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
            disabled={filters.page >= totalPages - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Completed At</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Error</TableHead>
              <TableHead className="text-right">Logs</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((job) => (
              <>
                <TableRow key={job.id} className="group">
                  <TableCell className="font-medium">{job.id}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        job.status === "success"
                          ? "default"
                          : job.status === "processing"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {job.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(job.created_at), "PPp")}</TableCell>
                  <TableCell>
                    {job.completed_at
                      ? format(new Date(job.completed_at), "PPp")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {job.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {job.error_message && (
                      <span className="text-destructive">{job.error_message}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(job.id, 'logs')}
                        className="h-8 px-2 lg:px-3"
                      >
                        Logs
                        {expanded[job.id] === 'logs' ? (
                          <ChevronUp className="ml-2 h-4 w-4" />
                        ) : (
                          <ChevronDown className="ml-2 h-4 w-4" />
                        )}
                      </Button>
                      {job.results && job.results.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpanded(job.id, 'results')}
                          className="h-8 px-2 lg:px-3"
                        >
                          Results
                          {expanded[job.id] === 'results' ? (
                            <ChevronUp className="ml-2 h-4 w-4" />
                          ) : (
                            <ChevronDown className="ml-2 h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
                {expanded[job.id] === 'logs' && (
                  <TableRow>
                    <TableCell colSpan={7} className="p-0">
                      <div className="border-t bg-muted/50 p-4">
                        <pre className="text-sm overflow-auto whitespace-pre-wrap">
                          {job.logs.join("\n")}
                        </pre>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {expanded[job.id] === 'results' && job.results && (
                  <TableRow>
                    <TableCell colSpan={7} className="p-0">
                      <div className="border-t bg-muted/50 p-4">
                        <div className="grid grid-cols-3 gap-4">
                          {job.results.map((result, index) => (
                            <div
                              key={index}
                              className="rounded-lg border bg-card p-3"
                            >
                              <div className="font-medium">Field: {result.field}</div>
                              <div className="text-sm text-muted-foreground">Type: {result.type}</div>
                              <div className="text-sm text-muted-foreground">Source: {result.source}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}