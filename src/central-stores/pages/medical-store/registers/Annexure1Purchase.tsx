import React, { useState, useMemo } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Row,
  Col,
  Badge,
} from "react-bootstrap";
import ReportHeader from "../../../../medical-records/components/ReportHeader";
import ReportKPICard from "../../../../medical-records/components/ReportKPICard";
import ReportTable from "../../../../medical-records/components/ReportTable";
import {
  sortTableData,
  exportToExcel,
  printReport,
  formatReportDate,
  getDateRangeText,
} from "../../../../medical-records/utils/reportUtils";
import "../../../../medical-records/styles/reportStyles.css";

// ─── Demo Data ────────────────────────────────────────────────────────────────
const DEMO_PURCHASES = [
  { id: 1,  sellerName: "Sun Pharma Distributors",   sellerTin: "29AABCS1429C1Z4", commCode: "2044", invNo: "INV-1001", invDate: "05/01/2026", totalValue: 12500.00, taxPct: 5.00 },
  { id: 2,  sellerName: "Cipla Wholesale Pvt Ltd",   sellerTin: "29AABCC1681G1Z6", commCode: "2044", invNo: "INV-1002", invDate: "07/01/2026", totalValue: 8200.00,  taxPct: 12.00 },
  { id: 3,  sellerName: "MedLine Distributors",      sellerTin: "27AAECM2342C1ZF", commCode: "2044", invNo: "INV-1003", invDate: "10/01/2026", totalValue: 3400.00,  taxPct: 0.00 },
  { id: 4,  sellerName: "HealthPlus Traders",        sellerTin: "33AABHH4873K1ZY", commCode: "2044", invNo: "INV-1004", invDate: "12/01/2026", totalValue: 9750.00,  taxPct: 18.00 },
  { id: 5,  sellerName: "Dr. Reddy's Distribution",  sellerTin: "36AAACD1234F1ZP", commCode: "2044", invNo: "INV-1005", invDate: "15/01/2026", totalValue: 6600.00,  taxPct: 5.00 },
  { id: 6,  sellerName: "Global Med Supplies",       sellerTin: "22AABCG5671A1ZM", commCode: "2044", invNo: "INV-1006", invDate: "18/01/2026", totalValue: 5100.00,  taxPct: 12.00 },
  { id: 7,  sellerName: "Zydus Distributors",        sellerTin: "24AAECZ1823C1Z7", commCode: "2044", invNo: "INV-1007", invDate: "20/01/2026", totalValue: 14200.00, taxPct: 18.00 },
  { id: 8,  sellerName: "PharmaCare Pvt Ltd",        sellerTin: "32AABCP7231B1ZQ", commCode: "2044", invNo: "INV-1008", invDate: "22/01/2026", totalValue: 2800.00,  taxPct: 0.00 },
  { id: 9,  sellerName: "Alkem Wholesale",            sellerTin: "10AAAECA1234D1ZB", commCode: "2044", invNo: "INV-1009", invDate: "25/01/2026", totalValue: 7350.00,  taxPct: 5.00 },
  { id: 10, sellerName: "USV Medimart",               sellerTin: "27AABCU8541H1ZK", commCode: "2044", invNo: "INV-1010", invDate: "28/01/2026", totalValue: 4900.00,  taxPct: 12.00 },
  { id: 11, sellerName: "SurgMed Distributors",       sellerTin: "29AABCS9231D1ZT", commCode: "2044", invNo: "INV-1011", invDate: "01/02/2026", totalValue: 11800.00, taxPct: 28.00 },
  { id: 12, sellerName: "Abbott India Wholesale",     sellerTin: "27AAAAA4321Z1ZX", commCode: "2044", invNo: "INV-1012", invDate: "04/02/2026", totalValue: 6200.00,  taxPct: 14.50 },
  { id: 13, sellerName: "B. Braun MedSupply",         sellerTin: "06AABCB2318F1Z9", commCode: "2044", invNo: "INV-1013", invDate: "07/02/2026", totalValue: 9100.00,  taxPct: 18.00 },
  { id: 14, sellerName: "MedLine Distributors",       sellerTin: "27AAECM2342C1ZF", commCode: "2044", invNo: "INV-1014", invDate: "10/02/2026", totalValue: 3750.00,  taxPct: 5.00 },
  { id: 15, sellerName: "GSK Wholesale India",        sellerTin: "07AAACG1234A1ZV", commCode: "2044", invNo: "INV-1015", invDate: "14/02/2026", totalValue: 8400.00,  taxPct: 12.00 },
];

