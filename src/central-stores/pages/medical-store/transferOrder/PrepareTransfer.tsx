import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../../state/store';
import Swal from 'sweetalert2'; // used for loading indicator only
import {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
  showWarningModal,
  showErrorModal,
  showSuccessModal,
  showConfirmDialog,
  showCustomConfirmDialog,
} from '../../../../utils/alertUtil';
import '../../../../style/commonStyle.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFolder, faFolderOpen, faCheckCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import PageHeader from '../../../../components/PageHeader';
import SearchableSelect from '../../../../components/SearchableSelect';

import CentralStoresApiService, {
  BatchDetail,
  StoreResponse,
  ProductsByNameForPOResponse
} from '../../../../api/central-stores/central-stores-api-service';
import { handleError } from '../../../../utils/errorUtil';

interface SubModuleState {
  subModId: number;
  subModName: string;
  modGroupId: number;
  modGroupName: string;
  masterId: number;
}

// Utility function to get store data from either module
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
    return parsedData;
  }
  
  return null;
};

interface Ward {
  id: number;
  name: string;
  code: string;
  department: string;
  type: string;
}

interface Medicine {
  id: number;
  itemName: string;
  genericName: string;
  batchNo: string;
  batchId?: number;
  expiryDate: string;
  manufacturer: string;
  unit: string;
  availableQty: number;
  toStoreStock?: number;
  rackLocation: string;
  schedule: string;
}

interface ProductData {
  id: number;
  prodsId: number;
  genericName: string;
  productName: string;
  companyName: string;
  existingStock: number;
  reorderLevel: number;
  maxLevel: number;
  lastPurchaseDetails: string;
  units: string;
  isActive: number;
}

interface TransferItem extends Medicine {
  transferQty: number;
  remarks: string;
}

