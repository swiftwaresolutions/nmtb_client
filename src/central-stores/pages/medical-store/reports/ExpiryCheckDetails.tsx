import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Badge, Button, Card, Col, Form, InputGroup, Row, Spinner, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarXmark, faPrint, faSearch } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from 'react-redux';
import { useReactToPrint } from 'react-to-print';
import {
  ActiveStore,
  CentralStoresApiService,
} from '../../../../api/central-stores/central-stores-api-service';
import PageHeader from '../../../../components/PageHeader';
import PrintHeaderReports from '../../../../components/PrintHeaderReports';
import SearchInput from '../../../../components/SearchInput';
import { useTableSearch } from '../../../../hooks/useTableSearch';
import { RootState } from '../../../../state/store';
import { showErrorToast, showValidationError } from '../../../../utils/alertUtil';

const centralStoresApi = new CentralStoresApiService();

const getStatusText = (daysLeft: number): string => {
  if (daysLeft < 0) return 'Expired';
  if (daysLeft <= 30) return 'Expiring Soon';
  return 'Active';
};

interface ExpiryRow {
  id: string; // productName-batchNo
  productName: string;
  batchNo: string;
  expiryDate: string;
  stock: number;
  daysLeft: number;
}

const computeCutoffDate = (period: number, unit: string): Date => {
  const d = new Date();
  if (unit === 'Days') d.setDate(d.getDate() + period);
  else if (unit === 'Months') d.setMonth(d.getMonth() + period);
  else d.setFullYear(d.getFullYear() + period);
  d.setHours(23, 59, 59, 999);
  return d;
};

const getDaysLeft = (expiryDateStr: string): number => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  // API returns DD-MM-YYYY; split and reorder to avoid MM-DD-YYYY mis-parse
  const parts = expiryDateStr.split('-');
  if (parts.length !== 3) return NaN;
  const [day, month, year] = parts.map(Number);
  const exp = new Date(year, month - 1, day);
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

