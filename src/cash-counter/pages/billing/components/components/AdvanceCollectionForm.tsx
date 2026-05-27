import React from 'react';
import { Form, Button } from 'react-bootstrap';
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
  banks,
  selectedBank,
  onChangeSelectedBank,
  transactionNo,
  onChangeTransactionNo,
  onClose,
  onSave,
}) => {
  return (
    <div>
      {/* Payment Mode Selection */}
      <Form.Group className="mb-3">
        <Form.Label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Payment Mode</Form.Label>
        <div className="d-flex bg-light rounded p-1 border">
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
              className={`btn btn-sm w-100 border-0 rounded py-2 ${
                paymentMode === 'cash' ? 'bg-white shadow-sm fw-bold text-primary' : 'text-muted'
              }`}
              htmlFor="collPaymentCash"
            >
              <FaMoneyBillWaveIcon className="me-2" />
              Cash
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
              className={`btn btn-sm w-100 border-0 rounded py-2 ${
                paymentMode === 'bank' ? 'bg-white shadow-sm fw-bold text-primary' : 'text-muted'
              }`}
              htmlFor="collPaymentBank"
            >
              <FaCreditCardIcon className="me-2" />
              Bank
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
              className={`btn btn-sm w-100 border-0 rounded py-2 ${
                paymentMode === 'cash-bank' ? 'bg-white shadow-sm fw-bold text-primary' : 'text-muted'
              }`}
              htmlFor="collPaymentSplit"
            >
              <FaExchangeAltIcon className="me-2" />
              Split
            </label>
          </div>
        </div>
      </Form.Group>

      {/* Amounts Row */}
      <div className="flex-form-row mb-3">
        {(paymentMode === 'cash' || paymentMode === 'cash-bank') && (
          <div className="flex-form-item flex-50">
            <Form.Group>
              <Form.Label style={{ fontSize: '0.85rem', fontWeight: '500' }}>
                Cash Amount <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="number"
                value={formatNumberDisplay(cashAmount)}
                onChange={(e) => onChangeCashAmount(handleNumberChange(e.target.value))}
                onBlur={(e) => onChangeCashAmount(handleNumberBlur(e.target.value))}
                placeholder="0.00"
                style={{ fontSize: '0.85rem', padding: '0.4rem' }}
                autoFocus={paymentMode === 'cash'}
              />
            </Form.Group>
          </div>
        )}
        {(paymentMode === 'bank' || paymentMode === 'cash-bank') && (
          <div className="flex-form-item flex-50">
            <Form.Group>
              <Form.Label style={{ fontSize: '0.85rem', fontWeight: '500' }}>
                Bank Amount <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="number"
                value={formatNumberDisplay(bankAmount)}
                onChange={(e) => onChangeBankAmount(handleNumberChange(e.target.value))}
                onBlur={(e) => onChangeBankAmount(handleNumberBlur(e.target.value))}
                placeholder="0.00"
                style={{ fontSize: '0.85rem', padding: '0.4rem' }}
                autoFocus={paymentMode === 'bank'}
              />
            </Form.Group>
          </div>
        )}
      </div>

      {/* Bank Details */}
      {(paymentMode === 'bank' || paymentMode === 'cash-bank') && (
        <div className="flex-form-row mb-3">
          <div className="flex-form-item flex-33">
            <Form.Group>
              <Form.Label style={{ fontSize: '0.85rem', fontWeight: '500' }}>
                Bank Type <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                value={bankMode}
                onChange={(e) => onChangeBankMode(e.target.value)}
                style={{ fontSize: '0.85rem', padding: '0.4rem' }}
              >
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="neft">NEFT</option>
                <option value="cheque">Cheque</option>
              </Form.Select>
            </Form.Group>
          </div>
          <div className="flex-form-item flex-33">
            <Form.Group>
              <Form.Label style={{ fontSize: '0.85rem', fontWeight: '500' }}>
                Bank Name <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                value={selectedBank}
                onChange={(e) => onChangeSelectedBank(e.target.value)}
                style={{ fontSize: '0.85rem', padding: '0.4rem' }}
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
          </div>
          <div className="flex-form-item flex-33">
            <Form.Group>
              <Form.Label style={{ fontSize: '0.85rem', fontWeight: '500' }}>
                Transaction No
              </Form.Label>
              <Form.Control
                type="text"
                value={transactionNo}
                onChange={(e) => onChangeTransactionNo(e.target.value)}
                placeholder="Enter Txn No"
                style={{ fontSize: '0.85rem', padding: '0.4rem' }}
              />
            </Form.Group>
          </div>
        </div>
      )}

      <div className="d-flex justify-content-end gap-2 mt-3">
        <Button variant="secondary" size="sm" onClick={onClose}>
          Close
        </Button>
        <Button
          size="sm"
          variant="success"
          style={{ minWidth: '120px' }}
          onClick={onSave}
        >
          Collect Advance
        </Button>
      </div>
    </div>
  );
};

export default AdvanceCollectionForm;
