import HttpClientWrapper from "../http-client-wrapper";

export interface IpRegisterBetweenDatesApiItem {
    opNo: string;
    patId: number;
    opvisitId: number;
    ipId: number;
    ipDisplay: string;
    firstName: string;
    secondName: string;
    dateOfBirth: string;
    gender: string;
    guardianName: string;
    address: string;
    wardName: string;
    wardType: string;
    bedName: string;
    departmentName: string;
    doctorName: string;
    accHeadName: string;
    roomRent: number;
    userName: string;
    admitDate: string;
    admitTime: string;
}

export interface DischargeRegisterBetweenDatesApiItem {
    opNo: string;
    patientName: string;
    gender: string;
    dateOfBirth: string;
    address: string;
    ipDisplayNo: string;
    ipId: number;
    billNo: string;
    advanceDisplay: string;
    billDisplay: string;
    billAmount: number;
    advanceAmount: number;
    paidAmount: number;
    discAmount: number;
    accountHead: string;
    departmentName: string;
    stayDays: number;
    wardName: string;
    wardCharge: number;
    admissionDate: string;
    dischargeDate: string;
    admittedDoctor: string;
    dischargeUser: string;
    dischargeCondition: string;
}

export interface RefileOpReportBetweenDatesApiItem {
    patientName: string;
    opNO: string;
    refileDate: string;
    refileUser: string;
    visitDate: string;
    visitId: number;
    doctorName: string;
    visitTime: string;
    refileTime: string;
}

export interface OpReportBetweenDatesApiItem {
    patId: number;
    opNo: string;
    patName: string;
    billId: number;
    total: number;
    pay: number;
    disc: number;
    paid: number;
    balance: number;
    cashPaid: string;
    bankPaid: string;
}

export interface DoctorStatisticsApiItem {
    patientName: string;
    opNo: string;
    datetime: string;
    tokenNoDept: number;
    tokenNoDoctor: number;
    masterTokenNo: number;
    docName: string;
}

export interface DepartmentStatisticsApiItem {
    patientName: string;
    opNo: string;
    datetime: string;
    tokenNoDept: number;
    tokenNoDoctor: number;
    masterTokenNo: number;
    deptName: string;
}

export interface MRDCollectionApiItem {
    opNo: string;
    patientName: string;
    age: string;
    sex: string;
    date: string;
    regBillNo: string;
    total: number;
    disc: number;
    pay: number;
    paid: number;
    balance: number;
    discountHead: string;
    debitHead: string;
}

export interface DepartmentOPStatisticsApiItem {
    deptName: string;
    newMaleCount: number;
    newFemaleCount: number;
    newTotal: number;
    repeatMaleCount: number;
    repeatFemaleCount: number;
    repeatTotal: number;
    grandTotal: number;
}

export interface WardStatisticsApiItem {
    wardName: string;
    bedCount: number;
    ipTotal: number;
    separateTotal: {
        male: number;
        female: number;
        others: number;
    };
}

export interface IpCensusReportApiItem {
    date: string;
    previousCensus: number;
    admissionOnDate: number;
    dischargeOnDate: number;
    totalIp: number;
}

// ============================================
// MEDICAL RECORDS API SERVICE
// ============================================

export interface BedOccupancyReportItem {
    wardName: string;
    noOfBeds: number;
    noOfDays: number;
    totalNoOfIp: number;
    dailyAvg: number;
    occupancyRate: number | null;
}

export interface IcdCodeRegisterItem {
    name: string;
    code: string;
    noOfPatients: number;
}

export interface MlcReportItem {
    patId: number;
    firstName: string;
    secondName: string;
    dob: string;
    sex: number;
    id: number;
    tokenNoDoctor: string;
    tokenNoDept: string;
    caseType: number;
    ipNo: string | null;
    opNo: string;
    sexName: string;
    doaTime: string;
    dodTime: string;
}

export interface MlcPatientListItem {
    patientName: string;
    opNo: string;
    ipNo: string;
    doaTime: string;
    dodTime: string;
}

export interface IpOccupancyItem {
    ipNo: string;
    opNo: string;
    patientName: string;
    village: string;
    admitDateTime: string;
    dischargeDateTime: string;
}

export interface CancerPatientsListItem {
    slNo: number;
    patientName: string;
    opNo: string;
    ipNo: string;
    guardianName: string;
    age: string;
    address: string;
    phone: string;
    admitDate: string;
    dischargeDate: string;
    diagnosis: string;
}

export interface DiagnosisWiseListItem {
    slNo: number;
    patientName: string;
    opNo: string;
    ipNo: string;
    address: string;
    admitDate: string;
    dischargeDate: string;
    diagnosis: string;
}

export interface ProcedureWiseListItem {
    slNo: number;
    patientName: string;
    opNo: string;
    ipNo: string;
    address: string;
    admitDate: string;
    dischargeDate: string;
    opProcedure: string;
}

export interface UnRefilledIpChartItem {
    slNo: number;
    ipNo: string;
    opNo: string;
    patientName: string;
    wardBed: string;
    dischargeDate: string;
}

export interface ResultWiseListItem {
    slNo: number;
    patientName: string;
    opNo: string;
    ipNo: string;
    address: string;
    admitDate: string;
    dischargeDate: string;
    result: string;
}

export interface DoctorwiseOpReportItem {
    slNo: number;
    consultantName: string;
    totalPatients: number;
}

export interface VillageWiseListItem {
    slNo: number;
    patientName: string;
    visitDate: string;
    opNo: string;
}

export interface PatientAllVisitInfo {
    opNo: string;
    ipNo: string;
    patientName: string;
    dob: string;
    age: string;
    sex: string;
    relativeName: string;
    maritalStatus: string;
    phone: string;
    street: string;
    area: string;
    visitDate: string;
}

export interface PatientVisitItem {
    slNo: number;
    ipNo: string;
    majorToken: string;
    department: string;
    doctor: string;
    isAdmitted: string;
    diagnosis: string;
}

