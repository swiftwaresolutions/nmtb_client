import React, { useState, useMemo } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Row,
  Col,
  Alert,
  Spinner,
} from "react-bootstrap";
import ReportHeader from "../../components/ReportHeader";
import ReportKPICard from "../../components/ReportKPICard";
import ReportTable from "../../components/ReportTable";
import {
  searchTableData,
  sortTableData,
  exportToExcel,
  printReport,
  formatReportDate,
  getDateRangeText,
} from "../../utils/reportUtils";
import "../../styles/reportStyles.css";
import { showValidationError } from "../../../utils/alertUtil";

// ─── Demo data ────────────────────────────────────────────────────────────────
const DEMO_RECORDS = [
  {
    slNo: 1,
    opNo: "OP-10521",
    ipNo: "IP-20341",
    patientName: "Suresh Babu",
    date: "02-01-2025",
    time: "09:15 AM",
    refiledUser: "Admin",
  },
  {
    slNo: 2,
    opNo: "OP-10634",
    ipNo: "IP-20412",
    patientName: "Priya Lakshmi",
    date: "03-01-2025",
    time: "11:30 AM",
    refiledUser: "Records Staff",
  },
  {
    slNo: 3,
    opNo: "OP-10789",
    ipNo: "IP-20530",
    patientName: "Murugan Selvam",
    date: "05-01-2025",
    time: "02:45 PM",
    refiledUser: "Admin",
  },
  {
    slNo: 4,
    opNo: "OP-10855",
    ipNo: "IP-20611",
    patientName: "Kavitha Rajan",
    date: "07-01-2025",
    time: "04:00 PM",
    refiledUser: "Records Staff",
  },
  {
    slNo: 5,
    opNo: "OP-10920",
    ipNo: "IP-20702",
    patientName: "Anand Krishnan",
    date: "10-01-2025",
    time: "10:20 AM",
    refiledUser: "Admin",
  },
  {
    slNo: 6,
    opNo: "OP-11045",
    ipNo: "IP-20780",
    patientName: "Saranya Devi",
    date: "12-01-2025",
    time: "03:10 PM",
    refiledUser: "Records Clerk",
  },
  {
    slNo: 7,
    opNo: "OP-11102",
    ipNo: "IP-20845",
    patientName: "Vijayakumar R",
    date: "15-01-2025",
    time: "08:55 AM",
    refiledUser: "Records Staff",
  },
];
// ─────────────────────────────────────────────────────────────────────────────

const TABLE_COLUMNS = [
  {
    key: "slNo",
    label: "Sl.No",
    sortable: false,
    render: (_: any, __: any, idx: number) => idx + 1,
  },
  { key: "opNo", label: "OP Number", sortable: true },
  { key: "ipNo", label: "IP Number", sortable: true },
  { key: "patientName", label: "Patient Name", sortable: true },
  { key: "date", label: "Date", sortable: true },
  { key: "time", label: "Time", sortable: false },
  { key: "refiledUser", label: "Refilled User", sortable: true },
];

