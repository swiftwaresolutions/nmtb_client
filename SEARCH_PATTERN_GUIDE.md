# Reusable Search Pattern Guide

This document explains how to implement the reusable search functionality across HIMS application pages.

## Overview

The search pattern consists of two main components:
1. **`useTableSearch` Hook** - Custom React hook for filtering data
2. **`SearchInput` Component** - Reusable UI component for search input

## Files Location

- **Hook**: `src/hooks/useTableSearch.ts`
- **Component**: `src/components/SearchInput.tsx`

---

## Usage Guide

### Step 1: Import the Hook and Component

```tsx
import { useTableSearch } from '../../../../../hooks/useTableSearch';
import SearchInput from '../../../../../components/SearchInput';
```

### Step 2: Use the Hook in Your Component

```tsx
const { 
  filteredData, 
  searchTerm, 
  setSearchTerm,
  resultCount,
  totalCount
} = useTableSearch({
  data: yourDataArray,           // Array of data to search
  searchFields: ['field1', 'field2'],  // Fields to search in
});
```

### Step 3: Add the SearchInput Component to Your UI

```tsx
<SearchInput
  searchTerm={searchTerm}
  onSearchChange={setSearchTerm}
  placeholder="Search by name, code..."
  resultCount={resultCount}
  totalCount={totalCount}
  showResultCount={true}
/>
```

### Step 4: Use Filtered Data in Your Table/List

```tsx
<tbody>
  {filteredData.length === 0 ? (
    <tr>
      <td colSpan={4} style={{ textAlign: "center" }}>
        {searchTerm ? "No results match your search." : "No data available."}
      </td>
    </tr>
  ) : (
    filteredData.map((item, idx) => (
      <tr key={item.id}>
        {/* Your table row content */}
      </tr>
    ))
  )}
</tbody>
```

---

## Complete Example

Here's a complete example from the Lab Test Master page:

```tsx
import React, { useState, useEffect } from 'react';
import { Table } from 'react-bootstrap';
import { useTableSearch } from '../../../../../hooks/useTableSearch';
import SearchInput from '../../../../../components/SearchInput';

const MyComponent = () => {
  const [labTests, setLabTests] = useState([]);
  
  // Initialize search
  const {
    filteredData: filteredTests,
    searchTerm,
    setSearchTerm,
    resultCount,
    totalCount,
  } = useTableSearch({
    data: labTests,
    searchFields: ['name', 'deptName'],  // Search in test name and department
  });

  return (
    <div>
      {/* Search Input */}
      <SearchInput
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search tests by name or department..."
        resultCount={resultCount}
        totalCount={totalCount}
        showResultCount={true}
      />

      {/* Results Table */}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Test Name</th>
            <th>Department</th>
          </tr>
        </thead>
        <tbody>
          {filteredTests.length === 0 ? (
            <tr>
              <td colSpan={3} style={{ textAlign: "center" }}>
                {searchTerm 
                  ? "No tests match your search." 
                  : "No tests available."}
              </td>
            </tr>
          ) : (
            filteredTests.map((test, idx) => (
              <tr key={test.id}>
                <td>{idx + 1}</td>
                <td>{test.name}</td>
                <td>{test.deptName}</td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
};
```

---

## Multiple Search Instances in One Page

If you need multiple search instances (e.g., for active and blocked items), use separate hook instances:

```tsx
// Search for active items
const {
  filteredData: filteredActive,
  searchTerm: activeSearchTerm,
  setSearchTerm: setActiveSearchTerm,
  resultCount: activeResultCount,
  totalCount: activeTotalCount,
} = useTableSearch({
  data: activeItems,
  searchFields: ['name', 'code'],
});

// Search for blocked items
const {
  filteredData: filteredBlocked,
  searchTerm: blockedSearchTerm,
  setSearchTerm: setBlockedSearchTerm,
  resultCount: blockedResultCount,
  totalCount: blockedTotalCount,
} = useTableSearch({
  data: blockedItems,
  searchFields: ['name', 'code'],
});

// Use conditionally based on tab/view
<SearchInput
  searchTerm={showBlocked ? blockedSearchTerm : activeSearchTerm}
  onSearchChange={showBlocked ? setBlockedSearchTerm : setActiveSearchTerm}
  placeholder="Search..."
  resultCount={showBlocked ? blockedResultCount : activeResultCount}
  totalCount={showBlocked ? blockedTotalCount : activeTotalCount}
/>
```

