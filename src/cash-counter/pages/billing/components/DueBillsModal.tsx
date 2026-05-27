import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Form, Row, Col, Badge } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../state/store';
import { FaMoneyBillWave, FaCreditCard, FaExchangeAlt } from 'react-icons/fa';
import { handleNumberChange, handleNumberBlur, formatNumberDisplay } from '../../../../utils/numberInputUtil';
import { CashCounterApiService } from '../../../../api/cash-counter/cash-counter-api-service';
import { showSuccessToast, showErrorToast } from '../../../../utils/alertUtil';

const FaMoneyBillWaveIcon = FaMoneyBillWave as any;
const FaCreditCardIcon = FaCreditCard as any;
const FaExchangeAltIcon = FaExchangeAlt as any;

type BillingType = 'procedure' | 'pharmacy' | 'lab' | 'ip' | 'return' | null;

interface DueBill {
  id: number;
  date: string;
  billNo: string;
  amount: number;
  balance: number;
  type?: 'procedure' | 'pharmacy' | 'lab' | 'ip' | null;
  finalBillId?: number;
  billType?: number;
}

interface DueBillsModalProps {
  show: boolean;
  onHide: () => void;
  billingType: BillingType;
  dueBills: DueBill[];
  selectedDues: number[];
  onToggleDue: (id: number, checked: boolean) => void;
  banks?: any[];
  patientId?: number;
  visitId?: number;
  ipId?: number;
  onPaymentComplete?: (paymentData: any) => void;
}

