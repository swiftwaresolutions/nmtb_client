import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Row, Col } from 'react-bootstrap';
import { 
  FaSave, FaPrint, FaSearch, FaSync, FaTrash, FaListUl, 
  FaMoneyBillWave, FaMoneyCheckAlt, FaBook, 
  FaExchangeAlt, FaFileInvoiceDollar, FaPlus
} from 'react-icons/fa';

/**
 * TransactionEntry Component
 * Based on the professional layout pattern from IPBilling.tsx
 * Implements a complete accounting voucher entry screen.
 */

// Icons typecast fix
const FaSaveIcon = FaSave as any;
const FaPrintIcon = FaPrint as any;
const FaSearchIcon = FaSearch as any;
const FaSyncIcon = FaSync as any;
const FaTrashIcon = FaTrash as any;
const FaListUlIcon = FaListUl as any;
const FaFileInvoiceIcon = FaFileInvoiceDollar as any;
const FaMoneyBillIcon = FaMoneyBillWave as any;
const FaMoneyCheckIcon = FaMoneyCheckAlt as any;
const FaSyncEditIcon = FaSync as any;
const FaPlusIcon = FaPlus as any;

interface LedgerEntry {
  headType: 'Dr' | 'Cr';
  accountHead: string;
  number: string;
  issueDate: string;
  closingBalance: number;
  balanceType: 'Dr' | 'Cr';
  amount: number;
}

interface TransactionType {
  id: string;
  label: string;
  icon: any;
  color: string;
  bgColor: string;
  description: string;
}

// Transaction types configuration with icons and colors
const transactionTypes: TransactionType[] = [
  { 
    id: 'RECEIPT', 
    label: 'Receipt', 
    icon: FaMoneyBillWave, 
    color: '#10b981', 
    bgColor: '#d1fae5',
    description: 'Money Received'
  },
  { 
    id: 'PAYMENT', 
    label: 'Payment', 
    icon: FaMoneyCheckAlt, 
    color: '#ef4444', 
    bgColor: '#fee2e2',
    description: 'Money Paid'
  },
  { 
    id: 'JOURNAL', 
    label: 'Journal', 
    icon: FaBook, 
    color: '#3b82f6', 
    bgColor: '#dbeafe',
    description: 'Book Entry'
  },
  { 
    id: 'CONTRA', 
    label: 'Contra', 
    icon: FaExchangeAlt, 
    color: '#8b5cf6', 
    bgColor: '#ede9fe',
    description: 'Fund Transfer'
  },
  { 
    id: 'OUTSIDE', 
    label: 'Outside Transaction', 
    icon: FaFileInvoiceDollar, 
    color: '#f59e0b', 
    bgColor: '#fef3c7',
    description: 'External Entry'
  },
];

