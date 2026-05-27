import React, { useEffect, useMemo, useState } from 'react';
import { Card, Col, Container, Form, Row, Table } from 'react-bootstrap';
import {
  CentralStoresApiService,
  ActiveStore,
  StockRegisterData,
} from '../../../../../api/central-stores/central-stores-api-service';
import ReportHeader from '../../../../../medical-records/components/ReportHeader';
import {
  exportToExcel,
  printReport,
  searchTableData,
} from '../../../../../medical-records/utils/reportUtils';
import { showErrorModal, showWarningModal } from '../../../../../utils/alertUtil';
import { handleError } from '../../../../../utils/errorUtil';
import { useDispatch } from 'react-redux';

type RegisterFilterType = 'storeWise' | 'zeroStock';

interface SessionStoreData {
  masterId?: number;
  modGroupId?: number;
}

const AllStockRegister: React.FC = () => {
  const dispatch = useDispatch();
  const centralStoresApi = useMemo(() => new CentralStoresApiService(), []);

  const [registerFilter, setRegisterFilter] = useState<RegisterFilterType>('storeWise');
  const [stores, setStores] = useState<ActiveStore[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<number>(0);
  const [rows, setRows] = useState<StockRegisterData[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loadingStores, setLoadingStores] = useState<boolean>(false);
  const [loadingRows, setLoadingRows] = useState<boolean>(false);

  const selectedStoreName = useMemo(() => {
    const selected = stores.find((store) => store.id === selectedStoreId);
    return selected?.storeName || 'Store';
  }, [selectedStoreId, stores]);

  const displayedRows = useMemo(() => {
    return searchTableData(rows, searchTerm, [
      'genericName',
      'medicineName',
      'medicineCode',
      'transferNo',
      'damageNo',
      'orderBillNo',
      'returnNo',
    ]);
  }, [rows, searchTerm]);

  useEffect(() => {
    const loadStores = async () => {
      try {
        setLoadingStores(true);

        const selectedStoreRaw = sessionStorage.getItem('selectedStore');
        const pharmacyStoreRaw = sessionStorage.getItem('pharmacySubModuleData');

        const selectedStore = selectedStoreRaw
          ? (JSON.parse(selectedStoreRaw) as SessionStoreData)
          : null;
        const pharmacyStore = pharmacyStoreRaw
          ? (JSON.parse(pharmacyStoreRaw) as SessionStoreData)
          : null;

        const sessionMasterId = Number(
          selectedStore?.masterId ?? pharmacyStore?.masterId ?? 0
        );

        const allStores = await centralStoresApi.fetchAllActiveStores();
        setStores(allStores);

        const matchedStore = allStores.find((store) => store.id === sessionMasterId);

        if (matchedStore) {
          setSelectedStoreId(matchedStore.id);
        } else if (allStores.length > 0) {
          setSelectedStoreId(allStores[0].id);
        }
      } catch (error) {
        handleError(dispatch, error);
        showErrorModal('Failed to load stores. Please try again.', 'Error');
      } finally {
        setLoadingStores(false);
      }
    };

    loadStores();
  }, [centralStoresApi, dispatch]);

  useEffect(() => {
    const loadRegisterData = async () => {
      if (!selectedStoreId) {
        return;
      }

      try {
        setLoadingRows(true);

        const response =
          registerFilter === 'storeWise'
            ? await centralStoresApi.fetchStockRegister(selectedStoreId, '', '')
            : await centralStoresApi.fetchZeroStockRegister(selectedStoreId, '', '');

        setRows(Array.isArray(response) ? response : []);
      } catch (error) {
        handleError(dispatch, error);
        showErrorModal('Failed to load stock register data. Please try again.', 'Error');
        setRows([]);
      } finally {
        setLoadingRows(false);
      }
    };

    loadRegisterData();
  }, [centralStoresApi, dispatch, registerFilter, selectedStoreId]);

  const handleStoreChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextStoreId = Number(event.target.value);
    if (!nextStoreId) {
      showWarningModal('Please select a valid store.', 'Invalid Store');
      return;
    }
    setSelectedStoreId(nextStoreId);
  };

  const handleExport = () => {
    const exportData = displayedRows.map((row, index) => ({
      'S.No': index + 1,
      'Generic Name': row.genericName || '-',
      'Medicine Name': row.medicineName || '-',
      'Medicine Code': row.medicineCode || '-',
      Stock: row.stock ?? 0,
      'Transfer Qty': row.transferQty ?? 0,
      'Transfer No': row.transferNo || '-',
      'Damage Qty': row.damageQty ?? 0,
      'Damage No': row.damageNo || '-',
      'Order Qty': row.orderQty ?? 0,
      'Order Bill No': row.orderBillNo || '-',
      'Return Qty': row.returnQty ?? 0,
      'Return No': row.returnNo || '-',
      'Available Stock': row.availableStock ?? 0,
    }));

    exportToExcel(
      exportData,
      `All_Stock_Register_${selectedStoreName}_${registerFilter}`,
      'All Stock Register'
    );
  };

  return (
    <div className="all-stock-register-page d-flex flex-column">
      <Container fluid className="p-3 d-flex flex-column flex-grow-1 all-stock-register-container">
        <div className="all-stock-register-header">
          <ReportHeader
            title="All Stock Register"
            subtitle={`${selectedStoreName} - ${registerFilter === 'storeWise' ? 'Store Wise' : 'Zero Stock'}`}
            onSearch={setSearchTerm}
            onPrint={printReport}
            onExport={handleExport}
            showSearch={true}
            showPrint={true}
            showExport={true}
          />
        </div>

        <Card className="shadow-sm d-flex flex-column flex-grow-1 all-stock-register-card">
          <Card.Header>
            <Row className="g-3 align-items-end">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Register Filter</Form.Label>
                  <Form.Select
                    value={registerFilter}
                    onChange={(event) =>
                      setRegisterFilter(event.target.value as RegisterFilterType)
                    }
                  >
                    <option value="storeWise">Store Wise</option>
                    <option value="zeroStock">Zero Stock</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Stores</Form.Label>
                  <Form.Select
                    value={selectedStoreId || ''}
                    onChange={handleStoreChange}
                    disabled={loadingStores || stores.length === 0}
                  >
                    {stores.length === 0 && <option value="">No stores available</option>}
                    {stores.map((store) => (
                      <option
                        key={store.id}
                        value={store.id}
                        style={
                          store.isStore === 1
                            ? {
                                backgroundColor: 'var(--color-warning)',
                                color: 'var(--color-text)',
                                fontWeight: 'var(--font-weight-semibold)',
                              }
                            : undefined
                        }
                      >
                        {store.isStore === 1 ? `${store.storeName}  |  Store` : store.storeName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={2} className="text-md-end">
                <div className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>
                  Records: {displayedRows.length}
                </div>
              </Col>
            </Row>
          </Card.Header>

          <Card.Body className="p-0 d-flex flex-column all-stock-register-card-body">
            <div className="table-responsive flex-grow-1 all-stock-register-table-wrap">
              <Table striped bordered hover>
                <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
                  <tr>
                    <th>S.No</th>
                    <th>Generic Name</th>
                    <th>Medicine Name</th>
                    <th>Medicine Code</th>
                    <th>Stock</th>
                    <th>Transfer Qty</th>
                    <th>Transfer No</th>
                    <th>Damage Qty</th>
                    <th>Damage No</th>
                    <th>Order Qty</th>
                    <th>Order Bill No</th>
                    <th>Return Qty</th>
                    <th>Return No</th>
                    <th>Available Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingRows ? (
                    <tr>
                      <td colSpan={14} className="text-center py-4">
                        Loading stock register...
                      </td>
                    </tr>
                  ) : displayedRows.length === 0 ? (
                    <tr>
                      <td colSpan={14} className="text-center py-4 text-muted">
                        No records found.
                      </td>
                    </tr>
                  ) : (
                    displayedRows.map((row, index) => (
                      <tr key={`${row.productId}-${index}`}>
                        <td>{index + 1}</td>
                        <td>{row.genericName || '-'}</td>
                        <td>{row.medicineName || '-'}</td>
                        <td>{row.medicineCode || '-'}</td>
                        <td>{row.stock ?? 0}</td>
                        <td>{row.transferQty ?? 0}</td>
                        <td>{row.transferNo || '-'}</td>
                        <td>{row.damageQty ?? 0}</td>
                        <td>{row.damageNo || '-'}</td>
                        <td>{row.orderQty ?? 0}</td>
                        <td>{row.orderBillNo || '-'}</td>
                        <td>{row.returnQty ?? 0}</td>
                        <td>{row.returnNo || '-'}</td>
                        <td>{row.availableStock ?? 0}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      </Container>

      <style>{`
        .all-stock-register-page {
          height: 100%;
          max-height: 100%;
          min-height: 0;
          overflow: hidden;
        }

        .all-stock-register-container {
          height: 100%;
          max-height: 100%;
          min-height: 0;
          overflow: hidden;
          box-sizing: border-box;
        }

        .all-stock-register-header {
          flex-shrink: 0;
        }

        .all-stock-register-header > div {
          margin-bottom: 1rem !important;
        }

        .all-stock-register-card {
          flex: 1 1 0;
          min-height: 0;
          overflow: hidden;
          margin-bottom: 0;
        }

        .all-stock-register-card-body {
          flex: 1 1 0;
          min-height: 0;
          overflow: hidden;
        }

        .all-stock-register-table-wrap {
          min-height: 0;
          overflow: auto;
        }
      `}</style>
    </div>
  );
};

export default AllStockRegister;
