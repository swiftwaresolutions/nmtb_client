# Medical Records Report Template Guide

This guide explains how to use the standardized HIMS report design system for all medical records reports.

## 📋 Overview

The report template system provides:
- ✅ Consistent HIMS-branded styling
- ✅ Reusable components (Header, KPI Cards, Table)
- ✅ Built-in search, sort, print, and export functionality
- ✅ Responsive design with controlled scrolling
- ✅ Print-optimized layouts
- ✅ Clean, minimal design without scroll buttons or excessive console logging

---

## 📁 File Structure

```
src/medical-records/
├── styles/
│   └── reportStyles.css          # Global report styles
├── components/
│   ├── ReportHeader.tsx          # Reusable header with actions
│   ├── ReportKPICard.tsx         # KPI metric cards
│   └── ReportTable.tsx           # Sortable data table
├── utils/
│   └── reportUtils.ts            # Utility functions (search, sort, export)
└── REPORT_TEMPLATE_GUIDE.md      # This file
```

---

## 🎨 1. Importing Styles

**Always import the global report styles at the top of your report component:**

```tsx
import '../styles/reportStyles.css';
```

This gives you access to:
- `.report-card` - Card containers
- `.report-card-header` - Card headers
- `.kpi-border-left`, `.border-info-left`, `.border-danger-left` - KPI card variants
- `.table-hims` - Styled table
- `.action-icon` - Icon buttons
- `.no-print` - Hide elements when printing
- Many more utility classes

---

## 🧩 2. Using Components

### ReportHeader Component

Provides consistent header with title, subtitle, and action buttons.

```tsx
import ReportHeader from '../../components/ReportHeader';
import { printReport, exportToExcel, getDateRangeText } from '../../utils/reportUtils';

<ReportHeader
  title="Inpatient Register"
  subtitle={filteredByDate.length > 0 ? getDateRangeText(fromDate, toDate) : "Select date range and click Submit"}
  onPrint={handlePrint}
  onExport={handleExport}
  onSearch={handleSearch}
  showSearch={filteredByDate.length > 0}
  showSort={false}
  showPrint={filteredByDate.length > 0}
  showExport={filteredByDate.length > 0}
/>
```

**Key Points:**
- Conditionally show search/print/export only when data is loaded
- Use `getDateRangeText()` utility for consistent date formatting
- Show helpful message in subtitle when no data is loaded

**Props:**
- `title` (required) - Main heading text
- `subtitle` - Optional subheading (e.g., date range)
- `onPrint` - Print handler function
- `onExport` - Export handler function
- `onSearch` - Search handler (receives search term)
- `onSort` - Sort handler
- `showSearch` - Show/hide search icon (default: true)
- `showPrint` - Show/hide print icon (default: true)
- `showExport` - Show/hide export icon (default: true)
- `customActions` - Additional custom action butt Use conditional rendering to show only when data is available.

```tsx
import ReportKPICard from '../../components/ReportKPICard';

{/* KPI Statistics Section - Only show when data is loaded */}
{filteredByDate.length > 0 && (
  <Row className="mb-4">
    <Col md={2}>
      <ReportKPICard
        label="Total Patients"
        value={stats.totalPatients}
        variant="primary"
      />
    </Col>
    <Col md={2}>
      <ReportKPICard
        label="Male Total"
        value={stats.maleTotal}
        variant="info"
      />
    </Col>
    <Col md={2}>
      <ReportKPICard
        label="Male Child"
        value={stats.maleChildTotal}
        variant="success"
      />
    </Col>
    <Col md={2}>
      <ReportKPICard
        label="Female Total"
        value={stats.femaleTotal}
        variant="danger"
      />
    </Col>
    <Col md={2}>
      <ReportKPICard
        label="Female Child"
        value={stats.femaleChildTotal}
        variant="warning"
      />
    </Col>
  </Row>
)}
``` with Controlled Scrolling

Wrap the table in a scrollable container for better control and cleaner design.

