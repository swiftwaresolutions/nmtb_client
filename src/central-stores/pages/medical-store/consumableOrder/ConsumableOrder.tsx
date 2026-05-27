import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../state/store';
import '../../../../style/commonStyle.css';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import PageHeader from '../../../../components/PageHeader';
import SearchableSelect from '../../../../components/SearchableSelect';
import CentralStoresApiService, {
  BatchDetail,
  ConsumableWay,
  ProductsByNameForPOResponse,
  SaveConsumableRequest,
} from '../../../../api/central-stores/central-stores-api-service';
import { handleError } from '../../../../utils/errorUtil';
import {
  closeAlert,
  showCustomConfirmDialog,
  showErrorModal,
  showLoading,
  showSuccessModal,
  showSuccessToast,
  showWarningModal,
  showWarningToast,
} from '../../../../utils/alertUtil';
import {
  formatNumberDisplay,
  handleNumberBlur,
  handleNumberChange,
} from '../../../../utils/numberInputUtil';

interface SubModuleState {
  subModId: number;
  subModName: string;
  modGroupId: number;
  modGroupName: string;
  masterId: number;
}

const getStoreData = (): SubModuleState | null => {
  const centralStoresData = sessionStorage.getItem('selectedStore');
  if (centralStoresData) {
    return JSON.parse(centralStoresData);
  }

  const pharmacyData = sessionStorage.getItem('pharmacySubModuleData');
  if (pharmacyData) {
    return JSON.parse(pharmacyData);
  }

  return null;
};

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

interface OrderItem {
  id: number;
  itemName: string;
  genericName: string;
  batchNo: string;
  batchId?: number;
  expiryDate: string;
  manufacturer: string;
  unit: string;
  availableQty: number;
  rackLocation: string;
  schedule: string;
  quantity: number;
  remarks: string;
  consumableWayId: number | null;
}

