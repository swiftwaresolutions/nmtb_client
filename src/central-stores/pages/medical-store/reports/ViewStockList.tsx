import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge, Card, Spinner, Table } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import {
  CentralStoresApiService,
  GenericGroupResponse,
  ProductResponse,
  BatchDetail,
} from '../../../../api/central-stores/central-stores-api-service';
import PageHeader from '../../../../components/PageHeader';
import SearchInput from '../../../../components/SearchInput';
import { faBoxesStacked } from '@fortawesome/free-solid-svg-icons';
import { handleError } from '../../../../utils/errorUtil';
import { showErrorToast } from '../../../../utils/alertUtil';
import { useTableSearch } from '../../../../hooks/useTableSearch';

// ── Types ──────────────────────────────────────────────────────────────────

interface BatchDetailWithStock extends BatchDetail {
  stock: number;
}

interface EnrichedProduct {
  product: ProductResponse;
  productName: string;
  groupName: string;
  totalStock: number;
  costValue: number;
  mrpValue: number;
  batches: BatchDetailWithStock[];
  hasExpiryWarning: boolean;
  hasExpiredBatch: boolean;
}

type Screen = 'products' | 'batches';

// ── Constants ──────────────────────────────────────────────────────────────

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const EXPIRY_WARN_DAYS = 30;

const centralStoresApi = new CentralStoresApiService();

// ── Session storage helper (mirrors existing pattern) ──────────────────────

const getStoreData = (): { masterId: number } | null => {
  const centralStoresData = sessionStorage.getItem('selectedStore');
  if (centralStoresData) return JSON.parse(centralStoresData);

  const pharmacyData = sessionStorage.getItem('pharmacySubModuleData');
  if (pharmacyData) {
    const parsed = JSON.parse(pharmacyData);
    return { ...parsed, masterId: parsed.masterId ?? 0 };
  }
  return null;
};

// ── Stock color helper ─────────────────────────────────────────────────────

const getStockStyle = (stock: number, min: number): React.CSSProperties => {
  if (stock === 0) return { color: 'var(--color-danger)', fontWeight: 'var(--font-weight-semibold)' };
  if (stock <= min) return { color: '#fd7e14', fontWeight: 'var(--font-weight-semibold)' };
  return { color: 'var(--color-success)', fontWeight: 'var(--font-weight-semibold)' };
};

// ── Component ──────────────────────────────────────────────────────────────

