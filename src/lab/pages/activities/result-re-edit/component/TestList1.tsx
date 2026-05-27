import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    Card,
    Button,
    Form,
    Alert,
    Spinner,
    Accordion,
    Table,
} from "react-bootstrap";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../state/store";
import {
    CultutreTestResultByRegIdResponse,
    LaboratoryApiService,
} from "../../../../../api/laboratory/laboratory-api-service";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft,
    faEdit,
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
import ResultReEdit from "./ResultReEdit";

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

interface TestItem {
    testRegId: number;
    testName: string;
    testCode?: string;
    testId: number;
    specName: string;
    deptName: string;
    rate: number;
    units: number;
    isReceived: number;
    isDone: number;
    isVerified: number;
    isPrinted: number;
    entDateTime: string;
    uid: number;
    finalBillId: number | null;
    returnUnit: number;
    isCancelled: number;
    note?: string;
    isCulture: number;
}

interface TestList1Props {
    finalBillId: number;
    patientInfo?: {
        name: string;
        opNumber: string;
        age: number;
        gender: string;
        note?: string;
        patId: number;
        visitId: number;
    };
    onBack: () => void;
    onEditTest?: (test: TestItem, patientInfo?: any) => void;
}

type FieldDetailMap = Record<number, TestField[]>;
type LoadingMap = Record<number, boolean>;
type CultureResultMap = Record<number, CultutreTestResultByRegIdResponse | null>;

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

/**
 * Get formatted reference range display string
 */
const getFormattedReference = (
    referenceValues: ReferenceValue[] | undefined,
    patientAge: number,
    patientSex: string
): string => {
    const matchedRef = getMatchingReferenceValue(referenceValues, patientAge, patientSex);
    if (matchedRef && matchedRef.reference) {
        return matchedRef.reference;
    }
    return "";
};

