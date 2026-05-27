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
import ReportHeader from "../../../../medical-records/components/ReportHeader";
import ReportKPICard from "../../../../medical-records/components/ReportKPICard";
import ReportTable from "../../../../medical-records/components/ReportTable";
import {
  searchTableData,
  sortTableData,
  exportToExcel,
  printReport,
  formatReportDate,
  getDateRangeText,
} from "../../../../medical-records/utils/reportUtils";
import "../../../../medical-records/styles/reportStyles.css";
import { showValidationError } from "../../../../utils/alertUtil";

// Status types matching JSP logic
type RequestStatus =
  | "new"
  | "approved_not_accepted"
  | "approved_accepted"
  | "approved_rejected"
  | "cancelled";

// ─── Demo Data ──────────────────────────────────────────────────────────────
const DEMO_RECORDS = [
  {
    id: 1,
    requestNo: "REQ-2025-001",
    storeName: "Main Central Store",
    date: "01/03/2025",
    userName: "Priya Lakshmi",
    status: "new" as RequestStatus,
    details: [
      { slNo: 1, product: "Paracetamol 500mg", requestedQty: 200, transferredQty: 0 },
      { slNo: 2, product: "Amoxicillin 250mg", requestedQty: 100, transferredQty: 0 },
    ],
  },
  {
    id: 2,
    requestNo: "REQ-2025-002",
    storeName: "Pharmacy Store A",
    date: "03/03/2025",
    userName: "Karthik Rajan",
    status: "approved_not_accepted" as RequestStatus,
    details: [
      { slNo: 1, product: "Metformin 500mg", requestedQty: 300, transferredQty: 300 },
      { slNo: 2, product: "Atorvastatin 10mg", requestedQty: 60, transferredQty: 60 },
      { slNo: 3, product: "Ibuprofen 400mg", requestedQty: 150, transferredQty: 150 },
    ],
  },
  {
    id: 3,
    requestNo: "REQ-2025-003",
    storeName: "Non-Medical Store",
    date: "07/03/2025",
    userName: "Meena Selvam",
    status: "approved_accepted" as RequestStatus,
    details: [
      { slNo: 1, product: "Surgical Gloves (M)", requestedQty: 500, transferredQty: 500 },
      { slNo: 2, product: "IV Set 20 drops/ml", requestedQty: 200, transferredQty: 180 },
    ],
  },
  {
    id: 4,
    requestNo: "REQ-2025-004",
    storeName: "Main Central Store",
    date: "10/03/2025",
    userName: "Suresh Babu",
    status: "approved_rejected" as RequestStatus,
    details: [
      { slNo: 1, product: "Ciprofloxacin 500mg", requestedQty: 120, transferredQty: 0 },
      { slNo: 2, product: "Omeprazole 20mg", requestedQty: 180, transferredQty: 0 },
    ],
  },
  {
    id: 5,
    requestNo: "REQ-2025-005",
    storeName: "Pharmacy Store B",
    date: "13/03/2025",
    userName: "Anitha Devi",
    status: "cancelled" as RequestStatus,
    details: [
      { slNo: 1, product: "Dolo 650mg", requestedQty: 400, transferredQty: 0 },
    ],
  },
  {
    id: 6,
    requestNo: "REQ-2025-006",
    storeName: "Pharmacy Store A",
    date: "18/03/2025",
    userName: "Ramesh Babu",
    status: "approved_accepted" as RequestStatus,
    details: [
      { slNo: 1, product: "Azithromycin 500mg", requestedQty: 80, transferredQty: 80 },
      { slNo: 2, product: "Pantoprazole 40mg", requestedQty: 90, transferredQty: 75 },
      { slNo: 3, product: "Cotton Roll 500g", requestedQty: 50, transferredQty: 50 },
    ],
  },
];
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  RequestStatus,
  { label: string; rowClass: string; badgeBg: string; badgeColor: string }
> = {
  new: {
    label: "New",
    rowClass: "table-warning",
    badgeBg: "#FFFF99",
    badgeColor: "#7a6800",
  },
  approved_not_accepted: {
    label: "Approved & Not Accepted",
    rowClass: "table-info",
    badgeBg: "#09D50E",
    badgeColor: "#fff",
  },
  approved_accepted: {
    label: "Approved & Accepted",
    rowClass: "table-success",
    badgeBg: "#009B00",
    badgeColor: "#fff",
  },
  approved_rejected: {
    label: "Approved & Rejected",
    rowClass: "table-danger",
    badgeBg: "#FFB164",
    badgeColor: "#7a3400",
  },
  cancelled: {
    label: "Cancelled",
    rowClass: "table-secondary",
    badgeBg: "#E1E8E8",
    badgeColor: "#333",
  },
};

