
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";

// Helper to generate CSV content from data
export const generateCSV = (data: any[], title: string): string => {
  if (!data || data.length === 0) return '';
  
  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create CSV header row
  const csvRows = [headers.join(',')];
  
  // Add data rows
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      // Wrap strings with quotes and handle special cases
      return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
    });
    csvRows.push(values.join(','));
  });
  
  return csvRows.join('\n');
};

// Helper to download a file
export const downloadFile = (content: string, fileName: string, contentType: string): void => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Export functions for different formats
export const exportAsCSV = (data: any[], title: string = 'export'): void => {
  const timestamp = format(new Date(), 'yyyy-MM-dd_HHmm');
  const fileName = `${title.toLowerCase().replace(/\s+/g, '_')}_${timestamp}.csv`;
  const csvContent = generateCSV(data, title);
  downloadFile(csvContent, fileName, 'text/csv');
};

export const exportAsExcel = (data: any[], title: string = 'export'): void => {
  // For client-side only: Create a CSV that Excel can open
  // For a true Excel file, you'd need a library like exceljs or xlsx
  const timestamp = format(new Date(), 'yyyy-MM-dd_HHmm');
  const fileName = `${title.toLowerCase().replace(/\s+/g, '_')}_${timestamp}.xls`;
  const csvContent = generateCSV(data, title);
  downloadFile(csvContent, fileName, 'application/vnd.ms-excel');
};

// Simple PDF export using browser print functionality
export const exportAsPDF = (title: string = 'export'): void => {
  // For client-side only: Use browser print functionality
  // For proper PDF generation, you'd need a library like jsPDF
  const timestamp = format(new Date(), 'yyyy-MM-dd_HHmm');
  
  const originalTitle = document.title;
  document.title = `${title} - ${timestamp}`;
  
  const printHandler = () => {
    document.title = originalTitle;
    window.removeEventListener('afterprint', printHandler);
  };
  
  window.addEventListener('afterprint', printHandler);
  window.print();
};
