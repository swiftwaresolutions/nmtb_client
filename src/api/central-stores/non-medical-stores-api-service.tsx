import HttpClientWrapper from '../http-client-wrapper';

// ==================== Product-Procedure Mapping Interfaces ====================
export interface MaterialMappingResponse {
    id: number;
    prodsId: number;
    groupId: number;
    procId: number;
    quantity?: number;
}

export interface SaveMaterialMappingRequest {
    procId: number;
    groupId: number;
    prodsId: number;
    quantity: number;
}

export interface UpdateMaterialMappingRequest {
    id: number;
    procId: number;
    groupId: number;
    prodsId: number;
    quantity: number;
}

// ==================== Group Interfaces (Non-Medical Store) ====================
export interface GroupResponse {
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

export interface SaveGroupRequest {
    name: string;
    description: string;
    isBlocked: number;
    storeId: number;
    uid: number;
}

export interface UpdateGroupRequest {
    name: string;
    description: string;
    isBlocked: number;
    storeId: number;
    uid: number;
}

export interface BlockGroupRequest {
    id: number;
    blockedUid: number;
}

export interface UnblockGroupRequest {
    id: number;
    uid: number;
}

// ==================== Company Interfaces (Non-Medical Store) ====================
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

export interface SaveCompanyRequest {
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
    storeId: number;
}

export interface UpdateCompanyRequest {
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
    storeId: number;
}

export interface BlockCompanyRequest {
    id: number;
    blockedUid: number;
}

export interface UnblockCompanyRequest {
    id: number;
    uid: number;
}

// ==================== Supplier/Dealer Interfaces (Non-Medical Store) ====================
export interface SupplierResponse {
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
}

export interface SaveSupplierRequest {
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
}

export interface UpdateSupplierRequest {
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
}

export interface BlockSupplierRequest {
    id: number;
    blockedUid: number;
}

export interface UnblockSupplierRequest {
    id: number;
    uid: number;
}

// ==================== Product Interfaces (Non-Medical Store) ====================
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
    isNonStockable: number | string;
    ownStock: number;
    isactive: number | string;
    userlog: string;
    categoryId: number;
    action: string;
    dosageOral: string;
    dosageIm: string;
    dosageIv: string;
    dateTime: string;
    uid: number;
    schedule: number;
    strips: number | string;
    quantity: number;
    unitId: number | string;
    looseSale: number | string;
    groupId: number;
    subDivId: number;
    phModId: number;
    hsnCode: string;
    blockUid: number;
    blockDateTime: string;
    blockReason: string;
    // Additional display fields
    groupName?: string;
    companyName?: string;
    categoryName?: string;
    formName?: string;
    genericName?: string;
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
    isNonStockable: number;
    ownStock: number;
    isactive: number;
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
    looseSale: number;
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
    isNonStockable: number;
    ownStock: number;
    isactive: number;
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
    looseSale: number;
    groupId: number;
    subDivId: number;
    phModId: number;
    hsnCode: string;
    blockUid: number;
    blockReason: string;
}

export interface BlockProductRequest {
    id: number;
    blockedUid: number;
}

export interface UnblockProductRequest {
    id: number;
    uid: number;
}

// ==================== Product Category/Form/Unit Interfaces ====================
export interface ProductCategoryResponse {
    categoryId: number;
    name: string;
    isValid: number;
}

export interface ProductFormResponse {
    formId: number;
    name: string;
    isValid: number;
    categoryId: number;
}

export interface ProductUnitResponse {
    id: number;
    name: string;
    isValid: number;
    typeId: number;
}

// ==================== Batch Interfaces (Non-Medical Store) ====================
export interface BatchResponse {
    id: number;
    batchNo: string;
    productId: number;
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
    storeId: number;
}

export interface SaveBatchRequest {
    batchNo: string;
    productId: number;
    mfgDate: string;
    expiryDate: string;
    dateBatchIn: string;
    isActive: number;
    cost: number;
    mrp: number;
    disc: number;
    salesPrice: number;
    sgstPer: number;
    cgstPer: number;
    igstPer: number;
    storeId: number;
}

export interface UpdateBatchRequest {
    batchNo: string;
    productId: number;
    mfgDate: string;
    expiryDate: string;
    dateBatchIn: string;
    isActive: number;
    cost: number;
    mrp: number;
    disc: number;
    salesPrice: number;
    sgstPer: number;
    cgstPer: number;
    igstPer: number;
    storeId: number;
}

// ==================== Consumable Cause Interfaces (Non-Medical Store) ====================
export interface ConsumableCauseResponse {
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

export interface SaveConsumableCauseRequest {
    name: string;
    description: string;
    storeId: number;
}

export interface UpdateConsumableCauseRequest {
    name: string;
    description: string;
    storeId: number;
}

export interface BlockConsumableCauseRequest {
    id: number;
    blockedUid: number;
}

export interface UnblockConsumableCauseRequest {
    id: number;
    uid: number;
}

// ==================== Non-Medical Stores API Service ====================
class NonMedicalStoresApiService {
    private httpClient: HttpClientWrapper;