const TABLE_COLUMNS = [
  {
    key: "slNo",
    label: "Sl. No",
    sortable: false,
    render: (_: any, __: any, idx: number) => idx + 1,
  },
  {
    key: "requestNo",
    label: "Request No",
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
            (window as any).__viewRequestDetails?.(record);
          }}
        >
          {value}
        </span>
      ) : null,
  },
  { key: "storeName", label: "Store Name", sortable: true },
  { key: "date", label: "Date", sortable: true },
  { key: "userName", label: "User Name", sortable: true },
  {
    key: "status",
    label: "Status",
    sortable: false,
    render: (_: any, record: any) => {
      const cfg = STATUS_CONFIG[record.status as RequestStatus];
      if (!cfg) return null;
      return (
        <span
          style={{
            background: cfg.badgeBg,
            color: cfg.badgeColor,
            fontWeight: "var(--font-weight-semibold)",
            fontSize: "var(--font-size-xs)",
            padding: "3px 10px",
            borderRadius: "12px",
            whiteSpace: "nowrap",
          }}
        >
          {cfg.label}
        </span>
      );
    },
  },
];

export default function Request() {
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

  (window as any).__viewRequestDetails = (record: any) => {
    setSelectedRecord(record);
    setShowModal(true);
  };

  const stats = useMemo(
    () => ({
      total: allRecords.length,
      new: allRecords.filter((r) => r.status === "new").length,
      approved: allRecords.filter((r) =>
        ["approved_not_accepted", "approved_accepted", "approved_rejected"].includes(r.status)
      ).length,
      cancelled: allRecords.filter((r) => r.status === "cancelled").length,
    }),
    [allRecords]
  );

  React.useEffect(() => {
    let result = [...allRecords];
    if (searchTerm) {
      result = searchTableData(result, searchTerm, [
        "requestNo",
        "storeName",
        "date",
        "userName",
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
      "Request No": r.requestNo,
      "Store Name": r.storeName,
      Date: r.date,
      "User Name": r.userName,
      Status: STATUS_CONFIG[r.status as RequestStatus]?.label ?? r.status,
    }));
    exportToExcel(
      exportData,
      `Request_Register_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
      "Request Register"
    );
  };

  const getRowClassName = (record: any) =>
    STATUS_CONFIG[record.status as RequestStatus]?.rowClass ?? "";

  return (
    <React.Fragment>
      <Container fluid className="px-4 py-3">
        <ReportHeader
          title="Request Register"
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
              <ReportKPICard label="Total Requests" value={stats.total} variant="primary" />
            </Col>
            <Col md={3}>
              <ReportKPICard label="New" value={stats.new} variant="warning" />
            </Col>
            <Col md={3}>
              <ReportKPICard label="Approved" value={stats.approved} variant="success" />
            </Col>
            <Col md={3}>
              <ReportKPICard label="Cancelled" value={stats.cancelled} variant="danger" />
            </Col>
          </Row>
        )}

        {/* Legend */}
        {submitted && (
          <div className="d-flex flex-wrap gap-3 mb-3 no-print">
            {(Object.entries(STATUS_CONFIG) as [RequestStatus, typeof STATUS_CONFIG[RequestStatus]][]).map(
              ([, cfg]) => (
                <div key={cfg.label} className="d-flex align-items-center gap-2">
                  <span
                    style={{
                      display: "inline-block",
                      width: 16,
                      height: 16,
                      background: cfg.badgeBg,
                      border: "1px solid #adb5bd",
                      borderRadius: 3,
                    }}
                  />
                  <small style={{ fontWeight: "var(--font-weight-medium)" }}>{cfg.label}</small>
                </div>
              )
            )}
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="text-center py-5 text-muted">
            <Spinner animation="border" role="status" />
            <div className="mt-3">Loading request register...</div>
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
            Request Order Details
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
                  <Col md={4}>
                    <small className="text-muted" style={{ fontSize: "var(--font-size-xs)" }}>
                      Request No
                    </small>
                    <div
                      style={{
                        fontWeight: "var(--font-weight-semibold)",
                        color: "#0d6efd",
                      }}
                    >
                      {selectedRecord.requestNo}
                    </div>
                  </Col>
                  <Col md={4}>
                    <small className="text-muted" style={{ fontSize: "var(--font-size-xs)" }}>
                      Store Name
                    </small>
                    <div style={{ fontWeight: "var(--font-weight-semibold)" }}>
                      {selectedRecord.storeName}
                    </div>
                  </Col>
                  <Col md={4}>
                    <small className="text-muted" style={{ fontSize: "var(--font-size-xs)" }}>
                      Status
                    </small>
                    <div>
                      {(() => {
                        const cfg = STATUS_CONFIG[selectedRecord.status as RequestStatus];
                        return (
                          <span
                            style={{
                              background: cfg?.badgeBg,
                              color: cfg?.badgeColor,
                              fontWeight: "var(--font-weight-semibold)",
                              fontSize: "var(--font-size-xs)",
                              padding: "3px 10px",
                              borderRadius: "12px",
                            }}
                          >
                            {cfg?.label}
                          </span>
                        );
                      })()}
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
                      <th className="text-end">Requested Quantity</th>
                      <th className="text-end">Transferred Quantity</th>
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
                          <td className="text-end">{item.requestedQty}</td>
                          <td className="text-end">{item.transferredQty}</td>
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

