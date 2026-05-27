import React, { useState } from "react";
import {
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
  Badge,
  Modal,
} from "react-bootstrap";
import { 
  Search, 
  PersonCheck,
  Receipt,
  CartX,
  CashCoin,
  ClipboardData,
  CheckCircle,
  Trash,
  Printer,
  ArrowCounterclockwise
} from "react-bootstrap-icons";
import PageHeader from "../../../../components/PageHeader";
import SearchInput from "../../../../components/SearchInput";
import PatientSearchModal, { Patient } from "../../../../components/search-modal/PatientSearchModal";
import { faUndo } from "@fortawesome/free-solid-svg-icons";
import { showSuccessModal, showErrorToast, showValidationError } from "../../../../utils/alertUtil";
import { PharmacyStoresApiService, PatientDetailsResponse, OpVisitResponse, PharmacyBillDetailsItem, SaveSalesReturnRequest } from "../../../../api/pharmacy-stores/pharmacy-stores-api-service";
import { useTableSearch } from "../../../../hooks/useTableSearch";
import { formatNumberDisplay, handleNumberBlur, handleNumberChange } from "../../../../utils/numberInputUtil";
import DuplicateBillView from "../../../../cash-counter/pages/activities/DuplicateBillView";

interface SaveSalesReturnResponse {
  cashFinalBillNo: string;
  phReturnNo: string;
  advanceNo: string;
  patId: number;
  visitId: number;
  totalReturnAmount: number;
  message: string;
  transactionDateTime: string;
}

// Extended interface to track current return quantity
interface MedicineWithReturnQty extends PharmacyBillDetailsItem {
  phBillId: number;
  finalBillId: number;
  paidType: string;
  currentReturnQty?: number;
}

const resolvePharmacyStoreId = (): number | null => {
  try {
    const pharmacyData = sessionStorage.getItem('pharmacySubModuleData');
    if (pharmacyData) {
      const parsed = JSON.parse(pharmacyData) as { masterId?: number };
      if (typeof parsed.masterId === 'number' && parsed.masterId > 0) {
        return parsed.masterId;
      }
    }
  } catch {
    // ignore session parse errors
  }
  return null;
};

const roundToTwo = (value: number): number => Number(value.toFixed(2));

