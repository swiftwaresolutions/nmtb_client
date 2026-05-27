import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { RootState } from '../../../../../state/store';
import { CashCounterApiService } from '../../../../../api/cash-counter/cash-counter-api-service';
import { showSuccessToast, showErrorToast, showValidationError } from '../../../../../utils/alertUtil';
import { handleNumberChange, handleNumberBlur, formatNumberDisplay } from '../../../../../utils/numberInputUtil';

interface AdvanceReturnFormProps {
  patientId?: number;
  visitId?: number;
  ipId?: number;
  systemIp?: string;
  currentBalance?: number;
  onSuccess?: (finalBillId?: number) => void;
  onClose: () => void;
  onPrint?: (finalBillId: number) => void;
}

const AdvanceReturnForm: React.FC<AdvanceReturnFormProps> = ({
  patientId = 0,
  visitId = 0,
  ipId = 0,
  systemIp = '',
  currentBalance = 0,
  onSuccess,
  onClose,
  onPrint,
}) => {
  const themePrimary = 'var(--page-primary-color)';
  const themeSecondary = 'var(--page-secondary-color)';
  const loginData = useSelector((state: RootState) => state.loginData);
  const [returnAmount, setReturnAmount] = useState<number>(0);
  const [note, setNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successFinalBillId, setSuccessFinalBillId] = useState<number | null>(null);
  const cashCounterApiService = new CashCounterApiService();

  // Alt+S — Return Advance; Alt+P — Print on success
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.altKey) return;
      const key = e.key.toLowerCase();
      if (key === 's') {
        e.preventDefault();
        if (!isSuccess && !isProcessing && returnAmount > 0) {
          handleSubmit();
        }
      } else if (key === 'p') {
        e.preventDefault();
        if (isSuccess && successFinalBillId && onPrint) {
          onPrint(successFinalBillId);
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSuccess, isProcessing, returnAmount, successFinalBillId, onPrint]);

  const handleSubmit = async () => {
    try {
      if (returnAmount <= 0) {
        showValidationError('Please enter a return amount');
        return;
      }

      if (returnAmount > currentBalance) {
        showErrorToast(`Return amount (₹${returnAmount.toFixed(2)}) cannot exceed available advance (₹${currentBalance.toFixed(2)})`);
        return;
      }

      setIsProcessing(true);

      const payload = {
        patientId: patientId || 0,
        visitId: visitId || 0,
        ipId: ipId || 0,
        returnAmount: returnAmount,
        note: note || '',
        userId: loginData.id || 0,
        systemIp: systemIp || '',
        paymentMode: 'CASH',
        cashReturned: returnAmount,
      };

      const returnResponse = await cashCounterApiService.saveAdvanceReturn(payload);
      const returnFinalBillId = returnResponse?.data?.finalBillId || returnResponse?.finalBillId;

      showSuccessToast('Advance returned successfully', 'Success');
      setNote('');
      setReturnAmount(0);
      setSuccessFinalBillId(returnFinalBillId || null);
      setIsSuccess(true);
      onSuccess?.();
    } catch (error: any) {
      console.error('Error processing advance return:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to process advance return';
      showErrorToast(errorMessage, 'Error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center py-4">
        <div style={{ fontSize: '48px', color: 'var(--success-color, #28a745)' }}>✓</div>
        <h5 className="fw-bold mb-3" style={{ color: 'var(--success-color, #28a745)' }}>
          Advance Returned Successfully!
        </h5>
        {successFinalBillId && (
          <div className="mb-3 p-2 mx-auto" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px', maxWidth: '240px' }}>
            <div className="text-muted small mb-1">Bill Number</div>
            <div className="fw-bold" style={{ color: themePrimary }}>{successFinalBillId}</div>
          </div>
        )}
        <div className="d-flex justify-content-center gap-2 mt-3">
          {successFinalBillId && onPrint && (
            <Button size="sm" className="theme-btn-secondary" onClick={() => onPrint(successFinalBillId!)}>
              🖨️ Print
            </Button>
          )}
          <Button size="sm" className="fw-bold theme-btn-primary" onClick={() => { setIsSuccess(false); onClose(); }}>
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Return Amount Input */}
      <div className="mb-3">
        <Form.Label className="small fw-medium text-muted mb-1">Return Amount</Form.Label>
        <div>
          <Form.Control
            type="number"
            placeholder="0"
            value={formatNumberDisplay(returnAmount)}
            onChange={(e) => {
              const value = handleNumberChange(e.target.value);
              if (value > currentBalance) {
                showErrorToast(`Return amount cannot exceed available advance of ₹${currentBalance.toFixed(2)}`);
                return;
              }
              setReturnAmount(value);
            }}
            onBlur={(e) => {
              const value = handleNumberBlur(e.target.value);
              if (value > currentBalance) {
                setReturnAmount(currentBalance);
              } else {
                setReturnAmount(value);
              }
            }}
            size="sm"
            autoFocus
          />
        </div>
      </div>

      {/* Note Textarea */}
      <div className="mb-3">
        <Form.Label className="small fw-medium text-muted mb-1">Reason for Return (Optional)</Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder=""
          size="sm"
          style={{ resize: 'none' }}
        />
      </div>

      {/* Action Buttons */}
      <div className="d-flex justify-content-end gap-2 mt-4">
        <Button 
          size="sm" 
          onClick={onClose} 
          disabled={isProcessing}
          className='theme-outline-btn-secondary'
        >
          Close
        </Button>
        <Button
          size="sm"
          className="fw-bold theme-btn-primary"
          onClick={handleSubmit}
          disabled={isProcessing || returnAmount <= 0}
        >
          {isProcessing ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Processing...
            </>
          ) : (
            'Return Advance'
          )}
        </Button>
      </div>
    </div>
  );
};

export default AdvanceReturnForm;