export interface PatientAllVisitResponse {
    patientInfo: PatientAllVisitInfo;
    visits: PatientVisitItem[];
}

export interface CategorywiseIpReportItem {
    slNo: number;
    patientName: string;
    opNo: string;
    age: string;
    address: string;
    admitDate: string;
    dischargeDate: string;
    department: string;
    consultant: string;
}

export interface PatientsICDCode {
    diagnosisId: number;
    ipId: number;
    diseaseId: number;
    subDiseaseId: number;
    diseaseName: string;
    subDiseaseName: string;
}

export interface OpVisitItem {
    opVisitId: number;
    patId: number;
    doctorId: number;
    doctorName: string;
    datetime: string;
    opNo: string;
    ipNo: string;
    patientName: string;
    dob: string;
    guardianName: string;
    phone: string;
    address: string;
    departmentName: string;
}

export interface IpVisitPatientDetailsItem {
    opNo: string;
    patientName: string;
    age: string;
    sex: string;
    visitId: number;
    visitDateTime: string;
    ipNo: string;
    ipId: string;
    docId: number;
    deptId: number;
    doctorName: string;
    departmentName: string;
    admitDateTime: string;
}

export class MedicalRecordsApiService {
    private httpWrapper: HttpClientWrapper;

    constructor() {
        this.httpWrapper = new HttpClientWrapper();
    }

    public fetchOpVisitsByOpNo = async (opNo: string): Promise<OpVisitItem[]> => {
        const response = await this.httpWrapper.get(`v1/medical-records/fetchOpVisitsByOpNo/${opNo}`);
        const data = response?.data || response || [];
        return Array.isArray(data) ? data : [];
    };

    public fetchPatientDetailsForIpVisit = async (opNo: string): Promise<IpVisitPatientDetailsItem[]> => {
        const response = await this.httpWrapper.get(
            `v1/medical-records/fetchPatientDetailsForIpVisit/${encodeURIComponent(opNo)}`
        );
        const data = response?.data || response || [];
        return Array.isArray(data) ? data : [];
    };


    public fetchAllCountries = async () => {
        const response = await this.httpWrapper.get('v1/medical-records/fetchAllCountries');
        const data = response?.data || response || [];
       /* return Array.isArray(data) ? data.filter((item: any) => item.isActive !== 0) : [];*/
        return Array.isArray(data) ? data : [];

    };


    public saveCountry = async (payload: {
        name: string;
        code: string;
        uid: number;
        isActive: number;
    }) => {
        return await this.httpWrapper.post('v1/medical-records/saveCountry', payload);
    };

    public updateCountry = async (id: number, payload: {
        name: string;
        code: string;
        uid: number;
        isActive: number;
    }) => {
        return await this.httpWrapper.put(`v1/medical-records/updateCountry/${id}`, payload);
    };

    public fetchAllStates = async () => {
        const response = await this.httpWrapper.get('v1/medical-records/fetchAllStates');
        const data = response?.data || response || [];
        // return Array.isArray(data) ? data.filter((item: any) => item.isActive !== 0) : [];
         return Array.isArray(data) ? data : [];

    };


    public saveState = async (payload: {
        name: string;
        uid: number;
        isActive: number;
        countryId: number;
    }) => {
        return await this.httpWrapper.post('v1/medical-records/saveState', payload);
    };

    public updateState = async (id: number, payload: {
        name: string;
        uid: number;
        isActive: number;
        countryId: number;
    }) => {
        return await this.httpWrapper.put(`v1/medical-records/updateState/${id}`, payload);
    };

    public fetchAllDistricts = async () => {
        const response = await this.httpWrapper.get('v1/medical-records/fetchAllDistricts');
        const data = response?.data || response || [];
        // return Array.isArray(data) ? data.filter((item: any) => item.isActive !== 0) : [];
         return Array.isArray(data) ? data : [];
    };

    public saveDistrict = async (payload: {
        name: string;
        code: string;
        uid: number;
        isActive: number;
        stId: number;
        postId: number;
    }) => {
        return await this.httpWrapper.post('v1/medical-records/saveDistrict', payload);
    };

    public updateDistrict = async (id: number, payload: {
        name: string;
        code: string;
        uid: number;
        isActive: number;
        stId: number;
        postId: number;
    }) => {
        return await this.httpWrapper.put(`v1/medical-records/updateDistrict/${id}`, payload);
    };

    public fetchAllPosts = async () => {
        const response = await this.httpWrapper.get('v1/medical-records/fetchAllPosts');
        const data = response?.data || response || [];
        // return Array.isArray(data) ? data.filter((item: any) => item.isActive !== 0) : [];
         return Array.isArray(data) ? data : [];
    };


    public savePost = async (payload: {
        name: string;
        code: string;
        uid: number;
        isActive: number;
        stId: number;
        distId: number;
    }) => {
        return await this.httpWrapper.post('v1/medical-records/savePost', payload);
    };

    public updatePost = async (id: number, payload: {
        name: string;
        code: string;
        uid: number;
        isActive: number;
        stId: number;
        distId: number;
    }) => {
        return await this.httpWrapper.put(`v1/medical-records/updatePost/${id}`, payload);
    };


    public fetchAllVillages = async () => {
        const response = await this.httpWrapper.get('v1/medical-records/fetchAllVillages');
        const data = response?.data || response || [];
        // return Array.isArray(data) ? data.filter((item: any) => item.isActive !== 0) : [];
         return Array.isArray(data) ? data : [];
    };


    public saveVillage = async (payload: {
        name: string;
        code: string;
        villageType: string;
        uid: number;
        isActive: number;
        stId: number;
        distId: number;
        postId: number;
    }) => {
        return await this.httpWrapper.post('v1/medical-records/saveVillage', payload);
    };

    public updateVillage = async (id: number, payload: {
        name: string;
        code: string;
        villageType: string;
        uid: number;
        isActive: number;
        stId: number;
        distId: number;
        postId: number;
    }) => {
        return await this.httpWrapper.put(`v1/medical-records/updateVillage/${id}`, payload);
    };


