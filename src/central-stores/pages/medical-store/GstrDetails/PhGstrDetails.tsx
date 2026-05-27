import React, { useState } from "react";
import {
  Container,
  Card,
  Nav,
  Tab,
  Form,
  Button,
  Row,
  Col,
  Table,
  Badge,
} from "react-bootstrap";
import ReportHeader from "../../../../medical-records/components/ReportHeader";
import {
  printReport,
  formatReportDate,
} from "../../../../medical-records/utils/reportUtils";
import { useTableSearch } from "../../../../hooks/useTableSearch";
import SearchInput from "../../../../components/SearchInput";
import "../../../../medical-records/styles/reportStyles.css";

// ─── Shared helpers ───────────────────────────────────────────────────────────

const TH: React.CSSProperties = {
  background: "var(--color-primary, #0d6efd)",
  color: "#fff",
  fontSize: "var(--font-size-sm)",
  whiteSpace: "nowrap",
};

const FMT = (n: number) => n.toFixed(2);

const SUB_TH: React.CSSProperties = {
  background: "var(--color-secondary-bg, #e8eaf6)",
  fontSize: "var(--font-size-xs)",
  whiteSpace: "nowrap",
  color: "#333",
};

function TotalRow({ cells }: { cells: (string | number)[] }) {
  return (
    <tr
      style={{
        background: "var(--color-secondary-bg, #f0f4ff)",
        fontWeight: "var(--font-weight-bold)",
        fontSize: "var(--font-size-sm)",
      }}
    >
      {cells.map((c, i) => (
        <td key={i} className={typeof c === "number" ? "text-end" : ""}>
          {typeof c === "number" ? FMT(c) : c}
        </td>
      ))}
    </tr>
  );
}

interface DateFilterProps {
  fromDate: string;
  toDate: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  onSearch: () => void;
}

function DateFilter({ fromDate, toDate, onFromChange, onToChange, onSearch }: DateFilterProps) {
  return (
    <Card className="report-filter-card mb-3">
      <Card.Body>
        <Row className="align-items-end g-3">
          <Col md={3}>
            <Form.Group>
              <Form.Label style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-semibold)" }}>
                From Date
              </Form.Label>
              <Form.Control
                type="date"
                value={fromDate}
                onChange={(e) => onFromChange(e.target.value)}
                style={{ fontSize: "var(--font-size-sm)" }}
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-semibold)" }}>
                To Date
              </Form.Label>
              <Form.Control
                type="date"
                value={toDate}
                onChange={(e) => onToChange(e.target.value)}
                style={{ fontSize: "var(--font-size-sm)" }}
              />
            </Form.Group>
          </Col>
          <Col md="auto">
            <Button
              variant="primary"
              onClick={onSearch}
              style={{ fontSize: "var(--font-size-sm)" }}
            >
              <i className="fas fa-search me-1" />
              Get Report
            </Button>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}

// ═══════════════════════════════════════════
// Tab 1 – GSTR 3B
// ═══════════════════════════════════════════

interface Gstr3BData {
  // Section A
  outwardIntraStateTaxable: number;
  outwardIntraStateGst: number;   // total GST — split /2 for CGST & SGST
  exempt: number;
  // Section B
  itcOthersGst: number;           // split /2 for CGST & SGST
  itcNonEligibleVal: number;
  itcNonEligibleGst: number;
  itcIpIneligibleVal: number;
  itcIpIneligibleGst: number;
  netItcVal: number;
  netItcCgst: number;
  netItcSgst: number;
  hospitalGst: number;
  // Tax-wise breakdown
  taxwiseRows: Array<{ taxPct: string; taxableValue: number; gst: number }>;
  // Summary
  opSalePercent: number;
  ipSalePercent: number;
  taxAmountTotal: number;
}

const GSTR3B_DEMO_DATA: Gstr3BData = {
  outwardIntraStateTaxable: 4838564.57,
  outwardIntraStateGst: 252384.28,
  exempt: 85098.96,
  itcOthersGst: 109345.58,
  itcNonEligibleVal: 49728.73,
  itcNonEligibleGst: 3031.12,
  itcIpIneligibleVal: 23032.37,
  itcIpIneligibleGst: 1171.70,
  netItcVal: 2126398.70,
  netItcCgst: 54086.94,
  netItcSgst: 54086.94,
  hospitalGst: 144210.41,
  taxwiseRows: [
    { taxPct: "0.00",  taxableValue: 32339.12,   gst: 0 },
    { taxPct: "5.00",  taxableValue: 4758133.41, gst: 237906.68 },
    { taxPct: "12.00", taxableValue: 0,           gst: 0 },
    { taxPct: "18.00", taxableValue: 80431.16,   gst: 14477.62 },
    { taxPct: "28.00", taxableValue: 0,           gst: 0 },
  ],
  opSalePercent: 98.93,
  ipSalePercent: 1.07,
  taxAmountTotal: 144210.41,
};

const SECTION_ROW: React.CSSProperties = {
  background: "var(--color-secondary-bg, #e8eaf6)",
  fontWeight: "var(--font-weight-bold)",
  fontSize: "var(--font-size-sm)",
};
const SUMMARY_ROW: React.CSSProperties = {
  background: "#f0f4ff",
  fontWeight: "var(--font-weight-bold)",
  fontSize: "var(--font-size-sm)",
};
const GRAND_TOTAL_ROW: React.CSSProperties = {
  background: "#c0c0c0",
  fontWeight: "var(--font-weight-bold)",
  fontSize: "var(--font-size-sm)",
};

