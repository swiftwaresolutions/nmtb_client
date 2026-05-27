import React, { useState } from 'react';
import { Button, Card, Col, Form, Modal, Row, Spinner, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileInvoiceDollar, faSearch, faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import PageHeader from '../../../components/PageHeader';
import { showValidationError } from '../../../utils/alertUtil';

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface BillDetailRow {
  sNo: number;
  medicineName: string;
  batch: string;
  expiryDate: string;
  mrp: number;
  discount: number;
  units: number;
  total: number;
}

interface BillSummary {
  subTotal: number;
  charityDiscount: number;
  payable: number;
  paid: number;
}

interface SaleRecord {
  sNo: number;
  billNo: string;
  opNumber: string;
  patientName: string;
  details: string;
  paid: number;
  billRows: BillDetailRow[];
  summary: BillSummary;
}

// ─── Dummy Data ──────────────────────────────────────────────────────────────

const DUMMY_SALES: SaleRecord[] = [
  {
    sNo: 1, billNo: 'PHG-48152', opNumber: 'OP-321873', patientName: 'MR. HARI RAGAVENDRAN',
    details: 'Cash', paid: 346.00,
    billRows: [
      { sNo: 1, medicineName: 'Sy.Aristozyme 200ml',   batch: 'DPK251497', expiryDate: '03/2027', mrp: 151.87, discount: 10, units: 1, total: 144.64 },
      { sNo: 2, medicineName: 'Darolac powder',         batch: 'MPJ253895', expiryDate: '02/2027', mrp: 16.87,  discount: 10, units: 6, total: 96.40 },
      { sNo: 3, medicineName: 'Sy.Chericof -100ml',     batch: 'SXG2269A',  expiryDate: '09/2027', mrp: 131.25, discount: 10, units: 1, total: 125.00 },
    ],
    summary: { subTotal: 383.00, charityDiscount: 37.00, payable: 346.00, paid: 346.00 },
  },
  {
    sNo: 2, billNo: 'PHG-48160', opNumber: 'OP-514488', patientName: 'MRS. MUTHU PEACHI',
    details: 'Cash', paid: 520.00,
    billRows: [
      { sNo: 1, medicineName: 'Metformin 500mg',        batch: 'MF102345',  expiryDate: '06/2027', mrp: 5.50,  discount: 5, units: 30, total: 156.75 },
      { sNo: 2, medicineName: 'Atorvastatin 40mg',      batch: 'AT204567',  expiryDate: '11/2027', mrp: 8.20,  discount: 5, units: 30, total: 233.70 },
      { sNo: 3, medicineName: 'Amlodipine 5mg',         batch: 'AM305678',  expiryDate: '08/2027', mrp: 4.80,  discount: 5, units: 30, total: 136.80 },
    ],
    summary: { subTotal: 547.00, charityDiscount: 27.00, payable: 520.00, paid: 520.00 },
  },
  {
    sNo: 3, billNo: 'PHG-48175', opNumber: 'OP-620011', patientName: 'RAVI SHANKAR',
    details: 'Card', paid: 890.50,
    billRows: [
      { sNo: 1, medicineName: 'Amoxicillin 250mg',      batch: 'AM406789',  expiryDate: '04/2027', mrp: 12.00, discount: 0, units: 21, total: 252.00 },
      { sNo: 2, medicineName: 'Pantoprazole 40mg',      batch: 'PT507890',  expiryDate: '12/2027', mrp: 9.50,  discount: 0, units: 30, total: 285.00 },
      { sNo: 3, medicineName: 'Cetirizine 10mg',        batch: 'CT608901',  expiryDate: '07/2027', mrp: 3.50,  discount: 0, units: 10, total: 35.00 },
      { sNo: 4, medicineName: 'Vitamin C 500mg',        batch: 'VC709012',  expiryDate: '01/2028', mrp: 6.50,  discount: 0, units: 50, total: 325.00 },
    ],
    summary: { subTotal: 897.00, charityDiscount: 6.50, payable: 890.50, paid: 890.50 },
  },
  {
    sNo: 4, billNo: 'PHG-48201', opNumber: 'OP-782345', patientName: 'ANITHA DEVI',
    details: 'Cash', paid: 210.00,
    billRows: [
      { sNo: 1, medicineName: 'Omeprazole 20mg',        batch: 'OM810123',  expiryDate: '05/2027', mrp: 7.00,  discount: 0, units: 14, total: 98.00 },
      { sNo: 2, medicineName: 'B-Complex Tablet',       batch: 'BC911234',  expiryDate: '10/2027', mrp: 4.00,  discount: 0, units: 30, total: 120.00 },
    ],
    summary: { subTotal: 218.00, charityDiscount: 8.00, payable: 210.00, paid: 210.00 },
  },
  {
    sNo: 5, billNo: 'PHG-48230', opNumber: 'OP-891234', patientName: 'P. SURESH KUMAR',
    details: 'UPI', paid: 675.00,
    billRows: [
      { sNo: 1, medicineName: 'Telmisartan 40mg',       batch: 'TM012345',  expiryDate: '03/2028', mrp: 9.00,  discount: 5, units: 30, total: 256.50 },
      { sNo: 2, medicineName: 'Metoprolol 25mg',        batch: 'MP113456',  expiryDate: '09/2027', mrp: 5.30,  discount: 5, units: 30, total: 151.05 },
      { sNo: 3, medicineName: 'Rosuvastatin 10mg',      batch: 'RS214567',  expiryDate: '02/2028', mrp: 11.00, discount: 5, units: 30, total: 313.50 },
    ],
    summary: { subTotal: 721.05, charityDiscount: 46.05, payable: 675.00, paid: 675.00 },
  },
];

const DUMMY_RETURNS: SaleRecord[] = [
  {
    sNo: 1, billNo: 'RET-10045', opNumber: 'OP-514488', patientName: 'MRS. MUTHU PEACHI',
    details: 'Cash Return', paid: 96.40,
    billRows: [
      { sNo: 1, medicineName: 'Darolac powder', batch: 'MPJ253895', expiryDate: '02/2027', mrp: 16.87, discount: 10, units: 6, total: 96.40 },
    ],
    summary: { subTotal: 96.40, charityDiscount: 0.00, payable: 96.40, paid: 96.40 },
  },
  {
    sNo: 2, billNo: 'RET-10051', opNumber: 'OP-620011', patientName: 'RAVI SHANKAR',
    details: 'Card Return', paid: 35.00,
    billRows: [
      { sNo: 1, medicineName: 'Cetirizine 10mg', batch: 'CT608901', expiryDate: '07/2027', mrp: 3.50, discount: 0, units: 10, total: 35.00 },
    ],
    summary: { subTotal: 35.00, charityDiscount: 0.00, payable: 35.00, paid: 35.00 },
  },
];

// ─── Component ──────────────────────────────────────────────────────────────

const SalesCollectionAmount: React.FC = () => {
  const today = new Date().toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [returns, setReturns] = useState<SaleRecord[]>([]);
  const [modalRecord, setModalRecord] = useState<SaleRecord | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromDate || !toDate) { showValidationError('Please select both From Date and To Date.'); return; }
    if (new Date(fromDate) > new Date(toDate)) { showValidationError('From Date cannot be later than To Date.'); return; }
    setIsLoading(true);
    setTimeout(() => {
      setSales(DUMMY_SALES);
      setReturns(DUMMY_RETURNS);
      setSearched(true);
      setIsLoading(false);
    }, 400);
  };

  const handleReset = () => {
    setFromDate(today); setToDate(today);
    setSales([]); setReturns([]);
    setSearched(false);
  };

  const fmt = (n: number) => n.toLocaleString('en-IN', { minimumFractionDigits: 2 });

  const totalSales   = sales.reduce((s, r) => s + r.paid, 0);
  const totalReturns = returns.reduce((s, r) => s + r.paid, 0);
  const finalTotal   = totalSales - totalReturns;

  const tableHeaderStyle: React.CSSProperties = {
    position: 'sticky', top: 0, zIndex: 2,
    background: 'var(--table-header-bg)',
    color: 'var(--table-header-text)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-semibold)',
  };

  const sectionTitle = (title: string) => (
    <div style={{
      fontSize: 'var(--font-size-base)',
      fontWeight: 'var(--font-weight-bold)',
      color: 'var(--bs-primary, #0d6efd)',
      marginBottom: '10px',
      paddingBottom: '6px',
      borderBottom: '2px solid var(--bs-primary, #0d6efd)',
    }}>
      {title}
    </div>
  );

  return (
    <div>
      <PageHeader
        icon={faFileInvoiceDollar}
        title="Sales Collection Amount"
        subtitle="View sales and return collection amounts by date range"
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
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)' }}>
                        Date From
                      </Form.Label>
                      <Form.Control
                        type="date" value={fromDate}
                        onChange={e => setFromDate(e.target.value)}
                        style={{ fontSize: 'var(--font-size-base)' }}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)' }}>
                        Date To
                      </Form.Label>
                      <Form.Control
                        type="date" value={toDate}
                        onChange={e => setToDate(e.target.value)}
                        style={{ fontSize: 'var(--font-size-base)' }}
                      />
                    </Form.Group>
                  </Col>
                  <Col md="auto">
                    <Button
                      type="submit" disabled={isLoading}
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
                      variant="outline-secondary" type="button"
                      onClick={handleReset} disabled={isLoading}
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
              <div className="mt-2" style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-muted)' }}>Searching...</div>
            </div>

          /* ── Results ── */
          ) : searched ? (
            <>
              {/* New Search */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                <Button
                  variant="outline-secondary" size="sm" onClick={handleReset}
                  style={{ fontSize: 'var(--font-size-sm)', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <FontAwesomeIcon icon={faSyncAlt} /> New Search
                </Button>
              </div>

              {/* ────────── Sales Amount ────────── */}
              {sectionTitle('Sales Amount')}
              <div style={{ overflowX: 'auto', marginBottom: '8px' }}>
                <Table bordered size="sm" style={{ fontSize: 'var(--font-size-base)', marginBottom: 0 }}>
                  <thead style={tableHeaderStyle}>
                    <tr>
                      <th style={{ width: 55, textAlign: 'center' }}>S. No.</th>
                      <th style={{ width: 130 }}>Bill/Receipt No</th>
                      <th style={{ width: 120 }}>O.P Number</th>
                      <th>Patient Name</th>
                      <th style={{ width: 100 }}>Details</th>
                      <th style={{ width: 120, textAlign: 'right' }}>Paid (Rs.)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map(row => (
                      <tr key={row.billNo}>
                        <td style={{ textAlign: 'center' }}>{row.sNo}</td>
                        <td>
                          <span
                            onClick={() => setModalRecord(row)}
                            style={{
                              color: 'var(--btn-primary)',
                              cursor: 'pointer',
                              textDecoration: 'underline',
                              fontWeight: 'var(--font-weight-medium)',
                            }}
                          >
                            {row.billNo}
                          </span>
                        </td>
                        <td>{row.opNumber}</td>
                        <td style={{ fontWeight: 'var(--font-weight-medium)' }}>{row.patientName}</td>
                        <td>{row.details}</td>
                        <td style={{ textAlign: 'right' }}>{fmt(row.paid)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: 'var(--table-header-bg)', fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-sm)' }}>
                      <td colSpan={5} style={{ textAlign: 'right' }}>Total :</td>
                      <td style={{ textAlign: 'right' }}>{fmt(totalSales)}</td>
                    </tr>
                  </tfoot>
                </Table>
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)', marginBottom: '28px' }}>
                Total Patients : <strong>{sales.length}</strong>
              </div>

              {/* ────────── Sales Return Amount ────────── */}
              {sectionTitle('Sales Return Amount')}
              <div style={{ overflowX: 'auto', marginBottom: '8px' }}>
                <Table bordered size="sm" style={{ fontSize: 'var(--font-size-base)', marginBottom: 0 }}>
                  <thead style={tableHeaderStyle}>
                    <tr>
                      <th style={{ width: 55, textAlign: 'center' }}>S. No.</th>
                      <th style={{ width: 130 }}>Bill/Receipt No</th>
                      <th style={{ width: 120 }}>O.P Number</th>
                      <th>Name</th>
                      <th style={{ width: 120 }}>Details</th>
                      <th style={{ width: 120, textAlign: 'right' }}>Paid (Rs.)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {returns.length === 0 ? (
                      <tr><td colSpan={6} className="text-center" style={{ color: 'var(--color-muted)' }}>No return records found.</td></tr>
                    ) : returns.map(row => (
                      <tr key={row.billNo}>
                        <td style={{ textAlign: 'center' }}>{row.sNo}</td>
                        <td>
                          <span
                            onClick={() => setModalRecord(row)}
                            style={{
                              color: 'var(--btn-primary)',
                              cursor: 'pointer',
                              textDecoration: 'underline',
                              fontWeight: 'var(--font-weight-medium)',
                            }}
                          >
                            {row.billNo}
                          </span>
                        </td>
                        <td>{row.opNumber}</td>
                        <td style={{ fontWeight: 'var(--font-weight-medium)' }}>{row.patientName}</td>
                        <td>{row.details}</td>
                        <td style={{ textAlign: 'right' }}>{fmt(row.paid)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: 'var(--table-header-bg)', fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-sm)' }}>
                      <td colSpan={5} style={{ textAlign: 'right' }}>Total :</td>
                      <td style={{ textAlign: 'right' }}>{fmt(totalReturns)}</td>
                    </tr>
                  </tfoot>
                </Table>
              </div>

              {/* Final Total */}
              <div style={{
                display: 'flex', justifyContent: 'flex-end',
                marginTop: '16px',
                paddingTop: '12px',
                borderTop: '2px solid var(--bs-border-color, #dee2e6)',
              }}>
                <span style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)' }}>
                  Final Total :  
                </span>
                <span style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--btn-primary)' }}>
                  {fmt(finalTotal)}
                </span>
              </div>
            </>

          /* ── Initial Prompt ── */
          ) : (
            <div className="text-center py-5" style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-muted)' }}>
              Select a date range and click <strong>Submit</strong> to view the sales collection.
            </div>
          )}

        </Card.Body>
      </Card>

      {/* ────────── Bill Detail Modal ────────── */}
      <Modal show={!!modalRecord} onHide={() => setModalRecord(null)} size="lg" centered>
        <Modal.Header closeButton style={{ background: 'var(--table-header-bg)', fontSize: 'var(--font-size-base)' }}>
          <Modal.Title style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)' }}>
            Bill Details — {modalRecord?.billNo}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ fontSize: 'var(--font-size-base)' }}>
          {modalRecord && (
            <>
              <Table bordered size="sm" style={{ fontSize: 'var(--font-size-base)', marginBottom: '16px' }}>
                <thead style={{
                  background: 'var(--table-header-bg)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-semibold)',
                }}>
                  <tr>
                    <th style={{ width: 45, textAlign: 'center' }}>S. No.</th>
                    <th>Medicine Name</th>
                    <th style={{ width: 100 }}>Batch</th>
                    <th style={{ width: 90 }}>Expiry Date</th>
                    <th style={{ width: 90, textAlign: 'right' }}>M.R.P</th>
                    <th style={{ width: 90, textAlign: 'center' }}>Discount (%)</th>
                    <th style={{ width: 60, textAlign: 'center' }}>Units</th>
                    <th style={{ width: 90, textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {modalRecord.billRows.map(r => (
                    <tr key={r.sNo}>
                      <td style={{ textAlign: 'center' }}>{r.sNo}</td>
                      <td>{r.medicineName}</td>
                      <td>{r.batch}</td>
                      <td>{r.expiryDate}</td>
                      <td style={{ textAlign: 'right' }}>{r.mrp.toFixed(2)}</td>
                      <td style={{ textAlign: 'center' }}>{r.discount}</td>
                      <td style={{ textAlign: 'center' }}>{r.units}</td>
                      <td style={{ textAlign: 'right' }}>{r.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {/* Summary */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <table style={{ fontSize: 'var(--font-size-base)', borderCollapse: 'collapse', minWidth: 300 }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '4px 16px 4px 0', color: 'var(--color-muted)' }}>Sub Total (Rs.)</td>
                      <td style={{ textAlign: 'right', fontWeight: 'var(--font-weight-medium)', padding: '4px 0' }}>
                        {fmt(modalRecord.summary.subTotal)}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '4px 16px 4px 0', color: 'var(--color-muted)' }}>Charity Discount (Rs.)</td>
                      <td style={{ textAlign: 'right', fontWeight: 'var(--font-weight-medium)', padding: '4px 0', color: 'var(--bs-danger, #dc3545)' }}>
                        {fmt(modalRecord.summary.charityDiscount)}
                      </td>
                    </tr>
                    <tr style={{ borderTop: '1px solid var(--bs-border-color, #dee2e6)' }}>
                      <td style={{ padding: '6px 16px 4px 0', fontWeight: 'var(--font-weight-semibold)' }}>Payable (Rs.)</td>
                      <td style={{ textAlign: 'right', fontWeight: 'var(--font-weight-bold)', padding: '6px 0 4px 0' }}>
                        {fmt(modalRecord.summary.payable)}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '4px 16px 4px 0', fontWeight: 'var(--font-weight-semibold)' }}>Paid (Rs.)</td>
                      <td style={{ textAlign: 'right', fontWeight: 'var(--font-weight-bold)', padding: '4px 0', color: 'var(--btn-primary)' }}>
                        {fmt(modalRecord.summary.paid)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary" size="sm"
            onClick={() => setModalRecord(null)}
            style={{ fontSize: 'var(--font-size-sm)' }}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SalesCollectionAmount;