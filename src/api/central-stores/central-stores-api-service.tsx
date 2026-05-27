import HttpClientWrapper from '../http-client-wrapper';

// ==================== Goods Receipt Register Interfaces ====================
export interface GoodsReceiptRegisterMedicine {
  medicineName: string;
  hsnCode: string;
  units: string;
  totalUnits: number;
  free: string;
  totalFree: number;
  batchNo: string;
  expiryDate: string;
  cost: number;
  mrp: number;
  discountPercentage: number;
  discount: number;
  totalAmt: number;
  gstPer: number;
  gstAmt: number;
  profit: number;
  profitPercentage: number;
}

export interface GoodsReceiptRegisterRecord {
  grNo: string;
  supplierName: string;
  supplierAddress: string;
  invoiceNo: string;
  invoiceDate: string;
  receivedDate: string;
  userName: string;
  totalValue: number;
  mrpValue: number;
  medicines: GoodsReceiptRegisterMedicine[];
}

export interface SupplierwisePurchaseTotalRecord {
  supplierId: number;
  supplierName: string;
  costPriceTotal: number;
  totalMrp: number;
}

export interface CostwiseMedicineRecord {
  medicineName: string;
  batchNo: string;
  cost: number;
  mrp: number;
  stock: number;
}

// ==================== Sub Module Interfaces ====================
export interface SubModuleResponse {
  modGroupId: number;
  modGroupName: string;
  subModId: number;
  subModName: string;
  masterId: number;
}

// ==================== Generic Group Interfaces ====================
export interface GenericGroupResponse {
  id: number;
  name: string;
  description: string;
  isBlocked: number;
  blockedUid: number;
  blockedDateTime: string;
  dateTime: string;
  storeId: number;
  uid: number;
}

export interface SaveGenericGroupRequest {
  name: string;
  description: string;
  storeId: number;
}

export interface UpdateGenericGroupRequest {
  name: string;
  description: string;
  isBlocked: number;
  storeId: number;
  uid: number;
}

export interface BlockGenericGroupRequest {
  id: number;
  blockedUid: number;
}

export interface UnblockGenericGroupRequest {
  id: number;
  uid: number;
}

// ==================== Sub Generic Group Interfaces ====================
export interface SubGenericGroupResponse {
  id: number;
  name: string;
  description: string;
  groupId: number;
  isBlocked: number;
  blockedUid: number;
  blockedDateTime: string;
  storeId: number;
  dateTime: string;
  uid: number;
}

export interface SaveSubGenericRequest {
  name: string;
  description: string;
  groupId: number;
  storeId: number;
}

export interface UpdateSubGenericRequest {
  name: string;
  description: string;
  groupId: number;
  isBlocked: number;
  storeId: number;
  uid: number;
}

// ==================== Generic Details Interfaces ====================
export interface GenericDetailsResponse {
  id: number;
  name: string;
  genGrpId: number;
  genSubGrpId: number;
  description: string;
  userlog: string;
  dosage: number;
  route: number;
  min: number;
  max: number;
  dateTime: string;
  scheduled: number;
  scheduledType: number;
  storeId: number;
  isActive: number;
}

export interface SaveGenericRequest {
  name: string;
  genGrpId: number;
  genSubGrpId: number;
  description: string;
  dosage: number;
  route: number;
  min: number;
  max: number;
  scheduled: number;
  scheduledType: number;
  storeId: number;
}

export interface UpdateGenericRequest {
  name: string;
  genGrpId: number;
  genSubGrpId: number;
  description: string;
  dosage: number;
  route: number;
  min: number;
  max: number;
  scheduled: number;
  scheduledType: number;
  isActive: number;
  storeId: number;
  uid: number;
}
// ==================== Purchase Order Interfaces ====================
export interface PurchaseOrderDetail {
  medId: number;
  qty: number;
  pack: number;
  units: number;
  quotationDetId: number;
  cpQuoted: number;
  freeQuoted: number;
  negotiateAmt: number;
}

export interface SavePurchaseOrderRequest {
  poNo: string;
  supId: number;
  prepareLetter: number;
  isByPhone: number;
  deptId: number;
  invoiceNo: string;
  storeId: number;
  details: PurchaseOrderDetail[];
}

export interface SavePurchaseOrderListRequest {
  purchaseOrders: SavePurchaseOrderRequest[];
}

export interface FetchProductsForPurchaseOrderRequest {
  filterType: string;
  vendorId: number;
  phModId: number;
}

export interface PurchaseOrderProductResponse {
  productId: number;
  genericName: string;
  productName: string;
  manufacturer: string;
  currentStock: number;
  minStockLevel: number;
  units: string;
}

export interface FetchProductsForPOResponse {
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

export interface PurchaseOrderDetailResponse {
  id: number;
  orderId: number;
  medId: number;
  qty: number;
  units: number;
  recUnits: number;
  orderDate: string;
  recDate: string;
  quotationDetId: number;
  batchQuoted: number;
  cpQuoted: number;
  freeQuoted: number;
  isFullyReceived: number;
  isMaxOrdered: number;
  invSlNo: number;
  uid: number;
  isModified: number;
  isPreSaved: number;
  negotiateAmt: number;
  medicineName: string;
  genericName: string;
}

export interface PurchaseOrderResponse {
  orderId: number;
  poNo: string;
  supId: number;
  supplierName: string;
  orderDateTime: string;
  prepareLetter: number;
  isByPhone: number;
  isApproved: number;
  approvedUid: number;
  approvedDateTime: string;
  isClosed: number;
  closedUid: number;
  closedDateTime: string;
  deptId: number;
  isFinished: number;
  isOrderSettled: number;
  isPreSaved: number;
  invoiceNo: string;
  preparedUid: number;
  preSavedUid: number;
  preSavedDateTime: string;
  storeId: number;
  details: PurchaseOrderDetailResponse[];
}

export interface PreGoodsReceiptResponse {
  preGoodsId: number;
  orderId: number;
  detId: number;
  prodsId: number;
  productName: string;
  qty: number;
  pack: number;
  unit: number;
  free: number;
  freePack: number;
  taxOnFree: number;
  batchId: number;
  batchNo: string;
  expDate: string;
  cost: number;
  mrp: number;
  vatPer: number;
  vatType: number;
  discPer: number;
  isSaved: number;
  isConfirmed: number;
  discWithoutTaxPer: number;
  grnId: number;
  hsnCode: string;
  discOnMrp: number;
  savedDateTime: string;
  savedUid: number;
  isModified: number;
  modifyDateTime: string;
  modifyUid: number;
  confirmedDateTime: string;
  confirmedUid: number;
  invSlNo:number;
}

export interface SavePurchaseEntryDetail {
  preGoodsId: number;
  orderId: number;
  detId: number;
  prodsId: number;
  qty: number;
  pack: number;
  unit: number;
  free: number;
  freePack: number;
  taxOnFree: number;
  batchId: number;
  batchNo: string;
  expDate: string;
  cost: number;
  mrp: number;
  vatPer: number;
  vatType: number;
  discPer: number;
  discWithoutTaxPer: number;
  grnId: number;
  hsnCode: string;
  discOnMrp: number;
  invSlNo: number;
}

export interface ConfirmPurchaseEntryDetail {
  preGoodsId: number;
  prodsId: number;
  batchNo: string;
  expiryDate: string;
  qty: number;
  pack: number;
  freeQty: number;
  freePack: number;
  taxOnFree: number;
  cost: number;
  mrp: number;
  unitMrp: number;
  salesPrice: number;
  unitPrice: number;
  disc: number;
  batchDisc: number;
  discPer: number;
  discWithoutTaxPer: number;
  discWithoutTaxAmt: number;
  sgstPer: number;
  cgstPer: number;
  igstPer: number;
  sgstAmt: number;
  cgstAmt: number;
  igstAmt: number;
  tax: number;
  taxAmt: number;
  taxType: number;
  mrpVatAmt: number;
  totalAmt: number;
  netAmt: number;
  poDetId: number;
  hsnCode: string;
}

export interface ConfirmPurchaseEntryRequest {
  orderId: number;
  confirmingUserId: number;
  invoiceNo: string;
  invoiceDate: string;
  dealId: number;
  storeId: number;
  remark: string;
  total: number;
  net: number;
  extraDiscount: number;
  extraCharge: number;
  details: ConfirmPurchaseEntryDetail[];
}

// ==================== Store Interfaces ====================
export interface StoreResponse {
  id: number;
  storeName: string;
  code: string;
}

// ==================== Consumable Way Interfaces ====================
export interface ConsumableWay {
  id: number;
  name: string;
}

// ==================== Active Store Interfaces ====================
export interface ActiveStore {
  id: number;
  storeName: string;
  code: string;
  isStore: number;
}

// ==================== Consumable Order Interfaces ====================
export interface ConsumableDetail {
  id: number;
  waysId: number;
  batchId: number;
  qty: number;
  mrp: number;
  total: number;
  discountAmt: number;
  sgstPer: number;
  cgstPer: number;
  igstPer: number;
}

export interface SaveConsumableRequest {
  id: number;
  storeId: number;
  uid: number;
  consumableDetails: ConsumableDetail[];
}

export interface SaveConsumableResponse {
  id: number;
  message: string;
  success: boolean;
}

export interface ConsumableDetailResponse {
  id: number;
  waysId: number;
  waysName: string;
  batchId: number;
  batchNo: string;
  productName: string;
  qty: number;
  mrp: number;
  total: number;
  discountAmt: number;
  sgstPer: number;
  cgstPer: number;
  igstPer: number;
}

export interface UnapprovedConsumableResponse {
  id: number;
  consumableNo: string;
  storeId: number;
  storeName: string;
  openDateTime: string;
  dateTime: string;
  uid: number;
  userName: string;
  itemCount: number;
  consumableDetails: ConsumableDetailResponse[];
}

export interface PreviousPurchaseResponse {
  strips: number;
  unitPerStrip: number;
  totalPurchase: number;
  freeStrips: number;
  totalFree: number;
  totalUnits: number;
  rate: number;
  mrp: number;
}

// ==================== Consumable Register Interfaces ====================
export interface ConsumableRegisterItem {
  medicineName: string;
  hsnCode: string;
  batchNo: string;
  wayName: string;
  quantity: number;
  unitPrice: number;
  mrp: number;
  tax: number;
}

export interface ConsumableRegisterRecord {
  consumableNo: string;
  openDateTime: string;
  approvedDateTime: string;
  createdUserName: string;
  approvedUserName: string;
  isApproved: number;
  isCancelled: number;
  items: ConsumableRegisterItem[];
}

export interface StockRegisterData {
  genericName: string;
  productId: number;
  medicineName: string;
  medicineCode: string;
  stock: number;
  transferQty: number;
  transferNo: string;
  damageQty: number;
  damageNo: string;
  orderQty: number;
  orderBillNo: string;
  returnQty: number;
  returnNo: string;
  availableStock: number;
}

export interface UpdateConsumableRequest {
  id: number;
  storeId: number;
  uid: number;
  consumableDetails: ConsumableDetail[];
}

export interface ConsumableDetail {
  id: number;
  waysId: number;
  batchId: number;
  qty: number;
  mrp: number;
  total: number;
  discountAmt: number;
  sgstPer: number;
  cgstPer: number;
  igstPer: number;
} 

// ==================== Central Stores API Service ====================
export class CentralStoresApiService {
  private httpClient: HttpClientWrapper;

