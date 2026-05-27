/**
 * MaternitySummaryPrint Component
 * Print view for maternity discharge summaries
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

interface MaternitySummaryPrintProps {
  patient: any;
  onBack: () => void;
  isRoughCopy?: boolean;
}

interface BabyDetail {
  id: number;
  noOfBaby: number;
  birthDate: string;
  birthTime: string;
  sex: string;
  status: string;
  weight: number;
  apgar: string;
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

const formatBabyDateTime = (dateValue?: string, timeValue?: string): string => {
  const dateText = formatDateDDMMYYYY(dateValue);
  const timeText = formatTime12Hour(timeValue);

  if (dateText !== "-" && timeText !== "-") {
    return `${dateText} ${timeText}`;
  }
  if (dateText !== "-") {
    return dateText;
  }
  return timeText;
};

const formatBabyWeight = (weight: number | string | null | undefined): string => {
  if (weight === null || weight === undefined || String(weight).trim() === "") {
    return "-";
  }

  const rawWeight = String(weight).trim();
  const numericWeight = Number(weight);
  if (!Number.isFinite(numericWeight)) {
    return "-";
  }

  const hasDecimalInput = rawWeight.includes(".");
  const shouldShowThreeDecimals = hasDecimalInput || !Number.isInteger(numericWeight);

  return shouldShowThreeDecimals ? numericWeight.toFixed(3) : String(numericWeight);
};

const MaternitySummaryPrint: React.FC<MaternitySummaryPrintProps> = ({ patient, onBack, isRoughCopy = false }) => {
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
    phone: orgInfo?.phone || orgInfo?.mobile || orgInfo?.contactNumber || "",
  };

  const summaryData = patient?.summaryData || {};
  const babyDetails: BabyDetail[] = summaryData?.babyDetails || [];
  const formattedSummaryWeight = formatBabyWeight(summaryData.weight);
  const rawAddress = patient.address || summaryData.newAddres || "-";
  const guardianDisplay = buildGuardianDisplay(
    patient.guardianName || patient.gname || summaryData.guardianName || summaryData.gname,
    patient.guardianType || patient.gType || summaryData.guardianType || summaryData.gType || summaryData.relation,
    patient.sex || summaryData.sex
  );
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
  const dischargeDateText = formatDateDDMMYYYY(summaryData.dateOfDischarge);
  const dischargeTimeText = formatTime12Hour(summaryData.dischargeTime);
  const dischargeDateTimeText = [
    dischargeDateText !== "-" ? dischargeDateText : null,
    dischargeTimeText !== "-" ? dischargeTimeText : null,
  ]
    .filter(Boolean)
    .join(" ") || "-";

  const renderInfoRow = (
    label: string,
    value: React.ReactNode,
    options?: { preserveWhitespace?: boolean; boldValue?: boolean; monospaceValue?: boolean }
  ) => (
    <div className="info-row">
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
            
            .bg-light {
              background: white !important;
            }
            
            .shadow-sm {
              box-shadow: none !important;
            }
            
            .print-action-bar {
              display: none !important;
            }
            
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

            .investigation-results-table thead {
              display: table-header-group;
            }

            .investigation-results-table tr,
            .investigation-results-table td,
            .investigation-results-table th {
              break-inside: avoid;
              page-break-inside: avoid;
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

          .info-row {
            display: flex;
            align-items: flex-start;
            padding: 4px 0;
            border-bottom: none;
            font-size: calc(var(--font-size-lg) * 0.97);
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

          .info-value {
            color: #212529;
            flex: 1;
          }

          .patient-info-wrapper {
            border: none;
            padding: 0 10px 6px;
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

          .signature-box {
            text-align: center;
            min-width: 200px;
          }

          .signature-line {
            border-top: 1.5px solid #000;
            margin-top: 50px;
            padding-top: 5px;
          }

          .investigation-results-table {
            margin-bottom: 10px;
            font-size: calc(var(--font-size-lg) * 0.97);
          }

          .investigation-group-row td {
            font-weight: var(--font-weight-semibold);
            background-color: var(--table-header-bg);
          }

          .investigation-group-separator td {
            border-top: 2px solid var(--page-primary-color) !important;
          }

          .investigation-group-title {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 8px;
          }

          .investigation-result-value {
            font-weight: var(--font-weight-semibold);
          }

          .investigation-empty-row td {
            color: var(--text-secondary-color);
            text-align: center;
          }

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

              {/* Document Title */}
              <div style={{ textAlign: "center", margin: "20px 0" }}>
                <h4 style={{ fontWeight: "var(--font-weight-bold)", fontSize: "var(--font-size-xl)", textDecoration: "underline", marginBottom: 0 }}>
                  MATERNITY DISCHARGE SUMMARY
                </h4>
                {isRoughCopy && (
                  <div style={{ color: "#c00000", fontWeight: "var(--font-weight-bold)", fontSize: "var(--font-size-lg)", letterSpacing: "0.15em", marginTop: "4px" }}>
                    *** ROUGH COPY – NOT FOR OFFICIAL USE ***
                  </div>
                )}
              </div>

              {/* Patient Information Section */}
              <div className="section-header">Patient Information</div>
              <Container fluid className="patient-info-wrapper">
                <Row className="g-0">
                  <Col md={7}>
                    {(isRoughCopy || summaryData.name || patient.patientName) && (
                      renderInfoRow("Patient Name", summaryData.name || patient.patientName || "-", { boldValue: true })
                    )}
                    {(isRoughCopy || summaryData.age || patient.age || summaryData.sex || patient.sex) && (
                      renderInfoRow("Age / Sex", `${summaryData.age || patient.age || "-"} / ${summaryData.sex || patient.sex || "-"}`)
                    )}
                    {(isRoughCopy || summaryData.newAddres !== "-") && (
                      renderInfoRow("Address", summaryData.newAddres, { preserveWhitespace: true })
                    )}
                    {(isRoughCopy || patient.phone) && (
                      renderInfoRow("Phone No", patient.phone || "-")
                    )}
                    {(isRoughCopy || summaryData.consultantName || summaryData.doctor || patient.doctor) && (
                      renderInfoRow("Consultant Name", summaryData.consultantName || summaryData.doctor || patient.doctor || "-")
                    )}
                  </Col>
                  <Col md={5}>
                    {(isRoughCopy || summaryData.opNo || patient.opNo || summaryData.ipNo || patient.ipNo) && (
                      renderInfoRow("OP No / IP No", `${summaryData.opNo || patient.opNo || "-"} / ${summaryData.ipNo || patient.ipNo || "-"}`)
                    )}
                    {/* {(isRoughCopy || summaryData.department || patient.department) && (
                      <div className="info-row">
                        <div className="info-label">Department:</div>
                        <div className="info-value">{summaryData.department || patient.department || "-"}</div>
                      </div>
                    )} */}
                    {(isRoughCopy || summaryData.ward || patient.ward) && (
                      renderInfoRow("Ward", summaryData.ward || patient.ward || "-")
                    )}
                    {(isRoughCopy || summaryData.doa || patient.doa) && (
                      renderInfoRow("Date of Admission", formatDateTimeDisplay(summaryData.doa || patient.doa), { boldValue: true, monospaceValue: true })
                    )}
                    {(isRoughCopy || summaryData.matSurgerDate || summaryData.tos) && (
                      renderInfoRow("Date of Surgery", formatDateDDMMYYYY(summaryData.matSurgerDate || summaryData.tos), { boldValue: true, monospaceValue: true })
                    )}
                    {(isRoughCopy || summaryData.dateOfDischarge || summaryData.dischargeTime) && (
                      renderInfoRow("Date of Discharge", dischargeDateTimeText, { boldValue: true, monospaceValue: true })
                    )}
                  </Col>
                </Row>
              </Container>

              {/* History Section */}
              <div className="section-header">History</div>
              <div className="report-block">
                {renderInfoRow("History", summaryData.history || "-", { preserveWhitespace: true, boldValue: true, monospaceValue: true })}
              </div>

              {/* Vital Signs Section */}
              <div className="section-header">Vital Signs on Examination</div>
              <div className="report-block">
                {renderInfoRow("BP", summaryData.blood && summaryData.pressure ? `${summaryData.blood}/${summaryData.pressure} MM OF HG` : "-")}
                {renderInfoRow("Pulse", summaryData.pulse ? `${summaryData.pulse} / MIN S` : "-")}
                {renderInfoRow("Temp", summaryData.temp ? `${summaryData.temp} °F` : "-")}
                {renderInfoRow("Resp", summaryData.resp ? `${summaryData.resp} / mins` : "-")}
                {renderInfoRow("Weight", formattedSummaryWeight !== "-" ? `${formattedSummaryWeight} KG` : "-")}
              </div>

              {/* Obstetric Examination Section */}
              <div className="section-header">Obstetric Examination</div>
              <div className="report-block">
                {renderInfoRow("P/A Uterus", summaryData.paut || "-")}
                {renderInfoRow("Condition", summaryData.conditionUt || "-")}
                {renderInfoRow("Position of Foetus", summaryData.foetus || "-")}
                {renderInfoRow("FHR", summaryData.fhr || "-")}
                {renderInfoRow("P/V", summaryData.pv1 || "-")}
                {renderInfoRow("Cx", summaryData.pv2 || "-")}
                {renderInfoRow("OS", summaryData.os || "-")}
                {renderInfoRow("Membrane", summaryData.membrane || "-")}
                {renderInfoRow("Vertex", summaryData.vertex || "-")}
                {renderInfoRow("Pelvis", summaryData.pelvis || "-")}
              </div>

              {/* Investigation/Lab Results Section */}
              {labResults.length > 0 && (
                <>
                  <div className="section-header">Investigation Results</div>
                  <Table bordered size="sm" className="investigation-results-table">
                    <thead>
                      <tr>
                        <th style={{ width: "30%" }}>Test Name</th>
                        <th style={{ width: "30%" }}>Parameters</th>
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
                                <tr className={`investigation-group-row ${testIndex > 0 ? "investigation-group-separator" : ""}`}>
                                  <td>
                                    <div className="investigation-group-title">
                                      <span>{test.testName || "-"}</span>
                                      <small>{formattedTestDate}</small>
                                    </div>
                                  </td>
                                  <td></td>
                                  <td></td>
                                  <td></td>
                                </tr>
                                <tr className="investigation-empty-row">
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
                                const rowClassName = isFirstField && testIndex > 0 ? "investigation-group-separator" : "";

                                return (
                                  <tr key={`${testIndex}-${fieldIndex}`} className={rowClassName}>
                                    <td>
                                      {isFirstField && (
                                        <div className="investigation-group-title">
                                          <span>{test.testName || "-"}</span>
                                          <small>{formattedTestDate}</small>
                                        </div>
                                      )}
                                    </td>
                                    <td>{field.fieldName || "-"}</td>
                                    <td className="investigation-result-value">{`${field.resultValue || "-"}${field.unit ? ` / ${field.unit}` : ""}`}</td>
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

              {/* Delivery Details Section */}
              <div className="section-header">Delivery Details</div>
              <div className="report-block">
                {renderInfoRow("Mode of Delivery", summaryData.modeOfdeliv || "-")}
                {renderInfoRow("Indication", summaryData.indication || "-")}
                {renderInfoRow("Number of Babies", summaryData.noofbabys ?? "0")}
              </div>

              {/* Baby Details Section */}
              {babyDetails && babyDetails.length > 0 && (
                <>
                  <div className="section-header">Baby Details</div>
                  <div className="report-block">
                    {babyDetails.map((baby, index) => (
                      <React.Fragment key={index}>
                        {renderInfoRow(`Baby ${baby.noOfBaby || index + 1} Date & Time`, formatBabyDateTime(baby.birthDate, baby.birthTime))}
                        {renderInfoRow(`Baby ${baby.noOfBaby || index + 1} Sex`, baby.sex || "-")}
                        {renderInfoRow(`Baby ${baby.noOfBaby || index + 1} Status`, baby.status || "-")}
                        {renderInfoRow(`Baby ${baby.noOfBaby || index + 1} Weight (KG)`, formatBabyWeight(baby.weight))}
                        {renderInfoRow(`Baby ${baby.noOfBaby || index + 1} APGAR Score`, baby.apgar || "-")}
                      </React.Fragment>
                    ))}
                  </div>
                </>
              )}

              {/* Postnatal & Discharge Details Section */}
              <div className="section-header">Postnatal Period & Discharge Details</div>
              <div className="report-block">
                {renderInfoRow("Postnatal Period", summaryData.period || "-", { preserveWhitespace: true })}
                {renderInfoRow("Course in Hospital", summaryData.courseInTheHos || "-", { preserveWhitespace: true, boldValue: true, monospaceValue: true })}
                {renderInfoRow("Condition on Discharge", summaryData.conditionDis || "-", { preserveWhitespace: true, boldValue: true, monospaceValue: true })}
                {renderInfoRow("Advice on Discharge", summaryData.adviceDis || "-", { preserveWhitespace: true, boldValue: true, monospaceValue: true })}
              </div>

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
                  Call 04543 - 264254 / 04543 - 262041 in case of Emergency
                </div>
              </>

              {/* Signatures Section */}
              <div className="signature-section">
                <div className="signature-box">
                  <div className="signature-line">
                    Medical Officer
                  </div>
                </div>
                <div className="signature-box">
                  <div className="signature-line">
                    Consultant Signature
                  </div>
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
          <Button 
            className="theme-btn-primary"
            onClick={onBack}
          >
            ← Back to Patient List
          </Button>
          <ReactToPrint
            trigger={() => (
              <Button 
                className="theme-btn-secondary"

              >
                🖨️ Print Summary
              </Button>
            )}
            content={() => printRef.current}
            documentTitle={`Maternity_Discharge_Summary_${patient?.patientName || patient?.ipNo || 'Patient'}`}
            pageStyle={`
              @page {
                size: A4;
                margin: 2cm 1.5cm 3.2cm 1.5cm;
              }
              @media print {
                body {
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
              }
            `}
          />
        </div>
      </div>
    </>
  );
};

export default MaternitySummaryPrint;