    public fetchAllGuardianTypes = async () => {
        const response = await this.httpWrapper.get('v1/medical-records/fetchAllGuardianTypes');
        const data = response?.data || response || [];
        return Array.isArray(data) ? data.filter((item: any) => item.isActive !== 0) : [];
    };


    public fetchAllGenders = async () => {
        const response = await this.httpWrapper.get('v1/medical-records/fetchAllGenders');
        const data = response?.data || response || [];
        return Array.isArray(data) ? data.filter((item: any) => item.isActive !== 0) : [];
    };


    public fetchAllDepartments = async () => {
        const response = await this.httpWrapper.get('v1/systemAdmin/fetchAllDepartments');
        const data = response?.data || response || [];
        return Array.isArray(data) ? data : [];
    };

    public saveDepartment = async (payload: {
        name: string;
        isActive: number;
        newCharges: number;
        repeatCharges: number;
        concession: number;
        days: number;
    }) => {
        return await this.httpWrapper.post('v1/systemAdmin/saveDepartment', payload);
    };


    public updateDepartment = async (id: number, payload: {
        name: string;
        isActive: number;
        newCharges: number;
        repeatCharges: number;
        concession: number;
        days: number;
    }) => {
        return await this.httpWrapper.put(`v1/systemAdmin/updateDepartment/${id}`, payload);
    };

  
    public fetchAllConsultants = async () => {
        const response = await this.httpWrapper.get('v1/systemAdmin/fetchAllConsultants');
        console.log('🔍 Raw consultant API response:', response);
        const data = response?.data || response || [];
        console.log('📦 Extracted data:', data);
        return Array.isArray(data) ? data : [];
    };

    public saveConsultant = async (payload: {
        name: string;
        deptId: number;
        isActive: number;
        isCons: number;
        uid: number;
        consultantHIN: string;
        consultantRoom: string;
        details: string;
        isSenior: number;
        newCharges: number;
        repeatCharges: number;
        renewalDays: number;
        concession: number;
        days: number;
    }) => {
        return await this.httpWrapper.post('v1/systemAdmin/saveConsultant', payload);
    };

    public updateConsultant = async (id: number, payload: {
        name: string;
        deptId: number;
        isActive: number;
        isCons: number;
        uid: number;
        consultantHIN: string;
        consultantRoom: string;
        details: string;
        isSenior: number;
        newCharges: number;
        repeatCharges: number;
        renewalDays: number;
        concession: number;
        days: number;
    }) => {
        return await this.httpWrapper.put(`v1/systemAdmin/updateConsultant/${id}`, payload);
    };


    public toggleConsultantStatus = async (id: number, isActive: number) => {
        return await this.httpWrapper.put(`v1/systemAdmin/toggleConsultantStatus/${id}`, { isActive });
    };

    public fetchAllComplaints = async () => {
        const response = await this.httpWrapper.get('v1/systemAdmin/fetchAllComplaints');
        const data = response?.data || response || [];
        return Array.isArray(data) ? data : [];
    };

    public saveComplaint = async (payload: {
        name: string;
        isBlocked: number;
    }) => {
        return await this.httpWrapper.post('v1/systemAdmin/saveComplaint', payload);
    };

    public updateComplaint = async (id: number, payload: {
        name: string;
        isBlocked: number;
    }) => {
        return await this.httpWrapper.put(`v1/systemAdmin/updateComplaint/${id}`, payload);
    };


    public fetchAccountHeads = async () => {
        const response = await this.httpWrapper.get('v1/systemAdmin/fetchAccountHeads');
        const data = response?.data || response || [];
        return Array.isArray(data) ? data : [];
    };


    public fetchAllPaymentTypes = async () => {
        const response = await this.httpWrapper.get('v1/systemAdmin/fetchAllPaymentTypes');
        const data = response?.data || response || [];
        return Array.isArray(data) ? data.filter((item: any) => item.isActive !== 0) : [];
    };


    public fetchAllPaymentModes = async () => {
        const response = await this.httpWrapper.get('v1/systemAdmin/fetchAllPaymentModes');
        const data = response?.data || response || [];
        return Array.isArray(data) ? data.filter((item: any) => item.isActive !== 0) : [];
    };

    public fetchAllBankDetails = async () => {
        const response = await this.httpWrapper.get('v1/systemAdmin/fetchAllBankDetails');
        const data = response?.data || response || [];
        return Array.isArray(data) ? data.filter((item: any) => item.isActive !== 0) : [];
    };


    public fetchPatientDetails = async (displayNumber: string) => {
        return await this.httpWrapper.get(`v1/systemAdmin/fetchPatientDetails/${displayNumber}`);
    };


    public savePatientRegistration = async (payload: any) => {
        return await this.httpWrapper.post('v1/medical-records/savePatientRegistration', payload);
    };


    public fetchAllWards = async () => {
        const response = await this.httpWrapper.get('v1/systemAdmin/fetchAllWards');
        const data = response?.data || response || [];
        return Array.isArray(data) ? data.filter((item: any) => item.isActive !== 0) : [];
    };

    public fetchRoomBedByWardId = async (wardId: number) => {
        return await this.httpWrapper.get(`v1/systemAdmin/fetchRoomBedsByWardId?wardId=${wardId}`);
    };

    /**
     * Fetch patient details by patient ID
     * @param patId - Patient ID
     * @returns Patient details
     */
    public fetchPatientDetailsByPatId = async (patId: number) => {
        return await this.httpWrapper.get(`v1/systemAdmin/fetchPatientDetailsByPatId/${patId}`);
    };

