import HttpClientWrapper from "../http-client-wrapper"

export interface ConsultantItem {
    id: number;
    name: string;
    deptId: number;
    isActive: number;
    isCons: number;
    isSenior: number;
    newCharges: number;
    repeatCharges: number;
    renewalDays: number;
    concession: number;
    days: number;
}

export interface DepartmentItem {
    id: number;
    name: string;
    isActive: number;
    newCharges: number;
    repeatCharges: number;
    concession: number;
    days: number;
}

export interface PatientDetailsItem {
    patId: number;
    displayNumber: string;
    name: string;
    secName: string;
    sex: string;
    age: string;
    dob: string;
    phone: string;
    doctorId: number;
    doctorName: string;
    departmentId: number;
    departmentName: string;
    lastVisitId: number;
    lastVisitDate: string;
    dueBalance: number;
    advBalance: number;
}

export class SystemAdminApiService {

    private httpWrapper: HttpClientWrapper;

    constructor() {
        this.httpWrapper = new HttpClientWrapper();
    }

    public fetchAllWards = async () => {
        try {
            let url = '/v1/systemAdmin/fetchAllWards';
            const response: any = await this.httpWrapper.get(url);
            return response;
        } catch (error: any) {
            throw error
        }
    }

    public saveWard = async (payload: any) => {
        try {
            let url = '/v1/systemAdmin/saveWard';
            const response: any = await this.httpWrapper.post(url, payload);
            return response;
        } catch (error: any) {
            throw error
        }
    }

    public updateWard = async (id: number, payload: any) => {
        try {
            let url = `/v1/systemAdmin/updateWard/${id}`;
            const response: any = await this.httpWrapper.put(url, payload);
            return response;
        } catch (error: any) {
            throw error
        }
    }

    public blockWard = async (id: number) => {
        try {
            let url = `/v1/systemAdmin/blockTheWard/${id}`;
            const response: any = await this.httpWrapper.put(url, {});
            return response;
        } catch (error: any) {
            throw error
        }
    }

    public unblockWard = async (id: number) => {
        try {
            let url = `/v1/systemAdmin/unBlockTheWard/${id}`;
            const response: any = await this.httpWrapper.put(url, {});
            return response;
        } catch (error: any) {
            throw error
        }
    }

    // ============================================
    // BANK DETAILS APIs
    // ============================================

    public fetchAllBankDetails = async () => {
        try {
            let url = '/v1/systemAdmin/fetchAllBankDetails';
            const response: any = await this.httpWrapper.get(url);
            return response;
        } catch (error: any) {
            throw error
        }
    }

    public saveBankDetails = async (bankName: string) => {
        try {
            let url = `/v1/systemAdmin/saveBankDetails?bankName=${encodeURIComponent(bankName)}`;
            const response: any = await this.httpWrapper.post(url, {});
            return response;
        } catch (error: any) {
            throw error
        }
    }

    public updateBankDetails = async (id: number, bankName: string) => {
        try {
            let url = `/v1/systemAdmin/updateBankDetails/${id}?bankName=${encodeURIComponent(bankName)}`;
            const response: any = await this.httpWrapper.put(url, {});
            return response;
        } catch (error: any) {
            throw error
        }
    }

    public blockBankDetails = async (id: number) => {
        try {
            let url = `/v1/systemAdmin/blockBankDetails/${id}`;
            const response: any = await this.httpWrapper.put(url, {});
            return response;
        } catch (error: any) {
            throw error
        }
    }

    public unblockBankDetails = async (id: number) => {
        try {
            let url = `/v1/systemAdmin/unblockBankDetails/${id}`;
            const response: any = await this.httpWrapper.put(url, {});
            return response;
        } catch (error: any) {
            throw error
        }
    }

    // ============================================
    // PAYMENT TYPE APIs
    // ============================================

    public fetchAllPaymentTypes = async () => {
        try {
            let url = '/v1/systemAdmin/fetchAllPaymentTypes';
            const response: any = await this.httpWrapper.get(url);
            return response;
        } catch (error: any) {
            throw error
        }
    }

    public savePaymentType = async (paymentType: string) => {
        try {
            let url = `/v1/systemAdmin/savePaymentType?paymentType=${encodeURIComponent(paymentType)}`;
            const response: any = await this.httpWrapper.post(url, {});
            return response;
        } catch (error: any) {
            throw error
        }
    }

    public updatePaymentType = async (id: number, paymentType: string) => {
        try {
            let url = `/v1/systemAdmin/updatePaymentType/${id}?paymentType=${encodeURIComponent(paymentType)}`;
            const response: any = await this.httpWrapper.put(url, {});
            return response;
        } catch (error: any) {
            throw error
        }
    }

    public blockPaymentType = async (id: number) => {
        try {
            let url = `/v1/systemAdmin/blockPaymentType/${id}`;
            const response: any = await this.httpWrapper.put(url, {});
            return response;
        } catch (error: any) {
            throw error
        }
    }

    public unblockPaymentType = async (id: number) => {
        try {
            let url = `/v1/systemAdmin/unblockPaymentType/${id}`;
            const response: any = await this.httpWrapper.put(url, {});
            return response;
        } catch (error: any) {
            throw error
        }
    }

    // ============================================
    // PAYMENT MODE APIs
    // ============================================

    public fetchAllPaymentModes = async () => {
        try {
            let url = '/v1/systemAdmin/fetchAllPaymentModes';
            const response: any = await this.httpWrapper.get(url);
            return response;
        } catch (error: any) {
            throw error
        }
    }

