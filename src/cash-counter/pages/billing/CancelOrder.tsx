import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Table, Badge, Nav, Modal, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBan, faTrash, faStethoscope, faPills, faFlask, faExclamationTriangle, faEye, faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import PageHeader from '../../../components/PageHeader';
import { showConfirmDialog, showSuccessToast, showErrorToast } from '../../../utils/alertUtil';
import { useTableSearch } from '../../../hooks/useTableSearch';
import SearchInput from '../../../components/SearchInput';
import CashCounterApiService from '../../../api/cash-counter/cash-counter-api-service';

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface ProcDetailItem {
  groupName: string;
  procName: string;
  unit: number;
  rate: number;
  disc: number;
}

interface LabDetailItem {
  deptName: string;
  testName: string;
  unit: number;
  rate: number;
  disc: number;
}

interface PharmacyDetailItem {
  genericName: string;
  prodsName: string;
  batchNo: string;
  units: number;
  mrp: number;
  total: number;
}

interface OrderRow {
  orderId: number;
  orderNo: string;
  ipId: number;
  patientName: string;
  age: string;
  sex: string;
  opNo: string;
  date: string;
  userName: string;
  orderType: TabKey;
  details: any[];
}

type TabKey = 'procedure' | 'pharmacy' | 'lab';
type PatientFilter = 'all' | 'op' | 'ip';

// ─── API Service ──────────────────────────────────────────────────────────────

const apiService = new CashCounterApiService();

// ─── Component ────────────────────────────────────────────────────────────────