    /**
     * Admit patient to inpatient
     * @param payload - Admission data
     * @returns Admission response with IP number
     */
    public admitPatient = async (payload: {
        patId: number;
        locId: number;
        deptId: number;
        docId: number;
        admitDateTime: string;
        diagnosis: string;
        accHeadId: number;
        admissionWardId: number;
        roomBedId: number;
        noDays: number;
        typeId: number;
        chargeType: number;
        patType: number;
        uid: number;
    }) => {
        return await this.httpWrapper.post('v1/medical-records/admitPatient', payload);
    };


    public fetchActiveOpPatients = async () => {
        return await this.httpWrapper.get('v1/medical-records/fetchActiveOpPatients');
    };


    public refileOpCards = async (payload: {
        patIds: number[];
        uid: number;
    }) => {
        return await this.httpWrapper.post('v1/medical-records/refileOpCards', payload);
    };


    public fetchActiveIpPatients = async (departmentId?: number) => {
        if (departmentId !== undefined && departmentId !== null) {
            return await this.httpWrapper.get(`v1/medical-records/fetchActiveIpPatients?departmentId=${departmentId}`);
        }
        return await this.httpWrapper.get('v1/medical-records/fetchActiveIpPatients');
    };

    public fetchDepartmentStatistics = async (
        fromDate: string,
        fromTime: string,
        toDate: string,
        toTime: string,
        deptId: number
    ): Promise<DepartmentStatisticsApiItem[]> => {
        const response = await this.httpWrapper.get(
            `v1/medical-records/fetchDepartmentStatistics?fromDate=${encodeURIComponent(fromDate)}&fromTime=${encodeURIComponent(fromTime)}&toDate=${encodeURIComponent(toDate)}&toTime=${encodeURIComponent(toTime)}&deptId=${deptId}`
        );
        if (Array.isArray(response)) return response as DepartmentStatisticsApiItem[];
        if (Array.isArray(response?.data)) return response.data as DepartmentStatisticsApiItem[];
        return [];
    };

    public fetchMRDCollections = async (
        fromDate: string,
        toDate: string,
        deptId?: number
    ): Promise<MRDCollectionApiItem[]> => {
        let url = `v1/medical-records/fetchMRDCollections?fromDate=${encodeURIComponent(fromDate)}&toDate=${encodeURIComponent(toDate)}`;
        if (deptId !== undefined && deptId !== null) {
            url += `&deptId=${deptId}`;
        }
        const response = await this.httpWrapper.get(url);
        if (Array.isArray(response)) return response as MRDCollectionApiItem[];
        if (Array.isArray(response?.data)) return response.data as MRDCollectionApiItem[];
        return [];
    };

    public fetchDepartmentOPStatistics = async (
        fromDate: string,
        toDate: string
    ): Promise<DepartmentOPStatisticsApiItem[]> => {
        const response = await this.httpWrapper.get(
            `v1/medical-records/fetchDepartmentOPStatistics?fromDate=${encodeURIComponent(fromDate)}&toDate=${encodeURIComponent(toDate)}`
        );
        if (Array.isArray(response)) return response as DepartmentOPStatisticsApiItem[];
        if (Array.isArray(response?.data)) return response.data as DepartmentOPStatisticsApiItem[];
        return [];
    };

    public fetchWardStatistics = async (
        fromDate: string,
        toDate: string
    ): Promise<WardStatisticsApiItem[]> => {
        const response = await this.httpWrapper.get(
            `v1/medical-records/fetchWardStatistics?fromDate=${encodeURIComponent(fromDate)}&toDate=${encodeURIComponent(toDate)}`
        );
        if (Array.isArray(response)) return response as WardStatisticsApiItem[];
        if (Array.isArray(response?.data)) return response.data as WardStatisticsApiItem[];
        return [];
    };

    public fetchDoctorStatistics = async (
        fromDate: string,
        toDate: string,
        opType: number
    ): Promise<DoctorStatisticsApiItem[]> => {
        const response = await this.httpWrapper.get(
            `v1/medical-records/fetchDoctorStatistics?fromDate=${encodeURIComponent(fromDate)}&toDate=${encodeURIComponent(toDate)}&opType=${opType}`
        );
        if (Array.isArray(response)) return response as DoctorStatisticsApiItem[];
        if (Array.isArray(response?.data)) return response.data as DoctorStatisticsApiItem[];
        return [];
    };


    public fetchOpReportsBetweenDates = async (
        fromDate: string,
        toDate: string
    ): Promise<OpReportBetweenDatesApiItem[]> => {
        const response = await this.httpWrapper.get(
            `v1/medical-records/fetchOpReportsBetweenDates/${encodeURIComponent(fromDate)}/${encodeURIComponent(toDate)}`
        );

        if (Array.isArray(response)) {
            return response as OpReportBetweenDatesApiItem[];
        }

        if (Array.isArray(response?.data)) {
            return response.data as OpReportBetweenDatesApiItem[];
        }

        return [];
    };


    public fetchRefileOpReportsBetweenDates = async (
        fromDate: string,
        toDate: string
    ): Promise<RefileOpReportBetweenDatesApiItem[]> => {
        const response = await this.httpWrapper.get(
            `v1/medical-records/fetchRefileOpReportsBetweenDates/${encodeURIComponent(fromDate)}/${encodeURIComponent(toDate)}`
        );

        if (Array.isArray(response)) {
            return response as RefileOpReportBetweenDatesApiItem[];
        }

        if (Array.isArray(response?.data)) {
            return response.data as RefileOpReportBetweenDatesApiItem[];
        }

        return [];
    };


    public dischargePatient = async (payload: {
        ipId: number;
        patId: number;
        dischargeDateTime: string;
        uid: number;
    }) => {
        return await this.httpWrapper.post('v1/medical-records/dischargePatient', payload);
    };

