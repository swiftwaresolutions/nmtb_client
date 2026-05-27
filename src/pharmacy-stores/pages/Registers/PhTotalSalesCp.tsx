import React, { useState, useMemo } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Row,
  Col,
  Spinner,
  Modal,
  Table,
} from "react-bootstrap";
import ReportHeader from "../../../medical-records/components/ReportHeader";
import ReportKPICard from "../../../medical-records/components/ReportKPICard";
import ReportTable from "../../../medical-records/components/ReportTable";
import {
  searchTableData,
  sortTableData,
  exportToExcel,
  printReport,
  formatReportDate,
  getDateRangeText,
} from "../../../medical-records/utils/reportUtils";
import "../../../medical-records/styles/reportStyles.css";
import { showValidationError } from "../../../utils/alertUtil";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtCurrency = (n: number) =>
  n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtQty = (n: number) =>
  n % 1 === 0 ? String(n) : parseFloat(n.toFixed(2)).toString();

// ─── Types ────────────────────────────────────────────────────────────────────
interface SalesDetail {
  slNo: number;
  salesDate: string;
  totalUnitsSold: number;
}

interface TotalSalesCpRecord {
  id: number;
  medicineName: string;
  batchNo: string;
  cpPerUnit: number;
  taxPercent: number;   // stored to derive taxPerUnit = cpPerUnit * taxPercent / 100
  unitsSold: number;
  stockNow: number;
  details: SalesDetail[];
}

// ─── Demo Data ────────────────────────────────────────────────────────────────
const DEMO_RECORDS: TotalSalesCpRecord[] = [
  {
    id: 1, medicineName: "Paracetamol 500mg", batchNo: "B-001",
    cpPerUnit: 1.80, taxPercent: 5, unitsSold: 450, stockNow: 1200,
    details: [
      { slNo: 1, salesDate: "01/03/2025", totalUnitsSold: 90 },
      { slNo: 2, salesDate: "05/03/2025", totalUnitsSold: 120 },
      { slNo: 3, salesDate: "09/03/2025", totalUnitsSold: 150 },
      { slNo: 4, salesDate: "11/03/2025", totalUnitsSold: 90 },
    ],
  },
  {
    id: 2, medicineName: "Amoxicillin 250mg", batchNo: "B-045",
    cpPerUnit: 6.20, taxPercent: 12, unitsSold: 320, stockNow: 850,
    details: [
      { slNo: 1, salesDate: "02/03/2025", totalUnitsSold: 80 },
      { slNo: 2, salesDate: "06/03/2025", totalUnitsSold: 110 },
      { slNo: 3, salesDate: "10/03/2025", totalUnitsSold: 130 },
    ],
  },
  {
    id: 3, medicineName: "Metformin 500mg", batchNo: "M-012",
    cpPerUnit: 3.50, taxPercent: 5, unitsSold: 280, stockNow: 620,
    details: [
      { slNo: 1, salesDate: "03/03/2025", totalUnitsSold: 100 },
      { slNo: 2, salesDate: "07/03/2025", totalUnitsSold: 95 },
      { slNo: 3, salesDate: "11/03/2025", totalUnitsSold: 85 },
    ],
  },
  {
    id: 4, medicineName: "Amlodipine 5mg", batchNo: "AM-031",
    cpPerUnit: 3.20, taxPercent: 5, unitsSold: 210, stockNow: 540,
    details: [
      { slNo: 1, salesDate: "04/03/2025", totalUnitsSold: 70 },
      { slNo: 2, salesDate: "08/03/2025", totalUnitsSold: 80 },
      { slNo: 3, salesDate: "12/03/2025", totalUnitsSold: 60 },
    ],
  },
  {
    id: 5, medicineName: "Atorvastatin 10mg", batchNo: "AT-018",
    cpPerUnit: 9.00, taxPercent: 12, unitsSold: 175, stockNow: 430,
    details: [
      { slNo: 1, salesDate: "02/03/2025", totalUnitsSold: 60 },
      { slNo: 2, salesDate: "07/03/2025", totalUnitsSold: 65 },
      { slNo: 3, salesDate: "12/03/2025", totalUnitsSold: 50 },
    ],
  },
  {
    id: 6, medicineName: "Ceftriaxone 1g Inj.", batchNo: "CF-022",
    cpPerUnit: 62.00, taxPercent: 18, unitsSold: 60, stockNow: 150,
    details: [
      { slNo: 1, salesDate: "03/03/2025", totalUnitsSold: 20 },
      { slNo: 2, salesDate: "08/03/2025", totalUnitsSold: 22 },
      { slNo: 3, salesDate: "11/03/2025", totalUnitsSold: 18 },
    ],
  },
  {
    id: 7, medicineName: "Ondansetron 4mg Inj.", batchNo: "ON-009",
    cpPerUnit: 13.50, taxPercent: 12, unitsSold: 145, stockNow: 320,
    details: [
      { slNo: 1, salesDate: "01/03/2025", totalUnitsSold: 45 },
      { slNo: 2, salesDate: "06/03/2025", totalUnitsSold: 55 },
      { slNo: 3, salesDate: "10/03/2025", totalUnitsSold: 45 },
    ],
  },
  {
    id: 8, medicineName: "Pantoprazole 40mg", batchNo: "PZ-008",
    cpPerUnit: 6.50, taxPercent: 5, unitsSold: 195, stockNow: 480,
    details: [
      { slNo: 1, salesDate: "04/03/2025", totalUnitsSold: 65 },
      { slNo: 2, salesDate: "09/03/2025", totalUnitsSold: 70 },
      { slNo: 3, salesDate: "12/03/2025", totalUnitsSold: 60 },
    ],
  },
];

