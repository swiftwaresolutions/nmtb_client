import React, { useState, useEffect } from "react";
import { Container, Card, Button, Row, Col, Form, Table, Spinner } from "react-bootstrap";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { showErrorToast, showSuccessToast, showConfirmDialog, showValidationError } from "../../../../utils/alertUtil";
import { faArrowLeft, faTimesCircle, faBan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CashCounterApiService, { BillPatientDetails, CancelBillRow } from "../../../../api/cash-counter/cash-counter-api-service";
import PageHeader from "../../../../components/PageHeader";
import { RootState } from "../../../../state/store";

interface BillViewDetails {
  billInfo: CancelBillRow;
  patientDetails: BillPatientDetails | null;
}

interface BillItem {
  particularName?: string;
  groupName?: string;
  prodsName?: string;
  genericName?: string;
  testName?: string;
  unit?: number;
  units?: number;
  unitRate?: number;
  rate?: number;
  totalRate?: number;
  total?: number;
  totalAmount?: number;
  discount?: number;
}

interface BillContentData {
  cashItems?: BillItem[];
  pharmacyItems?: BillItem[];
  labItems?: BillItem[];
  ipItems?: BillItem[];
  pharmacyReturnItems?: BillItem[];
}

const CancelBillView: React.FC = () => {
  const { finalBillId } = useParams<{ finalBillId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const loginData = useSelector((state: RootState) => state.loginData);
  const cashCounterApi = new CashCounterApiService();

  const [loading, setLoading] = useState(true);
  const [billDetails, setBillDetails] = useState<BillViewDetails | null>(null);
  const [billContent, setBillContent] = useState<BillContentData | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!finalBillId) {
      showErrorToast("Bill ID is missing");
      navigate(-1);
      return;
    }

    loadBillDetails();
  }, [finalBillId]);

  const loadBillDetails = async () => {
    setLoading(true);
    try {
      // Fetch patient details
      const patDetails = await cashCounterApi.fetchPatientDetailsByFinalBillId(Number(finalBillId));
      
      // Fetch bill content
      const billContentData = await cashCounterApi.fetchBillViewWithType(Number(finalBillId));
      
      // Get bill info from location state passed during navigation
      const billInfo = (location.state as any)?.billInfo as CancelBillRow | undefined;
      
      if (!billInfo) {
        showErrorToast("Bill information is missing");
        navigate(-1);
        return;
      }

      setBillDetails({
        billInfo,
        patientDetails: patDetails,
      });
      
      // Extract bill items from response
      if (billContentData && !billContentData.isDueHistory) {
        setBillContent(billContentData.data as BillContentData);
      }
    } catch (error) {
      console.error("Error loading bill details:", error);
      showErrorToast("Failed to load bill details");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBill = async () => {
    if (!cancelReason.trim()) {
      showValidationError("Please enter reason for cancellation");
      return;
    }

    if (!billDetails) {
      showErrorToast("Bill details not loaded");
      return;
    }

    const confirmed = await showConfirmDialog(
      "Cancel this bill?",
      `This will cancel bill ${billDetails.patientDetails?.billNo || finalBillId}. This action cannot be undone.`
    );

    if (!confirmed) return;

    setSubmitting(true);
    try {
      await cashCounterApi.cancelBill(Number(finalBillId), cancelReason);
      
      showSuccessToast("Bill cancelled successfully");
      navigate(-1);
    } catch (error) {
      console.error("Error cancelling bill:", error);
      showErrorToast("Failed to cancel bill. Please try again.");
      setSubmitting(false);
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

  if (loading) {
    return (
      <Container fluid className="p-4">
        
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">Loading bill details...</p>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  if (!billDetails) {
    return (
      <Container fluid className="p-4">
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center py-5">
            <p className="text-muted">Bill details not available</p>
            <Button variant="outline-secondary" onClick={() => navigate(-1)} className="theme-outline-btn-primary">
              <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
              Go Back
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  const { billInfo, patientDetails } = billDetails;

  return (
    <Container fluid className="p-4">

      {/* Back Button */}
      <div className="mb-3">
        <Button variant="" size="sm" onClick={() => navigate(-1)} className="theme-outline-btn-primary">
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          Back to List
        </Button>
      </div>

      {/* Patient & Bill Information */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Header className="bg-light">
          <h6 className="mb-0">Patient & Bill Information</h6>
        </Card.Header>
        <Card.Body className="p-4">
          <Row className="g-3">
            <Col md={6}>
              <div className="mb-3">
                <label className="text-muted small">Bill Number</label>
                <div className="fw-semibold">{patientDetails?.billNo || finalBillId}</div>
              </div>
            </Col>
            <Col md={6}>
              <div className="mb-3">
                <label className="text-muted small">Bill Date & Time</label>
                <div className="fw-semibold">
                  {formatDate(billInfo.dateTime)} {formatTime(billInfo.dateTime)}
                </div>
              </div>
            </Col>
            <Col md={6}>
              <div className="mb-3">
                <label className="text-muted small">Patient Name</label>
                <div className="fw-semibold">{billInfo.patientName}</div>
              </div>
            </Col>
            <Col md={6}>
              <div className="mb-3">
                <label className="text-muted small">OP Number</label>
                <div className="fw-semibold">{billInfo.opNo}</div>
              </div>
            </Col>
            <Col md={6}>
              <div className="mb-3">
                <label className="text-muted small">Billed By</label>
                <div className="fw-semibold">{billInfo.userName}</div>
              </div>
            </Col>
            {patientDetails?.accountHead && (
              <Col md={6}>
                <div className="mb-3">
                  <label className="text-muted small">Account Head</label>
                  <div className="fw-semibold">{patientDetails.accountHead}</div>
                </div>
              </Col>
            )}
          </Row>
        </Card.Body>
      </Card>

      {/* Bill Items/Content */}
      {billContent && (
        <Card className="border-0 shadow-sm mb-4">
          <Card.Header className="bg-light">
            <h6 className="mb-0">Bill Items</h6>
          </Card.Header>
          <Card.Body className="p-0">
            <div style={{ overflowX: "auto" }}>
              <Table bordered className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "50px" }}>S.No</th>
                    <th>Item / Service</th>
                    <th className="text-center" style={{ width: "80px" }}>Qty</th>
                    <th className="text-end" style={{ width: "100px" }}>Rate</th>
                    <th className="text-end" style={{ width: "100px" }}>Discount</th>
                    <th className="text-end" style={{ width: "120px" }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Cash Items (Investigations/Procedures) */}
                  {(billContent.cashItems || []).length > 0 && (
                    <>
                      <tr className="table-secondary">
                        <td colSpan={6} className="fw-semibold">
                          Investigation / Procedures
                        </td>
                      </tr>
                      {(billContent.cashItems || []).map((item, idx) => (
                        <tr key={`cash-${idx}`}>
                          <td>{idx + 1}</td>
                          <td>
                            {item.particularName}
                            {item.groupName && (
                              <small className="text-muted d-block">{item.groupName}</small>
                            )}
                          </td>
                          <td className="text-center">{item.unit || 0}</td>
                          <td className="text-end">₹ {(item.unitRate || 0).toFixed(2)}</td>
                          <td className="text-end">
                            {(item.discount || 0) > 0 ? `₹ ${(item.discount || 0).toFixed(2)}` : "—"}
                          </td>
                          <td className="text-end fw-semibold">
                            ₹ {(item.totalRate || 0).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </>
                  )}

                  {/* Pharmacy Items */}
                  {(billContent.pharmacyItems || []).length > 0 && (
                    <>
                      <tr className="table-secondary">
                        <td colSpan={6} className="fw-semibold">Pharmacy</td>
                      </tr>
                      {(billContent.pharmacyItems || []).map((item, idx) => (
                        <tr key={`pharmacy-${idx}`}>
                          <td>{idx + 1}</td>
                          <td>
                            {item.prodsName}
                            {item.genericName && (
                              <small className="text-muted d-block">{item.genericName}</small>
                            )}
                          </td>
                          <td className="text-center">{item.units || 0}</td>
                          <td className="text-end">₹ {((item.total || 0) / (item.units || 1)).toFixed(2)}</td>
                          <td className="text-end">
                            {(item.discount || 0) > 0 ? `₹ ${(item.discount || 0).toFixed(2)}` : "—"}
                          </td>
                          <td className="text-end fw-semibold">
                            ₹ {(item.total || 0).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </>
                  )}

                  {/* Lab Items */}
                  {(billContent.labItems || []).length > 0 && (
                    <>
                      <tr className="table-secondary">
                        <td colSpan={6} className="fw-semibold">Laboratory</td>
                      </tr>
                      {(billContent.labItems || []).map((item, idx) => (
                        <tr key={`lab-${idx}`}>
                          <td>{idx + 1}</td>
                          <td>{item.testName}</td>
                          <td className="text-center">{item.units || 0}</td>
                          <td className="text-end">₹ {(item.rate || 0).toFixed(2)}</td>
                          <td className="text-end">—</td>
                          <td className="text-end fw-semibold">
                            ₹ {(item.totalAmount || 0).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </>
                  )}

                  {/* IP Items */}
                  {(billContent.ipItems || []).length > 0 && (
                    <>
                      <tr className="table-secondary">
                        <td colSpan={6} className="fw-semibold">IP Services</td>
                      </tr>
                      {(billContent.ipItems || []).map((item, idx) => (
                        <tr key={`ip-${idx}`}>
                          <td>{idx + 1}</td>
                          <td>
                            {item.particularName}
                            {item.groupName && (
                              <small className="text-muted d-block">{item.groupName}</small>
                            )}
                          </td>
                          <td className="text-center">{item.unit || 0}</td>
                          <td className="text-end">₹ {(item.unitRate || 0).toFixed(2)}</td>
                          <td className="text-end">
                            {(item.discount || 0) > 0 ? `₹ ${(item.discount || 0).toFixed(2)}` : "—"}
                          </td>
                          <td className="text-end fw-semibold">
                            ₹ {(item.totalRate || 0).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </>
                  )}

                  {/* Pharmacy Return Items */}
                  {(billContent.pharmacyReturnItems || []).length > 0 && (
                    <>
                      <tr className="table-warning">
                        <td colSpan={6} className="fw-semibold">Pharmacy Returns</td>
                      </tr>
                      {(billContent.pharmacyReturnItems || []).map((item, idx) => (
                        <tr key={`return-${idx}`} className="table-warning bg-opacity-25">
                          <td>{idx + 1}</td>
                          <td>
                            {item.prodsName}
                            {item.genericName && (
                              <small className="text-muted d-block">{item.genericName}</small>
                            )}
                          </td>
                          <td className="text-center">{item.units || 0}</td>
                          <td className="text-end">₹ {((item.total || 0) / (item.units || 1)).toFixed(2)}</td>
                          <td className="text-end">—</td>
                          <td className="text-end fw-semibold">
                            ₹ {(item.total || 0).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Bill Amount Details */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Header className="bg-light">
          <h6 className="mb-0">Amount Details</h6>
        </Card.Header>
        <Card.Body className="p-4">
          <Table bordered className="mb-0">
            <tbody>
              <tr>
                <td className="fw-semibold" style={{ width: "40%" }}>Total Amount</td>
                <td className="text-end">₹ {billInfo.total.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="fw-semibold">Discount</td>
                <td className="text-end">₹ {billInfo.totDisc.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="fw-semibold">Payable Amount</td>
                <td className="text-end">₹ {billInfo.pay.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="fw-semibold">Paid Amount</td>
                <td className="text-end">₹ {billInfo.paid.toFixed(2)}</td>
              </tr>
              <tr className="table-light">
                <td className="fw-bold">Balance</td>
                <td className="text-end fw-bold">₹ {billInfo.balance.toFixed(2)}</td>
              </tr>
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Cancel Bill Section */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-danger bg-opacity-10">
          <h6 className="mb-0 text-danger">
            <FontAwesomeIcon icon={faBan} className="me-2" />
            Cancel Bill
          </h6>
        </Card.Header>
        <Card.Body className="p-4">
          <Form>
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">
                Reason for Cancellation <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Enter detailed reason for cancelling this bill..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                disabled={submitting}
              />
            </Form.Group>

            <div className="d-flex gap-2">
              <Button
                variant="danger"
                onClick={handleCancelBill}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faBan} className="me-2" />
                    Cancel Bill
                  </>
                )}
              </Button>
              <Button
                variant=""
                onClick={() => navigate(-1)}
                disabled={submitting}
                className="theme-outline-btn-primary"
              >
                Go Back
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CancelBillView;