const TAX_OPTIONS = ["All", "0", "5", "12", "14.5", "18", "28"];
// ─────────────────────────────────────────────────────────────────────────────

const TABLE_COLUMNS = [
  {
    key: "slNo",
    label: "Sl No",
    sortable: false,
    render: (_: any, __: any, idx: number) => idx + 1,
  },
  { key: "sellerName", label: "Seller Name", sortable: true },
  { key: "sellerTin",  label: "Seller TIN",  sortable: false },
  { key: "commCode",   label: "Comm Code",   sortable: false, className: "text-center" },
  { key: "invNo",      label: "Inv No",      sortable: false },
  { key: "invDate",    label: "Inv Date",    sortable: true, className: "text-center" },
  {
    key: "totalValue",
    label: "Total Value",
    sortable: true,
    className: "text-end",
    render: (value: any) =>
      value !== undefined
        ? `₹ ${Number(value).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
        : null,
  },
  {
    key: "taxPct",
    label: "Tax %",
    sortable: true,
    className: "text-end",
    render: (value: any) =>
      value !== undefined ? `${Number(value).toFixed(2)}` : null,
  },
  {
    key: "gstPaid",
    label: "GST Paid",
    sortable: false,
    className: "text-end",
    render: (_: any, record: any) => {
      const gst = (record.totalValue * record.taxPct) / 100;
      return `₹ ${gst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
    },
  },
  {
    key: "category",
    label: "Category",
    sortable: false,
    className: "text-center",
    render: (_: any, record: any) =>
      record.taxPct === 0 ? (
        <Badge bg="secondary">E</Badge>
      ) : (
        <Badge bg="primary">R</Badge>
      ),
  },
];

