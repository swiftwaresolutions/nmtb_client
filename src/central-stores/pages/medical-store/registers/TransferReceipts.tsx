import React, { useState, useMemo, useCallback } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Badge,
  Row,
  Col,
  Spinner,
  Modal,
  Table,
} from "react-bootstrap";
import { printReport } from "../../../../medical-records/utils/reportUtils";
import ReportHeader from "../../../../medical-records/components/ReportHeader";
import ReportTable from "../../../../medical-records/components/ReportTable";
import {
  searchTableData,
  sortTableData,
  exportToExcel,
  formatReportDate,
  getDateRangeText,
} from "../../../../medical-records/utils/reportUtils";
import { showValidationError } from "../../../../utils/alertUtil";
import CentralStoresApiService, {
  TransferReceiptDetailsRow,
  TransferReceiptRow,
} from "../../../../api/central-stores/central-stores-api-service";

interface TransferReceiptRecord {
  id: number;
  noteNumber: string;
  receivedDate: string;
  receivedUser: string;
  receivedFromStore: string;
}

interface SessionStoreData {
  masterId?: number;
}

export default function TransferReceipts() {
  const centralStoresApi = useMemo(() => new CentralStoresApiService(), []);
  const today = new Date().toISOString().split("T")[0];

  const [fromDate, setFromDate] = useState<string>(today);
  const [toDate, setToDate] = useState<string>(today);
  const [allRecords, setAllRecords] = useState<TransferReceiptRecord[]>([]);
  const [displayedData, setDisplayedData] = useState<TransferReceiptRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortKey, setSortKey] = useState<keyof TransferReceiptRecord | "">("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Detail modal
  const [showModal, setShowModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<TransferReceiptRecord | null>(null);
  const [selectedRecordDetails, setSelectedRecordDetails] = useState<TransferReceiptDetailsRow[]>([]);
  const [detailsLoading, setDetailsLoading] = useState<boolean>(false);

  const stats = useMemo(
    () => ({
      total: allRecords.length,
      stores: new Set(allRecords.map((record) => record.receivedFromStore)).size,
      users: new Set(allRecords.map((record) => record.receivedUser)).size,
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

  const handleViewTransferDetails = useCallback(async (record: TransferReceiptRecord) => {
    setSelectedRecord(record);
    setSelectedRecordDetails([]);
    setDetailsLoading(true);
    setShowModal(true);

    try {
      const details = await centralStoresApi.fetchTransferReceiptDetails(record.id);
      setSelectedRecordDetails(Array.isArray(details) ? details : []);
    } catch (error) {
      setSelectedRecordDetails([]);
      showValidationError("Failed to fetch transfer receipt details.", "Validation");
    } finally {
      setDetailsLoading(false);
    }
  }, [centralStoresApi]);

  const tableColumns = useMemo(
    () => [
      {
        key: "slNo",
        label: "Sl. No",
        sortable: false,
        render: (_: unknown, __: unknown, idx: number) => idx + 1,
      },
      {
        key: "noteNumber",
        label: "Note Number",
        sortable: true,
        render: (value: string, record: TransferReceiptRecord) =>
          value ? (
            <span
              style={{
                color: "var(--bs-primary)",
                cursor: "pointer",
                fontWeight: "var(--font-weight-semibold)",
                textDecoration: "underline",
              }}
              onClick={(e) => {
                e.stopPropagation();
                void handleViewTransferDetails(record);
              }}
            >
              {value}
            </span>
          ) : null,
      },
      { key: "receivedDate", label: "Received Date", sortable: true },
      { key: "receivedUser", label: "Received User", sortable: true },
      { key: "receivedFromStore", label: "Received From Store", sortable: true },
    ],
    [handleViewTransferDetails]
  );

  const handleFilterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromDate || !toDate) {
      showValidationError("Please select both From Date and To Date.", "Validation");
      return;
    }
    if (fromDate > toDate) {
      showValidationError("From Date cannot be later than To Date.", "Validation");
      return;
    }

    const selectedStoreRaw = sessionStorage.getItem("selectedStore");
    const pharmacyStoreRaw = sessionStorage.getItem("pharmacySubModuleData");

    const selectedStore = selectedStoreRaw
      ? (JSON.parse(selectedStoreRaw) as SessionStoreData)
      : null;
    const pharmacyStore = pharmacyStoreRaw
      ? (JSON.parse(pharmacyStoreRaw) as SessionStoreData)
      : null;

    const masterId = Number(selectedStore?.masterId ?? pharmacyStore?.masterId ?? 0);

    if (!masterId) {
      showValidationError("Store context is missing. Please reselect the store.", "Validation");
      return;
    }

    setLoading(true);
    setSubmitted(false);

    try {
      const response = await centralStoresApi.fetchTransferReceipt(fromDate, toDate, masterId);
      const mappedRecords: TransferReceiptRecord[] = (Array.isArray(response)
        ? response
        : []
      ).map((item: TransferReceiptRow) => ({
        id: item.id,
        noteNumber: item.trNo,
        receivedDate: item.dateReceive,
        receivedUser: item.userName,
        receivedFromStore: item.storeName,
      }));

      setAllRecords(mappedRecords);
      setDisplayedData(mappedRecords);
      setSubmitted(true);
    } catch (error) {
      setAllRecords([]);
      setDisplayedData([]);
      showValidationError("Failed to fetch transfer receipts.", "Validation");
    } finally {
      setLoading(false);
    }
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
    setShowModal(false);
    setSelectedRecord(null);
    setSelectedRecordDetails([]);
    setDetailsLoading(false);
  };

  const handleSort = (key: string) => {
    const sortableKey = key as keyof TransferReceiptRecord;
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(sortableKey);
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
      <Container fluid className="p-3">
        <ReportHeader
          title="Transfer Receipt Register"
          subtitle={
            submitted
              ? getDateRangeText(fromDate, toDate)
              : "Select date range and click Submit"
          }
          onSearch={setSearchTerm}
          showSearch={true}
          showPrint={false}
          showExport={false}
          showSort={false}
        />

        <Card className="shadow-sm">
          <Card.Header>
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

            {submitted && (
              <div className="d-flex flex-wrap gap-2 mt-3">
                <Badge bg="primary" className="d-inline-flex align-items-center gap-1 px-3 py-2">
                  <span>Total Receipts</span>
                  <span>{stats.total}</span>
                </Badge>
                <Badge bg="info" className="d-inline-flex align-items-center gap-1 px-3 py-2">
                  <span>Source Stores</span>
                  <span>{stats.stores}</span>
                </Badge>
                <Badge bg="success" className="d-inline-flex align-items-center gap-1 px-3 py-2">
                  <span>Received Users</span>
                  <span>{stats.users}</span>
                </Badge>
              </div>
            )}
          </Card.Header>

          <Card.Body className="p-0">
            {loading ? (
              <div className="text-center py-5 text-muted">
                <Spinner animation="border" role="status" />
                <div className="mt-3">Loading transfer receipts...</div>
              </div>
            ) : (
              <div className="table-responsive">
                <ReportTable
                  data={displayedData}
                  columns={tableColumns}
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
            )}
          </Card.Body>

          <Card.Footer>
            <small className="text-muted" style={{ fontWeight: "var(--font-weight-medium)" }}>
              Records: <strong>{displayedData.length}</strong>
              {searchTerm && <span className="ms-2">(Filtered from {allRecords.length})</span>}
            </small>
          </Card.Footer>
        </Card>
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
                    <div
                      style={{
                        fontWeight: "var(--font-weight-semibold)",
                        color: "var(--bs-primary)",
                      }}
                    >
                      {selectedRecord.noteNumber}
                    </div>
                  </Col>
                  <Col md={4}>
                    <small className="text-muted" style={{ fontSize: "var(--font-size-xs)" }}>
                      Open Date
                    </small>
                    <div style={{ fontWeight: "var(--font-weight-semibold)" }}>
                      {selectedRecord.receivedDate}
                    </div>
                  </Col>
                  <Col md={4}>
                    <small className="text-muted" style={{ fontSize: "var(--font-size-xs)" }}>
                      Open User Name
                    </small>
                    <div style={{ fontWeight: "var(--font-weight-semibold)" }}>
                      {selectedRecord.receivedUser}
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
                    {detailsLoading ? (
                      <tr>
                        <td colSpan={7} className="text-center text-muted py-3">
                          Loading details...
                        </td>
                      </tr>
                    ) : selectedRecordDetails.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center text-muted py-3">
                          No items found.
                        </td>
                      </tr>
                    ) : (
                      selectedRecordDetails.map((item: TransferReceiptDetailsRow, index: number) => (
                        <tr key={`${item.batchNo}-${index}`}>
                          <td className="text-center">{index + 1}</td>
                          <td>{item.name}</td>
                          <td className="text-center">{item.batchNo}</td>
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
                Total Items: <strong>{selectedRecordDetails.length}</strong>
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

