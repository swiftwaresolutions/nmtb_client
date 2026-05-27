import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Spinner, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPills, faSync } from '@fortawesome/free-solid-svg-icons';
import {
  CentralStoresApiService,
} from '../../../../api/central-stores/central-stores-api-service';
import PageHeader from '../../../../components/PageHeader';
import SearchInput from '../../../../components/SearchInput';
import { useTableSearch } from '../../../../hooks/useTableSearch';
import { showErrorToast } from '../../../../utils/alertUtil';

const centralStoresApi = new CentralStoresApiService();

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

interface MedicineRow {
  id: number;
  productName: string;
  cp: number;
  sp: number;
  companyName: string;
  supplierName: string;
  min: number;
  eoq: number;
}

const getStoreData = (): { masterId: number; phModId: number } => {
  try {
    const selectedStore = sessionStorage.getItem('selectedStore');
    if (selectedStore) {
      const parsed = JSON.parse(selectedStore);
      const resolvedMasterId = parsed.masterId ?? 0;
      return { masterId: resolvedMasterId, phModId: resolvedMasterId };
    }
    const pharmacy = sessionStorage.getItem('pharmacySubModuleData');
    if (pharmacy) {
      const parsed = JSON.parse(pharmacy);
      const resolvedMasterId = parsed.masterId ?? 0;
      return { masterId: resolvedMasterId, phModId: resolvedMasterId };
    }
  } catch {
    // ignore
  }
  return { masterId: 0, phModId: 0 };
};

