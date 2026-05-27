/**
 * Medical Records Report Utilities
 * Provides reusable functions for search, sort, export, and print functionality
 */

import * as XLSX from 'xlsx';

/**
 * Generic table search function
 * @param data - Array of data objects to search through
 * @param searchTerm - Search term to filter by
 * @param searchFields - Array of field names to search in
 * @returns Filtered array
 */
export const searchTableData = <T extends Record<string, any>>(
  data: T[],
  searchTerm: string,
  searchFields: (keyof T)[]
): T[] => {
  if (!searchTerm.trim()) return data;

  const lowerSearchTerm = searchTerm.toLowerCase().trim();

  return data.filter((item) => {
    return searchFields.some((field) => {
      const fieldValue = item[field];
      if (fieldValue == null) return false;
      return String(fieldValue).toLowerCase().includes(lowerSearchTerm);
    });
  });
};

/**
 * Sort table data by a specific field
 * @param data - Array of data to sort
 * @param field - Field name to sort by
 * @param direction - Sort direction ('asc' or 'desc')
 * @returns Sorted array
 */
export const sortTableData = <T extends Record<string, any>>(
  data: T[],
  field: keyof T,
  direction: 'asc' | 'desc' = 'asc'
): T[] => {
  return [...data].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];

    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return direction === 'asc' ? 1 : -1;
    if (bVal == null) return direction === 'asc' ? -1 : 1;

    const aStr = String(aVal).toLowerCase();
    const bStr = String(bVal).toLowerCase();

    if (aStr < bStr) return direction === 'asc' ? -1 : 1;
    if (aStr > bStr) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

/**
 * Export table data to Excel
 * @param data - Array of data to export
 * @param filename - Name of the file (without extension)
 * @param sheetName - Name of the worksheet
 */
export const exportToExcel = <T extends Record<string, any>>(
  data: T[],
  filename: string = 'report',
  sheetName: string = 'Sheet1'
): void => {
  try {
    // Create worksheet from data
    const ws = XLSX.utils.json_to_sheet(data);

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Generate Excel file and trigger download
    XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    alert('Failed to export data to Excel. Please try again.');
  }
};

/**
 * Export table data to CSV
 * @param data - Array of data to export
 * @param filename - Name of the file (without extension)
 */
export const exportToCSV = <T extends Record<string, any>>(
  data: T[],
  filename: string = 'report'
): void => {
  try {
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    // Get headers from first object
    const headers = Object.keys(data[0]);
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape commas and quotes
          const stringValue = String(value ?? '');
          return stringValue.includes(',') || stringValue.includes('"')
            ? `"${stringValue.replace(/"/g, '""')}"`
            : stringValue;
        }).join(',')
      )
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    alert('Failed to export data to CSV. Please try again.');
  }
};

/**
 * Trigger browser print dialog
 */
export const printReport = (): void => {
  window.print();
};

/**
 * Format date for display
 * @param date - Date string or Date object
 * @param format - Format type ('DD-MM-YYYY' or 'DD/MM/YYYY')
 * @returns Formatted date string
 */
export const formatReportDate = (
  date: string | Date,
  format: 'DD-MM-YYYY' | 'DD/MM/YYYY' = 'DD-MM-YYYY'
): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();

    return format === 'DD-MM-YYYY' 
      ? `${day}-${month}-${year}` 
      : `${day}/${month}/${year}`;
  } catch (error) {
    return 'Invalid Date';
  }
};

/**
 * Calculate date range display text
 * @param fromDate - Start date
 * @param toDate - End date
 * @returns Formatted date range string
 */
export const getDateRangeText = (fromDate: string, toDate: string): string => {
  return `${formatReportDate(fromDate, 'DD/MM/YYYY')} - ${formatReportDate(toDate, 'DD/MM/YYYY')}`;
};

/**
 * Paginate data array
 * @param data - Array to paginate
 * @param page - Current page number (1-indexed)
 * @param pageSize - Number of items per page
 * @returns Paginated data slice
 */
export const paginateData = <T>(
  data: T[],
  page: number,
  pageSize: number
): T[] => {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return data.slice(startIndex, endIndex);
};

/**
 * Calculate total pages
 * @param totalItems - Total number of items
 * @param pageSize - Number of items per page
 * @returns Total number of pages
 */
export const getTotalPages = (totalItems: number, pageSize: number): number => {
  return Math.ceil(totalItems / pageSize);
};

/**
 * Get pagination display text
 * @param page - Current page
 * @param pageSize - Items per page
 * @param totalItems - Total number of items
 * @returns Display text (e.g., "Showing 1 to 10 of 270 records")
 */
export const getPaginationText = (
  page: number,
  pageSize: number,
  totalItems: number
): string => {
  if (totalItems === 0) return 'No records found';
  
  const startIndex = (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, totalItems);
  
  return `Showing ${startIndex} to ${endIndex} of ${totalItems} records`;
};

/**
 * Scroll table container to top
 * @param containerRef - React ref to the scrollable container
 */
export const scrollToTop = (containerRef: React.RefObject<HTMLDivElement>): void => {
  if (containerRef.current) {
    containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

/**
 * Scroll table container to bottom
 * @param containerRef - React ref to the scrollable container
 */
export const scrollToBottom = (containerRef: React.RefObject<HTMLDivElement>): void => {
  if (containerRef.current) {
    containerRef.current.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' });
  }
};
