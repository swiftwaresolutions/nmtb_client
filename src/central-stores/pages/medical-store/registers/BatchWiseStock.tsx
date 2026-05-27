import React, { useState, useMemo } from 'react';
import { Container, Card, Form, Button, Row, Col } from 'react-bootstrap';
import ReportHeader from "../../../../medical-records/components/ReportHeader";
import ReportKPICard from "../../../../medical-records/components/ReportKPICard";
import {
  exportToExcel,
  printReport,
  searchTableData,
} from "../../../../medical-records/utils/reportUtils";
import "../../../../medical-records/styles/reportStyles.css";

// ─── Interface ────────────────────────────────────────────────────────────────
interface BatchStock {
  id: number;
  medicineName: string;
  category: string;
  batchNo: string;
  expiryDate: string;
  costPrice: number;
  mrpPrice: number;
  stock: number;
}

// ─── Demo Data ────────────────────────────────────────────────────────────────
const ALL_STOCK_DATA: BatchStock[] = [
  { id:  1, medicineName: 'ACELOPARA-TAB',             category: 'TABLET',    batchNo: 'TGP-251570',    expiryDate: '31/05/2027', costPrice:   1.00, mrpPrice:   7.42, stock: 10000 },
  { id:  2, medicineName: 'AGUPEN(625).TAB',            category: 'TABLET',    batchNo: '825D075',       expiryDate: '31/08/2026', costPrice:  14.80, mrpPrice:  18.44, stock:   700 },
  { id:  3, medicineName: 'ALBENDAZOLE 400MG',          category: 'TABLET',    batchNo: 'A231',          expiryDate: '31/03/2028', costPrice:   7.03, mrpPrice:   8.32, stock:    50 },
  { id:  4, medicineName: 'ALKASOL 100ML',              category: 'SYRUP',     batchNo: '239A1A',        expiryDate: '31/10/2028', costPrice: 112.61, mrpPrice: 135.00, stock:   120 },
  { id:  5, medicineName: 'ALLEGRA-sup',                category: 'SYRUP',     batchNo: 'NSA5005',       expiryDate: '30/06/2027', costPrice: 200.96, mrpPrice: 226.00, stock:     1 },
  { id:  6, medicineName: 'ALTACEF 30ML',               category: 'SYRUP',     batchNo: 'C4875004',      expiryDate: '28/02/2027', costPrice: 135.52, mrpPrice: 160.00, stock:    30 },
  { id:  7, medicineName: 'ANAWIN.(HEAVY).INJ',         category: 'INJECTION', batchNo: 'KP1713858',     expiryDate: '30/04/2027', costPrice:  26.25, mrpPrice:  30.21, stock:   400 },
  { id:  8, medicineName: 'ANAWIN.(HEAVY).INJ',         category: 'INJECTION', batchNo: 'KP1713868',     expiryDate: '30/06/2027', costPrice:  26.25, mrpPrice:  28.32, stock:   275 },
  { id:  9, medicineName: 'ANTACID.TAB',                category: 'TABLET',    batchNo: '762010D7',      expiryDate: '31/03/2028', costPrice:   1.33, mrpPrice:   1.75, stock:    30 },
  { id: 10, medicineName: 'ANTI D 150-INJ',             category: 'INJECTION', batchNo: 'B26825004',     expiryDate: '31/05/2027', costPrice: 2413.02, mrpPrice: 2800.00, stock:   8 },
  { id: 11, medicineName: 'ARGILINK-SACHET',            category: 'SACHET',    batchNo: 'F1150',         expiryDate: '31/01/2027', costPrice:  40.04, mrpPrice:  51.48, stock:  1310 },
  { id: 12, medicineName: 'ARISTOZYME',                 category: 'TABLET',    batchNo: 'DPG250818',     expiryDate: '31/12/2026', costPrice: 129.60, mrpPrice: 146.00, stock:    25 },
  { id: 13, medicineName: 'ARISTOZYME.Syr',             category: 'SYRUP',     batchNo: 'MPG252851',     expiryDate: '31/12/2026', costPrice: 115.42, mrpPrice: 146.00, stock:    40 },
  { id: 14, medicineName: 'ASCORIL LD',                 category: 'SYRUP',     batchNo: '11251214',      expiryDate: '28/02/2027', costPrice: 101.16, mrpPrice: 130.05, stock:    10 },
  { id: 15, medicineName: 'ASCORIL LS [KIDS]',          category: 'SYRUP',     batchNo: '05251134A$',    expiryDate: '31/01/2027', costPrice:  77.14, mrpPrice:  97.88, stock:    50 },
  { id: 16, medicineName: 'ASCORIL LS [KIDS]',          category: 'SYRUP',     batchNo: '05251190A',     expiryDate: '28/02/2027', costPrice:  77.14, mrpPrice:  97.87, stock:     5 },
  { id: 17, medicineName: 'ASCORIL-LS-DROP',            category: 'DROPS',     batchNo: '622403265',     expiryDate: '30/04/2027', costPrice:  57.19, mrpPrice:  72.57, stock:    30 },
  { id: 18, medicineName: 'ASCORIL-LS-DROP',            category: 'DROPS',     batchNo: '62240329',      expiryDate: '30/04/2027', costPrice:  57.19, mrpPrice:  72.57, stock:    40 },
  { id: 19, medicineName: 'ASCORIL-D.Syr',              category: 'SYRUP',     batchNo: '11250650',      expiryDate: '30/04/2027', costPrice: 118.30, mrpPrice: 142.68, stock:    30 },
  { id: 20, medicineName: 'ASCORIL.SYP',                category: 'SYRUP',     batchNo: '11250399',      expiryDate: '31/03/2027', costPrice: 112.07, mrpPrice: 152.00, stock:    45 },
  { id: 21, medicineName: 'ASTHALIN SOLUTION(15ML)',    category: 'SOLUTION',  batchNo: '4SA2658',       expiryDate: '30/11/2026', costPrice:  13.03, mrpPrice:  15.00, stock:    20 },
  { id: 22, medicineName: 'ASTYMIN C (15ML).Drops',    category: 'DROPS',     batchNo: 'F25L106',       expiryDate: '31/01/2027', costPrice:  73.71, mrpPrice:  98.10, stock:    40 },
  { id: 23, medicineName: 'ASTYMIN FORTE.CAP',          category: 'CAPSULE',   batchNo: '25DDCJ02',      expiryDate: '31/03/2027', costPrice:  10.68, mrpPrice:  13.50, stock:  1500 },
  { id: 24, medicineName: 'ASTYMIN.LIQUID',             category: 'LIQUID',    batchNo: 'ANLJ25103',     expiryDate: '31/10/2026', costPrice: 163.16, mrpPrice: 206.00, stock:    15 },
  { id: 25, medicineName: 'ATRACURIM BESYLATE',         category: 'INJECTION', batchNo: 'TAE25004',      expiryDate: '28/02/2027', costPrice:  39.20, mrpPrice:  42.76, stock:     5 },
  { id: 26, medicineName: 'AUGPEN 300MG INJ',           category: 'INJECTION', batchNo: 'ZLB6AB5006',    expiryDate: '31/05/2027', costPrice:  71.40, mrpPrice: 102.00, stock:    24 },
  { id: 27, medicineName: 'AUGPEN 300MG INJ',           category: 'INJECTION', batchNo: 'ZLB6AB5009',    expiryDate: '31/08/2027', costPrice:  71.40, mrpPrice: 102.00, stock:    54 },
  { id: 28, medicineName: 'AUGPEN 300MG INJ',           category: 'INJECTION', batchNo: 'ZLB6AB5003',    expiryDate: '31/03/2027', costPrice:  71.40, mrpPrice: 102.00, stock:   122 },
  { id: 29, medicineName: 'AZITHRAL 100MG',             category: 'TABLET',    batchNo: '25080000975$',  expiryDate: '30/06/2027', costPrice:  43.28, mrpPrice:  51.26, stock:    20 },
  { id: 30, medicineName: 'AZITHRAL-ZADY 200MG',        category: 'TABLET',    batchNo: '24002',         expiryDate: '30/11/2025', costPrice:  83.79, mrpPrice: 103.00, stock:     1 },
  { id: 31, medicineName: 'AZITHRAL-ZADY 200MG',        category: 'TABLET',    batchNo: 'Z06AU23001',    expiryDate: '31/07/2025', costPrice:  40.86, mrpPrice:  46.00, stock:     1 },
  { id: 32, medicineName: 'AZITHRAL-ZADY 200MG',        category: 'TABLET',    batchNo: '2508001094$',   expiryDate: '31/07/2027', costPrice:  41.52, mrpPrice:  49.17, stock:    15 },
  { id: 33, medicineName: 'AZITHRAL-ZADY 200MG',        category: 'TABLET',    batchNo: '2508001094',    expiryDate: '31/07/2027', costPrice:  41.52, mrpPrice:  49.17, stock:    20 },
  { id: 34, medicineName: 'AZITHRAL.TAB',               category: 'TABLET',    batchNo: '1AAA',          expiryDate: '28/02/2027', costPrice:  19.56, mrpPrice:  23.75, stock:   200 },
  { id: 35, medicineName: 'AZITHRAL.TAB',               category: 'TABLET',    batchNo: '2508001018$',   expiryDate: '31/07/2027', costPrice:  19.13, mrpPrice:  22.66, stock:   500 },
  { id: 36, medicineName: 'AZTOR 20MG TAB',             category: 'TABLET',    batchNo: 'SIG1626A',      expiryDate: '31/01/2028', costPrice:  10.18, mrpPrice:  12.07, stock:   105 },
  { id: 37, medicineName: 'BETNOVATE-N',                category: 'CREAM',     batchNo: 'B001',          expiryDate: '12/12/2028', costPrice:  38.00, mrpPrice:  45.50, stock:   150 },
  { id: 38, medicineName: 'BETNESOL-N EYE DROP',        category: 'DROPS',     batchNo: 'BE2026A',       expiryDate: '06/09/2027', costPrice:  55.20, mrpPrice:  68.00, stock:    60 },
  { id: 39, medicineName: 'CALPOL 500MG',               category: 'TABLET',    batchNo: 'CP2026A',       expiryDate: '03/2028',    costPrice:   4.50, mrpPrice:   6.20, stock:  2000 },
  { id: 40, medicineName: 'CALPOL 500MG',               category: 'TABLET',    batchNo: 'CP2026B',       expiryDate: '09/2028',    costPrice:   4.50, mrpPrice:   6.20, stock:   500 },
  { id: 41, medicineName: 'CIPROBID 500MG',             category: 'TABLET',    batchNo: 'CI2026A',       expiryDate: '01/2028',    costPrice:  12.00, mrpPrice:  18.50, stock:   300 },
  { id: 42, medicineName: 'DOLO 650',                   category: 'TABLET',    batchNo: 'DL2026A',       expiryDate: '05/2027',    costPrice:   7.80, mrpPrice:  11.00, stock:  1500 },
  { id: 43, medicineName: 'DOLO 650',                   category: 'TABLET',    batchNo: 'DL2026B',       expiryDate: '11/2027',    costPrice:   7.80, mrpPrice:  11.00, stock:   800 },
  { id: 44, medicineName: 'EMSET 4MG INJ',              category: 'INJECTION', batchNo: 'EM2026A',       expiryDate: '07/2027',    costPrice:  18.40, mrpPrice:  26.00, stock:   200 },
  { id: 45, medicineName: 'FLAGYL 400MG',               category: 'TABLET',    batchNo: 'FL2026A',       expiryDate: '04/2028',    costPrice:   3.20, mrpPrice:   5.80, stock:  1000 },
  { id: 46, medicineName: 'GELUSIL MPS',                category: 'TABLET',    batchNo: 'GE2026A',       expiryDate: '10/2027',    costPrice:   1.90, mrpPrice:   3.50, stock:  2500 },
  { id: 47, medicineName: 'HYDROCORTISONE 100MG INJ',   category: 'INJECTION', batchNo: 'HY2026A',       expiryDate: '02/2028',    costPrice:  42.00, mrpPrice:  58.00, stock:   100 },
  { id: 48, medicineName: 'INSULIN ACTRAPID',           category: 'INJECTION', batchNo: 'IN2026A',       expiryDate: '08/2027',    costPrice: 145.00, mrpPrice: 185.00, stock:    50 },
];

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const fmt = (n: number) =>
  n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ─── Component ────────────────────────────────────────────────────────────────
