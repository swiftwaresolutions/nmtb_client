import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Container, Card, Form, Button, Row, Col, Badge, Modal, Table } from "react-bootstrap";
import { ArrowUp, ArrowDown } from "react-bootstrap-icons";
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

/**
 * Transfer Register Interface
 */
interface TransferRecord {
  noteNumber: string;
  approvedUser: string;
  approvedDate: string;
  cancelledUser: string;
  cancelledDate: string;
  receivedUser: string;
  receivedDate: string;
  receivedPerson: string;
  receivingStore: string;
}

/**
 * Transfer Detail Item Interface (for modal)
 */
interface TransferDetailItem {
  slNo: number;
  productName: string;
  batchNo: string;
  expDate: string;
  units: number;
  unitCost: number;
  unitMRP: number;
  totalCost: number;
  totalMRP: number;
}

/**
 * Transfer Detail Interface (for modal)
 */
interface TransferDetail {
  noteNumber: string;
  date: string;
  transferredTo: string;
  receivedPerson: string;
  items: TransferDetailItem[];
  totalCost: number;
  totalMRP: number;
}

/**
 * Get pharmacy store data from session storage
 */
const getStoreData = (): any => {
  const pharmacyData = sessionStorage.getItem('pharmacySubModuleData');
  if (pharmacyData) {
    return JSON.parse(pharmacyData);
  }
  
  return {};
};

/**
 * Transfer Register Component
 * Displays transfer records for the medical store
 * 
 * TODO: This is a placeholder component. 
 * Update with actual data columns when provided by user.
 */
