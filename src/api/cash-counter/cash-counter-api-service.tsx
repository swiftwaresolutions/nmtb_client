import HttpClientWrapper from "../http-client-wrapper";

// ============================================
// CASH COUNTER API SERVICE
// ============================================

export interface BillPatientDetails {
  patientName: string;
  opNo: string;
  regDoctor: string;
  regDepartment: string;
  ipNo: string;
  admitDateTime: string;
  admitDoctor: string;
  admitDepartment: string;
  bedName: string;
  wardName: string;
  userName: string;
  billNo: string;
  accountHead: string;
}
export interface AdvanceReturnReportRow {
  id: number;
  patId: number;
  billNo: string;
  billDisplay: string;
  total: number;
  patientName: string;
  opNo: string;
  userName: string;
  date: string;
}

export interface AdvanceReportRow {
  id: number;
  patId: number;
  billDisplay: string;
  billNo: string;
  cashPaid: number;
  swpPaid: number;
  patientName: string;
  displayNumber: string;
  isAdvance: number;
  dateTime: string;
  fullName: string;
}

export interface InvestigationReportRow {
  id: number,
  patId: number,
  billDisplay: string,
  billNo: string,
  cashPaid: number,
  swpPaid: number,
  total: number,
  pay: number,
  balance: number,
  totDisc: number,
  dateTime: string,
  patientName: string,
  displayNumber: string,
  fullName: string
}
export interface IpCollectionReportRow {
  id: number,
  patId: number,
  billDisplay: string,
  billNo: string,
  cashPaid: number,
  swpPaid: number,
  advAdj: number,
  total: number,
  pay: number,
  balance: number,
  totDisc: number,
  dateTime: string,
  patientName: string,
  displayNumber: string,
  fullName: string
}
export interface InvestigationReturnReportRow {
  id: number,
  patId: number,
  billDisplay: string,
  billNo: string,
  paid: number,
  total: number,
  pay: number,
  balance: number,
  totDisc: number,
  dateTime: string,
  patientName: string,
  displayNumber: string,
  fullName: string
}

export interface InvestigationDueCollectReportRow {
  id: number,
  patId: number,
  billDisplay: string,
  cashPaid: number,
  swpPaid: number,
  dateTime: string,
  patientName: string,
  displayNumber: string,
  fullName: string
}

export interface PharmacyCollectReportRow {
  patId: number,
  opNo: string,
  patName: string,
  billId: number,
  total: number,
  pay: number,
  disc: number,
  paid: number,
  balance: number,
  cashPaid: string,
  bankPaid: string,
  id: number,
  billDisplay: string,
  billNo: string,
  dateTime: string,
  fullName: string,
  refNo: string
}

export interface PharmacyReturnCollectReportRow {
  phReturnId: number,
  patId: number,
  billDisplay: string,
  billNo: string,
  paid: number,
  total: number,
  pay: number,
  balance: number,
  totDisc: number,
  dateTime: string,
  patientName: string,
  displayNumber: string,
  fullName: string
}

export interface PharmacyDueCollectReportRow {
  id: number,
  patId: number,
  billDisplay: string,
  cashPaid: number,
  swpPaid: number,
  dateTime: string,
  patientName: string,
  displayNumber: string,
  fullName: string,
  refNo: string
}

export interface LabCollectReportRow {
  id: number,
  patId: number,
  billDisplay: string,
  billNo: string,
  cashPaid: number,
  swpPaid: number,
  total: number,
  pay: number,
  balance: number,
  totDisc: number,
  dateTime: string,
  patientName: string,
  displayNumber: string,
  fullName: string,
  refNo: string
}

export interface LabReturnCollectReportRow {
  id: number,
  patId: number,
  retDisplay: string,
  billNo: string,
  paid: number,
  total: number,
  pay: number,
  balance: number,
  totDisc: number,
  dateTime: string,
  patientName: string,
  displayNumber: string,
  fullName: string
}

export interface LabDueCollectReportRow {
  id: number,
  patId: number,
  billDisplay: string,
  cashPaid: number,
  swpPaid: number,
  dateTime: string,
  patientName: string,
  displayNumber: string,
  fullName: string,
  refNo: string
}

