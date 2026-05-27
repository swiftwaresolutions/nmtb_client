import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../../../state/store';
import { routerPathNames } from '../../../../../routes/routerPathNames';
import { Modal, Badge, Button, Table, Form } from 'react-bootstrap';
import '../../../../../style/commonStyle.css';
import CentralStoresApiService from '../../../../../api/central-stores/central-stores-api-service';
import type { PurchaseOrderResponse, PreGoodsReceiptResponse } from '../../../../../api/central-stores/central-stores-api-service';
import { handleError } from '../../../../../utils/errorUtil';
import { showConfirmDialog, showErrorToast, showSuccessToast, showWarningModal } from '../../../../../utils/alertUtil';
import PageHeader from '../../../../../components/PageHeader';
import { faFileInvoice } from '@fortawesome/free-solid-svg-icons';

interface SubModuleState {
  subModId: number;
  subModName: string;
  modGroupId: number;
  modGroupName: string;
  masterId: number;
}

interface POItem {
  sno: number;
  itemName: string;
  genericName: string;
  manufacturer: string;
  orderedQty: number;
  receivedQty: number;
  pendingQty: number;
  unit: string;
  selected: boolean;
  selectionOrder?: number;
  isPreSaved?: number;
  isConfirmed?: number;
}

interface ApprovedPO {
  id: number;
  poNumber: string;
  poDate: string;
  vendorName: string;
  vendorGST: string;
  supplierId: number;
  totalItems: number;
  totalQty: number;
  fullyReceivedItems: number;
  pendingItems: number;
  savedItems: number;
  status: 'Approved' | 'Partially Received' | 'Completed';
  items: POItem[];
}

