import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Card, Button, Form, Table, InputGroup } from "react-bootstrap";
import { Search, Calendar, XCircle, Check } from "react-bootstrap-icons";
import { LaboratoryApiService } from "../../../../api/laboratory/laboratory-api-service";
import { useSelector } from "react-redux";
import { RootState } from "../../../../state/store";
import {
  showSuccessToast,
  showErrorToast,
  showValidationError,
} from "../../../../utils/alertUtil";
import PageHeader from "../../../../components/PageHeader";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import TestList1 from "./component/TestList1";
import ResultReEdit from "./component/ResultReEdit";

interface PatientListItem {
  labBillId: number;
  finalBillId: number;
  name: string;
  age: string;
  sex: string;
  opNo: string;
  phone: string;
  refDr: number;
  patId: number;
  visitId: number;
  placeColl: string;
  entDateTime: string;
  uid: number;
  isCancelled: number;
  total: number;
  disc: number;
  discId: number;
  pay: number;
  paid: number;
  balance: number;
  debitId: number;
  sysIp: string;
  docId: number;
  isIp: number;
  note: string;
}

const SearchPage1: React.FC = () => {
  const themePrimary = "var(--page-primary-color)";
  const themeSecondary = "var(--page-secondary-color)";
  const loginData = useSelector((state: RootState) => state.loginData);
  const laboratoryApiService = new LaboratoryApiService();

  // Refs for focus management
  const entryDateRef = useRef<HTMLInputElement>(null);
  const opNumberRef = useRef<HTMLInputElement>(null);
  const searchButtonRef = useRef<HTMLDivElement>(null);
  const clearButtonRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const [opNumber, setOpNumber] = useState<string>("");
  const [entryDate, setEntryDate] = useState<string>(getCurrentDate());
  const [patientList, setPatientList] = useState<PatientListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showTestList, setShowTestList] = useState<boolean>(false);
  const [selectedBillId, setSelectedBillId] = useState<number | null>(null);
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [patientInfo, setPatientInfo] = useState<any>(null);

  // Focus on entry date when component mounts
  useEffect(() => {
    if (entryDateRef.current) {
      entryDateRef.current.focus();
    }
  }, []);

  // Fetch data on component mount with current date
  useEffect(() => {
    handleSearch();
  }, []);

  // Focus trap implementation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const focusableElements = containerRef.current?.querySelectorAll<HTMLElement>(
        'input:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
      );

      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [patientList]);

  const handleSearch = async () => {
    if (!entryDate.trim()) {
      showValidationError("Please select a date");
      return;
    }

    setLoading(true);
    try {
      // Check if opNumber has a value (!= ""), if yes send the opNo value to API as string
      const opNo = opNumber.trim() !== "" ? opNumber.trim() : "";
      const data = await laboratoryApiService.fetchPatientList(opNo, entryDate);
      setPatientList(data);

      if (data.length === 0) {
        showErrorToast("No records found for the selected criteria");
      } else {
        showSuccessToast(`Found ${data.length} record(s)`);
      }
    } catch (error: any) {
      console.error("Error fetching patient list:", error);
      showErrorToast(
        error?.response?.data?.error || "Failed to fetch patient list"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setOpNumber("");
    setEntryDate(getCurrentDate());
    setPatientList([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleEditResult = (labBillId: number) => {
    // Find patient info for this bill
    const patient = patientList.find((p) => p.labBillId === labBillId);
    if (patient) {
      setPatientInfo({
        name: patient.name,
        opNumber: patient.opNo,
        age: parseFloat(patient.age) || 0,
        gender: patient.sex,
        note: patient.note || "",
        patId: patient.patId,
        visitId: patient.visitId,
      });
      setSelectedBillId(patient.labBillId);
    }
    setShowTestList(true);
  };

  const handleBackToSearch = () => {
    setShowTestList(false);
    setSelectedBillId(null);
    setSelectedTest(null);
    setPatientInfo(null);
    // Refresh the patient list
    handleSearch();
  };

  const handleEditTest = (test: any) => {
    setSelectedTest(test);
  };

  const handleBackToTestList = () => {
    setSelectedTest(null);
  };


  // Show TestList1 if a bill is selected
  if (showTestList && selectedBillId) {
    return (
      <TestList1
        finalBillId={selectedBillId}
        patientInfo={patientInfo}
        onBack={handleBackToSearch}
        onEditTest={handleEditTest}
      />
    );
  }

  return (
    <>
      <PageHeader icon={faSearch} title="Lab Result Re-Edit - Search" subtitle="" />
      <div
        className="content-body"
        ref={containerRef}
        style={{
          display: "flex",
          flex: 1,
          minHeight: 0,
          flexDirection: "column",
          gap: "1rem",
          overflowY: "auto",
        }}
      >
        {/* Search Card */}
        <Card
          className="shadow-sm bg-light"
          style={{
            flexShrink: 0,
            borderRadius: "8px"
          }}
        >
          <Card.Body>
            <Row className="align-items-end">
              {/* OP Number Input */}
              <Col>
                <Form.Group>
                  <Form.Label style={{ fontWeight: "500", fontSize: "14px"}}>
                    OP Number
                  </Form.Label>
                  <Form.Control
                    ref={opNumberRef}
                    type="text"
                    placeholder="Enter OP Number (optional)"
                    value={opNumber}
                    onChange={(e) => setOpNumber(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                  />
                </Form.Group>
              </Col>

              {/* Date Input */}
              <Col>
                <Form.Group>
                  <Form.Label style={{ fontWeight: "500", fontSize: "14px" }}>
                    Entry Date <span className="text-danger">*</span>
                  </Form.Label>
                  <div className="d-flex align-items-center gap-2">
                    <Calendar
                      size={20}
                      style={{ flexShrink: 0 }}
                    />
                    <Form.Control
                      ref={entryDateRef}
                      type="date"
                      value={entryDate}
                      onChange={(e) => setEntryDate(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={loading}
                      required
                    />
                  </div>
                </Form.Group>
              </Col>

              {/* Action Buttons */}
              <Col>
                <div className="d-flex gap-2">
                  <InputGroup.Text
                    onClick={handleSearch}
                    ref={searchButtonRef}
                    title="Submit"
                    className="theme-btn-primary"
                    style={{ cursor: "pointer" }}
                  >
                    <Check size={18} />
                  </InputGroup.Text>
                  <InputGroup.Text
                    onClick={handleClear}
                    ref={clearButtonRef}
                    title="Clear"
                    className="theme-outline-btn-secondary is-selected"
                    style={{ cursor: "pointer" }}
                  >
                    <XCircle size={18} />
                  </InputGroup.Text>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Results Table Card */}
        <Card
          className="shadow-sm"
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            borderRadius: "8px",
            border: `1px solid ${themePrimary}`,
          }}
        >
          <Card.Header
            style={{
              backgroundColor: themePrimary,
              color: themeSecondary,
              borderBottom: `2px solid ${themePrimary}`,
              flexShrink: 0,
            }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0" style={{ fontWeight: "600" }}>
                Patient List
              </h5>
              <span
                className={`badge ${
                  patientList.length > 0
                    ? "theme-badge-primary"
                    : "theme-badge-secondary"
                }`}
                style={{
                  fontSize: "12px",
                  padding: "6px 12px",
                }}
              >
                {patientList.length} Record(s)
              </span>
            </div>
          </Card.Header>

          <Card.Body
            style={{
              flex: 1,
              minHeight: 0,
              padding: 0,
              overflow: "auto",
            }}
          >
            <Table striped bordered hover responsive>
              <thead
                style={{
                  position: "sticky",
                  top: 0,
                  backgroundColor: themeSecondary,
                  color: themePrimary,
                  zIndex: 10,
                }}
              >
                <tr>
                  <th>#</th>
                  <th>OP No</th>
                  <th>Patient Name</th>
                  <th>Age/Sex</th>
                  <th>Phone</th>
                  <th>Entry Date</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {patientList.length === 0 ? (
                  <tr>
                    <td
                      colSpan={11}
                      style={{
                        textAlign: "center",
                        padding: "3rem",
                        color: "#6c757d",
                      }}
                    >
                      {loading ? (
                        <div>
                          <div
                            className="spinner-border mb-2"
                            style={{ color: themePrimary }}
                            role="status"
                          >
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          <p>Loading patient records...</p>
                        </div>
                      ) : (
                        <div>
                          <Search size={48} color="#dee2e6" className="mb-2" />
                          <p>
                            No patient records found.
                            <br />
                            <small>
                              Try searching with different criteria.
                            </small>
                          </p>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  patientList.map((patient, index) => (
                    <tr key={patient.labBillId}>
                      <td>{index + 1}</td>
                      <td>
                        <strong>{patient.opNo}</strong>
                      </td>
                      <td>{patient.name}</td>
                      <td>
                        {patient.age} / {patient.sex}
                      </td>
                      <td>{patient.phone || "-"}</td>
                      <td>
                        {new Date(patient.entDateTime).toLocaleString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        ₹{patient.total.toFixed(2)}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        ₹{patient.paid.toFixed(2)}
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          fontWeight: "600",
                          color: patient.balance > 0 ? "#dc3545" : "#28a745",
                        }}
                      >
                        ₹{patient.balance.toFixed(2)}
                      </td>
                      <td>
                        {patient.isCancelled === 1 ? (
                          <span className="badge" style={{ backgroundColor: "#dc3545", color: "#fff" }}>Cancelled</span>
                        ) : patient.isIp === 1 ? (
                          <span className="badge theme-badge-secondary">IP</span>
                        ) : (
                          <span className="badge theme-badge-primary">OP</span>
                        )}
                      </td>
                      <td>
                        <Button
                          size="sm"
                          disabled={patient.isCancelled === 1}
                          onClick={() => handleEditResult(patient.labBillId)}
                          className="theme-outline-btn-primary"
                        >
                          Edit Results
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </div>
    </>
  );
};

export default SearchPage1;
