import React, { useState } from 'react';
import { Button, Card, Col, Form, Modal, Row, Spinner, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar, faSearch, faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import PageHeader from '../../../components/PageHeader';
import { showValidationError } from '../../../utils/alertUtil';

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface BillDetailRow {
  sNo: number;
  batchNo: string;
  units: number;
  mrp: number;
  totalAmount: number;
  discountAmount: number;
}

interface BillSummary {
  total: number;
  discount: number;
  payable: number;
  paid: number;
  balance: number;
}

interface SalesRecord {
  sNo: number;
  opNo: string;
  patientName: string;
  regType: 'New' | 'Repeat';
  age: string;
  sex: string;
  isPharmacyBill: boolean;
  doctor: string;
  billNo: string;
  billRows: BillDetailRow[];
  summary: BillSummary;
}

// ─── Dummy Data ───────────────────────────────────────────────────────────────

const DUMMY_RECORDS: SalesRecord[] = [
  {
    sNo: 1, opNo: '570100', patientName: 'MRS. NAGA DEVI', regType: 'New',
    age: '22.12 Years', sex: 'Female', isPharmacyBill: true,
    doctor: 'Dr. Karthikeyan S. MBBS., MD(Gen)', billNo: 'PHG-59164',
    billRows: [
      { sNo: 1,  batchNo: 'ZVT25243',  units: 3, mrp: 7.18,   totalAmount: 20.51,  discountAmount: 2.05 },
      { sNo: 2,  batchNo: 'GTG2571A',  units: 6, mrp: 16.81,  totalAmount: 96.06,  discountAmount: 9.61 },
      { sNo: 3,  batchNo: 'DOBS4238',  units: 6, mrp: 2.14,   totalAmount: 12.23,  discountAmount: 1.22 },
      { sNo: 4,  batchNo: '035F156',   units: 1, mrp: 23.05,  totalAmount: 21.95,  discountAmount: 2.20 },
      { sNo: 5,  batchNo: 'NPB00239',  units: 1, mrp: 53.89,  totalAmount: 51.32,  discountAmount: 5.13 },
      { sNo: 6,  batchNo: 'GA25L39C',  units: 1, mrp: 12.72,  totalAmount: 12.11,  discountAmount: 1.21 },
      { sNo: 7,  batchNo: 'TAB4F14',   units: 1, mrp: 16.73,  totalAmount: 15.93,  discountAmount: 1.59 },
      { sNo: 8,  batchNo: '5297427',   units: 2, mrp: 20.50,  totalAmount: 39.05,  discountAmount: 3.90 },
      { sNo: 9,  batchNo: '5259124',   units: 1, mrp: 12.00,  totalAmount: 11.43,  discountAmount: 1.14 },
      { sNo: 10, batchNo: '8367',      units: 2, mrp: 15.19,  totalAmount: 28.93,  discountAmount: 2.89 },
    ],
    summary: { total: 323.00, discount: 33.00, payable: 290.00, paid: 290.00, balance: 0.00 },
  },
  {
    sNo: 2, opNo: '527581', patientName: 'MR. BALAMURUGAN', regType: 'Repeat',
    age: '47.92 Years', sex: 'Male', isPharmacyBill: false,
    doctor: 'SELF', billNo: '',
    billRows: [],
    summary: { total: 0, discount: 0, payable: 0, paid: 0, balance: 0 },
  },
  {
    sNo: 3, opNo: '612345', patientName: 'MRS. MUTHU PEACHI', regType: 'New',
    age: '32.08 Years', sex: 'Female', isPharmacyBill: true,
    doctor: 'Dr. Ramesh Kumar MBBS., MS(Ortho)', billNo: 'PHG-59170',
    billRows: [
      { sNo: 1, batchNo: 'MF102345', units: 30, mrp: 5.50,  totalAmount: 156.75, discountAmount: 15.68 },
      { sNo: 2, batchNo: 'AT204567', units: 30, mrp: 8.20,  totalAmount: 233.70, discountAmount: 23.37 },
      { sNo: 3, batchNo: 'AM305678', units: 30, mrp: 4.80,  totalAmount: 136.80, discountAmount: 13.68 },
    ],
    summary: { total: 527.25, discount: 52.73, payable: 474.52, paid: 474.52, balance: 0.00 },
  },
  {
    sNo: 4, opNo: '489012', patientName: 'MR. RAVI SHANKAR', regType: 'Repeat',
    age: '55.04 Years', sex: 'Male', isPharmacyBill: true,
    doctor: 'Dr. Priya Nair MBBS., DGO', billNo: 'PHG-59182',
    billRows: [
      { sNo: 1, batchNo: 'CP4123456', units: 14, mrp: 12.00, totalAmount: 158.00, discountAmount: 15.80 },
      { sNo: 2, batchNo: 'DZ5098321', units: 10, mrp: 9.50,  totalAmount: 90.25,  discountAmount: 9.03 },
    ],
    summary: { total: 248.25, discount: 24.83, payable: 223.42, paid: 223.42, balance: 0.00 },
  },
  {
    sNo: 5, opNo: '734561', patientName: 'ANITHA DEVI', regType: 'New',
    age: '28.06 Years', sex: 'Female', isPharmacyBill: true,
    doctor: 'Dr. Suresh Babu MBBS., MD', billNo: 'PHG-59195',
    billRows: [
      { sNo: 1, batchNo: 'OM810123', units: 14, mrp: 7.00, totalAmount: 92.40,  discountAmount: 9.24 },
      { sNo: 2, batchNo: 'BC911234', units: 30, mrp: 4.00, totalAmount: 114.00, discountAmount: 11.40 },
      { sNo: 3, batchNo: 'VC709012', units: 30, mrp: 6.50, totalAmount: 185.25, discountAmount: 18.53 },
    ],
    summary: { total: 391.65, discount: 39.17, payable: 352.48, paid: 352.48, balance: 0.00 },
  },
  {
    sNo: 6, opNo: '801234', patientName: 'P. SURESH KUMAR', regType: 'Repeat',
    age: '61.03 Years', sex: 'Male', isPharmacyBill: false,
    doctor: 'SELF', billNo: '',
    billRows: [],
    summary: { total: 0, discount: 0, payable: 0, paid: 0, balance: 0 },
  },
  {
    sNo: 7, opNo: '923450', patientName: 'K. KIRUTHANYA', regType: 'New',
    age: '24.10 Years', sex: 'Female', isPharmacyBill: true,
    doctor: 'Dr. Vijay Kumar MBBS., DCH', billNo: 'PHG-59201',
    billRows: [
      { sNo: 1, batchNo: 'AM406789', units: 21, mrp: 12.00, totalAmount: 239.40, discountAmount: 23.94 },
      { sNo: 2, batchNo: 'PT507890', units: 14, mrp: 9.50,  totalAmount: 126.35, discountAmount: 12.64 },
    ],
    summary: { total: 365.75, discount: 36.58, payable: 329.17, paid: 329.17, balance: 0.00 },
  },
  {
    sNo: 8, opNo: '456789', patientName: 'T. MANIKANDAN', regType: 'Repeat',
    age: '38.07 Years', sex: 'Male', isPharmacyBill: true,
    doctor: 'Dr. Anand Krishnan MBBS., MD(Cardio)', billNo: 'PHG-59210',
    billRows: [
      { sNo: 1, batchNo: 'TM012345', units: 30, mrp: 9.00,  totalAmount: 256.50, discountAmount: 25.65 },
      { sNo: 2, batchNo: 'MP113456', units: 30, mrp: 5.30,  totalAmount: 151.05, discountAmount: 15.11 },
    ],
    summary: { total: 407.55, discount: 40.76, payable: 366.79, paid: 366.79, balance: 0.00 },
  },
  {
    sNo: 9, opNo: '312890', patientName: 'LAKSHMI NARAYANAN', regType: 'New',
    age: '44.02 Years', sex: 'Female', isPharmacyBill: false,
    doctor: 'SELF', billNo: '',
    billRows: [],
    summary: { total: 0, discount: 0, payable: 0, paid: 0, balance: 0 },
  },
  {
    sNo: 10, opNo: '678901', patientName: 'R. BALAJI', regType: 'Repeat',
    age: '52.11 Years', sex: 'Male', isPharmacyBill: true,
    doctor: 'Dr. Meena Devi MBBS., DM(Neuro)', billNo: 'PHG-59225',
    billRows: [
      { sNo: 1, batchNo: 'RS214567', units: 30, mrp: 11.00, totalAmount: 313.50, discountAmount: 31.35 },
      { sNo: 2, batchNo: 'NT1067845', units: 30, mrp: 8.40, totalAmount: 226.80, discountAmount: 22.68 },
    ],
    summary: { total: 540.30, discount: 54.03, payable: 486.27, paid: 486.27, balance: 0.00 },
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

const SalesStatus: React.FC = () => {
  const today = new Date().toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [records, setRecords] = useState<SalesRecord[]>([]);
  const [modalRecord, setModalRecord] = useState<SalesRecord | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromDate || !toDate) { showValidationError('Please select both From Date and To Date.'); return; }
    if (new Date(fromDate) > new Date(toDate)) { showValidationError('From Date cannot be later than To Date.'); return; }
    setIsLoading(true);
    setTimeout(() => {
      setRecords(DUMMY_RECORDS);
      setSearched(true);
      setIsLoading(false);
    }, 400);
  };

  const handleReset = () => {
    setFromDate(today); setToDate(today);
    setRecords([]); setSearched(false);
  };

  const fmt = (n: number) => n.toFixed(2);

  return (
    <div>
      <PageHeader
        icon={faChartBar}
        title="Sales Status"
        subtitle="View patient-wise pharmacy sales status by date range"
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
                        From Date
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
                        To Date
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
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
                <Button
                  variant="outline-secondary" size="sm" onClick={handleReset}
                  style={{ fontSize: 'var(--font-size-sm)', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <FontAwesomeIcon icon={faSyncAlt} /> New Search
                </Button>
              </div>

              <div style={{ overflowX: 'auto', maxHeight: '65vh', overflowY: 'auto' }}>
                <Table bordered size="sm" style={{ fontSize: 'var(--font-size-base)', marginBottom: 0, minWidth: 900 }}>
                  <thead style={{
                    position: 'sticky', top: 0, zIndex: 2,
                    background: 'var(--table-header-bg)',
                    color: 'var(--table-header-text)',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-weight-semibold)',
                  }}>
                    <tr>
                      <th style={{ width: 50,  textAlign: 'center' }}>S. No.</th>
                      <th style={{ width: 90  }}>O. P. No</th>
                      <th style={{ minWidth: 180 }}>Patient Name</th>
                      <th style={{ width: 80  }}>Reg. Type</th>
                      <th style={{ width: 110 }}>Age</th>
                      <th style={{ width: 70  }}>Sex</th>
                      <th style={{ width: 110 }}>Is Pharmacy Bill</th>
                      <th style={{ minWidth: 200 }}>Doctor</th>
                      <th style={{ width: 120 }}>Bill No.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map(row => (
                      <tr key={row.sNo}>
                        <td style={{ textAlign: 'center' }}>{row.sNo}</td>
                        <td>{row.opNo}</td>
                        <td style={{ fontWeight: 'var(--font-weight-medium)' }}>{row.patientName}</td>
                        <td>
                          <span style={{
                            fontSize: 'var(--font-size-xs)',
                            fontWeight: 'var(--font-weight-semibold)',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            background: row.regType === 'New' ? '#d1fae5' : '#dbeafe',
                            color:      row.regType === 'New' ? '#065f46' : '#1e40af',
                          }}>
                            {row.regType}
                          </span>
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>{row.age}</td>
                        <td>{row.sex}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{
                            fontSize: 'var(--font-size-xs)',
                            fontWeight: 'var(--font-weight-semibold)',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            background: row.isPharmacyBill ? '#d1fae5' : '#fee2e2',
                            color:      row.isPharmacyBill ? '#065f46' : '#991b1b',
                          }}>
                            {row.isPharmacyBill ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td style={{ fontSize: 'var(--font-size-sm)' }}>{row.doctor}</td>
                        <td>
                          {row.billNo ? (
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
                          ) : (
                            <span style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-sm)' }}>&mdash;</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </>

          /* ── Initial Prompt ── */
          ) : (
            <div className="text-center py-5" style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-muted)' }}>
              Select a date range and click <strong>Submit</strong> to view the sales status.
            </div>
          )}

        </Card.Body>
      </Card>

      {/* ── Bill Detail Modal ── */}
      <Modal show={!!modalRecord} onHide={() => setModalRecord(null)} size="lg" centered scrollable>
        <Modal.Header closeButton style={{ background: 'var(--table-header-bg)', fontSize: 'var(--font-size-base)' }}>
          <Modal.Title style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)' }}>
            Bill Details &mdash; {modalRecord?.billNo}
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
                    <th style={{ width: 50, textAlign: 'center' }}>S. No.</th>
                    <th style={{ width: 120 }}>Batch No.</th>
                    <th style={{ width: 60, textAlign: 'center' }}>Units</th>
                    <th style={{ width: 90, textAlign: 'right' }}>M. R. P.</th>
                    <th style={{ width: 120, textAlign: 'right' }}>Total Amount</th>
                    <th style={{ width: 130, textAlign: 'right' }}>Discount Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {modalRecord.billRows.map(r => (
                    <tr key={r.sNo}>
                      <td style={{ textAlign: 'center' }}>{r.sNo}</td>
                      <td>{r.batchNo}</td>
                      <td style={{ textAlign: 'center' }}>{r.units}</td>
                      <td style={{ textAlign: 'right' }}>{fmt(r.mrp)}</td>
                      <td style={{ textAlign: 'right' }}>{fmt(r.totalAmount)}</td>
                      <td style={{ textAlign: 'right' }}>{fmt(r.discountAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {/* Summary */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <table style={{ fontSize: 'var(--font-size-base)', borderCollapse: 'collapse', minWidth: 280 }}>
                  <tbody>
                    {[
                      { label: 'Total:',    value: fmt(modalRecord.summary.total),    bold: false },
                      { label: 'Discount:', value: fmt(modalRecord.summary.discount),  bold: false },
                      { label: 'Payable:',  value: fmt(modalRecord.summary.payable),   bold: true  },
                      { label: 'Paid:',     value: fmt(modalRecord.summary.paid),      bold: true  },
                      { label: 'Balance:',  value: fmt(modalRecord.summary.balance),   bold: false },
                    ].map(({ label, value, bold }) => (
                      <tr key={label} style={bold ? { borderTop: '1px solid var(--bs-border-color, #dee2e6)' } : {}}>
                        <td style={{ padding: '4px 20px 4px 0', color: 'var(--color-muted)' }}>{label}</td>
                        <td style={{
                          textAlign: 'right', padding: '4px 0',
                          fontWeight: bold ? 'var(--font-weight-bold)' : 'var(--font-weight-normal)',
                          color: label === 'Paid:' ? 'var(--btn-primary)' : undefined,
                        }}>
                          {value}
                        </td>
                      </tr>
                    ))}
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

export default SalesStatus;