import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../../../state/store';
import { routerPathNames } from '../../../../../routes/routerPathNames';
import SearchableSelect from '../../../../../components/SearchableSelect';
import '../../../../../style/commonStyle.css';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import CentralStoresApiService, { 
  DealerResponse,
  SavePurchaseOrderRequest,
  PurchaseOrderDetail,
  SavePurchaseOrderListRequest,
  FetchProductsForPOResponse,
  PreviousPurchaseResponse
} from '../../../../../api/central-stores/central-stores-api-service';
import { handleError } from '../../../../../utils/errorUtil';
import PageHeader from '../../../../../components/PageHeader';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { handleNumberBlur, handleNumberChange, formatNumberDisplay } from '../../../../../utils/numberInputUtil';
import {
  showConfirmDialog,
  showCustomConfirmDialog,
  showDecisionDialog,
  showErrorModal,
  showInfoToast,
  showLoading,
  showSuccessModal,
  showSuccessToast,
  showValidationError,
  showWarningToast,
  closeAlert
} from '../../../../../utils/alertUtil';

interface SubModuleState {
  subModId: number;
  subModName: string;
  modGroupId: number;
  modGroupName: string;
  masterId: number;
  viewType: 
    | 'below-reorder' 
    | 'all-products' 
    | 'supplier-wise';
}

interface ProductData {
  prodsId: number;
  medicineName: string;
  medCode: string;
  genericId: number;
  genericName: string;
  min: number;
  max: number;
  isActive: string;
  storeId: number;
  hsnCode: string;
  currentStoreStock: number;
  totalAvailableStock: number;
  packSize: number;
}

interface SelectedItem extends ProductData {
  quantity: number;
  supplierName: string;
  supplierId: string;
  poStatus?: { isApproved: number; isFullyReceived: number } | null;
  previousPurchaseDetails?: PreviousPurchaseResponse | null;
}

interface PrepareOrderFilterProps {
  onBack?: () => void;
}

