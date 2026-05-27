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

interface TotalSalesMrpRecord {
  id: number;
  medicineName: string;
  batchNo: string;
  mrpPerUnit: number;
  unitsSold: number;
  mrpAmount: number;
  stockNow: number;
  details: SalesDetail[];
}

// ─── Demo Data ────────────────────────────────────────────────────────────────
const DEMO_RECORDS: TotalSalesMrpRecord[] = [
  {
    id: 1, medicineName: "Paracetamol 500mg", batchNo: "B-001",
    mrpPerUnit: 2.50, unitsSold: 450, mrpAmount: 1125.00, stockNow: 1200,
    details: [
      { slNo: 1, salesDate: "01/03/2025", totalUnitsSold: 90 },
      { slNo: 2, salesDate: "05/03/2025", totalUnitsSold: 120 },
      { slNo: 3, salesDate: "09/03/2025", totalUnitsSold: 150 },
      { slNo: 4, salesDate: "11/03/2025", totalUnitsSold: 90 },
    ],
  },
  {
    id: 2, medicineName: "Amoxicillin 250mg", batchNo: "B-045",
    mrpPerUnit: 8.50, unitsSold: 320, mrpAmount: 2720.00, stockNow: 850,
    details: [
      { slNo: 1, salesDate: "02/03/2025", totalUnitsSold: 80 },
      { slNo: 2, salesDate: "06/03/2025", totalUnitsSold: 110 },
      { slNo: 3, salesDate: "10/03/2025", totalUnitsSold: 130 },
    ],
  },
  {
    id: 3, medicineName: "Metformin 500mg", batchNo: "M-012",
    mrpPerUnit: 5.00, unitsSold: 280, mrpAmount: 1400.00, stockNow: 620,
    details: [
      { slNo: 1, salesDate: "03/03/2025", totalUnitsSold: 100 },
      { slNo: 2, salesDate: "07/03/2025", totalUnitsSold: 95 },
      { slNo: 3, salesDate: "11/03/2025", totalUnitsSold: 85 },
    ],
  },
  {
    id: 4, medicineName: "Amlodipine 5mg", batchNo: "AM-031",
    mrpPerUnit: 4.75, unitsSold: 210, mrpAmount: 997.50, stockNow: 540,
    details: [
      { slNo: 1, salesDate: "04/03/2025", totalUnitsSold: 70 },
      { slNo: 2, salesDate: "08/03/2025", totalUnitsSold: 80 },
      { slNo: 3, salesDate: "12/03/2025", totalUnitsSold: 60 },
    ],
  },
  {
    id: 5, medicineName: "Atorvastatin 10mg", batchNo: "AT-018",
    mrpPerUnit: 12.00, unitsSold: 175, mrpAmount: 2100.00, stockNow: 430,
    details: [
      { slNo: 1, salesDate: "02/03/2025", totalUnitsSold: 60 },
      { slNo: 2, salesDate: "07/03/2025", totalUnitsSold: 65 },
      { slNo: 3, salesDate: "12/03/2025", totalUnitsSold: 50 },
    ],
  },
  {
    id: 6, medicineName: "Ceftriaxone 1g Inj.", batchNo: "CF-022",
    mrpPerUnit: 85.00, unitsSold: 60, mrpAmount: 5100.00, stockNow: 150,
    details: [
      { slNo: 1, salesDate: "03/03/2025", totalUnitsSold: 20 },
      { slNo: 2, salesDate: "08/03/2025", totalUnitsSold: 22 },
      { slNo: 3, salesDate: "11/03/2025", totalUnitsSold: 18 },
    ],
  },
  {
    id: 7, medicineName: "Ondansetron 4mg Inj.", batchNo: "ON-009",
    mrpPerUnit: 18.50, unitsSold: 145, mrpAmount: 2682.50, stockNow: 320,
    details: [
      { slNo: 1, salesDate: "01/03/2025", totalUnitsSold: 45 },
      { slNo: 2, salesDate: "06/03/2025", totalUnitsSold: 55 },
      { slNo: 3, salesDate: "10/03/2025", totalUnitsSold: 45 },
    ],
  },
  {
    id: 8, medicineName: "Pantoprazole 40mg", batchNo: "PZ-008",
    mrpPerUnit: 9.00, unitsSold: 195, mrpAmount: 1755.00, stockNow: 480,
    details: [
      { slNo: 1, salesDate: "04/03/2025", totalUnitsSold: 65 },
      { slNo: 2, salesDate: "09/03/2025", totalUnitsSold: 70 },
      { slNo: 3, salesDate: "12/03/2025", totalUnitsSold: 60 },
    ],
  },
];
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
    label: "Medicine Name",
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
            (window as any).__viewMedSalesDetails?.(record);
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
    key: "mrpPerUnit",
    label: "MRP / Unit",
    sortable: true,
    render: (value: any) => <span style={{ float: "right" }}>{fmtCurrency(value)}</span>,
  },
  {
    key: "unitsSold",
    label: "Units Sold",
    sortable: true,
    render: (value: any) => <span style={{ float: "right" }}>{fmtQty(value)}</span>,
  },
  {
    key: "mrpAmount",
    label: "MRP Amount",
    sortable: true,
    render: (value: any) => <span style={{ float: "right" }}>{fmtCurrency(value)}</span>,
  },
  {
    key: "stockNow",
    label: "Stock Now",
    sortable: true,
    render: (value: any) => <span style={{ float: "right" }}>{fmtQty(value)}</span>,
  },
];

