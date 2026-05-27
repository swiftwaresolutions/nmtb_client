import React from 'react';
import { Modal, Table, Badge, Form } from 'react-bootstrap';
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
  advanceHistory: AdvanceHistoryItem[];
  banks: any[];
  selectedBank: string;
  onChangeSelectedBank: (bankId: string) => void;
  transactionNo: string;
  onChangeTransactionNo: (value: string) => void;
  cashAmount: number;
  onChangeCashAmount: (value: number) => void;
  bankAmount: number;
  onChangeBankAmount: (value: number) => void;
  // Additional props for API integration
  patientId?: number;
  visitId?: number;
  ipId?: number;
  systemIp?: string;
  onAdvanceReturnSuccess?: () => void;
  onAdvanceCollectionSuccess?: () => void;
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
  advanceHistory,
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
}) => {
  // Calculate current balance from latest history (assuming desc sort)
  const currentBalance = advanceHistory.length > 0 ? advanceHistory[0].balance : 0;

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title className="fs-5">Advance Management</Modal.Title>
      </Modal.Header>
      <Modal.Body className="d-flex flex-column p-0" style={{ maxHeight: '80vh' }}>
        
        {/* Top Summary Header */}
        <div className="p-3 bg-light border-bottom">
          <div className="d-flex justify-content-between align-items-center">
            <h6 className="mb-0">
              Current Balance: <span className="text-success fw-bold">₹{currentBalance.toFixed(2)}</span>
            </h6>
            <Badge bg="info">{advanceHistory.length} History Items</Badge>
          </div>
        </div>

        {/* Scrollable Table Area */}
        <div className="flex-grow-1" style={{ overflowY: 'auto', minHeight: '200px' }}>
          <div className="p-3">
             <h6 className="mb-2 text-muted small text-uppercase fw-bold">Transaction History</h6>
            <Table hover className="mb-0 align-middle" style={{ fontSize: '0.85rem' }}>
              <thead className="bg-light text-muted sticky-top">
                <tr>
                  <th className="ps-3 py-2">Date</th>
                  <th className="py-2">Receipt No</th>
                  <th className="text-end py-2">Amount</th>
                  <th className="text-end py-2" hidden>Used</th>
                  <th className="text-end py-2" hidden>Balance</th>
                </tr>
              </thead>
              <tbody>
                {advanceHistory.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-muted">No advance history found</td>
                  </tr>
                ) : (
                  advanceHistory.map((adv) => (
                    <tr key={adv.id}>
                      <td className="ps-3 py-2">{adv.date}</td>
                      <td className="py-2">{adv.receiptNo}</td>
                      <td className="text-end text-success fw-bold py-2">₹{adv.amount.toFixed(2)}</td>
                      <td className="text-end text-muted py-2" hidden>₹{adv.used.toFixed(2)}</td>
                      <td className="text-end text-success fw-bold py-2" hidden>₹{adv.balance.toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </div>

        {/* Fixed Bottom Form Section */}
        <div className="p-3 border-top" style={{ backgroundColor: '#fafafa' }}>
          <h6 className="mb-3" style={{ color: '#2d3748', fontWeight: '600' }}>
            {advanceMode === 'collection' ? 'New Advance Entry' : 'Return Advance'}
          </h6>

          {/* Mode Selection */}
          <Form.Group className="mb-3">
            <Form.Label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Action</Form.Label>
            <div className="d-flex bg-light rounded p-1 border">
              <div className="flex-grow-1">
                <input
                  type="radio"
                  className="btn-check"
                  name="advanceMode"
                  id="modeCollection"
                  checked={advanceMode === 'collection'}
                  onChange={() => onChangeAdvanceMode('collection')}
                />
                <label
                  className={`btn btn-sm w-100 border-0 rounded py-2 ${
                    advanceMode === 'collection' ? 'bg-white shadow-sm fw-bold text-success' : 'text-muted'
                  }`}
                  htmlFor="modeCollection"
                >
                  Collect Advance
                </label>
              </div>
              <div className="flex-grow-1">
                <input
                  type="radio"
                  className="btn-check"
                  name="advanceMode"
                  id="modeReturn"
                  checked={advanceMode === 'return'}
                  onChange={() => onChangeAdvanceMode('return')}
                />
                <label
                  className={`btn btn-sm w-100 border-0 rounded py-2 ${
                    advanceMode === 'return' ? 'bg-white shadow-sm fw-bold text-danger' : 'text-muted'
                  }`}
                  htmlFor="modeReturn"
                >
                  Return Advance
                </label>
              </div>
            </div>
          </Form.Group>

          {/* Conditional Form Rendering */}
          {advanceMode === 'collection' ? (
            <AdvanceCollectionForm
              paymentMode={advancePaymentMode}
              onChangePaymentMode={onChangeAdvancePaymentMode}
              cashAmount={cashAmount}
              onChangeCashAmount={onChangeCashAmount}
              bankAmount={bankAmount}
              onChangeBankAmount={onChangeBankAmount}
              bankMode={advanceBankMode}
              onChangeBankMode={onChangeAdvanceBankMode}
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
              onSuccess={onAdvanceReturnSuccess}
              onClose={onHide}
            />
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default AdvanceModal;
