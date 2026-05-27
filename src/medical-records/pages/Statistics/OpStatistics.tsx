import React, { useState, useMemo } from "react";
import { Container, Card, Form, Button, Row, Col, Table, Spinner, Alert } from "react-bootstrap";
import ReportHeader from "../../components/ReportHeader";
import ReportKPICard from "../../components/ReportKPICard";
import MedicalRecordsApiService from "../../../api/medical-records/medical-records-api-service";
import {
  searchTableData,
  exportToExcel,
  printReport,
  formatReportDate,
  getDateRangeText,
} from "../../utils/reportUtils";
import "../../styles/reportStyles.css";
import { showValidationError } from "../../../utils/alertUtil";

interface OPStatRow {
  deptName:         string;
  newMaleCount:     number;
  newFemaleCount:   number;
  newTotal:         number;
  repeatMaleCount:  number;
  repeatFemaleCount: number;
  repeatTotal:      number;
  grandTotal:       number;
}

const TH_STYLE: React.CSSProperties = {
  background: "var(--color-primary, #0d6efd)",
  color: "#fff",
  position: "sticky",
  top: 0,
  zIndex: 1,
};

const apiService = new MedicalRecordsApiService();

export default function OpStatistics() {
  const today = new Date().toISOString().split("T")[0];

  const [fromDate,   setFromDate]   = useState<string>(today);
  const [toDate,     setToDate]     = useState<string>(today);
  const [submitted,  setSubmitted]  = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [allRecords, setAllRecords] = useState<OPStatRow[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const displayData = useMemo(() => {
    if (!searchTerm) return allRecords;
    return searchTableData(allRecords, searchTerm, ["deptName"]);
  }, [allRecords, searchTerm]);

  const totals = useMemo(() => ({
    newMale:     allRecords.reduce((s, r) => s + r.newMaleCount,     0),
    newFemale:   allRecords.reduce((s, r) => s + r.newFemaleCount,   0),
    newTotal:    allRecords.reduce((s, r) => s + r.newTotal,         0),
    repeatMale:  allRecords.reduce((s, r) => s + r.repeatMaleCount,  0),
    repeatFemale:allRecords.reduce((s, r) => s + r.repeatFemaleCount,0),
    repeatTotal: allRecords.reduce((s, r) => s + r.repeatTotal,      0),
    grandTotal:  allRecords.reduce((s, r) => s + r.grandTotal,       0),
  }), [allRecords]);

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
      const data = await apiService.fetchDepartmentOPStatistics(fromDate, toDate);
      setAllRecords(data);
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch OP statistics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFromDate(today);
    setToDate(today);
    setAllRecords([]);
    setSearchTerm("");
    setSubmitted(false);
    setError(null);
  };

  const handleExport = () => {
    const rows: any[] = displayData.map((r, i) => ({
      "Sl.No":           i + 1,
      "Department":      r.deptName,
      "New Male":        r.newMaleCount,
      "New Female":      r.newFemaleCount,
      "New Total":       r.newTotal,
      "Repeat Male":     r.repeatMaleCount,
      "Repeat Female":   r.repeatFemaleCount,
      "Repeat Total":    r.repeatTotal,
      "Grand Total":     r.grandTotal,
    }));
    exportToExcel(
      rows,
      `OP_Statistics_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
      "OP Statistics"
    );
  };

  const subtitle = submitted
    ? getDateRangeText(fromDate, toDate)
    : "Select date range and click Submit";

  return (
    <React.Fragment>
      <Container fluid className="px-4 py-3">
        <ReportHeader
          title="Out Patient Statistics"
          subtitle={subtitle}
          onPrint={printReport}
          onExport={handleExport}
          onSearch={(term) => setSearchTerm(term)}
          showSearch={submitted}
          showSort={false}
          showPrint={submitted}
          showExport={submitted}
        />

        {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

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
                <Button type="button" variant="secondary" className="w-50" onClick={handleReset} disabled={loading}>
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
              <ReportKPICard label="Total Departments"  value={allRecords.length}      variant="primary" />
            </Col>
            <Col md={3}>
              <ReportKPICard label="Total New OP"       value={totals.newTotal}        variant="info"    />
            </Col>
            <Col md={3}>
              <ReportKPICard label="Total Repeat OP"    value={totals.repeatTotal}     variant="warning" />
            </Col>
            <Col md={3}>
              <ReportKPICard label="Grand Total OP"     value={totals.grandTotal}      variant="success" />
            </Col>
          </Row>
        )}

        {/* Table */}
        {loading ? (
          <div className="text-center py-5 text-muted">
            <Spinner animation="border" role="status" />
            <div className="mt-3">Loading OP statistics...</div>
          </div>
        ) : (
          <Card className="report-card" style={{ padding: "0.75rem" }}>
            <div style={{ maxHeight: "450px", overflowY: "auto", overflowX: "auto", position: "relative" }}>
              <Table bordered hover size="sm" className="mb-0">
                <thead>
                  <tr>
                    <th rowSpan={2} style={{ ...TH_STYLE, verticalAlign: "middle", textAlign: "center" }}>Sl.No</th>
                    <th rowSpan={2} style={{ ...TH_STYLE, verticalAlign: "middle" }}>Department</th>
                    <th colSpan={3} style={{ ...TH_STYLE, textAlign: "center" }}>New OP — General</th>
                    <th colSpan={3} style={{ ...TH_STYLE, textAlign: "center" }}>Repeat OP — General</th>
                    <th rowSpan={2} style={{ ...TH_STYLE, verticalAlign: "middle", textAlign: "center" }}>Grand Total</th>
                  </tr>
                  <tr>
                    <th style={{ ...TH_STYLE, textAlign: "center" }}>Male</th>
                    <th style={{ ...TH_STYLE, textAlign: "center" }}>Female</th>
                    <th style={{ ...TH_STYLE, textAlign: "center" }}>Total</th>
                    <th style={{ ...TH_STYLE, textAlign: "center" }}>Male</th>
                    <th style={{ ...TH_STYLE, textAlign: "center" }}>Female</th>
                    <th style={{ ...TH_STYLE, textAlign: "center" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {!submitted || displayData.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center text-muted py-4">
                        {!submitted
                          ? "No data loaded. Please select a date range and click Submit."
                          : searchTerm
                          ? "No departments match your search."
                          : "No records found."}
                      </td>
                    </tr>
                  ) : (
                    <>
                      {displayData.map((row, i) => (
                        <tr key={i}>
                          <td className="text-center">{i + 1}</td>
                          <td>&nbsp;{row.deptName}</td>
                          <td className="text-center">{row.newMaleCount}</td>
                          <td className="text-center">{row.newFemaleCount}</td>
                          <td className="text-center">{row.newTotal}</td>
                          <td className="text-center">{row.repeatMaleCount}</td>
                          <td className="text-center">{row.repeatFemaleCount}</td>
                          <td className="text-center">{row.repeatTotal}</td>
                          <td className="text-center">{row.grandTotal}</td>
                        </tr>
                      ))}
                      <tr
                        style={{
                          background: "var(--color-primary, #0d6efd)",
                          color: "#fff",
                          fontWeight: "var(--font-weight-bold)",
                        }}
                      >
                        <td colSpan={2} className="text-center">Total</td>
                        <td className="text-center">{totals.newMale}</td>
                        <td className="text-center">{totals.newFemale}</td>
                        <td className="text-center">{totals.newTotal}</td>
                        <td className="text-center">{totals.repeatMale}</td>
                        <td className="text-center">{totals.repeatFemale}</td>
                        <td className="text-center">{totals.repeatTotal}</td>
                        <td className="text-center">{totals.grandTotal}</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </Table>
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
                Total Departments: <strong>{displayData.length}</strong>
                {searchTerm && <span className="ms-2">(Filtered from {allRecords.length})</span>}
              </small>
            </div>
          </Card>
        )}
      </Container>
    </React.Fragment>
  );
}

