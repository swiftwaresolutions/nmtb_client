import React, { useState, useEffect, useRef } from "react";
import { Card, Form, Button, Row, Col, Container, Table } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSave, faPrint } from "@fortawesome/free-solid-svg-icons";
import { showSuccessToast, showErrorToast, showValidationError } from "../../../../../utils/alertUtil";
import { MedicalRecordsApiService } from "../../../../../api/medical-records/medical-records-api-service";
import { LaboratoryApiService } from "../../../../../api/laboratory/laboratory-api-service";
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

interface MaternityPatient {
  patId: number;
  visitId: number;
  ipId: number;
  patientName: string;
  opNo: string;
  ipNo: string;
  age: number;
  sex: string;
  department: string;
  ward: string;
  doctor: string;
  doa: string;
  phone: string;
  guardianName?: string;
  guardianType?: string;
}

interface BabyDetail {
  id: number;
  summaryId?: number;
  visitId?: number;
  noOfBaby?: number;
  babyDetailId?: number;
  babyNo: string;
  date: string;
  timeHH: string;
  timeMM: string;
  timeAMPM: string;
  sex: string;
  status: string;
  weight: string;
  apgar: string;
}

interface MaternityDetailFormProps {
  patient: MaternityPatient & { summaryData?: any };
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

const MaternityDetailForm: React.FC<MaternityDetailFormProps> = ({ patient, onBack, mode }) => {
  const loginData = useSelector((state: RootState) => state.loginData);
  const medicalRecordsApiService = new MedicalRecordsApiService();
  const laboratoryApiService = new LaboratoryApiService();
  const apiService = new MedicalRecordsApiService();

  const normalizeToInputDate = (value: any): string => {
    if (!value) {
      return "";
    }

    const text = String(value).trim();

    // Already in input date format or ISO datetime starting with date.
    if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
      return text.slice(0, 10);
    }

    // Convert dd-MM-yyyy to yyyy-MM-dd for date inputs.
    const ddMmYyyyMatch = text.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (ddMmYyyyMatch) {
      const [, dd, mm, yyyy] = ddMmYyyyMatch;
      return `${yyyy}-${mm}-${dd}`;
    }

    // Fallback for other parseable date strings.
    const parsed = new Date(text);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().split("T")[0];
    }