const CancelOrder: React.FC = () => {
  const [activeTab, setActiveTab]             = useState<TabKey>('procedure');
  const [procedureOrders, setProcedureOrders] = useState<OrderRow[]>([]);
  const [pharmacyOrders,  setPharmacyOrders]  = useState<OrderRow[]>([]);
  const [labOrders,       setLabOrders]       = useState<OrderRow[]>([]);
  const [patientFilter,   setPatientFilter]   = useState<PatientFilter>('all');
  const [viewRow,         setViewRow]         = useState<OrderRow | null>(null);
  const [isLoading,       setIsLoading]       = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [procedure, lab, pharmacy] = await Promise.all([
        apiService.fetchAllInvestigationPendingOrders(),
        apiService.fetchAllLabPendingOrders(),
        apiService.fetchAllPharmacyPendingOrders(),
      ]);
      setProcedureOrders(procedure.map((r: any) => ({ ...r, orderType: 'procedure' as TabKey })));
      setLabOrders(lab.map((r: any) => ({ ...r, orderType: 'lab' as TabKey })));
      setPharmacyOrders(pharmacy.map((r: any) => ({ ...r, orderType: 'pharmacy' as TabKey })));
    } catch {
      showErrorToast('Failed to load pending orders. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const tabConfig: { key: TabKey; label: string; icon: any; data: OrderRow[] }[] = [
    { key: 'procedure', label: 'Procedure', icon: faStethoscope, data: procedureOrders },
    { key: 'pharmacy',  label: 'Pharmacy',  icon: faPills,       data: pharmacyOrders  },
    { key: 'lab',       label: 'Lab',       icon: faFlask,       data: labOrders       },
  ];

  const currentData = tabConfig.find(t => t.key === activeTab)?.data ?? [];

  const { filteredData, searchTerm, setSearchTerm, resultCount, totalCount } = useTableSearch({
    data: currentData,
    searchFields: ['orderNo', 'patientName', 'opNo','ipId'],
  });

  const displayData = filteredData.filter(row => {
    if (patientFilter === 'op') return row.ipId === 0;
    if (patientFilter === 'ip') return row.ipId > 0;
    return true;
  });

  const handleTabChange = (k: string | null) => {
    setActiveTab(k as TabKey);
    setSearchTerm('');
    setPatientFilter('all');
  };

  const handleView = (row: OrderRow) => setViewRow(row);
  const handleCloseView = () => setViewRow(null);

  const orderTypeMap: Record<TabKey, string> = {
    procedure: 'INV',
    pharmacy:  'PH',
    lab:       'LAB',
  };

  const handleCancel = async (row: OrderRow) => {
    const confirmed = await showConfirmDialog(
      `Are you sure you want to cancel order ${row.orderNo} for ${row.patientName}?`,
      'This action cannot be undone.'
    );
    if (!confirmed) return;

    try {
      await apiService.cancelPendingOrder(row.orderId, orderTypeMap[activeTab]);
      if (activeTab === 'procedure') setProcedureOrders(prev => prev.filter(r => r.orderId !== row.orderId));
      if (activeTab === 'pharmacy')  setPharmacyOrders(prev  => prev.filter(r => r.orderId !== row.orderId));
      if (activeTab === 'lab')       setLabOrders(prev        => prev.filter(r => r.orderId !== row.orderId));
      showSuccessToast(`Order ${row.orderNo} for ${row.patientName} has been cancelled.`);
    } catch {
      showErrorToast('Failed to cancel order. Please try again.');
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <PageHeader
        icon={faTrash}
        title="Cancel Order"
        subtitle="Cancel pending procedure, pharmacy or lab orders"
        badges={[{ label: 'Pending Orders', value: currentData.length }]}
      />

      {/* Content */}
      <div style={{ flex: 1, width: '100%', overflow: 'hidden' }}>
        <Container fluid className="px-3 pb-3">

          {/* Tabs + Search Card */}
          <Card className="neat-card mb-3">
            <Card.Body className="p-3">
              {/* Tabs */}
              <Nav
                variant="tabs"
                activeKey={activeTab}
                onSelect={handleTabChange}
                className="mb-3"
              >
                {tabConfig.map(tab => (
                  <Nav.Item key={tab.key}>
                    <Nav.Link eventKey={tab.key} className="d-flex align-items-center gap-2">
                      <FontAwesomeIcon icon={tab.icon} />
                      {tab.label}
                      <Badge bg={activeTab === tab.key ? 'primary' : 'secondary'} className="ms-1">
                        {tab.data.length}
                      </Badge>
                    </Nav.Link>
                  </Nav.Item>
                ))}
              </Nav>

              {/* Search Bar + Patient Filter */}
              <div className="d-flex align-items-center gap-3 flex-wrap">
                <div style={{ flex: 1, minWidth: 240 }}>
                  <SearchInput
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    placeholder="Search by order no, patient name, OP No..."
                    resultCount={resultCount}
                    totalCount={totalCount}
                  />
                </div>
                <div className="d-flex gap-2">
                  {(['all', 'op', 'ip'] as PatientFilter[]).map(f => (
                    <Button
                      key={f}
                      size="sm"
                      className={patientFilter === f ? 'theme-btn-primary' : 'theme-outline-btn-primary'}
                      onClick={() => setPatientFilter(f)}
                    >
                      {f === 'all' ? 'All' : f === 'op' ? 'OP Patient' : 'IP Patient'}
                    </Button>
                  ))}
                  <Button
                    size="sm"
                    className="theme-outline-btn-secondary"
                    onClick={loadAllData}
                    disabled={isLoading}
                    title="Refresh"
                  >
                    <FontAwesomeIcon icon={faSyncAlt} className={isLoading ? 'fa-spin' : ''} />
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Table Card */}
          <Card className="neat-card">
            <Card.Body className="p-0">
              {isLoading ? (
                <div className="text-center py-5 text-muted">
                  <Spinner animation="border" variant="primary" className="mb-3 d-block mx-auto" />
                  <p className="mb-0">Loading orders...</p>
                </div>
              ) : displayData.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <FontAwesomeIcon icon={faExclamationTriangle} size="3x" className="mb-3 opacity-25" />
                  <p className="mb-0">No orders found</p>
                  <small>Try adjusting your search criteria</small>
                </div>
              ) : (
                <div style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                  <Table hover className="mb-0 align-middle">
                    <thead
                      className="bg-light text-muted text-uppercase small"
                      style={{ position: 'sticky', top: 0, zIndex: 1 }}
                    >
                      <tr>
                        <th className="py-3 ps-4" style={{ width: '6%' }}>S.NO</th>
                        <th className="py-3" style={{ width: '13%' }}>Order No</th>
                        <th className="py-3" style={{ width: '28%' }}>Patient Name</th>
                        <th className="py-3" style={{ width: '10%' }}>OP No</th>
                        <th className="py-3" style={{ width: '10%' }}>IP No</th>
                        <th className="py-3" style={{ width: '8%' }}>Age</th>
                        <th className="py-3" style={{ width: '6%' }}>Sex</th>
                        <th className="py-3" style={{ width: '12%' }}>Date/Time</th>
                        <th className="py-3" style={{ width: '6%' }}>User</th>
                        <th className="py-3 text-center" style={{ width: '19%' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayData.map((row, idx) => (
                        <tr key={row.orderId}>
                          <td className="fw-bold text-muted ps-4">{idx + 1}</td>
                          <td>
                            <Badge className="theme-badge-secondary px-3 py-2 fw-bold">
                              {row.orderNo}
                            </Badge>
                          </td>
                          <td className="fw-medium">{row.patientName}</td>
                          <td>{row.opNo}</td>
                          <td>{row.ipId > 0 ? `IP${row.ipId}` : '-'}</td>
                          <td>{row.age}</td>
                          <td>{row.sex}</td>
                          <td>{row.date}</td>
                          <td>{row.userName}</td>
                          <td className="text-center">
                            <div className="d-flex gap-2 justify-content-center">
                              <Button
                                className="theme-outline-btn-primary"
                                size="sm"
                                onClick={() => handleView(row)}
                              >
                                <FontAwesomeIcon icon={faEye} className="me-1" />
                                View
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleCancel(row)}
                              >
                                <FontAwesomeIcon icon={faTrash} className="me-1" />
                                Cancel
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>

        </Container>
      </div>

      {/* View Order Details Modal */}
      <Modal show={!!viewRow} onHide={handleCloseView} size="lg" centered>
        <Modal.Header closeButton className="border-bottom py-3 bg-light">
          <Modal.Title className="h5 fw-bold">
            <FontAwesomeIcon icon={faEye} className="me-2 text-primary" />
            Order Details &nbsp;
            {viewRow && (
              <Badge className="theme-badge-secondary fw-bold">{viewRow.orderNo}</Badge>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          {viewRow && (
            <>
              {/* Patient info bar */}
              <div className="px-4 py-3 bg-light border-bottom">
                <span className="text-muted small me-3">Patient: <strong>{viewRow.patientName}</strong></span>
                <span className="text-muted small me-3">OP No: <strong>{viewRow.opNo}</strong></span>
                <span className="text-muted small me-3">Age: <strong>{viewRow.age}</strong></span>
                <span className="text-muted small me-3">Sex: <strong>{viewRow.sex}</strong></span>
                {viewRow.ipId > 0 && (
                  <span className="text-muted small">IP No: <strong>IP{viewRow.ipId}</strong></span>
                )}
              </div>

              {/* Details table */}
              <div style={{ maxHeight: '55vh', overflowY: 'auto' }}>
                <Table hover className="mb-0 align-middle">
                  <thead
                    className="bg-light text-muted text-uppercase small"
                    style={{ position: 'sticky', top: 0, zIndex: 1 }}
                  >
                    {viewRow.orderType === 'pharmacy' ? (
                      <tr>
                        <th className="py-3 ps-4" style={{ width: '6%' }}>Sl.No</th>
                        <th className="py-3" style={{ width: '20%' }}>Generic Name</th>
                        <th className="py-3" style={{ width: '26%' }}>Product Name</th>
                        <th className="py-3" style={{ width: '16%' }}>Batch No</th>
                        <th className="py-3 text-end" style={{ width: '10%' }}>Units</th>
                        <th className="py-3 text-end" style={{ width: '11%' }}>MRP</th>
                        <th className="py-3 text-end" style={{ width: '11%' }}>Total</th>
                      </tr>
                    ) : viewRow.orderType === 'lab' ? (
                      <tr>
                        <th className="py-3 ps-4" style={{ width: '6%' }}>Sl.No</th>
                        <th className="py-3" style={{ width: '26%' }}>Department</th>
                        <th className="py-3" style={{ width: '34%' }}>Test Name</th>
                        <th className="py-3 text-end" style={{ width: '10%' }}>Units</th>
                        <th className="py-3 text-end" style={{ width: '12%' }}>Rate</th>
                        <th className="py-3 text-end" style={{ width: '12%' }}>Disc (%)</th>
                      </tr>
                    ) : (
                      <tr>
                        <th className="py-3 ps-4" style={{ width: '6%' }}>Sl.No</th>
                        <th className="py-3" style={{ width: '22%' }}>Group</th>
                        <th className="py-3" style={{ width: '34%' }}>Name</th>
                        <th className="py-3 text-end" style={{ width: '10%' }}>Units</th>
                        <th className="py-3 text-end" style={{ width: '14%' }}>Rate</th>
                        <th className="py-3 text-end" style={{ width: '14%' }}>Disc (%)</th>
                      </tr>
                    )}
                  </thead>
                  <tbody>
                    {viewRow.details.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-4 text-muted">
                          No items found for this order.
                        </td>
                      </tr>
                    ) : viewRow.orderType === 'pharmacy' ? (
                      viewRow.details.map((item: PharmacyDetailItem, idx) => (
                        <tr key={idx}>
                          <td className="fw-bold text-muted ps-4">{idx + 1}</td>
                          <td className="text-muted small">{item.genericName}</td>
                          <td className="fw-medium">{item.prodsName}</td>
                          <td>{item.batchNo}</td>
                          <td className="text-end">{item.units}</td>
                          <td className="text-end">{item.mrp.toFixed(2)}</td>
                          <td className="text-end">{item.total.toFixed(2)}</td>
                        </tr>
                      ))
                    ) : viewRow.orderType === 'lab' ? (
                      viewRow.details.map((item: LabDetailItem, idx) => (
                        <tr key={idx}>
                          <td className="fw-bold text-muted ps-4">{idx + 1}</td>
                          <td className="text-muted small">{item.deptName}</td>
                          <td className="fw-medium">{item.testName}</td>
                          <td className="text-end">{item.unit}</td>
                          <td className="text-end">{item.rate.toFixed(2)}</td>
                          <td className="text-end text-danger">{item.disc.toFixed(1)}</td>
                        </tr>
                      ))
                    ) : (
                      viewRow.details.map((item: ProcDetailItem, idx) => (
                        <tr key={idx}>
                          <td className="fw-bold text-muted ps-4">{idx + 1}</td>
                          <td className="text-muted small">{item.groupName}</td>
                          <td className="fw-medium">{item.procName}</td>
                          <td className="text-end">{item.unit}</td>
                          <td className="text-end">{item.rate.toFixed(2)}</td>
                          <td className="text-end text-danger">{item.disc.toFixed(1)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="border-top">
          <Button className="theme-outline-btn-primary" onClick={handleCloseView}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
};

export default CancelOrder;









