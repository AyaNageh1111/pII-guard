import type { FilterJobsDTOType } from './types';

export async function fetchJobs(filters: FilterJobsDTOType) {
  const params = new URLSearchParams();
  
  if (filters.status) params.append('status', filters.status);
  if (filters.tags && filters.tags.length > 0) {
    filters.tags.forEach(tag => params.append('tags[]', tag));
  }
  params.append('sort_direction', filters.sort_direction);
  params.append('sort_by', filters.sort_by);
  params.append('page', filters.page.toString());
  params.append('page_size', filters.page_size.toString());

  const response = await fetch(`/api/jobs?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch jobs');
  }
  return response.json();
}