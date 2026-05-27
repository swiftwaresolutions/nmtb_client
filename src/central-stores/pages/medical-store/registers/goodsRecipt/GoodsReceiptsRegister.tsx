import React, { useMemo, useState } from 'react';
import { Button, Card, Col, Container, Form, Row, Table } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import {
  CentralStoresApiService,
  GoodsReceiptRegisterRecord,
} from '../../../../../api/central-stores/central-stores-api-service';
import ReportHeader from '../../../../../medical-records/components/ReportHeader';
import {
  exportToExcel,
  formatReportDate,
  getDateRangeText,
  printReport,
  searchTableData,
} from '../../../../../medical-records/utils/reportUtils';
import { showErrorModal, showValidationError } from '../../../../../utils/alertUtil';
import { handleError } from '../../../../../utils/errorUtil';
import MedicineDetail from './modal/MedicineDetail';

type RegisterFilterType = 'dateRange' | 'grNo';

interface SessionStoreData {
  masterId?: number;
  subModName?: string;
}

const GoodsReceiptsRegister: React.FC = () => {
  const dispatch = useDispatch();
  const centralStoresApi = useMemo(() => new CentralStoresApiService(), []);
  const currentDate = new Date().toISOString().split('T')[0];

  const [registerFilter, setRegisterFilter] = useState<RegisterFilterType>('dateRange');
  const [dateFrom, setDateFrom] = useState<string>(currentDate);
  const [dateTo, setDateTo] = useState<string>(currentDate);
  const [grNo, setGrNo] = useState<string>('');
  const [rows, setRows] = useState<GoodsReceiptRegisterRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loadingRows, setLoadingRows] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [selectedReceipt, setSelectedReceipt] = useState<GoodsReceiptRegisterRecord | null>(null);

  const selectedStoreData = useMemo<SessionStoreData | null>(() => {
    try {
      const selectedStoreRaw = sessionStorage.getItem('selectedStore');
      return selectedStoreRaw ? (JSON.parse(selectedStoreRaw) as SessionStoreData) : null;
    } catch {
      return null;
    }
  }, []);

  const selectedStoreId = Number(selectedStoreData?.masterId ?? 0);
  const selectedStoreName = selectedStoreData?.subModName || 'Store';

  const displayedRows = useMemo(() => {
    return searchTableData(rows, searchTerm, [
      'grNo',
      'supplierName',
      'supplierAddress',
      'invoiceNo',
      'userName',
    ]);
  }, [rows, searchTerm]);

  const subtitle =
    registerFilter === 'dateRange'
      ? `${selectedStoreName} - ${getDateRangeText(dateFrom, dateTo)}`
      : `${selectedStoreName} - G.R. No: ${grNo.trim() || 'Filtered Search'}`;

  const handleRegisterFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextFilter = event.target.value as RegisterFilterType;
    setRegisterFilter(nextFilter);
    setRows([]);
    setHasSearched(false);
    setSearchTerm('');
    setSelectedReceipt(null);

    if (nextFilter === 'dateRange') {
      setGrNo('');
    }
  };

  const validateFilters = () => {
    if (!selectedStoreId) {
      showValidationError('Store context is missing. Please reselect the store.');
      return false;
    }

    if (!dateFrom || !dateTo) {
      showValidationError('Please select both From Date and To Date.');
      return false;
    }

    if (new Date(dateFrom) > new Date(dateTo)) {
      showValidationError('To Date cannot be earlier than From Date.');
      return false;
    }

    if (registerFilter === 'grNo' && !grNo.trim()) {
      showValidationError('Please enter a valid G.R. No.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateFilters()) {
      return;
    }

    try {
      setLoadingRows(true);
      setSelectedReceipt(null);

      const response = await centralStoresApi.fetchGoodsReceiptRegister(
        selectedStoreId,
        dateFrom,
        dateTo,
        registerFilter === 'grNo' ? grNo.trim() : undefined
      );

      setRows(Array.isArray(response) ? response : []);
      setHasSearched(true);
    } catch (error) {
      handleError(dispatch, error);
      showErrorModal('Failed to load goods receipts register. Please try again.', 'Error');
      setRows([]);
      setHasSearched(false);
    } finally {
      setLoadingRows(false);
    }
  };

  const handleExport = () => {
    const exportData = displayedRows.map((row, index) => ({
      'S.No': index + 1,
      'GR No': row.grNo || '-',
      'Supplier Name': row.supplierName || '-',
      'Supplier Address': row.supplierAddress || '-',
      'Invoice No': row.invoiceNo || '-',
      'Invoice Date': row.invoiceDate ? formatReportDate(row.invoiceDate, 'DD/MM/YYYY') : '-',
      'Received Date': row.receivedDate ? formatReportDate(row.receivedDate, 'DD/MM/YYYY') : '-',
      'Total Value': row.totalValue ?? 0,
      'MRP Value': row.mrpValue ?? 0,
      User: row.userName || '-',
    }));

    exportToExcel(
      exportData,
      `Goods_Receipts_Register_${selectedStoreName}_${registerFilter}`,
      'Goods Receipts Register'
    );
  };

  return (
    <div className="goods-receipts-register-page d-flex flex-column">
      <Container fluid className="p-3 d-flex flex-column flex-grow-1 goods-receipts-register-container">
        <div className="goods-receipts-register-header">
          <ReportHeader
            title="Goods Receipts Register"
            subtitle={subtitle}
            onSearch={setSearchTerm}
            onPrint={printReport}
            onExport={handleExport}
            showSearch={true}
            showPrint={true}
            showExport={true}
          />
        </div>

        <Card className="shadow-sm d-flex flex-column flex-grow-1 goods-receipts-register-card">
          <Card.Header>
            <Form onSubmit={handleSubmit}>
              <Row className="g-3 align-items-end">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Register Filter</Form.Label>
                    <Form.Select value={registerFilter} onChange={handleRegisterFilterChange}>
                      <option value="dateRange">Date Range</option>
                      <option value="grNo">G.R. No.</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                {registerFilter === 'dateRange' ? (
                  <>
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>From Date</Form.Label>
                        <Form.Control
                          type="date"
                          value={dateFrom}
                          onChange={(event) => setDateFrom(event.target.value)}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>To Date</Form.Label>
                        <Form.Control
                          type="date"
                          value={dateTo}
                          onChange={(event) => setDateTo(event.target.value)}
                        />
                      </Form.Group>
                    </Col>
                  </>
                ) : (
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>G.R. No.</Form.Label>
                      <Form.Control
                        type="text"
                        value={grNo}
                        placeholder="Enter G.R. Number"
                        onChange={(event) => setGrNo(event.target.value)}
                      />
                    </Form.Group>
                  </Col>
                )}

                <Col md={2}>
                  <Button type="submit" className="w-100" disabled={loadingRows}>
                    {loadingRows ? 'Loading...' : 'Load Register'}
                  </Button>
                </Col>

                <Col md={1} className="text-md-end">
                  <div className="text-muted goods-receipts-register-count">
                    Records: {displayedRows.length}
                  </div>
                </Col>
              </Row>
            </Form>
          </Card.Header>

          <Card.Body className="p-0 d-flex flex-column goods-receipts-register-card-body">
            <div className="table-responsive flex-grow-1 goods-receipts-register-table-wrap">
              <Table striped bordered hover>
                <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                  <tr>
                    <th>S.No</th>
                    <th>G.R. No.</th>
                    <th>Supplier Name</th>
                    <th>Supplier Address</th>
                    <th>Invoice No.</th>
                    <th>Invoice Date</th>
                    <th>Received Date</th>
                    <th>Total Value</th>
                    <th>MRP Value</th>
                    <th>User</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingRows ? (
                    <tr>
                      <td colSpan={10} className="text-center py-4">
                        Loading goods receipts register...
                      </td>
                    </tr>
                  ) : !hasSearched ? (
                    <tr>
                      <td colSpan={10} className="text-center py-4 text-muted">
                        Apply filters and load the register to view goods receipts.
                      </td>
                    </tr>
                  ) : displayedRows.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center py-4 text-muted">
                        No records found.
                      </td>
                    </tr>
                  ) : (
                    displayedRows.map((row, index) => (
                      <tr
                        key={`${row.grNo}-${index}`}
                        onClick={() => setSelectedReceipt(row)}
                        className="goods-receipts-register-row"
                      >
                        <td>{index + 1}</td>
                        <td>{row.grNo || '-'}</td>
                        <td>{row.supplierName || '-'}</td>
                        <td>{row.supplierAddress || '-'}</td>
                        <td>{row.invoiceNo || '-'}</td>
                        <td>{row.invoiceDate ? formatReportDate(row.invoiceDate, 'DD/MM/YYYY') : '-'}</td>
                        <td>{row.receivedDate ? formatReportDate(row.receivedDate, 'DD/MM/YYYY') : '-'}</td>
                        <td>{(row.totalValue ?? 0).toFixed(2)}</td>
                        <td>{(row.mrpValue ?? 0).toFixed(2)}</td>
                        <td>{row.userName || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      </Container>

      <MedicineDetail
        show={Boolean(selectedReceipt)}
        onHide={() => setSelectedReceipt(null)}
        receipt={selectedReceipt}
        onPrint={printReport}
      />

      <style>{`
        .goods-receipts-register-page {
          height: 100%;
          max-height: 100%;
          min-height: 0;
          overflow: hidden;
        }

        .goods-receipts-register-container {
          height: 100%;
          max-height: 100%;
          min-height: 0;
          overflow: hidden;
          box-sizing: border-box;
        }

        .goods-receipts-register-header {
          flex-shrink: 0;
        }

        .goods-receipts-register-header > div {
          margin-bottom: 1rem !important;
        }

        .goods-receipts-register-card {
          flex: 1 1 0;
          min-height: 0;
          overflow: hidden;
          margin-bottom: 0;
        }

        .goods-receipts-register-card-body {
          flex: 1 1 0;
          min-height: 0;
          overflow: hidden;
        }

        .goods-receipts-register-table-wrap {
          min-height: 0;
          overflow: auto;
        }

        .goods-receipts-register-count {
          font-size: var(--font-size-sm);
        }

        .goods-receipts-register-row {
          cursor: pointer;
        }

      `}</style>
    </div>
  );
};

export default GoodsReceiptsRegister;