    constructor() {
        this.httpClient = new HttpClientWrapper();
    }

    // ==================== Group APIs ====================

    public fetchGroupsByStoreId = async (storeId: number): Promise<GroupResponse[]> => {
        try {
            const response = await this.httpClient.get(`v1/central-store/fetchGenericGroupsByStoreId/${storeId}`);
            return response as GroupResponse[];
        } catch (error) {
            console.error('Error fetching groups:', error);
            throw error;
        }
    };

    public saveGroup = async (data: SaveGroupRequest): Promise<any> => {
        try {
            const response = await this.httpClient.post('v1/central-store/saveGenericGroup', data);
            return response;
        } catch (error) {
            console.error('Error saving group:', error);
            throw error;
        }
    };

    public updateGroup = async (id: number, data: UpdateGroupRequest): Promise<any> => {
        try {
            const response = await this.httpClient.put(`v1/central-store/updateGenericGroup/${id}`, data);
            return response;
        } catch (error) {
            console.error('Error updating group:', error);
            throw error;
        }
    };

    public blockGroup = async (data: BlockGroupRequest): Promise<any> => {
        try {
            const response = await this.httpClient.post('v1/central-store/blockGroup', data);
            return response;
        } catch (error) {
            console.error('Error blocking group:', error);
            throw error;
        }
    };

    public unblockGroup = async (data: UnblockGroupRequest): Promise<any> => {
        try {
            const response = await this.httpClient.post('v1/central-store/unblockGroup', data);
            return response;
        } catch (error) {
            console.error('Error unblocking group:', error);
            throw error;
        }
    };

    // ==================== Company APIs ====================