function Gstr3BTab() {
  const today = new Date().toISOString().split("T")[0];
  const [fromDate, setFromDate] = useState(today.slice(0, 7) + "-01");
  const [toDate, setToDate] = useState(today);
  const [data, setData] = useState<Gstr3BData | null>(null);
  const [searched, setSearched] = useState(false);

  const V = (n: number) => (n !== 0 ? FMT(n) : "");

  const renderReport = (d: Gstr3BData) => {
    const totLiabilityTaxable = d.outwardIntraStateTaxable + d.exempt;
    const totLiabilityCgst = d.outwardIntraStateGst / 2;
    const totLiabilitySgst = d.outwardIntraStateGst / 2;

    let taxTotValue = d.exempt;
    let taxTotGst = 0;
    for (const r of d.taxwiseRows) { taxTotValue += r.taxableValue; taxTotGst += r.gst; }

    return (
      <>
        {/* ── Main GSTR 3B table ── */}
        <Card className="mb-3">
          <Card.Header style={{ background: "var(--color-primary, #0d6efd)", color: "#fff" }}>
            <strong style={{ fontSize: "var(--font-size-sm)" }}>
              GSTR 3B — {formatReportDate(fromDate)} to {formatReportDate(toDate)}
            </strong>
          </Card.Header>
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table bordered className="mb-0" style={{ fontSize: "var(--font-size-sm)" }}>
                <thead>
                  <tr>
                    <th style={{ ...TH, width: 55 }}>S.No</th>
                    <th style={TH}>Particulars</th>
                    <th style={{ ...TH, textAlign: "right", width: 160 }}>Taxable Value (₹)</th>
                    <th style={{ ...TH, textAlign: "right", width: 130 }}>CGST (₹)</th>
                    <th style={{ ...TH, textAlign: "right", width: 130 }}>SGST (₹)</th>
                    <th style={{ ...TH, textAlign: "right", width: 130 }}>IGST (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {/* ─ Section A ─ */}
                  <tr style={SECTION_ROW}>
                    <td><strong>(A)</strong></td>
                    <td colSpan={5}><strong>Computation of Tax Liability</strong></td>
                  </tr>
                  <tr>
                    <td className="text-center">1</td>
                    <td>Outward Taxable Supplies - Intra state</td>
                    <td className="text-end">{V(d.outwardIntraStateTaxable)}</td>
                    <td className="text-end">{V(d.outwardIntraStateGst / 2)}</td>
                    <td className="text-end">{V(d.outwardIntraStateGst / 2)}</td>
                    <td></td>
                  </tr>
                  <tr style={{ background: "#f8f9fa" }}>
                    <td className="text-center">2</td>
                    <td>Outward Taxable Supplies - Inter Co</td>
                    <td></td><td></td><td></td><td></td>
                  </tr>
                  <tr>
                    <td className="text-center">3</td>
                    <td>Outward Taxable Supplies - Inter State</td>
                    <td></td><td></td><td></td><td></td>
                  </tr>
                  <tr style={{ background: "#f8f9fa" }}>
                    <td className="text-center">4</td>
                    <td>Outward - Zero rated</td>
                    <td></td><td></td><td></td><td></td>
                  </tr>
                  <tr>
                    <td className="text-center">5</td>
                    <td>Outward - Nil or Exempt</td>
                    <td className="text-end">{V(d.exempt)}</td>
                    <td></td><td></td><td></td>
                  </tr>
                  <tr style={{ background: "#f8f9fa" }}>
                    <td className="text-center">6</td>
                    <td>Inward supplies - RCM</td>
                    <td></td><td></td><td></td><td></td>
                  </tr>
                  <tr>
                    <td></td>
                    <td>&nbsp;&nbsp; Imports</td>
                    <td></td><td></td><td></td><td></td>
                  </tr>
                  <tr style={{ background: "#f8f9fa" }}>
                    <td></td>
                    <td>&nbsp;&nbsp; Domestic - Inter State</td>
                    <td></td><td></td><td></td><td></td>
                  </tr>
                  <tr>
                    <td></td>
                    <td>&nbsp;&nbsp; Domestic - Intra state</td>
                    <td></td><td></td><td></td><td></td>
                  </tr>
                  <tr style={SUMMARY_ROW}>
                    <td></td>
                    <td><strong>Total tax liability</strong></td>
                    <td className="text-end"><strong>{FMT(totLiabilityTaxable)}</strong></td>
                    <td className="text-end"><strong>{FMT(totLiabilityCgst)}</strong></td>
                    <td className="text-end"><strong>{FMT(totLiabilitySgst)}</strong></td>
                    <td></td>
                  </tr>
                  <tr><td colSpan={6}>&nbsp;</td></tr>

                  {/* ─ Section B ─ */}
                  <tr style={SECTION_ROW}>
                    <td><strong>(B)</strong></td>
                    <td colSpan={5}><strong>Computation of ITC on inward supplies</strong></td>
                  </tr>
                  {[
                    { no: "5", label: "Opening Balance of ITC" },
                    { no: "6", label: "ITC- Import of goods" },
                    { no: "7", label: "ITC-Import of services" },
                    { no: "8", label: "ITC-Other RCM" },
                    { no: "9", label: "ITC- ISD" },
                  ].map((row, i) => (
                    <tr key={row.no} style={{ background: i % 2 === 0 ? "#fff" : "#f8f9fa" }}>
                      <td className="text-center">{row.no}</td>
                      <td>{row.label}</td>
                      <td></td><td></td><td></td><td></td>
                    </tr>
                  ))}
                  <tr>
                    <td className="text-center">10</td>
                    <td>ITC Others</td>
                    <td></td>
                    <td className="text-end">{V(d.itcOthersGst / 2)}</td>
                    <td className="text-end">{V(d.itcOthersGst / 2)}</td>
                    <td></td>
                  </tr>
                  <tr style={SUMMARY_ROW}>
                    <td className="text-center"><strong>11</strong></td>
                    <td><strong>ITC Available</strong></td>
                    <td></td>
                    <td className="text-end"><strong>{FMT(d.itcOthersGst / 2)}</strong></td>
                    <td className="text-end"><strong>{FMT(d.itcOthersGst / 2)}</strong></td>
                    <td></td>
                  </tr>
                  <tr><td colSpan={6}>&nbsp;</td></tr>
                  <tr>
                    <td className="text-center">12</td>
                    <td>ITC Non-eligible</td>
                    <td className="text-end">{V(d.itcNonEligibleVal)}</td>
                    <td className="text-end">{V(d.itcNonEligibleGst / 2)}</td>
                    <td className="text-end">{V(d.itcNonEligibleGst / 2)}</td>
                    <td></td>
                  </tr>
                  <tr style={{ background: "#f8f9fa" }}>
                    <td className="text-center">13</td>
                    <td>ITC IP Inegibility</td>
                    <td className="text-end">{V(d.itcIpIneligibleVal)}</td>
                    <td className="text-end">{V(d.itcIpIneligibleGst / 2)}</td>
                    <td className="text-end">{V(d.itcIpIneligibleGst / 2)}</td>
                    <td></td>
                  </tr>
                  <tr style={SUMMARY_ROW}>
                    <td></td>
                    <td><strong>Net ITC Available</strong></td>
                    <td className="text-end"><strong>{FMT(d.netItcVal)}</strong></td>
                    <td className="text-end"><strong>{FMT(d.netItcCgst)}</strong></td>
                    <td className="text-end"><strong>{FMT(d.netItcSgst)}</strong></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td></td>
                    <td><strong>Liability Payable in cash</strong></td>
                    <td></td><td></td><td></td><td></td>
                  </tr>
                  <tr><td colSpan={6}>&nbsp;</td></tr>
                  <tr style={{ background: "#f8f9fa" }}>
                    <td></td>
                    <td>GST Payable in Hospital</td>
                    <td className="text-end">{V(d.hospitalGst)}</td>
                    <td></td><td></td><td></td>
                  </tr>
                  <tr><td colSpan={6}>&nbsp;</td></tr>
                  <tr>
                    <td></td>
                    <td>Total Input</td>
                    <td></td><td></td><td></td><td></td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>

        {/* ── Tax-wise breakdown ── */}
        <Card className="mb-3">
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table bordered className="mb-0" style={{ fontSize: "var(--font-size-sm)" }}>
                <thead>
                  <tr>
                    <th style={TH}>Tax%</th>
                    <th style={{ ...TH, textAlign: "right" }}>Taxable Value (₹)</th>
                    <th style={{ ...TH, textAlign: "right" }}>SGST (₹)</th>
                    <th style={{ ...TH, textAlign: "right" }}>CGST (₹)</th>
                    <th style={{ ...TH, textAlign: "right" }}>Total (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {d.taxwiseRows.map((r, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f8f9fa" }}>
                      <td className="text-end">{r.taxPct}</td>
                      <td className="text-end">{FMT(r.taxableValue)}</td>
                      <td className="text-end">{FMT(r.gst / 2)}</td>
                      <td className="text-end">{FMT(r.gst / 2)}</td>
                      <td className="text-end">{FMT(r.taxableValue + r.gst)}</td>
                    </tr>
                  ))}
                  <tr style={{ background: d.taxwiseRows.length % 2 === 0 ? "#fff" : "#f8f9fa" }}>
                    <td className="text-end">Exempt</td>
                    <td className="text-end">{FMT(d.exempt)}</td>
                    <td></td><td></td><td></td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr style={GRAND_TOTAL_ROW}>
                    <td><strong>Grand Total</strong></td>
                    <td className="text-end"><strong>{FMT(taxTotValue)}</strong></td>
                    <td className="text-end"><strong>{FMT(taxTotGst / 2)}</strong></td>
                    <td className="text-end"><strong>{FMT(taxTotGst / 2)}</strong></td>
                    <td className="text-end"><strong>{FMT(taxTotValue + taxTotGst)}</strong></td>
                  </tr>
                </tfoot>
              </Table>
            </div>
          </Card.Body>
        </Card>

        {/* ── B2C Summary ── */}
        <Card className="mb-3">
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table bordered className="mb-0" style={{ fontSize: "var(--font-size-sm)" }}>
                <tbody>
                  <tr>
                    <td>B2C - Taxable</td>
                    <td className="text-end">{FMT(d.outwardIntraStateTaxable)}</td>
                    <td className="text-end">{FMT(d.outwardIntraStateGst / 2)}</td>
                    <td className="text-end">{FMT(d.outwardIntraStateGst / 2)}</td>
                    <td className="text-end">{FMT(d.outwardIntraStateTaxable + d.outwardIntraStateGst)}</td>
                  </tr>
                  <tr style={{ background: "#f8f9fa" }}>
                    <td>B2C - Exempt</td>
                    <td className="text-end">{FMT(d.exempt)}</td>
                    <td></td><td></td>
                    <td className="text-end">{FMT(d.exempt)}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr style={GRAND_TOTAL_ROW}>
                    <td><strong>Grand Total</strong></td>
                    <td className="text-end"><strong>{FMT(taxTotValue)}</strong></td>
                    <td className="text-end"><strong>{FMT(taxTotGst / 2)}</strong></td>
                    <td className="text-end"><strong>{FMT(taxTotGst / 2)}</strong></td>
                    <td className="text-end"><strong>{FMT(taxTotValue + taxTotGst)}</strong></td>
                  </tr>
                </tfoot>
              </Table>
            </div>
          </Card.Body>
        </Card>

        {/* ── Footer summary ── */}
        <div style={{ fontSize: "var(--font-size-sm)", padding: "4px 2px", color: "#444" }}>
          &nbsp;&nbsp;{FMT(d.opSalePercent)} % Sales &nbsp;&nbsp;{FMT(d.ipSalePercent)} % IP Consumables
        </div>
        <div style={{ fontSize: "var(--font-size-sm)", padding: "4px 2px", color: "#444" }}>
          &nbsp;&nbsp;Date between "{formatReportDate(fromDate)}" and "{formatReportDate(toDate)}" &nbsp;
          Tax Amount : Rs. {FMT(d.taxAmountTotal)}
        </div>
      </>
    );
  };

  return (
    <>
      <DateFilter
        fromDate={fromDate} toDate={toDate}
        onFromChange={setFromDate} onToChange={setToDate}
        onSearch={() => { setData(GSTR3B_DEMO_DATA); setSearched(true); }}
      />
      {searched && data && renderReport(data)}
    </>
  );
}

// ═══════════════════════════════════════════
// Tab 2 – Billwise Sales
// ═══════════════════════════════════════════

interface BillwiseSalesRow {
  slNo: number;
  name: string;
  opNo: string;
  billNoDate: string;
  patientCategory: string;
  concessionType: string;
  issType: string;
  taxableValue: number;
  gstPct: number;
  cgst: number;
  sgst: number;
  grossAmt: number;
  concAmt: number;
  netAmt: number;
  gst: number;
  diff: number;
}

interface BillwiseSalesSummaryRow {
  head: string;
  rate: number;
  taxableValue: number;
  cgst: number;
  sgst: number;
}

const BILLWISE_SALES_DEMO: BillwiseSalesRow[] = [
  { slNo: 1, name: "MRS.SHALINI", opNo: "507771", billNoDate: "PHG-61884 24 Feb", patientCategory: "General Patient Account", concessionType: "With Concession", issType: "CASH OUT PATIENT", taxableValue: 501.30, gstPct: 0.00, cgst: 0.00, sgst: 0.00, grossAmt: 501.30, concAmt: 55.70, netAmt: 557.00, gst: 0.00, diff: 8.2150 },
  { slNo: 2, name: "MRS.BANUPRIYA", opNo: "570742", billNoDate: "PHG-61536 23 Feb", patientCategory: "General Patient Account", concessionType: "With Concession", issType: "CASH OUT PATIENT", taxableValue: 50.40, gstPct: 0.00, cgst: 0.00, sgst: 0.00, grossAmt: 50.40, concAmt: 5.60, netAmt: 56.00, gst: 0.00, diff: 0.0000 },
];

const BILLWISE_SALES_SUMMARY_DEMO: BillwiseSalesSummaryRow[] = [
  { head: "Sales", rate: 0.00,  taxableValue: 2567.90,   cgst: 0.00,     sgst: 0.00 },
  { head: "Sales", rate: 5.00,  taxableValue: 507167.12, cgst: 12679.18, sgst: 12679.18 },
  { head: "Sales", rate: 18.00, taxableValue: 9088.42,   cgst: 817.96,   sgst: 817.96 },
];

function BillwiseSalesTab() {
  const today = new Date().toISOString().split("T")[0];
  const [fromDate, setFromDate] = useState(today.slice(0, 7) + "-01");
  const [toDate, setToDate] = useState(today);
  const [rows, setRows] = useState<BillwiseSalesRow[]>([]);
  const [summaryRows, setSummaryRows] = useState<BillwiseSalesSummaryRow[]>([]);
  const [searched, setSearched] = useState(false);

  const { filteredData, searchTerm, setSearchTerm, resultCount, totalCount } =
    useTableSearch({ data: rows, searchFields: ["name", "opNo", "billNoDate", "patientCategory", "issType"] });

  const tot = (key: keyof BillwiseSalesRow) =>
    filteredData.reduce((s, r) => s + (r[key] as number), 0);
  const sumTot = (key: keyof BillwiseSalesSummaryRow) =>
    summaryRows.reduce((s, r) => s + (r[key] as number), 0);

  return (
    <>
      <DateFilter
        fromDate={fromDate} toDate={toDate}
        onFromChange={setFromDate} onToChange={setToDate}
        onSearch={() => { setRows(BILLWISE_SALES_DEMO); setSummaryRows(BILLWISE_SALES_SUMMARY_DEMO); setSearched(true); }}
      />
      {searched && (
        <>
          {/* ── Detail table ── */}
          <Card className="mb-3">
            <Card.Header className="d-flex align-items-center justify-content-between py-2"
              style={{ background: "var(--color-primary, #0d6efd)", color: "#fff" }}>
              <strong style={{ fontSize: "var(--font-size-sm)" }}>
                Billwise Sales — {formatReportDate(fromDate)} to {formatReportDate(toDate)}
              </strong>
              <SearchInput searchTerm={searchTerm} onSearchChange={setSearchTerm}
                placeholder="Search name, OP no, bill..." resultCount={resultCount} totalCount={totalCount} />
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table bordered hover className="mb-0" style={{ fontSize: "var(--font-size-sm)" }}>
                  <thead>
                    <tr>
                      <th style={{ ...TH, width: 50 }}>SL.NO</th>
                      <th style={TH}>Name</th>
                      <th style={TH}>Opno</th>
                      <th style={TH}>Bill No and Date</th>
                      <th style={TH}>Patient Category</th>
                      <th style={TH}>With/Without Concession</th>
                      <th style={TH}>Iss Type</th>
                      <th style={{ ...TH, textAlign: "right" }}>Taxable Value (₹)</th>
                      <th style={{ ...TH, textAlign: "right" }}>GST (%)</th>
                      <th style={{ ...TH, textAlign: "right" }}>CGST (₹)</th>
                      <th style={{ ...TH, textAlign: "right" }}>SGST (₹)</th>
                      <th style={{ ...TH, textAlign: "right" }}>Gross Amt (₹)</th>
                      <th style={{ ...TH, textAlign: "right" }}>Conc Amt (₹)</th>
                      <th style={{ ...TH, textAlign: "right" }}>Net Amt (₹)</th>
                      <th style={{ ...TH, textAlign: "right" }}>GST (₹)</th>
                      <th style={{ ...TH, textAlign: "right" }}>Diff</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((r, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f8f9fa" }}>
                        <td className="text-center">{r.slNo}</td>
                        <td>{r.name}</td>
                        <td>{r.opNo}</td>
                        <td>{r.billNoDate}</td>
                        <td>{r.patientCategory}</td>
                        <td>{r.concessionType}</td>
                        <td>{r.issType}</td>
                        <td className="text-end">{FMT(r.taxableValue)}</td>
                        <td className="text-end">{FMT(r.gstPct)}</td>
                        <td className="text-end">{FMT(r.cgst)}</td>
                        <td className="text-end">{FMT(r.sgst)}</td>
                        <td className="text-end">{FMT(r.grossAmt)}</td>
                        <td className="text-end">{FMT(r.concAmt)}</td>
                        <td className="text-end">{FMT(r.netAmt)}</td>
                        <td className="text-end">{FMT(r.gst)}</td>
                        <td className="text-end">{r.diff.toFixed(4)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: "var(--color-secondary-bg, #f0f4ff)", fontWeight: "var(--font-weight-bold)", fontSize: "var(--font-size-sm)" }}>
                      <td colSpan={7} className="text-end"><strong>{filteredData.length} bills</strong></td>
                      <td className="text-end">{FMT(tot("taxableValue"))}</td>
                      <td></td>
                      <td className="text-end">{FMT(tot("cgst"))}</td>
                      <td className="text-end">{FMT(tot("sgst"))}</td>
                      <td className="text-end">{FMT(tot("grossAmt"))}</td>
                      <td className="text-end">{FMT(tot("concAmt"))}</td>
                      <td className="text-end">{FMT(tot("netAmt"))}</td>
                      <td className="text-end">{FMT(tot("gst"))}</td>
                      <td className="text-end">{tot("diff").toFixed(4)}</td>
                    </tr>
                  </tfoot>
                </Table>
              </div>
            </Card.Body>
          </Card>

          {/* ── Summary table ── */}
          <Card className="mb-3">
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table bordered className="mb-0" style={{ fontSize: "var(--font-size-sm)" }}>
                  <thead>
                    <tr>
                      <th style={TH}>Head</th>
                      <th style={{ ...TH, textAlign: "right" }}>Rate</th>
                      <th style={{ ...TH, textAlign: "right" }}>Taxable Value (₹)</th>
                      <th style={{ ...TH, textAlign: "right" }}>CGST (₹)</th>
                      <th style={{ ...TH, textAlign: "right" }}>SGST (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaryRows.map((r, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f8f9fa" }}>
                        <td>{r.head}</td>
                        <td className="text-end">{FMT(r.rate)}</td>
                        <td className="text-end">{FMT(r.taxableValue)}</td>
                        <td className="text-end">{FMT(r.cgst)}</td>
                        <td className="text-end">{FMT(r.sgst)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={GRAND_TOTAL_ROW}>
                      <td><strong>Total</strong></td>
                      <td></td>
                      <td className="text-end"><strong>{FMT(sumTot("taxableValue"))}</strong></td>
                      <td className="text-end"><strong>{FMT(sumTot("cgst"))}</strong></td>
                      <td className="text-end"><strong>{FMT(sumTot("sgst"))}</strong></td>
                    </tr>
                  </tfoot>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </>
      )}
    </>
  );
}

// ═══════════════════════════════════════════
// Tab 3 – Billwise Sales Return
// ═══════════════════════════════════════════

interface BillwiseSalesReturnRow {
  slNo: number;
  name: string;
  opNo: string;
  billNoDate: string;
  patientCategory: string;
  concessionType: string;
  issType: string;
  taxableValue: number;
  gstPct: number;
  cgst: number;
  sgst: number;
  grossAmt: number;
  concAmt: number;
  netAmt: number;
  gst: number;
  diff: number;
}

interface BillwiseSalesReturnSummaryRow {
  head: string;
  rate: number;
  taxableValue: number;
  cgst: number;
  sgst: number;
}

const BILLWISE_RETURN_DEMO: BillwiseSalesReturnRow[] = [
  { slNo: 1, name: "MR.PANDIAN",    opNo: "533712", billNoDate: "PHR-421 24 Feb",   patientCategory: "General Patient Account", concessionType: "With Concession", issType: "CASH OUT PATIENT", taxableValue: 588.19, gstPct: 5.00, cgst: 14.70, sgst: 14.70, grossAmt: 617.60, concAmt: 65.35,  netAmt: 682.95, gst: 29.41, diff:  0.0000 },
  { slNo: 2, name: "MR. ANDI",      opNo: "513539", billNoDate: "IPHR-1113 24 Feb", patientCategory: "General Patient Account", concessionType: "With Concession", issType: "CASH OUT PATIENT", taxableValue: 810.63, gstPct: 5.00, cgst: 20.26, sgst: 20.26, grossAmt: 851.16, concAmt: 90.07,  netAmt: 941.23, gst: 40.53, diff: -0.0441 },
  { slNo: 3, name: "K.VISHNU DEV",  opNo: "570688", billNoDate: "IPHR-1133 24 Feb", patientCategory: "General Patient Account", concessionType: "With Concession", issType: "CASH OUT PATIENT", taxableValue: 359.35, gstPct: 5.00, cgst:  8.98, sgst:  8.98, grossAmt: 377.32, concAmt: 39.94,  netAmt: 417.26, gst: 17.97, diff:  0.0000 },
  { slNo: 4, name: "MRS.SHARMILA",  opNo: "570685", billNoDate: "IPHR-1128 24 Feb", patientCategory: "General Patient Account", concessionType: "With Concession", issType: "CASH OUT PATIENT", taxableValue: 437.98, gstPct: 5.00, cgst: 10.95, sgst: 10.95, grossAmt: 459.88, concAmt: 48.65,  netAmt: 508.53, gst: 21.90, diff: -0.0880 },
];

const BILLWISE_RETURN_SUMMARY_DEMO: BillwiseSalesReturnSummaryRow[] = [
  { head: "Sales Ret", rate: 5.00, taxableValue: 12492.83, cgst: 312.32, sgst: 312.32 },
];

function BillwiseSalesReturnTab() {
  const today = new Date().toISOString().split("T")[0];
  const [fromDate, setFromDate] = useState(today.slice(0, 7) + "-01");
  const [toDate, setToDate] = useState(today);
  const [rows, setRows] = useState<BillwiseSalesReturnRow[]>([]);
  const [summaryRows, setSummaryRows] = useState<BillwiseSalesReturnSummaryRow[]>([]);
  const [searched, setSearched] = useState(false);

  const { filteredData, searchTerm, setSearchTerm, resultCount, totalCount } =
    useTableSearch({ data: rows, searchFields: ["name", "opNo", "billNoDate", "patientCategory", "issType"] });

  const tot = (key: keyof BillwiseSalesReturnRow) =>
    filteredData.reduce((s, r) => s + (r[key] as number), 0);
  const sumTot = (key: keyof BillwiseSalesReturnSummaryRow) =>
    summaryRows.reduce((s, r) => s + (r[key] as number), 0);

  return (
    <>
      <DateFilter
        fromDate={fromDate} toDate={toDate}
        onFromChange={setFromDate} onToChange={setToDate}
        onSearch={() => { setRows(BILLWISE_RETURN_DEMO); setSummaryRows(BILLWISE_RETURN_SUMMARY_DEMO); setSearched(true); }}
      />
      {searched && (
        <>
          {/* ── Detail table ── */}
          <Card className="mb-3">
            <Card.Header className="d-flex align-items-center justify-content-between py-2"
              style={{ background: "var(--color-primary, #0d6efd)", color: "#fff" }}>
              <strong style={{ fontSize: "var(--font-size-sm)" }}>
                Billwise Sales Return — {formatReportDate(fromDate)} to {formatReportDate(toDate)}
              </strong>
              <SearchInput searchTerm={searchTerm} onSearchChange={setSearchTerm}
                placeholder="Search name, OP no, bill..." resultCount={resultCount} totalCount={totalCount} />
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table bordered hover className="mb-0" style={{ fontSize: "var(--font-size-sm)" }}>
                  <thead>
                    <tr>
                      <th style={{ ...TH, width: 50 }}>SL.NO</th>
                      <th style={TH}>Name</th>
                      <th style={TH}>Opno</th>
                      <th style={TH}>Bill No and Date</th>
                      <th style={TH}>Patient Category</th>
                      <th style={TH}>With/Without Concession</th>
                      <th style={TH}>Iss Type</th>
                      <th style={{ ...TH, textAlign: "right" }}>Taxable Value (₹)</th>
                      <th style={{ ...TH, textAlign: "right" }}>GST (%)</th>
                      <th style={{ ...TH, textAlign: "right" }}>CGST (₹)</th>
                      <th style={{ ...TH, textAlign: "right" }}>SGST (₹)</th>
                      <th style={{ ...TH, textAlign: "right" }}>Gross Amt (₹)</th>
                      <th style={{ ...TH, textAlign: "right" }}>Conc Amt (₹)</th>
                      <th style={{ ...TH, textAlign: "right" }}>Net Amt (₹)</th>
                      <th style={{ ...TH, textAlign: "right" }}>GST (₹)</th>
                      <th style={{ ...TH, textAlign: "right" }}>Diff</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((r, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f8f9fa" }}>
                        <td className="text-center">{r.slNo}</td>
                        <td>{r.name}</td>
                        <td>{r.opNo}</td>
                        <td>{r.billNoDate}</td>
                        <td>{r.patientCategory}</td>
                        <td>{r.concessionType}</td>
                        <td>{r.issType}</td>
                        <td className="text-end">{FMT(r.taxableValue)}</td>
                        <td className="text-end">{FMT(r.gstPct)}</td>
                        <td className="text-end">{FMT(r.cgst)}</td>
                        <td className="text-end">{FMT(r.sgst)}</td>
                        <td className="text-end">{FMT(r.grossAmt)}</td>
                        <td className="text-end">{FMT(r.concAmt)}</td>
                        <td className="text-end">{FMT(r.netAmt)}</td>
                        <td className="text-end">{FMT(r.gst)}</td>
                        <td className="text-end">{r.diff.toFixed(4)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: "var(--color-secondary-bg, #f0f4ff)", fontWeight: "var(--font-weight-bold)", fontSize: "var(--font-size-sm)" }}>
                      <td colSpan={7} className="text-end"><strong>{filteredData.length} bills</strong></td>
                      <td className="text-end">{FMT(tot("taxableValue"))}</td>
                      <td></td>
                      <td className="text-end">{FMT(tot("cgst"))}</td>
                      <td className="text-end">{FMT(tot("sgst"))}</td>
                      <td className="text-end">{FMT(tot("grossAmt"))}</td>
                      <td className="text-end">{FMT(tot("concAmt"))}</td>
                      <td className="text-end">{FMT(tot("netAmt"))}</td>
                      <td className="text-end">{FMT(tot("gst"))}</td>
                      <td className="text-end">{tot("diff").toFixed(4)}</td>
                    </tr>
                  </tfoot>
                </Table>
              </div>
            </Card.Body>
          </Card>

          {/* ── Summary table ── */}
          <Card className="mb-3">
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table bordered className="mb-0" style={{ fontSize: "var(--font-size-sm)" }}>
                  <thead>
                    <tr>
                      <th style={TH}>Head</th>
                      <th style={{ ...TH, textAlign: "right" }}>Rate</th>
                      <th style={{ ...TH, textAlign: "right" }}>Taxable Value (₹)</th>
                      <th style={{ ...TH, textAlign: "right" }}>CGST (₹)</th>
                      <th style={{ ...TH, textAlign: "right" }}>SGST (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaryRows.map((r, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f8f9fa" }}>
                        <td>{r.head}</td>
                        <td className="text-end">{FMT(r.rate)}</td>
                        <td className="text-end">{FMT(r.taxableValue)}</td>
                        <td className="text-end">{FMT(r.cgst)}</td>
                        <td className="text-end">{FMT(r.sgst)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={GRAND_TOTAL_ROW}>
                      <td><strong>Total</strong></td>
                      <td></td>
                      <td className="text-end"><strong>{FMT(sumTot("taxableValue"))}</strong></td>
                      <td className="text-end"><strong>{FMT(sumTot("cgst"))}</strong></td>
                      <td className="text-end"><strong>{FMT(sumTot("sgst"))}</strong></td>
                    </tr>
                  </tfoot>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </>
      )}
    </>
  );
}

// ═══════════════════════════════════════════
// Tab 4 – IP Exempted
// ═══════════════════════════════════════════

interface IpExemptedRow {
  slNo: number;
  billNoDate: string;
  issType: string;
  wardName: string;
  taxableValue: number;
  gstPct: number;
  gst: number;
}

interface IpExemptedSummaryRow {
  head: string;
  rate: number;
  taxableValue: number;
  cgst: number;
  sgst: number;
}

const IP_EXEMPTED_DEMO: IpExemptedRow[] = [
  { slNo: 1, billNoDate: "IPHR-1140 01 Mar", issType: "IP PATIENT",   wardName: "General Ward",   taxableValue: 1250.00, gstPct: 0.00, gst: 0.00 },
  { slNo: 2, billNoDate: "IPHR-1145 03 Mar", issType: "IP PATIENT",   wardName: "Surgical Ward",  taxableValue:  840.50, gstPct: 0.00, gst: 0.00 },
  { slNo: 3, billNoDate: "IPHR-1152 05 Mar", issType: "IP PATIENT",   wardName: "General Ward",   taxableValue: 2100.00, gstPct: 0.00, gst: 0.00 },
  { slNo: 4, billNoDate: "IPHR-1160 08 Mar", issType: "IP PATIENT",   wardName: "Ortho Ward",     taxableValue:  980.75, gstPct: 0.00, gst: 0.00 },
  { slNo: 5, billNoDate: "IPHR-1175 11 Mar", issType: "IP PATIENT",   wardName: "General Ward",   taxableValue: 1640.30, gstPct: 0.00, gst: 0.00 },
];

const IP_EXEMPTED_SUMMARY_DEMO: IpExemptedSummaryRow[] = [];

function IpExemptedTab() {
  const today = new Date().toISOString().split("T")[0];
  const [fromDate, setFromDate] = useState(today.slice(0, 7) + "-01");
  const [toDate, setToDate] = useState(today);
  const [rows, setRows] = useState<IpExemptedRow[]>([]);
  const [summaryRows, setSummaryRows] = useState<IpExemptedSummaryRow[]>([]);
  const [searched, setSearched] = useState(false);

  const { filteredData, searchTerm, setSearchTerm, resultCount, totalCount } =
    useTableSearch({ data: rows, searchFields: ["billNoDate", "issType", "wardName"] });

  const tot = (key: keyof IpExemptedRow) =>
    filteredData.reduce((s, r) => s + (r[key] as number), 0);
  const sumTot = (key: keyof IpExemptedSummaryRow) =>
    summaryRows.reduce((s, r) => s + (r[key] as number), 0);

  return (
    <>
      <DateFilter
        fromDate={fromDate} toDate={toDate}
        onFromChange={setFromDate} onToChange={setToDate}
        onSearch={() => { setRows(IP_EXEMPTED_DEMO); setSummaryRows(IP_EXEMPTED_SUMMARY_DEMO); setSearched(true); }}
      />
      {searched && (
        <>
          {/* ── Detail table ── */}
          <Card className="mb-3">
            <Card.Header className="d-flex align-items-center justify-content-between py-2"
              style={{ background: "var(--color-primary, #0d6efd)", color: "#fff" }}>
              <strong style={{ fontSize: "var(--font-size-sm)" }}>
                IP Exempted — {formatReportDate(fromDate)} to {formatReportDate(toDate)}
              </strong>
              <SearchInput searchTerm={searchTerm} onSearchChange={setSearchTerm}
                placeholder="Search bill, ward, iss type..." resultCount={resultCount} totalCount={totalCount} />
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table bordered hover className="mb-0" style={{ fontSize: "var(--font-size-sm)" }}>
                  <thead>
                    <tr>
                      <th style={{ ...TH, width: 50 }}>SL.NO</th>
                      <th style={TH}>Bill No and Date</th>
                      <th style={TH}>Iss Type</th>
                      <th style={TH}>Ward Name</th>
                      <th style={{ ...TH, textAlign: "right" }}>Taxable Value (₹)</th>
                      <th style={{ ...TH, textAlign: "right" }}>GST (%)</th>
                      <th style={{ ...TH, textAlign: "right" }}>GST (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((r, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f8f9fa" }}>
                        <td className="text-center">{r.slNo}</td>
                        <td>{r.billNoDate}</td>
                        <td>{r.issType}</td>
                        <td>{r.wardName}</td>
                        <td className="text-end">{FMT(r.taxableValue)}</td>
                        <td className="text-end">{FMT(r.gstPct)}</td>
                        <td className="text-end">{FMT(r.gst)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: "var(--color-secondary-bg, #f0f4ff)", fontWeight: "var(--font-weight-bold)", fontSize: "var(--font-size-sm)" }}>
                      <td colSpan={3} className="text-end"><strong>Total</strong></td>
                      <td></td>
                      <td className="text-end">{FMT(tot("taxableValue"))}</td>
                      <td></td>
                      <td className="text-end">{FMT(tot("gst"))}</td>
                    </tr>
                  </tfoot>
                </Table>
              </div>
            </Card.Body>
          </Card>

          {/* ── Summary table ── */}
          <Card className="mb-3">
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table bordered className="mb-0" style={{ fontSize: "var(--font-size-sm)" }}>
                  <thead>
                    <tr>
                      <th style={TH}>Head</th>
                      <th style={{ ...TH, textAlign: "right" }}>Rate</th>
                      <th style={{ ...TH, textAlign: "right" }}>Taxable Value (₹)</th>
                      <th style={{ ...TH, textAlign: "right" }}>CGST (₹)</th>
                      <th style={{ ...TH, textAlign: "right" }}>SGST (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaryRows.map((r, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f8f9fa" }}>
                        <td>{r.head}</td>
                        <td className="text-end">{FMT(r.rate)}</td>
                        <td className="text-end">{FMT(r.taxableValue)}</td>
                        <td className="text-end">{FMT(r.cgst)}</td>
                        <td className="text-end">{FMT(r.sgst)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={GRAND_TOTAL_ROW}>
                      <td><strong>Total</strong></td>
                      <td></td>
                      <td className="text-end"><strong>{FMT(sumTot("taxableValue"))}</strong></td>
                      <td className="text-end"><strong>{FMT(sumTot("cgst"))}</strong></td>
                      <td className="text-end"><strong>{FMT(sumTot("sgst"))}</strong></td>
                    </tr>
                  </tfoot>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </>
      )}
    </>
  );
}

// ═══════════════════════════════════════════
// Tab 5 – Rejection GST
// ═══════════════════════════════════════════

interface RejectionGstRow {
  slNo: number;
  returnNo: string;
  retDate: string;
  retrNo: string;
  gstin: string;
  state: string;
  dealerName: string;
  hsnCode: string;
  itemCode: string;
  itemName: string;
  taxableValue: number;
  gstRate: number;
  taxAmt: number;
  netAmt: number;
  grnReNo: string;
  phoneNo: string;
}

const REJECTION_GST_DEMO: RejectionGstRow[] = [
  { slNo: 1, returnNo: "RET-2026-001", retDate: "25-02-2026", retrNo: "RETR-101", gstin: "33AAAAA0000A1Z5", state: "Tamil Nadu",  dealerName: "APEX PHARMA DIST",    hsnCode: "3004", itemCode: "ITM-0041", itemName: "Amoxicillin 500mg",    taxableValue: 3200.00, gstRate: 12, taxAmt: 384.00, netAmt: 3584.00, grnReNo: "GRN-2026-0210", phoneNo: "9876543210" },
  { slNo: 2, returnNo: "RET-2026-002", retDate: "26-02-2026", retrNo: "RETR-102", gstin: "33BBBBB1111B2Z6", state: "Tamil Nadu",  dealerName: "SUNDARAM MEDICAL",     hsnCode: "3004", itemCode: "ITM-0085", itemName: "Paracetamol 650mg",   taxableValue: 1800.00, gstRate:  5, taxAmt:  90.00, netAmt: 1890.00, grnReNo: "GRN-2026-0215", phoneNo: "9845123670" },
  { slNo: 3, returnNo: "RET-2026-003", retDate: "28-02-2026", retrNo: "RETR-103", gstin: "33CCCCC2222C3Z7", state: "Tamil Nadu",  dealerName: "ROYAL DRUG HOUSE",     hsnCode: "3004", itemCode: "ITM-0120", itemName: "Metformin 500mg",     taxableValue: 2450.00, gstRate:  5, taxAmt: 122.50, netAmt: 2572.50, grnReNo: "GRN-2026-0220", phoneNo: "9600001234" },
  { slNo: 4, returnNo: "RET-2026-004", retDate: "05-03-2026", retrNo: "RETR-104", gstin: "33DDDDD3333D4Z8", state: "Pondicherry", dealerName: "CARING HEALTH SUPPLY", hsnCode: "3002", itemCode: "ITM-0203", itemName: "Insulin Human 40IU",  taxableValue: 5600.00, gstRate: 12, taxAmt: 672.00, netAmt: 6272.00, grnReNo: "GRN-2026-0230", phoneNo: "9443221100" },
  { slNo: 5, returnNo: "RET-2026-005", retDate: "10-03-2026", retrNo: "RETR-105", gstin: "33EEEEE4444E5Z9", state: "Tamil Nadu",  dealerName: "MEDLINE DISTRIBUTORS", hsnCode: "3004", itemCode: "ITM-0310", itemName: "Atorvastatin 10mg",  taxableValue: 4100.00, gstRate: 12, taxAmt: 492.00, netAmt: 4592.00, grnReNo: "GRN-2026-0241", phoneNo: "9751234560" },
];

function RejectionGstTab() {
  const today = new Date().toISOString().split("T")[0];
  const [fromDate, setFromDate] = useState(today.slice(0, 7) + "-01");
  const [toDate, setToDate] = useState(today);
  const [rows, setRows] = useState<RejectionGstRow[]>([]);
  const [searched, setSearched] = useState(false);

  const { filteredData, searchTerm, setSearchTerm, resultCount, totalCount } =
    useTableSearch({ data: rows, searchFields: ["returnNo", "retrNo", "gstin", "state", "dealerName", "hsnCode", "itemCode", "itemName", "grnReNo", "phoneNo"] });

  const tot = (key: keyof RejectionGstRow) =>
    filteredData.reduce((s, r) => s + (r[key] as number), 0);

  return (
    <>
      <DateFilter
        fromDate={fromDate} toDate={toDate}
        onFromChange={setFromDate} onToChange={setToDate}
        onSearch={() => { setRows(REJECTION_GST_DEMO); setSearched(true); }}
      />
      {searched && (
        <Card className="mb-3">
          <Card.Header className="d-flex align-items-center justify-content-between py-2"
            style={{ background: "var(--color-primary, #0d6efd)", color: "#fff" }}>
            <strong style={{ fontSize: "var(--font-size-sm)" }}>
              Rejection GST — {formatReportDate(fromDate)} to {formatReportDate(toDate)}
            </strong>
            <SearchInput searchTerm={searchTerm} onSearchChange={setSearchTerm}
              placeholder="Search dealer, GSTIN, item..." resultCount={resultCount} totalCount={totalCount} />
          </Card.Header>
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table bordered hover className="mb-0" style={{ fontSize: "var(--font-size-sm)" }}>
                <thead>
                  <tr>
                    <th style={{ ...TH, width: 50 }}>SL.NO</th>
                    <th style={TH}>Return No</th>
                    <th style={TH}>Ret. Date</th>
                    <th style={TH}>Retr. No</th>
                    <th style={TH}>GSTIN</th>
                    <th style={TH}>State</th>
                    <th style={TH}>Dealer Name</th>
                    <th style={TH}>HSN Code</th>
                    <th style={TH}>Item Code</th>
                    <th style={TH}>Item Name</th>
                    <th style={{ ...TH, textAlign: "right" }}>Taxable Value (₹)</th>
                    <th style={{ ...TH, textAlign: "right" }}>GST Rate (%)</th>
                    <th style={{ ...TH, textAlign: "right" }}>Tax Amt (₹)</th>
                    <th style={{ ...TH, textAlign: "right" }}>NET Amt (₹)</th>
                    <th style={TH}>GRNRE No</th>
                    <th style={TH}>Phone No</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((r, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f8f9fa" }}>
                      <td className="text-center">{r.slNo}</td>
                      <td>{r.returnNo}</td>
                      <td>{r.retDate}</td>
                      <td>{r.retrNo}</td>
                      <td>{r.gstin}</td>
                      <td>{r.state}</td>
                      <td>{r.dealerName}</td>
                      <td>{r.hsnCode}</td>
                      <td>{r.itemCode}</td>
                      <td>{r.itemName}</td>
                      <td className="text-end">{FMT(r.taxableValue)}</td>
                      <td className="text-end">{FMT(r.gstRate)}</td>
                      <td className="text-end">{FMT(r.taxAmt)}</td>
                      <td className="text-end">{FMT(r.netAmt)}</td>
                      <td>{r.grnReNo}</td>
                      <td>{r.phoneNo}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background: "var(--color-secondary-bg, #f0f4ff)", fontWeight: "var(--font-weight-bold)", fontSize: "var(--font-size-sm)" }}>
                    <td colSpan={10} className="text-end"><strong>{filteredData.length} records</strong></td>
                    <td className="text-end">{FMT(tot("taxableValue"))}</td>
                    <td></td>
                    <td className="text-end">{FMT(tot("taxAmt"))}</td>
                    <td className="text-end">{FMT(tot("netAmt"))}</td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}
    </>
  );
}

// ═══════════════════════════════════════════
// Tab 6 – GSTR Consolidate  (4 sub-tabs)
// ═══════════════════════════════════════════

// Shared summary row
interface ConsolidateSummaryRow {
  rate: string;
  taxableValue: number;
  cgst: number;
  sgst: number;
  total: number;
}

// ── 6a: Sales ──────────────────────────────
interface ConsolidateSalesRow {
  date: string;
  billStart: string;
  billEnd: string;
  totalBills: number;
  tax0Taxable: number; tax0Amt: number;
  tax5Taxable: number; tax5Amt: number;
  tax12Taxable: number; tax12Amt: number;
  tax18Taxable: number; tax18Amt: number;
  total: number;
  roundOff: number;
}

const CONSOLIDATE_SALES_DEMO: ConsolidateSalesRow[] = [
  { date: "01-03-2026", billStart: "PB-5100", billEnd: "PB-5118", totalBills: 19,  tax0Taxable: 1200.00, tax0Amt: 0.00, tax5Taxable:  8400.00, tax5Amt:  420.00, tax12Taxable: 11200.00, tax12Amt: 1344.00, tax18Taxable:  5800.00, tax18Amt: 1044.00, total: 29408.00, roundOff: 0.00 },
  { date: "05-03-2026", billStart: "PB-5119", billEnd: "PB-5134", totalBills: 16,  tax0Taxable:  980.00, tax0Amt: 0.00, tax5Taxable:  7200.00, tax5Amt:  360.00, tax12Taxable:  9800.00, tax12Amt: 1176.00, tax18Taxable:  4900.00, tax18Amt:  882.00, total: 25298.00, roundOff: 0.00 },
  { date: "10-03-2026", billStart: "PB-5135", billEnd: "PB-5152", totalBills: 18,  tax0Taxable: 1100.00, tax0Amt: 0.00, tax5Taxable:  9100.00, tax5Amt:  455.00, tax12Taxable: 13500.00, tax12Amt: 1620.00, tax18Taxable:  7200.00, tax18Amt: 1296.00, total: 34271.00, roundOff: 0.00 },
  { date: "14-03-2026", billStart: "PB-5153", billEnd: "PB-5164", totalBills: 12,  tax0Taxable:  850.00, tax0Amt: 0.00, tax5Taxable:  6800.00, tax5Amt:  340.00, tax12Taxable:  8900.00, tax12Amt: 1068.00, tax18Taxable:  4100.00, tax18Amt:  738.00, total: 22796.00, roundOff: 0.00 },
];

const CONSOLIDATE_SALES_SUMMARY: ConsolidateSummaryRow[] = [
  { rate: "0",  taxableValue:  4130.00, cgst:    0.00, sgst:    0.00, total:  4130.00 },
  { rate: "5",  taxableValue: 31500.00, cgst:  787.50, sgst:  787.50, total: 33075.00 },
  { rate: "12", taxableValue: 43400.00, cgst: 2604.00, sgst: 2604.00, total: 48608.00 },
  { rate: "18", taxableValue: 22000.00, cgst: 1980.00, sgst: 1980.00, total: 25960.00 },
];

// ── 6b: Separate Sales ─────────────────────
interface ConsolidateSepSalesRow {
  date: string;
  ipBillStart: string; ipBillEnd: string; ipBillTot: number;
  opBillStart: string; opBillEnd: string; opBillTot: number;
  totalBills: number;
  tax0Taxable: number; tax0Amt: number;
  tax5Taxable: number; tax5Amt: number;
  tax12Taxable: number; tax12Amt: number;
  tax18Taxable: number; tax18Amt: number;
  total: number;
  roundOff: number;
}

const CONSOLIDATE_SEP_SALES_DEMO: ConsolidateSepSalesRow[] = [
  { date: "01-03-2026", ipBillStart: "PB-5100", ipBillEnd: "PB-5109", ipBillTot: 10, opBillStart: "PB-5110", opBillEnd: "PB-5118", opBillTot:  9, totalBills: 19,  tax0Taxable: 1200.00, tax0Amt: 0.00, tax5Taxable:  8400.00, tax5Amt:  420.00, tax12Taxable: 11200.00, tax12Amt: 1344.00, tax18Taxable:  5800.00, tax18Amt: 1044.00, total: 29408.00, roundOff: 0.00 },
  { date: "05-03-2026", ipBillStart: "PB-5119", ipBillEnd: "PB-5127", ipBillTot:  9, opBillStart: "PB-5128", opBillEnd: "PB-5134", opBillTot:  7, totalBills: 16,  tax0Taxable:  980.00, tax0Amt: 0.00, tax5Taxable:  7200.00, tax5Amt:  360.00, tax12Taxable:  9800.00, tax12Amt: 1176.00, tax18Taxable:  4900.00, tax18Amt:  882.00, total: 25298.00, roundOff: 0.00 },
  { date: "10-03-2026", ipBillStart: "PB-5135", ipBillEnd: "PB-5143", ipBillTot:  9, opBillStart: "PB-5144", opBillEnd: "PB-5152", opBillTot:  9, totalBills: 18,  tax0Taxable: 1100.00, tax0Amt: 0.00, tax5Taxable:  9100.00, tax5Amt:  455.00, tax12Taxable: 13500.00, tax12Amt: 1620.00, tax18Taxable:  7200.00, tax18Amt: 1296.00, total: 34271.00, roundOff: 0.00 },
  { date: "14-03-2026", ipBillStart: "PB-5153", ipBillEnd: "PB-5158", ipBillTot:  6, opBillStart: "PB-5159", opBillEnd: "PB-5164", opBillTot:  6, totalBills: 12,  tax0Taxable:  850.00, tax0Amt: 0.00, tax5Taxable:  6800.00, tax5Amt:  340.00, tax12Taxable:  8900.00, tax12Amt: 1068.00, tax18Taxable:  4100.00, tax18Amt:  738.00, total: 22796.00, roundOff: 0.00 },
];

// ── 6c: Return ─────────────────────────────
interface ConsolidateReturnRow {
  date: string;
  billStart: string;
  billEnd: string;
  totalBills: number;
  tax0Taxable: number; tax0Amt: number;
  tax5Taxable: number; tax5Amt: number;
  tax12Taxable: number; tax12Amt: number;
  tax18Taxable: number; tax18Amt: number;
  total: number;
  roundOff: number;
}

const CONSOLIDATE_RETURN_DEMO: ConsolidateReturnRow[] = [
  { date: "03-03-2026", billStart: "PR-1080", billEnd: "PR-1083", totalBills: 4,  tax0Taxable: 0.00, tax0Amt: 0.00, tax5Taxable: 1200.00, tax5Amt:  60.00, tax12Taxable: 2400.00, tax12Amt: 288.00, tax18Taxable: 1100.00, tax18Amt: 198.00, total:  5246.00, roundOff: 0.00 },
  { date: "08-03-2026", billStart: "PR-1084", billEnd: "PR-1087", totalBills: 4,  tax0Taxable: 0.00, tax0Amt: 0.00, tax5Taxable:  900.00, tax5Amt:  45.00, tax12Taxable: 1800.00, tax12Amt: 216.00, tax18Taxable:  800.00, tax18Amt: 144.00, total:  3905.00, roundOff: 0.00 },
  { date: "12-03-2026", billStart: "PR-1088", billEnd: "PR-1091", totalBills: 4,  tax0Taxable: 0.00, tax0Amt: 0.00, tax5Taxable: 1500.00, tax5Amt:  75.00, tax12Taxable: 3200.00, tax12Amt: 384.00, tax18Taxable: 1500.00, tax18Amt: 270.00, total:  6929.00, roundOff: 0.00 },
];

const CONSOLIDATE_RETURN_SUMMARY: ConsolidateSummaryRow[] = [
  { rate: "5",  taxableValue: 3600.00, cgst:  90.00, sgst:  90.00, total:  3780.00 },
  { rate: "12", taxableValue: 7400.00, cgst: 444.00, sgst: 444.00, total:  8288.00 },
  { rate: "18", taxableValue: 3400.00, cgst: 306.00, sgst: 306.00, total:  4012.00 },
];

// ── 6d: Separate Return ────────────────────
interface ConsolidateSepReturnRow {
  date: string;
  ipBillStart: string; ipBillEnd: string; ipBillTot: number;
  opBillStart: string; opBillEnd: string; opBillTot: number;
  totalBills: number;
  tax0Taxable: number; tax0Amt: number;
  tax5Taxable: number; tax5Amt: number;
  tax12Taxable: number; tax12Amt: number;
  tax18Taxable: number; tax18Amt: number;
  total: number;
  roundOff: number;
}

const CONSOLIDATE_SEP_RETURN_DEMO: ConsolidateSepReturnRow[] = [
  { date: "03-03-2026", ipBillStart: "PR-1080", ipBillEnd: "PR-1081", ipBillTot: 2, opBillStart: "PR-1082", opBillEnd: "PR-1083", opBillTot: 2, totalBills: 4,  tax0Taxable: 0.00, tax0Amt: 0.00, tax5Taxable: 1200.00, tax5Amt:  60.00, tax12Taxable: 2400.00, tax12Amt: 288.00, tax18Taxable: 1100.00, tax18Amt: 198.00, total: 5246.00, roundOff: 0.00 },
  { date: "08-03-2026", ipBillStart: "PR-1084", ipBillEnd: "PR-1085", ipBillTot: 2, opBillStart: "PR-1086", opBillEnd: "PR-1087", opBillTot: 2, totalBills: 4,  tax0Taxable: 0.00, tax0Amt: 0.00, tax5Taxable:  900.00, tax5Amt:  45.00, tax12Taxable: 1800.00, tax12Amt: 216.00, tax18Taxable:  800.00, tax18Amt: 144.00, total: 3905.00, roundOff: 0.00 },
  { date: "12-03-2026", ipBillStart: "PR-1088", ipBillEnd: "PR-1089", ipBillTot: 2, opBillStart: "PR-1090", opBillEnd: "PR-1091", opBillTot: 2, totalBills: 4,  tax0Taxable: 0.00, tax0Amt: 0.00, tax5Taxable: 1500.00, tax5Amt:  75.00, tax12Taxable: 3200.00, tax12Amt: 384.00, tax18Taxable: 1500.00, tax18Amt: 270.00, total: 6929.00, roundOff: 0.00 },
];

// ── Sub-tab style helper ────────────────────
const SUB_NAV_STYLE = (active: boolean): React.CSSProperties => ({
  fontSize: "var(--font-size-sm)",
  fontWeight: active ? "var(--font-weight-semibold)" : "var(--font-weight-normal)",
  color: active ? "var(--color-primary, #0d6efd)" : "#555",
  background: active ? "#e8f0fe" : "transparent",
  borderRadius: "4px 4px 0 0",
  padding: "6px 14px",
  cursor: "pointer",
  borderBottom: active ? "2px solid var(--color-primary, #0d6efd)" : "none",
});

// helper: sum a numeric key across any array
const sumKey = <T,>(arr: T[], key: keyof T) => arr.reduce((s, r) => s + (r[key] as number), 0);

// summary table renderer
function SummaryTable({ rows }: { rows: ConsolidateSummaryRow[] }) {
  return (
    <div className="d-flex justify-content-center mt-3">
      <Table bordered className="mb-0" style={{ fontSize: "var(--font-size-sm)", width: "55%" }}>
        <thead>
          <tr>
            <th style={{ ...TH, textAlign: "right" }}>Rate (%)</th>
            <th style={{ ...TH, textAlign: "right" }}>Taxable Value (₹)</th>
            <th style={{ ...TH, textAlign: "right" }}>CGST (₹)</th>
            <th style={{ ...TH, textAlign: "right" }}>SGST (₹)</th>
            <th style={{ ...TH, textAlign: "right" }}>Total (₹)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f8f9fa" }}>
              <td className="text-end">{r.rate}</td>
              <td className="text-end">{FMT(r.taxableValue)}</td>
              <td className="text-end">{FMT(r.cgst)}</td>
              <td className="text-end">{FMT(r.sgst)}</td>
              <td className="text-end">{FMT(r.total)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={GRAND_TOTAL_ROW}>
            <td></td>
            <td className="text-end"><strong>{FMT(sumKey(rows, "taxableValue"))}</strong></td>
            <td className="text-end"><strong>{FMT(sumKey(rows, "cgst"))}</strong></td>
            <td className="text-end"><strong>{FMT(sumKey(rows, "sgst"))}</strong></td>
            <td className="text-end"><strong>{FMT(sumKey(rows, "total"))}</strong></td>
          </tr>
        </tfoot>
      </Table>
    </div>
  );
}

// ── GstrConsolidateTab ─────────────────────
function GstrConsolidateTab() {
  const [subTab, setSubTab] = useState<"sales" | "sepSales" | "return" | "sepReturn">("sales");

  const SUB_TABS: { key: typeof subTab; label: string }[] = [
    { key: "sales",     label: "Sales" },
    { key: "sepSales",  label: "Seperate Sales" },
    { key: "return",    label: "Return" },
    { key: "sepReturn", label: "Seperate Return" },
  ];

  return (
    <>
      {/* Sub-tab nav */}
      <Card className="mb-2">
        <Card.Body className="p-0">
          <Nav variant="tabs" style={{ borderBottom: "2px solid var(--color-primary, #0d6efd)", flexWrap: "wrap" }}>
            {SUB_TABS.map((t) => (
              <Nav.Item key={t.key}>
                <Nav.Link as="button" style={SUB_NAV_STYLE(subTab === t.key)} onClick={() => setSubTab(t.key)}>
                  {t.label}
                </Nav.Link>
              </Nav.Item>
            ))}
          </Nav>
        </Card.Body>
      </Card>

      {/* ── Sales ── */}
      {subTab === "sales" && (
        <Card className="mb-3">
          <Card.Header style={{ background: "var(--color-primary, #0d6efd)", color: "#fff" }}>
            <strong style={{ fontSize: "var(--font-size-sm)" }}>Consolidate Sales</strong>
          </Card.Header>
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table bordered className="mb-0" style={{ fontSize: "var(--font-size-xs)" }}>
                <thead>
                  <tr>
                    <th rowSpan={2} style={{ ...TH, textAlign: "center", verticalAlign: "middle" }}>Date</th>
                    <th colSpan={2} style={{ ...TH, textAlign: "center" }}>Bill No</th>
                    <th rowSpan={2} style={{ ...TH, textAlign: "right", verticalAlign: "middle" }}>Total Bills</th>
                    <th colSpan={2} style={{ ...TH, textAlign: "center" }}>0%</th>
                    <th colSpan={2} style={{ ...TH, textAlign: "center" }}>5%</th>
                    <th colSpan={2} style={{ ...TH, textAlign: "center" }}>12%</th>
                    <th colSpan={2} style={{ ...TH, textAlign: "center" }}>18%</th>
                    <th rowSpan={2} style={{ ...TH, textAlign: "right", verticalAlign: "middle" }}>Total</th>
                    <th rowSpan={2} style={{ ...TH, textAlign: "right", verticalAlign: "middle" }}>Round Off</th>
                  </tr>
                  <tr>
                    <th style={SUB_TH}>Start</th>
                    <th style={SUB_TH}>End</th>
                    <th style={{ ...SUB_TH, textAlign: "right" }}>Taxable</th>
                    <th style={{ ...SUB_TH, textAlign: "right" }}>Tax</th>
                    <th style={{ ...SUB_TH, textAlign: "right" }}>Taxable</th>
                    <th style={{ ...SUB_TH, textAlign: "right" }}>Tax</th>
                    <th style={{ ...SUB_TH, textAlign: "right" }}>Taxable</th>
                    <th style={{ ...SUB_TH, textAlign: "right" }}>Tax</th>
                    <th style={{ ...SUB_TH, textAlign: "right" }}>Taxable</th>
                    <th style={{ ...SUB_TH, textAlign: "right" }}>Tax</th>
                  </tr>
                </thead>
                <tbody>
                  {CONSOLIDATE_SALES_DEMO.map((r, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f8f9fa" }}>
                      <td className="text-center">{r.date}</td>
                      <td>{r.billStart}</td>
                      <td>{r.billEnd}</td>
                      <td className="text-end">{r.totalBills}</td>
                      <td className="text-end">{FMT(r.tax0Taxable)}</td>
                      <td className="text-end">{FMT(r.tax0Amt)}</td>
                      <td className="text-end">{FMT(r.tax5Taxable)}</td>
                      <td className="text-end">{FMT(r.tax5Amt)}</td>
                      <td className="text-end">{FMT(r.tax12Taxable)}</td>
                      <td className="text-end">{FMT(r.tax12Amt)}</td>
                      <td className="text-end">{FMT(r.tax18Taxable)}</td>
                      <td className="text-end">{FMT(r.tax18Amt)}</td>
                      <td className="text-end fw-semibold">{FMT(r.total)}</td>
                      <td className="text-end">{FMT(r.roundOff)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={GRAND_TOTAL_ROW}>
                    <td><strong>Total</strong></td>
                    <td></td><td></td>
                    <td className="text-end"><strong>{sumKey(CONSOLIDATE_SALES_DEMO, "totalBills")}</strong></td>
                    <td className="text-end"><strong>{FMT(sumKey(CONSOLIDATE_SALES_DEMO, "tax0Taxable"))}</strong></td>
                    <td className="text-end"><strong>{FMT(sumKey(CONSOLIDATE_SALES_DEMO, "tax0Amt"))}</strong></td>
                    <td className="text-end"><strong>{FMT(sumKey(CONSOLIDATE_SALES_DEMO, "tax5Taxable"))}</strong></td>
                    <td className="text-end"><strong>{FMT(sumKey(CONSOLIDATE_SALES_DEMO, "tax5Amt"))}</strong></td>
                    <td className="text-end"><strong>{FMT(sumKey(CONSOLIDATE_SALES_DEMO, "tax12Taxable"))}</strong></td>
                    <td className="text-end"><strong>{FMT(sumKey(CONSOLIDATE_SALES_DEMO, "tax12Amt"))}</strong></td>
                    <td className="text-end"><strong>{FMT(sumKey(CONSOLIDATE_SALES_DEMO, "tax18Taxable"))}</strong></td>
                    <td className="text-end"><strong>{FMT(sumKey(CONSOLIDATE_SALES_DEMO, "tax18Amt"))}</strong></td>
                    <td className="text-end"><strong>{FMT(sumKey(CONSOLIDATE_SALES_DEMO, "total"))}</strong></td>
                    <td className="text-end"><strong>{FMT(sumKey(CONSOLIDATE_SALES_DEMO, "roundOff"))}</strong></td>
                  </tr>
                </tfoot>
              </Table>
            </div>
            <SummaryTable rows={CONSOLIDATE_SALES_SUMMARY} />
          </Card.Body>
        </Card>
      )}

      {/* ── Separate Sales ── */}
      {subTab === "sepSales" && (
        <Card className="mb-3">
          <Card.Header style={{ background: "var(--color-primary, #0d6efd)", color: "#fff" }}>
            <strong style={{ fontSize: "var(--font-size-sm)" }}>Separate Sales</strong>
          </Card.Header>
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table bordered className="mb-0" style={{ fontSize: "var(--font-size-xs)" }}>
                <thead>
                  <tr>
                    <th rowSpan={2} style={{ ...TH, textAlign: "center", verticalAlign: "middle" }}>Date</th>
                    <th colSpan={6} style={{ ...TH, textAlign: "center" }}>Bill No</th>
                    <th rowSpan={2} style={{ ...TH, textAlign: "right", verticalAlign: "middle" }}>Total Bills</th>
                    <th colSpan={2} style={{ ...TH, textAlign: "center" }}>0%</th>
                    <th colSpan={2} style={{ ...TH, textAlign: "center" }}>5%</th>
                    <th colSpan={2} style={{ ...TH, textAlign: "center" }}>12%</th>
                    <th colSpan={2} style={{ ...TH, textAlign: "center" }}>18%</th>
                    <th rowSpan={2} style={{ ...TH, textAlign: "right", verticalAlign: "middle" }}>Total</th>
                    <th rowSpan={2} style={{ ...TH, textAlign: "right", verticalAlign: "middle" }}>Round Off</th>
                  </tr>
                  <tr>
                    <th style={SUB_TH}>Start IP</th>
                    <th style={SUB_TH}>End IP</th>
                    <th style={{ ...SUB_TH, textAlign: "right" }}>IP Tot</th>
                    <th style={SUB_TH}>Start OP</th>
                    <th style={SUB_TH}>End OP</th>
                    <th style={{ ...SUB_TH, textAlign: "right" }}>OP Tot</th>
                    <th style={{ ...SUB_TH, textAlign: "right" }}>Taxable</th>
                    <th style={{ ...SUB_TH, textAlign: "right" }}>Tax</th>
                    <th style={{ ...SUB_TH, textAlign: "right" }}>Taxable</th>
                    <th style={{ ...SUB_TH, textAlign: "right" }}>Tax</th>
                    <th style={{ ...SUB_TH, textAlign: "right" }}>Taxable</th>
                    <th style={{ ...SUB_TH, textAlign: "right" }}>Tax</th>
                    <th style={{ ...SUB_TH, textAlign: "right" }}>Taxable</th>
                    <th style={{ ...SUB_TH, textAlign: "right" }}>Tax</th>
                  </tr>
                </thead>
                <tbody>
                  {CONSOLIDATE_SEP_SALES_DEMO.map((r, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f8f9fa" }}>
                      <td className="text-center">{r.date}</td>
                      <td>{r.ipBillStart}</td>
                      <td>{r.ipBillEnd}</td>
                      <td className="text-end">{r.ipBillTot}</td>
                      <td>{r.opBillStart}</td>
                      <td>{r.opBillEnd}</td>
                      <td className="text-end">{r.opBillTot}</td>
                      <td className="text-end">{r.totalBills}</td>
                      <td className="text-end">{FMT(r.tax0Taxable)}</td>
                      <td className="text-end">{FMT(r.tax0Amt)}</td>
                      <td className="text-end">{FMT(r.tax5Taxable)}</td>
                      <td className="text-end">{FMT(r.tax5Amt)}</td>
                      <td className="text-end">{FMT(r.tax12Taxable)}</td>
                      <td className="text-end">{FMT(r.tax12Amt)}</td>
                      <td className="text-end">{FMT(r.tax18Taxable)}</td>
                      <td className="text-end">{FMT(r.tax18Amt)}</td>
                      <td className="text-end fw-semibold">{FMT(r.total)}</td>
                      <td className="text-end">{FMT(r.roundOff)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={GRAND_TOTAL_ROW}>
                    <td><strong>Total</strong></td>
                    <td></td><td></td><td></td><td></td><td></td><td></td>
                    <td className="text-end"><strong>{sumKey(CONSOLIDATE_SEP_SALES_DEMO, "totalBills")}</strong></td>
                    <td className="text-end"><strong>{FMT(sumKey(CONSOLIDATE_SEP_SALES_DEMO, "tax0Taxable"))}</strong></td>
                    <td className="text-end"><strong>{FMT(sumKey(CONSOLIDATE_SEP_SALES_DEMO, "tax0Amt"))}</strong></td>
                    <td className="text-end"><strong>{FMT(sumKey(CONSOLIDATE_SEP_SALES_DEMO, "tax5Taxable"))}</strong></td>
                    <td className="text-end"><strong>{FMT(sumKey(CONSOLIDATE_SEP_SALES_DEMO, "tax5Amt"))}</strong></td>
                    <td className="text-end"><strong>{FMT(sumKey(CONSOLIDATE_SEP_SALES_DEMO, "tax12Taxable"))}</strong></td>
                    <td className="text-end"><strong>{FMT(sumKey(CONSOLIDATE_SEP_SALES_DEMO, "tax12Amt"))}</strong></td>
                    <td className="text-end"><strong>{FMT(sumKey(CONSOLIDATE_SEP_SALES_DEMO, "tax18Taxable"))}</strong></td>
                    <td className="text-end"><strong>{FMT(sumKey(CONSOLIDATE_SEP_SALES_DEMO, "tax18Amt"))}</strong></td>
                    <td className="text-end"><strong>{FMT(sumKey(CONSOLIDATE_SEP_SALES_DEMO, "total"))}</strong></td>
                    <td className="text-end"><strong>{FMT(sumKey(CONSOLIDATE_SEP_SALES_DEMO, "roundOff"))}</strong></td>
                  </tr>
                </tfoot>
              </Table>
            </div>
            <SummaryTable rows={CONSOLIDATE_SALES_SUMMARY} />
          </Card.Body>
        </Card>
      )}

      {/* ── Return ── */}
      {subTab === "return" && (
        <Card className="mb-3">
          <Card.Header style={{ background: "var(--color-primary, #0d6efd)", color: "#fff" }}>
            <strong style={{ fontSize: "var(--font-size-sm)" }}>Consolidate Return</strong>
          </Card.Header>
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table bordered className="mb-0" style={{ fontSize: "var(--font-size-xs)" }}>
                <thead>
                  <tr>
                    <th rowSpan={2} style={{ ...TH, textAlign: "center", verticalAlign: "middle" }}>Date</th>
                    <th colSpan={2} style={{ ...TH, textAlign: "center" }}>Bill No</th>
                    <th rowSpan={2} style={{ ...TH, textAlign: "right", verticalAlign: "middle" }}>Total Bills</th>
                    <th colSpan={2} style={{ ...TH, textAlign: "center" }}>0%</th>
                    <th colSpan={2} style={{ ...TH, textAlign: "center" }}>5%</th>
                    <th colSpan={2} style={{ ...TH, textAlign: "center" }}>12%</th>
                    <th colSpan={2} style={{ ...TH, textAlign: "center" }}>18%</th>
                    <th rowSpan={2} style={{ ...TH, textAlign: "right", verticalAlign: "middle" }}>Total</th>
                    <th rowSpan={2} style={{ ...TH, textAlign: "right", verticalAlign: "middle" }}>Round Off</th>
                  </tr>
                  <tr>
                    <th style={SUB_TH}>Start</th>
                    <th style={SUB_TH}>End</th>
                    <th style={{ ...SUB_TH, textAlign: "right" }}>Taxable</th>
                    <th style={{ ...SUB_TH, textAlign: "right" }}>Tax</th>
                    <th style={{ ...SUB_TH, textAlign: "right" }}>Taxable</th>
                    <th style={{ ...SUB_TH, textAlign: "right" }}>Tax</th>
                    <th style={{ ...SUB_TH, textAlign: "right" }}>Taxable</th>
                    <th style={{ ...SUB_TH, textAlign: "right" }}>Tax</th>
                    <th style={{ ...SUB_TH, textAlign: "right" }}>Taxable</th>
                    <th style={{ ...SUB_TH, textAlign: "right" }}>Tax</th>
                  </tr>
                </thead>
                <tbody>
                  {CONSOLIDATE_RETURN_DEMO.map((r, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f8f9fa" }}>
                      <td className="text-center">{r.date}</td>
                      <td>{r.billStart}</td>
                      <td>{r.billEnd}</td>
                      <td className="text-end">{r.totalBills}</td>
                      <td className="text-end">{FMT(r.tax0Taxable)}</td>
                      <td className="text-end">{FMT(r.tax0Amt)}</td>
                      <td className="text-end">{FMT(r.tax5Taxable)}</td>
                      <td className="text-end">{FMT(r.tax5Amt)}</td>
                      <td className="text-end">{FMT(r.tax12Taxable)}</td>
                      <td className="text-end">{FMT(r.tax12Amt)}</td>
                      <td className="text-end">{FMT(r.tax18Taxable)}</td>
                      <td className="text-end">{FMT(r.tax18Amt)}</td>
                      <td className="text-end fw-semibold">{FMT(r.total)}</td>
                      <td className="text-end">{FMT(r.roundOff)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={GRAND_TOTAL_ROW}>
                    <td><strong>Total</strong></td>
                    <td></td><td></td>
                    <td className="text-end"><strong>{sumKey(CONSOLIDATE_RETURN_DEMO, "totalBills")}</strong></td>
                    <td className="text-end"><strong>{FMT(sumKey(CONSOLIDATE_RETURN_DEMO, "tax0Taxable"))}</strong></td>
                    <td className="text-end"><strong>{FMT(sumKey(CONSOLIDATE_RETURN_DEMO, "tax0Amt"))}</strong></td>
                    <td className="text-end"><strong>{FMT(sumKey(CONSOLIDATE_RETURN_DEMO, "tax5Taxable"))}</strong></td>
                    <td className="text-end"><strong>{FMT(sumKey(CONSOLIDATE_RETURN_DEMO, "tax5Amt"))}</strong></td>
                    <td className="text-end"><strong>{FMT(sumKey(CONSOLIDATE_RETURN_DEMO, "tax12Taxable"))}</strong></td>
                    <td className="text-end"><strong>{FMT(sumKey(CONSOLIDATE_RETURN_DEMO, "tax12Amt"))}</strong></td>
                    <td className="text-end"><strong>{FMT(sumKey(CONSOLIDATE_RETURN_DEMO, "tax18Taxable"))}</strong></td>
                    <td className="text-end"><strong>{FMT(sumKey(CONSOLIDATE_RETURN_DEMO, "tax18Amt"))}</strong></td>
                    <td className="text-end"><strong>{FMT(sumKey(CONSOLIDATE_RETURN_DEMO, "total"))}</strong></td>
                    <td className="text-end"><strong>{FMT(sumKey(CONSOLIDATE_RETURN_DEMO, "roundOff"))}</strong></td>
                  </tr>
                </tfoot>
              </Table>
            </div>
            <SummaryTable rows={CONSOLIDATE_RETURN_SUMMARY} />
          </Card.Body>
        </Card>
      )}

      {/* ── Separate Return ── */}
      {subTab === "sepReturn" && (
        <Card className="mb-3">
          <Card.Header style={{ background: "var(--color-primary, #0d6efd)", color: "#fff" }}>
            <strong style={{ fontSize: "var(--font-size-sm)" }}>Separate Return</strong>
          </Card.Header>
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table bordered className="mb-0" style={{ fontSize: "var(--font-size-xs)" }}>
                <thead>
                  <tr>
                    <th rowSpan={2} style={{ ...TH, textAlign: "center", verticalAlign: "middle" }}>Date</th>
                    <th colSpan={6} style={{ ...TH, textAlign: "center" }}>Bill No</th>
                    <th rowSpan={2} style={{ ...TH, textAlign: "right", verticalAlign: "middle" }}>Total Bills</th>
                    <th colSpan={2} style={{ ...TH, textAlign: "center" }}>0%</th>
                    <th colSpan={2} style={{ ...TH, textAlign: "center" }}>5%</th>
                    <th colSpan={2} style={{ ...TH, textAlign: "center" }}>12%</th>
                    <th colSpan={2} style={{ ...TH, textAlign: "center" }}>18%</th>
                    <th rowSpan={2} style={{ ...TH, textAlign: "right", verticalAlign: "middle" }}>Total</th>
                    <th rowSpan={2} style={{ ...TH, textAlign: "right", verticalAlign: "middle" }}>Round Off</th>
                  </tr>
                  <tr>
                    <th style={SUB_TH}>Start IP</th>
                    <th style={SUB_TH}>End IP</th>
                    <th style={{ ...SUB_TH, textAlign: "right" }}>IP Tot</th>
                    <th style={SUB_TH}>Start OP</th>
                    <th style={SUB_TH}>End OP</th>
                    <th style={{ ...SUB_TH, textAlign: "right" }}>OP Tot</th>
                    <th style={{ ...SUB_TH, textAlign: "right" }}>Taxable</th>
                    <th style={{ ...SUB_TH, textAlign: "right" }}>Tax</th>
                    <th style={{ ...SUB_TH, textAlign: "right" }}>Taxable</th>
                    <th style={{ ...SUB_TH, textAlign: "right" }}>Tax</th>
                    <th style={{ ...SUB_TH, textAlign: "right" }}>Taxable</th>
                    <th style={{ ...SUB_TH, textAlign: "right" }}>Tax</th>
                    <th style={{ ...SUB_TH, textAlign: "right" }}>Taxable</th>
                    <th style={{ ...SUB_TH, textAlign: "right" }}>Tax</th>
                  </tr>
                </thead>
                <tbody>
                  {CONSOLIDATE_SEP_RETURN_DEMO.map((r, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f8f9fa" }}>
                      <td className="text-center">{r.date}</td>
                      <td>{r.ipBillStart}</td>
                      <td>{r.ipBillEnd}</td>
                      <td className="text-end">{r.ipBillTot}</td>
                      <td>{r.opBillStart}</td>
                      <td>{r.opBillEnd}</td>
                      <td className="text-end">{r.opBillTot}</td>
                      <td className="text-end">{r.totalBills}</td>
                      <td className="text-end">{FMT(r.tax0Taxable)}</td>
                      <td className="text-end">{FMT(r.tax0Amt)}</td>
                      <td className="text-end">{FMT(r.tax5Taxable)}</td>
                      <td className="text-end">{FMT(r.tax5Amt)}</td>
                      <td className="text-end">{FMT(r.tax12Taxable)}</td>
                      <td className="text-end">{FMT(r.tax12Amt)}</td>
                      <td className="text-end">{FMT(r.tax18Taxable)}</td>
                      <td className="text-end">{FMT(r.tax18Amt)}</td>
                      <td className="text-end fw-semibold">{FMT(r.total)}</td>
                      <td className="text-end">{FMT(r.roundOff)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={GRAND_TOTAL_ROW}>
                    <td><strong>Total</strong></td>
                    <td></td><td></td><td></td><td></td><td></td><td></td>
                    <td className="text-end"><strong>{sumKey(CONSOLIDATE_SEP_RETURN_DEMO, "totalBills")}</strong></td>
                    <td className="text-end"><strong>{FMT(sumKey(CONSOLIDATE_SEP_RETURN_DEMO, "tax0Taxable"))}</strong></td>
                    <td className="text-end"><strong>{FMT(sumKey(CONSOLIDATE_SEP_RETURN_DEMO, "tax0Amt"))}</strong></td>
                    <td className="text-end"><strong>{FMT(sumKey(CONSOLIDATE_SEP_RETURN_DEMO, "tax5Taxable"))}</strong></td>
                    <td className="text-end"><strong>{FMT(sumKey(CONSOLIDATE_SEP_RETURN_DEMO, "tax5Amt"))}</strong></td>
                    <td className="text-end"><strong>{FMT(sumKey(CONSOLIDATE_SEP_RETURN_DEMO, "tax12Taxable"))}</strong></td>
                    <td className="text-end"><strong>{FMT(sumKey(CONSOLIDATE_SEP_RETURN_DEMO, "tax12Amt"))}</strong></td>
                    <td className="text-end"><strong>{FMT(sumKey(CONSOLIDATE_SEP_RETURN_DEMO, "tax18Taxable"))}</strong></td>
                    <td className="text-end"><strong>{FMT(sumKey(CONSOLIDATE_SEP_RETURN_DEMO, "tax18Amt"))}</strong></td>
                    <td className="text-end"><strong>{FMT(sumKey(CONSOLIDATE_SEP_RETURN_DEMO, "total"))}</strong></td>
                    <td className="text-end"><strong>{FMT(sumKey(CONSOLIDATE_SEP_RETURN_DEMO, "roundOff"))}</strong></td>
                  </tr>
                </tfoot>
              </Table>
            </div>
            <SummaryTable rows={CONSOLIDATE_RETURN_SUMMARY} />
          </Card.Body>
        </Card>
      )}
    </>
  );
}

// ═══════════════════════════════════════════
// Main component
// ═══════════════════════════════════════════

const TABS = [
  { key: "gstr3b", label: "GSTR 3B" },
  { key: "billwiseSales", label: "Billwise Sales" },
  { key: "billwiseSalesReturn", label: "Billwise Sales Return" },
  { key: "ipExempted", label: "IP Exempted" },
  { key: "rejectionGst", label: "Rejection GST" },
  { key: "gstrConsolidate", label: "GSTR Consolidate" },
];

export default function PhGstrDetails() {
  const [activeTab, setActiveTab] = useState("gstr3b");

  return (
    <Container fluid className="report-container">
      <ReportHeader
        title="Pharmacy GSTR Details"
        subtitle="GST reports — GSTR 3B, Billwise Sales, Returns, IP Exempted, Rejected & Consolidate"
        onPrint={() => printReport()}
        onExport={() => {}}
      />

      <Tab.Container activeKey={activeTab} onSelect={(k) => k && setActiveTab(k)}>
        {/* Tab navigation */}
        <Card className="mb-3">
          <Card.Body className="p-0">
            <Nav
              variant="tabs"
              style={{
                borderBottom: "2px solid var(--color-primary, #0d6efd)",
                flexWrap: "wrap",
              }}
            >
              {TABS.map((tab) => (
                <Nav.Item key={tab.key}>
                  <Nav.Link
                    eventKey={tab.key}
                    style={{
                      fontSize: "var(--font-size-sm)",
                      fontWeight:
                        activeTab === tab.key
                          ? "var(--font-weight-semibold)"
                          : "var(--font-weight-normal)",
                      color:
                        activeTab === tab.key
                          ? "var(--color-primary, #0d6efd)"
                          : "#555",
                      borderBottom:
                        activeTab === tab.key
                          ? "2px solid var(--color-primary, #0d6efd)"
                          : "none",
                      background: activeTab === tab.key ? "#f0f4ff" : "transparent",
                      borderRadius: "4px 4px 0 0",
                      padding: "8px 16px",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {tab.label}
                  </Nav.Link>
                </Nav.Item>
              ))}
            </Nav>
          </Card.Body>
        </Card>

        {/* Tab content */}
        <Tab.Content>
          <Tab.Pane eventKey="gstr3b"><Gstr3BTab /></Tab.Pane>
          <Tab.Pane eventKey="billwiseSales"><BillwiseSalesTab /></Tab.Pane>
          <Tab.Pane eventKey="billwiseSalesReturn"><BillwiseSalesReturnTab /></Tab.Pane>
          <Tab.Pane eventKey="ipExempted"><IpExemptedTab /></Tab.Pane>
          <Tab.Pane eventKey="rejectionGst"><RejectionGstTab /></Tab.Pane>
          <Tab.Pane eventKey="gstrConsolidate"><GstrConsolidateTab /></Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </Container>
  );
}

