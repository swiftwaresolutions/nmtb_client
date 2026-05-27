import React, { useState } from "react";
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
import { showValidationError, showErrorToast } from "../../../utils/alertUtil";
import MedicalRecordsApiService, { IcdCodeRegisterItem } from "../../../api/medical-records/medical-records-api-service";

const TABLE_COLUMNS = [
  { key: "slNo",        label: "Sl.No",           sortable: false, render: (_: any, __: any, idx: number) => idx + 1 },
  { key: "code",        label: "ICD Code",         sortable: true  },
  { key: "name",        label: "ICD Description",  sortable: true  },
  { key: "noOfPatients",label: "No. of Patients",  sortable: true  },
];

export default function IcdCodeRegister() {
  const today = new Date().toISOString().split("T")[0];
  const apiService = new MedicalRecordsApiService();

  // Filter state
  const [fromDate,   setFromDate]   = useState<string>(today);
  const [toDate,     setToDate]     = useState<string>(today);

  // Data state
  const [allRecords,  setAllRecords]  = useState<IcdCodeRegisterItem[]>([]);
  const [displayData, setDisplayData] = useState<IcdCodeRegisterItem[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [submitted,   setSubmitted]   = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  // Search & sort
  const [searchTerm,     setSearchTerm]     = useState<string>("");
  const [sortKey,        setSortKey]        = useState<keyof IcdCodeRegisterItem | "">();
  const [sortDirection,  setSortDirection]  = useState<"asc" | "desc">("asc");

  // Stats
  const totalPatients = allRecords.reduce((s, r) => s + (r.noOfPatients || 0), 0);
  const stats = {
    total: allRecords.length,
    totalPatients,
  };

  // Refresh display on search / sort change
  React.useEffect(() => {
    let result = [...allRecords];
    if (searchTerm) {
      result = searchTableData(result, searchTerm, ["code", "name"]);
    }
    if (sortKey) {
      result = sortTableData(result, sortKey as keyof IcdCodeRegisterItem, sortDirection);
    }
    setDisplayData(result);
  }, [searchTerm, sortKey, sortDirection, allRecords]);

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromDate || !toDate) {
      showValidationError("Please select both From Date and To Date.", "Validation");
      return;
    }
    if (fromDate > toDate) {
      showValidationError("From Date cannot be later than To Date.", "Validation");
      return;
    }
    setError(null);
    setLoading(true);
    setSubmitted(false);
    setSearchTerm("");
    try {
      const data = await apiService.fetchIcdCodeRegister(fromDate, toDate);
      setAllRecords(data);
      setDisplayData(data);
      setSubmitted(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to fetch ICD Code Register";
      showErrorToast(msg);
      setAllRecords([]);
      setDisplayData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFromDate(today);
    setToDate(today);
    setAllRecords([]);
    setDisplayData([]);
    setSearchTerm("");
    setSortKey("");
    setSortDirection("asc");
    setSubmitted(false);
    setError(null);
  };

  const handleSort = (key: string) => {
    const newDir = sortKey === key && sortDirection === "asc" ? "desc" : "asc";
    setSortKey(key as keyof IcdCodeRegisterItem);
    setSortDirection(newDir);
  };

  const handleExport = () => {
    const data = displayData.map((r, i) => ({
      "Sl.No":            i + 1,
      "ICD Code":         r.code,
      "ICD Description":  r.name,
      "No. of Patients":  r.noOfPatients,
    }));
    exportToExcel(
      data,
      `ICD_Code_Register_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
      "ICD Code Register"
    );
  };

  return (
    <React.Fragment>
      <Container fluid className="px-4 py-3">
        {/* Report Header */}
        <ReportHeader
          title="ICD Code Register"
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
            <Form className="row g-3 align-items-end" onSubmit={handleSubmit}>
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
              <Form.Group as={Col} md={4} className="d-flex align-items-end gap-2">
                <Button type="submit" variant="primary" className="w-50" disabled={loading}>
                  {loading ? "Loading..." : "Submit"}
                </Button>
                <Button type="button" variant="secondary" className="w-50" onClick={handleReset}>
                  Reset
                </Button>
              </Form.Group>
            </Form>
          </Card.Body>
        </Card>

        {/* KPI Cards */}
        {submitted && (
          <Row className="mb-4">
            <Col md={6}>
              <ReportKPICard label="Unique ICD Codes"  value={stats.total}        variant="primary" />
            </Col>
            <Col md={6}>
              <ReportKPICard label="Total Patients"    value={stats.totalPatients} variant="info"    />
            </Col>
          </Row>
        )}

        {/* Table */}
        {loading ? (
          <div className="text-center py-5 text-muted">
            <Spinner animation="border" role="status" />
            <div className="mt-3">Loading ICD code register...</div>
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
                data={displayData}
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
                Total Data Rows: <strong>{displayData.length}</strong>
                {searchTerm && (
                  <span className="ms-2">(Filtered from {allRecords.length})</span>
                )}
              </small>
            </div>
          </Card>
        )}
      </Container>
    </React.Fragment>
  );
}
