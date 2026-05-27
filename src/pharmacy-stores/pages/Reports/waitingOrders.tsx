import React, { useEffect, useState } from 'react';
import { Badge, Button, Card, Col, Modal, Nav, Row, Spinner, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHourglassHalf, faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import PageHeader from '../../../components/PageHeader';
import SearchInput from '../../../components/SearchInput';
import { useTableSearch } from '../../../hooks/useTableSearch';
import { showConfirmDialog } from '../../../utils/alertUtil';

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface SalesMedicineItem {
  medicineName: string;
  batchNo: string;
  expiryDate: string;
  units: number;
  mrp: number;
  total: number;
  discountAmt: number;
  sgstPer: number; cgstPer: number; igstPer: number;
  sgstAmt: number; cgstAmt: number; igstAmt: number;
}

interface SalesOrderRow {
  tabType: 'sales';
  slNo: number;
  orderNumber: string;
  opNumber: string;
  patientName: string;
  dateLabel: string;
  medicines: SalesMedicineItem[];
}

interface DispenseMedicine {
  productName: string;
  batchNo: string;
  units: number;
  cost: number;
  total: number;
}

interface DispenseOrderRow {
  tabType: 'dispense';
  slNo: number;
  orderNumber: string;
  opNumber: string;
  patientName: string;
  dateLabel: string;
  medicines: DispenseMedicine[];
}

interface ReturnOrderRow {
  tabType: 'returns';
  slNo: number;
  orderNumber: string;
  opNumber: string;
  patientName: string;
  dateLabel: string;
  note: string;
  medicines: SalesMedicineItem[];
}

type AnyOrderRow = SalesOrderRow | DispenseOrderRow | ReturnOrderRow;
type ActiveTab = 'sales' | 'dispense' | 'returns';

// ─── Dummy Data ──────────────────────────────────────────────────────────────

const DUMMY_SALES: SalesOrderRow[] = [
  {
    tabType: 'sales', slNo: 1, orderNumber: 'BILL001', opNumber: '321873',
    patientName: 'SR. SUBIK KUMAR', dateLabel: '11/03/2026',
    medicines: [
      { medicineName: 'Paracetamol 500mg', batchNo: 'B100A', expiryDate: '06/2027', mrp: 2.50, units: 10, total: 22.50, discountAmt: 2.50, sgstPer: 0, cgstPer: 0, igstPer: 0, sgstAmt: 0, cgstAmt: 0, igstAmt: 0 },
      { medicineName: 'Amoxicillin 250mg', batchNo: 'AMX202', expiryDate: '12/2026', mrp: 8.00, units: 6, total: 43.20, discountAmt: 4.80, sgstPer: 0, cgstPer: 0, igstPer: 0, sgstAmt: 0, cgstAmt: 0, igstAmt: 0 },
    ],
  },
  {
    tabType: 'sales', slNo: 2, orderNumber: 'BILL002', opNumber: '514488',
    patientName: 'K. KIRUTHANYA', dateLabel: '11/03/2026',
    medicines: [
      { medicineName: 'I.Jonac 25mg/ml', batchNo: 'NA00142A', expiryDate: '05/2028', mrp: 5.40, units: 4, total: 20.57, discountAmt: 1.03, sgstPer: 0, cgstPer: 0, igstPer: 0, sgstAmt: 0, cgstAmt: 0, igstAmt: 0 },
      { medicineName: 'I.Lablol 20mg/4ml', batchNo: 'ILBLAK502', expiryDate: '06/2027', mrp: 213.56, units: 1, total: 203.39, discountAmt: 10.17, sgstPer: 0, cgstPer: 0, igstPer: 0, sgstAmt: 0, cgstAmt: 0, igstAmt: 0 },
    ],
  },
  {
    tabType: 'sales', slNo: 3, orderNumber: 'BILL003', opNumber: '620011',
    patientName: 'RAVI SHANKAR', dateLabel: '10/03/2026',
    medicines: [
      { medicineName: 'Metformin 500mg', batchNo: 'MET301', expiryDate: '09/2027', mrp: 3.20, units: 30, total: 91.20, discountAmt: 4.80, sgstPer: 0, cgstPer: 0, igstPer: 0, sgstAmt: 0, cgstAmt: 0, igstAmt: 0 },
    ],
  },
];

const DUMMY_DISPENSE: DispenseOrderRow[] = [
  {
    tabType: 'dispense', slNo: 1, orderNumber: 'DIS139244', opNumber: '321873',
    patientName: 'SR. SUBIK KUMAR', dateLabel: '11/03/2026',
    medicines: [
      { productName: 'Inj. Normal Saline 500ml', batchNo: 'NS5001', units: 2, cost: 45.00, total: 90.00 },
      { productName: 'Inj. Dextrose 5% 500ml', batchNo: 'DX502', units: 1, cost: 52.00, total: 52.00 },
    ],
  },
  {
    tabType: 'dispense', slNo: 2, orderNumber: 'DIS21613', opNumber: '514488',
    patientName: 'K. KIRUTHANYA', dateLabel: '10/03/2026',
    medicines: [
      { productName: 'Tab. Atorvastatin 40mg', batchNo: 'ATV101', units: 15, cost: 4.50, total: 67.50 },
      { productName: 'Tab. Aspirin 75mg', batchNo: 'ASP202', units: 30, cost: 1.20, total: 36.00 },
    ],
  },
  {
    tabType: 'dispense', slNo: 3, orderNumber: 'DIS33001', opNumber: '710044',
    patientName: 'MEENA DEVI', dateLabel: '10/03/2026',
    medicines: [
      { productName: 'Syp. Azithromycin 200mg/5ml', batchNo: 'AZI311', units: 1, cost: 88.00, total: 88.00 },
    ],
  },
];

const DUMMY_RETURNS: ReturnOrderRow[] = [
  {
    tabType: 'returns', slNo: 1, orderNumber: 'RET001', opNumber: '321873',
    patientName: 'SR. SUBIK KUMAR', dateLabel: '11/03/2026', note: 'Wrong medicine dispensed',
    medicines: [
      { medicineName: 'Pantoprazole 40mg', batchNo: 'PAN101', expiryDate: '03/2027', mrp: 6.00, units: 5, total: 28.50, discountAmt: 1.50, sgstPer: 0, cgstPer: 0, igstPer: 0, sgstAmt: 0, cgstAmt: 0, igstAmt: 0 },
    ],
  },
  {
    tabType: 'returns', slNo: 2, orderNumber: 'RET002', opNumber: '620011',
    patientName: 'RAVI SHANKAR', dateLabel: '10/03/2026', note: 'Patient discharged',
    medicines: [
      { medicineName: 'Metformin 500mg', batchNo: 'MET301', expiryDate: '09/2027', mrp: 3.20, units: 10, total: 30.40, discountAmt: 1.60, sgstPer: 0, cgstPer: 0, igstPer: 0, sgstAmt: 0, cgstAmt: 0, igstAmt: 0 },
      { medicineName: 'Glibenclamide 5mg', batchNo: 'GLB44', expiryDate: '11/2026', mrp: 2.80, units: 10, total: 25.20, discountAmt: 2.80, sgstPer: 0, cgstPer: 0, igstPer: 0, sgstAmt: 0, cgstAmt: 0, igstAmt: 0 },
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function groupByDate(rows: AnyOrderRow[]): Array<{ dateLabel: string; rows: AnyOrderRow[] }> {
  const map = new Map<string, AnyOrderRow[]>();
  rows.forEach(r => {
    const existing = map.get(r.dateLabel);
    if (existing) {
      existing.push(r);
    } else {
      map.set(r.dateLabel, [r]);
    }
  });
  const result: Array<{ dateLabel: string; rows: AnyOrderRow[] }> = [];
  map.forEach((rowsForDate, dateLabel) => {
    result.push({ dateLabel, rows: rowsForDate });
  });
  return result;
}

// ─── Component ────────────────────────────────────────────────────────────────

const WaitingOrders: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('sales');
  const [isLoading, setIsLoading] = useState(false);

  const [salesRows, setSalesRows] = useState<SalesOrderRow[]>([]);
  const [dispenseRows, setDispenseRows] = useState<DispenseOrderRow[]>([]);
  const [returnRows, setReturnRows] = useState<ReturnOrderRow[]>([]);

  const [detailRow, setDetailRow] = useState<AnyOrderRow | null>(null);
  const [showModal, setShowModal] = useState(false);

  // ─── Search hooks ──────────────────────────────────────────────────────────

  const { filteredData: filteredSales, searchTerm: salesSearch, setSearchTerm: setSalesSearch,
    resultCount: salesResult, totalCount: salesTotal } = useTableSearch({
    data: salesRows, searchFields: ['orderNumber', 'opNumber', 'patientName'],
  });

  const { filteredData: filteredDispense, searchTerm: dispenseSearch, setSearchTerm: setDispenseSearch,
    resultCount: dispenseResult, totalCount: dispenseTotal } = useTableSearch({
    data: dispenseRows, searchFields: ['orderNumber', 'opNumber', 'patientName'],
  });

  const { filteredData: filteredReturns, searchTerm: returnsSearch, setSearchTerm: setReturnsSearch,
    resultCount: returnsResult, totalCount: returnsTotal } = useTableSearch({
    data: returnRows, searchFields: ['orderNumber', 'opNumber', 'patientName'],
  });

  // ─── Load dummy data ────────────────────────────────────────────────────────

  const fetchData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setSalesRows(DUMMY_SALES);
      setDispenseRows(DUMMY_DISPENSE);
      setReturnRows(DUMMY_RETURNS);
      setIsLoading(false);
    }, 400);
  };

  useEffect(() => { fetchData(); }, []);

  // ─── Cancel order ──────────────────────────────────────────────────────────

  const handleCancelOrder = async () => {
    if (!detailRow) return;
    const confirmed = await showConfirmDialog(
      `Cancel order ${detailRow.orderNumber}?`,
      'Please confirm the order was canceled'
    );
    if (!confirmed) return;
    if (detailRow.tabType === 'sales') {
      setSalesRows(prev => prev.filter(r => r.orderNumber !== detailRow.orderNumber));
    } else if (detailRow.tabType === 'dispense') {
      setDispenseRows(prev => prev.filter(r => r.orderNumber !== detailRow.orderNumber));
    } else {
      setReturnRows(prev => prev.filter(r => r.orderNumber !== detailRow.orderNumber));
    }
    setShowModal(false);
    setDetailRow(null);
  };

  // ─── Table renderer ────────────────────────────────────────────────────────

  const renderTable = (
    data: AnyOrderRow[],
    searchTerm: string,
    setSearchTerm: (v: string) => void,
    resultCount: number,
    totalCount: number,
  ) => {
    const grouped = groupByDate(data);
    let counter = 0;
    return (
      <>
        <Row className="g-2 align-items-center mb-3">
          <Col>
            <SearchInput
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Search by order no, OP no, patient..."
              resultCount={resultCount}
              totalCount={totalCount}
            />
          </Col>
        </Row>
        {data.length === 0 ? (
          <div className="text-center py-5" style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-muted)' }}>
            No records found.
          </div>
        ) : (
          <div style={{ maxHeight: '55vh', overflowY: 'auto' }}>
            <Table bordered hover size="sm" style={{ fontSize: 'var(--font-size-base)', marginBottom: 0 }}>
              <thead style={{
                position: 'sticky', top: 0, zIndex: 2,
                background: 'var(--table-header-bg)',
                color: 'var(--table-header-text)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-semibold)',
              }}>
                <tr>
                  <th style={{ width: 56, textAlign: 'center', whiteSpace: 'nowrap' }}>S. No</th>
                  <th style={{ whiteSpace: 'nowrap' }}>Order Number</th>
                  <th style={{ whiteSpace: 'nowrap' }}>O. P Number</th>
                  <th>Patient Name</th>
                </tr>
              </thead>
              <tbody>
                {grouped.map(({ dateLabel, rows }) => (
                  <React.Fragment key={dateLabel}>
                    <tr style={{ background: 'var(--bs-light, #f8f9fa)' }}>
                      <td colSpan={4} style={{
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: 'var(--font-weight-semibold)',
                        padding: '5px 10px',
                      }}>
                        Date: {dateLabel}
                      </td>
                    </tr>
                    {rows.map(row => {
                      counter++;
                      const key = `${row.orderNumber}-${counter}`;
                      return (
                        <tr key={key}>
                          <td style={{ textAlign: 'center' }}>{counter}</td>
                          <td>
                            <button
                              onClick={() => { setDetailRow(row); setShowModal(true); }}
                              style={{
                                background: 'none', border: 'none', padding: 0,
                                color: 'var(--bs-primary, #0d6efd)',
                                cursor: 'pointer', textDecoration: 'underline',
                                fontSize: 'var(--font-size-base)',
                                fontWeight: 'var(--font-weight-medium)',
                              }}
                            >
                              {row.orderNumber}
                            </button>
                          </td>
                          <td>{row.opNumber}</td>
                          <td>{row.patientName}</td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </>
    );
  };

  // ─── Medicine detail ───────────────────────────────────────────────────────

  const renderMedicines = () => {
    if (!detailRow || detailRow.medicines.length === 0) {
      return (
        <div className="text-center text-muted py-3" style={{ fontSize: 'var(--font-size-base)' }}>
          No medicine details available.
        </div>
      );
    }

    if (detailRow.tabType === 'dispense') {
      return (
        <Table bordered hover size="sm" style={{ fontSize: 'var(--font-size-base)' }}>
          <thead style={{
            background: 'var(--table-header-bg)', color: 'var(--table-header-text)',
            fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)',
          }}>
            <tr>
              <th>S. No</th>
              <th>Medicine Name</th>
              <th>Batch</th>
              <th className="text-end">Units</th>
              <th className="text-end">Rate</th>
              <th className="text-end">Total (Rs.)</th>
            </tr>
          </thead>
          <tbody>
            {detailRow.medicines.map((m, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{m.productName}</td>
                <td>{m.batchNo}</td>
                <td className="text-end">{m.units}</td>
                <td className="text-end">{m.cost?.toFixed(2)}</td>
                <td className="text-end">{m.total?.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot style={{
            background: 'var(--table-header-bg)', color: 'var(--table-header-text)',
            fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)',
          }}>
            <tr>
              <td colSpan={5} className="text-end">Total Amount (Rs.)</td>
              <td className="text-end">
                {detailRow.medicines.reduce((sum, m) => sum + (m.total || 0), 0).toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </Table>
      );
    }

    // Sales or Returns
    const meds = detailRow.medicines as SalesMedicineItem[];
    return (
      <Table bordered hover size="sm" style={{ fontSize: 'var(--font-size-base)' }}>
        <thead style={{
          background: 'var(--table-header-bg)', color: 'var(--table-header-text)',
          fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)',
        }}>
          <tr>
            <th>S. No</th>
            <th>Medicine Name</th>
            <th>Batch</th>
            <th>Expiry Date</th>
            <th className="text-end">M. R. P</th>
            <th className="text-end">Discount (%)</th>
            <th className="text-end">Units</th>
            <th className="text-end">Total (Rs.)</th>
          </tr>
        </thead>
        <tbody>
          {meds.map((m, i) => {
            const discPer = m.mrp * m.units > 0
              ? ((m.discountAmt / (m.mrp * m.units)) * 100).toFixed(1)
              : '0.0';
            return (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{m.medicineName}</td>
                <td>{m.batchNo}</td>
                <td>{m.expiryDate}</td>
                <td className="text-end">{m.mrp?.toFixed(2)}</td>
                <td className="text-end">{discPer}</td>
                <td className="text-end">{m.units}</td>
                <td className="text-end">{m.total?.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>          <tfoot style={{
            background: 'var(--table-header-bg)', color: 'var(--table-header-text)',
            fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)',
          }}>
            <tr>
              <td colSpan={7} className="text-end">Total Amount (Rs.)</td>
              <td className="text-end">
                {meds.reduce((sum, m) => sum + (m.total || 0), 0).toFixed(2)}
              </td>
            </tr>
          </tfoot>      </Table>
    );
  };

  // ─── JSX ──────────────────────────────────────────────────────────────────

  return (
    <div>
      <PageHeader
        icon={faHourglassHalf}
        title="Waiting Orders"
        subtitle="View pending sales, dispense, and return orders"
      />

      <Card className="shadow-sm border-0">
        <Card.Body>
          {/* Content */}
          {isLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" style={{ color: 'var(--btn-primary)' }} />
              <div className="mt-2" style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-muted)' }}>
                Loading orders...
              </div>
            </div>
          ) : (
            <>
              {/* Tabs + Refresh */}
              <div className="d-flex align-items-center justify-content-between mb-3">
                <Nav variant="tabs" style={{ borderBottom: 'none' }}>
                  {(['sales', 'dispense', 'returns'] as ActiveTab[]).map(tab => (
                    <Nav.Item key={tab}>
                      <Nav.Link
                        active={activeTab === tab}
                        onClick={() => setActiveTab(tab)}
                        style={{ fontSize: 'var(--font-size-base)', cursor: 'pointer' }}
                      >
                        {tab === 'sales' ? 'Sales' : tab === 'dispense' ? 'Dispense' : 'Sales Returns'}
                        <Badge bg="secondary" className="ms-2" style={{ fontSize: 'var(--font-size-xs)' }}>
                          {tab === 'sales' ? salesRows.length : tab === 'dispense' ? dispenseRows.length : returnRows.length}
                        </Badge>
                      </Nav.Link>
                    </Nav.Item>
                  ))}
                </Nav>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={fetchData}
                  style={{ fontSize: 'var(--font-size-base)', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <FontAwesomeIcon icon={faSyncAlt} /> Refresh
                </Button>
              </div>

              {activeTab === 'sales' && renderTable(filteredSales as AnyOrderRow[], salesSearch, setSalesSearch, salesResult, salesTotal)}
              {activeTab === 'dispense' && renderTable(filteredDispense as AnyOrderRow[], dispenseSearch, setDispenseSearch, dispenseResult, dispenseTotal)}
              {activeTab === 'returns' && renderTable(filteredReturns as AnyOrderRow[], returnsSearch, setReturnsSearch, returnsResult, returnsTotal)}
            </>
          )}
        </Card.Body>
      </Card>

      {/* Detail Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered>
        <Modal.Header
          closeButton
          style={{ background: 'var(--table-header-bg)', color: 'var(--table-header-text)' }}
        >
          <Modal.Title style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)' }}>
            Order Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detailRow && (
            <>
              <Row className="mb-4 g-3">
                <Col md={4}>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-muted)' }}>
                    Order No
                  </div>
                  <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--bs-primary, #0d6efd)' }}>
                    {detailRow.orderNumber}
                  </div>
                </Col>
                <Col md={4}>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-muted)' }}>
                    OP No
                  </div>
                  <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)' }}>
                    {detailRow.opNumber}
                  </div>
                </Col>
                <Col md={4}>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-muted)' }}>
                    Patient Name
                  </div>
                  <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)' }}>
                    {detailRow.patientName}
                  </div>
                </Col>
              </Row>
              <div style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                {renderMedicines()}
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-between align-items-center">
          <div style={{
            fontSize: 'var(--font-size-base)',
            fontWeight: 'var(--font-weight-semibold)',
          }}>
            Total Amount:&nbsp;
            <span style={{ color: 'var(--bs-success, #198754)' }}>
              Rs.&nbsp;
              {detailRow
                ? (detailRow.medicines as any[]).reduce((sum: number, m: any) => sum + (m.total || 0), 0).toFixed(2)
                : '0.00'}
            </span>
          </div>
          <div className="d-flex gap-2">
            <Button
              variant="danger"
              onClick={handleCancelOrder}
              style={{ fontSize: 'var(--font-size-base)' }}
            >
              Cancel Order
            </Button>
            <Button
              variant="outline-secondary"
              onClick={() => setShowModal(false)}
              style={{ fontSize: 'var(--font-size-base)' }}
            >
              Close
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default WaitingOrders;