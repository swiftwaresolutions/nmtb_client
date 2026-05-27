import React, { useState } from "react";
import { Button, Card, Col, Form, Row, Table } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { showValidationError, showErrorToast } from "../../../../../utils/alertUtil";
import CentralStoresApiService, {
  BillWiseSalesRow,
  SalesSummaryRow,
} from "../../../../../api/central-stores/central-stores-api-service";

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

const BillWiseSales: React.FC = () => {
  const [fromDate, setFromDate] = useState<string>(today);
  const [toDate, setToDate] = useState<string>(today);
  const [isLoading, setIsLoading] = useState(false);
  const [rows, setRows] = useState<BillWiseSalesRow[]>([]);
  const [summaryRows, setSummaryRows] = useState<SalesSummaryRow[]>([]);
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
        apiService.fetchBillWiseSales(fromDate, toDate),
        apiService.fetchSalesSummary(fromDate, toDate),
      ]);
      setRows(res);
      setSummaryRows(sumRes);
      setReportDates({ from: fromDate, to: toDate });
      setSubmitted(true);
    } catch {
      showErrorToast("Failed to fetch Bill Wise Sales data.");
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

  const totalTaxable = rows.reduce((s, r) => s + (r.taxable ?? 0), 0);
  const totalCgst = rows.reduce((s, r) => s + (r.cgstAmt ?? 0), 0);
  const totalSgst = rows.reduce((s, r) => s + (r.sgstAmt ?? 0), 0);
  const totalGross = rows.reduce((s, r) => s + (r.grossAmt ?? 0), 0);
  const totalDisc = rows.reduce((s, r) => s + (r.disc ?? 0), 0);
  const totalNet = rows.reduce((s, r) => s + (r.netAmt ?? 0), 0);
  const totalGst = rows.reduce((s, r) => s + (r.gst ?? 0), 0);

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
          Sales GST Report
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
              SALES GST DATE BETWEEN ({formatDisplayDate(reportDates.from)} AND{" "}
              {formatDisplayDate(reportDates.to)})
            </div>
            <div style={{ overflowX: "auto" }}>
              <Table bordered size="sm" className="mb-0">
                <thead>
                  <tr>
                    <th style={{ ...thStyle, width: "55px" }}>SL.NO</th>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Opno</th>
                    <th style={thStyle}>Bill No and Date</th>
                    <th style={thStyle}>Patient Category</th>
                    <th style={thStyle}>with/without Concession</th>
                    <th style={thStyle}>Iss type</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Taxable Value</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>GST(%)</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>CGST</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>SGST</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Gross Amt</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Conc Amt</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Net Amt</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>GST</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Diff</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={16} className="text-center text-muted py-3" style={tdStyle}>
                        No records found for the selected date range.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row, index) => (
                      <tr key={row.billId}>
                        <td style={{ ...tdStyle, textAlign: "center" }}>{index + 1}</td>
                        <td style={tdStyle}>{row.patientName}</td>
                        <td style={tdStyle}>{row.displayNumber}</td>
                        <td style={tdStyle}>{row.billNoDate}</td>
                        <td style={tdStyle}>{row.accHead}</td>
                        <td style={tdStyle}>{row.concession}</td>
                        <td style={tdStyle}>{row.isstype}</td>
                        <td style={{ ...tdStyle, textAlign: "right" }}>{fmt(row.taxable)}</td>
                        <td style={{ ...tdStyle, textAlign: "right" }}>{fmt(row.taxPer)}</td>
                        <td style={{ ...tdStyle, textAlign: "right" }}>{fmt(row.cgstAmt)}</td>
                        <td style={{ ...tdStyle, textAlign: "right" }}>{fmt(row.sgstAmt)}</td>
                        <td style={{ ...tdStyle, textAlign: "right" }}>{fmt(row.grossAmt)}</td>
                        <td style={{ ...tdStyle, textAlign: "right" }}>{fmt(row.disc)}</td>
                        <td style={{ ...tdStyle, textAlign: "right" }}>{fmt(row.netAmt)}</td>
                        <td style={{ ...tdStyle, textAlign: "right" }}>{fmt(row.gst)}</td>
                        <td style={{ ...tdStyle, textAlign: "right" }}>{fmt((row.grossAmt ?? 0) - (row.netAmt ?? 0))}</td>
                      </tr>
                    ))
                  )}
                  <tr style={totalRowStyle}>
                    <td colSpan={7} style={{ ...totalRowStyle, textAlign: "right" }}>
                      Total
                    </td>
                    <td style={{ ...totalRowStyle, textAlign: "right" }}>{fmt(totalTaxable)}</td>
                    <td style={totalRowStyle} />
                    <td style={{ ...totalRowStyle, textAlign: "right" }}>{fmt(totalCgst)}</td>
                    <td style={{ ...totalRowStyle, textAlign: "right" }}>{fmt(totalSgst)}</td>
                    <td style={{ ...totalRowStyle, textAlign: "right" }}>{fmt(totalGross)}</td>
                    <td style={{ ...totalRowStyle, textAlign: "right" }}>{fmt(totalDisc)}</td>
                    <td style={{ ...totalRowStyle, textAlign: "right" }}>{fmt(totalNet)}</td>
                    <td style={{ ...totalRowStyle, textAlign: "right" }}>{fmt(totalGst)}</td>
                    <td style={{ ...totalRowStyle, textAlign: "right" }}>{fmt(totalGross - totalNet)}</td>
                  </tr>
                </tbody>
              </Table>
            </div>

            {/* ── Summary Table ── */}
            <div style={{ marginTop: "1.5rem", maxWidth: "620px" }}>
              <div
                style={{
                  fontWeight: "var(--font-weight-semibold)" as React.CSSProperties["fontWeight"],
                  fontSize: "var(--font-size-sm)" as React.CSSProperties["fontSize"],
                  marginBottom: "0.5rem",
                }}
              >
                GST Summary (%-wise)
              </div>
              <Table bordered size="sm" className="mb-0">
                <thead>
                  <tr>
                    <th style={thStyle}>Head</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Rate (%)</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Taxable Value</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>CGST</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>SGST</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>IGST</th>
                  </tr>
                </thead>
                <tbody>
                  {summaryRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center text-muted py-2" style={tdStyle}>
                        No summary data.
                      </td>
                    </tr>
                  ) : (
                    summaryRows.map((s, i) => (
                      <tr key={i}>
                        <td style={tdStyle}>{s.salesHead}</td>
                        <td style={{ ...tdStyle, textAlign: "right" }}>{s.taxType}%</td>
                        <td style={{ ...tdStyle, textAlign: "right" }}>{fmt(s.taxableValue)}</td>
                        <td style={{ ...tdStyle, textAlign: "right" }}>{fmt(s.cgstAmt)}</td>
                        <td style={{ ...tdStyle, textAlign: "right" }}>{fmt(s.sgstAmt)}</td>
                        <td style={{ ...tdStyle, textAlign: "right" }}>{fmt(s.igstAmt)}</td>
                      </tr>
                    ))
                  )}
                  <tr style={totalRowStyle}>
                    <td colSpan={2} style={{ ...totalRowStyle, textAlign: "right" }}>Total</td>
                    <td style={{ ...totalRowStyle, textAlign: "right" }}>
                      {fmt(summaryRows.reduce((s, r) => s + (r.taxableValue ?? 0), 0))}
                    </td>
                    <td style={{ ...totalRowStyle, textAlign: "right" }}>
                      {fmt(summaryRows.reduce((s, r) => s + (r.cgstAmt ?? 0), 0))}
                    </td>
                    <td style={{ ...totalRowStyle, textAlign: "right" }}>
                      {fmt(summaryRows.reduce((s, r) => s + (r.sgstAmt ?? 0), 0))}
                    </td>
                    <td style={{ ...totalRowStyle, textAlign: "right" }}>
                      {fmt(summaryRows.reduce((s, r) => s + (r.igstAmt ?? 0), 0))}
                    </td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default BillWiseSales;
