import React, { useEffect, useRef, useState } from 'react';
import { Badge, Button, Card, Col, Form, InputGroup, Row, Spinner, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarXmark, faSearch } from '@fortawesome/free-solid-svg-icons';
import PageHeader from '../../../components/PageHeader';
import SearchInput from '../../../components/SearchInput';
import { useTableSearch } from '../../../hooks/useTableSearch';
import { showValidationError } from '../../../utils/alertUtil';

// ─── Types ──────────────────────────────────────────────────────────────────

interface ExpiryRow {
  id: string;
  productName: string;
  batchNo: string;
  expiryDate: string;
  stock: number;
  daysLeft: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getDaysLeft = (expiryDateStr: string): number => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const exp = new Date(expiryDateStr);
  exp.setHours(0, 0, 0, 0);
  return Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

const getExpiryBadge = (daysLeft: number) => {
  if (daysLeft < 0)
    return <Badge bg="danger" style={{ fontSize: 'var(--font-size-xs)' }}>Expired</Badge>;
  if (daysLeft <= 30)
    return <Badge bg="warning" text="dark" style={{ fontSize: 'var(--font-size-xs)' }}>Expiring Soon</Badge>;
  return <Badge bg="success" style={{ fontSize: 'var(--font-size-xs)' }}>Active</Badge>;
};

// ─── Dummy Data ──────────────────────────────────────────────────────────────

const buildDummies = (): ExpiryRow[] => {
  const raw: { productName: string; batchNo: string; expiryDate: string; stock: number }[] = [
    { productName: 'Paracetamol 500mg',    batchNo: 'B-1021', expiryDate: '2025-12-01', stock: 120 },
    { productName: 'Amoxicillin 250mg',    batchNo: 'B-2034', expiryDate: '2026-01-15', stock: 80  },
    { productName: 'Ibuprofen 400mg',      batchNo: 'B-3110', expiryDate: '2026-02-28', stock: 200 },
    { productName: 'Cetirizine 10mg',      batchNo: 'B-0991', expiryDate: '2026-03-10', stock: 60  },
    { productName: 'Azithromycin 500mg',   batchNo: 'B-4402', expiryDate: '2026-03-25', stock: 45  },
    { productName: 'Metformin 500mg',      batchNo: 'B-5523', expiryDate: '2026-04-30', stock: 310 },
    { productName: 'Atorvastatin 10mg',    batchNo: 'B-6601', expiryDate: '2026-06-01', stock: 95  },
    { productName: 'Omeprazole 20mg',      batchNo: 'B-7745', expiryDate: '2026-07-15', stock: 175 },
    { productName: 'Amlodipine 5mg',       batchNo: 'B-8812', expiryDate: '2026-08-20', stock: 50  },
    { productName: 'Losartan 50mg',        batchNo: 'B-9034', expiryDate: '2026-09-10', stock: 130 },
    { productName: 'Rabeprazole 20mg',     batchNo: 'B-0123', expiryDate: '2026-10-05', stock: 90  },
    { productName: 'Glimepiride 2mg',      batchNo: 'B-1144', expiryDate: '2026-11-30', stock: 110 },
    { productName: 'Vitamin D3 60000 IU',  batchNo: 'B-2255', expiryDate: '2027-01-01', stock: 60  },
    { productName: 'Aspirin 75mg',         batchNo: 'B-3366', expiryDate: '2027-02-14', stock: 280 },
    { productName: 'Ciprofloxacin 500mg',  batchNo: 'B-4477', expiryDate: '2027-06-30', stock: 115 },
  ];
  return raw.map((r) => ({
    ...r,
    id: `${r.productName}-${r.batchNo}`,
    daysLeft: getDaysLeft(r.expiryDate),
  })).sort((a, b) => a.daysLeft - b.daysLeft);
};

const ALL_DUMMIES = buildDummies();

// ─── Component ───────────────────────────────────────────────────────────────

const ExpiryCheck: React.FC = () => {
  const [period, setPeriod] = useState<string>('');
  const [unit, setUnit] = useState<string>('Months');
  const [cutoffDate, setCutoffDate] = useState<string>('');
  const [rows, setRows] = useState<ExpiryRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const abortRef = useRef(false);

  const { filteredData, searchTerm, setSearchTerm, resultCount, totalCount } =
    useTableSearch({ data: rows, searchFields: ['productName', 'batchNo'] });

  const handleSubmit = () => {
    const p = Number(period);
    const hasPeriod = period && !isNaN(p) && p > 0;
    const hasDate = !!cutoffDate;

    if (!hasPeriod && !hasDate) {
      showValidationError('Please enter a period or select a date to filter expiry');
      return;
    }

    abortRef.current = false;
    setIsLoading(true);
    setHasSearched(true);
    setRows([]);

    const toDays = (val: number, u: string): number => {
      if (u === 'Days') return val;
      if (u === 'Months') return val * 30;
      if (u === 'Years') return val * 365;
      return val;
    };

    setTimeout(() => {
      if (abortRef.current) return;
      let filtered = [...ALL_DUMMIES];

      if (hasDate) {
        const cutoff = new Date(cutoffDate);
        cutoff.setHours(23, 59, 59, 999);
        filtered = filtered.filter((r) => new Date(r.expiryDate) <= cutoff);
      } else if (hasPeriod) {
        const maxDays = toDays(p, unit);
        filtered = filtered.filter((r) => r.daysLeft <= maxDays);
      }

      setRows(filtered);
      setIsLoading(false);
    }, 400);
  };

  const handleReset = () => {
    setPeriod('');
    setCutoffDate('');
    setRows([]);
    setHasSearched(false);
  };

  useEffect(() => {
    return () => { abortRef.current = true; };
  }, []);

  const expiredCount = rows.filter((r) => r.daysLeft < 0).length;
  const expiringCount = rows.filter((r) => r.daysLeft >= 0 && r.daysLeft <= 30).length;

  return (
    <div>
      <PageHeader
        title="Expiry Check"
        subtitle="View products expiring within a given period"
        icon={faCalendarXmark}
      />
      <Card className="shadow-sm border-0">
        <Card.Body>
          {/* Filter Panel */}
          <div
            style={{
              background: 'var(--bs-light, #f8f9fa)',
              borderRadius: 'var(--border-radius-sm)',
              border: '1px solid var(--bs-border-color, #dee2e6)',
              padding: '16px 20px',
              marginBottom: '24px',
            }}
          >
            <Row className="g-3 align-items-end">
              {/* Period filter */}
              <Col md={4}>
                <Form.Group>
                  <Form.Label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                    Period
                  </Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="number"
                      min={1}
                      placeholder="e.g. 3"
                      value={period}
                      onChange={(e) => { setPeriod(e.target.value); setCutoffDate(''); }}
                      style={{ fontSize: 'var(--font-size-sm)' }}
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    />
                    <Form.Select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      style={{ fontSize: 'var(--font-size-sm)', maxWidth: '120px' }}
                    >
                      <option value="Days">Days</option>
                      <option value="Months">Months</option>
                      <option value="Years">Years</option>
                    </Form.Select>
                  </InputGroup>
                </Form.Group>
              </Col>

              {/* Divider */}
              <Col md="auto" className="d-flex align-items-end pb-1">
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', fontWeight: 'var(--font-weight-semibold)', lineHeight: '38px' }}>
                  OR
                </span>
              </Col>

              {/* Date filter */}
              <Col md={3}>
                <Form.Group>
                  <Form.Label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                    Select the Date
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={cutoffDate}
                    onChange={(e) => { setCutoffDate(e.target.value); setPeriod(''); }}
                    style={{ fontSize: 'var(--font-size-sm)' }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  />
                </Form.Group>
              </Col>

              {/* Submit */}
              <Col md={2}>
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  style={{
                    background: 'var(--btn-primary)',
                    border: 'none',
                    fontSize: 'var(--font-size-sm)',
                    width: '100%',
                  }}
                >
                  {isLoading ? (
                    <>
                      <Spinner size="sm" animation="border" className="me-1" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faSearch} className="me-1" />
                      Submit
                    </>
                  )}
                </Button>
              </Col>

              {/* Reset */}
              {hasSearched && (
                <Col md="auto">
                  <Button
                    variant="outline-secondary"
                    onClick={handleReset}
                    disabled={isLoading}
                    style={{ fontSize: 'var(--font-size-sm)' }}
                  >
                    <i className="fas fa-times"></i>
                  </Button>
                </Col>
              )}
            </Row>
          </div>

          {/* Summary + Search */}
          {hasSearched && !isLoading && rows.length > 0 && (
            <div className="mb-3">
              <Row className="g-2 mb-3">
                <Col xs="auto">
                  <div
                    style={{
                      background: 'var(--table-header-bg)',
                      color: 'var(--table-header-text)',
                      borderRadius: 'var(--border-radius-sm)',
                      padding: '6px 16px',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'var(--font-weight-semibold)',
                    }}
                  >
                    {rows.length} Product{rows.length !== 1 ? 's' : ''} Found
                  </div>
                </Col>
                {expiredCount > 0 && (
                  <Col xs="auto">
                    <div
                      style={{
                        background: 'var(--color-danger, #dc3545)',
                        color: '#fff',
                        borderRadius: 'var(--border-radius-sm)',
                        padding: '6px 16px',
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: 'var(--font-weight-semibold)',
                      }}
                    >
                      {expiredCount} Expired
                    </div>
                  </Col>
                )}
                {expiringCount > 0 && (
                  <Col xs="auto">
                    <div
                      style={{
                        background: '#fd7e14',
                        color: '#fff',
                        borderRadius: 'var(--border-radius-sm)',
                        padding: '6px 16px',
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: 'var(--font-weight-semibold)',
                      }}
                    >
                      {expiringCount} Expiring Soon
                    </div>
                  </Col>
                )}
              </Row>
              <SearchInput
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                placeholder="Search by product name or batch no..."
                resultCount={resultCount}
                totalCount={totalCount}
              />
            </div>
          )}

          {/* Results */}
          {hasSearched &&
            (isLoading ? (
              <div className="text-center py-5">
                <Spinner animation="border" />
                <div
                  className="mt-2"
                  style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)' }}
                >
                  Scanning all products for expiry...
                </div>
              </div>
            ) : filteredData.length === 0 ? (
              <div
                className="text-center py-5"
                style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-sm)' }}
              >
                No products found expiring within the selected period.
              </div>
            ) : (
              <div className="table-responsive" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                <Table bordered hover size="sm" className="mb-0">
                  <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                    <tr
                      style={{
                        background: 'var(--table-header-bg)',
                        color: 'var(--table-header-text)',
                        fontSize: 'var(--font-size-sm)',
                      }}
                    >
                      <th style={{ width: '60px' }}>Sl.No</th>
                      <th>Product Name</th>
                      <th>Batch No</th>
                      <th>Expiry Date</th>
                      <th className="text-center">Stock</th>
                      <th className="text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody style={{ fontSize: 'var(--font-size-sm)' }}>
                    {filteredData.map((row, index) => (
                      <tr
                        key={row.id}
                        style={{
                          background: row.daysLeft < 0
                            ? 'rgba(220,53,69,0.07)'
                            : row.daysLeft <= 30
                            ? 'rgba(255,193,7,0.10)'
                            : undefined,
                        }}
                      >
                        <td>{index + 1}</td>
                        <td style={{ fontWeight: 'var(--font-weight-medium)' }}>{row.productName}</td>
                        <td>{row.batchNo}</td>
                        <td>{row.expiryDate}</td>
                        <td className="text-center">{row.stock}</td>
                        <td className="text-center">{getExpiryBadge(row.daysLeft)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ))}
        </Card.Body>
      </Card>
    </div>
  );
};

export default ExpiryCheck;