export default function PhTransferRegister() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Get store data from session storage (supports both Central Stores and Pharmacy Stores)
  const storeData = getStoreData();

  // Filter state
  const [fromDate, setFromDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [toDate, setToDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Department options - TODO: Fetch from API
  const departments = [
    { id: 1, name: "IP" },
    { id: 2, name: "OP" },
    { id: 3, name: "ICU" },
    { id: 4, name: "Emergency" },
    { id: 5, name: "Casualty" },
    { id: 6, name: "Pharmacy" },
  ];

  // Transfer route info
  const [transferRoute, setTransferRoute] = useState<string>("OP Dispensary to Casualty");

  // Sample data - TODO: Update when user provides actual data structure
  const [tableData, setTableData] = useState<TransferRecord[]>([]);

  // Data state
  const [filteredByDate, setFilteredByDate] = useState<TransferRecord[]>([]);
  const [displayedData, setDisplayedData] = useState<TransferRecord[]>([]);

  // Search and sort state
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortKey, setSortKey] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Statistics
  const [stats, setStats] = useState({
    totalTransfers: 0,
    approvedCount: 0,
    receivedCount: 0,
    cancelledCount: 0,
  });

  // Modal state
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [selectedTransfer, setSelectedTransfer] = useState<TransferDetail | null>(null);

  // Sample transfer details data - TODO: Replace with actual API call
  const transferDetailsMap: Record<string, TransferDetail> = {
    "null164-21": {
      noteNumber: "null164-21",
      date: "03/10/2025",
      transferredTo: "Casualty",
      receivedPerson: "-",
      items: [
        { slNo: 1, productName: "NS 3", batchNo: "2503042008", expDate: "31/03/2028", units: 2, unitCost: 66.08, unitMRP: 188.00, totalCost: 132.16, totalMRP: 376.00 },
        { slNo: 2, productName: "NS IVF 100ML", batchNo: "5006", expDate: "30/04/2028", units: 2, unitCost: 15.12, unitMRP: 22.39, totalCost: 30.24, totalMRP: 44.78 },
        { slNo: 3, productName: "DISPOVAN 1 ML", batchNo: "12AG22", expDate: "31/03/2029", units: 2, unitCost: 4.256, unitMRP: 9.30, totalCost: 8.512, totalMRP: 18.60 },
        { slNo: 4, productName: "DISPOVAN 2 ML", batchNo: "52S", expDate: "31/03/2030", units: 2, unitCost: 2.038, unitMRP: 8.40, totalCost: 4.076, totalMRP: 16.80 },
        { slNo: 5, productName: "DISPOVAN 5 ML", batchNo: "54NG2", expDate: "30/06/2030", units: 2, unitCost: 2.856, unitMRP: 10.00, totalCost: 5.712, totalMRP: 20.00 },
      ],
      totalCost: 180.70,
      totalMRP: 476.18,
    },
    "null168-21": {
      noteNumber: "null168-21",
      date: "04/10/2025",
      transferredTo: "Casualty",
      receivedPerson: "-",
      items: [
        { slNo: 1, productName: "NS 3", batchNo: "2503042008", expDate: "31/03/2028", units: 2, unitCost: 66.08, unitMRP: 188.00, totalCost: 132.16, totalMRP: 376.00 },
        { slNo: 2, productName: "DISPOVAN 2 ML", batchNo: "52S", expDate: "31/03/2030", units: 3, unitCost: 2.038, unitMRP: 8.40, totalCost: 6.114, totalMRP: 25.20 },
      ],
      totalCost: 138.27,
      totalMRP: 401.20,
    },
    "null170-21": {
      noteNumber: "null170-21",
      date: "06/10/2025",
      transferredTo: "Casualty",
      receivedPerson: "-",
      items: [
        { slNo: 1, productName: "NS IVF 100ML", batchNo: "5006", expDate: "30/04/2028", units: 5, unitCost: 15.12, unitMRP: 22.39, totalCost: 75.60, totalMRP: 111.95 },
        { slNo: 2, productName: "DISPOVAN 5 ML", batchNo: "54NG2", expDate: "30/06/2030", units: 10, unitCost: 2.856, unitMRP: 10.00, totalCost: 28.56, totalMRP: 100.00 },
      ],
      totalCost: 104.16,
      totalMRP: 211.95,
    },
  };

  // On mount, initialize filtered data
  useEffect(() => {
    const filtered = tableData;
    calculateStats(filtered);
    setFilteredByDate(filtered);
    updateDisplayedData(filtered, searchTerm, sortKey, sortDirection);
  }, [tableData]);

  // Update displayed data when search or sort changes
  useEffect(() => {
    updateDisplayedData(filteredByDate, searchTerm, sortKey, sortDirection);
  }, [searchTerm, sortKey, sortDirection, filteredByDate]);

  // Calculate statistics
  const calculateStats = (records: TransferRecord[]) => {
    const approvedCount = records.filter(r => r.approvedUser && r.approvedUser !== "-").length;
    const receivedCount = records.filter(r => r.receivedUser && r.receivedUser !== "-").length;
    const cancelledCount = records.filter(r => r.cancelledUser && r.cancelledUser !== "-").length;
    
    setStats({
      totalTransfers: records.length,
      approvedCount,
      receivedCount,
      cancelledCount,
    });
  };

  // Handle filter submit
  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      console.log("Fetching transfer records:", {
        fromDate,
        toDate,
        department: selectedDepartment,
        store: storeData?.subModName
      });
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const sampleData: TransferRecord[] = [
        {
          noteNumber: "null164-21",
          approvedUser: "susan",
          approvedDate: "03/10/2025",
          cancelledUser: "-",
          cancelledDate: "-",
          receivedUser: "susan",
          receivedDate: "03/10/2025",
          receivedPerson: "null",
          receivingStore: "Casualty",
        },
        {
          noteNumber: "null168-21",
          approvedUser: "susan",
          approvedDate: "04/10/2025",
          cancelledUser: "-",
          cancelledDate: "-",
          receivedUser: "susan",
          receivedDate: "04/10/2025",
          receivedPerson: "null",
          receivingStore: "Casualty",
        },
        {
          noteNumber: "null170-21",
          approvedUser: "susan",
          approvedDate: "06/10/2025",
          cancelledUser: "-",
          cancelledDate: "-",
          receivedUser: "susan",
          receivedDate: "06/10/2025",
          receivedPerson: "null",
          receivingStore: "Casualty",
        },
      ];
      setTableData(sampleData);
    } catch (error) {
      console.error("Error fetching transfer records:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update displayed data with search and sort
  const updateDisplayedData = (
    records: TransferRecord[],
    search: string,
    sortK: string,
    sortDir: "asc" | "desc"
  ) => {
    let result = records;

    if (search) {
      result = searchTableData(result, search, [
        "noteNumber",
        "approvedUser",
        "receivedUser",
        "receivedPerson",
        "receivingStore",
      ]);
    }

    if (sortK) {
      result = sortTableData(result, sortK as keyof TransferRecord, sortDir);
    }

    setDisplayedData(result);
  };

  const handleSort = (key: string, direction: "asc" | "desc") => {
    setSortKey(key);
    setSortDirection(direction);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handlePrint = () => {
    printReport();
  };

  const handleExport = () => {
    const exportData = displayedData.map((record, index) => ({
      "Sl. No": index + 1,
      "Note Number": record.noteNumber,
      "Approved User": record.approvedUser,
      "Approved Date": record.approvedDate,
      "Cancelled User": record.cancelledUser,
      "Cancelled Date": record.cancelledDate,
      "Received User": record.receivedUser,
      "Received Date": record.receivedDate,
      "Received Person": record.receivedPerson,
      "Receiving Store": record.receivingStore,
    }));

    exportToExcel(
      exportData,
      `Transfer_Register_${storeData.subModName || "MedicalStore"}_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
      "Transfer Register"
    );
  };

  const handleNoteNumberClick = (noteNumber: string) => {
    const details = transferDetailsMap[noteNumber];
    if (details) {
      setSelectedTransfer(details);
      setShowDetailModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedTransfer(null);
  };

  const columns = [
    {
      key: "noteNumber",
      label: "Note Number",
      sortable: true,
      render: (value: string) => (
        <span
          className="fw-semibold text-primary"
          style={{ cursor: "pointer", textDecoration: "underline" }}
          onClick={() => handleNoteNumberClick(value)}
          title="Click to view transfer details"
        >
          {value || "-"}
        </span>
      ),
    },
    {
      key: "approvedUser",
      label: "Approved User",
      sortable: true,
      render: (value: string) => <span>{value || "-"}</span>,
    },
    {
      key: "approvedDate",
      label: "Approved Date",
      sortable: true,
      render: (value: string) => <span>{value || "-"}</span>,
    },
    {
      key: "cancelledUser",
      label: "Cancelled User",
      sortable: true,
      render: (value: string) => (
        <span className={value && value !== "-" ? "text-danger" : ""}>{value || "-"}</span>
      ),
    },
    {
      key: "cancelledDate",
      label: "Cancelled Date",
      sortable: true,
      render: (value: string) => (
        <span className={value && value !== "-" ? "text-danger" : ""}>{value || "-"}</span>
      ),
    },
    {
      key: "receivedUser",
      label: "Received User",
      sortable: true,
      render: (value: string) => <span>{value || "-"}</span>,
    },
    {
      key: "receivedDate",
      label: "Received Date",
      sortable: true,
      render: (value: string) => <span>{value || "-"}</span>,
    },
    {
      key: "receivedPerson",
      label: "Received Person",
      sortable: true,
      render: (value: string) => <span>{value === "null" ? "-" : value || "-"}</span>,
    },
    {
      key: "receivingStore",
      label: "Receiving Store",
      sortable: true,
      render: (value: string) => (
        <Badge bg="info" className="fw-normal">{value || "-"}</Badge>
      ),
    },
  ];

  return (
    <>
      <Container fluid className="p-3" style={{ backgroundColor: "#f8f9fc" }}>
        {/* Report Header */}
        <ReportHeader
          title="Transfer Register"
          subtitle={`${storeData.subModName || "Medical Store"} - Transfer Records`}
          onPrint={handlePrint}
          onExport={handleExport}
          onSearch={handleSearch}
          showSearch={true}
          showPrint={true}
          showExport={true}
        />

        {/* Filter Section */}
        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <Row className="align-items-end g-3">
              <Col xs={12} sm={6} md={3}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-muted small mb-1">Date From</Form.Label>
                  <Form.Control
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="form-control-sm"
                  />
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} md={3}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-muted small mb-1">Date To</Form.Label>
                  <Form.Control
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="form-control-sm"
                  />
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} md={3}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-muted small mb-1">Select Department</Form.Label>
                  <Form.Select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="form-control-sm"
                  >
                    <option value="">-- All Departments --</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} md={3}>
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-100"
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-search me-2"></i>
                      Submit
                    </>
                  )}
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Transfer Route Header */}
        {transferRoute && (
          <Card className="mb-3 shadow-sm border-0" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
            <Card.Body className="py-2 text-center">
              <h5 className="mb-0 text-white fw-bold">
                <i className="fas fa-exchange-alt me-2"></i>
                {transferRoute}
              </h5>
            </Card.Body>
          </Card>
        )}

        {/* KPI Cards */}
        <Row className="g-3 mb-4">
          <Col xs={12} sm={6} md={3}>
            <ReportKPICard label="Total Transfers" value={stats.totalTransfers} variant="primary" />
          </Col>
          <Col xs={12} sm={6} md={3}>
            <ReportKPICard label="Approved & Received" value={stats.approvedCount} variant="success" />
          </Col>
          <Col xs={12} sm={6} md={3}>
            <ReportKPICard label="Received" value={stats.receivedCount} variant="info" />
          </Col>
          <Col xs={12} sm={6} md={3}>
            <ReportKPICard label="Cancelled" value={stats.cancelledCount} variant="danger" />
          </Col>
        </Row>

        {/* Report Table Card */}
        <Card className="report-card shadow-sm">
          <Card.Header
            className="report-card-header py-2"
            style={{
              background: "linear-gradient(to right, #f8f9fa, #ffffff)",
              textAlign: "start",
            }}
          >
            <small className="text-muted" style={{ fontWeight: "500" }}>
              Total Records: <strong>{displayedData.length}</strong>
              {searchTerm && (
                <span className="ms-2">(Filtered from {filteredByDate.length})</span>
              )}
            </small>
          </Card.Header>
          <Card.Body
            className="p-0"
            style={{ maxHeight: "calc(100vh - 380px)", overflow: "auto" }}
          >
            <ReportTable<TransferRecord>
              data={displayedData}
              columns={columns}
              onSort={handleSort}
              hover={true}
              emptyMessage="No transfer records found. Please select filters and click Submit."
            />
          </Card.Body>
        </Card>

        {/* Transfer Details Modal */}
        <Modal
          show={showDetailModal}
          onHide={handleCloseModal}
          size="xl"
          centered
          backdrop="static"
        >
          <Modal.Header
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              borderBottom: "none",
            }}
          >
            <Modal.Title className="w-100 d-flex justify-content-between align-items-center">
              <span>
                <i className="fas fa-file-alt me-2"></i>
                Transfer Details
              </span>
              <Button
                variant="light"
                size="sm"
                onClick={handleCloseModal}
                className="fw-semibold"
              >
                <i className="fas fa-arrow-left me-1"></i>
                Back
              </Button>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            {selectedTransfer && (
              <>
                {/* Transfer Info Section */}
                <Card className="mb-4 border-0 shadow-sm">
                  <Card.Body className="py-3">
                    <Row className="g-3">
                      <Col xs={12} md={6}>
                        <Row>
                          <Col xs={5} className="text-muted fw-semibold">Transfer Note No</Col>
                          <Col xs={7} className="fw-bold text-primary">{selectedTransfer.noteNumber}</Col>
                        </Row>
                      </Col>
                      <Col xs={12} md={6}>
                        <Row>
                          <Col xs={5} className="text-muted fw-semibold">Date</Col>
                          <Col xs={7}>{selectedTransfer.date}</Col>
                        </Row>
                      </Col>
                      <Col xs={12} md={6}>
                        <Row>
                          <Col xs={5} className="text-muted fw-semibold">Transferred To</Col>
                          <Col xs={7}>
                            <Badge bg="info" className="fw-normal">{selectedTransfer.transferredTo}</Badge>
                          </Col>
                        </Row>
                      </Col>
                      <Col xs={12} md={6}>
                        <Row>
                          <Col xs={5} className="text-muted fw-semibold">Received Person</Col>
                          <Col xs={7}>{selectedTransfer.receivedPerson}</Col>
                        </Row>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                {/* Products Table */}
                <div className="table-responsive">
                  <Table striped bordered hover size="sm">
                    <thead style={{ background: "#f8f9fa" }}>
                      <tr>
                        <th className="text-center" style={{ width: "60px" }}>Sl.No</th>
                        <th>Product Name</th>
                        <th>Batch No</th>
                        <th>Exp.Date</th>
                        <th className="text-end">Units</th>
                        <th className="text-end">Unit Cost</th>
                        <th className="text-end">Unit MRP</th>
                        <th className="text-end">Total Cost</th>
                        <th className="text-end">Total MRP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTransfer.items.map((item) => (
                        <tr key={item.slNo}>
                          <td className="text-center">{item.slNo}</td>
                          <td className="fw-semibold">{item.productName}</td>
                          <td>{item.batchNo}</td>
                          <td>{item.expDate}</td>
                          <td className="text-end">{item.units}</td>
                          <td className="text-end">{item.unitCost.toFixed(2)}</td>
                          <td className="text-end">{item.unitMRP.toFixed(2)}</td>
                          <td className="text-end">{item.totalCost.toFixed(2)}</td>
                          <td className="text-end">{item.totalMRP.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot style={{ background: "#e9ecef", fontWeight: "bold" }}>
                      <tr>
                        <td colSpan={7} className="text-end">Total :</td>
                        <td className="text-end text-success">{selectedTransfer.totalCost.toFixed(2)}</td>
                        <td className="text-end text-primary">{selectedTransfer.totalMRP.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </Table>
                </div>
              </>
            )}
          </Modal.Body>
        </Modal>
      </Container>
    </>
  );
}
