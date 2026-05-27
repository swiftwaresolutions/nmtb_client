
import React, { useState } from "react";
import { Button, Card, Col, Form, Row, Table } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faFileExcel } from "@fortawesome/free-solid-svg-icons";
import { showValidationError, showErrorToast } from "../../../../../../utils/alertUtil";
import CentralStoresApiService, {
  ConsolidateSepSalesReturnRow,
} from "../../../../../../api/central-stores/central-stores-api-service";
import { exportToExcel } from "../../../../../../medical-records/utils/reportUtils";

const apiService = new CentralStoresApiService();
const today = new Date().toISOString().split("T")[0];

const fmt = (val?: number | null) =>
  val != null ? val.toFixed(2) : "0.00";

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

interface SummaryRow {
  rate: number;
  taxableValue: number;
  cgst: number;
  sgst: number;
  total: number;
}

const SeparateReturn: React.FC = () => {
  const [fromDate, setFromDate] = useState<string>(today);
  const [toDate, setToDate] = useState<string>(today);
  const [isLoading, setIsLoading] = useState(false);
  const [rows, setRows] = useState<ConsolidateSepSalesReturnRow[]>([]);
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
      const res = await apiService.fetchConsolidateSepSalesReturn(fromDate, toDate);
      setRows(res);
      setReportDates({ from: fromDate, to: toDate });
      setSubmitted(true);
    } catch {
      showErrorToast("Failed to fetch Consolidate Separate Sales Return data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFromDate(today);
    setToDate(today);
    setRows([]);
    setSubmitted(false);
  };

  const handleExportExcel = () => {
    const exportData = rows.map((r) => ({
      "Date": formatDisplayDate(r.billDate),
      "Start IP": r.startIp,
      "End IP": r.endIp,
      "IP Tot": r.ipCount,
      "Start OP": r.startOp,
      "End OP": r.endOp,
      "OP Tot": r.opCount,
      "Total Bills": r.totalBills,
      "0% Taxable": r.taxable0,
      "0% Tax": r.tax0,
      "5% Taxable": r.taxable5,
      "5% Tax": r.tax5,
      "12% Taxable": r.taxable12 ?? 0,
      "12% Tax": r.tax12 ?? 0,
      "18% Taxable": r.taxable18,
      "18% Tax": r.tax18,
      "Total": r.totalAmount,
      "Round Off": r.roundOff ?? 0,
    }));
    exportToExcel(exportData, `Consolidate_Sep_Sales_Return_${fromDate}_to_${toDate}`);
  };

  const total = (key: keyof ConsolidateSepSalesReturnRow) =>
    rows.reduce((s, r) => s + ((r[key] as number) ?? 0), 0);

  const summaryRows: SummaryRow[] = submitted
    ? [
        { rate: 0.0, taxableValue: total("taxable0"), cgst: total("tax0") / 2, sgst: total("tax0") / 2, total: total("taxable0") + total("tax0") },
        { rate: 5.0, taxableValue: total("taxable5"), cgst: total("tax5") / 2, sgst: total("tax5") / 2, total: total("taxable5") + total("tax5") },
        { rate: 18.0, taxableValue: total("taxable18"), cgst: total("tax18") / 2, sgst: total("tax18") / 2, total: total("taxable18") + total("tax18") },
      ]
    : [];

  const summaryTotals = summaryRows.reduce(
    (acc, r) => ({
      taxableValue: acc.taxableValue + r.taxableValue,
      cgst: acc.cgst + r.cgst,
      sgst: acc.sgst + r.sgst,
      total: acc.total + r.total,
    }),
    { taxableValue: 0, cgst: 0, sgst: 0, total: 0 }
  );

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
          Consolidate Separate Sales Return Report
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
                <Button type="submit" className="theme-btn-primary" disabled={isLoading}>
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
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div
                style={{
                  fontWeight: "var(--font-weight-semibold)" as React.CSSProperties["fontWeight"],
                  fontSize: "var(--font-size-md)" as React.CSSProperties["fontSize"],
                }}
              >
                CONSOLIDATE SEPARATE SALES RETURN REPORT ({formatDisplayDate(reportDates.from)} TO{" "}
                {formatDisplayDate(reportDates.to)})
              </div>
              {rows.length > 0 && (
                <Button
                  className="theme-outline-btn-primary"
                  size="sm"
                  onClick={handleExportExcel}
                >
                  <FontAwesomeIcon icon={faFileExcel} className="me-1" />
                  Export Excel
                </Button>
              )}
            </div>

            {/* ── Main Table ── */}
            <div style={{ overflowX: "auto" }}>
              <Table bordered size="sm" className="mb-0">
                <thead>
                  <tr>
                    <th rowSpan={2} style={thStyle}>Date</th>
                    <th colSpan={3} style={thStyle}>Bill No</th>
                    <th colSpan={3} style={thStyle}></th>
                    <th rowSpan={2} style={thStyle}>Total Bills</th>
                    <th colSpan={2} style={thStyle}>0.00</th>
                    <th colSpan={2} style={thStyle}>5.00</th>
                    <th colSpan={2} style={thStyle}>12.00</th>
                    <th colSpan={2} style={thStyle}>18.00</th>
                    <th rowSpan={2} style={{ ...thStyle, textAlign: "right" }}>Total</th>
                    <th rowSpan={2} style={{ ...thStyle, textAlign: "right" }}>Round Off</th>
                  </tr>
                  <tr>
                    <th style={thStyle}>StartIP</th>
                    <th style={thStyle}>EndIP</th>
                    <th style={thStyle}>IPTot</th>
                    <th style={thStyle}>StartOP</th>
                    <th style={thStyle}>EndOP</th>
                    <th style={thStyle}>OPTot</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Taxable</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Tax</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Taxable</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Tax</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Taxable</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Tax</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Taxable</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Tax</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={18} className="text-center text-muted py-3" style={tdStyle}>
                        No records found for the selected date range.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row, idx) => (
                      <tr key={idx}>
                        <td style={tdStyle}>{formatDisplayDate(row.billDate)}</td>
                        <td style={tdStyle}>{row.startIp}</td>
                        <td style={tdStyle}>{row.endIp}</td>
                        <td style={{ ...tdStyle, textAlign: "center" }}>{row.ipCount}</td>
                        <td style={tdStyle}>{row.startOp}</td>
                        <td style={tdStyle}>{row.endOp}</td>
                        <td style={{ ...tdStyle, textAlign: "center" }}>{row.opCount}</td>
                        <td style={{ ...tdStyle, textAlign: "center" }}>{row.totalBills}</td>
                        <td style={{ ...tdStyle, textAlign: "right" }}>{fmt(row.taxable0)}</td>
                        <td style={{ ...tdStyle, textAlign: "right" }}>{fmt(row.tax0)}</td>
                        <td style={{ ...tdStyle, textAlign: "right" }}>{fmt(row.taxable5)}</td>
                        <td style={{ ...tdStyle, textAlign: "right" }}>{fmt(row.tax5)}</td>
                        <td style={{ ...tdStyle, textAlign: "right" }}>{fmt(row.taxable12 ?? 0)}</td>
                        <td style={{ ...tdStyle, textAlign: "right" }}>{fmt(row.tax12 ?? 0)}</td>
                        <td style={{ ...tdStyle, textAlign: "right" }}>{fmt(row.taxable18)}</td>
                        <td style={{ ...tdStyle, textAlign: "right" }}>{fmt(row.tax18)}</td>
                        <td style={{ ...tdStyle, textAlign: "right" }}>{fmt((row.taxable0 ?? 0) + (row.tax0 ?? 0) + (row.taxable5 ?? 0) + (row.tax5 ?? 0) + (row.taxable12 ?? 0) + (row.tax12 ?? 0) + (row.taxable18 ?? 0) + (row.tax18 ?? 0))}</td>
                        <td style={{ ...tdStyle, textAlign: "right" }}>{fmt(row.roundOff ?? 0)}</td>
                      </tr>
                    ))
                  )}
                  {rows.length > 0 && (
                    <tr style={totalRowStyle}>
                      <td colSpan={7} style={{ ...totalRowStyle, textAlign: "right" }}>Total</td>
                      <td style={{ ...totalRowStyle, textAlign: "center" }}>{total("totalBills")}</td>
                      <td style={{ ...totalRowStyle, textAlign: "right" }}>{fmt(total("taxable0"))}</td>
                      <td style={{ ...totalRowStyle, textAlign: "right" }}>{fmt(total("tax0"))}</td>
                      <td style={{ ...totalRowStyle, textAlign: "right" }}>{fmt(total("taxable5"))}</td>
                      <td style={{ ...totalRowStyle, textAlign: "right" }}>{fmt(total("tax5"))}</td>
                      <td style={{ ...totalRowStyle, textAlign: "right" }}>{fmt(total("taxable12"))}</td>
                      <td style={{ ...totalRowStyle, textAlign: "right" }}>{fmt(total("tax12"))}</td>
                      <td style={{ ...totalRowStyle, textAlign: "right" }}>{fmt(total("taxable18"))}</td>
                      <td style={{ ...totalRowStyle, textAlign: "right" }}>{fmt(total("tax18"))}</td>
                      <td style={{ ...totalRowStyle, textAlign: "right" }}>{fmt(total("taxable0") + total("tax0") + total("taxable5") + total("tax5") + total("taxable12") + total("tax12") + total("taxable18") + total("tax18"))}</td>
                      <td style={{ ...totalRowStyle, textAlign: "right" }}>{fmt(total("roundOff"))}</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>

            {/* ── Summary Table ── */}
            {rows.length > 0 && (
              <div style={{ marginTop: "1.5rem", maxWidth: "560px" }}>
                <Table bordered size="sm" className="mb-0">
                  <thead>
                    <tr>
                      <th style={thStyle}>Rate</th>
                      <th style={{ ...thStyle, textAlign: "right" }}>Taxable Value</th>
                      <th style={{ ...thStyle, textAlign: "right" }}>CGST</th>
                      <th style={{ ...thStyle, textAlign: "right" }}>SGST</th>
                      <th style={{ ...thStyle, textAlign: "right" }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaryRows.map((s, i) => (
                      <tr key={i}>
                        <td style={{ ...tdStyle, textAlign: "right" }}>{s.rate.toFixed(2)}</td>
                        <td style={{ ...tdStyle, textAlign: "right" }}>{fmt(s.taxableValue)}</td>
                        <td style={{ ...tdStyle, textAlign: "right" }}>{fmt(s.cgst)}</td>
                        <td style={{ ...tdStyle, textAlign: "right" }}>{fmt(s.sgst)}</td>
                        <td style={{ ...tdStyle, textAlign: "right" }}>{fmt(s.total)}</td>
                      </tr>
                    ))}
                    <tr style={totalRowStyle}>
                      <td style={{ ...totalRowStyle, textAlign: "right" }}></td>
                      <td style={{ ...totalRowStyle, textAlign: "right" }}>{fmt(summaryTotals.taxableValue)}</td>
                      <td style={{ ...totalRowStyle, textAlign: "right" }}>{fmt(summaryTotals.cgst)}</td>
                      <td style={{ ...totalRowStyle, textAlign: "right" }}>{fmt(summaryTotals.sgst)}</td>
                      <td style={{ ...totalRowStyle, textAlign: "right" }}>{fmt(summaryTotals.total)}</td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default SeparateReturn;

