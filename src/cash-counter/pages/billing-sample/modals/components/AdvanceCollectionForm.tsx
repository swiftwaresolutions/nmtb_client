import React, { useEffect } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { FaMoneyBillWave, FaCreditCard, FaExchangeAlt } from 'react-icons/fa';
import { handleNumberChange, handleNumberBlur, formatNumberDisplay } from '../../../../../utils/numberInputUtil';

const FaMoneyBillWaveIcon = FaMoneyBillWave as any;
const FaCreditCardIcon = FaCreditCard as any;
const FaExchangeAltIcon = FaExchangeAlt as any;

type PaymentMode = 'cash' | 'bank' | 'cash-bank';

interface AdvanceCollectionFormProps {
  paymentMode: PaymentMode;
  onChangePaymentMode: (mode: PaymentMode) => void;
  cashAmount: number;
  onChangeCashAmount: (value: number) => void;
  bankAmount: number;
  onChangeBankAmount: (value: number) => void;
  bankMode: string;
  onChangeBankMode: (mode: string) => void;
  paymentModes?: any[];
  banks: any[];
  selectedBank: string;
  onChangeSelectedBank: (bankId: string) => void;
  transactionNo: string;
  onChangeTransactionNo: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
}

const AdvanceCollectionForm: React.FC<AdvanceCollectionFormProps> = ({
  paymentMode,
  onChangePaymentMode,
  cashAmount,
  onChangeCashAmount,
  bankAmount,
  onChangeBankAmount,
  bankMode,
  onChangeBankMode,
  paymentModes = [],
  banks,
  selectedBank,
  onChangeSelectedBank,
  transactionNo,
  onChangeTransactionNo,
  onClose,
  onSave,
}) => {
  const themePrimary = 'var(--page-primary-color)';
  const themeSecondary = 'var(--page-secondary-color)';

  // Alt+S — Collect Advance
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        onSave();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onSave]);

  return (
    <div>
      {/* Payment Mode Selection */}
      <div className="mb-3">
        <div className="small fw-bold text-muted mb-2">PAYMENT MODE</div>
        <div className="d-flex gap-2">
          <div className="flex-grow-1">
            <input
              type="radio"
              className="btn-check"
              name="collectionPaymentMode"
              id="collPaymentCash"
              checked={paymentMode === 'cash'}
              onChange={() => onChangePaymentMode('cash')}
            />
            <label
              htmlFor="collPaymentCash"
              className={`btn btn-sm w-100 advance-action-btn ${paymentMode === 'cash' ? 'is-selected' : ''}`}
            >
              <FaMoneyBillWaveIcon className="me-1" /> Cash
            </label>
          </div>
          <div className="flex-grow-1">
            <input
              type="radio"
              className="btn-check"
              name="collectionPaymentMode"
              id="collPaymentBank"
              checked={paymentMode === 'bank'}
              onChange={() => onChangePaymentMode('bank')}
            />
            <label
              className={`btn btn-sm w-100 advance-action-btn ${paymentMode === 'bank' ? 'is-selected' : ''}`}
              htmlFor="collPaymentBank"
            >
              <FaCreditCardIcon className="me-1" /> Bank
            </label>
          </div>
          <div className="flex-grow-1">
            <input
              type="radio"
              className="btn-check"
              name="collectionPaymentMode"
              id="collPaymentSplit"
              checked={paymentMode === 'cash-bank'}
              onChange={() => onChangePaymentMode('cash-bank')}
            />
            <label
              className={`btn btn-sm w-100 advance-action-btn ${paymentMode === 'cash-bank' ? 'is-selected' : ''}`}
              htmlFor="collPaymentSplit"
            >
              <FaExchangeAltIcon className="me-1" /> Split
            </label>
          </div>
        </div>
      </div>

      {/* Amount Inputs */}
      <Row className="g-2 mb-3">
        {(paymentMode === 'cash' || paymentMode === 'cash-bank') && (
          <Col xs={12} sm={paymentMode === 'cash' ? 12 : 6}>
            <Form.Group>
              <Form.Label className="small fw-medium text-muted mb-1">Cash Amount</Form.Label>
              <Form.Control
                type="number"
                placeholder="0"
                value={formatNumberDisplay(cashAmount)}
                onChange={(e) => onChangeCashAmount(handleNumberChange(e.target.value))}
                onBlur={(e) => onChangeCashAmount(handleNumberBlur(e.target.value))}
                size="sm"
                autoFocus={paymentMode === 'cash'}
              />
            </Form.Group>
          </Col>
        )}
        {(paymentMode === 'bank' || paymentMode === 'cash-bank') && (
          <Col xs={12} sm={paymentMode === 'bank' ? 12 : 6}>
            <Form.Group>
              <Form.Label className="small fw-medium text-muted mb-1">Bank Amount</Form.Label>
              <Form.Control
                type="number"
                placeholder="0"
                value={formatNumberDisplay(bankAmount)}
                onChange={(e) => onChangeBankAmount(handleNumberChange(e.target.value))}
                onBlur={(e) => onChangeBankAmount(handleNumberBlur(e.target.value))}
                size="sm"
                autoFocus={paymentMode === 'bank'}
              />
            </Form.Group>
          </Col>
        )}
      </Row>

      {/* Bank Details */}
      {(paymentMode === 'bank' || paymentMode === 'cash-bank') && (
        <>
          <div className="small fw-bold text-muted mb-2">BANK DETAILS</div>
          <Row className="g-2 mb-3">
            <Col xs={12} sm={4}>
              <Form.Group>
                <Form.Label className="small fw-medium text-muted mb-1">Bank Type</Form.Label>
                <Form.Select
                  value={bankMode}
                  onChange={(e) => onChangeBankMode(e.target.value)}
                  size="sm"
                >
                  {paymentModes.map((mode: any) => (
                    <option key={mode.id} value={String(mode.id)}>{mode.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col xs={12} sm={4}>
              <Form.Group>
                <Form.Label className="small fw-medium text-muted mb-1">Bank Name</Form.Label>
                <Form.Select
                  value={selectedBank}
                  onChange={(e) => onChangeSelectedBank(e.target.value)}
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
                <Form.Label className="small fw-medium text-muted mb-1">Transaction No</Form.Label>
                <Form.Control
                  type="text"
                  placeholder=""
                  value={transactionNo}
                  onChange={(e) => onChangeTransactionNo(e.target.value)}
                  size="sm"
                />
              </Form.Group>
            </Col>
          </Row>
        </>
      )}

      {/* Action Buttons */}
      <div className="d-flex justify-content-end gap-2 mt-4">
        <Button size="sm" onClick={onClose} className='theme-outline-btn-secondary'>
          Close
        </Button>
        <Button size="sm" className="theme-btn-primary fw-bold" onClick={onSave}>
          Collect Advance
        </Button>
      </div>
    </div>
  );
};

export default AdvanceCollectionForm;
