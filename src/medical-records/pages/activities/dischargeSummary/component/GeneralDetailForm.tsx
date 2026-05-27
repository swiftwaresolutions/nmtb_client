import React, { useState, useEffect, useRef } from "react";
import { Card, Form, Button, Row, Col, Container, Table, Modal, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSave, faPlus, faTrash, faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import { showSuccessToast, showErrorToast, showValidationError } from "../../../../../utils/alertUtil";
import { handleNumberChange, handleNumberBlur, formatNumberDisplay } from "../../../../../utils/numberInputUtil";
import { MedicalRecordsApiService } from "../../../../../api/medical-records/medical-records-api-service";
import { LaboratoryApiService } from "../../../../../api/laboratory/laboratory-api-service";
import { CashCounterApiService } from "../../../../../api/cash-counter/cash-counter-api-service";
import { RadiologyApiService, ImpressionsByIPIdResponse } from "../../../../../api/radiology/radiology-api-service";
import SearchableSelect from "../../../../../components/SearchableSelect";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../state/store";

interface ReferenceValue {
  reference: string;
  note: string;
  lowerBounds: number;
  upperBounds: number;
  cutoffVal: number;
  rangeFrom: number;
  rangeTo: number;
  fromAge: number;
  fromAgeType: string;
  toAge: number;
  toAgeType: string;
  sex: string;
}

interface LabTestField {
  testRegId: number;
  fieldId: number;
  fieldName: string;
  fieldType: string;
  unit: string;
  testMethod: string;
  machine: string;
  resultValue: string;
  resultValId: string;
  isNote: number;
  lineType: number;
  normal: number;
  cutoff: number;
  intervalFlag: number;
  cutoffGreater: string;
  cutoffLower: string;
  interHigher: string;
  interInter: string;
  interLower: string;
  referenceValues: ReferenceValue[];
}

interface LabTestResult {
  testName: string;
  testDate: string;
  testRegId: number;
  fields: LabTestField[];
}

interface GeneralPatient {
  patId: number;
  visitId: number;
  ipId: number;
  patientName: string;
  opNo: string;
  ipNo: string;
  age: string | number;
  sex: string;
  department: string;
  ward: string;
  doctor: string;
  doa: string;
  phone: string;
}

interface Medicine {
  id: number;
  medicineName: string;
  prodsId: number;
  qtyNo: string;
  timing: string;
  duration: number;
  period: number;
}

interface GeneralDetailFormProps {
  patient: GeneralPatient & { summaryData?: any };
  onBack: () => void;
  mode: "verification" | "approval" | "print";
}

const normalizeAge = (age: number, ageType: string): number => {
  switch (ageType?.toLowerCase()) {
    case "day":
    case "days":
      return age / 365;
    case "month":
    case "months":
      return age / 12;
    case "hour":
    case "hours":
      return age / (24 * 365);
    case "year":
    case "years":
    default:
      return age;
  }
};

const parsePatientAgeToYears = (patientAge: number | string): number | null => {
  if (typeof patientAge === "number") {
    return Number.isFinite(patientAge) ? patientAge : null;
  }

  const ageText = String(patientAge || "").trim();
  if (!ageText) return null;

  const match = ageText.match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)?$/);
  if (!match) return null;

  const value = Number(match[1]);
  if (Number.isNaN(value)) return null;

  const unit = (match[2] || "years").toLowerCase();
  return normalizeAge(value, unit);
};

const getReferenceRange = (
  field: LabTestField,
  patientAge: number | string,
  patientSex: string
): string => {
  const normalizeSex = (value: string): string => {
    const sex = value?.trim().toLowerCase();
    if (!sex) return "";
    if (sex === "m" || sex === "male") return "male";
    if (sex === "f" || sex === "female") return "female";
    if (sex === "common" || sex === "both" || sex === "all") return "common";
    return sex;
  };

  if (!field.referenceValues || field.referenceValues.length === 0) {
    return "";
  }

  const pSex = normalizeSex(patientSex);
  const normalizedAge = parsePatientAgeToYears(patientAge);

  const getRefText = (ref: ReferenceValue): string => {
    if (ref.rangeFrom !== undefined && ref.rangeTo !== undefined) {
      return `${ref.rangeFrom} - ${ref.rangeTo}`;
    }
    if (ref.reference) return ref.reference;
    if (ref.note) return ref.note;
    return "";
  };

  if (normalizedAge !== null) {
    for (const ref of field.referenceValues) {
      const refSex = normalizeSex(ref.sex || "");
      if (refSex && refSex !== pSex && refSex !== "common") continue;

      const fromAge = normalizeAge(Number(ref.fromAge || 0), ref.fromAgeType);
      const toAge = normalizeAge(Number(ref.toAge || 0), ref.toAgeType);

      if (normalizedAge >= fromAge && normalizedAge <= toAge) {
        return getRefText(ref);
      }
    }
  }

  const sameSexRef = field.referenceValues.find((ref) => {
    const refSex = normalizeSex(ref.sex || "");
    return !refSex || refSex === pSex || refSex === "common";
  });

  return getRefText(sameSexRef || field.referenceValues[0]);
};

const hasDisplayableLabField = (field: LabTestField): boolean => {
  return Boolean(
    field.fieldName ||
      field.resultValue ||
      field.unit ||
      field.referenceValues?.length ||
      field.cutoffGreater ||
      field.cutoffLower ||
      field.interHigher ||
      field.interInter ||
      field.interLower
  );
};

const getCurrentTimeHHMM = (): string => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