export interface DueCollectionReportRow {
  date: string;
  billNo: string;
  amount: number;
  patientName: string;
  opNo: string;
}
export interface RegistrationCollectionRow {
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

export interface RegistrationDueCollectionRow {
  id: number;
  patId: number;
  billDisplay: string;
  cashPaid: number;
  swpPaid: number;
  dateTime: string;
  patientName: string;
  displayNumber: string;
  fullName: string;
  refNo: string;
}
export interface CancelBillRow {
  finalBillId: number;
  patId: number;
  visitId: number;
  ipId: number;
  total: number;
  totDisc: number;
  pay: number;
  paid: number;
  balance: number;
  dateTime: string;
  uid: number;
  userName: string;
  patientName: string;
  opNo: number;
}
export class CashCounterApiService {
  private httpWrapper: HttpClientWrapper;

  constructor() {
    this.httpWrapper = new HttpClientWrapper();
  }

  // Investigation Group APIs
  public saveInvestigationGroup = async (payload: {
    name: string;
    incomeHead: number;
    orgId: number;
  }) => {
    return await this.httpWrapper.post(
      "v1/cash-counter/saveInvestigationGroup",
      payload
    );
  };

  public updateInvestigationGroup = async (
    id: number,
    payload: {
      name: string;
      incomeHead: number;
      orgId: number;
      grp?: number;
      isGroup?: number;
      rate?: number;
      charity?: number;
      pvtRate?: number;
      pvtCharity?: number;
      isEditable?: number;
      isBlocked?: boolean;
      isSurgery?: boolean;
      isOpd?: number;
      useInClinical?: number;
    }
  ) => {
    return await this.httpWrapper.put(
      `v1/cash-counter/updateInvestigationGroup/${id}`,
      payload
    );
  };

