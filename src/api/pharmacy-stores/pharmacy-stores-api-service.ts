import HttpClientWrapper from "../http-client-wrapper"

export interface SubModuleResponse {
  modGroupId: number;
  modGroupName: string;
  subModId: number;
  subModName: string;
  masterId: number;
}

export interface PatientDetailsResponse {
  patId: number;
  displayNumber: string;
  name: string;
  secName: string;
  sex: string;
  age: string;
  dob: string;
  email: string;
  phone: string;
  add1: string;
  add2: string;
  pincode: string;
  gname: string;
  guardianType: string;
  village: string;
  post: string;
  districtId: number;
  district: string;
  state: string;
  country: string;
  govIdType: string;
  govIdNo: string;
  isInOp: boolean;
  isInIp: boolean;
  isActive: boolean;
  isDead: boolean;
  statusMessage: string;
  lastVisitId: number;
  doctorId: number;
  lastVisitDate: string;
  doctorName: string;
  departmentId: number;
  departmentName: string;
  complaintName: string;
  debitId: number;
  debitHead: string;
  accountCategory: string;
  ipId: number;
  ipNo: string;
  wardName: string;
  bedNo: string;
  admitDateTime: string;
  advBalance: number;
  dueBalance: number;
}

export interface OpVisitResponse {
  opVisitId: number;
  patId: number;
  doctorId: number;
  doctorName: string;
  datetime: string;
}

export interface PharmacyBillDetailsResponse {
  visitId: number;
  finalBillId: number;
  billDateTime: string;
  paid: number;
  due: number;
  storeId: number;
  phBillId: number;
  typeId: number;
  accountType: string;
  billDiscount: number;
  medicineDetails: PharmacyBillDetailsItem[];
}

export interface PharmacyBillDetailsItem {
  phBillsDetailId: number;
  prodsId: number;
  batchId: number;
  medicineName: string;
  batchNo: string;
  expiryDate: string;
  billedQuantity: number;
  retUnits: number;
  availableForReturn: number;
  mrp: number;
  isDispense: number;
  discountAmt: number;
}

export interface SaveSalesReturnRequest {
  patId: number;
  visitId: number;
  ipId: number;
  reasonToReturn: string;
  note: string;
  opno: string;
  storeId: number;
  totalDisc: number;
  totalReturnAmt: number;
  medicines: BillDetailsItem[];
}

export interface BillDetailsItem {
  finalBillId: number;
  phBillsId: number;
  paidType: string;
  billDisc: number;
  billReturnAmt: number;
  medicinesDetails: BillMedicineDetailsItem[];
}

export interface BillMedicineDetailsItem {
  phBillsDetId: number;
  prodsId: number;
  batchId: number;
  returnQty: number;
  mrp: number;
  discountAmt: number;
}

export interface SalesMedicineItem {
  medicineName: string;
  batchNo: string;
  expiryDate: string;
  units: number;
  mrp: number;
  total: number;
  sgstPer: number;
  cgstPer: number;
  igstPer: number;
  sgstAmt: number;
  cgstAmt: number;
  igstAmt: number;
  discountAmt: number;
}

export interface SalesDetailsResponse {
  finalBillId: number;
  billNo: string;
  patId: number;
  patientName: string;
  opNo: string;
  secondName: string;
  sex: string;
  visitId: number;
  dateTime: string;
  username: string;
  phBillId: number;
  total: number;
  pay: number;
  paid: number;
  discount: number;
  isIp: number;
  medicines: SalesMedicineItem[];
}

export interface MedWiseSalesDetailsResponse {
  finalBillId: number;
  billNo: string;
  billDateTime: string;
  patId: number;
  opNo: string;
  patientName: string;
  secondName: string;
  sex: string;
  visitId: number;
  username: string;
  isIp: number;
  medicineName: string;
  batchNo: string;
  expiryDate: string;
  units: number;
  retUnits: number;
  mrp: number;
  total: number;
  sgstPer: number;
  cgstPer: number;
  igstPer: number;
  sgstAmt: number;
  cgstAmt: number;
  igstAmt: number;
  discountAmt: number;
}

export interface SalesReturnDetailsResponse {
  finalBillId: number;
  billNo: string;
  patId: number;
  opNo: string;
  patientName: string;
  secondName: string;
  sex: string;
  visitId: number;
  dateTime: string;
  username: string;
  phReturnId: number;
  returnBillNo: string;
  total: number;
  pay: number;
  paid: number;
  discount: number;
  isIp: number;
  note: string;
  medicines: SalesMedicineItem[];
}

export interface SheduledDrugResponse {
  billNo: string;
  patientName: string;
  medicineName: string;
  batchNo: string;
  expiryDate: string;
  units: number;
  company: string;
  billDateTime: string;
  doctorName: string;
}

export class PharmacyStoresApiService {
  private httpWrapper: HttpClientWrapper;

  constructor() {
    this.httpWrapper = new HttpClientWrapper();
  }