const SelectApprovedPO: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const loginData = useSelector((state: RootState) => state.loginData);
  const centralStoresApi = new CentralStoresApiService();
  const [subModuleData, setSubModuleData] = useState<SubModuleState | null>(null);
  const [approvedPOs, setApprovedPOs] = useState<ApprovedPO[]>([]);
  const [selectedPO, setSelectedPO] = useState<ApprovedPO | null>(null);
  const [showItemSelectionModal, setShowItemSelectionModal] = useState(false);
  const [selectAllItems, setSelectAllItems] = useState(false);
  const [selectionCounter, setSelectionCounter] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedPOPreGoodsReceipts, setSelectedPOPreGoodsReceipts] = useState<PreGoodsReceiptResponse[]>([]);
  const [vendorFilter, setVendorFilter] = useState('all');

  const vendorOptions = useMemo(() => {
    const names = Array.from(new Set(approvedPOs.map(po => po.vendorName).filter(Boolean)));
    return names.sort((a, b) => a.localeCompare(b));
  }, [approvedPOs]);

  const filteredApprovedPOs = useMemo(() => {
    if (vendorFilter === 'all') return approvedPOs;
    return approvedPOs.filter(po => po.vendorName === vendorFilter);
  }, [approvedPOs, vendorFilter]);

  useEffect(() => {
    if (!loginData.authorized) {
      navigate('/login');
      return;
    }

    const state = location.state as SubModuleState;
    if (state) {
      setSubModuleData(state);
    } else {
      // Get store data from session storage
      const storeDataStr = sessionStorage.getItem('selectedStore');
      if (storeDataStr) {
        const storeData = JSON.parse(storeDataStr);
        setSubModuleData(storeData);
      }
    }

    // Load approved POs
    loadApprovedPOs();
  }, [loginData, location.state, navigate]);

  const loadApprovedPOs = async () => {
    try {
      setLoading(true);
      
      // Get storeId from session storage
      const storeDataStr = sessionStorage.getItem('selectedStore');
      if (!storeDataStr) {
        showErrorToast('Store information not found. Please select a store.');
        return;
      }
      
      const storeData = JSON.parse(storeDataStr);
      const storeId = storeData.masterId;
      
      console.log('Fetching approved purchase orders for storeId:', storeId);
      const allOrders: PurchaseOrderResponse[] = await centralStoresApi.fetchAllPurchaseOrders();
      
      // Filter for approved orders matching storeId
      const filteredOrders = allOrders.filter(order => 
        order.isApproved === 1 && 
        order.isClosed === 0 && 
        order.isFinished === 0 &&
        order.storeId === storeId
      );
      
      console.log('Total orders:', allOrders.length);
      console.log('Filtered orders for store:', filteredOrders.length);
      console.log('First filtered order sample:', filteredOrders[0]);
      
      // Map to ApprovedPO format using fetchAllPurchaseOrders enriched details
      const mappedPOs: ApprovedPO[] = filteredOrders.map(order => {
        const totalReceived = order.details.reduce((sum, item) => sum + item.recUnits, 0);
        const totalOrdered = order.details.reduce((sum, item) => sum + item.qty, 0);
        
        // Calculate fully received items (isFullyReceived === 1)
        const fullyReceivedItems = order.details.filter(item => item.isFullyReceived === 1).length;
        
        // Calculate pending items (isFullyReceived === 0)
        const pendingItemsCount = order.details.filter(item => item.isFullyReceived === 0).length;
        
        // Use orderId as primary, fallback to id or poId
        const orderId = order.orderId || (order as any).id || (order as any).poId;
        const savedCount = order.details.filter(item => item.isPreSaved === 1).length;
        
        return {
          id: orderId,
          poNumber: order.poNo,
          poDate: order.orderDateTime.split('T')[0],
          vendorName: order.supplierName || 'Unknown Vendor',
          vendorGST: '',
          supplierId: order.supId,
          totalItems: order.details.length,
          totalQty: totalOrdered,
          fullyReceivedItems: fullyReceivedItems,
          pendingItems: pendingItemsCount,
          savedItems: savedCount,
          status: totalReceived === 0 ? 'Approved' : totalReceived < totalOrdered ? 'Partially Received' : 'Completed',
          items: order.details.map((detail, index) => ({
            sno: index + 1,
            itemName: detail.medicineName || 'Unknown Item',
            genericName: detail.genericName || 'N/A',
            manufacturer: '',
            orderedQty: detail.qty,
            receivedQty: detail.recUnits,
            pendingQty: detail.qty - detail.recUnits,
            unit: detail.units.toString(),
            selected: false,
            isPreSaved: detail.isPreSaved,
            isConfirmed: 0
          }))
        };
      });
      
      // Filter out POs where all items are confirmed (pendingItems === 0)
      const posWithPendingItems = mappedPOs.filter(po => po.pendingItems > 0);
      
      console.log('Total mapped POs:', mappedPOs.length);
      console.log('POs with pending items:', posWithPendingItems.length);
      console.log('POs sample:', posWithPendingItems[0]);
      setApprovedPOs(posWithPendingItems);
    } catch (error) {
      console.error('Error loading approved POs:', error);
      handleError(dispatch, error);
      showErrorToast('Failed to load approved purchase orders');
    } finally {
      setLoading(false);
    }
  };

  const handlePOSelect = async (po: ApprovedPO) => {
    try {
      setLoading(true);
      
      console.log('Selected PO object:', po);
      console.log('PO ID:', po.id);
      console.log('PO ID type:', typeof po.id);
      
      // Validate po.id exists
      if (!po.id || po.id === undefined || po.id === null) {
        showErrorToast('Invalid purchase order ID');
        setLoading(false);
        return;
      }

      // Fetch pre-goods receipt data only when user selects a PO
      const preGoodsReceipts = await centralStoresApi.fetchPreGoodsReceiptByOrderId(po.id);
      setSelectedPOPreGoodsReceipts(preGoodsReceipts || []);
      
      setSelectedPO({
        ...po,
        items: po.items.map(item => ({
          ...item,
          selected: false,
          selectionOrder: undefined
        }))
      });
      setSelectAllItems(false);
      setShowItemSelectionModal(true);
    } catch (error) {
      console.error('Error loading PO details:', error);
      handleError(dispatch, error);
      showErrorToast('Failed to load purchase order details');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAllItems = (checked: boolean) => {
    setSelectAllItems(checked);
    if (selectedPO) {
      let counter = selectionCounter;
      setSelectedPO({
        ...selectedPO,
        items: selectedPO.items.map(item => {
          if (item.pendingQty > 0) {
            if (checked) {
              counter++;
              return { ...item, selected: checked, selectionOrder: counter };
            } else {
              return { ...item, selected: checked, selectionOrder: undefined };
            }
          }
          return item;
        })
      });
      setSelectionCounter(checked ? counter : 0);
    }
  };

  const handleItemSelect = (sno: number, checked: boolean) => {
    if (selectedPO) {
      setSelectedPO({
        ...selectedPO,
        items: selectedPO.items.map(item => {
          if (item.sno === sno && item.pendingQty > 0) {
            if (checked) {
              const newOrder = selectionCounter + 1;
              setSelectionCounter(newOrder);
              return { ...item, selected: checked, selectionOrder: newOrder };
            } else {
              return { ...item, selected: checked, selectionOrder: undefined };
            }
          }
          return item;
        })
      });
    }
  };

  const handleProceedToPurchaseEntry = async () => {
    if (!selectedPO) return;

    const selectedItems = selectedPO.items
      .filter(item => item.selected && item.pendingQty > 0)
      .sort((a, b) => (a.selectionOrder || 0) - (b.selectionOrder || 0));

    if (selectedItems.length === 0) {
      showWarningModal('Please select at least one item to proceed', 'No Items Selected');
      return;
    }

    try {
      setLoading(true);

      const preGoodsReceipts = selectedPOPreGoodsReceipts;
      if (!preGoodsReceipts || preGoodsReceipts.length === 0) {
        showErrorToast('Pre-goods receipt data not loaded. Please select the PO again.');
        setLoading(false);
        return;
      }

      // Create a map of item names to selection order
      const selectionOrderMap = new Map();
      selectedItems.forEach((item, index) => {
        selectionOrderMap.set(item.itemName, item.selectionOrder || index + 1);
      });
      
      // Filter and sort preGoodsReceipts based on selected items order
      const sortedPreGoodsReceipts = preGoodsReceipts
        .filter(receipt => {
          // Only include receipts for selected items
          return selectedItems.some(item => item.itemName === receipt.productName);
        })
        .sort((a, b) => {
          // Sort by selection order
          const orderA = selectionOrderMap.get(a.productName) || 999;
          const orderB = selectionOrderMap.get(b.productName) || 999;
          return orderA - orderB;
        });
      
      console.log('🔢 Sorted pre-goods receipts by selection order:', sortedPreGoodsReceipts);

      // Detect current store type from URL path
      const currentPath = location.pathname;
      const isNonMedicalStore = currentPath.includes('/non-medical-store');
      
      // Navigate to the appropriate store's purchase entry page
      const targetPath = isNonMedicalStore 
        ? routerPathNames.centralStores.nonMedicalStore.purchase.entry
        : routerPathNames.centralStores.medicalStore.purchase.entry;

      // Navigate to purchase entry with selected PO, items, and complete API data
      navigate(targetPath, {  // ✅ NOW USES DYNAMIC PATH
        state: {
          ...subModuleData,
          orderId: selectedPO.id,
          poNumber: selectedPO.poNumber,
          commonVendor: {
            id: selectedPO.supplierId?.toString() || '',
            name: selectedPO.vendorName,
            gstNo: selectedPO.vendorGST,
            address: '',
            contactPerson: '',
            phoneNo: ''
          },
          preGoodsReceipts: sortedPreGoodsReceipts,
          selectedItems: selectedItems.map(item => ({
            productName: item.itemName,
            genericName: item.genericName,
            companyName: item.manufacturer,
            quantity: item.pendingQty,
            units: item.unit
          }))
        }
      });
    } catch (error) {
      console.error('Error fetching pre-goods receipt data:', error);
      handleError(dispatch, error);
      showErrorToast('Failed to load purchase entry data');
    } finally {
      setLoading(false);
    }
  };

  const handleClosePO = async () => {
    if (!selectedPO) return;

    const result = await showConfirmDialog(
      `PO ${selectedPO.poNumber} will be marked as closed.`,
      'Close This PO?',
      'Yes, Close PO',
      'Cancel'
    );

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      await centralStoresApi.closePurchaseOrder({
        orderId: selectedPO.id,
        closedUid: loginData.id
      });

      showSuccessToast('Purchase order closed successfully.');
      setShowItemSelectionModal(false);
      setSelectedPO(null);
      setSelectedPOPreGoodsReceipts([]);
      setSelectAllItems(false);
      setSelectionCounter(0);
      await loadApprovedPOs();
    } catch (error) {
      console.error('Error closing purchase order:', error);
      handleError(dispatch, error);
      showErrorToast('Failed to close purchase order');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <Badge bg="success"><i className="fas fa-check-circle me-1"></i>{status}</Badge>;
      case 'Partially Received':
        return <Badge bg="warning" text="dark"><i className="fas fa-clock me-1"></i>{status}</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const selectedItemsCount = selectedPO?.items.filter(item => item.selected).length || 0;

  return (
    <div className="spo-screen d-flex flex-column h-100">
      <PageHeader
            icon={faFileInvoice}
            title="Select Approved Purchase Order"
            subtitle="Choose an approved PO to proceed with purchase entry"
            badges={[
              { label: 'Store', value: subModuleData?.subModName || 'N/A' },
              { label: 'Approved POs', value: approvedPOs.length.toString() }
            ]}
          />

      <div className="spo-content px-2 px-lg-3 pb-3 h-100">
          <div className="card border-0 shadow-sm spo-main-card">
            <div className="card-header spo-main-header">
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                <div className="d-flex align-items-center gap-2">
                  <Badge bg="light" text="dark" className="border">
                    Showing: {filteredApprovedPOs.length}
                  </Badge>
                  <Badge bg="light" text="dark" className="border">
                    Total: {approvedPOs.length}
                  </Badge>
                </div>
                <div className="spo-filter-wrap">
                  <Form.Select
                    size="sm"
                    value={vendorFilter}
                    onChange={(e) => setVendorFilter(e.target.value)}
                  >
                    <option value="all">All Vendors</option>
                    {vendorOptions.map((vendor) => (
                      <option key={vendor} value={vendor}>
                        {vendor}
                      </option>
                    ))}
                  </Form.Select>
                </div>
              </div>
            </div>

            <div className="card-body p-0 d-flex flex-column spo-main-body">
              {filteredApprovedPOs.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-inbox fa-4x text-muted mb-3"></i>
                  <h5 className="text-muted">No Approved Purchase Orders</h5>
                  <p className="text-muted small">No records found for selected vendor filter</p>
                </div>
              ) : (
                <div className="spo-table-scroll">
                  <Table hover className="mb-0" style={{ width: '100%' }}>
                    <thead style={{ backgroundColor: 'var(--table-header-bg)', color: 'var(--table-header-text)', position: 'sticky', top: 0, zIndex: 1 }}>
                      <tr>
                        <th className="py-3" style={{ width: '4%' }}>#</th>
                        <th className="py-3" style={{ width: '10%' }}>PO No</th>
                        <th className="py-3" style={{ width: '10%' }}>PO Date</th>
                        <th className="py-3" style={{ width: '24%' }}>Vendor Details</th>
                        <th className="py-3" style={{ width: '8%', whiteSpace: 'nowrap' }}>Total Items</th>
                        <th className="py-3" style={{ width: '8%', whiteSpace: 'nowrap' }}>Saved Items</th>
                        <th className="py-3" style={{ width: '10%', whiteSpace: 'nowrap' }}>Fully Received</th>
                        <th className="py-3" style={{ width: '10%', whiteSpace: 'nowrap' }}>Pending Items</th>
                        <th className="py-3 text-center" style={{ width: '10%' }} hidden>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredApprovedPOs.map((po, index) => (
                        <tr 
                          key={po.id}
                          onClick={() => {
                            if (po.pendingItems > 0) {
                              handlePOSelect(po);
                            }
                          }}
                          style={{ cursor: po.pendingItems === 0 ? 'default' : 'pointer' }}
                        >
                          <td className="align-middle text-center">
                            <div className="rounded-circle bg-light d-inline-flex align-items-center justify-content-center" 
                                 style={{ width: '32px', height: '32px' }}>
                              <span className="fw-bold" style={{ color: '#667eea' }}>{index + 1}</span>
                            </div>
                          </td>
                          <td className="align-middle">
                            <div className="fw-bold" style={{color: 'var(--page-secondary-color)'}}>{po.poNumber}</div>
                          </td>
                          <td className="align-middle">
                            <i className="fas fa-calendar-alt me-2 text-muted"></i>
                            <span>{new Date(po.poDate).toLocaleDateString('en-GB')}</span>
                          </td>
                          <td className="align-middle">
                            <div className="fw-semibold">{po.vendorName}</div>
                            <small className="text-muted">GST: {po.vendorGST}</small>
                          </td>
                          <td className="align-middle text-center">
                            <Badge bg="light" text="dark" className="border px-3 py-2">
                              <i className="fas fa-boxes me-2" style={{ color: '#667eea' }}></i>
                              {po.totalItems}
                            </Badge>
                          </td>
                          <td className="align-middle text-center">
                            <Badge bg="light" text="dark" className="border px-3 py-2" style={{ backgroundColor: po.savedItems > 0 ? '#d1e7dd' : '#f8f9fa' }}>
                              <i className="fas fa-check-circle me-2" style={{ color: po.savedItems > 0 ? '#28a745' : '#6c757d' }}></i>
                              {po.savedItems}
                            </Badge>
                          </td>
                          <td className="align-middle text-center">
                            <Badge bg="light" text="dark" className="border px-3 py-2" style={{ backgroundColor: po.fullyReceivedItems > 0 ? '#d1e7dd' : '#f8f9fa' }}>
                              <i className="fas fa-check-double me-2" style={{ color: po.fullyReceivedItems > 0 ? '#28a745' : '#6c757d' }}></i>
                              {po.fullyReceivedItems}
                            </Badge>
                          </td>
                          <td className="align-middle text-center">
                            <Badge bg="light" text="dark" className="border px-3 py-2" style={{ backgroundColor: po.pendingItems > 0 ? '#fff3cd' : '#d1e7dd' }}>
                              <i className="fas fa-hourglass-half me-2"></i>
                              {po.pendingItems}
                            </Badge>
                          </td>
                          <td className="align-middle text-center" onClick={(e) => e.stopPropagation()} hidden>
                            <Button 
                              size="sm"
                              variant="primary"
                              onClick={() => handlePOSelect(po)}
                              disabled={po.pendingItems === 0}
                            >
                              <i className="fas fa-arrow-right me-2"></i>
                              Select
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </div>
          </div>
      </div>

      {/* Item Selection Modal */}
      <Modal show={showItemSelectionModal} onHide={() => setShowItemSelectionModal(false)} size="xl" centered>
        <Modal.Header closeButton className="border-0" style={{ backgroundColor: 'var(--page-header-bg)' }}>
          <Modal.Title style={{ color: 'var(--page-header-text)' }}>
            <i className="fas fa-list-check me-2"></i>
            Select Items for Purchase Entry - {selectedPO?.poNumber}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="alert alert-info mb-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <i className="fas fa-info-circle me-2"></i>
                <strong>Vendor:</strong> {selectedPO?.vendorName} | <strong>GST:</strong> {selectedPO?.vendorGST}
              </div>
              <Form.Check
                id="select-all-pending-items-modal"
                type="checkbox"
                label={<strong>Select All Pending Items</strong>}
                checked={selectAllItems}
                onChange={(e) => handleSelectAllItems(e.target.checked)}
                className="mb-0"
              />
            </div>
          </div>

          <div style={{ overflowY: 'auto' }}>
            <Table hover bordered className="mb-0">
              <thead style={{ backgroundColor: 'var(--page-header-bg)', color: 'var(--page-header-text)', position: 'sticky', top: 0, zIndex: 1 }}>
                <tr>
                  <th className="py-3" style={{ width: '5%' }}>
                    <Form.Check
                      id="modal-table-select-all"
                      type="checkbox"
                      checked={selectAllItems}
                      onChange={(e) => handleSelectAllItems(e.target.checked)}
                    />
                  </th>
                  <th className="py-3" style={{ width: '5%' }}>S.No</th>
                  <th className="py-3" style={{ width: '22%' }}>Item Name</th>
                  <th className="py-3" style={{ width: '13%' }}>Generic Name</th>
                  <th className="py-3" style={{ width: '13%' }}>Manufacturer</th>
                  <th className="py-3" style={{ width: '10%', whiteSpace: 'nowrap' }}>Ordered Qty</th>
                  <th className="py-3" style={{ width: '10%', whiteSpace: 'nowrap' }}>Received Qty</th>
                  <th className="py-3" style={{ width: '10%', whiteSpace: 'nowrap' }}>Pending Qty</th>
                  <th className="py-3" style={{ width: '6%' }}>Unit</th>
                </tr>
              </thead>
              <tbody>
                {selectedPO?.items.map((item) => (
                  <tr 
                    key={item.sno}
                    className={item.selected ? 'table-active' : ''}
                    onClick={() => {
                      if (item.pendingQty > 0) {
                        handleItemSelect(item.sno, !item.selected);
                      }
                    }}
                    style={{ cursor: item.pendingQty === 0 ? 'default' : 'pointer' }}
                  >
                    <td className="text-center" onClick={(e) => e.stopPropagation()}>
                      <Form.Check
                        type="checkbox"
                        checked={item.selected}
                        onChange={(e) => handleItemSelect(item.sno, e.target.checked)}
                        disabled={item.pendingQty === 0}
                      />
                    </td>
                    <td className="text-center">{item.sno}</td>
                    <td>
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="fw-semibold">{item.itemName}</div>
                        <div>
                          {item.pendingQty === 0 && item.receivedQty > 0 && (
                            <Badge bg="success" className="ms-2">
                              <i className="fas fa-check-double me-1"></i>
                              Fully Received
                            </Badge>
                          )}
                          {item.receivedQty > 0 && item.pendingQty > 0 && (
                            <Badge bg="info" className="ms-2">
                              <i className="fas fa-clock me-1"></i>
                              Partially Received
                            </Badge>
                          )}
                          {item.isPreSaved === 1 && item.isConfirmed === 0 && (
                            <Badge bg="warning" text="dark" className="ms-2">
                              <i className="fas fa-save me-1"></i>
                              Saved
                            </Badge>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>{item.genericName}</td>
                    <td>{item.manufacturer}</td>
                    <td className="text-center">
                      <Badge bg="primary">{item.orderedQty}</Badge>
                    </td>
                    <td className="text-center">
                      <Badge bg="success">{item.receivedQty}</Badge>
                    </td>
                    <td className="text-center">
                      <Badge bg={item.pendingQty > 0 ? 'warning' : 'secondary'} text="dark">
                        {item.pendingQty}
                      </Badge>
                    </td>
                    <td className="text-center">
                      <small>{item.unit}</small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {selectedPO && (
            <div className="mt-3 p-3 bg-light rounded">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>Selected Items: </strong>
                  <span className="fs-6 fw-bold" style={{color: 'var(--page-secondary-color)'}}>{selectedItemsCount}</span>
                  <span className="text-secondary fs-6 ms-2">of {selectedPO.items.filter(i => i.pendingQty > 0).length} pending items</span>
                </div>
                <div>
                  <strong>Total Pending Quantity: </strong>
                  <span className="text-warning fs-6">
                    {selectedPO.items.filter(i => i.selected).reduce((sum, item) => sum + item.pendingQty, 0)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 bg-light">
          <Button variant="secondary" onClick={() => setShowItemSelectionModal(false)}>
            <i className="fas fa-times me-2"></i>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleClosePO}
            disabled={!selectedPO || loading}
          >
            <i className="fas fa-ban me-2"></i>
            {loading ? 'Closing PO...' : 'Close PO'}
          </Button>
          <Button 
            variant="primary"
            onClick={handleProceedToPurchaseEntry}
            disabled={selectedItemsCount === 0 || loading}
          >
            <i className="fas fa-arrow-right me-2"></i>
            Proceed to Purchase Entry ({selectedItemsCount} items)
          </Button>
        </Modal.Footer>
      </Modal>

      <style>{`
        .spo-screen {
          height: 100vh;
          overflow: hidden;
          background-color: var(--page-body-bg);
        }

        .spo-content {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
        }

        .spo-main-card {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
        }

        .spo-main-header {
          background-color: var(--page-header-bg);
          border-bottom: 1px solid var(--border-color);
        }

        .spo-filter-wrap {
          min-width: 260px;
        }

        .spo-main-body {
          flex: 1;
          min-height: 0;
        }

        .spo-table-scroll {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
        }

        .sticky-top {
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .card {
          border-radius: 10px;
        }

        .btn {
          border-radius: 6px;
          font-weight: 500;
        }

        .badge {
          border-radius: 6px;
        }

        .table-hover tbody tr:hover {
          background-color: rgba(102, 126, 234, 0.05);
        }

        .table-active {
          background-color: rgba(102, 126, 234, 0.1) !important;
        }

        @media (max-width: 576px) {
          .spo-filter-wrap {
            min-width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default SelectApprovedPO;