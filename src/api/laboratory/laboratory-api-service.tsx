import { encode } from "punycode";
import HttpClientWrapper from "../http-client-wrapper";

// ============================================
// LABORATORY API SERVICE
// ============================================


export interface PrintHeaderDetails {
  opNo: string,
  age: string,
  billDisplay: string,
  isIp: number,
  entDateTime: string,
  patientName: string,
  add1: string,
  add2: string,
  pincode: string,
  countryName: string,
  stateName: string,
  districtName: string,
  postName: string,
  villageName: string,
  talukName: string,
  gender: string,
  doctorName: string,
  departmentName: string,
  printedDateTime: string
} 

///////////////////////////////////

export class LaboratoryApiService {
  private httpWrapper: HttpClientWrapper;

  constructor() {
    this.httpWrapper = new HttpClientWrapper();
  }

  /*Lab Department start*/
  public fetchAllLabDepartments = async () => {
    const response = await this.httpWrapper.get(
      "v1/laboratory/fetchAllLabDepartments"
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? data : [];
  };

  public saveLabDepartment = async (payload: {
    deptName: string;
    deptDesc: string;
    shortName: string;
    isActive: number;
  }) => {
    return await this.httpWrapper.post(
      "v1/laboratory/saveLabDepartment",
      payload
    );
  };

  public updateLabDepartment = async (
    id: number,
    payload: {
      deptName: string;
      deptDesc: string;
      shortName: string;
      isActive: number;
    }
  ) => {
    return await this.httpWrapper.put(
      `v1/laboratory/updateLabDepartment/${id}`,
      payload
    );
  };
  /*Lab Department end*/

  /*Lab Specimen start*/
  public fetchAllLabSpecimen = async () => {
    const response = await this.httpWrapper.get(
      "v1/laboratory/fetchAllSpecimens"
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? data : [];
  };

  public saveLabSpecimen = async (payload: {
    specName: string;
    specDesc: string;
    uid: number;
  }) => {
    return await this.httpWrapper.post("v1/laboratory/saveSpecimen", payload);
  };

  public updateLabSpecimen = async (
    id: number,
    payload: {
      specName: string;
      specDesc: string;
      isBlocked: number;
      uid: number;
    }
  ) => {
    return await this.httpWrapper.put(
      `v1/laboratory/updateSpecimen/${id}`,
      payload
    );
  };
  /*Lab Specimen end*/
  /*Lab Antibiotic start*/
  public fetchAllLabAntibiotic = async () => {
    const response = await this.httpWrapper.get(
      "v1/laboratory/fetchAllAntibiotics"
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? data : [];
  };

  public saveLabAntibiotic = async (payload: {
    antName: string;
    antDesc: string;
    uid: number;
  }) => {
    return await this.httpWrapper.post("v1/laboratory/saveAntibiotic", payload);
  };

  public updateLabAntibiotic = async (
    id: number,
    payload: {
      antName: string;
      antDesc: string;
      isBlocked: number;
      uid: number;
    }
  ) => {
    return await this.httpWrapper.put(
      `v1/laboratory/updateAntibiotic/${id}`,
      payload
    );
  };
  /*Lab Antibiotic end*/
  /*Lab Bacteria start*/
  public fetchAllLabBacteria = async () => {
    const response = await this.httpWrapper.get(
      "v1/laboratory/fetchAllBacteria"
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? data : [];
  };

  public saveLabBacteria = async (payload: {
    bacteriaName: string;
    bacteriaDesc: string;
    uid: number;
  }) => {
    return await this.httpWrapper.post("v1/laboratory/saveBacteria", payload);
  };

  public updateLabBacteria = async (
    id: number,
    payload: {
      bacteriaName: string;
      bacteriaDesc: string;
      isBlocked: number;
      uid: number;
    }
  ) => {
    return await this.httpWrapper.put(
      `v1/laboratory/updateBacteria/${id}`,
      payload
    );
  };
  /*Lab Bacteria end*/
  /*Lab TestAdd start*/
  public fetchAllLabTestAdd = async () => {
    const response = await this.httpWrapper.get(
      "v1/laboratory/fetchAllLabTests"
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? data : [];
  };

  public saveLabTestAdd = async (payload: {
    deptId: number;
    name: string;
    testCode: string;
    specId: number;
    rate: number;
    testHrs: number;
    testMin: number;
    methodology: string;
    charity: number;
    privateRate: number;
    privateCharity: number;
    uid: number;
    isCulture: number;
    canDoManual: number;
    canDoSemi: number;
    canDoAuto: number;
    comment: number;
    picture: number;
    printIndividual: number;
    isEditable: number;
    isEditPrivate: number;
    setGeneral: number;
    setPrivate: number;
    generalRate: number;
    generalCharity: number;
    isOutside: number;
    isMaterial: number;
    fields: Array<{
      fieldName: string;
      fieldType: string;
      unit: string;
      testMethod: string;
      machine: string;
      normal: number;
      cutoff: number;
      cutoffGreater: string;
      cutoffLower: string;
      intervalFlag: number;
      interHigher: string;
      interInter: string;
      interLower: string;
      lineType: number;
      isNote: number;
      values: Array<{
        lowerBounds: number;
        upperBounds: number;
        cutoffVal: number;
        rangeFrom: number;
        rangeTo: number;
        note: string;
        fieldType: string;
        fromAge: number;
        fromAgeType: string;
        toAge: number;
        toAgeType: string;
        sex: string;
      }>;
    }>;
  }) => {
    return await this.httpWrapper.post(
      "v1/laboratory/saveLabTest",
      payload
    );
  };

  public updateLabTestAdd = async (
    id: number,
    payload: {
      deptId: number;
      name: string;
      testCode: string;
      specId: number;
      rate: number;
      testHrs: number;
      testMin: number;
      methodology: string;
      charity: number;
      privateRate: number;
      privateCharity: number;
      uid: number;
      isCulture: number;
      canDoManual: number;
      canDoSemi: number;
      canDoAuto: number;
      comment: number;
      picture: number;
      printIndividual: number;
      isEditable: number;
      isEditPrivate: number;
      setGeneral: number;
      setPrivate: number;
      generalRate: number;
      generalCharity: number;
      isOutside: number;
      isMaterial: number;
      fields: Array<{
        fieldName: string;
        fieldType: string;
        unit: string;
        testMethod: string;
        machine: string;
        normal: number;
        cutoff: number;
        cutoffGreater: string;
        cutoffLower: string;
        intervalFlag: number;
        interHigher: string;
        interInter: string;
        interLower: string;
        lineType: number;
        isNote: number;
        values: Array<{
          lowerBounds: number;
          upperBounds: number;
          cutoffVal: number;
          rangeFrom: number;
          rangeTo: number;
          note: string;
          fieldType: string;
          fromAge: number;
          fromAgeType: string;
          toAge: number;
          toAgeType: string;
          sex: string;
        }>;
      }>;
    }
  ) => {
    return await this.httpWrapper.put(
      `v1/laboratory/updateLabTest/${id}`,
      payload
    );
  };

  public blockLabTest = async (
    id: number,
    payload: {
      id: number;
    }
  ) => {
    return await this.httpWrapper.put(
      `v1/laboratory/blockLabTest/${id}`,
      payload
    );
  };

  public unBlockLabTest = async (
    id: number,
    payload: {
      id: number;
    }
  ) => {
    return await this.httpWrapper.put(
      `v1/laboratory/unblockLabTest/${id}`,
      payload
    );
  };
  /*Lab TestAdd end*/
  /*organisation charges start*/
  public fetchOrgCompanyCharges = async (id: number) => {
    const response = await this.httpWrapper.get(
      `v1/laboratory/fetchLabOrgChargesByTestId/${id}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? data : [];
  };

  public updateLabCompanyRates = async (
    id: number,
    payload: {
      charges: Array<{
        headId: number;
        rate: number;
        charity: number;
      }>;
    }
  ) => {
    return await this.httpWrapper.put(
      `v1/laboratory/updateLabOrgCharges/${id}`,
      payload
    );
  };
  /*organisation charges end*/
  /*edit test cost start*/
  public updateTestRates = async (
    id: number,
    payload: {
      generalRate: number;
      privateRate: number;
      generalCharity: number;
      privateCharity: number;
      generalEditable: number;
      privateEditable: number;
    }
  ) => {
    return await this.httpWrapper.put(
      `v1/laboratory/updateLabTestRateAndCharity/${id}`,
      payload
    );
  };
  /*edit test cost end*/
  /*save antibiotic template start*/
  public saveLabAntibioticTemplate = async (payload: {
    templateName: string;
    description: string;
    uid: number;
    antibioticIds: number[];
  }) => {
    return await this.httpWrapper.post(
      "v1/laboratory/saveAntibioticTemplate",
      payload
    );
  };

  public fetchAllLabAntibioticTemplates = async () => {
    const response = await this.httpWrapper.get(
      "v1/laboratory/fetchAllAntibioticTemplates"
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? data : [];
  };

  public updateLabAntibioticTemplate = async (
    id: number,
    payload: {
      templateName: string;
      description: string;
      uid: number;
      antibioticIds: number[];
    }
  ) => {
    return await this.httpWrapper.put(
      `v1/laboratory/updateAntibioticTemplate/${id}`,
      payload
    );
  };

  public blockLabAntibioticTemplate = async (id: number) => {
    return await this.httpWrapper.put(
      `v1/laboratory/blockAntibioticTemplate/${id}`
    );
  };

  public unBlockLabAntibioticTemplate = async (id: number) => {
    return await this.httpWrapper.put(
      `v1/laboratory/unblockAntibioticTemplate/${id}`
    );
  };
  /*save antibiotic template end*/
  /*save test template start*/
  public fetchAllLabTestTemp = async () => {
    const response = await this.httpWrapper.get(
      "v1/laboratory/fetchAllLabTestTemplates"
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? data : [];
  };

  public saveLabTestTemp = async (payload: {
    templateName: string;
    uid: number;
    testDetails: Array<{
        deptId: number;
        testId: number;
        testName: string;
        cost: number;
      }>;
  }) => {
    return await this.httpWrapper.post(
      "v1/laboratory/saveLabTestTemplate",
      payload
    );
  };

  public updateLabTestTemp = async (
    id: number,
    payload: {
      templateName: string;
      uid: number;
      testDetails: Array<{
        deptId: number;
        testId: number;
        testName: string;
        cost: number;
      }>;
    }
  ) => {
    return await this.httpWrapper.put(
      `v1/laboratory/updateLabTestTemplate/${id}`,
      payload
    );
  };

  public blockLabTestTemp = async (id: number) => {
    return await this.httpWrapper.put(
      `v1/laboratory/blockLabTestTemplate/${id}`
    );
  };

  public unBlockLabTestTemp = async (id: number) => {
    return await this.httpWrapper.put(
      `v1/laboratory/unblockLabTestTemplate/${id}`
    );
  };
  /*save test template end*/
  /*load lab entry list start*/
  public fetchAllLabTestSpecimen = async (opno: string | null = null) => {
    const url = opno
      ? `v1/laboratory/fetchAllLabTestSpecimen?opNo=${encodeURIComponent(opno)}`
      : "v1/laboratory/fetchAllLabTestSpecimen";
    const response = await this.httpWrapper.get(url);
    const data = response?.data || response || [];
    return Array.isArray(data) ? data : [];
  };

  public saveLabSpecimenReceipt = async (payload: Array<{
    testRegId: number;
    userId: number;
  }>) => {
    return await this.httpWrapper.post(
      "v1/laboratory/saveLabTestSpecimenReceived",
      payload
    );
  };

  public fetchLabTestFieldDetails = async (testRegIds: number) => {
    const response = await this.httpWrapper.get(
      `v1/laboratory/fetchTestFieldsWithOutResults?testRegIds=${encodeURIComponent(
        String(testRegIds)
      )}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? data : [];
  };

  public saveLabTestResult = async (payload: Array<{
    testId: number;
    testRegId: number;
    userId: number;
    note: string;
    values: Array<{
      testValueId: number;
      fieldId: number;
      testValue: string;
    }>;
  }>) => {
    return await this.httpWrapper.post(
      "v1/laboratory/SaveLabTestResultValues",
      payload
    );
  };

  public fetchLabTestFieldDetailsWithResults = async (testRegIds: number) => {
    const response = await this.httpWrapper.get(
      `v1/laboratory/fetchTestFieldsWithResults?testRegIds=${encodeURIComponent(
        String(testRegIds)
      )}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? data : [];
  };

  public saveResultVerified = async (payload: Array<{
    testRegId: number;
    userId: number;
  }>) => {
    return await this.httpWrapper.put(
      "v1/laboratory/UpdateLabTestResultVerification",
      payload
    );
  };

  public saveResultPrinted = async (payload: Array<{
    testRegId: number;
    userId: number;
  }>) => {
    return await this.httpWrapper.put(
      "v1/laboratory/UpdateLabTestResultPrint",
      payload
    );
  };
  /*load lab entry list end*/

  /*load patient list for lab result print and Result Re-Edit start */
  public fetchPatientList = async (opNo: number | string, entDate: string) => {
    // Build query parameters conditionally
    const params = new URLSearchParams();

    // If opNo has a value, send only opNo
    if (opNo && opNo !== 0 && opNo !== "0" && String(opNo).trim() !== "") {
      params.append("opNo", String(opNo));
    } else if (entDate && entDate.trim() !== "") {
      // If opNo is empty, send only entDate
      params.append("entDate", entDate);
    }

    const queryString = params.toString();
    const url = queryString
      ? `v1/laboratory/fetchLabResultPrintList?${queryString}`
      : `v1/laboratory/fetchLabResultPrintList`;

    const response = await this.httpWrapper.get(url);
    const data = response?.data || response || [];
    return Array.isArray(data) ? data : [];
  };
  /*load patient list for lab result print and Result Re-Edit end */

  /*fetch patient details start*/
  public fetchPatientDetails = async (displayNumber: string) => {
    return await this.httpWrapper.get(`v1/systemAdmin/fetchPatientDetails/${displayNumber}`);
  };
  /*fetch patient details end*/

  /*fetch lab tests from bill start*/
  public fetchLabTestsFromBill = async (billNo: number) => {
    const response = await this.httpWrapper.get(
      `v1/laboratory/fetchLabTestToPrint/${billNo}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? data : [];
  };
  /*fetch lab tests from bill end*/

  /*edit lab test result start*/
  public editLabTestResult = async (payload: Array<{
    patId: number;
    visitId: number;
    testId: number;
    testRegId: number;
    userId: number;
    note: string;
    reason: string;
    editValue: Array<{
      testValueId: number;
      fieldId: number;
      testValue: string;
    }>;
  }>) => {
    return await this.httpWrapper.put(
      "v1/laboratory/EditLabTestResultValues",
      payload
    );
  };

  public reEditLabTestResult = async (payload: Array<{
    patId: number;
    visitId: number;
    testId: number;
    testRegId: number;
    note: string;
    reason: string;
    reEntryValue: Array<{
      testValueId: number;
      fieldId: number;
      testValue: string;
    }>;
    uid: number;
  }>) => {
    return await this.httpWrapper.put(
      "v1/laboratory/SaveLabTestResultValuesReEntry",
      payload
    );
  };
  /*edit lab test result end*/

  /* reports */
  /*fetch lab tests for register*/
  // public fetchLabTestForRegister = async (fromDate: string, toDate: string) => {
  //   const params = new URLSearchParams({
  //     fromDate,
  //     toDate,
  //   });

  //   const response = await this.httpWrapper.get(
  //     `v1/laboratory/fetchLabTestBetweenDates?${params.toString()}`
  //   );
  //   const data = response?.data || response || [];
  //   return Array.isArray(data) ? data : [];
  // };
  
  public fetchLabTestForRegister = async (fromDate: string, toDate: string, testId:number): Promise<TestRegisterRow[]> => {
      const response = await this.httpWrapper.get(
        `v1/laboratory/fetchLabTestBetweenDates?fromDate=${fromDate}&toDate=${toDate}&testId=${testId}`
      );
      const data = response?.data || response || [];
      return Array.isArray(data) ? (data as TestRegisterRow[]) : [];
    };
  /*fetch lab tests for register end*/

  /*fetch lab tests for register*/
  public fetchLabTestForMasterList = async (deptId: string) => {
    const params = new URLSearchParams({
      deptId
    });

    const response = await this.httpWrapper.get(
      `v1/laboratory/fetchLabTestsDetails?${params.toString()}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? data : [];
  };
  /*fetch lab tests for register end*/

  /*fetch edited lab tests for register*/
  public fetchLabEditedTests = async (
    fromEditDate?: string,
    toEditDate?: string,
    fromBillDate?: string,
    toBillDate?: string
  ) => {
    const params = new URLSearchParams();

    // If edit dates are provided, use them
    if (
      fromEditDate &&
      fromEditDate.trim() !== "" &&
      toEditDate &&
      toEditDate.trim() !== ""
    ) {
      params.append("fromEditDate", fromEditDate);
      params.append("toEditDate", toEditDate);
    } else if (
      fromBillDate &&
      fromBillDate.trim() !== "" &&
      toBillDate &&
      toBillDate.trim() !== ""
    ) {
      // If bill dates are provided, use them
      params.append("fromBillDate", fromBillDate);
      params.append("toBillDate", toBillDate);
    }

    const queryString = params.toString();
    const url = queryString
      ? `v1/laboratory/fetchLabTestEditHistory?${queryString}`
      : `v1/laboratory/fetchLabTestEditHistory`;

    const response = await this.httpWrapper.get(url);
    const data = response?.data || response || [];
    return Array.isArray(data) ? data : [];
  };
  /*fetch edited lab tests for register end*/

  /*fetch lab result details by visit id start*/
  public fetchLabResultDetailsByVisitId = async (visitId: number) => {
    const response = await this.httpWrapper.get(
      `v1/laboratory/fetchLabResultDetailsByVisitId/${visitId}`
    );
    const data = response?.data || response || [];
    return Array.isArray(data) ? data : [];
  };
  /*fetch lab result details by visit id end*/
  
  public fetchLabPrintHeader = async (
    opNo : string,
    finalBillId : number,
  ): Promise<PrintHeaderDetails[]> => {
    try {
      const response = await this.httpWrapper.get(
        `v1/laboratory/fetchLabPrintHeaderDetails?opNo=${opNo}&finalBillId=${finalBillId}`
      );
      const data = response?.data || response;
      if (Array.isArray(data)) {
        return data as PrintHeaderDetails[];
      }
      return data ? [data as PrintHeaderDetails] : [];
    } catch (error) {
      console.error('Error fetching lab print header details:', error);
      throw error;
    }
    };
    
    public saveLabCultureTestResult = async (payload: {
      testRegId: number;
      cultureId: string;
      smearReport: string;
      colonyCount: string;
      organismIsolated: string;
      nonRective: string;
      userId: number;
      details: Array<{
        id: number;
        testId: number;
        deptId: number;
        antId: number;
        antName: string;
        value: number;
        zone: string;
    }>;
  }) => {
    return await this.httpWrapper.post(
      "v1/laboratory/saveLabCultureReport",
      payload
    );
  };
    
  public fetchCultureTestResultByTestRegId = async (id: number): Promise<CultutreTestResultByRegIdResponse> => {
    try {
      const response = await this.httpWrapper.get(`v1/laboratory/fetchCultureReportByTestRegId?testRegId=${id}`);
      return response as CultutreTestResultByRegIdResponse;
    } catch (error) {
      console.error('Error fetching culture test result by test registration ID:', error);
      throw error;
    }
  };

  public updateCultureTestResultByTestRegId = async (
    id: number,
    payload: {
      cultureId: string;
      smearReport: string;
      colonyCount: string;
      organismIsolated: string;
      nonRective: string;
      userId: number;
      reason: string;
      editType: string;
      details: Array<{
        id: number;
        testId: number;
        antId: number;
        antName: string;
        value: number;
        zone: string;
      }>;
    }
  ) => {
    return await this.httpWrapper.put(
      `v1/laboratory/updateLabCultureReport/${id}`,
      payload
    );
  };
}

export default LaboratoryApiService;


export interface TestRegisterRow {
  opNo: string;
  patId: number;
  name: string;
  secondName: string;
  sex: string;
  phone: string;
  bills: LabBills[];
}

export interface LabBills {
  labBillId: number;
  age: string;
  entDateTime: string;
  tests: TestDetails[];
}

export interface TestDetails {
  testRegId: number;
  testName: string;
  testId: number;
}


export interface CultutreTestResultByRegIdResponse {
  reportId: number;
  testRegId: number;
  cultureId: string;
  smearReport: string;
  colonyCount: string;
  organismIsolated: string;
  nonRective: string;
  entDateTime: string;
  entUid: number;
  details: AntibiotiResults[];
}

export interface AntibiotiResults {
  id: number;
  reportId: number;
  testId: number;
  testRegId: number;
  deptId: number;
  antName: string;
  value: number;
  zone: string;
  antId: number;
}