const DueBillsModal: React.FC<DueBillsModalProps> = ({
  show,
  onHide,
  billingType,
  dueBills,
  selectedDues,
  onToggleDue,
  banks = [],
  patientId,
  visitId,
  ipId,
  onPaymentComplete,
}) => {
  const loginData = useSelector((state: RootState) => state.loginData);
  const organization = useSelector((state: RootState) => state.appReducer.organization);
  
  const cashCounterApiService = new CashCounterApiService();
  
  const totalBalance = dueBills.reduce((sum, bill) => sum + bill.balance, 0);
  const selectedTotal = dueBills
    .filter((bill) => selectedDues.includes(bill.id))
    .reduce((sum, bill) => sum + bill.balance, 0);

  // Payment state
  const [paymentMode, setPaymentMode] = useState<'cash' | 'bank' | 'cash-bank'>('cash');
  const [bankMode, setBankMode] = useState<'upi' | 'card'>('upi');
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [bankAmount, setBankAmount] = useState<number>(0);
  const [insuranceAmount, setInsuranceAmount] = useState<number>(0);
  const [staffCreditAmount, setStaffCreditAmount] = useState<number>(0);
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [transactionNo, setTransactionNo] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const moduleLabel = billingType === 'procedure'
    ? 'Procedure'
    : billingType === 'pharmacy'
    ? 'Pharmacy'
    : billingType === 'lab'
    ? 'Lab'
    : '';

  const handlePaymentSubmit = async () => {
    if (selectedDues.length === 0) {
      showErrorToast('Please select at least one bill');
      return;
    }

    const totalPayment = cashAmount + bankAmount + insuranceAmount + staffCreditAmount;
    if (totalPayment !== selectedTotal) {
      showErrorToast(`Total payment (₹${totalPayment.toFixed(2)}) must equal selected amount (₹${selectedTotal.toFixed(2)})`);
      return;
    }

    if ((paymentMode === 'bank' || paymentMode === 'cash-bank') && (!selectedBank || !transactionNo)) {
      showErrorToast('Please select bank and enter transaction number for bank payments');
      return;
    }

    setIsSubmitting(true);
    try {
      // Get orgId from appReducer (organization)
      const orgId = organization?.id || 1;

      // Build payload as per API specification
      const payload = {
        orgId: orgId,
        patientId: patientId || 0,
        visitId: visitId || 0,
        ipId: ipId || 0,
        collectionAmount: totalPayment,
        totalDiscount: 0,
        note: '',
        userId: loginData.id,
        systemIp: '',
        paymentMode: paymentMode.toUpperCase(),
        cashPaid: cashAmount,
        bankPaid: bankAmount,
        bankId: paymentMode !== 'cash' && selectedBank ? Number(selectedBank) : 0,
        refNo: paymentMode !== 'cash' ? (transactionNo || '') : '',
        transType: 0,
        bills: selectedDues.map((billId) => {
          const bill = dueBills.find((b) => b.id === billId);
          return {
            billType: bill?.billType || 0,
            billId: billId,
            finalBillId: bill?.finalBillId || 0,
            collectedAmount: bill?.balance || 0,
            discountAmount: 0,
          };
        }),
      };

      // Log payload for testing
      console.log('Due Collection Payload:', JSON.stringify(payload, null, 2));

      // Call API
      const response = await cashCounterApiService.saveDueCollection(payload);
      
      showSuccessToast('Payment collected successfully');

      // Prepare payment data for completion callback
      const paymentData = {
        selectedBillIds: selectedDues,
        totalAmount: selectedTotal,
        paymentMode,
        bankMode: paymentMode === 'cash' ? null : bankMode,
        cashAmount,
        bankAmount,
        insuranceAmount,
        staffCreditAmount,
        selectedBank: paymentMode === 'cash' ? null : selectedBank,
        transactionNo: paymentMode === 'cash' ? null : transactionNo,
        payload,
        response,
      };

      if (onPaymentComplete) {
        onPaymentComplete(paymentData);
      }
      
      onHide();
    } catch (error: any) {
      console.error('Payment error:', error);
      const errorMsg = error?.response?.data?.message || 'Failed to collect payment';
      showErrorToast(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetPaymentForm = () => {
    setCashAmount(0);
    setBankAmount(0);
    setInsuranceAmount(0);
    setStaffCreditAmount(0);
    setSelectedBank('');
    setTransactionNo('');
    setPaymentMode('cash');
    setBankMode('upi');
  };

  const handleModalHide = () => {
    resetPaymentForm();
    onHide();
  };

  return (
    <>
    <Modal show={show} onHide={handleModalHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title className="fs-5">Collect Outstanding Dues</Modal.Title>
      </Modal.Header>
      <Modal.Body className="d-flex flex-column p-0" style={{ maxHeight: '80vh' }}>
        {/* Due Bills Table Header (Fixed) */}
        <div className="p-3 bg-light border-bottom">
          <div className="d-flex justify-content-between align-items-center">
            <h6 className="mb-0">
              Total Due: <span className="text-danger">₹{totalBalance.toFixed(2)}</span>
            </h6>
            <Badge bg="info">Select bills to collect</Badge>
          </div>
        </div>

        {/* Scrollable Table Area */}
        <div className="flex-grow-1" style={{ overflowY: 'auto' }}>
          <div className="p-3">
            <Table hover className="mb-0 align-middle" style={{ fontSize: '0.85rem' }}>
              <thead className="bg-light text-muted sticky-top">
                <tr>
                  <th className="ps-4 py-2" style={{ width: '50px' }}>Select</th>
                  <th className="py-2">Date</th>
                  <th className="py-2">Bill No</th>
                  <th className="text-end py-2">Bill Amount</th>
                  <th className="text-end py-2">Balance</th>
                </tr>
              </thead>
              <tbody>
                {dueBills.map((bill) => (
                  <tr key={bill.id} style={{ backgroundColor: selectedDues.includes(bill.id) ? '#f0fdf4' : 'transparent' }}>
                    <td className="ps-4 py-2">
                      <Form.Check
                        type="checkbox"
                        checked={selectedDues.includes(bill.id)}
                        onChange={(e) => onToggleDue(bill.id, e.target.checked)}
                      />
                    </td>
                    <td className="py-2">{bill.date}</td>
                    <td className="py-2">{bill.billNo}</td>
                    <td className="text-end py-2">₹{bill.amount.toFixed(2)}</td>
                    <td className="text-end text-danger fw-bold py-2">₹{bill.balance.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>

        {/* Payment Section (Fixed) */}
        <div className="p-3 border-top" style={{ backgroundColor: '#fafafa' }}>
          <h6 className="mb-3" style={{ color: '#2d3748', fontWeight: '600' }}>
            Payment Details - Amount Due: <span className="text-danger">₹{selectedTotal.toFixed(2)}</span>
          </h6>

          {/* Payment Mode Selection */}
          <Form.Group className="mb-3">
            <Form.Label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Payment Mode</Form.Label>
            <div className="d-flex bg-light rounded p-1 border">
              <div className="flex-grow-1">
                <input
                  type="radio"
                  className="btn-check"
                  name="paymentMode"
                  id="paymentCash"
                  checked={paymentMode === 'cash'}
                  onChange={() => setPaymentMode('cash')}
                />
                <label className={`btn btn-sm w-100 border-0 rounded py-2 ${paymentMode === 'cash' ? 'bg-white shadow-sm fw-bold text-primary' : 'text-muted'}`} htmlFor="paymentCash">
                  <FaMoneyBillWaveIcon className="me-2" />Cash
                </label>
              </div>
              <div className="flex-grow-1" hidden>
                <input
                  type="radio"
                  className="btn-check"
                  name="paymentMode"
                  id="paymentBank"
                  checked={paymentMode === 'bank'}
                  onChange={() => setPaymentMode('bank')}
                />
                <label className={`btn btn-sm w-100 border-0 rounded py-2 ${paymentMode === 'bank' ? 'bg-white shadow-sm fw-bold text-primary' : 'text-muted'}`} htmlFor="paymentBank">
                  <FaCreditCardIcon className="me-2" />Bank
                </label>
              </div>
              <div className="flex-grow-1" hidden>
                <input
                  type="radio"
                  className="btn-check"
                  name="paymentMode"
                  id="paymentSplit"
                  checked={paymentMode === 'cash-bank'}
                  onChange={() => setPaymentMode('cash-bank')}
                />
                <label className={`btn btn-sm w-100 border-0 rounded py-2 ${paymentMode === 'cash-bank' ? 'bg-white shadow-sm fw-bold text-primary' : 'text-muted'}`} htmlFor="paymentSplit">
                  <FaExchangeAltIcon className="me-2" />Split
                </label>
              </div>
            </div>
          </Form.Group>

          {/* Bank Mode Selection (when bank is involved) */}
          {(paymentMode === 'bank' || paymentMode === 'cash-bank') && (
            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Bank Mode</Form.Label>
              <div className="d-flex gap-2">
                <Form.Check
                  type="radio"
                  label="UPI"
                  name="bankMode"
                  value="upi"
                  checked={bankMode === 'upi'}
                  onChange={(e) => setBankMode('upi')}
                  style={{ fontSize: '0.85rem' }}
                />
                <Form.Check
                  type="radio"
                  label="Card"
                  name="bankMode"
                  value="card"
                  checked={bankMode === 'card'}
                  onChange={(e) => setBankMode('card')}
                  style={{ fontSize: '0.85rem' }}
                />
              </div>
            </Form.Group>
          )}

          {/* Amount Inputs */}
          <Row className="g-2 mb-3">
            {(paymentMode === 'cash' || paymentMode === 'cash-bank') && (
              <Col md={paymentMode === 'cash' ? 4 : 6}>
                <Form.Group>
                  <Form.Label style={{ fontSize: '0.85rem', fontWeight: '500' }}>Cash Amount</Form.Label>
                  <Form.Control
                    type="number"
                    value={formatNumberDisplay(cashAmount)}
                    onChange={(e) => {
                      setCashAmount(handleNumberChange(e.target.value));
                    }}
                    onBlur={(e) => {
                      setCashAmount(handleNumberBlur(e.target.value));
                    }}
                    min="0"
                    step="0.01"
                    placeholder="0"
                    style={{ fontSize: '0.85rem', padding: '0.4rem' }}
                  />
                </Form.Group>
              </Col>
            )}
            {(paymentMode === 'bank' || paymentMode === 'cash-bank') && (
              <Col md={paymentMode === 'bank' ? 4 : 6}>
                <Form.Group>
                  <Form.Label style={{ fontSize: '0.85rem', fontWeight: '500' }}>Bank Amount</Form.Label>
                  <Form.Control
                    type="number"
                    value={formatNumberDisplay(bankAmount)}
                    onChange={(e) => {
                      setBankAmount(handleNumberChange(e.target.value));
                    }}
                    onBlur={(e) => {
                      setBankAmount(handleNumberBlur(e.target.value));
                    }}
                    min="0"
                    step="0.01"
                    style={{ fontSize: '0.85rem', padding: '0.4rem' }}
                  />
                </Form.Group>
              </Col>
            )}
          </Row>

          {/* Insurance and Staff Credit Amounts */}
          <Row className="g-2 mb-3" hidden>
            <Col md={6}>
              <Form.Group>
                <Form.Label style={{ fontSize: '0.85rem', fontWeight: '500' }}>Insurance Amount</Form.Label>
                <Form.Control
                  type="number"
                  value={formatNumberDisplay(insuranceAmount)}
                  onChange={(e) => setInsuranceAmount(handleNumberChange(e.target.value))}
                  onBlur={(e) => setInsuranceAmount(handleNumberBlur(e.target.value))}
                  min="0"
                  step="0.01"
                  style={{ fontSize: '0.85rem', padding: '0.4rem' }}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label style={{ fontSize: '0.85rem', fontWeight: '500' }}>Staff Credit Amount</Form.Label>
                <Form.Control
                  type="number"
                  value={formatNumberDisplay(staffCreditAmount)}
                  onChange={(e) => setStaffCreditAmount(handleNumberChange(e.target.value))}
                  onBlur={(e) => setStaffCreditAmount(handleNumberBlur(e.target.value))}
                  min="0"
                  step="0.01"
                  style={{ fontSize: '0.85rem', padding: '0.4rem' }}
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Bank Payment Details */}
          {(paymentMode === 'bank' || paymentMode === 'cash-bank') && (
            <Row className="g-2 mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label style={{ fontSize: '0.85rem', fontWeight: '500' }}>Bank</Form.Label>
                  <Form.Select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    style={{ fontSize: '0.85rem', padding: '0.4rem' }}
                  >
                    <option value="">-- Select Bank --</option>
                    {banks.map((bank) => (
                      <option key={bank.id} value={bank.id}>
                        {bank.bankName} - {bank.accountNo}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label style={{ fontSize: '0.85rem', fontWeight: '500' }}>Transaction No</Form.Label>
                  <Form.Control
                    type="text"
                    value={transactionNo}
                    onChange={(e) => setTransactionNo(e.target.value)}
                    placeholder="Enter transaction number"
                    style={{ fontSize: '0.85rem', padding: '0.4rem' }}
                  />
                </Form.Group>
              </Col>
            </Row>
          )}

        </div>
        </Modal.Body>
        <Modal.Footer className="bg-light py-2">
          <Button variant="secondary" size="sm" onClick={handleModalHide} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handlePaymentSubmit}
            disabled={isSubmitting || selectedDues.length === 0 || (cashAmount + bankAmount) !== selectedTotal}
            style={{ backgroundColor: '#3182ce', color: 'white', border: 'none' }}
          >
            {isSubmitting ? 'Processing...' : `Collect ₹${selectedTotal.toFixed(2)}`}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DueBillsModal;
