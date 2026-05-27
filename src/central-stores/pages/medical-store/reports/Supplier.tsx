import React, { useEffect, useMemo, useState } from 'react';
import { Card, Spinner, Table } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import {
  CentralStoresApiService,
  DealerResponse,
} from '../../../../api/central-stores/central-stores-api-service';
import PageHeader from '../../../../components/PageHeader';
import SearchInput from '../../../../components/SearchInput';
import { faTruck } from '@fortawesome/free-solid-svg-icons';
import { handleError } from '../../../../utils/errorUtil';
import { showErrorToast } from '../../../../utils/alertUtil';
import { useTableSearch } from '../../../../hooks/useTableSearch';

// ── Constants ──────────────────────────────────────────────────────────────

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const centralStoresApi = new CentralStoresApiService();

// ── Session storage helper ─────────────────────────────────────────────────

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

// ── Searchable shape ───────────────────────────────────────────────────────

interface SupplierRow extends DealerResponse {
  supplierName: string;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function Supplier() {
  const dispatch = useDispatch();

  const [allSuppliers, setAllSuppliers] = useState<SupplierRow[]>([]);
  const [selectedLetter, setSelectedLetter] = useState('');
  const [loading, setLoading] = useState(true);

  // ── Search ────────────────────────────────────────────────────────────────

  const suppliersForLetter = useMemo(
    () =>
      selectedLetter
        ? allSuppliers.filter((s) => s.supplierName.toUpperCase().startsWith(selectedLetter))
        : [],
    [allSuppliers, selectedLetter]
  );

  const { filteredData, searchTerm, setSearchTerm, resultCount, totalCount } = useTableSearch({
    data: suppliersForLetter,
    searchFields: ['supplierName', 'address', 'city', 'phone'],
  });

  // ── Computed ──────────────────────────────────────────────────────────────

  const availableLetters = useMemo(
    () =>
      new Set(
        allSuppliers
          .map((s) => s.supplierName.toUpperCase().charAt(0))
          .filter((ch) => /[A-Z]/.test(ch))
      ),
    [allSuppliers]
  );

  const letterCountMap = useMemo(() => {
    const map = new Map<string, number>();
    allSuppliers.forEach((s) => {
      const first = s.supplierName.toUpperCase().charAt(0);
      if (/[A-Z]/.test(first)) map.set(first, (map.get(first) || 0) + 1);
    });
    return map;
  }, [allSuppliers]);

  // ── Data load ─────────────────────────────────────────────────────────────

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const storeData = getStoreData();
        const storeId = storeData?.masterId ?? 0;

        const dealers = await centralStoresApi.fetchDealersByStoreId(storeId);
        const rows: SupplierRow[] = (Array.isArray(dealers) ? dealers : []).map((d) => ({
          ...d,
          supplierName: d.name || '',
        }));
        setAllSuppliers(rows);
      } catch (error) {
        handleError(dispatch, error);
        showErrorToast('Failed to load supplier data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Letter click ──────────────────────────────────────────────────────────

  const handleLetterClick = (letter: string) => {
    if (!availableLetters.has(letter)) return;
    setSelectedLetter(letter);
    setSearchTerm('');
  };

  // ── Compact letter bar ────────────────────────────────────────────────────

  const renderLetterBar = () => (
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
            onClick={() => handleLetterClick(letter)}
            disabled={!active}
            title={active ? `${letterCountMap.get(letter) || 0} suppliers` : 'No suppliers'}
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

  // ── Table ─────────────────────────────────────────────────────────────────

  const renderTable = () => {
    if (!selectedLetter) {
      return (
        <div className="text-center py-5" style={{ color: '#6c757d', fontSize: 'var(--font-size-base)' }}>
          Select a letter above to view suppliers
        </div>
      );
    }

    if (filteredData.length === 0) {
      return (
        <div className="text-center py-5" style={{ color: '#6c757d', fontSize: 'var(--font-size-base)' }}>
          No suppliers found for &ldquo;{selectedLetter}&rdquo;
        </div>
      );
    }

    return (
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
              <th>Supplier Name</th>
              <th>Address</th>
              <th style={{ width: '140px' }}>City</th>
              <th style={{ width: '130px' }}>Phone</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((s, idx) => (
              <tr key={s.id}>
                <td className="text-center" style={{ fontSize: 'var(--font-size-sm)' }}>
                  {idx + 1}
                </td>
                <td style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                  {s.name}
                </td>
                <td style={{ fontSize: 'var(--font-size-sm)' }}>{s.address || '—'}</td>
                <td style={{ fontSize: 'var(--font-size-sm)' }}>{s.city || '—'}</td>
                <td style={{ fontSize: 'var(--font-size-sm)' }}>{s.phone || '—'}</td>
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
              <td colSpan={5} className="text-end">
                Total ({filteredData.length} suppliers)
              </td>
            </tr>
          </tfoot>
        </Table>
      </div>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────

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
        icon={faTruck}
        title="Supplier Details"
        subtitle="All supplier details"
      />

      <Card className="shadow-sm flex-grow-1" style={{ minHeight: 0 }}>
        <Card.Body style={{ overflowY: 'auto' }}>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" size="sm" className="me-2" />
              <span style={{ fontSize: 'var(--font-size-sm)' }}>Loading suppliers…</span>
            </div>
          ) : (
            <>
              {renderLetterBar()}

              <div className="mb-3">
                <SearchInput
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  placeholder="Search by name, address, city, phone…"
                  resultCount={resultCount}
                  totalCount={totalCount}
                />
              </div>

              {renderTable()}
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
