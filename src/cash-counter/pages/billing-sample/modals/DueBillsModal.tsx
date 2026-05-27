import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Table, Form, Row, Col, Badge } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../state/store';
import { FaMoneyBillWave, FaCreditCard } from 'react-icons/fa';
import { handleNumberChange, handleNumberBlur, formatNumberDisplay } from '../../../../utils/numberInputUtil';
import { CashCounterApiService } from '../../../../api/cash-counter/cash-counter-api-service';
import { MedicalRecordsApiService } from '../../../../api/medical-records/medical-records-api-service';
import { showSuccessToast, showErrorToast } from '../../../../utils/alertUtil';

const FaMoneyBillWaveIcon = FaMoneyBillWave as any;
const FaCreditCardIcon = FaCreditCard as any;

type BillingType = 'procedure' | 'pharmacy' | 'lab' | 'ip' | 'return' | null;

interface DueBill {
  id: number;
  billId?: number;
  date: string;
  billNo: string;
  amount: number;
  balance: number;
  type?: 'procedure' | 'pharmacy' | 'lab' | 'ip' | 'registration' | null;
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
  onPrint?: (finalBillId: number) => void;
  canDueDiscount?: boolean;
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
  onPrint,
  canDueDiscount = false,
}) => {
  const themePrimary = 'var(--page-primary-color)';
  const themeSecondary = 'var(--page-secondary-color)';
  const loginData = useSelector((state: RootState) => state.loginData);
  const organization = useSelector((state: RootState) => state.appReducer.organization);
  
  const cashCounterApiService = new CashCounterApiService();
  
  // Track individual bill amounts
  const [billAmounts, setBillAmounts] = useState<{ [billId: number]: number }>({});
  
  const totalBalance = dueBills.reduce((sum, bill) => sum + bill.balance, 0);
  
  // Calculate selected total from billAmounts
  const selectedTotal = Object.entries(billAmounts)
    .reduce((sum, [billId, amount]) => {
      const bill = dueBills.find(b => b.id === Number(billId));
      if (bill && amount > 0) {
        return sum + amount;
      }
      return sum;
    }, 0);

  // Selection type helpers
  const hasPharmacySelected = selectedDues.some(id => dueBills.find(b => b.id === id)?.type === 'pharmacy');
  const hasLabSelected = selectedDues.some(id => dueBills.find(b => b.id === id)?.type === 'lab');
  const hasProcedureSelected = selectedDues.some(id => dueBills.find(b => b.id === id)?.type === 'procedure');
  const isRowDisabled = (bill: DueBill): boolean => {
    if (bill.type === 'pharmacy') return hasLabSelected || hasProcedureSelected;
    if (bill.type === 'lab') return hasPharmacySelected || hasProcedureSelected;
    if (bill.type === 'procedure') return hasPharmacySelected || hasLabSelected;
    return false;
  };
  const sortOrder: Record<string, number> = { pharmacy: 0, lab: 1, procedure: 2 };
  const sortedBills = [...dueBills].sort((a, b) => {
    const ao = sortOrder[a.type ?? ''] ?? 3;
    const bo = sortOrder[b.type ?? ''] ?? 3;
    return ao - bo;
  });

  // header checkbox state
  const allSelected = dueBills.length > 0 && selectedDues.length === dueBills.length;
  const toggleAll = (checked: boolean) => {
    if (checked) {
      // select every bill id and set full amounts
      const newAmounts: { [billId: number]: number } = {};
      dueBills.forEach((bill) => {
        onToggleDue(bill.id, true);
        newAmounts[bill.id] = bill.balance;
      });
      setBillAmounts(newAmounts);
    } else {
      // clear only those currently selected to avoid unnecessary ops
      selectedDues.forEach((id) => onToggleDue(id, false));
      setBillAmounts({});
    }
  };

  const [paymentMode, setPaymentMode] = useState<'cash' | 'bank'>('cash');
  const [bankMode, setBankMode] = useState<string>('');
  const [paymentModes, setPaymentModes] = useState<any[]>([]);
  const [cashAmountInput, setCashAmountInput] = useState<number>(0);
  const [bankAmount, setBankAmount] = useState<number>(0);
  const [insuranceAmount, setInsuranceAmount] = useState<number>(0);
  const [staffCreditAmount, setStaffCreditAmount] = useState<number>(0);
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [transactionNo, setTransactionNo] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [billDiscounts, setBillDiscounts] = useState<{ [billId: number]: number }>({});
  const [collectionResponse, setCollectionResponse] = useState<any>(null);
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);
  
  const cashAmountRef = useRef<HTMLInputElement>(null);

  // Auto-select first bank when banks prop loads
  useEffect(() => {
    if (banks.length > 0 && !selectedBank) {
      setSelectedBank(String(banks[0].id));
    }
  }, [banks]);

  // Fetch payment modes once on mount
  useEffect(() => {
    const medicalRecordsApi = new MedicalRecordsApiService();
    medicalRecordsApi.fetchAllPaymentModes().then((modes) => {
      const active = modes.filter((m: any) => m.isActive === 1);
      setPaymentModes(active);
      const qr = active.find((m: any) => m.name?.toLowerCase().includes('qr'));
      const defaultMode = qr ?? (active.length > 0 ? active[0] : null);
      if (defaultMode) setBankMode(String(defaultMode.id));
    }).catch(() => {});
  }, []);

  // Reset form state only when modal opens/closes — NOT on dueBills prop changes.
  // If dueBills were included in deps, refreshing the bill list after payment would
  // immediately reset isPaymentSuccess back to false, hiding the success view.
  useEffect(() => {
    if (show) {
      setBillAmounts({});
      setBillDiscounts({});
      setCashAmountInput(0);
      setIsPaymentSuccess(false);
      setCollectionResponse(null);
      // Auto-focus the cash amount input after modal animation
      setTimeout(() => cashAmountRef.current?.focus(), 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);
  
  // Handle individual bill amount change
  const handleBillAmountChange = (billId: number, value: string) => {
    const bill = dueBills.find(b => b.id === billId);
    if (!bill) return;

    const numValue = handleNumberChange(value);
    const maxCollect = bill.balance - (billDiscounts[billId] || 0);
    const validatedValue = Math.min(numValue, Math.max(0, maxCollect));

    if (bill.type === 'pharmacy') {
      if (validatedValue === 0) {
        onToggleDue(billId, false);
        setBillAmounts(prev => { const n = { ...prev }; delete n[billId]; return n; });
      } else {
        setBillAmounts(prev => ({ ...prev, [billId]: validatedValue }));
        if (!selectedDues.includes(billId)) {
          selectedDues.filter(id => dueBills.find(b => b.id === id)?.type !== 'pharmacy').forEach(id => onToggleDue(id, false));
          onToggleDue(billId, true);
        }
      }
    } else {
      if (validatedValue > 0 && !selectedDues.includes(billId)) {
        selectedDues.forEach((id) => { if (id !== billId) onToggleDue(id, false); });
        setBillDiscounts({});
        setBillAmounts({ [billId]: validatedValue });
        onToggleDue(billId, true);
      } else if (validatedValue === 0) {
        onToggleDue(billId, false);
        setBillAmounts({});
        setBillDiscounts({});
      } else {
        setBillAmounts(prev => ({ ...prev, [billId]: validatedValue }));
      }
    }
  };
  
  const handleBillDiscountChange = (billId: number, value: string) => {
    const numValue = handleNumberChange(value);
    const bill = dueBills.find(b => b.id === billId);
    if (!bill) return;
    const cappedDiscount = Math.min(numValue, bill.balance);
    const newCollect = Math.max(0, bill.balance - cappedDiscount);
    setBillDiscounts(prev => ({ ...prev, [billId]: cappedDiscount }));
    setBillAmounts(prev => ({ ...prev, [billId]: newCollect }));
  };

  const handleBillDiscountBlur = (billId: number, value: string) => {
    const numValue = handleNumberBlur(value);
    const bill = dueBills.find(b => b.id === billId);
    if (!bill) return;
    const cappedDiscount = Math.min(numValue, bill.balance);
    const newCollect = Math.max(0, bill.balance - cappedDiscount);
    setBillDiscounts(prev => ({ ...prev, [billId]: cappedDiscount }));
    setBillAmounts(prev => ({ ...prev, [billId]: newCollect }));
  };

  const handleBillAmountBlur = (billId: number, value: string) => {
    const bill = dueBills.find(b => b.id === billId);
    if (!bill) return;

    const numValue = handleNumberBlur(value);
    const maxCollect = bill.balance - (billDiscounts[billId] || 0);
    const validatedValue = Math.min(numValue, Math.max(0, maxCollect));

    if (bill.type === 'pharmacy') {
      if (validatedValue === 0) {
        onToggleDue(billId, false);
        setBillAmounts(prev => { const n = { ...prev }; delete n[billId]; return n; });
      } else {
        setBillAmounts(prev => ({ ...prev, [billId]: validatedValue }));
        if (!selectedDues.includes(billId)) {
          selectedDues.filter(id => dueBills.find(b => b.id === id)?.type !== 'pharmacy').forEach(id => onToggleDue(id, false));
          onToggleDue(billId, true);
        }
      }
    } else {
      if (validatedValue > 0 && !selectedDues.includes(billId)) {
        selectedDues.forEach((id) => { if (id !== billId) onToggleDue(id, false); });
        setBillDiscounts({});
        setBillAmounts({ [billId]: validatedValue });
        onToggleDue(billId, true);
      } else if (validatedValue === 0) {
        onToggleDue(billId, false);
        setBillAmounts({});
        setBillDiscounts({});
      } else {
        setBillAmounts(prev => ({ ...prev, [billId]: validatedValue }));
      }
    }
  };

  const handleDueCheckboxChange = (bill: DueBill, checked: boolean) => {
    if (checked) {
      if (bill.type === 'pharmacy') {
        // Multi-select: clear lab/procedure selections, then add this pharmacy bill
        const othersIds = selectedDues.filter(id => dueBills.find(b => b.id === id)?.type !== 'pharmacy');
        if (othersIds.length > 0) {
          othersIds.forEach(id => onToggleDue(id, false));
          setBillAmounts({});
          setBillDiscounts({});
        }
        const collectAmount = bill.balance - (billDiscounts[bill.id] || 0);
        setBillAmounts(prev => ({ ...prev, [bill.id]: collectAmount }));
        onToggleDue(bill.id, true);
      } else if (bill.type === 'lab') {
        // Multi-select: clear pharmacy/procedure selections, then add this lab bill
        const othersIds = selectedDues.filter(id => dueBills.find(b => b.id === id)?.type !== 'lab');
        if (othersIds.length > 0) {
          othersIds.forEach(id => onToggleDue(id, false));
          setBillAmounts({});
          setBillDiscounts({});
        }
        const collectAmount = bill.balance - (billDiscounts[bill.id] || 0);
        setBillAmounts(prev => ({ ...prev, [bill.id]: collectAmount }));
        onToggleDue(bill.id, true);
      } else {
        // Procedure: multi-select, clear pharmacy/lab selections, then add this procedure bill
        const othersIds = selectedDues.filter(id => dueBills.find(b => b.id === id)?.type !== 'procedure');
        if (othersIds.length > 0) {
          othersIds.forEach(id => onToggleDue(id, false));
          setBillAmounts({});
          setBillDiscounts({});
        }
        const collectAmount = bill.balance - (billDiscounts[bill.id] || 0);
        setBillAmounts(prev => ({ ...prev, [bill.id]: collectAmount }));
        onToggleDue(bill.id, true);
      }
      return;
    }

    // Uncheck
    onToggleDue(bill.id, false);
    setBillAmounts(prev => { const n = { ...prev }; delete n[bill.id]; return n; });
    setBillDiscounts(prev => { const n = { ...prev }; delete n[bill.id]; return n; });
  };
  
  // Handle cash amount input - auto-fill bills from first
  const handleCashAmountChange = (value: string) => {
    setCashAmountInput(handleNumberChange(value));
  };

  const handleBankAmountAutoFill = (value: string) => {
    setBankAmount(handleNumberChange(value));
  };

  // Auto-sync payment inputs whenever selectedTotal changes (bill selection or discount)
  useEffect(() => {
    if (paymentMode === 'cash') {
      setCashAmountInput(selectedTotal);
      setBankAmount(0);
    } else if (paymentMode === 'bank') {
      setBankAmount(selectedTotal);
      setCashAmountInput(0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTotal]);

  const handlePaymentModeChange = (mode: 'cash' | 'bank') => {
    setPaymentMode(mode);
    if (mode === 'cash') {
      setCashAmountInput(selectedTotal);
      setBankAmount(0);
    } else {
      setBankAmount(selectedTotal);
      setCashAmountInput(0);
    }
  };


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

    if (selectedTotal === 0) {
      showErrorToast('Please enter collection amounts for selected bills');
      return;
    }

    const totalPayment = selectedTotal;

    if (paymentMode === 'bank' && !bankMode) {
      showErrorToast('Please select a Bank Type');
      return;
    }
    if (paymentMode === 'bank' && (!selectedBank || !transactionNo)) {
      showErrorToast('Please select bank and enter transaction number for bank payments');
      return;
    }

    setIsSubmitting(true);
    try {
      const orgId = organization?.id || 1;

      // Build bills array and filter out zero amounts
      const billsArray = selectedDues
        .map((billId) => {
          const bill = dueBills.find(b => b.id === billId);
          return {
            billType: bill?.billType || 0,
            billId: bill?.billId ?? bill?.id ?? billId,
            finalBillId: bill?.finalBillId || bill?.id || 0,
            collectedAmount: billAmounts[billId] || 0,
            discountAmount: billDiscounts[billId] || 0,
          };
        })
        .filter(bill => bill.collectedAmount > 0);

      const totalDiscount = billsArray.reduce((sum, bill) => sum + bill.discountAmount, 0);

      // Debug logging
      console.log('=== Due Collection Debug ===');
      console.log('selectedDues:', selectedDues);
      console.log('billAmounts:', billAmounts);
      console.log('billsArray (filtered):', billsArray);
      console.log('selectedTotal:', selectedTotal);

      if (billsArray.length === 0) {
        showErrorToast('No valid bills with collection amounts');
        setIsSubmitting(false);
        return;
      }

      const cashPaid = paymentMode === 'bank' ? 0 : selectedTotal;
      const bankPaid = paymentMode === 'cash' ? 0 : selectedTotal;

      const payload = {
        orgId: orgId,
        patientId: patientId || 0,
        visitId: visitId || 0,
        ipId: ipId || 0,
        collectionAmount: totalPayment,
        totalDiscount: totalDiscount,
        note: '',
        userId: loginData.id,
        systemIp: '',
        paymentMode: paymentMode.toUpperCase(),
        cashPaid,
        bankPaid,
        bankId: paymentMode !== 'cash' && selectedBank ? Number(selectedBank) : 0,
        refNo: paymentMode !== 'cash' ? (transactionNo || '') : '',
        transType: paymentMode !== 'cash' && bankMode ? Number(bankMode) : 0,
        bills: billsArray,
      };

      console.log('Final payload:', JSON.stringify(payload, null, 2));

      const response = await cashCounterApiService.saveDueCollection(payload);
      
      // Store the full response data
      const responseData = response?.data || response;
      setCollectionResponse(responseData);
      setIsPaymentSuccess(true);
      
      // Show success message with final bill display
      const finalBillDisplay = responseData?.finalBillDisplay || responseData?.billNo || 'N/A';
      showSuccessToast(`Payment collected successfully. Final Bill: ${finalBillDisplay}`);

      const paymentData = {
        selectedBillIds: selectedDues,
        totalAmount: selectedTotal,
        paymentMode,
        bankMode: paymentMode === 'cash' ? null : bankMode,
        cashAmount: selectedTotal,
        bankAmount,
        insuranceAmount,
        staffCreditAmount,
        selectedBank: paymentMode === 'cash' ? null : selectedBank,
        transactionNo: paymentMode === 'cash' ? null : transactionNo,
        payload,
        response,
        billNo: responseData?.finalBillDisplay || responseData?.billNo || 'N/A',
        finalBillId: responseData?.finalBillId || null,
      };

      if (onPaymentComplete) {
        onPaymentComplete(paymentData);
      }
    } catch (error: any) {
      console.error('=== Payment Error ===');
      console.error('Full error:', error);
      console.error('Error response:', error?.response);
      console.error('Error data:', error?.response?.data);
      
      const errorMsg = error?.response?.data?.message || 'Failed to collect payment';
      showErrorToast(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetPaymentForm = () => {
    setCashAmountInput(0);
    setBillAmounts({});
    setBillDiscounts({});
    setBankAmount(0);
    setInsuranceAmount(0);
    setStaffCreditAmount(0);
    setSelectedBank('');
    setTransactionNo('');
    setPaymentMode('cash');
    setBankMode('');
    setCollectionResponse(null);
    setIsPaymentSuccess(false);
  };

  const handleModalHide = () => {
    resetPaymentForm();
    onHide();
  };

  // Keyboard shortcuts scoped to this modal
  useEffect(() => {
    if (!show) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.altKey) return;
      const key = e.key.toLowerCase();

      // Alt+S — Collect (submit payment)
      if (key === 's') {
        e.preventDefault();
        if (!isPaymentSuccess && !isSubmitting && selectedDues.length > 0 && selectedTotal > 0) {
          handlePaymentSubmit();
        }
        return;
      }

      // Alt+P — Print (only after successful collection)
      if (key === 'p') {
        e.preventDefault();
        if (isPaymentSuccess && collectionResponse?.finalBillId && onPrint) {
          onPrint(collectionResponse.finalBillId);
        }
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [show, isPaymentSuccess, isSubmitting, selectedDues, selectedTotal, collectionResponse, onPrint]);

  return (
    <Modal show={show} onHide={handleModalHide} size="xl" centered backdrop="static" keyboard={false}>
      <Modal.Header closeButton className="bg-light border-bottom">
        <Modal.Title className="fw-bold d-flex align-items-center gap-2">
          <FaMoneyBillWaveIcon className="text-danger" />
          Collect Outstanding Dues
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0 d-flex flex-column" style={{ maxHeight: 'calc(100vh - 70px)' }}>
        {isPaymentSuccess ? (
          /* Success View */
          <div className="flex-grow-1 overflow-auto">
          <div className="text-center p-4">
            <div className="mb-4">
              <div style={{ fontSize: '64px', color: 'var(--success-color, #28a745)' }}>✓</div>
            </div>
            <h4 className="mb-3 fw-bold" style={{ color: 'var(--success-color, #28a745)' }}>
              Payment Collected Successfully!
            </h4>
            
            {/* Final Bill Display */}
            <div className="mb-4 p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <div className="text-muted mb-2">Final Bill Number</div>
              <h3 className="fw-bold mb-3" style={{ color: themePrimary }}>
                {collectionResponse?.finalBillDisplay || 'N/A'}
              </h3>
              <div className="text-muted mb-1 small">Updated Due Balance</div>
              <h5 className="fw-bold text-danger">₹{(collectionResponse?.updatedDueBalance || 0).toFixed(2)}</h5>
            </div>

            {/* Collection Bills List */}
            {collectionResponse?.dueCollectionResponseBillItemData && 
             collectionResponse.dueCollectionResponseBillItemData.length > 0 && (
              <div className="mb-4">
                <div className="text-muted mb-3 small fw-semibold">Due Collection Bills</div>
                <div className="d-flex flex-column gap-2">
                  {collectionResponse.dueCollectionResponseBillItemData.map((bill: any, index: number) => (
                    <div 
                      key={bill.dueCollectionId || index}
                      className="p-2 d-flex justify-content-between align-items-center"
                      style={{ 
                        backgroundColor: 'white',
                        border: '1px solid #dee2e6',
                        borderRadius: '6px'
                      }}
                    >
                      <span className="text-muted small">Bill #{index + 1}</span>
                      <span className="fw-semibold" style={{ color: themeSecondary }}>
                        {bill.billDisplay}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Total Collected Amount */}
            <div className="mb-3">
              <div className="text-muted mb-1 small">Total Collected Amount</div>
              <h5 className="fw-bold text-success">₹{selectedTotal.toFixed(2)}</h5>
            </div>
          </div>
          </div>
        ) : (
          <>
        {/* Summary Header */}
        <div className="p-3 bg-light border-bottom">
          <div className="row g-2">
            <div className="col-auto">
              <div className="fw-bold text-dark" style={{ fontSize: 'var(--font-size-sm)' }}>Total Due</div>
              <div className="fw-bold text-dark" style={{ fontSize: 'var(--font-size-md)' }}>₹{totalBalance.toFixed(2)}</div>
            </div>
            <div className="col-auto ms-auto">
              <div className="fw-bold text-dark" style={{ fontSize: 'var(--font-size-sm)' }}>Selected</div>
              <div className="fw-bold text-dark" style={{ fontSize: 'var(--font-size-md)' }}>₹{selectedTotal.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Bills Table */}
        <div className="flex-grow-1 overflow-auto" style={{ minHeight: 0 }}>
          <div className="p-3">
            <Table striped bordered hover size="sm" className="mb-0">
              <thead className="bg-light sticky-top" style={{ zIndex: 10 }}>
                <tr>
                  <th style={{ width: '40px' }} className="text-center">Sl No</th>
                  <th>Date</th>
                  <th>Bill No</th>
                  <th style={{ width: '100px' }}>Type</th>
                  <th className="text-end">Amount</th>
                  <th className="text-end">Balance</th>
                  {canDueDiscount && <th style={{ width: '120px' }}>Discount</th>}
                  <th style={{ width: '140px' }}>Collect Amount</th>
                </tr>
              </thead>
              <tbody>
                {sortedBills.map((bill, index) => {
                  const disabled = isRowDisabled(bill);
                  return (
                  <tr
                    key={`${bill.id}-${bill.billId ?? 'no-bill'}-${bill.finalBillId ?? 'no-final'}-${index}`}
                    style={{
                      backgroundColor: selectedDues.includes(bill.id) ? '#e8f5e9' : 'transparent',
                      opacity: disabled ? 0.45 : 1,
                      cursor: disabled ? 'not-allowed' : 'pointer',
                    }}
                    onClick={() => { if (!disabled) handleDueCheckboxChange(bill, !selectedDues.includes(bill.id)); }}
                  >
                    <td className="text-center">
                      <Form.Check
                        type="checkbox"
                        checked={selectedDues.includes(bill.id)}
                        disabled={disabled}
                        onChange={(e) => handleDueCheckboxChange(bill, e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td className="fw-bold text-dark">{bill.date}</td>
                    <td className="fw-bold text-dark">{bill.billNo && bill.billNo !== '-' ? bill.billNo : ''}</td>
                    <td>
                      {bill.type === 'procedure' && <Badge bg="primary" className="small">Procedure</Badge>}
                      {bill.type === 'pharmacy' && <Badge bg="success" className="small">Pharmacy</Badge>}
                      {bill.type === 'lab' && <Badge bg="info" className="small">Lab</Badge>}
                      {bill.type === 'ip' && <Badge bg="warning" text="dark" className="small">IP</Badge>}
                      {bill.type === 'registration' && <Badge bg="secondary" className="small">Registration</Badge>}
                    </td>
                    <td className="text-end fw-bold text-dark">₹{bill.amount.toFixed(2)}</td>
                    <td className="text-end fw-bold text-dark">₹{bill.balance.toFixed(2)}</td>
                    {canDueDiscount && (
                      <td>
                        <Form.Control
                          type="number"
                          size="sm"
                          value={formatNumberDisplay(billDiscounts[bill.id] || 0)}
                          onChange={(e) => handleBillDiscountChange(bill.id, e.target.value)}
                          onBlur={(e) => handleBillDiscountBlur(bill.id, e.target.value)}
                          onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          min="0"
                          step="0.01"
                          placeholder="0"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                    )}
                    <td>
                      <Form.Control
                        type="number"
                        size="sm"
                        value={formatNumberDisplay(billAmounts[bill.id] || 0)}
                        onChange={(e) => handleBillAmountChange(bill.id, e.target.value)}
                        onBlur={(e) => handleBillAmountBlur(bill.id, e.target.value)}
                        onWheel={(e) => (e.target as HTMLInputElement).blur()}
                        min="0"
                        max={bill.balance}
                        step="0.01"
                        placeholder="0"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        </div>

        {/* Payment Form */}
        <div className="p-3 border-top">
          <div className="mb-3">
            <div className="fw-bold text-dark mb-2" style={{ fontSize: 'var(--font-size-sm)' }}>PAYMENT MODE</div>
            <div className="d-flex gap-2">
              <div className="flex-grow-1">
                <input
                  type="radio"
                  className="btn-check"
                  name="duePaymentMode"
                  id="dueCash"
                  checked={paymentMode === 'cash'}
                  onChange={() => handlePaymentModeChange('cash')}
                />
                <label
                  className={`btn btn-sm w-100 advance-action-btn ${paymentMode === 'cash' ? 'is-selected' : ''}`}
                  htmlFor="dueCash"
                >
                  <FaMoneyBillWaveIcon className="me-1" />
                  Cash
                </label>
              </div>
              <div className="flex-grow-1">
                <input
                  type="radio"
                  className="btn-check"
                  name="duePaymentMode"
                  id="dueBank"
                  checked={paymentMode === 'bank'}
                  onChange={() => handlePaymentModeChange('bank')}
                />
                <label
                  className={`btn btn-sm w-100 advance-action-btn ${paymentMode === 'bank' ? 'is-selected' : ''}`}
                  htmlFor="dueBank"
                >
                  <FaCreditCardIcon className="me-1" />
                  Bank
                </label>
              </div>
            </div>
          </div>

          <Row className="g-2">
            {paymentMode === 'cash' && (
              <Col xs={12} sm={6}>
                <Form.Group>
                  <Form.Label className="fw-bold text-dark mb-1" style={{ fontSize: 'var(--font-size-sm)' }}>Cash Amount</Form.Label>
                  <Form.Control
                    ref={cashAmountRef}
                    type="number"
                    placeholder="0"
                    value={formatNumberDisplay(cashAmountInput)}
                    onChange={(e) => handleCashAmountChange(e.target.value)}
                    onBlur={(e) => setCashAmountInput(handleNumberBlur(e.target.value))}
                    onWheel={(e) => (e.target as HTMLInputElement).blur()}
                    min="0"
                    step="0.01"
                    size="sm"
                  />
                </Form.Group>
              </Col>
            )}
            {paymentMode === 'bank' && (
              <Col xs={12} sm={6}>
                <Form.Group>
                  <Form.Label className="fw-bold text-dark mb-1" style={{ fontSize: 'var(--font-size-sm)' }}>Bank Amount</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="0"
                    value={formatNumberDisplay(bankAmount)}
                    onChange={(e) => handleBankAmountAutoFill(e.target.value)}
                    onBlur={(e) => setBankAmount(handleNumberBlur(e.target.value))}
                    onWheel={(e) => (e.target as HTMLInputElement).blur()}
                    min="0"
                    step="0.01"
                    size="sm"
                    autoFocus
                  />
                </Form.Group>
              </Col>
            )}
            <Col xs={12} sm={6}>
              <div className="p-2 border rounded bg-light">
                <div className="fw-bold text-dark" style={{ fontSize: 'var(--font-size-sm)' }}>Collect Amount</div>
                <div className="fw-bold text-dark" style={{ fontSize: 'var(--font-size-md)' }}>
                  ₹{selectedTotal.toFixed(2)}
                </div>
              </div>
            </Col>
          </Row>

          {paymentMode === 'bank' && (
            <>
              <div className="fw-bold text-dark mb-2 mt-3" style={{ fontSize: 'var(--font-size-sm)' }}>BANK DETAILS</div>
              <Row className="g-2">
                <Col xs={12} sm={4}>
                  <Form.Group>
                    <Form.Label className="fw-bold text-dark mb-1" style={{ fontSize: 'var(--font-size-sm)' }} >Bank Type</Form.Label>
                    <Form.Select
                      value={bankMode}
                      onChange={(e) => setBankMode(e.target.value)}
                      size="sm"
                    >
                      <option value="">-- Select Type --</option>
                      {paymentModes.map((mode: any) => (
                        <option key={mode.id} value={String(mode.id)}>
                          {mode.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col xs={12} sm={4}>
                  <Form.Group>
                    <Form.Label className="fw-bold text-dark mb-1" style={{ fontSize: 'var(--font-size-sm)' }}>Bank Name</Form.Label>
                    <Form.Select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      size="sm"
                      required
                    >
                      <option value="">-- Select Bank --</option>
                      {banks
                        .filter((bank) => bank.isActive === 1)
                        .map((bank) => (
                          <option key={bank.id} value={bank.id}>
                            {bank.name}
                          </option>
                        ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col xs={12} sm={4}>
                  <Form.Group>
                    <Form.Label className="fw-bold text-dark mb-1" style={{ fontSize: 'var(--font-size-sm)' }}>Transaction No</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder=""
                      value={transactionNo}
                      onChange={(e) => setTransactionNo(e.target.value)}
                      size="sm"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </>
          )}
        </div>
        </>
        )}
      </Modal.Body>
      <Modal.Footer className="bg-light border-top py-2 px-3">
        {isPaymentSuccess ? (
          <div className="d-flex gap-2">
            {collectionResponse?.finalBillId && onPrint && (
              <Button size="sm" onClick={() => onPrint(collectionResponse.finalBillId)} className="theme-btn-secondary">
                🖨️ Print
              </Button>
            )}
            <Button size="sm" onClick={handleModalHide} className="fw-bold theme-btn-primary">
              Close
            </Button>
          </div>
        ) : (
          <>
            <Button size="sm" onClick={handleModalHide} disabled={isSubmitting} style={{ color: 'var(--page-secondary-color)' }} className='theme-outline-btn-secondary'>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handlePaymentSubmit}
              disabled={isSubmitting || selectedDues.length === 0 || selectedTotal === 0}
              style={{ backgroundColor: 'var(--page-secondary-color)', color: 'var(--page-primary-color)', border: 'none' }}
              className="fw-bold"
            >
              {isSubmitting ? 'Processing...' : `Collect ₹${selectedTotal.toFixed(2)}`}
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default DueBillsModal;
