import React, { useState } from "react";
import { Container, Card, Form, Button, Row, Col, Table, Spinner } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../../../state/store";
import PageHeader from "../../../../components/PageHeader";
import { showValidationError, showErrorToast } from "../../../../utils/alertUtil";
import { faTimesCircle, faEye } from "@fortawesome/free-solid-svg-icons";
import CashCounterApiService, { CancelBillRow, BillPatientDetails } from "../../../../api/cash-counter/cash-counter-api-service";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const CancelBill: React.FC = () => {
  const loginData = useSelector((state: RootState) => state.loginData);
  const navigate = useNavigate();
  const cashCounterApi = new CashCounterApiService();
  
  const today = new Date().toISOString().split("T")[0];
  
  const [opNo, setOpNo] = useState("");
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [loading, setLoading] = useState(false);
  const [bills, setBills] = useState<CancelBillRow[]>([]);
  const [billDisplays, setBillDisplays] = useState<Record<number, string>>({});
  const [loadingDisplays, setLoadingDisplays] = useState<Set<number>>(new Set());

  const handleSearch = async () => {
    // Validate inputs
    if (!opNo.trim()) {
      showValidationError("Please enter OP Number");
      return;
    }
    
    if (!fromDate || !toDate) {
      showValidationError("Please select both From Date and To Date");
      return;
    }

    if (new Date(fromDate) > new Date(toDate)) {
      showValidationError("From Date cannot be greater than To Date");
      return;
    }

    setLoading(true);
    setBills([]);
    setBillDisplays({});
    
    try {
      const response = await cashCounterApi.fetchBillsForCancel(opNo, fromDate, toDate);
      setBills(response);
      
      // Fetch bill displays for all bills
      if (response.length > 0) {
        loadBillDisplays(response);
      }
    } catch (error) {
      console.error("Error searching bills:", error);
      showErrorToast("Failed to fetch bills. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadBillDisplays = async (billsList: CancelBillRow[]) => {
    const newDisplays: Record<number, string> = {};
    
    for (const bill of billsList) {
      setLoadingDisplays(prev => new Set(prev).add(bill.finalBillId));
      
      try {
        const details = await cashCounterApi.fetchPatientDetailsByFinalBillId(bill.finalBillId);
        if (details?.billNo) {
          newDisplays[bill.finalBillId] = details.billNo;
        }
      } catch (error) {
        console.error(`Error fetching bill display for ${bill.finalBillId}:`, error);
      } finally {
        setLoadingDisplays(prev => {
          const newSet = new Set(prev);
          newSet.delete(bill.finalBillId);
          return newSet;
        });
      }
    }
    
    setBillDisplays(prev => ({ ...prev, ...newDisplays }));
  };

  const handleViewBillDetails = (bill: CancelBillRow) => {
    navigate(`/hims/system-admin/activities/bill-cancel/view/${bill.finalBillId}`, {
      state: { billInfo: bill }
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Container fluid className="p-4">
      

      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-4">
          <Form>
            <Row className="g-3 align-items-end">
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="fw-semibold">
                    OP Number <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter OP Number"
                    value={opNo}
                    onChange={(e) => setOpNo(e.target.value)}
                    onKeyPress={handleKeyPress}
                    autoFocus
                  />
                </Form.Group>
              </Col>
              
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="fw-semibold">
                    From Date <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    disabled={loading}
                  />
                </Form.Group>
              </Col>
              
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="fw-semibold">
                    To Date <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    disabled={loading}
                  />
                </Form.Group>
              </Col>
              
              <Col md={3}>
                <Button
                  className="theme-btn-primary w-100"
                  onClick={handleSearch}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Searching...
                    </>
                  ) : (
                    "Search"
                  )}
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {bills.length > 0 && (
        <Card className="border-0 shadow-sm">
          <Card.Header className="bg-light">
            <h6 className="mb-0">Search Results ({bills.length})</h6>
          </Card.Header>
          <Card.Body className="p-0">
            <div style={{ overflowX: "auto" }}>
              <Table striped bordered hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "60px" }}>S.No</th>
                    <th>Bill No</th>
                    <th>Patient Name</th>
                    <th>OP No</th>
                    <th>Date & Time</th>
                    <th>User</th>
                    <th className="text-end">Total</th>
                    <th className="text-end">Discount</th>
                    <th className="text-end">Pay</th>
                    <th className="text-end">Paid</th>
                    <th className="text-end">Balance</th>
                    <th className="text-center" style={{ width: "120px" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map((bill, index) => (
                    <tr key={bill.finalBillId}>
                      <td>{index + 1}</td>
                      <td>
                        {loadingDisplays.has(bill.finalBillId) ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          billDisplays[bill.finalBillId] || bill.finalBillId
                        )}
                      </td>
                      <td>{bill.patientName}</td>
                      <td>{bill.opNo}</td>
                      <td>
                        {formatDate(bill.dateTime)}
                        <br />
                        <small className="text-muted">{formatTime(bill.dateTime)}</small>
                      </td>
                      <td>{bill.userName}</td>
                      <td className="text-end">{bill.total.toFixed(2)}</td>
                      <td className="text-end">{bill.totDisc.toFixed(2)}</td>
                      <td className="text-end">{bill.pay.toFixed(2)}</td>
                      <td className="text-end">{bill.paid.toFixed(2)}</td>
                      <td className="text-end">{bill.balance.toFixed(2)}</td>
                      <td className="text-center">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleViewBillDetails(bill)}
                          title="View Bill Details"
                        >
                          <FontAwesomeIcon icon={faEye} className="me-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}

      {!loading && bills.length === 0 && fromDate && toDate && opNo && (
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center py-5">
            <p className="text-muted mb-0">No bills found for the selected criteria.</p>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default CancelBill;
