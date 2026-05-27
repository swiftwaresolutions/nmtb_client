import React, { useState, useMemo } from "react";
import { Container, Card, Nav, Row, Col, Form, Button } from "react-bootstrap";
import ReportHeader from "../../../../medical-records/components/ReportHeader";
import ReportKPICard from "../../../../medical-records/components/ReportKPICard";
import {
  exportToExcel,
  printReport,
  searchTableData,
} from "../../../../medical-records/utils/reportUtils";
import "../../../../medical-records/styles/reportStyles.css";

// ─── Shared types ─────────────────────────────────────────────────────────────
interface StockItem {
  id: number;
  medicineName: string;
  category: string;
  batchNo: string;
  expiryDate: string;
  stock: number;
  costPrice: number;
  mrpPrice: number;
}

// ─── Demo data ────────────────────────────────────────────────────────────────
const DEMO_STOCK: StockItem[] = [
  { id:  1, medicineName: "ACELOPARA-TAB",          category: "TABLET",    batchNo: "TGP-251570",  expiryDate: "31/05/2027", stock: 10000, costPrice:   1.00, mrpPrice:   7.42 },
  { id:  2, medicineName: "AGUPEN(625).TAB",         category: "TABLET",    batchNo: "825D075",     expiryDate: "31/08/2026", stock:   700, costPrice:  14.80, mrpPrice:  18.44 },
  { id:  3, medicineName: "ALBENDAZOLE 400MG",       category: "TABLET",    batchNo: "A231",        expiryDate: "31/03/2028", stock:    50, costPrice:   7.03, mrpPrice:   8.32 },
  { id:  4, medicineName: "ALKASOL 100ML",           category: "SYRUP",     batchNo: "239A1A",      expiryDate: "31/10/2028", stock:   120, costPrice: 112.61, mrpPrice: 135.00 },
  { id:  5, medicineName: "ALLEGRA-SUP",             category: "SYRUP",     batchNo: "NSA5005",     expiryDate: "30/06/2027", stock:     1, costPrice: 200.96, mrpPrice: 226.00 },
  { id:  6, medicineName: "ALTACEF 30ML",            category: "SYRUP",     batchNo: "C4875004",    expiryDate: "28/02/2027", stock:    30, costPrice: 135.52, mrpPrice: 160.00 },
  { id:  7, medicineName: "ANAWIN.(HEAVY).INJ",      category: "INJECTION", batchNo: "KP1713858",   expiryDate: "30/04/2027", stock:   400, costPrice:  26.25, mrpPrice:  30.21 },
  { id:  8, medicineName: "ANAWIN.(HEAVY).INJ",      category: "INJECTION", batchNo: "KP1713868",   expiryDate: "30/06/2027", stock:   275, costPrice:  26.25, mrpPrice:  28.32 },
  { id:  9, medicineName: "ANTACID.TAB",             category: "TABLET",    batchNo: "762010D7",    expiryDate: "31/03/2028", stock:    30, costPrice:   1.33, mrpPrice:   1.75 },
  { id: 10, medicineName: "ANTI D 150-INJ",          category: "INJECTION", batchNo: "B26825004",   expiryDate: "31/05/2027", stock:     8, costPrice: 2413.02, mrpPrice: 2800.00 },
  { id: 11, medicineName: "ARGILINK-SACHET",         category: "SACHET",    batchNo: "F1150",       expiryDate: "31/01/2027", stock:  1310, costPrice:  40.04, mrpPrice:  51.48 },
  { id: 12, medicineName: "ARISTOZYME",              category: "TABLET",    batchNo: "DPG250818",   expiryDate: "31/12/2026", stock:    25, costPrice: 129.60, mrpPrice: 146.00 },
  { id: 13, medicineName: "ASCORIL LD",              category: "SYRUP",     batchNo: "11251214",    expiryDate: "28/02/2027", stock:    10, costPrice: 101.16, mrpPrice: 130.05 },
  { id: 14, medicineName: "ASCORIL LS [KIDS]",       category: "SYRUP",     batchNo: "05251134A",   expiryDate: "31/01/2027", stock:    50, costPrice:  77.14, mrpPrice:  97.88 },
  { id: 15, medicineName: "ASCORIL-LS-DROP",         category: "DROPS",     batchNo: "622403265",   expiryDate: "30/04/2027", stock:    30, costPrice:  57.19, mrpPrice:  72.57 },
  { id: 16, medicineName: "ASTHALIN SOLUTION(15ML)", category: "SOLUTION",  batchNo: "4SA2658",     expiryDate: "30/11/2026", stock:    20, costPrice:  13.03, mrpPrice:  15.00 },
  { id: 17, medicineName: "ASTYMIN FORTE.CAP",       category: "CAPSULE",   batchNo: "25DDCJ02",    expiryDate: "31/03/2027", stock:  1500, costPrice:  10.68, mrpPrice:  13.50 },
  { id: 18, medicineName: "AUGPEN 300MG INJ",        category: "INJECTION", batchNo: "ZLB6AB5006",  expiryDate: "31/05/2027", stock:    24, costPrice:  71.40, mrpPrice: 102.00 },
  { id: 19, medicineName: "AUGPEN 300MG INJ",        category: "INJECTION", batchNo: "ZLB6AB5009",  expiryDate: "31/08/2027", stock:    54, costPrice:  71.40, mrpPrice: 102.00 },
  { id: 20, medicineName: "AZITHRAL.TAB",            category: "TABLET",    batchNo: "2508001018$", expiryDate: "31/07/2027", stock:   500, costPrice:  19.13, mrpPrice:  22.66 },
  { id: 21, medicineName: "AZTOR 20MG TAB",          category: "TABLET",    batchNo: "SIG1626A",    expiryDate: "31/01/2028", stock:   105, costPrice:  10.18, mrpPrice:  12.07 },
  { id: 22, medicineName: "BETNOVATE-N",             category: "CREAM",     batchNo: "B001",        expiryDate: "12/12/2028", stock:   150, costPrice:  38.00, mrpPrice:  45.50 },
  { id: 23, medicineName: "CALPOL 500MG",            category: "TABLET",    batchNo: "CP2026A",     expiryDate: "03/2028",    stock:  2000, costPrice:   4.50, mrpPrice:   6.20 },
  { id: 24, medicineName: "CIPROBID 500MG",          category: "TABLET",    batchNo: "CI2026A",     expiryDate: "01/2028",    stock:   300, costPrice:  12.00, mrpPrice:  18.50 },
  { id: 25, medicineName: "DOLO 650",                category: "TABLET",    batchNo: "DL2026A",     expiryDate: "05/2027",    stock:  1500, costPrice:   7.80, mrpPrice:  11.00 },
  { id: 26, medicineName: "EMSET 4MG INJ",           category: "INJECTION", batchNo: "EM2026A",     expiryDate: "07/2027",    stock:   200, costPrice:  18.40, mrpPrice:  26.00 },
  { id: 27, medicineName: "FLAGYL 400MG",            category: "TABLET",    batchNo: "FL2026A",     expiryDate: "04/2028",    stock:  1000, costPrice:   3.20, mrpPrice:   5.80 },
  { id: 28, medicineName: "GELUSIL MPS",             category: "TABLET",    batchNo: "GE2026A",     expiryDate: "10/2027",    stock:  2500, costPrice:   1.90, mrpPrice:   3.50 },
  { id: 29, medicineName: "HYDROCORTISONE 100MG INJ",category: "INJECTION", batchNo: "HY2026A",     expiryDate: "02/2028",    stock:   100, costPrice:  42.00, mrpPrice:  58.00 },
  { id: 30, medicineName: "INSULIN ACTRAPID",        category: "INJECTION", batchNo: "IN2026A",     expiryDate: "08/2027",    stock:    50, costPrice: 145.00, mrpPrice: 185.00 },
];