  public fetchAllInvestigationGroups = async () => {
    const response = await this.httpWrapper.get(
      "v1/cash-counter/fetchAllInvestigationGroups"
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? data : [];
  };

  // Shared APIs
  public fetchAccountHeads = async () => {
    const response = await this.httpWrapper.get("v1/systemAdmin/fetchAccountHeads");
    const data = response?.data || response || [];
    return Array.isArray(data) ? data : [];
  };

  // Procedure APIs
  public saveProcedure = async (payload: {
    name: string;
    grp: number;
    incomeHead: number;
    orgId: number;
    isBlocked: number;
    rate: number;
    privateRate: number;
    isEditable: number;
  }) => {
    return await this.httpWrapper.post("v1/cash-counter/saveProcedure", payload);
  };

  public updateProcedure = async (
    id: number,
    payload: {
      name: string;
      grp: number;
      incomeHead: number;
      orgId: number;
      isBlocked: number;
      rate: number;
      privateRate: number;
      isEditable: number;
    }
  ) => {
    return await this.httpWrapper.put(`v1/cash-counter/updateProcedure/${id}`, payload);
  };

  public fetchAllProcedures = async () => {
    const response = await this.httpWrapper.get("v1/cash-counter/fetchAllProcedures");
    const data = response?.data || response || [];
    return Array.isArray(data) ? data : [];
  };

  public fetchProceduresForBilling = async (accHeadId: number, searchTerm: string) => {
    const response = await this.httpWrapper.get(
      `v1/cash-counter/fetchProceduresForBilling?accHeadId=${accHeadId}&searchTerm=${encodeURIComponent(searchTerm)}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? data : [];
  };

  public fetchMedicinesForBilling = async (phModId: number, searchTerm: string) => {
    const response = await this.httpWrapper.get(
      `v1/cash-counter/fetchMedicinesForBilling?phModId=${phModId}&searchTerm=${encodeURIComponent(searchTerm)}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? data : [];
  };

  public fetchBatchDetailsByProdsId = async (prodsId: number, storeId: number = 1) => {
    const response = await this.httpWrapper.get(
      `v1/cash-counter/fetchBatchDetailsByProdsId?prodsId=${prodsId}&storeId=${storeId}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? data : [];
  };

  public fetchLabTestsForBilling = async (headId: number, searchTerm: string) => {
    const response = await this.httpWrapper.get(
      `v1/cash-counter/fetchLabTestsForBilling?headId=${headId}&searchTerm=${encodeURIComponent(searchTerm)}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? data : [];
  };

  public fetchLabTestByCode = async (headId: number, testCode: string) => {
    const response = await this.httpWrapper.get(
      `v1/cash-counter/fetchLabTestsForBilling?headId=${headId}&testCode=${encodeURIComponent(testCode)}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? data : [];
  };

  // Billing APIs
  public saveBilling = async (payload: {
    patientId: number;
    visitId: number;
    ipId: number;
    isOp: number;
    doctorId: number;
    discountId: number;
    debitId: number;
    investigationItems: Array<{
      groupId: number;
      particularId: number;
      quantity: number;
      rate: number;
      discount: number;
    }>;
    pharmacyItems: Array<{
      prodsId: number;
      batchId: number;
      units: number;
      mrp: number;
      total: number;
      discountAmt: number;
      storeId: number;
      taxType: number;
      sgstPer: number;
      cgstPer: number;
      igstPer: number;
    }>;
    labItems: Array<{
      testId: number;
      testName: string;
      specId: number;
      deptId: number;
      rate: number;
      units: number;
      note: string;
    }>;
    ipItems: Array<{
      particulars: string;
      amt: number;
      accHeadId: number;
      headAmt: number;
      numberOfDays: number;
    }>;
    payments: Array<{
      paymentMode: string;
      bankId: number;
      transType: number;
      refNo: string;
      total: number;
      discount: number;
      payable: number;
      cashPaid: number;
      bankPaid: number;
      staffPaid: number;
      companyPaid: number;
      dueAmt: number;
    }>;
    note: string;
    userId: number;
    systemIp: string;
    isAdvance: number;
    age: string;
    opNo: string;
    refDr: number;
    placeColl: string;
  }) => {
    return await this.httpWrapper.post("v1/cash-counter/saveBilling", payload);
  };

  // Fetch constant charges for IP patients
  public fetchConstantCharges = async (
    ipId: number,
    admissionDate: string,
    dischargeDate: string
  ) => {
    return await this.httpWrapper.get(
      `v1/cash-counter/fetchConstantCharges?ipId=${ipId}&admissionDate=${admissionDate}&dischargeDate=${dischargeDate}`
    );
  };

  // Fetch IP Bill Order Details
  public fetchIpBillOrderDetails = async (patId: number, ipKey: number) => {
    return await this.httpWrapper.get(
      `v1/cash-counter/fetchIpBillOrderDetails?patId=${patId}&ipKey=${ipKey}`
    );
  };

  // Generate IP Bill Order
  public generateIpBillOrder = async (payload: {
    patId: number;
    ipkey: number; // Backend API expects lowercase 'ipkey'
    amt: number;
    discount: number;
    advance: number;
    prevBalance: number;
    uid: number;
    isFinal: number;
    isConstantChargesCalculated: number;
    headId: number;
    details: Array<{
      particulars: string;
      amt: number;
      accHeadId: number;
      headAmt: number;
      numberOfDays: number;
    }>;
  }) => {
    return await this.httpWrapper.post("v1/cash-counter/generateIpBillOrder", payload);
  };

  // Cancel IP Bill Order
  public cancelIpBillOrder = async (patId: number, ipKey: number) => {
    return await this.httpWrapper.put(
      `v1/cash-counter/cancelIpBillOrder?patId=${patId}&ipKey=${ipKey}`
    );
  };

  // Fetch due details for IP patients
  public fetchDueDetails = async (
    patId: number
  ) => {
    return await this.httpWrapper.get(
      `v1/cash-counter/fetchDueDetails?patId=${patId}`
    );
  };

  // Fetch advance payment details for IP patients
  public fetchAdvancePaymentDetails = async (
    patId: number,
    visitId: string
  ) => {
    return await this.httpWrapper.get(
      `v1/cash-counter/fetchAdvancePaymentDetails?patId=${patId}&visitId=${visitId}`
    );
  };

  // SaveAdvanceReturn APIs
  public saveAdvanceReturn = async (payload: {
    patientId: number;
    visitId: number;
    ipId: number;
    returnAmount: number;
    note: string;
    userId: number;
    systemIp: string;
    paymentMode: string;
    cashReturned: number;
  }) => {
    return await this.httpWrapper.post("v1/cash-counter/saveAdvanceReturn", payload);
  };

  // Due Collection APIs
  public updateDueBalance = async (payload: {
    orgId: number;
    patId: number;
    visitId: number;
    ipId: number;
    amount: number;
    totalDiscount: number;
    note: string;
    userId: number;
    systemIp: string;
    paymentMode: string;
    cashPaid: number;
    bankPaid: number;
    bankId: number;
    refNo: string;
    transType: number;
  }) => {
    return await this.httpWrapper.put("v1/cash-counter/updateDueBalance", payload);
  };

  public saveDueCollection = async (payload: {
    orgId: number,
    patientId: number,
    visitId: number,
    ipId: number,
    collectionAmount: number,
    totalDiscount: number,
    note: string,
    userId: number,
    systemIp: string,
    paymentMode: string;
    cashPaid: number;
    bankPaid: number;
    bankId?: number;
    refNo?: string;
    transType?: number;
    bills: Array<{
      billType: number,
      billId: number,
      finalBillId: number,
      collectedAmount: number;
      discountAmount: number;
    }>;
  }) => {
    return await this.httpWrapper.post("v1/cash-counter/saveDueCollection", payload);
  };


  public fetchUserDayEndReport = async (dateFrom: string, dateTo: string) => {
    const response = await this.httpWrapper.get(
      `v1/cash-counter/dayEndCollectionReport?dateFrom=${dateFrom}&dateTo=${dateTo}`
    );
    const data = response?.data || response || {};
    return {
      dayEndCollectionReport: Array.isArray(data?.dayEndCollectionReport) ? data.dayEndCollectionReport : [],
      companyReceivablesSummary: Array.isArray(data?.companyReceivablesSummary) ? data.companyReceivablesSummary : [],
    };
  };

    public fetchExPhDayEndCollectionReport = async (dateFrom: string, dateTo: string) => {
    const response = await this.httpWrapper.get(
      `v1/cash-counter/fetchExPhDayEndCollectionReport?dateFrom=${dateFrom}&dateTo=${dateTo}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? data : [];
  };

    public fetchBillWiseCollectionDetails = async (dateFrom: string, dateTo: string, userId: number) => {
    const response = await this.httpWrapper.get(
      `v1/cash-counter/fetchBillWiseCollectionDetails?dateFrom=${dateFrom}&dateTo=${dateTo}&userId=${userId}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? data : [];
  };

  public fetchDayEndPharmacyCollectionReport = async (dateFrom: string, dateTo: string) => {
    const response = await this.httpWrapper.get(
      `v1/cash-counter/fetchDayEndPharmacyCollectionReport?dateFrom=${dateFrom}&dateTo=${dateTo}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? data : [];
  };

  public fetchBillTypeWiseCollection = async (dateFrom: string, dateTo: string) => {
    const response = await this.httpWrapper.get(
      `v1/cash-counter/fetchBillTypeWiseCollection?dateFrom=${dateFrom}&dateTo=${dateTo}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? data : [];
  };

   public fetchPhBillTypeWiseCollection = async (dateFrom: string, dateTo: string) => {
    const response = await this.httpWrapper.get(
      `v1/cash-counter/fetchPhBillTypeWiseCollection?dateFrom=${dateFrom}&dateTo=${dateTo}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? data : [];
  };

     public fetchExPhBillTypeWiseCollection = async (dateFrom: string, dateTo: string) => {
    const response = await this.httpWrapper.get(
      `v1/cash-counter/fetchExPhBillTypeWiseCollection?dateFrom=${dateFrom}&dateTo=${dateTo}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? data : [];
  };

  public fetchRegistrationCollection = async (dateFrom: string, dateTo: string) => {
    const response = await this.httpWrapper.get(
      `v1/cash-counter/fetchRegistrationCollection?dateFrom=${dateFrom}&dateTo=${dateTo}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? data : [];
  };

  public fetchInvestigationCollection = async (dateFrom: string, dateTo: string) => {
    const response = await this.httpWrapper.get(
      `v1/cash-counter/fetchInvestigationCollection?dateFrom=${dateFrom}&dateTo=${dateTo}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? data : [];
  };

  public fetchRegistrationDueCollection = async (dateFrom: string, dateTo: string): Promise<RegistrationDueCollectionRow[]> => {
    const response = await this.httpWrapper.get(
      `v1/cash-counter/fetchRegistrationDueCollection?dateFrom=${dateFrom}&dateTo=${dateTo}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? (data as RegistrationDueCollectionRow[]) : [];
  };
  public fetchIpBillCollection = async (dateFrom: string, dateTo: string) => {
    const response = await this.httpWrapper.get(
      `v1/cash-counter/fetchIpBillCollection?dateFrom=${dateFrom}&dateTo=${dateTo}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? data : [];
  };

  public fetchPharmacyCollection = async (dateFrom: string, dateTo: string) => {
    const response = await this.httpWrapper.get(
      `v1/cash-counter/fetchPharmacyCollectionReport?dateFrom=${dateFrom}&dateTo=${dateTo}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? data : [];
  };

  public fetchLabCollection = async (dateFrom: string, dateTo: string) => {
    const response = await this.httpWrapper.get(
      `v1/cash-counter/fetchLabCollection?dateFrom=${dateFrom}&dateTo=${dateTo}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? data : [];
  };

  public fetchDueCollectionRegister = async (dateFrom: string, dateTo: string) => {
    const response = await this.httpWrapper.get(
      `v1/cash-counter/fetchDueCollectionRegister?dateFrom=${dateFrom}&dateTo=${dateTo}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? data : [];
  };

  public fetchAdvanceReceived = async (dateFrom: string, dateTo: string) => {
    const response = await this.httpWrapper.get(
      `v1/cash-counter/fetchAdvanceReceived?dateFrom=${dateFrom}&dateTo=${dateTo}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? data : [];
  };

  public fetchAdvanceReturnReport = async (dateFrom: string, dateTo: string): Promise<AdvanceReturnReportRow[]> => {
    const response = await this.httpWrapper.get(
      `v1/cash-counter/fetchAdvanceReturnReport?dateFrom=${dateFrom}&dateTo=${dateTo}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? data as AdvanceReturnReportRow[] : [];
  };

  public fetchAdvanceReport = async (dateFrom: string, dateTo: string): Promise<AdvanceReportRow[]> => {
    const response = await this.httpWrapper.get(
      `v1/cash-counter/fetchAdvanceReport?dateFrom=${dateFrom}&dateTo=${dateTo}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? data as AdvanceReportRow[] : [];
  };

  public fetchDueCollectionReport = async (dateFrom: string, dateTo: string): Promise<DueCollectionReportRow[]> => {
    const response = await this.httpWrapper.get(
      `v1/cash-counter/fetchDueCollectionReport?dateFrom=${dateFrom}&dateTo=${dateTo}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? data as DueCollectionReportRow[] : [];
  };

  public fetchDueRegister = async (dateFrom: string, dateTo: string) => {
    const response = await this.httpWrapper.get(
      `v1/cash-counter/fetchDueRegister?dateFrom=${dateFrom}&dateTo=${dateTo}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? data : [];
  };

  public fetchStayChargesByIpId = async (ipId: number) => {
    const response = await this.httpWrapper.get(
      `v1/cash-counter/fetchStayChargesByIpId/${ipId}`
    );
    return response?.data || response || [];
  };

  public fetchPatientOPIPBills = async (visitId: number) => {
    const response = await this.httpWrapper.get(
      `v1/cash-counter/getPatientOPIPBills/${visitId}`
    );
    return response?.data || response || [];
  };

  public fetchBillViewWithType = async (finalBillId: number) => {
    const response = await this.httpWrapper.get(
      `v1/cash-counter/fetchBillViewWithType/${finalBillId}`
    );
    return response || {};
  };
    public fetchPatientDetailsByFinalBillId = async (finalBillId: number) => {
    const response = await this.httpWrapper.get(
      `v1/cash-counter/fetchPatientDetailsByFinalBillId/${finalBillId}`
    );
    return (response?.data || response || null) as BillPatientDetails | null;
  };
  public fetchLabTestTemplates = async () => {
    const response = await this.httpWrapper.get(
      `v1/cash-counter/fetchLabTestTemplates`
    );
    return response?.data || response || {};
  };
  public fetchBillsForCancel = async (opNo: string, dateFrom: string, dateTo: string): Promise<CancelBillRow[]> => {
    const response = await this.httpWrapper.get(
      `v1/cash-counter/fetchBillsForCancel?opNo=${opNo}&dateFrom=${dateFrom}&dateTo=${dateTo}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? data : [];
  };

  public cancelBill = async (finalBillId: number, reason: string) => {
    const response = await this.httpWrapper.put(
      `v1/cash-counter/cancelBill`,
      { finalBillId, reason }
    );
    return response?.data || response;
  };
  public fetchInvTemplates = async () => {
    const response = await this.httpWrapper.get(
      `v1/cash-counter/fetchInvTemplates`
    );
    return response?.data || response || {};
  };

  public fetchPharmacyTemplates = async () => {
    const response = await this.httpWrapper.get(
      `v1/cash-counter/fetchPharmacyTemplates`
    );
    return response?.data || response || {};
  };

  public fetchOrderDetails = async (patientId: string, visitId: string) => {
    const response = await this.httpWrapper.get(
      `v1/cash-counter/fetchOrderDetails?patientId=${patientId}&visitId=${visitId}`
    );
    return response?.data || response || {};
  };

  public fetchAllInvestigationPendingOrders = async () => {
    const response = await this.httpWrapper.get(
      'v1/cash-counter/fetchAllInvestigationPendingOrders'
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? data : [];
  };

  public fetchAllLabPendingOrders = async () => {
    const response = await this.httpWrapper.get(
      'v1/cash-counter/fetchAllLabPendingOrders'
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? data : [];
  };

  public fetchIPFinalBillOrders = async () => {
    const response = await this.httpWrapper.get(
      'v1/cash-counter/fetchIPFinalBillOrders'
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? data : [];
  };

  public fetchAllPharmacyPendingOrders = async () => {
    const response = await this.httpWrapper.get(
      'v1/cash-counter/fetchAllPharmacyPendingOrders'
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? data : [];
  };

  public cancelPendingOrder = async (orderId: number, orderType: string) => {
    const response = await this.httpWrapper.put(
      `v1/cash-counter/cancelPendingOrder?orderId=${orderId}&orderType=${orderType}`,
      {}
    );
    return response;
  };

  // order APIs
  public saveUpdateOrder = async (payload: {
    patientId: number,
    visitId: number,
    ipId: number,
    doctorId: number,
    userId: number,
    systemIp: string,
    remark: string,
    investigationItems: Array<{
      groupId: number,
      particularId: number;
      quantity: number;
      rate: number;
      discount: number;
      total: number;
    }>;
    labItems: Array<{
      testId: number,
      testCode: string;
      deptId: number;
      rate: number;
      discount: number;
      units: number;
    }>;
    pharmacyItems: Array<{
      prodsId: number,
      batchId: number;
      units: number;
      mrp: number;
      total: number;
      storeId: number;
    }>;
  }) => {
    return await this.httpWrapper.post("v1/cash-counter/saveUpdateOrders", payload);
  };
  
  // company receivables
  public fetchBankNames = async () => {
    const response = await this.httpWrapper.get("v1/cash-counter/fetchBankNames");
    return response?.data || response || [];
  };
  public fetchCompanyReceivables = async (companyId: string) => {
    const response = await this.httpWrapper.get(
      `v1/cash-counter/fetchCompanyReceivables?headId=${companyId}`
    );
    return response?.data || response || {};
  };

  public updateCompanyToDue = async (payload: { finalBillId: number; headId: number }) => {
    const response = await this.httpWrapper.put(
      "v1/cash-counter/updateCompanyToDue",
      payload
    );
    return response?.data || response;
  };

  public updateCompanyHeadByFinalBillId = async (payload: { finalBillId: number; headId: number; note: string }) => {
    const response = await this.httpWrapper.put(
      "v1/cash-counter/updateCompanyHeadByFinalBillId",
      payload
    );
    return response?.data || response;
  };

  public saveCompanyPayables = async (payload: {
    noteNo: string;
    headId: number;
    orgId: number;
    total: number;
    isSubmitted: number;
    discount: number;
    finalAmt: number;
    isBank: number;
    chequeNo: string;
    bankId: number;
    details: Array<{
      comapnyAccountId: number;
      amt: number;
      disc: number;
      modId: number;
      billId: number;
      billDisplay: string;
      patId: number;
    }>;
  }) => {
    return await this.httpWrapper.post(
      "v1/cash-counter/saveCompanyPayables",
      payload
    );
  };

  public changeCreditBills = async (payload: {
    headId: number;
    finalBillId: number;
    amt: number;
    patId: number;
    visitId: number;
    note: string;
  }) => {
    return await this.httpWrapper.post(
      "v1/cash-counter/changeCreditBills",
      payload
    );
  };

  // Return Billing APIs
  public fetchPatientBillDetailsForReturn = async (opNo: string) => {
    const response = await this.httpWrapper.get(
      `v1/clinical-information/patientWiseBillDetailsforReturn/${encodeURIComponent(opNo)}`
    );
    return response?.data || response || {};
  };

  public saveLabInvSalesReturn = async (payload: {
    patId: number;
    visitId: number;
    ipId: number;
    reason: string;
    opno: string;
    lab: Array<{
      labBillsDetId: number;
      labBillsId: number;
      specId: number;
      testId: number;
      returnQty: number;
      rate: number;
    }>;
    inv: Array<{
      invBillsDetId: number;
      invBillsId: number;
      groupId: number;
      particularId: number;
      returnQty: number;
      rate: number;
    }>;
  }) => {
    return await this.httpWrapper.post(
      "v1/cash-counter/saveLabInvSalesReturn",
      payload
    );
  };

  public fetchInvestigationReport = async (dateFrom: string, dateTo: string): Promise<InvestigationReportRow[]> => {
    const response = await this.httpWrapper.get(
      `v1/cash-counter/fetchInvestigationReport?dateFrom=${dateFrom}&dateTo=${dateTo}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? data as InvestigationReportRow[] : [];
  };

  public fetchInvestigationReturnReport = async (dateFrom: string, dateTo: string): Promise<InvestigationReturnReportRow[]> => {
    const response = await this.httpWrapper.get(
      `v1/cash-counter/fetchInvestigationReturnReport?dateFrom=${dateFrom}&dateTo=${dateTo}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? data as InvestigationReturnReportRow[] : [];
  };

  public fetchInvestigationDueCollectReport = async (dateFrom: string, dateTo: string): Promise<InvestigationDueCollectReportRow[]> => {
    const response = await this.httpWrapper.get(
      `v1/cash-counter/fetchInvestigationDueCollectReport?dateFrom=${dateFrom}&dateTo=${dateTo}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? data as InvestigationDueCollectReportRow[] : [];
  };
  
  public fetchPharmacyCollectionReport = async (dateFrom: string, dateTo: string): Promise<PharmacyCollectReportRow[]> => {
    const response = await this.httpWrapper.get(
      `v1/cash-counter/fetchPharmacyCollectionReport?dateFrom=${dateFrom}&dateTo=${dateTo}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? data as PharmacyCollectReportRow[] : [];
  };
  
  public fetchPharmacyReturnCollectionReport = async (dateFrom: string, dateTo: string): Promise<PharmacyReturnCollectReportRow[]> => {
    const response = await this.httpWrapper.get(
      `v1/cash-counter/fetchPharmacyReturnCollectionReport?dateFrom=${dateFrom}&dateTo=${dateTo}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? data as PharmacyReturnCollectReportRow[] : [];
  };
  
  public fetchPharmacyDueCollectReport = async (dateFrom: string, dateTo: string): Promise<PharmacyDueCollectReportRow[]> => {
    const response = await this.httpWrapper.get(
      `v1/cash-counter/fetchPharmacyDueCollectReport?dateFrom=${dateFrom}&dateTo=${dateTo}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? data as PharmacyDueCollectReportRow[] : [];
  };
  
  public fetchLabCollectionReport = async (dateFrom: string, dateTo: string): Promise<LabCollectReportRow[]> => {
    const response = await this.httpWrapper.get(
      `v1/cash-counter/fetchLabCollectionReport?dateFrom=${dateFrom}&dateTo=${dateTo}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? data as LabCollectReportRow[] : [];
  };
  
  public fetchLabReturnCollectionReport = async (dateFrom: string, dateTo: string): Promise<LabReturnCollectReportRow[]> => {
    const response = await this.httpWrapper.get(
      `v1/cash-counter/fetchLabReturnCollectionReport?dateFrom=${dateFrom}&dateTo=${dateTo}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? data as LabReturnCollectReportRow[] : [];
  };
  
  public fetchLabDueCollectReport = async (dateFrom: string, dateTo: string): Promise<LabDueCollectReportRow[]> => {
    const response = await this.httpWrapper.get(
      `v1/cash-counter/fetchLabDueCollectReport?dateFrom=${dateFrom}&dateTo=${dateTo}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? data as LabDueCollectReportRow[] : [];
  };
  public fetchIpCollectionReport = async (dateFrom: string, dateTo: string): Promise<IpCollectionReportRow[]> => {
    const response = await this.httpWrapper.get(
      `v1/cash-counter/fetchIpCollectionReport?dateFrom=${dateFrom}&dateTo=${dateTo}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? data as IpCollectionReportRow[] : [];
  };
  
  public fetchReimburshmentPhDetails = async (visitId: number) => {
    const response = await this.httpWrapper.get(
      `v1/cash-counter/fetchReimburshmentPhDetails?visitId=${visitId}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? data : [];
  };

  public fetchReimburshmentInvLabDetails = async (visitId: number) => {
    const response = await this.httpWrapper.get(
      `v1/cash-counter/fetchReimburshmentInvLabDetails?visitId=${visitId}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? data : [];
  };
  public fetchCompanyPaidDetailsBetweenDates = async (fromDate: string, toDate: string) => {
    const response = await this.httpWrapper.get(
      `v1/cash-counter/fetchCompanyPaidDetailsBetweenDates?fromDate=${fromDate}&toDate=${toDate}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? data : [];
  };
    public fetchAllBillDetailsByFinalBillId = async (finalBillIds: number[]) => {
    const query = finalBillIds.map(id => `finalBillIds=${id}`).join("&");
    const response = await this.httpWrapper.get(
      `v1/cash-counter/fetchAllBillDetailsByFinalBillId?${query}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? data : [];
  };
  public updateIpBillOrder = async (
    payload: {
      billId: number;
      amt: number;
      discount: number;
      advance: number;
      prevBalance: number;
      uid: number;
      isFinal: number;
      isConstantChargesCalculated: number;
      headId: number;
      details: Array<{
        particulars: string;
        amt: number;
        accHeadId: number;
        headAmt: number;
        numberOfDays: number;
      }>;
    }
  ) => {
    return await this.httpWrapper.put(
      `v1/cash-counter/updateIpBillOrder`,
      payload
    );
  };

  public savePackageConfiguration = async (payload: {
    packageName: string;
    packageDetails: Array<{
      headId: number;
      isOpPackage: number;
      isLab: number;
      noOfTest: number;
      isProcedure: number;
      noOfProcedure: number;
      packageCost: number;
      discount: number;
      packageDays: number;
      isMedicine: number;
      noOfMedicine: number;
      storeId: number;
      labDetails?: Array<{
        testId: number;
        noOfTimes: number;
        rate: number;
      }>;
      procedureDetails?: Array<{
        procedureId: number;
        noOfTimes: number;
        rate: number;
      }>;
      medicineDetails?: Array<{
        prodsId: number;
        units: number;
      }>;
    }>;
  }) => {
    return await this.httpWrapper.post("v1/systemAdmin/savePackageConfiguration", payload);
  };
    // Staff Company APIs
  public createStaffCompany = async (name: string) => {
    return await this.httpWrapper.post(
      `v1/cash-counter/createStaffCompany?name=${encodeURIComponent(name)}`,
      {}
    );
  };
    public fetchAllPackageDetails = async () => {
    const response = await this.httpWrapper.get("v1/systemAdmin/fetchAllPackageDetails");
    const data = response?.data || response || [];
    return Array.isArray(data) ? data : [];
  };

  public fetchDiscountBillDetails = async (
    dateFrom: string,
    dateTo: string,
    billType: DiscountBillType = "all"
  ): Promise<DiscountBillDetailsResponse> => {
    const response = await this.httpWrapper.get(
      `v1/cash-counter/fetchDiscountBillDetails?dateFrom=${encodeURIComponent(dateFrom)}&dateTo=${encodeURIComponent(dateTo)}&billType=${encodeURIComponent(billType)}`
    );
    const data = response?.data || response || {};
    return {
      ph: Array.isArray(data?.ph) ? data.ph : [],
      inv: Array.isArray(data?.inv) ? data.inv : [],
      lab: Array.isArray(data?.lab) ? data.lab : [],
      ip: Array.isArray(data?.ip) ? data.ip : [],
      rec: Array.isArray(data?.rec) ? data.rec : [],
      credit: Array.isArray(data?.credit) ? data.credit : [],
    };
  };
}

export default CashCounterApiService;

export interface DiscountBillDetails{
  patientName: string;
  opNo: string;
  sex: string;
  dob: string;
  patientAccount: string;
  billNo: string;
  total: number;
  disc: number;
  discAmt: number | null;
  userName: string;
  billType: string;
}

export type DiscountBillType = "ph" | "inv" | "lab" | "ip" | "rec" | "credit" | "all";

export interface DiscountBillDetailsResponse {
  ph: DiscountBillDetails[];
  inv: DiscountBillDetails[];
  lab: DiscountBillDetails[];
  ip: DiscountBillDetails[];
  rec: DiscountBillDetails[];
  credit: DiscountBillDetails[];
}