const MedicineDetails: React.FC = () => {
  const [rows, setRows] = useState<MedicineRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeLetter, setActiveLetter] = useState<string>('All');

  const letterCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of rows) {
      const first = row.productName?.[0]?.toUpperCase() ?? '#';
      map.set(first, (map.get(first) ?? 0) + 1);
    }
    return map;
  }, [rows]);

  const letterFiltered = useMemo(() => {
    if (activeLetter === 'All') return rows;
    return rows.filter(
      (r) => r.productName?.[0]?.toUpperCase() === activeLetter
    );
  }, [rows, activeLetter]);

  const { filteredData, searchTerm, setSearchTerm, resultCount, totalCount } =
    useTableSearch({
      data: letterFiltered,
      searchFields: ['productName', 'companyName'],
    });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const { phModId } = getStoreData();

      const [products, manufacturers] = await Promise.all([
        centralStoresApi.fetchAllProducts(phModId),
        centralStoresApi.fetchAllManufacturers(),
      ]);

      const companyMap = new Map<number, string>();
      for (const m of manufacturers) companyMap.set(m.id, m.name);

      const batchResults = await Promise.all(
        products.map(async (p) => {
          try {
            const batches = await centralStoresApi.fetchAllBatches(p.id);
            const active = batches.filter((b) => b.isActive === 1);
            const latest = active.length > 0 ? active[active.length - 1] : batches[batches.length - 1];
            return { id: p.id, cp: latest?.cost ?? 0, sp: latest?.salesPrice ?? 0 };
          } catch {
            return { id: p.id, cp: 0, sp: 0 };
          }
        })
      );

      const priceMap = new Map(batchResults.map((b) => [b.id, { cp: b.cp, sp: b.sp }]));

      const result: MedicineRow[] = products
        .filter((p) => p.isactive !== 'N')
        .map((p) => ({
          id: p.id,
          productName: p.name,
          cp: priceMap.get(p.id)?.cp ?? 0,
          sp: priceMap.get(p.id)?.sp ?? 0,
          companyName: companyMap.get(p.companyId) ?? '—',
          supplierName: '—',
          min: p.min,
          eoq: p.eoq,
        }))
        .sort((a, b) => a.productName.localeCompare(b.productName));

      setRows(result);
    } catch {
      showErrorToast('Failed to load medicine details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <PageHeader
        title="Medicine Details"
        subtitle="Product details with pricing, company and stock parameters"
        icon={faPills}
      />
      <Card className="shadow-sm border-0">
        <Card.Body>

          {/* A–Z Letter Bar */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '4px',
              marginBottom: '16px',
            }}
          >
            {['All', ...LETTERS].map((letter) => {
              const count = letter === 'All' ? rows.length : (letterCounts.get(letter) ?? 0);
              const isActive = activeLetter === letter;
              return (
                <button
                  key={letter}
                  onClick={() => { setActiveLetter(letter); setSearchTerm(''); }}
                  disabled={letter !== 'All' && count === 0}
                  title={letter === 'All' ? `All (${count})` : `${letter} (${count})`}
                  style={{
                    width: letter === 'All' ? '48px' : '32px',
                    height: '32px',
                    border: '1px solid',
                    borderColor: isActive ? 'var(--btn-primary)' : 'var(--bs-border-color, #dee2e6)',
                    borderRadius: 'var(--border-radius-sm)',
                    background: isActive ? 'var(--btn-primary)' : count === 0 ? 'var(--bs-light, #f8f9fa)' : '#fff',
                    color: isActive ? '#fff' : count === 0 ? '#ccc' : 'inherit',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: isActive ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)',
                    cursor: count === 0 && letter !== 'All' ? 'not-allowed' : 'pointer',
                    transition: 'var(--transition-normal)',
                    padding: 0,
                  }}
                >
                  {letter}
                </button>
              );
            })}
          </div>

          {isLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
              <div
                className="mt-2"
                style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)' }}
              >
                Loading medicine details...
              </div>
            </div>
          ) : (
            <>
              {/* Summary + Search */}
              <div
                style={{
                  background: 'var(--bs-light, #f8f9fa)',
                  borderRadius: 'var(--border-radius-sm)',
                  border: '1px solid var(--bs-border-color, #dee2e6)',
                  padding: '12px 16px',
                  marginBottom: '16px',
                }}
              >
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        background: 'var(--table-header-bg)',
                        color: 'var(--table-header-text)',
                        borderRadius: 'var(--border-radius-sm)',
                        padding: '4px 12px',
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: 'var(--font-weight-semibold)',
                      }}
                    >
                      <FontAwesomeIcon icon={faPills} className="me-1" />
                      {rows.length} Total
                    </span>
                    {activeLetter !== 'All' && (
                      <span
                        style={{
                          background: 'var(--btn-primary)',
                          color: '#fff',
                          borderRadius: 'var(--border-radius-sm)',
                          padding: '4px 12px',
                          fontSize: 'var(--font-size-sm)',
                          fontWeight: 'var(--font-weight-semibold)',
                        }}
                      >
                        {activeLetter} — {letterFiltered.length} product{letterFiltered.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={loadData}
                    style={{ fontSize: 'var(--font-size-xs)' }}
                  >
                    <FontAwesomeIcon icon={faSync} className="me-1" />
                    Refresh
                  </Button>
                </div>
                <SearchInput
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  placeholder="Search by product name or company..."
                  resultCount={resultCount}
                  totalCount={totalCount}
                />
              </div>

              {/* Table */}
              {rows.length === 0 ? (
                <div
                  className="text-center py-5"
                  style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-sm)' }}
                >
                  No products found.
                </div>
              ) : filteredData.length === 0 ? (
                <div
                  className="text-center py-5"
                  style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-sm)' }}
                >
                  No products match your search.
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
                        <th>Product Name</th>
                        <th className="text-end">CP</th>
                        <th className="text-end">SP</th>
                        <th>Company Name</th>
                        <th>Supplier Name</th>
                        <th className="text-end">Min</th>
                        <th className="text-end">EOQ</th>
                      </tr>
                    </thead>
                    <tbody style={{ fontSize: 'var(--font-size-sm)' }}>
                      {filteredData.map((row, index) => (
                        <tr key={row.id}>
                          <td>{index + 1}</td>
                          <td style={{ fontWeight: 'var(--font-weight-medium)' }}>
                            {row.productName}
                          </td>
                          <td className="text-end">
                            {row.cp > 0 ? row.cp.toFixed(2) : <span style={{ color: 'var(--color-muted)' }}>—</span>}
                          </td>
                          <td className="text-end">
                            {row.sp > 0 ? row.sp.toFixed(2) : <span style={{ color: 'var(--color-muted)' }}>—</span>}
                          </td>
                          <td>{row.companyName}</td>
                          <td style={{ color: 'var(--color-muted)' }}>{row.supplierName}</td>
                          <td className="text-end">{row.min}</td>
                          <td className="text-end">{row.eoq}</td>
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
                        <td colSpan={8}>
                          Showing {filteredData.length} of {rows.length} product
                          {rows.length !== 1 ? 's' : ''}
                        </td>
                      </tr>
                    </tfoot>
                  </Table>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default MedicineDetails;

