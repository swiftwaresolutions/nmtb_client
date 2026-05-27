import React, { useState } from "react";
import { Container, Row, Col, Card, Form, Button, Table, Nav, Spinner, Alert } from "react-bootstrap";
import CentralStoresApiService, { ConsumableRegisterRecord } from "../../../../api/central-stores/central-stores-api-service";
import { showErrorToast, showSuccessToast } from "../../../../utils/alertUtil";

interface ConsumableRecord {
  id: string;
  consumableNo: string;
  entryDate: string;
  entryUser: string;
  approvedDate?: string;
  approvedUser?: string;
}

interface SubModuleState {
  subModId: number;
  subModName: string;
  modGroupId: number;
  modGroupName: string;
  masterId: number;
}

const getStoreData = (): SubModuleState | null => {
  const centralStoresData = sessionStorage.getItem('selectedStore');
  if (centralStoresData) {
    return JSON.parse(centralStoresData);
  }
  
  const pharmacyData = sessionStorage.getItem('pharmacySubModuleData');
  if (pharmacyData) {
    const parsedData = JSON.parse(pharmacyData);
    return { ...parsedData, masterId: parsedData.masterId ?? 0 };
  }
  
  return null;
};

const ConsumableRegister: React.FC = () => {
  const today = new Date();
  const formattedToday = today.toISOString().split('T')[0];
  const [dateFrom, setDateFrom] = useState<string>(formattedToday);
  const [dateTo, setDateTo] = useState<string>(formattedToday);
  const [activeTab, setActiveTab] = useState<"approved" | "cancelled">("approved");
  const [showResults, setShowResults] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [approvedRecords, setApprovedRecords] = useState<ConsumableRecord[]>([]);
  const [cancelledRecords, setCancelledRecords] = useState<ConsumableRecord[]>([]);

  const apiService = new CentralStoresApiService();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!dateFrom || !dateTo) {
      showErrorToast("Please select both Date From and Date To");
      return;
    }

    // Validate date range
    if (new Date(dateFrom) > new Date(dateTo)) {
      showErrorToast("Date From cannot be later than Date To");
      return;
    }

    setIsLoading(true);
    try {
      const storeInfo = getStoreData();
      if (!storeInfo) {
        showErrorToast("Store information not found. Please select a store first.");
        setIsLoading(false);
        return;
      }

      // Format dates for API (ensure they're in YYYY-MM-DD format)
      const formattedFromDate = new Date(dateFrom).toISOString().split('T')[0];
      const formattedToDate = new Date(dateTo).toISOString().split('T')[0];

      const data = await apiService.fetchConsumableRegister(
        storeInfo.masterId,
        formattedFromDate,
        formattedToDate
      );

      // Separate records based on isApproved and isCancelled flags
      const approved: ConsumableRecord[] = [];
      const cancelled: ConsumableRecord[] = [];

      data.forEach((record: ConsumableRegisterRecord, index: number) => {
        const mappedRecord: ConsumableRecord = {
          id: `${record.consumableNo}-${index}`,
          consumableNo: record.consumableNo,
          entryDate: record.openDateTime,
          entryUser: record.createdUserName,
          approvedDate: record.approvedDateTime,
          approvedUser: record.approvedUserName,
        };

        if (record.isCancelled === 1) {
          cancelled.push(mappedRecord);
        } else if (record.isApproved === 1) {
          approved.push(mappedRecord);
        }
      });

      setApprovedRecords(approved);
      setCancelledRecords(cancelled);
      setShowResults(true);
      showSuccessToast(`Loaded ${approved.length} approved and ${cancelled.length} cancelled records`);
    } catch (err) {
      console.error("Error fetching consumable register:", err);
      setError("Failed to load consumable register. Please try again.");
      showErrorToast("Failed to load consumable register");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const currentRecords = activeTab === "approved" ? approvedRecords : cancelledRecords;

  return (
    <>
      <div className="content-header">
        <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>
          Consumable Register
        </h3>
      </div>

      <div className="content-body">
        <Container fluid>
          {/* Filter Section */}
          <Card className="mb-4 shadow-sm no-print">
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Row className="align-items-end">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>
                        Date From <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>
                        Date To <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Button
                      type="submit"
                      variant="primary"
                      className="w-100"
                      style={{ height: "38px" }}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                          />
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
              </Form>
            </Card.Body>
          </Card>

          {/* Error Alert */}
          {error && (
            <Alert variant="danger" onClose={() => setError("")} dismissible className="no-print">
              <Alert.Heading>Error</Alert.Heading>
              <p>{error}</p>
            </Alert>
          )}

          {/* Results Section */}
          {showResults && (
            <Card className="shadow-sm">
              <Card.Header className="bg-white">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    Consumable Register Report
                    {dateFrom && dateTo && (
                      <small className="text-muted ms-3">
                        ({new Date(dateFrom).toLocaleDateString()} - {new Date(dateTo).toLocaleDateString()})
                      </small>
                    )}
                  </h5>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={handlePrint}
                    className="no-print"
                  >
                    <i className="fas fa-print me-2"></i>
                    Print
                  </Button>
                </div>
              </Card.Header>
              <Card.Body>
                {/* Tabs for Approved/Cancelled */}
                <Nav variant="tabs" className="mb-3 no-print">
                  <Nav.Item>
                    <Nav.Link
                      active={activeTab === "approved"}
                      onClick={() => setActiveTab("approved")}
                      style={{ cursor: "pointer" }}
                    >
                      <i className="fas fa-check-circle me-2 text-success"></i>
                      Approved ({approvedRecords.length})
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link
                      active={activeTab === "cancelled"}
                      onClick={() => setActiveTab("cancelled")}
                      style={{ cursor: "pointer" }}
                    >
                      <i className="fas fa-times-circle me-2 text-danger"></i>
                      Cancelled ({cancelledRecords.length})
                    </Nav.Link>
                  </Nav.Item>
                </Nav>

                {/* Print Header - Only visible when printing */}
                <div className="print-only mb-3">
                  <h4 className="text-center">
                    {activeTab === "approved" ? "Approved" : "Cancelled"} Consumables
                  </h4>
                  <p className="text-center text-muted">
                    Date Range: {new Date(dateFrom).toLocaleDateString()} - {new Date(dateTo).toLocaleDateString()}
                  </p>
                </div>

                {/* Data Table */}
                <div style={{ maxHeight: "500px", overflowY: "auto" }}>
                  <Table striped bordered hover className="table-hims">
                    <thead>
                      <tr>
                        <th style={{ width: "80px" }}>Sl. No.</th>
                        <th>Consumable No.</th>
                        <th>Entry Date</th>
                        <th>Entry User</th>
                        {activeTab === "approved" && (
                          <>
                            <th>Approved Date</th>
                            <th>Approved User</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {currentRecords.length === 0 ? (
                        <tr>
                          <td colSpan={activeTab === "approved" ? 6 : 4} className="text-center text-muted py-4">
                            No {activeTab} consumables found for the selected date range.
                          </td>
                        </tr>
                      ) : (
                        currentRecords.map((record, idx) => (
                          <tr key={record.id}>
                            <td className="text-center">{idx + 1}</td>
                            <td>{record.consumableNo}</td>
                            <td>{new Date(record.entryDate).toLocaleDateString()}</td>
                            <td>{record.entryUser}</td>
                            {activeTab === "approved" && (
                              <>
                                <td>{record.approvedDate ? new Date(record.approvedDate).toLocaleDateString() : "-"}</td>
                                <td>{record.approvedUser || "-"}</td>
                              </>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </div>

                {/* Summary */}
                {currentRecords.length > 0 && (
                  <div className="mt-3 p-3 bg-light rounded">
                    <Row>
                      <Col md={6}>
                        <strong>Total {activeTab === "approved" ? "Approved" : "Cancelled"} Records:</strong>{" "}
                        {currentRecords.length}
                      </Col>
                      <Col md={6} className="text-end">
                        <small className="text-muted">
                          Generated on: {new Date().toLocaleString()}
                        </small>
                      </Col>
                    </Row>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}

          {/* Initial Message */}
          {!showResults && (
            <Card className="shadow-sm">
              <Card.Body className="text-center py-5">
                <i className="fas fa-info-circle fa-3x text-muted mb-3"></i>
                <h5 className="text-muted">Select date range and click Submit to view consumable records</h5>
              </Card.Body>
            </Card>
          )}
        </Container>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          .content-header {
            display: none;
          }
        }
        .print-only {
          display: none;
        }
      `}</style>
    </>
  );
};

export default ConsumableRegister;
