import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Container, Card, Form, Button, Row, Col } from "react-bootstrap";
import ReportHeader from "../../../medical-records/components/ReportHeader";
import ReportTable from "../../../medical-records/components/ReportTable";
import {
  searchTableData,
  sortTableData,
  exportToExcel,
  printReport,
  getDateRangeText
} from "../../../medical-records/utils/reportUtils";
import "../../../medical-records/styles/reportStyles.css";

interface CharityRow {
  patientName: string;
  uhid: string;
  ipNo: string;
  total: number;
  charity: number;
  charitySlip: string;
  authorized: string;
  date: string;
  time: string;
  user: string;
  isTotal?: boolean;
}

// Category definitions
const CHARITY_CATEGORIES = [
  { value: "staff", label: "Staff Category", data: [] as CharityRow[] },
  { value: "general", label: "General Category", data: [] as CharityRow[] },
  { value: "nursing", label: "Nursing Student Cards", data: [] as CharityRow[] },
  { value: "nlem", label: "Nlem Student Cards", data: [] as CharityRow[] },
  { value: "mrsk", label: "Mrsk Student Cards", data: [] as CharityRow[] },
  { value: "chbRegular", label: "CHB Regular Staff", data: [] as CharityRow[] },
  { value: "chbRetired", label: "CHB Retired Staff", data: [] as CharityRow[] },
  { value: "internship", label: "Internship", data: [] as CharityRow[] },
  { value: "chbContract", label: "CHB Contract Staff", data: [] as CharityRow[] },
  { value: "depNotEarnings", label: "CHB Regular Staff Dependent Not Earnings", data: [] as CharityRow[] },
  { value: "depBelow25", label: "CHB Regular Staff Dependent Below 25y", data: [] as CharityRow[] },
  { value: "depParentsStaying", label: "CHB Regular Staff Dependent Parents Staying", data: [] as CharityRow[] },
  { value: "depParentsNotStaying", label: "CHB Regular Staff Dependent Parents Not Staying (50%)", data: [] as CharityRow[] }
];

const initialFromDate = "2025-12-01";
const initialToDate = "2025-12-31";

function formatAmount(value: number): string {
  return value.toFixed(2);
}

function renderAmountCell(value: number, isTotal?: boolean) {
  return (
    <span className={isTotal ? "fw-bold text-danger" : "fw-semibold text-gray-800"}>
      {formatAmount(value)}
    </span>
  );
}

