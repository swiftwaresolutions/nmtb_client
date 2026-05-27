import React, { useState, useEffect, useMemo } from "react";
import { Card, Button, Alert } from "react-bootstrap";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPrint,
  faArrowLeft,
  faFlask,
} from "@fortawesome/free-solid-svg-icons";
import {
  showSuccessToast,
  showErrorToast,
} from "../../../../../utils/alertUtil";
import { LaboratoryApiService } from "../../../../../api/laboratory/laboratory-api-service";
import { RootState } from "../../../../../state/store";
import type { WorkflowComponentProps, BilledTest } from "../types";

interface PrintResultsProps extends WorkflowComponentProps {
  onProceedToPrint?: (tests: BilledTest[]) => void;
}

const PrintResults: React.FC<PrintResultsProps> = ({ patient, onBack, onProceedToPrint }) => {
  const themePrimary = "var(--page-primary-color)";
  const themeSecondary = "var(--page-secondary-color)";

  const laboratoryApiService = useMemo(() => new LaboratoryApiService(), []);
  const loginData = useSelector((state: RootState) => state.loginData);
  const [selectedTests, setSelectedTests] = useState<number[]>([]);
  const [isPrinting, setIsPrinting] = useState(false);

  

  useEffect(() => {
    // Filter only verified tests
    const verifiedTests = patient.tests.filter((t) => t.resultVerified);
    if (verifiedTests.length === 0) {
      showErrorToast("No verified tests found.");
      onBack();
      return;
    }

    // Auto-select all verified tests on initial mount only
    setSelectedTests(verifiedTests.map((t) => t.testId));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTestSelection = (testId: number) => {
    setSelectedTests((prev) =>
      prev.includes(testId)
        ? prev.filter((id) => id !== testId)
        : [...prev, testId]
    );
  };

  const handleSelectAll = () => {
    const verifiedTests = patient?.tests.filter((t) => t.resultVerified) || [];
    setSelectedTests(verifiedTests.map((t) => t.testId));
  };

  const handleDeselectAll = () => {
    setSelectedTests([]);
  };

  const handlePrint = async () => {
    if (selectedTests.length === 0) {
      showErrorToast("Please select at least one test to print.");
      return;
    }

    const testsToPrint = patient.tests.filter((t) => selectedTests.includes(t.testId));

    const payload = testsToPrint
      .map((test) =>
        test?.testRegId
          ? { testRegId: test.testRegId, userId: loginData.id }
          : null
      )
      .filter(Boolean) as Array<{ testRegId: number; userId: number }>;

    if (payload.length === 0) {
      showErrorToast("Test identifiers are missing. Please retry.");
      return;
    }

    setIsPrinting(true);

    try {
      await laboratoryApiService.saveResultPrinted(payload);

      showSuccessToast(
        `${selectedTests.length} test result(s) sent to printer.`,
        "Success"
      );

      if (onProceedToPrint) {
        onProceedToPrint(testsToPrint);
      } else {
        setTimeout(() => {
          onBack();
        }, 500);
      }
    } catch (error) {
      console.error("Error printing test results:", error);
      showErrorToast("Failed to print test results. Please try again.");
    } finally {
      setIsPrinting(false);
    }
  };

  const handleBack = () => {
    onBack();
  };

  const verifiedTests = patient.tests.filter((t) => t.resultVerified);

  return (
    <div
      className="print-results-page"
      style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}
    >
      {/* Content Body */}
      <div
        className="content-body"
        style={{ padding: "1rem", flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}
      >
        {/* Print Selection Card */}
        <Card className="shadow-sm" style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          <Card.Header style={{ backgroundColor: themePrimary, color: themeSecondary }}>
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <FontAwesomeIcon icon={faFlask} className="me-2" />
                Select Tests to Print - {patient.name} ({patient.opNumber} / {patient.age} / {patient.gender})
              </h5>
              <div className="d-flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSelectAll}
                  className="theme-outline-btn-secondary is-selected"
                >
                  Select All
                </Button>
                <Button
                  size="sm"
                  onClick={handleDeselectAll}
                  className="theme-outline-btn-secondary is-selected"
                >
                  Deselect All
                </Button>
              </div>
            </div>
          </Card.Header>
          <Card.Body style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, padding: "1.5rem", overflowY: "auto" }}>
            <Alert
              style={{
                backgroundColor: themeSecondary,
                color: themePrimary,
                borderColor: themePrimary,
              }}
            >
              <small>
                <strong>Instructions:</strong> Select the tests you want to
                print. You can print all tests together or individual tests
                separately.
              </small>
            </Alert>

            {verifiedTests.length === 0 ? (
              <Alert variant="warning">
                <h5>No Tests Available</h5>
                <p className="mb-0">
                  No verified test results available for printing.
                </p>
              </Alert>
            ) : (
              <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                {verifiedTests.map((test) => {
                  const isSelected = selectedTests.includes(test.testId);
                  return (
                    <Card
                      key={test.testId}
                      style={{ cursor: "pointer", border: "none" }}
                      onClick={() => handleTestSelection(test.testId)}
                    >
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center mb-2">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTestSelection(test.testId);
                                }}
                                className="form-check-input me-3"
                                style={{ width: "20px", height: "20px" }}
                              />
                              <h5 className="mb-0">
                                <label
                                  style={{
                                    color: "var(--color-text)",
                                  }}
                                >
                                  <strong>{test.testName}</strong>
                                </label>
                                <span className="badge ms-2 theme-badge-secondary">
                                  {test.deptName}
                                </span>
                              </h5>
                            </div>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  );
                })}
              </div>
            )}

            <div className="d-flex justify-content-between mt-4 pt-3 border-top bg-white" style={{ flexShrink: 0 }}>
              <Button
                onClick={handleBack}
                disabled={isPrinting}
                size="sm"
                className="theme-outline-btn-primary"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                Cancel
              </Button>

              <div className="d-flex gap-2">
                <Button
                  size="sm"
                  onClick={handlePrint}
                  disabled={selectedTests.length === 0 || isPrinting}
                  className="theme-btn-primary"
                  style={{
                    minWidth: "180px",
                  }}
                >
                  {isPrinting ? (
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
                      Print Selected ({selectedTests.length})
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default PrintResults;
