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
  Badge,
} from "react-bootstrap";
import { ChevronDown, ChevronRight } from "react-bootstrap-icons";
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

// ─── Interfaces ───────────────────────────────────────────────────────────────
interface GoodsItem {
  sNo: number;
  name: string;
  batch: string;
  expiryDate: string;
  quantity: number;
  offer: number;
  value: number;
}

interface GRRecord {
  id: number;
  grNo: string;
  invoiceNo: string;
  invoiceDate: string;
  total: number;
  reducedRate: number;
  addedRate: number;
  netAmount: number;
  enteredBy: string;
  supplierId: number;
  items: GoodsItem[];
}

interface Supplier {
  id: number;
  name: string;
}

// ─── Demo Suppliers ───────────────────────────────────────────────────────────
const DEMO_SUPPLIERS: Supplier[] = [
  { id: 1, name: "Sun Pharma Distributors" },
  { id: 2, name: "Cipla Wholesale Pvt Ltd" },
  { id: 3, name: "MedLine Distributors" },
  { id: 4, name: "HealthPlus Traders" },
  { id: 5, name: "Zydus Distributors" },
];

// ─── Demo GR Records ─────────────────────────────────────────────────────────
const DEMO_RECORDS: GRRecord[] = [
  {
    id: 1, supplierId: 1, grNo: "GR-1001", invoiceNo: "INV-5001",
    invoiceDate: "05-01-2026", total: 12500.00, reducedRate: 250.00,
    addedRate: 0.00, netAmount: 12250.00, enteredBy: "Admin",
    items: [
      { sNo: 1, name: "Paracetamol 500mg",   batch: "B2026A", expiryDate: "12-2027", quantity: 500, offer: 10, value: 4500.00 },
      { sNo: 2, name: "Amoxicillin 250mg",   batch: "C2026B", expiryDate: "06-2028", quantity: 300, offer:  5, value: 3800.00 },
      { sNo: 3, name: "Metformin 500mg",     batch: "D2026C", expiryDate: "09-2027", quantity: 400, offer:  0, value: 4200.00 },
    ],
  },
  {
    id: 2, supplierId: 1, grNo: "GR-1002", invoiceNo: "INV-5002",
    invoiceDate: "12-01-2026", total: 8700.00, reducedRate: 0.00,
    addedRate: 300.00, netAmount: 9000.00, enteredBy: "Pharmacy",
    items: [
      { sNo: 1, name: "Atorvastatin 10mg",   batch: "E2026D", expiryDate: "03-2028", quantity: 200, offer: 0, value: 5100.00 },
      { sNo: 2, name: "Omeprazole 20mg",     batch: "F2026E", expiryDate: "11-2027", quantity: 250, offer: 5, value: 3600.00 },
    ],
  },
  {
    id: 3, supplierId: 2, grNo: "GR-1003", invoiceNo: "INV-6001",
    invoiceDate: "07-01-2026", total: 15200.00, reducedRate: 500.00,
    addedRate: 0.00, netAmount: 14700.00, enteredBy: "Admin",
    items: [
      { sNo: 1, name: "Amlodipine 5mg",      batch: "G2026F", expiryDate: "08-2028", quantity: 600, offer: 10, value: 6200.00 },
      { sNo: 2, name: "Losartan 50mg",       batch: "H2026G", expiryDate: "04-2027", quantity: 400, offer:  0, value: 5300.00 },
      { sNo: 3, name: "Glibenclamide 5mg",   batch: "I2026H", expiryDate: "07-2027", quantity: 350, offer:  5, value: 3700.00 },
    ],
  },
  {
    id: 4, supplierId: 2, grNo: "GR-1004", invoiceNo: "INV-6002",
    invoiceDate: "18-01-2026", total: 9400.00, reducedRate: 200.00,
    addedRate: 100.00, netAmount: 9300.00, enteredBy: "Storekeeper",
    items: [
      { sNo: 1, name: "Cetirizine 10mg",     batch: "J2026I", expiryDate: "02-2028", quantity: 500, offer: 0, value: 4900.00 },
      { sNo: 2, name: "Pantoprazole 40mg",   batch: "K2026J", expiryDate: "10-2027", quantity: 300, offer: 5, value: 4500.00 },
    ],
  },
  {
    id: 5, supplierId: 3, grNo: "GR-1005", invoiceNo: "INV-7001",
    invoiceDate: "10-01-2026", total: 6800.00, reducedRate: 0.00,
    addedRate: 200.00, netAmount: 7000.00, enteredBy: "Admin",
    items: [
      { sNo: 1, name: "Metronidazole 400mg", batch: "L2026K", expiryDate: "05-2028", quantity: 400, offer: 0, value: 3300.00 },
      { sNo: 2, name: "Cefixime 200mg",      batch: "M2026L", expiryDate: "01-2028", quantity: 200, offer: 0, value: 3500.00 },
    ],
  },
  {
    id: 6, supplierId: 4, grNo: "GR-1006", invoiceNo: "INV-8001",
    invoiceDate: "15-01-2026", total: 11300.00, reducedRate: 350.00,
    addedRate: 0.00, netAmount: 10950.00, enteredBy: "Pharmacy",
    items: [
      { sNo: 1, name: "Azithromycin 500mg",  batch: "N2026M", expiryDate: "06-2028", quantity: 300, offer: 10, value: 5600.00 },
      { sNo: 2, name: "Doxycycline 100mg",   batch: "O2026N", expiryDate: "09-2027", quantity: 250, offer:  5, value: 3200.00 },
      { sNo: 3, name: "Ciprofloxacin 500mg", batch: "P2026O", expiryDate: "12-2027", quantity: 200, offer:  0, value: 2500.00 },
    ],
  },
  {
    id: 7, supplierId: 5, grNo: "GR-1007", invoiceNo: "INV-9001",
    invoiceDate: "20-01-2026", total: 13600.00, reducedRate: 400.00,
    addedRate: 200.00, netAmount: 13400.00, enteredBy: "Admin",
    items: [
      { sNo: 1, name: "Ibuprofen 400mg",     batch: "Q2026P", expiryDate: "03-2028", quantity: 600, offer: 10, value: 5800.00 },
      { sNo: 2, name: "Diclofenac 50mg",     batch: "R2026Q", expiryDate: "08-2027", quantity: 400, offer:  5, value: 4200.00 },
      { sNo: 3, name: "Naproxen 250mg",      batch: "S2026R", expiryDate: "11-2027", quantity: 350, offer:  0, value: 3600.00 },
    ],
  },
];

