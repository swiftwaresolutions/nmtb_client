import React, { useState, useMemo } from "react";
import { Container, Card, Form, Button, Row, Col } from "react-bootstrap";
import ReportHeader from "../../../../medical-records/components/ReportHeader";
import ReportKPICard from "../../../../medical-records/components/ReportKPICard";
import {
  exportToExcel,
  printReport,
  searchTableData,
} from "../../../../medical-records/utils/reportUtils";
import "../../../../medical-records/styles/reportStyles.css";

// ─── Types ────────────────────────────────────────────────────────────────────
interface OpeningStockRecord {
  id: number;
  productName: string;
  avgMrp: number;
  avgCost: number;
  stock: number;
  costValue: number;
  mrpValue: number;
}

// ─── Demo stores ──────────────────────────────────────────────────────────────
const STORES = [
  { id: 1, name: "Central Medical Store" },
  { id: 2, name: "General Ward Store" },
  { id: 3, name: "OT Store" },
  { id: 4, name: "ICU Store" },
  { id: 5, name: "Pharmacy Store" },
];

// ─── Demo data ────────────────────────────────────────────────────────────────
const DEMO_DATA: OpeningStockRecord[] = [
  { id:  1, productName: "ACELOPARA-TAB",           avgMrp:   7.42, avgCost:   1.00, stock: 10000, costValue:  10000.00, mrpValue:  74200.00 },
  { id:  2, productName: "AGUPEN(625).TAB",          avgMrp:  18.44, avgCost:  14.80, stock:   700, costValue:  10360.00, mrpValue:  12908.00 },
  { id:  3, productName: "ALBENDAZOLE 400MG",        avgMrp:   8.32, avgCost:   7.03, stock:    50, costValue:    351.50, mrpValue:    416.00 },
  { id:  4, productName: "ALKASOL 100ML",            avgMrp: 135.00, avgCost: 112.61, stock:   120, costValue:  13513.20, mrpValue:  16200.00 },
  { id:  5, productName: "ALLEGRA-SUP",              avgMrp: 226.00, avgCost: 200.96, stock:     1, costValue:    200.96, mrpValue:    226.00 },
  { id:  6, productName: "ALTACEF 30ML",             avgMrp: 160.00, avgCost: 135.52, stock:    30, costValue:   4065.60, mrpValue:   4800.00 },
  { id:  7, productName: "ANAWIN.(HEAVY).INJ",       avgMrp:  29.27, avgCost:  26.25, stock:   675, costValue:  17718.75, mrpValue:  19757.25 },
  { id:  8, productName: "ANTACID.TAB",              avgMrp:   1.75, avgCost:   1.33, stock:    30, costValue:     39.90, mrpValue:     52.50 },
  { id:  9, productName: "ANTI D 150-INJ",           avgMrp: 2800.00, avgCost: 2413.02, stock:  8, costValue:  19304.16, mrpValue:  22400.00 },
  { id: 10, productName: "ARGILINK-SACHET",          avgMrp:  51.48, avgCost:  40.04, stock:  1310, costValue:  52452.40, mrpValue:  67438.80 },
  { id: 11, productName: "ARISTOZYME",               avgMrp: 146.00, avgCost: 129.60, stock:    25, costValue:   3240.00, mrpValue:   3650.00 },
  { id: 12, productName: "ASCORIL LD",               avgMrp: 130.05, avgCost: 101.16, stock:    10, costValue:   1011.60, mrpValue:   1300.50 },
  { id: 13, productName: "ASCORIL LS [KIDS]",        avgMrp:  97.88, avgCost:  77.14, stock:    55, costValue:   4242.70, mrpValue:   5383.40 },
  { id: 14, productName: "ASCORIL-LS-DROP",          avgMrp:  72.57, avgCost:  57.19, stock:    70, costValue:   4003.30, mrpValue:   5079.90 },
  { id: 15, productName: "ASTHALIN SOLUTION(15ML)",  avgMrp:  15.00, avgCost:  13.03, stock:    20, costValue:    260.60, mrpValue:    300.00 },
  { id: 16, productName: "ASTYMIN FORTE.CAP",        avgMrp:  13.50, avgCost:  10.68, stock:  1500, costValue:  16020.00, mrpValue:  20250.00 },
  { id: 17, productName: "AUGPEN 300MG INJ",         avgMrp: 102.00, avgCost:  71.40, stock:   200, costValue:  14280.00, mrpValue:  20400.00 },
  { id: 18, productName: "AZITHRAL.TAB",             avgMrp:  22.66, avgCost:  19.13, stock:   500, costValue:   9565.00, mrpValue:  11330.00 },
  { id: 19, productName: "AZTOR 20MG TAB",           avgMrp:  12.07, avgCost:  10.18, stock:   105, costValue:   1068.90, mrpValue:   1267.35 },
  { id: 20, productName: "BETNOVATE-N",              avgMrp:  45.50, avgCost:  38.00, stock:   150, costValue:   5700.00, mrpValue:   6825.00 },
  { id: 21, productName: "CALPOL 500MG",             avgMrp:   6.20, avgCost:   4.50, stock:  2000, costValue:   9000.00, mrpValue:  12400.00 },
  { id: 22, productName: "CIPROBID 500MG",           avgMrp:  18.50, avgCost:  12.00, stock:   300, costValue:   3600.00, mrpValue:   5550.00 },
  { id: 23, productName: "DOLO 650",                 avgMrp:  11.00, avgCost:   7.80, stock:  1500, costValue:  11700.00, mrpValue:  16500.00 },
  { id: 24, productName: "EMSET 4MG INJ",            avgMrp:  26.00, avgCost:  18.40, stock:   200, costValue:   3680.00, mrpValue:   5200.00 },
  { id: 25, productName: "FLAGYL 400MG",             avgMrp:   5.80, avgCost:   3.20, stock:  1000, costValue:   3200.00, mrpValue:   5800.00 },
  { id: 26, productName: "GELUSIL MPS",              avgMrp:   3.50, avgCost:   1.90, stock:  2500, costValue:   4750.00, mrpValue:   8750.00 },
  { id: 27, productName: "HYDROCORTISONE 100MG INJ", avgMrp:  58.00, avgCost:  42.00, stock:   100, costValue:   4200.00, mrpValue:   5800.00 },
  { id: 28, productName: "INSULIN ACTRAPID",         avgMrp: 185.00, avgCost: 145.00, stock:    50, costValue:   7250.00, mrpValue:   9250.00 },
];