  constructor() {
    this.httpClient = new HttpClientWrapper();
  }

  // Convenience: fetch products by name for PO
  // public fetchProductsByNameForPO = async (storeId: number, name: string) => {
  //   try {
  //     const path = `v1/central-store/fetchProductsByNameForPO?storeId=${storeId}&name=${encodeURIComponent(name)}`;
  //     const resp = await this.httpClient.get(path);
  //     return resp;
  //   } catch (err) {
  //     console.error('CentralStoresApiService.fetchProductsByNameForPO error', err);
  //     throw err;
  //   }
  // };
  
  // ==================== Sub Module APIs ====================

  public getSubModules = async (moduleId: number): Promise<SubModuleResponse[]> => {
    try {
      const response = await this.httpClient.get(`/v1/fetchSubModule/${moduleId}`);
      return response as SubModuleResponse[];
    } catch (error) {
      console.error('Error fetching central stores sub-modules:', error);
      throw error;
    }
  };

  // ==================== Generic Group APIs ====================
  
  public fetchAllGenericGroups = async (): Promise<GenericGroupResponse[]> => {
    try {
      const response = await this.httpClient.get('v1/central-store/fetchAllGenericGroups');
      return response as GenericGroupResponse[];
    } catch (error) {
      console.error('Error fetching generic groups:', error);
      throw error;
    }
  };

  public saveGenericGroup = async (data: SaveGenericGroupRequest): Promise<any> => {
    try {
      const response = await this.httpClient.post('v1/central-store/saveGenericGroup', data);
      return response;
    } catch (error) {
      console.error('Error saving generic group:', error);
      throw error;
    }
  };

  public updateGenericGroup = async (id: number, data: UpdateGenericGroupRequest): Promise<any> => {
    try {
      const response = await this.httpClient.put(`v1/central-store/updateGenericGroup/${id}`, data);
      return response;
    } catch (error) {
      console.error('Error updating generic group:', error);
      throw error;
    }
  };

  public blockGenericGroup = async (data: BlockGenericGroupRequest): Promise<any> => {
    try {
      const response = await this.httpClient.post('v1/central-store/blockGenericGroup', data);
      return response;
    } catch (error) {
      console.error('Error blocking generic group:', error);
      throw error;
    }
  };

  public unblockGenericGroup = async (data: UnblockGenericGroupRequest): Promise<any> => {
    try {
      const response = await this.httpClient.post('v1/central-store/unblockGenericGroup', data);
      return response;
    } catch (error) {
      console.error('Error unblocking generic group:', error);
      throw error;
    }
  };

  // ==================== Sub Generic Group APIs ====================
  
  public fetchAllSubGenerics = async (): Promise<SubGenericGroupResponse[]> => {
    try {
      const response = await this.httpClient.get('v1/central-store/fetchAllSubGenerics');
      return response as SubGenericGroupResponse[];
    } catch (error) {
      console.error('Error fetching sub generic groups:', error);
      throw error;
    }
  };

  public saveSubGeneric = async (data: SaveSubGenericRequest): Promise<any> => {
    try {
      const response = await this.httpClient.post('v1/central-store/saveSubGeneric', data);
      return response;
    } catch (error) {
      console.error('Error saving sub generic group:', error);
      throw error;
    }
  };

  public updateSubGeneric = async (id: number, data: UpdateSubGenericRequest): Promise<any> => {
    try {
      const response = await this.httpClient.put(`v1/central-store/updateSubGeneric/${id}`, data);
      return response;
    } catch (error) {
      console.error('Error updating sub generic group:', error);
      throw error;
    }
  };

  // ==================== Generic Details APIs ====================
  
  public fetchAllGenerics = async (): Promise<GenericDetailsResponse[]> => {
    try {
      const response = await this.httpClient.get('v1/central-store/fetchAllGenerics');
      return response as GenericDetailsResponse[];
    } catch (error) {
      console.error('Error fetching generics:', error);
      throw error;
    }
  };

  public saveGeneric = async (data: SaveGenericRequest): Promise<any> => {
    try {
      const response = await this.httpClient.post('v1/central-store/saveGeneric', data);
      return response;
    } catch (error) {
      console.error('Error saving generic:', error);
      throw error;
    }
  };

  public updateGeneric = async (id: number, data: UpdateGenericRequest): Promise<any> => {
    try {
      const response = await this.httpClient.put(`v1/central-store/updateGeneric/${id}`, data);
      return response;
    } catch (error) {
      console.error('Error updating generic:', error);
      throw error;
    }
  };
  
  // ==================== Generic Details APIs ====================
  // TODO: Add Generic Details API methods here
  
