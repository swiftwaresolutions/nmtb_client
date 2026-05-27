import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Form, Row, Spinner, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronRight, faFileInvoiceDollar, faReceipt, faSearch } from '@fortawesome/free-solid-svg-icons';
import {
  CentralStoresApiService,
  DealerResponse,
  GoodsReceiptDetailsResponse,
  GoodsReceiptProductDetail,
} from '../../../../api/central-stores/central-stores-api-service';
import PageHeader from '../../../../components/PageHeader';
import SearchInput from '../../../../components/SearchInput';
import { useTableSearch } from '../../../../hooks/useTableSearch';
import { showErrorToast, showValidationError } from '../../../../utils/alertUtil';

const centralStoresApi = new CentralStoresApiService();

interface GrnRow {
  grId: number;
  grNo: string;
  grDate: string;
  dealerName: string;
  totalAmount: number;
  productDetails: GoodsReceiptProductDetail[];
}

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
    // ignore parse errors
  }
  return { masterId: 0 };
};

const SupwiseGoodsReceipt: React.FC = () => {
  const [suppliers, setSuppliers] = useState<DealerResponse[]>([]);
  const [selectedDealId, setSelectedDealId] = useState<number>(0);
  const today = new Date().toISOString().split('T')[0];
  const [dateFrom, setDateFrom] = useState<string>(today);
  const [dateTo, setDateTo] = useState<string>(today);
  const [grnRows, setGrnRows] = useState<GrnRow[]>([]);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRow = (grId: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      next.has(grId) ? next.delete(grId) : next.add(grId);
      return next;
    });
  };

  const { filteredData, searchTerm, setSearchTerm, resultCount, totalCount } =
    useTableSearch({ data: grnRows, searchFields: ['grNo', 'dealerName'] });

  useEffect(() => {
    const loadSuppliers = async () => {
      setIsLoadingSuppliers(true);
      try {
        const { masterId } = getStoreData();
        const data = await centralStoresApi.fetchDealersByStoreId(masterId);
        setSuppliers(data.filter((d) => d.isActive !== 0));
      } catch {
        showErrorToast('Failed to load suppliers');
      } finally {
        setIsLoadingSuppliers(false);
      }
    };
    loadSuppliers();
  }, []);

  const handleSearch = async () => {
    if (!selectedDealId) {
      showValidationError('Please select a supplier');
      return;
    }
    if (!dateFrom) {
      showValidationError('Please select a Date From');
      return;
    }
    if (!dateTo) {
      showValidationError('Please select a Date To');
      return;
    }
    if (dateTo < dateFrom) {
      showValidationError('Date To must be on or after Date From');
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    try {
      const { masterId } = getStoreData();
      const data: GoodsReceiptDetailsResponse[] =
        await centralStoresApi.fetchGoodsReceiptDetailsBySupplier(
          selectedDealId,
          dateFrom,
          dateTo,
          masterId
        );
      const rows: GrnRow[] = data.map((item) => ({
        grId: item.grId,
        grNo: item.grNo,
        grDate: item.grDate,
        dealerName: item.dealerName,
        productDetails: item.productDetails ?? [],
        totalAmount: (item.productDetails ?? []).reduce(
          (sum, p) => sum + p.receivedQty * p.rate,
          0
        ),
      }));
      setGrnRows(rows);
      setExpandedRows(new Set());
    } catch {
      showErrorToast('Failed to fetch goods receipt details');
    } finally {
      setIsSearching(false);
    }
  };

  const grandTotal = filteredData.reduce((sum, row) => sum + row.totalAmount, 0);

  return (
    <div>
      <PageHeader title="Supplier Wise Goods Receipt" subtitle="View goods receipts by supplier and date range" icon={faReceipt} />
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
            <Col md={4}>
              <Form.Group>
                <Form.Label
                  style={{
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-weight-medium)',
                  }}
                >
                  Supplier
                </Form.Label>
                <Form.Select
                  value={selectedDealId}
                  onChange={(e) => setSelectedDealId(Number(e.target.value))}
                  disabled={isLoadingSuppliers}
                  style={{ fontSize: 'var(--font-size-sm)' }}
                >
                  <option value={0}>
                    {isLoadingSuppliers ? 'Loading...' : '-- Select Supplier --'}
                  </option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
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
                  Date From
                </Form.Label>
                <Form.Control
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  style={{ fontSize: 'var(--font-size-sm)' }}
                />
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
                  Date To
                </Form.Label>
                <Form.Control
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  style={{ fontSize: 'var(--font-size-sm)' }}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Button
                onClick={handleSearch}
                disabled={isSearching}
                style={{
                  background: 'var(--btn-primary)',
                  border: 'none',
                  fontSize: 'var(--font-size-sm)',
                  width: '100%',
                }}
              >
                {isSearching ? (
                  <>
                    <Spinner size="sm" animation="border" className="me-1" />
                    Searching...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSearch} className="me-1" />
                    Search
                  </>
                )}
              </Button>
            </Col>
          </Row>
          </div>

          {/* Summary stats + Search input */}
          {hasSearched && !isSearching && grnRows.length > 0 && (
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
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <FontAwesomeIcon icon={faFileInvoiceDollar} />
                    {grnRows.length} Bill{grnRows.length !== 1 ? 's' : ''} Found
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
                    Grand Total: ₹{grandTotal.toFixed(2)}
                  </div>
                </Col>
              </Row>
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                <SearchInput
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  placeholder="Search by bill no, supplier..."
                  resultCount={resultCount}
                  totalCount={totalCount}
                />
                <span
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-muted)',
                    fontStyle: 'italic',
                  }}
                >
                  Click any row to view medicine details
                </span>
              </div>
            </div>
          )}

          {/* Results */}
          {hasSearched &&
            (isSearching ? (
              <div className="text-center py-5">
                <Spinner animation="border" />
                <div
                  className="mt-2"
                  style={{
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-muted)',
                  }}
                >
                  Loading goods receipts...
                </div>
              </div>
            ) : filteredData.length === 0 ? (
              <div
                className="text-center py-5"
                style={{
                  color: 'var(--color-muted)',
                  fontSize: 'var(--font-size-sm)',
                }}
              >
                No goods receipt records found for the selected criteria.
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
                      <th>Bill No</th>
                      <th className="text-end">Total Amount</th>
                      <th>Date</th>
                      <th>User Name</th>
                    </tr>
                  </thead>
                  <tbody style={{ fontSize: 'var(--font-size-sm)' }}>
                    {filteredData.map((row, index) => {
                      const isExpanded = expandedRows.has(row.grId);
                      return (
                        <React.Fragment key={row.grId}>
                          <tr
                            onClick={() => toggleRow(row.grId)}
                            style={{
                              cursor: 'pointer',
                              background: isExpanded ? 'var(--table-header-bg)' : undefined,
                              color: isExpanded ? 'var(--table-header-text)' : undefined,
                              fontWeight: 'var(--font-weight-semibold)',
                              borderLeft: isExpanded ? '3px solid var(--btn-primary)' : '3px solid transparent',
                              transition: 'var(--transition-normal)',
                            }}
                          >
                            <td>
                              <FontAwesomeIcon
                                icon={isExpanded ? faChevronDown : faChevronRight}
                                style={{ marginRight: '6px', fontSize: 'var(--font-size-xs)' }}
                              />
                              {index + 1}
                            </td>
                            <td>{row.grNo}</td>
                            <td className="text-end">{row.totalAmount.toFixed(2)}</td>
                            <td>{row.grDate}</td>
                            <td>{row.dealerName}</td>
                          </tr>
                          {isExpanded && (
                            <tr>
                              <td style={{ borderLeft: '3px solid var(--btn-primary)', background: 'var(--bs-light, #f8f9fa)' }}></td>
                              <td colSpan={4} style={{ padding: '0 0 10px 0', background: 'var(--bs-light, #f8f9fa)' }}>
                                <Table
                                  bordered
                                  size="sm"
                                  className="mb-0"
                                  style={{ background: '#fff' }}
                                >
                                  <thead>
                                    <tr style={{ background: 'var(--table-header-bg)', color: 'var(--table-header-text)', fontSize: 'var(--font-size-xs)' }}>
                                      <th className="text-center" style={{ width: '60px' }}>S.No</th>
                                      <th className="text-center">Medicine Name</th>
                                      <th className="text-center">Batch No</th>
                                      <th className="text-center">Quantity</th>
                                      <th className="text-center">Rate</th>
                                    </tr>
                                  </thead>
                                  <tbody style={{ fontSize: 'var(--font-size-xs)' }}>
                                    {row.productDetails.length === 0 ? (
                                      <tr>
                                        <td colSpan={5} className="text-center" style={{ color: 'var(--color-muted)', padding: '8px' }}>
                                          No product details available
                                        </td>
                                      </tr>
                                    ) : (
                                      row.productDetails.map((p, pIdx) => (
                                        <tr key={pIdx} style={{ background: pIdx % 2 === 0 ? '#fff' : 'var(--bs-light, #f8f9fa)' }}>
                                          <td className="text-center">{pIdx + 1}</td>
                                          <td>{p.prodsName}</td>
                                          <td className="text-center">{p.batchNo}</td>
                                          <td className="text-center">{p.receivedQty}</td>
                                          <td className="text-end">{p.rate.toFixed(2)}</td>
                                        </tr>
                                      ))
                                    )}
                                  </tbody>
                                </Table>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr
                      style={{
                        fontWeight: 'var(--font-weight-semibold)',
                        background: 'var(--table-header-bg)',
                        color: 'var(--table-header-text)',
                        fontSize: 'var(--font-size-sm)',
                      }}
                    >
                      <td colSpan={2}>
                        TOTAL ({filteredData.length} record
                        {filteredData.length !== 1 ? 's' : ''})
                      </td>
                      <td className="text-end">{grandTotal.toFixed(2)}</td>
                      <td colSpan={2}></td>
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

export default SupwiseGoodsReceipt;