// ─── Number formatter ─────────────────────────────────────────────────────────
const f = (n: number) =>
  n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ─── Component ────────────────────────────────────────────────────────────────
const SupplierWiseGoods: React.FC = () => {
  const today = new Date().toISOString().split("T")[0];
  const firstOfMonth = new Date(
    new Date().getFullYear(), new Date().getMonth(), 1
  ).toISOString().split("T")[0];

  const [fromDate, setFromDate]       = useState<string>(firstOfMonth);
  const [toDate, setToDate]           = useState<string>(today);
  const [supplierId, setSupplierId]   = useState<string>("0");

  const [allRecords, setAllRecords]   = useState<GRRecord[]>([]);
  const [loading, setLoading]         = useState<boolean>(false);
  const [error, setError]             = useState<string | null>(null);
  const [submitted, setSubmitted]     = useState<boolean>(false);
  const [searchTerm, setSearchTerm]   = useState<string>("");
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  // ── Filtered + searched data ──────────────────────────────────────────────
  const processedData = useMemo(() => {
    if (!submitted) return [];
    let data = [...allRecords];
    if (searchTerm) {
      data = searchTableData(data, searchTerm, ["grNo", "invoiceNo", "enteredBy"]);
    }
    return data;
  }, [allRecords, searchTerm, submitted]);

  // ── Totals ────────────────────────────────────────────────────────────────
  const totals = useMemo(
    () => ({
      total:       processedData.reduce((s, r) => s + r.total,       0),
      reducedRate: processedData.reduce((s, r) => s + r.reducedRate, 0),
      addedRate:   processedData.reduce((s, r) => s + r.addedRate,   0),
      netAmount:   processedData.reduce((s, r) => s + r.netAmount,   0),
    }),
    [processedData]
  );

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const stats = useMemo(
    () => ({
      grCount:   allRecords.length,
      suppliers: new Set(allRecords.map((r) => r.supplierId)).size,
      totalAmt:  allRecords.reduce((s, r) => s + r.total,     0),
      netAmt:    allRecords.reduce((s, r) => s + r.netAmount, 0),
    }),
    [allRecords]
  );

  // ── Toggle expand ─────────────────────────────────────────────────────────
  const toggleRow = (id: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

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
    setExpandedRows(new Set());
    setTimeout(() => {
      const sid = parseInt(supplierId, 10);
      const filtered = DEMO_RECORDS.filter(
        (r) => sid === 0 || r.supplierId === sid
      );
      setAllRecords(filtered);
      setSubmitted(true);
      setLoading(false);
    }, 600);
  };

  const handleReset = () => {
    setFromDate(firstOfMonth);
    setToDate(today);
    setSupplierId("0");
    setAllRecords([]);
    setSearchTerm("");
    setError(null);
    setSubmitted(false);
    setExpandedRows(new Set());
  };

  const handleExport = () => {
    const exportData = processedData.map((r, i) => ({
      "Sl.No":          i + 1,
      "GR No":          r.grNo,
      "Invoice No":     r.invoiceNo,
      "Invoice Date":   r.invoiceDate,
      "Total":          r.total,
      "Reduced Rate":   r.reducedRate,
      "Added Rate":     r.addedRate,
      "Net Amount":     r.netAmount,
      "Entered By":     r.enteredBy,
    }));
    exportToExcel(exportData, "Supplier_Wise_Goods");
  };

  // ── Shared styles ─────────────────────────────────────────────────────────
  const thStyle: React.CSSProperties = {
    background: "var(--table-header-bg, #495057)",
    color: "var(--table-header-color, #fff)",
    textAlign: "center",
    verticalAlign: "middle",
    whiteSpace: "nowrap",
    fontSize: "var(--font-size-xs)",
    fontWeight: "var(--font-weight-semibold)",
    padding: "6px 8px",
    border: "1px solid var(--border-color, #6c757d)",
  };

  const tdStyle: React.CSSProperties = {
    fontSize: "var(--font-size-xs)",
    padding: "5px 8px",
    whiteSpace: "nowrap",
    border: "1px solid var(--border-color, #dee2e6)",
    verticalAlign: "middle",
  };

  const tdNumStyle: React.CSSProperties = { ...tdStyle, textAlign: "right" };
  const tdCenterStyle: React.CSSProperties = { ...tdStyle, textAlign: "center" };

  const tfootStyle: React.CSSProperties = {
    ...tdNumStyle,
    fontWeight: "var(--font-weight-bold)",
    background: "var(--primary, #0d6efd)",
    color: "#fff",
    border: "1px solid var(--border-color, #0d6efd)",
  };

  const subThStyle: React.CSSProperties = {
    ...thStyle,
    background: "var(--secondary, #6c757d)",
    fontSize: "var(--font-size-xs)",
    padding: "4px 6px",
  };

  const subTdStyle: React.CSSProperties = {
    ...tdStyle,
    background: "var(--light, #f8f9fa)",
    fontSize: "var(--font-size-xs)",
    padding: "4px 6px",
  };

  const subTdNumStyle: React.CSSProperties = { ...subTdStyle, textAlign: "right" };
  const subTdCenterStyle: React.CSSProperties = { ...subTdStyle, textAlign: "center" };

  return (
    <React.Fragment>
      <Container fluid className="px-4 py-3">
        {/* ── Report Header ───────────────────────────────────────────────── */}
        <ReportHeader
          title="Supplier Wise Goods"
          subtitle={
            submitted
              ? getDateRangeText(fromDate, toDate)
              : "Select filters and click Submit"
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

              <Form.Group as={Col} md={3} controlId="supplier">
                <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>
                  Supplier
                </Form.Label>
                <Form.Select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                >
                  <option value="0">All Suppliers</option>
                  {DEMO_SUPPLIERS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
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
              <ReportKPICard label="Total GR Records" value={stats.grCount}   variant="primary" />
            </Col>
            <Col md={3}>
              <ReportKPICard label="Suppliers"        value={stats.suppliers} variant="info"    />
            </Col>
            <Col md={3}>
              <ReportKPICard
                label="Total Amount"
                value={`₹ ${stats.totalAmt.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
                variant="warning"
              />
            </Col>
            <Col md={3}>
              <ReportKPICard
                label="Net Amount"
                value={`₹ ${stats.netAmt.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
                variant="success"
              />
            </Col>
          </Row>
        )}

        {/* ── Table ───────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="text-center py-5 text-muted">
            <Spinner animation="border" role="status" />
            <div className="mt-3">Loading supplier wise goods...</div>
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
              <table
                className="table table-bordered mb-0"
                style={{ borderCollapse: "collapse", minWidth: "900px" }}
              >
                <thead style={{ position: "sticky", top: 0, zIndex: 2 }}>
                  <tr>
                    <th style={{ ...thStyle, width: "36px" }}></th>
                    <th style={{ ...thStyle, width: "50px" }}>Sl.No</th>
                    <th style={thStyle}>GR No</th>
                    <th style={thStyle}>Invoice No</th>
                    <th style={thStyle}>Invoice Date</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Total</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Reduced Rate</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Added Rate</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Net Amount</th>
                    <th style={thStyle}>Entered By</th>
                  </tr>
                </thead>

                <tbody>
                  {processedData.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ ...tdCenterStyle, padding: "2rem" }}>
                        {!submitted
                          ? "No data loaded. Please select filters and click Submit."
                          : searchTerm
                          ? "No records match your search criteria."
                          : "No records found."}
                      </td>
                    </tr>
                  ) : (
                    processedData.map((r, idx) => {
                      const isExpanded = expandedRows.has(r.id);
                      return (
                        <React.Fragment key={r.id}>
                          {/* ── Main GR row ─────────────────────────────── */}
                          <tr
                            style={{ cursor: "pointer" }}
                            onClick={() => toggleRow(r.id)}
                          >
                            <td style={{ ...tdCenterStyle, color: "var(--primary, #0d6efd)" }}>
                              {isExpanded
                                ? <ChevronDown size={14} />
                                : <ChevronRight size={14} />}
                            </td>
                            <td style={tdCenterStyle}>{idx + 1}</td>
                            <td style={{ ...tdStyle, fontWeight: "var(--font-weight-semibold)", color: "var(--primary, #0d6efd)" }}>
                              {r.grNo}
                            </td>
                            <td style={tdCenterStyle}>{r.invoiceNo}</td>
                            <td style={tdCenterStyle}>{r.invoiceDate}</td>
                            <td style={tdNumStyle}>₹ {f(r.total)}</td>
                            <td style={{ ...tdNumStyle, color: r.reducedRate > 0 ? "var(--danger, #dc3545)" : undefined }}>
                              {r.reducedRate > 0 ? `- ₹ ${f(r.reducedRate)}` : "—"}
                            </td>
                            <td style={{ ...tdNumStyle, color: r.addedRate > 0 ? "var(--success, #198754)" : undefined }}>
                              {r.addedRate > 0 ? `+ ₹ ${f(r.addedRate)}` : "—"}
                            </td>
                            <td style={{ ...tdNumStyle, fontWeight: "var(--font-weight-bold)" }}>
                              ₹ {f(r.netAmount)}
                            </td>
                            <td style={tdStyle}>{r.enteredBy}</td>
                          </tr>

                          {/* ── Expanded item details row ────────────────── */}
                          {isExpanded && (
                            <tr>
                              <td style={{ padding: 0, border: "none" }} />
                              <td colSpan={9} style={{ padding: "0 0 12px 24px", border: "1px solid var(--border-color, #dee2e6)", background: "var(--light, #f8f9fa)" }}>
                                <table
                                  className="table table-bordered mb-0 mt-2"
                                  style={{ borderCollapse: "collapse", width: "90%" }}
                                >
                                  <thead>
                                    <tr>
                                      <th style={{ ...subThStyle, width: "50px" }}>S.No</th>
                                      <th style={{ ...subThStyle, minWidth: "200px" }}>Name</th>
                                      <th style={subThStyle}>Batch</th>
                                      <th style={subThStyle}>Expiry Date</th>
                                      <th style={{ ...subThStyle, textAlign: "right" }}>Quantity</th>
                                      <th style={{ ...subThStyle, textAlign: "right" }}>Offer %</th>
                                      <th style={{ ...subThStyle, textAlign: "right" }}>Value</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {r.items.map((item) => (
                                      <tr key={item.sNo}>
                                        <td style={subTdCenterStyle}>{item.sNo}</td>
                                        <td style={subTdStyle}>{item.name}</td>
                                        <td style={subTdCenterStyle}>
                                          <Badge bg="secondary" style={{ fontSize: "var(--font-size-xs)" }}>
                                            {item.batch}
                                          </Badge>
                                        </td>
                                        <td style={subTdCenterStyle}>{item.expiryDate}</td>
                                        <td style={subTdNumStyle}>{item.quantity}</td>
                                        <td style={subTdNumStyle}>{item.offer > 0 ? `${item.offer}%` : "—"}</td>
                                        <td style={subTdNumStyle}>₹ {f(item.value)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>

                {/* ── Totals footer ──────────────────────────────────────── */}
                {processedData.length > 0 && (
                  <tfoot>
                    <tr>
                      <td colSpan={5} style={{ ...tfootStyle, textAlign: "center" }}>
                        <strong>Total</strong>
                      </td>
                      <td style={tfootStyle}>₹ {f(totals.total)}</td>
                      <td style={tfootStyle}>₹ {f(totals.reducedRate)}</td>
                      <td style={tfootStyle}>₹ {f(totals.addedRate)}</td>
                      <td style={tfootStyle}>₹ {f(totals.netAmount)}</td>
                      <td style={{ ...tfootStyle, textAlign: "center" }}>—</td>
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
                Total GR Records: <strong>{processedData.length}</strong>
                {searchTerm && (
                  <span className="ms-2">(Filtered from {allRecords.length})</span>
                )}
                {submitted && processedData.length > 0 && (
                  <span className="ms-3 text-muted">
                    Click a row to expand / collapse item details.
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

export default SupplierWiseGoods;