    public saveMaternityDischargeSummary = async (payload: {
        patId: number;
        visitId: number;
        ipId: number;
        dateOfDischarge: string;
        uid: number;
        history: string;
        newAddres: string;
        blood: number;
        pressure: number;
        temp: number;
        pulse: number;
        resp: number;
        weight: number;
        paut: string;
        conditionUt: string;
        foetus: string;
        fhr: string;
        noofbabys: number;
        period: string;
        pv1: string;
        pv2: string;
        os: string;
        membrane: string;
        vertex: string;
        pelvis: string;
        modeOfdeliv: string;
        conditionDis: string;
        adviceDis: string;
        indication: string;
        courseInTheHos: string;
        matSurgerDate: string;
        toa: string;
        tos: string;
        tod: string;
        babyDetails: {
            id: number;
            patId: number;
            summaryId: number;
            visitId: number;
            noOfBaby: number;
            babyDetailId: number;
            birthDate: string;
            birthTime: string;
            sex: string;
            status: string;
            weight: number;
            apgar: string;
            entDate: string;
            entTime: string;
            entUid: number;
            editDate: string;
            editTime: string;
            editUid: number;
            extra1: number;
            extra2: number;
            extra3: number;
        }[];
    }) => {
        return await this.httpWrapper.post('v1/clinical-information/saveMaternityDischargeSummary', payload);
    };

    public fetchPatientSummary = async (patId: number, visitId: number, ipId: number) => {
        const url = `v1/clinical-information/fetchPatientSummary?patId=${patId}&visitId=${visitId}&ipId=${ipId}`;
        const response = await this.httpWrapper.get(url);
        return response?.data || response || null;
    };

    public fetchMaternityDischargeSummary = async (patId: number, visitId: number, ipId: number) => {
        const url = `v1/clinical-information/fetchMaternityDischargeSummary?patId=${patId}&visitId=${visitId}&ipId=${ipId}`;
        const response = await this.httpWrapper.get(url);
        return response?.data || response || null;
    };

    public approveMaternityDischargeSummary = async (payload: {
        summaryId: number;
        visitId: number;
        approveUid: number;
    }) => {
        return await this.httpWrapper.put('v1/clinical-information/approveMaternityDischargeSummary', payload);
    };

    public updateMaternityDischargeSummary = async (id: number, payload: {
        patId: number;
        visitId: number;
        ipId: number;
        dateOfDischarge: string;
        uid: number;
        history: string;
        newAddres: string;
        blood: number;
        pressure: number;
        temp: number;
        pulse: number;
        resp: number;
        weight: number;
        paut: string;
        conditionUt: string;
        foetus: string;
        fhr: string;
        noofbabys: number;
        period: string;
        pv1: string;
        pv2: string;
        os: string;
        membrane: string;
        vertex: string;
        pelvis: string;
        modeOfdeliv: string;
        conditionDis: string;
        adviceDis: string;
        indication: string;
        courseInTheHos: string;
        matSurgerDate: string;
        toa: string;
        tos: string;
        tod: string;
        babyDetails: {
            id: number;
            patId: number;
            summaryId: number;
            visitId: number;
            noOfBaby: number;
            babyDetailId: number;
            birthDate: string;
            birthTime: string;
            sex: string;
            status: string;
            weight: number;
            apgar: string;
            entDate: string;
            entTime: string;
            entUid: number;
            editDate: string;
            editTime: string;
            editUid: number;
            extra1: number;
            extra2: number;
            extra3: number;
        }[];
    }) => {
        const url = `v1/clinical-information/updateMaternityDischargeSummary/${id}`;
        return await this.httpWrapper.put(url, payload);
    };

    public updatePatientSummary = async (id: number, payload: any) => {
        const url = `v1/clinical-information/updatePatientSummary/${id}`;
        const response = await this.httpWrapper.put(url, payload);
        return response?.data || response || null;
    };

    public savePatientSummary = async (payload: any) => {
        const response = await this.httpWrapper.post('v1/clinical-information/savePatientSummary', payload);
        return response?.data || response || null;
    };

    public fetchProductTiming = async () => {
        const response = await this.httpWrapper.get('v1/central-store/fetchProductTiming');
        const data = response?.data || response || [];
        return Array.isArray(data) ? data : [];
    };

    public approveDischargeSummary = async (payload: { summaryId: number; visitId: number; approveUid: number }) => {
        const response = await this.httpWrapper.put('v1/clinical-information/approveDischargeSummary', payload);
        return response?.data || response || null;
    };

    /**
     * Fetch IP register entries between dates
     * @param fromDate Start date (YYYY-MM-DD)
     * @param toDate End date (YYYY-MM-DD)
     */
    public fetchIpRegistersBetweenDates = async (
        fromDate: string,
        toDate: string
    ): Promise<IpRegisterBetweenDatesApiItem[]> => {
        const parseResponseData = (response: any): IpRegisterBetweenDatesApiItem[] => {
            if (Array.isArray(response)) {
                return response as IpRegisterBetweenDatesApiItem[];
            }

            if (Array.isArray(response?.data)) {
                return response.data as IpRegisterBetweenDatesApiItem[];
            }

            return [];
        };

        const toDdMmYyyy = (dateText: string) => {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(dateText)) {
                return dateText;
            }
            const [yyyy, mm, dd] = dateText.split("-");
            return `${dd}-${mm}-${yyyy}`;
        };

        const tryFetch = async (fromDateText: string, toDateText: string) => {
            const encodedFromDate = encodeURIComponent(fromDateText);
            const encodedToDate = encodeURIComponent(toDateText);
            const response = await this.httpWrapper.get(
                `v1/medical-records/fetchIpRegistersBetweenDates/${encodedFromDate}/${encodedToDate}`
            );
            return parseResponseData(response);
        };

