import React, { useState } from 'react';
import { Button, Card, Col, Form, Row, Spinner, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPills, faSearch, faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import PageHeader from '../../../components/PageHeader';
import { showValidationError } from '../../../utils/alertUtil';

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface SaleRecord {
  sNo: number;
  date: string;
  time: string;
  name: string;
  opNo: string;
  billNo: string;
  quantity: number;
}

// ─── Dummy Data ───────────────────────────────────────────────────────────────

const HEAD_OPTIONS = [
  'Paracetamol 500mg',
  'Amoxicillin 250mg',
  'Metformin 500mg',
  'Atorvastatin 40mg',
  'Omeprazole 20mg',
  'Ciprofloxacin 500mg',
  'Amlodipine 5mg',
];

const DUMMY_SALES: Record<string, SaleRecord[]> = {
  'Paracetamol 500mg': [
    { sNo: 1, date: '01/03/2026', time: '09:15 AM', name: 'MRS. MUTHU PEACHI', opNo: '321873', billNo: 'B-1001', quantity: 10 },
    { sNo: 2, date: '05/03/2026', time: '11:30 AM', name: 'K. KIRUTHANYA',     opNo: '514488', billNo: 'B-1025', quantity: 20 },
    { sNo: 3, date: '10/03/2026', time: '02:45 PM', name: 'RAVI SHANKAR',      opNo: '620011', billNo: 'B-1047', quantity: 15 },
    { sNo: 4, date: '12/03/2026', time: '10:00 AM', name: 'ANITHA DEVI',       opNo: '782345', billNo: 'B-1062', quantity: 30 },
    { sNo: 5, date: '15/03/2026', time: '03:20 PM', name: 'P. SURESH KUMAR',   opNo: '891234', billNo: 'B-1088', quantity: 10 },
  ],
  'Amoxicillin 250mg': [
    { sNo: 1, date: '02/03/2026', time: '10:00 AM', name: 'RAVI SHANKAR',    opNo: '620011', billNo: 'B-1002', quantity: 14 },
    { sNo: 2, date: '08/03/2026', time: '01:15 PM', name: 'ANITHA DEVI',     opNo: '782345', billNo: 'B-1033', quantity: 21 },
    { sNo: 3, date: '14/03/2026', time: '04:00 PM', name: 'K. KIRUTHANYA',   opNo: '514488', billNo: 'B-1071', quantity: 7 },
  ],
  'Metformin 500mg': [
    { sNo: 1, date: '03/03/2026', time: '08:30 AM', name: 'K. KIRUTHANYA',     opNo: '514488', billNo: 'B-1005', quantity: 60 },
    { sNo: 2, date: '09/03/2026', time: '12:00 PM', name: 'P. SURESH KUMAR',   opNo: '891234', billNo: 'B-1038', quantity: 30 },
    { sNo: 3, date: '18/03/2026', time: '09:45 AM', name: 'MRS. MUTHU PEACHI', opNo: '321873', billNo: 'B-1095', quantity: 60 },
    { sNo: 4, date: '20/03/2026', time: '02:10 PM', name: 'RAVI SHANKAR',      opNo: '620011', billNo: 'B-1102', quantity: 30 },
  ],
  'Atorvastatin 40mg': [
    { sNo: 1, date: '04/03/2026', time: '11:00 AM', name: 'K. KIRUTHANYA',   opNo: '514488', billNo: 'B-1010', quantity: 30 },
    { sNo: 2, date: '11/03/2026', time: '03:30 PM', name: 'ANITHA DEVI',     opNo: '782345', billNo: 'B-1051', quantity: 30 },
  ],
  'Omeprazole 20mg': [
    { sNo: 1, date: '06/03/2026', time: '09:00 AM', name: 'MRS. MUTHU PEACHI', opNo: '321873', billNo: 'B-1018', quantity: 14 },
    { sNo: 2, date: '13/03/2026', time: '10:45 AM', name: 'RAVI SHANKAR',      opNo: '620011', billNo: 'B-1065', quantity: 28 },
    { sNo: 3, date: '19/03/2026', time: '01:30 PM', name: 'P. SURESH KUMAR',   opNo: '891234', billNo: 'B-1098', quantity: 14 },
  ],
  'Ciprofloxacin 500mg': [
    { sNo: 1, date: '07/03/2026', time: '02:00 PM', name: 'ANITHA DEVI',   opNo: '782345', billNo: 'B-1021', quantity: 10 },
    { sNo: 2, date: '16/03/2026', time: '11:15 AM', name: 'K. KIRUTHANYA', opNo: '514488', billNo: 'B-1082', quantity: 6 },
  ],
  'Amlodipine 5mg': [
    { sNo: 1, date: '08/03/2026', time: '08:00 AM', name: 'RAVI SHANKAR',    opNo: '620011', billNo: 'B-1028', quantity: 30 },
    { sNo: 2, date: '17/03/2026', time: '12:30 PM', name: 'P. SURESH KUMAR', opNo: '891234', billNo: 'B-1090', quantity: 30 },
    { sNo: 3, date: '21/03/2026', time: '03:00 PM', name: 'ANITHA DEVI',     opNo: '782345', billNo: 'B-1109', quantity: 30 },
  ],
};

// ─── Component ────────────────────────────────────────────────────────────────

const MedicineWiseSales: React.FC = () => {
  const today = new Date().toISOString().split('T')[0];
  const [selectedHead, setSelectedHead] = useState('');
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [isLoading, setIsLoading] = useState(false);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [searched, setSearched] = useState(false);
  const [searchedHead, setSearchedHead] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHead) { showValidationError('Please select a Medicine Head.'); return; }
    if (!fromDate || !toDate) { showValidationError('Please select both From Date and To Date.'); return; }
    if (new Date(fromDate) > new Date(toDate)) { showValidationError('From Date cannot be later than To Date.'); return; }
    setIsLoading(true);
    setTimeout(() => {
      setSales(DUMMY_SALES[selectedHead] ?? []);
      setSearchedHead(selectedHead);
      setSearched(true);
      setIsLoading(false);
    }, 400);
  };

  const handleReset = () => {
    setSelectedHead('');
    setFromDate(today);
    setToDate(today);
    setSales([]);
    setSearched(false);
    setSearchedHead('');
  };

  const fmtDate = (d: string) => {
    try {
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return d;
      return `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}/${dt.getFullYear()}`;
    } catch { return d; }
  };

  const totalQty = sales.reduce((sum, r) => sum + r.quantity, 0);

  return (
    <div>
      <PageHeader
        icon={faPills}
        title="Medicine Wise Sales"
        subtitle="View sales records grouped by medicine"
      />

      <Card className="shadow-sm border-0">
        <Card.Body>

          {/* ── Filter Panel ── */}
          {!searched && !isLoading && (
            <div style={{
              background: 'var(--bs-light, #f8f9fa)',
              borderRadius: 'var(--border-radius-sm)',
              border: '1px solid var(--bs-border-color, #dee2e6)',
              padding: '16px 20px',
              marginBottom: '24px',
            }}>
              <Form onSubmit={handleSubmit}>
                <Row className="g-3 align-items-end">
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)' }}>
                        Select Head
                      </Form.Label>
                      <Form.Select
                        value={selectedHead}
                        onChange={e => setSelectedHead(e.target.value)}
                        style={{ fontSize: 'var(--font-size-base)' }}
                      >
                        <option value="">-- Select Medicine --</option>
                        {HEAD_OPTIONS.map(h => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)' }}>
                        From Date
                      </Form.Label>
                      <Form.Control
                        type="date"
                        value={fromDate}
                        onChange={e => setFromDate(e.target.value)}
                        style={{ fontSize: 'var(--font-size-base)' }}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)' }}>
                        To Date
                      </Form.Label>
                      <Form.Control
                        type="date"
                        value={toDate}
                        onChange={e => setToDate(e.target.value)}
                        style={{ fontSize: 'var(--font-size-base)' }}
                      />
                    </Form.Group>
                  </Col>
                  <Col md="auto">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      style={{
                        background: 'var(--btn-primary)', border: 'none',
                        fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)',
                        display: 'flex', alignItems: 'center', gap: '6px',
                      }}
                    >
                      {isLoading ? <Spinner animation="border" size="sm" /> : <FontAwesomeIcon icon={faSearch} />}
                      {isLoading ? 'Searching...' : 'Submit'}
                    </Button>
                  </Col>
                  <Col md="auto">
                    <Button
                      variant="outline-secondary"
                      type="button"
                      onClick={handleReset}
                      disabled={isLoading}
                      style={{ fontSize: 'var(--font-size-base)', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <FontAwesomeIcon icon={faSyncAlt} /> Reset
                    </Button>
                  </Col>
                </Row>
              </Form>
            </div>
          )}

          {/* ── Loading ── */}
          {isLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" style={{ color: 'var(--btn-primary)' }} />
              <div className="mt-2" style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-muted)' }}>
                Searching...
              </div>
            </div>

          /* ── Results ── */
          ) : searched ? (
            <>
              {/* New Search Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={handleReset}
                  style={{ fontSize: 'var(--font-size-sm)', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <FontAwesomeIcon icon={faSyncAlt} /> New Search
                </Button>
              </div>

              {/* Report Title */}
              <div style={{
                fontSize: 'var(--font-size-base)',
                fontWeight: 'var(--font-weight-bold)',
                marginBottom: '12px',
                textAlign: 'center',
                color: 'var(--bs-primary, #0d6efd)',
              }}>
                Medicine Wise Sales Report
              </div>

              {/* Summary Bar */}
              <div style={{
                background: 'var(--bs-light, #f8f9fa)',
                border: '1px solid var(--bs-border-color, #dee2e6)',
                borderRadius: 'var(--border-radius-sm)',
                padding: '10px 16px',
                marginBottom: '16px',
              }}>
                <Row className="g-2 align-items-center">
                  <Col md={5}>
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)' }}>Medicine : </span>
                    <span style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)' }}>{searchedHead}</span>
                  </Col>
                  <Col md={4}>
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)' }}>
                      Period : <strong>{fmtDate(fromDate)}</strong> — <strong>{fmtDate(toDate)}</strong>
                    </span>
                  </Col>
                  <Col md={3} className="text-md-end">
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)' }}>Total Records : </span>
                    <span style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)' }}>{sales.length}</span>
                  </Col>
                </Row>
              </div>

              {/* Table */}
              {sales.length === 0 ? (
                <div className="text-center py-4" style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-muted)' }}>
                  No sales records found for <strong>{searchedHead}</strong> in the selected date range.
                </div>
              ) : (
                <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                  <Table bordered size="sm" style={{ fontSize: 'var(--font-size-base)', marginBottom: 0 }}>
                    <thead style={{
                      position: 'sticky', top: 0, zIndex: 2,
                      background: 'var(--table-header-bg)',
                      color: 'var(--table-header-text)',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'var(--font-weight-semibold)',
                    }}>
                      <tr>
                        <th style={{ whiteSpace: 'nowrap', width: 60, textAlign: 'center' }}>S. No.</th>
                        <th style={{ whiteSpace: 'nowrap', width: 110 }}>Date</th>
                        <th style={{ whiteSpace: 'nowrap', width: 110 }}>Time</th>
                        <th>Name</th>
                        <th style={{ whiteSpace: 'nowrap', width: 110 }}>OP No</th>
                        <th style={{ whiteSpace: 'nowrap', width: 120 }}>Bill No</th>
                        <th style={{ whiteSpace: 'nowrap', width: 100, textAlign: 'right' }}>Quantity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sales.map(row => (
                        <tr key={row.sNo}>
                          <td style={{ textAlign: 'center' }}>{row.sNo}</td>
                          <td style={{ whiteSpace: 'nowrap' }}>{row.date}</td>
                          <td style={{ whiteSpace: 'nowrap' }}>{row.time}</td>
                          <td style={{ fontWeight: 'var(--font-weight-medium)' }}>{row.name}</td>
                          <td>{row.opNo}</td>
                          <td>{row.billNo}</td>
                          <td style={{ textAlign: 'right' }}>{row.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{
                        background: 'var(--table-header-bg)',
                        fontWeight: 'var(--font-weight-bold)',
                        fontSize: 'var(--font-size-sm)',
                      }}>
                        <td colSpan={6} style={{ textAlign: 'right' }}>Total Quantity</td>
                        <td style={{ textAlign: 'right' }}>{totalQty}</td>
                      </tr>
                    </tfoot>
                  </Table>
                </div>
              )}
            </>

          /* ── Initial Prompt ── */
          ) : (
            <div className="text-center py-5" style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-muted)' }}>
              Select a medicine head and date range, then click <strong>Submit</strong>.
            </div>
          )}

        </Card.Body>
      </Card>
    </div>
  );
};

export default MedicineWiseSales;