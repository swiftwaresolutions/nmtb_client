import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Card,
  Button,
  Table,
  Form,
  Alert,
  Accordion,
  Spinner,
  Row,
  Col,
} from "react-bootstrap";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../state/store";
import {
  LaboratoryApiService,
  CultutreTestResultByRegIdResponse,
} from "../../../../../api/laboratory/laboratory-api-service";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckDouble,
  faArrowLeft,
  faCheck,
  faTimes,
  faFlask,
  faPencilAlt,
} from "@fortawesome/free-solid-svg-icons";
import {
  showSuccessToast,
  showErrorToast,
  showValidationError,
  showConfirmDialog,
} from "../../../../../utils/alertUtil";
import SearchInput from "../../../../../components/SearchInput";
import { useTableSearch } from "../../../../../hooks/useTableSearch";
import type { WorkflowComponentProps, BilledTest } from "../types";

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
  referenceValues?: ReferenceValue[];
}

interface TestVerification {
  testId: number;
  status: "pending" | "approved" | "rejected";
  remarks: string;
}

type FieldValueMap = Record<number, { fieldId: number; value: string }[]>;
type FieldDetailMap = Record<number, TestField[]>;
type RemarksMap = Record<number, string>;
type LoadingMap = Record<number, boolean>;
type CultureResultByTestMap = Record<number, CultutreTestResultByRegIdResponse | null>;

interface TemplateAntibiotic {
  antibioticId: number;
  antibioticName: string;
}

interface CultureTemplate {
  id: number;
  tempName: string;
  antibiotics: TemplateAntibiotic[];
}

/**
 * Convert age to a single unit (Years) for easier comparison
 */
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

/**
 * Get matching reference value based on patient age and sex (strict: must match age and sex)
 * Returns the first reference value where sex matches (or is 'common') and age is within range.
 * Returns null if no match.
 */
const getMatchingReferenceValue = (
  referenceValues: ReferenceValue[] | undefined,
  patientAge: number | string,
  patientSex: string
): ReferenceValue | null => {
  if (!referenceValues || referenceValues.length === 0) {
    return null;
  }

  // Normalize patient age to years
  const normalizedPatientAge = parsePatientAgeToYears(patientAge);
  if (normalizedPatientAge === null) {
    return null;
  }
  const pSex = patientSex?.toLowerCase();

  // Find the first reference value where sex matches (or is 'common') and age is within range
  for (const ref of referenceValues) {
    const refSex = ref.sex?.toLowerCase();
    if (refSex !== pSex && refSex !== "common") continue;
    const fromAge = normalizeAge(ref.fromAge, ref.fromAgeType);
    const toAge = normalizeAge(ref.toAge, ref.toAgeType);
    if (normalizedPatientAge >= fromAge && normalizedPatientAge <= toAge) {
      return ref;
    }
  }
  // No match
  return null;
};

/**
 * Get formatted reference range display string
 * Returns the reference value if age/sex match, otherwise returns empty string
 */
const getFormattedReference = (
  referenceValues: ReferenceValue[] | undefined,
  patientAge: number | string,
  patientSex: string
): string => {
  const matchedRef = getMatchingReferenceValue(referenceValues, patientAge, patientSex);
  if (matchedRef && matchedRef.reference) {
    return matchedRef.reference;
  }
  return "";
};

/**
 * Map zone abbreviation to full sensitivity result name
 */
const getZoneDisplayValue = (zone: string | undefined): string => {
  if (!zone) return "-";
  const zoneUpper = zone.toUpperCase().trim();
  switch (zoneUpper) {
    case "R":
      return "Resistant";
    case "S":
      return "Sensitive";
    case "M":
      return "Moderate";
    default:
      return zone;
  }
};