        try {
            return await tryFetch(fromDate, toDate);
        } catch (firstError: any) {
            const fallbackFromDate = toDdMmYyyy(fromDate);
            const fallbackToDate = toDdMmYyyy(toDate);

            if (fallbackFromDate === fromDate && fallbackToDate === toDate) {
                throw firstError;
            }

            try {
                return await tryFetch(fallbackFromDate, fallbackToDate);
            } catch {
                throw firstError;
            }
        }
    };

    /**
     * Fetch IP census report entries between dates
     * @param fromDate Start date (YYYY-MM-DD)
     * @param toDate End date (YYYY-MM-DD)
     */
    public fetchIpcensusReport = async (
        fromDate: string,
        toDate: string
    ): Promise<IpCensusReportApiItem[]> => {
        const response = await this.httpWrapper.get(
            `v1/medical-records/fetchIpCensusReport?fromDate=${encodeURIComponent(fromDate)}&toDate=${encodeURIComponent(toDate)}`
        );

        if (Array.isArray(response)) return response as IpCensusReportApiItem[];
        if (Array.isArray(response?.data)) return response.data as IpCensusReportApiItem[];
        return [];
    };

    /**
     * Fetch discharge register entries between dates
     * @param fromDate Start date (YYYY-MM-DD)
     * @param toDate End date (YYYY-MM-DD)
     */
    public fetchDischargeRegistersBetweenDates = async (
        fromDate: string,
        toDate: string
    ): Promise<DischargeRegisterBetweenDatesApiItem[]> => {
        const response = await this.httpWrapper.get(
            `v1/medical-records/fetchDischargeRegistersBetweenDates/${encodeURIComponent(fromDate)}/${encodeURIComponent(toDate)}`
        );

        if (Array.isArray(response)) {
            return response as DischargeRegisterBetweenDatesApiItem[];
        }

        if (Array.isArray(response?.data)) {
            return response.data as DischargeRegisterBetweenDatesApiItem[];
        }

        return [];
    };


    public updatePatientCompany = async (payload: {
        patId: number;
        visitId: number;
        debitId: number;
        referenceNo: string;
        uid: number;
    }) => {
        return await this.httpWrapper.post('v1/medical-records/companyUpdation', payload);
    };

    public blockUhid = async (payload: {
        patId: number;
        isBlocked: number;
        blockReason: string;
        uid: number;
    }) => {
        return await this.httpWrapper.post('v1/medical-records/blockUhid', payload);
    };

    public saveChangeDepartmentDoctor = async (payload: {
        visitId: number;
        deptId: number;
        doctorId: number;
    }) => {
        return await this.httpWrapper.put('v1/medical-records/changePatientDepartmentDoctor', payload);
    };

    public saveChangeIpDepartmentDoctor = async (payload: {
        ipId: number;
        deptId: number;
        doctorId: number;
    }) => {
        return await this.httpWrapper.put('v1/medical-records/changePatientDepartmentDoctorForIpVisit', payload);
    };

    public fetchBedOccupancyReport = async (month: number, year: number): Promise<BedOccupancyReportItem[]> => {
        const response = await this.httpWrapper.get(`v1/medical-records/fetchBedOccupancyReport?month=${month}&year=${year}`);
        const data = response?.data || response || [];
        return Array.isArray(data) ? data : [];
    };

    public fetchIcdCodeRegister = async (fromDate: string, toDate: string): Promise<IcdCodeRegisterItem[]> => {
        const response = await this.httpWrapper.get(`v1/medical-records/fetchIcdCodeRegister?fromDate=${encodeURIComponent(fromDate)}&toDate=${encodeURIComponent(toDate)}`);
        const data = response?.data || response || [];
        return Array.isArray(data) ? data : [];
    };

    public fetchMlcReports = async (fromDate: string, toDate: string): Promise<MlcReportItem[]> => {
        const response = await this.httpWrapper.get(
            `v1/medical-records/fetchMlcReports/${encodeURIComponent(fromDate)}/${encodeURIComponent(toDate)}`
        );
        const data = response?.data || response || [];
        return Array.isArray(data) ? data : [];
    };

    public fetchMlcPatientsRegistrationList = async (fromDate: string, toDate: string): Promise<MlcPatientListItem[]> => {
        const response = await this.httpWrapper.get(
            `v1/medical-records/fetchMlcPatientsRegistrationList?fromDate=${encodeURIComponent(fromDate)}&toDate=${encodeURIComponent(toDate)}`
        );
        const data = response?.data || response || [];
        return Array.isArray(data) ? data : [];
    };

    public fetchIpOccupancy = async (fromDate: string, toDate: string): Promise<IpOccupancyItem[]> => {
        const response = await this.httpWrapper.get(
            `v1/medical-records/fetchIpOccupancy?fromDate=${encodeURIComponent(fromDate)}&toDate=${encodeURIComponent(toDate)}`
        );
        const data = response?.data || response || [];
        return Array.isArray(data) ? data : [];
    };

    public fetchCancerPatientsList = async (fromDate: string, toDate: string): Promise<CancerPatientsListItem[]> => {
        const response = await this.httpWrapper.get(
            `v1/medical-records/fetchCancerPatientsList?fromDate=${encodeURIComponent(fromDate)}&toDate=${encodeURIComponent(toDate)}`
        );
        const data = response?.data || response || [];
        return Array.isArray(data) ? data : [];
    };

    public fetchDiagnosisWiseList = async (fromDate: string, toDate: string): Promise<DiagnosisWiseListItem[]> => {
        const response = await this.httpWrapper.get(
            `v1/medical-records/fetchDiagnosisWiseList?fromDate=${encodeURIComponent(fromDate)}&toDate=${encodeURIComponent(toDate)}`
        );
        const data = response?.data || response || [];
        return Array.isArray(data) ? data : [];
    };

    public fetchProcedureWisePatientList = async (fromDate: string, toDate: string): Promise<ProcedureWiseListItem[]> => {
        const response = await this.httpWrapper.get(
            `v1/medical-records/fetchProcedureWisePatientList?fromDate=${encodeURIComponent(fromDate)}&toDate=${encodeURIComponent(toDate)}`
        );
        const data = response?.data || response || [];
        return Array.isArray(data) ? data : [];
    };

    public fetchUnRefilledIpCharts = async (): Promise<UnRefilledIpChartItem[]> => {
        const response = await this.httpWrapper.get('v1/medical-records/fetchUnRefilledIpCharts');
        const data = response?.data || response || [];
        return Array.isArray(data) ? data : [];
    };

    public fetchCategorywiseIpReport = async (fromDate: string, toDate: string): Promise<CategorywiseIpReportItem[]> => {
        const response = await this.httpWrapper.get(
            `v1/medical-records/fetchCategorywiseIpReport?fromDate=${encodeURIComponent(fromDate)}&toDate=${encodeURIComponent(toDate)}`
        );
        const data = response?.data || response || [];
        return Array.isArray(data) ? data : [];
    };

    public searchPatients = async (criteria: {
        patName?: string;
        gName?: string;
        phone?: string;
    }): Promise<{ displayNumber: string; firstName: string; secondName: string; phoneNumber: string }[]> => {
        const params = new URLSearchParams();
        if (criteria.patName) params.append('patName', criteria.patName);
        if (criteria.gName) params.append('gName', criteria.gName);
        if (criteria.phone) params.append('phone', criteria.phone);
        const response = await this.httpWrapper.get(`v1/medical-records/searchPatients?${params.toString()}`);
        const data = response?.data || response || [];
        if (!Array.isArray(data)) return [];
        return data.map((item: any) => ({
            displayNumber: item.displayNumber ?? '',
            firstName: item.name ?? '',
            secondName: '',
            phoneNumber: item.phone ?? '',
        }));
    };

    public fetchIcdCode = async (searchterm: string) => {
        const url = `v1/systemAdmin/searchIcdCodes/${encodeURIComponent(searchterm)}`;
        const response = await this.httpWrapper.get(url);
        return response?.data || response || null;
    };
    
    public fetchPatientsICDCode = async (ipId: number): Promise<PatientsICDCode[]> => {
        const response = await this.httpWrapper.get(
            `v1/medical-records/fetchPatientICDDaiagnosisByIpId/${encodeURIComponent(ipId)}`
        );
        const data = response?.data || response || [];
        return Array.isArray(data) ? data : [];
    };

    public saveIcdDetails = async (payload: {
        ipId: number;
        icdDetails: Array<{
            diseaseId: number;
            subDiseaseId: number;
            note: string;
        }>;
    }) => {
        return await this.httpWrapper.post(
        "v1/medical-records/saveIcdDetailsList",
        payload
        );
    };

    public fetchDetailsForIPAdmmitCancel = async (ipId: number): Promise<{ otherBills: boolean; ipBills: boolean; ipBillPaid: boolean }> => {
        const response = await this.httpWrapper.get(
            `v1/medical-records/checkBillsToCancelIp/${encodeURIComponent(ipId)}`
        );
        const data = response?.data || response || {};

        return {
            otherBills: Boolean(data?.otherBills),
            ipBills: Boolean(data?.ipBills),
            ipBillPaid: Boolean(data?.ipBillPaid),
        };
    };

    public UpdateCancelIpVisit = async (payload: {
        ipId: number;
        patId: number;
    }) => {
        return await this.httpWrapper.put(
        "v1/medical-records/cancelIpVisit",
        payload
        );
    };

    public fetchVillageName = async (name: string) => {
        const url = `v1/medical-records/fetchVillageNameLike?name=${encodeURIComponent(name)}`;
        const response = await this.httpWrapper.get(url);
        return response?.data || response || null;
    };

    public fetchPostName = async (name: string) => {
        const url = `v1/medical-records/fetchPostNameLike?name=${encodeURIComponent(name)}`;
        const response = await this.httpWrapper.get(url);
        return response?.data || response || null;
    };

    public savePatientBedTransfer = async (payload: {
        wardId: number;
        stayId: number;
        roomId: number;
        grpId: number;
        uid: number;
        date: string;
        time: string;
        isRetained: number;
        patType: number;
        oldRoom: number;
        reason: number;
    }) => {
        return await this.httpWrapper.post(
        "v1/clinical-information/patientBedTransfer",
        payload
        );
    };

    public fetchAllBedTransferReasons = async () => {
        const response = await this.httpWrapper.get(
            "v1/medical-records/fetchAllBedTransferReasons"
        );
        const data = response?.data || response || [];
        return Array.isArray(data) ? data : [];
    };

    public fetchResultWiseList = async (fromDate: string, toDate: string): Promise<ResultWiseListItem[]> => {
        const response = await this.httpWrapper.get(
            `v1/medical-records/fetchResultWiseList?fromDate=${encodeURIComponent(fromDate)}&toDate=${encodeURIComponent(toDate)}`
        );
        const data = response?.data || response || [];
        return Array.isArray(data) ? data : [];
    };

    public fetchDoctorwiseOpReport = async (fromDate: string, toDate: string): Promise<DoctorwiseOpReportItem[]> => {
        const response = await this.httpWrapper.get(
            `v1/medical-records/fetchDoctorwiseOpReport?fromDate=${encodeURIComponent(fromDate)}&toDate=${encodeURIComponent(toDate)}`
        );
        const data = response?.data || response || [];
        return Array.isArray(data) ? data : [];
    };

    public fetchVillageWiseList = async (villageId: number, fromDate: string, toDate: string): Promise<VillageWiseListItem[]> => {
        const response = await this.httpWrapper.get(
            `v1/medical-records/fetchVillageWiseList?villageId=${villageId}&fromDate=${encodeURIComponent(fromDate)}&toDate=${encodeURIComponent(toDate)}`
        );
        const data = response?.data || response || [];
        return Array.isArray(data) ? data : [];
    };

    public fetchPatientsAllVisit = async (opNo: string): Promise<PatientAllVisitResponse | null> => {
        const response = await this.httpWrapper.get(
            `v1/medical-records/fetchPatientsAllVisit?opNo=${encodeURIComponent(opNo)}`
        );
        const data = response?.data || response || null;
        return data && typeof data === 'object' ? (data as PatientAllVisitResponse) : null;
    };
    
    public fetchIpPatientsForSummary = async (fromDate: string, toDate: string) => {
        return await this.httpWrapper.get(
            `v1/medical-records/fetchIpPatientsForSummaryBetweenDates/${encodeURIComponent(fromDate)}/${encodeURIComponent(toDate)}`
        );
    };
        
    public fetchIpPatientsForSummaryVerify = async (fromDate: string, toDate: string) => {
        return await this.httpWrapper.get(
            `v1/medical-records/fetchIpPatientsForSummaryVerifyBetweenDates/${encodeURIComponent(fromDate)}/${encodeURIComponent(toDate)}`
        );
    };
    
    public fetchIpPatientsForSummaryPrint = async (fromDate: string, toDate: string) => {
        return await this.httpWrapper.get(
            `v1/medical-records/fetchIpPatientsForSummaryPrintBetweenDates/${encodeURIComponent(fromDate)}/${encodeURIComponent(toDate)}`
        );
    };
    
    public fetchIpPatientsForSummaryMatVerify = async (fromDate: string, toDate: string) => {
        return await this.httpWrapper.get(
            `v1/medical-records/fetchIpPatientsForMatSummaryVerifyBetweenDates/${encodeURIComponent(fromDate)}/${encodeURIComponent(toDate)}`
        );
    };
    
    public fetchIpPatientsForSummaryMatPrint = async (fromDate: string, toDate: string) => {
        return await this.httpWrapper.get(
            `v1/medical-records/fetchIpPatientsForSummaryMatPrintBetweenDates/${encodeURIComponent(fromDate)}/${encodeURIComponent(toDate)}`
        );
    };
    
    public fetchIpPatientsForICDEntry = async (): Promise<IcdEntryDetailsRow[]> => {
        const response = await this.httpWrapper.get(
          `v1/medical-records/fetchIpPatientsForICDEntry`
        );
        const data = response?.data || response || [];
        return Array.isArray(data) ? (data as IcdEntryDetailsRow[]) : [];
    };
    
    public fetchDetailForAfterDischarge = async (ipNo: string): Promise<AfterDischargeResponse | null> => {
        const response = await this.httpWrapper.get(
            `v1/medical-records/fetchIpTreatmentDetails?ipNo=${encodeURIComponent(ipNo)}`
        );
        const data = response?.data || response || null;
        return data && typeof data === 'object' ? (data as AfterDischargeResponse) : null;
    };
    
    public saveUpdateAfterDischarge = async (payload: {
        ipNo: number;
        visitId: number;
        patId: number;
        diagnosis: string;
        treatment: string;
        result: string;
        caCheckId: number;
    }) => {
        return await this.httpWrapper.post(
        "v1/medical-records/saveOrUpdateIpTreatmentDetails",
        payload
        );
    };
    
    public saveDeath = async (payload: {
        expdate: string;
        exptime: string;
        caretype: string;
        diagnosis: string;
        opNo: string;
        patId: number;
        visitId: string;
        ipId: number;
    }) => {
        return await this.httpWrapper.post(
        "v1/medical-records/saveDeathRegister",
        payload
        );
    };

    public UpdateDeath = async (id: number, payload: {
        expdate: string;
        exptime: string;
        caretype: string;
        diagnosis: string;
        opNo: string;
        patId: number;
        visitId: string;
        ipId: number;
    }) => {
        const url = `v1/medical-records/updateDeathRegister/${id}`;
        return await this.httpWrapper.put(url, payload);
    };
    
    public fetchDetailForDeath = async (opNo : string): Promise<DeathResponse | null> => {
        const response = await this.httpWrapper.get(
            `v1/medical-records/fetchDeathRegisterByOpNo/${encodeURIComponent(opNo )}`
        );
        const data = response?.data || response || null;
        return data && typeof data === 'object' ? (data as DeathResponse) : null;
    };
    
    public fetchDeathReport = async (fromDate: string, toDate: string): Promise<DeathReportDetailsRow[]> => {
        const response = await this.httpWrapper.get(
          `v1/medical-records/fetchDeathReport?fromDate=${encodeURIComponent(fromDate)}&toDate=${encodeURIComponent(toDate)}`
        );
        const data = response?.data || response || [];
        return Array.isArray(data) ? (data as DeathReportDetailsRow[]) : [];
    };
}

