import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../../../state/store';
import { Modal, Badge, Button, Form, Table } from 'react-bootstrap';
import Swal from 'sweetalert2';
import '../../../../../style/commonStyle.css';
import CentralStoresApiService from '../../../../../api/central-stores/central-stores-api-service';
import SearchableSelect from '../../../../../components/SearchableSelect';
import type { PurchaseOrderResponse, FetchProductsForPOResponse } from '../../../../../api/central-stores/central-stores-api-service';
import { handleError } from '../../../../../utils/errorUtil';
import PageHeader from '../../../../../components/PageHeader';
import { faClipboardCheck } from '@fortawesome/free-solid-svg-icons';

interface SubModuleState {
  subModId: number;
  subModName: string;
  modGroupId: number;
  modGroupName: string;
  masterId: number;
}

interface OrderItem {
  id: number;
  medId: number;  // Medicine ID for API
  medicineName: string;
  genericName: string;
  unit: number;
  supplierId: number;
  supplierName: string;
}

interface PendingOrder {
  id: number;
  orderNumber: string;
  orderDate: string;
  totalItems: number;
  totalQuantity: number;
  fullyReceivedItems: number;
  pendingItems: number;
  status: string;
  items: OrderItem[];
}

const ApproveOrder: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const loginData = useSelector((state: RootState) => state.loginData);
  const centralStoresApi = new CentralStoresApiService();
  const [subModuleData, setSubModuleData] = useState<SubModuleState | null>(null);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<PendingOrder | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [editingItems, setEditingItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<{ id: number; name: string }[]>([]);
  const [commonVendorId, setCommonVendorId] = useState<number | null>(null);
  const [supplierMap, setSupplierMap] = useState<Map<number, string>>(new Map());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [orderMode, setOrderMode] = useState<'phone' | 'letter'>('phone');
  const [showAddMedicineRow, setShowAddMedicineRow] = useState(false);
  const [addMedicineSearch, setAddMedicineSearch] = useState('');
  const [addMedicineResults, setAddMedicineResults] = useState<FetchProductsForPOResponse[]>([]);
  const [selectedNewItem, setSelectedNewItem] = useState<FetchProductsForPOResponse | null>(null);
  const [newItemUnit, setNewItemUnit] = useState(1);
  const [addMedicineLoading, setAddMedicineLoading] = useState(false);

  useEffect(() => {
    if (!loginData.authorized) {
      navigate('/login');
      return;
    }

    const state = location.state as SubModuleState;
    let resolvedData: SubModuleState | null = null;
    if (state) {
      resolvedData = state;
    } else {
      const storeDataStr = sessionStorage.getItem('selectedStore');
      if (storeDataStr) {
        resolvedData = JSON.parse(storeDataStr) as SubModuleState;
      }
    }
    if (resolvedData) {
      setSubModuleData(resolvedData);
      loadApprovalData(resolvedData.masterId);
    }
  }, [loginData, location.state, navigate]);

  useEffect(() => {
    if (addMedicineSearch.trim().length < 2 || selectedNewItem) {
      setAddMedicineResults([]);
      return;
    }
    const storeId = subModuleData?.masterId ?? 0;
    const timer = setTimeout(async () => {
      setAddMedicineLoading(true);
      try {
        const results = await centralStoresApi.fetchProductsForPO(storeId, addMedicineSearch.trim());
        setAddMedicineResults(Array.isArray(results) ? results : []);
      } catch {
        setAddMedicineResults([]);
      } finally {
        setAddMedicineLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [addMedicineSearch, selectedNewItem]);

  const handleAddNewMedicine = () => {
    if (!selectedNewItem) {
      Swal.fire('Warning', 'Please search and select a medicine first', 'warning');
      return;
    }
    if (newItemUnit <= 0) {
      Swal.fire('Warning', 'Please enter a valid quantity', 'warning');
      return;
    }
    if (editingItems.find(item => item.medId === selectedNewItem.prodsId)) {
      Swal.fire('Warning', 'This medicine is already in the order', 'warning');
      return;
    }
    const newItem: OrderItem = {
      id: -Date.now(),
      medId: selectedNewItem.prodsId,
      medicineName: selectedNewItem.medicineName,
      genericName: selectedNewItem.genericName,
      unit: newItemUnit,
      supplierId: commonVendorId ?? 0,
      supplierName: commonVendorId ? (supplierMap.get(commonVendorId) || '') : ''
    };
    setEditingItems(prev => [...prev, newItem]);
    setHasUnsavedChanges(true);
    setShowAddMedicineRow(false);
    setAddMedicineSearch('');
    setAddMedicineResults([]);
    setSelectedNewItem(null);
    setNewItemUnit(1);
    Swal.fire({ title: 'Added!', text: 'Medicine added to order', icon: 'success', timer: 1200, showConfirmButton: false });
  };

  const loadApprovalData = async (storeId: number) => {
    try {
      setLoading(true);

      const [suppliersResponse, ordersResponse] = await Promise.all([
        centralStoresApi.fetchDealersByStoreId(storeId),
        centralStoresApi.fetchPurchaseOrdersForApproval(storeId)
      ]);

      const supMap = new Map<number, string>();
      const suppliersList = suppliersResponse.map(s => ({ id: s.id, name: s.name }));
      suppliersResponse.forEach(supplier => {
        supMap.set(supplier.id, supplier.name);
      });
      setSupplierMap(supMap);
      setSuppliers(suppliersList);

      const validOrders = ordersResponse.filter(order => {
        const id = order.orderId;
        if (id == null || id === undefined) return false;
        const numId = Number(id);
        return !isNaN(numId) && numId > 0;
      });

      const mapped: PendingOrder[] = validOrders.map(order => {
        const supplierName = order.supplierName || supMap.get(order.supId) || 'Unknown Supplier';
        const fullyReceivedItems = order.details.filter(detail => detail.isFullyReceived === 1).length;
        const pendingItems = order.details.filter(detail => detail.isFullyReceived === 0).length;

        return {
          id: Number(order.orderId),
          orderNumber: order.poNo,
          orderDate: order.orderDateTime.split('T')[0],
          totalItems: order.details.length,
          totalQuantity: order.details.reduce((sum, item) => sum + item.qty, 0),
          fullyReceivedItems,
          pendingItems,
          status: 'Pending',
          items: order.details.map(detail => ({
            id: detail.id,
            medId: detail.medId,
            medicineName: detail.medicineName || 'Unknown Medicine',
            genericName: detail.genericName || 'N/A',
            unit: detail.qty,
            supplierId: order.supId,
            supplierName
          }))
        };
      });

      setPendingOrders(mapped);
    } catch (error) {
      console.error('Error loading approval data:', error);
      handleError(dispatch, error);
      Swal.fire('Error', 'Failed to load approval data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderClick = (order: PendingOrder) => {
    console.log('📋 Order clicked - Order object:', { 
      id: order.id, 
      idType: typeof order.id,
      idValue: order.id,
      isValidId: order.id > 0,
      orderNumber: order.orderNumber, 
      fullOrder: order 
    });
    setSelectedOrder(order);
    setEditingItems([...order.items]);
    setCommonVendorId(order.items[0]?.supplierId || null);
    setHasUnsavedChanges(false);
    setShowOrderModal(true);
  };

  const handleCloseModal = () => {
    setShowOrderModal(false);
    setSelectedOrder(null);
    setEditingItems([]);
    setCommonVendorId(null);
    setHasUnsavedChanges(false);
    setShowAddMedicineRow(false);
    setAddMedicineSearch('');
    setAddMedicineResults([]);
    setSelectedNewItem(null);
    setNewItemUnit(1);
  };

  const handleUnitChange = (itemId: number, newUnit: number) => {
    setEditingItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, unit: newUnit } : item
      )
    );
    setHasUnsavedChanges(true);
  };

  const handleVendorChange = (itemId: number, newSupplierId: number) => {
    const supplierName = supplierMap.get(newSupplierId) || 'Unknown Supplier';
    setEditingItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, supplierId: newSupplierId, supplierName } : item
      )
    );
    setHasUnsavedChanges(true);
  };

  const handleCommonVendorChange = async (newSupplierId: number) => {
    const result = await Swal.fire({
      title: 'Apply Vendor to All Items?',
      html: `<p>Do you want to apply this vendor to:</p>`,
      icon: 'question',
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: 'Apply to All',
      denyButtonText: 'Only New Items',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#667eea',
      denyButtonColor: '#6c757d',
      cancelButtonColor: '#dc3545'
    });

    const supplierName = supplierMap.get(newSupplierId) || 'Unknown Supplier';

    if (result.isConfirmed) {
      // Apply to all items
      setEditingItems(prev => 
        prev.map(item => ({ ...item, supplierId: newSupplierId, supplierName }))
      );
      setCommonVendorId(newSupplierId);
      setHasUnsavedChanges(true);
      Swal.fire({
        title: 'Applied!',
        text: 'Vendor applied to all items',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } else if (result.isDenied) {
      // Only set as default for future items
      setCommonVendorId(newSupplierId);
      Swal.fire({
        title: 'Set as Default',
        text: 'This vendor will be used for new items only',
        icon: 'info',
        timer: 1500,
        showConfirmButton: false
      });
    }
  };

  const handleDeleteItem = (itemId: number) => {
    Swal.fire({
      title: 'Remove Item?',
      text: 'Are you sure you want to remove this item from the purchase order?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Remove',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        setEditingItems(prev => prev.filter(item => item.id !== itemId));
        setHasUnsavedChanges(true);
        Swal.fire({
          title: 'Removed!',
          text: 'Item removed from purchase order',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

  const handleSaveChanges = async () => {
    if (editingItems.length === 0) {
      Swal.fire('Error', 'Purchase order must have at least one item', 'error');
      return;
    }

    if (!selectedOrder) return;

    // Check if all items have valid quantities
    const invalidItems = editingItems.filter(item => item.unit <= 0);
    if (invalidItems.length > 0) {
      Swal.fire('Error', 'All items must have quantity greater than 0', 'error');
      return;
    }

    try {
      // Get storeId from session storage to ensure we have the latest
      // const storeDataStr = sessionStorage.getItem('selectedStore');
      // const storeId = storeDataStr ? JSON.parse(storeDataStr).masterId : (subModuleData?.masterId || 0);
      // console.log("storeId",storeId);
      // console.log('Saving changes with storeId:', storeId);
      // console.log('Store data from session:', storeDataStr);

      const storeId = subModuleData?.masterId ?? 0;
      
      // Prepare update payload
      const updatePayload = {
        poNo: selectedOrder.orderNumber,
        supId: commonVendorId ?? 0,
        orderDateTime: new Date().toISOString(),
        prepareLetter: orderMode === 'letter' ? 1 : 0,
        isByPhone: orderMode === 'phone' ? 1 : 0,
        deptId: 0,
        invoiceNo: '',
        storeId: storeId,
        details: editingItems.map(item => ({
          id: item.id < 0 ? 0 : item.id,
          medId: item.medId,
          qty: item.unit,
          pack: 1,
          units: 0,
          quotationDetId: 0,
          batchQuoted: 0,
          cpQuoted: 0,
          freeQuoted: 0,
          negotiateAmt: 0
        }))
      };

      await centralStoresApi.updatePurchaseOrder(selectedOrder.id, updatePayload);
      
      Swal.fire({
        title: 'Saved!',
        text: 'Purchase order changes saved successfully',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      
      // Update local state
      setPendingOrders(prev => 
        prev.map(order => 
          order.id === selectedOrder?.id 
            ? { ...order, items: editingItems, totalItems: editingItems.length, totalQuantity: editingItems.reduce((sum, item) => sum + item.unit, 0) }
            : order
        )
      );
      
      // Clear unsaved changes flag
      setHasUnsavedChanges(false);
      
      handleCloseModal();
    } catch (error) {
      console.error('Error saving changes:', error);
      handleError(dispatch, error);
      Swal.fire('Error', 'Failed to save changes', 'error');
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;

    const result = await Swal.fire({
      title: 'Cancel Purchase Order?',
      html: `<p>Are you sure you want to cancel this purchase order?</p><p>PO Number: <strong>${selectedOrder?.orderNumber}</strong></p><p>This action cannot be undone.</p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Cancel Order',
      cancelButtonText: 'No, Keep Order'
    });

    if (result.isConfirmed) {
      try {
        // Validate order ID
        if (selectedOrder.id === null || selectedOrder.id === undefined || selectedOrder.id <= 0 || isNaN(selectedOrder.id)) {
          console.error('❌ CANCEL ERROR: Invalid order ID:', selectedOrder.id);
          Swal.fire('Error', 'Invalid order ID. Please close and reopen the order.', 'error');
          return;
        }

        // Validate user ID
        if (!loginData.id || loginData.id <= 0) {
          console.error('❌ CANCEL ERROR: Invalid user ID:', loginData.id);
          Swal.fire('Error', 'User ID not found. Please login again.', 'error');
          return;
        }

        // Prepare close payload
        const closePayload = {
          orderId: selectedOrder.id,
          closedUid: loginData.id
        };

        await centralStoresApi.closePurchaseOrder(closePayload);
        
        Swal.fire({
          title: 'Cancelled!',
          text: 'Purchase order cancelled successfully',
          icon: 'success',
          confirmButtonColor: '#28a745'
        });
        
        // Remove from pending orders
        setPendingOrders(prev => prev.filter(order => order.id !== selectedOrder?.id));
        handleCloseModal();
      } catch (error) {
        console.error('Error cancelling order:', error);
        handleError(dispatch, error);
        Swal.fire('Error', 'Failed to cancel order', 'error');
      }
    }
  };

  const handleApproveOrder = async () => {
    if (editingItems.length === 0) {
      Swal.fire('Error', 'Cannot approve an empty purchase order', 'error');
      return;
    }

    if (!selectedOrder) return;

    // Check if there are unsaved changes
    if (hasUnsavedChanges) {
      Swal.fire({
        icon: 'warning',
        title: 'Unsaved Changes',
        text: 'You have unsaved changes. Please save the changes before approving the order.',
        confirmButtonColor: '#667eea',
        confirmButtonText: 'OK'
      });
      return;
    }

    // Check if all items have valid quantities
    const invalidItems = editingItems.filter(item => item.unit <= 0);
    if (invalidItems.length > 0) {
      Swal.fire('Error', 'All items must have quantity greater than 0', 'error');
      return;
    }

    const result = await Swal.fire({
      title: 'Approve Purchase Order?',
      html: `<p>PO Number: <strong>${selectedOrder?.orderNumber}</strong></p><p>Total Items: <strong>${editingItems.length}</strong></p><p>Total Quantity: <strong>${editingItems.reduce((sum, item) => sum + item.unit, 0)}</strong></p>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Approve PO',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        // Validate required IDs
        console.log('🔍 APPROVAL DEBUG - Starting validation:', {
          hasSelectedOrder: !!selectedOrder,
          selectedOrderId: selectedOrder?.id,
          selectedOrderIdType: typeof selectedOrder?.id,
          selectedOrderIdValue: selectedOrder?.id,
          isNull: selectedOrder?.id === null,
          isUndefined: selectedOrder?.id === undefined,
          isLessThanOrEqualZero: selectedOrder?.id <= 0,
          fullSelectedOrder: selectedOrder
        });

        if (!selectedOrder) {
          console.error('❌ APPROVAL ERROR: No order selected');
          Swal.fire('Error', 'No order selected. Please try again.', 'error');
          return;
        }

        if (selectedOrder.id === null || selectedOrder.id === undefined || selectedOrder.id <= 0 || isNaN(selectedOrder.id)) {
          console.error('❌ APPROVAL ERROR: Invalid order ID:', {
            id: selectedOrder.id,
            idType: typeof selectedOrder.id,
            isNull: selectedOrder.id === null,
            isUndefined: selectedOrder.id === undefined,
            isZero: selectedOrder.id === 0,
            isNegative: selectedOrder.id < 0,
            isNaN: isNaN(selectedOrder.id),
            fullOrder: selectedOrder
          });
          Swal.fire('Error', 'Invalid order ID. Please close and reopen the order.', 'error');
          return;
        }

        if (!loginData.id || loginData.id <= 0) {
          console.error('❌ APPROVAL ERROR: Invalid user ID:', {
            userId: loginData.id,
            userIdType: typeof loginData.id,
            fullLoginData: loginData
          });
          Swal.fire('Error', 'User ID not found. Please login again.', 'error');
          return;
        }

        console.log('✅ APPROVAL READY - All validations passed:', {
          orderId: selectedOrder.id,
          orderIdType: typeof selectedOrder.id,
          approvedUid: loginData.id,
          userIdType: typeof loginData.id,
          orderNumber: selectedOrder.orderNumber
        });

        // Prepare approval payload
        const approvalPayload = {
          orderId: selectedOrder.id,
          approvedUid: loginData.id
        };

        await centralStoresApi.approvePurchaseOrder(approvalPayload);
        
        Swal.fire({
          title: 'Approved!',
          text: 'Purchase order approved successfully',
          icon: 'success',
          confirmButtonColor: '#28a745'
        });
        
        // Remove from pending orders
        setPendingOrders(prev => prev.filter(order => order.id !== selectedOrder?.id));
        handleCloseModal();
      } catch (error) {
        console.error('Error approving order:', error);
        handleError(dispatch, error);
        Swal.fire('Error', 'Failed to approve order', 'error');
      }
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <PageHeader
          icon={faClipboardCheck}
          title="Purchase Order Review & Approval"
          subtitle="Review, modify and approve pending purchase requisitions"
          badges={[
            { label: 'Store', value: subModuleData?.subModName || 'N/A' },
            { label: 'Pending POs', value: pendingOrders.length.toString() }
          ]}
        />
        <div className="container-fluid p-0" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Pending Orders List */}
          <div className="card border-0 shadow-sm" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <div className="card-body p-0" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border" style={{ color: '#667eea' }} role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3 text-muted">Loading purchase orders...</p>
                </div>
              ) : pendingOrders.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-clipboard-check fa-4x mb-3" style={{ color: '#cbd5e0' }}></i>
                  <h5 className="text-muted">No Pending Purchase Orders</h5>
                  <p className="text-muted small">All purchase requisitions have been processed</p>
                </div>
              ) : (
                <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                  <Table hover className="mb-0">
                    <thead style={{ backgroundColor: 'var(--table-header-bg)', color: 'var(--table-header-text)', position: 'sticky', top: 0, zIndex: 1 }}>
                      <tr>
                        <th className="py-3" style={{ width: '4%' }}>#</th>
                        <th className="py-3" style={{ width: '12%' }}>PO Number</th>
                        <th className="py-3" style={{ width: '10%' }}>PO Date</th>
                        <th className="py-3" style={{ width: '10%', whiteSpace: 'nowrap' }}>Total Items</th>
                        <th className="py-3" style={{ width: '10%', whiteSpace: 'nowrap' }}>Total Qty</th>
                        <th className="py-3" style={{ width: '12%', whiteSpace: 'nowrap' }}>Fully Received</th>
                        <th className="py-3" style={{ width: '12%', whiteSpace: 'nowrap' }}>Pending Items</th>
                        <th className="py-3" style={{ width: '12%' }}>Status</th>
                        <th className="py-3 text-center" style={{ width: '12%' }} hidden>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingOrders.map((order, index) => (
                        <tr 
                          key={order.id}
                          style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                          onClick={() => handleOrderClick(order)}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f7fafc'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
                        >
                          <td className="align-middle">
                            <div className="rounded-circle bg-light d-inline-flex align-items-center justify-content-center" 
                                 style={{ width: '32px', height: '32px' }}>
                              <span className="fw-bold" style={{ color: '#667eea' }}>{index + 1}</span>
                            </div>
                          </td>
                          <td className="align-middle">
                            <div className="fw-bold" style={{ color: '#2d3748' }}>{order.orderNumber}</div>
                          </td>
                          <td className="align-middle">
                            <i className="fas fa-calendar-alt me-2" style={{ color: '#a0aec0' }}></i>
                            <span className="text-muted">{new Date(order.orderDate).toLocaleDateString('en-GB')}</span>
                          </td>
                          <td className="align-middle">
                            <Badge bg="light" text="dark" className="border px-3 py-2">
                              <i className="fas fa-pills me-2" style={{ color: '#667eea' }}></i>
                              {order.totalItems} items
                            </Badge>
                          </td>
                          <td className="align-middle">
                            <Badge bg="light" text="dark" className="border px-3 py-2">
                              <i className="fas fa-cubes me-2" style={{ color: '#764ba2' }}></i>
                              {order.totalQuantity} units
                            </Badge>
                          </td>
                          <td className="align-middle">
                            <Badge bg="light" text="dark" className="border px-3 py-2" style={{ backgroundColor: order.fullyReceivedItems > 0 ? '#d1e7dd' : '#f8f9fa' }}>
                              <i className="fas fa-check-circle me-2" style={{ color: order.fullyReceivedItems > 0 ? '#28a745' : '#6c757d' }}></i>
                              {order.fullyReceivedItems} items
                            </Badge>
                          </td>
                          <td className="align-middle">
                            <Badge bg="light" text="dark" className="border px-3 py-2" style={{ backgroundColor: order.pendingItems > 0 ? '#fff3cd' : '#d1e7dd' }}>
                              <i className="fas fa-hourglass-half me-2" style={{ color: order.pendingItems > 0 ? '#ffc107' : '#28a745' }}></i>
                              {order.pendingItems} items
                            </Badge>
                          </td>
                          <td className="align-middle">
                            <Badge bg="warning" text="dark" className="px-3 py-2">
                              <i className="fas fa-clock me-2"></i>
                              {order.status}
                            </Badge>
                          </td>
                          <td className="align-middle text-center" hidden>
                            <Button 
                              size="sm" 
                              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOrderClick(order);
                              }}
                            >
                              <i className="fas fa-edit me-2"></i>
                              Review
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

      {/* Order Details Modal */}
      <Modal show={showOrderModal} onHide={handleCloseModal} size="xl" centered backdrop="static" keyboard={false}>
        <Modal.Header closeButton className="border-0" style={{ backgroundColor: 'var(--page-header-bg)' }}>
          <Modal.Title style={{ color: 'var(--page-header-text)' }}>
            <i className="fas fa-file-invoice me-2"></i>
            Purchase Order Details - {selectedOrder?.orderNumber}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <div className="p-2 bg-light border-bottom">
            <div className="row g-2">
              <div className="col-md-3">
                <small className="text-muted d-block mb-1">PO Number</small>
                <div className="fw-bold" style={{ color: '#667eea' }}>{selectedOrder?.orderNumber}</div>
              </div>
              <div className="col-md-3">
                <small className="text-muted d-block mb-1">PO Date</small>
                <div className="fw-bold text-dark">{selectedOrder && new Date(selectedOrder.orderDate).toLocaleDateString('en-GB')}</div>
              </div>
              <div className="col-md-3">
                <small className="text-muted d-block mb-1">Status</small>
                <Badge bg="warning" text="dark" className="px-3 py-2">
                  <i className="fas fa-clock me-2"></i>
                  {selectedOrder?.status}
                </Badge>
              </div>
              <div className="col-md-3">
                <small className="text-muted d-block mb-1">
                  <i className="fas fa-truck me-1" style={{ color: '#667eea' }}></i>
                  Common Vendor
                </small>
                <Form.Select
                  size="sm"
                  value={commonVendorId || ''}
                  onChange={(e) => handleCommonVendorChange(parseInt(e.target.value))}
                  style={{ borderColor: '#667eea', fontSize: '0.875rem' }}
                >
                  <option value="">Select Vendor</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </Form.Select>
              </div>
            </div>
            <div className="d-flex justify-content-end mt-2">
              <Button
                size="sm"
                variant="success"
                onClick={() => setShowAddMedicineRow(true)}
                disabled={showAddMedicineRow}
              >
                <i className="fas fa-plus me-1"></i>
                Add Medicine
              </Button>
            </div>
          </div>

          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <Table className="mb-0">
              <thead style={{ backgroundColor: 'var(--page-header-bg)', color: 'var(--page-header-text)', position: 'sticky', top: 0, zIndex: 1 }}>
                <tr>
                  <th className="py-3" style={{ width: '5%' }}>#</th>
                  <th className="py-3" style={{ width: '25%' }}>Item Name</th>
                  <th className="py-3" style={{ width: '20%' }}>Generic Name</th>
                  {/* <th className="py-3" style={{ width: '20%' }}>Vendor</th> */}
                  <th className="py-3" style={{ width: '15%' }}>Quantity</th>
                  <th className="py-3 text-center" style={{ width: '15%' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {showAddMedicineRow && (
                  <tr style={{ backgroundColor: '#f0fff4' }}>
                    <td className="align-middle text-center">
                      <small className="text-success fw-bold">New</small>
                    </td>
                    <td className="align-middle" colSpan={2}>
                      <SearchableSelect
                        id="add-medicine-search"
                        value={selectedNewItem?.prodsId.toString() || ''}
                        onChange={(val) => {
                          const m = addMedicineResults.find(r => r.prodsId.toString() === val);
                          setSelectedNewItem(m || null);
                        }}
                        options={addMedicineResults.map(m => ({
                          value: m.prodsId,
                          label: m.medicineName,
                        }))}
                        placeholder="Search medicine name (min 2 chars)..."
                        onSearch={setAddMedicineSearch}
                        autoFocus
                      />
                      {selectedNewItem && (
                        <small className="text-muted d-block mt-1">
                          <i className="fas fa-check-circle text-success me-1"></i>
                          {selectedNewItem.genericName}
                        </small>
                      )}
                    </td>
                    <td className="align-middle">
                      <Form.Control
                        type="number"
                        size="sm"
                        value={newItemUnit}
                        min="1"
                        onChange={(e) => setNewItemUnit(parseInt(e.target.value) || 1)}
                        style={{ width: '100px', borderColor: '#28a745' }}
                      />
                    </td>
                    <td className="align-middle text-center">
                      <div className="d-flex gap-1 justify-content-center">
                        <Button size="sm" variant="success" onClick={handleAddNewMedicine} title="Confirm add">
                          <i className="fas fa-check"></i>
                        </Button>
                        <Button size="sm" variant="outline-secondary" title="Cancel" onClick={() => {
                          setShowAddMedicineRow(false);
                          setAddMedicineSearch('');
                          setAddMedicineResults([]);
                          setSelectedNewItem(null);
                          setNewItemUnit(1);
                        }}>
                          <i className="fas fa-times"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}
                {editingItems.map((item, index) => (
                  <tr key={item.id}>
                    <td className="align-middle">{index + 1}</td>
                    <td className="align-middle fw-medium">{item.medicineName}</td>
                    <td className="align-middle text-secondary">{item.genericName}</td>
                    {/* <td className="align-middle">
                      <Form.Select
                        size="sm"
                        value={item.supplierId}
                        onChange={(e) => handleVendorChange(item.id, parseInt(e.target.value))}
                        style={{ borderColor: '#667eea', fontSize: '0.875rem' }}
                      >
                        {suppliers.map(supplier => (
                          <option key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </option>
                        ))}
                      </Form.Select>
                    </td> */}
                    <td className="align-middle">
                      <Form.Control
                        type="number"
                        size="sm"
                        value={item.unit}
                        min="1"
                        onChange={(e) => handleUnitChange(item.id, parseInt(e.target.value) || 0)}
                        style={{ width: '100px', borderColor: '#667eea' }}
                      />
                    </td>
                    <td className="align-middle text-center">
                      <Button 
                        size="sm" 
                        variant="danger"
                        onClick={() => handleDeleteItem(item.id)}
                        className="d-inline-flex align-items-center justify-content-center gap-2"
                        style={{ padding: '0.375rem 0.75rem' }}
                        title="Remove Item"
                      >
                        <i className="fas fa-trash-alt"></i>
                        <span>Remove</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {editingItems.length === 0 && (
            <div className="text-center py-5 text-muted">
              <i className="fas fa-box-open fa-3x mb-3"></i>
              <p>No items in this purchase order</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 bg-light">
          <div className="w-100 d-flex justify-content-between align-items-center">
            <div>
              <strong className="me-3">Total Items: <span style={{ color: '#667eea' }}>{editingItems.length}</span></strong>
              <strong>Total Qty: <span style={{ color: '#764ba2' }}>{editingItems.reduce((sum, item) => sum + item.unit, 0)}</span></strong>
            </div>
            <div className="/*d-flex*/ align-items-center gap-3" hidden>
              <Form.Check
                type="radio"
                id="order-mode-phone"
                label="Through Phone"
                name="order-mode"
                checked={orderMode === 'phone'}
                onChange={() => setOrderMode('phone')}
              />
              <Form.Check
                type="radio"
                id="order-mode-letter"
                label="By Letter"
                name="order-mode"
                checked={orderMode === 'letter'}
                onChange={() => setOrderMode('letter')}
              />
            </div>
            <div className="d-flex gap-2">
              <Button variant="secondary" onClick={handleCloseModal}>
                <i className="fas fa-times me-2"></i>
                Close
              </Button>
              {/* <Button 
                variant="secondary"
                onClick={() => {
                  // Use relative navigation to stay in current store context (medical or non-medical)
                  navigate('../purchase/entry', {
                    state: subModuleData
                  });
                }}
                title="Go to purchase entry"
              >
                <i className="fas fa-file-invoice me-2"></i>
                Purchase Entry
              </Button> */}
              <Button 
                variant="secondary" 
                onClick={handleSaveChanges}
              >
                <i className="fas fa-save me-2"></i>
                Save Changes
              </Button>
              <Button 
                variant="danger" 
                onClick={handleCancelOrder}
                title="Cancel this purchase order"
              >
                <i className="fas fa-ban me-2"></i>
                Cancel Order
              </Button>
              <Button 
                variant="primary" 
                onClick={handleApproveOrder}
                disabled={hasUnsavedChanges}
                title={hasUnsavedChanges ? 'Please save changes before approving' : 'Approve purchase order'}
                style={hasUnsavedChanges ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
              >
                <i className="fas fa-check-circle me-2"></i>
                Approve PO
                {hasUnsavedChanges && (
                  <span className="ms-2">
                    <i className="fas fa-exclamation-triangle" style={{ color: '#ffc107' }}></i>
                  </span>
                )}
              </Button>
            </div>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ApproveOrder;
