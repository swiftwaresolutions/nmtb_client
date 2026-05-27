import React, { useState } from 'react';
import { Badge, Button, Card, Col, Form, Row, Spinner, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboardList, faSearch, faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import CentralStoresApiService from '../../../../api/central-stores/central-stores-api-service';
import PageHeader from '../../../../components/PageHeader';
import SearchInput from '../../../../components/SearchInput';
import { useTableSearch } from '../../../../hooks/useTableSearch';
import { showErrorToast, showValidationError } from '../../../../utils/alertUtil';

const centralStoresApi = new CentralStoresApiService();

interface PoRow {
  slNo: number;
  orderNo: string;
  supplierName: string;
  confirmed: string;
  approved: string;
  goodsReceiptNo: string;
  allReceived: string;
  payment: string;
  finished: string;
}

const getStoreData = (): { masterId: number } => {
  try {
    const s = sessionStorage.getItem('selectedStore');
    if (s) return { masterId: JSON.parse(s).masterId };
    const p = sessionStorage.getItem('pharmacySubModuleData');
    if (p) return { masterId: JSON.parse(p).masterId ?? 0 };
  } catch { /* ignore */ }
  return { masterId: 0 };
};

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '-';
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  } catch { return '-'; }
};

const PurchaseOrderStatusMed: React.FC = () => {
  const today = new Date().toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState<string>(today);
  const [toDate, setToDate] = useState<string>(today);
  const [rows, setRows] = useState<PoRow[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const { filteredData, searchTerm, setSearchTerm, resultCount, totalCount } = useTableSearch({
    data: rows,
    searchFields: ['orderNo', 'supplierName', 'goodsReceiptNo'],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromDate || !toDate) {
      showValidationError('Please select both From Date and To Date');
      return;
    }
    if (new Date(fromDate) > new Date(toDate)) {
      showValidationError('From Date cannot be after To Date');
      return;
    }

    setIsSearching(true);
    setHasSearched(false);

    try {
      const storeId = getStoreData().masterId;

      const [allOrders, dealers] = await Promise.all([
        centralStoresApi.fetchAllPurchaseOrders(),
        centralStoresApi.fetchDealersByStoreId(storeId),
      ]);

      const dealerMap = new Map<number, string>();
      dealers.forEach((d) => dealerMap.set(d.id, d.name));

      const from = new Date(fromDate);
      from.setHours(0, 0, 0, 0);
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);

      const filtered = allOrders.filter((o) => {
        if (o.storeId !== storeId) return false;
        const orderDate = new Date(o.orderDateTime);
        return orderDate >= from && orderDate <= to;
      });

      if (filtered.length === 0) {
        setRows([]);
        setHasSearched(true);
        return;
      }

      // Fetch GR details per unique supplier to build grId → grNo map
      const uniqueSupIds = Array.from(new Set(filtered.map((o) => o.supId)));
      const grDetailResults = await Promise.allSettled(
        uniqueSupIds.map((supId) =>
          centralStoresApi.fetchGoodsReceiptDetailsBySupplier(supId, fromDate, toDate, storeId)
        )
      );
      const grIdToNo = new Map<number, string>();
      grDetailResults.forEach((res) => {
        if (res.status === 'fulfilled') {
          res.value.forEach((gr) => grIdToNo.set(gr.grId, gr.grNo));
        }
      });

      // Fetch pre-goods-receipts per order to find grnId
      const preGrResults = await Promise.allSettled(
        filtered.map((o) => centralStoresApi.fetchPreGoodsReceiptByOrderId(o.orderId))
      );

      const built: PoRow[] = filtered.map((o, idx) => {
        const preGrs =
          preGrResults[idx].status === 'fulfilled'
            ? (preGrResults[idx] as PromiseFulfilledResult<any>).value
            : [];
        const grnIds = Array.from(new Set((preGrs as any[]).filter((p) => p.grnId > 0).map((p) => p.grnId as number)));
        const grNos = grnIds.map((id) => grIdToNo.get(id) ?? `GR${id}`).join(', ');

        return {
          slNo: idx + 1,
          orderNo: String(o.orderId),
          supplierName: dealerMap.get(o.supId) ?? `Supplier ${o.supId}`,
          confirmed: formatDate(o.orderDateTime),
          approved: o.isApproved === 1 && o.approvedDateTime ? formatDate(o.approvedDateTime) : '-',
          goodsReceiptNo: grNos || '-',
          allReceived: o.isClosed === 1 ? 'Yes' : 'No',
          payment: o.isOrderSettled === 1 ? 'Yes' : 'No',
          finished: o.isFinished === 1 ? 'Yes' : 'No',
        };
      });

      setRows(built);
      setHasSearched(true);
    } catch (error) {
      showErrorToast('Failed to fetch purchase order status');
    } finally {
      setIsSearching(false);
    }
  };

  const handleReset = () => {
    setFromDate(today);
    setToDate(today);
    setRows([]);
    setHasSearched(false);
    setSearchTerm('');
  };

  const yesNo = (val: string) => (
    <Badge bg={val === 'Yes' ? 'success' : 'danger'} style={{ fontSize: 'var(--font-size-xs)' }}>
      {val}
    </Badge>
  );

  return (
    <div>
      <PageHeader
        icon={faClipboardList}
        title="Purchase Order Status"
        subtitle="Track medical store purchase orders and their current status"
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
                      From Date
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
                      To Date
                    </Form.Label>
                    <Form.Control
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      style={{ fontSize: 'var(--font-size-base)' }}
                    />
                  </Form.Group>
                </Col>
                <Col md="auto">
                  <Button
                    type="submit"
                    disabled={isSearching}
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
                    {isSearching ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      <FontAwesomeIcon icon={faSearch} />
                    )}
                    {isSearching ? 'Loading...' : 'Submit'}
                  </Button>
                </Col>
                <Col md="auto">
                  <Button
                    variant="outline-secondary"
                    type="button"
                    onClick={handleReset}
                    disabled={isSearching}
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

          {/* Search */}
          {hasSearched && rows.length > 0 && (
            <Row className="g-2 align-items-center mb-3">
              <Col>
                <SearchInput
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  placeholder="Search by order no, supplier..."
                  resultCount={resultCount}
                  totalCount={totalCount}
                />
              </Col>
            </Row>
          )}

          {/* Content */}
          {isSearching ? (
            <div className="text-center py-5">
              <Spinner animation="border" style={{ color: 'var(--btn-primary)' }} />
              <div
                className="mt-2"
                style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-muted)' }}
              >
                Loading purchase order data...
              </div>
            </div>
          ) : hasSearched ? (
            filteredData.length === 0 ? (
              <div
                className="text-center py-5"
                style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-muted)' }}
              >
                No purchase orders found for the selected date range.
              </div>
            ) : (
              <div style={{ maxHeight: '60vh', overflowY: 'auto', position: 'relative' }}>
                <Table
                  bordered
                  hover
                  size="sm"
                  style={{ fontSize: 'var(--font-size-base)', marginBottom: 0 }}
                >
                  <thead
                    style={{
                      position: 'sticky',
                      top: 0,
                      background: 'var(--table-header-bg)',
                      color: 'var(--table-header-text)',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'var(--font-weight-semibold)',
                      zIndex: 2,
                    }}
                  >
                    <tr>
                      <th style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>Sl. No</th>
                      <th style={{ whiteSpace: 'nowrap' }}>Order No</th>
                      <th style={{ whiteSpace: 'nowrap' }}>Supplier Name</th>
                      <th style={{ whiteSpace: 'nowrap' }}>Confirmed</th>
                      <th style={{ whiteSpace: 'nowrap' }}>Approved</th>
                      <th style={{ whiteSpace: 'nowrap' }}>Goods Receipt No</th>
                      <th style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>All Received</th>
                      <th style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>Payment</th>
                      <th style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>Finished</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((row) => (
                      <tr key={row.slNo}>
                        <td style={{ textAlign: 'center' }}>{row.slNo}</td>
                        <td>{row.orderNo}</td>
                        <td>{row.supplierName}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>{row.confirmed}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>{row.approved}</td>
                        <td>{row.goodsReceiptNo}</td>
                        <td style={{ textAlign: 'center' }}>{yesNo(row.allReceived)}</td>
                        <td style={{ textAlign: 'center' }}>{yesNo(row.payment)}</td>
                        <td style={{ textAlign: 'center' }}>{yesNo(row.finished)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot
                    style={{
                      position: 'sticky',
                      bottom: 0,
                      background: 'var(--table-header-bg)',
                      color: 'var(--table-header-text)',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'var(--font-weight-bold)',
                      zIndex: 2,
                    }}
                  >
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'right' }}>
                        Total: {rows.length} order{rows.length !== 1 ? 's' : ''}
                      </td>
                    </tr>
                  </tfoot>
                </Table>
              </div>
            )
          ) : (
            <div
              className="text-center py-5"
              style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-muted)' }}
            >
              Select a date range and click <strong>Submit</strong> to view purchase order status.
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default PurchaseOrderStatusMed;