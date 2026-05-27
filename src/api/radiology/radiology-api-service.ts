import HttpClientWrapper from "../http-client-wrapper"

export class RadiologyApiService {
    private httpWrapper: HttpClientWrapper;

    constructor() {
        this.httpWrapper = new HttpClientWrapper();
    }

// api for impression entry
    public saveImpressionEntry = async (
        payload: {
            patId: number;
            visitId: number;
            ipId: number;
            billId: number;
            billParticularId: number;
            particularId: number;
            study: string;
            impression: string;
        }
    ) => {
        return await this.httpWrapper.post("v1/radiology/saveInvImpressions",payload);
    };

    public updateImpressionEntry = async (
        id: number,
        payload: {
            study: string;
            impression: string;
        }
    ) => {
        return await this.httpWrapper.put(`v1/radiology/updateInvImpressions/${id}`,payload);
    };

    public approveImpressionEntry = async (id: number) => {
        return await this.httpWrapper.put(
        `v1/radiology/approveInvImpressions/${id}`
        );
    };

    public rejectImpressionEntry = async (id: number) => {
        return await this.httpWrapper.put(
        `v1/radiology/cancelInvImpressions/${id}`
        );
    };
    
    public fetchPatientsForImpressionEntry = async (): Promise<ImpressionEntryRow[]> => {
        const response = await this.httpWrapper.get(
            `v1/radiology/fetchPatientsForInvImpressionEntry`
        );
    const data = response?.data || response || [];
        return Array.isArray(data) ? data as ImpressionEntryRow[] : [];
    };

    
    public fetchImpressionsById = async (billParticularId : number): Promise<ImpressionsByIdResponse[]> => {
        try {
            const response = await this.httpWrapper.get(`v1/radiology/fetchInvImpressionsByBillId/${billParticularId }`);
            return response as ImpressionsByIdResponse[];
        } catch (error) {
            console.error('Error fetching impressions by ID:', error);
            throw error;
        }
    };
    
    public fetchImpressionsByIpId = async (ipId  : number): Promise<ImpressionsByIPIdResponse[]> => {
        try {
            const response = await this.httpWrapper.get(`v1/radiology/fetchInvImpressionForSummary/${ipId}`);
            return response as ImpressionsByIPIdResponse[];
        } catch (error) {
            console.error('Error fetching impressions by IP ID:', error);
            throw error;
        }
    };
    
    public fetchImpressionsEntryBetweenDays = async (fromDate : string, toDate : string): Promise<ImpressionsByBtweenDaysResponse[]> => {
        try {
            const response = await this.httpWrapper.get(`v1/radiology/fetchInvImpressionEntryBetweenDates?fromDate=${fromDate}&toDate=${toDate}`);
            return response as ImpressionsByBtweenDaysResponse[];
        } catch (error) {
            console.error('Error fetching impressions entry between dates:', error);
            throw error;
        }
    };
}

export default RadiologyApiService;

export interface ImpressionEntryRow {
    patientName: string;
    opNumber: string;
    visitId: number;
    ipId: number;
    billDisplay: string;
    billId: number;
    finalBillId: number;
    billTotal: number;
    discount: number;
    userId: number;
    userName: string;
    billDate: string;
    patId: number;
    particulars: ImpressionEntryDetails[]
}

export interface ImpressionEntryDetails {
    particularId: number;
    particularName: string;
    billParticularId: number;
}

export interface ImpressionsByIPIdResponse {
    id: number;
    particularName: string;
    study: string;
    impression: string;
}

export interface ImpressionsByBtweenDaysResponse {
    patientName: string;
    opNumber: string;
    visitId: number;
    ipId: number;
    billDisplay: string;
    billId: number;
    finalBillId: number;
    billTotal: number;
    discount: number;
    userId: number;
    userName: string;
    billDate: string;
    patId: number;
    particulars: ImpressionDetails[]
}

export interface ImpressionDetails {
    particularId: number;
    particularName: string;
    billParticularId: number;
    study: string;
    impression: string;
    entryUserName: string;
}
export interface ImpressionSaveResponse {
    id: number;
    particularId: number;
    particularName: string;
    study: string;
    impression: string;
}

export interface ImpressionsByIdResponse {
    id: number;
    patId: number;
    visitId: number;
    ipId: number;
    billId: number;
    billParticularId: number;
    particularId: number;
    study: string;
    impression: string;
    isApproved: number;
    isCancel: number;
    isPrint: number;
    entDateTime: string;
    approveDateTime: string;
    printDateTime: string;
    particularName: string;
    entryUser: string;
    approvedUser: string;
    printUser: string;
}