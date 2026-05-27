import React, { useState } from 'react';
import { Container, Card, Row, Col, Form, Button, Table, Modal, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faCheckCircle, faSyncAlt, faExclamationTriangle, faUser, faFileInvoiceDollar, faPrint } from '@fortawesome/free-solid-svg-icons';
import PageHeader from '../../../components/PageHeader';
import { useTableSearch } from '../../../hooks/useTableSearch';
import SearchInput from '../../../components/SearchInput';
import { showValidationError, showSuccessToast } from '../../../utils/alertUtil';

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface BillRow {
  id: number;
  billNo: string;
  date: string;
  patientName: string;
  details: string;
  total: number;
  discount: number;
  paid: number;
  user: string;
  opNo: string;
}

interface MedicineItem {
  id: number;
  medicineName: string;
  batch: string;
  expiryDate: string;
  mrp: number;
  discountPercent: number;
  units: number;
  total: number;
}

interface BillDetail {
  billNo: string;
  opNo: string;
  patientName: string;
  details: string;
  medicines: MedicineItem[];
  subTotal: number;
  discount: number;
  payable: number;
  paid: number;
}

// ─── Dummy Data ───────────────────────────────────────────────────────────────

const DUMMY_BILLS: Record<string, BillRow[]> = {
  '560069': [
    {
      id: 1,
      billNo: 'PHG-30777',
      date: '2025-10-27',
      patientName: 'MRS.M.SYED OLI FATHIMA',
      details: 'Age :21 Years    Sex :F',
      total: 3499.0,
      discount: 335.0,
      paid: 3164.0,
      user: 'Entry By -- priyanga',
      opNo: '560069',
    },
  ],
};