const ResultVerification: React.FC<WorkflowComponentProps & { onEditTest?: (test: BilledTest) => void }> = ({ patient, onBack, onEditTest }) => {
  const themePrimary = "var(--page-primary-color)";
  const themeSecondary = "var(--page-secondary-color)";
  const laboratoryApiService = useMemo(() => new LaboratoryApiService(), []);
  const loginData = useSelector((state: RootState) => state.loginData);

  const [selectedTests, setSelectedTests] = useState<Set<number>>(new Set());
  const [expandedTests, setExpandedTests] = useState<Set<number>>(new Set());
  const [verificationData, setVerificationData] = useState<TestVerification[]>([]);
  const [fieldDetailsByTest, setFieldDetailsByTest] = useState<FieldDetailMap>({});
  const [cultureResultByTest, setCultureResultByTest] = useState<CultureResultByTestMap>({});
  const [loadingFields, setLoadingFields] = useState<LoadingMap>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter only tests with results entered
  const enteredTests = useMemo(
    () => patient?.tests.filter((t) => t.resultEntered && !t.resultVerified) || [],
    [patient]
  );

  // Search functionality for test list
  const { filteredData, searchTerm, setSearchTerm, resultCount, totalCount } = useTableSearch({
    data: enteredTests,
    searchFields: ["testName", "deptName"],
  });

  // Helper function to find field by keywords
  const findFieldByKeywords = useCallback((details: TestField[], keywords: string[]) => {
    return details.find((field) =>
      keywords.some((keyword) =>
        field.fieldName?.toLowerCase().includes(keyword.toLowerCase())
      )
    );
  }, []);

  // Fetch field details with results for a test
  const fetchFieldsForTest = useCallback(
    async (test: BilledTest) => {
      if (test.isCulture === 1) {
        if (cultureResultByTest[test.testId]) return;
      } else if (fieldDetailsByTest[test.testId]) {
        return;
      }

      setLoadingFields((prev) => ({ ...prev, [test.testId]: true }));
      try {
        if (test.isCulture === 1) {
          const cultureResult =
            await laboratoryApiService.fetchCultureTestResultByTestRegId(test.testRegId);
          setCultureResultByTest((prev) => ({ ...prev, [test.testId]: cultureResult || null }));
        } else {
          const fields = await laboratoryApiService.fetchLabTestFieldDetailsWithResults(
            test.testRegId
          );
          setFieldDetailsByTest((prev) => ({ ...prev, [test.testId]: fields }));
        }
      } catch (error) {
        console.error("Error fetching test field details:", error);
        showErrorToast(`Failed to load results for ${test.testName}.`);
      } finally {
        setLoadingFields((prev) => ({ ...prev, [test.testId]: false }));
      }
    },
    [cultureResultByTest, fieldDetailsByTest, laboratoryApiService]
  );

  const handleToggleSelect = async (test: BilledTest, checked: boolean) => {
    setSelectedTests((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(test.testId);
      } else {
        next.delete(test.testId);
      }
      return next;
    });

    setExpandedTests((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(test.testId);
      } else {
        next.delete(test.testId);
      }
      return next;
    });

    if (checked && !fieldDetailsByTest[test.testId]) {
      await fetchFieldsForTest(test);
    }
  };

  const handleExpandToggle = async (test: BilledTest) => {
    const isExpanded = expandedTests.has(test.testId);

    setExpandedTests((prev) => {
      const next = new Set(prev);
      if (isExpanded) {
        next.delete(test.testId);
      } else {
        next.add(test.testId);
      }
      return next;
    });

    setSelectedTests((prev) => {
      const next = new Set(prev);
      if (isExpanded) {
        next.delete(test.testId);
      } else {
        next.add(test.testId);
      }
      return next;
    });

    if (!isExpanded && !fieldDetailsByTest[test.testId]) {
      await fetchFieldsForTest(test);
    }
  };

  const handleApprove = (testId: number) => {
    setVerificationData((prev) =>
      prev.map((item) =>
        item.testId === testId ? { ...item, status: "approved" as const } : item
      )
    );
  };

  const handleReject = (testId: number) => {
    setVerificationData((prev) =>
      prev.map((item) =>
        item.testId === testId ? { ...item, status: "rejected" as const } : item
      )
    );
  };

  const handleRemarksChange = (testId: number, remarks: string) => {
    setVerificationData((prev) =>
      prev.map((item) => (item.testId === testId ? { ...item, remarks } : item))
    );
  };

  const handleSelectAll = async () => {
    const ids = filteredData.map((t) => t.testId);
    setSelectedTests(new Set(ids));
    setExpandedTests(new Set(ids));

    await Promise.all(
      filteredData
        .filter((t) => !fieldDetailsByTest[t.testId])
        .map((t) => fetchFieldsForTest(t))
    );
  };

  const handleClearAll = () => {
    setSelectedTests(new Set());
    setExpandedTests(new Set());
  };

  const handleSubmit = async () => {
    if (selectedTests.size === 0) {
      showValidationError("Please select at least one test to verify.");
      return;
    }

    const confirmed = await showConfirmDialog(
      `Verify ${selectedTests.size} selected test(s)?`,
      "Confirm Verification"
    );

    if (!confirmed.isConfirmed) return;

    setIsSubmitting(true);

    try {
      // Build payload with testRegId and userId for selected tests
      const payload = enteredTests
        .filter((test) => selectedTests.has(test.testId))
        .map((test) => ({
          testRegId: test.testRegId,
          userId: loginData.id,
        }));

      // Call API to verify test results
      await laboratoryApiService.saveResultVerified(payload);

      showSuccessToast(
        `${selectedTests.size} test result(s) verified successfully.`,
        "Success"
      );

      setSelectedTests(new Set());
      setExpandedTests(new Set());

      // Navigate back to workflow
      setTimeout(() => {
        onBack();
      }, 500);
    } catch (error) {
      console.error("Error verifying test results:", error);
      showErrorToast("Failed to verify test results. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (enteredTests.length === 0) {
      showErrorToast("No tests with entered results found.");
      onBack();
      return;
    }

    // Initialize verification data
    const initialData = enteredTests.map((test) => ({
      testId: test.testId,
      status: "pending" as const,
      remarks: "",
    }));
    setVerificationData(initialData);

  }, [enteredTests, onBack, laboratoryApiService]);

  const handleBack = () => {
    onBack();
  };

  return (
    <div
      className="result-verification-page"
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
            style={{
              flexShrink: 0,
              backgroundColor: themePrimary,
              color: themeSecondary,
            }}
          >
            <h5 className="mb-0">
              <FontAwesomeIcon icon={faFlask} className="me-2" />
              Verify Test Results - {patient.name} ({patient.opNumber} / {patient.age} / {patient.gender})
            </h5>
          </Card.Header>
          <Card.Body style={{ flex: 1, overflowY: "auto", minHeight: 0, padding: "1.5rem" }}>
            {enteredTests.length === 0 ? (
              <Alert variant="warning">
                <h5>No Tests Available</h5>
                <p className="mb-0">
                  All tests have been verified, or no results have been entered yet.
                </p>
              </Alert>
            ) : (
              <Row style={{ height: "100%" }}>
                <Col md={12} style={{ height: "100%", overflowY: "auto" }}>
                  <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
                    <SearchInput
                      searchTerm={searchTerm}
                      onSearchChange={setSearchTerm}
                      placeholder="Search tests..."
                      resultCount={resultCount}
                      totalCount={totalCount}
                    />
                    <div className="d-flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleSelectAll}
                        className="theme-btn-primary"
                      >
                        Select All
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleClearAll}
                        className="theme-outline-btn-primary"
                      >
                        Clear All
                      </Button>
                    </div>
                  </div>

                  {filteredData.length === 0 ? (
                    <Alert variant="warning">No tests available.</Alert>
                  ) : (
                    <Accordion alwaysOpen activeKey={Array.from(expandedTests).map(String)}>
                      {filteredData.map((test, idx) => {
                        const details = fieldDetailsByTest[test.testId];
                        const cultureResult = cultureResultByTest[test.testId];
                        const verification = verificationData.find((v) => v.testId === test.testId);
                        const isSelected = selectedTests.has(test.testId);
                        const isLoading = loadingFields[test.testId];

                        return (
                          <Accordion.Item eventKey={String(test.testId)} key={test.testId} className="mb-2">
                            <Accordion.Header onClick={() => handleExpandToggle(test)}>
                              <div className="d-flex align-items-center w-100 gap-3">
                                <Form.Check
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => handleToggleSelect(test, e.target.checked)}
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <div className="flex-grow-1">
                                  <div className="d-flex align-items-center gap-2">
                                    <strong>{idx + 1}. {test.testName}</strong>
                                    <span
                                      className="badge theme-badge-primary"
                                    >
                                      {test.deptName}
                                    </span>
                                  </div>
                                  {/* <small className="text-muted">₹{test.rate}</small> */}
                                </div>
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="theme-btn-link-secondary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEditTest?.(test);
                                  }}
                                >
                                  <FontAwesomeIcon icon={faPencilAlt} className="me-1" />
                                  Edit
                                </Button>
                              </div>
                            </Accordion.Header>
                            <Accordion.Body>
                              {isLoading && (
                                <div className="text-center py-3">
                                  <Spinner animation="border" size="sm" /> Loading results...
                                </div>
                              )}

                              {!isLoading && test.isCulture !== 1 && (!details || details.length === 0) && (
                                <Alert variant="light" className="mb-0">
                                  Field definitions not available for this test.
                                </Alert>
                              )}

                              {!isLoading && test.isCulture === 1 && !cultureResult && (
                                <Alert variant="light" className="mb-0">
                                  Culture result details not available for this test.
                                </Alert>
                              )}

                              {!isLoading && test.isCulture === 1 && cultureResult && (
                                <>
                                  <Row className="mb-3 g-3">
                                    <Col md={6}>
                                      <Form.Group>
                                        <Form.Label><strong>Culture Id</strong></Form.Label>
                                        <Form.Control
                                          type="text"
                                          value={cultureResult.cultureId || ""}
                                          readOnly
                                          plaintext
                                        />
                                      </Form.Group>
                                    </Col>
                                  </Row>

                                  <div className="mb-3">
                                    <Row className="mb-2">
                                      <Col md={4}>
                                        <strong>SMEAR REPORT:</strong>
                                      </Col>
                                      <Col md={8}>
                                        <div className="border rounded p-2 bg-light">
                                          {cultureResult.smearReport || "-"}
                                        </div>
                                      </Col>
                                    </Row>
                                    <Row className="mb-2">
                                      <Col md={4}>
                                        <strong>COLONY COUNT:</strong>
                                      </Col>
                                      <Col md={8}>
                                        <div className="border rounded p-2 bg-light">
                                          {cultureResult.colonyCount || "-"}
                                        </div>
                                      </Col>
                                    </Row>
                                    <Row className="mb-2">
                                      <Col md={4}>
                                        <strong>ORGANISM ISOLATION:</strong>
                                      </Col>
                                      <Col md={8}>
                                        <div className="border rounded p-2 bg-light">
                                          {cultureResult.organismIsolated || "-"}
                                        </div>
                                      </Col>
                                    </Row>
                                    <Row className="mb-2">
                                      <Col md={4}>
                                        <strong>BLOOD CULTURE FOR ENTRIC AND NONENTRIC ORGANISMS:</strong>
                                      </Col>
                                      <Col md={8}>
                                        <div className="border rounded p-2 bg-light">
                                          {cultureResult.nonRective || "-"}
                                        </div>
                                      </Col>
                                    </Row>
                                  </div>

                                  {cultureResult.details && cultureResult.details.length > 0 ? (
                                    <Table bordered hover size="sm" className="mb-2">
                                      <thead>
                                        <tr>
                                          <th>Antimicrobial</th>
                                          <th style={{ width: "220px" }}>Value</th>
                                          <th style={{ width: "260px" }}>Result</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {cultureResult.details.map((item) => (
                                          <tr key={item.id || `${item.antId}-${item.antName}`}>
                                            <td>{item.antName || "-"}</td>
                                            <td><strong>{item.value ?? "-"}</strong></td>
                                          <td><strong>{getZoneDisplayValue(item.zone)}</strong></td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </Table>
                                  ) : (
                                    <Alert variant="light" className="mb-2">
                                      No antimicrobial results available.
                                    </Alert>
                                  )}

                                  <Form.Group className="mb-3">
                                    <Form.Label>
                                      <strong>Remarks / Comments : </strong>
                                    </Form.Label>
                                    <Form.Label className="ms-2">{patient.note}</Form.Label>
                                  </Form.Group>
                                </>
                              )}

                              {!isLoading && test.isCulture !== 1 && details && details.length > 0 && (
                                <>
                                  <Table bordered hover size="sm" className="mb-3">
                                    <thead >
                                      <tr>
                                        <th style={{ width: "50px" }}>#</th>
                                        <th>Field Name</th>
                                        <th style={{ width: "150px" }}>Value</th>
                                        <th style={{ width: "180px" }}>Reference Range</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {details.map((field, fieldIdx) => {
                                        const referenceRange = getFormattedReference(
                                          field.referenceValues,
                                          patient.age,
                                          patient.gender
                                        );

                                        return (
                                          <tr key={field.fieldId}>
                                            <td className="text-center">{fieldIdx + 1}</td>
                                            <td>
                                              {field.fieldName}
                                            </td>
                                            <td>
                                              <strong>{field.resultValue || ""}</strong> {field.unit || ""}
                                            </td>
                                            <td style={{ whiteSpace: "pre-wrap" }}>{referenceRange} {field.unit || ""}</td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </Table>

                                  <Form.Group className="mb-3">
                                    <Form.Label>
                                      <strong>Remarks / Comments : </strong>
                                    </Form.Label>
                                    <Form.Label className="ms-2">{patient.note}</Form.Label>
                                  </Form.Group>
                                </>
                              )}
                            </Accordion.Body>
                          </Accordion.Item>
                        );
                      })}
                    </Accordion>
                  )}
                </Col>
              </Row>
            )}
          </Card.Body>

          {/* Fixed Action Buttons */}
          <div className="d-flex justify-content-between p-3 border-top bg-white" style={{ flexShrink: 0 }}>
            <Button
              size="sm"
              onClick={handleBack}
              disabled={isSubmitting}
              className="theme-outline-btn-primary"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
              Back to Patient List
            </Button>

            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={isSubmitting || selectedTests.size === 0}
              className="theme-btn-primary"
            >
              {isSubmitting ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Verifying Results...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheckDouble} className="me-2" />
                  Verify Selected ({selectedTests.size})
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ResultVerification;
