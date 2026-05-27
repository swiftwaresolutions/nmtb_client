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
    noteNumber: "TRN-2025-001",
    receivedDate: "01/03/2025",
    receivedUser: "Priya Lakshmi",
    receivedFromStore: "Main Central Store",
    openDate: "01/03/2025",
    openUser: "Admin User",
    details: [
      { slNo: 1, product: "Paracetamol 500mg", batch: "B001", quantity: 200, mrp: 2.5, mfgDate: "01/01/2025", expiryDate: "01/01/2027" },
      { slNo: 2, product: "Amoxicillin 250mg", batch: "B045", quantity: 100, mrp: 5.0, mfgDate: "01/02/2025", expiryDate: "01/02/2027" },
      { slNo: 3, product: "Ibuprofen 400mg", batch: "B078", quantity: 150, mrp: 3.75, mfgDate: "15/01/2025", expiryDate: "15/01/2027" },
    ],
  },
  {
    id: 2,
    noteNumber: "TRN-2025-002",
    receivedDate: "05/03/2025",
    receivedUser: "Karthik Rajan",
    receivedFromStore: "Pharmacy Store A",
    openDate: "05/03/2025",
    openUser: "Admin User",
    details: [
      { slNo: 1, product: "Metformin 500mg", batch: "M001", quantity: 300, mrp: 4.0, mfgDate: "01/01/2025", expiryDate: "01/01/2027" },
      { slNo: 2, product: "Atorvastatin 10mg", batch: "A023", quantity: 60, mrp: 8.5, mfgDate: "10/02/2025", expiryDate: "10/02/2027" },
    ],
  },
  {
    id: 3,
    noteNumber: "TRN-2025-003",
    receivedDate: "10/03/2025",
    receivedUser: "Meena Selvam",
    receivedFromStore: "Non-Medical Store",
    openDate: "10/03/2025",
    openUser: "Store Manager",
    details: [
      { slNo: 1, product: "Surgical Gloves (M)", batch: "SG021", quantity: 500, mrp: 1.2, mfgDate: "01/12/2024", expiryDate: "01/12/2026" },
      { slNo: 2, product: "IV Set 20 drops/ml", batch: "IV005", quantity: 200, mrp: 12.0, mfgDate: "01/11/2024", expiryDate: "01/11/2026" },
      { slNo: 3, product: "Cotton Roll 500g", batch: "CR033", quantity: 50, mrp: 45.0, mfgDate: "15/10/2024", expiryDate: "15/10/2026" },
      { slNo: 4, product: "Bandage 10cm", batch: "BD011", quantity: 100, mrp: 18.0, mfgDate: "01/09/2024", expiryDate: "01/09/2026" },
    ],
  },
  {
    id: 4,
    noteNumber: "TRN-2025-004",
    receivedDate: "15/03/2025",
    receivedUser: "Suresh Babu",
    receivedFromStore: "Main Central Store",
    openDate: "15/03/2025",
    openUser: "Admin User",
    details: [
      { slNo: 1, product: "Ciprofloxacin 500mg", batch: "C099", quantity: 120, mrp: 6.5, mfgDate: "01/02/2025", expiryDate: "01/02/2027" },
      { slNo: 2, product: "Omeprazole 20mg", batch: "O044", quantity: 180, mrp: 3.0, mfgDate: "01/03/2025", expiryDate: "01/03/2027" },
    ],
  },
  {
    id: 5,
    noteNumber: "TRN-2025-005",
    receivedDate: "20/03/2025",
    receivedUser: "Anitha Devi",
    receivedFromStore: "Pharmacy Store B",
    openDate: "20/03/2025",
    openUser: "Store Manager",
    details: [
      { slNo: 1, product: "Dolo 650mg", batch: "D012", quantity: 400, mrp: 2.0, mfgDate: "01/02/2025", expiryDate: "01/02/2027" },
      { slNo: 2, product: "Azithromycin 500mg", batch: "AZ007", quantity: 80, mrp: 14.0, mfgDate: "01/01/2025", expiryDate: "01/01/2027" },
      { slNo: 3, product: "Pantoprazole 40mg", batch: "P033", quantity: 90, mrp: 5.5, mfgDate: "15/02/2025", expiryDate: "15/02/2027" },
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
    key: "noteNumber",
    label: "Note Number",
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
            (window as any).__viewTransferDetails?.(record);
          }}
        >
          {value}
        </span>
      ) : null,
  },
  { key: "receivedDate", label: "Received Date", sortable: true },
  { key: "receivedUser", label: "Received User", sortable: true },
  { key: "receivedFromStore", label: "Received From Store", sortable: true },
];