    return "";
  };

  const toApiDate = (inputDate: string): string => {
    if (!inputDate) {
      return "";
    }

    return normalizeToInputDate(inputDate);
  };

  const parseBirthTime = (birthTime: any): { timeHH: string; timeMM: string; timeAMPM: string } => {
    if (!birthTime) {
      return { timeHH: "", timeMM: "", timeAMPM: "AM" };
    }

    const text = String(birthTime).trim();

    // Expected formats: "10:30 AM", "22:30", "10:30"
    const amPmMatch = text.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (amPmMatch) {
      return {
        timeHH: amPmMatch[1].padStart(2, "0"),
        timeMM: amPmMatch[2],
        timeAMPM: amPmMatch[3].toUpperCase()
      };
    }

    const hhMmMatch = text.match(/^(\d{1,2}):(\d{2})$/);
    if (hhMmMatch) {
      const hour24 = Number(hhMmMatch[1]);
      const minute = hhMmMatch[2];

      if (Number.isNaN(hour24)) {
        return { timeHH: "", timeMM: "", timeAMPM: "AM" };
      }

      const isPm = hour24 >= 12;
      const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;

      return {
        timeHH: String(hour12).padStart(2, "0"),
        timeMM: minute,
        timeAMPM: isPm ? "PM" : "AM"
      };
    }

    return { timeHH: "", timeMM: "", timeAMPM: "AM" };
  };

  const formatBirthTime = (baby: BabyDetail): string => {
    const hh = (baby.timeHH || "").trim();
    const mm = (baby.timeMM || "").trim();

    if (!hh || !mm) {
      return "";
    }

    return `${hh.padStart(2, "0")}:${mm.padStart(2, "0")} ${(baby.timeAMPM || "AM").toUpperCase()}`;
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [babyDetails, setBabyDetails] = useState<BabyDetail[]>([]);
  const [labResults, setLabResults] = useState<LabTestResult[]>([]);
  const [loadingLabResults, setLoadingLabResults] = useState<boolean>(false);
  const historyRef = useRef<HTMLTextAreaElement>(null);
  const skipNoOfBabiesEffect = useRef(false);

  // Form state
  const [formData, setFormData] = useState({
    // Bio Data
    name: patient.patientName || "",
    age: patient.age || 0,
    sex: patient.sex || "",
    address: "",
    department: patient.department || "",
    modifiedAddress: "",
    opNo: patient.opNo || "",
    ipNo: patient.ipNo || "",
    ward: patient.ward || "",
    doa: normalizeToInputDate(patient.doa),
    dosEnabled: false,
    dos: "",
    dodEnabled: false,
    dod: "",
    dot: "",

    // History
    history: "",

    // On Examination
    bpSystolic: "",
    bpDiastolic: "",
    temperature: "",
    pulse: "",
    respiratory: "",
    weight: "",
    paUterus: "",
    conditionUt: "",
    positionFoetus: "",
    fhr: "",
    pv: "",
    cx: "",
    os: "",
    membrane: "",
    vertex: "",
    pelvis: "",
    investigation: "",

    // Delivery Details
    modeOfDelivery: "",
    indication: "",
    noOfBabies: 0,
    postnatalPeriod: "",
    conditionOnDischarge: "",
    adviceOnDischarge: "",
    courseInHospital: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // Pre-fill form with fetched summary data if available
  useEffect(() => {
    if (patient.summaryData) {
      const data = patient.summaryData;
      setFormData({
        name: patient.patientName || "",
        age: patient.age || 0,
        sex: patient.sex || "",
        address: "",
        department: patient.department || "",
        modifiedAddress: data.newAddres || "",
        opNo: patient.opNo || "",
        ipNo: patient.ipNo || "",
        ward: patient.ward || "",
        doa: normalizeToInputDate(patient.doa),
        dosEnabled: !!data.matSurgerDate,
        dos: normalizeToInputDate(data.matSurgerDate),
        dodEnabled: !!data.dateOfDischarge,
        dod: normalizeToInputDate(data.dateOfDischarge),
        dot: data.dischargeTime ? data.dischargeTime.substring(0, 5) : "",
        history: data.history || "",
        bpSystolic: data.blood?.toString() || "",
        bpDiastolic: data.pressure?.toString() || "",
        temperature: data.temp?.toString() || "",
        pulse: data.pulse?.toString() || "",
        respiratory: data.resp?.toString() || "",
        weight: data.weight?.toString() || "",
        paUterus: data.paut || "",
        conditionUt: data.conditionUt || "",
        positionFoetus: data.foetus || "",
        fhr: data.fhr || "",
        pv: data.pv1 || "",
        cx: data.pv2 || "",
        os: data.os || "",
        membrane: data.membrane || "",
        vertex: data.vertex || "",
        pelvis: data.pelvis || "",
        investigation: "",
        modeOfDelivery: data.modeOfdeliv || "",
        indication: data.indication || "",
        noOfBabies: data.noofbabys || 0,
        postnatalPeriod: data.period || "",
        conditionOnDischarge: data.conditionDis || "",
        adviceOnDischarge: data.adviceDis || "",
        courseInHospital: data.courseInTheHos || ""
      });

      const incomingBabyDetails = Array.isArray(data.babyDetails) ? data.babyDetails : [];
      if (incomingBabyDetails.length > 0) {
        const mappedBabies: BabyDetail[] = incomingBabyDetails.map((baby: any, index: number) => {
          const parsedTime = parseBirthTime(baby.birthTime);

          return {
            id: baby.id || index + 1,
            summaryId: baby.summaryId || data.id || 0,
            visitId: baby.visitId || patient.visitId || 0,
            noOfBaby: baby.noOfBaby || index + 1,
            babyDetailId: baby.babyDetailId || 0,
            babyNo: `#${baby.noOfBaby || index + 1}`,
            date: normalizeToInputDate(baby.birthDate),
            timeHH: parsedTime.timeHH,
            timeMM: parsedTime.timeMM,
            timeAMPM: parsedTime.timeAMPM,
            sex: baby.sex || "",
            status: baby.status || "",
            weight: baby.weight ? String(baby.weight) : "",
            apgar: baby.apgar || ""
          };
        });

        setBabyDetails(mappedBabies);
        skipNoOfBabiesEffect.current = true;
      }
    }

    // Focus the history field after pre-filling
    setTimeout(() => {
      historyRef.current?.focus();
    }, 100);
  }, [patient.summaryData, patient.visitId]);

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

  // Automatically adjust baby details based on noOfBabies
  useEffect(() => {
    if (skipNoOfBabiesEffect.current) {
      skipNoOfBabiesEffect.current = false;
      return;
    }
    const count = Number(formData.noOfBabies) || 0;
    
    setBabyDetails(prev => {
      if (count === 0) {
        return [];
      } else if (count > prev.length) {
        // Add more baby details
        const newBabies: BabyDetail[] = [];
        for (let i = prev.length + 1; i <= count; i++) {
          newBabies.push({
            id: i,
            babyNo: `#${i}`,
            date: "",
            timeHH: "",
            timeMM: "",
            timeAMPM: "AM",
            sex: "",
            status: "",
            weight: "",
            apgar: ""
          });
        }
        return [...prev, ...newBabies];
      } else if (count < prev.length) {
        // Remove excess baby details
        return prev.slice(0, count);
      }
      return prev;
    });
  }, [formData.noOfBabies]);

  const handleBabyDetailChange = (id: number, field: keyof BabyDetail, value: string) => {
    setBabyDetails(prev =>
      prev.map(baby =>
        baby.id === id ? { ...baby, [field]: value } : baby
      )
    );
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.history.trim()) {
      showValidationError("Please enter history");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        patId: patient.patId,
        visitId: patient.visitId,
        ipId: patient.ipId,
        dateOfDischarge: formData.dodEnabled ? toApiDate(formData.dod) : "",
        dischargeTime: formData.dodEnabled ? formData.dot : "",
        uid: loginData.id || 0,
        history: formData.history,
        newAddres: formData.modifiedAddress,
        blood: parseFloat(formData.bpSystolic) || 0,
        pressure: parseFloat(formData.bpDiastolic) || 0,
        temp: parseFloat(formData.temperature) || 0,
        pulse: parseFloat(formData.pulse) || 0,
        resp: parseFloat(formData.respiratory) || 0,
        weight: parseFloat(formData.weight) || 0,
        paut: formData.paUterus,
        conditionUt: formData.conditionUt,
        foetus: formData.positionFoetus,
        fhr: formData.fhr,
        noofbabys: formData.noOfBabies,
        period: formData.postnatalPeriod,
        pv1: formData.pv,
        pv2: formData.cx,
        os: formData.os,
        membrane: formData.membrane,
        vertex: formData.vertex,
        pelvis: formData.pelvis,
        modeOfdeliv: formData.modeOfDelivery,
        conditionDis: formData.conditionOnDischarge,
        adviceDis: formData.adviceOnDischarge,
        indication: formData.indication,
        courseInTheHos: formData.courseInHospital,
        matSurgerDate: formData.dosEnabled ? toApiDate(formData.dos) : "",
        toa: toApiDate(normalizeToInputDate(patient.doa)),
        tos: formData.dosEnabled ? toApiDate(formData.dos) : "",
        tod: formData.dodEnabled ? toApiDate(formData.dod) : "",
        babyDetails: babyDetails.map((baby, index) => ({
          id: baby.id || 0,
          patId: patient.patId,
          summaryId: baby.summaryId || patient.summaryData?.id || 0,
          visitId: patient.visitId,
          noOfBaby: baby.noOfBaby || index + 1,
          babyDetailId: baby.babyDetailId || 0,
          birthDate: toApiDate(baby.date),
          birthTime: formatBirthTime(baby),
          sex: baby.sex || "",
          status: baby.status || "",
          weight: parseFloat(baby.weight) || 0,
          apgar: baby.apgar || "",
          entDate: "",
          entTime: "",
          entUid: loginData.id || 0,
          editDate: "",
          editTime: "",
          editUid: patient.summaryData?.id ? loginData.id || 0 : 0,
          extra1: 0,
          extra2: 0,
          extra3: 0
        }))
      };

      // Use update API if patient has summaryData (existing record), otherwise use save API
      let savedSummary;
      if (patient.summaryData && patient.summaryData.id) {
        savedSummary = await medicalRecordsApiService.updateMaternityDischargeSummary(patient.summaryData.id, payload);
      } else {
        savedSummary = await medicalRecordsApiService.saveMaternityDischargeSummary(payload);
      }
      
      // Handle workflow based on mode
      if (mode === "verification") {
        // Verification workflow - Backend API not yet implemented
        // TODO: Backend needs to implement verifyMaternityDischargeSummary endpoint
        showSuccessToast("Maternity discharge summary saved successfully!");
      } else if (mode === "approval") {
        // Approval is handled in ApprovalTab component
        showSuccessToast("Maternity discharge summary updated successfully!");
      } else if (mode === "print") {
        showSuccessToast("Maternity discharge summary updated successfully!");
      }
      
      // Optionally go back after save
      setTimeout(() => {
        onBack();
      }, 1500);
    } catch (error: any) {
      console.error("Error saving maternity summary:", error);
      showErrorToast(
        error?.response?.data?.error || "Failed to save maternity discharge summary"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container fluid className="px-4 py-3" style={{ height: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column' }}>
      <Card style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Card.Header className="d-flex justify-content-between align-items-center text-white" style={{ backgroundColor: 'var(--page-secondary-color)' }}>
          <h5 className="mb-0">
            <FontAwesomeIcon icon={faArrowLeft} className="me-2 cursor-pointer" onClick={onBack} />
            Maternity Discharge Summary - {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </h5>
          <div>
            <Button variant="light" size="sm" className="me-2" onClick={onBack}>
              <FontAwesomeIcon icon={faArrowLeft} className="me-1" />
              Back
            </Button>
          </div>
        </Card.Header>

        <Card.Body style={{ flex: 1, overflow: 'auto', paddingBottom: '80px' }}>
          <Form onSubmit={handleSubmit}>
            {/* Bio Data Section */}
            <Card className="mb-3">
              <Card.Header className="bg-light py-2">
                <strong>Bio data:</strong>
              </Card.Header>
              <Card.Body>
                {/* Row 1 */}
                <Row className="mb-2">
                  <Col md={6}>
                    <Row className="align-items-center">
                      <Col xs={4} className="text-start">
                        <Form.Label className="mb-0 small">Name</Form.Label>
                      </Col>
                      <Col xs={1} className="text-center px-0">
                        <span>:</span>
                      </Col>
                      <Col xs={7}>
                        <Form.Control
                          type="text"
                          size="sm"
                          value={formData.name}
                          readOnly
                          style={{ border: 'none', borderBottom: '1px solid #dee2e6', borderRadius: 0, backgroundColor: 'transparent' }}
                        />
                      </Col>
                    </Row>
                  </Col>
                  <Col md={6}>
                    <Row className="align-items-center">
                      <Col xs={4} className="text-start">
                        <Form.Label className="mb-0 small">Op No / Ip No</Form.Label>
                      </Col>
                      <Col xs={1} className="text-center px-0">
                        <span>:</span>
                      </Col>
                      <Col xs={7}>
                        <Form.Control
                          type="text"
                          size="sm"
                          value={`${formData.opNo} - ${formData.ipNo}`}
                          readOnly
                          style={{ border: 'none', borderBottom: '1px solid #dee2e6', borderRadius: 0, backgroundColor: 'transparent' }}
                        />
                      </Col>
                    </Row>
                  </Col>
                </Row>

                {/* Row 2 */}
                <Row className="mb-2">
                  <Col md={6}>
                    <Row className="align-items-center">
                      <Col xs={4} className="text-start">
                        <Form.Label className="mb-0 small">Age / Sex</Form.Label>
                      </Col>
                      <Col xs={1} className="text-center px-0">
                        <span>:</span>
                      </Col>
                      <Col xs={7}>
                        <Form.Control
                          type="text"
                          size="sm"
                          value={`${formData.age} / ${formData.sex}`}
                          readOnly
                          style={{ border: 'none', borderBottom: '1px solid #dee2e6', borderRadius: 0, backgroundColor: 'transparent' }}
                        />
                      </Col>
                    </Row>
                  </Col>
                  <Col md={6}>
                    <Row className="align-items-center">
                      <Col xs={4} className="text-start">
                        <Form.Label className="mb-0 small">Ward</Form.Label>
                      </Col>
                      <Col xs={1} className="text-center px-0">
                        <span>:</span>
                      </Col>
                      <Col xs={7}>
                        <Form.Control
                          type="text"
                          size="sm"
                          value={formData.ward}
                          readOnly
                          style={{ border: 'none', borderBottom: '1px solid #dee2e6', borderRadius: 0, backgroundColor: 'transparent' }}
                        />
                      </Col>
                    </Row>
                  </Col>
                </Row>

                {/* Row 3 */}
                <Row className="mb-2">
                  <Col md={6}>
                    <Row className="align-items-center">
                      <Col xs={4} className="text-start">
                        <Form.Label className="mb-0 small">Address</Form.Label>
                      </Col>
                      <Col xs={1} className="text-center px-0">
                        <span>:</span>
                      </Col>
                      <Col xs={7}>
                        <Form.Control
                          type="text"
                          size="sm"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          placeholder="Obstetrics, ICU"
                          style={{ border: 'none', borderBottom: '1px solid #dee2e6', borderRadius: 0 }}
                        />
                      </Col>
                    </Row>
                  </Col>
                  <Col md={6}>
                    <Row className="align-items-center">
                      <Col xs={4} className="text-start">
                        <Form.Label className="mb-0 small">DOA</Form.Label>
                      </Col>
                      <Col xs={1} className="text-center px-0">
                        <span>:</span>
                      </Col>
                      <Col xs={7}>
                        <Form.Control
                          type="date"
                          size="sm"
                          value={formData.doa}
                          readOnly
                          style={{ border: 'none', borderBottom: '1px solid #dee2e6', borderRadius: 0, backgroundColor: 'transparent' }}
                        />
                      </Col>
                    </Row>
                  </Col>
                </Row>

                {/* Row 4 */}
                <Row className="mb-2">
                  <Col md={6}>
                    <Row className="align-items-center">
                      <Col xs={4} className="text-start">
                        <Form.Label className="mb-0 small">Modified Address</Form.Label>
                      </Col>
                      <Col xs={1} className="text-center px-0">
                        <span>:</span>
                      </Col>
                      <Col xs={7}>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          size="sm"
                          name="modifiedAddress"
                          value={formData.modifiedAddress}
                          onChange={handleInputChange}
                          style={{ border: 'none', borderBottom: '1px solid #dee2e6', borderRadius: 0 }}
                        />
                      </Col>
                    </Row>
                  </Col>
                  <Col md={6}>
                    <Row className="align-items-center">
                      <Col xs={4} className="text-start">
                        <Form.Label className="mb-0 small">DOS</Form.Label>
                      </Col>
                      <Col xs={1} className="text-center px-0">
                        <span>:</span>
                      </Col>
                      <Col xs={7}>
                        <div className="d-flex align-items-center gap-2">
                          <Form.Check
                            type="checkbox"
                            name="dosEnabled"
                            checked={formData.dosEnabled}
                            onChange={handleInputChange}
                            label="If having surgery"
                            className="small"
                          />
                        </div>
                        {formData.dosEnabled && (
                          <Form.Control
                            type="date"
                            size="sm"
                            name="dos"
                            value={formData.dos}
                            onChange={handleInputChange}
                            className="mt-1"
                          />
                        )}
                      </Col>
                    </Row>
                  </Col>
                </Row>

                {/* Row 5 */}
                <Row className="mb-2">
                  <Col md={6}>
                    {/* Empty space */}
                  </Col>
                  <Col md={6}>
                    <Row className="align-items-center">
                      <Col xs={4} className="text-start">
                        <Form.Label className="mb-0 small">DOD</Form.Label>
                      </Col>
                      <Col xs={1} className="text-center px-0">
                        <span>:</span>
                      </Col>
                      <Col xs={7}>
                        <div className="d-flex align-items-center gap-2">
                          <Form.Check
                            type="checkbox"
                            name="dodEnabled"
                            checked={formData.dodEnabled}
                            onChange={handleInputChange}
                            className="small"
                          />
                        </div>
                        {formData.dodEnabled && (
                          <div className="d-flex gap-2 mt-1">
                            <Form.Control
                              type="date"
                              size="sm"
                              name="dod"
                              value={formData.dod}
                              onChange={handleInputChange}
                              style={{ flex: 1 }}
                            />
                            <Form.Control
                              type="time"
                              size="sm"
                              name="dot"
                              value={formData.dot}
                              onChange={handleInputChange}
                              style={{ flex: 0.8 }}
                            />
                          </div>
                        )}
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* History Section */}
            <Card className="mb-3">
              <Card.Header className="bg-light py-2">
                <strong>HISTORY:</strong>
              </Card.Header>
              <Card.Body>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="history"
                  value={formData.history}
                  onChange={handleInputChange}
                  placeholder="Enter patient history..."
                  ref={historyRef}
                />
              </Card.Body>
            </Card>

            {/* On Examination Section */}
            <Card className="mb-3">
              <Card.Header className="bg-light py-2">
                <strong>ON EXAMINATION:</strong>
              </Card.Header>
              <Card.Body>
                <Row className="mb-2 align-items-center">
                  <Col xs={4} className="text-start">
                    <Form.Label className="mb-0 small">BP</Form.Label>
                  </Col>
                  <Col xs={1} className="text-center px-0">
                    <span>:</span>
                  </Col>
                  <Col xs={7}>
                    <div className="d-flex align-items-center gap-1">
                      <Form.Control
                        type="text"
                        size="sm"
                        name="bpSystolic"
                        value={formData.bpSystolic}
                        onChange={handleInputChange}
                        // placeholder="120"
                        style={{ width: '80px' }}
                      />
                      <span>/</span>
                      <Form.Control
                        type="text"
                        size="sm"
                        name="bpDiastolic"
                        value={formData.bpDiastolic}
                        onChange={handleInputChange}
                        // placeholder="80"
                        style={{ width: '80px' }}
                      />
                      <span className="small">MM OF HG</span>
                    </div>
                  </Col>
                </Row>

                <Row className="mb-2 align-items-center">
                  <Col xs={4} className="text-start">
                    <Form.Label className="mb-0 small">Temp</Form.Label>
                  </Col>
                  <Col xs={1} className="text-center px-0">
                    <span>:</span>
                  </Col>
                  <Col xs={7}>
                    <div className="d-flex align-items-center gap-2">
                      <Form.Control
                        type="text"
                        step="0.01"
                        size="sm"
                        name="temperature"
                        value={formData.temperature}
                        onChange={handleInputChange}
                        // placeholder="98.6"
                        style={{ width: '100px' }}
                      />
                      <span className="small">°F</span>
                    </div>
                  </Col>
                </Row>

                <Row className="mb-2 align-items-center">
                  <Col xs={4} className="text-start">
                    <Form.Label className="mb-0 small">Pulse</Form.Label>
                  </Col>
                  <Col xs={1} className="text-center px-0">
                    <span>:</span>
                  </Col>
                  <Col xs={7}>
                    <div className="d-flex align-items-center gap-2">
                      <Form.Control
                        type="text"
                        size="sm"
                        name="pulse"
                        value={formData.pulse}
                        onChange={handleInputChange}
                        // placeholder="72"
                        style={{ width: '100px' }}
                      />
                      <span className="small">/ MIN S</span>
                    </div>
                  </Col>
                </Row>

                <Row className="mb-2 align-items-center">
                  <Col xs={4} className="text-start">
                    <Form.Label className="mb-0 small">Resp</Form.Label>
                  </Col>
                  <Col xs={1} className="text-center px-0">
                    <span>:</span>
                  </Col>
                  <Col xs={7}>
                    <div className="d-flex align-items-center gap-2">
                      <Form.Control
                        type="text"
                        size="sm"
                        name="respiratory"
                        value={formData.respiratory}
                        onChange={handleInputChange}
                        // placeholder="16"
                        style={{ width: '100px' }}
                      />
                      <span className="small">/ mins</span>
                    </div>
                  </Col>
                </Row>

                <Row className="mb-2 align-items-center">
                  <Col xs={4} className="text-start">
                    <Form.Label className="mb-0 small">Weight</Form.Label>
                  </Col>
                  <Col xs={1} className="text-center px-0">
                    <span>:</span>
                  </Col>
                  <Col xs={7}>
                    <div className="d-flex align-items-center gap-2">
                      <Form.Control
                        type="text"
                        step="0.1"
                        size="sm"
                        name="weight"
                        value={formData.weight}
                        onChange={handleInputChange}
                        // placeholder="65.5"
                        style={{ width: '100px' }}
                      />
                      <span className="small">KG</span>
                    </div>
                  </Col>
                </Row>

                <Row className="mb-2 align-items-center">
                  <Col xs={4} className="text-start">
                    <Form.Label className="mb-0 small">PA Uterus (PA UT)</Form.Label>
                  </Col>
                  <Col xs={1} className="text-center px-0">
                    <span>:</span>
                  </Col>
                  <Col xs={7}>
                    <Form.Control
                      type="text"
                      size="sm"
                      name="paUterus"
                      value={formData.paUterus}
                      onChange={handleInputChange}
                    />
                  </Col>
                </Row>

                <Row className="mb-2 align-items-center">
                  <Col xs={4} className="text-start">
                    <Form.Label className="mb-0 small">Condition of Ut</Form.Label>
                  </Col>
                  <Col xs={1} className="text-center px-0">
                    <span>:</span>
                  </Col>
                  <Col xs={7}>
                    <Form.Select
                      size="sm"
                      name="conditionUt"
                      value={formData.conditionUt}
                      onChange={handleInputChange}
                    >
                      <option value="">Select</option>
                      <option value="Mild Acting">Mild Acting</option>
                      <option value="Very Mildacting">Very Mildacting</option>
                      <option value="No Acting">No Acting</option>
                      <option value="Acting">Acting</option>

                    </Form.Select>
                  </Col>
                </Row>

                <Row className="mb-2 align-items-center">
                  <Col xs={4} className="text-start">
                    <Form.Label className="mb-0 small">Position Of Foetus</Form.Label>
                  </Col>
                  <Col xs={1} className="text-center px-0">
                    <span>:</span>
                  </Col>
                  <Col xs={7}>
                    <Form.Select
                      size="sm"
                      name="positionFoetus"
                      value={formData.positionFoetus}
                      onChange={handleInputChange}
                    >
                      <option value="">Select</option>
                      <option value="ROA/LOA">ROA/LOA</option>
                      <option value="ROA">ROA</option>
                      <option value="LOA">LOA</option>
                      <option value="NIL">NIL</option>
                    </Form.Select>
                  </Col>
                </Row>

                <Row className="mb-2 align-items-center">
                  <Col xs={4} className="text-start">
                    <Form.Label className="mb-0 small">FHR</Form.Label>
                  </Col>
                  <Col xs={1} className="text-center px-0">
                    <span>:</span>
                  </Col>
                  <Col xs={7}>
                    <Form.Control
                      type="text"
                      size="sm"
                      name="fhr"
                      value={formData.fhr}
                      onChange={handleInputChange}
                    />
                  </Col>
                </Row>

                <Row className="mb-2 align-items-center">
                  <Col xs={4} className="text-start">
                    <Form.Label className="mb-0 small">PV</Form.Label>
                  </Col>
                  <Col xs={1} className="text-center px-0">
                    <span>:</span>
                  </Col>
                  <Col xs={7}>
                    <div className="d-flex align-items-center gap-2">
                      <Form.Control
                        type="text"
                        size="sm"
                        name="pv"
                        value={formData.pv}
                        onChange={handleInputChange}
                        placeholder="Cx"
                        style={{ flex: 1 }}
                      />
                      <span>-</span>
                      <Form.Select
                        size="sm"
                        name="cx"
                        value={formData.cx}
                        onChange={handleInputChange}
                        style={{ width: '150px' }}
                      >
                        <option value="">Select</option>
                        <option value="Well Effaced">Well Effaced</option>
                        <option value="Un Effaced">Un Effaced</option>
                        <option value="Effaced">Effaced</option>
                        <option value="Soft">Soft</option>
                      </Form.Select>
                    </div>
                  </Col>
                </Row>

                <Row className="mb-2 align-items-center">
                  <Col xs={4} className="text-start">
                    <Form.Label className="mb-0 small">Os</Form.Label>
                  </Col>
                  <Col xs={1} className="text-center px-0">
                    <span>:</span>
                  </Col>
                  <Col xs={7}>
                    <Form.Control
                      type="text"
                      size="sm"
                      name="os"
                      value={formData.os}
                      onChange={handleInputChange}
                    />
                  </Col>
                </Row>

                <Row className="mb-2 align-items-center">
                  <Col xs={4} className="text-start">
                    <Form.Label className="mb-0 small">Membrane</Form.Label>
                  </Col>
                  <Col xs={1} className="text-center px-0">
                    <span>:</span>
                  </Col>
                  <Col xs={7}>
                    <Form.Control
                      type="text"
                      size="sm"
                      name="membrane"
                      value={formData.membrane}
                      onChange={handleInputChange}
                    />
                  </Col>
                </Row>

                <Row className="mb-2 align-items-center">
                  <Col xs={4} className="text-start">
                    <Form.Label className="mb-0 small">Vertex</Form.Label>
                  </Col>
                  <Col xs={1} className="text-center px-0">
                    <span>:</span>
                  </Col>
                  <Col xs={7}>
                    <Form.Control
                      type="text"
                      size="sm"
                      name="vertex"
                      value={formData.vertex}
                      onChange={handleInputChange}
                    />
                  </Col>
                </Row>

                <Row className="mb-2 align-items-center">
                  <Col xs={4} className="text-start">
                    <Form.Label className="mb-0 small">Pelvis</Form.Label>
                  </Col>
                  <Col xs={1} className="text-center px-0">
                    <span>:</span>
                  </Col>
                  <Col xs={7}>
                    <Form.Control
                      type="text"
                      size="sm"
                      name="pelvis"
                      value={formData.pelvis}
                      onChange={handleInputChange}
                    />
                  </Col>
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
                  {labResults.map((test, index) => (
                    <div key={index} className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="mb-0 text-primary">{test.testName}</h6>
                        <small className="text-muted">
                          {test.testDate && new Date(test.testDate).toLocaleDateString()}
                        </small>
                      </div>
                      
                      {test.fields && test.fields.length > 0 && (
                        <Table bordered size="sm" className="mb-0" style={{ fontSize: '0.875rem' }}>
                          <thead style={{ backgroundColor: '#f8f9fa' }}>
                            <tr>
                              <th style={{ width: '40%' }}>Parameter</th>
                              <th style={{ width: '20%' }}>Result</th>
                              <th style={{ width: '15%' }}>Unit</th>
                              <th style={{ width: '25%' }}>Reference Range</th>
                            </tr>
                          </thead>
                          <tbody>
                            {test.fields.map((field, fieldIndex) => {
                              if (!hasDisplayableLabField(field)) {
                                return null;
                              }

                              let refRange = getReferenceRange(field, patient.age, patient.sex);
                              const cutoffFlag = Number(field.cutoff) === 1;
                              const intervalFlag = Number(field.intervalFlag) === 1;

                              if (!refRange && cutoffFlag) {
                                refRange = field.cutoffGreater || field.cutoffLower || '';
                              } else if (!refRange && intervalFlag) {
                                refRange = `${field.interLower || ''} - ${field.interHigher || ''}`;
                              }

                              return (
                                <tr key={fieldIndex}>
                                  <td>{field.fieldName}</td>
                                  <td className="fw-semibold">{field.resultValue || '-'}</td>
                                  <td>{field.unit || ''}</td>
                                  <td>{refRange || '-'}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </Table>
                      )}
                      
                      {index < labResults.length - 1 && <hr className="my-3" />}
                    </div>
                  ))}
                </Card.Body>
              </Card>
            ) : null}

            {/* Delivery Details Section */}
            <Card className="mb-3">
              <Card.Header className="bg-light py-2">
                <strong>DELIVERY DETAILS:</strong>
              </Card.Header>
              <Card.Body>
                <Row className="mb-2 align-items-center">
                  <Col xs={4} className="text-start">
                    <Form.Label className="mb-0 small">Mode Of Delivery</Form.Label>
                  </Col>
                  <Col xs={1} className="text-center px-0">
                    <span>:</span>
                  </Col>
                  <Col xs={7}>
                    <Form.Control
                      type="text"
                      size="sm"
                      name="modeOfDelivery"
                      value={formData.modeOfDelivery}
                      onChange={handleInputChange}
                    />
                  </Col>
                </Row>

                <Row className="mb-2 align-items-center">
                  <Col xs={4} className="text-start">
                    <Form.Label className="mb-0 small">Indication</Form.Label>
                  </Col>
                  <Col xs={1} className="text-center px-0">
                    <span>:</span>
                  </Col>
                  <Col xs={7}>
                    <Form.Control
                      type="text"
                      size="sm"
                      name="indication"
                      value={formData.indication}
                      onChange={handleInputChange}
                    />
                  </Col>
                </Row>

                <Row className="mb-2 align-items-center">
                  <Col xs={4} className="text-start">
                    <Form.Label className="mb-0 small">No Of Babies</Form.Label>
                  </Col>
                  <Col xs={1} className="text-center px-0">
                    <span>:</span>
                  </Col>
                  <Col xs={7}>
                    <Form.Control
                      type="text"
                      size="sm"
                      name="noOfBabies"
                      value={formData.noOfBabies}
                      onChange={handleInputChange}
                      min="0"
                      style={{ width: '100px' }}
                    />
                  </Col>
                </Row>

                {formData.noOfBabies > 0 && (
                  <Row className="mb-3">
                    <Col xs={12}>
                      <Card className="border">
                        <Card.Body>
                          <h6 className="mb-3">Baby Details</h6>
                          {babyDetails.map((baby, index) => (
                            <Card key={baby.id} className="mb-3 p-3 border">
                              <Row className="mb-2 align-items-center">
                                <Col xs={4} className="text-start">
                                  <Form.Label className="mb-0 small">Baby No</Form.Label>
                                </Col>
                                <Col xs={1} className="text-center px-0">
                                  <span>:</span>
                                </Col>
                                <Col xs={7}>
                                  <Form.Control
                                    type="text"
                                    size="sm"
                                    value={baby.babyNo}
                                    readOnly
                                    disabled
                                    style={{ width: '100px' }}
                                  />
                                </Col>
                              </Row>

                              <Row className="mb-2 align-items-center">
                                <Col xs={4} className="text-start">
                                  <Form.Label className="mb-0 small">Date</Form.Label>
                                </Col>
                                <Col xs={1} className="text-center px-0">
                                  <span>:</span>
                                </Col>
                                <Col xs={7}>
                                  <Form.Control
                                    type="date"
                                    size="sm"
                                    value={baby.date}
                                    onChange={(e) => handleBabyDetailChange(baby.id, "date", e.target.value)}
                                    style={{ width: '200px' }}
                                  />
                                </Col>
                              </Row>

                              <Row className="mb-2 align-items-center">
                                <Col xs={4} className="text-start">
                                  <Form.Label className="mb-0 small">Time</Form.Label>
                                </Col>
                                <Col xs={1} className="text-center px-0">
                                  <span>:</span>
                                </Col>
                                <Col xs={7}>
                                  <div className="d-flex align-items-center gap-2">
                                    <Form.Control
                                      type="text"
                                      size="sm"
                                      placeholder="HH"
                                      maxLength={2}
                                      value={baby.timeHH}
                                      onChange={(e) => handleBabyDetailChange(baby.id, "timeHH", e.target.value)}
                                      style={{ width: '60px' }}
                                    />
                                    <span>:</span>
                                    <Form.Control
                                      type="text"
                                      size="sm"
                                      placeholder="MM"
                                      maxLength={2}
                                      value={baby.timeMM}
                                      onChange={(e) => handleBabyDetailChange(baby.id, "timeMM", e.target.value)}
                                      style={{ width: '60px' }}
                                    />
                                    <Form.Select
                                      size="sm"
                                      value={baby.timeAMPM}
                                      onChange={(e) => handleBabyDetailChange(baby.id, "timeAMPM", e.target.value)}
                                      style={{ width: '80px' }}
                                    >
                                      <option value="AM">AM</option>
                                      <option value="PM">PM</option>
                                    </Form.Select>
                                  </div>
                                </Col>
                              </Row>

                              <Row className="mb-2 align-items-center">
                                <Col xs={4} className="text-start">
                                  <Form.Label className="mb-0 small">Sex</Form.Label>
                                </Col>
                                <Col xs={1} className="text-center px-0">
                                  <span>:</span>
                                </Col>
                                <Col xs={7}>
                                  <Form.Select
                                    size="sm"
                                    value={baby.sex}
                                    onChange={(e) => handleBabyDetailChange(baby.id, "sex", e.target.value)}
                                    style={{ width: '150px' }}
                                  >
                                    <option value="">Select</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                  </Form.Select>
                                </Col>
                              </Row>

                              <Row className="mb-2 align-items-center">
                                <Col xs={4} className="text-start">
                                  <Form.Label className="mb-0 small">Status</Form.Label>
                                </Col>
                                <Col xs={1} className="text-center px-0">
                                  <span>:</span>
                                </Col>
                                <Col xs={7}>
                                  <Form.Select
                                    size="sm"
                                    value={baby.status}
                                    onChange={(e) => handleBabyDetailChange(baby.id, "status", e.target.value)}
                                    style={{ width: '150px' }}
                                  >
                                    <option value="">Select</option>
                                    <option value="Alive">Alive</option>
                                    <option value="Stillborn">Stillborn</option>
                                    <option value="IUD">IUD</option>
                                  </Form.Select>
                                </Col>
                              </Row>

                              <Row className="mb-2 align-items-center">
                                <Col xs={4} className="text-start">
                                  <Form.Label className="mb-0 small">Weight</Form.Label>
                                </Col>
                                <Col xs={1} className="text-center px-0">
                                  <span>:</span>
                                </Col>
                                <Col xs={7}>
                                  <div className="d-flex align-items-center gap-2">
                                    <Form.Control
                                      type="text"
                                      size="sm"
                                      placeholder="kg"
                                      value={baby.weight}
                                      onChange={(e) => handleBabyDetailChange(baby.id, "weight", e.target.value)}
                                      style={{ width: '100px' }}
                                    />
                                    <span className="small">kg</span>
                                  </div>
                                </Col>
                              </Row>

                              <Row className="mb-2 align-items-center">
                                <Col xs={4} className="text-start">
                                  <Form.Label className="mb-0 small">Apgar Score</Form.Label>
                                </Col>
                                <Col xs={1} className="text-center px-0">
                                  <span>:</span>
                                </Col>
                                <Col xs={7}>
                                  <Form.Control
                                    type="text"
                                    size="sm"
                                    value={baby.apgar}
                                    onChange={(e) => handleBabyDetailChange(baby.id, "apgar", e.target.value)}
                                    style={{ width: '100px' }}
                                  />
                                </Col>
                              </Row>
                            </Card>
                          ))}
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                )}

                <Row className="mb-2 align-items-center">
                  <Col xs={4} className="text-start">
                    <Form.Label className="mb-0 small">Post Natal Period</Form.Label>
                  </Col>
                  <Col xs={1} className="text-center px-0">
                    <span>:</span>
                  </Col>
                  <Col xs={7}>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      size="sm"
                      name="postnatalPeriod"
                      value={formData.postnatalPeriod}
                      onChange={handleInputChange}
                    />
                  </Col>
                </Row>

                <Row className="mb-2 align-items-center">
                  <Col xs={4} className="text-start">
                    <Form.Label className="mb-0 small">Course in the Hospital</Form.Label>
                  </Col>
                  <Col xs={1} className="text-center px-0">
                    <span>:</span>
                  </Col>
                  <Col xs={7}>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      size="sm"
                      name="courseInHospital"
                      value={formData.courseInHospital}
                      onChange={handleInputChange}
                    />
                  </Col>
                </Row>

                <Row className="mb-2 align-items-center">
                  <Col xs={4} className="text-start">
                    <Form.Label className="mb-0 small">Condition On Discharge</Form.Label>
                  </Col>
                  <Col xs={1} className="text-center px-0">
                    <span>:</span>
                  </Col>
                  <Col xs={7}>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      size="sm"
                      name="conditionOnDischarge"
                      value={formData.conditionOnDischarge}
                      onChange={handleInputChange}
                    />
                  </Col>
                </Row>

                <Row className="mb-2 align-items-center">
                  <Col xs={4} className="text-start">
                    <Form.Label className="mb-0 small">Advice On Discharge</Form.Label>
                  </Col>
                  <Col xs={1} className="text-center px-0">
                    <span>:</span>
                  </Col>
                  <Col xs={7}>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      size="sm"
                      name="adviceOnDischarge"
                      value={formData.adviceOnDischarge}
                      onChange={handleInputChange}
                    />
                  </Col>
                </Row>
              </Card.Body>
            </Card>

          </Form>
        </Card.Body>

        {/* Sticky Action Buttons */}
        <div 
          style={{ 
            position: 'sticky', 
            bottom: 0, 
            backgroundColor: '#fff', 
            borderTop: '2px solid #dee2e6',
            padding: '12px 20px',
            boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
            zIndex: 10
          }}
        >
          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={onBack}>
              Cancel
            </Button>
            {mode === "verification" && (
              <Button
                type="submit"
                variant=""
                disabled={isSubmitting}
                style={{ backgroundColor: 'var(--page-secondary-color)', color: '#fff', border: 'none' }}
                onClick={handleSubmit}
              >
                <FontAwesomeIcon icon={faSave} className="me-2" />
                {isSubmitting
                  ? "Saving..."
                  : patient.summaryData
                  ? "Update"
                  : "Save & Send for Verification"}
              </Button>
            )}
            {mode === "approval" && (
              <Button
                type="submit"
                variant="success"
                disabled={isSubmitting}
                onClick={handleSubmit}
              >
                <FontAwesomeIcon icon={faSave} className="me-2" />
                {isSubmitting ? "Approving..." : "Approve"}
              </Button>
            )}
            {mode === "print" && (
              <>
                <Button
                  type="submit"
                  variant=""
                  disabled={isSubmitting}
                  style={{ backgroundColor: 'var(--page-secondary-color)', color: '#fff', border: 'none' }}
                  onClick={handleSubmit}
                >
                  <FontAwesomeIcon icon={faSave} className="me-2" />
                  {isSubmitting ? "Updating..." : "Update"}
                </Button>
                <Button
                  variant="info"
                  onClick={() => window.print()}
                >
                  <FontAwesomeIcon icon={faPrint} className="me-2" />
                  Print Summary
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>
    </Container>
  );
};

export default MaternityDetailForm;
