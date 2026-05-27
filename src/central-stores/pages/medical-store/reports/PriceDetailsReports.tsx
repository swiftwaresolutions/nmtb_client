import React, { useMemo, useState } from 'react';
import { Button, Card, Col, Form, Row, Spinner, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronDown,
  faChevronRight,
  faFileInvoiceDollar,
  faSearch,
  faSyncAlt,
} from '@fortawesome/free-solid-svg-icons';
import {
  CentralStoresApiService,
  GoodsReceiptRegisterRecord,
} from '../../../../api/central-stores/central-stores-api-service';
import PageHeader from '../../../../components/PageHeader';
import SearchInput from '../../../../components/SearchInput';
import { useTableSearch } from '../../../../hooks/useTableSearch';
import { showErrorToast, showValidationError } from '../../../../utils/alertUtil';

const centralStoresApi = new CentralStoresApiService();
const today = new Date().toISOString().split('T')[0];
const fmt = (n: number) => n.toFixed(2);

const fmtDate = (d: string) => {
  if (!d) return '—';
  const parsed = new Date(d);
  if (isNaN(parsed.getTime())) return d;
  return parsed.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

type ViewType = 'bill' | 'medicine';

interface MedicineWiseRow {
  medicineName: string;
  totalQtyReceived: number;
  costPriceTotal: number;
  freeOfferedQty: number;
  totalDiscount: number;
  totalGross: number;
  freeOfferCpTotal: number;
  mrpTotal: number;
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

const PriceDetailsReports: React.FC = () => {
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [viewType, setViewType] = useState<ViewType>('bill');
  const [records, setRecords] = useState<GoodsReceiptRegisterRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // ── Bill Wise ──
  const billRows = useMemo(
    () =>
      records.map((r) => ({
        ...r,
        discountAmount: r.medicines.reduce((s, m) => s + (m.discount ?? 0), 0),
        searchKey: `${r.grNo} ${r.supplierName} ${r.invoiceNo}`,
      })),
    [records]
  );

  const {
    filteredData: filteredBills,
    searchTerm: billSearch,
    setSearchTerm: setBillSearch,
    resultCount: billResultCount,
    totalCount: billTotalCount,
  } = useTableSearch({ data: billRows, searchFields: ['searchKey'] });

  // ── Medicine Wise ──
  const medicineRows = useMemo<MedicineWiseRow[]>(() => {
    const map = new Map<string, MedicineWiseRow>();
    for (const rec of records) {
      for (const m of rec.medicines) {
        const key = m.medicineName;
        const gross = (m.cost ?? 0) * (m.totalUnits ?? 0);
        const existing = map.get(key);
        if (existing) {
          existing.totalQtyReceived += m.totalUnits ?? 0;
          existing.costPriceTotal += gross;
          existing.freeOfferedQty += m.totalFree ?? 0;
          existing.totalDiscount += m.discount ?? 0;
          existing.totalGross += gross;
          existing.freeOfferCpTotal += (m.cost ?? 0) * (m.totalFree ?? 0);
          existing.mrpTotal += (m.mrp ?? 0) * (m.totalUnits ?? 0);
        } else {
          map.set(key, {
            medicineName: key,
            totalQtyReceived: m.totalUnits ?? 0,
            costPriceTotal: gross,
            freeOfferedQty: m.totalFree ?? 0,
            totalDiscount: m.discount ?? 0,
            totalGross: gross,
            freeOfferCpTotal: (m.cost ?? 0) * (m.totalFree ?? 0),
            mrpTotal: (m.mrp ?? 0) * (m.totalUnits ?? 0),
          });
        }
      }
    }
    return Array.from(map.values()).sort((a, b) =>
      a.medicineName.localeCompare(b.medicineName)
    );
  }, [records]);

  const {
    filteredData: filteredMeds,
    searchTerm: medSearch,
    setSearchTerm: setMedSearch,
    resultCount: medResultCount,
    totalCount: medTotalCount,
  } = useTableSearch({ data: medicineRows, searchFields: ['medicineName'] });

  const medTotals = useMemo(
    () =>
      filteredMeds.reduce(
        (acc, r) => ({
          qty: acc.qty + r.totalQtyReceived,
          cost: acc.cost + r.costPriceTotal,
          freeQty: acc.freeQty + r.freeOfferedQty,
          freeCp: acc.freeCp + r.freeOfferCpTotal,
          mrp: acc.mrp + r.mrpTotal,
          discount: acc.discount + r.totalDiscount,
          gross: acc.gross + r.totalGross,
        }),
        { qty: 0, cost: 0, freeQty: 0, freeCp: 0, mrp: 0, discount: 0, gross: 0 }
      ),
    [filteredMeds]
  );

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromDate || !toDate) {
      showValidationError('Please select both Date From and Date To.');
      return;
    }
    if (new Date(fromDate) > new Date(toDate)) {
      showValidationError('Date From cannot be later than Date To.');
      return;
    }
    setIsLoading(true);
    setRecords([]);
    setExpandedRows(new Set());
    try {
      const { masterId } = getStoreData();
      const data = await centralStoresApi.fetchGoodsReceiptRegister(masterId, fromDate, toDate);
      setRecords(Array.isArray(data) ? data : []);
      setHasSearched(true);
    } catch {
      showErrorToast('Failed to load price details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFromDate(today);
    setToDate(today);
    setViewType('bill');
    setRecords([]);
    setHasSearched(false);
    setExpandedRows(new Set());
    setBillSearch('');
    setMedSearch('');
  };

  const toggleRow = (grNo: string) =>
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(grNo)) next.delete(grNo);
      else next.add(grNo);
      return next;
    });

  return (
    <div>
      <PageHeader
        icon={faFileInvoiceDollar}
        title="Price Details Reports"
        subtitle="View bill-wise or medicine-wise price details for a date range"
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
            <Form onSubmit={handleSearch}>
              <Row className="g-3 align-items-end">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)' }}>
                      Date From
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
                    <Form.Label style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)' }}>
                      Date To
                    </Form.Label>
                    <Form.Control
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      style={{ fontSize: 'var(--font-size-base)' }}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)' }}>
                      View Type
                    </Form.Label>
                    <Form.Select
                      value={viewType}
                      onChange={(e) => setViewType(e.target.value as ViewType)}
                      style={{ fontSize: 'var(--font-size-base)' }}
                    >
                      <option value="bill">Bill Wise</option>
                      <option value="medicine">Medicine Wise</option>
                    </Form.Select>
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
                <Col md={1}>
                  <Button
                    type="button"
                    variant="outline-secondary"
                    onClick={handleReset}
                    style={{ fontSize: 'var(--font-size-base)', width: '100%' }}
                    title="Reset"
                  >
                    <FontAwesomeIcon icon={faSyncAlt} />
                  </Button>
                </Col>
              </Row>
            </Form>
          </div>

          {/* Content */}
          {!hasSearched ? (
            <div className="text-center py-5" style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-base)' }}>
              Select a date range and view type, then click Submit.
            </div>
          ) : isLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" size="sm" className="me-2" />
              <span style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-muted)' }}>Loading...</span>
            </div>
          ) : viewType === 'bill' ? (
            /* ── Bill Wise ── */
            <>
              <div className="mb-3">
                <SearchInput
                  searchTerm={billSearch}
                  onSearchChange={setBillSearch}
                  placeholder="Search by receipt no, supplier, invoice no..."
                  resultCount={billResultCount}
                  totalCount={billTotalCount}
                />
              </div>
              <div className="table-responsive">
                <Table bordered size="sm" style={{ fontSize: 'var(--font-size-base)' }}>
                  <thead>
                    <tr style={{ background: 'var(--table-header-bg)', color: 'var(--table-header-text)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}>
                      <th style={{ width: '50px' }} className="text-center">Sl.No</th>
                      <th style={{ width: '30px' }}></th>
                      <th style={{ width: '130px' }}>Receipt No</th>
                      <th>Sup. Name</th>
                      <th>Sup. Address</th>
                      <th style={{ width: '130px' }}>Invoice No</th>
                      <th style={{ width: '120px' }} className="text-end">Discount Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBills.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center" style={{ color: 'var(--color-muted)', padding: '32px' }}>
                          No records found for the selected date range.
                        </td>
                      </tr>
                    ) : (
                      filteredBills.map((bill, idx) => {
                        const isExpanded = expandedRows.has(bill.grNo);
                        return (
                          <React.Fragment key={bill.grNo}>
                            <tr
                              style={{ cursor: 'pointer' }}
                              onClick={() => toggleRow(bill.grNo)}
                            >
                              <td className="text-center">{idx + 1}</td>
                              <td className="text-center">
                                <FontAwesomeIcon
                                  icon={isExpanded ? faChevronDown : faChevronRight}
                                  style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)' }}
                                />
                              </td>
                              <td style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--btn-primary)' }}>
                                {bill.grNo}
                              </td>
                              <td>{bill.supplierName}</td>
                              <td>{bill.supplierAddress}</td>
                              <td>{bill.invoiceNo}</td>
                              <td className="text-end">{fmt(bill.discountAmount)}</td>
                            </tr>
                            {isExpanded && (
                              <tr>
                                <td colSpan={7} style={{ padding: '0 0 0 40px', background: 'var(--bs-light, #f8f9fa)' }}>
                                  <Table bordered size="sm" className="mb-2 mt-2" style={{ fontSize: 'var(--font-size-sm)', background: 'white' }}>
                                    <thead>
                                      <tr style={{ background: 'var(--table-header-bg)', color: 'var(--table-header-text)', fontWeight: 'var(--font-weight-semibold)' }}>
                                        <th style={{ width: '45px' }} className="text-center">Sl.No</th>
                                        <th>Item Name</th>
                                        <th style={{ width: '120px' }}>Batch Name</th>
                                        <th style={{ width: '110px' }}>Expiry Date</th>
                                        <th style={{ width: '70px' }} className="text-center">Quantity</th>
                                        <th style={{ width: '70px' }} className="text-center">Offer</th>
                                        <th style={{ width: '90px' }} className="text-end">Value</th>
                                        <th style={{ width: '90px' }} className="text-end">Discount %</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {bill.medicines.length === 0 ? (
                                        <tr>
                                          <td colSpan={8} className="text-center" style={{ color: 'var(--color-muted)' }}>No items</td>
                                        </tr>
                                      ) : (
                                        bill.medicines.map((item, i) => (
                                          <tr key={`${bill.grNo}-item-${i}`}>
                                            <td className="text-center">{i + 1}</td>
                                            <td style={{ fontWeight: 'var(--font-weight-medium)' }}>{item.medicineName}</td>
                                            <td>{item.batchNo}</td>
                                            <td>—</td>
                                            <td className="text-center">{item.totalUnits}</td>
                                            <td className="text-center">{item.totalFree ?? 0}</td>
                                            <td className="text-end">{fmt(item.totalAmt ?? 0)}</td>
                                            <td className="text-end">{fmt(item.discountPercentage ?? 0)}</td>
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
                      })
                    )}
                  </tbody>
                </Table>
              </div>
            </>
          ) : (
            /* ── Medicine Wise ── */
            <>
              <div className="mb-3">
                <SearchInput
                  searchTerm={medSearch}
                  onSearchChange={setMedSearch}
                  placeholder="Search by medicine name..."
                  resultCount={medResultCount}
                  totalCount={medTotalCount}
                />
              </div>
              <div className="table-responsive" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                <Table bordered size="sm" style={{ fontSize: 'var(--font-size-base)' }}>
                  <thead>
                    <tr style={{ background: 'var(--table-header-bg)', color: 'var(--table-header-text)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}>
                      <th style={{ width: '55px' }} className="text-center">Sl.No</th>
                      <th>Medicine Name</th>
                      <th style={{ width: '110px' }} className="text-center">Total Qty Received</th>
                      <th style={{ width: '120px' }} className="text-end">Cost Price Total</th>
                      <th style={{ width: '110px' }} className="text-center">Free Offered Qty</th>
                      <th style={{ width: '100px' }} className="text-end">Discount %</th>
                      <th style={{ width: '120px' }} className="text-end">Free Offer CP Total</th>
                      <th style={{ width: '110px' }} className="text-end">MRP Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMeds.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center" style={{ color: 'var(--color-muted)', padding: '32px' }}>
                          No records found for the selected date range.
                        </td>
                      </tr>
                    ) : (
                      filteredMeds.map((row, idx) => {
                        const discPct = row.totalGross > 0 ? (row.totalDiscount / row.totalGross) * 100 : 0;
                        return (
                          <tr key={row.medicineName}>
                            <td className="text-center">{idx + 1}</td>
                            <td style={{ fontWeight: 'var(--font-weight-medium)' }}>{row.medicineName}</td>
                            <td className="text-center">{row.totalQtyReceived}</td>
                            <td className="text-end">{fmt(row.costPriceTotal)}</td>
                            <td className="text-center">{row.freeOfferedQty}</td>
                            <td className="text-end">{fmt(discPct)}</td>
                            <td className="text-end">{fmt(row.freeOfferCpTotal)}</td>
                            <td className="text-end">{fmt(row.mrpTotal)}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                  {filteredMeds.length > 0 && (
                    <tfoot style={{ position: 'sticky', bottom: 0, zIndex: 2 }}>
                      <tr
                        style={{
                          background: 'var(--bs-light, #f8f9fa)',
                          fontWeight: 'var(--font-weight-semibold)',
                          fontSize: 'var(--font-size-sm)',
                          boxShadow: '0 -2px 4px rgba(0,0,0,0.08)',
                        }}
                      >
                        <td colSpan={2} className="text-end">
                          Grand Total ({filteredMeds.length} medicine{filteredMeds.length !== 1 ? 's' : ''})
                        </td>
                        <td className="text-center">{medTotals.qty}</td>
                        <td className="text-end">{fmt(medTotals.cost)}</td>
                        <td className="text-center">{medTotals.freeQty}</td>
                        <td className="text-end">
                          {medTotals.gross > 0 ? fmt((medTotals.discount / medTotals.gross) * 100) : '—'}
                        </td>
                        <td className="text-end">{fmt(medTotals.freeCp)}</td>
                        <td className="text-end">{fmt(medTotals.mrp)}</td>
                      </tr>
                    </tfoot>
                  )}
                </Table>
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default PriceDetailsReports;
