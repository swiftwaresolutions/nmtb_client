import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Table, Button, Badge, Spinner, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBalanceScale, faSyncAlt, faSave } from '@fortawesome/free-solid-svg-icons';
import PageHeader from '../../../../../components/PageHeader';
import { useTableSearch } from '../../../../../hooks/useTableSearch';
import SearchInput from '../../../../../components/SearchInput';
import { showSuccessToast, showErrorToast, showValidationError } from '../../../../../utils/alertUtil';
import CentralStoresApiService, { ProductResponse, UpdateProductRequest } from '../../../../../api/central-stores/central-stores-api-service';

const apiService = new CentralStoresApiService();

const MinMaxOrder: React.FC = () => {
  const storeId = useMemo<number>(() => {
    try {
      const stored = sessionStorage.getItem('selectedStore');
      if (stored) return JSON.parse(stored).masterId || 1;
    } catch { /* fallback */ }
    return 1;
  }, []);

  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editValues, setEditValues] = useState<Record<number, { min: number; max: number }>>({});
  const [isSaving, setIsSaving] = useState<Record<number, boolean>>({});

  const { filteredData, searchTerm, setSearchTerm, resultCount, totalCount } = useTableSearch({
    data: products,
    searchFields: ['name', 'medCode'],
  });

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiService.fetchAllProducts(storeId);
      setProducts(data);
      const init: Record<number, { min: number; max: number }> = {};
      data.forEach(p => { init[p.id] = { min: p.min ?? 0, max: p.max ?? 0 }; });
      setEditValues(init);
    } catch {
      showErrorToast('Failed to load products.');
    } finally {
      setIsLoading(false);
    }
  }, [storeId]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const handleChange = (id: number, field: 'min' | 'max', val: string) => {
    const digits = val.replace(/[^0-9]/g, '');
    const parsed = digits === '' ? 0 : parseInt(digits, 10);
    setEditValues(prev => ({ ...prev, [id]: { ...prev[id], [field]: parsed } }));
  };

  const handleUpdate = async (product: ProductResponse) => {
    const vals = editValues[product.id];
    if (!vals) return;
    if (vals.max > 0 && vals.min > vals.max) {
      showValidationError('Min value cannot be greater than Max value.');
      return;
    }
    setIsSaving(prev => ({ ...prev, [product.id]: true }));
    try {
      const payload: UpdateProductRequest = {
        name: product.name,
        medCode: product.medCode,
        genericId: product.genericId,
        companyId: product.companyId,
        description: product.description,
        formId: product.formId,
        strength: product.strength,
        unitsId: product.unitsId,
        shelf: product.shelf,
        rack: product.rack,
        min: vals.min,
        max: vals.max,
        safe: product.safe,
        eoq: product.eoq,
        isNonStockable: product.isNonStockable,
        ownStock: product.ownStock,
        isactive: product.isactive,
        userlog: product.userlog,
        categoryId: product.categoryId,
        action: product.action,
        dosageOral: product.dosageOral,
        dosageIm: product.dosageIm,
        dosageIv: product.dosageIv,
        schedule: product.schedule,
        strips: product.strips,
        quantity: product.quantity,
        unitId: product.unitId,
        looseSale: product.looseSale,
        groupId: product.groupId,
        subDivId: product.subDivId,
        phModId: product.phModId,
        hsnCode: product.hsnCode,
        blockUid: product.blockUid,
        blockReason: product.blockReason,
      };
      await apiService.updateProduct(product.id, payload);
      showSuccessToast(`Min/Max updated for ${product.name}.`);
      setProducts(prev =>
        prev.map(p => p.id === product.id ? { ...p, min: vals.min, max: vals.max } : p)
      );
    } catch {
      showErrorToast('Failed to update min/max.');
    } finally {
      setIsSaving(prev => ({ ...prev, [product.id]: false }));
    }
  };

  const isDirty = (product: ProductResponse) => {
    const v = editValues[product.id];
    if (!v) return false;
    return v.min !== (product.min ?? 0) || v.max !== (product.max ?? 0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <PageHeader
        icon={faBalanceScale}
        title="Min Max Order"
        subtitle="Set minimum and maximum stock levels for medicines"
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
        <div className="card shadow-sm" style={{ borderRadius: '8px', overflow: 'hidden' }}>
          {/* Toolbar */}
          <div
            className="d-flex align-items-center justify-content-between flex-wrap gap-2 px-3 py-2 border-bottom"
            style={{ background: 'var(--table-header-bg)' }}
          >
            <div className="d-flex align-items-center gap-2">
              <FontAwesomeIcon
                icon={faBalanceScale}
                style={{ color: 'var(--page-secondary-color)', fontSize: 'var(--font-size-md)' }}
              />
              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)' }}>
                Medicine Min / Max Levels
              </span>
              <Badge
                className="theme-badge-secondary px-2 py-1"
                style={{ fontSize: 'var(--font-size-xs)' }}
              >
                {filteredData.length} of {totalCount}
              </Badge>
            </div>
            <div className="d-flex align-items-center gap-2">
              <div style={{ minWidth: 300 }}>
                <SearchInput
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  placeholder="Search medicine name, code..."
                  resultCount={resultCount}
                  totalCount={totalCount}
                />
              </div>
              <Button
                size="sm"
                className="theme-outline-btn-primary"
                onClick={loadProducts}
                disabled={isLoading}
              >
                <FontAwesomeIcon icon={faSyncAlt} className={isLoading ? 'fa-spin me-1' : 'me-1'} />
                Refresh
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" size="sm" style={{ color: 'var(--page-secondary-color)' }} />
              <p className="mt-2 mb-0 text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>Loading medicines...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <FontAwesomeIcon icon={faBalanceScale} size="3x" className="mb-3 opacity-25" />
              <p className="mb-0" style={{ fontSize: 'var(--font-size-sm)' }}>No medicines found.</p>
            </div>
          ) : (
            <div style={{ maxHeight: 'calc(100vh - 250px)', overflowY: 'auto' }}>
              <Table hover bordered className="mb-0 align-middle" style={{ minWidth: 700 }}>
                <thead style={{ background: 'var(--table-header-bg)', color: 'var(--table-header-text)', position: 'sticky', top: 0, zIndex: 1 }}>
                  <tr>
                    <th className="py-2 ps-4 text-uppercase small" style={{ width: '5%' }}>Sl</th>
                    <th className="py-2 text-uppercase small" style={{ width: '45%' }}>Medicine Name</th>
                    <th className="py-2 text-uppercase small" style={{ width: '18%' }}>Med Code</th>
                    <th className="py-2 text-center text-uppercase small" style={{ width: '12%' }}>Min</th>
                    <th className="py-2 text-center text-uppercase small" style={{ width: '12%' }}>Max</th>
                    <th className="py-2 text-center text-uppercase small" style={{ width: '8%' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((product, idx) => {
                    const dirty = isDirty(product);
                    const saving = isSaving[product.id];
                    const vals = editValues[product.id] ?? { min: 0, max: 0 };
                    const unset = (product.min ?? 0) === 0 && (product.max ?? 0) === 0;
                    return (
                      <tr
                        key={product.id}
                        style={{
                          background: dirty
                            ? 'rgba(0, 80, 171, 0.04)'
                            : unset
                            ? 'rgba(255, 193, 7, 0.06)'
                            : undefined,
                          borderLeft: dirty ? '3px solid var(--page-secondary-color)' : unset ? '3px solid var(--color-warning)' : '3px solid transparent',
                        }}
                      >
                        <td className="ps-4 text-muted" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}>
                          {idx + 1}
                        </td>
                        <td style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--page-secondary-color)' }}>
                          {product.name}
                        </td>
                        <td>
                          <Badge
                            className="theme-badge-secondary px-2 py-1"
                            style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-normal)' }}
                          >
                            {product.medCode}
                          </Badge>
                        </td>
                        <td className="text-center">
                          <Form.Control
                            type="text"
                            inputMode="numeric"
                            size="sm"
                            className="text-center"
                            style={{
                              width: 75,
                              display: 'inline-block',
                              borderColor: dirty && vals.min !== (product.min ?? 0) ? 'var(--page-secondary-color)' : undefined,
                              boxShadow: dirty && vals.min !== (product.min ?? 0) ? '0 0 0 1px var(--page-secondary-color)' : undefined,
                            }}
                            value={vals.min === 0 ? '' : String(vals.min)}
                            onChange={e => handleChange(product.id, 'min', e.target.value)}
                            onFocus={e => e.target.select()}
                            placeholder="0"
                          />
                        </td>
                        <td className="text-center">
                          <Form.Control
                            type="text"
                            inputMode="numeric"
                            size="sm"
                            className="text-center"
                            style={{
                              width: 75,
                              display: 'inline-block',
                              borderColor: dirty && vals.max !== (product.max ?? 0) ? 'var(--page-secondary-color)' : undefined,
                              boxShadow: dirty && vals.max !== (product.max ?? 0) ? '0 0 0 1px var(--page-secondary-color)' : undefined,
                            }}
                            value={vals.max === 0 ? '' : String(vals.max)}
                            onChange={e => handleChange(product.id, 'max', e.target.value)}
                            onFocus={e => e.target.select()}
                            placeholder="0"
                          />
                        </td>
                        <td className="text-center">
                          {dirty && (
                            <Button
                              size="sm"
                              className="theme-btn-primary"
                              onClick={() => handleUpdate(product)}
                              disabled={saving}
                            >
                              <FontAwesomeIcon icon={faSave} className="me-1" />
                              {saving ? 'Saving...' : 'Save'}
                            </Button>
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
      </div>
    </div>
  );
};

export default MinMaxOrder;
