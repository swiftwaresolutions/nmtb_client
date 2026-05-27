import React, { useEffect, useRef, useState } from "react";
import { Card, Col, Form, InputGroup, Row } from "react-bootstrap";
import { Calendar, Check, XCircle } from "react-bootstrap-icons";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import PageHeader from "../../../../components/PageHeader";
import Register, { RegisterPatient } from "./components/Register";
import { LaboratoryApiService } from "../../../../api/laboratory/laboratory-api-service";
import {
  showErrorToast,
  showSuccessToast,
  showValidationError,
} from "../../../../utils/alertUtil";

const getCurrentDate = () => new Date().toISOString().split("T")[0];

interface LabTestOption {
  id: number;
  name: string;
  blocked: number;
}

const RegisterSearch: React.FC = () => {
  const laboratoryApiService = new LaboratoryApiService();
  const [fromDate, setFromDate] = useState<string>(getCurrentDate());
  const [toDate, setToDate] = useState<string>(getCurrentDate());
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [reportData, setReportData] = useState<RegisterPatient[]>([]);
  const [testOptions, setTestOptions] = useState<LabTestOption[]>([]);
  const [selectedTestId, setSelectedTestId] = useState<number>(0);
  const [loadAllDetails, setLoadAllDetails] = useState<boolean>(false);
  const [testDetailsMap, setTestDetailsMap] = useState<Record<number, any[]>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const fromDateRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fromDateRef.current?.focus();
  }, []);

  useEffect(() => {
    const loadLabTests = async () => {
      try {
        const tests = await laboratoryApiService.fetchAllLabTestAdd();
        const activeTests = (tests || []).filter(
          (test: any) => Number(test?.blocked ?? 1) === 0
        );
        setTestOptions(activeTests);
      } catch (error: any) {
        console.error("Error fetching lab tests:", error);
        showErrorToast(
          error?.response?.data?.error || "Failed to load test names"
        );
      }
    };

    loadLabTests();
  }, []);

  const handleSearch = async () => {
    if (!fromDate || !toDate) {
      showValidationError("Please select both From Date and To Date");
      return;
    }

    if (new Date(fromDate) > new Date(toDate)) {
      showValidationError("From Date cannot be greater than To Date");
      return;
    }

    setLoading(true);
    try {
      const data = await laboratoryApiService.fetchLabTestForRegister(
        fromDate,
        toDate,
        selectedTestId
      );
      setReportData(data);
      setHasSearched(true);

      if (data.length === 0) {
        showErrorToast("No records found for the selected date range");
      } else {
        showSuccessToast(`Found ${data.length} patient record(s)`);
      }
    } catch (error: any) {
      console.error("Error fetching register report:", error);
      showErrorToast(
        error?.response?.data?.error || "Failed to fetch register report"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    const currentDate = getCurrentDate();
    setFromDate(currentDate);
    setToDate(currentDate);
    setHasSearched(false);
    setReportData([]);
    setSelectedTestId(0);
    setLoadAllDetails(false);
    setTestDetailsMap({});
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleLoadAllDetailsChange = async (checked: boolean) => {
    setLoadAllDetails(checked);
    
    if (!checked) {
      setTestDetailsMap({});
      return;
    }

    if (reportData.length === 0) {
      showValidationError("Please search for records first");
      setLoadAllDetails(false);
      return;
    }

    // Collect all testRegIds from reportData
    const allTestRegIds: number[] = [];
    reportData.forEach((patient) => {
      patient.bills?.forEach((bill) => {
        bill.tests?.forEach((test) => {
          if (test.testRegId) {
            allTestRegIds.push(test.testRegId);
          }
        });
      });
    });

    if (allTestRegIds.length === 0) {
      showErrorToast("No test registration IDs found");
      setLoadAllDetails(false);
      return;
    }

    // Fetch details for each testRegId
    setLoading(true);
    try {
      const detailsMap: Record<number, any[]> = {};
      
      for (const testRegId of allTestRegIds) {
        const details = await laboratoryApiService.fetchLabTestFieldDetailsWithResults(testRegId);
        detailsMap[testRegId] = details || [];
      }
      
      setTestDetailsMap(detailsMap);
      showSuccessToast("Test details loaded successfully");
    } catch (error: any) {
      console.error("Error fetching test details:", error);
      showErrorToast(
        error?.response?.data?.error || "Failed to fetch test details"
      );
      setLoadAllDetails(false);
      setTestDetailsMap({});
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader icon={faSearch} title="Lab Register - Search" subtitle="" />
      <div
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
        <Card
          className="shadow-sm"
          style={{
            flexShrink: 0,
            borderRadius: "8px",
            border: "1px solid #e0e0e0",
          }}
        >
          <Card.Body>
            <Row className="align-items-end">
              <Col>
                <Form.Group>
                  <Form.Label style={{ fontWeight: "500", fontSize: "14px" }}>
                    From Date <span style={{ color: "red" }}>*</span>
                  </Form.Label>
                  <div className="d-flex align-items-center gap-2">
                    <Calendar
                      size={20}
                      style={{ color: "#0d6efd", flexShrink: 0 }}
                    />
                    <Form.Control
                      ref={fromDateRef}
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={loading}
                      required
                    />
                  </div>
                </Form.Group>
              </Col>

              <Col>
                <Form.Group>
                  <Form.Label style={{ fontWeight: "500", fontSize: "14px" }}>
                    To Date <span style={{ color: "red" }}>*</span>
                  </Form.Label>
                  <div className="d-flex align-items-center gap-2">
                    <Calendar
                      size={20}
                      style={{ color: "#0d6efd", flexShrink: 0 }}
                    />
                    <Form.Control
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={loading}
                      required
                    />
                  </div>
                </Form.Group>
              </Col>

              <Col>
                <Form.Group>
                  <Form.Label style={{ fontWeight: "500", fontSize: "14px" }}>
                    Test Name
                  </Form.Label>
                  <Form.Select
                    value={selectedTestId}
                    onChange={(e) => setSelectedTestId(Number(e.target.value))}
                    disabled={loading}
                  >
                    <option value={0}>All Tests</option>
                    {testOptions.map((test) => (
                      <option key={test.id} value={test.id}>
                        {test.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col>
                <div className="d-flex gap-2">
                  <InputGroup.Text onClick={handleSearch} title="Search">
                    <Check size={18} />
                  </InputGroup.Text>
                  <InputGroup.Text onClick={handleClear} title="Clear">
                    <XCircle size={18} />
                  </InputGroup.Text>
                </div>
              </Col>

              <Col>
                <Form.Group>
                  <Form.Check
                    id="loadAllDetailsCheckbox"
                    type="checkbox"
                    label="Load All Details"
                    checked={loadAllDetails}
                    onChange={(e) => handleLoadAllDetailsChange(e.target.checked)}
                    disabled={loading}
                    style={{ fontWeight: "500", fontSize: "14px" }}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Register
          hasSearched={hasSearched}
          loading={loading}
          fromDate={fromDate}
          toDate={toDate}
          reportData={reportData}
          loadAllDetails={loadAllDetails}
          testDetailsMap={testDetailsMap}
        />
      </div>
    </>
  );
};

export default RegisterSearch;
