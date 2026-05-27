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

// ─── Demo Data ──────────────────────────────────────────────────────────────
const DEMO_RECORDS = [
  {
    id: 1,
    usageNo: "DMG-2025-001",
    entryDate: "01/03/2025",
    entryUser: "Priya Lakshmi",
    approved: true,
    cancelled: false,
    details: [
      { slNo: 1, product: "Paracetamol 500mg", batch: "B001", usageWays: "Expired - Disposed" },
      { slNo: 2, product: "Amoxicillin 250mg", batch: "B045", usageWays: "Damaged Packaging - Discarded" },
    ],
  },
  {
    id: 2,
    usageNo: "DMG-2025-002",
    entryDate: "05/03/2025",
    entryUser: "Karthik Rajan",
    approved: false,
    cancelled: true,
    details: [
      { slNo: 1, product: "Metformin 500mg", batch: "M001", usageWays: "Contamination - Destroyed" },
    ],
  },
  {
    id: 3,
    usageNo: "DMG-2025-003",
    entryDate: "10/03/2025",
    entryUser: "Meena Selvam",
    approved: false,
    cancelled: false,
    details: [
      { slNo: 1, product: "Surgical Gloves (M)", batch: "SG021", usageWays: "Torn / Unusable - Discarded" },
      { slNo: 2, product: "IV Set 20 drops/ml", batch: "IV005", usageWays: "Expired - Disposed" },
      { slNo: 3, product: "Cotton Roll 500g", batch: "CR033", usageWays: "Water Damage - Destroyed" },
    ],
  },
  {
    id: 4,
    usageNo: "DMG-2025-004",
    entryDate: "15/03/2025",
    entryUser: "Suresh Babu",
    approved: true,
    cancelled: false,
    details: [
      { slNo: 1, product: "Ciprofloxacin 500mg", batch: "C099", usageWays: "Expired - Disposed" },
      { slNo: 2, product: "Omeprazole 20mg", batch: "O044", usageWays: "Damaged Packaging - Discarded" },
    ],
  },
  {
    id: 5,
    usageNo: "DMG-2025-005",
    entryDate: "18/03/2025",
    entryUser: "Anitha Devi",
    approved: false,
    cancelled: true,
    details: [
      { slNo: 1, product: "Dolo 650mg", batch: "D012", usageWays: "Contamination - Destroyed" },
    ],
  },
  {
    id: 6,
    usageNo: "DMG-2025-006",
    entryDate: "20/03/2025",
    entryUser: "Ramesh Babu",
    approved: false,
    cancelled: false,
    details: [
      { slNo: 1, product: "Azithromycin 500mg", batch: "AZ007", usageWays: "Expired - Disposed" },
      { slNo: 2, product: "Pantoprazole 40mg", batch: "P033", usageWays: "Damaged Packaging - Discarded" },
    ],
  },
];
// ─────────────────────────────────────────────────────────────────────────────

const TABLE_COLUMNS = [
  {
    key: "slNo",
    label: "Sl. No",
    sortable: false,
    render: (_: any, __: any, idx: number) => idx + 1,
  },
  {
    key: "usageNo",
    label: "Usage No",
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
            (window as any).__viewDamageDetails?.(record);
          }}
        >
          {value}
        </span>
      ) : null,
  },
  { key: "entryDate", label: "Entry Date", sortable: true },
  { key: "entryUser", label: "Entry User", sortable: true },
  {
    key: "status",
    label: "Status",
    sortable: false,
    render: (_: any, record: any) => {
      if (record.approved)
        return (
          <span
            className="badge"
            style={{
              background: "#93FF93",
              color: "#155724",
              fontWeight: "var(--font-weight-semibold)",
              fontSize: "var(--font-size-xs)",
              padding: "4px 10px",
              borderRadius: "12px",
            }}
          >
            Approved
          </span>
        );
      if (record.cancelled)
        return (
          <span
            className="badge"
            style={{
              background: "#FFD5FF",
              color: "#6a006a",
              fontWeight: "var(--font-weight-semibold)",
              fontSize: "var(--font-size-xs)",
              padding: "4px 10px",
              borderRadius: "12px",
            }}
          >
            Cancelled
          </span>
        );
      return (
        <span
          className="badge bg-secondary"
          style={{
            fontWeight: "var(--font-weight-semibold)",
            fontSize: "var(--font-size-xs)",
            padding: "4px 10px",
            borderRadius: "12px",
          }}
        >
          Pending
        </span>
      );
    },
  },
];

