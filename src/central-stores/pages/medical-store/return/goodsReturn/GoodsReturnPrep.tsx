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
  showSuccessModal,
  showValidationError,
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

interface GRNDetails {
  grnNumber: string;
  grnDate: string;
  invoiceNo: string;
  invoiceDate: string;
  vendorName: string;
  vendorGST: string;
  supplierId: number;
  grId?: number;
}

interface ReturnItem {
  sno: number;
  itemName: string;
  genericName: string;
  manufacturer: string;
  batchNo: string;
  expiryDate: string;
  receivedQty: number;
  returnQty: number;
  unit: string;
  remarks: string;
  batchId: number;
  rate: number;
  grId: number;
}

const GoodsReturnPrep: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const loginData = useSelector((state: RootState) => state.loginData);
  const centralStoresApi = new CentralStoresApiService();

  const [subModuleData, setSubModuleData] = useState<SubModuleState | null>(null);
  const [grnDetails, setGrnDetails] = useState<GRNDetails | null>(null);
  const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);
  const [returnNoteNo, setReturnNoteNo] = useState('');
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [showVendorDetails, setShowVendorDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<DealerResponse[]>([]);
  const [currentVendor, setCurrentVendor] = useState<DealerResponse | null>(null);

  useEffect(() => {
    if (!loginData.authorized) {
      navigate('/login');
      return;
    }

    const state = location.state as any;
    if (!state || !state.selectedItems || !state.grnDetails) {
      showErrorModal('No items selected for return');
      // Navigate back to supplier selection based on store type
      const storeType = getStoreType(location.pathname);
      const targetPath = storeType === 'medical'
        ? routerPathNames.centralStores.medicalStore.purchase.selectSupplierDate
        : routerPathNames.centralStores.nonMedicalStore.purchase.selectSupplierDate;
      navigate(targetPath);
      return;
    }

    setSubModuleData(state);
    setGrnDetails(state.grnDetails);

    // Convert selected items to return items
    const items: ReturnItem[] = state.selectedItems.map((item: any, index: number) => {
      
      return {
        sno: index + 1,
        itemName: item.itemName,
        genericName: item.genericName,
        manufacturer: item.manufacturer,
        batchNo: item.batchNo,
        expiryDate: item.expiryDate,
        receivedQty: item.receivedQty,
        returnQty: item.returnQty || 0,
        unit: item.unit,
        remarks: '',
        batchId: item.batchId,
        rate: item.rate,
        grId: item.grId
      };
    });
    
    setReturnItems(items);

    // Generate return note number
    generateReturnNoteNo();

    // Fetch suppliers by storeId
    fetchSuppliers();
  }, [loginData, location.state, navigate]);

  const fetchSuppliers = async () => {
    try {
      const state = location.state as any;
      
      // Get storeId from session storage
      const storedData = getStoreData();
      if (!storedData) {
        return;
      }
      
      const storeId = storedData.masterId;
      
      const suppliersData = await centralStoresApi.fetchDealersByStoreId(storeId);
      setSuppliers(suppliersData);

      // Find and set the current vendor based on supplierId from grnDetails
      if (state?.grnDetails?.supplierId) {
        const vendor = suppliersData.find(s => s.id === state.grnDetails.supplierId);
        if (vendor) {
          setCurrentVendor(vendor);
        }
      }
    } catch (error) {
      handleError(dispatch, error);
    }
  };

  const generateReturnNoteNo = () => {
    // TODO: Replace with actual API call to get next return note number
    const timestamp = Date.now();
    setReturnNoteNo(`RN-${timestamp.toString().slice(-6)}`);
  };

  const handleInputChange = (index: number, field: keyof ReturnItem, value: string | number) => {
    const updatedItems = [...returnItems];
    
    if (field === 'returnQty') {
      const numValue = Number(value);
      if (numValue < 0) return;
      if (numValue > updatedItems[index].receivedQty) {
        showValidationError('Return quantity cannot exceed received quantity');
        return;
      }
    }
    
    (updatedItems[index] as any)[field] = value;
    setReturnItems(updatedItems);
  };

  const handleEditItem = (index: number) => {
    setEditingItemIndex(index);
  };

  const handleSaveEdit = () => {
    if (editingItemIndex !== null) {
      const item = returnItems[editingItemIndex];
      if (item.returnQty <= 0) {
        showValidationError('Please enter return quantity');
        return;
      }
    }
    setEditingItemIndex(null);
  };

  const handleCancelEdit = () => {
    setEditingItemIndex(null);
  };

  const calculateTotals = () => {
    const totalItems = returnItems.length;
    const totalReturnQty = returnItems.reduce((sum, item) => sum + item.returnQty, 0);
    return { totalItems, totalReturnQty };
  };

  const handleSubmit = async () => {
    // Validation
    if (!returnNoteNo.trim()) {
      showValidationError('Return note number is required');
      return;
    }

    if (!returnDate) {
      showValidationError('Return date is required');
      return;
    }

    // Check if at least one item has return quantity
    const hasReturnQty = returnItems.some(item => item.returnQty > 0);
    if (!hasReturnQty) {
      showValidationError('Please enter return quantity for at least one item');
      return;
    }

    setLoading(true);

    try {
      // Get storeId from session storage
      const storedData = getStoreData();
      if (!storedData) {
        showErrorModal('Store information not found. Please refresh and try again.');
        setLoading(false);
        return;
      }

      if (!grnDetails?.grId) {
        showErrorModal('GRN information is missing. Please go back and try again.');
        setLoading(false);
        return;
      }

      // Prepare payload for save API
      const itemsWithReturnQty = returnItems.filter(item => item.returnQty > 0);
      
      // Validate that all items have batchId
      const itemsWithoutBatchId = itemsWithReturnQty.filter(item => !item.batchId);
      if (itemsWithoutBatchId.length > 0) {
        showCustomAlert(
          `Some items are missing batch information.<br><br>Items without batch ID: ${itemsWithoutBatchId.map(i => i.itemName).join(', ')}<br><br>Please go back and try again.`,
          'Data Error',
          'error'
        );
        setLoading(false);
        return;
      }
      
      const payload = {
        dealId: grnDetails.supplierId,
        storeId: storedData.masterId,
        grnBillId: grnDetails.grId,
        details: itemsWithReturnQty.map(item => {
            return {
              batchId: item.batchId,
              quantity: item.returnQty,
              acceptedRate: (item.returnQty) * (item.rate),
              remark: item.remarks || '',
              freeReturn: 0
            };
          })
      };

      // Check if backend endpoint exists
      try {
        await centralStoresApi.savePurchaseReturn(payload);

        const modalResult = await showSuccessModal(
          `Goods return saved successfully!<br><strong>Return Note: ${returnNoteNo}</strong>`,
          'Success!'
        );

        if (modalResult.isConfirmed) {
          const storeType = getStoreType(location.pathname);
          const targetPath = storeType === 'medical'
            ? routerPathNames.centralStores.medicalStore.purchase.selectSupplierDate
            : routerPathNames.centralStores.nonMedicalStore.purchase.selectSupplierDate;

          navigate(targetPath, {
            state: subModuleData
          });
        }
      } catch (apiError: any) {
        if (apiError?.status === 404 || apiError?.response?.status === 404 || apiError?.code === 'ERR_BAD_REQUEST') {
          showCustomAlert(
            `
              <div class="text-start">
                <p><strong>The goods return save API is not yet implemented on the backend server.</strong></p>
                <p class="mb-2">Your goods return data is ready to be saved with the following details:</p>
                <ul>
                  <li><strong>Supplier ID:</strong> ${payload.dealId}</li>
                  <li><strong>Store ID:</strong> ${payload.storeId}</li>
                  <li><strong>GRN Bill ID:</strong> ${payload.grnBillId}</li>
                  <li><strong>Items to Return:</strong> ${payload.details.length}</li>
                  <li><strong>Total Quantity:</strong> ${payload.details.reduce((sum: number, item: any) => sum + item.quantity, 0)}</li>
                </ul>
                <p class="mt-3"><strong>API Endpoint:</strong> <code>POST /v1/central-store/savePurchaseReturn</code></p>
                <details class="mt-2">
                  <summary style="cursor: pointer; color: #0d6efd;"><strong>View Complete Payload (click to expand)</strong></summary>
                  <pre class="text-start mt-2 p-2 bg-light border rounded" style="max-height: 300px; overflow-y: auto; font-size: var(--font-size-sm);">${JSON.stringify(payload, null, 2)}</pre>
                </details>
              </div>
            `,
            'Backend Endpoint Pending',
            'info'
          );
          setLoading(false);
          return;
        }
        throw apiError;
      }

    } catch (error) {
      handleError(dispatch, error);
      showErrorModal('Failed to save goods return. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSelection = () => {
    // Navigate back to supplier selection based on store type
    const storeType = getStoreType(location.pathname);
    const targetPath = storeType === 'medical'
      ? routerPathNames.centralStores.medicalStore.purchase.selectSupplierDate
      : routerPathNames.centralStores.nonMedicalStore.purchase.selectSupplierDate;
    
    navigate(targetPath, { 
      state: subModuleData 
    });
  };

  const { totalItems, totalReturnQty } = calculateTotals();

  return (
    <div className="goods-return-screen d-flex flex-column h-100">
      <div className="container-fluid p-0 h-100 d-flex flex-column">
        <PageHeader 
          title="Goods Return Preparation"
          icon={faUndo}
          subtitle="Enter return details and quantities for selected items"
        />

        <div className="goods-return-content px-3 h-100 overflow-hidden">
          <div className="card flex-grow-1 shadow-sm d-flex flex-column h-100 overflow-hidden goods-return-main-card">
            <div className="card-header goods-return-main-header">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0">Return Note Details</h6>
                <div>
                  <Badge bg="light" text="dark" className="me-2">
                    Total Items: {totalItems}
                  </Badge>
                  <Badge bg="light" text="dark">
                    Total Return Qty: {totalReturnQty}
                  </Badge>
                </div>
              </div>
              <div className="row g-2">
                <div className="col-md-3">
                  <label className="form-label small mb-1">Return Note No <span className="text-danger">*</span></label>
                  <Form.Control 
                    type="text"
                    size="sm"
                    value={returnNoteNo}
                    onChange={(e) => setReturnNoteNo(e.target.value)}
                    placeholder="Auto-generated"
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label small mb-1">Return Date <span className="text-danger">*</span></label>
                  <Form.Control 
                    type="date"
                    size="sm"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label small mb-1">GRN Number</label>
                  <Form.Control 
                    type="text"
                    size="sm"
                    value={grnDetails?.grnNumber || ''}
                    readOnly
                    className="bg-light"
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label small mb-1">Invoice No</label>
                  <Form.Control 
                    type="text"
                    size="sm"
                    value={grnDetails?.invoiceNo || ''}
                    readOnly
                    className="bg-light"
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label small mb-1">Vendor Name</label>
                  <div className="input-group input-group-sm">
                    <Form.Control 
                      type="text"
                      size="sm"
                      value={grnDetails?.vendorName || ''}
                      readOnly
                      className="bg-light"
                    />
                    <Button 
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => setShowVendorDetails(true)}
                      title="View Vendor Details"
                    >
                      <i className="fas fa-info-circle"></i>
                    </Button>
                  </div>
                </div>
              </div>
              <div className="row g-2 mt-1" hidden>
                <div className="col-md-3">
                  <label className="form-label small mb-1">GST No</label>
                  <Form.Control 
                    type="text"
                    size="sm"
                    value={grnDetails?.vendorGST || ''}
                    readOnly
                    className="bg-light"
                  />
                </div>
              </div>
            </div>

            <div className="card-body p-0 d-flex flex-column goods-return-main-body">
              <div className="alert alert-info m-3 mb-2" style={{ fontSize: '0.9rem' }} hidden>
                <i className="fas fa-info-circle me-2"></i>
                <strong>Instructions:</strong> Click <strong>Edit</strong> button for each item to enter return quantity and optional remarks.
              </div>
              <div className="table-responsive flex-grow-1 goods-return-table-wrap">
                <Table striped bordered hover className="mb-0">
                  <thead className="table-light sticky-top" style={{ zIndex: 1 }}>
                    <tr>
                      <th style={{ width: '50px' }}>S.No</th>
                      <th>Item Name</th>
                      <th>Generic Name</th>
                      <th>Manufacturer</th>
                      <th>Batch No</th>
                      <th>Expiry Date</th>
                      <th style={{ width: '100px' }}>Received Qty</th>
                      <th style={{ width: '120px' }}>Return Qty <span className="text-danger">*</span></th>
                      <th>Unit</th>
                      <th style={{ width: '200px' }}>Remarks</th>
                      <th style={{ width: '120px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {returnItems.map((item, index) => {
                      return (
                        <tr key={index}>
                          <td>{item.sno}</td>
                          <td>{item.itemName}</td>
                        <td>{item.genericName}</td>
                        <td>{item.manufacturer}</td>
                        <td>{item.batchNo}</td>
                        <td>{item.expiryDate}</td>
                        <td className="text-end">{item.receivedQty}</td>
                        <td>
                          {editingItemIndex === index ? (
                            <Form.Control
                              type="number"
                              value={item.returnQty}
                              onChange={(e) => handleInputChange(index, 'returnQty', e.target.value)}
                              min="0"
                              max={item.receivedQty}
                              autoFocus
                            />
                          ) : (
                            <div className="text-end">
                              {item.returnQty > 0 ? (
                                <strong className="text-danger">{item.returnQty}</strong>
                              ) : (
                                <span className="text-muted">0</span>
                              )}
                            </div>
                          )}
                        </td>
                        <td>{item.unit}</td>
                        <td>
                          {editingItemIndex === index ? (
                            <Form.Control
                              type="text"
                              value={item.remarks}
                              onChange={(e) => handleInputChange(index, 'remarks', e.target.value)}
                              placeholder="Optional"
                            />
                          ) : (
                            <span className="text-muted">{item.remarks || '-'}</span>
                          )}
                        </td>
                        <td>
                          {editingItemIndex === index ? (
                            <div className="btn-group btn-group-sm">
                              <Button
                                variant="success"
                                size="sm"
                                onClick={handleSaveEdit}
                                title="Save"
                              >
                                <i className="fas fa-check"></i>
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleCancelEdit}
                                title="Cancel"
                              >
                                <i className="fas fa-times"></i>
                              </Button>
                            </div>
                          ) : (
                            <Button
                              className='theme-btn-secondary'
                              size="sm"
                              onClick={() => handleEditItem(index)}
                              title="Edit"
                            >
                              <i className="fas fa-edit me-1"></i>
                              Edit
                            </Button>
                          )}
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            </div>

            <div className="card-footer goods-return-main-footer">
              <div className="d-flex justify-content-end gap-2">
                <Button 
                  variant="secondary" 
                  onClick={handleBackToSelection}
                  disabled={loading}
                >
                  <i className="fas fa-arrow-left me-2"></i>
                  Back to Selection
                </Button>
                <Button 
                  variant="success" 
                  onClick={handleSubmit}
                  disabled={loading || totalReturnQty === 0}
                >
                  <i className="fas fa-save me-2"></i>
                  {loading ? 'Submitting...' : 'Submit Return'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .goods-return-screen {
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

      {/* Vendor Details Modal */}
      <Modal 
        show={showVendorDetails} 
        onHide={() => setShowVendorDetails(false)}
        centered
      >
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <i className="fas fa-building me-2"></i>
            Vendor Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentVendor ? (
            <table className="table table-bordered">
              <tbody>
                <tr>
                  <th style={{ width: '40%' }}>Vendor Name:</th>
                  <td>{currentVendor.name}</td>
                </tr>
                <tr>
                  <th>GST Number:</th>
                  <td>{currentVendor.gstNo || 'N/A'}</td>
                </tr>
                <tr>
                  <th>Address:</th>
                  <td>{currentVendor.address || 'N/A'}</td>
                </tr>
                <tr>
                  <th>City:</th>
                  <td>{currentVendor.city || 'N/A'}</td>
                </tr>
                <tr>
                  <th>State:</th>
                  <td>{currentVendor.state || 'N/A'}</td>
                </tr>
                <tr>
                  <th>PIN:</th>
                  <td>{currentVendor.pin || 'N/A'}</td>
                </tr>
                <tr>
                  <th>Phone Number:</th>
                  <td>{currentVendor.phone || 'N/A'}</td>
                </tr>
                <tr>
                  <th>Email:</th>
                  <td>{currentVendor.email || 'N/A'}</td>
                </tr>
                <tr>
                  <th>Delivery Time:</th>
                  <td>{currentVendor.deliveryTime || 'N/A'}</td>
                </tr>
                <tr>
                  <th>Payment Time:</th>
                  <td>{currentVendor.paymentTime || 'N/A'}</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <div className="text-center text-muted p-4">
              <i className="fas fa-exclamation-circle fa-3x mb-3"></i>
              <p>No vendor details available</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowVendorDetails(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default GoodsReturnPrep;