export default MedicalRecordsApiService;

export interface IcdEntryDetailsRow {
    ipId: number;
    patId: number;
    opVisitId: number;
    ipNo: string;
    opNo: string;
    patientName: string;
    age: string;
    gender: string;
    admittedWard: string;
    roomBed: string;
    admitDate: string;
    address: string;
    mobileNumber: string;
    departmentId: number;
    departmentName: string;
    admittedDocId: number;
    admittedDoctorName: string;
    dischargeSummaryExists: number;
    dischargeSummaryVerified: number;
    maternityDisSummaryExists: number;
    maternityDisSummaryVerified: number;
    currentRoomId: number;
    ipVisitDetailId: number;
    isDiagnosisEntred: number;
}

export interface AfterDischargeResponse {
    ipNo: string;
    opNo: string;
    patientName: string;
    visitId: number;
    patId: number;
    admittedDateTime: string;
    dischargeDateTime: string;
    diagnosis: string;
    treatment: string;
    result: string;
    caCheckId: number;
}

export interface DeathResponse {
    deathId: number;
    deathDisplay: string;
    opNo: string;
    patId: number;
    patientName: string;
    age: string;
    sex: string;
    gname: string;
    guardianType: string;
    address: string;
    expdate: string;
    exptime: string;
    caretype: string;
    diagnosis: string;
    visitId: string;
    ipId: number;
    ipNo: string;
    dateTime: string;
}

export interface DeathReportDetailsRow {
    deathNo: string;
    opNo: string;
    ipNo: string;
    patientName: string;
    sex: string;
    age: string;
    guardianName: string;
    address: string;
    phoneNo: string;
    diagnosis: string;
    causeOfDeath: string;
    expdate: string;
    exptime: string;
}