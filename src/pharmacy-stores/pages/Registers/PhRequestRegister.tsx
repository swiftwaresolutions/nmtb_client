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

// ─── Types ───────────────────────────────────────────────────────────────────
type RequestStatus =
  | "New"
  | "Approved - Not Accepted"
  | "Approved - Accepted"
  | "Approved - Rejected"
  | "Cancelled";

interface RequestDetail {
  slNo: number;
  materialName: string;
  requestedQty: number;
  transferredQty: number;
}

interface RequestRecord {
  id: number;
  requestNo: string;
  storeName: string;
  date: string;
  userName: string;
  department: string;
  status: RequestStatus;
  details: RequestDetail[];
}

// ─── Status Config (colors sourced from legacy JSP system) ───────────────────
const STATUS_CONFIG: Record<RequestStatus, { bg: string; color: string }> = {
  "New":                    { bg: "#FFFF99", color: "#664d03" },
  "Approved - Not Accepted":{ bg: "#09D50E", color: "#FFFFFF" },
  "Approved - Accepted":    { bg: "#009B00", color: "#FFFFFF" },
  "Approved - Rejected":    { bg: "#FFB164", color: "#7c3600" },
  "Cancelled":              { bg: "#E1E8E8", color: "#444"    },
};

// ─── Demo Data ────────────────────────────────────────────────────────────────
const DEMO_RECORDS: RequestRecord[] = [
  {
    id: 1, requestNo: "REQ-2025-001", storeName: "General Ward Store",
    date: "03/03/2025", userName: "Nurse Anitha", department: "Ward - A",
    status: "Approved - Accepted",
    details: [
      { slNo: 1, materialName: "Paracetamol 500mg",  requestedQty: 50, transferredQty: 50 },
      { slNo: 2, materialName: "Amoxicillin 250mg",  requestedQty: 30, transferredQty: 25 },
    ],
  },
  {
    id: 2, requestNo: "REQ-2025-002", storeName: "ICU Store",
    date: "05/03/2025", userName: "Nurse Kavitha", department: "ICU",
    status: "Approved - Not Accepted",
    details: [
      { slNo: 1, materialName: "Ceftriaxone 1g Inj.",      requestedQty: 20, transferredQty: 0 },
      { slNo: 2, materialName: "Ondansetron 4mg Inj.",     requestedQty: 15, transferredQty: 0 },
      { slNo: 3, materialName: "Dexamethasone 4mg Inj.",   requestedQty: 10, transferredQty: 0 },
    ],
  },
  {
    id: 3, requestNo: "REQ-2025-003", storeName: "OT Store",
    date: "07/03/2025", userName: "Nurse Saranya", department: "OT",
    status: "New",
    details: [
      { slNo: 1, materialName: "Surgical Gloves (M)",      requestedQty: 100, transferredQty: 0 },
      { slNo: 2, materialName: "Disposable Syringe 5ml",   requestedQty: 200, transferredQty: 0 },
    ],
  },
  {
    id: 4, requestNo: "REQ-2025-004", storeName: "Ward - B Store",
    date: "09/03/2025", userName: "Nurse Meena", department: "Ward - B",
    status: "Approved - Rejected",
    details: [
      { slNo: 1, materialName: "Morphine Sulphate 10mg",   requestedQty: 10, transferredQty: 0 },
    ],
  },
  {
    id: 5, requestNo: "REQ-2025-005", storeName: "Ward - C Store",
    date: "11/03/2025", userName: "Nurse Priya", department: "Ward - C",
    status: "Approved - Accepted",
    details: [
      { slNo: 1, materialName: "Metformin 500mg",          requestedQty: 100, transferredQty: 100 },
      { slNo: 2, materialName: "Amlodipine 5mg",           requestedQty: 60,  transferredQty: 60  },
      { slNo: 3, materialName: "Atorvastatin 10mg",        requestedQty: 60,  transferredQty: 60  },
    ],
  },
  {
    id: 6, requestNo: "REQ-2025-006", storeName: "Casualty Store",
    date: "12/03/2025", userName: "Nurse Ranjitha", department: "Casualty",
    status: "Cancelled",
    details: [
      { slNo: 1, materialName: "Dolo 650mg",               requestedQty: 80, transferredQty: 0 },
      { slNo: 2, materialName: "Pantoprazole 40mg",        requestedQty: 40, transferredQty: 0 },
    ],
  },
  {
    id: 7, requestNo: "REQ-2025-007", storeName: "Pharmacy Store",
    date: "12/03/2025", userName: "Pharmacist Raj", department: "Pharmacy",
    status: "New",
    details: [
      { slNo: 1, materialName: "Insulin Regular 10ml",     requestedQty: 20, transferredQty: 0 },
      { slNo: 2, materialName: "Glucometer Strips",        requestedQty: 50, transferredQty: 0 },
    ],
  },
];
// ─────────────────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: RequestStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      style={{
        background: cfg.bg,
        color: cfg.color,
        padding: "2px 10px",
        borderRadius: "4px",
        fontSize: "var(--font-size-xs)",
        fontWeight: "var(--font-weight-semibold)",
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
}

function StatusLegend() {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.4rem 1.25rem",
        padding: "0.5rem 0.9rem",
        background: "#f8f9fa",
        borderRadius: "6px",
        border: "1px solid #dee2e6",
        marginBottom: "0.75rem",
      }}
    >
      {(Object.entries(STATUS_CONFIG) as [RequestStatus, { bg: string; color: string }][]).map(
        ([label, cfg]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                display: "inline-block",
                width: "14px",
                height: "14px",
                background: cfg.bg,
                border: "1px solid #bbb",
                borderRadius: "3px",
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: "var(--font-size-xs)", color: "#333" }}>{label}</span>
          </div>
        )
      )}
    </div>
  );
}

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
  { key: "date",      label: "Date",       sortable: true },
  { key: "userName",  label: "User Name",  sortable: true },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (value: any) => <StatusBadge status={value as RequestStatus} />,
  },
];

