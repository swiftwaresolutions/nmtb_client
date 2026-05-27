import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  Button,
  Table,
  Form,
  Spinner,
  Alert,
  Row,
  Col,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPencilAlt,
  faArrowLeft,
  faSave,
} from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../state/store";
import { LaboratoryApiService } from "../../../../../api/laboratory/laboratory-api-service";
import {
  showSuccessToast,
  showErrorToast,
  showValidationError,
} from "../../../../../utils/alertUtil";

interface ReferenceValue {
  reference?: string;
  fromAge: number;
  fromAgeType: string;
  toAge: number;
  toAgeType: string;
  sex: string;
}

interface FieldDetail {
  testRegId: number;
  fieldId: number;
  fieldName: string;
  fieldType: string;
  unit: string;
  testMethod: string;
  machine: string;
  resultValue: string;
  resultValId?: number | null;
  isNote: number;
  normal: number;
  cutoff: number;
  intervalFlag: number;
  cutoffGreater: string;
  cutoffLower: string;
  interHigher: string;
  interInter: string;
  interLower: string;
  lineType?: number;
  referenceValues?: ReferenceValue[];
}

interface TestItem {
  testRegId: number;
  testName: string;
  testId: number;
  specName: string;
  deptName: string;
  rate: number;
  isCulture: number;
}

interface CultureDetailRow {
  id: number;
  testId: number;
  antId: number;
  antName: string;
  value: string;
  zone: string;
}

interface PatientInfo {
  name: string;
  opNumber: string;
  age: number;
  gender: string;
  note?: string;
  patId: number;
  visitId: number;
}

interface ResultReEditProps {
  test: TestItem;
  patientInfo: PatientInfo;
  onBack: () => void;
  onSave?: () => void;
}

/**
 * Convert age to a single unit (Years) for easier comparison
 */
const normalizeAge = (age: number, ageType: string): number => {
  switch (ageType?.toLowerCase()) {
    case "days":
      return age / 365;
    case "months":
      return age / 12;
    case "hours":
      return age / (24 * 365);
    case "years":
    default:
      return age;
  }
};

/**
 * Get matching reference value based on patient age and sex
 */
const getMatchingReferenceValue = (
  referenceValues: ReferenceValue[] | undefined,
  patientAge: number,
  patientSex: string
): ReferenceValue | null => {
  if (!referenceValues || referenceValues.length === 0) {
    return null;
  }

  const normalizedPatientAge = patientAge;
  const pSex = patientSex?.toLowerCase();

  for (const ref of referenceValues) {
    const refSex = ref.sex?.toLowerCase();
    if (refSex !== pSex && refSex !== "common") continue;
    const fromAge = normalizeAge(ref.fromAge, ref.fromAgeType);
    const toAge = normalizeAge(ref.toAge, ref.toAgeType);
    if (normalizedPatientAge >= fromAge && normalizedPatientAge <= toAge) {
      return ref;
    }
  }
  return null;
};

