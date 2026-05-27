import React, { useMemo, useState } from "react";
import { Container, Card, Row, Col, Form, Button } from "react-bootstrap";
import ReportHeader from "../../../../medical-records/components/ReportHeader";
import ReportKPICard from "../../../../medical-records/components/ReportKPICard";
import {
  exportToExcel,
  printReport,
  searchTableData,
} from "../../../../medical-records/utils/reportUtils";
import "../../../../medical-records/styles/reportStyles.css";

// ─── Interface ────────────────────────────────────────────────────────────────
interface ReorderItem {
  id: number;
  medicineName: string;
  stock: number;
  min: number;
}

// ─── Demo data ────────────────────────────────────────────────────────────────
const DEMO_DATA: ReorderItem[] = [
  { id:  1, medicineName: "ACELOPARA-TAB",           stock:   80,  min: 200 },
  { id:  2, medicineName: "AGUPEN(625).TAB",          stock:  700,  min: 100 },
  { id:  3, medicineName: "ALBENDAZOLE 400MG",        stock:   50,  min: 150 },
  { id:  4, medicineName: "ALKASOL 100ML",            stock:  120,  min:  50 },
  { id:  5, medicineName: "ALLEGRA-SUP",              stock:    1,  min:  20 },
  { id:  6, medicineName: "ALTACEF 30ML",             stock:   30,  min:  60 },
  { id:  7, medicineName: "ANAWIN.(HEAVY).INJ",       stock:  675,  min: 100 },
  { id:  8, medicineName: "ANTACID.TAB",              stock:   30,  min: 200 },
  { id:  9, medicineName: "ANTI D 150-INJ",           stock:    8,  min:  25 },
  { id: 10, medicineName: "ARGILINK-SACHET",          stock: 1310,  min: 200 },
  { id: 11, medicineName: "ARISTOZYME",               stock:   25,  min: 100 },
  { id: 12, medicineName: "ASCORIL LD",               stock:   10,  min:  50 },
  { id: 13, medicineName: "ASCORIL LS [KIDS]",        stock:   50,  min:  50 },
  { id: 14, medicineName: "ASCORIL-LS-DROP",          stock:   30,  min:  75 },
  { id: 15, medicineName: "ASTHALIN SOLUTION(15ML)",  stock:   20,  min:  40 },
  { id: 16, medicineName: "ASTYMIN FORTE.CAP",        stock: 1500,  min: 300 },
  { id: 17, medicineName: "AUGPEN 300MG INJ",         stock:   78,  min: 100 },
  { id: 18, medicineName: "AZITHRAL.TAB",             stock:  500,  min: 200 },
  { id: 19, medicineName: "AZTOR 20MG TAB",           stock:  105,  min: 150 },
  { id: 20, medicineName: "BETNOVATE-N",              stock:  150,  min:  80 },
  { id: 21, medicineName: "CALPOL 500MG",             stock: 2000,  min: 500 },
  { id: 22, medicineName: "CIPROBID 500MG",           stock:   45,  min: 200 },
  { id: 23, medicineName: "DOLO 650",                 stock: 1500,  min: 400 },
  { id: 24, medicineName: "EMSET 4MG INJ",            stock:   15,  min:  80 },
  { id: 25, medicineName: "FLAGYL 400MG",             stock: 1000,  min: 300 },
  { id: 26, medicineName: "GELUSIL MPS",              stock: 2500,  min: 600 },
  { id: 27, medicineName: "HYDROCORTISONE 100MG INJ", stock:   12,  min:  50 },
  { id: 28, medicineName: "INSULIN ACTRAPID",         stock:   50,  min: 100 },
  { id: 29, medicineName: "METFORMIN 500MG",          stock:  180,  min: 400 },
  { id: 30, medicineName: "ONDANSETRON 4MG TAB",      stock:  320,  min: 200 },
];

// ─── Styles ───────────────────────────────────────────────────────────────────
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
const tdC: React.CSSProperties = { ...tdBase, textAlign: "center" };
const tdR: React.CSSProperties = { ...tdBase, textAlign: "right" };