const DEFAULT_DATE = "10/03/2026";

const fmt = (n: number) =>
  n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ─── Shared styles ────────────────────────────────────────────────────────────
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
const tdR: React.CSSProperties = { ...tdBase, textAlign: "right" };
const tdC: React.CSSProperties = { ...tdBase, textAlign: "center" };
const tfStyle: React.CSSProperties = {
  ...tdR,
  background: "var(--primary, #0d6efd)",
  color: "#fff",
  fontWeight: "var(--font-weight-bold)",
  border: "1px solid var(--primary, #0d6efd)",
};

// ─────────────────────────────────────────────────────────────────────────────
// Tab 1 — Ondate Stock (medicine-level summary, batches merged)
// ─────────────────────────────────────────────────────────────────────────────
const OndateStock: React.FC = () => {
  const [onDate, setOnDate]       = useState(DEFAULT_DATE);
  const [searchTerm, setSearchTerm] = useState("");

  // Roll batches into medicine-level summary
  const summaryMap = useMemo(() => {
    const map = new Map<string, { medicineName: string; category: string; batches: number; totalStock: number; costValue: number; mrpValue: number }>();
    DEMO_STOCK.forEach((r) => {
      const key = r.medicineName;
      const existing = map.get(key);
      if (existing) {
        existing.batches++;
        existing.totalStock += r.stock;
        existing.costValue  += r.stock * r.costPrice;
        existing.mrpValue   += r.stock * r.mrpPrice;
      } else {
        map.set(key, {
          medicineName: r.medicineName,
          category:     r.category,
          batches:      1,
          totalStock:   r.stock,
          costValue:    r.stock * r.costPrice,
          mrpValue:     r.stock * r.mrpPrice,
        });
      }
    });
    return Array.from(map.values());
  }, []);

  const filtered = useMemo(() => {
    let data = summaryMap;
    if (searchTerm)
      data = searchTableData(data, searchTerm, ["medicineName", "category"]);
    return data;
  }, [summaryMap, searchTerm]);

  const totals = useMemo(() => {
    let cv = 0, mv = 0, st = 0;
    filtered.forEach((r) => { cv += r.costValue; mv += r.mrpValue; st += r.totalStock; });
    return { cv, mv, profit: mv - cv, st };
  }, [filtered]);

  const handleExport = () => {
    exportToExcel(
      filtered.map((r, i) => ({
        "Sl No": i + 1,
        "Medicine Name": r.medicineName,
        "Category": r.category,
        "Batches": r.batches,
        "Total Stock": r.totalStock,
        "Cost Value": +r.costValue.toFixed(2),
        "MRP Value":  +r.mrpValue.toFixed(2),
        "Profit":     +(r.mrpValue - r.costValue).toFixed(2),
      })),
      `Ondate_Stock_${onDate.replace(/\//g, "-")}`
    );
  };

  return (
    <>
      {/* Filter */}
      <Card className="mb-3 shadow-sm no-print">
        <Card.Body className="py-2">
          <Row className="align-items-end g-2">
            <Col md={3}>
              <Form.Group>
                <Form.Label style={{ fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-semibold)" }}>
                  On Date
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="DD/MM/YYYY"
                  value={onDate}
                  onChange={(e) => setOnDate(e.target.value)}
                  style={{ fontSize: "var(--font-size-xs)" }}
                />
              </Form.Group>
            </Col>
            <Col md="auto">
              <Button variant="primary" size="sm" onClick={() => {}}>
                Show
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* KPIs */}
      <Row className="mb-3">
        <Col md={3}><ReportKPICard label="Total Medicines"  value={filtered.length}                          variant="primary" /></Col>
        <Col md={3}><ReportKPICard label="Total Stock Units" value={totals.st.toLocaleString("en-IN")}       variant="info"    /></Col>
        <Col md={3}><ReportKPICard label="Total Cost Value"  value={`₹ ${fmt(totals.cv)}`}                   variant="warning" /></Col>
        <Col md={3}><ReportKPICard label="Total MRP Value"   value={`₹ ${fmt(totals.mv)}`}                   variant="success" /></Col>
      </Row>

      {/* Table */}
      <Card className="report-card" style={{ padding: "0.75rem" }}>
        <div style={{ maxHeight: "calc(100vh - 500px)", minHeight: "300px", overflowY: "auto", overflowX: "auto", position: "relative" }}>
          <table className="table table-bordered mb-0" style={{ borderCollapse: "collapse", minWidth: "900px" }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: "50px" }}>Sl No</th>
                <th style={{ ...thStyle, minWidth: "220px" }}>Medicine Name</th>
                <th style={thStyle}>Category</th>
                <th style={thStyle}>No. of Batches</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Total Stock</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Cost Value (₹)</th>
                <th style={{ ...thStyle, textAlign: "right" }}>MRP Value (₹)</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Profit (₹)</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ ...tdC, padding: "2rem" }}>No records found.</td></tr>
              ) : (
                filtered.map((r, i) => {
                  const profit = r.mrpValue - r.costValue;
                  return (
                    <tr key={r.medicineName}>
                      <td style={tdC}>{i + 1}</td>
                      <td style={tdBase}><strong>{r.medicineName}</strong></td>
                      <td style={tdC}>{r.category}</td>
                      <td style={tdC}>{r.batches}</td>
                      <td style={tdR}>{r.totalStock.toLocaleString("en-IN")}</td>
                      <td style={tdR}>{fmt(r.costValue)}</td>
                      <td style={tdR}>{fmt(r.mrpValue)}</td>
                      <td style={{ ...tdR, color: profit >= 0 ? "var(--success, #198754)" : "var(--danger, #dc3545)" }}>
                        {fmt(profit)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan={5} style={{ ...tfStyle, textAlign: "center" }}>
                    <strong>TOTAL</strong>
                  </td>
                  <td style={tfStyle}>{fmt(totals.cv)}</td>
                  <td style={tfStyle}>{fmt(totals.mv)}</td>
                  <td style={tfStyle}>{fmt(totals.profit)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
        <div style={{ padding: "0.5rem 1rem", borderTop: "2px solid var(--border-color, #e0e0e0)" }}>
          <small className="text-muted" style={{ fontWeight: "var(--font-weight-medium)" }}>
            Showing <strong>{filtered.length}</strong> medicine(s) as on <strong>{onDate}</strong>
          </small>
        </div>
      </Card>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Tab 2 — Ondate Stock Details (batch-level, grouped by medicine)
// ─────────────────────────────────────────────────────────────────────────────
const OndateStockDetails: React.FC = () => {
  const [onDate, setOnDate]         = useState(DEFAULT_DATE);
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = useMemo(() => {
    if (!searchTerm) return DEMO_STOCK;
    return searchTableData(DEMO_STOCK, searchTerm, ["medicineName", "category", "batchNo"]);
  }, [searchTerm]);

  const totals = useMemo(() => {
    let cv = 0, mv = 0;
    filtered.forEach((r) => { cv += r.stock * r.costPrice; mv += r.stock * r.mrpPrice; });
    return { cv, mv, totalStock: filtered.reduce((s, r) => s + r.stock, 0) };
  }, [filtered]);

  const handleExport = () => {
    let slNo = 0; let prevMed = "";
    exportToExcel(
      filtered.map((r) => {
        const isNew = r.medicineName !== prevMed;
        if (isNew) slNo++;
        const row = {
          "Sl No":         isNew ? slNo : "",
          "Medicine Name": isNew ? r.medicineName : "",
          "Category":      r.category,
          "Batch No":      r.batchNo,
          "Expiry Date":   r.expiryDate,
          "Stock":         r.stock,
          "Cost Price":    r.costPrice,
          "MRP Price":     r.mrpPrice,
          "Cost Value":    +(r.stock * r.costPrice).toFixed(2),
          "MRP Value":     +(r.stock * r.mrpPrice).toFixed(2),
        };
        prevMed = r.medicineName;
        return row;
      }),
      `Ondate_Stock_Details_${onDate.replace(/\//g, "-")}`
    );
  };

  let slNo = 0; let prevMed = "";

  return (
    <>
      {/* Filter */}
      <Card className="mb-3 shadow-sm no-print">
        <Card.Body className="py-2">
          <Row className="align-items-end g-2">
            <Col md={3}>
              <Form.Group>
                <Form.Label style={{ fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-semibold)" }}>
                  On Date
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="DD/MM/YYYY"
                  value={onDate}
                  onChange={(e) => setOnDate(e.target.value)}
                  style={{ fontSize: "var(--font-size-xs)" }}
                />
              </Form.Group>
            </Col>
            <Col md="auto">
              <Button variant="primary" size="sm" onClick={() => {}}>
                Show
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* KPIs */}
      <Row className="mb-3">
        <Col md={3}><ReportKPICard label="Total Batches"    value={filtered.length}                    variant="primary" /></Col>
        <Col md={3}><ReportKPICard label="Total Stock"      value={totals.totalStock.toLocaleString("en-IN")} variant="info" /></Col>
        <Col md={3}><ReportKPICard label="Total Cost Value" value={`₹ ${fmt(totals.cv)}`}              variant="warning" /></Col>
        <Col md={3}><ReportKPICard label="Total MRP Value"  value={`₹ ${fmt(totals.mv)}`}              variant="success" /></Col>
      </Row>

      {/* Table */}
      <Card className="report-card" style={{ padding: "0.75rem" }}>
        <div style={{ maxHeight: "calc(100vh - 500px)", minHeight: "300px", overflowY: "auto", overflowX: "auto", position: "relative" }}>
          <table className="table table-bordered mb-0" style={{ borderCollapse: "collapse", minWidth: "1050px" }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: "50px" }}>Sl No</th>
                <th style={{ ...thStyle, minWidth: "220px" }}>Medicine Name</th>
                <th style={thStyle}>Category</th>
                <th style={thStyle}>Batch No</th>
                <th style={thStyle}>Expiry Date</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Stock</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Cost Price</th>
                <th style={{ ...thStyle, textAlign: "right" }}>MRP Price</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Cost Value (₹)</th>
                <th style={{ ...thStyle, textAlign: "right" }}>MRP Value (₹)</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={10} style={{ ...tdC, padding: "2rem" }}>No records found.</td></tr>
              ) : (
                filtered.map((r) => {
                  const isNew = r.medicineName !== prevMed;
                  if (isNew) slNo++;
                  prevMed = r.medicineName;
                  const cv = r.stock * r.costPrice;
                  const mv = r.stock * r.mrpPrice;
                  return (
                    <tr key={r.id}>
                      <td style={tdC}>{isNew ? <strong>{slNo}</strong> : ""}</td>
                      <td style={tdBase}>{isNew ? <strong>{r.medicineName}</strong> : ""}</td>
                      <td style={tdC}>{r.category}</td>
                      <td style={tdBase}>{r.batchNo}</td>
                      <td style={tdC}>{r.expiryDate}</td>
                      <td style={tdR}>{r.stock.toLocaleString("en-IN")}</td>
                      <td style={tdR}>{fmt(r.costPrice)}</td>
                      <td style={tdR}>{fmt(r.mrpPrice)}</td>
                      <td style={tdR}>{fmt(cv)}</td>
                      <td style={tdR}>{fmt(mv)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan={8} style={{ ...tfStyle, textAlign: "center" }}><strong>TOTAL</strong></td>
                  <td style={tfStyle}>{fmt(totals.cv)}</td>
                  <td style={tfStyle}>{fmt(totals.mv)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
        <div style={{ padding: "0.5rem 1rem", borderTop: "2px solid var(--border-color, #e0e0e0)" }}>
          <small className="text-muted" style={{ fontWeight: "var(--font-weight-medium)" }}>
            Showing <strong>{filtered.length}</strong> batch record(s) as on <strong>{onDate}</strong>
          </small>
        </div>
      </Card>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Tab 3 — Medicine Profit Details
// ─────────────────────────────────────────────────────────────────────────────
const MedicineProfitDetails: React.FC = () => {
  const [onDate, setOnDate]         = useState(DEFAULT_DATE);
  const [searchTerm, setSearchTerm] = useState("");

  const profitData = useMemo(() => {
    const map = new Map<string, { medicineName: string; category: string; totalStock: number; costValue: number; mrpValue: number }>();
    DEMO_STOCK.forEach((r) => {
      const key = r.medicineName;
      const ex = map.get(key);
      if (ex) {
        ex.totalStock += r.stock;
        ex.costValue  += r.stock * r.costPrice;
        ex.mrpValue   += r.stock * r.mrpPrice;
      } else {
        map.set(key, { medicineName: r.medicineName, category: r.category, totalStock: r.stock, costValue: r.stock * r.costPrice, mrpValue: r.stock * r.mrpPrice });
      }
    });
    return Array.from(map.values()).map((r) => ({
      ...r,
      profit: r.mrpValue - r.costValue,
      profitPct: r.costValue > 0 ? ((r.mrpValue - r.costValue) / r.costValue) * 100 : 0,
    }));
  }, []);

  const filtered = useMemo(() => {
    if (!searchTerm) return profitData;
    return searchTableData(profitData, searchTerm, ["medicineName", "category"]);
  }, [profitData, searchTerm]);

  const totals = useMemo(() => {
    let cv = 0, mv = 0;
    filtered.forEach((r) => { cv += r.costValue; mv += r.mrpValue; });
    return { cv, mv, profit: mv - cv, pct: cv > 0 ? ((mv - cv) / cv) * 100 : 0 };
  }, [filtered]);

  const handleExport = () => {
    exportToExcel(
      filtered.map((r, i) => ({
        "Sl No":        i + 1,
        "Medicine Name": r.medicineName,
        "Category":     r.category,
        "Total Stock":  r.totalStock,
        "Cost Value":   +r.costValue.toFixed(2),
        "MRP Value":    +r.mrpValue.toFixed(2),
        "Profit (₹)":   +r.profit.toFixed(2),
        "Profit %":     +r.profitPct.toFixed(2),
      })),
      `Medicine_Profit_Details_${onDate.replace(/\//g, "-")}`
    );
  };

  return (
    <>
      {/* Filter */}
      <Card className="mb-3 shadow-sm no-print">
        <Card.Body className="py-2">
          <Row className="align-items-end g-2">
            <Col md={3}>
              <Form.Group>
                <Form.Label style={{ fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-semibold)" }}>
                  On Date
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="DD/MM/YYYY"
                  value={onDate}
                  onChange={(e) => setOnDate(e.target.value)}
                  style={{ fontSize: "var(--font-size-xs)" }}
                />
              </Form.Group>
            </Col>
            <Col md="auto">
              <Button variant="primary" size="sm" onClick={() => {}}>
                Show
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* KPIs */}
      <Row className="mb-3">
        <Col md={3}><ReportKPICard label="Total Medicines"  value={filtered.length}          variant="primary" /></Col>
        <Col md={3}><ReportKPICard label="Total Cost Value" value={`₹ ${fmt(totals.cv)}`}    variant="warning" /></Col>
        <Col md={3}><ReportKPICard label="Total MRP Value"  value={`₹ ${fmt(totals.mv)}`}    variant="info"    /></Col>
        <Col md={3}><ReportKPICard label="Net Profit"       value={`₹ ${fmt(totals.profit)}`} variant="success" /></Col>
      </Row>

      {/* Table */}
      <Card className="report-card" style={{ padding: "0.75rem" }}>
        <div style={{ maxHeight: "calc(100vh - 500px)", minHeight: "300px", overflowY: "auto", overflowX: "auto", position: "relative" }}>
          <table className="table table-bordered mb-0" style={{ borderCollapse: "collapse", minWidth: "950px" }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: "50px" }}>Sl No</th>
                <th style={{ ...thStyle, minWidth: "220px" }}>Medicine Name</th>
                <th style={thStyle}>Category</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Total Stock</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Cost Value (₹)</th>
                <th style={{ ...thStyle, textAlign: "right" }}>MRP Value (₹)</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Profit (₹)</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Profit %</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ ...tdC, padding: "2rem" }}>No records found.</td></tr>
              ) : (
                filtered.map((r, i) => (
                  <tr key={r.medicineName}>
                    <td style={tdC}>{i + 1}</td>
                    <td style={tdBase}><strong>{r.medicineName}</strong></td>
                    <td style={tdC}>{r.category}</td>
                    <td style={tdR}>{r.totalStock.toLocaleString("en-IN")}</td>
                    <td style={tdR}>{fmt(r.costValue)}</td>
                    <td style={tdR}>{fmt(r.mrpValue)}</td>
                    <td style={{ ...tdR, color: r.profit >= 0 ? "var(--success, #198754)" : "var(--danger, #dc3545)" }}>
                      {fmt(r.profit)}
                    </td>
                    <td style={{ ...tdR, color: r.profitPct >= 0 ? "var(--success, #198754)" : "var(--danger, #dc3545)" }}>
                      {r.profitPct.toFixed(2)}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan={4} style={{ ...tfStyle, textAlign: "center" }}><strong>TOTAL</strong></td>
                  <td style={tfStyle}>{fmt(totals.cv)}</td>
                  <td style={tfStyle}>{fmt(totals.mv)}</td>
                  <td style={tfStyle}>{fmt(totals.profit)}</td>
                  <td style={tfStyle}>{totals.pct.toFixed(2)}%</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
        <div style={{ padding: "0.5rem 1rem", borderTop: "2px solid var(--border-color, #e0e0e0)" }}>
          <small className="text-muted" style={{ fontWeight: "var(--font-weight-medium)" }}>
            Showing <strong>{filtered.length}</strong> medicine(s) as on <strong>{onDate}</strong>
          </small>
        </div>
      </Card>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
type TabKey = "ondate-stock" | "ondate-stock-details" | "medicine-profit";

const TABS: { key: TabKey; label: string }[] = [
  { key: "ondate-stock",         label: "Ondate Stock" },
  { key: "ondate-stock-details", label: "Ondate Stock Details" },
  { key: "medicine-profit",      label: "Medicine Profit Details" },
];

const TAB_SUBTITLES: Record<TabKey, string> = {
  "ondate-stock":         "Medicine-level stock summary for a given date",
  "ondate-stock-details": "Batch-wise stock breakdown for a given date",
  "medicine-profit":      "Medicine-wise profit analysis",
};

const StockDetails: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("ondate-stock");

  const handleExport = () => {
    // Delegated to each tab's own handler — triggered via tab-level buttons
  };

  return (
    <Container fluid className="px-4 py-3">
      {/* ── Report Header ─────────────────────────────────────────────────── */}
      <ReportHeader
        title="Stock Details"
        subtitle={TAB_SUBTITLES[activeTab]}
        onPrint={printReport}
        onExport={handleExport}
        onSearch={() => {}}
        showSearch={false}
        showSort={false}
        showPrint={true}
        showExport={false}
      />

      {/* ── Tab Navigation ────────────────────────────────────────────────── */}
      <Card className="mb-0 shadow-sm">
        <Card.Header style={{ background: "var(--light, #f8f9fa)", padding: "0 1rem" }}>
          <Nav
            variant="tabs"
            activeKey={activeTab}
            onSelect={(k) => k && setActiveTab(k as TabKey)}
            style={{ borderBottom: "none", marginBottom: "-1px" }}
          >
            {TABS.map((tab) => (
              <Nav.Item key={tab.key}>
                <Nav.Link
                  eventKey={tab.key}
                  style={{
                    fontSize: "var(--font-size-sm)",
                    fontWeight: activeTab === tab.key ? "var(--font-weight-semibold)" : "var(--font-weight-normal)",
                    color: activeTab === tab.key ? "var(--primary, #0d6efd)" : "var(--secondary, #6c757d)",
                    borderBottom: activeTab === tab.key ? "2px solid var(--primary, #0d6efd)" : "2px solid transparent",
                    paddingBottom: "10px",
                  }}
                >
                  {tab.label}
                </Nav.Link>
              </Nav.Item>
            ))}
          </Nav>
        </Card.Header>

        <Card.Body className="pt-3">
          {activeTab === "ondate-stock"         && <OndateStock />}
          {activeTab === "ondate-stock-details" && <OndateStockDetails />}
          {activeTab === "medicine-profit"      && <MedicineProfitDetails />}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default StockDetails;

