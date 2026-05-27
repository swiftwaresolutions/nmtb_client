import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Button, Card, Table, Spinner } from "react-bootstrap";
import { LaboratoryApiService } from "../../../../../api/laboratory/laboratory-api-service";
import { showErrorToast } from "../../../../../utils/alertUtil";
import type { PatientWithTests, BilledTest } from "../types";
import PrintPatientInfo from "../../../../../components/LabPrintPatientInfo";
import ReactToPrint from "react-to-print";
import labInchargeSignature from "../../../../../assets/images/Consultant pathologist Sign.png";

interface PrintProps {
  patient: PatientWithTests;
  tests: BilledTest[];
  onBack: () => void;
  finalBillId?: number;
}

interface ReferenceValue {
  reference?: string;
  fromAge: number;
  fromAgeType: string;
  toAge: number;
  toAgeType: string;
  sex: string;
}

interface TestField {
  testRegId: number;
  fieldId: number;
  fieldName: string;
  unit: string;
  resultValue: string;
  referenceValues?: ReferenceValue[];
  normal?: number;
  cutoff?: number;
  intervalFlag?: number;
  cutoffGreater?: string;
  cutoffLower?: string;
  interHigher?: string;
  interInter?: string;
  interLower?: string;
  lineType?: number;
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

const parseReferenceRange = (rangeStr: string): { min: number; max: number } | null => {
  if (!rangeStr) return null;
  const match = rangeStr.match(/^(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)$/);
  if (!match) return null;
  const min = parseFloat(match[1]);
  const max = parseFloat(match[2]);
  if (Number.isNaN(min) || Number.isNaN(max)) return null;
  return { min, max };
};

const getReferenceRange = (
  field: TestField,
  patientAge: number | string,
  patientSex: string
): string => {
  if (!field.referenceValues || field.referenceValues.length === 0) return "";

  const normalizeSex = (value: string): string => {
    const sex = value?.trim().toLowerCase();
    if (!sex) return "";
    if (sex === "m" || sex === "male") return "male";
    if (sex === "f" || sex === "female") return "female";
    if (sex === "common" || sex === "both" || sex === "all") return "common";
    return sex;
  };

  const pSex = normalizeSex(patientSex);
  const normalizedAge = parsePatientAgeToYears(patientAge);
  if (normalizedAge === null) return "";

  for (const ref of field.referenceValues) {
    const refSex = normalizeSex(ref.sex || "");
    if (refSex !== pSex && refSex !== "common") continue;

    const fromAge = normalizeAge(ref.fromAge, ref.fromAgeType);
    const toAge = normalizeAge(ref.toAge, ref.toAgeType);

    if (normalizedAge >= fromAge && normalizedAge <= toAge) {
      return ref.reference || "";
    }
  }
  return "";
};

const isAbnormalResult = (
  field: TestField,
  patientAge: number | string,
  patientSex: string
): boolean => {
  const resultValue = parseFloat(field.resultValue);
  if (Number.isNaN(resultValue)) return false;

  const hasNormalFlag = field.normal === 1;
  const hasCutoffFlag = field.cutoff === 1;
  const hasIntervalFlag = field.intervalFlag === 1;

  const referenceRange = getReferenceRange(field, patientAge, patientSex);

  if (hasNormalFlag) {
    const parsedRange = parseReferenceRange(referenceRange);
    if (!parsedRange) return false;
    return resultValue < parsedRange.min || resultValue > parsedRange.max;
  }

  if (hasCutoffFlag) {
    // For cutoff, abnormal when result is not equal to cutoff
    const cutoffValue = parseFloat(referenceRange);
    if (Number.isNaN(cutoffValue)) return false;
    return resultValue !== cutoffValue;
  }

  if (hasIntervalFlag) {
    // For interval, abnormal when result is outside the range
    const parsedRange = parseReferenceRange(referenceRange);
    if (!parsedRange) return false;
    return resultValue < parsedRange.min || resultValue > parsedRange.max;
  }

  return false;
};

const getFlagText = (
  field: TestField,
  patientAge: number | string,
  patientSex: string
): string => {
  if (!field) return "";

  const hasNormalFlag = field.normal === 1;
  const hasCutoffFlag = field.cutoff === 1;
  const hasIntervalFlag = field.intervalFlag === 1;

  if (!hasNormalFlag && !hasCutoffFlag && !hasIntervalFlag) {
    return "";
  }

  const resultValue = parseFloat(field.resultValue);
  if (Number.isNaN(resultValue)) return "";

  const referenceRange = getReferenceRange(field, patientAge, patientSex);

  if (hasNormalFlag) {
    const parsedRange = parseReferenceRange(referenceRange);
    if (!parsedRange) return "";
    if (resultValue < parsedRange.min) return "Low";
    if (resultValue > parsedRange.max) return "High";
    return "Normal";
  }

  if (hasCutoffFlag) {
    // For cutoff, parse as single value (not a range)
    const cutoffValue = parseFloat(referenceRange);
    if (Number.isNaN(cutoffValue)) return "";
    
    if (resultValue > cutoffValue && field.cutoffGreater) {
      return field.cutoffGreater;
    }
    if (resultValue < cutoffValue && field.cutoffLower) {
      return field.cutoffLower;
    }
    // When resultValue === cutoffValue
    return "Normal";
  }

  if (hasIntervalFlag) {
    const parsedRange = parseReferenceRange(referenceRange);
    if (!parsedRange) return "";
    if (resultValue > parsedRange.max && field.interHigher) {
      return field.interHigher;
    }
    if (resultValue < parsedRange.min && field.interLower) {
      return field.interLower;
    }
    if (field.interInter) {
      return field.interInter;
    }
  }

  return "";
};

const Print: React.FC<PrintProps> = ({ patient, tests, onBack, finalBillId }) => {
  const themePrimary = "var(--page-primary-color)";
  const themeSecondary = "var(--page-secondary-color)";
  const labApiService = useMemo(() => new LaboratoryApiService(), []);
  const printRef = useRef<HTMLDivElement>(null);

  const [fieldsByTest, setFieldsByTest] = useState<Record<number, TestField[]>>({});
  const [loading, setLoading] = useState(true);
  const testRegIdsKey = useMemo(
    () => tests.map((test) => test.testRegId).sort((a, b) => a - b).join(","),
    [tests]
  );
  const stableTests = useMemo(() => tests, [testRegIdsKey]);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      if (!testRegIdsKey) {
        if (mounted) setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const fieldEntries = await Promise.all(
          stableTests.map(async (test) => {
            const details = await labApiService.fetchLabTestFieldDetailsWithResults(test.testRegId);
            return { testId: test.testId, fields: Array.isArray(details) ? details : [] };
          })
        );

        const mapped: Record<number, TestField[]> = {};
        fieldEntries.forEach((entry) => {
          mapped[entry.testId] = entry.fields;
        });

        if (mounted) {
          setFieldsByTest(mapped);
        }
      } catch (error) {
        console.error("Error loading print data", error);
        showErrorToast("Failed to load print details. Please try again.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();
    return () => {
      mounted = false;
    };
  }, [testRegIdsKey, labApiService, stableTests]);

  return (
    <>
      <style>
        {`
          @page {
            size: A4;
            margin: 4.7cm 1.1cm 2.5cm 1.1cm;
          }
          
          @media print {
            html,
            body {
              margin: 0;
              padding: 0;
              height: auto !important;
              font-size: calc(var(--font-size-md) + 1pt);
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
            }

            .print-layout-table {
              width: 100%;
              border-collapse: collapse;
            }

            .print-layout-header-group {
              display: table-header-group;
            }

            .print-layout-footer-group {
              display: table-footer-group;
            }

            .print-repeating-header {
              position: static;
              background: white;
              padding-bottom: 4px;
              border-bottom: 1px solid #dee2e6;
            }

            .print-repeating-footer {
              position: static;
              background: white;
              margin-top: 0;
            }

            .print-card-body {
              padding-top: 0 !important;
              padding-bottom: 0 !important;
            }

            .print-layout-cell {
              padding: 0 !important;
              vertical-align: top;
            }

            .result-table thead {
              display: table-header-group;
            }

            .result-table tr,
            .result-table td,
            .result-table th {
              break-inside: avoid;
              page-break-inside: avoid;
            }

            .result-table,
            .result-table td,
            .result-table th {
              border-color: #333 !important;
            }

            .result-table .reference-range-cell {
              white-space: pre !important;
              overflow-wrap: normal !important;
              word-break: normal !important;
            }
          }

          .print-layout-table {
            width: 100%;
            border-collapse: collapse;
          }

          .print-repeating-header {
            border-bottom: 1px solid #dee2e6;
            padding-bottom: 0.5rem;
            margin-bottom: 0.5rem;
          }

          .print-repeating-footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 0.5rem 1rem;
            margin-top: 1.5rem;
          }

          .result-table .reference-range-cell {
            white-space: pre-wrap;
            overflow-wrap: normal;
            word-break: normal;
          }

          .print-footer-col {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            padding: 0 0.5rem;
          }

          .footer-signature-line {
            width: 85%;
            border-top: none;
            margin-bottom: 6px;
          }

          .footer-sig-spacer {
            height: 36px;
          }

          .footer-signature-img {
            max-height: 45px;
            max-width: 160px;
            object-fit: contain;
            display: block;
            margin-bottom: 4px;
          }

          .footer-name {
            font-size: var(--font-size-md);
            font-weight: var(--font-weight-semibold);
            margin-bottom: 2px;
          }

          .footer-role {
            font-size: var(--font-size-md);
          }

          .col-remarks {
            display: none;
          }
        `}
      </style>

      <div
        className="print-page bg-light"
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          padding: "1rem",
          backgroundColor: themeSecondary,
          color: themePrimary,
          fontSize: "calc(var(--font-size-md) + 1pt)",
        }}
      >
        <div ref={printRef} className="print-content-root" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <table className="print-layout-table">
            <thead className="print-layout-header-group">
              <tr>
                <td className="print-layout-cell">
                  <div className="print-repeating-header">
                    <PrintPatientInfo
                      opno={patient.opNumber}
                      finalBillId={finalBillId}
                      onDataLoaded={() => {}}
                    />
                  </div>
                </td>
              </tr>
            </thead>
            <tfoot className="print-layout-footer-group">
              <tr>
                <td className="print-layout-cell">
                  <div className="print-repeating-footer">
                    <div className="print-footer-col">
                      <div className="footer-signature-line" />
                      <div className="footer-sig-spacer" />
                      <div className="footer-role">Lab Incharge</div>
                    </div>
                    <div className="print-footer-col">
                      <div className="footer-signature-line" />
                      <img src={labInchargeSignature} alt="Consultant Pathologist Signature" className="footer-signature-img" />
                      <div className="footer-name">Dr.V.Sri Lakshmi Priya.MD.,(Path)</div>
                      <div className="footer-role">Consultant Pathologist</div>
                    </div>
                    <div className="print-footer-col">
                      <div className="footer-signature-line" />
                      <div className="footer-sig-spacer" />
                      <div className="footer-role">Lab Technician</div>
                    </div>
                  </div>
                </td>
              </tr>
            </tfoot>
            <tbody>
              <tr>
                <td className="print-layout-cell">
                  <Card className="shadow-sm print-card" style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
                    <Card.Body className="print-card-body" style={{ flex: 1 }}>
                      {loading ? (
                        <div className="text-center py-4">
                          <Spinner animation="border" style={{ color: themePrimary }} />
                          <div className="text-muted mt-2">Preparing report...</div>
                        </div>
                      ) : (
                        Object.entries(
                          tests.reduce((acc, test) => {
                            const dept = test.deptName;
                            if (!acc[dept]) acc[dept] = [];
                            acc[dept].push(test);
                            return acc;
                          }, {} as Record<string, BilledTest[]>)
                        ).map(([deptName, deptTests]) => (
                                <div key={deptName} className="mb-4">
                                  <div className="d-flex justify-content-center align-items-center mb-2">
                                    <span className="badge ms-2 theme-badge-secondary">
                                      {deptName}
                                    </span>
                                  </div>
                                  <Table bordered size="sm" className="result-table">
                                    <thead>
                                      <tr>
                                        <th className="col-2">Test Name</th>
                                        <th>Field</th>
                                        <th className="col-3">Result</th>
                                        <th className="col-1">Flag</th>
                                        <th className="col-2">Reference</th>
                                        <th className="col-2 col-remarks">Remarks / Comments</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {deptTests.length === 0 ? (
                                        <tr>
                                          <td colSpan={6} className="text-center text-muted">No field details available.</td>
                                        </tr>
                                      ) : (
                                        deptTests.flatMap((test) => {
                                          const fields = fieldsByTest[test.testId] || [];
                                          return fields.length === 0 ? (
                                            [
                                              <tr key={`${test.testId}-empty`}>
                                                <td>{test.testName}</td>
                                                <td colSpan={5} className="text-center text-muted">No field details available.</td>
                                              </tr>
                                            ]
                                          ) : (
                                            fields.map((field, idx) => (
                                              <tr key={field.fieldId}>
                                                {idx === 0 ? (
                                                  <td rowSpan={fields.length}>{test.testName}</td>
                                                ) : null}
                                                <td>{field.fieldName}</td>
                                                <td
                                                  className={Number(field.lineType) === 0 || Number(field.lineType) === 1 ? "text-nowrap" : ""}
                                                  style={Number(field.lineType) === 2 ? { whiteSpace: "pre-wrap" } : undefined}
                                                >
                                                  {isAbnormalResult(field, patient.age, patient.gender) ? (
                                                    <strong>{field.resultValue || ""}</strong>
                                                  ) : (
                                                    <>{field.resultValue || ""}</>
                                                  )}{" "}
                                                  {field.unit}
                                                </td>
                                                <td style={{ whiteSpace: "pre-wrap" }}>
                                                  {isAbnormalResult(field, patient.age, patient.gender) ? (
                                                    <strong>{getFlagText(field, patient.age, patient.gender)}</strong>
                                                  ) : (
                                                    getFlagText(field, patient.age, patient.gender)
                                                  )}
                                                </td>
                                                <td className="reference-range-cell">
                                                  {getReferenceRange(field, patient.age, patient.gender)}{" "}
                                                  {field.unit}
                                                </td>
                                                {idx === 0 ? (
                                                  <td rowSpan={fields.length} className="col-remarks" style={{ whiteSpace: "pre-wrap" }}>{patient.note || ""}</td>
                                                ) : null}
                                              </tr>
                                            ))
                                          );
                                        })
                                      )}
                                    </tbody>
                                  </Table>
                                </div>
                              ))
                      )}
                    </Card.Body>
                  </Card>
                </td>
              </tr>
            </tbody>
          </table>

        </div>

        <div
          className="print-action-bar d-flex justify-content-between align-items-center"
          style={{ padding: "0.75rem 1rem", borderTop: "1px solid #e5e5e5", marginTop: "0.5rem", flexShrink: 0 }}
        >
          <Button
            size="sm"
            onClick={onBack}
            className="theme-outline-btn-primary"
          >
            Back to Workflow
          </Button>
          <ReactToPrint
            trigger={() => (
              <Button
                size="sm"
                className="theme-btn-primary"
              >
                Print / Download
              </Button>
            )}
            content={() => printRef.current}
            pageStyle={`
              @page {
                size: A4;
                margin: 4.7cm 1.1cm 2.5cm 1.1cm;
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

export default Print;