const PrepareOrderFilter: React.FC<PrepareOrderFilterProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const loginData = useSelector((state: RootState) => state.loginData);
  const centralStoresApi = new CentralStoresApiService();
  const [subModuleData, setSubModuleData] = useState<SubModuleState | null>(null);
  const productSearchRef = useRef<HTMLInputElement>(null);
  
  // Search state
  const [availableProducts, setAvailableProducts] = useState<ProductData[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductData[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [searchText, setSearchText] = useState('');
  
  // Master data
  const [manufacturers, setManufacturers] = useState<DealerResponse[]>([]);
  
  // Selected items list
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [commonVendorId, setCommonVendorId] = useState<number>(0);
  
  const [showSelectedModal, setShowSelectedModal] = useState(false);
  const [poProductStatus, setPoProductStatus] = useState<{ isApproved: number; isFullyReceived: number } | null>(null);

  // Load master data (manufacturers)
  useEffect(() => {
    const loadMasterData = async () => {
      try {
        const manufacturersData = await centralStoresApi.fetchAllManufacturers();
        setManufacturers(manufacturersData);
      } catch (error) {
        console.error('❌ Error loading master data:', error);
        handleError(dispatch, error);
      }
    };

    if (loginData.authorized) {
      loadMasterData();
    }
  }, [loginData]);

  // Load products from API after minimum search length is reached
  const loadProducts = async (name: string, masterId: number) => {
    try {
      if (name.trim().length < 2) {
        setAvailableProducts([]);
        return;
      }

      const selectedStoreStr = sessionStorage.getItem('selectedStore');
      const selectedStore = selectedStoreStr ? JSON.parse(selectedStoreStr) : null;
      const resolvedMasterId = Number(selectedStore?.masterId ?? masterId);
      const phModId = resolvedMasterId;
      const storeId = resolvedMasterId;
      const products: FetchProductsForPOResponse[] = await centralStoresApi.fetchProductsForPO(storeId, name);
      
      
      if (!Array.isArray(products)) {
        console.error('API did not return an array:', products);
        return;
      }
      
      // Map API response to ProductData format
      const mapped: ProductData[] = products.map((p) => ({
        prodsId: p.prodsId,
        medicineName: p.medicineName,
        medCode: p.medCode,
        genericId: p.genericId,
        genericName: p.genericName,
        min: p.min,
        max: p.max,
        isActive: p.isActive,
        storeId: storeId,
        hsnCode: p.hsnCode,
        currentStoreStock: p.currentStoreStock,
        totalAvailableStock: p.totalAvailableStock,
        packSize: p.packSize,
      }));
      
      setAvailableProducts(mapped);
    } catch (error) {
      console.error('❌ Error loading products:', error);
      handleError(dispatch, error);
      showErrorModal('Failed to load products. Please try again.', 'Error');
    }
  };

  const handleProductSelect = (selectedValue: string) => {
    setSelectedProductId(selectedValue);

    const selectedMedicine = availableProducts.find(
      (item) => item.prodsId.toString() === selectedValue
    );

    if (!selectedMedicine) {
      setSelectedProduct([]);
      setPoProductStatus(null);
      return;
    }

    if (Number(selectedMedicine.isActive) === 0) {
      showWarningToast('This medicine is blocked');
      setSelectedProductId('');
      setSelectedProduct([]);
      setPoProductStatus(null);
      return;
    }

    setSelectedProduct([selectedMedicine]);
    setPoProductStatus(null);
    centralStoresApi.fetchPoProductStatus(selectedMedicine.prodsId)
      .then((status) => setPoProductStatus(status))
      .catch(() => setPoProductStatus(null));
  };

  useEffect(() => {
    if (!loginData.authorized) {
      navigate('/login');
      return;
    }

    // Always use centralized 'selectedStore' from sessionStorage
    try {
      const storedData = sessionStorage.getItem('selectedStore');

      if (storedData) {
        const parsed = JSON.parse(storedData) as Omit<SubModuleState, 'viewType'>;
        const normalizedData: SubModuleState = {
          ...parsed,
          viewType: 'all-products'
        };

        setSubModuleData(normalizedData);
        sessionStorage.setItem('selectedStore', JSON.stringify(normalizedData));
        sessionStorage.setItem('prepareOrderViewType', normalizedData.viewType);
      } else {
        // No store selected, navigate back to central stores page
        navigate(routerPathNames.centralStores.base);
      }
    } catch (error) {
      console.error('Error retrieving selectedStore from sessionStorage:', error);
      navigate(routerPathNames.centralStores.base);
    }
  }, [loginData, navigate]);

  // Trigger search API call only when user typed at least 2 characters
  useEffect(() => {
    const trimmedSearch = searchText.trim();

    if (trimmedSearch.length < 2) {
      setAvailableProducts([]);
      return;
    }

    if (!subModuleData?.masterId) {
      return;
    }

    const timer = setTimeout(() => {
      loadProducts(trimmedSearch, subModuleData.masterId);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchText, subModuleData?.masterId]);

  // Add selected product to the list
  const handleAddProduct = async () => {
    if (selectedProduct.length === 0) {
      showWarningToast('Please search and select an item first', 'No Item Selected');
      return;
    }

    const product = selectedProduct[0];

    if (Number(product.isActive) === 0) {
      showWarningToast('This medicine is blocked');
      return;
    }
    
    // Check if already added
    if (selectedItems.find(item => item.prodsId === product.prodsId)) {
      showWarningToast('This item is already in your list', 'Already Added');
      return;
    }

    // Add to selected items with default values
    const supplier = commonVendorId ? manufacturers.find(s => s.id === commonVendorId) : null;
    let previousPurchaseDetails: PreviousPurchaseResponse | null = null;

    try {
      previousPurchaseDetails = await centralStoresApi.fetchPreviousPurchaseDetailById(product.prodsId);
    } catch (error) {
      console.error('Error fetching previous purchase details:', error);
      previousPurchaseDetails = null;
    }

    const newItem: SelectedItem = {
      ...product,
      // quantity: product.min - product.currentStoreStock > 0 ? product.min - product.currentStoreStock : 0,
      quantity: 0,
      supplierId: commonVendorId ? commonVendorId.toString() : '',
      supplierName: supplier?.name || '',
      poStatus: poProductStatus,
      previousPurchaseDetails
    };

    setSelectedItems([...selectedItems, newItem]);
    setSelectedProductId('');
    setSelectedProduct([]);
    setPoProductStatus(null);
    setSearchText('');
    setAvailableProducts([]);
    
    // Toast notification in top-right corner
    showSuccessToast('Item added to purchase list');

    setTimeout(() => {
      productSearchRef.current?.focus();
    }, 100);
  };

  // Remove item from selected list
  const handleRemoveItem = (id: number) => {
    showConfirmDialog('Are you sure you want to remove this item?', 'Remove Item?', 'Yes, Remove', 'Cancel').then((result) => {
      if (result.isConfirmed) {
        setSelectedItems(selectedItems.filter(item => item.prodsId !== id));
        showSuccessToast('Item removed from list');
      }
    });
  };

  // Update quantity for selected item
  const handleQuantityChange = (id: number, quantity: number) => {
    setSelectedItems(selectedItems.map(item =>
      item.prodsId === id ? { ...item, quantity } : item
    ));
  };

  // Update supplier for selected item
  const handleSupplierChange = (id: number, supplierId: string) => {
    const supplier = manufacturers.find(s => s.id === parseInt(supplierId));
    setSelectedItems(selectedItems.map(item =>
      item.prodsId === id ? { ...item, supplierId, supplierName: supplier?.name || '' } : item
    ));
  };

  const selectedCount = selectedItems.length;
  const totalQuantity = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const itemsWithoutSupplierCount = selectedItems.filter(item => !item.supplierId).length;

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    // Navigate to prepare order selection without state (uses sessionStorage)
    if (location.pathname.includes('pharmacy-stores')) {
      navigate('/hims/pharmacy-stores/pharmacy/purchase/prepare-order');
      return;
    }

    const storePath = location.pathname.includes('non-medical-store')
      ? 'non-medical-store'
      : 'medical-store';
    navigate(`/hims/central-stores/${storePath}/purchase/prepare-order`);
  };

  const handleProceedOrder = async () => {
    // Validation 0: Check if store ID is valid
    if (!subModuleData?.masterId || subModuleData.masterId === 0) {
      showErrorModal('Store information is missing or invalid. Please go back and select a valid store.', 'Invalid Store');
      return;
    }

    // Validation 1: Check if there are any selected items
    if (selectedItems.length === 0) {
      showValidationError('Please add at least one item to the purchase order', 'No Items Selected');
      return;
    }

    // Validation 2: Check if all items have quantity > 0
    const itemsWithoutQuantity = selectedItems.filter(item => !item.quantity || item.quantity <= 0);
    if (itemsWithoutQuantity.length > 0) {
      showCustomConfirmDialog(
        'Missing Quantities',
        `<div class="text-start"><small>Please enter quantity for all items. ${itemsWithoutQuantity.length} item(s) missing quantity.<br/><br/>Items without quantity:<br/>${itemsWithoutQuantity.map(item => `• ${item.medicineName}`).join('<br/>')}</small></div>`,
        'warning',
        'OK',
        'Close'
      );
      return;
    }

    // Validation 3: Check if all items have supplier assigned
    const itemsWithoutSupplier = selectedItems.filter(item => !item.supplierId);
    if (itemsWithoutSupplier.length > 0) {
      showCustomConfirmDialog(
        'Missing Suppliers',
        `<div class="text-start"><small>Please select supplier for all items. ${itemsWithoutSupplier.length} item(s) missing supplier.<br/><br/>Items without supplier:<br/>${itemsWithoutSupplier.map(item => `• ${item.medicineName}`).join('<br/>')}</small></div>`,
        'warning',
        'OK',
        'Close'
      );
      return;
    }

    // Validation 4: Check if multiple suppliers are present (optional warning)
    const uniqueSuppliers = Array.from(new Set(selectedItems.map(item => item.supplierId)));
    if (uniqueSuppliers.length > 1) {
      const result = await showConfirmDialog(
        `This order has ${uniqueSuppliers.length} different suppliers. Do you want to continue?`,
        'Multiple Suppliers Detected',
        'Yes, Continue',
        'Review'
      );
      
      if (!result.isConfirmed) {
        return;
      }
    }

    // Validation passed, show confirmation
    const result = await showCustomConfirmDialog(
      'Confirm Purchase Order',
      `
        <div class="text-start">
          <p><strong>Total Items:</strong> ${selectedItems.length}</p>
          <p><strong>Total Quantity:</strong> ${totalQuantity}</p>
          <p><strong>Supplier(s):</strong> ${uniqueSuppliers.length === 1 ? selectedItems[0].supplierName : `${uniqueSuppliers.length} suppliers`}</p>
          <hr/>
          <p class="text-muted small">Are you sure you want to create this purchase order?</p>
        </div>
      `,
      'question',
      'Yes, Create Order',
      'Cancel',
        'var(--btn-success)',
        'var(--color-danger)'
    );

    if (!result.isConfirmed) {
      return;
    }

    try {
      // Show loading
      showLoading('Creating Purchase Order...');

      // Group items by supplier — one PO per supplier
      const itemsBySupplier = selectedItems.reduce((groups, item) => {
        const key = item.supplierId;
        if (!groups[key]) groups[key] = [];
        groups[key].push(item);
        return groups;
      }, {} as Record<string, SelectedItem[]>);

      const storeId = subModuleData.masterId;
      const purchaseOrders: SavePurchaseOrderRequest[] = Object.entries(itemsBySupplier).map(([supplierId, items]) => ({
        poNo: `PO-${Date.now()}-${supplierId}`,
        supId: parseInt(supplierId),
        prepareLetter: 0,
        isByPhone: 0,
        deptId: 0,
        invoiceNo: '',
        storeId: storeId,
        details: items.map((item): PurchaseOrderDetail => ({
          medId: item.prodsId,
          qty: item.quantity,
          pack: item.packSize,
          units: item.quantity * item.packSize,
          quotationDetId: 0,
          cpQuoted: 0,
          freeQuoted: 0,
          negotiateAmt: 0
        }))
      }));

      const poRequest: SavePurchaseOrderListRequest = { purchaseOrders };

      console.log('Purchase Order List Request:', poRequest);

      // Call API to save purchase order list
      const response = await centralStoresApi.savePurchaseOrderList(poRequest);

      console.log('Purchase Order List saved successfully:', response);

      // Show success message
      closeAlert();
      await showSuccessModal(`${response.message || 'Purchase order(s) created successfully'}`, 'Purchase Order Created!', 'OK');

      // Clear selected items and stay on prepare order selection page
      setSelectedItems([]);
      setCommonVendorId(0);
      
      // Determine store path from current URL and navigate without state
      const isNonMedical = location.pathname.includes('non-medical-store');
      const storePath = isNonMedical ? 'non-medical-store' : 'medical-store';
      navigate(`/hims/central-stores/${storePath}/purchase/prepare-order`);

    } catch (error: any) {
      console.error('Error saving purchase order:', error);
      handleError(dispatch, error);
      closeAlert();
      showErrorModal(error.message || 'An error occurred while creating the purchase order', 'Failed to Create Order');
    }
  };

  return (
    <>
      <div className="prepare-order-screen d-flex flex-column h-100">
        {/* Page Header */}
        <PageHeader
          icon={faShoppingCart}
          title="Purchase Order Preparation"
          subtitle="Browse all available products"
          badges={[
            { label: 'Store', value: subModuleData?.subModName || 'N/A' },
            { label: 'Selected Items', value: selectedItems.length.toString() }
          ]}
        />

        <div className="prepare-order-content px-3 pb-3 h-100 overflow-hidden">
          <div className="card flex-grow-1 shadow-sm d-flex flex-column h-100 overflow-hidden prepare-order-main-card">
            <div className="card-header prepare-order-main-header">
              <div className="row g-2 align-items-center mb-1">
                <div className="col-12 col-md-2">
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={handleBack}
                    title="Back to View Selection"
                  >
                    <i className="fas fa-arrow-left me-1"></i>
                    Back
                  </button>
                </div>

                <div className="col-12 col-md-6">
                  {/* <label className="form-label mb-1">Item Search</label> */}
                  <SearchableSelect
                    id="product-search"
                    value={selectedProductId}
                    onChange={handleProductSelect}
                    options={availableProducts.map((p) => ({
                      value: p.prodsId,
                      label: p.medicineName,
                      isBlocked: Number(p.isActive) === 0,
                    }))}
                    placeholder={'Search Medicine Name'}
                    onSearch={setSearchText}
                    inputRef={productSearchRef}
                    autoFocus
                    onEnterWhenClosed={handleAddProduct}

                  />
                </div>

                <div className="col-12 col-md-2">
                  <button
                    className="btn theme-btn-secondary btn-sm"
                    onClick={handleAddProduct}
                    disabled={selectedProduct.length === 0}
                  >
                    <i className="fas fa-plus me-1"></i>
                    Add to List
                  </button>
                </div>

                <div className="col-12 col-md-2 d-flex flex-wrap justify-content-md-end gap-2 align-items-center">
                  <span className="badge text-bg-light">Products: {availableProducts.length}</span>
                  <span className="badge text-bg-light">Selected: {selectedCount}</span>
                  <OverlayTrigger
                    trigger="click"
                    placement="bottom-end"
                    rootClose
                    overlay={
                      <Popover id="po-status-legend-popover" style={{ minWidth: '280px' }}>
                        <Popover.Header as="h6" className="mb-0">Item Name Icon Legend</Popover.Header>
                        <Popover.Body className="py-2">
                          <div className="d-flex align-items-start gap-2 mb-2">
                            <i className="fas fa-times-circle text-danger mt-1"></i>
                            <div>
                              <strong className="d-block" style={{ fontSize: 'var(--font-size-xs)' }}>Not Approved</strong>
                              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>A purchase order exists for this item but has not yet been approved by the store manager.</span>
                            </div>
                          </div>
                          <div className="d-flex align-items-start gap-2">
                            <i className="fas fa-times-circle text-primary-emphasis mt-1"></i>
                            <div>
                              <strong className="d-block" style={{ fontSize: 'var(--font-size-xs)' }}>Not Received</strong>
                              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>The purchase order is approved but the goods have not been fully received yet.</span>
                            </div>
                          </div>
                        </Popover.Body>
                      </Popover>
                    }
                  >
                    <i
                      className="fas fa-exclamation-circle"
                      style={{ color: 'var(--color-warning)', cursor: 'pointer', fontSize: 'var(--font-size-lg)' }}
                      title="Icon Legend"
                    ></i>
                  </OverlayTrigger>
                </div>
              </div>

            </div>

            <div className="card-body d-flex flex-column prepare-order-main-body">
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
                <div className="d-flex align-items-center gap-2">
                  <label className="form-label mb-0 fw-bold text-nowrap small">
                    <i className="fas fa-truck me-1"></i>
                    Common Vendor:
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={commonVendorId}
                    style={{ width: '200px' }}
                    onChange={(e) => {
                      const supplierId = parseInt(e.target.value) || 0;
                      setCommonVendorId(supplierId);

                      if (supplierId && selectedItems.length > 0) {
                        showDecisionDialog(
                          `Do you want to apply this vendor to all ${selectedCount} existing items?`,
                          'Apply to Existing Items?',
                          'question',
                          'Yes, Apply to All',
                          'No, Only New Items',
                          'Cancel',
                          'var(--btn-success)',
                          'var(--btn-secondary)',
                          'var(--color-danger)'
                        ).then((result) => {
                          if (result.isConfirmed) {
                            const supplier = manufacturers.find(s => s.id === supplierId);
                            setSelectedItems(selectedItems.map(item => ({
                              ...item,
                              supplierId: supplierId.toString(),
                              supplierName: supplier?.name || ''
                            })));
                            showSuccessToast('Vendor applied to all items');
                          } else if (result.isDenied) {
                            showInfoToast('New items will use this vendor');
                          } else {
                            setCommonVendorId(0);
                          }
                        });
                      }
                    }}
                  >
                    <option value="0">-- Select --</option>
                    {manufacturers.map(supplier => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <span className="badge text-bg-light">Items: {selectedCount}</span>
                  <span className="badge text-bg-light">Quantity: {totalQuantity}</span>
                  {itemsWithoutSupplierCount > 0 && (
                    <span className="badge bg-warning text-dark">Missing Vendor: {itemsWithoutSupplierCount}</span>
                  )}
                </div>
              </div>

              <div className="table-responsive flex-grow-1 prepare-order-table-wrap">
                <table className="table table-hover table-striped mb-0 table-bordered">
                <thead className="sticky-top" style={{ backgroundColor: 'var(--table-header-bg)', color: 'var(--table-header-text)' }}>
                  <tr>
                    <th rowSpan={2} style={{ width: '50px', minWidth: '50px' }}>S.No</th>
                    <th rowSpan={2} style={{ width: '15%', minWidth: '140px' }}>Generic Name</th>
                    <th rowSpan={2} style={{ width: '25%', minWidth: '200px' }}>Item Name</th>
                    <th rowSpan={2} style={{ width: '110px', minWidth: '110px' }}>Total Stock</th>
                    <th rowSpan={2} style={{ width: '110px', minWidth: '110px' }}>Stock Hear</th>
                    <th rowSpan={2} style={{ width: '100px', minWidth: '100px' }}>Min Level</th>
                    <th rowSpan={2} style={{ width: '20%', minWidth: '180px' }}>Vendor</th>
                    <th rowSpan={2} style={{ width: '120px', minWidth: '120px' }}>Strip</th>
                    <th rowSpan={2} style={{ width: '50px', minWidth: '50px' }}>Units/Strip</th>
                    <th rowSpan={2} style={{ width: '50px', minWidth: '50px' }}>Quantity</th>
                    <th colSpan={2} style={{ minWidth: '180px', textAlign: 'center' }}>Pre purchase details</th>
                    <th rowSpan={2} style={{ width: '100px', minWidth: '100px' }}>Action</th>
                  </tr>
                  <tr>
                    <th className="text-center" style={{ width: '90px', minWidth: '90px' }}>Free strips</th>
                    <th className="text-center" style={{ width: '90px', minWidth: '90px' }}>Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedItems.length === 0 ? (
                    <tr>
                      <td colSpan={13} className="text-center text-muted py-4">
                        <i className="fas fa-inbox fa-3x mb-3 d-block" style={{ opacity: 0.3 }}></i>
                        <p className="mb-0">No items added yet. Search and add items to create purchase order.</p>
                      </td>
                    </tr>
                  ) : (
                    selectedItems.map((item, index) => (
                      <tr key={item.prodsId}>
                        <td className="text-center">{index + 1}</td>
                        <td>{item.genericName}</td>
                        <td>
                          <strong>{item.medicineName}</strong>
                          {item.poStatus !== null && item.poStatus !== undefined && (
                            <>
                              {item.poStatus.isApproved === 0 && item.poStatus.isFullyReceived !== 0
                                ? <i className="fas fa-times-circle text-danger ps-1" title="Not Approved"></i>
                                : item.poStatus.isFullyReceived === 0
                                  ? <i className="fas fa-times-circle text-primary-emphasis ps-1" title="Not Received"></i>
                                  : null
                              }
                            </>
                          )}
                        </td>
                        <td className="text-center"><strong>{item.totalAvailableStock}</strong></td>
                        <td className="text-center">
                          <span className={`badge ${item.currentStoreStock < item.min ? 'bg-danger' : 'bg-success'}`}>
                            {item.currentStoreStock}
                          </span>
                        </td>
                        <td className="text-center">
                          <span className="badge bg-warning text-dark">
                            {item.min}
                          </span>
                        </td>
                        <td>
                          <select
                            className="form-select form-select-sm"
                            value={item.supplierId}
                            onChange={(e) => handleSupplierChange(item.prodsId, e.target.value)}
                          >
                            <option value="">-- Select Vendor --</option>
                            {manufacturers.map(supplier => (
                              <option key={supplier.id} value={supplier.id}>
                                {supplier.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            min="0"
                            step="0.01"
                            value={formatNumberDisplay(item.quantity)}
                            onChange={(e) => handleQuantityChange(item.prodsId, handleNumberChange(e.target.value))}
                            onBlur={(e) => handleQuantityChange(item.prodsId, handleNumberBlur(e.target.value))}
                            placeholder="Enter qty"
                          />
                        </td>
                        <td>{item.packSize}</td>
                        <td className="text-center">
                          <strong>{item.quantity * item.packSize}</strong>
                        </td>
                        <td className="text-center text-warning fw-bold">{item.previousPurchaseDetails?.freeStrips ?? '-'}</td>
                        <td className="text-center text-warning fw-bold">{item.previousPurchaseDetails?.rate ?? '-'}</td>
                        <td className="text-center">
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleRemoveItem(item.prodsId)}
                            title="Remove Item"
                          >
                            <i className="fas fa-trash me-1"></i>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              </div>
            </div>

            <div className="card-footer prepare-order-main-footer">
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                <div className="d-flex gap-2 align-items-center flex-wrap">
                  <span className="badge text-bg-light">Selected: {selectedCount}</span>
                  <span className="badge text-bg-light">Quantity: {totalQuantity}</span>
                </div>
                <div className="d-flex gap-2 flex-wrap justify-content-end">
                  <button 
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => setShowSelectedModal(true)}
                    disabled={selectedCount === 0}
                  >
                    <i className="fas fa-list me-1"></i>
                    View Details
                  </button>
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={handleProceedOrder}
                    disabled={selectedCount === 0 || totalQuantity === 0}
                  >
                    <i className="fas fa-file-alt me-1"></i>
                    Prepare Order
                  </button>
                  {/* <button 
                    className="btn btn-outline-primary btn-sm"
                    onClick={async () => {
                      // Validation checks before proceeding
                      if (selectedItems.length === 0) {
                        showValidationError('Please add at least one item to the purchase order', 'No Items Selected');
                        return;
                      }

                      const itemsWithoutQuantity = selectedItems.filter(item => !item.quantity || item.quantity <= 0);
                      if (itemsWithoutQuantity.length > 0) {
                        showValidationError(`Please enter quantity for all items. ${itemsWithoutQuantity.length} item(s) missing quantity.`, 'Missing Quantities');
                        return;
                      }

                      const itemsWithoutSupplier = selectedItems.filter(item => !item.supplierId);
                      if (itemsWithoutSupplier.length > 0) {
                        showValidationError(`Please select supplier for all items. ${itemsWithoutSupplier.length} item(s) missing supplier.`, 'Missing Suppliers');
                        return;
                      }

                      const result = await showCustomConfirmDialog(
                        'Approve Order?',
                        `
                          <div class="text-start">
                            <p><strong>Total Items:</strong> ${selectedItems.length}</p>
                            <p><strong>Total Quantity:</strong> ${selectedItems.reduce((sum, item) => sum + item.quantity, 0)}</p>
                            <hr/>
                            <p class="text-muted small">This will create and approve the purchase order directly.</p>
                          </div>
                        `,
                        'warning',
                        'Yes, Approve',
                        'Cancel',
                        'var(--color-warning)',
                        'var(--btn-secondary)'
                      );

                      if (result.isConfirmed) {
                        // Validation: Check if store ID is valid
                        if (!subModuleData?.masterId || subModuleData.masterId === 0) {
                          showErrorModal('Store information is missing or invalid. Please go back and select a valid store.', 'Invalid Store');
                          return;
                        }

                        try {
                          // Show loading
                          showLoading('Creating & Approving Order...');

                          // Step 1: Prepare and save purchase order
                          const details: PurchaseOrderDetail[] = selectedItems.map(item => {
                            const qty = item.quantity;
                            const pack = 1;
                            const units = qty * pack; // Calculate units as qty * pack
                            
                            return {
                              medId: item.prodsId,
                              qty: qty,
                              pack: pack,
                              units: units,
                              quotationDetId: 0,
                              batchQuoted: 0,
                              cpQuoted: 0,
                              freeQuoted: 0,
                              negotiateAmt: 0
                            };
                          });

                          const poRequest: SavePurchaseOrderRequest = {
                            poNo: `PO-${Date.now()}`,
                            supId: parseInt(selectedItems[0].supplierId),
                            orderDateTime: new Date().toISOString(),
                            prepareLetter: 0,
                            isByPhone: 0,
                            deptId: 0,
                            invoiceNo: '',
                            storeId: subModuleData?.masterId || 0,
                            details: details
                          };

                          console.log('Creating Purchase Order:', poRequest);
                          const saveResponse = await centralStoresApi.savePurchaseOrder(poRequest);
                          console.log('Purchase Order created:', saveResponse);

                          // Step 2: Approve the created purchase order
                          const approvalPayload = {
                            orderId: saveResponse.id || saveResponse.data?.id,
                            approvedUid: loginData.id || 0
                          };

                          console.log('Approving Purchase Order:', approvalPayload);
                          await centralStoresApi.approvePurchaseOrder(approvalPayload);
                          console.log('Purchase Order approved successfully');

                          // Show success message
                          closeAlert();
                          showSuccessToast(`Purchase order ${saveResponse.message || 'created'} and approved successfully`, 'Success', 3000);

                          // Clear selected items and navigate back
                          setSelectedItems([]);
                          setCommonVendorId(0);
                          navigate('../prepare-order', {
                            state: subModuleData
                          });

                        } catch (error: any) {
                          console.error('Error creating/approving order:', error);
                          handleError(dispatch, error);
                          closeAlert();
                          showErrorModal(error.message || 'An error occurred while creating/approving the purchase order', 'Failed');
                        }
                      }
                    }}
                    disabled={selectedCount === 0 || totalQuantity === 0}
                  >
                    <i className="fas fa-check-double me-1"></i>
                    Approve Order
                  </button> */}
                  {/* <button 
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => {
                      navigate('../entry', {
                        state: subModuleData
                      });
                    }}
                  >
                    <i className="fas fa-file-invoice me-1"></i>
                    Purchase Entry
                  </button> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Selected Products Modal */}
      {showSelectedModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'var(--overlay-bg)' }}>
          <div className="modal-dialog modal-xl modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header" style={{ backgroundColor: 'var(--page-header-bg)', color: 'var(--page-header-text)', borderBottom: '2px solid var(--page-header-border)' }}>
                <h5 className="modal-title">
                  <i className="fas fa-clipboard-list me-2"></i>
                  Selected Items for Purchase Requisition
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowSelectedModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {selectedItems.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="fas fa-inbox fa-3x text-muted mb-3 d-block"></i>
                    <h5 className="text-muted">No items selected</h5>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-bordered table-hover">
                      <thead style={{ backgroundColor: 'var(--page-header-bg)', color: 'var(--page-header-text)' }}>
                        <tr>
                          <th style={{ width: '50px', minWidth: '50px' }}>S.No</th>
                          <th style={{ width: '15%', minWidth: '150px' }}>Generic Name</th>
                          <th style={{ width: '25%', minWidth: '200px' }}>Item Name</th>
                          <th style={{ width: '110px', minWidth: '110px' }}>Current Stock</th>
                          <th style={{ width: '100px', minWidth: '100px' }}>Min Stock</th>
                          <th style={{ width: '20%', minWidth: '180px' }}>Vendor</th>
                          <th style={{ width: '80px', minWidth: '80px' }}>Units</th>
                          <th style={{ width: '120px', minWidth: '120px' }}>Requisition Qty</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedItems.map((item, index) => (
                            <tr key={item.prodsId}>
                              <td className="text-center">{index + 1}</td>
                              <td>{item.genericName}</td>
                              <td>
                                <strong>{item.medicineName}</strong>
                              </td>
                              <td className="text-center">
                                <span className={`badge ${item.currentStoreStock < item.min ? 'bg-danger' : 'bg-success'}`}>
                                  {item.currentStoreStock}
                                </span>
                              </td>
                              <td className="text-center">
                                <span className="badge bg-warning text-dark">
                                  {item.min}
                                </span>
                              </td>
                              <td>
                                <i className="fas fa-truck me-1 text-primary"></i>
                                {item.supplierName || 'Not Selected'}
                              </td>
                              <td>{item.packSize}</td>
                              <td className="text-center">
                                <strong className="text-success">{item.quantity}</strong>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                      <tfoot >
                        <tr>
                          <td colSpan={7} className="text-end fw-bold">Total Selected Items:</td>
                          <td className="text-center fw-bold text-primary">{selectedCount}</td>
                        </tr>
                        <tr>
                          <td colSpan={7} className="text-end fw-bold">Total Requisition Quantity:</td>
                          <td className="text-center fw-bold text-success">{totalQuantity}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowSelectedModal(false)}
                >
                  <i className="fas fa-times me-2"></i>
                  Close
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => {
                    setShowSelectedModal(false);
                    handleProceedOrder();
                  }}
                  disabled={selectedCount === 0 || totalQuantity === 0}
                >
                  <i className="fas fa-arrow-right me-2"></i>
                  Create Purchase Requisition
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Last Purchase Details Modal */}
      {/* {showLastPurchaseModal && selectedItemForHistory && (
        <div className="modal show d-block" style={{ backgroundColor: 'var(--overlay-bg)' }}>
          <div className="modal-dialog modal-xl modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header" style={{ backgroundColor: 'var(--page-header-bg)', borderBottom: '1px solid var(--card-border-light)' }}>
                <h5 className="modal-title" style={{ color: 'var(--page-header-text)' }}>
                  <i className="fas fa-history me-2"></i>
                  Last Purchase History - {selectedItemForHistory.productName}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowLastPurchaseModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <div className="card" style={{ borderColor: 'var(--card-border-light)' }}>
                      <div className="card-body">
                        <h6 className="card-title mb-3" style={{ color: 'var(--page-header-text)' }}>
                          <i className="fas fa-pills me-2"></i>
                          Item Information
                        </h6>
                        <div className="row g-2">
                          <div className="col-6">
                            <small className="text-muted d-block">Generic Name</small>
                            <strong>{selectedItemForHistory.genericName}</strong>
                          </div>
                          <div className="col-6">
                            <small className="text-muted d-block">Item Name</small>
                            <strong>{selectedItemForHistory.productName}</strong>
                          </div>
                          <div className="col-6">
                            <small className="text-muted d-block">Manufacturer</small>
                            <span>{selectedItemForHistory.companyName}</span>
                          </div>
                          <div className="col-6">
                            <small className="text-muted d-block">Unit</small>
                            <span>{selectedItemForHistory.units}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card" style={{ borderColor: 'var(--card-border-light)' }}>
                      <div className="card-body">
                        <h6 className="card-title mb-3" style={{ color: 'var(--page-header-text)' }}>
                          <i className="fas fa-warehouse me-2"></i>
                          Current Stock Status
                        </h6>
                        <div className="row g-2">
                          <div className="col-6">
                            <small className="text-muted d-block">Current Stock</small>
                            <h4 className={selectedItemForHistory.existingStock < selectedItemForHistory.reorderLevel ? 'text-danger' : 'text-success'}>
                              {selectedItemForHistory.existingStock}
                            </h4>
                          </div>
                          <div className="col-6">
                            <small className="text-muted d-block">Minimum Stock Level</small>
                            <h4 className="text-warning">{selectedItemForHistory.reorderLevel}</h4>
                          </div>
                          <div className="col-12">
                            <small className="text-muted d-block">Status</small>
                            <span className={`badge ${selectedItemForHistory.existingStock < selectedItemForHistory.reorderLevel ? 'bg-danger' : 'bg-success'}`}>
                              {selectedItemForHistory.existingStock < selectedItemForHistory.reorderLevel ? 'Below Minimum Stock' : 'Adequate Stock'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <h6 className="mb-3">
                  <i className="fas fa-receipt me-2 text-info"></i>
                  Last Purchase Information
                </h6>
                <div className="alert alert-info">
                  <i className="fas fa-info-circle me-2"></i>
                  {selectedItemForHistory.lastPurchaseDetails || 'No recent purchase history available'}
                </div>
              </div>
              <div className="modal-footer" style={{ backgroundColor: 'var(--page-body-bg)', borderTop: '1px solid var(--card-border-light)' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowLastPurchaseModal(false)}
                >
                  <i className="fas fa-times me-2"></i>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )} */}

      <style>{`
        .prepare-order-screen {
          overflow: hidden;
          background-color: var(--page-body-bg);
        }

        .prepare-order-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
        }

        .prepare-order-main-card {
          border: 1px solid var(--border-color);
        }

        .prepare-order-main-header {
          background-color: var(--page-header-bg);
          border-bottom: 1px solid var(--border-color);
          padding: 1rem;
        }

        .prepare-order-main-body {
          flex: 1;
          min-height: 0;
          overflow: auto;
        }

        .prepare-order-table-wrap {
          min-height: 0;
          overflow: auto;
        }

        .prepare-order-main-footer {
          background-color: var(--page-header-bg);
          border-top: 1px solid var(--border-color);
        }
        
        .table-responsive {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        
        .sticky-top {
          position: sticky;
          top: 0;
          z-index: 10;
        }
        
        .card {
          border-radius: var(--border-radius-sm);
        }

        .btn {
          border-radius: var(--border-radius-sm);
          font-weight: var(--font-weight-medium);
        }
        
        .badge {
          border-radius: var(--border-radius-sm);
        }
        
        .form-control:focus {
          border-color: var(--primary-color);
        }
        
        .table-hover tbody tr:hover {
          background-color: var(--primary-color-light);
        }

        .prepare-order-screen .rbt-input-main {
          min-height: calc(var(--font-size-4xl) * 1.35);
        }
        
        .table-active {
          background-color: var(--primary-color-light) !important;
        }
        
        /* Prevent table cell text overflow - but not for buttons/inputs */
        .table td:not(:has(button)):not(:has(input)):not(:has(select)):not(:has(.badge)) {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 200px;
        }
        
        .table td:not(:has(button)):not(:has(input)):not(:has(select)):not(:has(.badge)):hover {
          overflow: visible;
          white-space: normal;
          word-wrap: break-word;
        }
      `}</style>
    </>
  );
};

export default PrepareOrderFilter;