const fmt = (n: number) =>
  n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ─── Shared table styles ──────────────────────────────────────────────────────
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
  position: "sticky",
  top: 0,
  zIndex: 2,
};
const tdBase: React.CSSProperties = {
  fontSize: "var(--font-size-xs)",
  padding: "4px 8px",
  border: "1px solid var(--border-color, #dee2e6)",
  verticalAlign: "middle",
  background: "var(--light, #f8f9fa)",
};
const tdR: React.CSSProperties  = { ...tdBase, textAlign: "right" };
const tdC: React.CSSProperties  = { ...tdBase, textAlign: "center" };
const tfStyle: React.CSSProperties = {
  ...tdR,
  background: "var(--primary, #0d6efd)",
  color: "#fff",
  fontWeight: "var(--font-weight-bold)",
  border: "1px solid var(--primary, #0d6efd)",
};

// ─── Component ────────────────────────────────────────────────────────────────
const OpeningStock: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState("10/03/2026");
  const [selectedStore, setSelectedStore] = useState<number>(1);
  const [submitted, setSubmitted]         = useState(true);
  const [searchTerm, setSearchTerm]       = useState("");

  const filtered = useMemo(() => {
    if (!submitted) return [];
    if (!searchTerm) return DEMO_DATA;
    return searchTableData(DEMO_DATA, searchTerm, ["productName"]);
  }, [submitted, searchTerm]);

  const totals = useMemo(() => {
    let cv = 0, mv = 0, st = 0;
    filtered.forEach((r) => { cv += r.costValue; mv += r.mrpValue; st += r.stock; });
    return { cv, mv, st, profit: mv - cv };
  }, [filtered]);

  const storeName = STORES.find((s) => s.id === selectedStore)?.name ?? "";

  const handleExport = () => {
    exportToExcel(
      filtered.map((r, i) => ({
        "S.No":          i + 1,
        "Product Name":  r.productName,
        "Avg MRP":       r.avgMrp,
        "Avg Cost":      r.avgCost,
        "Stock":         r.stock,
        "Cost Value":    +r.costValue.toFixed(2),
        "MRP Value":     +r.mrpValue.toFixed(2),
      })),
      `Opening_Stock_${selectedDate.replace(/\//g, "-")}`
    );
  };

  return (
    <Container fluid className="px-4 py-3">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <ReportHeader
        title="Opening Stock"
        subtitle={submitted ? `As on ${selectedDate} — ${storeName}` : "Select date and store to view stock"}
        onPrint={printReport}
        onExport={handleExport}
        onSearch={(term) => setSearchTerm(term)}
        showSearch={submitted}
        showSort={false}
        showPrint={submitted}
        showExport={submitted}
      />

      {/* ── Filter Card ─────────────────────────────────────────────────────── */}
      <Card className="mb-4 shadow-sm no-print">
        <Card.Body>
          <Row className="align-items-end g-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label style={{ fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-semibold)" }}>
                  Select Date <span className="text-muted fw-normal">[ DD/MM/YYYY ]</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="DD/MM/YYYY"
                  value={selectedDate}
                  onChange={(e) => { setSelectedDate(e.target.value); setSubmitted(false); }}
                  style={{ fontSize: "var(--font-size-xs)" }}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label style={{ fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-semibold)" }}>
                  Select Store
                </Form.Label>
                <Form.Select
                  value={selectedStore}
                  onChange={(e) => { setSelectedStore(Number(e.target.value)); setSubmitted(false); }}
                  style={{ fontSize: "var(--font-size-xs)" }}
                >
                  {STORES.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md="auto">
              <Button
                variant="primary"
                size="sm"
                onClick={() => { setSubmitted(true); setSearchTerm(""); }}
              >
                Submit
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {submitted && (
        <>
          {/* ── KPI Cards ─────────────────────────────────────────────────── */}
          <Row className="mb-4">
            <Col md={3}>
              <ReportKPICard label="Total Products"   value={filtered.length}                         variant="primary" />
            </Col>
            <Col md={3}>
              <ReportKPICard label="Total Stock"      value={totals.st.toLocaleString("en-IN")}       variant="info"    />
            </Col>
            <Col md={3}>
              <ReportKPICard label="Total Cost Value" value={`₹ ${fmt(totals.cv)}`}                   variant="warning" />
            </Col>
            <Col md={3}>
              <ReportKPICard label="Total MRP Value"  value={`₹ ${fmt(totals.mv)}`}                   variant="success" />
            </Col>
          </Row>

          {/* ── Table Card ────────────────────────────────────────────────── */}
          <Card className="report-card" style={{ padding: "0.75rem" }}>
            <div
              style={{
                maxHeight: "calc(100vh - 480px)",
                minHeight: "300px",
                overflowY: "auto",
                overflowX: "auto",
                position: "relative",
              }}
            >
              <table
                className="table table-bordered mb-0"
                style={{ borderCollapse: "collapse", minWidth: "800px" }}
              >
                <thead>
                  <tr>
                    <th style={{ ...thStyle, width: "50px" }}>S.No</th>
                    <th style={{ ...thStyle, minWidth: "240px", textAlign: "left" }}>Product Name</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Avg MRP (₹)</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Avg Cost (₹)</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Stock</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Cost Value (₹)</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>MRP Value (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ ...tdC, padding: "2rem" }}>
                        {searchTerm ? "No records match your search." : "No records found."}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((r, i) => (
                      <tr key={r.id}>
                        <td style={tdC}>{i + 1}</td>
                        <td style={{ ...tdBase, fontWeight: "var(--font-weight-medium)" }}>
                          {r.productName}
                        </td>
                        <td style={tdR}>{fmt(r.avgMrp)}</td>
                        <td style={tdR}>{fmt(r.avgCost)}</td>
                        <td style={tdR}>{r.stock % 1 === 0 ? r.stock.toLocaleString("en-IN") : r.stock.toFixed(2)}</td>
                        <td style={tdR}>{fmt(r.costValue)}</td>
                        <td style={tdR}>{fmt(r.mrpValue)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
                {filtered.length > 0 && (
                  <tfoot>
                    <tr>
                      <td colSpan={4} style={{ ...tfStyle, textAlign: "center" }}>
                        <strong>Total Value</strong>
                      </td>
                      <td style={tfStyle}>{totals.st.toLocaleString("en-IN")}</td>
                      <td style={tfStyle}>{fmt(totals.cv)}</td>
                      <td style={tfStyle}>{fmt(totals.mv)}</td>
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
              }}
            >
              <small className="text-muted" style={{ fontWeight: "var(--font-weight-medium)" }}>
                Showing <strong>{filtered.length}</strong> product(s) — Opening Stock on{" "}
                <strong>{selectedDate}</strong> &nbsp;|&nbsp; Store:{" "}
                <strong>{storeName}</strong>
              </small>
            </div>
          </Card>
        </>
      )}
    </Container>
  );
};

export default OpeningStock;

