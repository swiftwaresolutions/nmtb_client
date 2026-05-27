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

interface RegistrationRow {
  opNo:        string;
  patientName: string;
  billNo:      string;
  total:       number;
  discount:    number;
  discountBy:  string;
  payable:     number;
  paid:        number;
  balance:     number;
  debitHead:   string;
}

const fmt      = (n: number) => n.toFixed(2);
const fmtComma = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2 });

const TH_STYLE: React.CSSProperties = {
  background: "var(--color-primary, #0d6efd)",
  color: "#fff",
  position: "sticky",
  top: 0,
  zIndex: 1,
};

export default function CashCollections() {
  const today = new Date().toISOString().split("T")[0];
  const apiService = useMemo(() => new MedicalRecordsApiService(), []);

  const [fromDate,      setFromDate]      = useState<string>(today);
  const [toDate,        setToDate]        = useState<string>(today);
  const [submitted,     setSubmitted]     = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState<string | null>(null);
  const [allRecords,    setAllRecords]    = useState<RegistrationRow[]>([]);
  const [searchTerm,    setSearchTerm]    = useState<string>("");

  const displayData = useMemo(() => {
    if (!searchTerm) return allRecords;
    return searchTableData(allRecords, searchTerm, ["opNo", "patientName", "billNo", "discountBy", "debitHead"]);
  }, [allRecords, searchTerm]);

  const stats = useMemo(() => ({
    total:     allRecords.length,
    totalAmt:  allRecords.reduce((s, r) => s + r.total,   0),
    totalPaid: allRecords.reduce((s, r) => s + r.paid,    0),
    balance:   allRecords.reduce((s, r) => s + r.balance, 0),
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
      const data = await apiService.fetchMRDCollections(fromDate, toDate);
      const rows: RegistrationRow[] = data.map((item) => ({
        opNo:        item.opNo,
        patientName: item.patientName,
        billNo:      item.regBillNo,
        total:       item.total,
        discount:    item.disc,
        discountBy:  item.discountHead,
        payable:     item.pay,
        paid:        item.paid,
        balance:     item.balance,
        debitHead:   item.debitHead,
      }));
      setAllRecords(rows);
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch MRD collections. Please try again.");
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
      "S.No":           i + 1,
      "OP No":          r.opNo,
      "Patient Name":   r.patientName,
      "Bill No":        r.billNo,
      "Total (Rs.)":    fmt(r.total),
      "Discount (Rs.)": fmt(r.discount),
      "Discount By":    r.discount !== 0 ? r.discountBy : "",
      "Payable (Rs.)":  fmt(r.payable),
      "Paid (Rs.)":     fmt(r.paid),
      "Balance (Rs.)":  fmt(r.balance),
      "Debit Head":     r.balance !== 0 ? r.debitHead : "",
    }));
    exportToExcel(
      rows,
      `Cash_Collections_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
      "Cash Collections"
    );
  };

  const subtitle = submitted
    ? getDateRangeText(fromDate, toDate)
    : "Select filters and click Submit";

  return (
    <React.Fragment>
      <Container fluid className="px-4 py-3">
        <ReportHeader
          title="Cash Collections"
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
              <ReportKPICard label="Total Records"       value={stats.total}                          variant="primary" />
            </Col>
            <Col md={3}>
              <ReportKPICard label="Total Amount (Rs.)"  value={`₹ ${fmtComma(stats.totalAmt)}`}     variant="info"    />
            </Col>
            <Col md={3}>
              <ReportKPICard label="Total Paid (Rs.)"    value={`₹ ${fmtComma(stats.totalPaid)}`}    variant="success" />
            </Col>
            <Col md={3}>
              <ReportKPICard label="Total Balance (Rs.)" value={`₹ ${fmtComma(stats.balance)}`}      variant="warning" />
            </Col>
          </Row>
        )}

        {/* Table */}
        {loading ? (
          <div className="text-center py-5 text-muted">
            <Spinner animation="border" role="status" />
            <div className="mt-3">Loading cash collections...</div>
          </div>
        ) : (
          <Card className="report-card" style={{ padding: "0.75rem" }}>
            <div style={{ maxHeight: "450px", overflowY: "auto", overflowX: "auto", position: "relative" }}>
              <Table bordered hover size="sm" className="mb-0">
                <thead>
                  <tr>
                    <th style={TH_STYLE} className="text-center">S.No</th>
                    <th style={TH_STYLE}>OP No</th>
                    <th style={TH_STYLE}>Patient Name</th>
                    <th style={TH_STYLE}>Bill No.</th>
                    <th style={{ ...TH_STYLE, textAlign: "end" }}>Total (Rs.)</th>
                    <th style={{ ...TH_STYLE, textAlign: "end" }}>Discount (Rs.)</th>
                    <th style={TH_STYLE}>Discount By</th>
                    <th style={{ ...TH_STYLE, textAlign: "end" }}>Payable (Rs.)</th>
                    <th style={{ ...TH_STYLE, textAlign: "end" }}>Paid (Rs.)</th>
                    <th style={{ ...TH_STYLE, textAlign: "end" }}>Balance (Rs.)</th>
                    <th style={TH_STYLE}>Debit Head</th>
                  </tr>
                </thead>
                <tbody>
                  {!submitted || displayData.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="text-center text-muted py-4">
                        {!submitted
                          ? "No data loaded. Please select filters and click Submit."
                          : searchTerm
                          ? "No records match your search criteria."
                          : "No records found."}
                      </td>
                    </tr>
                  ) : (
                    <>
                      {displayData.map((row, i) => (
                        <tr key={i}>
                          <td className="text-center">{i + 1}</td>
                          <td>&nbsp;{row.opNo}</td>
                          <td>&nbsp;{row.patientName}</td>
                          <td>&nbsp;{row.billNo}</td>
                          <td className="text-end">{fmt(row.total)}&nbsp;</td>
                          <td className="text-end">{fmt(row.discount)}&nbsp;</td>
                          <td>&nbsp;{row.discount !== 0 ? row.discountBy : ""}</td>
                          <td className="text-end">{fmt(row.payable)}&nbsp;</td>
                          <td className="text-end">{fmt(row.paid)}&nbsp;</td>
                          <td className="text-end">{fmt(row.balance)}&nbsp;</td>
                          <td>&nbsp;{row.balance !== 0 ? row.debitHead : ""}</td>
                        </tr>
                      ))}
                      <tr>
                        <td
                          colSpan={8}
                          style={{
                            background: "var(--color-primary, #0d6efd)",
                            color: "#fff",
                            fontWeight: "var(--font-weight-bold)",
                            textAlign: "end",
                            paddingRight: "0.5rem",
                          }}
                        >
                          Grand Total (Rs.) :
                        </td>
                        <td
                          className="text-end"
                          style={{ background: "var(--color-primary, #0d6efd)", color: "#fff", fontWeight: "var(--font-weight-bold)" }}
                        >
                          {fmtComma(stats.totalPaid)}&nbsp;
                        </td>
                        <td
                          className="text-end"
                          style={{ background: "var(--color-primary, #0d6efd)", color: "#fff", fontWeight: "var(--font-weight-bold)" }}
                        >
                          {fmtComma(stats.balance)}&nbsp;
                        </td>
                        <td style={{ background: "var(--color-primary, #0d6efd)" }} />
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
                Total Data Rows: <strong>{displayData.length}</strong>
                {searchTerm && <span className="ms-2">(Filtered from {allRecords.length})</span>}
              </small>
            </div>
          </Card>
        )}
      </Container>
    </React.Fragment>
  );
}