export default function PhDamagesRegister() {
  const today = new Date().toISOString().split("T")[0];

  const [fromDate, setFromDate] = useState<string>(today);
  const [toDate, setToDate] = useState<string>(today);
  const [allRecords, setAllRecords] = useState<any[]>([]);
  const [displayedData, setDisplayedData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortKey, setSortKey] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Detail modal
  const [showModal, setShowModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  // Expose view handler for ReportTable render function
  (window as any).__viewDamageDetails = (record: any) => {
    setSelectedRecord(record);
    setShowModal(true);
  };

  const stats = useMemo(
    () => ({
      total: allRecords.length,
      approved: allRecords.filter((r) => r.approved).length,
      cancelled: allRecords.filter((r) => r.cancelled).length,
      pending: allRecords.filter((r) => !r.approved && !r.cancelled).length,
    }),
    [allRecords]
  );

  React.useEffect(() => {
    let result = [...allRecords];
    if (searchTerm) {
      result = searchTableData(result, searchTerm, [
        "usageNo",
        "entryDate",
        "entryUser",
      ]);
    }
    if (sortKey) {
      result = sortTableData(result, sortKey, sortDirection);
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
      "Sl. No": i + 1,
      "Usage No": r.usageNo,
      "Entry Date": r.entryDate,
      "Entry User": r.entryUser,
      Status: r.approved ? "Approved" : r.cancelled ? "Cancelled" : "Pending",
    }));
    exportToExcel(
      exportData,
      `Damage_Register_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
      "Damage Register"
    );
  };

  const getRowClassName = (record: any) => {
    if (record.approved) return "table-success";
    if (record.cancelled) return "table-danger";
    return "";
  };

  return (
    <React.Fragment>
      <Container fluid className="px-4 py-3">
        <ReportHeader
          title="Damage / Usage Register"
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
              <ReportKPICard label="Total Entries" value={stats.total} variant="primary" />
            </Col>
            <Col md={3}>
              <ReportKPICard label="Approved" value={stats.approved} variant="success" />
            </Col>
            <Col md={3}>
              <ReportKPICard label="Cancelled" value={stats.cancelled} variant="danger" />
            </Col>
            <Col md={3}>
              <ReportKPICard label="Pending" value={stats.pending} variant="warning" />
            </Col>
          </Row>
        )}

        {/* Legend */}
        {submitted && (
          <div className="d-flex gap-3 mb-3 no-print">
            <div className="d-flex align-items-center gap-2">
              <span
                style={{
                  display: "inline-block",
                  width: 16,
                  height: 16,
                  background: "#93FF93",
                  border: "1px solid #2e7d32",
                  borderRadius: 3,
                }}
              />
              <small style={{ fontWeight: "var(--font-weight-medium)" }}>Approved</small>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span
                style={{
                  display: "inline-block",
                  width: 16,
                  height: 16,
                  background: "#f8d7da",
                  border: "1px solid #842029",
                  borderRadius: 3,
                }}
              />
              <small style={{ fontWeight: "var(--font-weight-medium)" }}>Cancelled</small>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span
                style={{
                  display: "inline-block",
                  width: 16,
                  height: 16,
                  background: "#e9ecef",
                  border: "1px solid #adb5bd",
                  borderRadius: 3,
                }}
              />
              <small style={{ fontWeight: "var(--font-weight-medium)" }}>Pending</small>
            </div>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="text-center py-5 text-muted">
            <Spinner animation="border" role="status" />
            <div className="mt-3">Loading damage register...</div>
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
              <ReportTable
                data={displayedData}
                columns={TABLE_COLUMNS}
                onSort={handleSort}
                rowClassName={getRowClassName}
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

      {/* Detail Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title
            style={{
              fontSize: "var(--font-size-lg)",
              fontWeight: "var(--font-weight-semibold)",
            }}
          >
            Usage Detail
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRecord && (
            <>
              {/* Header Info */}
              <div
                className="mb-3 p-3"
                style={{
                  background: "#f8f9fa",
                  borderRadius: "6px",
                  border: "1px solid #dee2e6",
                }}
              >
                <Row>
                  <Col md={6}>
                    <small className="text-muted" style={{ fontSize: "var(--font-size-xs)" }}>
                      Usage Number
                    </small>
                    <div
                      style={{
                        fontWeight: "var(--font-weight-semibold)",
                        color: "#0d6efd",
                      }}
                    >
                      {selectedRecord.usageNo}
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Detail Table */}
              <div style={{ overflowX: "auto" }}>
                <Table bordered size="sm" className="mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th className="text-center">Sl. No</th>
                      <th>Product Name</th>
                      <th className="text-center">Batch Name</th>
                      <th>Usage Ways</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRecord.details.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center text-muted py-3">
                          No items found.
                        </td>
                      </tr>
                    ) : (
                      selectedRecord.details.map((item: any) => (
                        <tr key={item.slNo}>
                          <td className="text-center">{item.slNo}</td>
                          <td>{item.product}</td>
                          <td className="text-center">{item.batch}</td>
                          <td>{item.usageWays}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
              <div className="mt-2 text-muted" style={{ fontSize: "var(--font-size-sm)" }}>
                Total Items: <strong>{selectedRecord.details.length}</strong>
              </div>
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
