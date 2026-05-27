import React, { useState, useMemo } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Row,
  Col,
  Spinner,
  Alert,
} from "react-bootstrap";
import ReportHeader from "../../../../medical-records/components/ReportHeader";
import ReportKPICard from "../../../../medical-records/components/ReportKPICard";
import {
  exportToExcel,
  printReport,
  getDateRangeText,
  searchTableData,
} from "../../../../medical-records/utils/reportUtils";
import "../../../../medical-records/styles/reportStyles.css";
import { showValidationError } from "../../../../utils/alertUtil";

// ─── Interface ────────────────────────────────────────────────────────────────
interface SaleRecord {
  sNo: number;
  date: string;
  description: string;
  // Sales
  sale5Val: number;   sale5CGST: number;  sale5SGST: number;
  sale12Val: number;  sale12CGST: number; sale12SGST: number;
  sale18Val: number;  sale18CGST: number; sale18SGST: number;
  sale28Val: number;  sale28CGST: number; sale28SGST: number;
  sale0Val: number;   sale0CGST: number;  sale0SGST: number;
  // Returns
  ret5Val: number;    ret5CGST: number;   ret5SGST: number;
  ret12Val: number;   ret12CGST: number;  ret12SGST: number;
  ret18Val: number;   ret18CGST: number;  ret18SGST: number;
  ret28Val: number;   ret28CGST: number;  ret28SGST: number;
  ret0Val: number;    ret0CGST: number;   ret0SGST: number;
  // Totals
  saleTotal: number;
  retTotal: number;
  roundOff: number;
  netAmount: number;
}

// ─── Helper: build a record and auto-compute totals ───────────────────────────
function buildRecord(
  sNo: number, date: string, description: string,
  s5v: number, s5c: number, s5s: number,
  s12v: number, s12c: number, s12s: number,
  s18v: number, s18c: number, s18s: number,
  s28v: number, s28c: number, s28s: number,
  s0v: number, s0c: number, s0s: number,
  r5v: number, r5c: number, r5s: number,
  r12v: number, r12c: number, r12s: number,
  r18v: number, r18c: number, r18s: number,
  r28v: number, r28c: number, r28s: number,
  r0v: number, r0c: number, r0s: number,
  roundOff: number
): SaleRecord {
  const saleTotal =
    s5v + s5c + s5s + s12v + s12c + s12s +
    s18v + s18c + s18s + s28v + s28c + s28s + s0v;
  const retTotal =
    r5v + r5c + r5s + r12v + r12c + r12s +
    r18v + r18c + r18s + r28v + r28c + r28s + r0v;
  return {
    sNo, date, description,
    sale5Val: s5v,   sale5CGST: s5c,   sale5SGST: s5s,
    sale12Val: s12v, sale12CGST: s12c, sale12SGST: s12s,
    sale18Val: s18v, sale18CGST: s18c, sale18SGST: s18s,
    sale28Val: s28v, sale28CGST: s28c, sale28SGST: s28s,
    sale0Val: s0v,   sale0CGST: s0c,   sale0SGST: s0s,
    ret5Val: r5v,    ret5CGST: r5c,    ret5SGST: r5s,
    ret12Val: r12v,  ret12CGST: r12c,  ret12SGST: r12s,
    ret18Val: r18v,  ret18CGST: r18c,  ret18SGST: r18s,
    ret28Val: r28v,  ret28CGST: r28c,  ret28SGST: r28s,
    ret0Val: r0v,    ret0CGST: r0c,    ret0SGST: r0s,
    saleTotal, retTotal, roundOff,
    netAmount: saleTotal - retTotal + roundOff,
  };
}