---

## Hook API Reference

### `useTableSearch<T>`

**Parameters:**
- `data: T[]` - Array of objects to search through
- `searchFields: (keyof T)[]` - Array of field names to search in
- `debounceMs?: number` - Optional debounce delay (default: 0)

**Returns:**
- `filteredData: T[]` - Filtered array based on search term
- `searchTerm: string` - Current search term
- `setSearchTerm: (term: string) => void` - Function to update search term
- `resultCount: number` - Number of filtered results
- `totalCount: number` - Total number of items in original data

---

## Component API Reference

### `SearchInput`

**Props:**
- `searchTerm: string` - Current search value (required)
- `onSearchChange: (term: string) => void` - Callback when search changes (required)
- `placeholder?: string` - Input placeholder text (default: "Search...")
- `resultCount?: number` - Number of filtered results
- `totalCount?: number` - Total number of items
- `showResultCount?: boolean` - Show/hide result counter (default: true)
- `className?: string` - Additional CSS classes

---

## Features

### ✅ Case-Insensitive Search
Automatically converts search term and field values to lowercase for matching.

### ✅ Multi-Field Search
Search across multiple fields simultaneously. If any field matches, the item is included.

### ✅ Null/Undefined Handling
Gracefully handles null or undefined field values without errors.

### ✅ Trim Whitespace
Automatically trims leading/trailing whitespace from search term.

### ✅ Clear Button
Built-in clear button appears when search term is not empty.

### ✅ Result Counter
Shows "Showing X of Y results" or "Total: Y" based on search state.

### ✅ Search Icon
Visual indicator showing the input is for search.

---

## Best Practices

1. **Choose Relevant Fields**: Only include fields that users would logically search for (names, codes, descriptions).

2. **Provide Clear Placeholders**: Tell users what fields are being searched.
   ```tsx
   placeholder="Search by patient name, UHID, or phone number..."
   ```

3. **Show Appropriate Messages**: Differentiate between "no data" and "no search results".
   ```tsx
   {searchTerm ? "No results match your search." : "No data available."}
   ```

4. **Consistent Styling**: Use the component's className prop to match your page layout.
   ```tsx
   <SearchInput className="mb-3" {...props} />
   ```

5. **Performance**: For very large datasets (>1000 items), consider enabling debouncing:
   ```tsx
   useTableSearch({
     data: largeDataset,
     searchFields: ['name'],
     debounceMs: 300,  // 300ms delay
   });
   ```

---

## Common Use Cases

### 1. Patient List
```tsx
searchFields: ['uhid', 'name', 'phoneNumber', 'age']
placeholder: "Search patients by UHID, name, phone..."
```

### 2. Medicine Inventory
```tsx
searchFields: ['medicineName', 'genericName', 'manufacturer']
placeholder: "Search medicines by name, generic, or manufacturer..."
```

### 3. Employee Records
```tsx
searchFields: ['empId', 'name', 'department', 'designation']
placeholder: "Search employees by ID, name, or department..."
```

### 4. Bill/Invoice List
```tsx
searchFields: ['billNo', 'patientName', 'uhid']
placeholder: "Search by bill number, patient name, or UHID..."
```

---

## Troubleshooting

### Search Not Working
- Ensure `searchFields` match the exact property names in your data objects
- Check that data is an array and not null/undefined
- Verify TypeScript types match your data structure

### Performance Issues
- Enable debouncing for large datasets
- Reduce the number of `searchFields` if not necessary
- Consider pagination for extremely large lists (>5000 items)

### Result Count Not Showing
- Ensure you're passing both `resultCount` and `totalCount` props
- Set `showResultCount={true}` explicitly if needed

---

## Future Enhancements

Potential improvements for future versions:
- Advanced search (AND/OR operators)
- Field-specific search (search only in selected field)
- Regular expression support
- Fuzzy matching
- Search history
- Export filtered results

---

## Support

For issues or questions about the search pattern:
1. Check this documentation first
2. Review the implementation in `src/lab/pages/masters/test/add/AddTest.tsx`
3. Contact the development team

---

**Last Updated**: December 20, 2025
**Version**: 1.0.0