    public savePaymentMode = async (paymentMode: string) => {
        try {
            let url = `/v1/systemAdmin/savePaymentMode?paymentMode=${encodeURIComponent(paymentMode)}`;
            const response: any = await this.httpWrapper.post(url, {});
            return response;
        } catch (error: any) {
            throw error
        }
    }

    public updatePaymentMode = async (id: number, paymentMode: string) => {
        try {
            let url = `/v1/systemAdmin/updatePaymentMode/${id}?paymentMode=${encodeURIComponent(paymentMode)}`;
            const response: any = await this.httpWrapper.put(url, {});
            return response;
        } catch (error: any) {
            throw error
        }
    }

    public blockPaymentMode = async (id: number) => {
        try {
            let url = `/v1/systemAdmin/blockPaymentMode/${id}`;
            const response: any = await this.httpWrapper.put(url, {});
            return response;
        } catch (error: any) {
            throw error
        }
    }

    public unblockPaymentMode = async (id: number) => {
        try {
            let url = `/v1/systemAdmin/unblockPaymentMode/${id}`;
            const response: any = await this.httpWrapper.put(url, {});
            return response;
        } catch (error: any) {
            throw error
        }
    }

    public fetchPatientDetails = async (opNo: string): Promise<PatientDetailsItem> => {
        try {
            let url = `/v1/systemAdmin/fetchPatientDetails/${opNo}`;
            const response: any = await this.httpWrapper.get(url);
            return response;
        } catch (error: any) {
            throw error
        }
    }

    // ============================================
    // ADMIN USER ROLE APIs
    // ============================================

    public fetchAllUserRoles = async () => {
        try {
            let url = '/v1/systemAdmin/fetchAllUserRoles';
            const response: any = await this.httpWrapper.get(url);
            return response;
        } catch (error: any) {
            throw error
        }
    }

    public fetchAllUserModules = async () => {
        try {
            let url = '/v1/systemAdmin/fetchAllUserModules';
            const response: any = await this.httpWrapper.get(url);
            return response;
        } catch (error: any) {
            throw error
        }
    }

    public fetchAllUserModulesByRoleId = async (roleId: number) => {
        try {
            let url = `/v1/systemAdmin/fetchAllUserModulesByRoleId/${roleId}`;
            const response: any = await this.httpWrapper.get(url);
            return response;
        } catch (error: any) {
            throw error
        }
    }

    public saveUserRoleRights = async (payload: {
        roleId: number;
        uid: number;
        permissions: Array<{
            modId: number;
            subModIds: Array<{
                subModId: number;
                headerIds: Array<{
                    headerId: number;
                    menuIds: number[];
                }>;
            }>;
        }>;
    }) => {
        try {
            let url = '/v1/systemAdmin/saveUserRoleRights';
            const response: any = await this.httpWrapper.post(url, payload);
            return response;
        } catch (error: any) {
            throw error
        }
    }

    public saveAdminUserRole = async (payload: { roleName: string }) => {
        try {
            let url = '/v1/systemAdmin/saveAdminUserRole';
            const response: any = await this.httpWrapper.post(url, payload);
            return response;
        } catch (error: any) {
            throw error
        }
    }

    public fetchAllConsultants = async () => {
        try {
            let url = '/v1/systemAdmin/fetchAllConsultants';
            const response: any = await this.httpWrapper.get(url);
            return response;
        } catch (error: any) {
            throw error
        }
    }

    public fetchAllUsers = async () => {
        try {
            let url = '/v1/systemAdmin/fetchAllUsers';
            const response: any = await this.httpWrapper.get(url);
            return response;
        } catch (error: any) {
            throw error
        }
    }

    public saveTheUser = async (payload: {
        username: string;
        password: string;
        fullName: string;
        isDoctor: number;
        doctorId: number;
        secId: number;
        isNurse: number;
    }) => {
        try {
            let url = '/v1/systemAdmin/saveTheUser';
            const response: any = await this.httpWrapper.post(url, payload);
            return response;
        } catch (error: any) {
            throw error
        }
    }

    // ============================================
    // Room-Ward APIs
    // ============================================

    public fetchAllRoomBed = async () => {
        try {
            let url = '/v1/systemAdmin/fetchAllRoomBeds';
            const response: any = await this.httpWrapper.get(url);
            return response;
        } catch (error: any) {
            throw error
        }
    }

    public saveRoomBed = async (payload: any) => {
        try {
            let url = '/v1/systemAdmin/saveRoomBed';
            const response: any = await this.httpWrapper.post(url, payload);
            return response;
        } catch (error: any) {
            throw error
        }
    }

    public updateRoomBed = async (id: number, payload: any) => {
        try {
            let url = `/v1/systemAdmin/updateRoomBed/${id}`;
            const response: any = await this.httpWrapper.put(url, payload);
            return response;
        } catch (error: any) {
            throw error
        }
    }

    public blockRoomBed = async (id: number) => {
        try {
            let url = `/v1/systemAdmin/blockTheRoomBed/${id}`;
            const response: any = await this.httpWrapper.put(url, {});
            return response;
        } catch (error: any) {
            throw error
        }
    }

    public unblockRoomBed = async (id: number) => {
        try {
            let url = `/v1/systemAdmin/unBlockTheRoomBed/${id}`;
            const response: any = await this.httpWrapper.put(url, {});
            return response;
        } catch (error: any) {
            throw error
        }
    }

    public fetchAllDepartments = async (): Promise<DepartmentItem[]> => {
        try {
            let url = '/v1/systemAdmin/fetchAllDepartments';
            const response: any = await this.httpWrapper.get(url);
            const data = response?.data || response || [];
            return Array.isArray(data) ? data : [];
        } catch (error: any) {
            throw error
        }
    }
}