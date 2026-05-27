import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Table, Badge, Spinner, Row, Col } from 'react-bootstrap';
import { FaUndo, FaChevronRight } from 'react-icons/fa';
import { CashCounterApiService } from '../../../../api/cash-counter/cash-counter-api-service';
import { showErrorToast, showWarningModal, showSuccessToast, showLoading, closeAlert, showConfirmDialog } from '../../../../utils/alertUtil';
import { handleNumberChange, handleNumberBlur, formatNumberDisplay } from '../../../../utils/numberInputUtil';

const FaUndoIcon = FaUndo as any;
const FaChevronRightIcon = FaChevronRight as any;

interface LabDetail {
  itemName: string;
  specimenName: string;
  deptName: string;
  unit: number;
  unitRate: number;
  specId: number;
  testId: number;
  deptId: number;
  finalBillId: number;
  labBillsId: number;
  labBillsDetId: number;
}

interface InvDetail {
  itemName: string;
  groupName: string;
  unit: number;
  unitRate: number;
  charityRate: number;
  groupId: number;
  particularId: number;
  finalBillId: number;
  invBillsId: number;
  invBillsDetId: number;
}

interface VisitData {
  visitId: number;
  labDetails: LabDetail[];
  invDetails: InvDetail[];
}

interface ReturnBillingProps {
  patient?: any;
  opNumber?: string;
  onPrint?: (finalBillId: number) => void;
}