  /**
   * Get sub-modules for a given module ID
   * @param moduleId - The module ID (e.g., 3 for Pharmacy Stores)
   * @returns Promise with array of sub-modules
   */
  async getSubModules(moduleId: number): Promise<SubModuleResponse[]> {
    try {
      //const url = `/v1/fetchSubModule/${moduleId}`;
      //   const response = await this.httpClient.get<SubModuleResponse[]>(
      //     `/v1/fetchSubModule/${moduleId}`
      //   );
      let url = `/v1/fetchSubModule/${moduleId}`;
      const response: any = await this.httpWrapper.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching pharmacy sub-modules:', error);
      throw error;
    }
  }

  /**
   * Fetch patient details by display number
   * @param displayNumber - The patient display number
   * @returns Promise with patient details
   */
  async fetchPatientDetails(displayNumber: string): Promise<PatientDetailsResponse> {
    try {
      const url = `/v1/systemAdmin/fetchPatientDetails/${displayNumber}`;
      const response: any = await this.httpWrapper.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching patient details:', error);
      throw error;
    }
  }

  /**
   * Fetch OP visits by OP number
   * @param opNo - The OP number
   * @returns Promise with array of OP visit records
   */
  async fetchOpVisitsByOpNo(opNo: string): Promise<OpVisitResponse[]> {
    try {
      const url = `/v1/medical-records/fetchOpVisitsByOpNo/${opNo}`;
      const response: any = await this.httpWrapper.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching OP visits:', error);
      throw error;
    }
  }

  /**
   * Fetch pharmacy bill details for return by visit ID
   * @param visitId - The visit ID
   * @returns Promise with array of pharmacy bill details
   */
  async fetchPharmacyBillDetailsForReturn(visitId: number): Promise<PharmacyBillDetailsResponse[]> {
    try {
      const url = `/v1/pharmacy/fetchPharmacyBillsDetailsForReturn/${visitId}`;
      const response: any = await this.httpWrapper.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching pharmacy bill details for return:', error);
      throw error;
    }
  }

  /**
   * Save sales return for pharmacy medicines
   * @param payload - The sales return request payload
   * @returns Promise with save response
   */
  async saveSalesReturn(payload: SaveSalesReturnRequest): Promise<any> {
    try {
      const url = `/v1/pharmacy/saveSalesReturn`;
      const response: any = await this.httpWrapper.post(url, payload);
      return response;
    } catch (error) {
      console.error('Error saving sales return:', error);
      throw error;
    }
  }

  async fetchSalesDetails(fromDate: string, toDate: string, storeId: number): Promise<SalesDetailsResponse[]> {
    try {
      const url = `/v1/pharmacy/fetchSalesDetails?fromDate=${fromDate}&toDate=${toDate}&storeId=${storeId}`;
      const response: any = await this.httpWrapper.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching sales details:', error);
      throw error;
    }
  }

  async fetchSalesReturnDetails(fromDate: string, toDate: string, storeId: number): Promise<SalesReturnDetailsResponse[]> {
    try {
      const url = `/v1/pharmacy/fetchSalesReturnDetails?fromDate=${fromDate}&toDate=${toDate}&storeId=${storeId}`;
      const response: any = await this.httpWrapper.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching sales return details:', error);
      throw error;
    }
  }
  
  async fetchMedWiseSalesDetails(fromDate: string, toDate: string, storeId: number,prodsId: number): Promise<MedWiseSalesDetailsResponse[]> {
    try {
      const url = `/v1/pharmacy/fetchSalesDetailsbyMedicinewise?fromDate=${fromDate}&toDate=${toDate}&storeId=${storeId}&prodsId=${prodsId}`;
      const response: any = await this.httpWrapper.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching medicine-wise sales details:', error);
      throw error;
    }
  }

  // dispense drug start
  public saveDispenseDrug = async (payload: {
    phBillId: number;
    productDetails: Array<{
      storeId: number;
      prodId: number;
      batchId: number;
      units: number;
    }>;
  }) => {
    return await this.httpWrapper.post(
      "v1/pharmacy/saveDispenseDrug",
      payload
    );
  };

  public fetchAllDispenseDrug = async (storeId : number) => {
    const response = await this.httpWrapper.get(
      `v1/pharmacy/fetchAllDispenseDrug?storeId=${storeId}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? data : [];
  };

  
  async fetchScheduleDrugReport(fromDate: string, toDate: string, fromTime: string, toTime: string, storeId: number, scheduleTypeId: number): Promise<SheduledDrugResponse[]> {
    try {
      const url = `/v1/pharmacy/fetchScheduleDrugReport?fromDate=${fromDate}&toDate=${toDate}&fromTime=${fromTime}&toTime=${toTime}&storeId=${storeId}&scheduleTypeId=${scheduleTypeId}`;
      const response: any = await this.httpWrapper.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching schedule drug report:', error);
      throw error;
    }
  }
    public fetchPreviousMedicineDetailsByPatId = async (patId: number): Promise<any[]> => {
    const response = await this.httpWrapper.get(
      `v1/pharmacy/fetchPreviousMedicineDetailsByPatId?patId=${patId}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? data : [];
  };
  // dispense drug end
}
