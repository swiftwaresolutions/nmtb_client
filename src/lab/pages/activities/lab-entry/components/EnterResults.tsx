import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Card,
  Button,
  Table,
  Form,
  Alert,
  Row,
  Col,
  Accordion,
  Spinner,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faSave,
  faFlaskVial,
} from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../state/store";
import {
  showSuccessToast,
  showErrorToast,
  showValidationError,
} from "../../../../../utils/alertUtil";
import { LaboratoryApiService } from "../../../../../api/laboratory/laboratory-api-service";
import type { WorkflowComponentProps, BilledTest } from "../types";
import SearchInput from "../../../../../components/SearchInput";
import { useTableSearch } from "../../../../../hooks/useTableSearch";

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

type FieldValueMap = Record<number, { fieldId: number; value: string }[]>;
type FieldDetailMap = Record<number, FieldDetail[]>;
type RemarksMap = Record<number, string>;
type LoadingMap = Record<number, boolean>;
type CultureTemplateSelectionMap = Record<number, number>;
type CultureIdMap = Record<number, string>;
type CultureResultMap = Record<number, Record<string, string>>;
type CultureValueMap = Record<number, Record<string, string>>;
type CultureTextMap = Record<
  number,
  {
    smearReport: string;
    colonyCount: string;
    organismIsolation: string;
    bloodCultureOrganisms: string;
  }
>;

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

