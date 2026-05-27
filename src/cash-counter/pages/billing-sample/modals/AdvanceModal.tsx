import React, { useEffect } from 'react';
import { Modal, Table, Badge, Form, Button } from 'react-bootstrap';
import AdvanceCollectionForm from './components/AdvanceCollectionForm';
import AdvanceReturnForm from './components/AdvanceReturnForm';

type AdvanceMode = 'collection' | 'return';
type AdvancePaymentMode = 'cash' | 'bank' | 'cash-bank';

interface AdvanceHistoryItem {
  id: number;
  date: string;
  receiptNo: string;
  amount: number;
  used: number;
  balance: number;
}

interface AdvanceModalProps {
  show: boolean;
  onHide: () => void;
  advanceMode: AdvanceMode;
  onChangeAdvanceMode: (mode: AdvanceMode) => void;
  advancePaymentMode: AdvancePaymentMode;
  onChangeAdvancePaymentMode: (mode: AdvancePaymentMode) => void;
  advanceBankMode: string;
  onChangeAdvanceBankMode: (mode: string) => void;
  advancePaymentModes?: any[];
  advanceHistory: AdvanceHistoryItem[];
  currentBalance?: number;
  banks: any[];
  selectedBank: string;
  onChangeSelectedBank: (bankId: string) => void;
  transactionNo: string;
  onChangeTransactionNo: (value: string) => void;
  cashAmount: number;
  onChangeCashAmount: (value: number) => void;
  bankAmount: number;
  onChangeBankAmount: (value: number) => void;
  patientId?: number;
  visitId?: number;
  ipId?: number;
  systemIp?: string;
  onAdvanceReturnSuccess?: (finalBillId?: number) => void;
  onAdvanceCollectionSuccess?: () => void;
  onPrint?: (finalBillId: number) => void;
  collectionSuccess?: boolean;
  collectionSuccessBillId?: number | null;
}