// ─── Component ────────────────────────────────────────────────────────────────
const PurchaseReorder: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showBelowOnly, setShowBelowOnly] = useState(false);

  const filtered = useMemo(() => {
    let data = DEMO_DATA;
    if (showBelowOnly) data = data.filter((r) => r.stock < r.min);
    if (searchTerm) data = searchTableData(data, searchTerm, ["medicineName"]);
    return data;
  }, [searchTerm, showBelowOnly]);

  const belowMin = useMemo(() => DEMO_DATA.filter((r) => r.stock < r.min).length, []);
  const critical  = useMemo(() => DEMO_DATA.filter((r) => r.stock === 0).length, []);

  const handleExport = () => {
    exportToExcel(
      filtered.map((r, i) => ({
        "S.No":          i + 1,
        "Medicine Name": r.medicineName,
        "Stock":         r.stock,
        "Min Level":     r.min,
        "Status":        r.stock < r.min ? "Reorder Required" : "Adequate",
      })),
      "Purchase_Reorder_Level"
    );
  };

  return (
    <Container fluid className="px-4 py-3">
      {/* Header */}
      <ReportHeader
        title="Purchase Reorder Level"
        subtitle="Items whose stock has reached or fallen below the minimum reorder level"
        onPrint={printReport}
        onExport={handleExport}
        onSearch={(term) => setSearchTerm(term)}
        showSearch
        showSort={false}
        showPrint
        showExport
      />

      {/* KPIs */}
      <Row className="mb-3">
        <Col md={3}><ReportKPICard label="Total Items"       value={DEMO_DATA.length}            variant="primary" /></Col>
        <Col md={3}><ReportKPICard label="Below Min Level"   value={belowMin}                    variant="danger"  /></Col>
        <Col md={3}><ReportKPICard label="Adequate Stock"    value={DEMO_DATA.length - belowMin} variant="success" /></Col>
        <Col md={3}><ReportKPICard label="Out of Stock"      value={critical}                    variant="warning" /></Col>
      </Row>

      {/* Filter bar */}
      <Card className="mb-3 shadow-sm no-print">
        <Card.Body className="py-2">
          <Row className="align-items-center g-2">
            <Col md="auto">
              <Form.Check
                type="checkbox"
                id="below-min-only"
                label="Show below min level only"
                checked={showBelowOnly}
                onChange={(e) => setShowBelowOnly(e.target.checked)}
                style={{ fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-medium)" }}
              />
            </Col>
            <Col md={3}>
              <Form.Control
                type="text"
                size="sm"
                placeholder="Search medicine name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ fontSize: "var(--font-size-xs)" }}
              />
            </Col>
            <Col md="auto">
              <Button variant="outline-secondary" size="sm" onClick={() => { setSearchTerm(""); setShowBelowOnly(false); }}>
                Clear
              </Button>
            </Col>
            <Col className="text-end">
              <small style={{ fontSize: "var(--font-size-xs)", color: "var(--secondary, #6c757d)" }}>
                Showing <strong>{filtered.length}</strong> of <strong>{DEMO_DATA.length}</strong> items
              </small>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Table */}
      <Card className="report-card" style={{ padding: "0.75rem" }}>
        <div style={{ maxHeight: "calc(100vh - 460px)", minHeight: "300px", overflowY: "auto", overflowX: "auto", position: "relative" }}>
          <table className="table table-bordered mb-0" style={{ borderCollapse: "collapse", minWidth: "600px" }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: "55px" }}>S.No</th>
                <th style={{ ...thStyle, minWidth: "280px", textAlign: "left" }}>Medicine Name</th>
                <th style={{ ...thStyle, width: "120px" }}>Stock</th>
                <th style={{ ...thStyle, width: "120px" }}>Min Level</th>
                <th style={{ ...thStyle, width: "150px" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ ...tdC, padding: "2rem", color: "var(--secondary, #6c757d)" }}>
                    No records found.
                  </td>
                </tr>
              ) : (
                filtered.map((r, i) => {
                  const isBelow  = r.stock < r.min;
                  const deficit  = r.min - r.stock;
                  const rowBg    = isBelow ? "rgba(220,53,69,0.06)" : "var(--light, #f8f9fa)";
                  const tdRow: React.CSSProperties = { ...tdBase, background: rowBg };
                  const tdRowC: React.CSSProperties = { ...tdC, background: rowBg };
                  const tdRowR: React.CSSProperties = { ...tdR, background: rowBg };
                  return (
                    <tr key={r.id}>
                      <td style={tdRowC}>{i + 1}</td>
                      <td style={tdRow}>{r.medicineName}</td>
                      <td style={{
                        ...tdRowR,
                        color: isBelow ? "var(--danger, #dc3545)" : "var(--success, #198754)",
                        fontWeight: isBelow ? "var(--font-weight-bold)" : "var(--font-weight-normal)",
                      }}>
                        {r.stock.toLocaleString("en-IN")}
                      </td>
                      <td style={tdRowR}>{r.min.toLocaleString("en-IN")}</td>
                      <td style={{ ...tdRowC }}>
                        {isBelow ? (
                          <span style={{
                            background: "var(--danger, #dc3545)",
                            color: "#fff",
                            borderRadius: "4px",
                            padding: "2px 8px",
                            fontSize: "var(--font-size-xs)",
                            fontWeight: "var(--font-weight-semibold)",
                            whiteSpace: "nowrap",
                          }}>
                            Reorder ({deficit} needed)
                          </span>
                        ) : (
                          <span style={{
                            background: "var(--success, #198754)",
                            color: "#fff",
                            borderRadius: "4px",
                            padding: "2px 8px",
                            fontSize: "var(--font-size-xs)",
                            fontWeight: "var(--font-weight-semibold)",
                          }}>
                            Adequate
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div style={{ padding: "0.5rem 1rem", borderTop: "2px solid var(--border-color, #e0e0e0)" }}>
          <small className="text-muted" style={{ fontWeight: "var(--font-weight-medium)" }}>
            <span style={{ color: "var(--danger, #dc3545)", fontWeight: "var(--font-weight-semibold)" }}>
              {belowMin} item(s)
            </span>{" "}
            require reorder &nbsp;|&nbsp; Total items: <strong>{DEMO_DATA.length}</strong>
          </small>
        </div>
      </Card>
    </Container>
  );
};

export default PurchaseReorder;