export default function PhTransferReceipts() {
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

  // Expose view handler so ReportTable's render function can call it
  (window as any).__viewTransferDetails = (record: any) => {
    setSelectedRecord(record);
    setShowModal(true);
  };

  const stats = useMemo(
    () => ({
      total: allRecords.length,
      stores: new Set(allRecords.map((r) => r.receivedFromStore)).size,
      users: new Set(allRecords.map((r) => r.receivedUser)).size,
    }),
    [allRecords]
  );

  React.useEffect(() => {
    let result = [...allRecords];
    if (searchTerm) {
      result = searchTableData(result, searchTerm, [
        "noteNumber",
        "receivedDate",
        "receivedUser",
        "receivedFromStore",
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
      "Note Number": r.noteNumber,
      "Received Date": r.receivedDate,
      "Received User": r.receivedUser,
      "Received From Store": r.receivedFromStore,
    }));
    exportToExcel(
      exportData,
      `Transfer_Receipt_Register_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
      "Transfer Receipt Register"
    );
  };

  return (
    <React.Fragment>
      <Container fluid className="px-4 py-3">
        <ReportHeader
          title="Transfer Receipt Register"
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
            <Col md={4}>
              <ReportKPICard label="Total Receipts" value={stats.total} variant="primary" />
            </Col>
            <Col md={4}>
              <ReportKPICard label="Source Stores" value={stats.stores} variant="info" />
            </Col>
            <Col md={4}>
              <ReportKPICard label="Received Users" value={stats.users} variant="success" />
            </Col>
          </Row>
        )}

        {/* Table */}
        {loading ? (
          <div className="text-center py-5 text-muted">
            <Spinner animation="border" role="status" />
            <div className="mt-3">Loading transfer receipts...</div>
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

      {/* Detail Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title
            style={{
              fontSize: "var(--font-size-lg)",
              fontWeight: "var(--font-weight-semibold)",
            }}
          >
            Transferred Receipt Register Details
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
                      Transfer Note Number
                    </small>
                    <div style={{ fontWeight: "var(--font-weight-semibold)", color: "#0d6efd" }}>
                      {selectedRecord.noteNumber}
                    </div>
                  </Col>
                  <Col md={4}>
                    <small className="text-muted" style={{ fontSize: "var(--font-size-xs)" }}>
                      Open Date
                    </small>
                    <div style={{ fontWeight: "var(--font-weight-semibold)" }}>
                      {selectedRecord.openDate}
                    </div>
                  </Col>
                  <Col md={4}>
                    <small className="text-muted" style={{ fontSize: "var(--font-size-xs)" }}>
                      Open User Name
                    </small>
                    <div style={{ fontWeight: "var(--font-weight-semibold)" }}>
                      {selectedRecord.openUser}
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
                      <th>Product</th>
                      <th className="text-center">Batch</th>
                      <th className="text-end">Quantity</th>
                      <th className="text-end">M.R.P</th>
                      <th className="text-center">Mfg. Date</th>
                      <th className="text-center">Expiry Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRecord.details.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center text-muted py-3">
                          No items found.
                        </td>
                      </tr>
                    ) : (
                      selectedRecord.details.map((item: any) => (
                        <tr key={item.slNo}>
                          <td className="text-center">{item.slNo}</td>
                          <td>{item.product}</td>
                          <td className="text-center">{item.batch}</td>
                          <td className="text-end">{item.quantity}</td>
                          <td className="text-end">{item.mrp.toFixed(2)}</td>
                          <td className="text-center">{item.mfgDate}</td>
                          <td className="text-center">{item.expiryDate}</td>
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