const EnterResults: React.FC<WorkflowComponentProps> = ({ patient, onBack }) => {
  const themePrimary = "var(--page-primary-color)";
  const themeSecondary = "var(--page-secondary-color)";
  const laboratoryApiService = useMemo(() => new LaboratoryApiService(), []);
  const loginData = useSelector((state: RootState) => state.loginData);

  const [selectedTests, setSelectedTests] = useState<Set<number>>(new Set());
  const [expandedTests, setExpandedTests] = useState<Set<number>>(new Set());
  const [fieldDetailsByTest, setFieldDetailsByTest] = useState<FieldDetailMap>({});
  const [fieldValuesByTest, setFieldValuesByTest] = useState<FieldValueMap>({});
  const [remarksByTest, setRemarksByTest] = useState<RemarksMap>({});

  const [loadingFields, setLoadingFields] = useState<LoadingMap>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cultureTemplates, setCultureTemplates] = useState<CultureTemplate[]>([]);
  const [cultureTemplateByTest, setCultureTemplateByTest] =
    useState<CultureTemplateSelectionMap>({});
  const [cultureIdByTest, setCultureIdByTest] = useState<CultureIdMap>({});
  const [cultureResultsByTest, setCultureResultsByTest] = useState<CultureResultMap>({});
  const [cultureValuesByTest, setCultureValuesByTest] = useState<CultureValueMap>({});
  const [cultureTextByTest, setCultureTextByTest] = useState<CultureTextMap>({});

  // Filter tests with received specimen
  const receivedTests = useMemo(
    () => patient?.tests.filter((t) => t.specimenReceived && !t.resultEntered) || [],
    [patient]
  );

  // Search functionality for test list
  const { filteredData, searchTerm, setSearchTerm, resultCount, totalCount } = useTableSearch({
    data: receivedTests,
    searchFields: ["testName", "deptName"],
  });

  useEffect(() => {
    let mounted = true;
    const loadCultureTemplates = async () => {
      try {
        const templates = await laboratoryApiService.fetchAllLabAntibioticTemplates();
        if (mounted) setCultureTemplates(Array.isArray(templates) ? templates : []);
      } catch (error) {
        if (!mounted) return;
        console.error("Error fetching culture templates:", error);
      }
    };
    loadCultureTemplates();
    return () => {
      mounted = false;
    };
  }, [laboratoryApiService]);

  // Fetch fields for a test lazily
  const fetchFieldsForTest = useCallback(
    async (test: BilledTest) => {
      setLoadingFields((prev) => ({ ...prev, [test.testId]: true }));
      try {
        const fields = await laboratoryApiService.fetchLabTestFieldDetails(test.testRegId);
        setFieldDetailsByTest((prev) => ({ ...prev, [test.testId]: fields }));

        setFieldValuesByTest((prev) => {
          if (prev[test.testId]) return prev;
          const initialValues = fields
            .filter((field) => field.fieldType !== "heading")
            .map((field) => ({
              fieldId: field.fieldId,
              value: field.resultValue || "",
            }));
          return { ...prev, [test.testId]: initialValues };
        });

        setRemarksByTest((prev) => ({ ...prev, [test.testId]: prev[test.testId] || "" }));
      } catch (error) {
        console.error("Error fetching test fields:", error);
        showErrorToast(`Failed to load fields for ${test.testName}.`);
      } finally {
        setLoadingFields((prev) => ({ ...prev, [test.testId]: false }));
      }
    },
    [laboratoryApiService]
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

  const handleFieldValueChange = (testId: number, fieldId: number, value: string) => {
    setFieldValuesByTest((prev) => {
      const existing = prev[testId] || [];
      const updated = existing.map((f) => (f.fieldId === fieldId ? { ...f, value } : f));
      return { ...prev, [testId]: updated };
    });
  };

  const handleRemarksChange = (testId: number, value: string) => {
    setRemarksByTest((prev) => ({ ...prev, [testId]: value }));
  };

  const findFieldByKeywords = (details: FieldDetail[], keywords: string[]) => {
    return details.find((field) =>
      keywords.some((keyword) =>
        field.fieldName?.toLowerCase().includes(keyword.toLowerCase())
      )
    );
  };

  const getFieldValue = (testId: number, fieldId?: number) => {
    if (!fieldId) return "";
    return (
      fieldValuesByTest[testId]?.find((f) => f.fieldId === fieldId)?.value || ""
    );
  };

  const handleCultureIdChange = (testId: number, value: string) => {
    setCultureIdByTest((prev) => ({ ...prev, [testId]: value }));
  };

  const handleCultureTextChange = (
    testId: number,
    key:
      | "smearReport"
      | "colonyCount"
      | "organismIsolation"
      | "bloodCultureOrganisms",
    value: string,
    fieldId?: number
  ) => {
    setCultureTextByTest((prev) => ({
      ...prev,
      [testId]: {
        smearReport: prev[testId]?.smearReport || "",
        colonyCount: prev[testId]?.colonyCount || "",
        organismIsolation: prev[testId]?.organismIsolation || "",
        bloodCultureOrganisms: prev[testId]?.bloodCultureOrganisms || "",
        [key]: value,
      },
    }));

    if (fieldId) {
      handleFieldValueChange(testId, fieldId, value);
    }
  };

  const handleCultureTemplateChange = (
    testId: number,
    details: FieldDetail[],
    templateId: number
  ) => {
    setCultureTemplateByTest((prev) => ({ ...prev, [testId]: templateId }));

    const selectedTemplate = cultureTemplates.find((t) => t.id === templateId);
    if (!selectedTemplate) return;

    const initialResultMap: Record<string, string> = {};
    const initialValueMap: Record<string, string> = {};
    selectedTemplate.antibiotics.forEach((antibiotic) => {
      const matchedField = details.find(
        (field) =>
          field.fieldName?.trim().toLowerCase() ===
          antibiotic.antibioticName?.trim().toLowerCase()
      );
      initialResultMap[String(antibiotic.antibioticId)] = matchedField
        ? getFieldValue(testId, matchedField.fieldId)
        : "";
      initialValueMap[String(antibiotic.antibioticId)] = "";
    });

    setCultureResultsByTest((prev) => ({ ...prev, [testId]: initialResultMap }));
    setCultureValuesByTest((prev) => ({ ...prev, [testId]: initialValueMap }));
  };

  const handleCultureResultChange = (
    testId: number,
    details: FieldDetail[],
    antibioticId: number,
    antibioticName: string,
    value: string
  ) => {
    setCultureResultsByTest((prev) => ({
      ...prev,
      [testId]: {
        ...(prev[testId] || {}),
        [String(antibioticId)]: value,
      },
    }));

    const matchedField = details.find(
      (field) =>
        field.fieldName?.trim().toLowerCase() === antibioticName.trim().toLowerCase()
    );
    if (matchedField) {
      handleFieldValueChange(testId, matchedField.fieldId, value);
    }
  };

  const handleCultureValueChange = (
    testId: number,
    antibioticId: number,
    value: string
  ) => {
    setCultureValuesByTest((prev) => ({
      ...prev,
      [testId]: {
        ...(prev[testId] || {}),
        [String(antibioticId)]: value,
      },
    }));
  };

  const getValidationState = (testId: number) => {
    const details = fieldDetailsByTest[testId];
    const values = fieldValuesByTest[testId];
    if (!details || !values) return { total: 0, missing: 0 };
    const required = details.filter((f) => f.fieldType !== "heading");
    const missing = required.filter((req) => {
      const val = values.find((v) => v.fieldId === req.fieldId)?.value || "";
      return !val.trim();
    });
    return { total: required.length, missing: missing.length };
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
      showValidationError("Please select at least one test to save results.");
      return;
    }

    const regularPayload: Array<{
      testId: number;
      testRegId: number;
      userId: number;
      note: string;
      values: { testValueId: number; fieldId: number; testValue: string }[];
    }> = [];

    const culturePayload: Array<{
      testRegId: number;
      userId: number;
      cultureId: string;
      smearReport: string;
      colonyCount: string;
      organismIsolated: string;
      nonRective: string;
      details: {
        id: number;
        testId: number;
        deptId: number;
        antId: number;
        antName: string;
        value: number;
        zone: string;
      }[];
    }> = [];

    const missingTests: string[] = [];

    for (const testId of Array.from(selectedTests)) {
      const test = receivedTests.find((t) => t.testId === testId);
      if (!test) continue;
      const details = fieldDetailsByTest[testId];
      const values = fieldValuesByTest[testId];

      if (!details || !values) {
        missingTests.push(test.testName);
        continue;
      }

      const commonValues = (details || []).map((detail) => {
        const entered = values.find((v) => v.fieldId === detail.fieldId);
        return {
          testValueId: detail.resultValId ?? 0,
          fieldId: detail.fieldId,
          testValue: entered?.value ?? "",
        };
      });

      if (test.isCulture === 1) {
        const smearField = findFieldByKeywords(details, ["smear"]);
        const colonyField = findFieldByKeywords(details, ["colony"]);
        const organismField = findFieldByKeywords(details, ["organism", "isolation"]);
        const bloodCultureField = findFieldByKeywords(details, [
          "blood culture",
          "enteric",
          "nonenteric",
          "non-enteric",
          "entric",
          "nonentric",
        ]);

        const templateId = cultureTemplateByTest[test.testId];
        const selectedTemplate = cultureTemplates.find((t) => t.id === templateId);
        const detailsPayload = (selectedTemplate?.antibiotics || []).map((antibiotic) => ({
          id: 0,
          testId: test.testId,
          deptId: 0,
          antId: antibiotic.antibioticId,
          antName: antibiotic.antibioticName,
          value: Number(cultureValuesByTest[test.testId]?.[String(antibiotic.antibioticId)] || 0),
          zone: cultureResultsByTest[test.testId]?.[String(antibiotic.antibioticId)] || "",
        }));

        const smearReport = smearField
          ? getFieldValue(test.testId, smearField.fieldId)
          : cultureTextByTest[test.testId]?.smearReport || "";
        const colonyCount = colonyField
          ? getFieldValue(test.testId, colonyField.fieldId)
          : cultureTextByTest[test.testId]?.colonyCount || "";
        const organismIsolation = organismField
          ? getFieldValue(test.testId, organismField.fieldId)
          : cultureTextByTest[test.testId]?.organismIsolation || "";
        const bloodCultureOrganisms = bloodCultureField
          ? getFieldValue(test.testId, bloodCultureField.fieldId)
          : cultureTextByTest[test.testId]?.bloodCultureOrganisms || "";

        const hasCultureId = Boolean((cultureIdByTest[test.testId] || "").trim());
        const hasOtherCultureData =
          Boolean(smearReport.trim()) ||
          Boolean(colonyCount.trim()) ||
          Boolean(organismIsolation.trim()) ||
          Boolean(bloodCultureOrganisms.trim()) ||
          detailsPayload.some(
            (detail) => Boolean(detail.zone?.trim()) || detail.value > 0
          );
        const hasRemarks = Boolean((remarksByTest[testId] || "").trim());

        if (!hasCultureId || (!hasOtherCultureData && !hasRemarks)) {
          missingTests.push(`${test.testName} (Culture ID + remarks/other fields required)`);
          continue;
        }

        culturePayload.push({
          testRegId: test.testRegId,
          userId: loginData.id,
          cultureId: cultureIdByTest[test.testId] || "",
          smearReport,
          colonyCount,
          organismIsolated: organismIsolation,
          nonRective: bloodCultureOrganisms,
          details: detailsPayload,
        });
      } else {
        // Non-culture tests: require at least one non-heading field value
        const requiredFields = details.filter((f) => f.fieldType !== "heading");
        const filledFields = requiredFields.filter((req) => {
          const val = values.find((v) => v.fieldId === req.fieldId)?.value || "";
          return val.trim();
        });
        if (filledFields.length === 0) {
          missingTests.push(`${test.testName} (no fields entered)`);
          continue;
        }

        regularPayload.push({
          testId: test.testId,
          testRegId: test.testRegId,
          userId: loginData.id,
          note: remarksByTest[testId] || "",
          values: commonValues,
        });
      }
    }

    if (missingTests.length > 0) {
        showValidationError(
          `Please enter at least one field for each selected test before saving: ${missingTests.join(", ")}`
        );
        return;
    }

    if (regularPayload.length === 0 && culturePayload.length === 0) {
      showValidationError("No valid tests to submit. Please fill required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (regularPayload.length > 0) {
        await laboratoryApiService.saveLabTestResult(regularPayload);
      }

      if (culturePayload.length > 0) {
        for (const cultureItem of culturePayload) {
          await laboratoryApiService.saveLabCultureTestResult(cultureItem);
        }
      }

      if (regularPayload.length > 0 && culturePayload.length > 0) {
        showSuccessToast(
          `Results saved for ${regularPayload.length} regular test(s) and ${culturePayload.length} culture test(s).`,
          "Success"
        );
      } else if (regularPayload.length > 0) {
        showSuccessToast(`Results saved for ${regularPayload.length} test(s).`, "Success");
      } else {
        showSuccessToast(
          `Results saved for ${culturePayload.length} culture test(s).`,
          "Success"
        );
      }

      setSelectedTests(new Set());
      setExpandedTests(new Set());
      setFieldDetailsByTest({});
      setFieldValuesByTest({});
      setRemarksByTest({});
      setCultureTemplateByTest({});
      setCultureIdByTest({});
      setCultureResultsByTest({});
      setCultureValuesByTest({});
      setCultureTextByTest({});

      setTimeout(() => onBack(), 500);
    } catch (error: any) {
      console.error("Error saving test results:", error);
      const errorMsg =
        error?.response?.data?.error ||
        error?.message ||
        "Failed to save test results. Please try again.";
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
      className="enter-results-page"
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
              <FontAwesomeIcon icon={faFlaskVial} className="me-2" />
              Test Results Entry - {patient.name} ({patient.opNumber} / {patient.age} / {patient.gender})
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
            {receivedTests.length === 0 ? (
              <Alert variant="warning">
                <h5>No Tests Available</h5>
                <p className="mb-0">
                  All tests have already had results entered, or no specimens have been received yet.
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
                        const values = fieldValuesByTest[test.testId] || [];
                        const { missing, total } = getValidationState(test.testId);
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
                                <span
                                  className={`badge ${
                                    missing === 0 && total > 0
                                      ? "theme-badge-primary"
                                      : "theme-badge-secondary"
                                  }`}
                                >
                                  {missing === 0 && total > 0 ? "Complete" : `${missing} pending`}
                                </span>
                              </div>
                            </Accordion.Header>
                            <Accordion.Body>
                              {isLoading && (
                                <div className="text-center py-3">
                                  <Spinner animation="border" size="sm" /> Loading fields...
                                </div>
                              )}

                              {!isLoading && (!details || details.length === 0) && (
                                <Alert variant="light" className="mb-0">Field definitions not available for this test.</Alert>
                              )}

                              {!isLoading && details && details.length > 0 && (
                                <>
                                  {test.isCulture === 1 ? (
                                    <>
                                      <Row className="mb-3 g-3">
                                        <Col md={6}>
                                          <Form.Group>
                                            <Form.Label>Culture Id</Form.Label>
                                            <Form.Control
                                              type="text"
                                              value={cultureIdByTest[test.testId] || ""}
                                              onChange={(e) =>
                                                handleCultureIdChange(test.testId, e.target.value)
                                              }
                                              placeholder="Enter culture id"
                                            />
                                          </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                          <Form.Group>
                                            <Form.Label>Select Template</Form.Label>
                                            <Form.Select
                                              value={cultureTemplateByTest[test.testId] || ""}
                                              onChange={(e) =>
                                                handleCultureTemplateChange(
                                                  test.testId,
                                                  details,
                                                  Number(e.target.value)
                                                )
                                              }
                                            >
                                              <option value="">-- Select Template --</option>
                                              {cultureTemplates.map((template) => (
                                                <option key={template.id} value={template.id}>
                                                  {template.tempName}
                                                </option>
                                              ))}
                                            </Form.Select>
                                          </Form.Group>
                                        </Col>
                                      </Row>

                                      {(() => {
                                        const smearField = findFieldByKeywords(details, ["smear"]);
                                        const colonyField = findFieldByKeywords(details, ["colony"]);
                                        const organismField = findFieldByKeywords(details, ["organism", "isolation"]);
                                        const bloodCultureField = findFieldByKeywords(details, [
                                          "blood culture",
                                          "enteric",
                                          "nonenteric",
                                          "non-enteric",
                                          "entric",
                                          "nonentric",
                                        ]);
                                        return (
                                          <div className="mb-3">
                                            <Row className="mb-2 align-items-center">
                                              <Col md={4}>
                                                <strong>SMEAR REPORT:</strong>
                                              </Col>
                                              <Col md={8}>
                                                <Form.Control
                                                  as="textarea"
                                                  rows={2}
                                                  value={
                                                    smearField
                                                      ? getFieldValue(test.testId, smearField.fieldId)
                                                      : cultureTextByTest[test.testId]?.smearReport || ""
                                                  }
                                                  onChange={(e) =>
                                                    handleCultureTextChange(
                                                      test.testId,
                                                      "smearReport",
                                                      e.target.value,
                                                      smearField?.fieldId
                                                    )
                                                  }
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
                                                  value={
                                                    colonyField
                                                      ? getFieldValue(test.testId, colonyField.fieldId)
                                                      : cultureTextByTest[test.testId]?.colonyCount || ""
                                                  }
                                                  onChange={(e) =>
                                                    handleCultureTextChange(
                                                      test.testId,
                                                      "colonyCount",
                                                      e.target.value,
                                                      colonyField?.fieldId
                                                    )
                                                  }
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
                                                  value={
                                                    organismField
                                                      ? getFieldValue(test.testId, organismField.fieldId)
                                                      : cultureTextByTest[test.testId]?.organismIsolation || ""
                                                  }
                                                  onChange={(e) =>
                                                    handleCultureTextChange(
                                                      test.testId,
                                                      "organismIsolation",
                                                      e.target.value,
                                                      organismField?.fieldId
                                                    )
                                                  }
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
                                                  value={
                                                    bloodCultureField
                                                      ? getFieldValue(test.testId, bloodCultureField.fieldId)
                                                      : cultureTextByTest[test.testId]?.bloodCultureOrganisms || ""
                                                  }
                                                  onChange={(e) =>
                                                    handleCultureTextChange(
                                                      test.testId,
                                                      "bloodCultureOrganisms",
                                                      e.target.value,
                                                      bloodCultureField?.fieldId
                                                    )
                                                  }
                                                />
                                              </Col>
                                            </Row>
                                          </div>
                                        );
                                      })()}

                                      {cultureTemplateByTest[test.testId] ? (
                                        <Table bordered hover size="sm" className="mb-2">
                                          <thead>
                                            <tr>
                                              <th>Antimicrobial</th>
                                              <th style={{ width: "220px" }}>Value</th>
                                              <th style={{ width: "260px" }}>Result</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {(cultureTemplates.find(
                                              (t) => t.id === cultureTemplateByTest[test.testId]
                                            )?.antibiotics || []).map((antibiotic) => (
                                              <tr key={antibiotic.antibioticId}>
                                                <td>{antibiotic.antibioticName}</td>
                                                <td>
                                                  <Form.Control
                                                    type="text"
                                                    size="sm"
                                                    value={
                                                      cultureValuesByTest[test.testId]?.[
                                                        String(antibiotic.antibioticId)
                                                      ] || ""
                                                    }
                                                    onChange={(e) =>
                                                      handleCultureValueChange(
                                                        test.testId,
                                                        antibiotic.antibioticId,
                                                        e.target.value
                                                      )
                                                    }
                                                    placeholder="Enter value"
                                                  />
                                                </td>
                                                <td>
                                                  <Form.Select
                                                    size="sm"
                                                    value={
                                                      cultureResultsByTest[test.testId]?.[
                                                        String(antibiotic.antibioticId)
                                                      ] || ""
                                                    }
                                                    onChange={(e) =>
                                                      handleCultureResultChange(
                                                        test.testId,
                                                        details,
                                                        antibiotic.antibioticId,
                                                        antibiotic.antibioticName,
                                                        e.target.value
                                                      )
                                                    }
                                                  >
                                                    <option value="">-- Select --</option>
                                                    <option value="S">Sensitive</option>
                                                    <option value="R">Resistant</option>
                                                    <option value="M">Moderate</option>
                                                  </Form.Select>
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </Table>
                                      ) : (
                                        <Alert variant="light" className="mb-2">
                                          Select a template to load antimicrobial items.
                                        </Alert>
                                      )}
                                    </>
                                  ) : (
                                    <Table bordered hover size="sm" className="mb-2">
                                      <thead >
                                        <tr>
                                          <th style={{ width: "50px" }}>#</th>
                                          <th>Field Name</th>
                                          <th style={{ width: "250px" }}>Value</th>
                                          <th style={{ width: "120px" }}>Unit</th>
                                          <th style={{ width: "200px" }}>Normal Range</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {details.map((field, fieldIdx) => {
                                          const fieldValue = values.find((f) => f.fieldId === field.fieldId)?.value || "";
                                          const matchedRef = getMatchingReferenceValue(
                                            field.referenceValues,
                                            patient.age,
                                            patient.gender
                                          );

                                          let normalRange = "";
                                          if (matchedRef && matchedRef.reference) {
                                            normalRange = matchedRef.reference;
                                          }

                                          const renderInput = () => {
                                            if (field.fieldType === "heading") {
                                              return <span className="text-muted">—</span>;
                                            }
                                            if (field.fieldType === "noComparison" && field.lineType === 2) {
                                              return (
                                                <Form.Control
                                                  as="textarea"
                                                  rows={3}
                                                  size="sm"
                                                  value={fieldValue}
                                                  onChange={(e) => handleFieldValueChange(test.testId, field.fieldId, e.target.value)}
                                                  placeholder="Enter value"
                                                />
                                              );
                                            }
                                            return (
                                              <Form.Control
                                                type="text"
                                                size="sm"
                                                value={fieldValue}
                                                onChange={(e) => handleFieldValueChange(test.testId, field.fieldId, e.target.value)}
                                                placeholder="Enter value"
                                              />
                                            );
                                          };

                                          return (
                                            <tr key={field.fieldId}>
                                              <td className="text-center">{fieldIdx + 1}</td>
                                              <td><strong>{field.fieldName}</strong></td>
                                              <td>{renderInput()}</td>
                                              <td>{field.unit || "-"}</td>
                                              <td style={{ whiteSpace: "pre-wrap" }}>{normalRange}</td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </Table>
                                  )}

                                  <Form.Group className="mb-3">
                                    <Form.Label><strong>Remarks / Comments</strong></Form.Label>
                                    <Form.Control
                                      as="textarea"
                                      rows={2}
                                      placeholder="Enter any remarks..."
                                      value={remarksByTest[test.testId] || ""}
                                      onChange={(e) => handleRemarksChange(test.testId, e.target.value)}
                                    />
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
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Saving Results...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSave} className="me-2" />
                  Save Selected ({selectedTests.size})
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EnterResults;