const DUMMY_BILL_DETAILS: Record<string, BillDetail> = {
  'PHG-30777': {
    billNo: 'PHG-30777',
    opNo: '560069',
    patientName: 'MRS.M.SYED OLI FATHIMA',
    details: 'Age :21 Years    Sex :F',
    medicines: [
      { id: 1, medicineName: 'T.Faa 20', batch: 'FAA25028', expiryDate: '06/2027', mrp: 20.92, discountPercent: 10.0, units: 30.0, total: 597.71 },
      { id: 2, medicineName: 'T.Cieocal', batch: 'CTC-25002', expiryDate: '06/2027', mrp: 9.02, discountPercent: 10.0, units: 29.0, total: 249.12 },
      { id: 3, medicineName: 'T.Ecosprin 75', batch: '4011406', expiryDate: '04/2027', mrp: 0.38, discountPercent: 10.0, units: 30.0, total: 10.86 },
      { id: 4, medicineName: 'T.Gravidol', batch: 'DT25558A', expiryDate: '08/2027', mrp: 13.0, discountPercent: 10.0, units: 60.0, total: 742.86 },
      { id: 5, medicineName: 'Argipreg Sachet -6.5gm', batch: 'A1AJY059', expiryDate: '04/2027', mrp: 60.84, discountPercent: 10.0, units: 25.0, total: 1448.57 },
      { id: 6, medicineName: 'T.Cieocal', batch: 'CTC-25001', expiryDate: '12/2026', mrp: 10.0, discountPercent: 10.0, units: 1.0, total: 9.52 },
      { id: 7, medicineName: 'Argipreg Sachet -6.5gm', batch: 'A1AJY059', expiryDate: '04/2027', mrp: 60.84, discountPercent: 10.0, units: 5.0, total: 289.71 },
    ],
    subTotal: 3499.0,
    discount: 335.0,
    payable: 3164.0,
    paid: 3164.0,
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

function PhDuplicateBill() {
  const [opNo, setOpNo] = useState('');
  const [bills, setBills] = useState<BillRow[]>([]);
  const [searched, setSearched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBill, setSelectedBill] = useState<BillDetail | null>(null);

  const { filteredData, searchTerm, setSearchTerm, resultCount, totalCount } = useTableSearch({
    data: bills,
    searchFields: ['billNo', 'patientName', 'details', 'user'],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!opNo.trim()) {
      showValidationError('Please enter an OP No to search.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      const result = DUMMY_BILLS[opNo.trim()];
      setBills(result ?? []);
      setSearched(true);
      setIsSubmitting(false);
      if (result && result.length > 0) {
        showSuccessToast(`Found ${result.length} bill(s) for OP No: ${opNo.trim()}`);
      }
    }, 300);
  };

  const handleReset = () => {
    setOpNo('');
    setBills([]);
    setSearched(false);
    setIsSubmitting(false);
    setSearchTerm('');
  };

  const handleBillClick = (billNo: string) => {
    const detail = DUMMY_BILL_DETAILS[billNo];
    if (detail) setSelectedBill(detail);
  };

  return (
    <Container fluid className="py-3">
      <PageHeader
        icon={faCopy}
        title="Duplicate Bill"
        subtitle="Pharmacy Store — Reprint billed receipts by OP No"
      />

      {/* ── Search Card ─────────────────────────────────────────────── */}
      <Card className="neat-card mb-3">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="align-items-end g-3">
              <Col md={3} sm={8}>
                <Form.Group>
                  <Form.Label htmlFor="dupBillOpNo" className="mb-1 text-muted small">OP No</Form.Label>
                  <Form.Control
                    id="dupBillOpNo"
                    type="text"
                    size="lg"
                    placeholder="Enter OP No"
                    value={opNo}
                    onChange={(e) => setOpNo(e.target.value)}
                    autoComplete="off"
                  />
                </Form.Group>
              </Col>
              <Col md="auto">
                <Button type="submit" className="theme-btn-primary" disabled={isSubmitting}>
                  <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>
              </Col>
              <Col md="auto">
                <Button type="button" className="theme-outline-btn-secondary" onClick={handleReset}>
                  <FontAwesomeIcon icon={faSyncAlt} className="me-2" />
                  Reset
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* ── Results ─────────────────────────────────────────────────── */}
      {searched && (
        bills.length > 0 ? (
          <>
            {/* Patient summary bar */}
            <Card className="neat-card mb-3">
              <Card.Body className="py-2 px-3">
                <Row className="align-items-center g-2">
                  <Col md="auto">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{ width: 40, height: 40, background: 'var(--color-primary-light, #e8f0fe)', color: 'var(--color-primary)' }}
                    >
                      <FontAwesomeIcon icon={faUser} />
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="text-muted small text-uppercase" style={{ fontSize: 'var(--font-size-xs)' }}>Patient Name</div>
                    <div className="fw-semibold">{bills[0].patientName}</div>
                  </Col>
                  <Col md={2}>
                    <div className="text-muted small text-uppercase" style={{ fontSize: 'var(--font-size-xs)' }}>OP No</div>
                    <div className="fw-semibold">{bills[0].opNo}</div>
                  </Col>
                  <Col md={3}>
                    <div className="text-muted small text-uppercase" style={{ fontSize: 'var(--font-size-xs)' }}>Details</div>
                    <div className="fw-semibold">{bills[0].details}</div>
                  </Col>
                  <Col md="auto" className="ms-auto">
                    <Badge bg="success" className="px-3 py-2" style={{ fontSize: 'var(--font-size-sm)' }}>
                      {bills.length} Bill{bills.length > 1 ? 's' : ''} Found
                    </Badge>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Bills table */}
            <Card className="neat-card p-0">
              <Card.Header className="bg-white border-bottom px-3 py-3">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <div className="d-flex align-items-center gap-2">
                    <FontAwesomeIcon icon={faFileInvoiceDollar} style={{ color: 'var(--color-primary)' }} />
                    <span className="fw-semibold" style={{ color: 'var(--color-primary)' }}>
                      Bill Records
                    </span>
                  </div>
                  <SearchInput
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    placeholder="Search by bill no, patient, user..."
                    resultCount={resultCount}
                    totalCount={totalCount}
                  />
                </div>
              </Card.Header>
              <div className="table-responsive">
                <Table className="mb-0" hover>
                  <thead className="bg-light text-muted text-uppercase small">
                    <tr>
                      <th className="px-3" style={{ width: 50 }}>#</th>
                      <th>Bill / Receipt No</th>
                      <th>Date</th>
                      <th>Patient Name</th>
                      <th>Details</th>
                      <th className="text-end">Total (Rs.)</th>
                      <th className="text-end">Discount (Rs.)</th>
                      <th className="text-end">Paid (Rs.)</th>
                      <th>User</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((row, idx) => (
                      <tr key={row.id}>
                        <td className="px-3 text-muted">{idx + 1}</td>
                        <td>
                          <Button
                            variant="link"
                            className="p-0 fw-semibold"
                            style={{ color: 'var(--color-primary)', textDecoration: 'underline', fontSize: 'var(--font-size-sm)' }}
                            onClick={() => handleBillClick(row.billNo)}
                          >
                            {row.billNo}
                          </Button>
                        </td>
                        <td style={{ fontSize: 'var(--font-size-sm)' }}>{row.date}</td>
                        <td className="fw-medium" style={{ fontSize: 'var(--font-size-sm)' }}>{row.patientName}</td>
                        <td className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>{row.details}</td>
                        <td className="text-end fw-semibold" style={{ color: 'var(--color-primary)' }}>{row.total.toFixed(1)}</td>
                        <td className="text-end text-danger">{row.discount.toFixed(1)}</td>
                        <td className="text-end fw-semibold" style={{ color: 'var(--color-success)' }}>{row.paid.toFixed(1)}</td>
                        <td className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>{row.user}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card>
          </>
        ) : (
          <Card className="neat-card">
            <Card.Body className="text-center py-5 text-muted">
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                size="2x"
                className="mb-3 d-block mx-auto"
                style={{ color: 'var(--color-warning)' }}
              />
              <p className="mb-1 fw-semibold">No bills found</p>
              <p className="mb-0 small">No records found for OP No: <strong>{opNo}</strong></p>
            </Card.Body>
          </Card>
        )
      )}

      {/* ── Bill Receipt Modal ───────────────────────────────────────── */}
      <Modal show={!!selectedBill} onHide={() => setSelectedBill(null)} size="lg" centered>
        <Modal.Header closeButton className="border-bottom">
          <Modal.Title style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)' }}>
            <FontAwesomeIcon icon={faFileInvoiceDollar} className="me-2" style={{ color: 'var(--color-primary)' }} />
            Bill / Receipt
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedBill && (
            <>
              {/* Hospital Header */}
              <div className="text-center mb-4">
                <div className="fw-bold" style={{ fontSize: 'var(--font-size-xl)', letterSpacing: 1 }}>
                  LENORD HOSPITAL,
                </div>
                <div className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>BATLAGUNDU.</div>
              </div>

              {/* Bill meta info */}
              <Card className="neat-card mb-3" style={{ background: 'var(--bg-soft, #f8f9fa)' }}>
                <Card.Body className="py-2 px-3">
                  <Row className="g-2">
                    <Col md={6}>
                      <span className="text-muted small">Bill No :</span>{' '}
                      <Badge bg="primary" style={{ fontSize: 'var(--font-size-sm)' }}>{selectedBill.billNo}</Badge>
                    </Col>
                    <Col md={6}>
                      <span className="text-muted small">O. P No :</span>{' '}
                      <strong>{selectedBill.opNo}</strong>
                    </Col>
                    <Col md={6}>
                      <span className="text-muted small">Patient Name :</span>{' '}
                      <strong>{selectedBill.patientName}</strong>
                    </Col>
                    <Col md={6}>
                      <span className="text-muted small">Details :</span>{' '}
                      {selectedBill.details}
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Medicines Table */}
              <div className="table-responsive mb-3">
                <Table bordered size="sm" className="mb-0">
                  <thead className="bg-light text-muted text-uppercase" style={{ fontSize: 'var(--font-size-xs)' }}>
                    <tr>
                      <th>S. No.</th>
                      <th>Medicine Name</th>
                      <th>Batch</th>
                      <th>Expiry Date</th>
                      <th className="text-end">M. R. P</th>
                      <th className="text-end">Discount(%)</th>
                      <th className="text-end">Units</th>
                      <th className="text-end">Total</th>
                    </tr>
                  </thead>
                  <tbody style={{ fontSize: 'var(--font-size-sm)' }}>
                    {selectedBill.medicines.map((med) => (
                      <tr key={med.id}>
                        <td className="text-muted">{med.id}</td>
                        <td className="fw-medium">{med.medicineName}</td>
                        <td>{med.batch}</td>
                        <td>{med.expiryDate}</td>
                        <td className="text-end">{med.mrp}</td>
                        <td className="text-end text-danger">{med.discountPercent}</td>
                        <td className="text-end">{med.units}</td>
                        <td className="text-end fw-semibold">{med.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {/* Totals summary */}
              <div className="d-flex justify-content-end">
                <Card className="neat-card" style={{ minWidth: 280 }}>
                  <Card.Body className="py-2 px-3">
                    <Table borderless size="sm" className="mb-0">
                      <tbody style={{ fontSize: 'var(--font-size-sm)' }}>
                        <tr>
                          <td className="text-muted">Sub Total (Rs.)</td>
                          <td className="text-end fw-semibold">{selectedBill.subTotal.toFixed(1)}</td>
                        </tr>
                        <tr>
                          <td className="text-muted">Discount (Rs.)</td>
                          <td className="text-end text-danger">{selectedBill.discount.toFixed(1)}</td>
                        </tr>
                        <tr className="border-top">
                          <td className="text-muted">Payable (Rs.)</td>
                          <td className="text-end fw-semibold">{selectedBill.payable.toFixed(1)}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold">Paid (Rs.)</td>
                          <td className="text-end fw-bold" style={{ color: 'var(--color-success)', fontSize: 'var(--font-size-base)' }}>
                            {selectedBill.paid.toFixed(1)}
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button className="theme-btn-primary">
            <FontAwesomeIcon icon={faPrint} className="me-2" />
            Print
          </Button>
          <Button variant="secondary" onClick={() => setSelectedBill(null)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default PhDuplicateBill;