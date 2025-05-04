
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { fetchPiiJobs, Job } from '@/services/piiJobsApi';

export function usePiiJobs() {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedTaskGroups, setSelectedTaskGroups] = useState<string[]>([]);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [itemsPerPage] = useState(100);
  
  // Get all available tags and task groups from the jobs
  const availableTags = [...new Set(jobs.flatMap(job => job.tags))].sort();
  const availableTaskGroups = [...new Set(jobs
    .filter(job => job.task_group_id)
    .map(job => job.task_group_id as string))].sort();

  const loadJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      // Call the actual API with filters
      const data = await fetchPiiJobs({
        status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        searchQuery: searchQuery || undefined,
        page,
        pageSize: itemsPerPage
      });
      
      setJobs(data);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load PII jobs';
      setError(errorMessage);
      toast({
        title: "Error loading jobs",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedStatuses, selectedTags, page, itemsPerPage, toast]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  // Refresh function for manual/auto refresh
  const refreshJobs = useCallback(() => {
    loadJobs();
  }, [loadJobs]);

  // Filter jobs based on selected filters
  const filteredJobs = jobs.filter(job => {
    // Search query filter
    if (searchQuery) {
      const tagMatch = searchQuery.startsWith('tag:') 
        ? job.tags.some(tag => tag.toLowerCase().includes(searchQuery.substring(4).toLowerCase()))
        : false;
      
      const groupMatch = searchQuery.startsWith('group:') && job.task_group_id
        ? job.task_group_id.toLowerCase().includes(searchQuery.substring(6).toLowerCase())
        : false;
      
      const idMatch = job.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!tagMatch && !idMatch && !groupMatch) {
        return false;
      }
    }
    
    // Status filter
    if (selectedStatuses.length > 0 && !selectedStatuses.includes(job.status)) {
      return false;
    }
    
    // Tags filter
    if (selectedTags.length > 0 && !job.tags.some(tag => selectedTags.includes(tag))) {
      return false;
    }
    
    // Task groups filter
    if (selectedTaskGroups.length > 0) {
      if (!job.task_group_id || !selectedTaskGroups.includes(job.task_group_id)) {
        return false;
      }
    }
    
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const paginatedJobs = filteredJobs.slice(
    page * itemsPerPage, 
    page * itemsPerPage
  );

  // Handler functions
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatuses(prev => 
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
    setPage(1);
  };

  const handleTagChange = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
    setPage(1);
  };
  
  const handleTaskGroupChange = (group: string) => {
    setSelectedTaskGroups(prev => 
      prev.includes(group)
        ? prev.filter(g => g !== group)
        : [...prev, group]
    );
    setPage(1);
  };

  const clearAllFilters = () => {
    setSelectedStatuses([]);
    setSelectedTags([]);
    setSelectedTaskGroups([]);
    setSearchQuery('');
    setPage(1);
  };

  return {
    jobs: paginatedJobs,
    allJobs: jobs,
    isLoading,
    error,
    searchQuery,
    selectedStatuses,
    selectedTags,
    selectedTaskGroups,
    availableTags,
    availableTaskGroups,
    page,
    totalPages,
    setPage,
    handleSearchChange,
    handleStatusChange,
    handleTagChange,
    handleTaskGroupChange,
    clearAllFilters,
    refreshJobs
  };
}