// ─── Derived calc helpers ─────────────────────────────────────────────────────
function calcRow(r: TotalSalesCpRecord) {
  const taxPerUnit = r.cpPerUnit * (r.taxPercent / 100);
  const cpAmount   = r.cpPerUnit * r.unitsSold;
  const taxAmount  = taxPerUnit  * r.unitsSold;
  const cpPlusTax  = cpAmount + taxAmount;
  return { taxPerUnit, cpAmount, taxAmount, cpPlusTax };
}
// ─────────────────────────────────────────────────────────────────────────────

const TABLE_COLUMNS = [
  {
    key: "slNo",
    label: "S. No",
    sortable: false,
    render: (_: any, __: any, idx: number) => idx + 1,
  },
  {
    key: "medicineName",
    label: "Medicine Name with Batch",
    sortable: true,
    render: (value: any, record: any) =>
      value ? (
        <span
          style={{
            color: "var(--bs-primary, #0d6efd)",
            cursor: "pointer",
            fontWeight: "var(--font-weight-semibold)",
            textDecoration: "underline",
          }}
          onClick={(e) => {
            e.stopPropagation();
            (window as any).__viewCpSalesDetails?.(record);
          }}
        >
          {value}{" "}
          <span style={{ fontWeight: "var(--font-weight-normal)", color: "#555" }}>
            [{record.batchNo}]
          </span>
        </span>
      ) : null,
  },
  {
    key: "cpPerUnit",
    label: "CP / Unit",
    sortable: true,
    render: (value: any) => <span style={{ float: "right" }}>{fmtCurrency(value)}</span>,
  },
  {
    key: "taxPerUnit",
    label: "Tax / Unit",
    sortable: false,
    render: (_: any, record: any) => (
      <span style={{ float: "right" }}>{fmtCurrency(calcRow(record).taxPerUnit)}</span>
    ),
  },
  {
    key: "unitsSold",
    label: "Units Sold",
    sortable: true,
    render: (value: any) => <span style={{ float: "right" }}>{fmtQty(value)}</span>,
  },
  {
    key: "cpAmount",
    label: "CP Amount",
    sortable: false,
    render: (_: any, record: any) => (
      <span style={{ float: "right" }}>{fmtCurrency(calcRow(record).cpAmount)}</span>
    ),
  },
  {
    key: "taxAmount",
    label: "Tax Amount",
    sortable: false,
    render: (_: any, record: any) => (
      <span style={{ float: "right" }}>{fmtCurrency(calcRow(record).taxAmount)}</span>
    ),
  },
  {
    key: "cpPlusTax",
    label: "CP Amt + Tax Amt",
    sortable: false,
    render: (_: any, record: any) => (
      <span style={{ float: "right", fontWeight: "var(--font-weight-semibold)" }}>
        {fmtCurrency(calcRow(record).cpPlusTax)}
      </span>
    ),
  },
  {
    key: "stockNow",
    label: "Stock Now",
    sortable: true,
    render: (value: any) => <span style={{ float: "right" }}>{fmtQty(value)}</span>,
  },
];