const ConsumableOrder: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const loginData = useSelector((state: RootState) => state.loginData);
  const centralStoresApi = new CentralStoresApiService();

  const [subModuleData, setSubModuleData] = useState<SubModuleState | null>(null);
  const [currentStore, setCurrentStore] = useState<{ name: string; code: string } | null>(null);
  const [availableProducts, setAvailableProducts] = useState<ProductData[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(null);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [searchText, setSearchText] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [consumableWays, setConsumableWays] = useState<ConsumableWay[]>([]);
  const [loading, setLoading] = useState(false);
  const [productBatches, setProductBatches] = useState<{ [productId: number]: BatchDetail[] }>({});
  const [loadingBatches, setLoadingBatches] = useState<{ [productId: number]: boolean }>({});

  const searchRef = useRef<HTMLInputElement>(null);
  const batchSelectRefs = useRef<{ [key: number]: HTMLSelectElement | null }>({});
  const qtyInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
  const waysInputRefs = useRef<{ [key: number]: HTMLSelectElement | null }>({});

  const loadProducts = async (name: string, masterId: number) => {
    try {
      if (name.trim().length < 2) {
        setAvailableProducts([]);
        return;
      }

      setLoading(true);
      const products: ProductsByNameForPOResponse[] = await centralStoresApi.fetchProductsByNameForPO(2, name);

      if (!Array.isArray(products)) {
        setAvailableProducts([]);
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
      handleError(dispatch, error);
      showErrorModal('Failed to load products. Please try again.', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const fetchConsumableWays = async () => {
    try {
      const response = await centralStoresApi.fetchAllConsumableWays();
      setConsumableWays(response);
    } catch (error) {
      handleError(dispatch, error);
      showErrorModal('Failed to load consumable ways. Please try again.', 'Error');
    }
  };

  useEffect(() => {
    if (!loginData.authorized) {
      navigate('/login');
      return;
    }

    const storedStoreData = getStoreData();
    let resolvedStoreData: SubModuleState | null = null;

    if (storedStoreData) {
      resolvedStoreData = storedStoreData;
    } else {
      const state = location.state as SubModuleState | null;
      if (state) {
        resolvedStoreData = state;
      }
    }

    if (resolvedStoreData) {
      setSubModuleData(resolvedStoreData);
      setCurrentStore({
        name: resolvedStoreData.subModName,
        code: resolvedStoreData.modGroupName,
      });
    }
  }, [location.state, loginData.authorized, navigate]);

  useEffect(() => {
    if (!subModuleData?.masterId) {
      return;
    }

    fetchConsumableWays();
  }, [subModuleData?.masterId]);

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

  const handleProductSelect = (selectedValue: string) => {
    setSelectedProductId(selectedValue);

    const nextProduct = availableProducts.find(
      (product) => product.prodsId.toString() === selectedValue
    );

    if (!nextProduct) {
      setSelectedProduct(null);
      return;
    }

    if (nextProduct.isActive === 0) {
      showWarningToast('This medicine is blocked and cannot be selected', 'Blocked Medicine');
      setSelectedProductId('');
      setSelectedProduct(null);
      return;
    }

    setSelectedProduct(nextProduct);
  };

  const handleAddProduct = async () => {
    if (!selectedProduct) {
      showWarningToast('Please search and select an item first', 'No Item Selected');
      return;
    }

    if (orderItems.find((item) => item.id === selectedProduct.id)) {
      showWarningToast('This item is already in your order list', 'Already Added');
      return;
    }

    try {
      setLoadingBatches((prev) => ({ ...prev, [selectedProduct.id]: true }));

      const storedData = getStoreData();
      const storeId = Number(storedData?.masterId ?? 0);

      if (!storeId) {
        showErrorModal('Store information is missing. Please reselect the store.', 'Error');
        return;
      }

      const batches = await centralStoresApi.fetchBatchDetailsByProdsId(selectedProduct.id, storeId);

      if (batches.length === 0) {
        showWarningToast('This product has no batches available', 'No Batches Available');
        return;
      }

      const sortedBatches = [...batches].sort((a, b) => {
        const dateA = new Date(a.expiryDate).getTime();
        const dateB = new Date(b.expiryDate).getTime();
        return dateA - dateB;
      });

      const availableBatches = sortedBatches.filter((b) => b.availableStock > 0);

      if (availableBatches.length === 0) {
        showWarningToast('This product has no stock available in any batch', 'No Stock Available');
        setLoadingBatches((prev) => ({ ...prev, [selectedProduct.id]: false }));
        return;
      }

      setProductBatches((prev) => ({ ...prev, [selectedProduct.id]: sortedBatches }));

      // const selectedBatch = sortedBatches[0];
      const selectedBatch = availableBatches[0];
      let availableStock = 0;

      try {
        availableStock = await centralStoresApi.fetchAvailableStock(selectedBatch.batchId, storeId);
      } catch {
        availableStock = 0;
      }

      const newItem: OrderItem = {
        id: selectedProduct.id,
        itemName: selectedProduct.productName,
        genericName: selectedProduct.genericName,
        batchNo: selectedBatch.batchNo,
        batchId: selectedBatch.batchId,
        expiryDate: selectedBatch.expiryDate,
        manufacturer: selectedProduct.companyName,
        unit: selectedProduct.units,
        availableQty: availableStock,
        rackLocation: '',
        schedule: '',
        quantity: 0,
        remarks: '',
        consumableWayId: null,
      };

      setOrderItems((prev) => [...prev, newItem]);
      setSelectedProduct(null);
      setSelectedProductId('');
      setSearchText('');
      setAvailableProducts([]);
      searchRef.current?.focus();
      showSuccessToast(`Item added with batch ${selectedBatch.batchNo}`, 'Item Added', 2500);
    } catch (error) {
      handleError(dispatch, error);
      showErrorModal('Failed to add product. Please try again.', 'Error');
    } finally {
      setLoadingBatches((prev) => ({ ...prev, [selectedProduct.id]: false }));
    }
  };

  const handleBatchSelect = async (productId: number, batchId: number) => {
    const batches = productBatches[productId];
    if (!batches) {
      return;
    }

    const selectedBatch = batches.find((batch) => batch.batchId === batchId);
    if (!selectedBatch) {
      return;
    }

    const storedData = getStoreData();
    const storeId = Number(storedData?.masterId ?? 0);

    if (!storeId) {
      showErrorModal('Store information is missing. Please reselect the store.', 'Error');
      return;
    }

    let availableStock = 0;

    try {
      availableStock = await centralStoresApi.fetchAvailableStock(batchId, storeId);
    } catch {
      availableStock = 0;
    }

    setOrderItems((prev) =>
      prev.map((item) =>
        item.id === productId
          ? {
              ...item,
              batchNo: selectedBatch.batchNo,
              batchId: selectedBatch.batchId,
              expiryDate: selectedBatch.expiryDate,
              availableQty: availableStock,
              quantity: 0,
            }
          : item
      )
    );
  };

  const handleUpdateQuantity = (id: number, quantity: number) => {
    if (quantity < 0) {
      return;
    }

    const item = orderItems.find((entry) => entry.id === id);
    if (item && quantity > item.availableQty) {
      showWarningModal(`Available quantity: ${item.availableQty} ${item.unit}s`, 'Insufficient Stock');
      return;
    }

    setOrderItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const handleUpdateRemarks = (id: number, remarks: string) => {
    setOrderItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, remarks } : item
      )
    );
  };

  const handleUpdateConsumableWay = (id: number, consumableWayId: number | null) => {
    setOrderItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, consumableWayId } : item
      )
    );
  };

  const handleRemoveItem = (id: number) => {
    setOrderItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleRefresh = () => {
    setSelectedProduct(null);
    setSelectedProductId('');
    setSearchText('');
    setAvailableProducts([]);
    setOrderItems([]);
    setProductBatches({});
    setLoadingBatches({});
  };

  const handleSubmitOrder = () => {
    if (orderItems.length === 0) {
      showWarningModal('Please add items to order', 'No Items Selected');
      return;
    }

    const itemsWithInvalidQuantity = orderItems.filter((item) => item.quantity <= 0);
    if (itemsWithInvalidQuantity.length > 0) {
      showWarningModal('All items must have quantity greater than 0', 'Invalid Quantities');
      return;
    }

    const itemsWithoutBatch = orderItems.filter((item) => !item.batchId);
    if (itemsWithoutBatch.length > 0) {
      showErrorModal('Some items are missing batch information. Please select batches for all items.', 'Error');
      return;
    }

    const itemsWithoutWay = orderItems.filter((item) => !item.consumableWayId);
    if (itemsWithoutWay.length > 0) {
      showWarningModal('Please select consumable way for all items.', 'Missing Consumable Way');
      return;
    }

    showCustomConfirmDialog(
      'Confirm Consumable Order',
      `
        <div class="text-start">
          <p><strong>Total Items:</strong> ${orderItems.length}</p>
          <p><strong>Total Units:</strong> ${orderItems.reduce((sum, item) => sum + item.quantity, 0)}</p>
        </div>
      `,
      'question',
      'Submit Order',
      'Cancel'
    ).then(async (result) => {
      if (!result.isConfirmed) {
        return;
      }

      try {
        const storedData = getStoreData();
        const storeId = Number(storedData?.masterId ?? 0);

        if (!storeId) {
          showErrorModal('Store information not found. Please refresh and try again.', 'Error');
          return;
        }

        const requestData: SaveConsumableRequest = {
          id: 0,
          storeId,
          uid: loginData.id,
          consumableDetails: orderItems.map((item) => {
            const batchInfo = (productBatches[item.id] ?? []).find(
              (b) => b.batchId === item.batchId
            );
            const mrp = batchInfo?.mrp ?? 0;
            const salesPrice = batchInfo?.salesPrice ?? 0;
            const discountPer = batchInfo?.discountPer ?? 0;
            const qty = item.quantity;
            return {
              id: 0,
              waysId: item.consumableWayId!,
              batchId: item.batchId!,
              qty,
              mrp,
              total: salesPrice * qty,
              discountAmt: mrp * (discountPer / 100) * qty,
              sgstPer: batchInfo?.sgstPer ?? 0,
              cgstPer: batchInfo?.cgstPer ?? 0,
              igstPer: batchInfo?.igstPer ?? 0,
            };
          }),
        };

        showLoading('Submitting Consumable Order...');

        const response = await centralStoresApi.saveConsumable(requestData);
        closeAlert();

        // const modalResult = await showSuccessModal(
        //   response.message || 'Consumable order has been successfully submitted',
        //   'Order Submitted!'
        // );
        const successMessage = response?.status
          ? `Consumable order ${response.status.toLowerCase()} successfully`
          : 'Consumable order has been successfully submitted';
        const responseId = response?.displayId ?? 'N/A';
        const modalResult = await showSuccessModal(
          `${successMessage}<div class="mt-2">Entry ID: <mark><strong>${responseId}</strong></mark></div>`,
          'Consumable Order Prepared!',
          'OK'
        );

        if (modalResult.isConfirmed) {
          handleRefresh();
        }
      } catch (error: any) {
        closeAlert();
        const errorMessage =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          'Failed to submit order. Please try again.';

        showErrorModal(errorMessage, 'Submission Failed');
      }
    });
  };

  return (
    <div className="consumable-order-screen d-flex flex-column h-100">
      <PageHeader
        icon={faShoppingCart}
        title="Consumable Order"
        subtitle="Order consumable items from store"
        badges={[
          { label: 'Store', value: currentStore?.name || 'Not Set' },
          { label: 'Items', value: orderItems.length },
        ]}
      />

      <div className="consumable-order-content px-3 h-100 overflow-hidden">
        <div className="card flex-grow-1 shadow-sm d-flex flex-column h-100 overflow-hidden consumable-order-main-card">
          <div className="card-header consumable-order-main-header">
            <div className="row g-2 align-items-center">
              <div className="col-md-3">
                <label className="consumable-order-label mb-1">
                  <i className="fas fa-warehouse text-primary me-2"></i>
                  From Store
                </label>
                <div className="consumable-order-store-value">
                  {currentStore?.name} {currentStore?.code ? `(${currentStore.code})` : ''}
                </div>
              </div>
              <div className="col-md-7">
                <label className="consumable-order-label mb-1">Search Medicine</label>
                <SearchableSelect
                  id="consumable-order-medicine-search"
                  value={selectedProductId}
                  onChange={handleProductSelect}
                  options={availableProducts.map((product) => ({
                    value: product.prodsId,
                    label: product.productName,
                    isBlocked: product.isActive === 0,
                  }))}
                  placeholder={loading ? 'Loading medicines...' : 'Search Medicine Name'}
                  onSearch={setSearchText}
                  inputRef={searchRef}
                  onEnterWhenClosed={handleAddProduct}
                />
              </div>
              <div className="col-md-2">
                <label className="consumable-order-label mb-1 consumable-order-hidden-label">
                  Action
                </label>
                <button
                  className="theme-btn-primary"
                  onClick={handleAddProduct}
                  disabled={!selectedProduct || loading}
                >
                  <i className="fas fa-plus me-1"></i>
                  ADD
                </button>
              </div>
            </div>
          </div>

          <div className="card-body p-0 d-flex flex-column consumable-order-main-body">
            <div className="table-responsive flex-grow-1 consumable-order-table-wrap">
              {orderItems.length === 0 ? (
                <div className="consumable-order-empty-state text-center text-muted py-5">
                  <i className="fas fa-inbox fa-3x mb-3 d-block consumable-order-empty-icon"></i>
                  <p className="mb-0">No items added yet. Search and add items to create a consumable order.</p>
                </div>
              ) : (
                <table className="table table-hover mb-0 align-middle">
                  <thead className="bg-light text-muted text-uppercase small consumable-order-sticky-head">
                    <tr>
                      <th className="text-center consumable-order-col-index">#</th>
                      <th>Item Name</th>
                      <th className="consumable-order-col-batch">Batch No</th>
                      <th className="text-center consumable-order-col-stock">Available Qty</th>
                      <th className="consumable-order-col-qty">Order Qty</th>
                      <th className="consumable-order-col-way">Consumable Way</th>
                      <th className="consumable-order-col-remarks">Remarks</th>
                      <th className="text-center consumable-order-col-action">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderItems.map((item, index) => (
                      <tr key={item.id}>
                        <td className="text-center text-muted small">{index + 1}</td>
                        <td>
                          <div className="fw-bold text-dark">{item.itemName}</div>
                          <small className="text-muted">{item.genericName}</small>
                        </td>
                        <td>
                          {loadingBatches[item.id] ? (
                            <small className="text-muted">
                              <i className="fas fa-spinner fa-spin me-1"></i>
                              Loading...
                            </small>
                          ) : productBatches[item.id] && productBatches[item.id].length > 0 ? (
                            <select
                              ref={(el) => {
                                batchSelectRefs.current[item.id] = el;
                              }}
                              className="form-select form-select-sm"
                              value={productBatches[item.id]?.find((batch) => batch.batchNo === item.batchNo)?.batchId || ''}
                              onChange={(e) => handleBatchSelect(item.id, parseInt(e.target.value, 10))}
                              onKeyDown={(e) => {
                                if (e.key === 'Tab' && !e.shiftKey) {
                                  e.preventDefault();
                                  const qtyInput = qtyInputRefs.current[item.id];
                                  if (qtyInput) {
                                    qtyInput.focus();
                                  }
                                }
                              }}
                            >
                              {productBatches[item.id].map((batch) => (
                                <option key={batch.batchId} value={batch.batchId}>
                                  {batch.batchNo} (Exp: {new Date(batch.expiryDate).toLocaleDateString()})
                                </option>
                              ))}
                            </select>
                          ) : (
                            <small className="text-muted">No batches available</small>
                          )}
                        </td>
                        <td className="text-center">
                          <span className="badge bg-info text-white">{item.availableQty}</span>
                        </td>
                        <td>
                          <input
                            ref={(el) => {
                              qtyInputRefs.current[item.id] = el;
                            }}
                            type="number"
                            className="form-control form-control-sm"
                            min="0"
                            max={item.availableQty}
                            value={formatNumberDisplay(item.quantity)}
                            onChange={(e) => handleUpdateQuantity(item.id, handleNumberChange(e.target.value))}
                            onBlur={(e) => handleUpdateQuantity(item.id, handleNumberBlur(e.target.value))}
                            onKeyDown={(e) => {
                              if (e.key === 'Tab' && !e.shiftKey) {
                                e.preventDefault();
                                waysInputRefs.current[item.id]?.focus();
                              }
                            }}
                            placeholder="0"
                          />
                        </td>
                        <td>
                          <select
                          ref={(el) => {
                              waysInputRefs.current[item.id] = el;
                            }}
                            className="form-select form-select-sm"
                            value={item.consumableWayId || ''}
                            onChange={(e) =>
                              handleUpdateConsumableWay(
                                item.id,
                                e.target.value ? parseInt(e.target.value, 10) : null
                              )
                            }
                            // onKeyDown={(e) => {
                            //   if (e.key === 'Tab' && !e.shiftKey) {
                            //     e.preventDefault();
                            //     searchRef.current?.focus();
                            //   }
                            // }}
                          >
                            <option value="">Select Way</option>
                            {consumableWays.map((way) => (
                              <option key={way.id} value={way.id}>
                                {way.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={item.remarks}
                            onChange={(e) => handleUpdateRemarks(item.id, e.target.value)}
                            placeholder="Enter remarks"
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

          <div className="card-footer consumable-order-main-footer">
            <div className="d-flex justify-content-between align-items-center gap-2 flex-wrap">
              <button className="btn btn-secondary" onClick={handleRefresh}>
                <i className="fas fa-sync-alt me-1"></i>
                Refresh
              </button>
              <button
                className="btn btn-success"
                onClick={handleSubmitOrder}
                disabled={orderItems.length === 0}
              >
                <i className="fas fa-paper-plane me-2"></i>
                Submit Order
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .consumable-order-screen {
          overflow: hidden;
          background-color: var(--page-body-bg);
        }

        .consumable-order-content {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .consumable-order-main-card {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .consumable-order-main-body {
          flex: 1;
          min-height: 0;
          overflow: hidden;
        }

        .consumable-order-table-wrap {
          min-height: 0;
        }

        .consumable-order-main-header,
        .consumable-order-main-footer {
          flex-shrink: 0;
        }

        .consumable-order-label {
          color: var(--bs-secondary-color);
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-medium);
        }

        .consumable-order-hidden-label {
          visibility: hidden;
        }

        .consumable-order-store-value {
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-semibold);
          color: var(--bs-body-color);
        }

        .consumable-order-empty-icon {
          opacity: 0.3;
        }

        .consumable-order-sticky-head {
          position: sticky;
          top: 0;
          z-index: 1;
        }

        .consumable-order-col-index {
          width: 60px;
        }

        .consumable-order-col-batch {
          width: 250px;
        }

        .consumable-order-col-stock {
          width: 120px;
        }

        .consumable-order-col-qty {
          width: 150px;
        }

        .consumable-order-col-way {
          width: 200px;
        }

        .consumable-order-col-remarks {
          width: 220px;
        }

        .consumable-order-col-action {
          width: 90px;
        }
      `}</style>
    </div>
  );
};

export default ConsumableOrder;
