import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Form, Button } from 'react-bootstrap';
import { RootState } from '../../../../../state/store';
import { CashCounterApiService } from '../../../../../api/cash-counter/cash-counter-api-service';
import { showSuccessToast, showErrorToast, showValidationError } from '../../../../../utils/alertUtil';
import { handleNumberChange, handleNumberBlur, formatNumberDisplay } from '../../../../../utils/numberInputUtil';

interface AdvanceReturnFormProps {
  patientId?: number;
  visitId?: number;
  ipId?: number;
  systemIp?: string;
  onSuccess?: () => void;
  onClose: () => void;
}

const AdvanceReturnForm: React.FC<AdvanceReturnFormProps> = ({
  patientId = 0,
  visitId = 0,
  ipId = 0,
  systemIp = '',
  onSuccess,
  onClose,
}) => {
  const loginData = useSelector((state: RootState) => state.loginData);
  const [returnAmount, setReturnAmount] = useState<number>(0);
  const [note, setNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const cashCounterApiService = new CashCounterApiService();

  const handleSubmit = async () => {
    try {
      // Validation
      if (returnAmount <= 0) {
        showValidationError('Please enter a return amount');
        return;
      }

      setIsProcessing(true);

      // Prepare request payload
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

      // Call API
      await cashCounterApiService.saveAdvanceReturn(payload);

      // Success handling
      showSuccessToast('Advance returned successfully', 'Success');
      setNote('');
      setReturnAmount(0);
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Error processing advance return:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to process advance return';
      showErrorToast(errorMessage, 'Error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <div className="flex-form-row mb-3">
        <div className="flex-form-item flex-100">
          <Form.Group>
            <Form.Label style={{ fontSize: '0.85rem', fontWeight: '500' }}>
              Return Amount <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="number"
              value={formatNumberDisplay(returnAmount)}
              onChange={(e) => setReturnAmount(handleNumberChange(e.target.value))}
              onBlur={(e) => setReturnAmount(handleNumberBlur(e.target.value))}
              placeholder="0.00"
              style={{ fontSize: '0.85rem', padding: '0.4rem' }}
              autoFocus
            />
          </Form.Group>
        </div>
      </div>

      <div className="flex-form-row mb-2">
        <div className="flex-form-item flex-100">
          <Form.Group>
            <Form.Label style={{ fontSize: '0.85rem', fontWeight: '500' }}>
              Note (Optional)
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Reason for return..."
              style={{ fontSize: '0.85rem', backgroundColor: 'white' }}
            />
          </Form.Group>
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2 mt-3">
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={onClose} 
          disabled={isProcessing}
        >
          Close
        </Button>
        <Button
          size="sm"
          variant="danger"
          onClick={handleSubmit}
          disabled={isProcessing}
          style={{ minWidth: '120px' }}
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