const BatchWiseStock: React.FC = () => {
  const [selectedLetter, setSelectedLetter] = useState<string>("A");
  const [searchTerm, setSearchTerm]         = useState<string>("");

  // ── Filter by letter and search ───────────────────────────────────────────
  const filteredData = useMemo(() => {
    let data = ALL_STOCK_DATA.filter((item) =>
      item.medicineName.toUpperCase().startsWith(selectedLetter)
    );
    if (searchTerm) {
      data = searchTableData(data, searchTerm, ["medicineName", "category", "batchNo"]);
    }
    return data;
  }, [selectedLetter, searchTerm]);

  // ── Totals ────────────────────────────────────────────────────────────────
  const totals = useMemo(() => {
    let costValue = 0, mrpValue = 0;
    filteredData.forEach((r) => {
      costValue += r.stock * r.costPrice;
      mrpValue  += r.stock * r.mrpPrice;
    });
    return { costValue, mrpValue, salesProfit: mrpValue - costValue };
  }, [filteredData]);

  // ── Overall KPIs (all letters) ────────────────────────────────────────────
  const stats = useMemo(() => {
    let costValue = 0, mrpValue = 0;
    ALL_STOCK_DATA.forEach((r) => {
      costValue += r.stock * r.costPrice;
      mrpValue  += r.stock * r.mrpPrice;
    });
    const uniqueMeds = new Set(ALL_STOCK_DATA.map((r) => r.medicineName)).size;
    return { totalItems: ALL_STOCK_DATA.length, uniqueMeds, costValue, salesProfit: mrpValue - costValue };
  }, []);

  // ── Export ────────────────────────────────────────────────────────────────
  const handleExport = () => {
    let slNo = 0;
    let prevMed = "";
    const rows = filteredData.map((r) => {
      const isNew = r.medicineName !== prevMed;
      if (isNew) slNo++;
      const costVal = r.stock * r.costPrice;
      const mrpVal  = r.stock * r.mrpPrice;
      const row = {
        "Sl No":         isNew ? slNo : "",
        "Medicine Name": isNew ? r.medicineName : "",
        "Category":      isNew ? r.category : ",,",
        "Batch No":      r.batchNo,
        "Expiry Date":   r.expiryDate,
        "Cost Price":    r.costPrice,
        "MRP Price":     r.mrpPrice,
        "Stock":         r.stock,
        "Cost Value":    +costVal.toFixed(2),
        "MRP Value":     +mrpVal.toFixed(2),
        "Sales Profit":  +(mrpVal - costVal).toFixed(2),
      };
      prevMed = r.medicineName;
      return row;
    });
    exportToExcel(rows, `BatchWise_Stock_${selectedLetter}`);
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
    position: "sticky",
    top: 0,
    zIndex: 2,
  };

  const tdBase: React.CSSProperties = {
    fontSize: "var(--font-size-xs)",
    padding: "4px 8px",
    whiteSpace: "nowrap",
    border: "1px solid var(--border-color, #dee2e6)",
    verticalAlign: "middle",
    background: "var(--light, #f8f9fa)",
  };
  const tdR: React.CSSProperties  = { ...tdBase, textAlign: "right" };
  const tdC: React.CSSProperties  = { ...tdBase, textAlign: "center" };

  const tfootStyle: React.CSSProperties = {
    ...tdR,
    background: "var(--primary, #0d6efd)",
    color: "#fff",
    fontWeight: "var(--font-weight-bold)",
    border: "1px solid var(--primary, #0d6efd)",
  };

  // ── Build grouped rows ────────────────────────────────────────────────────
  let slNo = 0;
  let prevMed = "";
  let prevCat = "";

  return (
    <React.Fragment>
      <Container fluid className="px-4 py-3">
        {/* ── Report Header ───────────────────────────────────────────────── */}
        <ReportHeader
          title="Batch Wise Current Stock Register"
          subtitle={`Showing: ${selectedLetter}`}
          onPrint={printReport}
          onExport={handleExport}
          onSearch={(term) => setSearchTerm(term)}
          showSearch={true}
          showSort={false}
          showPrint={true}
          showExport={true}
        />

        {/* ── KPI Cards ───────────────────────────────────────────────────── */}
        <Row className="mb-4">
          <Col md={3}>
            <ReportKPICard label="Total Batches"     value={stats.totalItems}  variant="primary" />
          </Col>
          <Col md={3}>
            <ReportKPICard label="Unique Medicines"  value={stats.uniqueMeds}  variant="info"    />
          </Col>
          <Col md={3}>
            <ReportKPICard
              label="Total Cost Value"
              value={`₹ ${stats.costValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
              variant="warning"
            />
          </Col>
          <Col md={3}>
            <ReportKPICard
              label="Total Sales Profit"
              value={`₹ ${stats.salesProfit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
              variant="success"
            />
          </Col>
        </Row>

        {/* ── Alphabet Filter ─────────────────────────────────────────────── */}
        <Card className="mb-4 shadow-sm no-print">
          <Card.Body className="py-2">
            <div className="d-flex align-items-center flex-wrap gap-1">
              <small
                className="me-2 text-muted"
                style={{ fontWeight: "var(--font-weight-semibold)", whiteSpace: "nowrap" }}
              >
                Filter by letter:
              </small>
              {ALPHABET.map((letter) => (
                <Button
                  key={letter}
                  variant={selectedLetter === letter ? "primary" : "outline-secondary"}
                  size="sm"
                  onClick={() => { setSelectedLetter(letter); setSearchTerm(""); }}
                  style={{
                    minWidth: "32px",
                    padding: "2px 6px",
                    fontSize: "var(--font-size-xs)",
                    fontWeight: "var(--font-weight-semibold)",
                  }}
                >
                  {letter}
                </Button>
              ))}
            </div>
          </Card.Body>
        </Card>

        {/* ── Table ───────────────────────────────────────────────────────── */}
        <Card className="report-card" style={{ padding: "0.75rem" }}>
          <div
            style={{
              maxHeight: "calc(115vh - 480px)",
              minHeight: "350px",
              overflowY: "auto",
              overflowX: "auto",
              position: "relative",
            }}
          >
            <table
              className="table table-bordered mb-0"
              style={{ borderCollapse: "collapse", minWidth: "1000px" }}
            >
              <thead>
                <tr>
                  <th style={{ ...thStyle, width: "50px" }}>Sl No</th>
                  <th style={{ ...thStyle, minWidth: "220px" }}>Medicine Name</th>
                  <th style={thStyle}>Category</th>
                  <th style={thStyle}>Batch No</th>
                  <th style={thStyle}>Expiry Date</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Cost Price</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>MRP Price</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Stock</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Cost Value</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>MRP Value</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Sales Profit</th>
                </tr>
              </thead>

              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={11} style={{ ...tdC, padding: "2rem" }}>
                      {searchTerm
                        ? "No records match your search criteria."
                        : `No stock records found for letter "${selectedLetter}".`}
                    </td>
                  </tr>
                ) : (
                  filteredData.map((r) => {
                    const isNewMed = r.medicineName !== prevMed;
                    const isNewCat = r.category !== prevCat;
                    if (isNewMed) slNo++;
                    const costVal    = r.stock * r.costPrice;
                    const mrpVal     = r.stock * r.mrpPrice;
                    const profitVal  = mrpVal - costVal;
                    prevMed = r.medicineName;
                    prevCat = r.category;

                    return (
                      <tr key={r.id}>
                        <td style={tdC}>
                          {isNewMed ? <strong>{slNo}</strong> : ""}
                        </td>
                        <td style={tdBase}>
                          {isNewMed ? <strong>{r.medicineName}</strong> : ""}
                        </td>
                        <td style={tdC}>
                          {isNewCat ? r.category : ",,"}
                        </td>
                        <td style={tdBase}>{r.batchNo}</td>
                        <td style={tdC}>{r.expiryDate}</td>
                        <td style={tdR}>{fmt(r.costPrice)}</td>
                        <td style={tdR}>{fmt(r.mrpPrice)}</td>
                        <td style={tdR}>{r.stock % 1 === 0 ? r.stock : r.stock.toFixed(2)}</td>
                        <td style={tdR}>{fmt(costVal)}</td>
                        <td style={tdR}>{fmt(mrpVal)}</td>
                        <td style={{ ...tdR, color: profitVal >= 0 ? "var(--success, #198754)" : "var(--danger, #dc3545)" }}>
                          {fmt(profitVal)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>

              {/* ── Totals footer ──────────────────────────────────────────── */}
              {filteredData.length > 0 && (
                <tfoot>
                  <tr>
                    <td colSpan={8} style={{ ...tfootStyle, textAlign: "center" }}>
                      <strong>Total ({selectedLetter})</strong>
                    </td>
                    <td style={tfootStyle}>{fmt(totals.costValue)}</td>
                    <td style={tfootStyle}>{fmt(totals.mrpValue)}</td>
                    <td style={tfootStyle}>{fmt(totals.salesProfit)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* ── Footer row count ────────────────────────────────────────────── */}
          <div
            style={{
              padding: "0.5rem 1rem",
              borderTop: "2px solid var(--border-color, #e0e0e0)",
              textAlign: "start",
            }}
          >
            <small className="text-muted" style={{ fontWeight: "var(--font-weight-medium)" }}>
              Showing <strong>{filteredData.length}</strong> batch record(s) for letter{" "}
              <strong>"{selectedLetter}"</strong>
              {searchTerm && (
                <span className="ms-2">
                  (Filtered from{" "}
                  {ALL_STOCK_DATA.filter((r) => r.medicineName.startsWith(selectedLetter)).length})
                </span>
              )}
            </small>
          </div>
        </Card>
      </Container>
    </React.Fragment>
  );
};

export default BatchWiseStock;