export default function Annexure1Purchase() {
  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [dateFrom, setDateFrom] = useState<string>(
    firstOfMonth.toISOString().split("T")[0]
  );
  const [dateTo, setDateTo] = useState<string>(
    today.toISOString().split("T")[0]
  );
  const [selectedTax, setSelectedTax] = useState<string>("All");
  const [applied, setApplied] = useState(true);

  const [sortKey, setSortKey] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const displayedData = useMemo(() => {
    if (!applied) return [];
    let result = [...DEMO_PURCHASES];
    if (selectedTax !== "All") {
      const taxVal = parseFloat(selectedTax);
      result = result.filter((r) => r.taxPct === taxVal);
    }
    if (sortKey) {
      result = sortTableData(result, sortKey as any, sortDirection);
    }
    return result;
  }, [applied, selectedTax, sortKey, sortDirection]);

  const totals = useMemo(
    () => ({
      totalValue: displayedData.reduce((s, r) => s + r.totalValue, 0),
      gstPaid: displayedData.reduce(
        (s, r) => s + (r.totalValue * r.taxPct) / 100,
        0
      ),
    }),
    [displayedData]
  );

  const stats = useMemo(
    () => ({
      records: displayedData.length,
      sellers: new Set(displayedData.map((r) => r.sellerName)).size,
      taxable: displayedData.filter((r) => r.taxPct > 0).length,
      exempt: displayedData.filter((r) => r.taxPct === 0).length,
    }),
    [displayedData]
  );

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setApplied(true);
  };

  const handleReset = () => {
    setDateFrom(firstOfMonth.toISOString().split("T")[0]);
    setDateTo(today.toISOString().split("T")[0]);
    setSelectedTax("All");
    setSortKey("");
    setSortDirection("asc");
    setApplied(true);
  };

  const handleExport = () => {
    const exportData = displayedData.map((r, i) => ({
      "Sl No": i + 1,
      "Seller Name": r.sellerName,
      "Seller TIN": r.sellerTin,
      "Comm Code": r.commCode,
      "Inv No": r.invNo,
      "Inv Date": r.invDate,
      "Total Value": r.totalValue,
      "Tax %": r.taxPct,
      "GST Paid": parseFloat(((r.totalValue * r.taxPct) / 100).toFixed(2)),
      Category: r.taxPct === 0 ? "E" : "R",
    }));
    exportToExcel(
      exportData,
      `Annexure1_Purchase_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
      "Annexure 1 - Purchase"
    );
  };

  const subtitleText =
    applied && (dateFrom || dateTo)
      ? `${selectedTax !== "All" ? `${selectedTax}% Tax — ` : ""}${getDateRangeText(dateFrom, dateTo)}`
      : "Select filters and click Submit";

  return (
    <Container fluid className="px-4 py-3">
      <ReportHeader
        title="Annexure 1 — Purchase"
        subtitle={subtitleText}
        onPrint={printReport}
        onExport={handleExport}
        showSearch={false}
        showSort={false}
        showPrint={true}
        showExport={true}
      />

      {/* Filter Form */}
      <Card className="mb-4 shadow-sm no-print">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="g-3 align-items-end">
              <Form.Group as={Col} md={3} controlId="dateFrom">
                <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>
                  Date From
                </Form.Label>
                <Form.Control
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </Form.Group>

              <Form.Group as={Col} md={3} controlId="dateTo">
                <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>
                  Date To
                </Form.Label>
                <Form.Control
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </Form.Group>

              <Form.Group as={Col} md={3} controlId="taxType">
                <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>
                  Select Tax %
                </Form.Label>
                <Form.Select
                  value={selectedTax}
                  onChange={(e) => setSelectedTax(e.target.value)}
                >
                  {TAX_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t === "All" ? "All" : `${t} %`}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Col md={3} className="d-flex gap-2">
                <Button type="submit" variant="primary" className="w-50">
                  Submit
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-50"
                  onClick={handleReset}
                >
                  Reset
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* Category Legend */}
      <div className="mb-3 d-flex align-items-center gap-3 no-print">
        <small style={{ fontWeight: "var(--font-weight-medium)", color: "#555" }}>
          Category:
        </small>
        <small className="d-flex align-items-center gap-1">
          <Badge bg="primary">R</Badge>
          <span className="text-muted">Taxable (Tax &gt; 0%)</span>
        </small>
        <small className="d-flex align-items-center gap-1">
          <Badge bg="secondary">E</Badge>
          <span className="text-muted">Exempt (Tax = 0%)</span>
        </small>
      </div>

      {/* KPI Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <ReportKPICard label="Total Records" value={stats.records} variant="primary" />
        </Col>
        <Col md={3}>
          <ReportKPICard label="Unique Sellers" value={stats.sellers} variant="info" />
        </Col>
        <Col md={3}>
          <ReportKPICard label="Taxable (R)" value={stats.taxable} variant="warning" />
        </Col>
        <Col md={3}>
          <ReportKPICard label="Exempt (E)" value={stats.exempt} variant="success" />
        </Col>
      </Row>

      {/* Table */}
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
          <ReportTable
            data={displayedData}
            columns={TABLE_COLUMNS}
            onSort={handleSort}
            responsive={false}
            emptyMessage="No purchase records found for the selected filters."
          />
        </div>

        {/* Totals footer */}
        {displayedData.length > 0 && (
          <div
            style={{
              padding: "0.5rem 1rem",
              borderTop: "2px solid #e0e0e0",
              background: "linear-gradient(to right, #fff8e1, #ffffff)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <small className="text-muted" style={{ fontWeight: "var(--font-weight-medium)" }}>
              Showing: <strong>{displayedData.length}</strong> records
            </small>
            <div className="d-flex gap-4">
              <small style={{ fontWeight: "var(--font-weight-semibold)", color: "#d32f2f" }}>
                Total Value:{" "}
                <span>
                  ₹{" "}
                  {totals.totalValue.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </small>
              <small style={{ fontWeight: "var(--font-weight-semibold)", color: "#d32f2f" }}>
                GST Paid:{" "}
                <span>
                  ₹{" "}
                  {totals.gstPaid.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </small>
            </div>
          </div>
        )}
      </Card>
    </Container>
  );
}