const ExpiryCheckDetails: React.FC = () => {
  const organization = useSelector((state: RootState) => state.appReducer.organization);
  const printOrganization = useMemo(
    () => ({
      name: organization?.name || '',
      code: organization?.code || '',
      address: organization?.address || '',
      phone: organization?.phoneNo || '',
    }),
    [organization]
  );

  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    pageStyle: `
      @page { size: A4; margin: 12mm; }
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      .expiry-print-only { display: block !important; }
      .expiry-screen-only { display: none !important; }
      .expiry-table-wrap { max-height: none !important; overflow: visible !important; }
      table { width: 100%; border-collapse: collapse !important; }
      table, th, td { border: 1px solid #000 !important; color: #000 !important; background: #fff !important; }
      thead { display: table-header-group; }
      tr { page-break-inside: avoid; }
      th { font-weight: bold; }
    `,
  });

  const isPharmacyContext = useMemo(() => !!sessionStorage.getItem('pharmacySubModuleData'), []);

  const [activeStores, setActiveStores] = useState<ActiveStore[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<number>(0);

  useEffect(() => {
    if (!isPharmacyContext) return;
    centralStoresApi.fetchAllActiveStores()
      .then((stores) => {
        const filteredStores = stores
          .filter((s) => s.isStore === 1)
          .sort((a, b) => a.id - b.id);
        setActiveStores(filteredStores);
        setSelectedStoreId((prev) => (prev || filteredStores[0]?.id || 0));
      })
      .catch(() => showErrorToast('Failed to load stores'));
  }, [isPharmacyContext]);

  const [period, setPeriod] = useState<string>('');
  const [unit, setUnit] = useState<string>('Months');
  const [rows, setRows] = useState<ExpiryRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const abortRef = useRef(false);

  const { filteredData, searchTerm, setSearchTerm, resultCount, totalCount } =
    useTableSearch({ data: rows, searchFields: ['productName', 'batchNo'] });

  const handleSubmit = async () => {
    const p = Number(period);
    if (!period || isNaN(p) || p <= 0) {
      showValidationError('Please enter a valid period greater than 0');
      return;
    }

    let storeId: number;
    let phModId: number;

    if (isPharmacyContext) {
      if (!selectedStoreId) {
        showValidationError('Please select a store');
        return;
      }
      const pharmacyDataStr = sessionStorage.getItem('pharmacySubModuleData');
      const pharmacyData = pharmacyDataStr ? JSON.parse(pharmacyDataStr) as { masterId?: number } : null;
      phModId = Number(pharmacyData?.masterId ?? 0);
      if (!phModId) {
        showValidationError('Pharmacy context is missing. Please reselect the store.');
        return;
      }
      storeId = selectedStoreId;
    } else {
      const selectedStoreStr = sessionStorage.getItem('selectedStore');
      const selectedStore = selectedStoreStr ? JSON.parse(selectedStoreStr) as { masterId?: number } : null;
      storeId = Number(selectedStore?.masterId ?? 0);
      if (!storeId) {
        showValidationError('Store context is missing. Please reselect the store.');
        return;
      }
      phModId = 0;
    }

    abortRef.current = false;
    setIsLoading(true);
    setHasSearched(true);
    setRows([]);

    try {
      const data = await centralStoresApi.fetchExpiryDetailsProducts(p, unit, storeId, phModId);
      const result: ExpiryRow[] = data.map((item) => ({
        id: `${item.productName}-${item.batchNo}`,
        productName: item.productName,
        batchNo: item.batchNo,
        expiryDate: item.expiryDate,
        stock: item.stock,
        daysLeft: getDaysLeft(item.expiryDate),
      }));
      result.sort((a, b) => a.daysLeft - b.daysLeft);
      setRows(result);
    } catch {
      showErrorToast('Failed to load expiry data');
    } finally {
      setIsLoading(false);
    }
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
      <Card className="shadow-sm">
        {/* ── Header: filter controls ── */}
        <Card.Header className="bg-white">
          <Row className="g-3 align-items-end">
            {isPharmacyContext && (
              <Col md={4}>
                <Form.Group>
                  <Form.Label
                    style={{
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                    }}
                  >
                    Store
                  </Form.Label>
                  <Form.Select
                    value={selectedStoreId}
                    onChange={(e) => setSelectedStoreId(Number(e.target.value))}
                    style={{ fontSize: 'var(--font-size-sm)' }}
                  >
                    {activeStores.map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.storeName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            )}
            <Col md={4}>
              <Form.Group>
                <Form.Label
                  style={{
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-weight-medium)',
                  }}
                >
                  Period
                </Form.Label>
                <InputGroup>
                  <Form.Control
                    type="number"
                    min={1}
                    placeholder="e.g. 3"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
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
            <Col md={2} className="d-flex gap-2">
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                style={{
                  background: 'var(--btn-primary)',
                  border: 'none',
                  fontSize: 'var(--font-size-sm)',
                  flex: 1,
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
              {hasSearched && !isLoading && rows.length > 0 && (
                <Button
                  variant="outline-secondary"
                  onClick={handlePrint}
                  style={{ fontSize: 'var(--font-size-sm)' }}
                  title="Print"
                >
                  <FontAwesomeIcon icon={faPrint} />
                </Button>
              )}
            </Col>
            {hasSearched && !isLoading && rows.length > 0 && (
              <Col md={6} className="d-flex justify-content-end">
                <SearchInput
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  placeholder="Search by product name or batch no..."
                  resultCount={resultCount}
                  totalCount={totalCount}
                />
              </Col>
            )}
          </Row>
        </Card.Header>

        {/* ── Body: results table ── */}
        <Card.Body className="p-0">
          <div ref={printRef}>
            {/* ── Print-only header (hidden on screen) ── */}
            <div className="expiry-print-only" style={{ display: 'none', marginBottom: '8px' }}>
              <PrintHeaderReports organization={printOrganization} />
              <div style={{ textAlign: 'center', fontWeight: 'bold', margin: '6px 0 2px', fontSize: '1rem' }}>
                Expiry Check Report
              </div>
              <div style={{ textAlign: 'center', fontSize: '0.8rem', marginBottom: '6px' }}>
                Products expiring within {period} {unit}
              </div>
            </div>

            {!hasSearched ? (
              <div
                className="text-center py-5"
                style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-sm)' }}
              >
                Enter a period above and click Submit to view expiry details.
              </div>
            ) : isLoading ? (
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
              <div className="expiry-table-wrap table-responsive" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
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
                        <td className="text-center">
                          <span className="expiry-screen-only">{getExpiryBadge(row.daysLeft)}</span>
                          <span className="expiry-print-only" style={{ display: 'none' }}>{getStatusText(row.daysLeft)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </div>
        </Card.Body>

        {/* ── Footer: summary counts ── */}
        {hasSearched && !isLoading && rows.length > 0 && (
          <Card.Footer className="bg-white expiry-screen-only">
            <Row className="g-2 align-items-center">
              <Col xs="auto">
                <div
                  style={{
                    background: 'var(--table-header-bg)',
                    color: 'var(--table-header-text)',
                    borderRadius: 'var(--border-radius-sm)',
                    padding: '4px 14px',
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
                      padding: '4px 14px',
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
                      padding: '4px 14px',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'var(--font-weight-semibold)',
                    }}
                  >
                    {expiringCount} Expiring Soon
                  </div>
                </Col>
              )}
            </Row>
          </Card.Footer>
        )}
      </Card>
    </div>
  );
};

export default ExpiryCheckDetails;
