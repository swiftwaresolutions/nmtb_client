import React, { useState } from 'react';
import { Button, Card, Col, Form, Row, Spinner, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTruckRampBox } from '@fortawesome/free-solid-svg-icons';
import {
  CentralStoresApiService,
  SupplierwisePurchaseTotalRecord,
} from '../../../../api/central-stores/central-stores-api-service';
import PageHeader from '../../../../components/PageHeader';
import SearchInput from '../../../../components/SearchInput';
import { useTableSearch } from '../../../../hooks/useTableSearch';
import { showErrorToast, showValidationError } from '../../../../utils/alertUtil';

const centralStoresApi = new CentralStoresApiService();

type SupplierTotal = SupplierwisePurchaseTotalRecord;

const MONTHS = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => currentYear - i);

const getStoreData = (): { masterId: number } => {
  try {
    const selectedStore = sessionStorage.getItem('selectedStore');
    if (selectedStore) {
      const parsed = JSON.parse(selectedStore);
      return { masterId: parsed.masterId };
    }
    const pharmacy = sessionStorage.getItem('pharmacySubModuleData');
    if (pharmacy) {
      const parsed = JSON.parse(pharmacy);
      return { masterId: parsed.masterId ?? 0 };
    }
  } catch {
    // ignore
  }
  return { masterId: 0 };
};

const SupwiseWiseTotal: React.FC = () => {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState<string>(String(currentYear));
  const [selectedMonth, setSelectedMonth] = useState<string>(
    String(now.getMonth() + 1).padStart(2, '0')
  );
  const [supplierTotals, setSupplierTotals] = useState<SupplierTotal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const { filteredData, searchTerm, setSearchTerm, resultCount, totalCount } =
    useTableSearch<SupplierTotal>({ data: supplierTotals, searchFields: ['supplierName'] });

  const handleSubmit = async () => {
    if (!selectedYear) {
      showValidationError('Please select a year');
      return;
    }
    if (!selectedMonth) {
      showValidationError('Please select a month');
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    try {
      const { masterId } = getStoreData();
      const totals = await centralStoresApi.fetchSupplierwisePurchaseTotal(
        masterId,
        Number(selectedYear),
        Number(selectedMonth)
      );
      setSupplierTotals(totals);
    } catch {
      showErrorToast('Failed to fetch supplier totals');
    } finally {
      setIsLoading(false);
    }
  };

  const grandCost = filteredData.reduce((s, r) => s + r.costPriceTotal, 0);
  const grandMrp = filteredData.reduce((s, r) => s + r.totalMrp, 0);

  return (
    <div>
      <PageHeader
        title="Supplier Wise Total"
        subtitle="Month-wise goods receipt totals grouped by supplier"
        icon={faTruckRampBox}
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
              <Col md={3}>
                <Form.Group>
                  <Form.Label
                    style={{
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                    }}
                  >
                    Year
                  </Form.Label>
                  <Form.Select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    style={{ fontSize: 'var(--font-size-sm)' }}
                  >
                    {YEARS.map((y) => (
                      <option key={y} value={String(y)}>
                        {y}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label
                    style={{
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                    }}
                  >
                    Month
                  </Form.Label>
                  <Form.Select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    style={{ fontSize: 'var(--font-size-sm)' }}
                  >
                    {MONTHS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
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
            </Row>
          </div>

          {/* Summary + Search */}
          {hasSearched && !isLoading && supplierTotals.length > 0 && (
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
                    {supplierTotals.length} Supplier{supplierTotals.length !== 1 ? 's' : ''}
                  </div>
                </Col>
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
                    {MONTHS.find((m) => m.value === selectedMonth)?.label} {selectedYear}
                  </div>
                </Col>
              </Row>
              <SearchInput
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                placeholder="Search by supplier name..."
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
                  Loading supplier totals...
                </div>
              </div>
            ) : filteredData.length === 0 ? (
              <div
                className="text-center py-5"
                style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-sm)' }}
              >
                No goods receipts found for the selected month.
              </div>
            ) : (
              <div className="table-responsive">
                <Table bordered hover size="sm" className="mb-0">
                  <thead>
                    <tr
                      style={{
                        background: 'var(--table-header-bg)',
                        color: 'var(--table-header-text)',
                        fontSize: 'var(--font-size-sm)',
                      }}
                    >
                      <th style={{ width: '60px' }}>Sl.No</th>
                      <th>Supplier Name</th>
                      <th className="text-end">Cost Price Total</th>
                      <th className="text-end">MRP Total</th>
                    </tr>
                  </thead>
                  <tbody style={{ fontSize: 'var(--font-size-sm)' }}>
                    {filteredData.map((row, index) => (
                      <tr key={row.supplierName}>
                        <td>{index + 1}</td>
                        <td style={{ fontWeight: 'var(--font-weight-medium)' }}>
                          {row.supplierName}
                        </td>
                        <td className="text-end">{row.costPriceTotal.toFixed(2)}</td>
                        <td className="text-end">{row.totalMrp.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr
                      style={{
                        background: 'var(--table-header-bg)',
                        color: 'var(--table-header-text)',
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: 'var(--font-weight-semibold)',
                      }}
                    >
                      <td colSpan={2}>
                        TOTAL ({filteredData.length} supplier{filteredData.length !== 1 ? 's' : ''})
                      </td>
                      <td className="text-end">{grandCost.toFixed(2)}</td>
                      <td className="text-end">{grandMrp.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </Table>
              </div>
            ))}
        </Card.Body>
      </Card>
    </div>
  );
};

export default SupwiseWiseTotal;