function CharityRegister() {
  const [fromDate, setFromDate] = useState<string>(initialFromDate);
  const [toDate, setToDate] = useState<string>(initialToDate);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortKey, setSortKey] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedCategory, setSelectedCategory] = useState<string>("staff");

  // Single filtered and displayed state
  const [filteredData, setFilteredData] = useState<CharityRow[]>([]);
  const [displayedData, setDisplayedData] = useState<CharityRow[]>([]);

  // Get current category data
  const getCurrentCategoryData = useCallback(() => {
    return CHARITY_CATEGORIES.find(cat => cat.value === selectedCategory)?.data || [];
  }, [selectedCategory]);

  const updateDisplayed = useCallback(
    (records: CharityRow[], search: string, sortK: string, sortDir: "asc" | "desc") => {
      let result: CharityRow[] = records;

      if (search) {
        result = searchTableData(result, search, ["patientName", "uhid", "ipNo", "user", "authorized", "charitySlip"]);
      }

      if (sortK) {
        result = sortTableData(result, sortK as keyof CharityRow, sortDir);
      }

      setDisplayedData(result);
    },
    []
  );

  useEffect(() => {
    updateDisplayed(filteredData, searchTerm, sortKey, sortDirection);
  }, [filteredData, searchTerm, sortKey, sortDirection, updateDisplayed]);

  // Update filtered data when category changes
  useEffect(() => {
    setFilteredData(getCurrentCategoryData());
  }, [selectedCategory, getCurrentCategoryData]);

  const calculateTotals = (data: CharityRow[]) => {
    return data.reduce(
      (acc: { total: number; charity: number }, row: CharityRow) => {
        acc.total += row.total;
        acc.charity += row.charity;
        return acc;
      },
      { total: 0, charity: 0 }
    );
  };

  const totals = useMemo(() => calculateTotals(displayedData), [displayedData]);

  const tableWithTotal = useMemo<CharityRow[]>(() => {
    return [
      ...displayedData,
      {
        patientName: "Total",
        uhid: "",
        ipNo: "",
        total: totals.total,
        charity: totals.charity,
        charitySlip: "",
        authorized: "",
        date: "",
        time: "",
        user: "",
        isTotal: true
      }
    ];
  }, [displayedData, totals]);

  const handleFilterSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setFilteredData(getCurrentCategoryData());
  };

  const handleReset = () => {
    setFromDate(initialFromDate);
    setToDate(initialToDate);
    setSearchTerm("");
    setSortKey("");
    setSortDirection("asc");
    handleFilterSubmit(new Event('submit') as any);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const handleExport = () => {
    const exportData = displayedData.map((row: CharityRow, index: number) => ({
      "Sl.No": index + 1,
      "Patient Name": row.patientName,
      UHID: row.uhid,
      "IP.No": row.ipNo,
      Total: formatAmount(row.total),
      Charity: formatAmount(row.charity),
      "Charity Slip": row.charitySlip,
      Authorized: row.authorized,
      Date: row.date,
      Time: row.time,
      User: row.user
    }));

    const categoryLabel = CHARITY_CATEGORIES.find(cat => cat.value === selectedCategory)?.label || selectedCategory;

    exportToExcel(
      exportData,
      `Charity_Register_${categoryLabel}_${fromDate}_to_${toDate}`,
      "Charity Register"
    );
  };

  const columns = [
    { key: "slNo", label: "Sl.No", sortable: false, render: (_: any, record: CharityRow, index: number) => (record.isTotal ? "" : index + 1) },
    { key: "patientName", label: "Patient Name", sortable: true, render: (value: string, record: CharityRow) => (record.isTotal ? <strong>Total:</strong> : value) },
    { key: "uhid", label: "UHID", sortable: true, render: (value: string, record: CharityRow) => (record.isTotal ? "" : value) },
    { key: "ipNo", label: "IP.No", sortable: true, render: (value: string, record: CharityRow) => (record.isTotal ? "" : value) },
    { key: "total", label: "Total", sortable: true, render: (value: number, record: CharityRow) => renderAmountCell(value, record.isTotal) },
    { key: "charity", label: "Charity", sortable: true, render: (value: number, record: CharityRow) => renderAmountCell(value, record.isTotal) },
    { key: "charitySlip", label: "Charity Slip", sortable: true, render: (value: string, record: CharityRow) => (record.isTotal ? "" : value) },
    { key: "authorized", label: "Authorized", sortable: true, render: (value: string, record: CharityRow) => (record.isTotal ? "" : value) },
    { key: "date", label: "Date", sortable: true, render: (value: string, record: CharityRow) => (record.isTotal ? "" : value) },
    { key: "time", label: "Time", sortable: true, render: (value: string, record: CharityRow) => (record.isTotal ? "" : value) },
    { key: "user", label: "User", sortable: true, render: (value: string, record: CharityRow) => (record.isTotal ? "" : value) }
  ];

  return (
    <React.Fragment>
      <Container fluid className="px-4 py-3">
        <ReportHeader
          title="Charity Register"
          subtitle={getDateRangeText(fromDate, toDate)}
          onPrint={printReport}
          onExport={handleExport}
          onSearch={handleSearch}
          showSearch
          showSort={false}
          showPrint
          showExport
        />

        <Card className="mb-4 shadow-sm no-print">
          <Card.Body>
            <Form className="row g-3 align-items-end" onSubmit={handleFilterSubmit}>
              <Form.Group as={Col} md={3} controlId="category">
                <Form.Label style={{ fontWeight: 600 }}>Category</Form.Label>
                <Form.Select 
                  value={selectedCategory} 
                  onChange={e => setSelectedCategory(e.target.value)}
                >
                  {CHARITY_CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group as={Col} md={3} controlId="fromDate">
                <Form.Label style={{ fontWeight: 600 }}>From Date</Form.Label>
                <Form.Control type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} required />
              </Form.Group>
              <Form.Group as={Col} md={3} controlId="toDate">
                <Form.Label style={{ fontWeight: 600 }}>To Date</Form.Label>
                <Form.Control type="date" value={toDate} onChange={e => setToDate(e.target.value)} required />
              </Form.Group>
              <Form.Group as={Col} md={3} className="d-flex align-items-end gap-2">
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

        <Card className="report-card" style={{ padding: "0.75rem" }}>
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
              data={tableWithTotal}
              columns={columns}
              onSort={handleSort}
              responsive={false}
              emptyMessage={
                searchTerm
                  ? "No records match your search criteria."
                  : "No data loaded. Please select date range and click Submit."
              }
            />
          </div>

          <div
            style={{
              padding: "0.5rem 1rem",
              borderTop: "2px solid #e0e0e0",
              background: "linear-gradient(to right, #f8f9fa, #ffffff)",
              textAlign: "start"
            }}
          >
            <Row className="align-items-center">
              <Col md={6}>
                <small className="text-muted" style={{ fontWeight: 500 }}>
                  Total Data Rows: <strong>{displayedData.length}</strong>
                  {searchTerm && <span className="ms-2">(Filtered)</span>}
                </small>
              </Col>
              <Col md={6} className="text-md-end mt-2 mt-md-0">
                <strong>Total Charity:</strong>{" "}
                <span className="text-danger fw-bold">{formatAmount(totals.charity)}</span>
              </Col>
            </Row>
          </div>
        </Card>
      </Container>
    </React.Fragment>
  );
}

export default CharityRegister;