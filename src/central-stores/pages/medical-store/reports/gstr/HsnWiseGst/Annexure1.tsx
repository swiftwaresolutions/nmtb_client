import React, { useState } from "react";
import { Button, Card, Col, Form, Row, Table } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faFileExcel } from "@fortawesome/free-solid-svg-icons";
import { showValidationError, showErrorToast } from "../../../../../../utils/alertUtil";
import CentralStoresApiService, {
  Annexure1Row,
} from "../../../../../../api/central-stores/central-stores-api-service";
import { exportToExcel } from "../../../../../../medical-records/utils/reportUtils";

const apiService = new CentralStoresApiService();
const today = new Date().toISOString().split("T")[0];

const fmt = (val?: number | null) => (val != null ? val.toFixed(2) : "0.00");

const formatDisplayDate = (iso: string) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
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
  color: "red",
};

const Annexure1: React.FC = () => {
  const [fromDate, setFromDate] = useState<string>(today);
  const [toDate, setToDate] = useState<string>(today);
  const [isLoading, setIsLoading] = useState(false);
  const [rows, setRows] = useState<Annexure1Row[]>([]);
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
      const res = await apiService.fetchAnnexure1(fromDate, toDate);
      setRows(res);
      setReportDates({ from: fromDate, to: toDate });
      setSubmitted(true);
    } catch {
      showErrorToast("Failed to fetch Annexure-1 (Purchase) data.");
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
      "Sl No": i + 1,
      "Seller Name": r.seller,
      "Seller Tin": r.tin,
      "Comm Code": r.cmmCode,
      "Inv No": r.invNo,
      "Inv Date": r.invDate,
      "Total Value": r.totalAmt,
      "Tax %": r.taxRate,
      "GST Paid": r.gstPaid,
      "Category": r.category,
    }));
    exportToExcel(exportData, `Annexure1_Purchase_${fromDate}_to_${toDate}`);
  };

  const totalAmt = rows.reduce((s, r) => s + (r.totalAmt ?? 0), 0);
  const totalGst = rows.reduce((s, r) => s + (r.gstPaid ?? 0), 0);

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
          Annexure-1 (Purchase)
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
                    color: "red",
                    marginBottom: "0.75rem",
                  }}
                >
                  PURCHASE TAX DATE BETWEEN &quot;{formatDisplayDate(reportDates.from)}&quot; AND &quot;
                  {formatDisplayDate(reportDates.to)}&quot;
                </div>
                <div style={{ overflowX: "auto" }}>
                  <Table bordered size="sm" className="mb-0">
                    <thead>
                      <tr>
                        <th style={{ ...thStyle, width: "55px" }}>Sl No</th>
                        <th style={thStyle}>Seller Name</th>
                        <th style={thStyle}>Seller Tin</th>
                        <th style={thStyle}>Comm Code</th>
                        <th style={thStyle}>Inv No</th>
                        <th style={thStyle}>Inv Date</th>
                        <th style={{ ...thStyle, textAlign: "right" }}>Taxable</th>
                        <th style={{ ...thStyle, textAlign: "right" }}>Tax %</th>
                        <th style={{ ...thStyle, textAlign: "right" }}>GST Paid</th>
                        <th style={thStyle}>Category</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, idx) => (
                        <tr key={idx}>
                          <td style={{ ...tdStyle, textAlign: "center" }}>{idx + 1}</td>
                          <td style={tdStyle}>{row.seller}</td>
                          <td style={tdStyle}>{row.tin}</td>
                          <td style={{ ...tdStyle, textAlign: "center" }}>{row.cmmCode}</td>
                          <td style={tdStyle}>{row.invNo}</td>
                          <td style={{ ...tdStyle, textAlign: "center" }}>{row.invDate}</td>
                          <td style={{ ...tdStyle, textAlign: "right" }}>{fmt(row.totalAmt)}</td>
                          <td style={{ ...tdStyle, textAlign: "right" }}>{fmt(row.taxRate)}</td>
                          <td style={{ ...tdStyle, textAlign: "right" }}>{fmt(row.gstPaid)}</td>
                          <td style={{ ...tdStyle, textAlign: "center" }}>{row.category}</td>
                        </tr>
                      ))}
                      <tr style={totalRowStyle}>
                        <td colSpan={6} style={{ ...totalRowStyle, textAlign: "right" }} />
                        <td style={{ ...totalRowStyle, textAlign: "right" }}>{fmt(totalAmt)}</td>
                        <td style={totalRowStyle} />
                        <td style={{ ...totalRowStyle, textAlign: "right" }}>{fmt(totalGst)}</td>
                        <td style={totalRowStyle} />
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

export default Annexure1;