const AdvanceModal: React.FC<AdvanceModalProps> = ({
  show,
  onHide,
  advanceMode,
  onChangeAdvanceMode,
  advancePaymentMode,
  onChangeAdvancePaymentMode,
  advanceBankMode,
  onChangeAdvanceBankMode,
  advancePaymentModes = [],
  advanceHistory,
  currentBalance = 0,
  banks,
  selectedBank,
  onChangeSelectedBank,
  transactionNo,
  onChangeTransactionNo,
  cashAmount,
  onChangeCashAmount,
  bankAmount,
  onChangeBankAmount,
  patientId = 0,
  visitId = 0,
  ipId = 0,
  systemIp = '',
  onAdvanceReturnSuccess,
  onAdvanceCollectionSuccess,
  onPrint,
  collectionSuccess = false,
  collectionSuccessBillId = null,
}) => {
  const themePrimary = 'var(--page-primary-color)';
  const themeSecondary = 'var(--page-secondary-color)';
  // Use provided currentBalance instead of calculating from advanceHistory
  const displayBalance = currentBalance > 0 ? currentBalance : (advanceHistory.length > 0 ? advanceHistory[0].balance : 0);

  // Alt+P — Print on collection success
  useEffect(() => {
    if (!show) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        if (collectionSuccess && collectionSuccessBillId && onPrint) {
          onPrint(collectionSuccessBillId);
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [show, collectionSuccess, collectionSuccessBillId, onPrint]);

  return (
    <Modal show={show} onHide={onHide} size="lg" centered backdrop="static" keyboard={false}>
      <Modal.Header closeButton className="bg-light border-bottom">
        <Modal.Title className="fw-bold d-flex align-items-center gap-2">
          <span>Advance Management</span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0 d-flex flex-column" style={{ maxHeight: 'calc(100vh - 120px)' }}>
        {/* Summary Header */}
        <div className="p-3 bg-light border-bottom" style={{ backgroundColor: '#f8f9fa' }}>
          <div className="row g-2 align-items-center">
            <div className="col-auto">
              <div className="small text-muted fw-medium">Total Advance</div>
              <div className="fw-bold text-success" style={{ fontSize: 'var(--font-size-xl)' }}>
                ₹{displayBalance.toFixed(2)}
              </div>
            </div>
            <div className="col-auto ms-auto">
              <div className="small text-muted">Transaction History</div>
              <div className="fw-bold text-info">{advanceHistory.length} {advanceHistory.length === 1 ? 'Item' : 'Items'}</div>
            </div>
          </div>
        </div>

        {/* Transaction History Table */}
        <div className="flex-grow-1 overflow-auto" style={{ minHeight: 0 }}>
          <div className="p-3">
            <div className="small fw-bold text-muted text-uppercase mb-2">Transaction History</div>
            <Table striped bordered hover size="sm" className="mb-0">
              <thead className="bg-light sticky-top" style={{ zIndex: 10 }}>
                <tr>
                  <th>Date</th>
                  <th>Receipt No</th>
                  <th className="text-end">Amount</th>
                </tr>
              </thead>
              <tbody>
                {advanceHistory.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-4 text-muted small">
                      No advance history found
                    </td>
                  </tr>
                ) : (
                  advanceHistory.map((adv) => (
                    <tr key={adv.id}>
                      <td className="small">{adv.date}</td>
                      <td className="small fw-5">{adv.receiptNo}</td>
                      <td className="text-end small fw-bold text-success">₹{adv.amount.toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </div>

        {/* Action Selection */}
        <div className="p-3 border-top">
          <div className="mb-3">
            <div className="small fw-bold text-muted mb-2">ACTION</div>
            <div className="d-flex gap-2">
              <div className="flex-grow-1">
                <input
                  type="radio"
                  className="btn-check"
                  name="advanceAction"
                  id="advCollection"
                  checked={advanceMode === 'collection'}
                  onChange={() => onChangeAdvanceMode('collection')}
                />
                <label
                  className={`btn btn-sm w-100 advance-action-btn ${advanceMode === 'collection' ? 'is-selected' : ''}`}
                  htmlFor="advCollection"
                >
                  Collect Advance
                </label>
              </div>
              <div className="flex-grow-1">
                <input
                  type="radio"
                  className="btn-check"
                  name="advanceAction"
                  id="advReturn"
                  checked={advanceMode === 'return'}
                  onChange={() => onChangeAdvanceMode('return')}
                />
                <label
                  className={`btn btn-sm w-100 advance-action-btn ${advanceMode === 'return' ? 'is-selected' : ''}`}
                  htmlFor="advReturn"
                >
                  Return Advance
                </label>
              </div>
            </div>
          </div>

          {/* Conditional Sub-Component */}
          {collectionSuccess ? (
            /* Collection Success View */
            <div className="text-center py-4">
              <div style={{ fontSize: '48px', color: 'var(--success-color, #28a745)' }}>✓</div>
              <h5 className="fw-bold mb-3" style={{ color: 'var(--success-color, #28a745)' }}>
                Advance Collected Successfully!
              </h5>
              {collectionSuccessBillId && (
                <div className="mb-3 p-2 mx-auto" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px', maxWidth: '240px' }}>
                  <div className="text-muted small mb-1">Bill Number</div>
                  <div className="fw-bold" style={{ color: themePrimary }}>{collectionSuccessBillId}</div>
                </div>
              )}
              <div className="d-flex justify-content-center gap-2 mt-3">
                {collectionSuccessBillId && onPrint && (
                  <Button size="sm" className="theme-btn-secondary" onClick={() => onPrint(collectionSuccessBillId!)}>
                    🖨️ Print
                  </Button>
                )}
                <Button size="sm" className="fw-bold theme-btn-primary" onClick={onHide}>
                  Close
                </Button>
              </div>
            </div>
          ) : advanceMode === 'collection' ? (
            <AdvanceCollectionForm
              paymentMode={advancePaymentMode}
              onChangePaymentMode={onChangeAdvancePaymentMode}
              cashAmount={cashAmount}
              onChangeCashAmount={onChangeCashAmount}
              bankAmount={bankAmount}
              onChangeBankAmount={onChangeBankAmount}
              bankMode={advanceBankMode}
              onChangeBankMode={onChangeAdvanceBankMode}
              paymentModes={advancePaymentModes}
              banks={banks}
              selectedBank={selectedBank}
              onChangeSelectedBank={onChangeSelectedBank}
              transactionNo={transactionNo}
              onChangeTransactionNo={onChangeTransactionNo}
              onClose={onHide}
              onSave={onAdvanceCollectionSuccess || (() => {})}
            />
          ) : (
            <AdvanceReturnForm
              patientId={patientId}
              visitId={visitId}
              ipId={ipId}
              systemIp={systemIp}
              currentBalance={displayBalance}
              onSuccess={onAdvanceReturnSuccess}
              onClose={onHide}
              onPrint={onPrint}
            />
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default AdvanceModal;