```tsx
import ReportTable from '../../components/ReportTable';

// Table columns configuration
const columns = [
  { 
    key: "slNo", 
    label: "S.No", 
    sortable: false, 
    render: (_: any, __: any, idx: number) => idx + 1 
  },
  { key: "ipNo", label: "IP.No", sortable: true },
  { key: "opNo", label: "OP.No", sortable: true },
  { key: "patientName", label: "Patient Name", sortable: true },
  { key: "address", label: "Address", sortable: false },
  { 
    key: "sexAge", 
    label: "Sex / Age", 
    sortable: false,
    render: (record: any) => record ? `${record.sex} / ${record.age}` : ""
  },
  { key: "ward", label: "Ward Details", sortable: true },
  { key: "admissionDate", label: "D.O.ADMIS", sortable: true },
  { key: "admitDoctor", label: "Admit Doctor", sortable: true },
  { key: "department", label: "Department", sortable: true },
  { key: "user", label: "User", sortable: false }
];

{/* Data Table Section - Wrapped in Card with controlled scrolling */}
<Card className="report-card" style={{ padding: "0.75rem" }}>
  {/* Table Container with Scrolling */}
  <div 
    style={{ 
      maxHeight: "calc(115vh - 500px)", 
      minHeight: "350px",
      overflowY: "auto",
      overflowX: "auto",
      position: "relative"
    }}
  >
    <ReportTable
      data={displayedData}
      columns={columns}
      onSort={handleSort}
      responsive={false}
      emptyMessage={
        filteredByDate.length === 0
          ? "No data loaded. Please select date range and click Submit."
          : searchTerm
            ? "No records match your search criteria."
            : "No records found."
      }
    />
  </div>

  {/* Row Count Footer */}
  <div 
    style={{ 
      padding: "0.5rem 1rem", 
      borderTop: "2px solid #e0e0e0",
      background: "linear-gradient(to right, #f8f9fa, #ffffff)",
      textAlign: "start"
    }}
  >
    <sm className="text-muted" style={{ fontWeight: "500" }}>
      Total Data Rows: <strong>{displayedData.length}</strong>
      {searchTerm && (
        <span className="ms-2">
          (Filtered from {filteredByDate.length})
        </span>
      )}
    </sm 
  searchTableData, 
  sortTableData, 
  exportToExcel, 
  printReport,
  formatReportDate,
  getDateRangeText
} from '../../utils/reportUtils';
```

**Note:** Import paths use `../../` to go up two levels from `pages/registers/` to `medical-records/❌ **DO NOT** add scroll-to-top/bottom buttons (not needed with proper container height)
- ❌ **DO NOT** use refs for scroll control (keep it simple) sortable: true,
    render: (value) => <div className="fw-bold text-primary">{value}</div>
  },
  {
    key: 'patientName',
    label: 'Patient Name',
    sortable: true
  }
];

<ReportTable<PatientRecord>
  data={filteredData}
  columns={columns}
  onRowClick={(record) => handleRowClick(record)}
  onSort={(key, direction) => handleSort(key, direction)}
  responsive={true}
  hover={true}
  emptyMessage="No patients found"
/>
```