    public fetchCompaniesByStoreId = async (storeId: number): Promise<CompanyResponse[]> => {
        try {
            const response = await this.httpClient.get(`v1/central-store/fetchCompaniesByStoreId/${storeId}`);
            return response as CompanyResponse[];
        } catch (error) {
            console.error('Error fetching companies:', error);
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

    public updateCompany = async (id: number, data: UpdateCompanyRequest): Promise<any> => {
        try {
            const response = await this.httpClient.put(`v1/central-store/updateCompany/${id}`, data);
            return response;
        } catch (error) {
            console.error('Error updating company:', error);
            throw error;
        }
    };

    public blockCompany = async (data: BlockCompanyRequest): Promise<any> => {
        try {
            const response = await this.httpClient.post('v1/central-store/blockCompany', data);
            return response;
        } catch (error) {
            console.error('Error blocking company:', error);
            throw error;
        }
    };

    public unblockCompany = async (data: UnblockCompanyRequest): Promise<any> => {
        try {
            const response = await this.httpClient.post('v1/central-store/unblockCompany', data);
            return response;
        } catch (error) {
            console.error('Error unblocking company:', error);
            throw error;
        }
    };

    // ==================== Supplier APIs ====================

    public fetchSuppliersByStoreId = async (storeId: number): Promise<SupplierResponse[]> => {
        try {
            const response = await this.httpClient.get(`v1/central-store/fetchDealersByStoreId/${storeId}`);
            return response as SupplierResponse[];
        } catch (error) {
            console.error('Error fetching suppliers:', error);
            throw error;
        }
    };

    public saveSupplier = async (data: SaveSupplierRequest): Promise<any> => {
        try {
            const response = await this.httpClient.post('v1/central-store/saveDealer', data);
            return response;
        } catch (error) {
            console.error('Error saving supplier:', error);
            throw error;
        }
    };

    public updateSupplier = async (id: number, data: UpdateSupplierRequest): Promise<any> => {
        try {
            const response = await this.httpClient.put(`v1/central-store/updateDealer/${id}`, data);
            return response;
        } catch (error) {
            console.error('Error updating supplier:', error);
            throw error;
        }
    };

    public blockSupplier = async (data: BlockSupplierRequest): Promise<any> => {
        try {
            const response = await this.httpClient.post('v1/central-store/blockDealer', data);
            return response;
        } catch (error) {
            console.error('Error blocking supplier:', error);
            throw error;
        }
    };

    public unblockSupplier = async (data: UnblockSupplierRequest): Promise<any> => {
        try {
            const response = await this.httpClient.post('v1/central-store/unblockDealer', data);
            return response;
        } catch (error) {
            console.error('Error unblocking supplier:', error);
            throw error;
        }
    };

    // ==================== Product APIs ====================

    public fetchAllProducts = async (phModId: number): Promise<ProductResponse[]> => {
        try {
            const response = await this.httpClient.get(`v1/central-store/fetchAllProducts/${phModId}`);
            return response as ProductResponse[];
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    };

    public fetchProductsByStoreId = async (storeId: number): Promise<ProductResponse[]> => {
        try {
            const response = await this.httpClient.get(`v1/central-store/fetchProductsByStoreId/${storeId}`);
            return response as ProductResponse[];
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
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

    public blockProduct = async (data: BlockProductRequest): Promise<any> => {
        try {
            const response = await this.httpClient.post('v1/central-store/blockProduct', data);
            return response;
        } catch (error) {
            console.error('Error blocking product:', error);
            throw error;
        }
    };

    public unblockProduct = async (data: UnblockProductRequest): Promise<any> => {
        try {
            const response = await this.httpClient.post('v1/central-store/unblockProduct', data);
            return response;
        } catch (error) {
            console.error('Error unblocking product:', error);
            throw error;
        }
    };

    // ==================== Product Category/Form/Unit APIs ====================

    public fetchAllProductCategories = async (): Promise<ProductCategoryResponse[]> => {
        try {
            const response = await this.httpClient.get('v1/central-store/fetchAllProductCategories');
            return response as ProductCategoryResponse[];
        } catch (error) {
            console.error('Error fetching product categories:', error);
            throw error;
        }
    };

    public fetchAllProductForms = async (): Promise<ProductFormResponse[]> => {
        try {
            const response = await this.httpClient.get('v1/central-store/fetchAllProductForms');
            return response as ProductFormResponse[];
        } catch (error) {
            console.error('Error fetching product forms:', error);
            throw error;
        }
    };

    public fetchAllProductUnits = async (): Promise<ProductUnitResponse[]> => {
        try {
            const response = await this.httpClient.get('v1/central-store/fetchAllProductUnits');
            return response as ProductUnitResponse[];
        } catch (error) {
            console.error('Error fetching product units:', error);
            throw error;
        }
    };

    // ==================== Batch APIs ====================

    public fetchBatchesByProductId = async (productId: number, storeId: number): Promise<BatchResponse[]> => {
        try {
            const response = await this.httpClient.get(`v1/central-store/fetchBatchesByProductId?productId=${productId}&storeId=${storeId}`);
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

    public updateBatch = async (id: number, data: UpdateBatchRequest): Promise<any> => {
        try {
            const response = await this.httpClient.put(`v1/central-store/updateBatch/${id}`, data);
            return response;
        } catch (error) {
            console.error('Error updating batch:', error);
            throw error;
        }
    };

    // ==================== Consumable Cause APIs ====================

    public fetchConsumableCausesByStoreId = async (storeId: number): Promise<ConsumableCauseResponse[]> => {
        try {
            const response = await this.httpClient.get(`v1/central-store/fetchConsumableCausesByStoreId/${storeId}`);
            return response as ConsumableCauseResponse[];
        } catch (error) {
            console.error('Error fetching consumable causes:', error);
            throw error;
        }
    };

    public saveConsumableCause = async (data: SaveConsumableCauseRequest): Promise<any> => {
        try {
            const response = await this.httpClient.post('v1/central-store/saveConsumableCause', data);
            return response;
        } catch (error) {
            console.error('Error saving consumable cause:', error);
            throw error;
        }
    };

    public updateConsumableCause = async (id: number, data: UpdateConsumableCauseRequest): Promise<any> => {
        try {
            const response = await this.httpClient.put(`v1/central-store/updateConsumableCause/${id}`, data);
            return response;
        } catch (error) {
            console.error('Error updating consumable cause:', error);
            throw error;
        }
    };

    public blockConsumableCause = async (data: BlockConsumableCauseRequest): Promise<any> => {
        try {
            const response = await this.httpClient.post('v1/central-store/blockConsumableCause', data);
            return response;
        } catch (error) {
            console.error('Error blocking consumable cause:', error);
            throw error;
        }
    };

    public unblockConsumableCause = async (data: UnblockConsumableCauseRequest): Promise<any> => {
        try {
            const response = await this.httpClient.post('v1/central-store/unblockConsumableCause', data);
            return response;
        } catch (error) {
            console.error('Error unblocking consumable cause:', error);
            throw error;
        }
    };

    // ==================== Product-Procedure Mapping APIs ====================
    public fetchPhMaterialMappingsByProcId = async (procId: number): Promise<MaterialMappingResponse[]> => {
        try {
            const response = await this.httpClient.get(`v1/central-store/fetchPhMaterialMappingsByProcId/${procId}`);
            return response as MaterialMappingResponse[];
        } catch (error) {
            console.error('Error fetching material mappings:', error);
            throw error;
        }
    };

    public savePhMaterialMappings = async (data: SaveMaterialMappingRequest[]): Promise<any> => {
        try {
            const response = await this.httpClient.post('v1/central-store/savePhMaterialMappings', data);
            return response;
        } catch (error) {
            console.error('Error saving material mappings:', error);
            throw error;
        }
    };

    public updatePhMaterialMappings = async (data: UpdateMaterialMappingRequest[]): Promise<any> => {
        try {
            const response = await this.httpClient.put('v1/central-store/updatePhMaterialMappings', data);
            return response;
        } catch (error) {
            console.error('Error updating material mapping:', error);
            throw error;
        }
    };
}

export default NonMedicalStoresApiService;