export default function RefiledIpCharts() {
  const today = new Date().toISOString().split("T")[0];

  // Filter state
  const [fromDate, setFromDate] = useState<string>(today);
  const [toDate, setToDate] = useState<string>(today);

  // Data state
  const [allRecords, setAllRecords] = useState<any[]>([]);
  const [displayedData, setDisplayedData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);

  // Search & sort state
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortKey, setSortKey] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Stats
  const stats = useMemo(() => {
    const users = allRecords.reduce<Record<string, number>>((acc, r) => {
      acc[r.refiledUser] = (acc[r.refiledUser] || 0) + 1;
      return acc;
    }, {});
    return { total: allRecords.length, uniqueUsers: Object.keys(users).length };
  }, [allRecords]);

  // Refresh displayed data on search/sort change
  React.useEffect(() => {
    let result = [...allRecords];
    if (searchTerm) {
      result = searchTableData(result, searchTerm, [
        "opNo",
        "ipNo",
        "patientName",
        "date",
        "refiledUser",
      ]);
    }
    if (sortKey) {
      result = sortTableData(result, sortKey, sortDirection);
    }
    setDisplayedData(result);
  }, [searchTerm, sortKey, sortDirection, allRecords]);

  // Handle form submit (uses demo data)
  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fromDate || !toDate) {
      showValidationError(
        "Please select both From Date and To Date.",
        "Validation"
      );
      return;
    }
    if (fromDate > toDate) {
      showValidationError(
        "From Date cannot be later than To Date.",
        "Validation"
      );
      return;
    }

    setError(null);
    setLoading(true);
    setSubmitted(false);

    // Simulate API delay with demo data
    setTimeout(() => {
      setAllRecords(DEMO_RECORDS);
      setDisplayedData(DEMO_RECORDS);
      setSubmitted(true);
      setLoading(false);
    }, 600);
  };

  const handleReset = () => {
    setFromDate(today);
    setToDate(today);
    setAllRecords([]);
    setDisplayedData([]);
    setSearchTerm("");
    setSortKey("");
    setSortDirection("asc");
    setError(null);
    setSubmitted(false);
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
    const exportData = displayedData.map((r, i) => ({
      "S.No": i + 1,
      "OP Number": r.opNo,
      "IP Number": r.ipNo,
      "Patient Name": r.patientName,
      Date: r.date,
      Time: r.time,
      "Refilled User": r.refiledUser,
    }));
    exportToExcel(
      exportData,
      `Refiled_IP_Charts_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
      "Refiled IP Charts"
    );
  };

  return (
    <React.Fragment>
      <Container fluid className="px-4 py-3">
        {/* Report Header */}
        <ReportHeader
          title="Re-filed IP Charts"
          subtitle={
            submitted
              ? getDateRangeText(fromDate, toDate)
              : "Select date range and click Submit"
          }
          onPrint={printReport}
          onExport={handleExport}
          onSearch={(term) => setSearchTerm(term)}
          showSearch={submitted}
          showSort={false}
          showPrint={submitted}
          showExport={submitted}
        />

        {error && (
          <Alert variant="danger" className="mt-3">
            {error}
          </Alert>
        )}

        {/* Filter Form */}
        <Card className="mb-4 shadow-sm no-print">
          <Card.Body>
            <Form
              className="row g-3 align-items-end"
              onSubmit={handleFilterSubmit}
            >
              <Form.Group as={Col} md={4} controlId="fromDate">
                <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>From Date</Form.Label>
                <Form.Control
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  max={today}
                  required
                />
              </Form.Group>
              <Form.Group as={Col} md={4} controlId="toDate">
                <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>To Date</Form.Label>
                <Form.Control
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  max={today}
                  required
                />
              </Form.Group>
              <Form.Group
                as={Col}
                md={4}
                className="d-flex align-items-end gap-2"
              >
                <Button
                  type="submit"
                  variant="primary"
                  className="w-50"
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Submit"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-50"
                  onClick={handleReset}
                >
                  Reset
                </Button>
              </Form.Group>
            </Form>
          </Card.Body>
        </Card>

        {/* KPI Cards */}
        {submitted && (
          <Row className="mb-4">
            <Col md={3}>
              <ReportKPICard
                label="Total Records"
                value={stats.total}
                variant="primary"
              />
            </Col>
            <Col md={3}>
              <ReportKPICard
                label="Unique Users"
                value={stats.uniqueUsers}
                variant="info"
              />
            </Col>
          </Row>
        )}

        {/* Table */}
        {loading ? (
          <div className="text-center py-5 text-muted">
            <Spinner animation="border" role="status" />
            <div className="mt-3">Loading re-filed IP charts...</div>
          </div>
        ) : (
          <Card className="report-card" style={{ padding: "0.75rem" }}>
            <div
              style={{
                maxHeight: "calc(115vh - 500px)",
                minHeight: "350px",
                overflowY: "auto",
                overflowX: "auto",
                position: "relative",
              }}
            >
              <ReportTable
                data={displayedData}
                columns={TABLE_COLUMNS}
                onSort={handleSort}
                responsive={false}
                emptyMessage={
                  !submitted
                    ? "No data loaded. Please select date range and click Submit."
                    : searchTerm
                    ? "No records match your search criteria."
                    : "No records found."
                }
              />
            </div>
            <div
              style={{
                padding: "0.5rem 1rem",
                borderTop: "2px solid #e0e0e0",
                background: "linear-gradient(to right, #f8f9fa, #ffffff)",
                textAlign: "start",
              }}
            >
              <small className="text-muted" style={{ fontWeight: "var(--font-weight-medium)" }}>
                Total Data Rows: <strong>{displayedData.length}</strong>
                {searchTerm && (
                  <span className="ms-2">
                    (Filtered from {allRecords.length})
                  </span>
                )}
              </small>
            </div>
          </Card>
        )}
      </Container>
    </React.Fragment>
  );
}