// ─── Demo Data ────────────────────────────────────────────────────────────────
const DEMO_RECORDS: SaleRecord[] = [
  buildRecord(1,  "01-02-2026", "OP Sales",
    12400, 310,   310,   8500,  510,   510,   6200,  558,   558,   1800, 252,  252,  3200, 0, 0,
    400,  10,   10,    200,   12,    12,    100,   9,     9,     0,    0,    0,    0,   0, 0,  -0.25),
  buildRecord(2,  "01-02-2026", "IP Services",
    5200,  130,   130,   3800,  228,   228,   2800,  252,   252,   0,    0,    0,    1500, 0, 0,
    100,   2.5,   2.5,   50,    3,     3,     0,     0,     0,     0,    0,    0,    0,   0, 0,   0.50),
  buildRecord(3,  "05-02-2026", "OP Sales",
    14200, 355,   355,   9100,  546,   546,   7400,  666,   666,   2100, 294,  294,  4100, 0, 0,
    600,   15,    15,    300,   18,    18,    150,   13.5,  13.5,  0,    0,    0,    0,   0, 0,  -0.10),
  buildRecord(4,  "05-02-2026", "IP Services",
    6100,  152.5, 152.5, 4200,  252,   252,   3100,  279,   279,   500,  70,   70,   2100, 0, 0,
    0,     0,     0,     100,   6,     6,     0,     0,     0,     0,    0,    0,    0,   0, 0,   0.25),
  buildRecord(5,  "10-02-2026", "OP Sales",
    11800, 295,   295,   7900,  474,   474,   5600,  504,   504,   1500, 210,  210,  2800, 0, 0,
    500,   12.5,  12.5,  250,   15,    15,    200,   18,    18,    0,    0,    0,    0,   0, 0,  -0.50),
  buildRecord(6,  "10-02-2026", "IP Services",
    4800,  120,   120,   3500,  210,   210,   2400,  216,   216,   0,    0,    0,    1800, 0, 0,
    0,     0,     0,     80,    4.8,   4.8,   60,    5.4,   5.4,   0,    0,    0,    0,   0, 0,   0.00),
  buildRecord(7,  "15-02-2026", "OP Sales",
    13600, 340,   340,   8700,  522,   522,   6800,  612,   612,   2000, 280,  280,  3600, 0, 0,
    450,   11.25, 11.25, 150,   9,     9,     120,   10.8,  10.8,  0,    0,    0,    0,   0, 0,  -0.25),
  buildRecord(8,  "15-02-2026", "IP Services",
    5500,  137.5, 137.5, 4000,  240,   240,   2900,  261,   261,   600,  84,   84,   1900, 0, 0,
    200,   5,     5,     100,   6,     6,     0,     0,     0,     0,    0,    0,    0,   0, 0,   0.10),
  buildRecord(9,  "20-02-2026", "OP Sales",
    15000, 375,   375,   9800,  588,   588,   7200,  648,   648,   2500, 350,  350,  4200, 0, 0,
    700,   17.5,  17.5,  350,   21,    21,    180,   16.2,  16.2,  0,    0,    0,    0,   0, 0,  -0.75),
  buildRecord(10, "20-02-2026", "IP Services",
    5900,  147.5, 147.5, 4500,  270,   270,   3200,  288,   288,   700,  98,   98,   2200, 0, 0,
    150,   3.75,  3.75,  0,     0,     0,     0,     0,     0,     0,    0,    0,    0,   0, 0,   0.25),
];

// ─── Number formatter ─────────────────────────────────────────────────────────
const f = (n: number) => n.toFixed(2);