**Props:**
- `data` ( & Sort Combined

Create a function to update displayed data with both search and sort:

```tsx
// Update displayed data with search and sort
const updateDisplayedData = (records: any[], search: string, sortK: string, sortDir: "asc" | "desc") => {
  let result = records;

  // Apply search
  if (search) {
    result = searchTableData(result, search, ["ipNo", "opNo", "patientName", "address", "department", "admitDoctor", "ward"]);
  }

  // Apply sort
  if (sortK) {
    result = sortTableData(result, sortK, sortDir);
  }

  setDisplayedData(result);
};

// Call on search/sort change
React.useEffect(() => {
  updateDisplayedData(filteredByDate, searchTerm, sortKey, sortDirection);
}, [searchTerm, sortKey, sortDirection, filteredByDate]  headerClassName?: string; // Header cell CSS classes
}
```

---

## 🛠️ 3. Using Utility Functions

Import utilities for common operations:

```tsx
import {
  searchTableData,
  sortTableData,
  exportToExcel,
  exportToCSV,
  printReport,
  formatReportDate,
  getDateRangeText,
  paginateData,
  getTotalPages,
  getPaginationText
} from '../utils/reportUtils';
```

### Search

```tsx
const filteredData = searchTableData(
  data,
  searchTerm,
  ['ipNo', 'opNo', 'patientName', 'address']
);
```

### Sort

```tsx
const sortedData = sortTableData(
  data,
  'patientName',
Transform data to Excel format with proper column headers:

```tsx
const handleExport = () => {
  const exportData = displayedData.map((record, index) => ({
    "S.No": index + 1,
    "IP No": record.ipNo,
    "OP No": record.opNo,
    "Patient Name": record.patientName,
    "Address": record.address,
    "Sex": record.sex,
    "Age": record.age,
    "Ward": record.ward,
    "Admission Date": record.admissionDate,
    "Admit Doctor": record.admitDoctor,
    "Department": record.department,
    "User": record.user
  }));

  exportToExcel(
    exportData,
    `Inpatient_Register_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
    "Inpatient Register"
  );
}
```

### Export to CSV

```tsx
exportToCSV(data, 'inpatient-register');
```Filter Form Pattern

Standard date range filter with Submit and Reset buttons:

```tsx
{/* Filter Form Section */}
<Card className="mb-4 shadow-sm no-print">
  <Card.Body>
    <Form className="row g-3 align-items-end" onSubmit={handleFilterSubmit}>
      <Form.Group as={Col} md={4} controlId="fromDate">
        <Form.Label style={{ fontWeight: 600 }}>From Date</Form.Label>
        <Form.Control
          type="date"
          value={fromDate}
         Standard Report Structure

Follow this exact structure for all Medical Records reports (based on IPRegister.tsx)
      </Form.Group>
      <Form.Group as={Col} md={4} controlId="toDate">
        <Form.Label styl, useRef, useEffect } from "react";
import { Container, Card, Form, Button, Row, Col } from "react-bootstrap";
import ReportHeader from "../../components/ReportHeader";
import ReportKPICard from "../../components/ReportKPICard";
import ReportTable from "../../components/ReportTable";
import { 
  searchTableData, 
  sortTableData, 
  exportToExcel, 
  printReport,
  formatReportDate,
  getDateRangeText
} from "../../utils/reportUtils";
import "../../styles/reportStyles.css"
        </Button>
      </Form.Group>
    </Form>
  </Card.Body>
</Card>
formatReportDate('2025-12-01', 'DD-MM-YYYY'); // "01-12-2025"
formatReportDate('2025-12-01', 'DD/MM/YYYY'); // "01/12/2025"

// Get date range text
getDateRangeText('2025-12-01', '2026-01-02'); // "01/12/2025 - 02/01/2026"
```

### Pagination

```tsx
// Get paginated data slice
const paginatedData = paginateData(data, currentPage, pageSize);

// Calculate total pages
const totalPages = getTotalPages(data.length, pageSize);

// Get pagination text
const text = getPaginationText(currentPage, pageSize, data.length);
// "Showing 1 to 10 of 270 records"
```
// Refs
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter form state
  const [fromDate, setFromDate] = useState<string>("2025-12-01");
  const [toDate, setToDate] = useState<string>("2026-01-02");

  // Data state
  const [filteredByDate, setFilteredByDate] = useState<any[]>([]);
  conUpdate displayed data when search or sort changes
  React.useEffect(() => {
    updateDisplayedData(filteredByDate, searchTerm, sortKey, sortDirection);
  }, [searchTerm, sortKey, sortDirection, filteredByDate]);

  // Calculate statistics
  const calculateStats = (records: any[]) => {
    let maleCount = 0;
    let maleChildCount = 0;
    let femaleCount = 0;
    let femaleChildCount = 0;

    records.forEach(record => {
      if (record.sex === "Male") {
        if (record.isChild) {
          maleChildCount++;
        } else {
          maleCount++;
        }
      } else if (record.sex === "Female") {
        if (record.isChild) {
          femaleChildCount++;
        } else {
          femaleCount++;
        }
      }
    });

    setStats({
      totalPatients: records.length,
      maleTotal: maleCount,
      maleChildTotal: maleChildCount,
      femaleTotal: femaleCount,
      femaleChildTotal: femaleChildCount
    });
  };

  // Update displayed data with search and sort
  const updateDisplconfiguration
  const columns = [
    { key: "slNo", label: "S.No", sortable: false, render: (_: any, __: any, idx: number) => idx + 1 },
    { key: "ipNo", label: "IP.No", sortable: true },
    { key: "opNo", label: "OP.No", sortable: true },
    { key: "patientName", label: "Patient Name", sortable: true },
    { key: "address", label: "Address", sortable: false },
    { 
      key: "sexAge", 
      label: "Sex / Age", 
      sortable: false,
      render: (record: any) => record ? `${record.sex} / ${record.age}` : ""
    },
    { key: "ward", label: "Ward Details", sortable: true },
    { key: "admissionDate", label: "D.O.ADMIS", sortable: true },
    { key: "admitDoctor", label: "Admit Doctor", sortable: true },
    { key: "department", label: "Department", sortable: true },
    { key: "user", label: "User", sortable: falseonst handleReset = () => {
    setFromDate("2025-12-01");
    setToDate("2026-01-02");
    setFilteredByDate([]);
    setDisplayedData([]);
    setSearchTerm("");
    setSortKey("");
    setSortDirection("asc");
    setStats({
      totalPatients: 0,
      maleTotal: 0,
      maleChildTotal: 0,
      femaleTotal: 0,
      femaleChildTotal: 0
    });
  };
React.Fragment>
      <Container fluid className="px-4 py-3">
        {/* Report Header */}
        <ReportHeader
          title="Sample Report"
          subtitle={filteredByDate.length > 0 ? getDateRangeText(fromDate, toDate) : "Select date range and click Submit"}
          onPrint={handlePrint}
          onExport={handleExport}
          onSearch={handleSearch}
          showSearch={filteredByDate.length > 0}
          showSort={false}
          showPrint={filteredByDate.length > 0}
          showExport={filteredByDate.length > 0}
        />
        
        {/* Filter Form Section */}
        <Card className="mb-4 shadow-sm no-print">
          <Card.Body>
            <Form className="row g-3 align-items-end" onSubmit={handleFilterSubmit}>
              <Form.Group as={Col} md={4} controlId="fromDate">
                <Form.Label style={{ fontWeight: 600 }}>From Date</Form.Label>
                <Form.Control
                  type="date"
                  value={fromDate}
                  onChange={e => setFromDate(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group as={Col} md={4} controlId="toDate">
                <Form.Label style={{ fontWeight: 600 }}>To Date</Form.Label>
                <Form.Control
                  type="date"
                  value={toDate}
                  onChange={e => setToDate(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group as={Col} md={4} className="d-flex align-items-end gap-2">
                <Button type="submit" variant="primary" className="w-50">
                  Submit
                </Button>
                <Button type="button" variant="secondary" className="w-50" onClick={handleReset}>
                  Reset
                </Button>
              </Form.Group>
            </Form>
          </Card.Body>
        </Card>

        {/* KPI Statistics Section */}
        {filteredByDate.length > 0 && (
          <Row className="mb-4">
            <Col md={2}>
              <ReportKPICard
                label="Total Patients"
                value={stats.totalPatients}
                variant="primary"
              />
            </Col>
            <Col md={2}>
              <ReportKPICard
                label="Male Total"
                value={stats.maleTotal}
                variant="info"
              />
            </Col>
            <Col md={2}>
              <ReportKPICard
                label="Male Child"
                value={stats.maleChildTotal}
                variant="success"
              />
            </Col>
            <Col md={2}>
              <ReportKPICard
                label="Female Total"
                value={stats.femaleTotal}
                variant="danger"
              />
            </Col>
            <Col md={2}>
              <ReportKPICard
                label="Female Child"
                value={stats.femaleChildTotal}
                variant="warning"
              />
            </Col>
          </Row>
        )}

        {/* Data Table Section */}
        <Card className="report-card" style={{ padding: "0.75rem" }}>
          {/* Table Container with Scrolling */}
          <div 
            style={{ 
              maxHeight: "calc(115vh - 500px)", 
              minHeight: "350px",
              overflowY: "auto",
              overflowX: "auto",
              position: "relative"
            }}
          >
            <ReportTable
              data={displayedData}
              columns={columns}
              onSort={handleSort}
              responsive={false}
              emptyMessage={
                filteredByDate.length === 0
                  ? "No data loaded. Please select date range and click Submit."
                  : searchTerm
                    ? "No records match your search criteria."
                    : "No records found."
              }
            />
          </div>

          {/* Row Count */}
          <div 
            style={{ 
              padding: "0.5rem 1rem", 
              borderTop: "2px solid #e0e0e0",
              background: "linear-gradient(to right, #f8f9fa, #ffffff)",
              textAlign: "start"
            }}
          >
            <small className="text-muted" style={{ fontWeight: "500" }}>
              Total Data Rows: <strong>{displayedData.length}</strong>
              {searchTerm && (
                <span className="ms-2">
                  (Filtered from {filteredByDate.length})
                </span>
              )}
            </small>
          </div>
        </Card>
      </Container>
    </React.Fragmentkey);
    setSortDir(direction);
  };

  const handleExport = () => {
    exportToExcel(sortedData, 'sample-report', 'Data');
  };

  // Table columns definition
  const columns = [
    {
      key: 'slNo',
      label: 'S.No',
      sortable: true,
      className: 'ps-3',
      render: (_, __, index) => (page - 1) * pageSize + index + 1
    },
    {
      key: 'ipNo',
      label: 'IP No.',
      sortable: true,
      render: (value) => <div className="fw-bold text-primary">{value}</div>
    },
    {
      key: 'patientName',
      label: 'Patient  (Based on IPRegister.tsx Standard)

### DO:
1. ✅ **Always import `../../styles/reportStyles.css`** (note the path)
2. ✅ **Use ReportHeader with conditional visibility** for actions
3. ✅ **Wrap KPI cards in conditional rendering** (`{filteredByDate.length > 0 && ...}`)
4. ✅ **Use controlled scrolling container** with `maxHeight` and `minHeight`
5. ✅ **Set `responsive={false}` on ReportTable** (prevents Bootstrap wrapper)
6. ✅ **Show contextual empty messages** (different for no data vs. no results)
7. ✅ **Add row count footer** with filter information
8. ✅ **Use `handleFilterSubmit`** for form submission
9. ✅ **Include Reset button** to clear filters
10. ✅ **Separate state** for `filteredByDate` and `displayedData`
11. ✅ **Calculate statistics** after filtering by date
12. ✅ **Use `getDateRangeText()` utility** for subtitle
13. ✅ **Transform data for Excel export** with proper column headers
14. ✅ **Use `formatReportDate()` in export filename**

### DON'T:
1. ❌ **NO scroll-to-top/bottom buttons** (not needed with proper container)
2. ❌ **NO console.log statements** in production code
3. ❌ **NO refs for scroll control** (keep it simple)
4. ❌ **NO pagination** (use scrolling container instead)
5. ❌ **NO showing actions when no data** (conditional rendering)
6. ❌ **NO complex scroll event handlers** (native browser scrolling is fine)
        </span>
      )
    }
  ];

  return (
    <Container fluid className= (follow IPRegister.tsx):

### Imports & Setup:
- [ ] Import `../../styles/reportStyles.css`
- [ ] Import components: `ReportHeader`, `ReportKPICard`, `ReportTable`
- [ ] Import utilities: `searchTableData`, `sortTableData`, `exportToExcel`, `printReport`, `formatReportDate`, `getDateRangeText`
- [ ] Use TypeScript with proper interfaces

### State Management:
- [ ] Create `filteredByDate` state (data after date filter)
- [ ] Create `displayedData` state (after search & sort)
- [ ] Create `stats` state for KPI metrics
- [ ] Create `searchTerm`, `sortKey`, `sortDirection` states
- [ ] Create `fromDate`, `toDate` states

### Component Structure:
- [ ] Use `<ReportHeader>` with conditional `showSearch`, `showPrint`, `showExport`
- [ ] Use subtitle: `filteredByDate.length > 0 ? getDateRangeText(...) : "Select date range..."`
- [ ] Add filter form with `onSubmit` and Reset button
- [ ] Wrap KPI cards in `{filteredByDate.length > 0 && ...}`
- [ ] Use scrolling container: `maxHeight: "calc(115vh - 500px)"`, `minHeight: "350px"`
- [ ] Set `<ReportTable responsive={false} />`
- [ ] Add row count footer with filter information

### Functions:
- [ ] Implement `calculateStats(records)` for KPI metrics
---

## 🎯 10. Key Design Principles (IPRegister.tsx Standard)

### Clean & Minimal
- No unnecessary UI elements (scroll buttons, excessive controls)
- Native browser scrolling with controlled container height
- Conditional visibility for all action buttons

### Data Flow
```
User Clicks Submit 
  → handleFilterSubmit() 
  → Fetch/Filter by Date 
  → calculateStats() 
  → setFilteredByDate() 
  → updateDisplayedData()
    → Apply Search 
    → Apply Sort 
    → setDisplayedData()
```

### State Separation
- `filteredByDate`: Data after date range filter (from API/backend)
- `displayedData`: Final data after search & sort (for table rendering)
- `stats`: Calculated KPI metrics (from `filteredByDate`)

### Responsive Design
- Form: 3 equal columns (From Date, To Date, Buttons)
- KPIs: 5 columns (`md={2}` each) for balanced layout
- Table: Full width with horizontal scroll if needed

### Empty States
- Before Submit: "Select date range and click Submit"
- No Data: "No data loaded. Please select date range and click Submit."
- Search No Results: "No records match your search criteria."
- Reset Clears Everything: All states back to initial values

---

**Reference Implementation:** `src/medical-records/pages/registers/IPRegister.tsx`

**Last Updated:** January 2, 2026  
**Version:** 2.0.0 (Updated to match IPRegister.tsx standard)andleFilterSubmit(e)` with API call
- [ ] Implement `handleReset()` to clear all filters
- [ ] Implement `handleSearch(term)` to set search term
- [ ] Implement `handleSort(key)` with toggle direction
- [ ] Implement `handlePrint()` calling `printReport()`
- [ ] Implement `handleExport()` with data transformation

### Effects:
- [ ] Update displayed data on `[searchTerm, sortKey, sortDirection, filteredByDate]` change
- [ ] NO scroll event listeners or refs needed

### What NOT to Include:
- [ ] ❌ NO scroll-to-top/bottom buttons
- [ ] ❌ NO console.log statements
- [ ] ❌ NO scroll refs or handlers
- [ ] ❌ NO pagination (use scrolling)
- [ ] ❌ NO showing empty KPI cards
          <Form className="row g-3 align-items-end">
            <Form.Group as={Col} md={2}>
              <Form.Label className="small fw-bold">From Date</Form.Label>
              <Form.Control
                type="date"
                size="sm"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </Form.Group>
            <Form.Group as={Col} md={2}>
              <Form.Label className="small fw-bold">To Date</Form.Label>
              <Form.Control
                type="date"
                size="sm"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </Form.Group>
            <Col md={2}>
              <Button size="sm" variant="primary" className="w-100 fw-bold">
                <i className="bi bi-filter me-1"></i>Apply
              </Button>
            </Col>
          </Form>
        </Card.Body>
      </Card>

      {/* KPI Cards */}
      <Row className="g-3 mb-4">
        <Col>
          <ReportKPICard label="Total Records" value={data.length} variant="primary" />
        </Col>
        <Col>
          <ReportKPICard label="Filtered" value={searchedData.length} variant="info" />
        </Col>
      </Row>

      {/* Data Table */}
      <Card className="report-card shadow mb-4">
        <div className="report-card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">Data Records</h6>
        </div>
        
        <ReportTable
          data={paginatedData}
          columns={columns}
          onSort={handleSort}
          emptyMessage="No records found for the selected criteria"
        />

        {/* Pagination */}
        <Card.Footer className="bg-white border-top-0 py-3 no-print">
          <div className="d-flex justify-content-between">
            <span className="text-muted small">
              Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, sortedData.length)} of {sortedData.length} records
            </span>
            <div>
              <Button
                size="sm"
                variant="outline-primary"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline-primary"
                className="ms-2"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </Card.Footer>
      </Card>
    </Container>
  );
}
```

---

## 🎯 5. Key CSS Classes Reference

### Card Components
- `.report-card` - Main card container
- `.report-card-header` - Card header with actions
- `.kpi-border-left` - Primary blue left border
- `.border-info-left` - Info cyan left border
- `.border-danger-left` - Danger red left border
- `.border-success-left` - Success green left border
- `.border-warning-left` - Warning yellow left border

### Table
- `.table-hims` - Styled HIMS table
- Sortable headers automatically get hover effect

### Utilities
- `.no-print` - Hide element when printing
- `.action-icon` - Icon buttons with hover effect
- `.text-xs` - Extra small text (0.65rem)

### Search
- `.search-input` - Animated search input
- `.search-input.active` - Expanded search input

---

## 📦 6. Dependencies

Make sure you have these packages installed:

```bash
npm install xlsx
npm install react-bootstrap bootstrap react-bootstrap-icons
```

---

## ✅ 7. Best Practices

1. **Always import `reportStyles.css`** at the top of your component
2. **Use ReportHeader** for consistent page headers
3. **Use ReportKPICard** for metrics display
4. **Use ReportTable** for data tables
5. **Use utility functions** instead of custom implementations
6. **Add `no-print` class** to filters, search, and pagination
7. **Keep data transformations** in component state (search, sort, filter)
8. **Use TypeScript interfaces** for type safety

---

## 🖨️ 8. Print Optimization

Elements with `.no-print` class are automatically hidden when printing:
- Filter forms
- Search bars
- Action buttons
- Pagination controls

The CSS automatically applies print-friendly styling:
- Removes shadows
- Adjusts borders
- Optimizes table headers
- Sets proper page margins

---

## 🔄 9. Quick Reference Checklist

When creating a new report page:

- [ ] Import `../styles/reportStyles.css`
- [ ] Import necessary components from `../components/`
- [ ] Import utility functions from `../utils/reportUtils`
- [ ] Use `<ReportHeader>` for page title
- [ ] Use `<ReportKPICard>` for statistics
- [ ] Use `<ReportTable>` for data display
- [ ] Add `.no-print` to interactive elements
- [ ] Implement search using `searchTableData()`
- [ ] Implement sort using `sortTableData()`
- [ ] Use `exportToExcel()` for export functionality
- [ ] Use `printReport()` for print functionality

---

## 📞 Support

For questions or issues with the report template system, refer to:
- This guide (REPORT_TEMPLATE_GUIDE.md)
- Component source code in `src/medical-records/components/`
- Utility source code in `src/medical-records/utils/reportUtils.ts`
- CSS source in `src/medical-records/styles/reportStyles.css`

---

**Last Updated:** January 2, 2026
**Version:** 1.0.0