const getCurrentDateYYYYMMDD = (): string => {
  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const GeneralDetailForm: React.FC<GeneralDetailFormProps> = ({ patient, onBack, mode }) => {
  const loginData = useSelector((state: RootState) => state.loginData);
  const apiService = new MedicalRecordsApiService();
  const laboratoryApiService = new LaboratoryApiService();
  const cashCounterApi = new CashCounterApiService();
  const radiologyApiService = new RadiologyApiService();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consultants, setConsultants] = useState<any[]>([]);
  const [showMoreConsultants, setShowMoreConsultants] = useState(false);
  const [medicines, setMedicines] = useState<Medicine[]>([
    { id: 1, medicineName: "", prodsId: 0, qtyNo: "", timing: "", duration: 0, period: 0 }
  ]);
  const [labResults, setLabResults] = useState<LabTestResult[]>([]);
  const [loadingLabResults, setLoadingLabResults] = useState<boolean>(false);
  const [showRadiologyModal, setShowRadiologyModal] = useState(false);
  const [loadingRadiologyImpressions, setLoadingRadiologyImpressions] = useState(false);
  const [radiologyImpressions, setRadiologyImpressions] = useState<ImpressionsByIPIdResponse[]>([]);
  const [timingOptions, setTimingOptions] = useState<{ id: number; name: string }[]>([]);
  const [medicineSuggestions, setMedicineSuggestions] = useState<{ [id: number]: any[] }>({});
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    apiService.fetchProductTiming().then(data => {
      setTimingOptions(data.map((t: any) => ({ id: t.id, name: t.name })));
    }).catch(() => {});
  }, []);

  // Helper function to convert date from dd-mm-yyyy to yyyy-mm-dd
  const convertDateFormat = (dateStr: string): string => {
    if (!dateStr) return "";
    // Check if already in yyyy-mm-dd format
    if (dateStr.includes('-') && dateStr.split('-')[0].length === 4) {
      return dateStr;
    }
    // Convert from dd-mm-yyyy to yyyy-mm-dd
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  const [formData, setFormData] = useState({
    modifiedAddress: "",
    dosEnabled: false,
    dos: "",
    dodEnabled: false,
    dod: getCurrentDateYYYYMMDD(),
    dot: getCurrentTimeHHMM(),
    consultant: "",
    consultant2: "",
    consultant3: "",
    dischargeStatus: "",
    finalDiagnosis: "",
    operativeProcedure: "",
    drugAllergy: "",
    chiefComplaints: "",
    pastMedicalHistory: "",
    personalHistory: "",
    pastSurgicalHistory: "",
    menstrualHistory: "",
    familyHistory: "",
    consciousStatus: "",
    orientedStatus: "",
    babyStatus: "",
    bpSystolic: "",
    bpDiastolic: "",
    temperature: "",
    pulse: "",
    resp: "",
    spo2:"",
    weight: "",
    height: "",
    rs: "",
    cvs: "",
    pa: "",
    cns: "",
    pv: "",
    ps: "",
    pr: "",
    otherSystem: "",
    localExamination: "",
    xRay: "",
    usg: "",
    ctReports: "",
    echo: "",
    othersInvestigation: "",
    cchdScreening: "",
    hearingScreening: "",
    nameOfSurgery: "",
    procedure: "",
    notes: "",
    outSideInvestigations: "",
    treatmentProvided: "",
    conditionOnDischarge: "",
    diseaseSpecificDischargeAdvice: "",
    drug: "",
    diet: "",
    woundCareRelated: "",
    symptoms: "",
    birthWeight: 0,
    length: 0,
    headCircumference: 0,
    chestCircumference: 0,
    dateOfBirth: "",
    timeOfBirth: "",
    sex: "",
    dischargeWeight: 0
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => {
      const next = {
        ...prev,
        [name]: type === "checkbox" ? checked : value
      };

      if (name === "dodEnabled" && checked && !prev.dot) {
        next.dot = getCurrentTimeHHMM();
      }

      if (name === "dodEnabled" && checked && !prev.dod) {
        next.dod = getCurrentDateYYYYMMDD();
      }

      return next;
    });
  };

  const sanitizeDecimalValue = (value: string): string => {
    const sanitized = value.replace(/[^0-9.]/g, "");
    const parts = sanitized.split(".");

    if (parts.length <= 1) {
      return sanitized;
    }

    return `${parts[0]}.${parts.slice(1).join("")}`;
  };

  const handleMeasureChange = (field: "weight" | "height", value: string) => {
    const sanitizedValue = sanitizeDecimalValue(value);
    setFormData((prev) => ({
      ...prev,
      [field]: sanitizedValue
    }));
  };

  const handleMeasureBlur = (field: "weight" | "height", value: string) => {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return;
    }

    const numericValue = Number(trimmedValue);
    if (!Number.isFinite(numericValue) || numericValue < 0) {
      setFormData((prev) => ({
        ...prev,
        [field]: ""
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [field]: numericValue.toFixed(3)
    }));
  };

  const handleBirthNumberChange = (
    field:
      | "birthWeight"
      | "length"
      | "headCircumference"
      | "chestCircumference"
      | "dischargeWeight",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: handleNumberChange(value)
    }));
  };

  const handleBirthNumberBlur = (
    field:
      | "birthWeight"
      | "length"
      | "headCircumference"
      | "chestCircumference"
      | "dischargeWeight",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: handleNumberBlur(value)
    }));
  };

  // Fetch consultants on mount
  useEffect(() => {
    apiService.fetchAllConsultants().then((data) => {
      setConsultants(Array.isArray(data) ? data : []);
    }).catch(() => {});
  }, []);

  // Pre-fill form with fetched summary data if available
  useEffect(() => {
    if (patient.summaryData) {
      const data = patient.summaryData;
      
      // Auto-show more consultants if doctorId2, doctorId3, or doctorId4 have values
      const hasAdditionalConsultants = 
        (data.doctorId2 && data.doctorId2 !== 0) || 
        (data.doctorId3 && data.doctorId3 !== 0) || 
        (data.doctorId4 && data.doctorId4 !== 0);
      
      if (hasAdditionalConsultants) {
        setShowMoreConsultants(true);
      }
      
      setFormData({
        modifiedAddress: data.newAddres || "",
        dosEnabled: !!data.surgeryDate,
        dos: convertDateFormat(data.surgeryDate || ""),
        dodEnabled: !!data.dischargeDate,
        dod: convertDateFormat(data.dischargeDate || ""),
        dot: data.dischargeTime ? data.dischargeTime.substring(0, 5) : "",
        consultant: data.doctorId2?.toString() || "",
        consultant2: data.doctorId3?.toString() || "",
        consultant3: data.doctorId4?.toString() || "",
        dischargeStatus: data.dischargeStatus || "",
        finalDiagnosis: data.diagnosis || "",
        operativeProcedure: data.opProcedure || "",
        drugAllergy: data.allergy || "",
        chiefComplaints: data.history || "",
        pastMedicalHistory: data.pastHistory || "",
        personalHistory: data.personalHistory || "",
        pastSurgicalHistory: data.surgicalHistory || "",
        menstrualHistory: data.menstrualHistory || "",
        familyHistory: data.familyHistory || "",
        consciousStatus: data.conscious || "",
        orientedStatus: data.oriented || "",
        babyStatus: data.babyStatus || "",
        bpSystolic: data.blood?.toString() || "",
        bpDiastolic: data.pressure?.toString() || "",
        temperature: data.temp?.toString() || "",
        pulse: data.pulse?.toString() || "",
        resp: data.resp?.toString() || "",
        spo2: data.spo2?.toString() || "",
        weight: data.weight?.toString() || "",
        height: data.height?.toString() || "",
        rs: data.rsValue || "",
        cvs: data.cvs || "",
        pa: data.paut || "",
        cns: data.cnsValue || "",
        pv: data.pvValue || "",
        ps: data.psValue || "",
        pr: data.prValue || "",
        otherSystem: data.otherSysExamination || "",
        localExamination: data.exOther || "",
        xRay: data.xray || "",
        usg: data.usg || "",
        ctReports: data.ct || "",
        echo: data.echo || "",
        othersInvestigation: data.otherRadiology || "",
        cchdScreening: data.cchdScreening || "",
        hearingScreening: data.hearingScreening || "",
        nameOfSurgery: data.surgeryName || "",
        procedure: data.surgeryProcedure || "",
        notes: data.surgeryNotes || "",
        outSideInvestigations: data.outsideInvesti || "",
        treatmentProvided: data.treatment || "",
        conditionOnDischarge: data.conditionDis || "",
        diseaseSpecificDischargeAdvice: data.adviceDis || "",
        drug: data.drug || "",
        diet: data.diet || "",
        woundCareRelated: data.woundCare || "",
        symptoms: data.symptoms || "",
        birthWeight: Number(data.birthWeight) || 0,
        length: Number(data.length) || 0,
        headCircumference: Number(data.headCircumference) || 0,
        chestCircumference: Number(data.chestCircumference) || 0,
        dateOfBirth: convertDateFormat(data.dateOfBirth || ""),
        timeOfBirth: data.timeOfBirth ? data.timeOfBirth.substring(0, 5) : "",
        sex: data.sex || "",
        dischargeWeight: Number(data.dischargeWeight) || 0
      });

      if (data.drugs && Array.isArray(data.drugs) && data.drugs.length > 0) {
        setMedicines(
          data.drugs.map((drug: any, index: number) => {
            const timingRaw = drug.timing?.toString() || "";
            // API returns timing as name (e.g. ".5 OD"); resolve to its numeric ID
            const timingId = /^\d+$/.test(timingRaw)
              ? timingRaw
              : (timingOptions.find(t => t.name === timingRaw)?.id?.toString() || "");
            return {
              id: index + 1,
              medicineName: drug.prodsName || "",
              prodsId: drug.prodsId || 0,
              qtyNo: String(drug.quantity ?? ""),
              timing: timingId,
              duration: Number(drug.duration) || 0,
              period: Number(drug.period) || 0
            };
          })
        );
      }
    }
  }, [patient.summaryData, timingOptions]);

  // Fetch lab results by visitId
  useEffect(() => {
    const fetchLabResults = async () => {
      if (!patient.visitId) {
        return;
      }

      setLoadingLabResults(true);
      try {
        const results = await laboratoryApiService.fetchLabResultDetailsByVisitId(patient.visitId);
        setLabResults(results || []);
      } catch (error) {
        console.error("Error fetching lab results:", error);
        // Silently fail - lab results are optional
        setLabResults([]);
      } finally {
        setLoadingLabResults(false);
      }
    };

    fetchLabResults();
  }, [patient.visitId]);

  const handleMedicineChange = (id: number, field: keyof Medicine, value: string | number) => {
    setMedicines(prev =>
      prev.map(m => m.id === id ? { ...m, [field]: value } : m)
    );
  };

  const handleMedicineNameInput = (id: number, value: string) => {
    setMedicines(prev => prev.map(m => m.id === id ? { ...m, medicineName: value, prodsId: 0 } : m));
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (!value.trim() || value.length < 2) {
      setMedicineSuggestions(prev => ({ ...prev, [id]: [] }));
      return;
    }
    searchTimerRef.current = setTimeout(async () => {
      try {
        const results = await cashCounterApi.fetchMedicinesForBilling(2, value.trim());
        setMedicineSuggestions(prev => ({ ...prev, [id]: results || [] }));
      } catch {
        setMedicineSuggestions(prev => ({ ...prev, [id]: [] }));
      }
    }, 300);
  };

  const handleMedicineSuggestionSelect = (id: number, name: string, prodsId: number) => {
    setMedicines(prev => prev.map(m => m.id === id ? { ...m, medicineName: name, prodsId } : m));
    setMedicineSuggestions(prev => ({ ...prev, [id]: [] }));
  };

  const handleAddMedicine = () => {
    setMedicines(prev => [
      ...prev,
      {
        id: prev.length > 0 ? Math.max(...prev.map(m => m.id)) + 1 : 1,
        medicineName: "",
        prodsId: 0,
        qtyNo: "",
        timing: "",
        duration: 0,
        period: 0
      }
    ]);
  };

  const handleRemoveMedicine = (id: number) => {
    setMedicines(prev => prev.filter(m => m.id !== id));
  };
  
  const handleOpenRadiologyModal = async () => {
    if (!patient.ipId) {
      showValidationError("Radiology impressions are not available because IP ID is missing.");
      return;
    }

    setShowRadiologyModal(true);
    setLoadingRadiologyImpressions(true);

    try {
      const response = await radiologyApiService.fetchImpressionsByIpId(patient.ipId);
      const data = Array.isArray(response) ? response : [];
      setRadiologyImpressions(data);
    } catch (error: any) {
      console.error("Error fetching radiology impressions:", error);
      showErrorToast(
        error?.response?.data?.error || "Failed to load radiology impressions"
      );
      setRadiologyImpressions([]);
    } finally {
      setLoadingRadiologyImpressions(false);
    }
  };

  const groupedRadiologyImpressions = radiologyImpressions.reduce(
    (groups, item) => {
      const heading = item.particularName || "Unnamed Investigation";
      if (!groups[heading]) {
        groups[heading] = [];
      }
      groups[heading].push(item);
      return groups;
    },
    {} as Record<string, ImpressionsByIPIdResponse[]>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.chiefComplaints.trim()) {
      showValidationError("Please enter chief complaints / history");
      return;
    }

    setIsSubmitting(true);
    try {
      const drugsPayload = medicines
        .filter(m => m.medicineName.trim() !== "")
        .map(m => ({
          prodsId: m.prodsId || 0,
          prodsName: m.medicineName,
          quantity: m.qtyNo,
          timing: m.timing || "None",
          duration: m.duration || 0,
          period: m.period || 0
        }));

      const payload = {
        patId: patient.patId,
        visitId: patient.visitId,
        ipId: patient.ipId,
        dischargeDate: formData.dodEnabled ? formData.dod : "",
        dischargeTime: formData.dodEnabled ? formData.dot : "",
        surgeryDate: formData.dosEnabled ? formData.dos : "",
        uid: loginData.id || 0,
        newAddres: formData.modifiedAddress,
        consultantId: null,
        doctorId2: formData.consultant ? Number(formData.consultant) : null,
        doctorId3: formData.consultant2 ? Number(formData.consultant2) : null,
        doctorId4: formData.consultant3 ? Number(formData.consultant3) : null,
        dischargeStatus: formData.dischargeStatus,
        diagnosis: formData.finalDiagnosis,
        opProcedure: formData.operativeProcedure,
        allergy: formData.drugAllergy,
        history: formData.chiefComplaints,
        pastHistory: formData.pastMedicalHistory,
        personalHistory: formData.personalHistory,
        surgicalHistory: formData.pastSurgicalHistory,
        menstrualHistory: formData.menstrualHistory,
        familyHistory: formData.familyHistory,
        conscious: formData.consciousStatus,
        oriented: formData.orientedStatus,
        babyStatus: formData.babyStatus,
        blood: parseFloat(formData.bpSystolic) || 0,
        pressure: parseFloat(formData.bpDiastolic) || 0,
        temp: parseFloat(formData.temperature) || 0,
        pulse: parseFloat(formData.pulse) || 0,
        resp: parseFloat(formData.resp) || 0,
        spo2: parseFloat(formData.spo2) || 0,
        weight: parseFloat(formData.weight) || 0,
        height: parseFloat(formData.height) || 0,
        rsValue: formData.rs,
        cvs: formData.cvs,
        paut: formData.pa,
        cnsValue: formData.cns,
        pvValue: formData.pv,
        psValue: formData.ps,
        prValue: formData.pr,
        otherSysExamination: formData.otherSystem,
        exOther: formData.localExamination,
        xray: formData.xRay,
        usg: formData.usg,
        ct: formData.ctReports,
        echo: formData.echo,
        otherRadiology: formData.othersInvestigation,
        cchdScreening: formData.cchdScreening,
        hearingScreening: formData.hearingScreening,
        surgeryName: formData.nameOfSurgery,
        surgeryProcedure: formData.procedure,
        surgeryNotes: formData.notes,
        outsideInvesti: formData.outSideInvestigations,
        treatment: formData.treatmentProvided,
        conditionDis: formData.conditionOnDischarge,
        adviceDis: formData.diseaseSpecificDischargeAdvice,
        drug: formData.drug,
        diet: formData.diet,
        woundCare: formData.woundCareRelated,
        symptoms: formData.symptoms,
        birthWeight: formData.birthWeight,
        length: formData.length,
        headCircumference: formData.headCircumference,
        chestCircumference: formData.chestCircumference,
        dateOfBirth : formData.dateOfBirth,
        timeOfBirth: formData.timeOfBirth,
        gender: formData.sex,
        dischargeWeight: formData.dischargeWeight,

        drugs: drugsPayload
      };

      if (patient.summaryData && patient.summaryData.id) {
        await apiService.updatePatientSummary(patient.summaryData.id, payload);
      } else {
        await apiService.savePatientSummary(payload);
      }

      // Workflow based on mode
      if (mode === "verification") {
        if (patient.summaryData) {
          showSuccessToast("Discharge summary verified successfully!");

          const verificationList = JSON.parse(localStorage.getItem('generalVerificationList') || '[]');
          const updatedList = verificationList.filter(
            (p: any) => !(p.patId === patient.patId && p.ipId === patient.ipId)
          );
          localStorage.setItem('generalVerificationList', JSON.stringify(updatedList));

          const approvalList = JSON.parse(localStorage.getItem('generalApprovalList') || '[]');
          const patientEntry = {
            patId: patient.patId, visitId: patient.visitId, ipId: patient.ipId,
            patientName: patient.patientName, opNo: patient.opNo, ipNo: patient.ipNo,
            age: patient.age, sex: patient.sex, department: patient.department,
            ward: patient.ward, doctor: patient.doctor, doa: patient.doa,
            phone: patient.phone, approvalStatus: 'Pending', verifiedAt: new Date().toISOString()
          };
          const existingIdx = approvalList.findIndex(
            (p: any) => p.patId === patient.patId && p.ipId === patient.ipId
          );
          if (existingIdx !== -1) approvalList[existingIdx] = patientEntry;
          else approvalList.push(patientEntry);
          localStorage.setItem('generalApprovalList', JSON.stringify(approvalList));
        } else {
          showSuccessToast("Discharge summary saved successfully!");

          const verificationList = JSON.parse(localStorage.getItem('generalVerificationList') || '[]');
          const patientEntry = {
            patId: patient.patId, visitId: patient.visitId, ipId: patient.ipId,
            patientName: patient.patientName, opNo: patient.opNo, ipNo: patient.ipNo,
            age: patient.age, sex: patient.sex, department: patient.department,
            ward: patient.ward, doctor: patient.doctor, doa: patient.doa,
            phone: patient.phone, verificationStatus: 'Pending', savedAt: new Date().toISOString()
          };
          const existingIdx = verificationList.findIndex(
            (p: any) => p.patId === patient.patId && p.ipId === patient.ipId
          );
          if (existingIdx !== -1) verificationList[existingIdx] = patientEntry;
          else verificationList.push(patientEntry);
          localStorage.setItem('generalVerificationList', JSON.stringify(verificationList));
        }
      } else if (mode === "approval") {
        showSuccessToast("Discharge summary approved successfully!");

        const approvalList = JSON.parse(localStorage.getItem('generalApprovalList') || '[]');
        const updatedApprovalList = approvalList.filter(
          (p: any) => !(p.patId === patient.patId && p.ipId === patient.ipId)
        );
        localStorage.setItem('generalApprovalList', JSON.stringify(updatedApprovalList));

        const approvedList = JSON.parse(localStorage.getItem('generalApprovedList') || '[]');
        approvedList.push({ ...patient, approvedAt: new Date().toISOString() });
        localStorage.setItem('generalApprovedList', JSON.stringify(approvedList));
      }

      setTimeout(() => { onBack(); }, 1500);
    } catch (error: any) {
      console.error("Error saving general summary:", error);
      showErrorToast(
        error?.response?.data?.error || "Failed to save discharge summary"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isReadOnly = mode === "print";
  const modeLabel = mode.charAt(0).toUpperCase() + mode.slice(1);

  return (
    <Container fluid className="px-4 py-3" style={{ height: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column' }}>
      <Card style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Card.Header className="d-flex justify-content-between align-items-center bg-primary text-white">
          <h5 className="mb-0">
            <FontAwesomeIcon icon={faArrowLeft} className="me-2 cursor-pointer" onClick={onBack} />
            General Discharge Summary - {modeLabel}
          </h5>
          <Button variant="light" size="sm" onClick={onBack}>
            <FontAwesomeIcon icon={faArrowLeft} className="me-1" />
            Back
          </Button>
        </Card.Header>

        <Card.Body style={{ flex: 1, overflow: 'auto', paddingBottom: '80px' }}>
          <Form onSubmit={handleSubmit}>

            {/* ── Bio data ── */}
            <Card className="mb-3">
              <Card.Header className="bg-light py-2"><strong>Bio data:</strong></Card.Header>
              <Card.Body>
                {/* Row 1: Name | Ward */}
                <Row className="align-items-center mb-2">
                  <Col md={6}>
                    <Row className="align-items-center">
                      <Col md={4}><Form.Label className="mb-0">Name</Form.Label></Col>
                      <Col md={8}><Form.Control type="text" value={patient.patientName} readOnly /></Col>
                    </Row>
                  </Col>
                  <Col md={6}>
                    <Row className="align-items-center">
                      <Col md={4}><Form.Label className="mb-0">Ward</Form.Label></Col>
                      <Col md={8}><Form.Control type="text" value={patient.ward} readOnly /></Col>
                    </Row>
                  </Col>
                </Row>
                {/* Row 2: Age/Sex | DOA */}
                <Row className="align-items-center mb-2">
                  <Col md={6}>
                    <Row className="align-items-center">
                      <Col md={4}><Form.Label className="mb-0">Age / Sex</Form.Label></Col>
                      <Col md={8}><Form.Control type="text" value={`${patient.age} / ${patient.sex}`} readOnly /></Col>
                    </Row>
                  </Col>
                  <Col md={6}>
                    <Row className="align-items-center">
                      <Col md={4}><Form.Label className="mb-0">DOA</Form.Label></Col>
                      <Col md={8}><Form.Control type="text" value={patient.doa} readOnly /></Col>
                    </Row>
                  </Col>
                </Row>
                {/* Row 3: DOS | DOD */}
                <Row className="align-items-center mb-2">
                  <Col md={6}>
                    <Row className="align-items-center">
                      <Col md={4}>
                        <Form.Check
                          type="checkbox"
                          name="dosEnabled"
                          label="DOS (If having surgery click here)"
                          checked={formData.dosEnabled}
                          onChange={handleInputChange}
                          disabled={isReadOnly}
                        />
                      </Col>
                      <Col md={8}>
                        <Form.Control
                          type="date"
                          name="dos"
                          value={formData.dos}
                          onChange={handleInputChange}
                          disabled={!formData.dosEnabled || isReadOnly}
                        />
                      </Col>
                    </Row>
                  </Col>
                  <Col md={6}>
                    <Row className="align-items-center">
                      <Col md={4}>
                        <Form.Check
                          type="checkbox"
                          name="dodEnabled"
                          label="DOD"
                          checked={formData.dodEnabled}
                          onChange={handleInputChange}
                          disabled={isReadOnly}
                        />
                      </Col>
                      <Col md={4}>
                        <Form.Control
                          type="date"
                          name="dod"
                          value={formData.dod}
                          onChange={handleInputChange}
                          disabled={!formData.dodEnabled || isReadOnly}
                        />
                      </Col>
                      <Col md={4}>
                        <Form.Control
                          type="time"
                          name="dot"
                          value={formData.dot}
                          onChange={handleInputChange}
                          disabled={!formData.dodEnabled || isReadOnly}
                        />
                      </Col>
                    </Row>
                  </Col>
                </Row>
                {/* Row 4: Consultant */}
                <Row className="align-items-center mb-2">
                  <Col md={6}>
                    <Row className="align-items-center">
                      <Col md={4}><Form.Label className="mb-0">Consultant</Form.Label></Col>
                      <Col md={8}>
                        <Form.Select
                          name="consultant"
                          value={formData.consultant}
                          onChange={handleInputChange}
                          disabled={isReadOnly}
                        >
                          <option value="">Select Consultant</option>
                          {consultants.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </Form.Select>
                      </Col>
                    </Row>
                    <Row className="align-items-center mt-1">
                      <Col md={12}>
                        <Form.Check
                          type="checkbox"
                          label="(If having more consultants click)"
                          checked={showMoreConsultants}
                          onChange={(e) => setShowMoreConsultants(e.target.checked)}
                          disabled={isReadOnly}
                          className="text-muted small"
                        />
                      </Col>
                    </Row>
                    {showMoreConsultants && (
                      <>
                        <Row className="align-items-center mt-1">
                          <Col md={4}><Form.Label className="mb-0">Consultant 2</Form.Label></Col>
                          <Col md={8}>
                            <Form.Select
                              name="consultant2"
                              value={formData.consultant2}
                              onChange={handleInputChange}
                              disabled={isReadOnly}
                            >
                              <option value="">Select Consultant</option>
                              {consultants.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </Form.Select>
                          </Col>
                        </Row>
                        <Row className="align-items-center mt-1">
                          <Col md={4}><Form.Label className="mb-0">Consultant 3</Form.Label></Col>
                          <Col md={8}>
                            <Form.Select
                              name="consultant3"
                              value={formData.consultant3}
                              onChange={handleInputChange}
                              disabled={isReadOnly}
                            >
                              <option value="">Select Consultant</option>
                              {consultants.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </Form.Select>
                          </Col>
                        </Row>
                      </>
                    )}
                  </Col>
                  {/* Row 4 right: Discharge Status */}
                  <Col md={6}>
                    <Row className="align-items-center">
                      <Col md={4}><Form.Label className="mb-0">Discharge Status</Form.Label></Col>
                      <Col md={8}>
                        <Form.Select
                          name="dischargeStatus"
                          value={formData.dischargeStatus}
                          onChange={handleInputChange}
                          disabled={isReadOnly}
                        >
                          <option value="">Select</option>
                          <option value="Recovered">Recovered</option>
                          <option value="Improved">Improved</option>
                          <option value="Referred">Referred</option>
                          <option value="LAMA">LAMA</option>
                          <option value="DAMA">DAMA</option>
                          <option value="Death">Death</option>
                        </Form.Select>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* ── Clinical Info + History ── */}
            <Card className="mb-3">
              <Card.Body>
                {/* FINAL DIAGNOSIS */}
                <Row className="align-items-start mb-2">
                  <Col md={3}>
                    <Form.Label className="mb-0 fw-bold text-danger text-uppercase">
                      Final Diagnosis:
                    </Form.Label>
                  </Col>
                  <Col md={1} className="text-center"><span>:</span></Col>
                  <Col md={8}>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="finalDiagnosis"
                      value={formData.finalDiagnosis}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                    />
                  </Col>
                </Row>
                {/* Operative Procedure */}
                <Row className="align-items-start mb-2">
                  <Col md={3}>
                    <Form.Label className="mb-0">operative procedure</Form.Label>
                  </Col>
                  <Col md={1}></Col>
                  <Col md={8}>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="operativeProcedure"
                      value={formData.operativeProcedure}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                    />
                  </Col>
                </Row>
                {/* Drug Allergy */}
                <Row className="align-items-start mb-3">
                  <Col md={3}>
                    <Form.Label className="mb-0">Drug Allergy</Form.Label>
                  </Col>
                  <Col md={1}></Col>
                  <Col md={8}>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="drugAllergy"
                      value={formData.drugAllergy}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                    />
                  </Col>
                </Row>

                {/* HISTORY section header */}
                <Row className="mb-2">
                  <Col>
                    <span className="fw-bold text-danger text-uppercase">History:</span>
                  </Col>
                </Row>

                {/* Chief Complaints in HOPI */}
                <Row className="align-items-start mb-2 ps-3">
                  <Col md={3}>
                    <Form.Label className="mb-0 ps-2">
                      Chief Complaints in HOPI <span className="text-danger">*</span>
                    </Form.Label>
                  </Col>
                  <Col md={1} className="text-center"><span>:</span></Col>
                  <Col md={8}>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="chiefComplaints"
                      value={formData.chiefComplaints}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                    />
                  </Col>
                </Row>
                {/* Past Medical History */}
                <Row className="align-items-start mb-2 ps-3">
                  <Col md={3}>
                    <Form.Label className="mb-0 ps-2">Past Medical History</Form.Label>
                  </Col>
                  <Col md={1}></Col>
                  <Col md={8}>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="pastMedicalHistory"
                      value={formData.pastMedicalHistory}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                    />
                  </Col>
                </Row>
                {/* Personal History */}
                <Row className="align-items-start mb-2 ps-3">
                  <Col md={3}>
                    <Form.Label className="mb-0 ps-2">Personal History</Form.Label>
                  </Col>
                  <Col md={1}></Col>
                  <Col md={8}>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="personalHistory"
                      value={formData.personalHistory}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                    />
                  </Col>
                </Row>
                {/* Past Surgical History */}
                <Row className="align-items-start mb-2 ps-3">
                  <Col md={3}>
                    <Form.Label className="mb-0 ps-2">Past Surgical History</Form.Label>
                  </Col>
                  <Col md={1}></Col>
                  <Col md={8}>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="pastSurgicalHistory"
                      value={formData.pastSurgicalHistory}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                    />
                  </Col>
                </Row>
                {/* Menstrual History */}
                <Row className="align-items-start mb-2 ps-3">
                  <Col md={3}>
                    <Form.Label className="mb-0 ps-2">Menstrual History</Form.Label>
                  </Col>
                  <Col md={1}></Col>
                  <Col md={7}>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="menstrualHistory"
                      value={formData.menstrualHistory}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                    />
                  </Col>
                  <Col md={1} className="d-flex align-items-center">
                    <small className="text-danger fst-italic">(For Female Only)</small>
                  </Col>
                </Row>
                {/* Family History */}
                <Row className="align-items-start mb-2 ps-3">
                  <Col md={3}>
                    <Form.Label className="mb-0 ps-2">Family History</Form.Label>
                  </Col>
                  <Col md={1}></Col>
                  <Col md={8}>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="familyHistory"
                      value={formData.familyHistory}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                    />
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* ── General Examination ── */}
            <Card className="mb-3">
              <Card.Header className="bg-light py-2">
                <span className="fw-bold text-danger text-uppercase">General Examination:</span>
              </Card.Header>
              <Card.Body>
                {/* Conscious Status */}
                <Row className="align-items-center mb-2">
                  <Col md={3}><Form.Label className="mb-0">Conscious Status</Form.Label></Col>
                  <Col md={1} className="text-center"><span>:</span></Col>
                  <Col md={4}>
                    <Form.Control type="text" name="consciousStatus" value={formData.consciousStatus} onChange={handleInputChange} readOnly={isReadOnly} />
                  </Col>
                </Row>
                {/* Oriented Status */}
                <Row className="align-items-center mb-2">
                  <Col md={3}><Form.Label className="mb-0">Oriented Status</Form.Label></Col>
                  <Col md={1} className="text-center"><span>:</span></Col>
                  <Col md={4}>
                    <Form.Control type="text" name="orientedStatus" value={formData.orientedStatus} onChange={handleInputChange} readOnly={isReadOnly} />
                  </Col>
                </Row>
                {/* Baby Status */}
                <Row className="align-items-start mb-2">
                  <Col md={3}><Form.Label className="mb-0">Baby Status</Form.Label></Col>
                  <Col md={1} className="text-center"><span>:</span></Col>
                  <Col md={8}>
                    <Form.Control as="textarea" rows={2} name="babyStatus" value={formData.babyStatus} onChange={handleInputChange} readOnly={isReadOnly} />
                  </Col>
                </Row>
                {/* BP */}
                <Row className="align-items-center mb-2">
                  <Col md={3}><Form.Label className="mb-0 fw-bold text-primary">BP</Form.Label></Col>
                  <Col md={1} className="text-center"><span>:</span></Col>
                  <Col md={3}>
                    <Form.Control type="number" name="bpSystolic" value={formData.bpSystolic} onChange={handleInputChange} readOnly={isReadOnly} min="0" placeholder="Systolic" />
                  </Col>
                  <Col md={1} className="text-center"><span>/</span></Col>
                  <Col md={3}>
                    <Form.Control type="number" name="bpDiastolic" value={formData.bpDiastolic} onChange={handleInputChange} readOnly={isReadOnly} min="0" placeholder="Diastolic" />
                  </Col>
                  <Col md={1}><small className="text-muted">mm Hg</small></Col>
                </Row>
                {/* Temperature */}
                <Row className="align-items-center mb-2">
                  <Col md={3}><Form.Label className="mb-0">Temperature</Form.Label></Col>
                  <Col md={1} className="text-center"><span>:</span></Col>
                  <Col md={4}>
                    <Form.Control type="number" name="temperature" value={formData.temperature} onChange={handleInputChange} readOnly={isReadOnly} min="0" step="0.01" />
                  </Col>
                  <Col md={1}><small className="text-muted">°F</small></Col>
                </Row>
                {/* Pulse Rate */}
                <Row className="align-items-center mb-2">
                  <Col md={3}><Form.Label className="mb-0">Pulse Rate</Form.Label></Col>
                  <Col md={1} className="text-center"><span>:</span></Col>
                  <Col md={4}>
                    <Form.Control type="number" name="pulse" value={formData.pulse} onChange={handleInputChange} readOnly={isReadOnly} min="0" />
                  </Col>
                  <Col md={1}><small className="text-muted">/ mt</small></Col>
                </Row>
                {/* Respiratory Rate */}
                <Row className="align-items-center mb-2">
                  <Col md={3}><Form.Label className="mb-0">Respiratory Rate</Form.Label></Col>
                  <Col md={1} className="text-center"><span>:</span></Col>
                  <Col md={4}>
                    <Form.Control type="number" name="resp" value={formData.resp} onChange={handleInputChange} readOnly={isReadOnly} min="0" />
                  </Col>
                  <Col md={1}><small className="text-muted">/ mt</small></Col>
                </Row>
                {/* SP O2 */}
                <Row className="align-items-center mb-2">
                  <Col md={3}><Form.Label className="mb-0">SpO2</Form.Label></Col>
                  <Col md={1} className="text-center"><span>:</span></Col>
                  <Col md={4}>
                    <Form.Control type="number" name="spo2" value={formData.spo2} onChange={handleInputChange} readOnly={isReadOnly} min="0" />
                  </Col>
                  <Col md={1}><small className="text-muted">/ mt</small></Col>
                </Row>
                {/* Weight */}
                <Row className="align-items-center mb-2">
                  <Col md={3}><Form.Label className="mb-0">Weight</Form.Label></Col>
                  <Col md={1} className="text-center"><span>:</span></Col>
                  <Col md={4}>
                    <Form.Control
                      type="text"
                      inputMode="decimal"
                      name="weight"
                      value={formData.weight}
                      onChange={(e) => handleMeasureChange("weight", e.target.value)}
                      onBlur={(e) => handleMeasureBlur("weight", e.target.value)}
                      readOnly={isReadOnly}
                      placeholder="0.000"
                    />
                  </Col>
                  <Col md={1}><small className="text-muted">kg</small></Col>
                </Row>
                {/* Height */}
                <Row className="align-items-center mb-2">
                  <Col md={3}><Form.Label className="mb-0">Height</Form.Label></Col>
                  <Col md={1} className="text-center"><span>:</span></Col>
                  <Col md={4}>
                    <Form.Control
                      type="text"
                      inputMode="decimal"
                      name="height"
                      value={formData.height}
                      onChange={(e) => handleMeasureChange("height", e.target.value)}
                      onBlur={(e) => handleMeasureBlur("height", e.target.value)}
                      readOnly={isReadOnly}
                      placeholder="0.000"
                    />
                  </Col>
                  <Col md={1}><small className="text-muted">cm</small></Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Birth details */}
            <Card className="mb-3">
              <Card.Header className="bg-light py-2">
                <span className="fw-bold text-danger text-uppercase">Birth details:</span>
              </Card.Header>
              <Card.Body>
                <Row className="align-items-center mb-2">
                  <Col md={3}><Form.Label className="mb-0">Birth Weight:</Form.Label></Col>
                  <Col md={1} className="text-center"><span>:</span></Col>
                  <Col md={4}>
                    <Form.Control
                      type="number"
                      name="birthWeight"
                      value={formatNumberDisplay(formData.birthWeight)}
                      onChange={(e) => handleBirthNumberChange("birthWeight", e.target.value)}
                      onBlur={(e) => handleBirthNumberBlur("birthWeight", e.target.value)}
                      min="0"
                      step="0.01"
                      placeholder="0"
                      readOnly={isReadOnly}
                    />
                  </Col>
                </Row>
                <Row className="align-items-center mb-2">
                  <Col md={3}><Form.Label className="mb-0">Length:</Form.Label></Col>
                  <Col md={1} className="text-center"><span>:</span></Col>
                  <Col md={4}>
                    <Form.Control
                      type="number"
                      name="length"
                      value={formatNumberDisplay(formData.length)}
                      onChange={(e) => handleBirthNumberChange("length", e.target.value)}
                      onBlur={(e) => handleBirthNumberBlur("length", e.target.value)}
                      min="0"
                      step="0.01"
                      placeholder="0"
                      readOnly={isReadOnly}
                    />
                  </Col>
                </Row>
                <Row className="align-items-center mb-2">
                  <Col md={3}><Form.Label className="mb-0">Head Circumference (HC):</Form.Label></Col>
                  <Col md={1} className="text-center"><span>:</span></Col>
                  <Col md={4}>
                    <Form.Control
                      type="number"
                      name="headCircumference"
                      value={formatNumberDisplay(formData.headCircumference)}
                      onChange={(e) => handleBirthNumberChange("headCircumference", e.target.value)}
                      onBlur={(e) => handleBirthNumberBlur("headCircumference", e.target.value)}
                      min="0"
                      step="0.01"
                      placeholder="0"
                      readOnly={isReadOnly}
                    />
                  </Col>
                </Row>
                <Row className="align-items-center mb-2">
                  <Col md={3}><Form.Label className="mb-0">Chest Circumference (CC)</Form.Label></Col>
                  <Col md={1} className="text-center"><span>:</span></Col>
                  <Col md={4}>
                    <Form.Control
                      type="number"
                      name="chestCircumference"
                      value={formatNumberDisplay(formData.chestCircumference)}
                      onChange={(e) => handleBirthNumberChange("chestCircumference", e.target.value)}
                      onBlur={(e) => handleBirthNumberBlur("chestCircumference", e.target.value)}
                      min="0"
                      step="0.01"
                      placeholder="0"
                      readOnly={isReadOnly}
                    />
                  </Col>
                </Row>
                <Row className="align-items-center mb-2">
                  <Col md={3}><Form.Label className="mb-0">Date of Birth (DOB):</Form.Label></Col>
                  <Col md={1} className="text-center"><span>:</span></Col>
                  <Col md={4}>
                    <Form.Control
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      disabled={isReadOnly}
                    />
                  </Col>
                </Row>
                <Row className="align-items-center mb-2">
                  <Col md={3}><Form.Label className="mb-0">Time of Birth (TOB):</Form.Label></Col>
                  <Col md={1} className="text-center"><span>:</span></Col>
                  <Col md={4}>
                    <Form.Control
                      type="time"
                      name="timeOfBirth"
                      value={formData.timeOfBirth}
                      onChange={handleInputChange}
                      disabled={isReadOnly}
                    />
                  </Col>
                </Row>
                <Row className="align-items-center mb-2">
                  <Col md={3}><Form.Label className="mb-0">SEX:</Form.Label></Col>
                  <Col md={1} className="text-center"><span>:</span></Col>
                  <Col md={4}>
                    <Form.Select
                      name="sex"
                      value={formData.sex}
                      onChange={handleInputChange}
                      disabled={isReadOnly}
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </Form.Select>
                  </Col>
                </Row>
                <Row className="align-items-center mb-2">
                  <Col md={3}><Form.Label className="mb-0">Discharge Weight:</Form.Label></Col>
                  <Col md={1} className="text-center"><span>:</span></Col>
                  <Col md={4}>
                    <Form.Control
                      type="number"
                      name="dischargeWeight"
                      value={formatNumberDisplay(formData.dischargeWeight)}
                      onChange={(e) => handleBirthNumberChange("dischargeWeight", e.target.value)}
                      onBlur={(e) => handleBirthNumberBlur("dischargeWeight", e.target.value)}
                      min="0"
                      step="0.01"
                      placeholder="0"
                      readOnly={isReadOnly}
                    />
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* ── Systemic Examination ── */}
            <Card className="mb-3">
              <Card.Header className="bg-light py-2">
                <span className="fw-bold text-danger text-uppercase">Systemic Examination:</span>
              </Card.Header>
              <Card.Body>
                {/* RS */}
                <Row className="align-items-center mb-2">
                  <Col md={3}><Form.Label className="mb-0">RS</Form.Label></Col>
                  <Col md={1} className="text-center"><span>:</span></Col>
                  <Col md={5}><Form.Control type="text" name="rs" value={formData.rs} onChange={handleInputChange} readOnly={isReadOnly} /></Col>
                </Row>
                {/* CVS */}
                <Row className="align-items-center mb-2">
                  <Col md={3}><Form.Label className="mb-0">CVS</Form.Label></Col>
                  <Col md={1} className="text-center"><span>:</span></Col>
                  <Col md={5}><Form.Control type="text" name="cvs" value={formData.cvs} onChange={handleInputChange} readOnly={isReadOnly} /></Col>
                </Row>
                {/* P/A */}
                <Row className="align-items-center mb-2">
                  <Col md={3}><Form.Label className="mb-0">P/A</Form.Label></Col>
                  <Col md={1} className="text-center"><span>:</span></Col>
                  <Col md={5}><Form.Control type="text" name="pa" value={formData.pa} onChange={handleInputChange} readOnly={isReadOnly} /></Col>
                </Row>
                {/* CNS */}
                <Row className="align-items-center mb-2">
                  <Col md={3}><Form.Label className="mb-0">CNS</Form.Label></Col>
                  <Col md={1} className="text-center"><span>:</span></Col>
                  <Col md={5}><Form.Control type="text" name="cns" value={formData.cns} onChange={handleInputChange} readOnly={isReadOnly} /></Col>
                </Row>
                {/* P/V */}
                <Row className="align-items-center mb-2">
                  <Col md={3}><Form.Label className="mb-0">P/V</Form.Label></Col>
                  <Col md={1} className="text-center"><span>:</span></Col>
                  <Col md={5}><Form.Control type="text" name="pv" value={formData.pv} onChange={handleInputChange} readOnly={isReadOnly} /></Col>
                </Row>
                {/* P/S */}
                <Row className="align-items-center mb-2">
                  <Col md={3}><Form.Label className="mb-0">P/S</Form.Label></Col>
                  <Col md={1} className="text-center"><span>:</span></Col>
                  <Col md={5}><Form.Control type="text" name="ps" value={formData.ps} onChange={handleInputChange} readOnly={isReadOnly} /></Col>
                </Row>
                {/* PR */}
                <Row className="align-items-center mb-2">
                  <Col md={3}><Form.Label className="mb-0">PR</Form.Label></Col>
                  <Col md={1}></Col>
                  <Col md={5}><Form.Control type="text" name="pr" value={formData.pr} onChange={handleInputChange} readOnly={isReadOnly} /></Col>
                </Row>
                {/* Other */}
                <Row className="align-items-start mb-2">
                  <Col md={3}><Form.Label className="mb-0">Other</Form.Label></Col>
                  <Col md={1}></Col>
                  <Col md={8}><Form.Control as="textarea" rows={2} name="otherSystem" value={formData.otherSystem} onChange={handleInputChange} readOnly={isReadOnly} /></Col>
                </Row>
                {/* Local Examination */}
                <Row className="align-items-start mb-2">
                  <Col md={3}><Form.Label className="mb-0 fw-bold" style={{ color: "#e67e00" }}>LOCAL EXAMINATION</Form.Label></Col>
                  <Col md={1} className="text-center"><span>:</span></Col>
                  <Col md={8}><Form.Control as="textarea" rows={2} name="localExamination" value={formData.localExamination} onChange={handleInputChange} readOnly={isReadOnly} /></Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Investigation/Lab Results Section */}
            {loadingLabResults ? (
              <Card className="mb-3">
                <Card.Body className="text-center py-3">
                  <small className="text-muted">Loading investigation results...</small>
                </Card.Body>
              </Card>
            ) : labResults.length > 0 ? (
              <Card className="mb-3">
                <Card.Header className="bg-light py-2">
                  <strong>INVESTIGATION RESULTS:</strong>
                </Card.Header>
                <Card.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <Table bordered size="sm" style={{ fontSize: '0.875rem', marginBottom: 0 }}>
                    <thead style={{ backgroundColor: '#f8f9fa' }}>
                      <tr>
                        <th style={{ width: '30%' }}>Test Name</th>
                        <th style={{ width: '30%' }}>Parameter</th>
                        <th style={{ width: '20%' }}>Result / Unit</th>
                        <th style={{ width: '20%' }}>Reference Range</th>
                      </tr>
                    </thead>
                    <tbody>
                      {labResults.map((test, testIndex) => {
                        const displayableFields = (test.fields || []).filter((field) => hasDisplayableLabField(field));
                        const formattedTestDate = test.testDate ? new Date(test.testDate).toLocaleDateString() : "-";

                        return (
                          <React.Fragment key={testIndex}>
                            {displayableFields.length === 0 ? (
                              <>
                                <tr style={{ backgroundColor: '#f8f9fa', fontWeight: '600' }}>
                                  <td>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                                      <span>{test.testName || "-"}</span>
                                      <small>{formattedTestDate}</small>
                                    </div>
                                  </td>
                                  <td></td>
                                  <td></td>
                                  <td></td>
                                </tr>
                                <tr style={{ color: '#6c757d', textAlign: 'center' }}>
                                  <td></td>
                                  <td colSpan={3}>No field details available.</td>
                                </tr>
                              </>
                            ) : (
                              displayableFields.map((field, fieldIndex) => {
                                let refRange = getReferenceRange(field, patient.age, patient.sex);
                                const cutoffFlag = Number(field.cutoff) === 1;
                                const intervalFlag = Number(field.intervalFlag) === 1;

                                if (!refRange && cutoffFlag) {
                                  refRange = field.cutoffGreater || field.cutoffLower || "";
                                } else if (!refRange && intervalFlag) {
                                  refRange = `${field.interLower || ""} - ${field.interHigher || ""}`;
                                }

                                const isFirstField = fieldIndex === 0;
                                const rowStyle = isFirstField && testIndex > 0 ? { borderTop: '2px solid #0d6efd' } : {};
                                const cellBgColor = isFirstField ? '#f8f9fa' : 'transparent';
                                const cellFontWeight = isFirstField ? '600' : 'normal';

                                return (
                                  <tr key={`${testIndex}-${fieldIndex}`} style={rowStyle}>
                                    <td style={{ backgroundColor: cellBgColor, fontWeight: cellFontWeight }}>
                                      {isFirstField && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                                          <span>{test.testName || "-"}</span>
                                          <small>{formattedTestDate}</small>
                                        </div>
                                      )}
                                    </td>
                                    <td>{field.fieldName || "-"}</td>
                                    <td style={{ fontWeight: '600' }}>{`${field.resultValue || "-"}${field.unit ? ` / ${field.unit}` : ""}`}</td>
                                    <td>{refRange || "-"}</td>
                                  </tr>
                                );
                              })
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            ) : null}

            {/* ── Investigations ── */}
            <Card className="mb-3">
              <Card.Header className="bg-light py-2 d-flex justify-content-between align-items-center">
                <div>
                  <span className="fw-bold text-danger text-uppercase">Investigations:</span>
                  <span className="ms-1 fw-bold">Radiology</span>
                </div>
                <Button
                  variant="link"
                  className="p-0 text-danger"
                  onClick={handleOpenRadiologyModal}
                  title="View radiology impressions"
                >
                  <FontAwesomeIcon icon={faCircleExclamation} />
                </Button>
              </Card.Header>
              <Card.Body>
                {/* X-RAY */}
                <Row className="align-items-start mb-2">
                  <Col md={3}><Form.Label className="mb-0">X-RAY</Form.Label></Col>
                  <Col md={9}><Form.Control as="textarea" rows={2} name="xRay" value={formData.xRay} onChange={handleInputChange} readOnly={isReadOnly} /></Col>
                </Row>
                {/* USG */}
                <Row className="align-items-start mb-2">
                  <Col md={3}><Form.Label className="mb-0">USG</Form.Label></Col>
                  <Col md={9}><Form.Control as="textarea" rows={2} name="usg" value={formData.usg} onChange={handleInputChange} readOnly={isReadOnly} /></Col>
                </Row>
                {/* CT Reports */}
                <Row className="align-items-start mb-2">
                  <Col md={3}><Form.Label className="mb-0">CT Reports</Form.Label></Col>
                  <Col md={9}><Form.Control as="textarea" rows={2} name="ctReports" value={formData.ctReports} onChange={handleInputChange} readOnly={isReadOnly} /></Col>
                </Row>
                {/* ECHO */}
                <Row className="align-items-start mb-2">
                  <Col md={3}><Form.Label className="mb-0">ECHO</Form.Label></Col>
                  <Col md={9}><Form.Control as="textarea" rows={2} name="echo" value={formData.echo} onChange={handleInputChange} readOnly={isReadOnly} /></Col>
                </Row>
                {/* Out Side Investigations */}
                <Row className="align-items-start mb-2">
                  <Col md={3}><Form.Label className="mb-0">Out Side Investigations</Form.Label></Col>
                  <Col md={1} className="text-center"><span>:</span></Col>
                  <Col md={8}><Form.Control as="textarea" rows={2} name="outSideInvestigations" value={formData.outSideInvestigations} onChange={handleInputChange} readOnly={isReadOnly} /></Col>
                </Row>
                {/* Others */}
                <Row className="align-items-start mb-2">
                  <Col md={3}><Form.Label className="mb-0">Others</Form.Label></Col>
                  <Col md={9}><Form.Control as="textarea" rows={2} name="othersInvestigation" value={formData.othersInvestigation} onChange={handleInputChange} readOnly={isReadOnly} /></Col>
                </Row>
                {/* CCHD Screening */}
                <Row className="align-items-start mb-2">
                  <Col md={3}><Form.Label className="mb-0">CCHD Screening</Form.Label></Col>
                  <Col md={3}><Form.Control type="text" name="cchdScreening" value={formData.cchdScreening} onChange={handleInputChange} readOnly={isReadOnly} /></Col>
                </Row>
                {/* Hearing Screening */}
                <Row className="align-items-start mb-2">
                  <Col md={3}><Form.Label className="mb-0">Hearing Screening</Form.Label></Col>
                  <Col md={3}><Form.Control type="text" name="hearingScreening" value={formData.hearingScreening} onChange={handleInputChange} readOnly={isReadOnly} /></Col>
                </Row>
              </Card.Body>
            </Card>
            
            <Modal
              show={showRadiologyModal}
              onHide={() => setShowRadiologyModal(false)}
              size="lg"
              centered
            >
              <Modal.Header closeButton>
                <Modal.Title>Radiology Impressions</Modal.Title>
              </Modal.Header>
              <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
                {loadingRadiologyImpressions ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" size="sm" className="me-2" />
                    <span>Loading radiology impressions...</span>
                  </div>
                ) : radiologyImpressions.length === 0 ? (
                  <div className="text-muted text-center py-3">
                    No radiology impressions available.
                  </div>
                ) : (
                  Object.entries(groupedRadiologyImpressions).map(([particularName, items]) => (
                    <div key={particularName} className="mb-4">
                      <h6 className="fw-bold text-danger mb-2">{particularName}</h6>
                      {items.map((item) => (
                        <Card key={item.id} className="mb-2 border-0 bg-light">
                          <Card.Body className="py-2 px-3">
                            <div className="mb-2">
                              <strong>Study</strong>
                              <div>{item.study || "-"}</div>
                            </div>
                            <div>
                              <strong>Impression</strong>
                              <div>{item.impression || "-"}</div>
                            </div>
                          </Card.Body>
                        </Card>
                      ))}
                    </div>
                  ))
                )}
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowRadiologyModal(false)}>
                  Close
                </Button>
              </Modal.Footer>
            </Modal>

            {/* ── Procedure Done ── */}
            <Card className="mb-3">
              <Card.Header className="bg-light py-2">
                <span className="fw-bold text-danger text-uppercase">Procedure Done</span>
              </Card.Header>
              <Card.Body>
                {/* Name of Surgery */}
                <Row className="align-items-start mb-2" hidden>
                  <Col md={3}><Form.Label className="mb-0">NAME OF THE SURGERY</Form.Label></Col>
                  <Col md={9}><Form.Control as="textarea" rows={2} name="nameOfSurgery" value={formData.nameOfSurgery} onChange={handleInputChange} readOnly={isReadOnly} /></Col>
                </Row>
                {/* Procedure */}
                <Row className="align-items-start mb-2" hidden>
                  <Col md={3}><Form.Label className="mb-0">PROCEDURE</Form.Label></Col>
                  <Col md={9}><Form.Control as="textarea" rows={2} name="procedure" value={formData.procedure} onChange={handleInputChange} readOnly={isReadOnly} /></Col>
                </Row>
                {/* Notes */}
                <Row className="align-items-start mb-2">
                  <Col md={3}><Form.Label className="mb-0">NOTES</Form.Label></Col>
                  <Col md={9}><Form.Control as="textarea" rows={2} name="notes" value={formData.notes} onChange={handleInputChange} readOnly={isReadOnly} /></Col>
                </Row>
                {/* Course in the Hospital */}
                <Row className="align-items-start mb-2">
                  <Col md={3}><Form.Label className="mb-0 fw-bold" style={{ color: "#28a745" }}>Course in the Hospital</Form.Label></Col>
                  <Col md={1} className="text-center"><span>:</span></Col>
                  <Col md={8}><Form.Control as="textarea" rows={2} name="treatmentProvided" value={formData.treatmentProvided} onChange={handleInputChange} readOnly={isReadOnly} /></Col>
                </Row>
                {/* Condition On Discharge */}
                <Row className="align-items-start mb-3">
                  <Col md={3}><Form.Label className="mb-0 fw-bold" style={{ color: "#28a745" }}>Condition On Discharge</Form.Label></Col>
                  <Col md={1} className="text-center"><span>:</span></Col>
                  <Col md={8}><Form.Control as="textarea" rows={2} name="conditionOnDischarge" value={formData.conditionOnDischarge} onChange={handleInputChange} readOnly={isReadOnly} /></Col>
                </Row>

                {/* Medicines Table inline */}
                <Table bordered size="sm">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: "5%" }}>SNo</th>
                      <th>Medicine Name</th>
                      <th style={{ width: "10%" }}>Qty/No</th>
                      <th style={{ width: "15%" }}>Timing</th>
                      <th style={{ width: "18%" }}>Duration</th>
                      {!isReadOnly && <th style={{ width: "8%" }}>Add/Del</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {medicines.map((med, index) => (
                      <tr key={med.id}>
                        <td>{index + 1}</td>
                        <td>
                          <SearchableSelect
                            size="sm"
                            value={med.prodsId ? med.prodsId.toString() : ""}
                            onChange={(selectedValue) => {
                              const selectedSuggestion = (medicineSuggestions[med.id] || []).find(
                                (suggestion: any) => (suggestion.prodsId || 0).toString() === selectedValue
                              );

                              if (selectedSuggestion) {
                                handleMedicineSuggestionSelect(
                                  med.id,
                                  selectedSuggestion.prodsName || selectedSuggestion.medicineName || "",
                                  selectedSuggestion.prodsId || 0
                                );
                              }
                            }}
                            options={(medicineSuggestions[med.id] || []).map((suggestion: any, idx: number) => ({
                              value: suggestion.prodsId || idx,
                              label: suggestion.prodsName || suggestion.medicineName || ""
                            }))}
                            placeholder="Medicine Name"
                            onSearch={(term) => {
                              if (!isReadOnly) {
                                handleMedicineNameInput(med.id, term);
                              }
                            }}
                            disabled={isReadOnly}
                            keepSearchOnBlur
                            searchValue={med.medicineName}
                          />
                        </td>
                        <td>
                          <Form.Control
                            type="text"
                            size="sm"
                            value={med.qtyNo}
                            onChange={e => handleMedicineChange(med.id, "qtyNo", e.target.value)}
                            readOnly={isReadOnly}
                          />
                        </td>
                        <td>
                          <Form.Select
                            size="sm"
                            value={med.timing}
                            onChange={e => handleMedicineChange(med.id, "timing", e.target.value)}
                            disabled={isReadOnly}
                          >
                            <option value="">None</option>
                            {timingOptions.map(opt => (
                              <option key={opt.id} value={opt.id}>{opt.name}</option>
                            ))}
                          </Form.Select>
                        </td>
                        <td>
                          <div className="d-flex gap-1 align-items-center">
                            <Form.Control
                              type="number"
                              size="sm"
                              min="0"
                              style={{ width: "60px" }}
                              value={med.duration || ""}
                              onChange={e => handleMedicineChange(med.id, "duration", Number(e.target.value) || 0)}
                              readOnly={isReadOnly}
                            />
                            <Form.Select
                              size="sm"
                              value={med.period.toString()}
                              onChange={e => handleMedicineChange(med.id, "period", Number(e.target.value) || 0)}
                              disabled={isReadOnly}
                              style={{ width: "80px" }}
                            >
                              <option value="0">None</option>
                              <option value="1">Days</option>
                              <option value="2">Weeks</option>
                              <option value="3">Months</option>
                            </Form.Select>
                          </div>
                        </td>
                        {!isReadOnly && (
                          <td className="text-center">
                            <Button variant="success" size="sm" className="me-1 px-1 py-0" onClick={handleAddMedicine} title="Add">A</Button>
                            <Button variant="danger" size="sm" className="px-1 py-0" onClick={() => handleRemoveMedicine(med.id)} title="Delete">D</Button>
                          </td>
                        )}
                      </tr>
                    ))}
                    {medicines.length === 0 && (
                      <tr>
                        <td colSpan={isReadOnly ? 5 : 6} className="text-center text-muted py-2">No medicines added</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
                
                {/* Drug */}
                <Row className="align-items-start mb-2">
                  <Col md={3}><Form.Label className="mb-0">Drug</Form.Label></Col>
                  <Col md={9}><Form.Control as="textarea" rows={2} name="drug" value={formData.drug} onChange={handleInputChange} readOnly={isReadOnly} /></Col>
                </Row>

              </Card.Body>
            </Card>

            {/* ── Discharge Advice ── */}
            <Card className="mb-3">
              <Card.Header className="bg-light py-2">
                <span className="fw-bold text-danger">Disease specific Discharge Advice</span>
              </Card.Header>
              <Card.Body>

                {/* Diet */}
                <Row className="align-items-start mb-2">
                  <Col md={3}><Form.Label className="mb-0">Diet</Form.Label></Col>
                  <Col md={9}><Form.Control as="textarea" rows={2} name="diet" value={formData.diet} onChange={handleInputChange} readOnly={isReadOnly} /></Col>
                </Row>
                {/* Wound care Related */}
                <Row className="align-items-start mb-2">
                  <Col md={3}><Form.Label className="mb-0">Wound care Related</Form.Label></Col>
                  <Col md={9}><Form.Control as="textarea" rows={2} name="woundCareRelated" value={formData.woundCareRelated} onChange={handleInputChange} readOnly={isReadOnly} /></Col>
                </Row>
                {/* Disease related discharge Advice */}
                <Row className="align-items-start mb-2">
                  <Col md={3}><Form.Label className="mb-0">Disease related discharge Advice</Form.Label></Col>
                  <Col md={9}><Form.Control as="textarea" rows={2} name="diseaseSpecificDischargeAdvice" value={formData.diseaseSpecificDischargeAdvice} onChange={handleInputChange} readOnly={isReadOnly} /></Col>
                </Row>
                {/* Symptoms */}
                <Row className="align-items-start mb-3">
                  <Col md={3}><Form.Label className="mb-0">Symptoms</Form.Label></Col>
                  <Col md={9}><Form.Control as="textarea" rows={2} name="symptoms" value={formData.symptoms} onChange={handleInputChange} readOnly={isReadOnly} /></Col>
                </Row>
              </Card.Body>
            </Card>

            {!isReadOnly && (
              <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={onBack} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  <FontAwesomeIcon icon={faSave} className="me-1" />
                  {isSubmitting
                    ? "Saving..."
                    : mode === "verification" && patient.summaryData
                    ? "Update"
                    : mode === "verification"
                    ? "Save & Send for Verification"
                    : "Save"}
                </Button>
              </div>
            )}
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default GeneralDetailForm;
