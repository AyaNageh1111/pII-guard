import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Job } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function exportToCSV(jobs: Job[]) {
  const headers = ['ID', 'Status', 'Created At', 'Completed At', 'Tags', 'Error Message', 'PII Detections'];
  const rows = jobs.map(job => [
    job.id,
    job.status,
    job.created_at,
    job.completed_at || '',
    job.tags.join(', '),
    job.error_message || '',
    job.results?.length.toString() || '0'
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `pii-detection-report-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
}

export function exportToJSON(jobs: Job[]) {
  const jsonContent = JSON.stringify(jobs, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `pii-detection-report-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
}

export function generateShareableURL(filters: Record<string, any>) {
  const url = new URL(window.location.href);
  Object.entries(filters).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      url.searchParams.delete(key);
      value.forEach(v => url.searchParams.append(`${key}[]`, v));
    } else if (value !== undefined && value !== null) {
      url.searchParams.set(key, value.toString());
    }
  });
  return url.toString();
}