const TransactionEntry: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'voucher' | 'edit'>('voucher');
  const [transactionType, setTransactionType] = useState('RECEIPT');
  const [voucherDate] = useState(new Date().toISOString().split('T')[0]);
  const [dob] = useState('06-01-2026');
  
  // Dynamic entries state
  const [entries, setEntries] = useState<LedgerEntry[]>([
    { headType: 'Cr', accountHead: '', number: '0', issueDate: 'dd-- -- -yyyy', closingBalance: 0, balanceType: 'Dr', amount: 0 },
  ]);

  // Sample data for the right reference table
  const [referenceLedgers] = useState([
    { id: 1, head: 'AXIS BANK 916020038327027', balance: 1336902.74 },
    { id: 2, head: 'AXIS BANK 924020070382663 LLP', balance: 17503922.74 },
    { id: 3, head: 'CANARA BANK 120032013488 LLP', balance: 1870913.00 },
    { id: 4, head: 'CANARA BANK 2320201000094', balance: 697412.20 },
    { id: 11, head: 'CASH', balance: 44514979.85 },
    { id: 12, head: 'ICICI BANK 152705001080 LLP', balance: 9459399.50 },
  ]);

  // Get default headType based on transaction type
  const getDefaultHeadType = (type: string): 'Dr' | 'Cr' => {
    switch (type) {
      case 'RECEIPT':
        return 'Cr'; // Credit first for receipts (income/receivable account)
      case 'PAYMENT':
        return 'Dr'; // Debit first for payments (expense/payable account)
      case 'JOURNAL':
        return 'Dr'; // Debit first for journals (common practice)
      case 'CONTRA':
        return 'Dr'; // Debit first for contra (receiving account)
      default:
        return 'Dr';
    }
  };

  // Update first entry's headType when transaction type changes
  useEffect(() => {
    if (entries.length > 0) {
      setEntries(prevEntries => 
        prevEntries.map((entry, index) => 
          index === 0 
            ? { ...entry, headType: getDefaultHeadType(transactionType) }
            : entry
        )
      );
    }
  }, [transactionType]);

  // Add new entry row
  const addEntryRow = () => {
    const newEntry: LedgerEntry = {
      headType: 'Dr',
      accountHead: '',
      number: '0',
      issueDate: 'dd-- -- -yyyy',
      closingBalance: 0,
      balanceType: 'Dr',
      amount: 0
    };
    setEntries(prev => [...prev, newEntry]);
  };

  // Remove entry row
  const removeEntryRow = (index: number) => {
    if (entries.length > 1) {
      setEntries(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Update entry
  const updateEntry = (index: number, field: keyof LedgerEntry, value: any) => {
    setEntries(prev => 
      prev.map((entry, i) => 
        i === index ? { ...entry, [field]: value } : entry
      )
    );
  };

  return (
    <div className="d-flex flex-column bg-white overflow-hidden shadow-sm rounded" style={{ height: 'calc(100vh - 120px)', border: '1px solid #e2e8f0' }}>
      
      {/* 1. TOP NAVIGATION / TAB SECTION */}
      <div className="d-flex p-2 border-bottom bg-light flex-shrink-0" style={{ minHeight: '48px' }}>
        <div className="bg-white p-1 border rounded d-flex gap-1 shadow-sm">
          <Button 
            variant={activeTab === 'voucher' ? 'primary' : 'white'} 
            size="sm" 
            className={`border-0 fw-bold px-4 py-1 d-flex align-items-center gap-2 ${activeTab === 'voucher' ? 'shadow-sm' : 'text-muted'}`}
            style={{ fontSize: 'var(--font-size-sm)' }}
            onClick={() => setActiveTab('voucher')}
          >
            <FaFileInvoiceIcon size={14} />
            VOUCHER
          </Button>
          <Button 
            variant={activeTab === 'edit' ? 'primary' : 'white'} 
            size="sm" 
            className={`border-0 fw-bold px-4 py-1 d-flex align-items-center gap-2 ${activeTab === 'edit' ? 'shadow-sm' : 'text-muted'}`}
            style={{ fontSize: 'var(--font-size-sm)' }}
            onClick={() => setActiveTab('edit')}
          >
            <FaSyncEditIcon size={14} />
            EDIT VOUCHER
          </Button>
        </div>
      </div>

      {/* 2. MAIN TRANSACTION FORM */}
      <div className="flex-grow-1 overflow-auto p-3 bg-white scrollbar-thin">
        
        {/* Transaction Type Selection - Left/Right Aligned Layout */}
        <div className="mb-3 p-2 bg-light rounded border" style={{ borderColor: '#e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '42px' }}>
          {/* Left side: Receipt, Payment, Journal, Contra */}
          <div className="d-flex gap-2 flex-wrap align-items-center">
            {transactionTypes
              .filter(type => type.id !== 'OUTSIDE')
              .map((type) => {
                const Icon = type.icon;
                const isActive = transactionType === type.id;
                
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setTransactionType(type.id)}
                    className="border-0 rounded d-flex align-items-center gap-1.5 transition-all"
                    style={{
                      cursor: 'pointer',
                      padding: '5px 12px',
                      height: '32px',
                      backgroundColor: isActive ? type.bgColor : '#f8f9fa',
                      border: isActive ? `1.5px solid ${type.color}` : '1.5px solid #cbd5e0',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = '#eff2f5';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = '#f8f9fa';
                    }}
                  >
                    <Icon 
                      size={13} 
                      style={{ 
                        color: isActive ? type.color : '#64748b',
                      }} 
                    />
                    <span style={{
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: isActive ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)',
                      color: isActive ? type.color : '#64748b',
                      whiteSpace: 'nowrap',
                    }}>
                      {type.label}
                    </span>
                  </button>
                );
              })}
          </div>

          {/* Right side: Outside Transaction */}
          {transactionTypes
            .filter(type => type.id === 'OUTSIDE')
            .map((type) => {
              const Icon = type.icon;
              const isActive = transactionType === type.id;
              
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setTransactionType(type.id)}
                  className="border-0 rounded d-flex align-items-center gap-1.5 transition-all"
                  style={{
                    cursor: 'pointer',
                    padding: '5px 12px',
                    height: '32px',
                    backgroundColor: isActive ? type.bgColor : '#f8f9fa',
                    border: isActive ? `1.5px solid ${type.color}` : '1.5px solid #cbd5e0',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = '#eff2f5';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }}
                >
                  <Icon 
                    size={13} 
                    style={{ 
                      color: isActive ? type.color : '#64748b',
                    }} 
                  />
                  <span style={{
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: isActive ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)',
                    color: isActive ? type.color : '#64748b',
                    whiteSpace: 'nowrap',
                  }}>
                    {type.label}
                  </span>
                </button>
              );
            })}
        </div>

        {/* Basic Information Row - Only visible for Outside Transaction */}
        {transactionType === 'OUTSIDE' && (
          <div className="mb-2 p-2.5 border rounded bg-light shadow-sm" style={{ animation: 'fadeIn 0.3s ease-in' }}>
            <Row className="g-2">
              <Col md={3}>
                <div className="form-group-input shadow-none">
                  <Form.Control size="sm" placeholder=" " style={{ height: '28px', fontSize: 'var(--font-size-md)' }} />
                  <Form.Label style={{ fontSize: 'var(--font-size-xs)', backgroundColor: '#f8f9fa' }}>NAME</Form.Label>
                </div>
              </Col>
              <Col md={3}>
                <div className="form-group-input shadow-none">
                  <Form.Select size="sm" style={{ height: '28px', fontSize: 'var(--font-size-md)' }}>
                    <option value="">Select</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="O">Other</option>
                  </Form.Select>
                  <Form.Label style={{ transform: 'translateY(-12px)', fontSize: 'var(--font-size-xs)', backgroundColor: '#f8f9fa' }}>GENDER</Form.Label>
                </div>
              </Col>
              <Col md={3}>
                <div className="form-group-input shadow-none">
                  <Form.Control size="sm" placeholder=" " style={{ height: '28px', fontSize: 'var(--font-size-md)' }} />
                  <Form.Label style={{ fontSize: 'var(--font-size-xs)', backgroundColor: '#f8f9fa' }}>DETAILS</Form.Label>
                </div>
              </Col>
              <Col md={3}>
                <div className="form-group-input shadow-none">
                  <Form.Control size="sm" type="date" style={{ height: '28px', fontSize: 'var(--font-size-md)' }} />
                  <Form.Label style={{ transform: 'translateY(-12px)', fontSize: 'var(--font-size-xs)', backgroundColor: '#f8f9fa' }}>DOB</Form.Label>
                </div>
              </Col>
            </Row>
          </div>
        )}

        {/* Main Entry Tables Section */}
        <Row className="g-3">
          {/* Left Table: Voucher Entries */}
          <Col md={8}>
            <div className="border rounded overflow-hidden shadow-sm" style={{ border: '1px solid #e2e8f0' }}>
              <div className="bg-primary text-white p-2 fw-bold d-flex justify-content-between align-items-center" style={{ fontSize: 'var(--font-size-sm)' }}>
                ENTRY DETAILS
                <Button 
                  variant="light" 
                  size="sm" 
                  onClick={addEntryRow}
                  className="d-flex align-items-center gap-1"
                  style={{ fontSize: 'var(--font-size-xs)', padding: '2px 8px' }}
                >
                  <FaPlusIcon size={10} />
                  Add Row
                </Button>
              </div>
              <Table size="sm" bordered className="mb-0">
                <thead className="bg-light text-center" style={{ fontSize: 'var(--font-size-xs)' }}>
                  <tr>
                    <th style={{ width: '80px' }}>Head Type</th>
                    <th>Account Head</th>
                    <th style={{ width: '80px' }}>Number</th>
                    <th style={{ width: '120px' }}>Issue date</th>
                    <th style={{ width: '120px' }}>Cl. Balance</th>
                    <th style={{ width: '100px' }}>Amount</th>
                    <th style={{ width: '50px' }}>Del</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, idx) => (
                    <tr key={idx} style={{ height: '32px' }}>
                      <td>
                        <Form.Select 
                          size="sm" 
                          className="border-0 bg-transparent text-center p-0 fw-bold" 
                          value={entry.headType}
                          onChange={(e) => updateEntry(idx, 'headType', e.target.value as 'Dr' | 'Cr')}
                          style={{ fontSize: 'var(--font-size-sm)' }}
                        >
                          <option>Dr</option>
                          <option>Cr</option>
                        </Form.Select>
                      </td>
                      <td>
                        <Form.Control 
                          size="sm" 
                          className="border-0 bg-transparent" 
                          value={entry.accountHead}
                          onChange={(e) => updateEntry(idx, 'accountHead', e.target.value)}
                          style={{ fontSize: 'var(--font-size-sm)' }} 
                        />
                      </td>
                      <td>
                        <Form.Control 
                          size="sm" 
                          className="border-0 bg-transparent text-center" 
                          type="text"
                          value={entry.number}
                          onChange={(e) => updateEntry(idx, 'number', e.target.value)}
                          style={{ fontSize: 'var(--font-size-sm)' }} 
                        />
                      </td>
                      <td>
                        <Form.Control 
                          size="sm" 
                          className="border-0 bg-transparent text-center" 
                          type="date"
                          value={entry.issueDate === 'dd-- -- -yyyy' ? '' : entry.issueDate}
                          onChange={(e) => updateEntry(idx, 'issueDate', e.target.value)}
                          style={{ fontSize: 'var(--font-size-sm)' }} 
                        />
                      </td>
                      <td className="text-end fw-bold">
                        <span className={entry.balanceType === 'Dr' ? 'text-danger' : 'text-primary'} style={{ fontSize: 'var(--font-size-xs)' }}>{entry.balanceType} </span>
                        <span style={{ fontSize: 'var(--font-size-xs)' }}>{entry.closingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </td>
                      <td>
                        <Form.Control 
                          size="sm" 
                          className="border-0 bg-transparent text-end fw-bold" 
                          type="number"
                          value={entry.amount}
                          onChange={(e) => updateEntry(idx, 'amount', parseFloat(e.target.value) || 0)}
                          style={{ fontSize: 'var(--font-size-sm)' }} 
                        />
                      </td>
                      <td className="text-center">
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="p-0 text-danger"
                          onClick={() => removeEntryRow(idx)}
                          disabled={entries.length === 1}
                        >
                          <FaTrashIcon size={11} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {[...Array(3)].map((_, i) => (
                    <tr key={`empty-${i}`} style={{ height: '32px' }}>
                      <td></td><td></td><td></td><td></td><td></td><td></td><td></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Col>

          {/* Right Table: Ledger Balances Reference */}
          <Col md={4}>
            <div className="border rounded overflow-hidden shadow-sm h-100">
              <div className="bg-secondary text-white p-2 fw-bold d-flex justify-content-between align-items-center" style={{ fontSize: 'var(--font-size-sm)' }}>
                QUICK REFERENCE (BALANCES)
                <FaListUlIcon size={12} />
              </div>
              <div style={{ maxHeight: '250px', overflowY: 'auto' }} className="scrollbar-thin border-0">
                <Table size="sm" hover className="mb-0 border-0">
                  <thead className="bg-light sticky-top" style={{ fontSize: 'var(--font-size-xs)' }}>
                    <tr className="border-bottom">
                      <th className="ps-2">Sl No</th>
                      <th>Ledger Head</th>
                      <th className="text-end pe-2">Closing Balance</th>
                    </tr>
                  </thead>
                  <tbody style={{ fontSize: 'var(--font-size-sm)' }}>
                    {referenceLedgers.map((ref, idx) => (
                      <tr key={idx} className="border-bottom">
                        <td className="text-center">{idx + 1}</td>
                        <td style={{ fontSize: 'var(--font-size-xs)' }}>{ref.head}</td>
                        <td className="text-end pe-2 fw-bold text-primary">{ref.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>
          </Col>
        </Row>

        {/* Footer Form Details Section */}
        <div className="mt-2 p-2.5 border rounded bg-light shadow-sm">
          <Row className="g-2 mb-2">
            <Col md={3}>
              <div className="form-group-input h-100">
                <Form.Select size="sm" style={{ height: '28px', fontSize: 'var(--font-size-md)' }}>
                  <option>Cash</option>
                  <option>Bank</option>
                </Form.Select>
                <Form.Label style={{ transform: 'translateY(-12px)', fontSize: 'var(--font-size-xs)', backgroundColor: '#f8f9fa' }}>PAYMENT TYPE</Form.Label>
              </div>
            </Col>
            <Col md={3}>
              <div className="form-group-input shadow-none">
                <Form.Control size="sm" type="text" defaultValue="06-01-2026" style={{ height: '28px', fontSize: 'var(--font-size-md)' }} />
                <Form.Label style={{ fontSize: 'var(--font-size-xs)', backgroundColor: '#f8f9fa' }}>VOUCHER DATE</Form.Label>
              </div>
            </Col>
            <Col md={6}>
              <div className="form-group-input shadow-none">
                <Form.Control size="sm" as="textarea" rows={1} placeholder=" " style={{ fontSize: 'var(--font-size-md)' }} />
                <Form.Label style={{ fontSize: 'var(--font-size-xs)', backgroundColor: '#f8f9fa' }}>NARRATION</Form.Label>
              </div>
            </Col>
          </Row>

          <Row className="g-2">
            <Col md={3}>
              <div className="form-group-input shadow-none">
                <Form.Control size="sm" placeholder=" " style={{ height: '28px', fontSize: 'var(--font-size-md)' }} />
                <Form.Label style={{ fontSize: 'var(--font-size-xs)', backgroundColor: '#f8f9fa' }}>PAYEE NUMBER</Form.Label>
              </div>
            </Col>
            <Col md={6}>
              <div className="form-group-input shadow-none">
                <Form.Control size="sm" placeholder=" " style={{ height: '28px', fontSize: 'var(--font-size-md)' }} />
                <Form.Label>PAYEE NAME</Form.Label>
              </div>
            </Col>
            <Col md={3}>
              <div className="form-group-input">
                <Form.Select size="sm" style={{ height: '28px', fontSize: 'var(--font-size-md)' }}>
                  <option>Stockist</option>
                  <option>Customer</option>
                  <option>Other</option>
                </Form.Select>
                <Form.Label style={{ transform: 'translateY(-12px)', fontSize: 'var(--font-size-xs)', backgroundColor: '#f8f9fa' }}>PAYEE TYPE</Form.Label>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* 3. BOTTOM ACTION BAR */}
      <div className="p-2 border-top bg-light flex-shrink-0" style={{ zIndex: 11 }}>
        <div className="d-flex justify-content-center gap-3">
          <Button variant="info" className="text-white px-4 fw-bold shadow-sm d-flex align-items-center gap-2" size="sm" style={{ backgroundColor: '#17a2b8' }}>
            <FaSaveIcon /> SAVE VOUCHER
          </Button>
          <Button variant="primary" className="px-5 fw-bold shadow-sm d-flex align-items-center gap-2" size="sm">
            <FaPrintIcon /> PRINT
          </Button>
          <Button variant="info" className="text-white px-4 fw-bold shadow-sm d-flex align-items-center gap-2" size="sm" style={{ backgroundColor: '#17a2b8' }}>
            <FaSearchIcon /> PAYEE SEARCH
          </Button>
          <Button variant="secondary" className="px-4 fw-bold shadow-sm d-flex align-items-center gap-2" size="sm">
            <FaSyncIcon /> REFRESH
          </Button>
        </div>
      </div>

      <style>{`
        .transaction-type-btn {
          outline: none;
        }
        .transaction-type-btn:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 6px 16px rgba(0,0,0,0.12) !important;
        }
        .transaction-type-btn:active {
          transform: translateY(0) !important;
        }
        
        .form-group-input { position: relative; }
        .form-group-input label {
          position: absolute;
          top: 3px;
          left: 10px;
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-semibold);
          color: #666;
          transition: all 0.2s ease-out;
          pointer-events: none;
        }
        .form-group-input input:not(:placeholder-shown) + label,
        .form-group-input input:focus + label {
          transform: translateY(-12px);
          font-size: var(--font-size-xs);
          background-color: white;
          padding: 0 4px;
        }
        .custom-radio .form-check-input:checked {
          background-color: #0d6efd;
          border-color: #0d6efd;
        }
        .scrollbar-thin::-webkit-scrollbar { width: 6px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: #f1f1f1; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #cbd5e0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default TransactionEntry;
