/**
 * GeneralSummaryPrint Component
 * Print view for general discharge summaries
 */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, Table, Row, Col, Container } from "react-bootstrap";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../state/store";
import { AppApiService } from "../../../../../api/app/app-api-service";
import { LaboratoryApiService } from "../../../../../api/laboratory/laboratory-api-service";
import ReactToPrint from "react-to-print";
import { buildGuardianDisplay } from "../../../../../utils/guardianUtil";

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

interface GeneralSummaryPrintProps {
  patient: any;
  onBack: () => void;
  isRoughCopy?: boolean;
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

const formatDrugPeriod = (period: string | number | null | undefined): string => {
  switch (String(period ?? "")) {
    case "0":
      return "None";
    case "1":
      return "Days";
    case "2":
      return "Weeks";
    case "3":
      return "Months";
    default:
      return "-";
  }
};

const formatMeasureValue = (
  value: string | number | null | undefined,
  unit: "kg" | "cm"
): string => {
  if (value === null || value === undefined || String(value).trim() === "") {
    return "-";
  }

  const rawValue = String(value).trim();
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return "-";
  }

  const hasDecimalInput = rawValue.includes(".");
  const shouldShowThreeDecimals = hasDecimalInput || !Number.isInteger(numericValue);
  const formattedValue = shouldShowThreeDecimals
    ? numericValue.toFixed(3)
    : String(numericValue);

  return `${formattedValue} ${unit}`;
};

const pad2 = (value: number): string => String(value).padStart(2, "0");

const parseDateLikeValue = (value: string | number | null | undefined): Date | null => {
  if (value === null || value === undefined) {
    return null;
  }

  const raw = String(value).trim();
  if (!raw) {
    return null;
  }

  const ddMmYyyy = raw.match(
    /^(\d{2})-(\d{2})-(\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?)?$/i
  );
  if (ddMmYyyy) {
    const day = Number(ddMmYyyy[1]);
    const month = Number(ddMmYyyy[2]) - 1;
    const year = Number(ddMmYyyy[3]);
    let hours = Number(ddMmYyyy[4] || 0);
    const minutes = Number(ddMmYyyy[5] || 0);
    const seconds = Number(ddMmYyyy[6] || 0);
    const meridiem = (ddMmYyyy[7] || "").toUpperCase();

    if (meridiem === "PM" && hours < 12) {
      hours += 12;
    }
    if (meridiem === "AM" && hours === 12) {
      hours = 0;
    }

    return new Date(year, month, day, hours, minutes, seconds);
  }

  const yyyyMmDd = raw.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?)?$/i
  );
  if (yyyyMmDd) {
    const year = Number(yyyyMmDd[1]);
    const month = Number(yyyyMmDd[2]) - 1;
    const day = Number(yyyyMmDd[3]);
    let hours = Number(yyyyMmDd[4] || 0);
    const minutes = Number(yyyyMmDd[5] || 0);
    const seconds = Number(yyyyMmDd[6] || 0);
    const meridiem = (yyyyMmDd[7] || "").toUpperCase();

    if (meridiem === "PM" && hours < 12) {
      hours += 12;
    }
    if (meridiem === "AM" && hours === 12) {
      hours = 0;
    }

    return new Date(year, month, day, hours, minutes, seconds);
  }

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDateDDMMYYYY = (value: string | number | null | undefined): string => {
  const parsed = parseDateLikeValue(value);
  if (!parsed) {
    return "-";
  }

  return `${pad2(parsed.getDate())}-${pad2(parsed.getMonth() + 1)}-${parsed.getFullYear()}`;
};

const formatTime12Hour = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined || String(value).trim() === "") {
    return "-";
  }

  const raw = String(value).trim();
  const timeOnly = raw.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (timeOnly) {
    let hours = Number(timeOnly[1]);
    const minutes = Number(timeOnly[2]);
    const meridiem = (timeOnly[4] || "").toUpperCase();

    if (meridiem === "PM" && hours < 12) {
      hours += 12;
    }
    if (meridiem === "AM" && hours === 12) {
      hours = 0;
    }

    const hour12 = hours % 12 || 12;
    const suffix = hours >= 12 ? "PM" : "AM";
    return `${pad2(hour12)}:${pad2(minutes)} ${suffix}`;
  }

  const parsed = parseDateLikeValue(raw);
  if (!parsed) {
    return "-";
  }

  const hours = parsed.getHours();
  const hour12 = hours % 12 || 12;
  const suffix = hours >= 12 ? "PM" : "AM";
  return `${pad2(hour12)}:${pad2(parsed.getMinutes())} ${suffix}`;
};

