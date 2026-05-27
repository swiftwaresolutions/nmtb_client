import React, { useMemo, useState } from 'react';
import { Button, Card, Col, Form, Row, Spinner, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar, faSearch, faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import {
  CentralStoresApiService,
} from '../../../../api/central-stores/central-stores-api-service';
import PageHeader from '../../../../components/PageHeader';
import SearchInput from '../../../../components/SearchInput';
import { useTableSearch } from '../../../../hooks/useTableSearch';
import { showErrorToast, showValidationError } from '../../../../utils/alertUtil';

const centralStoresApi = new CentralStoresApiService();
const today = new Date().toISOString().split('T')[0];

interface ConsumptionRow {
  sNo: number;
  medicineName: string;
  totalSale: number;
  monthlyConsumption: number;
}

const getStoreData = (): { masterId: number } => {
  try {
    const s = sessionStorage.getItem('selectedStore');
    if (s) return { masterId: JSON.parse(s).masterId ?? 0 };
    const ph = sessionStorage.getItem('pharmacySubModuleData');
    if (ph) return { masterId: JSON.parse(ph).masterId ?? 0 };
  } catch {}
  return { masterId: 0 };
};

const monthsBetween = (from: string, to: string): number => {
  const diffDays =
    (new Date(to).getTime() - new Date(from).getTime()) / (1000 * 60 * 60 * 24) + 1;
  const months = diffDays / 30.44;
  return Math.max(months, 1);
};

const MonthlyConsumption: React.FC = () => {
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [rows, setRows] = useState<ConsumptionRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const { filteredData, searchTerm, setSearchTerm, resultCount, totalCount } =
    useTableSearch({ data: rows, searchFields: ['medicineName'] });

  const totals = useMemo(
    () => filteredData.reduce(
      (acc, r) => ({
        totalSale: acc.totalSale + r.totalSale,
        monthlyConsumption: acc.monthlyConsumption + r.monthlyConsumption,
      }),
      { totalSale: 0, monthlyConsumption: 0 }
    ),
    [filteredData]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromDate || !toDate) {
      showValidationError('Please select both From Date and To Date.');
      return;
    }
    if (new Date(fromDate) > new Date(toDate)) {
      showValidationError('From Date cannot be later than To Date.');
      return;
    }
    setIsLoading(true);
    setRows([]);
    try {
      const { masterId } = getStoreData();
      const data = await centralStoresApi.fetchConsumableRegister(masterId, fromDate, toDate);
      const records = Array.isArray(data) ? data : [];

      const months = monthsBetween(fromDate, toDate);
      const map = new Map<string, number>();

      for (const record of records) {
        for (const item of record.items ?? []) {
          const name = item.medicineName ?? 'Unknown';
          map.set(name, (map.get(name) ?? 0) + (item.quantity ?? 0));
        }
      }

      const result: ConsumptionRow[] = Array.from(map.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([medicineName, totalSale], i) => ({
          sNo: i + 1,
          medicineName,
          totalSale,
          monthlyConsumption: parseFloat((totalSale / months).toFixed(2)),
        }));

      setRows(result);
      setHasSearched(true);
    } catch {
      showErrorToast('Failed to load monthly consumption data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFromDate(today);
    setToDate(today);
    setRows([]);
    setHasSearched(false);
    setSearchTerm('');
  };

  return (
    <div>
      <PageHeader
        icon={faChartBar}
        title="Monthly Consumption"
        subtitle="View medicine-wise total sales and average monthly consumption for a date range"
      />

      <Card className="shadow-sm border-0">
        <Card.Body>
          {/* Filter panel */}
          <div
            style={{
              background: 'var(--bs-light, #f8f9fa)',
              borderRadius: 'var(--border-radius-sm)',
              border: '1px solid var(--bs-border-color, #dee2e6)',
              padding: '16px 20px',
              marginBottom: '24px',
            }}
          >
            <Form onSubmit={handleSubmit}>
              <Row className="g-3 align-items-end">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label
                      style={{
                        fontSize: 'var(--font-size-base)',
                        fontWeight: 'var(--font-weight-medium)',
                      }}
                    >
                      From Date
                    </Form.Label>
                    <Form.Control
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      style={{ fontSize: 'var(--font-size-base)' }}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label
                      style={{
                        fontSize: 'var(--font-size-base)',
                        fontWeight: 'var(--font-weight-medium)',
                      }}
                    >
                      To Date
                    </Form.Label>
                    <Form.Control
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      style={{ fontSize: 'var(--font-size-base)' }}
                    />
                  </Form.Group>
                </Col>
                <Col md="auto">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      background: 'var(--btn-primary)',
                      border: 'none',
                      fontSize: 'var(--font-size-base)',
                      fontWeight: 'var(--font-weight-medium)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {isLoading ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      <FontAwesomeIcon icon={faSearch} />
                    )}
                    {isLoading ? 'Loading...' : 'Submit'}
                  </Button>
                </Col>
                <Col md="auto">
                  <Button
                    variant="outline-secondary"
                    type="button"
                    onClick={handleReset}
                    disabled={isLoading}
                    style={{
                      fontSize: 'var(--font-size-base)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <FontAwesomeIcon icon={faSyncAlt} />
                    Reset
                  </Button>
                </Col>
              </Row>
            </Form>
          </div>

          {/* Search */}
          {hasSearched && rows.length > 0 && (
            <Row className="g-2 align-items-center mb-3">
              <Col>
                <SearchInput
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  placeholder="Search by medicine name..."
                  resultCount={resultCount}
                  totalCount={totalCount}
                />
              </Col>
            </Row>
          )}

          {/* Content */}
          {isLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" style={{ color: 'var(--btn-primary)' }} />
              <div
                className="mt-2"
                style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-muted)' }}
              >
                Loading consumption data...
              </div>
            </div>
          ) : hasSearched ? (
            filteredData.length === 0 ? (
              <div
                className="text-center py-5"
                style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-muted)' }}
              >
                No consumption records found for the selected date range.
              </div>
            ) : (
              <div style={{ maxHeight: '60vh', overflowY: 'auto', position: 'relative' }}>
                <Table
                  bordered
                  hover
                  size="sm"
                  style={{ fontSize: 'var(--font-size-base)', marginBottom: 0 }}
                >
                  <thead
                    style={{
                      position: 'sticky',
                      top: 0,
                      background: 'var(--table-header-bg)',
                      color: 'var(--table-header-text)',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'var(--font-weight-semibold)',
                      zIndex: 2,
                    }}
                  >
                    <tr>
                      <th style={{ width: '60px' }} className="text-center">S. No.</th>
                      <th>Medicine Name</th>
                      <th style={{ width: '160px' }} className="text-center">Total No of Sale</th>
                      <th style={{ width: '180px' }} className="text-center">Monthly Consumption</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((r, idx) => (
                      <tr key={r.medicineName}>
                        <td className="text-center">{idx + 1}</td>
                        <td style={{ fontWeight: 'var(--font-weight-medium)' }}>{r.medicineName}</td>
                        <td className="text-center">{r.totalSale}</td>
                        <td className="text-center">{r.monthlyConsumption}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot
                    style={{
                      position: 'sticky',
                      bottom: 0,
                      background: 'var(--table-header-bg)',
                      color: 'var(--table-header-text)',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'var(--font-weight-bold)',
                      zIndex: 2,
                    }}
                  >
                    <tr>
                      <td colSpan={2} className="text-end">
                        Total ({filteredData.length} medicine{filteredData.length !== 1 ? 's' : ''})
                      </td>
                      <td className="text-center">{totals.totalSale}</td>
                      <td className="text-center">{totals.monthlyConsumption.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </Table>
              </div>
            )
          ) : (
            <div
              className="text-center py-5"
              style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-muted)' }}
            >
              Select a date range and click <strong>Submit</strong> to view monthly consumption.
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default MonthlyConsumption;