// ─── Component ────────────────────────────────────────────────────────────────
const Annexure2Sale: React.FC = () => {
  const today = new Date().toISOString().split("T")[0];
  const firstOfMonth = new Date(
    new Date().getFullYear(), new Date().getMonth(), 1
  ).toISOString().split("T")[0];

  const [fromDate, setFromDate]   = useState<string>(firstOfMonth);
  const [toDate, setToDate]       = useState<string>(today);
  const [salesType, setSalesType] = useState<string>("all");

  const [allRecords, setAllRecords]   = useState<SaleRecord[]>([]);
  const [baseData, setBaseData]       = useState<SaleRecord[]>([]);
  const [loading, setLoading]         = useState<boolean>(false);
  const [error, setError]             = useState<string | null>(null);
  const [submitted, setSubmitted]     = useState<boolean>(false);
  const [searchTerm, setSearchTerm]   = useState<string>("");

  // ── Processed data ────────────────────────────────────────────────────────
  const processedData = useMemo(() => {
    if (!submitted) return [];
    let data = [...baseData];
    if (searchTerm) {
      data = searchTableData(data, searchTerm, ["date", "description"]);
    }
    return data;
  }, [baseData, searchTerm, submitted]);

  // ── Column totals ─────────────────────────────────────────────────────────
  const totals = useMemo(() => {
    const sum = (fn: (r: SaleRecord) => number) =>
      processedData.reduce((s, r) => s + fn(r), 0);
    return {
      sale5Val:   sum(r => r.sale5Val),   sale5CGST:  sum(r => r.sale5CGST),  sale5SGST:  sum(r => r.sale5SGST),
      sale12Val:  sum(r => r.sale12Val),  sale12CGST: sum(r => r.sale12CGST), sale12SGST: sum(r => r.sale12SGST),
      sale18Val:  sum(r => r.sale18Val),  sale18CGST: sum(r => r.sale18CGST), sale18SGST: sum(r => r.sale18SGST),
      sale28Val:  sum(r => r.sale28Val),  sale28CGST: sum(r => r.sale28CGST), sale28SGST: sum(r => r.sale28SGST),
      sale0Val:   sum(r => r.sale0Val),   sale0CGST:  sum(r => r.sale0CGST),  sale0SGST:  sum(r => r.sale0SGST),
      ret5Val:    sum(r => r.ret5Val),    ret5CGST:   sum(r => r.ret5CGST),   ret5SGST:   sum(r => r.ret5SGST),
      ret12Val:   sum(r => r.ret12Val),   ret12CGST:  sum(r => r.ret12CGST),  ret12SGST:  sum(r => r.ret12SGST),
      ret18Val:   sum(r => r.ret18Val),   ret18CGST:  sum(r => r.ret18CGST),  ret18SGST:  sum(r => r.ret18SGST),
      ret28Val:   sum(r => r.ret28Val),   ret28CGST:  sum(r => r.ret28CGST),  ret28SGST:  sum(r => r.ret28SGST),
      ret0Val:    sum(r => r.ret0Val),    ret0CGST:   sum(r => r.ret0CGST),   ret0SGST:   sum(r => r.ret0SGST),
      saleTotal:  sum(r => r.saleTotal),
      retTotal:   sum(r => r.retTotal),
      roundOff:   sum(r => r.roundOff),
      netAmount:  sum(r => r.netAmount),
    };
  }, [processedData]);

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    totalSale: allRecords.reduce((s, r) => s + r.saleTotal, 0),
    totalRet:  allRecords.reduce((s, r) => s + r.retTotal,  0),
    netAmount: allRecords.reduce((s, r) => s + r.netAmount, 0),
    opSales:   allRecords.filter(r => r.description === "OP Sales").length,
    ipServices:allRecords.filter(r => r.description === "IP Services").length,
  }), [allRecords]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
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
    setTimeout(() => {
      const filtered = DEMO_RECORDS.filter((r) => {
        if (salesType === "op")  return r.description === "OP Sales";
        if (salesType === "ip")  return r.description === "IP Services";
        return true;
      });
      setAllRecords(filtered);
      setBaseData(filtered);
      setSubmitted(true);
      setLoading(false);
    }, 600);
  };

  const handleReset = () => {
    setFromDate(firstOfMonth);
    setToDate(today);
    setSalesType("all");
    setAllRecords([]);
    setBaseData([]);
    setSearchTerm("");
    setError(null);
    setSubmitted(false);
  };

  const handleExport = () => {
    const exportData = processedData.map((r) => ({
      "Date": r.date, "Description": r.description,
      "Sale 5% Val": r.sale5Val,   "Sale 5% CGST": r.sale5CGST,   "Sale 5% SGST": r.sale5SGST,
      "Sale 12% Val": r.sale12Val, "Sale 12% CGST": r.sale12CGST, "Sale 12% SGST": r.sale12SGST,
      "Sale 18% Val": r.sale18Val, "Sale 18% CGST": r.sale18CGST, "Sale 18% SGST": r.sale18SGST,
      "Sale 28% Val": r.sale28Val, "Sale 28% CGST": r.sale28CGST, "Sale 28% SGST": r.sale28SGST,
      "Sale 0% Val":  r.sale0Val,  "Sale 0% CGST":  r.sale0CGST,  "Sale 0% SGST":  r.sale0SGST,
      "Ret 5% Val":  r.ret5Val,    "Ret 5% CGST":  r.ret5CGST,    "Ret 5% SGST":  r.ret5SGST,
      "Ret 12% Val": r.ret12Val,   "Ret 12% CGST": r.ret12CGST,   "Ret 12% SGST": r.ret12SGST,
      "Ret 18% Val": r.ret18Val,   "Ret 18% CGST": r.ret18CGST,   "Ret 18% SGST": r.ret18SGST,
      "Ret 28% Val": r.ret28Val,   "Ret 28% CGST": r.ret28CGST,   "Ret 28% SGST": r.ret28SGST,
      "Ret 0% Val":  r.ret0Val,    "Ret 0% CGST":  r.ret0CGST,    "Ret 0% SGST":  r.ret0SGST,
      "Sale Total": r.saleTotal, "Return": r.retTotal,
      "Round Off": r.roundOff,   "Net Amount": r.netAmount,
    }));
    exportToExcel(exportData, "Annexure2_Sale");
  };

  // ── Table header cell style ───────────────────────────────────────────────
  const thStyle: React.CSSProperties = {
    background: "var(--table-header-bg, #495057)",
    color: "var(--table-header-color, #fff)",
    textAlign: "center",
    verticalAlign: "middle",
    whiteSpace: "nowrap",
    fontSize: "var(--font-size-xs)",
    fontWeight: "var(--font-weight-semibold)",
    padding: "6px 4px",
    border: "1px solid var(--border-color, #6c757d)",
  };

  const tdStyle: React.CSSProperties = {
    fontSize: "var(--font-size-xs)",
    padding: "4px 6px",
    whiteSpace: "nowrap",
    border: "1px solid var(--border-color, #dee2e6)",
    verticalAlign: "middle",
  };

  const tdNumStyle: React.CSSProperties = { ...tdStyle, textAlign: "right" };
  const tdCenterStyle: React.CSSProperties = { ...tdStyle, textAlign: "center" };

  const tfootStyle: React.CSSProperties = {
    ...tdNumStyle,
    fontWeight: "var(--font-weight-bold)",
    background: "var(--table-footer-bg, #f8f9fa)",
  };

  return (
    <React.Fragment>
      <Container fluid className="px-4 py-3">
        {/* ── Report Header ───────────────────────────────────────────────── */}
        <ReportHeader
          title="Annexure 2 — Sale"
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
          <Alert variant="danger" className="mt-3">{error}</Alert>
        )}

        {/* ── Filter Form ─────────────────────────────────────────────────── */}
        <Card className="mb-4 shadow-sm no-print">
          <Card.Body>
            <Form className="row g-3 align-items-end" onSubmit={handleSubmit}>
              <Form.Group as={Col} md={3} controlId="fromDate">
                <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>
                  From Date
                </Form.Label>
                <Form.Control
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group as={Col} md={3} controlId="toDate">
                <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>
                  To Date
                </Form.Label>
                <Form.Control
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group as={Col} md={3} controlId="salesType">
                <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>
                  Sales Type
                </Form.Label>
                <Form.Select
                  value={salesType}
                  onChange={(e) => setSalesType(e.target.value)}
                >
                  <option value="all">All Sales and Services</option>
                  <option value="op">OP Sales</option>
                  <option value="ip">IP Services</option>
                </Form.Select>
              </Form.Group>

              <Form.Group as={Col} md={3} className="d-flex align-items-end gap-2">
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

        {/* ── KPI Cards ───────────────────────────────────────────────────── */}
        {submitted && (
          <Row className="mb-4">
            <Col md={3}>
              <ReportKPICard
                label="Total Sale"
                value={`₹ ${stats.totalSale.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
                variant="primary"
              />
            </Col>
            <Col md={3}>
              <ReportKPICard
                label="Total Return"
                value={`₹ ${stats.totalRet.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
                variant="danger"
              />
            </Col>
            <Col md={3}>
              <ReportKPICard
                label="Net Amount"
                value={`₹ ${stats.netAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
                variant="success"
              />
            </Col>
            <Col md={3}>
              <ReportKPICard
                label="Total Entries"
                value={allRecords.length}
                variant="info"
              />
            </Col>
          </Row>
        )}

        {/* ── Table ───────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="text-center py-5 text-muted">
            <Spinner animation="border" role="status" />
            <div className="mt-3">Loading Annexure 2 Sale data...</div>
          </div>
        ) : (
          <Card className="report-card" style={{ padding: "0.75rem" }}>
            <div
              style={{
                maxHeight: "calc(115vh - 520px)",
                minHeight: "350px",
                overflowY: "auto",
                overflowX: "auto",
                position: "relative",
              }}
            >
              <table
                className="table table-bordered table-hover mb-0"
                style={{ borderCollapse: "collapse", minWidth: "2400px" }}
              >
                <thead style={{ position: "sticky", top: 0, zIndex: 2 }}>
                  {/* Row 1 */}
                  <tr>
                    <th rowSpan={3} style={thStyle}>Date</th>
                    <th rowSpan={3} style={{ ...thStyle, minWidth: "120px" }}>Description</th>
                    <th colSpan={15} style={thStyle}>Sales</th>
                    <th colSpan={15} style={thStyle}>Return</th>
                    <th rowSpan={3} style={thStyle}>Sale Total</th>
                    <th rowSpan={3} style={thStyle}>Retn</th>
                    <th rowSpan={3} style={thStyle}>Round Off</th>
                    <th rowSpan={3} style={thStyle}>Net Amount</th>
                  </tr>
                  {/* Row 2 */}
                  <tr>
                    {[
                      "5%", "12%", "18%", "28%", "0%",
                      "5%", "12%", "18%", "28%", "0%",
                    ].map((pct, i) => (
                      <th key={i} colSpan={3} style={thStyle}>{pct}</th>
                    ))}
                  </tr>
                  {/* Row 3 */}
                  <tr>
                    {Array.from({ length: 10 }).map((_, i) => (
                      <React.Fragment key={i}>
                        <th style={thStyle}>Value</th>
                        <th style={thStyle}>CGST</th>
                        <th style={thStyle}>SGST</th>
                      </React.Fragment>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {processedData.length === 0 ? (
                    <tr>
                      <td colSpan={36} style={{ ...tdCenterStyle, padding: "2rem" }}>
                        {!submitted
                          ? "No data loaded. Please select date range and click Submit."
                          : searchTerm
                          ? "No records match your search criteria."
                          : "No records found."}
                      </td>
                    </tr>
                  ) : (
                    processedData.map((r) => (
                      <tr key={r.sNo}>
                        <td style={tdCenterStyle}><strong>{r.date}</strong></td>
                        <td style={tdStyle}><strong>{r.description}</strong></td>
                        {/* Sales */}
                        <td style={tdNumStyle}>{f(r.sale5Val)}</td>
                        <td style={tdNumStyle}>{f(r.sale5CGST)}</td>
                        <td style={tdNumStyle}>{f(r.sale5SGST)}</td>
                        <td style={tdNumStyle}>{f(r.sale12Val)}</td>
                        <td style={tdNumStyle}>{f(r.sale12CGST)}</td>
                        <td style={tdNumStyle}>{f(r.sale12SGST)}</td>
                        <td style={tdNumStyle}>{f(r.sale18Val)}</td>
                        <td style={tdNumStyle}>{f(r.sale18CGST)}</td>
                        <td style={tdNumStyle}>{f(r.sale18SGST)}</td>
                        <td style={tdNumStyle}>{f(r.sale28Val)}</td>
                        <td style={tdNumStyle}>{f(r.sale28CGST)}</td>
                        <td style={tdNumStyle}>{f(r.sale28SGST)}</td>
                        <td style={tdNumStyle}>{f(r.sale0Val)}</td>
                        <td style={tdNumStyle}>{f(r.sale0CGST)}</td>
                        <td style={tdNumStyle}>{f(r.sale0SGST)}</td>
                        {/* Returns */}
                        <td style={tdNumStyle}>{f(r.ret5Val)}</td>
                        <td style={tdNumStyle}>{f(r.ret5CGST)}</td>
                        <td style={tdNumStyle}>{f(r.ret5SGST)}</td>
                        <td style={tdNumStyle}>{f(r.ret12Val)}</td>
                        <td style={tdNumStyle}>{f(r.ret12CGST)}</td>
                        <td style={tdNumStyle}>{f(r.ret12SGST)}</td>
                        <td style={tdNumStyle}>{f(r.ret18Val)}</td>
                        <td style={tdNumStyle}>{f(r.ret18CGST)}</td>
                        <td style={tdNumStyle}>{f(r.ret18SGST)}</td>
                        <td style={tdNumStyle}>{f(r.ret28Val)}</td>
                        <td style={tdNumStyle}>{f(r.ret28CGST)}</td>
                        <td style={tdNumStyle}>{f(r.ret28SGST)}</td>
                        <td style={tdNumStyle}>{f(r.ret0Val)}</td>
                        <td style={tdNumStyle}>{f(r.ret0CGST)}</td>
                        <td style={tdNumStyle}>{f(r.ret0SGST)}</td>
                        {/* Summary */}
                        <td style={{ ...tdNumStyle, fontWeight: "var(--font-weight-semibold)" }}>{f(r.saleTotal)}</td>
                        <td style={{ ...tdNumStyle, fontWeight: "var(--font-weight-semibold)" }}>{f(r.retTotal)}</td>
                        <td style={tdNumStyle}>{f(r.roundOff)}</td>
                        <td style={{ ...tdNumStyle, fontWeight: "var(--font-weight-bold)" }}>{f(r.netAmount)}</td>
                      </tr>
                    ))
                  )}
                </tbody>

                {/* Totals row */}
                {processedData.length > 0 && (
                  <tfoot>
                    <tr>
                      <td colSpan={2} style={{ ...tfootStyle, textAlign: "center" }}>
                        <strong>Total</strong>
                      </td>
                      <td style={tfootStyle}>{f(totals.sale5Val)}</td>
                      <td style={tfootStyle}>{f(totals.sale5CGST)}</td>
                      <td style={tfootStyle}>{f(totals.sale5SGST)}</td>
                      <td style={tfootStyle}>{f(totals.sale12Val)}</td>
                      <td style={tfootStyle}>{f(totals.sale12CGST)}</td>
                      <td style={tfootStyle}>{f(totals.sale12SGST)}</td>
                      <td style={tfootStyle}>{f(totals.sale18Val)}</td>
                      <td style={tfootStyle}>{f(totals.sale18CGST)}</td>
                      <td style={tfootStyle}>{f(totals.sale18SGST)}</td>
                      <td style={tfootStyle}>{f(totals.sale28Val)}</td>
                      <td style={tfootStyle}>{f(totals.sale28CGST)}</td>
                      <td style={tfootStyle}>{f(totals.sale28SGST)}</td>
                      <td style={tfootStyle}>{f(totals.sale0Val)}</td>
                      <td style={tfootStyle}>{f(totals.sale0CGST)}</td>
                      <td style={tfootStyle}>{f(totals.sale0SGST)}</td>
                      <td style={tfootStyle}>{f(totals.ret5Val)}</td>
                      <td style={tfootStyle}>{f(totals.ret5CGST)}</td>
                      <td style={tfootStyle}>{f(totals.ret5SGST)}</td>
                      <td style={tfootStyle}>{f(totals.ret12Val)}</td>
                      <td style={tfootStyle}>{f(totals.ret12CGST)}</td>
                      <td style={tfootStyle}>{f(totals.ret12SGST)}</td>
                      <td style={tfootStyle}>{f(totals.ret18Val)}</td>
                      <td style={tfootStyle}>{f(totals.ret18CGST)}</td>
                      <td style={tfootStyle}>{f(totals.ret18SGST)}</td>
                      <td style={tfootStyle}>{f(totals.ret28Val)}</td>
                      <td style={tfootStyle}>{f(totals.ret28CGST)}</td>
                      <td style={tfootStyle}>{f(totals.ret28SGST)}</td>
                      <td style={tfootStyle}>{f(totals.ret0Val)}</td>
                      <td style={tfootStyle}>{f(totals.ret0CGST)}</td>
                      <td style={tfootStyle}>{f(totals.ret0SGST)}</td>
                      <td style={tfootStyle}>{f(totals.saleTotal)}</td>
                      <td style={tfootStyle}>{f(totals.retTotal)}</td>
                      <td style={tfootStyle}>{f(totals.roundOff)}</td>
                      <td style={{ ...tfootStyle }}>{f(totals.netAmount)}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {/* Footer row count */}
            <div
              style={{
                padding: "0.5rem 1rem",
                borderTop: "2px solid var(--border-color, #e0e0e0)",
                textAlign: "start",
              }}
            >
              <small
                className="text-muted"
                style={{ fontWeight: "var(--font-weight-medium)" }}
              >
                Total Data Rows: <strong>{processedData.length}</strong>
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
};

export default Annexure2Sale;

