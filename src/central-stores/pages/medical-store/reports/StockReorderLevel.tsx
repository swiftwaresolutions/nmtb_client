import React, { useState } from 'react';
import { Button, Card, Col, Form, Row, Spinner, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExcel, faLayerGroup, faSearch, faSyncAlt } from '@fortawesome/free-solid-svg-icons';
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

interface ReorderRow {
  id: number;
  productName: string;
  stock: number;
  reorderLevel: number;
  min: number;
  max: number;
}

const fmtDate = (d: string) => {
  if (!d) return '';
  const parsed = new Date(d);
  if (isNaN(parsed.getTime())) return d;
  return parsed.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

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

const StockReorderLevel: React.FC = () => {
  const [fromDate, setFromDate] = useState(today);
  const [rows, setRows] = useState<ReorderRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [reportDate, setReportDate] = useState('');

  const { filteredData, searchTerm, setSearchTerm, resultCount, totalCount } =
    useTableSearch({ data: rows, searchFields: ['productName'] });

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

      const result: ReorderRow[] = await Promise.all(
        active.map(async (p) => {
          let totalStock = 0;
          try {
            const batches = await centralStoresApi.fetchBatchDetailsByProdsId(p.id, masterId);
            if (Array.isArray(batches) && batches.length > 0) {
              const stocks = await Promise.all(
                batches.map((b) =>
                  centralStoresApi.fetchAvailableStock(b.batchId, masterId).catch(() => 0)
                )
              );
              totalStock = stocks.reduce((sum, s) => sum + s, 0);
            }
          } catch {
            totalStock = p.ownStock ?? 0;
          }
          return {
            id: p.id,
            productName: p.name,
            stock: totalStock,
            reorderLevel: p.safe,
            min: p.min,
            max: p.max,
          };
        })
      );

      setRows(result);
      setReportDate(fromDate);
      setHasSearched(true);
    } catch {
      showErrorToast('Failed to load stock reorder level data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFromDate(today);
    setRows([]);
    setHasSearched(false);
    setReportDate('');
    setSearchTerm('');
  };

  const handleExportExcel = () => {
    const exportData = filteredData.map((r, idx) => ({
      'S.No': idx + 1,
      'Product Name': r.productName,
      'Stock': r.stock,
      'Reorder Level': r.reorderLevel,
      'Min': r.min,
      'Max': r.max,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Stock Reorder Level');
    XLSX.writeFile(wb, `Stock_Reorder_Level_${reportDate}.xlsx`);
  };

  return (
    <div>
      <PageHeader
        icon={faLayerGroup}
        title="Stock Reorder Level"
        subtitle="View product stock levels against reorder, minimum and maximum thresholds"
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
                <Col md={2}>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      background: 'var(--btn-primary)',
                      border: 'none',
                      fontSize: 'var(--font-size-base)',
                      width: '100%',
                    }}
                  >
                    {isLoading ? (
                      <Spinner size="sm" animation="border" className="me-1" />
                    ) : (
                      <FontAwesomeIcon icon={faSearch} className="me-1" />
                    )}
                    Submit
                  </Button>
                </Col>
                <Col md={2}>
                  <Button
                    type="button"
                    variant="outline-secondary"
                    onClick={handleReset}
                    style={{ fontSize: 'var(--font-size-base)', width: '100%' }}
                  >
                    <FontAwesomeIcon icon={faSyncAlt} className="me-1" />
                    Reset
                  </Button>
                </Col>
              </Row>
            </Form>
          </div>

          {/* Content */}
          {!hasSearched ? (
            <div
              className="text-center py-5"
              style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-base)' }}
            >
              Select a date and click Submit to view the stock reorder level report.
            </div>
          ) : isLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" size="sm" className="me-2" />
              <span style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-muted)' }}>
                Loading stock data...
              </span>
            </div>
          ) : (
            <>
              {/* Report heading + toolbar */}
              <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                <div
                  style={{
                    background: 'var(--table-header-bg)',
                    color: 'var(--table-header-text)',
                    borderRadius: 'var(--border-radius-sm)',
                    padding: '8px 18px',
                    fontSize: 'var(--font-size-base)',
                    fontWeight: 'var(--font-weight-semibold)',
                  }}
                >
                  STOCK REPORT WITH RE ORDER LEVEL ON ({fmtDate(reportDate)})
                </div>
                <div className="d-flex gap-2 align-items-center">
                  <SearchInput
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    placeholder="Search product name..."
                    resultCount={resultCount}
                    totalCount={totalCount}
                  />
                  <Button
                    size="sm"
                    variant="success"
                    disabled={filteredData.length === 0}
                    onClick={handleExportExcel}
                    style={{ fontSize: 'var(--font-size-base)', whiteSpace: 'nowrap' }}
                  >
                    <FontAwesomeIcon icon={faFileExcel} className="me-1" />
                    Export Excel
                  </Button>
                </div>
              </div>

              {/* Table */}
              <div
                className="table-responsive"
                style={{ maxHeight: '62vh', overflowY: 'auto' }}
              >
                <Table
                  bordered
                  size="sm"
                  className="mb-0"
                  style={{ fontSize: 'var(--font-size-base)' }}
                >
                  <thead>
                    <tr
                      style={{
                        background: 'var(--table-header-bg)',
                        color: 'var(--table-header-text)',
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: 'var(--font-weight-semibold)',
                        position: 'sticky',
                        top: 0,
                        zIndex: 1,
                      }}
                    >
                      <th style={{ width: '60px' }} className="text-center">S.No</th>
                      <th>Product Name</th>
                      <th style={{ width: '100px' }} className="text-center">Stock</th>
                      <th style={{ width: '130px' }} className="text-center">Reorder Level</th>
                      <th style={{ width: '90px' }} className="text-center">Min</th>
                      <th style={{ width: '90px' }} className="text-center">Max</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center"
                          style={{ color: 'var(--color-muted)', padding: '32px' }}
                        >
                          {rows.length === 0
                            ? 'No products found.'
                            : 'No results match your search.'}
                        </td>
                      </tr>
                    ) : (
                      filteredData.map((row, idx) => {
                        const belowReorder = row.stock <= row.reorderLevel;
                        const belowMin = row.stock <= row.min;
                        return (
                          <tr
                            key={row.id}
                            style={
                              belowMin
                                ? { background: '#fff5f5' }
                                : belowReorder
                                ? { background: '#fffbea' }
                                : undefined
                            }
                          >
                            <td className="text-center">{idx + 1}</td>
                            <td style={{ fontWeight: 'var(--font-weight-medium)' }}>
                              {row.productName}
                            </td>
                            <td
                              className="text-center"
                              style={
                                belowMin
                                  ? { color: 'var(--color-danger)', fontWeight: 'var(--font-weight-semibold)' }
                                  : belowReorder
                                  ? { color: '#856404', fontWeight: 'var(--font-weight-semibold)' }
                                  : undefined
                              }
                            >
                              {row.stock}
                            </td>
                            <td className="text-center">{row.reorderLevel}</td>
                            <td className="text-center">{row.min}</td>
                            <td className="text-center">{row.max}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                  {filteredData.length > 0 && (
                    <tfoot style={{ position: 'sticky', bottom: 0, zIndex: 1 }}>
                      <tr
                        style={{
                          background: 'var(--bs-light, #f8f9fa)',
                          fontWeight: 'var(--font-weight-semibold)',
                          fontSize: 'var(--font-size-sm)',
                          boxShadow: '0 -2px 4px rgba(0,0,0,0.08)',
                        }}
                      >
                        <td colSpan={2} className="text-end">
                          Total ({filteredData.length} product
                          {filteredData.length !== 1 ? 's' : ''})
                        </td>
                        <td className="text-center">
                          {filteredData.reduce((s, r) => s + r.stock, 0)}
                        </td>
                        <td colSpan={3}></td>
                      </tr>
                    </tfoot>
                  )}
                </Table>
              </div>

              {/* Legend */}
              <div
                className="d-flex gap-3 mt-2"
                style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)' }}
              >
                <span>
                  <span
                    style={{
                      display: 'inline-block',
                      width: '12px',
                      height: '12px',
                      background: '#fff5f5',
                      border: '1px solid #f5c2c7',
                      marginRight: '4px',
                    }}
                  />
                  Stock ≤ Min
                </span>
                <span>
                  <span
                    style={{
                      display: 'inline-block',
                      width: '12px',
                      height: '12px',
                      background: '#fffbea',
                      border: '1px solid #ffe08a',
                      marginRight: '4px',
                    }}
                  />
                  Stock ≤ Reorder Level
                </span>
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default StockReorderLevel;