export default function ViewStockList() {
  const dispatch = useDispatch();

  const [screen, setScreen] = useState<Screen>('products');
  const [selectedLetter, setSelectedLetter] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<EnrichedProduct | null>(null);

  const [allProducts, setAllProducts] = useState<ProductResponse[]>([]);
  const [genericGroups, setGenericGroups] = useState<GenericGroupResponse[]>([]);
  const [enrichedProducts, setEnrichedProducts] = useState<EnrichedProduct[]>([]);

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingLetter, setLoadingLetter] = useState(false);

  // Search on Screen 2
  const { filteredData, searchTerm, setSearchTerm, resultCount, totalCount } = useTableSearch({
    data: enrichedProducts,
    searchFields: ['productName', 'groupName'],
  });

  // ── Computed ─────────────────────────────────────────────────────────────

  const availableLetters = useMemo(
    () =>
      new Set(
        allProducts
          .map((p) => (p.name || '').toUpperCase().charAt(0))
          .filter((c) => /[A-Z]/.test(c))
      ),
    [allProducts]
  );

  const letterCountMap = useMemo(() => {
    const map = new Map<string, number>();
    allProducts.forEach((p) => {
      const first = (p.name || '').toUpperCase().charAt(0);
      if (/[A-Z]/.test(first)) map.set(first, (map.get(first) || 0) + 1);
    });
    return map;
  }, [allProducts]);

  const totals = useMemo(
    () => ({
      stock: filteredData.reduce((s, ep) => s + ep.totalStock, 0),
      costValue: filteredData.reduce((s, ep) => s + ep.costValue, 0),
      mrpValue: filteredData.reduce((s, ep) => s + ep.mrpValue, 0),
    }),
    [filteredData]
  );

  // ── Initial data load ────────────────────────────────────────────────────

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingInitial(true);
        const storeData = getStoreData();
        const phModId = storeData?.masterId ?? 0;

        const [products, groups] = await Promise.all([
          centralStoresApi.fetchAllProducts(phModId),
          centralStoresApi.fetchAllGenericGroups(),
        ]);

        setAllProducts(Array.isArray(products) ? products : []);
        setGenericGroups(Array.isArray(groups) ? groups : []);
      } catch (error) {
        handleError(dispatch, error);
        showErrorToast('Failed to load product data');
      } finally {
        setLoadingInitial(false);
      }
    };
    load();
  }, []);

  // ── Letter selection ─────────────────────────────────────────────────────

  const handleLetterClick = useCallback(
    async (letter: string) => {
      if (!availableLetters.has(letter)) return;

      setSelectedLetter(letter);
      setScreen('products');
      setSearchTerm('');

      const filtered = allProducts.filter((p) =>
        (p.name || '').toUpperCase().startsWith(letter)
      );

      if (filtered.length === 0) {
        setEnrichedProducts([]);
        return;
      }

      const storeData = getStoreData();
      const storeId = storeData?.masterId ?? 0;

      const groupMap = new Map<number, string>();
      genericGroups.forEach((g) => groupMap.set(g.id, g.name));

      const today = new Date();
      const warnDate = new Date(today.getTime() + EXPIRY_WARN_DAYS * 24 * 60 * 60 * 1000);

      setLoadingLetter(true);
      try {
        const enriched = await Promise.all(
          filtered.map(async (p) => {
            let totalStock = 0;
            let costValue = 0;
            let mrpValue = 0;
            let batchesWithStock: BatchDetailWithStock[] = [];

            try {
              const batches = await centralStoresApi.fetchBatchDetailsByProdsId(p.id, storeId);
              if (Array.isArray(batches) && batches.length > 0) {
                const stockArr = await Promise.all(
                  batches.map((b) =>
                    centralStoresApi.fetchAvailableStock(b.batchId, storeId).catch(() => 0)
                  )
                );
                batchesWithStock = batches.map((b, i) => ({ ...b, stock: stockArr[i] ?? 0 }));
                totalStock = stockArr.reduce((sum, s) => sum + s, 0);
                costValue = batchesWithStock.reduce((sum, b) => sum + b.stock * b.salesPrice, 0);
                mrpValue = batchesWithStock.reduce((sum, b) => sum + b.stock * b.mrp, 0);
              }
            } catch {
              totalStock = p.ownStock || 0;
            }

            const hasExpiryWarning = batchesWithStock.some((b) => {
              const exp = new Date(b.expiryDate);
              return exp >= today && exp <= warnDate;
            });
            const hasExpiredBatch = batchesWithStock.some((b) => new Date(b.expiryDate) < today);

            return {
              product: p,
              productName: p.name || '',
              groupName: groupMap.get(p.groupId) || '-',
              totalStock,
              costValue,
              mrpValue,
              batches: batchesWithStock,
              hasExpiryWarning,
              hasExpiredBatch,
            };
          })
        );

        setEnrichedProducts(enriched);
      } catch (error) {
        handleError(dispatch, error);
        showErrorToast('Failed to load stock data');
      } finally {
        setLoadingLetter(false);
      }
    },
    [allProducts, genericGroups, availableLetters]
  );

  // ── Product click ────────────────────────────────────────────────────────

  const handleProductClick = useCallback((ep: EnrichedProduct) => {
    setSelectedProduct(ep);
    setScreen('batches');
  }, []);

  // ── Breadcrumb ────────────────────────────────────────────────────────────

  const renderBreadcrumb = () => (
    <nav style={{ fontSize: 'var(--font-size-sm)', marginBottom: '10px', color: '#6c757d' }}>
      <span
        onClick={() => { setScreen('products'); setSelectedLetter(''); setEnrichedProducts([]); }}
        style={{ cursor: 'pointer', color: 'var(--btn-primary)' }}
      >
        Stock List
      </span>
      {selectedLetter && (
        <>
          <span className="mx-2">›</span>
          <span
            onClick={() => screen === 'batches' ? setScreen('products') : undefined}
            style={{
              cursor: screen === 'batches' ? 'pointer' : 'default',
              color: screen === 'batches' ? 'var(--btn-primary)' : 'var(--text-primary)',
              fontWeight: screen === 'products' ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)',
            }}
          >
            {selectedLetter}
          </span>
        </>
      )}
      {screen === 'batches' && selectedProduct && (
        <>
          <span className="mx-2">›</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 'var(--font-weight-semibold)' }}>
            {selectedProduct.product.name}
          </span>
        </>
      )}
    </nav>
  );

  // ── Compact letter bar (Screens 2 & 3) ───────────────────────────────────

  const renderCompactLetterBar = () => (
    <div
      style={{
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        paddingBottom: '8px',
        marginBottom: '14px',
        borderBottom: '1px solid #dee2e6',
      }}
    >
      {LETTERS.map((letter) => {
        const active = availableLetters.has(letter);
        const isSelected = letter === selectedLetter;
        return (
          <button
            key={letter}
            onClick={() => active && handleLetterClick(letter)}
            disabled={!active}
            title={active ? `${letterCountMap.get(letter) || 0} products` : 'No products'}
            style={{
              display: 'inline-block',
              width: '32px',
              height: '32px',
              margin: '0 2px',
              border: isSelected ? '2px solid var(--btn-primary)' : '1px solid transparent',
              borderRadius: 'var(--border-radius-sm)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: isSelected ? 'var(--font-weight-bold)' : 'var(--font-weight-normal)',
              cursor: active ? 'pointer' : 'not-allowed',
              backgroundColor: isSelected ? 'var(--btn-primary)' : active ? '#e8f0fb' : '#f4f4f4',
              color: isSelected ? '#fff' : active ? 'var(--btn-primary)' : '#adb5bd',
              transition: 'var(--transition-normal)',
            }}
          >
            {letter}
          </button>
        );
      })}
    </div>
  );

  // ── Screen 2 : Product list ──────────────────────────────────────────────

  const renderProductList = () => (
    <div>
      {renderBreadcrumb()}
      {renderCompactLetterBar()}

      <div className="mb-3">
        <SearchInput
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Search by product name or group…"
          resultCount={resultCount}
          totalCount={totalCount}
        />
      </div>

      {loadingLetter ? (
        <div className="text-center py-5">
          <Spinner animation="border" className="me-2" />
          <span style={{ fontSize: 'var(--font-size-base)' }}>Loading stock data…</span>
        </div>
      ) : enrichedProducts.length === 0 && !selectedLetter ? (
        <div className="text-center py-5" style={{ color: '#6c757d', fontSize: 'var(--font-size-base)' }}>
          Select a letter above to view products
        </div>
      ) : enrichedProducts.length === 0 ? (
        <div className="text-center py-5" style={{ color: '#6c757d', fontSize: 'var(--font-size-base)' }}>
          No products found for &ldquo;{selectedLetter}&rdquo;
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <Table bordered hover className="mb-0">
            <thead
              style={{
                backgroundColor: 'var(--table-header-bg)',
                color: 'var(--table-header-text)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-semibold)',
              }}
            >
              <tr>
                <th style={{ width: '60px' }}>S.No</th>
                <th>Product Name</th>
                <th>Group Name</th>
                <th className="text-end" style={{ width: '100px' }}>Stock</th>
                <th className="text-end" style={{ width: '130px' }}>Cost Value</th>
                <th className="text-end" style={{ width: '130px' }}>MRP Value</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((ep, idx) => (
                <tr key={ep.product.id}>
                  <td className="text-center" style={{ fontSize: 'var(--font-size-sm)' }}>
                    {idx + 1}
                  </td>
                  <td>
                    <button
                      onClick={() => handleProductClick(ep)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        color: 'var(--btn-primary)',
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: 'var(--font-weight-medium)',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        textUnderlineOffset: '2px',
                      }}
                    >
                      {ep.product.name}
                    </button>
                    {ep.hasExpiredBatch && (
                      <Badge bg="danger" className="ms-2" style={{ fontSize: 'var(--font-size-xs)' }}>
                        Expired
                      </Badge>
                    )}
                    {!ep.hasExpiredBatch && ep.hasExpiryWarning && (
                      <Badge bg="warning" text="dark" className="ms-2" style={{ fontSize: 'var(--font-size-xs)' }}>
                        ⚠ Expiring
                      </Badge>
                    )}
                  </td>
                  <td style={{ fontSize: 'var(--font-size-sm)' }}>{ep.groupName}</td>
                  <td
                    className="text-end"
                    style={{ fontSize: 'var(--font-size-sm)', ...getStockStyle(ep.totalStock, ep.product.min) }}
                  >
                    {ep.totalStock}
                  </td>
                  <td className="text-end" style={{ fontSize: 'var(--font-size-sm)' }}>
                    {ep.costValue.toFixed(2)}
                  </td>
                  <td className="text-end" style={{ fontSize: 'var(--font-size-sm)' }}>
                    {ep.mrpValue.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr
                style={{
                  backgroundColor: 'var(--table-header-bg)',
                  fontWeight: 'var(--font-weight-semibold)',
                  fontSize: 'var(--font-size-sm)',
                }}
              >
                <td colSpan={3} className="text-end">
                  Total ({filteredData.length} items)
                </td>
                <td className="text-end"></td>
                <td className="text-end">{totals.costValue.toFixed(2)}</td>
                <td className="text-end">{totals.mrpValue.toFixed(2)}</td>
              </tr>
            </tfoot>
          </Table>
        </div>
      )}
    </div>
  );

  // ── Screen 3 : Batch details ─────────────────────────────────────────────

  const renderBatchDetails = () => {
    if (!selectedProduct) return null;
    const { product, batches } = selectedProduct;
    const today = new Date();
    const warnDate = new Date(today.getTime() + EXPIRY_WARN_DAYS * 24 * 60 * 60 * 1000);

    return (
      <div>
        {renderBreadcrumb()}
        {renderCompactLetterBar()}

        <div className="d-flex align-items-center flex-wrap gap-2 mb-3">
          <Badge
            bg="success"
            style={{ fontSize: 'var(--font-size-sm)', padding: '0.4em 0.75em' }}
          >
            {product.name}
          </Badge>
          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>
            {batches.length} batch(es)
          </span>
        </div>

        {batches.length === 0 ? (
          <div className="text-center py-5" style={{ color: '#6c757d', fontSize: 'var(--font-size-base)' }}>
            No batch details available for this product.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <Table bordered hover className="mb-0">
              <thead
                style={{
                  backgroundColor: 'var(--table-header-bg)',
                  color: 'var(--table-header-text)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-semibold)',
                }}
              >
                <tr>
                  <th style={{ width: '60px' }}>S.No</th>
                  <th>Batch No</th>
                  <th className="text-end" style={{ width: '120px' }}>Cost Price</th>
                  <th className="text-end" style={{ width: '120px' }}>MRP</th>
                  <th className="text-end" style={{ width: '100px' }}>Stock</th>
                  <th style={{ width: '180px' }}>Expiry Date</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((batch, idx) => {
                  const expDate = new Date(batch.expiryDate);
                  const isExpired = expDate < today;
                  const isExpiring = !isExpired && expDate <= warnDate;
                  return (
                    <tr
                      key={batch.batchId}
                      style={isExpired ? { backgroundColor: '#fff3cd' } : undefined}
                    >
                      <td className="text-center" style={{ fontSize: 'var(--font-size-sm)' }}>
                        {idx + 1}
                      </td>
                      <td
                        style={{
                          fontSize: 'var(--font-size-sm)',
                          fontWeight: 'var(--font-weight-medium)',
                        }}
                      >
                        {batch.batchNo}
                      </td>
                      <td className="text-end" style={{ fontSize: 'var(--font-size-sm)' }}>
                        {batch.salesPrice.toFixed(2)}
                      </td>
                      <td className="text-end" style={{ fontSize: 'var(--font-size-sm)' }}>
                        {batch.mrp.toFixed(2)}
                      </td>
                      <td
                        className="text-end"
                        style={{ fontSize: 'var(--font-size-sm)', ...getStockStyle(batch.stock, 0) }}
                      >
                        {batch.stock}
                      </td>
                      <td style={{ fontSize: 'var(--font-size-sm)' }}>
                        {batch.expiryDate}
                        {isExpired && (
                          <Badge bg="danger" className="ms-2" style={{ fontSize: 'var(--font-size-xs)' }}>
                            Expired
                          </Badge>
                        )}
                        {isExpiring && (
                          <Badge bg="warning" text="dark" className="ms-2" style={{ fontSize: 'var(--font-size-xs)' }}>
                            ⚠ Expiring
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}
      </div>
    );
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        padding: '1.5rem',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}
    >
      <PageHeader
        icon={faBoxesStacked}
        title="Stock List"
        subtitle="Browse products by letter and view batch details"
      />

      <Card className="shadow-sm flex-grow-1" style={{ minHeight: 0 }}>
        <Card.Body style={{ overflowY: 'auto' }}>
          {screen === 'products' && renderProductList()}
          {screen === 'batches' && renderBatchDetails()}
        </Card.Body>
      </Card>
    </div>
  );
}