const SalesReturn: React.FC = () => {
  const [opNumber, setOpNumber] = useState<string>("");
  const [patientInfo, setPatientInfo] = useState<PatientDetailsResponse | null>(null);
  const [visits, setVisits] = useState<OpVisitResponse[]>([]);
  const [selectedVisit, setSelectedVisit] = useState<OpVisitResponse | null>(null);
  const apiService = new PharmacyStoresApiService();
  const [medicines, setMedicines] = useState<MedicineWithReturnQty[]>([]);
  const [reasonToReturn, setReasonToReturn] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [returnResult, setReturnResult] = useState<SaveSalesReturnResponse | null>(null);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [showVisitModal, setShowVisitModal] = useState<boolean>(false);
  const [showPatientDetailsModal, setShowPatientDetailsModal] = useState<boolean>(false);
  const [showPatientSearchModal, setShowPatientSearchModal] = useState<boolean>(false);

  const {
    filteredData: filteredMedicines,
    searchTerm,
    setSearchTerm,
    resultCount,
    totalCount,
  } = useTableSearch<MedicineWithReturnQty>({
    data: medicines,
    searchFields: ["medicineName", "batchNo"],
  });

  // Search OP Number
  const handleSearchOP = async (searchValue?: string) => {
    const searchTerm = (searchValue ?? opNumber).trim();

    if (!searchTerm) {
      showValidationError("Please enter OP Number");
      return;
    }

    setLoading(true);
    try {
      // Fetch patient details
      const patientData = await apiService.fetchPatientDetails(searchTerm);
      setPatientInfo(patientData);

      // Fetch OP visits
      const visitsData = await apiService.fetchOpVisitsByOpNo(searchTerm);
      setVisits(visitsData);
      setSelectedVisit(null);
      
      // Show visit modal if visits found
      if (visitsData.length > 0) {
        setShowVisitModal(true);
      } else {
        showValidationError("No visits found for this OP number");
      }
      setMedicines([]);
    } catch (error: any) {
      console.error("Error fetching patient data:", error);
      // Show friendly message for invalid OP number
      if (error?.response?.status === 404 || error?.response?.status === 500) {
        showValidationError("Invalid OP Number. Please check and try again.");
      } else {
        showErrorToast("Failed to fetch patient data");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSearchSelect = (patient: Patient) => {
    setOpNumber(patient.displayNumber);
    setTimeout(() => {
      handleSearchOP(patient.displayNumber);
    }, 100);
  };

  // Load medicines for selected visit
  const handleVisitSelect = async (visit: OpVisitResponse) => {
    setShowVisitModal(false); // Close modal after selection
    setSelectedVisit(visit);
    setLoading(true);
    try {
      // Fetch pharmacy bill details for return
      const billsData = await apiService.fetchPharmacyBillDetailsForReturn(visit.opVisitId);
      // Flatten nested medicineDetails from each bill, carrying phBillId forward
      const flatMedicines = billsData.flatMap(bill =>
        bill.medicineDetails.map(med => ({
          ...med,
          phBillId: bill.phBillId,
          finalBillId: bill.finalBillId,
          paidType: Number(bill.due ?? 0) !== 0 ? "due" : "cash",
          currentReturnQty: 0
        }))
      );
      setMedicines(flatMedicines);
      
      if (flatMedicines.length === 0) {
        showValidationError("No medicines found for this visit");
      }
    } catch (error) {
      console.error("Error fetching medicines:", error);
      showErrorToast("Failed to fetch medicines data");
      setMedicines([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle return units change
  const handleReturnUnitsChange = (phBillsDetailId: number, returnQty: number) => {
    const updatedMedicines = medicines.map(med => {
      if (med.phBillsDetailId === phBillsDetailId) {
        // Validate that return units don't exceed available for return quantity
        if (returnQty > med.availableForReturn) {
          showValidationError("Return units cannot exceed available quantity");
          return med;
        }
        return { ...med, currentReturnQty: returnQty };
      }
      return med;
    });
    setMedicines(updatedMedicines);
  };

  // Handle remove item from return summary
  const handleRemoveFromReturn = (phBillsDetailId: number) => {
    const updatedMedicines = medicines.map(med => 
      med.phBillsDetailId === phBillsDetailId ? { ...med, currentReturnQty: 0 } : med
    );
    setMedicines(updatedMedicines);
  };

  // Calculate totals
  const getReturnedMedicines = () => {
    return medicines.filter(med => (med.currentReturnQty || 0) > 0);
  };

  const calculateTotal = () => {
    const total = getReturnedMedicines().reduce((sum, med) => sum + ((med.currentReturnQty || 0) * (med.mrp - (med.discountAmt / med.billedQuantity))), 0);
    return roundToTwo(total);
  };

  const getFinalAmount = () => {
    return calculateTotal();
  };

  // Handle form submission
  const handleReturnMedicines = async () => {
    const returnedMeds = getReturnedMedicines();
    
    if (returnedMeds.length === 0) {
      showValidationError("Please enter return units for at least one medicine");
      return;
    }

    if (!reasonToReturn) {
      showValidationError("Please select a reason to return");
      return;
    }

    if (!patientInfo || !selectedVisit) {
      showValidationError("Patient or visit information is missing");
      return;
    }

    setIsSubmitting(true);
    setLoading(true);
    try {
      const resolvedStoreId = resolvePharmacyStoreId();
      const payloadStoreId = resolvedStoreId ?? 0;
      if (!payloadStoreId) {
        showValidationError('Store context is missing. Please reselect the pharmacy store.');
        setLoading(false);
        setIsSubmitting(false);
        return;
      }

      const medicinesByBill = returnedMeds.reduce((acc, med) => {
        const key = `${med.finalBillId}-${med.phBillId}`;
        const returnQty = med.currentReturnQty || 0;
        const medicineReturnAmt = roundToTwo(returnQty * med.mrp);
        const unitDiscountAmt = (med.billedQuantity || 0) > 0
          ? roundToTwo((med.discountAmt || 0) / med.billedQuantity)
          : 0;
        const medicineDiscountAmt = roundToTwo(returnQty * unitDiscountAmt);

        if (!acc[key]) {
          acc[key] = {
            finalBillId: med.finalBillId,
            phBillsId: med.phBillId,
            paidType: med.paidType || "",
            billDisc: 0,
            billReturnAmt: 0,
            medicinesDetails: []
          };
        }

        // acc[key].billDisc = roundToTwo(acc[key].billDisc + medicineDiscountAmt);
        acc[key].billDisc = Math.round(acc[key].billDisc + medicineDiscountAmt);
        acc[key].billReturnAmt = roundToTwo(acc[key].billReturnAmt + medicineReturnAmt);
        // acc[key].billReturnAmt = Math.round(acc[key].billReturnAmt + medicineReturnAmt);
        acc[key].medicinesDetails.push({
          phBillsDetId: med.phBillsDetailId,
          prodsId: med.prodsId,
          batchId: med.batchId,
          returnQty,
          mrp: med.mrp,
          discountAmt: medicineDiscountAmt
        });

        return acc;
      }, {} as Record<string, {
        finalBillId: number;
        phBillsId: number;
        paidType: string;
        billDisc: number;
        billReturnAmt: number;
        medicinesDetails: {
          phBillsDetId: number;
          prodsId: number;
          batchId: number;
          returnQty: number;
          mrp: number;
          discountAmt: number;
        }[];
      }>);

      const groupedMedicines = Object.values(medicinesByBill);
      const totalDisc = roundToTwo(groupedMedicines.reduce((sum, bill) => sum + bill.billDisc, 0));
      // const totalDisc = Math.round(groupedMedicines.reduce((sum, bill) => sum + bill.billDisc, 0));
      const totalReturnAmt = roundToTwo(groupedMedicines.reduce((sum, bill) => sum + bill.billReturnAmt, 0));

      // Prepare payload for API
      const payload: SaveSalesReturnRequest = {
        patId: patientInfo.patId,
        visitId: selectedVisit.opVisitId,
        ipId: patientInfo.ipId || 0,
        reasonToReturn: reasonToReturn,
        note: remarks,
        opno: patientInfo.displayNumber,
        storeId: payloadStoreId,
        totalDisc,
        totalReturnAmt,
        medicines: groupedMedicines
      };

      const result: SaveSalesReturnResponse = await apiService.saveSalesReturn(payload);
      setReturnResult(result);
      showSuccessModal(
        `<div class="text-start">
          <div class="mb-2"><span class="text-muted">Return No:</span>&nbsp;<strong>${result.phReturnNo}</strong></div>
          <div><span class="text-muted">Advance No:</span>&nbsp;<strong>${result.advanceNo}</strong></div>
          <div><span class="text-muted">Total Return Amount:</span>&nbsp;<strong>${result.totalReturnAmount}</strong></div>
        </div>`,
        "Sales Return Processed"
      );
    } catch (error) {
      console.error("Error returning medicines:", error);
      showErrorToast("Failed to return medicines");
      setIsSubmitting(false);
    } finally {
      setLoading(false);
    }
  };

  const hasReturnContext = Boolean(selectedVisit && medicines.length > 0);

  return (
    <div className="sales-return-page">
      <PageHeader icon={faUndo} title="Medicines Sales Return" subtitle="Process customer returns for pharmacy sales" />
      
      <div className="sales-return-content">
        <Card className="sales-return-shell-card">
          <Card.Header className="sales-return-shell-header">
            <Row className="align-items-center g-3">
              <Col lg={3}>
                <Form.Group>
                  <Form.Label className="fw-bold mb-2 small text-muted">Enter OP Number</Form.Label>
                  <div className="d-flex gap-2">
                    <Form.Control
                      type="text"
                      placeholder="OP Number"
                      value={opNumber}
                      onChange={(e) => setOpNumber(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearchOP()}
                      disabled={loading}
                      size="sm"
                    />
                    <Button
                      onClick={() => setShowPatientSearchModal(true)}
                      disabled={loading}
                      size="sm"
                      className="theme-btn-primary"
                      style={{ height: "31px", width: "50px" }}
                    >
                      {loading ? (
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      ) : (
                        <Search size={18} />
                      )}
                    </Button>
                  </div>
                </Form.Group>
              </Col>

              {patientInfo && selectedVisit ? (
                <>
                  <Col lg={7}>
                    <div className="sales-return-patient-summary cursor-pointer hover-shadow" onClick={() => setShowPatientDetailsModal(true)}>
                      <Row className="align-items-center g-2">
                        <Col md={3}>
                          <div className="small text-muted">OP Number</div>
                          <div className="fw-bold">{patientInfo.displayNumber}</div>
                        </Col>
                        <Col md={4}>
                          <div className="small text-muted">Patient Name</div>
                          <div className="fw-bold sales-return-link-text">{patientInfo.name}</div>
                        </Col>
                        <Col md={3}>
                          <div className="small text-muted">Visit Date</div>
                          <div className="fw-bold">{new Date(selectedVisit.datetime).toLocaleDateString()}</div>
                        </Col>
                        <Col md={2}>
                          <div className="small text-muted">Balance</div>
                          <div className="fw-bold">₹{calculateTotal().toFixed(2)}</div>
                        </Col>
                      </Row>
                    </div>
                  </Col>
                  <Col lg={2}>
                    <Button size="sm" onClick={() => setShowVisitModal(true)} className="billing-save-btn billing-action-btn">
                      Change Visit
                    </Button>
                  </Col>
                </>
              ) : patientInfo ? (
                <>
                  <Col lg={7}>
                    <div className="sales-return-patient-summary">
                      <Row className="align-items-center g-2">
                        <Col md={4}>
                          <div className="small text-muted">OP Number</div>
                          <div className="fw-bold">{patientInfo.displayNumber}</div>
                        </Col>
                        <Col md={4}>
                          <div className="small text-muted">Patient Name</div>
                          <div className="fw-bold">{patientInfo.name}</div>
                        </Col>
                        <Col md={4}>
                          <div className="small text-muted">Age / Sex</div>
                          <div className="fw-bold">{patientInfo.age} / {patientInfo.sex}</div>
                        </Col>
                      </Row>
                    </div>
                  </Col>
                  <Col lg={2}>
                    <Button size="sm" onClick={() => setShowVisitModal(true)} className="billing-save-btn billing-action-btn">
                      Select Visit
                    </Button>
                  </Col>
                </>
              ) : (
                <Col lg={9}>
                  <div className="text-center text-muted py-2">
                    <small>Enter OP Number to search for patient</small>
                  </div>
                </Col>
              )}
            </Row>
          </Card.Header>

          <Card.Body className="sales-return-shell-body">
            {hasReturnContext ? (
              <Row className="g-3 h-100">
                <Col lg={8} className="h-100">
                  <Card className="shadow-sm border-0 h-100">
                    <Card.Header className="bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1 fw-bold"><CartX className="me-2" /> Returnable Medicines</h6>
                        <div className="small text-danger">
                          Dispense the medicine first to enable it for return.
                        </div>
                      </div>
                      <div className="sales-return-search-box">
                        <SearchInput
                          searchTerm={searchTerm}
                          onSearchChange={setSearchTerm}
                          placeholder="Search by medicine name or batch..."
                          resultCount={resultCount}
                          totalCount={totalCount}
                          className="sales-return-search-input"
                        />
                      </div>
                    </Card.Header>
                    <Card.Body className="p-0 sales-return-scroll-area">
                      <Table striped bordered hover className="mb-0 align-middle">
                        <thead className="bg-light sticky-top" style={{ zIndex: 10 }}>
                          <tr>
                            <th className="px-4 py-3">Medicine Name</th>
                            <th className="text-center py-3 sales-return-col-medium">Billed/Returned</th>
                            <th className="text-center py-3 sales-return-col-medium">Available to Return</th>
                            <th className="text-center py-3 sales-return-col-small">Return Qty</th>
                            <th className="text-end px-4 py-3 sales-return-col-value">Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredMedicines.map((medicine) => {
                            const currentReturnQty = medicine.currentReturnQty || 0;
                            const isDispensed = Number(medicine.isDispense ?? 0) === 0;
                            const fullyReturned = medicine.retUnits >= medicine.billedQuantity;
                            return (
                              <tr key={medicine.phBillsDetailId} className={isDispensed ? "sales-return-row-not-dispensed" : ""}>
                                <td className="px-4">
                                  <div className="fw-bold text-dark">{medicine.medicineName}</div>
                                  <div className="small text-muted">
                                    MRP: ₹{medicine.mrp.toFixed(2)} | Batch: {medicine.batchNo}
                                  </div>
                                </td>
                                <td className="text-center">
                                  <Badge pill className="px-3 theme-badge-secondary">{medicine.billedQuantity}/{medicine.retUnits}</Badge>
                                </td>
                                <td className="text-center">
                                  <Badge pill className="px-3 theme-badge-secondary">{medicine.availableForReturn}</Badge>
                                </td>
                                <td className="text-center">
                                  {fullyReturned ? (
                                    '—'
                                  ) : (
                                    <Form.Control
                                      type="number"
                                      size="sm"
                                      value={formatNumberDisplay(currentReturnQty)}
                                      onChange={(e) => handleReturnUnitsChange(medicine.phBillsDetailId, handleNumberChange(e.target.value))}
                                      onBlur={(e) => handleReturnUnitsChange(medicine.phBillsDetailId, handleNumberBlur(e.target.value))}
                                      min="0"
                                      max={medicine.availableForReturn}
                                      step="1"
                                      placeholder="0"
                                      className="text-center fw-bold"
                                      disabled={isDispensed}
                                    />
                                  )}
                                </td>
                                <td className="text-end px-4 font-monospace">
                                  ₹{(currentReturnQty * medicine.mrp).toFixed(2)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                </Col>

                <Col lg={4} className="h-100">
                  <Card className="shadow-sm border-0 h-100">
                    <Card.Header className="bg-white py-3 border-bottom">
                      <h6 className="mb-0 fw-bold"><ClipboardData className="me-2" /> Return Summary</h6>
                    </Card.Header>
                    <Card.Body className="p-0 sales-return-scroll-area">
                      {getReturnedMedicines().length === 0 ? (
                        <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted">
                          <CartX size={40} className="mb-3 opacity-25" />
                          <p>No items selected for return</p>
                        </div>
                      ) : (
                        <Table size="sm" className="mb-0">
                          <thead className="bg-white sticky-top">
                            <tr>
                              <th className="px-3 py-2">Item</th>
                              <th className="text-center py-2">Qty</th>
                              <th className="text-end px-3 py-2">Total</th>
                              <th className="text-center py-2 sales-return-col-action"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {getReturnedMedicines().map((medicine) => (
                              <tr key={medicine.phBillsDetailId} className="align-baseline">
                                <td className="px-3 small">{medicine.medicineName}</td>
                                <td className="text-center small">{medicine.currentReturnQty || 0}</td>
                                <td className="text-end px-3 small fw-bold">₹{((medicine.currentReturnQty || 0) * (medicine.mrp - (medicine.discountAmt / medicine.billedQuantity))).toFixed(2)}</td>
                                <td className="text-center">
                                  <Button
                                    variant="link"
                                    size="sm"
                                    className="theme-btn-link-secondary"
                                    onClick={() => handleRemoveFromReturn(medicine.phBillsDetailId)}
                                    title="Remove from return"
                                  >
                                    <Trash size={16} />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            ) : (
              <div className="sales-return-empty-state text-muted">
                <CartX size={40} className="mb-3 opacity-25" />
                <p className="mb-0">Select a visit to load medicines for return processing.</p>
              </div>
            )}
          </Card.Body>

          <Card.Footer className="sales-return-shell-footer">
            <Row className="g-3 align-items-center">
              <Col md={4}>
                <Form.Group>
                  <Form.Select
                    value={reasonToReturn}
                    onChange={(e) => setReasonToReturn(e.target.value)}
                    disabled={!hasReturnContext}
                  >
                    <option value="">Select Reason...</option>
                    <option value="Expired">Expired Product</option>
                    <option value="Damaged">Damaged / Broken</option>
                    <option value="Wrong Medicine">Wrong Medicine Dispensed</option>
                    <option value="Patient Discharged">Patient Discharged</option>
                    <option value="Doctor Changed Prescription">Doctor Changed Prescription</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Control
                    as="textarea"
                    rows={1}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Add any additional notes here..."
                    disabled={!hasReturnContext}
                  />
                </Form.Group>
              </Col>

              <Col md={2}>
                <Form.Group>
                  <div className="text-center bg-light rounded p-2">
                    <h5 className="mb-0 fw-bold">₹ {getFinalAmount().toFixed(2)}</h5>
                  </div>
                </Form.Group>
              </Col>

              <Col md={2}>
                <div className="d-flex gap-2">
                  <Button
                    variant="outline-danger"
                    size="lg"
                    className="d-flex align-items-center justify-content-center billing-action-btn"
                    onClick={() => {
                      setOpNumber("");
                      setPatientInfo(null);
                      setVisits([]);
                      setSelectedVisit(null);
                      setMedicines([]);
                      setReasonToReturn("");
                      setRemarks("");
                      setSearchTerm("");
                      setReturnResult(null);
                      setIsSubmitting(false);
                    }}
                    title="Reset"
                  >
                    <ArrowCounterclockwise size={20} />
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    className="flex-grow-1 fw-bold d-flex align-items-center justify-content-center gap-2 billing-action-btn billing-save-btn"
                    onClick={handleReturnMedicines}
                    disabled={!hasReturnContext || loading || isSubmitting || getReturnedMedicines().length === 0}
                  >
                    <CashCoin size={20} /> {isSubmitting ? "Processing..." : "Refund"}
                  </Button>
                  {returnResult && (
                    <Button
                      variant="outline-secondary"
                      size="lg"
                      className="d-flex align-items-center justify-content-center billing-action-btn"
                      onClick={() => setShowPrintModal(true)}
                      title="Print Receipt"
                    >
                      <Printer size={20} />
                    </Button>
                  )}
                </div>
              </Col>
            </Row>
          </Card.Footer>
        </Card>
      </div>

      {/* Patient Details Modal */}
      <Modal 
        show={showPatientDetailsModal} 
        onHide={() => setShowPatientDetailsModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>
            <PersonCheck className="me-2" /> Patient Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {patientInfo && (
            <>
              <h6 className="fw-bold mb-3">Personal Information</h6>
              <Row className="g-3 mb-4">
                <Col md={6}>
                  <div className="small text-muted mb-1">OP Number</div>
                  <div className="fw-bold">{patientInfo.displayNumber}</div>
                </Col>
                <Col md={6}>
                  <div className="small text-muted mb-1">Patient Name</div>
                  <div className="fw-bold">{patientInfo.name}</div>
                </Col>
                <Col md={4}>
                  <div className="small text-muted mb-1">Age</div>
                  <div className="fw-bold">{patientInfo.age}</div>
                </Col>
                <Col md={4}>
                  <div className="small text-muted mb-1">Sex</div>
                  <div className="fw-bold">{patientInfo.sex}</div>
                </Col>
                <Col md={4}>
                  <div className="small text-muted mb-1">DOB</div>
                  <div className="fw-bold">{patientInfo.dob ? new Date(patientInfo.dob).toLocaleDateString() : 'N/A'}</div>
                </Col>
                <Col md={6}>
                  <div className="small text-muted mb-1">Mobile Number</div>
                  <div className="fw-bold">{patientInfo.phone || 'N/A'}</div>
                </Col>
                <Col md={6}>
                  <div className="small text-muted mb-1">Email</div>
                  <div className="fw-bold">{patientInfo.email || 'N/A'}</div>
                </Col>
                <Col md={12}>
                  <div className="small text-muted mb-1">Address</div>
                  <div className="fw-bold">{[patientInfo.add1, patientInfo.add2].filter(Boolean).join(', ') || 'N/A'}</div>
                </Col>
              </Row>

              {selectedVisit && (
                <>
                  <hr />
                  <h6 className="fw-bold mb-3">Visit Information</h6>
                  <Row className="g-3">
                    <Col md={4}>
                      <div className="small text-muted mb-1">Visit ID</div>
                      <div className="fw-bold">{selectedVisit.opVisitId}</div>
                    </Col>
                    <Col md={4}>
                      <div className="small text-muted mb-1">Visit Date</div>
                      <div className="fw-bold">{new Date(selectedVisit.datetime).toLocaleDateString()}</div>
                    </Col>
                    <Col md={4}>
                      <div className="small text-muted mb-1">Doctor</div>
                      <div className="fw-bold">{selectedVisit.doctorName}</div>
                    </Col>
                  </Row>
                </>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="outline-primary" onClick={() => setShowPatientDetailsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Visit Selection Modal */}
      <Modal 
        show={showVisitModal} 
        onHide={() => setShowVisitModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton className="bg-light border-bottom">
          <Modal.Title>
            <Receipt className="me-2" /> Select Visit / Bill
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0 d-flex flex-column sales-return-visit-modal-body">
          <div className="p-3 bg-light border-bottom sales-return-visit-summary">
            <div className="row g-2 align-items-center">
              <div className="col-auto">
                <div className="small text-muted fw-medium">Available Visits</div>
                <div className="fw-bold text-success">{visits.length}</div>
              </div>
              <div className="col-auto ms-auto text-end">
                <div className="small text-muted">Current Selection</div>
                <div className="fw-bold text-info">
                  {selectedVisit ? `Visit #${selectedVisit.opVisitId}` : "None"}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-grow-1 overflow-auto" style={{ minHeight: 0 }}>
            <div className="p-3">
              <div className="small fw-bold text-muted text-uppercase mb-2">Visit History</div>
              {visits.length === 0 ? (
                <div className="text-center text-muted py-5">
                  <Receipt size={48} className="mb-3 opacity-25" />
                  <p className="mb-0">No visits found for this patient.</p>
                </div>
              ) : (
                <Table striped bordered hover responsive size="sm" className="mb-0">
                  <thead className="bg-light sticky-top" style={{ zIndex: 10 }}>
                    <tr>
                      <th>Date</th>
                      <th>Visit ID</th>
                      <th>Doctor</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visits.map((visit) => (
                      <tr
                        key={visit.opVisitId}
                        className={`cursor-pointer ${selectedVisit?.opVisitId === visit.opVisitId ? "table-active" : ""}`}
                        style={{ cursor: "pointer" }}
                      >
                        <td className="py-2 fw-semibold">{new Date(visit.datetime).toLocaleDateString()}</td>
                        <td className="py-2">
                          <Badge className="px-3 py-2 theme-badge-secondary">
                            {visit.opVisitId}
                          </Badge>
                        </td>
                        <td className="py-2 text-secondary">{visit.doctorName}</td>
                        <td className="text-center py-2">
                          <Button
                            size="sm"
                            className="billing-save-btn billing-action-btn"
                            onClick={() => handleVisitSelect(visit)}
                          >
                            {selectedVisit?.opVisitId === visit.opVisitId ? (
                              <>
                                <CheckCircle size={16} className="me-1" /> Selected
                              </>
                            ) : (
                              "Select"
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </div>
          </div>

          <div className="p-3 border-top bg-light">
            <div className="small fw-bold text-muted mb-2">ACTION</div>
            <div className="d-flex justify-content-end">
              <Button className="billing-action-btn" onClick={() => setShowVisitModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      <PatientSearchModal
        show={showPatientSearchModal}
        onHide={() => setShowPatientSearchModal(false)}
        onPatientSelect={handlePatientSearchSelect}
      />

      {/* Print Receipt Modal */}
      {showPrintModal && returnResult && (
        <Modal
          show={showPrintModal}
          onHide={() => setShowPrintModal(false)}
          size="xl"
          centered
        >
          <Modal.Header closeButton className="bg-light">
            <Modal.Title>
              <Printer className="me-2" /> Print Sales Return Receipt
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-0" style={{ maxHeight: 'calc(100vh - 160px)', overflowY: 'auto' }}>
            <DuplicateBillView
              billIdProp={returnResult.cashFinalBillNo}
              onClose={() => setShowPrintModal(false)}
              patientNameProp={patientInfo?.name}
              opNoProp={patientInfo?.displayNumber}
            />
          </Modal.Body>
        </Modal>
      )}
      
      <style>{`
        .sales-return-page {
          display: flex;
          flex-direction: column;
          height: calc(100vh - 80px);
          overflow: hidden;
        }
        .sales-return-content {
          flex: 1;
          min-height: 0;
          padding: 0 1rem 1rem;
          overflow: hidden;
        }
        .sales-return-shell-card {
          height: 100%;
          border: 0;
          box-shadow: var(--shadow-sm);
          display: flex;
          flex-direction: column;
        }
        .sales-return-shell-header {
          background-color: var(--bg-white);
          border-bottom: 1px solid var(--border-color);
          flex-shrink: 0;
        }
        .sales-return-shell-body {
          flex: 1;
          min-height: 0;
          background-color: var(--bg-main);
          overflow: hidden;
        }
        .sales-return-shell-body .card {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .sales-return-shell-body .card-body {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
        }
        .sales-return-shell-footer {
          background-color: var(--bg-white);
          border-top: 1px solid var(--border-color);
          flex-shrink: 0;
        }
        .sales-return-patient-summary {
          background-color: var(--bg-main);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-sm);
          padding: 0.5rem;
        }
        .sales-return-search-box {
          min-width: 360px;
        }
        .sales-return-search-input {
          width: 100%;
          justify-content: flex-end;
        }
        .sales-return-search-input .input-group {
          max-width: 100% !important;
        }
        .sales-return-visit-modal-body {
          max-height: calc(100vh - 120px);
        }
        .sales-return-visit-summary {
          background-color: var(--bg-main) !important;
        }
        .sales-return-scroll-area {
          height: 100%;
          overflow-y: auto;
        }
        .sales-return-col-medium {
          width: 110px;
        }
        .sales-return-col-small {
          width: 100px;
        }
        .sales-return-col-value {
          width: 120px;
        }
        .sales-return-col-action {
          width: 50px;
        }
        .sales-return-empty-state {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .sales-return-link-text {
          text-decoration: underline;
          color: var(--page-secondary-color);
        }
        .hover-shadow:hover {
          box-shadow: var(--shadow-md) !important;
          border-color: var(--border-color) !important;
        }
        .cursor-pointer {
          cursor: pointer;
        }
        .sales-return-row-not-dispensed {
          background-color: #fff3cd !important;
          border-left: 4px solid #ffc107 !important;
        }
        .sales-return-row-not-dispensed td {
          color: #664d03;
        }
        @media (max-width: 991px) {
          .sales-return-content {
            padding: 0 0.75rem 0.75rem;
          }
          .sales-return-search-box {
            min-width: 100%;
          }
          .sales-return-shell-footer .btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default SalesReturn;
