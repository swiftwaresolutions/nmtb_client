import { useState, useMemo } from "react";

interface UseTableSearchProps<T> {
  data: T[];
  searchFields: (keyof T)[];
  debounceMs?: number;
}

interface UseTableSearchReturn<T> {
  filteredData: T[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  resultCount: number;
  totalCount: number;
}

/**
 * Custom hook for table search functionality
 * @param data - Array of data to search through
 * @param searchFields - Array of field names to search in
 * @param debounceMs - Optional debounce delay in milliseconds (default: 0)
 * @returns Object containing filtered data and search controls
 *
 * @example
 * const { filteredData, searchTerm, setSearchTerm } = useTableSearch({
 *   data: labTests,
 *   searchFields: ['name', 'deptName'],
 * });
 */
export function useTableSearch<T extends Record<string, any>>({
  data,
  searchFields,
  debounceMs = 0,
}: UseTableSearchProps<T>): UseTableSearchReturn<T> {
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) {
      return data;
    }

    const lowerSearchTerm = searchTerm.toLowerCase().trim();

    return data.filter((item) => {
      // Check if any of the specified fields contain the search term
      return searchFields.some((field) => {
        const fieldValue = item[field];

        // Handle null/undefined values
        if (fieldValue == null) return false;

        // Convert to string and search (case-insensitive)
        return String(fieldValue).toLowerCase().includes(lowerSearchTerm);
      });
    });
  }, [data, searchTerm, searchFields]);

  return {
    filteredData,
    searchTerm,
    setSearchTerm,
    resultCount: filteredData.length,
    totalCount: data.length,
  };
}
