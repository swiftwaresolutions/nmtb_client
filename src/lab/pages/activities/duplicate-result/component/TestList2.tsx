import React, { useState, useEffect, useMemo } from "react";
import {
    Card,
    Button,
    Form,
    Alert,
    Spinner,
} from "react-bootstrap";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../state/store";
import { LaboratoryApiService } from "../../../../../api/laboratory/laboratory-api-service";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft,
    faPrint,
    faFlask,
} from "@fortawesome/free-solid-svg-icons";
import {
    showSuccessToast,
    showErrorToast,
    showValidationError,
    showConfirmDialog,
} from "../../../../../utils/alertUtil";
import DuplicateResult from "./DuplicateResult";
import DuplicateCultureResult from "./DuplicateCultureResult";

interface TestItem {
    testRegId: number;
    testName: string;
    testCode: string;
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
    note: string;
    isCulture: number;
}

interface TestList2Props {
    finalBillId: number;
    opNo: string;
    onBack: () => void;
    patient: {
        name: string;
        opNumber: string;
        age: number;
        gender: string;
    };
}

const TestList2: React.FC<TestList2Props> = ({ finalBillId, opNo, onBack, patient }) => {
    const themePrimary = "var(--page-primary-color)";
    const themeSecondary = "var(--page-secondary-color)";
    const laboratoryApiService = useMemo(() => new LaboratoryApiService(), []);
    const loginData = useSelector((state: RootState) => state.loginData);

    const [tests, setTests] = useState<TestItem[]>([]);
    const [selectedTests, setSelectedTests] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPrintView, setShowPrintView] = useState(false);

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

    const handleToggleSelect = (testRegId: number, checked: boolean) => {
        setSelectedTests((prev) => {
            const next = new Set(prev);
            if (checked) {
                next.add(testRegId);
            } else {
                next.delete(testRegId);
            }
            return next;
        });
    };

    const handleSelectAll = () => {
        const allTestRegIds = tests.map((t) => t.testRegId);
        setSelectedTests(new Set(allTestRegIds));
    };

    const handleClearAll = () => {
        setSelectedTests(new Set());
    };

    const handlePrint = async () => {
        if (selectedTests.size === 0) {
            showValidationError("Please select at least one test to print.");
            return;
        }

        const selectedTestItems = tests.filter((test) => selectedTests.has(test.testRegId));
        const hasCultureTests = selectedTestItems.some((test) => Number(test.isCulture) === 1);
        const hasRegularTests = selectedTestItems.some((test) => Number(test.isCulture) !== 1);

        if (hasCultureTests && hasRegularTests) {
            showValidationError("Please print culture and non-culture tests separately.");
            return;
        }

        const confirmed = await showConfirmDialog(
            `Print ${selectedTests.size} selected test(s)?`,
            "Confirm Print"
        );

        if (!confirmed.isConfirmed) return;

        setIsSubmitting(true);

        try {
            // Build payload with testRegId and userId for selected tests
            const payload = tests
                .filter((test) => selectedTests.has(test.testRegId))
                .map((test) => ({
                    testRegId: test.testRegId,
                    userId: loginData.id,
                }));

            // Call API to mark tests as printed
            //  await laboratoryApiService.saveResultPrinted(payload);

            showSuccessToast(
                `${selectedTests.size} test result(s) marked for printing successfully.`,
                "Success"
            );

            // Navigate to print view
            setShowPrintView(true);
        } catch (error) {
            console.error("Error printing test results:", error);
            showErrorToast("Failed to print test results. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBackFromPrint = () => {
        setShowPrintView(false);
        setSelectedTests(new Set());
    };

    // Show DuplicateResult if print view is active
    if (showPrintView) {
        const selectedTestItems = tests.filter((test) => selectedTests.has(test.testRegId));
        const isCulturePrint = selectedTestItems.length > 0 && selectedTestItems[0].isCulture === 1;

        if (isCulturePrint) {
            return <DuplicateCultureResult opNo={opNo} tests={selectedTestItems} onBack={handleBackFromPrint} />;
        }

        return <DuplicateResult opNo={opNo} tests={selectedTestItems} onBack={handleBackFromPrint} />;
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
                        <div className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">
                                <FontAwesomeIcon icon={faPrint} className="me-2" />
                                Print Lab Results - {patient.name} ({patient.opNumber} / {patient.age} / {patient.gender})
                            </h5>
                            <div className="d-flex gap-2">
                                <Button
                                    size="sm"
                                    onClick={handleClearAll}
                                    className="theme-outline-btn-primary is-selected"
                                >
                                    Clear All
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleSelectAll}
                                    className="theme-outline-btn-primary is-selected"
                                >
                                    Select All
                                </Button>
                            </div>
                        </div>
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
                                    <span className="badge theme-badge-secondary me-2">
                                        {tests.length} Test(s)
                                    </span>
                                    {selectedTests.size > 0 && (
                                        <span className="badge theme-badge-primary">
                                            {selectedTests.size} Selected
                                        </span>
                                    )}
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                    {tests.map((test) => {
                                        const isSelected = selectedTests.has(test.testRegId);
                                        const isCheckboxDisabled = test.isPrinted === 0;

                                        return (
                                            <Card
                                                key={test.testRegId}
                                                style={{
                                                    cursor: isCheckboxDisabled ? "not-allowed" : "pointer",
                                                    border: "none",
                                                    opacity: isCheckboxDisabled ? 0.7 : 1,
                                                }}
                                                onClick={() => {
                                                    if (isCheckboxDisabled) return;
                                                    handleToggleSelect(test.testRegId, !selectedTests.has(test.testRegId));
                                                }}
                                            >
                                                <Card.Body className="p-3">
                                                    <div className="d-flex align-items-center gap-3">
                                                        <Form.Check
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            disabled={isCheckboxDisabled}
                                                            onChange={(e) => {
                                                                e.stopPropagation();
                                                                handleToggleSelect(test.testRegId, e.target.checked);
                                                            }}
                                                            className="form-check-input"
                                                            style={{ width: "18px", height: "18px", marginTop: "3px" }}
                                                        />
                                                        <div className="flex-grow-1">
                                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                                <FontAwesomeIcon icon={faFlask} style={{ color: themePrimary }} />
                                                                <h6 className="mb-0" style={{ fontWeight: "600" }}>
                                                                    {test.testName}
                                                                </h6>
                                                                <span className="badge theme-badge-primary">
                                                                    {test.deptName}
                                                                </span>
                                                                {test.isPrinted === 1 && <span className="badge theme-badge-primary">Printed</span>}
                                                                {test.isPrinted === 0 && <span className="badge theme-badge-secondary">Not Verified or Printed</span>}
                                                                {test.isCancelled === 1 && <span className="badge" style={{ backgroundColor: "#dc3545", color: "#fff" }}>Cancelled</span>}
                                                            </div>
                                                            <span className="text-muted fs-6">
                                                                Specimen: <strong>{test.specName}</strong> | Rate: <strong>₹{test.rate}</strong>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </Card.Body>

                    {/* Fixed Action Buttons */}
                    <div className="d-flex justify-content-between p-3 border-top bg-white" style={{ flexShrink: 0 }}>
                        <Button
                            onClick={onBack}
                            disabled={isSubmitting}
                            className="theme-outline-btn-primary"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                            Back to Patient List
                        </Button>

                        <Button
                            size="lg"
                            onClick={handlePrint}
                            disabled={isSubmitting || selectedTests.size === 0}
                            className="theme-btn-primary"
                            style={{ minWidth: "220px" }}
                        >
                            {isSubmitting ? (
                                <>
                                    <span
                                        className="spinner-border spinner-border-sm me-2"
                                        role="status"
                                        aria-hidden="true"
                                    ></span>
                                    Printing...
                                </>
                            ) : (
                                <>
                                    <FontAwesomeIcon icon={faPrint} className="me-2" />
                                    Print Selected ({selectedTests.size})
                                </>
                            )}
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default TestList2;
