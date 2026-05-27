import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../../../state/store';
import { routerPathNames } from '../../../../../routes/routerPathNames';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import '../../../../../style/commonStyle.css';
import CentralStoresApiService, { 
  GenericDetailsResponse, 
  DealerResponse,
  SavePurchaseOrderRequest,
  PurchaseOrderDetail,
  FetchProductsForPurchaseOrderRequest,
  PurchaseOrderProductResponse
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

interface LastPurchaseHistory {
  date: string;
  invoiceNo: string;
  vendor: string;
  batchNo: string;
  quantity: number;
  freeQty: number;
  rate: number;
  discount: number;
  taxPercent: number;
  totalAmount: number;
  expiryDate: string;
}

interface ProductData {
  id: number;
  genericName: string;
  productName: string;
  companyName: string;
  existingStock: number;
  reorderLevel: number;
  maxLevel: number;
  lastPurchaseDetails: string;
  units: string;
}

interface SelectedItem extends ProductData {
  quantity: number;
  supplierName: string;
  supplierId: string;
}

interface PrepareOrderSupplierWiseProps {
  onBack?: () => void;
}

const PrepareOrderSupplierWise: React.FC<PrepareOrderSupplierWiseProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const loginData = useSelector((state: RootState) => state.loginData);
  const centralStoresApi = new CentralStoresApiService();
  const [subModuleData, setSubModuleData] = useState<SubModuleState | null>(null);
  
  // Search state
  const [availableProducts, setAvailableProducts] = useState<ProductData[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Master data
  const [generics, setGenerics] = useState<GenericDetailsResponse[]>([]);
  const [manufacturers, setManufacturers] = useState<DealerResponse[]>([]);
  
  // Selected items list
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [commonVendorId, setCommonVendorId] = useState<number>(0);
  const [selectedVendorForFilter, setSelectedVendorForFilter] = useState<number>(0);
  
  const [showSelectedModal, setShowSelectedModal] = useState(false);
  const [showLastPurchaseModal, setShowLastPurchaseModal] = useState(false);
  const [selectedItemForHistory, setSelectedItemForHistory] = useState<ProductData | null>(null);

  // Load master data (generics and manufacturers)
  useEffect(() => {
    const loadMasterData = async () => {
      try {
        console.log('Loading master data...');
        const [genericsData, manufacturersData] = await Promise.all([
          centralStoresApi.fetchAllGenerics(),
          centralStoresApi.fetchAllManufacturers()
        ]);
        setGenerics(genericsData);
        setManufacturers(manufacturersData);
        console.log('✅ Master data loaded - Generics:', genericsData.length, 'Manufacturers:', manufacturersData.length);
      } catch (error) {
        console.error('❌ Error loading master data:', error);
        handleError(dispatch, error);
      }
    };

    if (loginData.authorized) {
      loadMasterData();
    }
  }, [loginData]);

  // Load products from API
  const loadProducts = async () => {
    try {
      setLoading(true);
      console.log('Fetching products for purchase order from API...');
      
      const requestData: FetchProductsForPurchaseOrderRequest = {
        filterType: 'VENDOR_WISE',
        vendorId: selectedVendorForFilter,
        phModId: subModuleData?.masterId || 1
      };
      
      console.log('API Request:', requestData);
      const products: PurchaseOrderProductResponse[] = await centralStoresApi.fetchProductsForPurchaseOrder(requestData);
      
      console.log('API Response - Products count:', products.length);
      
      if (!Array.isArray(products)) {
        console.error('API did not return an array:', products);
        return;
      }
      
      // Map API response to ProductData format
      const mapped: ProductData[] = products.map((p) => ({
        id: p.productId,
        genericName: p.genericName || '',
        productName: p.productName || '',
        companyName: p.manufacturer || '',
        existingStock: p.currentStock || 0,
        reorderLevel: p.minStockLevel || 0,
        maxLevel: 0, // Not provided in API response
        lastPurchaseDetails: 'N/A', // TODO: Fetch from purchase history API
        units: p.units || 'Units'
      }));
      
      console.log('✅ Mapped products:', mapped.length);
      setAvailableProducts(mapped);
    } catch (error) {
      console.error('❌ Error loading products:', error);
      handleError(dispatch, error);
      showErrorModal('Failed to load products. Please try again.', 'Error');
    } finally {
      setLoading(false);
    }
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
          viewType: 'supplier-wise'
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

  // Load products after master data is loaded
  useEffect(() => {
    if (generics.length > 0 && manufacturers.length > 0) {
      if (selectedVendorForFilter === 0) {
        return;
      }
      loadProducts();
    }
  }, [generics, manufacturers, selectedVendorForFilter]);

  // Add selected product to the list
  const handleAddProduct = () => {
    if (selectedProduct.length === 0) {
      showWarningToast('Please search and select an item first', 'No Item Selected');
      return;
    }

    const product = selectedProduct[0];
    
    // Check if already added
    if (selectedItems.find(item => item.id === product.id)) {
      showWarningToast('This item is already in your list', 'Already Added');
      return;
    }

    // Add to selected items with default values
    const supplier = commonVendorId ? manufacturers.find(s => s.id === commonVendorId) : null;
    const newItem: SelectedItem = {
      ...product,
      quantity: product.reorderLevel - product.existingStock > 0 ? product.reorderLevel - product.existingStock : 0,
      supplierId: commonVendorId ? commonVendorId.toString() : '',
      supplierName: supplier?.name || ''
    };

    setSelectedItems([...selectedItems, newItem]);
    setSelectedProduct([]);
    
    // Toast notification in top-right corner
    showSuccessToast('Item added to purchase list');
  };

  // Remove item from selected list
  const handleRemoveItem = (id: number) => {
    showConfirmDialog('Are you sure you want to remove this item?', 'Remove Item?', 'Yes, Remove', 'Cancel').then((result) => {
      if (result.isConfirmed) {
        setSelectedItems(selectedItems.filter(item => item.id !== id));
        showSuccessToast('Item removed from list');
      }
    });
  };

  // Update quantity for selected item
  const handleQuantityChange = (id: number, quantity: number) => {
    setSelectedItems(selectedItems.map(item =>
      item.id === id ? { ...item, quantity } : item
    ));
  };

  // Update supplier for selected item
  const handleSupplierChange = (id: number, supplierId: string) => {
    const supplier = manufacturers.find(s => s.id === parseInt(supplierId));
    setSelectedItems(selectedItems.map(item =>
      item.id === id ? { ...item, supplierId, supplierName: supplier?.name || '' } : item
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
        `<div class="text-start"><small>Please enter quantity for all items. ${itemsWithoutQuantity.length} item(s) missing quantity.<br/><br/>Items without quantity:<br/>${itemsWithoutQuantity.map(item => `• ${item.productName}`).join('<br/>')}</small></div>`,
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
        `<div class="text-start"><small>Please select supplier for all items. ${itemsWithoutSupplier.length} item(s) missing supplier.<br/><br/>Items without supplier:<br/>${itemsWithoutSupplier.map(item => `• ${item.productName}`).join('<br/>')}</small></div>`,
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

      // Prepare purchase order details
      const details: PurchaseOrderDetail[] = selectedItems.map(item => {
        const qty = item.quantity;
        const pack = 1; // Pack size - default to 1
        const units = qty * pack; // Calculate units as qty * pack
        
        return {
          medId: item.id,
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

      // Prepare purchase order request
      const poRequest: SavePurchaseOrderRequest = {
        poNo: `PO-${Date.now()}`, // Generate PO number (should ideally come from backend)
        supId: parseInt(selectedItems[0].supplierId), // Use first item's supplier for single supplier orders
        prepareLetter: 0,
        isByPhone: 0,
        deptId: 0,
        invoiceNo: '',
        storeId: subModuleData?.masterId || 0,
        details: details
      };

      console.log('Purchase Order Request:', poRequest);

      // Call API to save purchase order
      const response = await centralStoresApi.savePurchaseOrder(poRequest);

      console.log('Purchase Order saved successfully:', response);

      // Show success message
      closeAlert();
      await showSuccessModal(`PO Number: ${response.message || poRequest.poNo}`, 'Purchase Order Created!', 'OK');

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
          subtitle="Items grouped by supplier"
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

                <div className="col-12 col-md-3">
                  <label className="form-label mb-1">Vendor</label>
                  <select
                    className="form-select form-select-sm"
                    value={selectedVendorForFilter}
                    onChange={(e) => {
                      const vendorId = parseInt(e.target.value) || 0;
                      setSelectedVendorForFilter(vendorId);
                      setAvailableProducts([]);
                      setSelectedProduct([]);
                    }}
                  >
                    <option value="0">-- Select Vendor --</option>
                    {manufacturers.map((vendor) => (
                      <option key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-12 col-md-5">
                  {/* <label className="form-label mb-1">Item Search</label> */}
                  <Typeahead
                    id="product-search"
                    labelKey="productName"
                    options={availableProducts}
                    placeholder={loading ? "Loading medicines..." : selectedVendorForFilter === 0 ? "Please select vendor first..." : "Search by Item Name"}
                    onChange={(selected) => setSelectedProduct(selected as ProductData[])}
                    selected={selectedProduct}
                    clearButton
                    highlightOnlyResult
                    disabled={loading || selectedVendorForFilter === 0}
                    emptyLabel={loading ? "Loading medicines..." : selectedVendorForFilter === 0 ? "Please select vendor first" : "No matches found"}
                    filterBy={(option, props) => {
                      const product = option as ProductData;
                      const query = props.text.toLowerCase();
                      return (
                        product.productName.toLowerCase().includes(query) ||
                        product.genericName.toLowerCase().includes(query) ||
                        product.companyName.toLowerCase().includes(query)
                      );
                    }}
                    renderMenuItemChildren={(option: any) => (
                      <div>
                        <div><strong>{option.productName}</strong></div>
                        <div className="small text-muted">
                          <i className="fas fa-prescription me-1"></i>
                          {option.genericName} |
                          <i className="fas fa-industry ms-2 me-1"></i>
                          {option.companyName} |
                          <span className={`ms-2 ${option.existingStock < option.reorderLevel ? 'text-danger' : 'text-success'}`}>
                            Stock: {option.existingStock}
                          </span>
                        </div>
                      </div>
                    )}
                  />
                </div>

                <div className="col-12 col-md-2">
                  <button
                      className="btn theme-btn-secondary btn-sm"
                    onClick={handleAddProduct}
                    disabled={selectedProduct.length === 0 || loading || selectedVendorForFilter === 0}
                  >
                    <i className="fas fa-plus me-1"></i>
                    Add to List
                  </button>
                </div>

                <div className="col-12 col-md-2 d-flex flex-wrap justify-content-md-end gap-2">
                  <span className="badge text-bg-light">Products: {availableProducts.length}</span>
                  <span className="badge text-bg-light">Selected: {selectedCount}</span>
                  {selectedVendorForFilter > 0 && (
                    <span className="badge bg-success">
                      Vendor: {manufacturers.find((m) => m.id === selectedVendorForFilter)?.name}
                    </span>
                  )}
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
                <table className="table table-hover table-striped mb-0">
                <thead className="sticky-top" style={{ backgroundColor: 'var(--table-header-bg)', color: 'var(--table-header-text)' }}>
                  <tr>
                    <th style={{ width: '50px', minWidth: '50px' }}>S.No</th>
                    <th style={{ width: '25%', minWidth: '200px' }}>Item Name</th>
                    <th style={{ width: '15%', minWidth: '150px' }}>Manufacturer</th>
                    <th style={{ width: '110px', minWidth: '110px' }}>Current Stock</th>
                    <th style={{ width: '100px', minWidth: '100px' }}>Min Level</th>
                    <th style={{ width: '120px', minWidth: '120px' }}>Quantity</th>
                    <th style={{ width: '20%', minWidth: '180px' }}>Vendor</th>
                    <th style={{ width: '100px', minWidth: '100px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedItems.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center text-muted py-4">
                        <i className="fas fa-inbox fa-3x mb-3 d-block" style={{ opacity: 0.3 }}></i>
                        <p className="mb-0">No items added yet. Search and add items to create purchase order.</p>
                      </td>
                    </tr>
                  ) : (
                    selectedItems.map((item, index) => (
                      <tr key={item.id}>
                        <td className="text-center">{index + 1}</td>
                        <td>
                          <strong>{item.productName}</strong>
                          <br />
                          <small className="text-muted">{item.genericName}</small>
                        </td>
                        <td>{item.companyName}</td>
                        <td className="text-center">
                          <span className={`badge ${item.existingStock < item.reorderLevel ? 'bg-danger' : 'bg-success'}`}>
                            {item.existingStock}
                          </span>
                        </td>
                        <td className="text-center">
                          <span className="badge bg-warning text-dark">
                            {item.reorderLevel}
                          </span>
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            min="0"
                            step="0.01"
                            value={formatNumberDisplay(item.quantity)}
                            onChange={(e) => handleQuantityChange(item.id, handleNumberChange(e.target.value))}
                            onBlur={(e) => handleQuantityChange(item.id, handleNumberBlur(e.target.value))}
                            placeholder="Enter qty"
                          />
                        </td>
                        <td>
                          <select
                            className="form-select form-select-sm"
                            value={item.supplierId}
                            onChange={(e) => handleSupplierChange(item.id, e.target.value)}
                          >
                            <option value="">-- Select Vendor --</option>
                            {manufacturers.map(supplier => (
                              <option key={supplier.id} value={supplier.id}>
                                {supplier.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="text-center">
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleRemoveItem(item.id)}
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
                  <button 
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
                              medId: item.id,
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
                  </button>
                  <button 
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => {
                      navigate('../entry', {
                        state: subModuleData
                      });
                    }}
                  >
                    <i className="fas fa-file-invoice me-1"></i>
                    Purchase Entry
                  </button>
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
                          <th style={{ width: '25%', minWidth: '200px' }}>Item Name</th>
                          <th style={{ width: '15%', minWidth: '150px' }}>Manufacturer</th>
                          <th style={{ width: '110px', minWidth: '110px' }}>Current Stock</th>
                          <th style={{ width: '100px', minWidth: '100px' }}>Min Stock</th>
                          <th style={{ width: '20%', minWidth: '180px' }}>Vendor</th>
                          <th style={{ width: '80px', minWidth: '80px' }}>Units</th>
                          <th style={{ width: '120px', minWidth: '120px' }}>Requisition Qty</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedItems.map((item, index) => (
                            <tr key={item.id}>
                              <td className="text-center">{index + 1}</td>
                              <td>
                                <strong>{item.productName}</strong>
                                <br />
                                <small className="text-muted">{item.genericName}</small>
                              </td>
                              <td>{item.companyName}</td>
                              <td className="text-center">
                                <span className={`badge ${item.existingStock < item.reorderLevel ? 'bg-danger' : 'bg-success'}`}>
                                  {item.existingStock}
                                </span>
                              </td>
                              <td className="text-center">
                                <span className="badge bg-warning text-dark">
                                  {item.reorderLevel}
                                </span>
                              </td>
                              <td>
                                <i className="fas fa-truck me-1 text-primary"></i>
                                {item.supplierName || 'Not Selected'}
                              </td>
                              <td>{item.units}</td>
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
      {showLastPurchaseModal && selectedItemForHistory && (
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
      )}

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

export default PrepareOrderSupplierWise;
