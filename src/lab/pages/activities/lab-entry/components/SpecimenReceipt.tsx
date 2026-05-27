import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Breadcrumb,
  Card,
  Button,
  Table,
  Form,
  Alert,
  ButtonGroup,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faVial,
  faArrowLeft,
  faSave,
  faFlask,
  faCheckSquare,
  faSquare,
} from "@fortawesome/free-solid-svg-icons";
import {
  showSuccessToast,
  showErrorToast,
  showValidationError,
} from "../../../../../utils/alertUtil";
import SearchInput from "../../../../../components/SearchInput";
import { useTableSearch } from "../../../../../hooks/useTableSearch";
import { LaboratoryApiService } from "../../../../../api/laboratory/laboratory-api-service";
import { RootState } from "../../../../../state/store";
import type { WorkflowComponentProps, BilledTest } from "../types";

interface SpecimenData {
  testId: number;
  specimenReceived: boolean;
  receivedDate: string;
  receivedTime: string;
  remarks: string;
}

const SpecimenReceipt: React.FC<WorkflowComponentProps> = ({ patient, onBack }) => {
  const themePrimary = "var(--page-primary-color)";
  const themeSecondary = "var(--page-secondary-color)";
  const laboratoryApiService = new LaboratoryApiService();
  const loginData = useSelector((state: RootState) => state.loginData);

  const [specimenData, setSpecimenData] = useState<SpecimenData[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTests, setSelectedTests] = useState<Set<number>>(new Set());
  const [apiTestsData, setApiTestsData] = useState<any[]>([]);

  // Search functionality
  const {
    filteredData: filteredTests,
    searchTerm,
    setSearchTerm,
    resultCount,
    totalCount,
  } = useTableSearch({
    data: patient?.tests || [],
    searchFields: ["testName", "deptName"],
  });

  useEffect(() => {
    // Use patient.tests directly which already contains testRegId from the API response
    setApiTestsData(patient.tests);

    // Initialize specimen data for all tests
    const initialData = patient.tests.map((test) => ({
      testId: test.testId,
      specimenReceived: test.specimenReceived || false,
      receivedDate: test.specimenReceived
        ? new Date().toISOString().split("T")[0]
        : "",
      receivedTime: test.specimenReceived
        ? new Date().toTimeString().split(" ")[0].substring(0, 5)
        : "",
      remarks: "",
    }));

    setSpecimenData(initialData);

    // Initialize selected tests with already received specimens
    const alreadyReceived = patient.tests
      .filter((test) => test.specimenReceived)
      .map((test) => test.testId);
    setSelectedTests(new Set(alreadyReceived));
  }, [patient]);

  const handleCheckboxChange = (testId: number, checked: boolean) => {
    setSelectedTests((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(testId);
      } else {
        newSet.delete(testId);
      }
      return newSet;
    });

    setSpecimenData((prev) =>
      prev.map((item) =>
        item.testId === testId
          ? {
              ...item,
              specimenReceived: checked,
              receivedDate: checked
                ? new Date().toISOString().split("T")[0]
                : "",
              receivedTime: checked
                ? new Date().toTimeString().split(" ")[0].substring(0, 5)
                : "",
            }
          : item
      )
    );
  };

  const handleSelectAll = () => {
    const pendingTests = patient!.tests.filter(
      (test) => !test.specimenReceived
    );
    const pendingTestIds = pendingTests.map((test) => test.testId);

    setSelectedTests((prev) => {
      const newSet = new Set(prev);
      pendingTestIds.forEach((id) => newSet.add(id));
      return newSet;
    });

    setSpecimenData((prev) =>
      prev.map((item) => {
        if (pendingTestIds.includes(item.testId)) {
          return {
            ...item,
            specimenReceived: true,
            receivedDate: new Date().toISOString().split("T")[0],
            receivedTime: new Date()
              .toTimeString()
              .split(" ")[0]
              .substring(0, 5),
          };
        }
        return item;
      })
    );
  };

  const handleRemoveAll = () => {
    const pendingTests = patient!.tests.filter(
      (test) => !test.specimenReceived
    );
    const pendingTestIds = pendingTests.map((test) => test.testId);

    setSelectedTests((prev) => {
      const newSet = new Set(prev);
      pendingTestIds.forEach((id) => newSet.delete(id));
      return newSet;
    });

    setSpecimenData((prev) =>
      prev.map((item) => {
        if (pendingTestIds.includes(item.testId)) {
          return {
            ...item,
            specimenReceived: false,
            receivedDate: "",
            receivedTime: "",
          };
        }
        return item;
      })
    );
  };
  const handleRemarksChange = (testId: number, remarks: string) => {
    setSpecimenData((prev) =>
      prev.map((item) => (item.testId === testId ? { ...item, remarks } : item))
    );
  };

  const handleSubmit = async () => {
    // Validation - only for newly selected tests (not already received)
    const newlySelectedTests = specimenData.filter(
      (item) =>
        selectedTests.has(item.testId) &&
        !patient!.tests.find((t) => t.testId === item.testId)?.specimenReceived
    );

    if (newlySelectedTests.length === 0) {
      showValidationError(
        "Please select at least one test to receive specimen."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Format payload as array of {testRegId, userId} objects
      // testRegId is already available from patient.tests which was passed from LabWorkflow
      const payload = newlySelectedTests.map((item) => {
        const patientTest = patient.tests.find((t) => t.testId === item.testId);
        return {
          testRegId: patientTest?.testRegId || 0,
          userId: loginData.id,
        };
      });

      // Call API with array of specimen receipts
      console.log("Submitting specimen receipts:", payload);
      await laboratoryApiService.saveLabSpecimenReceipt(payload);

      showSuccessToast(
        `Specimen receipt saved successfully for ${newlySelectedTests.length} test(s).`,
        "Success"
      );

      // Navigate back to workflow
      setTimeout(() => {
        onBack();
      }, 1000);
    } catch (error) {
      console.error("Error saving specimen receipt:", error);
      showErrorToast("Failed to save specimen receipt. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    onBack();
  };

  return (
    <div
      className="specimen-receipt-page"
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Content Body */}
      <div
        className="content-body"
        style={{
          flex: 1,
          display: "flex",
          padding: "1rem",
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
              <FontAwesomeIcon icon={faVial} className="me-2" />
              Specimen Receipt - {patient.name} ({patient.opNumber} /{" "}
              {patient.age} / {patient.gender})
            </h5>
          </Card.Header>
          <Card.Body
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              padding: "1.5rem",
            }}
          >
            {/* Search and Action Buttons */}
            <div
              className="d-flex justify-content-between align-items-center mb-3"
              style={{ flexShrink: 0, paddingBottom: "1rem" }}
            >
              <SearchInput
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                placeholder="Search tests by name or department"
                resultCount={resultCount}
                totalCount={totalCount}
                showResultCount={true}
              />
              <ButtonGroup className="ms-3">
                <Button
                  size="sm"
                  onClick={handleSelectAll}
                  className="theme-outline-btn-primary"
                  disabled={
                    patient.tests.filter((t) => !t.specimenReceived).length ===
                    0
                  }
                >
                  <FontAwesomeIcon icon={faCheckSquare} className="me-2" />
                  Select All
                </Button>
                <Button
                  size="sm"
                  onClick={handleRemoveAll}
                  className="theme-outline-btn-primary"
                  disabled={selectedTests.size === 0}
                >
                  <FontAwesomeIcon icon={faSquare} className="me-2" />
                  Remove All
                </Button>
              </ButtonGroup>
            </div>

            {/* Scrollable Table */}
            <div style={{ flex: 1, minHeight: 0, overflowY: "auto", paddingRight: "8px" }}>
              <Table bordered hover striped size="sm">
                <thead
                  style={{
                    position: "sticky",
                    top: 0,
                    backgroundColor: "#f8f9fa",
                    zIndex: 10,
                  }}
                >
                  <tr>
                    <th style={{ width: "50px" }}>#</th>
                    <th style={{ width: "80px" }} className="text-center">
                      Select
                    </th>
                    <th>Test Name</th>
                    <th>Specimen</th>
                    <th>Department</th>
                    <th>Bill No</th>
                    <th style={{ width: "120px" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center text-muted">
                        {searchTerm
                          ? "No tests match your search."
                          : "No tests available."}
                      </td>
                    </tr>
                  ) : (
                    filteredTests.map((test, idx) => {
                      const isSelected = selectedTests.has(test.testId);
                      return (
                        <tr
                          key={test.testId}
                          style={{
                            backgroundColor: isSelected
                              ? test.specimenReceived
                                ? "#d4edda"
                                : "#fff3cd"
                              : "transparent",
                          }}
                        >
                          <td className="text-center">{idx + 1}</td>
                          <td className="text-center">
                            <Form.Check
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) =>
                                handleCheckboxChange(
                                  test.testId,
                                  e.target.checked
                                )
                              }
                              disabled={test.specimenReceived}
                              style={{
                                transform: "scale(1.3)",
                                cursor: test.specimenReceived
                                  ? "not-allowed"
                                  : "pointer",
                              }}
                            />
                          </td>
                          <td>
                            <strong>{test.testName}</strong>
                          </td>
                          <td>
                            <small className="text-muted">
                              {test.specimen}
                            </small>
                          </td>
                          <td>
                            <small className="text-muted">
                              {test.deptName}
                            </small>
                          </td>
                          <td>
                            <small className="text-muted">{" "}</small>
                          </td>
                          <td className="text-center">
                            {test.specimenReceived ? (
                              <span
                                className="badge rounded-pill theme-badge-primary"
                              >
                                <i className="fas fa-check-circle me-1"></i>
                                Received
                              </span>
                            ) : isSelected ? (
                              <span
                                className="badge rounded-pill theme-badge-secondary"
                              >
                                <i className="fas fa-clock me-1"></i>
                                To Save
                              </span>
                            ) : (
                              <span
                                className="badge rounded-pill theme-badge-secondary"
                              >
                                <i className="fas fa-hourglass-half me-1"></i>
                                Pending
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </Table>
            </div>

            {/* Fixed Buttons */}
            <div
              className="d-flex justify-content-between p-3 border-top bg-white"
              style={{ flexShrink: 0 }}
            >
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
                disabled={isSubmitting}
                className="theme-btn-primary"
              >
                {isSubmitting ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSave} className="me-2" />
                    Save Specimen Receipt
                  </>
                )}
              </Button>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default SpecimenReceipt;
