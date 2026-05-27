import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../../../state/store';
import { routerPathNames } from '../../../../../routes/routerPathNames';
import { Modal, Badge, Button, Table, Form } from 'react-bootstrap';
import '../../../../../style/commonStyle.css';
import CentralStoresApiService, { DealerResponse } from '../../../../../api/central-stores/central-stores-api-service';
import { handleError } from '../../../../../utils/errorUtil';
import {
  showCustomAlert,
  showErrorModal,
  showInfoToast,
  showSuccessToast,
  showValidationError,
  showWarningToast,
} from '../../../../../utils/alertUtil';
import PageHeader from '../../../../../components/PageHeader';
import { faUndo } from '@fortawesome/free-solid-svg-icons';

interface SubModuleState {
  subModId: number;
  subModName: string;
  modGroupId: number;
  modGroupName: string;
  masterId: number;
}

// Utility function to get store data from session storage
const getStoreData = (): SubModuleState | null => {
  // Try Central Stores first
  const centralStoresData = sessionStorage.getItem('selectedStore');
  if (centralStoresData) {
    return JSON.parse(centralStoresData);
  }
  
  // Try Pharmacy Stores
  const pharmacyData = sessionStorage.getItem('pharmacySubModuleData');
  if (pharmacyData) {
    const parsedData = JSON.parse(pharmacyData);
    // Override masterId to 1 for pharmacy data
    return { ...parsedData, masterId: parsedData.masterId ?? 0 };
  }
  
  return null;
};

// Helper function to determine store type from pathname
const getStoreType = (pathname: string): 'medical' | 'nonMedical' => {
  return pathname.includes('non-medical-store') ? 'nonMedical' : 'medical';
};

interface GRNItem {
  sno: number;
  itemName: string;
  genericName: string;
  manufacturer: string;
  batchTotalStock: number;
  receivedQty: number;
  returnedQty: number;
  returnQty: number;
  unit: string;
  batchNo: string;
  expiryDate: string;
  selected: boolean;
  selectionOrder?: number;
  batchId: number;
  rate: number;
  grId: number;
}

interface GoodsReceipt {
  id: number;
  grnNumber: string;
  grnDate: string;
  invoiceNo: string;
  invoiceDate: string;
  vendorName: string;
  vendorGST: string;
  supplierId: number;
  totalItems: number;
  totalQty: number;
  status: 'Received' | 'Partially Returned' | 'Fully Returned';
  items: GRNItem[];
}

