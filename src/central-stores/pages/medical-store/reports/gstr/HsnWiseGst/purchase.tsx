import React, { useState } from "react";
import { Button, Card, Col, Form, Row, Table } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faFileExcel } from "@fortawesome/free-solid-svg-icons";
import { showValidationError, showErrorToast } from "../../../../../../utils/alertUtil";
import CentralStoresApiService, {
  HsnWisePurchaseRow,
} from "../../../../../../api/central-stores/central-stores-api-service";
import { exportToExcel } from "../../../../../../medical-records/utils/reportUtils";

const apiService = new CentralStoresApiService();
const today = new Date().toISOString().split("T")[0];

const fmt = (val?: number | null) => (val != null ? val.toFixed(2) : "0.00");
const fmt3 = (val?: number | null) => (val != null ? val.toFixed(3) : "0.000");

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

const Purchase: React.FC = () => {
  const [fromDate, setFromDate] = useState<string>(today);
  const [toDate, setToDate] = useState<string>(today);
  const [isLoading, setIsLoading] = useState(false);
  const [rows, setRows] = useState<HsnWisePurchaseRow[]>([]);
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
      const res = await apiService.fetchHsnWisePurchase(fromDate, toDate);
      setRows(res);
      setReportDates({ from: fromDate, to: toDate });
      setSubmitted(true);
    } catch {
      showErrorToast("Failed to fetch HSN Wise Purchase data.");
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
    const exportData = rows.map((r, i) => ({
      "Sl. No": i + 1,
      "Name": r.name,
      "HSN Code": r.hsnCode ?? "",
      "Quantity": r.totalQty,
      "Unit price": r.unitPrice,
      "Disc": r.disc,
      "Free": r.free,
      "Total": r.total,
      "Tax": r.tax,
      "Tax Amt": r.taxAmt,
      "Net": r.netAmt,
    }));
    exportToExcel(exportData, `HSN_Purchase_${fromDate}_to_${toDate}`);
  };

  const totalQty    = rows.reduce((s, r) => s + (r.totalQty ?? 0), 0);
  const totalDisc   = rows.reduce((s, r) => s + (r.disc     ?? 0), 0);
  const totalTotal  = rows.reduce((s, r) => s + (r.total    ?? 0), 0);
  const totalTaxAmt = rows.reduce((s, r) => s + (r.taxAmt   ?? 0), 0);
  const totalNet    = rows.reduce((s, r) => s + (r.netAmt   ?? 0), 0);

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
          HSN Wise Goods Receipt
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
            {rows.length === 0 ? (
              <div className="text-center text-muted py-3" style={tdStyle}>
                No records found for the selected date range.
              </div>
            ) : (
              <>
                <div
                  style={{
                    fontWeight: "var(--font-weight-semibold)" as React.CSSProperties["fontWeight"],
                    fontSize: "var(--font-size-md)" as React.CSSProperties["fontSize"],
                    marginBottom: "0.75rem",
                  }}
                >
                  GOODS PURCHASE DETAILS BETWEEN &quot;
                  <span style={{ color: "red" }}>{formatDisplayDate(reportDates.from)}</span>
                  &quot; AND &quot;
                  <span style={{ color: "red" }}>{formatDisplayDate(reportDates.to)}</span>
                  &quot;
                </div>
                <div style={{ overflowX: "auto" }}>
                  <Table bordered size="sm" className="mb-0">
                    <thead>
                      <tr>
                        <th style={{ ...thStyle, width: "55px" }}>Sl. No</th>
                        <th style={thStyle}>Name</th>
                        <th style={thStyle}>HSN Code</th>
                        <th style={{ ...thStyle, textAlign: "right" }}>Quantity</th>
                        <th style={{ ...thStyle, textAlign: "right" }}>Unit price</th>
                        <th style={{ ...thStyle, textAlign: "right" }}>Disc</th>
                        <th style={{ ...thStyle, textAlign: "right" }}>Free</th>
                        <th style={{ ...thStyle, textAlign: "right" }}>Total</th>
                        <th style={{ ...thStyle, textAlign: "right" }}>Tax</th>
                        <th style={{ ...thStyle, textAlign: "right" }}>Tax Amt</th>
                        <th style={{ ...thStyle, textAlign: "right" }}>Net</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, idx) => (
                        <tr key={idx}>
                          <td style={{ ...tdStyle, textAlign: "center" }}>{idx + 1}</td>
                          <td style={tdStyle}>{row.name}</td>
                          <td style={{ ...tdStyle, textAlign: "center" }}>{row.hsnCode ?? ""}</td>
                          <td style={{ ...tdStyle, textAlign: "right" }}>{row.totalQty}</td>
                          <td style={{ ...tdStyle, textAlign: "right" }}>{fmt3(row.unitPrice)}</td>
                          <td style={{ ...tdStyle, textAlign: "right" }}>{fmt(row.disc)}</td>
                          <td style={{ ...tdStyle, textAlign: "right" }}>{row.free}</td>
                          <td style={{ ...tdStyle, textAlign: "right" }}>{fmt(row.total)}</td>
                          <td style={{ ...tdStyle, textAlign: "right" }}>{row.tax}</td>
                          <td style={{ ...tdStyle, textAlign: "right" }}>{fmt(row.taxAmt)}</td>
                          <td style={{ ...tdStyle, textAlign: "right" }}>{fmt(row.netAmt)}</td>
                        </tr>
                      ))}
                      <tr style={totalRowStyle}>
                        <td colSpan={3} style={{ ...totalRowStyle, textAlign: "right" }}>Total</td>
                        <td style={{ ...totalRowStyle, textAlign: "right" }}>{totalQty}</td>
                        <td style={totalRowStyle} />
                        <td style={{ ...totalRowStyle, textAlign: "right" }}>{fmt(totalDisc)}</td>
                        <td style={totalRowStyle} />
                        <td style={{ ...totalRowStyle, textAlign: "right" }}>{fmt(totalTotal)}</td>
                        <td style={totalRowStyle} />
                        <td style={{ ...totalRowStyle, textAlign: "right" }}>{fmt(totalTaxAmt)}</td>
                        <td style={{ ...totalRowStyle, textAlign: "right" }}>{fmt(totalNet)}</td>
                      </tr>
                    </tbody>
                  </Table>
                </div>

                <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
                  <Button
                    className="theme-btn-primary"
                    onClick={handleExportExcel}
                    style={{ minWidth: "160px" }}
                  >
                    <FontAwesomeIcon icon={faFileExcel} className="me-2" />
                    Export To Excel
                  </Button>
                </div>
              </>
            )}
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default Purchase;