const TestList1: React.FC<TestList1Props> = ({ finalBillId, patientInfo, onBack, onEditTest }) => {
    const themePrimary = "var(--page-primary-color)";
    const themeSecondary = "var(--page-secondary-color)";
    const laboratoryApiService = useMemo(() => new LaboratoryApiService(), []);
    const loginData = useSelector((state: RootState) => state.loginData);

    console.log("TestList1 received patientInfo:", patientInfo);

    const [tests, setTests] = useState<TestItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [expandedTests, setExpandedTests] = useState<Set<number>>(new Set());
    const [fieldDetailsByTest, setFieldDetailsByTest] = useState<FieldDetailMap>({});
    const [cultureResultByTest, setCultureResultByTest] = useState<CultureResultMap>({});
    const [loadingFields, setLoadingFields] = useState<LoadingMap>({});
    const [selectedTest, setSelectedTest] = useState<TestItem | null>(null);
    const [showEditPage, setShowEditPage] = useState(false);

    // Search functionality for test list
    const { filteredData, searchTerm, setSearchTerm, resultCount, totalCount } = useTableSearch({
        data: tests,
        searchFields: ["testName", "deptName"],
    });

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            if (!mounted) return;
            setLoading(true);
            try {
                const data = await laboratoryApiService.fetchLabTestsFromBill(finalBillId);
                if (!mounted) return;
                setTests(data);
                if (data.length === 0) {
                    showErrorToast("No tests found for this bill.");
                }
            } catch (error: any) {
                if (!mounted) return;
                console.error("Error fetching tests:", error);
                showErrorToast(
                    error?.response?.data?.error || "Failed to fetch tests"
                );
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => { mounted = false; };
    }, [finalBillId]);

    const fetchTests = async () => {
        setLoading(true);
        try {
            const data = await laboratoryApiService.fetchLabTestsFromBill(finalBillId);
            setTests(data);
            if (data.length === 0) {
                showErrorToast("No tests found for this bill.");
            }
        } catch (error: any) {
            console.error("Error fetching tests:", error);
            showErrorToast(
                error?.response?.data?.error || "Failed to fetch tests"
            );
        } finally {
            setLoading(false);
        }
    };

    // Fetch field details with results for a test
    const fetchFieldsForTest = useCallback(
        async (test: TestItem, forceReload: boolean = false) => {
            if (test.isCulture === 1) {
                const hasCachedCultureResult = Object.prototype.hasOwnProperty.call(
                    cultureResultByTest,
                    test.testRegId
                );
                if (!forceReload && hasCachedCultureResult) return;

                setLoadingFields((prev) => ({ ...prev, [test.testId]: true }));
                try {
                    const cultureResult = await laboratoryApiService.fetchCultureTestResultByTestRegId(
                        test.testRegId
                    );
                    setCultureResultByTest((prev) => ({
                        ...prev,
                        [test.testRegId]: cultureResult || null,
                    }));
                } catch (error) {
                    console.error("Error fetching culture test details:", error);
                    showErrorToast(`Failed to load culture results for ${test.testName}.`);
                } finally {
                    setLoadingFields((prev) => ({ ...prev, [test.testId]: false }));
                }
                return;
            }

            if (!forceReload && fieldDetailsByTest[test.testId]) return;

            setLoadingFields((prev) => ({ ...prev, [test.testId]: true }));
            try {
                const fields = await laboratoryApiService.fetchLabTestFieldDetailsWithResults(
                    test.testRegId
                );
                setFieldDetailsByTest((prev) => ({ ...prev, [test.testId]: fields }));
            } catch (error) {
                console.error("Error fetching test field details:", error);
                showErrorToast(`Failed to load results for ${test.testName}.`);
            } finally {
                setLoadingFields((prev) => ({ ...prev, [test.testId]: false }));
            }
        },
        [cultureResultByTest, fieldDetailsByTest, laboratoryApiService]
    );

    const handleExpandToggle = async (test: TestItem) => {
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

        if (!isExpanded && !fieldDetailsByTest[test.testId]) {
            await fetchFieldsForTest(test);
        }
    };

    const handleEdit = (test: TestItem) => {
        setSelectedTest(test);
        setShowEditPage(true);
    };

    const handleBackFromEdit = () => {
        setShowEditPage(false);
        setSelectedTest(null);
    };

    const handleSaveFromEdit = async () => {
        // Refresh the test list after successful save
        await fetchTests();
        if (selectedTest) {
            // Force refresh edited test result fields so updated values show immediately.
            await fetchFieldsForTest(selectedTest, true);
            setExpandedTests((prev) => new Set(prev).add(selectedTest.testId));
        }
    };

    // If editing a test, show the ResultReEdit component
    if (showEditPage && selectedTest && patientInfo) {
        const patientInfoWithNote = {
            ...patientInfo,
            note: selectedTest.note ?? patientInfo.note,
        };
        return (
            <ResultReEdit
                test={selectedTest}
                patientInfo={patientInfoWithNote}
                onBack={handleBackFromEdit}
                onSave={handleSaveFromEdit}
            />
        );
    }

    return (
        <div
            style={{
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
            }}
        >
            <div
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
                    <Card.Header style={{ flexShrink: 0, backgroundColor: themePrimary, color: themeSecondary }}>
                        <h5 className="mb-0">
                            <FontAwesomeIcon icon={faFlask} className="me-2" />
                            Re-Edit Lab Results - Bill #{finalBillId}
                            {patientInfo && ` - ${patientInfo.name} (${patientInfo.opNumber} / ${patientInfo.age} / ${patientInfo.gender})`}
                        </h5>
                    </Card.Header>
                    <Card.Body style={{ flex: 1, overflowY: "auto", minHeight: 0, padding: "1.5rem" }}>
                        {loading ? (
                            <div className="text-center py-5">
                                <Spinner animation="border" style={{ color: themePrimary }} />
                                <p className="mt-3">Loading tests...</p>
                            </div>
                        ) : tests.length === 0 ? (
                            <Alert variant="warning">
                                <h5>No Tests Available</h5>
                                <p className="mb-0">No tests found for this bill.</p>
                            </Alert>
                        ) : (
                            <>
                                <div className="mb-3">
                                    <SearchInput
                                        searchTerm={searchTerm}
                                        onSearchChange={setSearchTerm}
                                        placeholder="Search tests..."
                                        resultCount={resultCount}
                                        totalCount={totalCount}
                                    />
                                </div>

                                {filteredData.length === 0 ? (
                                    <Alert variant="warning">No tests match your search.</Alert>
                                ) : (
                                    <Accordion alwaysOpen activeKey={Array.from(expandedTests).map(String)}>
                                        {filteredData.map((test, idx) => {
                                            const details = fieldDetailsByTest[test.testId];
                                            const cultureResult = cultureResultByTest[test.testRegId];
                                            const isLoading = loadingFields[test.testId];

                                            return (
                                                <Accordion.Item eventKey={String(test.testId)} key={test.testId} className="mb-2">
                                                    <Accordion.Header onClick={() => handleExpandToggle(test)}>
                                                        <div className="d-flex align-items-center w-100 gap-3">
                                                            <div className="flex-grow-1">
                                                                <div className="d-flex align-items-center gap-2">
                                                                    <strong>{idx + 1}. {test.testName}</strong>
                                                                    <span className="badge" style={{ backgroundColor: themePrimary, color: themeSecondary }}>
                                                                        {test.deptName}
                                                                    </span>
                                                                    {test.isVerified === 1 && (
                                                                        <span className="badge" style={{ backgroundColor: themePrimary, color: themeSecondary }}>
                                                                            Verified
                                                                        </span>
                                                                    )}
                                                                    {test.isCancelled === 1 && (
                                                                        <span className="badge" style={{ backgroundColor: "#dc3545", color: "#fff" }}>
                                                                            Cancelled
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {/* <small className="text-muted">₹{test.rate}</small> */}
                                                            </div>
                                                            <Button
                                                                variant="link"
                                                                size="sm"
                                                                className="theme-btn-link-secondary"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleEdit(test);
                                                                }}
                                                                disabled={test.isCancelled === 1}
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
                                                                Culture result details are not available for this test.
                                                            </Alert>
                                                        )}

                                                        {!isLoading && test.isCulture === 1 && cultureResult && (
                                                            <>
                                                                <div className="mb-3 p-3 rounded bg-light">
                                                                    <div className="row">
                                                                        <div className="col-md-4">
                                                                            <small className="">Culture ID : </small>
                                                                            <span className="fw-bold">{cultureResult.cultureId || "-"}</span>
                                                                        </div>
                                                                        <div className="col-md-4">
                                                                            <small className="">Smear Report : </small>
                                                                            <span className="fw-bold">{cultureResult.smearReport || "-"}</span>
                                                                        </div>
                                                                        <div className="col-md-4">
                                                                            <small className="">Colony Count : </small>
                                                                            <span className="fw-bold">{cultureResult.colonyCount || "-"}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="row mt-2">
                                                                        <div className="col-md-6">
                                                                            <small className="">Organism Isolated : </small>
                                                                            <span className="fw-bold">{cultureResult.organismIsolated || "-"}</span>
                                                                        </div>
                                                                        <div className="col-md-6">
                                                                            <small className="">Blood Culture : </small>
                                                                            <span className="fw-bold">{cultureResult.nonRective || "-"}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <Table bordered hover size="sm" className="mb-3">
                                                                    <thead>
                                                                        <tr>
                                                                            <th style={{ width: "50px" }}>#</th>
                                                                            <th>Antimicrobial</th>
                                                                            <th style={{ width: "160px" }}>Value</th>
                                                                            <th style={{ width: "180px" }}>Result</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {(cultureResult.details || []).length === 0 ? (
                                                                            <tr>
                                                                                <td colSpan={4} className="text-center text-muted">
                                                                                    No culture antibiogram details available.
                                                                                </td>
                                                                            </tr>
                                                                        ) : (
                                                                            cultureResult.details.map((detail, detailIdx) => {
                                                                                const zoneLabel =
                                                                                    detail.zone === "R"
                                                                                        ? "Resistant"
                                                                                        : detail.zone === "S"
                                                                                            ? "Sensitive"
                                                                                            : detail.zone === "M"
                                                                                                ? "Moderate"
                                                                                                : detail.zone || "";

                                                                                return (
                                                                                    <tr key={`${detail.antId}-${detailIdx}`}>
                                                                                        <td className="text-center">{detailIdx + 1}</td>
                                                                                        <td>{detail.antName || ""}</td>
                                                                                        <td>{detail.value ?? ""}</td>
                                                                                        <td>{zoneLabel}</td>
                                                                                    </tr>
                                                                                );
                                                                            })
                                                                        )}
                                                                    </tbody>
                                                                </Table>
                                                            </>
                                                        )}

                                                        {!isLoading && test.isCulture !== 1 && details && details.length > 0 && (
                                                            <>
                                                                <Table bordered hover size="sm" className="mb-3">
                                                                    <thead>
                                                                        <tr>
                                                                            <th style={{ width: "50px" }}>#</th>
                                                                            <th>Field Name</th>
                                                                            <th style={{ width: "150px" }}>Value</th>
                                                                            <th style={{ width: "180px" }}>Reference Range</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {details.map((field, fieldIdx) => {
                                                                            const referenceRange = patientInfo
                                                                                ? getFormattedReference(
                                                                                    field.referenceValues,
                                                                                    patientInfo.age,
                                                                                    patientInfo.gender
                                                                                )
                                                                                : "";

                                                                            return (
                                                                                <tr key={field.fieldId}>
                                                                                    <td className="text-center">{fieldIdx + 1}</td>
                                                                                    <td>{field.fieldName}</td>
                                                                                    <td>
                                                                                        <strong>{field.resultValue || ""}</strong> {field.unit || ""}
                                                                                    </td>
                                                                                    <td>{referenceRange} {field.unit || ""}</td>
                                                                                </tr>
                                                                            );
                                                                        })}
                                                                    </tbody>
                                                                </Table>

                                                                {test.note && (
                                                                    <Form.Group className="mb-3">
                                                                        <Form.Label>
                                                                            <strong>Remarks / Comments : </strong>
                                                                        </Form.Label>
                                                                        <Form.Label className="ms-2">{test.note}</Form.Label>
                                                                    </Form.Group>
                                                                )}
                                                            </>
                                                        )}
                                                    </Accordion.Body>
                                                </Accordion.Item>
                                            );
                                        })}
                                    </Accordion>
                                )}
                            </>
                        )}
                    </Card.Body>

                    {/* Fixed Action Buttons */}
                    <div className="d-flex justify-content-start p-3 border-top bg-white" style={{ flexShrink: 0 }}>
                        <Button
                            onClick={onBack}
                            style={{ backgroundColor: "transparent", color: themePrimary, borderColor: themePrimary }}
                        >
                            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                            Back to Patient List
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default TestList1;
