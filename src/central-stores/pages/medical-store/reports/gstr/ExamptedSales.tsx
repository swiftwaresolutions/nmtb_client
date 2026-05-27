
import React, { useState } from "react";
import { Button, Card, Col, Form, Row, Table } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faFileExcel } from "@fortawesome/free-solid-svg-icons";
import { showValidationError, showErrorToast } from "../../../../../utils/alertUtil";
import CentralStoresApiService, {
  ExamptedSalesRow,
  ExamptedSalesSummaryRow,
} from "../../../../../api/central-stores/central-stores-api-service";
import { exportToExcel } from "../../../../../medical-records/utils/reportUtils";

const apiService = new CentralStoresApiService();
const today = new Date().toISOString().split("T")[0];

const fmt = (val?: number | null) => (val != null ? val.toFixed(2) : "0.00");

const formatDisplayDate = (iso: string) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}-${m}-${y}`;
};

const thStyle: React.CSSProperties = {
  background: "var(--color-table-header)",
  fontWeight: "var(--font-weight-semibold)" as React.CSSProperties["fontWeight"],
  fontSize: "var(--font-size-sm)" as React.CSSProperties["fontSize"],
  whiteSpace: "nowrap",
  textAlign: "center",
  verticalAlign: "middle",
};

const tdStyle: React.CSSProperties = {
  fontSize: "var(--font-size-sm)" as React.CSSProperties["fontSize"],
  whiteSpace: "nowrap",
  verticalAlign: "middle",
};

const totalRowStyle: React.CSSProperties = {
  fontWeight: "var(--font-weight-semibold)" as React.CSSProperties["fontWeight"],
  fontSize: "var(--font-size-sm)" as React.CSSProperties["fontSize"],
  background: "var(--color-table-header)",
};

const ExamptedSales: React.FC = () => {
  const [fromDate, setFromDate] = useState<string>(today);
  const [toDate, setToDate] = useState<string>(today);
  const [isLoading, setIsLoading] = useState(false);
  const [rows, setRows] = useState<ExamptedSalesRow[]>([]);
  const [summaryRows, setSummaryRows] = useState<ExamptedSalesSummaryRow[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [reportDates, setReportDates] = useState({ from: "", to: "" });

  const handleShow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromDate || !toDate) {
      showValidationError("Please select both From Date and To Date.");
      return;
    }
    if (new Date(fromDate) > new Date(toDate)) {
      showValidationError("From date cannot be later than To date.");
      return;
    }
    setIsLoading(true);
    try {
      const [res, sumRes] = await Promise.all([
        apiService.fetchExamptedGstSales(fromDate, toDate),
        apiService.fetchExamptedGstSummary(fromDate, toDate),
      ]);
      setRows(res);
      setSummaryRows(sumRes);
      setReportDates({ from: fromDate, to: toDate });
      setSubmitted(true);
    } catch {
      showErrorToast("Failed to fetch Exampted Sales GST data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFromDate(today);
    setToDate(today);
    setRows([]);
    setSummaryRows([]);
    setSubmitted(false);
  };

  const handleExportExcel = () => {
    const exportData = rows.map((r, i) => ({
      "SL.NO": i + 1,
      "Bill No": r.consumableNo,
      "Date": r.openDate,
      "Iss Type": r.issType,
      "Ward Name": r.wardName,
      "Taxable Value": r.taxable,
      "GST(%)": "Exempt",
      "GST": "",
    }));
    exportToExcel(exportData, `Exampted_Sales_GST_${fromDate}_to_${toDate}`);
  };

  const totalTaxable = rows.reduce((s, r) => s + (r.taxable ?? 0), 0);
  const totalSummaryTaxable = summaryRows.reduce((s, r) => s + (r.taxableValue ?? 0), 0);

  return (
    <div style={{ padding: "1.25rem", height: "100%", overflowY: "auto" }}>
      <Card className="shadow-sm mb-3">
        <Card.Header
          style={{
            background: "var(--color-primary)",
            color: "#fff",
            fontWeight: "var(--font-weight-semibold)" as React.CSSProperties["fontWeight"],
            fontSize: "var(--font-size-md)" as React.CSSProperties["fontSize"],
          }}
        >
          Exampted Sales GST Report
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleShow}>
            <Row className="align-items-end g-3">
              <Col md={3} sm={6}>
                <Form.Group>
                  <Form.Label
                    style={{
                      fontWeight: "var(--font-weight-medium)" as React.CSSProperties["fontWeight"],
                      fontSize: "var(--font-size-sm)" as React.CSSProperties["fontSize"],
                    }}
                  >
                    From Date
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    disabled={isLoading}
                  />
                </Form.Group>
              </Col>
              <Col md={3} sm={6}>
                <Form.Group>
                  <Form.Label
                    style={{
                      fontWeight: "var(--font-weight-medium)" as React.CSSProperties["fontWeight"],
                      fontSize: "var(--font-size-sm)" as React.CSSProperties["fontSize"],
                    }}
                  >
                    To Date
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    disabled={isLoading}
                  />
                </Form.Group>
              </Col>
              <Col md="auto" className="d-flex gap-2">
                <Button
                  type="submit"
                  className="theme-btn-primary"
                  disabled={isLoading}
                >
                  <FontAwesomeIcon icon={faSearch} className="me-1" />
                  {isLoading ? "Loading..." : "Show"}
                </Button>
                <Button
                  type="button"
                  className="theme-outline-btn-primary"
                  onClick={handleReset}
                  disabled={isLoading}
                >
                  Reset
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {submitted && (
        <Card className="shadow-sm">
          <Card.Body style={{ padding: "1rem" }}>
            <div
              style={{
                fontWeight: "var(--font-weight-semibold)" as React.CSSProperties["fontWeight"],
                fontSize: "var(--font-size-md)" as React.CSSProperties["fontSize"],
                marginBottom: "1rem",
              }}
            >
              EXAMPTED SALES GST DATE BETWEEN ({formatDisplayDate(reportDates.from)} AND{" "}
              {formatDisplayDate(reportDates.to)})
            </div>

            {/* ── Main Table ── */}
            <div style={{ overflowX: "auto" }}>
              <Table bordered size="sm" className="mb-0">
                <thead>
                  <tr>
                    <th style={{ ...thStyle, width: "55px" }}>SL.NO</th>
                    <th style={thStyle}>Bill No and Date</th>
                    <th style={thStyle}>Iss type</th>
                    <th style={thStyle}>Ward Name</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Taxable Value</th>
                    <th style={{ ...thStyle, textAlign: "center" }}>GST(%)</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>GST</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center text-muted py-3" style={tdStyle}>
                        No records found for the selected date range.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row, index) => (
                      <tr key={index}>
                        <td style={{ ...tdStyle, textAlign: "center" }}>{index + 1}</td>
                        <td style={tdStyle}>{row.consumableNo}{"  "}{row.openDate}</td>
                        <td style={tdStyle}>{row.issType}</td>
                        <td style={tdStyle}>{row.wardName}</td>
                        <td style={{ ...tdStyle, textAlign: "right" }}>{fmt(row.taxable)}</td>
                        <td style={{ ...tdStyle, textAlign: "center" }}>Exempt</td>
                        <td style={{ ...tdStyle, textAlign: "right" }}></td>
                      </tr>
                    ))
                  )}
                  <tr style={totalRowStyle}>
                    <td colSpan={4} style={{ ...totalRowStyle, textAlign: "right" }}>
                      Total
                    </td>
                    <td style={{ ...totalRowStyle, textAlign: "right" }}>{fmt(totalTaxable)}</td>
                    <td style={totalRowStyle} />
                    <td style={totalRowStyle} />
                  </tr>
                </tbody>
              </Table>
            </div>

            {/* ── Summary Table ── */}
            <div style={{ marginTop: "1.5rem", maxWidth: "560px" }}>
              <Table bordered size="sm" className="mb-0">
                <thead>
                  <tr>
                    <th style={thStyle}>Head</th>
                    <th style={{ ...thStyle, textAlign: "center" }}>Rate</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Taxable Value</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>CGST</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>SGST</th>
                  </tr>
                </thead>
                <tbody>
                  {summaryRows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center text-muted py-2" style={tdStyle}>
                        No summary data.
                      </td>
                    </tr>
                  ) : (
                    summaryRows.map((s, i) => (
                      <tr key={i}>
                        <td style={tdStyle}>{s.salesHead}</td>
                        <td style={{ ...tdStyle, textAlign: "center" }}>{s.exempt}</td>
                        <td style={{ ...tdStyle, textAlign: "right" }}>{fmt(s.taxableValue)}</td>
                        <td style={{ ...tdStyle, textAlign: "right" }}></td>
                        <td style={{ ...tdStyle, textAlign: "right" }}></td>
                      </tr>
                    ))
                  )}
                  <tr style={totalRowStyle}>
                    <td colSpan={2} style={{ ...totalRowStyle, textAlign: "right" }}>Total</td>
                    <td style={{ ...totalRowStyle, textAlign: "right" }}>
                      {fmt(totalSummaryTaxable)}
                    </td>
                    <td style={totalRowStyle} />
                    <td style={totalRowStyle} />
                  </tr>
                </tbody>
              </Table>
            </div>

            {/* ── Export Button ── */}
            <div className="d-flex justify-content-center mt-4">
              <Button
                className="theme-btn-primary"
                onClick={handleExportExcel}
                disabled={rows.length === 0}
              >
                <FontAwesomeIcon icon={faFileExcel} className="me-2" />
                Export to Excel
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default ExamptedSales;