export default function PhRequestRegister() {
  const today = new Date().toISOString().split("T")[0];

  const [fromDate, setFromDate] = useState<string>(today);
  const [toDate, setToDate] = useState<string>(today);
  const [allRecords, setAllRecords] = useState<RequestRecord[]>(DEMO_RECORDS);
  const [displayedData, setDisplayedData] = useState<RequestRecord[]>(DEMO_RECORDS);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(true);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortKey, setSortKey] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const [showModal, setShowModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<RequestRecord | null>(null);

  (window as any).__viewRequestDetails = (record: RequestRecord) => {
    setSelectedRecord(record);
    setShowModal(true);
  };

  const stats = useMemo(() => ({
    total:    allRecords.length,
    newCount: allRecords.filter((r) => r.status === "New").length,
    approved: allRecords.filter(
      (r) => r.status === "Approved - Accepted" || r.status === "Approved - Not Accepted"
    ).length,
    cancelled: allRecords.filter((r) => r.status === "Cancelled").length,
  }), [allRecords]);

  React.useEffect(() => {
    let result = [...allRecords];
    if (searchTerm) {
      result = searchTableData(result, searchTerm, [
        "requestNo", "storeName", "date", "userName", "status",
      ]);
    }
    if (sortKey) {
      result = sortTableData(result, sortKey as keyof RequestRecord, sortDirection);
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
      Status: r.status,
    }));
    exportToExcel(
      exportData,
      `Request_Register_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
      "Request Register"
    );
  };

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
          <Row className="mb-3">
            <Col md={3}>
              <ReportKPICard label="Total Requests" value={stats.total}     variant="primary" />
            </Col>
            <Col md={3}>
              <ReportKPICard label="New"            value={stats.newCount}  variant="warning" />
            </Col>
            <Col md={3}>
              <ReportKPICard label="Approved"       value={stats.approved}  variant="success" />
            </Col>
            <Col md={3}>
              <ReportKPICard label="Cancelled"      value={stats.cancelled} variant="info"    />
            </Col>
          </Row>
        )}

        {/* Status Legend */}
        {submitted && <StatusLegend />}

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

      {/* Request Detail Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton style={{ borderBottom: "2px solid #dee2e6" }}>
          <Modal.Title
            style={{
              fontSize: "var(--font-size-lg)",
              fontWeight: "var(--font-weight-semibold)",
            }}
          >
            Request Order Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: "1.25rem" }}>
          {selectedRecord && (
            <>
              {/* Meta — Department / Request No / Date */}
              <div
                className="mb-3 p-3"
                style={{
                  background: "#f8f9fa",
                  borderRadius: "6px",
                  border: "1px solid #dee2e6",
                }}
              >
                <Row className="g-2 text-center">
                  <Col md={4}>
                    <span style={{ fontSize: "var(--font-size-sm)" }}>Department :&nbsp;</span>
                    <span style={{ fontWeight: "var(--font-weight-semibold)", color: "#000080" }}>
                      {selectedRecord.department}
                    </span>
                  </Col>
                  <Col md={4}>
                    <span style={{ fontSize: "var(--font-size-sm)" }}>Request No :&nbsp;</span>
                    <span style={{ fontWeight: "var(--font-weight-semibold)", color: "#000080" }}>
                      {selectedRecord.requestNo}
                    </span>
                  </Col>
                  <Col md={4}>
                    <span style={{ fontSize: "var(--font-size-sm)" }}>Date :&nbsp;</span>
                    <span style={{ fontWeight: "var(--font-weight-medium)", color: "#000080" }}>
                      {selectedRecord.date}
                    </span>
                  </Col>
                </Row>
              </div>

              {/* Items Table */}
              <Table bordered size="sm" className="mb-4">
                <thead className="table-dark">
                  <tr>
                    <th className="text-center" style={{ width: "10%" }}>Sl. No</th>
                    <th style={{ width: "42%" }}>Material Name</th>
                    <th className="text-center" style={{ width: "24%" }}>Requested Quantity</th>
                    <th className="text-center" style={{ width: "24%" }}>Transferred Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedRecord.details.map((item) => (
                    <tr key={item.slNo}>
                      <td className="text-center">{item.slNo}</td>
                      <td>&nbsp;&nbsp;{item.materialName}</td>
                      <td className="text-center">{item.requestedQty}</td>
                      <td
                        className="text-center"
                        style={{ fontWeight: "var(--font-weight-semibold)" }}
                      >
                        {item.transferredQty}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {/* Signature Row */}
              <div
                style={{
                  border: "1px solid #dee2e6",
                  borderRadius: "6px",
                  padding: "0.75rem 0",
                  background: "#f8f9fa",
                }}
              >
                <Row className="g-0 text-center">
                  {["Indented By", "Approved By", "Checked By", "Issued By", "Received By"].map(
                    (label, idx, arr) => (
                      <Col
                        key={label}
                        style={{
                          borderRight: idx < arr.length - 1 ? "1px solid #dee2e6" : "none",
                          padding: "0 0.5rem",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "var(--font-size-xs)",
                            fontWeight: "var(--font-weight-semibold)",
                            marginBottom: "28px",
                          }}
                        >
                          {label}
                        </div>
                        <div
                          style={{
                            fontSize: "var(--font-size-xs)",
                            color: "#666",
                            borderTop: "1px solid #ccc",
                            paddingTop: "4px",
                          }}
                        >
                          Date:
                        </div>
                      </Col>
                    )
                  )}
                </Row>
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
