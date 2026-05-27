import React, { useEffect, useRef, useState } from "react";
import { Card, Col, Form, InputGroup, Row } from "react-bootstrap";
import { Calendar, Check, Search, XCircle } from "react-bootstrap-icons";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import PageHeader from "../../../../components/PageHeader";
import { showValidationError, showLoading, closeAlert, showErrorToast } from "../../../../utils/alertUtil";
import { LaboratoryApiService } from "../../../../api/laboratory/laboratory-api-service";
import ResultReEditReport from "./components/ResultReEditReport";

const getCurrentDate = () => new Date().toISOString().split("T")[0];

interface FieldEdit {
  valueEditId: number;
  fieldId: number;
  fieldName: string;
  oldValue: string;
  editedValue: string;
}

interface EditedTest {
  resultEditId: number;
  patId: number;
  patientName: string;
  phone: string;
  sex: string;
  opNo: string;
  billNo: string;
  billEntryDate: string;
  visitId: number;
  testRegId: number;
  testId: number;
  testName: string;
  reason: string;
  editType: string;
  editedUid: number;
  editedUserName: string;
  editDateTime: string;
  fieldEdits: FieldEdit[];
}

const ResultReEditSearch: React.FC = () => {
  const [fromDate, setFromDate] = useState<string>(getCurrentDate());
  const [toDate, setToDate] = useState<string>(getCurrentDate());
  const [isEditDate, setIsEditDate] = useState<boolean>(true);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [reportData, setReportData] = useState<EditedTest[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const fromDateRef = useRef<HTMLInputElement>(null);
  const labApi = new LaboratoryApiService();

  useEffect(() => {
    fromDateRef.current?.focus();
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

    try {
      setLoading(true);
      showLoading("Fetching edited tests...");

      let data: EditedTest[];
      if (isEditDate) {
        data = await labApi.fetchLabEditedTests(fromDate, toDate, undefined, undefined);
      } else {
        data = await labApi.fetchLabEditedTests(undefined, undefined, fromDate, toDate);
      }

      closeAlert();
      setReportData(data);
      setHasSearched(true);
    } catch (error: any) {
      closeAlert();
      console.error("Error fetching edited tests:", error);
      const errorMsg = error?.response?.data?.error || "Failed to fetch edited tests";
      showErrorToast(errorMsg);
      setReportData([]);
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
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <>
      <PageHeader icon={faSearch} title="Result Re-Edit Report - Search" subtitle="" />
      <div
        ref={containerRef}
        className="d-flex flex-column flex-grow-1 gap-3"
        style={{
          minHeight: 0,
          overflow: "auto",
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
              <Col md={3}>
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

              <Col md={3}>
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

              <Col md={3}>
                <div className="d-flex gap-2">
                  <InputGroup.Text 
                    onClick={handleSearch} 
                    title="Search"
                    style={{ cursor: "pointer", padding: "8px 12px" }}
                  >
                    <Check size={18} />
                  </InputGroup.Text>
                  <InputGroup.Text 
                    onClick={handleClear} 
                    title="Clear"
                    style={{ cursor: "pointer", padding: "8px 12px" }}
                  >
                    <XCircle size={18} />
                  </InputGroup.Text>
                </div>
              </Col>

              <Col md={3}>
                <Form.Group>
                  <Form.Label style={{ fontWeight: "500", fontSize: "14px" }}>
                    Date Type <span style={{ color: "red" }}>*</span>
                  </Form.Label>
                  <Form.Check
                    type="checkbox"
                    id="editDateToggle"
                    label={isEditDate ? "Edit Date" : "Bill Date"}
                    checked={isEditDate}
                    onChange={(e) => setIsEditDate(e.target.checked)}
                    disabled={loading}
                    style={{ marginTop: "8px" }}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <ResultReEditReport
          hasSearched={hasSearched}
          reportData={reportData}
          isEditDate={isEditDate}
        />
      </div>
    </>
  );
};

export default ResultReEditSearch;