export default function PhTotalSalesCp() {
  const today = new Date().toISOString().split("T")[0];

  const [fromDate, setFromDate]     = useState<string>(today);
  const [toDate, setToDate]         = useState<string>(today);
  const [allRecords, setAllRecords] = useState<TotalSalesCpRecord[]>(DEMO_RECORDS);
  const [displayedData, setDisplayedData] = useState<TotalSalesCpRecord[]>(DEMO_RECORDS);
  const [loading, setLoading]       = useState<boolean>(false);
  const [submitted, setSubmitted]   = useState<boolean>(true);

  const [searchTerm, setSearchTerm]       = useState<string>("");
  const [sortKey, setSortKey]             = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const [showModal, setShowModal]         = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<TotalSalesCpRecord | null>(null);

  (window as any).__viewCpSalesDetails = (record: TotalSalesCpRecord) => {
    setSelectedRecord(record);
    setShowModal(true);
  };

  const totals = useMemo(() => {
    const cpSum     = displayedData.reduce((s, r) => s + r.cpPerUnit,            0);
    const taxUSum   = displayedData.reduce((s, r) => s + calcRow(r).taxPerUnit,  0);
    const unitSum   = displayedData.reduce((s, r) => s + r.unitsSold,            0);
    const cpAmtSum  = displayedData.reduce((s, r) => s + calcRow(r).cpAmount,    0);
    const taxAmtSum = displayedData.reduce((s, r) => s + calcRow(r).taxAmount,   0);
    const totalSum  = displayedData.reduce((s, r) => s + calcRow(r).cpPlusTax,   0);
    return { cpSum, taxUSum, unitSum, cpAmtSum, taxAmtSum, totalSum };
  }, [displayedData]);

  React.useEffect(() => {
    let result = [...allRecords];
    if (searchTerm) {
      result = searchTableData(result, searchTerm, ["medicineName", "batchNo"]);
    }
    if (sortKey) {
      result = sortTableData(result, sortKey as keyof TotalSalesCpRecord, sortDirection);
    }
    setDisplayedData(result);
  }, [searchTerm, sortKey, sortDirection, allRecords]);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromDate || !toDate) {
      showValidationError("Please select both From Date and To Date.", "Validation");
      return;
    }
    if (fromDate > toDate) {
      showValidationError("From Date cannot be later than To Date.", "Validation");
      return;
    }
    setLoading(true);
    setSubmitted(false);
    setTimeout(() => {
      setAllRecords(DEMO_RECORDS);
      setDisplayedData(DEMO_RECORDS);
      setSubmitted(true);
      setLoading(false);
    }, 600);
  };

  const handleReset = () => {
    setFromDate(today);
    setToDate(today);
    setAllRecords([]);
    setDisplayedData([]);
    setSearchTerm("");
    setSortKey("");
    setSortDirection("asc");
    setSubmitted(false);
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const handleExport = () => {
    const exportData = displayedData.map((r, i) => {
      const c = calcRow(r);
      return {
        "S. No": i + 1,
        "Medicine Name": `${r.medicineName} [${r.batchNo}]`,
        "CP / Unit":         fmtCurrency(r.cpPerUnit),
        "Tax / Unit":        fmtCurrency(c.taxPerUnit),
        "Units Sold":        fmtQty(r.unitsSold),
        "CP Amount":         fmtCurrency(c.cpAmount),
        "Tax Amount":        fmtCurrency(c.taxAmount),
        "CP Amt + Tax Amt":  fmtCurrency(c.cpPlusTax),
        "Stock Now":         fmtQty(r.stockNow),
      };
    });
    exportToExcel(
      exportData,
      `Total_Sales_CP_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
      "Total Sales CP Register"
    );
  };

  return (
    <React.Fragment>
      <Container fluid className="px-4 py-3">
        <ReportHeader
          title="Total Sales Register (Cost Price)"
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

        {/* Filter Form */}
        <Card className="mb-4 shadow-sm no-print">
          <Card.Body>
            <Form className="row g-3 align-items-end" onSubmit={handleFilterSubmit}>
              <Form.Group as={Col} md={4} controlId="fromDate">
                <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>
                  From Date
                </Form.Label>
                <Form.Control
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  max={today}
                  lang="en-CA"
                  required
                />
              </Form.Group>
              <Form.Group as={Col} md={4} controlId="toDate">
                <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>
                  To Date
                </Form.Label>
                <Form.Control
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  max={today}
                  lang="en-CA"
                  required
                />
              </Form.Group>
              <Form.Group as={Col} md={4} className="d-flex align-items-end gap-2">
                <Button type="submit" variant="primary" className="w-50" disabled={loading}>
                  {loading ? "Loading..." : "Submit"}
                </Button>
                <Button type="button" variant="secondary" className="w-50" onClick={handleReset}>
                  Reset
                </Button>
              </Form.Group>
            </Form>
          </Card.Body>
        </Card>

        {/* KPI Cards */}
        {submitted && (
          <Row className="mb-4">
            <Col md={3}>
              <ReportKPICard label="Total Medicines"   value={displayedData.length}                   variant="primary" />
            </Col>
            <Col md={3}>
              <ReportKPICard label="Total Units Sold"  value={totals.unitSum}                          variant="info"    />
            </Col>
            <Col md={3}>
              <ReportKPICard label="Total CP Amount"   value={`₹ ${fmtCurrency(totals.cpAmtSum)}`}    variant="success" />
            </Col>
            <Col md={3}>
              <ReportKPICard label="CP + Tax Total"    value={`₹ ${fmtCurrency(totals.totalSum)}`}    variant="warning" />
            </Col>
          </Row>
        )}

        {/* Table */}
        {loading ? (
          <div className="text-center py-5 text-muted">
            <Spinner animation="border" role="status" />
            <div className="mt-3">Loading total sales cost price register...</div>
          </div>
        ) : (
          <Card className="report-card" style={{ padding: "0.75rem" }}>
            <div
              style={{
                maxHeight: "calc(115vh - 460px)",
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
                emptyMessage={
                  !submitted
                    ? "No data loaded. Please select date range and click Submit."
                    : searchTerm
                    ? "No records match your search criteria."
                    : "No records found."
                }
              />
            </div>

            {/* Totals Row */}
            {submitted && displayedData.length > 0 && (
              <Table
                bordered
                size="sm"
                className="mb-0"
                style={{ marginTop: "-1px", tableLayout: "fixed" }}
              >
                <colgroup>
                  <col style={{ width: "4%" }} />
                  <col />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "9%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "13%" }} />
                  <col style={{ width: "9%" }} />
                </colgroup>
                <tfoot>
                  <tr
                    style={{
                      background: "#f1f3f5",
                      fontWeight: "var(--font-weight-bold)",
                      fontSize: "var(--font-size-sm)",
                    }}
                  >
                    <td>&nbsp;</td>
                    <td className="text-end pe-2">Total</td>
                    <td className="text-end pe-2">{fmtCurrency(totals.cpSum)}</td>
                    <td className="text-end pe-2">{fmtCurrency(totals.taxUSum)}</td>
                    <td className="text-end pe-2">{totals.unitSum}</td>
                    <td className="text-end pe-2">{fmtCurrency(totals.cpAmtSum)}</td>
                    <td className="text-end pe-2">{fmtCurrency(totals.taxAmtSum)}</td>
                    <td className="text-end pe-2">{fmtCurrency(totals.totalSum)}</td>
                    <td>&nbsp;</td>
                  </tr>
                </tfoot>
              </Table>
            )}

            <div
              style={{
                padding: "0.5rem 1rem",
                borderTop: "2px solid #e0e0e0",
                background: "linear-gradient(to right, #f8f9fa, #ffffff)",
                textAlign: "start",
              }}
            >
              <small className="text-muted" style={{ fontWeight: "var(--font-weight-medium)" }}>
                Total Data Rows: <strong>{displayedData.length}</strong>
                {searchTerm && (
                  <span className="ms-2">(Filtered from {allRecords.length})</span>
                )}
              </small>
            </div>
          </Card>
        )}
      </Container>

      {/* Medicine Sales Detail Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton style={{ borderBottom: "2px solid #dee2e6" }}>
          <Modal.Title
            style={{
              fontSize: "var(--font-size-lg)",
              fontWeight: "var(--font-weight-semibold)",
            }}
          >
            Total Sale (Cost Price) — Sales Breakdown
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: "1.25rem" }}>
          {selectedRecord && (() => {
            const c = calcRow(selectedRecord);
            return (
            <>
              {/* Summary table — same columns as main register */}
              <div className="mb-3" style={{ overflowX: "auto" }}>
                <Table bordered size="sm" className="mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th className="text-center" style={{ width: "5%" }}>S. No</th>
                      <th>Medicine Name with Batch</th>
                      <th className="text-end" style={{ width: "10%" }}>CP / Unit</th>
                      <th className="text-end" style={{ width: "10%" }}>Tax / Unit</th>
                      <th className="text-end" style={{ width: "9%" }}>Units Sold</th>
                      <th className="text-end" style={{ width: "10%" }}>CP Amount</th>
                      <th className="text-end" style={{ width: "10%" }}>Tax Amount</th>
                      <th className="text-end" style={{ width: "13%" }}>CP Amt + Tax Amt</th>
                      <th className="text-end" style={{ width: "9%" }}>Stock Now</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="text-center">1</td>
                      <td style={{ fontWeight: "var(--font-weight-semibold)", color: "#000080" }}>
                        {selectedRecord.medicineName}{" "}
                        <span style={{ fontWeight: "var(--font-weight-normal)", color: "#555" }}>
                          [{selectedRecord.batchNo}]
                        </span>
                      </td>
                      <td className="text-end pe-2">{fmtCurrency(selectedRecord.cpPerUnit)}</td>
                      <td className="text-end pe-2">{fmtCurrency(c.taxPerUnit)}</td>
                      <td className="text-end pe-2">{fmtQty(selectedRecord.unitsSold)}</td>
                      <td className="text-end pe-2">{fmtCurrency(c.cpAmount)}</td>
                      <td className="text-end pe-2">{fmtCurrency(c.taxAmount)}</td>
                      <td className="text-end pe-2" style={{ fontWeight: "var(--font-weight-semibold)" }}>
                        {fmtCurrency(c.cpPlusTax)}
                      </td>
                      <td className="text-end pe-2">{fmtQty(selectedRecord.stockNow)}</td>
                    </tr>
                  </tbody>
                </Table>
              </div>

              {/* Daily breakdown */}
              <div
                style={{
                  fontWeight: "var(--font-weight-semibold)",
                  fontSize: "var(--font-size-sm)",
                  marginBottom: "0.4rem",
                  color: "#444",
                }}
              >
                Daily Sales Breakdown
              </div>
              <Table bordered size="sm" className="mb-0">
                <thead className="table-secondary">
                  <tr>
                    <th className="text-center" style={{ width: "12%" }}>S. No</th>
                    <th style={{ width: "54%" }}>Sales Date</th>
                    <th className="text-end" style={{ width: "34%" }}>Total Units Sold</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedRecord.details.map((d) => (
                    <tr key={d.slNo}>
                      <td className="text-center">{d.slNo}</td>
                      <td>&nbsp;&nbsp;&nbsp;{d.salesDate}</td>
                      <td className="text-end pe-3">{fmtQty(d.totalUnitsSold)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr
                    style={{
                      background: "#f1f3f5",
                      fontWeight: "var(--font-weight-bold)",
                      fontSize: "var(--font-size-sm)",
                    }}
                  >
                    <td colSpan={2} className="text-end pe-2">Total</td>
                    <td className="text-end pe-3">
                      {selectedRecord.details.reduce((s, d) => s + d.totalUnitsSold, 0)}
                    </td>
                  </tr>
                </tfoot>
              </Table>
            </>
            );
          })()}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </React.Fragment>
  );
}
