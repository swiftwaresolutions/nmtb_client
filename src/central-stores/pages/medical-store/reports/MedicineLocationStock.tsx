import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card, Col, Row, Spinner, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBoxesStacked, faPrint, faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import ReactToPrint from 'react-to-print';
import {
  CentralStoresApiService,
  ProductResponse,
} from '../../../../api/central-stores/central-stores-api-service';
import PageHeader from '../../../../components/PageHeader';
import SearchInput from '../../../../components/SearchInput';
import { useTableSearch } from '../../../../hooks/useTableSearch';
import { showErrorToast } from '../../../../utils/alertUtil';

const centralStoresApi = new CentralStoresApiService();
const LETTERS = ['All', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

interface LocationRow {
  id: number;
  productName: string;
  stock: number;
  shelf: number;
  rack: string;
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

const MedicineLocationStock: React.FC = () => {
  const [allProducts, setAllProducts] = useState<ProductResponse[]>([]);
  const [rows, setRows] = useState<LocationRow[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingStock, setIsLoadingStock] = useState(false);
  const [activeLetter, setActiveLetter] = useState<string>('A');
  const printRef = useRef<HTMLDivElement>(null);

  const letterCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of allProducts) {
      const first = p.name?.[0]?.toUpperCase() ?? '#';
      map.set(first, (map.get(first) ?? 0) + 1);
    }
    return map;
  }, [allProducts]);

  // Load all products once on mount
  useEffect(() => {
    const load = async () => {
      setIsLoadingProducts(true);
      try {
        const { phModId } = getStoreData();
        const products = await centralStoresApi.fetchAllProducts(phModId);
        const active = products.filter((p) => p.isactive !== 'N');
        active.sort((a, b) => a.name.localeCompare(b.name));
        setAllProducts(active);
      } catch {
        showErrorToast('Failed to load products');
      } finally {
        setIsLoadingProducts(false);
      }
    };
    load();
  }, []);

  // Load stock for the selected letter group
  const loadStockForLetter = useCallback(
    async (letter: string) => {
      if (allProducts.length === 0) return;
      const filtered =
        letter === 'All'
          ? allProducts
          : allProducts.filter((p) => p.name?.[0]?.toUpperCase() === letter);

      setIsLoadingStock(true);
      setRows([]);
      try {
        const { masterId } = getStoreData();
        const result = await Promise.all(
          filtered.map(async (p) => {
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
              shelf: p.shelf,
              rack: p.rack,
            } as LocationRow;
          })
        );
        setRows(result);
      } catch {
        showErrorToast('Failed to load stock data');
      } finally {
        setIsLoadingStock(false);
      }
    },
    [allProducts]
  );

  useEffect(() => {
    if (allProducts.length > 0) {
      loadStockForLetter(activeLetter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLetter, allProducts]);

  const { filteredData, searchTerm, setSearchTerm, resultCount, totalCount } =
    useTableSearch({
      data: rows,
      searchFields: ['productName', 'rack'],
    });

  const isLoading = isLoadingProducts || isLoadingStock;
  const totalStockCount = filteredData.reduce((sum, r) => sum + r.stock, 0);

  return (
    <div>
      <PageHeader
        icon={faBoxesStacked}
        title="Medicine Location Stock"
        subtitle="Browse product shelf and rack locations with current stock levels"
      />

      <Card className="shadow-sm border-0">
        <Card.Body>
          {/* A–Z Letter bar */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '4px',
              marginBottom: '20px',
              padding: '12px 16px',
              background: 'var(--bs-light, #f8f9fa)',
              borderRadius: 'var(--border-radius-sm)',
              border: '1px solid var(--bs-border-color, #dee2e6)',
            }}
          >
            {LETTERS.map((letter) => {
              const count =
                letter === 'All' ? allProducts.length : (letterCounts.get(letter) ?? 0);
              const isActive = activeLetter === letter;
              const hasItems = count > 0;
              return (
                <button
                  key={letter}
                  disabled={!hasItems || isLoadingStock}
                  onClick={() => setActiveLetter(letter)}
                  title={hasItems ? `${count} product${count !== 1 ? 's' : ''}` : 'No products'}
                  style={{
                    minWidth: '34px',
                    height: '34px',
                    padding: '0 6px',
                    border: isActive
                      ? 'none'
                      : '1px solid var(--bs-border-color, #dee2e6)',
                    borderRadius: 'var(--border-radius-sm)',
                    cursor: hasItems && !isLoadingStock ? 'pointer' : 'not-allowed',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: isActive
                      ? 'var(--font-weight-bold)'
                      : 'var(--font-weight-normal)',
                    background: isActive
                      ? 'var(--table-header-bg)'
                      : hasItems
                      ? 'white'
                      : 'transparent',
                    color: isActive
                      ? 'var(--table-header-text)'
                      : hasItems
                      ? 'inherit'
                      : 'var(--color-muted)',
                    transition: 'var(--transition-normal)',
                  }}
                >
                  {letter}
                </button>
              );
            })}
          </div>

          {/* Search + Print toolbar */}
          <Row className="g-2 align-items-center mb-3">
            <Col>
              <SearchInput
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                placeholder="Search by product name or rack..."
                resultCount={resultCount}
                totalCount={totalCount}
              />
            </Col>
            <Col xs="auto" className="d-flex gap-2">
              <Button
                size="sm"
                variant="outline-secondary"
                disabled={isLoading}
                onClick={() => loadStockForLetter(activeLetter)}
                style={{ fontSize: 'var(--font-size-base)' }}
              >
                <FontAwesomeIcon icon={faSyncAlt} className="me-1" />
                Refresh
              </Button>
              <ReactToPrint
                trigger={() => (
                  <Button
                    size="sm"
                    disabled={rows.length === 0 || isLoading}
                    style={{
                      background: 'var(--btn-primary)',
                      border: 'none',
                      fontSize: 'var(--font-size-base)',
                    }}
                  >
                    <FontAwesomeIcon icon={faPrint} className="me-1" />
                    Print
                  </Button>
                )}
                content={() => printRef.current}
              />
            </Col>
          </Row>

          {/* Loading state */}
          {isLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" size="sm" className="me-2" />
              <span style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-muted)' }}>
                {isLoadingProducts ? 'Loading products...' : 'Loading stock data...'}
              </span>
            </div>
          ) : (
            /* Printable area */
            <div ref={printRef}>
              {/* Print-only header */}
              <div
                className="d-none d-print-block text-center mb-3"
                style={{
                  fontWeight: 'var(--font-weight-bold)',
                  fontSize: 'var(--font-size-lg)',
                }}
              >
                Medicine Location Stock —{' '}
                {activeLetter === 'All' ? 'All Products' : `Letter: ${activeLetter}`}
              </div>

              <div className="table-responsive">
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
                      }}
                    >
                      <th style={{ width: '60px' }} className="text-center">
                        Sl.No
                      </th>
                      <th>Product</th>
                      <th style={{ width: '110px' }} className="text-center">
                        Stock
                      </th>
                      <th style={{ width: '90px' }} className="text-center">
                        Shelf
                      </th>
                      <th style={{ width: '90px' }} className="text-center">
                        Rack
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="text-center"
                          style={{ color: 'var(--color-muted)', padding: '32px' }}
                        >
                          {rows.length === 0
                            ? 'No products found for this letter.'
                            : 'No results match your search.'}
                        </td>
                      </tr>
                    ) : (
                      filteredData.map((row, idx) => (
                        <tr key={row.id}>
                          <td className="text-center">{idx + 1}</td>
                          <td style={{ fontWeight: 'var(--font-weight-medium)' }}>
                            {row.productName}
                          </td>
                          <td className="text-center">{row.stock}</td>
                          <td className="text-center">{row.shelf || '—'}</td>
                          <td className="text-center">{row.rack || '—'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {filteredData.length > 0 && (
                    <tfoot>
                      <tr
                        style={{
                          background: 'var(--bs-light, #f8f9fa)',
                          fontWeight: 'var(--font-weight-semibold)',
                          fontSize: 'var(--font-size-sm)',
                        }}
                      >
                        <td colSpan={2} className="text-end">
                          Total ({filteredData.length} item
                          {filteredData.length !== 1 ? 's' : ''})
                        </td>
                        <td className="text-center">{totalStockCount}</td>
                        <td colSpan={2}></td>
                      </tr>
                    </tfoot>
                  )}
                </Table>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default MedicineLocationStock;
