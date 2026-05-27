import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Col, Row, Spinner, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBoxesStacked } from '@fortawesome/free-solid-svg-icons';
import {
  CentralStoresApiService,
  CostwiseMedicineRecord,
} from '../../../../api/central-stores/central-stores-api-service';
import PageHeader from '../../../../components/PageHeader';
import SearchInput from '../../../../components/SearchInput';
import { useTableSearch } from '../../../../hooks/useTableSearch';
import { showErrorToast } from '../../../../utils/alertUtil';

const centralStoresApi = new CentralStoresApiService();
const LETTERS = ['All', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

interface CostRow extends CostwiseMedicineRecord {
  totalCost: number;
  totalMrp: number;
  totalProfit: number;
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

const CostWiseMedicine: React.FC = () => {
  const [rows, setRows] = useState<CostRow[]>([]);
  const [isLoadingStock, setIsLoadingStock] = useState(false);
  const [activeLetter, setActiveLetter] = useState<string>('A');

  const loadCostForLetter = useCallback(async (letter: string) => {
    setIsLoadingStock(true);
    setRows([]);
    try {
      const { masterId } = getStoreData();
      const nameParam = letter === 'All' ? '' : letter.toLowerCase();
      const records = await centralStoresApi.fetchCostwiseMedicineDetails(masterId, nameParam);
      const result: CostRow[] = records.map((rec) => {
        const totalCost = rec.stock * rec.cost;
        const totalMrp = rec.stock * rec.mrp;
        return { ...rec, totalCost, totalMrp, totalProfit: totalMrp - totalCost };
      });
      setRows(result);
    } catch {
      showErrorToast('Failed to load cost data');
    } finally {
      setIsLoadingStock(false);
    }
  }, []);

  useEffect(() => {
    loadCostForLetter(activeLetter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLetter]);

  const { filteredData, searchTerm, setSearchTerm, resultCount, totalCount } =
    useTableSearch({
      data: rows,
      searchFields: ['medicineName', 'batchNo'],
    });

  const isLoading = isLoadingStock;

  const totals = useMemo(
    () =>
      filteredData.reduce(
        (acc, r) => ({
          stock: acc.stock + r.stock,
          totalCost: acc.totalCost + r.totalCost,
          totalMrp: acc.totalMrp + r.totalMrp,
          totalProfit: acc.totalProfit + r.totalProfit,
        }),
        { stock: 0, totalCost: 0, totalMrp: 0, totalProfit: 0 }
      ),
    [filteredData]
  );

  return (
    <div>
      <PageHeader
        icon={faBoxesStacked}
        title="Cost Wise Medicine"
        subtitle="View batch-wise cost, MRP, stock and profit values by letter"
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
              const isActive = activeLetter === letter;
              return (
                <button
                  key={letter}
                  disabled={isLoadingStock}
                  onClick={() => setActiveLetter(letter)}
                  style={{
                    minWidth: '34px',
                    height: '34px',
                    padding: '0 6px',
                    border: isActive ? 'none' : '1px solid var(--bs-border-color, #dee2e6)',
                    borderRadius: 'var(--border-radius-sm)',
                    cursor: isLoadingStock ? 'not-allowed' : 'pointer',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: isActive ? 'var(--font-weight-bold)' : 'var(--font-weight-normal)',
                    background: isActive ? 'var(--table-header-bg)' : 'white',
                    color: isActive ? 'var(--table-header-text)' : 'inherit',
                    transition: 'var(--transition-normal)',
                  }}
                >
                  {letter}
                </button>
              );
            })}
          </div>

          {/* Search bar */}
          <Row className="g-2 align-items-center mb-3">
            <Col>
              <SearchInput
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                placeholder="Search by medicine name or batch no..."
                resultCount={resultCount}
                totalCount={totalCount}
              />
            </Col>
          </Row>

          {/* Loading */}
          {isLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" size="sm" className="me-2" />
              <span style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-muted)' }}>
                Loading cost data...
              </span>
            </div>
          ) : (
            <div
              className="table-responsive"
              style={{ maxHeight: '60vh', overflowY: 'auto' }}
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
                    }}
                  >
                    <th style={{ width: '55px' }} className="text-center">Sl.No</th>
                    <th>Medicine Name</th>
                    <th style={{ width: '130px' }}>Batch No</th>
                    <th style={{ width: '80px' }} className="text-end">Cost</th>
                    <th style={{ width: '80px' }} className="text-end">M.R.P</th>
                    <th style={{ width: '80px' }} className="text-center">Stock</th>
                    <th style={{ width: '110px' }} className="text-end">Total Cost</th>
                    <th style={{ width: '110px' }} className="text-end">Total M.R.P</th>
                    <th style={{ width: '110px' }} className="text-end">Total Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="text-center"
                        style={{ color: 'var(--color-muted)', padding: '32px' }}
                      >
                        {rows.length === 0
                          ? 'No data found for this letter.'
                          : 'No results match your search.'}
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((row, idx) => (
                      <tr key={`${row.medicineName}-${row.batchNo}-${idx}`}>
                        <td className="text-center">{idx + 1}</td>
                        <td style={{ fontWeight: 'var(--font-weight-medium)' }}>
                          {row.medicineName}
                        </td>
                        <td>{row.batchNo}</td>
                        <td className="text-end">{fmt(row.cost)}</td>
                        <td className="text-end">{fmt(row.mrp)}</td>
                        <td className="text-center">{row.stock}</td>
                        <td className="text-end">{fmt(row.totalCost)}</td>
                        <td className="text-end">{fmt(row.totalMrp)}</td>
                        <td
                          className="text-end"
                          style={{
                            color:
                              row.totalProfit < 0
                                ? 'var(--color-danger)'
                                : 'inherit',
                          }}
                        >
                          {fmt(row.totalProfit)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {filteredData.length > 0 && (
                  <tfoot
                    style={{
                      position: 'sticky',
                      bottom: 0,
                      zIndex: 2,
                    }}
                  >
                    <tr
                      style={{
                        background: 'var(--bs-light, #faf8f8)',
                        fontWeight: 'var(--font-weight-semibold)',
                          fontSize: 'var(--font-size-sm)',
                        boxShadow: '0 -2px 4px rgba(0,0,0,0.08)',
                      }}
                    >
                      <td colSpan={5} className="text-end">
                        Grand Total ({filteredData.length} batch
                        {filteredData.length !== 1 ? 'es' : ''})
                      </td>
                      <td className="text-center">{totals.stock}</td>
                      <td className="text-end">{fmt(totals.totalCost)}</td>
                      <td className="text-end">{fmt(totals.totalMrp)}</td>
                      <td className="text-end">{fmt(totals.totalProfit)}</td>
                    </tr>
                  </tfoot>
                )}
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default CostWiseMedicine;
