import React, { useState } from 'react';
import { Button, Card, Col, Form, Row, Spinner, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faFileExcel, faSearch, faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import * as XLSX from 'xlsx';
import {
  CentralStoresApiService,
} from '../../../../api/central-stores/central-stores-api-service';
import PageHeader from '../../../../components/PageHeader';
import SearchInput from '../../../../components/SearchInput';
import { useTableSearch } from '../../../../hooks/useTableSearch';
import { showErrorToast, showValidationError } from '../../../../utils/alertUtil';

const centralStoresApi = new CentralStoresApiService();
const today = new Date().toISOString().split('T')[0];

type StockFilter = 'Stock' | 'NillStock';

interface ProfitRow {
  sNo: number;
  medicineName: string;
  batchNumber: string;
  stock: number;
  mrp: number;
  cost: number;
  tax: number;
  profit: number;
}

const getStoreData = (): { masterId: number; phModId: number } => {
  try {
    const s = sessionStorage.getItem('selectedStore');
    if (s) {
      const p = JSON.parse(s);
      const resolvedMasterId = p.masterId ?? 0;
      return { masterId: resolvedMasterId, phModId: resolvedMasterId };
    }
    const ph = sessionStorage.getItem('pharmacySubModuleData');
    if (ph) {
      const p = JSON.parse(ph);
      const resolvedMasterId = p.masterId ?? 0;
      return { masterId: resolvedMasterId, phModId: resolvedMasterId };
    }
  } catch {}
  return { masterId: 0, phModId: 0 };
};

const fmt = (n: number) => n.toFixed(2);

const StockProfitDetails: React.FC = () => {
  const [fromDate, setFromDate] = useState(today);
  const [stockFilter, setStockFilter] = useState<StockFilter>('Stock');
  const [rows, setRows] = useState<ProfitRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [reportDate, setReportDate] = useState('');

  const { filteredData, searchTerm, setSearchTerm, resultCount, totalCount } =
    useTableSearch({ data: rows, searchFields: ['medicineName', 'batchNumber'] });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromDate) {
      showValidationError('Please select a date.');
      return;
    }
    setIsLoading(true);
    setRows([]);
    try {
      const { masterId, phModId } = getStoreData();
      const products = await centralStoresApi.fetchAllProducts(phModId);
      const active = products
        .filter((p) => p.isactive !== 'N')
        .sort((a, b) => a.name.localeCompare(b.name));

      const result: ProfitRow[] = [];

      await Promise.all(
        active.map(async (p) => {
          try {
            const batches = await centralStoresApi.fetchAllBatches(p.id);
            if (!Array.isArray(batches) || batches.length === 0) return;

            await Promise.all(
              batches.map(async (b) => {
                try {
                  const stock = await centralStoresApi.fetchAvailableStock(b.id, masterId);
                  const passes =
                    stockFilter === 'NillStock' ? stock === 0 : stock > 0;
                  if (!passes) return;

                  const tax = (b.sgstPer ?? 0) + (b.cgstPer ?? 0) + (b.igstPer ?? 0);
                  const profit = b.mrp - b.cost;
                  result.push({
                    sNo: 0,
                    medicineName: p.name,
                    batchNumber: b.batchNo,
                    stock,
                    mrp: b.mrp,
                    cost: b.cost,
                    tax,
                    profit,
                  });
                } catch {
                  // skip batch on error
                }
              })
            );
          } catch {
            // skip product on error
          }
        })
      );

      result.sort((a, b) =>
        a.medicineName !== b.medicineName
          ? a.medicineName.localeCompare(b.medicineName)
          : a.batchNumber.localeCompare(b.batchNumber)
      );

      // assign sequential S.No after sort
      result.forEach((r, i) => { r.sNo = i + 1; });

      setRows(result);
      setReportDate(fromDate);
      setHasSearched(true);
    } catch {
      showErrorToast('Failed to load stock profit data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFromDate(today);
    setStockFilter('Stock');
    setRows([]);
    setHasSearched(false);
    setReportDate('');
    setSearchTerm('');
  };

  const handleExportExcel = () => {
    const exportData = filteredData.map((r, idx) => ({
      'S.No': idx + 1,
      'Medicine Name': r.medicineName,
      'Batch Number': r.batchNumber,
      'Stock': r.stock,
      'MRP': r.mrp,
      'Cost': r.cost,
      'Tax (%)': r.tax,
      'Profit': r.profit,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Stock Profit Details');
    XLSX.writeFile(wb, `Stock_Profit_Details_${reportDate}.xlsx`);
  };

  return (
    <div>
      <PageHeader
        icon={faChartLine}
        title="Stock Profit Details"
        subtitle="View batch-wise stock, MRP, cost, tax and profit details"
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
                      Date
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
                      Stock Type
                    </Form.Label>
                    <Form.Select
                      value={stockFilter}
                      onChange={(e) => setStockFilter(e.target.value as StockFilter)}
                      style={{ fontSize: 'var(--font-size-base)' }}
                    >
                      <option value="Stock">Stock</option>
                      <option value="NillStock">Nill Stock</option>
                    </Form.Select>
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
                    {isLoading ? 'Loading...' : 'View'}
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

          {/* Search + Export row */}
          {hasSearched && rows.length > 0 && (
            <Row className="g-2 align-items-center mb-3">
              <Col>
                <SearchInput
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  placeholder="Search by medicine name, batch number..."
                  resultCount={resultCount}
                  totalCount={totalCount}
                />
              </Col>
              <Col md="auto">
                <Button
                  variant="success"
                  onClick={handleExportExcel}
                  style={{
                    fontSize: 'var(--font-size-base)',
                    fontWeight: 'var(--font-weight-medium)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <FontAwesomeIcon icon={faFileExcel} />
                  Export Excel
                </Button>
              </Col>
            </Row>
          )}

          {/* Table */}
          {isLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" style={{ color: 'var(--btn-primary)' }} />
              <div
                className="mt-2"
                style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-muted)',
                }}
              >
                Loading stock profit data...
              </div>
            </div>
          ) : hasSearched ? (
            filteredData.length === 0 ? (
              <div
                className="text-center py-5"
                style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)' }}
              >
                No records found for the selected criteria.
              </div>
            ) : (
              <div style={{ maxHeight: '60vh', overflowY: 'auto', position: 'relative' }}>
                <Table
                  bordered
                  hover
                  size="sm"
                  style={{ fontSize: 'var(--font-size-sm)', marginBottom: 0 }}
                >
                  <thead
                    style={{
                      position: 'sticky',
                      top: 0,
                      background: 'var(--table-header-bg)',
                      color: 'var(--table-header-text)',
                      zIndex: 2,
                    }}
                  >
                    <tr>
                      <th style={{ width: '50px' }} className="text-center">S. No</th>
                      <th>Medicine Name</th>
                      <th>Batch Number</th>
                      <th className="text-end">Stock</th>
                      <th className="text-end">MRP</th>
                      <th className="text-end">Cost</th>
                      <th className="text-end">Tax (%)</th>
                      <th className="text-end">Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((r, idx) => (
                      <tr key={`${r.medicineName}-${r.batchNumber}`}>
                        <td className="text-center">{idx + 1}</td>
                        <td style={{ fontWeight: 'var(--font-weight-medium)' }}>{r.medicineName}</td>
                        <td>{r.batchNumber}</td>
                        <td className="text-end">{r.stock}</td>
                        <td className="text-end">{fmt(r.mrp)}</td>
                        <td className="text-end">{fmt(r.cost)}</td>
                        <td className="text-end">{fmt(r.tax)}</td>
                        <td
                          className="text-end"
                          style={{
                            fontWeight: 'var(--font-weight-semibold)',
                            color: r.profit < 0 ? 'var(--color-danger)' : 'inherit',
                          }}
                        >
                          {fmt(r.profit)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot
                    style={{
                      position: 'sticky',
                      bottom: 0,
                      background: 'var(--table-header-bg)',
                      color: 'var(--table-header-text)',
                      zIndex: 2,
                    }}
                  >
                    <tr>
                      <td
                        colSpan={3}
                        className="text-end"
                        style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-sm)' }}
                      >
                        Total ({filteredData.length} rows)
                      </td>
                      <td
                        className="text-end"
                        style={{ fontWeight: 'var(--font-weight-bold)' }}
                      >
                        {filteredData.reduce((s, r) => s + r.stock, 0)}
                      </td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td
                        className="text-end"
                        style={{ fontWeight: 'var(--font-weight-bold)' }}
                      >
                        {fmt(filteredData.reduce((s, r) => s + r.profit, 0))}
                      </td>
                    </tr>
                  </tfoot>
                </Table>
              </div>
            )
          ) : (
            <div
              className="text-center py-5"
              style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)' }}
            >
              Select a date and stock type, then click <strong>View</strong> to load data.
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default StockProfitDetails;