const SelectSupplierDate: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const loginData = useSelector((state: RootState) => state.loginData);
  const centralStoresApi = new CentralStoresApiService();
  const [subModuleData, setSubModuleData] = useState<SubModuleState | null>(null);
  const [suppliers, setSuppliers] = useState<DealerResponse[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [fromDate, setFromDate] = useState(new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [goodsReceipts, setGoodsReceipts] = useState<GoodsReceipt[]>([]);
  const [selectedGRN, setSelectedGRN] = useState<GoodsReceipt | null>(null);
  const [showItemSelectionModal, setShowItemSelectionModal] = useState(false);
  const [selectAllItems, setSelectAllItems] = useState(false);
  const [selectionCounter, setSelectionCounter] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showGRNList, setShowGRNList] = useState(false);

  useEffect(() => {
    if (!loginData.authorized) {
      navigate('/login');
      return;
    }

    // Try to get state from location first, then fallback to session storage
    const state = location.state as SubModuleState;
    if (state) {
      setSubModuleData(state);
    } else {
      // Fallback to session storage if no state in location
      const storedData = getStoreData();
      if (storedData) {
        setSubModuleData(storedData);
      }
    }
  }, [loginData, location.state, navigate]);

  // Load suppliers when subModuleData is available
  useEffect(() => {
    if (subModuleData) {
      loadSuppliers();
    }
  }, [subModuleData]);

  const loadSuppliers = async () => {
    try {
      // Use subModuleData state if available, otherwise try session storage
      const storeData = subModuleData || getStoreData();
      if (!storeData) {
        console.error('Store data not found in state or session storage');
        showErrorModal('Store information not found. Please refresh and try again.');
        return;
      }

      const storeId = storeData.masterId;
      console.log('Loading suppliers for storeId:', storeId);
      
      const response = await centralStoresApi.fetchDealersByStoreId(storeId);
      console.log('Suppliers loaded:', response.length);
      setSuppliers(response);
    } catch (error) {
      console.error('Error loading suppliers:', error);
      handleError(dispatch, error);
      showErrorModal('Failed to load suppliers. Please try again.');
    }
  };

  const handleSearch = async () => {
    if (!selectedSupplier) {
      showValidationError('Please select a supplier');
      return;
    }
    if (!fromDate || !toDate) {
      showValidationError('Please select date range');
      return;
    }

    const storedData = getStoreData();
    if (!storedData) {
      showErrorModal('Store information not found. Please refresh and try again.');
      return;
    }

    setLoading(true);
    try {
      const response = await centralStoresApi.fetchGoodsReceiptDetailsBySupplier(
        parseInt(selectedSupplier),
        fromDate,
        toDate,
        storedData.masterId
      );

      // Map API response to GoodsReceipt interface
      const mappedReceipts: GoodsReceipt[] = response.map((gr, index) => {
        // Check if any products are missing batchId
        const productsWithoutBatchId = gr.productDetails.filter(p => !p.batchId);
        if (productsWithoutBatchId.length > 0) {
          showCustomAlert(
            `
              <div class="text-start">
                <p><strong>The backend API is not returning required data.</strong></p>
                <p class="mt-2">Missing field: <code>batchId</code></p>
                <p class="mt-2"><strong>API Endpoint:</strong><br>
                <code>GET /v1/central-store/fetchGoodsReceiptDetailsBySupplier</code></p>
                <p class="mt-2"><strong>Required in response:</strong></p>
                <pre class="bg-light p-2 rounded">productDetails: [
  {
    prodsName: string,
    genName: string,
    compName: string,
    batchNo: string,
    expDate: string,
    availQty: number,
    receivedQty: number,
    rate: number,
    <span class="text-danger fw-bold">batchId: number</span>  ← Missing!
  }
]</pre>
                <p class="mt-2">Please contact the backend team to add <code>batchId</code> to the response.</p>
              </div>
            `,
            'Backend API Issue',
            'error'
          );
        }
        
        return {
          id: gr.grId,
          grnNumber: gr.grNo,
          grnDate: gr.grDate,
          invoiceNo: gr.invNo,
          invoiceDate: gr.invDate,
          vendorName: gr.dealerName,
          vendorGST: suppliers.find(s => s.id === parseInt(selectedSupplier))?.gstNo || '',
          supplierId: parseInt(selectedSupplier),
          totalItems: gr.productDetails.length,
          totalQty: gr.productDetails.reduce((sum, p) => sum + p.receivedQty, 0),
          status: 'Received',
          items: gr.productDetails.map((product, idx) => {
            return {
              sno: idx + 1,
              itemName: product.prodsName,
              genericName: product.genName,
              manufacturer: product.compName,
              batchTotalStock: product.availQty,
              receivedQty: product.receivedQty,
              returnedQty: product.returnedQty,
              returnQty: 0,
              unit: 'Units', // API doesn't provide unit, using default
              batchNo: product.batchNo,
              expiryDate: product.expDate,
              selected: false,
              batchId: product.batchId || 0, // Use 0 as fallback if missing
              rate: product.rate,
              grId: gr.grId
            };
          })
        };
      });

      setGoodsReceipts(mappedReceipts);
      setShowGRNList(true);
      
      // Show success message
      if (mappedReceipts.length > 0) {
        showSuccessToast(`Found ${mappedReceipts.length} goods receipt(s)`, 'Search Complete', 2000);
      } else {
        showInfoToast('No goods receipts found for the selected criteria', 'No Records Found', 2000);
      }
    } catch (error) {
      handleError(dispatch, error);
      showErrorModal('Failed to fetch goods receipts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGRN = (grn: GoodsReceipt) => {
    setSelectedGRN({ 
      ...grn, 
      items: grn.items.map(item => ({ ...item, selected: false, selectionOrder: undefined })) 
    });
    setSelectAllItems(false);
    setSelectionCounter(0);
    setShowItemSelectionModal(true);
  };

  const handleSelectAllToggle = () => {
    if (!selectedGRN) return;
    
    const newSelectAll = !selectAllItems;
    setSelectAllItems(newSelectAll);
    
    if (newSelectAll) {
      let counter = 1;
      const updatedItems = selectedGRN.items.map(item => ({
        ...item,
        selected: true,
        selectionOrder: counter++
      }));
      setSelectedGRN({ ...selectedGRN, items: updatedItems });
      setSelectionCounter(counter - 1);
    } else {
      const updatedItems = selectedGRN.items.map(item => ({
        ...item,
        selected: false,
        selectionOrder: undefined
      }));
      setSelectedGRN({ ...selectedGRN, items: updatedItems });
      setSelectionCounter(0);
    }
  };

  const handleItemSelection = (index: number) => {
    if (!selectedGRN) return;

    const item = selectedGRN.items[index];
    const updatedItems = [...selectedGRN.items];

    if (item.selected) {
      updatedItems[index] = { ...item, selected: false, selectionOrder: undefined, returnQty: 0 };
      setSelectionCounter(prev => prev - 1);
    } else {
      const newCounter = selectionCounter + 1;
      updatedItems[index] = { ...item, selected: true, selectionOrder: newCounter, returnQty: 0 };
      setSelectionCounter(newCounter);
    }

    setSelectedGRN({ ...selectedGRN, items: updatedItems });
    
    const allSelected = updatedItems.every(item => item.selected);
    setSelectAllItems(allSelected);
  };

  const handleReturnQtyChange = (index: number, value: string) => {
    if (!selectedGRN) return;

    const numValue = value === '' ? 0 : parseInt(value);
    const item = selectedGRN.items[index];
    
    // Validation: Return qty cannot exceed pending receivable qty or batch total stock
    const pendingReceivableQty = Math.max(item.receivedQty - item.returnedQty, 0);
    const maxAllowed = Math.min(pendingReceivableQty, item.batchTotalStock);
    
    if (numValue > maxAllowed) {
      showWarningToast(
        `Return quantity cannot exceed ${maxAllowed} (Limited by Pending Qty: ${pendingReceivableQty} and Batch Stock: ${item.batchTotalStock})`,
        'Invalid Quantity',
        3000
      );
      return;
    }

    if (numValue < 0) {
      showWarningToast('Return quantity cannot be negative', 'Invalid Quantity', 2000);
      return;
    }

    const updatedItems = [...selectedGRN.items];
    updatedItems[index] = { ...item, returnQty: numValue };
    setSelectedGRN({ ...selectedGRN, items: updatedItems });
  };

  const handleProceedToReturn = () => {
    if (!selectedGRN) return;

    const selectedItems = selectedGRN.items
      .filter(item => item.selected)
      .sort((a, b) => (a.selectionOrder || 0) - (b.selectionOrder || 0));

    if (selectedItems.length === 0) {
      showValidationError('Please select at least one item to return', 'Selection Required');
      return;
    }

    // Check if all selected items have return qty greater than 0
    const itemsWithoutQty = selectedItems.filter(item => !item.returnQty || item.returnQty === 0);
    if (itemsWithoutQty.length > 0) {
      showValidationError(
        `Please enter return quantity for all selected items. ${itemsWithoutQty.length} item(s) have no return quantity.`,
        'Return Quantity Required'
      );
      return;
    }

    // Ensure subModuleData is available
    if (!subModuleData) {
      showErrorModal('Store information not found. Please refresh the page and try again.');
      return;
    }

    // Prepare state to pass
    const navigationState = {
      ...subModuleData,
      selectedItems,
      grnDetails: {
        grnNumber: selectedGRN.grnNumber,
        grnDate: selectedGRN.grnDate,
        invoiceNo: selectedGRN.invoiceNo,
        invoiceDate: selectedGRN.invoiceDate,
        vendorName: selectedGRN.vendorName,
        vendorGST: selectedGRN.vendorGST,
        supplierId: selectedGRN.supplierId,
        grId: selectedGRN.id
      }
    };

    // Determine which store type and navigate to appropriate path
    const storeType = getStoreType(location.pathname);
    const targetPath = storeType === 'medical' 
      ? routerPathNames.centralStores.medicalStore.purchase.goodsReturnPrep
      : routerPathNames.centralStores.nonMedicalStore.purchase.goodsReturnPrep;

    // Navigate to GoodsReturnPrep with selected items
    navigate(targetPath, {
      state: navigationState
    });
  };

  return (
    <div className="goods-return-screen d-flex flex-column h-100">
      <PageHeader
        title="Goods Return - Select Supplier & Date"
        icon={faUndo}
        subtitle="Select supplier and date range to view goods receipts for return"
        badges={[
          { label: 'Store', value: subModuleData?.subModName || 'N/A' },
          { label: 'GRNs', value: goodsReceipts.length.toString() }
        ]}
      />

      <div className="goods-return-content px-3 h-100 overflow-hidden">
        <div className="card flex-grow-1 shadow-sm d-flex flex-column h-100 overflow-hidden goods-return-main-card">
          <div className="card-header goods-return-main-header">
            <div className="row g-2 align-items-end">
              <div className="col-md-4">
                <label className="form-label mb-1">Supplier <span className="text-danger">*</span></label>
                <Form.Select
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                  disabled={loading}
                >
                  <option value="">-- Select Supplier --</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </Form.Select>
              </div>
              <div className="col-md-3">
                <label className="form-label mb-1">From Date <span className="text-danger">*</span></label>
                <Form.Control
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  max={toDate}
                  disabled={loading}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label mb-1">To Date <span className="text-danger">*</span></label>
                <Form.Control
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  disabled={loading}
                />
              </div>
              <div className="col-md-2 d-grid">
                <Button
                  variant="primary"
                  onClick={handleSearch}
                  disabled={loading}
                >
                  <i className="fas fa-search me-2"></i>
                  {loading ? 'Searching...' : 'Search'}
                </Button>
              </div>
            </div>
          </div>

          <div className="card-body p-0 d-flex flex-column goods-return-main-body">
            <div className="table-responsive flex-grow-1 goods-return-table-wrap">
              {!showGRNList ? (
                <div className="text-center text-muted py-5">
                  <i className="fas fa-search fa-3x mb-3 d-block" style={{ opacity: 0.3 }}></i>
                  <p className="mb-0">Select supplier and date range, then click Search to view GRNs.</p>
                </div>
              ) : goodsReceipts.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                  <p className="text-muted mb-0">No goods receipts found for the selected criteria</p>
                </div>
              ) : (
                <Table striped bordered hover className="mb-0">
                  <thead className="sticky-top" style={{ backgroundColor: 'var(--table-header-bg)', color: 'var(--table-header-text)' }}>
                    <tr>
                      <th>#</th>
                      <th>GRN Number</th>
                      <th>GRN Date</th>
                      <th>Invoice No</th>
                      <th>Invoice Date</th>
                      <th>Vendor</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {goodsReceipts.map((grn, index) => (
                      <tr
                        key={grn.id}
                        onClick={() => handleSelectGRN(grn)}
                        style={{ cursor: 'pointer' }}
                        title="Click to select items"
                      >
                        <td>{index + 1}</td>
                        <td><strong>{grn.grnNumber}</strong></td>
                        <td>{grn.grnDate}</td>
                        <td>{grn.invoiceNo}</td>
                        <td>{grn.invoiceDate}</td>
                        <td>{grn.vendorName}</td>
                        <td>
                          <Button
                            size="sm"
                            className="theme-outline-btn-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectGRN(grn);
                            }}
                          >
                            <i className="fas fa-check-circle me-1"></i>
                            Select Items
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </div>
          </div>

          <div className="card-footer goods-return-main-footer">
            <div className="d-flex justify-content-end">
              <Badge bg="light" text="dark" className="border">
                {showGRNList ? `${goodsReceipts.length} Record(s) Found` : 'No Search Performed'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .goods-return-screen {
          // min-height: 100vh;
          overflow: hidden;
          background-color: var(--page-body-bg);
        }

        .goods-return-content {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          padding-bottom: 0 !important;
        }

        .goods-return-main-card {
          border: 1px solid var(--border-color);
          min-height: 0;
        }

        .goods-return-main-header {
          background-color: var(--page-header-bg);
          border-bottom: 1px solid var(--border-color);
          padding: 0.75rem 1rem;
        }

        .goods-return-main-body {
          flex: 1;
          min-height: 0;
        }

        .goods-return-table-wrap {
          min-height: 0;
          overflow-y: auto;
        }

        .goods-return-main-footer {
          background-color: var(--page-header-bg);
          border-top: 1px solid var(--border-color);
          padding: 0.75rem 1rem;
          flex-shrink: 0;
        }
      `}</style>

      {/* Item Selection Modal */}
      <Modal 
        show={showItemSelectionModal} 
        onHide={() => setShowItemSelectionModal(false)}
        size="xl"
        centered
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton className="bg-light border-bottom">
          <Modal.Title className="fw-bold d-flex align-items-center gap-2">
            <i className="fas fa-check-square me-2"></i>
            Select Items to Return - {selectedGRN?.grnNumber}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0 d-flex flex-column" style={{ maxHeight: 'calc(100vh - 120px)' }}>
          {selectedGRN && (
            <>
              <div className="p-3 bg-light border-bottom">
                <div className="row g-2 align-items-center">
                  <div className="col-md-9">
                    <div className="small text-muted fw-medium">GRN Summary</div>
                    <div className="fw-bold">{selectedGRN.grnNumber}</div>
                    <div className="small text-muted">
                      Date: {selectedGRN.grnDate} | Invoice: {selectedGRN.invoiceNo} | Vendor: {selectedGRN.vendorName}
                    </div>
                  </div>
                  <div className="col-md-3 text-md-end">
                    <div className="small text-muted">Selected Items</div>
                    <div className="fw-bold">{selectionCounter}</div>
                  </div>
                </div>
              </div>

              <div className="flex-grow-1 overflow-auto" style={{ minHeight: 0 }}>
                <div className="p-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div className="small fw-bold text-muted text-uppercase">Item Selection</div>
                    <Form.Check 
                      type="checkbox"
                      id="select-all"
                      label={<strong>Select All Items</strong>}
                      checked={selectAllItems}
                      onChange={handleSelectAllToggle}
                    />
                  </div>

                  <div className="table-responsive">
                    <Table striped bordered hover size="sm" className="mb-0">
                      <thead className="bg-light sticky-top" style={{ zIndex: 10 }}>
                        <tr>
                          <th style={{ width: '50px' }}>Select</th>
                          <th style={{ width: '50px' }} hidden>Order</th>
                          <th style={{ width: '60px' }}>S.No</th>
                          <th>Item Name</th>
                          <th hidden>Generic Name</th>
                          <th hidden>Manufacturer</th>
                          <th>Batch No</th>
                          <th>Expiry Date</th>
                          <th className="text-end">Batch Total Stock</th>
                          <th className="text-end">Received Qty</th>
                          <th className="text-end">Returned Qty</th>
                          <th style={{ width: '120px' }}>Return Qty</th>
                          <th>Unit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedGRN.items.map((item, index) => (
                          <tr 
                            key={index}
                            className={item.selected ? 'table-success' : ''}
                            onClick={() => handleItemSelection(index)}
                            style={{ cursor: 'pointer' }}
                            title="Click to select/deselect item"
                          >
                            <td className="text-center">
                              <Form.Check 
                                type="checkbox"
                                checked={item.selected}
                                onChange={() => handleItemSelection(index)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </td>
                            <td className="text-center" hidden>
                              {item.selectionOrder && (
                                <Badge bg="primary">{item.selectionOrder}</Badge>
                              )}
                            </td>
                            <td>{item.sno}</td>
                            <td>{item.itemName}</td>
                            <td hidden>{item.genericName}</td>
                            <td hidden>{item.manufacturer}</td>
                            <td>{item.batchNo}</td>
                            <td>{item.expiryDate}</td>
                            <td className="text-end">
                              <Badge bg="info">{item.batchTotalStock}</Badge>
                            </td>
                            <td className="text-end">{item.receivedQty}</td>
                            <td className="text-end">{item.returnedQty}</td>
                            <td>
                              <Form.Control
                                type="number"
                                min="0"
                                max={Math.min((item.receivedQty - item.returnedQty), item.batchTotalStock)}
                                value={item.returnQty || ''}
                                onChange={(e) => handleReturnQtyChange(index, e.target.value)}
                                disabled={!item.selected}
                                placeholder="0"
                                className="text-end"
                                style={{ width: '100px' }}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </td>
                            <td>{item.unit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </div>
              </div>

              <div className="p-3 border-top">
                <div className="alert alert-warning mb-3" hidden>
                  <i className="fas fa-info-circle me-2"></i>
                  <strong>{selectionCounter}</strong> item(s) selected for return
                </div>
                <div className="d-flex justify-content-end gap-2">
                  <Button variant="secondary" onClick={() => setShowItemSelectionModal(false)}>
                    <i className="fas fa-times me-2"></i>
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={handleProceedToReturn}
                    disabled={selectionCounter === 0}
                  >
                    <i className="fas fa-arrow-right me-2"></i>
                    Proceed to Return ({selectionCounter} items)
                  </Button>
                </div>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default SelectSupplierDate;