const PrepareTransfer: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const loginData = useSelector((state: RootState) => state.loginData);
  const centralStoresApi = new CentralStoresApiService();
  const [subModuleData, setSubModuleData] = useState<SubModuleState | null>(null);
  const [selectedStore, setSelectedStore] = useState<StoreResponse | null>(null);
  const [storeList, setStoreList] = useState<StoreResponse[]>([]);
  const [currentStore, setCurrentStore] = useState<{ name: string; code: string } | null>(null);
  
  // Search state
  const [availableProducts, setAvailableProducts] = useState<ProductData[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductData[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [searchText, setSearchText] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [searchStoreText, setSearchStoreText] = useState('');
  const [filteredStores, setFilteredStores] = useState<StoreResponse[]>([]);
  
  const [transferItems, setTransferItems] = useState<TransferItem[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Refs for focus management
  const searchRef = useRef<HTMLInputElement>(null);
  const storeSelectRef = useRef<HTMLInputElement>(null);
  const batchSelectRefs = useRef<{ [key: number]: HTMLSelectElement | null }>({});
  const qtyInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
  
  // Batch state - stores batches for each product
  const [productBatches, setProductBatches] = useState<{ [productId: number]: BatchDetail[] }>({});
  const [loadingBatches, setLoadingBatches] = useState<{ [productId: number]: boolean }>({});

  // Fetch stores for dropdown
  const fetchStores = async () => {
    try {
      const selectedStoreRaw = sessionStorage.getItem('selectedStore');
      const pharmacyStoreRaw = sessionStorage.getItem('pharmacySubModuleData');

      const selectedStore = selectedStoreRaw
        ? (JSON.parse(selectedStoreRaw) as { masterId?: number })
        : null;
      const pharmacyStore = pharmacyStoreRaw
        ? (JSON.parse(pharmacyStoreRaw) as { masterId?: number })
        : null;

      const sessionMasterId = Number(
        selectedStore?.masterId ?? pharmacyStore?.masterId ?? 0
      );

      if (!sessionMasterId) {
        showWarningModal('Store context is missing. Please reselect the store.', 'Missing Store Context');
        setStoreList([]);
        return;
      }

      const stores = await centralStoresApi.fetchStoresByGroupStoreId(sessionMasterId);
      setStoreList(stores);

      // Auto-select the Retail store if not already selected
      if (!selectedStoreId) {
        const retailStore = stores.find(
          (s) => s.storeName.toLowerCase().includes('retail')
        );
        if (retailStore) {
          setSelectedStoreId(retailStore.id.toString());
          setSelectedStore(retailStore);
          setTimeout(() => {
            searchRef.current?.focus();
          }, 150);
        }
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
      handleError(dispatch, error);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  // Handle store selection
  const handleStoreSelect = (selectedValue: string) => {
    setSelectedStoreId(selectedValue);

    const selectedStoreData = storeList.find(
      (store) => store.id.toString() === selectedValue
    );

    if (selectedStoreData) {
      setSelectedStore(selectedStoreData);
      // Move focus to medicine search input after selecting a destination store
      // Use a short timeout so the SearchableSelect input is enabled and mounted
      setTimeout(() => {
        try {
          searchRef.current?.focus();
        } catch (err) {
          // ignore focus errors
        }
      }, 50);
    } else {
      setSelectedStore(null);
    }
  };

  // Filter stores based on search text
  useEffect(() => {
    const trimmedSearch = searchStoreText.trim().toLowerCase();
    
    if (trimmedSearch.length === 0) {
      setFilteredStores(storeList);
    } else {
      const filtered = storeList.filter(store =>
        store.storeName.toLowerCase().includes(trimmedSearch) ||
        store.id.toString().includes(trimmedSearch)
      );
      setFilteredStores(filtered);
    }
  }, [searchStoreText, storeList]);

  // Reset store selection when items are added
  useEffect(() => {
    if (transferItems.length > 0) {
      setSearchStoreText('');
    }
  }, [transferItems.length]);

  // Load products from API after minimum search length is reached
  const loadProducts = async (name: string, masterId: number) => {
    try {
      if (name.trim().length < 2) {
        setAvailableProducts([]);
        return;
      }

      setLoading(true);
      const selectedStoreRaw = sessionStorage.getItem('selectedStore');
      const pharmacyStoreRaw = sessionStorage.getItem('pharmacySubModuleData');

      const selectedStoreData = selectedStoreRaw
        ? (JSON.parse(selectedStoreRaw) as { masterId?: number })
        : null;

      let resolvedMasterId = masterId;
      if (selectedStoreData?.masterId) {
        resolvedMasterId = Number(selectedStoreData.masterId);
      } else if (pharmacyStoreRaw) {
        resolvedMasterId = 2;
      }

      const products: ProductsByNameForPOResponse[] = await centralStoresApi.fetchProductsByNameForPO(resolvedMasterId, name);
      
      if (!Array.isArray(products)) {
        console.error('API did not return an array:', products);
        return;
      }

      const mapped: ProductData[] = products.map((product) => ({
        id: product.prodsId,
        prodsId: product.prodsId,
        genericName: product.genericName,
        productName: product.medicineName,
        companyName: '',
        existingStock: product.totalAvailableStock,
        reorderLevel: product.min,
        maxLevel: product.max,
        lastPurchaseDetails: 'N/A',
        units: 'Unit',
        isActive: Number(product.isActive),
      }));

      setAvailableProducts(mapped);
    } catch (error) {
      console.error('❌ Error loading products:', error);
      handleError(dispatch, error);
      showErrorModal('Failed to load products. Please try again.', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (selectedValue: string) => {
    setSelectedProductId(selectedValue);

    const selectedMedicine = availableProducts.find(
      (item) => item.prodsId.toString() === selectedValue
    );

    if (!selectedMedicine) {
      setSelectedProduct([]);
      return;
    }

    if (selectedMedicine.isActive === 0) {
      showWarningToast('This medicine is blocked and cannot be selected', 'Blocked Medicine');
      setSelectedProductId('');
      setSelectedProduct([]);
      return;
    }

    setSelectedProduct([selectedMedicine]);
  };

  useEffect(() => {
    if (!loginData.authorized) {
      navigate('/login');
      return;
    }

    // Get store data from session storage first
    const storedStoreData = getStoreData();
    let fromStoreData = null;
    
    if (storedStoreData) {
      try {
        fromStoreData = storedStoreData;
        console.log('Retrieved from store data from session:', fromStoreData);
        setSubModuleData(fromStoreData);
        
        // Set current store from session data
        setCurrentStore({
          name: fromStoreData.subModName,
          code: fromStoreData.modGroupName
        });
      } catch (error) {
        console.error('Error parsing stored store data:', error);
      }
    }

    // Also check location state (fallback)
    const state = location.state as any;
    if (state && !fromStoreData) {
      setSubModuleData(state);
      // Set current store from state or default
      if (state.currentStore) {
        setCurrentStore(state.currentStore);
      } else if (state.subModName) {
        setCurrentStore({ name: state.subModName, code: state.modGroupName });
      } else {
        // Default current store - this should come from login/session
        setCurrentStore({ name: 'Medical Store', code: 'MS001' });
      }
    }
  }, [loginData, location.state, navigate]);

  // Reset medicine search when the destination store changes
  useEffect(() => {
    setAvailableProducts([]);
    setSelectedProduct([]);
    setSelectedProductId('');
    setSearchText('');
  }, [selectedStore]);

  // Trigger search API call only when user typed at least 2 characters
  useEffect(() => {
    const trimmedSearch = searchText.trim();

    if (trimmedSearch.length < 2) {
      setAvailableProducts([]);
      return;
    }

    if (!selectedStore || !subModuleData?.masterId) {
      return;
    }

    const timer = setTimeout(() => {
      loadProducts(trimmedSearch, subModuleData.masterId);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchText, selectedStore, subModuleData?.masterId]);

  // Debug: Monitor transfer items changes
  useEffect(() => {
  }, [transferItems]);

  // Debug: Monitor selected store changes
  useEffect(() => {
  }, [selectedStore]);

  // Add selected product to the list
  const handleAddProduct = async () => {
    // Validate destination store is selected first
    if (!selectedStore) {
      showWarningModal('Please select a destination store first', 'No Destination Store').then(() => {
        // Focus on store selection
        if (storeSelectRef.current) {
          storeSelectRef.current.focus();
        }
      });
      return;
    }

    if (selectedProduct.length === 0) {
      showWarningToast('Please search and select an item first', 'No Item Selected');
      return;
    }

    const product = selectedProduct[0];
    
    // Check if already added
    if (transferItems.find(item => item.id === product.id)) {
      showWarningToast('This item is already in your transfer list', 'Already Added');
      return;
    }

    try {
      // Fetch batches first
      setLoadingBatches(prev => ({ ...prev, [product.id]: true }));
      
      // Get storeId from session storage
      const storedData = getStoreData();
      const storeId = storedData ? storedData.masterId : 0;
      
      const batches = await centralStoresApi.fetchBatchDetailsByProdsId(product.id, storeId);
      console.log('Batches fetched:', batches);
      
      if (batches.length === 0) {
        showWarningToast('This product has no batches available', 'No Batches Available');
        return;
      }
      
      // Sort batches by expiry date (nearest expiry first - FEFO)
      const sortedBatches = [...batches].sort((a, b) => {
        const dateA = new Date(a.expiryDate).getTime();
        const dateB = new Date(b.expiryDate).getTime();
        return dateA - dateB;
      });

      // Only consider batches with stock for auto-selection
      const availableBatches = sortedBatches.filter(b => b.availableStock > 0);

      if (availableBatches.length === 0) {
        showWarningToast('This product has no stock available in any batch', 'No Stock Available');
        setLoadingBatches(prev => ({ ...prev, [product.id]: false }));
        return;
      }
      
      setProductBatches(prev => ({ ...prev, [product.id]: sortedBatches }));
      
      // Auto-select batch with nearest expiry date and fetch stocks
      const selectedBatch = availableBatches[0];
      
      // Get store IDs for stock fetching (reuse storedData from above)
      let fromStoreStock = 0;
      let toStoreStock = 0;
      
      if (storedData && selectedStore) {
        const fromStoreId = storedData.masterId;
        const toStoreId = selectedStore.id;
        
        console.log(`Fetching stocks for batch ${selectedBatch.batchId} - From Store: ${fromStoreId}, To Store: ${toStoreId}`);
        
        // Fetch both stocks in parallel
        try {
          const [fromStock, toStock] = await Promise.all([
            centralStoresApi.fetchAvailableStock(selectedBatch.batchId, fromStoreId),
            centralStoresApi.fetchAvailableStock(selectedBatch.batchId, toStoreId)
          ]);
          
          fromStoreStock = fromStock;
          toStoreStock = toStock;
          
          console.log(`Stocks fetched - From: ${fromStoreStock}, To: ${toStoreStock}`);
        } catch (stockError) {
          console.error('Error fetching stocks:', stockError);
          // Continue with default stocks (0)
        }
      }
      
      // Add to transfer items with auto-selected batch and stocks
      const newItem: TransferItem = {
        id: product.id,
        itemName: product.productName,
        genericName: product.genericName,
        batchNo: selectedBatch.batchNo,
        batchId: selectedBatch.batchId,
        expiryDate: selectedBatch.expiryDate,
        manufacturer: product.companyName,
        unit: product.units,
        availableQty: fromStoreStock,
        toStoreStock: toStoreStock,
        rackLocation: '',
        schedule: '',
        transferQty: 0,
        remarks: ''
      };

      setTransferItems([...transferItems, newItem]);
  setSelectedProductId('');
      setSelectedProduct([]);
  setSearchText('');
  setAvailableProducts([]);
      setLoadingBatches(prev => ({ ...prev, [product.id]: false }));
      
      showSuccessToast(`Item added with batch ${selectedBatch.batchNo}`, 'Item Added', 2500);
    } catch (error) {
      console.error('Error adding product:', error);
      setLoadingBatches(prev => ({ ...prev, [product.id]: false }));
      showErrorToast('Failed to add product', 'Error');
    }
  };

  const handleBatchSelect = async (productId: number, batchId: number) => {
    const batches = productBatches[productId];
    if (!batches) return;
    
    const selectedBatch = batches.find(b => b.batchId === batchId);
    if (!selectedBatch) return;

    // Get store data from session storage
    const storedData = getStoreData();
    let fromStoreStock = 0;
    let toStoreStock = 0;

    try {
      if (storedData && selectedStore) {
        const fromStoreId = storedData.masterId;
        const toStoreId = selectedStore.id;
        
        console.log(`🔄 Fetching stocks for batch ${batchId} - From Store: ${fromStoreId}, To Store: ${toStoreId}`);
        
        // Fetch both stocks in parallel
        const [fromStock, toStock] = await Promise.all([
          centralStoresApi.fetchAvailableStock(batchId, fromStoreId)
            .catch(err => {
              console.error('❌ Error fetching from store stock:', err);
              return 0;
            }),
          centralStoresApi.fetchAvailableStock(batchId, toStoreId)
            .catch(err => {
              console.error('❌ Error fetching to store stock:', err);
              return 0;
            })
        ]);
        
        fromStoreStock = fromStock;
        toStoreStock = toStock;
        
        console.log(`✅ Stocks fetched - From Store: ${fromStoreStock}, To Store: ${toStoreStock}`);
      } else {
        console.warn('⚠️ Store data not available for stock fetch. Selected Store:', selectedStore);
        if (!selectedStore) {
          showWarningToast('Please select a destination store first', 'No Destination Store');
          return;
        }
      }
    } catch (error) {
      console.error('❌ Error fetching stock:', error);
      // Continue with batch stock if API fails
    }
    
    // Update the transfer item with batch details and stocks
    setTransferItems(prev => prev.map(item => {
      if (item.id === productId) {
        const updatedItem = {
          ...item,
          batchNo: selectedBatch.batchNo,
          batchId: selectedBatch.batchId,
          expiryDate: selectedBatch.expiryDate,
          availableQty: fromStoreStock,
          toStoreStock: toStoreStock,
          transferQty: 0 // Reset quantity when batch changes
        };
        console.log(`📦 Updated item ${productId}:`, updatedItem);
        return updatedItem;
      }
      return item;
    }));
  };

  const handleUpdateQuantity = (id: number, qty: number) => {
    if (qty < 0) return;
    
    const item = transferItems.find(i => i.id === id);
    if (item && qty > item.availableQty) {
      showWarningModal(`Available quantity: ${item.availableQty} ${item.unit}s`, 'Insufficient Stock');
      return;
    }

    setTransferItems(transferItems.map(item =>
      item.id === id ? { ...item, transferQty: qty } : item
    ));
  };

  const handleRemoveItem = (id: number) => {
    setTransferItems(transferItems.filter(item => item.id !== id));
  };

  const handleSubmitTransfer = () => {
    if (!selectedStore) {
      showWarningModal('Please select a destination store', 'No Store Selected');
      return;
    }

    if (transferItems.length === 0) {
      showWarningModal('Please add items to transfer', 'No Items Selected');
      return;
    }

    const invalidItems = transferItems.filter(item => item.transferQty <= 0);
    if (invalidItems.length > 0) {
      showWarningModal('All items must have quantity greater than 0', 'Invalid Quantities');
      return;
    }

    showCustomConfirmDialog(
      'Confirm Transfer',
      `
        <div class="text-start">
          <p><strong>Destination Store:</strong> ${selectedStore?.storeName}</p>
          <p><strong>Total Items:</strong> ${transferItems.length}</p>
          <p><strong>Total Units:</strong> ${transferItems.reduce((sum, item) => sum + item.transferQty, 0)}</p>
        </div>
      `,
      'question',
      'Submit Transfer',
      'Cancel',
      '#28a745',
      '#6c757d'
    ).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Get store data from session storage
          const storedData = getStoreData();
          if (!storedData) {
            showErrorModal('Store information not found. Please refresh and try again.', 'Error');
            return;
          }

          const fromStoreId = storedData.masterId;
          const toStoreId = selectedStore.id;

          // Validate all items have batchId
          const invalidItems = transferItems.filter(item => !item.batchId);
          if (invalidItems.length > 0) {
            showErrorModal('Some items are missing batch information. Please select batches for all items.', 'Error');
            return;
          }

          // Prepare request payload
          const requestData = {
            storeIdFrom: fromStoreId,
            storeIdTo: toStoreId,
            details: transferItems.map(item => ({
              productId: item.id,
              batchId: item.batchId!,
              quantity: item.transferQty
            }))
          };

          console.log('🚀 Submitting transfer order:', requestData);

          // Show loading
          Swal.fire({
            title: 'Submitting Transfer Order...',
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            }
          });

          // Call API
          const response = await centralStoresApi.createTransferOrder(requestData);

          // Close loading and show success
          const successMessage = response?.status
            ? `Transfer order ${response.status.toLowerCase()} successfully`
            : 'Transfer order has been successfully prepared and submitted for approval';
          const responseId = response?.displayId ?? 'N/A';
          const modalResult = await showSuccessModal(
            `${successMessage}<div class="mt-2">Entry ID: <mark><strong>${responseId}</strong></mark></div>`,
            'Transfer Order Prepared!',
            'OK'
          );

          if (modalResult.isConfirmed) {
            // Reset form after successful submission
            setTransferItems([]);
            setSelectedStore(null);
            setSelectedProduct([]);
            // Stay on the same page - don't navigate
          }
        } catch (error: any) {
          console.error('❌ Error submitting transfer order:', error);
          showErrorModal(error?.response?.data?.error || error?.message || 'Failed to submit transfer order. Please try again.', 'Submission Failed');
        }
      }
    });
  };

  const handleBack = () => {
    if (transferItems.length > 0) {
      showConfirmDialog(
        'You have items in the transfer list. Are you sure you want to go back?',
        'Unsaved Changes',
        'Yes, Go Back',
        'Stay Here'
      ).then((result) => {
        if (result.isConfirmed) {
          navigate(-1);
        }
      });
    } else {
      navigate(-1);
    }
  };

  const handleClearSelection = () => {
    setSelectedStore(null);
    setSelectedStoreId('');
    setSearchStoreText('');
    setSelectedProduct([]);
    setSelectedProductId('');
    setSearchText('');
    setAvailableProducts([]);
    setTransferItems([]);
    setProductBatches({});
    setLoadingBatches({});
  };

  const getTotalItems = () => transferItems.length;

  return (
    <div className="prepare-transfer-screen d-flex flex-column h-100">
        {/* Header */}
        <PageHeader
          icon={faFolder}
          title="Transfer Preparation"
          subtitle="Transfer items between stores"
          badges={[
            { label: 'Destination', value: selectedStore?.storeName || 'Not Selected' },
            { label: 'Items', value: getTotalItems() }
          ]}
        />

        <div className="prepare-transfer-content px-3 h-100 overflow-hidden">
          <div className="card flex-grow-1 shadow-sm d-flex flex-column h-100 overflow-hidden prepare-transfer-main-card">
            <div className="card-header prepare-transfer-main-header">
              <div className="row g-2 align-items-center">
                <div className="col-md-2">
                  <label className="text-muted mb-1" style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)' }}>
                    <i className="fas fa-warehouse text-primary me-2"></i>
                    From Store
                  </label>
                  <div className="fw-bold text-dark" style={{ fontSize: 'var(--font-size-base)' }}>
                    {currentStore?.name} {currentStore?.code ? `(${currentStore.code})` : ''}
                  </div>
                </div>
                <div className="col-md-3">
                  <label className="text-muted mb-1" style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)' }}>
                    To Store
                  </label>
                  <SearchableSelect
                    id="store-selection"
                    value={selectedStoreId}
                    onChange={handleStoreSelect}
                    options={filteredStores.map((store) => {
                      const extendedStore = store as StoreResponse & { isStore?: number };
                      const isStore = Number(extendedStore.isStore ?? 0) === 1;

                      return {
                        value: store.id,
                        label: isStore ? `${store.storeName}` : store.storeName,
                        isStore,
                      };
                    })}
                    placeholder="Search & Select Destination Store..."
                    onSearch={setSearchStoreText}
                    inputRef={storeSelectRef}
                    disabled={transferItems.length > 0}
                    // autoFocus
                  />
                  {transferItems.length > 0 && (
                    <small style={{ color: 'var(--color-warning)', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)' }}>
                      <i className="fas fa-lock me-1"></i>Store locked - remove all items to change
                    </small>
                  )}
                </div>
                <div className="col-md-5">
                  <label className="text-muted mb-1" style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)' }}>
                    Search Medicine
                  </label>
                  <SearchableSelect
                    id="medicine-search"
                    value={selectedProductId}
                    onChange={handleProductSelect}
                    options={availableProducts.map((product) => ({
                      value: product.prodsId,
                      label: product.productName,
                      isBlocked: product.isActive === 0,
                    }))}
                    placeholder={!selectedStore ? 'Select a destination store first...' : loading ? 'Loading medicines...' : 'Search Medicine Name'}
                    onSearch={setSearchText}
                    inputRef={searchRef}
                    disabled={!selectedStore}
                    onEnterWhenClosed={handleAddProduct}
                  />
                </div>
                <div className="col-md-2">
                  <label className="text-muted mb-1" style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)', visibility: 'hidden' }}>
                    Action
                  </label>
                  <button
                    className="theme-btn-primary"
                    onClick={handleAddProduct}
                    disabled={!selectedStore || selectedProduct.length === 0 || loading}
                  >
                    <i className="fas fa-plus me-1"></i>
                    ADD
                  </button>
                </div>
              </div>
            </div>

            <div className="card-body p-0 d-flex flex-column prepare-transfer-main-body">
              <div className="table-responsive flex-grow-1 prepare-transfer-table-wrap">
                {transferItems.length === 0 ? (
                  <div className="text-center text-muted py-5">
                    <i className="fas fa-inbox fa-3x mb-3 d-block" style={{ opacity: 0.3 }}></i>
                    <p className="mb-0">No items added yet. Search and add items to transfer.</p>
                  </div>
                ) : (
                  <table className="table table-hover mb-0 align-middle">
                    <thead className="bg-light text-muted text-uppercase small" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                      <tr>
                        <th style={{ width: '60px' }} className="text-center">#</th>
                        <th>Item Name</th>
                        <th style={{ width: '350px' }}>Batch No</th>
                        <th style={{ width: '100px' }} className="text-center">Avail. in From Store</th>
                        <th style={{ width: '100px' }} className="text-center">Avail. in To Store</th>
                        <th style={{ width: '150px' }}>Transfer Qty</th>
                        <th style={{ width: '80px' }} className="text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transferItems.map((item, index) => (
                        <tr key={item.id}>
                          <td className="text-center text-muted small">{index + 1}</td>
                          <td>
                            <div className="fw-bold text-dark">{item.itemName}</div>
                            <small className="text-muted">{item.genericName}</small>
                          </td>
                          <td>
                            {loadingBatches[item.id] ? (
                              <small className="text-muted">
                                <i className="fas fa-spinner fa-spin me-1"></i>Loading...
                              </small>
                            ) : productBatches[item.id] && productBatches[item.id].length > 0 ? (
                              <select
                                ref={(el) => (batchSelectRefs.current[item.id] = el)}
                                className="form-select form-select-sm"
                                value={productBatches[item.id]?.find(b => b.batchNo === item.batchNo)?.batchId || ''}
                                onChange={(e) => handleBatchSelect(item.id, parseInt(e.target.value))}
                                onKeyDown={(e) => {
                                  if (e.key === 'Tab' && !e.shiftKey) {
                                    e.preventDefault();
                                    const qtyInput = qtyInputRefs.current[item.id];
                                    if (qtyInput) qtyInput.focus();
                                  }
                                }}
                              >
                                {productBatches[item.id].map((batch) => (
                                  <option key={batch.batchId} value={batch.batchId}>
                                    {batch.batchNo} (Exp: {new Date(batch.expiryDate).toLocaleDateString()}) - MRP: {batch.mrp}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <small className="text-muted">No batches available</small>
                            )}
                          </td>
                          <td className="text-center">
                            <span className="badge bg-info text-white">
                              {item.availableQty}
                            </span>
                          </td>
                          <td className="text-center">
                            <span className="badge bg-secondary">
                              {item.toStoreStock || 0}
                            </span>
                          </td>
                          <td>
                            <input
                              ref={(el) => (qtyInputRefs.current[item.id] = el)}
                              type="number"
                              className="form-control form-control-sm"
                              min="1"
                              max={item.availableQty}
                              value={item.transferQty}
                              onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value) || 0)}
                              onKeyDown={(e) => {
                                if (e.key === 'Tab' && !e.shiftKey) {
                                  e.preventDefault();
                                  if (searchRef.current) {
                                    searchRef.current.focus();
                                  }
                                }
                              }}
                              placeholder="Enter qty"
                            />
                          </td>
                          <td className="text-center">
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleRemoveItem(item.id)}
                              title="Remove Item"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="card-footer prepare-transfer-main-footer">
              <div className="d-flex justify-content-between align-items-center">
                <button
                  className="btn btn-secondary"
                  onClick={handleClearSelection}
                >
                  <i className="fas fa-sync-alt me-1"></i>
                  Refresh
                </button>
                <button
                  className="btn btn-success"
                  onClick={handleSubmitTransfer}
                  disabled={transferItems.length === 0}
                >
                  <i className="fas fa-paper-plane me-2"></i>
                  Submit Transfer
                </button>
              </div>
            </div>
          </div>
        </div>

        <style>{`
        .prepare-transfer-screen {
          overflow: hidden;
          background-color: var(--page-body-bg);
        }

        .prepare-transfer-content {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .prepare-transfer-main-card {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .panel-header {
          padding: 12px 24px;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--surface-color);
        }

        .panel-header h3 {
          margin: 0;
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-semibold);
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 10px;
          text-transform: uppercase;
        }

        .panel-header h3 i {
          color: var(--primary-color);
          font-size: var(--font-size-lg);
        }

        .count-badge {
          background: var(--light-color);
          color: var(--text-primary);
          padding: 2px 8px;
          border-radius: 0;
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-semibold);
          border: 1px solid var(--border-color);
        }

        /* Compact Table */
        .table-wrapper {
          flex: 1;
          overflow: auto;
          min-height: 0;
        }

        .compact-table {
          width: 100%;
          border-collapse: collapse;
          font-size: var(--font-size-sm);
        }

        .compact-table thead {
          position: sticky;
          top: 0;
          background: var(--light-color);
          z-index: 10;
        }

        .compact-table th {
          padding: 10px 16px;
          text-align: left;
          font-weight: var(--font-weight-semibold);
          color: var(--text-primary);
          border-bottom: 1px solid var(--border-color);
          font-size: var(--font-size-sm);
          text-transform: uppercase;
        }

        .compact-table tbody tr {
          border-bottom: 1px solid var(--border-color);
          transition: background 0.1s ease;
        }

        .compact-table tbody tr:hover {
          background: #f4f4f4;
        }

        .compact-table td {
          padding: 10px 16px;
          color: var(--text-primary);
          vertical-align: middle;
        }

        .item-cell {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .item-cell strong {
          color: var(--text-primary);
          font-weight: var(--font-weight-medium);
        }

        .badge-sch {
          background: transparent;
          color: var(--text-secondary);
          padding: 0 4px;
          border: 1px solid var(--border-color);
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-semibold);
        }

        .text-muted {
          color: var(--text-secondary);
        }

        .batch-code {
          background: transparent;
          padding: 2px 6px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: var(--font-size-sm);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
        }

        .qty-available {
          color: var(--success-color);
          font-weight: var(--font-weight-semibold);
        }

        .location {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--text-secondary);
          font-size: var(--font-size-sm);
        }

        .location i {
          color: var(--text-secondary);
        }

        .text-right {
          text-align: right;
        }

        .text-center {
          text-align: center;
        }

        .qty-input {
          width: 70px;
          padding: 6px 8px;
          border: 1px solid var(--border-color);
          border-radius: 0;
          font-size: var(--font-size-sm);
          text-align: center;
          transition: all 0.2s;
          font-weight: var(--font-weight-normal);
          background: white;
        }

        .qty-input:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: inset 0 0 0 1px var(--primary-color);
        }

        .qty-input[value]:not([value=""]) {
          border-color: var(--success-color);
          background: #f6ffed;
          color: var(--success-color);
          font-weight: var(--font-weight-semibold);
        }

        .selected-row {
          background: #e6f7ff !important;
        }

        .selected-row:hover {
          background: #bae7ff !important;
        }


        
        .empty-state,
        .empty-cart,
        .loading-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          color: var(--text-secondary);
        }

        .empty-state i, .empty-cart i, .loading-state i {
          font-size: calc(var(--font-size-4xl) * 1.067);
          margin-bottom: 16px;
          opacity: 0.3;
        }

        .empty-state h4 {
          margin: 0 0 8px 0;
          font-size: var(--font-size-lg);
          color: var(--text-primary);
          font-weight: var(--font-weight-semibold);
        }

        .empty-state p, .empty-cart p {
          margin: 0;
          font-size: var(--font-size-sm);
        }

        .spinner {
          border: 2px solid rgba(15, 98, 254, 0.1);
          border-top: 2px solid var(--primary-color);
          border-radius: 50%;
          width: 32px;
          height: 32px;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 1200px) {
          .medicines-panel.with-sidebar {
            width: 100%;
          }
          
          .cart-sidebar {
            position: fixed;
            right: 0;
            top: 0;
            height: 100vh;
            z-index: 1000;
          }
        }

        .text-start {
          text-align: left !important;
        }

        .prepare-transfer-main-body {
          flex: 1;
          min-height: 0;
        }

        .prepare-transfer-table-wrap {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
        }

        .prepare-transfer-main-footer {
          background-color: var(--page-header-bg);
          border-top: 1px solid var(--border-color);
          padding: 0.75rem 1rem;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
};


export default PrepareTransfer;