const ReturnBilling: React.FC<ReturnBillingProps> = ({ patient, opNumber, onPrint }) => {
  const cashCounterApi = new CashCounterApiService();

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visits, setVisits] = useState<VisitData[]>([]);
  const [selectedVisit, setSelectedVisit] = useState<VisitData | null>(null);
  const [reason, setReason] = useState('');

  // returnQty keyed by labBillsDetId or invBillsDetId
  const [labReturnQty, setLabReturnQty] = useState<Record<number, number>>({});
  const [invReturnQty, setInvReturnQty] = useState<Record<number, number>>({});
  const [savedReturnNumbers, setSavedReturnNumbers] = useState<{ invRetDisplay?: string; labRetDisplay?: string } | null>(null);
  const [returnedFinalBillId, setReturnedFinalBillId] = useState<number | null>(null);

  // Auto-load when patient changes
  useEffect(() => {
    if (patient?.displayNumber || opNumber) {
      loadBillDetails();
    } else {
      setVisits([]);
      setSelectedVisit(null);
      setLabReturnQty({});
      setInvReturnQty({});
      setReason('');
      setSavedReturnNumbers(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient?.patId]);

  const loadBillDetails = async () => {
    const opNo = patient?.displayNumber || opNumber;
    if (!opNo) return;
    try {
      setIsLoading(true);
      setSelectedVisit(null);
      setLabReturnQty({});
      setInvReturnQty({});
      const response = await cashCounterApi.fetchPatientBillDetailsForReturn(opNo);
      const visitsData: VisitData[] = response?.visits || [];
      setVisits(visitsData);
      if (visitsData.length === 0) {
        showErrorToast('No billed items found for this patient');
      }
    } catch (error: any) {
      showErrorToast(error?.response?.data?.error || 'Failed to load bill details');
      setVisits([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectVisit = (visit: VisitData) => {
    setSelectedVisit(visit);
    // initialise returnQty to 0 for all items
    const labQty: Record<number, number> = {};
    visit.labDetails.forEach(d => { labQty[d.labBillsDetId] = 0; });
    setLabReturnQty(labQty);

    const invQty: Record<number, number> = {};
    visit.invDetails.forEach(d => { invQty[d.invBillsDetId] = 0; });
    setInvReturnQty(invQty);
    setReason('');
  };

  const handleLabQtyChange = (id: number, value: string) => {
    const qty = handleNumberChange(value);
    const item = selectedVisit?.labDetails.find(d => d.labBillsDetId === id);
    if (item && qty > item.unit) {
      showErrorToast(`Return qty cannot exceed billed qty (${item.unit})`);
      return;
    }
    setLabReturnQty(prev => ({ ...prev, [id]: qty }));
  };

  const handleInvQtyChange = (id: number, value: string) => {
    const qty = handleNumberChange(value);
    const item = selectedVisit?.invDetails.find(d => d.invBillsDetId === id);
    if (item && qty > item.unit) {
      showErrorToast(`Return qty cannot exceed billed qty (${item.unit})`);
      return;
    }
    setInvReturnQty(prev => ({ ...prev, [id]: qty }));
  };

  const getReturnTotal = () => {
    let total = 0;
    selectedVisit?.labDetails.forEach(d => {
      total += (labReturnQty[d.labBillsDetId] || 0) * d.unitRate;
    });
    selectedVisit?.invDetails.forEach(d => {
      total += (invReturnQty[d.invBillsDetId] || 0) * d.unitRate;
    });
    return total;
  };

  const handleSubmitReturn = async () => {
    if (!patient) {
      showWarningModal('Please search and select a patient first');
      return;
    }
    if (!selectedVisit) {
      showWarningModal('Please select a visit');
      return;
    }
    if (!reason.trim()) {
      showWarningModal('Please enter a reason for return');
      return;
    }

    const labItems = (selectedVisit.labDetails || [])
      .filter(d => (labReturnQty[d.labBillsDetId] || 0) > 0)
      .map(d => ({
        labBillsDetId: d.labBillsDetId,
        labBillsId: d.labBillsId,
        specId: d.specId,
        testId: d.testId,
        returnQty: labReturnQty[d.labBillsDetId],
        rate: d.unitRate,
      }));

    const invItems = (selectedVisit.invDetails || [])
      .filter(d => (invReturnQty[d.invBillsDetId] || 0) > 0)
      .map(d => ({
        invBillsDetId: d.invBillsDetId,
        invBillsId: d.invBillsId,
        groupId: d.groupId,
        particularId: d.particularId,
        returnQty: invReturnQty[d.invBillsDetId],
        rate: d.unitRate,
      }));

    if (labItems.length === 0 && invItems.length === 0) {
      showWarningModal('Please enter return quantity for at least one item');
      return;
    }

    const confirmed = await showConfirmDialog(
      `Return ₹${getReturnTotal().toFixed(2)} worth of items?`,
      'Confirm Return'
    );
    if (!confirmed.isConfirmed) return;

    setIsSubmitting(true);
    try {
      showLoading('Processing return...');
      const payload = {
        patId: patient.patId,
        visitId: selectedVisit.visitId,
        ipId: patient.ipId || 0,
        reason: reason.trim(),
        opno: patient.displayNumber || opNumber || '',
        lab: labItems,
        inv: invItems,
      };
      const response = await cashCounterApi.saveLabInvSalesReturn(payload);
      closeAlert();

      setSavedReturnNumbers({
        invRetDisplay: response?.invRetDisplay,
        labRetDisplay: response?.labRetDisplay,
      });
      showSuccessToast(`Return of ₹${getReturnTotal().toFixed(2)} processed successfully!`);
      const returnFinalBillId = response?.data?.finalBillId || response?.finalBillId;
      setReturnedFinalBillId(returnFinalBillId || null);
      // Reset state after success
      setSelectedVisit(null);
      setLabReturnQty({});
      setInvReturnQty({});
      setReason('');
    } catch (error: any) {
      closeAlert();
      const msg = error?.response?.data?.error || error?.message || 'Failed to process return';
      showErrorToast(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const opNo = patient?.displayNumber || opNumber;

  if (!patient) {
    return (
      <Card className="border-0 shadow-sm d-flex flex-column flex-grow-1" style={{ minHeight: 0 }}>
        <Card.Body className="d-flex align-items-center justify-content-center flex-grow-1">
          <div className="text-center text-muted">
            <FaUndoIcon size={40} className="mb-3 opacity-25" />
            <p className="mb-0">Search and select a patient to process a return</p>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm d-flex flex-column flex-grow-1" style={{ minHeight: 0, overflow: 'auto' }}>
      <Card.Header className="bg-light p-2 border-bottom">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <FaUndoIcon className="text-danger" />
            <span className="fw-bold small">Return Billing</span>
            {selectedVisit && (
              <>
                <FaChevronRightIcon size={10} className="text-muted" />
                <Badge bg="secondary" className="small">Visit #{selectedVisit.visitId}</Badge>
              </>
            )}
          </div>
          {selectedVisit && (
            <Button size="sm" variant="outline-secondary" onClick={() => setSelectedVisit(null)}>
              ← Back to Visits
            </Button>
          )}
        </div>
      </Card.Header>

      <Card.Body className="p-3 flex-grow-1" style={{ overflowY: 'auto' }}>
        {isLoading ? (
          <div className="d-flex justify-content-center align-items-center py-5">
            <Spinner animation="border" size="sm" className="me-2" />
            <span className="text-muted small">Loading bill details...</span>
          </div>
        ) : !selectedVisit ? (
          /* ── Visit List ── */
          <div>
            <p className="text-muted small mb-3">
              Select a visit to view billed items available for return
            </p>
            {visits.length === 0 ? (
              <div className="text-center text-muted py-4">
                <FaUndoIcon size={32} className="mb-2 opacity-25" />
                <p className="small mb-0">No billed items found for <strong>{opNo}</strong></p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {visits.map(visit => (
                  <div
                    key={visit.visitId}
                    className="border rounded p-3 d-flex align-items-center justify-content-between"
                    style={{ cursor: 'pointer', background: 'var(--bs-light)' }}
                    onClick={() => handleSelectVisit(visit)}
                  >
                    <div>
                      <span className="fw-bold small">Visit #{visit.visitId}</span>
                      <div className="d-flex gap-2 mt-1">
                        {visit.invDetails.length > 0 && (
                          <Badge bg="primary" className="small">{visit.invDetails.length} Procedure(s)</Badge>
                        )}
                        {visit.labDetails.length > 0 && (
                          <Badge bg="info" text="dark" className="small">{visit.labDetails.length} Lab Test(s)</Badge>
                        )}
                      </div>
                    </div>
                    <Button size="sm" variant="outline-primary">Select <FaChevronRightIcon size={10} /></Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ── Return Items Form ── */
          <div>
            {/* Investigation Items */}
            {selectedVisit.invDetails.length > 0 && (
              <div className="mb-4">
                <h6 className="fw-bold small mb-2 text-primary">Investigation / Procedure Items</h6>
                <Table size="sm" bordered hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Group</th>
                      <th>Procedure</th>
                      <th className="text-center" style={{ width: 70 }}>Billed</th>
                      <th className="text-end" style={{ width: 90 }}>Rate</th>
                      <th className="text-center" style={{ width: 90 }}>Return Qty</th>
                      <th className="text-end" style={{ width: 90 }}>Return Amt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedVisit.invDetails.map(item => (
                      <tr key={item.invBillsDetId}>
                        <td className="small">{item.groupName}</td>
                        <td className="small">{item.itemName}</td>
                        <td className="text-center small">{item.unit}</td>
                        <td className="text-end small">₹{item.unitRate.toFixed(2)}</td>
                        <td className="text-center p-1">
                          <Form.Control
                            type="number"
                            size="sm"
                            className="text-center"
                            style={{ width: 75, margin: '0 auto' }}
                            value={formatNumberDisplay(invReturnQty[item.invBillsDetId] || 0)}
                            onChange={e => handleInvQtyChange(item.invBillsDetId, e.target.value)}
                            onBlur={e => setInvReturnQty(prev => ({ ...prev, [item.invBillsDetId]: handleNumberBlur(e.target.value) }))}
                            min="0"
                            max={item.unit}
                            placeholder="0"
                          />
                        </td>
                        <td className="text-end small fw-bold">
                          ₹{((invReturnQty[item.invBillsDetId] || 0) * item.unitRate).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}

            {/* Lab Items */}
            {selectedVisit.labDetails.length > 0 && (
              <div className="mb-4">
                <h6 className="fw-bold small mb-2 text-info">Lab Test Items</h6>
                <Table size="sm" bordered hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Department</th>
                      <th>Test</th>
                      <th>Specimen</th>
                      <th className="text-center" style={{ width: 70 }}>Billed</th>
                      <th className="text-end" style={{ width: 90 }}>Rate</th>
                      <th className="text-center" style={{ width: 90 }}>Return Qty</th>
                      <th className="text-end" style={{ width: 90 }}>Return Amt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedVisit.labDetails.map(item => (
                      <tr key={item.labBillsDetId}>
                        <td className="small">{item.deptName}</td>
                        <td className="small">{item.itemName}</td>
                        <td className="small text-muted">{item.specimenName}</td>
                        <td className="text-center small">{item.unit}</td>
                        <td className="text-end small">₹{item.unitRate.toFixed(2)}</td>
                        <td className="text-center p-1">
                          <Form.Control
                            type="number"
                            size="sm"
                            className="text-center"
                            style={{ width: 75, margin: '0 auto' }}
                            value={formatNumberDisplay(labReturnQty[item.labBillsDetId] || 0)}
                            onChange={e => handleLabQtyChange(item.labBillsDetId, e.target.value)}
                            onBlur={e => setLabReturnQty(prev => ({ ...prev, [item.labBillsDetId]: handleNumberBlur(e.target.value) }))}
                            min="0"
                            max={item.unit}
                            placeholder="0"
                          />
                        </td>
                        <td className="text-end small fw-bold">
                          ₹{((labReturnQty[item.labBillsDetId] || 0) * item.unitRate).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}

            {/* Reason + Total + Submit */}
            <Row className="align-items-end g-2 mt-2">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold mb-1">Reason for Return <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    size="sm"
                    placeholder="Enter reason for return..."
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    maxLength={300}
                  />
                </Form.Group>
              </Col>
              <Col md={3} className="text-end">
                <div className="border rounded p-2 bg-light">
                  <div className="small text-muted">Total Return Amount</div>
                  <div className="fw-bold fs-6 text-danger">₹{getReturnTotal().toFixed(2)}</div>
                </div>
              </Col>
              <Col md={3} className="d-flex justify-content-end align-items-end">
                <Button
                  variant="danger"
                  size="sm"
                  disabled={isSubmitting || getReturnTotal() === 0}
                  onClick={handleSubmitReturn}
                  className="fw-bold w-100"
                >
                  <FaUndoIcon className="me-1" />
                  {isSubmitting ? 'Processing...' : 'Process Return'}
                </Button>
              </Col>
            </Row>
          </div>
        )}
      </Card.Body>
      {savedReturnNumbers && (savedReturnNumbers.invRetDisplay || savedReturnNumbers.labRetDisplay) && (
        <Card.Footer className="bg-light p-2 border-top d-flex gap-2 align-items-center">
          <span className="small text-muted me-1">Return Bill:</span>
          {savedReturnNumbers.invRetDisplay && (
            <Badge bg="" style={{ backgroundColor: '#ffcdd2', color: '#c62828', fontWeight: 'bold', fontSize: 'var(--font-size-xs)' }}>
              Procedure: {savedReturnNumbers.invRetDisplay}
            </Badge>
          )}
          {savedReturnNumbers.labRetDisplay && (
            <Badge bg="" style={{ backgroundColor: '#ffcdd2', color: '#c62828', fontWeight: 'bold', fontSize: 'var(--font-size-xs)' }}>
              Lab: {savedReturnNumbers.labRetDisplay}
            </Badge>
          )}
          {returnedFinalBillId && onPrint && (
            <button
              type="button"
              className="btn btn-sm theme-outline-btn-secondary ms-auto"
              onClick={() => onPrint(returnedFinalBillId)}
            >
              🖨️ Print
            </button>
          )}
        </Card.Footer>
      )}
    </Card>
  );
};

export default ReturnBilling;