  // ==================== Medicine Item APIs ====================
  // Products (Medicine Items)
  public fetchAllProducts = async (phModId: number = 1): Promise<ProductResponse[]> => {
    try {
      const response = await this.httpClient.get(`v1/central-store/fetchAllProducts/${phModId}`);
      return response as ProductResponse[];
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  };

  public fetchBatchDetailsByProdsId = async (prodsId: number, storeId: number): Promise<BatchDetail[]> => {
    try {
      const response = await this.httpClient.get(`v1/cash-counter/fetchBatchDetailsByProdsId?prodsId=${prodsId}&storeId=${storeId}`);
      return response as BatchDetail[];
    } catch (error) {
      console.error('Error fetching batch details:', error);
      throw error;
    }
  };

  public fetchAvailableStock = async (batchId: number, storeId: number): Promise<number> => {
    try {
      const response = await this.httpClient.get(`v1/central-store/availableStock?batchId=${batchId}&storeId=${storeId}`);
      return response as number;
    } catch (error) {
      console.error('Error fetching available stock:', error);
      throw error;
    }
  };

  public fetchExpiryDetailsProducts = async (period: number, periodType: string, storeId: number, phModId: number): Promise<ExpiryDetailsProduct[]> => {
    const response = await this.httpClient.get(
      `v1/central-store/fetchExpiryDetailsProducts?period=${period}&periodType=${encodeURIComponent(periodType)}&storeId=${storeId}&phModId=${phModId}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? data as ExpiryDetailsProduct[] : [];
  };

  public fetchProductsForPurchaseOrder = async (data: FetchProductsForPurchaseOrderRequest): Promise<PurchaseOrderProductResponse[]> => {
    try {
      const response = await this.httpClient.get(`v1/central-store/fetchProductsForPurchaseOrder?filterType=${data.filterType}&vendorId=${data.vendorId}&phModId=${data.phModId}`);
      return response as PurchaseOrderProductResponse[];
    } catch (error) {
      console.error('Error fetching products for purchase order:', error);
      throw error;
    }
  };

  public fetchProductsForPO = async (storeId: number, name: string): Promise<FetchProductsForPOResponse[]> => {
    const response = await this.httpClient.get(
      `v1/central-store/fetchProductsByNameForPO?storeId=${encodeURIComponent(String(storeId))}&name=${encodeURIComponent(name)}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? (data as FetchProductsForPOResponse[]) : [];
  };
  
  public saveProduct = async (data: SaveProductRequest): Promise<any> => {
    try {
      const response = await this.httpClient.post('v1/central-store/saveProduct', data);
      return response;
    } catch (error) {
      console.error('Error saving product:', error);
      throw error;
    }
  };

  public updateProduct = async (id: number, data: UpdateProductRequest): Promise<any> => {
    try {
      const response = await this.httpClient.put(`v1/central-store/updateProduct/${id}`, data);
      return response;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };
  
  // ==================== Manufacturer APIs ====================
  
  public fetchAllManufacturers = async (): Promise<DealerResponse[]> => {
    try {
      const response = await this.httpClient.get('v1/central-store/fetchAllDealers');
      return response as DealerResponse[];
    } catch (error) {
      console.error('Error fetching dealers/manufacturers:', error);
      throw error;
    }
  };
  
  public fetchAllCompanies = async (): Promise<CompanyResponse[]> => {
    try {
      const response = await this.httpClient.get('v1/central-store/fetchAllCompanies');
      return response as CompanyResponse[];
    } catch (error) {
      console.error('Error fetching companies:', error);
      throw error;
    }
  };

  public fetchCompaniesByStoreId = async (storeId: number): Promise<CompanyResponse[]> => {
    try {
      const response = await this.httpClient.get(`v1/central-store/fetchCompaniesByStoreId/${storeId}`);
      return response as CompanyResponse[];
    } catch (error) {
      console.error('Error fetching companies by store ID:', error);
      throw error;
    }
  };

  public fetchDealersByStoreId = async (storeId: number): Promise<DealerResponse[]> => {
    try {
      const response = await this.httpClient.get(`v1/central-store/fetchDealersByStoreId/${storeId}`);
      return response as DealerResponse[];
    } catch (error) {
      console.error('Error fetching dealers by store ID:', error);
      throw error;
    }
  };

  public saveDealer = async (data: SaveDealerRequest): Promise<any> => {
    try {
      const response = await this.httpClient.post('v1/central-store/saveDealer', data);
      return response;
    } catch (error) {
      console.error('Error saving dealer/manufacturer:', error);
      throw error;
    }
  };

  public saveCompany = async (data: SaveCompanyRequest): Promise<any> => {
    try {
      const response = await this.httpClient.post('v1/central-store/saveCompany', data);
      return response;
    } catch (error) {
      console.error('Error saving company:', error);
      throw error;
    }
  };

  public updateDealer = async (id: number, data: UpdateDealerRequest): Promise<any> => {
    try {
      const response = await this.httpClient.put(`v1/central-store/updateDealer/${id}`, data);
      return response;
    } catch (error) {
      console.error('Error updating dealer/manufacturer:', error);
      throw error;
    }
  };

  public updateCompany = async (id: number, data: UpdateCompanyRequest): Promise<any> => {
    try {
      const response = await this.httpClient.put(`v1/central-store/updateCompany/${id}`, data);
      return response;
    } catch (error) {
      console.error('Error updating dealer/manufacturer:', error);
      throw error;
    }
  };
  
  // ==================== Batch APIs ====================
  
  public fetchAllBatches = async (prodsId: number): Promise<BatchResponse[]> => {
    try {
      const url = `v1/central-store/fetchAllBatches?prodsId=${prodsId}`;
      console.log('Fetching batches - URL:', url, 'prodsId:', prodsId);
      const response = await this.httpClient.get(url);
      console.log('Batches API response:', response);
      return response as BatchResponse[];
    } catch (error) {
      console.error('Error fetching batches:', error);
      throw error;
    }
  };

  public saveBatch = async (data: SaveBatchRequest): Promise<any> => {
    try {
      const response = await this.httpClient.post('v1/central-store/saveBatch', data);
      return response;
    } catch (error) {
      console.error('Error saving batch:', error);
      throw error;
    }
  };

  public updateBatch = async (id: number, data: SaveBatchRequest): Promise<any> => {
    try {
      const response = await this.httpClient.put(`v1/central-store/updateBatch/${id}`, data);
      return response;
    } catch (error) {
      console.error('Error updating batch:', error);
      throw error;
    }
  };

  // ==================== Purchase Order APIs ====================
  public savePurchaseOrder = async (data: SavePurchaseOrderRequest): Promise<any> => {
    try {
      const response = await this.httpClient.post('v1/central-store/savePurchaseOrder', data);
      return response;
    } catch (error) {
      console.error('Error saving purchase order:', error);
      throw error;
    }
  };

  public savePurchaseOrderList = async (data: SavePurchaseOrderListRequest): Promise<any> => {
    try {
      const response = await this.httpClient.post('v1/central-store/savePurchaseOrderList', data);
      return response;
    } catch (error) {
      console.error('Error saving purchase order list:', error);
      throw error;
    }
  };

  public fetchAllPurchaseOrders = async (): Promise<PurchaseOrderResponse[]> => {
    try {
      const response = await this.httpClient.get('v1/central-store/fetchAllPurchaseOrders');
      return response as PurchaseOrderResponse[];
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
      throw error;
    }
  };

  public fetchPurchaseOrdersForApproval = async (storeId: number): Promise<PurchaseOrderResponse[]> => {
    try {
      const response = await this.httpClient.get(`v1/central-store/fetchPurchaseOrdersForApproval?storeId=${storeId}`);
      return response as PurchaseOrderResponse[];
    } catch (error) {
      console.error('Error fetching purchase orders for approval:', error);
      throw error;
    }
  };

  public fetchPreGoodsReceiptByOrderId = async (orderId: number): Promise<PreGoodsReceiptResponse[]> => {
    try {
      const response = await this.httpClient.get(`v1/central-store/fetchPreGoodsReceiptByOrderId/${orderId}`);
      return response as PreGoodsReceiptResponse[];
    } catch (error) {
      console.error('Error fetching pre goods receipt by order ID:', error);
      throw error;
    }
  };

  public updatePurchaseOrder = async (id: number, data: SavePurchaseOrderRequest): Promise<any> => {
    try {
      const response = await this.httpClient.put(`v1/central-store/updatePurchaseOrder/${id}`, data);
      return response;
    } catch (error) {
      console.error('Error updating purchase order:', error);
      throw error;
    }
  };

  public approvePurchaseOrder = async (data: { orderId: number; approvedUid: number }): Promise<any> => {
    try {
      const response = await this.httpClient.put('v1/central-store/approvePurchaseOrder', data);
      return response;
    } catch (error) {
      console.error('Error approving purchase order:', error);
      throw error;
    }
  };

  public closePurchaseOrder = async (data: { orderId: number; closedUid: number }): Promise<any> => {
    try {
      const response = await this.httpClient.put('v1/central-store/closePurchaseOrder', data);
      return response;
    } catch (error) {
      console.error('Error closing purchase order:', error);
      throw error;
    }
  };

  public savePurchaseEntry = async (storeId: number, data: SavePurchaseEntryDetail[]): Promise<any> => {
    try {
      const response = await this.httpClient.post(`v1/central-store/savePurchaseEntry`, data);
      return response;
    } catch (error) {
      console.error('Error saving purchase entry:', error);
      throw error;
    }
  };

  public confirmPurchaseEntry = async (data: ConfirmPurchaseEntryRequest): Promise<any> => {
    try {
      // Send storeId in both query parameter and request body for backend compatibility
      const response = await this.httpClient.post(`v1/central-store/confirmPurchaseEntry`, data);
      return response;
    } catch (error) {
      console.error('Error confirming purchase entry:', error);
      throw error;
    }
  };
  
  // ==================== Store Transfer APIs ====================
  public fetchStoresByGroupStoreId = async (groupStoreId: number): Promise<StoreResponse[]> => {
    try {
      const response = await this.httpClient.get(`v1/central-store/fetchStoresByGroupStoreId/${groupStoreId}`);
      return response as StoreResponse[];
    } catch (error) {
      console.error('Error fetching stores by group store ID:', error);
      throw error;
    }
  };

  public createTransferOrder = async (data: CreateTransferOrderRequest): Promise<any> => {
    try {
      const response = await this.httpClient.post('v1/central-store/createTransferOrder', data);
      return response;
    } catch (error) {
      console.error('Error creating transfer order:', error);
      throw error;
    }
  };

  public fetchAllUnapprovedTransferOrders = async (storeIdFrom: number): Promise<any[]> => {
    try {
      const response = await this.httpClient.get(`v1/central-store/fetchAllUnapprovedTransferOrders/${storeIdFrom}`);
      return response as any[];
    } catch (error) {
      console.error('Error fetching unapproved transfer orders:', error);
      throw error;
    }
  };

  public fetchAllApprovedTransferOrders = async (storeIdFrom: number): Promise<any[]> => {
    try {
      const response = await this.httpClient.get(`v1/central-store/fetchAllApprovedTransferOrders/${storeIdFrom}`);
      return response as any[];
    } catch (error) {
      console.error('Error fetching approved transfer orders:', error);
      throw error;
    }
  };

  public fetchTransferDetailsById = async (id: number): Promise<any> => {
    try {
      const response = await this.httpClient.get(`v1/central-store/fetchTransferDetailsById/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching transfer details:', error);
      throw error;
    }
  };

  public fetchPoProductStatus = async (prodsId: number): Promise<any> => {
    try {
      const response = await this.httpClient.get(`v1/central-store/fetchPoProductStatus?prodsId=${prodsId}`);
      return response;
    } catch (error) {
      console.error('Error fetching PO product status:', error);
      throw error;
    }
  };

  public approveTransferOrder = async (transferId: number, uid: number): Promise<any> => {
    try {
      const response = await this.httpClient.put('v1/central-store/approveTransferOrder', { 
        transferId, 
        uid 
      });
      return response;
    } catch (error) {
      console.error('Error approving transfer order:', error);
      throw error;
    }
  };

  public updateTransferOrder = async (
    transferId: number, 
    storeIdFrom: number, 
    storeIdTo: number, 
    details: Array<{ productId: number; batchId: number; quantity: number }>
  ): Promise<any> => {
    try {
      const response = await this.httpClient.put(
        `v1/central-store/updateTransferOrder/${transferId}`, 
        { 
          storeIdFrom, 
          storeIdTo, 
          details 
        }
      );
      return response;
    } catch (error) {
      console.error('Error updating transfer order:', error);
      throw error;
    }
  };

  public cancelTransferOrder = async (
    transferId: number, 
  ): Promise<any> => {
    try {
      const response = await this.httpClient.put(
        `v1/central-store/cancelTransfer/${transferId}`,
      );
      return response;
    } catch (error) {
      console.error('Error canceling transfer order:', error);
      throw error;
    }
  };

  // ==================== Consumable Way APIs ====================
  
  public fetchAllConsumableWays = async (): Promise<ConsumableWay[]> => {
    try {
      const response = await this.httpClient.get('v1/central-store/fetchAllConsumableWays');
      return response as ConsumableWay[];
    } catch (error) {
      console.error('Error fetching consumable ways:', error);
      throw error;
    }
  };

  public saveConsumable = async (data: SaveConsumableRequest): Promise<any> => {
    try {
      const response = await this.httpClient.post('v1/central-store/saveConsumable', data);
      return response;
    } catch (error) {
      console.error('Error saving consumable order:', error);
      throw error;
    }
  };

  public fetchAllUnapprovedConsumables = async (storeId: number): Promise<UnapprovedConsumableResponse[]> => {
    try {
      const response = await this.httpClient.get(`v1/central-store/fetchAllUnapprovedConsumables/${storeId}`);
      return response as UnapprovedConsumableResponse[];
    } catch (error) {
      console.error('Error fetching unapproved consumables:', error);
      throw error;
    }
  };

  public fetchConsumableById = async (id: number): Promise<UnapprovedConsumableResponse> => {
    try {
      const response = await this.httpClient.get(`v1/central-store/fetchConsumableById/${id}`);
      return response as UnapprovedConsumableResponse;
    } catch (error) {
      console.error('Error fetching consumable by ID:', error);
      throw error;
    }
  };

  public approveConsumable = async (consumableId: number, uid: number): Promise<any> => {
    try {
      const response = await this.httpClient.put('v1/central-store/approveConsumable', { consumableId, uid });
      return response;
    } catch (error) {
      console.error('Error approving consumable:', error);
      throw error;
    }
  };

  public fetchConsumableRegister = async (
    storeId: number,
    fromDate: string,
    toDate: string
  ): Promise<ConsumableRegisterRecord[]> => {
    try {
      const response = await this.httpClient.get(
        `v1/central-store/fetchConsumableRegister?storeId=${storeId}&fromDate=${fromDate}&toDate=${toDate}`
      );
      return response as ConsumableRegisterRecord[];
    } catch (error) {
      console.error('Error fetching consumable register:', error);
      throw error;
    }
  };

  public updateConsumable = async (id: number, data: UpdateConsumableRequest): Promise<any> => {
    try {
      const response = await this.httpClient.put(`v1/central-store/updateConsumable/${id}`, data);
      return response;
    } catch (error) {
      console.error('Error updating consumable:', error);
      throw error;
    }
  };
  
  public cancelConsumableOrder = async (
    consumableId: number, 
  ): Promise<any> => {
    try {
      const response = await this.httpClient.put(
        `v1/central-store/cancelConsumable/${consumableId}`,
      );
      return response;
    } catch (error) {
      console.error('Error canceling consumable order:', error);
      throw error;
    }
  };

  // ==================== Goods Receipt APIs ====================
  
  public fetchGoodsReceiptDetailsBySupplier = async (
    dealId: number,
    dateFrom: string,
    dateTo: string,
    storeId: number
  ): Promise<GoodsReceiptDetailsResponse[]> => {
    try {
      const response = await this.httpClient.get(
        `v1/central-store/fetchGoodsReceiptDetailsBySupplier?dealId=${dealId}&dateFrom=${dateFrom}&dateTo=${dateTo}&storeId=${storeId}`
      );
      return response as GoodsReceiptDetailsResponse[];
    } catch (error) {
      console.error('Error fetching goods receipt details by supplier:', error);
      throw error;
    }
  };

  public savePurchaseReturn = async (data: SavePurchaseReturnRequest): Promise<any> => {
    try {
      const response = await this.httpClient.post('v1/central-store/savePurchaseReturn', data);
      return response;
    } catch (error) {
      console.error('Error saving purchase return:', error);
      throw error;
    }
  };

  // ==================== Medicine Transaction API ====================
  public fetchMedicineTransactions = async (
    prodsId: number,
    storeId: number,
    fromDate: string,
    toDate: string
  ): Promise<MedicineTransactionRecord[]> => {
    try {
      const response = await this.httpClient.get(
        `v1/central-store/fetchMedicineTransactions?prodsId=${prodsId}&storeId=${storeId}&fromDate=${fromDate}&toDate=${toDate}`
      );
      return response as MedicineTransactionRecord[];
    } catch (error) {
      console.error('Error fetching medicine transactions:', error);
      throw error;
    }
  };

  // ==================== Goods Return Register API ====================
  public fetchGoodsReturnRegister = async (
    storeId: number,
    fromDate: string,
    toDate: string
  ): Promise<GoodsReturnRegisterRecord[]> => {
    try {
      const response = await this.httpClient.get(
        `v1/central-store/fetchGoodsReturnRegister?storeId=${storeId}&fromDate=${fromDate}&toDate=${toDate}`
      );
      return response as GoodsReturnRegisterRecord[];
    } catch (error) {
      console.error('Error fetching goods return register:', error);
      throw error;
    }
  };

  // ==================== Goods Receipt Register API ====================
  public fetchGoodsReceiptRegister = async (
    storeId: number,
    fromDate: string,
    toDate: string,
    grNo?: string
  ): Promise<GoodsReceiptRegisterRecord[]> => {
    try {
      let url = `v1/central-store/fetchGoodsReceiptRegister?storeId=${storeId}&fromDate=${fromDate}&toDate=${toDate}`;
      if (grNo) {
        url += `&grNo=${encodeURIComponent(grNo)}`;
      }
      const response = await this.httpClient.get(url);
      return response as GoodsReceiptRegisterRecord[];
    } catch (error) {
      console.error('Error fetching goods receipt register:', error);
      throw error;
    }
  };
  // ==================== Supplier Wise Purchase Total API ====================
  public fetchSupplierwisePurchaseTotal = async (
    storeId: number,
    year: number,
    month: number
  ): Promise<SupplierwisePurchaseTotalRecord[]> => {
    try {
      const response = await this.httpClient.get(
        `v1/central-store/fetchSupplierwisePurchaseTotal?storeId=${storeId}&year=${year}&month=${month}`
      );
      return response as SupplierwisePurchaseTotalRecord[];
    } catch (error) {
      console.error('Error fetching supplierwise purchase total:', error);
      throw error;
    }
  };

  // ==================== Costwise Medicine Details API ====================
  public fetchCostwiseMedicineDetails = async (
    storeId: number,
    name: string
  ): Promise<CostwiseMedicineRecord[]> => {
    try {
      const response = await this.httpClient.get(
        `v1/central-store/fetchCostwiseMedicineDetails?storeId=${storeId}&name=${encodeURIComponent(name)}`
      );
      return response as CostwiseMedicineRecord[];
    } catch (error) {
      console.error('Error fetching costwise medicine details:', error);
      throw error;
    }
  };

  // ==================== Initial Stock APIs ====================
  public fetchProductsNameLike = async (storeId: number, name: string): Promise<ProductNameLikeResponse[]> => {
    try {
      const response = await this.httpClient.get(`v1/central-store/fetchProductsNameLike?storeId=${storeId}&name=${name}`);
      return response as ProductNameLikeResponse[];
    } catch (error) {
      console.error('Error fetching products by name:', error);
      throw error;
    }
  };

  public fetchProductsByNameForPO = async (storeId: number, name: string): Promise<ProductsByNameForPOResponse[]> => {
    try {
      const response = await this.httpClient.get(`v1/central-store/fetchProductsByNameForPO?storeId=${storeId}&name=${name}`);
      return response as ProductsByNameForPOResponse[];
    } catch (error) {
      console.error('Error fetching products by name for PO:', error);
      throw error;
    }
  };

  public fetchBatchDiscountValue = async (batchNo: string | number): Promise<BatchDiscountValue> => {
    try {
      const response = await this.httpClient.get(`v1/central-store/fetchBatchDiscountValue?batchNo=${encodeURIComponent(String(batchNo))}`);
      return response as BatchDiscountValue;
    } catch (error) {
      console.error('Error fetching batch discount value:', error);
      throw error;
    }
  };

  public stockAdjust = async (payload: Array<{ batchId: number; storeId: number; stockQty: number; action: string }>): Promise<any> => {
    try {
      const response = await this.httpClient.post('v1/central-store/stockAdjust', payload);
      return response;
    } catch (error) {
      console.error('Error adjusting stock:', error);
      throw error;
    }
  };

  public addInitialStock = async (payload: Array<{ batchId: number; storeId: number; stockQty: number; action: string }>): Promise<any> => {
    try {
      const response = await this.httpClient.post('v1/central-store/addInitialStock', payload);
      return response;
    } catch (error) {
      console.error('Error adding initial stock:', error);
      throw error;
    }
  };

  public updateProductMinMax = async (prodsId: number, min: number, max: number): Promise<any> => {
    try {
      const response = await this.httpClient.put(`v1/central-store/updateProductMinMax?prodsId=${prodsId}&min=${min}&max=${max}`, {});
      return response;
    } catch (error) {
      console.error('Error updating product min/max:', error);
      throw error;
    }
  };

  // ==================== Exampted GST Sales APIs ====================
  public fetchExamptedGstSales = async (fromDate: string, toDate: string): Promise<ExamptedSalesRow[]> => {
    const response = await this.httpClient.get(
      `v1/central-store/fetchExamptedGstSales?fromDate=${fromDate}&toDate=${toDate}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? (data as ExamptedSalesRow[]) : [];
  };

  public fetchExamptedGstSummary = async (fromDate: string, toDate: string): Promise<ExamptedSalesSummaryRow[]> => {
    const response = await this.httpClient.get(
      `v1/central-store/fetchExamptedGstSummary?fromDate=${fromDate}&toDate=${toDate}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? (data as ExamptedSalesSummaryRow[]) : [];
  };

  /////////////////stock register APIs////////////////////

  public fetchStockRegister = async (
    storeId: number,
    name: string,
    medCode: string
  ): Promise<StockRegisterData[]> => {
    try {
      const response = await this.httpClient.get(
        `v1/central-store/fetchStockRegister?storeId=${storeId}&name=${encodeURIComponent(name)}&medCode=${encodeURIComponent(medCode)}`
      );
      return response as StockRegisterData[];
    } catch (error) {
      console.error('Error fetching stock register:', error);
      throw error;
    }
  };

  public fetchZeroStockRegister = async (
    storeId: number,
    name: string,
    medCode: string
  ): Promise<StockRegisterData[]> => {
    try {
      const response = await this.httpClient.get(
        `v1/central-store/fetchZeroStockRegister?storeId=${storeId}&name=${encodeURIComponent(name)}&medCode=${encodeURIComponent(medCode)}`
      );
      return response as StockRegisterData[];
    } catch (error) {
      console.error('Error fetching zero stock register:', error);
      throw error;
    }
  };

  public fetchBatchWiseStockByProduct = async (storeId: number, prodId: number): Promise<BatchWiseStockRow[]> => {
    try {
      const response = await this.httpClient.get(`v1/central-store/fetchBatchWiseStockByProduct?storeId=${storeId}&prodId=${prodId}`);
      return response as BatchWiseStockRow[];
    } catch (error) {
      console.error('Error fetching batch wise stock:', error);
      throw error;
    }
  };

  public fetchZeroStockBatchDetailsByProds = async (storeId: number, prodId: number): Promise<BatchWiseStockRow[]> => {
    try {
      const response = await this.httpClient.get(`v1/central-store/fetchZeroStockBatchDetailsByProds?storeId=${storeId}&prodId=${prodId}`);
      return response as BatchWiseStockRow[];
    } catch (error) {
      console.error('Error fetching zero stock batch details:', error);
      throw error;
    }
  };
// ==================== Consolidate GST Sales APIs ====================
  public fetchConsolidateGstSepSales = async (fromDate: string, toDate: string): Promise<ConsolidateGstSepSalesRow[]> => {
    const response = await this.httpClient.get(
      `v1/central-store/fetchConsolidateGstSepSales?fromDate=${fromDate}&toDate=${toDate}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? (data as ConsolidateGstSepSalesRow[]) : [];
  };

  public fetchConsolidateSalesReturn = async (fromDate: string, toDate: string): Promise<ConsolidateSalesReturnRow[]> => {
    const response = await this.httpClient.get(
      `v1/central-store/fetchConsolidateSalesReturn?fromDate=${fromDate}&toDate=${toDate}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? (data as ConsolidateSalesReturnRow[]) : [];
  };

  public fetchConsolidateSepSalesReturn = async (fromDate: string, toDate: string): Promise<ConsolidateSepSalesReturnRow[]> => {
    const response = await this.httpClient.get(
      `v1/central-store/fetchConsolidateSepSalesReturn?fromDate=${fromDate}&toDate=${toDate}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? (data as ConsolidateSepSalesReturnRow[]) : [];
  };

  public fetchConsolidateGstSales = async (fromDate: string, toDate: string): Promise<ConsolidateGstSalesRow[]> => {
    const response = await this.httpClient.get(
      `v1/central-store/fetchConsolidateGstSales?fromDate=${fromDate}&toDate=${toDate}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? (data as ConsolidateGstSalesRow[]) : [];
  };
  
  public fetchAllActiveStores = async (): Promise<ActiveStore[]> => {
    try {
      const response = await this.httpClient.get('v1/central-store/fetchAllActiveStores');
      return response as ActiveStore[];
    } catch (error) {
      console.error('Error fetching active stores:', error);
      throw error;
    }
  };

  public getAvailableStockForProductByStoreId = async (prodsId: number, storeId: number): Promise<number> => {
    try {
      const response = await this.httpClient.get(
        `v1/central-store/getAvailableStockForProductByStoreId?prodsId=${prodsId}&storeId=${storeId}`
      );
      return Number(response ?? 0);
    } catch (error) {
      console.error('Error fetching available stock for product:', error);
      throw error;
    }
  };

  async fetchOnStoreMedicineDetails(medicineName: string, storeId : number): Promise<OnStoreMedicineResponse[]> {
    try {
      const url = `/v1/pharmacy/fetchMedicineWithBatchForEachStore?medicineName=${encodeURIComponent(medicineName)}&storeId=${storeId}`;
      const response: any = await this.httpClient.get(url);
      const data = response?.data || response || [];
      return Array.isArray(data) ? (data as OnStoreMedicineResponse[]) : [];
    } catch (error) {
      console.error('Error fetching on-store medicine details:', error);
      throw error;
    }
  }
  public fetchBillWiseSalesReturn = async (fromDate: string, toDate: string): Promise<BillWiseSalesRow[]> => {
    const response = await this.httpClient.get(
      `v1/central-store/fetchBillWiseSalesReturnGstReport?fromDate=${fromDate}&toDate=${toDate}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? (data as BillWiseSalesRow[]) : [];
  };

  public fetchSalesReturnSummary = async (fromDate: string, toDate: string): Promise<SalesSummaryRow[]> => {
    const response = await this.httpClient.get(
      `v1/central-store/fetchSalesReturnPerWiseSummary?fromDate=${fromDate}&toDate=${toDate}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? (data as SalesSummaryRow[]) : [];
  };
  // ==================== GSTR 3B APIs ====================
  public fetchGstr3bDetails = async (fromDate: string, toDate: string): Promise<Gstr3BResponse> => {
    try {
      const response = await this.httpClient.get(
        `v1/central-store/fetchGstr3bDetails?fromDate=${fromDate}&toDate=${toDate}`
      );
      return response as Gstr3BResponse;
    } catch (error) {
      console.error('Error fetching GSTR 3B details:', error);
      throw error;
    }
  };
  /////////////
  // ==================== Bill Wise Sales (OP Sales GST) APIs ====================
  public fetchBillWiseSales = async (fromDate: string, toDate: string): Promise<BillWiseSalesRow[]> => {
    const response = await this.httpClient.get(
      `v1/central-store/fetchBillWiseSalesGstReport?fromDate=${fromDate}&toDate=${toDate}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? (data as BillWiseSalesRow[]) : [];
  };

  public fetchSalesSummary = async (fromDate: string, toDate: string): Promise<SalesSummaryRow[]> => {
    const response = await this.httpClient.get(
      `v1/central-store/fetchSalesPerWiseSummary?fromDate=${fromDate}&toDate=${toDate}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? (data as SalesSummaryRow[]) : [];
  };

  // TODO: Add other central stores related API methods here
  
  // ==================== HSN Wise Purchase Return ====================
  public fetchHsnWisePurchaseReturn = async (fromDate: string, toDate: string): Promise<HsnWisePurchaseReturnRow[]> => {
    const response = await this.httpClient.get(
      `v1/central-store/fetchHsnWisePurchaseReturn?fromDate=${fromDate}&toDate=${toDate}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? (data as HsnWisePurchaseReturnRow[]) : [];
  };

  // ==================== HSN Wise Purchase ====================
  public fetchHsnWisePurchase = async (fromDate: string, toDate: string): Promise<HsnWisePurchaseRow[]> => {
    const response = await this.httpClient.get(
      `v1/central-store/fetchHsnWisePurchase?fromDate=${fromDate}&toDate=${toDate}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? (data as HsnWisePurchaseRow[]) : [];
  };

  // ==================== HSN Wise Sales Return ====================
  public fetchHsnWiseSalesReturn = async (fromDate: string, toDate: string): Promise<HsnWiseSalesReturnRow[]> => {
    const response = await this.httpClient.get(
      `v1/central-store/fetchHsnWiseSalesReturn?fromDate=${fromDate}&toDate=${toDate}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? (data as HsnWiseSalesReturnRow[]) : [];
  };

  // ==================== HSN Wise Sales ====================
  public fetchHsnWiseSales = async (fromDate: string, toDate: string): Promise<HsnWiseSalesRow[]> => {
    const response = await this.httpClient.get(
      `v1/central-store/fetchHsnWiseSales?fromDate=${fromDate}&toDate=${toDate}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? (data as HsnWiseSalesRow[]) : [];
  };

  // ==================== Annexure 1 (Purchase) ====================
  public fetchAnnexure1 = async (fromDate: string, toDate: string): Promise<Annexure1Row[]> => {
    const response = await this.httpClient.get(
      `v1/central-store/fetchAnnexure1?fromDate=${fromDate}&toDate=${toDate}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? (data as Annexure1Row[]) : [];
  };
  
  // ==================== Transfer Receipt (All Stores) ====================
  public fetchTransferReceipt = async (fromDate: string, toDate: string, storeId :number): Promise<TransferReceiptRow[]> => {
    const response = await this.httpClient.get(
      `v1/central-store/fetchTransferReceiptRegister?fromDate=${fromDate}&toDate=${toDate}&storeId=${storeId}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? (data as TransferReceiptRow[]) : [];
  };

  public fetchTransferReceiptDetails = async (transferId : number): Promise<TransferReceiptDetailsRow[]> => {
    const response = await this.httpClient.get(
      `v1/central-store/fetchTransferReceiptRegisterDetails?transferId=${transferId}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? (data as TransferReceiptDetailsRow[]) : [];
  };
  
  public fetchTransferRegistertDetails = async (storeIdFrom  : number, fromDate: string, toDate: string): Promise<TransferRegisterStoreDetailsRow[]> => {
    const response = await this.httpClient.get(
      `v1/central-store/fetchTransferDetailsRegister?storeIdFrom=${storeIdFrom}&fromDate=${fromDate}&toDate=${toDate}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? (data as TransferRegisterStoreDetailsRow[]) : [];
  };
  
  public fetchPreviousPurchaseDetailById = async (id: number): Promise<PreviousPurchaseResponse> => {
    try {
      const response = await this.httpClient.get(`v1/central-store/PreviousPurchaseDetailsByProdsId?prodsId=${id}`);
      return response as PreviousPurchaseResponse;
    } catch (error) {
      console.error('Error fetching previous purchase details by ID:', error);
      throw error;
    }
  };
}

export default CentralStoresApiService;

// ==================== GSTR 3B Interfaces ====================
export interface Gstr3BOutwardTaxable {
  taxable: number;
  cgstAmt: number;
  sgstAmt: number;
  igstAmt: number;
}

export interface Gstr3BItcOthers {
  taxable: number;
  cgstAmt: number;
  sgstAmt: number;
  igstAmt: number;
}

export interface Gstr3BItcNonEligible {
  taxable: number;
  cgstAmt: number;
  sgstAmt: number;
  igstAmt: number;
}

export interface Gstr3BPerWiseSummary {
  taxable: number;
  cgstAmt: number;
  sgstAmt: number;
  igstAmt: number;
  totalTaxPer: number;
}

export interface Gstr3BResponse {
  outwardTaxableSupplies: Gstr3BOutwardTaxable;
  outwardNil: number;
  itcOthers: Gstr3BItcOthers;
  itcNonEligible: Gstr3BItcNonEligible;
  perWiseSummary: Gstr3BPerWiseSummary[];
  salesReturn: salesReturn[];
}

// ==================== Exampted GST Sales Interfaces ====================
export interface ExamptedSalesRow {
  consumableNo: string;
  openDate: string;
  issType: string;
  wardName: string;
  taxable: number;
}

export interface ExamptedSalesSummaryRow {
  salesHead: string;
  exempt: string;
  taxableValue: number;
}

export interface salesReturn {
  salesHead: string;
  taxtype: number;
  taxableValue: number;
  cgstAmt: number;
  sgstAmt: number;
  igstAmt: number;
}
// ==================== Consolidate GST Separate Sales Interfaces ====================
export interface ConsolidateGstSepSalesRow {
  billDate: string;
  startIp: string;
  endIp: string;
  ipCount: number;
  startOp: string;
  endOp: string;
  opCount: number;
  taxable0: number;
  tax0: number;
  taxable5: number;
  tax5: number;
  taxable12?: number;
  tax12?: number;
  taxable18: number;
  tax18: number;
  totalAmount: number;
  roundOff: number;
}

// ==================== Consolidate Sales Return Interfaces ====================
export interface ConsolidateSalesReturnRow {
  billDate: string;
  startBill: string;
  endBill: string;
  totalBills: number;
  taxable0: number;
  tax0: number;
  taxable5: number;
  tax5: number;
  taxable12?: number;
  tax12?: number;
  taxable18: number;
  tax18: number;
  totalAmount: number;
  roundOff?: number;
}

// ==================== Consolidate Sep Sales Return Interfaces ====================
export interface ConsolidateSepSalesReturnRow {
  billDate: string;
  startIp: string;
  endIp: string;
  ipCount: number;
  startOp: string;
  endOp: string;
  opCount: number;
  totalBills: number;
  taxable0: number;
  tax0: number;
  taxable5: number;
  tax5: number;
  taxable12?: number;
  tax12?: number;
  taxable18: number;
  tax18: number;
  totalAmount: number;
  roundOff?: number;
}

// ==================== Consolidate GST Sales Interfaces ====================
export interface ConsolidateGstSalesRow {
  billDate: string;
  startBill: string;
  endBill: string;
  totalBills: number;
  taxable0: number;
  tax0: number;
  taxable5: number;
  tax5: number;
  taxable12?: number;
  tax12?: number;
  taxable18: number;
  tax18: number;
  taxable28?: number;
  tax28?: number;
  totalAmount: number;
  roundOff: number;
}
// ==================== HSN Wise Purchase Return Interfaces ====================
export interface HsnWisePurchaseReturnRow {
  goods: string;
  hsnCode: string;
  quantity: number;
  acceptedRate: number;
}

// ==================== HSN Wise Purchase Interfaces ====================
export interface HsnWisePurchaseRow {
  name: string;
  hsnCode?: string;
  totalQty: number;
  unitPrice: number;
  disc: number;
  free: number;
  total: number;
  tax: number;
  taxAmt: number;
  netAmt: number;
}

// ==================== HSN Wise Sales Return Interfaces ====================
export interface HsnWiseSalesReturnRow {
  product: string;
  hsnCode?: string;
  unit: number;
  mrp: number;
  netAmt: number;
  tax: number;
  taxAmt: number;
  total: number;
}

// ==================== HSN Wise Sales Interfaces ====================
export interface HsnWiseSalesRow {
  product: string;
  hsnCode?: string;
  unit: number;
  netPrice: number;
  netAmt: number;
  tax: number;
  taxAmt: number;
  total: number;
}

// ==================== Annexure 1 (Purchase) Interfaces ====================
export interface Annexure1Row {
  seller: string;
  tin: string;
  cmmCode: string;
  invNo: string;
  invDate: string;
  totalAmt: number;
  taxRate: number;
  category: string;
  gstPaid: number;
}
// ==================== Bill Wise Sales (OP Sales GST) Interfaces ====================
export interface BillWiseSalesRow {
  billId: number;
  patientName: string;
  displayNumber: string;
  billNoDate: string;
  accHead: string;
  concession: string;
  isstype: string;
  taxable: number;
  taxPer: number;
  cgstAmt: number;
  sgstAmt: number;
  igstAmt: number;
  grossAmt: number;
  disc: number;
  netAmt: number;
  gst: number;
}

export interface SalesSummaryRow {
  salesHead: string;
  taxType: number;
  taxableValue: number;
  cgstAmt: number;
  sgstAmt: number;
  igstAmt: number;
}
// ==================== Stock Register Interfaces ====================
export interface StockRegisterRow {
  genericName: string;
  productId: number;
  medicineName: string;
  medicineCode: string;
  stock: number;
  transferQty: number;
  transferNo: string;
  damageQty: number;
  damageNo: string;
  orderQty: number;
  orderBillNo: string;
  returnQty: number;
  returnNo: string;
  availableStock: number;
}

export interface BatchWiseStockRow {
  genericName: string;
  productId: number;
  medicineName: string;
  medicineCode: string;
  stock: number;
  batchNo: string;
  mfgDate: string;
  expiryDate: string;
  mrp: number;
  costPrice: number;
  transferQty: number;
  transferNo: string;
  damageQty: number;
  damageNo: string;
  orderQty: number;
  orderBillNo: string;
  returnQty: number;
  returnNo: string;
  availableStock: number;
}

// ==================== Product (Medicine Item) Interfaces ====================
export interface ProductResponse {
  id: number;
  name: string;
  medCode: string;
  genericId: number;
  companyId: number;
  description: string;
  formId: number;
  strength: number;
  unitsId: number;
  shelf: number;
  rack: string;
  min: number;
  max: number;
  safe: number;
  eoq: number;
  isNonStockable: string;
  ownStock: number;
  isactive: string;
  userlog: string;
  categoryId: number;
  action: string;
  dosageOral: string;
  dosageIm: string;
  dosageIv: string;
  dateTime: string;
  uid: number;
  schedule: number;
  strips: string;
  quantity: number;
  unitId: string;
  looseSale: string;
  groupId: number;
  subDivId: number;
  phModId: number;
  hsnCode: string;
  blockUid: number;
  blockDateTime: string;
  blockReason: string;
}

export interface BatchDetail {
  batchId: number;
  batchNo: string;
  expiryDate: string;
  mrp: number;
  salesPrice: number;
  sgstPer: number;
  cgstPer: number;
  igstPer: number;
  availableStock: number;
  discountPer: number;
}

export interface SaveProductRequest {
  name: string;
  medCode: string;
  genericId: number;
  companyId: number;
  description: string;
  formId: number;
  strength: number;
  unitsId: number;
  shelf: number;
  rack: string;
  min: number;
  max: number;
  safe: number;
  eoq: number;
  isNonStockable: string;
  ownStock: number;
  isactive: string;
  userlog: string;
  categoryId: number;
  action: string;
  dosageOral: string;
  dosageIm: string;
  dosageIv: string;
  schedule: number;
  strips: string;
  quantity: number;
  unitId: string;
  looseSale: string;
  groupId: number;
  subDivId: number;
  phModId: number;
  hsnCode: string;
  blockUid: number;
  blockReason: string;
}

export interface UpdateProductRequest {
  name: string;
  medCode: string;
  genericId: number;
  companyId: number;
  description: string;
  formId: number;
  strength: number;
  unitsId: number;
  shelf: number;
  rack: string;
  min: number;
  max: number;
  safe: number;
  eoq: number;
  isNonStockable: string;
  ownStock: number;
  isactive: string;
  userlog: string;
  categoryId: number;
  action: string;
  dosageOral: string;
  dosageIm: string;
  dosageIv: string;
  schedule: number;
  strips: string;
  quantity: number;
  unitId: string;
  looseSale: string;
  groupId: number;
  subDivId: number;
  phModId: number;
  hsnCode: string;
  blockUid: number;
  blockReason: string;
}

// ==================== Manufacturer/Dealer Interfaces ====================
export interface DealerResponse {
  id: number;
  name: string;
  address: string;
  city: string;
  pin: string;
  phone: string;
  openBalance: number;
  email: string;
  web: string;
  fax: string;
  supclass: string;
  state: string;
  dateTime: string;
  uid: number;
  deliveryTime: string;
  paymentTime: string;
  gstNo: string;
  storeId: number;
  isActive: number;
}

export interface CompanyResponse {
  id: number;
  name: string;
  code: string;
  address: string;
  city: string;
  pin: string;
  phone: string;
  email: string;
  web: string;
  fax: string;
  state: string;
  dateTime: string;
  uid: number;
  storeId: number;
}

export interface SaveDealerRequest {
  name: string;
  address: string;
  city: string;
  pin: string;
  phone: string;
  openBalance: number;
  email: string;
  web: string;
  fax: string;
  supclass: string;
  state: string;
  deliveryTime: string;
  paymentTime: string;
  gstNo: string;
  storeId: number;
  isActive: number;
}

export interface SaveCompanyRequest {
  name: string;
  code: string;
  address: string;
  city: string;
  pin: string;
  phone: number;
  email: string;
  web: string;
  fax: string;
  state: string;
  storeId: number;
}

export interface UpdateDealerRequest {
  name: string;
  address: string;
  city: string;
  pin: string;
  phone: string;
  openBalance: number;
  email: string;
  web: string;
  fax: string;
  supclass: string;
  state: string;
  deliveryTime: string;
  paymentTime: string;
  gstNo: string;
  storeId: number;
  isActive?: number;
}

export interface UpdateCompanyRequest {
  name: string;
  code: string;
  address: string;
  city: string;
  pin: string;
  phone: number;
  email: string;
  web: string;
  fax: string;
  state: string;
  storeId: number;
}

// Alias for backward compatibility
export type ManufacturerResponse = DealerResponse;

// ==================== Batch Interfaces ====================
export interface BatchResponse {
  id: number;
  batchNo: string;
  prodsId: number;
  productName: string;
  mfgDate: string;
  expiryDate: string;
  dateBatchIn: string;
  isActive: number;
  uid: number;
  cost: number;
  mrp: number;
  disc: number;
  salesPrice: number;
  sgstPer: number;
  cgstPer: number;
  igstPer: number;
}

export interface SaveBatchRequest {
  batchNo: string;
  prodsId: number;
  mfgDate: string;
  expiryDate: string;
  dateBatchIn: string;
  isActive: number;
  userLog: string;
  cost: number;
  mrp: number;
  disc: number;
  salesPrice: number;
  sgstPer: number;
  cgstPer: number;
  igstPer: number;
}

// ==================== Transfer Order Interfaces ====================
export interface TransferOrderDetail {
  productId: number;
  batchId: number;
  quantity: number;
}

export interface CreateTransferOrderRequest {
  storeIdFrom: number;
  storeIdTo: number;
  details: TransferOrderDetail[];
}

export interface TransferOrderResponse {
  id: number;
  storeIdFrom: number;
  storeIdTo: number;
  status: string;
  createdBy: number;
  createdDate: string;
  details: TransferOrderDetail[];
}

// ==================== Goods Receipt Interfaces ====================
// ==================== Goods Receipt Details Interfaces ====================
export interface GoodsReceiptProductDetail {
  prodsName: string;
  genName: string;
  compName: string;
  batchNo: string;
  expDate: string;
  availQty: number;
  receivedQty: number;
  returnedQty: number;
  rate: number;
  batchId: number; // TODO: Backend currently NOT returning this field - needs to be added
}

export interface GoodsReceiptDetailsResponse {
  grId: number;
  grNo: string;
  grDate: string;
  invNo: string;
  invDate: string;
  dealerName: string;
  productDetails: GoodsReceiptProductDetail[];
}

// ==================== Medicine Transaction Interfaces ====================
export interface MedicineTransactionRecord {
  transactionDate: string;
  medicineName: string;
  batchNo: string;
  storeName: string;
  transactionType: string;
  transactionNumber: string;
  transactionName: string;
  stockIn: number;
  stockOut: number;
  stockNowBatch: number;
  stockNowProd: number;
  userName: string;
  note: string;
}

// ==================== Goods Return Register Interfaces ====================
export interface GoodsReturnRegisterMedicine {
  medicineName: string;
  hsnCode: string;
  batchNo: string;
  quantity: number;
  freeReturn: number;
  acceptedRate: number;
  mrp: number;
}

export interface GoodsReturnRegisterRecord {
  returnNo: string;
  supplierName: string;
  supplierAddress: string;
  total: number;
  debitedAmt: number;
  amtPayable: number;
  retAmt: number;
  returnDate: string;
  userName: string;
  isConfirmed: number;
  isDebited: number;
  isApproved: number;
  isCancelled: number;
  medicines: GoodsReturnRegisterMedicine[];
}

// ==================== Purchase Return Interfaces ====================
export interface PurchaseReturnDetail {
  batchId: number;
  quantity: number;
  acceptedRate: number;
  remark: string;
  freeReturn: number;
}

export interface SavePurchaseReturnRequest {
  dealId: number;
  storeId: number;
  grnBillId: number;
  details: PurchaseReturnDetail[];
}

// ==================== Initial Stock Interfaces ====================
export interface ProductNameLikeResponse {
  prodsId: number;
  medicineName: string;
  medCode: string;
  genericId: number;
  min: number;
  max: number;
  isActive: string;
  storeId: number;
  hsnCode: string;
}

export interface ProductsByNameForPOResponse {
  prodsId: number;
  medicineName: string;
  medCode: string;
  genericId: number;
  genericName: string;
  min: number;
  max: number;
  isActive: number;
  storeId: number;
  hsnCode: string;
  currentStoreStock: number;
  totalAvailableStock: number;
  packSize: number;
}

export interface ExpiryDetailsProduct {
  productName: string;
  batchNo: string;
  expiryDate: string;
  stock: number;
}

export interface BatchDiscountValue {
  discountOnMrp: number;
}

export interface OnStoreMedicineResponse {
  prodsId: number;
  productName: string;
  genericName: string;
  batches: OnStoreMedicineDetailsResponse[];
}

export interface OnStoreMedicineDetailsResponse {
  batchId: number;
  batchNo: string;
  expiryDate: string;
  mrp: number;
  costPrice: number;
  currentStock: number;
  availableStock: number;
}

export interface TransferReceiptRow {
  id: number;
  trNo: string;
  dateReceive: string;
  userName: string;
  storeName: string;
}

export interface TransferReceiptDetailsRow {
  name: string;
  batchNo: string;
  quantity: number;
  mrp: number;
  mfgDate: string;
  expiryDate: string;
}

export interface TransferRegisterStoreDetailsRow {
  toStoreId: number;
  toStoreName: string;
  transfers: TransferRegisterRow[];
}

export interface TransferRegisterRow {
  id: number;
  transferNo: string;
  dateTimeApprove: string;
  userName: string;
  fromStoreName: string;
  details: TransferDetailsRow[];
}

export interface TransferDetailsRow {
  productId: number;
  batchId: number;
  quantity: number;
  medicineName: string;
  batchNo: string;
  expiryDate: string;
  mrp: number;
  salesPrice: number;
}