const formatDateTimeDisplay = (value: string | number | null | undefined): string => {
  const dateText = formatDateDDMMYYYY(value);
  const timeText = formatTime12Hour(value);

  if (dateText !== "-" && timeText !== "-") {
    return `${dateText} ${timeText}`;
  }
  if (dateText !== "-") {
    return dateText;
  }
  return timeText;
};

const GeneralSummaryPrint: React.FC<GeneralSummaryPrintProps> = ({ patient, onBack, isRoughCopy = false }) => {
  const appApiService = useMemo(() => new AppApiService(), []);
  const laboratoryApiService = useMemo(() => new LaboratoryApiService(), []);
  const organizationState = useSelector((state: RootState) => state.appReducer.organization);
  const printRef = useRef<HTMLDivElement>(null);

  const [orgInfo, setOrgInfo] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [labResults, setLabResults] = useState<LabTestResult[]>([]);

  useEffect(() => {
    const loadOrgData = async () => {
      setLoading(true);
      try {
        const orgResponse = await appApiService.fetchOrganizationDetails();
        setOrgInfo(orgResponse?.data || orgResponse || {});
      } catch (error) {
        console.error("Error loading organization data", error);
      } finally {
        setLoading(false);
      }
    };
    loadOrgData();
  }, [appApiService]);

  // Fetch lab results by visitId
  useEffect(() => {
    const fetchLabResults = async () => {
      if (!patient?.visitId) {
        return;
      }

      try {
        const results = await laboratoryApiService.fetchLabResultDetailsByVisitId(patient.visitId);
        setLabResults(results || []);
      } catch (error) {
        console.error("Error fetching lab results:", error);
        setLabResults([]);
      }
    };

    fetchLabResults();
  }, [patient?.visitId]);

  const resolvedOrg = {
    name: orgInfo?.name || organizationState.name,
    code: orgInfo?.code || organizationState.code,
    address: orgInfo?.address || orgInfo?.addressLine1 || "",
    phone: orgInfo?.phone || orgInfo?.mobile || orgInfo?.contactNumber || ""
  };

  const d = patient?.summaryData || {};
  const drugs: any[] = d.drugs || [];
  const rawAddress = patient.address || d.newAddres || "-";
  const guardianDisplay = buildGuardianDisplay(patient.guardianName, patient.guardianType, patient.sex);
  const formattedAddress =
    rawAddress && rawAddress !== "-"
      ? [
          guardianDisplay,
          rawAddress
            .split(",")
            .map((part: string) => part.trim())
            .filter((part: string) => part)
            .join("\n")
        ]
          .filter(Boolean)
          .join("\n")
      : "-";
  const consultantNames = [d.doctorName2, d.doctorName3, d.doctorName4]
    .map((name: string | null | undefined) => String(name || "").trim())
    .filter((name: string) => name)
    .join(", ");
  const dischargeDateText = formatDateDDMMYYYY(d.dischargeDate);
  const dischargeTimeText = formatTime12Hour(d.dischargeTime);
  const dischargeDateTimeText = [
    dischargeDateText !== "-" ? dischargeDateText : null,
    dischargeTimeText !== "-" ? dischargeTimeText : null
  ]
    .filter(Boolean)
    .join(" ") || "-";

  const renderInfoRow = (
    label: string,
    value: React.ReactNode,
    options?: { preserveWhitespace?: boolean; noBorder?: boolean; boldValue?: boolean; monospaceValue?: boolean }
  ) => (
    <div className={`info-row${options?.noBorder ? " no-border" : ""}`}>
      <div className="info-label">{label}</div>
      <div className="info-separator">:</div>
      <div
        className="info-value"
        style={{
          whiteSpace: options?.preserveWhitespace ? "pre-wrap" : "normal",
          fontWeight: options?.boldValue ? "var(--font-weight-bold)" : undefined,
          fontFamily: options?.monospaceValue ? '"Courier New", Courier, monospace' : undefined,
        }}
      >
        {value}
      </div>
    </div>
  );

  return (
    <>
      <style>
        {`
          @page {
            size: A4;
            margin: 2cm 1.5cm 3.2cm 1.5cm;
          }
          @media print {
            html,
            body {
              margin: 0;
              padding: 0;
              height: auto !important;
            }
            .bg-light { background: white !important; }
            .shadow-sm { box-shadow: none !important; }
            .print-action-bar { display: none !important; }
            .print-page {
              height: auto !important;
              overflow: visible !important;
              padding: 0 !important;
            }

            .print-content-root,
            .print-card,
            .print-card-body {
              height: auto !important;
              min-height: auto !important;
              overflow: visible !important;
              font-size: var(--font-size-lg) !important;
              line-height: 1.3 !important;
            }

            .signature-section {
              margin-top: 20px !important;
              padding: 12px 0 0 0 !important;
            }

            .signature-line {
              margin-top: 30px !important;
            }

            .section-header {
            }

            .info-row {
            }

            .avoid-break {
            }

            .print-page,
            .print-content-root,
            .print-card,
            .print-card-body,
            .patient-info-wrapper,
            .print-card table {
              width: 100% !important;
            }

            .print-card table {
              table-layout: fixed;
            }

            .print-card th,
            .print-card td {
              vertical-align: top;
            }

            .patient-info-wrapper .row {
              display: flex !important;
              flex-wrap: nowrap !important;
            }

            .patient-info-wrapper .col-md-7 {
              flex: 0 0 58.333333% !important;
              max-width: 58.333333% !important;
              width: 58.333333% !important;
            }

            .patient-info-wrapper .col-md-5 {
              flex: 0 0 41.666667% !important;
              max-width: 41.666667% !important;
              width: 41.666667% !important;
            }

            .patient-info-wrapper .info-row {
              display: flex !important;
              align-items: flex-start;
              font-size: var(--font-size-xl) !important;
            }

            .patient-info-wrapper .info-label {
              width: 180px !important;
              min-width: 180px !important;
            }

            .patient-info-wrapper .col-md-7:first-child .info-label {
              width: 120px !important;
              min-width: 120px !important;
            }

            .patient-info-wrapper .col-md-5:last-child .info-label {
              width: 145px !important;
              min-width: 115px !important;
            }

            .section-header {
              font-size: var(--font-size-xl) !important;
            }
          }

          .print-card .table-bordered td,
          .print-card .table-bordered th {
            border: 1.5px solid #adb5bd !important;
          }

          .section-header {
            padding: 6px 0 4px;
            font-size: var(--font-size-xl);
            font-weight: var(--font-weight-semibold);
            border-bottom: none;
            margin-top: 12px;
            margin-bottom: 6px;
            text-transform: uppercase;
            letter-spacing: 0.03em;
            text-decoration: underline;
          }
          .print-content-root,
          .print-content-root * {
            font-family: Arial, sans-serif;
          }
          .print-detail-text {
            font-size: calc((var(--font-size-lg) * 0.97));
          }
          .info-row {
            display: flex;
            align-items: flex-start;
            padding: 4px 0;
            border-bottom: none;
            font-size: calc((var(--font-size-lg) * 0.97));
          }
          .info-row.no-border {
            border-bottom: none;
          }
          .info-label {
            font-weight: var(--font-weight-semibold);
            color: #495057;
            min-width: 180px;
            flex-shrink: 0;
          }
          .info-separator {
            width: 16px;
            text-align: center;
            flex-shrink: 0;
          }
          .info-value { color: #212529; flex: 1; }
          .report-block {
            margin-bottom: 6px;
          }
          .print-card table,
          .print-card th,
          .print-card td {
            font-size: calc((var(--font-size-lg) * 0.97));
          }
          .patient-info-wrapper {
            border: none;
            padding: 0 10px 4px;
            margin-bottom: 10px;
          }
          .patient-info-wrapper .row {
            margin-left: 0;
            margin-right: 0;
          }
          .patient-info-wrapper [class*="col-"] {
            padding-left: 0;
            padding-right: 0;
          }
          .patient-info-wrapper,
          .patient-info-wrapper * {
            font-family: "Times New Roman", Times, serif !important;
          }
          .patient-info-wrapper .info-row {
            padding: 8px 0;
            font-size: var(--font-size-xl);
          }
          .patient-info-wrapper .info-label {
            min-width: 180px;
          }

          .patient-info-wrapper .col-md-7:first-child .info-label {
            min-width: 165px;
          }

          .patient-info-wrapper .col-md-5:last-child .info-label {
            min-width: 155px;
          }
          .signature-section {
            display: flex;
            justify-content: space-between;
            margin-top: 50px;
            padding: 20px;
          }
          .signature-box { text-align: center; min-width: 200px; }
          .signature-line { border-top: 1.5px solid #000; margin-top: 50px; padding-top: 5px; }

          // .rough-copy-watermark {
          //   position: absolute;
          //   top: 50%;
          //   left: 50%;
          //   transform: translate(-50%, -50%) rotate(-45deg);
          //   font-size: 6rem;
          //   font-weight: 900;
          //   color: rgba(200, 0, 0, 0.12);
          //   pointer-events: none;
          //   user-select: none;
          //   white-space: nowrap;
          //   z-index: 10;
          //   letter-spacing: 0.1em;
          // }

          // @media print {
          //   .rough-copy-watermark {
          //     position: fixed !important;
          //     top: 50% !important;
          //     left: 50% !important;
          //     transform: translate(-50%, -50%) rotate(-45deg) !important;
          //     width: 100vw;
          //     text-align: center;
          //     color: rgba(200, 0, 0, 0.12) !important;
          //     -webkit-print-color-adjust: exact;
          //     print-color-adjust: exact;
          //   }
          // }
        `}
      </style>

      <div
        className="print-page bg-light"
        style={{ height: "100vh", display: "flex", flexDirection: "column", padding: "1rem", overflow: "hidden" }}
      >
        <div ref={printRef} className="print-content-root" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <Card className="shadow-sm print-card" style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
            <Card.Body className="print-card-body" style={{ flex: 1, overflowY: "auto", minHeight: 0, position: "relative" }}>

              {/* Rough Copy Watermark */}
              {/* {isRoughCopy && (
                <div className="rough-copy-watermark">ROUGH COPY</div>
              )} */}

              {/* <PrintHeader organization={resolvedOrg} /> */}
             

              {isRoughCopy && (
                <div style={{ textAlign: "center", margin: "20px 0" }}>
                  <h4 style={{ fontWeight: "var(--font-weight-bold)", fontSize: "var(--font-size-xl)", textDecoration: "underline", marginBottom: 0 }}>
                    GENERAL DISCHARGE SUMMARY
                  </h4>
                  <div style={{ color: "#c00000", fontWeight: "var(--font-weight-bold)", fontSize: "var(--font-size-lg)", letterSpacing: "0.15em", marginTop: "4px" }}>
                    *** ROUGH COPY – NOT FOR OFFICIAL USE ***
                  </div>
                </div>
              )}

              {/* Patient Info */}
              <div className="section-header">Patient Information</div>
              <Container fluid className="patient-info-wrapper">
                <Row className="g-0">
                  <Col md={7}>
                    {(isRoughCopy || patient.patientName) && <div className="info-row"><div className="info-label">Patient Name:</div><div className="info-value" style={{ fontWeight: "var(--font-weight-bold)" }}>{patient.patientName || "-"}</div></div>}
                    {(isRoughCopy || patient.age || patient.sex) && <div className="info-row"><div className="info-label">Age / Sex:</div><div className="info-value">{patient.age || "-"} / {patient.sex || "-"}</div></div>}
                    {(isRoughCopy || rawAddress !== "-") && <div className="info-row"><div className="info-label">Address:</div><div className="info-value text-uppercase" style={{ whiteSpace: "pre-line" }}>{formattedAddress}</div></div>}
                    {(isRoughCopy || patient.phone) && <div className="info-row"><div className="info-label">Phone No:</div><div className="info-value">{patient.phone || "-"}</div></div>}
                    {(isRoughCopy || consultantNames || d.consultantName || d.doctorName) && <div className="info-row"><div className="info-label">Consultant Name:</div><div className="info-value">{consultantNames || d.consultantName || d.doctorName || "-"}</div></div>}
                  </Col>
                  <Col md={5}>
                    {(isRoughCopy || patient.opNo || patient.ipNo) && <div className="info-row"><div className="info-label">OP No / IP No:</div><div className="info-value">{patient.opNo || "-"} / {patient.ipNo || "-"}</div></div>}
                    {/* {(isRoughCopy || patient.department) && <div className="info-row"><div className="info-label">Department:</div><div className="info-value">{patient.department || "-"}</div></div>} */}
                    {(isRoughCopy || patient.ward) && <div className="info-row"><div className="info-label">Ward:</div><div className="info-value">{patient.ward || "-"}</div></div>}
                    {(isRoughCopy || patient.doa) && <div className="info-row"><div className="info-label">Date of Admission:</div><div className="info-value" style={{ fontWeight: "var(--font-weight-bold)", fontFamily: '"Courier New", Courier, monospace' }}>{formatDateTimeDisplay(patient.doa)}</div></div>}
                    {(isRoughCopy || d.surgeryDate) && <div className="info-row"><div className="info-label">Date of Surgery:</div><div className="info-value" style={{ fontWeight: "var(--font-weight-bold)", fontFamily: '"Courier New", Courier, monospace' }}>{formatDateDDMMYYYY(d.surgeryDate)}</div></div>}
                    {(isRoughCopy || d.dischargeDate) && <div className="info-row"><div className="info-label">Date of Discharge:</div><div className="info-value" style={{ fontWeight: "var(--font-weight-bold)", fontFamily: '"Courier New", Courier, monospace' }}>{dischargeDateTimeText}</div></div>}
                    {(isRoughCopy || d.dischargeStatus) && <div className="info-row"><div className="info-label">Discharge Status:</div><div className="info-value">{d.dischargeStatus || "-"}</div></div>}
                  </Col>
                </Row>
              </Container>

              {/* Clinical Info */}
              <div className="section-header">Clinical Information</div>
              <div className="report-block">
                {renderInfoRow("Final Diagnosis", d.diagnosis || "-", { preserveWhitespace: true, boldValue: true, monospaceValue: true })}
                {d.opProcedure?.trim() && renderInfoRow("Operative Procedure", d.opProcedure, { preserveWhitespace: true })}
                {d.allergy?.trim() && renderInfoRow("Drug Allergy", d.allergy, { preserveWhitespace: true })}
              </div>

              {/* History */}
              {(d.history || d.pastHistory || d.personalHistory || d.surgicalHistory || d.familyHistory || d.menstrualHistory) &&
              <>
                <div className="section-header">History</div>
                <div className="report-block">
                  {renderInfoRow("Chief Complaints", d.history || "-", { preserveWhitespace: true, boldValue: true, monospaceValue: true })}
                  {d.pastHistory && renderInfoRow("Past Medical History", d.pastHistory, { preserveWhitespace: true })}
                  {d.personalHistory && renderInfoRow("Personal History", d.personalHistory, { preserveWhitespace: true })}
                  {d.surgicalHistory && renderInfoRow("Surgical History", d.surgicalHistory, { preserveWhitespace: true })}
                  {d.familyHistory && renderInfoRow("Family History", d.familyHistory, { preserveWhitespace: true })}
                  {d.menstrualHistory && renderInfoRow("Menstrual History", d.menstrualHistory, { preserveWhitespace: true })}
                </div>
              </>
              }

              {/* General Examination */}
              {(d.conscious || d.oriented || d.blood || d.pressure || d.pulse || d.temp || d.resp || d.spo2 || d.weight || d.height || d.babyStatus) &&
              <>
                <div className="section-header">General Examination</div>
                <div className="report-block">
                  {Boolean(d.conscious) && renderInfoRow("Consciousness", d.conscious || "-")}
                  {Boolean(d.oriented) && renderInfoRow("Orientation", d.oriented || "-")}
                  {Boolean(d.blood && d.pressure) && renderInfoRow("Blood Pressure", (d.blood && d.pressure) ? `${d.blood}/${d.pressure} mmHg` : "-")}
                  {Boolean(d.pulse) && renderInfoRow("Pulse", d.pulse ? `${d.pulse} / mt` : "-")}
                  {Boolean(d.temp) && renderInfoRow("Temperature", d.temp ? `${d.temp} °F` : "-")}
                  {Boolean(d.resp) && renderInfoRow("Respiratory Rate", d.resp ? `${d.resp} / mt` : "-")}
                  {Boolean(d.spo2) && renderInfoRow("SpO2", d.spo2 ? `${d.spo2} %` : "-")}
                  {Boolean(d.weight) && renderInfoRow("Weight", formatMeasureValue(d.weight, "kg"))}
                  {Boolean(d.height) && renderInfoRow("Height", formatMeasureValue(d.height, "cm"))}
                  {Boolean(d.babyStatus) && renderInfoRow("Baby Status", d.babyStatus || "-", { preserveWhitespace: true })}
                </div>
              </>
          }

              {/* Birth Details */}
              {Boolean(
                ["PAEDIATRIC", "PAED", "PAEDIATRIC SURGERY"].includes((patient.department || "").toUpperCase()) &&
                (
                  d.birthWeight ||
                  d.length ||
                  d.headCircumference ||
                  d.chestCircumference ||
                  d.dateOfBirth ||
                  d.timeOfBirth ||
                  d.gender ||
                  d.sex
                )
              ) && (
                <>
                  <div className="section-header">Birth Details</div>
                  <div className="report-block">
                    {Boolean(d.birthWeight) && renderInfoRow("Birth Weight", formatMeasureValue(d.birthWeight, "kg"))}
                    {Boolean(d.length) && renderInfoRow("Length", formatMeasureValue(d.length, "cm"))}
                    {Boolean(d.headCircumference) && renderInfoRow("Head Circumference (HC)", formatMeasureValue(d.headCircumference, "cm"))}
                    {Boolean(d.chestCircumference) && renderInfoRow("Chest Circumference (CC)", formatMeasureValue(d.chestCircumference, "cm"))}
                    {Boolean(d.dateOfBirth) && renderInfoRow("Date of Birth (DOB)", formatDateDDMMYYYY(d.dateOfBirth))}
                    {Boolean(d.timeOfBirth) && renderInfoRow("Time of Birth (TOB)", formatTime12Hour(d.timeOfBirth))}
                    {Boolean(d.gender || d.sex) && renderInfoRow("Sex", d.gender || d.sex || "-")}
                  </div>
                </>
              )}

              {Boolean(isRoughCopy || d.dischargeWeight) && (
              <>
                <div className="report-block">
                  {Boolean(d.dischargeWeight) && renderInfoRow("Discharge Weight", formatMeasureValue(d.dischargeWeight, "kg"))}
                </div>
              </>
              )}

              {/* Systemic Examination */}
              <div className="section-header">Systemic Examination</div>
              <div className="report-block">
                {[
                  ["CVS", d.cvs],
                  ["RS", d.rsValue],
                  ["Abdomen", d.paut],
                  ["CNS", d.cnsValue],
                  ["P/V", d.pvValue],
                  ["P/S", d.psValue],
                  ["PR", d.prValue],
                  ["Other", d.otherSysExamination],
                  ["Local Examination", d.exOther]
                ]
                  .filter(([, v]) => v)
                  .map(([label, value], i) => (
                    <React.Fragment key={i}>{renderInfoRow(String(label), String(value), { preserveWhitespace: true })}</React.Fragment>
                  ))}
              </div>

              {/* Investigation Results from Lab */}
              {labResults.length > 0 && (
                <>
                  <div className="section-header">Investigation Results</div>
                  <Table bordered size="sm" style={{ marginBottom: "10px" }}>
                    <thead style={{ backgroundColor: "#f8f9fa", display: "table-header-group" }}>
                      <tr>
                        <th style={{ width: "30%" }}>Test Name</th>
                        <th style={{ width: "30%" }}>Parameter</th>
                        <th style={{ width: "20%" }}>Result / Unit</th>
                        <th style={{ width: "20%" }}>Reference Range</th>
                      </tr>
                    </thead>
                    <tbody>
                      {labResults.map((test, testIndex) => {
                        const displayableFields = (test.fields || []).filter((field) => hasDisplayableLabField(field));
                        const formattedTestDate = formatDateDDMMYYYY(test.testDate);

                        return (
                          <React.Fragment key={testIndex}>
                            {displayableFields.length === 0 ? (
                              <>
                                <tr style={{ backgroundColor: "#f8f9fa", fontWeight: "600" }} className="avoid-break">
                                  <td>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                                      <span>{test.testName || "-"}</span>
                                      <small>{formattedTestDate}</small>
                                    </div>
                                  </td>
                                  <td></td>
                                  <td></td>
                                  <td></td>
                                </tr>
                                <tr style={{ color: "#6c757d", textAlign: "center" }}>
                                  <td></td>
                                  <td colSpan={3}>No field details available.</td>
                                </tr>
                              </>
                            ) : (
                              displayableFields.map((field, fieldIndex) => {
                                let refRange = getReferenceRange(field, patient?.age, patient?.sex);
                                const cutoffFlag = Number(field.cutoff) === 1;
                                const intervalFlag = Number(field.intervalFlag) === 1;

                                if (!refRange && cutoffFlag) {
                                  refRange = field.cutoffGreater || field.cutoffLower || "";
                                } else if (!refRange && intervalFlag) {
                                  refRange = `${field.interLower || ""} - ${field.interHigher || ""}`;
                                }

                                const isFirstField = fieldIndex === 0;
                                const borderTopStyle = isFirstField && testIndex > 0 ? { borderTop: "2px solid #0d6efd" } : {};
                                const cellBgColor = isFirstField ? "#f8f9fa" : "transparent";
                                const cellFontWeight = isFirstField ? "600" : "normal";

                                return (
                                  <tr key={`${testIndex}-${fieldIndex}`} style={borderTopStyle} className="avoid-break">
                                    <td style={{ backgroundColor: cellBgColor, fontWeight: cellFontWeight }}>
                                      {isFirstField && (
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                                          <span>{test.testName || "-"}</span>
                                          <small>{formattedTestDate}</small>
                                        </div>
                                      )}
                                    </td>
                                    <td>{field.fieldName || "-"}</td>
                                    <td style={{ fontWeight: "600" }}>{`${field.resultValue || "-"}${field.unit ? ` / ${field.unit}` : ""}`}</td>
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
                </>
              )}

              {/* Investigations */}

              {(d.xray || d.usg || d.ct || d.echo || d.outsideInvesti || d.otherRadiology || d.cchdScreening || d.hearingScreening) &&
                <>
                  <div className="section-header">Investigations</div>
                  <div className="report-block">
                    {d.xray && renderInfoRow("X-RAY", d.xray, { preserveWhitespace: true })}
                    {d.usg && renderInfoRow("USG", d.usg, { preserveWhitespace: true })}
                    {d.ct && renderInfoRow("CT Reports", d.ct, { preserveWhitespace: true })}
                    {d.echo && renderInfoRow("ECHO", d.echo, { preserveWhitespace: true })}
                    {d.outsideInvesti && renderInfoRow("Outside Investigations", d.outsideInvesti, { preserveWhitespace: true })}
                    {d.otherRadiology && renderInfoRow("Others", d.otherRadiology, { preserveWhitespace: true })}
                    {d.cchdScreening && renderInfoRow("CCHD Screening", d.cchdScreening || "-", { preserveWhitespace: true })}
                    {d.hearingScreening && renderInfoRow("Hearing Screening", d.hearingScreening || "-", { preserveWhitespace: true })}
                  </div>
                </>
              }

              {/* Procedure & Treatment */}
              {(d.surgeryName || d.surgeryProcedure || d.surgeryNotes || d.treatment || d.conditionDis) &&
                <>
                  {/* <div className="section-header">Procedure & Treatment</div> */}
                  <div className="report-block">
                    {d.surgeryName && renderInfoRow("Surgery Name", d.surgeryName, { preserveWhitespace: true })}
                    {d.surgeryProcedure && renderInfoRow("Procedure", d.surgeryProcedure, { preserveWhitespace: true })}
                    {/* {d.surgeryNotes && renderInfoRow("Notes", d.surgeryNotes, { preserveWhitespace: true })} */}
                    {d.treatment && renderInfoRow("Course in the Hospital", d.treatment, {boldValue: true, monospaceValue: true, preserveWhitespace: true })}
                    {d.conditionDis && renderInfoRow("Condition on Discharge", d.conditionDis, {boldValue: true, monospaceValue: true, preserveWhitespace: true })}
                  </div>
                </>
              }

              {/* Medicines */}
              {drugs.length > 0 && (
                <>
                  <div className="section-header">Medicines</div>
                  <div className="report-block">
                    <Table bordered size="sm" style={{ marginBottom: "10px" }}>
                      <thead>
                        <tr>
                          <th style={{ width: "10%" }}>S.No</th>
                          <th style={{ width: "36%" }}>Medicine</th>
                          <th style={{ width: "12%" }}>Qty</th>
                          <th style={{ width: "18%" }}>Timing</th>
                          <th style={{ width: "24%" }}>Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        {drugs.map((drug: any, idx: number) => (
                          <tr key={idx}>
                            <td>{idx + 1}</td>
                            <td>{drug.prodsName || "-"}</td>
                            <td>{drug.quantity || "-"}</td>
                            <td>{drug.timing || "-"}</td>
                            <td>{`${drug.duration || "-"} ${formatDrugPeriod(drug.period)}`}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                    {d.drug && renderInfoRow("Drug", d.drug, { preserveWhitespace: true })}
                  </div>
                </>
              )}

              {/* Discharge Advice */}
              {(isRoughCopy || d.diet || d.woundCare || d.adviceDis) &&
                <>
                  <div className="section-header">Discharge Advice</div>
                  <div className="report-block">
                    {(isRoughCopy || d.diet) && renderInfoRow("Diet", d.diet || " ", { preserveWhitespace: true })}
                    {(isRoughCopy || d.woundCare) && renderInfoRow("Wound Care", d.woundCare || " ", { preserveWhitespace: true })}
                    {(isRoughCopy || d.adviceDis) && renderInfoRow("Disease Related Advice", d.adviceDis || " ", { boldValue: true, monospaceValue: true, preserveWhitespace: true })}
                  </div>
                </> 
              }

              {!["DAMA", "Referred", "Death"].includes(d.dischargeStatus) && (
                <>
                  <div 
                    className="text-center"
                    style={{
                      marginTop: "10px",
                      marginBottom: "6px",
                      fontWeight: "var(--font-weight-bold)",
                      lineHeight: 1.25,
                    }}
                  >
                    For any of the Following Symptoms
                    <br />
                    Please call 04543-264254 or come to Emergency Department
                  </div>
                  <div className="info-row" style={{ alignItems: "flex-start", borderBottom: "none" }}>
                    <div className="info-label"></div>
                    <div className="info-value" style={{ whiteSpace: "pre-wrap" }}>{d.symptoms || "-"}</div>
                  </div>
                </>
              )}

              {/* Signatures */}
              <div className="signature-section">
                <div className="signature-box">
                  <div className="signature-line">Medical Officer</div>
                </div>
                <div className="signature-box">
                  <div className="signature-line">Consultant Signature</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* Action Bar */}
        <div
          className="print-action-bar"
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            display: "flex",
            gap: "10px",
            padding: "1rem",
            borderTop: "2px solid #dee2e6",
            backgroundColor: "#ffffff",
            boxShadow: "0 -2px 10px rgba(0,0,0,0.1)",
            zIndex: 1000,
            justifyContent: "flex-end",
            alignItems: "center"
          }}
        >
          <Button className="theme-btn-primary" onClick={onBack}>
            ← Back to Patient List
          </Button>
          <ReactToPrint
            trigger={() => (
              <Button className="theme-btn-secondary">
                🖨️ Print Summary
              </Button>
            )}
            content={() => printRef.current}
            documentTitle={`General_Discharge_Summary_${patient?.patientName || patient?.ipNo || 'Patient'}`}
            pageStyle={`
              @page {
                size: A4;
                margin: 2cm 1.5cm 3.2cm 1.5cm;
              }
              @media print {
                body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              }
            `}
          />
        </div>
      </div>
    </>
  );
};

export default GeneralSummaryPrint;