const ResultReEdit: React.FC<ResultReEditProps> = ({
  test,
  patientInfo,
  onBack,
  onSave,
}) => {
  const themePrimary = "var(--page-primary-color)";
  const themeSecondary = "var(--page-secondary-color)";
  const laboratoryApiService = useMemo(() => new LaboratoryApiService(), []);
  const loginData = useSelector((state: RootState) => state.loginData);

  const [fieldDetails, setFieldDetails] = useState<FieldDetail[]>([]);
  const [fieldValues, setFieldValues] = useState<
    { fieldId: number; value: string }[]
  >([]);
  const [remarks, setRemarks] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cultureId, setCultureId] = useState("");
  const [cultureTextData, setCultureTextData] = useState<{
    smearReport: string;
    colonyCount: string;
    organismIsolation: string;
    nonRective: string;
  }>({
    smearReport: "",
    colonyCount: "",
    organismIsolation: "",
    nonRective: "",
  });
  const [cultureDetails, setCultureDetails] = useState<CultureDetailRow[]>([]);

  const normalizeZoneValue = (zone: string): string => {
    const normalized = (zone || "").trim().toUpperCase();
    if (normalized === "S" || normalized === "SENSITIVE") return "S";
    if (normalized === "R" || normalized === "RESISTANT") return "R";
    if (
      normalized === "M" ||
      normalized === "MODERATE" ||
      normalized === "INTERMEDIATE"
    ) {
      return "M";
    }
    return "";
  };

  // Fetch field details on mount
  useEffect(() => {
    let mounted = true;
    const fetchFields = async () => {
      try {
        if (mounted) setLoading(true);
        if (test.isCulture === 1) {
          const cultureResult =
            await laboratoryApiService.fetchCultureTestResultByTestRegId(
              test.testRegId
            );

          if (mounted) {
            setCultureId(cultureResult?.cultureId || "");
            setCultureTextData({
              smearReport: cultureResult?.smearReport || "",
              colonyCount: cultureResult?.colonyCount || "",
              organismIsolation: cultureResult?.organismIsolated || "",
              nonRective: cultureResult?.nonRective || "",
            });
            setCultureDetails(
              (cultureResult?.details || []).map((item) => ({
                id: item.id,
                testId: item.testId,
                antId: item.antId,
                antName: item.antName,
                value: String(item.value ?? ""),
                zone: normalizeZoneValue(item.zone || ""),
              }))
            );
          }
        } else {
          const fields =
            await laboratoryApiService.fetchLabTestFieldDetailsWithResults(
              test.testRegId
            );
          if (mounted) {
            setFieldDetails(fields);

            // Initialize field values with existing results
            const initialValues = fields.map((field) => ({
              fieldId: field.fieldId,
              value: field.resultValue || "",
            }));
            setFieldValues(initialValues);
          }
        }
      } catch (error) {
        console.error("Error fetching test fields:", error);
        showErrorToast("Failed to load test fields for editing.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchFields();
    return () => {
      mounted = false;
    };
  }, [test.testRegId, test.isCulture, laboratoryApiService]);

  // Initialize remarks with patient note
  useEffect(() => {
    if (patientInfo.note) {
      setRemarks(patientInfo.note);
    }
  }, [patientInfo.note]);

  const handleFieldValueChange = (fieldId: number, value: string) => {
    setFieldValues((prev) =>
      prev.map((f) => (f.fieldId === fieldId ? { ...f, value } : f))
    );
  };

  const handleCultureTextChange = (
    key: "smearReport" | "colonyCount" | "organismIsolation" | "nonRective",
    value: string
  ) => {
    setCultureTextData((prev) => ({ ...prev, [key]: value }));
  };

  const handleCultureDetailChange = (
    antId: number,
    key: "value" | "zone",
    value: string
  ) => {
    setCultureDetails((prev) =>
      prev.map((detail) =>
        detail.antId === antId
          ? { ...detail, [key]: key === "zone" ? normalizeZoneValue(value) : value }
          : detail
      )
    );
  };

  const handleSubmit = async () => {
    // Validation - reason is mandatory and must contain at least one letter/number
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      showValidationError("Please enter a reason for re-editing this test result.");
      return;
    }
    if (!/[A-Za-z0-9]/.test(trimmedReason)) {
      showValidationError("Reason must include at least one letter or number.");
      return;
    }

    if (test.isCulture !== 1) {
      // Validation - at least one field must be filled
      const requiredFields = fieldDetails.filter(
        (f) => f.fieldType !== "heading"
      );
      const filledFields = requiredFields.filter((req) => {
        const val =
          fieldValues.find((v) => v.fieldId === req.fieldId)?.value || "";
        return val.trim();
      });

      if (filledFields.length === 0) {
        showValidationError("Please enter at least one field value.");
        return;
      }
    } else if (!cultureId.trim()) {
      showValidationError("Please enter culture id.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (test.isCulture === 1) {
        const cultureUpdatePayload = {
          cultureId,
          smearReport: cultureTextData.smearReport,
          colonyCount: cultureTextData.colonyCount,
          organismIsolated: cultureTextData.organismIsolation,
          nonRective: cultureTextData.nonRective,
          userId: loginData.id,
          reason: trimmedReason,
          editType: "R",
          details: cultureDetails.map((detail) => ({
            id: detail.id,
            testId: detail.testId || test.testId,
            antId: detail.antId,
            antName: detail.antName,
            value: Number(detail.value || 0),
            zone: detail.zone,
          })),
        };

        await laboratoryApiService.updateCultureTestResultByTestRegId(
          test.testRegId,
          cultureUpdatePayload
        );
      } else {
        const payload = [
          {
            patId: patientInfo.patId,
            visitId: patientInfo.visitId,
            testId: test.testId,
            testRegId: test.testRegId,
            note: remarks,
            reason: trimmedReason,
            reEntryValue: fieldDetails.map((detail) => {
              const entered = fieldValues.find(
                (v) => v.fieldId === detail.fieldId
              );
              return {
                testValueId: detail.resultValId ?? 0,
                fieldId: detail.fieldId,
                testValue: entered?.value ?? "",
              };
            }),
            uid: loginData.id,
          },
        ];

        await laboratoryApiService.reEditLabTestResult(payload);
      }
      showSuccessToast("Test result re-edited successfully.", "Success");

      setTimeout(() => {
        onSave?.();
        onBack();
      }, 500);
    } catch (error: any) {
      console.error("Error re-editing test result:", error);
      const errorMsg =
        error?.response?.data?.error ||
        error?.message ||
        "Failed to re-edit test result. Please try again.";
      showErrorToast(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    onBack();
  };

  return (
    <div
      className="result-re-edit-page"
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        className="content-body"
        style={{
          padding: "1rem",
          flex: 1,
          display: "flex",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <Card
          className="shadow-sm"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Card.Header
            style={{ flexShrink: 0, backgroundColor: themePrimary, color: themeSecondary }}
          >
            <h5 className="mb-0">
              <FontAwesomeIcon icon={faPencilAlt} className="me-2" />
              Re-Edit Test Result - {test.testName} ({patientInfo.name} /{" "}
              {patientInfo.opNumber} / {patientInfo.age} / {patientInfo.gender})
            </h5>
          </Card.Header>

          <Card.Body
            style={{
              flex: 1,
              overflowY: "auto",
              minHeight: 0,
              padding: "1.5rem",
            }}
          >
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" role="status" style={{ color: themePrimary }}>
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-3">Loading test fields...</p>
              </div>
            ) : test.isCulture !== 1 && fieldDetails.length === 0 ? (
              <Alert variant="warning">
                <h5>No Fields Available</h5>
                <p className="mb-0">
                  Field definitions are not available for this test.
                </p>
              </Alert>
            ) : (
              <div>
                <div className="mb-4 p-3 rounded bg-light">
                  <div className="row">
                    <div className="col-md-4">
                      <small className="">Test Name : </small>
                      <span className="fw-bold">{test.testName}</span>
                    </div>
                    <div className="col-md-3">
                      <small className="">Department : </small>
                      <span className="fw-bold">{test.deptName}</span>
                    </div>
                    <div className="col-md-3">
                      <small className="">Specimen : </small>
                      <span className="fw-bold">{test.specName}</span>
                    </div>
                    <div className="col-md-2">
                      <small className="">Rate : </small>
                      <span className="fw-bold">₹{test.rate}</span>
                    </div>
                  </div>
                </div>

                {test.isCulture === 1 ? (
                  <>
                    <Row className="mb-3 g-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>
                            <strong>Culture Id</strong>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            value={cultureId}
                            onChange={(e) => setCultureId(e.target.value)}
                            placeholder="Enter culture id"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <div className="mb-3">
                      <Row className="mb-2 align-items-center">
                        <Col md={4}>
                          <strong>SMEAR REPORT:</strong>
                        </Col>
                        <Col md={8}>
                          <Form.Control
                            as="textarea"
                            rows={2}
                            value={cultureTextData.smearReport}
                            onChange={(e) =>
                              handleCultureTextChange("smearReport", e.target.value)
                            }
                            placeholder="Enter smear report"
                          />
                        </Col>
                      </Row>
                      <Row className="mb-2 align-items-center">
                        <Col md={4}>
                          <strong>COLONY COUNT:</strong>
                        </Col>
                        <Col md={8}>
                          <Form.Control
                            as="textarea"
                            rows={2}
                            value={cultureTextData.colonyCount}
                            onChange={(e) =>
                              handleCultureTextChange("colonyCount", e.target.value)
                            }
                            placeholder="Enter colony count"
                          />
                        </Col>
                      </Row>
                      <Row className="mb-2 align-items-center">
                        <Col md={4}>
                          <strong>ORGANISM ISOLATION:</strong>
                        </Col>
                        <Col md={8}>
                          <Form.Control
                            as="textarea"
                            rows={2}
                            value={cultureTextData.organismIsolation}
                            onChange={(e) =>
                              handleCultureTextChange("organismIsolation", e.target.value)
                            }
                            placeholder="Enter organism isolation"
                          />
                        </Col>
                      </Row>
                      <Row className="mb-2 align-items-center">
                        <Col md={4}>
                          <strong>BLOOD CULTURE FOR ENTRIC AND NONENTRIC ORGANISMS:</strong>
                        </Col>
                        <Col md={8}>
                          <Form.Control
                            as="textarea"
                            rows={2}
                            value={cultureTextData.nonRective}
                            onChange={(e) =>
                              handleCultureTextChange("nonRective", e.target.value)
                            }
                            placeholder="Enter blood culture details"
                          />
                        </Col>
                      </Row>
                    </div>

                    <h6 className="mb-3">Antibiotic Results</h6>
                    {cultureDetails.length === 0 ? (
                      <Alert variant="light" className="mb-3">
                        No antibiotic rows available for this culture test.
                      </Alert>
                    ) : (
                      <Table bordered hover size="sm" className="mb-3">
                        <thead>
                          <tr>
                            <th style={{ width: "50px" }}>#</th>
                            <th>Antimicrobial</th>
                            <th style={{ width: "180px" }}>Value</th>
                            <th style={{ width: "180px" }}>Result</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cultureDetails.map((detail, detailIdx) => (
                            <tr key={detail.antId}>
                              <td className="text-center">{detailIdx + 1}</td>
                              <td>
                                <strong>{detail.antName}</strong>
                              </td>
                              <td>
                                <Form.Control
                                  type="text"
                                  size="sm"
                                  value={detail.value}
                                  onChange={(e) =>
                                    handleCultureDetailChange(detail.antId, "value", e.target.value)
                                  }
                                  placeholder="Enter value"
                                />
                              </td>
                              <td>
                                <Form.Select
                                  size="sm"
                                  value={detail.zone}
                                  onChange={(e) =>
                                    handleCultureDetailChange(detail.antId, "zone", e.target.value)
                                  }
                                >
                                  <option value="">Select</option>
                                  <option value="S">Sensitive</option>
                                  <option value="M">Moderate</option>
                                  <option value="R">Resistant</option>
                                </Form.Select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    )}
                  </>
                ) : (
                  <>
                    <Table bordered hover size="sm" className="mb-3">
                      <thead>
                        <tr>
                          <th style={{ width: "50px" }}>#</th>
                          <th>Field Name</th>
                          <th style={{ width: "250px" }}>Value</th>
                          <th style={{ width: "120px" }}>Unit</th>
                          <th style={{ width: "200px" }}>Normal Range</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fieldDetails.map((field, fieldIdx) => {
                          const fieldValue =
                            fieldValues.find((f) => f.fieldId === field.fieldId)
                              ?.value || "";
                          const matchedRef = getMatchingReferenceValue(
                            field.referenceValues,
                            patientInfo.age,
                            patientInfo.gender
                          );

                          let normalRange = "";
                          if (matchedRef && matchedRef.reference) {
                            normalRange = matchedRef.reference;
                          }

                          const renderInput = () => {
                            if (field.fieldType === "heading") {
                              return <span className="text-muted">—</span>;
                            }
                            if (
                              field.fieldType === "noComparison" &&
                              field.lineType === 2
                            ) {
                              return (
                                <Form.Control
                                  as="textarea"
                                  rows={3}
                                  size="sm"
                                  value={fieldValue}
                                  onChange={(e) =>
                                    handleFieldValueChange(
                                      field.fieldId,
                                      e.target.value
                                    )
                                  }
                                  placeholder="Enter value"
                                />
                              );
                            }
                            return (
                              <Form.Control
                                type="text"
                                size="sm"
                                value={fieldValue}
                                onChange={(e) =>
                                  handleFieldValueChange(
                                    field.fieldId,
                                    e.target.value
                                  )
                                }
                                placeholder="Enter value"
                              />
                            );
                          };

                          return (
                            <tr key={field.fieldId}>
                              <td className="text-center">{fieldIdx + 1}</td>
                              <td>
                                <strong>{field.fieldName}</strong>
                              </td>
                              <td>{renderInput()}</td>
                              <td>{field.unit || "-"}</td>
                              <td>{normalRange}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>

                    <Form.Group className="mb-3">
                      <Form.Label>
                        <strong>Remarks / Comments</strong>
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Enter any remarks..."
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                      />
                    </Form.Group>
                  </>
                )}
              </div>
            )}
          </Card.Body>

          {/* Fixed Action Buttons with Reason */}
          <div
            className="p-3 border-top bg-white"
            style={{ flexShrink: 0 }}
          >
            <Form.Group className="mb-3">
              <Form.Label>
                <strong>Reason for Re-Edit <span className="text-danger">*</span></strong>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Enter reason for re-editing this test result (mandatory)..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </Form.Group>

            <div className="d-flex justify-content-between">
              <Button
                onClick={handleBack}
                disabled={isSubmitting}
                className="theme-outline-btn-primary"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                Cancel
              </Button>

              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={
                  isSubmitting ||
                  (test.isCulture !== 1 && fieldDetails.length === 0)
                }
                className="theme-btn-primary"
              >
                {isSubmitting ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Re-Editing...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSave} className="me-2" />
                    Re-Edit Result
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ResultReEdit;