export default function PhTotalSalesMrp() {
  const today = new Date().toISOString().split("T")[0];

  const [fromDate, setFromDate] = useState<string>(today);
  const [toDate, setToDate] = useState<string>(today);
  const [allRecords, setAllRecords] = useState<TotalSalesMrpRecord[]>(DEMO_RECORDS);
  const [displayedData, setDisplayedData] = useState<TotalSalesMrpRecord[]>(DEMO_RECORDS);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(true);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortKey, setSortKey] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const [showModal, setShowModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<TotalSalesMrpRecord | null>(null);

  (window as any).__viewMedSalesDetails = (record: TotalSalesMrpRecord) => {
    setSelectedRecord(record);
    setShowModal(true);
  };

  const totals = useMemo(
    () => ({
      medicines: displayedData.length,
      unitsSold: displayedData.reduce((s, r) => s + r.unitsSold, 0),
      mrpAmount: displayedData.reduce((s, r) => s + r.mrpAmount, 0),
      stockNow:  displayedData.reduce((s, r) => s + r.stockNow,  0),
      mrpSum:    displayedData.reduce((s, r) => s + r.mrpPerUnit, 0),
    }),
    [displayedData]
  );

  React.useEffect(() => {
    let result = [...allRecords];
    if (searchTerm) {
      result = searchTableData(result, searchTerm, ["medicineName", "batchNo"]);
    }
    if (sortKey) {
      result = sortTableData(result, sortKey as keyof TotalSalesMrpRecord, sortDirection);
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
    const exportData = displayedData.map((r, i) => ({
      "S. No": i + 1,
      "Medicine Name": `${r.medicineName} [${r.batchNo}]`,
      "MRP / Unit": fmtCurrency(r.mrpPerUnit),
      "Units Sold": fmtQty(r.unitsSold),
      "MRP Amount": fmtCurrency(r.mrpAmount),
      "Stock Now": fmtQty(r.stockNow),
    }));
    exportToExcel(
      exportData,
      `Total_Sales_MRP_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
      "Total Sales MRP Register"
    );
  };

  return (
    <React.Fragment>
      <Container fluid className="px-4 py-3">
        <ReportHeader
          title="Total Sales Register (MRP)"
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
              <ReportKPICard label="Total Medicines"  value={totals.medicines}                         variant="primary" />
            </Col>
            <Col md={3}>
              <ReportKPICard label="Total Units Sold" value={totals.unitsSold}                         variant="info"    />
            </Col>
            <Col md={3}>
              <ReportKPICard label="Total MRP Amount" value={`₹ ${fmtCurrency(totals.mrpAmount)}`}    variant="success" />
            </Col>
            <Col md={3}>
              <ReportKPICard label="Total Stock Now"  value={totals.stockNow}                          variant="warning" />
            </Col>
          </Row>
        )}

        {/* Table */}
        {loading ? (
          <div className="text-center py-5 text-muted">
            <Spinner animation="border" role="status" />
            <div className="mt-3">Loading total sales MRP register...</div>
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
                  <col style={{ width: "5%" }} />
                  <col />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "12%" }} />
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
                    <td className="text-end pe-2">{fmtCurrency(totals.mrpSum)}</td>
                    <td className="text-end pe-2">{totals.unitsSold}</td>
                    <td className="text-end pe-2">{fmtCurrency(totals.mrpAmount)}</td>
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
            Total Sale (MRP) — Sales Breakdown
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: "1.25rem" }}>
          {selectedRecord && (
            <>
              {/* Medicine Name header */}
              <div
                className="mb-3 p-2 px-3"
                style={{
                  background: "#f8f9fa",
                  borderRadius: "6px",
                  border: "1px solid #dee2e6",
                }}
              >
                <span style={{ fontSize: "var(--font-size-sm)" }}>Medicine Name :&nbsp;</span>
                <span style={{ fontWeight: "var(--font-weight-semibold)", color: "#000080" }}>
                  {selectedRecord.medicineName}
                </span>
                <span style={{ color: "#555", marginLeft: "6px" }}>
                  [{selectedRecord.batchNo}]
                </span>
              </div>

              {/* Detail Table */}
              <Table bordered size="sm" className="mb-0">
                <thead className="table-dark">
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
          )}
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
